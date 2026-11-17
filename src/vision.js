// ================= STRATEGIA KLUBU (jak „Club Vision” w FM) =================
// SAVE.vis={tm,prof,goals:[[k,imp]],rules:[[k,imp]],trad:[k...],plan:[{n,g}],rep0,n0,log:[{d,t,ok}],fans,ev:{t,x,until},st:{k:status},sig:[{id,age,n}],pres}
const VIS_PROF={akad:['Akademia','Zarząd chce, żeby klub żył z własnych wychowanków.'],handel:['Handel zawodnikami','Kupić tanio, rozwinąć, sprzedać z zyskiem.'],gwiazdy:['Ambicje i gwiazdy','Wyniki tu i teraz, głośne nazwiska.'],lokal:['Lokalny patriotyzm','Swoi zawodnicy, pełna hala, bliskość kibiców.'],oszcz:['Rozsądne finanse','Najpierw stabilny budżet, potem ambicje.']};
const IMP_N=['Preferowany','Oczekiwany','Wymagany'];
const ST_N={2:['Zadowoleni','good'],1:['Zadowoleni','good'],0:['Bez komentarza',''],'-1':['Zaniepokojeni','warn'],'-2':['Niezadowoleni','bad']};
// cele: [nazwa, typ, ocena()->-2..2]
const VIS_G={
 bud:['Nie przekraczaj budżetu płacowego','Finanse',()=>{const b=BUD();if(!b)return 0;const r=wageBill()/Math.max(1,b.wg);return r<=0.95?1:r<=1.0?0:r<=1.15?-1:-2;}],
 rep:['Zwiększ reputację klubu','Reputacja',()=>{const V=VIS();const d=SAVE.ai[SAVE.team].rep-(V.rep0||0);return d>=2?1:d>-2?0:d>-5?-1:-2;}],
 wych:['Wprowadzaj wychowanków do pierwszego składu','Rozwój zawodników',()=>{const n=myTeam().players.filter(p=>p.acad&&!p.jr).length;return n>=3?1:n>=1?0:-1;}],
 akad:['Rozwijaj akademię','Rozwój zawodników',()=>{const L=myInfra().akad||1;return L>=3?1:L>=2?0:S().n-(VIS().n0||S().n)>=1?-1:0;}],
 mlodzi:['Stawiaj na młodych (do 23 lat) w wyjściowym składzie','Skład',()=>{const ids=Object.values(myLineup()||{});const n=myTeam().players.filter(p=>ids.includes(p.id)&&p.age<=23).length;return n>=3?1:n>=2?0:-1;}],
 zysk:['Zarabiaj na transferach','Transfery',()=>{const v=(SAVE.fin.sea||{}).Transfery||0;return v>200000?1:v>=-100000?0:v>=-500000?-1:-2;}],
 swoi:['Stawiaj na zawodników z kraju klubu','Skład',()=>{const c=tmCountry(SAVE.team);const ps=myTeam().players.filter(p=>!p.jr);const sh=ps.filter(p=>pNat(p)===c).length/Math.max(1,ps.length);return sh>=0.6?1:sh>=0.45?0:-1;}],
 gwiazda:['Miej w składzie gwiazdę ligi','Skład',()=>{const top=lgIds(myLg()).flatMap(i=>TEAMS[i].players).map(p=>rating(p)).sort((a,b)=>b-a);const bar=top[Math.min(9,top.length-1)]||80;const mx=Math.max(0,...myTeam().players.map(p=>rating(p)));return mx>=bar?1:mx>=bar-4?0:-1;}],
 saldo:['Utrzymuj dodatnie saldo','Finanse',()=>{const b=SAVE.fin.bal;return b>500000?1:b>=0?0:b>=-500000?-1:-2;}],
 hala:['Wypełniaj halę','Kibice',()=>{const f=VIS().fans;return f>=65?1:f>=45?0:f>=30?-1:-2;}]};
