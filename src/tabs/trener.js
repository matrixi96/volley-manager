// ================= TRENER (gracz) =================
const C_ATTR=[
  ['tak','Taktyka','skill','Przygotowanie meczowe: mały bonus do gry w każdym meczu.'],
  ['tre','Trening','skill','Szybszy rozwój wszystkich zawodników.'],
  ['mlo','Praca z młodzieżą','skill','Szybszy rozwój juniorów i lepsze roczniki z naboru.'],
  ['neg','Negocjacje','skill','Niższe żądania płacowe zawodników, lepsze ceny transferów.'],
  ['mot','Motywacja','ment','Drużyna mocniej „nakręca się” po serii wygranych punktów.'],
  ['opa','Opanowanie','ment','Drużyna gra pewniej w końcówkach setów i w tie-breaku.'],
  ['det','Determinacja','ment','Drużyna lepiej odrabia straty, gdy przegrywa.'],
  ['aut','Autorytet','ment','Szybszy rozwój mentalny zawodników, większa cierpliwość zarządu i szybszy wzrost reputacji.']
];
const C_EXP=[
  ['deb','Debiutant','Pierwsza praca trenerska. Najmniej punktów i niska reputacja: zaczniesz od słabszych klubów.',10,24,{}],
  ['zaw','Były zawodnik ligowy','Grałeś zawodowo w siatkówkę i znasz szatnię od środka.',25,32,{mot:2,aut:1}],
  ['mlo','Trener młodzieżowy','Lata pracy z juniorami w akademii.',25,32,{mlo:3,tre:1}],
  ['rep','Były reprezentant Polski','Medale z kadrą i rozpoznawalne nazwisko.',45,34,{aut:3,mot:1}],
  ['dos','Doświadczony trener','Kilka sezonów jako pierwszy trener w lidze.',55,38,{tak:2,opa:1}]
];
const C_BASE=6,C_MAX=18;
function coach(){return SAVE.coach;}
function cA(k){const v=SAVE.coach&&SAVE.coach.attrs?SAVE.coach.attrs[k]:null;return v!=null?v:10;}
function clubReq(t){return initRepStatic(t);}
function initRepStatic(t){return initRep(t);}
function canTake(ti,rep){return rep>=clubReq(TEAMS[ti])-25;}
// ---- kreator ----
function ccDraft(){if(!ui.cc){ui.cc={first:'',last:'',age:38,exp:'zaw',attrs:Object.fromEntries(C_ATTR.map(a=>[a[0],C_BASE])),face:'c'+Math.floor(R()*1e9),step:1};}return ui.cc;}
function ccPool(){const d=ccDraft();const e=C_EXP.find(x=>x[0]===d.exp);const used=C_ATTR.reduce((s,a)=>s+d.attrs[a[0]]-C_BASE,0);return e[4]-used;}
function ccAdj(k,dv){const d=ccDraft();const v=d.attrs[k]+dv;if(v<1||v>C_MAX)return;if(dv>0&&ccPool()<=0)return;d.attrs[k]=v;render();}
function ccExp(k){const d=ccDraft();d.exp=k;while(ccPool()<0){const top=C_ATTR.map(a=>a[0]).sort((a,b)=>d.attrs[b]-d.attrs[a])[0];d.attrs[top]--;}render();}
function ccRandom(){const d=ccDraft();for(const [k] of C_ATTR)d.attrs[k]=C_BASE;let p=ccPool();while(p>0){const k=C_ATTR[Math.floor(R()*C_ATTR.length)][0];if(d.attrs[k]<C_MAX){d.attrs[k]++;p--;}}render();}
function ccNext(){const d=ccDraft();d.first=($('#ccf')||{}).value||d.first;d.last=($('#ccl')||{}).value||d.last;d.age=+(($('#cca')||{}).value||d.age);
  if(!d.first.trim()||!d.last.trim()){ui.ccErr='Wpisz imię i nazwisko trenera.';render();return;}
  if(!(d.age>=28&&d.age<=70)){ui.ccErr='Wiek trenera: od 28 do 70 lat.';render();return;}
  ui.ccErr=null;
  const e=C_EXP.find(x=>x[0]===d.exp);const attrs={};for(const [k] of C_ATTR)attrs[k]=Math.min(20,d.attrs[k]+(e[5][k]||0));
  const c={first:d.first.trim(),last:d.last.trim(),exp:d.exp,rep:e[3],attrs,face:d.face,hist:[],trophies:[],seasons:0};
  const ref=SAVE.date||GAME_START;const y=+ref.slice(0,4)-d.age;c.dob=`${y-(R()<0.5?1:0)}-${String(1+Math.floor(R()*12)).padStart(2,'0')}-${String(1+Math.floor(R()*28)).padStart(2,'0')}`;
  if(SAVE.team!=null){SAVE.coach=c;c.joined=today();initBoard(true);ui.cc=null;save();render();return;}
  ui.pendingCoach=c;d.step=2;render();}
