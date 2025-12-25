(() => {
  // всегда создаём глобальный объект (чтобы не было undefined)
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  const api = window.__ALLTERA__;

  api.pillsVersion = "pills-v2";

  function splitToItems(text) {
    const raw = (text || "").replace(/\r/g, "").trim();
    if (!raw) return [];

    return raw
      .split(/\n+|(?:\s*[•·]\s*)/g)     // переносы + маркеры • / ·
      .map(s => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function buildPills(descEl) {
    if (!descEl || descEl.dataset.allteraPills === "1") return;

    const items = splitToItems(descEl.innerText);
    if (items.length < 2) return;

    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    for (const t of items) {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      wrap.appendChild(pill);
    }

    descEl.textContent = "";
    descEl.classList.add("alltera-pills-wrap");
    descEl.appendChild(wrap);
    descEl.dataset.allteraPills = "1";
  }

  function run() {
    document
      .querySelectorAll('[id^="tile-cover-"] .ins-tile__description')
      .forEach(buildPills);
  }

  api.runPills = run;

  function safeRun() {
    try {
      run();
      console.info("[ALLTERA pills]", api.pillsVersion, "pills:", document.querySelectorAll(".alltera-pill").length);
    } catch (e) {
      console.error("[ALLTERA pills] error:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeRun);
  } else {
    safeRun();
  }

  let t = null;
  new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(safeRun, 50);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();

// ===============================
// Cover pills (как "Почему мы?")
// ===============================
(function () {
  // чтобы не было undefined
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  window.__ALLTERA__.pillsVersion = "v4-cover";

  function injectCoverPillsCSS() {
    if (document.getElementById("alltera-cover-pills-style")) return;

    const css = `
      /* убираем "одну большую плашку", если она была на description */
      .alltera-cover-desc {
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }

      .alltera-cover-intro {
        color: #111;
        opacity: 0.85;
        line-height: 1.35;
        margin: 0 0 14px 0;
        font-size: 16px;
      }

      .alltera-pills {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .alltera-pill {
        position: relative;
        border-radius: 999px;
        padding: 16px 22px 16px 54px;
        color: #fff;
        background: rgba(0,0,0,.60);
        box-shadow: 0 10px 25px rgba(0,0,0,.22);
        line-height: 1.35;
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

  function escapeHTML(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function splitByBullets(text) {
    // делим по "•" и по "·" на всякий
    return String(text)
      .replace(/\r/g, "")
      .split(/[\u2022\u00B7]/g)
      .map(t => t.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function buildPillsHTML(items) {
    return `
      <div class="alltera-pills">
        ${items.map(t => `<div class="alltera-pill">${escapeHTML(t)}</div>`).join("")}
      </div>
    `;
  }

  function initCoverPills() {
    injectCoverPillsCSS();

    // ВАЖНО: работаем именно по cover-блокам
    const nodes = document.querySelectorAll(
      '[id^="tile-cover-"] .ins-tile__description:not([data-alltera-pills])'
    );

    nodes.forEach(desc => {
      const raw = (desc.innerText || "").trim();
      if (!raw) return;

      const parts = splitByBullets(raw);
      if (parts.length <= 1) return; // нечего “делить на блоки”

      const intro = parts[0];        // текст до первого буллета
      const pills = parts.slice(1);  // буллеты

      desc.classList.add("alltera-cover-desc");
      desc.setAttribute("data-alltera-pills", "1");

      desc.innerHTML = `
        <div class="alltera-cover-intro">${escapeHTML(intro)}</div>
        ${buildPillsHTML(pills)}
      `;
    });
  }

  // запуск + отслеживание динамической подгрузки
  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      initCoverPills();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initCoverPills();
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    });
  } else {
    initCoverPills();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
})();
