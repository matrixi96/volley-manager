// ================= KLUB: SZTAB, JUNIORZY, INFRASTRUKTURA =================
// ---- infrastruktura ----
const HALA_CAP=[2500,3500,4500,6000,8000];
const INFRA=[
  {k:'hala',n:'Hala sportowa',col:'#3b82f6',cost:900000,days:200,d:'Większa hala to więcej biletów i lepsza atmosfera, czyli większa przewaga własnego boiska.',eff:L=>`${HALA_CAP[L-1].toLocaleString('pl-PL')} miejsc · przewaga gospodarza ${(1.2+0.3*L).toFixed(1)}%`},
  {k:'tren',n:'Centrum treningowe',col:'#22c55e',cost:450000,days:130,d:'Lepsze boiska treningowe i sprzęt: szybszy rozwój wszystkich zawodników.',eff:L=>`rozwój zawodników +${8*(L-1)}%`},
  {k:'akad',n:'Akademia',col:'#a855f7',cost:350000,days:110,d:'Szkolenie młodzieży: więcej i lepszych juniorów co roku, szybszy rozwój juniorów.',eff:L=>`${2+Math.floor(L/2)} juniorów w naborze · rozwój juniorów +${10*(L-1)}%`},
  {k:'med',n:'Centrum medyczne',col:'#ef4444',cost:300000,days:90,d:'Badania, rehabilitacja i profilaktyka: mniej kontuzji i szybsze powroty.',eff:L=>`kontuzje −${5*(L-1)}% · przerwy krótsze o ${7*(L-1)}%`},
  {k:'odn',n:'Odnowa biologiczna',col:'#14b8a6',cost:250000,days:75,d:'Kriokomora, baseny, masaże: zawodnicy wolniej męczą się w meczach.',eff:L=>`zmęczenie w meczu −${4*(L-1)}%`},
  {k:'sied',n:'Siedziba klubu',col:'#e8b73a',cost:400000,days:120,d:'Biura klubu, marketing i gabinety sztabu: lepsi kandydaci do sztabu, więcej chętnych sponsorów i lepsze oferty sponsorskie.',eff:L=>`kandydaci do sztabu +${(L-1)*0.7} jakości · sponsorzy: +${(L-1)*3}% atrakcyjności`},
  {k:'sklep',n:'Sklep kibica',col:'#f59e0b',cost:150000,days:60,d:'Czapki, koszulki, szaliki i inne gadżety. Każdy poziom odblokowuje nowe produkty, ceny ustalasz sam.',eff:L=>`produkty: ${SHOP_PR.filter(p=>p[2]<=L).map(p=>p[1].toLowerCase()).join(', ')} · ok. ${fmt(shopIncome(L))} zysku / mies.`},
  {k:'vip',sub:'hala',min:0,max:3,n:'Loża VIP',col:'#c9a54a',cost:900000,days:120,d:'Przeszklona loża dla gości specjalnych przy wejściu do hali. Otwiera bilety i karnety VIP.',eff:L=>L?`${vipSeats(L)} miejsc VIP (${L*8} lóż)`:'brak loży'},
  {k:'gastro',sub:'hala',n:'Stoisko gastronomiczne',col:'#e2603a',cost:180000,days:45,d:'Jedzenie i picie dla kibiców w dniu meczu. Każdy poziom dodaje nowe produkty i więcej punktów sprzedaży.',eff:L=>`w ofercie: ${GAS_PR.filter(p=>p[2]<=L).map(p=>p[1].toLowerCase()).join(', ')}${L>=5?' · więcej punktów sprzedaży':''}`},
  {k:'gosc',sub:'hala',min:0,max:2,n:'Sektor gości',col:'#9b3a30',cost:400000,days:90,d:'Wydzielony sektor dla kibiców rywala: dodatkowe bilety, ale gospodarz ma odrobinę mniejszą przewagę.',eff:L=>L?`${guestSeats(L)} miejsc dla gości · przewaga gospodarza −${(0.15*L).toFixed(2)} pkt proc.`:'brak sektora'},
  {k:'park',sub:'hala',n:'Parking',col:'#6b7280',cost:350000,days:60,d:'Płatny parking wokół hali. Gdy jest za mały, część kibiców nie przyjeżdża na mecz.',eff:L=>`${parkSpots(L).toLocaleString('pl-PL')} miejsc`}
];
function fMin(f){return f.min==null?1:f.min;}
function fMax(f){return f.max||5;}
const MAINT_PER_LEVEL=2500; // zł / miesiąc za poziom
function infraOf(ti){const a=SAVE.ai[ti];const base=a.rep>=70?3:a.rep>=45?2:1;if(!a.infra)a.infra={};for(const f of INFRA)if(a.infra[f.k]==null){const me=ti===SAVE.team;a.infra[f.k]=f.k==='vip'?(me?0:a.rep>=70?2:a.rep>=50?1:0):f.k==='gosc'?(me?0:a.rep>=55?1:0):(f.sub&&me)?1:f.k==='park'?Math.max(1,Math.min(5,(a.infra.hala||base)+(R()<0.4?-1:0))):Math.max(1,Math.min(5,base+(R()<0.3?1:0)-(R()<0.3?1:0)));}return a.infra;}
function staffCap(L){return 5+(L||myInfra().sied);}
function scoutCap(L){return 1+Math.floor(((L||myInfra().sied)-1)/2);}
function staffBudget(){return round5k(250000+SAVE.ai[SAVE.team].rep*8000+myInfra().sied*60000);}
function allScouts(){return [SAVE.staff&&SAVE.staff.sk].concat(SAVE.scouts||[]).filter(Boolean);}
function staffCount(){return Object.values(SAVE.staff||{}).filter(Boolean).length+(SAVE.scouts||[]).length;}
// zatrudnianie ogranicza tylko budżet płacowy (zawodnicy + sztab); maksymalnie 6 skautów
const SCOUT_MAX=6;
// limit etatów w sztabie ustala zarząd: zależy od renomy klubu, można go podnieść prośbą do zarządu
var STAFF_LIM=1;
function myRepS(){const a=SAVE.ai&&SAVE.team!=null?SAVE.ai[SAVE.team]:null;return (a&&a.rep)||30;}
function staffLimitBase(){return clamp(Math.round(4.5+myRepS()/9),6,13);}
// etaty bez skautów (skauci mają osobną pulę od zarządu); własny klub: bez limitu (decyduje właściciel)
function staffCountNS(){return Object.entries(SAVE.staff||{}).filter(([r,v])=>v&&r!=='sk').length;}
function scoutLimit(){return clamp(1+Math.floor(myRepS()/25),1,4);}
function limOn(){return STAFF_LIM&&!SAVE.ownClub;}
function staffLimit(){return staffLimitBase()+((SAVE.bm&&SAVE.bm.stX)||0);}
function staffCheck(add,neu,isSc){if(SAVE.fin.bal<-300000)return 'Klub jest zadłużony — zarząd wstrzymał zatrudnianie w sztabie.';if(limOn()&&neu&&isSc&&allScouts().length>=scoutLimit())return `Zarząd zgodził się na ${scoutLimit()} ${scoutLimit()===1?'skauta':'skautów'} i wszystkie miejsca są zajęte. Większy dział skautingu przyjdzie z renomą klubu.`;if(limOn()&&neu&&!isSc&&staffCountNS()>=staffLimit())return `Zarząd zgodził się na ${staffLimit()} etatów w sztabie (bez skautów) i wszystkie są zajęte. Zwolnij kogoś albo poproś zarząd o dodatkowy etat (Rozmowy → Zarząd).`;if(SAVE.fin.bal<-300000)return 'Klub jest zadłużony — zarząd wstrzymał zatrudnianie w sztabie.';if(add>0&&typeof budLeft==='function'&&add>budLeft().wg)return `Brak miejsca w budżecie płacowym (zostało ${fmt(Math.max(0,budLeft().wg))}/rok, a ta pensja to ${fmt(add)}). Zwolnij kogoś, zmień podział budżetów (Finanse) albo poproś zarząd o większy budżet płacowy.`;return null;}
// ostrzeżenie: pensje sztabu zajmują zbyt dużą część budżetu płacowego (raz na kwartał, 1. dnia miesiąca)
function staffCostWarn(d){if(SAVE.team==null||SAVE.fired||d.slice(8)!=='01'||typeof BUD!=='function')return;const b=BUD();if(!b||!b.wg)return;const sp=staffPay(),sh=sp/b.wg;if(sh<=0.25)return;
  if(SAVE.stWarn&&daysBetween(SAVE.stWarn,d)<85)return;SAVE.stWarn=d;const f=SAVE.staff&&SAVE.staff.fin;
  sendMail({cat:'fin',from:f?`${f.first} ${f.last} (dyrektor finansowy)`:'Księgowość klubu',t:'Pensje sztabu są zbyt wysokie',s:`Sztab kosztuje ${fmt(sp)}/rok — ${Math.round(sh*100)}% budżetu płacowego.`,
    b:{type:'text',x:`Pensje sztabu wynoszą ${fmt(sp)} rocznie, czyli ${Math.round(sh*100)}% całego budżetu płacowego (${fmt(b.wg)}). Bezpieczny poziom to najwyżej około 25% — reszta powinna iść na zawodników.\n\nCo można zrobić:\n• zastąpić najdroższych pracowników tańszymi (Klub → Sztab),\n• zrezygnować ze stanowisk, które najmniej pomagają (np. social media, dodatkowi skauci),\n• poprosić zarząd o większy budżet płacowy (Rozmowy → Zarząd).`},lab:'Finanse'});}
