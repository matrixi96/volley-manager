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
function cA(k){return SAVE.coach?SAVE.coach.attrs[k]:10;}
function clubReq(t){return initRepStatic(t);}
function initRepStatic(t){return Math.round(clamp((teamStrength(t)-65)*3.5,20,90));}
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
  <h2 style="margin-top:14px">Wybierz klub</h2><p class="mut">Fikcyjna polska liga, 12 drużyn. Kluby z kłódką nie zatrudnią trenera z tak niską reputacją: na lepszą pracę trzeba zasłużyć wynikami. Cel zarządu zależy od siły składu.</p>
  <div class="grid">${foundCard()}${TEAMS.map(t=>{const ok=canTake(t.idx,c.rep);const g=goalFor(t.idx);return `<button class="teamcard ${ok?'':'locked'}" style="--c:${t.color}" ${ok?`onclick="pickTeam(${t.idx})"`:'disabled'}><b>${ok?'':'🔒 '}${esc(t.name)}</b><span class="stars">${stars(teamStrength(t))}</span><small class="mut">Siła: ${teamStrength(t)} · cel: ${GOAL_TXT[g]}</small>${ok?'':`<small class="bad">Wymagana reputacja: ${clubReq(t)-25}</small>`}</button>`;}).join('')}</div></div>`;}
// ---- zarząd ----
const GOAL_TXT={2:'finał (top 2)',4:'półfinał (top 4)',8:'play-off (top 8)',10:'miejsce w pierwszej dziesiątce',12:'budowa zespołu (bez presji wyniku)'};
function goalFor(ti){const rk=TEAMS.map(t=>({i:t.idx,s:teamStrength(t)})).sort((a,b)=>b.s-a.s).findIndex(x=>x.i===ti)+1;return rk<=2?2:rk<=4?4:rk<=8?8:rk<=10?10:12;}
function initBoard(fresh){SAVE.board=SAVE.board||{conf:60};if(fresh)SAVE.board.conf=60;const s=S();if(s&&s.goal==null)s.goal=goalFor(SAVE.team);}
function boardAfterMatch(res){const b=SAVE.board;if(!b||!coach())return;
  const me=res.h===SAVE.team,my=me?res.sw[0]:res.sw[1],op=me?res.sw[1]:res.sw[0],oi=me?res.a:res.h;
  const p=1/(1+Math.exp(-(teamStrength(myTeam())-teamStrength(TEAMS[oi]))/4));
  const won=my>op?1:0;let d=(won-p)*5;if(won&&op===0)d+=0.5;if(!won&&my===0)d-=0.5;
  if(d>0)d*=0.9+cA('aut')/100;else d*=1.1-cA('aut')/100;
  b.conf=clamp(b.conf+d,0,100);
  const s=S();if(b.conf<8&&s.phase==='liga'&&s.round>=8&&!SAVE.fired&&!SAVE.ownClub)fireCoach('Zarząd stracił zaufanie po serii słabych wyników w trakcie sezonu.');}
function seasonEvaluation(){const s=S(),c=coach();if(!c||!s.final)return;const place=s.final.indexOf(SAVE.team)+1;const g=s.goal||goalFor(SAVE.team);const b=SAVE.board;
  const met=place<=g;const diff=g-place;
  b.conf=clamp(b.conf+(met?15+Math.min(15,diff*4):-10*Math.min(4,1-diff)),0,100);
  let dr=diff*1.5+(place===1?8:place<=3?3:0)+(met?3:-3);if(dr>0)dr*=0.85+cA('aut')/66;c.rep=Math.round(clamp(c.rep+dr,0,100));
  c.seasons++;c.hist.push({n:s.n,team:SAVE.team,place,goal:g,met,league:s.seed.indexOf(SAVE.team)+1});
  if(place===1)c.trophies.push(`🏆 Mistrzostwo Polski ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  if(place===2)c.trophies.push(`🥈 Wicemistrzostwo ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  if(place===3)c.trophies.push(`🥉 Brąz ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  if(s.jchamp===SAVE.team)c.trophies.push(`🏆 Mistrzostwo juniorów ${sLabel(s.n)} (${TEAMS[SAVE.team].name})`);
  s.eval={place,goal:g,met,dr:Math.round(dr)};
  news(met?`👔 Zarząd zadowolony: cel „${GOAL_TXT[g]}” wykonany (${place}. miejsce). Reputacja trenera: ${c.rep}.`:`👔 Zarząd rozczarowany: cel „${GOAL_TXT[g]}” niewykonany (${place}. miejsce). Zaufanie: ${Math.round(b.conf)}%.`);
  if(b.conf<20&&!SAVE.ownClub)fireCoach('Zarząd nie przedłużył współpracy po nieudanym sezonie.');
  else if(met)SAVE.offers=makeOffers(false);}
