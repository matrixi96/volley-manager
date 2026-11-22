// ================= SKAUTING: CECHY SKAUTÓW, REGIONY, PRZYDZIAŁY, BUDŻET, RAPORTY A–E, CELOWNIK, CHARAKTER =================
// Regiony: kraje z ligami + reszta świata (wolni zawodnicy z innych krajów)
const REGS=[['PL','Polska'],['DE','Niemcy'],['IT','Włochy'],['TR','Turcja'],['W','Reszta świata']];
const REG_N=Object.fromEntries(REGS);
function pReg(p){if(p.tm>=0&&TEAMS[p.tm])return tmCountry(p.tm);const n=pNat(p);return ['PL','DE','IT','TR'].includes(n)?n:'W';}
function myReg(){return SAVE.team!=null?tmCountry(SAVE.team):'PL';}
// ---- stan rozszerzonego skautingu ----
function SX(){const s=SC();if(!s.reg){s.reg={};for(const [c] of REGS)s.reg[c]=c===myReg()?60:c==='W'?10:18;}if(!s.sub)s.sub={};if(s.bud==null)s.bud=25000;if(!s.recs)s.recs=[];if(!s.chr)s.chr={};if(!s.snap)s.snap={};return s;}
// ---- cechy skautów: ocena umiejętności (ja), ocena potencjału (jp), region, w którym jest najlepszy ----
function scEnsure(sc){if(!sc||sc.ja!=null)return sc;const h1=hashId(sc.id+'ja'),h2=hashId(sc.id+'jp'),h3=Math.abs(hashId(sc.id+'rg'));
  sc.ja=Math.round(clamp(sc.skill+h1*3,1,20));sc.jp=Math.round(clamp(sc.skill+h2*3,1,20));const home=SAVE.team!=null?myReg():'PL';sc.reg=h3<0.45?home:REGS[Math.floor(h3*REGS.length)%REGS.length][0];return sc;}
function scAll(){return allScouts().map(scEnsure);}
function bestJA(){const a=scAll();return a.length?Math.max(...a.map(x=>x.ja)):6;}
function bestJP(){const a=scAll();return a.length?Math.max(...a.map(x=>x.jp)):6;}
{const _gs=genStaff;genStaff=function(role,sk){const s=_gs(role,sk);if(role==='sk')scEnsure(s);return s;};}
// ---- wiedza: bazowa zależy od znajomości regionu i subskrypcji bazy danych ----
function regK(c){return SX().reg[c]||0;}
function subOn(c){return !!SX().sub[c];}
const SUB_COST=15000;
knowOf=function(p){if(!p)return 0;if(isMineP(p))return 100;const k=SC().know[p.id];const reg=pReg(p);const base=Math.round((p.jr?4:p.tm>=0?9:6)+regK(reg)*0.32+(subOn(reg)?18:0));return k!=null?Math.max(k,base):base;};
{const _td=taskDays;taskDays=function(type,sc){return type==='chr'?chrDays(sc):_td(type,sc);};}
// szerokość przedziałów zależy też od tego, jak dobrze skauci oceniają
rEst=function(p){const r=rating(p);if(isMineP(p))return [r,r];const k=knowOf(p);const w=Math.round((100-k)/100*7*(1.25-bestJA()/20*0.5));const off=Math.round(hId(p.id+'r')*w*0.6);return [clamp(r+off-w,1,100),clamp(r+off+w,1,100)];};
potSeen=function(p){if(p.tm===SAVE.team)return p.pot;const k=SAVE.sc?knowOf(p):25;const err=(20-bestJP())/2*(0.4+0.6*(1-k/100));return Math.round(clamp((p.pot||rating(p))+hashId(p.id)*err,40,99));};
// ---- charakter: znany przy wiedzy 60%+ albo po sprawdzeniu ----
function trKnown(p){return !p||p.tm===SAVE.team||knowOf(p)>=60||!!(SAVE.sc&&SAVE.sc.chr&&SAVE.sc.chr[p.id]);}
{const _tc=trChips;trChips=function(p,full){if(!trKnown(p))return '<span class="small mut">charakter nieznany</span>';return _tc(p,full);};}
// ---- ocena A–E i chęć przejścia ----
function myPosR(pos){return myTeam().players.filter(x=>x.pos===pos&&!x.jr).map(x=>rating(x)).sort((a,b)=>b-a);}
function gradeOf(p){const my=myPosR(p.pos);const best=my[0]||0,second=my[1]||0;const r=rMid(p);const pr=potRange(p);const pm=(pr[0]+pr[1])/2;
  const potB=p.age<=23?Math.max(0,pm-best)/2:0;const cost=p.tm<0?0:pValue(p);let pen=0;try{if(cost>budLeft().tr*1.2)pen=2;}catch(e){}
  const s=Math.max(r-best+2,(r-second)*0.5,potB)-pen;const g=s>=4?'A':s>=1.5?'B':s>=-1?'C':s>=-4?'D':'E';
  return {g,v:g<='B'?'Podpisz':g==='C'?'Rozważ':'Odpuść',cls:g<='B'?'good':g==='C'?'warn':'bad',why:r>=best+2?'Wzmocni pierwszą szóstkę.':r>=second+1?'Dobry zmiennik, podniesie poziom ławki.':potB>=2?'Młody — za 1–2 sezony może grać w pierwszej szóstce.':'Nie jest lepszy od naszych zawodników na tej pozycji.'};}
