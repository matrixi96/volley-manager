// ================= ZAWODNICY: CHARAKTER, KAPITAN, SZYBKI PODGLĄD, SKŁAD =================
const KEY_ATTR={R:['roz','tpa','czy','zag','blo','kcj'],A:['ata','sil','sko','zag','blo','opa'],P:['prz','ata','obr','tod','zag','kiw'],S:['blo','ata','czy','szy','sko','zag'],L:['prz','obr','tod','zwi','czy','kom']};
function attrName(k){return (ALL_ATTRS.find(x=>x[0]===k)||[])[1]||k;}
function attrSh(k){return (ALL_ATTRS.find(x=>x[0]===k)||[])[2]||k;}
function trChip(k,full){const t=TRAITS[k];if(!t)return '';return `<span class="trc" style="--c:${t[1]}" title="${esc(t[0]+': '+t[2])}">${full?t[0]:t[3]}</span>`;}
function trChips(p,full){ensTraits(p);return p.tr.map(k=>trChip(k,full)).join('');}
function capOk(id){return myTeam().players.some(p=>p.id===id);}
function myCaptain(){if(SAVE.captain&&capOk(SAVE.captain))return PLAYERS[SAVE.captain].p;const lu=myLineup();const t=myTeam();const c=autoCaptain(Object.values(lu).map(id=>t.players.find(p=>p.id===id)));if(c)SAVE.captain=c.id;return c;}
function setCaptain(id){const p=PLAYERS[id]&&PLAYERS[id].p;if(!p||p.tm!==SAVE.team)return;SAVE.captain=id;news(`©️ ${p.first} ${p.last} nowym kapitanem drużyny.`);save();render();}
function isCap(p){const c=myCaptain();return c&&c.id===p.id;}
function capBadge(p){return isCap(p)?'<span class="capb" title="Kapitan drużyny">C</span>':'';}
function capInfo(c){if(!c)return '';const b=capBonus(c);const v=b>=0.05?['świetny','var(--good)']:b>=0.02?['dobry','#a3e635']:b>-0.01?['przeciętny','var(--acc)']:['słaby','var(--bad)'];
  return `<span style="color:${v[1]}"><b>${v[0]}</b></span> kapitan`;}
function morEmo(m){m=m==null?60:m;return m>=62?'😀':m>=45?'😐':'😟';}

// ---- szybki podgląd zawodnika (po kliknięciu) ----
function openPop(id){ui.pop=id;render();}
function popModal(){const P=PLAYERS[ui.pop];if(!P){ui.pop=null;return '';}const p=P.p;const mine=p.tm===SAVE.team;ensTraits(p);
  const ks=KEY_ATTR[p.pos]||KEY_ATTR.P;const mor=p.mor==null?60:p.mor;
  return `<div class="modal" onclick="if(event.target===this){ui.pop=null;render()}"><div class="mcard ppop">
   <div class="row" style="gap:12px"><span class="cface">${pFace(p,72)}</span><div style="min-width:0"><div class="mut small">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].name):'Wolny zawodnik'}</div>
    <h2 style="margin:2px 0">${p.num&&p.tm>=0?p.num+'. ':''}${esc(p.first)} ${esc(p.last)} ${mine?capBadge(p):''}</h2>
    <div class="small mut">${POS_NAMES[p.pos]} · ${p.age} l. · ${p.h} cm · ocena <b style="color:var(--acc)">${rating(p)}</b>${p.inj?` · <span class="bad">🚑 ${p.inj} dni</span>`:''}</div></div><span class="sp"></span><button class="ghost" onclick="ui.pop=null;render()">✕</button></div>
   <div class="pkey">${ks.map(k=>`<div title="${esc((ALL_ATTRS.find(x=>x[0]===k)||[])[3]||'')}"><span>${attrName(k)}</span><i><b style="width:${p[k]*5}%;background:${attrCol(p[k])}"></b></i><em style="color:${attrCol(p[k])}">${p[k]}</em></div>`).join('')}</div>
   <div class="pmeta"><div><small>Kondycja</small><b style="color:${attrCol(p.kon)}">${p.kon}</b></div>${mine?`<div><small>Morale</small><b>${morEmo(mor)}</b></div>`:''}<div><small>Potencjał</small><b class="stars">${potStars(p)}</b></div><div><small>Wartość</small><b>${fmt(pValue(p))}</b></div></div>
   <div class="ptr">${p.tr.map(k=>`<div>${trChip(k,true)}<span class="small mut">${esc(TRAITS[k][2])}</span></div>`).join('')}</div>
   <div class="row wrap" style="gap:8px;margin-top:10px"><button class="btn" onclick="const i=ui.pop;ui.pop=null;openCard(i)">Pełna karta zawodnika</button>
    ${mine&&!p.jr?(isCap(p)?'<span class="small mut">To jest kapitan drużyny.</span>':`<button class="ghost" onclick="ui.pop=null;setCaptain('${p.id}')">©️ Mianuj kapitanem</button>`):''}</div></div></div>`;}

