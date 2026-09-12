const express = require('express');
const path = require('path');
const https = require('https');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Evita que el navegador guarde en caché HTML, CSS y JS durante el desarrollo
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { etag: false, lastModified: false }));
app.use(express.urlencoded({ extended: true }));

// ================================
// Datos del sitio
// ================================
const servicios = [
  {
    id: 'apps-moviles',
    nombre: 'Apps móviles',
    icono: 'movil',
    desc: 'Desarrollamos aplicaciones nativas e híbridas para iOS y Android, con foco en experiencia y rendimiento.',
    puntos: ['iOS y Android desde un solo código', 'Publicación en las tiendas incluida', 'Diseño centrado en el usuario']
  },
  {
    id: 'software-a-medida',
    nombre: 'Desarrollo de software',
    icono: 'codigo',
    desc: 'Creamos software a medida escalable, seguro y adaptado a las necesidades de tu negocio.',
    puntos: ['Aplicaciones de escritorio y sistemas internos', 'Automatización de procesos manuales', 'Código documentado y de tu propiedad']
  },
  {
    id: 'integraciones',
    nombre: 'Integraciones',
    icono: 'integracion',
    desc: 'Conectamos tus sistemas y automatizamos flujos para que tu operación sea más eficiente.',
    puntos: ['APIs públicas y privadas (ej. Mercado Público)', 'Sincronización entre plataformas', 'Reportes y alertas automáticas']
  },
  {
    id: 'desarrollo-web',
    nombre: 'Desarrollo web',
    icono: 'web',
    desc: 'Diseñamos y desarrollamos sitios y plataformas web modernas, rápidas y optimizadas.',
    puntos: ['Sitios corporativos y plataformas', 'Rápidos y optimizados para buscadores', 'Administrables por tu equipo']
  },
  {
    id: 'consultoria',
    nombre: 'Consultoría tecnológica',
    icono: 'consultoria',
    desc: 'Te ayudamos a definir la mejor estrategia tecnológica para alcanzar tus objetivos.',
    puntos: ['Diagnóstico de procesos y sistemas', 'Propuesta con alcance, plazos y costos', 'Acompañamiento en la implementación']
  },
  {
    id: 'mantencion',
    nombre: 'Mantención y soporte',
    icono: 'mantencion',
    desc: 'Acompañamiento continuo tras la entrega: monitoreo, actualizaciones y mejoras.',
    puntos: ['Corrección de errores garantizada', 'Actualizaciones y nuevas funciones', 'Soporte remoto en horario hábil']
  }
];

const proyectos = [
  {
    id: 'filtro-licitaciones',
    nombre: 'Filtro de Licitaciones',
    tipo: 'Software de escritorio',
    mockup: 'proyecto-ventana',
    desc: 'Aplicación de escritorio que filtra y clasifica licitaciones de Mercado Público en tiempo real, integrada con su API oficial.',
    cliente: 'Producto RendApps',
    url: '/proyectos/filtro-licitaciones',
    estado: null
  },
  {
    id: 'gatheryx',
    nombre: 'Gatheryx',
    tipo: 'App móvil y de escritorio · SaaS',
    mockup: 'proyecto-gatheryx',
    desc: 'Control de accesos para eventos: registro de asistentes, acreditación por QR y métricas en vivo, incluso sin conexión.',
    cliente: 'Producto RendApps',
    url: '/proyectos/gatheryx',
    estado: 'En desarrollo'
  },
  {
    id: 'leadyx',
    nombre: 'Leadyx',
    tipo: 'App móvil y de escritorio · SaaS',
    mockup: 'proyecto-leadyx',
    desc: 'Captura de leads en ferias: el vendedor dicta el contacto en voz alta, la IA reparte los campos y el correo de agradecimiento sale solo.',
    cliente: 'Producto RendApps',
    url: '/proyectos/leadyx',
    estado: 'En desarrollo'
  }
];

