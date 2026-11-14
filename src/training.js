// ================= FORMA ZAWODNIKÓW =================
// p.fm: forma 0–100 (60 = przeciętna), p.fmh: oceny z ostatnich 5 meczów, p.fr: świeżość 0–100 (tylko Twoja drużyna)
const FORM_LV=[[80,'znakomita','#22c55e','▲▲'],[68,'dobra','#84cc16','▲'],[52,'przeciętna','#eab308','►'],[40,'słaba','#f97316','▼'],[0,'bardzo słaba','#ef4444','▼▼']];
function fmOf(p){return p&&p.fm!=null?p.fm:60;}
function formLv(v){return FORM_LV.find(x=>v>=x[0]);}
function formAdd(p,d){p.fm=Math.round(clamp(fmOf(p)+d,5,100)*10)/10;}
function formChip(p,long){const v=fmOf(p),l=formLv(v);return `<span class="fchip" style="color:${l[2]}" title="Forma: ${l[1]} (${Math.round(v)}/100). Zależy od ostatnich meczów, treningów i charakteru zawodnika.">${l[3]}${long?' '+l[1]:''}</span>`;}
function frOf(p){return p&&p.fr!=null?p.fr:100;}
function frCol(v){return v>=80?'#22c55e':v>=60?'#a3e635':v>=40?'#eab308':'#ef4444';}
function frBar(p){const v=Math.round(frOf(p));return `<span class="frb" title="Świeżość ${v}%: wypoczęty zawodnik zaczyna mecz z pełną energią i lepiej trenuje"><i style="width:${v}%;background:${frCol(v)}"></i></span><small>${v}%</small>`;}
function fmHist(p){const h=p.fmh||[];return h.length?h.map(v=>`<span class="fmhv ${v>=7?'good':v<=5.4?'bad':''}">${String(v.toFixed(1)).replace('.',',')}</span>`).join(''):'<span class="mut small">—</span>';}
// po każdym rozegranym meczu (obie drużyny)
function formAfterMatch(m){if(typeof PLAYERS==='undefined')return;
  m.sides.forEach((sd,i)=>{const won=m.winner===i;
    for(const cp of sd.pl){const P=PLAYERS[cp.id];if(!P)continue;const p=P.p;const x=cp.st;const played=x.srv+x.rec+x.att+x.dig+x.blk>0;
      if(!played){formAdd(p,(55-fmOf(p))*0.08-(hasT(p,'kap')||hasT(p,'amb')?1:0));continue;}
      const r=liveRating(cp)||6;let d=(r-6.6)*4.5+(won?1.5:-1.5);
      if(hasT(p,'pro'))d*=0.7;if(hasT(p,'kap'))d*=1.3;if(d<0){if(hasT(p,'ner'))d*=1.3;if(hasT(p,'zde'))d*=0.7;}else if(hasT(p,'amb'))d*=1.15;
      formAdd(p,d*0.6+(60-fmOf(p))*(hasT(p,'pro')?0.18:0.12));
      (p.fmh=p.fmh||[]).push(Math.round(r*10)/10);if(p.fmh.length>5)p.fmh.shift();}});}
// zmęczenie po meczu: tylko Twoi zawodnicy (świeżość odbudowuje się na treningach)
function fatigueAfterMatch(m){const sd=m.sides[0];if(!sd||sd.team.idx!==SAVE.team)return;
  for(const cp of sd.pl){const x=cp.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;const P=PLAYERS[cp.id];if(!P)continue;const p=P.p;
    p.fr=Math.round(clamp(frOf(p)-14-(100-cp.en)*0.4,0,100));}}

