// ================= PORÓWNANIE 1 NA 1 i „WYSZUKAJ PODOBNYCH” =================
// Z karty każdego zawodnika (i z naboru): ⚖ Porównaj — dwie kolumny obok siebie, przy słabo znanych zawodnikach zakresy;
// 🔍 Podobni — zawodnicy z innych klubów i wolni, o których mamy wiedzę, z podobnym profilem umiejętności.
function cmpGet(id){if(!id)return null;const P=PLAYERS[id];if(P)return P.p;const N=typeof NAB==='function'?NAB():null;return N&&N.c?N.c.find(x=>x.id===id)||null:null;}
function cmpOpen(a,b){ui.cmp={a,b:b||null,q:''};ui.sim=null;if(!ui.card)ui.card='_';render();}
function cmpClose(){ui.cmp=null;if(ui.card==='_')ui.card=null;render();}
function simOpen(id){ui.sim={id,f:''};ui.cmp=null;if(!ui.card)ui.card='_';render();}
function simClose(){ui.sim=null;if(ui.card==='_')ui.card=null;render();}
function cmpPot(p){if(p.cand||(p.tm===SAVE.team&&p.jAcad&&typeof jrPotEst==='function'))return jrPotEst(p);return potRange(p);}
function cmpPotTxt(p){const [a,b]=cmpPot(p);const sa=starsN(a),sb=starsN(b);return '★'.repeat(sa)+(sb>sa?`<span class="pstp">${'★'.repeat(sb-sa)}</span>`:'')+'<span class="mut">'+'★'.repeat(5-sb)+'</span>';}
function cmpTeam(p){return p.cand?'kandydat (nabór)':p.tm<0?'wolny zawodnik':p.tm===SAVE.team?(p.jr?'Twój junior':'Twoja kadra'):TEAMS[p.tm]?TEAMS[p.tm].name:'—';}
function cmpTraitsKnown(p){return p.cand?null:(p.tm===SAVE.team||knowOf(p)>=60);}
function cmpTraits(p){if(p.cand&&typeof nabTraits==='function')return nabTraits(p);if(!cmpTraitsKnown(p))return '<span class="small mut">nieznany (za mało wiedzy)</span>';ensTraits(p);const T=(p.tr||[]).filter(k=>TRAITS[k]);return T.map(k=>`<span class="trt" style="--c:${TRAITS[k][1]}" title="${esc(TRAITS[k][2])}">${TRAITS[k][0]}</span>`).join(' ')||'<span class="small mut">brak wyraźnych cech</span>';}
function cmpMid(r){return (r[0]+r[1])/2;}
function cmpRows(a,b){const row=(l,x,y,cx,cy)=>{const w=cx==null||cy==null?0:cx>cy+0.5?1:cy>cx+0.5?-1:0;return `<tr><td class="l mut small">${l}</td><td class="${w>0?'good':''}" style="text-align:center">${x}</td><td class="${w<0?'good':''}" style="text-align:center">${y}</td></tr>`;};
  const ra=a.cand||a.tm===SAVE.team?[rating(a),rating(a)]:rEst(a),rb=b.cand||b.tm===SAVE.team?[rating(b),rating(b)]:rEst(b);const pa=cmpPot(a),pb=cmpPot(b);
  const rt=r=>r[0]===r[1]?String(r[0]):`${r[0]}–${r[1]}`;
  let h=row('Drużyna',esc(cmpTeam(a)),esc(cmpTeam(b)))+row('Pozycja',POS_NAMES[a.pos],POS_NAMES[b.pos])+row('Wiek',a.age,b.age,-a.age,-b.age)+(a.cm||b.cm?row('Wzrost',a.cm?a.cm+' cm':'—',b.cm?b.cm+' cm':'—',a.cm,b.cm):'')
   +row('<b>Ocena</b>',`<b>${rt(ra)}</b>`,`<b>${rt(rb)}</b>`,cmpMid(ra),cmpMid(rb))+row('Potencjał',cmpPotTxt(a),cmpPotTxt(b),cmpMid(pa),cmpMid(pb));
  if(!a.cand&&!b.cand)h+=row('Wartość',fmt(pValue(a)),fmt(pValue(b)))+row('Pensja',a.tm===SAVE.team||a.tm<0||knowOf(a)>=60?fmt(a.wage||wageDemand(a))+'/rok':'?',b.tm===SAVE.team||b.tm<0||knowOf(b)>=60?fmt(b.wage||wageDemand(b))+'/rok':'?')+row('Kontrakt do',a.ce?ceDate(a.ce):'—',b.ce?ceDate(b.ce):'—');
  h+=`<tr><td colspan="3" class="l" style="padding-top:10px"><b>Umiejętności</b> <span class="small mut">(zielone — lepszy)</span></td></tr>`;
  for(const [k,l] of ATTRS){if(a[k]==null&&b[k]==null)continue;const ea=aEst(a,k),eb=aEst(b,k);h+=row(l,`<span class="attr ${aCls(Math.round(cmpMid(ea)))}">${aTxt(a,k)}</span>`,`<span class="attr ${aCls(Math.round(cmpMid(eb)))}">${aTxt(b,k)}</span>`,cmpMid(ea),cmpMid(eb));}
  h+=`<tr><td class="l mut small">Charakter</td><td class="small" style="text-align:center">${cmpTraits(a)}</td><td class="small" style="text-align:center">${cmpTraits(b)}</td></tr>`;return h;}
