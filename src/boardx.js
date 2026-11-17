// ================= ZARZĄD: SPOTKANIA, PROŚBY, OCENA W POŁOWIE SEZONU, ULTIMATUM, CEL NA SEZON =================
// SAVE.bm = {last: data ostatniego spotkania, asked:{klucz:numer sezonu}, q:[sprawy od zarządu], ult:{need,n,w,from,until}|null, log:[]}
function BM(){return SAVE.bm||(SAVE.bm={last:null,asked:{},q:[],ult:null,log:[]});}
function bConf(){return SAVE.board?SAVE.board.conf:60;}
function bAdd(d){if(SAVE.board)SAVE.board.conf=clamp(SAVE.board.conf+d,0,100);}
function bmFree(){const b=BM();return !b.last||daysBetween(b.last,today())>=30;}
function bmChance(base){const c=coach();return clamp(base+(bConf()-50)/100*0.8+((c?c.rep:40)-40)/100*0.4+(cA('neg')-10)/10*0.08,0.03,0.95);}
const BM_REQ=[
 ['tr','Większy budżet transferowy','+25% budżetu transferowego na ten sezon.',()=>{const b=BUD();return b&&!b.extra?null:'Zarząd dołożył już pieniądze w tym sezonie.';},()=>bmChance(0.55)*(SAVE.fin.bal>300000?1:0.5),
   ok=>{const b=BUD();if(ok){const add=round5k(Math.max(150000,b.tr*0.25));b.extra=add;bAdd(-4);return `Zarząd dołożył ${fmt(add)} do budżetu transferowego. Oczekuje za to wyników.`;}bAdd(-2);return 'Zarząd odmówił: „Najpierw wyniki, potem pieniądze”.';}],
 ['wg','Większy budżet płacowy','+10% budżetu na pensje (łatwiej zatrzymać i kupić zawodników).',()=>null,()=>bmChance(0.45),
   ok=>{const b=BUD();if(ok){const add=round5k(b.wg*0.1);b.wg+=add;bAdd(-3);return `Budżet płacowy wzrósł o ${fmt(add)} rocznie.`;}bAdd(-2);return 'Zarząd odmówił: koszty pensji i tak są wysokie.';}],
 ['st','Więcej miejsc w sztabie','+1 etat w sztabie (limit etatów ustala zarząd).',()=>!limOn()?'Jesteś właścicielem — sam decydujesz o liczbie etatów.':((BM().stX||0)>=3?'Zarząd nie zgodzi się na kolejne etaty.':null),()=>bmChance(0.45)*(budLeft().wg>0?1:0.5),
   ok=>{const B=BM();if(ok){B.stX=(B.stX||0)+1;bAdd(-2);return `Zarząd zgodził się na dodatkowy etat. Limit sztabu: ${staffLimit()} etatów (bez skautów).`;}bAdd(-1);return 'Zarząd odmówił: „Sztab jest wystarczający jak na nasz klub”.';}],
 ['inf','Dotacja na infrastrukturę','Zarząd przekazuje pieniądze na rozbudowę obiektów (Infrastruktura).',()=>null,()=>bmChance(0.4)*(SAVE.fin.bal>0?1:0.4),
   ok=>{if(ok){const add=round5k(200000+(coach().rep||40)*4000);money(add,'Dotacja zarządu');finLog('Dotacja zarządu na infrastrukturę',add);SAVE.bm.infEar=(SAVE.bm.infEar||0)+add;return `Zarząd przekazał ${fmt(add)} na inwestycje w obiekty. Wydaj je na rozbudowę (Infrastruktura).`;}bAdd(-1);return 'Zarząd odmówił: inne wydatki są teraz ważniejsze.';}],
 ['jr','Inwestycja w juniorów','Lepsi juniorzy w następnym naborze.',()=>null,()=>bmChance(0.6),
   ok=>{if(ok){SAVE.bm.jrBoost=S().n;return 'Zarząd zgodził się: w następnym naborze juniorzy będą zdolniejsi.';}return 'Zarząd odmówił: akademia ma wystarczające środki.';}],
 ['goal','Obniżenie celu sezonu','Niższy cel, ale zarząd zapamięta, że prosiłeś.',()=>{const s=S();if(s.phase!=='liga'&&s.phase!=='spar')return 'Cel można zmienić tylko na początku sezonu.';if(s.phase==='liga'&&s.round>=6)return 'Na zmianę celu jest już za późno (po 6. kolejce).';if(goalLower(s.goal)==null)return 'Cel jest już najniższy.';return null;},()=>bmChance(0.4),
   ok=>{const s=S();if(ok){const g0=s.goal;s.goal=goalLower(s.goal);bAdd(-8);coach().rep=Math.max(0,coach().rep-2);return `Zarząd zgodził się: nowy cel to „${goalTxt(s.goal,lgOf(SAVE.team))}” (było: ${goalTxt(g0,lgOf(SAVE.team))}). Twoja pozycja jest jednak słabsza.`;}bAdd(-5);return 'Zarząd odmówił i jest zaniepokojony brakiem wiary w zespół.';}],
];
function goalLower(g){const n=lgIds(myLg()).length;const L=[2,4,8,10,n-2,n].filter((x,i,a)=>x>0&&x<=n&&a.indexOf(x)===i).sort((a,b)=>a-b);const i=L.indexOf(g);return i>=0&&i<L.length-1?L[i+1]:null;}
function goalHigher(g){const n=lgIds(myLg()).length;const L=[2,4,8,10,n-2,n].filter((x,i,a)=>x>0&&x<=n&&a.indexOf(x)===i).sort((a,b)=>a-b);const i=L.indexOf(g);return i>0?L[i-1]:null;}
function bmAsk(k){const B=BM();const r=BM_REQ.find(x=>x[0]===k);if(!r)return;if(!bmFree())return;const blk=r[3]();if(blk||B.asked[k]===S().n)return;
  B.last=today();B.asked[k]=S().n;const ok=R()<r[4]();const txt=r[5](ok);B.log.unshift({d:today(),k,ok,txt});B.log=B.log.slice(0,30);ui.bmRes={txt,ok};save();render();}
