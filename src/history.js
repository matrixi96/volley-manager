// ================= HISTORIA I REKORDY =================
// Zbierane od momentu wprowadzenia (wcześniejszych sezonów nie da się odtworzyć).
function HIST(){return SAVE.hist||(SAVE.hist={seasons:[],rec:{},str:{},club:{}});}
const REC_L={matchPts:'Najwięcej punktów zawodnika w meczu',matchAce:'Najwięcej asów zawodnika w meczu',matchBlk:'Najwięcej bloków zawodnika w meczu',
  seasonPts:'Najwięcej punktów zawodnika w sezonie',streak:'Najdłuższa seria zwycięstw drużyny',titles:'Najwięcej tytułów mistrza kraju'};
function pName(id){const P=PLAYERS[id];return P?`${P.p.first[0]}. ${P.p.last}`:'?';}
function hRec(k,v,o){const R=HIST().rec;if(!R[k]||v>R[k].v){R[k]=Object.assign({v,d:today(),n:S().n},o);return true;}return false;}
// po każdym zapisanym meczu: rekordy meczowe i serie zwycięstw
function histAfterMatch(m){try{const H=HIST();
  for(const sd of m.sides)for(const p of sd.pl){const x=p.st;if(!x)continue;const pts=x.kill+x.blk+x.ace;const o={id:p.id,nm:pName(p.id),tm:sd.team.idx,vs:m.sides[1-m.sides.indexOf(sd)].team.idx};
    hRec('matchPts',pts,o);hRec('matchAce',x.ace,o);hRec('matchBlk',x.blk,o);}
  m.sides.forEach((sd,i)=>{const t=sd.team.idx;if(t==null||t<0)return;const s=H.str[t]||(H.str[t]={c:0});if(m.winner===i){s.c++;hRec('streak',s.c,{tm:t});}else s.c=0;});}catch(e){console.error(e);}}
// na koniec sezonu (przed przejściem do następnego): mistrzowie, puchary, MVP, legendy klubu
function histSeasonEnd(){const H=HIST();const s=S();if(!s||s.phase!=='end'||H.seasons.some(x=>x.n===s.n))return;
  const lf=s.lgFinal||SAVE.lastFinal||{};const E=s.euro||{};
  const row={n:s.n,lab:sLabel(s.n),lg:{},cup:Object.assign({},SAVE.lastCupCh||{}),cl:E.cl&&E.cl.champ!=null?E.cl.champ:null,cev:E.cev&&E.cev.champ!=null?E.cev.champ:null,mvp:{},top:{},my:{tm:SAVE.team,lg:myLg(),pl:s.final?s.final.indexOf(SAVE.team)+1:null}};
  for(const k in lf)row.lg[k]=lf[k].slice(0,3);
  for(const k in lf){try{const L=Object.entries(s.ps||{}).filter(([id])=>{const P=PLAYERS[id];return P&&P.t&&lgOf(P.t.idx)===+k;}).map(([id,r])=>Object.assign({id},r));if(!L.length)continue;const mx=Math.max(...L.map(r=>r.m));
      const el=L.filter(r=>r.m>=mx*0.5);const av=r=>(r.rs||0)/(r.rn||1);const mvp=el.slice().sort((a,b)=>(b.mvp-a.mvp)||(av(b)-av(a)))[0];const top=L.slice().sort((a,b)=>b.pts-a.pts)[0];
      if(mvp)row.mvp[k]={id:mvp.id,nm:pName(mvp.id),tm:PLAYERS[mvp.id]&&PLAYERS[mvp.id].t?PLAYERS[mvp.id].t.idx:null};
      if(top){row.top[k]={id:top.id,nm:pName(top.id),pts:top.pts};hRec('seasonPts',top.pts,{id:top.id,nm:pName(top.id),tm:PLAYERS[top.id]&&PLAYERS[top.id].t?PLAYERS[top.id].t.idx:null});}}catch(e){}}
  try{row.aw=histAwards(s,lf);}catch(e){console.error(e);}
  H.seasons.push(row);
  // tytuły mistrza (najwyższe ligi)
  const tc={};for(const r of H.seasons)for(const k in r.lg)if(LG_LV[+k]===0&&r.lg[k][0]!=null)tc[r.lg[k][0]]=(tc[r.lg[k][0]]||0)+1;
  const best=Object.entries(tc).sort((a,b)=>b[1]-a[1])[0];if(best)HIST().rec.titles={v:best[1],tm:+best[0],n:s.n};
  // legendy mojego klubu
  const ps=s.ps||{};const tr=[];if(row.my.pl===1)tr.push('🏆');if(row.cup[myCountry()]===SAVE.team)tr.push('🏆P');if(row.cl===SAVE.team)tr.push('🏆LM');if(row.cev===SAVE.team)tr.push('🏆CEV');
  for(const p of myTeam().players){const r=ps[p.id];if(!r||!r.m)continue;const c=H.club[p.id]||(H.club[p.id]={nm:`${p.first} ${p.last}`,pos:p.pos,s:0,m:0,pts:0,tr:0,mvp:0});
    c.nm=`${p.first} ${p.last}`;c.s++;c.m+=r.m;c.pts+=r.pts;c.mvp+=r.mvp||0;c.tr+=tr.length;c.last=s.n;}}