// ================================
// Planes de suscripción
//
// El precio va en UF porque los planes están creados en UF dentro de Flow y
// es Flow quien convierte a pesos en cada cobro. La web NO muestra el
// equivalente en pesos: cambiaba con la UF de cada día y con el de la fecha
// del cargo, así que anunciaba una cifra que casi nunca era la cobrada.
//
// El catálogo vive en el registro central (`core.planes`) y se lee al arrancar
// con `core.planes_publicos()`. Antes estaba escrito aquí a mano y había que
// mantenerlo en paralelo con lo que realmente se cobra: la web decía una cosa
// y Flow hacía otra en cuanto se cambiaba un precio en un solo lado.
//
// El respaldo de abajo se usa sólo si la base no responde al arrancar, para
// que /planes nunca salga vacía. Es una copia del catálogo, no la fuente.
// ================================

// Identidad visual de cada producto. Son los mismos colores de las apps.
const APPS = {
  filt: {
    nombre: 'Filtradora de licitaciones',
    sub: 'Mercado Público y Compra Ágil, revisados todos los días',
    color: '#D81B60',
    icono: 'documento',
    url: '/proyectos/filtro-licitaciones'
  },
  gatheryx: {
    nombre: 'Gatheryx',
    sub: 'Control de accesos y acreditación para eventos',
    color: '#6D48F0',
    icono: 'movil',
    url: '/proyectos/gatheryx'
  },
  leads: {
    nombre: 'Leadyx',
    sub: 'Captura de contactos en ferias y terreno',
    color: '#00806A',
    icono: 'chat',
    url: '/proyectos/leadyx'
  }
};

const ORDEN_APPS = ['filt', 'gatheryx', 'leads'];

// En qué orden se ponen los niveles dentro de una pestaña y cuál lleva la
// etiqueta. Es una decisión de escaparate y por eso vive aquí y no en la base:
// `core.planes.orden` manda para cobrar y para los límites, y ahí Holding iba
// antes que Oficina, lo que dejaba al plan más caro en el centro y recomendado.
// Lo que queremos destacar es el del medio: Oficina.
// Un plan que no esté nombrado aquí se pone al final, en el orden de la base.
const ESCAPARATE = {
  filt:     { orden: ['terreno', 'oficina', 'holding'],       recomendado: 'oficina' },
  gatheryx: { orden: ['por_evento', 'anual', 'productora'],   recomendado: 'anual' },
  leads:    { orden: ['feria', 'comercial', 'equipo'],        recomendado: 'comercial' }
};

const PLANES_RESPALDO = [
  // La descripción es una etiqueta, no un retrato del cliente: describir a
  // quién le sirve cada nivel hacía que quien se reconocía en la frase
  // equivocada eligiera el plan equivocado. La de Productora se conserva
  // porque dice qué PERMITE el plan, no a quién se parece quien lo compra.
  { app: 'filt', plan: 'terreno', nombre: 'Terreno', precio_uf: 3,
    descripcion: 'Plan básico' },
  { app: 'filt', plan: 'oficina', nombre: 'Oficina', precio_uf: 5,
    descripcion: 'Plan moderado' },
  { app: 'filt', plan: 'holding', nombre: 'Holding', precio_uf: 9,
    descripcion: 'Plan premium' },
  { app: 'gatheryx', plan: 'por_evento', nombre: 'Por evento', precio_uf: 2,
    descripcion: 'Plan prepago', periodo: 'evento', contratable: false },
  { app: 'gatheryx', plan: 'anual', nombre: 'Anual', precio_uf: 1,
    descripcion: 'Plan mensual' },
  { app: 'gatheryx', plan: 'productora', nombre: 'Productora', precio_uf: 3,
    descripcion: 'Quien organiza eventos para terceros.' },
  { app: 'leads', plan: 'feria', nombre: 'Feria', precio_uf: 1,
    descripcion: 'Plan básico' },
  { app: 'leads', plan: 'comercial', nombre: 'Comercial', precio_uf: 2,
    descripcion: 'Plan moderado' },
  { app: 'leads', plan: 'equipo', nombre: 'Equipo', precio_uf: 4,
    descripcion: 'Plan premium' }
];