// ---- boisko w zakładce Skład: cała siódemka z twarzami ----
function lineupCourt(t,lu){const g=k=>t.players.find(p=>p.id===lu[k]);
  const Z={1:['R','Rozgrywający'],2:['P1','Przyjmujący'],3:['S1','Środkowy'],4:['A','Atakujący'],5:['P2','Przyjmujący'],6:['S2','Środkowy']};
  const card=(k,lab,z)=>{const p=g(k);if(!p)return `<div class="lcz empty">${z||''}</div>`;const pos=LINEUP_KEYS.find(x=>x[0]===k)[2];const r=rating(p,pos);
    const ks=(KEY_ATTR[pos]||[]).slice(0,3);
    return `<div class="lcz ${k==='L'?'lib':''}" onclick="openPop('${p.id}')" title="${esc(p.first+' '+p.last)} · ${lab}">
      ${z?`<span class="lczn">${z}</span>`:''}${p.inj?'<span class="lcinj" title="Kontuzja">🚑</span>':''}
      <div class="lcf">${pFace(p,46)}${capBadge(p)}<span class="lcnum">${p.num}</span></div>
      <b class="fmnm" style="font-size:13px">${esc(p.last)}</b><span class="fmps2">${lab.toUpperCase()}${k==='S2'?' · ZA NIEGO LIBERO':''}</span>
      <div class="lcst"><span title="Ocena na tej pozycji"><small>ocena</small><b style="color:var(--acc)">${r}</b></span>${ks.map(a=>`<span title="${attrName(a)}"><small>${attrSh(a)}</small><b style="color:${attrCol(p[a])}">${p[a]}</b></span>`).join('')}<span title="Morale"><small>mor.</small><b>${morEmo(p.mor)}</b></span></div>
      <div class="lctr">${trChips(p)}</div>
      <span class="fmen" style="width:86%" title="Kondycja ${p.kon}"><i style="width:${p.kon*5}%;background:${attrCol(p.kon)}"></i></span></div>`;};
  const c=myCaptain();
  return `<div class="lcwrap"><div class="lcourt"><div class="fmnet">siatka</div><div class="lcgrid">${[4,3,2,5,6,1].map(z=>card(Z[z][0],Z[z][1],z)).join('')}</div></div>
   <div class="lcside"><div class="ttl small mut">LIBERO</div>${card('L','Libero',0)}
    <div class="lccap"><div class="small mut">KAPITAN</div>${c?`<div class="row" style="gap:8px">${pFace(c,34)}<div><b>${esc(c.first+' '+c.last)}</b><div class="small">${capInfo(c)}</div></div></div>`:''}
     <select onchange="setCaptain(this.value)">${t.players.slice().sort((a,b)=>capScoreUi(b)-capScoreUi(a)).map(p=>`<option value="${p.id}" ${c&&c.id===p.id?'selected':''}>${esc(p.last)}${hasT(p,'lid')?' (Lider)':''}</option>`).join('')}</select>
     <div class="small mut" style="margin-top:4px">Dobry kapitan (Lider, komunikacja, opanowanie) podnosi zgranie i morale w końcówkach i wzmacnia przemowy w czasie.</div></div></div></div>
   <div class="small mut" style="margin:2px 0 10px">Ustawienie startowe (ustawienie 1). Kliknij zawodnika: najważniejsze atrybuty dla jego pozycji i charakter.</div>`;}
function capScoreUi(p){return capBonus(p)*100+rating(p)/50;}