function wantsMove(p){if(knowOf(p)<40)return ['nie wiadomo','mut'];const my=SAVE.ai[SAVE.team].rep,his=p.tm>=0&&SAVE.ai[p.tm]?SAVE.ai[p.tm].rep:30;let d=my-his;if(p.tm>=0&&TEAMS[p.tm]&&pSat(p,TEAMS[p.tm]).v<45)d+=15;if(p.tm<0)d+=10;if((hasT(p,'amb')||hasT(p,'suk'))&&p.tm>=0&&LG_LV[myLg()]<=LG_LV[lgOf(p.tm)])d+=5;if(hasT(p,'loj')&&p.tm>=0)d-=10;
  return d>=5?['chętnie przyjdzie','good']:d>=-10?['trzeba go przekonać','warn']:['raczej nie chce','bad'];}
function gradeChip(g){const c={A:'#22c55e',B:'#84cc16',C:'#eab308',D:'#f97316',E:'#ef4444'}[g.g];return `<span class="screc" style="background:${c};color:#111;font-weight:700">${g.g}</span>`;}
// ---- przydziały ----
const ASG_LVL=[['first','Do pierwszej szóstki'],['rot','Wzmocnienie ławki'],['pros','Perspektywiczni (do 23 lat)'],['fa','Wolni zawodnicy'],['any','Każdy ciekawy']];
function asgOK(p,t){if(p.tm===SAVE.team||p.jr||p.inj>30)return false;if(t.reg!=='ALL'&&pReg(p)!==t.reg)return false;if(t.pos&&p.pos!==t.pos)return false;if(p.age>t.maxAge)return false;
  const my=myPosR(p.pos);const r=rating(p);if(t.lvl==='first')return r>=(my[0]||0)-1;if(t.lvl==='rot')return r>=(my[1]||my[0]||0)-2;if(t.lvl==='pros')return p.age<=23&&(p.pot||r)>=(my[0]||0)-2;if(t.lvl==='fa')return p.tm<0;return r>=(my[2]||0);}
function asgNew(){const v=k=>{const e=document.getElementById(k);return e?e.value:'';};const sid=v('asgsc');const sc=scAll().find(x=>x.id===sid)||freeScout();if(!sc){ui.scMsg='Nie masz wolnego skauta. Zatrudnij skauta (Sztab) albo zakończ inne zadanie.';render();return;}
  if(scoutLoad(sc)>=scoutSlots(sc)){ui.scMsg=`${scoutName(sc.id)} nie ma wolnego miejsca na zadanie.`;render();return;}
  const mo=+v('asgmo')||2;const s=SC();const t={id:'tk'+(s.nid++),type:'asg',sid:sc.id,reg:v('asgreg')||'ALL',pos:v('asgpos'),maxAge:+v('asgage')||40,lvl:v('asglvl')||'any',start:today(),until:addDays(today(),mo*30),next:addDays(today(),asgGap(sc,v('asgreg')||'ALL')),found:0};
  s.tasks.push(t);ui.scMsg=`Przydział rozpoczęty: ${scoutName(sc.id)} — ${t.reg==='ALL'?'wszystkie regiony':REG_N[t.reg]}, ${mo} mies. Rekomendacje będą spływać co kilka dni.`;save();render();}
