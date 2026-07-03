// ════════════════════════════════════════════════════════════════
// MOTION LAYER — semmering.com prototype (Sprint 2, по TEARDOWN_5)
// Отдельный файл: app.js не трогаем. IO-reveal + stagger, count-up,
// draw-on-scroll, season-wipe, плавный аккордеон. ~3 KB, ванильный JS.
// ════════════════════════════════════════════════════════════════
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('mo-ready');

  /* ── reveal-цели ── */
  var solo = '.tempcmp,.booking-card,.tip,.mo-routes,.mo-schema,.statusrow,.hq';
  document.querySelectorAll(solo).forEach(function(el){ el.classList.add('mo-rv'); });
  /* stagger внутри сеток */
  document.querySelectorAll('.cardgrid,.nb-grid,.heute-grid,.partners').forEach(function(g){
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
    ["2026-08-29","Ö3 Silent Cinema + Après-Hike: Zwasam","Ö3 Silent Cinema + Après-Hike: Zwasam"],
    ["2026-09-05","auner Austrian Gravity Series","auner Austrian Gravity Series"],
    ["2026-09-12","Après-Hike: Sleep in the Shine","Après-Hike: Sleep in the Shine"],
    ["2026-09-19","Après-Hike: JUSTHERE","Après-Hike: JUSTHERE"],
    ["2026-09-26","Après-Hike: 2TREES","Après-Hike: 2TREES"],
    ["2026-10-03","Après-Hike: Reiner Wagner","Après-Hike: Reiner Wagner"],
    ["2026-10-10","Après-Hike Finale: Erwin R.","Après-Hike finale: Erwin R."],
    ["2026-10-31","Halloweenfest 🎃","Halloween Festival 🎃"],
    ["2026-12-12","Hüttenkrimi im Liechtensteinhaus","Hüttenkrimi crime dinner"],
    ["2026-12-19","Après-Ski Saisonstart — jeden Sa DJ & Show","Après-ski season opener — Sat DJ & shows"],
    ["2026-12-31","Silvester im Grand View","NYE at Grand View"]];
  var push=document.querySelector('.notif .push');
  if(!push) return;
  var today=new Date(); today.setHours(0,0,0,0);
  var up=EV.filter(function(e){return new Date(e[0])>=today;});
  if(!up.length) return;
  function fmt(iso){var p=iso.split('-');return (+p[2])+'.'+(+p[1])+'.';}
  var h='🎪 <span class="t-d"><b>'+up[0][1]+'</b> · '+fmt(up[0][0])+'</span><span class="t-e"><b>'+up[0][2]+'</b> · '+fmt(up[0][0])+'</span>';
  push.innerHTML=h;
  push.style.cursor='pointer';
  push.addEventListener('click',function(){location.href='events.html';});
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
