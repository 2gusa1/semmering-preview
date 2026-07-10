// ════════════════════════════════════════════════════════════════
// MOTION LAYER — semmering.com prototype (Sprint 2, по TEARDOWN_5)
// Отдельный файл: app.js не трогаем. IO-reveal + stagger, count-up,
// draw-on-scroll, season-wipe, плавный аккордеон. ~3 KB, ванильный JS.
// ════════════════════════════════════════════════════════════════
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('mo-ready');

  /* ── reveal-цели ── */
  /* #714 — mehr Leben: Content-Blöcke (split/reel/stats/newsletter/formbox) zusätzlich zu Karten-Grids einblenden */
  var solo = '.tempcmp,.booking-card,.tip,.mo-routes,.mo-schema,.statusrow,.hq,.split,.act-reel,.stats,.newsletter,.formbox,.buy-card';
  document.querySelectorAll(solo).forEach(function(el){ el.classList.add('mo-rv'); });
  /* stagger внутри сеток */
  document.querySelectorAll('.cardgrid,.nb-grid,.heute-grid,.partners,.cols').forEach(function(g){
    Array.prototype.forEach.call(g.children, function(c,i){
      c.classList.add('mo-rv'); c.style.setProperty('--mo-d', (i%6)*70+'ms');
    });
  });

  /* ── draw-on-scroll для SVG-маршрутов ── */
  function draw(svg){
    svg.querySelectorAll('path[stroke]').forEach(function(p,i){
      try{
        var L = p.getTotalLength();
        p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1) '+(i*180)+'ms';
        p.style.strokeDashoffset = '0';
      }catch(e){}
    });
  }

  /* ── count-up для цифр statband (годы не трогаем) ── */
  function countUp(el){
    var txt = el.textContent.trim();
    if (/(18|19|20)\d\d/.test(txt)) return;
    var m = txt.match(/^([^\d]*)([\d.,]+)(.*)$/); if(!m) return;
    var num = parseFloat(m[2].replace(/\./g,'').replace(',','.')); if(isNaN(num)||num<2) return;
    var dec = /,/.test(m[2]) ? 1 : 0, t0 = performance.now(), dur = 900;
    (function fr(t){
      var p = Math.min(1,(t-t0)/dur); p = 1-Math.pow(1-p,3);
      var v = num*p, s = dec ? v.toFixed(1).replace('.',',') : Math.round(v).toString();
      if(!dec && num>=1000) s = s.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
      el.textContent = m[1]+s+m[3];
      if(p<1) requestAnimationFrame(fr); else el.textContent = txt;
    })(t0);
  }

  /* ── IntersectionObserver: один на всё, unobserve после входа ── */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('mo-in');
      io.unobserve(e.target);
      if(e.target.classList.contains('mo-routes') || e.target.classList.contains('mo-schema')) draw(e.target.tagName==='svg'||e.target.tagName==='SVG'?e.target:e.target.querySelector('svg')||e.target);
      e.target.querySelectorAll ? e.target.querySelectorAll('.stb-num').forEach(countUp) : 0;
      if(e.target.classList.contains('stb-num')) countUp(e.target);
    });
  }, {threshold:.15, rootMargin:'0px 0px -36px 0px'});
  var vh=window.innerHeight;
  document.querySelectorAll('.mo-rv').forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top < vh*0.9){ el.style.transition='none'; el.classList.add('mo-in');
      requestAnimationFrame(function(){ el.style.transition=''; }); return; }
    io.observe(el);
  });
  document.querySelectorAll('.stb-num').forEach(function(el){ el.classList.add('mo-rv'); io.observe(el); });

  /* ── season-wipe: перехватываем клик по тумблеру (capture, до app.js) ── */
  document.addEventListener('click', function(e){
    if(!e.target.closest('.season-toggle span')) return;
    var w = document.querySelector('.mo-wipe');
    if(!w){ w = document.createElement('div'); w.className='mo-wipe'; document.body.appendChild(w); }
    w.classList.remove('on'); void w.offsetWidth; w.classList.add('on');
  }, true);

  /* ── плавный аккордеон поверх class-toggle из app.js ──
     capture: меряем высоту ДО переключения, rAF: после — анимируем WAAPI */
  document.addEventListener('click', function(e){
    var box = e.target.closest('.accordion .ac, .hq'); if(!box) return;
    var h0 = box.offsetHeight;
    requestAnimationFrame(function(){
      var h1 = box.offsetHeight; if(h0===h1 || !box.animate) return;
      box.style.overflow='hidden';
      var a = box.animate([{height:h0+'px'},{height:h1+'px'}],
        {duration:280, easing:'cubic-bezier(.22,.61,.36,1)'});
      a.onfinish = function(){ box.style.overflow=''; };
    });
  }, true);
})();

