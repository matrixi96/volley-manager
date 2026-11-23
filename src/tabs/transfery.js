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
function negAgentOffer(w,y,b,r){const n=NG();const p=PLAYERS[n.pid].p;const a=n.ag;const ag=agentOf(p);const ST=ag.S;w=round5k(+w||0);b=Math.max(0,round5k(+b||0));y=+y||2;const rEx=n.kind==='renew'?roleOf(p):roleExpect(p);r=r&&ROLE_I[r]!=null?r:rEx;const rd=roleLv(rEx)-roleLv(r);n.role=r;
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
  if(n.kind==='renew'){if(t.r)roleSet(p,t.r);if(typeof budWageOver==='function')budWageOver(t.w-p.wage);p.wage=t.w;p.ce=contractEndFor(t.y);achEv('renew');p.extN=S().n;delete p.tReq;if(t.b){money(-t.b,'Transfery');finLog(`Premia za przedłużenie: ${p.first} ${p.last}`,-t.b);}
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
function roleLv(k){return 4-ROLE_I[k];}// klu 4, pod 3, per 2, rez 1
function roleN(k){const r=ROLES[ROLE_I[k]];return r?r[1]:'—';}
function rolePct(k){const r=ROLES[ROLE_I[k]];return r?Math.round(r[2]*100):0;}
function roleRank(p){const t=myTeam();const mates=t.players.filter(x=>x.id!==p.id&&!x.jr);const r=rating(p);const samePos=mates.filter(x=>x.pos===p.pos).sort((a,b)=>rating(b)-rating(a));
  const posRank=samePos.filter(x=>rating(x)>r).length+1;const all=mates.map(x=>rating(x)).sort((a,b)=>b-a);const allRank=all.filter(x=>x>r).length+1;const slots={R:1,A:1,P:2,S:2,L:1}[p.pos]||1;return {posRank,allRank,slots,samePos};}
// jakiej roli oczekuje zawodnik, przychodząc do Twojego klubu
function roleExpect(p){const R0=roleRank(p);let k;if(R0.posRank<=R0.slots&&R0.allRank<=3)k='klu';else if(R0.posRank<=R0.slots)k='pod';else if(R0.posRank<=R0.slots+1&&p.age<=24)k='per';else k='rez';
  if(hasT(p,'amb')&&k==='pod')k='klu';if(p.age>=33&&k==='klu')k='pod';if(k==='rez'&&p.age<=21)k='per';return k;}
function rolePrefBox(p){const R0=roleRank(p);const ex=roleExpect(p);const rivals=R0.samePos.slice(0,3);
  return `<div class="ngpref"><div><span class="small mut">Preferencje zawodnika</span><b>Oczekuje roli: ${roleN(ex)} (${roleExpTxt(ex)})</b><span class="small">${hasT(p,'amb')?'Ambitny — chce grać ważną rolę. ':''}${p.age>=33?'Doświadczony — zaakceptuje mniejszą rolę. ':''}${ex==='per'?'Młody — liczy na rozwój i okazjonalną grę. ':''}Rola niższa o 1 stopień = wyższe żądania płacowe; o 2 stopnie — odmowa. Ustalona rola to obietnica czasu gry: jeśli zawodnik będzie grał mniej, spadnie mu zadowolenie.</span></div>
   <div><span class="small mut">Konkurencja na pozycji ${POS_SHORT[p.pos]} w Twojej kadrze</span>${rivals.map(x=>`<span class="small">${esc(x.last)} · <b>${rating(x)}</b> · ${roleN(roleOf(x)).toLowerCase()}</span>`).join('')||'<span class="small">brak — byłby jedynym zawodnikiem na tej pozycji</span>'}<span class="small">Byłby <b>${R0.posRank}.</b> na swojej pozycji (miejsc w szóstce: ${R0.slots}) i <b>${R0.allRank}.</b> w całej kadrze.</span></div></div>`;}
function roleSet(p,k){p.role=k;p.pl8=[];}
// naprawa starych zapisów (v167–v169 zapisywały rolę jako obiekt)
function roleFix(){if(!SAVE.world)return;const map={star:'klu',key:'klu',first:'pod',rot:'rez',back:'rez',young:'per'};for(const p of W().players)if(p.role&&typeof p.role==='object'){p.role=map[p.role.k]||null;if(!p.role)delete p.role;}}

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
  // styl trenera rywala i rozegranie wg ustawienia (skaut ogląda kilka meczów rywala)
  const sty=aiStyle(t,lu);const known=k=>acc>=({start:6,serve:5,dist:7,srvZ:10,mCom:12}[k]||8)||rnd()<0.3;
  const dd={f:{A:0,P:0,S:0,n:0},b:{A:0,P:0,S:0,n:0}};
  {const mid=lgTeams(lgOf(op)).filter(x=>x.idx!==op).sort((x,y)=>teamStrength(x)-teamStrength(y));const oT=mid[Math.floor(mid.length/2)];
   for(let k=0;k<3;k++){const mm=newMatch({team:t,lineup:lu,tactics:sty},{team:oT,lineup:autoLineup(oT),tactics:{serve:1,dist:0}});while(!mm.over)stepRally(mm);
     for(const d of mm.dirStats||[]){if(d.i!==0||d.d==='free'||!d.rz)continue;const g=isFront(d.rz-1)?dd.f:dd.b;const pp=P(d.id);const ps=pp?pp.pos:'P';if(g[ps]!=null){g[ps]++;g.n++;}}}}
  const dsh=g=>g.n?['A','P','S'].map(k=>Math.round(clamp(g[k]/g.n+(rnd()-0.5)*nz2*0.12,0,1)*100)):null;
  const styB={start:known('start')?sty.startRot+1:0,sm:sty.sm,serve:known('serve')?sty.serve:-1,srvZ:known('srvZ')?sty.srvZ:-1,dist:known('dist')?sty.dist:-1,mCom:known('mCom')?sty.mCom:-1,dF:dsh(dd.f),dB:dsh(dd.b)};
  const midSh=styB.dF&&styB.dB?(styB.dF[2]+styB.dB[2])/2:0;
  const rec={mCom:midSh>=26||sty.dist===2&&styB.dist===2?1:0,blkL:aA?(aA[3]>=60?0:aA[3]<=42?2:1):1,blkR:pC>=60?0:pC<=42?2:1,tgt:weak?weak.id:null,adir:blkAvg+(rnd()-0.5)*nz2*4>=14.5?4:0,serve:weak&&weak.prz<12?2:1};
  const form=teamForm(op);const tb=leagueTable?(()=>{try{return leagueTable().findIndex(x=>x.i===op)+1;}catch(e){return 0;}})():0;
  const names=[allScouts().length?scoutName(oppScout()?oppScout().id:allScouts()[0].id)+' (skaut)':null,SAVE.staff&&SAVE.staff.sta?`${SAVE.staff.sta.first[0]}. ${SAVE.staff.sta.last} (analityk)`:null].filter(Boolean);
  sendMail({cat:'skaut',from:names.join(' i ')||'Sztab szkoleniowy',t:`Raport o rywalu: ${t.name} (${fmtShort(e.d)})`,s:`Najgroźniejszy: ${key?key[1]:'—'}. Słabe przyjęcie: ${weak?weak.last:'—'}. ${rec.adir===4?'Wysoki blok — gramy po bloku.':''}`,
    b:{type:'opp',op,md:e.d,acc:Math.round(acc),line,att,key:key?key[0]:null,weak:weak?[weak.id,weak.last,Math.round((weak.prz+(rnd()-0.5)*nz2*4))]:null,srv:srv?[srv.id,srv.last]:null,blk:Math.round(blkAvg*10)/10,form,pos:tb,str:teamStrength(t),rec,sty:styB},act:1,lab:'Następny rywal'});}
function applyOppRec(mid){const m=mailBox().find(x=>x.id===mid);if(!m)return;const r=m.b.rec;const t=myTac();if(r.mCom!=null)t.mCom=r.mCom;t.blkL=r.blkL;t.blkR=r.blkR;t.adir=r.adir;t.serve=r.serve;if(r.tgt)t.tgt=r.tgt;
  SC().prep={op:m.b.op,d:m.b.md,ap:1};m.act=0;m.applied=1;save();render();}
function oppPrepBonus(){const s=SAVE.sc;if(!s||!s.prep)return 0;const c=myNext();if(!c)return 0;const op=c.h===SAVE.team?c.a:c.h;if(s.prep.op!==op||s.prep.d!==today())return 0;return 0.006+(s.prep.ap?0.004:0);}
function mailReadHook(m){if(m&&m.b&&m.b.type==='opp'){const s=SC();if(!s.prep||s.prep.op!==m.b.op||s.prep.d!==m.b.md)s.prep={op:m.b.op,d:m.b.md,ap:0};}}
// ---- treść raportów w poczcie ----
const BLK_N=['skos','zrównoważony','prosta'],ADIR_N=['wg zawodnika','po skosie','po prostej','za blok','atak po bloku'],SERVE_N=['bezpieczna','normalna','ryzykowna'];
const SZ_N=['bez stałej strefy','strefa 1','strefa 6','strefa 5','skrót','między dwóch'],DIST_N=['zrównoważone','skrzydła','środek','na atakującego'];
function oppStyleHtml(y,T){const u='<span class="mut">nie wiadomo</span>';const row=(l,d)=>d?`<tr><td class="l">${l}</td><td>${d[0]}%</td><td>${d[1]}%</td><td>${d[2]}%</td></tr>`:'';
  return `<h3>Styl trenera rywala</h3><div class="mkpi"><div><span>Zaczyna seta</span><b>${y.start?'w ustawieniu R'+y.start:u}</b></div><div><span>Zagrywka</span><b>${y.serve>=0?SERVE_N[y.serve]:u}${y.srvZ>0?', '+SZ_N[y.srvZ]:''}</b></div><div><span>Rozegranie</span><b>${y.dist>=0?DIST_N[y.dist]:u}</b></div><div><span>Środkowy w bloku</span><b>${y.mCom>=0?(y.mCom?'w ciemno':'czyta grę'):u}</b></div></div>
   ${y.start&&y.sm!=null?`<p class="small mut">Ustawienie startowe: ${esc(AI_START[y.sm])}. Możesz ustawić swoją drużynę tak, by w pierwszych akcjach najlepsi zagrywający trafili na ich słabsze ustawienia.</p>`:''}
   ${y.dF||y.dB?`<div class="tw"><table><thead><tr><th class="l">Do kogo gra rozgrywający ${esc(T.short)}</th><th>Atakujący</th><th>Przyjmujący</th><th>Środkowi</th></tr></thead><tbody>${row('Rozgrywający w 1. linii (R4, R3, R2)',y.dF)}${row('Rozgrywający w 2. linii (R1, R6, R5)',y.dB)}</tbody></table></div>`:''}`;}
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
     ${b.sty?oppStyleHtml(b.sty,T):''}
     <h3>Zalecenia sztabu</h3><ul class="mrec"><li>Blok na lewej stronie (przeciw ich atakującemu): <b>${BLK_N[r.blkL]}</b>${keyA&&keyA[2]==='A'?` — ${esc(keyA[1])} atakuje skosem w ${keyA[3]}%`:''}</li><li>Blok na prawej stronie (przeciw przyjmującym): <b>${BLK_N[r.blkR]}</b></li>
      <li>Zagrywka: <b>${SERVE_N[r.serve]}</b>${b.weak?`, w zawodnika <b>${esc(b.weak[1])}</b>`:''}</li><li>Kierunek ataku: <b>${ADIR_N[r.adir]}</b>${r.adir===4?' — ich blok jest wysoki i silny':''}</li>${r.mCom!=null?`<li>Środkowy w bloku: <b>${r.mCom?'w ciemno na krótką':'czyta grę'}</b>${r.mCom?' — rywal gra dużo środkiem':''}</li>`:''}</ul>
     <p class="small mut">Przeczytany raport daje drużynie mały bonus przygotowania w meczu, a zastosowane zalecenia — trochę większy.</p>
     <div class="mact">${m.applied?'<span class="good">✓ Zalecenia zastosowane w taktyce</span>':`<button class="btn" onclick="applyOppRec('${m.id}')">Zastosuj zalecenia</button>`}<button class="ghost" onclick="go('taktyka')">Taktyka</button><button class="ghost" onclick="openTeam(${b.op})">Profil drużyny</button></div>`;}
  return '';}
// ---- widok: Skauting ----
function scoutView(){const s=SC();const sc=allScouts();const os=oppScout();const e=nextEvent();const c=myNext();const op=c?(c.h===SAVE.team?c.a:c.h):null;
  const cap=sc.reduce((a,x)=>a+scoutSlots(x),0);const used=s.tasks.filter(t=>t.start).length;
  const lg=W().players.filter(p=>p.tm>=0&&p.tm!==SAVE.team&&!p.jr);const avgK=lg.length?Math.round(lg.reduce((a,p)=>a+knowOf(p),0)/lg.length):0;
  const reps=mailBox().filter(m=>m.cat==='skaut').slice(0,8);
  const kpi=`<div class="kstrip"><div><span>Skauci</span><b>${sc.length}/${SCOUT_MAX}</b><small>pensje z budżetu płacowego</small></div><div><span>Zadania</span><b>${used}/${cap}</b><small>zajęte / wszystkie miejsca</small></div><div><span>Wiedza o lidze</span><b>${avgK}%</b><small>średnio o zawodnikach rywali</small></div><div><span>Analityk</span><b>${SAVE.staff&&SAVE.staff.sta?SAVE.staff.sta.skill+'/20':'brak'}</b><small>pomaga w raportach o rywalach</small></div></div>`;
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
  ${list.map(p=>`<tr><td><button class="star ${isShort(p.id)?'on':''}" onclick="toggleShort('${p.id}')" title="Obserwowani">${isShort(p.id)?'★':'☆'}</button></td><td class="l"><span class="fcell">${pFace(p,26)}<button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button> ${natTag(p)}</span>${p.inj?' 🚑':''}</td><td><b>${pTag(p.pos)}</b></td><td>${p.age}</td><td class="l">${p.tm>=0?tDot(p.tm)+esc(TEAMS[p.tm].short):'<span class="good">wolny</span>'}</td><td><b>${rTxt(p)}</b></td><td class="stars">${potStars(p)}</td><td>${knowBar(p)}</td><td>${p.tm>=0?fmt(pValue(p)):'—'}</td><td>${p.tm>=0?fmt(p.wage):'<small class="mut">chce '+fmt(wageNeeded(p))+'</small>'}</td><td>${p.tm>=0?ceDate(p.ce):'—'}</td>
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
  return `<div class="kstrip"><div><span>Dostępne na transfery</span><b class="acc">${fmt(Math.max(0,SAVE.fin.bal+500000))}</b><small>saldo ${fmt(SAVE.fin.bal)} + dopuszczalny debet 500 tys.</small></div><div><span>Pensje kadry</span><b>${fmt(payroll())}</b><small>rocznie, płatne co miesiąc</small></div><div><span>Kadra</span><b>${myTeam().players.length}/${SQUAD_MAX}</b><small>${free>0?free+' wolnych miejsc':'kadra pełna'}</small></div><div><span>Okno transferowe</span><b class="${o?'good':'bad'}">${o?'otwarte':'zamknięte'}</b><small>${s&&s.sdates?`od 1 czerwca do ${fmtDMY(s.winEnd||s.sdates[N_SPAR-1])}`:''}</small></div></div>
  ${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}${ui.scMsg?`<div class="card tmsg ok">${esc(ui.scMsg)}</div>`:''}
  <div class="ptabs">${[['market','Rynek',''],['short','Obserwowani',SC().short.length],['offers','Oferty za moich',inbox.length],['loans','Wypożyczenia',''],['hist','Historia transferów','']].map(([k,l,n])=>`<button class="tabb ${tab===k?'on':''}" onclick="ui.mt='${k}';ui.scMsg=null;render()">${l}${n?` <small class="mut">${n}</small>`:''}</button>`).join('')}</div>
  ${tab==='loans'?trLoansTab():tab==='hist'?trHistTab():tab==='offers'?`<div class="card"><h2>Oferty za moich zawodników</h2>${inbox.length?inbox.map(x=>offerRow(x,o)).join(''):'<p class="mut small">Brak ofert. Wystaw zawodnika na listę transferową w jego karcie, żeby kluby zaczęły składać oferty.</p>'}</div><div class="card"><h2>Lista transferowa</h2>${myTeam().players.filter(p=>p.tl).map(p=>`<div class="row wrap offer">${pFace(p,26)}<button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} ${esc(p.last)}</button> ${pTag(p.pos)} <span class="small mut">wartość ${fmt(pValue(p))}</span><span class="sp"></span><span>cena <b>${fmt(p.tl.price)}</b></span><button class="link" onclick="tlOff('${p.id}')">Zdejmij</button></div>`).join('')||'<p class="mut small">Nikt nie jest wystawiony. Otwórz kartę swojego zawodnika i ustaw cenę.</p>'}</div>`
  :`<div class="card">${tab==='market'?`<div class="filters2"><label class="flt"><span>Szukaj</span><input placeholder="Nazwisko…" value="${esc(f.q||'')}" onchange="ui.mf.q=this.value;ui.mf.pg=0;render()"></label>
    ${sel('pos','Pozycja',[['','Każda'],['R','Rozgrywający'],['A','Atakujący'],['P','Przyjmujący'],['S','Środkowy'],['L','Libero']])}${sel('src','Skąd',[['all','Kluby i wolni'],['club','Tylko z klubów'],['fa','Tylko wolni']])}
    ${sel('maxAge','Maks. wiek',[[40,'Każdy'],[21,'21'],[23,'23'],[27,'27'],[30,'30']])}${sel('maxVal','Maks. wartość',[[0,'Bez limitu'],[200000,'200 tys.'],[500000,'500 tys.'],[1000000,'1 mln'],[2000000,'2 mln']])}
    ${sel('sort','Sortuj',[['ocena','Ocena'],['pot','Potencjał'],['wiedza','Wiedza'],['wiek','Wiek'],['cena','Cena rosnąco']])}<button class="link" onclick="ui.mf={pos:'',src:'all',sort:'ocena',maxAge:40,maxVal:0,q:'',pg:0};render()">Wyczyść</button></div>`:''}
   ${marketTable(shown)}
   <div class="row small mut" style="margin-top:8px;flex-wrap:wrap;gap:12px"><span>Pokazano ${list.length?f.pg*per+1:0}–${f.pg*per+shown.length} z ${list.length}</span><span><b class="stars">★</b> pewne · <span class="pstp">★</span> możliwe · im większa wiedza (skauting), tym węższy zakres oceny i potencjału</span><span class="sp"></span>${pages>1?`<span>Strona ${f.pg+1} z ${pages}</span><button class="link" ${f.pg?'':'disabled'} onclick="ui.mf.pg--;render()">← Poprzednia</button><button class="link" ${f.pg<pages-1?'':'disabled'} onclick="ui.mf.pg++;render()">Następna →</button>`:''}</div></div>`}`;}

