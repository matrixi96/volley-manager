// ================= NEGOCJACJE TRANSFEROWE: AGENCI, KLUBY, LISTA TRANSFEROWA =================
const AGENTS=[['Marek','Zieliński'],['Tomasz','Wróbel'],['Rafał','Sikora'],['Joanna','Krawczyk'],['Piotr','Dudek'],['Adam','Pietrzak'],['Ewa','Michalska'],['Grzegorz','Wieczorek'],
  ['Paweł','Jabłoński'],['Kamil','Górecki'],['Anna','Nowicka'],['Michał','Król'],['Robert','Kaczmarek'],['Łukasz','Mazur'],['Karolina','Sadowska'],['Dariusz','Wilk']];
// styl: [nazwa, opis, cierpliwość (rundy), mnożnik żądań, ustępliwość (jak szybko schodzi z ceny), ile poniżej żądania jeszcze przyjmie]
const AG_STYLE=[['twardy negocjator','Rzadko ustępuje i szybko kończy rozmowy, gdy oferta jest niska.',3,1.12,0.25,0.97],
  ['chciwy','Zaczyna od wysokich żądań, ale lubi duże prowizje.',4,1.2,0.35,0.95],
  ['rozsądny','Szuka uczciwego porozumienia, schodzi z ceny stopniowo.',4,1.06,0.45,0.94],
  ['elastyczny','Zależy mu na szybkiej umowie — chętnie ustępuje.',5,1.03,0.6,0.9]];
function agentOf(p){const h=hashN(p.id+'ag');const a=AGENTS[h%AGENTS.length];const st=(h>>>4)%AG_STYLE.length;return {first:a[0],last:a[1],st,S:AG_STYLE[st]};}
function negBonusPat(){return cA('neg')>=15?1:0;}
function prefYears(p){return p.age<=24?3:p.age>=31?1:2;}
function negLocked(p){return p.negLock&&p.negLock>today()?p.negLock:null;}
function NG(){return ui.neg;}
function negLog(who,t){NG().log.push({who,t});}
// ---- otwarcie negocjacji ----
function negOpen(pid,kind){const P=PLAYERS[pid];if(!P)return;const p=P.p;if(p.loan){tradeMsg(false,'Zawodnik jest na wypożyczeniu — do końca sezonu nie można negocjować kontraktu.');return;}if(SAVE.trBan&&kind!=='renew'){tradeMsg(false,'Zarząd zablokował zakupy, dopóki dług klubu nie spadnie poniżej 500 tys. zł.');return;}const lk=negLocked(p);
  if(lk)return tradeMsg(false,`Rozmowy zerwane — ${p.tm===SAVE.team||p.tm<0?'agent':'klub'} nie chce rozmawiać do ${fmtDMY(lk)}.`);
  if(kind!=='renew'){if(!windowOpen())return tradeMsg(false,'Okno transferowe jest zamknięte (otwarte przed sezonem i w trakcie sparingów).');
    if(myTeam().players.length>=SQUAD_MAX)return tradeMsg(false,`Kadra jest pełna (maks. ${SQUAD_MAX}). Najpierw kogoś sprzedaj albo zwolnij.`);
    if(p.tm>=0&&!canSellAI(p))return tradeMsg(false,`${TEAMS[p.tm].name} nie sprzeda zawodnika — nie ma go kim zastąpić.`);
    if(p.tm>=0&&lgRef(lgOf(p.tm))-lgRef(myLg())>=14&&isStarter(p))return tradeMsg(false,`${p.first} ${p.last} gra w podstawie w ${LG_LOC[lgOf(p.tm)]} i nie zamierza schodzić do ${LG_N[myLg()].replace('Liga','Ligi')}.`);}
  const ag=agentOf(p);const n={pid,kind,stage:p.tm>=0&&kind!=='renew'?'club':'agent',log:[],fee:0,ok:null};ui.neg=n;
  if(n.stage==='club'){const ask=Math.round(askingPrice(p)*(1.05-cA('neg')/200)/10000)*10000;const need=isStarter(p)?0.9:0.8;
    n.club={ask,min:Math.min(ask,Math.round(ask*(need+R()*0.06)/10000)*10000),pat:3+(isStarter(p)?0:1)+negBonusPat(),pat0:0};n.club.pat0=n.club.pat;
    negLog('club',`${TEAMS[p.tm].name}: „Za ${p.last} chcemy ${fmt(ask)}. Zawodnik ma u nas ważny kontrakt do ${ceDate(p.ce)}.”`);}
  negAgentInit(n,p,ag);if(n.stage==='agent')negLog('ag',negAgentOpenLine(n,p,ag));
  ui.neg=n;ui.card=null;ui.tmsg=null;render();}