// ---- sprawy od zarządu ----
function bmOpen(q){const B=BM();if(B.q.some(x=>x.k===q.k))return;q.id='bm'+Date.now().toString(36);q.d=today();B.q.push(q);
  sendMail({cat:'zarz',from:'Prezes klubu',t:BMQ[q.k].t(q),s:'Zarząd prosi o spotkanie — Rozmowy → Zarząd.',b:{type:'bm',id:q.id},act:1,lab:'Zarząd'});}
const BMQ={
 mid:{t:q=>'Ocena w połowie sezonu',x:q=>{const p=q.pos,g=q.goal;return `„Jesteśmy na ${p}. miejscu, a celem jest ${goalTxt(g,lgOf(SAVE.team))}. ${p<=g?'Wyniki nas cieszą — oby tak dalej.':'Wyniki są poniżej oczekiwań. Jak pan to widzi?'}”`;},
   o:[['dobrze','Jesteśmy na dobrej drodze, plan działa.',q=>q.pos<=q.goal?0.85:0.35,(q,ok)=>{bAdd(ok?3:-4);return ok?'Zarząd jest spokojny.':'Zarząd uważa, że nie widzi pan problemów.';}],
     ['wzm','Potrzebuję wzmocnień, żeby osiągnąć cel.',q=>bmChance(0.45),(q,ok)=>{if(ok){const b=BUD();const add=round5k(Math.max(100000,b.tr*0.15));b.trAdd=(b.trAdd||0)+add;bAdd(-3);return `Zarząd dołożył ${fmt(add)} na transfery w trakcie sezonu.`;}bAdd(-3);return 'Zarząd odmówił: „Proszę pracować z tymi, których pan ma”.';}],
     ['odp','Biorę pełną odpowiedzialność za wynik.',q=>clamp(0.4+(cA('aut')-10)/20,0.1,0.85),(q,ok)=>{bAdd(ok?5:-2);return ok?'Zarząd docenia postawę i daje panu więcej spokoju.':'Zarząd zapamięta te słowa.';}]]},
 ult:{t:q=>'Ultimatum zarządu',x:q=>`„Zaufanie do pana jest na wyczerpaniu. Oczekujemy ${q.need} zwycięstw w najbliższych ${q.n} meczach ligowych. W przeciwnym razie rozstaniemy się.”`,
   o:[['ok','Rozumiem. Dowiozę te wyniki.',q=>0.9,(q,ok)=>{ultStart(q);return 'Ultimatum przyjęte. Licznik ruszył.';}],
     ['wal','To niesprawiedliwe — drużyna jest w budowie.',q=>clamp(0.25+(cA('neg')-10)/20+(coach().rep-40)/150,0.05,0.6),(q,ok)=>{if(ok){bAdd(10);return 'Zarząd dał się przekonać i daje panu więcej czasu. Ultimatum wycofane.';}ultStart(q);bAdd(-3);return 'Zarząd nie zmienił zdania. Ultimatum obowiązuje.';}]]},
 goal:{t:q=>'Cel na nowy sezon',x:q=>`„Na sezon ${sLabel(S().n)} oczekujemy: ${goalTxt(q.goal,lgOf(SAVE.team))}. Czy to dla pana realne?”`,
   o:[['ok','Przyjmuję cel.',q=>0.95,(q,ok)=>{S().goal=q.goal;bAdd(2);return 'Cel zatwierdzony.';}],
     ['niz','Proszę o niższy cel — drużyna potrzebuje czasu.',q=>goalLower(q.goal)==null?0:bmChance(0.45),(q,ok)=>{if(ok){S().goal=goalLower(q.goal);const b=BUD();if(b){b.tr=round5k(b.tr*0.85);}bAdd(-4);return `Zarząd zgodził się na „${goalTxt(S().goal,lgOf(SAVE.team))}”, ale obciął budżet transferowy o 15%.`;}S().goal=q.goal;bAdd(-4);return 'Zarząd nie zgodził się i jest zaniepokojony.';}],
     ['wyz','Stać nas na więcej — proszę o ambitniejszy cel i większy budżet.',q=>goalHigher(q.goal)==null?0:bmChance(0.6),(q,ok)=>{if(ok){S().goal=goalHigher(q.goal);const b=BUD();const add=b?round5k(Math.max(150000,b.tr*0.2)):0;if(b)b.trAdd=(b.trAdd||0)+add;bAdd(5);return `Nowy cel: „${goalTxt(S().goal,lgOf(SAVE.team))}”. Zarząd dołożył ${fmt(add)} do budżetu transferowego.`;}S().goal=q.goal;return 'Zarząd woli zostać przy pierwotnym celu.';}]]},
};
function bmAnswer(id,opt,auto){const B=BM();const q=B.q.find(x=>x.id===id);if(!q)return;B.q=B.q.filter(x=>x!==q);const T=BMQ[q.k];
  let txt;if(opt==='_ignore'){const o=T.o[0];txt=o[3](q,true);bAdd(-3);txt='Brak odpowiedzi na wezwanie zarządu. '+txt;}
  else{const o=T.o.find(x=>x[0]===opt);if(!o)return;const ok=R()<o[2](q);txt=o[3](q,ok);}
  B.log.unshift({d:today(),k:q.k,ok:true,txt});B.log=B.log.slice(0,30);if(auto){news('👔 '+txt);return;}ui.bmRes={txt,ok:true};save();render();}
