// Функция для обработки буллет-списков на страницах
function styleBulletPoints() {
  // Находим все элементы, которые могут содержать преимущества
  const selectors = [
    '.product-description',
    '.product-details',
    '.description',
    '[class*="desc"]',
    '[class*="advantage"]',
    '[class*="feature"]',
    'p:has(span), p:has(strong), p:has(b)'
  ];
  
  let contentElements = [];
  
  // Собираем все возможные элементы с контентом
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.textContent.trim() && !contentElements.includes(el)) {
        contentElements.push(el);
      }
    });
  });
  
  // Функция для проверки, является ли текст пунктом списка
  function isBulletPoint(text) {
    const bulletIndicators = [
      '•', '▪', '▫', '○', '●', '■', '□', '–', '—', '-',
      '✓', '✔', '→', '⇒', '▶'
    ];
    
    const trimmedText = text.trim();
    
    // Проверяем начинается ли строка с буллет-символа
    if (bulletIndicators.some(bullet => trimmedText.startsWith(bullet))) {
      return true;
    }
    
    // Проверяем шаблоны типа "1.", "2.", "a)", "b)"
    const bulletPatterns = [
      /^\d+\./,           // "1.", "2."
      /^[a-zA-Z]\)/,      // "a)", "b)"
      /^\[.*?\]/,         // "[текст]"
      /^<strong>.*?<\/strong>/i, // Жирный текст в начале
      /^<b>.*?<\/b>/i     // Тег <b> в начале
    ];
    
    return bulletPatterns.some(pattern => pattern.test(trimmedText));
  }
  
  // Обрабатываем каждый элемент
  contentElements.forEach(element => {
    const html = element.innerHTML;
    
    // Разбиваем HTML на строки
    const lines = html.split(/<br\s*\/?>/i);
    
    if (lines.length <= 1) {
      // Если нет <br>, пробуем разбить по тегам параграфов
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const paragraphs = Array.from(tempDiv.children);
      
      if (paragraphs.length <= 1) {
        // Если нет явного разделения, ищем по содержимому
        const text = element.textContent;
        const possibleBullets = text.split(/\n|\r/).filter(line => line.trim());
        
        if (possibleBullets.length > 1 && possibleBullets.some(isBulletPoint)) {
          // Если найден текст с несколькими пунктами
          let newHTML = '';
          possibleBullets.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && isBulletPoint(trimmedLine)) {
              newHTML += `<div class="bullet-block">${trimmedLine}</div>`;
            } else {
              newHTML += `<div>${trimmedLine}</div>`;
            }
          });
          element.innerHTML = newHTML;
        }
      } else {
        // Если есть дочерние элементы (теги)
        let newHTML = '';
        paragraphs.forEach(child => {
          const text = child.textContent.trim();
          if (text && isBulletPoint(text)) {
            newHTML += `<div class="bullet-block">${child.innerHTML}</div>`;
          } else {
            newHTML += child.outerHTML;
          }
        });
        element.innerHTML = newHTML;
      }
    } else {
      // Если есть <br> теги для разделения
      let newHTML = '';
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && isBulletPoint(trimmedLine)) {
          newHTML += `<div class="bullet-block">${trimmedLine}</div>`;
        } else {
          newHTML += trimmedLine + '<br>';
        }
      });
      element.innerHTML = newHTML;
    }
  });
  
  // Добавляем CSS стили для блоков
  if (!document.querySelector('#bullet-styles')) {
    const style = document.createElement('style');
    style.id = 'bullet-styles';
    style.textContent = `
      .bullet-block {
        position: relative;
        padding: 12px 15px 12px 40px;
        margin: 8px 0;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 1px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .bullet-block:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        background: linear-gradient(135deg, #fff 0%, #f1f3f5 100%);
      }
      
      .bullet-block::before {
        content: '✓';
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        background: #4dabf7;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
      }
      
      .bullet-block strong,
      .bullet-block b {
        color: #1c7ed6;
        font-weight: 600;
      }
      
      /* Адаптивность */
      @media (max-width: 768px) {
        .bullet-block {
          padding: 10px 12px 10px 35px;
          margin: 6px 0;
        }
        
        .bullet-block::before {
          left: 12px;
          width: 20px;
          height: 20px;
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Запускаем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Небольшая задержка для полной загрузки контента
  setTimeout(styleBulletPoints, 500);
  
  // Также запускаем при изменениях в DOM (на случай динамического контента)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        setTimeout(styleBulletPoints, 300);
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Альтернативная версия для конкретных страниц (3 и 4)
function styleProductPages() {
  // Проверяем, находимся ли мы на странице с товаром
  const currentUrl = window.location.pathname;
  const productKeywords = ['fen', 'фен', 'massage', 'пистолет', 'pistol', 'gun'];
  
  const isProductPage = productKeywords.some(keyword => 
    currentUrl.toLowerCase().includes(keyword) || 
    document.title.toLowerCase().includes(keyword)
  );
  
  if (isProductPage) {
    console.log('Обработка страницы товара:', document.title);
    styleBulletPoints();
    
    // Дополнительная обработка для специфических элементов магазина
    const shopSpecificSelectors = [
      '.product-single__description',
      '.product__description',
      '.product-content',
      '.product-body'
    ];
    
    shopSpecificSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Ищем списки внутри этих элементов
        const lists = element.querySelectorAll('ul, ol');
        lists.forEach(list => {
          const items = list.querySelectorAll('li');
          items.forEach(item => {
            const bulletBlock = document.createElement('div');
            bulletBlock.className = 'bullet-block';
            bulletBlock.innerHTML = item.innerHTML;
            item.parentNode.replaceChild(bulletBlock, item);
          });
          // Заменяем список на div
          const listContainer = document.createElement('div');
          listContainer.className = 'bullet-container';
          while (list.firstChild) {
            listContainer.appendChild(list.firstChild);
          }
          list.parentNode.replaceChild(listContainer, list);
        });
      });
    });
  }
}

// Запускаем обе функции
document.addEventListener('DOMContentLoaded', function() {
  styleBulletPoints();
  styleProductPages();
});
