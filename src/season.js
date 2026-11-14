// ================= SEZON =================
let PLAYERS={};
function rebuildIndex(){PLAYERS={};if(SAVE.world){for(const p of SAVE.world.players)PLAYERS[p.id]={p,t:p.tm>=0&&!p.jr?TEAMS[p.tm]:null};}else for(const t of TEAMS)for(const p of t.players)PLAYERS[p.id]={p,t};}
rebuildIndex();
const N_SPAR=7;
function S(){return SAVE.season;}
function makeFixtures(n){const t=[...Array(n).keys()].sort(()=>R()-0.5);const rounds=[];for(let r=0;r<n-1;r++){const pr=[];for(let i=0;i<n/2;i++){const a=t[i],b=t[n-1-i];pr.push(r%2?[b,a]:[a,b]);}rounds.push(pr);t.splice(1,0,t.pop());}return rounds;}
function newSeason(n,phase){
  const first=makeFixtures(TEAMS.length);const second=first.map(rd=>rd.map(([h,a])=>[a,h]));
  const others=TEAMS.map(t=>t.idx).filter(i=>i!==SAVE.team).sort(()=>R()-0.5).slice(0,N_SPAR);
  SAVE.season={n:n||1,phase:phase||'spar',spar:{opps:others,res:[]},rounds:first.concat(second),round:0,results:[],po:null,final:null,ps:{}};
  if(SAVE.world)for(const p of SAVE.world.players)p.base=snap(p);
  ensureDates(SAVE.season);
  if(SAVE.team!=null&&SAVE.world)SAVE.season.goal=goalFor(SAVE.team);
  SAVE.live=null;save();
}
const PHASE_NAMES={off:'Okno transferowe',spar:'Okres przygotowawczy',liga:'Faza zasadnicza',po:'Play-off',end:'Koniec sezonu'};
function tName(i){return esc(TEAMS[i].name);}
function tDot(i){if(SAVE.custom&&SAVE.custom.idx===i&&typeof crestSvg==='function')return `<span class="tcrest">${crestSvg(TEAMS[i].name,TEAMS[i].short,TEAMS[i].color,14,SAVE.custom.crest)}</span>`;return `<span class="dot" style="background:${TEAMS[i].color}"></span>`;}

// ---- tabela ----
function leagueTable(){return tableFrom(S().results);}
function tableFrom(results){const T=TEAMS.map(t=>({i:t.idx,m:0,w:0,l:0,pts:0,sw:0,sl:0,pw:0,pl:0}));
  for(const rd of results)for(const g of rd){const h=T[g.h],a=T[g.a];h.m++;a.m++;h.sw+=g.sw[0];h.sl+=g.sw[1];a.sw+=g.sw[1];a.sl+=g.sw[0];
    for(const st of g.sets){h.pw+=st[0];h.pl+=st[1];a.pw+=st[1];a.pl+=st[0];}
    const hw=g.sw[0]===3,W=hw?h:a,Lo=hw?a:h,ls=Math.min(...g.sw);W.w++;Lo.l++;W.pts+=ls<=1?3:2;Lo.pts+=ls===2?1:0;}
  const ratio=(x,y)=>y?x/y:x?99:0;
  return T.sort((x,y)=>y.pts-x.pts||y.w-x.w||ratio(y.sw,y.sl)-ratio(x.sw,x.sl)||ratio(y.pw,y.pl)-ratio(x.pw,x.pl));}
function rankOf(i){return leagueTable().findIndex(x=>x.i===i)+1;}

// ---- uczestnicy / symulacja ----
function participant(i,home){const t=TEAMS[i];const mine=i===SAVE.team;return {team:t,lineup:mine?healthyLineup(t,myLineup()).lu:autoLineup(t),tactics:mine?Object.assign({},myTac()):{serve:1,dist:0},home,x:(()=>{const md=clubMods(i);const o={hb:md.hb,fat:md.fat,sb:md.sb};if(mine){o.cap=SAVE.captain;const cx=coachMatchX();o.sb+=(cx.sb||0)+(typeof tacPrep==='function'?tacPrep()*0.004:0)+(typeof oppPrepBonus==='function'?oppPrepBonus():0);o.momMul=cx.momMul;o.prB=cx.prB;o.trB=cx.trB;}return o;})()};}
function resultOf(m,h,a){const flip=m.sides[0].team.idx!==h;return {h,a,sets:m.sets.map(x=>flip?[x[1],x[0]]:x.slice()),sw:flip?[m.setsWon[1],m.setsWon[0]]:m.setsWon.slice()};}
function addTogether(m){try{formAfterMatch(m);}catch(e){console.error(e);}try{if(typeof pairsAfterMatch==='function')pairsAfterMatch(m);}catch(e){}for(const sd of m.sides)for(const p of sd.pl){const x=p.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0&&!sd.slots.some(z=>z.p.id===p.id)&&sd.libero!==p)continue;
  const w=PLAYERS[p.id]&&PLAYERS[p.id].p;if(!w)continue;if(w.tcTm!==sd.team.idx){w.tcTm=sd.team.idx;w.tc=0;}w.tc=(w.tc||0)+1;}}
