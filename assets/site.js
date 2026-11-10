/* In The Trench with Bryan Wiggins: site behaviour (v1).
   Menu, background particles, the Trench Curve, forms, footer year.
   The one-time arrival of .tk-rise blocks is kit.js (it already respects reduced motion). */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var each = function (sel, fn, scope) { Array.prototype.forEach.call((scope || doc).querySelectorAll(sel), fn); };

  /* ---------- footer year ---------- */
  each('[data-year]', function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- mobile menu: the primary <nav> becomes a full-screen panel under the header ---------- */
  (function () {
    var btn = doc.querySelector('.bw-menu-btn'), nav = doc.getElementById('bw-nav'), hdr = doc.querySelector('.bw-hdr');
    if (!btn || !nav || !hdr) return;
    var mq = window.matchMedia('(max-width: 1180px)');
    var open = false;
    function place() { nav.style.setProperty('--bw-menu-top', Math.max(0, Math.round(hdr.getBoundingClientRect().bottom)) + 'px'); }
    function set(o, refocus) {
      open = o;
      if (o) place();
      nav.classList.toggle('is-open', o);
      root.classList.toggle('bw-menu-open', o);
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
      if (o) { var first = nav.querySelector('a'); if (first) setTimeout(function () { first.focus(); }, 30); }
      else if (refocus) btn.focus();
    }
    btn.addEventListener('click', function () { set(!open, true); });
    each('a', function (a) { a.addEventListener('click', function () { if (open) set(false, false); }); }, nav);
    doc.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); set(false, true); return; }
      if (e.key !== 'Tab') return;
      /* keep focus inside the open menu (the toggle button + the panel links) */
      var items = [btn].concat(Array.prototype.slice.call(nav.querySelectorAll('a')));
      var i = items.indexOf(doc.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
    var onChange = function () { if (!mq.matches && open) set(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    window.addEventListener('resize', function () { if (open) place(); });
  })();

  /* ---------- background particles (the TMS canvas: a gold dot field, visible toward the edges) ---------- */
  (function () {
    var cv = doc.getElementById('bw-particles');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), GAP = 50, W = 0, H = 0, cols = 0, rows = 0, pts = [], raf = 0;
    function build() {
      var c = Math.max(40, Math.ceil(W / GAP) + 2), r = Math.max(25, Math.ceil(H / GAP) + 2);
      if (c === cols && r === rows) return;
      cols = c; rows = r; pts = [];
      for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) pts.push({ x: i * GAP, y: j * GAP, on: Math.random() > 0.3 });
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var ox = (W - cols * GAP) / 2, oy = (H - rows * GAP) / 2;
      ctx.fillStyle = '#8b6b15';
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        if (!p.on) continue;
        var x = p.x + ox + Math.cos(t * 0.0015 + p.y * 0.005) * 10;
        var y = p.y + oy + Math.sin(t * 0.001 + p.x * 0.005) * 15;
        if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
        var a = Math.pow(Math.abs(x / W - 0.5) * 2, 2.5);
        if (a <= 0.05) continue;
        ctx.globalAlpha = a * 0.7;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    size();
    if (reduce) {
      draw(0);
      window.addEventListener('resize', function () { size(); draw(0); });
      return;
    }
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', size);
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(loop);
    });
  })();

  /* ---------- the Trench Curve: points are tabs, the steps below are their panels ---------- */
  each('[data-curve]', function (c, n) {
    var pts = Array.prototype.slice.call(c.querySelectorAll('.bw-pt'));
    var steps = Array.prototype.slice.call(c.querySelectorAll('.bw-curve-step'));
    var count = Math.min(pts.length, steps.length);
    if (!count) return;
    var idx = c.querySelector('[data-curve-idx]'), cur = -1;
    var wrap = c.querySelector('.bw-curve-pts'), list = c.querySelector('.bw-curve-steps');
    var uid = 'bw-curve-' + n;
    if (wrap) { wrap.setAttribute('role', 'tablist'); wrap.setAttribute('aria-label', 'Points on the Trench Curve'); }
    if (list) list.removeAttribute('aria-live');
    for (var i = 0; i < count; i++) {
      pts[i].id = uid + '-tab-' + i; steps[i].id = uid + '-panel-' + i;
      pts[i].setAttribute('role', 'tab'); pts[i].setAttribute('aria-controls', steps[i].id);
      steps[i].setAttribute('role', 'tabpanel'); steps[i].setAttribute('aria-labelledby', pts[i].id);
    }
    function show(i, focus) {
      i = (i + count) % count;
      if (i === cur) { if (focus) pts[i].focus(); return; }
      cur = i;
      for (var j = 0; j < count; j++) {
        var on = j === i;
        pts[j].classList.toggle('is-on', on);
        pts[j].setAttribute('aria-selected', on ? 'true' : 'false');
        pts[j].tabIndex = on ? 0 : -1;
        steps[j].classList.toggle('is-on', on);
      }
      if (idx) idx.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      if (focus) pts[i].focus();
    }
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    pts.forEach(function (p, i) {
      p.addEventListener('click', function () { show(i); });
      if (fine) p.addEventListener('mouseenter', function () { show(i); });
      p.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); show(i + 1, true); }
        else if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); show(i - 1, true); }
        else if (k === 'Home') { e.preventDefault(); show(0, true); }
        else if (k === 'End') { e.preventDefault(); show(count - 1, true); }
      });
    });
    var prev = c.querySelector('[data-curve-prev]'), next = c.querySelector('[data-curve-next]');
    if (prev) prev.addEventListener('click', function () { show(cur - 1); });
    if (next) next.addEventListener('click', function () { show(cur + 1); });
    c.classList.add('is-live');
    show(0);

    /* the line draws itself once, the first time the curve comes into view */
    if (!reduce && 'IntersectionObserver' in window) {
      c.classList.add('is-armed');
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        requestAnimationFrame(function () { c.classList.add('is-drawn'); });
        setTimeout(function () { c.classList.remove('is-armed', 'is-drawn'); }, 2400);
      }, { threshold: 0.35 });
      io.observe(c);
    }
  });

  /* ---------- forms: validate on the client, then show the confirmation. Nothing is sent anywhere (v1).
     TODO GHL form: wire each form[data-form] to GoHighLevel. ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function bad(el) {
    var v = (el.value || '').trim();
    if (el.type === 'checkbox') return !el.checked;
    if (!v) return true;
    if (el.type === 'email' && !EMAIL.test(v)) return true;
    return false;
  }
  function mark(el, on) {
    var field = el.closest('.bw-field') || el.parentNode;
    field.classList.toggle('is-invalid', on);
    if (on) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }
  each('form[data-form]', function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      each('[required]', function (el) { var b = bad(el); mark(el, b); if (b && !first) first = el; }, f);
      if (first) { first.focus(); return; }
      var ok = doc.getElementById(f.getAttribute('data-form') + '-ok');
      f.hidden = true;
      if (ok) { ok.hidden = false; ok.focus(); }
    });
    each('[required]', function (el) {
      var clear = function () { if (!bad(el)) mark(el, false); };
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
    }, f);
  });
})();
