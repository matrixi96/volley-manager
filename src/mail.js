// ================= POCZTA (skrzynka wiadomości) =================
// SAVE.mail: [{id,d,cat,from,t,s,b:{type,...},r:0/1,st:0/1,ar:0/1,act:0/1}]
const MAIL_CAT={mecz:['Mecze','#e8b73a'],trening:['Trening','#38bdf8'],skaut:['Skauting','#a78bfa'],trans:['Transfery','#f97316'],med:['Medyczne','#ef6b5b'],
  spon:['Sponsorzy','#5ad17a'],fin:['Finanse','#eab308'],zarz:['Zarząd','#94a3b8'],druz:['Drużyna','#2dd4bf'],liga:['Liga i media','#f472b6'],klub:['Klub','#60a5fa']};
const MAIL_MAX=300;
function mailBox(){return SAVE.mail||(SAVE.mail=[]);}
function mailOpts(){return SAVE.mailOpt||(SAVE.mailOpt={trD:1,trW:1,trM:1});}
function sendMail(o){if(SAVE.team==null)return null;const box=mailBox();SAVE.mailN=(SAVE.mailN||0)+1;
  const m=Object.assign({id:'m'+SAVE.mailN,d:SAVE._now||today(),cat:'klub',from:'Klub',t:'',s:'',b:{type:'text'},r:0,st:0,ar:0,act:0},o);box.unshift(m);
  if(box.length>MAIL_MAX){// najpierw wyrzucamy najstarsze przeczytane, potem najstarsze w ogóle
    let i=box.length-1;while(box.length>MAIL_MAX&&i>=0){if(box[i].r&&!box[i].st)box.splice(i,1);i--;}while(box.length>MAIL_MAX)box.pop();}
  return m;}
function unreadN(){return mailBox().filter(m=>!m.r&&!m.ar).length;}
function stripEmoji(t){return String(t).replace(/^\p{Extended_Pictographic}(‍\p{Extended_Pictographic})*️?\s*/u,'');}
// automatyczne wiadomości z newsów (kontuzje, transfery, liga, zarząd…)
const NEWS_MAP=[[/^🚑/,'med','Lekarz klubowy','Kontuzja'],[/^🤝/,'spon','Dział marketingu','Sponsorzy'],[/^✅ .*wrócił/,'med','Lekarz klubowy','Powrót do zdrowia'],[/^❌ Zostałeś/,'zarz','Zarząd klubu','Decyzja zarządu'],[/^👔/,'zarz','Zarząd klubu','Wiadomość od zarządu'],
  [/^(✍️|💰|👋|📄 R)/,'trans','Dyrektor sportowy','Kadra i kontrakty'],[/^🔁/,'liga','Media','Transfer w lidze'],[/^(🧑‍🏫|📄 Z)/,'klub','Sekretariat klubu','Sztab szkoleniowy'],
  [/^(🏗️|🎉)/,'klub','Zarządca obiektów','Infrastruktura'],[/^(🌱|⬆️|⬇️|📄 J)/,'druz','Akademia','Juniorzy'],[/^(🏆|⭐|📣|📈|😮)/,'liga','Biuro ligi','Liga'],
  [/^(😤|📢|©️|🎂)/,'druz','Kapitan drużyny','Szatnia']];
function mailFromNews(t){if(/^(✅ Wygrana|❌ Porażka)/.test(t))return;const r=NEWS_MAP.find(x=>x[0].test(t));if(!r)return;const tx=stripEmoji(t);
  sendMail({cat:r[1],from:r[2],t:tx.length>70?tx.slice(0,68)+'…':tx,s:r[3],b:{type:'text',x:tx},ic:(t.match(/^\p{Extended_Pictographic}/u)||[''])[0]});}
