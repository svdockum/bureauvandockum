// Stijlkiezer, mobiel menu en inkomende animatie voor de stijltest.
(function () {
  var root = document.documentElement;

  var stijlen = {
    'mix-a': 'Mix A: Raster met de ronde hoeken, pillen en markeerstift van Kaartenbak. Geen serif.',
    'mix-b': 'Mix B: Raster, zachte kaarten uit Kaartenbak, de luxe serif van Editoriaal alleen als cursief accent.',
    'mix-c': 'Mix C: het raster van Raster, de serif van Editoriaal voor alle koppen, ronde vormen en één diepgroen.',
    editoriaal: 'Warm papier, klassieke serif en één bordeaux accent. Als een monografie.',
    raster: 'Zwart-wit, zichtbaar raster en strakke grotesk. Zwitsers en tijdloos.',
    studio: 'Zacht wit, diepgroen en ronde vormen. Modern en vriendelijk, van zorgpraktijk tot webshop.',
    nachtblauw: 'Inktblauw, ivoor en messing. Ingetogen en exclusief.',
    kaartenbak: 'Nevelgroen, zwarte randen, markeerstift. Uit “Wat als ik later dood ben?”: eigenwijs en direct.'
  };

  // ---------- Stijlkiezer ----------
  var knoppen = document.querySelectorAll('[data-kies-stijl]');
  var uitleg = document.querySelector('.stijlkiezer-uitleg');

  function zetStijl(stijl, bewaar) {
    if (!stijlen[stijl]) stijl = 'raster';
    root.dataset.stijl = stijl;
    root.dataset.basis = stijl === 'raster' || stijl.indexOf('mix-') === 0 ? 'raster' : stijl;
    knoppen.forEach(function (knop) {
      var actief = knop.dataset.kiesStijl === stijl;
      knop.setAttribute('aria-pressed', String(actief));
      // Op een smal scherm scrolt de kiezer; houd de actieve knop in beeld.
      if (actief) knop.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    uitleg.textContent = stijlen[stijl];
    if (!bewaar) return;
    try { localStorage.setItem('bvd-stijl', stijl); } catch (e) { /* opslag niet beschikbaar */ }
    var url = new URL(location.href);
    url.searchParams.set('stijl', stijl);
    history.replaceState(null, '', url);
  }

  knoppen.forEach(function (knop) {
    knop.addEventListener('click', function () { zetStijl(knop.dataset.kiesStijl, true); });
  });
  zetStijl(root.dataset.stijl, false);

  // ---------- Mobiel menu ----------
  var header = document.querySelector('.site-header');
  var menuKnop = document.querySelector('.menu-knop');

  function zetMenu(open) {
    header.classList.toggle('is-open', open);
    menuKnop.setAttribute('aria-expanded', String(open));
  }

  menuKnop.addEventListener('click', function () {
    zetMenu(menuKnop.getAttribute('aria-expanded') !== 'true');
  });
  header.querySelectorAll('.nav-paneel a').forEach(function (link) {
    link.addEventListener('click', function () { zetMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      zetMenu(false);
      menuKnop.focus();
    }
  });

  // ---------- Inkomende animatie ----------
  var minderBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (minderBeweging || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('zichtbaar');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    observer.observe(el);
  });
  root.classList.add('reveal-aan');
})();
