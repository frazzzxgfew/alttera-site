(() => {
  const VERSION = "alltera-merged-typing+pills+bg-2025-12-26-v1";
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  window.__ALLTERA__.mergedVersion = VERSION;

  // ===== настройки печатания =====
  const TYPE_SPEED = 55;     // скорость (мс на символ)
  const TYPE_DELAY = 250;    // пауза перед стартом набора

  // Тексты для печатания (как в твоём старом коде)
  const TYPING_TEXTS = [
    "Alltera — умные устройства для заботы о себе.",
    "Почему мы?",
    "Мы выбираем устройства, которые реально упрощают жизнь — и дома, и после тренировок.",
    "Бережно и быстро: до 1600 Вт, 3 режима, нагрев до 100°C — без перегрева.",
    "Под любую задачу: 7 насадок для укладки + 8 для массажа.",
    "Точная настройка: 1800–3200 об/мин — от лёгкого расслабления до глубокой проработки.",
    "Удобно в руке: фен 450 г, массажёр 665 г – комфортно для дома и в дороге"
  ];
  const PILL_TYPED_TEXTS = new Set(TYPING_TEXTS.slice(3)); // эти строки печатаем внутри "пилюль"

  // ===== стили =====
  const STYLE_ID = "alltera-merged-style";
  const BG_ID = "alltera-animated-bg";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* ===== фон ===== */
      html,body{background:#bdbdbd!important}
      #${BG_ID}{
        position:fixed; inset:0;
        z-index:2147483646;
        pointer-events:none;
        background:
          radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%),
          radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%),
          radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%),
          linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));
        background-size:260% 260%,260% 260%,260% 260%,500% 500%;
        animation:allteraShift 8s ease-in-out infinite;
        filter:saturate(0) contrast(2.3) brightness(1.05);
        opacity:1;
        mix-blend-mode:soft-light;
      }
      @keyframes allteraShift{
        0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}
        50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}
        100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}
      }
      @media(max-width:768px){
        #${BG_ID}{
          background-size:220% 220%,220% 220%,220% 220%,420% 420%;
          animation-duration:10s;
          filter:saturate(0) contrast(1.7) brightness(1.05);
        }
      }

      /* ===== печатание ===== */
      .alltera-typing{display:inline-block}
      .alltera-cursor:after{
        content:'|';
        display:inline-block;
        margin-left:2px;
        opacity:.9;
        animation:allteraBlink 1s steps(2,end) infinite
      }
      @keyframes allteraBlink{0%,49%{opacity:1}50%,100%{opacity:0}}

      /* ===== "пилюли" ===== */
      .alltera-pills{
        display:flex;
        flex-direction:column;
        gap:14px;
        margin-top:6px;
        padding:0;
      }
      /* чтобы списки UL/OL не рисовали маркеры */
      ul.alltera-pills, ol.alltera-pills{list-style:none!important; margin:0!important}

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
        margin:0;
      }
      .alltera-pill::before{
        content:"•";
        position:absolute;
        left:18px;
        top:50%;
        transform:translateY(-52%);
        font-size:18px;
        opacity:.9;
      }
      @media(max-width:720px){
        .alltera-pill{
          border-radius:26px;
          padding:16px 18px 16px 38px;
          max-width:100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureBg() {
    if (document.getElementById(BG_ID)) return;
    const d = document.createElement("div");
    d.id = BG_ID;
    d.setAttribute("aria-hidden", "true");
    document.body.appendChild(d);
  }

  // ===== утилиты =====
  function norm(s) {
    return (s || "")
      .replace(/\uFEFF/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/\r/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[•\u2022\-\–\—]\s*/, ""); // убрать ведущий маркер
  }

  function splitToItems(text) {
    return (text || "")
      .replace(/\r/g, "")
      .split(/[•\u2022]/g)
      .map(s => s.trim())
      .filter(Boolean)
      .flatMap(s => s.split("\n").map(x => x.trim()).filter(Boolean))
      .map(x => norm(x))
      .filter(Boolean);
  }

  function isInteractiveContainer(el) {
    return !!(el && el.querySelector && el.querySelector("a,button,input,textarea,select"));
  }

  // ===== 1) Пилюли в “описаниях” (когда все пункты в одном тексте) =====
  function enhanceBulletTextToPills(desc) {
    if (!desc || desc.dataset.allteraPills === "1") return;
    if (isInteractiveContainer(desc)) return;

    const raw = (desc.innerText || desc.textContent || "").trim();
    if (!raw) return;

    // Нужно хотя бы 2 пункта
    const items = splitToItems(raw);
    if (items.length < 2) return;

    const pills = document.createElement("div");
    pills.className = "alltera-pills";

    items.forEach(t => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      pills.appendChild(pill);
    });

    desc.innerHTML = "";
    desc.appendChild(pills);
    desc.dataset.allteraPills = "1";
  }

  // ===== 2) Пилюли из списков UL/OL (обычно это “десктоп-версия” блоков) =====
  function enhanceListToPills(list) {
    if (!list || list.dataset.allteraPills === "1") return;
    const lis = Array.from(list.children).filter(x => x && x.tagName === "LI");
    if (lis.length < 2) return;

    // чтобы не снести меню/футер — фильтр по наличию маркеров/коротких пунктов
    const joined = norm(list.textContent || "");
    const looksLikeBenefits = /1600|100°|об\/мин|насадок|восстановлен|напряжен|режим/i.test(joined);
    if (!looksLikeBenefits) return;

    list.classList.add("alltera-pills");
    list.dataset.allteraPills = "1";

    lis.forEach(li => {
      if (li.dataset.allteraTyped === "1") return; // если уже печатаем — не трогаем
      li.classList.add("alltera-pill");
    });
  }

  // ===== 3) Печатание =====
  function findBestElementForText(target) {
    const nodes = Array.from(document.querySelectorAll("h1,h2,h3,p,li,div,span"));
    const tgt = norm(target);
    let best = null;
    let bestLen = Infinity;

    for (const el of nodes) {
      if (!el || !el.textContent) continue;
      if (el.closest("a,button,input,textarea,select")) continue;

      const t = norm(el.textContent);
      if (!t) continue;

      // точное совпадение — сразу берем
      if (t === tgt) return el;

      // иначе — пробуем "вхождение", но не берем огромные контейнеры
      if (t.includes(tgt)) {
        const len = t.length;
        if (len < bestLen && len <= tgt.length + 80) {
          best = el;
          bestLen = len;
        }
      }
    }
    return best;
  }

  function typeInto(el, text) {
    if (!el || el.dataset.allteraTyped === "1") return;

    el.dataset.allteraTyped = "1";

    // если это одна из “пунктов преимуществ” — оформляем как пилюлю
    const t = norm(text);
    if (PILL_TYPED_TEXTS.has(t)) {
      el.classList.add("alltera-pill");
      if (el.parentElement) {
        el.parentElement.classList.add("alltera-pills");
        if (el.parentElement.tagName === "UL" || el.parentElement.tagName === "OL") {
          el.parentElement.classList.add("alltera-pills");
        }
      }
    }

    const span = document.createElement("span");
    span.className = "alltera-typing alltera-cursor";
    span.textContent = "";

    el.innerHTML = "";
    el.appendChild(span);

    let i = 0;
    setTimeout(function tick() {
      if (i < t.length) {
        span.textContent = t.slice(0, ++i);
        setTimeout(tick, TYPE_SPEED);
      }
    }, TYPE_DELAY);
  }

  function runTyping() {
    // запускаем печатание только один раз на элемент (через dataset)
    for (const txt of TYPING_TEXTS) {
      const el = findBestElementForText(txt);
      if (el) typeInto(el, txt);
    }
  }

  // ===== общий скан =====
  function scan() {
    ensureStyles();
    if (document.body) ensureBg();

    // “описания” плиток/секций (параграфы с • • •)
    document
      .querySelectorAll(".ins-tile__description, .ins-tile__text, [class*='__description']")
      .forEach(enhanceBulletTextToPills);

    // списки (часто десктоп-версия)
    document.querySelectorAll("ul,ol").forEach(enhanceListToPills);

    // печатание
    runTyping();
  }

  function boot() {
    scan();

    // один MutationObserver на всё, с троттлингом
    let tm = 0;
    const mo = new MutationObserver(() => {
      clearTimeout(tm);
      tm = setTimeout(scan, 250);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