function makeOffers(fired){const c=coach();const cur=initRepStatic(myTeam());
  let pool=TEAMS.filter(t=>t.idx!==SAVE.team&&canTake(t.idx,c.rep));
  pool=fired?pool.sort((a,b)=>teamStrength(a)-teamStrength(b)).slice(0,4):pool.filter(t=>initRepStatic(t)>cur).sort(()=>R()-0.5);
  if(fired&&pool.length<2)pool=TEAMS.filter(t=>t.idx!==SAVE.team).sort((a,b)=>teamStrength(a)-teamStrength(b)).slice(0,3);
  const n=fired?2+(R()<0.5?1:0):(R()<0.6?1:0)+(R()<0.3?1:0);
  return pool.sort(()=>R()-0.5).slice(0,n).map(t=>({tm:t.idx,goal:goalFor(t.idx)}));}
function fireCoach(why){SAVE.fired={why,d:today()};SAVE.offers=makeOffers(true);news(`❌ Zostałeś zwolniony z ${myTeam().name}. ${why}`);
  coach().hist.push({n:S().n,team:SAVE.team,fired:true,d:today()});coach().rep=Math.max(0,coach().rep-5);}
function acceptJob(ti){const old=SAVE.team;const c=coach();
  if(SAVE.build){const b=SAVE.build;infraOf(old)[b.k]=b.to;SAVE.build=null;}
  SAVE.team=ti;SAVE.lineup=autoLineup(TEAMS[ti]);SAVE.tactics={serve:1,dist:0};
  const rep=SAVE.ai[ti].rep;SAVE.fin={bal:round5k(1000000+rep*15000),log:[],sea:{},prev:null};
  SAVE.staff=null;SAVE.staffPool=null;SAVE.inbox=[];initClub();
  SAVE.board={conf:60};SAVE.ownClub=false;const s=S();s.goal=goalFor(ti);c.joined=today();
  news(`✍️ ${c.first} ${c.last} nowym trenerem ${TEAMS[ti].name}! Cel zarządu: ${GOAL_TXT[s.goal]}.`);
  SAVE.fired=null;SAVE.offers=null;ui.match=null;ui.tab='mecz';save();render();}
function declineOffers(){SAVE.offers=null;save();render();}
function coachOffseason(){const c=coach();if(!c)return;if(coachAge(c)<60){for(let i=0;i<2;i++){const k=C_ATTR[Math.floor(R()*C_ATTR.length)][0];if(c.attrs[k]<20&&R()<0.6)c.attrs[k]++;}}
  const s=S();s.goal=goalFor(SAVE.team);news(`👔 Cel zarządu na sezon ${sLabel(s.n)}: ${GOAL_TXT[s.goal]}.`);SAVE.offers=null;}
// ---- widoki ----
function boardCard(){const s=S(),b=SAVE.board;if(!b||!coach())return '';const g=s.goal||goalFor(SAVE.team);const cf=Math.round(b.conf);
  return `<div class="card board"><div class="row wrap"><span class="mut small">Zarząd ${esc(myTeam().name)}</span><span class="sp"></span><span class="small">Cel sezonu: <b>${GOAL_TXT[g]}</b></span></div>
  ${SAVE.ownClub?'<div class="small mut">Jesteś założycielem klubu: zarząd Cię nie zwolni, ale wyniki wpływają na Twoją reputację.</div>':''}<div class="row"><span class="small">Zaufanie zarządu</span><div class="conf"><i style="width:${cf}%;background:${cf>=60?'var(--good)':cf>=30?'#eab308':'var(--bad)'}"></i></div><b>${cf}%</b></div></div>`;}
