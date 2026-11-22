// ================= ROZMOWY: SPRAWY ZGŁASZANE PRZEZ ZAWODNIKÓW, ROLE, OBIETNICE =================
// SAVE.ix = {q:[otwarte sprawy], pr:[obietnice], cred:wiarygodność trenera 0–100, last:data ostatniej nowej sprawy, log:[]}
// p.role – rola w zespole, p.rel – relacja z trenerem 0–100, p.pl8 – czy grał w ostatnich 8 kolejkach (1/0)
function IX(){return SAVE.ix||(SAVE.ix={q:[],pr:[],cred:60,last:null,log:[]});}
const ROLES=[['klu','Kluczowy zawodnik',0.85,'Gra prawie zawsze, od niego zależą wyniki.'],['pod','Podstawowy zawodnik',0.65,'Gra w większości meczów.'],
  ['rot','Zawodnik rotacyjny',0.35,'Gra regularnie, ale nie co mecz.'],['per','Perspektywiczny',0.1,'Młody — uczy się, gra okazjonalnie.'],['rez','Rezerwowy',0,'Wchodzi, gdy jest potrzebny — nie liczy na regularną grę.']];
function roleExpTxt(k){const r=ROLES[ROLE_I[k]];return !r?'':r[2]>0?`oczekuje gry w ok. ${Math.round(r[2]*100)}% meczów`:'bez wymagań co do czasu gry';}
const ROLE_I=Object.fromEntries(ROLES.map((r,i)=>[r[0],i]));
function roleDef(p){const t=myTeam();const lu=new Set(Object.values(myLineup()));const L=t.players.filter(x=>!x.jr).slice().sort((a,b)=>rating(b)-rating(a));const k=L.indexOf(p);
  if(lu.has(p.id))return k<3?'klu':'pod';if(p.age<=21)return 'per';return k<10?'rot':'rez';}
function roleOf(p){return p.role||roleDef(p);}
function roleExp(p){return ROLES[ROLE_I[roleOf(p)]][2];}
function relOf(p){return p.rel==null?50:p.rel;}
function relAdd(p,d){p.rel=Math.round(clamp(relOf(p)+d,0,100));}
function plShare(p){const a=p.pl8||[];return a.length?a.reduce((x,y)=>x+y,0)/a.length:null;}
// po każdej kolejce ligi/play-off (wywołanie z roundTick)
function ixRound(){if(SAVE.team==null)return;for(const q of IX().q)q.r=(q.r||0)+1;for(const p of myTeam().players){if(p.jr||p.inj)continue;const pl=ROUND_PLAYED.has(p.id)?1:0;(p.pl8=p.pl8||[]).push(pl);if(p.pl8.length>8)p.pl8.shift();
    for(const pr of IX().pr)if(pr.st==='open'&&pr.pid===p.id&&pr.k==='czas'){pr.n++;pr.p+=pl;}}}
// szansa, że zawodnik dobrze przyjmie odpowiedź
function ixChance(p,base,mods){const c=coach();const aut=c&&c.attrs?(c.attrs.aut||10):10;let x=base+(aut-10)/10*0.12+(relOf(p)-50)/100*0.3;
  for(const [tr,v] of Object.entries(mods||{}))if(hasT(p,tr))x+=v;return clamp(x,0.05,0.95);}
function ixPred(ch){const a=typeof staffSkill==='function'?staffSkill('asy'):8;const L=ch>=0.75?['przyjmie dobrze','good']:ch>=0.5?['raczej przyjmie','good']:ch>=0.3?['może się nie spodobać','warn']:['źle przyjmie','bad'];
  if(a<8&&ch>=0.3&&ch<0.75)return ['trudno powiedzieć','mut'];return L;}