function tmN(i){return i!=null&&TEAMS[i]?TEAMS[i].name:'—';}
function historyView(){const H=HIST();const tab=ui.hTab||'mistrz';
  const tabs=[['mistrz','Mistrzowie'],['rek','Rekordy'],['leg','Legendy klubu'],['kar','Kariera trenera']];
  const head=`<div class="card"><div class="row wrap" style="gap:6px">${tabs.map(([k,l])=>`<button class="${tab===k?'btn':'ghost'} sm" onclick="ui.hTab='${k}';render()">${l}</button>`).join('')}</div></div>`;
  const empty=`<p class="mut">Historia zbiera się od sezonu, w którym ją wprowadzono. Po zakończeniu bieżącego sezonu pojawią się tu pierwsze wpisy.</p>`;
  let body='';
  if(tab==='mistrz'){const S2=H.seasons.slice().reverse();
    body=S2.length?S2.map(r=>`<div class="card"><h2>Sezon ${esc(r.lab)}</h2><div class="tw"><table><thead><tr><th class="l">Rozgrywki</th><th class="l">Mistrz</th><th class="l">2.</th><th class="l">3.</th><th class="l">MVP</th></tr></thead><tbody>
      ${Object.keys(r.lg).map(k=>`<tr><td class="l">${esc(lgFull(+k))}</td>${[0,1,2].map(j=>`<td class="l">${r.lg[k][j]===SAVE.team?'<b>':''}${esc(tmN(r.lg[k][j]))}${r.lg[k][j]===SAVE.team?'</b>':''}</td>`).join('')}<td class="l">${r.mvp[k]?esc(r.mvp[k].nm):'—'}</td></tr>`).join('')}
      ${Object.keys(r.cup).map(c=>`<tr><td class="l">${esc(typeof cupName==='function'?cupName(c):'Puchar '+c)}</td><td class="l">${esc(tmN(r.cup[c]))}</td><td></td><td></td><td></td></tr>`).join('')}
      ${r.cl!=null?`<tr><td class="l">Liga Mistrzów</td><td class="l">${esc(tmN(r.cl))}</td><td></td><td></td><td></td></tr>`:''}${r.cev!=null?`<tr><td class="l">Puchar CEV</td><td class="l">${esc(tmN(r.cev))}</td><td></td><td></td><td></td></tr>`:''}
      </tbody></table></div>${r.aw&&Object.keys(r.aw).length?`<h3 style="margin-top:10px">Nagrody indywidualne</h3><div class="tw"><table><thead><tr><th class="l">Liga</th>${Object.keys(AW_L).map(k=>`<th class="l">${AW_L[k].replace('Najlepszy ','').replace('Najlepsze ','')}</th>`).join('')}</tr></thead><tbody>${Object.keys(r.aw).map(k=>`<tr><td class="l">${esc(lgFull(+k))}</td>${Object.keys(AW_L).map(pos=>{const x=r.aw[k][pos];return `<td class="l">${x?`${x.tm===SAVE.team?'<b>':''}${esc(x.nm)}${x.tm===SAVE.team?'</b>':''} <small class="mut">${esc(TEAMS[x.tm]?TEAMS[x.tm].short:'')}</small>`:'—'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:''}</div>`).join(''):`<div class="card">${empty}</div>`;}
  else if(tab==='rek'){const R=H.rec;const ks=Object.keys(REC_L).filter(k=>R[k]);
    body=`<div class="card"><h2>Rekordy</h2>${ks.length?`<div class="tw"><table><thead><tr><th class="l">Rekord</th><th>Wartość</th><th class="l">Kto</th><th class="l">Kiedy</th></tr></thead><tbody>${ks.map(k=>{const r=R[k];const who=r.nm?`${esc(r.nm)} (${esc(tmN(r.tm))})${r.vs!=null?' vs '+esc(tmN(r.vs)):''}`:esc(tmN(r.tm));return `<tr><td class="l">${REC_L[k]}</td><td><b>${r.v}</b></td><td class="l">${who}</td><td class="l">${k==='titles'?'—':esc(r.d||sLabel(r.n))}</td></tr>`;}).join('')}</tbody></table></div>`:empty}</div>`;}
  else if(tab==='leg'){const L=Object.entries(H.club).filter(([,c])=>c.s>=1).sort((a,b)=>(b[1].s*10+b[1].tr*15+b[1].pts/40)-(a[1].s*10+a[1].tr*15+a[1].pts/40)).slice(0,25);
    body=`<div class="card"><h2>Legendy klubu</h2><p class="small mut">Zawodnicy, którzy grali w Twoim klubie: sezony, mecze, punkty, trofea zdobyte z klubem.</p>${L.length?`<div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz.</th><th>Sezony</th><th>Mecze</th><th>Punkty</th><th>MVP meczu</th><th>Trofea</th></tr></thead><tbody>${L.map(([id,c])=>`<tr><td class="l">${esc(c.nm)}${PLAYERS[id]&&PLAYERS[id].t&&PLAYERS[id].t.idx===SAVE.team?'':' <span class="small mut">(odszedł)</span>'}</td><td>${esc(c.pos||'')}</td><td>${c.s}</td><td>${c.m}</td><td>${c.pts}</td><td>${c.mvp}</td><td>${c.tr}</td></tr>`).join('')}</tbody></table></div>`:empty}</div>`;}
  else {const c=coach();const hs=(c.hist||[]);
    body=`<div class="card"><h2>Kariera trenera</h2>${hs.length?`<div class="tw"><table><thead><tr><th class="l">Sezon</th><th class="l">Klub</th><th class="l">Liga</th><th>Miejsce</th><th class="l">Cel zarządu</th></tr></thead><tbody>${hs.map(h=>`<tr><td class="l">${esc(sLabel(h.n))}</td><td class="l">${esc(tmN(h.team))}</td><td class="l">${h.team!=null&&TEAMS[h.team]?esc(lgFull(lgOf(h.team))):''}</td><td>${h.fired?'zwolniony':h.place||'—'}</td><td class="l">${h.fired?'':h.met?'✅ spełniony':'❌ niespełniony'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">Pierwszy sezon jeszcze trwa.</p>'}
      <h3 style="margin-top:12px">Trofea</h3>${(c.trophies||[]).length?`<div>${c.trophies.map(t=>`<div class="small">${esc(t)}</div>`).join('')}</div>`:'<p class="mut small">Jeszcze bez trofeów.</p>'}
      <p class="small mut" style="margin-top:8px">Oferty pracy przychodzą także z klubów z innych krajów (Niemcy, Włochy, Turcja), jeśli Twoja reputacja na to pozwala.</p></div>`;}
  return head+body;}

// nagrody sezonu według pozycji (ligi ze statystykami zawodników)
const AW_L={A:'Najlepszy atakujący',P:'Najlepszy przyjmujący',S:'Najlepszy środkowy',R:'Najlepszy rozgrywający',L:'Najlepsze libero'};
function histAwards(s,lf){const out={};const ps=s.ps||{};
  for(const k in lf){const l=+k;const L=Object.entries(ps).filter(([id])=>{const P=PLAYERS[id];return P&&P.t&&lgOf(P.t.idx)===l;}).map(([id,r])=>Object.assign({id,p:PLAYERS[id].p,tm:PLAYERS[id].t.idx},r));if(L.length<10)continue;
    const mx=Math.max(...L.map(r=>r.m));const el=L.filter(r=>r.m>=mx*0.5);const place=i=>{const x=lf[k].indexOf(i);return x<0?lf[k].length:x;};const N=lf[k].length;
    const sc={A:r=>r.pts/r.m,P:r=>r.rec>=r.m*3?r.pts/r.m*0.6+r.recPos/r.rec*30:-1,S:r=>(r.blk*1.5+r.kill)/r.m,L:r=>r.rec>=r.m*3?r.recPos/r.rec*100+r.dig/r.m*2:-1,R:r=>r.p.roz+(N-place(r.tm))*0.5};
    const A={};for(const pos in sc){const c=el.filter(r=>r.p.pos===pos).map(r=>[r,sc[pos](r)]).filter(x=>x[1]>=0).sort((a,b)=>b[1]-a[1])[0];if(!c)continue;const r=c[0];
      A[pos]={id:r.id,nm:pName(r.id),tm:r.tm};const p=r.p;(p.aw=p.aw||[]).push({k:pos,n:s.n,l});
      if(r.tm===SAVE.team)news(`🏅 ${p.first} ${p.last}: ${AW_L[pos].toLowerCase()} ${lgFull(l)} w sezonie ${sLabel(s.n)}!`);}
    out[k]=A;}
  return out;}
// nagrody podnoszą wartość zawodnika (do +15% przez dwa kolejne sezony)
function awBonus(p){if(!p.aw||!p.aw.length||!S())return 0;const n=S().n;return Math.min(0.15,p.aw.filter(a=>n-a.n<=2).length*0.06);}
{const _pv=pValue;pValue=function(p){const v=_pv(p);const b=awBonus(p);return b?Math.round(v*(1+b)/10000)*10000:v;};}
function awTxt(p){return (p.aw||[]).map(a=>`🏅 ${AW_L[a.k]} — ${LG_N[a.l]} ${sLabel(a.n)}`);}