function recordStats(m){addTogether(m);const s=S();const ps=s.ps;const ts=s.ts||(s.ts={});
  m.sides.forEach((sd,i)=>{const r=ts[sd.team.idx]||(ts[sd.team.idx]={m:0,sets:0,kill:0,att:0,attErr:0,blk:0,ace:0,srvErr:0,srv:0,rec:0,recPos:0,dig:0,pw:0,pl:0});
    r.m++;r.sets+=m.sets.length;for(const st of m.sets){r.pw+=st[i];r.pl+=st[1-i];}
    for(const p of sd.pl){const x=p.st;r.kill+=x.kill;r.att+=x.att;r.attErr+=x.attErr;r.blk+=x.blk;r.ace+=x.ace;r.srvErr+=x.srvErr;r.srv+=x.srv;r.rec+=x.rec;r.recPos+=x.recPos;r.dig+=x.dig;}});
  for(const sd of m.sides)for(const p of sd.pl){const x=p.st;if(x.srv+x.rec+x.att+x.dig+x.blk===0)continue;
    const r=ps[p.id]||(ps[p.id]={m:0,pts:0,kill:0,att:0,attErr:0,blk:0,ace:0,srvErr:0,rec:0,recPos:0,dig:0,mvp:0});
    r.m++;r.kill+=x.kill;r.att+=x.att;r.attErr+=x.attErr;r.blk+=x.blk;r.ace+=x.ace;r.srvErr+=x.srvErr;r.rec+=x.rec;r.recPos+=x.recPos;r.dig+=x.dig;r.pts+=x.kill+x.blk+x.ace;}
  const w=m.sides[m.winner];const mvp=w.pl.slice().sort((a,b)=>mvpScore(b)-mvpScore(a))[0];if(ps[mvp.id])ps[mvp.id].mvp++;
  injuryCheck(m,1);}
function simFixture(h,a,stats){const m=simMatch(participant(h,true),participant(a,false));if(stats)recordStats(m);return resultOf(m,h,a);}

// ---- mecz użytkownika ----
function myNext(){
  const s=S();
  if(s.phase==='spar'){const k=s.spar.res.length;if(k>=N_SPAR)return null;const o=s.spar.opps[k];return k%2===0?{kind:'spar',h:SAVE.team,a:o}:{kind:'spar',h:o,a:SAVE.team};}
  if(s.phase==='liga'){const f=s.rounds[s.round].find(f=>f[0]===SAVE.team||f[1]===SAVE.team);return {kind:'liga',h:f[0],a:f[1]};}
  if(s.phase==='po'){const sr=activeSeries().find(x=>x.hi===SAVE.team||x.lo===SAVE.team);if(!sr)return null;const h=seriesHome(sr);return {kind:'po',sid:sr.id,h,a:h===sr.hi?sr.lo:sr.hi};}
  return null;
}
function buildMatch(ctx){
  const meHome=ctx.h===SAVE.team;const op=meHome?ctx.a:ctx.h;
  const m=newMatch(participant(SAVE.team,meHome),participant(op,!meHome));
  m.log=[];m.paused=false;m.hl=[];m.ctx=ctx;matchCrowd(m);if(meHome&&m.cap){m.sides[0].form+=(m.att/m.cap-0.75)*0.02;}
  m.log.push({t:`${ctx.kind==='spar'?'Sparing':ctx.kind==='po'?'Play-off':'Liga'} · ${meHome?'mecz u siebie':'mecz wyjazdowy'}. Losowanie: seta zaczyna zagrywką <b>${esc(m.sides[m.serving].team.name)}</b>.`,c:'sys'});
  return m;
}
function playNext(){if(SAVE.fired)return;syncDate();const c=myNext();if(!c)return;const m=buildMatch(c);ui.match=m;ui.view='log';ui.subSel=null;ui.tab='mecz';persistLive();render();schedule();}
function simNext(){if(SAVE.fired)return;syncDate();const c=myNext();if(!c)return;const m=buildMatch(c);m.quick=true;while(!m.over)doRally(m);ui.match=m;ui.view='post';ui.tab='mecz';render();}
function finishMatch(m){
  if(m.recorded||!m.ctx)return;m.recorded=true;const c=m.ctx,s=S();
  const res=resultOf(m,c.h,c.a);res.me=true;res.d=today();
  if(c.kind==='spar'){addTogether(m);s.spar.res.push(res);injuryCheck(m,0.5);roundTick('spar',false);}
  else if(c.kind==='liga'){const psB=psSnap(),tbB=leagueTable();recordStats(m);boardAfterMatch(res);const rd=[];for(const f of s.rounds[s.round]){if(f[0]===c.h&&f[1]===c.a)rd.push(res);else rd.push(simFixture(f[0],f[1],true));}
    s.results.push(rd);simJrRound(s.round);s.round++;leagueNews(psB,tbB,rd,s.round);roundTick('liga',c.h===SAVE.team,m.att);if(s.round>=s.rounds.length)startPlayoff();}
  else if(c.kind==='po'){recordStats(m);boardAfterMatch(res);playPoDay(c.sid,res);roundTick('po',c.h===SAVE.team,m.att);}
  try{fatigueAfterMatch(m);}catch(e){}storeLast(m,c);mailMatch(m,c);try{dcRecord(m,c);}catch(e){console.error(e);}try{for(const p of m.sides[1].pl)if(p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0)addKnow(p.id,12);if(SAVE.tactics)delete SAVE.tactics.tgt;}catch(e){}SAVE.live=null;save();
}
function storeLast(m,c){try{const me=m.sides[0];const T=teamTotals(me);const w=m.sides[m.winner];const mvp=w.pl.slice().sort((a,b)=>mvpScore(b)-mvpScore(a))[0];
  const r=resultOf(m,c.h,c.a);const won=m.winner===0;const sc=c.h===SAVE.team?r.sw[0]+':'+r.sw[1]:r.sw[1]+':'+r.sw[0];const op=TEAMS[c.h===SAVE.team?c.a:c.h];
  news(`${won?'✅ Wygrana':'❌ Porażka'} ${sc} z ${op.short} (${c.kind==='spar'?'sparing':c.kind==='po'?'play-off':'liga'}) · MVP: ${mvp?mvp.first+' '+mvp.last:'—'}`);
  if(c.kind==='liga'){const ld=leagueTable()[0].i;if(SAVE.lastLeader!==ld){SAVE.lastLeader=ld;news(`🏆 ${TEAMS[ld].name} ${ld===SAVE.team?'— jesteśmy liderem ligi!':'nowym liderem ligi'}`);}}
  SAVE.lastMatch={h:c.h,a:c.a,sets:r.sets,sw:r.sw,d:today(),home:c.h===SAVE.team,att:m.att||0,mvp:mvp?mvp.last:'',atk:T.att?Math.round(T.kill/T.att*100):0,blk:T.blk,ace:T.ace};}catch(e){}}
