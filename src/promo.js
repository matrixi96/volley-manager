// ================= BENIAMINEK: pierwszy sezon po awansie Twojego klubu =================
// A — zarząd ma łagodniejsze oczekiwania: cel to utrzymanie, w trakcie sezonu nie zwalnia, a spadek
//     w pierwszym sezonie po awansie nie kończy współpracy.
// B — okno beniaminka: zawodnicy z klubów nowej ligi tańsi o 15% i chętniej przychodzą,
//     skaut z przekazanymi transferami ma zgodę na więcej wzmocnień (w Ekstralidze 6).
// C — drużyna „na fali po awansie”: wyższe morale na start i większy atut własnej hali w pierwszej połowie sezonu.
function isPromoSeason(){const s=S();return !!(s&&SAVE.myPromo===s.n);}
function promoTop(){return isPromoSeason()&&LG_LV[myLg()]===0;}
let PROMO_AI=false;// w trakcie transferów komputera zniżka nie obowiązuje
// A: cel na sezon i ochrona posady
{const _gf=goalFor;goalFor=function(ti){const g=_gf.apply(this,arguments);try{if(ti===SAVE.team&&isPromoSeason()){const n=lgIds(lgOf(ti)).length;return Math.max(g,n-2);}}catch(e){}return g;};}
{const _fc=fireCoach;fireCoach=function(why){try{if(isPromoSeason()&&!SAVE.ownClub){SAVE.board.conf=Math.max(SAVE.board.conf||0,25);news('👔 Zarząd daje beniaminkowi czas: mimo słabych wyników zostajesz na stanowisku do końca sezonu.');return;}
  const h=SAVE.coach&&SAVE.coach.hist;const last=h&&h[h.length-1];if(last&&SAVE.myPromo===last.n&&!SAVE.ownClub&&/nieudanym sezonie/.test(why||'')){SAVE.board.conf=Math.max(SAVE.board.conf||0,30);news('👔 Zarząd: spadek w pierwszym sezonie po awansie nie przekreśla Twojej pracy. Dostajesz kolejną szansę.');return;}}catch(e){console.error(e);}
  return _fc.apply(this,arguments);};}
// B: tańsze transfery z klubów nowej ligi i większa chęć przejścia
{const _ap=askingPrice;askingPrice=function(p){const v=_ap.apply(this,arguments);try{if(!PROMO_AI&&isPromoSeason()&&p&&p.tm>=0&&p.tm!==SAVE.team&&lgOf(p.tm)===myLg())return Math.round(v*0.85/10000)*10000;}catch(e){}return v;};}
{const _ao=aiOffseason;aiOffseason=function(){PROMO_AI=true;try{return _ao.apply(this,arguments);}finally{PROMO_AI=false;}};}
if(typeof wantsMove==='function'){const _wm=wantsMove;wantsMove=function(p){try{if(isPromoSeason()&&p&&p.tm>=0&&lgOf(p.tm)===myLg()&&SAVE.ai[SAVE.team]){const a=SAVE.ai[SAVE.team];const r0=a.rep;a.rep=r0+12;try{return _wm.apply(this,arguments);}finally{a.rep=r0;}}}catch(e){}return _wm.apply(this,arguments);};}
// C: atut własnej hali w pierwszej połowie sezonu beniaminka
{const _cm=clubMods;clubMods=function(ti){const m=_cm.apply(this,arguments);try{if(ti===SAVE.team&&isPromoSeason()){const s=S();const half=s.rounds?Math.ceil(s.rounds.length/2):11;if(s.phase!=='liga'||s.round<half)return Object.assign({},m,{hb:m.hb+0.008});}}catch(e){}return m;};}
// po awansie: morale w górę i informacja od zarządu
{const _alm=applyLeagueMoves;applyLeagueMoves=function(old){const up=old&&old.moves&&old.moves.some(x=>x.i===SAVE.team&&x.up);const r=_alm.apply(this,arguments);
  try{if(up&&SAVE.myPromo===old.n+1){for(const p of myTeam().players)addMor(p,8);
    if(typeof sendMail==='function')sendMail({cat:'klub',from:'Zarząd klubu',t:'Pierwszy sezon w nowej lidze',s:'Celem jest utrzymanie — zarząd daje Ci czas',b:{type:'text',x:`Jako beniaminek nie musimy niczego wygrywać. Celem jest utrzymanie, a nawet spadek w tym sezonie nie zakończy naszej współpracy.\n\nDo końca okna transferowego zawodnicy z klubów nowej ligi są dla nas o 15% tańsi i chętniej do nas przechodzą — to dobry moment na wzmocnienia.\n\nDrużyna jest na fali po awansie: wyższe morale i mocniejszy atut własnej hali w pierwszej połowie sezonu.`},lab:'Zarząd'});}}catch(e){console.error(e);}return r;};}