function myInfra(){return infraOf(SAVE.team);}
function upgradeCost(f,L){return Math.round(f.cost*Math.pow(L+1-fMin(f),1.4)/10000)*10000;}
function upgradeDays(f,L){return Math.round(f.days*(0.7+0.3*(L+1-fMin(f))));}
function BLD(){if(!SAVE.builds){SAVE.builds=SAVE.build?[SAVE.build]:[];}delete SAVE.build;return SAVE.builds;}
const MAX_BUILDS=2;
function maintenance(){const inf=myInfra();return INFRA.reduce((s,f)=>s+inf[f.k]*MAINT_PER_LEVEL,0);}
function startBuild(k){const f=INFRA.find(x=>x.k===k);const L=myInfra()[k];const bs=BLD();
  if(bs.some(b=>b.k===k))return tradeMsg(false,'Ten obiekt jest już w budowie.');
  if(bs.length>=MAX_BUILDS)return tradeMsg(false,`Trwają już ${MAX_BUILDS} budowy. Klub prowadzi najwyżej ${MAX_BUILDS} inwestycje naraz.`);
  if(L>=fMax(f))return tradeMsg(false,'Ten obiekt ma już maksymalny poziom.');
  const c=upgradeCost(f,L);if(SAVE.fin.bal-c<-500000)return tradeMsg(false,`Za mało pieniędzy. Rozbudowa kosztuje ${fmt(c)}.`);
  if(typeof budCan==='function'){const e=budCan('op',c+MAINT_PER_LEVEL*12);if(e)return tradeMsg(false,e);}
  if(ui.confirm!=='b'+k){ui.confirm='b'+k;render();return;}ui.confirm=null;
  money(-c,'Infrastruktura');finLog(`${L===0?'Budowa':'Rozbudowa'}: ${f.n} (poz. ${L+1})`,-c);
  const b={k,to:L+1,start:today(),until:addDays(today(),upgradeDays(f,L))};bs.push(b);
  news(`🏗️ Rusza ${L===0?'budowa':'rozbudowa'}: ${f.n} — poziom ${L+1}. Koniec planowany na ${fmtDMY(b.until)}.`);save();tradeMsg(true,`Budowa ruszyła! Koniec: ${fmtDMY(b.until)}.`);}