// ---- rodzaje spraw ----
// każda opcja: [klucz, tekst odpowiedzi, (p,q)=>szansa, (p,q,ok)=>skutek]
const IX_T={
 czas:{t:p=>`${p.first} ${p.last} chce więcej grać`,
   x:(p,q)=>`„Trenerze, w ostatnich meczach gram za mało (${Math.round(q.sh*100)}% kolejek). Jako ${ROLES[ROLE_I[roleOf(p)]][1].toLowerCase()} oczekuję więcej. Co dalej?”`,
   o:[['prom','Obiecuję ci więcej gry w ciągu 4 tygodni.',p=>ixChance(p,0.72+(IX().cred-60)/200,{amb:0.05}),
       (p,q,ok)=>{if(ok){addMor(p,6);relAdd(p,4);ixPromise(p,'czas',28,{need:Math.max(0.5,roleExp(p)-0.15)});return 'Uspokoił się. Obietnica zapisana — trzeba jej dotrzymać.';}addMor(p,-3);return 'Nie bardzo wierzy w obietnice — ostatnio trener ich nie dotrzymywał.';}],
     ['zasluz','Musisz zasłużyć na to na treningach.',p=>ixChance(p,0.5,{pro:0.25,oby:0.2,amb:-0.2,kap:-0.25,ind:-0.2}),
       (p,q,ok)=>{if(ok){addMor(p,1);relAdd(p,2);p.trBoost=today();return 'Przyjął to i obiecał mocniej pracować.';}addMor(p,-8);relAdd(p,-8);return 'Uznał to za wymówkę. Jest rozżalony.';}],
     ['rola','Twoja rola w tym sezonie to zmiennik.',p=>ixChance(p,0.45,{loj:0.25,oby:0.15,pro:0.1,amb:-0.25,suk:-0.15}),
       (p,q,ok)=>{const i=Math.min(ROLE_I[roleOf(p)]+1,4);p.role=ROLES[Math.max(i,2)][0];if(ok){addMor(p,-2);return 'Przyjął nową rolę ze spokojem. Oczekuje teraz mniej gry.';}addMor(p,-10);relAdd(p,-10);return 'Poczuł się zdegradowany. Rola zmieniona, ale relacja ucierpiała.';}],
     ['lista','Jeśli chcesz, możesz poszukać nowego klubu.',p=>ixChance(p,0.55,{amb:0.2,suk:0.15,ind:0.1,loj:-0.4,oby:-0.1}),
       (p,q,ok)=>{if(typeof tlSet==='function')tlSet(p.id,pValue(p));p.unh=0;if(ok){addMor(p,2);relAdd(p,-2);return 'Docenił szczerość. Trafił na listę transferową.';}addMor(p,-6);relAdd(p,-12);return 'Odebrał to tak, jakby klub chciał się go pozbyć. Jest na liście transferowej i czuje się odrzucony.';}]]},
 kontrakt:{t:p=>`${p.first} ${p.last} pyta o nowy kontrakt`,
   x:p=>`„Mój kontrakt kończy się po tym sezonie. Chciałbym wiedzieć, czy klub na mnie liczy.”`,
   o:[['prom','Dostaniesz nową ofertę w ciągu 30 dni.',p=>ixChance(p,0.8+(IX().cred-60)/200,{}),
       (p,q,ok)=>{if(ok){addMor(p,5);relAdd(p,5);ixPromise(p,'kontrakt',30,{ce:p.ce});return 'Bardzo się ucieszył. Pamiętaj o ofercie (karta zawodnika → kontrakt).';}addMor(p,-2);return 'Odpowiedział, że uwierzy, gdy zobaczy ofertę.';}],
     ['pozniej','Wrócimy do tematu po sezonie.',p=>ixChance(p,0.5,{loj:0.3,pro:0.1,amb:-0.15,suk:-0.1}),
       (p,q,ok)=>{if(ok){relAdd(p,1);return 'Zgodził się poczekać.';}addMor(p,-6);relAdd(p,-5);return 'Jest niepewny swojej przyszłości i rozczarowany.';}],
     ['nie','Nie planuję przedłużenia twojej umowy.',p=>ixChance(p,0.35,{pro:0.25,oby:0.2}),
       (p,q,ok)=>{p.noExt=S().n;if(ok){addMor(p,-4);return 'Przyjął to profesjonalnie.';}addMor(p,-12);relAdd(p,-10);return 'Bardzo go to dotknęło. Może to być widać na boisku.';}]]},
 oferta:{t:p=>`${p.first} ${p.last}: interesuje się mną inny klub`,
   x:(p,q)=>`„Odezwał się do mnie ${TEAMS[q.club]?TEAMS[q.club].name:'mocny klub'}. To dla mnie szansa na krok w karierze. Chcę, żeby trener wiedział.”`,
   o:[['zostan','Jesteś dla mnie kluczowy — zostajesz.',p=>ixChance(p,0.45,{loj:0.3,oby:0.1,amb:-0.2,suk:-0.2}),
       (p,q,ok)=>{p.role='klu';if(ok){addMor(p,3);relAdd(p,4);return 'Zostaje i czuje się doceniony.';}addMor(p,-12);relAdd(p,-8);p.wantOut=S().n;return 'Jest rozczarowany. Będzie myślał o odejściu.';}],
     ['podwyzka','Zostań — w ciągu miesiąca dostaniesz lepszy kontrakt.',p=>ixChance(p,0.78+(IX().cred-60)/200,{chc:0.1}),
       (p,q,ok)=>{if(ok){addMor(p,4);relAdd(p,3);ixPromise(p,'podwyzka',30,{w:p.wage});return 'Zgodził się zostać. Obiecana podwyżka min. 10% — karta zawodnika → kontrakt.';}addMor(p,-6);return 'Nie wierzy w obietnicę.';}],
     ['puszcze','Puszczę cię, jeśli przyjdzie dobra oferta.',p=>0.92,
       (p,q,ok)=>{if(typeof tlSet==='function')tlSet(p.id,Math.round(pValue(p)*1.1));addMor(p,6);relAdd(p,3);ixPromise(p,'lista',60,{});return 'Docenił to. Jest na liście transferowej — nie zdejmuj go, bo to złamana obietnica.';}]]},
 szatnia:{t:(p,q)=>`${p.first} ${p.last} zgłasza problem w szatni`,
   x:(p,q)=>{const o=PLAYERS[q.oth];return `„${o?o.p.first+' '+o.p.last:'Jeden z chłopaków'} psuje atmosferę — narzeka, że nie gra, i ciągnie innych w dół. Trzeba coś z tym zrobić.”`;},
   o:[['rozmowa','Porozmawiam z nim osobiście.',p=>0.7,
       (p,q,ok)=>{const o=PLAYERS[q.oth]&&PLAYERS[q.oth].p;relAdd(p,3);if(o){const g=ixChance(o,0.55,{kap:-0.2,pro:0.2});if(R()<g){addMor(o,5);relAdd(o,4);o.unh=Math.max(0,(o.unh||0)-2);return `Rozmowa z ${o.last} pomogła — uspokoił się.`;}addMor(o,-3);return `${o.last} wysłuchał, ale nadal jest niezadowolony.`;}return 'Sprawa wyjaśniona.';}],
     ['kara','Ukarzę go karą finansową.',p=>0.75,
       (p,q,ok)=>{const o=PLAYERS[q.oth]&&PLAYERS[q.oth].p;relAdd(p,4);if(o){addMor(o,-10);relAdd(o,-15);o.unh=0;for(const x of myTeam().players)if(x!==o&&(hasT(x,'pro')||hasT(x,'oby')))addMor(x,2);}return 'Szatnia dostała jasny sygnał. Ukarany jest wściekły na trenera.';}],
     ['ignoruj','To nie jest teraz najważniejsze.',p=>ixChance(p,0.25,{pro:0.15}),
       (p,q,ok)=>{relAdd(p,ok?-2:-7);if(!ok)addMor(p,-4);return ok?'Przyjął, choć bez entuzjazmu.':'Uważa, że trener nie panuje nad szatnią.';}]]},
};
// ---- generowanie spraw (codziennie) ----
function ixDaily(d){if(SAVE.team==null||!SAVE.world||!S())return;const X=IX();const ph=S().phase;
  // terminy: sprawy bez odpowiedzi i obietnice
  for(const q of X.q.slice())if((q.r||0)>=1)ixAnswer(q.id,'_ignore',1);
  ixCheckPromises(d);
  if(ph!=='liga'&&ph!=='po')return;if(X.q.length>=3)return;if(X.last&&daysBetween(X.last,d)<6)return;if(R()>0.3)return;
  const t=myTeam();const cand=[];const avg=t.players.reduce((a,p)=>a+rating(p),0)/Math.max(1,t.players.length);
  for(const p of t.players){if(p.jr||p.inj||p.loan)continue;if(p.ixD&&daysBetween(p.ixD,d)<42)continue;const n=S().n;if(X.q.some(q=>q.pid===p.id))continue;
    const sh=plShare(p);if(sh!=null&&(p.pl8||[]).length>=5&&sh<roleExp(p)-0.25&&(hasT(p,'amb')||hasT(p,'kap')||hasT(p,'suk')||pSat(p,t).v<50||ROLE_I[roleOf(p)]<=1)&&!X.pr.some(r=>r.st==='open'&&r.pid===p.id&&r.k==='czas'))cand.push([3,{k:'czas',pid:p.id,sh}]);
    if(p.ce!=null&&p.ce<=S().n&&p.noExt!==S().n&&p.ixK!==n&&!p.tl&&rating(p)>=avg-1&&!X.pr.some(r=>r.st==='open'&&r.pid===p.id))cand.push([hasT(p,'loj')?1:2,{k:'kontrakt',pid:p.id}]);
    if(rating(p)>=avg+4&&!p.tl&&p.ixO!==n&&(hasT(p,'amb')||hasT(p,'suk')||R()<0.25)){const club=ixSuitor(p);if(club!=null)cand.push([1,{k:'oferta',pid:p.id,club}]);}
    if((hasT(p,'lid')||hasT(p,'sta'))&&hRank(p,t)<=3){const o=t.players.find(x=>x!==p&&(x.unh||0)>=3&&(hasT(x,'kap')||hasT(x,'ind')||pSat(x,t).v<35));if(o)cand.push([2,{k:'szatnia',pid:p.id,oth:o.id}]);}}
  if(!cand.length)return;const tot=cand.reduce((a,c)=>a+c[0],0);let r=R()*tot,pick=cand[0][1];for(const c of cand){r-=c[0];if(r<=0){pick=c[1];break;}}
  ixOpen(pick,d);}