// ================= SPONSORZY I BILETY PO AWANSIE / SPADKU =================
// Bilety: kibice w wyższej lidze akceptują wyższe ceny (Ekstraliga +30%, 1. liga +10% względem najniższej).
const LG_TIX=[1.3,1.1,1];
{const _rp=refPrice;refPrice=function(ti){const v=_rp.apply(this,arguments);try{if(ti!=null&&SAVE.lg)return v*(LG_TIX[LG_LV[lgOf(ti)]]||1);}catch(e){}return v;};}
// Sponsorzy przy zmianie ligi:
//  awans — każdy sponsor albo zgadza się płacić więcej (połowa różnicy między ligami), albo zostaje przy starej stawce;
//          przez 45 dni każdą umowę można rozwiązać za porozumieniem stron, bez kary (sponsor nie chce płacić więcej
//          albo klub ma lepszą ofertę od innego sponsora);
//  spadek — część sponsorów sama rozwiązuje umowę za porozumieniem stron, pozostali obniżają stawkę
//          (połowa różnicy między ligami); klub przez 45 dni może rozwiązać umowę bez kary, jeśli dostanie lepszą ofertę.
function spFree(c){return !!(c&&c.free&&today()<=c.free.until);}
function spMove(oldLg,newLg,up){const s=SPN();if(!s.act.length&&!up)return;const r=(LG_ECO[newLg]||1)/(LG_ECO[oldLg]||1);const until=addDays(today(),45);const rows=[];
  for(const c of s.act.slice()){const m0=c.m;
    if(up){const pAcc=c.t>=4?0.65:c.t>=3?0.5:0.4;const ok=R()<pAcc;if(ok)c.m=Math.round(m0*(1+(r-1)*0.5)/1000)*1000;c.free={until,why:ok?'awans — klub może szukać lepszej oferty':'sponsor nie chce płacić więcej po awansie'};rows.push({id:c.id,n:c.n,m0,m1:c.m,st:ok?'raise':'keep'});}
    else{const pLeave=c.t>=4?0.4:c.t>=3?0.25:0.15;if(R()<pLeave){spBudRemove(c);s.act=s.act.filter(x=>x!==c);rows.push({id:c.id,n:c.n,m0,m1:0,st:'left'});news(`🤝 Sponsor ${c.n} rozwiązał umowę za porozumieniem stron po spadku klubu.`);continue;}
      c.m=Math.round(m0*(1-(1-r)*0.5)/1000)*1000;c.free={until,why:'spadek — sponsor obniżył stawkę'};rows.push({id:c.id,n:c.n,m0,m1:c.m,st:'cut'});}}
  try{genSpOffers();}catch(e){console.error(e);}
  if(typeof sendMail==='function')sendMail({cat:'fin',from:'Dział marketingu',t:up?'Sponsorzy po awansie':'Sponsorzy po spadku',s:up?'Nowe warunki umów i lepsze oferty':'Część sponsorów obniża stawki',b:{type:'spmove',up,rows,until},act:1,lab:'Sponsorzy'});}