// ---- prosta tabela kadry ----
function squadSimple(pl,inLu){
  return `<div class="tw"><table class="squad simple"><thead><tr><th onclick="srt('pos')">#</th><th class="l" onclick="srt('pos')">Zawodnik</th><th onclick="srt('pos')">Poz</th><th onclick="srt('wiek')">Wiek</th><th onclick="srt('ocena')">Ocena</th><th class="l">Kluczowe</th><th class="l">Charakter</th><th onclick="srt('kon')">Kond.</th><th onclick="srt('pot')">Potencjał</th><th onclick="srt('kontrakt')">Kontrakt</th></tr></thead><tbody>
  ${pl.map(p=>`<tr class="${inLu.has(p.id)?'starter':''}"><td>${p.num}</td><td class="l"><span class="fcell">${pFace(p,28)}<button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button>${capBadge(p)}</span>${p.inj?` 🚑<small class="bad">${p.inj}</small>`:''}${inLu.has(p.id)?` <span class="tag">${inLu.get(p.id)}</span>`:''}</td>
   <td>${POS_SHORT[p.pos]}</td><td>${p.age}</td><td><b>${rating(p)}</b></td><td class="l keyc">${(KEY_ATTR[p.pos]||[]).slice(0,3).map(k=>`<span title="${attrName(k)}"><small>${attrSh(k)}</small> <b style="color:${attrCol(p[k])}">${p[k]}</b></span>`).join('')}</td>
   <td class="l">${trChips(p,true)}</td><td><b style="color:${attrCol(p.kon)}">${p.kon}</b></td><td class="stars">${potStars(p)}</td><td class="${p.ce<=S().n?'bad':''}">${ceDate(p.ce)}</td></tr>`).join('')}
  </tbody></table></div>`;}

// ================= LIGA: KOLEJKA, DRUŻYNA KOLEJKI, LIDERZY, WYDARZENIA =================
const PS_KEYS=['pts','kill','blk','ace','dig','recPos','recErr','attErr','m'];
function psSnap(){const o={};for(const [id,r] of Object.entries(S().ps||{})){o[id]={};for(const k of PS_KEYS)o[id][k]=r[k]||0;}return o;}
function roundSummary(before,rd,n){const s=S();const ps=s.ps||{};const perf=[];
  for(const [id,r] of Object.entries(ps)){const b=before[id]||{};const dm=(r.m||0)-(b.m||0);if(dm<=0||!PLAYERS[id])continue;const d=k=>(r[k]||0)-(b[k]||0);
    const sc=d('pts')+d('dig')*0.25+d('recPos')*0.15-d('attErr')*0.5;perf.push({id,sc:Math.round(sc*10)/10,pts:d('pts'),blk:d('blk'),ace:d('ace')});}
  perf.sort((a,b)=>b.sc-a.sc);const used=new Set();const team=[];
  for(const [pos,c] of [['R',1],['A',1],['P',2],['S',2],['L',1]]){const xs=perf.filter(x=>!used.has(x.id)&&PLAYERS[x.id].p.pos===pos).slice(0,c);xs.forEach(x=>{used.add(x.id);team.push(x);});}
  s.lastRound={n,res:rd.map(g=>({h:g.h,a:g.a,sw:g.sw,sets:g.sets})),mvp:perf[0]||null,team};}
