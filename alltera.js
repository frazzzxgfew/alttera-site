(function () {
  "use strict";

  // ====== CONFIG ======
  var BG_ID = "alltera-animated-bg";
  var STYLE_ID = "alltera-style-v5";
  var RUN_FLAG = "__ALLTERA_V5__";

  // Заголовки страниц (у Ecwid InstantSite они обычно есть как H1/H2)
  var PAGE_WHY = "Почему мы?";
  var PAGE_STYLERS = "Стайлеры для волос";
  var PAGE_GUNS = "Массажные пистолеты";

  // ====== UTILS ======
  function log() {
    try { console.log.apply(console, ["[Alltera]"].concat([].slice.call(arguments))); } catch (e) {}
  }

  function addStyleOnce(id, css) {
    if (document.getElementById(id)) return;
    var s = document.createElement("style");
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function norm(t) {
    return (t || "")
      .replace(/\uFEFF/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function safeClosest(el, sel) {
    if (!el || !el.closest) return null;
    try { return el.closest(sel); } catch (e) { return null; }
  }

  function isUI(el) {
    return !!safeClosest(el, "a,button,input,textarea,select,script,style");
  }

  function getShownTile() {
    // В InstantSite обычно активный экран помечен .ins-tile--shown
    return document.querySelector(".ins-tile--shown") || document.body;
  }

  function getTileTitle(tile) {
    if (!tile) return "";
    var h = tile.querySelector("h1,h2,h3");
    return norm(h ? h.textContent : "");
  }

  function ensureBG() {
    if (document.getElementById(BG_ID)) return;
    var d = document.createElement("div");
    d.id = BG_ID;
    d.setAttribute("aria-hidden", "true");
    document.body.appendChild(d);
  }

  function cleanBulletText(t) {
    // убираем ведущие "•" / "-" / "·"
    return norm(String(t || "").replace(/^[\u2022•·\-\*]+\s*/g, ""));
  }

  function splitByBullets(t) {
    // режем текст, если он “склеен” через • / ·
    var raw = String(t || "");
    if (raw.indexOf("•") === -1 && raw.indexOf("·") === -1) return null;

    var parts = raw
      .split(/(?:\s*[•·]\s*)+/g)
      .map(function (x) { return norm(x); })
      .filter(function (x) { return x && x.length > 2; });

    return parts.length >= 2 ? parts : null;
  }

  function makeCard(text, variant) {
    var d = document.createElement("div");
    d.className = "at-card at-ghost at-reveal" + (variant ? (" " + variant) : "");
    d.dataset.at = text;

    var sp = document.createElement("span");
    sp.className = "at-text";
    d.appendChild(sp);
    return d;
  }

  // ====== TYPEWRITER ======
  function typeInto(el, text, speed, done) {
    var target = el.classList.contains("at-card") ? el.querySelector(".at-text") : el;
    if (!target) { if (done) done(); return; }

    target.textContent = "";
    var i = 0;

    function tick() {
      if (i < text.length) {
        target.textContent += text.charAt(i++);
        setTimeout(tick, speed);
      } else {
        if (done) done();
      }
    }
    tick();
  }

  function typeSequence(items, speed, gap) {
    var i = 0;
    function next() {
      if (i >= items.length) return;
      var el = items[i++];
      if (!el) return next();

      var tx = norm(el.dataset.at || el.textContent || "");
      if (!tx) return next();

      // чтобы “текста изначально не было”, но место сохранялось:
      el.dataset.at = tx;
      el.classList.add("at-ghost"); // резерв места через :before
      if (el.classList.contains("at-card")) {
        var sp = el.querySelector(".at-text");
        if (sp) sp.textContent = "";
      } else {
        el.textContent = "";
      }

      el.classList.add("at-typed", "at-on"); // покажем блок (fade-in)
      typeInto(el, tx, speed, function () {
        setTimeout(next, gap);
      });
    }
    next();
  }

  // ====== REVEAL (fade/slide in) ======
  function setupRevealObserver(root) {
    if (!("IntersectionObserver" in window)) {
      [].slice.call(root.querySelectorAll(".at-reveal")).forEach(function (e) { e.classList.add("at-on"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) {
        if (x.isIntersecting) {
          x.target.classList.add("at-on");
          io.unobserve(x.target);
        }
      });
    }, { threshold: 0.12 });

    [].slice.call(root.querySelectorAll(".at-reveal")).forEach(function (e) { io.observe(e); });
  }

  // ====== PARALLAX ======
  var parallaxBound = false;
  function setupParallax() {
    if (parallaxBound) return;
    parallaxBound = true;

    var ticking = false;
    function update() {
      ticking = false;
      var tile = getShownTile();
      if (!tile) return;

      // пытаемся взять “большую” картинку cover-блока, а не каталог
      var imgs = [].slice.call(tile.querySelectorAll(
        '[class*="ins-tile__image"] img, [class*="ins-tile__cover"] img, [class*="ins-tile__media"] img, img'
      ));

      // ограничим: берём только первые 2, чтобы не уехать в каталоге
      imgs = imgs.slice(0, 2);

      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var off = (y % 600) / 600; // 0..1
      var py = (off * 12) - 6;   // -6..+6px

      imgs.forEach(function (im) {
        if (!im || !im.style) return;
        im.classList.add("at-parallax");
        im.style.setProperty("--atpy", py.toFixed(2) + "px");
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // ====== PAGE TRANSFORMS ======
  function transformBulletsToCards(tile, variant) {
    // 1) сначала режем “склеенные” тексты с • на несколько блоков
    var candidates = [].slice.call(tile.querySelectorAll("p,li,div,span")).filter(function (el) {
      if (!el || el.dataset.atDone === "1") return false;
      if (isUI(el)) return false;
      var t = norm(el.textContent);
      if (!t) return false;
      // если очень длинно — вероятно не то
      if (t.length > 420) return false;
      return (t.indexOf("•") !== -1 || t.indexOf("·") !== -1);
    });

    candidates.forEach(function (el) {
      var t = el.textContent || "";
      var parts = splitByBullets(t);
      if (!parts) return;

      // помечаем исходник
      el.dataset.atDone = "1";

      // делаем обёртку со списком карточек
      var wrap = document.createElement("div");
      wrap.className = "at-stack";

      parts.forEach(function (p) {
        var card = makeCard(cleanBulletText(p), variant);
        wrap.appendChild(card);
      });

      el.parentNode.insertBefore(wrap, el);
      el.parentNode.removeChild(el);
    });

    // 2) если буллеты уже отдельными li/p — просто стилизуем каждый как карточку
    var singles = [].slice.call(tile.querySelectorAll("li,p")).filter(function (el) {
      if (!el || el.dataset.atDone === "1") return false;
      if (isUI(el)) return false;
      var t = norm(el.textContent);
      if (!t) return false;

      // буллетом считаем: начинается с "•" или выглядит как преимущество (есть "—" / "Вт" / "об/мин")
      var looks =
        /^[\u2022•·]/.test(t) ||
        t.indexOf(" — ") !== -1 ||
        t.indexOf("Вт") !== -1 ||
        t.indexOf("об/мин") !== -1;

      return looks;
    });

    singles.forEach(function (el) {
      var t = cleanBulletText(el.textContent);
      if (!t) return;

      el.dataset.atDone = "1";
      el.dataset.at = t;
      el.classList.add("at-card", "at-ghost", "at-reveal");
      if (variant) el.classList.add(variant);

      // убираем исходный текст, вставляем span для печати
      el.textContent = "";
      var sp = document.createElement("span");
      sp.className = "at-text";
      el.appendChild(sp);
    });
  }

  function buildWhyPageTyping(tile) {
    if (!tile || tile.dataset.atWhyRun === "1") return;

    tile.dataset.atWhyRun = "1";
    tile.classList.add("at-dark");

    // Заголовок + подзаголовок
    var h1 = tile.querySelector("h1,h2,h3");
    if (h1) { h1.dataset.at = norm(h1.textContent); h1.textContent = ""; }

    // Берём ближайший абзац после заголовка
    var p = null;
    if (h1) {
      var next = h1.nextElementSibling;
      while (next && !p) {
        if (next.tagName === "P") p = next;
        next = next.nextElementSibling;
      }
    }
    if (p) { p.dataset.at = norm(p.textContent); p.textContent = ""; }

    // Преимущества: делаем светлые блоки (на тёмном фоне — полупрозрачные)
    transformBulletsToCards(tile, "at-on-dark");

    setupRevealObserver(tile);

    // Печатаем “один за одним”: заголовок → абзац → карточки
    var seq = [];
    if (h1 && h1.dataset.at) seq.push(h1);
    if (p && p.dataset.at) seq.push(p);

    var cards = [].slice.call(tile.querySelectorAll(".at-card")).filter(function (c) {
      return c && c.dataset.at && c.dataset.at.length > 0;
    });

    // чтобы печаталось по порядку сверху вниз
    seq = seq.concat(cards);

    // старт небольшой задержкой (важно для InstantSite, он дорисовывает DOM)
    setTimeout(function () {
      typeSequence(seq, 26, 220);
    }, 220);
  }

  function buildProductPage(tile) {
    if (!tile) return;

    var title = getTileTitle(tile);

    // Для страниц 3/4 делаем: 1 преимущество = 1 блок, + печать
    if (title === PAGE_STYLERS || title === PAGE_GUNS) {
      tile.classList.remove("at-dark");

      transformBulletsToCards(tile, "at-light");
      setupRevealObserver(tile);

      // Печать карточек по очереди
      var cards = [].slice.call(tile.querySelectorAll(".at-card")).filter(function (c) {
        return c && c.dataset.at && c.dataset.at.length > 0 && c.dataset.atTyped !== "1";
      });

      // отметим, чтобы не перезапускать бесконечно
      cards.forEach(function (c) { c.dataset.atTyped = "1"; });

      if (cards.length) {
        setTimeout(function () {
          typeSequence(cards, 24, 180);
        }, 180);
      }
    }
  }

  // ====== CSS ======
  function injectCSS() {
    addStyleOnce(STYLE_ID, [
      "html,body{background:#f2f2f2!important;}",

      // Animated BG layer (как раньше)
      "#" + BG_ID + "{position:fixed;inset:0;z-index:2147483646;pointer-events:none;",
      "background:",
      "radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%),",
      "radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%),",
      "radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%),",
      "linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));",
      "background-size:260% 260%,260% 260%,260% 260%,500% 500%;",
      "animation:allteraShift 8s ease-in-out infinite;",
      "filter:saturate(0) contrast(2.2) brightness(1.06);opacity:1;mix-blend-mode:soft-light;}",
      "@keyframes allteraShift{0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}}",
      "@media (max-width:768px){#" + BG_ID + "{background-size:220% 220%,220% 220%,220% 220%,420% 420%;animation-duration:10s;filter:saturate(0) contrast(1.7) brightness(1.05)}}",

      // Cards layout
      ".at-stack{display:flex;flex-direction:column;gap:14px;align-items:flex-start;}",
      ".at-card{position:relative;border-radius:22px;padding:16px 18px;max-width:560px;",
      "box-shadow:0 14px 28px rgba(0,0,0,.10);",
      "line-height:1.45;font-size:16px;}",
      ".at-light{background:#e7e7e7;color:#111;}",
      ".at-on-dark{background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(6px);}",
      ".at-text{display:block;}",

      // Reserve height, but show nothing initially
      ".at-ghost::before{content:attr(data-at);visibility:hidden;display:block;white-space:normal;}",

      // Reveal animation
      ".at-reveal{opacity:0;transform:translateY(10px);transition:opacity .55s ease,transform .55s ease;}",
      ".at-reveal.at-on{opacity:1;transform:none;}",

      // Parallax (very light)
      ".at-parallax{transform:translateY(var(--atpy, 0px));transition:transform .12s linear;will-change:transform;}",

      // Fix bullets shifting (если где-то остались ul)
      "ul{list-style:none!important;padding-left:0!important;margin-left:0!important;}",
      "li::marker{content:'';}",

      // Make why-page cards centered nicer (optional)
      ".at-dark .at-stack{align-items:center;}",
      ".at-dark .at-card{max-width:760px;width:min(760px, 92vw);text-align:center;}",
    ].join(""));
  }

  // ====== MAIN APPLY LOOP ======
  function apply() {
    injectCSS();
    ensureBG();
    setupParallax();

    var tile = getShownTile();
    var title = getTileTitle(tile);

    if (title === PAGE_WHY) {
      buildWhyPageTyping(tile);
    } else {
      buildProductPage(tile);
    }
  }

  function boot() {
    if (window[RUN_FLAG]) return;
    window[RUN_FLAG] = 1;

    log("v5 boot");
    apply();

    // InstantSite может перерисовывать DOM без перезагрузки
    var root = document.getElementById("ec-instantsite") || document.body;

    if ("MutationObserver" in window) {
      var t;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(apply, 250);
      }).observe(root, { childList: true, subtree: true });
    }

    // страховка
    setInterval(apply, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
