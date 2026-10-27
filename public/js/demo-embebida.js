/* Demo de Leadyx y Gatheryx en su página de producto: el teléfono es la app
   real (/demo/<app>). Aquí sólo se quita el «Cargando…» y se reinicia. */
(function () {
  document.querySelectorAll('.de').forEach(function (escena) {
    var app = escena.querySelector('.de-app');
    var pantalla = escena.querySelector('.de-pantalla');
    if (!app || !pantalla) return;

    app.addEventListener('load', function () {
      pantalla.classList.add('de-listo');
      // En un teléfono no se ven barras de desplazamiento (misma página: se puede).
      try {
        var estilo = app.contentDocument.createElement('style');
        estilo.textContent = '*{scrollbar-width:none}*::-webkit-scrollbar{display:none}';
        app.contentDocument.head.appendChild(estilo);
      } catch (e) { /* sin acceso: se queda con sus barras */ }
    });

    var reiniciar = escena.querySelector('.de-reiniciar');
    if (reiniciar) {
      reiniciar.addEventListener('click', function () {
        pantalla.classList.remove('de-listo');
        app.src = app.getAttribute('data-inicio');
      });
    }
  });
})();
