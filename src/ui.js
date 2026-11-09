// ================= INTERFEJS =================
const TEAMS=TEAM_DEFS.map(genTeam);
const KEY='vm_save_v2';
let SAVE={};try{SAVE=JSON.parse(localStorage.getItem(KEY))||null;if(!SAVE){const old=JSON.parse(localStorage.getItem('vm_proto_v1'));SAVE=old&&old.team!=null?{team:old.team,lineup:old.lineup,tactics:old.tactics}:{};}}catch(e){SAVE={};}
const ui={confirmReset:false,confirm:null,msg:null,code:null,tab:'mecz',sort:'pos',match:null,view:'log',subSel:null,speed:800,test:null,testA:1,testB:0,testN:200};
let timer=null;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function myTeam(){return SAVE.team!=null?TEAMS[SAVE.team]:null;}
function myLineup(){const t=myTeam();if(!validLineup(t,SAVE.lineup)){SAVE.lineup=autoLineup(t);save();}return SAVE.lineup;}
function myTac(){if(!SAVE.tactics){SAVE.tactics={serve:1,dist:0};}return SAVE.tactics;}
function aCls(v){return v>=16?'a4':v>=13?'a3':v>=9?'a2':'a1';}
function stars(r){const n=Math.max(1,Math.min(5,Math.round((r-66)/5)));return '★'.repeat(n)+'<span class="mut">'+'★'.repeat(5-n)+'</span>';}
function pName(p){return esc(p.first[0]+'. '+p.last);}

function render(){
  const app=$('#app');const t=myTeam();
  if(!t){app.innerHTML=hdr(false)+`<main>${coachCreateView()}</main>`;return;}
  if(!SAVE.coach){app.innerHTML=hdr(false)+`<main>${coachCreateView()}</main>`;return;}
  if(!SAVE.season)newSeason(1);
  let body='';
  if(ui.tab==='sklad')body=squadView();
  else if(ui.tab==='taktyka')body=tacticsView();
  else if(ui.tab==='mecz')body=matchView();
  else if(ui.tab==='test')body=testView();
  else if(ui.tab==='staty')body=statsView();
  else if(ui.tab==='trening')body=trainingView();
  else if(ui.tab==='kalendarz')body=calView();
  else if(ui.tab==='trener')body=coachView();
  else if(ui.tab==='sztab')body=staffView();
  else if(ui.tab==='juniorzy')body=juniorsView();
  else if(ui.tab==='klub')body=clubView();
  else if(ui.tab==='transfery')body=transferView();
  else if(ui.tab==='finanse')body=financeView();
  else if(ui.tab==='zapis')body=saveView();
  app.innerHTML=hdr(true)+`<main>${body}</main>`+(ui.card?cardModal():'');
  if(ui.tab==='mecz'&&ui.match){const lg=$('#log');if(lg)lg.scrollTop=0;}
}
function hdr(nav){
  const t=myTeam();
  const tabs=[['mecz','Sezon'],['trener','Trener'],['kalendarz','Kalendarz'],['sklad','Skład'],['taktyka','Taktyka'],['trening','Trening'],['sztab','Sztab'],['juniorzy','Juniorzy'],['klub','Infrastruktura'],['transfery','Transfery'],['finanse','Finanse'],['staty','Statystyki'],['zapis','Zapis'],['test','Test']];
  return `<header><div class="logo">🏐 Volley<span>Manager</span> <small class="mut">prototyp</small></div>
  ${nav?`<nav>${tabs.map(([k,l])=>`<button class="${ui.tab===k?'on':''}" onclick="go('${k}')">${l}</button>`).join('')}</nav>
  <div class="club" style="--c:${t.color}">${SAVE.custom&&SAVE.custom.idx===SAVE.team?crestSvg(t.name,t.short,t.color,20,SAVE.custom.crest):''}<span class="date" title="${fmtLong(today())}">📅 ${fmtShort(today())}.${today().slice(0,4)}</span><i></i>${SAVE.coach?`<span class="hface" onclick="go('trener')" title="${esc(SAVE.coach.first+' '+SAVE.coach.last)}">${coachFace(SAVE.coach,26)}</span>`:''}${esc(t.name)}${SAVE.fin?` <small class="${SAVE.fin.bal<0?'bad':'mut'}">${fmt(SAVE.fin.bal)}</small>`:''}</div>`:''}</header>`;
}
function go(tab){ui.msg=null;ui.tmsg=null;ui.card=null;ui.confirm=null;if(ui.match&&!ui.match.over&&tab!=='mecz')ui.match.paused=true;ui.tab=tab;ui.subSel=null;render();}

