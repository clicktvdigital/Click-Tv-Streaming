/* CLICK TV DIGITAL - mejoras progresivas, no reemplaza la lógica del sitio */
(() => {
  'use strict';
  const KEY_TEXT = 'clicktv_accesibilidad_texto_2026';
  const KEY_CONTRAST = 'clicktv_accesibilidad_contraste_2026';
  const store = {
    get(k) { try { return localStorage.getItem(k) === '1'; } catch(e) { return false; } },
    set(k,v) { try { localStorage.setItem(k, v ? '1' : '0'); } catch(e) {} }
  };
  const on = (f) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',f,{once:true}) : f();
  on(() => {
    if (document.getElementById('clicktv-access-tools')) return;
    const body = document.body;
    if (store.get(KEY_TEXT)) body.classList.add('clicktv-large-text');
    if (store.get(KEY_CONTRAST)) body.classList.add('clicktv-high-contrast');
    const skip = document.createElement('a');
    skip.className='clicktv-skip'; skip.href='#streaming'; skip.textContent='Saltar directamente al catálogo de productos';
    body.prepend(skip);
    const bar = document.createElement('div'); bar.id='clicktv-access-tools'; bar.className='clicktv-access';
    bar.setAttribute('role','region'); bar.setAttribute('aria-label','Opciones de accesibilidad y compra');
    bar.innerHTML='<span class="clicktv-access__label">♿ Lectura fácil:</span>' +
       '<button type="button" id="clicktv-texto" aria-pressed="false">A+ Agrandar letra</button>' +
       '<button type="button" id="clicktv-contraste" aria-pressed="false">◐ Alto contraste</button>' +
       '<a href="#streaming">🛒 Ver productos y precios</a>';
    const header=document.querySelector('header.header');
    if(header) header.insertAdjacentElement('beforebegin',bar); else body.insertBefore(bar,body.firstChild);
    const btnT=document.getElementById('clicktv-texto'), btnC=document.getElementById('clicktv-contraste');
    const sync=()=>{btnT.setAttribute('aria-pressed',String(body.classList.contains('clicktv-large-text')));btnC.setAttribute('aria-pressed',String(body.classList.contains('clicktv-high-contrast')));};
    btnT.addEventListener('click',()=>{ const t=body.classList.toggle('clicktv-large-text');store.set(KEY_TEXT,t);sync(); });
    btnC.addEventListener('click',()=>{ const c=body.classList.toggle('clicktv-high-contrast');store.set(KEY_CONTRAST,c);sync(); });
    sync();
    const grid=document.getElementById('catalogo-grid');
    if(grid){grid.setAttribute('aria-label','Productos y sus precios de CLICK TV STREAMING'); const section=document.getElementById('streaming'); if(section) section.setAttribute('tabindex','-1');}
    const master=document.getElementById('buscador-maestro');
    if(master){ master.setAttribute('aria-label','Buscar servicio de streaming, televisión, música o aplicaciones'); master.setAttribute('enterkeyhint','search'); }
    const ayudas=document.querySelector('#streaming .container');
    if(ayudas && !document.getElementById('clicktv-guia-compras')){
      const box=document.createElement('div'); box.id='clicktv-guia-compras'; box.className='clicktv-help';
      box.innerHTML='<strong>🛒 Comprar es sencillo</strong><p>1. Elige tu servicio. 2. Selecciona cuántos meses y dispositivos necesitas. 3. Pulsa <strong>Comprar por WhatsApp</strong> o <strong>Añadir al carrito</strong>. Si necesitas ayuda, <a href="#contacto">contacta con nuestro equipo</a>.</p>';
      const filter=ayudas.querySelector('.filter-tabs'); if(filter) filter.insertAdjacentElement('beforebegin',box); else ayudas.prepend(box);
    }
    // Agrupar botones secundarios para dar prioridad a carrito y WhatsApp; mantiene alternativas.
    function compactar(){
      document.querySelectorAll('.product-plan__actions').forEach(actions=>{
        if(actions.querySelector('.clicktv-otros-canales')) return;
        const buttons=Array.from(actions.querySelectorAll(':scope > button'));
        if(buttons.length < 4) return;
        const secondary=buttons.slice(2);
        const more=document.createElement('details'); more.className='clicktv-otros-canales';
        const summary=document.createElement('summary'); summary.textContent='Otras opciones y renovación';
        const inner=document.createElement('div'); inner.className='clicktv-otros-canales__inner';
        secondary.forEach(el=>inner.appendChild(el));
        more.append(summary,inner); actions.appendChild(more);
      });
    }
    function simplificarPlanes(){
      if(!grid) return;
      grid.querySelectorAll('.product-card').forEach(card=>{
        if(card.querySelector('.clicktv-plan-filters')) return;
        const lista=card.querySelector('.product-plans');
        if(!lista) return;
        const planes=Array.from(lista.querySelectorAll(':scope > .product-plan'));
        if(planes.length < 8) return;
        const parsed=planes.map(row=>{
          const name=row.querySelector('.product-plan__info strong')?.textContent || '';
          const d=name.match(/(\d+)\s+dispositivos?/i);
          const m=name.match(/(\d+)\s+mes(?:es)?/i);
          return {row, d:d?Number(d[1]):null, m:m?Number(m[1]):null};
        });
        if(parsed.some(p=>!p.d || !p.m)) return;
        const devices=[...new Set(parsed.map(p=>p.d))];
        const months=[...new Set(parsed.map(p=>p.m))];
        if(devices.length<2 || months.length<2) return;
        const box=document.createElement('div');box.className='clicktv-plan-filters';
        const key=(card.dataset.producto||'servicio').replace(/[^a-z0-9-]/ig,'');
        function build(label,id,values,suffix){
          const wrap=document.createElement('label');wrap.textContent=label;
          const select=document.createElement('select');select.id='clicktv-select-'+id+'-'+key;
          values.forEach(val=>{const opt=document.createElement('option');opt.value=val;opt.textContent=val+' '+(val===1?suffix[0]:suffix[1]);select.appendChild(opt);});
          wrap.appendChild(select);box.appendChild(wrap);return select;
        }
        const deviceSelect=build('Dispositivos','device',devices,['dispositivo','dispositivos']);
        const monthsSelect=build('Duración','months',months,['mes','meses']);
        const show=()=>parsed.forEach(p=>{p.row.hidden=p.d!==Number(deviceSelect.value)||p.m!==Number(monthsSelect.value);});
        deviceSelect.addEventListener('change',show);monthsSelect.addEventListener('change',show);
        lista.parentElement.insertBefore(box,lista);show();
      });
    }
    compactar();simplificarPlanes();
    // La tienda vuelve a pintar el catálogo al filtrar; se mejora el nuevo contenido.
    if(grid && 'MutationObserver' in window){
      let scheduled=false;
      const observer=new MutationObserver(()=>{
        if(scheduled) return;
        scheduled=true;
        requestAnimationFrame(()=>{scheduled=false;compactar();simplificarPlanes();});
      });
      observer.observe(grid,{childList:true,subtree:false});
    }
  });
})();
