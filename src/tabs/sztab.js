// akcje z podpowiedzi przedmeczowych: tylko znane funkcje i proste argumenty (liczby, krótkie teksty) — bez eval/new Function
const SAFE_ACTS=new Set(['myTimeout','setDist','setServe','preDistQ','preSet','selSub','setBlk','setTgt','tacSet']);
function safeAct(a){const m=/^\s*([A-Za-z_$][\w$]*)\((.*)\)\s*;?\s*$/.exec(String(a||''));if(!m||!SAFE_ACTS.has(m[1])||typeof window[m[1]]!=='function')return;
  const args=[];const re=/\s*(?:'([^'\\]*)'|(-?\d+(?:\.\d+)?)|(true|false|null))\s*(?:,|$)/y;let i=0;const src=m[2];
  while(i<src.length){re.lastIndex=i;const x=re.exec(src);if(!x)return;args.push(x[1]!=null?x[1]:x[2]!=null?+x[2]:x[3]==='true'?true:x[3]==='false'?false:null);i=re.lastIndex;if(i===x.index)return;}
  return window[m[1]].apply(null,args);}
// ================= OBOWIĄZKI: PRZEKAZANIE ZADAŃ SZTABOWI =================
// SAVE.dlg = {on:{klucz:1}, quiet:1, log:[{d,t}], wk:data ostatniego podsumowania}
const DLG=[
 ['press','Konferencje prasowe','asy','Asystent chodzi na konferencje i odpowiada neutralnie — bez kary dla relacji z mediami, ale też bez korzyści.'],
 ['talks','Rozmowy z zawodnikami','asy','Asystent odpowiada na sprawy zawodników. Nigdy nie składa obietnic ani nie wystawia nikogo na listę transferową. Słabszy asystent rozmawia mniej skutecznie.'],
 ['prep','Odprawa przed meczem','sta','Analityk sam stosuje rady z odprawy (zagrywka, blok, rozegranie) przed każdym meczem.'],
 ['train','Plan treningowy','asy','Asystent układa plan tygodnia pod terminarz i zmęczenie (tryb „asystent” w Treningu).'],
 ['contr','Przedłużanie kontraktów','fin','Dyrektor przedłuża ważnych zawodników (ocena co najmniej średnia drużyny, do 32 lat) w granicach budżetu płacowego. Słabszych puszcza po sezonie.'],
 ['infra','Rozbudowa obiektów','fin','Dyrektor sam rozbudowuje obiekty, ale tylko z pieniędzy ponad bezpieczne saldo (próg nadwyżki ligi). Kolejność: centrum treningowe, centrum medyczne, hala, odnowa, akademia, siedziba, sklep.'],
 ['spons','Sponsorzy','fin','Dyrektor podpisuje oferty sponsorów (tytularnego, gdy go brak). Nigdy nie zrywa umów.'],
 ['agents','Kontakty agentów','fin','Dyrektor odpowiada agentom: zgadza się na rozmowy o kontraktach ważnych zawodników, inne prośby grzecznie odrzuca.'],
 ['scout','Przydziały skautów','sk','Skaut sam rozpoczyna przydziały pod najsłabsze pozycje w kadrze, gdy ma wolne miejsce.'],
 ['trans','Transfery (uzupełnianie kadry)','sk','W oknie transferowym główny skaut (jak dyrektor sportowy) uzupełnia brakujące pozycje (najpierw wolni zawodnicy, potem tańsi rezerwowi z innych klubów), a gdy kadra jest kompletna — wzmacnia najsłabszą pozycję w podstawowym składzie (min. +3 do oceny). Mieści się w budżetach, kupuje najwyżej 3 zawodników na okno (w tym 2 wzmocnienia) i nikogo nie sprzedaje. Słabszy skaut gorzej ocenia kandydatów.'],
 ['jr','Juniorzy','jr','Trener juniorów promuje do pierwszej drużyny gotowych juniorów (gdy jest miejsce) i zwalnia 20-latków bez perspektyw.'],
];
function DL(){if(!SAVE.dlg){SAVE.dlg={on:{},quiet:0,log:[],wk:null};try{if(ensTrn().mode==='asy')SAVE.dlg.on.train=1;}catch(e){}}return SAVE.dlg;}
function dlgWho(k){const r=DLG.find(x=>x[0]===k);if(!r)return null;if(r[2]==='kier')return {first:'',last:typeof kierName==='function'?kierName():'Kierownik drużyny',skill:12,role:'kier'};if(r[2]==='sk')return allScouts().length?allScouts().slice().sort((a,b)=>b.skill-a.skill)[0]:null;return SAVE.staff&&SAVE.staff[r[2]]||null;}
function dlg(k){return !!DL().on[k]&&!!dlgWho(k);}
function dlgSk(k){const w=dlgWho(k);return w?w.skill:0;}
function dlgNote(t){const D=DL();D.log.unshift({d:today(),t});D.log=D.log.slice(0,60);if(!D.quiet)news('🧑‍💼 '+t);}
function dlgSet(k,v){DL().on[k]=v?1:0;if(k==='train'&&typeof ensTrn==='function'){ensTrn().mode=v?'asy':'own';}save();render();}
// wykonanie akcji bez przerysowywania ekranu (dzieje się w trakcie przewijania dni)
function quiet(fn){const r=window.render,s=window.save;window.render=()=>{};window.save=()=>{};try{return fn();}finally{window.render=r;window.save=s;}}
// ---- konferencje ----
{const _pf=mdPreFor;mdPreFor=function(c){const P=_pf(c);if(P&&dlg('press'))for(const x of P.qs)if(!x.ans){x.ans='_asy';x.res='Konferencję poprowadził asystent.';}return P;};}
{const _am=mdAfterMatch;mdAfterMatch=function(m,c){_am(m,c);const M=SAVE.md;if(M&&M.post&&dlg('press')){for(const x of M.post.qs)if(!x.ans){x.ans='_asy';x.res='Na konferencji po meczu był asystent.';}}};}
// ---- rozmowy z zawodnikami ----
const IX_NOPROM=new Set(['prom','podwyzka','puszcze','lista']);
function dlgTalk(q){const P=PLAYERS[q.pid];if(!P)return;const p=P.p;const T=IX_T[q.k];const opts=T.o.filter(o=>!IX_NOPROM.has(o[0]));if(!opts.length)return;
  const pen=(12-dlgSk('talks'))/40;const best=opts.map(o=>[o,o[2](p,q)-pen]).sort((a,b)=>b[1]-a[1])[0];
  const X=IX();X.q=X.q.filter(x=>x!==q);const ok=R()<clamp(best[1],0.05,0.95);const txt=best[0][3](p,q,ok);X.log.unshift({d:today(),pid:q.pid,k:q.k,opt:best[0][0],txt});
  dlgNote(`Asystent porozmawiał z ${p.first} ${p.last} („${best[0][1]}”): ${txt}`);}
{const _io=ixOpen;ixOpen=function(q,d){if(dlg('talks')){const X=IX();const P=PLAYERS[q.pid];if(!P)return;q.id='ix'+Date.now().toString(36)+Math.floor(R()*1e4);q.d=d;X.q.push(q);X.last=d;P.p.ixD=d;if(q.k==='kontrakt')P.p.ixK=S().n;if(q.k==='oferta')P.p.ixO=S().n;dlgTalk(q);return;}return _io(q,d);};}
// ---- odprawa ----
function dlgPrep(d){if(!dlg('prep'))return;const e=nextEvent();const c=myNext();if(!e||!c||c.kind==='spar'||c.kind==='nt')return;if(daysBetween(d,e.d)>1||daysBetween(d,e.d)<0)return;const key=e.d+mdKey(c);const D=DL();if(D.prepK===key)return;D.prepK=key;
  const op=c.h===SAVE.team?c.a:c.h;let L=[];try{L=preTips(op).filter(x=>x.btn&&x.act);}catch(e){}if(!L.length)return;
  window._dlgPrep=1;try{quiet(()=>{for(const x of L){try{safeAct(x.act);}catch(e){}}});}finally{window._dlgPrep=0;}dlgNote(`Analityk ustawił taktykę na ${TEAMS[op].name}: ${L.map(x=>x.t.replace(/\.$/,'')).join('; ')}.`);}
