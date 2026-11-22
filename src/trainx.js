// ================= TRENING W STYLU FM: zakładki, intensywność dnia, zadowolenie, postawa, indywidualny, mentoring, odpoczynek, trenerzy =================
// p.itr={f:jednostka|null,i:0/1/2} — trening indywidualny; p.restUntil — wolne do dnia; SAVE.trn.ment=[[id,...]] — grupy mentorskie; SAVE.trn.ar — automatyczny odpoczynek
const IND_INT=[{n:'Lżej',l:0.7,d:0.88,r:0.6},{n:'Normalnie',l:1,d:1,r:1},{n:'Mocniej',l:1.25,d:1.15,r:1.8}];
const IND_FOCUS=['zag','prz','ata','blo','obr','roz','sil','tak'];
const IND_SUG={R:'roz',A:'ata',P:'prz',S:'blo',L:'obr'};
function itrOf(p){const i=p.itr||{};return {f:i.f||null,i:i.i==null?1:i.i};}
function setItr(id,k,v){const P=PLAYERS[id];if(!P)return;const p=P.p;p.itr=Object.assign(itrOf(p),{[k]:v===''?null:v});save();render();}
// ---- mentoring ----
function mentGroups(){const t=ensTrn();if(!t.ment)t.ment=[];const mine=new Set(myTeam().players.map(p=>p.id));t.ment=t.ment.map(g=>g.filter(id=>mine.has(id))).filter(g=>g.length>=1);return t.ment;}
function mentLead(g){const ps=g.map(id=>PLAYERS[id]&&PLAYERS[id].p).filter(Boolean);return ps.sort((a,b)=>mentScore(b)-mentScore(a))[0];}
function mentScore(p){return p.age+(hasT(p,'lid')?6:0)+(hasT(p,'pro')?4:0)+(hasT(p,'pra')?3:0)+(hasT(p,'oby')?2:0)+rating(p)/10;}
function mentGroupOf(id){return mentGroups().find(g=>g.includes(id));}
function mentorK(p){const g=SAVE.trn&&SAVE.trn.ment&&SAVE.trn.ment.find(x=>x.includes(p.id));if(!g||g.length<2||p.age>24)return 1;const L=mentLead(g);if(!L||L.id===p.id)return 1;
  return 1+(hasT(L,'pro')?0.05:0)+(hasT(L,'pra')?0.05:0)+(hasT(L,'amb')||hasT(L,'suk')?0.03:0)+(L.age>=29?0.03:0)-(hasT(L,'len')?0.06:0);}
function mentAdd(id){const gi=+(ui.mentG||0);const G=mentGroups();if(mentGroupOf(id))return;if(!G[gi]){if(G.length>=4)return;G.push([]);}const g=G[Math.min(gi,G.length-1)];if(g.length>=4)return;g.push(id);save();render();}
function mentDel(id){const t=ensTrn();t.ment=mentGroups().map(g=>g.filter(x=>x!==id)).filter(g=>g.length);save();render();}
function mentNew(){const G=mentGroups();if(G.length>=4)return;G.push([]);ui.mentG=G.length-1;save();render();}
const MENT_POS=['pro','pra','amb','zde','spo','oby','suk'],MENT_NEG=['len','kap','ner'];
function mentWeekly(){for(const g of mentGroups()){if(g.length<2)continue;const L=mentLead(g);if(!L)continue;
  for(const id of g){if(id===L.id)continue;const p=PLAYERS[id]&&PLAYERS[id].p;if(!p||p.age>24)continue;ensTraits(p);p.tcTm===SAVE.team&&(p.tc=Math.min(60,(p.tc||0)+0.4));
    const pos=MENT_POS.filter(k=>hasT(L,k)&&!hasT(p,k));if(pos.length&&p.tr.length<4&&R()<0.035){const k=pos[Math.floor(R()*pos.length)];p.tr.push(k);news(`🤝 Mentoring: ${p.first} ${p.last} przejął od ${L.last} cechę „${TRAITS[k][0]}”.`);}
    const bad=MENT_NEG.filter(k=>hasT(p,k));if(bad.length&&(hasT(L,'pro')||hasT(L,'spo')||hasT(L,'lid'))&&R()<0.03){const k=bad[0];p.tr=p.tr.filter(x=>x!==k);news(`🤝 Mentoring: dzięki ${L.last} ${p.first} ${p.last} nie jest już „${TRAITS[k][0].toLowerCase()}”.`);}
    const neg=MENT_NEG.filter(k=>hasT(L,k)&&!hasT(p,k));if(neg.length&&p.tr.length<4&&R()<0.025){const k=neg[0];p.tr.push(k);news(`⚠️ Mentoring: ${p.first} ${p.last} przejął od ${L.last} złą cechę „${TRAITS[k][0]}”.`);}}}}
