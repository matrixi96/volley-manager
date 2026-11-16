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