// ---- kontrakty ----
function dlgContracts(d){if(!dlg('contr'))return;const s=S();if(!s)return;const md=d.slice(5);if(!(md==='02-01'||md==='05-01'))return;const t=myTeam();const pl=t.players.filter(p=>!p.jr&&!p.loan);
  const avg=pl.reduce((a,p)=>a+rating(p),0)/Math.max(1,pl.length);const rank=pl.slice().sort((a,b)=>rating(b)-rating(a));const top=new Set(rank.slice(0,12).map(p=>p.id));
  const exp=rank.filter(p=>p.ce!=null&&p.ce<=s.n&&p.noExt!==s.n);const stay=pl.length-exp.length;
  // kto jest potrzebny: najlepsza dwunastka albo zawodnik, bez którego zabraknie ludzi na pozycji; wiek do 32 (do 34 dla wyraźnie lepszych od średniej)
  const need=p=>{const left=pl.filter(x=>x.pos===p.pos&&x!==p&&!(x.ce!=null&&x.ce<=s.n)).length;return left<(POS_STD[p.pos]||1);};
  let kept=0;for(const p of exp){const ok=(top.has(p.id)||rating(p)>=avg-2||need(p))&&(p.age<=32||(p.age<=34&&rating(p)>=avg+3));
    if(ok){const w=wageNeeded(p);const dw=w-(p.wage||0);if(dw>0&&dw>budLeft().wg){dlgNote(`Dyrektor nie przedłużył ${p.first} ${p.last}: brak miejsca w budżecie płacowym (potrzeba ${fmt(w)}).`);continue;}
      dlgRenew(p,1);kept++;dlgNote(`Dyrektor przedłużył kontrakt: ${p.first} ${p.last} do ${ceDate(p.ce)} (${fmt(w)}/rok).`);}
    else if(md==='05-01'&&stay+kept>=SQUAD_MIN+2){p.noExt=s.n;dlgNote(`Dyrektor nie przedłuży umowy ${p.first} ${p.last} (odejdzie po sezonie).`);}}}