// Qué incluye cada nivel, en palabras del cliente. Los topes numéricos vienen
// de `limites` en la base; esto es lo que no se puede deducir de un número.
const DESTACADOS = {
  // Las revisiones al día ya no se listan: desde el 28-08-2026 todos los planes
  // tienen las mismas (una completa de madrugada y un repaso al mediodía), así
  // que nombrarlas no distingue nada y sólo invita a comparar lo que es igual.
  // Lo que separa a Oficina de Terreno es, entre otras, el módulo de clientes.
  'filt:terreno': ['2 computadores', '15 reglas de filtro',
                   'Actualización nocturna de licitaciones', 'Exportaciones a Excel'],
  'filt:oficina': ['6 computadores', 'Módulo de clientes favoritos',
                   'Vigilancia de foros de aclaración', 'Reglas de filtro ilimitadas',
                   'Nuevas cotizaciones en tiempo real'],
  'filt:holding': ['Computadores ilimitados', 'Varias razones sociales en un panel',
                   'Te dejamos las conexiones configuradas', 'Soporte las 24 horas hábiles',
                   'Todo lo del plan Oficina'],
  'gatheryx:por_evento': ['1 evento', 'Hasta 300 registrados', '60 días de acceso',
                          'Acreditación por QR completa', 'Exportación a Excel'],
  'gatheryx:anual': ['Eventos ilimitados', '3.000 registrados al año',
                     'Un evento activo a la vez', 'Formulario público de inscripción',
                     'Métricas en vivo'],
  'gatheryx:productora': ['Eventos simultáneos ilimitados', '15.000 registrados al año',
                          'Formulario con la marca de tu cliente', 'Sub-cuentas por cliente',
                          'Informe por evento listo para entregar'],
  'leads:feria': ['3 vendedores', '1.000 contactos al mes', 'Captura sin conexión',
                  '12 meses de histórico', 'Exportación a Excel'],
  'leads:comercial': ['8 vendedores', 'Contactos ilimitados', 'Dictado por voz',
                      'Correo de agradecimiento automático', '5 GB de fotos y documentos'],
  'leads:equipo': ['Vendedores ilimitados', 'Histórico permanente',
                   'Reporte automático al correo', 'Reglas de privacidad por equipo',
                   'Almacenamiento ilimitado']
};

/** Dónde va este nivel en la pestaña. Los que no estén listados, al final. */
function posicionEnEscaparate(app, plan) {
  const orden = (ESCAPARATE[app] || {}).orden || [];
  const i = orden.indexOf(plan);
  return i === -1 ? orden.length : i;
}

/** Agrupa el catálogo por app, en el orden en que se muestran las pestañas. */
function agruparPlanes(filas) {
  return ORDEN_APPS
    .filter((codigo) => APPS[codigo])
    .map((codigo) => ({
      id: codigo,
      ...APPS[codigo],
      niveles: filas
        .filter((f) => f.app === codigo)
        .sort((a, b) => posicionEnEscaparate(codigo, a.plan) -
                        posicionEnEscaparate(codigo, b.plan))
        .map((f) => ({
          plan: f.plan,
          nombre: f.nombre,
          descripcion: f.descripcion || '',
          uf: Number(f.precio_uf),
          // Por defecto mensual: es lo que era todo antes de que existiera la
          // columna, y lo que sigue siendo la mayoría.
          periodo: f.periodo || 'mes',
          // Sólo lo que se puede contratar en línea de verdad. Un plan sin
          // plan de Flow, o de pago único, muestra «Escríbenos» en vez de un
          // botón que iba a fallar después de pedirle los datos al visitante.
          contratable: f.contratable !== false && (f.periodo || 'mes') === 'mes',
          // Cuál se recomienda lo dice el plan, no su posición: si mañana una
          // pestaña tiene cuatro niveles, «el del medio» deja de existir.
          recomendado: (ESCAPARATE[codigo] || {}).recomendado === f.plan,
          destacados: DESTACADOS[codigo + ':' + f.plan] || []
        }))
    }))
    .filter((a) => a.niveles.length > 0);
}