function pickTeamView(){
  return `<div class="card"><h2>Wybierz klub</h2><p class="mut">Fikcyjna polska liga, 12 drużyn. Sezon: 7 sparingów, 22 kolejki (mecz i rewanż), a potem play-off dla czołowej ósemki. Słabszy klub to większe wyzwanie.</p>
  <div class="grid">${TEAMS.map(t=>`<button class="teamcard" style="--c:${t.color}" onclick="pickTeam(${t.idx})"><b>${esc(t.name)}</b><span class="stars">${stars(teamStrength(t))}</span><small class="mut">Siła składu: ${teamStrength(t)}</small></button>`).join('')}</div></div>`;
}
function pickTeam(i){const c=ui.pendingCoach;SAVE={team:i,tactics:{serve:1,dist:0},date:GAME_START};initWorld();SAVE.lineup=autoLineup(TEAMS[i]);if(c){SAVE.coach=c;c.joined=GAME_START;}newSeason(1);initBoard(true);ui.cc=null;ui.pendingCoach=null;syncDate();ui.match=null;ui.tab='mecz';render();}
function changeClub(){if(!ui.confirmReset){ui.confirmReset=true;render();return;}ui.confirmReset=false;ui.match=null;clearTimeout(timer);SAVE={};resetTeams();save();render();}

// ---------- skład ----------
function squadView(){
  const t=myTeam(),lu=myLineup();
  const inLu=new Map(LINEUP_KEYS.map(([k,l])=>[lu[k],l]));
  const order={R:0,A:1,P:2,S:3,L:4};
  let pl=t.players.slice();
  if(ui.sort==='pos')pl.sort((a,b)=>order[a.pos]-order[b.pos]||rating(b)-rating(a));
  else if(ui.sort==='ocena')pl.sort((a,b)=>rating(b)-rating(a));
  else if(ui.sort==='wiek')pl.sort((a,b)=>a.age-b.age);
  else if(ui.sort==='h')pl.sort((a,b)=>b.h-a.h);
  else if(ui.sort==='pot')pl.sort((a,b)=>b.pot-a.pot);else if(ui.sort==='wart')pl.sort((a,b)=>pValue(b)-pValue(a));else if(ui.sort==='pensja')pl.sort((a,b)=>b.wage-a.wage);else if(ui.sort==='kontrakt')pl.sort((a,b)=>a.ce-b.ce);
  else pl.sort((a,b)=>b[ui.sort]-a[ui.sort]);
  const sel=([k,l,pos])=>`<label class="lu"><span>${l}</span><select onchange="setLu('${k}',this.value)">${
    t.players.slice().sort((a,b)=>(a.pos===pos?0:1)-(b.pos===pos?0:1)||rating(b,pos)-rating(a,pos)).map(p=>`<option value="${p.id}" ${lu[k]===p.id?'selected':''}>${p.inj?'🚑 ':''}${esc(p.last)} (${POS_SHORT[p.pos]}) — ${rating(p,pos)}</option>`).join('')}</select></label>`;
  return `<div class="card"><div class="row"><h2>Skład wyjściowy</h2><span class="sp"></span><button class="ghost" onclick="autoLu()">Ustaw automatycznie</button></div>
  <p class="mut small">System 5-1. Ocena w nawiasie dotyczy wybranej pozycji: zawodnik grający poza swoją pozycją wypada słabiej. Libero wchodzi za środkowego w drugiej linii.</p>
  <div class="lugrid">${LINEUP_KEYS.map(sel).join('')}</div>${injWarn()}
  <div class="row small mut" style="margin-top:8px">Siła składu: <b style="color:var(--txt);margin-left:4px">${lineupStrength(t,lu)}</b><span class="sp"></span>${ui.confirmReset?`<span class="bad">Zmiana klubu kasuje obecną grę (sloty zostają). Na pewno?</span> <button class="link" onclick="changeClub()">Tak, zmień</button> <button class="link" onclick="ui.confirmReset=false;render()">Nie</button>`:`<button class="link" onclick="changeClub()">Zmień klub</button>`}</div></div>
  <div class="card"><h2>Kadra (${t.players.length})</h2><div class="tw"><table class="squad"><thead><tr class="grp"><th colspan="5"></th><th colspan="${ATTRS.length}" class="msep gt">Techniczne</th><th colspan="${PHYS.length}" class="msep gf">Fizyczne</th><th colspan="${MENTAL.length}" class="msep men">Mentalne</th><th colspan="5" class="msep">Klub</th></tr><tr>
  <th onclick="srt('pos')">#</th><th class="l" onclick="srt('pos')">Zawodnik</th><th onclick="srt('pos')">Poz</th><th onclick="srt('wiek')">Wiek</th><th onclick="srt('h')">Wzrost</th>
  ${[[ATTRS,'gt'],[PHYS,'gf'],[MENTAL,'men']].map(([G,c])=>G.map(([k,l,s,d],j)=>`<th class="${j?'':'msep'} ${c}" onclick="srt('${k}')" title="${l}: ${d}">${s}</th>`).join('')).join('')}<th onclick="srt('ocena')" class="msep">Ocena</th><th onclick="srt('pot')">Potencjał</th><th onclick="srt('wart')">Wartość</th><th onclick="srt('pensja')">Pensja</th><th onclick="srt('kontrakt')">Kontrakt</th></tr></thead><tbody>
  ${pl.map(p=>`<tr class="${inLu.has(p.id)?'starter':''}"><td>${p.num}</td><td class="l"><span class="fcell">${pFace(p,28)}<button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b>${p.star?' ⭐':''}</button></span>${p.inj?` 🚑<small class="bad">${p.inj}</small>`:''}${inLu.has(p.id)?` <span class="tag">${inLu.get(p.id)}</span>`:''}</td><td>${POS_SHORT[p.pos]}</td><td>${p.age}</td><td>${p.h}</td>
  ${[ATTRS,PHYS,MENTAL].map(G=>G.map(([k],j)=>{const d=p.base?p[k]-p.base[k]:0;return `<td class="${j?'':'msep'}"><span class="attr ${aCls(p[k])}">${p[k]}</span>${d?`<sup class="${d>0?'good':'bad'}">${d>0?'+':''}${d}</sup>`:''}</td>`;}).join('')).join('')}<td class="msep"><b>${rating(p)}</b></td><td class="stars">${potStars(p)}</td><td>${fmt(pValue(p))}</td><td>${fmt(p.wage)}</td><td class="${p.ce<=S().n?'bad':''}">${ceDate(p.ce)}</td></tr>`).join('')}
  </tbody></table></div><p class="mut small">Atrybuty w skali 1–20. Małe liczby to zmiana od początku sezonu. Kliknij nagłówek, żeby posortować, a nazwisko, żeby otworzyć kartę zawodnika (kontrakt, sprzedaż).</p>
  <details class="legend"><summary>Co oznaczają atrybuty?</summary>${[['Techniczne',ATTRS],['Fizyczne',PHYS],['Mentalne',MENTAL]].map(([n,G])=>`<div class="lg"><b class="gh">${n}</b>${G.map(([k,l,s,d])=>`<div><b>${s}</b> ${l}: ${d}</div>`).join('')}</div>`).join('')}</details></div>`;
}
function lineupStrength(t,lu){let s=0,n=0;for(const [k,,pos] of LINEUP_KEYS){const p=t.players.find(x=>x.id===lu[k]);const w=k==='L'?0.6:1;s+=rating(p,pos)*w;n+=w;}return Math.round(s/n);}
function srt(k){ui.sort=k;render();}
function autoLu(){SAVE.lineup=autoLineup(myTeam());save();render();}
function setLu(k,id){const lu=myLineup();const other=Object.keys(lu).find(x=>x!==k&&lu[x]===id);if(other)lu[other]=lu[k];lu[k]=id;save();render();}

