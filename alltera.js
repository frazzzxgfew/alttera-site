(() => {
  // всегда создаём глобальный объект (чтобы не было undefined)
  window.__ALLTERA__ = window.__ALLTERA__ || {};
  const api = window.__ALLTERA__;

  api.pillsVersion = "cover-pills-v1";

  function injectCSS() {
    if (document.getElementById("alltera-cover-pills-style")) return;

    const css = `
/* убираем "одну большую плашку" у description (фон/паддинги должны быть у pill-ов) */
.alltera-cover-desc{
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

/* intro (обычный текст над плашками) */
.alltera-cover-intro{
  color: #111;
  opacity: .85;
  line-height: 1.35;
  margin: 0 0 14px 0;
  font-size: 16px;
}

/* контейнер плашек */
.alltera-pills{
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* сама плашка (как в "Почему мы?") */
.alltera-pill{
  position: relative;
  border-radius: 999px;
  padding: 16px 22px 16px 54px;
  color: #fff;
  background: rgba(0,0,0,.60);
  box-shadow: 0 10px 25px rgba(0,0,0,.22);
  line-height: 1.35;
}

/* точка снаружи слева */
.alltera-pill::before{
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
.alltera-pill::after{
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
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // делим по буллетам и переносам
  function splitToParts(text) {
    const raw = String(text || "").replace(/\r/g, "").trim();
    if (!raw) return [];

    // сначала пытаемся делить по буллетам
    const byBullets = raw
      .split(/[\u2022\u00B7]/g) // • или ·
      .map(t => t.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (byBullets.length >= 2) return byBullets;

    // если буллетов нет — делим по переносам
    const byLines = raw
      .split(/\n+/g)
      .map(t => t.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    return byLines;
  }

  function buildCoverPills(descEl) {
    if (!descEl || descEl.dataset.allteraPills === "1") return;

    const parts = splitToParts(descEl.innerText);
    if (parts.length < 2) return; // нечего “делить”

    // логика как "Почему мы?": intro + pills
    // если текст начинается с буллета — intro будет пустым, тогда считаем всё pills
    const hasIntro = !/^[\u2022\u00B7]/.test(String(descEl.innerText || "").trim());
    const intro = hasIntro ? parts[0] : "";
    const pills = hasIntro ? parts.slice(1) : parts;

    descEl.classList.add("alltera-cover-desc");
    descEl.dataset.allteraPills = "1";

    const htmlIntro = intro ? `<div class="alltera-cover-intro">${escapeHTML(intro)}</div>` : "";
    const htmlPills = `
      <div class="alltera-pills">
        ${pills.map(t => `<div class="alltera-pill">${escapeHTML(t)}</div>`).join("")}
      </div>
    `;

    descEl.innerHTML = htmlIntro + htmlPills;
  }

  function run() {
    injectCSS();

    document
      .querySelectorAll('[id^="tile-cover-"] .ins-tile__description')
      .forEach(buildCoverPills);
  }

  api.runCoverPills = run;

  // безопасный запуск + лог
  function safeRun() {
    try {
      run();
      console.info("[ALLTERA]", api.pillsVersion, "pills:", document.querySelectorAll(".alltera-pill").length);
    } catch (e) {
      console.error("[ALLTERA cover pills] error:", e);
    }
  }

  // старт
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeRun);
  } else {
    safeRun();
  }

  // Ecwid часто перерисовывает DOM — отслеживаем
  let t = null;
  new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(safeRun, 50);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
