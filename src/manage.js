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
// forma sezonu: średnia ocena z meczów względem oczekiwanej dla zawodnika o tej ocenie i pozycji
// (obecny sezon od 3 meczów, wcześniej poprzedni sezon)
function formRef(){const s=S();if(!s||!s.ps)return null;const key=today()+':'+Object.keys(s.ps).length;if(SAVE._fr&&SAVE._fr.k===key)return SAVE._fr.v;
  const acc={};for(const p of W().players){const r=s.ps[p.id];if(!r||!(r.rn>=3))continue;const a=acc[p.pos]||(acc[p.pos]={n:0,sx:0,sy:0,sxx:0,sxy:0});const x=rating(p),y=r.rs/r.rn;a.n++;a.sx+=x;a.sy+=y;a.sxx+=x*x;a.sxy+=x*y;}
  const v={};for(const k in acc){const a=acc[k];const mx=a.sx/a.n,my=a.sy/a.n,vx=a.sxx/a.n-mx*mx;const b=a.n>=8&&vx>1?(a.sxy/a.n-mx*my)/vx:0;v[k]={a:my-b*mx,b};}
  Object.defineProperty(SAVE,'_fr',{value:{k:key,v},writable:true,configurable:true,enumerable:false});return v;}
function formDelta(p){const s=S();const r=s&&s.ps?s.ps[p.id]:null;if(!r||!(r.rn>=3))return null;const ref=formRef();const f=ref&&ref[p.pos];if(!f)return null;return {d:r.rs/r.rn-(f.a+f.b*rating(p)),avg:r.rs/r.rn,n:r.rn};}
function seasonForm(p){let x=formDelta(p);if(!x&&p.lsR)x={d:p.lsR[0],avg:p.lsR[2],n:p.lsR[1]};if(!x)return {f:0,avg:null,n:0};
  const w=Math.min(1,x.n/10);return {f:clamp(x.d*0.16,-0.15,0.2)*w,d:x.d,avg:x.avg!=null?Math.round(x.avg*100)/100:null,n:x.n};}
const TR_VAL={pro:1.5,lid:1.5,spo:1,pra:1,zde:1,amb:0,ind:-1,len:-1.5,kap:-1.5,ner:-1.5};
function traitVal(p){if(!p.tr)ensTraits(p);return clamp(p.tr.reduce((s,k)=>s+(TR_VAL[k]||0),0),-1.5,1.5)/100;}
function pValueBase(p){const r=rating(p);const af=p.age<=22?1.35:p.age<=28?1.1:p.age<=31?0.85:p.age<=33?0.55:0.3;const pf=1+Math.max(0,(p.pot||r)-r)/35;return Math.pow(Math.max(0,r-50)/40,2.5)*1500000*af*pf;}
function pValue(p){return Math.max(10000,Math.round(pValueBase(p)*(1+seasonForm(p).f)*(1+traitVal(p))/10000)*10000);}
function valTip(p){const sf=seasonForm(p),tv=traitVal(p);const a=[];if(sf.n)a.push(`forma sezonu ${sf.f>=0?'+':''}${String(Math.round(sf.f*1000)/10).replace('.',',')}% (śr. ocena ${sf.avg!=null?String(sf.avg).replace('.',','):'?'} w ${sf.n} meczach)`);if(tv)a.push(`charakter ${tv>0?'+':''}${String(Math.round(tv*1000)/10).replace('.',',')}%`);return a.join(' · ');}
function wageDemand(p){const r=rating(p);return round5k(Math.max(40000,Math.pow(Math.max(0,r-45)/45,2)*700000)*(p.age>=33?0.8:1)*(1+domPrem(p))*(p.tr&&p.tr.includes('loj')&&p.tm===SAVE.team?0.92:1)*(p.tr&&p.tr.includes('sta')?1.05:1));}
function snap(p){const o={};for(const k of ALL_KEYS)o[k]=p[k];return o;}
function baseRating(p){return p.base?rating(Object.assign({},p,p.base)):rating(p);}
function potBonus(age,r){const k=r>=85?0.5:r>=80?0.75:1;return BAL2?k*(age<=21?2+R()*9:age<=24?1+R()*5:age<=27?R()*2:0):k*(age<=21?3+R()*12:age<=24?2+R()*7:age<=27?R()*3:0);}
function initRep(t){const s=teamStrength(t),l=LG_LV[lgOf(t.idx)]||0;return Math.round(l===0?clamp((s-65)*3.5,45,90):l===1?clamp(25+(s-65)*3,22,50):clamp(10+(s-54)*2,8,30));}
function teamQ(t){return teamStrength(t)/5;}
function restoreDefs(){TEAMS.forEach((t,i)=>{const d=TEAM_DEFS[i];t.name=d.name;t.short=d.short;t.color=d.color;t.city='';});applyCustom();}
function resetTeams(){restoreDefs();TEAMS.forEach((t,i)=>{t.players=genTeam(TEAM_DEFS[i],i).players;});rebuildIndex();}
function hashN(id){let h=3;for(const c of String(id))h=(h*131+c.charCodeAt(0))>>>0;return h;}
function syncTeams(){for(const p of W().players){ensTraits(p);if(p.czy==null||p.kiw==null||p.kom==null){ensAttrs(p);if(p.base){p.base.czy=p.czy;p.base.kiw=p.kiw;p.base.kom=p.kom;}}
    if(!W().chemInit&&p.tcTm==null&&p.tm>=0&&!p.jr){p.tcTm=p.tm;p.tc=6+hashN(p.id)%35;}}W().chemInit=1;const by={};for(const p of W().players)if(p.tm>=0&&!p.jr)(by[p.tm]||(by[p.tm]=[])).push(p);for(const t of TEAMS)t.players=by[t.idx]||[];rebuildIndex();}
function initPlayerMeta(p,season,free){const r=rating(p);p.pot=Math.min(95,Math.round(r+potBonus(p.age,r)));p.inj=0;p.xp={};p.base=snap(p);
  if(free){p.wage=0;p.ce=0;}else{p.wage=round5k(wageDemand(p)*(0.85+R()*0.3));p.ce=season+(R()<0.2?0:1+Math.floor(R()*3));}}
function randPos(){const x=R()*14;return x<2?'R':x<4?'A':x<8?'P':x<12?'S':'L';}
function genPlayer(pos,q,age,nat){const id='n'+(W().nextId++);
  if(!nat)nat=SAVE.team!=null&&R()<0.35?tmCountry(SAVE.team):natPick(R,null);const [fn,ln]=natName(nat);
  const p={id,first:fn,last:ln,nat,pos,num:0,age};
  const hh=HEIGHT[pos];p.h=Math.round(hh[0]+R()*(hh[1]-hh[0]));
  for(const [k] of ATTRS.concat(PHYS))p[k]=Math.round(clamp(q+TEMPL[pos][k]+nz()*2.2,1,20));
  for(const [k] of MENTAL)p[k]=Math.round(clamp(q-1+nz()*4,1,20));
  p.tc=0;setDob(p);ensTraits(p);return p;}