// ================= TRENING: PLAN TYGODNIA, 3 JEDNOSTKI DZIENNIE =================
const TR_UNITS={
  zag:{n:'Zagrywka',ic:'🏐',k:['zag','sil'],load:5,d:'Zagrywka i siła uderzenia.'},
  prz:{n:'Przyjęcie',ic:'🙌',k:['prz','tod','zwi'],load:5,d:'Przyjęcie zagrywki, odbicie dołem, zwinność.'},
  ata:{n:'Atak',ic:'💥',k:['ata','sko','kiw'],load:7,d:'Atak, skoczność i kiwka.'},
  blo:{n:'Blok',ic:'🧱',k:['blo','sko','czy'],load:7,d:'Blok, skoczność i czytanie gry.'},
  obr:{n:'Obrona',ic:'🛡️',k:['obr','tod','zwi','czy'],load:6,d:'Obrona w polu, asekuracja, reakcja.'},
  roz:{n:'Rozegranie',ic:'🎯',k:['roz','tpa'],load:4,d:'Rozegranie i odbicie palcami (najwięcej dają rozgrywającym).'},
  tak:{n:'Taktyka',ic:'📋',k:['czy','kom','kcj'],load:2,d:'Analiza rywala i ustawienia: czytanie gry, komunikacja. Taktyka w 2 dni przed meczem daje bonus w meczu.'},
  sil:{n:'Trening siłowy',ic:'🏋️',k:['sil','sko','szy','kon'],load:11,d:'Siła, skoczność, szybkość, kondycja. Bardzo męczy — nie dzień przed meczem.'},
  int:{n:'Integracja',ic:'🍕',k:['kom'],load:0,d:'Wspólne wyjście: zgranie zespołu, lepsza atmosfera, humor zawodników.'},
  reg:{n:'Regeneracja',ic:'🧊',k:[],load:-14,d:'Odnowa biologiczna: szybki powrót świeżości, najlepiej dzień po meczu.'},
  off:{n:'Wolne',ic:'🛋️',k:[],load:-8,d:'Odpoczynek.'}};
const TR_ORDER=['zag','prz','ata','blo','obr','roz','tak','sil','int','reg','off'];
const TR_SKILL=['zag','prz','ata','blo','obr','roz'];
const TR_SLOTS=['Rano','Popołudnie','Wieczór'];
const WD=['pn.','wt.','śr.','czw.','pt.','sob.','nd.'];
const SESS_K=0.016;
function defWeek(){return [['sil','prz','off'],['ata','blo','off'],['zag','obr','int'],['sil','roz','off'],['tak','prz','off'],['tak','off','off'],['reg','off','off']];}
function ensTrn(){if(!SAVE.training)SAVE.training={focus:'bal',int:1};const t=SAVE.trn||(SAVE.trn={});if(!t.mode)t.mode='asy';if(!t.week)t.week=defWeek();if(!t.log)t.log=[];if(!t.tak)t.tak=[];return t;}
function hashStr(s){let h=9;for(const c of String(s))h=(h*131+c.charCodeAt(0))>>>0;return h;}
function matchDays(){return new Set(Object.keys(myEvents()));}
function trainingActive(d){const s=S();if(!s||SAVE.team==null||!SAVE.world)return false;if(!['spar','liga','po'].includes(s.phase))return false;return d>=`${seasonYear(s.n)}-08-01`;}
// najsłabsze elementy drużyny (wg zawodników, dla których dany element jest ważny)
function teamWeak(){const t=myTeam();const lu=myLineup?myLineup():autoLineup(t);const ids=new Set(Object.values(lu||{}));const ps=t.players.filter(p=>ids.has(p.id));const pool=ps.length?ps:t.players;
  const sc=TR_SKILL.map(u=>{const k=TR_UNITS[u].k[0];const rel=pool.filter(p=>WEIGHTS[p.pos][k]);const xs=rel.length?rel:pool;return [u,xs.reduce((s,p)=>s+p[k],0)/xs.length];});
  return sc.sort((a,b)=>a[1]-b[1]).map(x=>x[0]);}
