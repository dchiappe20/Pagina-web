// Menú móvil y submenús desplegables
(function () {
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierta');
      menuBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  var items = document.querySelectorAll('.con-sub');

  // Cierra todos los submenús menos el que se indique
  function cerrarTodos(excepto) {
    items.forEach(function (item) {
      if (item !== excepto) {
        item.classList.remove('abierto');
        var enlace = item.querySelector('a');
        if (enlace) enlace.setAttribute('aria-expanded', 'false');
      }
    });
  }

  items.forEach(function (item) {
    var enlace = item.querySelector('a');
    if (!enlace) return;
    enlace.setAttribute('aria-expanded', 'false');

    // El primer clic abre el submenú; el segundo lo cierra.
    enlace.addEventListener('click', function (evento) {
      evento.preventDefault();
      var abierto = item.classList.toggle('abierto');
      enlace.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      if (abierto) cerrarTodos(item);
    });
  });

  // Cerrar al hacer clic fuera del menú
  document.addEventListener('click', function (evento) {
    if (!evento.target.closest('.con-sub')) cerrarTodos(null);
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') cerrarTodos(null);
  });
})();
