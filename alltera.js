<script>
(function () {
  var VERSION = "alltera-combo-2025-12-26-v2";

  window.__ALLTERA__ = window.__ALLTERA__ || {};
  window.__ALLTERA__.version = VERSION;

  // -----------------------------
  // 1) BACKGROUND (gradient + animation)
  // -----------------------------
  var BG_STYLE_ID = "alltera-bg-style";
  var BG_DIV_ID = "alltera-animated-bg";

  function ensureBgDiv() {
    if (document.getElementById(BG_DIV_ID)) return;
    if (!document.body) return;
    var d = document.createElement("div");
    d.id = BG_DIV_ID;
    d.setAttribute("aria-hidden", "true");
    document.body.appendChild(d);
  }

  function ensureBgStyle() {
    if (document.getElementById(BG_STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = BG_STYLE_ID;
    s.textContent =
      "html,body{background:#bdbdbd!important}" +
      "#" + BG_DIV_ID + "{position:fixed;inset:0;z-index:2147483646;pointer-events:none;" +
      "background:" +
      "radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%)," +
      "radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%)," +
      "radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%)," +
      "linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));" +
      "background-size:260% 260%,260% 260%,260% 260%,500% 500%;" +
      "animation:allteraShift 8s ease-in-out infinite;" +
      "filter:saturate(0) contrast(2.3) brightness(1.05);" +
      "opacity:1;mix-blend-mode:soft-light}" +
      "@keyframes allteraShift{" +
      "0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}" +
      "50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}" +
      "100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}}" +
      "@media(max-width:768px){" +
      "#" + BG_DIV_ID + "{background-size:220% 220%,220% 220%,220% 220%,420% 420%;animation-duration:10s;" +
      "filter:saturate(0) contrast(1.7) brightness(1.05)}}" ;
    document.head.appendChild(s);
  }

  // -----------------------------
  // 2) TYPING + ORBS
  // -----------------------------
  var TYPE_STYLE_ID = "alltera-type-style";
  var TYPE_SPEED = 55;
  var TYPE_DELAY = 250;
  var TYPE_START_DELAY = 1;

  var TEXTS = [
    "Alltera — умные устройства для заботы о себе.",
    "Почему мы?",
    "Мы выбираем устройства, которые реально упрощают жизнь — и дома, и после тренировок.",
    "Бережно и быстро: до 1600 Вт, 3 режима, нагрев до 100°C — без перегрева.",
    "Под любую задачу: 7 насадок для укладки + 8 для массажа.",
    "Точная настройка: 1800–3200 об/мин — от лёгкого расслабления до глубокой проработки.",
    "Удобно в руке: фен 450 г, массажёр 665 г – комфортно для дома и в дороге"
  ];
  var BULLET_TEXTS = TEXTS.slice(3);

  function normText(s) {
    return (s || "")
      .replace(/\uFEFF/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[•\u2022\-\–\—]\s*/, "");
  }

  function isBulletText(t) {
    for (var i = 0; i < BULLET_TEXTS.length; i++) if (t === BULLET_TEXTS[i]) return true;
    return false;
  }

  function ensureTypeStyle() {
    if (document.getElementById(TYPE_STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = TYPE_STYLE_ID;
    s.textContent =
      ".alltera-typing{display:inline-block}" +
      ".alltera-cursor:after{content:'|';display:inline-block;margin-left:2px;opacity:.9;animation:allteraBlink 1s steps(2,end) infinite}" +
      "@keyframes allteraBlink{0%,49%{opacity:1}50%,100%{opacity:0}}" +
      ".alltera-orb{position:relative;display:block;padding:18px 22px;margin:16px 0;border-radius:28px;" +
      "background:" +
      "radial-gradient(140% 140% at 18% 18%,rgba(255,255,255,.28),transparent 55%)," +
      "radial-gradient(140% 140% at 85% 25%,rgba(255,255,255,.12),transparent 60%)," +
      "linear-gradient(135deg,rgba(200,200,200,.92),rgba(125,125,125,.92),rgba(225,225,225,.9));" +
      "background-size:280% 280%!important;" +
      "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" +
      "box-shadow:inset 0 0 0 1px rgba(255,255,255,.32),0 16px 38px rgba(0,0,0,.2)!important;" +
      "animation:allteraOrbShift 7s ease-in-out infinite;filter:contrast(1.18) brightness(.98)!important}" +
      "@keyframes allteraOrbShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}" +
      "@media(max-width:768px){.alltera-orb{padding:16px 18px;border-radius:22px;font-size:15px}}";
    document.head.appendChild(s);
  }

  function getTextNodesForTyping() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,p,li"));
    var found = [];

    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (!e || !e.textContent) continue;
      if (e.closest("a,button,input,textarea,select")) continue;

      var t = normText(e.textContent);
      if (!t) continue;

      for (var k = 0; k < TEXTS.length; k++) {
        if (t === TEXTS[k]) { found.push(e); break; }
      }
    }

    // fallback: contains
    for (var k2 = 0; k2 < TEXTS.length; k2++) {
      var g = TEXTS[k2];
      var exists = false;
      for (var x = 0; x < found.length; x++) if (normText(found[x].textContent) === g) { exists = true; break; }
      if (exists) continue;

      for (var j = 0; j < nodes.length; j++) {
        var e2 = nodes[j];
        if (!e2 || !e2.textContent) continue;
        if (e2.closest("a,button,input,textarea,select")) continue;

        var t2 = normText(e2.textContent);
        if (!t2) continue;

        if (t2.indexOf(g) !== -1 && e2.children.length === 0) { found.push(e2); break; }
      }
    }

    // uniq
    var uniq = [];
    for (var u = 0; u < found.length; u++) if (uniq.indexOf(found[u]) === -1) uniq.push(found[u]);
    return uniq;
  }

  function markOrbs(list) {
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      var t = normText(e.textContent || "");
      if (isBulletText(t)) e.classList.add("alltera-orb");
    }
  }

  function typeOne(el) {
    if (!el || el.dataset.allteraTyped === "1") return;

    var t = normText(el.textContent || "");
    if (!t) return;

    el.dataset.allteraTyped = "1";
    el.classList.add("alltera-typing");
    el.classList.add("alltera-cursor");

    var bulletPrefix = (isBulletText(t) && el.tagName !== "LI") ? "• " : "";
    el.textContent = bulletPrefix;

    var i = 0;
    setTimeout(function tick() {
      if (i < t.length) {
        i++;
        el.textContent = bulletPrefix + t.slice(0, i);
        setTimeout(tick, TYPE_SPEED);
      }
    }, TYPE_DELAY + TYPE_START_DELAY);
  }

  function runTyping(list) {
    if (!list || !list.length) return;

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            typeOne(en.target);
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });

      list.forEach(function (e) { io.observe(e); });
    } else {
      list.forEach(typeOne);
    }
  }

  // -----------------------------
  // 3) PILLS (cover bullets + product lists)
  // -----------------------------
  var PILLS_STYLE_ID = "alltera-cover-pills-style";

  function ensurePillsStyle() {
    if (document.getElementById(PILLS_STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = PILLS_STYLE_ID;
    style.textContent =
      ".alltera-pills{display:flex;flex-direction:column;gap:14px;margin-top:6px;padding:0;list-style:none}" +
      ".alltera-pills .alltera-pill, .alltera-pills > li.alltera-pill{position:relative;padding:18px 22px 18px 42px;" +
      "border-radius:999px;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.55));" +
      "box-shadow:0 12px 26px rgba(0,0,0,.25);color:#fff;font-weight:500;line-height:1.35;max-width:560px;list-style:none}" +
      ".alltera-pill::before{content:'•';position:absolute;left:18px;top:50%;transform:translateY(-52%);font-size:18px;opacity:.9}" +
      "@media(max-width:720px){.alltera-pills .alltera-pill, .alltera-pills > li.alltera-pill{border-radius:26px;padding:16px 18px 16px 38px;max-width:100%}}";
    document.head.appendChild(style);
  }

  function isTypedKnownText(t) {
    for (var i = 0; i < TEXTS.length; i++) if (t === TEXTS[i]) return true;
    return false;
  }

  function splitToItems(text) {
    return (text || "")
      .replace(/\r/g, "")
      .split("•")
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .reduce(function (acc, s) {
        var parts = s.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
        return acc.concat(parts);
      }, []);
  }

  // case A: one element contains multiple "•"
  function enhanceMultiBulletElement(el) {
    if (!el || el.dataset.allteraPills === "1") return;
    if (el.closest("a,button,input,textarea,select")) return;
    if (el.tagName === "LI") return; // lists handled separately

    var raw = (el.innerText || el.textContent || "").trim();
    if (!raw) return;

    var norm = normText(raw);
    if (isTypedKnownText(norm)) return;

    var items = splitToItems(raw);
    if (items.length < 2) return;

    var wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    for (var i = 0; i < items.length; i++) {
      var pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = items[i];
      wrap.appendChild(pill);
    }

    el.innerHTML = "";
    el.appendChild(wrap);
    el.dataset.allteraPills = "1";
  }

  // case B: consecutive paragraphs starting with "•" (desktop layouts sometimes do that)
  function enhanceBulletGroups() {
    var candidates = Array.prototype.slice.call(document.querySelectorAll("p,div"));
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (!el || el.dataset.allteraPillsGroup === "1") continue;
      if (el.closest("a,button,input,textarea,select")) continue;
      if (el.children.length > 0) continue;

      var txt = (el.textContent || "").trim();
      if (!txt) continue;

      var startsBullet = /^[•\u2022\-\–\—]\s+/.test(txt);
      if (!startsBullet) continue;

      var n = normText(txt);
      if (isTypedKnownText(n)) continue;

      // collect group of siblings
      var parent = el.parentElement;
      if (!parent) continue;

      var group = [el];
      var next = el.nextElementSibling;
      while (next && group.length < 12) {
        if (next.children.length > 0) break;
        var nt = (next.textContent || "").trim();
        if (!nt) break;
        if (!/^[•\u2022\-\–\—]\s+/.test(nt)) break;

        var nn = normText(nt);
        if (isTypedKnownText(nn)) break;

        group.push(next);
        next = next.nextElementSibling;
      }

      if (group.length >= 2) {
        var box = document.createElement("div");
        box.className = "alltera-pills";

        for (var g = 0; g < group.length; g++) {
          var t = normText(group[g].textContent || "");
          var pill2 = document.createElement("div");
          pill2.className = "alltera-pill";
          pill2.textContent = t;
          box.appendChild(pill2);
        }

        parent.insertBefore(box, group[0]);

        for (var r = 0; r < group.length; r++) {
          group[r].dataset.allteraPillsGroup = "1";
          group[r].style.display = "none";
        }
      }
    }
  }

  // case C: product pages ul/li (Характеристики / Комплектация)
  function isNearSectionTitle(ul, titles) {
    var el = ul;
    for (var up = 0; up < 3 && el; up++) {
      var prev = el.previousElementSibling;
      for (var step = 0; step < 3 && prev; step++) {
        var t = normText(prev.textContent || "");
        for (var i = 0; i < titles.length; i++) if (t === titles[i]) return true;
        prev = prev.previousElementSibling;
      }
      el = el.parentElement;
    }
    return false;
  }

  function enhanceProductLists() {
    var uls = Array.prototype.slice.call(document.querySelectorAll("ul"));
    for (var i = 0; i < uls.length; i++) {
      var ul = uls[i];
      if (!ul || ul.dataset.allteraPillsList === "1") continue;
      if (ul.closest("header,footer,nav")) continue;

      var lis = ul.querySelectorAll(":scope > li");
      if (!lis || lis.length < 2) continue;
      if (lis.length > 12) continue; // safety

      // must be in the right section
      if (!isNearSectionTitle(ul, ["Характеристики", "Комплектация"])) continue;

      ul.classList.add("alltera-pills");
      for (var k = 0; k < lis.length; k++) {
        var li = lis[k];
        li.classList.add("alltera-pill");
        li.textContent = normText(li.textContent || "");
      }
      ul.dataset.allteraPillsList = "1";
    }
  }

  // -----------------------------
  // 4) RUNNER + OBSERVER (debounced)
  // -----------------------------
  function runAll() {
    ensureBgStyle();
    ensureBgDiv();

    ensureTypeStyle();
    ensurePillsStyle();

    // typing/orbs
    var list = getTextNodesForTyping();
    markOrbs(list);
    runTyping(list);

    // pills (cover + product)
    var multi = Array.prototype.slice.call(document.querySelectorAll("p,div,span"));
    for (var i = 0; i < multi.length; i++) enhanceMultiBulletElement(multi[i]);
    enhanceBulletGroups();
    enhanceProductLists();
  }

  function start() {
    if (!document.body) return;

    runAll();

    if ("MutationObserver" in window) {
      var tm = 0;
      var mo = new MutationObserver(function () {
        clearTimeout(tm);
        tm = setTimeout(runAll, 250);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } else {
      setInterval(runAll, 1200);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
</script>