const VIS_PROF_G={akad:[['bud',2],['wych',1],['akad',1],['mlodzi',0]],handel:[['bud',2],['zysk',1],['mlodzi',1],['rep',0]],gwiazdy:[['bud',1],['rep',2],['gwiazda',1],['hala',0]],lokal:[['bud',2],['swoi',1],['hala',1],['wych',0]],oszcz:[['bud',2],['saldo',2],['zysk',0],['rep',0]]};
// zasady kontraktowe: [opis, test(p,lata)->ok]
const VIS_R={
 r32:['Maksymalnie roczne kontrakty dla zawodników 32+',(p,y)=>p.age<32||y<=1],
 r30:['Maksymalnie dwuletnie kontrakty dla zawodników 30+',(p,y)=>p.age<30||y<=2],
 r26:['Co najmniej 2-letnie kontrakty dla zawodników do 25 lat',(p,y)=>p.age>25||y>=2],
 rst:['Co najmniej 3-letnie kontrakty dla podstawowych zawodników do 27 lat',(p,y)=>p.age>27||!isStarter(p)||y>=3]};
const VIS_PROF_R={akad:[['r26',1],['r30',0]],handel:[['r26',2],['r32',1]],gwiazdy:[['rst',1]],lokal:[['r30',1]],oszcz:[['r32',2],['r30',1]]};
// tradycje zarządu (styl gry i polityka)
const VIS_T={
 zag:['Graj agresywną zagrywką',()=>(myTac().serve||0)>=2?1:(myTac().serve||0)===1?0:-1],
 bezp:['Graj bezpieczną zagrywką (mało błędów)',()=>(myTac().serve||0)===0?1:(myTac().serve||0)===1?0:-1],
 mlo:['Dawaj szansę młodym zawodnikom',()=>{const n=myTeam().players.filter(p=>p.age<=21&&(p.fmh||[]).length>=2).length;return n>=2?1:n===1?0:-1;}],
 st30:['Nie sprowadzaj zawodników po 30. roku życia',()=>{const s=(VIS().sig||[]).filter(x=>x.n===S().n);return !s.length?0:s.some(x=>x.age>30)?-1:1;}],
 jun:['Szkól juniorów (trener juniorów w sztabie)',()=>SAVE.staff&&SAVE.staff.jr?(SAVE.staff.jr.skill>=12?1:0):-1],
 swoi:['Buduj drużynę wokół swoich zawodników',()=>{const c=tmCountry(SAVE.team);const ids=Object.values(myLineup()||{});const n=myTeam().players.filter(p=>ids.includes(p.id)&&pNat(p)===c).length;return n>=4?1:n>=3?0:-1;}]};
const VIS_PROF_T={akad:['mlo','jun','st30'],handel:['mlo','st30'],gwiazdy:['zag'],lokal:['swoi','jun'],oszcz:['bezp','st30']};
function VIS(){if(SAVE.team==null)return {};if(!SAVE.vis||SAVE.vis.tm!==SAVE.team)visInit();return SAVE.vis;}
function visInit(prof){const ti=SAVE.team;const a=SAVE.ai[ti];let h=7;for(const c of TEAMS[ti].name)h=(h*131+c.charCodeAt(0))>>>0;const rnd=mulberry32(h+(prof?S().n*977:0));
  const pool=a.rep>=60?['gwiazdy','gwiazdy','handel','oszcz','lokal']:a.rep>=35?['handel','akad','lokal','oszcz','gwiazdy']:['akad','lokal','oszcz','handel'];
  const p=prof||pool[Math.floor(rnd()*pool.length)];const old=SAVE.vis&&SAVE.vis.tm===ti?SAVE.vis:null;
  SAVE.vis={tm:ti,prof:p,goals:VIS_PROF_G[p],rules:VIS_PROF_R[p],trad:VIS_PROF_T[p],rep0:a.rep,n0:old?old.n0:S().n,log:old?old.log:[],fans:old?old.fans:55,st:{},sig:old?old.sig:[],ev:old?old.ev:null,pres:old&&old.pres||natName(tmCountry(ti)).join(' ')};visPlan();return SAVE.vis;}