// Se rellena al arrancar; hasta entonces vale el respaldo.
let planesPorApp = agruparPlanes(PLANES_RESPALDO);

async function cargarPlanes() {
  const url = process.env.SUPABASE_URL;
  // Se aceptan los dos nombres: en Render la variable ya existía como
  // SUPABASE_KEY, y obligar a renombrarla sólo añadía un paso manual donde
  // equivocarse. Es la publishable key, no la de servicio.
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.warn('[planes] sin SUPABASE_URL/ANON_KEY: se usa el catálogo de respaldo');
    return;
  }

  try {
    const r = await fetch(url + '/rest/v1/rpc/planes_publicos', {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Accept-Profile': 'core',
        'Content-Profile': 'core'
      },
      body: '{}'
    });

    if (!r.ok) throw new Error('HTTP ' + r.status);
    const filas = await r.json();
    if (!Array.isArray(filas) || filas.length === 0) throw new Error('catálogo vacío');

    planesPorApp = agruparPlanes(filas);
    console.log('[planes] catálogo cargado del registro central: ' +
                filas.length + ' planes');
  } catch (e) {
    console.warn('[planes] no se pudo leer el catálogo, se usa el respaldo:', e.message);
  }
}

cargarPlanes();

const configPlanes = {
  urlCrearSuscripcion: process.env.URL_CREAR_SUSCRIPCION || ''
  // `ufRespaldo` se fue con el precio en pesos: ya no se convierte nada en
  // el navegador, así que tampoco hace falta una UF de respaldo.
};

const proceso = [
  { n: 1, nombre: 'Entendemos', icono: 'chat', desc: 'Escuchamos tu idea y entendemos tus objetivos y necesidades.' },
  { n: 2, nombre: 'Diseñamos', icono: 'diseno', desc: 'Proponemos la mejor solución tecnológica y planificamos cada etapa.' },
  { n: 3, nombre: 'Desarrollamos', icono: 'codigo', desc: 'Construimos tu solución con metodologías ágiles y altos estándares de calidad.' },
  { n: 4, nombre: 'Entregamos', icono: 'rocket', desc: 'Probamos, lanzamos y aseguramos que todo funcione perfecto.' },
  { n: 5, nombre: 'Acompañamos', icono: 'headset', desc: 'Te acompañamos después del lanzamiento para seguir impulsando tu negocio.' }
];

app.locals.servicios = servicios;
app.locals.proceso = proceso;
app.locals.empresa = {
  marca: 'RendApps',
  sub: 'Solutions',
  razon: 'Informática Daniel Chiappe Puebla E.I.R.L.',
  rut: '78.447.904-8',
  email: 'contacto@rendapps.cl',
  ubicacion: 'Santiago, Región Metropolitana',
  horario: 'Lun a Vie, 9:00 – 18:00'
};

// ================================
// Rutas
// ================================
app.get('/', (req, res) => {
  res.render('index', { titulo: 'Desarrollo de software a medida', pagina: 'inicio', proyectos });
});

app.get('/servicios', (req, res) => {
  res.render('servicios', { titulo: 'Servicios', pagina: 'servicios' });
});

// Compatibilidad con la ruta antigua
app.get('/productos', (req, res) => {
  res.redirect(301, '/servicios');
});

app.get('/proyectos', (req, res) => {
  res.render('proyectos', { titulo: 'Proyectos', pagina: 'proyectos', proyectos });
});

app.get('/proyectos/filtro-licitaciones', (req, res) => {
  res.render('proyecto-filtro', { titulo: 'Filtro de Licitaciones', pagina: 'proyectos' });
});

app.get('/proyectos/gatheryx', (req, res) => {
  // fuentesApp: la demo replica la app real, que usa Sora + JetBrains Mono.
  res.render('proyecto-gatheryx', { titulo: 'Gatheryx', pagina: 'proyectos', fuentesApp: true });
});