function asgCost(t){return t.reg===myReg()?8000:t.reg==='W'||t.reg==='ALL'?30000:20000;}
function scNeed(){return SC().tasks.filter(t=>t.type==='asg'&&t.start).reduce((a,t)=>a+asgCost(t),0)+Object.keys(SX().sub).filter(k=>SX().sub[k]).length*0;}
function budFactor(){const need=scNeed();if(!need)return 1;return clamp(0.4+0.6*SX().bud/need,0.4,1.2);}
function asgGap(sc,reg){scEnsure(sc);const home=reg===sc.reg;return Math.round(clamp(15-sc.skill/2.5-(home?2:0),5,14)/budFactor());}
function asgFind(t,sc){scEnsure(sc);const s=SX();const seen=new Set(s.recs.filter(r=>daysBetween(r.d,today())<120).map(r=>r.pid));const home=t.reg===sc.reg;
  const noise=(20-sc.ja)/2+(home?0:1.5),pn=(20-sc.jp)/2;
  const xs=W().players.filter(p=>!seen.has(p.id)&&asgOK(p,t)).map(p=>({p,s:rating(p)+hId(p.id+sc.id)*noise+(p.age<=23?Math.max(0,((p.pot||rating(p))+hId(p.id+'p'+sc.id)*pn)-rating(p))*0.4:0)})).sort((a,b)=>b.s-a.s);
  const n=sc.skill>=15&&R()<0.25?2:1;const out=[];for(const x of xs.slice(0,n)){const p=x.p;addKnow(p.id,25+sc.ja*1.5+(home?8:0));const g=gradeOf(p);
    s.recs.unshift({pid:p.id,d:today(),sid:sc.id,g:g.g,asg:t.id});out.push(p);}
  s.recs=s.recs.slice(0,80);const rg=t.reg==='ALL'?pReg(out[0]||{tm:-1,nat:'W'}):t.reg;if(out.length)s.reg[rg]=Math.min(100,(s.reg[rg]||0)+2+(home?1:0));t.found+=out.length;
  if(!xs.length)t.dry=(t.dry||0)+1;return out;}
// ---- dzienny przebieg (zastępuje dawny scoutDay) ----
scoutDay=function(d){if(SAVE.team==null||!SAVE.world)return;const s=SX();
  for(const t of s.tasks.slice()){const sc=allScouts().find(x=>x.id===t.sid);if(!sc){s.tasks=s.tasks.filter(x=>x!==t);continue;}
    if(!t.start){if(scoutLoad(sc)<scoutSlots(sc)){t.start=d;t.until=addDays(d,t.type==='chr'?chrDays(sc):taskDays(t.type,sc));}continue;}
    if(t.type==='asg'){if(t.next<=d&&d<t.until){asgFind(t,sc);t.next=addDays(d,asgGap(sc,t.reg));}if(t.until<=d){s.tasks=s.tasks.filter(x=>x!==t);sendMail({cat:'skaut',from:`${sc.first[0]}. ${sc.last} (skaut)`,t:`Koniec przydziału: ${t.reg==='ALL'?'wszystkie regiony':REG_N[t.reg]}`,s:`Znalezionych zawodników: ${t.found}. Skaut jest wolny.`,b:{type:'text',x:`Przydział zakończony. Rekomendowanych zawodników: ${t.found}. Wszystkie raporty są w Skauting → Rekomendacje.`},lab:'Przydział'});}continue;}
    if(t.type==='obs'){addKnow(t.pid,(40+sc.skill*2.5)/Math.max(1,daysBetween(t.start,t.until)));}
    if(t.until<=d){s.tasks=s.tasks.filter(x=>x!==t);if(t.type==='obs')obsReport(t,sc);else if(t.type==='chr')chrReport(t,sc);else mktReport(t,sc);}}
  if(s.opp.on){const e=nextEvent();const c=myNext();if(e&&c&&e.d>=d&&daysBetween(d,e.d)<=2){const op=c.h===SAVE.team?c.a:c.h;const key=e.d+':'+op;if(!s.opp.done[key]){s.opp.done[key]=1;oppReport(op,e);}}}
  // cotygodniowe podsumowanie rekomendacji i alerty z celownika
  if(!s.wk||daysBetween(s.wk,d)>=7){s.wk=d;const nw=s.recs.filter(r=>daysBetween(r.d,d)<7);
    if(nw.length){const top=nw.slice().sort((a,b)=>a.g.localeCompare(b.g))[0];const P=PLAYERS[top.pid];sendMail({cat:'skaut',from:'Dział skautingu',t:`Rekomendacje skautów: ${nw.length} ${nw.length===1?'nowa':nw.length<5?'nowe':'nowych'}`,s:P?`Najlepsza ocena: ${top.g} — ${P.p.first} ${P.p.last} (${POS_SHORT[P.p.pos]}).`:'',b:{type:'recs',n:nw.length},lab:'Rekomendacje'});}
    shortAlerts(d);}
  if(d.endsWith('-01'))scoutMonth(d);};