function cmpPickList(a){const q=(ui.cmp.q||'').trim().toLowerCase();const seen=new Set([a.id]);const out=[];const add=(p,src)=>{if(!p||seen.has(p.id))return;seen.add(p.id);out.push([p,src]);};
  const match=p=>!q||(p.first+' '+p.last).toLowerCase().includes(q);
  for(const x of simFind(a,'').slice(0,6))if(match(x.p))add(x.p,`podobny ${x.s}%`);
  for(const p of myTeam().players)if(match(p))add(p,'Twoja kadra');for(const p of juniorsOf(SAVE.team))if(match(p))add(p,'Twój junior');
  if(typeof NAB==='function'&&NAB()&&NAB().c)for(const p of NAB().c)if(match(p))add(p,'kandydat (nabór)');
  for(const id of (SC().short||[])){const P=PLAYERS[id];if(P&&match(P.p))add(P.p,'obserwowany');}
  if(q.length>=2)for(const p of W().players){if(out.length>=40)break;if(p.tm===SAVE.team||!match(p))continue;if(knowOf(p)>=30)add(p,cmpTeam(p));}
  return out.slice(0,40);}
function cmpModal(){const a=cmpGet(ui.cmp.a);if(!a){ui.cmp=null;return '';}const b=cmpGet(ui.cmp.b);
  const head=p=>`<div style="text-align:center"><div style="font-size:18px;font-weight:700">${esc(p.first)} ${esc(p.last)} ${natFl(p.nat)}</div><div class="small mut">${esc(cmpTeam(p))} · ${POS_NAMES[p.pos]}</div>${PLAYERS[p.id]?`<button class="link small" onclick="ui.cmp=null;ui.card='${p.id}';render()">profil</button> · `:''}<button class="link small" onclick="simOpen('${p.id}')">🔍 podobni</button></div>`;
  let body;if(!b){const L=cmpPickList(a);body=`<p class="small mut">Wybierz zawodnika do porównania: z kadry, z naboru, obserwowanych, podobnych albo wyszukaj po nazwisku (pokazujemy tylko zawodników, o których mamy wiedzę).</p>
    <input id="cmpq" placeholder="Szukaj po nazwisku…" value="${esc(ui.cmp.q||'')}" oninput="ui.cmp.q=this.value;render();setTimeout(()=>{const e=document.getElementById('cmpq');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}},0)" style="width:100%;margin:6px 0 10px">
    <div class="tw" style="max-height:420px;overflow:auto"><table><tbody>${L.map(([p,src])=>`<tr><td class="l"><b>${esc(p.first)} ${esc(p.last)}</b> <span class="small mut">${POS_SHORT[p.pos]} · ${p.age} l.</span></td><td class="small mut l">${esc(src)}</td><td>${p.cand||p.tm===SAVE.team?rating(p):rTxt(p)}</td><td><button class="btn sm" onclick="ui.cmp.b='${p.id}';render()">⚖ Porównaj</button></td></tr>`).join('')||'<tr><td class="mut">Brak wyników.</td></tr>'}</tbody></table></div>`;}
  else body=`<div class="tw"><table><thead><tr><th></th><th>${head(a)}</th><th>${head(b)}</th></tr></thead><tbody>${cmpRows(a,b)}</tbody></table></div>
    <div class="row" style="gap:8px;margin-top:10px"><button class="ghost sm" onclick="ui.cmp.b=null;render()">↺ Porównaj z kimś innym</button><button class="ghost sm" onclick="ui.cmp={a:'${b.id}',b:'${a.id}',q:''};render()">⇄ Zamień strony</button></div>
    <p class="small mut">Przy zawodnikach, których słabo znasz, zamiast dokładnych liczb są zakresy — więcej wiedzy daje skauting.</p>`;
  return `<div class="modal" onclick="if(event.target===this)cmpClose()"><div class="mcard" style="max-width:760px"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">⚖ Porównanie zawodników</h2><button class="ghost sm" onclick="cmpClose()">✕</button></div>${b?'':`<div style="margin:8px 0">${head(a)}</div>`}${body}</div></div>`;}