function assignNum(p,tm){const used=new Set(W().players.filter(x=>x.tm===tm&&x!==p).map(x=>x.num));if(p.num&&!used.has(p.num))return;for(let n=1;n<=40;n++)if(!used.has(n)){p.num=n;return;}}
// stare zapisy (jedna liga, 12 klubów): dogeneruj kluby 1. i 2. Ligi — kadry, renomę, budżety i juniorów
function ensureLeagues(){if(!SAVE.world)return false;ensNat();if(typeof trMigrate==='function')trMigrate();if(typeof roleFix==='function')roleFix();const have=new Set(W().players.filter(p=>p.tm>=0).map(p=>p.tm));const sn=SAVE.season?SAVE.season.n:1;let added=0;
  if(!SAVE.lg)SAVE.lg=TEAM_DEFS.map(d=>d.lg||0);while(SAVE.lg.length<TEAM_DEFS.length)SAVE.lg.push(TEAM_DEFS[SAVE.lg.length].lg||0);
  SAVE.ai=SAVE.ai||[];
  for(const t of TEAMS){if(have.has(t.idx))continue;const g=genTeam(TEAM_DEFS[t.idx],t.idx);
    for(const p0 of g.players){const p=Object.assign({},p0,{tm:t.idx});initPlayerMeta(p,sn,false);setDob(p);W().players.push(p);}added++;}
  if(added){syncTeams();for(const t of TEAMS)if(!SAVE.ai[t.idx]){const rep=initRep(t);SAVE.ai[t.idx]={rep,bud:round5k(200000+rep*15000+R()*300000)};}
    if(SAVE.jrInit&&typeof genJunior==='function')for(const t of TEAMS)if(!W().players.some(p=>p.tm===t.idx&&p.jr))JR_PLAN.forEach((pos,i)=>{W().players.push(genJunior(t.idx,16+(i%4),pos));});
    syncTeams();}
  return added>0;}
// ---- rynek wolnych zawodników: poziom liczony względem lig, żeby nie wracała inflacja ----
// poziom odniesienia lig zapamiętany przy starcie świata (rynek nie może podbijać sam siebie)
function lgRef(l){if(!SAVE.lgRef)SAVE.lgRef=[];if(SAVE.lgRef[l]==null)SAVE.lgRef[l]=Math.round(lgAvg(l)*10)/10;return SAVE.lgRef[l];}
function lvRef(lv){const L=allLgs().filter(l=>LG_LV[l]===lv);return L.reduce((s,l)=>s+lgRef(l),0)/L.length;}
function lgAvg(l){const ids=lgIds(l);let s=0,n=0;for(const i of ids){const t=TEAMS[i];if(!t||!t.players.length)continue;s+=teamStrength(t);n++;}return n?s/n:[80,67,58][LG_LV[l]||0];}
function genAt(pos,target,age){let q=target/5;let p=null;for(let it=0;it<4;it++){if(p)W().nextId--;p=genPlayer(pos,q,age);const r=rating(p);if(Math.abs(r-target)<=1)break;q+=(target-r)/5;}return p;}
const FA_MIX=[['vet',10],['spor',5],['tal',8],['sol',32]];const FA_SCALE=2.6;// rynek na cały świat (9 lig)
function faMarket(){if(!BAL3)return;const n=S()?S().n:1;const L2=Math.min(...allLgs().map(lgRef));
  const fa=W().players.filter(p=>p.tm<0&&!p.jr);const have={};for(const p of fa)have[p.fk||'sol']=(have[p.fk||'sol']||0)+1;
  for(const [k,cnt0] of FA_MIX){const cnt=Math.round(cnt0*FA_SCALE);for(let i=have[k]||0;i<cnt;i++){const pos=randPos();let p;
    const top=allLgs().filter(l=>LG_LV[l]===0),any=allLgs();const E=lgRef(top[Math.floor(R()*top.length)]);
    if(k==='vet')p=genAt(pos,E-6+R()*8,31+Math.floor(R()*4));
    else if(k==='spor'){p=genAt(pos,E-4+R()*8,25+Math.floor(R()*5));if(R()<0.6)p.tr=[R()<0.5?'kap':'ind'];}
    else if(k==='tal')p=genAt(pos,L2-3+R()*13,18+Math.floor(R()*4));
    else{const lv=lgRef(any[Math.floor(R()*any.length)]);p=genAt(pos,lv-8+R()*12,22+Math.floor(R()*9));}
    p.tm=-1;initPlayerMeta(p,n,true);if(k==='tal')p.pot=Math.min(90,rating(p)+10+Math.round(R()*8));p.fk=k;W().players.push(p);}}
  // za dużo wolnych: odchodzą najsłabsi i najstarsi
  const all=W().players.filter(p=>p.tm<0&&!p.jr).sort((a,b)=>rating(b)-rating(a));const mx=Math.round(75*FA_SCALE);if(all.length>mx){const drop=new Set(all.slice(mx).map(p=>p.id));W().players=W().players.filter(p=>!drop.has(p.id));}}
// kluby komputera podpisują wolnych zawodników: zawodnik idzie tam, gdzie dostanie najwięcej (budżet i renoma), w granicach limitu płac
function faSignAI(){if(!BAL3)return;const LA=allLgs().map(lgRef);const tops=LA.slice().sort((a,b)=>b-a);const fa=W().players.filter(p=>p.tm<0&&!p.jr&&!p.inj).sort((a,b)=>rating(b)-rating(a));let k=0;const per={};
  for(const p of fa){const r=rating(p);
    // liga „na poziomie” zawodnika i czy przyjmie ofertę z ligi niżej (słaby sezon, weteran albo długo bez klubu)
    // najwyższy poziom ligi, do którego pasuje (poziom odniesienia ligi, a nie numer)
    const idealRef=tops.find(x=>r>=x-4)||tops[tops.length-1];const bad=p.lsR&&p.lsR[0]<-0.25;const canDrop=bad||p.age>=30||(p.faW||0)>=1;
    const base=wageDemand(p)*(p.fk==='spor'?1.3:1)*(1-0.15*Math.min(2,p.faW||0));const bids=[];
    for(const t of TEAMS){if(t.idx===SAVE.team||t.players.length>=16||(per[t.idx]||0)>=2)continue;const L=lgOf(t.idx);
      const low=LA[L]<idealRef-1.5;if(LA[L]<idealRef-(canDrop?11:1.5))continue;// za nisko dla niego
      const best=t.players.filter(x=>x.pos===p.pos).map(x=>rating(x)).sort((a,b)=>b-a);
      const need=best.length<POS_STD[p.pos]||r>(best[Math.min(best.length-1,p.pos==='P'||p.pos==='S'?1:0)]||0)+1;if(!need)continue;
      const wd=base*(low?0.85:1);if(teamWages(t.idx)+wd>wageCap(t.idx))continue;const a=SAVE.ai[t.idx];if(a.bud<wd*0.5)continue;
      // zawodnik wybiera: pieniądze (budżet klubu), poziom ligi i szansę gry
      bids.push({t,wd,v:a.bud+a.rep*20000+(LA[L]-60)*45000+(tmCountry(t.idx)===pNat(p)?150000:0)+(best.length&&r>best[0]?300000:0)+R()*200000});}
    if(!bids.length)continue;bids.sort((a,b)=>b.v-a.v);const {t,wd}=bids[0];SAVE.ai[t.idx].bud-=round5k(wd*0.5);
    per[t.idx]=(per[t.idx]||0)+1;movePlayer(p,t.idx);p.wage=round5k(wd);p.ce=S().n+(p.age>=31?0:1)+Math.floor(R()*2);p.viaFA=S().n;delete p.fk;delete p.faW;k++;SAVE.faSigned=(SAVE.faSigned||0)+1;
    if(k<=6)news(`✍️ Wolny zawodnik ${p.first} ${p.last} (${POS_NAMES[p.pos]}, ${r}) podpisuje kontrakt z ${t.name}${LA[lgOf(t.idx)]<idealRef-1.5?' — schodzi ligę niżej, żeby się odbudować':''}.`);
    while(t.players.length>16){const ex=t.players.filter(x=>posCount(t,x.pos)>POS_STD[x.pos]).sort((a,b)=>rating(a)-rating(b))[0]||t.players.slice().sort((a,b)=>rating(a)-rating(b))[0];ex.tm=-1;ex.wage=0;ex.ce=0;t.players=W().players.filter(x=>x.tm===t.idx&&!x.jr);}}
  // kto nie znalazł klubu: obniża oczekiwania, a po trzecim oknie kończy karierę albo wyjeżdża
  const gone=new Set();for(const p of W().players){if(p.tm>=0||p.jr)continue;p.faW=(p.faW||0)+1;if(p.faW>=3&&!(p.age<21))gone.add(p.id);}
  if(gone.size){W().players=W().players.filter(p=>!gone.has(p.id));SAVE.faGone=(SAVE.faGone||0)+gone.size;}syncTeams();}
