/* ============================================================
   Chat de RendApps — el asistente del sitio.

   Habla con la Edge Function `chat-ventas` (proyecto Themein), que
   contesta con Claude y, si la persona deja sus datos, crea el lead
   que el equipo ve en Themein → Leads.

   QUÉ GUARDA EL NAVEGADOR
   Sólo el id de la conversación y lo que se ve en pantalla, en
   sessionStorage: sobrevive a cambiar de página dentro del sitio y
   se borra al cerrar la pestaña. La historia que importa la guarda el
   servidor; lo de aquí es para volver a pintarla.

   SEGURIDAD
   Todo lo que llega se pinta como texto (textContent): un mensaje
   nunca puede inyectar HTML. Los enlaces se arman a mano y sólo
   http(s) y mailto.
   ============================================================ */
(function () {
  'use strict';

  var script = document.currentScript;
  var URL_CHAT = script && script.getAttribute('data-url');
  if (!URL_CHAT || window.__rchatMontado) return;
  window.__rchatMontado = true;

  var CLAVE = 'rendapps-chat-v1';
  var CLAVE_UTM = 'rendapps-chat-utm';
  var CLAVE_INVITACION = 'rendapps-chat-invitado';
  var TOPE = 800;
  var ESPERA_MS = 60000;

  var SALUDO = '¡Hola! Soy el asistente de RendApps. Te cuento de la Filtradora de licitaciones, de Gatheryx para eventos, ' +
    'de Leadyx para ferias, de los planes y de los desarrollos a medida. ¿En qué te ayudo?';
  var SUGERENCIAS = ['Ver planes y precios', 'Quiero una demo', 'Necesito un desarrollo a medida', 'Ya soy cliente y necesito ayuda'];
  var SIN_CONEXION = 'No pude conectarme. Revisa tu conexión e inténtalo de nuevo.';
  var FALLO = 'Ahora mismo no puedo responder. Escríbenos a contacto@rendapps.cl y te respondemos dentro del día hábil.';

  /* ── Estado ─────────────────────────────────────────────── */
  function leer(clave) {
    try { return JSON.parse(sessionStorage.getItem(clave) || 'null'); } catch (e) { return null; }
  }
  function escribir(clave, valor) {
    try { sessionStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* modo privado: se vive sin guardar */ }
  }

  var estado = leer(CLAVE) || {};
  estado = {
    id: typeof estado.id === 'string' ? estado.id : null,
    mensajes: Array.isArray(estado.mensajes) ? estado.mensajes.slice(-80) : [],
    abierto: !!estado.abierto,
    cerrada: !!estado.cerrada,
    sinLeer: !!estado.sinLeer,
    lead: !!estado.lead
  };
  function guardar() { escribir(CLAVE, estado); }

  // De dónde viene la persona (utm_*): se toma la primera vez y se conserva
  // mientras navega, aunque las páginas siguientes ya no lo traigan.
  (function recordarUtm() {
    if (leer(CLAVE_UTM)) return;
    var p = new URLSearchParams(location.search);
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
      var v = p.get(k);
      if (v) utm[k] = v.slice(0, 100);
    });
    if (Object.keys(utm).length) escribir(CLAVE_UTM, utm);
  })();

  /* ── Íconos ─────────────────────────────────────────────── */
  var NS = 'http://www.w3.org/2000/svg';
  function icono(d, clase, extra) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', extra || '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    if (clase) svg.setAttribute('class', clase);
    d.split('|').forEach(function (trazo) {
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', trazo);
      svg.appendChild(path);
    });
    return svg;
  }
  var I_CHAT = 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.9A8 8 0 1 1 21 12z|M8.5 12h.01|M12 12h.01|M15.5 12h.01';
  var I_CERRAR = 'M18 6 6 18|M6 6l12 12';
  var I_ENVIAR = 'M5 12h14|M13 6l6 6-6 6';
  var I_NUEVO = 'M3 12a9 9 0 1 0 3-6.7|M3 4v5h5';
  var I_OK = 'M20 6 9 17l-5-5';

  function logo() {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    [['M20 42 L32 30 L44 42', '#fff'], ['M25 29 L32 22 L39 29', '#FDBA74']].forEach(function (t) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', t[0]);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', t[1]);
      p.setAttribute('stroke-width', '7');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(p);
    });
    return svg;
  }

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'texto') n.textContent = attrs[k];
      else if (k === 'clase') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) n.appendChild(h); });
    return n;
  }

  /* ── El DOM ─────────────────────────────────────────────── */
  var raiz = el('div', { clase: 'rchat' });

  var lanzador = el('button', {
    type: 'button', clase: 'rchat-lanzador', 'aria-label': 'Abrir el chat de RendApps',
    'aria-expanded': 'false', 'aria-controls': 'rchat-panel'
  }, [icono(I_CHAT, 'rchat-ico-chat', '1.9'), icono(I_CERRAR, 'rchat-ico-cerrar', '2.2'), el('span', { clase: 'rchat-punto' })]);

  var cerrarInvitacion = el('button', { type: 'button', 'aria-label': 'Cerrar la invitación', texto: '×' });
  var invitacion = el('div', { clase: 'rchat-burbuja', hidden: '' }, [
    document.createTextNode('¿Dudas sobre los planes o un proyecto? Escríbeme 👋'), cerrarInvitacion
  ]);

  var botonNuevo = el('button', { type: 'button', clase: 'rchat-icono', 'aria-label': 'Empezar una conversación nueva', title: 'Empezar de nuevo' }, [icono(I_NUEVO)]);
  var botonCerrar = el('button', { type: 'button', clase: 'rchat-icono', 'aria-label': 'Cerrar el chat', title: 'Cerrar' }, [icono(I_CERRAR)]);

  var lista = el('div', { clase: 'rchat-mensajes', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversación' });
  var entrada = el('textarea', { rows: '1', maxlength: String(TOPE), placeholder: 'Escribe tu mensaje…', 'aria-label': 'Tu mensaje' });
  var enviarBtn = el('button', { type: 'submit', clase: 'rchat-enviar', 'aria-label': 'Enviar' }, [icono(I_ENVIAR, null, '2.2')]);
  var formulario = el('form', { clase: 'rchat-form' }, [entrada, enviarBtn]);
  var contador = el('div', { clase: 'rchat-contador', hidden: '' });
  var nuevaBtn = el('button', { type: 'button', clase: 'rchat-chip', texto: 'Empezar una conversación nueva' });
  var fin = el('div', { clase: 'rchat-fin', hidden: '' }, [nuevaBtn]);

  var panel = el('section', { clase: 'rchat-panel', id: 'rchat-panel', role: 'dialog', 'aria-label': 'Chat con el asistente de RendApps', hidden: '' }, [
    el('header', { clase: 'rchat-cabecera' }, [
      el('div', { clase: 'rchat-avatar' }, [logo()]),
      el('div', { clase: 'rchat-titulo' }, [
        el('strong', { texto: 'Asistente RendApps' }),
        el('span', { texto: 'En línea · responde al instante' })
      ]),
      botonNuevo,
      botonCerrar
    ]),
    lista,
    formulario,
    contador,
    fin,
    el('p', { clase: 'rchat-legal', texto: 'Si dejas tus datos, los usamos sólo para contactarte. Puedes escribirnos también a contacto@rendapps.cl.' })
  ]);

  raiz.appendChild(panel);
  raiz.appendChild(invitacion);
  raiz.appendChild(lanzador);
  document.body.appendChild(raiz);

  /* ── Pintar ─────────────────────────────────────────────── */

  // Texto con enlaces: URLs http(s), direcciones del sitio sin protocolo y
  // correos. Todo lo demás, texto plano con sus saltos de línea.
  var ENLACE = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)»])|((?:www\.)?rendapps\.cl\/[^\s<>"']*[^\s<>"'.,;:!?)»])|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

  function pintarTexto(nodo, texto) {
    String(texto).split('\n').forEach(function (linea, i) {
      if (i > 0) nodo.appendChild(document.createElement('br'));
      var ultimo = 0;
      linea.replace(ENLACE, function (m, url, sitio, correo, pos) {
        if (pos > ultimo) nodo.appendChild(document.createTextNode(linea.slice(ultimo, pos)));
        var a = document.createElement('a');
        if (correo) {
          a.href = 'mailto:' + correo;
        } else {
          var destino = url || ('https://' + (sitio.indexOf('www.') === 0 ? sitio : 'www.' + sitio));
          a.href = destino;
          var propio = /^https?:\/\/(www\.)?rendapps\.cl(\/|$)/i.test(destino);
          if (!propio) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        }
        a.textContent = m;
        nodo.appendChild(a);
        ultimo = pos + m.length;
        return m;
      });
      if (ultimo < linea.length) nodo.appendChild(document.createTextNode(linea.slice(ultimo)));
    });
  }

  function burbuja(m) {
    if (m.de === 'registro') {
      return el('div', { clase: 'rchat-registro' }, [icono(I_OK, null, '2.4'), document.createTextNode('Tus datos quedaron registrados')]);
    }
    var b = el('div', { clase: 'rchat-msj ' + (m.de === 'yo' ? 'rchat-msj-yo' : 'rchat-msj-bot') });
    pintarTexto(b, m.texto);
    return b;
  }

  var sugerencias = null;
  var escribiendo = null;

  function pintarTodo() {
    lista.textContent = '';
    lista.appendChild(burbuja({ de: 'bot', texto: SALUDO }));
    if (estado.mensajes.length === 0) {
      sugerencias = el('div', { clase: 'rchat-sugerencias' }, SUGERENCIAS.map(function (s) {
        var c = el('button', { type: 'button', clase: 'rchat-chip', texto: s });
        c.addEventListener('click', function () { enviar(s); });
        return c;
      }));
      lista.appendChild(sugerencias);
    } else {
      sugerencias = null;
    }
    estado.mensajes.forEach(function (m) { lista.appendChild(burbuja(m)); });
    fin.hidden = !estado.cerrada;
    formulario.hidden = estado.cerrada;
    bajar();
  }

  function agregar(m) {
    estado.mensajes.push(m);
    if (estado.mensajes.length > 80) estado.mensajes = estado.mensajes.slice(-80);
    if (sugerencias) { sugerencias.remove(); sugerencias = null; }
    lista.appendChild(burbuja(m));
    guardar();
    bajar();
  }

  function bajar() {
    requestAnimationFrame(function () { lista.scrollTop = lista.scrollHeight; });
  }

  function mostrarEscribiendo(si) {
    if (si && !escribiendo) {
      escribiendo = el('div', { clase: 'rchat-escribiendo', 'aria-label': 'El asistente está escribiendo' },
        [el('i'), el('i'), el('i')]);
      lista.appendChild(escribiendo);
      bajar();
    } else if (!si && escribiendo) {
      escribiendo.remove();
      escribiendo = null;
    }
  }

  function reintento(texto) {
    var c = el('button', { type: 'button', clase: 'rchat-chip', texto: 'Reintentar' });
    var cont = el('div', { clase: 'rchat-sugerencias' }, [c]);
    c.addEventListener('click', function () { cont.remove(); enviar(texto, true); });
    lista.appendChild(cont);
    bajar();
  }

  /* ── Abrir y cerrar ─────────────────────────────────────── */
  var estrecho = window.matchMedia('(max-width: 520px)');

  function abrir(enfocar) {
    estado.abierto = true;
    estado.sinLeer = false;
    raiz.classList.add('rchat-abierto');
    raiz.classList.remove('rchat-sin-leer');
    panel.hidden = false;
    invitacion.hidden = true;
    escribir(CLAVE_INVITACION, true);
    lanzador.setAttribute('aria-expanded', 'true');
    lanzador.setAttribute('aria-label', 'Cerrar el chat de RendApps');
    if (estrecho.matches) document.documentElement.classList.add('rchat-bloqueo');
    guardar();
    bajar();
    if (enfocar !== false && !estado.cerrada) setTimeout(function () { entrada.focus(); }, 50);
  }

  function cerrar() {
    estado.abierto = false;
    raiz.classList.remove('rchat-abierto');
    panel.hidden = true;
    lanzador.setAttribute('aria-expanded', 'false');
    lanzador.setAttribute('aria-label', 'Abrir el chat de RendApps');
    document.documentElement.classList.remove('rchat-bloqueo');
    guardar();
  }

  lanzador.addEventListener('click', function () { estado.abierto ? cerrar() : abrir(); });
  botonCerrar.addEventListener('click', function () { cerrar(); lanzador.focus(); });
  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { cerrar(); lanzador.focus(); }
  });

  function empezarDeNuevo() {
    estado.id = null;
    estado.mensajes = [];
    estado.cerrada = false;
    estado.lead = false;
    guardar();
    pintarTodo();
    entrada.focus();
  }
  botonNuevo.addEventListener('click', empezarDeNuevo);
  nuevaBtn.addEventListener('click', empezarDeNuevo);

  // La invitación: una vez por visita, a los 15 segundos, y sólo en pantallas
  // anchas (en el teléfono taparía el contenido).
  invitacion.addEventListener('click', function (e) {
    if (e.target === cerrarInvitacion) return;
    abrir();
  });
  cerrarInvitacion.addEventListener('click', function (e) {
    e.stopPropagation();
    invitacion.hidden = true;
    escribir(CLAVE_INVITACION, true);
  });
  if (!leer(CLAVE_INVITACION) && !estado.abierto && estado.mensajes.length === 0) {
    setTimeout(function () {
      if (!estado.abierto && !estrecho.matches && !leer(CLAVE_INVITACION)) invitacion.hidden = false;
    }, 15000);
  }

  /* ── Escribir ───────────────────────────────────────────── */
  function ajustarAlto() {
    entrada.style.height = 'auto';
    // +2: el borde. Sin él, la caja queda un pelo más baja que su texto y
    // aparece una barra de desplazamiento que no hace falta.
    var alto = entrada.scrollHeight + 2;
    entrada.style.height = Math.min(alto, 120) + 'px';
    entrada.style.overflowY = alto > 120 ? 'auto' : 'hidden';
    var n = entrada.value.length;
    contador.hidden = n < TOPE - 150;
    contador.textContent = n + ' / ' + TOPE;
  }
  entrada.addEventListener('input', ajustarAlto);
  entrada.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      formulario.requestSubmit ? formulario.requestSubmit() : enviarDesdeCaja();
    }
  });
  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    enviarDesdeCaja();
  });
  function enviarDesdeCaja() {
    var t = entrada.value.trim();
    if (!t) return;
    entrada.value = '';
    ajustarAlto();
    enviar(t);
  }

  /* ── Hablar con el servidor ─────────────────────────────── */
  var ocupado = false;

  function sinParametros(url) {
    try {
      var u = new URL(url);
      return (u.origin + u.pathname).slice(0, 500);
    } catch (e) {
      return '';
    }
  }

  function enviar(texto, esReintento) {
    texto = String(texto || '').trim().slice(0, TOPE);
    if (!texto || ocupado || estado.cerrada) return;
    ocupado = true;
    enviarBtn.disabled = true;
    if (!esReintento) agregar({ de: 'yo', texto: texto });
    mostrarEscribiendo(true);

    var control = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var reloj = setTimeout(function () { if (control) control.abort(); }, ESPERA_MS);

    fetch(URL_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversacion_id: estado.id,
        mensaje: texto,
        // Sólo la ruta, sin parámetros: algunas páginas llevan un token en la
        // dirección (crear-cuenta) y no tiene por qué viajar ni guardarse.
        pagina: sinParametros(location.href),
        referente: sinParametros(document.referrer),
        utm: leer(CLAVE_UTM)
      }),
      signal: control ? control.signal : undefined
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (c) { return { status: r.status, c: c || {} }; });
      })
      .then(function (res) {
        var c = res.c;
        if (c.reiniciar) estado.id = null;
        else if (typeof c.conversacion_id === 'string') estado.id = c.conversacion_id;
        if (c.lead_registrado && !estado.lead) {
          estado.lead = true;
          agregar({ de: 'registro' });
        }
        agregar({ de: 'bot', texto: c.respuesta || FALLO });
        if (c.cerrada) {
          estado.cerrada = true;
          fin.hidden = false;
          formulario.hidden = true;
        }
        if (!estado.abierto) {
          estado.sinLeer = true;
          raiz.classList.add('rchat-sin-leer');
        }
        // Un mensaje rechazado por largo: vuelve a la caja para recortarlo.
        if (res.status === 400 && !entrada.value) {
          entrada.value = texto;
          ajustarAlto();
        }
      })
      .catch(function () {
        agregar({ de: 'bot', texto: SIN_CONEXION });
        reintento(texto);
      })
      .then(function () {
        clearTimeout(reloj);
        ocupado = false;
        enviarBtn.disabled = false;
        mostrarEscribiendo(false);
        guardar();
      });
  }

  /* ── Arranque ───────────────────────────────────────────── */
  pintarTodo();
  if (estado.sinLeer) raiz.classList.add('rchat-sin-leer');
  // Si venía conversando, el panel sigue abierto al cambiar de página. En el
  // teléfono no: ocupa la pantalla entera y taparía la página que pidió ver.
  if (estado.abierto && !estrecho.matches) abrir(false);
  else estado.abierto = false;
})();
