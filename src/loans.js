// ===== Wypożyczenia zawodników =====
// Wypożyczenie trwa do końca sezonu. Klub wypożyczający płaci uzgodnioną część pensji (reszta zostaje w klubie macierzystym) i jednorazową opłatę.
// Po sezonie zawodnik wraca. Wypożyczonego nie można sprzedać ani wypożyczyć dalej.
function onLoan(p){return !!(p&&p.loan);}
function loanShareOf(p,ti){if(!p.loan)return p.tm===ti?1:0;return p.tm===ti?p.loan.share:(p.loan.from===ti?1-p.loan.share:0);}
function loanFee(p){return round5k(Math.max(10000,pValue(p)*0.06));}
// kluby komputera chętne wziąć mojego zawodnika: potrzebują go w składzie i nie grają w dużo mocniejszej lidze
function loanTakers(p){const r=rating(p);return TEAMS.filter(t=>t.idx!==SAVE.team&&!isYT(t.idx)&&t.players.length<16&&lgRef(lgOf(t.idx))<=lgRef(myLg())+3).map(t=>{
    const best=t.players.filter(x=>x.pos===p.pos).map(x=>rating(x)).sort((a,b)=>b-a);const need=best.length<POS_STD[p.pos]||r>(best[Math.min(best.length-1,p.pos==='P'||p.pos==='S'?1:0)]||0)-1;
    if(!need)return null;const starter=r>=(best[0]||0)-1;const share=starter?1:0.5;const wd=p.wage*share;if(BAL2&&teamWages(t.idx)+wd>wageCap(t.idx)*1.05)return null;
    return {ti:t.idx,share,fee:starter?loanFee(p):0,starter};}).filter(Boolean).sort((a,b)=>(b.starter-a.starter)||(b.share-a.share)||(SAVE.ai[b.ti].rep-SAVE.ai[a.ti].rep)).slice(0,5);}
function loanOut(pid,ti,share,fee){const p=PLAYERS[pid].p;if(!windowOpen())return tradeMsg(false,'Wypożyczać można tylko w oknie transferowym.');if(onLoan(p))return tradeMsg(false,'Zawodnik jest już wypożyczony.');
  if(myTeam().players.length-1<SQUAD_MIN)return tradeMsg(false,`Za mało zawodników w kadrze (min. ${SQUAD_MIN}).`);
  if(ui.confirm!=='lo'+ti){ui.confirm='lo'+ti;render();return;}ui.confirm=null;
  p.loan={from:SAVE.team,share,n:S().n,fee,jn0:p.jn};movePlayer(p,ti);if(fee){money(fee,'Transfery');finLog(`Wypożyczenie ${p.first} ${p.last} do ${TEAMS[ti].name}`,fee);}
  if(SAVE.lineup&&Object.values(SAVE.lineup).includes(pid))SAVE.lineup=autoLineup(myTeam());
  news(`🔁 ${p.first} ${p.last} wypożyczony do ${TEAMS[ti].name} do końca sezonu (${share===1?'pensję płaci w całości nowy klub':'pensja po połowie'}${fee?`, opłata ${fmt(fee)}`:''}).`);tradeMsg(true,`${p.last} wypożyczony do ${TEAMS[ti].name}.`);save();render();}
// wypożyczenie do nas: klub odda tylko zawodnika spoza podstawowej szóstki (albo juniora), my płacimy całą pensję i opłatę
function loanInTerms(p){if(p.tm<0||p.tm===SAVE.team||onLoan(p))return null;const t=TEAMS[p.tm];if(isStarter(p)&&!p.jr)return {no:'To podstawowy zawodnik — klub nie odda go na wypożyczenie.'};
  if(!canSellAI(p)&&!p.jr)return {no:'Klub ma za mało zawodników na tej pozycji.'};if(p.jr&&p.age<18)return {no:'Junior jest za młody na wypożyczenie (min. 18 lat).'};
  const wage=p.jr?Math.max(40000,wageDemand(p)):p.wage;return {fee:loanFee(p),wage,share:1};}
function loanIn(pid){const p=PLAYERS[pid].p;const T=loanInTerms(p);if(!T||T.no)return tradeMsg(false,T?T.no:'Nie można wypożyczyć.');if(!windowOpen())return tradeMsg(false,'Wypożyczać można tylko w oknie transferowym.');
  if(myTeam().players.length>=SQUAD_MAX)return tradeMsg(false,`Kadra jest pełna (maks. ${SQUAD_MAX}).`);
  if(typeof budCan==='function'){const e=budCan('tr',T.fee);if(e)return tradeMsg(false,e);budWageOver(T.wage);}
  if(ui.confirm!=='li'+pid){ui.confirm='li'+pid;render();return;}ui.confirm=null;
  const from=p.tm;if(p.jr){p.jr=false;p.wage=T.wage;if(!p.ce||p.ce<S().n)p.ce=S().n+1;}p.loan={from,share:1,n:S().n,fee:T.fee,jn0:p.jn};money(-T.fee,'Transfery');finLog(`Wypożyczenie ${p.first} ${p.last} z ${TEAMS[from].name}`,-T.fee);SAVE.ai[from].bud+=T.fee;movePlayer(p,SAVE.team);
  news(`🔁 Wypożyczamy ${p.first} ${p.last} z ${TEAMS[from].name} do końca sezonu (opłata ${fmt(T.fee)}, pensja ${fmt(T.wage)}/rok po naszej stronie).`);tradeMsg(true,`${p.last} dołącza na wypożyczenie.`);save();render();}