function skipSpar(){const s=S();s.phase='liga';syncDate();save();render();}
function endSpar(){const s=S();if(s.phase==='spar'&&s.spar.res.length>=N_SPAR){s.phase='liga';syncDate();save();}}
function simRound(){/* runda bez meczu użytkownika nie występuje w lidze */}

// ---- play-off ----
function mkSeries(st,a,b,need){const ra=rankOf(a),rb=rankOf(b);const hi=ra<rb?a:b,lo=hi===a?b:a;return {id:st+'-'+hi+'-'+lo,st,hi,lo,need,w:[0,0],games:[]};}
function startPlayoff(){const s=S();const tb=leagueTable().map(x=>x.i);s.seed=tb;s.phase='po';
  s.po={stage:'QF',day:0,series:[mkSeries('QF',tb[0],tb[7],2),mkSeries('QF',tb[3],tb[4],2),mkSeries('QF',tb[1],tb[6],2),mkSeries('QF',tb[2],tb[5],2)]};}
function seriesDone(sr){return sr.w[0]>=sr.need||sr.w[1]>=sr.need;}
function seriesWinner(sr){return sr.w[0]>=sr.need?sr.hi:sr.lo;}
function seriesLoser(sr){return sr.w[0]>=sr.need?sr.lo:sr.hi;}
function seriesHome(sr){return sr.games.length%2===0?sr.hi:sr.lo;}
function activeSeries(){const s=S();if(!s.po)return [];const st=s.po.stage;return s.po.series.filter(x=>(st==='FB'?(x.st==='F'||x.st==='B'):x.st===st)&&!seriesDone(x));}
function addGame(sr,res){sr.games.push(res);const hiWon=(res.h===sr.hi)===(res.sw[0]===3);sr.w[hiWon?0:1]++;}
function playPoDay(mySid,myRes){
  const s=S();
  for(const sr of activeSeries()){if(sr.id===mySid){addGame(sr,myRes);continue;}const h=seriesHome(sr);const g=simFixture(h,h===sr.hi?sr.lo:sr.hi,true);g.d=today();addGame(sr,g);}
  s.po.day++;advanceStage();
}
function advanceStage(){
  const s=S(),po=s.po;if(activeSeries().length)return;
  const seedRank=i=>s.seed.indexOf(i);
  if(po.stage==='QF'){const w=po.series.filter(x=>x.st==='QF').map(seriesWinner).sort((a,b)=>seedRank(a)-seedRank(b));
    po.series.push(mkSeriesSeed('SF',w[0],w[3],2),mkSeriesSeed('SF',w[1],w[2],2));po.stage='SF';}
  else if(po.stage==='SF'){const sf=po.series.filter(x=>x.st==='SF');
    po.series.push(mkSeriesSeed('F',seriesWinner(sf[0]),seriesWinner(sf[1]),3),mkSeriesSeed('B',seriesLoser(sf[0]),seriesLoser(sf[1]),2));po.stage='FB';}
  else if(po.stage==='FB'){finishSeason();}
}
function mkSeriesSeed(st,a,b,need){const s=S();const hi=s.seed.indexOf(a)<s.seed.indexOf(b)?a:b;const lo=hi===a?b:a;return {id:st+'-'+hi+'-'+lo,st,hi,lo,need,w:[0,0],games:[]};}
function simPoDay(){if(S().phase!=='po')return;const mine=myNext();if(mine)return;playPoDay(null,null);roundTick('po',false);syncDate();save();render();}
function simPoAll(){while(S().phase==='po'&&!myNext()){playPoDay(null,null);roundTick('po',false);syncDate();}save();render();}
function finishSeason(){
  const s=S(),po=s.po,ser=st=>po.series.filter(x=>x.st===st);
  const F=ser('F')[0],B=ser('B')[0];
  const qfL=ser('QF').map(seriesLoser).sort((a,b)=>s.seed.indexOf(a)-s.seed.indexOf(b));
  s.final=[seriesWinner(F),seriesLoser(F),seriesWinner(B),seriesLoser(B)].concat(qfL,s.seed.slice(8));
  s.phase='end';s.endDate=addDays(s.podates[Math.max(0,s.po.day-1)],3);
  s.final.forEach((ti,pl)=>{const a=SAVE.ai[ti];a.rep=Math.round(clamp(a.rep*0.75+(95-pl*7)*0.25,10,100));});
  const myPl=s.final.indexOf(SAVE.team);money(PRIZE[myPl],'Nagrody');finLog(`Nagroda za ${myPl+1}. miejsce w sezonie ${sLabel(s.n)}`,PRIZE[myPl]);
  SAVE.history=SAVE.history||[];SAVE.history.push({n:s.n,team:SAVE.team,place:s.final.indexOf(SAVE.team)+1,champ:s.final[0],league:s.seed.indexOf(SAVE.team)+1});
  seasonEvaluation();
}
function nextSeason(){if(SAVE.fired)return;offseason();coachOffseason();ui.tab='mecz';render();}

