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
// regeneracja: fizjoterapeuta (umiejętność 1–20) i odnowa biologiczna
function regenK(){const sk=staffSkill('med');return (0.8+sk/20*0.5)*(1+0.05*((myInfra().odn||1)-1));}
function matchDrainK(){return 1.15-staffSkill('med')/20*0.3;}
// zmęczenie po meczu: tylko Twoi zawodnicy (świeżość odbudowuje się na treningach)
function fatigueAfterMatch(m){const sd=m.sides[0];if(!sd||sd.team.idx!==SAVE.team)return;const dk=matchDrainK();
  for(const cp of sd.pl){const x=cp.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;const P=PLAYERS[cp.id];if(!P)continue;const p=P.p;
    p.fr=Math.round(clamp(frOf(p)-(14+(100-cp.en)*0.4)*dk*(hasT(p,'wer')?0.8:1)*(hasT(p,'odp')?0.9:1),0,100));}}

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
function devSession(p,U,intI,mods,mult){const r=rating(p);const gap=(p.pot||r)-r;if(gap<=0||!U.k.length)return;
  const af=p.age<=20?1:p.age<=23?0.75:p.age<=26?0.45:p.age<=29?0.2:0.05;
  const tm=(hasT(p,'amb')?1.15:1)*(hasT(p,'pra')?1.2:1)*(hasT(p,'len')?0.78:1)*(hasT(p,'pro')?1.05:1);
  const fr=frOf(p);const pts=(mult||1)*tm*af*TRAIN_INT[intI][1]*Math.min(1.5,0.5+gap/20)*SESS_K*mods.all*(fr<40?0.6:fr<60?0.85:1)*(0.9+fmOf(p)/600);
  const pw=WEIGHTS[p.pos];const n=U.k.length;p.xp=p.xp||{};
  U.k.forEach((k,j)=>{if(p[k]>=20)return;const sh=n===1?0.6:j===0?0.5:0.5/(n-1);const v=(p.xp[k]||0)+pts*sh*(pw[k]?1:0.4)*(mods[GRP[k]]||1);
    if(v>=1){p[k]++;p.xp[k]=Math.round((v-1)*100)/100;}else p.xp[k]=Math.round(v*1000)/1000;});}