function negAgentInit(n,p,ag){const ST=ag.S;const need=wageNeeded(p);const w=round5k(need*ST[3]);
  const bonusBase=n.kind==='renew'?need*0.25:p.tm>=0?Math.max(need*0.2,0):need*0.5;const b=round5k(bonusBase*(ag.st===1?1.6:1));
  n.ag={wAsk:w,wMin:round5k(need*ST[5]),bAsk:b,bMin:round5k(b*0.5),yPref:prefYears(p),pat:ST[2]+negBonusPat(),pat0:ST[2]+negBonusPat(),mood:60};}
function negAgentOpenLine(n,p,ag){const a=n.ag;return `Agent ${ag.first} ${ag.last}: „Mój klient oczekuje ${fmt(a.wAsk)} rocznie, kontraktu na ${a.yPref} ${a.yPref===1?'sezon':'sezony'} i ${fmt(a.bAsk)} premii za podpis.”`;}
// ---- runda z klubem ----
function negClubOffer(fee){const n=NG();const p=PLAYERS[n.pid].p;const c=n.club;fee=Math.round((+fee||0)/10000)*10000;if(fee<=0)return;
  if(SAVE.fin.bal-fee<-500000){negLog('sys',`Za mało pieniędzy na ${fmt(fee)} (dopuszczalny debet 500 tys. zł).`);return render();}
  negLog('me',`Oferujemy ${fmt(fee)}.`);const club=TEAMS[p.tm].name;
  if(fee>=c.ask||fee>=c.min&&R()<0.35+0.1*(c.pat0-c.pat)){n.fee=fee;n.stage='agent';const ag=agentOf(p);
    negLog('club',`${club}: „Zgoda, ${fmt(fee)}. Możecie rozmawiać z agentem zawodnika.”`);negLog('ag',negAgentOpenLine(n,p,ag));return render();}
  const insult=fee<c.ask*0.6;c.pat-=insult?2:1;
  if(c.pat<=0){n.ok=false;p.negLock=addDays(today(),14);negLog('club',`${club}: „Nie widzimy sensu dalszych rozmów.” Klub zerwał negocjacje na 14 dni.`);return render();}
  const na=Math.max(c.min,Math.round((c.ask-(c.ask-fee)*(insult?0.05:0.3))/10000)*10000);c.ask=na;
  negLog('club',`${club}: „${insult?'To nie jest poważna oferta. ':''}Możemy zejść do ${fmt(na)}.${c.pat===1?' To nasza ostatnia propozycja.':''}”`);render();}
