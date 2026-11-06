/* Адвокат Куржикаев - лэндинг «Обвинение без опоры». RU/KZ, сцена героя, плавная прокрутка, лид-форма -> WhatsApp. */
(function () {
  'use strict';

  var PHONE = '77003091494';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  /* ---------- i18n ---------- */
  var META = {
    ru: { title: document.title, desc: (document.querySelector('meta[name="description"]') || {}).content || '' },
    kk: null
  };
  var KK = {};
  var current = 'ru';
  var ruStore = {}, ruAttr = {};

  function captureRu() {
    document.querySelectorAll('[data-i18n]').forEach(function (el, i) {
      el.setAttribute('data-i18n-id', i);
      ruStore[i] = el.innerHTML;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el, i) {
      el.setAttribute('data-i18n-ph-id', i);
      ruAttr[i] = el.getAttribute('placeholder') || '';
    });
  }

  /* версия kk.js - из ?v= самого script.js, бампается вместе с остальными ассетами */
  var SELF = document.currentScript && document.currentScript.src;
  var VER = ((SELF || '').match(/[?&]v=([^&]+)/) || [])[1] || '';
  var kkLoading = null;
  function loadKK(cb) {
    if (window.SITE_KK) {
      META.kk = window.SITE_KK.meta; KK = window.SITE_KK.dict;
      return cb();
    }
    if (!kkLoading) {
      kkLoading = [];
      var sc = document.createElement('script');
      sc.src = 'assets/lang/kk.js' + (VER ? '?v=' + VER : '');
      sc.onload = function () { var q = kkLoading; kkLoading = null; q.forEach(function (f) { loadKK(f); }); };
      sc.onerror = function () { kkLoading = null; };
      document.head.appendChild(sc);
    }
    kkLoading.push(cb);
  }

  function applyLang(lang) {
    if (lang === 'kk' && !window.SITE_KK) { loadKK(function () { applyLang('kk'); }); return; }
    current = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (lang === 'ru') {
        el.innerHTML = ruStore[el.getAttribute('data-i18n-id')];
      } else {
        var key = el.getAttribute('data-i18n');
        if (KK[key] !== undefined) el.innerHTML = KK[key];
      }
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      if (lang === 'ru') el.setAttribute('placeholder', ruAttr[el.getAttribute('data-i18n-ph-id')]);
      else { var k = el.getAttribute('data-i18n-ph'); if (KK[k] !== undefined) el.setAttribute('placeholder', KK[k]); }
    });
    document.documentElement.lang = lang === 'kk' ? 'kk' : 'ru';
    if (META[lang]) {
      document.title = META[lang].title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', META[lang].desc);
    }
    document.querySelectorAll('.lang button').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  /* ---------- Плавная прокрутка (Lenis + GSAP) ---------- */
  var lenis = null;
  function initScroll() {
    if (!hasGsap) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
  function scrollToEl(el) {
    var off = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 72) - 12;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.1 });
    else {
      var y = el.getBoundingClientRect().top + window.scrollY + off;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  /* ---------- Сцена героя: «обвинение без опоры» ---------- */
  var scene = {
    svg: null, tower: null, blocks: [], plate: null, tl: null, built: false, mobile: false, geo: null
  };
  var NS = 'http://www.w3.org/2000/svg';
  function mk(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function dataText(key) {
    var li = document.querySelector('.sc-data [data-i18n="' + key + '"]');
    return li ? li.textContent : '';
  }
  var REMOVE = [ { i: 1, tag: 'sc_t1' }, { i: 3, tag: 'sc_t3' }, { i: 0, tag: 'sc_t0' }, { i: 5, tag: 'sc_t5' } ];

  function sceneGeo(mobile) {
    return mobile
      ? { vw: 400, vh: 440, table: 340, x: 24, W: 236, H: 40, gap: 5, PH: 50, sheetH: 112, counterY: 410 }
      : { vw: 640, vh: 560, table: 440, x: 36, W: 300, H: 46, gap: 6, PH: 58, sheetH: 134, counterY: 520 };
  }

  function buildScene() {
    var svg = document.getElementById('sceneSvg');
    if (!svg) return;
    var mobile = window.innerWidth <= 760;
    var g = sceneGeo(mobile);
    scene.svg = svg; scene.mobile = mobile; scene.geo = g;
    svg.setAttribute('viewBox', '0 0 ' + g.vw + ' ' + g.vh);

    /* стол */
    var table = document.getElementById('scTable');
    var rects = table.querySelectorAll('rect');
    rects[0].setAttribute('y', g.table); rects[0].setAttribute('width', g.vw); rects[0].setAttribute('height', 34);
    rects[1].setAttribute('y', g.table + 34); rects[1].setAttribute('width', g.vw); rects[1].setAttribute('height', g.vh - g.table - 34);
    var ell = table.querySelector('ellipse');
    ell.setAttribute('cx', g.x + g.W / 2); ell.setAttribute('cy', g.table + 2); ell.setAttribute('rx', g.W * 0.62);

    /* башня */
    var tower = document.getElementById('scTower');
    tower.innerHTML = '';
    scene.blocks = [];
    for (var i = 0; i < 6; i++) {
      var y = g.table - (i + 1) * g.H - i * g.gap;
      var grp = mk('g', { 'data-block': i }, tower);
      mk('rect', { x: g.x, y: y, width: g.W, height: g.H, rx: 4, fill: '#fff', filter: 'url(#sh)' }, grp);
      mk('rect', { x: g.x, y: y, width: 4, height: g.H, rx: 2, fill: '#CFD7E2' }, grp);
      var t = mk('text', { x: g.x + 18, y: y + g.H / 2 + 4.5, 'class': 'sc-block', 'data-key': 'sc_b' + i }, grp);
      t.textContent = dataText('sc_b' + i);
      /* красная линия карандаша под подписью */
      var ux = g.x + 16, uy = y + g.H - 9, uw = g.W - 60;
      var p = mk('path', {
        d: 'M' + ux + ' ' + uy + ' q ' + (uw * 0.3) + ' 3 ' + (uw * 0.55) + ' 0 t ' + (uw * 0.45) + ' -1',
        fill: 'none', stroke: '#B8322A', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'class': 'sc-under'
      }, grp);
      var len = 420; p.setAttribute('stroke-dasharray', len); p.setAttribute('stroke-dashoffset', len);
      /* бирка - заполняется при сборке таймлайна */
      var tag = mk('g', { 'class': 'sc-tagg', opacity: 0 }, grp);
      scene.blocks.push({ el: grp, y: y, under: p, tag: tag, text: t });
    }
    /* плита «Обвинение» */
    var py = g.table - 6 * g.H - 5 * g.gap - g.gap - g.PH;
    var plate = mk('g', { 'data-plate': 1 }, tower);
    mk('rect', { x: g.x - 6, y: py, width: g.W + 12, height: g.PH, rx: 5, fill: '#0F1D36', filter: 'url(#sh2)' }, plate);
    var pt = mk('text', { x: g.x + 18, y: py + g.PH / 2 + 7, 'class': 'sc-plate-t', 'data-key': 'sc_plate' }, plate);
    pt.textContent = dataText('sc_plate');
    scene.plate = { el: plate, y: py };

    /* бирки */
    REMOVE.forEach(function (r) {
      var b = scene.blocks[r.i];
      var tg = b.tag; tg.innerHTML = '';
      var rect = mk('rect', { rx: 12, height: 24, fill: '#fff', stroke: '#B8322A', 'stroke-width': 1.4 }, tg);
      var tx = mk('text', { 'class': 'sc-tag', 'data-key': r.tag }, tg);
      tx.textContent = dataText(r.tag);
      b.tagRect = rect; b.tagText = tx;
    });
    layoutTags();

    /* лист «Дело прекращено» на месте верха башни из двух блоков */
    var sheet = document.getElementById('scSheet');
    var sy = g.table - 2 * g.H - g.gap - g.gap - g.sheetH;
    var sr = sheet.querySelector('rect');
    sr.setAttribute('x', g.x); sr.setAttribute('y', sy); sr.setAttribute('width', g.W); sr.setAttribute('height', g.sheetH);
    var sp = sheet.querySelector('path');
    sp.setAttribute('d', 'M' + (g.x + 22) + ' ' + (sy + 34) + ' q 70 -3 130 0 t ' + (g.W - 180) + ' 0');
    var texts = sheet.querySelectorAll('text');
    var fs = mobile ? [22, 13, 11.5] : [26, 14, 12];
    texts[0].setAttribute('x', g.x + 22); texts[0].setAttribute('y', sy + 64); texts[0].style.fontSize = fs[0] + 'px';
    texts[1].setAttribute('x', g.x + 22); texts[1].setAttribute('y', sy + 88); texts[1].style.fontSize = fs[1] + 'px';
    texts[2].setAttribute('x', g.x + 22); texts[2].setAttribute('y', sy + (mobile ? 106 : 114)); texts[2].style.fontSize = fs[2] + 'px';
    scene.sheet = sheet;

    var cnt = document.querySelector('#scCounter text');
    cnt.setAttribute('x', g.x); cnt.setAttribute('y', g.counterY);
    document.getElementById('scTo').textContent = '6';
    scene.built = true;
  }

  function layoutTags() {
    var g = scene.geo;
    /* бирка справа от своего блока, по его середине: не заходит на соседние блоки;
       не влезает в сцену по ширине - переносится в две строки */
    REMOVE.forEach(function (r) {
      var b = scene.blocks[r.i];
      if (!b.tagText) return;
      /* бирка цепляется за правый край своего блока: заходит на него, но не на подпись */
      var te = g.x + 18 + 150;
      try { te = g.x + 18 + b.text.getComputedTextLength(); } catch (e) {}
      var lx = Math.round(Math.max(g.x + g.W - 30, te + 10)), maxW = g.vw - lx - 6;
      var full = dataText(r.tag), t = b.tagText;
      while (t.firstChild) t.removeChild(t.firstChild);
      t.textContent = full;
      var w = 120;
      try { w = t.getComputedTextLength(); } catch (e) {}
      var lines = [full];
      if (w + 22 > maxW && full.indexOf(' ') > 0) {
        var words = full.split(' '), best = 1, bestD = 1e9;
        for (var k = 1; k < words.length; k++) {
          var d = Math.abs(words.slice(0, k).join(' ').length - words.slice(k).join(' ').length);
          if (d < bestD) { bestD = d; best = k; }
        }
        lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
      }
      t.textContent = '';
      var lw = 0;
      lines.forEach(function (ln, n) {
        var ts = mk('tspan', { x: lx + 11, dy: n ? 15 : 0 }, t);
        ts.textContent = ln;
        try { lw = Math.max(lw, ts.getComputedTextLength()); } catch (e) { lw = Math.max(lw, ln.length * 6.5); }
      });
      var th = lines.length > 1 ? 40 : 24;
      var tw = Math.round(Math.min(lw + 22, Math.max(maxW, lw + 22)));
      var ty = Math.round(b.y + (g.H - th) / 2);
      b.tagRect.setAttribute('x', lx); b.tagRect.setAttribute('y', ty);
      b.tagRect.setAttribute('width', tw); b.tagRect.setAttribute('height', th);
      t.setAttribute('x', lx + 11); t.setAttribute('y', ty + 16);
      b.tag.setAttribute('transform', 'rotate(-2 ' + lx + ' ' + (ty + th / 2) + ')');
    });
  }

  function refreshSceneTexts() {
    if (!scene.built) return;
    scene.svg.querySelectorAll('[data-key]').forEach(function (t) { t.textContent = dataText(t.getAttribute('data-key')); });
    layoutTags();
  }

  var replayBtn = null;
  function buildTimeline() {
    if (!hasGsap || !scene.built) return null;
    var g = scene.geo, step = g.H + g.gap;
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    var blocks = scene.blocks, plate = scene.plate;
    var from = document.getElementById('scFrom'), to = document.getElementById('scTo');

    /* 0. сброс */
    tl.set(blocks.map(function (b) { return b.el; }).concat([plate.el]), { x: 0, y: 0, rotation: 0, opacity: 1 });
    tl.set(blocks.map(function (b) { return b.under; }), { strokeDashoffset: 420 });
    tl.set(blocks.map(function (b) { return b.tag; }), { opacity: 0 });
    tl.set(scene.sheet, { opacity: 0, y: 40 });
    tl.call(function () { to.textContent = '6'; from.textContent = '6'; });

    /* 1. башня собирается сверху вниз - коротко */
    tl.from(blocks.map(function (b) { return b.el; }), { y: -40, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' }, 0.15);
    tl.from(plate.el, { y: -60, opacity: 0, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.2');

    /* 2. выемка четырёх опор */
    var present = [0, 1, 2, 3, 4, 5];
    REMOVE.forEach(function (r, k) {
      var b = blocks[r.i];
      tl.to(b.under, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, '+=' + (k === 0 ? 0.9 : 0.45));
      tl.to(b.tag, { opacity: 1, duration: 0.3 }, '-=0.25');
      tl.to(b.el, { x: g.W + 90, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.35');
      var pos = present.indexOf(r.i);
      var above = present.slice(pos + 1).map(function (i) { return blocks[i].el; }).concat([plate.el]);
      present.splice(pos, 1);
      tl.to(above, { y: '+=' + step, duration: 0.55, ease: 'back.out(1.7)', stagger: 0.045 }, '-=0.12');
      tl.call(function () {
        to.textContent = String(6 - k - 1);
        if (hasGsap) gsap.fromTo(to, { scale: 1.5, transformOrigin: 'center' }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
      });
    });

    /* 3. плита теряет опору */
    tl.to(plate.el, { rotation: -5, transformOrigin: 'left bottom', duration: 0.5, ease: 'power2.inOut' }, '+=0.45');
    tl.to(plate.el, { x: g.W + 120, y: '+=' + (g.vh * 0.55), rotation: 26, opacity: 0, duration: 0.95, ease: 'power2.in' }, '+=0.1');
    tl.to(scene.sheet, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
    tl.call(function () { if (replayBtn) replayBtn.hidden = false; });
    return tl;
  }

  function initScene() {
    var box = document.getElementById('scene');
    if (!box) return;
    replayBtn = document.getElementById('scReplay');
    buildScene();
    if (!hasGsap) { /* без GSAP - конечное состояние */ finalState(); return; }
    scene.tl = buildTimeline();
    if (reduce) { scene.tl.progress(1); return; }

    var started = false;
    function start() {
      if (started) return; started = true;
      scene.tl.delay(0.6).play();
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { start(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(box);
    } else start();

    replayBtn.addEventListener('click', function () {
      replayBtn.hidden = true;
      scene.tl.restart();
    });

    /* пересборка при смене ширины (десктоп <-> телефон) */
    var lastMobile = scene.mobile;
    window.addEventListener('resize', function () {
      var m = window.innerWidth <= 760;
      if (m === lastMobile) return;
      lastMobile = m;
      var p = scene.tl.progress();
      scene.tl.kill();
      buildScene();
      scene.tl = buildTimeline();
      scene.tl.progress(p >= 0.98 ? 1 : p);
      if (p < 0.98 && started) scene.tl.play();
    });

    /* параллакс слоёв от скролла - только на широком экране */
    if (window.innerWidth > 1080) {
      var hero = document.getElementById('hero');
      gsap.to('.sc-back', { y: -30, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.sc-portrait', { y: 70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.sc-front', { y: 24, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { y: -40, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
  }
  function finalState() {
    var g = scene.geo, step = g.H + g.gap;
    REMOVE.forEach(function (r) { scene.blocks[r.i].el.style.display = 'none'; });
    [2, 4].forEach(function (i, n) { scene.blocks[i].el.setAttribute('transform', 'translate(0 ' + (step * (i === 2 ? 2 : 3)) + ')'); });
    scene.plate.el.style.display = 'none';
    scene.sheet.setAttribute('opacity', 1);
    document.getElementById('scTo').textContent = '2';
  }

  /* ---------- Вход героя ---------- */
  function heroIntro() {
    if (!hasGsap || reduce) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.kick-hero', { y: 14, opacity: 0, duration: 0.6 }, 0.1)
      .from('.hero-cta .btn, .ig-line', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.7)
      .from('.sc-back', { opacity: 0, duration: 0.9 }, 0.1)
      .from('#scTable', { opacity: 0, y: 20, duration: 0.7 }, 0.3);
  }

  /* ---------- Появление по скроллу ---------- */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.rv,.plate,.g-list,.contract').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.rv,.plate,.g-list,.contract').forEach(function (el) { io.observe(el); });
    /* ступенчатая задержка у соседей */
    document.querySelectorAll('.sheets,.cards,.terms,.facts,.assure,.lane').forEach(function (grp) {
      Array.prototype.forEach.call(grp.children, function (c, i) { c.style.transitionDelay = (Math.min(i, 7) * 0.07) + 's'; });
    });
    document.querySelectorAll('.g-list li').forEach(function (li, i) { li.querySelector('.g-mark').style.transitionDelay = (0.2 + i * 0.09) + 's'; });
  }

  /* ---------- Лента дел ---------- */
  function initLane() {
    var lane = document.getElementById('caseLane');
    if (!lane) return;
    var btns = document.querySelectorAll('.lane-btn');
    function stepW() { var c = lane.querySelector('.case'); return c ? c.getBoundingClientRect().width + 18 : 300; }
    function update() {
      var fits = lane.scrollWidth <= lane.clientWidth + 2;
      btns.forEach(function (b) {
        b.hidden = fits;
        var dir = +b.getAttribute('data-dir');
        b.disabled = dir < 0 ? lane.scrollLeft <= 2 : lane.scrollLeft + lane.clientWidth >= lane.scrollWidth - 2;
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { lane.scrollBy({ left: +b.getAttribute('data-dir') * stepW(), behavior: 'smooth' }); });
    });
    lane.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Переходы по якорям и предвыбор ситуации ---------- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var target = id ? document.getElementById(id) : document.body;
      if (!target) return;
      e.preventDefault();
      if (a.hasAttribute('data-situation')) presetSituation(a.getAttribute('data-situation'), a.getAttribute('data-dir'));
      document.body.classList.remove('menu-open');
      var burger = document.querySelector('.burger'); if (burger) burger.setAttribute('aria-expanded', 'false');
      scrollToEl(target);
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  }
  function presetSituation(val, dirKey) {
    var dir = document.getElementById('fmDir');
    if (dir) {
      var src = dirKey ? document.querySelector('[data-i18n="' + dirKey + '"]') : null;
      dir.value = src ? src.textContent.trim() : '';
    }
    if (!val) return;
    var r = document.querySelector('.chip input[value="' + val + '"]');
    if (r) { r.checked = true; clearErr('situation'); }
  }

  /* ---------- Лид-форма -> WhatsApp ---------- */
  function clearErr(name) {
    var el = document.querySelector('[data-err="' + name + '"]');
    if (el) { el.hidden = true; var f = el.closest('.field'); if (f) f.classList.remove('is-err'); }
  }
  function showErr(name) {
    var el = document.querySelector('[data-err="' + name + '"]');
    if (el) { el.hidden = false; var f = el.closest('.field'); if (f) f.classList.add('is-err'); }
  }
  function fmtPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d && d.charAt(0) !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' ' + d.slice(1, 4);
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += ' ' + d.slice(7, 9);
    if (d.length > 9) out += ' ' + d.slice(9, 11);
    return out;
  }
  function waText(sit, dir, name, phone) {
    if (current === 'kk' && window.SITE_KK && window.SITE_KK.wa) return window.SITE_KK.wa(sit, dir, name, phone);
    return 'Здравствуйте, Руслан Муратович. Ситуация: ' + sit + (dir ? '; направление: ' + dir : '') + '. Меня зовут ' + name + ', телефон ' + phone + '. Хочу записаться на консультацию.';
  }
  function initForm() {
    var form = document.getElementById('leadForm');
    if (!form) return;
    var phone = form.elements.phone;
    phone.addEventListener('input', function () {
      if (!phone.value.replace(/\D/g, '')) { phone.value = ''; return; }
      phone.value = fmtPhone(phone.value);
      clearErr('phone');
    });
    form.elements.name.addEventListener('input', function () { clearErr('name'); });
    form.querySelectorAll('.chip input').forEach(function (r) { r.addEventListener('change', function () { clearErr('situation'); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var sitEl = form.querySelector('.chip input:checked');
      var name = form.elements.name.value.trim();
      var digits = phone.value.replace(/\D/g, '');
      var ok = true;
      if (!sitEl) { showErr('situation'); ok = false; }
      if (!name) { showErr('name'); ok = false; }
      if (digits.length !== 11 || digits.charAt(1) !== '7') { showErr('phone'); ok = false; }
      if (!ok) {
        var first = form.querySelector('.err:not([hidden])');
        if (first) { var f = first.closest('.field'); if (f) f.querySelector('input').focus(); }
        return;
      }
      var sit = sitEl.parentNode.querySelector('span').textContent.trim();
      var dir = (form.elements.direction.value || '').trim();
      var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(waText(sit, dir, name, phone.value));
      /* окно WhatsApp - сразу в обработчике submit (LeadBot склеивает форму и переход) */
      window.open(url, '_blank', 'noopener');
      if (typeof gtag_report_lead_form === 'function') { try { gtag_report_lead_form(); } catch (err) {} }
      var done = document.getElementById('leadDone');
      document.getElementById('doneWa').setAttribute('href', url);
      form.hidden = true;
      done.hidden = false;
      if (hasGsap && !reduce) gsap.from(done, { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out' });
    });
  }

  /* ---------- Документы крупно ---------- */
  function initLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb || typeof lb.showModal !== 'function') return;
    var img = lb.querySelector('img');
    document.querySelectorAll('.doc[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        img.src = b.getAttribute('data-full');
        lb.showModal();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---------- Шапка и меню ---------- */
  function initHeader() {
    var header = document.getElementById('header');
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var burger = document.querySelector('.burger');
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (location.search.indexOf('noanim') !== -1) document.body.classList.add('no-anim');
    captureRu();
    document.addEventListener('langchange', refreshSceneTexts);

    var saved = 'ru';
    try { saved = localStorage.getItem('lang') || 'ru'; } catch (e) {}
    /* ?lang= в адресе главнее сохранённого выбора: русское объявление открывает русскую версию */
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var lang = forced || saved;
    if (lang === 'kk') applyLang('kk');
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });

    initScroll();
    initHeader();
    initAnchors();
    initScene();
    heroIntro();
    initReveal();
    initLane();
    initForm();
    initLightbox();

    /* клики tel / WhatsApp (контакты, подвал, экран «спасибо») -> конверсии Google Ads;
       без preventDefault: tel: не выгружает страницу, wa.me открывается в новой вкладке */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href*="wa.me"]');
      if (!a || typeof gtag !== 'function') return;
      if (a.getAttribute('href').indexOf('tel:') === 0) {
        gtag('event', 'conversion', { 'send_to': 'AW-18559690462/R_Y0CPqusbMdEN7N-ZFF', 'value': 1.0, 'currency': 'USD' });
      } else if (typeof gtag_report_contact === 'function') {
        gtag_report_contact();
      }
    });

    /* переход по ссылке с якорем - после загрузки довести до цели с учётом шапки */
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(function () { scrollToEl(t); }, 300);
    }
  });
})();