// ---- odpoczynek ----
function restSet(id,days){const P=PLAYERS[id];if(!P)return;const p=P.p;if(!days)delete p.restUntil;else p.restUntil=addDays(today(),days);save();render();}
function trxDaily(d){if(SAVE.team==null||!SAVE.world||!S())return;const t=ensTrn();
  if(t.ar){const md=matchDays();const tom=addDays(d,1);if(!md.has(tom))for(const p of myTeam().players){if(p.inj||(p.restUntil&&p.restUntil>=tom))continue;if(frOf(p)<(t.ar||45)){p.restUntil=tom;}}}
  if(dow(d)===1)try{mentWeekly();}catch(e){console.error(e);}}
{const _md=mailDaily;mailDaily=function(d){_md(d);try{trxDaily(d);}catch(e){console.error(e);}};}
// ---- pochwała / krytyka po treningu ----
function lastScores(id,days){const r=(SAVE.trn&&SAVE.trn.rep)||[];let s=0,n=0;for(const x of r.slice(0,days||7)){const q=x.p&&x.p[id];if(q&&q.s!=null){s+=q.s;n++;}}return n?s/n:null;}
function trTalk(id,praise){const P=PLAYERS[id];if(!P)return;const p=P.p;if(p.trTalk&&daysBetween(p.trTalk,today())<7){ui.trMsg={ok:0,t:'Rozmawiałeś już z nim w tym tygodniu.'};render();return;}p.trTalk=today();const sc=lastScores(id)||6;let t;
  if(praise){if(sc>=6.5){addMor(p,4);relAdd(p,2);formAdd(p,2);t=`${p.last} docenia pochwałę — morale i forma w górę.`;}else{addMor(p,1);t=`${p.last} przyjął pochwałę z zaskoczeniem — na treningach nie błyszczał.`;}}
  else{if(hasT(p,'pro')||hasT(p,'zde')||hasT(p,'amb')||hasT(p,'sta')){addMor(p,-1);p.trB={v:0.4,until:addDays(today(),7)};formAdd(p,1);t=`${p.last} wziął krytykę do siebie i obiecał więcej pracy.`;}
    else if(hasT(p,'kap')||hasT(p,'ner')||hasT(p,'ind')){addMor(p,-6);relAdd(p,-4);p.unh=(p.unh||0)+1;t=`${p.last} źle zniósł krytykę — jest obrażony.`;}
    else if(sc<6){addMor(p,-2);p.trB={v:0.25,until:addDays(today(),7)};t=`${p.last} przyznał, że ostatnio trenował słabo.`;}else{addMor(p,-4);relAdd(p,-2);t=`${p.last} uważa krytykę za niesprawiedliwą.`;}}
  ui.trMsg={ok:1,t};save();render();}
// ---- zadowolenie z treningu ----
function trSat(p){const s=lastScores(p.id);const it=itrOf(p);const why=[];
  if(hasT(p,'len')&&it.i===2)why.push('za ciężki trening indywidualny');if((hasT(p,'amb')||hasT(p,'suk'))&&it.i===0)why.push('chce trenować mocniej');
  if(frOf(p)<40)why.push('przemęczony');if(s!=null&&s<5.3)why.push('słabo mu idzie');
  const wk=planWarnings(Array.from({length:7},(_,k)=>addDays(today(),k+1)),matchDays()).length;if(wk>=2&&(hasT(p,'kap')||hasT(p,'len')))why.push('źle ułożony plan');
  return {ok:!why.length&&(s==null||s>=5.8),why};}
