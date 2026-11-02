// sw.js — Que Gatheryx abra sin internet desde el icono (gatheryx.rendapps.cl).
//
// Sólo lo registra la web de verdad (lib/serviceWorker.ts): ni la app de PC ni
// la demo de rendapps.cl lo usan.
//
// Qué guarda: la «cáscara» de la app — las páginas, el JavaScript, el CSS, las
// fuentes, los iconos y el lector de QR —, nunca respuestas de la base
// (Supabase está en otro dominio y aquí ni se mira). Los datos para trabajar
// sin señal los guarda la app en IndexedDB (lib/almacenWeb.ts).
//
// Versiones: `scripts/publicar-web.js` escribe la versión aquí abajo, así que
// cada publicación es un sw.js distinto. El navegador lo descubre al abrir la
// app y baja la versión nueva en segundo plano; queda puesta en cuanto termina,
// así que se ve al recargar o en la siguiente apertura (lo que ya está abierto
// sigue con la suya). «Hay una versión nueva → Actualizar» (DescargasWeb.tsx)
// recarga en el acto.
const VERSION = '__VERSION__';
const PREFIJO = 'gatheryx-';
const CACHE = PREFIJO + VERSION;
const BASE = new URL('./', self.location.href);
const INICIO = new URL('./', BASE).href;

/** Lo que no se guarda nunca: se pregunta siempre al servidor. */
const SIEMPRE_RED = /\/(version\.json|archivos\.json|sw\.js)(\?|$)/;
/** Lo que no cambia sin cambiar de nombre (o casi nunca): primero lo guardado. */
const ESTATICO = /\/(_expo\/static|assets)\/|\.(js|css|ttf|otf|woff2?|png|jpg|svg|ico|wasm|webmanifest)(\?|$)|\/manifest\.json$/;

/** Lo que pide la página de inicio: por si no está archivos.json. */
async function delInicio() {
  try {
    const html = await (await fetch(INICIO, { cache: 'reload' })).text();
    return [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^(https?:)?\/\//.test(u));
  } catch {
    return [];
  }
}

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    let lista = [];
    try {
      const r = await fetch(new URL('archivos.json', BASE).href, { cache: 'no-store' });
      if (r.ok) lista = (await r.json()).archivos || [];
    } catch { /* sin lista: lo de la página de inicio */ }
    if (!lista.length) lista = await delInicio();
    const urls = [...new Set(['./', 'manifest.json', ...lista])].map((u) => new URL(u, BASE).href);
    // De a pocos, y sin que un archivo que falla tumbe todo lo demás.
    for (let i = 0; i < urls.length; i += 8) {
      await Promise.all(urls.slice(i, i + 8).map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    }
    // Sin esperar a que se cierren todas las pestañas: si no, recargar seguía
    // mostrando la versión anterior (en el PC casi nunca se cierran todas).
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    // Se queda la copia anterior: una pestaña que ya estaba abierta todavía
    // puede pedir sus archivos (el lector de QR se carga al abrir el escáner).
    // Las más viejas se borran.
    const hora = (n) => Number(n.split('-').pop()) || 0;
    const otras = (await caches.keys()).filter((n) => n.startsWith(PREFIJO) && n !== CACHE).sort((x, y) => hora(y) - hora(x));
    for (const nombre of otras.slice(1)) await caches.delete(nombre);
    await self.clients.claim();
  })());
});

// «Actualizar» en la app: la versión que espera pasa a usarse ya.
self.addEventListener('message', (evento) => {
  if (evento.data && evento.data.tipo === 'activar') self.skipWaiting();
});

async function primeroGuardado(pedido) {
  const cache = await caches.open(CACHE);
  // En la copia de esta versión o en la anterior (ver «activate»).
  const guardado = await caches.match(pedido);
  if (guardado) return guardado;
  const r = await fetch(pedido);
  if (r.ok && r.type === 'basic') cache.put(pedido, r.clone()).catch(() => {});
  return r;
}

async function pagina(pedido) {
  const cache = await caches.open(CACHE);
  // Sin versión escrita (no pasó por publicar-web.js) no habría cómo enterarse
  // de una nueva: primero la red, y lo guardado sólo sin conexión.
  if (VERSION === '__' + 'VERSION__') {
    try {
      const r = await fetch(pedido);
      if (r.ok) cache.put(INICIO, r.clone()).catch(() => {});
      return r;
    } catch { /* abajo, lo guardado */ }
  }
  const guardada = (await cache.match(pedido, { ignoreSearch: true })) || (await cache.match(INICIO));
  if (guardada) return guardada;
  try {
    return await fetch(pedido);
  } catch {
    return new Response('<!doctype html><meta charset="utf-8"><title>Gatheryx</title><body style="background:#0A0E1C;color:#fff;font-family:sans-serif;padding:24px">Sin conexión. Abre Gatheryx una vez con internet para poder usarla sin señal.', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  // Otro dominio (la base, Supabase): ni se toca.
  if (url.origin !== self.location.origin || SIEMPRE_RED.test(url.pathname)) return;
  // El formulario público de registro (public/registro) no es la app: si se
  // respondiera con la página guardada, quien tenga Gatheryx instalada vería la
  // app en vez del formulario. Sin internet no sirve igual.
  if (/^\/registro(\/|$)/.test(url.pathname)) return;

  if (pedido.mode === 'navigate') { evento.respondWith(pagina(pedido)); return; }
  if (ESTATICO.test(url.pathname)) { evento.respondWith(primeroGuardado(pedido)); return; }
  // Lo demás del mismo sitio: la red, y si no hay, lo guardado.
  evento.respondWith(fetch(pedido).catch(async () => (await caches.match(pedido)) || Response.error()));
});
