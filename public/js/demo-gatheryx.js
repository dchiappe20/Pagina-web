// Demo interactiva de Gatheryx (datos de ejemplo).
// Reproduce el flujo real de la app: evento activo, registro, acreditación por
// QR, lista de asistentes, KPI y los seis temas de color del producto.
(function () {
  var raiz = document.getElementById('gx');
  if (!raiz) return;

  var $ = function (sel) { return raiz.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(raiz.querySelectorAll(sel)); };

  // ============ Datos de ejemplo ============

  // Personas, empresas y eventos ficticios: no corresponden a nadie real.
  var EVENTOS = [
    {
      id: 'congreso',
      nombre: 'Congreso de Innovación 2026',
      fecha: '14-08-2026',
      lugar: 'Centro de Eventos Vista Norte',
      tipo: 'cliente',
      total: 248,
      acred: 171,
      personas: [
        { n: 'Andrea Villalobos', e: 'Nexa Ingeniería', c: 'Gerente de Operaciones', m: 'andrea.villalobos@nexa.cl', t: '+56 9 8123 4567', ok: true },
        { n: 'Bruno Cárcamo', e: 'Altamar Logística', c: 'Jefe de Proyectos', m: 'bruno.carcamo@altamar.cl', t: '+56 9 7420 8891', ok: true },
        { n: 'Camila Sepúlveda', e: 'Vertex Salud', c: 'Directora Comercial', m: 'camila.sepulveda@vertex.cl', t: '+56 9 6644 2210', ok: false },
        { n: 'Diego Larraín', e: 'Cordillera Data', c: 'Analista Senior', m: 'diego.larrain@cordilleradata.cl', t: '+56 9 5533 7788', ok: true },
        { n: 'Elena Muñoz', e: 'Puerto Verde SpA', c: 'Coordinadora de Compras', m: 'elena.munoz@puertoverde.cl', t: '+56 9 4411 9032', ok: false },
        { n: 'Felipe Toro', e: 'Andes Retail', c: 'Subgerente de TI', m: 'felipe.toro@andesretail.cl', t: '+56 9 3390 5514', ok: false }
      ],
      kpi: [
        { u: 'Carolina Núñez', c: 96 },
        { u: 'Rodrigo Fuentes', c: 71 },
        { u: 'Sistema (Forms público)', c: 58 },
        { u: 'Paula Ríos', c: 23 }
      ]
    },
    {
      id: 'capacitacion',
      nombre: 'Capacitación en Prevención de Riesgos',
      fecha: '02-09-2026',
      lugar: 'Planta Industrial Loma Verde',
      tipo: 'comercial',
      total: 64,
      acred: 41,
      personas: [
        { n: 'Gonzalo Pérez', e: 'Loma Verde', c: 'Supervisor de Turno', m: 'gonzalo.perez@lomaverde.cl', t: '+56 9 8811 2244', ok: true },
        { n: 'Isidora Bravo', e: 'Loma Verde', c: 'Prevencionista', m: 'isidora.bravo@lomaverde.cl', t: '+56 9 7722 6633', ok: true },
        { n: 'Jorge Medina', e: 'Contratista Andes', c: 'Maestro Eléctrico', m: 'jorge.medina@andesc.cl', t: '+56 9 6612 0099', ok: false },
        { n: 'Karla Ojeda', e: 'Contratista Andes', c: 'Jefa de Terreno', m: 'karla.ojeda@andesc.cl', t: '+56 9 5540 3321', ok: false }
      ],
      kpi: [
        { u: 'Rodrigo Fuentes', c: 34 },
        { u: 'Carolina Núñez', c: 19 },
        { u: 'Sistema (Forms público)', c: 11 }
      ]
    },
    {
      id: 'lanzamiento',
      nombre: 'Lanzamiento Línea Costa Azul',
      fecha: '27-09-2026',
      lugar: 'Hotel Bahía Grande',
      tipo: 'cliente',
      total: 120,
      acred: 12,
      personas: [
        { n: 'Lorena Aguirre', e: 'Distribuidora Sur', c: 'Compradora', m: 'lorena.aguirre@dsur.cl', t: '+56 9 8080 1122', ok: true },
        { n: 'Matías Correa', e: 'Costa Azul', c: 'Gerente de Marca', m: 'matias.correa@costaazul.cl', t: '+56 9 7070 4455', ok: false },
        { n: 'Natalia Reyes', e: 'Grupo Meridiano', c: 'Jefa de Marketing', m: 'natalia.reyes@meridiano.cl', t: '+56 9 6060 7788', ok: false },
        { n: 'Óscar Pinto', e: 'Retail Bahía', c: 'Encargado de Categoría', m: 'oscar.pinto@retailbahia.cl', t: '+56 9 5050 9911', ok: false }
      ],
      kpi: [
        { u: 'Sistema (Forms público)', c: 78 },
        { u: 'Carolina Núñez', c: 28 },
        { u: 'Paula Ríos', c: 14 }
      ]
    }
  ];

  var EXPLICA = {
    inicio: ['Inicio', 'El evento activo manda: los contadores, la barra de avance y todo lo que hagas debajo se refieren a él. Con «Cambiar evento» saltas a otro sin salir de la pantalla, y tocando la señal de la barra superior ves cómo se comporta la app sin conexión.'],
    registrar: ['Registrar', 'El formulario pide siempre nombre, empresa, cargo y correo; RUT y patente sólo aparecen si ese evento los configuró. Guarda y la persona entra de inmediato en la lista, incluso sin internet.'],
    escaner: ['Acreditar por QR', 'El operador apunta la cámara al QR de la invitación y la app confirma con nombre y empresa antes de marcar el ingreso. Pulsa «Simular escaneo» para ver la confirmación.'],
    registrados: ['Registrados', 'Búsqueda, orden y detalle de cada asistente con su QR de acceso. Desde aquí se reenvía la invitación, se edita o se elimina un registro.'],
    kpi: ['KPI', 'Cuántos asistentes registró cada persona del equipo y cuántos entraron por el formulario público, en vivo durante el evento.'],
    crear: ['Crear evento', 'Al crear el evento se decide si la acreditación es por QR o comercial, qué datos pide el formulario público y qué imagen lo acompaña.'],
    config: ['Configuración', 'Los seis temas son los del producto real: cambiarlos aquí re-tematiza la app entera al instante. También se ajusta el tamaño de letra.']
  };

  var ORDENES = ['Nombre (A-Z)', 'Nombre (Z-A)', 'Empresa (A-Z)', 'Acreditados primero'];

  // ============ Estado ============

  var evento = EVENTOS[0];
  var vista = 'inicio';
  var orden = 0;
  var offline = false;

  // ============ Utilidades ============

  var pantalla = $('.gx-pantalla');
  var toastEl = null;
  var toastTimer = null;

  function toast(mensaje) {
    if (toastEl) toastEl.remove();
    toastEl = document.createElement('div');
    toastEl.className = 'gx-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.textContent = mensaje;
    pantalla.appendChild(toastEl);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }, 2800);
  }

  function iniciales(nombre) {
    return nombre.split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();
  }

  // QR decorativo: patrón determinista a partir del nombre. No codifica nada.
  function qrFalso(semilla) {
    var n = 0;
    for (var i = 0; i < semilla.length; i++) n = (n * 31 + semilla.charCodeAt(i)) >>> 0;
    var celdas = '';
    for (var y = 0; y < 11; y++) {
      for (var x = 0; x < 11; x++) {
        n = (n * 1103515245 + 12345) >>> 0;
        var esquina = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
        if (esquina || (n >> 16) % 2 === 0) {
          celdas += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#0A0E1C"/>';
        }
      }
    }
    return '<svg class="gx-qr" viewBox="-0.5 -0.5 12 12" role="img" aria-label="Código QR de ejemplo">' + celdas + '</svg>';
  }

  // ============ Navegación ============

  function mostrarVista(nombre) {
    vista = nombre;
    raiz.setAttribute('data-vista', nombre);

    var esEscaner = nombre === 'escaner';
    $('.gx-escaner').classList.toggle('gx-activa', esEscaner);
    $$('.gx-vista').forEach(function (v) {
      v.classList.toggle('gx-activa', !esEscaner && v.getAttribute('data-nombre') === nombre);
    });
    if (esEscaner) resetEscaner();

    $$('.gx-menu button').forEach(function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-ir') === nombre ? 'true' : 'false');
    });

    var info = EXPLICA[nombre];
    if (info) {
      $('.gx-explica-titulo').textContent = info[0];
      $('.gx-explica-texto').textContent = info[1];
    }

    if (nombre === 'kpi') animarKpi();
    if (nombre === 'inicio') animarAvance();
    $('.gx-scroll').scrollTop = 0;
  }

  raiz.addEventListener('click', function (e) {
    var ir = e.target.closest('[data-ir]');
    if (ir) { mostrarVista(ir.getAttribute('data-ir')); return; }
    var conToast = e.target.closest('[data-gx-toast]');
    if (conToast) { toast(conToast.getAttribute('data-gx-toast')); }
  });

  // ============ Evento activo ============

  function pintarEvento() {
    var pend = Math.max(0, evento.total - evento.acred);
    var pct = evento.total > 0 ? Math.round((evento.acred / evento.total) * 100) : 0;

    $('.gx-evento-nombre').textContent = evento.nombre;
    $('.gx-evento-fecha').textContent = evento.fecha;
    $('.gx-evento-lugar').textContent = evento.lugar;
    $('.gx-tipo').textContent = evento.tipo === 'cliente' ? 'CON QR' : 'COMERCIAL';

    $$('.gx-n-total').forEach(function (el) { el.textContent = evento.total; });
    $$('.gx-n-acred').forEach(function (el) { el.textContent = evento.acred; });
    $('.gx-n-pend').textContent = pend;
    $('.gx-n-pct').textContent = pct + '%';

    // En un evento comercial no hay QR: se marca el ingreso desde la lista.
    $('.gx-op-acreditar-sub').textContent = evento.tipo === 'cliente' ? 'Escanear QR' : 'Marcar ingreso';
    $('.gx-op-acreditar').setAttribute('data-ir', evento.tipo === 'cliente' ? 'escaner' : 'registrados');
    $('.gx-escaner-evento').textContent = evento.nombre;

    $$('.gx-nombre-evento').forEach(function (el) { el.textContent = evento.nombre; });

    animarAvance();
    pintarPersonas();
    pintarHoja();
  }

  function animarAvance() {
    var pct = evento.total > 0 ? Math.round((evento.acred / evento.total) * 100) : 0;
    var barra = $('.gx-avance');
    barra.style.width = '0';
    setTimeout(function () { barra.style.width = pct + '%'; }, 60);
  }

  // ============ Hoja: cambiar de evento ============

  var hoja = $('.gx-hoja-fondo');

  function pintarHoja() {
    var lista = $('.gx-hoja-lista');
    lista.innerHTML = '';
    EVENTOS.forEach(function (ev) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gx-hoja-item';
      b.setAttribute('aria-pressed', ev.id === evento.id ? 'true' : 'false');
      b.innerHTML =
        '<span class="gx-avatar">' + iniciales(ev.nombre) + '</span>' +
        '<span class="gx-hoja-texto"><b>' + ev.nombre + '</b>' +
        '<span>' + ev.fecha + ' · ' + (ev.tipo === 'cliente' ? 'Con QR' : 'Comercial') + '</span></span>';
      b.addEventListener('click', function () {
        evento = ev;
        hoja.classList.remove('gx-activa');
        pintarEvento();
        toast('Evento activo: ' + ev.nombre);
      });
      lista.appendChild(b);
    });
  }

  $('.gx-cambiar-evento').addEventListener('click', function () { hoja.classList.add('gx-activa'); });
  hoja.addEventListener('click', function (e) {
    if (e.target === hoja) hoja.classList.remove('gx-activa');
  });

  // ============ Lista de registrados ============

  var lista = $('.gx-lista-personas');
  var buscar = $('.gx-buscar');

  function ordenar(personas) {
    var copia = personas.slice();
    if (orden === 0) copia.sort(function (a, b) { return a.n.localeCompare(b.n); });
    if (orden === 1) copia.sort(function (a, b) { return b.n.localeCompare(a.n); });
    if (orden === 2) copia.sort(function (a, b) { return a.e.localeCompare(b.e); });
    if (orden === 3) copia.sort(function (a, b) { return (b.ok ? 1 : 0) - (a.ok ? 1 : 0); });
    return copia;
  }

  function pintarPersonas() {
    var q = buscar.value.trim().toLowerCase();
    var visibles = ordenar(evento.personas).filter(function (p) {
      return !q || p.n.toLowerCase().indexOf(q) !== -1 || p.e.toLowerCase().indexOf(q) !== -1;
    });

    lista.innerHTML = '';

    if (visibles.length === 0) {
      var vacio = document.createElement('p');
      vacio.style.cssText = 'text-align:center;color:var(--txd);margin-top:34px;font-size:13px';
      vacio.textContent = 'Sin resultados';
      lista.appendChild(vacio);
      return;
    }

    visibles.forEach(function (p) {
      var caja = document.createElement('div');
      caja.className = 'gx-persona';

      var cab = document.createElement('button');
      cab.type = 'button';
      cab.className = 'gx-persona-cab';
      cab.setAttribute('aria-expanded', 'false');
      cab.innerHTML =
        '<span class="gx-avatar">' + iniciales(p.n) + '</span>' +
        '<span class="gx-persona-txt"><b>' + p.n + '</b><span>' + p.e + ' · ' + p.c + '</span></span>' +
        '<span class="gx-tic' + (p.ok ? '' : ' gx-tic-off') + '">' + (p.ok ? '✓' : '·') + '</span>';

      var detalle = document.createElement('div');
      detalle.className = 'gx-persona-detalle';
      detalle.hidden = true;
      detalle.innerHTML =
        '<div class="gx-detalle-fila"><b>Correo</b><span>' + p.m + '</span></div>' +
        '<div class="gx-detalle-fila"><b>Teléfono</b><span>' + p.t + '</span></div>' +
        '<div class="gx-detalle-fila"><b>Estado</b><span>' + (p.ok ? 'Acreditado' : 'Pendiente de acreditar') + '</span></div>' +
        (evento.tipo === 'cliente'
          ? qrFalso(p.n) + '<span class="gx-mono gx-qr-etq">QR de acceso</span>'
          : '') +
        '<div class="gx-acciones-persona">' +
        '<button type="button" data-gx-toast="QR reenviado a ' + p.m + ' — demo">Reenviar QR</button>' +
        '<button type="button" data-gx-toast="En la app real abre el formulario para corregir los datos.">Editar</button>' +
        '<button type="button" class="gx-peligro" data-gx-toast="En la app real pide confirmación antes de eliminar.">Eliminar</button>' +
        '</div>';

      cab.addEventListener('click', function () {
        var abierto = !detalle.hidden;
        detalle.hidden = abierto;
        cab.setAttribute('aria-expanded', abierto ? 'false' : 'true');
      });

      caja.appendChild(cab);
      caja.appendChild(detalle);
      lista.appendChild(caja);
    });

    var pie = document.createElement('p');
    pie.className = 'gx-mono';
    pie.style.cssText = 'text-align:center;margin-top:12px;text-transform:none;letter-spacing:0.3px';
    pie.textContent = 'Mostrando ' + visibles.length + ' de ' + evento.total + ' registrados';
    lista.appendChild(pie);
  }

  buscar.addEventListener('input', pintarPersonas);

  $('.gx-orden').addEventListener('click', function () {
    orden = (orden + 1) % ORDENES.length;
    $('.gx-orden-txt').textContent = ORDENES[orden];
    pintarPersonas();
  });

  // ============ Registrar asistente ============

  $('.gx-form-registro').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var nombre = f.nombre.value.trim();
    if (!nombre) { toast('Escribe al menos el nombre del asistente.'); return; }

    evento.personas.unshift({
      n: nombre,
      e: f.empresa.value.trim() || 'Sin empresa',
      c: f.cargo.value.trim() || 'Sin cargo',
      m: f.correo.value.trim() || 'sin-correo@ejemplo.cl',
      t: f.telefono.value.trim() || '—',
      ok: false
    });
    evento.total += 1;
    f.reset();

    pintarEvento();
    mostrarVista('registrados');
    toast(offline
      ? nombre + ' guardado en el teléfono: se sincronizará al reconectar.'
      : nombre + ' registrado. Se le envió su QR por correo.');
  });

  // ============ Escáner QR ============

  function resetEscaner() {
    $('.gx-escaner-buscando').hidden = false;
    $('.gx-exito').hidden = true;
  }

  $('.gx-simular').addEventListener('click', function () {
    var pendiente = evento.personas.filter(function (p) { return !p.ok; })[0];
    if (!pendiente) {
      toast('¡No queda nadie por acreditar en este evento!');
      return;
    }
    pendiente.ok = true;
    evento.acred += 1;

    $('.gx-exito-nombre').textContent = pendiente.n;
    $('.gx-exito-detalle').textContent = pendiente.e + ' · ' + pendiente.c;
    $('.gx-escaner-buscando').hidden = true;
    $('.gx-exito').hidden = false;

    pintarEvento();
  });

  $('.gx-siguiente').addEventListener('click', resetEscaner);

  // ============ KPI ============

  function animarKpi() {
    var contenedor = $('.gx-kpi-lista');
    var datos = evento.kpi;
    var total = datos.reduce(function (a, b) { return a + b.c; }, 0);
    var max = datos.reduce(function (a, b) { return Math.max(a, b.c); }, 0);

    $('.gx-kpi-usuarios').textContent = datos.length;
    contenedor.innerHTML = '';

    datos.forEach(function (d) {
      var fila = document.createElement('div');
      fila.className = 'gx-kpi-fila';
      fila.innerHTML =
        '<div class="gx-kpi-cab"><b>' + d.u + '</b>' +
        '<span>' + d.c + ' · ' + Math.round((d.c / total) * 100) + '%</span></div>' +
        '<div class="gx-kpi-barra"><i></i></div>';
      contenedor.appendChild(fila);
      var barra = fila.querySelector('i');
      setTimeout(function () { barra.style.width = ((d.c / max) * 100) + '%'; }, 80);
    });

    // Conteo ascendente del total, como en la app.
    var numero = $('.gx-total-num');
    var inicio = null;
    var duracion = 1100;
    function paso(t) {
      if (!inicio) inicio = t;
      var p = Math.min((t - inicio) / duracion, 1);
      numero.textContent = Math.round(total * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(paso);
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      numero.textContent = total;
    } else {
      requestAnimationFrame(paso);
    }
  }

  // ============ Configuración: temas y tamaño de letra ============

  $$('.gx-tema').forEach(function (b) {
    b.addEventListener('click', function () {
      raiz.setAttribute('data-tema', b.getAttribute('data-tema-valor'));
      $$('.gx-tema').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      toast('Tema aplicado: ' + b.querySelector('b').textContent);
    });
  });

  $$('.gx-letra button').forEach(function (b) {
    b.addEventListener('click', function () {
      pantalla.style.fontSize = b.getAttribute('data-letra') + 'px';
      $$('.gx-letra button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });

  // ============ Crear evento: alternadores ============

  $$('.gx-tipo-registro button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.gx-tipo-registro button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });

  $$('.gx-campo-opcional').forEach(function (b) {
    b.addEventListener('click', function () {
      var activo = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', activo ? 'false' : 'true');
      b.style.borderColor = activo ? '' : 'var(--acc)';
      b.querySelector('.gx-fila-icono').style.color = activo ? 'var(--txd)' : 'var(--acc)';
    });
    // Estado inicial coherente con el aria-pressed del marcado.
    if (b.getAttribute('aria-pressed') !== 'true') {
      b.querySelector('.gx-fila-icono').style.color = 'var(--txd)';
    } else {
      b.style.borderColor = 'var(--acc)';
    }
  });

  // ============ Modo sin conexión (se activa tocando la señal) ============

  var senal = $('.gx-status-red');
  senal.style.cursor = 'pointer';
  senal.title = 'Simular pérdida de conexión';
  senal.addEventListener('click', function () {
    offline = !offline;
    $('.gx-offline').hidden = !offline;
    senal.textContent = offline ? '⚠ ⌁ 87%' : '▮▮▮ ⌁ 87%';
    toast(offline
      ? 'Sin conexión: la app sigue registrando y acreditando en local.'
      : 'Conexión recuperada: 2 registro(s) sincronizado(s).');
  });

  // ============ Arranque ============

  pintarEvento();
  mostrarVista('inicio');
})();
