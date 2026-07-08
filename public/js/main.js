// Menú móvil, sombra de cabecera y animaciones de aparición
(function () {
  document.documentElement.classList.add('js');

  // --- Menú móvil ---
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierta');
      menuBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) {
        nav.classList.remove('abierta');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Sombra de la cabecera al hacer scroll ---
  var cabecera = document.getElementById('cabecera');
  if (cabecera) {
    var actualizarSombra = function () {
      cabecera.classList.toggle('con-sombra', window.scrollY > 8);
    };
    actualizarSombra();
    window.addEventListener('scroll', actualizarSombra, { passive: true });
  }

  // --- Aparición discreta de secciones (reveal) ---
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  reveals.forEach(function (el, i) {
    // Pequeño escalonado entre elementos hermanos para que la entrada sea suave
    el.style.transitionDelay = Math.min(i % 6, 4) * 60 + 'ms';
    observador.observe(el);
  });
})();
