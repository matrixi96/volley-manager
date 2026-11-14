// ================= ZARZĄDZANIE KLUBEM (Etap 3) =================
const POS_MIN={R:2,A:2,P:3,S:3,L:1};
const POS_STD={R:2,A:2,P:4,S:4,L:2};
const SQUAD_MAX=18,SQUAD_MIN=12;
const ALL_KEYS=ALL_ATTRS.map(a=>a[0]);
const PRIZE=[1000000,600000,400000,300000,150000,150000,150000,150000,50000,50000,50000,50000];
let ROUND_PLAYED=new Set();
function W(){return SAVE.world;}
function fmt(n){n=Math.round(n);const a=Math.abs(n);let s;if(a>=1e6)s=(n/1e6).toFixed(2).replace('.',',')+' mln';else if(a>=1e3)s=Math.round(n/1e3)+' tys.';else s=String(n);return s+' zł';}
function fmtFull(n){return Math.round(n).toLocaleString('pl-PL')+' zł';}
function round5k(x){return Math.max(5000,Math.round(x/5000)*5000);}
function pValue(p){const r=rating(p);const af=p.age<=22?1.35:p.age<=28?1.1:p.age<=31?0.85:p.age<=33?0.55:0.3;const pf=1+Math.max(0,(p.pot||r)-r)/35;return Math.max(10000,Math.round(Math.pow(Math.max(0,r-50)/40,2.5)*1500000*af*pf/10000)*10000);}
function wageDemand(p){const r=rating(p);return round5k(Math.max(40000,Math.pow(Math.max(0,r-45)/45,2)*700000)*(p.age>=33?0.8:1));}
function snap(p){const o={};for(const k of ALL_KEYS)o[k]=p[k];return o;}
function baseRating(p){return p.base?rating(Object.assign({},p,p.base)):rating(p);}
function potStars(p){const n=Math.max(1,Math.min(5,Math.round(((p.pot!=null?potSeen(p):rating(p))-62)/7)));return '★'.repeat(n)+'<span class="mut">'+'★'.repeat(5-n)+'</span>';}
function potBonus(age,r){const k=r>=85?0.5:r>=80?0.75:1;return k*(age<=21?3+R()*12:age<=24?2+R()*7:age<=27?R()*3:0);}
function initRep(t){return Math.round(clamp((teamStrength(t)-65)*3.5,20,90));}
function teamQ(t){return teamStrength(t)/5;}
function restoreDefs(){TEAMS.forEach((t,i)=>{const d=TEAM_DEFS[i];t.name=d.name;t.short=d.short;t.color=d.color;t.city='';});applyCustom();}
function resetTeams(){restoreDefs();TEAMS.forEach((t,i)=>{t.players=genTeam(TEAM_DEFS[i],i).players;});rebuildIndex();}
function hashN(id){let h=3;for(const c of String(id))h=(h*131+c.charCodeAt(0))>>>0;return h;}
function syncTeams(){for(const p of W().players){ensTraits(p);if(p.czy==null||p.kiw==null||p.kom==null){ensAttrs(p);if(p.base){p.base.czy=p.czy;p.base.kiw=p.kiw;p.base.kom=p.kom;}}
    if(!W().chemInit&&p.tcTm==null&&p.tm>=0&&!p.jr){p.tcTm=p.tm;p.tc=6+hashN(p.id)%35;}}W().chemInit=1;for(const t of TEAMS)t.players=W().players.filter(p=>p.tm===t.idx&&!p.jr);rebuildIndex();}
function initPlayerMeta(p,season,free){const r=rating(p);p.pot=Math.min(95,Math.round(r+potBonus(p.age,r)));p.inj=0;p.xp={};p.base=snap(p);
  if(free){p.wage=0;p.ce=0;}else{p.wage=round5k(wageDemand(p)*(0.85+R()*0.3));p.ce=season+(R()<0.2?0:1+Math.floor(R()*3));}}
function randPos(){const x=R()*14;return x<2?'R':x<4?'A':x<8?'P':x<12?'S':'L';}
function genPlayer(pos,q,age){const id='n'+(W().nextId++);
  const p={id,first:FIRST[Math.floor(R()*FIRST.length)],last:LAST[Math.floor(R()*LAST.length)],pos,num:0,age};
  const hh=HEIGHT[pos];p.h=Math.round(hh[0]+R()*(hh[1]-hh[0]));
  for(const [k] of ATTRS.concat(PHYS))p[k]=Math.round(clamp(q+TEMPL[pos][k]+nz()*2.2,1,20));
  for(const [k] of MENTAL)p[k]=Math.round(clamp(q-1+nz()*4,1,20));
  p.tc=0;setDob(p);ensTraits(p);return p;}
