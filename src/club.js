// ================= KLUB: SZTAB, JUNIORZY, INFRASTRUKTURA =================
// ---- infrastruktura ----
const HALA_CAP=[2500,3500,4500,6000,8000];
const INFRA=[
  {k:'hala',n:'Hala sportowa',col:'#3b82f6',cost:900000,days:200,d:'Większa hala to więcej biletów i lepsza atmosfera, czyli większa przewaga własnego boiska.',eff:L=>`${HALA_CAP[L-1].toLocaleString('pl-PL')} miejsc · przewaga gospodarza ${(1.2+0.3*L).toFixed(1)}%`},
  {k:'tren',n:'Centrum treningowe',col:'#22c55e',cost:450000,days:130,d:'Lepsze boiska treningowe i sprzęt: szybszy rozwój wszystkich zawodników.',eff:L=>`rozwój zawodników +${8*(L-1)}%`},
  {k:'akad',n:'Akademia',col:'#a855f7',cost:350000,days:110,d:'Szkolenie młodzieży: więcej i lepszych juniorów co roku, szybszy rozwój juniorów.',eff:L=>`${2+Math.floor(L/2)} juniorów w naborze · rozwój juniorów +${10*(L-1)}%`},
  {k:'med',n:'Centrum medyczne',col:'#ef4444',cost:300000,days:90,d:'Badania, rehabilitacja i profilaktyka: mniej kontuzji i szybsze powroty.',eff:L=>`kontuzje −${5*(L-1)}% · przerwy krótsze o ${7*(L-1)}%`},
  {k:'odn',n:'Odnowa biologiczna',col:'#14b8a6',cost:250000,days:75,d:'Kriokomora, baseny, masaże: zawodnicy wolniej męczą się w meczach.',eff:L=>`zmęczenie w meczu −${4*(L-1)}%`},
  {k:'sklep',n:'Sklep kibica',col:'#f59e0b',cost:150000,days:60,d:'Koszulki, szaliki, gadżety: stały miesięczny przychód (rośnie z renomą).',eff:L=>`ok. ${fmt(shopIncome(L))} / miesiąc`}
];
const MAINT_PER_LEVEL=2500; // zł / miesiąc za poziom
function infraOf(ti){const a=SAVE.ai[ti];if(!a.infra){const base=a.rep>=70?3:a.rep>=45?2:1;a.infra={};for(const f of INFRA)a.infra[f.k]=Math.max(1,Math.min(5,base+(R()<0.3?1:0)-(R()<0.3?1:0)));}return a.infra;}
function myInfra(){return infraOf(SAVE.team);}
function upgradeCost(f,L){return Math.round(f.cost*Math.pow(L,1.4)/10000)*10000;}
function upgradeDays(f,L){return Math.round(f.days*(0.7+0.3*L));}
function shopIncome(L){const rep=SAVE.ai?SAVE.ai[SAVE.team].rep:50;return Math.round(L*10000*(0.5+rep/100)/1000)*1000;}
function maintenance(){const inf=myInfra();return INFRA.reduce((s,f)=>s+inf[f.k]*MAINT_PER_LEVEL,0);}
function startBuild(k){const f=INFRA.find(x=>x.k===k);const L=myInfra()[k];
  if(SAVE.build)return tradeMsg(false,'Trwa już inna budowa. Klub prowadzi jedną inwestycję naraz.');
  if(L>=5)return tradeMsg(false,'Ten obiekt ma już maksymalny poziom.');
  const c=upgradeCost(f,L);if(SAVE.fin.bal-c<-500000)return tradeMsg(false,`Za mało pieniędzy. Rozbudowa kosztuje ${fmt(c)}.`);
  if(ui.confirm!=='b'+k){ui.confirm='b'+k;render();return;}ui.confirm=null;
  money(-c,'Infrastruktura');finLog(`Rozbudowa: ${f.n} (poz. ${L+1})`,-c);
  SAVE.build={k,to:L+1,start:today(),until:addDays(today(),upgradeDays(f,L))};
  news(`🏗️ Rusza rozbudowa: ${f.n} do poziomu ${L+1}. Koniec planowany na ${fmtDMY(SAVE.build.until)}.`);save();tradeMsg(true,`Budowa ruszyła! Koniec: ${fmtDMY(SAVE.build.until)}.`);}
