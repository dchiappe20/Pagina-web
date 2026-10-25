/*
 * demo-supabase.js — La app real, con un Supabase de mentira (RendApps, 24-10-2026).
 *
 * Las demos de rendapps.cl/demo son la MISMA versión web de Leadyx y Gatheryx
 * que se publica en leadyx.rendapps.cl y gatheryx.rendapps.cl. Este archivo se
 * carga antes que la app y:
 *   · intercepta todo lo que va a Supabase (sesión, tablas, funciones, Edge
 *     Functions, archivos y tiempo real) y lo responde desde datos de prueba
 *     que viven en el navegador: nada sale a la base real;
 *   · deja la sesión abierta (sin login) y, antes de entrar, pide elegir con
 *     qué rol mirar la app;
 *   · pone un botón «Cambiar vista» para volver a elegir.
 *
 * Los datos de cada app están en demo-leadyx.js / demo-gatheryx.js, que llaman
 * a RendAppsDemo.iniciar({...}).
 */
(function () {
  'use strict';

  var REF = 'tbvqpsearfgazjnqvrng';
  var CLAVE_SESION = 'sb-' + REF + '-auth-token';
  var fetchReal = window.fetch ? window.fetch.bind(window) : null;

  // ─────────────────────────────────────────────── utilidades
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function b64url(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  }
  function jwt(usuario) {
    var exp = Math.floor(Date.now() / 1000) + 3600 * 24 * 365;
    return b64url({ alg: 'HS256', typ: 'JWT' }) + '.' +
      b64url({ sub: usuario.id, email: usuario.email, role: 'authenticated', aud: 'authenticated', exp: exp }) + '.demo';
  }
  function json(cuerpo, estado, extra) {
    var h = { 'Content-Type': 'application/json; charset=utf-8' };
    if (extra) for (var k in extra) h[k] = extra[k];
    return new Response(cuerpo === undefined ? 'null' : JSON.stringify(cuerpo), { status: estado || 200, headers: h });
  }
  function hoy(dias, hora) {
    var d = new Date();
    d.setDate(d.getDate() + (dias || 0));
    if (hora) { var p = hora.split(':'); d.setHours(+p[0], +p[1] || 0, 0, 0); }
    return d;
  }
  function iso(dias, hora) { return hoy(dias, hora).toISOString(); }
  function dia(dias) {
    var d = hoy(dias);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ─────────────────────────────────────────────── la «base» en memoria
  var DB = {};         // tabla -> filas
  var RPC = {};        // nombre -> function(args, ctx)
  var FUNCIONES = {};  // Edge Functions
  var CTX = null;

  function tabla(nombre) { return DB[nombre] || (DB[nombre] = []); }

  function valorDe(texto) {
    if (texto === 'null') return null;
    if (texto === 'true') return true;
    if (texto === 'false') return false;
    return decodeURIComponent(texto);
  }
  function comparar(a, b) {
    if (a === b) return 0;
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    var na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb) && typeof a !== 'boolean') return na - nb;
    return String(a) < String(b) ? -1 : 1;
  }
  function cumple(fila, col, expr) {
    var neg = false;
    if (expr.indexOf('not.') === 0) { neg = true; expr = expr.slice(4); }
    var p = expr.indexOf('.');
    var op = p < 0 ? 'eq' : expr.slice(0, p);
    var crudo = p < 0 ? expr : expr.slice(p + 1);
    var v = fila[col];
    var r;
    switch (op) {
      case 'eq': r = String(v) === String(valorDe(crudo)) || (v === null && crudo === 'null'); break;
      case 'neq': r = String(v) !== String(valorDe(crudo)); break;
      case 'gt': r = comparar(v, valorDe(crudo)) > 0; break;
      case 'gte': r = comparar(v, valorDe(crudo)) >= 0; break;
      case 'lt': r = comparar(v, valorDe(crudo)) < 0; break;
      case 'lte': r = comparar(v, valorDe(crudo)) <= 0; break;
      case 'is': {
        var w = valorDe(crudo);
        r = w === null ? (v === null || v === undefined) : v === w;
        break;
      }
      case 'in': {
        var lista = decodeURIComponent(crudo).replace(/^\(|\)$/g, '').split(',').map(function (s) { return s.replace(/^"|"$/g, ''); });
        r = lista.indexOf(String(v)) >= 0;
        break;
      }
      case 'like': case 'ilike': {
        var patron = decodeURIComponent(crudo).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/%/g, '.*');
        r = new RegExp('^' + patron + '$', op === 'ilike' ? 'i' : '').test(String(v == null ? '' : v));
        break;
      }
      case 'cs': {
        var quiere = decodeURIComponent(crudo).replace(/^\{|\}$/g, '').split(',');
        r = Array.isArray(v) && quiere.every(function (q) { return v.indexOf(q) >= 0; });
        break;
      }
      default: r = true;
    }
    return neg ? !r : r;
  }
  // or=(a.eq.1,b.is.null) — sin anidar and(...) dentro (lo que usan las apps).
  function cumpleOr(fila, expr) {
    var dentro = decodeURIComponent(expr).replace(/^\(|\)$/g, '');
    var partes = [], prof = 0, actual = '';
    for (var i = 0; i < dentro.length; i++) {
      var c = dentro[i];
      if (c === '(') prof++;
      if (c === ')') prof--;
      if (c === ',' && prof === 0) { partes.push(actual); actual = ''; } else actual += c;
    }
    if (actual) partes.push(actual);
    return partes.some(function (parte) {
      var k = parte.indexOf('.');
      return cumple(fila, parte.slice(0, k), parte.slice(k + 1));
    });
  }

  // select=*, perfiles ( nombre_completo ), equipo:equipos(nombre)
  function incrustados(select) {
    var res = [], prof = 0, actual = '';
    var s = decodeURIComponent(select || '*').replace(/\s+/g, '');
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '(') prof++;
      if (c === ')') prof--;
      if (c === ',' && prof === 0) { res.push(actual); actual = ''; } else actual += c;
    }
    if (actual) res.push(actual);
    return res.filter(function (x) { return x.indexOf('(') > 0; }).map(function (x) {
      var nombre = x.slice(0, x.indexOf('('));
      var alias = nombre;
      if (nombre.indexOf(':') > 0) { alias = nombre.split(':')[0]; nombre = nombre.split(':')[1]; }
      nombre = nombre.split('!')[0];
      return { alias: alias, tabla: nombre };
    });
  }
  function singular(t) { return t.replace(/es$/, '').replace(/s$/, ''); }
  function adjuntar(filas, tablaPadre, select) {
    var emb = incrustados(select);
    if (!emb.length) return filas;
    return filas.map(function (f) {
      var c = Object.assign({}, f);
      emb.forEach(function (e) {
        var otra = tabla(e.tabla);
        var fk = [e.tabla + '_id', singular(e.tabla) + '_id', singular(e.tabla).replace(/e$/, '') + '_id', e.alias + '_id'];
        if (e.tabla === 'perfiles') fk.unshift('perfil_id', 'usuario_id', 'ingresado_por');
        var col = fk.filter(function (k) { return k in f; })[0];
        if (col) {
          c[e.alias] = otra.filter(function (o) { return String(o.id) === String(f[col]); })[0] || null;
        } else {
          var inv = singular(tablaPadre) + '_id';
          c[e.alias] = otra.filter(function (o) { return String(o[inv]) === String(f.id); });
        }
      });
      return c;
    });
  }

  function consultar(nombre, params, filasBase) {
    var filas = (filasBase || tabla(nombre)).slice();
    params.forEach(function (v, k) {
      if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].indexOf(k) >= 0) return;
      if (k === 'or') { filas = filas.filter(function (f) { return cumpleOr(f, v); }); return; }
      if (k === 'and') return;
      filas = filas.filter(function (f) { return cumple(f, k, v); });
    });
    var orden = params.get('order');
    if (orden) {
      var claves = orden.split(',').map(function (o) { var p = o.split('.'); return { col: p[0], desc: p[1] === 'desc' }; });
      filas.sort(function (a, b) {
        for (var i = 0; i < claves.length; i++) {
          var r = comparar(a[claves[i].col], b[claves[i].col]);
          if (r) return claves[i].desc ? -r : r;
        }
        return 0;
      });
    }
    return filas;
  }

  function responderTabla(metodo, nombre, params, cabeceras, cuerpo) {
    var prefer = (cabeceras.get('Prefer') || cabeceras.get('prefer') || '');
    var unObjeto = /vnd\.pgrst\.object/.test(cabeceras.get('Accept') || cabeceras.get('accept') || '');
    if (metodo === 'GET' || metodo === 'HEAD') {
      var todas = consultar(nombre, params);
      var total = todas.length;
      var desde = +(params.get('offset') || 0);
      var lim = params.get('limit') ? +params.get('limit') : null;
      var rango = cabeceras.get('Range');
      if (rango && /^\d+-\d+$/.test(rango)) { var rr = rango.split('-'); desde = +rr[0]; lim = +rr[1] - desde + 1; }
      var filas = todas.slice(desde, lim == null ? undefined : desde + lim);
      filas = adjuntar(filas, nombre, params.get('select'));
      var extra = { 'Content-Range': (filas.length ? desde + '-' + (desde + filas.length - 1) : '*') + '/' + (/count=/.test(prefer) ? total : '*') };
      if (metodo === 'HEAD') return new Response(null, { status: 200, headers: extra });
      if (unObjeto) {
        if (filas.length !== 1) return json({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: 'The result contains ' + filas.length + ' rows' }, 406);
        return json(filas[0], 200, extra);
      }
      return json(filas, 200, extra);
    }
    if (metodo === 'POST') {
      var nuevas = Array.isArray(cuerpo) ? cuerpo : [cuerpo || {}];
      var t = tabla(nombre);
      var hechas = nuevas.map(function (n) {
        var fila = Object.assign({ id: uuid(), created_at: new Date().toISOString() }, n);
        var conflicto = params.get('on_conflict');
        if (/resolution=merge-duplicates/.test(prefer) && conflicto) {
          var cols = conflicto.split(',');
          var ya = t.filter(function (f) { return cols.every(function (c) { return String(f[c]) === String(fila[c]); }); })[0];
          if (ya) { Object.assign(ya, n); return ya; }
        }
        t.push(fila);
        return fila;
      });
      if (CTX && CTX.alEscribir) CTX.alEscribir(nombre, 'insert', hechas);
      if (/return=representation/.test(prefer)) return json(unObjeto ? hechas[0] : hechas, 201);
      return new Response(null, { status: 201 });
    }
    if (metodo === 'PATCH') {
      var cambiadas = consultar(nombre, params);
      cambiadas.forEach(function (f) { Object.assign(f, cuerpo || {}); });
      if (/return=representation/.test(prefer)) return json(unObjeto ? cambiadas[0] || null : cambiadas, 200);
      return new Response(null, { status: 204 });
    }
    if (metodo === 'DELETE') {
      var fuera = consultar(nombre, params);
      DB[nombre] = tabla(nombre).filter(function (f) { return fuera.indexOf(f) < 0; });
      if (/return=representation/.test(prefer)) return json(fuera, 200);
      return new Response(null, { status: 204 });
    }
    return json({ message: 'Demo' }, 200);
  }

  function sesion() {
    var u = CTX.usuario;
    var token = jwt(u);
    return {
      access_token: token,
      refresh_token: 'demo-refresh',
      token_type: 'bearer',
      expires_in: 3600 * 24 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
      user: {
        id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email,
        email_confirmed_at: iso(-30), app_metadata: { provider: 'email' },
        user_metadata: { nombre_completo: u.nombre }, created_at: iso(-60),
      },
    };
  }

  // Un 1×1 gris para imágenes de Storage que la demo no tiene.
  var PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  async function manejar(url, init, req) {
    var u = new URL(url);
    var ruta = u.pathname;
    var metodo = ((init && init.method) || (req && req.method) || 'GET').toUpperCase();
    var cabeceras = new Headers((init && init.headers) || (req && req.headers) || {});
    var cuerpo = null;
    var crudo = init && init.body;
    if (crudo == null && req && metodo !== 'GET' && metodo !== 'HEAD') { try { crudo = await req.clone().text(); } catch (e) { crudo = null; } }
    if (typeof crudo === 'string' && crudo) { try { cuerpo = JSON.parse(crudo); } catch (e) { cuerpo = crudo; } }
    // Un poco de espera, como una red de verdad: así se ven las cargas.
    await new Promise(function (r) { setTimeout(r, 60 + Math.random() * 120); });

    if (ruta.indexOf('/auth/v1/') === 0) {
      if (/\/health$/.test(ruta)) return json({ name: 'GoTrue', version: 'demo' });
      if (/\/token$/.test(ruta)) return json(sesion());
      if (/\/user$/.test(ruta)) return json(sesion().user);
      if (/\/logout$/.test(ruta)) return new Response(null, { status: 204 });
      return json({});
    }
    if (ruta.indexOf('/rest/v1/rpc/') === 0) {
      var nombre = ruta.slice('/rest/v1/rpc/'.length);
      var f = RPC[nombre];
      try {
        var r = f ? await f(cuerpo || {}, CTX) : (CTX.rpcPorDefecto ? CTX.rpcPorDefecto(nombre, cuerpo || {}) : null);
        if (r && r.__error) return json({ code: r.code || 'P0001', message: r.__error, details: null, hint: null }, 400);
        return json(r === undefined ? null : r);
      } catch (e) {
        return json({ code: 'P0001', message: String(e && e.message || e) }, 400);
      }
    }
    if (ruta.indexOf('/rest/v1/') === 0) {
      return responderTabla(metodo, ruta.slice('/rest/v1/'.length), u.searchParams, cabeceras, cuerpo);
    }
    if (ruta.indexOf('/functions/v1/') === 0) {
      var fn = ruta.slice('/functions/v1/'.length);
      var h = FUNCIONES[fn];
      var res = h ? await h(cuerpo || {}, CTX) : { ok: true, mensaje: 'En la demo no se envía nada: así se vería el resultado.' };
      if (res && res.__error) return json({ error: res.__error }, res.estado || 400);
      return json(res);
    }
    if (ruta.indexOf('/storage/v1/') === 0) {
      if (metodo === 'GET' && /\/object\//.test(ruta)) {
        var bin = Uint8Array.from(atob(PNG), function (c) { return c.charCodeAt(0); });
        return new Response(bin, { status: 200, headers: { 'Content-Type': 'image/png' } });
      }
      if (/\/sign\//.test(ruta)) return json({ signedURL: '/storage/v1/object/demo.png', signedUrl: u.origin + '/storage/v1/object/demo.png' });
      return json({ Key: 'demo/' + uuid(), Id: uuid(), path: 'demo/' + uuid() });
    }
    return json({});
  }

  function instalarFetch() {
    window.fetch = function (entrada, init) {
      var url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || String(entrada);
      if (url.indexOf('.supabase.co') < 0 && url.indexOf('/supabase-demo/') < 0) {
        return fetchReal ? fetchReal(entrada, init) : Promise.reject(new Error('sin fetch'));
      }
      return manejar(url, init, typeof entrada === 'string' ? null : entrada);
    };
    // El tiempo real (chats, avisos) se queda «conectando» sin molestar.
    var WS = window.WebSocket;
    if (WS) {
      var Falso = function (url) {
        if (String(url).indexOf('.supabase.co') < 0) return new WS(url);
        var self = this;
        this.readyState = 0;
        this.url = url;
        this.send = function () {};
        this.close = function () { self.readyState = 3; if (self.onclose) self.onclose({ code: 1000 }); };
        this.addEventListener = function () {};
        this.removeEventListener = function () {};
      };
      Falso.CONNECTING = 0; Falso.OPEN = 1; Falso.CLOSING = 2; Falso.CLOSED = 3;
      window.WebSocket = Falso;
    }
  }

  // ─────────────────────────────────────────────── la elección del rol
  function estilo(css) {
    var s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  function pantallaDeRoles(cfg) {
    estilo(
      '#rd-roles{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:20px;' +
      'background:' + cfg.fondo + ';font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f4f4f5;overflow:auto}' +
      '#rd-roles .caja{width:100%;max-width:440px}' +
      '#rd-roles .marca{display:flex;align-items:center;gap:10px;margin-bottom:18px}' +
      '#rd-roles .logo{width:42px;height:42px;border-radius:12px;background:' + cfg.acento + ';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;color:#111}' +
      '#rd-roles h1{font-size:22px;margin:0}#rd-roles .sub{font-size:13px;opacity:.7;margin:2px 0 0}' +
      '#rd-roles .ok{display:flex;gap:8px;align-items:center;font-size:13px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.4);color:#86efac;border-radius:12px;padding:10px 12px;margin-bottom:16px}' +
      '#rd-roles button{display:block;width:100%;text-align:left;margin:0 0 10px;padding:14px 16px;border-radius:14px;cursor:pointer;' +
      'border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;font:inherit;transition:border-color .15s,background .15s}' +
      '#rd-roles button:hover{border-color:' + cfg.acento + ';background:rgba(255,255,255,.09)}' +
      '#rd-roles button b{display:block;font-size:15px}#rd-roles button span{display:block;font-size:12.5px;opacity:.72;margin-top:3px}' +
      '#rd-roles .pie{font-size:11.5px;opacity:.55;margin-top:14px;line-height:1.5}' +
      '#rd-roles a{color:inherit}'
    );
    var div = document.createElement('div');
    div.id = 'rd-roles';
    var html = '<div class="caja"><div class="marca"><div class="logo">' + cfg.inicial + '</div><div><h1>' + cfg.nombre +
      ' · vista previa</h1><p class="sub">Datos de prueba: nada de lo que hagas aquí es real.</p></div></div>' +
      '<div class="ok">✓ Sesión iniciada como usuario de prueba</div>' +
      '<p class="sub" style="margin:0 0 10px;opacity:.85">¿Con qué rol quieres ver la app?</p>';
    cfg.roles.forEach(function (r) {
      html += '<button data-rol="' + r.id + '"><b>Vista previa ' + r.titulo + '</b><span>' + r.detalle + '</span></button>';
    });
    html += '<p class="pie">Es la misma app que usan nuestros clientes, con una empresa ficticia. Puedes cambiar de vista cuando quieras con el botón «Cambiar vista». <a href="/demo/">Volver a las demos</a></p></div>';
    div.innerHTML = html;
    div.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-rol]') : null;
      if (!b) return;
      elegirRol(cfg, b.getAttribute('data-rol'));
    });
    var poner = function () { document.body.appendChild(div); };
    if (document.body) poner(); else document.addEventListener('DOMContentLoaded', poner);
  }

  function limpiarApp(cfg) {
    var guardar = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf('rd_demo_') === 0) guardar[k] = localStorage.getItem(k);
    }
    localStorage.clear();
    for (var g in guardar) localStorage.setItem(g, guardar[g]);
    try { sessionStorage.clear(); } catch (e) { /* nada */ }
  }

  function elegirRol(cfg, rol) {
    limpiarApp(cfg);
    localStorage.setItem('rd_demo_' + cfg.app + '_rol', rol);
    location.href = cfg.base + '/';
  }

  function botonCambiar(cfg, rolActual) {
    estilo(
      '#rd-cambiar{position:fixed;left:12px;bottom:12px;z-index:2147483645;font:600 12px system-ui,-apple-system,"Segoe UI",sans-serif;' +
      'background:rgba(17,17,20,.86);color:#fff;border:1px solid ' + cfg.acento + ';border-radius:999px;padding:7px 12px;cursor:pointer;' +
      'backdrop-filter:blur(6px);box-shadow:0 4px 18px rgba(0,0,0,.35)}#rd-cambiar i{font-style:normal;color:' + cfg.acento + '}'
    );
    var b = document.createElement('button');
    b.id = 'rd-cambiar';
    var r = cfg.roles.filter(function (x) { return x.id === rolActual; })[0];
    b.innerHTML = 'Demo · <i>' + (r ? r.titulo : rolActual) + '</i> · Cambiar vista';
    b.onclick = function () {
      limpiarApp(cfg);
      localStorage.removeItem('rd_demo_' + cfg.app + '_rol');
      location.href = cfg.base + '/';
    };
    var poner = function () { document.body.appendChild(b); };
    if (document.body) poner(); else document.addEventListener('DOMContentLoaded', poner);
  }

  // ─────────────────────────────────────────────── arranque
  window.RendAppsDemo = {
    util: { uuid: uuid, iso: iso, dia: dia, hoy: hoy },
    iniciar: function (cfg) {
      var rol = localStorage.getItem('rd_demo_' + cfg.app + '_rol');
      instalarFetch();
      if (!rol || !cfg.roles.some(function (r) { return r.id === rol; })) {
        // Sin rol todavía: la app espera detrás, sin sesión, hasta que se elija.
        localStorage.removeItem(CLAVE_SESION);
        CTX = { usuario: { id: uuid(), email: 'demo@rendapps.cl', nombre: 'Demo' } };
        pantallaDeRoles(cfg);
        return;
      }
      var datos = cfg.datos(rol, window.RendAppsDemo.util);
      CTX = datos;
      DB = datos.tablas || {};
      RPC = datos.rpc || {};
      FUNCIONES = datos.funciones || {};
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion()));
      if (datos.antes) datos.antes(localStorage);
      botonCambiar(cfg, rol);
    },
  };
})();
