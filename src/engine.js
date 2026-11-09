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
const ATTRS=[['zag','Zagrywka','Zag','Siła i precyzja zagrywki.'],['prz','Przyjęcie','Prz','Przyjęcie zagrywki.'],['ata','Atak','Ata','Skuteczność ataku.'],['blo','Blok','Blo','Czytanie gry i ustawienie w bloku.'],['obr','Obrona','Obr','Obrona w polu.'],['roz','Rozegranie','Roz','Wystawianie piłek atakującym.'],['tod','Technika odbicia dołem','OdD','Jakość przyjęcia i obrony (dokładność).'],['tpa','Technika odbicia palcami','OdP','Jakość wystawy, zwłaszcza gdy rozgrywa nie-rozgrywający.']];
const PHYS=[['sil','Siła','Sił','Moc ataku i zagrywki.'],['szy','Szybkość','Szy','Dobieg do piłki w obronie, szybkie ataki środkiem, przesunięcie w bloku.'],['sko','Skoczność','Sko','Wysokość ataku i bloku.'],['zwi','Zwinność','Zwi','Obrona trudnych piłek, reakcja.'],['kon','Kondycja','Kon','Wolniejsze męczenie się.']];
const MENTAL=[['kcj','Koncentracja','Kcj','Mniej prostych błędów (zagrywka, atak, rozegranie).'],['opa','Opanowanie','Opa','Gra w końcówkach setów i w tie-breaku, odporność na presję.'],['zaa','Zaangażowanie','Zaa','Wolniej się męczy, więcej walki w obronie.'],['wal','Waleczność','Wal','Gra lepiej, gdy drużyna przegrywa.']];
const ALL_ATTRS=ATTRS.concat(PHYS,MENTAL);
const TEMPL={
  R:{zag:0,prz:-3,ata:-4,blo:-2,obr:0,roz:4,sko:-1,kon:0,tod:0,tpa:4,sil:-2,szy:1,zwi:1},
  A:{zag:2,prz:-7,ata:4,blo:1,obr:-2,roz:-7,sko:2,kon:0,tod:-4,tpa:-5,sil:3,szy:0,zwi:-1},
  P:{zag:1,prz:3,ata:2,blo:-1,obr:2,roz:-5,sko:1,kon:0,tod:2,tpa:-3,sil:1,szy:1,zwi:1},
  S:{zag:-1,prz:-8,ata:2,blo:4,obr:-4,roz:-6,sko:2,kon:0,tod:-6,tpa:-5,sil:2,szy:1,zwi:-2},
  L:{zag:-12,prz:5,ata:-11,blo:-13,obr:5,roz:-2,sko:-3,kon:0,tod:5,tpa:1,sil:-6,szy:3,zwi:4}
};
const HEIGHT={R:[186,198],A:[195,210],P:[189,202],S:[199,213],L:[172,188]};
const WEIGHTS={
  R:{roz:5,tpa:2,zag:1.5,obr:1.5,blo:1,sko:0.5,szy:0.5,kon:0.5},
  A:{ata:5,zag:2,sil:1.5,blo:1.5,sko:1.5,obr:0.5,kon:0.5},
  P:{prz:3.5,ata:3,tod:1.5,obr:1.5,zag:1.5,blo:0.5,sko:0.5,zwi:0.5,kon:0.5},
  S:{blo:4.5,ata:2.5,sko:1.5,szy:1,zag:1,sil:0.5,kon:0.5},
  L:{prz:4.5,obr:4.5,tod:2,zwi:1.5,szy:1,roz:0.5,kon:0.5}
};
for(const k in WEIGHTS)Object.assign(WEIGHTS[k],{kcj:0.6,opa:0.5,zaa:0.4,wal:0.4});
const POS_OFF={};
function posOff(pos){if(POS_OFF[pos]==null){const w=WEIGHTS[pos];let s=0,t=0;for(const k in w){s+=(TEMPL[pos][k]||0)*w[k];t+=w[k];}POS_OFF[pos]=s/t;}return POS_OFF[pos];}
function rating(p,pos){pos=pos||p.pos;const w=WEIGHTS[pos];let s=0,t=0;for(const k in w){s+=p[k]*w[k];t+=w[k];}let r=s/t-posOff(pos)+2.5;if(pos!=='L')r+=(p.h-HEIGHT[pos][0]-6)*0.05;return Math.round(clamp(r*5,1,100));}

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
function cloneP(p){return Object.assign({},p,{en:100,st:{srv:0,srvErr:0,ace:0,rec:0,recPos:0,recPerf:0,recErr:0,att:0,kill:0,attErr:0,blocked:0,blk:0,dig:0}});}
function makeSide(team,lu,tac,home,x){
  const ids=new Set(Object.values(lu));const pl=team.players.filter(p=>!p.inj||ids.has(p.id)).map(cloneP);const g=id=>pl.find(p=>p.id===id);
  const slots=[['R',lu.R],['P',lu.P1],['S',lu.S1],['A',lu.A],['P',lu.P2],['S',lu.S2]].map(([role,id])=>({role,p:g(id)}));
  return {team,pl,slots,libero:g(lu.L),rot:[0,1,2,3,4,5],tactics:Object.assign({},tac),mom:0,home:!!home,fatMul:(x&&x.fat)||1,momMul:(x&&x.momMul)||1,prB:(x&&x.prB)||0,trB:(x&&x.trB)||0,form:nz()*0.09+(home?(x&&x.hb!=null?x.hb:0.015):0)+((x&&x.sb)||0),to:2,subs:6};
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
function mb(p,m,i){let b=0;const sd=m.sides[i];if(pressure(m))b+=(p.opa-11)/20*0.14+(sd.prB||0);if(m.score[1-i]-m.score[i]>=3)b+=(p.wal-11)/20*0.1+(sd.trB||0);return b;}
function kc(p,m){let k=1.25-p.kcj/20*0.5;if(pressure(m))k*=1.15-p.opa/20*0.3;return k;}
function nerves(p,m){return pressure(m)&&p.opa<10?' Nerwy w końcówce!':'';}
function bn(s){return s.mom*0.01*(s.momMul||1)+s.form;}
function eff(p,k){return p[k]*(0.82+0.18*p.en/100);}
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
  const errP=[0.075,0.15,0.25][st]*(1.45-0.9*n)*kc(server,m);
  if(R()<errP){server.st.srvErr++;const net=R()<0.5;seq.push({k:net?'net':'out',s:D});return {winner:D,type:'serr',act,seq,text:`${nm(server)} psuje zagrywkę (${net?'siatka':'aut'}).${nerves(server,m)}`};}
  const pow=n+[-0.14,0,0.13][st];
  let recs=cD.filter(x=>x.role==='L'||x.role==='P');if(!recs.length)recs=cD.filter(x=>x.role!=='R');
  const rec=pickW(recs,x=>x.role==='L'?1.4:1).p;act.push(rec.id);
  const rn=(eff(rec,'prz')*0.7+eff(rec,'tod')*0.2+eff(rec,'zwi')*0.1)/20+bn(sD)+mb(rec,m,D);
  const v=0.52+(rn-pow-0.18)*0.6+nz()*0.6;
  rec.st.rec++;
  if(v<0.17){server.st.ace++;rec.st.recErr++;seq.push({k:'ace',id:rec.id,s:D});return {winner:S,type:'ace',act,seq,text:`${nm(server)} — AS SERWISOWY! ${nm(rec)} bez szans.`};}
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
var KB=0.55;
function attackPhase(m,A,q,by,log,act){
  const side=m.sides[A],opp=m.sides[1-A];
  const cA=onCourt(side,m.serving===A),cO=onCourt(opp,m.serving!==A);
  const sE=cA.find(x=>x.role==='R');
  let setter;
  if(sE&&sE.p!==by)setter=sE.p;
  else{const alt=cA.filter(x=>x.p!==by&&x.role!=='R');setter=(pickW(alt,x=>x.role==='L'?2.5:x.role==='A'?1:0.6)||cA[0]).p;}
  const real=!!(sE&&setter===sE.p);
  const rz=(real?eff(setter,'roz')*0.75+eff(setter,'tpa')*0.25:eff(setter,'roz')*0.4+eff(setter,'tpa')*0.6)/20;
  let sq=[0,0.38,0.68,0.86][q]+(rz-0.55)*0.45*(real?1:0.6)+nz()*0.12-(real?0:0.12);
  sq=clamp(sq,0.05,1);
  const seq=m._seq||[];seq.push({k:'set',id:setter.id,s:A});
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
    return w*(0.5+eff(x.p,'ata')/20);
  });
  const a=att.p,fr=isFront(att.zone),quick=att.role==='S'&&fr;
  act.push(a.id);seq.push({k:'att',id:a.id,s:A,q:quick});
  const an=0.1+eff(a,'ata')/20*0.4+eff(a,'sil')/20*0.08+eff(a,'sko')/20*0.22+(a.h-197)/100+sq*0.42+bn(side)-(fr?0:0.06)+(quick&&sq>0.7?0.05+(a.szy-12)/20*0.08:0)+mb(a,m,A);
  a.st.att++;
  const setTxt=real?`${nm(setter)} → atak ${nm(a)}`:`podbija ${nm(setter)} → atak ${nm(a)}`;
  const blockers=cO.filter(x=>isFront(x.zone)&&x.role!=='L');
  const nb=quick?1.4:sq<0.4?2.8:2.2;
  const bs=blockers.reduce((s,x)=>s+(eff(x.p,'blo')*0.75+eff(x.p,'sko')*0.15+eff(x.p,'szy')*0.1)/20+(x.p.h-197)/120,0)/blockers.length*(0.75+nb*0.12)+bn(opp);
  const errP=(0.075+(1-sq)*0.08+(0.75-eff(a,'ata')/20)*0.08)*kc(a,m);
  if(R()<errP){a.st.attErr++;const net=R()<0.5;seq.push({k:net?'net':'out',s:1-A});log.push(setTxt,`atak ${net?'w siatkę':'w aut'}${nerves(a,m)}`);return {done:true,winner:1-A,type:'attErr'};}
  const blockP=clamp(0.17+(bs-an+0.17)*0.3,0.03,0.35);
  if(R()<blockP){
    const b=pickW(blockers,x=>eff(x.p,'blo')+(x.role==='S'?4:0)).p;act.push(b.id);seq.push({k:'blk',id:b.id,s:1-A});
    if(R()<0.55){a.st.blocked++;b.st.blk++;seq.push({k:'floor',s:A,blk:1});log.push(setTxt,`BLOK ${nm(b)}!`);return {done:true,winner:1-A,type:'block'};}
    log.push(setTxt,`wybloka ${nm(b)}`);return {done:false,next:1-A,q:2,by:b};
  }
  const defs=cO.filter(x=>!isFront(x.zone));
  const d=pickW(defs,x=>(x.role==='L'?1.6:1)*(0.5+eff(x.p,'obr')/20)).p;
  const dn=(eff(d,'obr')*0.6+eff(d,'zwi')*0.2+eff(d,'szy')*0.2)/20+mb(d,m,1-A)+(d.zaa-11)/20*0.06;
  const killP=clamp(KB+(an-0.95)*0.6-(dn-0.7)*0.3-(bs-0.8)*0.2,0.18,0.85);
  if(R()<killP){a.st.kill++;seq.push({k:'floor',s:1-A});log.push(setTxt,`${quick?'krótka — ':''}PUNKT!`);return {done:true,winner:A,type:'kill'};}
  d.st.dig++;act.push(d.id);seq.push({k:'dig',id:d.id,s:1-A});
  const dq=R()<0.25+dn*0.3+eff(d,'tod')/20*0.15?2:1;
  log.push(setTxt,`broni ${nm(d)}`);
  return {done:false,next:1-A,q:dq,by:d};
}
function fatigue(m,n){
  for(let i=0;i<2;i++){const s=m.sides[i];const on=new Set(onCourt(s,m.serving===i).map(x=>x.p.id));
    for(const p of s.pl){if(on.has(p.id))p.en=Math.max(30,p.en-(0.22+0.12*n)*(1.35-p.kon/20)*(1.2-p.zaa/20*0.4)*(s.fatMul||1));else p.en=Math.min(100,p.en+0.25);}}
}
function startSet(m){
  m.setNo++;m.score=[0,0];m.run={t:-1,n:0};
  for(const s of m.sides){s.rot=[0,1,2,3,4,5];s.to=2;s.subs=6;s.mom=0;s.form=s.form*0.5+nz()*0.06+(s.home?0.0075:0);for(const p of s.pl)p.en=Math.min(100,p.en+12);}
  m.serving=m.setNo===5?(R()<0.5?0:1):(m.firstServe+m.setNo-1)%2;
}
function stepRally(m){
  const ex={n:0};
  const r=rally(m,ex);
  m.rallies++;
  const recv=1-m.serving;m.sideout[1]++;if(r.winner===recv)m.sideout[0]++;
  fatigue(m,ex.n);
  const w=r.winner;m.score[w]++;(m.hist=m.hist||[]).push([m.setNo,m.score[0],m.score[1]]);
  if(m.run.t===w)m.run.n++;else m.run={t:w,n:1};
  const ws=m.sides[w],ls=m.sides[1-w];ws.mom=Math.min(3,Math.max(0,ws.mom)+1);ls.mom=0;
  if(w!==m.serving){m.serving=w;ws.rot.push(ws.rot.shift());}
  const ev=Object.assign({},r,{score:m.score.slice(),setNo:m.setNo});
  const tgt=m.setNo===5?15:25;
  if(m.score[w]>=tgt&&m.score[w]-m.score[1-w]>=2){
    m.sets.push(m.score.slice());m.setsWon[w]++;ev.setEnd=true;ev.setWinner=w;
    if(m.setsWon[w]===3){m.over=true;m.winner=w;ev.matchEnd=true;}else startSet(m);
  }
  return ev;
}
function callTimeout(m,i){const s=m.sides[i];if(s.to<=0)return false;s.to--;m.sides[1-i].mom=0;s.mom=Math.max(0,s.mom);m.run.n=0;return true;}
function benchOf(side){const on=new Set(side.slots.map(s=>s.p.id));if(side.libero)on.add(side.libero.id);return side.pl.filter(p=>!on.has(p.id));}
function substitute(m,i,slot,pid){const s=m.sides[i];const p=s.pl.find(x=>x.id===pid);if(!p)return false;
  if(slot==='L'){s.libero=p;return true;}
  if(s.subs<=0)return false;s.slots[slot].p=p;s.subs--;return true;}
