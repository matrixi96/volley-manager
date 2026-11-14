// ================= SKAUTING: WIEDZA O ZAWODNIKACH, ZADANIA SKAUTÓW, RAPORT O RYWALU =================
function SC(){const s=SAVE.sc||(SAVE.sc={});if(!s.know)s.know={};if(!s.tasks)s.tasks=[];if(!s.short)s.short=[];if(!s.opp)s.opp={on:1,done:{}};if(!s.nid)s.nid=1;return s;}
function isMineP(p){return p&&p.tm===SAVE.team;}
function knowOf(p){if(!p)return 0;if(isMineP(p))return 100;const k=SC().know[p.id];return k!=null?k:(p.tm>=0?(p.jr?5:25):10);}
function addKnow(pid,v){const P=PLAYERS[pid];if(!P)return;const s=SC();s.know[pid]=Math.min(100,Math.round(knowOf(P.p)+v));}
function hId(s){return hashId(String(s));}
function rEst(p){const r=rating(p);if(isMineP(p))return [r,r];const k=knowOf(p);const w=Math.round((100-k)/100*7);const off=Math.round(hId(p.id+'r')*w*0.6);return [clamp(r+off-w,1,100),clamp(r+off+w,1,100)];}
function rTxt(p){const [a,b]=rEst(p);return a===b?String(a):`${a}–${b}`;}
function rMid(p){const [a,b]=rEst(p);return Math.round((a+b)/2);}
function aEst(p,k){const v=p[k];if(isMineP(p))return [v,v];const kn=knowOf(p);if(kn>=85)return [v,v];const a=Math.max(1,Math.round((100-kn)/25));const off=Math.round(hId(p.id+k)*a*0.5);return [clamp(v+off-a,1,20),clamp(v+off+a,1,20)];}
function aTxt(p,k){const [a,b]=aEst(p,k);return a===b?String(a):`${a}–${b}`;}
// potencjał: zakres (pewny – możliwy), węższy przy dużej wiedzy i dobrym skaucie
function potRange(p){if(isMineP(p))return [p.pot,p.pot];const c=potSeen(p);const w=Math.round((100-knowOf(p))/100*10);return [clamp(c-w,40,99),clamp(c+w,40,99)];}
function starsN(v){return Math.max(1,Math.min(5,Math.round((v-62)/7)));}
function potStars(p){const [lo,hi]=p.pot!=null||!isMineP(p)?potRange(p):[rating(p),rating(p)];const a=starsN(lo),b=starsN(hi);
  return '★'.repeat(a)+(b>a?`<span class="pstp" title="możliwe">${'★'.repeat(b-a)}</span>`:'')+'<span class="mut">'+'★'.repeat(5-b)+'</span>';}
function potSeen(p){if(p.tm===SAVE.team)return p.pot;const k=SAVE.sc?knowOf(p):25;const err=(20-staffSkill('sk'))/2*(0.4+0.6*(1-k/100));return Math.round(clamp((p.pot||rating(p))+hashId(p.id)*err,40,99));}
function knowBar(p){const k=knowOf(p);return `<span class="kbar" title="Wiedza o zawodniku: ${k}%"><i style="width:${k}%;background:${k>=80?'var(--good)':k>=45?'var(--acc)':'#c2410c'}"></i></span>`;}
function isShort(id){return SC().short.includes(id);}
function toggleShort(id){const s=SC();const i=s.short.indexOf(id);if(i>=0)s.short.splice(i,1);else s.short.push(id);save();render();}
// ---- skauci i zadania ----
function scoutSlots(sc){return 1+(sc.skill>=11?1:0)+(sc.skill>=16?1:0);}
function oppScout(){const s=SC();if(!s.opp.on)return null;const a=allScouts().slice().sort((x,y)=>y.skill-x.skill);return a[0]||null;}
function scoutLoad(sc){return SC().tasks.filter(t=>t.sid===sc.id&&t.start).length;}
function scoutQueue(sc){return SC().tasks.filter(t=>t.sid===sc.id&&!t.start).length;}
function taskDays(type,sc){return type==='obs'?Math.round(clamp(8-sc.skill/3,2,7)):Math.round(clamp(14-sc.skill/2.5,5,12));}
function freeScout(pref){const a=allScouts();if(pref){const x=a.find(s=>s.id===pref);if(x&&scoutLoad(x)<scoutSlots(x))return x;}return a.filter(s=>scoutLoad(s)<scoutSlots(s)).sort((x,y)=>y.skill-x.skill)[0]||null;}
function scoutFired(id){const s=SC();s.tasks=s.tasks.filter(t=>t.sid!==id);}
function scoutName(id){const x=allScouts().find(s=>s.id===id);return x?`${x.first[0]}. ${x.last}`:'Skaut';}
function newTask(o){const s=SC();const all=allScouts();if(!all.length){ui.scMsg='Nie masz skauta. Zatrudnij go w zakładce Sztab.';render();return;}
  const pref=o.sid||ui.scAs||'';let sc=pref?all.find(x=>x.id===pref):null;if(!sc)sc=freeScout()||all.slice().sort((a,b)=>(scoutLoad(a)+scoutQueue(a))-(scoutLoad(b)+scoutQueue(b)))[0];
  const free=scoutLoad(sc)<scoutSlots(sc);const days=taskDays(o.type,sc);
  s.tasks.push(Object.assign({},o,{id:'tk'+(s.nid++),sid:sc.id,start:free?today():null,until:free?addDays(today(),days):null}));
  ui.scMsg=free?`Zadanie przypisane: ${scoutName(sc.id)}. Raport trafi do poczty za ok. ${days} dni.`:`${scoutName(sc.id)} jest zajęty — zadanie czeka w kolejce i ruszy, gdy zwolni się miejsce.`;save();render();}
