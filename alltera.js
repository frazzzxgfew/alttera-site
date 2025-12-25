(() => {
  const VERSION = "pills-v1";

  function splitToItems(text) {
    const raw = (text || "").replace(/\r/g, "").trim();
    if (!raw) return [];

    // режем по маркерам • или ·, а также по переносам строк
    const parts = raw
      .split(/(?:\s*[•·]\s*|\n+)/g)
      .map(s => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    return parts;
  }

  function buildPills(descEl) {
    if (!descEl || descEl.dataset.allteraPills === "1") return;

    const items = splitToItems(descEl.innerText);
    if (items.length < 2) return; // если нечего делить — оставляем как есть

    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    items.forEach(t => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      wrap.appendChild(pill);
    });

    descEl.textContent = "";
    descEl.classList.add("alltera-pills-wrap");
    descEl.appendChild(wrap);
    descEl.dataset.allteraPills = "1";
  }

  function run() {
    // твой кейс: #tile-cover-XXXX внутри .ins-tile__description
    document
      .querySelectorAll('[id^="tile-cover-"] .ins-tile__description')
      .forEach(buildPills);
  }

  // старт
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  // если плитки/слайды подгружаются/меняются — ловим изменения
  let t = null;
  const mo = new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(run, 50);
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // чтобы у тебя больше не было "undefined" при проверке:
  window.__ALLTERA__ = { pillsVersion: VERSION, run };
})();