// ---------- taktyka ----------
const SERVE_OPT=[['Bezpieczna','Mniej błędów, ale łatwiejsze przyjęcie dla rywala.'],['Normalna','Rozsądny balans ryzyka.'],['Ryzykowna','Więcej asów i słabych przyjęć rywala, ale dużo błędów.']];
const DIST_OPT=[['Zrównoważone','Rozgrywający gra do wszystkich.'],['Skrzydła','Więcej piłek do przyjmujących i atakującego.'],['Środek','Więcej szybkich piłek do środkowych (wymaga dobrego przyjęcia).'],['Na atakującego','Główna opcja: atakujący.']];
function optGroup(name,opts,cur,fn){return `<div class="opts">${opts.map(([l,d],i)=>`<button class="opt ${cur===i?'on':''}" onclick="${fn}(${i})"><b>${l}</b><small>${d}</small></button>`).join('')}</div>`;}
function tacticsView(){const tc=myTac();
  return `<div class="card"><h2>Zagrywka</h2>${optGroup('serve',SERVE_OPT,tc.serve,'setServe')}</div>
  <div class="card"><h2>Rozegranie</h2>${optGroup('dist',DIST_OPT,tc.dist,'setDist')}</div>
  <p class="mut small">Taktykę możesz zmieniać także w trakcie meczu.</p>`;}
function setServe(i){myTac().serve=i;save();if(ui.match&&!ui.match.over)ui.match.sides[0].tactics.serve=i;render();}
function setDist(i){myTac().dist=i;save();if(ui.match&&!ui.match.over)ui.match.sides[0].tactics.dist=i;render();}

// ---------- mecz ----------
function matchView(){
  const m=ui.match;
  if(!m)return seasonView();
  if(m.over&&ui.view==='post')return postMatchView();
  return liveView();
}
function schedule(ms){clearTimeout(timer);const m=ui.match;if(!m||m.over||m.paused)return;timer=setTimeout(tick,ms==null?ui.speed:ms);}
function animOn(){return ui.anim!==false&&ui.speed>=800&&typeof requestAnimationFrame!=='undefined';}
function tick(){const m=ui.match;if(!m||m.over||m.paused||m.animating)return;if(ui.tab!=='mecz'){m.paused=true;persistLive();return;}
  const ev=doRally(m);if(!m.over)persistLive();
  if(animOn()){m.animating=true;animateRally(ev,()=>{m.animating=false;render();schedule(ui.speed>=1600?650:220);});}
  else{render();schedule();}}