/* ── Hirschi здоровается: один раз за сессию, через 2,5 с ── */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try{
    if (sessionStorage.getItem('hirschi_hi')) return;
    setTimeout(function(){
      var f=document.querySelector('.hirschi-fab');
      if(f && f.animate){
        f.animate([{transform:'rotate(0)'},{transform:'rotate(-12deg)'},{transform:'rotate(10deg)'},
                   {transform:'rotate(-6deg)'},{transform:'rotate(0)'}],{duration:700,easing:'ease-in-out'});
        sessionStorage.setItem('hirschi_hi','1');
      }
    },2500);
  }catch(e){}
})();

/* ── Волна 1: ближайший ивент в верхнем статус-баре (автоматом по дате) ── */
(function(){
  var EV=[["2026-07-04","Eröffnung Hirschitrails + Après-Hike: Silvio Sinzinger","Hirschitrails opening + Après-Hike: Silvio Sinzinger"],
    ["2026-07-11","Après-Hike: Harry Dean Lewis","Après-Hike: Harry Dean Lewis"],
    ["2026-07-18","Après-Hike: Greyshadow","Après-Hike: Greyshadow"],
    ["2026-07-19","Familien-Bergfest","Family mountain festival"],
    ["2026-07-25","Après-Hike: RHAYN + DJ & Sax","Après-Hike: RHAYN + DJ & sax"],
    ["2026-08-01","Après-Hike: Harry Dean Lewis","Après-Hike: Harry Dean Lewis"],
    ["2026-08-08","Après-Hike: ISTZUSTAND","Après-Hike: ISTZUSTAND"],
    ["2026-08-15","Après-Hike: Philipp Griessler Band","Après-Hike: Philipp Griessler Band"],
    ["2026-08-22","Après-Hike: Elena Shirin","Après-Hike: Elena Shirin"],
    ["2026-08-29","Ö3 Silent Cinema + Après-Hike: Zwasam","Ö3 Silent Cinema + Après-Hike: Zwasam"],
    ["2026-09-05","AAGS Downhill — Austrian Gravity Series","AAGS Downhill — Austrian Gravity Series"],
    ["2026-09-12","Après-Hike: Sleep in the Shine","Après-Hike: Sleep in the Shine"],
    ["2026-09-19","Après-Hike: JUSTHERE","Après-Hike: JUSTHERE"],
    ["2026-09-26","Après-Hike: 2TREES","Après-Hike: 2TREES"],
    ["2026-10-03","Après-Hike: Reiner Wagner","Après-Hike: Reiner Wagner"],
    ["2026-10-10","Après-Hike Finale: Erwin R.","Après-Hike finale: Erwin R."],
    ["2026-10-31","Halloweenfest 🎃","Halloween Festival 🎃"],
    ["2026-12-12","Hüttenkrimi im Liechtensteinhaus","Hüttenkrimi crime dinner"],
    ["2026-12-19","Après-Ski Saisonstart — jeden Sa DJ & Show","Après-ski season opener — Sat DJ & shows"],
    ["2026-12-31","Silvester im Grand View","NYE at Grand View"]];
  var today=new Date(); today.setHours(0,0,0,0);
  var up=EV.filter(function(e){return new Date(e[0])>=today;});
  if(!up.length) return;
  window.__nextEv=up[0];
  var pushes=document.querySelectorAll('.notif .push');
  if(!pushes.length) return;
  function fmt(iso){var p=iso.split('-');return (+p[2])+'.'+(+p[1])+'.';}
  var h='🎪 <span class="t-d"><b>'+up[0][1]+'</b> · '+fmt(up[0][0])+'</span><span class="t-e"><b>'+up[0][2]+'</b> · '+fmt(up[0][0])+'</span>';
  for(var pi=0;pi<pushes.length;pi++){(function(p){
    p.innerHTML=h; p.style.cursor='pointer';
    p.addEventListener('click',function(){location.href='events.html';});
  })(pushes[pi]);}
})();