function aiTurn(m,i){
  const s=m.sides[i],msgs=[];
  if(m.run.t===1-i&&m.run.n>=3&&s.to>0&&(m.score[1-i]>=8||m.run.n>=4)){callTimeout(m,i);msgs.push(`Czas dla ${s.team.name}.`);}
  if(s.subs>0)for(let k=0;k<6;k++){const sl=s.slots[k];
    if(sl.p.en<58){const c=benchOf(s).filter(p=>p.pos===sl.role&&p.en>80).sort((a,b)=>rating(b)-rating(a))[0];
      if(c&&rating(c)>=rating(sl.p)-12&&s.subs>0){const old=sl.p;substitute(m,i,k,c.id);msgs.push(`Zmiana w ${s.team.name}: ${nm(c)} za ${nm(old)}.`);}}}
  return msgs;
}
function simMatch(a,b){const m=newMatch(a,b);while(!m.over){aiTurn(m,0);aiTurn(m,1);stepRally(m);}return m;}
function mvpScore(p){const s=p.st;return s.kill+s.blk*1.2+s.ace*1.2+s.recPerf*0.15+s.dig*0.2-s.attErr*0.7-s.srvErr*0.4-s.recErr*0.6-s.blocked*0.5;}
function runTest(ta,tb,n){
  const agg={w:[0,0],res:{},sets:0,ptsW:0,ptsL:0,srv:0,srvErr:0,ace:0,att:0,kill:0,attErr:0,blocked:0,so:[0,0],rallies:0};
  const A={team:ta,lineup:autoLineup(ta),tactics:{serve:1,dist:0}},B={team:tb,lineup:autoLineup(tb),tactics:{serve:1,dist:0}};
  for(let i=0;i<n;i++){const m=simMatch(A,B);agg.w[m.winner]++;const key=m.setsWon[0]+':'+m.setsWon[1];agg.res[key]=(agg.res[key]||0)+1;
    for(let si=0;si<m.sets.length;si++){const s=m.sets[si];if(si===4)continue;agg.sets++;agg.ptsW+=Math.max(...s);agg.ptsL+=Math.min(...s);}
    agg.so[0]+=m.sideout[0];agg.so[1]+=m.sideout[1];agg.rallies+=m.rallies;
    for(const sd of m.sides)for(const p of sd.pl){const s=p.st;agg.srv+=s.srv;agg.srvErr+=s.srvErr;agg.ace+=s.ace;agg.att+=s.att;agg.kill+=s.kill;agg.attErr+=s.attErr;agg.blocked+=s.blocked;}}
  return agg;
}
if(typeof module!=='undefined')module.exports={MENTAL,PHYS,TEAM_DEFS,genTeam,runTest,autoLineup,rating,teamStrength};