function trainDay(d,md){const t=myTeam();if(!t)return;const trn=ensTrn();const isM=md.has(d);
  const plan=dayPlan(d,md);const units=plan.filter(Boolean);const intI=SAVE.training.int;const lm=[0.75,1,1.3][intI];const mods=clubMods(SAVE.team);
  const rp={};const rk=regenK();// raport dnia dla każdego zawodnika
  for(const p of t.players){let fr=frOf(p)+6*rk;const fm0=fmOf(p);const it=itrOf(p);const iL=IND_INT[it.i];
    if(p.restUntil&&p.restUntil>=d&&!isM&&!(p.inj&&(!p.injUntil||p.injUntil>d))){p.fr=Math.round(clamp(fr+12*rk,0,100));formAdd(p,(60-fm0)*0.02);rp[p.id]={rest:1,fr:p.fr,f:[Math.round(fm0),Math.round(fmOf(p))]};continue;}
    if(p.inj&&(!p.injUntil||p.injUntil>d)){p.fr=Math.round(clamp(fr+6*rk,0,100));rp[p.id]={i:1,fr:p.fr,f:[Math.round(fm0),Math.round(fm0)]};continue;}
    const a0={},x0={};for(const k of ALL_KEYS){a0[k]=p[k];x0[k]=(p.xp&&p.xp[k])||0;}const scs=[];let inj=0,n=0;const why={};
    for(const u of units){const U=TR_UNITS[u];
      if(U.load>0)fr-=U.load*lm*iL.l*(1.25-p.kon/20*0.5);else fr-=U.load*rk;
      if(U.k.length)devSession(p,U,intI,mods,iL.d*mentorK(p));
      if(U.load>0){n++;const f=trFactors(p,U,fr,d);const sc=(p.trB&&p.trB.until>=d?p.trB.v*10:0)+60+nz()*(hasT(p,'pro')?6:10)+f.v;for(const k of f.w)why[k]=(why[k]||0)+1;scs.push(sc);formAdd(p,(sc-fmOf(p))*0.035);}
      if(u==='int'){if(p.tcTm!==SAVE.team){p.tcTm=SAVE.team;p.tc=0;}p.tc=Math.min(60,(p.tc||0)+0.3);formAdd(p,hasT(p,'kap')||hasT(p,'ind')?1.5:0.5);if(p.unh>0&&R()<0.3)p.unh--;}
      if(u==='off')formAdd(p,(60-fmOf(p))*0.02);
      if(U.load>3&&R()<0.0004*U.load/6*TRAIN_INT[intI][2]*mods.injChance*(fr<40?2.2:fr<60?1.4:1)*(1.3-p.kon/20*0.6)*reinjF(p)*iL.r){
        const days=Math.max(2,Math.round((3+R()*R()*18)*mods.injDur));p.inj=days;p.injUntil=addDays(d,days);p.injN=injName(days);p.injD=days;inj=days;news(`🚑 ${p.first} ${p.last} doznał urazu na treningu (${U.n.toLowerCase()}): ${p.injN.toLowerCase()} — przerwa ok. ${days} dni.`);break;}}
    if(it.f&&!inj&&!isM&&n>0&&(TR_UNITS[it.f]||String(it.f).startsWith('a:'))){const fa=String(it.f).startsWith('a:');const FU=fa?{k:[it.f.slice(2)],n:'cecha'}:TR_UNITS[it.f];devSession(p,FU,intI,mods,(fa?0.42:0.3)*iL.d*mentorK(p));fr-=3*iL.l;}
    p.fr=Math.round(clamp(fr,0,100));
    const g={},up=[];for(const k of ALL_KEYS){const dv=(p[k]-a0[k])+(((p.xp&&p.xp[k])||0)-x0[k]);if(dv>0.0005)g[k]=Math.round(dv*1000)/1000;if(p[k]>a0[k])up.push(k);}
    const r={fr:p.fr,f:[Math.round(fm0),Math.round(fmOf(p))],n};if(scs.length)r.s=Math.round(clamp((scs.reduce((a,b)=>a+b,0)/scs.length+7)/10,1,10)*10)/10;
    if(Object.keys(g).length)r.g=g;if(up.length)r.up=up;if(inj)r.inj=inj;if(Object.keys(why).length)r.w=Object.keys(why);rp[p.id]=r;}
  if(units.includes('tak')){trn.tak.push(d);trn.tak=trn.tak.slice(-8);}
  trn.log.unshift({d,u:units,m:isM?1:0});trn.log=trn.log.slice(0,14);
  trn.rep=trn.rep||[];trn.rep.unshift({d,u:units,m:isM?1:0,p:rp});trn.rep=trn.rep.slice(0,31);
  if(typeof mailTraining==='function')mailTraining('D',[trn.rep[0]]);}
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
  return `${S().phase==='spar'&&typeof campCard==='function'?campCard():''}<div class="card"><div class="row wrap"><h2 style="margin:0">Plan treningowy</h2><span class="sp"></span>
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
   ${ps.map(p=>{const d=rating(p)-baseRating(p);return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small>${p.inj?' 🚑':''} ${talkBtn(p.id,1)}</td><td>${p.age}</td><td>${formChip(p,true)}</td><td class="l">${fmHist(p)}</td><td class="l frc">${frBar(p)}</td><td><b>${rating(p)}</b></td><td class="${d>0?'good':d<0?'bad':''}">${d>0?'+':''}${d||'–'}</td><td class="stars">${potStars(p)}</td></tr>`;}).join('')}</tbody></table></div></div>
  ${trainReport()}
  ${trn.log.length?`<div class="card"><h2>Ostatnie treningi</h2>${trn.log.slice(0,7).map(x=>`<div class="res row wrap"><span class="mut small" style="min-width:70px">${fmtShort(x.d)}</span>${x.u.map(unitTag).join('')}${x.m?unitTag(null):''}</div>`).join('')}</div>`:''}
  <div class="card"><h2>Gabinet medyczny</h2>${inj.length?inj.map(p=>`<div class="res">🚑 <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> — powrót ok. ${p.injUntil?fmtDMY(p.injUntil):'?'} (jeszcze ${p.inj} dni)</div>`).join(''):'<p class="mut">Brak kontuzji.</p>'}</div>`;
}
function todayPlanTxt(d){if(!trainingActive(d))return null;const md=matchDays();return dayPlan(d,md).filter(Boolean).map(u=>TR_UNITS[u].n.toLowerCase()).join(', ');}
// ================= RAPORTY Z TRENINGÓW (dzień / tydzień / miesiąc) =================
const REP_P=[['day','Dzień'],['week','Tydzień'],['month','Miesiąc']];
function repDays(){const r=(SAVE.trn&&SAVE.trn.rep)||[];const P=ui.trRepP||'week';if(P==='day')return r.slice(0,1);const lim=addDays(today(),P==='week'?-7:-30);return r.filter(x=>x.d>lim);}
function repAgg(days,pid){let n=0,s=0,sn=0,inj=0,miss=0,f0=null,f1=null,fr=null,frS=0,frN=0;const g={},up={},why={};
  for(const day of days.slice().reverse()){const r=day.p&&day.p[pid];if(!r)continue;if(f0==null)f0=r.f[0];f1=r.f[1];fr=r.fr;frS+=r.fr;frN++;
    if(r.i){miss++;continue;}n+=r.n||0;if(r.s!=null){s+=r.s;sn++;}for(const k of r.w||[])why[k]=(why[k]||0)+1;for(const k in r.g||{})g[k]=(g[k]||0)+r.g[k];for(const k of r.up||[])up[k]=(up[k]||0)+1;if(r.inj)inj=r.inj;}
  return {n,avg:sn?s/sn:null,g,up,f0,f1,fr,frAvg:frN?frS/frN:null,inj,miss,tot:Object.values(g).reduce((a,b)=>a+b,0),seen:frN,why:Object.keys(why).sort((a,b)=>why[b]-why[a])};}
const fx1=v=>v==null?'–':v.toFixed(1).replace('.',',');
function scCls(v){return v==null?'':v>=7?'good':v<=5.5?'bad':'';}
function fmDelta(a){if(a.f0==null)return '–';const d=a.f1-a.f0;return `<span class="${d>1?'good':d<-1?'bad':'mut'}">${d>1?'▲':d<-1?'▼':'►'} ${d>0?'+':''}${d}</span> <small class="mut">(${formLv(a.f1)[1]})</small>`;}
function upChips(up){const ks=Object.keys(up);return ks.length?ks.map(k=>`<span class="trt tu-up" title="${esc(attrName(k))}">${attrSh(k)} +${up[k]}</span>`).join(''):'<span class="mut">—</span>';}
function trainReport(){const days=repDays();const t=myTeam();const P=ui.trRepP||'week';const sel=ui.trRepPl||'';
  const head=`<div class="row wrap" style="gap:8px"><h2 style="margin:0">Raport z treningów</h2><span class="sp"></span><div class="seg">${REP_P.map(([k,l])=>`<button class="${P===k?'on':''}" onclick="ui.trRepP='${k}';render()">${l}</button>`).join('')}</div>
    <select onchange="ui.trRepPl=this.value;render()"><option value="">Cała drużyna</option>${t.players.map(p=>`<option value="${p.id}" ${sel===p.id?'selected':''}>${esc(p.last)} (${POS_SHORT[p.pos]})</option>`).join('')}</select></div>`;
  if(!days.length)return `<div class="card">${head}<p class="mut">Brak treningów w tym okresie. Raporty pojawią się po pierwszych dniach treningowych (od 1 sierpnia).</p></div>`;
  const range=days.length===1?fmtLong(days[0].d):`${fmtShort(days[days.length-1].d)} – ${fmtShort(days[0].d)} (${days.length} dni)`;
  const cnt={};for(const d of days)for(const u of d.u)cnt[u]=(cnt[u]||0)+1;
  const units=`<div class="trsum small">${TR_ORDER.filter(u=>cnt[u]).map(u=>`<span class="trt tu-${u}">${TR_UNITS[u].ic} ${TR_UNITS[u].n} × ${cnt[u]}</span>`).join('')}${days.some(d=>d.m)?`<span class="trt trm">🏐 Mecze × ${days.filter(d=>d.m).length}</span>`:''}</div>`;
  if(sel&&PLAYERS[sel]){const p=PLAYERS[sel].p;const a=repAgg(days,sel);const ks=Object.keys(a.g).sort((x,y)=>a.g[y]-a.g[x]);
    const rows=days.map(d=>{const r=d.p[sel];if(!r)return '';return `<tr><td class="l">${fmtShort(d.d)}</td><td class="l">${r.i?'<span class="bad">🚑 kontuzja — bez treningu</span>':d.u.map(u=>unitTag(u)).join('')+(d.m?unitTag(null,1):'')}</td><td class="${scCls(r.s)}"><b>${fx1(r.s)}</b></td><td>${r.f[1]-r.f[0]>0?'+':''}${r.f[1]-r.f[0]}</td><td><span style="color:${frCol(r.fr)}">${r.fr}%</span></td><td class="l">${r.up?r.up.map(k=>`<span class="trt tu-up">${attrSh(k)} +1</span>`).join(''):''}${r.inj?` <span class="bad">uraz (${r.inj} dni)</span>`:''}</td></tr>`;}).join('');
    return `<div class="card">${head}<p class="small mut">${esc(p.first)} <b style="color:var(--txt)">${esc(p.last)}</b> · ${POS_NAMES[p.pos]} · ${p.age} l. · ${range}</p>
     <div class="repk"><div><small>Jednostki</small><b>${a.n}</b></div><div><small>Średnia ocena</small><b class="${scCls(a.avg)}">${fx1(a.avg)}</b></div><div><small>Postęp</small><b>+${a.tot.toFixed(2).replace('.',',')}</b><small class="mut">pkt atrybutów</small></div><div><small>Forma</small><b>${fmDelta(a)}</b></div><div><small>Świeżość</small><b style="color:${frCol(a.fr??100)}">${a.fr??'–'}%</b><small class="mut">śr. ${a.frAvg!=null?Math.round(a.frAvg):'–'}%</small></div>${a.miss?`<div><small>Opuszczone dni</small><b class="bad">${a.miss}</b></div>`:''}</div>
     <h3>Nad czym pracował</h3>${ks.length?`<div class="repbars">${ks.map(k=>{const cur=(p.xp&&p.xp[k])||0;return `<div class="repbar"><span>${esc(attrName(k))} <b style="color:${attrCol(p[k])}">${p[k]}</b></span><i><b style="width:${Math.min(100,a.g[k]/Math.max(...ks.map(x=>a.g[x]))*100)}%"></b></i><em>+${a.g[k].toFixed(2).replace('.',',')}</em><small class="mut" title="Postęp do następnego punktu">${p[k]>=20?'max':Math.round(cur*100)+'% do '+(p[k]+1)}</small></div>`;}).join('')}</div>`:'<p class="mut small">Brak postępu w tym okresie (zawodnik osiągnął potencjał, był kontuzjowany albo miał same dni wolne/regenerację).</p>'}
     ${Object.keys(a.up).length?`<p class="small">Podniesione atrybuty: ${upChips(a.up)}</p>`:''}
     <h3>Dzień po dniu</h3><div class="tw"><table><thead><tr><th class="l">Dzień</th><th class="l">Jednostki</th><th title="Ocena za trening (1–10)">Ocena</th><th title="Zmiana formy">Forma</th><th>Świeżość</th><th class="l">Uwagi</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;}
  const ag=t.players.map(p=>({p,a:repAgg(days,p.id)})).filter(x=>x.a.seen);
  const rated=ag.filter(x=>x.a.avg!=null).sort((x,y)=>y.a.avg-x.a.avg);const prog=ag.slice().sort((x,y)=>y.a.tot-x.a.tot);
  const tired=ag.filter(x=>x.a.fr!=null&&x.a.fr<55&&!x.a.miss);const asy=SAVE.staff&&SAVE.staff.asy;
  const notes=[];if(rated.length){notes.push(`Najlepiej trenował <b>${esc(rated[0].p.last)}</b> (śr. ${fx1(rated[0].a.avg)})${rated.length>1?`, najsłabiej <b>${esc(rated[rated.length-1].p.last)}</b> (${fx1(rated[rated.length-1].a.avg)})`:''}.`);}
  if(prog.length&&prog[0].a.tot>0)notes.push(`Największy postęp: <b>${esc(prog[0].p.last)}</b> (+${fx1(prog[0].a.tot)} pkt atrybutów).`);
  if(tired.length)notes.push(`Zmęczeni: ${tired.map(x=>esc(x.p.last)).join(', ')} — przydałaby się regeneracja.`);
  const injd=ag.filter(x=>x.a.inj);if(injd.length)notes.push(`Urazy na treningu: ${injd.map(x=>esc(x.p.last)).join(', ')}.`);
  return `<div class="card">${head}<p class="small mut">${range}</p>${units}
   <div class="repnote small">${asy?`🧑‍🏫 <b>${esc(asy.last)}</b> (asystent): `:'📋 '}${notes.join(' ')||'Spokojny okres bez uwag.'}</div>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th title="Liczba jednostek treningowych">Jedn.</th><th title="Średnia ocena za trening (1–10)">Ocena</th><th title="Suma postępu w atrybutach (1 = jeden punkt atrybutu)">Postęp</th><th class="l">Podniesione</th><th class="l">Forma</th><th>Świeżość</th><th class="l">Uwagi</th></tr></thead><tbody>
   ${ag.map(({p,a})=>`<tr class="clickrow" onclick="ui.trRepPl='${p.id}';render()"><td class="l">${esc(p.first[0])}. <b>${esc(p.last)}</b> <small class="mut">${pTag(p.pos)}</small></td><td>${a.n}</td><td class="${scCls(a.avg)}"><b>${fx1(a.avg)}</b></td><td>+${a.tot.toFixed(2).replace('.',',')}</td><td class="l">${upChips(a.up)}</td><td class="l">${fmDelta(a)}</td><td><span style="color:${frCol(a.fr??100)}">${a.fr??'–'}%</span></td><td class="l small">${a.inj?`<span class="bad">🚑 uraz (${a.inj} dni)</span>`:a.miss?`<span class="mut">kontuzja: ${a.miss} dni bez treningu</span>`:''}</td></tr>`).join('')}</tbody></table></div>
   <p class="small mut">Kliknij zawodnika, żeby zobaczyć szczegółowy raport. Ocena za trening zależy od charakteru (pracowity, leniwy, ambitny, profesjonalista) i zmęczenia.</p></div>`;}

