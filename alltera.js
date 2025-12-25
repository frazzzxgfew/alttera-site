(function () {
  // ====== IDs ======
  var BG_ID = "alltera-animated-bg";
  var STYLE_ID = "alltera-style-v9";

  // ====== utils ======
  function addStyleOnce(id, css) {
    if (document.getElementById(id)) return;
    var s = document.createElement("style");
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function ensureBg() {
    if (document.getElementById(BG_ID)) return;
    var d = document.createElement("div");
    d.id = BG_ID;
    d.setAttribute("aria-hidden", "true");
    document.body.appendChild(d);
  }

  function norm(t) {
    return (t || "")
      .replace(/\uFEFF/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isUi(el) {
    return !!(el && el.closest && el.closest("a,button,input,textarea,select,script,style"));
  }

  function getShownTile() {
    // Ecwid Instant Site обычно помечает видимую плитку так
    return (
      document.querySelector('.ins-tile--shown') ||
      document.querySelector('.ins-tile__wrap.ins-tile__animated') ||
      null
    );
  }

  function tileKind(tile) {
    if (!tile) return null;
    var t = "";
    var h = tile.querySelector("h1,h2,h3");
    if (h) t = norm(h.textContent).toLowerCase();

    if (t.indexOf("почему мы") !== -1) return "why";
    if (t.indexOf("стайлер") !== -1) return "styler";
    if (t.indexOf("массажные пистолет") !== -1 || t.indexOf("массажн") !== -1) return "gun";
    return null;
  }

  // ====== styles ======
  function injectStyles() {
    addStyleOnce(
      STYLE_ID,
      [
        /* background */
        "html,body{background:#bdbdbd!important}",
        "#" + BG_ID + "{position:fixed;inset:0;z-index:0;pointer-events:none;",
        "background:",
        "radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%),",
        "radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%),",
        "radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%),",
        "linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));",
        "background-size:260% 260%,260% 260%,260% 260%,500% 500%;",
        "animation:allteraShift 8s ease-in-out infinite;",
        "filter:saturate(0) contrast(2.3) brightness(1.05);opacity:1;mix-blend-mode:soft-light}",
        "@keyframes allteraShift{0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}}",
        "#ec-instantsite-website{position:relative;z-index:1}",

        /* cards */
        ".at-cards{display:flex;flex-direction:column;gap:12px;align-items:flex-start;max-width:560px}",
        ".at-card{width:100%;background:rgba(230,230,230,.92);border-radius:20px;padding:16px 18px;",
        "box-shadow:0 12px 28px rgba(0,0,0,.12);backdrop-filter:blur(6px);}",
        ".at-card.center{align-items:center;text-align:center}",
        ".at-card .at-txt{display:block;color:#111;line-height:1.35}",

        /* reveal */
        ".at-rev{opacity:0;transform:translateY(10px);transition:opacity .55s ease,transform .55s ease}",
        ".at-rev.on{opacity:1;transform:none}",

        /* typing cursor */
        ".at-cur:after{content:'|';display:inline-block;margin-left:2px;opacity:.9;animation:atBlink 1s steps(2,end) infinite}",
        "@keyframes atBlink{0%,49%{opacity:1}50%,100%{opacity:0}}",

        /* parallax target */
        ".at-par{will-change:transform;transform:translateY(var(--atpy,0px));transition:transform .08s linear}",
        "@media (max-width:768px){.at-card{padding:14px 16px;border-radius:18px}}"
      ].join("")
    );
  }

  // ====== typing ======
  function prepType(el) {
    if (!el || el.dataset.atp === "1") return;
    var tx = norm(el.textContent);
    if (!tx) return;
    el.dataset.atText = tx;
    el.dataset.atp = "1";
    el.textContent = ""; // важно: текста изначально не должно быть
  }

  function typeInto(el, tx, speed, done) {
    if (!el) return done && done();
    var i = 0;
    el.classList.add("at-cur");
    function tick() {
      if (i < tx.length) {
        el.textContent += tx.charAt(i++);
        setTimeout(tick, speed);
      } else {
        el.classList.remove("at-cur");
        done && done();
      }
    }
    tick();
  }

  function typeSequence(items, speed, gap) {
    var idx = 0;
    function next() {
      if (idx >= items.length) return;
      var it = items[idx++];
      if (!it) return next();

      // показываем блок, потом печатаем
      if (it.classList && it.classList.contains("at-rev")) it.classList.add("on");

      var target = it;
      var tx = "";

      if (it.classList && it.classList.contains("at-card")) {
        target = it.querySelector(".at-txt");
        tx = norm(it.dataset.atText || "");
      } else {
        tx = norm(it.dataset.atText || "");
      }

      if (!tx || !target) return next();

      typeInto(target, tx, speed, function () {
        setTimeout(next, gap);
      });
    }
    next();
  }

  // ====== split bullets (работает даже если это просто текстовые ноды) ======
  function splitToCards(container, center) {
    if (!container || container.dataset.atSplit === "1") return false;
    if (isUi(container)) return false;

    var raw = (container.innerText || container.textContent || "").trim();
    if (!raw) return false;

    // если в тексте нет "•" и нет переносов — нечего резать
    var hasBullets = raw.indexOf("•") !== -1 || raw.indexOf("·") !== -1;
    var hasLines = raw.indexOf("\n") !== -1;
    if (!hasBullets && !hasLines) return false;

    // нормализуем: каждый "•" делаем началом строки
    var normalized = raw.replace(/\s*•\s*/g, "\n• ").replace(/\s*·\s*/g, "\n• ");
    var lines = normalized.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);

    // чистим маркеры
    var items = lines.map(function (x) {
      return x.replace(/^•\s*/g, "").replace(/^[\-–—*]\s*/g, "").trim();
    }).filter(Boolean);

    if (items.length < 2) return false;

    // строим карточки
    var wrap = document.createElement("div");
    wrap.className = "at-cards";

    items.forEach(function (text) {
      var card = document.createElement("div");
      card.className = "at-card at-rev" + (center ? " center" : "");
      card.dataset.atText = text;

      var sp = document.createElement("span");
      sp.className = "at-txt";
      sp.textContent = ""; // печатается
      card.appendChild(sp);

      wrap.appendChild(card);
    });

    // заменяем содержимое контейнера карточками
    container.textContent = "";
    container.appendChild(wrap);
    container.dataset.atSplit = "1";

    return true;
  }

  function findBestBulletContainer(tile) {
    // ищем самый "узкий" элемент, в котором реально лежат буллеты
    var all = [].slice.call(tile.querySelectorAll("*"));
    var candidates = [];

    all.forEach(function (el) {
      if (!el || isUi(el)) return;
      if (el.children && el.children.length > 0) return;

      var txt = (el.innerText || el.textContent || "").trim();
      if (!txt) return;

      // важное: “•” может быть прямо текстом, не li
      var score = 0;
      if (txt.indexOf("•") !== -1 || txt.indexOf("·") !== -1) score += 10;
      if (txt.indexOf("\n") !== -1) score += 4;
      if (txt.length > 600) score -= 5; // слишком большой — вероятно не то
      if (score >= 10) candidates.push({ el: el, len: txt.length, score: score });
    });

    candidates.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.len - b.len;
    });

    return candidates[0] ? candidates[0].el : null;
  }

  // ====== parallax ======
  function setupParallax(tile) {
    if (!tile || tile.dataset.atPar === "1") return;
    var img =
      tile.querySelector(".ins-tile__image img") ||
      tile.querySelector("img");
    if (!img) return;

    img.classList.add("at-par");
    tile.dataset.atPar = "1";

    function upd() {
      var r = img.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var mid = r.top + r.height / 2;
      var rel = (mid - vh / 2) / (vh / 2); // -1..1
      var off = rel * -10; // лёгкий!
      if (off > 14) off = 14;
      if (off < -14) off = -14;
      img.style.setProperty("--atpy", off.toFixed(2) + "px");
    }

    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  // ====== per-page logic ======
  function runWhy(tile) {
    if (tile.dataset.atDoneWhy === "1") return;
    tile.dataset.atDoneWhy = "1";

    // Заголовок + подзаголовок печатаем
    var h = tile.querySelector("h1,h2,h3");
    var p = tile.querySelector("p");

    if (h) {
      prepType(h);
      h.classList.add("at-rev");
      h.classList.add("on");
    }
    if (p) {
      prepType(p);
      p.classList.add("at-rev");
      p.classList.add("on");
    }

    // Буллеты режем в карточки
    var bc = findBestBulletContainer(tile);
    if (bc) splitToCards(bc, true);

    // Собираем очередь печати: h -> p -> карточки
    var queue = [];
    if (h && h.dataset.atText) queue.push(h);
    if (p && p.dataset.atText) queue.push(p);

    var cards = [].slice.call(tile.querySelectorAll(".at-card"));
    queue = queue.concat(cards);

    // Печатаем по очереди
    typeSequence(queue, 42, 220);
  }

  function runProductPage(tile) {
    // стили/пистолеты: режем преимущества и печатаем каждую карточку
    if (tile.dataset.atDoneProd === "1") return;
    tile.dataset.atDoneProd = "1";

    var bc = findBestBulletContainer(tile);
    if (bc) splitToCards(bc, false);

    // печатаем карточки по очереди
    var cards = [].slice.call(tile.querySelectorAll(".at-card"));
    typeSequence(cards, 36, 180);
  }

  // ====== main tick ======
  var lastKey = "";
  function tick() {
    var tile = getShownTile();
    if (!tile) return;

    var kind = tileKind(tile);
    if (!kind) return;

    // ключ “новой страницы”
    var key = kind + "::" + (tile.id || "") + "::" + (tile.getAttribute("aria-label") || "");
    if (key === lastKey && tile.dataset.atRefreshed === "1") return;
    lastKey = key;
    tile.dataset.atRefreshed = "1";

    setupParallax(tile);

    if (kind === "why") runWhy(tile);
    if (kind === "styler" || kind === "gun") runProductPage(tile);
  }

  function init() {
    injectStyles();
    ensureBg();

    tick();

    // Ecwid SPA: следим за изменениями + подстраховка интервалом
    if ("MutationObserver" in window) {
      var t;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(tick, 120);
      }).observe(document.body, { childList: true, subtree: true });
    }
    setInterval(tick, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
