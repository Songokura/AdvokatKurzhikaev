/* Адвокат Куржикаев — лэндинг. RU/KZ, меню, анимации, форма WhatsApp. */
(function () {
  'use strict';

  /* ---------- i18n ---------- */
  var META = {
    ru: {
      title: 'Адвокат по уголовным делам в Астане — Куржикаев Руслан Муратович',
      desc: 'Защита по уголовным делам любой сложности в Астане: общеуголовные, экономические, коррупционные. Более 15 лет опыта: 11 лет в прокуратуре, 4 года в финансовой полиции. Звонки по уголовным делам — круглосуточно: +7 700 309 14 94.'
    },
    kk: null
  };

  var KK = {};   // казахский словарь - assets/lang/kk.js, грузится по требованию

  var WA_TEXT = {
    ru: function (n, p, m) {
      return 'Здравствуйте, Руслан Муратович! Меня зовут ' + n + '. ' + (m ? m + ' ' : '') + 'Мой телефон: ' + p + '. Хочу записаться на консультацию.';
    },
    kk: null
  };

  var ruStore = {};   // data-i18n → исходный RU-HTML
  var ruAttr = {};    // data-i18n-ph → исходный RU-placeholder
  var current = 'ru';

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
      META.kk = window.SITE_KK.meta; KK = window.SITE_KK.dict; WA_TEXT.kk = window.SITE_KK.wa;
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
    if (lang === 'kk') loadKK(function () {});
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
      if (lang === 'ru') {
        el.setAttribute('placeholder', ruAttr[el.getAttribute('data-i18n-ph-id')]);
      } else {
        var key = el.getAttribute('data-i18n-ph');
        if (KK[key] !== undefined) el.setAttribute('placeholder', KK[key]);
      }
    });
    document.documentElement.lang = lang === 'kk' ? 'kk' : 'ru';
    document.title = META[lang].title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', META[lang].desc);
    document.querySelectorAll('.lang button').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (location.search.indexOf('noanim') !== -1) document.body.classList.add('no-anim');
    captureRu();
    var saved = 'ru';
    try { saved = localStorage.getItem('lang') || 'ru'; } catch (e) {}
    /* ?lang=ru | ?lang=kk в URL важнее сохранённого выбора: рекламные объявления
       на русском обязаны открывать русскую версию, даже если посетитель раньше
       переключал сайт на казахский (иначе Google Ads - «Неподдерживаемый язык»). */
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var lang = forced || saved;
    if (lang === 'kk') applyLang('kk');
    else if (forced === 'ru') applyLang('ru');

    document.querySelectorAll('.lang button').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });

    /* герой: вход */
    requestAnimationFrame(function () { document.body.classList.add('loaded'); });

    /* шапка при скролле */
    var header = document.getElementById('header');
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* бургер-меню */
    var burger = document.querySelector('.burger');
    function closeMenu() {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobnav a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    /* появление на скролле */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    }

    /* лёгкий параллакс фото героя (только десктоп, без reduced-motion) */
    var heroImg = document.querySelector('.hero-photo img');
    var fine = window.matchMedia('(min-width: 1025px)');
    var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (heroImg && fine.matches && !noMotion.matches) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 900);
          heroImg.style.transform = 'translateY(' + y * 0.06 + 'px) scale(1.02)';
          ticking = false;
        });
      }, { passive: true });
    }

    /* форма → WhatsApp (без бэкенда) */
    var form = document.getElementById('waForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = form.elements.name.value.trim();
        var phone = form.elements.phone.value.trim();
        var msg = form.elements.msg.value.trim();
        if (!name || !phone) { form.reportValidity(); return; }
        var text = WA_TEXT[current === 'kk' ? 'kk' : 'ru'](name, phone, msg);
        var url = 'https://wa.me/77003091494?text=' + encodeURIComponent(text);
        form.querySelector('.fm-done').hidden = false;
        window.open(url, '_blank', 'noopener');
        /* Google Ads: конверсия «Отправка формы для потенциальных клиентов» */
        if (typeof gtag_report_lead_form === 'function') { gtag_report_lead_form(); }
      });
    }

    /* плавающие кнопки прячем, пока виден блок контактов: там свои CTA,
       а поверх формы кружки перекрывали кнопку отправки */
    var fab = document.querySelector('.fab');
    var contacts = document.getElementById('contacts');
    if (fab && contacts && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        fab.classList.toggle('is-hidden', entries[0].isIntersecting);
      }, { rootMargin: '0px 0px -25% 0px' }).observe(contacts);
    }

    /* делегированные клики tel / WhatsApp -> конверсии Google Ads.
       Событие шлём без preventDefault: tel: не выгружает страницу,
       а wa.me открывается в новой вкладке - переход не теряется. */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="tel:"], a[href*="wa.me"]');
      if (!a || typeof gtag !== 'function') return;
      if (a.getAttribute('href').indexOf('tel:') === 0) {
        gtag('event', 'conversion', {
          'send_to': 'AW-18416979660/EW8zCO2Ml-ocEMyd881E',
          'value': 1.0,
          'currency': 'USD'
        });
      } else if (typeof gtag_report_contact === 'function') {
        gtag_report_contact();
      }
    });
  });
})();