// ocena treningu z konkretnych przyczyn (losowość mniejsza niż wcześniej); zwraca punkty i powody, które zauważy sztab
const TR_WHY={prac:['pracowity','+'],len:['leniwy','-'],amb:['ambitny','+'],oby:['wzór na treningu','+'],wer:['pełen energii','+'],mor:['świetne morale','+'],morL:['słabe morale','-'],unh:['niezadowolony ze swojej roli','-'],
  fr:['zmęczony','-'],fit:['ćwiczenia pod jego pozycję','+'],inj:['wraca po kontuzji — trenuje ostrożnie','-'],staff:['dobra praca sztabu','+'],staffL:['słaby sztab','-'],form:['w gazie po meczach','+'],formL:['bez formy','-']};
function trFactors(p,U,fr,d){let v=0;const w=[];const add=(x,k)=>{v+=x;if(Math.abs(x)>=3)w.push(k);};
  if(hasT(p,'pra'))add(7,'prac');if(hasT(p,'len'))add(-8,'len');if(hasT(p,'amb'))add(3,'amb');if(hasT(p,'oby'))add(3,'oby');if(hasT(p,'wer')&&fr>=55)add(3,'wer');
  const mor=p.mor==null?60:p.mor;const mv=clamp((mor-60)*0.15,-6,5);add(mv,mv>0?'mor':'morL');
  if((p.unh||0)>=3)add(hasT(p,'loj')?-3:-6,'unh');
  if(fr<70)add(-(70-fr)*0.22,'fr');
  if(U.k.length&&U.k.some(k=>WEIGHTS[p.pos]&&WEIGHTS[p.pos][k]>=0.12))add(3,'fit');
  if(p.injLast&&p.injLast.back&&daysBetween(p.injLast.back,d)<=7)add(-4,'inj');
  const sk=staffSkill('asy');const sv=(sk-10)*0.35;add(sv,sv>0?'staff':'staffL');
  const fm=(typeof fmOf==='function'?fmOf(p):60);const fv=clamp((fm-60)*0.08,-3,3);add(fv,fv>0?'form':'formL');
  return {v,w};}
function trWhyTxt(keys,good){return keys.filter(k=>TR_WHY[k]&&(TR_WHY[k][1]==='+')===good).slice(0,2).map(k=>TR_WHY[k][0]).join(', ');}

// ================= OBÓZ PRZYGOTOWAWCZY PRZED SEZONEM =================
// [klucz, miejscowość, państwo, flaga, dni, koszt bazowy, {kon,zgr,tak,mor,reg,inj}, opis]
const CAMPS=[
 ['spala','Spała (COS)','Polska','🇵🇱',10,120000,{kon:1,zgr:2,tak:2,mor:0,reg:1,inj:1},'Centralny Ośrodek Sportu: hale, siłownie i spokój. Dobra baza do pracy nad zgraniem i taktyką.'],
 ['szczyrk','Szczyrk','Polska','🇵🇱',7,110000,{kon:1.5,zgr:1,tak:1,mor:1,reg:1,inj:1},'Krótki obóz w Beskidach. Tanio, dobra atmosfera, umiarkowana praca nad kondycją.'],
 ['zakopane','Zakopane','Polska','🇵🇱',10,180000,{kon:2.5,zgr:1,tak:0.5,mor:0,reg:0,inj:1.3},'Klasyka: góry, biegi i siłownia. Duży przyrost kondycji, ale zawodnicy wrócą zmęczeni.'],
 ['cetniewo','Władysławowo (Cetniewo)','Polska','🇵🇱',7,140000,{kon:1.5,zgr:1.5,tak:0.5,mor:1,reg:1,inj:1},'Ośrodek nad morzem: siła, skoczność i siatkówka plażowa, która buduje zgranie.'],
 ['kopaonik','Kopaonik','Serbia','🇷🇸',10,160000,{kon:2.5,zgr:1,tak:1,mor:-1,reg:0,inj:1.2},'Tani obóz wysokogórski. Mocny bodziec kondycyjny, skromne warunki obniżają humor.'],
 ['saalfelden','Saalfelden','Austria','🇦🇹',10,380000,{kon:2,zgr:1.5,tak:1,mor:1,reg:2,inj:0.9},'Alpejski ośrodek z dobrą odnową biologiczną. Kondycja bez nadmiernego zmęczenia.'],
 ['lignano','Lignano Sabbiadoro','Włochy','🇮🇹',10,400000,{kon:1,zgr:2.5,tak:3,mor:1.5,reg:1.5,inj:0.9},'Włoskie centrum siatkówki: sparingpartnerzy z Serie A, świetna praca nad taktyką i zgraniem.'],
 ['belek','Belek','Turcja','🇹🇷',10,350000,{kon:1.5,zgr:2,tak:1.5,mor:2.5,reg:2.5,inj:0.8},'Ciepło, hotel z pełnym zapleczem. Zawodnicy wracają wypoczęci i zadowoleni.'],
 ['livigno','Livigno','Włochy','🇮🇹',14,520000,{kon:3.5,zgr:1.5,tak:1,mor:0.5,reg:0.5,inj:1.4},'Długi obóz na 1800 m n.p.m. Największy przyrost kondycji i siły, wyższe ryzyko urazów.'],
 ['teneryfa','Teneryfa','Hiszpania','🇪🇸',12,600000,{kon:2,zgr:2.5,tak:2,mor:3,reg:2.5,inj:0.8},'Najdroższa opcja: wysokogórski trening w słońcu i komfort. Mocny plus we wszystkim.']];