function assignNum(p,tm){const used=new Set(W().players.filter(x=>x.tm===tm&&x!==p).map(x=>x.num));if(p.num&&!used.has(p.num))return;for(let n=1;n<=40;n++)if(!used.has(n)){p.num=n;return;}}
function initWorld(){
  resetTeams();
  SAVE.world={players:[],nextId:1};
  const sn=SAVE.season?SAVE.season.n:1;
  for(const t of TEAMS)for(const p0 of t.players){const p=Object.assign({},p0,{tm:t.idx});initPlayerMeta(p,sn,false);setDob(p);W().players.push(p);}
  SAVE.ai=TEAMS.map(t=>({rep:initRep(t),bud:0}));
  for(const a of SAVE.ai)a.bud=round5k(200000+a.rep*15000+R()*300000);
  for(let i=0;i<20;i++){const age=20+Math.floor(R()*13);const p=genPlayer(randPos(),10+R()*3,age);p.tm=-1;initPlayerMeta(p,1,true);W().players.push(p);}
  const rep=SAVE.ai[SAVE.team].rep;
  SAVE.fin={bal:round5k(1000000+rep*15000),log:[],sea:{},prev:null};
  SAVE.training={focus:'bal',int:1};
  SAVE.news=[];SAVE.inbox=[];
  syncTeams();initClub();
}
function news(t){SAVE.news=SAVE.news||[];SAVE.news.unshift({d:today(),t});SAVE.news=SAVE.news.slice(0,40);}
function money(amt,cat){const f=SAVE.fin;f.bal+=amt;f.sea[cat]=(f.sea[cat]||0)+amt;}
function finLog(t,a){const f=SAVE.fin;f.log.unshift({d:today(),t,a});f.log=f.log.slice(0,80);}
function payroll(){return myTeam().players.reduce((s,p)=>s+(p.wage||0),0);}
function sponsorAmt(){return 1800000+SAVE.ai[SAVE.team].rep*30000;}
const TV_ROUND=30000,TICKET=35;
function ticketIncome(mult,est){const rep=SAVE.ai[SAVE.team].rep;const L=myInfra().hala;const att=Math.min(HALA_CAP[L-1],Math.round((1400+rep*25)*(1+0.05*(L-1))*(est?1:0.85+R()*0.3)*mult));return {att,inc:att*TICKET};}

// ---- trening / rozwój / kontuzje ----
const TRAIN_FOCUS=[['bal','Zrównoważony','Rozwój wszystkich cech, z naciskiem na te ważne dla pozycji.',[]],['atk','Atak','Atak, siła, skoczność.',['ata','sil','sko']],['def','Przyjęcie i obrona','Przyjęcie, obrona, odbicie dołem, zwinność.',['prz','obr','tod','zwi']],['blk','Blok','Blok, skoczność, szybkość.',['blo','sko','szy']],['srv','Zagrywka','Zagrywka i siła.',['zag','sil']],['set','Rozegranie','Rozegranie i odbicie palcami.',['roz','tpa']],['phy','Przygotowanie fizyczne','Siła, szybkość, skoczność, zwinność, kondycja.',['sil','szy','sko','zwi','kon']],['men','Mentalny','Koncentracja, opanowanie, zaangażowanie, waleczność.',['kcj','opa','zaa','wal']]];
const TRAIN_INT=[['Lekki',0.7,0.6,'Wolniejszy rozwój, mniej kontuzji.'],['Normalny',1,1,'Balans rozwoju i ryzyka.'],['Ciężki',1.35,1.8,'Szybszy rozwój, ale prawie 2× więcej kontuzji.']];
const GRP={};for(const [k] of ATTRS)GRP[k]='tech';for(const [k] of PHYS)GRP[k]='phys';for(const [k] of MENTAL)GRP[k]='ment';
function develop(p,focus,intI,played,mods,jr,km){
  const r=rating(p);const gap=(p.pot||r)-r;if(gap<=0)return;
  const af=p.age<=20?1:p.age<=23?0.75:p.age<=26?0.45:p.age<=29?0.2:0.05;
  const tm=(hasT(p,'amb')?1.15:1)*(hasT(p,'pra')?1.2:1)*(hasT(p,'len')?0.78:1)*(hasT(p,'pro')?1.05:1);
  const pts=tm*af*TRAIN_INT[intI][1]*(played?1.25:1)*Math.min(1.5,0.5+gap/20)*0.17*(mods?(jr?mods.jr:mods.all):1)*(km==null?1:km);
  const fk=(TRAIN_FOCUS.find(f=>f[0]===focus)||TRAIN_FOCUS[0])[3];const pw=WEIGHTS[p.pos];
  const w={};let tot=0;for(const k of ALL_KEYS){let x=0.3;if(pw[k])x+=1.5;if(fk.includes(k))x+=3;w[k]=x;tot+=x;}
  p.xp=p.xp||{};
  for(const k of ALL_KEYS){if(p[k]>=20)continue;const v=(p.xp[k]||0)+pts*w[k]/tot*(mods?mods[GRP[k]]:1);if(v>=1){p[k]++;p.xp[k]=Math.round((v-1)*100)/100;}else p.xp[k]=Math.round(v*1000)/1000;}
}
function injuryCheck(m,mult){
  for(const sd of m.sides){const mine=sd.team.idx===SAVE.team;const md=clubMods(sd.team.idx);const im=(mine?TRAIN_INT[SAVE.training.int][2]:1)*md.injChance;
    for(const cp of sd.pl){const x=cp.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;ROUND_PLAYED.add(cp.id);
      const P=PLAYERS[cp.id];if(!P)continue;const p=P.p;if(p.inj)continue;
      if(R()<0.012*im*(1.3-p.kon/20*0.6)*mult){const d=1+Math.floor(R()*R()*7);const days=Math.max(3,Math.round((d*7-3+R()*6)*md.injDur));p.inj=days;p.injUntil=addDays(today(),days);if(!mine)aiStarInjNews(p,days);if(mine)news(`🚑 ${p.first} ${p.last} doznał kontuzji — przerwa ok. ${days} dni (powrót ok. ${fmtDMY(p.injUntil)}).`);}}}
}
function roundTick(kind,home,att){
  const tr=SAVE.training;
  const MODS={};const mm=ti=>MODS[ti]||(MODS[ti]=clubMods(ti));
  for(const p of W().players){
    if(p.tm<0)continue;const mine=p.tm===SAVE.team;
    if(mine&&!p.jr){if(ROUND_PLAYED.has(p.id))develop(p,'bal',tr.int,true,mm(p.tm),false,0.3);continue;}// reszta rozwoju: codzienne treningi (training.js)
    develop(p,mine?(tr.focus||'bal'):'bal',mine?tr.int:1,ROUND_PLAYED.has(p.id),mm(p.tm),p.jr);}
  if(kind==='liga'||kind==='po')for(const p of myTeam().players){if(ROUND_PLAYED.has(p.id)){p.unh=0;continue;}if(p.inj)continue;p.unh=(p.unh||0)+1;
    if(hasT(p,'kap')&&p.unh===3)news(`😤 ${p.first} ${p.last} jest wściekły, że nie gra. Psuje atmosferę w szatni (niższe morale drużyny).`);
    if(hasT(p,'amb')&&p.unh===4)news(`📢 ${p.first} ${p.last} (ambitny) chce więcej grać. Jeśli nadal będzie siedział na ławce, straci humor.`);}
  ROUND_PLAYED=new Set();
  const s=S();
  if(kind==='liga'){money(TV_ROUND,'Prawa TV');
    let t=null;if(home){t=att!=null?{att,inc:att*TICKET}:ticketIncome(1);money(t.inc,'Bilety');}
    finLog(`Kolejka ${s.round}: prawa TV${t?`, bilety (${t.att} widzów)`:''}`,TV_ROUND+(t?t.inc:0));}
  if(kind==='po'&&home){const t=att!=null?{att,inc:att*TICKET}:ticketIncome(1.5);money(t.inc,'Bilety');finLog(`Play-off: bilety (${t.att} widzów)`,t.inc);}
}

