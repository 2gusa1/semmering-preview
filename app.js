// semmering.com прототип — интерактив (season + language toggle)
(function(){
  // ---- Season toggle (persists across pages) ----
  function _tog(el,on){ el.classList.toggle('on',on); el.setAttribute('aria-pressed', on?'true':'false'); }
  function applySeason(s){
    document.body.classList.toggle('winter', s==='winter');
    document.querySelectorAll('.season-toggle .s').forEach(e=>_tog(e, s!=='winter'));
    document.querySelectorAll('.season-toggle .w').forEach(e=>_tog(e, s==='winter'));
  }
  // Saison-Default nach Datum (Nov–März = Winter, Apr–Okt = Sommer); manueller Toggle überschreibt & bleibt gespeichert.
  function seasonByDate(){var m=new Date().getMonth()+1;return (m>=11||m<=3)?'winter':'summer';}
  // #664/#717 — saison-spezifische Seiten (data-season) erzwingen ihre Saison; sonst gespeicherte Wahl / Datum.
  var _forced = document.body.getAttribute('data-season');
  applySeason(_forced || localStorage.getItem('semmering_season') || seasonByDate());

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
    document.querySelectorAll('.lang-toggle .len').forEach(e=>_tog(e, l==='en'));
    document.querySelectorAll('.lang-toggle .lde').forEach(e=>_tog(e, l!=='en'));
    document.documentElement.lang = l;
    setDates();
  }
  applyLang(localStorage.getItem('semmering_lang') || 'de');

  // ---- Delegated clicks ----
  document.addEventListener('click', function(e){
    var st = e.target.closest('.season-toggle .s, .season-toggle .w');
    if(st){ var s = st.classList.contains('w') ? 'winter' : 'summer';
      localStorage.setItem('semmering_season', s); applySeason(s); return; }
    var lt = e.target.closest('.lang-toggle span');
    if(lt){ var l = lt.classList.contains('lde') ? 'de' : 'en';
      localStorage.setItem('semmering_lang', l); applyLang(l); return; }
    var ah = e.target.closest('.accordion .ac h4');
    if(ah){ ah.parentElement.classList.toggle('open'); }
    if(e.target.closest('.burger')){ document.body.classList.toggle('navopen'); }
    var navt = e.target.closest('.nav-toggle');
    if(navt){ e.preventDefault(); var ni=navt.closest('.navitem'); if(ni){ var op=ni.classList.toggle('open'); navt.setAttribute('aria-expanded', op?'true':'false'); } return; }
    // ---- Hirschi assistant ----
    var hf = e.target.closest('.hirschi-fab');
    if(hf){ var hr=document.getElementById('hirschi'); if(hr) hr.classList.toggle('open'); return; }
    if(e.target.closest('.hp-close')){ var h2=document.getElementById('hirschi'); if(h2) h2.classList.remove('open'); return; }
    var hqq = e.target.closest('.hq-q');
    if(hqq){ hqq.parentElement.classList.toggle('open'); return; }
  });

  // ---- Tastatur-Aktivierung für role=button (Toggles ohne native button) ----
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ' && e.key!=='Spacebar') return;
    var b = e.target.closest('.season-toggle span, .lang-toggle span, [role="button"]');
    if(b && (b.closest('.season-toggle') || b.closest('.lang-toggle'))){ e.preventDefault(); b.click(); }
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

/* Hero-Video play-gate + Pause-Steuerung (WCAG 2.2.2): preload=none → per JS starten;
   Save-Data/2G oder prefers-reduced-motion → nur Poster; Pause/Play-Button für alle. */
(function(){
  var vids=document.querySelectorAll('video.hero-video'); if(!vids.length) return;
  var c=navigator.connection||{};
  var slow=c.saveData===true || (typeof c.effectiveType==='string' && c.effectiveType.indexOf('2g')>-1);
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PLAY='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  vids.forEach(function(v){
    var host=v.parentElement; if(!host) return;
    var seas = v.classList.contains('only-winter')?' only-winter':(v.classList.contains('only-summer')?' only-summer':'');
    var btn=document.createElement('button');
    btn.type='button'; btn.className='hero-vidbtn'+seas;
    function label(){ var playing=!v.paused && !v.ended;
      btn.setAttribute('aria-label', playing?'Video pausieren':'Video abspielen');
      btn.innerHTML = playing?PAUSE:PLAY; }
    btn.addEventListener('click', function(){
      if(v.paused){ if(v.getAttribute('preload')==='none') v.preload='auto'; var q=v.play(); if(q&&q.catch) q.catch(function(){}); }
      else v.pause(); });
    v.addEventListener('play', label); v.addEventListener('pause', label);
    host.appendChild(btn);
    /* Text-Ausblenden-Toggle (Gafs 05.07: Text über Hero verdeckt das Video) */
    var EYE='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>';
    var TXT='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M3 5h18v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h12v2H3z"/></svg>';
    var tbtn=document.createElement('button');
    tbtn.type='button'; tbtn.className='hero-textbtn'+seas;
    function tlabel(){ var on=host.classList.contains('vidfocus');
      tbtn.setAttribute('aria-pressed', on?'true':'false');
      tbtn.setAttribute('aria-label', on?'Text wieder einblenden':'Text ausblenden und Video ansehen');
      tbtn.innerHTML = (on?TXT:EYE)+'<span>'+(on?'Text':'Video')+'</span>'; }
    tbtn.addEventListener('click', function(){
      var on=host.classList.toggle('vidfocus');
      if(on && v.paused){ if(v.getAttribute('preload')==='none') v.preload='auto'; var q=v.play(); if(q&&q.catch) q.catch(function(){}); }
      tlabel(); });
    host.appendChild(tbtn); tlabel();
    if(slow || reduce){ label(); return; }   // nur Poster; Button bietet Play
    if(v.offsetParent!==null){ if(v.getAttribute('preload')==='none') v.preload='auto'; var p=v.play(); if(p&&typeof p.catch==='function') p.catch(function(){}); }
    label();
  });
  // Saisonwechsel: nur das sichtbare Saison-Hero-Video spielt, verstecktes pausiert (spart Bandbreite)
  if(!slow && !reduce){
    document.querySelectorAll('.season-toggle .s, .season-toggle .w').forEach(function(btn){
      btn.addEventListener('click', function(){ setTimeout(function(){
        vids.forEach(function(v){
          if(v.offsetParent!==null){ if(v.getAttribute('preload')==='none') v.preload='auto'; var q=v.play(); if(q&&q.catch) q.catch(function(){}); }
          else { v.pause(); }
        });
      },60); });
    });
  }
})();

