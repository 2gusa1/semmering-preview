// semmering.com прототип — интерактив (season + language toggle)
(function(){
  // ---- Season toggle (persists across pages) ----
  function applySeason(s){
    document.body.classList.toggle('winter', s==='winter');
    document.querySelectorAll('.season-toggle .s').forEach(e=>e.classList.toggle('on', s!=='winter'));
    document.querySelectorAll('.season-toggle .w').forEach(e=>e.classList.toggle('on', s==='winter'));
  }
  applySeason(localStorage.getItem('semmering_season') || 'summer');

  // ---- Language toggle DE/EN (default DE, persists across pages) ----
  var monthsDE=['Jän','Feb','März','Apr','Mai','Juni','Juli','Aug','Sep','Okt','Nov','Dez'];
  var monthsEN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function setDates(){
    var d=new Date(), en=document.body.classList.contains('en');
    document.querySelectorAll('[data-today]').forEach(function(el){
      el.textContent = en ? (monthsEN[d.getMonth()]+' '+d.getDate()) : (d.getDate()+'. '+monthsDE[d.getMonth()]);
    });
  }
  function applyLang(l){
    document.body.classList.toggle('en', l==='en');
    document.querySelectorAll('.lang-toggle .len').forEach(e=>e.classList.toggle('on', l==='en'));
    document.querySelectorAll('.lang-toggle .lde').forEach(e=>e.classList.toggle('on', l!=='en'));
    document.documentElement.lang = l;
    setDates();
  }
  applyLang(localStorage.getItem('semmering_lang') || 'de');

  // ---- Delegated clicks ----
  document.addEventListener('click', function(e){
    var st = e.target.closest('.season-toggle span');
    if(st){ var s = st.classList.contains('w') ? 'winter' : 'summer';
      localStorage.setItem('semmering_season', s); applySeason(s); return; }
    var lt = e.target.closest('.lang-toggle span');
    if(lt){ var l = lt.classList.contains('lde') ? 'de' : 'en';
      localStorage.setItem('semmering_lang', l); applyLang(l); return; }
    var ah = e.target.closest('.accordion .ac h4');
    if(ah){ ah.parentElement.classList.toggle('open'); }
    if(e.target.closest('.burger')){ document.body.classList.toggle('navopen'); }
    // ---- Hirschi assistant ----
    var hf = e.target.closest('.hirschi-fab');
    if(hf){ var hr=document.getElementById('hirschi'); if(hr) hr.classList.toggle('open'); return; }
    if(e.target.closest('.hp-close')){ var h2=document.getElementById('hirschi'); if(h2) h2.classList.remove('open'); return; }
    var hqq = e.target.closest('.hq-q');
    if(hqq){ hqq.parentElement.classList.toggle('open'); return; }
  });

  // ---- Forms: mailto fallback (kein Backend nötig) ----
  document.querySelectorAll('form').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var to = f.getAttribute('data-mail') || 'info@semmering.com';
      var subj = f.getAttribute('data-subject') || 'Anfrage · semmering.com';
      var lines = [];
      f.querySelectorAll('input,textarea,select').forEach(function(el){
        var lbl = el.getAttribute('placeholder') || el.getAttribute('name') || '';
        if(el.value) lines.push(lbl + ': ' + el.value);
      });
      window.location.href = 'mailto:'+to+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(lines.join('\n'));
    });
  });

  // ---- Keyboard support for role=button toggles ----
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ') return;
    var b=e.target.closest('[role="button"]');
    if(b){ e.preventDefault(); b.click(); }
  });

  // ---- Filter chips ----
  document.querySelectorAll('.filterbar').forEach(function(bar){
    bar.addEventListener('click', function(e){
      var c = e.target.closest('.chip'); if(!c) return;
      bar.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
      c.classList.add('active');
      var f = c.getAttribute('data-f');
      var grid = bar.parentElement.querySelector('[data-filtergrid]');
      if(!grid) return;
      grid.querySelectorAll('[data-cat]').forEach(function(card){
        card.style.display = (f==='all' || card.getAttribute('data-cat').indexOf(f)>-1) ? '' : 'none';
      });
    });
  });
})();

/* ═══ CONSENT-GA4 (WR-P0-5, 04.07.2026) — согласие + гейтированная аналитика ═══
   GA4_ID пуст → баннер НЕ показывается, ничего не грузится (сайт использует только
   функциональный storage). Как только Саша даст ID — вписать сюда, всё включится. */
(function(){
  var GA4_ID="";                       // ← сюда G-XXXXXXX от Саши
  if(!GA4_ID) return;
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  window.gtag=gtag;
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
  function loadGA(){
    gtag('consent','update',{analytics_storage:'granted'});
    var s=document.createElement('script');s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GA4_ID;
    document.head.appendChild(s);
    gtag('js',new Date());gtag('config',GA4_ID,{anonymize_ip:true});
    hookEvents();
  }
  function hookEvents(){
    document.addEventListener('click',function(e){
      var a=e.target.closest('a,button'); if(!a) return;
      var h=a.getAttribute('href')||'';
      if(h.indexOf('axess.shop')>-1) gtag('event','ticket_click',{page:location.pathname,label:(a.textContent||'').trim().slice(0,40)});
      else if(h.indexOf('hotellogin')>-1) gtag('event','booking_click',{page:location.pathname});
      else if(h.indexOf('choiceqr')>-1) gtag('event','table_booking_click',{});
      else if(h.indexOf('tel:')===0) gtag('event','phone_click',{});
      else if(h.indexOf('mailto:')===0) gtag('event','email_click',{page:location.pathname});
      else if(a.closest('.season-toggle')) gtag('event','season_toggle',{});
      else if(a.closest('.lang-toggle')) gtag('event','lang_toggle',{});
      else if(a.classList.contains('pp-ev')) gtag('event','popup_event_click',{});
    },true);
    document.addEventListener('submit',function(e){
      var f=e.target.closest('form[data-mail]'); if(f) gtag('event','form_submit',{type:f.getAttribute('data-subject')||'form'});
    },true);
  }
  var choice=localStorage.getItem('cookieConsent');
  if(choice==='all'){loadGA();return;}
  if(choice==='essential') return;
  var b=document.createElement('div');
  b.className='consent-bar';b.setAttribute('role','dialog');b.setAttribute('aria-label','Cookie-Einwilligung');
  b.innerHTML='<div class="cb-txt"><span class="t-d">Wir nutzen Cookies für anonyme Statistik (Google Analytics), nur mit deiner Zustimmung. <a href="datenschutz.html">Mehr dazu</a>.</span><span class="t-e">We use cookies for anonymous statistics (Google Analytics), only with your consent. <a href="datenschutz.html">Learn more</a>.</span></div>'
   +'<div class="cb-btns"><button class="cb-ok"><span class="t-d">Alle akzeptieren</span><span class="t-e">Accept all</span></button>'
   +'<button class="cb-min"><span class="t-d">Nur notwendige</span><span class="t-e">Essential only</span></button></div>';
  document.body.appendChild(b);
  b.querySelector('.cb-ok').addEventListener('click',function(){localStorage.setItem('cookieConsent','all');b.remove();loadGA();});
  b.querySelector('.cb-min').addEventListener('click',function(){localStorage.setItem('cookieConsent','essential');b.remove();});
})();
