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