// ---- baza zawodników w skautingu: filtry jak w menedżerach + przypisanie skauta ----
function SF(){return ui.sf||(ui.sf={q:'',pos:'',src:'all',lg:'',nat:'',tm:'',minR:0,minP:0,maxAge:40,maxVal:0,maxW:0,ce:0,kn:'',notObs:0,sort:'ocena',pg:0});}
function sfSet(k,v){const f=SF();f[k]=v;f.pg=0;render();}
function scoutDb(){const f=SF();const all=allScouts();const s=SC();
  let xs=W().players.filter(p=>p.tm!==SAVE.team);
  if(f.src==='club')xs=xs.filter(p=>p.tm>=0&&!p.jr);else if(f.src==='fa')xs=xs.filter(p=>p.tm<0);else if(f.src==='jr')xs=xs.filter(p=>p.jr);else xs=xs.filter(p=>!p.jr);
  if(f.q)xs=xs.filter(p=>(p.first+' '+p.last).toLowerCase().includes(f.q.toLowerCase()));if(f.pos)xs=xs.filter(p=>p.pos===f.pos);if(f.tm!=='')xs=xs.filter(p=>p.tm===+f.tm);if(f.lg!=='')xs=xs.filter(p=>p.tm>=0&&lgOf(p.tm)===+f.lg);if(f.nat)xs=xs.filter(p=>pNat(p)===f.nat);
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
    ${sel('lg','Liga',[['','Każda']].concat(LG_N.map((n,i)=>[i,natFl(LG_C[i])+' '+n])))}
    ${sel('nat','Narodowość',[['','Każda']].concat(Object.keys(NAT).map(c=>[c,natFl(c)+' '+natN(c)])))}
    ${sel('tm','Drużyna',[['','Każda']].concat(allLgs().filter(l=>f.lg===''||+f.lg===l).flatMap(l=>lgTeams(l).filter(t=>t.idx!==SAVE.team).map(t=>[t.idx,LG_SHORT[l]+' · '+t.name]))))}
    ${sel('minR','Min. ocena',[[0,'Każda'],[55,'55+'],[60,'60+'],[65,'65+'],[70,'70+'],[75,'75+'],[80,'80+'],[85,'85+']],1)}
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

// ================= AGENCI: KONTAKT Z ICH INICJATYWY =================
// SAVE.ag = {q:[sprawy], last:data ostatniego kontaktu, log:[]}
function AG(){return SAVE.ag||(SAVE.ag={q:[],last:null,log:[]});}
function agName(p){const a=agentOf(p);return `${a.first} ${a.last}`;}
function agStyle(p){return agentOf(p).S;}
// ustępliwość agenta (0–1): elastyczny > rozsądny > chciwy > twardy
function agSoft(p){return agStyle(p)[4];}
const AGQ={
 pod:{t:p=>`Agent ${agName(p)}: podwyżka dla ${p.last}`,
   x:(p,q)=>`„Mój klient ${p.first} ${p.last} zarabia ${fmtShort2(p.wage)} rocznie, a rynek wycenia go na ok. ${fmtShort2(q.fair)}. ${q.club!=null&&TEAMS[q.club]?TEAMS[q.club].name+' pyta o niego. ':''}Oczekujemy podwyżki — inaczej zaczniemy słuchać ofert.”`,
   o:[['tak','Siadamy do rozmów o nowym kontrakcie.',(p,q)=>0.95,(p,q,ok)=>{p.raiseReq=0;ixPromise(p,'podwyzka',21,{w:p.wage});addMor(p,3);ui.agOpen=p.id;return 'Agent zadowolony. Otwórz negocjacje (karta zawodnika → kontrakt) — masz 3 tygodnie.';}],
     ['pozn','Wrócimy do tego przy przedłużeniu umowy.',(p,q)=>clamp(0.25+agSoft(p)*0.8+(hasT(p,'loj')?0.2:0),0.1,0.9),(p,q,ok)=>{if(ok){return 'Agent zgodził się poczekać.';}addMor(p,-6);p.raiseReq=Math.min(0.15,(p.raiseReq||0)+0.05);p.wantOut=S().n;return 'Agent jest niezadowolony: przy następnych rozmowach zażąda więcej, a zawodnik myśli o odejściu.';}],
     ['nie','Nie ma mowy o podwyżce.',(p,q)=>clamp(0.15+agSoft(p)*0.4+(hasT(p,'loj')?0.25:0),0.05,0.7),(p,q,ok)=>{if(ok){addMor(p,-2);return 'Agent przyjął odmowę, ale zapamięta.';}addMor(p,-9);relAdd(p,-6);p.raiseReq=Math.min(0.2,(p.raiseReq||0)+0.08);p.wantOut=S().n;if(typeof negLocked==='function')p.negLock=addDays(today(),21);return 'Agent zerwał rozmowy na 3 tygodnie. Zawodnik chce odejść.';}]]},
 kon:{t:p=>`Agent ${agName(p)}: przyszłość ${p.last}`,
   x:(p,q)=>`„Kontrakt ${p.first} ${p.last} kończy się po sezonie. Mamy już zapytania z innych klubów. Potrzebuję jasnej odpowiedzi, czy klub chce go zatrzymać.”`,
   o:[['oferta','Złożymy ofertę w ciągu 3 tygodni.',(p,q)=>0.9,(p,q,ok)=>{ixPromise(p,'kontrakt',21,{ce:p.ce});addMor(p,3);return 'Agent czeka na ofertę. Złóż ją w karcie zawodnika (kontrakt) — inaczej to złamana obietnica.';}],
     ['czas','Potrzebujemy więcej czasu na decyzję.',(p,q)=>clamp(0.2+agSoft(p)*0.9,0.1,0.85),(p,q,ok)=>{if(ok)return 'Agent da Ci jeszcze kilka tygodni.';addMor(p,-5);p.raiseReq=Math.min(0.15,(p.raiseReq||0)+0.05);return 'Agent naciska — przy rozmowach zażąda więcej.';}],
     ['nie','Nie przedłużymy umowy.',(p,q)=>1,(p,q,ok)=>{p.noExt=S().n;addMor(p,hasT(p,'pro')?-3:-8);return 'Agent zaczyna szukać klientowi nowego klubu.';}]]},
 kl:{t:p=>`Agent ${agName(p)} proponuje zawodnika`,
   x:(p,q)=>`„Reprezentuję zawodnika ${p.first} ${p.last} (${POS_NAMES[p.pos].toLowerCase()}, ${p.age} l., ocena ok. ${q.r}). ${p.tm<0?'Jest wolnym zawodnikiem':'Jest niezadowolony w '+(TEAMS[p.tm]?TEAMS[p.tm].name:'obecnym klubie')} i chętnie przyjdzie do was. Oczekuje ok. ${fmtShort2(q.w)} rocznie.”`,
   o:[['tak','Jestem zainteresowany — proszę o szczegóły.',(p,q)=>1,(p,q,ok)=>{ui.agOpen=p.id;return 'Agent przesłał dane zawodnika. Otwórz jego kartę i rozpocznij negocjacje (w oknie transferowym).';}],
     ['nie','Dziękuję, nie szukamy zawodnika na tę pozycję.',(p,q)=>1,(p,q,ok)=>'Agent podziękował.']]},
};
function agOpen(q){const X=AG();q.id='ag'+Date.now().toString(36)+Math.floor(R()*1e4);q.d=today();X.q.push(q);X.last=today();const P=PLAYERS[q.pid];if(!P)return;const p=P.p;
  sendMail({cat:'trans',from:`${agName(p)} (agent)`,t:AGQ[q.k].t(p),s:'Agent prosi o odpowiedź — Rozmowy → Agenci.',b:{type:'ag',id:q.id},act:1,lab:'Agenci'});}
function agDaily(d){if(SAVE.team==null||!SAVE.world||!S())return;const X=AG();
  for(const q of X.q.slice())if(daysBetween(q.d,d)>10)agAnswer(q.id,'_ignore',1);
  if(X.q.length>=2)return;if(X.last&&daysBetween(X.last,d)<18)return;if(R()>0.12)return;
  const t=myTeam();const ph=S().phase;const cand=[];const avg=t.players.reduce((a,p)=>a+rating(p),0)/Math.max(1,t.players.length);
  for(const p of t.players){if(p.jr||p.loan||p.tl)continue;if(p.agD&&daysBetween(p.agD,d)<90)continue;
    const fair=wageDemand(p);if(p.wage&&fair&&p.wage<fair*0.9&&p.ce>S().n&&rating(p)>=avg&&!(typeof newSign==='function'&&newSign(p)))cand.push([2,{k:'pod',pid:p.id,fair:round5k(fair),club:typeof ixSuitor==='function'?ixSuitor(p):null}]);
    if(p.ce!=null&&p.ce<=S().n&&p.noExt!==S().n&&(ph==='liga'||ph==='po')&&S().round>=Math.floor((S().rounds||[]).length*0.33)&&rating(p)>=avg-2)cand.push([2,{k:'kon',pid:p.id}]);}
  // klient do pozyskania: wolny zawodnik albo niezadowolony z innego klubu, wyraźnie lepszy od zmiennika na tej pozycji
  const pos=['P','A','S','R','L'][Math.floor(R()*5)];const mine=t.players.filter(p=>p.pos===pos&&!p.jr).map(p=>rating(p)).sort((a,b)=>b-a);const bar=(mine[1]!=null?mine[1]:mine[0]||60)+2;
  const pool=W().players.filter(p=>p.pos===pos&&!p.jr&&!p.inj&&p.tm!==SAVE.team&&rating(p)>=bar&&rating(p)<=teamStrength(t)+6&&(p.tm<0||(p.tm>=0&&TEAMS[p.tm]&&pSat(p,TEAMS[p.tm]).v<40)));
  const late=ph==='liga'&&S().round>=Math.floor((S().rounds||[]).length*0.66);
  if(pool.length&&(windowOpen()||late||ph==='po'||ph==='end')){const p=pool[Math.floor(R()*pool.length)];cand.push([1,{k:'kl',pid:p.id,r:rating(p),w:round5k(wageDemand(p))}]);}
  if(!cand.length)return;const tot=cand.reduce((a,c)=>a+c[0],0);let r=R()*tot,pick=cand[0][1];for(const c of cand){r-=c[0];if(r<=0){pick=c[1];break;}}
  const P=PLAYERS[pick.pid];if(P&&P.p.tm===SAVE.team)P.p.agD=d;agOpen(pick);}
function agAnswer(id,opt,auto){const X=AG();const q=X.q.find(x=>x.id===id);if(!q)return;X.q=X.q.filter(x=>x!==q);const P=PLAYERS[q.pid];if(!P)return;const p=P.p;const T=AGQ[q.k];
  let txt;if(opt==='_ignore'){if(q.k==='kl')txt='Agent nie doczekał się odpowiedzi i zaproponował zawodnika innym klubom.';else{addMor(p,-5);p.raiseReq=Math.min(0.15,(p.raiseReq||0)+0.05);txt=`Agent ${agName(p)} nie doczekał się odpowiedzi. Zawodnik jest urażony, a agent zażąda więcej.`;}}
  else{const o=T.o.find(x=>x[0]===opt);if(!o)return;const ok=R()<o[2](p,q);txt=o[3](p,q,ok);}
  X.log.unshift({d:today(),pid:q.pid,k:q.k,txt});X.log=X.log.slice(0,30);if(auto){news('📞 '+txt);return;}ui.agRes={txt,pid:q.pid};save();render();}
function agN(){return SAVE.ag?SAVE.ag.q.length:0;}
function agView(){const X=AG();const res=ui.agRes;
  const card=q=>{const P=PLAYERS[q.pid];if(!P)return '';const p=P.p;const T=AGQ[q.k];const st=agStyle(p);
    return `<div class="card"><div class="row" style="gap:12px;align-items:flex-start"><div style="font-size:42px;line-height:1">📞</div><div style="flex:1"><h2 style="margin:0 0 4px">${esc(T.t(p))}</h2>
      <div class="small mut">Agent: ${esc(agName(p))} — ${st[0]} (${esc(st[1])})</div><p style="margin:10px 0">${esc(T.x(p,q))}</p>
      ${T.o.map(o=>{const ch=o[2](p,q);const [pl,c]=bmPred(ch);return `<button class="opt" style="display:block;width:100%;text-align:left;margin:6px 0" onclick="agAnswer('${q.id}','${o[0]}')"><b>${esc(o[1])}</b>${ch<1?` <span class="mxpill ${c}" style="margin-left:6px">${pl}</span>`:''}</button>`;}).join('')}
      <div class="row wrap" style="gap:8px"><button class="ghost sm" onclick="openPop('${p.id}')">Karta zawodnika</button><span class="small mut">Agent czeka na odpowiedź do 10 dni.</span></div></div></div></div>`;};
  return `${res?`<div class="card" style="border:1px solid var(--acc)"><b>Agent:</b> ${esc(res.txt)} ${PLAYERS[res.pid]?`<button class="ghost sm" onclick="openPop('${res.pid}')">Karta zawodnika</button>`:''} <button class="ghost sm" onclick="ui.agRes=null;render()">OK</button></div>`:''}
   ${X.q.length?X.q.map(card).join(''):'<div class="card"><h2>Agenci</h2><p class="mut">Żaden agent nie czeka teraz na odpowiedź. Agenci sami się odezwą, gdy będą chcieli podwyżki dla klienta, rozmowy o kończącym się kontrakcie albo zaproponować Ci zawodnika.</p></div>'}
   ${X.log.length?`<div class="card"><h2>Ostatnie rozmowy z agentami</h2>${X.log.slice(0,8).map(l=>`<div class="small" style="margin:4px 0">${fmtShort(l.d)} — ${esc(l.txt)}</div>`).join('')}</div>`:''}`;}
ROZ_TABS.push(['agenci','Agenci',()=>agN()]);

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
