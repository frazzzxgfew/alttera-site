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