// ---- ultimatum ----
function ultStart(q){BM().ult={need:q.need,n:q.n,w:0,p:0,from:today()};}
function bmAfterMatch(res,kind){const B=BM();const U=B.ult;if(!U||kind!=='liga')return;const me=res.h===SAVE.team;const won=(me?res.sw[0]:res.sw[1])>(me?res.sw[1]:res.sw[0]);U.p++;if(won)U.w++;
  if(U.w>=U.need){B.ult=null;bAdd(15);news(`👔 Ultimatum spełnione (${U.w} zwycięstw w ${U.p} meczach). Zarząd odzyskał zaufanie.`);return;}
  if(U.need-U.w>U.n-U.p){B.ult=null;if(!SAVE.ownClub)fireCoach(`Nie spełniłeś ultimatum zarządu (${U.w} z wymaganych ${U.need} zwycięstw w ${U.n} meczach).`);}}
// ---- codziennie: wyzwalacze spraw ----
function bmDaily(d){if(SAVE.team==null||!S()||SAVE.fired||!coach())return;const B=BM();const s=S();
  for(const q of B.q.slice())if(daysBetween(q.d,d)>10)bmAnswer(q.id,'_ignore',1);
  if(s.phase==='liga'){const half=Math.floor(s.rounds.length/2);if(s.round>=half&&B.midN!==s.n){B.midN=s.n;const T=leagueTable();bmOpen({k:'mid',pos:T.findIndex(x=>x.i===SAVE.team)+1,goal:s.goal||goalFor(SAVE.team)});}
    if(bConf()<25&&!B.ult&&B.ultN!==s.n&&s.round>=5&&!SAVE.ownClub&&s.round<s.rounds.length-4){B.ultN=s.n;bmOpen({k:'ult',need:3,n:5});}}}
