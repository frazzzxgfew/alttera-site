(() => {
  // защита от двойного запуска
  if (window.__alltera_pills_inited) return;
  window.__alltera_pills_inited = true;

  function injectStyles() {
    if (document.getElementById('alltera-pill-styles')) return;
    const style = document.createElement('style');
    style.id = 'alltera-pill-styles';
    style.textContent = `
      /* Когда мы превратили описание в отдельные "пилюли" — убираем старый "овал" */
      .alltera-split .ins-tile__description{
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
        max-width: none !important;
      }

      .alltera-pill-list{
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .alltera-pill{
        background: rgba(0,0,0,.65);
        color: #fff;
        border-radius: 999px;
        padding: 14px 18px;
        line-height: 1.35;
        box-shadow: 0 10px 24px rgba(0,0,0,.18);
        max-width: 520px;
      }

      /* На мобилке пусть "пилюли" занимают ширину колонки */
      @media (max-width: 600px){
        .alltera-pill{ max-width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeToItems(text) {
    if (!text) return [];
    let t = text
      .replace(/\r/g, '')
      .replace(/\u00A0/g, ' ')
      .trim();

    // Превращаем любые варианты " • " в перенос строки с маркером
    // (чтобы работало и когда пункты в одной строке)
    t = t.replace(/\s*[•·]\s*/g, '\n• ');
    t = t.replace(/^\n+/, '').trim();

    // Делим на строки, убираем маркеры
    const lines = t
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.replace(/^•\s*/, '').trim())
      .filter(Boolean);

    // Если вдруг маркеров не было — не трогаем
    return lines.length >= 2 ? lines : [];
  }

  function splitCoverDescriptionsToPills() {
    injectStyles();

    const coverTiles = document.querySelectorAll('.ins-tile.ins-tile--cover');
    coverTiles.forEach(tile => {
      // Уже обработано
      if (tile.classList.contains('alltera-split')) return;

      const desc = tile.querySelector('.ins-tile__description');
      if (!desc) return;

      // Если уже много <p> (как на "Почему мы?") — обычно трогать не надо
      // (там и так всё раздельно)
      const ps = desc.querySelectorAll('p');
      if (ps.length >= 2) return;

      // Берём текст
      const text = desc.innerText || '';
      if (!text.includes('•') && !text.includes('·')) return;

      const items = normalizeToItems(text);
      if (!items.length) return;

      // Строим пилюли
      const list = document.createElement('div');
      list.className = 'alltera-pill-list';

      items.forEach(item => {
        const pill = document.createElement('div');
        pill.className = 'alltera-pill';
        pill.textContent = item;
        list.appendChild(pill);
      });

      // Важно: очищаем и вставляем
      desc.innerHTML = '';
      desc.appendChild(list);

      tile.classList.add('alltera-split');
    });
  }

  // Дебаунс, чтобы не молотить на каждом DOM-изменении
  let t = null;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(splitCoverDescriptionsToPills, 50);
  }

  // Старт
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', splitCoverDescriptionsToPills);
  } else {
    splitCoverDescriptionsToPills();
  }

  // На случай если Ecwid/InstantSite перерисовывает блоки после загрузки
  const mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // И контрольный прогон через секунду
  setTimeout(splitCoverDescriptionsToPills, 1000);
})();
