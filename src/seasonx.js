// ================= RAPORT SEZONU I SPOKOJNIEJSZY START =================
// S().srp = {exp, days, mor, chem, inj} — dane zbierane codziennie w trakcie ligi do raportu „dlaczego tak wyszło”.
function srS(){const s=S();if(!s)return null;return s.srp||(s.srp={exp:null,n:0,days:0,mor:0,chem:0,inj:0});}
function srRank(){const ids=lgIds(myLg()).filter(i=>!isYT(i)).sort((a,b)=>teamStrength(TEAMS[b])-teamStrength(TEAMS[a]));return {r:ids.indexOf(SAVE.team)+1,n:ids.length};}
function srTop7(){return myTeam().players.filter(p=>!p.jr).sort((a,b)=>rating(b)-rating(a)).slice(0,7);}
function srDaily(){if(SAVE.team==null||SAVE.fired)return;const s=S();if(!s||s.phase!=='liga')return;const R=srS();
  if(R.exp==null){const k=srRank();R.exp=k.r;R.n=k.n;}
  if(!R.r0){R.r0={};for(const p of myTeam().players)R.r0[p.id]=rating(p);for(const p of juniorsOf(SAVE.team))R.r0[p.id]=rating(p);R.bal0=SAVE.fin?SAVE.fin.bal:0;}
  const ps=myTeam().players.filter(p=>!p.jr);R.days++;R.mor+=ps.reduce((a,p)=>a+(p.mor==null?60:p.mor),0)/Math.max(1,ps.length);
  try{R.chem+=chemPct(chemOf(myLineupPlayers(),SAVE.team));}catch(e){R.chem+=50;}
  R.inj+=srTop7().filter(p=>p.inj).length;}
{const _md=mailDaily;mailDaily=function(d){const r=_md.apply(this,arguments);try{srDaily();}catch(e){console.error(e);}return r;};}
// ---- raport po sezonie ----
function srBuild(){const s=S();const R=srS();const me=SAVE.team;const place=s.final?s.final.indexOf(me)+1:null;if(!place)return null;
  const games=[];for(const rd of s.results||[])for(const g of rd)if(g.h===me||g.a===me)games.push(g);
  let w=0,l=0,tbw=0,tbl=0,weakL=0,strongW=0;const myS=teamStrength(myTeam());
  for(const g of games){const h=g.h===me;const a=h?g.sw[0]:g.sw[1],b=h?g.sw[1]:g.sw[0];const op=h?g.a:g.h;const won=a>b;if(won)w++;else l++;
    if(a+b===5){if(won)tbw++;else tbl++;}const os=teamStrength(TEAMS[op]);if(!won&&os<myS-2)weakL++;if(won&&os>myS+2)strongW++;}
  const exp=R.exp||srRank().r,n=R.n||srRank().n;const days=Math.max(1,R.days);
  const mor=Math.round(R.mor/days),chem=Math.round(R.chem/days),inj=R.inj/days;
  const L=[];const F=[];// F: [waga, opis] — największy czynnik idzie na koniec jako wniosek
  const dv=exp-place;
  L.push(`Przed sezonem nasz skład był ${exp}. siłą ligi (na ${n} drużyn). Zajęliśmy ${place}. miejsce — ${dv>=2?'wyraźnie ponad oczekiwania':dv<=-2?'wyraźnie poniżej oczekiwań':'mniej więcej tyle, na ile było nas stać'}.`);
  L.push(`Bilans fazy zasadniczej: ${w} zwycięstw, ${l} porażek.`);
  if(tbw+tbl){L.push(`Mecze rozstrzygnięte w tie-breaku: ${tbw} wygranych, ${tbl} przegranych.`);if(tbl-tbw>=3)F.push([-(tbl-tbw),`przegrane końcówki — ${tbl} porażek po tie-breaku to punkty, które uciekły o włos`]);if(tbw-tbl>=3)F.push([tbw-tbl,`wygrane końcówki — ${tbw} zwycięstw po tie-breaku dało nam więcej, niż wynikało z siły składu`]);}
  if(weakL)L.push(`Porażki z teoretycznie słabszymi rywalami: ${weakL}.`);if(weakL>=3)F.push([-weakL,`wpadki ze słabszymi (${weakL} porażek)`]);
  if(strongW)L.push(`Zwycięstwa z teoretycznie silniejszymi: ${strongW}.`);
  const injT=Math.round(inj*10)/10;L.push(`Kontuzje: średnio ${String(injT).replace('.',',')} z 7 najlepszych zawodników było niezdolnych do gry.`);if(inj>=1)F.push([-inj*3,'kontuzje kluczowych zawodników']);
  L.push(`Średnie morale: ${mor}%. Średnie zgranie wyjściowej szóstki: ${chem}%.`);
  if(mor<50)F.push([-(50-mor)/4,'niskie morale w szatni']);if(chem<55)F.push([-(55-chem)/4,'słabe zgranie wyjściowej szóstki — częste zmiany składu']);
  if(mor>=70)F.push([(mor-65)/5,'świetna atmosfera w szatni']);if(chem>=75)F.push([(chem-70)/5,'dobrze zgrana wyjściowa szóstka']);
  // dodatnia waga = pomogło, ujemna = zaszkodziło; wniosek bierze czynniki zgodne z kierunkiem wyniku
  const ev=s.eval||{};const neg=F.filter(x=>x[0]<0).sort((a,b)=>a[0]-b[0]),pos=F.filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]);
  let concl;
  if(dv<=-1)concl=neg.length?`Co zaszkodziło najbardziej: ${neg.slice(0,2).map(x=>x[1]).join('; ')}.`:'Nie było jednej wyraźnej przyczyny — liga jest wyrównana, a kilka przegranych końcówek wystarczy, żeby spaść o kilka miejsc. Warto wzmocnić skład albo poprosić zarząd o niższy cel.';
  else if(dv>=1)concl=pos.length?`Co pomogło najbardziej: ${pos.slice(0,2).map(x=>x[1]).join('; ')}.`:'Drużyna grała ponad stan — utrzymanie tego poziomu będzie trudne bez wzmocnień.';
  else concl=neg.length?`Wynik zgodny z siłą składu. Do poprawy: ${neg[0][1]}.`:'Wynik zgodny z siłą składu.';
  return {place,goal:ev.goal,met:ev.met,lines:L,concl};}
