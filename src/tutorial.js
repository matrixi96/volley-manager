// ================= SAMOUCZEK PIERWSZEGO SEZONU =================
// Krótkie kroki po wyborze klubu (można pominąć) + podpowiedzi asystenta w poczcie w pierwszych tygodniach.
const TUT=[
  ['sklad','Skład','Sprawdź wyjściową szóstkę i libero. Kliknij zawodnika, żeby zobaczyć jego umiejętności, formę i charakter. W zakładce „Dynamika zespołu” widać, kto jest zadowolony, a kto nie.'],
  ['taktyka','Taktyka','Ustaw zagrywkę, rozegranie (także osobno dla słabego i idealnego przyjęcia), blok i obronę. Taktykę możesz zmieniać też w trakcie meczu.'],
  ['trening','Trening','Plan tygodnia decyduje o rozwoju i świeżości. Cięższy trening to szybszy rozwój, ale więcej kontuzji. Raport treningu przychodzi na pocztę.'],
  ['finanse','Finanse','Zarząd daje budżet na transfery i pensje. Przy każdym podpisie zobaczysz, ile z niego zostanie. Dyrektor finansowy pomaga pilnować wydatków.'],
  ['poczta','Poczta','Tu trafiają raporty, oferty i podpowiedzi asystenta. Wiadomości z przyciskiem wymagają Twojej decyzji.'],
  ['mecz','Pierwszy mecz','Gdy wszystko gotowe, przejdź do meczu. Możesz oglądać akcje, brać czasy, zmieniać zawodników i słuchać rad asystenta.'],
];
function tutState(){
  if(SAVE.tut==null){const fresh=!(SAVE.coach&&SAVE.coach.seasons)&&daysBetween(SAVE.coach.joined||GAME_START,today())<14;
    SAVE.tut=fresh?{i:0}:{done:1};}
  return SAVE.tut;}
function tutBar(){if(SAVE.team==null||!SAVE.coach)return '';const t=tutState();if(t.done)return '';
  const [tab,ti,tx]=TUT[t.i]||TUT[0];const here=ui.tab===tab;
  return `<style>.side .nav[onclick*="go('${tab}')"]{box-shadow:inset 3px 0 0 var(--acc);background:rgba(234,179,8,.12)}</style>
  <div class="card" style="border:1px solid var(--acc);margin-bottom:12px"><div class="row wrap" style="gap:10px;align-items:center">
   <span class="small mut">Samouczek ${t.i+1}/${TUT.length}</span><b>${esc(ti)}</b><span class="sp"></span>
   ${here?'':`<button class="btn sm" onclick="go('${tab}')">Przejdź</button>`}
   <button class="btn sm" onclick="tutNext()">${t.i+1<TUT.length?'Dalej':'Zakończ'}</button>
   <button class="ghost sm" onclick="tutSkip()">Pomiń samouczek</button></div>
   <div class="small" style="margin-top:6px">${esc(tx)}</div></div>`;}
function tutNext(){const t=tutState();t.i++;if(t.i>=TUT.length){t.done=1;save();render();return;}save();go(TUT[t.i][0]);}
function tutSkip(){tutState().done=1;save();render();}
// podpowiedzi w poczcie: przez pierwsze ok. 6 tygodni w klubie, każda najwyżej raz
function tutTips(d){if(SAVE.team==null||!SAVE.coach)return;const j=SAVE.coach.joined||GAME_START;if(daysBetween(j,d)>42||daysBetween(j,d)<1)return;
  const done=SAVE.tutTip||(SAVE.tutTip={});const from=typeof asyName==='function'?asyName():'Asystent';const t=myTeam();if(!t)return;
  const tip=(k,ti,x,tab)=>{if(done[k])return false;done[k]=1;sendMail({cat:'klub',from,t:ti,s:x.slice(0,90),b:{type:'text',x},act:0});return true;};
  const lu=SAVE.lineup||{};
  if(!lu.L&&t.players.some(p=>p.pos==='L'&&!(p.inj>0))&&tip('lib','Podpowiedź: ustaw libero','W składzie nie ma libero, a mamy zdrowego libero w kadrze. Libero mocno poprawia przyjęcie i obronę — ustaw go w zakładce Skład.'))return;
  const exp=t.players.filter(p=>p.ce&&S()&&p.ce<=S().n&&!p.loan);
  if(exp.length&&tip('ce','Podpowiedź: kończące się kontrakty',`Kontrakt kończy się po tym sezonie: ${exp.slice(0,5).map(p=>p.first[0]+'. '+p.last).join(', ')}${exp.length>5?' i inni':''}. Rozmowy warto zacząć wcześniej — kliknij zawodnika w zakładce Skład.`))return;
  try{const bl=typeof budLeft==='function'?budLeft():null;if(bl&&bl.tr>=150000&&tip('bud','Podpowiedź: wolny budżet transferowy',`Zostało nam ok. ${fmtShort2(bl.tr)} budżetu na transfery. Skauting i rynek wolnych zawodników pomogą znaleźć wzmocnienie.`))return;}catch(e){}
  if(daysBetween(j,d)>=10&&tip('tac','Podpowiedź: taktyka pod rywala','Przed meczem zajrzyj do Centrum danych: widać tam, gdzie rywal atakuje i kogo warto obsługiwać zagrywką. Taktykę możesz zmienić też w trakcie meczu.'))return;}