function checkBuild(d){const b=SAVE.build;if(!b||d<b.until)return;myInfra()[b.k]=b.to;const f=INFRA.find(x=>x.k===b.k);news(`🎉 Zakończono rozbudowę: ${f.n} — poziom ${b.to}!`);SAVE.build=null;}
function aiInfraOffseason(){for(const t of TEAMS){if(t.idx===SAVE.team)continue;const inf=infraOf(t.idx);if(R()<0.15){const f=INFRA[Math.floor(R()*INFRA.length)];if(inf[f.k]<4){const c=upgradeCost(f,inf[f.k]);if(SAVE.ai[t.idx].bud>c*0.6){SAVE.ai[t.idx].bud-=c*0.6;inf[f.k]++;}}}}}

// ---- sztab ----
const STAFF_ROLES=[
  ['asy','Asystent trenera','Szybszy rozwój umiejętności technicznych (zagrywka, atak, przyjęcie, blok…).'],
  ['fiz','Trener przygotowania fizycznego','Szybszy rozwój cech fizycznych i mniej kontuzji.'],
  ['psy','Psycholog sportowy','Szybszy rozwój cech mentalnych (koncentracja, opanowanie…).'],
  ['med','Fizjoterapeuta','Krótsze przerwy po kontuzjach.'],
  ['sk','Skaut','Dokładniejsza ocena potencjału zawodników z innych klubów.'],
  ['jr','Trener juniorów','Szybszy rozwój juniorów i lepsze roczniki z naboru.'],
  ['sta','Statystyk / analityk','Przygotowanie do rywala: mały bonus w każdym meczu.']
];
const ROLE_N=Object.fromEntries(STAFF_ROLES.map(r=>[r[0],r[1]]));
function staffWage(sk){return round5k(50000+sk*sk*800);}
function genStaff(role,sk){const id='st'+(W().nextId++);return {id,first:FIRST[Math.floor(R()*FIRST.length)],last:LAST[Math.floor(R()*LAST.length)],role,skill:Math.round(clamp(sk,1,20)),age:30+Math.floor(R()*30),wage:0};}
function refreshStaffPool(){SAVE.staffPool=[];for(const [r] of STAFF_ROLES)for(let i=0;i<3;i++){const s=genStaff(r,5+R()*14);s.wage=staffWage(s.skill);SAVE.staffPool.push(s);}}
function staffSkill(r){const s=SAVE.staff&&SAVE.staff[r];return s?s.skill:3;}
function staffPay(){return Object.values(SAVE.staff||{}).filter(Boolean).reduce((a,s)=>a+s.wage,0);}
function hireStaff(id){const c=SAVE.staffPool.find(x=>x.id===id);if(!c)return;const cur=SAVE.staff[c.role];
  if(cur&&ui.confirm!=='h'+id){ui.confirm='h'+id;render();return;}ui.confirm=null;
  if(cur){const sev=round5k(cur.wage/4);money(-sev,'Sztab');finLog(`Odprawa: ${cur.first} ${cur.last} (${ROLE_N[cur.role]})`,-sev);SAVE.staffPool.push(cur);}
  SAVE.staff[c.role]=c;SAVE.staffPool=SAVE.staffPool.filter(x=>x.id!==id);news(`🧑‍🏫 Zatrudniono: ${c.first} ${c.last} — ${ROLE_N[c.role]} (jakość ${c.skill}/20).`);save();tradeMsg(true,`${c.first} ${c.last} dołącza do sztabu.`);}