/* Reel-Videos (Hochformat auf Aktivitätsseiten): spielt beim Scrollen in den Blick, pausiert außerhalb.
   preload=none → erst laden, wenn sichtbar. reduced-motion → nur Poster. */
(function(){
  var reels=document.querySelectorAll('.reel-vid, .hv-v, .hir-anim-v'); if(!reels.length || !('IntersectionObserver' in window)) return;
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return; // nur Poster anzeigen
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v=e.target;
      if(e.isIntersecting){ if(v.getAttribute('preload')==='none') v.preload='auto'; var q=v.play(); if(q&&q.catch) q.catch(function(){}); }
      else { v.pause(); }
    });
  },{threshold:0.5});
  reels.forEach(function(v){ io.observe(v); });
  document.addEventListener('visibilitychange', function(){
    if(document.hidden){ reels.forEach(function(v){ v.pause(); }); return; }
    var vh=window.innerHeight||document.documentElement.clientHeight;
    reels.forEach(function(v){ var r=v.getBoundingClientRect(); if(r.bottom>0 && r.top<vh && v.offsetParent!==null){ var q=v.play(); if(q&&q.catch) q.catch(function(){}); } });
  });
})();

/* Preisrechner: Summe gewählter Erlebnisse × Personen (Sommer-Erwachsenenpreise) */
document.querySelectorAll('[data-calc]').forEach(function(c){
  var n=1, age='a';  // a=Erwachsene · j=Jugend/Sen. · k=Kinder — reale Tarife pro Altersgruppe
  // #716 — dynamischer, präziser All-In-Nudge: echte Ersparnis, sobald ≥2 All-In-Bausteine (Waldseilgarten+Bahn+Cart) > 55 € einzeln kosten
  var nudge=null, tot=c.querySelector('.calc-total');
  if(tot){ nudge=document.createElement('div'); nudge.className='calc-nudge'; nudge.style.display='none'; tot.parentNode.insertBefore(nudge, tot.nextSibling); }
  function pf(v){ if(v.indexOf('.')>-1){ var s=v.split('.'); return s[0]+','+(s[1].length===2?s[1]:s[1]+'0'); } return v; }
  function paint(){
    c.querySelectorAll('input[data-pa]').forEach(function(i){
      var raw=i.getAttribute('data-p'+age)||i.getAttribute('data-pa');
      var b=i.parentNode.querySelector('[data-pd]'); if(b) b.textContent=pf(raw)+' €';
    });
  }
  function upd(){
    var sum=0, allin=0;
    c.querySelectorAll('input[data-pa]:checked').forEach(function(i){
      var p=parseFloat(i.getAttribute('data-p'+age)||i.getAttribute('data-pa'))||0; sum+=p;
      if(i.hasAttribute('data-allin')) allin+=p;
    });
    var cn=c.querySelector('[data-cn]'), ct=c.querySelector('[data-ct]');
    if(cn) cn.textContent=n;
    var v=sum*n;
    if(ct) ct.textContent=(Number.isInteger(v)? String(v) : v.toFixed(2).replace('.',','))+' €';
    if(nudge){
      if(age==='a' && allin>55){
        var save=Math.round((allin-55)*n), es=allin*n;
        nudge.innerHTML='💡 <span class="t-d"><b>Diese Erlebnisse kosten einzeln '+es+' €.</b> Mit der <b>All-In Card</b> (Waldseilgarten + Bahn + Mountaincart) ab 55 €/Erw. — du sparst bis zu '+save+' €. <a href="#allin">All-In ansehen →</a></span><span class="t-e"><b>These experiences cost '+es+' € separately.</b> With the <b>All-In Card</b> (ropes park + ride + mountain cart) from €55/adult — you save up to '+save+' €. <a href="#allin">See All-In →</a></span>';
        nudge.style.display='block';
      } else nudge.style.display='none';
    }
  }
  c.addEventListener('change',upd);
  c.querySelectorAll('.calc-age').forEach(function(b){ b.addEventListener('click',function(){
    age=b.getAttribute('data-age');
    c.querySelectorAll('.calc-age').forEach(function(x){ x.classList.toggle('on',x===b); x.setAttribute('aria-selected',x===b?'true':'false'); });
    paint(); upd();
  }); });
  var cp=c.querySelector('[data-cp]'), cm=c.querySelector('[data-cm]');
  if(cp) cp.addEventListener('click',function(){ n=Math.min(20,n+1); upd(); });
  if(cm) cm.addEventListener('click',function(){ n=Math.max(1,n-1); upd(); });
  paint(); upd();
});

