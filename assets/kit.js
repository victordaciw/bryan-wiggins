/* Trench kit: one-time arrival for .tk sections that contain .tk-rise elements.
   Fade up once when the section enters the viewport, then the classes come off and the section is plain again. */
(function () {
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce || !('IntersectionObserver' in window)) return;
  [].forEach.call(document.querySelectorAll('section.tk'), function (sec) {
    if (!sec.querySelector('.tk-rise') || sec.getAttribute('data-tk')) return;
    sec.setAttribute('data-tk', '1');
    sec.classList.add('tk--armed');
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        io.disconnect();
        sec.classList.add('tk--in');
        setTimeout(function () { sec.classList.remove('tk--armed', 'tk--in'); }, 2200);
        return;
      }
    }, { threshold: 0.12 });
    io.observe(sec);
  });
})();

/* Trench kit: equal-width heading lines (.tk-fit > span). Each line's --k is measured from the real text,
   so every line fills the heading's width exactly (the hero / pricing look). CSS keeps a fallback --k. */
(function () {
  function fit() {
    [].forEach.call(document.querySelectorAll('.tk-fit > span'), function (s) {
      var d = s.style.display, f = s.style.fontSize;
      s.style.display = 'inline-block'; s.style.fontSize = '100px';
      var w = s.getBoundingClientRect().width;
      s.style.display = d; s.style.fontSize = f;
      if (w > 0) s.style.setProperty('--k', (w / 100).toFixed(4));
    });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
})();