// ---- pełne podsumowanie: najlepsi, transfery, postępy, juniorzy, finanse ----
function srMore(r){const s=S(),R=srS(),me=SAVE.team,ps=s.ps||{},t=myTeam();const P=id=>PLAYERS[id]&&PLAYERS[id].p;
  const nm=p=>p.first[0]+'. '+p.last;
  // najlepsi zawodnicy sezonu
  const mine=t.players.map(p=>Object.assign({p},ps[p.id]||{})).filter(x=>x.m);
  const best=mine.slice().sort((a,b)=>(b.pts||0)-(a.pts||0)).slice(0,3).map(x=>[nm(x.p),x.p.pos,x.m,x.pts||0,x.mvp||0,x.rn>0?Math.round(x.rs/x.rn*10)/10:null]);
  // transfery sezonu: przyszli i odeszli
  const H=(SAVE.trh||[]).filter(x=>x.n===s.n);const avg=(()=>{const xs=t.players.filter(p=>!p.jr).map(p=>rating(p)).sort((a,b)=>b-a).slice(0,7);return xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length);})();
  const games=Math.max(1,...mine.map(x=>x.m||0));
  // werdykt z średniej oceny meczowej w sezonie (ocena liczona w roli zawodnika): trafiony ≥ 7,5; przydatny ≥ 6,5
  const tin=H.filter(x=>x.inn).map(x=>{const p=P(x.id);const st=ps[x.id]||{};const rNow=p?rating(p):x.r;const sr=st.rn>0?Math.round(st.rs/st.rn*10)/10:null;
    let v;if(sr==null||st.rn<5)v='za mało meczów';else if(sr>=7.5)v='trafiony';else if(sr>=6.5)v='przydatny';else v='nietrafiony';
    return {nm:x.nm,pos:x.pos,fee:x.fee||0,loan:!!x.loan,r0:x.r,r1:rNow,m:st.m||0,pts:st.pts||0,sr,v};});
  const tout=H.filter(x=>!x.inn).map(x=>({nm:x.nm,pos:x.pos,fee:x.fee||0,r:x.r,o:x.o}));
  const spent=tin.reduce((a,x)=>a+x.fee,0),earned=tout.reduce((a,x)=>a+x.fee,0);
  // postępy (zawodnicy, którzy byli w kadrze przez cały sezon)
  const r0=R.r0||{};const prog=t.players.filter(p=>!p.jr&&r0[p.id]!=null).map(p=>[nm(p),p.pos,p.age,r0[p.id],rating(p),rating(p)-r0[p.id]]);
  const up=prog.filter(x=>x[5]>0).sort((a,b)=>b[5]-a[5]).slice(0,3),down=prog.filter(x=>x[5]<0).sort((a,b)=>a[5]-b[5]).slice(0,3);
  const jr=juniorsOf(me).filter(p=>r0[p.id]!=null).map(p=>[nm(p),p.pos,p.age,r0[p.id],rating(p),rating(p)-r0[p.id]]).sort((a,b)=>b[5]-a[5]).slice(0,3);
  // finanse sezonu
  const sea=(SAVE.fin&&SAVE.fin.sea)||{};const cats=Object.entries(sea).filter(([k,v])=>v);
  const inc=cats.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3),cost=cats.filter(x=>x[1]<0).sort((a,b)=>a[1]-b[1]).slice(0,3);
  Object.assign(r,{best,tin,tout,spent,earned,up,down,jr,bal0:R.bal0==null?null:R.bal0,bal1:SAVE.fin?SAVE.fin.bal:null,inc,cost,sl:sLabel(s.n)});return r;}