// gwiazda dłużej w jednym klubie chce nowego wyzwania: klub komputera ją sprzedaje temu, kto zapłaci (albo za granicę)
function starsMove(){if(!BAL3)return;const n=S().n;for(const p of W().players.slice()){if(p.tm<0||p.tm===SAVE.team||p.jr||p.loan)continue;const r=rating(p);if(r<80||p.age>31)continue;if(n-(p.jn||1)<3||R()>=0.15)continue;
    const from=p.tm;const fee=askingPrice(p);const bids=TEAMS.filter(t=>t.idx!==from&&t.idx!==SAVE.team&&t.players.length<16&&SAVE.ai[t.idx].bud>=fee&&teamWages(t.idx)+wageDemand(p)<=wageCap(t.idx)).map(t=>({t,v:SAVE.ai[t.idx].bud+R()*200000})).sort((a,b)=>b.v-a.v);
    if(bids.length){const t=bids[0].t;SAVE.ai[t.idx].bud-=fee;SAVE.ai[from].bud+=fee;movePlayer(p,t.idx);p.wage=wageDemand(p);news(`🔁 ${p.first} ${p.last} chciał nowego wyzwania: przechodzi z ${TEAMS[from].name} do ${t.name} za ${fmt(fee)}.`);}
    else{const fe=round5k(pValue(p)*0.8);SAVE.ai[from].bud+=fe;W().players=W().players.filter(x=>x.id!==p.id);news(`✈️ ${p.first} ${p.last} (${TEAMS[from].name}) szuka nowego wyzwania za granicą (${fmt(fe)}).`);}}
  syncTeams();}
function initWorld(){
  SAVE.lg=TEAM_DEFS.map(d=>d.lg||0);
  resetTeams();
  SAVE.world={players:[],nextId:1};
  const sn=SAVE.season?SAVE.season.n:1;
  for(const t of TEAMS)for(const p0 of t.players){const p=Object.assign({},p0,{tm:t.idx});initPlayerMeta(p,sn,false);setDob(p);W().players.push(p);}
  SAVE.ai=TEAMS.map(t=>({rep:initRep(t),bud:0}));
  for(const a of SAVE.ai)a.bud=round5k(200000+a.rep*15000+R()*300000);
  if(!BAL3)for(let i=0;i<20;i++){const age=20+Math.floor(R()*13);const p=genPlayer(randPos(),10+R()*3,age);p.tm=-1;initPlayerMeta(p,1,true);W().players.push(p);}
  const rep=SAVE.ai[SAVE.team].rep;
  SAVE.fin={bal:round5k(1000000+rep*15000),log:[],sea:{},prev:null};
  SAVE.training={focus:'bal',int:1};
  SAVE.news=[];SAVE.inbox=[];
  syncTeams();initClub();if(BAL3){faMarket();syncTeams();}
}
function news(t){SAVE.news=SAVE.news||[];SAVE.news.unshift({d:SAVE._now||today(),t});SAVE.news=SAVE.news.slice(0,40);try{if(typeof mailFromNews==='function')mailFromNews(t);}catch(e){}}
function money(amt,cat){const f=SAVE.fin;f.bal+=amt;f.sea[cat]=(f.sea[cat]||0)+amt;if(typeof budBook==='function')budBook(amt,cat);}
function finLog(t,a){const f=SAVE.fin;f.log.unshift({d:today(),t,a});f.log=f.log.slice(0,80);}
function payroll(){const me=SAVE.team;return myTeam().players.reduce((s,p)=>s+(p.wage||0)*(p.loan?p.loan.share:1),0)+(typeof myLoansOut==='function'?myLoansOut().reduce((s,p)=>s+(p.wage||0)*(1-p.loan.share),0):0);}
const TV_ROUND=45000;
function tvRound(){return Math.round(TV_ROUND*LG_ECO[myLg()]/1000)*1000;}

