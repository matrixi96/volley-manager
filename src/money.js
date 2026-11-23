// ================= NA CO WYDAĆ PIENIĄDZE: premie, obiekty przez dyrektora, inwestycje =================
// 1) Premie dla zawodników: za wygrany mecz (procent rocznych płac drużyny) i za sukcesy w sezonie.
//    Wyższe premie = lepsze morale po wygranej i trochę większa wola walki; brak premii = lekko słabsza drużyna.
const BONUS_L=[{n:'Brak',w:0,f:0.995,d:'bez premii — drużyna gra trochę słabiej'},{n:'Niskie',w:0.0025,f:1,d:'0,25% rocznych płac za wygraną'},{n:'Średnie',w:0.005,f:1.004,d:'0,5% rocznych płac za wygraną'},{n:'Wysokie',w:0.01,f:1.008,d:'1% rocznych płac za wygraną'}];
const BONUS_SEASON={tytul:0.08,medal:0.04,awans:0.06};// część rocznych płac
function bonusLv(){const e=ECO();return e.bonus==null?1:e.bonus;}
function bonusSet(v){ECO().bonus=v;save();render();}
function bonusPay(amt,why){if(amt<=0)return;money(-amt,'Premie');finLog(why,-amt);}
{const _bam=boardAfterMatch;boardAfterMatch=function(res){const r=_bam.apply(this,arguments);try{const me=res.h===SAVE.team;const my=me?res.sw[0]:res.sw[1],op=me?res.sw[1]:res.sw[0];
  if(my>op){const L=BONUS_L[bonusLv()];const amt=round5k(payroll()*L.w);if(amt>0){bonusPay(amt,'Premie za wygraną');for(const p of myTeam().players)if(!p.jr)addMor(p,bonusLv()>=2?2:1);}}}catch(e){console.error(e);}return r;};}
{const _cm3=clubMods;clubMods=function(ti){const m=_cm3.apply(this,arguments);try{if(ti===SAVE.team){const f=BONUS_L[bonusLv()].f;if(f!==1)return Object.assign({},m,{all:m.all*f});}}catch(e){}return m;};}
// premie za sezon: tytuł, medal, awans (po zakończeniu sezonu)
{const _alm2=applyLeagueMoves;applyLeagueMoves=function(old){let place=null;try{const ev=S()&&S().eval;place=ev?ev.place:null;}catch(e){}const up=old&&old.moves&&old.moves.some(x=>x.i===SAVE.team&&x.up);
  const r=_alm2.apply(this,arguments);try{if(bonusLv()>0&&SAVE.team!=null){const W=payroll();let k=0,why='';if(place===1){k=BONUS_SEASON.tytul;why='mistrzostwo';}else if(place&&place<=3){k=BONUS_SEASON.medal;why='medal';}if(up){k=Math.max(k,BONUS_SEASON.awans);why=why||'awans';}
    const amt=round5k(W*k*(bonusLv()/2+0.5));if(amt>0){bonusPay(amt,`Premia za ${why}`);news(`💰 Zawodnicy dostali premię za ${why}: ${fmt(amt)}.`);}}}catch(e){console.error(e);}return r;};}
function bonusCard(){const lv=bonusLv();const W=payroll();return `<div class="card"><h2>Premie dla zawodników${tipQ('Premia za każdy wygrany mecz ligowy i pucharowy (sparingi się nie liczą) oraz premia za tytuł, medal lub awans po sezonie. Wyższe premie poprawiają morale po wygranej i wolę walki, brak premii lekko osłabia drużynę.')}</h2>
  <div class="row wrap" style="gap:6px">${BONUS_L.map((L,i)=>`<button class="${i===lv?'btn':'ghost'} sm" onclick="bonusSet(${i})">${L.n}</button>`).join('')}</div>
  <p class="small mut" style="margin-top:6px">${BONUS_L[lv].d}${BONUS_L[lv].w?` — ok. ${fmt(round5k(W*BONUS_L[lv].w))} za wygraną; za tytuł ok. ${fmt(round5k(W*BONUS_SEASON.tytul*(lv/2+0.5)))}`:''}.</p></div>`;}