function coachAge(c){return ageAt(c.dob,SAVE.date||GAME_START);}
function coachFace(c,size){return faceSvg(c.face,{size:size||48,age:coachAge(c),color:SAVE.team!=null?TEAMS[SAVE.team].color:'#ffb020',kind:'coach'});}
function coachCreateView(){
  const d=ccDraft();const pool=ccPool();
  if(d.step===3&&ui.pendingCoach)return ownClubView();
  if(d.step===2&&ui.pendingCoach)return clubPickView();
  const migr=SAVE.team!=null;
  return `<div class="card"><h2>${migr?'Stwórz swojego trenera':'Nowa gra: stwórz trenera'}</h2><p class="mut">${migr?'Twój zapis nie ma jeszcze trenera. Stwórz go, a gra potoczy się dalej od miejsca, w którym skończyłeś.':'To Ty prowadzisz drużynę. Od doświadczenia zależą punkty do rozdania i reputacja, a od reputacji to, które kluby będą chciały Cię zatrudnić.'}</p>
  ${ui.ccErr?`<div class="tmsg no">${esc(ui.ccErr)}</div>`:''}
  <div class="cc"><div class="ccface">${faceSvg(d.face,{size:140,age:d.age,color:'#ffb020',kind:'coach'})}<button class="ghost" onclick="ui.cc.face='c'+Math.floor(Math.random()*1e9);render()">🎲 Losuj twarz</button></div>
  <div class="ccform"><div class="row wrap"><label class="lu"><span>Imię</span><input id="ccf" value="${esc(d.first)}" oninput="ui.cc.first=this.value" maxlength="20"></label><label class="lu"><span>Nazwisko</span><input id="ccl" value="${esc(d.last)}" oninput="ui.cc.last=this.value" maxlength="24"></label><label class="lu"><span>Wiek</span><input id="cca" type="number" min="28" max="70" value="${d.age}" oninput="ui.cc.age=+this.value" style="width:80px"></label></div>
  <h3>Doświadczenie</h3><div class="opts">${C_EXP.map(([k,n,ds,rep,pts,bon])=>`<button class="opt ${d.exp===k?'on':''}" onclick="ccExp('${k}')"><b>${n}</b><small>${ds}</small><small class="mut">Reputacja ${rep} · ${pts} pkt${Object.keys(bon).length?' · bonus: '+Object.entries(bon).map(([a,v])=>C_ATTR.find(x=>x[0]===a)[1]+' +'+v).join(', '):''}</small></button>`).join('')}</div></div></div>
  <div class="row wrap" style="margin-top:14px"><h3 style="margin:0">Atrybuty trenera</h3><span class="sp"></span><span>Do rozdania: <b class="${pool>0?'good':''}">${pool}</b> pkt</span><button class="ghost" onclick="ccRandom()">🎲 Rozdaj losowo</button></div>
  <div class="ccattrs">${[['skill','Umiejętności'],['ment','Cechy mentalne']].map(([g,gn])=>`<div><h4>${gn}</h4>${C_ATTR.filter(a=>a[2]===g).map(([k,n,,ds])=>{const e=C_EXP.find(x=>x[0]===d.exp);const b=e[5][k]||0;return `<div class="ccrow"><div><b>${n}</b><br><small class="mut">${ds}</small></div><div class="ccv"><button class="ghost" onclick="ccAdj('${k}',-1)">−</button><span class="attr ${aCls(d.attrs[k]+b)}">${d.attrs[k]+b}</span><button class="ghost" onclick="ccAdj('${k}',1)">+</button></div></div>`;}).join('')}</div>`).join('')}</div>
  <div class="row" style="margin-top:14px"><span class="sp"></span><button class="btn" onclick="ccNext()">${migr?'Zapisz trenera':'Dalej: wybór klubu →'}</button></div></div>`;
}
function clubPickView(){const c=ui.pendingCoach;
  return `<div class="card"><div class="row wrap">${coachFace(c,64)}<div><h2 style="margin:0">${esc(c.first)} ${esc(c.last)}</h2><div class="mut small">${C_EXP.find(x=>x[0]===c.exp)[1]} · reputacja <b>${c.rep}</b></div></div><span class="sp"></span><button class="ghost" onclick="ui.cc.step=1;ui.pendingCoach=null;render()">← Wróć do trenera</button></div>
  <h2 style="margin-top:14px">Wybierz klub</h2><p class="mut">Cztery kraje: Polska (Ekstraliga, 1. i 2. Liga), Niemcy, Włochy i Turcja (po dwie ligi). Nazwy klubów są fikcyjne. Co sezon w każdym kraju dwie drużyny awansują i dwie spadają. Kluby z kłódką nie zatrudnią trenera z tak niską reputacją: na lepszą pracę trzeba zasłużyć wynikami. Cel zarządu zależy od siły składu.</p>
  <div class="row wrap" style="gap:6px">${CTRY.map(k=>`<button class="tabb ${(ui.ccC||'PL')===k?'on':''}" onclick="ui.ccC='${k}';render()">${COUNTRIES[k].fl} ${COUNTRIES[k].n}</button>`).join('')}</div>
  ${COUNTRIES[ui.ccC||'PL'].lgs.map(l=>`<h3 style="margin-top:16px">${lgFull(l)} <small class="mut">· ${lgIds(l).length} drużyn · średnia siła ${Math.round(lgAvg(l))} · ${forRuleTxt(l)}</small></h3><div class="grid">${l===2?foundCard():''}${lgTeams(l).filter(t=>!isYT(t.idx)).sort((a,b)=>teamStrength(b)-teamStrength(a)).map(t=>{const ok=canTake(t.idx,c.rep);const g=goalFor(t.idx);return `<button class="teamcard ${ok?'':'locked'}" style="--c:${t.color}" ${ok?`onclick="pickTeam(${t.idx})"`:'disabled'}><span class="row" style="gap:8px;align-items:center">${teamCrest(t.idx,34)}<b>${ok?'':'🔒 '}${esc(t.name)}</b></span><span class="stars">${stars(teamStrength(t))}</span><small class="mut">Siła: ${teamStrength(t)} · cel: ${goalTxt(g,l)}</small>${ok?'':`<small class="bad">Wymagana reputacja: ${clubReq(t)-25}</small>`}</button>`;}).join('')}</div>`).join('')}</div>`;}
// ---- zarząd ----
const GOAL_TXT={2:'finał (top 2)',4:'półfinał (top 4)',8:'play-off (top 8)',10:'miejsce w pierwszej dziesiątce',12:'budowa zespołu (bez presji wyniku)'};
function goalTxt(g,l){const n=lgIds(l).length;if(lgUp(l)!=null&&g===2)return 'awans (finał play-off)';if(g>8&&g>=n)return GOAL_TXT[12];if(g>8)return lgDown(l)!=null?`utrzymanie (miejsce 1–${g})`:`miejsce w pierwszej ${g===10?'dziesiątce':g}`;return GOAL_TXT[g];}
function goalFor(ti){const rk=lgIds(lgOf(ti)).map(i=>({i,s:teamStrength(TEAMS[i])})).sort((a,b)=>b.s-a.s).findIndex(x=>x.i===ti)+1;const n=lgIds(lgOf(ti)).length;return rk<=2?2:rk<=4?4:rk<=8?8:rk<=n-2?n-2:n;}
function initBoard(fresh){SAVE.board=SAVE.board||{conf:60};if(fresh)SAVE.board.conf=60;const s=S();if(s&&s.goal==null)s.goal=goalFor(SAVE.team);}
function boardAfterMatch(res){const b=SAVE.board;if(!b||!coach())return;
  const me=res.h===SAVE.team,my=me?res.sw[0]:res.sw[1],op=me?res.sw[1]:res.sw[0],oi=me?res.a:res.h;
  const p=1/(1+Math.exp(-(teamStrength(myTeam())-teamStrength(TEAMS[oi]))/4));
  const won=my>op?1:0;let d=(won-p)*5;if(won&&op===0)d+=0.5;if(!won&&my===0)d-=0.5;
  if(d>0)d*=0.9+cA('aut')/100;else d*=1.1-cA('aut')/100;
  b.conf=clamp(b.conf+d,0,100);
  const s=S();if(b.conf<8&&s.phase==='liga'&&s.round>=8&&!SAVE.fired&&!SAVE.ownClub&&!(SAVE.bm&&(SAVE.bm.ult||SAVE.bm.q.some(q=>q.k==='ult')||SAVE.bm.ultN!==s.n)))fireCoach('Zarząd stracił zaufanie po serii słabych wyników w trakcie sezonu.');}