function observe(pid){if(SC().tasks.some(t=>t.type==='obs'&&t.pid===pid)){ui.scMsg='Ten zawodnik jest już obserwowany.';render();return;}if(!isShort(pid))SC().short.push(pid);newTask({type:'obs',pid});}
function cancelTask(id){const s=SC();s.tasks=s.tasks.filter(t=>t.id!==id);save();render();}
function marketTask(){const v=k=>{const e=document.getElementById(k);return e?e.value:'';};newTask({type:'mkt',crit:{pos:v('scpos'),age:+v('scage')||40,val:+v('scval')||0,minR:+v('scmin')||0}});}
// codzienny przebieg (z advanceTo)
function scoutDay(d){if(SAVE.team==null||!SAVE.world)return;const s=SC();
  for(const t of s.tasks.slice()){const sc=allScouts().find(x=>x.id===t.sid);if(!sc){s.tasks=s.tasks.filter(x=>x!==t);continue;}
    if(!t.start){if(scoutLoad(sc)<scoutSlots(sc)){t.start=d;t.until=addDays(d,taskDays(t.type,sc));}continue;}
    if(t.type==='obs'){addKnow(t.pid,(40+sc.skill*2.5)/Math.max(1,daysBetween(t.start,t.until)));}
    if(t.until<=d){s.tasks=s.tasks.filter(x=>x!==t);if(t.type==='obs')obsReport(t,sc);else mktReport(t,sc);}}
  if(s.opp.on){const e=nextEvent();const c=myNext();if(e&&c&&e.d>=d&&daysBetween(d,e.d)<=2){const op=c.h===SAVE.team?c.a:c.h;const key=e.d+':'+op;if(!s.opp.done[key]){s.opp.done[key]=1;oppReport(op,e);}}}}
// ---- raport z obserwacji ----
function recFor(p){const my=myTeam().players.filter(x=>x.pos===p.pos).map(x=>rating(x)).sort((a,b)=>b-a);const best=my[0]||0,second=my[1]||0;const r=rMid(p);const pr=potRange(p);
  if(r>=best+2)return ['Polecam','good','Wzmocni pierwszy skład.'];if(r>=second+2||(p.age<=22&&pr[1]>=best))return ['Do rozważenia','warn',p.age<=22?'Młody, z potencjałem na pierwszy skład.':'Dobra zmiana na ławce.'];return ['Odradzam','bad','Nie jest lepszy od naszych zawodników na tej pozycji.'];}
function strengths(p){const w=WEIGHTS[p.pos];const ks=Object.keys(w).filter(k=>w[k]>=0.8);const sorted=ks.sort((a,b)=>p[b]-p[a]);return {top:sorted.slice(0,3),low:sorted.slice(-2).reverse()};}
function obsReport(t,sc){const P=PLAYERS[t.pid];if(!P)return;const p=P.p;const rc=recFor(p);const st=strengths(p);
  sendMail({cat:'skaut',from:`${sc.first[0]}. ${sc.last} (skaut)`,t:`Obserwacja: ${p.first} ${p.last} (${POS_SHORT[p.pos]}, ${p.tm>=0?TEAMS[p.tm].short:'wolny'})`,s:`${rc[0]}. ${rc[2]}`,b:{type:'scout',pid:p.id,rc,st,r:rTxt(p),pot:potRange(p),know:knowOf(p)},lab:'Raport z obserwacji',act:rc[0]==='Polecam'?1:0});}
// ---- przeszukanie rynku ----
function mktReport(t,sc){const c=t.crit||{};let xs=W().players.filter(p=>p.tm!==SAVE.team&&!p.jr&&(!c.pos||p.pos===c.pos)&&p.age<=(c.age||40)&&(!c.val||(p.tm<0?0:pValue(p))<=c.val)&&rating(p)>=(c.minR||0));
  const noise=(20-sc.skill)/2;xs=xs.map(p=>({p,s:rating(p)+Math.max(0,(p.pot||0)-rating(p))*(p.age<=24?0.45:0.1)+hId(p.id+sc.id)*noise})).sort((a,b)=>b.s-a.s);
  const n=3+(sc.skill>=12?1:0)+(sc.skill>=17?1:0);const pick=xs.slice(0,n).map(x=>x.p);for(const p of pick){addKnow(p.id,30+sc.skill*1.5);if(!isShort(p.id))SC().short.push(p.id);}
  const crit=`${c.pos?POS_NAMES[c.pos]:'każda pozycja'}, do ${c.age||40} lat${c.val?', do '+fmt(c.val):''}${c.minR?', ocena od '+c.minR:''}`;
  sendMail({cat:'skaut',from:`${sc.first[0]}. ${sc.last} (skaut)`,t:pick.length?`Przegląd rynku: ${pick.length} kandydatów`:'Przegląd rynku: brak kandydatów',s:`Kryteria: ${crit}.`,b:{type:'market',ids:pick.map(p=>p.id),crit},lab:'Przegląd rynku'});}