function fireStaff(r){const cur=SAVE.staff[r];if(!cur)return;if(ui.confirm!=='f'+r){ui.confirm='f'+r;render();return;}ui.confirm=null;
  const sev=round5k(cur.wage/4);money(-sev,'Sztab');finLog(`Odprawa: ${cur.first} ${cur.last} (${ROLE_N[r]})`,-sev);SAVE.staff[r]=null;news(`📄 Zwolniono: ${cur.first} ${cur.last} (${ROLE_N[r]}).`);save();tradeMsg(true,`Zwolniono. Odprawa: ${fmt(sev)}.`);}
function aiStaff(ti){return clamp(6+SAVE.ai[ti].rep/12,4,16);}
function clubMods(ti){
  const inf=infraOf(ti),mine=ti===SAVE.team,st=r=>mine?staffSkill(r):aiStaff(ti);
  return {all:1+0.08*(inf.tren-1),tech:0.8+st('asy')/50,phys:0.8+st('fiz')/50,ment:0.8+st('psy')/50,
    jr:(1+0.1*(inf.akad-1))*(0.7+st('jr')/33),
    injChance:(1.05-0.05*(inf.med-1))*(1.2-st('fiz')/50),injDur:(1-0.07*(inf.med-1))*(1.3-st('med')/40),
    fat:1-0.04*(inf.odn-1),hb:0.012+0.003*inf.hala,sb:mine?(st('sta')-10)*0.0015:0};}
// potencjał widziany przez skauta
function hashId(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return ((h>>>0)%2001)/1000-1;}
function potSeen(p){if(p.tm===SAVE.team)return p.pot;const err=(20-staffSkill('sk'))/2;return Math.round(clamp(p.pot+hashId(p.id)*err,40,99));}

// ---- juniorzy ----
const JR_PLAN=['R','R','A','A','P','P','P','S','S','S','L','L'];
function genJunior(ti,age,pos){const t=TEAMS[ti];const inf=infraOf(ti);const mine=ti===SAVE.team;
  const jq=teamQ(t)-2.5-4.5+0.4*inf.akad+((mine?staffSkill('jr'):aiStaff(ti))-10)*0.06+(age-16)*0.6;
  const p=genPlayer(pos||randPos(),jq+R()*1.2,age);p.tm=ti;p.jr=true;p.inj=0;p.xp={};p.wage=0;p.ce=0;
  p.pot=Math.min(92,Math.round(rating(p)+4+R()*12+inf.akad));p.base=snap(p);assignNum(p,ti);return p;}
function initClub(){
  if(!SAVE.ai)return;
  for(const t of TEAMS)infraOf(t.idx);
  if(!SAVE.staff){SAVE.staff={};for(const [r] of STAFF_ROLES){if(r==='sk'||r==='sta')continue;const s=genStaff(r,7+R()*4);s.wage=staffWage(s.skill);SAVE.staff[r]=s;}SAVE.staff.sk=null;SAVE.staff.sta=null;}
  if(!SAVE.staffPool)refreshStaffPool();
  if(!SAVE.jrInit){for(const t of TEAMS)JR_PLAN.forEach((pos,i)=>{W().players.push(genJunior(t.idx,16+(i%4),pos));});SAVE.jrInit=true;}
  syncTeams();
}
function juniorsOf(ti){return W().players.filter(p=>p.tm===ti&&p.jr);}
function jTeam(ti){const t=TEAMS[ti];return {name:t.name+' U20',short:t.short+'·J',color:t.color,idx:ti,players:juniorsOf(ti)};}
function ensureJuniors(ti){let j=juniorsOf(ti);while(j.length<10){W().players.push(genJunior(ti,16+Math.floor(R()*3)));j=juniorsOf(ti);}}
function simJrRound(r){const s=S();s.jres=s.jres||[];s.jps=s.jps||{};const rd=[];
  for(const [h,a] of s.rounds[r]){ensureJuniors(h);ensureJuniors(a);
    const P=(i,home)=>{const jt=jTeam(i);return {team:jt,lineup:autoLineup(jt),tactics:{serve:1,dist:0},home,x:{hb:0.015,fat:1,sb:0}};};
    const m=simMatch(P(h,true),P(a,false));
    for(const sd of m.sides)for(const cp of sd.pl){const x=cp.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;ROUND_PLAYED.add(cp.id);const r2=s.jps[cp.id]||(s.jps[cp.id]={m:0,pts:0,kill:0,att:0});r2.m++;r2.pts+=x.kill+x.blk+x.ace;r2.kill+=x.kill;r2.att+=x.att;}
    const g=resultOf(m,h,a);if(h===SAVE.team||a===SAVE.team)g.me=true;rd.push(g);}
  s.jres.push(rd);
  if(s.jres.length===s.rounds.length){const ch=tableFrom(s.jres)[0].i;news(`🏆 Mistrzem ligi juniorów sezonu ${sLabel(s.n)} zostaje ${TEAMS[ch].name} U20${ch===SAVE.team?' — to Twoi juniorzy!':''}.`);s.jchamp=ch;}}