// ---- transfery: uzupełnianie brakujących pozycji ----
function dlgTransfers(d){if(!dlg('trans')||!windowOpen())return;const D=DL();const s=S();if(D.trLast&&daysBetween(D.trLast,d)<3)return;D.trLast=d;
  D.trN=D.trN||{};if((D.trN[s.n]||0)>=3)return;const t=myTeam();const mine=t.players.filter(p=>!p.jr&&!(p.loan&&p.loan.from===SAVE.team&&p.tm!==SAVE.team));if(t.players.length>=SQUAD_MAX)return;
  const need=Object.keys(POS_STD).filter(k=>mine.filter(p=>p.pos===k).length<POS_STD[k]).sort((a,b)=>(mine.filter(p=>p.pos===a).length-POS_STD[a])-(mine.filter(p=>p.pos===b).length-POS_STD[b]));const upg=!need.length;let cut=null;if(upg){if((D.trU&&D.trU[s.n]||0)>=(SAVE.myPromo===s.n?(LG_LV[myLg()]===0?6:5):3))return;
    // kadra pełna: zwalniamy miejsce, oddając najsłabszego zmiennika (poza najlepszą dwunastką, z pozycji z nadwyżką)
    if(t.players.length>=SQUAD_MAX-1){const rk=mine.slice().sort((a,b)=>rating(b)-rating(a));const t12=new Set(rk.slice(0,12).map(p=>p.id));
      cut=rk.slice().reverse().find(p=>!t12.has(p.id)&&!p.loan&&mine.filter(x=>x.pos===p.pos).length>POS_STD[p.pos]&&!(typeof newSign==='function'&&newSign(p))&&releaseCost(p)<=Math.max(60000,SAVE.fin.bal*0.03));if(!cut)return;}
    // kadra kompletna: szukamy wzmocnienia na pozycji, gdzie podstawowy skład jest najsłabszy
    const ST={R:1,A:1,P:2,S:2,L:1};const wk=Object.keys(ST).map(k=>{const r=mine.filter(p=>p.pos===k).map(p=>rating(p)).sort((a,b)=>b-a);return {k,v:r[ST[k]-1]||0};}).sort((a,b)=>a.v-b.v);
    need.push(...wk.slice(0,SAVE.myPromo===s.n?3:2).map(x=>x.k));D._upBar={};const lr=SAVE.myPromo===s.n?lgRef(myLg())-2:0;for(const x of wk)D._upBar[x.k]=Math.max(x.v+3,Math.min(lr,x.v+8));}
  const top=mine.map(p=>rating(p)).sort((a,b)=>b-a).slice(0,12);const avg=top.reduce((a,b)=>a+b,0)/Math.max(1,top.length);const sk=dlgSk('trans');const myRep=SAVE.ai[SAVE.team].rep;const miss=need.reduce((a,k)=>a+POS_STD[k]-mine.filter(p=>p.pos===k).length,0);const maxW=budLeft().wg*(miss>1?Math.max(0.35,1/miss*1.3):1);
  for(const pos of need){const posR=mine.filter(p=>p.pos===pos).map(p=>rating(p));const bar=upg?D._upBar[pos]:Math.min(avg-6,posR.length?Math.max(...posR)-2:avg-6);
    const cands=[];for(const p of W().players){if(p.pos!==pos||p.jr||p.retired||p.inj>0||p.tm===SAVE.team||p.loan||p.age<19||p.age>32)continue;
      if(p.tm>=0){if(isYT(p.tm)||(isStarter(p)&&!p.tl)||TEAMS[p.tm].players.length<=SQUAD_MIN+1||SAVE.ai[p.tm].rep>myRep+15)continue;}
      const est=rating(p)+(R()-0.5)*(20-sk)/2;if(est<bar)continue;const fee=p.tm<0?0:Math.round(pValue(p)*(p.tl?1:1.15)/10000)*10000;const w=wageNeeded(p);
      if(fee>0&&(budCan('tr',fee)||SAVE.fin.bal-fee<0))continue;if(w>(upg?budLeft().wg*(SAVE.myPromo===s.n?1:0.8)+(cut?cut.wage||0:0):maxW))continue;if(cut&&rating(p)<rating(cut)+6)continue;cands.push({p,est,fee,w,sc:est+(p.tm<0?3:0)-fee/250000});}
    if(!cands.length){if(upg)continue;if(!D.trMiss||D.trMiss[pos]!==s.n){D.trMiss=D.trMiss||{};D.trMiss[pos]=s.n;dlgNote(`Skaut nie znalazł nikogo na pozycję ${POS_NAMES[pos]||pos}, kto zmieściłby się w budżetach i podniósł poziom kadry.`);}continue;}
    cands.sort((a,b)=>b.sc-a.sc);const c=cands[0];const p=c.p;const from=p.tm;
    if(c.fee){money(-c.fee,'Transfery');SAVE.ai[from].bud+=c.fee;finLog(`Zakup (skaut): ${p.first} ${p.last} (${TEAMS[from].short})`,-c.fee);}
    if(cut){const rc=releaseCost(cut);money(-rc,'Odprawy');finLog(`Rozwiązanie kontraktu (skaut): ${cut.first} ${cut.last}`,-rc);movePlayer(cut,-1);cut.wage=0;cut.ce=0;dlgNote(`Dyrektor rozwiązał kontrakt z ${cut.first} ${cut.last} (ocena ${rating(cut)}), żeby zrobić miejsce w kadrze — odprawa ${fmt(rc)}.`);}
    if(typeof budWageOver==='function')budWageOver(c.w);movePlayer(p,SAVE.team);p.wage=c.w;p.ce=contractEndFor(prefYears(p));delete p.tl;try{achEv('sign');}catch(e){}
    D.trN[s.n]=(D.trN[s.n]||0)+1;if(upg){D.trU=D.trU||{};D.trU[s.n]=(D.trU[s.n]||0)+1;}dlgNote(`Skaut sprowadził ${p.first} ${p.last} (${pos}, ${p.age} l., ocena ${rating(p)}) ${from>=0?`z ${TEAMS[from].name} za ${fmt(c.fee)}`:'jako wolnego zawodnika'} — kontrakt ${fmt(c.w)}/rok do ${ceDate(p.ce)}.`);
    news(`✍️ ${p.first} ${p.last} dołącza do zespołu${from>=0?` z ${TEAMS[from].name} za ${fmt(c.fee)}`:' jako wolny zawodnik'} (transfer przeprowadził skaut).`);break;}}