// ---- raport o rywalu (skaut + analityk) ----
function oppAcc(){const sk=allScouts().length?staffSkill('sk'):0;const an=SAVE.staff&&SAVE.staff.sta?SAVE.staff.sta.skill:0;if(!sk&&!an)return 4;if(!sk)return an*0.75;if(!an)return sk*0.8;return sk*0.55+an*0.45;}
function oppReport(op,e){const t=TEAMS[op];const acc=clamp(oppAcc(),3,20);const nz2=(20-acc)/20;const lu=autoLineup(t);const P=id=>t.players.find(p=>p.id===id);
  const seed=hashStr(e.d+op);const rnd=mulberry32(seed);const jit=v=>v+(rnd()-0.5)*2*nz2*0.35;
  const line=LINEUP_KEYS.map(([k,l,pos])=>{const p=P(lu[k]);return p?[p.id,p.last,pos,Math.round(rating(p,pos)+(rnd()-0.5)*nz2*12)]:null;}).filter(Boolean);
  const att=['A','P1','P2','S1','S2'].map(k=>P(lu[k])).filter(Boolean).map(p=>[p.id,p.last,p.pos,Math.round(clamp(jit(dirTend(p)),0.1,0.95)*100),p.ata]);
  const key=att.slice().sort((a,b)=>(b[4]+(rnd()-0.5)*nz2*6)-(a[4]+(rnd()-0.5)*nz2*6))[0];
  const recs=['P1','P2','L'].map(k=>P(lu[k])).filter(Boolean).sort((a,b)=>(a.prz+a.tod)-(b.prz+b.tod));const weak=rnd()<nz2*0.6&&recs[1]?recs[1]:recs[0];
  const srv=line.map(x=>P(x[0])).filter(p=>p&&p.pos!=='L').sort((a,b)=>b.zag-a.zag)[0];
  const blk=['S1','S2','A'].map(k=>P(lu[k])).filter(Boolean);const blkAvg=blk.reduce((s,p)=>s+p.blo,0)/Math.max(1,blk.length);
  const aA=att.find(x=>x[2]==='A'),aP=att.filter(x=>x[2]==='P');const pC=aP.length?aP.reduce((s,x)=>s+x[3],0)/aP.length:50;
  const rec={blkL:aA?(aA[3]>=60?0:aA[3]<=42?2:1):1,blkR:pC>=60?0:pC<=42?2:1,tgt:weak?weak.id:null,adir:blkAvg+(rnd()-0.5)*nz2*4>=14.5?4:0,serve:weak&&weak.prz<12?2:1};
  const form=teamForm(op);const tb=leagueTable?(()=>{try{return leagueTable().findIndex(x=>x.i===op)+1;}catch(e){return 0;}})():0;
  const names=[allScouts().length?scoutName(oppScout()?oppScout().id:allScouts()[0].id)+' (skaut)':null,SAVE.staff&&SAVE.staff.sta?`${SAVE.staff.sta.first[0]}. ${SAVE.staff.sta.last} (analityk)`:null].filter(Boolean);
  sendMail({cat:'skaut',from:names.join(' i ')||'Sztab szkoleniowy',t:`Raport o rywalu: ${t.name} (${fmtShort(e.d)})`,s:`Najgroźniejszy: ${key?key[1]:'—'}. Słabe przyjęcie: ${weak?weak.last:'—'}. ${rec.adir===4?'Wysoki blok — gramy po bloku.':''}`,
    b:{type:'opp',op,md:e.d,acc:Math.round(acc),line,att,key:key?key[0]:null,weak:weak?[weak.id,weak.last,Math.round((weak.prz+(rnd()-0.5)*nz2*4))]:null,srv:srv?[srv.id,srv.last]:null,blk:Math.round(blkAvg*10)/10,form,pos:tb,str:teamStrength(t),rec},act:1,lab:'Następny rywal'});}
function applyOppRec(mid){const m=mailBox().find(x=>x.id===mid);if(!m)return;const r=m.b.rec;const t=myTac();t.blkL=r.blkL;t.blkR=r.blkR;t.adir=r.adir;t.serve=r.serve;if(r.tgt)t.tgt=r.tgt;
  SC().prep={op:m.b.op,d:m.b.md,ap:1};m.act=0;m.applied=1;save();render();}