function teamFr(){const ps=myTeam().players.filter(p=>!p.inj);return ps.length?ps.reduce((s,p)=>s+frOf(p),0)/ps.length:100;}
// plan asystenta na dany dzień: im lepszy asystent, tym rozsądniejszy (regeneracja po meczu, lekko przed meczem, praca nad słabościami)
function asstPlan(d,md){const sk=staffSkill('asy');const rnd=mulberry32(hashStr(d)*7+sk*101);const q=clamp((sk-3)/15,0,1);
  const W=teamWeak();const w=i=>W[Math.min(W.length-1,i)];const fr=teamFr();const t=myTeam();
  const chem=chemOf(t.players.filter(p=>Object.values(myLineup()||{}).includes(p.id)),SAVE.team);
  const isM=md.has(d),prev=md.has(addDays(d,-1)),next=md.has(addDays(d,1)),next2=md.has(addDays(d,2));const dw=(dow(d)+6)%7;
  let p;
  if(isM)p=['tak',null,null];
  else if(prev)p=['reg',fr<70?'reg':'off','off'];
  else if(next)p=['tak',w(0),'off'];
  else{const heavy=!next2&&fr>=72;p=[heavy?'sil':w(1),w(0),fr<78?(fr<68?'reg':'off'):chem<0.8&&dw%3===0?'int':w(2)];if(fr<58)p=['reg',w(0),'off'];}
  const ALL=TR_ORDER;for(let i=0;i<3;i++){if(p[i]==null)continue;if(rnd()<(1-q)*0.45)p[i]=ALL[Math.floor(rnd()*ALL.length)];}
  return p;}
function dayPlan(d,md){const t=ensTrn();if(t.mode==='own'){const w=t.week[(dow(d)+6)%7];return md.has(d)?[w[0],null,null]:w.slice();}return asstPlan(d,md);}
function devSession(p,U,intI,mods){const r=rating(p);const gap=(p.pot||r)-r;if(gap<=0||!U.k.length)return;
  const af=p.age<=20?1:p.age<=23?0.75:p.age<=26?0.45:p.age<=29?0.2:0.05;
  const tm=(hasT(p,'amb')?1.15:1)*(hasT(p,'pra')?1.2:1)*(hasT(p,'len')?0.78:1)*(hasT(p,'pro')?1.05:1);
  const fr=frOf(p);const pts=tm*af*TRAIN_INT[intI][1]*Math.min(1.5,0.5+gap/20)*SESS_K*mods.all*(fr<40?0.6:fr<60?0.85:1)*(0.9+fmOf(p)/600);
  const pw=WEIGHTS[p.pos];const n=U.k.length;p.xp=p.xp||{};
  U.k.forEach((k,j)=>{if(p[k]>=20)return;const sh=n===1?0.6:j===0?0.5:0.5/(n-1);const v=(p.xp[k]||0)+pts*sh*(pw[k]?1:0.4)*(mods[GRP[k]]||1);
    if(v>=1){p[k]++;p.xp[k]=Math.round((v-1)*100)/100;}else p.xp[k]=Math.round(v*1000)/1000;});}