/* ── Волна 1: сезонный вайб у wipe ── */
document.addEventListener('click', function(e){
  var st=e.target.closest('.season-toggle span'); if(!st) return;
  var w=document.querySelector('.mo-wipe'); if(!w) return;
  w.classList.toggle('to-winter', st.classList.contains('w'));
  w.classList.toggle('to-summer', !st.classList.contains('w'));
}, true);

/* ── Волна 2: часы — прошедшие периоды скрываются, текущий подсвечен ── */
(function(){
  var chips=document.querySelectorAll('.hb-chip[data-until]'); if(!chips.length) return;
  var t=new Date(); t.setHours(0,0,0,0);
  chips.forEach(function(c){
    var u=new Date(c.getAttribute('data-until')), f=new Date(c.getAttribute('data-from'));
    if(u<t){ c.style.display='none'; return; }
    if(f<=t && t<=u) c.classList.add('hb-current');
  });
})();

/* ── Волна 2: живая погода Вена/город-гостя ↔ Semmering (open-meteo) ── */
(function(){
  if(!document.querySelector('.tempcmp')) return;
  function q(s){ return document.querySelectorAll(s); }
  function get(lat,lon){
    return fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m')
      .then(function(r){return r.json();}).then(function(j){return j.current.temperature_2m;});
  }
  function apply(city,sem,geo){
    if(typeof city!=='number'||typeof sem!=='number') return;
    q('[data-live="temp-wien"]').forEach(function(el){el.textContent=Math.round(city)+'°';});
    q('[data-live="temp-semmering"]').forEach(function(el){el.textContent=Math.round(sem)+'°';});
    var d=Math.round(city-sem);
    q('[data-live="temp-delta"]').forEach(function(el){el.textContent=(d>=0?'−'+d:'+'+(-d))+'°';});
    var hS=Math.max(14,Math.min(86,Math.round(86*sem/Math.max(sem,city,1))));
    q('.tempcmp .tc-hl .tc-bar span').forEach(function(el){el.style.height=hS+'%';});
    if(geo){
      q('[data-live="city-name"]').forEach(function(el){el.innerHTML='<span class="t-d">Dein Standort</span><span class="t-e">Your location</span>';});
      q('[data-live="city-elev"]').forEach(function(el){el.textContent='';});
    }
    q('[data-live="note-city"]').forEach(function(el){el.innerHTML='<span class="t-d">gerade eben</span><span class="t-e">right now</span>';});
    q('[data-live="temp-src"]').forEach(function(el){el.innerHTML='<span class="t-d">Live-Wetter · open-meteo.com</span><span class="t-e">Live weather · open-meteo.com</span>';});
  }
  var semP=get(47.63,15.83);
  function run(lat,lon,geo){ Promise.all([get(lat,lon),semP]).then(function(v){apply(v[0],v[1],geo);}).catch(function(){}); }
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      function(p){ run(p.coords.latitude,p.coords.longitude,true); },
      function(){ run(48.21,16.37,false); }, {timeout:3500,maximumAge:600000});
  } else run(48.21,16.37,false);
})();

/* ── GR-2: чипы категорий групп открывают аккордеон ── */
(function(){
  function openTarget(id){ var el=document.getElementById(id); if(el){ el.classList.add('open'); el.scrollIntoView({behavior:'smooth',block:'center'}); } }
  document.querySelectorAll('.grp-open').forEach(function(c){ c.addEventListener('click',function(){ openTarget(c.getAttribute('data-grp')); }); });
  if(location.hash.startsWith('#grp-')) openTarget(location.hash.slice(1));
})();