function spFreeEnd(id){const s=SPN();const c=s.act.find(x=>x.id===id);if(!c||!spFree(c))return;if(ui.confirm!=='spf'+id){ui.confirm='spf'+id;render();return;}ui.confirm=null;
  spBudRemove(c);s.act=s.act.filter(x=>x!==c);news(`🤝 Umowa ze sponsorem ${c.n} rozwiązana za porozumieniem stron (bez kary).`);ui.spMsg={ok:true,t:`Umowa z ${c.n} rozwiązana za porozumieniem stron — bez kary.`};save();render();}
// rozwiązanie za porozumieniem nie kosztuje i nie psuje opinii u innych sponsorów (także przy podpisie nowego tytularnego)
{const _sp=spPenalty;spPenalty=function(c){return spFree(c)?0:_sp.apply(this,arguments);};}
{const _bs=breakSponsor;breakSponsor=function(id,silent){const s=SPN();const c=s.act.find(x=>x.id===id);if(c&&spFree(c)){if(!silent)return spFreeEnd(id);spBudRemove(c);s.act=s.act.filter(x=>x!==c);news(`🤝 Umowa ze sponsorem ${c.n} rozwiązana za porozumieniem stron (bez kary).`);return true;}return _bs.apply(this,arguments);};}
function spFreeCard(){const L=SPN().act.filter(spFree);if(!L.length)return '';
  return `<div class="card"><h2>Umowy do rozwiązania za porozumieniem stron</h2><p class="small mut">Po zmianie ligi do ${fmtDMY(L[0].free.until)} możesz rozwiązać te umowy bez kary — na przykład gdy dostaniesz lepszą ofertę od innego sponsora. Nowe oferty są już na poziomie nowej ligi.</p>
   <div class="tw"><table><thead><tr><th class="l">Sponsor</th><th class="l">Powód</th><th>Miesięcznie</th><th></th></tr></thead><tbody>${L.map(c=>`<tr><td class="l">${esc(c.n)}</td><td class="l small mut">${esc(c.free.why)}</td><td>${fmt(c.m)}</td><td><button class="btn sm" onclick="spFreeEnd('${c.id}')">${ui.confirm==='spf'+c.id?'Na pewno? Rozwiąż bez kary':'Rozwiąż za porozumieniem'}</button></td></tr>`).join('')}</tbody></table></div></div>`;}
{const _sv=sponsorView;sponsorView=function(){return spFreeCard()+_sv.apply(this,arguments);};}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type!=='spmove')return _mb.apply(this,arguments);
  const st={raise:'zgodził się płacić więcej',keep:'nie chce płacić więcej — możesz rozwiązać umowę bez kary',cut:'obniżył stawkę — możesz rozwiązać umowę bez kary',left:'rozwiązał umowę za porozumieniem stron'};
  return `<p class="mtext">${b.up?'Po awansie rozmawialiśmy ze wszystkimi sponsorami. Nowe oferty od innych firm są już na poziomie nowej ligi — jeśli któraś jest lepsza, obecną umowę możesz rozwiązać za porozumieniem stron, bez kary.':'Po spadku sponsorzy renegocjują umowy. Jeśli dostaniesz lepszą ofertę, obecną umowę możesz rozwiązać za porozumieniem stron, bez kary.'} Termin: do ${fmtDMY(b.until)}.</p>
   ${b.rows.length?`<div class="tw"><table><thead><tr><th class="l">Sponsor</th><th>Było</th><th>Jest</th><th class="l">Decyzja sponsora</th></tr></thead><tbody>${b.rows.map(r=>`<tr><td class="l">${esc(r.n)}</td><td>${fmt(r.m0)}</td><td>${r.m1?fmt(r.m1):'—'}</td><td class="l small">${st[r.st]}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mtext">Klub nie miał aktywnych umów sponsorskich.</p>'}
   <div class="row" style="margin-top:10px"><button class="btn" onclick="go('sponsorzy')">Sponsorzy i nowe oferty →</button></div>`;};}