// 2) wyższy limit płac przy dużych oszczędnościach — w budżecie (finanse.js): 95% przychodu zamiast 85%, gdy saldo jest ponad progiem nadwyżki.
// 3) obiekty: dyrektor finansowy rozbudowuje z pieniędzy ponad próg; ręcznie też można opłacić budowę z nadwyżki, nawet gdy brakuje budżetu operacyjnego
const INFRA_ORDER=['tren','med','hala','odn','akad','sied','sklep'];
let INFRA_SUR=false;
{const _bcan=budCan;budCan=function(kind){if(INFRA_SUR&&kind==='op')return null;return _bcan.apply(this,arguments);};}
{const _sb=startBuild;startBuild=function(k){try{const f=INFRA.find(x=>x.k===k);const L=myInfra()[k];const c=upgradeCost(f,L);INFRA_SUR=surAmt()>=c;}catch(e){}try{return _sb.apply(this,arguments);}finally{INFRA_SUR=false;}};}
function dlgInfra(d){if(!dlg('infra'))return;if(d.slice(8)!=='01')return;const bs=BLD();if(bs.length>=MAX_BUILDS)return;const inf=myInfra();
  for(const k of INFRA_ORDER){const f=INFRA.find(x=>x.k===k);if(!f||bs.some(b=>b.k===k))continue;const L=inf[k];if(L>=fMax(f))continue;const c=upgradeCost(f,L);if(surAmt()<c)continue;
    money(-c,'Infrastruktura');finLog(`${L===0?'Budowa':'Rozbudowa'}: ${f.n} (poz. ${L+1}) — dyrektor`,-c);const b={k,to:L+1,start:today(),until:addDays(today(),upgradeDays(f,L))};bs.push(b);
    dlgNote(`Dyrektor zlecił ${L===0?'budowę':'rozbudowę'}: ${f.n} — poziom ${L+1} za ${fmt(c)} (z nadwyżki ponad bezpieczne saldo). Koniec: ${fmtDMY(b.until)}.`);return;}}
{const _dd=dlgDaily;dlgDaily=function(d){const r=_dd.apply(this,arguments);try{dlgInfra(d);}catch(e){console.error(e);}return r;};}
// 4) inwestycje jednorazowe z konta (na sezon): kampania marketingowa i stypendia w akademii
const INVEST=[
 {k:'mkt',n:'Kampania marketingowa',c:[350000,180000,90000],d:'Reklama w mediach i mieście na cały sezon: +6% widzów na meczach i lepsze oferty sponsorów (+5% jakości).'},
 {k:'stp',n:'Stypendia w akademii',c:[250000,150000,90000],d:'Stypendia dla najzdolniejszej młodzieży z regionu: lepszy najbliższy nabór juniorów (wyższy potencjał).'}];
function invOn(k){const s=S();const I=SAVE.inv||{};return !!(s&&I[k]===s.n);}
function invBuy(k){const v=INVEST.find(x=>x.k===k);const s=S();if(!v||!s||invOn(k))return;const c=v.c[LG_LV[myLg()]]||v.c[2];if(SAVE.fin.bal-c<0)return tradeMsg(false,'Za mało pieniędzy na koncie.');
  if(ui.confirm!=='inv'+k){ui.confirm='inv'+k;render();return;}ui.confirm=null;money(-c,'Inwestycje');finLog(v.n,-c);SAVE.inv=SAVE.inv||{};SAVE.inv[k]=s.n;news(`📈 ${v.n}: zainwestowano ${fmt(c)} na ten sezon.`);save();render();}
{const _cf=crowdFor;crowdFor=function(ti){const r=_cf.apply(this,arguments);try{if(ti===SAVE.team&&invOn('mkt')&&r&&r.att){const a=Math.min(r.cap,Math.round(r.att*1.06));const k=a/r.att;return Object.assign({},r,{att:a,fill:a/r.cap,paying:Math.round(r.paying*k),inc:Math.round(r.inc*k)});}}catch(e){}return r;};}
{const _sq=spQuality;spQuality=function(){const r=_sq.apply(this,arguments);try{if(invOn('mkt')&&typeof r==='number')return r*1.05;}catch(e){}return r;};}
{const _gj2=genJunior;genJunior=function(ti){const p=_gj2.apply(this,arguments);try{if(ti===SAVE.team&&SAVE.inv&&SAVE.inv.stp!=null&&SAVE.inv.stp>=S().n-1&&p&&!p.stpB){p.pot=Math.min(99,p.pot+3+Math.floor(R()*3));p.stpB=1;}}catch(e){}return p;};}
function invCard(){const lv=LG_LV[myLg()];return `<div class="card"><h2>Inwestycje na sezon</h2><p class="small mut">Jednorazowe wydatki z konta klubu. Działają do końca bieżącego sezonu (stypendia — na najbliższy nabór juniorów).</p>
  ${INVEST.map(v=>{const c=v.c[lv]||v.c[2];const on=invOn(v.k);return `<div class="row wrap" style="gap:8px;margin:6px 0;align-items:center"><div style="flex:1;min-width:220px"><b>${v.n}</b> · ${fmt(c)}<div class="small mut">${v.d}</div></div>${on?'<span class="good small">✓ aktywne w tym sezonie</span>':`<button class="btn sm" onclick="invBuy('${v.k}')">${ui.confirm==='inv'+v.k?'Na pewno? Zapłać '+fmt(c):'Zainwestuj'}</button>`}</div>`;}).join('')}
  <p class="small mut">Bazy danych skautingu (pełna wiedza o regionie) kupisz w zakładce Skauting.</p></div>`;}
{const _bc4=budgetCard;budgetCard=function(){const h=_bc4.apply(this,arguments);try{return h+bonusCard()+invCard();}catch(e){console.error(e);return h;}};}
