(() => {
  const VERSION = "alltera-pills-2025-12-25-v2";
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  window.__ALLTERA__.pillsVersion = VERSION;

  const STYLE_ID = "alltera-pills-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .alltera-pills{display:flex;flex-direction:column;gap:14px;margin-top:6px}
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
        position:absolute;
        left:18px;
        top:50%;
        transform:translateY(-52%);
        font-size:18px;
        opacity:.9;
      }
      @media (max-width:720px){
        .alltera-pill{border-radius:26px;padding:16px 18px 16px 38px;max-width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  function splitToItems(text) {
    return (text || "")
      .replace(/\r/g, "")
      .split("•")
      .map(s => s.trim())
      .filter(Boolean)
      .flatMap(s => s.split("\n").map(x => x.trim()).filter(Boolean));
  }

  function buildPills(items) {
    const pills = document.createElement("div");
    pills.className = "alltera-pills";
    items.forEach(t => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      pills.appendChild(pill);
    });
    return pills;
  }

  // 1) Instant Site cover-плитки (как у тебя было)
  function enhanceCoverTile(tile) {
    const desc = tile.querySelector(".ins-tile__description");
    if (!desc) return;
    if (desc.dataset.allteraPills === "1") return;

    const raw = (desc.innerText || "").trim();
    if (!raw) return;

    const items = splitToItems(raw);
    if (items.length < 2) return;

    desc.innerHTML = "";
    desc.appendChild(buildPills(items));
    desc.dataset.allteraPills = "1";
  }

  // 2) Товарные страницы / любые списки преимуществ (ul > li)
  function shouldSkipList(ul) {
    // не трогаем навигацию/шапку/подвал/хлебные крошки/служебные зоны
    if (ul.closest("nav, header, footer")) return true;
    if (ul.closest("[role='navigation'], .breadcrumbs, .breadcrumb, .footer, .header")) return true;
    // если список уже обработан
    if (ul.dataset.allteraPills === "1") return true;
    return false;
  }

  function enhanceUlToPills(ul) {
    if (shouldSkipList(ul)) return;

    const lis = Array.from(ul.querySelectorAll(":scope > li"));
    if (lis.length < 2) return;

    const items = lis
      .map(li => (li.innerText || "").trim())
      .filter(Boolean);

    if (items.length < 2) return;

    const pills = buildPills(items);
    ul.replaceWith(pills);
    // пометка на контейнере, чтобы не переделывать
    pills.dataset.allteraPills = "1";
  }

  // 3) Тексты с "•" (не только cover): если где-то в описании товара пункты записаны текстом
  function enhanceBulletsTextBlocks() {
    const candidates = Array.from(document.querySelectorAll("p, div, section"))
      .filter(el => {
        if (el.dataset.allteraPills === "1") return false;
        if (el.closest("nav, header, footer")) return false;
        // не лезем в очень большие контейнеры
        const txt = (el.innerText || "").trim();
        if (!txt) return false;
        if (txt.length > 600) return false;
        return txt.includes("•") || txt.includes("\n");
      });

    candidates.forEach(el => {
      const raw = (el.innerText || "").trim();
      const items = splitToItems(raw);
      if (items.length < 2) return;

      // чтобы не разносить весь контент: только если "похоже на список"
      // (короткие пункты)
      const avgLen = items.reduce((a, s) => a + s.length, 0) / items.length;
      if (avgLen > 140) return;

      el.innerHTML = "";
      el.appendChild(buildPills(items));
      el.dataset.allteraPills = "1";
    });
  }

  function scan() {
    // cover tiles
    document.querySelectorAll('[id^="tile-cover-"]').forEach(enhanceCoverTile);
    // списки (характеристики/комплектация/преимущества)
    document.querySelectorAll("ul").forEach(enhanceUlToPills);
    // текстовые буллеты
    enhanceBulletsTextBlocks();
  }

  // Дебаунс, чтобы MutationObserver не спамил
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
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  const mo = new MutationObserver(scheduleScan);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