// bilety: dział marketingu dopasowuje ceny do nowej ligi
function tixMove(oldLg,newLg){const e=ECO();const f=(LG_TIX[LG_LV[newLg]]||1)/(LG_TIX[LG_LV[oldLg]]||1);if(Math.abs(f-1)<0.01)return;
  const base=refPrice(SAVE.team)/f;const near=Math.abs(e.tix-base)<=Math.max(3,base*0.1);const old=e.tix;
  if(near){e.tix=Math.max(5,Math.round(e.tix*f));if(e.kar){e.kar.n=Math.round(e.kar.n*f/5)*5;e.kar.u=Math.round(e.kar.u*f/5)*5;}if(e.vipP)e.vipP=Math.round(e.vipP*f/5)*5;}
  if(typeof sendMail==='function')sendMail({cat:'fin',from:'Dział marketingu',t:f>1?'Ceny biletów po awansie':'Ceny biletów po spadku',s:near?`Bilet: ${old} → ${e.tix} zł`:'Propozycja nowych cen',b:{type:'text',x:near?`Kibice w ${f>1?'wyższej':'niższej'} lidze akceptują ${f>1?'wyższe':'niższe'} ceny. Zmieniliśmy cenę biletu z ${old} zł na ${e.tix} zł, a karnety i lożę VIP proporcjonalnie. Możesz to zmienić w zakładce Infrastruktura → Dzień meczowy.`:`Twoja cena biletu (${e.tix} zł) jest inna niż typowa, więc jej nie ruszaliśmy. Typowa cena w nowej lidze to ok. ${Math.round(refPrice(SAVE.team))} zł — sprawdź Infrastruktura → Dzień meczowy.`},lab:'Finanse'});}
{const _alm=applyLeagueMoves;applyLeagueMoves=function(old){const mv=old&&old.moves&&old.moves.find(x=>x.i===SAVE.team);const oldLg=SAVE.team!=null?lgOf(SAVE.team):null;const r=_alm.apply(this,arguments);
  try{if(mv&&oldLg!=null&&oldLg!==mv.to){spMove(oldLg,mv.to,!!mv.up);tixMove(oldLg,mv.to);}}catch(e){console.error(e);}return r;};}
// ================= RÓWNOWAGA NA SZCZYCIE: bogate kluby komputera, gwiazdy na celowniku, nadwyżki =================
// 1) Bogate kluby komputera w najwyższych ligach mają budżety na miarę przychodów (renoma), a czołówka Twojej ligi
//    dorównuje Twoim płacom — walczą z Tobą o gwiazdy.
{const _ab=aiBudgets;aiBudgets=function(){const r=_ab.apply(this,arguments);try{
  for(const t of TEAMS){const ti=t.idx;if(ti===SAVE.team||!SAVE.ai[ti])continue;const lg=lgOf(ti);if(LG_LV[lg]!==0)continue;const a=SAVE.ai[ti];const k=1+clamp((a.rep-60)/35,0,1)*0.7;a.wg=round5k(a.wg*k);a.bud=round5k(a.bud*(1+(k-1)*0.6));}
  if(SAVE.team!=null&&LG_LV[myLg()]===0){const W=teamWages(SAVE.team);const top=lgIds(myLg()).filter(i=>i!==SAVE.team&&SAVE.ai[i]).sort((x,y)=>SAVE.ai[y].rep-SAVE.ai[x].rep).slice(0,3);
    for(const i of top){const a=SAVE.ai[i];if(a.wg<W*0.85){a.wg=round5k(W*0.85);a.bud=round5k(a.bud*1.25);}}}
 }catch(e){console.error(e);}return r;};}
// 2) Gwiazdy Twojego klubu dostają oferty od bogatych klubów; odrzucenie takiej oferty zawodnik bierze do siebie.
// Kto jest „gwiazdą”: ocena co najmniej średnia Twojej ligi + 6 (min. 84) i jeden z 3 najlepszych w kadrze.
// Raz na okno losujemy, czy przyjdzie oferta (ok. 50%; więcej, gdy zawodnik ma powód odejść), i dzień jej przyjścia.
function starOfferChance(p){const s=S();let c=0.4;const t=myTeam();try{if(typeof pSat==='function'&&pSat(p,t).v<45)c+=0.2;}catch(e){}
  if(p.ce!=null&&p.ce<=s.n)c+=0.15;if((hasT(p,'amb')||hasT(p,'suk'))&&(LG_LV[myLg()]>0||((SAVE.coach&&SAVE.coach.hist||[]).slice(-1)[0]||{}).place>2))c+=0.15;
  if(p.wantOut!=null&&p.wantOut>=s.n-1)c+=0.15;if(hasT(p,'loj'))c-=0.25;if(p.extN===s.n)c-=0.2;return clamp(c,0.05,0.95);}