// ---- transfery ----
function windowOpen(){const p=S().phase;return p==='off'||p==='spar';}
function posCount(t,pos){return t.players.filter(p=>p.pos===pos).length;}
function isStarter(p){if(p.tm<0)return false;const lu=autoLineup(TEAMS[p.tm]);return Object.values(lu).includes(p.id);}
function askingPrice(p){return Math.round(pValue(p)*(isStarter(p)?1.35:1.05)/10000)*10000;}
function canSellAI(p){const t=TEAMS[p.tm];return posCount(t,p.pos)-1>=POS_MIN[p.pos]&&t.players.length-1>=SQUAD_MIN;}
function wageNeeded(p){if(p.tm===SAVE.team)return round5k(wageDemand(p)*negF());const my=SAVE.ai[SAVE.team].rep;const cur=p.tm>=0?SAVE.ai[p.tm].rep:0;return round5k(wageDemand(p)*(p.tm<0?0.9:cur>my+10?1.15:1)*negF());}
function contractEndFor(years){const s=S();return (s.phase==='off'?s.n-1:s.n)+years;}
function movePlayer(p,tm){p.tm=tm;if(tm>=0)assignNum(p,tm);syncTeams();}
function tradeMsg(ok,t){ui.tmsg={ok,t};render();}
function makeOffer(pid,fee,wage,years){
  const P=PLAYERS[pid];if(!P)return;const p=P.p;const me=myTeam();
  if(!windowOpen())return tradeMsg(false,'Okno transferowe jest zamknięte (otwarte przed sezonem i w trakcie sparingów).');
  if(me.players.length>=SQUAD_MAX)return tradeMsg(false,`Kadra jest pełna (maks. ${SQUAD_MAX}). Najpierw kogoś sprzedaj albo zwolnij.`);
  fee=p.tm>=0?Math.max(0,Math.round(fee)):0;
  if(p.tm>=0){const club=TEAMS[p.tm].name;
    if(!canSellAI(p))return tradeMsg(false,`${club} nie sprzeda zawodnika — nie ma go kim zastąpić.`);
    const ask=Math.round(askingPrice(p)*(1.05-cA('neg')/200)/10000)*10000;if(fee<ask)return tradeMsg(false,`${club} odrzuca ofertę. Oczekuje co najmniej ${fmt(ask)}.`);}
  if(SAVE.fin.bal-fee<-500000)return tradeMsg(false,'Za mało pieniędzy. Dopuszczalny debet to 500 tys. zł.');
  const need=wageNeeded(p);if(wage<need)return tradeMsg(false,`${p.first} ${p.last} odrzuca warunki. Chce co najmniej ${fmt(need)} rocznie.`);
  const from=p.tm;
  if(from>=0){money(-fee,'Transfery');SAVE.ai[from].bud+=fee;finLog(`Zakup: ${p.first} ${p.last} (${TEAMS[from].short})`,-fee);}
  movePlayer(p,SAVE.team);p.wage=round5k(wage);p.ce=contractEndFor(years);
  news(`✍️ ${p.first} ${p.last} dołącza do zespołu${from>=0?` z ${TEAMS[from].name} za ${fmt(fee)}`:' jako wolny zawodnik'}.`);
  ui.card=null;save();tradeMsg(true,`${p.first} ${p.last} podpisał kontrakt do ${ceDate(p.ce)}!`);
}
function findBuyers(pid){const p=PLAYERS[pid].p;const r=rating(p);const out=[];
  for(const t of TEAMS){if(t.idx===SAVE.team||t.players.length>=17)continue;
    const best=t.players.filter(x=>x.pos===p.pos).map(x=>rating(x)).sort((a,b)=>b-a);
    const need=best.length<POS_STD[p.pos]||r>(best[1]||0);if(!need)continue;
    const fee=Math.round(pValue(p)*(0.8+R()*0.3)*(0.95+cA('neg')/200)/10000)*10000;if(SAVE.ai[t.idx].bud<fee)continue;out.push({tm:t.idx,fee});}
  return out.sort((a,b)=>b.fee-a.fee).slice(0,3);}