// raz w miesiącu: koszty skautingu i subskrypcji, wygasanie wiedzy o regionach bez skautów
function scoutMonth(d){const s=SX();const subs=Object.keys(s.sub).filter(k=>s.sub[k]);const cost=s.bud+subs.length*SUB_COST;if(cost>0){money(-cost,'Skauting');finLog(`Skauting: budżet ${fmt(s.bud)}${subs.length?` + bazy danych (${subs.join(', ')})`:''}`,-cost);}
  const act=new Set(s.tasks.filter(t=>t.type==='asg'&&t.start).map(t=>t.reg));for(const [c] of REGS){if(act.has(c)||act.has('ALL'))continue;const floor=c===myReg()?35:5;s.reg[c]=Math.max(floor,(s.reg[c]||0)-2);}}
// ---- sprawdzenie charakteru ----
function chrDays(sc){return Math.round(clamp(6-sc.skill/5,2,5));}
function chrCheck(pid){if(SC().tasks.some(t=>t.type==='chr'&&t.pid===pid)){ui.scMsg='Charakter tego zawodnika jest już sprawdzany.';render();return;}newTask({type:'chr',pid});}
function chrReport(t,sc){const P=PLAYERS[t.pid];if(!P)return;const p=P.p;SX().chr[p.id]=1;addKnow(p.id,10);ensTraits(p);
  sendMail({cat:'skaut',from:`${sc.first[0]}. ${sc.last} (skaut)`,t:`Charakter: ${p.first} ${p.last}`,s:p.tr.map(k=>TRAITS[k]?TRAITS[k][0]:k).join(', ')||'bez wyraźnych cech',b:{type:'text',x:`Dyskretne rozpoznanie (rozmowy z trenerami, kolegami z drużyny i dziennikarzami):\n\n${p.tr.map(k=>TRAITS[k]?`• ${TRAITS[k][0]} — ${TRAITS[k][2]}`:'').join('\n')||'Brak wyraźnych cech charakteru.'}\n\nChęć przejścia do nas: ${wantsMove(p)[0]}.`},lab:'Charakter'});}
// ---- celownik: alerty o obserwowanych ----
function shortAlerts(d){const s=SX();const L=[];for(const id of s.short){const P=PLAYERS[id];if(!P)continue;const p=P.p;if(p.tm===SAVE.team)continue;const n=S().n;
  const now={tl:!!p.tl,ce:p.tm>=0&&p.ce<=n,un:p.tm>=0&&TEAMS[p.tm]&&pSat(p,TEAMS[p.tm]).v<40,v:p.tm>=0?pValue(p):0,fa:p.tm<0};const o=s.snap[id];s.snap[id]=now;if(!o)continue;
  if(now.tl&&!o.tl)L.push(`${p.first} ${p.last} jest na liście transferowej.`);if(now.ce&&!o.ce)L.push(`${p.first} ${p.last}: kontrakt kończy się po sezonie.`);
  if(now.un&&!o.un)L.push(`${p.first} ${p.last} jest niezadowolony w klubie — łatwiej go pozyskać.`);if(now.fa&&!o.fa)L.push(`${p.first} ${p.last} jest wolnym zawodnikiem!`);
  if(o.v&&now.v&&Math.abs(now.v/o.v-1)>=0.15)L.push(`${p.first} ${p.last}: wartość ${now.v>o.v?'wzrosła':'spadła'} do ${fmt(now.v)}.`);}
  if(L.length)sendMail({cat:'skaut',from:'Dział skautingu',t:`Na celowniku: ${L.length} ${L.length===1?'zmiana':L.length<5?'zmiany':'zmian'}`,s:L[0],b:{type:'text',x:'Zmiany u zawodników z listy obserwowanych:\n\n• '+L.join('\n• ')},lab:'Celownik'});}
