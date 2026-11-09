// ================= KALENDARZ =================
const MON_GEN=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const MON_NOM=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const DOW=['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
const DOW_S=['nd.','pn.','wt.','śr.','czw.','pt.','sob.'];
const GAME_START='2026-08-01';
function dP(s){const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d);}
function dS(t){const x=new Date(t);return x.getUTCFullYear()+'-'+String(x.getUTCMonth()+1).padStart(2,'0')+'-'+String(x.getUTCDate()).padStart(2,'0');}
function addDays(s,n){return dS(dP(s)+n*86400000);}
function daysBetween(a,b){return Math.round((dP(b)-dP(a))/86400000);}
function dow(s){return new Date(dP(s)).getUTCDay();}
function nextDow(s,w){let d=s;while(dow(d)!==w)d=addDays(d,1);return d;}
function fmtLong(s){const [y,m,d]=s.split('-').map(Number);return `${DOW[dow(s)]}, ${d} ${MON_GEN[m-1]} ${y}`;}
function fmtMid(s){const [y,m,d]=s.split('-').map(Number);return `${DOW_S[dow(s)]} ${d} ${MON_GEN[m-1]}`;}
function fmtShort(s){const [y,m,d]=s.split('-');return `${DOW_S[dow(s)]} ${d}.${m}`;}
function fmtDMY(s){const [y,m,d]=s.split('-');return `${d}.${m}.${y}`;}
function seasonYear(n){return 2025+n;}
function sLabel(n){const y=seasonYear(n);return y+'/'+String(y+1).slice(2);}
function ceDate(ce){return '30.06.'+(2026+ce);}
function today(){return SAVE.date||GAME_START;}
// ---- daty sezonu ----
const SLOTS=[[-1,'20:30'],[0,'14:45'],[0,'17:30'],[0,'20:30'],[1,'14:45'],[1,'17:30']];
function ensureDates(s){
  const Y=seasonYear(s.n);
  if(!s.sdates){let d=nextDow(`${Y}-08-15`,6);s.sdates=[];for(let k=0;k<N_SPAR;k++){s.sdates.push(d);d=addDays(d,k%2?3:4);}}
  if(!s.rdates){let d=nextDow(`${Y}-09-26`,6);s.rdates=[];while(s.rdates.length<s.rounds.length){const md=d.slice(5);const brk=(d.slice(0,4)==String(Y)&&md>='12-20')||(d.slice(0,4)==String(Y+1)&&md<='01-06');if(!brk)s.rdates.push(d);d=addDays(d,7);}}
  if(!s.podates){const st=addDays(s.rdates[s.rdates.length-1],14);s.podates=[0,4,7,11,14,18,21,25,28,32,35,39,42,46,49].map(o=>addDays(st,o));}
  if(!s.offDate)s.offDate=`${Y}-06-01`;
  if(s.po&&s.po.day==null){let day=0;for(const st of ['QF','SF','F']){const g=s.po.series.filter(x=>x.st===st).map(x=>x.games.length);if(g.length)day+=Math.max(...g);}s.po.day=day;}
}
function fixtureWhen(s,r,f){const i=s.rounds[r].findIndex(x=>x[0]===f[0]&&x[1]===f[1]);const sl=SLOTS[Math.max(0,i)%SLOTS.length];return {d:addDays(s.rdates[r],sl[0]),t:sl[1]};}
function poTime(d){return dow(d)===6?'17:30':'20:30';}
function nextEvent(){const s=S();if(!s)return null;ensureDates(s);
  if(s.phase==='off')return {d:s.offDate};
  if(s.phase==='spar'){const k=s.spar.res.length;return k<N_SPAR?{d:s.sdates[k],t:'18:00'}:null;}
  if(s.phase==='liga'){const f=s.rounds[s.round].find(f=>f[0]===SAVE.team||f[1]===SAVE.team);return fixtureWhen(s,s.round,f);}
  if(s.phase==='po'){const d=s.podates[Math.min(s.po.day,s.podates.length-1)];return {d,t:poTime(d)};}
  if(s.phase==='end')return {d:s.endDate||addDays(s.podates[Math.max(0,(s.po?s.po.day:1)-1)],3)};
  return null;}