function checkBuild(d){const bs=BLD();for(const b of bs.slice()){if(d<b.until)continue;myInfra()[b.k]=b.to;const f=INFRA.find(x=>x.k===b.k);news(`🎉 Zakończono budowę: ${f.n} — poziom ${b.to}!`);bs.splice(bs.indexOf(b),1);}}
function aiInfraOffseason(){for(const t of TEAMS){if(t.idx===SAVE.team)continue;const inf=infraOf(t.idx);const a=SAVE.ai[t.idx];const opF=a.op?clamp(a.op/(AI_REV_LG[lgOf(t.idx)]*0.18),0.6,1.6):1;if(R()<0.15*opF){const f=INFRA[Math.floor(R()*INFRA.length)];if(inf[f.k]<Math.min(4,fMax(f))){const c=upgradeCost(f,inf[f.k]);if(a.op?a.op>c*0.6:a.bud>c*0.6){if(a.op)a.op-=c*0.6;else a.bud-=c*0.6;inf[f.k]++;}}}}}

// ---- sztab ----
const STAFF_ROLES=[
  ['asy','Asystent trenera','Szybszy rozwój umiejętności technicznych (zagrywka, atak, przyjęcie, blok…).'],
  ['fiz','Trener przygotowania fizycznego','Szybszy rozwój cech fizycznych i mniej kontuzji.'],
  ['psy','Psycholog sportowy','Szybszy rozwój cech mentalnych (koncentracja, opanowanie…).'],
  ['med','Fizjoterapeuta','Krótsze przerwy po kontuzjach, szybsza regeneracja po treningach i mniejsze zmęczenie po meczach.'],
  ['sk','Skaut','Dokładniejsza ocena potencjału zawodników z innych klubów.'],
  ['jr','Trener juniorów','Szybszy rozwój juniorów i lepsze roczniki z naboru.'],
  ['sta','Statystyk / analityk','Przygotowanie do rywala: mały bonus w każdym meczu.'],
  ['soc','Specjalista ds. social mediów','Prowadzi profile klubu: szybszy wzrost obserwujących, akcje specjalne, gaszenie kryzysów i usuwanie wpadek zawodników.'],
  ['fin','Dyrektor finansowy','Planuje budżety (transferowy, płacowy, operacyjny): dokładniejsza prognoza przychodów, wyższe budżety i do +5% w ofertach sponsorów.']
];
const ROLE_N=Object.fromEntries(STAFF_ROLES.map(r=>[r[0],r[1]]));
var STAFF2=1;// pensje sztabu zależne od ligi, renomy klubu (premia dobrych specjalistów za przyjście do małego klubu) i reputacji trenera
function staffWageBase(sk){return round5k(30000+sk*sk*350);}
function staffWage(sk){const b=staffWageBase(sk);if(!STAFF2||SAVE.team==null||!SAVE.ai||!SAVE.ai[SAVE.team])return b;const eco=0.25+0.75*(LG_ECO[myLg()]||1);const rep=SAVE.ai[SAVE.team].rep;
  const prem=1+Math.max(0,sk-12)*Math.max(0,60-rep)/60*0.08;const cr=clamp(1-(((SAVE.coach&&SAVE.coach.rep)||40)-40)/100*0.3,0.85,1.1);return round5k(Math.max(30000,b*eco*prem*cr));}