// ---- generatory ----
function mailMatch(m,c){try{const me=m.sides[0],op=m.sides[1];const won=m.winner===0;const T=teamTotals(me),O=teamTotals(op);
  const rate=sd=>sd.pl.filter(p=>p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0).map(p=>[p.id,p.last,p.pos,Math.round((liveRating(p)||6)*10)/10,p.st.kill+p.st.blk+p.st.ace,p.st.att?Math.round(p.st.kill/p.st.att*100):null,p.st.rec?Math.round(p.st.recPos/p.st.rec*100):null]).sort((a,b)=>b[3]-a[3]);
  const mine=rate(me),opp=rate(op);const best=mine.concat(opp).sort((a,b)=>b[3]-a[3])[0];
  const s=S();let pos=null;if(c.kind==='liga'||c.kind==='po'){const tb=leagueTable();pos=tb.findIndex(x=>x.i===SAVE.team)+1;}
  const kind=c.kind==='spar'?'Sparing':c.kind==='po'?'Play-off':`${s.round}. kolejka`;const sc=`${m.setsWon[0]}:${m.setsWon[1]}`;
  sendMail({cat:'mecz',from:c.kind==='spar'?'Sekretariat klubu':'Biuro ligi',t:`${kind}: ${won?'wygrana':'porażka'} ${sc} z ${op.team.name}`,s:`${won?'Wygrywamy':'Przegrywamy'} ${sc}. Zawodnik meczu: ${best?best[1]:'—'}.${pos?` Jesteśmy na ${pos}. miejscu.`:''}`,
    b:{type:'match',me:me.team.idx,op:op.team.idx,home:c.h===SAVE.team,sets:m.sets.map(x=>x.slice()),sw:m.setsWon.slice(),won:won?1:0,pos,best,mine:mine.slice(0,8),T:[T.kill,T.att,T.blk,T.ace,T.recPos,T.rec,T.attErr+T.srvErr],O:[O.kill,O.att,O.blk,O.ace,O.recPos,O.rec,O.attErr+O.srvErr],kind}});}catch(e){console.error(e);}}
function trSumm(days){const t=myTeam();const ag=t.players.map(p=>{const a=repAgg(days,p.id);return [p.id,p.last,a.n,a.avg==null?null:Math.round(a.avg*10)/10,Math.round(a.tot*100)/100,a.f0==null?0:a.f1-a.f0,a.fr,a.inj||0,Object.keys(a.up)];}).filter(x=>x[2]||x[7]);
  const cnt={};for(const d of days)for(const u of d.u)cnt[u]=(cnt[u]||0)+1;return {ag,cnt,from:days.length?days[days.length-1].d:null,to:days.length?days[0].d:null,n:days.length};}
function asyName(){const a=SAVE.staff&&SAVE.staff.asy;return a?`${a.first[0]}. ${a.last} (asystent)`:'Sztab szkoleniowy';}
function mailTraining(kind,days){if(!days.length)return;const o=mailOpts();if(kind==='D'&&!o.trD||kind==='W'&&!o.trW||kind==='M'&&!o.trM)return;
  const sm=trSumm(days);const rated=sm.ag.filter(x=>x[3]!=null).sort((a,b)=>b[3]-a[3]);if(!rated.length&&kind==='D')return;
  const best=rated[0],worst=rated[rated.length-1];const tired=sm.ag.filter(x=>x[6]!=null&&x[6]<55).map(x=>x[1]);const ups=sm.ag.filter(x=>x[8].length);
  const ttl=kind==='D'?`Trening ${fmtShort(days[0].d)}: ${days[0].u.map(u=>TR_UNITS[u].n.toLowerCase()).join(', ')||'dzień wolny'}`:kind==='W'?`Raport tygodniowy z treningów (${fmtShort(sm.from)} – ${fmtShort(sm.to)})`:`Raport miesięczny z treningów: ${MON_NOM[+sm.to.slice(5,7)-1]||''}`;
  const sn=best?`Najlepiej: ${best[1]} (${fx1(best[3])})${worst&&worst!==best?`, najsłabiej: ${worst[1]} (${fx1(worst[3])})`:''}.${ups.length?` Podniesione atrybuty: ${ups.length} zawodn.`:''}${tired.length?` Zmęczeni: ${tired.length}.`:''}`:'Dzień bez jednostek treningowych.';
  sendMail({cat:'trening',from:asyName(),t:ttl,s:sn,b:{type:'train',k:kind,sm},lab:kind==='D'?'Raport dzienny':kind==='W'?'Raport tygodniowy':'Raport miesięczny'});}
