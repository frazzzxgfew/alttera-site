(() => {
  const VERSION = '2025-12-25_split_v3';

  window.ALLTERA = window.ALLTERA || {};
  window.ALLTERA.version = VERSION;

  function injectStyles() {
    if (document.getElementById('alltera-pill-styles')) return;
    const style = document.createElement('style');
    style.id = 'alltera-pill-styles';
    style.textContent = `
      .alltera-pill-list{display:flex;flex-direction:column;gap:12px}
      .alltera-pill{
        background:rgba(0,0,0,.65);
        color:#fff;
        border-radius:999px;
        padding:14px 18px;
        line-height:1.35;
        box-shadow:0 10px 24px rgba(0,0,0,.18);
        max-width:520px;
      }
      @media(max-width:600px){.alltera-pill{max-width:100%}}
    `;
    document.head.appendChild(style);
  }

  function splitTextToItems(raw) {
    if (!raw) return [];
    const t = raw.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/[•·]/.test(t)) return [];

    // режем по буллетам
    const parts = t
      .split(/[•·]/g)
      .map(s => s.trim())
      .filter(Boolean);

    return parts.length >= 2 ? parts : [];
  }

  function splitOneTile(tile) {
    const desc = tile.querySelector('.ins-tile__description');
    if (!desc) return false;
    if (desc.dataset.allteraSplit === '1') return false;

    const raw = (desc.innerText || '').trim();
    const items = splitTextToItems(raw);
    if (!items.length) return false;

    // Снимаем "пузырь" (иногда он на desc, иногда на первом <p>)
    const reset = (el) => {
      if (!el) return;
      el.style.background = 'transparent';
      el.style.boxShadow = 'none';
      el.style.padding = '0';
      el.style.borderRadius = '0';
      el.style.maxWidth = 'none';
    };
    reset(desc);
    reset(desc.firstElementChild);

    const list = document.createElement('div');
    list.className = 'alltera-pill-list';

    items.forEach(txt => {
      const pill = document.createElement('div');
      pill.className = 'alltera-pill';
      pill.textContent = txt;
      list.appendChild(pill);
    });

    desc.innerHTML = '';
    desc.appendChild(list);

    desc.dataset.allteraSplit = '1';
    return true;
  }

  function run() {
    injectStyles();
    const tiles = document.querySelectorAll('.ins-tile.ins-tile--cover');
    let changed = 0;
    tiles.forEach(t => { if (splitOneTile(t)) changed++; });
    window.ALLTERA.lastSplitCount = changed;
  }

  // чтобы можно было руками дернуть
  window.ALLTERA.splitCovers = run;

  // старт + догоняем перерисовки
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(run);
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });

  setTimeout(run, 500);
  setTimeout(run, 1500);
})();