const CAMP_FX=[['kon','Kondycja'],['zgr','Zgranie'],['tak','Taktyka'],['mor','Morale'],['reg','Świeżość'],['inj','Urazy']];
function campCost(c){const rep=SAVE.ai?SAVE.ai[SAVE.team].rep:50;return round5k(c[5]*(0.8+rep/250)*(myTeam().players.length/14));}
function campOf(){const c=SAVE.camp;return c&&S()&&c.season===S().n?c:null;}
function campCanBook(){const s=S();return !campOf()&&(s.phase==='off'||s.phase==='spar'&&s.spar.res.length<nSpar());}
function campBook(k){const c=CAMPS.find(x=>x[0]===k);if(!c||!campCanBook())return;const cost=campCost(c);
  // obóz to jednorazowy wydatek przed sezonem, płacony z salda klubu (nie z miesięcznego budżetu operacyjnego)
  if(SAVE.fin.bal-cost<-500000){ui.campErr=`Za mało pieniędzy na obóz (${fmt(cost)}).`;render();return;}ui.campErr=null;
  if(ui.confirm!=='camp'+k){ui.confirm='camp'+k;render();return;}ui.confirm=null;
  money(-cost,'Obóz');finLog(`Obóz przygotowawczy: ${c[1]} (${c[2]})`,-cost);const s=S();
  SAVE.camp={k,season:s.n,cost,start:s.phase==='off'?null:addDays(today(),1),until:s.phase==='off'?null:addDays(today(),c[4]),done:0};
  news(`🏕️ Zarezerwowano obóz przygotowawczy: ${c[1]} (${c[2]}), ${c[4]} dni.${s.phase==='off'?' Ruszy razem z przygotowaniami do sezonu.':''}`);save();tradeMsg(true,`Obóz w ${c[1]} zarezerwowany.`);}
function campStart(){const c=campOf();if(!c||c.start)return;const d=CAMPS.find(x=>x[0]===c.k);c.start=today();achEv('camp');c.until=addDays(today(),d[4]);news(`🚌 Drużyna wyjeżdża na obóz: ${d[1]} (${d[2]}). Powrót ${fmtDMY(c.until)}.`);}
function campDay(d){const c=campOf();if(!c||c.done||!c.until||d<c.until)return;const C=CAMPS.find(x=>x[0]===c.k);const fx=C[6];c.done=1;const t=myTeam();const rows=[];
  const k=0.9+staffSkill('fiz')/40;// trener przygotowania fizycznego wzmacnia efekt
  for(const p of t.players){if(p.inj)continue;p.xp=p.xp||{};const ups=[];
    for(const a of ['kon','szy','sil','sko']){if(p[a]>=20)continue;const v=(p.xp[a]||0)+fx.kon*0.28*k*(0.7+R()*0.6)*(p.age>=31?0.7:1);if(v>=1){p[a]++;p.xp[a]=Math.round((v-1)*100)/100;ups.push(a);}else p.xp[a]=Math.round(v*1000)/1000;}
    for(const a of ['czy','kom']){if(p[a]>=20)continue;const v=(p.xp[a]||0)+fx.tak*0.22*(0.7+R()*0.6);if(v>=1){p[a]++;p.xp[a]=Math.round((v-1)*100)/100;ups.push(a);}else p.xp[a]=Math.round(v*1000)/1000;}
    addMor(p,fx.mor*5);p.fr=Math.round(clamp(72+fx.reg*8+(R()*6-3),40,100));
    if(R()<0.025*fx.inj*(1.25-p.kon/20*0.5)){const days=Math.max(3,Math.round(4+R()*10));p.inj=days;p.injUntil=addDays(d,days);p.injN=injName(days);p.injD=days;rows.push([p.id,p.last,ups,days]);continue;}
    rows.push([p.id,p.last,ups,0]);}
  // zgranie par
  const P=SAVE.pairs||(SAVE.pairs={});const ps=t.players;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const key=pairKey(ps[i].id,ps[j].id);P[key]=(P[key]!=null?P[key]:pairN(ps[i],ps[j]))+Math.round(fx.zgr*3);}
  const up=rows.filter(r=>r[2].length).length,inj=rows.filter(r=>r[3]);
  sendMail({cat:'trening',from:asyName(),t:`Obóz w ${C[1]} zakończony`,s:`${up} zawodników poprawiło cechy fizyczne${inj.length?`, kontuzje: ${inj.length}`:''}.`,b:{type:'camp',k:c.k,rows,cost:c.cost},lab:'Obóz'});
  news(`🏕️ Koniec obozu w ${C[1]}. Drużyna wraca do klubu.`);}
function campMailHtml(b){const C=CAMPS.find(x=>x[0]===b.k);const fx=C[6];
  return `<p class="mtext">Wróciliśmy z obozu w ${esc(C[1])} (${C[3]} ${esc(C[2])}, ${C[4]} dni, koszt ${fmt(b.cost)}). Podsumowanie:</p>
   <div class="mxbox" style="max-width:420px">${campFx(fx)}</div>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Podniesione cechy</th><th>Uraz</th></tr></thead><tbody>${b.rows.map(r=>`<tr><td class="l"><button class="link pn" onclick="openPop('${r[0]}')">${esc(r[1])}</button></td><td class="l">${r[2].map(a=>`<span class="trt tu-up">${attrSh(a)} +1</span>`).join('')||'<span class="mut">—</span>'}</td><td>${r[3]?`<span class="bad">🚑 ${r[3]} dni</span>`:'<span class="mut">—</span>'}</td></tr>`).join('')}</tbody></table></div>
   <p class="small mut">Zgranie par wzrosło (Centrum danych), a zajęcia taktyczne poprawiły czytanie gry i komunikację.</p>`;}
function campLvl(v,k){if(k==='inj')return v>=1.2?'wysokie':v>=1?'normalne':'niskie';if(v<0)return 'spadek';return v<=0?'brak':v<=1?'mały':v<=2?'średni':v<=3?'duży':'bardzo duży';}
function campRow(k,n,v){if(k==='inj'){const c=v>=1.2?'bad':v>=1?'mid':'good';return `<div class="cfx"><span class="cfn">${n}</span><span class="cfpill ${c}">${campLvl(v,k)}</span></div>`;}
  const seg=v<0?1:Math.max(0,Math.min(5,Math.round(v/3.5*5)));const c=v<0?'bad':'good';
  return `<div class="cfx"><span class="cfn">${n}</span><span class="cfbar ${c}">${Array.from({length:5},(_,i)=>`<i class="${i<seg?'on':''}"></i>`).join('')}</span><span class="cfv ${v<0?'bad':v<=0?'mut':''}">${campLvl(v,k)}</span></div>`;}
function campFx(fx){return `<div class="cfxl">${CAMP_FX.map(([k,n])=>campRow(k,n,fx[k])).join('')}</div>`;}
function campCard(){const c=campOf();const s=S();
  if(c){const C=CAMPS.find(x=>x[0]===c.k);return `<div class="card"><h2>Obóz przygotowawczy</h2><div class="campsel"><span class="campflag">${C[3]}</span><div><b>${esc(C[1])}</b> <span class="mut small">${esc(C[2])} · ${C[4]} dni · ${fmt(c.cost)}</span><div class="small">${c.done?'<span class="good">Obóz zakończony — raport w poczcie.</span>':c.start?`Trwa: ${fmtShort(c.start)} – ${fmtShort(c.until)}`:'Wyjazd razem ze startem przygotowań do sezonu.'}</div></div></div></div>`;}
  if(!campCanBook())return '';
  return `<div class="card"><h2>Obóz przygotowawczy</h2><p class="small mut">Wybierz miejsce obozu przed sezonem. Każde daje inne korzyści i kosztuje inaczej. Efekt wzmacnia trener przygotowania fizycznego. Jeden obóz na sezon${s.phase==='off'?'; wyjazd nastąpi razem ze startem przygotowań':'; wyjazd jutro'}.</p>
   ${ui.campErr?`<div class="tmsg no">${esc(ui.campErr)}</div>`:''}<div class="campgrid">${CAMPS.map(C=>{const cost=campCost(C);const fx=C[6];return `<div class="campc ${ui.confirm==='camp'+C[0]?'on':''}"><div class="camph"><span class="campflag">${C[3]}</span><div class="campt"><b>${esc(C[1])}</b><span>${esc(C[2])} · ${C[4]} dni</span></div><div class="campp"><b>${fmt(cost)}</b><span>${fmt(Math.round(cost/C[4]))}/dzień</span></div></div>
     <p class="campd">${esc(C[7])}</p>${campFx(fx)}
     <button class="${ui.confirm==='camp'+C[0]?'btn':'ghost'} sm" style="margin-top:12px;width:100%" onclick="campBook('${C[0]}')">${ui.confirm==='camp'+C[0]?`Potwierdź: zapłacisz ${fmt(cost)}`:'Wybierz'}</button>${ui.confirm==='camp'+C[0]?`<div class="small mut" style="margin-top:6px">Płatne jednorazowo z salda klubu: ${fmt(SAVE.fin.bal)} → ${fmt(SAVE.fin.bal-cost)}</div>`:''}</div>`;}).join('')}</div></div>`;}