function oppPrepBonus(){const s=SAVE.sc;if(!s||!s.prep)return 0;const c=myNext();if(!c)return 0;const op=c.h===SAVE.team?c.a:c.h;if(s.prep.op!==op||s.prep.d!==today())return 0;return 0.003+(s.prep.ap?0.002:0);}
function mailReadHook(m){if(m&&m.b&&m.b.type==='opp'){const s=SC();if(!s.prep||s.prep.op!==m.b.op||s.prep.d!==m.b.md)s.prep={op:m.b.op,d:m.b.md,ap:0};}}
// ---- treść raportów w poczcie ----
const BLK_N=['skos','zrównoważony','prosta'],ADIR_N=['wg zawodnika','po skosie','po prostej','za blok','atak po bloku'],SERVE_N=['bezpieczna','normalna','ryzykowna'];
function pLink(id,txt){return PLAYERS[id]?`<button class="link pn" onclick="openPop('${id}')">${esc(txt)}</button>`:esc(txt);}
function scoutMailHtml(m){const b=m.b;
  if(b.type==='scout'){const P=PLAYERS[b.pid];if(!P)return '<p class="mut">Zawodnik nie jest już dostępny.</p>';const p=P.p;const [rc,cls,why]=b.rc;
    return `<div class="mpotm">${pFace(p,64)}<div><b class="mpn">${esc(p.first)} ${esc(p.last)}</b><div class="mut">${POS_NAMES[p.pos]} · ${p.age} l. · ${p.h} cm · ${p.tm>=0?esc(TEAMS[p.tm].name):'wolny zawodnik'}</div><div style="margin-top:4px">${trChips(p,true)}</div></div><span class="sp"></span><span class="screc ${cls}">${rc}</span></div>
     <div class="mkpi"><div><span>Ocena (szacunek)</span><b>${b.r}</b></div><div><span>Potencjał</span><b class="stars">${potStars(p)}</b></div><div><span>Wartość</span><b>${p.tm>=0?fmt(pValue(p)):'—'}</b></div><div><span>Chce zarabiać</span><b>${fmt(wageNeeded(p))}</b></div></div>
     <p class="mtext">${esc(why)} Mocne strony: <b>${b.st.top.map(attrName).join(', ')}</b>. Słabsze: ${b.st.low.map(attrName).join(', ')}. Kontrakt ${p.tm>=0?'do '+ceDate(p.ce):'—'}.</p>
     <div class="tw"><table><thead><tr>${(KEY_ATTR[p.pos]||[]).map(k=>`<th>${attrSh(k)}</th>`).join('')}</tr></thead><tbody><tr>${(KEY_ATTR[p.pos]||[]).map(k=>`<td><b>${aTxt(p,k)}</b></td>`).join('')}</tr></tbody></table></div>
     <div class="mact"><button class="btn" onclick="mailDone('${m.id}');openCard('${p.id}')">Złóż ofertę</button><button class="ghost" onclick="toggleShort('${p.id}')">${isShort(p.id)?'★ Na liście obserwowanych':'☆ Dodaj do obserwowanych'}</button><button class="ghost" onclick="openPop('${p.id}')">Profil</button></div>`;}
  if(b.type==='market'){const ps=b.ids.map(id=>PLAYERS[id]).filter(Boolean).map(x=>x.p);
    return `<p class="mtext">Kryteria: ${esc(b.crit)}. ${ps.length?'Najciekawsi kandydaci według skauta:':'Nie znalazłem nikogo, kto spełnia kryteria. Spróbuj luźniejszych warunków.'}</p>
     ${ps.length?`<div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th class="l">Klub</th><th>Ocena</th><th>Potencjał</th><th>Wartość</th><th class="l">Opinia</th><th></th></tr></thead><tbody>${ps.map(p=>{const rc=recFor(p);return `<tr><td class="l">${pLink(p.id,p.first+' '+p.last)}</td><td>${pTag(p.pos)}</td><td>${p.age}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short):'<span class="good">wolny</span>'}</td><td><b>${rTxt(p)}</b></td><td class="stars">${potStars(p)}</td><td>${p.tm>=0?fmt(pValue(p)):'—'}</td><td class="l"><span class="screc ${rc[1]} sm">${rc[0]}</span></td><td><button class="ghost sm" onclick="observe('${p.id}')">Obserwuj</button></td></tr>`;}).join('')}</tbody></table></div>`:''}
     <div class="mact"><button class="btn" onclick="ui.mt='short';go('transfery')">Lista obserwowanych</button><button class="ghost" onclick="go('skauting')">Skauting</button></div>`;}
  if(b.type==='opp'){const T=TEAMS[b.op];const r=b.rec;const fd=(b.form||[]).map(w=>`<span class="${w?'w':'l'}"></span>`).join('');const keyA=b.att.find(x=>x[0]===b.key);
    return `<div class="mcard"><div class="mch"><span>Następny rywal · ${fmtLong(b.md)}</span><span>Trafność raportu: ${b.acc>=15?'wysoka':b.acc>=10?'średnia':'niska'} (${b.acc}/20)</span></div>
      <div class="mscore">${teamCrest(b.op,58)}<div><b style="font-size:30px">${esc(T.name)}</b><div class="mut">siła ${b.str}${b.pos?` · ${b.pos}. miejsce`:''} · forma <span class="hdots" style="display:inline-flex">${fd||'—'}</span></div></div></div></div>
     <h3>Przewidywany skład</h3><div class="oplu">${b.line.map(x=>`<div><span>${pTag(x[2])}</span>${pLink(x[0],x[1])}<b>${x[3]}</b></div>`).join('')}</div>
     <h3>Atak rywala</h3><div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz</th><th>Skos</th><th>Prosta</th><th class="l"></th></tr></thead><tbody>${b.att.map(x=>`<tr><td class="l">${pLink(x[0],x[1])}${x[0]===b.key?' <span class="screc bad sm">najgroźniejszy</span>':''}</td><td>${pTag(x[2])}</td><td>${x[3]}%</td><td>${100-x[3]}%</td><td class="l"><span class="dirb"><i style="width:${x[3]}%"></i></span></td></tr>`).join('')}</tbody></table></div>
     <div class="mkpi"><div><span>Najsłabiej przyjmuje</span><b>${b.weak?esc(b.weak[1]):'—'}</b></div><div><span>Najlepiej zagrywa</span><b>${b.srv?esc(b.srv[1]):'—'}</b></div><div><span>Siła bloku</span><b>${b.blk}</b></div></div>
     <h3>Zalecenia sztabu</h3><ul class="mrec"><li>Blok na lewej stronie (przeciw ich atakującemu): <b>${BLK_N[r.blkL]}</b>${keyA&&keyA[2]==='A'?` — ${esc(keyA[1])} atakuje skosem w ${keyA[3]}%`:''}</li><li>Blok na prawej stronie (przeciw przyjmującym): <b>${BLK_N[r.blkR]}</b></li>
      <li>Zagrywka: <b>${SERVE_N[r.serve]}</b>${b.weak?`, w zawodnika <b>${esc(b.weak[1])}</b>`:''}</li><li>Kierunek ataku: <b>${ADIR_N[r.adir]}</b>${r.adir===4?' — ich blok jest wysoki i silny':''}</li></ul>
     <p class="small mut">Przeczytany raport daje drużynie mały bonus przygotowania w meczu, a zastosowane zalecenia — trochę większy.</p>
     <div class="mact">${m.applied?'<span class="good">✓ Zalecenia zastosowane w taktyce</span>':`<button class="btn" onclick="applyOppRec('${m.id}')">Zastosuj zalecenia</button>`}<button class="ghost" onclick="go('taktyka')">Taktyka</button><button class="ghost" onclick="openTeam(${b.op})">Profil drużyny</button></div>`;}
  return '';}
