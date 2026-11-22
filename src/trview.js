// ================= ZAKŁADKA TRENING (jedna linia podzakładek), OBÓZ PRZEZ POCZTĘ, ZAWODNICY NA KADRZE =================

// ---------- REPREZENTACJE: kto jest „na kadrze” ----------
// Zawodnik powołany na letni turniej (Liga Narodów, ME/MŚ/igrzyska) jest poza klubem od 10 dni przed pierwszym meczem
// swojej kadry do 10 dni po jej ostatnim meczu (urlop). W tym czasie nie trenuje w klubie, nie jedzie na obóz i nie gra sparingów.
const NT_PREP=10,NT_REST=10;
function ntGames(cp,c){return cp.gm.concat(cp.ko).filter(x=>x.h===c||x.a===c);}
// czy kadra c może jeszcze grać w turnieju cp
function ntAlive(cp,c){if(cp.champ||!cp.groups.flat().includes(c))return false;const G=ntGames(cp,c);if(G.some(x=>!x.res))return true;
  if(!cp.gm.every(x=>x.res))return true;// czeka na koniec grupy
  if(!cp.ko.length)return true;// losowanie fazy pucharowej jeszcze nie nastąpiło
  const ord=['QF','SF','F'];const lastSt=ord.filter(st=>cp.ko.some(x=>x.st===st)).pop();const inLast=cp.ko.some(x=>(x.st===lastSt||lastSt==='F'&&x.st==='B')&&(x.h===c||x.a===c));
  if(!inLast)return false;if(lastSt==='F')return false;// finał / mecz o brąz rozegrany
  const nextSt=ord[ord.indexOf(lastSt)+1];return !cp.ko.some(x=>x.st===nextSt);}
// mapa: id zawodnika → data powrotu do klubu ('?' = turniej trwa); liczona raz na dzień
let NTAW={k:null,m:{}};
function ntAwayMap(){const d=today();const s=S();const key=d+'|'+(s&&s.n)+'|'+(SAVE.ntT?1:0)+'|'+(s&&s.nt?1:0)+'|'+SAVE.team;
  if(NTAW.k===key)return NTAW.m;const m={};NTAW={k:key,m};
  if(!s||!s.nt||!SAVE.ntT||!SAVE.ntT.call)return m;
  for(const c of Object.keys(SAVE.ntT.call)){const comps=s.nt.comps.filter(cp=>cp.groups.flat().includes(c));if(!comps.length)continue;
    const all=comps.flatMap(cp=>ntGames(cp,c));if(!all.length)continue;const first=all.reduce((a,x)=>x.d<a?x.d:a,all[0].d);
    if(d<addDays(first,-NT_PREP))continue;const alive=comps.some(cp=>ntAlive(cp,c));const last=all.reduce((a,x)=>x.d>a?x.d:a,all[0].d);
    const back=addDays(last,NT_REST);if(!alive&&d>=back)continue;
    for(const id of SAVE.ntT.call[c])if(PLAYERS[id])m[id]=alive?'?':back;}
  return m;}
{const _nk=ntTick;ntTick=function(){const r=_nk.apply(this,arguments);NTAW.k=null;return r;};}
function ntAway(p){if(!p)return null;try{return ntAwayMap()[p.id]||null;}catch(e){return null;}}
function pOut(p){return !!(p&&(p.inj||ntAway(p)));}
function ntAwayTxt(p){const a=ntAway(p);if(!a)return '';return a==='?'?`w reprezentacji (${natN(pNat(p))}), turniej trwa`:`w reprezentacji (${natN(pNat(p))}), wraca ${fmtShort(a)}`;}
// --- wykluczenie nieobecnych ze składu (tak jak kontuzjowanych) ---
autoLineup=function(team){const u=new Set(),lu={};
  for(const [k,,pos] of LINEUP_KEYS){const c=team.players.filter(p=>!pOut(p)&&!u.has(p.id)).sort((a,b)=>lineupScore(b,pos)-lineupScore(a,pos))[0]||team.players.filter(p=>!p.inj&&!u.has(p.id))[0]||team.players.filter(p=>!u.has(p.id))[0];if(!c)continue;u.add(c.id);lu[k]=c.id;}
  return typeof lineupFix==='function'?lineupFix(team,lu):lu;};
{const _hl=healthyLineup;healthyLineup=function(team,lu){const away=team.players.filter(p=>!p.inj&&ntAway(p));if(!away.length)return _hl.apply(this,arguments);
  // nieobecnych traktujemy na chwilę jak kontuzjowanych
  for(const p of away)p._ntInj=p.inj,p.inj=1;try{return _hl.apply(this,arguments);}finally{for(const p of away){p.inj=p._ntInj;delete p._ntInj;}}};}
{const _ms=makeSide;makeSide=function(team,lu,tac,home,x){const ids=new Set(Object.values(lu));const away=team.players.filter(p=>!p.inj&&!ids.has(p.id)&&ntAway(p));if(!away.length)return _ms.apply(this,arguments);
  for(const p of away)p._ntInj=p.inj,p.inj=1;try{return _ms.apply(this,arguments);}finally{for(const p of away){p.inj=p._ntInj;delete p._ntInj;}}};}
{const _lf=lineupFix;lineupFix=function(team,lu){const away=team.players.filter(p=>!p.inj&&ntAway(p)&&!Object.values(lu).includes(p.id));if(!away.length)return _lf.apply(this,arguments);
  for(const p of away)p._ntInj=p.inj,p.inj=1;try{return _lf.apply(this,arguments);}finally{for(const p of away){p.inj=p._ntInj;delete p._ntInj;}}};}