// ---- ryzyko urazu ----
function trRisk(p){const it=itrOf(p);let v=(100-frOf(p))/100*0.55+(reinjF(p)-1)*0.8+(IND_INT[it.i].r-1)*0.4+(p.age>=31?0.12:0)+(p.kon<10?0.1:0);const why=[];
  if(frOf(p)<55)why.push('zmęczenie');if(reinjF(p)>1.05)why.push('świeżo po urazie');if(it.i===2)why.push('mocny trening indywidualny');if(p.age>=31)why.push('wiek');if(p.kon<10)why.push('słaba kondycja');
  return {v,l:v>=0.45?'Wysokie':v>=0.25?'Średnie':'Niskie',c:v>=0.45?'bad':v>=0.25?'':'good',why};}
// ---- intensywność dnia (w porównaniu z obciążeniem meczu) ----
function dayLoad(d,md){if(md.has(d))return 100;const u=dayPlan(d,md).filter(Boolean);const lm=[0.75,1,1.3][(SAVE.training||{}).int||1];return Math.round(clamp(u.reduce((s,x)=>s+Math.max(0,TR_UNITS[x].load),0)*lm/20*100,0,140));}
function loadBar(v){const c=v>=95?'#ef4444':v>=60?'#eab308':'#22c55e';return `<div class="trld" title="Obciążenie ${v}% meczu"><i style="width:${Math.min(100,v)}%;background:${c}"></i></div><small class="mut">${v}%</small>`;}
// ---- struktura sesji ----
const TR_GRP=[['Technika',['zag','prz','ata','blo','obr','roz'],'#3b82f6'],['Fizyczne',['sil'],'#a855f7'],['Taktyka',['tak'],'#0ea5e9'],['Zespół',['int'],'#f59e0b'],['Regeneracja i wolne',['reg','off'],'#64748b']];
function pieSvg(parts){const tot=parts.reduce((s,x)=>s+x[1],0)||1;let a=-Math.PI/2;const r=46,c=50;let out='';
  for(const [n,v,col] of parts){if(!v)continue;const a2=a+v/tot*Math.PI*2;const big=a2-a>Math.PI?1:0;const x1=c+r*Math.cos(a),y1=c+r*Math.sin(a),x2=c+r*Math.cos(a2),y2=c+r*Math.sin(a2);
    out+=v===tot?`<circle cx="${c}" cy="${c}" r="${r}" fill="${col}"/>`:`<path d="M${c},${c} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${big} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${col}"/>`;a=a2;}
  return `<svg viewBox="0 0 100 100" width="120" height="120">${out}</svg>`;}
// ---- reżimy (gotowe plany tygodnia) ----
const TR_REZ=[
 ['mikro','Mikrocykl meczowy (1 mecz w tygodniu)','Siła na początku tygodnia, technika w środku, taktyka przed meczem, regeneracja po meczu.',[['sil','prz','off'],['ata','blo','off'],['zag','obr','int'],['sil','roz','off'],['tak','prz','off'],['tak','off','off'],['reg','off','off']]],
 ['dwa','Dwa mecze w tygodniu','Mniej siły, więcej regeneracji i taktyki — świeżość na oba mecze.',[['reg','prz','off'],['tak','zag','off'],['tak','off','off'],['reg','off','off'],['ata','obr','off'],['tak','off','off'],['reg','off','off']]],
 ['przyg','Okres przygotowawczy','Dużo siły i techniki — szybki rozwój, ale zmęczenie i większe ryzyko urazów. Najlepszy w sierpniu.',[['sil','prz','zag'],['sil','ata','blo'],['obr','roz','int'],['sil','zag','prz'],['ata','blo','off'],['tak','obr','off'],['reg','off','off']]],
 ['lekki','Lekki tydzień / regeneracja','Odpoczynek po ciężkim okresie: świeżość i forma wracają, rozwój wolniejszy.',[['reg','prz','off'],['zag','off','off'],['tak','int','off'],['reg','roz','off'],['obr','off','off'],['tak','off','off'],['off','off','off']]],
 ['mlodzi','Technika (młoda drużyna)','Najwięcej jednostek technicznych — dla drużyny z wieloma młodymi zawodnikami.',[['prz','zag','off'],['ata','roz','off'],['blo','obr','int'],['sil','prz','off'],['zag','ata','off'],['tak','off','off'],['reg','off','off']]]];
