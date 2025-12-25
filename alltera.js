(() => {
  const STYLE_ID = "alltera-pills-style-v4";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const css = `
      /* Включаем режим "пилюль" только там, где мы его применили */
      .alltera-desc--pills{
        background: transparent !important;
        padding: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        max-width: none !important;
      }

      .alltera-pills{
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 14px;
        align-items: center;
      }

      .alltera-pill{
        position: relative;
        width: min(720px, 100%);
        padding: 18px 24px 18px 56px;
        border-radius: 9999px;
        background: rgba(0,0,0,.55);
        box-shadow: 0 18px 40px rgba(0,0,0,.28);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);

        color: #fff;
        font-size: 16px;
        line-height: 1.35;
        text-align: center;
      }

      .alltera-pill::before{
        content: "•";
        position: absolute;
        left: 28px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 26px;
        line-height: 1;
        opacity: .95;
      }

      @media (max-width: 520px){
        .alltera-pill{
          padding: 16px 18px 16px 48px;
          font-size: 14.5px;
          border-radius: 28px;
        }
        .alltera-pill::before{ left: 22px; }
      }
    `;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function normalizeItem(s) {
    return (s || "")
      .replace(/\s*\n\s*/g, " ")     // убираем переносы от переносов/переноса строк
      .replace(/\s+/g, " ")         // схлопываем пробелы
      .trim();
  }

  function splitToItems(text) {
    // Поддержка "•" и "·"
    return (text || "")
      .split(/[•·]/g)
      .map(normalizeItem)
      .filter(Boolean);
  }

  function buildPills(descEl) {
    if (!descEl || descEl.dataset.allteraPills === "1") return;

    const raw = (descEl.innerText || descEl.textContent || "").trim();
    if (!raw) return;

    const items = splitToItems(raw);
    if (items.length < 2) return; // если нечего делить — не трогаем

    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    for (const item of items) {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = item;
      wrap.appendChild(pill);
    }

    descEl.classList.add("alltera-desc--pills");
    descEl.textContent = "";
    descEl.appendChild(wrap);

    descEl.dataset.allteraPills = "1";
  }

  function scan(root = document) {
    // ТОЛЬКО hero-тайлы (как на скринах): id="tile-cover-..."
    const list = root.querySelectorAll?.('[id^="tile-cover-"] .ins-tile__description');
    if (!list || !list.length) return;

    list.forEach(buildPills);
  }

  function observe() {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node && node.nodeType === 1) scan(node);
        }
      }
    });

    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  injectStyles();
  scan();
  observe();

  // Чтобы НЕ было undefined и можно было проверить в консоли
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  window.__ALLTERA__.pillsVersion = "v4";
  window.__ALLTERA__.rescanPills = () => scan();

  console.log("[ALLTERA] pills v4 loaded");
})();
