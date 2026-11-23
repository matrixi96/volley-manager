// ================= PANELE ZAWODNIKÓW, MORALE, PRZEMOWY =================
function kitColors(m){const c0=m.sides[0].team.color,c1=m.sides[1].team.color;if(cdist(c0,c1)>=110)return [c0,c1];
  const homeLeft=m.homeIdx==null||m.homeIdx===m.sides[0].team.idx;const away=homeLeft?1:0;const hc=away?c0:c1;const alt=lum(hc)>0.7?'#111827':'#f1f5f9';
  return away?[c0,alt]:[alt,c1];}
function morLabel(v){return v>=80?'świetne':v>=62?'dobre':v>=45?'słabe':'złe';}
function morCol(v){return v>=80?'#22c55e':v>=62?'#84cc16':v>=45?'#eab308':'#ef4444';}
function bar(v,col){return `<span class="pbar2"><i style="width:${Math.max(0,Math.min(100,v))}%;background:${col}"></i></span>`;}
function playersPanel(m,i){
  const sd=m.sides[i],mine=i===0,kc=kitColors(m)[i];
  const oc=onCourt(sd,m.serving===i);const onIds=new Set(oc.map(e=>e.p.id));
  const bench=sd.pl.filter(p=>!onIds.has(p.id));
  const del=ui.talkRes&&mine?ui.talkRes.del:null;
  const row=(p,e)=>{const x=p.st,pts=x.kill+x.blk+x.ace,err=x.attErr+x.srvErr;const mor=p.mor==null?60:p.mor;
    const click=mine&&!m.over?(e?`onclick="selSub(${e.slot==='L'?"'L'":e.slot})"`:(ui.subSel!=null?`onclick="doSub('${p.id}')"`:'')):'';
    const d=del&&del[p.id]!=null?del[p.id]:null;
    return `<div class="prow ${e?'on':'bench'} ${click?'clk':''} ${!e&&mine&&ui.subSel!=null?'pick':''}" ${click}>
      <div class="pf">${faceSvg(p.id,{size:30,age:p.age,color:kc,kind:'player'})}<span class="pn2" style="background:${e&&e.role==='L'?libColor(kc,'#000'):kc};color:${lum(e&&e.role==='L'?libColor(kc,'#000'):kc)>0.6?'#111':'#fff'}">${p.num}</span></div>
      <div class="pm"><div class="pnm"><b>${esc(p.last)}</b> <small class="mut">${pTag(e?e.role:p.pos)}${e?'':' · ławka'}</small>${d!=null&&d!==0?` <span class="dlt ${d>0?'good':'bad'}">${d>0?'+':''}${d}</span>`:''}</div>
        <div class="pbars"><span title="Kondycja ${Math.round(p.en)}%">⚡${bar(p.en,p.en>75?'#22c55e':p.en>55?'#eab308':'#ef4444')}</span><span title="Morale: ${morLabel(mor)} (${mor})">${mor>=62?'😀':mor>=45?'😐':'😟'}${bar(mor,morCol(mor))}</span></div>
        <div class="pst">${pts} pkt · atak ${x.kill}/${x.att}${x.blk?` · blok ${x.blk}`:''}${x.ace?` · as ${x.ace}`:''}${x.rec?` · przyj. ${pc(x.recPos,x.rec)}`:''}${x.dig?` · obr. ${x.dig}`:''}${err?` · <span class="bad">bł. ${err}</span>`:''}</div></div></div>`;};
  const avgM=Math.round(oc.reduce((s,e)=>s+(e.p.mor==null?60:e.p.mor),0)/oc.length);
  return `<div class="card ppanel ${mine&&ui.subSel!=null?'subbing':''}" style="border-top:3px solid ${kc}"><div class="row"><b>${mine?'Twoi zawodnicy':esc(sd.team.name)}</b><span class="sp"></span><span class="small mut" title="Średnie morale na boisku">morale ${avgM} ${avgM>=62?'😀':avgM>=45?'😐':'😟'}</span></div>
   ${mine&&sd.tmp&&sd.tmp.n>0?`<div class="small tmpb">📋 ${esc(TALK_TMP[sd.tmp.k]||'')} — jeszcze ${sd.tmp.n} akcji</div>`:''}
   ${oc.map(e=>row(e.p,e)).join('')}<div class="small mut benchh">Ławka</div>${bench.map(p=>row(p,null)).join('')||'<div class="small mut">brak</div>'}</div>`;}
// ---- przemowy ----
const TALK_TMP={srv:'Ryzykowna zagrywka',rec:'Skupienie na przyjęciu',target:'Zagrywka w wybranego zawodnika'};
function weakestReceiver(m){const oc=onCourt(m.sides[1],m.serving===1).filter(e=>e.role==='L'||e.role==='P');return oc.map(e=>e.p).sort((a,b)=>(a.prz+a.tod)-(b.prz+b.tod))[0];}
// ton przemowy (jeden na czas) + wskazówka do gry (jedna na czas)
const TALK_TONE=[['enc','Zachęć','„Wierzę w was, dacie radę!”','Podnosi morale, najbardziej gdy przegrywacie i gdy morale jest niskie. Przez 7 akcji cała drużyna gra trochę pewniej.','tgo'],
  ['dem','Zażądaj więcej','„Stać was na dużo więcej!”','Ambitni i waleczni się nakręcą, wrażliwi mogą się spiąć. Przez 7 akcji drużyna mocniej walczy, zwłaszcza przy stracie punktów.','tfight'],
  ['calm','Uspokój','„Spokojnie, więcej koncentracji”','Pomaga nerwowym i zawodnikom z niskim morale. Kasuje załamanie po błędach (🔻). Przez 7 akcji mniej prostych błędów i pewniejsza końcówka.','tfocus'],
  ['wake','Obudź','„Obudźcie się! Tak się nie gra!”','Ostra reprymenda: działa przy dużym autorytecie. Waleczni się nakręcą, nerwowi mogą się spiąć. Przez 7 akcji wyraźny impuls dla całej drużyny.','twake'],
  ['keep','Pochwal grę','„Gramy dobrze, tak trzymać!”','Najlepsze, gdy prowadzicie: podbija morale, podtrzymuje rozpęd i pewność siebie, a przez 7 akcji drużyna gra równo, z mniejszą liczbą prostych błędów. Przy wyraźnej stracie zawodnicy uznają to za mijanie się z rzeczywistością.','tkeep']];
function talkList(m){return TALK_TONE.map(x=>[x[0],x[1]+': '+x[2],x[3]]).concat([['srv','Ryzykujcie na zagrywce!',''],['rec','Skupcie się na przyjęciu',''],['target','Zagrywka w wybranego zawodnika','']]);}
function myTimeout(){const m=ui.match;if(!m||m.over||ui.to)return;if(m.sides[0].to<=0)return;
  if(m.animating){ui.toReq=!ui.toReq;document.querySelectorAll('.tobtn').forEach(b=>b.textContent=ui.toReq?'⏱ Czas po akcji…':`⏱ Czas (${m.sides[0].to})`);return;}
  startTimeout(0);}
function talkState(){return ui.talkSt||(ui.talkSt={tone:null,hint:null});}
function talkPlayers(m){const s=m.sides[0];return onCourt(s,m.serving===0).map(e=>e.p);}
function applyTone(k){const m=ui.match;if(!m)return;const st=talkState();if(st.tone)return;const T=TALK_TONE.find(x=>x[0]===k);const s=m.sides[0];const oc=talkPlayers(m);
  const behind=m.score[1]-m.score[0];const mot=cA('mot'),aut=cA('aut');const cp=myCaptain();const amp=(0.8+aut/50)*(cp&&oc.some(x=>x.id===cp.id)?1+Math.max(0,capBonus(cp))*3:1);const del={};
  if(k==='calm'&&typeof cfNote==='function'&&oc.some(p=>(p.cf||0)<=-1))cfNote(m,{k:'calm',i:0});
  for(const p of oc){const mor=p.mor==null?60:p.mor;let d=0;if(k==='calm'&&(p.cf||0)<0){p.cf=0;p.cfN=0;}
    if(k==='enc')d=2+(mot-10)*0.5+(behind>=3?3:0)+(mor<50?2:0);
    else if(k==='dem')d=((p.zaa+(hasT(p,'amb')?16:p.wal))/2-10)*0.8+(mot-10)*0.3-(p.opa<9?2:0)-(mor<45?2:0);
    else if(k==='calm')d=1+(60-mor)*0.12+(12-p.opa)*0.45;
    else if(k==='wake')d=((p.wal+p.zaa)/2-10.5)*1.1+(aut-10)*0.5-(p.opa<9?3:0);
    else if(k==='keep'){const lead=-behind;d=1.5+(lead>=3?3:lead>=0?1.5:lead>=-2?0:-2.5)+(mot-10)*0.2+((m.setsWon[0]>m.setsWon[1])?1:0);if(lead>=0&&(p.cf||0)<0.5)p.cf=Math.max(p.cf||0,0.5);}
    d=Math.round(d*amp+(R()-0.5)*2);addMor(p,d);del[p.id]=d;}
  // efekt na całą drużynę: siła zależy od motywacji/autorytetu trenera i średniej reakcji zawodników
  const avg=Object.values(del).reduce((a,b)=>a+b,0)/Math.max(1,oc.length);const f=clamp(shoutPow()*1.25*(0.75+avg/12),0.3,1.8);
  const F=SH_FX[T[4]]||{};const fx={};for(const x in F)fx[x]=F[x]*(x==='e'?Math.min(1.3,f):f);s.sh=Object.assign({k:T[4],u:m.rallies+7,n:T[2].replace(/[„”]/g,''),ic:'⏱'},fx);
  if(k==='enc'&&Math.abs(behind)<=3)s.mom=Math.min(3,Math.max(0,s.mom)+1);
  if(k==='keep'&&behind<=0)s.mom=Math.min(3,Math.max(1,s.mom+1));
  const up=Object.values(del).filter(d=>d>0).length,dn=Object.values(del).filter(d=>d<0).length;
  m.log.push({t:`🗣️ ${esc(coach()?coach().last:'Trener')} (${T[1].toLowerCase()}): ${esc(T[2])} — ${up} zawodników podbudowanych${dn?`, ${dn} spiętych`:''}. Drużyna: ${esc(fxText(s.sh))} (7 akcji).`,c:'sys'});
  st.tone=k;ui.talkRes={k,del};if(ui.to)ui.to.said=T[1];if(st.hint)ui.talk=false;persistLive();render();}
function applyHint(k,id){const m=ui.match;if(!m)return;const st=talkState();if(st.hint)return;const s=m.sides[0];const dur=5+Math.floor(cA('tak')/4);let txt='';
  if(k==='srv'){s.tmp={k,n:dur};txt='Ryzykujcie na zagrywce!';for(const p of talkPlayers(m))if(p.zag>=13)addMor(p,1);}
  else if(k==='rec'){s.tmp={k,n:dur};txt='Skupcie się na przyjęciu';for(const p of talkPlayers(m))if(p.pos==='L'||p.pos==='P')addMor(p,1);}
  else if(k==='target'){const t=findPl(m,id);if(!t)return;s.tmp={k:"target",n:dur,id};txt=`Zagrywka na ${t.last}`;}
  m.log.push({t:`📋 Wskazówka trenera: „${esc(txt)}” (${dur} akcji).`,c:'sys'});st.hint=k;if(st.tone)ui.talk=false;persistLive();render();}