// ---- sponsorzy ----
function dlgSponsors(){if(!dlg('spons'))return;const s=SPN();const n0=s.act.length;quiet(()=>{for(const k in s.off)for(const o of (s.off[k]||[]).slice()){if(k==='tit'&&s.act.some(c=>c.cat==='tit'))continue;signSponsor(k,o.id);}});
  const n=s.act.length-n0;if(n>0){ui.spMsg=null;dlgNote(`Dyrektor podpisał ${n} ${n===1?'umowę sponsorską':n<5?'umowy sponsorskie':'umów sponsorskich'}. Przychód od sponsorów: ${fmt(spMonthly())}/mies.`);}}
{const _sm=sponsorsMonth;sponsorsMonth=function(d){const r=_sm(d);try{dlgSponsors();}catch(e){console.error(e);}return r;};}
// ---- agenci ----
{const _ao=agOpen;agOpen=function(q){if(!dlg('agents'))return _ao(q);const X=AG();q.id='ag'+Date.now().toString(36)+Math.floor(R()*1e4);q.d=today();X.q.push(q);X.last=today();const P=PLAYERS[q.pid];if(!P)return;const p=P.p;
  const avg=myTeam().players.reduce((a,x)=>a+rating(x),0)/Math.max(1,myTeam().players.length);const key=rating(p)>=avg&&p.age<=32;
  X.q=X.q.filter(x=>x!==q);if(key&&(q.k==='pod'||q.k==='kon')){const r=dlgRenew(p,q.k==='pod'?1.1:1);const txt=r?`przedłużył kontrakt do ${ceDate(p.ce)} (${fmt(p.wage)}/rok)`:'brak miejsca w budżecie płacowym — agent jest niezadowolony';if(!r){addMor(p,-4);p.raiseReq=Math.min(0.15,(p.raiseReq||0)+0.05);}X.log.unshift({d:today(),pid:q.pid,k:q.k,txt});dlgNote(`Dyrektor rozmawiał z agentem ${agName(p)} (${p.last}): ${txt}.`);return;}
  const opt=q.k==='kl'?'nie':q.k==='pod'?'pozn':'nie';const o=AGQ[q.k].o.find(x=>x[0]===opt);const ok=R()<o[2](p,q);const txt=o[3](p,q,ok);X.log.unshift({d:today(),pid:q.pid,k:q.k,txt});
  dlgNote(`Dyrektor odpowiedział agentowi ${agName(p)} (${p.last}): „${o[1]}” — ${txt}`);};}
