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

  // La llave de sessionStorage. Se declara aquí arriba y no junto a las
  // funciones que la usan porque `recordado()` se llama en la comprobación del
  // token, que ocurre antes: con `var` la declaración se iza pero el valor no,
  // y abajo quedaba en undefined justo cuando hacía falta.
  var LLAVE = 'rendapps-cuenta-lista';

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
    // Lo más probable no es un enlace roto: es una recarga después de haber
    // creado la cuenta, porque el token se quita de la URL al validarlo. Si
    // esta pestaña ya lo hizo, se vuelve a pintar el final en vez de acusar
    // a un enlace que estaba bien.
    var antes = recordado();
    if (antes) {
      pintarListo(antes);
    } else {
      invalido(
        'Este enlace ya no lleva el código de activación. Si ya elegiste tu contraseña, ' +
        'entra a la aplicación con tu correo. Si todavía no la elegiste, ábrela desde la ' +
        'propia aplicación: pulsa «Activar cuenta», escribe tu correo y te llegará un código.'
      );
    }
    return;
  }

  // =========================================================================
  // La pantalla final
  //
  // Se pinta desde la respuesta de `activar-cuenta`, que trae de dónde bajar la
  // app: la última versión publicada de la que contrató. Antes esta pantalla
  // decía «ya puedes entrar a la aplicación» sin decir cuál ni dónde.
  // =========================================================================

  /**
   * Guarda el resultado para que una recarga no deje al cliente en blanco.
   *
   * El token se borra de la barra de direcciones en cuanto se valida, así que
   * al recargar no queda nada en la URL: sin esto, quien pulsa F5 justo después
   * de crear su cuenta veía «el enlace está incompleto», que es lo contrario de
   * lo que acababa de pasar.
   *
   * Va en sessionStorage y no en localStorage a propósito: es para esta pestaña
   * y este rato, no para siempre. Y no guarda nada secreto — el correo y una
   * URL de descarga pública.
   */
  function recordar(datos) {
    try {
      sessionStorage.setItem(LLAVE, JSON.stringify({
        email: datos.email || '',
        descarga: datos.descarga || null
      }));
    } catch (e) {
      // Navegador en privado o con el almacenamiento bloqueado. No pasa nada:
      // sólo se pierde la reconstrucción tras recargar.
    }
  }

  function recordado() {
    try {
      return JSON.parse(sessionStorage.getItem(LLAVE) || 'null');
    } catch (e) {
      return null;
    }
  }

  function pintarListo(datos) {
    var d = datos.descarga || null;

    $('.cuenta-email-final').textContent = datos.email || '';
    $('.cuenta-email-final2').textContent = datos.email || '';

    var caja = $('.cuenta-descarga');
    var falta = $('.cuenta-descarga-falta');
    var nota = $('.cuenta-descarga-nota');

    // El href se asigna, nunca se interpola en HTML, y sólo si es http(s): lo
    // que llega viene de la base, y un `javascript:` ahí sería un enlace que
    // ejecuta código con un solo clic. Una dirección que no pase el filtro cae
    // en la rama de «todavía no hay instalador», que es la verdad desde el
    // punto de vista de quien mira: no hay nada que pueda ofrecerle.
    //
    // `url` dice SI hay algo que ofrecer (una versión publicada); `enlace` es
    // adónde se manda a la persona: /descargar/<app> en nuestro propio dominio,
    // que resuelve la última versión y sirve el archivo. La dirección de GitHub
    // no llega nunca al navegador del cliente.
    var destino = (d && d.enlace) || '';
    var enlaceUsable = Boolean(d && d.url && /^https?:\/\//i.test(destino));

    if (enlaceUsable) {
      $('.cuenta-descarga-enlace').href = destino;
      $('.cuenta-descarga-app').textContent = d.appNombre || 'la aplicación';
      $('.cuenta-descarga-meta').textContent = [
        d.version ? 'Versión ' + d.version : '',
        pesoLegible(d.tamanoBytes)
      ].filter(Boolean).join(' · ');
      caja.hidden = false;
      falta.hidden = true;
    } else {
      $('.cuenta-descarga-app2').textContent = (d && d.appNombre) || 'tu aplicación';
      if (d && d.pagina && /^https?:\/\//i.test(d.pagina)) {
        $('.cuenta-descarga-pagina').href = d.pagina;
      }
      caja.hidden = true;
      falta.hidden = false;
    }

    // La nota del correo sólo se sostiene si hay algo que enviar.
    nota.hidden = !enlaceUsable;

    mostrarPaso('listo');
  }

  function pesoLegible(bytes) {
    if (!bytes || bytes <= 0) return '';
    var mb = bytes / (1024 * 1024);
    return mb >= 1
      ? mb.toFixed(1).replace('.', ',') + ' MB'
      : Math.max(1, Math.round(bytes / 1024)) + ' KB';
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
      // El nombre lo dio al contratar: se saluda con él en vez de volver a
      // pedirlo. Se usa textContent, nunca innerHTML: viene de un formulario.
      $('.cuenta-saludo').textContent = datos.nombre ? ', ' + datos.nombre : '';
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
        recordar(datos);
        pintarListo(datos);
      })
      .catch(function (error) {
        aviso.textContent = error.message || 'No pudimos crear tu cuenta. Inténtalo otra vez.';
        aviso.classList.add('visible');
        boton.disabled = false;
        boton.innerHTML = 'Crear mi cuenta <span class="btn-flecha" aria-hidden="true">→</span>';
      });
  });
})();