function ixSuitor(p){const my=teamStrength(myTeam());const L=TEAMS.filter(t=>t&&t.idx!==SAVE.team&&t.players&&t.players.length&&!t.yt&&teamStrength(t)>my+1);if(!L.length)return null;return L[Math.floor(R()*Math.min(L.length,12))].idx;}
function ixOpen(q,d){const X=IX();const P=PLAYERS[q.pid];if(!P)return;if(q.k==='kontrakt')P.p.ixK=S().n;if(q.k==='oferta')P.p.ixO=S().n;q.id='ix'+Date.now().toString(36)+Math.floor(R()*1e4);q.d=d;X.q.push(q);X.last=d;P.p.ixD=d;
  const p=P.p;sendMail({cat:'klub',from:`${p.first} ${p.last}`,t:IX_T[q.k].t(p,q),s:'Zawodnik prosi o rozmowę. Odpowiedz w zakładce Rozmowy przed następnym meczem.',b:{type:'ix',id:q.id},act:1,lab:'Rozmowy'});}
function ixAnswer(id,opt,auto){const X=IX();const q=X.q.find(x=>x.id===id);if(!q)return;X.q=X.q.filter(x=>x!==q);const P=PLAYERS[q.pid];if(!P)return;const p=P.p;const T=IX_T[q.k];
  let txt;if(opt==='_ignore'){addMor(p,-6);relAdd(p,-8);txt='Trener nie znalazł czasu na rozmowę. Zawodnik czuje się zlekceważony.';}
  else{const o=T.o.find(x=>x[0]===opt);if(!o)return;const ok=R()<o[2](p,q);txt=o[3](p,q,ok);}
  X.log.unshift({d:today(),pid:q.pid,k:q.k,opt,txt});X.log=X.log.slice(0,40);if(auto){news(`😠 ${p.first} ${p.last}: ${txt}`);return;}ui.ixRes={id,txt,pid:q.pid};save();render();}