// ---- podobni ----
function simVec(p){const o={};for(const [k] of ATTRS){if(p[k]==null)continue;o[k]=p.cand||p.tm===SAVE.team?p[k]:cmpMid(aEst(p,k));}return o;}
function simScore(a,b){const W=WEIGHTS[a.pos]||{};const va=simVec(a),vb=simVec(b);let s=0,ws=0;for(const k in va){if(vb[k]==null)continue;const w=(W[k]||0.3)+0.2;s+=w*Math.pow(va[k]-vb[k],2);ws+=w;}
  const d=Math.sqrt(s/Math.max(0.01,ws));const ra=a.cand||a.tm===SAVE.team?rating(a):rMid(a),rb=rMid(b);return Math.max(0,Math.round(100-d*9-Math.abs(ra-rb)*1.2-Math.max(0,Math.abs(a.age-b.age)-3)*2));}
function simFind(a,f){const out=[];const va=pValue(a);
  for(const p of W().players){if(p.id===a.id||p.pos!==a.pos||p.tm===SAVE.team||p.jr||p.loan)continue;if(knowOf(p)<30&&!(SC().short||[]).includes(p.id))continue;
    if(f==='free'&&p.tm>=0)continue;if(f==='cheap'&&pValue(p)>=va)continue;if(f==='young'&&p.age>=a.age)continue;const s=simScore(a,p);if(s<40)continue;out.push({p,s});}
  return out.sort((x,y)=>y.s-x.s).slice(0,20);}
function simModal(){const a=cmpGet(ui.sim.id);if(!a){ui.sim=null;return '';}const f=ui.sim.f||'';const L=simFind(a,f);
  const F=[['','Wszyscy'],['cheap','Tańsi'],['young','Młodsi'],['free','Tylko wolni']];
  return `<div class="modal" onclick="if(event.target===this)simClose()"><div class="mcard" style="max-width:820px"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">🔍 Podobni do: ${esc(a.first)} ${esc(a.last)}</h2><button class="ghost sm" onclick="simClose()">✕</button></div>
   <p class="small mut">${POS_NAMES[a.pos]}, ${a.age} l. Szukamy w innych klubach i wśród wolnych zawodników — tylko tych, o których mamy wiedzę (skauting, bazy danych, obserwowani). Podobieństwo liczy profil umiejętności ważnych na tej pozycji, poziom i wiek.</p>
   <div class="row" style="gap:6px;margin:6px 0">${F.map(([k,l])=>`<button class="${k===f?'btn':'ghost'} sm" onclick="ui.sim.f='${k}';render()">${l}</button>`).join('')}</div>
   <div class="tw" style="max-height:460px;overflow:auto"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Klub</th><th>Wiek</th><th>Ocena</th><th>Potencjał</th><th>Wartość</th><th>Podobny</th><th></th></tr></thead><tbody>
   ${L.map(x=>{const p=x.p;return `<tr><td class="l"><b>${esc(p.first)} ${esc(p.last)}</b> ${natFl(p.nat)} ${knowBar(p)}</td><td class="l small">${esc(cmpTeam(p))}</td><td>${p.age}</td><td>${rTxt(p)}</td><td>${potStars(p)}</td><td>${fmt(pValue(p))}</td><td><b>${x.s}%</b></td><td><div class="row" style="gap:4px"><button class="ghost sm" onclick="ui.sim=null;ui.card='${p.id}';render()">Profil</button><button class="btn sm" onclick="cmpOpen('${a.id}','${p.id}')">⚖</button></div></td></tr>`;}).join('')||`<tr><td colspan="8" class="mut">Nie znaleźliśmy podobnych zawodników, o których mamy wiedzę. Zleć skautom przegląd rynku albo kup bazę danych regionu w zakładce Skauting.</td></tr>`}</tbody></table></div></div></div>`;}
// karta zawodnika: przyciski Porównaj i Podobni; okna porównania i podobnych zamiast karty, gdy są otwarte
{const _cmd=cardModal;cardModal=function(){if(ui.cmp)return cmpModal();if(ui.sim)return simModal();if(ui.card==='_'){ui.card=null;return '';}const h=_cmd.apply(this,arguments);try{if(!h||!ui.card)return h;
  const bar=`<div class="row" style="gap:6px;justify-content:flex-end;margin-bottom:6px"><button class="ghost sm" onclick="cmpOpen('${ui.card}')">⚖ Porównaj</button><button class="ghost sm" onclick="simOpen('${ui.card}')">🔍 Podobni</button></div>`;
  return h.replace('<div class="mcard">','<div class="mcard">'+bar);}catch(e){console.error(e);return h;}};}