function seekBuyers(pid){if(!windowOpen())return tradeMsg(false,'Okno transferowe jest zamknięte.');ui.offers={pid,list:findBuyers(pid)};render();}
function acceptBuy(pid,tm,fee){const p=PLAYERS[pid].p;
  if(myTeam().players.length-1<SQUAD_MIN)return tradeMsg(false,`Nie możesz zejść poniżej ${SQUAD_MIN} zawodników w kadrze.`);
  money(fee,'Transfery');SAVE.ai[tm].bud-=fee;finLog(`Sprzedaż: ${p.first} ${p.last} (${TEAMS[tm].short})`,fee);
  movePlayer(p,tm);p.wage=wageDemand(p);p.ce=contractEndFor(1+Math.floor(R()*3));
  SAVE.inbox=(SAVE.inbox||[]).filter(o=>o.pid!==pid);
  news(`💰 ${p.first} ${p.last} sprzedany do ${TEAMS[tm].name} za ${fmt(fee)}.`);ui.offers=null;ui.card=null;save();tradeMsg(true,`Sprzedano: ${p.first} ${p.last} za ${fmt(fee)}.`);}
function rejectInbox(i){SAVE.inbox.splice(i,1);save();render();}
function releaseCost(p){return round5k(p.wage*Math.max(1,p.ce-S().n+(S().phase==='off'?1:0))*0.5);}
function releasePlayer(pid){const p=PLAYERS[pid].p;
  if(ui.confirm!=='rel'+pid){ui.confirm='rel'+pid;render();return;}ui.confirm=null;
  if(myTeam().players.length-1<SQUAD_MIN)return tradeMsg(false,`Nie możesz zejść poniżej ${SQUAD_MIN} zawodników w kadrze.`);
  const c=releaseCost(p);money(-c,'Odprawy');finLog(`Rozwiązanie kontraktu: ${p.first} ${p.last}`,-c);
  movePlayer(p,-1);p.wage=0;p.ce=0;news(`📄 Rozwiązano kontrakt z ${p.first} ${p.last} (odprawa ${fmt(c)}).`);ui.card=null;save();tradeMsg(true,`Rozwiązano kontrakt. Odprawa: ${fmt(c)}.`);}
function renew(pid,wage,years){const p=PLAYERS[pid].p;const need=wageNeeded(p);
  if(wage<need)return tradeMsg(false,`${p.last} nie zgadza się. Chce co najmniej ${fmt(need)} rocznie.`);
  p.wage=round5k(wage);p.ce=contractEndFor(years);news(`✍️ ${p.first} ${p.last} przedłużył kontrakt do ${ceDate(p.ce)}.`);save();tradeMsg(true,`${p.last} przedłużył kontrakt do ${ceDate(p.ce)}.`);}

// ---- AI: transfery i kontrakty ----
function aiSign(t,pos){
  const fa=W().players.filter(p=>p.tm<0&&p.pos===pos&&!p.inj).sort((a,b)=>rating(b)-rating(a));
  let p=fa.find(x=>rating(x)<=teamStrength(t)+4)||fa[0];
  if(!p){p=genPlayer(pos,teamQ(t)-2.5+R(),21+Math.floor(R()*10));initPlayerMeta(p,S().n,true);W().players.push(p);}
  p.tm=t.idx;assignNum(p,t.idx);p.wage=wageDemand(p);p.ce=S().n+Math.floor(R()*2);
  t.players=W().players.filter(x=>x.tm===t.idx&&!x.jr);return p;}
