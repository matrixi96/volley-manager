'use strict';
// ================= SILNIK GRY =================
function R(){return Math.random();}
function nz(){return (R()+R()+R()-1.5)/1.5;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

const FIRST=['Jakub','Kamil','Bartosz','Mateusz','Michał','Piotr','Paweł','Tomasz','Łukasz','Krzysztof','Marcin','Dawid','Szymon','Wojciech','Adrian','Damian','Grzegorz','Karol','Filip','Hubert','Norbert','Aleksander','Maciej','Rafał','Sebastian','Artur','Igor','Oskar','Patryk','Jan','Kacper','Antoni','Wiktor','Dominik','Konrad'];
const LAST=['Nowak','Kowalski','Wiśniewski','Wójcik','Kowalczyk','Zieliński','Szymański','Woźniak','Dąbrowski','Kozłowski','Jankowski','Mazur','Krawczyk','Piotrowski','Grabowski','Nowicki','Pawłowski','Michalski','Adamczyk','Dudek','Zając','Wieczorek','Jabłoński','Król','Majewski','Olszewski','Jaworski','Wróbel','Malinowski','Pawlak','Witkowski','Walczak','Stępień','Górski','Rutkowski','Michalak','Sikora','Ostrowski','Baran','Szewczyk','Tomaszewski','Pietrzak','Marciniak','Wróblewski','Zalewski','Jakubowski','Jasiński','Zawadzki','Sadowski','Bąk','Chmielewski','Włodarczyk','Borkowski','Czarnecki','Sawicki','Sokołowski','Urbański','Maciejewski','Szczepański','Kucharski','Wilk','Kalinowski','Lis','Mazurek','Wysocki','Adamski','Kaźmierczak','Wasilewski','Sobczak','Czerwiński','Andrzejewski','Cieślak','Głowacki','Zakrzewski','Kołodziej','Sikorski','Krajewski','Gajewski','Szulc','Szymczak','Baranowski','Laskowski','Brzeziński','Makowski','Ziółkowski','Przybylski'];

const POS_NAMES={R:'Rozgrywający',A:'Atakujący',P:'Przyjmujący',S:'Środkowy',L:'Libero'};
const POS_SHORT={R:'ROZ',A:'ATA',P:'PRZ',S:'ŚRO',L:'LIB'};
const ATTRS=[['zag','Zagrywka','Zag','Siła i precyzja zagrywki.'],['prz','Przyjęcie','Prz','Przyjęcie zagrywki.'],['ata','Atak','Ata','Skuteczność ataku.'],['blo','Blok','Blo','Czytanie gry i ustawienie w bloku.'],['obr','Obrona','Obr','Obrona w polu.'],['roz','Rozegranie','Roz','Wystawianie piłek atakującym.'],['tod','Technika odbicia dołem','OdD','Jakość przyjęcia i obrony (dokładność).'],['tpa','Technika odbicia palcami','OdP','Jakość wystawy, zwłaszcza gdy rozgrywa nie-rozgrywający.'],['czy','Czytanie gry','Czy','Ustawienie w bloku, trafianie w kierunek ataku, obrona i asekuracja za blokiem.'],['kiw','Kiwka','Kiw','Lekki atak i przebicie: przy złej wystawie i piłkach sytuacyjnych.']];
const PHYS=[['sil','Siła','Sił','Moc ataku i zagrywki.'],['szy','Szybkość','Szy','Dobieg do piłki w obronie, szybkie ataki środkiem, przesunięcie w bloku.'],['sko','Skoczność','Sko','Wysokość ataku i bloku.'],['zwi','Zwinność','Zwi','Obrona trudnych piłek, reakcja.'],['kon','Kondycja','Kon','Wolniejsze męczenie się.']];
const MENTAL=[['kcj','Koncentracja','Kcj','Mniej prostych błędów (zagrywka, atak, rozegranie).'],['opa','Opanowanie','Opa','Gra w końcówkach setów i w tie-breaku, odporność na presję.'],['zaa','Zaangażowanie','Zaa','Wolniej się męczy, więcej walki w obronie.'],['wal','Waleczność','Wal','Gra lepiej, gdy drużyna przegrywa.'],['kom','Komunikacja','Kom','Wołanie piłki i porozumienie na boisku: mniej nieporozumień przy niedokładnym przyjęciu.']];
const ALL_ATTRS=ATTRS.concat(PHYS,MENTAL);
// ---- charakter zawodnika ----
const TRAITS={amb:['Ambitny','#f59e0b','Szybciej się rozwija i lepiej gra w końcówkach. Źle znosi długie siedzenie na ławce.','Ambit.'],
 zde:['Zdeterminowany','#ef4444','Gra lepiej, gdy drużyna przegrywa. Wolniej traci morale po błędach.','Zdet.'],
 lid:['Lider','#22c55e','Podnosi morale i zgranie całej drużyny. Najlepszy kandydat na kapitana.','Lider'],
 pra:['Pracowity','#38bdf8','Wyciąga więcej z każdego treningu.','Prac.'],
 pro:['Profesjonalista','#a78bfa','Równa forma, mniej prostych błędów, wolniej traci umiejętności z wiekiem.','Prof.'],
 spo:['Spokojny','#2dd4bf','Lepszy pod presją, w końcówkach setów i w tie-breaku.','Spok.'],
 ner:['Nerwowy','#f97316','Słabszy pod presją i w końcówkach setów.','Nerw.'],
 len:['Leniwy','#94a3b8','Wolniej się rozwija, mniej wyciąga z treningu.','Leniw.'],
 kap:['Kapryśny','#e879f9','Na ławce szybko traci humor i psuje atmosferę w szatni.','Kapr.'],
 ind:['Indywidualista','#fb7185','Częściej bierze ciężar ataku na siebie, nawet ze złych piłek. Obniża zgranie zespołu.','Indyw.']};
const TR_BAD={spo:['ner'],ner:['spo','lid'],pra:['len'],len:['pra','amb','pro'],amb:['len'],pro:['len','kap'],kap:['pro','lid'],lid:['kap','ner','ind'],ind:['lid']};
function ensTraits(p){if(!p||p.tr)return p;let h=5;for(const c of String(p.id))h=(h*137+c.charCodeAt(0))>>>0;const rnd=mulberry32(h);
  const w={amb:3,zde:2+((p.wal||10)-10)*0.4,lid:1.2+((p.kom||10)-10)*0.35+(p.age>=28?1:0),pra:3,pro:2+(p.age>=27?1.5:0),spo:1.5+((p.opa||10)-10)*0.35,ner:1.5-((p.opa||10)-10)*0.3,len:1.3,kap:1,ind:1.2+(p.pos==='A'?1.5:0)};
  const pick=ex=>{let tot=0;const ks=Object.keys(w).filter(k=>!ex.includes(k)&&!ex.some(e=>(TR_BAD[e]||[]).includes(k)));for(const k of ks)tot+=Math.max(0.2,w[k]);let r=rnd()*tot;for(const k of ks){r-=Math.max(0.2,w[k]);if(r<=0)return k;}return ks[0];};
  const a=pick([]);p.tr=[a];if(rnd()<0.38)p.tr.push(pick([a]));return p;}
function hasT(p,k){if(!p)return false;if(!p.tr)ensTraits(p);return p.tr.includes(k);}
const TEMPL={
  R:{czy:1,kiw:1,zag:0,prz:-3,ata:-4,blo:-2,obr:0,roz:4,sko:-1,kon:0,tod:0,tpa:4,sil:-2,szy:1,zwi:1},
  A:{czy:-1,kiw:1,zag:2,prz:-7,ata:4,blo:1,obr:-2,roz:-7,sko:2,kon:0,tod:-4,tpa:-5,sil:3,szy:0,zwi:-1},
  P:{czy:0,kiw:1,zag:1,prz:3,ata:2,blo:-1,obr:2,roz:-5,sko:1,kon:0,tod:2,tpa:-3,sil:1,szy:1,zwi:1},
  S:{czy:1,kiw:-1,zag:-1,prz:-8,ata:2,blo:4,obr:-4,roz:-6,sko:2,kon:0,tod:-6,tpa:-5,sil:2,szy:1,zwi:-2},
  L:{czy:2,kiw:-10,zag:-12,prz:5,ata:-11,blo:-13,obr:5,roz:-2,sko:-3,kon:0,tod:5,tpa:1,sil:-6,szy:3,zwi:4}
};
const HEIGHT={R:[186,198],A:[195,210],P:[189,202],S:[199,213],L:[172,188]};
const WEIGHTS={
  R:{roz:5,tpa:2,zag:1.5,obr:1.5,blo:1,sko:0.5,szy:0.5,kon:0.5,czy:0.6,kiw:0.5},
  A:{ata:5,zag:2,sil:1.5,blo:1.5,sko:1.5,obr:0.5,kon:0.5,czy:0.6,kiw:0.8},
  P:{prz:3.5,ata:3,tod:1.5,obr:1.5,zag:1.5,blo:0.5,sko:0.5,zwi:0.5,kon:0.5,czy:0.8,kiw:0.8},
  S:{blo:4.5,ata:2.5,sko:1.5,szy:1,zag:1,sil:0.5,kon:0.5,czy:1.5,kiw:0.3},
  L:{prz:4.5,obr:4.5,tod:2,zwi:1.5,szy:1,roz:0.5,kon:0.5,czy:1.5}
};
for(const k in WEIGHTS)Object.assign(WEIGHTS[k],{kcj:0.6,opa:0.5,zaa:0.4,wal:0.4,kom:0.4});
const POS_OFF={};
function posOff(pos){if(POS_OFF[pos]==null){const w=WEIGHTS[pos];let s=0,t=0;for(const k in w){s+=(TEMPL[pos][k]||0)*w[k];t+=w[k];}POS_OFF[pos]=s/t;}return POS_OFF[pos];}
function rating(p,pos){pos=pos||p.pos;if(p.czy==null||p.kiw==null||p.kom==null)ensAttrs(p);const w=WEIGHTS[pos];let s=0,t=0;for(const k in w){s+=p[k]*w[k];t+=w[k];}let r=s/t-posOff(pos)+2.5;if(pos!=='L')r+=(p.h-HEIGHT[pos][0]-6)*0.05;return Math.round(clamp(r*5,1,100));}

const TEAM_DEFS=[
  {name:'Błękitni Łódź',short:'BŁŁ',q:13.1,color:'#3b82f6'},
  {name:'Sokoły Rzeszów',short:'SOK',q:14,color:'#ef4444'},
  {name:'Burza Kraków',short:'BUR',q:13.6,color:'#a855f7'},
  {name:'Hutnicy Katowice',short:'HUT',q:12.8,color:'#f97316'},
  {name:'Gryf Gdańsk',short:'GRY',q:12.4,color:'#eab308'},
  {name:'Koziołki Poznań',short:'KOZ',q:12,color:'#14b8a6'},
  {name:'Wiking Szczecin',short:'WIK',q:11.6,color:'#22c55e'},
  {name:'Orlik Lublin',short:'ORL',q:11.2,color:'#ec4899'},
  {name:'Huragan Wrocław',short:'HUR',q:13.4,color:'#0ea5e9'},
  {name:'Kormorany Olsztyn',short:'KOR',q:12.3,color:'#64748b'},
  {name:'Rakieta Bydgoszcz',short:'RAK',q:11.9,color:'#dc2626'},
  {name:'Jantar Elbląg',short:'JAN',q:11.4,color:'#d97706'}
];
function genTeam(def,idx){
  const rnd=mulberry32(1000+idx*7919);
  const g=()=>(rnd()+rnd()+rnd()-1.5)/1.5;
  const plan=[['R',1.5],['R',-1.5],['A',1.5],['A',-1.5],['P',1.3],['P',1.0],['P',-1.2],['P',-1.8],['S',1.3],['S',1.0],['S',-1.2],['S',-1.8],['L',1.3],['L',-1.5]];
  const used=new Set(),nums=new Set();
  const players=plan.map(([pos,tier],i)=>{
    let first,last;do{first=FIRST[Math.floor(rnd()*FIRST.length)];last=LAST[Math.floor(rnd()*LAST.length)];}while(used.has(last));used.add(last);
    let num;do{num=1+Math.floor(rnd()*25);}while(nums.has(num));nums.add(num);
    const p={id:'t'+idx+'p'+i,first,last,pos,num,age:19+Math.floor(rnd()*15)};
    const hh=HEIGHT[pos];p.h=Math.round(hh[0]+rnd()*(hh[1]-hh[0]));
    for(const [k] of ATTRS.concat(PHYS))p[k]=Math.round(clamp(def.q+TEMPL[pos][k]+tier+g()*1.8,1,20));
    for(const [k] of MENTAL)p[k]=Math.round(clamp(def.q-1+tier*0.3+g()*4,1,20));
    return p;
  });
  return Object.assign({},def,{idx,players});
}
function lineupScore(p,pos){return rating(p,pos)+(p.pos===pos?8:0);}
function autoLineup(team){const u=new Set(),lu={};
  for(const [k,,pos] of LINEUP_KEYS){const c=team.players.filter(p=>!p.inj&&!u.has(p.id)).sort((a,b)=>lineupScore(b,pos)-lineupScore(a,pos))[0]||team.players.filter(p=>!u.has(p.id))[0];if(!c)continue;u.add(c.id);lu[k]=c.id;}
  return lu;}
const LINEUP_KEYS=[['R','Rozgrywający','R'],['A','Atakujący','A'],['P1','Przyjmujący 1','P'],['P2','Przyjmujący 2','P'],['S1','Środkowy 1','S'],['S2','Środkowy 2','S'],['L','Libero','L']];
function validLineup(team,lu){if(!lu)return false;const ids=LINEUP_KEYS.map(k=>lu[k[0]]);if(new Set(ids).size!==7)return false;return ids.every(id=>team.players.some(p=>p.id===id));}
function teamStrength(team){const lu=autoLineup(team);let s=0,t=0;for(const [k,,pos] of LINEUP_KEYS){const p=team.players.find(x=>x.id===lu[k]);if(!p){t+=1;continue;}const w=k==='L'?0.6:1;s+=rating(p,pos)*w;t+=w;}return Math.round(s/t);}

// ---------- mecz ----------
function cloneP(p){const fm=p.fm==null?60:p.fm;return Object.assign({},p,{en:p.fr!=null?Math.round(clamp(70+p.fr*0.3,60,100)):100,mor:Math.round(clamp(60+(fm-60)*0.3+nz()*12,30,92)),st:{srv:0,srvErr:0,ace:0,rec:0,recPos:0,recPerf:0,recErr:0,att:0,kill:0,attErr:0,blocked:0,blk:0,dig:0,bout:0,e3:0,ne:0}});}
// forma zawodnika (0–100, 60 = przeciętna): bonus do gry w meczu
function formB(p){return p&&p.fm!=null?(p.fm-60)/40*0.04:0;}
// zgranie: mecze rozegrane razem w tym klubie (30+ = pełne zgranie)
function togetherOf(p,ti){return p.tcTm==null?(p.tc!=null?0:15):(p.tcTm===ti?(p.tc||0):0);}
function chemOf(ps,ti,cap){ps=ps.filter(Boolean);
  if(typeof teamPairChem==='function'&&ps.length>=2){const v=teamPairChem(ps);return clamp(v+(cap?capBonus(cap)*0.6:0),0.3,1);}const v=ps.map(p=>Math.min(1,togetherOf(p,ti)/30));if(!v.length)return 0.6;let c=0.3+0.7*v.reduce((a,b)=>a+b,0)/v.length;
  for(const p of ps){if(hasT(p,'ind'))c-=0.03;if(hasT(p,'lid'))c+=0.015;}if(cap)c+=capBonus(cap)*0.6;return clamp(c,0.3,1);}
function capBonus(c){if(!c)return 0;return clamp(((c.kom||10)-10)*0.004+((c.opa||10)-10)*0.002+(hasT(c,'lid')?0.04:0)-(hasT(c,'ner')||hasT(c,'ind')||hasT(c,'kap')?0.03:0),-0.05,0.08);}
function autoCaptain(ps){let b=null,bs=-1e9;for(const p of ps.filter(Boolean)){const s=(hasT(p,'lid')?8:0)+(p.kom||10)+(p.opa||10)*0.6+Math.min(p.age,32)*0.25-(hasT(p,'ner')||hasT(p,'kap')||hasT(p,'ind')?5:0);if(s>bs){bs=s;b=p;}}return b;}
function pdFrom(q){return q>=3?R()*0.8:q===2?0.9+R()*1.8:2.5+R()*3.3;}
// ustawienie startowe: ile rotacji od ustawienia 1 (rozgrywający w strefie 1)
function baseRot(tac){const n=((tac&&tac.startRot)||0)%6;const r=[0,1,2,3,4,5];for(let i=0;i<n;i++)r.push(r.shift());return r;}
function makeSide(team,lu,tac,home,x){
  const ids=new Set(Object.values(lu));const pl=team.players.filter(p=>!p.inj||ids.has(p.id)).map(cloneP);const g=id=>pl.find(p=>p.id===id);
  const slots=[['R',lu.R],['P',lu.P1],['S',lu.S1],['A',lu.A],['P',lu.P2],['S',lu.S2]].map(([role,id])=>({role,p:g(id)}));
  const st7=slots.map(x=>x.p).concat([g(lu.L)]);const cap=(x&&x.cap&&g(x.cap))||autoCaptain(st7);
  const chem=chemOf(st7,team.idx,cap);
  {let d=0;if(st7.some(p=>p&&hasT(p,'lid')))d+=3;if(cap&&hasT(cap,'lid'))d+=2;if(pl.some(p=>hasT(p,'kap')&&(p.unh||0)>=3))d-=3;
   for(const p of pl){let e=d;if(hasT(p,'amb'))e+=2;if(hasT(p,'kap')&&(p.unh||0)>=3)e-=8;if(e)p.mor=Math.round(clamp(p.mor+e,5,100));}}
  if(typeof pairBonusSide==='function'){try{pairBonusSide(team,lu,pl);}catch(e){}}
  return {chem,cap:cap?cap.id:null,team,pl,slots,libero:g(lu.L),rot:baseRot(tac),tactics:Object.assign({},tac),mom:0,home:!!home,fatMul:(x&&x.fat)||1,momMul:(x&&x.momMul)||1,prB:(x&&x.prB)||0,trB:(x&&x.trB)||0,form:nz()*0.09+(home?(x&&x.hb!=null?x.hb:0.015):0)+((x&&x.sb)||0),to:2,subs:6};
}
function newMatch(a,b){
  const m={sides:[makeSide(a.team,a.lineup,a.tactics,a.home,a.x),makeSide(b.team,b.lineup,b.tactics,b.home,b.x)],setNo:1,score:[0,0],setsWon:[0,0],sets:[],firstServe:R()<0.5?0:1,run:{t:-1,n:0},over:false,rallies:0,sideout:[0,0]};
  m.serving=m.firstServe;return m;
}
function onCourt(side,serving){
  return side.rot.map((si,z)=>{const s=side.slots[si];
    if(s.role==='S'&&(z===0||z===4||z===5)&&side.libero&&!(serving&&z===0))return {zone:z,role:'L',p:side.libero,slot:'L'};
    return {zone:z,role:s.role,p:s.p,slot:si};});
}
function pressure(m){const a=m.score[0],b=m.score[1],t=m.setNo===5?15:25;return Math.max(a,b)>=t-4&&Math.min(a,b)>=t-8;}
function mb(p,m,i){let b=(p.mor==null?0:(p.mor-60)/40*0.045)+formB(p)+(p.pcB||0);const sd=m.sides[i];const pr=pressure(m);if(pr)b+=(p.opa-11)/20*0.14+(sd.prB||0);const tr=m.score[1-i]-m.score[i]>=3||(m.setsWon&&m.setsWon[1-i]>m.setsWon[i]);if(m.score[1-i]-m.score[i]>=3)b+=(p.wal-11)/20*0.1+(sd.trB||0);
  if(p.tr){if(pr){if(hasT(p,'spo'))b+=0.025;if(hasT(p,'ner'))b-=0.035;if(hasT(p,'amb'))b+=0.012;}if(tr&&hasT(p,'zde'))b+=0.03;}
  if(pr&&sd.cap){const c=sd.pl.find(x=>x.id===sd.cap);if(c&&c!==p)b+=capBonus(c)*0.25;}
  const sh=sd.sh;if(sh&&sh.u>m.rallies){b+=sh.p||0;if(pr)b+=sh.pr||0;if(tr)b+=sh.b||0;}
  return b;}
function kc(p,m){let k=1.25-p.kcj/20*0.5;{const sd=m.sides&&m.sides.find(x=>x.pl.includes(p));if(sd&&sd.sh&&sd.sh.u>m.rallies&&sd.sh.e)k*=1-sd.sh.e;}if(pressure(m))k*=1.15-p.opa/20*0.3;if(p.tr){if(hasT(p,'pro'))k*=0.9;if(hasT(p,'ner')&&pressure(m))k*=1.1;if(hasT(p,'ind'))k*=1.04;}return k;}
function nerves(p,m){return pressure(m)&&p.opa<10?' Nerwy w końcówce!':'';}
function bn(s){return s.mom*0.01*(s.momMul||1)+s.form;}
function ensAttrs(p){if(!p||p.czy!=null&&p.kiw!=null&&p.kom!=null)return p;const t=TEMPL[p.pos]||TEMPL.P;
  const h=(()=>{let x=0;for(const c of String(p.id))x=(x*31+c.charCodeAt(0))>>>0;return x;})();const j=k=>((h>>>k)%7-3)*0.5;
  if(p.czy==null)p.czy=Math.round(clamp(((p.blo||10)-(t.blo||0)+(p.obr||10)-(t.obr||0))/2+t.czy+((p.age||25)-25)*0.18+j(3),1,20));
  if(p.kom==null)p.kom=Math.round(clamp(((p.kcj||10)+(p.opa||10))/2+((p.age||25)-25)*0.12+(p.pos==='R'||p.pos==='L'?1:0)+j(5),1,20));
  if(p.kiw==null)p.kiw=Math.round(clamp(((p.tpa||10)-(t.tpa||0)+(p.ata||10)-(t.ata||0))/2+t.kiw+j(7),1,20));return p;}
function eff(p,k){const v=p[k];if(v==null){ensAttrs(p);return (p[k]||10)*(0.82+0.18*p.en/100);}return v*(0.82+0.18*p.en/100);}
function nm(p){return p.last;}
const isFront=z=>z>=1&&z<=3;
function pickW(arr,wf){let tot=0;const ws=arr.map(x=>{const w=Math.max(0,wf(x));tot+=w;return w;});if(tot<=0)return arr[Math.floor(R()*arr.length)];let r=R()*tot;for(let i=0;i<arr.length;i++){r-=ws[i];if(r<=0)return arr[i];}return arr[arr.length-1];}

function rally(m,ex){
  const S=m.serving,D=1-S,sS=m.sides[S],sD=m.sides[D];
  const cS=onCourt(sS,true),cD=onCourt(sD,false);
  const log=[],act=[];const seq=[];m._seq=seq;
  const server=cS[0].p;act.push(server.id);seq.push({k:'srv',id:server.id,s:S});
  const st=sS.tactics.serve;
  const n=(eff(server,'zag')*0.8+eff(server,'sil')*0.2)/20+bn(sS)+mb(server,m,S);
  server.st.srv++;
  const aim=sS.tactics.tgt&&cD.some(x=>x.p.id===sS.tactics.tgt&&(x.role==='L'||x.role==='P'));
  const errP=[0.075,0.15,0.25][st]*(1.45-0.9*n)*kc(server,m)*(sS.tmp&&sS.tmp.n>0&&sS.tmp.k==='srv'?1.25:1)*(aim?1+Math.max(0,13-server.zag)*0.025:1);
  if(R()<errP){server.st.srvErr++;const r2=R();const how=r2<0.42?'net':r2<0.75?'long':'wide';seq.push({k:how==='net'?'net':'out',s:D,how,srv:1});return {winner:D,type:'serr',act,seq,text:`${nm(server)} psuje zagrywkę (${how==='net'?'siatka':how==='long'?'aut za linią końcową':'aut obok boiska'}).${nerves(server,m)}`};}
  const tS0=sS.tmp&&sS.tmp.n>0?sS.tmp.k:null,tD0=sD.tmp&&sD.tmp.n>0?sD.tmp.k:null;
  const pow=n+[-0.14,0,0.13][st]+(tS0==='srv'?0.05:0);
  let recs=cD.filter(x=>x.role==='L'||x.role==='P');if(!recs.length)recs=cD.filter(x=>x.role!=='R');
  const tgt=sS.tactics.tgt;
  const rec=pickW(recs,x=>(x.role==='L'?1.4:1)*(tS0==='target'&&x.p.id===sS.tmp.id?4:1)*(tgt&&x.p.id===tgt?4.5:1)).p;act.push(rec.id);
  const rn=(eff(rec,'prz')*0.7+eff(rec,'tod')*0.2+eff(rec,'zwi')*0.1)/20+bn(sD)+mb(rec,m,D)+(tD0==='rec'?0.05:0);
  const v=0.52+(rn-pow-0.18)*0.6+nz()*0.6;
  rec.st.rec++;
  if(v<0.17){server.st.ace++;rec.st.recErr++;const sh=v>=0.09;seq.push({k:'ace',id:rec.id,s:D,sh});return {winner:S,type:'ace',act,seq,text:sh?`${nm(server)} — AS SERWISOWY! ${nm(rec)} odbija piłkę poza boisko.`:`${nm(server)} — AS SERWISOWY! ${nm(rec)} nie zdążył do piłki.`};}
  const q=v<0.42?1:v<0.74?2:3;
  seq.push({k:'rec',id:rec.id,s:D});
  if(q>=2)rec.st.recPos++;if(q===3)rec.st.recPerf++;
  log.push(`zagrywa ${nm(server)}`,`przyjmuje ${nm(rec)} (${['','słabo','dobrze','idealnie'][q]})`);
  let A=D,qq=q,by=rec;
  for(let k=0;k<40;k++){
    ex.n=k;
    const r=attackPhase(m,A,qq,by,log,act);
    if(r.done)return {winner:r.winner,type:r.type,act,seq,text:log.join(' → ')};
    A=r.next;qq=r.q;by=r.by;
  }
  seq.push({k:'floor',s:D});return {winner:S,type:'kill',act,seq,text:log.join(' → ')};
}
var KB=0.56;
function attackPhase(m,A,q,by,log,act,pd){
  const side=m.sides[A],opp=m.sides[1-A];
  const cA=onCourt(side,m.serving===A),cO=onCourt(opp,m.serving!==A);
  const sE=cA.find(x=>x.role==='R');const seq=m._seq||[];
  if(pd==null)pd=pdFrom(q);
  const ch=side.chem??0.6;const kom=cA.reduce((s,x)=>s+eff(x.p,'kom'),0)/cA.length;
  // miejsce, gdzie spada piłka po przyjęciu/obronie (lokalnie: x=0 linia końcowa, 9 siatka)
  const dx=pd*(0.45+R()*0.55),px=clamp(8.2-dx,1,8.7),py=clamp(5.8+(R()<0.5?-1:1)*Math.sqrt(Math.max(0,pd*pd-dx*dx)),0.4,8.6);
  let setter=null,run=0,alt=0,mix=0;
  if(sE&&sE.p!==by){const reach=1.9+eff(sE.p,'szy')/20*2+eff(sE.p,'zwi')/20*0.6+eff(sE.p,'czy')/20*0.5;
    if(pd<=reach){setter=sE.p;run=pd>1.2?1:0;}else if(pd<=reach+1.2&&R()<0.5){setter=sE.p;run=2;}else alt=1;}
  else alt=1;
  if(alt||run===2){// piłka sporna: kto bierze? komunikacja i zgranie
    const pc=clamp(0.09-(kom-10)/10*0.05-(ch-0.5)*0.08,0.004,0.16);
    if(R()<pc){const cand=cA.filter(x=>x.p!==by);const a1=pickW(cand,x=>x.role==='L'||x.role==='R'?2:1);const a2=pickW(cand.filter(x=>x!==a1),()=>1)||a1;
      act.push(a1.p.id);seq.push({k:'mix',ids:[a1.p.id,a2.p.id],s:A,px,py});(m.mixN=m.mixN||[0,0])[A]++;
      if(R()<0.55){seq.push({k:'floor',s:A,mix:1});log.push(`nieporozumienie: ${nm(a1.p)} i ${nm(a2.p)} — piłka spada!`);return {done:true,winner:1-A,type:'mix'};}
      setter=a1.p;mix=1;alt=1;log.push(`nieporozumienie, ratuje ${nm(a1.p)}`);}
  }
  if(!setter){const others=cA.filter(x=>x.p!==by&&x.role!=='R');const kf=clamp((kom-6)/8,0.3,1.5);
    setter=(pickW(others,x=>Math.pow(x.role==='L'?2.5:x.role==='A'?1:0.6,kf))||cA[0]).p;}
  const real=!!(sE&&setter===sE.p);
  const rz=(real?eff(setter,'roz')*0.75+eff(setter,'tpa')*0.25:eff(setter,'roz')*0.4+eff(setter,'tpa')*0.6)/20;
  let sq=[0,0.38,0.68,0.86][q]+(rz-0.55)*0.45*(real?1:0.6)+nz()*0.12-(real?0:0.12)-(run===1?0.02:run===2?0.08:0)-(alt?Math.max(0,pd-3)*0.015:0)+(ch-0.5)*0.08-(mix?0.25:0)+(alt?0.06:0);
  sq=clamp(sq,0.05,1);
  seq.push({k:'set',id:setter.id,s:A,px:+px.toFixed(2),py:+py.toFixed(2),run,alt,mix});
  if(run===2)log.push(`${nm(setter)} goni piłkę`);else if(alt&&!mix&&sE&&sE.p!==by)log.push(`rozgrywający nie zdążył`);
  if(R()<(0.006+(1-rz)*0.01)*kc(setter,m)){log.push(`błąd rozegrania (${nm(setter)})`);seq.push({k:'out',s:1-A});return {done:true,winner:1-A,type:'setErr'};}
  const tac=side.tactics.dist;
  const cands=cA.filter(x=>x.p!==setter&&x.role!=='L');
  const att=pickW(cands,x=>{
    const fr=isFront(x.zone);let w=0;
    if(x.role==='A')w=fr?1.35:0.9;
    else if(x.role==='P')w=fr?1.0:0.3;
    else if(x.role==='S')w=fr?(q>=3?0.95:q===2?0.6:0.12):0;
    else if(x.role==='R')w=fr?0.05:0;
    if(!fr&&sq<0.45)w*=0.3;
    if(tac===1&&(x.role==='A'||x.role==='P'))w*=1.3;
    if(tac===2&&x.role==='S')w*=1.7;
    if(tac===3&&x.role==='A')w*=1.6;
    if(m._noQuick&&x.p.id===m._noQuick)w*=0.15;
    if(opp.tactics.blk3===2&&x.role==='S'&&isFront(x.zone))w*=1+clamp((rz-0.45)*2,0,0.9);
    return w*(0.5+eff(x.p,'ata')/20);
  });
  const a=att.p,fr=isFront(att.zone),quick=att.role==='S'&&fr;m._noQuick=null;
  act.push(a.id);
  const wing=quick||(att.role==='P'&&!fr)||att.role==='S'?'M':att.role==='P'?'L4':'R2';
  const bset=wing==='M'?(opp.tactics.blkM??1):(opp.tactics[wing==='L4'?'blkR':'blkL']??1);
  const triple=wing!=='M'&&!quick&&((opp.tactics.blk3===2)||(opp.tactics.blk3===1&&sq<0.55));
  const ds=m.dirStats||(m.dirStats=[]);const rec=(d,r)=>ds.push({i:A,id:a.id,w:wing,d,r,set:m.setNo});
  const setTxt=real?`${nm(setter)} → atak ${nm(a)}`:`podbija ${nm(setter)} → atak ${nm(a)}`;
  // piłka sytuacyjna: przebicie zamiast ataku
  if(!quick&&sq<0.3&&R()<(0.75-eff(a,'kiw')/20*0.3)*(hasT(a,'ind')?0.55:1))return freeBall(m,A,a,log,act,seq,setTxt);
  const kiwN=eff(a,'kiw')/20,czA=eff(a,'czy')/20;
  // taktyka ataku: AT 0 = mieszany, 1 = mocny atak, 2 = więcej kiwek; AD 0 = wg zawodnika, 1 = skos, 2 = prosta, 3 = za blok, 4 = obijanie bloku
  const AT=side.tactics.atk||0,AD=side.tactics.adir||0;
  let tipP=quick?0.02:sq<0.42?0.1+kiwN*0.3:0.025+kiwN*0.05;
  if(!quick){if(AT===1)tipP*=0.3;else if(AT===2)tipP=Math.min(0.55,tipP*2.4+0.04);if(AD===3)tipP=Math.min(0.6,tipP+0.07);}
  const comply=0.5+czA*0.35;// na ile zawodnik wykona polecenie trenera co do kierunku
  let dir;
  if(R()<tipP)dir='tip';else if(wing==='M'){const t=midTend(a);let pS=t[0],pL=t[1];const sh=clamp((eff(a,'czy')-8)/12,0,1)*0.1;
    if(bset===0){pS-=sh;pL+=sh/2;}else if(bset===2){pL-=sh;pS+=sh/2;}else if(bset===3){pS+=sh/2;}
    if(AD===1){const k=comply*0.6;pL+=pS*k/2;pS-=pS*k;}else if(AD===2){const k=comply*0.6;pS+=(1-pS)*k;pL*=1-k;}
    const r=R();dir=r<pS?'midS':r<pS+pL?'midL':'midR';}
  else{let c=dirTend(a);const sh=clamp((eff(a,'czy')-8)/12,0,1)*0.12;if(bset===0)c-=sh;if(bset===2)c+=sh;
    if(AD===1)c=c*(1-comply)+0.92*comply;else if(AD===2)c=c*(1-comply)+0.08*comply;dir=R()<c?'cross':'line';}
  const tool=AD===4&&dir!=='tip';
  let z6c=null;if(wing!=='M'&&(dir==='line'||dir==='cross')){if(bset===0)z6c='line';else if(bset===2)z6c=opp.tactics.dsys===1?'rot':'cross';else{const z6=cO.find(x=>!isFront(x.zone)&&dZone(x)===6);const cz=z6?eff(z6.p,'czy'):10;const pc=clamp(0.5+(cz-10)/30,0.3,0.8);z6c=R()<pc?dir:(dir==='line'?'cross':'line');}}
  const blockers=blockGroup(cO,wing,quick,triple);
  seq.push({k:'att',id:a.id,s:A,q:quick,d:dir,w:wing,tr:triple?1:0,z6:z6c,bl:blockers.map(x=>x.p.id)});
  a.st.att++;
  const backO=cO.filter(x=>!isFront(x.zone));
  const lineZ=wing==='L4'?1:5,crossZ=wing==='L4'?5:1;
  // zawodnik pierwszej linii poza blokiem schodzi do asekuracji za blok / środek boiska (blok na prawej → strefa 4, na lewej → strefa 2)
  const offB=wing==='M'||triple?null:cO.find(x=>isFront(x.zone)&&x.role!=='L'&&dZone(x)===(wing==='L4'?4:2));
  const covO=offB?backO.concat([offB]):backO;
  const tipOn=!!opp.tactics[wing==='M'?'tipM':wing==='L4'?'tipR':'tipL'];
  if(dir==='tip'){
    const cover=bset===2||tipOn;const tz=wing==='M'?6:lineZ;
    if(R()<0.03*kc(a,m)){a.st.attErr++;seq.push({k:'net',s:1-A});log.push(setTxt,`kiwka w siatkę${nerves(a,m)}`);rec('tip','err');return {done:true,winner:1-A,type:'attErr'};}
    const d=pickW(covO,x=>(x===offB?(tipOn?6:2.6):dZone(x)===tz?(cover&&!(tipOn&&offB)?4:2):dZone(x)===6?1.3:1)*(0.5+eff(x.p,'czy')/20)).p;
    const dc=(eff(d,'czy')*0.5+eff(d,'szy')*0.25+eff(d,'obr')*0.25)/20;
    const killT=clamp(0.34+(triple?0.1:0)+(kiwN-0.5)*0.42+(czA-0.5)*0.12+bn(side)-(tipOn?0.2:cover?0.15:0)-(dc-0.5)*0.3+mb(a,m,A)+(AD===3?0.04:0)-(AT===2?0.03:0),0.06,0.62);
    if(R()<killT){a.st.kill++;seq.push({k:'floor',s:1-A,tip:1});log.push(setTxt,`KIWKA — PUNKT!`);rec('tip','kill');return {done:true,winner:A,type:'kill'};}
    d.st.dig++;act.push(d.id);seq.push({k:'dig',id:d.id,s:1-A,tip:1});log.push(setTxt,`kiwka, podbija ${nm(d)}${cover?' (asekuracja za blokiem)':''}`);rec('tip','dig');
    return {done:false,next:1-A,q:R()<0.45+dc*0.35?2:1,by:d};
  }
  const an=0.1+eff(a,'ata')/20*0.4+eff(a,'sil')/20*0.08+eff(a,'sko')/20*0.22+(a.h-197)/100+sq*0.42+bn(side)-(fr?0:0.06)+(quick&&sq>0.7?(0.05+(a.szy-12)/20*0.08)*(0.4+ch):0)+mb(a,m,A)+(AT===1?0.035:AT===2?-0.015:0);
  const nb=quick?1.4:triple?3.0:sq<0.4?2.8:2.2;
  const bs=blockers.reduce((s,x)=>s+(eff(x.p,'blo')*0.55+eff(x.p,'czy')*0.2+eff(x.p,'sko')*0.15+eff(x.p,'szy')*0.1)/20+(x.p.h-197)/120,0)/blockers.length*(0.75+nb*0.12)+bn(opp);
  const errP=(0.075+(1-sq)*0.08+(0.75-eff(a,'ata')/20)*0.08)*kc(a,m)*(AT===1?1.15:AT===2?0.92:1)*(tool?1.1:1);
  if(R()<errP){a.st.attErr++;const net=R()<0.5;seq.push({k:net?'net':'out',s:1-A});log.push(setTxt,`atak ${net?'w siatkę':'w aut'}${nerves(a,m)}`);rec(dir,'err');return {done:true,winner:1-A,type:'attErr'};}
  // zawodnik drugiej linii odbija się z linii 3 m albo przed nią (w strefie ataku) — błąd
  if(!fr&&!quick){const p3=(0.012+(sq<0.5?0.022:0)+(sq<0.3?0.02:0))*kc(a,m)*(1.25-czA*0.5);
    if(R()<p3){a.st.attErr++;a.st.e3=(a.st.e3||0)+1;seq.push({k:'whistle',s:1-A,why:'3m',id:a.id,src:A});log.push(setTxt,`${nm(a)} wybił się przed linią 3 m — błąd ataku z drugiej linii!`);rec(dir,'err');return {done:true,winner:1-A,type:'f3m'};}}
  // dotknięcie siatki przez blokującego
  if(blockers.length){const bN=pickW(blockers,x=>21-eff(x.p,'kcj'));const pn=0.0065*(triple?1.45:1)*(quick?1.25:1)*(1.3-eff(bN.p,'kcj')/20*0.6)*kc(bN.p,m)*(tool?1.15:1);
    if(R()<pn){bN.p.st.ne=(bN.p.st.ne||0)+1;act.push(bN.p.id);seq.push({k:'blk',id:bN.p.id,s:1-A},{k:'whistle',s:1-A,why:'net',id:bN.p.id,src:1-A});log.push(setTxt,`${nm(bN.p)} dotyka siatki w bloku — punkt dla atakujących!`);rec(dir,'net');return {done:true,winner:A,type:'netTouch'};}}
  // obijanie bloku: piłka po rękach blokującego wychodzi w aut
  const toolSk=(eff(a,'czy')*0.5+eff(a,'ata')*0.3+eff(a,'sil')*0.2)/20;const bf=clamp(0.6+(bs-0.75)*1.5,0.4,1.6);
  if(tool&&blockers.length&&R()<clamp((0.05+toolSk*0.1)*bf*(triple?1.25:1),0.02,0.22))return blockOut(m,A,a,blockers,log,seq,setTxt,rec,dir);
  let mult=1;const MD={midS:0,midL:2,midR:3};
  if(wing!=='M'){if(bset===1){const cz=blockers.reduce((s,x)=>s+eff(x.p,'czy'),0)/blockers.length;mult=1+(cz-10)/10*0.12;}else mult=((bset===0)===(dir==='cross'))?1.55:0.5;}
  else if(dir in MD){if(bset===1){const cz=blockers.reduce((s,x)=>s+eff(x.p,'czy'),0)/blockers.length;mult=1+(cz-10)/10*0.1;}else mult=MD[dir]===bset?1.8:0.55;if(opp.tactics.blk3===2)mult*=0.6;}
  if(triple)mult*=1.28;
  if(AT===1)mult*=1.05;if(tool)mult*=0.8;
  const blockP=clamp((0.17+(bs-an+0.17)*0.3)*mult,0.02,0.45);
  if(R()<blockP){
    const b=pickW(blockers,x=>eff(x.p,'blo')+eff(x.p,'czy')*0.3+(x.role==='S'?4:0)).p;act.push(b.id);seq.push({k:'blk',id:b.id,s:1-A});
    if(R()<0.55){a.st.blocked++;b.st.blk++;seq.push({k:'floor',s:A,blk:1});log.push(setTxt,`BLOK ${nm(b)}!`);rec(dir,'blk');return {done:true,winner:1-A,type:'block'};}
    log.push(setTxt,`wybloka ${nm(b)}`);rec(dir,'wyb');return {done:false,next:1-A,q:2,by:b};
  }
  const tz=dir==='line'?lineZ:dir==='cross'?crossZ:dir==='midL'?5:dir==='midR'?1:6;
  const d=pickW(covO,x=>{if(x===offB)return tipOn?0.05:dir==='cross'?0.5:0.2;const z=dZone(x);return (z===tz?3:z===6?(z6c&&z6c!=='rot'?(z6c===dir?2.2:0.7):1.4):0.5)*(x.role==='L'?1.2:1)*(0.5+eff(x.p,'obr')/20);}).p;
  const dn=(eff(d,'obr')*0.45+eff(d,'czy')*0.2+eff(d,'zwi')*0.15+eff(d,'szy')*0.2)/20+mb(d,m,1-A)+(d.zaa-11)/20*0.06;
  let adj=0;if(wing!=='M'&&bset!==1){if(bset===0)adj=dir==='line'?-0.07:0.03;else adj=dir==='line'?0.04:-0.04;}
  else if(wing==='M'&&bset!==1&&dir in MD)adj=MD[dir]===bset?0.012:-0.012;
  if(wing==='M'&&opp.tactics.blk3===2)adj+=0.04;
  if(triple)adj+=0.025;
  if(tipOn)adj+=0.012;
  if(z6c&&z6c!=='rot')adj+=z6c===dir?-0.015:0.01;
  if(tool)adj-=0.06;
  const killP=clamp(KB+(an-0.95)*0.6-(dn-0.7)*0.3-(bs-0.8)*0.2+adj,0.15,0.86);
  // część skończonych ataków to piłki po bloku (ręce blokującego → aut)
  const kr=R();if(kr<killP&&blockers.length&&!quick&&R()<clamp(0.05+toolSk*0.05,0.04,0.13)*bf)return blockOut(m,A,a,blockers,log,seq,setTxt,rec,dir);
  if(kr<killP){a.st.kill++;seq.push({k:'floor',s:1-A,d:dir});log.push(setTxt,`${quick?'krótka — ':dir==='line'?'po prostej — ':dir==='cross'?'po skosie — ':''}${triple?'(przez potrójny blok) ':''}PUNKT!`);rec(dir,'kill');return {done:true,winner:A,type:'kill'};}
  d.st.dig++;act.push(d.id);seq.push({k:'dig',id:d.id,s:1-A});
  const dq=R()<0.25+dn*0.3+eff(d,'tod')/20*0.15?2:1;
  log.push(setTxt,`broni ${nm(d)}`);rec(dir,'dig');
  return {done:false,next:1-A,q:dq,by:d};
}
// kto blokuje: atak ze skrzydła → skrzydłowy z tej strony + środkowy (przy potrójnym także drugi skrzydłowy); szybka piłka → środkowy; pipe → środkowy + jeden skrzydłowy
function blockGroup(cO,wing,quick,triple){const fr=cO.filter(x=>isFront(x.zone)&&x.role!=='L');if(fr.length<2)return fr;const by=z=>fr.find(x=>dZone(x)===z);
  const mid=by(3)||fr.slice().sort((a,b)=>a.zone-b.zone)[1];let g;
  if(wing==='M')g=quick?[mid]:[mid,R()<0.5?by(4):by(2)];
  else{g=[wing==='L4'?by(2):by(4),mid];if(triple)g.push(wing==='L4'?by(4):by(2));}
  g=[...new Set(g.filter(Boolean))];return g.length?g:fr;}
// atak po bloku: piłka dotyka rąk blokującego i ląduje poza boiskiem — punkt dla atakujących
function blockOut(m,A,a,blockers,log,seq,setTxt,rec,dir){
  const b=pickW(blockers,x=>1+Math.max(0,14-eff(x.p,'blo'))*0.15+(x.role==='S'?0.5:0)).p;
  a.st.kill++;a.st.bout=(a.st.bout||0)+1;const r=R();const how=r<0.55?'wide':r<0.85?'long':'back';
  seq.push({k:'blk',id:b.id,s:1-A,tool:1},{k:'out',s:how==='back'?A:1-A,how:how==='back'?'long':how,tool:1});
  log.push(setTxt,`obija blok (${nm(b)}) — piłka w aut, PUNKT!`);rec(dir,'kill');return {done:true,winner:A,type:'blockout'};}
// strefa obrony w systemie 5-1 (indeks strefy 0..5 = strefy 1..6)
function dZone(e){if(isFront(e.zone))return (e.role==='R'||e.role==='A')?2:e.role==='P'?4:3;return (e.role==='L'||e.role==='S')?5:(e.role==='R'||e.role==='A')?1:6;}
// ukryta skłonność atakującego do skosu (0,28–0,80)
function dirTend(p){if(p.dirC==null){let h=7;for(const c of String(p.id))h=(h*131+c.charCodeAt(0))>>>0;p.dirC=0.28+(h%53)/100;}return p.dirC;}
function midTend(p){let h=11;for(const c of String(p.id))h=(h*137+c.charCodeAt(0))>>>0;const s=0.3+(h%31)/100;const l=(1-s)*(0.3+((h>>>5)%41)/100);return [s,l];}
const FREE_TXT=['na środek boiska','na rozgrywającego','na środkowego'];
function freeBall(m,A,a,log,act,seq,setTxt){const side=m.sides[A],opp=m.sides[1-A];const cO=onCourt(opp,m.serving!==A);
  const f=side.tactics.free||0;let tgt=null;
  if(f===1)tgt=cO.find(x=>x.role==='R');else if(f===2)tgt=cO.find(x=>x.role==='S'&&isFront(x.zone))||cO.find(x=>x.role==='S');
  if(!tgt){const back=cO.filter(x=>!isFront(x.zone));tgt=back.find(x=>dZone(x)===6)||back[0]||cO[0];}
  seq.push({k:'free',id:a.id,s:A,t:tgt.p.id,f});(m.dirStats=m.dirStats||[]).push({i:A,id:a.id,w:'M',d:'free',r:'free',set:m.setNo});
  if(f===0&&R()<0.05+(10-eff(tgt.p,'czy'))*0.004){seq.push({k:'floor',s:1-A});log.push(setTxt,`przebicie na środek — nieporozumienie, piłka spada!`);return {done:true,winner:A,type:'kill'};}
  const q=R()<(f===0?0.5:0.7)?3:2;if(f===2)m._noQuick=tgt.p.id;
  act.push(tgt.p.id);seq.push({k:'dig',id:tgt.p.id,s:1-A,free:1});
  log.push(setTxt.replace(/ → atak .*$/,''),`przebicie ${FREE_TXT[f]} (${nm(a)}), przyjmuje ${nm(tgt.p)}`);
  return {done:false,next:1-A,q,by:tgt.p};}
function fatigue(m,n){
  for(let i=0;i<2;i++){const s=m.sides[i];const on=new Set(onCourt(s,m.serving===i).map(x=>x.p.id));
    for(const p of s.pl){if(on.has(p.id))p.en=Math.max(30,p.en-(0.22+0.12*n)*(1.35-p.kon/20)*(1.2-p.zaa/20*0.4)*(s.fatMul||1));else p.en=Math.min(100,p.en+0.25);}}
}
function startSet(m){
  m.setNo++;m.score=[0,0];m.run={t:-1,n:0};
  for(const s of m.sides){s.rot=baseRot(s.tactics);s.to=2;s.subs=6;s.mom=0;s.form=s.form*0.5+nz()*0.06+(s.home?0.0075:0);for(const p of s.pl)p.en=Math.min(100,p.en+12);}
  m.serving=m.setNo===5?(R()<0.5?0:1):(m.firstServe+m.setNo-1)%2;
}
function stepRally(m){
  const ex={n:0};
  const r=rally(m,ex);
  m.rallies++;
  const recv=1-m.serving;m.sideout[1]++;if(r.winner===recv)m.sideout[0]++;
  {const rs=m.rs||(m.rs=[{},{}]);for(const i of [0,1]){const z=m.sides[i].rot.indexOf(0)+1;const o=rs[i][z]||(rs[i][z]=[0,0,0,0]);if(i===m.serving){o[2]++;if(r.winner===i)o[3]++;}else{o[0]++;if(r.winner===i)o[1]++;}}
   const pt=m.pt||(m.pt=[{},{}]);pt[r.winner][r.type]=(pt[r.winner][r.type]||0)+1;}
  fatigue(m,ex.n);
  const w=r.winner;m.score[w]++;(m.hist=m.hist||[]).push([m.setNo,m.score[0],m.score[1]]);
  if(m.run.t===w)m.run.n++;else m.run={t:w,n:1};
  const ws=m.sides[w],ls=m.sides[1-w];ws.mom=Math.min(3,Math.max(0,ws.mom)+1);ls.mom=0;
  if(w!==m.serving){m.serving=w;ws.rot.push(ws.rot.shift());}
  moraleAfter(m,r,w);
  for(const sd of m.sides)if(sd.tmp&&sd.tmp.n>0)sd.tmp.n--;
  const ev=Object.assign({},r,{score:m.score.slice(),setNo:m.setNo});
  const tgt=m.setNo===5?15:25;
  if(m.score[w]>=tgt&&m.score[w]-m.score[1-w]>=2){
    m.sets.push(m.score.slice());m.setsWon[w]++;ev.setEnd=true;ev.setWinner=w;
    if(m.setsWon[w]===3){m.over=true;m.winner=w;ev.matchEnd=true;}else startSet(m);
  }
  return ev;
}
function findPl(m,id){for(const sd of m.sides){const p=sd.pl.find(x=>x.id===id);if(p)return p;}return null;}
function addMor(p,d){if(p&&d<0&&p.tr&&(hasT(p,'zde')||hasT(p,'spo')))d*=0.6;if(p)p.mor=Math.round(clamp((p.mor==null?60:p.mor)+d,5,100));}
function moraleAfter(m,r,w){const seq=r.seq||[];const last=k=>{for(let i=seq.length-1;i>=0;i--)if(seq[i].k===k){const it=seq[i];return m.sides[it.s].pl.find(x=>x.id===it.id)||null;}return null;};
  if(r.type==='kill'||r.type==='blockout')addMor(last('att'),5);
  if(r.type==='blockout')addMor(last('blk'),-2);
  if(r.type==='netTouch')addMor(last('blk'),-4);
  if(r.type==='f3m')addMor(last('att'),-4);
  if(r.type==='ace'){addMor(last('srv'),6);addMor(last('rec'),-5);}
  if(r.type==='block'){addMor(last('blk'),6);addMor(last('att'),-3);}
  if(r.type==='serr')addMor(last('srv'),-4);
  if(r.type==='attErr')addMor(last('att'),-5);
  if(r.type==='setErr')addMor(last('set'),-4);
  if(r.type==='mix'){const mx=(r.seq||[]).find(x=>x.k==='mix');if(mx)for(const id of mx.ids){const p=findPl(m,id);if(p)addMor(p,-3);}}
  for(let i=0;i<2;i++){const oc=onCourt(m.sides[i],m.serving===i);for(const e of oc){const p=e.p;if(i===w)addMor(p,1);else{addMor(p,-1);if(m.run.t===w&&m.run.n>=3&&p.opa<11)addMor(p,-1);}}}}
function callTimeout(m,i){const s=m.sides[i];if(s.to<=0)return false;s.to--;for(const e of onCourt(s,m.serving===i))addMor(e.p,2);m.sides[1-i].mom=0;s.mom=Math.max(0,s.mom);m.run.n=0;return true;}
// ---- okrzyki trenera w trakcie meczu ----
const SHOUTS=[['go','Dawać, gramy!','🔥','Nakręca zespół: impet i lepsza gra przez kilka akcji. Najlepiej działa przy wyrównanym wyniku.'],
 ['calm','Spokojnie!','🧘','Uspokaja: pomaga w końcówkach i nerwowym zawodnikom.'],
 ['focus','Koncentracja!','🎯','Mniej prostych błędów przez kilka akcji.'],
 ['fight','Walczymy do końca!','💪','Gdy przegrywacie: więcej walki, mocniej działa na walecznych.'],
 ['bravo','Brawo, tak dalej!','👏','Pochwała po dobrej akcji: podnosi morale.'],
 ['wake','Obudźcie się!','📢','Ostro: waleczni się nakręcą, nerwowi mogą się spiąć.']];
// efekt okrzyku na całą drużynę: p = lepsza gra we wszystkich elementach, pr = w końcówkach, b = gdy przegrywa, e = mniej prostych błędów (ułamek)
const SH_FX={go:{p:0.014},calm:{pr:0.025,e:0.07},focus:{e:0.15},fight:{b:0.026,p:0.006},bravo:{p:0.009},wake:{p:0.012},
  tfight:{b:0.03,p:0.01},tfocus:{pr:0.02,e:0.16},tgo:{p:0.016},twake:{p:0.02}};
const SH_TXT={p:'lepsza gra całej drużyny',pr:'pewniej w końcówce seta',b:'więcej walki przy stracie punktów',e:'mniej prostych błędów'};
function fxText(fx){return Object.keys(SH_TXT).filter(k=>fx[k]).map(k=>SH_TXT[k]).join(', ');}
// i = drużyna, k = okrzyk, pw = siła trenera (0,6–1,4), o = {dur, noCd, mult, ic, n}. Zwraca {up,dn,f,del} albo null, gdy za szybko po poprzednim.
function applyShout(m,i,k,pw,o){o=o||{};const s=m.sides[i];s.shN=s.shN||{};if(!o.noCd&&s.shCd!=null&&m.rallies<s.shCd)return null;
  const key=m.setNo+k;const used=s.shN[key]||0;const tot=Object.keys(s.shN).filter(x=>x.startsWith(String(m.setNo))).reduce((a,x)=>a+s.shN[x],0);
  const f=clamp(pw*(o.mult||1)*(1/(1+0.6*used))*(tot>=6?0.6:1),0.15,1.8);s.shN[key]=used+1;if(!o.noCd)s.shCd=m.rallies+3;
  const behind=m.score[1-i]-m.score[i];let up=0,dn=0;const del={};const base=k.replace(/^t/,'');
  for(const e of onCourt(s,m.serving===i)){const p=e.p;const mor=p.mor==null?60:p.mor;let d=0;
    if(base==='go'){d=1.5+(Math.abs(behind)<=2?1.5:0);}
    else if(base==='calm'){d=0.5+(60-mor)*0.06+(12-p.opa)*0.3;}
    else if(base==='focus'){d=0.5+(k==='tfocus'?(12-p.opa)*0.25:0);}
    else if(base==='fight'){d=(behind>=2?2:0)+((p.wal+p.zaa)/2-10)*0.35;}
    else if(base==='bravo'){d=m.run&&m.run.t===i?2.5:0.8;}
    else if(base==='wake'){d=((p.wal+p.zaa)/2-10.5)*0.6-(p.opa<9?2:0);}
    d=Math.round(d*f+(R()-0.5));addMor(p,d);del[p.id]=d;if(d>0)up++;else if(d<0)dn++;}
  const fx={};const F=SH_FX[k]||{};for(const x in F)fx[x]=F[x]*(x==='e'?Math.min(1.3,f):f);
  s.sh=Object.assign({k,u:m.rallies+(o.dur||4),n:o.n||k,ic:o.ic||''},fx);
  if(base==='go'&&Math.abs(behind)<=3)s.mom=Math.min(3,Math.max(0,s.mom)+1);
  return {up,dn,f,del};}
function benchOf(side){const on=new Set(side.slots.map(s=>s.p.id));if(side.libero)on.add(side.libero.id);return side.pl.filter(p=>!on.has(p.id));}
function substitute(m,i,slot,pid){const s=m.sides[i];const p=s.pl.find(x=>x.id===pid);if(!p)return false;
  if(slot==='L'){s.libero=p;return true;}
  if(s.subs<=0)return false;s.slots[slot].p=p;s.subs--;return true;}
function aiTurn(m,i){
  const s=m.sides[i],msgs=[];
  const isUser=typeof SAVE!=='undefined'&&SAVE&&SAVE.team!=null&&s.team.idx===SAVE.team;
  if(!isUser&&!s.tactics.lock&&m.dirStats&&m.rallies%5===0){const t=s.tactics;for(const [w,key] of [['L4','blkR'],['R2','blkL']]){const xs=m.dirStats.filter(d=>d.i===1-i&&d.w===w&&(d.d==='cross'||d.d==='line'));
    if(xs.length>=6){const c=xs.filter(d=>d.d==='cross').length/xs.length;t[key]=c>0.6?0:c<0.4?2:1;}}
    const ms=m.dirStats.filter(d=>d.i===1-i&&d.w==='M'&&/^mid/.test(d.d));if(ms.length>=6){const cnt={midS:0,midL:0,midR:0};for(const d of ms)cnt[d.d]++;const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];t.blkM=best[1]/ms.length>0.5?{midS:0,midL:2,midR:3}[best[0]]:1;}
    const own=m.dirStats.filter(d=>d.i===i&&d.d!=='free').slice(-30);if(own.length>=12){const bl=own.filter(d=>d.r==='blk').length/own.length,dg=own.filter(d=>d.r==='dig'||d.r==='wyb').length/own.length;t.adir=bl>0.13?4:0;t.atk=bl>0.13?0:dg>0.45?1:0;}}
  if(m.run.t===1-i&&m.run.n>=3&&s.to>0&&(m.score[1-i]>=8||m.run.n>=4)){callTimeout(m,i);msgs.push(`Czas dla ${s.team.name}.`);}
  else if(!isUser&&R()<0.035){const behind=m.score[1-i]-m.score[i];const k=pressure(m)?'calm':behind>=3?(R()<0.5?'fight':'wake'):m.run.t===i&&m.run.n>=2?'bravo':R()<0.5?'go':'focus';
    if(applyShout(m,i,k,0.9)){const t=SHOUTS.find(x=>x[0]===k);msgs.push(`🗣️ Trener ${s.team.short}: „${t[1]}”`);}}
  if(s.subs>0)for(let k=0;k<6;k++){const sl=s.slots[k];
    if(sl.p.en<58){const c=benchOf(s).filter(p=>p.pos===sl.role&&p.en>80).sort((a,b)=>rating(b)-rating(a))[0];
      if(c&&rating(c)>=rating(sl.p)-12&&s.subs>0){const old=sl.p;substitute(m,i,k,c.id);msgs.push(`Zmiana w ${s.team.name}: ${nm(c)} za ${nm(old)}.`);}}}
  return msgs;
}
function simMatch(a,b){const m=newMatch(a,b);while(!m.over){aiTurn(m,0);aiTurn(m,1);stepRally(m);}return m;}
function mvpScore(p){const s=p.st;return s.kill+s.blk*1.2+s.ace*1.2+s.recPerf*0.15+s.dig*0.2-s.attErr*0.7-s.srvErr*0.4-s.recErr*0.6-s.blocked*0.5-(s.ne||0)*0.7;}
function runTest(ta,tb,n,tA,tB){
  const agg={w:[0,0],res:{},sets:0,ptsW:0,ptsL:0,srv:0,srvErr:0,ace:0,att:0,kill:0,attErr:0,blocked:0,so:[0,0],rallies:0};
  const A={team:ta,lineup:autoLineup(ta),tactics:Object.assign({serve:1,dist:0},tA||{})},B={team:tb,lineup:autoLineup(tb),tactics:Object.assign({serve:1,dist:0},tB||{})};
  for(let i=0;i<n;i++){const m=simMatch(A,B);agg.w[m.winner]++;const key=m.setsWon[0]+':'+m.setsWon[1];agg.res[key]=(agg.res[key]||0)+1;
    for(let si=0;si<m.sets.length;si++){const s=m.sets[si];if(si===4)continue;agg.sets++;agg.ptsW+=Math.max(...s);agg.ptsL+=Math.min(...s);}
    agg.so[0]+=m.sideout[0];agg.so[1]+=m.sideout[1];agg.rallies+=m.rallies;
    for(const sd of m.sides)for(const p of sd.pl){const s=p.st;agg.srv+=s.srv;agg.srvErr+=s.srvErr;agg.ace+=s.ace;agg.att+=s.att;agg.kill+=s.kill;agg.attErr+=s.attErr;agg.blocked+=s.blocked;agg.bout=(agg.bout||0)+(s.bout||0);agg.e3=(agg.e3||0)+(s.e3||0);agg.ne=(agg.ne||0)+(s.ne||0);}}
  return agg;
}
if(typeof module!=='undefined')module.exports={MENTAL,PHYS,TEAM_DEFS,genTeam,runTest,autoLineup,rating,teamStrength};