// ================= TRENING: zakładki, intensywność dnia, zadowolenie, postawa, indywidualny, mentoring, odpoczynek, trenerzy =================
// p.itr={f:jednostka|null,i:0/1/2} — trening indywidualny; p.restUntil — wolne do dnia; SAVE.trn.ment=[[id,...]] — grupy mentorskie; SAVE.trn.ar — automatyczny odpoczynek
const IND_INT=[{n:'Lżej',l:0.7,d:0.88,r:0.6},{n:'Normalnie',l:1,d:1,r:1},{n:'Mocniej',l:1.25,d:1.15,r:1.8}];
const IND_FOCUS=['zag','prz','ata','blo','obr','roz','sil','tak'];
const IND_SUG={R:'roz',A:'ata',P:'prz',S:'blo',L:'obr'};
function itrOf(p){const i=p.itr||{};return {f:i.f||null,i:i.i==null?1:i.i};}
function setItr(id,k,v){const P=PLAYERS[id];if(!P)return;const p=P.p;p.itr=Object.assign(itrOf(p),{[k]:v===''?null:v});save();render();}
// ---- mentoring ----
function mentGroups(){const t=ensTrn();if(!t.ment)t.ment=[];const mine=new Set(myTeam().players.map(p=>p.id));t.ment=t.ment.map(g=>g.filter(id=>mine.has(id))).filter(g=>g.length>=1);return t.ment;}
function mentLead(g){const ps=g.map(id=>PLAYERS[id]&&PLAYERS[id].p).filter(Boolean);return ps.sort((a,b)=>mentScore(b)-mentScore(a))[0];}
function mentScore(p){return p.age+(hasT(p,'lid')?6:0)+(hasT(p,'pro')?4:0)+(hasT(p,'pra')?3:0)+(hasT(p,'oby')?2:0)+rating(p)/10;}
function mentGroupOf(id){return mentGroups().find(g=>g.includes(id));}
function mentorK(p){const g=SAVE.trn&&SAVE.trn.ment&&SAVE.trn.ment.find(x=>x.includes(p.id));if(!g||g.length<2||p.age>24)return 1;const L=mentLead(g);if(!L||L.id===p.id)return 1;
  return 1+(hasT(L,'pro')?0.05:0)+(hasT(L,'pra')?0.05:0)+(hasT(L,'amb')||hasT(L,'suk')?0.03:0)+(L.age>=29?0.03:0)-(hasT(L,'len')?0.06:0);}
function mentAdd(id){const gi=+(ui.mentG||0);const G=mentGroups();if(mentGroupOf(id))return;if(!G[gi]){if(G.length>=4)return;G.push([]);}const g=G[Math.min(gi,G.length-1)];if(g.length>=4)return;g.push(id);save();render();}
function mentDel(id){const t=ensTrn();t.ment=mentGroups().map(g=>g.filter(x=>x!==id)).filter(g=>g.length);save();render();}
function mentNew(){const G=mentGroups();if(G.length>=4)return;G.push([]);ui.mentG=G.length-1;save();render();}
const MENT_POS=['pro','pra','amb','zde','spo','oby','suk'],MENT_NEG=['len','kap','ner'];
function mentWeekly(){for(const g of mentGroups()){if(g.length<2)continue;const L=mentLead(g);if(!L)continue;
  for(const id of g){if(id===L.id)continue;const p=PLAYERS[id]&&PLAYERS[id].p;if(!p||p.age>24)continue;ensTraits(p);p.tcTm===SAVE.team&&(p.tc=Math.min(60,(p.tc||0)+0.4));
    const pos=MENT_POS.filter(k=>hasT(L,k)&&!hasT(p,k));if(pos.length&&p.tr.length<4&&R()<0.035){const k=pos[Math.floor(R()*pos.length)];p.tr.push(k);news(`🤝 Mentoring: ${p.first} ${p.last} przejął od ${L.last} cechę „${TRAITS[k][0]}”.`);}
    const bad=MENT_NEG.filter(k=>hasT(p,k));if(bad.length&&(hasT(L,'pro')||hasT(L,'spo')||hasT(L,'lid'))&&R()<0.03){const k=bad[0];p.tr=p.tr.filter(x=>x!==k);news(`🤝 Mentoring: dzięki ${L.last} ${p.first} ${p.last} nie jest już „${TRAITS[k][0].toLowerCase()}”.`);}
    const neg=MENT_NEG.filter(k=>hasT(L,k)&&!hasT(p,k));if(neg.length&&p.tr.length<4&&R()<0.025){const k=neg[0];p.tr.push(k);news(`⚠️ Mentoring: ${p.first} ${p.last} przejął od ${L.last} złą cechę „${TRAITS[k][0]}”.`);}}}}
// ---- odpoczynek ----
function restSet(id,days){const P=PLAYERS[id];if(!P)return;const p=P.p;if(!days)delete p.restUntil;else p.restUntil=addDays(today(),days);save();render();}
function trxDaily(d){if(SAVE.team==null||!SAVE.world||!S())return;const t=ensTrn();
  if(t.ar){const md=matchDays();const tom=addDays(d,1);if(!md.has(tom))for(const p of myTeam().players){if(p.inj||(p.restUntil&&p.restUntil>=tom))continue;if(frOf(p)<(t.ar||45)){p.restUntil=tom;}}}
  if(dow(d)===1)try{mentWeekly();}catch(e){console.error(e);}}
{const _md=mailDaily;mailDaily=function(d){_md(d);try{trxDaily(d);}catch(e){console.error(e);}};}
// ---- pochwała / krytyka po treningu ----
function lastScores(id,days){const r=(SAVE.trn&&SAVE.trn.rep)||[];let s=0,n=0;for(const x of r.slice(0,days||7)){const q=x.p&&x.p[id];if(q&&q.s!=null){s+=q.s;n++;}}return n?s/n:null;}
function trTalk(id,praise){const P=PLAYERS[id];if(!P)return;const p=P.p;if(p.trTalk&&daysBetween(p.trTalk,today())<7){ui.trMsg={ok:0,t:'Rozmawiałeś już z nim w tym tygodniu.'};render();return;}p.trTalk=today();const sc=lastScores(id)||6;let t;
  if(praise){if(sc>=6.5){addMor(p,4);relAdd(p,2);formAdd(p,2);t=`${p.last} docenia pochwałę — morale i forma w górę.`;}else{addMor(p,1);t=`${p.last} przyjął pochwałę z zaskoczeniem — na treningach nie błyszczał.`;}}
  else{if(hasT(p,'pro')||hasT(p,'zde')||hasT(p,'amb')||hasT(p,'sta')){addMor(p,-1);p.trB={v:0.4,until:addDays(today(),7)};formAdd(p,1);t=`${p.last} wziął krytykę do siebie i obiecał więcej pracy.`;}
    else if(hasT(p,'kap')||hasT(p,'ner')||hasT(p,'ind')){addMor(p,-6);relAdd(p,-4);p.unh=(p.unh||0)+1;t=`${p.last} źle zniósł krytykę — jest obrażony.`;}
    else if(sc<6){addMor(p,-2);p.trB={v:0.25,until:addDays(today(),7)};t=`${p.last} przyznał, że ostatnio trenował słabo.`;}else{addMor(p,-4);relAdd(p,-2);t=`${p.last} uważa krytykę za niesprawiedliwą.`;}}
  ui.trMsg={ok:1,t};save();render();}
// ---- zadowolenie z treningu ----
function trSat(p){const s=lastScores(p.id);const it=itrOf(p);const why=[];
  if(hasT(p,'len')&&it.i===2)why.push('za ciężki trening indywidualny');if((hasT(p,'amb')||hasT(p,'suk'))&&it.i===0)why.push('chce trenować mocniej');
  if(frOf(p)<40)why.push('przemęczony');if(s!=null&&s<5.3)why.push('słabo mu idzie');
  const wk=planWarnings(Array.from({length:7},(_,k)=>addDays(today(),k+1)),matchDays()).length;if(wk>=2&&(hasT(p,'kap')||hasT(p,'len')))why.push('źle ułożony plan');
  return {ok:!why.length&&(s==null||s>=5.8),why};}