// ---- runda z agentem ----
function negAgentOffer(w,y,b,r){const n=NG();const p=PLAYERS[n.pid].p;const a=n.ag;const ag=agentOf(p);const ST=ag.S;w=round5k(+w||0);b=Math.max(0,round5k(+b||0));y=+y||2;const rEx=n.kind==='renew'?roleOf(p):roleExpect(p);r=r||rEx;const rd=roleLv(rEx)-roleLv(r);n.role=r;
  if(rd>=2){a.pat-=1;a.mood=Math.max(0,a.mood-15);negLog('me',`Proponujemy rolę: ${roleN(r)}.`);if(a.pat<=0){n.ok=false;p.negLock=addDays(today(),14);negLog('ag',`${ag.first} ${ag.last}: „Mój klient nie przyjdzie, żeby siedzieć na ławce. Kończymy rozmowy.”`);return render();}negLog('ag',`${ag.first} ${ag.last}: „${p.first} oczekuje roli: ${roleN(rEx).toLowerCase()}. Na rolę „${roleN(r).toLowerCase()}” się nie zgodzi.”`);return render();}
  if(n.kind!=='renew'&&SAVE.fin.bal-n.fee-b<-500000){negLog('sys','Za mało pieniędzy na kwotę odstępnego i premię.');return render();}
  negLog('me',`Proponujemy ${fmt(w)}/rok na ${y} ${y===1?'sezon':'sezony'}, ${fmt(b)} premii i rolę: ${roleN(r).toLowerCase()}.`);
  const yAdj=(y===a.yPref?0.97:1.04)*(rd>0?1+0.08*rd:rd<0?0.96:1);const wNeed=round5k(a.wMin*yAdj),wAskY=round5k(a.wAsk*yAdj);
  // pensja i premia mogą się wzajemnie równoważyć (premia rozłożona na lata kontraktu)
  const val=w+b/Math.max(1,y)*0.8,needV=wNeed+a.bMin/Math.max(1,y)*0.8,askV=wAskY+a.bAsk/Math.max(1,y)*0.8;
  if(val>=askV||val>=needV&&R()<0.3+0.15*(a.pat0-a.pat)){n.terms={w,y,b,r};n.ok=true;a.mood=Math.min(100,a.mood+15);
    negLog('ag',`${ag.first} ${ag.last}: „Mamy porozumienie. ${p.first} jest gotowy podpisać kontrakt.”`);return render();}
  const low=val<needV*0.8;a.pat-=low?2:1;a.mood=Math.max(0,a.mood-(low?25:12));
  if(a.pat<=0){n.ok=false;p.negLock=addDays(today(),14);negLog('ag',`${ag.first} ${ag.last}: „Marnujemy czas. Kończymy rozmowy.” Agent zerwał negocjacje na 14 dni.`);return render();}
  a.wAsk=Math.max(a.wMin,round5k(a.wAsk-(a.wAsk-w)*ST[4]*(low?0.3:1)));a.bAsk=Math.max(a.bMin,round5k(a.bAsk-(a.bAsk-b)*ST[4]*(low?0.3:1)));
  negLog('ag',`${ag.first} ${ag.last}: „${low?'To za mało, nawet nie ma o czym mówić. ':''}Możemy przyjąć ${fmt(a.wAsk)} rocznie i ${fmt(a.bAsk)} premii${y!==a.yPref?`, najlepiej na ${a.yPref} ${a.yPref===1?'sezon':'sezony'}`:''}.${a.pat===1?' Ostatnia szansa.':''}”`);render();}
function negSign(){const n=NG();if(!n||!n.ok||!n.terms)return;const p=PLAYERS[n.pid].p;const t=n.terms;const from=p.tm;
  if(n.kind==='renew'){if(t.r)roleSet(p,t.r);if(typeof budWageOver==='function')budWageOver(t.w-p.wage);p.wage=t.w;p.ce=contractEndFor(t.y);achEv('renew');if(t.b){money(-t.b,'Transfery');finLog(`Premia za przedłużenie: ${p.first} ${p.last}`,-t.b);}
    news(`✍️ ${p.first} ${p.last} przedłużył kontrakt do ${ceDate(p.ce)} (${fmt(t.w)}/rok).`);ui.neg=null;save();return tradeMsg(true,`${p.last} przedłużył kontrakt do ${ceDate(p.ce)}.`);}
  if(!windowOpen())return tradeMsg(false,'Okno transferowe się zamknęło.');
  if(typeof budCan==='function'){const e=budCan('tr',(from>=0?n.fee:0)+(t.b||0));if(e)return tradeMsg(false,e);budWageOver(t.w);}
  achEv('sign');try{if(typeof socTransfer==='function')socTransfer(p);}catch(e){}if(from>=0){achEv('buy');achMax('buyFee',n.fee);if(p.age<=21)achEv('buyYoung');if(lgOf(from)<myLg())achMax('buyUp',1);}else achEv('free');
  if(from>=0){money(-n.fee,'Transfery');SAVE.ai[from].bud+=n.fee;finLog(`Zakup: ${p.first} ${p.last} (${TEAMS[from].short})`,-n.fee);}
  if(t.b){money(-t.b,'Transfery');finLog(`Premia za podpis: ${p.first} ${p.last}`,-t.b);}
  movePlayer(p,SAVE.team);if(t.r)roleSet(p,t.r);p.wage=t.w;p.ce=contractEndFor(t.y);delete p.tl;
  news(`✍️ ${p.first} ${p.last} dołącza do zespołu${from>=0?` z ${TEAMS[from].name} za ${fmt(n.fee)}`:' jako wolny zawodnik'}.`);ui.neg=null;save();tradeMsg(true,`${p.first} ${p.last} podpisał kontrakt do ${ceDate(p.ce)}!`);}
