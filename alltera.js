(() => {
  const STYLE_ID = 'alltera-bullets-style-v1';

  const esc = (s) =>
    s.replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#039;');

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
      .alltera-bullets{display:flex;flex-direction:column;gap:16px}
      .alltera-bullet{
        display:flex;gap:10px;align-items:flex-start;
        padding:18px 22px;border-radius:999px;
        background: rgba(33,36,39,.82);
        color:#fff;
        box-shadow: 0 12px 30px rgba(0,0,0,.18);
        max-width: 760px;
      }
      .alltera-bullet-dot{flex:0 0 auto;opacity:.9}
      .alltera-bullet-text{line-height:1.35}
      /* Чтобы на FULLSCREEN (Почему мы?) было по центру */
      .ins-tile--fullscreen-center .alltera-bullets{align-items:center}
    `;
    document.head.appendChild(st);
  }

  function extractBulletsFromText(text) {
    const raw = (text || '')
      .replace(/\r/g, '\n')
      .replace(/\u00A0/g, ' ')
      .trim();

    if (!raw) return [];

    // Сначала режем по строкам
    let lines = raw
      .split(/\n+/)
      .map(s => s.trim())
      .filter(Boolean);

    // Если всё в одной строке, но много "•" — режем по "•"
    if (lines.length === 1) {
      const parts = lines[0].split('•').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) lines = parts.map(s => '• ' + s);
    }

    // Берём только буллеты (если есть)
    const bullets = lines.filter(l => /^•\s*/.test(l));
    return bullets.length ? bullets : [];
  }

  function splitOneDescription(desc) {
    if (!desc || desc.dataset.allteraBulletsDone === '1') return false;

    // 1) если уже есть несколько <p>, берём их текст
    const ps = Array.from(desc.querySelectorAll(':scope > p'));
    let bullets = [];

    if (ps.length > 1) {
      bullets = ps.map(p => p.innerText.trim()).filter(Boolean).filter(t => /^•\s*/.test(t));
    }

    // 2) если буллетов нет — пробуем вытащить из общего текста (случай “в одном <p>”)
    if (bullets.length < 2) {
      bullets = extractBulletsFromText(desc.innerText);
    }

    if (bullets.length < 2) return false;

    ensureStyle();

    // Пересобираем контент
    desc.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'alltera-bullets';

    bullets.forEach(b => {
      const clean = b.replace(/^•\s*/, '').trim();
      const item = document.createElement('div');
      item.className = 'alltera-bullet';
      item.innerHTML = `<span class="alltera-bullet-dot">•</span><span class="alltera-bullet-text">${esc(clean)}</span>`;
      wrap.appendChild(item);
    });

    desc.appendChild(wrap);
    desc.dataset.allteraBulletsDone = '1';
    return true;
  }

  function run() {
    document
      .querySelectorAll('.ins-tile--cover .ins-tile__description.ins-tile__format')
      .forEach(splitOneDescription);
  }

  // старт
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // сайт догружает блоки — держим observer
  const mo = new MutationObserver(() => run());
  mo.observe(document.body, { childList: true, subtree: true });
})();
