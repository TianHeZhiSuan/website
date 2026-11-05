/* 深圳天河智算科技有限公司 — 官网交互脚本 */
(function () {
  'use strict';

  /* ---------- 1. 固定导航滚动状态 ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('on');
    else header.classList.remove('on');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 下拉菜单 ---------- */
  var dropBg = document.getElementById('dropBg');
  var panelMap = {
    product: document.getElementById('productDown'),
    solution: document.getElementById('solutionDown')
  };
  var openKey = null;
  var closeTimer = null;

  function liOf(key) { return document.querySelector('li[data-dropdown="' + key + '"]'); }
  function panelOf(key) { return panelMap[key] || null; }

  function dropHideAll() {
    Object.keys(panelMap).forEach(function (k) {
      if (panelMap[k]) panelMap[k].classList.remove('show');
    });
    if (dropBg) dropBg.classList.remove('show');
    openKey = null;
  }

  function dropOpen(key) {
    var panel = panelOf(key);
    if (!panel) return;
    clearTimeout(closeTimer);
    Object.keys(panelMap).forEach(function (k) {
      if (k !== key && panelMap[k]) panelMap[k].classList.remove('show');
    });
    panel.classList.add('show');
    if (dropBg) dropBg.classList.add('show');
    openKey = key;
  }

  function dropScheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(dropHideAll, 320);
  }
  function dropCancelClose() { clearTimeout(closeTimer); }

  Object.keys(panelMap).forEach(function (key) {
    var li = liOf(key);
    var panel = panelOf(key);
    if (!li || !panel) return;
    li.addEventListener('mouseenter', function () { dropOpen(key); });
    li.addEventListener('mouseleave', function () { if (openKey === key) dropScheduleClose(); });
    panel.addEventListener('mouseenter', function () { dropCancelClose(); dropOpen(key); });
    panel.addEventListener('mouseleave', function () { if (openKey === key) dropScheduleClose(); });
  });

  /* 指针在「导航项 → 面板」之间移动时保持展开，避免穿过空隙被判定为离开 */
  document.addEventListener('mousemove', function (e) {
    if (!openKey) return;
    var li = liOf(openKey);
    var panel = panelOf(openKey);
    if (!li || !panel) return;
    var inside = [li.getBoundingClientRect(), panel.getBoundingClientRect()].some(function (r) {
      return e.clientX >= r.left - 6 && e.clientX <= r.right + 6 &&
             e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8;
    });
    if (inside) dropCancelClose();
  }, { passive: true });

  if (dropBg) {
    dropBg.addEventListener('mouseenter', function () {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(dropHideAll, 260);
    });
    dropBg.addEventListener('mouseleave', dropCancelClose);
  }

  /* ---------- 3. 移动端菜单 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.add('show'); });
    var close = menu.querySelector('.mm-close');
    if (close) close.addEventListener('click', function () { menu.classList.remove('show'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('show'); });
    });
  }

  /* ---------- 4. 滚动渐入 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el, i) {
        el.style.transitionDelay = (i % 4) * 0.08 + 's';
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- 5. 产品清单筛选 ---------- */
  var filters = document.querySelectorAll('[data-filter]');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var cat = btn.getAttribute('data-filter');
        document.querySelectorAll('[data-cat]').forEach(function (tr) {
          var ok = cat === 'all' || tr.getAttribute('data-cat') === cat;
          tr.classList.toggle('hide', !ok);
        });
      });
    });
  }

  /* ---------- 6. 平滑滚动（同页锚点） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