function patDots(cur,max){return `<span class="ngpat">${Array.from({length:max},(_,i)=>`<i class="${i<cur?'on':''}"></i>`).join('')}</span>`;}
function negModal(){const n=NG();const P=PLAYERS[n.pid];if(!P){ui.neg=null;return '';}const p=P.p;const ag=agentOf(p);
  const close=`ui.neg=null;render()`;const club=n.club,a=n.ag;
  const log=`<div class="nglog">${n.log.map(l=>`<div class="ngm ${l.who}">${l.who==='me'?'<b>Ty:</b> ':''}${esc(l.t)}</div>`).join('')}</div>`;
  let form='';
  if(n.ok===false)form=`<p class="bad">Negocjacje zerwane.</p><button class="btn" onclick="${close}">Zamknij</button>`;
  else if(n.ok&&n.terms)form=`<div class="ngdeal"><b>Porozumienie:</b> ${n.fee?`odstępne ${fmt(n.fee)} · `:''}pensja ${fmt(n.terms.w)}/rok · ${n.terms.y} ${n.terms.y===1?'sezon':'sezony'} · premia ${fmt(n.terms.b)}${n.terms.r?` · rola: <b>${roleN(n.terms.r)}</b>`:''}</div>
     ${typeof budImpact==='function'?budImpact(n.kind==='renew'?{tr:n.terms.b||0,wg:n.terms.w-p.wage}:{tr:(n.fee||0)+(n.terms.b||0),wg:n.terms.w}):''}
     <div class="row" style="gap:8px;margin-top:10px"><button class="btn" onclick="negSign()">✍️ Podpisz kontrakt</button><button class="ghost" onclick="${close}">Wycofaj się</button></div>`;
  else if(n.stage==='club')form=`<div class="ngform"><label>Kwota odstępnego <input id="ngfee" type="number" step="10000" value="${Math.round((club.ask*0.9)/10000)*10000}"></label><button class="btn" onclick="negClubOffer($('#ngfee').value)">Złóż ofertę</button></div>
     <p class="small mut">Klub żąda teraz <b>${fmt(club.ask)}</b>. Wartość zawodnika: ${fmt(pValue(p))}. Oferta poniżej 60% żądania zirytuje klub.</p>`;
  else form=`<div class="ngform"><label>Pensja / rok <input id="ngw" type="number" step="5000" value="${round5k(a.wAsk*0.92)}"></label><label>Lata <select id="ngy">${[1,2,3].map(y=>`<option ${y===a.yPref?'selected':''}>${y}</option>`).join('')}</select></label><label>Premia za podpis <input id="ngb" type="number" step="5000" value="${round5k(a.bAsk*0.7)}"></label>
     <label>Rola w zespole (czas gry) <select id="ngr">${ROLES.map(([k,l,e])=>`<option value="${k}" ${k===(n.role||(n.kind==='renew'?roleOf(p):roleExpect(p)))?'selected':''}>${l} — ${e>0?`ok. ${Math.round(e*100)}% meczów`:'bez wymagań'}</option>`).join('')}</select></label>
     <button class="btn" onclick="negAgentOffer($('#ngw').value,$('#ngy').value,$('#ngb').value,$('#ngr').value)">Złóż propozycję</button></div>${rolePrefBox(p)}
     <p class="small mut">Agent żąda teraz: <b>${fmt(a.wAsk)}</b>/rok, <b>${fmt(a.bAsk)}</b> premii, najchętniej na <b>${a.yPref}</b> ${a.yPref===1?'sezon':'sezony'} (inna długość = wyższe żądania). Wyższa premia pozwala zejść z pensji i odwrotnie.</p>`;
  const stg=[['club','Klub'],['agent','Agent'],['sign','Podpis']].filter(x=>x[0]!=='club'||n.club);const cur=n.ok&&n.terms?'sign':n.stage;
  return `<div class="modal" onclick="if(event.target===this){${close}}"><div class="mcard ngcard">
   <div class="row" style="gap:12px">${pFace(p,64)}<div><div class="small mut">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].name):'Wolny zawodnik'} · ${n.kind==='renew'?'przedłużenie kontraktu':'transfer'}</div><h2 style="margin:2px 0">${esc(p.first)} ${esc(p.last)}</h2><div class="small mut">${pTag(p.pos)} ${p.age} l. · wartość ${fmt(pValue(p))} · obecnie ${p.tm>=0?fmt(p.wage)+'/rok':'bez klubu'}</div></div><span class="sp"></span><button class="ghost" onclick="${close}">✕</button></div>
   <div class="ngstg">${stg.map(([k,l],i)=>`<span class="${k===cur?'on':stg.findIndex(x=>x[0]===cur)>i?'done':''}">${i+1}. ${l}</span>`).join('')}</div>
   <div class="ngside">${n.club?`<div class="ngbox"><span class="small mut">Klub</span><b>${tDot(p.tm)}${esc(TEAMS[p.tm]?TEAMS[p.tm].name:'')}</b><span class="small">Cierpliwość ${patDots(Math.max(0,club.pat),club.pat0)}</span></div>`:''}
    <div class="ngbox"><span class="small mut">Agent zawodnika</span><b>${esc(ag.first)} ${esc(ag.last)}</b><span class="small"><span class="acc">${ag.S[0]}</span> · ${esc(ag.S[1])}</span><span class="small">Cierpliwość ${patDots(Math.max(0,a.pat),a.pat0)}</span></div></div>
   ${log}${form}</div></div>`;}
