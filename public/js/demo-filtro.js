// Demo interactiva de la Filtradora de Licitaciones v2.1 (datos de ejemplo).
// Reproduce el shell real de la app: barra lateral, barra superior con el
// título de la vista, tema claro/oscuro y escala de texto.
(function () {
  var demo = document.getElementById('demo');
  if (!demo) return;

  var $ = function (sel) { return demo.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(demo.querySelectorAll(sel)); };

  // ============ Metadatos de las vistas (gui.py · PANTALLAS_META) ============

  var META = {
    inicio: ['Inicio', 'Resumen y accesos rápidos'],
    api: ['Mercado Público', 'Descarga de licitaciones publicadas'],
    compra: ['Compra Ágil', 'Cotizaciones vigentes de Compra Ágil'],
    foros: ['Foros inversos', 'Menciones a tu empresa en los portales'],
    filtros: ['Filtros', 'Categorías y reglas de búsqueda'],
    equipo: ['Equipo', 'Quién trabaja aquí y con qué permisos'],
    config: ['Configuración', 'Apariencia y cuenta']
  };

  // ============ Datos de ejemplo ============

  // Filtros de un rubro ficticio (artículos de oficina e impresión).
  // No corresponden a reglas reales de ningún cliente.
  // t: P = palabra, D = derivados, C = combinación
  var FILTROS = {
    'CONVENIOS': [
      { t: 'C', q: '(convenio o contrato o suministro) + (oficina o papelería o impresión o mobiliario o escritorio)' }
    ],
    'PAPELERIA': [
      { t: 'P', q: 'La palabra «resma»' },
      { t: 'P', q: 'La palabra «carpeta»' },
      { t: 'D', q: 'Palabras que empiezan con «papel»' },
      { t: 'C', q: 'sobre + (carta o oficio)' },
      { t: 'P', q: 'La palabra «etiquetas»' }
    ],
    'IMPRESION': [
      { t: 'C', q: 'cartucho + (tinta o tóner)' },
      { t: 'P', q: 'La palabra «tóner»' },
      { t: 'D', q: 'Palabras que empiezan con «impres»' },
      { t: 'P', q: 'La palabra «plotter»' },
      { t: 'P', q: 'La palabra «multifuncional»' },
      { t: 'C', q: 'cinta + (etiquetadora o rotuladora)' }
    ],
    'MOBILIARIO': [
      { t: 'C', q: 'silla + (ergonómica o giratoria o visita)' },
      { t: 'P', q: 'La palabra «escritorio»' },
      { t: 'P', q: 'La palabra «estante»' },
      { t: 'P', q: 'La palabra «kardex»' },
      { t: 'C', q: 'mesa + (reunión o trabajo)' },
      { t: 'D', q: 'Palabras que empiezan con «mobiliar»' }
    ],
    'TECNOLOGIA': [
      { t: 'P', q: 'La palabra «notebook»' },
      { t: 'P', q: 'La palabra «monitor»' },
      { t: 'C', q: 'computador + (escritorio o portátil)' },
      { t: 'D', q: 'Palabras que empiezan con «proyect»' },
      { t: 'P', q: 'La palabra «teclado»' },
      { t: 'C', q: 'disco + (duro o ssd o externo)' }
    ],
    'ESCRITURA': [
      { t: 'P', q: 'La palabra «lápiz»' },
      { t: 'P', q: 'La palabra «bolígrafo»' },
      { t: 'P', q: 'La palabra «plumón»' },
      { t: 'P', q: 'La palabra «destacador»' },
      { t: 'C', q: 'tinta + timbre' }
    ],
    'ARCHIVO': [
      { t: 'D', q: 'Palabras que empiezan con «archiv»' },
      { t: 'C', q: 'caja + (archivo o almacenaje)' },
      { t: 'P', q: 'La palabra «separadores»' },
      { t: 'P', q: 'La palabra «fundas»' },
      { t: 'P', q: 'La palabra «clips»' }
    ],
    'ESCOLAR': [
      { t: 'P', q: 'La palabra «cuaderno»' },
      { t: 'P', q: 'La palabra «témpera»' },
      { t: 'D', q: 'Palabras que empiezan con «escol»' },
      { t: 'C', q: 'set + (geometría o arte)' },
      { t: 'P', q: 'La palabra «mochila»' }
    ]
  };
  var TIPO_NOMBRE = { P: 'Palabra', D: 'Derivados', C: 'Combinación' };

  // Organismos e IDs ficticios: mantienen el formato de Mercado Público
  // pero no corresponden a licitaciones ni instituciones reales.
  var FOROS = [
    { id: '100523-148-LP26', cliente: 'HOSPITAL PROVINCIAL DE VALLE CLARO', fecha: '2026-07-11 09:16', revision: '13-07-2026', estado: 'Pendiente' },
    { id: '4210-141-LP26', cliente: 'HOSPITAL GENERAL DE PUERTO ALERCE', fecha: '2026-07-10 14:40', revision: '13-07-2026', estado: 'Pendiente' },
    { id: '105811-157-LP26', cliente: 'CENTRO CLÍNICO LAGUNA GRANDE', fecha: '2026-07-09 09:30', revision: '13-07-2026', estado: 'Pendiente' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:05', revision: '13-07-2026', estado: 'Respondida' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:12', revision: '13-07-2026', estado: 'Respondida' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:21', revision: '13-07-2026', estado: 'Respondida' },
    { id: '127900-26-LE26', cliente: 'CORPOSALUD BAHÍA NEGRA', fecha: '2026-06-12 12:59', revision: '12-07-2026', estado: 'Respondida' },
    { id: '105733-100-LP26', cliente: 'HOSPITAL DE NIÑOS RÍO BLANCO', fecha: '2026-06-02 11:04', revision: '12-07-2026', estado: 'Respondida' }
  ];

  var HISTORIAL = [
    { id: '105733-100-LP26', cliente: 'HOSPITAL DE NIÑOS RÍO BLANCO', fecha: '2026-06-02 11:04', revision: '13-07-2026', estado: 'Respondida' },
    { id: '2307-21-LP26', cliente: 'I MUNICIPALIDAD DE BAHÍA NEGRA', fecha: '—', revision: '13-07-2026', estado: 'Sin mención' },
    { id: '1398-47-LE26', cliente: 'SERVICIO DE SALUD VALLE CLARO', fecha: '—', revision: '13-07-2026', estado: 'Sin foro' },
    { id: '3191-58-LE26', cliente: 'HOSPITAL COSTA AZUL', fecha: '—', revision: '13-07-2026', estado: 'Sin mención' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:21', revision: '13-07-2026', estado: 'Respondida' },
    { id: '2777-10-LE26', cliente: 'I MUNICIPALIDAD DE PUERTO ALERCE', fecha: '—', revision: '12-07-2026', estado: 'Sin foro' },
    { id: '4210-139-LE26', cliente: 'HOSPITAL GENERAL DE PUERTO ALERCE', fecha: '—', revision: '12-07-2026', estado: 'Sin mención' },
    { id: '105744-37-LP26', cliente: 'CENTRO DE SALUD LOMA VERDE', fecha: '—', revision: '12-07-2026', estado: 'Sin foro' }
  ];

  // ============ Utilidades ============

  var toastEl = $('.demo-toast');
  var toastTimer = null;
  function toast(mensaje) {
    toastEl.textContent = mensaje;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2800);
  }

  function mostrarPantalla(nombre) {
    if (!META[nombre]) return;
    $$('.demo-pantalla').forEach(function (p) { p.hidden = p.getAttribute('data-nombre') !== nombre; });
    demo.setAttribute('data-pantalla', nombre);
    $('.demo-topbar-titulo').textContent = META[nombre][0];
    $('.demo-topbar-sub').textContent = META[nombre][1];
    $$('.demo-nav-item').forEach(function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-ir') === nombre ? 'true' : 'false');
    });
  }

  // ============ Navegación, plegado y tema ============

  demo.addEventListener('click', function (evento) {
    var ir = evento.target.closest('[data-ir]');
    if (ir) { mostrarPantalla(ir.getAttribute('data-ir')); return; }
    var conToast = evento.target.closest('[data-demo-toast]');
    if (conToast) { toast(conToast.getAttribute('data-demo-toast')); }
  });

  $('.demo-hamburguesa').addEventListener('click', function () {
    var oculta = demo.getAttribute('data-sidebar') === 'oculta';
    demo.setAttribute('data-sidebar', oculta ? 'visible' : 'oculta');
    this.setAttribute('aria-label', oculta ? 'Plegar la barra lateral' : 'Desplegar la barra lateral');
  });

  var btnTema = $('.demo-toggle-tema');
  function aplicarTema(modo) {
    demo.setAttribute('data-tema', modo);
    btnTema.textContent = modo === 'oscuro' ? '☀ Modo claro' : '🌙 Modo oscuro';
    $$('.demo-op-tema').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-tema-valor') === modo ? 'true' : 'false');
    });
  }

  btnTema.addEventListener('click', function () {
    aplicarTema(demo.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro');
  });

  $$('.demo-op-tema').forEach(function (b) {
    b.addEventListener('click', function () { aplicarTema(b.getAttribute('data-tema-valor')); });
  });

  $$('.demo-op-escala').forEach(function (b) {
    b.addEventListener('click', function () {
      var valor = b.getAttribute('data-escala-valor');
      demo.setAttribute('data-escala', valor);
      $$('.demo-op-escala').forEach(function (o) {
        o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
    });
  });

  // ============ Selección de filas + exportar ============

  // Conecta una tabla seleccionable con su botón de exportar.
  function conectarSeleccion(selTabla, selBoton, etiqueta, archivo) {
    var boton = $(selBoton);
    function actualizar() {
      var n = $$(selTabla + ' tbody input:checked').length;
      boton.disabled = n === 0;
      boton.textContent = n > 0 ? '⤓ Exportar seleccionadas (' + n + ')' : '⤓ Exportar seleccionadas';
    }
    $$(selTabla + ' tbody tr').forEach(function (fila) {
      fila.addEventListener('click', function (evento) {
        var caja = fila.querySelector('input[type="checkbox"]');
        if (!caja) return;
        if (evento.target !== caja) caja.checked = !caja.checked;
        fila.classList.toggle('demo-seleccionada', caja.checked);
        actualizar();
      });
    });
    boton.addEventListener('click', function () {
      var n = $$(selTabla + ' tbody input:checked').length;
      toast(archivo + ' exportado con ' + n + ' ' + etiqueta + ' — demo');
    });
    actualizar();
  }

  // ============ Pantalla Mercado Público ============

  var progreso = $('.demo-progreso');
  var resultados = $('.demo-resultados');
  var btnDescargar = $('.demo-descargar');
  var estadoApi = $('.demo-estado-api');
  var pasos = [];

  function limpiarPasos() {
    pasos.forEach(clearTimeout);
    pasos = [];
  }

  btnDescargar.addEventListener('click', function () {
    limpiarPasos();
    resultados.hidden = true;
    progreso.hidden = false;
    btnDescargar.disabled = true;

    var barra = $('.demo-progreso-barra i');
    var texto = $('.demo-progreso-texto');
    barra.style.width = '0';
    texto.textContent = 'Consultando la API de Mercado Público…';
    estadoApi.textContent = 'ⓘ Descargando el período 10-07-2026 a 13-07-2026…';

    pasos.push(setTimeout(function () { barra.style.width = '45%'; }, 60));
    pasos.push(setTimeout(function () {
      texto.textContent = '✅ Descarga completada en el servidor. Filtrando…';
      barra.style.width = '80%';
    }, 1000));
    pasos.push(setTimeout(function () {
      texto.textContent = '⚙️ Cargando y filtrando los datos de la nube…';
      barra.style.width = '100%';
    }, 1700));
    pasos.push(setTimeout(function () {
      progreso.hidden = true;
      resultados.hidden = false;
      btnDescargar.disabled = false;
      estadoApi.textContent = '✅ Filtrado finalizado: 16 licitaciones de 128 descargadas.';
    }, 2300));
  });

  $('.demo-cancelar').addEventListener('click', function () {
    limpiarPasos();
    progreso.hidden = true;
    btnDescargar.disabled = false;
    estadoApi.textContent = '🚫 La descarga fue cancelada.';
    toast('Descarga cancelada — en la app real también se detiene en el servidor.');
  });

  conectarSeleccion('.demo-tabla-lic', '.demo-exportar', 'licitación(es)', 'Resultado_Filtrado.xlsx');

  // ============ Pantalla Compra Ágil ============

  conectarSeleccion('.demo-tabla-ca', '.demo-exportar-ca', 'cotización(es)', 'CompraAgil_Filtrado.xlsx');

  var bannerCa = $('.demo-banner-ca');
  $('.demo-actualizar-ca').addEventListener('click', function () {
    bannerCa.hidden = false;
    toast('9 cotizaciones vigentes cargadas desde la nube — último barrido: hoy 04:12');
  });

  // ============ Pantalla Filtros ============

  var listaCat = $('.demo-lista-cat');
  var cuerpoFiltros = $('.demo-tabla-filtros tbody');
  var tituloFiltros = $('.demo-filtros-titulo');

  function pintarCategoria(nombre) {
    tituloFiltros.textContent = 'Filtros de ' + nombre;
    cuerpoFiltros.innerHTML = '';
    FILTROS[nombre].forEach(function (filtro) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td');
      td1.textContent = TIPO_NOMBRE[filtro.t];
      td1.className = 'demo-muted demo-nowrap';
      var td2 = document.createElement('td');
      td2.textContent = filtro.q;
      tr.appendChild(td1);
      tr.appendChild(td2);
      cuerpoFiltros.appendChild(tr);
    });
    $$('.demo-lista-cat button').forEach(function (b) {
      b.classList.toggle('demo-cat-activa', b.textContent === nombre);
    });
  }

  Object.keys(FILTROS).forEach(function (nombre) {
    var li = document.createElement('li');
    var boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = nombre;
    boton.addEventListener('click', function () { pintarCategoria(nombre); });
    li.appendChild(boton);
    listaCat.appendChild(li);
  });
  pintarCategoria('IMPRESION');

  // ============ Pantalla Foros inversos ============

  var cuerpoForos = $('.demo-tabla-foros tbody');
  var contadorForos = $('.demo-foros-count');
  var tituloHistorial = $('.demo-historial-titulo');
  var busquedaForos = $('.demo-filtro-foros');
  var vistaForos = 'foros'; // 'foros' | 'historial'

  function pintarForos() {
    var datos = vistaForos === 'foros' ? FOROS : HISTORIAL;
    var q = busquedaForos.value.trim().toLowerCase();
    var visibles = datos.filter(function (f) {
      return !q || f.id.toLowerCase().indexOf(q) !== -1 || f.cliente.toLowerCase().indexOf(q) !== -1;
    });

    cuerpoForos.innerHTML = '';

    if (visibles.length === 0) {
      var vacia = document.createElement('tr');
      var celda = document.createElement('td');
      celda.colSpan = 5;
      celda.className = 'demo-vacio';
      celda.textContent = 'Sin resultados para «' + busquedaForos.value.trim() + '».';
      vacia.appendChild(celda);
      cuerpoForos.appendChild(vacia);
    }

    visibles.forEach(function (f) {
      var tr = document.createElement('tr');
      var conMencion = f.estado === 'Respondida' || f.estado === 'Pendiente';
      [f.id, f.cliente, f.fecha, f.revision].forEach(function (valor, i) {
        var td = document.createElement('td');
        td.textContent = valor;
        if (i === 0) td.className = conMencion ? 'demo-link' : 'demo-nowrap';
        if (i === 2 || i === 3) td.className = 'demo-nowrap';
        tr.appendChild(td);
      });
      var tdEstado = document.createElement('td');
      if (f.estado === 'Respondida') {
        tdEstado.textContent = '✓ Respondida';
        tdEstado.className = 'demo-estado-ok';
      } else if (f.estado === 'Pendiente') {
        tdEstado.textContent = '● Pendiente';
        tdEstado.className = 'demo-estado-ok';
        tdEstado.style.color = 'var(--d-rojo)';
      } else {
        tdEstado.textContent = f.estado;
        tdEstado.className = 'demo-estado-neutro';
      }
      tr.appendChild(tdEstado);
      cuerpoForos.appendChild(tr);
    });

    contadorForos.textContent = visibles.length + ' foro(s)';
    tituloHistorial.hidden = vistaForos !== 'historial';
  }

  busquedaForos.addEventListener('input', pintarForos);
  $('.demo-ver-foros').addEventListener('click', function () {
    vistaForos = 'foros';
    pintarForos();
    toast('Revisión finalizada: 8 mención(es) a tu empresa en las licitaciones ofertadas.');
  });
  $('.demo-ver-historial').addEventListener('click', function () { vistaForos = 'historial'; pintarForos(); });
  pintarForos();

  // ============ Pantalla Equipo ============

  var filasEquipo = $$('.demo-tabla-equipo tbody tr');
  var seleccionado = null;

  filasEquipo.forEach(function (fila) {
    fila.addEventListener('click', function () {
      filasEquipo.forEach(function (f) { f.classList.remove('demo-seleccionada'); });
      fila.classList.add('demo-seleccionada');
      seleccionado = fila;
    });
  });

  $('.demo-cambiar-rol').addEventListener('click', function () {
    if (!seleccionado) {
      toast('Elige primero a un miembro del equipo en la tabla.');
      return;
    }
    var nuevo = $('.demo-select-rol').value;
    var chip = seleccionado.querySelector('.demo-chip');
    if (chip.textContent === nuevo) {
      toast('Ya tiene ese rol.');
      return;
    }
    chip.textContent = nuevo;
    chip.classList.toggle('demo-chip-neutro', nuevo === 'User');
    toast('✅ Rol actualizado: ' + seleccionado.cells[0].textContent + ' ahora es ' + nuevo + '.');
  });
})();