// ikonka „?” z krótkim objaśnieniem
function tipQ(t){return `<span class="tipq" title="${esc(t)}" style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;border-radius:50%;border:1px solid var(--mut,#888);font-size:11px;margin-left:6px;cursor:help;opacity:.8">?</span>`;}
// ================= ODPRAWA PRZED MECZEM =================
// Asystent i analityk podpowiadają decyzje na konkretnego rywala: co, dlaczego i przycisk „Zastosuj”.
function preTips(opI){const op=TEAMS[opI];if(!op||!op.players)return [];
  const D=typeof preTipsData==='function'?preTipsData(opI):null;if(D){const st=preStar(opI);if(st)D.push(st);if(D.every(x=>!x.btn))D.unshift({g:'Ogólnie',t:'Nasza taktyka pasuje do tego rywala.',why:'Dane z sezonu nie wskazują ustawienia, które dałoby wyraźną przewagę.'});return D;}
  const out=[];const t=myTac();const aSk=typeof staffSkill==='function'?staffSkill('asy'):8;const an=typeof anaSkill==='function'?anaSkill():0;
  const lu=autoLineup(op);const P=k=>op.players.find(p=>p.id===lu[k]);const ofPos=pos=>Object.keys(lu).map(k=>P(k)).filter(p=>p&&p.pos===pos);
  // 1. zagrywka w najsłabiej przyjmującego
  const recs=[...ofPos('P'),...ofPos('L')];if(recs.length>=2){const so=recs.slice().sort((a,b)=>(a.prz+a.tod)-(b.prz+b.tod));const w=so[0],nx=so[1];
    if((nx.prz+nx.tod)-(w.prz+w.tod)>=1.5&&w.pos!=='L')out.push({g:'Zagrywka',t:`Zagrywaj w zawodnika: ${w.last}.`,why:`Przyjmuje najsłabiej z ich linii przyjęcia (przyjęcie ${w.prz}, odbicie dołem ${w.tod}). Słabe przyjęcie odbiera rywalowi szybką grę środkiem.`,on:t.tgt===w.id,btn:'Zastosuj',act:`preSet('tgt','${w.id}')`});}
  // 2. ryzyko zagrywki: słabe przyjęcie rywala → mocniej
  if(recs.length){const avg=recs.reduce((a,p)=>a+p.prz,0)/recs.length;const my=myTeam().players.filter(p=>Object.values(myLineup()).includes(p.id));const myZ=my.length?my.reduce((a,p)=>a+p.zag,0)/my.length:10;
    if(avg<=13.5&&myZ>=12&&t.serve!==2)out.push({g:'Zagrywka',t:'Zagrywaj ryzykownie.',why:`Rywal ma słabe przyjęcie (średnio ${avg.toFixed(1)}), a nasi zagrywający są dobrzy (${myZ.toFixed(1)}). Więcej asów i złych przyjęć wynagrodzi dodatkowe błędy.`,btn:'Zastosuj',act:`preSet('serve',2)`});
    else if(avg>=16&&t.serve===2)out.push({g:'Zagrywka',t:'Zmniejsz ryzyko zagrywki.',why:`Rywal świetnie przyjmuje (średnio ${avg.toFixed(1)}). Ryzykowna zagrywka da głównie błędy, a mało asów.`,btn:'Zastosuj',act:`preSet('serve',1)`});}
  // 3. rozegranie przy idealnym przyjęciu: słaby blok środkowych rywala → środek
  const mids=ofPos('S');if(mids.length){const mb=mids.reduce((a,p)=>a+p.blo,0)/mids.length;const dq=t.distQ||{};
    if(mb<=13&&dq[3]!==2)out.push({g:'Rozegranie',t:'Po idealnym przyjęciu graj środkiem.',why:`Środkowi rywala słabo blokują (blok średnio ${mb.toFixed(1)}). Szybka piłka po dobrym przyjęciu będzie trudna do zatrzymania.`,btn:'Zastosuj',act:`preDistQ(3,2)`});}
  // 4–5. blok na kierunek ataku (wymaga analityka)
  if(an>=6){const opp=ofPos('A')[0];const ps=ofPos('P').sort((a,b)=>b.ata-a.ata)[0];
    for(const [p,key,side,who] of [[opp,'blkL','L','atakujący'],[ps,'blkR','R','najlepszy przyjmujący']]){if(!p)continue;const c=dirTend(p);const best=c>=0.62?0:c<=0.38?2:null;if(best==null||(t[key]??1)===best)continue;
      out.push({g:'Blok',t:`Blok „${BLK_OPT[best][0].toLowerCase()}” na ${side==='L'?'lewej':'prawej'} stronie siatki.`,why:`${p.last} (${who}) najczęściej bije ${best===0?'po skosie':'po prostej'} — według analityka ok. ${Math.round((best===0?c:1-c)*100)}% ataków. Blok zamknie mu ulubiony kierunek.`,btn:'Zastosuj',act:`preSet('${key}',${best})`});}}
  else out.push({g:'Analiza',t:'Bez analityka nie wiemy, w które kierunki atakuje rywal.',why:'Analityk (Sztab) ze skillem 6+ podpowie przed meczem, jak ustawić blok.'});
  {const st=preStar(opI);if(st)out.push(st);}
  if(out.every(x=>!x.btn))out.unshift({g:'Ogólnie',t:'Nasza taktyka pasuje do tego rywala.',why:'Nie widzę ustawienia, które dałoby wyraźną przewagę. Wróć do rad asystenta w trakcie meczu.'});
  out.push({g:'Dane',t:'Rywal nie grał jeszcze w tym sezonie meczu ze statystykami.',why:'Rady opierają się na umiejętnościach zawodników. Po pierwszych meczach rywala odprawa użyje prawdziwych liczb.'});
  return aSk<6?out.slice(0,3):out;}