// ---- lista transferowa (sprzedaż) ----
function tlSet(pid,price){const p=PLAYERS[pid].p;price=Math.round((+price||0)/10000)*10000;if(price<=0)return;p.tl={price,d:today()};news(`📋 ${p.first} ${p.last} wystawiony na listę transferową za ${fmt(price)}.`);save();render();}
function tlOff(pid){const p=PLAYERS[pid].p;delete p.tl;SAVE.inbox=(SAVE.inbox||[]).filter(o=>!(o.pid===pid&&o.tl));save();render();}
function tlDay(d){if(SAVE.team==null||!SAVE.world||!windowOpen())return;const mine=myTeam().players.filter(p=>p.tl);
  for(const p of mine){const val=pValue(p);const ratio=p.tl.price/Math.max(10000,val);const ch=clamp(0.22-0.18*(ratio-0.9),0.02,0.35);if(R()>ch)continue;
    const bs=findBuyers(p.id).filter(b=>!(SAVE.inbox||[]).some(o=>o.pid===p.id&&o.tm===b.tm));if(!bs.length)continue;const b=bs[Math.floor(R()*bs.length)];
    const max=Math.min(SAVE.ai[b.tm].bud,Math.round(Math.min(p.tl.price*1.02,val*(1+R()*0.25))/10000)*10000);if(max<val*0.5)continue;
    const fee=Math.round(Math.min(max,max*(0.82+R()*0.15))/10000)*10000;const o={pid:p.id,tm:b.tm,fee,max,pat:2,tl:1,d};SAVE.inbox=SAVE.inbox||[];SAVE.inbox.push(o);
    sendMail({cat:'trans',from:TEAMS[b.tm].name,t:`Oferta za ${p.first} ${p.last}: ${fmt(fee)}`,s:`Odpowiedź na listę transferową (Twoja cena: ${fmt(p.tl.price)}).`,b:{type:'offer',pid:p.id,tm:b.tm,fee},act:1,lab:'Oferta kupna'});}}