function syncDate(){const e=nextEvent();if(e&&e.d>today())advanceTo(e.d);}
// ---- upływ czasu ----
function ageAt(dob,d){let a=+d.slice(0,4)-+dob.slice(0,4);if(d.slice(5)<dob.slice(5))a--;return a;}
function setDob(p,ref){ref=ref||today();const mm=1+Math.floor(R()*12),dd=1+Math.floor(R()*28);let y=+ref.slice(0,4)-p.age;let dob=`${y}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;if(ageAt(dob,ref)!==p.age){y--;dob=`${y}`+dob.slice(4);}p.dob=dob;}
function updateAges(){if(!SAVE.world)return;const d=today();for(const p of W().players){if(!p.dob)setDob(p,d);p.age=ageAt(p.dob,d);}}
function updateInjuries(){if(!SAVE.world)return;const d=today();
  for(const p of W().players){if(!p.injUntil){if(p.inj>0){p.injUntil=addDays(d,p.inj*7);p.inj=daysBetween(d,p.injUntil);}continue;}
    const rem=daysBetween(d,p.injUntil);if(rem<=0){p.inj=0;delete p.injUntil;if(p.tm===SAVE.team)news(`✅ ${p.first} ${p.last} wrócił do zdrowia.`);}else p.inj=rem;}}
function monthly(d){if(!SAVE.fin||SAVE.team==null)return;const m=+d.slice(5,7);const pay=payroll()/12,sp=sponsorAmt()/12;
  const stp=staffPay()/12,mnt=maintenance(),shp=shopIncome(myInfra().sklep);
  money(-pay,'Pensje');money(sp,'Sponsor');money(-stp,'Sztab');money(-mnt,'Utrzymanie');money(shp,'Sklep');const f=SAVE.fin;f.log.unshift({d,t:`${MON_NOM[m-1]}: pensje zawodników (−${fmt(pay)}) i sztabu (−${fmt(stp)}), utrzymanie (−${fmt(mnt)}), sponsor (+${fmt(sp)}), sklep (+${fmt(shp)})`,a:sp+shp-pay-stp-mnt});f.log=f.log.slice(0,80);}
function advanceTo(t){
  let d=today();const born=[];const mine=SAVE.team!=null&&SAVE.world?myTeam().players:[];
  while(d<t){d=addDays(d,1);if(d.endsWith('-01'))monthly(d);if(SAVE.build)checkBuild(d);const md=d.slice(5);for(const p of mine)if(p.dob&&p.dob.slice(5)===md)born.push(p);}
  SAVE.date=d;updateAges();updateInjuries();
  for(const p of born)if(p.tm===SAVE.team)news(`🎂 ${p.first} ${p.last} kończy ${p.age} lat.`);
}
function migrateDates(){
  if(!SAVE.season)return;ensureDates(SAVE.season);
  if(!SAVE.date){const e=nextEvent();SAVE.date=e?e.d:`${seasonYear(SAVE.season.n)}-08-01`;}
  if(SAVE.world)for(const p of W().players){if(!p.dob)setDob(p,SAVE.date);}
  updateInjuries();
}
// ---- widok kalendarza ----
function myEvents(){
  const s=S();ensureDates(s);const ev={};const add=(d,o)=>(ev[d]=ev[d]||[]).push(o);
  s.spar.opps.forEach((o,k)=>{const home=k%2===0;const r=s.spar.res[k];if(s.phase!=='spar'&&!r)return;add(s.sdates[k],{kind:'spar',op:o,home,t:'18:00',r});});
  s.rounds.forEach((rd,r)=>{const f=rd.find(x=>x[0]===SAVE.team||x[1]===SAVE.team);const w=fixtureWhen(s,r,f);const res=s.results[r]&&s.results[r].find(x=>x.me);add(w.d,{kind:'liga',op:f[0]===SAVE.team?f[1]:f[0],home:f[0]===SAVE.team,t:w.t,r:res,k:r+1});});
  if(s.po)for(const sr of s.po.series)for(const g of sr.games)if(g.me&&g.d)add(g.d,{kind:'po',op:g.h===SAVE.team?g.a:g.h,home:g.h===SAVE.team,r:g,st:sr.st});
  if(s.phase==='po'){const c=myNext();if(c)add(s.podates[s.po.day],{kind:'po',op:c.h===SAVE.team?c.a:c.h,home:c.h===SAVE.team,t:poTime(s.podates[s.po.day]),st:s.po.series.find(x=>x.id===c.sid).st});}
  return ev;}
function calView(){
  const s=S();ensureDates(s);
  const cur=ui.calM||today().slice(0,7);const [Y,M]=cur.split('-').map(Number);
  const first=`${cur}-01`;const startOff=(dow(first)+6)%7;const dim=new Date(Date.UTC(Y,M,0)).getUTCDate();
  const ev=myEvents();const td=today();
  const bd={};for(const p of myTeam().players)if(p.dob)(bd[p.dob.slice(5)]=bd[p.dob.slice(5)]||[]).push(p);
  const winOpen=d=>(d>=s.offDate&&d<=s.sdates[N_SPAR-1]);
  const brk=d=>{const y=seasonYear(s.n);return (d>`${y}-12-19`&&d<`${y+1}-01-07`);};
  const shift=n=>{const t=new Date(Date.UTC(Y,M-1+n,1));return t.getUTCFullYear()+'-'+String(t.getUTCMonth()+1).padStart(2,'0');};
  let cells='';for(let i=0;i<startOff;i++)cells+='<div class="cd empty"></div>';
  for(let dd=1;dd<=dim;dd++){const d=`${cur}-${String(dd).padStart(2,'0')}`;const es=ev[d]||[];const b=bd[d.slice(5)]||[];
    cells+=`<div class="cd ${d===td?'today':''} ${d<td?'past':''} ${winOpen(d)?'win':''} ${brk(d)?'brk':''}"><div class="dn">${dd}${d.endsWith('-01')?' <span title="Wypłata pensji i rata sponsora">💰</span>':''}</div>
    ${es.map(e=>{let res='';if(e.r){const my=e.r.h===SAVE.team?e.r.sw[0]:e.r.sw[1],op=e.r.h===SAVE.team?e.r.sw[1]:e.r.sw[0];res=`<b class="${my>op?'good':'bad'}">${my}:${op}</b>`;}
      return `<div class="ce ${e.kind}" style="--c:${TEAMS[e.op].color}"><span>${e.home?'🏠':'✈️'} ${esc(TEAMS[e.op].short)}</span>${res||`<small>${e.t||''}</small>`}<div class="ck">${e.kind==='spar'?'sparing':e.kind==='po'?STAGE[e.st]:'liga · K'+e.k}</div></div>`;}).join('')}
    ${b.map(p=>`<div class="cb" title="Urodziny">🎂 ${esc(p.last)}</div>`).join('')}${SAVE.build&&SAVE.build.until===d?`<div class="cb" style="color:#facc15">🏗️ koniec budowy</div>`:''}</div>`;}
  return `<div class="card"><div class="row wrap"><button class="ghost" onclick="ui.calM='${shift(-1)}';render()">◀</button><h2 style="margin:0;min-width:200px;text-align:center">${MON_NOM[M-1]} ${Y}</h2><button class="ghost" onclick="ui.calM='${shift(1)}';render()">▶</button><span class="sp"></span><button class="ghost" onclick="ui.calM=null;render()">Dziś</button></div>
  <p class="small mut">Dziś: <b style="color:var(--txt)">${fmtLong(td)}</b> · Sezon ${sLabel(s.n)}</p>
  <div class="cal"><div class="ch">pn.</div><div class="ch">wt.</div><div class="ch">śr.</div><div class="ch">czw.</div><div class="ch">pt.</div><div class="ch">sob.</div><div class="ch">nd.</div>${cells}</div>
  <div class="legend2 small mut"><span><i class="lg win"></i> okno transferowe</span><span><i class="lg brk"></i> przerwa świąteczna</span><span>🏠 u siebie · ✈️ na wyjeździe</span><span>💰 wypłaty (1. dnia miesiąca)</span><span>🎂 urodziny zawodników</span></div></div>
  ${keyDates()}`;
}
function keyDates(){const s=S();ensureDates(s);const Y=seasonYear(s.n);
  const rows=[['Okno transferowe',`${fmtDMY(s.offDate)} – ${fmtDMY(s.sdates[N_SPAR-1])}`],['Sparingi',`${fmtDMY(s.sdates[0])} – ${fmtDMY(s.sdates[N_SPAR-1])}`],['Faza zasadnicza (22 kolejki)',`${fmtDMY(addDays(s.rdates[0],-1))} – ${fmtDMY(addDays(s.rdates[s.rdates.length-1],1))}`],['Przerwa świąteczna',`20.12.${Y} – 06.01.${Y+1}`],['Play-off',`od ${fmtDMY(s.podates[0])}`],['Koniec sezonu i kontraktów','30.06.'+(Y+1)]];
  return `<div class="card"><h2>Najważniejsze daty sezonu ${sLabel(s.n)}</h2><table class="cmp"><tbody>${rows.map(r=>`<tr><td class="l">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div>`;}
