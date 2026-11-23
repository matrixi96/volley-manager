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