function rezApply(k){const t=ensTrn();const r=TR_REZ.find(x=>x[0]===k)||(t.myRez||[]).find(x=>x[0]===k);if(!r)return;t.week=JSON.parse(JSON.stringify(r[3]));t.mode='own';t.rez=r[1];ui.trTab='ov';save();render();}
function rezSave(){const t=ensTrn();const nm=(document.getElementById('rezn')||{}).value||'';if(!nm.trim())return;t.myRez=(t.myRez||[]).filter(x=>x[1]!==nm.trim()).slice(-4);t.myRez.push(['my'+Date.now().toString(36),nm.trim(),'Własny plan.',JSON.parse(JSON.stringify(t.week))]);t.rez=nm.trim();save();render();}
function rezDel(k){const t=ensTrn();t.myRez=(t.myRez||[]).filter(x=>x[0]!==k);save();render();}
// ---- trenerzy ----
const TR_COACH=[['asy','Technika (zagrywka, przyjęcie, atak, blok, obrona, rozegranie)','tech'],['fiz','Przygotowanie fizyczne','phys'],['psy','Cechy mentalne','ment'],['med','Regeneracja i powrót po urazach','inj'],['jr','Juniorzy','jr'],['sta','Taktyka i analiza rywala','tac']];
function coachStars(sk){const v=Math.round(sk/4*2)/2;let s='';for(let i=1;i<=5;i++)s+=v>=i?'★':v>=i-0.5?'⯪':'☆';return `<span style="color:#eab308;letter-spacing:1px" title="${sk}/20">${s}</span>`;}
// ================= WIDOK =================
const TRX_TABS=[['ov','Widok ogólny'],['ind','Indywidualny'],['ment','Mentoring'],['rest','Odpoczynek'],['rez','Reżimy'],['coach','Trenerzy']];
function trxHead(){const trn=ensTrn();const asy=SAVE.staff&&SAVE.staff.asy;const W=teamWeak();
  return `<div class="card"><div class="row wrap" style="gap:16px;align-items:center">
   <div><div class="small mut">OBOWIĄZKI TRENINGOWE</div><select onchange="setTrMode(this.value)"><option value="own" ${trn.mode==='own'?'selected':''}>Ja (sam układam plan)</option><option value="asy" ${trn.mode==='asy'?'selected':''} ${asy?'':'disabled'}>${asy?`${esc(asy.first)} ${esc(asy.last)} — asystent (${asy.skill}/20)`:'Asystent — brak w sztabie'}</option></select></div>
   <div><div class="small mut">STYL TRENINGU W TYM TYGODNIU</div><b>${trn.mode==='asy'?`Asystent: nacisk na ${TR_UNITS[W[0]].n.toLowerCase()} i ${TR_UNITS[W[1]].n.toLowerCase()}`:esc(trn.rez||'Własny plan')}${trn.mode==='own'&&trn.rez&&JSON.stringify(trn.week)!==JSON.stringify(((TR_REZ.find(x=>x[1]===trn.rez)||(trn.myRez||[]).find(x=>x[1]===trn.rez)||[])[3])||null)?' <span class="mut">(zmodyfikowany)</span>':''}</b></div>
   <span class="sp"></span><div class="seg">${TRX_TABS.map(([k,l])=>`<button class="${(ui.trTab||'ov')===k?'on':''}" onclick="ui.trTab='${k}';render()">${l}</button>`).join('')}</div></div>
   ${ui.trMsg?`<div class="small ${ui.trMsg.ok?'good':'bad'}" style="margin-top:6px">${esc(ui.trMsg.t)}</div>`:''}</div>`;}
