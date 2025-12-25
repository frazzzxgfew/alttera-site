(() => {
  const VERSION = "cover-pills-2025-12-25-v1";

  // чтобы в консоли не было undefined
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
    // делим по "•" и по строкам, убираем пустое
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

    const raw = (desc.innerText || "").trim();
    if (!raw) return;

    const items = splitToItems(raw);

    // если нечего делить — не трогаем
    if (items.length < 2) return;

    const pills = document.createElement("div");
    pills.className = "alltera-pills";

    items.forEach(t => {
      const pill = document.createElement("div");
      pill.className = "alltera-pill";
      pill.textContent = t;
      pills.appendChild(pill);
    });

    // заменяем содержимое описания на наши "пилюли"
    desc.innerHTML = "";
    desc.appendChild(pills);
    desc.dataset.allteraPills = "1";
  }

  function scan() {
    document.querySelectorAll('[id^="tile-cover-"]').forEach(enhanceCoverTile);
  }

  // первичный запуск
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  // на случай если конструктор подгружает/перерисовывает блоки
  const mo = new MutationObserver(() => scan());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