// ---- ryzyko urazu ----
function trRisk(p){const it=itrOf(p);let v=(100-frOf(p))/100*0.55+(reinjF(p)-1)*0.8+(IND_INT[it.i].r-1)*0.4+(p.age>=31?0.12:0)+(p.kon<10?0.1:0);const why=[];
  if(frOf(p)<55)why.push('zmęczenie');if(reinjF(p)>1.05)why.push('świeżo po urazie');if(it.i===2)why.push('mocny trening indywidualny');if(p.age>=31)why.push('wiek');if(p.kon<10)why.push('słaba kondycja');
  return {v,l:v>=0.45?'Wysokie':v>=0.25?'Średnie':'Niskie',c:v>=0.45?'bad':v>=0.25?'':'good',why};}
// ---- intensywność dnia (w porównaniu z obciążeniem meczu) ----
function dayLoad(d,md){if(md.has(d))return 100;const u=dayPlan(d,md).filter(Boolean);const lm=[0.75,1,1.3][(SAVE.training||{}).int||1];return Math.round(clamp(u.reduce((s,x)=>s+Math.max(0,TR_UNITS[x].load),0)*lm/20*100,0,140));}
function loadBar(v){const c=v>=95?'#ef4444':v>=60?'#eab308':'#22c55e';return `<div class="trld" title="Obciążenie ${v}% meczu"><i style="width:${Math.min(100,v)}%;background:${c}"></i></div><small class="mut">${v}%</small>`;}
// ---- struktura sesji ----
const TR_GRP=[['Technika',['zag','prz','ata','blo','obr','roz'],'#3b82f6'],['Fizyczne',['sil'],'#a855f7'],['Taktyka',['tak'],'#0ea5e9'],['Zespół',['int'],'#f59e0b'],['Regeneracja i wolne',['reg','off'],'#64748b']];
function pieSvg(parts){const tot=parts.reduce((s,x)=>s+x[1],0)||1;let a=-Math.PI/2;const r=46,c=50;let out='';
  for(const [n,v,col] of parts){if(!v)continue;const a2=a+v/tot*Math.PI*2;const big=a2-a>Math.PI?1:0;const x1=c+r*Math.cos(a),y1=c+r*Math.sin(a),x2=c+r*Math.cos(a2),y2=c+r*Math.sin(a2);
    out+=v===tot?`<circle cx="${c}" cy="${c}" r="${r}" fill="${col}"/>`:`<path d="M${c},${c} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${big} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${col}"/>`;a=a2;}
  return `<svg viewBox="0 0 100 100" width="120" height="120">${out}</svg>`;}
// ---- reżimy (gotowe plany tygodnia) ----
const TR_REZ=[
 ['mikro','Mikrocykl meczowy (1 mecz w tygodniu)','Siła na początku tygodnia, technika w środku, taktyka przed meczem, regeneracja po meczu.',[['sil','prz','off'],['ata','blo','off'],['zag','obr','int'],['sil','roz','off'],['tak','prz','off'],['tak','off','off'],['reg','off','off']]],
 ['dwa','Dwa mecze w tygodniu','Mniej siły, więcej regeneracji i taktyki — świeżość na oba mecze.',[['reg','prz','off'],['tak','zag','off'],['tak','off','off'],['reg','off','off'],['ata','obr','off'],['tak','off','off'],['reg','off','off']]],
 ['przyg','Okres przygotowawczy','Dużo siły i techniki — szybki rozwój, ale zmęczenie i większe ryzyko urazów. Najlepszy w sierpniu.',[['sil','prz','zag'],['sil','ata','blo'],['obr','roz','int'],['sil','zag','prz'],['ata','blo','off'],['tak','obr','off'],['reg','off','off']]],
 ['lekki','Lekki tydzień / regeneracja','Odpoczynek po ciężkim okresie: świeżość i forma wracają, rozwój wolniejszy.',[['reg','prz','off'],['zag','off','off'],['tak','int','off'],['reg','roz','off'],['obr','off','off'],['tak','off','off'],['off','off','off']]],
 ['mlodzi','Technika (młoda drużyna)','Najwięcej jednostek technicznych — dla drużyny z wieloma młodymi zawodnikami.',[['prz','zag','off'],['ata','roz','off'],['blo','obr','int'],['sil','prz','off'],['zag','ata','off'],['tak','off','off'],['reg','off','off']]]];
function rezApply(k){const t=ensTrn();const r=TR_REZ.find(x=>x[0]===k)||(t.myRez||[]).find(x=>x[0]===k);if(!r)return;t.week=JSON.parse(JSON.stringify(r[3]));t.mode='own';t.rez=r[1];ui.trTab='ov';save();render();}
function rezSave(){const t=ensTrn();const nm=(document.getElementById('rezn')||{}).value||'';if(!nm.trim())return;t.myRez=(t.myRez||[]).filter(x=>x[1]!==nm.trim()).slice(-4);t.myRez.push(['my'+Date.now().toString(36),nm.trim(),'Własny plan.',JSON.parse(JSON.stringify(t.week))]);t.rez=nm.trim();save();render();}
function rezDel(k){const t=ensTrn();t.myRez=(t.myRez||[]).filter(x=>x[0]!==k);save();render();}
// ---- trenerzy ----
const TR_COACH=[['asy','Technika (zagrywka, przyjęcie, atak, blok, obrona, rozegranie)','tech'],['fiz','Przygotowanie fizyczne','phys'],['psy','Cechy mentalne','ment'],['med','Regeneracja i powrót po urazach','inj'],['jr','Juniorzy','jr'],['sta','Taktyka i analiza rywala','tac']];
function coachStars(sk){const v=Math.round(sk/4*2)/2;let s='';for(let i=1;i<=5;i++)s+=v>=i?'★':v>=i-0.5?'⯪':'☆';return `<span style="color:#eab308;letter-spacing:1px" title="${sk}/20">${s}</span>`;}
// ================= WIDOK =================
const TRX_TABS=[['ov','Widok ogólny'],['ind','Indywidualny'],['ment','Mentoring'],['rest','Odpoczynek'],['rez','Reżimy'],['coach','Trenerzy']];
function trxHead(){const trn=ensTrn();const asy=SAVE.staff&&SAVE.staff.asy;const W=teamWeak();
  return `<div class="card"><div class="row wrap" style="gap:16px;align-items:center">
   <div><div class="small mut">OBOWIĄZKI TRENINGOWE</div><select onchange="setTrMode(this.value)"><option value="own" ${trn.mode==='own'?'selected':''}>Ja (sam układam plan)</option><option value="asy" ${trn.mode==='asy'?'selected':''} ${asy?'':'disabled'}>${asy?`${esc(asy.first)} ${esc(asy.last)} — asystent (${asy.skill}/20)`:'Asystent — brak w sztabie'}</option></select></div>
   <div><div class="small mut">STYL TRENINGU W TYM TYGODNIU</div><b>${trn.mode==='asy'?`Asystent: nacisk na ${TR_UNITS[W[0]].n.toLowerCase()} i ${TR_UNITS[W[1]].n.toLowerCase()}`:esc(trn.rez||'Własny plan')}${trn.mode==='own'&&trn.rez&&JSON.stringify(trn.week)!==JSON.stringify(((TR_REZ.find(x=>x[1]===trn.rez)||(trn.myRez||[]).find(x=>x[1]===trn.rez)||[])[3])||null)?' <span class="mut">(zmodyfikowany)</span>':''}</b></div>
   <span class="sp"></span><div class="seg">${TRX_TABS.map(([k,l])=>`<button class="${(ui.trTab||'ov')===k?'on':''}" onclick="ui.trTab='${k}';render()">${l}</button>`).join('')}</div></div>
   ${ui.trMsg?`<div class="small ${ui.trMsg.ok?'good':'bad'}" style="margin-top:6px">${esc(ui.trMsg.t)}</div>`:''}</div>`;}
