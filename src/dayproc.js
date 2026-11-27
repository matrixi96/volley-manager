// ================= EKRAN PRZETWARZANIA DNIA (po „Następny dzień” / „Dalej”) =================
// Pokazuje: następny mecz, nowe wiadomości, artykuł dnia, kalendarz na 2 tygodnie, terminarz i fragment tabeli.
// Tryby (Ustawienia): run — dni mijają same aż do decyzji/dnia meczowego/zatrzymania; off — wyłączony.
function dpMode(){let m='run';try{m=localStorage.getItem('vm_dp')||'run';}catch(e){}return m==='off'?'off':'run';}
function dpSetMode(m){try{localStorage.setItem('vm_dp',m);}catch(e){}render();}
function dpGoMecz(){dpClose();go('mecz');}
function dpGoMail(id){dpClose();const m=mailBox().find(x=>x.id===id);if(!m)return;ui.mailSel=id;if(typeof mailOpen==='function')mailOpen(id);go('poczta');}
function dpNext(){const c=myNext();if(!c)return `<div class="dpnext dpnone"><b>${_t('Brak zaplanowanego meczu')}</b></div>`;const w=nextEvent();const op=c.h===SAVE.team?c.a:c.h;const home=c.h===SAVE.team;
  const days=w?daysBetween(today(),w.d):null;const comp=c.kind==='liga'?`${LG_N[myLg()]} · ${_t('kolejka')} ${S().round+1}`:c.kind==='spar'?_t('Sparing'):c.kind==='po'?'Play-off':c.kind==='cup'?cupName(myCountry()):c.kind==='euro'?euroLab(c):c.kind==='nt'?_t('Reprezentacja'):'';
  const opn=c.kind==='nt'?natN(c.h===myNT()?c.a:c.h):TEAMS[op]?TEAMS[op].name:'';
  return `<button class="dpnext" onclick="dpGoMecz()"><span class="dpd">${w?fmtLong(w.d).replace(/ \d{4}$/,''):''}${w&&w.t?' · '+w.t:''}</span><b>${_t('Następny mecz')}</b><span>${esc(comp)}</span><span>${c.kind!=='nt'?teamCrest(op,18)+' ':''}${esc(opn)} (${home?'D':'W'})${days!=null?` · <b>${days<=0?_t('dziś'):days===1?_t('jutro'):(LANG==='en'?`in ${days} days`:`za ${days} dni`)}</b>`:''}</span></button>`;}
function dpMails(d0){const xs=mailBox().filter(m=>m.d>d0).slice(0,6);if(!xs.length)return `<p class="small mut">${_t('Brak nowych wiadomości.')}</p>`;
  return xs.map(m=>`<button class="dpm" onclick="dpGoMail('${esc(String(m.id))}')"><small>${esc(m.from)}</small><span>${m.act?'<i class="mdot"></i>':''}${esc(m.t)}</span></button>`).join('');}
function dpArticle(){try{if(typeof ptFeed!=='function'||typeof aArticle!=='function')return '';ptFeed();const rec=x=>daysBetween(x.d,today())<=3;let i=FEED_LAST.findIndex(x=>(x.score||x.nt||x.champ)&&rec(x));if(i<0)i=FEED_LAST.findIndex(x=>['Liga','Transfery','Reprezentacja'].includes(x.k)&&!/rozmow|zlekceważ/i.test(aPlain(x.t)));if(i<0)i=FEED_LAST.findIndex(x=>x.k!=='Media'&&x.k!=='Social media');if(i<0)return '';const x=FEED_LAST[i];const a=aArticle(x);
  const hero=x.score?`${teamCrest(x.score.h,46)}<b>${x.score.sw[0]} – ${x.score.sw[1]}</b>${teamCrest(x.score.a,46)}`:x.nt?`<span class="ptfl">${natFl(x.nt.h)}</span><b>${x.nt.sw[0]} – ${x.nt.sw[1]}</b><span class="ptfl">${natFl(x.nt.a)}</span>`:`<span style="font-size:40px">${x.ic||'📰'}</span>`;
  return `<button class="dpart" onclick="dpClose();aOpen(${i})"><div class="dpah">${hero}</div><div class="dpab"><b>${esc(a.title)}</b><p>${esc(a.lead)}</p><small>${esc(a.outlet)} · ${ptAgo(x.d)} <span class="acc">${_t('Czytaj')} →</span></small></div></button>`;}catch(e){console.error(e);return '';}}