function genStaff(role,sk){const id='st'+(W().nextId++);const nm=natName(SAVE.team!=null?tmCountry(SAVE.team):'PL');return {id,first:nm[0],last:nm[1],role,skill:Math.round(clamp(sk,1,20)),age:30+Math.floor(R()*30),wage:0};}
function refreshStaffPool(){SAVE.staffPool=[];const hq=SAVE.team!=null?(myInfra().sied-1)*0.7:0;for(const [r] of STAFF_ROLES)for(let i=0;i<3;i++){const s=genStaff(r,5+R()*14+hq);s.wage=staffWage(s.skill);SAVE.staffPool.push(s);}}
function staffSkill(r){if(r==='sk'){const a=allScouts();return a.length?Math.max(...a.map(x=>x.skill)):3;}const s=SAVE.staff&&SAVE.staff[r];return s?s.skill:3;}
function staffPay(){return Object.values(SAVE.staff||{}).filter(Boolean).concat(SAVE.scouts||[]).reduce((a,s)=>a+s.wage,0);}
function hireStaff(id){const c=SAVE.staffPool.find(x=>x.id===id);if(!c)return;const cur=SAVE.staff[c.role];
  {const e=staffCheck(c.wage-(cur?cur.wage:0),!cur,c.role==='sk');if(e)return tradeMsg(false,e);}
  if(cur&&ui.confirm!=='h'+id){ui.confirm='h'+id;render();return;}ui.confirm=null;
  if(cur){const sev=round5k(cur.wage/4);money(-sev,'Sztab');finLog(`Odprawa: ${cur.first} ${cur.last} (${ROLE_N[cur.role]})`,-sev);SAVE.staffPool.push(cur);}
  achEv('staff');SAVE.staff[c.role]=c;SAVE.staffPool=SAVE.staffPool.filter(x=>x.id!==id);news(`🧑‍🏫 Zatrudniono: ${c.first} ${c.last} — ${ROLE_N[c.role]} (jakość ${c.skill}/20).`);save();tradeMsg(true,`${c.first} ${c.last} dołącza do sztabu.`);}
function fireStaff(r){const cur=SAVE.staff[r];if(!cur)return;if(ui.confirm!=='f'+r){ui.confirm='f'+r;render();return;}ui.confirm=null;
  const sev=round5k(cur.wage/4);money(-sev,'Sztab');finLog(`Odprawa: ${cur.first} ${cur.last} (${ROLE_N[r]})`,-sev);SAVE.staff[r]=null;news(`📄 Zwolniono: ${cur.first} ${cur.last} (${ROLE_N[r]}).`);save();tradeMsg(true,`Zwolniono. Odprawa: ${fmt(sev)}.`);}
