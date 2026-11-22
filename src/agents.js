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
