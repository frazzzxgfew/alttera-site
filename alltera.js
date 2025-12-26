(() => {
  const VERSION = "cover-pills-2025-12-26-v2";

  window.__ALLTERA__ = window.__ALLTERA__ || {};
  window.__ALLTERA__.pillsVersion = VERSION;

  const STYLE_ID = "alltera-cover-pills-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .alltera-pills {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 6px;
      }

      .alltera-pill {
        position: relative;
        padding: 18px 22px 18px 42px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(0,0,0,.78), rgba(0,0,0,.55));
        box-shadow: 0 12px 26px rgba(0,0,0,.25);
        color: #fff;
        font-weight: 500;
        line-height: 1.35;
        max-width: 560px;
      }

      .alltera-pill::before {
        content: "•";
        position: absolute;
        left: 18px;
        top: 50%;
        transform: translateY(-52%);
        font-size: 18px;
        opacity: .9;
      }

      /* ВАЖНО: на десктопе у описаний часто стоит ограничение/overflow — снимаем только там, где pills включены */
      .ins-tile__description[data-alltera-pills="1"]{
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
      }

      @media (max-width: 720px) {
        .alltera-pill {
          border-radius: 26px;
          padding: 16px 18px 16px 38px;
          max-width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function splitToItems(text) {
    return text
      .replace(/\r/g, "")
      .split("•")
      .map(s => s.trim())
      .filter(Boolean)
      .flatMap(s => s.split("\n").map(x => x.trim()).filter(Boolean));
  }

  function enhanceCoverTile(tile) {
    const desc = tile.querySelector(".ins-tile__description");
    if (!desc) return;
    if (desc.dataset.allteraPills === "1") return;

    // textContent не зависит от того, видим блок или нет (в отличие от innerText)
    const raw = (desc.textContent || "").trim();
    if (!raw) return;

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

  function scan() {
    document.querySelectorAll('[id^="tile-cover-"]').forEach(enhanceCoverTile);
  }

  // планировщик, чтобы не вызывать scan() 1000 раз подряд на мутациях
  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleScan);
  } else {
    scheduleScan();
  }

  const mo = new MutationObserver(scheduleScan);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