function animateRally(ev,done){
  const court=document.querySelector('.court'),ball=document.getElementById('vball');
  if(!court||!ball||!court.getBoundingClientRect){done();return;}
  const cr=court.getBoundingClientRect();if(!cr.width){done();return;}
  const W=cr.width,H=cr.height;
  const chip=id=>{const el=court.querySelector('[data-pid="'+id+'"]');if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left-cr.left+r.width/2,y:r.top-cr.top+r.height*0.38,el};};
  const half=(s,a,b)=>(s===0?a:1-b)*W+R()*(b-a)*W;
  const pts=[];let prev=null;
  for(const t of ev.seq){let p=null;
    if(t.k==='floor')p={x:t.blk?half(t.s,0.36,0.46):half(t.s,0.06,0.42),y:(0.12+R()*0.76)*H};
    else if(t.k==='ace'){const c=chip(t.id);p=c?{x:c.x+(R()-0.5)*30,y:c.y+28,el:null}:{x:half(t.s,0.1,0.4),y:H/2};}
    else if(t.k==='out')p={x:t.s===0?W*0.01:W*0.99,y:R()<0.5?-12:H+12};
    else if(t.k==='net')p={x:W/2,y:(0.3+R()*0.4)*H};
    else p=chip(t.id);
    if(!p){prev=t.k;continue;}
    p.high=prev==='set'||prev==='srv'||prev==='rec'||prev==='dig';p.fast=prev==='att';p.kind=t.k;pts.push(p);prev=t.k;}
  if(pts.length<2){done();return;}
  const base=ui.speed>=1600?470:300;
  const label={ace:'AS!',block:'BLOK!',kill:'PUNKT',serr:'BŁĄD ZAGRYWKI',attErr:'BŁĄD ATAKU',setErr:'BŁĄD'}[ev.type]||'PUNKT';
  ball.style.display='block';ball.style.transform=`translate(${pts[0].x}px,${pts[0].y}px)`;
  let i=0;
  const seg=()=>{if(i>=pts.length-1){flashLabel(label,ev.winner);setTimeout(()=>{ball.style.display='none';done();},ui.speed>=1600?650:380);return;}
    const a=pts[i],b=pts[i+1];const dur=b.fast?base*0.5:base;const arc=b.fast?H*0.02:H*(b.high?0.24:0.12);const t0=performance.now();
    const step=now=>{const t=Math.min(1,(now-t0)/dur);const k=4*t*(1-t);
      ball.style.transform=`translate(${a.x+(b.x-a.x)*t}px,${a.y+(b.y-a.y)*t-arc*k}px) scale(${1+0.6*k*arc/(H*0.24)})`;
      if(t<1)requestAnimationFrame(step);else{if(b.el){b.el.classList.add('touch');setTimeout(()=>b.el.classList.remove('touch'),260);}i++;seg();}};
    requestAnimationFrame(step);};
  seg();
}
function flashLabel(t,w){const f=document.getElementById('cflash');if(!f)return;f.textContent=t;f.className='cflash show '+(w===0?'fw':'fl');}
function doRally(m){let ret;
  for(const s of aiTurn(m,1))m.log.push({t:esc(s),c:'sys'});
  const ev=stepRally(m);m.hl=ev.act;ret=ev;
  m.log.push({t:`<b class="sc">${ev.score[0]}:${ev.score[1]}</b> ${esc(ev.text)}`,c:ev.winner===0?'w':'l'});
  if(ev.setEnd){m.log.push({t:`Koniec ${ev.setNo}. seta — ${ev.score[0]}:${ev.score[1]} dla <b>${esc(m.sides[ev.setWinner].team.name)}</b>. Stan meczu ${m.setsWon[0]}:${m.setsWon[1]}.`,c:'set'});
    if(!ev.matchEnd)m.log.push({t:`Set ${m.setNo}${m.setNo===5?' (tie-break do 15)':''}: zagrywa ${esc(m.sides[m.serving].team.name)}.`,c:'sys'});}
  if(ev.matchEnd){finishMatch(m);m.log.push({t:`KONIEC MECZU! <b>${esc(m.sides[m.winner].team.name)}</b> wygrywa ${Math.max(...m.setsWon)}:${Math.min(...m.setsWon)}.`,c:'set'});}
  return ret;
}
function setSpeed(ms){ui.speed=ms;const m=ui.match;if(m&&!m.over){m.paused=false;ui.subSel=null;}render();schedule();}
function togglePause(){const m=ui.match;if(!m||m.over)return;m.paused=!m.paused;persistLive();if(!m.paused)ui.subSel=null;render();schedule();}
function simToSetEnd(){const m=ui.match;if(!m||m.over)return;const s=m.setNo;while(!m.over&&m.setNo===s)doRally(m);m.paused=true;persistLive();render();}
function simToEnd(){const m=ui.match;if(!m)return;while(!m.over)doRally(m);render();}
function myTimeout(){const m=ui.match;if(!m||m.over)return;if(callTimeout(m,0)){m.log.push({t:`Czas dla ${esc(m.sides[0].team.name)}.`,c:'sys'});}render();}
function selSub(slot){const m=ui.match;if(!m||m.over||!m.paused){if(m&&!m.over){m.paused=true;}}ui.subSel=slot;render();}
function doSub(pid){const m=ui.match;const s=m.sides[0];const slot=ui.subSel;const old=slot==='L'?s.libero:s.slots[slot].p;
  if(substitute(m,0,slot,pid)){const np=s.pl.find(p=>p.id===pid);m.log.push({t:`Zmiana: <b>${esc(np.last)}</b> za ${esc(old.last)}.`,c:'sys'});}
  ui.subSel=null;persistLive();render();}
