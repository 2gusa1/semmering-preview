// semmering.com прототип — интерактив (season + language toggle)
(function(){
  // ---- Season toggle (persists across pages) ----
  function applySeason(s){
    document.body.classList.toggle('winter', s==='winter');
    document.querySelectorAll('.season-toggle .s').forEach(e=>e.classList.toggle('on', s!=='winter'));
    document.querySelectorAll('.season-toggle .w').forEach(e=>e.classList.toggle('on', s==='winter'));
  }
  // Saison-Default nach Datum (Nov–März = Winter, Apr–Okt = Sommer); manueller Toggle überschreibt & bleibt gespeichert.
  function seasonByDate(){var m=new Date().getMonth()+1;return (m>=11||m<=3)?'winter':'summer';}
  applySeason(localStorage.getItem('semmering_season') || seasonByDate());

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

  // ---- Erlebnis-Planer: Audience-Selector → Szenario-Spotlight + Aktivitäten-Highlight ----
  document.querySelectorAll('[data-audbar]').forEach(function(bar){
    var spots = document.querySelector('[data-audspots]');
    var grid  = document.querySelector('[data-audgrid]');
    bar.addEventListener('click', function(e){
      var c = e.target.closest('.aud-chip'); if(!c) return;
      bar.querySelectorAll('.aud-chip').forEach(x=>x.classList.remove('active'));
      c.classList.add('active');
      var aud = c.getAttribute('data-aud');
      if(spots){ spots.querySelectorAll('.aud-spot').forEach(function(s){
        s.hidden = (aud==='all' || s.getAttribute('data-aud')!==aud);
      }); }
      if(grid){
        if(aud==='all'){
          grid.classList.remove('aud-active');
          grid.querySelectorAll('.exp-card').forEach(x=>x.classList.remove('match'));
        } else {
          grid.classList.add('aud-active');
          grid.querySelectorAll('[data-cat]').forEach(function(card){
            card.classList.toggle('match', card.getAttribute('data-cat').indexOf(aud)>-1);
          });
          if(spots){ var el=spots.querySelector('.aud-spot[data-aud="'+aud+'"]'); if(el){ el.scrollIntoView({behavior:'smooth',block:'nearest'}); } }
        }
      }
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

/* ═══════════════════════════════════════════════════════════════
   FORMS-UX — FUN-05 (WARROOM_FUNNELS) + WA-15. Аддитивный блок.
   1) required на ключевые поля: нативная валидация браузера БЛОКИРУЕТ
      событие submit у невалидной формы → mailto из основного IIFE не
      уходит пустым, юзер видит браузерную подсказку (DE/EN по локали).
      (inline onsubmit="return false" этому не мешает — при невалидной
      форме submit-событие вообще не диспатчится.)
   2) После реального submit — видимый inline-фидбек DE/EN в страницу
      («откроется почтовик; если нет — вот адрес») вместо тишины.
      Document-слушатель (bubble) срабатывает ПОСЛЕ form-хэндлера с mailto.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  /* 1) required/aria-required: e-mail везде; имя и дата — в анкетных формах.
        Матчится: gf-name «Name/Organisation», lr-name «Name», gf-dat
        «Wunschdatum», lr-date «Datum». Newsletter (name="E-Mail") имя не матчит. */
  document.querySelectorAll('form input[type="email"], form input[name*="Name"], form input[name*="atum"]')
    .forEach(function(el){ el.required=true; el.setAttribute('aria-required','true'); });
  /* звёздочка в связанный label (если он есть) */
  document.querySelectorAll('form input[required]').forEach(function(el){
    var lb=el.id ? document.querySelector('label[for="'+el.id+'"]') : null;
    if(lb && !/\*\s*$/.test(lb.textContent)){
      var st=document.createElement('span');
      st.setAttribute('aria-hidden','true'); st.textContent=' *';
      lb.appendChild(st);
    }
  });
  /* 2) inline-фидбек после отправки (mailto не перезагружает страницу) */
  document.addEventListener('submit', function(e){
    var f=e.target; if(!f || f.tagName!=='FORM') return;
    var to=f.getAttribute('data-mail')||'info@semmering.com';
    var fb=f.querySelector('.form-feedback');
    if(!fb){
      fb=document.createElement('div');
      fb.className='form-feedback';
      fb.setAttribute('role','status');
      fb.setAttribute('aria-live','polite');
      /* flex-basis — для flex-форм (newsletter), grid-column — для .formgrid */
      fb.style.cssText='flex-basis:100%;width:100%;grid-column:1/-1;margin-top:10px;'
        +'padding:10px 14px;border-radius:10px;font-size:14px;line-height:1.45;'
        +'background:rgba(127,224,138,.16);border:1px solid rgba(127,224,138,.55);color:inherit;';
      f.appendChild(fb);
    }
    fb.innerHTML='📨 <span class="t-d">Dein E-Mail-Programm öffnet sich mit der fertigen Nachricht. '
      +'Falls sich nichts öffnet: schreib direkt an <a href="mailto:'+to
      +'" style="font-weight:700;text-decoration:underline;color:inherit">'+to+'</a>.</span>'
      +'<span class="t-e">Your e-mail app opens with the pre-filled message. '
      +'If nothing opens, e-mail us directly at <a href="mailto:'+to
      +'" style="font-weight:700;text-decoration:underline;color:inherit">'+to+'</a>.</span>';
  });
})();

/* Hero-Video play-gate: preload=none → per JS starten; bei Save-Data/2G nur Poster (spart Daten mobil) */
(function(){
  var vids=document.querySelectorAll('video.hero-video'); if(!vids.length) return;
  var c=navigator.connection||{};
  var slow=c.saveData===true || (typeof c.effectiveType==='string' && c.effectiveType.indexOf('2g')>-1);
  vids.forEach(function(v){
    if(slow) return;                 // nur Poster
    if(v.getAttribute('preload')==='none') v.preload='auto';
    var p=v.play(); if(p&&typeof p.catch==='function') p.catch(function(){});
  });
})();
