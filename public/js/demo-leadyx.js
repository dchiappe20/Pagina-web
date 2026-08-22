// Demo interactiva de Leadyx (datos de ejemplo).
// Reproduce el flujo real de la app: evento activo, captura por voz con reparto
// de campos, lista de leads, ficha con el correo de agradecimiento, carpeta
// personal, exportación y los seis temas de color del producto.
(function () {
  var raiz = document.getElementById('lx');
  if (!raiz) return;

  var $ = function (sel) { return raiz.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(raiz.querySelectorAll(sel)); };

  var USUARIO = 'Carolina Núñez';

  // ============ Datos de ejemplo ============

  // Personas, empresas y eventos ficticios: no corresponden a nadie real.
  var EVENTOS = [
    {
      id: 'expomin',
      nombre: 'Expomin 2026',
      fecha: '22-04-2026',
      lugar: 'Santiago, Chile',
      leads: [
        { n: 'Andrea Villalobos', e: 'Nexa Ingeniería', c: 'Gerenta de Operaciones', t: '+56 9 8123 4567', m: 'andrea.villalobos@nexa.cl', d: 'Pide cotización para dos plantas nuevas; enviará las bases esta semana.', v: 'Carolina Núñez', f: '22-04-2026', hoy: true, off: false, correo: 'enviado', fotos: 2 },
        { n: 'Bruno Cárcamo', e: 'Altamar Logística', c: 'Jefe de Proyectos', t: '+56 9 7420 8891', m: 'bruno.carcamo@altamar.cl', d: 'Interesado en la Serie X. Pide ficha técnica y plazo de entrega.', v: 'Carolina Núñez', f: '22-04-2026', hoy: true, off: true, correo: 'pendiente', fotos: 1 },
        { n: 'Camila Sepúlveda', e: 'Vertex Salud', c: 'Directora Comercial', t: '+56 9 6644 2210', m: 'camila.sepulveda@vertex.cl', d: 'Quiere una demo en terreno para su equipo de compras en mayo.', v: 'Rodrigo Fuentes', f: '22-04-2026', hoy: true, off: false, correo: 'error', fotos: 0 },
        { n: 'Diego Larraín', e: 'Cordillera Data', c: 'Analista Senior', t: '+56 9 5533 7788', m: 'diego.larrain@cordilleradata.cl', d: 'Pasó a preguntar por integraciones. Sin compra a la vista por ahora.', v: 'Carolina Núñez', f: '21-04-2026', hoy: false, off: false, correo: 'enviado', fotos: 0 },
        { n: 'Elena Muñoz', e: 'Puerto Verde SpA', c: 'Coordinadora de Compras', t: '+56 9 4411 9032', m: '', d: 'Dejó sólo el teléfono. Llamar el lunes para agendar visita.', v: 'Paula Ríos', f: '21-04-2026', hoy: false, off: false, correo: 'sin_email', fotos: 1 },
        { n: 'Felipe Toro', e: 'Andes Retail', c: 'Subgerente de TI', t: '+56 9 3390 5514', m: 'felipe.toro@andesretail.cl', d: 'Compara con dos proveedores más. Decide en junio.', v: 'Rodrigo Fuentes', f: '20-04-2026', hoy: false, off: false, correo: 'enviado', fotos: 0 }
      ]
    },
    {
      id: 'alimentaria',
      nombre: 'Feria Alimentaria Sur',
      fecha: '03-06-2026',
      lugar: 'Puerto Montt, Chile',
      leads: [
        { n: 'Gonzalo Pérez', e: 'Distribuidora Loma Verde', c: 'Gerente de Compras', t: '+56 9 8811 2244', m: 'gonzalo.perez@lomaverde.cl', d: 'Quiere lista de precios por volumen para la temporada.', v: 'Carolina Núñez', f: '03-06-2026', hoy: false, off: false, correo: 'enviado', fotos: 1 },
        { n: 'Isidora Bravo', e: 'Conservas del Sur', c: 'Jefa de Producción', t: '+56 9 7722 6633', m: 'isidora.bravo@conservasdelsur.cl', d: 'Necesita el catálogo de envases y una visita a planta.', v: 'Paula Ríos', f: '03-06-2026', hoy: false, off: false, correo: 'enviado', fotos: 0 },
        { n: 'Jorge Medina', e: 'Frigorífico Andes', c: 'Encargado de Mantención', t: '+56 9 6612 0099', m: 'jorge.medina@frigoandes.cl', d: 'Consultó por repuestos y contrato de mantención anual.', v: 'Carolina Núñez', f: '02-06-2026', hoy: false, off: false, correo: 'pendiente', fotos: 0 }
      ]
    },
    {
      id: 'logistica',
      nombre: 'Congreso Logístico Andino',
      fecha: '18-07-2026',
      lugar: 'Antofagasta, Chile',
      leads: [
        { n: 'Karla Ojeda', e: 'Transportes Bahía', c: 'Gerenta General', t: '+56 9 5540 3321', m: 'karla.ojeda@tbahia.cl', d: 'Flota de 40 camiones. Pide propuesta de seguimiento en ruta.', v: 'Carolina Núñez', f: '18-07-2026', hoy: false, off: false, correo: 'enviado', fotos: 2 },
        { n: 'Lorena Aguirre', e: 'Puerto Norte', c: 'Jefa de Operaciones', t: '+56 9 8080 1122', m: 'lorena.aguirre@puertonorte.cl', d: 'Quiere ver el módulo de reportes antes de decidir.', v: 'Rodrigo Fuentes', f: '17-07-2026', hoy: false, off: false, correo: 'enviado', fotos: 0 }
      ]
    }
  ];

  var DOCUMENTOS = [
    { id: 'cat', nombre: 'Catálogo general 2026.pdf', tam: '4,2 MB' },
    { id: 'fic', nombre: 'Ficha técnica Serie X.pdf', tam: '860 KB' },
    { id: 'pre', nombre: 'Presentación corporativa.pdf', tam: '2,1 MB' }
  ];

  // Dictados de ejemplo. El texto es lo que diría el vendedor en el stand y
  // `campos` lo que devuelve el reparto: exactamente las seis claves de la app.
  var DICTADOS = [
    {
      texto: '«Anota a Andrea Villalobos, de Nexa Ingeniería, es gerenta de operaciones. Su teléfono es nueve, ocho uno dos tres, cuatro cinco seis siete, y el correo andrea punto villalobos arroba nexa punto cl. Quedó de mandarnos las bases para cotizar dos plantas nuevas.»',
      campos: {
        nombre: 'Andrea Villalobos',
        empresa: 'Nexa Ingeniería',
        cargo: 'Gerenta de Operaciones',
        telefono: '981234567',
        email: 'andrea.villalobos@nexa.cl',
        descripcion: 'Pide cotización para dos plantas nuevas; enviará las bases.'
      }
    },
    {
      texto: '«Bruno Cárcamo, jefe de proyectos de Altamar Logística, correo bruno punto carcamo arroba altamar punto cl, teléfono nueve siete cuatro dos, cero ocho ocho nueve uno. Le interesó el equipo de la serie X, pide ficha técnica y plazo de entrega.»',
      campos: {
        nombre: 'Bruno Cárcamo',
        empresa: 'Altamar Logística',
        cargo: 'Jefe de Proyectos',
        telefono: '974208891',
        email: 'bruno.carcamo@altamar.cl',
        descripcion: 'Interesado en la Serie X. Pide ficha técnica y plazo de entrega.'
      }
    },
    {
      texto: '«Camila Sepúlveda, directora comercial en Vertex Salud, camila punto sepulveda arroba vertex punto cl, nueve seis seis cuatro, cuatro dos dos uno cero. Quiere una demo en terreno para su equipo de compras en mayo.»',
      campos: {
        nombre: 'Camila Sepúlveda',
        empresa: 'Vertex Salud',
        cargo: 'Directora Comercial',
        telefono: '966442210',
        email: 'camila.sepulveda@vertex.cl',
        descripcion: 'Quiere una demo en terreno para el equipo de compras en mayo.'
      }
    }
  ];

  var EXPLICA = {
    inicio: ['Inicio', 'El evento activo manda: los leads, los capturados hoy y los que quedan por subir se refieren a él. Tocando la señal de la barra superior ves cómo se comporta la app cuando el recinto se queda sin cobertura.'],
    capturar: ['Capturar por voz', 'Pulsa «Ingreso general», deja correr el reloj y toca otra vez para terminar: el audio se transcribe y la IA reparte nombre, empresa, cargo, teléfono, correo y comentarios en su campo. Cada micrófono suelto dicta un campo por separado.'],
    leads: ['Leads del evento', 'Todos los contactos capturados por el equipo, con buscador y cuatro ordenamientos. La nube tachada marca los que aún no se han subido a la nube.'],
    detalle: ['Ficha del lead', 'Contacto, comentarios, quién lo atendió y el estado del correo de agradecimiento, con el botón para reenviarlo si falló. Abajo van las fotos de evidencia.'],
    'mis-leads': ['Mis leads', 'La carpeta personal del vendedor: todo lo que ha capturado él, de todos los eventos, con el recuento por feria.'],
    exportar: ['Exportar', 'Se marcan los eventos y sale un CSV con sus leads, listo para el CRM o el informe posterior a la feria.'],
    config: ['Configuración', 'Los seis temas son los del producto real: cambiarlos aquí re-tematiza la app entera al instante. Aquí también se fija la privacidad entre vendedores, se descarga la voz sin conexión y se fuerza el modo local.']
  };

  var ORDENES = [
    ['Nuevo', 'Más nuevo'],
    ['Nombre', 'Alfabético (A-Z)'],
    ['Vendedor', 'Por vendedor'],
    ['Empresa', 'Por empresa']
  ];

  // ============ Estado ============

  var evento = EVENTOS[0];
  var vista = 'inicio';
  var orden = 0;
  var offline = false;
  var vozLocal = false;
  var animaciones = true;
  var privacidad = 'privado';
  var leadAbierto = null;
  var dictado = 'idle';      // idle | grabando | procesando
  var dictadoIdx = 0;
  var segundos = 0;
  var reloj = null;
  var adjuntos = [];
  var fotos = [false, false, false];
  var exportar = [];

  // ============ Utilidades ============

  var pantalla = $('.lx-pantalla');
  var toastEl = null;
  var toastTimer = null;

  function toast(mensaje) {
    if (toastEl) toastEl.remove();
    toastEl = document.createElement('div');
    toastEl.className = 'lx-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.textContent = mensaje;
    pantalla.appendChild(toastEl);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }, 3000);
  }

  function esc(txt) {
    return String(txt == null ? '' : txt)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function iniciales(nombre) {
    return nombre.split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();
  }

  var TRAZOS = {
    nube_off: '<line x1="2" y1="2" x2="22" y2="22"/><path d="M6.5 18a4.5 4.5 0 0 1-.6-8.96"/><path d="M9 5.2A6 6 0 0 1 18 10h.5a4.5 4.5 0 0 1 3 7.8"/><line x1="8" y1="18" x2="17" y2="18"/>',
    calendario: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><line x1="16" y1="2.5" x2="16" y2="6.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="3" y1="10" x2="21" y2="10"/>',
    bandeja: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    telefono: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    sobre: '<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>',
    sobre_ok: '<path d="M3 10.5 12 4l9 6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="3 10.5 12 17 21 10.5"/>',
    candado: '<rect x="3.5" y="11" width="17" height="10" rx="2"/><path d="M7.5 11V7a4.5 4.5 0 0 1 9 0v4"/>',
    enviar: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    tic: '<polyline points="4 12.5 9.5 18 20 6.5"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
    derecha: '<polyline points="9 18 15 12 9 6"/>',
    nube_ok: '<path d="M6.5 19a4.5 4.5 0 0 1 0-9 6 6 0 0 1 11.5-1.5A4.5 4.5 0 0 1 17.5 19z"/><polyline points="9 14 11 16 15.5 11.5"/>',
    nube_baja: '<path d="M6.5 19a4.5 4.5 0 0 1 0-9 6 6 0 0 1 11.5-1.5A4.5 4.5 0 0 1 17.5 19"/><polyline points="9 16 12 19 15 16"/><line x1="12" y1="12" x2="12" y2="19"/>',
    chispas: '<path d="M12 3 13.7 8.3 19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="M18.5 15.5 19.3 18l2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8z"/>',
    rayo_off: '<line x1="2" y1="2" x2="22" y2="22"/><path d="M13 3 6.5 12.5H12l-1 8.5 5-7"/>'
  };

  function ico(nombre, tam) {
    return '<svg width="' + (tam || 18) + '" height="' + (tam || 18) + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      TRAZOS[nombre] + '</svg>';
  }

  // Foto de evidencia decorativa: no es una imagen real, sólo una silueta de
  // tarjeta de visita construida con los colores del tema activo.
  function fotoFalsa(semilla) {
    var n = 0;
    for (var i = 0; i < semilla.length; i++) n = (n * 31 + semilla.charCodeAt(i)) >>> 0;
    var giro = (n % 9) - 4;
    return '<svg class="lx-foto-falsa" viewBox="0 0 60 60" role="img" aria-label="Foto de evidencia de ejemplo">' +
      '<rect width="60" height="60" style="fill:var(--bg3)"/>' +
      '<g transform="rotate(' + giro + ' 30 32)">' +
      '<rect x="11" y="20" width="38" height="24" rx="3" style="fill:var(--bg2);stroke:var(--bd)"/>' +
      '<circle cx="20" cy="29" r="4" style="fill:var(--acc);opacity:.75"/>' +
      '<rect x="27" y="26" width="17" height="2.6" rx="1.3" style="fill:var(--tx);opacity:.75"/>' +
      '<rect x="27" y="31" width="12" height="2.2" rx="1.1" style="fill:var(--txd);opacity:.7"/>' +
      '<rect x="16" y="37" width="28" height="2.2" rx="1.1" style="fill:var(--acc2);opacity:.55"/>' +
      '</g></svg>';
  }

  // ============ Navegación ============

  function mostrarVista(nombre) {
    if (nombre === 'detalle' && !leadAbierto) leadAbierto = evento.leads[0] || null;

    vista = nombre;
    raiz.setAttribute('data-vista', nombre);

    $$('.lx-vista').forEach(function (v) {
      v.classList.toggle('lx-activa', v.getAttribute('data-nombre') === nombre);
    });

    $$('.lx-menu button').forEach(function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-ir') === nombre ? 'true' : 'false');
    });

    var info = EXPLICA[nombre];
    if (info) {
      $('.lx-explica-titulo').textContent = info[0];
      $('.lx-explica-texto').textContent = info[1];
    }

    if (nombre === 'inicio') animarAvance();
    if (nombre === 'leads') pintarLeads();
    if (nombre === 'detalle') pintarFicha();
    if (nombre === 'mis-leads') pintarMisLeads();
    if (nombre === 'exportar') pintarExportar();
    $('.lx-scroll').scrollTop = 0;
  }

  raiz.addEventListener('click', function (e) {
    var ir = e.target.closest('[data-ir]');
    if (ir) {
      mostrarVista(ir.getAttribute('data-ir'));
      if (ir.classList.contains('lx-op-buscar')) $('.lx-buscar').focus();
      return;
    }
    var conToast = e.target.closest('[data-lx-toast]');
    if (conToast) toast(conToast.getAttribute('data-lx-toast'));
  });

  $('.lx-volver-lista').addEventListener('click', function () { mostrarVista('leads'); });

  // ============ Evento activo ============

  function cifras() {
    var total = evento.leads.length;
    var hoy = evento.leads.filter(function (l) { return l.hoy; }).length;
    var pend = evento.leads.filter(function (l) { return l.off; }).length;
    return { total: total, hoy: hoy, pend: pend };
  }

  function pintarEvento() {
    var c = cifras();

    $('.lx-evento-nombre').textContent = evento.nombre;
    $('.lx-evento-fecha').textContent = evento.fecha + ' · ' + evento.lugar;
    $$('.lx-nombre-evento').forEach(function (el) { el.textContent = evento.nombre; });

    // Sin conexión no se conocen los totales del evento: mostrar un 0 haría
    // creer que no hay leads, así que la app dibuja un guion.
    $('.lx-n-total').textContent = offline ? '—' : c.total;
    $('.lx-n-hoy').textContent = offline ? '—' : c.hoy;
    $('.lx-n-pend').textContent = c.pend;
    $('.lx-stat-pend').classList.toggle('lx-pendiente', c.pend > 0);

    var sync = c.total - c.pend;
    $('.lx-barra-pie').textContent = offline
      ? c.pend + ' sin subir · totales no disponibles sin conexión'
      : sync + ' de ' + c.total + ' sincronizados';

    animarAvance();
    pintarLeads();
    pintarMisLeads();
  }

  function animarAvance() {
    var c = cifras();
    var pct = c.total > 0 ? Math.round(((c.total - c.pend) / c.total) * 100) : 0;
    var barra = $('.lx-avance');
    barra.style.width = '0';
    setTimeout(function () { barra.style.width = pct + '%'; }, 60);
  }

  // ============ Hoja inferior (eventos y orden) ============

  var hoja = $('.lx-hoja-fondo');

  function abrirHojaEventos() {
    $('.lx-hoja-titulo').textContent = 'Selecciona el evento activo';
    var lista = $('.lx-hoja-lista');
    lista.innerHTML = '';
    EVENTOS.forEach(function (ev) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lx-hoja-item';
      b.setAttribute('aria-pressed', ev.id === evento.id ? 'true' : 'false');
      b.innerHTML =
        '<span class="lx-avatar">' + esc(iniciales(ev.nombre)) + '</span>' +
        '<span class="lx-hoja-texto"><b>' + esc(ev.nombre) + '</b>' +
        '<span>' + esc(ev.fecha + ' · ' + ev.lugar) + '</span></span>' +
        '<span class="lx-hoja-tic">' + ico('tic', 17) + '</span>';
      b.addEventListener('click', function () {
        evento = ev;
        leadAbierto = null;
        hoja.classList.remove('lx-activa');
        pintarEvento();
        toast('Evento activo: ' + ev.nombre);
      });
      lista.appendChild(b);
    });
    hoja.classList.add('lx-activa');
  }

  function abrirHojaOrden() {
    $('.lx-hoja-titulo').textContent = 'Ordenar por';
    var lista = $('.lx-hoja-lista');
    lista.innerHTML = '';
    ORDENES.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lx-hoja-item';
      b.setAttribute('aria-pressed', i === orden ? 'true' : 'false');
      b.innerHTML =
        '<span class="lx-hoja-texto"><b>' + esc(o[1]) + '</b></span>' +
        '<span class="lx-hoja-tic">' + ico('tic', 17) + '</span>';
      b.addEventListener('click', function () {
        orden = i;
        $('.lx-orden-txt').textContent = ORDENES[i][0];
        hoja.classList.remove('lx-activa');
        pintarLeads();
      });
      lista.appendChild(b);
    });
    hoja.classList.add('lx-activa');
  }

  $('.lx-cambiar-evento').addEventListener('click', abrirHojaEventos);
  $('.lx-orden').addEventListener('click', abrirHojaOrden);
  hoja.addEventListener('click', function (e) {
    if (e.target === hoja) hoja.classList.remove('lx-activa');
  });

  // ============ Lista de leads del evento ============

  var buscar = $('.lx-buscar');

  function ordenar(leads) {
    var copia = leads.slice();
    if (orden === 1) copia.sort(function (a, b) { return a.n.localeCompare(b.n); });
    if (orden === 2) copia.sort(function (a, b) { return a.v.localeCompare(b.v) || a.n.localeCompare(b.n); });
    if (orden === 3) copia.sort(function (a, b) { return a.e.localeCompare(b.e) || a.n.localeCompare(b.n); });
    return copia;
  }

  function filaLead(l, conEvento) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lx-lead';
    b.innerHTML =
      '<span class="lx-lead-cab"><b>' + esc(l.n) + '</b>' +
      (l.off ? ico('nube_off', 16) : '') + '</span>' +
      '<span class="lx-lead-empresa">' + esc(l.e) + '</span>' +
      '<span class="lx-lead-pie">' +
      (conEvento
        ? '<span class="lx-lead-evento">' + ico('calendario', 12) + '<span>' + esc(l.evento || evento.nombre) + '</span></span>'
        : '<span></span>') +
      '<span>' + esc(conEvento ? l.f : '[' + l.v + ']') + '</span>' +
      '</span>';
    b.addEventListener('click', function () {
      leadAbierto = l;
      mostrarVista('detalle');
    });
    return b;
  }

  function pintarLeads() {
    var lista = $('.lx-lista-leads');
    var q = buscar.value.trim().toLowerCase();
    var visibles = ordenar(evento.leads).filter(function (l) {
      return !q || (l.n + ' ' + l.e + ' ' + l.v).toLowerCase().indexOf(q) !== -1;
    });

    $('.lx-n-lista').textContent = evento.leads.length;
    lista.innerHTML = '';

    if (visibles.length === 0) {
      var vacio = document.createElement('p');
      vacio.className = 'lx-vacio';
      vacio.textContent = q ? 'Sin resultados' : 'No hay leads registrados aún.';
      lista.appendChild(vacio);
      return;
    }

    visibles.forEach(function (l) { lista.appendChild(filaLead(l, false)); });
  }

  buscar.addEventListener('input', pintarLeads);

  // ============ Mis leads ============

  var buscarMios = $('.lx-buscar-mios');

  function misLeads() {
    var salida = [];
    EVENTOS.forEach(function (ev) {
      ev.leads.forEach(function (l) {
        if (l.v !== USUARIO) return;
        // Copia con el nombre del evento pegado: la carpeta personal mezcla
        // leads de varias ferias y la fila necesita decir de cuál viene.
        var copia = { evento: ev.nombre };
        for (var k in l) if (Object.prototype.hasOwnProperty.call(l, k)) copia[k] = l[k];
        salida.push(copia);
      });
    });
    return salida;
  }

  function pintarMisLeads() {
    var todos = misLeads();
    var q = buscarMios.value.trim().toLowerCase();
    var visibles = todos.filter(function (l) {
      return !q || (l.n + ' ' + l.e + ' ' + l.evento).toLowerCase().indexOf(q) !== -1;
    });

    $('.lx-n-mios').textContent = todos.length;

    var chips = $('.lx-chips-evento');
    chips.innerHTML = '';
    EVENTOS.forEach(function (ev) {
      var n = ev.leads.filter(function (l) { return l.v === USUARIO; }).length;
      if (!n) return;
      var c = document.createElement('span');
      c.className = 'lx-chip-evento';
      c.innerHTML = '<span>' + esc(ev.nombre) + '</span><b>' + n + '</b>';
      chips.appendChild(c);
    });

    var lista = $('.lx-lista-mios');
    lista.innerHTML = '';
    if (visibles.length === 0) {
      var vacio = document.createElement('p');
      vacio.className = 'lx-vacio';
      vacio.textContent = q ? 'Sin resultados' : 'Todavía no has capturado ningún lead.';
      lista.appendChild(vacio);
      return;
    }
    visibles.forEach(function (l) { lista.appendChild(filaLead(l, true)); });
  }

  buscarMios.addEventListener('input', pintarMisLeads);

  // ============ Ficha del lead ============

  function bloqueCorreo(l) {
    if (l.off) {
      return '<div class="lx-linea"></div>' +
        '<div class="lx-correo"><span class="lx-correo-icono" style="color:var(--txd)">' + ico('sobre', 16) + '</span>' +
        '<span class="lx-correo-txt"><span style="font-size:12.5px;color:var(--txd);line-height:1.4;display:block">' +
        'El correo de agradecimiento se podrá enviar cuando este lead se sincronice con la nube.</span></span></div>';
    }
    if (l.correo === 'sin_email') {
      return '<div class="lx-linea"></div>' +
        '<div class="lx-correo"><span class="lx-correo-icono" style="color:var(--txd)">' + ico('sobre', 16) + '</span>' +
        '<span class="lx-correo-txt"><span style="font-size:12.5px;color:var(--txd);display:block">' +
        'Sin correo registrado — no hay agradecimiento que enviar</span></span></div>';
    }

    var enviado = l.correo === 'enviado';
    var detalle = enviado
      ? l.f + ' · 19:42'
      : (l.correo === 'error' ? 'El último intento falló' : 'Todavía no se ha enviado');

    return '<div class="lx-linea"></div>' +
      '<div class="lx-correo ' + (enviado ? 'lx-correo-ok' : 'lx-correo-no') + '">' +
      '<span class="lx-correo-icono">' + ico(enviado ? 'sobre_ok' : 'sobre', 16) + '</span>' +
      '<span class="lx-correo-txt"><b>Correo de agradecimiento ' + (enviado ? 'enviado' : 'no enviado') + '</b>' +
      '<span>' + esc(detalle) + '</span></span></div>' +
      (enviado ? '' : '<button type="button" class="lx-correo-enviar">' + ico('enviar', 16) + ' Enviar ahora</button>');
  }

  function pintarFicha() {
    var l = leadAbierto;
    var caja = $('.lx-ficha-contenedor');
    if (!l) { caja.innerHTML = '<p class="lx-vacio">Abre un lead desde la lista.</p>'; return; }

    // Con la privacidad activada, un vendedor ve que el lead existe pero no sus
    // datos de contacto. El administrador siempre lo ve todo.
    var oculto = privacidad !== 'todo' && l.v !== USUARIO;

    var contacto = oculto
      ? '<p class="lx-mono" style="margin-top:16px">Así lo ve un vendedor</p>' +
        '<div class="lx-privado">' + ico('candado', 17) +
        '<span>Los datos de contacto son privados: este lead lo capturó otro vendedor.</span></div>'
      : '<div class="lx-contactos">' +
        (l.t ? '<div class="lx-contacto">' + ico('telefono', 16) + '<span>' + esc(l.t) + '</span></div>' : '') +
        (l.m ? '<div class="lx-contacto">' + ico('sobre', 16) + '<span>' + esc(l.m) + '</span></div>' : '') +
        '</div>';

    var comentario = (!oculto && l.d)
      ? '<div class="lx-linea"></div><p class="lx-etiqueta-detalle">COMENTARIOS</p>' +
        '<p class="lx-comentario">' + esc(l.d) + '</p>'
      : '';

    var evidencias = (!oculto && l.fotos > 0)
      ? '<p class="lx-etiqueta-detalle" style="margin-top:18px;color:var(--tx)">Evidencias</p><div class="lx-evidencias">' +
        Array.apply(null, Array(l.fotos)).map(function (_, i) {
          return '<div class="lx-evidencia">' + fotoFalsa(l.n + i) + '</div>';
        }).join('') + '</div>'
      : '';

    caja.innerHTML =
      '<div class="lx-ficha">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span class="lx-ficha-nombre" style="flex:1">' + esc(l.n) + '</span>' +
      (l.off ? '<span style="color:var(--err);display:flex">' + ico('nube_off', 20) + '</span>' : '') +
      '</div>' +
      '<p class="lx-ficha-empresa">' + esc(l.e) + '</p>' +
      (l.c ? '<p class="lx-ficha-cargo">' + esc(l.c) + '</p>' : '') +
      contacto +
      comentario +
      '<div class="lx-linea"></div>' +
      '<p class="lx-atendido">Atendido por <b>' + esc(l.v) + '</b></p>' +
      bloqueCorreo(l) +
      evidencias +
      '</div>';

    var enviar = caja.querySelector('.lx-correo-enviar');
    if (enviar) {
      enviar.addEventListener('click', function () {
        enviar.innerHTML = '<span class="lx-girador" style="width:16px;height:16px"></span> Enviando…';
        setTimeout(function () {
          l.correo = 'enviado';
          pintarFicha();
          toast('Correo de agradecimiento enviado a ' + l.m);
        }, 1100);
      });
    }
  }

  // ============ Captura: dictado general ============

  var tarjeta = $('.lx-ingreso-general');
  var cajas = $$('.lx-campo-caja');

  function campoDe(clave) {
    return cajas.filter(function (c) { return c.getAttribute('data-campo') === clave; })[0];
  }

  function bloqueado() { return offline && !vozLocal; }

  function pintarDictado() {
    var interior = tarjeta.querySelector('.lx-dictado-int');
    tarjeta.classList.toggle('lx-grabando', dictado === 'grabando');
    tarjeta.classList.toggle('lx-procesando', dictado === 'procesando');

    if (dictado === 'grabando') {
      var mm = Math.floor(segundos / 60) + ':' + ('0' + (segundos % 60)).slice(-2);
      interior.innerHTML =
        '<span class="lx-dictado-icono"><span class="lx-onda"><i></i><i></i><i></i><i></i></span></span>' +
        '<span class="lx-dictado-txt">' +
        '<span class="lx-dictado-titulo"><i class="lx-pulso" style="background:var(--err)"></i>' +
        '<b>Escuchando · ' + mm + '</b></span>' +
        '<span class="lx-dictado-sub">Nombre, empresa, cargo, teléfono, correo y comentarios. Toca para terminar.</span>' +
        '</span>' +
        '<span class="lx-dictado-stop">' + ico('stop', 16) + '</span>';
      return;
    }

    if (dictado === 'procesando') {
      interior.innerHTML =
        '<span class="lx-dictado-icono"><span class="lx-girador"></span></span>' +
        '<span class="lx-dictado-txt"><b style="font-size:15px;font-weight:800">Interpretando…</b>' +
        '<span class="lx-dictado-sub">' +
        (offline ? 'Transcribiendo en el teléfono y repartiendo por palabras clave' : 'Transcribiendo el audio y repartiendo los datos') +
        '</span>' +
        '<span class="lx-transcrito">' + esc(DICTADOS[dictadoIdx].texto) + '</span></span>';
      return;
    }

    var sub = bloqueado()
      ? 'Sin red y sin voz offline — descarga el español en Configuración'
      : offline
        ? 'Sin red: transcribe el teléfono y se reparte por palabras clave'
        : 'Dilo todo de corrido y la IA lo reparte en cada campo';

    interior.innerHTML =
      '<span class="lx-dictado-icono">' + ico('mic', 22) + '</span>' +
      '<span class="lx-dictado-txt">' +
      '<span class="lx-dictado-titulo"><b>Ingreso general</b>' +
      (offline && !bloqueado() ? '<span class="lx-etq-local">LOCAL</span>' : '') + '</span>' +
      '<span class="lx-dictado-sub">' + sub + '</span></span>' +
      (bloqueado() ? '' : '<span class="lx-dictado-fin">' + ico('derecha', 17) + '</span>');

    tarjeta.style.opacity = bloqueado() ? '0.6' : '';
    tarjeta.style.borderColor = bloqueado() ? 'var(--bd)' : '';
  }

  function rellenar(campos, i) {
    var claves = Object.keys(campos);
    if (i >= claves.length) {
      toast(claves.length + ' campos rellenados desde tu dictado. Revisa y guarda.');
      setTimeout(function () {
        cajas.forEach(function (c) { c.classList.remove('lx-relleno'); });
      }, 2200);
      return;
    }
    var caja = campoDe(claves[i]);
    if (caja) {
      caja.querySelector('.lx-campo').value = campos[claves[i]];
      caja.classList.add('lx-relleno');
    }
    if (claves[i] === 'email') pintarAdjuntos();
    setTimeout(function () { rellenar(campos, i + 1); }, animaciones ? 230 : 0);
  }

  tarjeta.addEventListener('click', function () {
    if (bloqueado()) {
      toast('Sin conexión y sin voz descargada: escribe el lead o descarga el español en Configuración.');
      return;
    }

    if (dictado === 'idle') {
      dictado = 'grabando';
      segundos = 0;
      pintarDictado();
      clearInterval(reloj);
      reloj = setInterval(function () {
        segundos += 1;
        if (dictado === 'grabando') pintarDictado();
        if (segundos >= 120) tarjeta.click(); // el corte de seguridad de la app
      }, 1000);
      return;
    }

    if (dictado === 'grabando') {
      clearInterval(reloj);
      dictado = 'procesando';
      pintarDictado();
      setTimeout(function () {
        dictado = 'idle';
        pintarDictado();
        rellenar(DICTADOS[dictadoIdx].campos, 0);
        dictadoIdx = (dictadoIdx + 1) % DICTADOS.length;
      }, 1700);
    }
  });

  // Micrófono de cada campo: dicta sólo ese dato.
  cajas.forEach(function (caja) {
    caja.querySelector('.lx-mic').addEventListener('click', function () {
      if (dictado !== 'idle') return;
      if (bloqueado()) {
        toast('Sin conexión y sin voz descargada: escribe el dato o descarga el español en Configuración.');
        return;
      }
      var clave = caja.getAttribute('data-campo');
      caja.classList.add('lx-dictando');
      setTimeout(function () {
        caja.classList.remove('lx-dictando');
        caja.querySelector('.lx-campo').value = DICTADOS[dictadoIdx].campos[clave];
        caja.classList.add('lx-relleno');
        if (clave === 'email') pintarAdjuntos();
        setTimeout(function () { caja.classList.remove('lx-relleno'); }, 2000);
      }, 1200);
    });
  });

  // ============ Captura: fotos, adjuntos y guardado ============

  $$('.lx-foto').forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      fotos[i] = !fotos[i];
      btn.classList.toggle('lx-con-foto', fotos[i]);
      btn.innerHTML = fotos[i]
        ? fotoFalsa('foto' + i + evento.id)
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
      if (fotos[i]) toast('En la app real abre la cámara o la galería del teléfono.');
    });
  });

  // Los documentos sólo se ofrecen si hay correo y conexión: sin destinatario
  // no hay nada que adjuntar.
  function pintarAdjuntos() {
    var email = campoDe('email').querySelector('.lx-campo').value.trim();
    var visible = !!email && !offline;
    $('.lx-bloque-adjuntos').hidden = !visible;
    if (!visible) return;

    var caja = $('.lx-docs');
    if (caja.childElementCount === 0) {
      DOCUMENTOS.forEach(function (d) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lx-doc';
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML =
          '<span class="lx-casilla">' + ico('tic', 13) + '</span>' +
          '<span class="lx-doc-txt"><b>' + esc(d.nombre) + '</b><span>' + esc(d.tam) + '</span></span>';
        b.addEventListener('click', function () {
          var puesto = b.getAttribute('aria-pressed') === 'true';
          b.setAttribute('aria-pressed', puesto ? 'false' : 'true');
          adjuntos = adjuntos.filter(function (x) { return x !== d.id; });
          if (!puesto) adjuntos.push(d.id);
          var n = $('.lx-n-adjuntos');
          n.textContent = adjuntos.length;
          n.hidden = adjuntos.length === 0;
        });
        caja.appendChild(b);
      });
    }
  }

  campoDe('email').querySelector('.lx-campo').addEventListener('input', pintarAdjuntos);

  function limpiarFormulario() {
    cajas.forEach(function (c) {
      c.querySelector('.lx-campo').value = '';
      c.classList.remove('lx-relleno', 'lx-dictando');
    });
    fotos = [false, false, false];
    $$('.lx-foto').forEach(function (b, i) {
      b.classList.remove('lx-con-foto');
      b.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
    });
    adjuntos = [];
    $$('.lx-doc').forEach(function (d) { d.setAttribute('aria-pressed', 'false'); });
    $('.lx-n-adjuntos').hidden = true;
    pintarAdjuntos();
  }

  $('.lx-guardar').addEventListener('click', function () {
    var val = function (k) { return campoDe(k).querySelector('.lx-campo').value.trim(); };
    var nombre = val('nombre');
    var empresa = val('empresa');

    if (!nombre || !empresa) {
      toast('Nombre y empresa son obligatorios: sin ellos el lead no sirve.');
      return;
    }
    // Mismo criterio que la app: el duplicado se detecta por correo o teléfono,
    // nunca por nombre (dos personas pueden llamarse igual).
    var email = val('email');
    var telefono = val('telefono');
    var repetido = evento.leads.filter(function (l) {
      return (email && l.m === email) || (telefono && l.t === telefono);
    })[0];
    if (repetido) {
      toast(repetido.n + ' ya está capturado en este evento (mismo contacto).');
      return;
    }

    evento.leads.unshift({
      n: nombre,
      e: empresa,
      c: val('cargo'),
      t: telefono,
      m: email,
      d: val('descripcion'),
      v: USUARIO,
      f: evento.fecha,
      hoy: true,
      off: offline,
      correo: offline ? 'pendiente' : (email ? 'enviado' : 'sin_email'),
      fotos: fotos.filter(Boolean).length
    });

    limpiarFormulario();
    pintarEvento();
    mostrarVista('leads');

    toast(offline
      ? nombre + ' guardado en el teléfono: se subirá al recuperar la señal.'
      : email
        ? nombre + ' guardado. Correo de agradecimiento enviado' + (adjuntos.length ? ' con ' + adjuntos.length + ' adjunto(s).' : '.')
        : nombre + ' guardado. Sin correo, no hay agradecimiento que enviar.');
  });

  // ============ Exportar ============

  function pintarExportar() {
    var lista = $('.lx-lista-exportar');
    lista.innerHTML = '';
    EVENTOS.forEach(function (ev) {
      var marcado = exportar.indexOf(ev.id) !== -1;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lx-evento-check';
      b.setAttribute('aria-pressed', marcado ? 'true' : 'false');
      b.innerHTML =
        '<span class="lx-casilla">' + ico('tic', 14) + '</span>' +
        '<span class="lx-evento-check-txt"><b>' + esc(ev.nombre) + '</b>' +
        '<span>' + esc(ev.fecha + ' · ' + ev.lugar) + '</span></span>' +
        '<em>' + ev.leads.length + '</em>';
      b.addEventListener('click', function () {
        if (exportar.indexOf(ev.id) === -1) exportar.push(ev.id);
        else exportar = exportar.filter(function (x) { return x !== ev.id; });
        pintarExportar();
      });
      lista.appendChild(b);
    });

    var todos = exportar.length === EVENTOS.length;
    $('.lx-marcar-todos').setAttribute('aria-pressed', todos ? 'true' : 'false');
    $('.lx-marcados').textContent = exportar.length + '/' + EVENTOS.length;

    var btn = $('.lx-descargar');
    btn.disabled = exportar.length === 0;
    $('.lx-descargar-txt').textContent = 'Descargar CSV' + (exportar.length ? ' (' + exportar.length + ')' : '');
  }

  $('.lx-marcar-todos').addEventListener('click', function () {
    exportar = exportar.length === EVENTOS.length ? [] : EVENTOS.map(function (e) { return e.id; });
    pintarExportar();
  });

  $('.lx-descargar').addEventListener('click', function () {
    var n = EVENTOS.filter(function (e) { return exportar.indexOf(e.id) !== -1; })
      .reduce(function (a, e) { return a + e.leads.length; }, 0);
    var nombre = exportar.length === 1
      ? 'Leads_' + EVENTOS.filter(function (e) { return e.id === exportar[0]; })[0].nombre.replace(/\s+/g, '_') + '.csv'
      : 'Leads_export_' + exportar.length + '_eventos.csv';
    toast(nombre + ' con ' + n + ' leads — demo');
  });

  // ============ Configuración ============

  $$('.lx-tema').forEach(function (b) {
    b.addEventListener('click', function () {
      raiz.setAttribute('data-tema', b.getAttribute('data-tema-valor'));
      $$('.lx-tema').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      toast('Tema "' + b.querySelector('b').textContent + '" aplicado');
    });
  });

  $('.lx-animaciones').addEventListener('click', function () {
    animaciones = !animaciones;
    var b = $('.lx-animaciones');
    b.setAttribute('aria-pressed', animaciones ? 'true' : 'false');
    raiz.setAttribute('data-anim', animaciones ? 'on' : 'off');
    b.querySelector('.lx-fila-icono').innerHTML = ico(animaciones ? 'chispas' : 'rayo_off', 18);
    $('.lx-animaciones-sub').textContent = animaciones
      ? 'Transiciones, halos y efectos activados'
      : 'Interfaz estática — más fluida en equipos lentos';
    toast(animaciones ? 'Animaciones activadas' : 'Animaciones desactivadas');
  });

  $$('.lx-privacidad').forEach(function (b) {
    b.addEventListener('click', function () {
      privacidad = b.getAttribute('data-nivel');
      $$('.lx-privacidad').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      toast(b.querySelector('b').childNodes[0].textContent.trim());
    });
  });

  $('.lx-voz-offline').addEventListener('click', function () {
    if (vozLocal) return;
    var b = $('.lx-voz-offline');
    b.querySelector('.lx-voz-icono').innerHTML = '<span class="lx-girador" style="width:18px;height:18px"></span>';
    $('.lx-voz-titulo').textContent = 'Descargando…';
    $('.lx-voz-sub').textContent = 'Bajando el paquete de español al teléfono';

    setTimeout(function () {
      vozLocal = true;
      b.setAttribute('aria-pressed', 'true');
      b.querySelector('.lx-voz-icono').innerHTML = ico('nube_ok', 18);
      b.querySelector('.lx-voz-icono').style.color = 'var(--acc2)';
      $('.lx-voz-titulo').textContent = 'Voz sin conexión lista';
      $('.lx-voz-sub').textContent = 'El teléfono transcribe en local (es-CL)';
      pintarDictado();
      toast('Español descargado: ya puedes dictar sin señal.');
    }, 1600);
  });

  $('.lx-modo-local').addEventListener('click', function () { alternarOffline(); });

  // ============ Modo sin conexión ============

  function alternarOffline(silencio) {
    offline = !offline;

    $('.lx-offline').hidden = !offline;
    $('.lx-status-red').textContent = offline ? '⚠ ⌁ 87%' : '▮▮▮ ⌁ 87%';

    var b = $('.lx-modo-local');
    b.setAttribute('aria-pressed', offline ? 'true' : 'false');
    b.querySelector('.lx-modo-local-icono').innerHTML = ico(offline ? 'nube_off' : 'nube_ok', 18);
    $('.lx-modo-local-sub').textContent = offline
      ? 'Los leads se guardan en el teléfono'
      : 'Los leads se suben a la nube al guardar';

    if (!offline) {
      // Al recuperar la señal la app sube la cola pendiente.
      var subidos = 0;
      EVENTOS.forEach(function (ev) {
        ev.leads.forEach(function (l) {
          if (l.off) { l.off = false; subidos += 1; if (l.m) l.correo = 'enviado'; }
        });
      });
      if (!silencio) {
        toast(subidos
          ? 'Conexión recuperada: ' + subidos + ' lead(s) sincronizado(s).'
          : 'Conexión recuperada.');
      }
    } else if (!silencio) {
      toast('Sin conexión: la app sigue capturando y guarda en el teléfono.');
    }

    pintarDictado();
    pintarAdjuntos();
    pintarEvento();
    if (vista === 'detalle') pintarFicha();
  }

  var senal = $('.lx-status-red');
  senal.style.cursor = 'pointer';
  senal.title = 'Simular pérdida de conexión';
  senal.addEventListener('click', function () { alternarOffline(); });

  // ============ Arranque ============

  raiz.setAttribute('data-anim', 'on');
  pintarDictado();
  pintarAdjuntos();
  pintarExportar();
  pintarEvento();
  mostrarVista('inicio');
})();