function lum(h){const n=parseInt(h.slice(1),16);return (0.299*(n>>16)+0.587*(n>>8&255)+0.114*(n&255))/255;}
function rgb(h){const n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255];}
function cdist(a,b){const x=rgb(a),y=rgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);}
function libColor(c,o){const pal=['#fde047','#e5e7eb','#f472b6','#a3e635','#fb923c','#1f2937'];return pal.map(p=>[p,Math.min(cdist(p,c),o?cdist(p,o):999)]).sort((a,b)=>b[1]-a[1])[0][0];}
function jersey(p,color,isLib,opp){
  const c=isLib?libColor(color,opp):color,ink=lum(c)>0.6?'#111827':'#ffffff',edge=lum(c)>0.6?'#00000055':'#ffffff55';
  const name=p.last.toUpperCase();const tl=name.length>8?` textLength="34" lengthAdjust="spacingAndGlyphs"`:'';
  return `<svg viewBox="0 0 60 56" class="jer"><path d="M19 3 L25 5 Q30 9 35 5 L41 3 L58 13 L52 25 L46 22 L46 54 L14 54 L14 22 L8 25 L2 13 Z" fill="${c}" stroke="${edge}" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M25 5 Q30 11 35 5" fill="none" stroke="${edge}" stroke-width="2"/><path d="M8 25 L2 13 M52 25 L58 13" stroke="${edge}" stroke-width="3"/>
  <text x="30" y="21" text-anchor="middle" font-size="7" font-weight="700" fill="${ink}"${tl}>${esc(name)}</text>
  <text x="30" y="45" text-anchor="middle" font-size="21" font-weight="900" fill="${ink}" font-family="Impact,Arial Black,system-ui,sans-serif">${p.num}</text></svg>`;
}
function chip(x,side,i,mine){
  const p=x.p;const hl=ui.match.hl.includes(p.id);const srv=ui.match.serving===i&&x.zone===0;
  return `<div class="pl ${hl?'hl':''} ${mine?'click':''}" data-pid="${p.id}" ${mine?`onclick="selSub(${x.slot==='L'?"'L'":x.slot})"`:''} title="${esc(p.first+' '+p.last)} — ${POS_NAMES[x.role]}">
  ${jersey(p,side.team.color,x.role==='L',ui.match.sides[1-i].team.color)}${srv?'<span class="ball">🏐</span>':''}<span class="rl">${POS_SHORT[x.role]}</span><span class="en"><i style="width:${p.en}%;background:${p.en>75?'var(--good)':p.en>55?'#eab308':'var(--bad)'}"></i></span></div>`;
}
function courtHtml(m){
  const L=onCourt(m.sides[0],m.serving===0),Rr=onCourt(m.sides[1],m.serving===1);
  const lo=[4,3,5,2,0,1],ro=[1,0,2,5,3,4];
  return `<div class="court"><div class="half">${lo.map(z=>chip(L[z],m.sides[0],0,true)).join('')}</div><div class="half">${ro.map(z=>chip(Rr[z],m.sides[1],1,false)).join('')}</div><div class="net"></div><div class="al l"></div><div class="al r"></div><div id="vball" class="vball">🏐</div><div id="cflash" class="cflash"></div></div>`;
}
function liveView(){
  const m=ui.match,[a,b]=m.sides;
  const setsTxt=m.sets.map(s=>`${s[0]}:${s[1]}`).join(' · ');
  const sp=[[1600,'Wolno'],[800,'Normalnie'],[250,'Szybko'],[50,'Turbo']];
  let subPanel='';
  if(ui.subSel!==null&&!m.over){const s=a;const isL=ui.subSel==='L';const cur=isL?s.libero:s.slots[ui.subSel].p;
    const bench=benchOf(s).sort((x,y)=>(x.pos===(isL?'L':s.slots[ui.subSel].role)?0:1)-(y.pos===(isL?'L':s.slots[ui.subSel].role)?0:1)||rating(y)-rating(x));
    subPanel=`<div class="card sub"><div class="row"><b>Zmiana za: ${esc(cur.last)} (${isL?'libero':POS_NAMES[s.slots[ui.subSel].role]})</b><span class="sp"></span><button class="ghost" onclick="ui.subSel=null;render()">Anuluj</button></div>
    ${!isL&&s.subs<=0?'<p class="bad">Brak zmian w tym secie.</p>':`<div class="benchlist">${bench.map(p=>`<button class="ghost" onclick="doSub('${p.id}')">${p.num} ${esc(p.last)} <small>${POS_SHORT[p.pos]} · ${rating(p)} · ${Math.round(p.en)}%</small></button>`).join('')}</div>`}
    <p class="mut small">${isL?'Zmiana libero nie liczy się do limitu.':'Pozostało zmian w secie: '+s.subs}</p></div>`;}
  return `<div class="card score">
   <div class="tm" style="--c:${a.team.color}"><span>${esc(a.team.name)}</span><b class="sw">${m.setsWon[0]}</b></div>
   <div class="pts"><b class="${m.serving===0?'srv':''}">${m.over?'–':m.score[0]}</b><span>${m.over?'KONIEC':'SET '+m.setNo}</span><b class="${m.serving===1?'srv':''}">${m.over?'–':m.score[1]}</b></div>
   <div class="tm r" style="--c:${b.team.color}"><b class="sw">${m.setsWon[1]}</b><span>${esc(b.team.name)}</span></div>
   <div class="sets">${setsTxt||'&nbsp;'}</div></div>
  ${courtHtml(m)}
  <div class="row small mut libl">Libero: <b style="color:var(--txt);margin:0 4px">${esc(a.libero.last)}</b> <button class="link" onclick="selSub('L')">zmień</button><span class="sp"></span>Kliknij swojego zawodnika na boisku, żeby go zmienić.</div>
  ${m.over?`<div class="card row"><b>Mecz zakończony: ${esc(m.sides[m.winner].team.name)} wygrywa ${Math.max(...m.setsWon)}:${Math.min(...m.setsWon)}</b><span class="sp"></span><button class="btn" onclick="ui.view='post';render()">Podsumowanie</button><button class="ghost" onclick="ui.match=null;render()">Dalej</button></div>`:
  `<div class="card ctrl"><div class="row wrap">
    <button class="btn" onclick="togglePause()">${m.paused?'▶ Graj':'⏸ Pauza'}</button>
    ${sp.map(([ms,l])=>`<button class="ghost ${ui.speed===ms&&!m.paused?'on':''}" onclick="setSpeed(${ms})">${l}</button>`).join('')}
    <button class="ghost" onclick="simToSetEnd()">Do końca seta</button><button class="ghost" onclick="simToEnd()">Do końca meczu</button><button class="ghost ${ui.anim!==false?'on':''}" onclick="ui.anim=ui.anim===false;render()" title="Animacja piłki przy prędkości Wolno i Normalnie">🏐 Animacja: ${ui.anim!==false?'wł.':'wył.'}</button></div>
   <div class="row wrap" style="margin-top:8px">
    <button class="ghost" ${a.to<=0?'disabled':''} onclick="myTimeout()">⏱ Czas (${a.to})</button>
    <span class="mut small">Zmiany: ${a.subs}/6</span><span class="sp"></span>
    <label class="small">Zagrywka <select onchange="setServe(+this.value)">${SERVE_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.serve===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <label class="small">Rozegranie <select onchange="setDist(+this.value)">${DIST_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.dist===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
   </div></div>`}
  ${subPanel}
  <div class="card"><div class="row"><button class="tabb ${ui.view==='log'?'on':''}" onclick="ui.view='log';render()">Komentarz</button><button class="tabb ${ui.view==='stats'?'on':''}" onclick="ui.view='stats';render()">Statystyki</button></div>
  ${ui.view==='stats'?statsBlock(m):`<div id="log" class="log">${m.log.slice(-150).reverse().map(e=>`<div class="le ${e.c}">${e.t}</div>`).join('')}</div>`}</div>`;
}
function teamTotals(s){const t={pts:0,kill:0,att:0,attErr:0,blk:0,ace:0,srvErr:0,rec:0,recPos:0,recErr:0,blocked:0};for(const p of s.pl){const x=p.st;t.kill+=x.kill;t.att+=x.att;t.attErr+=x.attErr;t.blk+=x.blk;t.ace+=x.ace;t.srvErr+=x.srvErr;t.rec+=x.rec;t.recPos+=x.recPos;t.recErr+=x.recErr;t.blocked+=x.blocked;}t.pts=t.kill+t.blk+t.ace;return t;}
const pc=(a,b)=>b?Math.round(a/b*100)+'%':'–';
function histChart(m){
  const h=m.hist||[];if(!h.length)return '';
  const sets={};for(const [sn,a,b] of h)(sets[sn]=sets[sn]||[]).push(a-b);
  const c0=m.sides[0].team.color,c1=m.sides[1].team.color;
  const cell=(sn,arr)=>{const n=Math.max(arr.length,sn==5?20:45),W=260,Hh=90,mid=Hh/2,mx=Math.max(6,...arr.map(Math.abs)),bw=W/n,sc=(mid-6)/mx;
    const bars=arr.map((d,i)=>d===0?'':`<rect x="${(i*bw).toFixed(1)}" y="${d>0?mid-d*sc:mid}" width="${Math.max(1,bw-0.8).toFixed(1)}" height="${Math.abs(d)*sc}" fill="${d>0?c0:c1}"/>`).join('');
    const last=h.filter(x=>x[0]==sn).slice(-1)[0];
    return `<div class="hc"><div class="small mut">Set ${sn}: <b style="color:var(--txt)">${last[1]}:${last[2]}</b></div><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><line x1="0" x2="${W}" y1="${mid}" y2="${mid}" stroke="#ffffff40"/>${bars}</svg></div>`;};
  return `<div class="hcs">${Object.keys(sets).map(sn=>cell(+sn,sets[sn])).join('')}</div><p class="mut small">Przewaga w punktach po każdej akcji: w górę ${esc(m.sides[0].team.short)}, w dół ${esc(m.sides[1].team.short)}.</p>`;
}
function attackShare(sd){const tot=sd.pl.reduce((s,p)=>s+p.st.att,0);if(!tot)return '';
  const arr=sd.pl.filter(p=>p.st.att).sort((a,b)=>b.st.att-a.st.att);
  return `<div class="share">${arr.map(p=>`<div class="shr"><span>${esc(p.last)} <small class="mut">${POS_SHORT[p.pos]}</small></span><span class="shb"><i style="width:${p.st.att/tot*100}%;background:${sd.team.color}"></i></span><b>${Math.round(p.st.att/tot*100)}%</b></div>`).join('')}</div>`;}
function statsBlock(m){
  const [A,B]=m.sides.map(teamTotals);
  const rows=[['Punkty (atak+blok+as)',A.pts,B.pts],['Skończone ataki',`${A.kill}/${A.att} (${pc(A.kill,A.att)})`,`${B.kill}/${B.att} (${pc(B.kill,B.att)})`],['Błędy w ataku',A.attErr,B.attErr],['Bloki punktowe',A.blk,B.blk],['Asy',A.ace,B.ace],['Błędy zagrywki',A.srvErr,B.srvErr],['Przyjęcie pozytywne',pc(A.recPos,A.rec),pc(B.recPos,B.rec)]];
  return `<div class="tw"><table class="cmp"><thead><tr><th class="l"></th><th>${esc(m.sides[0].team.short)}</th><th>${esc(m.sides[1].team.short)}</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="l">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>
  <h3>Przebieg meczu</h3>${histChart(m)}
  <h3>Rozkład ataków</h3><div class="shares"><div><div class="mut small">${esc(m.sides[0].team.name)}</div>${attackShare(m.sides[0])}</div><div><div class="mut small">${esc(m.sides[1].team.name)}</div>${attackShare(m.sides[1])}</div></div>
  <h3>${esc(m.sides[0].team.name)}</h3>${playerTable(m.sides[0])}<h3>${esc(m.sides[1].team.name)}</h3>${playerTable(m.sides[1])}`;
}
function playerTable(s){
  const ps=s.pl.filter(p=>p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0).sort((a,b)=>(b.st.kill+b.st.blk+b.st.ace)-(a.st.kill+a.st.blk+a.st.ace));
  return `<div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz</th><th>Pkt</th><th>Atak</th><th>Skut.</th><th>Bł.</th><th>Blok</th><th>As</th><th>Bł.zag</th><th>Przyj.poz</th><th>Obr.</th><th>Energia</th></tr></thead><tbody>
  ${ps.map(p=>{const x=p.st;return `<tr><td class="l">${p.num} <b>${esc(p.last)}</b></td><td>${POS_SHORT[p.pos]}</td><td><b>${x.kill+x.blk+x.ace}</b></td><td>${x.kill}/${x.att}</td><td>${pc(x.kill,x.att)}</td><td>${x.attErr}</td><td>${x.blk}</td><td>${x.ace}</td><td>${x.srvErr}</td><td>${x.rec?pc(x.recPos,x.rec)+' <small class="mut">('+x.rec+')</small>':'–'}</td><td>${x.dig}</td><td>${Math.round(p.en)}%</td></tr>`;}).join('')}</tbody></table></div>`;
}
function postMatchView(){
  const m=ui.match,w=m.sides[m.winner];
  const mvp=w.pl.slice().sort((a,b)=>mvpScore(b)-mvpScore(a))[0];
  const won=m.winner===0;
  return `<div class="card post ${won?'won':'lost'}"><h2>${won?'Zwycięstwo! 🎉':'Porażka'} <small class="mut">${m.ctx?({spar:'sparing',liga:'liga',po:'play-off'})[m.ctx.kind]:''}</small></h2>
  <div class="final">${esc(m.sides[0].team.name)} <b>${m.setsWon[0]}:${m.setsWon[1]}</b> ${esc(m.sides[1].team.name)}</div>
  <div class="mut">(${m.sets.map(s=>s[0]+':'+s[1]).join(', ')})</div>
  <p>MVP: <b>${esc(mvp.first)} ${esc(mvp.last)}</b> (${POS_NAMES[mvp.pos]}, ${w.team.name}): ${mvp.st.kill+mvp.st.blk+mvp.st.ace} pkt</p>
  <div class="row wrap"><button class="btn" onclick="ui.match=null;render()">Dalej</button><button class="ghost" onclick="ui.view='log';render()">Komentarz meczu</button></div></div>
  <div class="card">${statsBlock(m)}</div>`;
}

// ---------- test silnika ----------
function testView(){
  const g=ui.test;
  const opt=sel=>TEAMS.map(t=>`<option value="${t.idx}" ${sel===t.idx?'selected':''}>${esc(t.name)} (${teamStrength(t)})</option>`).join('');
  let res='';
  if(g){const n=g.w[0]+g.w[1];const keys=['3:0','3:1','3:2','2:3','1:3','0:3'];
    res=`<div class="card"><h3>${esc(TEAMS[g.a].name)} vs ${esc(TEAMS[g.b].name)}: ${n} meczów</h3>
    <div class="bar"><i style="width:${g.w[0]/n*100}%;background:${TEAMS[g.a].color}"></i><i style="width:${g.w[1]/n*100}%;background:${TEAMS[g.b].color}"></i></div>
    <p>Wygrane: <b>${g.w[0]}</b> (${pc(g.w[0],n)}) : <b>${g.w[1]}</b> (${pc(g.w[1],n)})</p>
    <div class="tw"><table><thead><tr>${keys.map(k=>`<th>${k}</th>`).join('')}</tr></thead><tbody><tr>${keys.map(k=>`<td>${g.res[k]||0}</td>`).join('')}</tr></tbody></table></div>
    <div class="tw"><table class="cmp"><tbody>
    <tr><td class="l">Średni wynik seta (sety 1–4)</td><td>${(g.ptsW/g.sets).toFixed(1)} : ${(g.ptsL/g.sets).toFixed(1)}</td></tr>
    <tr><td class="l">Asy / zagrywki</td><td>${(g.ace/g.srv*100).toFixed(1)}%</td></tr>
    <tr><td class="l">Błędy zagrywki</td><td>${(g.srvErr/g.srv*100).toFixed(1)}%</td></tr>
    <tr><td class="l">Skuteczność ataku</td><td>${(g.kill/g.att*100).toFixed(1)}%</td></tr>
    <tr><td class="l">Błędy w ataku</td><td>${(g.attErr/g.att*100).toFixed(1)}%</td></tr>
    <tr><td class="l">Ataki zablokowane</td><td>${(g.blocked/g.att*100).toFixed(1)}%</td></tr>
    <tr><td class="l">Side-out (punkt drużyny przyjmującej)</td><td>${(g.so[0]/g.so[1]*100).toFixed(1)}%</td></tr>
    <tr><td class="l">Średnio akcji w meczu</td><td>${Math.round(g.rallies/n)}</td></tr></tbody></table></div>
    <p class="mut small">Dla porównania w męskiej siatkówce na wysokim poziomie: asy ok. 5–7%, błędy zagrywki 12–16%, atak 45–55%, side-out 60–68%.</p></div>`;}
  return `<div class="card"><h2>Test silnika meczu</h2><p class="mut">Symulacja wielu meczów naraz (automatyczne składy). Pozwala sprawdzić, czy wyniki i statystyki są realistyczne.</p>
  <div class="row wrap"><select id="ta">${opt(ui.testA)}</select><span>vs</span><select id="tb">${opt(ui.testB)}</select>
  <select id="tn">${[50,200,500,1000].map(n=>`<option ${ui.testN===n?'selected':''}>${n}</option>`).join('')}</select><button class="btn" onclick="doTest()">Symuluj</button></div></div>${res}`;
}
function doTest(){ui.testA=+$('#ta').value;ui.testB=+$('#tb').value;ui.testN=+$('#tn').value;
  const g=runTest(TEAMS[ui.testA],TEAMS[ui.testB],ui.testN);g.a=ui.testA;g.b=ui.testB;ui.test=g;render();}