function starBidDay(d){if(SAVE.team==null||!SAVE.world||!windowOpen())return;const s=S();const myRep=SAVE.ai[SAVE.team]?SAVE.ai[SAVE.team].rep:50;
  const thr=Math.max(84,lgRef(myLg())+6);const top3=myTeam().players.filter(p=>!p.jr&&!p.loan).sort((a,b)=>rating(b)-rating(a)).slice(0,3);
  for(const p of top3){if(p.tl||p.age>31||rating(p)<thr)continue;if(typeof newSign==='function'&&newSign(p))continue;
    if(!p.stR||p.stR.n!==s.n)p.stR={n:s.n,ok:R()<starOfferChance(p),day:addDays(d,3+Math.floor(R()*35)),done:0};
    const st=p.stR;if(!st.ok||st.done||d<st.day)continue;st.done=1;const fee=round5k(pValue(p)*(1.1+R()*0.25));
    const bs=TEAMS.filter(t=>t.idx!==SAVE.team&&SAVE.ai[t.idx]&&LG_LV[lgOf(t.idx)]===0&&!isYT(t.idx)&&SAVE.ai[t.idx].rep>=myRep-8&&SAVE.ai[t.idx].bud>=fee&&teamWages(t.idx)+wageDemand(p)<=wageCap(t.idx)*1.1&&t.players.length<17).sort((a,b)=>SAVE.ai[b.idx].rep-SAVE.ai[a.idx].rep);
    if(!bs.length)continue;const b=bs[Math.floor(R()*Math.min(3,bs.length))];if((SAVE.inbox||[]).some(o=>o.pid===p.id&&o.tm===b.idx))continue;
    const o={pid:p.id,tm:b.idx,fee,max:round5k(fee*1.12),pat:2,star:1,d};SAVE.inbox=SAVE.inbox||[];SAVE.inbox.push(o);
    sendMail({cat:'trans',from:TEAMS[b.idx].name,t:`Oferta za ${p.first} ${p.last}: ${fmt(fee)}`,s:`${p.last} wie o ofercie i chciałby porozmawiać o przejściu.`,b:{type:'offer',pid:p.id,tm:b.idx,fee},act:1,lab:'Oferta kupna'});
    news(`📨 ${TEAMS[b.idx].name} składa ofertę za ${p.first} ${p.last} (${fmt(fee)}). Zawodnik jest zainteresowany.`);}}
{const _tl=tlDay;tlDay=function(d){const r=_tl.apply(this,arguments);try{starBidDay(d);}catch(e){console.error(e);}return r;};}
function starRejected(o){if(!o||!o.star||!PLAYERS[o.pid])return;const p=PLAYERS[o.pid].p;const s=S();const amb=hasT(p,'amb')||hasT(p,'suk');addMor(p,amb?-15:-9);
  if(p.wantOut!=null&&p.wantOut>=s.n-1&&p.wantOut<s.n){addMor(p,-12);p.unh=(p.unh||0)+3;p.tReq=s.n;news(`📝 ${p.first} ${p.last} składa oficjalną prośbę o transfer — to już drugi raz, gdy nie pozwoliłeś mu odejść.`);return;}
  news(`😠 ${p.first} ${p.last} jest rozczarowany, że nie pozwoliłeś mu odejść do ${TEAMS[o.tm].name}.`);
  try{const X=IX();if(!X.q.some(q=>q.pid===p.id))ixOpen({k:'odrz',pid:p.id,club:o.tm},today());}catch(e){console.error(e);}}
{const _ri=rejectInbox;rejectInbox=function(i){try{starRejected(SAVE.inbox&&SAVE.inbox[i]);}catch(e){console.error(e);}return _ri.apply(this,arguments);};}
// oferta gwiazdy wygasa z końcem okna: brak odpowiedzi = odmowa
{const _td=tlDay;tlDay=function(d){try{if(SAVE.team!=null&&SAVE.world&&!windowOpen()&&SAVE.inbox&&SAVE.inbox.some(o=>o.star)){for(const o of SAVE.inbox.filter(o=>o.star))starRejected(o);SAVE.inbox=SAVE.inbox.filter(o=>!o.star);}}catch(e){console.error(e);}return _td.apply(this,arguments);};}
// rozmowa po odrzuconej ofercie
IX_T.odrz={t:p=>`${p.first} ${p.last}: odrzuciłeś ofertę za mnie`,
  x:(p,q)=>`„Odrzuciłeś ofertę ${TEAMS[q.club]?TEAMS[q.club].name:'mocnego klubu'}. Chcę wiedzieć, na czym stoję — co dalej ze mną w tym klubie?”`,
  o:[['podwyzka','Zostań — w ciągu miesiąca dostaniesz lepszy kontrakt.',p=>ixChance(p,0.75+(IX().cred-60)/200,{chc:0.1,amb:-0.1}),
      (p,q,ok)=>{if(ok){addMor(p,6);relAdd(p,4);ixPromise(p,'podwyzka',30,{w:p.wage});return 'Zgodził się zostać. Obiecana podwyżka min. 10% w ciągu 30 dni — karta zawodnika → kontrakt.';}addMor(p,-6);p.wantOut=S().n;return 'Nie wierzy w obietnicę. Będzie myślał o odejściu.';}],
    ['rola','Będziesz jednym z liderów i podstawowym zawodnikiem.',p=>ixChance(p,0.55,{amb:0.1,kap:0.15,loj:0.15}),
      (p,q,ok)=>{p.role='klu';if(ok){addMor(p,5);relAdd(p,4);return 'Przyjął to dobrze — chce poprowadzić drużynę.';}addMor(p,-8);p.wantOut=S().n;return 'To dla niego za mało. Wciąż myśli o odejściu.';}],
    ['zostan','Jesteś dla mnie kluczowy — nie sprzedam cię.',p=>ixChance(p,0.4,{loj:0.35,oby:0.1,amb:-0.25,suk:-0.2}),
      (p,q,ok)=>{if(ok){addMor(p,3);relAdd(p,3);return 'Zostaje i czuje się doceniony.';}addMor(p,-12);relAdd(p,-8);p.wantOut=S().n;return 'Jest rozczarowany. Przy kolejnej ofercie będzie naciskał na odejście.';}],
    ['puszcze','Rozumiem. Wystawię cię na listę transferową.',p=>0.95,
      (p,q,ok)=>{if(typeof tlSet==='function')tlSet(p.id,Math.round(pValue(p)*1.1));addMor(p,8);relAdd(p,4);ixPromise(p,'lista',60,{});return 'Docenił szczerość. Jest na liście transferowej — nie zdejmuj go, bo to złamana obietnica.';}]]};
