(() => {
  const VERSION = "2025-12-25_pills_v3";
  const DEBUG = true; // потом можешь поставить false

  const log = (...a) => DEBUG && console.log("[ALLTERA]", ...a);

  // какие секции режем на "пилюли"
  const TILE_IDS = [
    "tile-cover-ECtfsG", // Почему мы?
    "tile-cover-KWEVvb", // Стайлеры для волос
    "tile-cover-BXq5Sx", // Массажные пистолеты
  ];

  function injectStylesOnce() {
    if (document.getElementById("alltera-pills-style")) return;

    const css = `
/* только внутри нужных cover-секций */
#tile-cover-ECtfsG .ins-tile__description,
#tile-cover-KWEVvb .ins-tile__description,
#tile-cover-BXq5Sx .ins-tile__description{
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* контейнер пилюль */
.alltera-pills{
  display:flex;
  flex-direction:column;
  gap:14px;
  max-width: 720px;
}

/* одна пилюля */
.alltera-pill{
  position: relative;
  padding: 18px 22px 18px 42px;
  border-radius: 999px;
  background: rgba(0,0,0,.68);
  color: #fff;
  line-height: 1.35;
  box-shadow: 0 18px 40px rgba(0,0,0,.25);
  font-size: 18px;
}

/* точка слева */
.alltera-pill::before{
  content:"";
  position:absolute;
  width:6px;
  height:6px;
  border-radius:50%;
  left:18px;
  top:50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,.9);
}

/* на мобиле чуть компактнее */
@media (max-width: 768px){
  .alltera-pill{ font-size: 16px; padding: 16px 18px 16px 40px; }
}
`;
    const style = document.createElement("style");
    style.id = "alltera-pills-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function normalizeText(s) {
    return (s || "")
      .replace(/\u00A0/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // главное: режем и когда пункты начинаются с "•", и когда "•" стоит внутри строки
  function splitIntoItems(raw) {
    const text = normalizeText(raw);

    if (!text) return [];

    // если есть буллеты — делим по ним (• или ·)
    if (/[•·]/.test(text)) {
      return text
        .split(/[•·]/g)
        .map(s => normalizeText(s))
        .map(s => s.replace(/^[-–—:.\s]+/, "").trim())
        .filter(Boolean);
    }

    // fallback: делим по пустым строкам/переносам
    const byLines = text
      .split(/\n+/g)
      .map(s => normalizeText(s))
      .filter(Boolean);

    return byLines;
  }

  function findDescriptionEl(tileEl) {
    // в cover-блоках описание обычно тут
    return tileEl.querySelector(".ins-tile__description.ins-tile__format")
      || tileEl.querySelector(".ins-tile__description");
  }

  function renderPills(descEl, items) {
    // сохраняем оригинал на всякий случай
    if (!descEl.dataset.allteraOriginalHtml) {
      descEl.dataset.allteraOriginalHtml = descEl.innerHTML;
    }

    descEl.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    items.forEach((item) => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = item;
      wrap.appendChild(pill);
    });

    descEl.appendChild(wrap);
  }

  function processTile(tileId) {
    const tile = document.getElementById(tileId);
    if (!tile) return false;

    const descEl = findDescriptionEl(tile);
    if (!descEl) return false;

    // защита от повторной перерисовки
    if (descEl.dataset.allteraPillsDone === "1") return true;

    const raw = descEl.innerText || descEl.textContent || "";
    const items = splitIntoItems(raw);

    if (items.length < 2) {
      log("skip (items<2):", tileId, items);
      return false;
    }

    renderPills(descEl, items);
    descEl.dataset.allteraPillsDone = "1";

    log("pills OK:", tileId, "items:", items.length);
    return true;
  }

  function tick() {
    injectStylesOnce();

    let any = false;
    for (const id of TILE_IDS) {
      any = processTile(id) || any;
    }
    return any;
  }

  function start() {
    window.__ALLTERA__ = { version: VERSION };
    log("loaded", VERSION);

    // 1) сразу
    tick();

    // 2) Ecwid часто перерисовывает DOM — ловим изменения
    const obs = new MutationObserver(() => tick());
    obs.observe(document.documentElement, { childList: true, subtree: true });

    // 3) и подстраховка таймером
    setInterval(tick, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