// ---- poczta: podsumowanie rekomendacji ----
{const _sm=scoutMailHtml;scoutMailHtml=function(m){const b=m.b;if(b.type==='recs')return `<p class="mtext">Skauci przesłali ${b.n} ${b.n===1?'nową rekomendację':'nowych rekomendacji'}. Każda ma ocenę A–E (A = zdecydowanie warto, E = odpuść).</p><div class="mact"><button class="btn" onclick="ui.scTab='recs';go('skauting')">Rekomendacje</button></div>`;
  let h=_sm(m);if(b.type==='scout'&&PLAYERS[b.pid]){const p=PLAYERS[b.pid].p;const g=gradeOf(p);const wm=wantsMove(p);h=`<div class="card" style="margin-bottom:10px"><div class="row wrap" style="gap:10px;align-items:center">${gradeChip(g)}<b>${g.v}</b><span class="mut">${esc(g.why)}</span><span class="sp"></span><span class="small">Chęć przejścia: <span class="${wm[1]}">${wm[0]}</span></span>${trKnown(p)?'':`<button class="ghost sm" onclick="chrCheck('${p.id}')">Sprawdź charakter</button>`}</div></div>`+h;}return h;};}
// ---- widoki ----
function regBar(c){const k=regK(c);return `<div class="row" style="gap:8px;align-items:center;margin:4px 0"><span style="min-width:120px">${c==='W'?'🌍':natFl(c)} ${REG_N[c]}</span><span class="kbar wide"><i style="width:${k}%;background:var(--acc)"></i></span><b style="min-width:40px">${k}%</b>
  <label class="small"><input type="checkbox" ${subOn(c)?'checked':''} onchange="SX().sub['${c}']=this.checked?1:0;save();render()"> baza danych (${fmtShort2(SUB_COST)}/mies.)</label></div>`;}