// ---- widoki sezonu ----
function resTxt(g){return `${tName(g.h)} <b>${g.sw[0]}:${g.sw[1]}</b> ${tName(g.a)} <small class="mut">(${g.sets.map(s=>s[0]+':'+s[1]).join(', ')})</small>`;}
function nextCard(c,title){
  const meHome=c.h===SAVE.team,op=TEAMS[meHome?c.a:c.h];
  const w=nextEvent();const when=w?`<div class="when">📅 ${w.d===today()?'Dziś, ':''}${fmtLong(w.d)}${w.t?' · godz. '+w.t:''}</div>`:'';
  return `<div class="card nextm"><div class="mut small">${title}</div>${when}<div class="vs"><span style="--c:${TEAMS[c.h].color}">${tName(c.h)}</span><b>vs</b><span style="--c:${TEAMS[c.a].color}">${tName(c.a)}</span></div>
  <p class="small mut">${meHome?'Mecz u siebie (lekka przewaga własnej hali)':'Mecz wyjazdowy'} · Rywal: siła ${teamStrength(op)} ${stars(teamStrength(op))} · Twój skład: ${lineupStrength(myTeam(),myLineup())} · Zagrywka: ${SERVE_OPT[myTac().serve][0]} · Rozegranie: ${DIST_OPT[myTac().dist][0]}</p>
  ${injWarn()}<div class="row wrap"><button class="btn" onclick="playNext()">▶ Graj mecz</button><button class="ghost" onclick="simNext()">⏩ Symuluj mecz</button></div></div>`;
}
function injWarn(){const h=healthyLineup(myTeam(),myLineup());return h.ch.length?`<p class="small bad">${h.ch.map(([o,n,l])=>`🚑 ${esc(o?o.last:'?')} (${l}) — zastąpi go ${esc(n.last)}`).join('<br>')}</p>`:'';}
function tableHtml(highlightPo){const tb=leagueTable();
  return `<div class="card"><h2>Tabela</h2><div class="tw"><table><thead><tr><th>#</th><th class="l">Drużyna</th><th>M</th><th>Z</th><th>P</th><th>Pkt</th><th>Sety</th><th>Małe pkt</th></tr></thead><tbody>${tb.map((x,i)=>`<tr class="${x.i===SAVE.team?'starter':''} ${i===7?'cut':''}"><td>${i+1}</td><td class="l">${tDot(x.i)}${tName(x.i)}</td><td>${x.m}</td><td>${x.w}</td><td>${x.l}</td><td><b>${x.pts}</b></td><td>${x.sw}:${x.sl}</td><td>${x.pw}:${x.pl}</td></tr>`).join('')}</tbody></table></div>
  <p class="mut small">Miejsca 1–8 grają w play-off. Punktacja: 3:0 i 3:1 to 3 pkt, 3:2 to 2 pkt dla zwycięzcy i 1 pkt dla przegranego.</p></div>`;}