// ---- obietnice ----
function ixPromise(p,k,days,extra){IX().pr.push(Object.assign({id:'pr'+Date.now().toString(36),pid:p.id,k,d:today(),until:addDays(today(),days),st:'open',n:0,p:0},extra||{}));}
const PR_L={czas:'więcej gry',kontrakt:'nowa oferta kontraktu',podwyzka:'podwyżka min. 10%',lista:'zgoda na odejście (lista transferowa)'};
function prState(pr){const P=PLAYERS[pr.pid];const p=P&&P.p;if(!p||p.tm!==SAVE.team)return 'gone';
  if(pr.k==='kontrakt')return p.ce>pr.ce?'kept':null;if(pr.k==='podwyzka')return p.wage>=pr.w*1.1?'kept':null;
  if(pr.k==='lista')return !p.tl?'broken':null;if(pr.k==='czas')return null;return null;}
function ixCheckPromises(d){const X=IX();for(const pr of X.pr){if(pr.st!=='open')continue;const s=prState(pr);const P=PLAYERS[pr.pid];const p=P&&P.p;
    if(s==='gone'){pr.st='gone';continue;}
    if(s==='kept'){ixKeep(pr,p);continue;}if(s==='broken'){ixBreak(pr,p);continue;}
    if(d>=pr.until){if(pr.k==='lista'){ixKeep(pr,p);continue;}if(pr.k==='czas'){if(pr.n>=2&&pr.p/pr.n>=pr.need)ixKeep(pr,p);else if(pr.n<2)pr.until=addDays(d,14);else ixBreak(pr,p);continue;}ixBreak(pr,p);}}
  X.pr=X.pr.filter(r=>r.st==='open'||daysBetween(r.until,d)<60);}