function dpCal(){const ev=myEvents();const t=today();const mon=addDays(t,-((dow(t)+6)%7));let md=null;try{md=matchDays();}catch(e){md=new Set();}
  const hdr=(LANG==='en'?['Mo','Tu','We','Th','Fr','Sa','Su']:['Pn','Wt','Śr','Cz','Pt','Sb','Nd']).map(d=>`<span class="dpch" data-noi18n>${d}</span>`).join('');
  const cells=Array.from({length:14},(_,i)=>{const d=addDays(mon,i);const es=ev[d]||[];let inner='';
    if(es.length){const e=es[0];inner=`<span class="dpev ${e.home?'h':'a'}">${e.op!=null&&TEAMS[e.op]?esc(TEAMS[e.op].short):''}<small>${e.r&&e.r.sw?(e.home?e.r.sw.join(':'):e.r.sw.slice().reverse().join(':')):`${e.home?'D':'W'}${e.t?' '+e.t:''}`}</small></span>`;}
    else if(d>=t&&typeof dayPlan==='function'){try{const p=dayPlan(d,md).filter(Boolean);inner=`<span class="dptr">${p.map(k=>TR_UNITS[k]?`<i title="${esc(_t(TR_UNITS[k].n))}">${TR_UNITS[k].ic}</i>`:'').join('')}</span>`;}catch(e){}}
    return `<div class="dpc ${d===t?'today':''} ${d<t?'past':''}"><span class="dpn">${+d.slice(8)}</span>${inner}</div>`;}).join('');
  return `<div class="dpcal">${hdr}${cells}</div>`;}
function dpFix(){const ev=myEvents();const ks=Object.keys(ev).sort();const t=today();const past=ks.filter(d=>d<t).slice(-2),fut=ks.filter(d=>d>=t).slice(0,5);
  return [...past,...fut].map(d=>{const e=ev[d][0];const res=e.r&&e.r.sw?(e.home?e.r.sw:e.r.sw.slice().reverse()):null;const won=res&&res[0]>res[1];
    return `<div class="dpf ${d>=t&&d===fut[0]?'nx':''}"><span class="mut">${fmtShort(d)}</span><span>${e.op!=null&&TEAMS[e.op]?teamCrest(e.op,14)+' '+esc(TEAMS[e.op].short):''}</span><b class="${res?(won?'good':'bad'):'mut'}">${res?res.join(':'):(e.home?'D':'W')+(e.t?' '+e.t:'')}</b></div>`;}).join('')||`<p class="small mut">${_t('Brak meczów.')}</p>`;}
function dpTable(){try{const s=S();if(s.phase!=='liga'&&s.phase!=='po')return '';const tb=leagueTable();const i=tb.findIndex(x=>x.i===SAVE.team);if(i<0)return '';const a=Math.max(0,Math.min(i-2,tb.length-5));
  return `<h4>${_t('Tabela')}</h4>`+tb.slice(a,a+5).map((x,j)=>`<div class="dpf ${x.i===SAVE.team?'nx':''}"><span>${a+j+1}.</span><span>${esc(TEAMS[x.i].short)}</span><b>${x.pts}</b></div>`).join('');}catch(e){return '';}}
// ---- ciągłe przetwarzanie: dzień po dniu, aż do wiadomości wymagającej decyzji, dnia meczowego albo ręcznego zatrzymania ----
let DP={run:false,d0:null,acts:null,t:null};
function dpActIds(){return new Set(mailBox().filter(m=>m.act).map(m=>m.id));}
function dpStopWhy(){try{if(SAVE.fired)return 'fired';if(ui.start||!S())return 'menu';if(typeof liveMatch==='function'&&liveMatch())return 'match';
  const nm=mailBox().find(m=>m.act&&!DP.acts.has(m.id));if(nm)return {mail:nm};
  const c=myNext();const w=c?nextEvent():null;if(c&&w&&w.d<=today())return 'matchday';}catch(e){console.error(e);return 'err';}return null;}
