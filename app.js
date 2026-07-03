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