// codziennie: raporty tygodniowe (poniedziałek) i miesięczne (1. dnia)
function mailDaily(d){const rep=(SAVE.trn&&SAVE.trn.rep)||[];
  if(dow(d)===1){const lim=addDays(d,-7);mailTraining('W',rep.filter(x=>x.d>=lim&&x.d<d));}
  if(d.endsWith('-01')){const lim=addDays(d,-31);const pm=addDays(d,-1).slice(0,7);mailTraining('M',rep.filter(x=>x.d>lim&&x.d.slice(0,7)===pm));}}
// ---- akcje ----
function mailOpen(id){const m=mailBox().find(x=>x.id===id);if(!m)return;m.r=1;if(typeof mailReadHook==='function')mailReadHook(m);ui.mailSel=id;save();render();}
function mailStar(id){const m=mailBox().find(x=>x.id===id);if(m){m.st=m.st?0:1;save();render();}}
function mailArch(id){const m=mailBox().find(x=>x.id===id);if(m){m.ar=m.ar?0:1;if(ui.mailSel===id)ui.mailSel=null;save();render();}}
function mailUnread(id){const m=mailBox().find(x=>x.id===id);if(m){m.r=0;ui.mailSel=null;save();render();}}
function mailAllRead(){for(const m of mailBox())m.r=1;save();render();}
function mailDone(id){const m=mailBox().find(x=>x.id===id);if(m)m.act=0;}
function goTrainRep(k){ui.trRepP=k==='D'?'day':k==='W'?'week':'month';ui.trRepPl='';go('trening');setTimeout(()=>{const el=[...document.querySelectorAll('.card h2')].find(h=>/Raport z treningów/i.test(h.textContent));if(el)el.scrollIntoView({behavior:'smooth'});},50);}
// ---- widok ----
function mailInitials(f){const w=String(f).replace(/\(.*\)/,'').trim().split(/\s+/);return (w[0][0]+(w[1]?w[1][0]:'')).toUpperCase().replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g,'');}
function mailList(){const f=ui.mailF||'all',c=ui.mailC||'';let xs=mailBox();
  if(c==='star')xs=xs.filter(m=>m.st);else if(c==='arch')xs=xs.filter(m=>m.ar);else{xs=xs.filter(m=>!m.ar);if(c)xs=xs.filter(m=>m.cat===c);}
  if(f==='unread')xs=xs.filter(m=>!m.r);else if(f==='act')xs=xs.filter(m=>m.act);return xs;}
function dayHdr(d){const n=daysBetween(d,today());return n===0?'Dziś':n===1?'Wczoraj':fmtLong(d);}
function mailItem(m){const C=MAIL_CAT[m.cat]||MAIL_CAT.klub;return `<button class="mitem ${m.r?'rd':'ur'} ${ui.mailSel===m.id?'sel':''}" style="--mc:${C[1]}" onclick="mailOpen('${m.id}')">
   <span class="mav">${m.ic||mailInitials(m.from)}</span><span class="mtx"><span class="mfrom">${esc(m.from)}${m.r?'':'<i class="mdot"></i>'}${m.st?' <span class="mstar">★</span>':''}</span>
   <span class="mttl">${esc(m.t)}</span><span class="msn">${esc(m.s)}</span><span class="mlabs"><span class="mlab" style="--mc:${C[1]}">${C[0]}</span>${m.lab?`<span class="mlab gr">${esc(m.lab)}</span>`:''}${m.act?'<span class="mlab act">Wymaga działania</span>':''}</span></span></button>`;}