// ---- widok: Skauting ----
function scoutView(){const s=SC();const sc=allScouts();const os=oppScout();const e=nextEvent();const c=myNext();const op=c?(c.h===SAVE.team?c.a:c.h):null;
  const cap=sc.reduce((a,x)=>a+scoutSlots(x),0);const used=s.tasks.filter(t=>t.start).length;
  const lg=W().players.filter(p=>p.tm>=0&&p.tm!==SAVE.team&&!p.jr);const avgK=lg.length?Math.round(lg.reduce((a,p)=>a+knowOf(p),0)/lg.length):0;
  const reps=mailBox().filter(m=>m.cat==='skaut').slice(0,8);
  const kpi=`<div class="kstrip"><div><span>Skauci</span><b>${sc.length}/${scoutCap()}</b><small>limit z siedziby klubu (poz. ${myInfra().sied})</small></div><div><span>Zadania</span><b>${used}/${cap}</b><small>zajęte / wszystkie miejsca</small></div><div><span>Wiedza o lidze</span><b>${avgK}%</b><small>średnio o zawodnikach rywali</small></div><div><span>Analityk</span><b>${SAVE.staff&&SAVE.staff.sta?SAVE.staff.sta.skill+'/20':'brak'}</b><small>pomaga w raportach o rywalach</small></div></div>`;
  const scouts=sc.length?sc.map(x=>{const ts=s.tasks.filter(t=>t.sid===x.id);return `<div class="scard"><div class="row">${sFace(x,40)}<div><b>${esc(x.first)} ${esc(x.last)}</b><div class="small mut">jakość <span class="sk ${aCls(x.skill)}">${x.skill}</span> · miejsca na zadania: ${scoutLoad(x)}/${scoutSlots(x)}</div></div></div>
     ${os&&os.id===x.id?`<div class="stask"><span>📋 Stałe zadanie: następny rywal</span></div>`:''}
     ${ts.filter(t=>!t.start).map(t=>{const P=t.pid&&PLAYERS[t.pid];return `<div class="stask"><span class="mut">⏳ W kolejce: ${t.type==='obs'?(P?esc(P.p.first+' '+P.p.last):'?'):'przegląd rynku'}</span><button class="link small" onclick="cancelTask('${t.id}')">anuluj</button></div>`;}).join('')}
     ${ts.filter(t=>t.start).map(t=>{const tot=Math.max(1,daysBetween(t.start,t.until)),dn=clamp(daysBetween(t.start,today()),0,tot);const P=t.pid&&PLAYERS[t.pid];return `<div class="stask"><span>${t.type==='obs'?'👁 Obserwacja: '+(P?esc(P.p.first+' '+P.p.last):'?'):'🔎 Przegląd rynku: '+esc(t.crit&&t.crit.pos?POS_NAMES[t.crit.pos]:'każda pozycja')}</span><span class="kbar wide"><i style="width:${Math.round(dn/tot*100)}%;background:var(--acc)"></i></span><small class="mut">${daysBetween(today(),t.until)} dni</small><button class="link small" onclick="cancelTask('${t.id}')">anuluj</button></div>`;}).join('')}
     ${scoutLoad(x)<scoutSlots(x)?'<div class="small mut">Wolne miejsce na zadanie.</div>':''}</div>`;}).join(''):'<p class="bad">Nie masz skauta. Zatrudnij go w zakładce Sztab — bez niego nie zlecisz obserwacji ani przeglądu rynku.</p>';
  const shortPs=s.short.map(id=>PLAYERS[id]).filter(Boolean).map(x=>x.p).filter(p=>p.tm!==SAVE.team);
  return `${kpi}${ui.scMsg?`<div class="card tmsg ok">${esc(ui.scMsg)}</div>`:''}
  <div class="card"><div class="row wrap"><h2 style="margin:0">Następny rywal</h2><span class="sp"></span><div class="seg"><button class="${s.opp.on?'on':''}" onclick="SC().opp.on=1;save();render()">Włączone</button><button class="${s.opp.on?'':'on'}" onclick="SC().opp.on=0;save();render()">Wyłączone</button></div></div>
   <p class="small mut">Stałe zadanie dla najlepszego skauta razem z analitykiem (nie zajmuje miejsca na inne zadania). Raport o każdym rywalu trafia do poczty 2 dni przed meczem: przewidywany skład, kierunki ataku, słabe przyjęcie, siła bloku i zalecenia, które zastosujesz jednym przyciskiem.</p>
   ${op!=null&&e?`<div class="row" style="gap:10px">${teamCrest(op,32)}<b>${esc(TEAMS[op].name)}</b><span class="mut">${fmtLong(e.d)}</span><span class="sp"></span>${(()=>{const r=mailBox().find(m=>m.b&&m.b.type==='opp'&&m.b.op===op&&m.b.md===e.d);return r?`<button class="btn" onclick="ui.mailSel='${r.id}';mailOpen('${r.id}');go('poczta')">Otwórz raport</button>`:`<span class="small mut">${s.opp.on?'Raport przyjdzie '+fmtShort(addDays(e.d,-2)):'Zadanie wyłączone'}</span>`;})()}</div>`:'<p class="mut small">Brak zaplanowanego meczu.</p>'}</div>
  <div class="card"><h2>Skauci</h2><div class="sgrid">${scouts}</div></div>
  ${scoutDb()}
  <div class="card"><h2>Przegląd rynku przez skauta</h2><div class="sgrid2">
   <div style="display:none"><h3>👁 Obserwacja zawodnika</h3><p class="small mut">Skaut ogląda zawodnika kilka dni i przysyła dokładny raport: atrybuty, potencjał, charakter i opinię.</p>
    ${shortPs.length?`<div class="row wrap" style="gap:6px"><select id="scobs">${shortPs.map(p=>`<option value="${p.id}">${esc(p.last)} (${POS_SHORT[p.pos]}, ${p.tm>=0?esc(TEAMS[p.tm].short):'wolny'}) · wiedza ${knowOf(p)}%</option>`).join('')}</select><button class="btn" onclick="observe(document.getElementById('scobs').value)">Zleć obserwację</button></div>`:'<p class="small">Dodaj zawodników do obserwowanych (⭐ w Transferach) albo kliknij „Obserwuj” przy zawodniku na rynku.</p>'}</div>
   <div><h3>🔎 Przegląd rynku</h3><p class="small mut">Skaut szuka zawodników według kryteriów i przysyła listę najciekawszych (więcej i trafniej, gdy jest lepszy).</p>
    <div class="row wrap" style="gap:6px"><select id="scpos"><option value="">Każda pozycja</option>${['R','A','P','S','L'].map(k=>`<option value="${k}">${POS_NAMES[k]}</option>`).join('')}</select>
    <select id="scage">${[[40,'Każdy wiek'],[21,'Do 21 lat'],[24,'Do 24 lat'],[28,'Do 28 lat'],[31,'Do 31 lat']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
    <select id="scval">${[[0,'Dowolna cena'],[200000,'Do 200 tys.'],[500000,'Do 500 tys.'],[1000000,'Do 1 mln'],[2000000,'Do 2 mln']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
    <select id="scmin">${[[0,'Każda ocena'],[70,'Ocena 70+'],[75,'Ocena 75+'],[80,'Ocena 80+'],[85,'Ocena 85+']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
    <button class="btn" onclick="marketTask()">Zleć przegląd</button></div></div></div></div>
  <div class="card"><div class="row"><h2 style="margin:0">Obserwowani (${shortPs.length})</h2><span class="sp"></span><button class="ghost sm" onclick="ui.mt='short';go('transfery')">Otwórz w Transferach</button></div>${shortPs.length?marketTable(shortPs.slice(0,30)):'<p class="mut small">Pusto.</p>'}</div>
  <div class="card"><h2>Ostatnie raporty</h2>${reps.length?reps.map(m=>`<div class="res row clickrow" onclick="mailOpen('${m.id}');go('poczta')"><span class="mlab" style="--mc:${MAIL_CAT.skaut[1]}">${esc(m.lab||'Raport')}</span><b>${esc(m.t)}</b><span class="sp"></span><span class="small mut">${fmtShort(m.d)}</span></div>`).join(''):'<p class="mut small">Brak raportów. Zleć zadanie albo poczekaj na raport o rywalu.</p>'}</div>`;}
