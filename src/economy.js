// ================= EKONOMIA: CENY BILETÓW I W SKLEPIE, FREKWENCJA, PENSJE SZTABU =================
function ECO(){const e=SAVE.eco||(SAVE.eco={});if(e.tix==null)e.tix=Math.round(refPrice(SAVE.team));if(e.shop==null)e.shop=1;
  // jednorazowe przeliczenie pensji sztabu po zmianie ekonomii
  if(!e.v){e.v=2;for(const s of Object.values(SAVE.staff||{}).concat(SAVE.scouts||[],SAVE.staffPool||[]))if(s)s.wage=staffWage(s.skill);}
  return e;}
const SHOP_LV=[['Niskie','Gadżety tanieją: mniejszy przychód ze sklepu, kibice chętniej przychodzą (+3% frekwencji).',0.75,1.03],['Normalne','Ceny rynkowe.',1,1],['Wysokie','Większy przychód ze sklepu, ale kibice trochę marudzą (−3% frekwencji).',1.22,0.97]];
function refPrice(ti){const rep=SAVE.ai&&SAVE.ai[ti]?SAVE.ai[ti].rep:50;return 25+rep*0.3;}
function tixPrice(ti){if(ti==null||ti===SAVE.team)return SAVE.team==null?35:ECO().tix;return Math.round(refPrice(ti));}
// popyt na bilety dla meczu u siebie drużyny ti; k: sparing 0,35 / liga 1 / play-off 1,5
function crowdFor(ti,k,price,est){const rep=SAVE.ai[ti].rep;const L=infraOf(ti).hala;const cap=HALA_CAP[L-1];price=price==null?tixPrice(ti):price;
  let pm=Math.pow(refPrice(ti)/Math.max(5,price),1.4);pm=clamp(pm,0.2,1.7);const sh=ti===SAVE.team?SHOP_LV[ECO().shop][3]:1;
  let pos=1;try{const s=S();if(s&&(s.phase==='liga'||s.phase==='po')){const p=leagueTable().findIndex(x=>x.i===ti)+1;pos=p<=3?1.1:p>=10?0.92:1;}}catch(e){}
  const att=Math.min(cap,Math.round((1400+rep*25)*(1+0.05*(L-1))*pm*sh*pos*(est?1:0.85+R()*0.3)*k));return {att,cap,fill:att/cap,price,inc:att*price};}
function ticketIncome(mult,est){return crowdFor(SAVE.team,mult,null,est);}
function bestPrice(){let best=null;for(let p=10;p<=150;p+=1){const c=crowdFor(SAVE.team,1,p,true);if(!best||c.inc>best.inc)best=c;}return best;}
function setTix(v){ECO().tix=clamp(Math.round(+v)||35,5,200);save();render();}
function setShop(i){ECO().shop=i;save();render();}
function pricesCard(){const e=ECO();const c=crowdFor(SAVE.team,1,e.tix,true);const b=bestPrice();const po=crowdFor(SAVE.team,1.5,e.tix,true);
  return `<div class="card"><h2>Ceny</h2>
   <div class="prow"><div><b>Bilet na mecz ligowy</b><div class="small mut">Tańsze bilety = pełniejsza hala, lepsza atmosfera (przewaga gospodarza) i więcej kibiców przy sklepie. Droższe = więcej pieniędzy z mniejszej liczby widzów.</div></div>
    <div class="pctl"><button class="ghost sm" onclick="setTix(ECO().tix-5)">−5</button><input type="range" min="10" max="150" step="1" value="${e.tix}" oninput="document.getElementById('tixv').textContent=this.value+' zł'" onchange="setTix(this.value)"><button class="ghost sm" onclick="setTix(ECO().tix+5)">+5</button><b id="tixv" class="pval">${e.tix} zł</b></div></div>
   <div class="kstrip in"><div><span>Widzów (szacunek)</span><b>${c.att.toLocaleString('pl-PL')}</b><small>na ${c.cap.toLocaleString('pl-PL')} miejsc · ${Math.round(c.fill*100)}% hali</small></div><div><span>Za mecz ligowy</span><b>${fmt(c.inc)}</b><small>play-off: ok. ${fmt(po.inc)}</small></div><div><span>Za sezon (11 meczów)</span><b>${fmt(c.inc*11)}</b><small>bez play-off</small></div><div><span>Najwięcej pieniędzy</span><b>${b.price} zł</b><small>${fmt(b.inc)}/mecz · hala ${Math.round(b.fill*100)}% <button class="link" onclick="setTix(${b.price})">ustaw</button></small></div></div>
   <p class="small mut">Atmosfera: hala zapełniona w ${Math.round(c.fill*100)}% — ${c.fill>=0.9?'kibice niosą drużynę (większa przewaga własnego boiska)':c.fill>=0.65?'normalna przewaga własnego boiska':'pustawo — przewaga własnego boiska słabnie'}. Sparingi: bez biletów.</p>
   <div class="prow" style="margin-top:12px"><div><b>Ceny w sklepie kibica</b><div class="small mut">${esc(SHOP_LV[e.shop][1])}</div></div><div class="seg">${SHOP_LV.map((x,i)=>`<button class="${e.shop===i?'on':''}" onclick="setShop(${i})">${x[0]}</button>`).join('')}</div></div></div>`;}