function hireScoutExtra(id){const c=SAVE.staffPool.find(x=>x.id===id);if(!c)return;SAVE.scouts=SAVE.scouts||[];
  if(allScouts().length>=SCOUT_MAX)return tradeMsg(false,`Dział skautingu ma już ${SCOUT_MAX} skautów — to maksimum.`);
  {const e=staffCheck(c.wage,1,1);if(e)return tradeMsg(false,e);}
  SAVE.scouts.push(c);SAVE.staffPool=SAVE.staffPool.filter(x=>x.id!==id);news(`🧑‍🏫 Zatrudniono: ${c.first} ${c.last} — dodatkowy skaut (jakość ${c.skill}/20).`);save();tradeMsg(true,`${c.first} ${c.last} dołącza do działu skautingu.`);}
function fireScout(id){const i=(SAVE.scouts||[]).findIndex(x=>x.id===id);if(i<0)return;const cur=SAVE.scouts[i];if(ui.confirm!=='fs'+id){ui.confirm='fs'+id;render();return;}ui.confirm=null;
  const sev=round5k(cur.wage/4);money(-sev,'Sztab');finLog(`Odprawa: ${cur.first} ${cur.last} (skaut)`,-sev);SAVE.scouts.splice(i,1);if(typeof scoutFired==='function')scoutFired(id);news(`📄 Zwolniono: ${cur.first} ${cur.last} (skaut).`);save();tradeMsg(true,`Zwolniono. Odprawa: ${fmt(sev)}.`);}
function aiStaff(ti){return clamp(6+SAVE.ai[ti].rep/12,4,16);}
function clubMods(ti){
  const inf=infraOf(ti),mine=ti===SAVE.team,st=r=>mine?staffSkill(r):aiStaff(ti);
  const ct=mine&&SAVE.coach;
  return {all:(1+0.08*(inf.tren-1))*(ct?0.85+cA('tre')/66:1),tech:0.8+st('asy')/50,phys:0.8+st('fiz')/50,ment:(0.8+st('psy')/50)*(ct?0.9+cA('aut')/100:1),
    jr:(1+0.1*(inf.akad-1))*(0.7+st('jr')/33)*(ct?0.85+cA('mlo')/66:1),
    injChance:(1.05-0.05*(inf.med-1))*(1.2-st('fiz')/50)*(mine&&typeof techBonus==='function'&&SAVE.spons?1-techBonus():1),injDur:(1-0.07*(inf.med-1))*(1.3-st('med')/40),
    fat:1-0.04*(inf.odn-1),hb:0.012+0.003*inf.hala-0.0015*(inf.gosc||0),sb:(st('sta')-10)*0.0015};}
// potencjał widziany przez skauta
function hashId(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return ((h>>>0)%2001)/1000-1;}

// ---- juniorzy ----
const JR_PLAN=['R','R','A','A','P','P','P','S','S','S','L','L'];
function genJunior(ti,age,pos){const t=TEAMS[ti];const inf=infraOf(ti);const mine=ti===SAVE.team;
  const jq=teamQ(t)-2.5-4.5+0.4*inf.akad+((mine?staffSkill('jr'):aiStaff(ti))-10)*0.06+(mine&&SAVE.coach?(cA('mlo')-10)*0.04:0)+(mine&&SAVE.bm&&SAVE.bm.jrBoost===S().n-1?1.5:0)+(age-16)*0.6;
  const hc=tmCountry(ti);const p=genPlayer(pos||randPos(),jq+R()*1.2,age,R()<0.88?hc:natPick(R,hc));p.tm=ti;p.jr=true;p.inj=0;p.xp={};p.wage=0;p.ce=0;
  p.pot=Math.min(92,Math.round(rating(p)+(BAL2?3+R()*9:4+R()*12)+inf.akad));p.base=snap(p);assignNum(p,ti);return p;}