function streakOf(ti){let n=0,w=null;const res=S().results;for(let i=res.length-1;i>=0;i--){const g=res[i].find(x=>x.h===ti||x.a===ti);if(!g)continue;const won=(g.h===ti)===(g.sw[0]===3);if(w==null)w=won;if(won!==w)break;n++;}return {n,w};}
function leagueNews(before,beforeTb,rd,n){try{roundSummary(before,rd,n);const s=S();const tb=leagueTable();
  const mv=s.lastRound.mvp;if(mv){const p=PLAYERS[mv.id].p;news(`⭐ MVP ${n}. kolejki: ${p.first} ${p.last} (${TEAMS[p.tm]?TEAMS[p.tm].short:'—'}), ${mv.pts} pkt.`);}
  for(const g of rd){const W=g.sw[0]===3?g.h:g.a,L=W===g.h?g.a:g.h;if(W===SAVE.team||L===SAVE.team)continue;const d=teamStrength(TEAMS[L])-teamStrength(TEAMS[W]);if(d>=5){const sc=W===g.h?g.sw[0]+':'+g.sw[1]:g.sw[1]+':'+g.sw[0];news(`😮 Niespodzianka! Faworyt ${TEAMS[L].name} przegrywa ${sc.split(':').reverse().join(':')} z drużyną ${TEAMS[W].name}.`);}}
  for(const t of TEAMS){const st=streakOf(t.idx);if(st.n===4||st.n===7||st.n===10)news(st.w?`🔥 ${t.name} wygrywa ${st.n}. mecz z rzędu.`:`📉 ${t.name} przegrywa ${st.n}. mecz z rzędu.`);}
  if(n>=6){const top=new Set(tb.slice(0,8).map(x=>x.i)),prev=new Set(beforeTb.slice(0,8).map(x=>x.i));for(const x of top)if(!prev.has(x))news(`📈 ${TEAMS[x].name} wskakuje do czołowej ósemki (${tb.findIndex(y=>y.i===x)+1}. miejsce).`);for(const x of prev)if(!top.has(x))news(`⬇️ ${TEAMS[x].name} wypada z czołowej ósemki.`);}
  const nx=s.rounds[s.round];if(nx){const rk=i=>tb.findIndex(y=>y.i===i)+1;let best=null,bs=99;for(const [h,a] of nx){const v=rk(h)+rk(a);if(v<bs){bs=v;best=[h,a];}}
    if(best)news(`📣 Hit ${s.round+1}. kolejki: ${TEAMS[best[0]].name} (${rk(best[0])}.) – ${TEAMS[best[1]].name} (${rk(best[1])}.).`);}
}catch(e){}}
function aiStarInjNews(p,days){if(p.tm===SAVE.team||p.tm<0)return;const t=TEAMS[p.tm];const best=t.players.slice().sort((a,b)=>rating(b)-rating(a)).slice(0,3);if(best.includes(p))news(`🚑 ${t.short}: ${p.first} ${p.last} (${POS_NAMES[p.pos].toLowerCase()}) wypada na ok. ${days} dni.`);}

function hLeague(){const s=S();const tabs=[['k','Kolejka'],['d','Drużyna kolejki'],['l','Liderzy']];const tab=ui.lgTab||'k';const L=s.lastRound;
  let body='';
  if(tab==='k'){body=L?`<div class="small mut" style="margin-bottom:4px">${L.n}. kolejka</div><table class="hfx">${L.res.map(g=>{const me=g.h===SAVE.team||g.a===SAVE.team;return `<tr class="${me?'me':''}"><td class="tl" style="text-align:right">${esc(TEAMS[g.h].short)} ${tDot(g.h)}</td><td><b>${g.sw[0]}:${g.sw[1]}</b></td><td class="tl">${tDot(g.a)}${esc(TEAMS[g.a].short)}</td><td class="mut small">${g.sets.map(x=>x[0]+':'+x[1]).join(' ')}</td></tr>`;}).join('')}</table>`:'<div class="mut small">Wyniki pojawią się po pierwszej kolejce ligowej.</div>';
    const nx=s.rounds&&s.rounds[s.round];if(nx&&s.phase==='liga')body+=`<div class="small mut" style="margin:8px 0 4px">Następna kolejka (${s.round+1}.)</div><div class="lgnext">${nx.map(([h,a])=>`<span class="${h===SAVE.team||a===SAVE.team?'me':''}">${esc(TEAMS[h].short)} – ${esc(TEAMS[a].short)}</span>`).join('')}</div>`;}
  if(tab==='d'){body=L&&L.team.length?`<div class="small mut" style="margin-bottom:6px">Najlepsza siódemka ${L.n}. kolejki${L.mvp?` · MVP: <b style="color:var(--acc)">${esc(PLAYERS[L.mvp.id].p.last)}</b>`:''}</div><div class="totr">${L.team.map(x=>{const p=PLAYERS[x.id].p;return `<div class="${p.tm===SAVE.team?'me':''}" onclick="openPop('${p.id}')">${pFace(p,40)}<b>${esc(p.last)}</b><small>${POS_SHORT[p.pos]} · ${p.tm>=0?esc(TEAMS[p.tm].short):''}</small><em>${x.pts} pkt</em></div>`;}).join('')}</div>`:'<div class="mut small">Drużyna kolejki pojawi się po pierwszej kolejce ligowej.</div>';}
  if(tab==='l'){const Ld=Object.keys(s.ps||{}).length?leaders():null;const col=(lab,arr,f)=>`<div><div class="small mut">${lab}</div>${arr.slice(0,3).map((x,k)=>{const P=PLAYERS[x.id];if(!P)return '';const p=P.p;return `<div class="ldr ${p.tm===SAVE.team?'me':''}" onclick="openPop('${p.id}')"><span>${k+1}.</span>${p.tm>=0?tDot(p.tm):''}<b>${esc(p.last)}</b><em>${f?f(x):x.v}</em></div>`;}).join('')}</div>`;
    body=Ld?`<div class="ldrs">${col('Punkty',Ld.pts)}${col('Bloki',Ld.blk)}${col('Asy',Ld.ace)}${col('Skuteczność ataku',Ld.eff,x=>x.v+'%')}</div>`:'<div class="mut small">Liderzy statystyk pojawią się po pierwszych meczach ligowych.</div>';}
  return `<div class="pan"><div class="row"><div class="ttl">Liga</div><span class="sp"></span><div class="lgt">${tabs.map(([k,n])=>`<button class="${tab===k?'on':''}" onclick="ui.lgTab='${k}';render()">${n}</button>`).join('')}</div></div>${body}</div>`;}