// ---- rynek transferowy (nowy układ) ----
function marketTable(list){return `<div class="tw"><table class="mkt"><thead><tr><th></th><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th class="l">Klub</th><th title="Ocena (zakres, gdy mało wiemy)">Ocena</th><th>Potencjał</th><th title="Wiedza o zawodniku">Wiedza</th><th>Wartość</th><th>Pensja</th><th>Kontrakt</th><th></th></tr></thead><tbody>
  ${list.map(p=>`<tr><td><button class="star ${isShort(p.id)?'on':''}" onclick="toggleShort('${p.id}')" title="Obserwowani">${isShort(p.id)?'★':'☆'}</button></td><td class="l"><span class="fcell">${pFace(p,26)}<button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button></span>${p.inj?' 🚑':''}</td><td><b>${pTag(p.pos)}</b></td><td>${p.age}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short):'<span class="good">wolny</span>'}</td><td><b>${rTxt(p)}</b></td><td class="stars">${potStars(p)}</td><td>${knowBar(p)}</td><td>${p.tm>=0?fmt(pValue(p)):'—'}</td><td>${p.tm>=0?fmt(p.wage):'<small class="mut">chce '+fmt(wageNeeded(p))+'</small>'}</td><td>${p.tm>=0?ceDate(p.ce):'—'}</td>
   <td class="nw">${SC().tasks.some(t=>t.pid===p.id)?'<small class="mut">obserwowany…</small>':`<button class="ghost sm" onclick="observe('${p.id}')">Obserwuj</button>`} <button class="ghost sm" onclick="openCard('${p.id}')">Oferta</button></td></tr>`).join('')}</tbody></table></div>`;}