function mailView(){const box=mailBox();const xs=mailList();const c=ui.mailC||'';const f=ui.mailF||'all';
  const cnt=k=>box.filter(m=>!m.ar&&!m.r&&m.cat===k).length;
  const cats=`<div class="mcats"><button class="mcat ${!c?'on':''}" onclick="ui.mailC='';ui.mailSel=null;render()"><i style="background:var(--acc)"></i>Wszystkie<b>${unreadN()||''}</b></button>
    <button class="mcat ${c==='star'?'on':''}" onclick="ui.mailC='star';ui.mailSel=null;render()"><i style="background:#cbd5e1"></i>Oznaczone<b>${box.filter(m=>m.st).length||''}</b></button>
    <div class="ngh">Kategorie</div>${Object.entries(MAIL_CAT).map(([k,[n,col]])=>`<button class="mcat ${c===k?'on':''}" onclick="ui.mailC='${k}';ui.mailSel=null;render()"><i style="background:${col}"></i>${n}<b>${cnt(k)||''}</b></button>`).join('')}
    <div class="mcsep"></div><button class="mcat ${c==='arch'?'on':''}" onclick="ui.mailC='arch';ui.mailSel=null;render()"><i style="background:#64748b"></i>Archiwum</button>
    <div class="ngh">Raporty treningowe</div>${[['trD','Dzienne'],['trW','Tygodniowe'],['trM','Miesięczne']].map(([k,l])=>`<label class="mopt"><input type="checkbox" ${mailOpts()[k]?'checked':''} onchange="mailOpts().${k}=this.checked?1:0;save()"> ${l}</label>`).join('')}</div>`;
  let list='',last=null;for(const m of xs.slice(0,120)){if(m.d!==last){list+=`<div class="mday"><span>${dayHdr(m.d)}</span>${daysBetween(m.d,today())<=1?`<span>${fmtLong(m.d)}</span>`:''}</div>`;last=m.d;}list+=mailItem(m);}
  const sel=box.find(m=>m.id===ui.mailSel);
  return `<div class="mail ${sel?'hasSel':''}">${cats}
   <div class="mlist"><div class="mlh"><h2 style="margin:0">Poczta</h2><span class="small mut" style="text-align:right">${box.filter(m=>!m.ar).length} wiadomości<br>${unreadN()} nieprzeczytanych</span></div>
    <div class="mfil">${[['all','Wszystkie'],['unread','Nieprzeczytane'],['act','Wymaga działania']].map(([k,l])=>`<button class="${f===k?'on':''}" onclick="ui.mailF='${k}';render()">${l}</button>`).join('')}<span class="sp"></span>${unreadN()?'<button class="link small" onclick="mailAllRead()">Oznacz wszystkie</button>':''}</div>
    <select class="mcatsel" onchange="ui.mailC=this.value;ui.mailSel=null;render()"><option value="">Wszystkie kategorie</option><option value="star" ${c==='star'?'selected':''}>Oznaczone</option>${Object.entries(MAIL_CAT).map(([k,[n]])=>`<option value="${k}" ${c===k?'selected':''}>${n}</option>`).join('')}<option value="arch" ${c==='arch'?'selected':''}>Archiwum</option></select>
    <div class="mitems">${list||'<p class="mut small" style="padding:14px">Brak wiadomości.</p>'}</div></div>
   <div class="mpane">${sel?mailPane(sel):'<div class="mempty"><div style="font-size:40px">✉️</div><p class="mut">Wybierz wiadomość z listy.</p></div>'}</div></div>`;}
function mailPane(m){const C=MAIL_CAT[m.cat]||MAIL_CAT.klub;
  return `<div class="mph"><button class="ghost sm mback" onclick="ui.mailSel=null;render()">← Wróć</button><span class="sp"></span>
    <button class="ghost sm" onclick="mailStar('${m.id}')" title="Oznacz gwiazdką">${m.st?'★':'☆'}</button><button class="ghost sm" onclick="mailUnread('${m.id}')" title="Oznacz jako nieprzeczytaną">● Nieprzeczytana</button><button class="ghost sm" onclick="mailArch('${m.id}')">${m.ar?'Przywróć':'Archiwizuj'}</button></div>
   <div class="mbody"><div class="mcatl" style="--mc:${C[1]}">${C[0]}${m.lab?' · '+esc(m.lab):''}</div><h1 class="mtitle">${esc(m.t)}</h1>
    <div class="msender"><span class="mav big">${m.ic||mailInitials(m.from)}</span><b>${esc(m.from)}</b><span class="sp"></span><span class="mut">${fmtLong(m.d)}</span></div>
    ${mailBodyHtml(m)}</div>`;}