// brak rozmowy po odrzuconej ofercie = zawodnik chce odejść
{const _ia=ixAnswer;ixAnswer=function(id,opt,auto){try{const q=IX().q.find(x=>x.id===id);if(q&&q.k==='odrz'&&opt==='_ignore'&&PLAYERS[q.pid])PLAYERS[q.pid].p.wantOut=S().n;}catch(e){}return _ia.apply(this,arguments);};}
// prośba o transfer: zawodnik niezadowolony słabiej trenuje i psuje atmosferę, dopóki nie trafi na listę albo nie dostanie nowego kontraktu
{const _cm2=clubMods;clubMods=function(ti){const m=_cm2.apply(this,arguments);try{if(ti===SAVE.team){const s=S();const n=myTeam().players.filter(p=>p.tReq===s.n&&!p.tl).length;if(n)return Object.assign({},m,{all:m.all*(1-0.04*n)});}}catch(e){}return m;};}
// 4) Nadwyżka finansowa (saldo powyżej progu ligi) zostaje w klubie i idzie na drużynę.
//    Twój klub: sam decydujesz — transfery, budżet sezonu (płace i transfery), spłata kredytu albo zostawić na koncie.
//    Gdy kontrakty przekazałeś dyrektorowi finansowemu, sam dokłada ją do budżetu sezonu.
//    Kluby komputera: zarząd przenosi niewydane pieniądze na transfery w kolejnym sezonie. Właściciel nie zabiera pieniędzy
//    (nikt nie ma tu długów do pokrycia poza kredytem, który spłaca sam klub).
const SURPLUS_TH=[6000000,3000000,2000000];
function surTh(){return SURPLUS_TH[LG_LV[myLg()]]||2000000;}
function surAmt(){return SAVE.fin?round5k(Math.max(0,SAVE.fin.bal-surTh())):0;}
function surApply(kind,auto){const b=BUD();const X=surAmt();const s=S();if(!b||!X||!s)return;const sv=SAVE.sur;if(sv&&sv.n===s.n&&sv.done)return;
  const counted=Math.min(X,b.res||0);const add=round5k(X-counted*BUD_RES_K);b.res=Math.max(0,(b.res||0)-counted);let txt='';
  if(kind==='tr'){b.surTr=(b.surTr||0)+add;txt=`+${fmt(add)} do budżetu transferowego`;}
  else if(kind==='sez'){const wg=round5k(add*0.6);b.surWg=(b.surWg||0)+wg;b.surTr=(b.surTr||0)+(add-wg);txt=`+${fmt(wg)} do budżetu płacowego i +${fmt(add-wg)} do transferowego`;}
  else if(kind==='kredyt'){const L=SAVE.fin.loan;if(!L)return;const pay=Math.min(X,Math.round(L.left));money(-pay,'Kredyt');finLog('Spłata kredytu z nadwyżki',-pay);L.left-=pay;if(L.left<=1000)SAVE.fin.loan=null;txt=`${fmt(pay)} na spłatę kredytu`;}
  else txt='pieniądze zostają na koncie';
  SAVE.sur={n:s.n,done:1,kind,txt};news(`💼 Nadwyżka finansowa: ${txt}${auto?' (dyrektor finansowy)':''}.`);if(!auto){ui.spMsg=null;save();render();}}
{const _bl=budLeft;budLeft=function(){const r=_bl.apply(this,arguments);try{const b=BUD();if(b){r.tr+=(b.surTr||0);r.wg+=(b.surWg||0);}}catch(e){}return r;};}
{const _bc3=budgetCard;budgetCard=function(){const h=_bc3.apply(this,arguments);try{const b=BUD();const s=S();if(b&&(b.surTr||b.surWg))return h+`<div class="card small"><b>💼 Nadwyżka w tym sezonie:</b> ${b.surTr?`+${fmt(b.surTr)} na transfery`:''}${b.surTr&&b.surWg?' · ':''}${b.surWg?`+${fmt(b.surWg)} na płace`:''} (wliczone w budżety powyżej).</div>`;
  const X=surAmt();if(X>0&&!(SAVE.sur&&SAVE.sur.n===s.n&&SAVE.sur.done))return h+surCard(X);}catch(e){console.error(e);}return h;};}
