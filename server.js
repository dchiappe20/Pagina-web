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

const productos = [
  { id: 'filtro-licitaciones', nombre: 'Filtro de Licitaciones', categoria: 'Escritorio', etiqueta: 'Software de escritorio', icono: 'escritorio', precio: 'Proyecto a medida', desc: 'Filtra y gestiona licitaciones desde la API de Mercado Público. Desarrollada en Python para Amilab.' },
  { id: 'app-1', nombre: 'Aplicación 1', categoria: 'Móvil', etiqueta: 'Aplicación móvil', icono: 'movil', precio: 'Suscripción mensual', desc: 'Reemplazar con el nombre y la descripción reales. Modelo SaaS por suscripción.', placeholder: true },
  { id: 'app-2', nombre: 'Aplicación 2', categoria: 'Móvil', etiqueta: 'Aplicación móvil', icono: 'movil', precio: 'Suscripción mensual', desc: 'Reemplazar con el nombre y la descripción reales. Modelo SaaS por suscripción.', placeholder: true },
  { id: 'desarrollo-web', nombre: 'Desarrollo web a medida', categoria: 'Web', etiqueta: 'Desarrollo web', icono: 'web', precio: 'Proyecto a medida', desc: 'Sitios y aplicaciones web construidas según la necesidad específica de tu negocio.' },
  { id: 'integracion-apis', nombre: 'Integración de APIs', categoria: 'Servicios', etiqueta: 'Servicios', icono: 'integracion', precio: 'Por proyecto', desc: 'Conexión de tus sistemas con plataformas y servicios externos vía API.' },
  { id: 'mantencion-soporte', nombre: 'Mantención y soporte', categoria: 'Servicios', etiqueta: 'Servicios', icono: 'mantencion', precio: 'Plan mensual', desc: 'Actualización, corrección de errores y soporte del software ya desarrollado.' }
];

// Normaliza texto para búsquedas sin distinguir mayúsculas ni tildes
function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const categorias = [...new Set(productos.map((p) => p.categoria))];
app.locals.categorias = categorias;
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

app.get('/', (req, res) => {
  res.render('index', {
    titulo: 'Inicio',
    pagina: 'inicio',
    destacados: productos.slice(0, 3)
  });
});

app.get('/nosotros', (req, res) => {
  res.render('nosotros', { titulo: 'Nosotros', pagina: 'nosotros' });
});

app.get('/productos', (req, res) => {
  const q = (req.query.q || '').trim();
  const cat = (req.query.cat || '').trim();

  let lista = productos;
  if (cat) {
    lista = lista.filter((p) => p.categoria === cat);
  }
  if (q) {
    const qNorm = normalizar(q);
    lista = lista.filter(
      (p) => normalizar(p.nombre).includes(qNorm) || normalizar(p.desc).includes(qNorm)
    );
  }

  res.render('productos', {
    titulo: 'Productos',
    pagina: 'productos',
    productos: lista,
    q,
    cat
  });
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