function trxOvCards(){const t=myTeam();const ps=t.players;
  const sat=ps.map(p=>({p,s:trSat(p)}));const ok=sat.filter(x=>x.s.ok),bad=sat.filter(x=>!x.s.ok);
  const satC=`<div class="card"><h2>Zadowolenie z treningu</h2>${bad.length<=2?`<p>👍 <b>Ogólnie zadowoleni z treningów</b></p>`:bad.length<=5?`<p>😐 <b>Część zawodników narzeka</b></p>`:`<p>👎 <b>Drużyna jest niezadowolona z treningów</b></p>`}
    <p class="small mut">${ok.slice(0,2).map(x=>esc(x.p.last)).join(', ')}${ok.length>2?` i ${ok.length-2} innych`:''} — zadowoleni.</p>
    ${bad.slice(0,6).map(x=>`<div class="res small">⚠️ <button class="link pn" onclick="openCard('${x.p.id}')">${esc(x.p.last)}</button> — ${esc(x.s.why.join(', ')||'słabe oceny')}</div>`).join('')}</div>`;
  const rated=ps.map(p=>({p,s:lastScores(p.id)})).filter(x=>x.s!=null).sort((a,b)=>b.s-a.s);
  const row=(x,best)=>`<div class="row wrap" style="gap:8px;align-items:center;padding:8px;border-radius:8px;background:${best?'rgba(34,197,94,.18)':'rgba(239,68,68,.18)'};margin:4px 0"><b><button class="link pn" onclick="openCard('${x.p.id}')">${esc(x.p.first)} ${esc(x.p.last)}</button></b><span class="sp"></span><span class="small mut">ocena treningu</span> <b>${fx1(x.s)}</b>
    <button class="ghost sm" onclick="trTalk('${x.p.id}',${best?1:0})">${best?'👏 Pochwal':'🗣️ Skrytykuj'}</button></div>`;
  const postC=`<div class="card"><h2>Postawa na treningach</h2>${rated.length?`<div class="small mut">NAJLEPSZY</div>${row(rated[0],1)}${rated[1]?`<div class="small mut res">${esc(rated[1].p.last)} · ${fx1(rated[1].s)}</div>`:''}
    <div class="small mut" style="margin-top:8px">NAJSŁABSZY</div>${row(rated[rated.length-1],0)}${rated.length>2?`<div class="small mut res">${esc(rated[rated.length-2].p.last)} · ${fx1(rated[rated.length-2].s)}</div>`:''}
    <p class="small mut">Pochwała podnosi morale. Krytyka działa na profesjonalistów i ambitnych, ale kapryśni i nerwowi się obrażą. Z każdym zawodnikiem raz w tygodniu.</p>`:'<p class="mut">Oceny pojawią się po pierwszych treningach.</p>'}</div>`;
  const c=(typeof myNext==='function')?myNext():null;const tp=tacPrep();
  const prepC=`<div class="card"><h2>Przygotowanie do meczu</h2>${c&&c.h!=null?`<p>Najbliższy rywal: <b>${tName(c.h===SAVE.team?c.a:c.h)}</b> (${c.h===SAVE.team?'u siebie':'na wyjeździe'}).</p>`:''}<p class="small">Jednostki taktyki w ostatnich 2 dniach: <b>${tp}/3</b> — ${tp>=2?'<span class="good">zespół dobrze zna plan na mecz</span>':tp===1?'przygotowanie podstawowe':'<span class="bad">brak odprawy taktycznej przed meczem</span>'}.</p>
    <p class="small mut">Taktyka dzień przed meczem i w dniu meczu daje bonus w meczu. Odprawę (zagrywka, blok, rozegranie) ustawisz w zapowiedzi meczu.</p></div>`;
  const md=matchDays();const cnt={};for(let k=1;k<=7;k++){for(const u of dayPlan(addDays(today(),k),md))if(u)cnt[u]=(cnt[u]||0)+1;}
  const parts=TR_GRP.map(([n,us,col])=>[n,us.reduce((s,u)=>s+(cnt[u]||0),0),col]);
  const strC=`<div class="card"><h2>Struktura sesji (7 dni)</h2><div class="row" style="gap:16px;align-items:center">${pieSvg(parts)}<div>${parts.map(([n,v,col])=>`<div class="small"><span style="display:inline-block;min-width:22px;text-align:center;border-radius:10px;background:${col};color:#fff;margin-right:6px">${v}</span>${n}</div>`).join('')}</div></div></div>`;
  const rk=ps.filter(p=>!p.inj).map(p=>({p,r:trRisk(p)})).sort((a,b)=>b.r.v-a.r.v);const inj=ps.filter(p=>p.inj);
  const medC=`<div class="card"><h2>Centrum medyczne</h2><div class="row" style="gap:24px"><div><small class="mut">KONTUZJE</small><div class="big" style="font-size:22px">${inj.length}</div></div><div><small class="mut">ZAGROŻENI</small><div class="big" style="font-size:22px">${rk.filter(x=>x.r.l==='Wysokie').length}</div></div></div>
    ${rk.slice(0,6).map(x=>`<div class="res row small"><button class="link pn" onclick="openCard('${x.p.id}')">${esc(x.p.last)}</button><span class="sp"></span><b class="${x.r.c}">${x.r.l} ryzyko</b><span class="mut" style="margin-left:6px">${esc(x.r.why.join(', ')||'—')}</span></div>`).join('')}
    <button class="link small" onclick="ui.trTab='rest';render()">Zaplanuj odpoczynek →</button></div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;align-items:start">${satC}${postC}${prepC}${strC}${medC}</div>`;}
