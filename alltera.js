(() => {
  const STYLE_ID = 'alltera-pills-style-v2';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
      /* убираем “старую” плашку-овал, если она стилится через p */
      #tile-cover-KWEVvb .ins-tile__description p,
      #tile-cover-BXq5Sx .ins-tile__description p {
        background: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
      }

      .alltera-pilllist{
        display:flex;
        flex-direction:column;
        gap:16px;
      }

      /* стиль “как Почему мы?” — широкие капсулы */
      .alltera-pill{
        display:flex;
        align-items:flex-start;
        gap:12px;
        padding:18px 22px;
        border-radius:999px;
        background: rgba(33,36,39,.82);
        color:#fff;
        box-shadow: 0 12px 30px rgba(0,0,0,.18);
        max-width: 760px;
      }

      .alltera-pill-dot{flex:0 0 auto; opacity:.9}
      .alltera-pill-text{line-height:1.35}

      /* центрирование как на “Почему мы?” */
      #tile-cover-KWEVvb .alltera-pilllist,
      #tile-cover-BXq5Sx .alltera-pilllist{
        align-items:flex-start; /* можно поставить center, если хочешь по центру */
      }
    `;
    document.head.appendChild(st);
  }

  function escapeHtml(s) {
    return (s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // главное: режем по "•" / "·" и ПЕРВЫЙ кусок тоже считаем пунктом
  function parseItems(text) {
    const t = (text || '')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!t) return [];

    // режем по маркеру в середине строки тоже
    const parts = t
      .split(/[•·]/g)
      .map(s => s.trim())
      .filter(Boolean);

    return parts;
  }

  function renderPills(descEl) {
    if (!descEl) return false;
    if (descEl.querySelector('.alltera-pilllist')) return true;

    const items = parseItems(descEl.innerText);
    if (items.length < 2) return false; // если только один пункт — не трогаем

    ensureStyle();

    const wrap = document.createElement('div');
    wrap.className = 'alltera-pilllist';

    items.forEach(item => {
      const pill = document.createElement('div');
      pill.className = 'alltera-pill';
      pill.innerHTML = `
        <span class="alltera-pill-dot">•</span>
        <span class="alltera-pill-text">${escapeHtml(item)}</span>
      `;
      wrap.appendChild(pill);
    });

    descEl.innerHTML = '';
    descEl.appendChild(wrap);
    return true;
  }

  function run() {
    // именно два нужных блока
    const ids = ['tile-cover-KWEVvb', 'tile-cover-BXq5Sx'];
    ids.forEach(id => {
      const desc = document.querySelector(`#${id} .ins-tile__description.ins-tile__format`);
      renderPills(desc);
    });
  }

  // старт + догрузки
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  const mo = new MutationObserver(run);
  mo.observe(document.body, { childList: true, subtree: true });
})();