function trainDay(d,md){const t=myTeam();if(!t)return;const trn=ensTrn();const isM=md.has(d);
  const plan=dayPlan(d,md);const units=plan.filter(Boolean);const intI=SAVE.training.int;const lm=[0.75,1,1.3][intI];const mods=clubMods(SAVE.team);
  for(const p of t.players){let fr=frOf(p)+6;
    if(p.inj&&(!p.injUntil||p.injUntil>d)){p.fr=Math.round(clamp(fr+6,0,100));continue;}
    for(const u of units){const U=TR_UNITS[u];
      if(U.load>0)fr-=U.load*lm*(1.25-p.kon/20*0.5);else fr-=U.load;
      if(U.k.length)devSession(p,U,intI,mods);
      if(U.load>0){const sc=58+nz()*(hasT(p,'pro')?10:18)+(hasT(p,'pra')?7:0)-(hasT(p,'len')?8:0)+(hasT(p,'amb')?3:0)+(fr<45?-12:0);formAdd(p,(sc-fmOf(p))*0.035);}
      if(u==='int'){if(p.tcTm!==SAVE.team){p.tcTm=SAVE.team;p.tc=0;}p.tc=Math.min(60,(p.tc||0)+0.3);formAdd(p,hasT(p,'kap')||hasT(p,'ind')?1.5:0.5);if(p.unh>0&&R()<0.3)p.unh--;}
      if(u==='off')formAdd(p,(60-fmOf(p))*0.02);
      if(U.load>3&&R()<0.0004*U.load/6*TRAIN_INT[intI][2]*mods.injChance*(fr<40?2.2:fr<60?1.4:1)*(1.3-p.kon/20*0.6)){
        const days=Math.max(2,Math.round((3+R()*R()*18)*mods.injDur));p.inj=days;p.injUntil=addDays(d,days);news(`🚑 ${p.first} ${p.last} doznał urazu na treningu (${U.n.toLowerCase()}) — przerwa ok. ${days} dni.`);break;}}
    p.fr=Math.round(clamp(fr,0,100));}
  if(units.includes('tak')){trn.tak.push(d);trn.tak=trn.tak.slice(-8);}
  trn.log.unshift({d,u:units,m:isM?1:0});trn.log=trn.log.slice(0,14);}
// wywoływane przy upływie czasu (każdy dzień)
function trainDays(days){if(!days.length)return;const md=matchDays();for(const d of days)if(trainingActive(d))trainDay(d,md);}
// bonus z odprawy taktycznej (jednostki „Taktyka” w dniu meczu i 2 dni przed nim)
function tacPrep(){const t=SAVE.trn;if(!t||!t.tak)return 0;const d=today();return Math.min(3,t.tak.filter(x=>x<=d&&daysBetween(x,d)<=2).length);}
function setTrMode(m){ensTrn().mode=m;save();render();}
function setTrCell(dw,sl,u){ensTrn().week[dw][sl]=u;save();render();}
function copyAsstPlan(){const t=ensTrn();const md=matchDays();for(let k=1;k<=7;k++){const d=addDays(today(),k);const p=asstPlan(d,md);t.week[(dow(d)+6)%7]=p.map(x=>x||'off');}t.mode='own';save();render();}
function resetWeek(){ensTrn().week=defWeek();save();render();}
function planWarnings(days,md){const out=[];let n=0,sil=0,int=0;
  for(const d of days){const p=dayPlan(d,md);const u=p.filter(Boolean);n+=u.filter(x=>TR_UNITS[x].load>0).length;sil+=u.filter(x=>x==='sil').length;int+=u.filter(x=>x==='int').length;
    if(md.has(addDays(d,-1))&&!md.has(d)&&!u.includes('reg')&&u.filter(x=>TR_UNITS[x].load>3).length>=2)out.push(`${fmtShort(d)}: dzień po meczu bez regeneracji — zawodnicy nie odzyskają świeżości.`);
    if(md.has(addDays(d,1))&&u.includes('sil'))out.push(`${fmtShort(d)}: trening siłowy dzień przed meczem — zawodnicy wyjdą na boisko zmęczeni.`);}
  if(n>17)out.push(`${n} ciężkich jednostek w tygodniu: duże ryzyko przemęczenia i urazów.`);
  if(n<7)out.push(`Tylko ${n} jednostek treningowych w tygodniu: zawodnicy będą się rozwijać bardzo wolno.`);
  if(!sil)out.push('Brak treningu siłowego: cechy fizyczne nie będą rosły.');
  return out;}