function seasonView(){
  const s=S();let out='';
  if(SAVE.fired)return `<div class="phase">📅 <b>${fmtLong(today())}</b> · Sezon ${sLabel(s.n)}</div>`+firedView()+newsHtml();
  if(s.phase==='off')return `<div class="phase">📅 <b>${fmtLong(today())}</b> · Sezon ${sLabel(s.n)} · ${PHASE_NAMES.off}</div>`+offView()+newsHtml();
  const head=(ui.msg?`<div class="card msg">${ui.msg}</div>`:'')+`<div class="phase">📅 <b>${fmtLong(today())}</b> · Sezon ${sLabel(s.n)} · ${PHASE_NAMES[s.phase]}${s.phase==='liga'?` · kolejka ${s.round+1}/${s.rounds.length}`:''}${s.phase==='spar'?` · sparing ${Math.min(s.spar.res.length+1,N_SPAR)}/${N_SPAR}`:''}</div>`;
  const headB=head+boardCard();
  if(s.phase==='spar'){
    const c=myNext();
    out+=c?nextCard(c,`Sparing ${s.spar.res.length+1}/${N_SPAR} — mecz towarzyski, nie liczy się do tabeli`):`<div class="card"><h2>Sparingi zakończone</h2><button class="btn" onclick="endSpar();render()">Rozpocznij ligę</button></div>`;
    out+=`<div class="card row wrap"><span class="mut small">Sparingi służą do testowania składu i taktyki.</span><span class="sp"></span><button class="ghost" onclick="skipSpar()">Pomiń sparingi i zacznij ligę</button></div>`;
    if(s.spar.res.length)out+=`<div class="card"><h2>Wyniki sparingów</h2>${s.spar.res.map((g,k)=>`<div class="res me"><span class="mut small">${fmtShort(s.sdates[k])}</span> ${resTxt(g)}</div>`).join('')}</div>`;
    return headB+`<div class="card small">🔓 Okno transferowe jest otwarte do końca sparingów. <button class="link" onclick="go('transfery')">Transfery</button></div>`+out+newsHtml();
  }
  if(s.phase==='liga'){
    out+=nextCard(myNext(),`Kolejka ${s.round+1}/${s.rounds.length}`)+tableHtml();
    if(s.results.length)out+=`<div class="card"><h2>Ostatnia kolejka <small class="mut">(${fmtMid(addDays(s.rdates[s.results.length-1],-1))} – ${fmtMid(addDays(s.rdates[s.results.length-1],1))})</small></h2>${s.results[s.results.length-1].map(g=>`<div class="res ${g.me?'me':''}">${resTxt(g)}</div>`).join('')}
      <details><summary class="link">Wszystkie wyniki</summary>${s.results.map((rd,i)=>`<div class="rd"><div class="mut small">Kolejka ${i+1}</div>${rd.map(g=>`<div class="res ${g.me?'me':''}">${resTxt(g)}</div>`).join('')}</div>`).reverse().join('')}</details></div>`;
    out+=`<div class="card"><h2>Twój terminarz</h2><div class="sched">${s.rounds.map((rd,i)=>{const g=rd.find(x=>x[0]===SAVE.team||x[1]===SAVE.team);const r=s.results[i]&&s.results[i].find(x=>x.me);const home=g[0]===SAVE.team;const op=home?g[1]:g[0];
      const won=r&&((r.h===SAVE.team)===(r.sw[0]===3));
      const wd=fixtureWhen(s,i,g);return `<div class="res ${i===s.round?'me':''}"><span class="mut small">K${i+1} · ${fmtShort(wd.d)} ${wd.t}</span> ${home?'🏠':'✈️'} ${tDot(op)}${tName(op)} ${r?`<b class="${won?'good':'bad'}">${home?r.sw[0]+':'+r.sw[1]:r.sw[1]+':'+r.sw[0]}</b>`:''}</div>`;}).join('')}</div></div>`;
    return headB+out+newsHtml();
  }
  if(s.phase==='po'){
    const c=myNext();
    if(c){const sr=s.po.series.find(x=>x.id===c.sid);out+=nextCard(c,`${STAGE[sr.st]} · mecz ${sr.games.length+1} · stan rywalizacji ${seriesScore(sr)} (gra się do ${sr.need} zwycięstw)`);}
    else out+=`<div class="card"><h2>${s.po.series.some(x=>x.hi===SAVE.team||x.lo===SAVE.team)?'Twoja drużyna odpadła z play-off':'Twoja drużyna nie awansowała do play-off'}</h2><div class="row wrap"><button class="btn" onclick="simPoDay()">Rozegraj kolejny dzień</button><button class="ghost" onclick="simPoAll()">Symuluj do końca sezonu</button></div></div>`;
    return headB+out+bracketHtml()+tableHtml()+newsHtml();
  }
  // end
  const f=s.final,my=f.indexOf(SAVE.team)+1;
  out+=`<div class="card post ${my===1?'won':''}"><h2>${my===1?'🏆 MISTRZOSTWO POLSKI!':my<=3?'🥉 Medal!'.replace('🥉',my===2?'🥈':'🥉'):'Koniec sezonu'}</h2>
   <p>${esc(myTeam().name)} kończy sezon ${sLabel(s.n)} na <b>${my}. miejscu</b>.${s.eval?` Cel zarządu (${GOAL_TXT[s.eval.goal]}): ${s.eval.met?'<b class="good">wykonany ✓</b>':'<b class="bad">niewykonany ✗</b>'} · reputacja trenera ${s.eval.dr>=0?'+':''}${s.eval.dr}.`:''}</p>${awardsHtml()}${SAVE.offers&&SAVE.offers.length?`<div class="card"><h3>📨 Oferty pracy dla Ciebie</h3>${offersList(false)}</div>`:''}<button class="btn" onclick="nextSeason()">Przejdź do okna transferowego (sezon ${sLabel(s.n+1)})</button></div>
   <div class="card"><h2>Klasyfikacja końcowa</h2>${f.map((t,i)=>`<div class="res ${t===SAVE.team?'me':''}"><b>${i+1}.</b> ${i<3?['🥇','🥈','🥉'][i]:''} ${tDot(t)}${tName(t)}</div>`).join('')}</div>`;
  if(SAVE.history&&SAVE.history.length>1)out+=`<div class="card"><h2>Historia</h2>${SAVE.history.map(h=>`<div class="res">Sezon ${sLabel(h.n)}: ${tName(h.team)} — ${h.place}. miejsce (po fazie zasadniczej ${h.league}.) · mistrz: ${tName(h.champ)}</div>`).join('')}</div>`;
  return headB+out+bracketHtml();
}
const STAGE={QF:'Ćwierćfinał',SF:'Półfinał',F:'Finał',B:'Mecz o 3. miejsce'};
function seriesScore(sr){return `${sr.w[0]}:${sr.w[1]}`;}
function bracketHtml(){const s=S();if(!s.po)return '';
  const col=st=>{const list=s.po.series.filter(x=>x.st===st);if(!list.length)return `<div class="bcol"><h4>${STAGE[st]}</h4><div class="mut small">—</div></div>`;
    return `<div class="bcol"><h4>${STAGE[st]}</h4>${list.map(sr=>{const d=seriesDone(sr),w=d?seriesWinner(sr):-1;
      return `<div class="ser ${sr.hi===SAVE.team||sr.lo===SAVE.team?'mine':''}"><div class="${w===sr.hi?'win':''}">${tDot(sr.hi)}<span class="mut small">${s.seed.indexOf(sr.hi)+1}.</span> ${tName(sr.hi)}<b>${sr.w[0]}</b></div><div class="${w===sr.lo?'win':''}">${tDot(sr.lo)}<span class="mut small">${s.seed.indexOf(sr.lo)+1}.</span> ${tName(sr.lo)}<b>${sr.w[1]}</b></div>
      ${sr.games.length?`<div class="mut small">${sr.games.map(g=>`${TEAMS[g.h].short} ${g.sw[0]}:${g.sw[1]} ${TEAMS[g.a].short}`).join(' · ')}</div>`:''}</div>`;}).join('')}</div>`;};
  return `<div class="card"><h2>Play-off</h2><div class="bracket">${col('QF')}${col('SF')}${col('F')}${col('B')}</div><p class="mut small">Ćwierćfinały, półfinały i mecz o 3. miejsce do 2 zwycięstw, finał do 3. Wyżej rozstawiony gra u siebie mecze 1, 3 i 5.</p></div>`;}
function awardsHtml(){const L=leaders();const top=(k)=>L[k][0];
  const a=[['MVP sezonu (najwięcej nagród MVP meczu)','mvp'],['Najlepiej punktujący','pts'],['Najlepiej blokujący','blk'],['Najlepiej zagrywający (asy)','ace']];
  return `<div class="awards">${a.map(([l,k])=>{const x=top(k);if(!x||!PLAYERS[x.id]||!PLAYERS[x.id].t)return '';const P=PLAYERS[x.id];return `<div><span class="mut small">${l}</span><br><b>${esc(P.p.first)} ${esc(P.p.last)}</b> ${tDot(P.t.idx)}${esc(P.t.short)} — ${x.v}</div>`;}).join('')}</div>`;}