function transferView(){const o=windowOpen();const f=ui.mf||(ui.mf={pos:'',src:'all',sort:'ocena',maxAge:40,maxVal:0,q:'',pg:0});const tab=ui.mt||'market';
  const inbox=(SAVE.inbox||[]).filter(x=>PLAYERS[x.pid]&&PLAYERS[x.pid].p.tm===SAVE.team);
  let list=tab==='short'?SC().short.map(id=>PLAYERS[id]).filter(Boolean).map(x=>x.p).filter(p=>p.tm!==SAVE.team):W().players.filter(p=>p.tm!==SAVE.team&&!p.jr);
  if(tab==='market'){if(f.q)list=list.filter(p=>(p.first+' '+p.last).toLowerCase().includes(f.q.toLowerCase()));if(f.pos)list=list.filter(p=>p.pos===f.pos);
    if(f.src==='fa')list=list.filter(p=>p.tm<0);else if(f.src==='club')list=list.filter(p=>p.tm>=0);list=list.filter(p=>p.age<=f.maxAge);if(f.maxVal)list=list.filter(p=>(p.tm<0?0:pValue(p))<=f.maxVal);}
  const sorts={ocena:(a,b)=>rMid(b)-rMid(a),pot:(a,b)=>potSeen(b)-potSeen(a),wiek:(a,b)=>a.age-b.age,cena:(a,b)=>pValue(a)-pValue(b),wiedza:(a,b)=>knowOf(b)-knowOf(a)};list.sort(sorts[f.sort]||sorts.ocena);
  const per=50,pages=Math.max(1,Math.ceil(list.length/per));f.pg=Math.min(f.pg||0,pages-1);const shown=list.slice(f.pg*per,f.pg*per+per);
  const sel=(k,lab,opts)=>`<label class="flt"><span>${lab}</span><select onchange="ui.mf.${k}=${k==='maxAge'||k==='maxVal'?'+this.value':'this.value'};ui.mf.pg=0;render()">${opts.map(([v,l])=>`<option value="${v}" ${String(f[k])===String(v)?'selected':''}>${l}</option>`).join('')}</select></label>`;
  const s=S();const free=SQUAD_MAX-myTeam().players.length;
  return `<div class="kstrip"><div><span>Dostępne na transfery</span><b class="acc">${fmt(Math.max(0,SAVE.fin.bal+500000))}</b><small>saldo ${fmt(SAVE.fin.bal)} + dopuszczalny debet 500 tys.</small></div><div><span>Pensje kadry</span><b>${fmt(payroll())}</b><small>rocznie, płatne co miesiąc</small></div><div><span>Kadra</span><b>${myTeam().players.length}/${SQUAD_MAX}</b><small>${free>0?free+' wolnych miejsc':'kadra pełna'}</small></div><div><span>Okno transferowe</span><b class="${o?'good':'bad'}">${o?'otwarte':'zamknięte'}</b><small>${s&&s.sdates?`od 1 czerwca do ${fmtDMY(s.sdates[N_SPAR-1])}`:''}</small></div></div>
  ${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}${ui.scMsg?`<div class="card tmsg ok">${esc(ui.scMsg)}</div>`:''}
  <div class="ptabs">${[['market','Rynek',''],['short','Obserwowani',SC().short.length],['offers','Oferty za moich',inbox.length]].map(([k,l,n])=>`<button class="tabb ${tab===k?'on':''}" onclick="ui.mt='${k}';ui.scMsg=null;render()">${l}${n?` <small class="mut">${n}</small>`:''}</button>`).join('')}</div>
  ${tab==='offers'?`<div class="card">${inbox.length?inbox.map(x=>{const p=PLAYERS[x.pid].p;return `<div class="row wrap offer">${tDot(x.tm)}<b>${tName(x.tm)}</b> chce kupić <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> (${rating(p)}) za <b>${fmt(x.fee)}</b><span class="sp"></span>${o?`<button class="btn" onclick="acceptBuy('${p.id}',${x.tm},${x.fee})">Akceptuj</button>`:''}<button class="ghost" onclick="rejectInbox(${SAVE.inbox.indexOf(x)})">Odrzuć</button></div>`;}).join(''):'<p class="mut">Brak ofert za Twoich zawodników. Oferty przychodzą też do poczty.</p>'}<p class="small mut">Swoich zawodników wystawiasz na sprzedaż z ich karty (Skład → nazwisko → Szukaj kupca).</p></div>`
  :`<div class="card">${tab==='market'?`<div class="filters2"><label class="flt"><span>Szukaj</span><input placeholder="Nazwisko…" value="${esc(f.q||'')}" onchange="ui.mf.q=this.value;ui.mf.pg=0;render()"></label>
    ${sel('pos','Pozycja',[['','Każda'],['R','Rozgrywający'],['A','Atakujący'],['P','Przyjmujący'],['S','Środkowy'],['L','Libero']])}${sel('src','Skąd',[['all','Kluby i wolni'],['club','Tylko z klubów'],['fa','Tylko wolni']])}
    ${sel('maxAge','Maks. wiek',[[40,'Każdy'],[21,'21'],[23,'23'],[27,'27'],[30,'30']])}${sel('maxVal','Maks. wartość',[[0,'Bez limitu'],[200000,'200 tys.'],[500000,'500 tys.'],[1000000,'1 mln'],[2000000,'2 mln']])}
    ${sel('sort','Sortuj',[['ocena','Ocena'],['pot','Potencjał'],['wiedza','Wiedza'],['wiek','Wiek'],['cena','Cena rosnąco']])}<button class="link" onclick="ui.mf={pos:'',src:'all',sort:'ocena',maxAge:40,maxVal:0,q:'',pg:0};render()">Wyczyść</button></div>`:''}
   ${marketTable(shown)}
   <div class="row small mut" style="margin-top:8px;flex-wrap:wrap;gap:12px"><span>Pokazano ${list.length?f.pg*per+1:0}–${f.pg*per+shown.length} z ${list.length}</span><span><b class="stars">★</b> pewne · <span class="pstp">★</span> możliwe · im większa wiedza (skauting), tym węższy zakres oceny i potencjału</span><span class="sp"></span>${pages>1?`<span>Strona ${f.pg+1} z ${pages}</span><button class="link" ${f.pg?'':'disabled'} onclick="ui.mf.pg--;render()">← Poprzednia</button><button class="link" ${f.pg<pages-1?'':'disabled'} onclick="ui.mf.pg++;render()">Następna →</button>`:''}</div></div>`}`;}