function srMail(){const r=srBuild();if(!r)return;srMore(r);const from=typeof asyName==='function'?asyName():'Sztab szkoleniowy';
  sendMail({cat:'druz',from,t:`Podsumowanie sezonu ${r.sl}: ${r.place}. miejsce`,s:r.concl.slice(0,90),b:{type:'srep',r},ic:'📋'});}
function srHtml(r){const T=(head,rows)=>rows.length?`<table class="srt"><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(c=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table>`:'';
  const sg=v=>v>0?`<b class="good">+${v}</b>`:v<0?`<b class="bad">${v}</b>`:'0';const vc=v=>v==='trafiony'?`<b class="good">${v}</b>`:v==='nietrafiony'?`<b class="bad">${v}</b>`:v;
  let h=`<style>.srt{border-collapse:collapse;width:100%;margin:4px 0 10px;font-size:13px}.srt th{text-align:left!important;font-weight:600;opacity:.7;padding:3px 6px}.srt td{text-align:left!important;padding:3px 6px;border-top:1px solid rgba(255,255,255,.08)}.srh{margin:14px 0 4px;font-size:15px}</style>`;
  h+=`<h3 class="srh">Wynik</h3>${r.goal?`<p>Cel zarządu: ${esc(goalTxt(r.goal,lgOf(SAVE.team)))} — ${r.met?'<b class="good">wykonany</b>':'<b class="bad">niewykonany</b>'}.</p>`:''}<ul>${r.lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><b>${esc(r.concl)}</b></p>`;
  if(r.best&&r.best.length)h+=`<h3 class="srh">Najlepsi zawodnicy</h3>`+T(['Zawodnik','Poz.','Mecze','Punkty','MVP','Śr. ocena'],r.best.map(x=>[esc(x[0]),esc(x[1]),x[2],x[3],x[4],x[5]==null?'—':String(x[5]).replace('.',',')]));
  if(r.tin){h+=`<h3 class="srh">Transfery</h3>`;
    if(!r.tin.length&&!r.tout.length)h+='<p class="mut">W tym sezonie nie było transferów.</p>';
    if(r.tin.length)h+=`<p class="small mut">Przyszli</p>`+T(['Zawodnik','Poz.','Koszt','Ocena przy transferze → teraz','Mecze','Śr. ocena w sezonie','Werdykt'],r.tin.map(x=>[esc(x.nm),esc(x.pos),x.loan?'wypożyczenie':x.fee?fmt(x.fee):'za darmo',`${x.r0} → ${x.r1}`,x.m,x.sr==null?'—':String(x.sr).replace('.',','),vc(x.v)]))+'<p class="small mut">Werdykt: trafiony — średnia ocena meczowa w swojej roli co najmniej 7,5; przydatny — 6,5–7,4; nietrafiony — poniżej 6,5 (liczone przy co najmniej 5 meczach).</p>';
    if(r.tout.length)h+=`<p class="small mut">Odeszli</p>`+T(['Zawodnik','Poz.','Kwota','Ocena'],r.tout.map(x=>[esc(x.nm),esc(x.pos),x.fee?fmt(x.fee):'—',x.r]));
    if(r.spent||r.earned)h+=`<p>Wydane na transfery: <b>${fmt(r.spent)}</b>, zarobione ze sprzedaży: <b>${fmt(r.earned)}</b>, bilans: ${r.earned-r.spent>=0?`<b class="good">${fmt(r.earned-r.spent)}</b>`:`<b class="bad">${fmt(r.earned-r.spent)}</b>`}.</p>`;}
  if(r.up&&(r.up.length||r.down.length)){h+=`<h3 class="srh">Postępy zawodników</h3>`;
    if(r.up.length)h+=`<p class="small mut">Największy rozwój</p>`+T(['Zawodnik','Poz.','Wiek','Ocena','Zmiana'],r.up.map(x=>[esc(x[0]),esc(x[1]),x[2],`${x[3]} → ${x[4]}`,sg(x[5])]));
    if(r.down.length)h+=`<p class="small mut">Największy spadek formy</p>`+T(['Zawodnik','Poz.','Wiek','Ocena','Zmiana'],r.down.map(x=>[esc(x[0]),esc(x[1]),x[2],`${x[3]} → ${x[4]}`,sg(x[5])]));}
  if(r.jr&&r.jr.length)h+=`<h3 class="srh">Juniorzy</h3>`+T(['Junior','Poz.','Wiek','Ocena','Zmiana'],r.jr.map(x=>[esc(x[0]),esc(x[1]),x[2],`${x[3]} → ${x[4]}`,sg(x[5])]));
  if(r.bal1!=null&&(r.inc||r.cost)){h+=`<h3 class="srh">Finanse</h3>`;if(r.bal0!=null)h+=`<p>Saldo na starcie ligi: <b>${fmt(r.bal0)}</b>, na koniec sezonu: <b>${fmt(r.bal1)}</b> (${r.bal1-r.bal0>=0?`<b class="good">+${fmt(r.bal1-r.bal0)}</b>`:`<b class="bad">${fmt(r.bal1-r.bal0)}</b>`}).</p>`;
    if(r.inc.length)h+=`<p>Największe wpływy: ${r.inc.map(([k,v])=>`${esc(k)} ${fmt(v)}`).join(', ')}.</p>`;if(r.cost.length)h+=`<p>Największe wydatki: ${r.cost.map(([k,v])=>`${esc(k)} ${fmt(-v)}`).join(', ')}.</p>`;}
  return h;}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type==='srep')return srHtml(b.r);return _mb.apply(this,arguments);};}
{const _se=seasonEvaluation;seasonEvaluation=function(){const r=_se.apply(this,arguments);try{srMail();}catch(e){console.error(e);}return r;};}
// ---- spokojniejszy pierwszy dzień: kluby nie zapraszają na sparingi, zanim trener przejmie drużynę ----
{const _sd=sparDaily;sparDaily=function(d){if(typeof ONB_START!=='undefined'&&ONB_START)return;return _sd.apply(this,arguments);};}