// ---- statystyki ----
function leaders(){const ps=S().ps;const arr=Object.entries(ps).map(([id,r])=>Object.assign({id},r));
  const by=(f,min)=>arr.filter(x=>!min||min(x)).map(x=>({id:x.id,v:f(x),r:x})).sort((a,b)=>b.v-a.v).slice(0,10);
  const games=Math.max(1,...arr.map(x=>x.m));
  return {pts:by(x=>x.pts),ace:by(x=>x.ace),blk:by(x=>x.blk),mvp:by(x=>x.mvp,x=>x.mvp>0),
    eff:by(x=>Math.round(x.kill/x.att*1000)/10,x=>x.att>=games*6),rec:by(x=>Math.round(x.recPos/x.rec*1000)/10,x=>x.rec>=games*4),dig:by(x=>x.dig)};}
function statsView(){
  const s=S();
  if(!Object.keys(s.ps).length)return `<div class="card"><h2>Statystyki sezonu</h2><p class="mut">Statystyki liczą się od pierwszej kolejki ligi (sparingi się nie liczą). Rozegraj pierwszy mecz ligowy.</p></div>`;
  const L=leaders();
  const box=(t,k,unit)=>`<div class="card lb"><h3>${t}</h3>${L[k].length?L[k].filter(x=>PLAYERS[x.id]&&PLAYERS[x.id].t).map((x,i)=>{const P=PLAYERS[x.id];return `<div class="lrow ${P.t.idx===SAVE.team?'me':''}" onclick="openCard('${P.p.id}')"><span class="mut">${i+1}.</span> ${tDot(P.t.idx)}<span class="ln">${esc(P.p.last)} <small class="mut">${esc(P.t.short)} · ${POS_SHORT[P.p.pos]}</small></span><b>${x.v}${unit||''}</b></div>`;}).join(''):'<p class="mut small">Brak danych</p>'}</div>`;
  const mine=myTeam().players.map(p=>({p,r:s.ps[p.id]})).filter(x=>x.r).sort((a,b)=>b.r.pts-a.r.pts);
  return `<div class="card"><h2>Liderzy sezonu ${sLabel(s.n)}</h2><p class="mut small">Liga i play-off. Skuteczność ataku: minimum 6 ataków na mecz, przyjęcie: minimum 4 przyjęcia na mecz.</p></div>
  <div class="lbgrid">${box('Punkty','pts')}${box('Skuteczność ataku','eff','%')}${box('Bloki','blk')}${box('Asy','ace')}${box('Przyjęcie pozytywne','rec','%')}${box('Obrony','dig')}${box('Nagrody MVP meczu','mvp')}</div>
  ${teamStatsHtml()}
  <div class="card"><h2>${esc(myTeam().name)}: statystyki zawodników</h2><div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz</th><th>M</th><th>Pkt</th><th>Pkt/m</th><th>Atak</th><th>Skut.</th><th>Bł.</th><th>Blok</th><th>As</th><th>Bł.zag</th><th>Przyj.poz</th><th>Obr.</th><th>MVP</th></tr></thead><tbody>
  ${mine.map(({p,r})=>`<tr><td class="l">${p.num} <b>${esc(p.last)}</b></td><td>${POS_SHORT[p.pos]}</td><td>${r.m}</td><td><b>${r.pts}</b></td><td>${(r.pts/r.m).toFixed(1)}</td><td>${r.kill}/${r.att}</td><td>${pc(r.kill,r.att)}</td><td>${r.attErr}</td><td>${r.blk}</td><td>${r.ace}</td><td>${r.srvErr}</td><td>${r.rec?pc(r.recPos,r.rec):'–'}</td><td>${r.dig}</td><td>${r.mvp}</td></tr>`).join('')}</tbody></table></div></div>`;
}

// ---- zapis gry ----
function serMatch(m){return {sides:m.sides.map(s=>({ti:s.team.idx,pl:s.pl.map(p=>({id:p.id,en:p.en,st:p.st,mor:p.mor})),tmp:s.tmp,slots:s.slots.map(x=>({role:x.role,id:x.p.id})),lib:s.libero.id,rot:s.rot,tactics:s.tactics,mom:s.mom,home:s.home,fatMul:s.fatMul,momMul:s.momMul,prB:s.prB,trB:s.trB,form:s.form,to:s.to,subs:s.subs,chem:s.chem})),
  setNo:m.setNo,score:m.score,setsWon:m.setsWon,sets:m.sets,firstServe:m.firstServe,serving:m.serving,run:m.run,rallies:m.rallies,sideout:m.sideout,log:m.log.slice(-150),ctx:m.ctx,hist:m.hist||[],att:m.att,cap:m.cap,hallLv:m.hallLv,homeIdx:m.homeIdx,mid:m.mid,dirStats:m.dirStats||[],mixN:m.mixN||[0,0],rs:m.rs,pt:m.pt};}