function surButtons(X){const L=SAVE.fin&&SAVE.fin.loan;return `<div class="row wrap" style="gap:8px;margin-top:8px"><button class="btn sm" onclick="surApply('tr')">Na transfery (+${fmt(X)})</button><button class="btn sm" onclick="surApply('sez')">Do budżetu sezonu (płace i transfery)</button>${L?`<button class="ghost sm" onclick="surApply('kredyt')">Spłać kredyt</button>`:''}<button class="ghost sm" onclick="surApply('konto')">Zostaw na koncie</button></div>`;}
function surCard(X){return `<div class="card"><h2>Nadwyżka finansowa</h2><p class="small">Saldo klubu przekracza ${fmt(surTh())} o <b>${fmt(X)}</b>. Zdecyduj, na co przeznaczyć tę kwotę w tym sezonie. Rozbudowę obiektów możesz też opłacić z konta w zakładce Infrastruktura.</p>${surButtons(X)}</div>`;}
{const _mb2=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type!=='surplus')return _mb2.apply(this,arguments);const s=S();const done=SAVE.sur&&SAVE.sur.n===b.n&&SAVE.sur.done;const X=surAmt();
  return `<p class="mtext">Saldo klubu przekroczyło ${fmt(b.th)}. Nadwyżka zostaje w klubie — to Ty decydujesz, czy dołożyć ją do transferów, do budżetu sezonu, spłacić kredyt czy zostawić na koncie (np. na rozbudowę obiektów).</p>${done?`<p class="mtext"><b>Decyzja:</b> ${esc(SAVE.sur.txt)}.</p>`:(s&&s.n===b.n&&X>0?surButtons(X):'<p class="mut small">Nadwyżka jest już nieaktualna.</p>')}`;};}
{const _ns=nextSeason;nextSeason=function(){const r=_ns.apply(this,arguments);try{if(SAVE.team!=null&&SAVE.fin&&S()){const X=surAmt();if(X>0){budPlan();
  if(typeof dlg==='function'&&dlg('contr')&&!SAVE.ownClub)surApply('sez',true);
  else if(typeof sendMail==='function')sendMail({cat:'fin',from:'Dyrektor finansowy',t:'Nadwyżka finansowa do rozdysponowania',s:`${fmt(X)} ponad bezpieczne saldo`,b:{type:'surplus',n:S().n,th:surTh()},act:1,lab:'Finanse'});}}}catch(e){console.error(e);}return r;};}