function seasonEvaluation(){const s=S(),c=coach();if(!c||!s.final)return;const place=s.final.indexOf(SAVE.team)+1;const g=s.goal||goalFor(SAVE.team);const b=SAVE.board;
  const met=place<=g;const diff=g-place;
  const nT=lgIds(myLg()).length;const rel=!met&&lgDown(myLg())!=null&&place>=nT-1&&g<nT-1;b.conf=clamp(b.conf+(met?15+Math.min(15,diff*4):-Math.min(28,4+5*(-diff))-(rel?15:0)),0,100);
  let dr=diff*1.5+(place===1?8:place<=3?3:0)+(met?3:-3);if(dr>0)dr*=0.85+cA('aut')/66;c.rep=Math.round(clamp(c.rep+dr,0,100));
  c.seasons++;c.hist.push({n:s.n,team:SAVE.team,place,goal:g,met,league:s.seed.indexOf(SAVE.team)+1});
  if(place===1)c.trophies.push(`🏆 ${LG_LV[myLg()]===0?'Mistrzostwo '+COUNTRIES[tmCountry(SAVE.team)].gen:'Mistrzostwo: '+LG_N[myLg()]} ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  if(place===2)c.trophies.push(`🥈 Wicemistrzostwo ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  if(place===3)c.trophies.push(`🥉 Brąz ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  if(s.jchamp===SAVE.team)c.trophies.push(`🏆 Mistrzostwo juniorów ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  s.eval={place,goal:g,met,dr:Math.round(dr)};try{if(typeof mdSeasonEnd==='function')mdSeasonEnd(place);}catch(e){console.error(e);}
  news(met?`👔 Zarząd zadowolony: cel „${goalTxt(g,lgOf(SAVE.team))}” wykonany (${place}. miejsce). Reputacja trenera: ${c.rep}.`:`👔 Zarząd rozczarowany: cel „${goalTxt(g,lgOf(SAVE.team))}” niewykonany (${place}. miejsce). Zaufanie: ${Math.round(b.conf)}%.`);
  if(b.conf<20&&!SAVE.ownClub)fireCoach('Zarząd nie przedłużył współpracy po nieudanym sezonie.');
  else if(met)SAVE.offers=makeOffers(false);}
function makeOffers(fired){const c=coach();const cur=initRepStatic(myTeam());
  let pool=TEAMS.filter(t=>t.idx!==SAVE.team&&!isYT(t.idx)&&canTake(t.idx,c.rep));
  pool=fired?pool.sort((a,b)=>teamStrength(a)-teamStrength(b)).slice(0,4):pool.filter(t=>initRepStatic(t)>cur).sort(()=>R()-0.5);
  if(fired&&pool.length<2)pool=TEAMS.filter(t=>t.idx!==SAVE.team).sort((a,b)=>teamStrength(a)-teamStrength(b)).slice(0,3);
  // w trakcie sezonu można przejść tylko do klubu z tej samej ligi (terminarz ligi jest wspólny); inne kluby zgłoszą się po sezonie
  const mid=S()&&['spar','liga','po'].includes(S().phase);if(mid){const L=myLg();let same=TEAMS.filter(t=>t&&t.idx!==SAVE.team&&!isYT(t.idx)&&lgOf(t.idx)===L&&canTake(t.idx,c.rep));if(same.length<2)same=TEAMS.filter(t=>t&&t.idx!==SAVE.team&&!isYT(t.idx)&&lgOf(t.idx)===L).sort((a,b)=>teamStrength(a)-teamStrength(b)).slice(0,3);pool=fired?same.sort((a,b)=>teamStrength(a)-teamStrength(b)).slice(0,4):same.filter(t=>initRepStatic(t)>cur);}
  const n=fired?2+(R()<0.5?1:0):(R()<0.6?1:0)+(R()<0.3?1:0);
  let out=pool.sort(()=>R()-0.5).slice(0,n);
  // po zwolnieniu zawsze jest co najmniej jedna „uczciwa” oferta: klub na miarę reputacji trenera (nie tylko najsłabsze kluby)
  if(fired){let fair=TEAMS.filter(t=>t&&t.idx!==SAVE.team&&!isYT(t.idx)&&canTake(t.idx,c.rep)&&(!mid||lgOf(t.idx)===myLg()));
    if(fair.length){fair.sort((a,b)=>Math.abs(initRepStatic(a)-(c.rep-8))-Math.abs(initRepStatic(b)-(c.rep-8)));const f=fair.slice(0,3)[Math.floor(R()*Math.min(3,fair.length))];
      if(!out.includes(f))out=[f].concat(out.slice(0,Math.max(1,n-1)));}}
  return out.map(t=>({tm:t.idx,goal:goalFor(t.idx)}));}
function fireCoach(why){SAVE.fired={why,d:today()};SAVE.offers=makeOffers(true);news(`❌ Zostałeś zwolniony z ${myTeam().name}. ${why}`);
  coach().hist.push({n:S().n,team:SAVE.team,fired:true,d:today()});coach().rep=Math.max(0,coach().rep-5);}
function acceptJob(ti){const old=SAVE.team;const c=coach();
  for(const b of BLD())infraOf(old)[b.k]=b.to;SAVE.builds=[];
  SAVE.team=ti;SAVE.lineup=autoLineup(TEAMS[ti]);SAVE.tactics={serve:1,dist:0};achEv('jobs');
  const rep=SAVE.ai[ti].rep;SAVE.fin={bal:round5k(1000000+rep*15000),log:[],sea:{},prev:null};
  SAVE.staff=null;SAVE.staffPool=null;SAVE.inbox=[];initClub();
  SAVE.board={conf:60};SAVE.ownClub=false;const s=S();s.goal=goalFor(ti);c.joined=today();
  news(`✍️ ${c.first} ${c.last} nowym trenerem ${TEAMS[ti].name}! Cel zarządu: ${goalTxt(s.goal,lgOf(ti))}.`);
  SAVE.fired=null;SAVE.offers=null;ui.match=null;ui.tab='mecz';save();render();}
function declineOffers(){SAVE.offers=null;save();render();}
function coachOffseason(){const c=coach();if(!c)return;if(coachAge(c)<60){for(let i=0;i<2;i++){const k=C_ATTR[Math.floor(R()*C_ATTR.length)][0];if(c.attrs[k]<20&&R()<0.6)c.attrs[k]++;}}
  const s=S();s.goal=goalFor(SAVE.team);news(`👔 Cel zarządu na sezon ${sLabel(s.n)}: ${goalTxt(s.goal,lgOf(SAVE.team))}.`);SAVE.offers=null;try{if(typeof bmSeasonGoal==='function')bmSeasonGoal();}catch(e){console.error(e);}}
// ---- widoki ----
function boardCard(){const s=S(),b=SAVE.board;if(!b||!coach())return '';const g=s.goal||goalFor(SAVE.team);const cf=Math.round(b.conf);
  return `<div class="card board"><div class="row wrap"><span class="mut small">Zarząd ${esc(myTeam().name)}</span><span class="sp"></span><span class="small">Cel sezonu: <b>${goalTxt(g,lgOf(SAVE.team))}</b></span></div>
  ${SAVE.ownClub?'<div class="small mut">Jesteś założycielem klubu: zarząd Cię nie zwolni, ale wyniki wpływają na Twoją reputację.</div>':''}<div class="row"><span class="small">Zaufanie zarządu</span><div class="conf"><i style="width:${cf}%;background:${cf>=60?'var(--good)':cf>=30?'#eab308':'var(--bad)'}"></i></div><b>${cf}%</b></div></div>`;}
function firedView(){const f=SAVE.fired;return `<div class="card post lost"><h2>❌ Zostałeś zwolniony</h2><p>${esc(f.why)}</p><p class="mut small">Twoja reputacja: ${coach().rep}. Oto kluby, które chcą Cię zatrudnić:</p>${offersList(true)}</div>`;}
function offersList(must){const o=SAVE.offers||[];if(!o.length)return '<p class="mut">Brak ofert.</p>';
  return o.map(x=>`<div class="row wrap offer">${tDot(x.tm)}<b>${tName(x.tm)}</b><small class="mut">siła ${teamStrength(TEAMS[x.tm])} · cel: ${goalTxt(x.goal,lgOf(x.tm))} · ${LG_N[lgOf(x.tm)]}</small><span class="sp"></span><button class="btn" onclick="acceptJob(${x.tm})">Przyjmij</button></div>`).join('')+(must?'':`<button class="link" onclick="declineOffers()">Zostaję w obecnym klubie</button>`);}
function coachView(){const c=coach();if(!c)return '';const ev=S().eval;
  return `<div class="card"><div class="row wrap coachhead">${coachFace(c,110)}<div><h2 style="margin:0">${esc(c.first)} ${esc(c.last)}</h2><div class="mut">Pierwszy trener · ${esc(myTeam().name)} · ${coachAge(c)} l. (ur. ${fmtDMY(c.dob)})</div><div class="small mut">${C_EXP.find(x=>x[0]===c.exp)[1]} · sezonów w karierze: ${c.seasons}</div></div><span class="sp"></span>
  <div class="repbox"><span class="mut small">Reputacja</span><b>${c.rep}</b><div class="conf"><i style="width:${c.rep}%;background:var(--acc)"></i></div></div></div></div>
  ${boardCard()}
  <div class="card"><h2>Atrybuty trenera</h2><div class="ccattrs">${[['skill','Umiejętności'],['ment','Cechy mentalne']].map(([g,gn])=>`<div><h4>${gn}</h4>${C_ATTR.filter(a=>a[2]===g).map(([k,n,,ds])=>`<div class="ccrow"><div><b>${n}</b><br><small class="mut">${ds}</small></div><span class="attr ${aCls(c.attrs[k])}">${c.attrs[k]}</span></div>`).join('')}</div>`).join('')}</div>
  <p class="mut small">Atrybuty trenera rosną powoli z każdym sezonem (do 60. roku życia).</p></div>
  <div class="card"><h2>Kariera</h2>${c.hist.length?`<div class="tw"><table><thead><tr><th class="l">Sezon</th><th class="l">Klub</th><th>Po fazie zas.</th><th>Miejsce</th><th class="l">Cel</th></tr></thead><tbody>${c.hist.map(h=>`<tr><td class="l">${sLabel(h.n)}</td><td class="l">${tDot(h.team)}${tName(h.team)}</td><td>${h.fired?'—':h.league+'.'}</td><td>${h.fired?'<span class="bad">zwolniony</span>':'<b>'+h.place+'.</b>'}</td><td class="l">${h.fired?'':(h.met?'<span class="good">✓ </span>':'<span class="bad">✗ </span>')+goalTxt(h.goal,lgOf(SAVE.team))}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">Pierwszy sezon w toku.</p>'}
  <h3>Trofea</h3>${c.trophies.length?c.trophies.map(t=>`<div class="res">${esc(t)}</div>`).join(''):'<p class="mut small">Jeszcze bez trofeów.</p>'}</div>`;}
// ---- efekty w grze ----
function coachMatchX(){if(!coach())return {};return {sb:(cA('tak')-10)*0.0012,momMul:0.7+cA('mot')/33,prB:(cA('opa')-10)*0.004,trB:(cA('det')-10)*0.004};}
function negF(){return 1.1-cA('neg')/100;}

// ================= ZARZĄD: SPOTKANIA, PROŚBY, OCENA W POŁOWIE SEZONU, ULTIMATUM, CEL NA SEZON =================
// SAVE.bm = {last: data ostatniego spotkania, asked:{klucz:numer sezonu}, q:[sprawy od zarządu], ult:{need,n,w,from,until}|null, log:[]}
function BM(){return SAVE.bm||(SAVE.bm={last:null,asked:{},q:[],ult:null,log:[]});}
function bConf(){return SAVE.board?SAVE.board.conf:60;}
function bAdd(d){if(SAVE.board)SAVE.board.conf=clamp(SAVE.board.conf+d,0,100);}
function bmFree(){const b=BM();return !b.last||daysBetween(b.last,today())>=30;}
function bmChance(base){const c=coach();return clamp(base+(bConf()-50)/100*0.8+((c?c.rep:40)-40)/100*0.4+(cA('neg')-10)/10*0.08,0.03,0.95);}
const BM_REQ=[
 ['tr','Większy budżet transferowy','+25% budżetu transferowego na ten sezon.',()=>{const b=BUD();return b&&!b.extra?null:'Zarząd dołożył już pieniądze w tym sezonie.';},()=>bmChance(0.55)*(SAVE.fin.bal>300000?1:0.5),
   ok=>{const b=BUD();if(ok){const add=round5k(Math.max(150000,b.tr*0.25));b.extra=add;bAdd(-4);return `Zarząd dołożył ${fmt(add)} do budżetu transferowego. Oczekuje za to wyników.`;}bAdd(-2);return 'Zarząd odmówił: „Najpierw wyniki, potem pieniądze”.';}],
 ['wg','Większy budżet płacowy','+10% budżetu na pensje (łatwiej zatrzymać i kupić zawodników).',()=>null,()=>bmChance(0.45),
   ok=>{const b=BUD();if(ok){const add=round5k(b.wg*0.1);b.wg+=add;bAdd(-3);return `Budżet płacowy wzrósł o ${fmt(add)} rocznie.`;}bAdd(-2);return 'Zarząd odmówił: koszty pensji i tak są wysokie.';}],
 ['st','Więcej miejsc w sztabie','+1 etat w sztabie (limit etatów ustala zarząd).',()=>!limOn()?'Jesteś właścicielem — sam decydujesz o liczbie etatów.':((BM().stX||0)>=3?'Zarząd nie zgodzi się na kolejne etaty.':null),()=>bmChance(0.45)*(budLeft().wg>0?1:0.5),
   ok=>{const B=BM();if(ok){B.stX=(B.stX||0)+1;bAdd(-2);return `Zarząd zgodził się na dodatkowy etat. Limit sztabu: ${staffLimit()} etatów (bez skautów).`;}bAdd(-1);return 'Zarząd odmówił: „Sztab jest wystarczający jak na nasz klub”.';}],
 ['inf','Dotacja na infrastrukturę','Zarząd przekazuje pieniądze na rozbudowę obiektów (Infrastruktura).',()=>null,()=>bmChance(0.4)*(SAVE.fin.bal>0?1:0.4),
   ok=>{if(ok){const add=round5k(200000+(coach().rep||40)*4000);money(add,'Dotacja zarządu');finLog('Dotacja zarządu na infrastrukturę',add);SAVE.bm.infEar=(SAVE.bm.infEar||0)+add;return `Zarząd przekazał ${fmt(add)} na inwestycje w obiekty. Wydaj je na rozbudowę (Infrastruktura).`;}bAdd(-1);return 'Zarząd odmówił: inne wydatki są teraz ważniejsze.';}],
 ['jr','Inwestycja w juniorów','Lepsi juniorzy w następnym naborze.',()=>null,()=>bmChance(0.6),
   ok=>{if(ok){SAVE.bm.jrBoost=S().n;return 'Zarząd zgodził się: w następnym naborze juniorzy będą zdolniejsi.';}return 'Zarząd odmówił: akademia ma wystarczające środki.';}],
 ['goal','Obniżenie celu sezonu','Niższy cel, ale zarząd zapamięta, że prosiłeś.',()=>{const s=S();if(s.phase!=='liga'&&s.phase!=='spar')return 'Cel można zmienić tylko na początku sezonu.';if(s.phase==='liga'&&s.round>=6)return 'Na zmianę celu jest już za późno (po 6. kolejce).';if(goalLower(s.goal)==null)return 'Cel jest już najniższy.';return null;},()=>bmChance(0.4),
   ok=>{const s=S();if(ok){const g0=s.goal;s.goal=goalLower(s.goal);bAdd(-8);coach().rep=Math.max(0,coach().rep-2);return `Zarząd zgodził się: nowy cel to „${goalTxt(s.goal,lgOf(SAVE.team))}” (było: ${goalTxt(g0,lgOf(SAVE.team))}). Twoja pozycja jest jednak słabsza.`;}bAdd(-5);return 'Zarząd odmówił i jest zaniepokojony brakiem wiary w zespół.';}],
];
function goalLower(g){const n=lgIds(myLg()).length;const L=[2,4,8,10,n-2,n].filter((x,i,a)=>x>0&&x<=n&&a.indexOf(x)===i).sort((a,b)=>a-b);const i=L.indexOf(g);return i>=0&&i<L.length-1?L[i+1]:null;}
function goalHigher(g){const n=lgIds(myLg()).length;const L=[2,4,8,10,n-2,n].filter((x,i,a)=>x>0&&x<=n&&a.indexOf(x)===i).sort((a,b)=>a-b);const i=L.indexOf(g);return i>0?L[i-1]:null;}
function bmAsk(k){const B=BM();const r=BM_REQ.find(x=>x[0]===k);if(!r)return;if(!bmFree())return;const blk=r[3]();if(blk||B.asked[k]===S().n)return;
  B.last=today();B.asked[k]=S().n;const ok=R()<r[4]();const txt=r[5](ok);B.log.unshift({d:today(),k,ok,txt});B.log=B.log.slice(0,30);ui.bmRes={txt,ok};save();render();}
// ---- sprawy od zarządu ----
function bmOpen(q){const B=BM();if(B.q.some(x=>x.k===q.k))return;q.id='bm'+Date.now().toString(36);q.d=today();B.q.push(q);
  sendMail({cat:'zarz',from:'Prezes klubu',t:BMQ[q.k].t(q),s:'Zarząd prosi o spotkanie — Rozmowy → Zarząd.',b:{type:'bm',id:q.id},act:1,lab:'Zarząd'});}
const BMQ={
 mid:{t:q=>'Ocena w połowie sezonu',x:q=>{const p=q.pos,g=q.goal;return `„Jesteśmy na ${p}. miejscu, a celem jest ${goalTxt(g,lgOf(SAVE.team))}. ${p<=g?'Wyniki nas cieszą — oby tak dalej.':'Wyniki są poniżej oczekiwań. Jak pan to widzi?'}”`;},
   o:[['dobrze','Jesteśmy na dobrej drodze, plan działa.',q=>q.pos<=q.goal?0.85:0.35,(q,ok)=>{bAdd(ok?3:-4);return ok?'Zarząd jest spokojny.':'Zarząd uważa, że nie widzi pan problemów.';}],
     ['wzm','Potrzebuję wzmocnień, żeby osiągnąć cel.',q=>bmChance(0.45),(q,ok)=>{if(ok){const b=BUD();const add=round5k(Math.max(100000,b.tr*0.15));b.trAdd=(b.trAdd||0)+add;bAdd(-3);return `Zarząd dołożył ${fmt(add)} na transfery w trakcie sezonu.`;}bAdd(-3);return 'Zarząd odmówił: „Proszę pracować z tymi, których pan ma”.';}],
     ['odp','Biorę pełną odpowiedzialność za wynik.',q=>clamp(0.4+(cA('aut')-10)/20,0.1,0.85),(q,ok)=>{bAdd(ok?5:-2);return ok?'Zarząd docenia postawę i daje panu więcej spokoju.':'Zarząd zapamięta te słowa.';}]]},
 ult:{t:q=>'Ultimatum zarządu',x:q=>`„Zaufanie do pana jest na wyczerpaniu. Oczekujemy ${q.need} zwycięstw w najbliższych ${q.n} meczach ligowych. W przeciwnym razie rozstaniemy się.”`,
   o:[['ok','Rozumiem. Dowiozę te wyniki.',q=>0.9,(q,ok)=>{ultStart(q);return 'Ultimatum przyjęte. Licznik ruszył.';}],
     ['wal','To niesprawiedliwe — drużyna jest w budowie.',q=>clamp(0.25+(cA('neg')-10)/20+(coach().rep-40)/150,0.05,0.6),(q,ok)=>{if(ok){bAdd(10);return 'Zarząd dał się przekonać i daje panu więcej czasu. Ultimatum wycofane.';}ultStart(q);bAdd(-3);return 'Zarząd nie zmienił zdania. Ultimatum obowiązuje.';}]]},
 goal:{t:q=>'Cel na nowy sezon',x:q=>`„Na sezon ${sLabel(S().n)} oczekujemy: ${goalTxt(q.goal,lgOf(SAVE.team))}. Czy to dla pana realne?”`,
   o:[['ok','Przyjmuję cel.',q=>0.95,(q,ok)=>{S().goal=q.goal;bAdd(2);return 'Cel zatwierdzony.';}],
     ['niz','Proszę o niższy cel — drużyna potrzebuje czasu.',q=>goalLower(q.goal)==null?0:bmChance(0.45),(q,ok)=>{if(ok){S().goal=goalLower(q.goal);const b=BUD();if(b){b.tr=round5k(b.tr*0.85);}bAdd(-4);return `Zarząd zgodził się na „${goalTxt(S().goal,lgOf(SAVE.team))}”, ale obciął budżet transferowy o 15%.`;}S().goal=q.goal;bAdd(-4);return 'Zarząd nie zgodził się i jest zaniepokojony.';}],
     ['wyz','Stać nas na więcej — proszę o ambitniejszy cel i większy budżet.',q=>goalHigher(q.goal)==null?0:bmChance(0.6),(q,ok)=>{if(ok){S().goal=goalHigher(q.goal);const b=BUD();const add=b?round5k(Math.max(150000,b.tr*0.2)):0;if(b)b.trAdd=(b.trAdd||0)+add;bAdd(5);return `Nowy cel: „${goalTxt(S().goal,lgOf(SAVE.team))}”. Zarząd dołożył ${fmt(add)} do budżetu transferowego.`;}S().goal=q.goal;return 'Zarząd woli zostać przy pierwotnym celu.';}]]},
};
function bmAnswer(id,opt,auto){const B=BM();const q=B.q.find(x=>x.id===id);if(!q)return;B.q=B.q.filter(x=>x!==q);const T=BMQ[q.k];
  let txt;if(opt==='_ignore'){const o=T.o[0];txt=o[3](q,true);bAdd(-3);txt='Brak odpowiedzi na wezwanie zarządu. '+txt;}
  else{const o=T.o.find(x=>x[0]===opt);if(!o)return;const ok=R()<o[2](q);txt=o[3](q,ok);}
  B.log.unshift({d:today(),k:q.k,ok:true,txt});B.log=B.log.slice(0,30);if(auto){news('👔 '+txt);return;}ui.bmRes={txt,ok:true};save();render();}
// ---- ultimatum ----
function ultStart(q){BM().ult={need:q.need,n:q.n,w:0,p:0,from:today()};}
function bmAfterMatch(res,kind){const B=BM();const U=B.ult;if(!U||kind!=='liga')return;const me=res.h===SAVE.team;const won=(me?res.sw[0]:res.sw[1])>(me?res.sw[1]:res.sw[0]);U.p++;if(won)U.w++;
  if(U.w>=U.need){B.ult=null;bAdd(15);news(`👔 Ultimatum spełnione (${U.w} zwycięstw w ${U.p} meczach). Zarząd odzyskał zaufanie.`);return;}
  if(U.need-U.w>U.n-U.p){B.ult=null;if(!SAVE.ownClub)fireCoach(`Nie spełniłeś ultimatum zarządu (${U.w} z wymaganych ${U.need} zwycięstw w ${U.n} meczach).`);}}
// ---- codziennie: wyzwalacze spraw ----
function bmDaily(d){if(SAVE.team==null||!S()||SAVE.fired||!coach())return;const B=BM();const s=S();
  for(const q of B.q.slice())if(daysBetween(q.d,d)>10)bmAnswer(q.id,'_ignore',1);
  if(s.phase==='liga'){const half=Math.floor(s.rounds.length/2);if(s.round>=half&&B.midN!==s.n){B.midN=s.n;const T=leagueTable();bmOpen({k:'mid',pos:T.findIndex(x=>x.i===SAVE.team)+1,goal:s.goal||goalFor(SAVE.team)});}
    if(bConf()<25&&!B.ult&&B.ultN!==s.n&&s.round>=5&&!SAVE.ownClub&&s.round<s.rounds.length-4){B.ultN=s.n;bmOpen({k:'ult',need:3,n:5});}}}
// po starcie nowego sezonu (z coachOffseason): propozycja celu do negocjacji
function bmSeasonGoal(){const s=S();bmOpen({k:'goal',goal:s.goal||goalFor(SAVE.team)});}
function bmPred(ch){const [pl,c]=ixPred(ch);return [pl.replace('przyjmie dobrze','duża szansa').replace('raczej przyjmie','spora szansa').replace('może się nie spodobać','mała szansa').replace('źle przyjmie','prawie bez szans'),c];}
function bmN(){return SAVE.bm?SAVE.bm.q.length:0;}
function bmView(){const B=BM();const res=ui.bmRes;const free=bmFree();const s=S();
  const qcard=q=>{const T=BMQ[q.k];return `<div class="card"><div class="row" style="gap:12px;align-items:flex-start"><div style="font-size:42px;line-height:1">👔</div><div style="flex:1"><h2 style="margin:0 0 4px">${esc(T.t(q))}</h2><p style="margin:8px 0">${esc(T.x(q))}</p>
    ${T.o.map(o=>{const ch=o[2](q);if(ch<=0)return '';const [pl,c]=bmPred(ch);return `<button class="opt" style="display:block;width:100%;text-align:left;margin:6px 0" onclick="bmAnswer('${q.id}','${o[0]}')"><b>${esc(o[1])}</b> <span class="mxpill ${c}" style="margin-left:6px">${pl}</span></button>`;}).join('')}
    <div class="small mut">Zarząd czeka na odpowiedź do 10 dni.</div></div></div></div>`;};
  const U=B.ult;
  return `${res?`<div class="card" style="border:1px solid var(--acc)"><b>Zarząd:</b> ${esc(res.txt)} <button class="ghost sm" onclick="ui.bmRes=null;render()">OK</button></div>`:''}
   ${U?`<div class="card" style="border:1px solid var(--bad,#ef4444)"><h2>Ultimatum</h2><p>Wymagane ${U.need} zwycięstwa w ${U.n} meczach ligowych. Stan: <b>${U.w} zwycięstw w ${U.p} meczach</b> (zostało ${U.n-U.p}).</p></div>`:''}
   ${B.q.map(qcard).join('')}
   <div class="card"><h2>Spotkanie z zarządem${tipQ('Raz na 30 dni możesz poprosić zarząd o jedną rzecz. Każdą prośbę można złożyć raz w sezonie. Szansa zależy od zaufania zarządu, Twojej reputacji i umiejętności negocjacji.')}</h2>
    <div class="small" style="margin-bottom:8px">Zaufanie zarządu: <b>${Math.round(bConf())}%</b> · cel sezonu: <b>${goalTxt(s.goal||goalFor(SAVE.team),lgOf(SAVE.team))}</b> · ${free?'<span class="good">możesz poprosić o spotkanie</span>':`następne spotkanie możliwe ${fmtShort(addDays(B.last,30))}`}</div>
    ${BM_REQ.map(r=>{const blk=r[3]()||(B.asked[r[0]]===s.n?'Prosiłeś już o to w tym sezonie.':null);const [pl,c]=bmPred(r[4]());return `<div class="row wrap" style="gap:10px;margin:8px 0;align-items:center"><div style="flex:1;min-width:220px"><b>${r[1]}</b><div class="small mut">${r[2]}</div></div>${blk?`<span class="small mut">${esc(blk)}</span>`:`<span class="mxpill ${c}">${pl}</span><button class="btn sm" ${free?'':'disabled'} onclick="bmAsk('${r[0]}')">Poproś</button>`}</div>`;}).join('')}</div>
   ${B.log.length?`<div class="card"><h2>Historia rozmów z zarządem</h2>${B.log.slice(0,8).map(l=>`<div class="small" style="margin:4px 0">${fmtShort(l.d)} — ${esc(l.txt)}</div>`).join('')}</div>`:''}`;}

// ---- zakładki widoku „Rozmowy” ----
const ROZ_TABS=[[null,'Zawodnicy',()=>ixN()],['zarzad','Zarząd',()=>bmN()]];
function rozN(){return ROZ_TABS.reduce((a,t)=>a+(t[2]()||0),0);}
function rozmowyView(){const tab=ui.ixTab||null;const T=ROZ_TABS.find(t=>t[0]===tab)||ROZ_TABS[0];
  const head=`<div class="card"><div class="row wrap" style="gap:6px">${ROZ_TABS.map(([k,l,n])=>`<button class="tabb ${T[0]===k?'on':''}" onclick="ui.ixTab=${k?`'${k}'`:'null'};render()">${l}${n()?` (${n()})`:''}</button>`).join('')}</div></div>`;
  const body=T[0]==='zarzad'?bmView():T[0]==='media'&&typeof mdView==='function'?mdView():T[0]==='agenci'&&typeof agView==='function'?agView():ixView();return head+body;}

// ================= HISTORIA I REKORDY =================
// Zbierane od momentu wprowadzenia (wcześniejszych sezonów nie da się odtworzyć).
function HIST(){return SAVE.hist||(SAVE.hist={seasons:[],rec:{},str:{},club:{}});}
const REC_L={matchPts:'Najwięcej punktów zawodnika w meczu',matchAce:'Najwięcej asów zawodnika w meczu',matchBlk:'Najwięcej bloków zawodnika w meczu',
  seasonPts:'Najwięcej punktów zawodnika w sezonie',streak:'Najdłuższa seria zwycięstw drużyny',titles:'Najwięcej tytułów mistrza kraju'};
function pName(id){const P=PLAYERS[id];return P?`${P.p.first[0]}. ${P.p.last}`:'?';}
function hRec(k,v,o){const R=HIST().rec;if(!R[k]||v>R[k].v){R[k]=Object.assign({v,d:today(),n:S().n},o);return true;}return false;}
// po każdym zapisanym meczu: rekordy meczowe i serie zwycięstw
function histAfterMatch(m){try{const H=HIST();
  for(const sd of m.sides)for(const p of sd.pl){const x=p.st;if(!x)continue;const pts=x.kill+x.blk+x.ace;const o={id:p.id,nm:pName(p.id),tm:sd.team.idx,vs:m.sides[1-m.sides.indexOf(sd)].team.idx};
    hRec('matchPts',pts,o);hRec('matchAce',x.ace,o);hRec('matchBlk',x.blk,o);}
  m.sides.forEach((sd,i)=>{const t=sd.team.idx;if(t==null||t<0)return;const s=H.str[t]||(H.str[t]={c:0});if(m.winner===i){s.c++;hRec('streak',s.c,{tm:t});}else s.c=0;});}catch(e){console.error(e);}}
// na koniec sezonu (przed przejściem do następnego): mistrzowie, puchary, MVP, legendy klubu
function histSeasonEnd(){const H=HIST();const s=S();if(!s||s.phase!=='end'||H.seasons.some(x=>x.n===s.n))return;
  const lf=s.lgFinal||SAVE.lastFinal||{};const E=s.euro||{};
  const row={n:s.n,lab:sLabel(s.n),lg:{},cup:Object.assign({},SAVE.lastCupCh||{}),cl:E.cl&&E.cl.champ!=null?E.cl.champ:null,cev:E.cev&&E.cev.champ!=null?E.cev.champ:null,mvp:{},top:{},my:{tm:SAVE.team,lg:myLg(),pl:s.final?s.final.indexOf(SAVE.team)+1:null}};
  for(const k in lf)row.lg[k]=lf[k].slice(0,3);
  for(const k in lf){try{const L=Object.entries(s.ps||{}).filter(([id])=>{const P=PLAYERS[id];return P&&P.t&&lgOf(P.t.idx)===+k;}).map(([id,r])=>Object.assign({id},r));if(!L.length)continue;const mx=Math.max(...L.map(r=>r.m));
      const el=L.filter(r=>r.m>=mx*0.5);const av=r=>(r.rs||0)/(r.rn||1);const mvp=el.slice().sort((a,b)=>(b.mvp-a.mvp)||(av(b)-av(a)))[0];const top=L.slice().sort((a,b)=>b.pts-a.pts)[0];
      if(mvp)row.mvp[k]={id:mvp.id,nm:pName(mvp.id),tm:PLAYERS[mvp.id]&&PLAYERS[mvp.id].t?PLAYERS[mvp.id].t.idx:null};
      if(top){row.top[k]={id:top.id,nm:pName(top.id),pts:top.pts};hRec('seasonPts',top.pts,{id:top.id,nm:pName(top.id),tm:PLAYERS[top.id]&&PLAYERS[top.id].t?PLAYERS[top.id].t.idx:null});}}catch(e){}}
  try{row.aw=histAwards(s,lf);}catch(e){console.error(e);}
  try{domWageBonus(lf);}catch(e){console.error(e);}
  H.seasons.push(row);
  // tytuły mistrza (najwyższe ligi)
  const tc={};for(const r of H.seasons)for(const k in r.lg)if(LG_LV[+k]===0&&r.lg[k][0]!=null)tc[r.lg[k][0]]=(tc[r.lg[k][0]]||0)+1;
  const best=Object.entries(tc).sort((a,b)=>b[1]-a[1])[0];if(best)HIST().rec.titles={v:best[1],tm:+best[0],n:s.n};
  // legendy mojego klubu
  const ps=s.ps||{};const tr=[];if(row.my.pl===1)tr.push('🏆');if(row.cup[myCountry()]===SAVE.team)tr.push('🏆P');if(row.cl===SAVE.team)tr.push('🏆LM');if(row.cev===SAVE.team)tr.push('🏆CEV');
  for(const p of myTeam().players){const r=ps[p.id];if(!r||!r.m)continue;const c=H.club[p.id]||(H.club[p.id]={nm:`${p.first} ${p.last}`,pos:p.pos,s:0,m:0,pts:0,tr:0,mvp:0});
    c.nm=`${p.first} ${p.last}`;c.s++;c.m+=r.m;c.pts+=r.pts;c.mvp+=r.mvp||0;c.tr+=tr.length;c.last=s.n;}}
function tmN(i){return i!=null&&TEAMS[i]?TEAMS[i].name:'—';}
function historyView(){const H=HIST();const tab=ui.hTab||'mistrz';
  const tabs=[['mistrz','Mistrzowie'],['rek','Rekordy'],['leg','Legendy klubu'],['kar','Kariera trenera']];
  const head=`<div class="card"><div class="row wrap" style="gap:6px">${tabs.map(([k,l])=>`<button class="${tab===k?'btn':'ghost'} sm" onclick="ui.hTab='${k}';render()">${l}</button>`).join('')}</div></div>`;
  const empty=`<p class="mut">Historia zbiera się od sezonu, w którym ją wprowadzono. Po zakończeniu bieżącego sezonu pojawią się tu pierwsze wpisy.</p>`;
  let body='';
  if(tab==='mistrz'){const S2=H.seasons.slice().reverse();
    body=S2.length?S2.map(r=>`<div class="card"><h2>Sezon ${esc(r.lab)}</h2><div class="tw"><table><thead><tr><th class="l">Rozgrywki</th><th class="l">Mistrz</th><th class="l">2.</th><th class="l">3.</th><th class="l">MVP</th></tr></thead><tbody>
      ${Object.keys(r.lg).map(k=>`<tr><td class="l">${esc(lgFull(+k))}</td>${[0,1,2].map(j=>`<td class="l">${r.lg[k][j]===SAVE.team?'<b>':''}${esc(tmN(r.lg[k][j]))}${r.lg[k][j]===SAVE.team?'</b>':''}</td>`).join('')}<td class="l">${r.mvp[k]?esc(r.mvp[k].nm):'—'}</td></tr>`).join('')}
      ${Object.keys(r.cup).map(c=>`<tr><td class="l">${esc(typeof cupName==='function'?cupName(c):'Puchar '+c)}</td><td class="l">${esc(tmN(r.cup[c]))}</td><td></td><td></td><td></td></tr>`).join('')}
      ${r.cl!=null?`<tr><td class="l">Liga Mistrzów</td><td class="l">${esc(tmN(r.cl))}</td><td></td><td></td><td></td></tr>`:''}${r.cev!=null?`<tr><td class="l">Puchar CEV</td><td class="l">${esc(tmN(r.cev))}</td><td></td><td></td><td></td></tr>`:''}
      </tbody></table></div>${r.aw&&Object.keys(r.aw).length?`<h3 style="margin-top:10px">Nagrody indywidualne</h3><div class="tw"><table><thead><tr><th class="l">Liga</th>${Object.keys(AW_L).map(k=>`<th class="l">${AW_L[k].replace('Najlepszy ','').replace('Najlepsze ','')}</th>`).join('')}</tr></thead><tbody>${Object.keys(r.aw).map(k=>`<tr><td class="l">${esc(lgFull(+k))}</td>${Object.keys(AW_L).map(pos=>{const x=r.aw[k][pos];return `<td class="l">${x?`${x.tm===SAVE.team?'<b>':''}${esc(x.nm)}${x.tm===SAVE.team?'</b>':''} <small class="mut">${esc(TEAMS[x.tm]?TEAMS[x.tm].short:'')}</small>`:'—'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:''}</div>`).join(''):`<div class="card">${empty}</div>`;}
  else if(tab==='rek'){const R=H.rec;const ks=Object.keys(REC_L).filter(k=>R[k]);
    body=`<div class="card"><h2>Rekordy</h2>${ks.length?`<div class="tw"><table><thead><tr><th class="l">Rekord</th><th>Wartość</th><th class="l">Kto</th><th class="l">Kiedy</th></tr></thead><tbody>${ks.map(k=>{const r=R[k];const who=r.nm?`${esc(r.nm)} (${esc(tmN(r.tm))})${r.vs!=null?' vs '+esc(tmN(r.vs)):''}`:esc(tmN(r.tm));return `<tr><td class="l">${REC_L[k]}</td><td><b>${r.v}</b></td><td class="l">${who}</td><td class="l">${k==='titles'?'—':esc(r.d||sLabel(r.n))}</td></tr>`;}).join('')}</tbody></table></div>`:empty}</div>`;}
  else if(tab==='leg'){const L=Object.entries(H.club).filter(([,c])=>c.s>=1).sort((a,b)=>(b[1].s*10+b[1].tr*15+b[1].pts/40)-(a[1].s*10+a[1].tr*15+a[1].pts/40)).slice(0,25);
    body=`<div class="card"><h2>Legendy klubu</h2><p class="small mut">Zawodnicy, którzy grali w Twoim klubie: sezony, mecze, punkty, trofea zdobyte z klubem.</p>${L.length?`<div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz.</th><th>Sezony</th><th>Mecze</th><th>Punkty</th><th>MVP meczu</th><th>Trofea</th></tr></thead><tbody>${L.map(([id,c])=>`<tr><td class="l">${esc(c.nm)}${PLAYERS[id]&&PLAYERS[id].t&&PLAYERS[id].t.idx===SAVE.team?'':' <span class="small mut">(odszedł)</span>'}</td><td>${esc(c.pos||'')}</td><td>${c.s}</td><td>${c.m}</td><td>${c.pts}</td><td>${c.mvp}</td><td>${c.tr}</td></tr>`).join('')}</tbody></table></div>`:empty}</div>`;}
  else {const c=coach();const hs=(c.hist||[]);
    body=`<div class="card"><h2>Kariera trenera</h2>${hs.length?`<div class="tw"><table><thead><tr><th class="l">Sezon</th><th class="l">Klub</th><th class="l">Liga</th><th>Miejsce</th><th class="l">Cel zarządu</th></tr></thead><tbody>${hs.map(h=>`<tr><td class="l">${esc(sLabel(h.n))}</td><td class="l">${esc(tmN(h.team))}</td><td class="l">${h.team!=null&&TEAMS[h.team]?esc(lgFull(lgOf(h.team))):''}</td><td>${h.fired?'zwolniony':h.place||'—'}</td><td class="l">${h.fired?'':h.met?'✅ spełniony':'❌ niespełniony'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">Pierwszy sezon jeszcze trwa.</p>'}
      <h3 style="margin-top:12px">Trofea</h3>${(c.trophies||[]).length?`<div>${c.trophies.map(t=>`<div class="small">${esc(t)}</div>`).join('')}</div>`:'<p class="mut small">Jeszcze bez trofeów.</p>'}
      <p class="small mut" style="margin-top:8px">Oferty pracy przychodzą także z klubów z innych krajów (Niemcy, Włochy, Turcja), jeśli Twoja reputacja na to pozwala.</p></div>`;}
  return head+body;}

// nagrody sezonu według pozycji (ligi ze statystykami zawodników)
const AW_L={A:'Najlepszy atakujący',P:'Najlepszy przyjmujący',S:'Najlepszy środkowy',R:'Najlepszy rozgrywający',L:'Najlepsze libero'};
function histAwards(s,lf){const out={};const ps=s.ps||{};
  for(const k in lf){const l=+k;const L=Object.entries(ps).filter(([id])=>{const P=PLAYERS[id];return P&&P.t&&lgOf(P.t.idx)===l;}).map(([id,r])=>Object.assign({id,p:PLAYERS[id].p,tm:PLAYERS[id].t.idx},r));if(L.length<10)continue;
    const mx=Math.max(...L.map(r=>r.m));const el=L.filter(r=>r.m>=mx*0.5);const place=i=>{const x=lf[k].indexOf(i);return x<0?lf[k].length:x;};const N=lf[k].length;
    const sc={A:r=>r.pts/r.m,P:r=>r.rec>=r.m*3?r.pts/r.m*0.6+r.recPos/r.rec*30:-1,S:r=>(r.blk*1.5+r.kill)/r.m,L:r=>r.rec>=r.m*3?r.recPos/r.rec*100+r.dig/r.m*2:-1,R:r=>r.p.roz+(N-place(r.tm))*0.5};
    const A={};for(const pos in sc){const c=el.filter(r=>r.p.pos===pos).map(r=>[r,sc[pos](r)]).filter(x=>x[1]>=0).sort((a,b)=>b[1]-a[1])[0];if(!c)continue;const r=c[0];
      A[pos]={id:r.id,nm:pName(r.id),tm:r.tm};const p=r.p;(p.aw=p.aw||[]).push({k:pos,n:s.n,l});
      if(r.tm===SAVE.team)news(`🏅 ${p.first} ${p.last}: ${AW_L[pos].toLowerCase()} ${lgFull(l)} w sezonie ${sLabel(s.n)}!`);}
    out[k]=A;}
  return out;}
// nagrody podnoszą wartość zawodnika (do +15% przez dwa kolejne sezony)
function awBonus(p){if(!p.aw||!p.aw.length||!S())return 0;const n=S().n;return Math.min(0.15,p.aw.filter(a=>n-a.n<=2).length*0.06);}
{const _pv=pValue;pValue=function(p){const v=_pv(p);const b=awBonus(p);return b?Math.round(v*(1+b)/10000)*10000:v;};}
function awTxt(p){return (p.aw||[]).map(a=>`🏅 ${AW_L[a.k]} — ${LG_N[a.l]} ${sLabel(a.n)}`);}

// ---- dominujące kluby płacą więcej: tytuły w ostatnich 3 sezonach i renoma podnoszą oczekiwania kluczowych zawodników ----
function domTitles(ti){const H=SAVE.hist;if(!H||!H.seasons)return 0;const n=S()?S().n:0;return H.seasons.filter(r=>n-r.n<=3).reduce((a,r)=>{for(const k in r.lg)if(r.lg[k][0]===ti&&LG_LV[+k]===0)return a+1;return a;},0);}
let DOM_C=null;function domInfo(ti){const d=(SAVE&&SAVE.date)||'';if(!DOM_C||DOM_C.d!==d)DOM_C={d,m:{}};let x=DOM_C.m[ti];if(!x){const rep=SAVE.ai[ti].rep||0;const tt=domTitles(ti);x=DOM_C.m[ti]={rep,tt,ts:(tt||rep>=80)?teamStrength(TEAMS[ti]):0};}return x;}
function domPrem(p){if(!p||p.tm==null||p.tm<0||!TEAMS[p.tm]||!SAVE.ai||!SAVE.ai[p.tm])return 0;const I=domInfo(p.tm);const rep=I.rep,tt=I.tt;if(!tt&&rep<80)return 0;
  if(rating(p)<I.ts-2)return 0;return clamp(0.07*tt+Math.max(0,rep-80)*0.005,0,0.3);}
// premie kontraktowe za mistrzostwo i wicemistrzostwo (najwyższe ligi): pensje kluczowych zawodników rosną od razu
function domWageBonus(lf){const out=[];for(const k in lf){if(LG_LV[+k]!==0)continue;[[lf[k][0],0.08],[lf[k][1],0.04]].forEach(([ti,f])=>{const t=TEAMS[ti];if(!t||!t.players)return;const ts=teamStrength(t);
    for(const p of t.players){if(p.jr||!p.wage||rating(p)<ts-2)continue;p.wage=round5k(p.wage*(1+f));if(ti===SAVE.team)out.push(p);}});}
  if(out.length)news(`💰 Premie kontraktowe za medal mistrzostw: pensje ${out.length} kluczowych zawodników wzrosły (mistrz +8%, wicemistrz +4%).`);}