function unitSel(dw,sl,cur){return `<select class="trsel tu-${cur}" onchange="setTrCell(${dw},${sl},this.value)">${TR_ORDER.map(u=>`<option value="${u}" ${u===cur?'selected':''}>${TR_UNITS[u].ic} ${TR_UNITS[u].n}</option>`).join('')}</select>`;}
function unitTag(u,s){if(!u)return s===2?'<span class="mut">—</span>':'<span class="trt trm">🏐 Mecz</span>';const U=TR_UNITS[u];return `<span class="trt tu-${u}" title="${esc(U.d)}">${U.ic} ${U.n}</span>`;}
function trainingView(){
  const trn=ensTrn(),tr=SAVE.training;const t=myTeam();const md=matchDays();const sk=staffSkill('asy');const asy=SAVE.staff&&SAVE.staff.asy;
  const days=[];for(let k=1;k<=7;k++)days.push(addDays(today(),k));
  const act=trainingActive(addDays(today(),1));
  const warn=planWarnings(days,md);
  const grid=trn.mode==='own'
    ?`<div class="tw"><table class="trgrid"><thead><tr><th></th>${WD.map((w,i)=>{const d=days.find(x=>(dow(x)+6)%7===i);return `<th class="${d&&md.has(d)?'trmd':''}">${w}${d&&md.has(d)?' <small>🏐 mecz</small>':''}</th>`;}).join('')}</tr></thead><tbody>
      ${TR_SLOTS.map((sl,s)=>`<tr><th class="l">${sl}</th>${trn.week.map((w,dw)=>{const d=days.find(x=>(dow(x)+6)%7===dw);const blocked=s>0&&d&&md.has(d);return `<td>${blocked?(s===1?'<span class="trt trm">🏐 Mecz</span>':'<span class="mut">—</span>'):unitSel(dw,s,w[s])}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="small mut">Plan powtarza się co tydzień. W dniu meczu odbywa się tylko poranna jednostka.</p>`
    :`<div class="tw"><table class="trgrid"><thead><tr><th></th>${days.map(d=>`<th class="${md.has(d)?'trmd':''}">${fmtShort(d)}${md.has(d)?' <small>🏐 mecz</small>':''}</th>`).join('')}</tr></thead><tbody>
      ${TR_SLOTS.map((sl,s)=>`<tr><th class="l">${sl}</th>${days.map(d=>`<td>${unitTag(dayPlan(d,md)[s],s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="small mut">${asy?`Plan układa ${esc(asy.first)} ${esc(asy.last)} (jakość ${sk}/20). ${sk>=15?'Świetnie planuje: regeneracja po meczu, odprawa przed meczem, praca nad słabościami.':sk>=10?'Planuje rozsądnie, ale czasem się myli.':'Słaby asystent: plan bywa chaotyczny.'}`:'Nie masz asystenta trenera — plan układa się prawie losowo. Zatrudnij asystenta w zakładce Sztab.'} Plan na kolejne dni może się zmienić, gdy zmieni się stan drużyny.</p>`;
  const cnt={};for(const d of days)for(const u of dayPlan(d,md))if(u)cnt[u]=(cnt[u]||0)+1;
  const ps=t.players.slice().sort((a,b)=>({R:0,A:1,P:2,S:3,L:4})[a.pos]-({R:0,A:1,P:2,S:3,L:4})[b.pos]||rating(b)-rating(a));
  const inj=t.players.filter(p=>p.inj);const avg=Math.round(teamFr());const avF=Math.round(t.players.reduce((s,p)=>s+fmOf(p),0)/t.players.length);
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Plan treningowy</h2><span class="sp"></span>
    <div class="seg"><button class="${trn.mode==='own'?'on':''}" onclick="setTrMode('own')">✍️ Sam układam</button><button class="${trn.mode==='asy'?'on':''}" onclick="setTrMode('asy')">🧑‍🏫 Asystent układa${asy?` (${sk}/20)`:''}</button></div></div>
   <p class="small mut">Codziennie 3 jednostki: rano, po południu i wieczorem. ${act?'':'<b>Teraz trwa urlop — treningi ruszają 1 sierpnia.</b>'}</p>
   ${grid}
   <div class="row wrap" style="gap:6px;margin-top:6px">${trn.mode==='own'?`<button class="ghost sm" onclick="copyAsstPlan()">🧑‍🏫 Wczytaj propozycję asystenta</button><button class="ghost sm" onclick="resetWeek()">↺ Plan domyślny</button>`:`<button class="ghost sm" onclick="copyAsstPlan()">✍️ Przejmij ten plan i edytuj sam</button>`}</div>
   <div class="trsum small">${TR_ORDER.filter(u=>cnt[u]).map(u=>`<span class="trt tu-${u}">${TR_UNITS[u].ic} ${TR_UNITS[u].n} × ${cnt[u]}</span>`).join('')}</div>
   ${warn.length?`<div class="trwarn small">${warn.map(w=>`<div>⚠️ ${esc(w)}</div>`).join('')}</div>`:'<div class="small good" style="margin-top:6px">✓ Plan na najbliższy tydzień wygląda rozsądnie.</div>'}</div>
  <div class="card"><h2>Intensywność</h2><div class="opts">${TRAIN_INT.map(([l,,,d],i)=>`<button class="opt ${tr.int===i?'on':''}" onclick="SAVE.training.int=${i};save();render()"><b>${l}</b><small>${d} ${['Mniej zmęczenia.','','Treningi bardziej męczą.'][i]}</small></button>`).join('')}</div>
   <details class="legend"><summary>Jednostki treningowe — co dają?</summary>${TR_ORDER.map(u=>`<div><b>${TR_UNITS[u].ic} ${TR_UNITS[u].n}</b>: ${esc(TR_UNITS[u].d)}</div>`).join('')}
   <p class="small mut">Zawodnicy rozwijają się na każdej jednostce (aż do potencjału), najszybciej młodzi i pracowici. Dodatkowo rozwijają się w meczach, w których grają. Każda jednostka męczy: zmęczony zawodnik (niska świeżość) słabiej trenuje, łatwiej o uraz i zaczyna mecz z mniejszą energią. Forma rośnie po dobrych meczach i dobrych treningach, spada po słabych; profesjonaliści mają równą formę, kapryśni — chwiejną.</p></details></div>
  <div class="card"><div class="row wrap"><h2 style="margin:0">Zespół</h2><span class="sp"></span><span class="small mut">Średnia świeżość <b style="color:${frCol(avg)}">${avg}%</b> · średnia forma <b style="color:${formLv(avF)[2]}">${formLv(avF)[1]}</b></span></div>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Wiek</th><th>Forma</th><th class="l">Ostatnie mecze</th><th class="l">Świeżość</th><th>Ocena</th><th>Zmiana</th><th>Potencjał</th></tr></thead><tbody>
   ${ps.map(p=>{const d=rating(p)-baseRating(p);return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button> <small class="mut">${POS_SHORT[p.pos]}</small>${p.inj?' 🚑':''}</td><td>${p.age}</td><td>${formChip(p,true)}</td><td class="l">${fmHist(p)}</td><td class="l frc">${frBar(p)}</td><td><b>${rating(p)}</b></td><td class="${d>0?'good':d<0?'bad':''}">${d>0?'+':''}${d||'–'}</td><td class="stars">${potStars(p)}</td></tr>`;}).join('')}</tbody></table></div></div>
  ${trn.log.length?`<div class="card"><h2>Ostatnie treningi</h2>${trn.log.slice(0,7).map(x=>`<div class="res row wrap"><span class="mut small" style="min-width:70px">${fmtShort(x.d)}</span>${x.u.map(unitTag).join('')}${x.m?unitTag(null):''}</div>`).join('')}</div>`:''}
  <div class="card"><h2>Gabinet medyczny</h2>${inj.length?inj.map(p=>`<div class="res">🚑 <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> — powrót ok. ${p.injUntil?fmtDMY(p.injUntil):'?'} (jeszcze ${p.inj} dni)</div>`).join(''):'<p class="mut">Brak kontuzji.</p>'}</div>`;
}
function todayPlanTxt(d){if(!trainingActive(d))return null;const md=matchDays();return dayPlan(d,md).filter(Boolean).map(u=>TR_UNITS[u].n.toLowerCase()).join(', ');}
