// Demo interactiva de la Filtradora de Licitaciones (datos de ejemplo)
(function () {
  var demo = document.getElementById('demo');
  if (!demo) return;

  var $ = function (sel) { return demo.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(demo.querySelectorAll(sel)); };

  // ============ Datos de ejemplo ============

  // Filtros reales de la aplicación (por categoría). t: P = palabra, D = derivados, C = combinación
  var FILTROS = {
    'CONVENIOS': [
      { t: 'C', q: '(convenio o comodato o contrato o suministro) + (química o reactivos o hematología o orina o laboratorio o TBC o muestra)' }
    ],
    'ELECTROLITOS': [
      { t: 'C', q: 'electrolitos + plasmáticos' },
      { t: 'C', q: 'electrodos + (referencia o sodio o cloro o potasio)' },
      { t: 'C', q: 'filling + solution' },
      { t: 'C', q: 'refill + solution' }
    ],
    'EQUIPAMIENTO': [
      { t: 'C', q: 'cintas + orina' },
      { t: 'P', q: 'La palabra «dirui»' },
      { t: 'C', q: 'lector + (cintas o tiras)' },
      { t: 'D', q: 'Palabras que empiezan con «autoanaliz»' },
      { t: 'C', q: 'contador + hematológico' },
      { t: 'P', q: 'La palabra «centrífuga»' },
      { t: 'C', q: 'analizador + (sangre o plasma o suero)' },
      { t: 'P', q: 'La palabra «microscopio»' }
    ],
    'HEMATOLOGIA': [
      { t: 'D', q: 'Palabras que empiezan con «hematol»' }
    ],
    'INSUMOS': [
      { t: 'P', q: 'La palabra «inmuno»' },
      { t: 'D', q: 'Palabras que empiezan con «parasi»' },
      { t: 'P', q: 'La palabra «paf»' },
      { t: 'D', q: 'Palabras que empiezan con «teleman»' },
      { t: 'P', q: 'La palabra «graham»' }
    ],
    'MEDIOS DE CULTIVO': [
      { t: 'C', q: '(caldo o medio o agar o placa o tubo) + (hinton o conkey o sangre o columbia o cordero o cromo o chrom…)' },
      { t: 'P', q: 'La palabra «lia»' },
      { t: 'P', q: 'La palabra «tsi»' },
      { t: 'P', q: 'La palabra «mio»' },
      { t: 'P', q: 'La palabra «urea»' },
      { t: 'P', q: 'La palabra «bilis»' },
      { t: 'P', q: 'La palabra «esculina»' },
      { t: 'D', q: 'Palabras que empiezan con «thiog»' },
      { t: 'P', q: 'La palabra «glucosa»' },
      { t: 'P', q: 'La palabra «thayer»' }
    ],
    'ORINAS': [
      { t: 'P', q: 'La palabra «orina»' },
      { t: 'P', q: 'La palabra «fus»' },
      { t: 'P', q: 'La palabra «urs»' },
      { t: 'P', q: 'La palabra «sheath»' },
      { t: 'C', q: '(cintas o tiras) + reactivas' }
    ],
    'QUIMICA Y REACTIVOS': [
      { t: 'P', q: 'La palabra «alat»' },
      { t: 'D', q: 'Palabras que empiezan con «transam»' },
      { t: 'D', q: 'Palabras que empiezan con «creatin»' },
      { t: 'P', q: 'La palabra «glicemia»' },
      { t: 'P', q: 'La palabra «triglicéridos»' },
      { t: 'P', q: 'La palabra «vdrl»' },
      { t: 'C', q: 'control + (suero o bioquímico o nivel o normal o patológico)' },
      { t: 'P', q: 'La palabra «bilirrubina»' },
      { t: 'P', q: 'La palabra «colesterol»' },
      { t: 'C', q: 'reactivo + coagulación' }
    ]
  };
  var TIPO_NOMBRE = { P: 'Palabra', D: 'Derivados', C: 'Combinación' };

  var FOROS = [
    { id: '1075963-148-LP26', cliente: 'SERVICIO DE SALUD ARICA HOSP DR JUAN NOE CREVANI', fecha: '2026-05-18 09:16', estado: 'Respondida' },
    { id: '1075963-148-LP26', cliente: 'SERVICIO DE SALUD ARICA HOSP DR JUAN NOE CREVANI', fecha: '2026-06-01 12:58', estado: 'Respondida' },
    { id: '4309-141-LP26', cliente: 'HOSPITAL GUILLERMO GRANT BENAVENTE', fecha: '2026-06-26 14:40', estado: 'Respondida' },
    { id: '1057049-157-LP26', cliente: 'HOSPITAL CLINICO SAN BORJA ARRIARAN', fecha: '2026-06-17 09:30', estado: 'Respondida' },
    { id: '948355-44-LP26', cliente: 'FONDO HOSPITAL DIPRECA', fecha: '2026-07-06 15:05', estado: 'Respondida' },
    { id: '948355-44-LP26', cliente: 'FONDO HOSPITAL DIPRECA', fecha: '2026-07-06 15:12', estado: 'Respondida' },
    { id: '948355-44-LP26', cliente: 'FONDO HOSPITAL DIPRECA', fecha: '2026-07-06 15:21', estado: 'Respondida' },
    { id: '1274285-26-LE26', cliente: 'CORSABER', fecha: '2026-06-12 12:59', estado: 'Respondida' }
  ];

  var HISTORIAL = [
    { id: '1057491-100-LP26', cliente: 'HOSPITAL LUIS CALVO MACKENNA', fecha: '2026-07-10 09:43', estado: 'Sin foro' },
    { id: '2307-21-LP26', cliente: 'I MUNICIPALIDAD DE OSORNO', fecha: '2026-07-10 09:43', estado: 'Sin mención' },
    { id: '1398-47-LE26', cliente: 'SERVICIO DE SALUD LIBERTADOR BDO OHIGGINS', fecha: '2026-07-10 09:43', estado: 'Sin foro' },
    { id: '3191-58-LE26', cliente: 'HOSPITAL NAVAL ALMIRANTE NEF', fecha: '2026-07-10 09:43', estado: 'Sin mención' },
    { id: '948355-44-LP26', cliente: 'FONDO HOSPITAL DIPRECA', fecha: '2026-07-06 15:21', estado: 'Respondida' },
    { id: '948355-44-LP26', cliente: 'FONDO HOSPITAL DIPRECA', fecha: '2026-07-06 15:12', estado: 'Respondida' },
    { id: '2777-10-LE26', cliente: 'I MUNICIPALIDAD DE RENGO', fecha: '2026-07-10 09:43', estado: 'Sin foro' },
    { id: '4309-139-LE26', cliente: 'HOSPITAL GUILLERMO GRANT BENAVENTE', fecha: '2026-07-10 09:43', estado: 'Sin mención' },
    { id: '1057494-37-LP26', cliente: 'HOSPITAL EXEQUIEL GONZALEZ CORTES', fecha: '2026-07-10 09:43', estado: 'Sin foro' }
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
  pintarCategoria('MEDIOS DE CULTIVO');

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