function scoutXView(){const s=SX();const sc=scAll();const tab=ui.scTab||'asg';
  const tabs=`<div class="ptabs">${[['ov','Przegląd'],['asg','Przydziały i regiony'],['recs','Rekomendacje ('+s.recs.filter(r=>PLAYERS[r.pid]&&PLAYERS[r.pid].p.tm!==SAVE.team).length+')'],['tgt','Na celowniku ('+s.short.length+')']].map(([k,l])=>`<button class="tabb ${tab===k?'on':''}" onclick="ui.scTab='${k}';ui.scMsg=null;render()">${l}</button>`).join('')}</div>`;
  if(tab==='ov')return tabs+scoutViewOld();
  const msg=ui.scMsg?`<div class="card tmsg ok">${esc(ui.scMsg)}</div>`:'';
  if(tab==='asg'){const asg=s.tasks.filter(t=>t.type==='asg');const need=scNeed();const bf=budFactor();
    return tabs+msg+`<div class="card"><h2>Skauci${tipQ('Ocena umiejętności — jak trafnie skaut widzi obecny poziom. Ocena potencjału — jak trafnie przewiduje rozwój. W swoim regionie pracuje szybciej i dokładniej.')}</h2>
      ${sc.length?`<div class="tw"><table><thead><tr><th class="l">Skaut</th><th>Ogólnie</th><th>Ocena umiejętności</th><th>Ocena potencjału</th><th class="l">Najlepszy region</th><th>Zadania</th></tr></thead><tbody>${sc.map(x=>`<tr><td class="l"><span class="fcell">${sFace(x,28)}<b>${esc(x.first[0]+'. '+x.last)}</b></span></td><td><span class="sk ${aCls(x.skill)}">${x.skill}</span></td><td><span class="sk ${aCls(x.ja)}">${x.ja}</span></td><td><span class="sk ${aCls(x.jp)}">${x.jp}</span></td><td class="l">${x.reg==='W'?'🌍':natFl(x.reg)} ${REG_N[x.reg]}</td><td>${scoutLoad(x)}/${scoutSlots(x)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="bad">Nie masz skauta. Zatrudnij go w zakładce Sztab.</p>'}</div>
     <div class="card"><h2>Nowy przydział</h2><p class="small mut">Skaut przez wybrany czas szuka zawodników według kryteriów i co kilka dni przysyła rekomendację z oceną A–E. Przydział zajmuje jedno miejsce na zadanie.</p>
      <div class="row wrap" style="gap:6px"><select id="asgsc">${sc.map(x=>`<option value="${x.id}">${esc(x.first[0]+'. '+x.last)} (${REG_N[x.reg]}) · ${scoutLoad(x)}/${scoutSlots(x)}</option>`).join('')}</select>
       <select id="asgreg"><option value="ALL">Wszystkie regiony</option>${REGS.map(([c,n])=>`<option value="${c}">${n}</option>`).join('')}</select>
       <select id="asgpos"><option value="">Każda pozycja</option>${['R','A','P','S','L'].map(k=>`<option value="${k}">${POS_NAMES[k]}</option>`).join('')}</select>
       <select id="asgage">${[[40,'Każdy wiek'],[21,'Do 21 lat'],[23,'Do 23 lat'],[26,'Do 26 lat'],[30,'Do 30 lat']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
       <select id="asglvl">${ASG_LVL.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select>
       <select id="asgmo">${[[1,'1 miesiąc'],[2,'2 miesiące'],[3,'3 miesiące'],[6,'6 miesięcy']].map(([v,l])=>`<option value="${v}" ${v===2?'selected':''}>${l}</option>`).join('')}</select>
       <button class="btn" onclick="asgNew()">Rozpocznij przydział</button></div>
      ${asg.length?`<h3 style="margin-top:12px">Trwające przydziały</h3>${asg.map(t=>`<div class="stask"><span>🧭 ${esc(scoutName(t.sid))}: ${t.reg==='ALL'?'wszystkie regiony':REG_N[t.reg]} · ${t.pos?POS_NAMES[t.pos]:'każda pozycja'} · ${ASG_LVL.find(x=>x[0]===t.lvl)[1].toLowerCase()}${t.maxAge<40?' · do '+t.maxAge+' lat':''} — znaleziono ${t.found}, do ${fmtShort(t.until)}${t.dry>=2?' <span class="bad">(brak pasujących zawodników — poluzuj kryteria)</span>':''}</span><button class="link small" onclick="cancelTask('${t.id}')">zakończ</button></div>`).join('')}`:''}</div>
     <div class="card"><h2>Znajomość regionów${tipQ('Im lepiej znasz region, tym dokładniej widzisz zawodników z tamtejszych klubów (węższe przedziały ocen). Rośnie, gdy skauci tam pracują, maleje o 2 pkt na miesiąc bez skautów. Baza danych daje stałą wiedzę o wszystkich zawodnikach regionu.')}</h2>${REGS.map(([c])=>regBar(c)).join('')}</div>
     <div class="card"><h2>Budżet skautingu</h2><p class="small mut">Pokrywa podróże i koszty obserwacji. Przydział w kraju kosztuje ok. ${fmtShort2(8000)}/mies., za granicą ${fmtShort2(20000)}, na całym świecie ${fmtShort2(30000)}. Za mały budżet spowalnia przydziały. Płatne 1. dnia miesiąca z kasy klubu.</p>
      <div class="row wrap" style="gap:6px;align-items:center"><select onchange="SX().bud=+this.value;save();render()">${[0,10000,25000,50000,80000,120000].map(v=>`<option value="${v}" ${s.bud===v?'selected':''}>${fmt(v)}/mies.</option>`).join('')}</select>
       <span class="small">Potrzeby obecnych przydziałów: <b>${fmt(need)}</b>/mies. · tempo pracy: <b class="${bf>=1?'good':bf>=0.7?'':'bad'}">${Math.round(bf*100)}%</b></span></div></div>`;}
  if(tab==='recs'){const f=ui.rf||(ui.rf={g:'',pos:''});let L=s.recs.filter(r=>PLAYERS[r.pid]&&PLAYERS[r.pid].p.tm!==SAVE.team);
    const rows=L.map(r=>{const p=PLAYERS[r.pid].p;return {r,p,g:gradeOf(p)};}).filter(x=>(!f.g||x.g.g<=f.g)&&(!f.pos||x.p.pos===f.pos)).sort((a,b)=>a.g.g.localeCompare(b.g.g)||rMid(b.p)-rMid(a.p));
    return tabs+msg+`<div class="card"><div class="row wrap" style="gap:8px"><h2 style="margin:0">Rekomendacje skautów</h2><span class="sp"></span>
      <select onchange="ui.rf.g=this.value;render()">${[['','Każda ocena'],['A','Tylko A'],['B','A–B'],['C','A–C']].map(([v,l])=>`<option value="${v}" ${f.g===v?'selected':''}>${l}</option>`).join('')}</select>
      <select onchange="ui.rf.pos=this.value;render()"><option value="">Każda pozycja</option>${['R','A','P','S','L'].map(k=>`<option value="${k}" ${f.pos===k?'selected':''}>${POS_NAMES[k]}</option>`).join('')}</select></div>
      <p class="small mut">Ocena A–E porównuje zawodnika z Twoją kadrą na tej pozycji, uwzględnia potencjał młodych i to, czy stać Cię na transfer. Przelicza się na bieżąco.</p>
      ${rows.length?`<div class="tw"><table class="mkt"><thead><tr><th>Ocena</th><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th class="l">Klub</th><th>Ocena</th><th>Potencjał</th><th>Wartość</th><th class="l">Chęć przejścia</th><th class="l">Werdykt</th><th></th></tr></thead><tbody>${rows.map(({r,p,g})=>{const wm=wantsMove(p);return `<tr><td>${gradeChip(g)}</td><td class="l"><span class="fcell">${pFace(p,26)}<button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button></span><div class="small mut">${fmtShort(r.d)} · ${esc(scoutName(r.sid))}</div></td><td>${pTag(p.pos)}</td><td>${p.age}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short):'<span class="good">wolny</span>'}</td><td><b>${rTxt(p)}</b></td><td class="stars">${potStars(p)}</td><td>${p.tm>=0?fmtShort2(pValue(p)):'—'}</td><td class="l small ${wm[1]}">${wm[0]}</td><td class="l small" title="${esc(g.why)}"><b>${g.v}</b></td>
        <td class="nw"><button class="star ${isShort(p.id)?'on':''}" onclick="toggleShort('${p.id}')">${isShort(p.id)?'★':'☆'}</button> ${trKnown(p)?'':`<button class="ghost sm" onclick="chrCheck('${p.id}')">Charakter</button>`} <button class="ghost sm" onclick="openCard('${p.id}')">Oferta</button></td></tr>`;}).join('')}</tbody></table></div>`:'<p class="mut">Brak rekomendacji. Rozpocznij przydział w zakładce „Przydziały i regiony”.</p>'}</div>`;}
  // celownik
  const ps=s.short.map(id=>PLAYERS[id]).filter(Boolean).map(x=>x.p).filter(p=>p.tm!==SAVE.team);
  return tabs+msg+`<div class="card"><h2>Na celowniku${tipQ('Co tydzień dostaniesz wiadomość, gdy obserwowany zawodnik trafi na listę transferową, będzie miał kończący się kontrakt, stanie się wolny, będzie niezadowolony albo mocno zmieni się jego wartość.')}</h2>
    ${ps.length?`<div class="tw"><table class="mkt"><thead><tr><th>Ocena</th><th class="l">Zawodnik</th><th>Poz</th><th>Wiek</th><th class="l">Klub</th><th>Ocena</th><th>Wiedza</th><th class="l">Status</th><th></th></tr></thead><tbody>${ps.map(p=>{const g=gradeOf(p);const st=[p.tl?'na liście transferowej':'',p.tm<0?'wolny':'',p.tm>=0&&p.ce<=S().n?'kończy kontrakt':'',p.tm>=0&&TEAMS[p.tm]&&pSat(p,TEAMS[p.tm]).v<40?'niezadowolony':''].filter(Boolean).join(', ');
      return `<tr><td>${gradeChip(g)}</td><td class="l"><span class="fcell">${pFace(p,26)}<button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button></span></td><td>${pTag(p.pos)}</td><td>${p.age}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short):'<span class="good">wolny</span>'}</td><td><b>${rTxt(p)}</b></td><td>${knowBar(p)}</td><td class="l small">${st||'<span class="mut">—</span>'}</td>
      <td class="nw">${SC().tasks.some(t=>t.pid===p.id)?'<small class="mut">zadanie trwa…</small>':`<button class="ghost sm" onclick="observe('${p.id}')">Obserwuj</button> ${trKnown(p)?'':`<button class="ghost sm" onclick="chrCheck('${p.id}')">Charakter</button>`}`} <button class="star on" onclick="toggleShort('${p.id}')">★</button></td></tr>`;}).join('')}</tbody></table></div>`:'<p class="mut">Pusto. Dodaj zawodników gwiazdką ☆ w rekomendacjach, bazie zawodników albo na rynku.</p>'}</div>`;}
// podmiana widoku Skautingu (stary widok dostępny jako „Przegląd”)
const scoutViewOld=scoutView;scoutView=scoutXView;