function deserMatch(o){const m=Object.assign({},o,{over:false,paused:true,hl:[]});
  m.sides=o.sides.map(x=>{const t=TEAMS[x.ti];const pl=t.players.map(cloneP);const g=id=>pl.find(p=>p.id===id);
    if(typeof pairBonusSide==='function'){try{pairBonusSide(t,{R:x.slots[0].id,P1:x.slots[1].id,S1:x.slots[2].id,A:x.slots[3].id,P2:x.slots[4].id,S2:x.slots[5].id,L:x.lib},pl);}catch(e){}}
    for(const q of x.pl){const p=g(q.id);if(!p)continue;p.en=q.en;p.st=q.st;if(q.mor!=null)p.mor=q.mor;}
    return {team:t,pl,slots:x.slots.map(s=>({role:s.role,p:g(s.id)})),libero:g(x.lib),tmp:x.tmp,rot:x.rot,tactics:x.tactics,mom:x.mom,home:x.home,fatMul:x.fatMul||1,momMul:x.momMul||1,prB:x.prB||0,trB:x.trB||0,form:x.form,to:x.to,subs:x.subs,chem:x.chem!=null?x.chem:chemOf(x.slots.map(s=>g(s.id)).concat([g(x.lib)]),t.idx)};});
  if(m.att==null&&m.ctx)matchCrowd(m);
  return m;}
function persistLive(){const m=ui.match;SAVE.live=m&&!m.over&&m.ctx?serMatch(m):null;save();}
let storageOk=true;
function save(){try{localStorage.setItem(KEY,JSON.stringify(SAVE));storageOk=true;}catch(e){storageOk=false;}}
function slotKey(i){return KEY+'_slot'+i;}
function slotInfo(i){try{const o=JSON.parse(localStorage.getItem(slotKey(i)));return o;}catch(e){return null;}}
function descSave(o){if(!o||o.team==null)return 'pusty';const s=o.season;return `${esc(TEAMS[o.team].name)} · sezon ${s?sLabel(s.n):''} · ${s?PHASE_NAMES[s.phase]:''}${s&&s.phase==='liga'?' (kolejka '+(s.round+1)+')':''}${o.savedAt?' · '+esc(o.savedAt):''}`;}
function saveSlot(i){persistLive();const o=Object.assign({},SAVE,{savedAt:new Date().toLocaleString('pl-PL')});try{localStorage.setItem(slotKey(i),JSON.stringify(o));ui.msg=`Zapisano w slocie ${i}.`;}catch(e){ui.msg='Nie udało się zapisać — przeglądarka blokuje pamięć. Użyj kodu zapisu.';}render();}
function loadObj(o){clearTimeout(timer);SAVE=o;delete SAVE.savedAt;restoreDefs();if(!SAVE.world)initWorld();else syncTeams();migrateDates();initClub();ui.match=SAVE.live?deserMatch(SAVE.live):null;ui.confirm=null;ui.card=null;save();}
function loadSlot(i){const o=slotInfo(i);if(!o)return;loadObj(o);ui.msg=`Wczytano slot ${i}.`;ui.tab='mecz';render();}
function delSlot(i){if(ui.confirm!=='del'+i){ui.confirm='del'+i;render();return;}try{localStorage.removeItem(slotKey(i));}catch(e){}ui.confirm=null;ui.msg=`Usunięto slot ${i}.`;render();}
function exportCode(){persistLive();ui.code=btoa(unescape(encodeURIComponent(JSON.stringify(SAVE))));render();}
function copyCode(){const t=ui.code;try{navigator.clipboard.writeText(t).then(()=>{ui.msg='Skopiowano kod zapisu.';render();},()=>{ui.msg='Nie udało się skopiować — zaznacz kod i skopiuj ręcznie.';render();});}catch(e){ui.msg='Nie udało się skopiować — zaznacz kod i skopiuj ręcznie.';render();}}
function importCode(){const v=($('#imp')||{}).value||'';try{const o=JSON.parse(decodeURIComponent(escape(atob(v.trim()))));if(o.team==null||!o.season)throw 0;loadObj(o);ui.msg='Wczytano grę z kodu.';ui.code=null;ui.tab='mecz';}catch(e){ui.msg='Ten kod zapisu jest nieprawidłowy.';}render();}
function newGame(){if(ui.confirm!=='new'){ui.confirm='new';render();return;}clearTimeout(timer);SAVE={};resetTeams();ui.match=null;ui.confirm=null;save();render();}
function saveView(){
  return `${ui.msg?`<div class="card msg">${ui.msg}</div>`:''}
  <div class="card"><h2>Zapis gry</h2><p>${storageOk?'✅ Gra zapisuje się automatycznie po każdym meczu i w trakcie meczu, więc po zamknięciu strony wrócisz w to samo miejsce.':'⚠️ Ta przeglądarka nie pozwala na zapis. Używaj kodu zapisu poniżej.'}</p>
  <p class="mut small">Zapis jest w tej przeglądarce na tym urządzeniu. Żeby przenieść grę na inne urządzenie, użyj kodu zapisu.</p></div>
  <div class="card"><h2>Sloty</h2>${[1,2,3].map(i=>{const o=slotInfo(i);return `<div class="slot"><b>Slot ${i}</b><span class="mut small">${descSave(o)}</span><span class="sp"></span><button class="ghost" onclick="saveSlot(${i})">Zapisz</button>${o?`<button class="ghost" onclick="loadSlot(${i})">Wczytaj</button><button class="ghost" onclick="delSlot(${i})">${ui.confirm==='del'+i?'Na pewno usunąć?':'Usuń'}</button>`:''}</div>`;}).join('')}</div>
  <div class="card"><h2>Kod zapisu</h2><p class="mut small">Kod to cała gra zapisana jako tekst. Skopiuj go (np. do notatek albo wiadomości do siebie) i wklej na innym urządzeniu.</p>
  <div class="row wrap"><button class="ghost" onclick="exportCode()">Pokaż kod zapisu</button>${ui.code?'<button class="btn" onclick="copyCode()">Kopiuj</button>':''}</div>
  ${ui.code?`<textarea readonly class="code" onclick="this.select()">${ui.code}</textarea>`:''}
  <h3>Wczytaj z kodu</h3><textarea id="imp" class="code" placeholder="Wklej kod zapisu…"></textarea><button class="ghost" onclick="importCode()">Wczytaj</button></div>
  <div class="card"><h2>Nowa gra</h2><p class="mut small">Kasuje bieżącą grę (sloty zostają).</p><button class="ghost" onclick="newGame()">${ui.confirm==='new'?'Na pewno? Kliknij jeszcze raz':'Nowa gra'}</button></div>`;
}