// koniec sezonu: wszyscy wypożyczeni wracają do swoich klubów
function loansReturn(){for(const p of W().players){if(!p.loan)continue;const L=p.loan;delete p.loan;if(p.tm===L.from)continue;
  const was=p.tm;p.tm=-2;movePlayer(p,L.from);p.jn=L.jn0||p.jn;if(L.from===SAVE.team)news(`↩️ ${p.first} ${p.last} wraca z wypożyczenia w ${TEAMS[was]?TEAMS[was].name:'innym klubie'}.`);else if(was===SAVE.team)news(`↩️ ${p.first} ${p.last} wraca do ${TEAMS[L.from].name} po wypożyczeniu.`);}syncTeams();}
// kluby komputera wypożyczają młodych rezerwowych do słabszych drużyn z tego samego kraju, żeby grali
function aiLoans(){const n=S().n;let k=0;for(const t of TEAMS){if(t.idx===SAVE.team||isYT(t.idx))continue;
  for(const p of t.players.slice()){if(onLoan(p)||p.age>23||isStarter(p)||R()>0.25)continue;const r=rating(p);
    const dest=TEAMS.filter(x=>x.idx!==SAVE.team&&x.idx!==t.idx&&!isYT(x.idx)&&tmCountry(x.idx)===tmCountry(t.idx)&&lgRef(lgOf(x.idx))<lgRef(lgOf(t.idx))&&x.players.length<16&&
      (x.players.filter(y=>y.pos===p.pos).map(y=>rating(y)).sort((a,b)=>b-a)[1]||0)<r+2).sort(()=>R()-0.5)[0];
    if(!dest||t.players.length-1<SQUAD_MIN||!canSellAI(p))continue;p.loan={from:t.idx,share:0.5,n,fee:0,jn0:p.jn};movePlayer(p,dest.idx);k++;}}return k;}
function loanBadge(p){if(!p.loan)return '';const L=p.loan;return p.tm===L.from?'':`<span class="lnb" title="Wypożyczony z ${esc(TEAMS[L.from].name)} do końca sezonu">🔁 ${esc(TEAMS[L.from].short)}</span>`;}
function myLoansOut(){return W().players.filter(p=>p.loan&&p.loan.from===SAVE.team&&p.tm!==SAVE.team);}
// panel w karcie zawodnika
function loanOutAct(p){if(p.jr||onLoan(p))return '';const o=windowOpen();const L=o?loanTakers(p):[];
  return `<div class="act"><h4>🔁 Wypożyczenie</h4><p class="small mut">Zawodnik zagra do końca sezonu w innym klubie i wróci. Regularna gra pomaga w rozwoju i poprawia zadowolenie.</p>
   ${!o?'<p class="small mut">Wypożyczać można tylko w oknie transferowym (przerwa między sezonami i okres przygotowawczy).</p>':!L.length?'<p class="small mut">Żaden klub nie jest teraz zainteresowany.</p>':L.map(x=>`<div class="row" style="gap:8px;margin:4px 0">${tDot(x.ti)} <b>${tName(x.ti)}</b> <small class="mut">${LG_SHORT[lgOf(x.ti)]}${x.starter?' · w podstawie':' · rezerwowy'}</small><span class="sp"></span><small>${x.share===1?'płacą całą pensję':'pensja po połowie'}${x.fee?` · +${fmt(x.fee)}`:''}</small><button class="${ui.confirm==='lo'+x.ti?'btn':'ghost'} sm" onclick="loanOut('${p.id}',${x.ti},${x.share},${x.fee})">${ui.confirm==='lo'+x.ti?'Potwierdź':'Wypożycz'}</button></div>`).join('')}</div>`;}
function loanInAct(p){const T=loanInTerms(p);if(!T)return '';return `<div class="act"><h4>🔁 Wypożyczenie do nas</h4>${T.no?`<p class="small mut">${esc(T.no)}</p>`:`<p class="small">Do końca sezonu. Opłata <b>${fmt(T.fee)}</b>, pensja <b>${fmt(T.wage)}/rok</b> płacona przez nas. Po sezonie wraca do ${tName(p.tm)}.</p>
   ${typeof budImpact==='function'?budImpact({tr:T.fee,wg:T.wage}):''}<button class="${ui.confirm==='li'+p.id?'btn':'ghost'} sm" ${windowOpen()?'':'disabled'} onclick="loanIn('${p.id}')">${!windowOpen()?'Okno transferowe zamknięte':ui.confirm==='li'+p.id?`Potwierdź: zapłacisz ${fmt(T.fee)}`:'Wypożycz'}</button>`}</div>`;}
function loansCard(){const out=myLoansOut(),inn=myTeam().players.filter(p=>p.loan&&p.loan.from!==SAVE.team);if(!out.length&&!inn.length)return '';const st=S().ps||{};
  const row=(p,dir)=>{const s=st[p.id];return `<div class="res row"><button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button> ${natTag(p)}<span class="small mut" style="margin-left:8px">${dir==='out'?'w '+tName(p.tm):'z '+tName(p.loan.from)}</span><span class="sp"></span><small class="mut">${s?`${s.m} meczów · ${s.pts} pkt`:'jeszcze nie grał'}</small></div>`;};
  return `<div class="card"><h2>Wypożyczenia</h2>${out.length?`<h3>Nasi zawodnicy w innych klubach</h3>${out.map(p=>row(p,'out')).join('')}`:''}${inn.length?`<h3>Wypożyczeni do nas</h3>${inn.map(p=>row(p,'in')).join('')}`:''}<p class="small mut">Wszyscy wracają do swoich klubów po zakończeniu sezonu.</p></div>`;}