function preStar(opI){const op=TEAMS[opI];const lu=autoLineup(op);const P=k=>op.players.find(p=>p.id===lu[k]);
  const star=Object.keys(lu).map(k=>P(k)).filter(p=>p&&p.pos!=='L'&&p.pos!=='R').sort((a,b)=>rating(b)-rating(a))[0];
  if(star)return ({g:'Rywal',t:`Najgroźniejszy u rywala: ${star.last} (${POS_NAMES[star.pos].toLowerCase()}, ocena ${rating(star)}).`,why:star.pos==='S'?'Środkowy groźny w krótkiej — dobra zagrywka odbierze mu piłki.':'Blok i obrona powinny być gotowe na jego ataki w ważnych momentach.'});
  return null;}
function preSet(k,v){try{preRemember(k==='tgt'?{k:'tgt',id:v}:k==='blkR'||k==='blkL'?{k,w:k==='blkR'?'L4':'R2',dir:v===0?'cross':'line'}:{k});}catch(e){}if(k==='tgt'){myTac().tgt=typeof v==='string'&&/^\d+$/.test(v)?+v:v;myTac().tgtOnce=1;save();render();return;}tacSet(k,v);}
function preDistQ(q,i){try{preRemember({k:'distQ'});}catch(e){}setDistQ(q,i);}
function preCard(opI){let L=[];try{L=preTips(opI);}catch(e){console.error(e);}if(!L.length)return '';
  return `<div class="card"><h2>Odprawa przed meczem${tipQ('Rady asystenta i analityka na tego rywala. „Zastosuj” zmienia taktykę na ten mecz (zagrywka w zawodnika obowiązuje tylko w tym meczu, reszta zostaje w taktyce).')}</h2>
   ${L.map(x=>`<div class="asr" style="display:flex;gap:10px;align-items:flex-start;margin:8px 0"><span class="asg" style="min-width:90px">${esc(x.g)}</span><div style="flex:1"><b>${esc(x.t)}</b><div class="small mut">Dlaczego: ${esc(x.why)}</div></div>${x.btn?`<button class="btn sm" onclick="${x.act}">✓ ${esc(x.btn)}</button>`:''}</div>`).join('')}</div>`;}
// Skład: osobne zakładki „Skład wyjściowy” i „Kadra”, żeby ekran był krótszy (szczególnie na telefonie)
{const _sqAll=squadView;squadView=function(){if(ui.sqTab==='dyn')return _sqAll();const h=_sqAll();
  const M1='<div class="card"><div class="row"><h2>Skład wyjściowy',M2='<div class="card"><div class="row"><h2>Kadra (';const i1=h.indexOf(M1),i2=h.indexOf(M2);if(i1<0||i2<0)return h;
  const tabs=`<div class="card"><div class="row wrap" style="gap:6px"><button class="tabb ${!ui.sqTab?'on':''}" onclick="ui.sqTab=null;render()">Skład wyjściowy</button><button class="tabb ${ui.sqTab==='kadra'?'on':''}" onclick="ui.sqTab='kadra';render()">Kadra</button><button class="tabb" onclick="ui.sqTab='dyn';render()">Dynamika zespołu</button></div></div>`;
  return tabs+(ui.sqTab==='kadra'?h.slice(i2):h.slice(i1,i2));};}
