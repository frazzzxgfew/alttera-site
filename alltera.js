// чтобы в консоли НЕ было undefined, если скрипт реально загрузился
window.__ALLTERA__ = window.__ALLTERA__ || {};

(() => {
  const STYLE_ID = "alltera-pills-style-v5";
  const SEL = '[id^="tile-cover-"] .ins-tile__description';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const css = `
      .alltera-desc--pills{
        background: transparent !important;
        padding: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        max-width: none !important;
      }
      .alltera-pills{
        display:flex;
        flex-direction:column;
        gap:14px;
        margin-top:14px;
        align-items:center;
      }
      .alltera-pill{
        position:relative;
        width:min(720px,100%);
        padding:18px 24px 18px 56px;
        border-radius:9999px;
        background:rgba(0,0,0,.55);
        box-shadow:0 18px 40px rgba(0,0,0,.28);
        backdrop-filter:blur(6px);
        -webkit-backdrop-filter:blur(6px);
        color:#fff;
        font-size:16px;
        line-height:1.35;
        text-align:center;
      }
      .alltera-pill::before{
        content:"•";
        position:absolute;
        left:28px;
        top:50%;
        transform:translateY(-50%);
        font-size:26px;
        line-height:1;
        opacity:.95;
      }
      @media (max-width:520px){
        .alltera-pill{ padding:16px 18px 16px 48px; font-size:14.5px; border-radius:28px; }
        .alltera-pill::before{ left:22px; }
      }
    `;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  const norm = (s) => (s || "").replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
  const splitToItems = (text) =>
    (text || "").split(/[•·]/g).map(norm).filter(Boolean);

  function buildPills(descEl) {
    if (!descEl || descEl.dataset.allteraPills === "1") return;

    const raw = (descEl.innerText || descEl.textContent || "").trim();
    if (!raw) return;

    const items = splitToItems(raw);
    if (items.length < 2) return;

    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    items.forEach((t) => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      wrap.appendChild(pill);
    });

    descEl.classList.add("alltera-desc--pills");
    descEl.textContent = "";
    descEl.appendChild(wrap);
    descEl.dataset.allteraPills = "1";
  }

  function scan(root = document) {
    // важно: учитываем, что root может БЫТЬ самой .ins-tile__description
    const list = [];

    if (root.nodeType === 1 && root.matches?.(SEL)) list.push(root);
    root.querySelectorAll?.(SEL).forEach((el) => list.push(el));

    list.forEach(buildPills);
  }

  function observe() {
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scan(document);
      });
    };

    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  try {
    injectStyles();
    scan(document);
    observe();

    window.__ALLTERA__.pillsVersion = "v5";
    window.__ALLTERA__.rescanPills = () => scan(document);

    console.log("[ALLTERA] pills v5 loaded");
  } catch (e) {
    window.__ALLTERA__.pillsError = String(e);
    console.error("[ALLTERA] pills error:", e);
  }
})();