app.get('/proyectos/leadyx', (req, res) => {
  // Mismas tipografías que Gatheryx: las dos apps comparten el sistema visual.
  res.render('proyecto-leadyx', { titulo: 'Leadyx', pagina: 'proyectos', fuentesApp: true });
});

app.get('/planes', (req, res) => {
  // `?app=gatheryx` abre directamente esa pestaña. Es lo que enlazan los
  // botones de cada página de producto y el «Cambiar plan» de las apps.
  const pedida = String(req.query.app || '').trim();
  const inicial = planesPorApp.some((a) => a.id === pedida) ? pedida : planesPorApp[0]?.id;

  res.render('planes', {
    titulo: 'Planes y precios',
    pagina: 'planes',
    planesPorApp,
    appInicial: inicial,
    configPlanes
  });
});

// Página a la que Flow devuelve al cliente tras registrar la tarjeta.
//
// El estado real lo determina la Edge Function `flow-retorno`, que valida
// contra Flow y redirige aquí con ?estado=... Nunca se decide nada mirando sólo
// este parámetro: cualquiera puede escribirlo en la barra de direcciones, y por
// eso lo que no esté en la lista cae en 'error', que es el estado que no
// promete nada.
//
// 'duplicado' e 'incompleto' son los dos que antes se disfrazaban de 'ok':
// recargar la página y quedarse con el alta a medias acababan los dos en la
// pantalla de éxito, que además prometía un correo con los accesos que nadie
// enviaba. 'ok' se conserva por si queda alguna redirección vieja cacheada.
app.get('/pago/retorno', (req, res) => {
  const permitidos = ['ok', 'duplicado', 'incompleto', 'pendiente', 'error'];
  const estado = permitidos.includes(req.query.estado) ? req.query.estado : 'error';
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.render('pago-retorno', { titulo: 'Estado de tu suscripción', pagina: 'planes', estado });
});

// Creación de la cuenta tras el pago. A esta pantalla sólo se llega con el
// token de un solo uso que emite `flow-retorno`; quien decide si vale es la
// Edge Function `activar-cuenta`, no este servidor.
app.get('/crear-cuenta', (req, res) => {
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.render('crear-cuenta', {
    titulo: 'Crea tu cuenta',
    pagina: 'planes',
    configCuenta: { urlActivarCuenta: process.env.URL_ACTIVAR_CUENTA || '' }
  });
});

app.get('/nosotros', (req, res) => {
  res.render('nosotros', { titulo: 'Nosotros', pagina: 'nosotros' });
});

app.get('/soporte', (req, res) => {
  res.render('soporte', { titulo: 'Soporte', pagina: 'soporte' });
});

app.get('/contacto', (req, res) => {
  res.render('contacto', { titulo: 'Contacto', pagina: 'contacto', enviado: false, error: null, datos: {} });
});

app.post('/contacto', (req, res) => {
  const { nombre = '', email = '', asunto = '', mensaje = '' } = req.body;
  const datos = { nombre: nombre.trim(), email: email.trim(), asunto: asunto.trim(), mensaje: mensaje.trim() };

  if (!datos.nombre || !datos.email || !datos.mensaje) {
    return res.status(400).render('contacto', {
      titulo: 'Contacto',
      pagina: 'contacto',
      enviado: false,
      error: 'Completa tu nombre, correo y mensaje para poder responderte.',
      datos
    });
  }

  console.log('Mensaje de contacto recibido:', datos);
  res.render('contacto', { titulo: 'Contacto', pagina: 'contacto', enviado: true, error: null, datos: {} });
});

// ================================
// Descarga del instalador
//
// POR QUÉ EL ARCHIVO PASA POR AQUÍ Y NO SE ENLAZA GITHUB DIRECTO
//
// Dos motivos, y el segundo es el importante:
//
//   1. El cliente no acaba en GitHub. Pulsa un botón en rendapps.cl y empieza
//      la descarga; no ve otro dominio ni una página intermedia.
//
//   2. El enlace no caduca. La dirección del .exe lleva la versión dentro
//      (`.../leads-v1.1.2/LeadyxSetup_1.1.2.exe`), así que un correo enviado
//      hoy seguiría bajando la 1.1.2 dentro de un año. `/descargar/leads` no
//      cambia nunca y resuelve la última publicada en el momento en que se
//      pulsa: el correo de bienvenida de enero instala lo de diciembre.
//
// Lo que sale a GitHub es este servidor, no el navegador del cliente.
// ================================

