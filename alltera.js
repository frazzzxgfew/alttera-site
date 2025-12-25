(() => {
  const TARGET_TILE_IDS = [
    "tile-cover-KWEVvb", // Стайлеры для волос
    "tile-cover-BXq5Sx", // Массажные пистолеты
  ];

  const STYLE_ID = "alltera-pill-style-v3";

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;

    const css = `
      .alltera-pill-list{
        display:flex;
        flex-direction:column;
        gap:14px;
        margin-top: 8px;
      }
      .alltera-pill{
        position:relative;
        display:block;
        max-width: 680px;
        padding: 18px 26px 18px 54px;
        border-radius: 9999px;
        background: rgba(40,40,42,0.92);
        color: #fff;
        box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        line-height: 1.35;
        margin: 0;
        white-space: normal;
      }
      .alltera-pill::before{
        content: "•";
        position:absolute;
        left: 26px;
        top: 50%;
        transform: translateY(-50%);
        opacity: .9;
        font-size: 18px;
      }

      /* чуть аккуратнее на мобилке */
      @media (max-width: 600px){
        .alltera-pill{
          max-width: 100%;
          border-radius: 24px;
          padding: 16px 18px 16px 44px;
        }
        .alltera-pill::before{ left: 18px; }
      }
    `;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function splitToItems(text) {
    const t = (text || "")
      .replace(/\u00A0/g, " ")
      .replace(/\r/g, "\n")
      .trim();

    // основной кейс: буллеты "•" или "·"
    let parts = t.split(/[•·]\s*/g).map(s => s.trim()).filter(Boolean);

    // запасной: если вдруг буллеты исчезли — режем по переносам
    if (parts.length < 2) {
      parts = t.split(/\n+/g).map(s => s.trim()).filter(Boolean);
    }

    return parts;
  }

  function renderPillsForTile(tileId) {
    const tile = document.getElementById(tileId);
    if (!tile) return false;

    const desc = tile.querySelector(".ins-tile__description");
    if (!desc) return false;

    // не трогаем второй раз
    if (desc.dataset.allteraPills === "1") return true;

    const p = desc.querySelector("p");
    if (!p) return false;

    const items = splitToItems(p.innerText || p.textContent || "");
    if (items.length < 2) return false;

    const list = document.createElement("div");
    list.className = "alltera-pill-list";

    for (const item of items) {
      const pill = document.createElement("p");
      pill.className = "alltera-pill";
      pill.textContent = item;
      list.appendChild(pill);
    }

    desc.innerHTML = "";
    desc.appendChild(list);
    desc.dataset.allteraPills = "1";

    return true;
  }

  function apply() {
    injectCSS();
    TARGET_TILE_IDS.forEach(renderPillsForTile);
  }

  // 1) сразу пробуем
  apply();

  // 2) несколько попыток (на случай поздней перерисовки Vue)
  let tries = 0;
  const t = setInterval(() => {
    apply();
    tries++;
    if (tries > 60) clearInterval(t); // ~15 секунд
  }, 250);

  // 3) и наблюдаем за DOM, чтобы не "схлопывалось" обратно
  const mo = new MutationObserver(() => apply());
  mo.observe(document.body, { childList: true, subtree: true });
})();