function promote(pid){const p=PLAYERS[pid].p;if(myTeam().players.length>=SQUAD_MAX)return tradeMsg(false,`Pierwsza drużyna jest pełna (maks. ${SQUAD_MAX}).`);
  p.jr=false;p.wage=Math.max(40000,wageDemand(p));p.ce=contractEndFor(3);syncTeams();news(`⬆️ ${p.first} ${p.last} awansuje z juniorów do pierwszej drużyny (kontrakt do ${ceDate(p.ce)}).`);save();tradeMsg(true,`${p.first} ${p.last} jest w pierwszej drużynie!`);}
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
function infraSvg(){
  const inf=myInfra(),b=SAVE.build,sel=ui.infraSel;
  const S0=26,ox=335,oy=125;
  const P=(x,y,z)=>[ox+(x-y)*S0*0.866,oy+(x+y)*S0*0.5-z*S0];
  const pts=a=>a.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
  const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16);const c=[n>>16,n>>8&255,n&255].map(v=>Math.round(Math.min(255,v*f)));return `rgb(${c.join(',')})`;};
  const box=(x,y,w,d,h,col,cls)=>{const A=P(x,y,h),B=P(x+w,y,h),C=P(x+w,y+d,h),D=P(x,y+d,h),B0=P(x+w,y,0),C0=P(x+w,y+d,0),D0=P(x,y+d,0);
    return `<polygon class="${cls||''}" points="${pts([D,C,C0,D0])}" fill="${shade(col,0.62)}"/><polygon class="${cls||''}" points="${pts([B,C,C0,B0])}" fill="${shade(col,0.82)}"/><polygon class="${cls||''}" points="${pts([A,B,C,D])}" fill="${shade(col,1.05)}"/>`;};
  const windows=(x,y,w,d,h)=>{let s='';for(let f=0;f<Math.floor(h/0.9);f++){const z=0.35+f*0.9;for(let i=0;i<Math.floor(w/0.9);i++){const a=P(x+w,y+0.3+i*0.9,z+0.45),bq=P(x+w,y+0.75+i*0.9,z+0.45),c=P(x+w,y+0.75+i*0.9,z),dq=P(x+w,y+0.3+i*0.9,z);if(0.75+i*0.9>d-0.1)break;s+=`<polygon points="${pts([a,bq,c,dq])}" fill="#fde68a" opacity=".55"/>`;}
      for(let i=0;i<Math.floor(w/0.9);i++){const xx=x+0.3+i*0.9;if(xx+0.45>x+w-0.1)break;const a=P(xx,y+d,z+0.45),bq=P(xx+0.45,y+d,z+0.45),c=P(xx+0.45,y+d,z),dq=P(xx,y+d,z);s+=`<polygon points="${pts([a,bq,c,dq])}" fill="#fde68a" opacity=".45"/>`;}}return s;};
  const plots={hala:[0,0,6,4.5],tren:[9,0,4.5,4.2],akad:[15.8,0,4,3.6],med:[0,8.2,4,3.6],odn:[6.6,8.2,4,3.6],sklep:[13.2,8.2,3.6,3.6]};let labels='';
  let g='';
  // teren
  g+=`<polygon points="${pts([P(-1.5,-1.5,0),P(21.5,-1.5,0),P(21.5,13.5,0),P(-1.5,13.5,0)])}" fill="#2f6b3a"/>`;
  g+=`<polygon points="${pts([P(-1.5,6.1,0),P(21.5,6.1,0),P(21.5,7.1,0),P(-1.5,7.1,0)])}" fill="#4b5563"/>`;
  g+=`<polygon points="${pts([P(7.2,-1.5,0),P(7.9,-1.5,0),P(7.9,13.5,0),P(7.2,13.5,0)])}" fill="#4b5563"/>`;
  g+=`<polygon points="${pts([P(14.2,-1.5,0),P(14.9,-1.5,0),P(14.9,6.1,0),P(14.2,6.1,0)])}" fill="#4b5563"/>`;
  const order=Object.keys(plots).sort((a,b)=>(plots[a][0]+plots[a][1])-(plots[b][0]+plots[b][1]));
  for(const k of order){const f=INFRA.find(x=>x.k===k);const [x,y,w,d]=plots[k];const L=inf[k];const building=b&&b.k===k;
    g+=`<g class="bld ${sel===k?'sel':''}" onclick="ui.infraSel='${k}';ui.confirm=null;ui.tmsg=null;render()">`;
    g+=`<polygon points="${pts([P(x-0.3,y-0.3,0),P(x+w+0.3,y-0.3,0),P(x+w+0.3,y+d+0.3,0),P(x-0.3,y+d+0.3,0)])}" fill="${sel===k?'#ffb02055':'#00000022'}" stroke="${sel===k?'#ffb020':'none'}" stroke-width="2"/>`;
    let h;
    if(k==='hala'){h=0.9+L*0.55;g+=box(x,y,w,d,h,f.col);g+=windows(x,y,w,d,h);
      const c=P(x+w/2,y+d/2,h);g+=`<ellipse cx="${c[0]}" cy="${c[1]}" rx="${S0*w*0.38}" ry="${S0*d*0.24}" fill="${shade(f.col,1.25)}" opacity=".9"/>`;
      if(L>=4){g+=`<ellipse cx="${c[0]}" cy="${c[1]-4}" rx="${S0*w*0.26}" ry="${S0*d*0.15}" fill="#e0f2fe" opacity=".8"/>`;}
    }else if(k==='tren'){h=0.5+L*0.45;g+=box(x,y,w,d*0.55,h,f.col);g+=windows(x,y,w,d*0.55,h);
      // boisko treningowe przed budynkiem
      g+=`<polygon points="${pts([P(x+0.2,y+d*0.62,0.02),P(x+w-0.2,y+d*0.62,0.02),P(x+w-0.2,y+d-0.1,0.02),P(x+0.2,y+d-0.1,0.02)])}" fill="#c9773a" stroke="#fff" stroke-width="1"/>`;
      const n1=P(x+w/2,y+d*0.62,0.02),n2=P(x+w/2,y+d-0.1,0.02);g+=`<line x1="${n1[0]}" y1="${n1[1]}" x2="${n2[0]}" y2="${n2[1]}" stroke="#fff" stroke-width="2"/>`;
    }else{h=0.5+L*0.5;g+=box(x,y,w,d,h,f.col);g+=windows(x,y,w,d,h);
      if(k==='med'){const c=P(x+w/2,y+d/2,h);g+=`<text x="${c[0]}" y="${c[1]+5}" text-anchor="middle" font-size="16" fill="#fff" font-weight="900">✚</text>`;}
      if(k==='sklep'){const a=P(x+w,y+0.2,h*0.75),a2=P(x+w,y+d-0.2,h*0.75),a3=P(x+w+0.6,y+d-0.2,h*0.55),a4=P(x+w+0.6,y+0.2,h*0.55);g+=`<polygon points="${pts([a,a2,a3,a4])}" fill="#fff" opacity=".85"/><polygon points="${pts([a,a2,a3,a4])}" fill="url(#stripe)" opacity=".7"/>`;}
      if(k==='odn'){const c=P(x+w+0.3,y+d/2,0);g+=`<ellipse cx="${c[0]+18}" cy="${c[1]+8}" rx="18" ry="8" fill="#38bdf8" opacity=".85"/>`;}
      if(k==='akad'&&L>=3){const c=P(x+w/2,y+d/2,h);g+=`<text x="${c[0]}" y="${c[1]+5}" text-anchor="middle" font-size="13">🎓</text>`;}
    }
    if(building){const nh=(k==='hala'?0.9+b.to*0.55:k==='tren'?0.5+b.to*0.45:0.5+b.to*0.5);const dd=k==='tren'?d*0.55:d;
      const A=P(x,y,nh),B=P(x+w,y,nh),C=P(x+w,y+dd,nh),D=P(x,y+dd,nh);g+=`<polygon points="${pts([A,B,C,D])}" fill="none" stroke="#ffb020" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      for(const q of [[x,y+dd],[x+w,y+dd],[x+w,y]]){const lo=P(q[0],q[1],h),hi=P(q[0],q[1],nh);g+=`<line x1="${lo[0]}" y1="${lo[1]}" x2="${hi[0]}" y2="${hi[1]}" stroke="#ffb020" stroke-width="1.5" stroke-dasharray="4 3"/>`;}
      const cr=P(x+w+0.2,y-0.2,0),ct=P(x+w+0.2,y-0.2,nh+1.4);g+=`<line x1="${cr[0]}" y1="${cr[1]}" x2="${ct[0]}" y2="${ct[1]}" stroke="#facc15" stroke-width="3"/><line x1="${ct[0]-40}" y1="${ct[1]}" x2="${ct[0]+20}" y2="${ct[1]}" stroke="#facc15" stroke-width="3"/><line x1="${ct[0]-30}" y1="${ct[1]}" x2="${ct[0]-30}" y2="${ct[1]+22}" stroke="#facc15" stroke-width="1"/>`;}
    const lab=P(x+w/2,y+d/2,(k==='hala'?0.9+L*0.55:0.5+L*0.5)+0.6);
    labels+=`<g class="lbl" onclick="ui.infraSel='${k}';ui.confirm=null;ui.tmsg=null;render()"><rect x="${lab[0]-62}" y="${lab[1]-30}" width="124" height="34" rx="7" fill="#0b1220e6" stroke="${f.col}"/><text x="${lab[0]}" y="${lab[1]-16}" text-anchor="middle" font-size="11" font-weight="700" fill="#e6ecf7">${f.n}</text><text x="${lab[0]}" y="${lab[1]-3}" text-anchor="middle" font-size="10" fill="#ffb020">${'★'.repeat(L)}<tspan fill="#475569">${'★'.repeat(5-L)}</tspan>${building?' 🏗️':''}</text></g>`;g+=`</g>`;
  }
  return `<svg class="campus" viewBox="0 0 880 600"><defs><pattern id="stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="${TEAMS[SAVE.team].color}"/></pattern></defs>${g}${labels}</svg>`;
}
function clubView(){
  const inf=myInfra(),b=SAVE.build;const k=ui.infraSel||'hala';const f=INFRA.find(x=>x.k===k);const L=inf[k];
  let prog='';if(b){const tot=daysBetween(b.start,b.until),done=clamp(daysBetween(b.start,today()),0,tot);const bf=INFRA.find(x=>x.k===b.k);
    prog=`<div class="card build"><b>🏗️ Trwa budowa: ${bf.n} → poziom ${b.to}</b><div class="pbar"><i style="width:${Math.round(done/tot*100)}%"></i></div><div class="small mut">${done}/${tot} dni · koniec ${fmtLong(b.until)}</div></div>`;}
  const panel=`<div class="card ipanel" style="border-color:${f.col}"><div class="row"><h2 style="margin:0">${f.n}</h2><span class="sp"></span><span class="stars">${'★'.repeat(L)}<span class="mut">${'★'.repeat(5-L)}</span></span></div>
   ${ui.tmsg?`<div class="tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}
   <p class="mut">${f.d}</p><div class="tw"><table class="cmp"><tbody><tr><td class="l">Teraz (poziom ${L})</td><td>${f.eff(L)}</td></tr>${L<5?`<tr><td class="l">Po rozbudowie (poziom ${L+1})</td><td class="good">${f.eff(L+1)}</td></tr><tr><td class="l">Koszt rozbudowy</td><td>${fmt(upgradeCost(f,L))}</td></tr><tr><td class="l">Czas budowy</td><td>${upgradeDays(f,L)} dni</td></tr>`:''}<tr><td class="l">Utrzymanie</td><td>${fmt(L*MAINT_PER_LEVEL)} / miesiąc${L<5?` → ${fmt((L+1)*MAINT_PER_LEVEL)}`:''}</td></tr></tbody></table></div>
   ${L<5?`<button class="btn" ${b?'disabled':''} onclick="startBuild('${k}')">${ui.confirm==='b'+k?`Na pewno? Zapłacisz ${fmt(upgradeCost(f,L))}`:`Rozbuduj do poziomu ${L+1}`}</button>${b?'<span class="small mut"> · najpierw musi się skończyć obecna budowa</span>':''}`:'<p class="good">Maksymalny poziom.</p>'}</div>`;
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Baza klubu: ${esc(myTeam().name)}</h2><span class="sp"></span><span class="small">Saldo: <b>${fmt(SAVE.fin.bal)}</b> · utrzymanie: <b>${fmt(maintenance())}/mies.</b></span></div><p class="small mut">Kliknij budynek, żeby zobaczyć szczegóły i rozbudować. Budynki rosną z każdym poziomem.</p>${infraSvg()}</div>${prog}${panel}
  <div class="card"><h2>Wszystkie obiekty</h2><div class="tw"><table><thead><tr><th class="l">Obiekt</th><th>Poziom</th><th class="l">Efekt</th><th>Rozbudowa</th></tr></thead><tbody>${INFRA.map(x=>`<tr class="clickrow" onclick="ui.infraSel='${x.k}';render()"><td class="l"><span class="dot" style="background:${x.col}"></span>${x.n}</td><td class="stars">${'★'.repeat(inf[x.k])}<span class="mut">${'★'.repeat(5-inf[x.k])}</span></td><td class="l small">${x.eff(inf[x.k])}</td><td>${inf[x.k]<5?fmt(upgradeCost(x,inf[x.k])):'—'}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function staffView(){
  const pool=SAVE.staffPool||[];
  const card=([r,n,d])=>{const s=SAVE.staff[r];const cands=pool.filter(x=>x.role===r).sort((a,b)=>b.skill-a.skill);
    return `<div class="card staff"><div class="row"><h3 style="margin:0">${n}</h3><span class="sp"></span>${s?`<span class="sk ${aCls(s.skill)}">${s.skill}/20</span>`:'<span class="bad small">wakat</span>'}</div><p class="small mut">${d}</p>
    ${s?`<div class="row small"><span><b>${esc(s.first)} ${esc(s.last)}</b>, ${s.age} l. · ${fmt(s.wage)}/rok</span><span class="sp"></span><button class="link" onclick="fireStaff('${r}')">${ui.confirm==='f'+r?`Na pewno? Odprawa ${fmt(round5k(s.wage/4))}`:'Zwolnij'}</button></div>`:'<p class="small bad">Brak osoby na tym stanowisku — efekt jak przy bardzo słabym specjaliście.</p>'}
    <details ${s?'':'open'}><summary class="link">Kandydaci (${cands.length})</summary>${cands.map(c=>`<div class="row small cand"><span class="sk ${aCls(c.skill)}">${c.skill}</span><span>${esc(c.first)} ${esc(c.last)}, ${c.age} l. · ${fmt(c.wage)}/rok</span><span class="sp"></span><button class="ghost" onclick="hireStaff('${c.id}')">${ui.confirm==='h'+c.id?'Na pewno? (zastąpi obecnego)':'Zatrudnij'}</button></div>`).join('')||'<p class="mut small">Brak kandydatów — nowi pojawią się w oknie transferowym.</p>'}</details></div>`;};
  return `${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}<div class="card"><div class="row wrap"><h2 style="margin:0">Sztab szkoleniowy</h2><span class="sp"></span><span class="small">Pensje sztabu: <b>${fmt(staffPay())}/rok</b> · saldo ${fmt(SAVE.fin.bal)}</span></div>
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
  ${js.map(p=>{const d=rating(p)-baseRating(p);const st=jps[p.id];return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button>${p.inj?' 🚑':''}${p.age>=20?' <span class="tag">20+</span>':''}</td><td>${POS_SHORT[p.pos]}</td><td>${p.age}</td><td><b>${rating(p)}</b></td><td class="stars">${potStars(p)}</td><td class="${d>0?'good':''}">${d>0?'+'+d:'–'}</td><td>${st?st.m:0}</td><td>${st?st.pts:0}</td><td><button class="ghost sm" onclick="promote('${p.id}')">⬆️ Awans</button></td></tr>`;}).join('')}</tbody></table></div></div>
  <div class="card"><h2>Liga juniorów ${sLabel(s.n)}</h2>${tb.some(x=>x.m)?`<div class="tw"><table><thead><tr><th>#</th><th class="l">Drużyna</th><th>M</th><th>Z</th><th>P</th><th>Pkt</th><th>Sety</th></tr></thead><tbody>${tb.map((x,i)=>`<tr class="${x.i===SAVE.team?'starter':''}"><td>${i+1}</td><td class="l">${tDot(x.i)}${tName(x.i)} U20</td><td>${x.m}</td><td>${x.w}</td><td>${x.l}</td><td><b>${x.pts}</b></td><td>${x.sw}:${x.sl}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">Liga juniorów rusza razem z fazą zasadniczą seniorów.</p>'}
  ${last?`<h3>Ostatnia kolejka juniorów</h3>${last.map(g=>`<div class="res ${g.me?'me':''}">${resTxt(g)}</div>`).join('')}`:''}${s.jchamp!=null?`<p>🏆 Mistrz: <b>${tName(s.jchamp)} U20</b></p>`:''}</div>
  ${juniorLeaders()}`;
}
function juniorLeaders(){const jps=S().jps||{};const arr=Object.entries(jps).map(([id,r])=>({id,r})).filter(x=>PLAYERS[x.id]).sort((a,b)=>b.r.pts-a.r.pts).slice(0,10);if(!arr.length)return '';
  return `<div class="card"><h2>Najlepiej punktujący juniorzy</h2>${arr.map((x,i)=>{const P=PLAYERS[x.id];return `<div class="lrow ${P.p.tm===SAVE.team?'me':''}" onclick="openCard('${x.id}')"><span class="mut">${i+1}.</span> ${P.p.tm>=0?tDot(P.p.tm):''}<span class="ln">${esc(P.p.first)} ${esc(P.p.last)} <small class="mut">${P.p.tm>=0?esc(TEAMS[P.p.tm].short):''} · ${POS_SHORT[P.p.pos]} · ${P.p.age} l.${P.p.jr?'':' · już w seniorach'}</small></span><b>${x.r.pts}</b></div>`;}).join('')}</div>`;}