/* ── D-7: Promo-Popup — ближайший ивент + Hirschi-Brief (1× за сессию) ── */
(function(){
  if(sessionStorage.getItem('promoSeen')) return;
  setTimeout(function(){
    var ev=window.__nextEv;
    function fmt(iso){var p=iso.split('-');return (+p[2])+'.'+(+p[1])+'.';}
    var pop=document.createElement('div');
    pop.className='promo-pop';
    pop.setAttribute('role','dialog');
    pop.setAttribute('aria-label','Angebote & Events / Offers & events');
    pop.innerHTML='<button class="pp-x" aria-label="Schließen / Close">×</button>'
      +(ev?'<a href="events.html" class="pp-ev">🎪 <span class="t-d"><b>'+ev[1]+'</b><br>'+fmt(ev[0])+' am Berg — alle Events →</span><span class="t-e"><b>'+ev[2]+'</b><br>'+fmt(ev[0])+' on the mountain — all events →</span></a>':'')
      +'<button type="button" class="pp-nl"><img src="assets/hirschi/Hirschi-Brief.png" alt="" style="width:34px"><span class="t-d">Hirschi-Brief abonnieren — Saisonstart, Events & Angebote zuerst.</span><span class="t-e">Subscribe to the Hirschi letter — season openings, events & offers first.</span></button>';
    document.body.appendChild(pop);
    requestAnimationFrame(function(){pop.classList.add('on');});
    function seen(){sessionStorage.setItem('promoSeen','1');}
    pop.querySelector('.pp-x').addEventListener('click',function(){seen();pop.classList.remove('on');setTimeout(function(){pop.remove();},400);});
    pop.querySelector('.pp-nl').addEventListener('click',function(){seen();var nl=document.querySelector('.foot-nl');if(nl){nl.scrollIntoView({behavior:'smooth',block:'center'});}pop.classList.remove('on');setTimeout(function(){pop.remove();},400);});
    var pe=pop.querySelector('.pp-ev'); if(pe) pe.addEventListener('click',seen);
    document.addEventListener('keydown', function esc(ev){
      if(!pop.parentNode){ document.removeEventListener('keydown',esc); return; }
      if(ev.key!=='Escape') return;
      document.removeEventListener('keydown',esc);
      seen(); pop.classList.remove('on'); setTimeout(function(){pop.remove();},400);
    });
    // авто-скрытие: чтобы попап не преследовал по всей странице
    function autohide(){ if(!pop.parentNode) return; seen(); pop.classList.remove('on'); setTimeout(function(){pop.remove();},400); }
    var autoT=setTimeout(autohide,14000), startY=window.scrollY;
    window.addEventListener('scroll',function sc(){ if(!pop.parentNode){window.removeEventListener('scroll',sc);return;} if(Math.abs(window.scrollY-startY)>1400){window.removeEventListener('scroll',sc);clearTimeout(autoT);autohide();} },{passive:true});
  },9000);
})();

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD-A11Y — WA-03/04/07/12 (WARROOM_MOBILE_A11Y, 03.07.2026)
   Runtime-шим для всех 76 страниц без пересборки генераторов:
   role/tabindex для чипов-фильтров и 106 аккордеонов + aria-expanded/
   aria-pressed. НЕ зависит от prefers-reduced-motion (a11y работает всегда).
   app.js:64 уже ловит Enter/Space на [role="button"] → click; здесь только
   атрибуты + фолбэк-keydown с гардом от двойного срабатывания.
   Дублирования click-обработчиков нет: открытие по-прежнему делает app.js.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  var SEL='.chip[data-f],.accordion .ac h4,.grp-open,.season-toggle span,.lang-toggle span';
  /* 1) role="button"/tabindex="0" — только где их нет; нативно фокусируемые
        теги не трогаем (.grp-open = <a href>, чипы tickets = <a>) */
  document.querySelectorAll(SEL).forEach(function(el){
    var tg=el.tagName;
    if(tg==='A'||tg==='BUTTON'||tg==='INPUT') return;
    if(!el.hasAttribute('role')) el.setAttribute('role','button');
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
  });
  /* 2) aria-expanded: стартовое состояние аккордеонов (.ac h4 ×106, .hq-q) и бургера */
  document.querySelectorAll('.accordion .ac h4').forEach(function(h){
    h.setAttribute('aria-expanded', h.parentElement.classList.contains('open')?'true':'false');
  });
  document.querySelectorAll('.hq-q').forEach(function(q){
    q.setAttribute('aria-expanded', q.parentElement.classList.contains('open')?'true':'false');
  });
  var brg=document.querySelector('.burger');
  if(brg) brg.setAttribute('aria-expanded', document.body.classList.contains('navopen')?'true':'false');
  /* 3) aria-pressed: чипы-фильтры + сезон/язык-тумблеры (WA-03/WA-07) */
  function pressChips(){
    document.querySelectorAll('.chip[data-f]').forEach(function(c){
      c.setAttribute('aria-pressed', c.classList.contains('active')?'true':'false');
    });
  }
  function pressToggles(){
    document.querySelectorAll('.season-toggle span,.lang-toggle span').forEach(function(s){
      s.setAttribute('aria-pressed', s.classList.contains('on')?'true':'false');
    });
  }
  pressChips(); pressToggles();
  /* 4) синк aria-* после клика: bubble-слушатель регистрируется ПОСЛЕ app.js
        (motion.js подключён после app.js) → читает уже переключённые классы */
  document.addEventListener('click', function(e){
    var ah=e.target.closest('.accordion .ac h4');
    if(ah) ah.setAttribute('aria-expanded', ah.parentElement.classList.contains('open')?'true':'false');
    var hq=e.target.closest('.hq-q');
    if(hq) hq.setAttribute('aria-expanded', hq.parentElement.classList.contains('open')?'true':'false');
    if(brg && e.target.closest('.burger'))
      brg.setAttribute('aria-expanded', document.body.classList.contains('navopen')?'true':'false');
    if(e.target.closest('.chip[data-f]')) pressChips();
    if(e.target.closest('.season-toggle span')||e.target.closest('.lang-toggle span')) pressToggles();
  });
  /* 5) фолбэк-keydown для динамических элементов без role="button".
        Гард e.defaultPrevented: если app.js:64 уже обработал (он ставит
        preventDefault перед click) — выходим, двойного click не будет. */
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ') return;
    if(e.defaultPrevented) return;
    var t=e.target.closest(SEL); if(!t) return;
    if(t.tagName==='A'||t.tagName==='BUTTON') return;
    e.preventDefault(); t.click();
  });
})();