/* FAQ-Suche: filtert .ac-Akkordeons live nach Stichwort (season-hidden bleibt versteckt) */
document.querySelectorAll('[data-faqsearch]').forEach(function(inp){
  var nohit=document.querySelector('[data-faqnohit]');
  inp.addEventListener('input',function(){
    var q=inp.value.trim().toLowerCase(), any=false;
    document.querySelectorAll('.accordion .ac').forEach(function(ac){
      var m=!q || (ac.textContent||'').toLowerCase().indexOf(q)>-1;
      ac.style.display=m?'':'none';
      if(m && q && ac.offsetParent!==null) any=true;
    });
    if(nohit) nohit.hidden=(!q || any);
  });
});

/* Gafs 06.07: Foto-Karussells (.pc-track) rücken alle ~4 s automatisch eine Folie weiter,
   loopen am Ende zurück; Pause bei Hover/Touch/Wheel/Fokus & wenn außer Sicht; reduced-motion aus. */
(function(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tracks=document.querySelectorAll('.pc-track'); if(!tracks.length) return;
  tracks.forEach(function(track){
    var paused=false, inview=false, rt=null;
    function slideW(){ var s=track.querySelector('.pc-slide'); if(!s) return track.clientWidth*0.85;
      var g=parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap||'14')||14;
      return Math.round(s.getBoundingClientRect().width+g); }
    function step(){ if(paused||!inview) return;
      var max=track.scrollWidth-track.clientWidth-4;
      if(track.scrollLeft>=max) track.scrollTo({left:0,behavior:'smooth'});
      else track.scrollBy({left:slideW(),behavior:'smooth'}); }
    setInterval(step,4000);
    track.addEventListener('mouseenter',function(){paused=true;},{passive:true});
    track.addEventListener('mouseleave',function(){paused=false;},{passive:true});
    track.addEventListener('focusin',function(){paused=true;},{passive:true});
    track.addEventListener('focusout',function(){paused=false;},{passive:true});
    ['pointerdown','touchstart','wheel'].forEach(function(ev){
      track.addEventListener(ev,function(){ paused=true; clearTimeout(rt); rt=setTimeout(function(){paused=false;},3500); },{passive:true}); });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ inview=e.isIntersecting; }); },{threshold:0.25}).observe(track);
    } else { inview=true; }
  });
})();