function ixKeep(pr,p){pr.st='kept';const X=IX();X.cred=Math.min(100,X.cred+4);addMor(p,6);relAdd(p,8);news(`🤝 Dotrzymałeś obietnicy (${PR_L[pr.k]}) wobec ${p.first} ${p.last}. Zaufanie rośnie.`);}
function ixBreak(pr,p){pr.st='broken';const X=IX();X.cred=Math.max(0,X.cred-12);addMor(p,-15);relAdd(p,-20);p.unh=(p.unh||0)+2;const t=myTeam();const big=hRank(p,t)<=4;
  if(big)for(const x of t.players)if(x!==p)addMor(x,-3);
  sendMail({cat:'klub',from:`${p.first} ${p.last}`,t:'Złamana obietnica',s:`Nie dotrzymałeś obietnicy: ${PR_L[pr.k]}.`,b:{type:'text',x:`${p.first} ${p.last} jest bardzo rozczarowany — obiecałeś mu: ${PR_L[pr.k]}, a obietnica nie została dotrzymana.${big?' To jeden z liderów szatni, więc spadło morale całej drużyny.':''} Twoja wiarygodność w szatni spadła — kolejne obietnice będą przyjmowane z większą rezerwą.`},act:0});}
// ---- rozmowa o roli (z karty zawodnika) ----
function roleAsk(pid,k){const P=PLAYERS[pid];if(!P)return;const p=P.p;const cur=ROLE_I[roleOf(p)],nw=ROLE_I[k];if(cur===nw)return;
  const def=ROLE_I[roleDef(p)];let txt;
  if(nw<cur){addMor(p,4);relAdd(p,4);txt=`${p.last} cieszy się z większej roli. Będzie oczekiwał więcej gry.`;}
  else{const ok=R()<ixChance(p,nw<=def?0.75:0.45,{loj:0.2,oby:0.15,pro:0.1,amb:-0.25,suk:-0.15,kap:-0.15});if(ok){addMor(p,-2);txt=`${p.last} przyjął nową rolę ze zrozumieniem.`;}else{addMor(p,-9);relAdd(p,-8);txt=`${p.last} jest niezadowolony ze zmiany roli.`;}}
  p.role=k;ui.roleRes={pid,txt};save();render();}
