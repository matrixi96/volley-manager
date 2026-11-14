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
      <div class="pm"><div class="pnm"><b>${esc(p.last)}</b> <small class="mut">${POS_SHORT[e?e.role:p.pos]}${e?'':' · ławka'}</small>${d!=null&&d!==0?` <span class="dlt ${d>0?'good':'bad'}">${d>0?'+':''}${d}</span>`:''}</div>
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
  ['calm','Uspokój','„Spokojnie, więcej koncentracji”','Pomaga nerwowym i zawodnikom z niskim morale. Przez 7 akcji mniej prostych błędów i pewniejsza końcówka.','tfocus'],
  ['wake','Obudź','„Obudźcie się! Tak się nie gra!”','Ostra reprymenda: działa przy dużym autorytecie. Waleczni się nakręcą, nerwowi mogą się spiąć. Przez 7 akcji wyraźny impuls dla całej drużyny.','twake']];
function talkList(m){return TALK_TONE.map(x=>[x[0],x[1]+': '+x[2],x[3]]).concat([['srv','Ryzykujcie na zagrywce!',''],['rec','Skupcie się na przyjęciu',''],['target','Zagrywka w wybranego zawodnika','']]);}
function myTimeout(){const m=ui.match;if(!m||m.over||ui.to)return;if(m.sides[0].to<=0)return;
  if(m.animating){ui.toReq=!ui.toReq;document.querySelectorAll('.tobtn').forEach(b=>b.textContent=ui.toReq?'⏱ Czas po akcji…':`⏱ Czas (${m.sides[0].to})`);return;}
  startTimeout(0);}
function talkState(){return ui.talkSt||(ui.talkSt={tone:null,hint:null});}
function talkPlayers(m){const s=m.sides[0];return onCourt(s,m.serving===0).map(e=>e.p);}
function applyTone(k){const m=ui.match;if(!m)return;const st=talkState();if(st.tone)return;const T=TALK_TONE.find(x=>x[0]===k);const s=m.sides[0];const oc=talkPlayers(m);
  const behind=m.score[1]-m.score[0];const mot=cA('mot'),aut=cA('aut');const cp=myCaptain();const amp=(0.8+aut/50)*(cp&&oc.some(x=>x.id===cp.id)?1+Math.max(0,capBonus(cp))*3:1);const del={};
  for(const p of oc){const mor=p.mor==null?60:p.mor;let d=0;
    if(k==='enc')d=2+(mot-10)*0.5+(behind>=3?3:0)+(mor<50?2:0);
    else if(k==='dem')d=((p.zaa+(hasT(p,'amb')?16:p.wal))/2-10)*0.8+(mot-10)*0.3-(p.opa<9?2:0)-(mor<45?2:0);
    else if(k==='calm')d=1+(60-mor)*0.12+(12-p.opa)*0.45;
    else if(k==='wake')d=((p.wal+p.zaa)/2-10.5)*1.1+(aut-10)*0.5-(p.opa<9?3:0);
    d=Math.round(d*amp+(R()-0.5)*2);addMor(p,d);del[p.id]=d;}
  // efekt na całą drużynę: siła zależy od motywacji/autorytetu trenera i średniej reakcji zawodników
  const avg=Object.values(del).reduce((a,b)=>a+b,0)/Math.max(1,oc.length);const f=clamp(shoutPow()*1.25*(0.75+avg/12),0.3,1.8);
  const F=SH_FX[T[4]]||{};const fx={};for(const x in F)fx[x]=F[x]*(x==='e'?Math.min(1.3,f):f);s.sh=Object.assign({k:T[4],u:m.rallies+7,n:T[2].replace(/[„”]/g,''),ic:'⏱'},fx);
  if(k==='enc'&&Math.abs(behind)<=3)s.mom=Math.min(3,Math.max(0,s.mom)+1);
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
  return `<div class="card talk"><div class="row"><h3 style="margin:0">⏱ ${to&&to.side===1?`Czas dla ${esc(m.sides[1].team.short)} — możesz porozmawiać ze swoimi`:'Czas — co mówisz zawodnikom?'}</h3>${to?`<span class="tobar" style="width:140px;margin-left:10px"><i style="width:${Math.max(0,(to.end-Date.now())/150)}%"></i></span><b class="tocount" style="margin-left:6px">${Math.max(0,Math.ceil((to.end-Date.now())/1000))} s</b>`:''}<span class="sp"></span><button class="ghost" onclick="ui.talk=false;render()">${st.tone||st.hint?'Zamknij':'Bez przemowy'}</button>${to?'<button class="btn" onclick="endTimeout()">↩ Wracamy na boisko</button>':''}</div>
  <p class="small mut">Wybierz <b>ton przemowy</b> i <b>wskazówkę do gry</b> (po jednej na przerwę). Każdy zawodnik reaguje inaczej — zależy od jego charakteru i Twoich atrybutów trenera. Reakcje zobaczysz przy nazwiskach w panelu.</p>
  <div class="tsec">1. Ton przemowy${st.tone?` <span class="good">✓ ${TALK_TONE.find(x=>x[0]===st.tone)[1]}</span>`:''}</div><div class="opts tone4">${tone}</div>
  <div class="tsec">2. Wskazówka do gry <small class="mut">(działa ${dur} akcji)</small>${st.hint?' <span class="good">✓ wydana</span>':''}</div>
  <div class="opts tone4"><button class="opt ${st.hint==='srv'?'on':''}" ${st.hint?'disabled':''} onclick="applyHint('srv')"><b>Ryzykujcie na zagrywce</b><small>Mocniejsza zagrywka: więcej asów, ale i więcej błędów.</small></button>
   <button class="opt ${st.hint==='rec'?'on':''}" ${st.hint?'disabled':''} onclick="applyHint('rec')"><b>Skupcie się na przyjęciu</b><small>Lepsze przyjęcie, spokój dla przyjmujących i libero.</small></button></div>
  <div class="tsub">Zagrywka w zawodnika:</div><div class="tgtl">${opp.map(({p,role})=>`<button class="ghost sm ${st.hint==='target'&&ui.match.sides[0].tmp&&ui.match.sides[0].tmp.id===p.id?'on':''}" ${st.hint?'disabled':''} onclick="applyHint('target','${p.id}')"><b>${esc(p.last)}</b> <small class="mut">${POS_SHORT[p.pos]} · przyjęcie ${p.prz}</small></button>`).join('')}</div></div>`;}
