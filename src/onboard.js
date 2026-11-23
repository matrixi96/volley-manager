// ================= PIERWSZA GODZINA GRY: spokojny start nowej kariery =================
// Między rozpoczęciem gry a pierwszym dniem, w którym gracz przejmuje stery, nie powstają prośby agentów,
// zawodników i zarządu (żeby nie wygasały, zanim gracz w ogóle je zobaczy), a osiągnięcia za stan kadry
// odblokowane przed pierwszym meczem nie zasłaniają ekranu powiadomieniem.
let ONB_START=false;
function onbWrapStart(fn){return function(){ONB_START=true;try{return fn.apply(this,arguments);}finally{ONB_START=false;try{if(SAVE&&SAVE.team!=null){SAVE.ctrlFrom=today();save();}}catch(e){}}};}
pickTeam=onbWrapStart(pickTeam);
if(typeof foundClub==='function')foundClub=onbWrapStart(foundClub);
{const _a=agDaily;agDaily=function(d){if(ONB_START)return;return _a.apply(this,arguments);};}
{const _i=ixDaily;ixDaily=function(d){if(ONB_START)return;return _i.apply(this,arguments);};}
{const _b=bmDaily;bmDaily=function(d){if(ONB_START)return;return _b.apply(this,arguments);};}
{const _ac=achCheck;achCheck=function(){const r=_ac.apply(this,arguments);try{if(ONB_START||(SAVE.ctrlFrom&&today()<=SAVE.ctrlFrom&&S()&&S().n===1)){ui.achToast=null;const A=ACHS();A.fresh=[];if(SAVE.news)SAVE.news=SAVE.news.filter(x=>!/^🏅/.test(x.t||''));}}catch(e){}return r;};}
