/* review.js — режим комментирования для Саши (04.08.2026).
   Активация: любая страница с ?review=1 (флаг запоминается в localStorage до «Выйти»).
   В обычном режиме и в проде скрипт молчит. Хранение: localStorage, работает по всем страницам.
   Экспорт: «Скопировать отчёт» (маркдаун в буфер — вставить в чат Клоду) или JSON-файл. */
(function(){
  var KEY='semmering_review_on', DATA='semmering_review_comments';
  var qs=new URLSearchParams(location.search);
  if(qs.get('review')==='1') localStorage.setItem(KEY,'1');
  if(qs.get('review')==='0') localStorage.removeItem(KEY);
  if(localStorage.getItem(KEY)!=='1') return;

  var page=location.pathname.split('/').pop()||'index.html';
  function load(){ try{return JSON.parse(localStorage.getItem(DATA)||'[]');}catch(e){return [];} }
  function save(a){ localStorage.setItem(DATA,JSON.stringify(a)); }
  function selOf(el){
    var path=[];
    while(el && el!==document.body && path.length<8){
      var p=el.parentElement, tag=el.tagName.toLowerCase();
      if(!p){break;}
      var idx=Array.prototype.indexOf.call(p.children,el)+1;
      path.unshift(tag+':nth-child('+idx+')');
      el=p;
    }
    return path.join('>');
  }
  function ctx(){
    return (document.body.classList.contains('winter')?'зима':'лето')+' · '
         +(document.body.classList.contains('en')?'EN':'DE')+' · '
         +(window.innerWidth<=760?'моб':'деск')+' '+window.innerWidth+'px';
  }

  /* ---------- стили ---------- */
  var css=document.createElement('style');
  css.textContent=
   '.rv-bar{position:fixed;left:10px;right:10px;bottom:10px;z-index:99999;background:#16181c;color:#fff;border-radius:14px;padding:10px 12px;display:flex;gap:8px;align-items:center;font:600 13px Montserrat,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45);flex-wrap:wrap}'
  +'.rv-bar button{border:0;border-radius:9px;padding:9px 12px;font:700 13px Montserrat,sans-serif;cursor:pointer;background:#2a2f36;color:#fff}'
  +'.rv-bar button.rv-on{background:#d64545}'
  +'.rv-bar button.rv-copy{background:#75abd6;color:#0d1626}'
  +'.rv-cnt{background:#75abd6;color:#0d1626;border-radius:99px;padding:3px 9px;font-weight:800}'
  +'.rv-pin{position:absolute;z-index:99998;width:26px;height:26px;border-radius:50%;background:#d64545;color:#fff;font:800 13px Montserrat;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer;transform:translate(-50%,-50%)}'
  +'.rv-modal{position:fixed;inset:0;z-index:100000;background:rgba(10,15,22,.55);display:flex;align-items:flex-end;justify-content:center}'
  +'.rv-box{background:#fff;color:#1c2530;width:100%;max-width:640px;border-radius:16px 16px 0 0;padding:16px;font:14px/1.5 -apple-system,sans-serif}'
  +'.rv-box h4{margin:0 0 4px;font:800 15px Montserrat}'
  +'.rv-box .rv-el{color:#5b6470;font-size:12px;margin-bottom:8px;word-break:break-word}'
  +'.rv-box textarea{width:100%;min-height:90px;border:1.5px solid #cdd6df;border-radius:10px;padding:10px;font:inherit}'
  +'.rv-box .rv-row{display:flex;gap:8px;margin-top:10px}'
  +'.rv-box button{flex:1;border:0;border-radius:10px;padding:12px;font:700 14px Montserrat;cursor:pointer}'
  +'.rv-ok{background:#75abd6;color:#0d1626}.rv-no{background:#e8ecf0;color:#1c2530}.rv-del{background:#f3dada;color:#a33}'
  +'.rv-hl{outline:3px solid #d64545 !important;outline-offset:2px}'
  +'body.rv-mode a,body.rv-mode button{cursor:crosshair !important}';
  document.head.appendChild(css);

  /* ---------- панель ---------- */
  var mode=false;
  var bar=document.createElement('div'); bar.className='rv-bar';
  bar.innerHTML='<span>Ревью</span><span class="rv-cnt" id="rvCnt">0</span>'
    +'<button id="rvMode">✎ Комментировать: выкл</button>'
    +'<button class="rv-copy" id="rvCopy">Скопировать отчёт</button>'
    +'<button id="rvJson">JSON</button>'
    +'<button id="rvExit">Выйти</button>';
  document.body.appendChild(bar);
  function refreshCnt(){ document.getElementById('rvCnt').textContent=load().length; }

  /* ---------- пины ---------- */
  function drawPins(){
    document.querySelectorAll('.rv-pin').forEach(function(p){p.remove();});
    load().forEach(function(c,i){
      if(c.page!==page) return;
      var el=null; try{el=document.querySelector(c.sel);}catch(e){}
      var pin=document.createElement('div'); pin.className='rv-pin'; pin.textContent=i+1;
      document.body.appendChild(pin);
      if(el){ var r=el.getBoundingClientRect();
        pin.style.left=(r.left+window.scrollX+Math.min(r.width-6,18))+'px';
        pin.style.top=(r.top+window.scrollY+6)+'px';
      } else { pin.style.left='24px'; pin.style.top=(80+i*32)+'px'; pin.style.opacity=.55; }
      pin.addEventListener('click',function(ev){ev.stopPropagation();openModal(null,c,i);});
    });
    refreshCnt();
  }

  /* ---------- модалка ---------- */
  function openModal(el,existing,idx){
    var m=document.createElement('div'); m.className='rv-modal';
    var elTxt=existing?existing.elTxt:(el?(el.innerText||el.getAttribute('alt')||el.tagName).trim().replace(/\s+/g,' ').slice(0,70):'');
    m.innerHTML='<div class="rv-box"><h4>'+(existing?('Коммент #'+(idx+1)):'Новый коммент')+'</h4>'
      +'<div class="rv-el">'+page+' · '+(existing?existing.ctx:ctx())+'<br>«'+elTxt+'»</div>'
      +'<textarea id="rvTxt" placeholder="что не так / что сделать">'+(existing?existing.text:'')+'</textarea>'
      +'<div class="rv-row"><button class="rv-ok" id="rvSave">Сохранить</button>'
      +(existing?'<button class="rv-del" id="rvDel">Удалить</button>':'')
      +'<button class="rv-no" id="rvCancel">Отмена</button></div></div>';
    document.body.appendChild(m);
    var ta=m.querySelector('#rvTxt'); setTimeout(function(){ta.focus();},50);
    m.addEventListener('click',function(e){ if(e.target===m) m.remove(); });
    m.querySelector('#rvCancel').onclick=function(){m.remove();};
    m.querySelector('#rvSave').onclick=function(){
      var t=ta.value.trim(); if(!t){m.remove();return;}
      var a=load();
      if(existing){ a[idx].text=t; }
      else a.push({page:page,sel:selOf(el),elTxt:elTxt,ctx:ctx(),text:t,ts:new Date().toISOString().slice(0,16)});
      save(a); m.remove(); drawPins();
    };
    var d=m.querySelector('#rvDel');
    if(d) d.onclick=function(){ var a=load(); a.splice(idx,1); save(a); m.remove(); drawPins(); };
  }

  /* ---------- режим комментирования ---------- */
  var hovered=null;
  document.getElementById('rvMode').onclick=function(){
    mode=!mode; document.body.classList.toggle('rv-mode',mode);
    this.textContent='✎ Комментировать: '+(mode?'ВКЛ':'выкл');
    this.classList.toggle('rv-on',mode);
  };
  document.addEventListener('mouseover',function(e){
    if(!mode) return;
    if(hovered) hovered.classList.remove('rv-hl');
    hovered=e.target.closest('section,header,footer,div,a,button,img,h1,h2,h3,h4,p,li,span,form,input,label');
    if(hovered && !hovered.closest('.rv-bar,.rv-modal')) hovered.classList.add('rv-hl'); else hovered=null;
  },true);
  document.addEventListener('click',function(e){
    if(!mode) return;
    if(e.target.closest('.rv-bar,.rv-modal,.rv-pin')) return;
    e.preventDefault(); e.stopPropagation();
    var el=e.target.closest('a,button,img,h1,h2,h3,h4,p,li,label,input') || e.target.closest('div,section,span') || e.target;
    if(hovered) hovered.classList.remove('rv-hl');
    openModal(el,null,null);
  },true);

  /* ---------- экспорт ---------- */
  function report(){
    var a=load(); if(!a.length) return 'Комментов нет.';
    var by={}; a.forEach(function(c,i){ (by[c.page]=by[c.page]||[]).push([i+1,c]); });
    var out=['# Замечания по сайту — '+new Date().toISOString().slice(0,10)+' ('+a.length+' шт.)',''];
    Object.keys(by).forEach(function(pg){
      out.push('## '+pg);
      by[pg].forEach(function(p){ var n=p[0],c=p[1];
        out.push(n+'. ['+c.ctx+'] «'+c.elTxt+'» — '+c.text);
      });
      out.push('');
    });
    return out.join('\n');
  }
  document.getElementById('rvCopy').onclick=function(){
    var t=report();
    (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(
      function(){alert('Отчёт в буфере ('+load().length+' комм.) — вставь в чат Клоду.');},
      function(){ prompt('Скопируй вручную:',t); });
  };
  document.getElementById('rvJson').onclick=function(){
    var b=new Blob([JSON.stringify(load(),null,1)],{type:'application/json'});
    var u=URL.createObjectURL(b), l=document.createElement('a');
    l.href=u; l.download='semmering_review.json'; l.click(); URL.revokeObjectURL(u);
  };
  document.getElementById('rvExit').onclick=function(){
    if(confirm('Выйти из режима ревью? (комменты сохранятся)')){ localStorage.removeItem(KEY); location.reload(); }
  };

  window.addEventListener('load',drawPins);
  window.addEventListener('resize',function(){setTimeout(drawPins,200);});
  drawPins();
})();