function dlgRenew(p,mult){const w=round5k(Math.max(wageNeeded(p),(p.wage||0)*(mult||1)));const dw=w-(p.wage||0);if(dw>0&&dw>budLeft().wg)return false;if(typeof budWageOver==='function')budWageOver(dw);p.wage=w;p.ce=Math.max(p.ce||0,contractEndFor(prefYears(p)));p.raiseReq=0;return true;}
// ---- skauting ----
function dlgScout(){if(!dlg('scout'))return;const s=SC();for(const sc of scAll()){if(scoutLoad(sc)>=scoutSlots(sc))continue;if(s.tasks.some(t=>t.type==='asg'&&t.sid===sc.id))continue;
  const t=myTeam();const pos=['R','A','P','S','L'].map(k=>{const r=myPosR(k);const need=k==='P'||k==='S'?1:0;return [k,(r[need]||0)];}).sort((a,b)=>a[1]-b[1])[0][0];
  const reg=sc.reg;const tk={id:'tk'+(s.nid++),type:'asg',sid:sc.id,reg,pos,maxAge:40,lvl:'rot',start:today(),until:addDays(today(),60),next:addDays(today(),asgGap(sc,reg)),found:0};s.tasks.push(tk);
  dlgNote(`Skaut ${sc.first[0]}. ${sc.last} rozpoczął przydział: ${POS_NAMES[pos].toLowerCase()} (${REG_N[reg]}, 2 mies.) — najsłabsza pozycja w kadrze.`);}}