function aiOffseason(){
  const n=S().n;
  for(const t of TEAMS){if(t.idx===SAVE.team)continue;
    for(const p of t.players){if(p.ce<n){const keep=R()<(isStarter(p)?0.85:0.55)&&p.age<34;if(keep){p.wage=wageDemand(p);p.ce=n+Math.floor(R()*3);}else{p.tm=-1;p.wage=0;p.ce=0;}}}}
  syncTeams();
  const order=TEAMS.filter(t=>t.idx!==SAVE.team).sort(()=>R()-0.5);
  for(const t of order){
    if(R()<0.4){const pos=['R','A','P','P','S','S','L'][Math.floor(R()*7)];
      const cur=t.players.filter(x=>x.pos===pos).map(x=>rating(x)).sort((a,b)=>b-a);
      const c=W().players.filter(p=>p.tm>=0&&p.tm!==t.idx&&p.tm!==SAVE.team&&p.pos===pos&&!isStarter(p)&&canSellAI(p)&&rating(p)>(cur[1]||0)).sort((a,b)=>rating(b)-rating(a))[0];
      if(c){const fee=askingPrice(c);if(SAVE.ai[t.idx].bud>=fee){const from=c.tm;SAVE.ai[t.idx].bud-=fee;SAVE.ai[from].bud+=fee;movePlayer(c,t.idx);c.wage=wageDemand(c);c.ce=n+1+Math.floor(R()*2);
        news(`🔁 Transfer: ${c.first} ${c.last} przechodzi z ${TEAMS[from].name} do ${t.name} za ${fmt(fee)}.`);}}}
    for(const pos of ['R','A','P','S','L'])while(posCount(t,pos)<POS_STD[pos]&&t.players.length<16)aiSign(t,pos);
    while(t.players.length<SQUAD_MIN+1)aiSign(t,randPos());
    while(t.players.length>16){const ex=t.players.filter(p=>posCount(t,p.pos)>POS_STD[p.pos]).sort((a,b)=>rating(a)-rating(b))[0]||t.players.slice().sort((a,b)=>rating(a)-rating(b))[0];ex.tm=-1;ex.wage=0;ex.ce=0;t.players=W().players.filter(x=>x.tm===t.idx&&!x.jr);}
  }
  syncTeams();
}
function offseason(){
  const old=S(),n=old.n+1;
  advanceTo(`${2026+old.n}-06-01`);
  // starzenie, spadek formy, emerytury
  const keep=[];
  for(const p of W().players){
    if(p.age>=28)for(const [k] of PHYS)if(R()<(p.age-27)*0.14*(hasT(p,'pro')?0.6:1)&&p[k]>1)p[k]--;
    if(p.age>=31)for(const [k] of ATTRS)if(k!=='czy'&&R()<(p.age-30)*0.1*(hasT(p,'pro')?0.6:1)&&p[k]>1)p[k]--;
    const r=rating(p);if(p.pot<r)p.pot=r;
    const retire=p.age>=37||(p.age>=35&&R()<0.5)||(p.tm<0&&p.age>=33&&R()<0.5);
    if(retire){if(p.tm===SAVE.team)news(`👋 ${p.first} ${p.last} (${p.age} l.) kończy karierę.`);continue;}
    keep.push(p);}
  W().players=keep;syncTeams();
  // nowy sezon (okno transferowe)
  newSeason(n,'off');
  aiOffseason();juniorsOffseason();aiInfraOffseason();refreshStaffPool();
  for(const r in SAVE.staff){const st=SAVE.staff[r];if(st){st.age++;if(st.age<50&&R()<0.4&&st.skill<20)st.skill++;}}
  // wolni zawodnicy: porządki i uzupełnienie
  let fa=W().players.filter(p=>p.tm<0).sort((a,b)=>rating(b)-rating(a));
  if(fa.length>30){const drop=new Set(fa.slice(30).map(p=>p.id));W().players=W().players.filter(p=>!drop.has(p.id));}
  while(W().players.filter(p=>p.tm<0).length<20){const p=genPlayer(randPos(),10+R()*3,20+Math.floor(R()*12));p.tm=-1;initPlayerMeta(p,n,true);W().players.push(p);}
  for(const a of SAVE.ai)a.bud=round5k(a.bud*0.5+200000+a.rep*15000+R()*300000);
  for(const p of W().players){p.base=snap(p);}
  // oferty za zawodników użytkownika
  SAVE.inbox=[];
  const mine=myTeam().players.filter(p=>rating(p)>=74&&p.ce>=n).sort(()=>R()-0.5);
  for(const p of mine.slice(0,1+Math.floor(R()*2))){const buyers=findBuyers(p.id);if(buyers.length&&R()<0.7){const b=buyers[0];SAVE.inbox.push({pid:p.id,tm:b.tm,fee:Math.round(b.fee*(1.05+R()*0.25)/10000)*10000});}}
  SAVE.fin.prev=SAVE.fin.sea;SAVE.fin.sea={};
  syncTeams();save();
}
function expiring(){const n=S().n;return myTeam().players.filter(p=>p.ce<n);}
function startSeasonFromOff(){
  const s=S();const exp=expiring();const left=myTeam().players.length-exp.length;
  if(left<SQUAD_MIN&&ui.confirm!=='start'){ui.tmsg={ok:false,t:`Po odejściu zawodników z wygasającymi kontraktami zostanie Ci ${left} zawodników, a minimum to ${SQUAD_MIN}. Przedłuż kontrakty albo kup zawodników.`};render();return;}
  if(exp.length&&ui.confirm!=='start'){ui.confirm='start';render();return;}
  ui.confirm=null;
  for(const p of exp){p.tm=-1;p.wage=0;p.ce=0;news(`👋 ${p.first} ${p.last} odchodzi — wygasł kontrakt.`);}
  for(const p of agedOut()){p.tm=-1;p.jr=false;news(`👋 ${p.first} ${p.last} (${p.age} l.) kończy wiek juniora i odchodzi z akademii.`);}
  syncTeams();
  if(myTeam().players.length<SQUAD_MIN){while(myTeam().players.length<SQUAD_MIN){const t=myTeam();const pos=['R','A','P','S','L'].find(x=>posCount(t,x)<POS_MIN[x])||randPos();aiSign(t,pos);syncTeams();}news('Klub dobrał zawodników z wolnego rynku, żeby uzupełnić kadrę do minimum.');}
  s.phase='spar';ui.tmsg=null;syncDate();save();render();
}

