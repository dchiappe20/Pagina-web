const express = require('express');
const path = require('path');
const https = require('https');

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
    tipo: 'Software a medida',
    mockup: 'proyecto-ventana',
    desc: 'Aplicación de escritorio que filtra y clasifica licitaciones de Mercado Público en tiempo real, integrada con su API oficial.',
    estado: null
  },
  {
    id: 'aplicacion-1',
    nombre: 'Aplicación 1',
    tipo: 'App móvil · SaaS',
    mockup: 'proyecto-telefono-a',
    desc: 'Producto propio por suscripción. El nombre y el detalle se publicarán en su lanzamiento.',
    estado: 'En desarrollo',
    placeholder: true
  },
  {
    id: 'aplicacion-2',
    nombre: 'Aplicación 2',
    tipo: 'App móvil · SaaS',
    mockup: 'proyecto-telefono-b',
    desc: 'Producto propio por suscripción. El nombre y el detalle se publicarán en su lanzamiento.',
    estado: 'En desarrollo',
    placeholder: true
  }
];

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
  email: 'contacto@rendapps.dev',
  emailSoporte: 'soporte@rendapps.dev',
  telefono: '+56 9 XXXX XXXX',
  ubicacion: 'Puente Alto, Región Metropolitana',
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
