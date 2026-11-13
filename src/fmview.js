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
  const rows=[['Punkty',t.pts],['Atak',pc(t.kill,t.att)],['Przyjęcie+',pc(t.recPos,t.rec)],['Asy',t.ace],['Bloki',t.blk],['Błędy',t.attErr+t.srvErr]];
  return `<div class="fmst"><div class="fmh"><b style="border-bottom:2px solid ${kc}">${esc(m.sides[i].team.short)}</b></div>${rows.map(r=>`<div class="fmsr"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`;}
// ---- pasek składu ----
function fmStrip(m){const a=m.sides[0];const oc=onCourt(a,m.serving===0);const ord={R:0,A:1,P:2,S:3,L:4};
  const on=oc.slice().sort((x,y)=>ord[x.role]-ord[y.role]||x.zone-y.zone);
  const mine=e=>{const p=e.p,r=liveRating(p),mor=p.mor==null?60:p.mor;const click=!m.over?`onclick="selSub(${e.slot==='L'?"'L'":e.slot})"`:'';
    return `<div class="fmsp ${click?'clk':''} ${ui.subSel===e.slot?'sel':''}" ${click} title="${esc(p.first+' '+p.last)} · energia ${Math.round(p.en)}% · morale ${mor}">
      <span class="fmps2">${POS_SHORT[e.role]}</span>${fmJersey(m,0,e,28)}<b class="fmnm">${esc(p.last)}</b>
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
     <button class="btn sm" onclick="togglePause()">${m.paused?'▶ Graj':'⏸ Pauza'}</button>`}</div></div>`;}
function fmPanel(m){const a=m.sides[0];
  if(ui.fmPanel==='tac')return `<div class="card fmpanel"><div class="row wrap" style="gap:12px">
    <label class="small">Zagrywka <select onchange="setServe(+this.value)">${SERVE_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.serve===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <label class="small">Rozegranie <select onchange="setDist(+this.value)">${DIST_OPT.map((o,i)=>`<option value="${i}" ${a.tactics.dist===i?'selected':''}>${o[0]}</option>`).join('')}</select></label>
    <span class="small mut">${esc(SERVE_OPT[a.tactics.serve][1])} ${esc(DIST_OPT[a.tactics.dist][1])}</span></div>${rotCard(m)}</div>`;
  if(ui.fmPanel==='more')return `<div class="card fmpanel"><div class="row wrap" style="gap:6px">
    <button class="ghost sm" onclick="ui.fmPanel=null;simToSetEnd()">⏭ Do końca seta</button><button class="ghost sm" onclick="ui.fmPanel=null;simToEnd()">⏭⏭ Do końca meczu</button>
    <button class="ghost sm" onclick="ui.mview=ui.mview==='klasyczny'?'hala':'klasyczny';ui.fmPanel=null;render()">${ui.mview==='klasyczny'?'🏟️ Widok hali':'▦ Widok klasyczny'}</button>
    <button class="ghost sm ${ui.anim!==false?'on':''}" onclick="ui.anim=ui.anim===false;render()">🏐 Animacja: ${ui.anim!==false?'wł.':'wył.'}</button>
    <span class="small mut">Libero: <b style="color:var(--txt)">${esc(a.libero.last)}</b> <button class="link" onclick="selSub('L')">zmień</button></span></div></div>`;
  if(ui.fmPanel==='stats')return `<div class="card fmpanel">${statsBlock(m)}</div>`;
  return '';}
function fmLiveView(subPanel){const m=ui.match;
  return `${fmTop(m)}${fmPanel(m)}
  ${ui.talk&&!m.over?talkCard(m):''}
  ${m.over?`<div class="card row"><b>Mecz zakończony: ${esc(m.sides[m.winner].team.name)} wygrywa ${Math.max(...m.setsWon)}:${Math.min(...m.setsWon)}</b><span class="sp"></span><button class="btn" onclick="ui.view='post';render()">Podsumowanie</button><button class="ghost" onclick="ui.match=null;render()">Dalej</button></div>`:''}
  <div class="fmwrap"><div class="fmlay">
   <div class="fml">${fmFormation(m,0)}${fmLiveTable(m)}${fmPlayerStats(m,0)}</div>
   <div class="fmc">
    <div class="fmws">${fmAssistant(m)}${fmMomentum(m)}${fmAttack(m)}</div>
    <div class="card fmcourt">${fmTeamStats(m,0)}<div class="fmcv">
      ${ui.mview==='klasyczny'?courtHtml(m):`<div class="hallbar small mut">🏟️ ${tName(m.homeIdx!=null?m.homeIdx:m.sides[0].team.idx)} · <b style="color:var(--txt)">${(m.att||0).toLocaleString('pl-PL')}</b> / ${(m.cap||0).toLocaleString('pl-PL')} widzów · <span id="mph" class="mph">${m.over?'Koniec meczu':'Przed zagrywką'}</span></div><canvas id="mcv" class="mcv"></canvas>`}</div>${fmTeamStats(m,1)}</div>
   </div>
   <div class="fmr">${fmFormation(m,1)}${fmRecent(m)}${fmPlayerStats(m,1)}</div>
  </div>
  ${fmStrip(m)}
  ${subPanel?`<div class="fmsub">${subPanel}</div>`:''}</div>`;}

// ---- statystyki zawodników pod formacją ----
function fmPlayerStats(m,i){const sd=m.sides[i];const onIds=new Set(onCourt(sd,m.serving===i).map(e=>e.p.id));
  const ps=sd.pl.filter(p=>onIds.has(p.id)||p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0)
    .sort((a,b)=>(onIds.has(b.id)-onIds.has(a.id))||((b.st.kill+b.st.blk+b.st.ace)-(a.st.kill+a.st.blk+a.st.ace)));
  return `<div class="card fmside2 fmps-card"><div class="fmh"><b>Statystyki zawodników</b><span class="small mut">${esc(sd.team.short)}</span></div>
   <table class="fmpt-t"><thead><tr><th class="l">Zawodnik</th><th title="Punkty: atak + blok + as">Pkt</th><th title="Skończone ataki / wszystkie">Atak</th><th title="Przyjęcie pozytywne">Prz+</th><th title="Bloki">Blok</th><th title="Asy">As</th><th title="Błędy: atak, zagrywka, przyjęcie">Bł.</th></tr></thead><tbody>
   ${ps.map(p=>{const x=p.st;const err=x.attErr+x.srvErr+x.recErr;return `<tr class="${onIds.has(p.id)?'':'off'}"><td class="l"><span class="mut">${p.num}</span> ${esc(p.last)}</td><td><b>${x.kill+x.blk+x.ace}</b></td><td>${x.att?`${x.kill}/${x.att}`:'–'}</td><td>${x.rec?pc(x.recPos,x.rec):'–'}</td><td>${x.blk||'–'}</td><td>${x.ace||'–'}</td><td class="${err?'bad':''}">${err||'–'}</td></tr>`;}).join('')}
   </tbody></table></div>`;}