function initClub(){
  if(!SAVE.ai)return;
  for(const t of TEAMS)infraOf(t.idx);
  if(!SAVE.staff){SAVE.staff={};let n0=limOn()?Math.min(7,staffLimit()):7;for(const r of ['asy','fiz','med','jr','psy','fin','soc','sk','sta'])SAVE.staff[r]=null;for(const r of ['asy','fiz','med','jr','psy','fin','soc']){if(n0--<=0)break;const s=genStaff(r,7+R()*4);s.wage=staffWage(s.skill);SAVE.staff[r]=s;}SAVE.staff.sk=null;SAVE.staff.sta=null;}
  if(!SAVE.staffPool)refreshStaffPool();
  if(!SAVE.jrInit){for(const t of TEAMS)JR_PLAN.forEach((pos,i)=>{W().players.push(genJunior(t.idx,16+(i%4),pos));});SAVE.jrInit=true;}
  syncTeams();
}
function juniorsOf(ti){return W().players.filter(p=>p.tm===ti&&p.jr);}
function jTeam(ti){const t=TEAMS[ti];return {name:t.name+' U20',short:t.short+'·J',color:t.color,idx:ti,players:juniorsOf(ti)};}
function ensureJuniors(ti){let j=juniorsOf(ti);while(j.length<10){W().players.push(genJunior(ti,16+Math.floor(R()*3)));j=juniorsOf(ti);}}
function simJrRound(r){const s=S();s.jres=s.jres||[];s.jps=s.jps||{};const rd=[];try{jrOtherRound(r);}catch(e){console.error(e);}
  for(const [h,a] of s.rounds[r]){ensureJuniors(h);ensureJuniors(a);
    const P=(i,home)=>{const jt=jTeam(i);return {team:jt,lineup:autoLineup(jt),tactics:{serve:1,dist:0},home,x:{hb:0.015,fat:1,sb:0}};};
    const m=simMatch(P(h,true),P(a,false));
    for(const sd of m.sides)for(const cp of sd.pl){const x=cp.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;ROUND_PLAYED.add(cp.id);const r2=s.jps[cp.id]||(s.jps[cp.id]={m:0,pts:0,kill:0,att:0});r2.m++;r2.pts+=x.kill+x.blk+x.ace;r2.kill+=x.kill;r2.att+=x.att;{const lr=liveRating(cp);if(lr!=null){r2.rs=(r2.rs||0)+lr;r2.rn=(r2.rn||0)+1;}}}
    const g=resultOf(m,h,a);if(h===SAVE.team||a===SAVE.team)g.me=true;rd.push(g);}
  s.jres.push(rd);
  if(s.jres.length===s.rounds.length){const ch=tableFrom(s.jres)[0].i;news(`🏆 Mistrzem ligi juniorów sezonu ${sLabel(s.n)} zostaje ${TEAMS[ch].name} U20${ch===SAVE.team?' — to Twoi juniorzy!':''}.`);s.jchamp=ch;}}
function promote(pid){const p=PLAYERS[pid].p;if(myTeam().players.length>=SQUAD_MAX)return tradeMsg(false,`Pierwsza drużyna jest pełna (maks. ${SQUAD_MAX}).`);
  p.jr=false;p.acad=1;achEv('jrPromo');p.wage=Math.max(40000,wageDemand(p));p.ce=contractEndFor(3);syncTeams();news(`⬆️ ${p.first} ${p.last} awansuje z juniorów do pierwszej drużyny (kontrakt do ${ceDate(p.ce)}).`);save();tradeMsg(true,`${p.first} ${p.last} jest w pierwszej drużynie!`);}
function demote(pid){const p=PLAYERS[pid].p;if(p.age>19)return tradeMsg(false,'Do juniorów można przesunąć tylko zawodnika do 19 lat.');if(myTeam().players.length-1<SQUAD_MIN)return tradeMsg(false,`Pierwsza drużyna musi mieć min. ${SQUAD_MIN} zawodników.`);
  p.jr=true;p.wage=0;syncTeams();news(`⬇️ ${p.first} ${p.last} przesunięty do drużyny juniorów.`);save();tradeMsg(true,`${p.last} gra teraz w juniorach.`);}
function releaseJunior(pid){const p=PLAYERS[pid].p;if(ui.confirm!=='rj'+pid){ui.confirm='rj'+pid;render();return;}ui.confirm=null;p.tm=-1;p.jr=false;p.wage=0;p.ce=0;syncTeams();news(`📄 Junior ${p.first} ${p.last} odchodzi z klubu.`);save();tradeMsg(true,`${p.last} opuścił akademię.`);}
function juniorsOffseason(){
  const n=S().n;
  for(const t of TEAMS){const inf=infraOf(t.idx);const mine=t.idx===SAVE.team;
    if(!mine)for(const p of juniorsOf(t.idx))if(p.age>=20){if(t.players.length<16&&rating(p)>=teamStrength(t)-14){p.jr=false;p.wage=Math.max(40000,wageDemand(p));p.ce=n+2;t.players.push(p);}else{p.tm=-1;p.jr=false;}}
    syncTeams();
    const k=2+Math.floor(inf.akad/2)+(mine&&staffSkill('jr')>=15?1:0);
    for(let i=0;i<k;i++){const p=genJunior(t.idx,16+(R()<0.4?1:0));W().players.push(p);if(mine)news(`🌱 Nabór do akademii: ${p.first} ${p.last} (${POS_NAMES[p.pos]}, ${p.age} l., potencjał ${'★'.repeat(Math.max(1,Math.min(5,Math.round((p.pot-62)/7))))}).`);}
    const js=juniorsOf(t.idx).sort((a,b)=>b.pot-a.pot);for(const p of js.slice(18)){p.tm=-1;p.jr=false;}
  }
  syncTeams();
}
function agedOut(){return juniorsOf(SAVE.team).filter(p=>p.age>=20);}