// --- trening: nieobecni nie trenują w klubie ---
{const _td=trainDay;trainDay=function(d,md){const t=myTeam();if(!t)return _td.apply(this,arguments);const away=t.players.filter(p=>ntAway(p));if(!away.length)return _td.apply(this,arguments);
  const all=t.players;t.players=all.filter(p=>!away.includes(p));try{return _td.apply(this,arguments);}finally{t.players=all;}};}
// --- codziennie: powroty z kadry (niższa świeżość, wyższa forma), obecność na obozie ---
function ntDaily(d){if(SAVE.team==null||!S())return;const t=myTeam();if(!t)return;const now=new Set(t.players.filter(p=>ntAway(p)).map(p=>p.id));const prev=new Set(SAVE.ntAwPrev||[]);
  for(const id of prev)if(!now.has(id)){const P=PLAYERS[id];if(!P||P.p.tm!==SAVE.team)continue;const p=P.p;p.fr=Math.min(frOf(p),66+Math.round(R()*10));if(typeof formAdd==='function')formAdd(p,4);
    news(`🎌 ${p.first} ${p.last} wraca ze zgrupowania reprezentacji (${natN(pNat(p))}) — dobra forma meczowa, ale świeżość tylko ${p.fr}%.`);}
  for(const id of now)if(!prev.has(id)){const P=PLAYERS[id];if(P)news(`🎌 ${P.p.first} ${P.p.last} wyjeżdża na zgrupowanie reprezentacji (${natN(pNat(P.p))}).`);}
  SAVE.ntAwPrev=[...now];
  const c=typeof campOf==='function'&&campOf();if(c&&c.start&&!c.done&&d>=c.start&&d<=c.until){c.pres=c.pres||{};for(const p of t.players)if(!p.inj&&!ntAway(p))c.pres[p.id]=(c.pres[p.id]||0)+1;}
  // zaplanowany wyjazd na obóz (po powrocie kadrowiczów)
  if(c&&!c.start&&c.plan&&d>=c.plan){const C=CAMPS.find(x=>x[0]===c.k);c.start=d;c.until=addDays(d,C[4]);achEv&&achEv('camp');news(`🚌 Drużyna wyjeżdża na obóz: ${C[1]} (${C[2]}). Powrót ${fmtDMY(c.until)}.`);}}
{const _md=mailDaily;mailDaily=function(d){try{ntDaily(d);}catch(e){console.error(e);}try{campMailCheck();}catch(e){console.error(e);}return _md.apply(this,arguments);};}
// obóz: efekty tylko dla obecnych przez co najmniej połowę obozu
{const _cd=campDay;campDay=function(d){const c=campOf();if(!c||c.done||!c.until||d<c.until||!c.pres)return _cd.apply(this,arguments);const t=myTeam();const C=CAMPS.find(x=>x[0]===c.k);
  const miss=t.players.filter(p=>!p.inj&&(c.pres[p.id]||0)<C[4]/2);if(!miss.length)return _cd.apply(this,arguments);
  for(const p of miss)p._ntInj=p.inj,p.inj=1;try{_cd.apply(this,arguments);}finally{for(const p of miss){p.inj=p._ntInj;delete p._ntInj;}}
  news(`🏕️ Na obozie zabrakło (kadra): ${miss.map(p=>p.last).join(', ')} — bez efektów obozu.`);};}