function teamStatsHtml(){const ts=S().ts;if(!ts)return '';
  const cols=[['Atak %',r=>r.kill/r.att*100,1,1],['Błędy ataku / set',r=>r.attErr/r.sets,2,-1],['Bloki / set',r=>r.blk/r.sets,2,1],['Asy / set',r=>r.ace/r.sets,2,1],['Błędy zagr. / set',r=>r.srvErr/r.sets,2,-1],['Przyjęcie poz. %',r=>r.recPos/r.rec*100,1,1],['Obrony / set',r=>r.dig/r.sets,1,1],['Małe pkt / set',r=>(r.pw-r.pl)/r.sets,2,1]];
  const rows=Object.entries(ts).map(([i,r])=>({i:+i,r}));
  const best=cols.map(([,f,,dir])=>{const v=rows.map(x=>f(x.r));return dir>0?Math.max(...v):Math.min(...v);});
  const sk=ui.tsort||0;rows.sort((a,b)=>(cols[sk][1](b.r)-cols[sk][1](a.r))*cols[sk][3]);
  return `<div class="card"><h2>Drużyny</h2><div class="tw"><table><thead><tr><th class="l">Drużyna</th><th>M</th>${cols.map(([l],j)=>`<th onclick="ui.tsort=${j};render()" class="${sk===j?'on':''}">${l}</th>`).join('')}</tr></thead><tbody>
  ${rows.map(({i,r})=>`<tr class="${i===SAVE.team?'starter':''}"><td class="l">${tDot(i)}${tName(i)}</td><td>${r.m}</td>${cols.map(([,f,d],j)=>{const v=f(r);return `<td class="${Math.abs(v-best[j])<1e-9?'best':''}">${v.toFixed(d).replace('.',',')}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>
  <p class="mut small">Liga i play-off. Najlepsza wartość w kolumnie jest wyróżniona. Kliknij nagłówek, żeby posortować.</p></div>`;}

// ---- zakładka Tabela ----
function formOf(results,ti){const f=[];for(const rd of results)for(const g of rd){if(g.h!==ti&&g.a!==ti)continue;const my=g.h===ti?g.sw[0]:g.sw[1];const op=g.h===ti?g.sw[1]:g.sw[0];f.push({w:my>op,s:my+':'+op,op:g.h===ti?g.a:g.h,home:g.h===ti});}return f.slice(-5);}
function tablesView(){
  const s=S();const which=ui.tabSel||'sen';const jr=which==='jr';
  const res=jr?(s.jres||[]):s.results;const tb=tableFrom(res);const played=res.length;
  const ratio=(a,b)=>b?(a/b).toFixed(3).replace('.',','):(a?'MAX':'–');
  const rows=tb.map((x,i)=>{const f=formOf(res,x.i);
    return `<tr class="${x.i===SAVE.team?'starter':''} ${!jr&&i===7?'cut':''}"><td>${i+1}</td><td class="l">${tDot(x.i)}${tName(x.i)}${jr?' U20':''}</td><td>${x.m}</td><td>${x.w}</td><td>${x.l}</td><td><b>${x.pts}</b></td><td>${x.sw}:${x.sl}</td><td class="mut">${ratio(x.sw,x.sl)}</td><td>${x.pw}:${x.pl}</td><td class="mut">${ratio(x.pw,x.pl)}</td>
    <td class="l"><span class="form">${f.map(r=>`<i class="${r.w?'fw':'fl'}" title="${r.home?'dom':'wyjazd'} vs ${esc(TEAMS[r.op].name)}: ${r.s}">${r.w?'Z':'P'}</i>`).join('')}</span></td></tr>`;}).join('');
  const info=jr?`Liga juniorów U20 · ${played}/${s.rounds.length} kolejek${s.jchamp!=null?` · 🏆 mistrz: ${tName(s.jchamp)} U20`:''}`
    :`Faza zasadnicza · ${played}/${s.rounds.length} kolejek · miejsca 1–8 grają w play-off${s.final?` · 🏆 mistrz Polski: ${tName(s.final[0])}`:''}`;
  return `<div class="card"><div class="row wrap"><button class="tabb ${!jr?'on':''}" onclick="ui.tabSel='sen';render()">Seniorzy</button><button class="tabb ${jr?'on':''}" onclick="ui.tabSel='jr';render()">Juniorzy U20</button><span class="sp"></span><span class="small mut">Sezon ${sLabel(s.n)}</span></div>
  <p class="small mut">${info}</p>
  ${played?`<div class="tw"><table class="ltable"><thead><tr><th>#</th><th class="l">Drużyna</th><th title="Mecze">M</th><th title="Zwycięstwa">Z</th><th title="Porażki">P</th><th>Pkt</th><th>Sety</th><th title="Stosunek setów">Ratio</th><th>Małe pkt</th><th title="Stosunek małych punktów">Ratio</th><th class="l">Forma</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="mut">Tabela pojawi się po pierwszej kolejce fazy zasadniczej.</p>'}
  <p class="mut small">Punktacja: 3:0 i 3:1 to 3 pkt, 3:2 to 2 pkt dla zwycięzcy i 1 pkt dla przegranego. Kolejność: punkty, zwycięstwa, stosunek setów, stosunek małych punktów. Forma: ostatnie 5 meczów (Z = zwycięstwo, P = porażka), najnowszy po prawej.</p></div>
  ${!jr&&s.po?bracketHtml():''}`;
}