/* A11Y: accordion headers keyboard-accessible (additive 2026-07-06) */
(function(){
  function syncExp(h){var ac=h.closest('.ac'); if(ac) h.setAttribute('aria-expanded', ac.classList.contains('open')?'true':'false');}
  function initAcc(){
    document.querySelectorAll('.accordion .ac > h4').forEach(function(h){
      if(h.getAttribute('role')==='button') return;
      h.setAttribute('role','button'); h.setAttribute('tabindex','0'); syncExp(h);
    });
  }
  if(document.readyState!=='loading') initAcc(); else document.addEventListener('DOMContentLoaded', initAcc);
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ' && e.key!=='Spacebar') return;
    var h=e.target.closest('.accordion .ac > h4'); if(!h) return;
    e.preventDefault(); h.click();
  });
  document.addEventListener('click', function(e){
    var h=e.target.closest('.accordion .ac > h4'); if(!h) return;
    setTimeout(function(){ syncExp(h); }, 0);
  });
})();


/* R-06: Filter-Chips (data-f) tastaturzugaenglich (additive 2026-07-07) */
(function(){
  function initChips(){
    document.querySelectorAll('.chip[data-f]').forEach(function(c){
      if(c.getAttribute('role')==='button') return;
      c.setAttribute('role','button'); c.setAttribute('tabindex','0');
      if(c.getAttribute('aria-pressed')===null) c.setAttribute('aria-pressed', (c.classList.contains('active')||c.classList.contains('on'))?'true':'false');
    });
  }
  if(document.readyState!=='loading') initChips(); else document.addEventListener('DOMContentLoaded', initChips);
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ' && e.key!=='Spacebar') return;
    var c=e.target.closest('.chip[data-f]'); if(!c) return;
    e.preventDefault(); c.click();
    setTimeout(function(){ c.setAttribute('aria-pressed', (c.classList.contains('active')||c.classList.contains('on'))?'true':'false'); },0);
  });
})();

/* FAQ-Suche i18n: placeholder/aria nach Sprache (additive 2026-07-07) */
(function(){
  function upd(){var en=document.body.classList.contains('en');
    document.querySelectorAll('[data-ph-de]').forEach(function(el){
      var ph=en?el.getAttribute('data-ph-en'):el.getAttribute('data-ph-de'); if(ph!=null)el.placeholder=ph;
      var al=en?el.getAttribute('data-al-en'):el.getAttribute('data-al-de'); if(al!=null)el.setAttribute('aria-label',al);
    });}
  try{new MutationObserver(upd).observe(document.body,{attributes:true,attributeFilter:['class']});}catch(e){}
  if(document.readyState!=='loading')upd();else document.addEventListener('DOMContentLoaded',upd);
})();

/* #651 — kompakter Header beim Herunterscrollen, voll beim Hochscrollen (Headroom). Passive + rAF. */
(function(){
  var H=document.body, last=window.scrollY||0, ticking=false;
  function onScroll(){
    var y=window.scrollY||0;
    /* #651-fix: абсолютный гистерезис (мёртвая зона 120–200) вместо порога по направлению ±4.
       hdr-compact меняет высоту topstack (~38px: .wrap 70→52 + скрытый .nf-mood); при узком пороге
       этот сдвиг + микро-реверсы скролла ре-триггерили тоггл → шапка дёргалась. Зона 80px > 38px сдвига. */
    if(y>200) H.classList.add('hdr-compact');
    else if(y<120) H.classList.remove('hdr-compact');
    last=y; ticking=false;
  }
  window.addEventListener('scroll',function(){ if(!ticking){ requestAnimationFrame(onScroll); ticking=true; } },{passive:true});
})();