// ---- widoki ----
function staffView(){
  const pool=SAVE.staffPool||[];
  const card=([r,n,d])=>{const s=SAVE.staff[r];const cands=pool.filter(x=>x.role===r).sort((a,b)=>b.skill-a.skill);
    return `<div class="card staff"><div class="row"><h3 style="margin:0">${n}</h3><span class="sp"></span>${s?`<span class="sk ${aCls(s.skill)}">${s.skill}/20</span>`:'<span class="bad small">wakat</span>'}</div><p class="small mut">${d}</p>${r==='med'?`<p class="small">Teraz: regeneracja świeżości <b>${Math.round(regenK()*100)}%</b> normy (z odnową biologiczną) · zmęczenie po meczu <b>${Math.round(matchDrainK()*100)}%</b> normy · przerwy po kontuzjach <b>${Math.round(clubMods(SAVE.team).injDur*100)}%</b> normy.</p>`:''}
    ${s?`<div class="row small">${sFace(s,40)}<span><b>${esc(s.first)} ${esc(s.last)}</b>, ${s.age} l. · ${fmt(s.wage)}/rok</span><span class="sp"></span><button class="link" onclick="fireStaff('${r}')">${ui.confirm==='f'+r?`Na pewno? Odprawa ${fmt(round5k(s.wage/4))}`:'Zwolnij'}</button></div>`:'<p class="small bad">Brak osoby na tym stanowisku — efekt jak przy bardzo słabym specjaliście.</p>'}
    ${r==='sk'?`${(SAVE.scouts||[]).map(x=>`<div class="row small">${sFace(x,40)}<span><b>${esc(x.first)} ${esc(x.last)}</b> <span class="sk ${aCls(x.skill)}">${x.skill}</span> · dodatkowy skaut · ${fmt(x.wage)}/rok</span><span class="sp"></span><button class="link" onclick="fireScout('${x.id}')">${ui.confirm==='fs'+x.id?`Na pewno? Odprawa ${fmt(round5k(x.wage/4))}`:'Zwolnij'}</button></div>`).join('')}<p class="small mut">Skautów: ${allScouts().length}/${SCOUT_MAX}. Każdy skaut prowadzi własne zadania (zakładka Skauting). Pensje skautów liczą się do budżetu płacowego.</p>`:''}
    <details ${s?'':'open'}><summary class="link">Kandydaci (${cands.length})</summary>${cands.map(c=>`<div class="row small cand"><span class="sk ${aCls(c.skill)}">${c.skill}</span>${sFace(c,30)}<span>${esc(c.first)} ${esc(c.last)}, ${c.age} l. · ${fmt(c.wage)}/rok${typeof budLeft==='function'?` <small class="${budLeft().wg-(c.wage-(s?s.wage:0))<0?'bad':'mut'}">· budżet płacowy po: ${fmt(budLeft().wg-(c.wage-(s?s.wage:0)))}</small>`:''}</span><span class="sp"></span>${r==='sk'&&s?`<button class="ghost" onclick="hireScoutExtra('${c.id}')">+ Dodatkowy skaut</button>`:''}<button class="ghost" onclick="hireStaff('${c.id}')">${ui.confirm==='h'+c.id?'Na pewno? (zastąpi obecnego)':s?'Zastąp':'Zatrudnij'}</button></div>`).join('')||'<p class="mut small">Brak kandydatów — nowi pojawią się w oknie transferowym.</p>'}</details></div>`;};
  return `${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}<div class="card"><div class="row wrap"><h2 style="margin:0">Sztab szkoleniowy</h2><span class="sp"></span><span class="small">${limOn()?`Etaty w sztabie: <b>${staffCountNS()}/${staffLimit()}</b> · skauci <b>${allScouts().length}/${scoutLimit()}</b>`:`Osób w sztabie: <b>${staffCount()}</b>`} · pensje sztabu <b>${fmt(staffPay())}</b>/rok · wolne w budżecie płacowym <b>${fmt(Math.max(0,budLeft().wg))}</b></span></div>
  <p class="small mut">Pensje sztabu i zawodników płacisz z jednego budżetu płacowego (Finanse → Budżety) — drogi sztab to mniej pieniędzy na zawodników. Lepsza siedziba klubu przyciąga lepszych kandydatów. Zadłużony klub nie może zatrudniać.</p>
  <p class="small mut">Jakość w skali 1–20. Lepszy specjalista to silniejszy efekt, ale wyższa pensja (płatna co miesiąc). Zwolnienie kosztuje odprawę (3 miesiące pensji). Nowi kandydaci pojawiają się co roku w oknie transferowym.</p></div>
  <div class="stgrid">${STAFF_ROLES.map(card).join('')}</div>`;
}
function juniorsView(){
  const s=S();const js=juniorsOf(SAVE.team).sort((a,b)=>({R:0,A:1,P:2,S:3,L:4}[a.pos]-{R:0,A:1,P:2,S:3,L:4}[b.pos])||rating(b)-rating(a));
  const jps=s.jps||{};const tb=tableFrom(s.jres||[]);const last=(s.jres||[]).slice(-1)[0];
  const inf=myInfra();
  return `${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
  <div class="card"><div class="row wrap"><h2 style="margin:0">${esc(myTeam().name)} U20</h2><span class="sp"></span><span class="small mut">Akademia: ${'★'.repeat(inf.akad)} · trener juniorów: ${SAVE.staff.jr?SAVE.staff.jr.skill+'/20':'brak'}</span></div>
  <p class="small mut">Juniorzy grają w lidze juniorów w tych samych kolejkach co seniorzy. Rozwijają się szybciej niż dorośli. Najlepszych awansuj do pierwszej drużyny. Po skończeniu 20 lat junior musi awansować albo odejść (decyzja w oknie transferowym).</p>
  <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th>Ocena</th><th>Potencjał</th><th>Rozwój</th><th>M</th><th>Pkt</th><th></th></tr></thead><tbody>
  ${js.map(p=>{const d=rating(p)-baseRating(p);const st=jps[p.id];return `<tr><td class="l"><span class="fcell">${pFace(p,26)}<button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button></span>${p.inj?' 🚑':''}${p.age>=20?' <span class="tag">20+</span>':''}</td><td>${pTag(p.pos)}</td><td>${p.age}</td><td><b>${rating(p)}</b></td><td class="stars">${potStars(p)}</td><td class="${d>0?'good':''}">${d>0?'+'+d:'–'}</td><td>${st?st.m:0}</td><td>${st?st.pts:0}</td><td><button class="ghost sm" onclick="promote('${p.id}')">⬆️ Awans</button></td></tr>`;}).join('')}</tbody></table></div></div>
  <div class="card"><h2>Liga juniorów ${sLabel(s.n)}</h2>${tb.some(x=>x.m)?`<div class="tw"><table><thead><tr><th>#</th><th class="l">Drużyna</th><th>M</th><th>Z</th><th>P</th><th>Pkt</th><th>Sety</th></tr></thead><tbody>${tb.map((x,i)=>`<tr class="${x.i===SAVE.team?'starter':''}"><td>${i+1}</td><td class="l">${tDot(x.i)}${tName(x.i)} U20</td><td>${x.m}</td><td>${x.w}</td><td>${x.l}</td><td><b>${x.pts}</b></td><td>${x.sw}:${x.sl}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">Liga juniorów rusza razem z fazą zasadniczą seniorów.</p>'}
  ${last?`<h3>Ostatnia kolejka juniorów</h3>${last.map(g=>`<div class="res ${g.me?'me':''}">${resTxt(g)}</div>`).join('')}`:''}${s.jchamp!=null?`<p>🏆 Mistrz: <b>${tName(s.jchamp)} U20</b></p>`:''}</div>
  ${juniorLeaders()}`;
}
function juniorLeaders(){const jps=S().jps||{};const arr=Object.entries(jps).map(([id,r])=>({id,r})).filter(x=>PLAYERS[x.id]).sort((a,b)=>b.r.pts-a.r.pts).slice(0,10);if(!arr.length)return '';
  return `<div class="card"><h2>Najlepiej punktujący juniorzy</h2>${arr.map((x,i)=>{const P=PLAYERS[x.id];return `<div class="lrow ${P.p.tm===SAVE.team?'me':''}" onclick="openCard('${x.id}')"><span class="mut">${i+1}.</span> ${P.p.tm>=0?tDot(P.p.tm):''}<span class="ln">${esc(P.p.first)} ${esc(P.p.last)} <small class="mut">${P.p.tm>=0?esc(TEAMS[P.p.tm].short):''} · ${pTag(P.p.pos)} · ${P.p.age} l.${P.p.jr?'':' · już w seniorach'}</small></span><b>${x.r.pts}</b></div>`;}).join('')}</div>`;}