function trxOvCards(){const t=myTeam();const ps=t.players;
  const sat=ps.map(p=>({p,s:trSat(p)}));const ok=sat.filter(x=>x.s.ok),bad=sat.filter(x=>!x.s.ok);
  const satC=`<div class="card"><h2>Zadowolenie z treningu</h2>${bad.length<=2?`<p>👍 <b>Ogólnie zadowoleni z treningów</b></p>`:bad.length<=5?`<p>😐 <b>Część zawodników narzeka</b></p>`:`<p>👎 <b>Drużyna jest niezadowolona z treningów</b></p>`}
    <p class="small mut">${ok.slice(0,2).map(x=>esc(x.p.last)).join(', ')}${ok.length>2?` i ${ok.length-2} innych`:''} — zadowoleni.</p>
    ${bad.slice(0,6).map(x=>`<div class="res small">⚠️ <button class="link pn" onclick="openCard('${x.p.id}')">${esc(x.p.last)}</button> — ${esc(x.s.why.join(', ')||'słabe oceny')}</div>`).join('')}</div>`;
  const rated=ps.map(p=>({p,s:lastScores(p.id)})).filter(x=>x.s!=null).sort((a,b)=>b.s-a.s);
  const row=(x,best)=>`<div class="row wrap" style="gap:8px;align-items:center;padding:8px;border-radius:8px;background:${best?'rgba(34,197,94,.18)':'rgba(239,68,68,.18)'};margin:4px 0"><b><button class="link pn" onclick="openCard('${x.p.id}')">${esc(x.p.first)} ${esc(x.p.last)}</button></b><span class="sp"></span><span class="small mut">ocena treningu</span> <b>${fx1(x.s)}</b>
    <button class="ghost sm" onclick="trTalk('${x.p.id}',${best?1:0})">${best?'👏 Pochwal':'🗣️ Skrytykuj'}</button></div>`;
  const postC=`<div class="card"><h2>Postawa na treningach</h2>${rated.length?`<div class="small mut">NAJLEPSZY</div>${row(rated[0],1)}${rated[1]?`<div class="small mut res">${esc(rated[1].p.last)} · ${fx1(rated[1].s)}</div>`:''}
    <div class="small mut" style="margin-top:8px">NAJSŁABSZY</div>${row(rated[rated.length-1],0)}${rated.length>2?`<div class="small mut res">${esc(rated[rated.length-2].p.last)} · ${fx1(rated[rated.length-2].s)}</div>`:''}
    <p class="small mut">Pochwała podnosi morale. Krytyka działa na profesjonalistów i ambitnych, ale kapryśni i nerwowi się obrażą. Z każdym zawodnikiem raz w tygodniu.</p>`:'<p class="mut">Oceny pojawią się po pierwszych treningach.</p>'}</div>`;
  const c=(typeof myNext==='function')?myNext():null;const tp=tacPrep();
  const prepC=`<div class="card"><h2>Przygotowanie do meczu</h2>${c&&c.h!=null?`<p>Najbliższy rywal: <b>${tName(c.h===SAVE.team?c.a:c.h)}</b> (${c.h===SAVE.team?'u siebie':'na wyjeździe'}).</p>`:''}<p class="small">Jednostki taktyki w ostatnich 2 dniach: <b>${tp}/3</b> — ${tp>=2?'<span class="good">zespół dobrze zna plan na mecz</span>':tp===1?'przygotowanie podstawowe':'<span class="bad">brak odprawy taktycznej przed meczem</span>'}.</p>
    <p class="small mut">Taktyka dzień przed meczem i w dniu meczu daje bonus w meczu. Odprawę (zagrywka, blok, rozegranie) ustawisz w zapowiedzi meczu.</p></div>`;
  const md=matchDays();const cnt={};for(let k=1;k<=7;k++){for(const u of dayPlan(addDays(today(),k),md))if(u)cnt[u]=(cnt[u]||0)+1;}
  const parts=TR_GRP.map(([n,us,col])=>[n,us.reduce((s,u)=>s+(cnt[u]||0),0),col]);
  const strC=`<div class="card"><h2>Struktura sesji (7 dni)</h2><div class="row" style="gap:16px;align-items:center">${pieSvg(parts)}<div>${parts.map(([n,v,col])=>`<div class="small"><span style="display:inline-block;min-width:22px;text-align:center;border-radius:10px;background:${col};color:#fff;margin-right:6px">${v}</span>${n}</div>`).join('')}</div></div></div>`;
  const rk=ps.filter(p=>!p.inj).map(p=>({p,r:trRisk(p)})).sort((a,b)=>b.r.v-a.r.v);const inj=ps.filter(p=>p.inj);
  const medC=`<div class="card"><h2>Centrum medyczne</h2><div class="row" style="gap:24px"><div><small class="mut">KONTUZJE</small><div class="big" style="font-size:22px">${inj.length}</div></div><div><small class="mut">ZAGROŻENI</small><div class="big" style="font-size:22px">${rk.filter(x=>x.r.l==='Wysokie').length}</div></div></div>
    ${rk.slice(0,6).map(x=>`<div class="res row small"><button class="link pn" onclick="openCard('${x.p.id}')">${esc(x.p.last)}</button><span class="sp"></span><b class="${x.r.c}">${x.r.l} ryzyko</b><span class="mut" style="margin-left:6px">${esc(x.r.why.join(', ')||'—')}</span></div>`).join('')}
    <button class="link small" onclick="ui.trTab='rest';render()">Zaplanuj odpoczynek →</button></div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;align-items:start">${satC}${postC}${prepC}${strC}${medC}</div>`;}