// plan pięcioletni: cel ligowy na bieżący i 4 kolejne sezony (rosnące ambicje zależne od profilu)
function visPlan(){const V=SAVE.vis;const s=S();const g0=s.goal||goalFor(SAVE.team);const amb=V.prof==='gwiazdy'?1:V.prof==='oszcz'?0.5:0.75;const L=myLg();const up=lgUp(L)!=null;
  const out=[{n:s.n,g:g0,txt:goalTxt(g0,L)}];let g=g0;for(let k=1;k<5;k++){const step=k*amb>=out.length-0.5?1:0;let nx=step?goalHigher(g):g;if(nx==null&&up&&k>=2){out.push({n:s.n+k,g:2,txt:'awans do wyższej ligi',up:1});continue;}if(nx!=null)g=nx;out.push({n:s.n+k,g,txt:goalTxt(g,L)});}
  if(!up&&g<=2&&[0,3,5,7].includes(L))out[4].txt+=' i gra w europejskich pucharach';V.plan=out;}
function visPos(){const s=S();try{if(s.final&&s.final.length)return s.final.indexOf(SAVE.team)+1;if(s.phase!=='liga'&&s.phase!=='po')return null;const t=leagueTable();return t.findIndex(x=>x.i===SAVE.team)+1;}catch(e){return null;}}
function visPlanSt(){const s=S();const pos=visPos();if(pos==null||(s.phase==='liga'&&s.round<4))return 0;const g=s.goal||goalFor(SAVE.team);return pos<=g?1:pos<=g+2?0:pos<=g+4?-1:-2;}
function visEval(){const V=VIS();const st={};for(const [k] of V.goals)try{st[k]=VIS_G[k][2]();}catch(e){st[k]=0;}for(const k of V.trad)try{st['t_'+k]=VIS_T[k][1]();}catch(e){st['t_'+k]=0;}st.plan=visPlanSt();return st;}
function visLog(t,ok){const V=VIS();V.log.unshift({d:today(),t,ok});V.log=V.log.slice(0,14);}
// miesięczna ocena: zmiany statusów trafiają do „sukcesów i porażek”, statusy wpływają na zaufanie zarządu
function visMonthly(){try{if(SAVE.vis&&SAVE.vis.tm===SAVE.team){const V=SAVE.vis;V.fans=Math.round((V.fans==null?55:V.fans)+(55-(V.fans==null?55:V.fans))*0.2);}}catch(e){}if(window.VIS_OFF||SAVE.team==null||!SAVE.board||!S())return;const V=VIS();const st=visEval();let dc=0;
  for(const [k,imp] of V.goals){const s=st[k];const w=imp+1;dc+=s<0?s*w*0.45:s>0?0.25*w:0;const prev=V.st[k];if(prev!=null&&prev!==s&&(s<0||prev<0)){const nm=VIS_G[k][0];visLog(s<0?`${s<=-2?'Niezadowoleni':'Zaniepokojeni'}: ${nm.toLowerCase()}.`:`Zadowoleni z poprawy: ${nm.toLowerCase()}.`,s>=0);}}
  for(const k of V.trad){const s=st['t_'+k];dc+=s<0?-0.3:s>0?0.15:0;}
  if(!SAVE.ownClub)bAdd(Math.round(clamp(dc,-4,3)*10)/10);V.st=st;
  if(V.ev&&V.ev.until<today())V.ev=null;}