// ---- karta ustawienia ----
const ROT_TIP={1:'Rozgrywający z tyłu na prawej: trzech atakujących w pierwszej linii.',6:'Rozgrywający z tyłu w środku: trzech atakujących z przodu.',5:'Rozgrywający z tyłu na lewej: trzech atakujących z przodu, najdłuższy dobieg do siatki.',4:'Rozgrywający z przodu na lewej: tylko dwóch atakujących w pierwszej linii.',3:'Rozgrywający z przodu w środku: dwóch atakujących z przodu, możliwa kiwka.',2:'Rozgrywający z przodu na prawej: dwóch atakujących z przodu, klasyczna wystawa.'};
function rotBox(m,i){const sd=m.sides[i];const sv=m.serving===i;const oc=onCourt(sd,sv);const kc=kitColors(m)[i];
  const setter=oc.find(e=>e.role==='R');const rz=setter?setter.zone+1:0;const front=oc.filter(e=>isFrontZ(e.zone)),back=oc.filter(e=>!isFrontZ(e.zone));
  const atk=front.filter(e=>e.role!=='R'&&e.role!=='L').length;const lib=oc.find(e=>e.role==='L');const libFor=lib?sd.slots[sd.rot[lib.zone]]:null;
  const cell=z=>{const e=oc.find(x=>x.zone===z-1);if(!e)return '<div class="rz"></div>';const col=e.role==='L'?libColor(kc,'#000'):kc;
    return `<div class="rz ${e.role==='R'?'rs':''}" title="Strefa ${z}: ${esc(e.p.first+' '+e.p.last)} (${POS_NAMES[e.role]})"><span class="rzn">${z}</span><i style="background:${col};color:${lum(col)>0.6?'#111':'#fff'}">${e.p.num}</i><small>${POS_SHORT[e.role]}</small></div>`;};
  const grid=i===0?[[5,4],[6,3],[1,2]]:[[2,1],[3,6],[4,5]];
  const tac=sd.tactics||{serve:1,dist:0};
  return `<div class="rbox"><div class="row"><b style="color:${kc}">●</b> <b>${esc(sd.team.short)}</b><span class="sp"></span><span class="rtag ${sv?'srv':'rcv'}">${sv?'🏐 na zagrywce':'🛡️ w przyjęciu'}</span></div>
   <div class="rmain"><div class="rgrid ${i===0?'l':'r'}">${grid.map(r=>r.map(cell).join('')).join('')}<div class="rnet"></div></div>
   <div class="rtxt"><div class="rtitle">Ustawienie ${rz||'?'}</div><div class="small mut">${rz?`rozgrywający w strefie ${rz} · system 5-1`:'system 5-1'}</div>
   <div class="small">${ROT_TIP[rz]||''}</div>
   <div class="small mut" style="margin-top:4px">Atakujący z przodu: <b style="color:var(--txt)">${atk}</b>${lib?` · libero ${esc(lib.p.last)} za ${esc(libFor?libFor.p.last:'środkowego')}`:''}</div>
   <div class="small mut">W obronie: ${[1,6,5].map(z=>{const e=back.find(x=>defZone(x)===z);return e?`<b style="color:var(--txt)">${z}</b> ${POS_SHORT[e.role]} ${esc(e.p.last)}`:''}).filter(Boolean).join(' · ')}</div>
   <div class="small mut">Zagrywka: <b style="color:var(--txt)">${SERVE_OPT[tac.serve][0]}</b> · rozegranie: <b style="color:var(--txt)">${DIST_OPT[tac.dist][0]}</b></div>
   ${sd.tmp&&sd.tmp.n>0?`<div class="small tmpb">📋 ${esc(TALK_TMP[sd.tmp.k]||'')} — ${sd.tmp.n} akcji</div>`:''}</div></div></div>`;}
function rotCard(m){if(m.over)return '';return `<div class="card rotcard"><div class="row"><h3 style="margin:0">Grane ustawienie</h3><span class="sp"></span><span class="small mut">Set ${m.setNo} · ${m.score[0]}:${m.score[1]}</span></div><div class="rboxes">${rotBox(m,0)}${rotBox(m,1)}</div>
  <p class="small mut" style="margin:6px 0 0">Numer ustawienia = strefa, w której stoi rozgrywający. Ustawienie zmienia się, gdy drużyna odbiera zagrywkę rywalowi (rotacja zgodnie z ruchem wskazówek zegara).</p></div>`;}