function applyTalk(k){if(TALK_TONE.some(x=>x[0]===k))return applyTone(k);if(k==='target'){const w=weakestReceiver(ui.match);return applyHint('target',w&&w.id);}return applyHint(k);}
function talkCard(m){const to=ui.to;const st=talkState();const opp=onCourt(m.sides[1],m.serving===1).map(e=>({p:e.p,role:e.role})).sort((a,b)=>(a.p.prz+a.p.tod)-(b.p.prz+b.p.tod));
  const tone=TALK_TONE.map(([k,n,q,d])=>`<button class="opt ${st.tone===k?'on':''}" ${st.tone?'disabled':''} onclick="applyTone('${k}')"><b>${n}</b><small><i>${esc(q)}</i><br>${esc(d)}</small></button>`).join('');
  const dur=5+Math.floor(cA('tak')/4);
  const isSet=to&&to.kind==='set';
  return `<div class="card talk"><div class="row"><h3 style="margin:0">${isSet?`🔄 Przerwa po ${to.setNo}. secie — zmiana stron`:`⏱ ${to&&to.side===1?`Czas dla ${esc(m.sides[1].team.short)} — możesz porozmawiać ze swoimi`:'Czas — co mówisz zawodnikom?'}`}</h3>${to?`<span class="tobar" style="width:140px;margin-left:10px"><i style="width:${Math.max(0,(to.end-Date.now())/(10*(to.dur||15)))}%"></i></span><b class="tocount" style="margin-left:6px">${Math.max(0,Math.ceil((to.end-Date.now())/1000))} s</b>`:''}<span class="sp"></span><button class="ghost" onclick="ui.talk=false;render()">${st.tone||st.hint?'Zamknij':'Bez przemowy'}</button>${to?`<button class="btn" onclick="endTimeout()">${isSet?`⏩ Zaczynamy ${m.setNo}. seta`:'↩ Wracamy na boisko'}</button>`:''}</div>
  ${isSet?setSummary(m)+setLuPanel(m):''}
  <p class="small mut">Wybierz <b>ton przemowy</b> i <b>wskazówkę do gry</b> (po jednej na przerwę). Każdy zawodnik reaguje inaczej — zależy od jego charakteru i Twoich atrybutów trenera. Reakcje zobaczysz przy nazwiskach w panelu.</p>
  <div class="tsec">1. Ton przemowy${st.tone?` <span class="good">✓ ${TALK_TONE.find(x=>x[0]===st.tone)[1]}</span>`:''}</div><div class="opts tone4">${tone}</div>
  <div class="tsec">2. Wskazówka do gry <small class="mut">(działa ${dur} akcji)</small>${st.hint?' <span class="good">✓ wydana</span>':''}</div>
  <div class="opts tone4"><button class="opt ${st.hint==='srv'?'on':''}" ${st.hint?'disabled':''} onclick="applyHint('srv')"><b>Ryzykujcie na zagrywce</b><small>Mocniejsza zagrywka: więcej asów, ale i więcej błędów.</small></button>
   <button class="opt ${st.hint==='rec'?'on':''}" ${st.hint?'disabled':''} onclick="applyHint('rec')"><b>Skupcie się na przyjęciu</b><small>Lepsze przyjęcie, spokój dla przyjmujących i libero.</small></button></div>
  <div class="tsub">Zagrywka w zawodnika:</div><div class="tgtl">${opp.map(({p,role})=>`<button class="ghost sm ${st.hint==='target'&&ui.match.sides[0].tmp&&ui.match.sides[0].tmp.id===p.id?'on':''}" ${st.hint?'disabled':''} onclick="applyHint('target','${p.id}')"><b>${esc(p.last)}</b> <small class="mut">${pTag(p.pos)} · przyjęcie ${p.prz}</small></button>`).join('')}</div></div>`;}
// ---- karta ustawienia ----
const ROT_TIP={1:'Rozgrywający z tyłu na prawej: trzech atakujących w pierwszej linii.',6:'Rozgrywający z tyłu w środku: trzech atakujących z przodu.',5:'Rozgrywający z tyłu na lewej: trzech atakujących z przodu, najdłuższy dobieg do siatki.',4:'Rozgrywający z przodu na lewej: tylko dwóch atakujących w pierwszej linii.',3:'Rozgrywający z przodu w środku: dwóch atakujących z przodu, możliwa kiwka.',2:'Rozgrywający z przodu na prawej: dwóch atakujących z przodu, klasyczna wystawa.'};
function rotBox(m,i){const sd=m.sides[i];const sv=m.serving===i;const oc=onCourt(sd,sv);const kc=kitColors(m)[i];
  const setter=oc.find(e=>e.role==='R');const rz=setter?setter.zone+1:0;const front=oc.filter(e=>isFrontZ(e.zone)),back=oc.filter(e=>!isFrontZ(e.zone));
  const atk=front.filter(e=>e.role!=='R'&&e.role!=='L').length;const lib=oc.find(e=>e.role==='L');const libFor=lib?sd.slots[sd.rot[lib.zone]]:null;
  const cell=z=>{const e=oc.find(x=>x.zone===z-1);if(!e)return '<div class="rz"></div>';const col=e.role==='L'?libColor(kc,'#000'):kc;
    return `<div class="rz ${e.role==='R'?'rs':''}" title="Strefa ${z}: ${esc(e.p.first+' '+e.p.last)} (${POS_NAMES[e.role]})"><span class="rzn">${z}</span><i style="background:${col};color:${lum(col)>0.6?'#111':'#fff'}">${e.p.num}</i><small>${pTag(e.role)}</small></div>`;};
  const grid=i===0?[[5,4],[6,3],[1,2]]:[[2,1],[3,6],[4,5]];
  const tac=sd.tactics||{serve:1,dist:0};
  return `<div class="rbox"><div class="row"><b style="color:${kc}">●</b> <b>${esc(sd.team.short)}</b><span class="sp"></span><span class="rtag ${sv?'srv':'rcv'}">${sv?'🏐 na zagrywce':'🛡️ w przyjęciu'}</span></div>
   <div class="rmain"><div class="rgrid ${i===0?'l':'r'}">${grid.map(r=>r.map(cell).join('')).join('')}<div class="rnet"></div></div>
   <div class="rtxt"><div class="rtitle">Ustawienie ${rz||'?'}</div><div class="small mut">${rz?`rozgrywający w strefie ${rz} · system 5-1`:'system 5-1'}</div>
   <div class="small">${ROT_TIP[rz]||''}</div>
   <div class="small mut" style="margin-top:4px">Atakujący z przodu: <b style="color:var(--txt)">${atk}</b>${lib?` · libero ${esc(lib.p.last)} za ${esc(libFor?libFor.p.last:'środkowego')}`:''}</div>
   <div class="small mut">W obronie: ${[1,6,5].map(z=>{const e=back.find(x=>defZone(x)===z);return e?`<b style="color:var(--txt)">${z}</b> ${pTag(e.role)} ${esc(e.p.last)}`:''}).filter(Boolean).join(' · ')}</div>
   <div class="small mut">Zagrywka: <b style="color:var(--txt)">${SERVE_OPT[tac.serve][0]}</b> · rozegranie: <b style="color:var(--txt)">${DIST_OPT[tac.dist][0]}</b></div>
   ${sd.tmp&&sd.tmp.n>0?`<div class="small tmpb">📋 ${esc(TALK_TMP[sd.tmp.k]||'')} — ${sd.tmp.n} akcji</div>`:''}</div></div></div>`;}
function rotCard(m){if(m.over)return '';return `<div class="card rotcard"><div class="row"><h3 style="margin:0">Grane ustawienie</h3><span class="sp"></span><span class="small mut">Set ${m.setNo} · ${m.score[0]}:${m.score[1]}</span></div><div class="rboxes">${rotBox(m,0)}${rotBox(m,1)}</div>
  <p class="small mut" style="margin:6px 0 0">Numer ustawienia = strefa, w której stoi rozgrywający. Ustawienie zmienia się, gdy drużyna odbiera zagrywkę rywalowi (rotacja zgodnie z ruchem wskazówek zegara).</p></div>`;}

// ================= EKRAN MECZU W UKŁADZIE MENEDŻERSKIM =================
// ocena meczowa na żywo (skala 1–10, start 6,0)
function liveRating(p){const x=p.st;const act=x.srv+x.rec+x.att+x.dig+x.blk;if(!act)return null;
  const v=6+0.3*x.kill+0.45*x.blk+0.45*x.ace+0.12*x.dig+0.06*x.recPos-0.3*x.attErr-0.25*x.srvErr-0.35*x.recErr-0.2*x.blocked-0.04*(x.att-x.kill-x.attErr);
  return Math.max(3,Math.min(10,v));}
const fmtR=v=>v==null?'–':v.toFixed(1).replace('.',',');
const rCls=v=>v==null?'':v>=7?'up':v<=5.4?'dn':'';
function energyCol(v){return v>75?'#22c55e':v>55?'#eab308':'#ef4444';}
function fmJersey(m,i,e,size){const kc=kitColors(m)[i];const col=e&&e.role==='L'?libColor(kc,'#000'):kc;
  return `<span class="fmj" style="background:${col};color:${lum(col)>0.6?'#111':'#fff'};${size?`width:${size}px;height:${size}px`:''}">${e.p.num}</span>`;}
// ---- boczna karta „Formacja” ----
function fmFormation(m,i){const sd=m.sides[i],mine=i===0,sv=m.serving===i;const oc=onCourt(sd,sv);const kc=kitColors(m)[i];
  const setter=oc.find(e=>e.role==='R');const rz=setter?setter.zone+1:0;
  const cell=z=>{const e=oc.find(x=>x.zone===z-1);if(!e)return '<div class="fmz"></div>';const p=e.p;const r=liveRating(p);
    const click=mine&&!m.over?`onclick="selSub(${e.slot==='L'?"'L'":e.slot})"`:'';
    const d=ui.talkRes&&mine&&ui.talkRes.del?ui.talkRes.del[p.id]:null;
    return `<div class="fmz ${click?'clk':''} ${cfState(p)<0?'cfdn':cfState(p)>0?'cfup':''} ${ui.subSel!=null&&mine&&(ui.subSel===e.slot)?'sel':''}" ${click} title="Strefa ${z}: ${esc(p.first+' '+p.last)} · ${POS_NAMES[e.role]} · energia ${Math.round(p.en)}%">
      ${fmJersey(m,i,e)}<span class="fmrt ${rCls(r)}">${fmtR(r)}</span><span class="fmps">${pTag(e.role)}</span>
      <div class="fmnr"><b class="fmnm">${esc(shortN(p))}</b></div>${cfBadge(p)}${d?`<span class="dlt ${d>0?'good':'bad'}" title="Reakcja na przemowę (morale)">${d>0?'+':''}${d}</span>`:''}
      <span class="fmen"><i style="width:${Math.round(p.en)}%;background:${energyCol(p.en)}"></i></span></div>`;};
  const back=oc.filter(e=>!isFrontZ(e.zone));
  return `<div class="card fmcard" style="border-top:3px solid ${kc}">
   <div class="fmh"><b>${esc(sd.team.short)}: ustawienie ${rz||'?'}</b><span class="rtag ${sv?'srv':'rcv'}">${sv?'🏐 zagrywka':'🛡️ przyjęcie'}</span></div>
   <div class="fmnet">siatka</div>
   <div class="fmgrid">${[4,3,2,5,6,1].map(cell).join('')}</div>
   <div class="small mut fmdef">${ROT_TIP[rz]||''}</div>
   <div class="small mut">W obronie: ${[5,6,1].map(z=>{const e=back.find(x=>defZone(x)===z);return e?`<b style="color:var(--txt)">${z}</b> ${pTag(e.role)}`:''}).filter(Boolean).join(' · ')}</div>
   ${sd.tmp&&sd.tmp.n>0?`<div class="small tmpb">📋 ${esc(TALK_TMP[sd.tmp.k]||'')} — ${sd.tmp.n} akcji</div>`:''}</div>`;}
// ---- tabela na żywo (wynik w setach traktowany jak końcowy, gdy ktoś prowadzi) ----
function fmLiveTable(m){const c=m.ctx;if(!c||c.kind!=='liga')return '';const s=S();
  const base=leagueTable().map(x=>x.i);
  let proj=s.results.slice();const [a,b]=m.setsWon;let note='';
  if(a!==b){const w=a>b?0:1;const ls=Math.min(a,b);const meIdx=m.sides[0].team.idx;const sw0=w===0?[3,ls]:[ls,3];
    const g={h:c.h,a:c.a,sets:[],sw:c.h===meIdx?sw0:[sw0[1],sw0[0]]};proj=proj.concat([[g]]);note='wg wyniku w setach';}
  const t=tableFrom(proj);const my=SAVE.team,op=c.h===my?c.a:c.h;
  const myPos=t.findIndex(x=>x.i===my);const from=Math.max(0,Math.min(t.length-5,myPos-2));
  return `<div class="card fmside2"><div class="fmh"><b>Tabela na żywo</b><span class="small mut">${note}</span></div>
   ${t.slice(from,from+5).map((x,k)=>{const pos=from+k,old=base.indexOf(x.i);const mv=old>pos?'<span class="good">▲</span>':old<pos?'<span class="bad">▼</span>':'<span class="mut">–</span>';
     return `<div class="fmtr ${x.i===my?'me':x.i===op?'op':''}"><span>${pos+1}</span>${mv}<span class="fmtn">${tDot(x.i)}${esc(TEAMS[x.i].short)}</span><span class="mut">${x.m}</span><b>${x.pts}</b></div>`;}).join('')}</div>`;}
// ---- ostatnie wyniki (poprzednia kolejka / play-off) ----
function fmRecent(m){const s=S();let rows=[],title='Ostatnie wyniki';
  if(m.ctx&&m.ctx.kind==='po'&&s.po){title='Play-off';rows=activeSeries().map(sr=>`<div class="fmtr"><span class="fmtn">${esc(TEAMS[sr.hi].short)} – ${esc(TEAMS[sr.lo].short)}</span><b>${sr.w[0]}:${sr.w[1]}</b></div>`);}
  else{const last=s.results&&s.results.length?s.results[s.results.length-1]:null;
    if(last)rows=last.filter(g=>!g.me).slice(0,5).map(g=>`<div class="fmtr"><span class="fmtn">${esc(TEAMS[g.h].short)} – ${esc(TEAMS[g.a].short)}</span><b>${g.sw[0]}:${g.sw[1]}</b></div>`);
    else if(s.spar&&s.spar.res.length){title='Sparingi';rows=s.spar.res.slice(-4).map(g=>`<div class="fmtr"><span class="fmtn">${esc(TEAMS[g.h].short)} – ${esc(TEAMS[g.a].short)}</span><b>${g.sw[0]}:${g.sw[1]}</b></div>`);}}
  return `<div class="card fmside2"><div class="fmh"><b>${title}</b></div>${rows.join('')||'<div class="small mut">Brak wcześniejszych wyników.</div>'}</div>`;}