function trxInd(){const t=myTeam();const ps=t.players.slice().sort((a,b)=>({R:0,A:1,P:2,S:3,L:4})[a.pos]-({R:0,A:1,P:2,S:3,L:4})[b.pos]||rating(b)-rating(a));
  return `<div class="card"><h2>Trening indywidualny</h2><p class="small mut">Każdy zawodnik może mieć własny nacisk (trochę zmęczenia): cały element gry (np. przyjęcie — kilka cech po trochu) albo jedną konkretną cechę (np. skoczność — szybszy wzrost tylko tej cechy) oraz intensywność. Mocniej = szybszy rozwój, ale większe zmęczenie i ryzyko urazu; lżej = odwrotnie. Leniwi nie lubią „mocniej”, ambitni nie lubią „lżej”.</p>
  <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Wiek</th><th class="l">Świeżość</th><th class="l">Nacisk indywidualny</th><th class="l">Intensywność</th><th>Ocena tr.</th><th class="l">Nastawienie</th></tr></thead><tbody>
  ${ps.map(p=>{const it=itrOf(p);const s=trSat(p);const sug=IND_SUG[p.pos];return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small></td><td>${p.age}</td><td class="l">${frBar(p)}</td>
    <td class="l"><select onchange="setItr('${p.id}','f',this.value)"><option value="">— brak —</option><optgroup label="Element gry (kilka cech naraz)">${IND_FOCUS.map(u=>`<option value="${u}" ${it.f===u?'selected':''}>${TR_UNITS[u].ic} ${TR_UNITS[u].n}${u===sug?' (zalecane)':''}</option>`).join('')}</optgroup>${[['Umiejętności',ATTRS],['Fizyczne',PHYS],['Mentalne',MENTAL]].map(([g,A])=>`<optgroup label="Jedna cecha — ${g}">${A.map(a=>`<option value="a:${a[0]}" ${it.f==='a:'+a[0]?'selected':''}>${a[1]} (${p[a[0]]})${p[a[0]]>=20?' — maks.':''}</option>`).join('')}</optgroup>`).join('')}</select></td>
    <td class="l"><div class="seg">${IND_INT.map((x,i)=>`<button class="${it.i===i?'on':''}" onclick="setItr('${p.id}','i',${i})">${x.n}</button>`).join('')}</div></td>
    <td class="${scCls(lastScores(p.id))}">${fx1(lastScores(p.id))}</td><td class="l small ${s.ok?'good':'bad'}">${s.ok?'zadowolony':esc(s.why.join(', ')||'niezadowolony')}</td></tr>`;}).join('')}</tbody></table></div></div>`;}
function trxMent(){const G=mentGroups();const t=myTeam();const inG=new Set(G.flat());const gi=Math.min(+(ui.mentG||0),Math.max(0,G.length-1));
  return `<div class="card"><h2>Mentoring</h2><p class="small mut">Grupy 2–4 zawodników (maks. 4 grupy). Lider grupy (najstarszy, lider, profesjonalista) co tydzień wpływa na młodszych (do 24 lat): może przekazać cechy charakteru (pracowity, profesjonalista, ambitny…), oduczyć lenistwa i nerwowości — ale zły lider przekaże też złe cechy. Młodzi z dobrym mentorem rozwijają się do 15% szybciej.</p>
   <div class="row wrap" style="gap:12px">${G.map((g,i)=>{const L=mentLead(g);return `<div class="card" style="flex:1;min-width:220px;${i===gi?'outline:2px solid var(--acc)':''}" onclick="ui.mentG=${i};render()"><b>Grupa ${i+1}</b>
     ${g.map(id=>{const p=PLAYERS[id].p;return `<div class="res row small">${L&&L.id===id?'⭐ ':''}${esc(p.first[0])}. ${esc(p.last)} <small class="mut">${p.age} l. · ${(p.tr||[]).map(k=>TRAITS[k]?TRAITS[k][0]:'').join(', ')}</small><span class="sp"></span><button class="link" onclick="event.stopPropagation();mentDel('${id}')">✕</button></div>`;}).join('')||'<p class="mut small">Pusta — dodaj zawodników z listy poniżej.</p>'}
     ${g.length>=2&&L?`<p class="small mut">Lider: <b>${esc(L.last)}</b>${(hasT(L,'len')||hasT(L,'kap'))?' <span class="bad">— uwaga, ma złe cechy</span>':''}</p>`:''}</div>`;}).join('')}
   ${G.length<4?`<button class="ghost" onclick="mentNew()">＋ Nowa grupa</button>`:''}</div>
   ${G.length?`<h3>Dodaj do grupy ${gi+1}</h3><div class="row wrap" style="gap:6px">${t.players.filter(p=>!inG.has(p.id)).sort((a,b)=>b.age-a.age).map(p=>`<button class="ghost sm" onclick="ui.mentG=${gi};mentAdd('${p.id}')">${esc(p.last)} <small class="mut">${p.age}</small></button>`).join('')}</div>`:''}</div>`;}
function trxRest(){const t=myTeam();const trn=ensTrn();const ps=t.players.slice().sort((a,b)=>frOf(a)-frOf(b));
  return `<div class="card"><h2>Odpoczynek</h2><div class="row wrap" style="gap:10px;align-items:center"><label class="row" style="gap:6px"><input type="checkbox" ${trn.ar?'checked':''} onchange="ensTrn().ar=this.checked?45:0;save();render()"> Automatyczne wolne dla zmęczonych</label>
   ${trn.ar?`<select onchange="ensTrn().ar=+this.value;save();render()">${[35,45,55,65].map(v=>`<option value="${v}" ${trn.ar===v?'selected':''}>gdy świeżość poniżej ${v}%</option>`).join('')}</select>`:''}</div>
   <p class="small mut">Zawodnik na wolnym nie trenuje (nie rozwija się), ale szybko odzyskuje świeżość. Automat nie daje wolnego dzień przed meczem.</p>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Świeżość</th><th class="l">Ryzyko urazu</th><th class="l">Wolne</th></tr></thead><tbody>
   ${ps.map(p=>{const r=trRisk(p);const rest=p.restUntil&&p.restUntil>=addDays(today(),1);return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small></td><td class="l">${frBar(p)}</td><td class="l ${r.c}">${p.inj?'🚑 kontuzja':r.l}</td>
    <td class="l">${p.inj?'—':rest?`<span class="good">do ${fmtShort(p.restUntil)}</span> <button class="link" onclick="restSet('${p.id}',0)">anuluj</button>`:`<button class="ghost sm" onclick="restSet('${p.id}',1)">1 dzień</button> <button class="ghost sm" onclick="restSet('${p.id}',2)">2 dni</button> <button class="ghost sm" onclick="restSet('${p.id}',3)">3 dni</button>`}</td></tr>`;}).join('')}</tbody></table></div></div>`;}
function trxRez(){const t=ensTrn();const all=TR_REZ.concat(t.myRez||[]);
  return `<div class="card"><h2>Reżimy treningowe</h2><p class="small mut">Gotowe plany tygodnia. Wybranie reżimu przełącza na „Sam układam” — potem możesz go zmieniać w siatce.</p>
   ${all.map(r=>`<div class="res row wrap" style="gap:10px;align-items:center"><div style="flex:1;min-width:240px"><b>${esc(r[1])}</b>${t.rez===r[1]?' <span class="good small">(aktywny)</span>':''}<div class="small mut">${esc(r[2])}</div>
     <div class="small">${r[3].map((d,i)=>`<span class="mut">${WD[i]}</span> ${d.filter(u=>u!=='off').map(u=>TR_UNITS[u].ic).join('')||'🛋️'}`).join(' · ')}</div></div>
     <button class="btn sm" onclick="rezApply('${r[0]}')">Zastosuj</button>${r[0].startsWith('my')?`<button class="link" onclick="rezDel('${r[0]}')">usuń</button>`:''}</div>`).join('')}
   <h3>Zapisz obecny plan jako reżim</h3><div class="row wrap" style="gap:6px"><input id="rezn" placeholder="Nazwa, np. Tydzień pucharowy" maxlength="40"><button class="ghost" onclick="rezSave()">Zapisz</button></div></div>`;}
function trxCoach(){const m=clubMods(SAVE.team);
  return `<div class="card"><h2>Trenerzy</h2><p class="small mut">Kto w sztabie odpowiada za które elementy treningu. Lepszy trener = szybszy rozwój w jego obszarze. Pusty etat = obszar prowadzony słabo (jak trener 3/20).</p>
   <div class="tw"><table><thead><tr><th class="l">Obszar</th><th class="l">Trener</th><th class="l">Jakość</th><th>Wpływ</th></tr></thead><tbody>
   ${TR_COACH.map(([r,area,mk])=>{const s=SAVE.staff&&SAVE.staff[r];const sk=staffSkill(r);const eff=mk==='tech'?m.tech:mk==='phys'?m.phys:mk==='ment'?m.ment:mk==='jr'?m.jr:mk==='inj'?1/m.injDur:1+(sk-10)*0.01;
     return `<tr><td class="l">${area}</td><td class="l">${s?`${esc(s.first)} ${esc(s.last)}`:`<span class="mut">— brak (${ROLE_N[r]})</span>`}</td><td class="l">${coachStars(sk)} <small class="mut">${sk}/20</small></td><td class="${eff>=1.05?'good':eff<0.95?'bad':''}">${eff>=1?'+':''}${Math.round((eff-1)*100)}%</td></tr>`;}).join('')}</tbody></table></div>
   <p class="small"><button class="link" onclick="go('sztab')">Zatrudnij lub zmień trenerów (Klub → Sztab) →</button></p></div>`;}
// wstawienie paska intensywności do siatki tygodnia i nowe zakładki
{const _tv=trainingView;trainingView=function(){const tab=ui.trTab||'ov';if(tab!=='ov'){const v=tab==='ind'?trxInd():tab==='ment'?trxMent():tab==='rest'?trxRest():tab==='rez'?trxRez():trxCoach();return trxHead()+v;}
  let h=_tv.apply(this,arguments);const trn=ensTrn();const md=matchDays();const days=[];for(let k=1;k<=7;k++)days.push(addDays(today(),k));
  const cells=trn.mode==='own'?WD.map((w,i)=>{const d=days.find(x=>(dow(x)+6)%7===i);return `<td>${d?loadBar(dayLoad(d,md)):''}</td>`;}).join(''):days.map(d=>`<td>${loadBar(dayLoad(d,md))}</td>`).join('');
  const row=`<tr><th class="l small">Intensywność<br><small class="mut">% obciążenia meczu</small></th>${cells}</tr>`;
  const i=h.indexOf('</tbody></table></div>');if(i>0)h=h.slice(0,i)+row+h.slice(i);
  const j=h.indexOf('<div class="card"><h2>Intensywność</h2>');const cards=trxOvCards();h=j>0?h.slice(0,j)+cards+h.slice(j):h+cards;
  return trxHead()+h;};}

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
  const from=`${kierName()} (kierownik drużyny)`;
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

// kierownik drużyny — organizuje wyjazdy, obozy i logistykę (stała osoba w klubie)
function kierName(){if(!SAVE.kier||SAVE.kier.tm!==SAVE.team){const c=LG_C[SAVE.lg[SAVE.team]]||'PL';const [f,l]=natName(c);SAVE.kier={tm:SAVE.team,n:`${f} ${l}`};}return SAVE.kier.n;}