/* ═══ CRO-POLISH: sticky mobile CTA injector ═══
   Читает data-атрибуты с <body>: data-stickycta-href / -label-de / -label-en
   (+ optional -tel). Рендерит бар только если атрибут задан → одна логика,
   разные money-URL на hotel/tickets/bikepark. Иконка не нужна (текст-CTA). */
(function(){
  var b=document.body, href=b.getAttribute('data-stickycta-href');
  if(!href) return;
  b.classList.add('has-stickycta');
  var lde=b.getAttribute('data-stickycta-label-de')||'Jetzt buchen';
  var len=b.getAttribute('data-stickycta-label-en')||'Book now';
  var tel=b.getAttribute('data-stickycta-tel');
  var bar=document.createElement('div'); bar.className='sticky-cta';
  var ext=/^https?:/.test(href)?' target="_blank" rel="noopener"':'';
  var telBtn=tel?('<a href="tel:'+tel+'" class="btn ghost2 sc-2nd" aria-label="Anrufen / Call">'
     +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 18v-2l-5-1M4 4v4a16 16 0 0 0 16 16h0"/></svg></a>'):'';
  bar.innerHTML='<a href="'+href+'"'+ext+' class="btn primary">'
    +'<span class="t-d">'+lde+'</span><span class="t-e">'+len+'</span></a>'+telBtn;
  b.appendChild(bar);
})();

/* ── #fix-hirschi-overlap: на мобильном FAB не перекрывает hero (кликабельная .cta-live
   попадала под маскот) — показываем его, как только клиент начал скроллить ── */
(function(){
  if(!window.matchMedia||!matchMedia('(max-width:720px)').matches) return;
  var h=document.querySelector('.hirschi'); if(!h) return;
  function upd(){ h.classList.toggle('fab-off', window.scrollY < 200); }
  upd();
  window.addEventListener('scroll',upd,{passive:true});
})();