// ---- asystent ----
function fmAdvice(m){if(m.over)return null;const a=m.sides[0],b=m.sides[1];const h=(m.hist||[]).filter(x=>x[0]===m.setNo);
  let run=0;for(let k=h.length-1;k>=0;k--){const prev=k?h[k-1]:[0,0,0];if(h[k][2]>prev[2])run++;else break;}
  if(run>=3&&a.to>0)return {k:'to'+m.setNo+'-'+h.length,t:`Rywal zdobył ${run} punkty z rzędu. Weź czas i porozmawiaj z zespołem.`,btn:'Weź czas',act:'myTimeout()'};
  const oc=onCourt(a,m.serving===0);const tired=oc.filter(e=>e.role!=='L'&&e.p.en<55).sort((x,y)=>x.p.en-y.p.en)[0];
  if(tired&&a.subs>0)return {k:'sub'+tired.p.id,t:`${tired.p.last} opada z sił (energia ${Math.round(tired.p.en)}%). Wpuść zmiennika.`,btn:'Wybierz zmianę',act:`selSub(${tired.slot})`};
  if(typeof MENT!=='undefined'&&MENT){const sh=oc.filter(e=>(e.p.cf||0)<=-1.5).sort((x,y)=>x.p.cf-y.p.cf)[0];
    if(sh&&a.to>0)return {k:'cf'+sh.p.id+'-'+m.setNo,t:`${sh.p.last} jest roztrzęsiony po błędach i gra słabiej. Weź czas albo go zmień.`,btn:'Weź czas',act:'myTimeout()'};
    const ob=onCourt(b,m.serving===1).filter(e=>(e.role==='P'||e.role==='L')&&(e.p.cf||0)<=-1).sort((x,y)=>x.p.cf-y.p.cf)[0];
    if(ob&&!a.tactics.shk)return {k:'cfo'+ob.p.id+'-'+m.setNo,t:`Rywalom siadło przyjęcie: ${ob.p.last} jest roztrzęsiony. Zagrywajmy w niego.`,btn:'Celuj w niego',act:"tacSet('shk',1)"};}
  const ana=anaAdvice(m);if(ana)return ana;
  const A=teamTotals(a),B=teamTotals(b);
  if(A.rec>=6&&A.recPos/A.rec<0.4&&a.to>0)return {k:'rec'+m.setNo,t:`Przyjęcie słabe (${pc(A.recPos,A.rec)} pozytywnego). Czas i przemowa „Skupcie się na przyjęciu” pomogą.`,btn:'Weź czas',act:'myTimeout()'};
  if(B.rec>=6&&B.recPos/B.rec<0.45&&a.tactics.serve<2)return {k:'srv'+m.setNo,t:`Rywal źle przyjmuje (${pc(B.recPos,B.rec)}). Zaryzykuj mocniejszą zagrywkę.`,btn:'Ryzykowna zagrywka',act:'setServe(2)'};
  if(B.att>=8&&B.kill/B.att>0.55&&a.tactics.dist!==2)return {k:'blk'+m.setNo,t:`Atak rywala kończy ${pc(B.kill,B.att)} piłek. Pilnuj bloku, przemowa uspokoi zespół.`,btn:null};
  return {k:'ok',t:`Gramy swoje. Atak ${pc(A.kill,A.att)} wobec ${pc(B.kill,B.att)} rywala.`,btn:null};}