// kluby komputera: niewydane pieniądze na transfery przechodzą na kolejny sezon (do 30% przychodu)
{const _ab2=aiBudgets;aiBudgets=function(){const keep={};try{for(const t of TEAMS){const a=SAVE.ai[t.idx];if(a&&t.idx!==SAVE.team&&a.bud>0)keep[t.idx]=a.bud;}}catch(e){}
  const r=_ab2.apply(this,arguments);try{for(const i in keep){const a=SAVE.ai[i];if(!a)continue;a.bud=round5k(a.bud+Math.min(keep[i]*0.5,aiRev(+i)*0.3));}}catch(e){console.error(e);}return r;};}
// ================= ROZSĄDNIEJSZE CELE ZARZĄDU =================
// Cel „finał” tylko wtedy, gdy klub jest wyraźnie najsilniejszy (min. 3 pkt przewagi nad 3. drużyną), „półfinał” —
// gdy ma wyraźną przewagę nad 5. drużyną. Zarząd nie zwalnia po sezonie, w którym cel minięto o jedno miejsce.
{const _gf=goalFor;goalFor=function(ti){let g=_gf.apply(this,arguments);try{const L=lgIds(lgOf(ti)).map(i=>teamStrength(TEAMS[i])).sort((a,b)=>b-a);const me=teamStrength(TEAMS[ti]);
  if(g===2&&L.length>2&&me-L[2]<3)g=4;if(g===4&&L.length>4&&me-L[4]<3)g=8;}catch(e){}return g;};}
{const _fc=fireCoach;fireCoach=function(why){try{const ev=S()&&S().eval;if(/nieudanym sezonie/.test(why||'')&&ev&&ev.place<=ev.goal+1){SAVE.board.conf=Math.max(SAVE.board.conf||0,25);news('👔 Zarząd jest rozczarowany, ale cel minięto tylko o jedno miejsce — dostajesz kolejny sezon.');return;}}catch(e){console.error(e);}return _fc.apply(this,arguments);};}

{const _dr=dlgRenew;dlgRenew=function(p){const r=_dr.apply(this,arguments);try{if(r!==false&&p){p.extN=S().n;delete p.tReq;}}catch(e){}return r;};}