// ---- trening / rozwój / kontuzje ----
const TRAIN_FOCUS=[['bal','Zrównoważony','Rozwój wszystkich cech, z naciskiem na te ważne dla pozycji.',[]],['atk','Atak','Atak, siła, skoczność.',['ata','sil','sko']],['def','Przyjęcie i obrona','Przyjęcie, obrona, odbicie dołem, zwinność.',['prz','obr','tod','zwi']],['blk','Blok','Blok, skoczność, szybkość.',['blo','sko','szy']],['srv','Zagrywka','Zagrywka i siła.',['zag','sil']],['set','Rozegranie','Rozegranie i odbicie palcami.',['roz','tpa']],['phy','Przygotowanie fizyczne','Siła, szybkość, skoczność, zwinność, kondycja.',['sil','szy','sko','zwi','kon']],['men','Mentalny','Koncentracja, opanowanie, zaangażowanie, waleczność.',['kcj','opa','zaa','wal']]];
const TRAIN_INT=[['Lekki',0.7,0.6,'Wolniejszy rozwój, mniej kontuzji.'],['Normalny',1,1,'Balans rozwoju i ryzyka.'],['Ciężki',1.35,1.8,'Szybszy rozwój, ale prawie 2× więcej kontuzji.']];
const GRP={};for(const [k] of ATTRS)GRP[k]='tech';for(const [k] of PHYS)GRP[k]='phys';for(const [k] of MENTAL)GRP[k]='ment';
function develop(p,focus,intI,played,mods,jr,km){
  const r=rating(p);const gap=(p.pot||r)-r;if(gap<=0)return;
  const af=p.age<=20?1:p.age<=23?0.75:p.age<=26?0.45:p.age<=29?0.2:0.05;
  const tm=(hasT(p,'amb')?1.15:1)*(hasT(p,'pra')?1.2:1)*(hasT(p,'len')?0.78:1)*(hasT(p,'pro')?1.05:1);
  const pts=tm*af*TRAIN_INT[intI][1]*(played?1.25:1)*Math.min(1.5,0.5+gap/20)*0.17*(mods?(jr?mods.jr:mods.all):1)*(km==null?1:km)*(BAL2&&p.tm!==SAVE.team?0.55*(BAL3&&p.tm>=0?[1,0.85,0.7][LG_LV[lgOf(p.tm)]]||0.7:1):1);// niższa liga = słabsze warunki treningowe
  const fk=(TRAIN_FOCUS.find(f=>f[0]===focus)||TRAIN_FOCUS[0])[3];const pw=WEIGHTS[p.pos];
  const w={};let tot=0;for(const k of ALL_KEYS){let x=0.3;if(pw[k])x+=1.5;if(fk.includes(k))x+=3;w[k]=x;tot+=x;}
  p.xp=p.xp||{};
  for(const k of ALL_KEYS){if(p[k]>=20)continue;const v=(p.xp[k]||0)+pts*w[k]/tot*(mods?mods[GRP[k]]:1);if(v>=1){p[k]++;p.xp[k]=Math.round((v-1)*100)/100;}else p.xp[k]=Math.round(v*1000)/1000;}
}
function injuryCheck(m,mult){
  for(const sd of m.sides){const mine=sd.team.idx===SAVE.team;const md=clubMods(sd.team.idx);const im=(mine?TRAIN_INT[SAVE.training.int][2]:1)*md.injChance;
    for(const cp of sd.pl){const x=cp.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;ROUND_PLAYED.add(cp.id);
      const P=PLAYERS[cp.id];if(!P)continue;const p=P.p;if(p.inj)continue;
      if(R()<0.012*im*(1.3-p.kon/20*0.6)*mult*(hasT(p,'odp')?0.65:1)*reinjF(p)){const d=1+Math.floor(R()*R()*7);const days=Math.max(3,Math.round((d*7-3+R()*6)*md.injDur));p.inj=days;p.injUntil=addDays(today(),days);p.injN=injName(days);p.injD=days;if(!mine)aiStarInjNews(p,days);if(mine)news(`🚑 ${p.first} ${p.last} doznał kontuzji (${p.injN.toLowerCase()}) — przerwa ok. ${days} dni (powrót ok. ${fmtDMY(p.injUntil)}).`);}}}
}
function roundTick(kind,home,att,opp){
  const tr=SAVE.training;
  const MODS={};const mm=ti=>MODS[ti]||(MODS[ti]=clubMods(ti));
  for(const p of W().players){
    if(p.tm<0)continue;const mine=p.tm===SAVE.team;
    if(mine&&!p.jr){if(ROUND_PLAYED.has(p.id))develop(p,'bal',tr.int,true,mm(p.tm),false,0.3);continue;}// reszta rozwoju: codzienne treningi (training.js)
    develop(p,mine?(tr.focus||'bal'):'bal',mine?tr.int:1,ROUND_PLAYED.has(p.id),mm(p.tm),p.jr);}
  if((kind==='liga'||kind==='po')&&typeof ixRound==='function')try{ixRound();}catch(e){console.error(e);}
  if(kind==='liga'||kind==='po')for(const p of myTeam().players){if(ROUND_PLAYED.has(p.id)){p.unh=0;continue;}if(p.inj)continue;p.unh=(p.unh||0)+1;
    if(hasT(p,'kap')&&p.unh===3)news(`😤 ${p.first} ${p.last} jest wściekły, że nie gra. Psuje atmosferę w szatni (niższe morale drużyny).`);
    if(hasT(p,'amb')&&p.unh===4)news(`📢 ${p.first} ${p.last} (ambitny) chce więcej grać. Jeśli nadal będzie siedział na ławce, straci humor.`);}
  ROUND_PLAYED=new Set();
  const s=S();
  if((kind==='cup'||kind==='euro')&&home){const t=payMatchday(kind==='euro'?1.4:0.8,att,opp);finLog(`${kind==='euro'?'Puchary europejskie':'Puchar kraju'}: mecz u siebie (${t.att} widzów)`,t.tot);}
  if(kind==='liga'){money(tvRound(),'Prawa TV');
    let t=null;if(home)t=payMatchday(1,att,opp);
    finLog(`Kolejka ${s.round}: prawa TV${t?`, mecz u siebie (${t.att} widzów: bilety, jedzenie, parking)`:''}`,tvRound()+(t?t.tot:0));}
  if(kind==='po'&&home){const t=payMatchday(1.5,att,opp);finLog(`Play-off: mecz u siebie (${t.att} widzów: bilety, jedzenie, parking)`,t.tot);}
}

