/* 通用灯箱（Lightbox）模块 — 可复用于全站任意图片放大查看
 * 用法：
 *   1. 引入本脚本：<script src="assets/js/lightbox.js"></script>
 *   2. 给触发元素加 data-lightbox 属性即可（值相同的元素归入同一组，支持上一张/下一张）
 *      例：<img src="a.jpg" data-lightbox="g1" data-caption="说明文字">
 *          <a href="big.jpg" data-lightbox="g1"><img src="small.jpg"></a>
 *   3. 可选：data-full 指定放大用的高清图地址；data-caption 指定图片说明
 *   动态新增内容后调用 Lightbox.init() 即可重新采集触发器。
 */
(function () {
  'use strict';

  var overlay, imgEl, captionEl, closeBtn, prevBtn, nextBtn;
  var groups = {};                 // groupName -> [{ el, src, caption }]
  var current = { group: null, index: 0 };

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<button class="lb-close" type="button" aria-label="关闭">&times;</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="上一张">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lb-nav lb-next" type="button" aria-label="下一张">&#8250;</button>' +
      '<div class="lb-caption"></div>';
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector('img');
    captionEl = overlay.querySelector('.lb-caption');
    closeBtn = overlay.querySelector('.lb-close');
    prevBtn = overlay.querySelector('.lb-prev');
    nextBtn = overlay.querySelector('.lb-next');

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === closeBtn) close();
      else if (e.target === prevBtn) step(-1);
      else if (e.target === nextBtn) step(1);
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape' || e.key === 'Esc') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  function getSrc(el) {
    if (el.hasAttribute('data-full')) return el.getAttribute('data-full');
    if (el.tagName === 'IMG') return el.getAttribute('src');
    if (el.tagName === 'A') return el.getAttribute('href');
    var im = el.querySelector('img');
    return im ? im.getAttribute('src') : '';
  }

  function getCaption(el) {
    if (el.hasAttribute('data-caption')) return el.getAttribute('data-caption');
    var im = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (im && im.getAttribute('alt')) return im.getAttribute('alt');
    return el.getAttribute('title') || '';
  }

  function indexOfEl(list, el) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].el === el) return i;
    }
    return -1;
  }

  /* 采集 root 下所有 [data-lightbox] 触发器并绑定（已绑定的自动跳过，可重复调用） */
  function init(root) {
    root = root || document;
    if (!overlay) build();

    var triggers = root.querySelectorAll('[data-lightbox]');
    Array.prototype.forEach.call(triggers, function (el) {
      if (el.__lbBound) return;          // 避免重复绑定
      el.__lbBound = true;

      var name = el.getAttribute('data-lightbox') || '_default';
      if (!groups[name]) groups[name] = [];
      groups[name].push({ el: el, src: getSrc(el), caption: getCaption(el) });

      el.addEventListener('click', function (e) {
        e.preventDefault();
        var n = el.getAttribute('data-lightbox') || '_default';
        var list = groups[n] || [];
        open(n, indexOfEl(list, el) < 0 ? 0 : indexOfEl(list, el));
      });
    });
  }

  function open(name, idx) {
    current.group = name;
    current.index = idx || 0;
    render();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function render() {
    var list = groups[current.group] || [];
    var item = list[current.index] || {};
    imgEl.src = item.src || '';
    imgEl.alt = item.caption || '';
    captionEl.textContent = item.caption || '';
    var multi = list.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }

  function step(delta) {
    var list = groups[current.group] || [];
    if (list.length < 2) return;
    current.index = (current.index + delta + list.length) % list.length;
    render();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  window.Lightbox = { init: init, open: open, close: close };
})();
