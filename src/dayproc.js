// ================= EKRAN PRZETWARZANIA DNIA (po „Następny dzień” / „Dalej”) =================
// Pokazuje: następny mecz, nowe wiadomości, artykuł dnia, kalendarz na 2 tygodnie, terminarz i fragment tabeli.
// Tryby (Ustawienia): auto — zamyka się sam po kilku sekundach (najechanie/kliknięcie zatrzymuje), stay — do zamknięcia, off — wyłączony.
function dpMode(){let m='auto';try{m=localStorage.getItem('vm_dp')||'auto';}catch(e){}return ['auto','stay','off'].includes(m)?m:'auto';}
function dpSetMode(m){try{localStorage.setItem('vm_dp',m);}catch(e){}render();}
let DP_T=null;
function dpClose(){clearTimeout(DP_T);DP_T=null;const el=document.getElementById('dpov');if(el)el.remove();}
function dpPin(){clearTimeout(DP_T);DP_T=null;const b=document.querySelector('#dpov .dpbar i');if(b)b.style.animation='none';const t=document.querySelector('#dpov .dphint');if(t)t.textContent=_t('Zamknij, gdy skończysz czytać');}
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
function dpShow(d0){const mode=dpMode();if(mode==='off')return;dpClose();const el=document.createElement('div');el.id='dpov';el.className='dpov';
  el.innerHTML=`<div class="dpbox" onmouseenter="dpPin()" onclick="if(event.target.closest('button'))return;dpPin()"><div class="dptop"><div><b>${_t('Nowy dzień')}</b> · ${fmtLong(today())}</div><span class="dphint small mut">${mode==='auto'?_t('Zamknie się za chwilę — najedź, żeby zatrzymać'):''}</span><button class="ghost sm" onclick="dpClose()">✕</button></div>
   <div class="dpbar"><i class="${mode==='auto'?'run':''}"></i></div>
   <div class="dpgrid"><div class="dpcol">${dpNext()}<div class="dppan"><h4>${_t('Nowe wiadomości')}</h4>${dpMails(d0)}</div></div>
   <div class="dpcol">${dpArticle()}<div class="dppan"><h4>${_t('Kalendarz')}</h4>${dpCal()}</div></div>
   <div class="dpcol"><div class="dppan"><h4>${_t('Terminarz')}</h4>${dpFix()}${dpTable()}</div></div></div></div>`;
  el.addEventListener('click',e=>{if(e.target===el)dpClose();});document.body.appendChild(el);
  if(mode==='auto')DP_T=setTimeout(dpClose,4500);}
function dpAfter(d0){try{if(SAVE.team==null||SAVE.fired||!S()||ui.start)return;if(today()===d0)return;if(liveMatch&&liveMatch())return;if(ui.pm)return;dpShow(d0);}catch(e){console.error(e);}}
{const _nd=nextDay;nextDay=function(){const d0=today();const r=_nd.apply(this,arguments);dpAfter(d0);return r;};}
{const _na=nextAction;nextAction=function(){const d0=today();const r=_na.apply(this,arguments);dpAfter(d0);return r;};}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('dpov'))dpClose();});
// ustawienie w „Ustawienia i zapis gry” oraz w menu startowym
function dpCard(){const m=dpMode();const o=[['auto','Zamyka się sam'],['stay','Zostaje do zamknięcia'],['off','Wyłączony']];
  return `<div class="card"><h2>${_t('Ekran nowego dnia')}</h2><p class="small mut">${_t('Podsumowanie po kliknięciu „Następny dzień” lub „Dalej”: następny mecz, nowe wiadomości, artykuł dnia, kalendarz i terminarz.')}</p><div class="seg">${o.map(([k,n])=>`<button class="${m===k?'on':''}" onclick="dpSetMode('${k}')">${_t(n)}</button>`).join('')}</div></div>`;}
{const _sv=saveView;saveView=function(){return dpCard()+_sv.apply(this,arguments);};}