function roleModal(){const P=PLAYERS[ui.roleP];if(!P){ui.roleP=null;return '';}const p=P.p;const cur=roleOf(p);const sh=plShare(p);
  return `<div class="modal" onclick="if(event.target===this){ui.roleP=null;ui.roleRes=null;render()}"><div class="mcard" style="max-width:560px">
   <div class="row" style="gap:12px;align-items:center">${pFace(p,56)}<div><h2 style="margin:0">Rozmowa o roli</h2><div class="small mut">${esc(p.first+' '+p.last)} · relacja z trenerem ${relOf(p)}/100${sh!=null?` · grał w ${Math.round(sh*100)}% ostatnich kolejek`:''}</div></div></div>
   ${ui.roleRes&&ui.roleRes.pid===p.id?`<div class="card" style="margin:10px 0">${esc(ui.roleRes.txt)}</div>`:''}
   <div style="margin-top:10px">${ROLES.map(([k,l,e,ds])=>`<button class="opt ${cur===k?'on':''}" style="display:block;width:100%;text-align:left;margin:6px 0" ${cur===k?'disabled':''} onclick="roleAsk('${p.id}','${k}')"><b>${l}</b> <span class="small mut">· ${e>0?`oczekuje gry w ok. ${Math.round(e*100)}% meczów`:'bez wymagań co do czasu gry'}</span><div class="small mut">${ds}</div></button>`).join('')}</div>
   <p class="small mut">Proponowana rola wg asystenta: <b>${ROLES[ROLE_I[roleDef(p)]][1]}</b>. Obniżenie roli może go zdenerwować, ale zmniejsza oczekiwania co do gry.</p>
   <div class="row"><span class="sp"></span><button class="ghost" onclick="ui.roleP=null;ui.roleRes=null;render()">Zamknij</button></div></div></div>`;}