function trxInd(){const t=myTeam();const ps=t.players.slice().sort((a,b)=>({R:0,A:1,P:2,S:3,L:4})[a.pos]-({R:0,A:1,P:2,S:3,L:4})[b.pos]||rating(b)-rating(a));
  return `<div class="card"><h2>Trening indywidualny</h2><p class="small mut">Każdy zawodnik może mieć własny nacisk (trochę zmęczenia): cały element gry (np. przyjęcie — kilka cech po trochu) albo jedną konkretną cechę (np. skoczność — szybszy wzrost tylko tej cechy) oraz intensywność. Mocniej = szybszy rozwój, ale większe zmęczenie i ryzyko urazu; lżej = odwrotnie. Leniwi nie lubią „mocniej”, ambitni nie lubią „lżej”.</p>
  <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Wiek</th><th class="l">Świeżość</th><th class="l">Nacisk indywidualny</th><th class="l">Intensywność</th><th>Ocena tr.</th><th class="l">Nastawienie</th></tr></thead><tbody>
  ${ps.map(p=>{const it=itrOf(p);const s=trSat(p);const sug=IND_SUG[p.pos];return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small></td><td>${p.age}</td><td class="l">${frBar(p)}</td>
    <td class="l"><select onchange="setItr('${p.id}','f',this.value)"><option value="">— brak —</option><optgroup label="Element gry (kilka cech naraz)">${IND_FOCUS.map(u=>`<option value="${u}" ${it.f===u?'selected':''}>${TR_UNITS[u].ic} ${TR_UNITS[u].n}${u===sug?' (zalecane)':''}</option>`).join('')}</optgroup>${[['Umiejętności',ATTRS],['Fizyczne',PHYS],['Mentalne',MENTAL]].map(([g,A])=>`<optgroup label="Jedna cecha — ${g}">${A.map(a=>`<option value="a:${a[0]}" ${it.f==='a:'+a[0]?'selected':''}>${a[1]} (${p[a[0]]})${p[a[0]]>=20?' — maks.':''}</option>`).join('')}</optgroup>`).join('')}</select></td>
    <td class="l"><div class="seg">${IND_INT.map((x,i)=>`<button class="${it.i===i?'on':''}" onclick="setItr('${p.id}','i',${i})">${x.n}</button>`).join('')}</div></td>
    <td class="${scCls(lastScores(p.id))}">${fx1(lastScores(p.id))}</td><td class="l small ${s.ok?'good':'bad'}">${s.ok?'zadowolony':esc(s.why.join(', ')||'niezadowolony')}</td></tr>`;}).join('')}</tbody></table></div></div>`;}
function trxMent(){const G=mentGroups();const t=myTeam();const inG=new Set(G.flat());const gi=Math.min(+(ui.mentG||0),Math.max(0,G.length-1));
  return `<div class="card"><h2>Mentoring</h2><p class="small mut">Grupy 2–4 zawodników (maks. 4 grupy). Lider grupy (najstarszy, lider, profesjonalista) co tydzień wpływa na młodszych (do 24 lat): może przekazać cechy charakteru (pracowity, profesjonalista, ambitny…), oduczyć lenistwa i nerwowości — ale zły lider przekaże też złe cechy. Młodzi z dobrym mentorem rozwijają się do 15% szybciej.</p>
   <div class="row wrap" style="gap:12px">${G.map((g,i)=>{const L=mentLead(g);return `<div class="card" style="flex:1;min-width:220px;${i===gi?'outline:2px solid var(--acc)':''}" onclick="ui.mentG=${i};render()"><b>Grupa ${i+1}</b>
     ${g.map(id=>{const p=PLAYERS[id].p;return `<div class="res row small">${L&&L.id===id?'⭐ ':''}${esc(p.first[0])}. ${esc(p.last)} <small class="mut">${p.age} l. · ${(p.tr||[]).map(k=>TRAITS[k]?TRAITS[k][0]:'').join(', ')}</small><span class="sp"></span><button class="link" onclick="event.stopPropagation();mentDel('${id}')">✕</button></div>`;}).join('')||'<p class="mut small">Pusta — dodaj zawodników z listy poniżej.</p>'}
     ${g.length>=2&&L?`<p class="small mut">Lider: <b>${esc(L.last)}</b>${(hasT(L,'len')||hasT(L,'kap'))?' <span class="bad">— uwaga, ma złe cechy</span>':''}</p>`:''}</div>`;}).join('')}
   ${G.length<4?`<button class="ghost" onclick="mentNew()">＋ Nowa grupa</button>`:''}</div>
   ${G.length?`<h3>Dodaj do grupy ${gi+1}</h3><div class="row wrap" style="gap:6px">${t.players.filter(p=>!inG.has(p.id)).sort((a,b)=>b.age-a.age).map(p=>`<button class="ghost sm" onclick="ui.mentG=${gi};mentAdd('${p.id}')">${esc(p.last)} <small class="mut">${p.age}</small></button>`).join('')}</div>`:''}</div>`;}
function trxRest(){const t=myTeam();const trn=ensTrn();const ps=t.players.slice().sort((a,b)=>frOf(a)-frOf(b));
  return `<div class="card"><h2>Odpoczynek</h2><div class="row wrap" style="gap:10px;align-items:center"><label class="row" style="gap:6px"><input type="checkbox" ${trn.ar?'checked':''} onchange="ensTrn().ar=this.checked?45:0;save();render()"> Automatyczne wolne dla zmęczonych</label>
   ${trn.ar?`<select onchange="ensTrn().ar=+this.value;save();render()">${[35,45,55,65].map(v=>`<option value="${v}" ${trn.ar===v?'selected':''}>gdy świeżość poniżej ${v}%</option>`).join('')}</select>`:''}</div>
   <p class="small mut">Zawodnik na wolnym nie trenuje (nie rozwija się), ale szybko odzyskuje świeżość. Automat nie daje wolnego dzień przed meczem.</p>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Świeżość</th><th class="l">Ryzyko urazu</th><th class="l">Wolne</th></tr></thead><tbody>
   ${ps.map(p=>{const r=trRisk(p);const rest=p.restUntil&&p.restUntil>=addDays(today(),1);return `<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small></td><td class="l">${frBar(p)}</td><td class="l ${r.c}">${p.inj?'🚑 kontuzja':r.l}</td>
    <td class="l">${p.inj?'—':rest?`<span class="good">do ${fmtShort(p.restUntil)}</span> <button class="link" onclick="restSet('${p.id}',0)">anuluj</button>`:`<button class="ghost sm" onclick="restSet('${p.id}',1)">1 dzień</button> <button class="ghost sm" onclick="restSet('${p.id}',2)">2 dni</button> <button class="ghost sm" onclick="restSet('${p.id}',3)">3 dni</button>`}</td></tr>`;}).join('')}</tbody></table></div></div>`;}
function trxRez(){const t=ensTrn();const all=TR_REZ.concat(t.myRez||[]);
  return `<div class="card"><h2>Reżimy treningowe</h2><p class="small mut">Gotowe plany tygodnia. Wybranie reżimu przełącza na „Sam układam” — potem możesz go zmieniać w siatce.</p>
   ${all.map(r=>`<div class="res row wrap" style="gap:10px;align-items:center"><div style="flex:1;min-width:240px"><b>${esc(r[1])}</b>${t.rez===r[1]?' <span class="good small">(aktywny)</span>':''}<div class="small mut">${esc(r[2])}</div>
     <div class="small">${r[3].map((d,i)=>`<span class="mut">${WD[i]}</span> ${d.filter(u=>u!=='off').map(u=>TR_UNITS[u].ic).join('')||'🛋️'}`).join(' · ')}</div></div>
     <button class="btn sm" onclick="rezApply('${r[0]}')">Zastosuj</button>${r[0].startsWith('my')?`<button class="link" onclick="rezDel('${r[0]}')">usuń</button>`:''}</div>`).join('')}
   <h3>Zapisz obecny plan jako reżim</h3><div class="row wrap" style="gap:6px"><input id="rezn" placeholder="Nazwa, np. Tydzień pucharowy" maxlength="40"><button class="ghost" onclick="rezSave()">Zapisz</button></div></div>`;}
function trxCoach(){const m=clubMods(SAVE.team);
  return `<div class="card"><h2>Trenerzy</h2><p class="small mut">Kto w sztabie odpowiada za które elementy treningu. Lepszy trener = szybszy rozwój w jego obszarze. Pusty etat = obszar prowadzony słabo (jak trener 3/20).</p>
   <div class="tw"><table><thead><tr><th class="l">Obszar</th><th class="l">Trener</th><th class="l">Jakość</th><th>Wpływ</th></tr></thead><tbody>
   ${TR_COACH.map(([r,area,mk])=>{const s=SAVE.staff&&SAVE.staff[r];const sk=staffSkill(r);const eff=mk==='tech'?m.tech:mk==='phys'?m.phys:mk==='ment'?m.ment:mk==='jr'?m.jr:mk==='inj'?1/m.injDur:1+(sk-10)*0.01;
     return `<tr><td class="l">${area}</td><td class="l">${s?`${esc(s.first)} ${esc(s.last)}`:`<span class="mut">— brak (${ROLE_N[r]})</span>`}</td><td class="l">${coachStars(sk)} <small class="mut">${sk}/20</small></td><td class="${eff>=1.05?'good':eff<0.95?'bad':''}">${eff>=1?'+':''}${Math.round((eff-1)*100)}%</td></tr>`;}).join('')}</tbody></table></div>
   <p class="small"><button class="link" onclick="go('sztab')">Zatrudnij lub zmień trenerów (Klub → Sztab) →</button></p></div>`;}
// wstawienie paska intensywności do siatki tygodnia i nowe zakładki
{const _tv=trainingView;trainingView=function(){const tab=ui.trTab||'ov';if(tab!=='ov'){const v=tab==='ind'?trxInd():tab==='ment'?trxMent():tab==='rest'?trxRest():tab==='rez'?trxRez():trxCoach();return trxHead()+v;}
  let h=_tv.apply(this,arguments);const trn=ensTrn();const md=matchDays();const days=[];for(let k=1;k<=7;k++)days.push(addDays(today(),k));
  const cells=trn.mode==='own'?WD.map((w,i)=>{const d=days.find(x=>(dow(x)+6)%7===i);return `<td>${d?loadBar(dayLoad(d,md)):''}</td>`;}).join(''):days.map(d=>`<td>${loadBar(dayLoad(d,md))}</td>`).join('');
  const row=`<tr><th class="l small">Intensywność<br><small class="mut">% obciążenia meczu</small></th>${cells}</tr>`;
  const i=h.indexOf('</tbody></table></div>');if(i>0)h=h.slice(0,i)+row+h.slice(i);
  const j=h.indexOf('<div class="card"><h2>Intensywność</h2>');const cards=trxOvCards();h=j>0?h.slice(0,j)+cards+h.slice(j):h+cards;
  return trxHead()+h;};}
