// Responsive version control for desktop/tablet/mobile blocks
// Keeps logic isolated and debounced for performance.

(function () {
  // Utility: find the currently visible root (desktop/tablet/mobile)
  function visibleRoot() {
    var roots = [
      document.querySelector('.desktop-version'),
      document.querySelector('.tablet-version'),
      document.querySelector('.mobile-version'),
    ];
    for (var i = 0; i < roots.length; i++) {
      var el = roots[i];
      if (el && window.getComputedStyle(el).display !== 'none') return el;
    }
    return document.body;
  }

  function currentHeaderHeight() {
    var root = visibleRoot();
    var header = root.querySelector('.gnb') || root.querySelector('.property-default');
    if (!header) return 0;
    return header.getBoundingClientRect().height || 0;
  }

  function sectionElement(name) {
    var root = visibleRoot();
    var el = null;
    if (name === 'main') {
      el = root.querySelector('.main');
    } else if (name === 'solution') {
      el = root.querySelector('.solution') || root.querySelector('.solution-mobile');
      if (!el) {
        // fallback to headings containing Solutions/솔루션
        el = root.querySelector('.secondary-headline-2, .secondary-headline-3, .caption-2');
      }
    } else if (name === 'customer') {
      el = root.querySelector('.customer') || root.querySelector('.customer-mobile');
      if (!el) {
        el = root.querySelector('.secondary-headline');
      }
    }
    return el;
  }

  function smoothScrollToSelector(selector) {
    var root = visibleRoot();
    var target = root && root.querySelector(selector);
    if (!target) return;
    var headerH = currentHeaderHeight();
    var rect = target.getBoundingClientRect();
    var offset = window.pageYOffset + rect.top - headerH - 8;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }

  function smoothScrollToSection(name) {
    var target = sectionElement(name);
    if (!target) return;
    var headerH = currentHeaderHeight();
    var rect = target.getBoundingClientRect();
    var offset = window.pageYOffset + rect.top - headerH - 8; // small padding
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }

  function bindGnbMenuScrolling() {
    // Desktop/Tablet menus
    var labelNodes = document.querySelectorAll('.menu .menu-item-2');
    labelNodes.forEach(function (node) {
      var label = (node.textContent || '').trim();
      if (label === '회사소개') {
        node.style.cursor = 'pointer';
        node.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else if (label === '솔루션') {
        node.style.cursor = 'pointer';
        node.addEventListener('click', function () { smoothScrollToSection('solution'); });
      } else if (label === '고객사') {
        node.style.cursor = 'pointer';
        node.addEventListener('click', function () { smoothScrollToSection('customer'); });
      }
    });

    // Mobile menus (375px): close accordion then navigate
    var mobilePanel = document.querySelector('.mobile-homepage .desktop-vertical-not');
    var mobileLabels = document.querySelectorAll('.desktop-vertical-not .menu .text-wrapper');
    mobileLabels.forEach(function (node) {
      var label = (node.textContent || '').trim();
      node.style.cursor = 'pointer';
      if (label === '회사소개') {
        node.addEventListener('click', function () {
          if (mobilePanel) mobilePanel.classList.remove('is-open');
          smoothScrollToSelector('.intro-mobile');
        });
      } else if (label === '솔루션') {
        node.addEventListener('click', function () {
          if (mobilePanel) mobilePanel.classList.remove('is-open');
          smoothScrollToSelector('.solution-mobile');
        });
      } else if (label === '고객사') {
        node.addEventListener('click', function () {
          if (mobilePanel) mobilePanel.classList.remove('is-open');
          smoothScrollToSelector('.customer-mobile');
        });
      } else if (label === '문의하기') {
        node.addEventListener('click', function (e) {
          e.preventDefault();
          if (mobilePanel) mobilePanel.classList.remove('is-open');
          window.location.assign('http://cshift.co/contact/contactus.php');
        });
      }
    });
  }

  function bindLogoToHome() {
    var logos = document.querySelectorAll('.logo-2');
    if (!logos || logos.length === 0) return;
    logos.forEach(function (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', function () {
        try {
          window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (e) {}
        // Reload to mimic full reset to the initial view
        window.location.reload();
      });
    });
  }

  function initCustomerRotator() {
    var root = visibleRoot();
    if (!root) return;
    var rotator = root.querySelector('.customer-rotator');
    if (!rotator) return;
    var groups = Array.prototype.slice.call(rotator.querySelectorAll('.group'));
    if (groups.length <= 1) return;

    // Ensure only one active at start
    groups.forEach(function (g, idx) {
      if (idx === 0) g.classList.add('is-active');
      else g.classList.remove('is-active');
    });

    var current = 0;
    var dwell = 1500; // 보여주는 지연
    var duration = 600; // 전환 시간
    var interval = dwell + duration; // 총 사이클 시간

    setInterval(function () {
      var next = (current + 1) % groups.length;
      groups[current].classList.remove('is-active');
      groups[next].classList.add('is-active');
      current = next;
    }, interval);
  }

  // 태블릿 버전에서도 고객사 로테이터 초기화
  function initAllCustomerRotators() {
    var rotators = document.querySelectorAll('.customer-rotator');
    rotators.forEach(function(rotator) {
      var groups = Array.prototype.slice.call(rotator.querySelectorAll('.group'));
      if (groups.length <= 1) return;

      // Ensure only one active at start
      groups.forEach(function (g, idx) {
        if (idx === 0) g.classList.add('is-active');
        else g.classList.remove('is-active');
      });

      var current = 0;
      var dwell = 1500; // 보여주는 지연
      var duration = 600; // 전환 시간
      var interval = dwell + duration; // 총 사이클 시간

      setInterval(function () {
        var next = (current + 1) % groups.length;
        groups[current].classList.remove('is-active');
        groups[next].classList.add('is-active');
        current = next;
      }, interval);
    });
  }

  function bindInquiryNavigation() {
    var CONTACT_URL = 'http://cshift.co/contact/contactus.php';
    // Search across GNB and mobile menu regions for text nodes that say '문의하기'
    var candidates = Array.prototype.slice.call(
      document.querySelectorAll('.gnb *, .desktop-vertical-not *, .buttons-group *')
    ).filter(function (el) {
      return (el.textContent || '').trim() === '문의하기';
    });

    candidates.forEach(function (el) {
      var clickable = el.closest('button, .button, .button-2, .button-3, .buttons-group, .text-container-2, .text-container-3');
      clickable = clickable || el;
      clickable.style.cursor = 'pointer';
      clickable.addEventListener('click', function (e) {
        e.preventDefault();
        try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (err) {}
        window.location.assign(CONTACT_URL); // push history so browser back returns
      });
    });
  }

  function bindMobileAccordion() {
    var headerBtn = document.querySelector('.mobile-homepage .property-default .button-2');
    var panel = document.querySelector('.mobile-homepage .desktop-vertical-not');
    if (!headerBtn || !panel) return;
    headerBtn.setAttribute('aria-expanded', 'false');
    headerBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = panel.classList.toggle('is-open');
      headerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindSolutionLinks() {
    // Map of keyword -> URL. We'll match by class names or visible category text.
    var mappings = [
      { key: 'metabase', url: 'https://cshiftco.notion.site/metabase', selectors: ['.metabase-logo-icon'], texts: ['Lightweight, Fast BI'] },
      { key: 'cockroach', url: 'https://cshiftco.notion.site/coc-kroach-labs', selectors: ['.download'], texts: ['Global Sync OLTP'] },
      { key: 'starrocks', url: 'https://cshiftco.notion.site/starrocks', selectors: ['.starrocks-logo'], texts: ['Next Gen DW / OLAP'] },
      { key: 'bedrock', url: 'https://cshiftco.notion.site/bedrock', selectors: ['.bedrock'], texts: ['DSPM / Data Linage'] },
      { key: 'notion', url: 'https://cshiftco.notion.site/notion', selectors: ['img.notion'], texts: ['Communication'] },
      { key: 'ory', url: 'https://cshiftco.notion.site/ory', selectors: ['.ory-logo'], texts: ['CIAM'] },
      { key: 'calypso', url: 'https://cshiftco.notion.site/calypso-ai', selectors: ['.calypso-AI'], texts: ['GenAI Security'] },
      { key: 'nightfall', url: 'https://cshiftco.notion.site/nightfall-ai', selectors: ['.nightfallai'], texts: ['SaaS DLP'] },
      { key: 'sysdig', url: 'https://cshiftco.notion.site/sysdig', selectors: [], texts: ['CNAPP'] },
      { key: 'illumio', url: 'https://cshiftco.notion.site/illumio', selectors: ['img[src*="illumio"], .group-3, .group-4, .group-5'], texts: ['Micro-segmentation'] },
      { key: 'cybereason', url: 'https://cshiftco.notion.site/cyberreason', selectors: ['.cyberreason'], texts: ['EDR / XDR'] },
    ];

    function findCardFrom(el) {
      return el.closest('.div-2, .div-3, .div-4, .div-5');
    }

    function attachToCard(card, url) {
      if (!card || card.dataset.linkBound) return;
      card.dataset.linkBound = '1';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        window.location.assign(url); // stays in history, back works
      });
    }

    mappings.forEach(function (m) {
      // By selector
      m.selectors.forEach(function (sel) {
        var nodes = document.querySelectorAll(sel);
        nodes.forEach(function (n) { attachToCard(findCardFrom(n), m.url); });
      });
      // By text content
      var textNodes = document.querySelectorAll('.category, .category-2, .category-3, .category-4, .category-5, .category-6');
      textNodes.forEach(function (tn) {
        var t = (tn.textContent || '').trim();
        if (m.texts.some(function (x) { return t === x; })) {
          attachToCard(findCardFrom(tn), m.url);
        }
      });
    });
  }

  function cssVar(name) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || '').trim();
  }

  function bindSolutionHover() {
    // Include both Data & Platform cards(.div-2) and Security cards(.div-4),
    // and mobile variants (.div-3/.div-4/.div-5)
    var cards = document.querySelectorAll(
      '.landing-page .div-2, .landing-page .div-4, .mobile-homepage .div-3, .mobile-homepage .div-4, .mobile-homepage .div-5'
    );
    if (!cards || cards.length === 0) return;

    var primary90 = cssVar('--primary-90');
    var defaultWhite = cssVar('--defaultwhite') || '#fff';

    cards.forEach(function (card) {
      // Apply smooth transition (smart-animate-like, slow, 200ms)
      var transitionCurve = 'cubic-bezier(0.25, 0.1, 0.25, 1)'; // ease-in-out
      card.style.transition = 'background-color 200ms ' + transitionCurve;

      // Cache originals once
      if (!card.dataset.origBg) {
        var cs = getComputedStyle(card);
        card.dataset.origBg = cs.backgroundColor || '';
      }

      var categories = Array.prototype.slice.call(
        card.querySelectorAll('.category, .category-2, .category-3, .category-4, .category-5, .category-6')
      );
      categories.forEach(function (el) {
        el.style.transition = 'color 200ms ' + transitionCurve;
        if (!el.dataset.origColor) el.dataset.origColor = getComputedStyle(el).color || '';
      });

      var descs = Array.prototype.slice.call(
        card.querySelectorAll('.text-wrapper-2, .text-wrapper-3, .text-wrapper-4')
      );
      descs.forEach(function (el) {
        el.style.transition = 'color 200ms ' + transitionCurve;
        if (!el.dataset.origColor) el.dataset.origColor = getComputedStyle(el).color || '';
      });

      // plus svg can appear under different button variants; match by src
      var plusImgs = Array.prototype.slice.call(
        card.querySelectorAll("img[src*='plus.svg']")
      );
      plusImgs.forEach(function (img) {
        if (!img.dataset.origSrc) img.dataset.origSrc = img.getAttribute('src');
      });

      card.addEventListener('mouseenter', function () {
        card.style.backgroundColor = primary90;
        categories.forEach(function (el) { el.style.color = defaultWhite; });
        descs.forEach(function (el) { el.style.color = defaultWhite; });
        plusImgs.forEach(function (img) { img.setAttribute('src', 'img/plus_hover.svg'); });
      });

      card.addEventListener('mouseleave', function () {
        if (card.dataset.origBg) card.style.backgroundColor = card.dataset.origBg;
        categories.forEach(function (el) { if (el.dataset.origColor) el.style.color = el.dataset.origColor; });
        descs.forEach(function (el) { if (el.dataset.origColor) el.style.color = el.dataset.origColor; });
        plusImgs.forEach(function (img) { if (img.dataset.origSrc) img.setAttribute('src', img.dataset.origSrc); });
      });
    });
  }
  function applyDesktopScale() {
    var desktopRoot = document.querySelector('.desktop-version');
    if (!desktopRoot) return;
    var vw = window.innerWidth;
    var base = 1440;
    if (vw >= base) {
      desktopRoot.style.transform = '';
      desktopRoot.style.transformOrigin = '';
      document.documentElement.style.overflowX = '';
      return;
    }
    var scale = vw / base;
    desktopRoot.style.transform = 'scale(' + scale + ')';
    desktopRoot.style.transformOrigin = 'top center';
    // Prevent horizontal scroll gaps
    document.documentElement.style.overflowX = 'hidden';
  }

  function showResponsiveVersion() {
    var width = window.innerWidth;
    var desktop = document.querySelector('.desktop-version');
    var tablet = document.querySelector('.tablet-version');
    var mobile = document.querySelector('.mobile-version');

    if (!desktop || !tablet || !mobile) return;

    desktop.style.display = 'none';
    tablet.style.display = 'none';
    mobile.style.display = 'none';

    if (width > 768) {
      // 769px 이상: 데스크톱 버전
      desktop.style.display = 'block';
      applyDesktopScale();
    } else if (width > 375) {
      // 376px ~ 768px: 태블릿 버전
      tablet.style.display = 'block';
    } else {
      // 375px 이하: 모바일 버전
      mobile.style.display = 'block';
    }
  }

  // Lightweight debounce using requestAnimationFrame
  var resizeScheduled = false;
  function onResize() {
    if (!resizeScheduled) {
      resizeScheduled = true;
      window.requestAnimationFrame(function () {
        resizeScheduled = false;
        showResponsiveVersion();
      });
    }
  }

  window.addEventListener('load', showResponsiveVersion);
  window.addEventListener('resize', onResize);

  // Bind scrolling after DOM ready
  window.addEventListener('DOMContentLoaded', function () {
    bindGnbMenuScrolling();
    bindLogoToHome();
    bindSolutionHover();
    initCustomerRotator();
    initAllCustomerRotators(); // 모든 버전의 고객사 로테이터 초기화
    bindInquiryNavigation();
    bindSolutionLinks();
    bindMobileAccordion();
  });
})();
