// ===========================================================================
// Pantalla /crear-cuenta
//
// Sólo se llega aquí desde el retorno de Flow, con un token de un solo uso en
// la URL. Este archivo no decide nada sobre el acceso: se limita a preguntar
// por ese token a la Edge Function `activar-cuenta`, que es quien valida.
// ===========================================================================
(function () {
  var CONFIG = window.CONFIG_CUENTA || {};
  var raiz = document.getElementById('cuenta');
  if (!raiz) return;

  var $ = function (sel) { return raiz.querySelector(sel); };

  function mostrarPaso(nombre) {
    Array.prototype.forEach.call(raiz.querySelectorAll('.cuenta-paso'), function (p) {
      p.hidden = p.getAttribute('data-paso') !== nombre;
    });
  }

  function invalido(mensaje) {
    $('.cuenta-motivo').textContent = mensaje;
    mostrarPaso('invalido');
  }

  // El token viaja en la query. Se saca antes de nada para no dejarlo a la
  // vista más tiempo del necesario.
  var token = new URLSearchParams(window.location.search).get('t') || '';

  if (!CONFIG.urlActivarCuenta) {
    invalido('La activación en línea no está habilitada todavía. Escríbenos y lo resolvemos.');
    return;
  }
  if (!token) {
    invalido('El enlace está incompleto. Ábrelo tal cual te lo enviamos, sin recortarlo.');
    return;
  }

  function llamar(cuerpo) {
    return fetch(CONFIG.urlActivarCuenta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    }).then(function (r) {
      return r.json().then(function (datos) {
        if (!r.ok) throw new Error(datos && datos.error ? datos.error : 'HTTP ' + r.status);
        return datos;
      });
    });
  }

  // =========================================================================
  // 1. Validar el enlace y precargar el correo
  // =========================================================================

  llamar({ token: token, accion: 'consultar' })
    .then(function (datos) {
      $('#cuenta-email').value = datos.email || '';
      $('.cuenta-empresa').textContent = datos.empresa || 'tu empresa';
      mostrarPaso('formulario');
      $('#cuenta-password').focus();

      // Quita el token de la barra de direcciones: ya está en memoria y así no
      // queda en el historial ni se copia sin querer al compartir la URL.
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    })
    .catch(function (error) {
      invalido(error.message || 'No pudimos comprobar el enlace.');
    });

  // =========================================================================
  // 2. Fuerza de la contraseña (orientativa, no bloquea)
  // =========================================================================

  var campoClave = $('#cuenta-password');
  var campoClave2 = $('#cuenta-password2');
  var barra = $('.fuerza i');
  var textoFuerza = $('.fuerza-texto');

  var NIVELES = [
    { pct: 25, texto: 'Muy débil', color: '#DC2626' },
    { pct: 50, texto: 'Débil', color: '#F97316' },
    { pct: 75, texto: 'Aceptable', color: '#EAB308' },
    { pct: 100, texto: 'Fuerte', color: '#16A34A' }
  ];

  function medir(clave) {
    var puntos = 0;
    if (clave.length >= 8) puntos++;
    if (clave.length >= 12) puntos++;
    if (/[a-z]/.test(clave) && /[A-Z]/.test(clave)) puntos++;
    if (/\d/.test(clave) && /[^\w\s]/.test(clave)) puntos++;
    return Math.min(puntos, 4);
  }

  campoClave.addEventListener('input', function () {
    var clave = campoClave.value;
    campoClave.setAttribute('aria-invalid', 'false');

    if (!clave) {
      barra.style.width = '0';
      textoFuerza.textContent = '';
      return;
    }

    var nivel = NIVELES[Math.max(0, medir(clave) - 1)];
    barra.style.width = nivel.pct + '%';
    barra.style.background = nivel.color;
    textoFuerza.textContent = 'Seguridad: ' + nivel.texto;
    textoFuerza.style.color = nivel.color;
  });

  campoClave2.addEventListener('input', function () {
    campoClave2.setAttribute('aria-invalid', 'false');
  });

  // Mostrar / ocultar
  $('.campo-ojo').addEventListener('click', function () {
    var oculta = campoClave.type === 'password';
    campoClave.type = oculta ? 'text' : 'password';
    this.textContent = oculta ? 'Ocultar' : 'Mostrar';
    this.setAttribute('aria-label', oculta ? 'Ocultar la contraseña' : 'Mostrar la contraseña');
  });

  // =========================================================================
  // 3. Enviar
  // =========================================================================

  var formulario = $('#form-cuenta');
  var aviso = $('.modal-aviso');
  var boton = formulario.querySelector('button[type="submit"]');

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    aviso.classList.remove('visible');

    var clave = campoClave.value;
    var clave2 = campoClave2.value;

    if (clave.length < 8) {
      campoClave.setAttribute('aria-invalid', 'true');
      campoClave.focus();
      return;
    }
    if (clave !== clave2) {
      campoClave2.setAttribute('aria-invalid', 'true');
      campoClave2.focus();
      return;
    }

    boton.disabled = true;
    boton.textContent = 'Creando tu cuenta…';

    llamar({ token: token, accion: 'activar', password: clave })
      .then(function (datos) {
        $('.cuenta-email-final').textContent = datos.email || '';
        mostrarPaso('listo');
      })
      .catch(function (error) {
        aviso.textContent = error.message || 'No pudimos crear tu cuenta. Inténtalo otra vez.';
        aviso.classList.add('visible');
        boton.disabled = false;
        boton.innerHTML = 'Crear mi cuenta <span class="btn-flecha" aria-hidden="true">→</span>';
      });
  });
})();