function fmAssistant(m){const ad=fmAdvice(m);if(!ad)return `<div class="card fmw"><div class="fmh"><b>Asystent</b></div><div class="small">Mecz zakończony.</div></div>`;
  const hid=ui.asstHide===ad.k;
  if(ui.asstOpen)return asstInline(m);
  return `<div class="card fmw"><div class="fmh"><b>Asystent</b><button class="ghost sm" onclick="ui.asstOpen=1;render()">💬 Zapytaj</button></div>
   <div class="small fmat">${hid?'<span class="mut">Brak nowych uwag.</span>':esc(ad.t)}</div>
   ${ad.btn&&!hid?`<div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" onclick="${ad.act}">✓ ${esc(ad.btn)}</button><button class="ghost sm" onclick="ui.asstHide='${ad.k}';render()">✕</button></div>`:''}</div>`;}
// ---- dynamika meczu ----
function fmMomentum(m){const h=m.hist||[];const kc=kitColors(m);const W=240,H=70,mid=H/2;
  const sets=[...new Set(h.map(x=>x[0]))];const n=Math.max(h.length,50);
  let pts=[],seps=[];let prevSet=null;h.forEach((x,k)=>{if(x[0]!==prevSet&&prevSet!=null)seps.push(k);prevSet=x[0];pts.push([k,x[1]-x[2]]);});
  const mx=Math.max(5,...pts.map(p=>Math.abs(p[1])));const X=k=>(k/(n-1)*W).toFixed(1),Y=d=>(mid-d/mx*(mid-4)).toFixed(1);
  const bars=pts.map(([k,d])=>d===0?'':`<rect x="${X(k)}" y="${d>0?Y(d):mid}" width="${Math.max(1,W/n-0.6).toFixed(1)}" height="${Math.abs(Y(d)-mid).toFixed(1)}" fill="${d>0?kc[0]:kc[1]}"/>`).join('');
  return `<div class="card fmw"><div class="fmh"><b>Dynamika meczu</b><span class="small mut">przewaga w punktach</span></div>
   <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="fmmom"><line x1="0" x2="${W}" y1="${mid}" y2="${mid}" stroke="#ffffff40"/>${seps.map(k=>`<line x1="${X(k)}" x2="${X(k)}" y1="0" y2="${H}" stroke="#ffffff30" stroke-dasharray="2 2"/>`).join('')}${bars}</svg>
   <div class="fmleg small mut">${sets.map(s=>`<span>set ${s}</span>`).join('')||'<span>czeka na pierwszy punkt</span>'}</div></div>`;}
// ---- kto kończy ataki ----
function fmAttack(m){const sd=m.sides[0];const tot=sd.pl.reduce((s,p)=>s+p.st.att,0);const kc=kitColors(m)[0];
  const arr=sd.pl.filter(p=>p.st.att).sort((a,b)=>b.st.att-a.st.att).slice(0,4);
  return `<div class="card fmw"><div class="fmh"><b>Rozkład ataków</b><span class="small mut">${esc(sd.team.short)}</span></div>
   ${arr.map(p=>`<div class="fmar"><span class="fmtn">${esc(p.last)}</span><span class="shb"><i style="width:${p.st.att/tot*100}%;background:${kc}"></i></span><span class="small mut">${p.st.kill}/${p.st.att}</span></div>`).join('')||'<div class="small mut">Jeszcze bez ataków.</div>'}</div>`;}
// ---- statystyki przy boisku ----
function fmTeamStats(m,i){const t=teamTotals(m.sides[i]),o=teamTotals(m.sides[1-i]);const kc=kitColors(m)[i];
  const sd=m.sides[i];const mixN=(m.mixN||[0,0])[i];const sh=(a,b)=>a+b?Math.round(a/(a+b)*100):0;const pr=(a,b)=>b?Math.round(a/b*100):0;
  const bar=w=>`<span class="fsb"><i style="width:${w}%;background:${kc}"></i></span>`;
  const row=(l,v,w,sub)=>`<div class="fsr"><div class="fsl"><span>${l}</span><b>${v}</b></div>${sub?`<small>${sub}</small>`:''}${w!=null?bar(w):''}</div>`;
  const err=t.attErr+t.srvErr+t.recErr;
  return `<div class="fmst"><div class="fmh"><b style="border-bottom:2px solid ${kc}">${esc(sd.team.short)}</b></div>
   ${row('Punkty',t.pts,sh(t.pts,o.pts))}${row('Atak',t.att?pr(t.kill,t.att)+'%':'–',pr(t.kill,t.att),t.att?`${t.kill} / ${t.att}`:'')}
   ${row('Przyjęcie+',t.rec?pr(t.recPos,t.rec)+'%':'–',pr(t.recPos,t.rec),t.rec?`${t.recPos} / ${t.rec}`:'')}${row('Obrony',t.dig,sh(t.dig,o.dig))}
   ${row('Asy · Bloki',`${t.ace} · ${t.blk}`)}${row('Błędy',err)}${row('Zgranie',chemPct(sd.chem??0.6)+'%')}${mixN?row('Nieporoz.',mixN):''}</div>`;}
// ---- pasek składu ----
function fmStrip(m){const a=m.sides[0];const oc=onCourt(a,m.serving===0);const ord={R:0,A:1,P:2,S:3,L:4};
  const on=oc.slice().sort((x,y)=>ord[x.role]-ord[y.role]||x.zone-y.zone);
  const mine=e=>{const p=e.p,r=liveRating(p),mor=p.mor==null?60:p.mor;const click=!m.over?`onclick="selSub(${e.slot==='L'?"'L'":e.slot})"`:'';
    return `<div class="fmsp ${click?'clk':''} ${cfState(p)<0?'cfdn':cfState(p)>0?'cfup':''} ${ui.subSel===e.slot?'sel':''}" ${click} title="${esc(p.first+' '+p.last)} · energia ${Math.round(p.en)}% · morale ${mor}">
      <span class="fmps2">${pTag(e.role)}</span>${fmJersey(m,0,e,28)}<b class="fmnm">${esc(shortN(p))}</b>${cfBadge(p)}<span class="fmps2">ogólna <b style="color:var(--acc)">${rating(p)}</b></span>
      <span class="fmrow"><span class="fmrt ${rCls(r)}">${fmtR(r)}</span><span>${mor>=62?'😀':mor>=45?'😐':'😟'}</span>${formChip(p)}</span>
      <span class="fmen"><i style="width:${Math.round(p.en)}%;background:${energyCol(p.en)}"></i></span></div>`;};
  return `<div class="card fmstrip"><div class="fmsi"><b>Skład</b><div class="small mut">Zmian zostało <b style="color:var(--txt)">${a.subs}</b></div><div class="small mut">Czasów zostało <b style="color:var(--txt)">${a.to}</b></div><div class="small mut">Kliknij, by zmienić</div></div>${on.map(mine).join('')}</div>`;}
// ---- pasek górny ----
function fmTop(m){const [a,b]=m.sides;const kc=kitColors(m);const sp=[[1600,'0,5x'],[800,'1x'],[250,'2x'],[50,'4x']];
  const curSp=sp.findIndex(x=>x[0]===ui.speed);const nxt=sp[(Math.max(0,curSp)+1)%sp.length][0];
  const chip=(i)=>`<span class="fmchip" style="background:${kc[i]};color:${lum(kc[i])>0.6?'#111':'#fff'}">${esc(m.sides[i].team.short)}</span>`;
  return `<div class="card fmtop">
   <div class="fmtl">${m.over?'':`<button class="ghost sm ${ui.fmPanel==='tac'?'on':''}" onclick="ui.fmPanel=ui.fmPanel==='tac'?null:'tac';render()">📋 Taktyka</button>
     <button class="ghost sm tobtn ${ui.toReq?'on':''}" ${a.to<=0||ui.to?'disabled':''} onclick="myTimeout()">${ui.toReq?'⏱ Czas po akcji…':`⏱ Czas (${a.to})`}</button>
     <button class="ghost sm ${ui.fmPanel==='stats'?'on':''}" onclick="ui.fmPanel=ui.fmPanel==='stats'?null:'stats';render()">📊 Statystyki</button>
     <button class="ghost sm ${ui.asstOpen?'on':''}" onclick="ui.asstOpen=ui.asstOpen?0:1;render()">💬 Asystent</button>`}</div>
   <div class="fmsc"><span class="fmset">${m.over?'KONIEC':'SET '+m.setNo}</span>${chip(0)}<b class="fmsw">${m.setsWon[0]}</b>
     <b class="fmpt ${m.serving===0&&!m.over?'srv':''}">${m.over?'–':m.score[0]}</b><span class="fmcol">:</span><b class="fmpt ${m.serving===1&&!m.over?'srv':''}">${m.over?'–':m.score[1]}</b>
     <b class="fmsw">${m.setsWon[1]}</b>${chip(1)}
     <span class="fmsets small mut">${m.sets.map(s=>`${s[0]}:${s[1]}`).join(' · ')}</span></div>
   <div class="fmtr2">${m.over?'':`<button class="ghost sm" onclick="setSpeed(${nxt})" title="Prędkość">⏩ ${curSp>=0?sp[curSp][1]:'1x'}</button>
     <button class="ghost sm ${ui.fmPanel==='more'?'on':''}" onclick="ui.fmPanel=ui.fmPanel==='more'?null:'more';render()" aria-label="Więcej">⋯</button>`}</div></div>`;}
function fmPanel(m){const a=m.sides[0];
  if(ui.fmPanel==='tac')return `<div class="card fmpanel"><div class="row wrap" style="gap:12px">
    <label class="small">Zagrywka <select onchange="setServe(+this.value)">${SERVE_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.serve===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <label class="small">Rozegranie <select onchange="setDist(+this.value)">${DIST_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.dist===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <span class="small mut">${esc(SERVE_OPT[a.tactics.serve][1])} ${esc(DIST_OPT[a.tactics.dist][1])}</span></div>
    ${distQHtml(a.tactics)}
    <div class="tacgrid wide">${atkTacHtml(a.tactics)}</div>
    <div class="tacgrid">${tgtTacHtml(m)}${srvTacRows(a.tactics,a.pl)}${shieldTacHtml(a.tactics,a.pl)}${freeTacHtml(a.tactics)}${p1TacHtml(a.tactics)}</div><div class="tacgrid wide">${blockTacHtml(a.tactics)}</div>${rotCard(m)}</div>`;
  if(ui.fmPanel==='more')return `<div class="card fmpanel"><div class="row wrap" style="gap:6px">
    <button class="ghost sm" onclick="ui.fmPanel=null;simToSetEnd()">⏭ Do końca seta</button><button class="ghost sm" onclick="ui.fmPanel=null;simToEnd()">⏭⏭ Do końca meczu</button>
    ${typeof sndBtn==='function'?sndBtn():''}<button class="ghost sm" onclick="ui.mview=ui.mview==='klasyczny'?'hala':'klasyczny';ui.fmPanel=null;render()">${ui.mview==='klasyczny'?'🏟️ Widok hali':'▦ Widok klasyczny'}</button>${v3dCan()&&ui.mview!=='klasyczny'?`<button class="ghost sm" onclick="v3dToggle()" title="Przełącz widok hali: 3D / 2D">${ui.v3d?'🏐 Hala 2D':'🎮 Hala 3D'}</button>`:''}
    <button class="ghost sm ${ui.anim!==false?'on':''}" onclick="ui.anim=ui.anim===false;render()">🏐 Animacja: ${ui.anim!==false?'wł.':'wył.'}</button>
    <span class="small mut">Libero: <b style="color:var(--txt)">${esc(a.libero.last)}</b> <button class="link" onclick="selSub('L')">zmień</button></span></div></div>`;
  if(ui.fmPanel==='asst'){ui.fmPanel=null;ui.asstOpen=1;}
  if(ui.fmPanel==='stats')return `<div class="card fmpanel">${statsBlock(m)}</div>`;
  if(ui.fmPanel==='ana')return `<div class="card fmpanel"><h3 style="margin-top:0">Analityk: kierunki ataków zawodników</h3><div class="shares"><div><div class="mut small">${esc(m.sides[1].team.name)} (rywal)</div>${anaTable(m,1)}</div><div><div class="mut small">${esc(m.sides[0].team.name)}</div>${anaTable(m,0)}</div></div></div>`;
  return '';}
function fmLiveView(subPanel){const m=ui.match;
  return `${fmTop(m)}${fmPanel(m)}
  ${ui.talk&&!m.over?talkCard(m):ui.to&&ui.to.kind==='set'&&!m.over?`<div class="card talk"><div class="row"><h3 style="margin:0">🔄 Przerwa po ${ui.to.setNo}. secie</h3><span class="sp"></span><button class="ghost" onclick="ui.talk=true;render()">🗣️ Przemowa</button><button class="btn" onclick="endTimeout()">⏩ Zaczynamy ${m.setNo}. seta</button></div>${setSummary(m)}${setLuPanel(m)}</div>`:''}
  ${m.over?`<div class="card row"><b>Mecz zakończony: ${esc(m.sides[m.winner].team.name)} wygrywa ${Math.max(...m.setsWon)}:${Math.min(...m.setsWon)}</b><span class="sp"></span><button class="btn" onclick="ui.view='post';render()">Podsumowanie</button><button class="ghost" onclick="ui.match=null;render()">Dalej</button></div>`:''}
  <div class="fmwrap"><div class="fmlay">
   <div class="fml">${fmFormation(m,0)}${fmAssistant(m)}${fmAnalyst(m)}</div>
   <div class="fmc">
    <div class="card fmcourt">${fmTeamStats(m,0)}<div class="fmcv">
      ${ui.mview==='klasyczny'?courtHtml(m):`<div class="hallbar small mut">🏟️ ${tName(m.homeIdx!=null?m.homeIdx:m.sides[0].team.idx)} · <b style="color:var(--txt)">${(m.att||0).toLocaleString('pl-PL')}</b> / ${(m.cap||0).toLocaleString('pl-PL')} widzów · <span class="mcom ${m.comm&&m.comm.w!=null?(m.comm.w===0?'me':'op'):''}">${m.comm?esc(m.comm.t):''}</span><span id="mph" class="mph">${ui.to?'Czas':m.over?'Koniec meczu':'Przed zagrywką'}</span></div>${toBanner(m)}<canvas id="mcv" class="mcv"></canvas>${v3dOn()?'<div id="m3d" class="m3d"><span class="m3dload">Wczytywanie widoku 3D…</span></div>':''}`}
      ${m.over?'':`<div class="fmctl">${ui.to?`<button class="btn fmbig go" onclick="endTimeout()">↩ Wracamy na boisko</button>`:`<button class="btn ppbtn fmbig ${m.paused?'go':''}" onclick="togglePause()">${m.paused?'▶ Graj':'⏸ Pauza'}</button>`}<button class="ghost sm tobtn ${ui.toReq?'on':''}" ${m.sides[0].to<=0||ui.to?'disabled':''} onclick="myTimeout()">${ui.toReq?'⏱ Czas po akcji…':`⏱ Czas (${m.sides[0].to})`}</button><span class="small mut">Spacja = pauza</span></div>${shoutBar(m)}`}</div>${fmTeamStats(m,1)}</div>
    <div class="fmws one">${fmMomentum(m)}</div>
   </div>
   <div class="fmr">${fmFormation(m,1)}${fmPlayerStats(m,0)}${fmPlayerStats(m,1)}</div>
  </div>
  ${fmStrip(m)}
  ${m.over?'':fmBench(m)}
  ${subPanel?`<div class="fmsub">${subPanel}</div>`:''}</div>`;}

// ---- statystyki zawodników pod formacją ----
function fmPlayerStats(m,i){const sd=m.sides[i];const onIds=new Set(onCourt(sd,m.serving===i).map(e=>e.p.id));
  const ps=sd.pl.filter(p=>onIds.has(p.id)||p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0)
    .sort((a,b)=>(onIds.has(b.id)-onIds.has(a.id))||((b.st.kill+b.st.blk+b.st.ace)-(a.st.kill+a.st.blk+a.st.ace)));
  return `<div class="card fmside2 fmps-card"><div class="fmh"><b>Statystyki: ${esc(sd.team.short)}</b><span class="small mut">${i===0?'Twoja drużyna':'rywal'}</span></div>
   <table class="fmpt-t"><thead><tr><th class="l">Zawodnik</th><th title="Punkty: atak + blok + as">Pkt</th><th title="Skończone ataki / wszystkie">Atak</th><th title="Przyjęcie pozytywne">Prz+</th><th title="Obrony">Obr</th><th title="Bloki">Bl</th><th title="Asy">As</th><th title="Błędy: atak, zagrywka, przyjęcie">Bł.</th><th title="Ataki w kierunek zadany przez trenera (prosta / skos)">Kier.</th></tr></thead><tbody>
   ${ps.map(p=>{const x=p.st;const err=x.attErr+x.srvErr+x.recErr;return `<tr class="${onIds.has(p.id)?'':'off'}"><td class="l"><span class="mut">${p.num}</span> ${esc(p.last)}</td><td><b>${x.kill+x.blk+x.ace}</b></td><td>${x.att?`${x.kill}/${x.att}`:'–'}</td><td>${x.rec?pc(x.recPos,x.rec):'–'}</td><td>${x.dig||'–'}</td><td>${x.blk||'–'}</td><td>${x.ace||'–'}</td><td class="${err?'bad':''}">${err||'–'}</td><td>${x.dA?pc(x.dH,x.dA):'–'}</td></tr>`;}).join('')}
   </tbody></table></div>`;}
// ---- ławka rezerwowych z umiejętnościami ----
const POS_KEYS3={R:['roz','zag','kiw'],P:['prz','ata','kiw'],A:['ata','blo','kiw'],S:['blo','czy','ata'],L:['prz','obr','czy']};
const attrShort=k=>(ALL_ATTRS.find(a=>a[0]===k)||[k,k,k])[2];
const attrCol=v=>v>=16?'#22c55e':v>=12?'#a3e635':v>=8?'#eab308':'#ef4444';
// specjalne zmiany: na zagrywkę i podwójna (rozgrywający + atakujący)
function fmSpecialSubs(m){const a=m.sides[0];if(m.over)return '';const sv=a.slots[nextServerSlot(m,0)].p;const cs=canServeSub(m,0),cd=canDblSub(m,0);const dc=dblCands(a);
  let st='';if(a.srvSub)st=`Na zagrywce: <b>${esc(a.slots[a.srvSub.si].p.last)}</b> — ${esc((a.pl.find(p=>p.id===a.srvSub.out)||{}).last||'')} wróci, gdy stracimy punkt${a.srvSub.on?'':' (po jego zagrywce)'}.`;
  else if(a.dbl)st=`Podwójna zmiana: trzech atakujących pod siatką. Rozgrywający i atakujący z wyjściowego składu wrócą, gdy rozgrywający z ławki przejdzie do pierwszej linii.`;
  if(st)return `<div class="fmspec"><div class="small" style="margin-top:4px">${st}</div></div>`;
  return `<div class="fmspec"><div class="row wrap" style="gap:6px"><button class="ghost sm" onclick="${cs?'':`ui.subSel='srv';render()`}" title="${esc(cs||'')}">🏐 Na zagrywkę za ${esc(sv.last)}</button><button class="ghost sm" onclick="${cd?'':'doDblSub()'}" title="${esc(cd||'')}">⇄ Podwójna zmiana${dc?` (${esc(dc[0].last)} + ${esc(dc[1].last)})`:''}</button></div>
   <div class="small mut" style="margin-top:4px">${st||((cs&&cd)?`Na zagrywkę: ${esc(cs)} Podwójna: ${esc(cd)}`:'Specjalista od zagrywki wraca na ławkę po stracie punktu. Podwójna zmiana działa, gdy rozgrywający jest w pierwszej linii.')}</div></div>`;}
function fmBench(m){const a=m.sides[0];const bench=benchOf(a);if(!bench.length)return '';
  const sel=ui.subSel;const srvM=sel==='srv';const need=sel==null||srvM?null:sel==='L'?'L':a.slots[sel].role;
  const ord={R:0,A:1,P:2,S:3,L:4};
  const list=bench.slice().sort((x,y)=>(need?(x.pos===need?0:1)-(y.pos===need?0:1):0)||ord[x.pos]-ord[y.pos]||rating(y)-rating(x));
  return `<div class="card fmbench ${sel!=null?'subbing':''}"><div class="fmsi"><b>Ławka</b><div class="small mut">${srvM?`Wybierz, kto wejdzie <b>na zagrywkę</b> za: <b style="color:var(--acc)">${esc(a.slots[nextServerSlot(m,0)].p.last)}</b>`:sel!=null?`Wybierz, kto wchodzi za: <b style="color:var(--acc)">${esc((sel==='L'?a.libero:a.slots[sel].p).last)}</b>`:'Kliknij zawodnika, by zobaczyć kartę'}</div>${sel!=null?`<button class="ghost sm" onclick="ui.subSel=null;render()">Anuluj</button>`:''}</div>${fmSpecialSubs(m)}
   ${list.map(p=>{const fit=need&&p.pos===need;const inj=p.inj>0;
     const fitS=srvM&&p.pos!=='L'&&p.pos!=='R';
     return `<div class="fmbp clk ${fit||fitS?'fit':''} ${inj?'inj':''}" onclick="${sel!=null&&!inj&&(!srvM||fitS)?`doSub('${p.id}')`:`openPop('${p.id}')`}" title="${esc(p.first+' '+p.last)} · ${POS_NAMES[p.pos]} · ${p.age} lat">
      <div class="fmbh"><span class="fmj" style="width:26px;height:26px;font-size:12px;background:${p.pos==='L'?libColor(kitColors(m)[0],'#000'):kitColors(m)[0]};color:${lum(p.pos==='L'?libColor(kitColors(m)[0],'#000'):kitColors(m)[0])>0.6?'#111':'#fff'}">${p.num}</span>
       <div class="fmbn"><b class="fmnm">${esc(shortN(p))}</b><span class="fmps2">${pTag(p.pos)} · ${p.age} l.</span></div><span class="fmov" title="Ocena ogólna">${rating(p)}</span></div>
      <div class="fmattrs">${POS_KEYS3[p.pos].map(k=>`<span title="${esc((ALL_ATTRS.find(x=>x[0]===k)||[])[1]||k)}"><small>${attrShort(k)}</small><b style="color:${attrCol(p[k])}">${p[k]}</b></span>`).join('')}</div>
      ${inj?'<div class="small bad">kontuzja</div>':`<span class="fmen" style="width:100%"><i style="width:${Math.round(p.en)}%;background:${energyCol(p.en)}"></i></span>`}</div>`;}).join('')}</div>`;}
// ================= TAKTYKA: BLOK, OBRONA, PIŁKI SYTUACYJNE, CEL ZAGRYWKI =================
const BLK_OPT=[['Skos','Blok zamyka skos.'],['Zrównoważony','Blokujący czytają atak.'],['Prosta','Blok zamyka prostą.']];
const MID_OPT=[['Prosto','Blok zamyka środek boiska.'],['Zrównoważony','Blokujący czyta atak.'],['Skos na 5','Blok zamyka skos na strefę 5 (lewą).'],['Skos na 1','Blok zamyka skos na strefę 1 (prawą).']];
const MID_ORDER=[1,0,2,3];
const B3_OPT=[['Podwójny','Dwóch blokuje, trzeci asekuruje za blokiem.'],['Potrójny przy wysokiej piłce','Gdy rywal źle wystawi: trzech w bloku.'],['Zawsze potrójny na skrzydłach','Najmocniejszy blok na skrzydłach, ale odsłania środek i nikt nie asekuruje kiwek.']];
function midDefTxt(v){return v===0?'Obrońcy wychodzą z linii bloku: strefy 5 i 1 bronią skosów, szóstka cofa się poza cień bloku.':v===2?'Blok zamyka stronę stref 5 i 6: obrońca strefy 5 wychodzi na krótki skos, szóstka i strefa 1 kryją drugą stronę boiska.':v===3?'Blok zamyka skos na strefę 1: obrona kryje przeciwny skos (strefa 5) i środek.':'Obrona standardowa, środkowy czyta kierunek ataku.';}
const FREE_OPT=[['Na środek boiska','Między zawodników: możliwe nieporozumienie rywala.'],['Na rozgrywającego','Rozgrywający musi przyjąć, wystawia ktoś inny.'],['Na środkowego','Środkowy przyjmuje, więc nie zaatakuje szybkiej piłki.']];
function defTxt(side,v,t){t=t||{};const rot=t.dsys===1;const tip=!!t[side==='L'?'tipL':'tipR'];
  const lz=side==='L'?'Libero / środkowy (strefa 5)':'Rozgrywający / atakujący (strefa 1)';const off=side==='L'?'strefy 2':'strefy 4';
  if(v===0)return `Blok zamyka skos. Szóstka przechodzi na głęboką prostą, ${lz.toLowerCase()} zostaje w głębi prostej, a gracz ze ${off} schodzi pod blok na kiwkę.`;
  if(v===2)return rot?`Obrona rotacyjna: ${lz.toLowerCase()} wychodzi pod blok, szóstka cofa się w róg prostej za jego plecy, obrońca skosu przesuwa się na środek.`
    :tip?`Blok zamyka prostą. Kiwkę pod blokiem łapie gracz ze ${off}, ${lz.toLowerCase()} zostaje w głębi prostej, szóstka broni głębokiego skosu.`
    :`Blok zamyka prostą. ${lz} wychodzi pod blok (kiwki, piłki po bloku), szóstka broni głębokiego skosu, gracz ze ${off} krótkiego skosu.`;
  return `Blok staje w kierunku ataku. ${lz} broni w głębi prostej, gracz ze ${off} schodzi pod blok, szóstka czyta grę: głęboki skos albo prosta.`;}
function tipBtn(k,t,lab){const on=!!t[k];return `<button class="tipt ${on?'on':''}" onclick="tacSet('${k}',${on?0:1})" title="Jeden zawodnik stale asekuruje kiwkę pod blokiem. Mniej punktów z kiwek rywala, ale trochę mniej obrońców w głębi.">${on?'✓ ':''}+ kiwka${lab?' '+lab:''}</button>`;}
function setPreset(k){const t=myTac();const P={pl:{dsys:0,blkL:1,blkR:1,blkM:2,blk3:1,tipL:0,tipR:0,tipM:0}}[k];if(!P)return;Object.assign(t,P);save();if(ui.match&&!ui.match.over)Object.assign(ui.match.sides[0].tactics,P);render();}
function tacSet(k,v){const t=myTac();t[k]=v;save();if(ui.match&&!ui.match.over)ui.match.sides[0].tactics[k]=v;render();}
function setBlk(side,v){if(side==='B'){tacSet('blkL',v);tacSet('blkR',v);}else tacSet(side==='L'?'blkL':'blkR',v);}
function setTgt(id){if(!ui.match)return;ui.match.sides[0].tactics.tgt=id||null;persistLive();render();}
function segBtns(cur,fn){return `<div class="seg">${BLK_OPT.map((o,i)=>`<button class="${(cur??1)===i?'on':''}" onclick="${fn}(${i})" title="${esc(o[1])}">${o[0]}</button>`).join('')}</div>`;}
function blockTacHtml(t){const rot=t.dsys===1;return `
  <div class="tacrow"><div class="tacl"><b>System obrony</b><small class="mut">pozycja wyjściowa i ruch obrońców</small></div><div class="seg"><button class="${rot?'':'on'}" onclick="tacSet('dsys',0)">„Diament”</button><button class="${rot?'on':''}" onclick="tacSet('dsys',1)">Rotacyjna</button></div>
   <div class="small mut tacd">${rot?'Przy bloku na prostą obrońca prostej wychodzi pod blok, a szóstka chowa się za jego plecy w rogu boiska. Mocniej przeciw piłkom po bloku, słabiej przeciw głębokiemu skosowi.':'Obrońcy startują z „diamentu” (strefy 1 i 5 ok. 4,5 m od siatki, szóstka ok. 7 m) i przechodzą na pozycje zależne od ustawienia bloku. Nikt nie stoi w cieniu bloku.'}</div></div>
  <div class="tacrow"><div class="tacl"><b>Blok — lewa strona siatki</b><small class="mut">przeciw atakującemu rywala (jego prawe skrzydło)</small></div><div class="row wrap" style="gap:6px">${segBtns(t.blkL,"setBlk.bind(null,'L')")}${tipBtn('tipL',t)}</div><div class="small mut tacd">${defTxt('L',t.blkL??1,t)}</div></div>
  <div class="tacrow"><div class="tacl"><b>Blok — prawa strona siatki</b><small class="mut">przeciw przyjmującemu rywala (jego lewe skrzydło)</small></div><div class="row wrap" style="gap:6px">${segBtns(t.blkR,"setBlk.bind(null,'R')")}${tipBtn('tipR',t)}</div><div class="small mut tacd">${defTxt('R',t.blkR??1,t)}</div></div>
  <div class="tacrow"><div class="tacl"><b>Blok — środek siatki</b><small class="mut">przeciw szybkiej piłce i atakowi z drugiej linii</small></div><div class="row wrap" style="gap:6px"><div class="seg">${MID_ORDER.map(i=>`<button class="${(t.blkM??1)===i?'on':''}" onclick="tacSet('blkM',${i})" title="${esc(MID_OPT[i][1])}">${MID_OPT[i][0]}</button>`).join('')}</div>${tipBtn('tipM',t)}</div><div class="small mut tacd">${midDefTxt(t.blkM??1)}${t.tipM?' Gracze pierwszej linii, którzy nie blokują, stoją bliżej siatki i łapią kiwki.':''}</div></div>
  <div class="tacrow"><div class="tacl"><b>Środkowy w bloku</b><small class="mut">reakcja na rozegranie rywala</small></div><div class="seg"><button class="${t.mCom?'':'on'}" onclick="tacSet('mCom',0)">Czyta grę</button><button class="${t.mCom?'on':''}" onclick="tacSet('mCom',1)">W ciemno na krótką</button></div><div class="small mut tacd">${t.mCom?'Środkowy skacze razem ze środkowym rywala: krótka częściej wpada w blok, ale przy ataku ze skrzydła często nie zdąży i zostaje pojedynczy blok (wtedy idzie asekurować kiwkę). Dobry rozgrywający rywala to widzi i rzadziej gra krótką. Najlepsze na drużyny grające dużo środkiem.':'Środkowy czeka na wystawę i dopiero wtedy biegnie do bloku. Bezpieczniejszy podwójny blok na skrzydłach, ale dobry rozgrywający rywala potrafi go zmylić i zostawić atakującemu pojedynczy blok.'}</div></div>
  <div class="tacrow"><div class="tacl"><b>Liczba blokujących</b><small class="mut">blok podwójny czy potrójny</small></div><select onchange="tacSet('blk3',+this.value)">${B3_OPT.map((o,i)=>`<option value="${i}" ${(t.blk3||0)===i?'selected':''}>${o[0]}</option>`).join('')}</select><div class="small mut tacd">${esc(B3_OPT[t.blk3||0][1])}${(t.blk3||0)>0?' Przy potrójnym bloku z „+ kiwka” kiwkę łapie obrońca prostej, który wychodzi pod blok.':''}</div></div>
  <div class="row wrap small" style="gap:8px;align-items:center"><button class="ghost sm" onclick="setPreset('pl')">★ Ustaw jak najczęściej w PlusLidze</button><span class="mut">„Diament”, blok w kierunek ataku na skrzydłach, środek zamyka stronę stref 5/6, potrójny przy wysokiej piłce.</span></div>
  <div class="small mut">Obie strony naraz: ${BLK_OPT.map((o,i)=>`<button class="link" onclick="setBlk('B',${i})">${o[0].toLowerCase()}</button>`).join(' · ')}.</div>`;}
const SZ_OPT=[['Auto','Zagrywający sami wybierają strefę.'],['Strefa 1','Prawa strona przyjęcia. Gdy rozgrywający jest w drugiej linii, musi obiec przyjmującego: gorsze przyjęcie.'],['Strefa 6','Środek boiska: zwykle przyjmuje libero. Mniej błędów zagrywki, ale łatwiejsze przyjęcie.'],['Strefa 5','Lewa strona: przyjmuje przyjmujący z pierwszej linii, który zaraz potem musi atakować (słabszy atak).'],['Skrót','Krótko za siatkę: słabsza zagrywka i więcej błędów, ale przyjmujący stoją głęboko (zwłaszcza na zagrywkę z wyskoku), a przyjmujący z pierwszej linii atakuje słabiej.'],['Między dwóch','W szparę między dwóch przyjmujących: test komunikacji, czasem nikt nie przyjmie i jest as.']];
function srvZTacHtml(t){const v=t.srvZ||0;return `<div class="tacrow"><div class="tacl"><b>Strefa zagrywki</b><small class="mut">dokąd celują zagrywający</small></div><div class="seg">${SZ_OPT.map((o,i)=>`<button class="${v===i?'on':''}" onclick="tacSet('srvZ',${i})">${o[0]}</button>`).join('')}</div><div class="small mut tacd">${esc(SZ_OPT[v][1])}${v?' Celowanie trochę zwiększa ryzyko błędu u słabiej zagrywających.':''}</div></div>`;}
function srvRiskTacHtml(t,pl){const sel=t.srvRisk||[];const ps=pl.filter(p=>p.pos!=='L').slice().sort((a,b)=>b.zag-a.zag);
  return `<div class="tacrow trisk"><div class="tacl"><b>Mogą ryzykować</b><small class="mut">maks. 2 zawodników</small></div><div class="seg">${ps.map(p=>{const on=sel.includes(p.id);return `<button class="${on?'on':''}" title="${esc(POS_NAMES[p.pos]||'')}" onclick="toggleRisk('${p.id}')">${on?'✓ ':''}${p.num?p.num+' ':''}${esc(p.last)} · ${SRV_T[srvType(p)]}</button>`;}).join('')}</div><div class="small mut tacd">${sel.length?'Wybrani zawsze zagrywają ryzykownie (więcej asów i błędów), reszta według ustawienia ryzyka.':'Nikt nie jest wyznaczony: wszyscy zagrywają według ustawienia ryzyka.'} Przy nazwisku: naturalny typ zagrywki.</div></div>`;}
function toggleRisk(id){const t=myTac();let a=(t.srvRisk||[]).slice();if(a.includes(id))a=a.filter(x=>x!==id);else{a.push(id);if(a.length>2)a.shift();}tacSet('srvRisk',a);}
function srvSafeTacHtml(t){const v=t.srvSafe?1:0;return `<div class="tacrow"><div class="tacl"><b>Po asie lub błędzie zagrywki</b><small class="mut">następna zagrywka tej drużyny</small></div><div class="seg"><button class="${v?'':'on'}" onclick="tacSet('srvSafe',0)">Bez zmian</button><button class="${v?'on':''}" onclick="tacSet('srvSafe',1)">Bezpieczna</button></div><div class="small mut tacd">${v?'Po asie: bezpieczna zagrywka znów w tego samego przyjmującego. Po błędzie: następna zagrywka bezpieczna. Mniej serii błędów, ale też mniej serii asów.':'Każdy zagrywa według ustawień, niezależnie od poprzedniej zagrywki.'}</div></div>`;}
function srvShkTacHtml(t){const v=t.shk?1:0;return `<div class="tacrow"><div class="tacl"><b>Roztrzęsiony przyjmujący</b><small class="mut">po jego błędzie w przyjęciu</small></div><div class="seg"><button class="${v?'':'on'}" onclick="tacSet('shk',0)">Wg zawodnika</button><button class="${v?'on':''}" onclick="tacSet('shk',1)">Celuj w niego</button></div><div class="small mut tacd">${v?'Polecenie: zagrywamy w przyjmującego, który właśnie się pomylił. Opłaca się głównie przeciw rywalom z nerwowymi przyjmującymi (sprawdź charakter przyjmujących w ich kartach); przeciw spokojnym daje niewiele, a celowana zagrywka to trochę więcej błędów. Indywidualiści nie zawsze słuchają.':'Zagrywający sam decyduje: im lepsze Czytanie gry, tym częściej wyczuje, że rywal się posypał.'}</div></div>`;}
function shieldTacHtml(t,pl){const ps=pl.filter(p=>p.pos==='P');const v=t.shield||null;
  return `<div class="tacrow"><div class="tacl"><b>Osłoń przyjmującego</b><small class="mut">libero bierze więcej zagrywek</small></div><div class="seg"><button class="${v?'':'on'}" onclick="tacSet('shield',null)">Nikt</button>${ps.map(p=>`<button class="${v===p.id?'on':''}" title="Opanowanie ${p.opa}${p.tr&&p.tr.includes('ner')?' · nerwowy':''}" onclick="tacSet('shield','${p.id}')">${v===p.id?'✓ ':''}${p.num?p.num+' ':''}${esc(p.last)}${p.tr&&p.tr.includes('ner')?' 😰':''}</button>`).join('')}</div><div class="small mut tacd">${v?'Wybrany przyjmujący dostaje ok. 25% mniej zagrywek, bo libero i drugi przyjmujący biorą większy obszar. Koszt: trochę słabszy atak z drugiej linii.':'Zagrywki rozkładają się normalnie. Osłoń nerwowego albo słabo przyjmującego, gdy rywal w niego celuje.'}</div></div>`;}
function srvTacRows(t,pl){return srvZTacHtml(t)+srvRiskTacHtml(t,pl)+srvSafeTacHtml(t)+srvShkTacHtml(t);}
const P1SW_OPT=[['Zostaje na lewym','Tak gra większość drużyn. Atakujący atakuje z lewego skrzydła, a przyjmujący z prawego: obaj poza swoją pozycją, więc atak jest słabszy, a blok rywala ma łatwiej.'],['Zamiana na prawe','Atakujący przebiega 9 m wzdłuż siatki i atakuje na swojej pozycji z prawego skrzydła. Przy mocnej zagrywce rywala często nie zdąży (pomaga szybkość) i wtedy nie bierze udziału w ataku.']];
function p1TacHtml(t){const v=t.p1sw?1:0;return `<div class="tacrow"><div class="tacl"><b>Atakujący w ustawieniu R1</b><small class="mut">gdy przyjmujemy zagrywkę, a rozgrywający jest w strefie 1</small></div><div class="seg">${P1SW_OPT.map((o,i)=>`<button class="${v===i?'on':''}" onclick="tacSet('p1sw',${i})">${o[0]}</button>`).join('')}</div><div class="small mut tacd">${esc(P1SW_OPT[v][1])}</div></div>`;}
function freeTacHtml(t){return `<div class="tacrow"><div class="tacl"><b>Piłki sytuacyjne</b><small class="mut">gdy nie da się zaatakować: przebicie</small></div>
  <select onchange="tacSet('free',+this.value)">${FREE_OPT.map((o,i)=>`<option value="${i}" ${(t.free||0)===i?'selected':''}>${o[0]}</option>`).join('')}</select><div class="small mut tacd">${esc(FREE_OPT[t.free||0][1])} Przy złej wystawie zawodnicy z dobrą kiwką częściej kiwają zamiast przebijać.</div></div>`;}
function tgtTacHtml(m){const t=m.sides[0].tactics;const opp=m.sides[1];const ord={L:0,P:1,A:2,R:3,S:4};
  const ps=opp.pl.slice().sort((a,b)=>ord[a.pos]-ord[b.pos]);
  return `<div class="tacrow"><div class="tacl"><b>Zagrywka w zawodnika</b><small class="mut">ok. 60% zagrywek, gdy jest w przyjęciu</small></div>
  <select onchange="setTgt(this.value)"><option value="">Automatycznie</option>${ps.map(p=>`<option value="${p.id}" ${t.tgt===p.id?'selected':''}>${p.num} ${esc(p.last)} (${POS_SHORT[p.pos]}${p.pos==='P'||p.pos==='L'?`, przyj. ${p.prz}`:''})</option>`).join('')}</select>
  <div class="small mut tacd">Celowanie zwiększa ryzyko błędu u słabiej zagrywających.</div></div>`;}
// ================= ANALITYK =================
function anaSkill(){const s=SAVE.staff&&SAVE.staff.sta;return s?s.skill:0;}
function anaName(){const s=SAVE.staff&&SAVE.staff.sta;return s?`${s.first||''} ${s.last||''}`.trim():'';}
// dane kierunków z dokładnością zależną od analityka
function anaData(m,i){const sk=anaSkill();let ds=(m.dirStats||[]).filter(d=>d.i===i&&d.d!=='free');
  if(sk>0&&sk<9)ds=ds.slice(0,Math.floor(ds.length/6)*6);
  const step=sk>=15?1:sk>=9?5:10;
  const noise=(k)=>{if(sk>=15)return 0;let h=m.setNo*7+k.length*13+i*31;return ((h%7)-3)*(sk>=9?1:3);};
  const rnd=v=>Math.max(0,Math.min(100,Math.round(v/step)*step));
  const agg=(xs,key)=>{const n=xs.length;if(!n)return null;const c=xs.filter(d=>d.d==='cross').length,l=xs.filter(d=>d.d==='line').length,t=xs.filter(d=>d.d==='tip').length,mi=xs.filter(d=>/^mid/.test(d.d)).length,mS=xs.filter(d=>d.d==='midS').length,mL=xs.filter(d=>d.d==='midL').length,mR=xs.filter(d=>d.d==='midR').length,k=xs.filter(d=>d.r==='kill').length;
    const cr=rnd(c/n*100+noise(key)),ln=rnd(l/n*100-noise(key));return {n,cross:c?cr:0,line:l?ln:0,tip:rnd(t/n*100),mid:rnd(mi/n*100),mS:rnd(mS/n*100),mL:rnd(mL/n*100),mR:rnd(mR/n*100),kill:rnd(k/n*100),rawC:c/(c+l||1)};};
  const wings={L4:agg(ds.filter(d=>d.w==='L4'),'L4'),R2:agg(ds.filter(d=>d.w==='R2'),'R2'),M:agg(ds.filter(d=>d.w==='M'),'M')};
  const sd=m.sides[i];const ids=[...new Set(ds.map(d=>d.id))];
  const pl=ids.map(id=>{const p=sd.pl.find(x=>x.id===id);const xs=ds.filter(d=>d.id===id);return {p,w:xs[0].w,...agg(xs,id)};}).filter(x=>x.p&&x.n>=2).sort((a,b)=>b.n-a.n);
  return {sk,wings,pl,n:ds.length};}
function anaAdvice(m){const sk=anaSkill();if(sk<9)return null;const D=anaData(m,1);const t=m.sides[0].tactics;
  for(const [w,key,side,who] of [['L4','blkR','R','przyjmujący'],['R2','blkL','L','atakujący']]){const x=D.wings[w];if(!x||x.n<(sk>=15?6:9))continue;
    const best=x.rawC>=0.62?0:x.rawC<=0.38?2:null;if(best==null||(t[key]??1)===best)continue;
    const pp=sk>=15?D.pl.filter(q=>q.w===w)[0]:null;
    const src=pp&&pp.n>=4?pp:x;return {k:'ana'+w+best+m.setNo,t:`Analityk: ${pp&&pp.n>=4?esc(pp.p.last)+' ('+who+')':who+' rywala'} bije ${best===0?'po skosie':'po prostej'} w ${best===0?src.cross:src.line}% ataków. Ustaw blok „${BLK_OPT[best][0].toLowerCase()}” na ${side==='L'?'lewej':'prawej'} stronie siatki.`,btn:`Blok ${BLK_OPT[best][0].toLowerCase()} (${side==='L'?'lewa':'prawa'})`,act:`setBlk('${side}',${best})`};}
  const x=D.wings.M;if(x&&x.n>=(sk>=15?6:9)){const arr=[['midS',0,x.mS,'prosto'],['midL',2,x.mL,'skos na strefę 5'],['midR',3,x.mR,'skos na strefę 1']].sort((a,b)=>b[2]-a[2]);const b=arr[0];
    if(b[2]>=55&&(t.blkM??1)!==b[1])return {k:'anaM'+b[1]+m.setNo,t:`Analityk: ataki rywala ze środka idą głównie ${b[3]} (${b[2]}%). Ustaw blok na środku: „${MID_OPT[b[1]][0].toLowerCase()}”.`,btn:`Blok środek: ${MID_OPT[b[1]][0].toLowerCase()}`,act:`tacSet('blkM',${b[1]})`};}
  return null;}
function anaBars(m,i,D){const kc=kitColors(m)[i];if(!D.n)return '<div class="small mut">Jeszcze bez ataków.</div>';
  if(!D.sk){const x=[['L4','PRZ'],['R2','ATA']].map(([w,r])=>{const v=D.wings[w];if(!v||v.n<5)return '';return `${r}: ${v.rawC>0.55?'raczej skos':v.rawC<0.45?'raczej prosta':'po równo'}`;}).filter(Boolean).join(' · ');return `<div class="small mut">${x||'Za mało danych.'}</div>`;}
  const row=(w,l)=>{const v=D.wings[w];if(!v)return '';
    if(w==='M')return `<div class="anarow"><span class="mut">${l} <small>(${v.n})</small></span><span class="small">prosto <b>${v.mS}%</b> · skos 5 <b>${v.mL}%</b> · skos 1 <b>${v.mR}%</b>${v.tip?` · kiwka ${v.tip}%`:''}</span></div>`;
    const tot=Math.max(1,v.cross+v.line+v.tip);
    return `<div class="anarow"><span class="mut">${l} <small>(${v.n})</small></span><span class="anab"><i style="width:${v.cross/tot*100}%;background:${kc}" title="skos"></i><i style="width:${v.line/tot*100}%;background:${kc};opacity:.45" title="prosta"></i><i style="width:${v.tip/tot*100}%;background:#8b99b6" title="kiwka"></i></span><span class="small"><b>${v.cross}%</b> skos · <b>${v.line}%</b> prosta${v.tip?` · ${v.tip}% kiwka`:''}</span></div>`;};
  return row('L4','PRZ (lewe skrzydło)')+row('R2','ATA (prawe skrzydło)')+row('M','Środek / pipe');}
function fmAnalyst(m){const sk=anaSkill();const D1=anaData(m,1),D0=anaData(m,0);const adv=anaAdvice(m);
  const lvl=!sk?'brak analityka':sk<9?`słaby · ${sk}/20`:sk<15?`dobry · ${sk}/20`:`świetny · ${sk}/20`;
  return `<div class="card fmw"><div class="fmh"><b>Analityk</b><span class="small mut">${sk?esc(anaName())+' · ':''}${lvl}</span></div>
   <div class="small"><b>${esc(m.sides[1].team.short)}</b> <span class="mut">rywal</span></div>${anaBars(m,1,D1)}
   <div class="small" style="margin-top:6px"><b>${esc(m.sides[0].team.short)}</b> <span class="mut">Twoja drużyna</span></div>${anaBars(m,0,D0)}
   ${adv?`<div class="small anaadv">💡 ${adv.t}</div>`:!sk?'<div class="small mut">Bez analityka widać tylko ogólne tendencje. Zatrudnij go w zakładce Sztab.</div>':sk<9?'<div class="small mut">Słaby analityk: dane całych drużyn, zaokrąglone, z opóźnieniem.</div>':''}
   ${sk>=9?`<button class="link small" onclick="ui.fmPanel=ui.fmPanel==='ana'?null:'ana';render()">${ui.fmPanel==='ana'?'Zwiń':'Szczegóły zawodników'}</button>`:''}</div>`;}
function anaTable(m,i){const D=anaData(m,i);if(!D.pl.length)return '<div class="small mut">Brak danych.</div>';
  const sk=D.sk;const rows=sk>=15?D.pl:D.pl.slice(0,4);
  return `<table class="fmpt-t"><thead><tr><th class="l">Zawodnik</th><th>Ataki</th><th>Skos</th><th>Prosta</th><th>Środek</th><th>Kiwka</th><th>Skut.</th></tr></thead><tbody>
  ${rows.map(x=>`<tr><td class="l">${x.p.num} ${esc(x.p.last)} <small class="mut">${pTag(x.p.pos)}</small></td><td>${x.n}</td><td>${x.cross?x.cross+'%':'–'}</td><td>${x.line?x.line+'%':'–'}</td><td>${x.mid?x.mid+'%':'–'}</td><td>${x.tip?x.tip+'%':'–'}</td><td>${x.kill}%</td></tr>`).join('')}</tbody></table>
  ${sk<15?'<div class="small mut">Dobry analityk (9–14) pokazuje 4 najczęściej atakujących z dokładnością do 5%. Świetny (15+) wszystkich, dokładnie.</div>':''}`;}

// ---- zgranie zespołu ----
function chemPct(c){return Math.round(((c-0.3)/0.7)*100);}
function chemBadge(t,lu){const ids=Object.values(lu||{});const ps=ids.map(id=>t.players.find(p=>p.id===id)).filter(Boolean);const c=chemOf(ps,t.idx,t.idx===SAVE.team?myCaptain():null);const v=chemPct(c);
  const low=ps.filter(p=>togetherOf(p,t.idx)<10).map(p=>p.last);
  return `Zgranie zespołu: <b style="color:${v>=75?'var(--good)':v>=45?'var(--acc)':'var(--bad)'}">${v}%</b> <span title="Średnia ze zgrania wszystkich par w składzie (najważniejsze: rozgrywający z atakującymi i linia przyjęcia) plus wpływ kapitana. Para zgrywa się z każdym wspólnym meczem (pełne po ok. 25). Nowi zawodnicy zaczynają od zera. Zgranie i komunikacja decydują o nieporozumieniach przy niedokładnym przyjęciu, o wystawach w trudnych sytuacjach i o szybkich piłkach.">ⓘ</span>${low.length?` <span class="mut">· mało gry razem: ${esc(low.slice(0,3).join(', '))}${low.length>3?'…':''}</span>`:''}`;}
// ================= CZAS: ZEJŚCIE DO ŁAWEK, 15 s, POWRÓT =================
const TO_SEC=15;
function benchScene(m,sc){const out=sc.map(o=>Object.assign({},o,{j:0}));const by=MV.FY1?(MV.FY1-24-MV.Y0)/MV.SC:10.4;
  for(const i of [0,1]){const ps=out.filter(o=>o.i===i);const cx=i===0?3.6:14.4,cy=Math.min(by-0.6,10.1),r=1.45;ps.forEach((o,k)=>{const ang=-Math.PI/2+k/ps.length*Math.PI*2;o.x=cx+Math.cos(ang)*r*1.35;o.y=cy+Math.sin(ang)*r*0.62;});}
  return out;}
function animScene(m,from,to,dur,done){const cv=document.getElementById('mcv');if(!cv){done&&done();return;}let t0=null;
  const sc=from.map(o=>Object.assign({},o));const tg={};for(const o of to)tg[o.id]=o;
  const fr=now=>{if(t0==null)t0=now;const t=Math.min(1,(now-t0)/dur),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    for(let k=0;k<sc.length;k++){const a=from[k],b=tg[a.id]||a;sc[k].x=a.x+(b.x-a.x)*e;sc[k].y=a.y+(b.y-a.y)*e;}
    if(ui.to)ui.to.scene=sc;drawHall(m,sc,null,null);if(t<1&&document.getElementById('mcv'))requestAnimationFrame(fr);else done&&done();};
  requestAnimationFrame(fr);}
function startTimeout(i){const m=ui.match;if(!m||m.over||ui.to)return;
  if(i===0){if(!callTimeout(m,0)){render();return;}m.log.push({t:`Czas dla ${esc(m.sides[0].team.name)}.`,c:'sys'});m.comm={t:`Czas dla ${m.sides[0].team.short}. Zawodnicy schodzą do ławki.`,w:0};}
  const wasPlaying=!m.paused;m.paused=true;clearTimeout(timer);ui.talk=true;ui.talkRes=null;ui.talkSt=null;ui.toReq=false;
  const base=formation(m);ui.to={side:i,end:Date.now()+TO_SEC*1000,wasPlaying,scene:base,said:null};persistLive();render();
  const cvOk=document.getElementById('mcv');if(cvOk)animScene(m,base,benchScene(m,base),1400,()=>{});
  clearInterval(ui.toTimer);ui.toTimer=setInterval(()=>{if(!ui.to){clearInterval(ui.toTimer);return;}const left=Math.max(0,Math.ceil((ui.to.end-Date.now())/1000));
    document.querySelectorAll('.tocount').forEach(e=>e.textContent=left+' s');document.querySelectorAll('.tobar i').forEach(e=>e.style.width=(left/(ui.to.dur||TO_SEC)*100)+'%');
    if(left<=0)endTimeout();},250);}
// przerwa między setami: 30 s na przemowę i zmianę stron, statystyki seta; można przewinąć jak czas
const SET_SEC=30;
function startSetBreak(){const m=ui.match;if(!m||m.over||ui.to)return;const ls=m.lastSet;
  m.paused=true;clearTimeout(timer);ui.talk=true;ui.talkRes=null;ui.talkSt=null;ui.toReq=false;ui.asstOpen=1;
  const base=formation(m);ui.to={side:0,kind:'set',setNo:ls?ls.no:m.setNo-1,dur:SET_SEC,end:Date.now()+SET_SEC*1000,wasPlaying:true,scene:base,said:null};
  m.comm={t:`Koniec ${ui.to.setNo}. seta. Zmiana stron, trenerzy rozmawiają z zespołami.`,w:null};persistLive();render();
  const cvOk=document.getElementById('mcv');if(cvOk)animScene(m,base,benchScene(m,base),1400,()=>{});
  clearInterval(ui.toTimer);ui.toTimer=setInterval(()=>{if(!ui.to){clearInterval(ui.toTimer);return;}const left=Math.max(0,Math.ceil((ui.to.end-Date.now())/1000));
    document.querySelectorAll('.tocount').forEach(e=>e.textContent=left+' s');document.querySelectorAll('.tobar i').forEach(e=>e.style.width=(left/SET_SEC*100)+'%');
    if(left<=0)endTimeout();},250);}
function setSummary(m){const ls=m.lastSet;if(!ls)return '';const T=ls.teams;const pc=(a,b)=>b?Math.round(100*a/b)+'%':'–';
  const row=(l,f)=>`<tr><td>${l}</td><td><b>${f(T[0])}</b></td><td><b>${f(T[1])}</b></td></tr>`;
  const pl=ls.players[0].filter(x=>x.inv).sort((a,b)=>b.pts-a.pts||b.kill-a.kill);
  return `<div class="setsum"><div class="ssh"><b>Set ${ls.no}: ${esc(m.sides[0].team.short)} ${ls.score[0]}:${ls.score[1]} ${esc(m.sides[1].team.short)}</b><span class="small mut">stan meczu ${m.setsWon[0]}:${m.setsWon[1]}</span></div>
   <div class="ssg"><table class="sst"><thead><tr><th>W secie</th><th>${esc(m.sides[0].team.short)}</th><th>${esc(m.sides[1].team.short)}</th></tr></thead><tbody>
   ${row('Atak',t=>pc(t.kill,t.att)+` <small class="mut">${t.kill}/${t.att}</small>`)}${row('Przyjęcie+',t=>pc(t.recPos,t.rec))}${row('Asy · bloki',t=>t.ace+' · '+t.blk)}${row('Obrony',t=>t.dig)}${row('Błędy',t=>t.err)}</tbody></table>
   <table class="sst"><thead><tr><th>Twoi zawodnicy</th><th>Pkt</th><th>Atak</th><th>Prz+</th><th>Obr</th><th>Bł.</th></tr></thead><tbody>
   ${pl.map(x=>`<tr><td>${pTag(x.pos)} ${esc(x.last)}</td><td><b>${x.pts}</b></td><td>${x.att?x.kill+'/'+x.att:'–'}</td><td>${x.rec?pc(x.recPos,x.rec):'–'}</td><td>${x.dig||'–'}</td><td class="${x.err?'bad':''}">${x.err||'–'}</td></tr>`).join('')}</tbody></table></div></div>`;}
function endTimeout(){const m=ui.match;const to=ui.to;if(!to)return;clearInterval(ui.toTimer);ui.talk=false;
  const from=to.scene||formation(m);const back=formation(m);to.end=0;
  const finish=()=>{ui.to=null;if(m&&!m.over){m.comm={t:to.kind==='set'?`Set ${m.setNo}${m.setNo===5?' (tie-break)':''} — zespoły wracają na boisko.`:'Zawodnicy wracają na boisko.',w:null};if(to.wasPlaying||to.side===1){m.paused=false;}}persistLive();render();schedule(500);};
  if(document.getElementById('mcv')){ui.to.returning=true;render();animScene(m,from,back,1200,finish);}else finish();}
function toBanner(m){const to=ui.to;if(!to)return '';const left=Math.max(0,Math.ceil((to.end-Date.now())/1000));
  return `<div class="tobanner"><b>${to.kind==='set'?`🔄 Przerwa po ${to.setNo}. secie · zmiana stron`:`⏱ Czas dla ${esc(m.sides[to.side].team.short)}`}</b><span class="tobar"><i style="width:${left/(to.dur||TO_SEC)*100}%"></i></span><span class="tocount">${left} s</span>${to.said?`<span class="small mut">Powiedziałeś: „${esc(to.said)}”</span>`:''}</div>`;}
// ================= KOMENTARZ NA ŻYWO =================
const pickT=a=>a[Math.floor(Math.random()*a.length)];
function rallyComment(m,ev,setEnded,pre){const seq=ev.seq||[];const N=id=>{const p=findPl(m,id);return p?p.last:'?';};
  const last=k=>{for(let i=seq.length-1;i>=0;i--)if(seq[i].k===k)return seq[i];return null;};
  const w=ev.winner,T=i=>m.sides[i].team.short;const att=last('att'),blk=last('blk'),srv=seq[0],rec=seq.find(x=>x.k==='rec'),setI=att?seq.slice(0,seq.indexOf(att)).reverse().find(x=>x.k==='set'):last('set');
  const digs=seq.filter(x=>x.k==='dig'&&!x.free).length,atts=seq.filter(x=>x.k==='att').length;let t='';
  switch(ev.type){
    case 'ace':{const ac=last('ace');t=ac&&ac.sh?pickT([`AS! ${N(ac.id)} odbija zagrywkę poza boisko.`,`Zagrywka ${N(srv.id)} nie do opanowania — ${N(ac.id)} wybija ją w aut. As!`]):pickT([`AS! ${ac?N(ac.id):'Przyjmujący'} nie zdążył do piłki — zagrywał ${N(srv.id)}.`,`Bomba z zagrywki: ${N(srv.id)}! Nikt nie zdążył.`,`${N(srv.id)} trafia w wolne miejsce — as!`]);break;}
    case 'serr':{const e=seq.find(x=>x.srv)||{};t=e.how==='net'?`${N(srv.id)} w siatkę — zagrywka nie przeszła na drugą stronę.`:e.how==='wide'?`${N(srv.id)} zagrywa w aut obok boiska.`:`${N(srv.id)} za długo — aut za linią końcową.`;break;}
    case 'block':t=att&&att.tr?`Potrójny blok! ${N(att.id)} zatrzymany.`:pickT([`Monster blok: ${N(blk.id)}! Atakował ${N(att.id)}.`,`Ściana! ${N(blk.id)} zatrzymuje atak (${N(att.id)}).`,`${N(blk.id)} zamyka drogę — punkt blokiem!`]);break;
    case 'attErr':t=att?(att.d==='tip'?`${N(att.id)} kiwa prosto w siatkę.`:pickT([`${N(att.id)} psuje atak.`,`Za mocno! ${N(att.id)} w aut.`,`${N(att.id)} nie trafia w boisko.`])):'Błąd w ataku.';break;
    case 'setErr':t=`Błąd rozegrania${setI?': '+N(setI.id):''}.`;break;
    case 'blockout':t=pickT([`${N(att.id)} obija blok — piłka ląduje na aucie!`,`Sprytnie! ${N(att.id)} gra w ręce ${N(blk.id)} i punkt po bloku.`,`Po rękach ${N(blk.id)} w aut — punkt dla ${T(w)}!`]);break;
    case 'netTouch':t=pickT([`Gwizdek! ${N(blk.id)} dotyka siatki w bloku — punkt dla ${T(w)}.`,`Błąd w bloku: ${N(blk.id)} w siatce.`]);break;
    case 'f3m':t=pickT([`Gwizdek! ${N(att.id)} wybił się przed linią trzeciego metra.`,`${N(att.id)} z drugiej linii nadepnął linię 3 m — błąd ataku.`]);break;
    case 'mix':{const mx=last('mix');t=mx?`Nieporozumienie! ${N(mx.ids[0])} i ${N(mx.ids[1])} patrzą na siebie, a piłka spada.`:'Nieporozumienie w przyjęciu!';break;}
    default:{if(!att){const fr=last('free');t=fr?`Przebicie: ${N(fr.id)} — zamieszanie u rywala i punkt!`:'Punkt!';break;}
      const a=N(att.id),d=att.d;
      t=d==='tip'?pickT([`Sprytna kiwka: ${a}!`,`${a} oszukuje blok kiwką.`,`Kiwka za blok — ${a}!`])
       :d==='line'?pickT([`${a} wzdłuż linii — czysto!`,`${a} po prostej, obrona bez szans.`,`Atak po linii — ${a}!`])
       :d==='cross'?pickT([`${a} kończy po skosie!`,`Mocny skos — ${a}!`,`${a} omija blok po przekątnej.`])
       :att.q?pickT([`Szybka piłka — ${a}!${setI?` ${N(setI.id)} świetnie rozegrał.`:''}`,`${a} ze środka, nie do obrony.`])
       :pickT([`${a} kończy z drugiej linii!`,`Atak przez środek — ${a}!`]);}
  }
  if(atts>=3)t=`Co za wymiana! `+t;else if(digs>=2&&ev.type!=='ace')t=t+` Świetna obrona w tej akcji.`;
  let x='';const tgt=m.setNo===5?15:25;
  if(setEnded){const s=m.sets[m.sets.length-1];x=m.over?` KONIEC MECZU! ${T(m.winner)} wygrywa ${Math.max(...m.setsWon)}:${Math.min(...m.setsWon)}!`:` ${T(w)} wygrywa seta ${s[0]}:${s[1]}!`;}
  else{if(m.run&&m.run.t===w&&m.run.n>=3)x=` To już ${m.run.n}. punkt z rzędu ${T(w)}!`;
    const [a,b]=m.score;for(const i of [0,1]){const me=i?b:a,op=i?a:b;if(me>=tgt-1&&me>op){const mp=m.setsWon[i]===(2);x+=mp?` Piłka meczowa dla ${T(i)}!`:` Piłka setowa dla ${T(i)}!`;}}}
  return {t:t+x,w};}
// ================= ASYSTENT NA ŻĄDANIE =================
function asstAll(m){const a=m.sides[0],b=m.sides[1];const sk=staffSkill('asy');const A=teamTotals(a),B=teamTotals(b);const out=[];const h=(m.hist||[]).filter(x=>x[0]===m.setNo);
  // forma ostatnich akcji
  const lastN=h.slice(-8);let my=0;lastN.forEach((x,k)=>{const p=k?lastN[k-1]:(h[h.length-lastN.length-1]||[0,0,0]);if(x[1]>p[1])my++;});
  if(lastN.length>=6)out.push({g:'Przebieg',t:my>=6?`Gramy świetnie: ${my} z ostatnich ${lastN.length} punktów dla nas. Nic nie zmieniaj.`:my<=2?`Ostatnie ${lastN.length} akcji: tylko ${my} punkty dla nas. Rywal przejął inicjatywę.`:`Wyrównana gra: ${my} z ostatnich ${lastN.length} punktów dla nas.`,btn:my<=2&&a.to>0?'Weź czas':null,act:'myTimeout()'});
  // przyjęcie
  if(A.rec>=4){const r=A.recPos/A.rec;const worst=a.pl.filter(p=>p.st.rec>=3).sort((x,y)=>(x.st.recPos/x.st.rec)-(y.st.recPos/y.st.rec))[0];
    out.push({g:'Przyjęcie',t:r<0.45?`Przyjęcie słabe: ${pc(A.recPos,A.rec)} pozytywnego.${worst?` Najwięcej problemów ma ${worst.last} (${pc(worst.st.recPos,worst.st.rec)}).`:''} Przemowa „Skupcie się na przyjęciu” albo zmiana przyjmującego.`:`Przyjęcie w porządku: ${pc(A.recPos,A.rec)} pozytywnego.`,btn:r<0.45&&a.to>0?'Weź czas':null,act:'myTimeout()'});}
  // atak
  if(A.att>=6){const best=a.pl.filter(p=>p.st.att>=4).sort((x,y)=>y.st.kill/y.st.att-x.st.kill/x.st.att)[0];const poor=a.pl.filter(p=>p.st.att>=5).sort((x,y)=>x.st.kill/x.st.att-y.st.kill/y.st.att)[0];
    let t=`Nasz atak: ${pc(A.kill,A.att)} skuteczności.`;if(best)t+=` Najlepiej kończy ${best.last} (${best.st.kill}/${best.st.att}).`;if(poor&&poor!==best&&poor.st.kill/poor.st.att<0.3)t+=` ${poor.last} ma tylko ${poor.st.kill}/${poor.st.att}.`;
    const dist=best&&best.pos==='A'&&a.tactics.dist!==3?{btn:'Graj na atakującego',act:'setDist(3)'}:best&&best.pos==='S'&&a.tactics.dist!==2&&A.recPos/Math.max(1,A.rec)>0.55?{btn:'Graj środkiem',act:'setDist(2)'}:best&&best.pos==='P'&&a.tactics.dist!==1?{btn:'Graj na skrzydła',act:'setDist(1)'}:{};
    out.push(Object.assign({g:'Atak',t},sk>=8?dist:{}));}
  // blok i rywal (analityk)
  const ana=anaAdvice(m);if(ana)out.push({g:'Blok',t:ana.t,btn:ana.btn,act:ana.act});
  else if(B.att>=8)out.push({g:'Rywal',t:`Rywal kończy ${pc(B.kill,B.att)} ataków.${anaSkill()?'':' Bez analityka nie powiem, w które kierunki gra — zatrudnij go w Sztabie.'}`});
  // zagrywka
  if(B.rec>=5){const r=B.recPos/B.rec;const w=weakestReceiver(m);
    if(r<0.45&&a.tactics.serve<2)out.push({g:'Zagrywka',t:`Rywal źle przyjmuje (${pc(B.recPos,B.rec)}). Możemy zaryzykować mocniejszą zagrywką.`,btn:'Ryzykowna zagrywka',act:'setServe(2)'});
    else if(w&&!a.tactics.tgt&&sk>=6&&(()=>{const rs=onCourt(b,m.serving===1).filter(e=>(e.role==='L'||e.role==='P')&&e.p!==w).map(e=>e.p.prz);return rs.length&&w.prz<=Math.min(...rs)-2;})())out.push({g:'Zagrywka',t:`Najsłabiej przyjmuje ${w.last} (przyjęcie ${w.prz}). Celujmy w niego.`,btn:`Zagrywka w ${w.last}`,act:`setTgt('${w.id}')`});
    else if(A.srvErr>=4&&a.tactics.serve===2)out.push({g:'Zagrywka',t:`Za dużo błędów zagrywki (${A.srvErr}). Zmniejsz ryzyko.`,btn:'Normalna zagrywka',act:'setServe(1)'});}
  // zmęczenie i morale
  const oc=onCourt(a,m.serving===0);const tired=oc.filter(e=>e.role!=='L'&&e.p.en<62).sort((x,y)=>x.p.en-y.p.en)[0];
  if(tired)out.push({g:'Kondycja',t:`${tired.p.last} słabnie (energia ${Math.round(tired.p.en)}%).${a.subs>0?' Rozważ zmianę.':' Nie mamy już zmian w tym secie.'}`,btn:a.subs>0?'Wybierz zmianę':null,act:`selSub(${tired.slot})`});
  const low=oc.filter(e=>(e.p.mor??60)<45).map(e=>e.p.last);if(low.length)out.push({g:'Morale',t:`Niskie morale: ${low.join(', ')}. Słowa otuchy w czasie pomogą.`,btn:a.to>0?'Weź czas':null,act:'myTimeout()'});
  // zgranie
  if((a.chem??0.6)<0.55)out.push({g:'Zgranie',t:`Zespół jest słabo zgrany (${chemPct(a.chem)}%). Uważajmy na nieporozumienia przy niedokładnym przyjęciu; piłki sytuacyjne bezpieczniej przebijać na środek.`});
  if(!out.length)out.push({g:'Ogólnie',t:'Za wcześnie na wnioski. Zapytaj mnie po kilku akcjach.'});
  if(sk<6)out.splice(4);
  return out;}
// pełne rady asystenta w jego własnym okienku (bez przewijania na górę strony)
function asstInline(m){const sk=staffSkill('asy');const s=SAVE.staff&&SAVE.staff.asy;const L=asstAll(m);
  return `<div class="card fmw asin"><div class="fmh"><b>Asystent</b><small class="mut" style="margin-left:6px">${s?esc(s.last||'')+' · '+sk+'/20':'brak'}</small><span class="sp"></span><button class="ghost sm" onclick="ui.asstOpen=0;render()">Zwiń</button></div>
   ${L.map(x=>`<div class="asr"><span class="asg">${x.g}</span><div class="ast">${esc(x.t)}</div>${x.btn?`<button class="btn sm" onclick="${x.act};render()">✓ ${esc(x.btn)}</button>`:''}</div>`).join('')}
   <div class="small mut" style="margin-top:4px">${sk<6?'Słaby asystent widzi tylko najważniejsze rzeczy.':sk<8?'Lepszy asystent (8+) podpowie też, na kogo rozgrywać.':'Rady odświeżają się po każdej akcji.'}</div></div>`;}
function asstPanel(m){const sk=staffSkill('asy');const s=SAVE.staff&&SAVE.staff.asy;const L=asstAll(m);
  return `<div class="card fmpanel"><div class="row"><h3 style="margin:0">💬 Asystent: ${s?esc((s.first||'')+' '+(s.last||'')):'bez asystenta'} <small class="mut">${s?sk+'/20':''}</small></h3><span class="sp"></span><button class="ghost sm" onclick="render()">↻ Odśwież</button><button class="ghost sm" onclick="ui.fmPanel=null;render()">Zamknij</button></div>
   <div class="asl">${L.map(x=>`<div class="asi"><span class="asg">${x.g}</span><span class="ast">${esc(x.t)}</span>${x.btn?`<button class="btn sm" onclick="${x.act};ui.fmPanel='asst';render()">✓ ${esc(x.btn)}</button>`:''}</div>`).join('')}</div>
   <p class="small mut" style="margin:6px 0 0">${sk<6?'Słaby asystent widzi tylko najważniejsze rzeczy. Lepszy (Sztab) da więcej i trafniejszych rad, np. o rozegraniu.':sk<8?'Lepszy asystent (8+) podpowie też, na kogo rozgrywać.':'Rady odświeżają się po każdej akcji.'}</p></div>`;}

// ================= OKRZYKI TRENERA (w trakcie gry, bez brania czasu) =================
function shoutPow(){return clamp(0.7+(cA('mot')-10)*0.03+(cA('aut')-10)*0.02,0.5,1.4);}
function shoutBarInner(m){const s=m.sides[0];const cd=s.shCd!=null&&m.rallies<s.shCd?s.shCd-m.rallies:0;
  const last=ui.shout&&Date.now()-ui.shout.t0<9000?ui.shout:null;
  return `<span class="small mut shl">🗣️ Okrzyk${cd?` <span class="shcd">(za ${cd} ${cd===1?'akcję':'akcje'})</span>`:''}:</span>${SHOUTS.map(([k,n,ic,d])=>`<button class="ghost sm shtb" ${cd||ui.to?'disabled':''} onclick="myShout('${k}')" title="${esc(d)}">${ic} ${esc(n)}</button>`).join('')}${teamFx(m,0)}${last?`<span class="shlast">${last.ic} „${esc(last.t)}”${last.r?` <small class="mut">${esc(last.r)}</small>`:''}</span>`:''}`;}
function shoutBar(m){return `<div class="shbar" id="shbar">${shoutBarInner(m)}</div>`;}
function updateShoutBar(){const el=document.getElementById('shbar');if(el&&ui.match)el.innerHTML=shoutBarInner(ui.match);}
function teamFx(m,i){const s=m.sides[i];const sh=s.sh;if(!sh||sh.u<=m.rallies)return '';const left=sh.u-m.rallies;const t=SHOUTS.find(x=>x[0]===sh.k);
  return `<span class="shfx">${t?t[2]:sh.ic||'🗣️'} <b>${esc(t?t[1]:sh.n)}</b>: ${esc(fxText(sh))} · jeszcze ${left} ${left===1?'akcja':left<5?'akcje':'akcji'}</span>`;}
function myShout(k){const m=ui.match;if(!m||m.over||ui.to)return;const t0=SHOUTS.find(x=>x[0]===k);const r=applyShout(m,0,k,shoutPow(),{n:t0[1],ic:t0[2]});if(!r){updateShoutBar();return;}
  const t=SHOUTS.find(x=>x[0]===k);const who=coach()?coach().last:'Trener';
  const rs=`${r.up?r.up+' ↑':''}${r.dn?' '+r.dn+' ↓':''}${r.f<0.5?' · słabszy efekt (powtarzasz się)':''}`.trim();
  m.log.push({t:`🗣️ ${esc(who)}: „${esc(t[1])}” — efekt na drużynę: ${esc(fxText(m.sides[0].sh))}${r.up?` — ${r.up} zawodników podbudowanych`:''}${r.dn?`, ${r.dn} spiętych`:''}${r.f<0.5?' (zawodnicy już to dziś słyszeli, słabszy efekt)':''}.`,c:'sys'});
  ui.shout={t:t[1],ic:t[2],t0:Date.now(),r:rs};m.comm={t:`🗣️ ${who}: „${t[1]}”`,w:0};persistLive();
  if(m.animating){updateShoutBar();document.querySelectorAll('.mcom').forEach(e=>{e.textContent=m.comm.t;e.className='mcom me';});return;}render();}
