/* CLICK TV STREAMING | Identificación visual del catálogo.
   Emblemas de marcas vía Simple Icons CDN; favicon oficial como respaldo.
   No hay publicidad, afiliación ni intercambio de datos comerciales con las marcas.
   Para servicios sin recurso verificable, mostrar abreviatura clara, no logo inventado. */
(() => {
  'use strict';
  const defined = (slug, domain, accent, short) => ({slug,domain,accent,short});
  const BRANDS = {
    'netflix-normal':defined('netflix','netflix.com','#ba1624','N'),
    'netflix-extra':defined('netflix','netflix.com','#ba1624','N'),
    'netflix-compartido':defined('netflix','netflix.com','#ba1624','N'),
    'disney-premium':defined('disneyplus','disneyplus.com','#1556bd','D+'),
    'disney-plus':defined('disneyplus','disneyplus.com','#1556bd','D+'),
    'disney-estandar':defined('disneyplus','disneyplus.com','#1556bd','D+'),
    'prime-video':defined('primevideo','primevideo.com','#0873bd','P'),
    'paramount-plus':defined('paramountplus','paramountplus.com','#1261b6','P+'),
    'max':defined('hbomax','max.com','#5935a5','MAX'),
    'crunchyroll':defined('crunchyroll','crunchyroll.com','#c95a10','C'),
    'apple-tv':defined('appletv','tv.apple.com','#364963','TV'),
    'spotify-premium':defined('spotify','spotify.com','#168344','S'),
    'deezer':defined('deezer','deezer.com','#6441a5','D'),
    'vix-premium':defined('vix','vix.com','#5b328c','ViX'),
    'viki-rakuten':defined('rakuten','viki.com','#1577b8','V'),
    'dazn':defined('dazn','dazn.com','#172538','D'),
    'canva-edu':defined('canva','canva.com','#1165ac','C'),
    'canva-pro':defined('canva','canva.com','#1165ac','C'),
    'capcut-pro':defined('capcut','capcut.com','#374e68','C'),
    'duolingo':defined('duolingo','duolingo.com','#278e39','D'),
    'hola-vpn':defined('hola','hola.org','#b08013','H'),
    'chatgpt':defined('openai','chatgpt.com','#166c70','AI'),
    'chatgpt-plus':defined('openai','chatgpt.com','#166c70','AI'),
    'directv-go':defined('directv','directv.com','#145caa','DGO'),
    'dgo':defined('directv','directv.com','#145caa','DGO'),
    'claro-paquetes-megas':defined('claro','claro.com.ec','#b22437','C'),
    'movistar-combos':defined('movistar','movistar.com.ec','#1269af','M'),
    'tuenti-recargas-combos':defined('tuenti','tuenti.ec','#2056aa','T'),
    'cnt-paquetes-prepago':defined('', '', '#1b75b7','CNT'),
    'zapping-ligapro':defined('', '', '#2a5e99','Z'),
    'zapping-pro':defined('', '', '#2a5e99','Z'),
    'telelatino':defined('', '', '#1d6ea2','TL'),
    'xc-tv':defined('', '', '#28739a','XC'),
    'flujo-tv':defined('', '', '#17688c','F'),
    'stella-tv':defined('', '', '#595bb1','ST'),
    'oleada-tv':defined('', '', '#1b739f','OL'),
    'vanna-tv':defined('', '', '#3575a1','VA'),
    'megax-tv':defined('', '', '#2263a0','MX'),
    'oratv':defined('', '', '#396caf','ORA'),
    'ibo-player':defined('', '', '#1b71a2','IBO'),
    'iptv-basico':defined('', '', '#145e98','TV'),
    'iptv-premium':defined('', '', '#145e98','TV'),
    'iptv-ultra':defined('', '', '#145e98','TV'),
    'plataformas-iptv':defined('', '', '#145e98','TV'),
    'deportes-pack':defined('', '', '#1569a6','⚽'),
    'aumento-gigas-proneet':defined('', '', '#1c66aa','VPN'),
    'recargas-ilimitadas-operador':defined('', '', '#175c99','SIM')
  };
  const fallbackInitials = name => String(name || 'TV').split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  function decorate(card) {
    if (card.dataset.ctvLogoReady === '1') return;
    const icon = card.querySelector('.product-card__icon');
    if (!icon) return;
    const id = card.getAttribute('data-producto') || '';
    const name = card.querySelector('h3')?.textContent || id;
    const info = BRANDS[id] || defined('','', '#1768ae',fallbackInitials(name));
    const short = info.short || fallbackInitials(name);
    card.style.setProperty('--ctv-card-accent', info.accent);
    icon.style.setProperty('--ctv-brand-bg', info.accent);
    icon.classList.add('ctv-brand-badge');
    icon.setAttribute('aria-hidden','true');
    icon.textContent = '';
    const text = () => {
      icon.textContent = '';
      const span = document.createElement('span');
      span.className = 'ctv-brand-fallback';
      span.textContent = short;
      icon.appendChild(span);
    };
    if (!info.slug) text();
    else {
      const img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      let attemptedFavicon = false;
      img.addEventListener('error', () => {
        if (!attemptedFavicon && info.domain) {
          attemptedFavicon = true;
          img.classList.add('ctv-brand-favicon');
          img.src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(info.domain) + '&sz=128';
        } else text();
      });
      img.src = 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/' + info.slug + '.svg';
      icon.appendChild(img);
    }
    card.dataset.ctvLogoReady = '1';
  }
  // Usar los mismos emblemas en las compras y renovaciones del carrito.
  function decorateCartRow(row) {
    if (row.dataset.ctvCartLogoReady === '1') return;
    const icon = row.querySelector('.carrito-item__icono');
    if (!icon) return;
    const id = row.getAttribute('data-producto') || '';
    const name = row.querySelector('.carrito-item__nombre')?.textContent?.trim() || id;
    const info = BRANDS[id] || defined('','','#1768ae',fallbackInitials(name));
    const short = info.short || fallbackInitials(name);
    icon.style.setProperty('--ctv-brand-bg',info.accent);
    icon.classList.add('ctv-brand-badge','ctv-cart-badge');
    icon.setAttribute('aria-hidden','true');
    icon.textContent='';
    const fallback = () => {
      icon.replaceChildren();
      const text = document.createElement('span');
      text.className='ctv-brand-fallback';
      text.textContent=short;
      icon.appendChild(text);
    };
    if (!info.slug) fallback();
    else {
      const img = document.createElement('img');
      img.alt='';
      img.decoding='async';
      img.loading='eager';
      let faviconAttempted=false;
      img.addEventListener('error', () => {
        if (!faviconAttempted && info.domain) {
          faviconAttempted=true;
          img.classList.add('ctv-brand-favicon');
          img.src='https://www.google.com/s2/favicons?domain='+encodeURIComponent(info.domain)+'&sz=128';
        } else fallback();
      });
      img.src='https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/'+info.slug+'.svg';
      icon.appendChild(img);
    }
    row.dataset.ctvCartLogoReady='1';
  }
  function observeCart() {
    const container=document.getElementById('carrito-items');
    if (!container) return;
    const update=()=>container.querySelectorAll('.carrito-item').forEach(decorateCartRow);
    update();
    new MutationObserver(update).observe(container,{childList:true});
  }
  function init() {
    const grid = document.getElementById('catalogo-grid');
    if (!grid) return;
    const update = () => grid.querySelectorAll('.product-card').forEach(decorate);
    update();
    const observer = new MutationObserver(update);
    observer.observe(grid,{childList:true});
    observeCart();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