// zasady kontraktowe: sprawdzane przy podpisywaniu i przedłużaniu
function visCheckContract(p){if(SAVE.team==null||!p||p.tm!==SAVE.team||p.ce==null)return;const V=VIS();const s=S();const y=p.ce-(s.phase==='off'?s.n-1:s.n);
  for(const [k,imp] of V.rules){const R0=VIS_R[k];if(!R0[1](p,y)){if(!SAVE.ownClub)bAdd(-(imp+1)*1.5);visLog(`Niezadowoleni z kontraktu ${p.first} ${p.last} (${y} ${y===1?'rok':'lata'}, ${p.age} l.): łamie zasadę „${R0[0].toLowerCase()}”.`,false);}}}
{const _ns=negSign;negSign=function(){const n=ui.neg;const pid=n&&n.pid;const ce0=pid&&PLAYERS[pid]?PLAYERS[pid].p.ce:null;const tm0=pid&&PLAYERS[pid]?PLAYERS[pid].p.tm:null;const r=_ns.apply(this,arguments);
  try{if(pid&&PLAYERS[pid]){const p=PLAYERS[pid].p;if(p.ce!==ce0||p.tm!==tm0){if(tm0!==SAVE.team&&p.tm===SAVE.team){const V=VIS();V.sig.push({id:p.id,age:p.age,n:S().n});V.sig=V.sig.slice(-30);visFans(rating(p)>=avgTop()+3?4:1);}visCheckContract(p);}}}catch(e){console.error(e);}return r;};}
function avgTop(){const r=myTeam().players.map(p=>rating(p)).sort((a,b)=>b-a).slice(0,6);return r.reduce((a,b)=>a+b,0)/Math.max(1,r.length);}
// ---- kibice ----
function visFans(d){const V=VIS();V.fans=Math.round(clamp((V.fans==null?55:V.fans)+d,0,100));}
{const _fm=finishMatch;finishMatch=function(m0){const m=m0||ui.match;const r=_fm.apply(this,arguments);try{if(m&&m.ctx&&m.over){const me=m.sides.findIndex(x=>x.team&&x.team.idx===SAVE.team);if(me>=0){const w0=m.sets.filter(x=>x[0]>x[1]).length,w1=m.sets.length-w0;const mw=me===0?w0:w1,ow=me===0?w1:w0;
  visFans(mw>ow?(ow===0?2.5:1.5):(mw===0?-2:-1));}}}catch(e){}return r;};}