function firedView(){const f=SAVE.fired;return `<div class="card post lost"><h2>❌ Zostałeś zwolniony</h2><p>${esc(f.why)}</p><p class="mut small">Twoja reputacja: ${coach().rep}. Oto kluby, które chcą Cię zatrudnić:</p>${offersList(true)}</div>`;}
function offersList(must){const o=SAVE.offers||[];if(!o.length)return '<p class="mut">Brak ofert.</p>';
  return o.map(x=>`<div class="row wrap offer">${tDot(x.tm)}<b>${tName(x.tm)}</b><small class="mut">siła ${teamStrength(TEAMS[x.tm])} · cel: ${GOAL_TXT[x.goal]}</small><span class="sp"></span><button class="btn" onclick="acceptJob(${x.tm})">Przyjmij</button></div>`).join('')+(must?'':`<button class="link" onclick="declineOffers()">Zostaję w obecnym klubie</button>`);}
function coachView(){const c=coach();if(!c)return '';const ev=S().eval;
  return `<div class="card"><div class="row wrap coachhead">${coachFace(c,110)}<div><h2 style="margin:0">${esc(c.first)} ${esc(c.last)}</h2><div class="mut">Pierwszy trener · ${esc(myTeam().name)} · ${coachAge(c)} l. (ur. ${fmtDMY(c.dob)})</div><div class="small mut">${C_EXP.find(x=>x[0]===c.exp)[1]} · sezonów w karierze: ${c.seasons}</div></div><span class="sp"></span>
  <div class="repbox"><span class="mut small">Reputacja</span><b>${c.rep}</b><div class="conf"><i style="width:${c.rep}%;background:var(--acc)"></i></div></div></div></div>
  ${boardCard()}
  <div class="card"><h2>Atrybuty trenera</h2><div class="ccattrs">${[['skill','Umiejętności'],['ment','Cechy mentalne']].map(([g,gn])=>`<div><h4>${gn}</h4>${C_ATTR.filter(a=>a[2]===g).map(([k,n,,ds])=>`<div class="ccrow"><div><b>${n}</b><br><small class="mut">${ds}</small></div><span class="attr ${aCls(c.attrs[k])}">${c.attrs[k]}</span></div>`).join('')}</div>`).join('')}</div>
  <p class="mut small">Atrybuty trenera rosną powoli z każdym sezonem (do 60. roku życia).</p></div>
  <div class="card"><h2>Kariera</h2>${c.hist.length?`<div class="tw"><table><thead><tr><th class="l">Sezon</th><th class="l">Klub</th><th>Po fazie zas.</th><th>Miejsce</th><th class="l">Cel</th></tr></thead><tbody>${c.hist.map(h=>`<tr><td class="l">${sLabel(h.n)}</td><td class="l">${tDot(h.team)}${tName(h.team)}</td><td>${h.fired?'—':h.league+'.'}</td><td>${h.fired?'<span class="bad">zwolniony</span>':'<b>'+h.place+'.</b>'}</td><td class="l">${h.fired?'':(h.met?'<span class="good">✓ </span>':'<span class="bad">✗ </span>')+GOAL_TXT[h.goal]}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">Pierwszy sezon w toku.</p>'}
  <h3>Trofea</h3>${c.trophies.length?c.trophies.map(t=>`<div class="res">${esc(t)}</div>`).join(''):'<p class="mut small">Jeszcze bez trofeów.</p>'}</div>`;}
// ---- efekty w grze ----
function coachMatchX(){if(!coach())return {};return {sb:(cA('tak')-10)*0.0012,momMul:0.7+cA('mot')/33,prB:(cA('opa')-10)*0.004,trB:(cA('det')-10)*0.004};}
function negF(){return 1.1-cA('neg')/100;}
