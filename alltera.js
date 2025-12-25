(() => {
  /* GLOBAL */
  const api = (window.__ALLTERA__ = window.__ALLTERA__ || {});
  api.pillsVersion = "cover-pills-v5";

  const COVER_DESC_SELECTOR = '[id^="tile-cover-"] .ins-tile__description';

  function ensureStyles() {
    if (document.getElementById("alltera-cover-pills-style")) return;

    const css = `
      /* убираем большую "плашку" на description, чтобы остались отдельные блоки */
      .alltera-cover-desc {
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }

      .alltera-cover-intro {
        color: #111;
        opacity: .85;
        line-height: 1.35;
        margin: 0 0 14px 0;
        font-size: 16px;
        max-width: 560px;
      }

      .alltera-pills {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: 560px;
      }

      .alltera-pill {
        position: relative;
        border-radius: 999px;
        padding: 16px 22px 16px 54px;
        color: #fff;
        background: rgba(0,0,0,.60);
        box-shadow: 0 10px 25px rgba(0,0,0,.22);
        line-height: 1.35;
        font-size: 16px;
      }

      /* точка снаружи слева (как на "Почему мы?") */
      .alltera-pill::before {
        content: "";
        position: absolute;
        left: -18px;
        top: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,.75);
        transform: translateY(-50%);
      }

      /* точка внутри */
      .alltera-pill::after {
        content: "";
        position: absolute;
        left: 22px;
        top: 50%;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,.55);
        transform: translateY(-50%);
      }
    `;

    const style = document.createElement("style");
    style.id = "alltera-cover-pills-style";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function splitCoverText(raw) {
    const text = String(raw || "").replace(/\r/g, "").trim();
    if (!text) return null;

    // если есть буллеты — режем по ним
    if (text.includes("•") || text.includes("·")) {
      const parts = text
        .split(/[•·]/g)
        .map(s => s.replace(/\s+/g, " ").trim())
        .filter(Boolean);

      if (parts.length <= 1) return null;
      return { intro: parts[0], items: parts.slice(1) };
    }

    // fallback: если буллетов нет, но есть переносы
    const lines = text
      .split(/\n+/g)
      .map(s => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (lines.length <= 1) return null;
    return { intro: lines[0], items: lines.slice(1) };
  }

  function buildCoverPills(desc) {
    if (!desc) return;
    if (desc.dataset.allteraPills === api.pillsVersion) return;

    const parsed = splitCoverText(desc.innerText);
    if (!parsed || !parsed.items.length) return;

    ensureStyles();

    // чистим и собираем DOM заново
    desc.classList.add("alltera-cover-desc");
    desc.textContent = "";

    if (parsed.intro) {
      const introEl = document.createElement("div");
      introEl.className = "alltera-cover-intro";
      introEl.textContent = parsed.intro;
      desc.appendChild(introEl);
    }

    const list = document.createElement("div");
    list.className = "alltera-pills";

    parsed.items.forEach(t => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      list.appendChild(pill);
    });

    desc.appendChild(list);
    desc.dataset.allteraPills = api.pillsVersion;
  }

  function run() {
    document.querySelectorAll(COVER_DESC_SELECTOR).forEach(buildCoverPills);
  }

  api.runCoverPills = run;

  // безопасный запуск + отложенная подгрузка Ecwid
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      try { run(); } catch (e) { console.error("[ALLTERA cover pills] error:", e); }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
})();