// znacznik „KADRA” przy nazwisku (wszędzie, gdzie jest flaga)
{const _nt=natTag;natTag=function(p){const h=_nt.apply(this,arguments);const a=ntAway(p);return a?h+`<span class="ntaw" title="${esc(ntAwayTxt(p))}">KADRA${a!=='?'?' do '+fmtShort(a):''}</span>`:h;};}

// ---------- OBÓZ: wybór w wiadomości ----------
function campAwayInfo(){const t=myTeam();const m=ntAwayMap();const ps=t.players.filter(p=>m[p.id]);if(!ps.length)return null;
  const known=ps.map(p=>m[p.id]).filter(x=>x!=='?');let back=known.length?known.reduce((a,x)=>x>a?x:a,known[0]):null;
  if(ps.some(p=>m[p.id]==='?')){const s=S();const all=s.nt?s.nt.comps.flatMap(cp=>cp.gm.concat(cp.ko).concat(cp.koD.map(d=>({d})))).map(x=>x.d):[];const last=all.reduce((a,x)=>x>a?x:a,today());const est=addDays(last,NT_REST);if(!back||est>back)back=est;}
  return {ps,back};}
function campChooser(){const c=campOf();
  if(c){const C=CAMPS.find(x=>x[0]===c.k);return `<p>Obóz zarezerwowany: <b>${C[3]} ${esc(C[1])}</b> (${esc(C[2])}), ${C[4]} dni, ${fmt(c.cost)}.</p><p class="small">${c.start?`Termin: <b>${fmtDMY(c.start)} – ${fmtDMY(c.until)}</b>${c.done?' · zakończony':''}`:c.plan?`Wyjazd zaplanowany na <b>${fmtDMY(c.plan)}</b> (po powrocie kadrowiczów).`:'Wyjazd razem ze startem przygotowań do sezonu.'}</p>`;}
  if(!campCanBook())return '<p class="mut">Obozu nie można już zarezerwować w tym sezonie.</p>';
  const s=S();const A=campAwayInfo();const tomorrow=addDays(today(),1);const when=ui.campWhen||(A?'late':'now');
  const startD=when==='late'&&A?A.back:s.phase==='off'?null:tomorrow;
  const dots=v=>v<=0?(v<0?'<span class="bad">▼</span>':'<span class="mut">—</span>'):'<span class="cdots">'+'●'.repeat(Math.max(1,Math.round(v)))+'</span>';
  const rows=CAMPS.map(C=>{const cost=campCost(C);const fx=C[6];const on=ui.confirm==='camp'+C[0];
    return `<tr class="${on?'on':''}"><td class="l"><span style="font-size:17px">${C[3]}</span> <b>${esc(C[1])}</b><div class="small mut">${esc(C[2])} · ${C[4]} dni</div></td><td><b style="color:var(--acc)">${fmt(cost)}</b></td>
     <td>${dots(fx.kon)}</td><td>${dots(fx.zgr)}</td><td>${dots(fx.tak)}</td><td>${dots(fx.mor)}</td><td>${dots(fx.reg)}</td><td class="${fx.inj>1.05?'bad':fx.inj<0.95?'good':'mut'}">${fx.inj>1.05?'wyższe':fx.inj<0.95?'niższe':'normalne'}</td>
     <td><button class="${on?'btn':'ghost'} sm" onclick="campBook2('${C[0]}')">${on?'Potwierdź':'Wybierz'}</button></td></tr>${on?`<tr class="on"><td colspan="9" class="l small">${esc(C[7])} Płatne jednorazowo z salda klubu: ${fmt(SAVE.fin.bal)} → <b>${fmt(SAVE.fin.bal-cost)}</b>.${startD?` Termin: <b>${fmtDMY(startD)} – ${fmtDMY(addDays(startD,C[4]-1))}</b>.`:' Wyjazd razem ze startem przygotowań.'}</td></tr>`:''}`;}).join('');
  return `<p>Trenerze, przed sezonem możemy wyjechać na obóz przygotowawczy. Każde miejsce daje co innego — wybierz jedno. Efekt wzmacnia trener przygotowania fizycznego (${staffSkill('fiz')}/20).</p>
   ${A?`<div class="trwarn small">🎌 Na kadrze: ${A.ps.map(p=>`<b>${esc(p.last)}</b>`).join(', ')} — wrócą ok. <b>${fmtDMY(A.back)}</b>. Zawodnicy nieobecni przez ponad połowę obozu nie skorzystają z niego.</div>`:''}
   ${s.phase==='spar'||A?`<div class="row wrap" style="gap:8px;margin:8px 0"><span class="small mut">Termin wyjazdu:</span><div class="seg"><button class="${when==='now'?'on':''}" onclick="ui.campWhen='now';render()">${s.phase==='off'?'Ze startem przygotowań':`Jutro (${fmtShort(tomorrow)})`}</button>${A?`<button class="${when==='late'?'on':''}" onclick="ui.campWhen='late';render()">Po powrocie kadrowiczów (${fmtShort(A.back)})</button>`:''}</div></div>`:''}
   ${ui.campErr?`<div class="tmsg no">${esc(ui.campErr)}</div>`:''}
   <div class="tw"><table class="camptab"><thead><tr><th class="l">Miejsce</th><th>Koszt</th><th title="Kondycja">Kond.</th><th title="Zgranie">Zgr.</th><th title="Taktyka">Takt.</th><th title="Morale">Mor.</th><th title="Świeżość">Śwież.</th><th>Urazy</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;}
function campBook2(k){const s=S();const A=campAwayInfo();const when=ui.campWhen||(A?'late':'now');const had=campOf();
  campBook(k);const c=campOf();if(c&&!had){if(when==='late'&&A&&A.back>addDays(today(),1)){c.start=null;c.until=null;c.plan=A.back;}
    const M=mailBox().find(m=>m.b&&m.b.type==='camp'&&m.act);if(M)M.act=0;ui.campWhen=null;save();render();}}
function campMailCheck(){if(SAVE.team==null||!S()||typeof campCanBook!=='function')return;const s=S();if(!campCanBook()||campOf())return;SAVE.campMail=SAVE.campMail||{};if(SAVE.campMail[s.n])return;
  const fz=SAVE.staff&&SAVE.staff.fiz;const from=fz?`${fz.first} ${fz.last} (trener przygotowania)`:asyName();
  const m=sendMail({cat:'trening',from,t:'Obóz przygotowawczy — wybierz miejsce',s:'Wybierz obóz przed sezonem',b:{type:'camp'},act:1,lab:'Wymaga decyzji'});if(m)SAVE.campMail[s.n]=m.id;}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){if(m.b&&m.b.type==='camp')return campChooser();return _mb.apply(this,arguments);};}
function campOpenMail(){const id=SAVE.campMail&&SAVE.campMail[S().n];if(id){ui.mailSel=id;const m=mailBox().find(x=>x.id===id);if(m)m.r=1;}go('poczta');}
// karta obozu nie jest już częścią zakładki Trening (wybór przychodzi pocztą)
campCard=function(){return '';};
// terminarz: dni obozu i nieobecności kadrowiczów
{const _cv=calView;calView=function(){let h=_cv.apply(this,arguments);try{const cur=ui.calM||today().slice(0,7);const c=campOf();const add={};
  const mark=(d,html)=>{if(d.slice(0,7)!==cur)return;(add[+d.slice(8)]=add[+d.slice(8)]||[]).push(html);};
  if(c&&(c.start||c.plan)){const C=CAMPS.find(x=>x[0]===c.k);const st=c.start||c.plan;for(let i=0;i<C[4];i++)mark(addDays(st,i),`<div class="cb" style="color:#4cd07d">🏕️ ${i===0?'obóz: '+esc(C[1]):'obóz'}</div>`);}
  const m=ntAwayMap();for(const p of myTeam().players){const a=m[p.id];if(a&&a!=='?')mark(a,`<div class="cb" style="color:#f2c418">🎌 wraca ${esc(p.last)}</div>`);}
  for(const dd in add){const re=new RegExp(`(<div class="dn">${dd}(?: <span[^>]*>💰</span>)?</div>)`);h=h.replace(re,`$1${add[dd].join('')}`);}}catch(e){console.error(e);}return h;};}
{const _kd=keyDates;keyDates=function(){let h=_kd.apply(this,arguments);try{const c=campOf();const rows=[];if(c){const C=CAMPS.find(x=>x[0]===c.k);rows.push([`Obóz: ${C[1]}`,c.start?`${fmtDMY(c.start)} – ${fmtDMY(c.until)}`:c.plan?`od ${fmtDMY(c.plan)}`:'ze startem przygotowań']);}
  const A=campAwayInfo();if(A)rows.push(['Powrót kadrowiczów',`ok. ${fmtDMY(A.back)} (${A.ps.map(p=>p.last).join(', ')})`]);
  if(rows.length)h=h.replace('</tbody></table></div>',rows.map(r=>`<tr><td class="l">${r[0]}</td><td>${r[1]}</td></tr>`).join('')+'</tbody></table></div>');}catch(e){}return h;};}

// ---------- ZAKŁADKA TRENING ----------
const TRV_TABS=[['ov','Przegląd'],['zesp','Zespół'],['ind','Indywidualny'],['rap','Raporty'],['med','Medyczne'],['tren','Trenerzy']];
const TRV_MAP=[[/Plan treningowy|Intensywność|Przygotowanie do meczu|Struktura sesji/i,'ov'],[/Zadowolenie z treningu|Postawa na treningach|^Zespół/i,'zesp'],[/Raport z treningów|Ostatnie treningi/i,'rap'],[/Centrum medyczne|Gabinet medyczny/i,'med'],[/Obóz przygotowawczy/i,null]];
function trvCards(html){const box=document.createElement('div');box.innerHTML=html;const out={ov:[],zesp:[],rap:[],med:[],head:null};
  const cards=[...box.querySelectorAll('.card')].filter(c=>!c.parentElement.closest('.card'));
  for(const c of cards){const h=c.querySelector('h2');const tx=h?h.textContent.trim():'';
    if(!h&&/OBOWIĄZKI TRENINGOWE/.test(c.textContent)){const sg=c.querySelector('.seg');if(sg)sg.remove();out.head=c.outerHTML;continue;}
    const r=TRV_MAP.find(([re])=>re.test(tx));if(r&&r[1]===null)continue;(out[r?r[1]:'ov']).push({tx,h:c.outerHTML});}
  return out;}
function trvKpi(){const t=myTeam();const ps=t.players;const avg=Math.round(teamFr());const avF=Math.round(ps.reduce((s,p)=>s+fmOf(p),0)/ps.length);
  const bad=typeof trSat==='function'?ps.filter(p=>!trSat(p).ok).length:0;const inj=ps.filter(p=>p.inj).length;const aw=ps.filter(p=>ntAway(p));
  const c=campOf();const C=c&&CAMPS.find(x=>x[0]===c.k);
  const camp=c?`${C[3]} ${esc(C[1])}<small>${c.done?'zakończony':c.start?`${fmtShort(c.start)} – ${fmtShort(c.until)}`:c.plan?`wyjazd ${fmtShort(c.plan)}`:'ze startem przygotowań'}</small>`:campCanBook()?`<button class="link" onclick="campOpenMail()">Wybierz w poczcie →</button><small>przed sezonem</small>`:'—<small>w tym sezonie</small>';
  const k=(l,v,col)=>`<div class="trk"><span>${l}</span><b style="${col?`color:${col}`:''}">${v}</b></div>`;
  return `<div class="card trkpi">${k('Średnia świeżość',avg+'%',frCol(avg))}${k('Forma zespołu',formLv(avF)[1],formLv(avF)[2])}${k('Zadowolenie',bad<=2?'dobre':bad<=5?'mieszane':'złe',bad<=2?'var(--good)':bad<=5?'var(--warn)':'var(--bad)')}
   ${k('Kontuzje',inj,inj?'var(--bad)':'')}${k('Na kadrze',aw.length?`${aw.length}<small>${aw.map(p=>esc(p.last)).join(', ')}</small>`:'0','')}<div class="trk"><span>Obóz</span><b>${camp}</b></div></div>`;}
{const _tv=trainingView;trainingView=function(){
  const map={ind:'ind',ment:'ind',rest:'zesp',rez:'zesp',coach:'tren'};if(ui.trTab&&ui.trTab!=='ov'){ui.trT=map[ui.trTab]||'ov';ui.trTab='ov';}
  const tab=ui.trT||'ov';ui.trTab='ov';const raw=_tv.apply(this,arguments);const C=trvCards(raw);
  const bar=`<div class="subtabs trtabs">${TRV_TABS.map(([k,l])=>`<button class="${k===tab?'on':''}" onclick="ui.trT='${k}';render()">${l}</button>`).join('')}</div>`;
  const pick=(arr,re)=>arr.filter(x=>re.test(x.tx)).map(x=>x.h).join('');
  let body='';
  if(tab==='ov')body=trvKpi()+(C.head||'')+pick(C.ov,/Plan treningowy/i)+`<div class="trrow">${pick(C.ov,/Intensywność/i)}${pick(C.ov,/Przygotowanie do meczu/i)}${pick(C.ov,/Struktura sesji/i)}</div>`+C.ov.filter(x=>!/Plan treningowy|Intensywność|Przygotowanie do meczu|Struktura sesji/i.test(x.tx)).map(x=>x.h).join('');
  else if(tab==='zesp')body=pick(C.zesp,/^Zespół/i)+`<div class="trrow">${pick(C.zesp,/Zadowolenie/i)}${pick(C.zesp,/Postawa/i)}</div>`+trxRest()+trxRez();
  else if(tab==='ind')body=trxInd()+trxMent();
  else if(tab==='rap')body=C.rap.map(x=>x.h).join('');
  else if(tab==='med')body=`<div class="trrow">${C.med.map(x=>x.h).join('')}</div>`;
  else body=trxCoach();
  return bar+body;};}
{const _g=goTrainRep;goTrainRep=function(k){ui.trT='rap';return _g.apply(this,arguments);};}

{const _cs=campStart;campStart=function(){const c=campOf();if(c&&c.plan&&!c.start)return;return _cs.apply(this,arguments);};}
{const _r=render;render=function(){try{if(SAVE&&SAVE.team!=null&&!ui.start&&SAVE.world)campMailCheck();}catch(e){}return _r.apply(this,arguments);};}