// po starcie nowego sezonu (z coachOffseason): propozycja celu do negocjacji
function bmSeasonGoal(){const s=S();bmOpen({k:'goal',goal:s.goal||goalFor(SAVE.team)});}
function bmPred(ch){const [pl,c]=ixPred(ch);return [pl.replace('przyjmie dobrze','duża szansa').replace('raczej przyjmie','spora szansa').replace('może się nie spodobać','mała szansa').replace('źle przyjmie','prawie bez szans'),c];}
function bmN(){return SAVE.bm?SAVE.bm.q.length:0;}
function bmView(){const B=BM();const res=ui.bmRes;const free=bmFree();const s=S();
  const qcard=q=>{const T=BMQ[q.k];return `<div class="card"><div class="row" style="gap:12px;align-items:flex-start"><div style="font-size:42px;line-height:1">👔</div><div style="flex:1"><h2 style="margin:0 0 4px">${esc(T.t(q))}</h2><p style="margin:8px 0">${esc(T.x(q))}</p>
    ${T.o.map(o=>{const ch=o[2](q);if(ch<=0)return '';const [pl,c]=bmPred(ch);return `<button class="opt" style="display:block;width:100%;text-align:left;margin:6px 0" onclick="bmAnswer('${q.id}','${o[0]}')"><b>${esc(o[1])}</b> <span class="mxpill ${c}" style="margin-left:6px">${pl}</span></button>`;}).join('')}
    <div class="small mut">Zarząd czeka na odpowiedź do 10 dni.</div></div></div></div>`;};
  const U=B.ult;
  return `${res?`<div class="card" style="border:1px solid var(--acc)"><b>Zarząd:</b> ${esc(res.txt)} <button class="ghost sm" onclick="ui.bmRes=null;render()">OK</button></div>`:''}
   ${U?`<div class="card" style="border:1px solid var(--bad,#ef4444)"><h2>Ultimatum</h2><p>Wymagane ${U.need} zwycięstwa w ${U.n} meczach ligowych. Stan: <b>${U.w} zwycięstw w ${U.p} meczach</b> (zostało ${U.n-U.p}).</p></div>`:''}
   ${B.q.map(qcard).join('')}
   <div class="card"><h2>Spotkanie z zarządem${tipQ('Raz na 30 dni możesz poprosić zarząd o jedną rzecz. Każdą prośbę można złożyć raz w sezonie. Szansa zależy od zaufania zarządu, Twojej reputacji i umiejętności negocjacji.')}</h2>
    <div class="small" style="margin-bottom:8px">Zaufanie zarządu: <b>${Math.round(bConf())}%</b> · cel sezonu: <b>${goalTxt(s.goal||goalFor(SAVE.team),lgOf(SAVE.team))}</b> · ${free?'<span class="good">możesz poprosić o spotkanie</span>':`następne spotkanie możliwe ${fmtShort(addDays(B.last,30))}`}</div>
    ${BM_REQ.map(r=>{const blk=r[3]()||(B.asked[r[0]]===s.n?'Prosiłeś już o to w tym sezonie.':null);const [pl,c]=bmPred(r[4]());return `<div class="row wrap" style="gap:10px;margin:8px 0;align-items:center"><div style="flex:1;min-width:220px"><b>${r[1]}</b><div class="small mut">${r[2]}</div></div>${blk?`<span class="small mut">${esc(blk)}</span>`:`<span class="mxpill ${c}">${pl}</span><button class="btn sm" ${free?'':'disabled'} onclick="bmAsk('${r[0]}')">Poproś</button>`}</div>`;}).join('')}</div>
   ${B.log.length?`<div class="card"><h2>Historia rozmów z zarządem</h2>${B.log.slice(0,8).map(l=>`<div class="small" style="margin:4px 0">${fmtShort(l.d)} — ${esc(l.txt)}</div>`).join('')}</div>`:''}`;}

// ---- zakładki widoku „Rozmowy” ----
const ROZ_TABS=[[null,'Zawodnicy',()=>ixN()],['zarzad','Zarząd',()=>bmN()]];
function rozN(){return ROZ_TABS.reduce((a,t)=>a+(t[2]()||0),0);}
function rozmowyView(){const tab=ui.ixTab||null;const T=ROZ_TABS.find(t=>t[0]===tab)||ROZ_TABS[0];
  const head=`<div class="card"><div class="row wrap" style="gap:6px">${ROZ_TABS.map(([k,l,n])=>`<button class="tabb ${T[0]===k?'on':''}" onclick="ui.ixTab=${k?`'${k}'`:'null'};render()">${l}${n()?` (${n()})`:''}</button>`).join('')}</div></div>`;
  const body=T[0]==='zarzad'?bmView():T[0]==='media'&&typeof mdView==='function'?mdView():T[0]==='agenci'&&typeof agView==='function'?agView():ixView();return head+body;}
