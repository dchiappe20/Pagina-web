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

// Animación de títulos: entrada palabra por palabra (h1 y h2 del sitio)
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  function envolver(el) {
    var nodos = Array.prototype.slice.call(el.childNodes);
    nodos.forEach(function (n) { el.removeChild(n); });
    nodos.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (trozo) {
          if (!trozo) return;
          if (/^\s+$/.test(trozo)) { el.appendChild(document.createTextNode(' ')); return; }
          var caja = document.createElement('span');
          caja.className = 'palabra';
          var interior = document.createElement('span');
          interior.textContent = trozo;
          caja.appendChild(interior);
          el.appendChild(caja);
        });
      } else {
        var caja = document.createElement('span');
        caja.className = 'palabra';
        var interior = document.createElement('span');
        interior.appendChild(n);
        caja.appendChild(interior);
        el.appendChild(caja);
      }
    });
    var internos = el.querySelectorAll('.palabra > span');
    Array.prototype.forEach.call(internos, function (s, i) {
      s.style.animationDelay = (i * 0.07) + 's';
    });
    el.classList.add('titulo-anim');
  }

  var observadorTitulos = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('titulo-visible');
        observadorTitulos.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.3 });

  var titulos = document.querySelectorAll('#contenido h1, #contenido h2');
  Array.prototype.forEach.call(titulos, function (t) {
    if (t.closest('.demo')) return;
    envolver(t);
    observadorTitulos.observe(t);
  });
})();