// Qué se puede pedir. La lista está aquí y no sale de la base a propósito: es
// la puerta de entrada, y una tabla que se edita desde el panel no debería
// poder ampliar lo que este servidor acepta servir.
const APPS_DESCARGABLES = {
  filt: { nombre: 'la Filtradora de licitaciones', pagina: '/proyectos/filtro-licitaciones' },
  gatheryx: { nombre: 'Gatheryx', pagina: '/proyectos/gatheryx' },
  leads: { nombre: 'Leadyx', pagina: '/proyectos/leadyx' }
};

// De dónde aceptamos traernos un archivo. Sin esto, alguien con acceso al panel
// podría poner cualquier dirección en `core.app_versiones.url` y convertir este
// servidor en un reenviador de descargas ajenas con nuestro dominio delante.
const ORIGENES_INSTALADOR = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'release-assets.githubusercontent.com'
]);

// Resolver la versión es una consulta a la base, y bajar un instalador de 50 MB
// no debería costar una consulta más. Cinco minutos es corto para lo que tarda
// en publicarse una versión y largo para una ráfaga de descargas.
const CACHE_DESCARGA_MS = 5 * 60 * 1000;
const cacheDescarga = new Map();

async function resolverDescarga(app) {
  const guardado = cacheDescarga.get(app);
  if (guardado && Date.now() - guardado.en < CACHE_DESCARGA_MS) return guardado.dato;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('sin SUPABASE_URL/ANON_KEY');

  const r = await fetch(url + '/rest/v1/rpc/descarga_publica', {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Accept-Profile': 'core',
      'Content-Profile': 'core'
    },
    body: JSON.stringify({ p_app_codigo: app })
  });

  if (!r.ok) throw new Error('HTTP ' + r.status);
  const dato = await r.json();

  cacheDescarga.set(app, { en: Date.now(), dato: dato || null });
  return dato || null;
}

/** El nombre con el que se guarda el archivo. Sale de la URL, ya limpio. */
function nombreDeArchivo(url, app) {
  try {
    const ultimo = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    const limpio = ultimo.replace(/[^A-Za-z0-9._-]/g, '');
    if (limpio && /\.[A-Za-z0-9]{2,5}$/.test(limpio)) return limpio;
  } catch (e) { /* url rara: se usa el respaldo */ }
  return app + '-setup.exe';
}

function noSePudo(res, codigo, motivo, app) {
  const meta = APPS_DESCARGABLES[app];
  res.status(codigo).render('descarga', {
    titulo: 'Descarga',
    // `pagina` es qué pestaña se marca en el menú; el enlace al producto va
    // aparte. Llamarlos igual dejaba el menú apuntando a una URL.
    pagina: 'proyectos',
    motivo,
    appNombre: meta ? meta.nombre : 'la aplicación',
    paginaProducto: meta ? meta.pagina : null
  });
}