function mailBodyHtml(m){const b=m.b||{};
  if(b.type==='match')return matchMailHtml(b);
  if(b.type==='train')return trainMailHtml(b);
  if(typeof scoutMailHtml==='function'&&/^(scout|opp|market)$/.test(b.type))return scoutMailHtml(m);
  if(typeof sponsMailHtml==='function'&&/^(spons|spexp)$/.test(b.type))return sponsMailHtml(m);
  if(b.type==='offer')return offerMailHtml(m);
  if(b.type==='fin')return finMailHtml(b);
  return `<p class="mtext">${esc(b.x||m.s)}</p>`;}
function matchMailHtml(b){const T=i=>TEAMS[i];const h=b.home?b.me:b.op,a=b.home?b.op:b.me;const sw=b.home?b.sw:[b.sw[1],b.sw[0]];const sets=b.sets.map(s=>b.home?s:[s[1],s[0]]);
  const st=(l,x,y)=>`<tr><td class="l">${l}</td><td><b>${x}</b></td><td><b>${y}</b></td></tr>`;const pc2=(k,n)=>n?Math.round(k/n*100)+'%':'–';
  return `<div class="mcard"><div class="mch"><span>Twój mecz · ${esc(b.kind)}</span><b class="${b.won?'good':'bad'}">${b.won?'WYGRANA':'PORAŻKA'}</b></div>
    <div class="mscore"><span class="mtn">${esc(T(h).name)}</span>${teamCrest(h,54)}<b>${sw[0]}–${sw[1]}</b>${teamCrest(a,54)}<span class="mtn">${esc(T(a).name)}</span></div>
    <div class="msets">${sets.map((s,i)=>`<div><span>Set ${i+1}</span><b>${s[0]}–${s[1]}</b></div>`).join('')}</div></div>
   ${b.best?`<h3>Zawodnik meczu</h3><div class="mpotm">${PLAYERS[b.best[0]]?pFace(PLAYERS[b.best[0]].p,56):''}<div><b class="mpn">${esc(PLAYERS[b.best[0]]?PLAYERS[b.best[0]].p.first+' '+b.best[1]:b.best[1])}</b><div class="mut">${POS_NAMES[b.best[2]]||''} · ${PLAYERS[b.best[0]]&&PLAYERS[b.best[0]].p.tm>=0?esc(TEAMS[PLAYERS[b.best[0]].p.tm].name):''}</div></div><span class="sp"></span><span class="mrt">${fx1(b.best[3])}</span></div>
     <div class="mkpi"><div><span>Punkty</span><b>${b.best[4]}</b></div><div><span>Skuteczność ataku</span><b>${b.best[5]==null?'–':b.best[5]+'%'}</b></div><div><span>Przyjęcie pozytywne</span><b>${b.best[6]==null?'–':b.best[6]+'%'}</b></div></div>`:''}
   <h3>Statystyki drużyn</h3><div class="tw"><table class="cmp"><thead><tr><th class="l"></th><th>${esc(T(b.me).short)}</th><th>${esc(T(b.op).short)}</th></tr></thead><tbody>
    ${st('Atak',`${b.T[0]}/${b.T[1]} (${pc2(b.T[0],b.T[1])})`,`${b.O[0]}/${b.O[1]} (${pc2(b.O[0],b.O[1])})`)}${st('Bloki',b.T[2],b.O[2])}${st('Asy',b.T[3],b.O[3])}${st('Przyjęcie pozytywne',pc2(b.T[4],b.T[5]),pc2(b.O[4],b.O[5]))}${st('Błędy własne (atak + zagrywka)',b.T[6],b.O[6])}</tbody></table></div>
   <h3>Oceny naszych zawodników</h3><div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Ocena</th><th>Pkt</th><th>Atak</th><th>Przyj.+</th></tr></thead><tbody>${b.mine.map(x=>`<tr><td class="l"><b>${esc(x[1])}</b> <small class="mut">${POS_SHORT[x[2]]||''}</small></td><td class="${x[3]>=7?'good':x[3]<=5.4?'bad':''}"><b>${fx1(x[3])}</b></td><td>${x[4]}</td><td>${x[5]==null?'–':x[5]+'%'}</td><td>${x[6]==null?'–':x[6]+'%'}</td></tr>`).join('')}</tbody></table></div>
   ${b.pos?`<p class="mtext">Po tym meczu jesteśmy na <b>${b.pos}. miejscu</b> w tabeli.</p>`:''}
   <div class="mact"><button class="btn" onclick="go('tabela')">Zobacz tabelę</button><button class="ghost" onclick="go('staty')">Statystyki sezonu</button></div>`;}