function offerOf(pid,tm){return (SAVE.inbox||[]).find(x=>x.pid===pid&&x.tm===tm);}
function offerCounter(pid,tm,v){const o=offerOf(pid,tm);if(!o)return;const p=PLAYERS[pid].p;v=Math.round((+v||0)/10000)*10000;if(o.max==null)o.max=Math.round(o.fee*(1.05+R()*0.12)/10000)*10000;if(o.pat==null)o.pat=2;
  if(v<=o.fee){return acceptBuy(pid,tm,o.fee);}
  if(v<=o.max){o.fee=v;o.agreed=1;news(`🤝 ${TEAMS[tm].name} przyjmuje Twoje warunki za ${p.last}: ${fmt(v)}.`);save();return tradeMsg(true,`${TEAMS[tm].name} zgadza się zapłacić ${fmt(v)}. Zaakceptuj, by sfinalizować.`);}
  o.pat--;if(o.pat<=0){SAVE.inbox.splice(SAVE.inbox.indexOf(o),1);news(`❌ ${TEAMS[tm].name} wycofuje się z rozmów o ${p.last}.`);save();return tradeMsg(false,`${TEAMS[tm].name} wycofał ofertę — Twoje żądania były za wysokie.`);}
  o.fee=Math.round((o.fee+(o.max-o.fee)*0.6)/10000)*10000;if(o.pat===1)o.fin=1;save();tradeMsg(false,`${TEAMS[tm].name} podnosi ofertę do ${fmt(o.fee)}${o.fin?' — to ostateczna propozycja':''}.`);}
function offerRow(x,o){const p=PLAYERS[x.pid].p;return `<div class="row wrap offer">${tDot(x.tm)}<b>${tName(x.tm)}</b> chce kupić <button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> (${rating(p)}) za <b>${fmt(x.fee)}</b>${x.agreed?' <span class="good small">uzgodnione</span>':x.fin?' <span class="small acc">ostateczna</span>':''}${p.tl?` <small class="mut">· Twoja cena ${fmt(p.tl.price)}</small>`:''}<span class="sp"></span>
  ${o?`<button class="btn sm" onclick="acceptBuy('${p.id}',${x.tm},${x.fee})">Akceptuj</button>${x.agreed||x.fin?'':`<input class="ngcnt" id="cnt_${p.id}_${x.tm}" type="number" step="10000" value="${Math.round(x.fee*1.15/10000)*10000}"><button class="ghost sm" onclick="offerCounter('${p.id}',${x.tm},$('#cnt_${p.id}_${x.tm}').value)">Żądaj więcej</button>`}`:'<small class="mut">okno zamknięte</small>'}<button class="ghost sm" onclick="rejectInbox(SAVE.inbox.indexOf(offerOf('${p.id}',${x.tm})))">Odrzuć</button></div>`;}
function offerMailHtml(m){const b=m.b;const o=offerOf(b.pid,b.tm);const P=PLAYERS[b.pid];if(!P)return '<p class="mut">Zawodnik nie jest już dostępny.</p>';const p=P.p;
  return `<p class="mtext">${esc(TEAMS[b.tm].name)} chce kupić <b>${esc(p.first)} ${esc(p.last)}</b> (${POS_NAMES[p.pos]}, ${p.age} l., ocena ${rating(p)}) i oferuje <b>${fmt(o?o.fee:b.fee)}</b>.${p.tl?` Twoja cena na liście transferowej: ${fmt(p.tl.price)}.`:''}</p>
   ${o&&p.tm===SAVE.team?`<div class="mxbox">${offerRow(o,windowOpen())}<p class="small mut">„Żądaj więcej” to kontroferta — klub może się zgodzić, podnieść ofertę albo wycofać się z rozmów.</p></div><div class="mact"><button class="ghost" onclick="openCard('${p.id}')">Karta zawodnika</button></div>`:'<p class="mut small">Oferta jest już nieaktualna.</p>'}`;}
