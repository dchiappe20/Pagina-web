// Demo interactiva de la Filtradora de Licitaciones (datos de ejemplo)
(function () {
  var demo = document.getElementById('demo');
  if (!demo) return;

  var $ = function (sel) { return demo.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(demo.querySelectorAll(sel)); };

  // ============ Datos de ejemplo ============

  // Filtros de ejemplo para un rubro ficticio (artículos de oficina e impresión).
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
    { id: '100523-148-LP26', cliente: 'HOSPITAL PROVINCIAL DE VALLE CLARO', fecha: '2026-05-18 09:16', estado: 'Respondida' },
    { id: '100523-148-LP26', cliente: 'HOSPITAL PROVINCIAL DE VALLE CLARO', fecha: '2026-06-01 12:58', estado: 'Respondida' },
    { id: '4210-141-LP26', cliente: 'HOSPITAL GENERAL DE PUERTO ALERCE', fecha: '2026-06-26 14:40', estado: 'Respondida' },
    { id: '105811-157-LP26', cliente: 'CENTRO CLÍNICO LAGUNA GRANDE', fecha: '2026-06-17 09:30', estado: 'Respondida' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:05', estado: 'Respondida' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:12', estado: 'Respondida' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:21', estado: 'Respondida' },
    { id: '127900-26-LE26', cliente: 'CORPOSALUD BAHÍA NEGRA', fecha: '2026-06-12 12:59', estado: 'Respondida' }
  ];

  var HISTORIAL = [
    { id: '105733-100-LP26', cliente: 'HOSPITAL DE NIÑOS RÍO BLANCO', fecha: '2026-07-10 09:43', estado: 'Sin foro' },
    { id: '2307-21-LP26', cliente: 'I MUNICIPALIDAD DE BAHÍA NEGRA', fecha: '2026-07-10 09:43', estado: 'Sin mención' },
    { id: '1398-47-LE26', cliente: 'SERVICIO DE SALUD VALLE CLARO', fecha: '2026-07-10 09:43', estado: 'Sin foro' },
    { id: '3191-58-LE26', cliente: 'HOSPITAL COSTA AZUL', fecha: '2026-07-10 09:43', estado: 'Sin mención' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:21', estado: 'Respondida' },
    { id: '940217-44-LP26', cliente: 'FUNDACIÓN SALUD CORDILLERA ALTA', fecha: '2026-07-06 15:12', estado: 'Respondida' },
    { id: '2777-10-LE26', cliente: 'I MUNICIPALIDAD DE PUERTO ALERCE', fecha: '2026-07-10 09:43', estado: 'Sin foro' },
    { id: '4210-139-LE26', cliente: 'HOSPITAL GENERAL DE PUERTO ALERCE', fecha: '2026-07-10 09:43', estado: 'Sin mención' },
    { id: '105744-37-LP26', cliente: 'CENTRO DE SALUD LOMA VERDE', fecha: '2026-07-10 09:43', estado: 'Sin foro' }
  ];

  // ============ Utilidades ============

  var toastEl = $('.demo-toast');
  var toastTimer = null;
  function toast(mensaje) {
    toastEl.textContent = mensaje;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  function mostrarPantalla(nombre) {
    $$('.demo-pantalla').forEach(function (p) { p.hidden = p.getAttribute('data-nombre') !== nombre; });
    demo.setAttribute('data-pantalla', nombre);
    $('.demo-volver').hidden = nombre === 'inicio';
  }

  // ============ Navegación y tema ============

  demo.addEventListener('click', function (evento) {
    var ir = evento.target.closest('[data-ir]');
    if (ir) { mostrarPantalla(ir.getAttribute('data-ir')); return; }
    var conToast = evento.target.closest('[data-demo-toast]');
    if (conToast) { toast(conToast.getAttribute('data-demo-toast')); }
  });

  $('.demo-volver').addEventListener('click', function () { mostrarPantalla('inicio'); });

  $('.demo-toggle-tema').addEventListener('click', function () {
    var claro = demo.getAttribute('data-tema') === 'claro';
    demo.setAttribute('data-tema', claro ? 'oscuro' : 'claro');
    this.textContent = claro ? '☀ Modo claro' : '🌙 Modo oscuro';
  });

  // ============ Pantalla Descarga ============

  var progreso = $('.demo-progreso');
  var resultados = $('.demo-resultados');
  var btnDescargar = $('.demo-descargar');

  btnDescargar.addEventListener('click', function () {
    resultados.hidden = true;
    progreso.hidden = false;
    btnDescargar.disabled = true;
    var barra = $('.demo-progreso-barra i');
    var texto = $('.demo-progreso-texto');
    barra.style.width = '0';
    texto.textContent = 'Consultando API de Mercado Público…';

    setTimeout(function () { barra.style.width = '45%'; }, 60);
    setTimeout(function () {
      texto.textContent = 'Aplicando filtros por categoría…';
      barra.style.width = '85%';
    }, 900);
    setTimeout(function () { barra.style.width = '100%'; }, 1500);
    setTimeout(function () {
      progreso.hidden = true;
      resultados.hidden = false;
      btnDescargar.disabled = false;
    }, 1900);
  });

  // Selección de licitaciones + exportación
  var btnExportar = $('.demo-exportar');
  function actualizarExportar() {
    var n = $$('.demo-tabla-lic tbody input:checked').length;
    btnExportar.disabled = n === 0;
    btnExportar.textContent = n > 0 ? '↓ Exportar seleccionadas (' + n + ')' : '↓ Exportar seleccionadas';
  }

  $$('.demo-tabla-lic tbody tr').forEach(function (fila) {
    fila.addEventListener('click', function (evento) {
      var caja = fila.querySelector('input[type="checkbox"]');
      if (evento.target !== caja) caja.checked = !caja.checked;
      fila.classList.toggle('demo-seleccionada', caja.checked);
      actualizarExportar();
    });
  });

  btnExportar.addEventListener('click', function () {
    var n = $$('.demo-tabla-lic tbody input:checked').length;
    toast('Resultado_Filtrado.xlsx exportado con ' + n + ' licitación(es) — demo');
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

  // ============ Pantalla Foros ============

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
    visibles.forEach(function (f) {
      var tr = document.createElement('tr');
      var esOk = f.estado === 'Respondida';
      [f.id, f.cliente, f.fecha].forEach(function (valor, i) {
        var td = document.createElement('td');
        td.textContent = valor;
        if (i === 0 && esOk) td.className = 'demo-link';
        tr.appendChild(td);
      });
      var tdEstado = document.createElement('td');
      tdEstado.textContent = (esOk ? '✓ ' : '') + f.estado;
      tdEstado.className = esOk ? 'demo-estado-ok' : 'demo-estado-neutro';
      tr.appendChild(tdEstado);
      cuerpoForos.appendChild(tr);
    });
    contadorForos.textContent = visibles.length + ' foro(s)';
    tituloHistorial.hidden = vistaForos !== 'historial';
  }

  busquedaForos.addEventListener('input', pintarForos);
  $('.demo-ver-foros').addEventListener('click', function () { vistaForos = 'foros'; pintarForos(); });
  $('.demo-ver-historial').addEventListener('click', function () { vistaForos = 'historial'; pintarForos(); });
  pintarForos();
})();