// ---- profil klubu (kliknięcie w tabeli) ----
function openTeam(i){ui.teamPop=i;render();}
function teamModal(){const i=ui.teamPop;const t=TEAMS[i];if(!t){ui.teamPop=null;return '';}const s=S();const lu=autoLineup(t);const tb=(s.phase==='liga'||s.phase==='po'||s.phase==='end')?leagueTable():null;
  const pos=tb?tb.findIndex(x=>x.i===i)+1:0;const row=tb?tb[pos-1]:null;const st=tb?streakOf(i):{n:0};const best=t.players.slice().sort((a,b)=>rating(b)-rating(a))[0];
  const inf=infraOf(i);const inj=t.players.filter(p=>p.inj);const ts=(s.ts||{})[i];const ai=SAVE.ai[i]||{};
  const st7=LINEUP_KEYS.map(([k,l,ps])=>({k,p:t.players.find(p=>p.id===lu[k]),ps}));
  return `<div class="modal" onclick="if(event.target===this){ui.teamPop=null;render()}"><div class="mcard">
   <div class="row" style="gap:12px">${teamCrest(i,64)}<div><h2 style="margin:0">${esc(t.name)}</h2><div class="small mut">${pos?pos+'. miejsce · '+row.pts+' pkt · '+row.w+'–'+row.l:'Przed sezonem'} · siła składu ${teamStrength(t)}</div><div style="margin-top:4px">${typeof formDots==='function'?formDots(i):''}</div></div><span class="sp"></span><button class="ghost" onclick="ui.teamPop=null;render()">✕</button></div>
   <div class="pmeta" style="margin-top:10px"><div><small>Seria</small><b>${st.n?st.n+' '+(st.w?'wygr.':'por.'):'—'}</b></div><div><small>Gwiazda</small><b>${best?esc(best.last)+' ('+rating(best)+')':'—'}</b></div><div><small>Hala</small><b>poziom ${inf.hala}</b></div><div><small>Renoma</small><b>${ai.rep!=null?ai.rep:'—'}</b></div>${ts?`<div><small>Atak</small><b>${ts.att?Math.round(ts.kill/ts.att*100):0}%</b></div><div><small>Bloki/mecz</small><b>${(ts.blk/Math.max(1,ts.m)).toFixed(1)}</b></div>`:''}</div>
   <div class="small mut" style="margin:10px 0 4px">Podstawowy skład</div><div class="totr">${st7.filter(x=>x.p).map(({p,ps})=>`<div onclick="openPop('${p.id}')">${pFace(p,40)}<b>${esc(p.last)}</b><small>${POS_SHORT[ps]} · ${rating(p,ps)}</small><em>${trChips(p)}</em></div>`).join('')}</div>
   ${inj.length?`<div class="small" style="margin-top:8px">🚑 Kontuzje: ${inj.map(p=>esc(p.last)+' ('+p.inj+' dni)').join(', ')}</div>`:''}</div></div>`;}
