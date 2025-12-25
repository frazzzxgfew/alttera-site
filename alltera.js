(() => {
  const VERSION = "9";
  window.ALLTERA = window.ALLTERA || {};
  window.ALLTERA.version = VERSION;

  const TARGET_TILE_IDS = ["tile-cover-KWEVvb", "tile-cover-BXq5Sx", "tile-cover-ECtfsG"];

  function normalizeLines(raw) {
    const text = (raw || "")
      .replace(/\r/g, "")
      .replace(/\u00a0/g, " ")
      .trim();

    // 1) сначала пробуем по строкам
    let lines = text
      .split(/\n+/)
      .map(l => l.replace(/^[\s•\u2022·\-–—]+/, "").trim())
      .filter(Boolean);

    // 2) если всё слиплось в одну строку, режем по маркерам "•" / "·"
    if (lines.length <= 1 && /[•\u2022·]/.test(text)) {
      lines = text
        .split(/[•\u2022·]/g)
        .map(l => l.trim())
        .filter(Boolean);
    }

    return lines;
  }

  function splitDescriptionToPills(tileEl) {
    const desc = tileEl.querySelector(".ins-tile__description");
    if (!desc) return;

    // если уже делали — не трогаем (но если Ecwid перерисовал DOM, атрибут исчезнет и мы сделаем заново)
    if (desc.dataset.allteraPills === "1") return;

    const raw = desc.innerText || "";
    const lines = normalizeLines(raw);

    // если нечего делить — выходим
    if (lines.length < 2) return;

    // помечаем, чтобы не зациклиться
    desc.dataset.allteraPills = "1";

    // очищаем и строим "пилюли"
    desc.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    for (const line of lines) {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = line;
      wrap.appendChild(pill);
    }

    desc.appendChild(wrap);
  }

  function run() {
    for (const id of TARGET_TILE_IDS) {
      const tile = document.getElementById(id);
      if (tile) splitDescriptionToPills(tile);
    }
  }

  // запуск + защита от SPA/перерендера
  const schedule = (() => {
    let raf = 0;
    return () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    };
  })();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }

  // Ecwid часто перерисовывает секции → наблюдаем за DOM
  const mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // и контрольный прогон на всякий случай
  setInterval(run, 1500);

  console.log("[ALLTERA] loaded", VERSION);
})();