function myContractAct(p){const need=wageNeeded(p);const ag=agentOf(p);const lk=negLocked(p);const o=windowOpen();
  return `<div class="act"><h4>Kontrakt</h4><p class="small">Do <b>${ceDate(p.ce)}</b> · pensja ${fmt(p.wage)}/rok. Zawodnik chce ok. <b>${fmt(need)}</b>/rok. Agent: <b>${esc(ag.first)} ${esc(ag.last)}</b> <span class="small acc">(${ag.S[0]})</span>.</p>
    ${lk?`<p class="small bad">Agent nie chce rozmawiać do ${fmtDMY(lk)}.</p>`:`<button class="ghost" onclick="negOpen('${p.id}','renew')">💼 Negocjuj nowy kontrakt</button>`}</div>
   <div class="act"><h4>Lista transferowa</h4>${p.tl?`<p class="small">Wystawiony za <b>${fmt(p.tl.price)}</b> od ${fmtShort(p.tl.d)}. ${o?'Kluby mogą składać oferty — trafią do poczty i do zakładki „Oferty za moich”.':'Oferty przyjdą, gdy otworzy się okno transferowe.'}</p>
      <div class="row wrap"><input id="tlp" type="number" step="10000" value="${p.tl.price}"><button class="ghost" onclick="tlSet('${p.id}',$('#tlp').value)">Zmień cenę</button><button class="link" onclick="tlOff('${p.id}')">Zdejmij z listy</button></div>`
     :`<p class="small mut">Wartość: ${fmt(pValue(p))}. Im wyższa cena, tym mniej ofert.</p><div class="row wrap"><label class="small">Cena <input id="tlp" type="number" step="10000" value="${Math.round(pValue(p)*1.1/10000)*10000}"></label><button class="ghost" onclick="tlSet('${p.id}',$('#tlp').value)">📋 Wystaw na listę transferową</button></div>`}
    ${(SAVE.inbox||[]).filter(x=>x.pid===p.id).map(x=>offerRow(x,o)).join('')}
    <div style="margin-top:8px"><button class="link" onclick="releasePlayer('${p.id}')">${ui.confirm==='rel'+p.id?`Na pewno? Odprawa ${fmt(releaseCost(p))}`:'Rozwiąż kontrakt'}</button>${p.age<=19?` · <button class="link" onclick="demote('${p.id}')">Przesuń do juniorów</button>`:''}</div></div>`;}
function buyAct(p){const o=windowOpen();const ag=agentOf(p);const lk=negLocked(p);
  return `<div class="act"><h4>${p.tm>=0?'Transfer':'Wolny zawodnik'}</h4>${o?`<p class="small">${p.tm>=0?`Wartość: <b>${fmt(pValue(p))}</b>. ${isStarter(p)?'Podstawowy zawodnik — klub zażąda więcej i będzie mniej cierpliwy. ':''}Najpierw negocjujesz kwotę z klubem, potem kontrakt z agentem.`:'Bez kwoty odstępnego — negocjujesz od razu z agentem.'}</p>
    <p class="small">Agent: <b>${esc(ag.first)} ${esc(ag.last)}</b> · <span class="acc">${ag.S[0]}</span> — ${esc(ag.S[1])}</p>
    ${lk?`<p class="small bad">Rozmowy zerwane — wznowienie możliwe od ${fmtDMY(lk)}.</p>`:`<button class="btn" onclick="negOpen('${p.id}','${p.tm>=0?'buy':'free'}')">💼 Rozpocznij negocjacje</button>`}
    <p class="mut small">Saldo klubu: ${fmt(SAVE.fin.bal)} · kadra: ${myTeam().players.length}/${SQUAD_MAX}</p>`:'<p class="mut small">Okno transferowe jest zamknięte. Otwiera się przed sezonem i trwa do końca sparingów.</p>'}</div>`;}