// ---- juniorzy ----
function dlgJuniors(d){if(!dlg('jr'))return;if(!d.endsWith('-07-15')&&!d.endsWith('-01-15'))return;const t=myTeam();const J=juniorsOf(SAVE.team);
  const minR=Math.min(...myTeam().players.filter(p=>!p.jr).map(p=>rating(p)));
  if(J.some(p=>!PLAYERS[p.id]))rebuildIndex();for(const p of J.slice().sort((a,b)=>rating(b)-rating(a))){if(t.players.length>=SQUAD_MAX)break;const sr=myTeam().players.filter(x=>!x.jr).map(x=>rating(x)).sort((a,b)=>b-a);const av=sr.slice(0,12).reduce((a,b)=>a+b,0)/Math.max(1,Math.min(12,sr.length));if(rating(p)>=minR-1&&p.age>=17&&(t.players.length<SQUAD_MIN+2||rating(p)>=av-5)){quiet(()=>promote(p.id));dlgNote(`Trener juniorów awansował ${p.first} ${p.last} (ocena ${rating(p)}) do pierwszej drużyny.`);}}
  if(d.endsWith('-07-15'))for(const p of agedOut()){if((p.pot||rating(p))<minR+2){p.tm=-1;p.jr=false;p.wage=0;dlgNote(`Trener juniorów rozstał się z ${p.first} ${p.last} (20 lat, bez perspektyw na pierwszą drużynę).`);}}}
// ---- codziennie ----
function dlgDaily(d){if(SAVE.team==null||!SAVE.world||!S())return;try{dlgPrep(d);dlgContracts(d);dlgScout();dlgJuniors(d);dlgTransfers(d);}catch(e){console.error(e);}
  const D=DL();if(D.quiet&&(!D.wk||daysBetween(D.wk,d)>=7)){const L=D.log.filter(x=>D.wk?x.d>D.wk:true);D.wk=d;if(L.length)sendMail({cat:'klub',from:'Sztab szkoleniowy',t:`Podsumowanie tygodnia sztabu (${L.length})`,s:L[0].t.slice(0,90),b:{type:'text',x:'Co sztab zrobił za Ciebie w tym tygodniu:\n\n• '+L.map(x=>x.t).join('\n• ')},lab:'Sztab'});}}
// ---- widok ----
function dlgCard(){const D=DL();return `<div class="card"><h2>Obowiązki${tipQ('Przekaż zadania członkom sztabu. Jeśli na danym stanowisku nikogo nie ma, obowiązek wraca do Ciebie. Lepszy pracownik działa skuteczniej.')}</h2>
  <div class="tw"><table><thead><tr><th class="l">Obowiązek</th><th class="l">Kto się zajmuje</th><th class="l">Co robi</th></tr></thead><tbody>${DLG.map(([k,l,r,ds])=>{const w=dlgWho(k);const on=!!D.on[k];
   return `<tr><td class="l"><b>${l}</b></td><td class="l nw"><select onchange="dlgSet('${k}',+this.value)"><option value="0" ${on&&w?'':'selected'}>Ja</option>${w?`<option value="1" ${on?'selected':''}>${esc(w.first[0]+'. '+w.last)} (${w.skill}/20)</option>`:''}</select>${w?'':`<div class="small mut">${ROLE_N[r]} — brak w sztabie</div>`}</td><td class="l small mut" style="white-space:normal;min-width:260px">${esc(ds)}</td></tr>`;}).join('')}</tbody></table></div>
  <label class="mopt" style="margin-top:8px"><input type="checkbox" ${D.quiet?'checked':''} onchange="DL().quiet=this.checked?1:0;save();render()"> Zamiast pojedynczych powiadomień wysyłaj jedno podsumowanie tygodnia</label>
  ${D.log.length?`<details style="margin-top:8px"><summary class="link">Ostatnie działania sztabu (${D.log.length})</summary>${D.log.slice(0,15).map(x=>`<div class="small" style="margin:3px 0"><span class="mut">${fmtShort(x.d)}</span> ${esc(x.t)}</div>`).join('')}</details>`:''}</div>`;}
{const _sv=staffView;staffView=function(){return dlgCard()+_sv();};}
