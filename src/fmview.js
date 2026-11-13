// ================= EKRAN MECZU W UKŁADZIE „MENEDŻERSKIM” (jak FM) =================
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
    return `<div class="fmz ${click?'clk':''} ${ui.subSel!=null&&mine&&(ui.subSel===e.slot)?'sel':''}" ${click} title="Strefa ${z}: ${esc(p.first+' '+p.last)} · ${POS_NAMES[e.role]} · energia ${Math.round(p.en)}%">
      ${fmJersey(m,i,e)}<span class="fmrt ${rCls(r)}">${fmtR(r)}</span><span class="fmps">${POS_SHORT[e.role]}</span>
      <b class="fmnm">${esc(p.last)}</b>${d?`<span class="dlt ${d>0?'good':'bad'}">${d>0?'+':''}${d}</span>`:''}
      <span class="fmen"><i style="width:${Math.round(p.en)}%;background:${energyCol(p.en)}"></i></span></div>`;};
  const back=oc.filter(e=>!isFrontZ(e.zone));
  return `<div class="card fmcard" style="border-top:3px solid ${kc}">
   <div class="fmh"><b>${esc(sd.team.short)}: ustawienie ${rz||'?'}</b><span class="rtag ${sv?'srv':'rcv'}">${sv?'🏐 zagrywka':'🛡️ przyjęcie'}</span></div>
   <div class="fmnet">siatka</div>
   <div class="fmgrid">${[4,3,2,5,6,1].map(cell).join('')}</div>
   <div class="small mut fmdef">${ROT_TIP[rz]||''}</div>
   <div class="small mut">W obronie: ${[5,6,1].map(z=>{const e=back.find(x=>defZone(x)===z);return e?`<b style="color:var(--txt)">${z}</b> ${POS_SHORT[e.role]}`:''}).filter(Boolean).join(' · ')}</div>
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
  const ana=anaAdvice(m);if(ana)return ana;
  const A=teamTotals(a),B=teamTotals(b);
  if(A.rec>=6&&A.recPos/A.rec<0.4&&a.to>0)return {k:'rec'+m.setNo,t:`Przyjęcie słabe (${pc(A.recPos,A.rec)} pozytywnego). Czas i przemowa „Skupcie się na przyjęciu” pomogą.`,btn:'Weź czas',act:'myTimeout()'};
  if(B.rec>=6&&B.recPos/B.rec<0.45&&a.tactics.serve<2)return {k:'srv'+m.setNo,t:`Rywal źle przyjmuje (${pc(B.recPos,B.rec)}). Zaryzykuj mocniejszą zagrywkę.`,btn:'Ryzykowna zagrywka',act:'setServe(2)'};
  if(B.att>=8&&B.kill/B.att>0.55&&a.tactics.dist!==2)return {k:'blk'+m.setNo,t:`Atak rywala kończy ${pc(B.kill,B.att)} piłek. Pilnuj bloku, przemowa uspokoi zespół.`,btn:null};
  return {k:'ok',t:`Gramy swoje. Atak ${pc(A.kill,A.att)} wobec ${pc(B.kill,B.att)} rywala.`,btn:null};}
function fmAssistant(m){const ad=fmAdvice(m);if(!ad)return `<div class="card fmw"><div class="fmh"><b>Asystent</b></div><div class="small">Mecz zakończony.</div></div>`;
  const hid=ui.asstHide===ad.k;
  return `<div class="card fmw"><div class="fmh"><b>Asystent</b><span class="small mut">${esc(coach()?'Sztab':'')}</span></div>
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
function fmTeamStats(m,i){const t=teamTotals(m.sides[i]);const kc=kitColors(m)[i];
  const sd=m.sides[i];const mixN=(m.mixN||[0,0])[i];
  const rows=[['Punkty',t.pts],['Atak',pc(t.kill,t.att)],['Przyjęcie+',pc(t.recPos,t.rec)],['Asy',t.ace],['Bloki',t.blk],['Błędy',t.attErr+t.srvErr],['Zgranie',chemPct(sd.chem??0.6)+'%'],['Nieporoz.',mixN]];
  return `<div class="fmst"><div class="fmh"><b style="border-bottom:2px solid ${kc}">${esc(m.sides[i].team.short)}</b></div>${rows.map(r=>`<div class="fmsr"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`;}
// ---- pasek składu ----
function fmStrip(m){const a=m.sides[0];const oc=onCourt(a,m.serving===0);const ord={R:0,A:1,P:2,S:3,L:4};
  const on=oc.slice().sort((x,y)=>ord[x.role]-ord[y.role]||x.zone-y.zone);
  const mine=e=>{const p=e.p,r=liveRating(p),mor=p.mor==null?60:p.mor;const click=!m.over?`onclick="selSub(${e.slot==='L'?"'L'":e.slot})"`:'';
    return `<div class="fmsp ${click?'clk':''} ${ui.subSel===e.slot?'sel':''}" ${click} title="${esc(p.first+' '+p.last)} · energia ${Math.round(p.en)}% · morale ${mor}">
      <span class="fmps2">${POS_SHORT[e.role]}</span>${fmJersey(m,0,e,28)}<b class="fmnm">${esc(p.last)}</b><span class="fmps2">ogólna <b style="color:var(--acc)">${rating(p)}</b></span>
      <span class="fmrow"><span class="fmrt ${rCls(r)}">${fmtR(r)}</span><span>${mor>=62?'😀':mor>=45?'😐':'😟'}</span></span>
      <span class="fmen"><i style="width:${Math.round(p.en)}%;background:${energyCol(p.en)}"></i></span></div>`;};
  return `<div class="card fmstrip"><div class="fmsi"><b>Skład</b><div class="small mut">Zmian zostało <b style="color:var(--txt)">${a.subs}</b></div><div class="small mut">Czasów zostało <b style="color:var(--txt)">${a.to}</b></div><div class="small mut">Kliknij, by zmienić</div></div>${on.map(mine).join('')}</div>`;}
// ---- pasek górny ----
function fmTop(m){const [a,b]=m.sides;const kc=kitColors(m);const sp=[[1600,'0,5x'],[800,'1x'],[250,'2x'],[50,'4x']];
  const curSp=sp.findIndex(x=>x[0]===ui.speed);const nxt=sp[(Math.max(0,curSp)+1)%sp.length][0];
  const chip=(i)=>`<span class="fmchip" style="background:${kc[i]};color:${lum(kc[i])>0.6?'#111':'#fff'}">${esc(m.sides[i].team.short)}</span>`;
  return `<div class="card fmtop">
   <div class="fmtl">${m.over?'':`<button class="ghost sm ${ui.fmPanel==='tac'?'on':''}" onclick="ui.fmPanel=ui.fmPanel==='tac'?null:'tac';render()">📋 Taktyka</button>
     <button class="ghost sm" ${a.to<=0?'disabled':''} onclick="myTimeout()">⏱ Czas (${a.to})</button>
     <button class="ghost sm ${ui.fmPanel==='stats'?'on':''}" onclick="ui.fmPanel=ui.fmPanel==='stats'?null:'stats';render()">📊 Statystyki</button>`}</div>
   <div class="fmsc"><span class="fmset">${m.over?'KONIEC':'SET '+m.setNo}</span>${chip(0)}<b class="fmsw">${m.setsWon[0]}</b>
     <b class="fmpt ${m.serving===0&&!m.over?'srv':''}">${m.over?'–':m.score[0]}</b><span class="fmcol">:</span><b class="fmpt ${m.serving===1&&!m.over?'srv':''}">${m.over?'–':m.score[1]}</b>
     <b class="fmsw">${m.setsWon[1]}</b>${chip(1)}
     <span class="fmsets small mut">${m.sets.map(s=>`${s[0]}:${s[1]}`).join(' · ')}</span></div>
   <div class="fmtr2">${m.over?'':`<button class="ghost sm" onclick="setSpeed(${nxt})" title="Prędkość">⏩ ${curSp>=0?sp[curSp][1]:'1x'}</button>
     <button class="ghost sm ${ui.fmPanel==='more'?'on':''}" onclick="ui.fmPanel=ui.fmPanel==='more'?null:'more';render()" aria-label="Więcej">⋯</button>
     <button class="btn sm ppbtn" id="fmpause" onclick="togglePause()">${m.paused?'▶ Graj':'⏸ Pauza'}</button>`}</div></div>`;}
function fmPanel(m){const a=m.sides[0];
  if(ui.fmPanel==='tac')return `<div class="card fmpanel"><div class="row wrap" style="gap:12px">
    <label class="small">Zagrywka <select onchange="setServe(+this.value)">${SERVE_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.serve===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <label class="small">Rozegranie <select onchange="setDist(+this.value)">${DIST_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.dist===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <span class="small mut">${esc(SERVE_OPT[a.tactics.serve][1])} ${esc(DIST_OPT[a.tactics.dist][1])}</span></div>
    <div class="tacgrid">${tgtTacHtml(m)}${freeTacHtml(a.tactics)}</div><div class="tacgrid">${blockTacHtml(a.tactics)}</div>${rotCard(m)}</div>`;
  if(ui.fmPanel==='more')return `<div class="card fmpanel"><div class="row wrap" style="gap:6px">
    <button class="ghost sm" onclick="ui.fmPanel=null;simToSetEnd()">⏭ Do końca seta</button><button class="ghost sm" onclick="ui.fmPanel=null;simToEnd()">⏭⏭ Do końca meczu</button>
    <button class="ghost sm" onclick="ui.mview=ui.mview==='klasyczny'?'hala':'klasyczny';ui.fmPanel=null;render()">${ui.mview==='klasyczny'?'🏟️ Widok hali':'▦ Widok klasyczny'}</button>
    <button class="ghost sm ${ui.anim!==false?'on':''}" onclick="ui.anim=ui.anim===false;render()">🏐 Animacja: ${ui.anim!==false?'wł.':'wył.'}</button>
    <span class="small mut">Libero: <b style="color:var(--txt)">${esc(a.libero.last)}</b> <button class="link" onclick="selSub('L')">zmień</button></span></div></div>`;
  if(ui.fmPanel==='stats')return `<div class="card fmpanel">${statsBlock(m)}</div>`;
  if(ui.fmPanel==='ana')return `<div class="card fmpanel"><h3 style="margin-top:0">Analityk: kierunki ataków zawodników</h3><div class="shares"><div><div class="mut small">${esc(m.sides[1].team.name)} (rywal)</div>${anaTable(m,1)}</div><div><div class="mut small">${esc(m.sides[0].team.name)}</div>${anaTable(m,0)}</div></div></div>`;
  return '';}
function fmLiveView(subPanel){const m=ui.match;
  return `${fmTop(m)}${fmPanel(m)}
  ${ui.talk&&!m.over?talkCard(m):''}
  ${m.over?`<div class="card row"><b>Mecz zakończony: ${esc(m.sides[m.winner].team.name)} wygrywa ${Math.max(...m.setsWon)}:${Math.min(...m.setsWon)}</b><span class="sp"></span><button class="btn" onclick="ui.view='post';render()">Podsumowanie</button><button class="ghost" onclick="ui.match=null;render()">Dalej</button></div>`:''}
  <div class="fmwrap"><div class="fmlay">
   <div class="fml">${fmFormation(m,0)}${fmLiveTable(m)}${fmPlayerStats(m,0)}</div>
   <div class="fmc">
    <div class="card fmcourt">${fmTeamStats(m,0)}<div class="fmcv">
      ${ui.mview==='klasyczny'?courtHtml(m):`<div class="hallbar small mut">🏟️ ${tName(m.homeIdx!=null?m.homeIdx:m.sides[0].team.idx)} · <b style="color:var(--txt)">${(m.att||0).toLocaleString('pl-PL')}</b> / ${(m.cap||0).toLocaleString('pl-PL')} widzów · <span id="mph" class="mph">${m.over?'Koniec meczu':'Przed zagrywką'}</span></div><canvas id="mcv" class="mcv"></canvas>`}
      ${m.over?'':`<div class="fmctl"><button class="btn ppbtn fmbig ${m.paused?'go':''}" onclick="togglePause()">${m.paused?'▶ Graj':'⏸ Pauza'}</button><button class="ghost sm" ${m.sides[0].to<=0?'disabled':''} onclick="myTimeout()">⏱ Czas (${m.sides[0].to})</button><span class="small mut">Spacja = pauza</span></div>`}</div>${fmTeamStats(m,1)}</div>
    <div class="fmws">${fmAssistant(m)}${fmMomentum(m)}${fmAnalyst(m)}</div>
   </div>
   <div class="fmr">${fmFormation(m,1)}${fmRecent(m)}${fmPlayerStats(m,1)}</div>
  </div>
  ${fmStrip(m)}
  ${m.over?'':fmBench(m)}
  ${subPanel?`<div class="fmsub">${subPanel}</div>`:''}</div>`;}

// ---- statystyki zawodników pod formacją ----
function fmPlayerStats(m,i){const sd=m.sides[i];const onIds=new Set(onCourt(sd,m.serving===i).map(e=>e.p.id));
  const ps=sd.pl.filter(p=>onIds.has(p.id)||p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0)
    .sort((a,b)=>(onIds.has(b.id)-onIds.has(a.id))||((b.st.kill+b.st.blk+b.st.ace)-(a.st.kill+a.st.blk+a.st.ace)));
  return `<div class="card fmside2 fmps-card"><div class="fmh"><b>Statystyki zawodników</b><span class="small mut">${esc(sd.team.short)}</span></div>
   <table class="fmpt-t"><thead><tr><th class="l">Zawodnik</th><th title="Punkty: atak + blok + as">Pkt</th><th title="Skończone ataki / wszystkie">Atak</th><th title="Przyjęcie pozytywne">Prz+</th><th title="Bloki">Blok</th><th title="Asy">As</th><th title="Błędy: atak, zagrywka, przyjęcie">Bł.</th></tr></thead><tbody>
   ${ps.map(p=>{const x=p.st;const err=x.attErr+x.srvErr+x.recErr;return `<tr class="${onIds.has(p.id)?'':'off'}"><td class="l"><span class="mut">${p.num}</span> ${esc(p.last)}</td><td><b>${x.kill+x.blk+x.ace}</b></td><td>${x.att?`${x.kill}/${x.att}`:'–'}</td><td>${x.rec?pc(x.recPos,x.rec):'–'}</td><td>${x.blk||'–'}</td><td>${x.ace||'–'}</td><td class="${err?'bad':''}">${err||'–'}</td></tr>`;}).join('')}
   </tbody></table></div>`;}
// ---- ławka rezerwowych z umiejętnościami ----
const FM_KEY={R:['roz','zag','kiw'],P:['prz','ata','kiw'],A:['ata','blo','kiw'],S:['blo','czy','ata'],L:['prz','obr','czy']};
const attrShort=k=>(ALL_ATTRS.find(a=>a[0]===k)||[k,k,k])[2];
const attrCol=v=>v>=16?'#22c55e':v>=12?'#a3e635':v>=8?'#eab308':'#ef4444';
function fmBench(m){const a=m.sides[0];const bench=benchOf(a);if(!bench.length)return '';
  const sel=ui.subSel;const need=sel==null?null:sel==='L'?'L':a.slots[sel].role;
  const ord={R:0,A:1,P:2,S:3,L:4};
  const list=bench.slice().sort((x,y)=>(need?(x.pos===need?0:1)-(y.pos===need?0:1):0)||ord[x.pos]-ord[y.pos]||rating(y)-rating(x));
  return `<div class="card fmbench ${sel!=null?'subbing':''}"><div class="fmsi"><b>Ławka</b><div class="small mut">${sel!=null?`Wybierz, kto wchodzi za: <b style="color:var(--acc)">${esc((sel==='L'?a.libero:a.slots[sel].p).last)}</b>`:'Kliknij zawodnika, by zobaczyć kartę'}</div>${sel!=null?`<button class="ghost sm" onclick="ui.subSel=null;render()">Anuluj</button>`:''}</div>
   ${list.map(p=>{const fit=need&&p.pos===need;const inj=p.inj>0;
     return `<div class="fmbp clk ${fit?'fit':''} ${inj?'inj':''}" onclick="${sel!=null&&!inj?`doSub('${p.id}')`:`openCard('${p.id}')`}" title="${esc(p.first+' '+p.last)} · ${POS_NAMES[p.pos]} · ${p.age} lat">
      <div class="fmbh"><span class="fmj" style="width:26px;height:26px;font-size:12px;background:${p.pos==='L'?libColor(kitColors(m)[0],'#000'):kitColors(m)[0]};color:${lum(p.pos==='L'?libColor(kitColors(m)[0],'#000'):kitColors(m)[0])>0.6?'#111':'#fff'}">${p.num}</span>
       <div class="fmbn"><b class="fmnm">${esc(p.last)}</b><span class="fmps2">${POS_SHORT[p.pos]} · ${p.age} l.</span></div><span class="fmov" title="Ocena ogólna">${rating(p)}</span></div>
      <div class="fmattrs">${FM_KEY[p.pos].map(k=>`<span title="${esc((ALL_ATTRS.find(x=>x[0]===k)||[])[1]||k)}"><small>${attrShort(k)}</small><b style="color:${attrCol(p[k])}">${p[k]}</b></span>`).join('')}</div>
      ${inj?'<div class="small bad">kontuzja</div>':`<span class="fmen" style="width:100%"><i style="width:${Math.round(p.en)}%;background:${energyCol(p.en)}"></i></span>`}</div>`;}).join('')}</div>`;}
// ================= TAKTYKA: BLOK, OBRONA, PIŁKI SYTUACYJNE, CEL ZAGRYWKI =================
const BLK_OPT=[['Skos','Blok zamyka skos.'],['Zrównoważony','Blokujący czytają atak.'],['Prosta','Blok zamyka prostą.']];
const FREE_OPT=[['Na środek boiska','Między zawodników: możliwe nieporozumienie rywala.'],['Na rozgrywającego','Rozgrywający musi przyjąć, wystawia ktoś inny.'],['Na środkowego','Środkowy przyjmuje, więc nie zaatakuje szybkiej piłki.']];
function defTxt(side,v){const who=side==='L'?'Libero / środkowy (strefa 5)':'Rozgrywający / atakujący (strefa 1)';
  return v===0?`${who} broni prostej.`:v===2?`${who} asekuruje za blokiem i środek boiska (kiwki).`:`${who} broni standardowo, blokujący czytają kierunek ataku.`;}
function tacSet(k,v){const t=myTac();t[k]=v;save();if(ui.match&&!ui.match.over)ui.match.sides[0].tactics[k]=v;render();}
function setBlk(side,v){if(side==='B'){tacSet('blkL',v);tacSet('blkR',v);}else tacSet(side==='L'?'blkL':'blkR',v);}
function setTgt(id){if(!ui.match)return;ui.match.sides[0].tactics.tgt=id||null;persistLive();render();}
function segBtns(cur,fn){return `<div class="seg">${BLK_OPT.map((o,i)=>`<button class="${(cur??1)===i?'on':''}" onclick="${fn}(${i})" title="${esc(o[1])}">${o[0]}</button>`).join('')}</div>`;}
function blockTacHtml(t){return `
  <div class="tacrow"><div class="tacl"><b>Blok — lewa strona siatki</b><small class="mut">przeciw atakującemu rywala (jego prawe skrzydło)</small></div>${segBtns(t.blkL,"setBlk.bind(null,'L')")}<div class="small mut tacd">${defTxt('L',t.blkL??1)}</div></div>
  <div class="tacrow"><div class="tacl"><b>Blok — prawa strona siatki</b><small class="mut">przeciw przyjmującemu rywala (jego lewe skrzydło)</small></div>${segBtns(t.blkR,"setBlk.bind(null,'R')")}<div class="small mut tacd">${defTxt('R',t.blkR??1)}</div></div>
  <div class="small mut">Zawodnik pierwszej linii, który nie blokuje (strefa 4 przy bloku na prawej, strefa 2 przy bloku na lewej), schodzi do asekuracji za blok i na środek boiska: łapie kiwki i krótkie skosy.</div>
  <div class="small mut">Obie strony naraz: ${BLK_OPT.map((o,i)=>`<button class="link" onclick="setBlk('B',${i})">${o[0].toLowerCase()}</button>`).join(' · ')}. Przyjmujący w strefie 6 zawsze broni szóstki i asekuruje plecy stref 1 i 5.</div>`;}
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
  const agg=(xs,key)=>{const n=xs.length;if(!n)return null;const c=xs.filter(d=>d.d==='cross').length,l=xs.filter(d=>d.d==='line').length,t=xs.filter(d=>d.d==='tip').length,mi=xs.filter(d=>d.d==='mid').length,k=xs.filter(d=>d.r==='kill').length;
    const cr=rnd(c/n*100+noise(key)),ln=rnd(l/n*100-noise(key));return {n,cross:c?cr:0,line:l?ln:0,tip:rnd(t/n*100),mid:rnd(mi/n*100),kill:rnd(k/n*100),rawC:c/(c+l||1)};};
  const wings={L4:agg(ds.filter(d=>d.w==='L4'),'L4'),R2:agg(ds.filter(d=>d.w==='R2'),'R2'),M:agg(ds.filter(d=>d.w==='M'),'M')};
  const sd=m.sides[i];const ids=[...new Set(ds.map(d=>d.id))];
  const pl=ids.map(id=>{const p=sd.pl.find(x=>x.id===id);const xs=ds.filter(d=>d.id===id);return {p,w:xs[0].w,...agg(xs,id)};}).filter(x=>x.p&&x.n>=2).sort((a,b)=>b.n-a.n);
  return {sk,wings,pl,n:ds.length};}
function anaAdvice(m){const sk=anaSkill();if(sk<9)return null;const D=anaData(m,1);const t=m.sides[0].tactics;
  for(const [w,key,side,who] of [['L4','blkR','R','przyjmujący'],['R2','blkL','L','atakujący']]){const x=D.wings[w];if(!x||x.n<(sk>=15?6:9))continue;
    const best=x.rawC>=0.62?0:x.rawC<=0.38?2:null;if(best==null||(t[key]??1)===best)continue;
    const pp=sk>=15?D.pl.filter(q=>q.w===w)[0]:null;
    const src=pp&&pp.n>=4?pp:x;return {k:'ana'+w+best+m.setNo,t:`Analityk: ${pp&&pp.n>=4?esc(pp.p.last)+' ('+who+')':who+' rywala'} bije ${best===0?'po skosie':'po prostej'} w ${best===0?src.cross:src.line}% ataków. Ustaw blok „${BLK_OPT[best][0].toLowerCase()}” na ${side==='L'?'lewej':'prawej'} stronie siatki.`,btn:`Blok ${BLK_OPT[best][0].toLowerCase()} (${side==='L'?'lewa':'prawa'})`,act:`setBlk('${side}',${best})`};}
  return null;}
function anaBars(m,i,D){const kc=kitColors(m)[i];if(!D.n)return '<div class="small mut">Jeszcze bez ataków.</div>';
  if(!D.sk){const x=[['L4','PRZ'],['R2','ATA']].map(([w,r])=>{const v=D.wings[w];if(!v||v.n<5)return '';return `${r}: ${v.rawC>0.55?'raczej skos':v.rawC<0.45?'raczej prosta':'po równo'}`;}).filter(Boolean).join(' · ');return `<div class="small mut">${x||'Za mało danych.'}</div>`;}
  const row=(w,l)=>{const v=D.wings[w];if(!v)return '';
    if(w==='M')return `<div class="anarow"><span class="mut">${l}</span><span class="small">${v.n} ataków · kiwka ${v.tip}% · skut. ${v.kill}%</span></div>`;
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
  ${rows.map(x=>`<tr><td class="l">${x.p.num} ${esc(x.p.last)} <small class="mut">${POS_SHORT[x.p.pos]}</small></td><td>${x.n}</td><td>${x.cross?x.cross+'%':'–'}</td><td>${x.line?x.line+'%':'–'}</td><td>${x.mid?x.mid+'%':'–'}</td><td>${x.tip?x.tip+'%':'–'}</td><td>${x.kill}%</td></tr>`).join('')}</tbody></table>
  ${sk<15?'<div class="small mut">Dobry analityk (9–14) pokazuje 4 najczęściej atakujących z dokładnością do 5%. Świetny (15+) wszystkich, dokładnie.</div>':''}`;}

// ---- zgranie zespołu ----
function chemPct(c){return Math.round(((c-0.3)/0.7)*100);}
function chemBadge(t,lu){const ids=Object.values(lu||{});const ps=ids.map(id=>t.players.find(p=>p.id===id)).filter(Boolean);const c=chemOf(ps,t.idx);const v=chemPct(c);
  const low=ps.filter(p=>togetherOf(p,t.idx)<10).map(p=>p.last);
  return `Zgranie zespołu: <b style="color:${v>=75?'var(--good)':v>=45?'var(--acc)':'var(--bad)'}">${v}%</b> <span title="Rośnie z każdym meczem rozegranym razem w tym klubie (pełne po ok. 30). Nowi zawodnicy zaczynają od zera. Zgranie i komunikacja decydują o nieporozumieniach przy niedokładnym przyjęciu, o wystawach w trudnych sytuacjach i o szybkich piłkach.">ⓘ</span>${low.length?` <span class="mut">· mało gry razem: ${esc(low.slice(0,3).join(', '))}${low.length>3?'…':''}</span>`:''}`;}
// ---- boisko w zakładce Skład ----
function lineupCourt(t,lu){const g=k=>t.players.find(p=>p.id===lu[k]);const col=t.color||'#ffb020';
  const Z={1:['R','Rozgrywający'],2:['P1','Przyjmujący 1'],3:['S1','Środkowy 1'],4:['A','Atakujący'],5:['P2','Przyjmujący 2'],6:['L','Libero (za środkowego)']};
  const lc=libColor(col,'#000');
  const card=z=>{const [k,lab]=Z[z];const p=g(k);if(!p)return `<div class="lcz empty">${z}</div>`;const r=rating(p,LINEUP_KEYS.find(x=>x[0]===k)[2]);const mor=p.mor==null?60:p.mor;const c=k==='L'?lc:col;
    return `<div class="lcz" onclick="openCard('${p.id}')" title="${esc(p.first+' '+p.last)} · ${lab}">
      <span class="lczn">${z}</span>${p.inj?'<span class="lcinj" title="Kontuzja">🚑</span>':''}
      <span class="fmj" style="width:36px;height:36px;font-size:15px;background:${c};color:${lum(c)>0.6?'#111':'#fff'}">${p.num}</span>
      <b class="fmnm" style="font-size:13px">${esc(p.last)}</b><span class="fmps2">${lab.toUpperCase()}</span>
      <div class="lcst"><span title="Ocena ogólna na tej pozycji"><small>ocena</small><b style="color:var(--acc)">${r}</b></span><span title="Kondycja (umiejętność): jak szybko się męczy"><small>kon</small><b style="color:${attrCol(p.kon)}">${p.kon}</b></span><span title="Morale ${mor}"><small>mor.</small><b>${mor>=62?'😀':mor>=45?'😐':'😟'}</b></span></div>
      <span class="fmen" style="width:86%"><i style="width:${p.kon*5}%;background:${attrCol(p.kon)}"></i></span></div>`;};
  const s2=g('S2');
  return `<div class="lcourt"><div class="fmnet">siatka</div><div class="lcgrid">${[4,3,2,5,6,1].map(card).join('')}</div>
   <div class="small mut" style="margin-top:6px">Ustawienie startowe (ustawienie 1). ${s2?`Środkowy 2 <b style="color:var(--txt)">${esc(s2.last)}</b> wchodzi w pierwszej linii, w drugiej zastępuje go libero.`:''} Kliknij zawodnika, by zobaczyć kartę. Pasek = kondycja (im dłuższy, tym wolniej się męczy).</div></div>`;}