// ================= ROLA W ZESPOLE (ustalony czas gry) — wspólna z „Rozmowami” (ROLES, p.role) =================
// Przy kontrakcie ustalasz rolę z listy ROLES (kluczowy, podstawowy, rotacyjny, rezerwowy, perspektywiczny).
// Ta sama rola widnieje w karcie zawodnika i w rozmowach; zadowolenie z czasu gry liczy się względem niej.
function roleLv(k){return 5-ROLE_I[k];}// klu 5, pod 4, rot 3, per 2, rez 1
function roleN(k){const r=ROLES[ROLE_I[k]];return r?r[1]:'—';}
function rolePct(k){const r=ROLES[ROLE_I[k]];return r?Math.round(r[2]*100):0;}
function roleRank(p){const t=myTeam();const mates=t.players.filter(x=>x.id!==p.id&&!x.jr);const r=rating(p);const samePos=mates.filter(x=>x.pos===p.pos).sort((a,b)=>rating(b)-rating(a));
  const posRank=samePos.filter(x=>rating(x)>r).length+1;const all=mates.map(x=>rating(x)).sort((a,b)=>b-a);const allRank=all.filter(x=>x>r).length+1;const slots={R:1,A:1,P:2,S:2,L:1}[p.pos]||1;return {posRank,allRank,slots,samePos};}
// jakiej roli oczekuje zawodnik, przychodząc do Twojego klubu
function roleExpect(p){const R0=roleRank(p);let k;if(R0.posRank<=R0.slots&&R0.allRank<=3)k='klu';else if(R0.posRank<=R0.slots)k='pod';else if(R0.posRank<=R0.slots+1)k='rot';else k='rez';
  let i=ROLE_I[k];if(hasT(p,'amb')&&i>0&&i<3)i--;if(p.age>=33&&i<2)i++;k=ROLES[i][0];if(k==='rez'&&p.age<=21)k='per';return k;}
function rolePrefBox(p){const R0=roleRank(p);const ex=roleExpect(p);const rivals=R0.samePos.slice(0,3);
  return `<div class="ngpref"><div><span class="small mut">Preferencje zawodnika</span><b>Oczekuje roli: ${roleN(ex)} (${roleExpTxt(ex)})</b><span class="small">${hasT(p,'amb')?'Ambitny — chce grać ważną rolę. ':''}${p.age>=33?'Doświadczony — zaakceptuje mniejszą rolę. ':''}${ex==='per'?'Młody — liczy na rozwój i okazjonalną grę. ':''}Rola niższa o 1 stopień = wyższe żądania płacowe; o 2 stopnie — odmowa. Ustalona rola to obietnica czasu gry: jeśli zawodnik będzie grał mniej, spadnie mu zadowolenie.</span></div>
   <div><span class="small mut">Konkurencja na pozycji ${POS_SHORT[p.pos]} w Twojej kadrze</span>${rivals.map(x=>`<span class="small">${esc(x.last)} · <b>${rating(x)}</b> · ${roleN(roleOf(x)).toLowerCase()}</span>`).join('')||'<span class="small">brak — byłby jedynym zawodnikiem na tej pozycji</span>'}<span class="small">Byłby <b>${R0.posRank}.</b> na swojej pozycji (miejsc w szóstce: ${R0.slots}) i <b>${R0.allRank}.</b> w całej kadrze.</span></div></div>`;}
function roleSet(p,k){p.role=k;p.pl8=[];}
// naprawa starych zapisów (v167–v169 zapisywały rolę jako obiekt)
function roleFix(){if(!SAVE.world)return;const map={star:'klu',key:'klu',first:'pod',rot:'rot',back:'rez',young:'per'};for(const p of W().players)if(p.role&&typeof p.role==='object'){p.role=map[p.role.k]||null;if(!p.role)delete p.role;}}