// ---- transfery ----
function windowOpen(){const p=S().phase;return p==='off'||p==='spar';}
function posCount(t,pos){return t.players.filter(p=>p.pos===pos).length;}
var ST_C=null;// pamięć podręczna składów na czas przerwy między sezonami
function isStarter(p){if(p.tm<0)return false;if(ST_C){let s=ST_C[p.tm];if(!s)s=ST_C[p.tm]=new Set(Object.values(autoLineup(TEAMS[p.tm])));return s.has(p.id);}const lu=autoLineup(TEAMS[p.tm]);return Object.values(lu).includes(p.id);}
function askingPrice(p){return Math.round(pValue(p)*(isStarter(p)?1.35:1.05)/10000)*10000;}
function canSellAI(p){if(p.loan)return false;const t=TEAMS[p.tm];return posCount(t,p.pos)-1>=POS_MIN[p.pos]&&t.players.length-1>=SQUAD_MIN;}
function wageNeeded(p){if(p.tm===SAVE.team)return round5k(wageDemand(p)*negF()*(1+(p.raiseReq||0)));const my=SAVE.ai[SAVE.team].rep;const cur=p.tm>=0?SAVE.ai[p.tm].rep:0;const ld=p.tm>=0?Math.max(0,myLg()-lgOf(p.tm)):0;return round5k(wageDemand(p)*(p.tm<0?0.9:cur>my+10?1.15:1)*(1+0.35*ld)*negF());}
function contractEndFor(years){const s=S();return (s.phase==='off'?s.n-1:s.n)+years;}
function movePlayer(p,tm){if(ST_C){delete ST_C[p.tm];delete ST_C[tm];}p.tm=tm;if(tm>=0&&typeof S==='function'&&S())p.jn=S().n;if(tm>=0)assignNum(p,tm);syncTeams();}
function tradeMsg(ok,t){ui.tmsg={ok,t};render();}
function makeOffer(pid,fee,wage,years){if(SAVE.trBan)return tradeMsg(false,'Zarząd zablokował zakupy, dopóki dług klubu nie spadnie poniżej 500 tys. zł.');
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
  achEv('sign');if(from>=0){achEv('buy');achMax('buyFee',fee);if(p.age<=21)achEv('buyYoung');if(lgOf(from)<myLg())achMax('buyUp',1);}else achEv('free');
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
  money(fee,'Transfery');SAVE.ai[tm].bud-=fee;finLog(`Sprzedaż: ${p.first} ${p.last} (${TEAMS[tm].short})`,fee);achEv('sell');achEv('sellTot',fee);achMax('sellFee',fee);if(lgOf(tm)===0)achEv('sellEL');
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
function renew(pid,wage,years){const p=PLAYERS[pid].p;delete p.raiseReq;const need=wageNeeded(p);
  if(wage<need)return tradeMsg(false,`${p.last} nie zgadza się. Chce co najmniej ${fmt(need)} rocznie.`);
  p.wage=round5k(wage);p.ce=contractEndFor(years);achEv('renew');news(`✍️ ${p.first} ${p.last} przedłużył kontrakt do ${ceDate(p.ce)}.`);save();tradeMsg(true,`${p.last} przedłużył kontrakt do ${ceDate(p.ce)}.`);}

// ---- AI: transfery i kontrakty ----
function aiSign(t,pos){
  const fa=W().players.filter(p=>p.tm<0&&p.pos===pos&&!p.inj).map(p=>[p,rating(p)]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const tS=teamStrength(t);let p=fa.find(x=>rating(x)<=tS+4)||fa[0];if(ST_C)delete ST_C[t.idx];
  if(!p){p=genPlayer(pos,teamQ(t)-2.5+R(),21+Math.floor(R()*10));initPlayerMeta(p,S().n,true);W().players.push(p);}
  p.tm=t.idx;assignNum(p,t.idx);p.wage=wageDemand(p);p.ce=S().n+Math.floor(R()*2);
  t.players=W().players.filter(x=>x.tm===t.idx&&!x.jr);return p;}
function aiOffseason(){
  const n=S().n;if(BAL3)starsMove();
  // kadra młodzieżowa: zawodnicy po 21. roku życia odchodzą z zespołu
  for(const t of TEAMS)if(isYT(t.idx))for(const p of t.players)if(p.age>21){p.tm=-1;p.wage=0;p.ce=0;}
  for(const t of TEAMS){if(t.idx===SAVE.team)continue;
    for(const p of t.players){if(p.ce<n){const over=teamWages(t.idx)>wageCap(t.idx);const keep=R()<(isStarter(p)?0.85:0.55)*(over?0.6:1)&&p.age<34;if(keep){p.wage=wageDemand(p);p.ce=n+Math.floor(R()*3);}else{p.tm=-1;p.wage=0;p.ce=0;}}}}
  syncTeams();ST_C={};
  try{
  if(BAL3)faSignAI();
  const order=TEAMS.filter(t=>t.idx!==SAVE.team).sort(()=>R()-0.5);
  for(const t of order){
    const pr=SAVE.ai[t.idx].promo;delete SAVE.ai[t.idx].promo;
    for(let tr=0;tr<(pr?6:1);tr++)if(pr||R()<0.4){const pos=pr?['R','A','P','P','S','S','L'][tr%7]:['R','A','P','P','S','S','L'][Math.floor(R()*7)];
      const cur=t.players.filter(x=>x.pos===pos).map(x=>rating(x)).sort((a,b)=>b-a);
      const c=pr?W().players.filter(p=>p.tm>=0&&p.tm!==t.idx&&p.tm!==SAVE.team&&p.pos===pos&&canSellAI(p)&&(!isStarter(p)||lgRef(lgOf(p.tm))<lgRef(lgOf(t.idx))-3)&&rating(p)>(cur[0]||0)-2&&askingPrice(p)<=SAVE.ai[t.idx].bud*0.6).sort((a,b)=>rating(b)-rating(a))[0]
        :W().players.filter(p=>p.tm>=0&&p.tm!==t.idx&&p.tm!==SAVE.team&&p.pos===pos&&!isStarter(p)&&canSellAI(p)&&rating(p)>(cur[1]||0)).sort((a,b)=>rating(b)-rating(a))[0];
      if(c&&BAL2&&teamWages(t.idx)+wageDemand(c)>wageCap(t.idx))continue;
      if(c){const fee=askingPrice(c);if(SAVE.ai[t.idx].bud>=fee){const from=c.tm;SAVE.ai[t.idx].bud-=fee;SAVE.ai[from].bud+=fee;movePlayer(c,t.idx);c.wage=wageDemand(c);c.ce=n+1+Math.floor(R()*2);
        if(tmCountry(t.idx)===tmCountry(SAVE.team)||tmCountry(from)===tmCountry(SAVE.team))news(`🔁 Transfer: ${c.first} ${c.last} przechodzi z ${TEAMS[from].name} do ${t.name} za ${fmt(fee)}.`);}}}
    if(pr&&FIX_PRO)promoBoost(t);
    for(const pos of ['R','A','P','S','L'])while(posCount(t,pos)<POS_STD[pos]&&t.players.length<16)aiSign(t,pos);
    while(t.players.length<SQUAD_MIN+1)aiSign(t,randPos());
    if(ST_C)delete ST_C[t.idx];
    while(t.players.length>16){const ex=t.players.filter(p=>posCount(t,p.pos)>POS_STD[p.pos]).sort((a,b)=>rating(a)-rating(b))[0]||t.players.slice().sort((a,b)=>rating(a)-rating(b))[0];ex.tm=-1;ex.wage=0;ex.ce=0;t.players=W().players.filter(x=>x.tm===t.idx&&!x.jr);}
  }
  }finally{ST_C=null;}
  syncTeams();
}
// limit płac klubu (zależny od ligi) – bogaty klub nie skupuje wszystkich gwiazd
const WAGE_CAP=[5000000,1950000,850000,3100000,1100000,7100000,2600000,5600000,2000000];
function teamWages(ti){return TEAMS[ti].players.reduce((a,p)=>a+(p.wage||0)*(p.loan&&p.tm===ti?p.loan.share:1),0);}
function wageCap(ti){const a=SAVE.ai&&SAVE.ai[ti];if(a&&a.wg&&a.wgLg===lgOf(ti))return a.wg;return WAGE_CAP[lgOf(ti)]||WAGE_CAP[2];}
// gwiazdy komputera odchodzą do lig zagranicznych (klub dostaje odstępne)
function starsAbroad(){const n=S().n;const out=[];for(const p of W().players){if(p.tm<0||p.tm===SAVE.team||p.jr||p.loan)continue;const r=rating(p);if(r<(FIX_DYN&&SAVE.lastChamps&&SAVE.lastChamps.includes(p.tm)?79:82)||p.age>31)continue;
    const champ=FIX_DYN&&SAVE.lastChamps&&SAVE.lastChamps.includes(p.tm);const ch=0.12+(r-82)*0.03+(champ?0.18:0);if(R()<ch){const ti=p.tm;const fee=round5k(pValue(p)*0.8);const L=lgOf(ti);
      // najpierw klub z mocniejszej ligi w grze (inny kraj), który ma pieniądze i miejsce w budżecie płacowym
      const dest=TEAMS.filter(t=>t.idx!==SAVE.team&&t.idx!==ti&&lgCountry(lgOf(t.idx))!==lgCountry(L)&&lgRef(lgOf(t.idx))>=lgRef(L)+2&&SAVE.ai[t.idx].bud>=fee&&teamWages(t.idx)+wageDemand(p)<=wageCap(t.idx)*1.05&&t.players.length<16).sort((a,b)=>SAVE.ai[b.idx].rep-SAVE.ai[a.idx].rep)[0];
      const loud=lgCountry(L)===tmCountry(SAVE.team)||r>=86;
      if(dest){SAVE.ai[dest.idx].bud-=fee;SAVE.ai[ti].bud+=fee;movePlayer(p,dest.idx);p.wage=wageDemand(p);p.ce=n+1+Math.floor(R()*2);if(loud)news(`✈️ ${p.first} ${p.last} (${TEAMS[ti].name}) przechodzi do ${dest.name} (${lgFull(lgOf(dest.idx))}) za ${fmt(fee)}.`);continue;}
      if(LG_LV[L]===0&&lgRef(L)>=Math.max(...allLgs().map(lgRef))-1&&R()<0.5)continue;// z najmocniejszej ligi rzadziej się wyjeżdża
      SAVE.ai[ti].bud+=fee;out.push(p.id);if(loud)news(`✈️ ${p.first} ${p.last} (${TEAMS[ti].name}) wyjeżdża do ligi ${['japońskiej','rosyjskiej','brazylijskiej','katarskiej','chińskiej'][Math.floor(R()*5)]} za ${fmt(fee)}.`);}}
  {const s=new Set(out);if(out.length)W().players=W().players.filter(p=>!s.has(p.id));syncTeams();
    for(const t of TEAMS){if(t.idx===SAVE.team)continue;for(const pos of ['R','A','P','S','L'])while(posCount(t,pos)<POS_STD[pos]&&t.players.length<16)aiSign(t,pos);}syncTeams();}}
function offseason(){
  try{if(typeof euroFinishAll==='function')euroFinishAll();}catch(e){console.error(e);}
  try{if(typeof ntFinishAll==='function')ntFinishAll();}catch(e){console.error(e);}
  try{if(typeof histSeasonEnd==='function')histSeasonEnd();}catch(e){console.error(e);}
  try{if(typeof loansReturn==='function')loansReturn();}catch(e){console.error(e);}
  const old=S(),n=old.n+1;
  advanceTo(`${2026+old.n}-06-01`);
  // starzenie, spadek formy, emerytury
  for(const p of W().players){const x=formDelta(p);p.lsR=x?[Math.round(x.d*100)/100,x.n,Math.round(x.avg*100)/100]:null;}
  const keep=[];
  for(const p of W().players){
    if(BAL2){if(p.age>=27)for(const [k] of PHYS)if(R()<(p.age-26)*0.18*(hasT(p,'pro')?0.6:1)&&p[k]>1)p[k]--;
      if(p.age>=30)for(const [k] of ATTRS)if(k!=='czy'&&R()<(p.age-29)*0.14*(hasT(p,'pro')?0.6:1)&&p[k]>1)p[k]--;}
    else{if(p.age>=28)for(const [k] of PHYS)if(R()<(p.age-27)*0.14*(hasT(p,'pro')?0.6:1)&&p[k]>1)p[k]--;
    if(p.age>=31)for(const [k] of ATTRS)if(k!=='czy'&&R()<(p.age-30)*0.1*(hasT(p,'pro')?0.6:1)&&p[k]>1)p[k]--;}
    const r=rating(p);if(p.pot<r)p.pot=r;
    const retire=p.age>=37||(p.age>=35&&R()<0.5)||(p.tm<0&&p.age>=33&&R()<0.5);
    if(retire){if(p.tm===SAVE.team)news(`👋 ${p.first} ${p.last} (${p.age} l.) kończy karierę.`);continue;}
    keep.push(p);}
  W().players=keep;syncTeams();
  // awanse i spadki, potem nowy sezon (okno transferowe)
  applyLeagueMoves(old);
  newSeason(n,'off');
  aiOffseason();juniorsOffseason();aiInfraOffseason();refreshStaffPool();try{if(typeof aiLoans==='function')aiLoans();}catch(e){console.error(e);}
  {const ps=staffSkill('psy');const t=TEAMS[SAVE.team];if(t&&ps>10)for(const p of t.players){if(p.tr&&p.tr.includes('ner')&&R()<(ps-10)*0.02){p.tr=p.tr.filter(x=>x!=='ner');news(`🧠 Praca z psychologiem: ${p.first} ${p.last} nie jest już nerwowy.`);}}}
  for(const r in SAVE.staff){const st=SAVE.staff[r];if(st){st.age++;if(st.age<50&&R()<0.4&&st.skill<20)st.skill++;}}
  // wolni zawodnicy: porządki i uzupełnienie
  if(BAL3){faMarket();}else{let fa=W().players.filter(p=>p.tm<0).sort((a,b)=>rating(b)-rating(a));
  if(fa.length>30){const drop=new Set(fa.slice(30).map(p=>p.id));W().players=W().players.filter(p=>!drop.has(p.id));}
  while(W().players.filter(p=>p.tm<0).length<20){const p=genPlayer(randPos(),10+R()*3,20+Math.floor(R()*12));p.tm=-1;initPlayerMeta(p,n,true);W().players.push(p);}}
  if(typeof aiBudgets==='function'){aiBudgets();for(const t of TEAMS)if(SAVE.ai[t.idx])SAVE.ai[t.idx].wgLg=lgOf(t.idx);}
  else for(const a of SAVE.ai)a.bud=round5k(BAL2?a.bud*0.35+150000+a.rep*12000+R()*250000:a.bud*0.5+200000+a.rep*15000+R()*300000);
  if(BAL2)starsAbroad();
  for(const p of W().players){p.base=snap(p);}
  // oferty za zawodników użytkownika
  SAVE.inbox=[];
  const mine=myTeam().players.filter(p=>rating(p)>=74&&p.ce>=n).sort(()=>R()-0.5);
  for(const p of mine.slice(0,1+Math.floor(R()*2))){const buyers=findBuyers(p.id);if(buyers.length&&R()<0.7){const b=buyers[0];const o={pid:p.id,tm:b.tm,fee:Math.round(b.fee*(1.05+R()*0.25)/10000)*10000};SAVE.inbox.push(o);sendMail({cat:'trans',from:TEAMS[b.tm].name,t:`Oferta za ${p.first} ${p.last}: ${fmt(o.fee)}`,s:`${TEAMS[b.tm].name} chce kupić zawodnika. Decyzja w oknie transferowym.`,b:{type:'offer',pid:p.id,tm:b.tm,fee:o.fee},act:1,lab:'Oferta kupna'});}}
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
  s.phase='spar';ui.tmsg=null;try{campStart();}catch(e){}syncDate();save();render();
}

// ---- widoki ----
function cardModal(){
  const P=PLAYERS[ui.card];if(!P)return '';const p=P.p,t=P.t,mine=p.tm===SAVE.team;
  const r=rating(p),br=baseRating(p);
  const grp=(n,G)=>`<div class="cgrp"><h4>${n}</h4>${G.map(([k,l])=>{const d=mine&&p.base?p[k]-p.base[k]:0;const ae=aEst(p,k);return `<div class="crow"><span>${l}</span><span>${d?`<small class="${d>0?'good':'bad'}">${d>0?'+':''}${d}</small> `:''}<span class="attr ${aCls(Math.round((ae[0]+ae[1])/2))}">${aTxt(p,k)}</span></span></div>`;}).join('')}</div>`;
  const st=S().ps[p.id];
  let act='';const o=windowOpen();
  if(mine&&p.jr){act+=`<div class="act"><h4>Junior (U20)</h4><p class="small">Gra w lidze juniorów. Awans do pierwszej drużyny daje kontrakt na 3 sezony z pensją ok. ${fmt(Math.max(40000,wageDemand(p)))}/rok.</p><div class="row wrap"><button class="btn" onclick="promote('${p.id}')">⬆️ Awansuj do pierwszej drużyny</button><button class="link" onclick="releaseJunior('${p.id}')">${ui.confirm==='rj'+p.id?'Na pewno?':'Zwolnij z akademii'}</button></div></div>`;}
  else if(mine&&p.loan&&p.loan.from!==SAVE.team){act+=`<div class="act"><h4>🔁 Wypożyczony</h4><p class="small">Gra u nas do końca sezonu, potem wraca do ${tName(p.loan.from)}. Nie można go sprzedać ani przedłużyć z nim kontraktu.</p></div>`;}
  else if(mine){act+=myContractAct(p)+(typeof loanOutAct==='function'?loanOutAct(p):'');}
  else{act+=(p.loan?`<div class="act"><h4>🔁 Wypożyczony</h4><p class="small">Gra w ${tName(p.tm)} na wypożyczeniu z ${tName(p.loan.from)} do końca sezonu — teraz nie można go kupić.</p></div>`:buyAct(p)+(typeof loanInAct==='function'?loanInAct(p):''));}
  return `<div class="modal" onclick="if(event.target===this){ui.card=null;ui.offers=null;render()}"><div class="mcard">
   <div class="row"><span class="cface">${pFace(p,84)}</span><div><div class="mut small">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].name)+(p.jr?' · juniorzy U20':''):'Wolny zawodnik'}</div><h2>${p.num&&p.tm>=0?p.num+'. ':''}${esc(p.first)} ${esc(p.last)}${p.star?' <span title="Gwiazda zespołu">⭐</span>':''}</h2></div><span class="sp"></span><button class="ghost" onclick="ui.card=null;ui.offers=null;render()">✕</button></div>
   ${ui.tmsg?`<div class="tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
   <div class="cinfo"><div><span class="mut small">Pozycja</span><b>${POS_NAMES[p.pos]}</b></div><div><span class="mut small">Wiek</span><b>${p.age} <small class="mut">(ur. ${p.dob?fmtDMY(p.dob):'?'})</small></b></div><div><span class="mut small">Wzrost</span><b>${p.h} cm</b></div>
   <div><span class="mut small">Ocena${mine?'':' (wiedza '+knowOf(p)+'%)'}</span><b>${mine?r:rTxt(p)}${mine&&r!==br?` <small class="${r>br?'good':'bad'}">${r>br?'+':''}${r-br}</small>`:''}</b></div><div><span class="mut small">Potencjał${p.tm!==SAVE.team?' (wg skauta)':''}</span><b class="stars">${potStars(p)}</b></div><div><span class="mut small">Wartość</span><b>${fmt(pValue(p))}</b>${valTip(p)?`<small class="mut" style="display:block;font-size:10.5px">${esc(valTip(p))}</small>`:''}</div>
   <div><span class="mut small">Pensja</span><b>${p.tm>=0?fmt(p.wage)+'/rok':'—'}</b></div><div><span class="mut small">Kontrakt do</span><b>${p.tm>=0?ceDate(p.ce):'—'}</b></div><div><span class="mut small">Forma</span><b>${formChip(p,true)} <small class="fmhs">${fmHist(p)}</small></b></div>${mine?`<div><span class="mut small">Świeżość</span><b style="color:${frCol(frOf(p))}">${Math.round(frOf(p))}%</b></div>`:''}<div><span class="mut small">Zdrowie</span><b>${p.inj?`🚑 do ${p.injUntil?fmtDMY(p.injUntil):'?'} (${p.inj} dni)`:'✅ zdrowy'}</b></div>${p.tm===SAVE.team&&typeof roleOf==='function'?`<div class="pcrole"><span class="mut small">Ustalona rola (czas gry)</span><b>${roleN(roleOf(p))}${p.role?'':' <small class="mut">(domyślna)</small>'}</b><small class="mut">oczekuje gry w ok. ${rolePct(roleOf(p))}% meczów${plShare(p)!=null?` · grał w ${Math.round(plShare(p)*100)}% ostatnich`:''}</small><button class="link small" onclick="ui.roleP='${p.id}';render()">Porozmawiaj o roli →</button></div>`:''}</div>
   <div class="ptr" style="margin:8px 0">${typeof trKnown==='function'&&!trKnown(p)?'<div class="small mut">Charakter nieznany — skaut może go sprawdzić.</div>':''}${(ensTraits(p),typeof trKnown==='function'&&!trKnown(p)?[]:p.tr).map(k=>`<div>${trChip(k,true)}<span class="small mut">${esc(TRAITS[k][2])}</span></div>`).join('')}${mine&&!p.jr?(isCap(p)?'<div><span class="capb">C</span> <span class="small">Kapitan drużyny</span></div>':`<div><button class="link" onclick="setCaptain('${p.id}')">©️ Mianuj kapitanem</button></div>`):''}</div><div class="cgrid">${grp('Techniczne',ATTRS)}${grp('Fizyczne',PHYS)}${grp('Mentalne',MENTAL)}</div>
   <p class="mut small">${mine?'Małe liczby przy atrybutach to zmiana od początku sezonu.':`Zakresy (np. 12–15) to szacunek skautów — wiedza o zawodniku ${knowOf(p)}%. ${SC().tasks.some(t=>t.pid===p.id)?'Skaut właśnie go obserwuje.':`<button class="link" onclick="ui.card=null;observe('${p.id}')">Zleć obserwację</button>`} · <button class="link" onclick="toggleShort('${p.id}')">${isShort(p.id)?'★ obserwowany':'☆ dodaj do obserwowanych'}</button>`}</p>
   ${st?`<p class="small">Sezon ${sLabel(S().n)}: <b>${st.m}</b> meczów · <b>${st.pts}</b> pkt · atak ${pc(st.kill,st.att)} · bloki ${st.blk} · asy ${st.ace} · MVP ${st.mvp}</p>`:''}
   ${act}</div></div>`;
}
function openCard(id){ui.card=id;ui.offers=null;ui.tmsg=null;ui.confirm=null;render();}
function financeView(){
  const f=SAVE.fin;const pay=payroll(),sp=sponsorAmt();const rep=SAVE.ai[SAVE.team].rep;
  const stp=staffPay(),mnt=maintenance()*12,shp=shopIncome(myInfra().sklep)*12;const md=matchday(1,null,null,true);const kh=ECO().karS.season===S().n?ECO().karS.inc:0;
  const proj=sp+tvRound()*nRounds()+md.tot*Math.ceil(nRounds()/2)+shp+kh-pay-stp-mnt;
  const cats=['Sponsor','Prawa TV','Bilety','Karnety','Gastronomia','Parking','Sklep','Obóz','Nagrody','Transfery','Pensje','Sztab','Utrzymanie','Infrastruktura','Marketing','Odprawy','Kredyt','Kary'];
  const row=(o)=>cats.map(c=>`<tr><td class="l">${c}</td><td class="${(o[c]||0)<0?'bad':(o[c]||0)>0?'good':''}">${o[c]?fmt(o[c]):'—'}</td></tr>`).join('')+`<tr><td class="l"><b>Razem</b></td><td><b>${fmt(cats.reduce((s,c)=>s+(o[c]||0),0))}</b></td></tr>`;
  const spFree=typeof spFreeN==='function'?spFreeN():0;
  return `<div class="card fin"><div class="big ${f.bal<0?'bad':''}">${fmtFull(f.bal)}</div><div class="mut">Saldo klubu${f.bal<0?' — jesteś na minusie! Dopuszczalny debet to 500 tys. zł, poniżej nie kupisz zawodników.':''}</div></div>
  ${typeof budgetCard==='function'?budgetCard():''}
  <div class="card"><h2>Budżet roczny</h2><table class="cmp"><tbody>
   <tr><td class="l">Pensje zawodników (rocznie)</td><td class="bad">−${fmt(pay)}</td></tr>
   <tr><td class="l">Pensje sztabu szkoleniowego</td><td class="bad">−${fmt(stp)}</td></tr>
   <tr><td class="l">Utrzymanie obiektów</td><td class="bad">−${fmt(mnt)}</td></tr>
   <tr><td class="l">Sklep kibica</td><td class="good">+${fmt(shp)}</td></tr>
   <tr><td class="l">Sponsorzy (podpisane umowy, renoma ${rep}/100)</td><td class="good">+${fmt(sp)}</td></tr>
   <tr><td class="l">Prawa TV (${fmt(tvRound())} za kolejkę, ${LG_N[myLg()]})</td><td class="good">+${fmt(tvRound()*nRounds())}</td></tr>
   <tr><td class="l">Mecze u siebie: bilety, jedzenie, parking (ok. ${fmt(md.tot)} za mecz)</td><td class="good">~ +${fmt(md.tot*Math.ceil(nRounds()/2))}</td></tr>${kh?`<tr><td class="l">Karnety (sprzedane w tym sezonie)</td><td class="good">+${fmt(kh)}</td></tr>`:''}
   <tr><td class="l"><b>Prognoza bilansu (bez transferów i nagród)</b></td><td class="${proj<0?'bad':'good'}"><b>${proj>=0?'+':''}${fmt(proj)}</b></td></tr></tbody></table>
   ${spFree?`<p class="small" style="color:var(--acc)">Czeka ${spFree} ${spFree===1?'oferta sponsorska':spFree<5?'oferty sponsorskie':'ofert sponsorskich'} — podpisz umowy w zakładce <button class="link" onclick="go('sponsorzy')">Sponsorzy</button>, żeby poprawić bilans.</p>`:''}<p class="mut small">Pensje i sponsorzy rozliczają się co miesiąc (1. dnia), prawa TV co kolejkę ligową, bilety po każdym meczu u siebie. Nagrody za miejsce w sezonie: od 50 tys. do 1 mln zł. Lepsze wyniki podnoszą renomę, a ta podnosi sponsorów i frekwencję.</p></div>${pricesCard()}${mdTableCard()}
  <div class="card"><h2>Sezon ${sLabel(S().n)}</h2><table class="cmp"><tbody>${row(f.sea)}</tbody></table>${f.prev?`<h3>Poprzedni sezon</h3><table class="cmp"><tbody>${row(f.prev)}</tbody></table>`:''}</div>
  <div class="card"><h2>Historia operacji</h2>${f.log.length?f.log.slice(0,30).map(x=>`<div class="res row"><span class="mut small">${x.d?fmtDMY(x.d):''}</span> ${esc(x.t)}<span class="sp"></span><b class="${x.a<0?'bad':'good'}">${x.a>=0?'+':''}${fmt(x.a)}</b></div>`).join(''):'<p class="mut">Brak operacji.</p>'}</div>`;
}
function offView(){
  const s=S(),exp=expiring();
  return `<div class="card"><h2>Okno transferowe przed sezonem ${sLabel(s.n)}</h2><p>Między sezonami: zawodnicy są o rok starsi, część zakończyła kariery, kluby dostały juniorów z akademii, a rywale zrobili transfery (szczegóły w wiadomościach). Teraz Twój ruch: przedłuż kontrakty, kupuj i sprzedawaj (zakładka Transfery).</p>
  ${ui.tmsg?`<div class="tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
  ${exp.length?`<h3>Wygasające kontrakty (${exp.length})</h3><p class="mut small">Ci zawodnicy odejdą przy starcie sezonu, jeśli nie przedłużysz z nimi umów. Kliknij, żeby otworzyć kartę.</p>${exp.map(p=>`<div class="res row">⚠️ <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> <small class="mut">${pTag(p.pos)} · ${p.age} l. · ocena ${rating(p)} · chce ${fmt(wageNeeded(p))}/rok</small></div>`).join('')}`:'<p class="good">Wszystkie kontrakty są ważne.</p>'}
  ${agedOut().length?`<h3>Juniorzy kończący 20 lat (${agedOut().length})</h3><p class="mut small">Awansuj ich do pierwszej drużyny albo odejdą z klubu przy starcie przygotowań.</p>${agedOut().map(p=>`<div class="res row">🎓 <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> <small class="mut">${pTag(p.pos)} · ocena ${rating(p)} · potencjał ${potStars(p)}</small><span class="sp"></span><button class="ghost sm" onclick="promote('${p.id}')">⬆️ Awans</button></div>`).join('')}`:''}
  <div class="row wrap" style="margin-top:12px"><button class="btn" onclick="startSeasonFromOff()">${ui.confirm==='start'?`Na pewno? Odejdzie ${exp.length} zawodników`:'Rozpocznij przygotowania do sezonu '+sLabel(s.n)}</button><button class="ghost" onclick="go('transfery')">Przejdź do transferów</button></div></div>${campCard()}`;
}
function newsHtml(){const n=(SAVE.news||[]).slice(0,10);if(!n.length)return '';return `<div class="card"><h2>Wiadomości</h2>${n.map(x=>`<div class="res"><span class="mut small">${x.d?fmtShort(x.d):''}</span> ${esc(x.t)}</div>`).join('')}</div>`;}
function healthyLineup(team,lu){
  const ok=validLineup(team,lu)?Object.assign({},lu):autoLineup(team);
  const used=new Set(Object.values(ok));const ch=[];
  for(const [k,l,pos] of LINEUP_KEYS){const p=team.players.find(x=>x.id===ok[k]);if(p&&!p.inj)continue;
    const c=team.players.filter(x=>!x.inj&&!used.has(x.id)).sort((a,b)=>lineupScore(b,pos)-lineupScore(a,pos))[0];
    if(c){used.add(c.id);ch.push([p,c,l]);ok[k]=c.id;}}
  return {lu:ok,ch};}

const INJ_NAMES=[[10,['Stłuczenie kolana','Skręcenie palca','Naciągnięcie mięśnia łydki','Stłuczenie uda','Uraz nadgarstka']],[24,['Skręcenie stawu skokowego','Naderwanie mięśnia uda','Uraz pleców','Zapalenie ścięgna Achillesa','Naciągnięcie mięśnia brzucha']],[999,['Uraz barku','Złamanie palca','Przeciążeniowe złamanie kości śródstopia','Uszkodzenie więzadła w kolanie','Zapalenie ścięgna rzepki']]];
// po powrocie z urazu (≥7 dni) przez 3 tygodnie większe ryzyko odnowienia: do 2,2× zaraz po powrocie, maleje do 1×
function reinjF(p){const L=p&&p.injLast;if(!L||!L.back||!(+L.days>=7))return 1;const d=daysBetween(L.back,today());return d>=0&&d<21?1+1.2*(1-d/21):1;}
function injName(days){const g=INJ_NAMES.find(x=>days<=x[0])[1];return g[Math.floor(R()*g.length)];}

// beniaminek: wzmacnia najsłabsze pozycje podstawowej szóstki zawodnikami na poziomie nowej ligi (rynek wolnych zawodników, a gdy go brak — zawodnicy spoza gry)
function promoBoost(t){const L=lgOf(t.idx);const ref=lgRef(L);const a=SAVE.ai[t.idx];
  for(let k=0;k<3;k++){const lu=autoLineup(t);const st=LINEUP_KEYS.map(([key,,pos])=>({pos,p:t.players.find(x=>x.id===lu[key])})).filter(x=>x.p).sort((x,y)=>rating(x.p)-rating(y.p));const w=st[0];if(!w||rating(w.p)>=ref-1)break;
    let c=W().players.filter(p=>p.tm<0&&!p.jr&&!p.inj&&p.pos===w.pos&&rating(p)>=rating(w.p)+3).sort((x,y)=>rating(y)-rating(x))[0];
    if(!c){c=genAt(w.pos,ref-1+R()*3,24+Math.floor(R()*6));c.tm=-1;c.wage=0;c.ce=0;initPlayerMeta(c,S().n,true);W().players.push(c);}
    const wd=wageDemand(c);if(teamWages(t.idx)+wd>wageCap(t.idx)*1.1)break;movePlayer(c,t.idx);c.wage=round5k(wd);c.ce=S().n+1+Math.floor(R()*2);a.bud=Math.max(0,a.bud-wd*0.3);
    if(t.players.length>16){const out=t.players.filter(x=>x.pos===w.pos&&x.id!==c.id).sort((x,y)=>rating(x)-rating(y))[0];if(out){out.tm=-1;out.wage=0;}}syncTeams();}}
