// ================= RAPORT SEZONU, OSTATNIA SZANSA, SPOKOJNIEJSZY START =================
// S().srp = {exp, days, mor, chem, inj} — dane zbierane codziennie w trakcie ligi do raportu „dlaczego tak wyszło”.
function srS(){const s=S();if(!s)return null;return s.srp||(s.srp={exp:null,n:0,days:0,mor:0,chem:0,inj:0});}
function srRank(){const ids=lgIds(myLg()).filter(i=>!isYT(i)).sort((a,b)=>teamStrength(TEAMS[b])-teamStrength(TEAMS[a]));return {r:ids.indexOf(SAVE.team)+1,n:ids.length};}
function srTop7(){return myTeam().players.filter(p=>!p.jr).sort((a,b)=>rating(b)-rating(a)).slice(0,7);}
function srDaily(){if(SAVE.team==null||SAVE.fired)return;const s=S();if(!s||s.phase!=='liga')return;const R=srS();
  if(R.exp==null){const k=srRank();R.exp=k.r;R.n=k.n;}
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
function srMail(){const r=srBuild();if(!r)return;const from=typeof asyName==='function'?asyName():'Sztab szkoleniowy';
  sendMail({cat:'druz',from,t:`Podsumowanie sezonu: ${r.place}. miejsce — dlaczego tak wyszło`,s:r.concl.slice(0,90),b:{type:'srep',r},ic:'📋'});}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type==='srep'){const r=b.r;return `<p>${r.goal?`Cel zarządu: ${esc(goalTxt(r.goal,lgOf(SAVE.team)))} — ${r.met?'<b class="good">wykonany</b>':'<b class="bad">niewykonany</b>'}.`:''}</p><ul>${r.lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><b>${esc(r.concl)}</b></p>`;}return _mb.apply(this,arguments);};}
{const _se=seasonEvaluation;seasonEvaluation=function(){const r=_se.apply(this,arguments);try{srMail();}catch(e){console.error(e);}return r;};}
// ---- ostatnia szansa: po pierwszym nieudanym sezonie w klubie zarząd daje ostrzeżenie zamiast zwolnienia ----
{const _fc=fireCoach;fireCoach=function(why){try{if(/nieudanym sezonie/.test(why||'')&&!SAVE.ownClub&&S()){const B=SAVE.board;const n=S().n;
    if(!(B.lastChance&&B.lastChanceTm===SAVE.team&&n-B.lastChance<=2)){B.lastChance=n;B.lastChanceTm=SAVE.team;B.conf=Math.max(B.conf||0,30);
      news('👔 Zarząd daje ostatnią szansę: kolejny nieudany sezon oznacza zwolnienie.');
      sendMail({cat:'zarz',from:'Zarząd klubu',t:'Ostatnia szansa',s:'Zarząd nie jest zadowolony z sezonu, ale nie zwalnia trenera',act:0,b:{type:'text',x:'Sezon nie spełnił naszych oczekiwań. Zdecydowaliśmy się jednak dać Panu jeszcze jedną szansę. Jeśli w kolejnym sezonie drużyna znów nie zrealizuje celu albo zaufanie zarządu spadnie do zera, rozstaniemy się. Prosimy przeanalizować podsumowanie sezonu przygotowane przez sztab.'}});
      return;}}}catch(e){console.error(e);}return _fc.apply(this,arguments);};}
// ---- spokojniejszy pierwszy dzień: kluby nie zapraszają na sparingi, zanim trener przejmie drużynę ----
{const _sd=sparDaily;sparDaily=function(d){if(typeof ONB_START!=='undefined'&&ONB_START)return;return _sd.apply(this,arguments);};}