// ---- widoki ----
function cardModal(){
  const P=PLAYERS[ui.card];if(!P)return '';const p=P.p,t=P.t,mine=p.tm===SAVE.team;
  const r=rating(p),br=baseRating(p);
  const grp=(n,G)=>`<div class="cgrp"><h4>${n}</h4>${G.map(([k,l])=>{const d=p.base?p[k]-p.base[k]:0;return `<div class="crow"><span>${l}</span><span>${d?`<small class="${d>0?'good':'bad'}">${d>0?'+':''}${d}</small> `:''}<span class="attr ${aCls(p[k])}">${p[k]}</span></span></div>`;}).join('')}</div>`;
  const st=S().ps[p.id];
  let act='';const o=windowOpen();
  if(mine&&p.jr){act+=`<div class="act"><h4>Junior (U20)</h4><p class="small">Gra w lidze juniorów. Awans do pierwszej drużyny daje kontrakt na 3 sezony z pensją ok. ${fmt(Math.max(40000,wageDemand(p)))}/rok.</p><div class="row wrap"><button class="btn" onclick="promote('${p.id}')">⬆️ Awansuj do pierwszej drużyny</button><button class="link" onclick="releaseJunior('${p.id}')">${ui.confirm==='rj'+p.id?'Na pewno?':'Zwolnij z akademii'}</button></div></div>`;}
  else if(mine){
    const need=wageNeeded(p);
    act+=`<div class="act"><h4>Kontrakt</h4><p class="small">Do <b>${ceDate(p.ce)}</b> · pensja ${fmt(p.wage)}/rok. Zawodnik chce: <b>${fmt(need)}</b>/rok.</p>
    <div class="row wrap"><label class="small">Pensja <input id="rw" type="number" step="5000" value="${need}"></label><label class="small">Lata <select id="ry">${[1,2,3].map(y=>`<option ${y===2?'selected':''}>${y}</option>`).join('')}</select></label><button class="ghost" onclick="renew('${p.id}',+$('#rw').value,+$('#ry').value)">Przedłuż</button></div></div>
    <div class="act"><h4>Sprzedaż</h4>${o?`<button class="ghost" onclick="seekBuyers('${p.id}')">Szukaj kupca</button>`:'<p class="mut small">Okno transferowe zamknięte.</p>'}
    ${ui.offers&&ui.offers.pid===p.id?(ui.offers.list.length?ui.offers.list.map(x=>`<div class="row offer">${tDot(x.tm)}${tName(x.tm)} oferuje <b>${fmt(x.fee)}</b><span class="sp"></span><button class="btn" onclick="acceptBuy('${p.id}',${x.tm},${x.fee})">Sprzedaj</button></div>`).join(''):'<p class="mut small">Żaden klub nie jest teraz zainteresowany.</p>'):''}
    <div style="margin-top:8px"><button class="link" onclick="releasePlayer('${p.id}')">${ui.confirm==='rel'+p.id?`Na pewno? Odprawa ${fmt(releaseCost(p))}`:'Rozwiąż kontrakt'}</button>${p.age<=19?` · <button class="link" onclick="demote('${p.id}')">Przesuń do juniorów</button>`:''}</div></div>`;
  }else{
    const need=wageNeeded(p);
    act+=`<div class="act"><h4>${p.tm>=0?'Złóż ofertę':'Zaproponuj kontrakt'}</h4>${o?`
    ${p.tm>=0?`<p class="small">Wartość: <b>${fmt(pValue(p))}</b>. ${isStarter(p)?'Podstawowy zawodnik — klub zażąda więcej.':''}</p>`:'<p class="small">Wolny zawodnik — bez kwoty odstępnego.</p>'}
    <div class="row wrap">${p.tm>=0?`<label class="small">Kwota <input id="of" type="number" step="10000" value="${pValue(p)}"></label>`:''}<label class="small">Pensja/rok <input id="ow" type="number" step="5000" value="${need}"></label><label class="small">Lata <select id="oy">${[1,2,3].map(y=>`<option ${y===2?'selected':''}>${y}</option>`).join('')}</select></label>
    <button class="btn" onclick="makeOffer('${p.id}',${p.tm>=0?"+$('#of').value":'0'},+$('#ow').value,+$('#oy').value)">Wyślij</button></div>
    <p class="mut small">Saldo klubu: ${fmt(SAVE.fin.bal)} · kadra: ${myTeam().players.length}/${SQUAD_MAX}</p>`:'<p class="mut small">Okno transferowe jest zamknięte. Otwiera się przed sezonem i trwa do końca sparingów.</p>'}</div>`;
  }
  return `<div class="modal" onclick="if(event.target===this){ui.card=null;ui.offers=null;render()}"><div class="mcard">
   <div class="row"><span class="cface">${pFace(p,84)}</span><div><div class="mut small">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].name)+(p.jr?' · juniorzy U20':''):'Wolny zawodnik'}</div><h2>${p.num&&p.tm>=0?p.num+'. ':''}${esc(p.first)} ${esc(p.last)}${p.star?' <span title="Gwiazda zespołu">⭐</span>':''}</h2></div><span class="sp"></span><button class="ghost" onclick="ui.card=null;ui.offers=null;render()">✕</button></div>
   ${ui.tmsg?`<div class="tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
   <div class="cinfo"><div><span class="mut small">Pozycja</span><b>${POS_NAMES[p.pos]}</b></div><div><span class="mut small">Wiek</span><b>${p.age} <small class="mut">(ur. ${p.dob?fmtDMY(p.dob):'?'})</small></b></div><div><span class="mut small">Wzrost</span><b>${p.h} cm</b></div>
   <div><span class="mut small">Ocena</span><b>${r}${r!==br?` <small class="${r>br?'good':'bad'}">${r>br?'+':''}${r-br}</small>`:''}</b></div><div><span class="mut small">Potencjał${p.tm!==SAVE.team?' (wg skauta)':''}</span><b class="stars">${potStars(p)}</b></div><div><span class="mut small">Wartość</span><b>${fmt(pValue(p))}</b></div>
   <div><span class="mut small">Pensja</span><b>${p.tm>=0?fmt(p.wage)+'/rok':'—'}</b></div><div><span class="mut small">Kontrakt do</span><b>${p.tm>=0?ceDate(p.ce):'—'}</b></div><div><span class="mut small">Forma</span><b>${formChip(p,true)} <small class="fmhs">${fmHist(p)}</small></b></div>${mine?`<div><span class="mut small">Świeżość</span><b style="color:${frCol(frOf(p))}">${Math.round(frOf(p))}%</b></div>`:''}<div><span class="mut small">Zdrowie</span><b>${p.inj?`🚑 do ${p.injUntil?fmtDMY(p.injUntil):'?'} (${p.inj} dni)`:'✅ zdrowy'}</b></div></div>
   <div class="ptr" style="margin:8px 0">${(ensTraits(p),p.tr).map(k=>`<div>${trChip(k,true)}<span class="small mut">${esc(TRAITS[k][2])}</span></div>`).join('')}${mine&&!p.jr?(isCap(p)?'<div><span class="capb">C</span> <span class="small">Kapitan drużyny</span></div>':`<div><button class="link" onclick="setCaptain('${p.id}')">©️ Mianuj kapitanem</button></div>`):''}</div><div class="cgrid">${grp('Techniczne',ATTRS)}${grp('Fizyczne',PHYS)}${grp('Mentalne',MENTAL)}</div>
   <p class="mut small">Małe liczby przy atrybutach to zmiana od początku sezonu.</p>
   ${st?`<p class="small">Sezon ${sLabel(S().n)}: <b>${st.m}</b> meczów · <b>${st.pts}</b> pkt · atak ${pc(st.kill,st.att)} · bloki ${st.blk} · asy ${st.ace} · MVP ${st.mvp}</p>`:''}
   ${act}</div></div>`;
}
function openCard(id){ui.card=id;ui.offers=null;ui.tmsg=null;ui.confirm=null;render();}
function transferView(){
  const o=windowOpen();const f=ui.mf||(ui.mf={pos:'',src:'all',sort:'ocena',maxAge:40,maxVal:0});
  let list=W().players.filter(p=>p.tm!==SAVE.team&&!p.jr);
  if(f.pos)list=list.filter(p=>p.pos===f.pos);
  if(f.src==='fa')list=list.filter(p=>p.tm<0);else if(f.src==='club')list=list.filter(p=>p.tm>=0);
  list=list.filter(p=>p.age<=f.maxAge);
  if(f.maxVal)list=list.filter(p=>(p.tm<0?0:pValue(p))<=f.maxVal);
  const sorts={ocena:(a,b)=>rating(b)-rating(a),pot:(a,b)=>potSeen(b)-potSeen(a),wiek:(a,b)=>a.age-b.age,cena:(a,b)=>pValue(a)-pValue(b)};
  list.sort(sorts[f.sort]);const shown=list.slice(0,60);
  const inbox=(SAVE.inbox||[]).filter(x=>PLAYERS[x.pid]&&PLAYERS[x.pid].p.tm===SAVE.team);
  const sel=(k,opts)=>`<select onchange="ui.mf.${k}=${k==='maxAge'||k==='maxVal'?'+this.value':'this.value'};render()">${opts.map(([v,l])=>`<option value="${v}" ${String(f[k])===String(v)?'selected':''}>${l}</option>`).join('')}</select>`;
  return `${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
  <div class="card"><div class="row wrap"><h2 style="margin:0">Okno transferowe: ${o?'<span class="good">otwarte</span>':'<span class="bad">zamknięte</span>'}</h2><span class="sp"></span><span class="small">Saldo: <b>${fmt(SAVE.fin.bal)}</b> · Kadra: <b>${myTeam().players.length}/${SQUAD_MAX}</b></span></div>
  <p class="mut small">Okno jest otwarte od 1 czerwca do ostatniego sparingu (połowa września). Kliknij zawodnika, żeby złożyć ofertę. Swoich zawodników sprzedajesz z ich karty (zakładka Skład).</p></div>
  ${inbox.length?`<div class="card"><h2>Oferty za Twoich zawodników</h2>${inbox.map((x,i)=>{const p=PLAYERS[x.pid].p;return `<div class="row wrap offer">${tDot(x.tm)}<b>${tName(x.tm)}</b> chce kupić <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> (${rating(p)}) za <b>${fmt(x.fee)}</b><span class="sp"></span>${o?`<button class="btn" onclick="acceptBuy('${p.id}',${x.tm},${x.fee})">Akceptuj</button>`:''}<button class="ghost" onclick="rejectInbox(${SAVE.inbox.indexOf(x)})">Odrzuć</button></div>`;}).join('')}</div>`:''}
  <div class="card"><h2>Rynek</h2><div class="row wrap filters">
   ${sel('pos',[['','Wszystkie pozycje'],['R','Rozgrywający'],['A','Atakujący'],['P','Przyjmujący'],['S','Środkowy'],['L','Libero']])}
   ${sel('src',[['all','Kluby i wolni'],['club','Tylko z klubów'],['fa','Tylko wolni zawodnicy']])}
   ${sel('maxAge',[[40,'Każdy wiek'],[23,'Do 23 lat'],[27,'Do 27 lat'],[30,'Do 30 lat']])}
   ${sel('maxVal',[[0,'Dowolna cena'],[200000,'Do 200 tys.'],[500000,'Do 500 tys.'],[1000000,'Do 1 mln']])}
   ${sel('sort',[['ocena','Sortuj: ocena'],['pot','Sortuj: potencjał'],['wiek','Sortuj: wiek'],['cena','Sortuj: cena rosnąco']])}</div>
  <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th>Ocena</th><th>Potencjał</th><th class="l">Klub</th><th>Wartość</th><th>Pensja</th><th>Kontrakt</th></tr></thead><tbody>
  ${shown.map(p=>`<tr onclick="openCard('${p.id}')" class="clickrow"><td class="l"><span class="fcell">${pFace(p,26)}<span>${esc(p.first)} <b>${esc(p.last)}</b></span></span>${p.inj?' 🚑':''}</td><td>${POS_SHORT[p.pos]}</td><td>${p.age}</td><td><b>${rating(p)}</b></td><td class="stars">${potStars(p)}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short):'<span class="good">wolny</span>'}</td><td>${p.tm>=0?fmt(pValue(p)):'—'}</td><td>${p.tm>=0?fmt(p.wage):'<small class="mut">chce '+fmt(wageNeeded(p))+'</small>'}</td><td>${p.tm>=0?ceDate(p.ce):'—'}</td></tr>`).join('')}
  </tbody></table></div><p class="mut small">Pokazano ${shown.length} z ${list.length} zawodników.</p></div>`;
}
function financeView(){
  const f=SAVE.fin;const pay=payroll(),sp=sponsorAmt();const rep=SAVE.ai[SAVE.team].rep;
  const stp=staffPay(),mnt=maintenance()*12,shp=shopIncome(myInfra().sklep)*12;
  const proj=sp+TV_ROUND*22+ticketIncome(1,true).inc*11+shp-pay-stp-mnt;
  const cats=['Sponsor','Prawa TV','Bilety','Sklep','Nagrody','Transfery','Pensje','Sztab','Utrzymanie','Infrastruktura','Odprawy'];
  const row=(o)=>cats.map(c=>`<tr><td class="l">${c}</td><td class="${(o[c]||0)<0?'bad':(o[c]||0)>0?'good':''}">${o[c]?fmt(o[c]):'—'}</td></tr>`).join('')+`<tr><td class="l"><b>Razem</b></td><td><b>${fmt(cats.reduce((s,c)=>s+(o[c]||0),0))}</b></td></tr>`;
  return `<div class="card fin"><div class="big ${f.bal<0?'bad':''}">${fmtFull(f.bal)}</div><div class="mut">Saldo klubu${f.bal<0?' — jesteś na minusie! Dopuszczalny debet to 500 tys. zł, poniżej nie kupisz zawodników.':''}</div></div>
  <div class="card"><h2>Budżet roczny</h2><table class="cmp"><tbody>
   <tr><td class="l">Pensje zawodników (rocznie)</td><td class="bad">−${fmt(pay)}</td></tr>
   <tr><td class="l">Pensje sztabu szkoleniowego</td><td class="bad">−${fmt(stp)}</td></tr>
   <tr><td class="l">Utrzymanie obiektów</td><td class="bad">−${fmt(mnt)}</td></tr>
   <tr><td class="l">Sklep kibica</td><td class="good">+${fmt(shp)}</td></tr>
   <tr><td class="l">Sponsor (zależy od renomy: ${rep}/100)</td><td class="good">+${fmt(sp)}</td></tr>
   <tr><td class="l">Prawa TV (${fmt(TV_ROUND)} za kolejkę)</td><td class="good">+${fmt(TV_ROUND*22)}</td></tr>
   <tr><td class="l">Bilety (ok. ${fmt(ticketIncome(1,true).inc)} za mecz u siebie)</td><td class="good">~ +${fmt(ticketIncome(1,true).inc*11)}</td></tr>
   <tr><td class="l"><b>Prognoza bilansu (bez transferów i nagród)</b></td><td class="${proj<0?'bad':'good'}"><b>${proj>=0?'+':''}${fmt(proj)}</b></td></tr></tbody></table>
   <p class="mut small">Pensje i sponsor rozliczają się co miesiąc (1. dnia), prawa TV co kolejkę ligową, bilety po każdym meczu u siebie. Nagrody za miejsce w sezonie: od 50 tys. do 1 mln zł. Lepsze wyniki podnoszą renomę, a ta podnosi sponsora i frekwencję.</p></div>
  <div class="card"><h2>Sezon ${sLabel(S().n)}</h2><table class="cmp"><tbody>${row(f.sea)}</tbody></table>${f.prev?`<h3>Poprzedni sezon</h3><table class="cmp"><tbody>${row(f.prev)}</tbody></table>`:''}</div>
  <div class="card"><h2>Historia operacji</h2>${f.log.length?f.log.slice(0,30).map(x=>`<div class="res row"><span class="mut small">${x.d?fmtDMY(x.d):''}</span> ${esc(x.t)}<span class="sp"></span><b class="${x.a<0?'bad':'good'}">${x.a>=0?'+':''}${fmt(x.a)}</b></div>`).join(''):'<p class="mut">Brak operacji.</p>'}</div>`;
}
function offView(){
  const s=S(),exp=expiring();
  return `<div class="card"><h2>Okno transferowe przed sezonem ${sLabel(s.n)}</h2><p>Między sezonami: zawodnicy są o rok starsi, część zakończyła kariery, kluby dostały juniorów z akademii, a rywale zrobili transfery (szczegóły w wiadomościach). Teraz Twój ruch: przedłuż kontrakty, kupuj i sprzedawaj (zakładka Transfery).</p>
  ${ui.tmsg?`<div class="tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
  ${exp.length?`<h3>Wygasające kontrakty (${exp.length})</h3><p class="mut small">Ci zawodnicy odejdą przy starcie sezonu, jeśli nie przedłużysz z nimi umów. Kliknij, żeby otworzyć kartę.</p>${exp.map(p=>`<div class="res row">⚠️ <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> <small class="mut">${POS_SHORT[p.pos]} · ${p.age} l. · ocena ${rating(p)} · chce ${fmt(wageNeeded(p))}/rok</small></div>`).join('')}`:'<p class="good">Wszystkie kontrakty są ważne.</p>'}
  ${agedOut().length?`<h3>Juniorzy kończący 20 lat (${agedOut().length})</h3><p class="mut small">Awansuj ich do pierwszej drużyny albo odejdą z klubu przy starcie przygotowań.</p>${agedOut().map(p=>`<div class="res row">🎓 <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> <small class="mut">${POS_SHORT[p.pos]} · ocena ${rating(p)} · potencjał ${potStars(p)}</small><span class="sp"></span><button class="ghost sm" onclick="promote('${p.id}')">⬆️ Awans</button></div>`).join('')}`:''}
  <div class="row wrap" style="margin-top:12px"><button class="btn" onclick="startSeasonFromOff()">${ui.confirm==='start'?`Na pewno? Odejdzie ${exp.length} zawodników`:'Rozpocznij przygotowania do sezonu '+sLabel(s.n)}</button><button class="ghost" onclick="go('transfery')">Przejdź do transferów</button></div></div>`;
}
function newsHtml(){const n=(SAVE.news||[]).slice(0,10);if(!n.length)return '';return `<div class="card"><h2>Wiadomości</h2>${n.map(x=>`<div class="res"><span class="mut small">${x.d?fmtShort(x.d):''}</span> ${esc(x.t)}</div>`).join('')}</div>`;}
function healthyLineup(team,lu){
  const ok=validLineup(team,lu)?Object.assign({},lu):autoLineup(team);
  const used=new Set(Object.values(ok));const ch=[];
  for(const [k,l,pos] of LINEUP_KEYS){const p=team.players.find(x=>x.id===ok[k]);if(p&&!p.inj)continue;
    const c=team.players.filter(x=>!x.inj&&!used.has(x.id)).sort((a,b)=>lineupScore(b,pos)-lineupScore(a,pos))[0];
    if(c){used.add(c.id);ch.push([p,c,l]);ok[k]=c.id;}}
  return {lu:ok,ch};}