app.get('/descargar/:app', async (req, res) => {
  const app_ = String(req.params.app || '').toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(APPS_DESCARGABLES, app_)) {
    return noSePudo(res, 404, 'desconocida', app_);
  }

  let dato;
  try {
    dato = await resolverDescarga(app_);
  } catch (e) {
    console.error('[descarga] No se pudo resolver ' + app_ + ':', e.message);
    return noSePudo(res, 503, 'fallo', app_);
  }

  if (!dato || !dato.url) return noSePudo(res, 503, 'sin-version', app_);

  let origen;
  try {
    origen = new URL(dato.url);
  } catch (e) {
    console.error('[descarga] URL inválida para ' + app_ + ':', dato.url);
    return noSePudo(res, 503, 'fallo', app_);
  }

  if (origen.protocol !== 'https:' || !ORIGENES_INSTALADOR.has(origen.hostname)) {
    console.error('[descarga] Origen no permitido para ' + app_ + ':', origen.hostname);
    return noSePudo(res, 503, 'fallo', app_);
  }

  try {
    // Se reenvía el `Range` que mande el navegador: con 50 MB por medio, poder
    // reanudar una descarga cortada no es un lujo.
    const cabeceras = {};
    if (req.headers.range) cabeceras.range = req.headers.range;

    const arriba = await fetch(origen.href, { redirect: 'follow', headers: cabeceras });

    if (!arriba.ok && arriba.status !== 206) {
      console.error('[descarga] GitHub respondió ' + arriba.status + ' para ' + app_);
      return noSePudo(res, 503, 'fallo', app_);
    }

    res.status(arriba.status === 206 ? 206 : 200);
    for (const h of ['content-length', 'content-range', 'accept-ranges']) {
      const v = arriba.headers.get(h);
      if (v) res.set(h, v);
    }
    // Se fuerza octet-stream y `attachment`: da igual con qué tipo lo sirva el
    // origen, esto se guarda en disco, no se abre en una pestaña.
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition',
      'attachment; filename="' + nombreDeArchivo(origen.href, app_) + '"');
    if (dato.version) res.set('X-Version', String(dato.version));

    // HEAD lo mandan algunos gestores de descargas antes de empezar. Se les
    // contesta con las cabeceras y sin cuerpo.
    if (req.method === 'HEAD' || !arriba.body) return res.end();

    const flujo = Readable.fromWeb(arriba.body);
    flujo.on('error', (err) => {
      console.error('[descarga] Se cortó la transferencia de ' + app_ + ':', err.message);
      res.destroy(err);
    });
    // Si el cliente cierra a media descarga, se corta la lectura en vez de
    // seguir bajando de GitHub para nadie.
    res.on('close', () => flujo.destroy());
    flujo.pipe(res);

  } catch (e) {
    console.error('[descarga] Fallo al servir ' + app_ + ':', e.message);
    // Puede haber empezado a escribir: si ya salieron cabeceras, lo único
    // honesto es cortar. Renderizar HTML encima daría un archivo corrupto.
    if (res.headersSent) return res.destroy();
    return noSePudo(res, 503, 'fallo', app_);
  }
});

// Formulario público de registro a eventos (Registro Pro Eventos).
// La app enlaza a https://www.rendapps.cl/registro-forms?id=<eventoId>
app.get('/registro-forms', (req, res) => {
  // Sin caché: el formulario cambia con frecuencia y no debe quedar cacheado.
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'registro-forms.html'));
});

app.use((req, res) => {
  res.status(404).render('404', { titulo: 'Página no encontrada', pagina: '' });
});

app.listen(PORT, () => {
  console.log(`RendApps Solutions escuchando en http://localhost:${PORT}`);
  startKeepAlive();
});

// ==========================================
// KEEP ALIVE (AUTO-PING) — evita que Render duerma el servicio por inactividad
// ==========================================
function startKeepAlive() {
  // Render inyecta automáticamente la URL pública del servicio en esta variable
  // (p. ej. https://rendapps-solutions.onrender.com). En local no existe.
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) {
    console.log('[Keep-Alive] RENDER_EXTERNAL_URL no definida (entorno local): auto-ping desactivado.');
    return;
  }

  const INTERVALO_MS = 5 * 60 * 1000; // 5 minutos (Render duerme tras ~15 min de inactividad)

  setInterval(() => {
    https.get(url, (res) => {
      // Consume la respuesta y libera la memoria RAM.
      // Sin esto, Render acumula RAM, se reinicia y pierde el estado en memoria.
      res.resume();
    }).on('error', (err) => {
      console.error(`[Keep-Alive] Error: ${err.message}`);
    });
  }, INTERVALO_MS);

  console.log(`[Keep-Alive] Auto-ping activado cada 5 min a ${url}`);
}
