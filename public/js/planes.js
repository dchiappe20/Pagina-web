// ===========================================================================
// Página de Planes
//
// Aquí no se calcula ningún precio. El plan se anuncia en UF y el cobro lo
// hace Flow con la UF del día del cargo; la conversión a pesos que este
// archivo pintaba se quitó porque mostraba una cifra que cambiaba a diario y
// que casi nunca coincidía con la cobrada.
// ===========================================================================
(function () {
  var CONFIG = window.CONFIG_PLANES || {};

  // =========================================================================
  // 1. RUT chileno
  //
  // Misma lógica que Themein (src/lib/rut.js) y que core.rut_valido() en la
  // base de datos. Aquí sólo da feedback inmediato: la fuente de verdad es
  // Postgres, que vuelve a validarlo al aprovisionar.
  // =========================================================================

  function limpiarRut(valor) {
    return String(valor == null ? '' : valor).replace(/[^0-9kK]/g, '').toUpperCase();
  }

  function digitoVerificador(cuerpo) {
    var suma = 0;
    var multiplicador = 2;

    for (var i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    var resto = 11 - (suma % 11);
    if (resto === 11) return '0';
    if (resto === 10) return 'K';
    return String(resto);
  }

  /** Formato canónico que espera la base de datos: `12345678-9`. */
  function normalizarRut(valor) {
    var limpio = limpiarRut(valor);
    if (limpio.length < 2) return limpio;
    var cuerpo = limpio.slice(0, -1).replace(/^0+/, '') || '0';
    return cuerpo + '-' + limpio.slice(-1);
  }

  /** Formato para mostrar, con puntos: `12.345.678-9`. */
  function formatearRut(valor) {
    var limpio = limpiarRut(valor);
    if (limpio.length < 2) return limpio;
    var cuerpo = limpio.slice(0, -1).replace(/^0+/, '') || '0';
    return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + limpio.slice(-1);
  }

  function rutValido(valor) {
    var limpio = limpiarRut(valor);
    if (limpio.length < 7 || limpio.length > 9) return false;

    var cuerpo = limpio.slice(0, -1);
    var dv = limpio.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;

    return digitoVerificador(cuerpo) === dv;
  }

  // =========================================================================
  // 2. Pestañas de producto
  //
  // Cambiar de pestaña actualiza la URL con `?app=`, sin recargar: así el
  // enlace se puede copiar y compartir, y el botón «atrás» del navegador hace
  // lo que se espera.
  // =========================================================================

  var pestanas = document.querySelectorAll('.pestana');
  var paneles = document.querySelectorAll('.planes-panel');

  function mostrarApp(id, actualizarUrl) {
    var existe = false;

    Array.prototype.forEach.call(paneles, function (panel) {
      var suyo = panel.id === 'panel-' + id;
      if (suyo) existe = true;
      panel.hidden = !suyo;
    });

    if (!existe) return;

    Array.prototype.forEach.call(pestanas, function (p) {
      var activa = p.getAttribute('data-app') === id;
      p.classList.toggle('activa', activa);
      p.setAttribute('aria-selected', activa ? 'true' : 'false');
    });

    if (actualizarUrl && window.history && window.history.replaceState) {
      window.history.replaceState({}, '', '?app=' + id);
    }
  }

  Array.prototype.forEach.call(pestanas, function (p) {
    p.addEventListener('click', function () {
      mostrarApp(p.getAttribute('data-app'), true);
    });
  });

  // Un enlace con hash (#plan-gatheryx-anual) abre su pestaña y baja hasta él.
  if (window.location.hash) {
    var destino = document.querySelector(window.location.hash);
    if (destino) {
      var panel = destino.closest ? destino.closest('.planes-panel') : null;
      if (panel) {
        mostrarApp(panel.id.replace('panel-', ''), false);
        destino.scrollIntoView({ block: 'center' });
      }
    }
  }

  // =========================================================================
  // 3. Modal de alta
  // =========================================================================

  var modal = document.getElementById('modal-alta');
  var formulario = document.getElementById('form-alta');
  if (!modal || !formulario) return;

  var aviso = modal.querySelector('.modal-aviso');
  var etiquetaPlan = modal.querySelector('.modal-plan');
  var botonEnviar = formulario.querySelector('.modal-enviar');
  var planActual = null;   // código de app: filt | gatheryx | leads
  var nivelActual = null;  // código del nivel dentro de esa app
  var ultimoFoco = null;

  function abrirModal(boton) {
    planActual = boton.getAttribute('data-plan');
    nivelActual = boton.getAttribute('data-nivel');
    etiquetaPlan.textContent = boton.getAttribute('data-plan-nombre');
    ultimoFoco = boton;

    aviso.classList.remove('visible');
    modal.hidden = false;
    modal.classList.add('abierto');
    // La clase, además de bloquear el scroll, pausa las animaciones de fondo
    // (ver planes.css): con el modal abierto no se ven y sólo gastan CPU.
    document.body.classList.add('modal-abierto');
    document.body.style.overflow = 'hidden';
    formulario.querySelector('#alta-nombre').focus();
  }

  function cerrarModal() {
    modal.classList.remove('abierto');
    modal.hidden = true;
    document.body.classList.remove('modal-abierto');
    document.body.style.overflow = '';
    if (ultimoFoco) ultimoFoco.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.plan-cta'), function (boton) {
    boton.addEventListener('click', function () { abrirModal(boton); });
  });

  modal.querySelector('.modal-cerrar').addEventListener('click', cerrarModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('abierto')) cerrarModal();
  });

  // Formatea el RUT mientras se escribe, sin estorbar al borrar.
  var campoRut = document.getElementById('alta-rut');
  campoRut.addEventListener('input', function () {
    var limpio = limpiarRut(campoRut.value);
    if (limpio.length >= 2) campoRut.value = formatearRut(limpio);
    campoRut.setAttribute('aria-invalid', 'false');
  });

  // =========================================================================
  // 4. Validación y envío
  // =========================================================================

  function marcar(campo, ok) {
    campo.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  function validar(datos) {
    // Nombre y apellido se validan por separado: son dos campos y cada uno
    // marca su propio error. La regla de "tiene que llevar un espacio" que
    // había antes sobra, y dejaba fuera a quien escribía sólo su nombre.
    var okNombre = marcar(formulario.nombre, datos.nombre.length >= 2);
    var okApellido = marcar(formulario.apellido, datos.apellido.length >= 2);
    var okCorreo = marcar(formulario.correo, /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo));
    var okEmpresa = marcar(formulario.empresa, datos.empresa.length >= 2);
    var okRut = marcar(formulario.rut, rutValido(datos.rut));

    return okNombre && okApellido && okCorreo && okEmpresa && okRut;
  }

  function mostrarError(mensaje) {
    aviso.textContent = mensaje;
    aviso.classList.add('visible');
  }

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    aviso.classList.remove('visible');

    var datos = {
      nombre: formulario.nombre.value.trim(),
      apellido: formulario.apellido.value.trim(),
      correo: formulario.correo.value.trim().toLowerCase(),
      empresa: formulario.empresa.value.trim(),
      rut: normalizarRut(formulario.rut.value),
      app: planActual,
      plan: nivelActual
    };

    if (!validar(datos)) {
      mostrarError('Revisa los campos marcados en rojo.');
      return;
    }

    if (!CONFIG.urlCrearSuscripcion) {
      mostrarError('La contratación en línea todavía no está habilitada. Escríbenos y lo activamos contigo.');
      return;
    }

    botonEnviar.disabled = true;
    botonEnviar.textContent = 'Conectando con Flow…';

    fetch(CONFIG.urlCrearSuscripcion, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (r) {
        return r.json().then(function (cuerpo) {
          if (!r.ok) throw new Error(cuerpo && cuerpo.error ? cuerpo.error : 'HTTP ' + r.status);
          return cuerpo;
        });
      })
      .then(function (respuesta) {
        if (!respuesta.urlRegistro) throw new Error('Flow no devolvió la URL de registro.');
        // A partir de aquí manda Flow: el registro de la tarjeta ocurre en su
        // sitio, nunca en el nuestro.
        window.location.href = respuesta.urlRegistro;
      })
      .catch(function (error) {
        mostrarError(error.message || 'No pudimos conectar con Flow. Inténtalo de nuevo en unos minutos.');
        botonEnviar.disabled = false;
        botonEnviar.innerHTML = 'Continuar al registro de tarjeta <span class="btn-flecha" aria-hidden="true">→</span>';
      });
  });
})();
