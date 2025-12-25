(() => {
  const STYLE_ID = "alltera-pills-style";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = `
      .alltera-pills{
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      .alltera-pill{
        position:relative;
        padding-left:18px;
        line-height:1.35;
      }
      .alltera-pill:before{
        content:"•";
        position:absolute;
        left:0;
        top:0;
      }
    `;
    document.head.appendChild(st);
  }

  function splitToPills(descEl) {
    if (!descEl || descEl.dataset.allteraPills === "1") return;

    const raw = (descEl.innerText || descEl.textContent || "").trim();
    if (!raw) return;

    // делим по "•" и по переводам строк (на всякий)
    const parts = raw
      .split("•")
      .map(s => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    // если нечего делить — не трогаем
    if (parts.length < 2) return;

    const wrap = document.createElement("div");
    wrap.className = "alltera-pills";

    parts.forEach(t => {
      const item = document.createElement("div");
      item.className = "alltera-pill";
      item.textContent = t;
      wrap.appendChild(item);
    });

    descEl.dataset.allteraPills = "1";
    descEl.innerHTML = "";
    descEl.appendChild(wrap);
  }

  function run() {
    ensureStyles();

    // Все cover-блоки
    document.querySelectorAll('[id^="tile-cover-"]').forEach(cover => {
      const desc = cover.querySelector(".ins-tile__description");
      splitToPills(desc);
    });
  }

  // старт
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  // подгрузки/перерисовки Ecwid
  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