// ---- baza zawodników w skautingu: filtry jak w menedżerach + przypisanie skauta ----
function SF(){return ui.sf||(ui.sf={q:'',pos:'',src:'all',tm:'',minR:0,minP:0,maxAge:40,maxVal:0,maxW:0,ce:0,kn:'',notObs:0,sort:'ocena',pg:0});}
function sfSet(k,v){const f=SF();f[k]=v;f.pg=0;render();}
function scoutDb(){const f=SF();const all=allScouts();const s=SC();
  let xs=W().players.filter(p=>p.tm!==SAVE.team);
  if(f.src==='club')xs=xs.filter(p=>p.tm>=0&&!p.jr);else if(f.src==='fa')xs=xs.filter(p=>p.tm<0);else if(f.src==='jr')xs=xs.filter(p=>p.jr);else xs=xs.filter(p=>!p.jr);
  if(f.q)xs=xs.filter(p=>(p.first+' '+p.last).toLowerCase().includes(f.q.toLowerCase()));if(f.pos)xs=xs.filter(p=>p.pos===f.pos);if(f.tm!=='')xs=xs.filter(p=>p.tm===+f.tm);
  if(f.minR)xs=xs.filter(p=>rEst(p)[1]>=f.minR);if(f.minP)xs=xs.filter(p=>potRange(p)[1]>=f.minP);xs=xs.filter(p=>p.age<=f.maxAge);
  if(f.maxVal)xs=xs.filter(p=>(p.tm<0?0:pValue(p))<=f.maxVal);if(f.maxW)xs=xs.filter(p=>(p.tm<0?wageNeeded(p):p.wage)<=f.maxW);
  if(f.ce)xs=xs.filter(p=>p.tm<0||p.ce<=S().n+(+f.ce)-1);if(f.kn==='low')xs=xs.filter(p=>knowOf(p)<50);else if(f.kn==='high')xs=xs.filter(p=>knowOf(p)>=80);
  if(f.notObs)xs=xs.filter(p=>!s.tasks.some(t=>t.pid===p.id));
  const so={ocena:(a,b)=>rMid(b)-rMid(a),pot:(a,b)=>potSeen(b)-potSeen(a),wiek:(a,b)=>a.age-b.age,cena:(a,b)=>pValue(a)-pValue(b),wiedza:(a,b)=>knowOf(a)-knowOf(b)};xs.sort(so[f.sort]||so.ocena);
  const per=30,pages=Math.max(1,Math.ceil(xs.length/per));f.pg=Math.min(f.pg,pages-1);const shown=xs.slice(f.pg*per,f.pg*per+per);
  const sel=(k,lab,opts,num)=>`<label class="flt"><span>${lab}</span><select onchange="sfSet('${k}',${num?'+this.value':'this.value'})">${opts.map(([v,l])=>`<option value="${v}" ${String(f[k])===String(v)?'selected':''}>${l}</option>`).join('')}</select></label>`;
  const task=p=>s.tasks.find(t=>t.pid===p.id);
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Baza zawodników</h2><span class="sp"></span>
    <label class="flt"><span>Przypisuj do</span><select onchange="ui.scAs=this.value;render()"><option value="">Automatycznie (najmniej zajęty)</option>${all.map(x=>`<option value="${x.id}" ${ui.scAs===x.id?'selected':''}>${esc(x.first[0]+'. '+x.last)} · ${x.skill}/20 · zadania ${scoutLoad(x)}/${scoutSlots(x)}${scoutQueue(x)?' +'+scoutQueue(x)+' w kolejce':''}</option>`).join('')}</select></label></div>
   <p class="small mut">Wybierz kryteria i przypisz skauta do analizy zawodnika. Gdy skaut jest zajęty, zadanie czeka w kolejce. Ocena i potencjał to szacunki — im większa wiedza, tym dokładniejsze.</p>
   <div class="filters2"><label class="flt"><span>Szukaj</span><input placeholder="Nazwisko…" value="${esc(f.q)}" onchange="sfSet('q',this.value)"></label>
    ${sel('pos','Pozycja',[['','Każda'],['R','Rozgrywający'],['A','Atakujący'],['P','Przyjmujący'],['S','Środkowy'],['L','Libero']])}
    ${sel('src','Kadra',[['all','Seniorzy (kluby i wolni)'],['club','Tylko z klubów'],['fa','Wolni zawodnicy'],['jr','Juniorzy rywali']])}
    ${sel('tm','Drużyna',[['','Każda']].concat(TEAMS.filter(t=>t.idx!==SAVE.team).map(t=>[t.idx,t.name])))}
    ${sel('minR','Min. ocena',[[0,'Każda'],[65,'65+'],[70,'70+'],[75,'75+'],[80,'80+'],[85,'85+']],1)}
    ${sel('minP','Min. potencjał',[[0,'Każdy'],[69,'★★+'],[76,'★★★+'],[83,'★★★★+'],[90,'★★★★★']],1)}
    ${sel('maxAge','Maks. wiek',[[40,'Każdy'],[19,'19'],[21,'21'],[23,'23'],[25,'25'],[28,'28'],[31,'31']],1)}
    ${sel('maxVal','Maks. wartość',[[0,'Bez limitu'],[200000,'200 tys.'],[500000,'500 tys.'],[1000000,'1 mln'],[2000000,'2 mln']],1)}
    ${sel('maxW','Maks. pensja',[[0,'Bez limitu'],[150000,'150 tys./rok'],[300000,'300 tys./rok'],[500000,'500 tys./rok'],[800000,'800 tys./rok']],1)}
    ${sel('ce','Kontrakt kończy się',[[0,'Kiedykolwiek'],[1,'W tym sezonie'],[2,'Do końca przyszłego']],1)}
    ${sel('kn','Wiedza',[['','Każda'],['low','Mało znani (< 50%)'],['high','Dobrze znani (80%+)']])}
    ${sel('sort','Sortuj',[['ocena','Ocena'],['pot','Potencjał'],['wiedza','Najmniej znani'],['wiek','Wiek'],['cena','Cena rosnąco']])}
    <label class="mopt" style="padding:0 0 6px"><input type="checkbox" ${f.notObs?'checked':''} onchange="sfSet('notObs',this.checked?1:0)"> bez zadań</label>
    <button class="link" onclick="ui.sf=null;render()">Wyczyść</button></div>
   <div class="tw"><table class="mkt"><thead><tr><th></th><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th class="l">Klub</th><th>Ocena</th><th>Potencjał</th><th>Wiedza</th><th>Wartość</th><th>Pensja</th><th>Kontrakt</th><th class="l">Skaut</th></tr></thead><tbody>
   ${shown.map(p=>{const t=task(p);return `<tr><td><button class="star ${isShort(p.id)?'on':''}" onclick="toggleShort('${p.id}')">${isShort(p.id)?'★':'☆'}</button></td><td class="l"><span class="fcell">${pFace(p,26)}<button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button></span></td><td><b>${pTag(p.pos)}</b></td><td>${p.age}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short)+(p.jr?' U20':''):'<span class="good">wolny</span>'}</td><td><b>${rTxt(p)}</b></td><td class="stars">${potStars(p)}</td><td>${knowBar(p)} <small class="mut">${knowOf(p)}%</small></td><td>${p.tm>=0?fmt(pValue(p)):'—'}</td><td>${p.tm>=0?fmt(p.wage):'<small class="mut">chce '+fmt(wageNeeded(p))+'</small>'}</td><td>${p.tm>=0&&!p.jr?ceDate(p.ce):'—'}</td>
    <td class="l nw">${t?`<small>${t.start?'👁 '+esc(scoutName(t.sid))+' · '+daysBetween(today(),t.until)+' dni':'⏳ w kolejce: '+esc(scoutName(t.sid))}</small>`:all.length?`<button class="ghost sm" onclick="observe('${p.id}')">Przypisz skauta</button>`:'<small class="mut">brak skauta</small>'}</td></tr>`;}).join('')||'<tr><td colspan="12" class="mut">Nikt nie spełnia kryteriów.</td></tr>'}</tbody></table></div>
   <div class="row small mut" style="margin-top:8px;gap:12px"><span>Pokazano ${xs.length?f.pg*per+1:0}–${f.pg*per+shown.length} z ${xs.length} zawodników</span><span class="sp"></span>${pages>1?`<span>Strona ${f.pg+1} z ${pages}</span><button class="link" ${f.pg?'':'disabled'} onclick="SF().pg--;render()">← Poprzednia</button><button class="link" ${f.pg<pages-1?'':'disabled'} onclick="SF().pg++;render()">Następna →</button>`:''}</div></div>`;}