function favPlayer(){const ps=myTeam().players.filter(p=>!p.jr);return ps.map(p=>({p,v:((p.fmh||[]).reduce((a,b)=>a+b,0)/Math.max(1,(p.fmh||[]).length))+(p.acad?1:0)+Math.min(2,(S().n-(p.jn||S().n))*0.5)+rating(p)/40})).sort((a,b)=>b.v-a.v)[0];}
// ---- zdarzenia: zmiana prezesa (rzadko, na starcie sezonu) ----
function visSeason(){if(SAVE.team==null)return;const V=VIS();V.rep0=SAVE.ai[SAVE.team].rep;visLog(`Nowy sezon ${sLabel(S().n)} — zarząd przedstawił cele.`,true);
  if(!SAVE.ownClub&&R()<0.06){const ps=Object.keys(VIS_PROF).filter(k=>k!==V.prof);const np=ps[Math.floor(R()*ps.length)];const old=V.prof;visInit(np);const V2=SAVE.vis;V2.pres=natName(tmCountry(SAVE.team)).join(' ');
    V2.ev={t:'ZMIANA PREZESA KLUBU',x:`Nowym prezesem został ${V2.pres}. Zmienił kierunek klubu z „${VIS_PROF[old][0]}” na „${VIS_PROF[np][0]}” — sprawdź nowe cele i zasady.`,until:addDays(today(),90)};
    news(`🏛️ Zmiana prezesa: ${V2.pres}. Nowa strategia klubu: ${VIS_PROF[np][0]}.`);}else visPlan();}
{const _mn=monthly;monthly=function(d){const r=_mn.apply(this,arguments);try{visMonthly();}catch(e){console.error(e);}return r;};}
{const _bg=bmSeasonGoal;bmSeasonGoal=function(){const r=_bg.apply(this,arguments);try{visSeason();}catch(e){console.error(e);}return r;};}
// ---- widok ----
function stPill(s){const x=ST_N[s>1?1:s<-2?-2:s]||ST_N[0];return `<span class="vpill ${x[1]}">${s>0?'👍 ':s<0?'⚠ ':''}${x[0]}</span>`;}
function jobSt(){if(SAVE.ownClub)return ['Właściciel klubu','good'];const c=bConf();const u=SAVE.bm&&SAVE.bm.ult;return u||c<30?['Zagrożona','bad']:c<50?['Niepewna','warn']:c<75?['Stabilna','']:['Bardzo stabilna','good'];}
function visView(){const V=VIS();const st=visEval();const tab=ui.visTab||'zarzad';const c=bConf();const op=c>=80?5:c>=65?4:c>=45?3:c>=30?2:1;
  const opTxt=['','zarząd rozważa zmianę trenera','zarząd jest rozczarowany Twoją pracą','zarząd ocenia Twoją pracę jako przeciętną','zarząd jest zadowolony z kierunku, w którym prowadzisz zespół','zarząd jest zachwycony Twoją pracą'][op];
  const js=jobSt();const s=S();
  const row=(nm,imp,typ,sv)=>`<tr><td class="l">${esc(nm)}</td><td class="l small">${IMP_N[imp]}</td><td class="l small mut">${typ}</td><td class="l">${stPill(sv)}</td></tr>`;
  const left=`<div class="card">${V.ev?`<div style="background:#7e22ce;color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:12px"><b>${esc(V.ev.t)}</b><div class="small">${esc(V.ev.x)}</div></div>`:''}
   <h2>Strategia zarządu</h2><p class="small mut">Kierunek klubu: <b>${VIS_PROF[V.prof][0]}</b> — ${VIS_PROF[V.prof][1]}${SAVE.ownClub?' Jesteś właścicielem: cele są Twoim planem i nie wpływają na posadę.':''}</p>
   <h3>Cele do realizacji</h3><div class="tw"><table><thead><tr><th class="l">Cel</th><th class="l">Znaczenie</th><th class="l">Typ</th><th class="l">Status</th></tr></thead><tbody>${V.goals.map(([k,imp])=>row(VIS_G[k][0],imp,VIS_G[k][1],st[k])).join('')}</tbody></table></div>
   <h3>Zasady kontraktowe</h3><div class="tw"><table><thead><tr><th class="l">Zasada</th><th class="l">Znaczenie</th><th class="l">Typ</th><th class="l">Status</th></tr></thead><tbody>${V.rules.map(([k,imp])=>{const bad=V.log.some(x=>!x.ok&&x.t.includes(VIS_R[k][0].toLowerCase()));return `<tr><td class="l">${esc(VIS_R[k][0])}</td><td class="l small">${IMP_N[imp]}</td><td class="l small mut">Transfery</td><td class="l">${bad?stPill(-1):'<span class="vpill">Bez oceny</span>'}</td></tr>`;}).join('')}</tbody></table></div>
   <h3>Plan pięcioletni</h3><div class="tw"><table><thead><tr><th class="l">Sezon</th><th class="l">Cel w lidze</th><th class="l">Status</th></tr></thead><tbody>${V.plan.map((p,i)=>`<tr><td class="l">${i===0?'<b>Bieżący sezon</b>':sLabel(p.n)}</td><td class="l">${esc(p.txt)}</td><td class="l">${i===0?stPill(st.plan):'<span class="vpill">Bez oceny</span>'}</td></tr>`).join('')}</tbody></table></div>
   <p class="small mut">Statusy celów co miesiąc wpływają na zaufanie zarządu — najmocniej cele „Wymagane”. Złamanie zasady kontraktowej przy podpisie od razu obniża zaufanie.</p></div>`;
  const fv=favPlayer();const fans=V.fans==null?55:V.fans;
  const right=`<div class="card"><div class="seg"><button class="${tab==='zarzad'?'on':''}" onclick="ui.visTab='zarzad';render()">🏛️ Zarząd</button><button class="${tab==='kibice'?'on':''}" onclick="ui.visTab='kibice';render()">📣 Kibice</button></div>
   ${tab==='zarzad'?`<h3>Opinia zarządu</h3><p class="small mut">Przygotował ${esc(V.pres||'prezes klubu')} (prezes)</p><div style="background:#eab308;color:#111;border-radius:8px;padding:10px 14px;margin:6px 0"><b style="display:inline-block;border:2px solid #111;border-radius:50%;width:24px;text-align:center;margin-right:8px">${op}</b><b>Krótko mówiąc, ${opTxt}.</b></div>
     <h3>Tradycje zarządu</h3><div class="tw"><table><tbody>${V.trad.map(k=>`<tr><td class="l">${esc(VIS_T[k][0])}</td><td class="l small">Oczekiwany</td><td class="l">${stPill(st['t_'+k])}</td></tr>`).join('')}</tbody></table></div>
     <h3>Sukcesy</h3>${V.log.filter(x=>x.ok).slice(0,5).map(x=>`<div class="res small">👍 <span class="mut">${fmtShort(x.d)}</span> ${esc(x.t)}</div>`).join('')||'<p class="mut small">Jeszcze brak.</p>'}
     <h3>Porażki</h3>${V.log.filter(x=>!x.ok).slice(0,5).map(x=>`<div class="res small">👎 <span class="mut">${fmtShort(x.d)}</span> ${esc(x.t)}</div>`).join('')||'<p class="mut small">Brak.</p>'}
     <button class="ghost" style="margin-top:8px" onclick="ui.ixTab='zarzad';go('rozmowy')">💬 Prośba do zarządu</button>`
   :`<h3>Nastrój kibiców</h3><div class="trld" style="width:100%;height:10px"><i style="width:${fans}%;background:${fans>=65?'#22c55e':fans>=40?'#eab308':'#ef4444'}"></i></div><p><b>${fans>=75?'Kibice są zachwyceni':fans>=60?'Kibice są zadowoleni':fans>=40?'Kibice są spokojni':fans>=25?'Kibice są rozczarowani':'Kibice są wściekli'}</b> (${fans}/100)</p>
     <h3>Oczekiwania kibiców</h3><div class="res small">• ${esc(V.plan[0].txt)} w lidze</div><div class="res small">• ${V.prof==='lokal'||V.prof==='akad'?'Gra wychowanków i zawodników z regionu':V.prof==='gwiazdy'?'Głośne transfery i gwiazdy w składzie':'Ambitna gra do ostatniej piłki'}</div>
     ${fv?`<h3>Ulubieniec kibiców</h3><div class="res row"><button class="link pn" onclick="openCard('${fv.p.id}')">${esc(fv.p.first)} ${esc(fv.p.last)}</button><small class="mut" style="margin-left:6px">${POS_NAMES[fv.p.pos]}${fv.p.acad?' · wychowanek':''}</small></div><p class="small mut">Sprzedaż ulubieńca rozzłości kibiców.</p>`:''}
     <p class="small mut">Nastrój rośnie po wygranych (zwłaszcza 3:0) i ciekawych transferach, spada po porażkach. Wpływa na cel „Wypełniaj halę”.</p>`}</div>`;
  return `<div class="card"><div class="row wrap" style="align-items:center;gap:10px"><h2 style="margin:0">Strategia klubu</h2><span class="small mut">Stabilność posady: <b class="${js[1]}">${js[0]}</b></span></div></div>
   <div style="display:grid;grid-template-columns:minmax(0,1.6fr) minmax(300px,1fr);gap:12px;align-items:start" class="visgrid">${left}${right}</div>`;}

{const _mp=movePlayer;movePlayer=function(p,tm){try{if(SAVE.vis&&SAVE.team!=null&&p&&p.tm===SAVE.team&&tm!==SAVE.team&&tm>=0){const f=favPlayer();if(f&&f.p.id===p.id){visFans(-8);visLog(`Kibice wściekli po odejściu ulubieńca: ${p.first} ${p.last}.`,false);}}}catch(e){}return _mp.apply(this,arguments);};}
