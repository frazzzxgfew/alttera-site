(function () {
  const VERSION = "alltera-combo-2025-12-26-v3";
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  if (window.__ALLTERA__.comboVersion === VERSION) return;
  window.__ALLTERA__.comboVersion = VERSION;

  // ====== НАСТРОЙКИ ПЕЧАТИ ======
  const TYPE_SPEED = 55;
  const TYPE_DELAY = 55;
  const SHOW_CURSOR = true;

  // Фразы, которые должны печататься (как у тебя было)
  const PHRASES = [
    "Alltera — умные устройства для заботы о себе.",
    "Почему мы?",
    "Мы выбираем устройства, которые реально упрощают жизнь — и дома, и после тренировок.",
    "Бережно и быстро: до 1600 Вт, 3 режима, нагрев до 100°C — без перегрева.",
    "Под любую задачу: 7 насадок для укладки + 8 для массажа.",
    "Точная настройка: 1800–3200 об/мин — от лёгкого расслабления до глубокой проработки.",
    "Удобно в руке: фен 450 г, массажёр 665 г – комфортно для дома и в дороге",
  ];
  const BULLET_PHRASES = PHRASES.slice(3);

  // ====== ID стилей/элементов ======
  const BG_STYLE_ID = "alltera-bg-style";
  const BG_EL_ID = "alltera-animated-bg";
  const UI_STYLE_ID = "alltera-ui-style";

  function normalizeText(s) {
    return (s || "")
      .replace(/\uFEFF/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[•\u2022\-\–\—]\s*/, "");
  }

  function ensureBg() {
    if (!document.body) return;
    if (!document.getElementById(BG_EL_ID)) {
      const d = document.createElement("div");
      d.id = BG_EL_ID;
      d.setAttribute("aria-hidden", "true");
      document.body.appendChild(d);
    }
  }

  function ensureStyles() {
    if (!document.getElementById(BG_STYLE_ID)) {
      const s = document.createElement("style");
      s.id = BG_STYLE_ID;
      s.textContent = `
html,body{background:#bdbdbd!important}
#${BG_EL_ID}{
  position:fixed;inset:0;z-index:2147483646;pointer-events:none;
  background:
    radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%),
    radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%),
    radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%),
    linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));
  background-size:260% 260%,260% 260%,260% 260%,500% 500%;
  animation:allteraShift 8s ease-in-out infinite;
  filter:saturate(0) contrast(2.3) brightness(1.05);
  opacity:1;mix-blend-mode:soft-light;
}
@keyframes allteraShift{
  0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}
  50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}
  100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}
}
@media(max-width:768px){
  #${BG_EL_ID}{
    background-size:220% 220%,220% 220%,220% 220%,420% 420%;
    animation-duration:10s;filter:saturate(0) contrast(1.7) brightness(1.05)
  }
}`;
      document.head.appendChild(s);
    }

    if (!document.getElementById(UI_STYLE_ID)) {
      const s = document.createElement("style");
      s.id = UI_STYLE_ID;
      s.textContent = `
/* курсор печати */
.alltera-typing{display:inline-block}
.alltera-cursor:after{
  content:'|';display:inline-block;margin-left:2px;opacity:.9;
  animation:allteraBlink 1s steps(2,end) infinite
}
@keyframes allteraBlink{0%,49%{opacity:1}50%,100%{opacity:0}}

/* контейнер "пилюль" */
.alltera-pills{display:flex;flex-direction:column;gap:14px;margin-top:6px}

/* сама "пилюля" (чёрная как у тебя на скрине) */
.alltera-pill{
  position:relative;
  padding:18px 22px 18px 42px;
  border-radius:999px;
  background:linear-gradient(90deg, rgba(0,0,0,.78), rgba(0,0,0,.55));
  box-shadow:0 12px 26px rgba(0,0,0,.25);
  color:#fff;
  font-weight:500;
  line-height:1.35;
  max-width:560px;
}
.alltera-pill::before{
  content:"•";
  position:absolute;left:18px;top:50%;
  transform:translateY(-52%);
  font-size:18px;opacity:.9;
}

/* если мы просто "превратили" p/li в pill — чтобы не ломать разметку */
.alltera-pillline{display:block}

/* мобилка */
@media (max-width: 720px){
  .alltera-pill{
    border-radius:26px;
    padding:16px 18px 16px 38px;
    max-width:100%;
  }
}`;
      document.head.appendChild(s);
    }
  }

  function splitToItems(text) {
    return (text || "")
      .replace(/\r/g, "")
      .split("•")
      .map((s) => s.trim())
      .filter(Boolean)
      .flatMap((s) => s.split("\n").map((x) => x.trim()).filter(Boolean));
  }

  function shouldSkip(el) {
    if (!el) return true;
    if (el.closest("a,button,input,textarea,select")) return true;
    if (el.dataset && (el.dataset.allteraPills === "1" || el.dataset.allteraPillLine === "1")) return true;
    // не трогаем элементы с вложенной разметкой (чтобы не ломать кнопки/ссылки/иконки)
    if (el.children && el.children.length > 0) return true;
    return false;
  }

  function makePillsInside(el, items) {
    if (!items || items.length < 2) return false;
    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";
    items.forEach((t) => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = normalizeText(t);
      wrap.appendChild(pill);
    });
    el.textContent = "";
    el.appendChild(wrap);
    el.dataset.allteraPills = "1";
    return true;
  }

  function makeSinglePill(el, text) {
    const t = normalizeText(text);
    if (!t) return false;
    el.textContent = t;
    el.classList.add("alltera-pill", "alltera-pillline");
    el.dataset.allteraPillLine = "1";
    return true;
  }

  function enhancePills() {
    // 1) элементы, где в одном абзаце несколько "•"
    const blocks = Array.from(document.querySelectorAll("p,div,span"))
      .filter((el) => !shouldSkip(el))
      .filter((el) => (el.innerText || "").includes("•"));

    blocks.forEach((el) => {
      const raw = (el.innerText || "").trim();
      const items = splitToItems(raw);
      if (items.length >= 2) {
        makePillsInside(el, items);
      } else if (/^\s*[•\u2022]/.test(raw)) {
        makeSinglePill(el, raw);
      }
    });

    // 2) li на страницах товаров (характеристики/комплектация) — делаем pill-стиль
    const lis = Array.from(document.querySelectorAll("li"))
      .filter((el) => !shouldSkip(el))
      .filter((el) => normalizeText(el.innerText || "").length > 0);

    lis.forEach((li) => {
      // не делаем pill для слишком длинных li, чтобы не превращать всё в гигантские бублики
      const t = normalizeText(li.innerText || "");
      if (!t) return;
      if (t.length > 140) return;
      // если это меню/футер — не трогаем
      if (li.closest("nav,footer,header")) return;

      li.classList.add("alltera-pill", "alltera-pillline");
      li.dataset.allteraPillLine = "1";
      li.textContent = t;
    });
  }

  function isBulletPhrase(t) {
    return BULLET_PHRASES.indexOf(t) !== -1;
  }

  function typeElement(el, text) {
    if (!el || el.dataset.allteraTyped === "1") return;
    const t = normalizeText(text);
    if (!t) return;

    el.dataset.allteraTyped = "1";
    el.classList.add("alltera-typing");
    if (SHOW_CURSOR) el.classList.add("alltera-cursor");

    // Для bullet-фраз НЕ добавляем "• " в текст — у нас точка рисуется ::before в pill
    const prefix = isBulletPhrase(t) && el.classList.contains("alltera-pill") ? "" : "";

    el.textContent = prefix;
    let i = 0;
    setTimeout(function tick() {
      if (i < t.length) {
        el.textContent = prefix + t.slice(0, ++i);
        setTimeout(tick, TYPE_SPEED);
      }
    }, TYPE_DELAY);
  }

  function collectTypingTargets() {
    // Печатаем те же фразы, но ищем их уже и внутри pill-элементов тоже
    const nodes = Array.from(document.querySelectorAll("h1,h2,h3,p,li,div.alltera-pill"));
    const targets = [];

    // 1) точное совпадение
    for (const el of nodes) {
      if (!el || !el.textContent) continue;
      if (el.closest("a,button,input,textarea,select")) continue;
      const t = normalizeText(el.textContent);
      if (!t) continue;
      if (PHRASES.includes(t)) targets.push(el);
    }

    // 2) подстрока (если система где-то добавляет лишние куски)
    for (const phrase of PHRASES) {
      if (targets.some((x) => normalizeText(x.textContent) === phrase)) continue;
      const found = nodes.find((el) => {
        if (!el || !el.textContent) return false;
        if (el.closest("a,button,input,textarea,select")) return false;
        if (el.children && el.children.length > 0) return false;
        const t = normalizeText(el.textContent);
        return t && t.indexOf(phrase) !== -1;
      });
      if (found) targets.push(found);
    }

    // уникальные
    return targets.filter((v, i, a) => a.indexOf(v) === i);
  }

  function applyTyping() {
    const list = collectTypingTargets();
    if (!list.length) return;

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              typeElement(en.target, en.target.textContent || "");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      list.forEach((el) => io.observe(el));
    } else {
      list.forEach((el) => typeElement(el, el.textContent || ""));
    }
  }

  function scan() {
    ensureStyles();
    ensureBg();
    enhancePills();
    applyTyping();
  }

  function boot() {
    if (!document.body) return;
    scan();

    // MutationObserver с троттлингом, чтобы работало на company.site при перерисовках/переходах
    if ("MutationObserver" in window) {
      let tm = 0;
      const mo = new MutationObserver(() => {
        clearTimeout(tm);
        tm = setTimeout(scan, 200);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    // на всякий случай ловим смену URL (у некоторых шаблонов есть внутренние переходы)
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(scan, 100);
      }
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