// ---- widok „Rozmowy” ----
function ixN(){return SAVE.ix?SAVE.ix.q.length:0;}
function ixView(){const X=IX();const res=ui.ixRes;
  const card=q=>{const P=PLAYERS[q.pid];if(!P)return '';const p=P.p;const T=IX_T[q.k];
    return `<div class="card"><div class="row" style="gap:12px;align-items:flex-start">${pFace(p,64)}<div style="flex:1"><h2 style="margin:0 0 4px">${esc(T.t(p,q))}</h2>
      <div class="small mut">${POS_NAMES[p.pos]} · relacja ${relOf(p)}/100 · morale ${p.mor==null?60:p.mor} · rola: ${ROLES[ROLE_I[roleOf(p)]][1].toLowerCase()} · ${(p.tr||[]).map(k=>TRAITS[k]?TRAITS[k][0]:'').join(', ')}</div>
      <p style="margin:10px 0">${esc(T.x(p,q))}</p>
      ${T.o.map(o=>{const ch=o[2](p,q);const [pl,c]=ixPred(ch);return `<button class="opt" style="display:block;width:100%;text-align:left;margin:6px 0" onclick="ixAnswer('${q.id}','${o[0]}')"><b>${esc(o[1])}</b> <span class="mxpill ${c}" style="margin-left:6px">${pl}</span></button>`;}).join('')}
      <div class="small mut">Odpowiedz przed następnym meczem. Bez odpowiedzi zawodnik poczuje się zlekceważony.</div></div></div></div>`;};
  const prs=X.pr.filter(r=>r.st==='open');const done=X.pr.filter(r=>r.st==='kept'||r.st==='broken').slice(-6).reverse();
  return `${res?`<div class="card" style="border:1px solid var(--acc)"><b>Wynik rozmowy:</b> ${esc(res.txt)} <button class="ghost sm" onclick="ui.ixRes=null;render()">OK</button></div>`:''}
   ${X.q.length?X.q.map(card).join(''):'<div class="card"><h2>Rozmowy</h2><p class="mut">Nikt teraz nie czeka na rozmowę. Zawodnicy sami zgłoszą się, gdy będą mieli sprawę — dostaniesz wiadomość w poczcie.</p></div>'}
   <div class="card"><h2>Obietnice${tipQ('Obietnice są sprawdzane automatycznie. Dotrzymane podnoszą zaufanie zawodnika i Twoją wiarygodność, złamane mocno je obniżają.')}</h2>
    <div class="small" style="margin-bottom:8px">Wiarygodność trenera w szatni: <b>${X.cred}/100</b></div>
    ${prs.length?`<div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Obietnica</th><th class="l">Termin</th><th class="l">Stan</th></tr></thead><tbody>${prs.map(r=>{const P=PLAYERS[r.pid];const p=P&&P.p;return `<tr><td class="l">${p?esc(p.first+' '+p.last):'?'}</td><td class="l">${PR_L[r.k]}</td><td class="l">${fmtShort(r.until)}</td><td class="l small">${r.k==='czas'?`grał ${r.p}/${r.n} kolejek (cel ${Math.round(r.need*100)}%)`:r.k==='lista'?'na liście transferowej':r.k==='podwyzka'?`obecnie ${fmtShort2(p?p.wage:0)}, cel ${fmtShort2(Math.round(r.w*1.1))}`:'czeka na ofertę'}</td></tr>`;}).join('')}</tbody></table></div>`:'<p class="mut small">Brak otwartych obietnic.</p>'}
    ${done.length?`<h3 style="margin-top:10px">Ostatnio rozliczone</h3>${done.map(r=>{const P=PLAYERS[r.pid];return `<div class="small">${r.st==='kept'?'✅':'❌'} ${P?esc(P.p.last):'?'} — ${PR_L[r.k]}</div>`;}).join('')}`:''}</div>
   <div class="card"><h2>Role w zespole</h2><p class="small mut">Rola mówi zawodnikowi, ile gry może oczekiwać. Zmienisz ją w karcie zawodnika („Rozmowa o roli”).</p>
    <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz.</th><th class="l">Rola</th><th>Gra (ost. 8)</th><th>Relacja</th><th>Zadowolenie</th></tr></thead><tbody>${myTeam().players.filter(p=>!p.jr).sort((a,b)=>ROLE_I[roleOf(a)]-ROLE_I[roleOf(b)]).map(p=>{const sh=plShare(p);const e=roleExp(p);const sat=pSat(p).v;
      return `<tr><td class="l"><button class="link pn" onclick="ui.roleP='${p.id}';render()">${esc(p.first[0]+'. '+p.last)}</button></td><td>${p.pos}</td><td class="l">${ROLES[ROLE_I[roleOf(p)]][1]}</td><td style="color:${sh==null?'':sh<e-0.25?'var(--bad,#ef4444)':sh>=e-0.1?'var(--good,#22c55e)':''}">${sh==null?'—':Math.round(sh*100)+'%'}</td><td>${relOf(p)}</td><td>${sat}</td></tr>`;}).join('')}</tbody></table></div></div>`;}