function trainMailHtml(b){const sm=b.sm;const ag=sm.ag.slice().sort((x,y)=>(y[3]||0)-(x[3]||0));
  return `<p class="mtext">${b.k==='D'?'Podsumowanie dzisiejszych zajęć.':`Okres: ${fmtShort(sm.from)} – ${fmtShort(sm.to)} (${sm.n} dni treningowych).`}</p>
   <div class="trsum small">${TR_ORDER.filter(u=>sm.cnt[u]).map(u=>`<span class="trt tu-${u}">${TR_UNITS[u].ic} ${TR_UNITS[u].n}${b.k==='D'?'':' × '+sm.cnt[u]}</span>`).join('')}</div>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Jedn.</th><th>Ocena</th><th>Postęp</th><th class="l">Podniesione</th><th>Forma</th><th>Świeżość</th></tr></thead><tbody>
   ${ag.map(x=>`<tr><td class="l"><b>${esc(x[1])}</b>${x[7]?' <span class="bad">🚑</span>':''}</td><td>${x[2]}</td><td class="${scCls(x[3])}"><b>${fx1(x[3])}</b></td><td>+${(x[4]||0).toFixed(2).replace('.',',')}</td><td class="l">${x[8].map(k=>`<span class="trt tu-up">${attrSh(k)} +1</span>`).join('')||'<span class="mut">—</span>'}</td><td class="${x[5]>1?'good':x[5]<-1?'bad':'mut'}">${x[5]>0?'+':''}${x[5]}</td><td><span style="color:${frCol(x[6]==null?100:x[6])}">${x[6]==null?'–':x[6]+'%'}</span></td></tr>`).join('')}</tbody></table></div>
   <div class="mact"><button class="btn" onclick="goTrainRep('${b.k}')">Pełny raport</button><button class="ghost" onclick="go('trening')">Plan treningowy</button></div>`;}
function finMailHtml(b){return `<div class="tw"><table class="cmp"><tbody>${b.rows.map(r=>`<tr><td class="l">${esc(r[0])}</td><td class="${r[1]<0?'bad':'good'}">${r[1]>=0?'+':''}${fmt(r[1])}</td></tr>`).join('')}<tr><td class="l"><b>Bilans miesiąca</b></td><td><b>${fmt(b.tot)}</b></td></tr><tr><td class="l">Saldo klubu</td><td><b>${fmt(b.bal)}</b></td></tr></tbody></table></div><div class="mact"><button class="btn" onclick="go('finanse')">Finanse</button></div>`;}
function offerMailHtml(m){const b=m.b;const o=(SAVE.inbox||[]).find(x=>x.pid===b.pid&&x.tm===b.tm);const P=PLAYERS[b.pid];if(!P)return '<p class="mut">Zawodnik nie jest już dostępny.</p>';const p=P.p;
  return `<p class="mtext">${esc(TEAMS[b.tm].name)} chce kupić <b>${esc(p.first)} ${esc(p.last)}</b> (${POS_NAMES[p.pos]}, ${p.age} l., ocena ${rating(p)}) i oferuje <b>${fmt(b.fee)}</b>.</p>
   ${o&&p.tm===SAVE.team?`<div class="mact">${windowOpen()?`<button class="btn" onclick="mailDone('${m.id}');acceptBuy('${p.id}',${b.tm},${b.fee})">Akceptuj</button>`:''}<button class="ghost" onclick="mailDone('${m.id}');rejectInbox(SAVE.inbox.indexOf(SAVE.inbox.find(x=>x.pid==='${b.pid}'&&x.tm===${b.tm})))">Odrzuć</button><button class="ghost" onclick="openCard('${p.id}')">Karta zawodnika</button></div>`:'<p class="mut small">Oferta jest już nieaktualna.</p>'}`;}