function dpRender(){const el=document.getElementById('dpov');if(!el)return;const on=DP.run;
  el.querySelector('.dpbox').innerHTML=`<div class="dptop"><div><b>${on?_t('Przetwarzanie'):_t('Zatrzymano')}</b> · ${fmtLong(today())}</div><span class="dphint small mut">${on?_t('Dni mijają do najbliższej decyzji albo meczu'):''}</span>${on?`<button class="btn sm" onclick="dpStop()">⏸ ${_t('Zatrzymaj')}</button>`:`<button class="btn sm" onclick="dpResume()">▶ ${_t('Kontynuuj')}</button>`}<button class="ghost sm" onclick="dpClose()">✕</button></div>
   <div class="dpbar"><i class="${on?'run':''}"></i></div>
   <div class="dpgrid"><div class="dpcol">${dpNext()}<div class="dppan"><h4>${_t('Nowe wiadomości')}</h4>${dpMails(DP.d0)}</div></div>
   <div class="dpcol">${dpArticle()}<div class="dppan"><h4>${_t('Kalendarz')}</h4>${dpCal()}</div></div>
   <div class="dpcol"><div class="dppan"><h4>${_t('Terminarz')}</h4>${dpFix()}${dpTable()}</div></div></div>`;}
function dpClose(){DP.run=false;clearTimeout(DP.t);const el=document.getElementById('dpov');if(el)el.remove();}
function dpOpen(d0){dpClose();DP.d0=d0;const el=document.createElement('div');el.id='dpov';el.className='dpov';el.innerHTML='<div class="dpbox"></div>';
  el.addEventListener('click',e=>{if(e.target===el)dpStop();});document.body.appendChild(el);}
function dpFinish(why){DP.last=why&&why.mail?'mail:'+why.mail.t:why;dpClose();
  if(why&&why.mail){ui.mailSel=why.mail.id;if(typeof mailOpen==='function')mailOpen(why.mail.id);go('poczta');}
  else if(why==='matchday')go('mecz');else render();}
function dpTick(){if(!DP.run)return;let why=dpStopWhy();if(why)return dpFinish(why);const d=today();
  try{_dpNd();}catch(e){console.error(e);return dpFinish('err');}
  if(today()===d)return dpFinish(null);// dzień się nie zmienił — oddaj sterowanie grze
  why=dpStopWhy();if(why)return dpFinish(why);dpRender();DP.t=setTimeout(dpTick,900);}
function dpStop(){DP.run=false;clearTimeout(DP.t);dpRender();render();}
function dpResume(){if(DP.run)return;DP.run=true;DP.acts=dpActIds();dpRender();DP.t=setTimeout(dpTick,400);}
function dpStart(d0,acts){if(dpMode()==='off')return;DP.acts=acts;DP.run=true;const why=dpStopWhy();if(why)return dpFinish(why);dpOpen(d0);DP.run=true;dpRender();DP.t=setTimeout(dpTick,900);}
let _dpNd=null;
function dpWrap(fn){return function(){if(DP.run)return;const d0=today(),acts=dpActIds();const r=fn.apply(this,arguments);try{if(today()!==d0&&SAVE.team!=null&&!SAVE.fired&&!(typeof liveMatch==='function'&&liveMatch())&&!ui.pm)dpStart(d0,acts);}catch(e){console.error(e);}return r;};}
{const _nd=nextDay;_dpNd=function(){return _nd.apply(this,arguments);};nextDay=dpWrap(_nd);}
// „Dalej”: zamiast skoku do następnego wydarzenia — dni mijają po kolei z podglądem
{const _na=nextAction;const w=dpWrap(_na);nextAction=function(){if(!DP.run&&dpMode()!=='off'){try{const s=S();const e=s&&!SAVE.fired&&!(typeof liveMatch==='function'&&liveMatch())?nextEvent():null;if(e&&e.d>today())return nextDay();}catch(er){console.error(er);}}return w.apply(this,arguments);};}
document.addEventListener('keydown',e=>{if(!document.getElementById('dpov'))return;if(e.key==='Escape')dpClose();else if(e.key===' '&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){e.preventDefault();DP.run?dpStop():dpResume();}});
// ustawienie w „Ustawienia i zapis gry” oraz w menu startowym
function dpCard(){const m=dpMode();const o=[['run','Włączony'],['off','Wyłączony']];
  return `<div class="card"><h2>${_t('Ekran nowego dnia')}</h2><p class="small mut">${_t('Po kliknięciu „Następny dzień” lub „Dalej” dni mijają same (z podglądem: następny mecz, nowe wiadomości, artykuł dnia, kalendarz, terminarz) — aż do wiadomości wymagającej decyzji, dnia meczowego albo zatrzymania (przycisk lub spacja).')}</p><div class="seg">${o.map(([k,n])=>`<button class="${m===k?'on':''}" onclick="dpSetMode('${k}')">${_t(n)}</button>`).join('')}</div></div>`;}
{const _sv=saveView;saveView=function(){return dpCard()+_sv.apply(this,arguments);};}
