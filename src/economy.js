// ================= EKONOMIA: DZIEŃ MECZOWY (BILETY, KARNETY, VIP, GOŚCIE, PARKING, GASTRONOMIA), SKLEP KIBICA, PENSJE SZTABU =================
// produkty sklepu: [klucz, nazwa, poziom sklepu, cena wzorcowa, koszt sztuki, sprzedaż /mies. na 1000 kibiców]
const SHOP_PR=[['czapka','Czapki',1,49,22,80],['koszulka','Koszulki',1,149,65,60],['szalik','Szaliki',2,59,25,70],['kubek','Kubki',3,35,14,50],['smycz','Smycze',3,19,7,80],['bluza','Bluzy',4,199,90,30],['kalendarz','Kalendarze',5,39,15,40]];
// gastronomia: [klucz, nazwa, poziom stoiska, cena wzorcowa, koszt, odsetek kupujących widzów]
const GAS_PR=[['woda','Woda',1,6,2,0.35],['hotdog','Hot dogi',1,12,5,0.3],['kielbaska','Kiełbaski',2,15,6,0.2],['sok','Soki',2,8,3,0.2],['burger','Burgery',3,25,11,0.18],['piwo','Piwo',4,14,5,0.4]];
const PARK_REF=10;
function ECO(){const e=SAVE.eco||(SAVE.eco={});if(e.tix==null)e.tix=Math.round(refPrice(SAVE.team));
  if(typeof e.shop!=='object'||e.shop===null){e.shop={};}for(const p of SHOP_PR)if(e.shop[p[0]]==null)e.shop[p[0]]=p[3];
  e.gas=e.gas||{};for(const p of GAS_PR)if(e.gas[p[0]]==null)e.gas[p[0]]=p[3];
  if(e.vipP==null)e.vipP=Math.round(vipRef(SAVE.team)/5)*5;if(e.park==null)e.park=PARK_REF;
  if(!e.kar)e.kar={n:Math.round(e.tix*9/5)*5,u:Math.round(e.tix*9*0.6/5)*5,v:Math.round(e.vipP*9*0.85/10)*10};
  if(!e.karS)e.karS={n:0,u:0,v:0,season:0,inc:0};
  // jednorazowe przeliczenie pensji sztabu po zmianie ekonomii
  if(!e.v){e.v=2;for(const s of Object.values(SAVE.staff||{}).concat(SAVE.scouts||[],SAVE.staffPool||[]))if(s)s.wage=staffWage(s.skill);}
  return e;}
function refPrice(ti){const rep=SAVE.ai&&SAVE.ai[ti]?SAVE.ai[ti].rep:50;return 25+rep*0.3;}
function vipRef(ti){const rep=SAVE.ai&&SAVE.ai[ti]?SAVE.ai[ti].rep:50;return 120+rep*1.5;}
function tixPrice(ti){if(ti==null||ti===SAVE.team)return SAVE.team==null?35:ECO().tix;return Math.round(refPrice(ti));}
function parkSpots(L){return L>0?500+1000*(L-1):0;}
function vipSeats(L){return [0,100,180,260][L]||0;}
function guestSeats(L){return 300*(L||0);}
// karnety ważne na mecze ligowe u siebie w bieżącym sezonie
function karHolders(){const e=ECO(),k=e.karS;if(!S()||k.season!==S().n)return {n:0,u:0,v:0,tot:0};return {n:k.n,u:k.u,v:k.v,tot:k.n+k.u};}
function karOpen(d){const s=S();if(!s||!s.rdates)return false;d=d||today();return (s.phase==='off'||s.phase==='spar')&&d<s.rdates[0];}
// popyt na bilety dla meczu u siebie drużyny ti; k: sparing 0,35 / liga 1 / play-off 1,5
function crowdFor(ti,k,price,est){const rep=SAVE.ai[ti].rep;const inf=infraOf(ti);const L=inf.hala;const cap=HALA_CAP[L-1];const mine=ti===SAVE.team;price=price==null?tixPrice(ti):price;
  let pm=Math.pow(refPrice(ti)/Math.max(5,price),1.4);pm=clamp(pm,0.2,1.7);
  let pos=1;try{const s=S();if(s&&(s.phase==='liga'||s.phase==='po')){const p=leagueTable().findIndex(x=>x.i===ti)+1;pos=p<=3?1.1:p>=10?0.92:1;}}catch(e){}
  let D=(1400+rep*25)*(1+0.05*(L-1))*pm*pos*(est?1:0.85+R()*0.3)*k;
  const spots=parkSpots(inf.park),need=D*0.3;let pk=need>spots?1-0.3*(1-spots/need):1;
  if(mine){const pp=ECO().park;pk*=clamp(1-0.04*(pp/PARK_REF-1),0.85,1);}
  D*=pk;
  const h=mine&&k===1?karHolders().tot:0;
  const att=Math.round(Math.min(cap,h+Math.max(0,D-0.5*h)));const paying=Math.max(0,att-h);
  return {att,cap,fill:att/cap,price,inc:paying*price,h,paying,park:pk};}
function ticketIncome(mult,est){return crowdFor(SAVE.team,mult,null,est);}
function bestPrice(){let best=null;for(let p=10;p<=150;p+=1){const c=crowdFor(SAVE.team,1,p,true);if(!best||c.inc>best.inc)best=c;}return best;}
// pełny przychód z meczu u siebie: att = widzowie na trybunach (z crowdFor), opp = rywal
function matchday(k,att,opp,est,ov){const e=ECO(),inf=myInfra(),rep=SAVE.ai[SAVE.team].rep;ov=ov||{};const kh=karHolders();
  if(att==null)att=crowdFor(SAVE.team,k,ov.tix,est).att;
  const tix=ov.tix!=null?ov.tix:e.tix;const hN=k===1?kh.tot:0;const tickets=Math.max(0,att-hN)*tix;
  const vs=vipSeats(inf.vip),vp=ov.vipP!=null?ov.vipP:e.vipP;const vh=k===1?Math.min(kh.v,vs):0;
  const vD=(40+rep*2.2)*(1+0.08*(inf.hala-1))*clamp(Math.pow(vipRef(SAVE.team)/Math.max(10,vp),1.5),0.1,2)*k*(est?1:0.85+R()*0.3);
  const vAtt=vs?Math.round(Math.min(vs,vh+Math.max(0,vD-0.5*vh))):0;const vip=Math.max(0,vAtt-vh)*vp;
  const orep=opp!=null&&SAVE.ai[opp]?SAVE.ai[opp].rep:50;const gs=guestSeats(inf.gosc);
  const gAtt=gs?Math.round(Math.min(gs,(60+orep*4)*clamp(Math.pow(refPrice(SAVE.team)/Math.max(5,tix),1.2),0.2,1.6)*k*(est?1:0.8+R()*0.4))):0;const guests=gAtt*tix;
  const T=att+vAtt+gAtt;const pp=ov.park!=null?ov.park:e.park;
  const cars=Math.round(Math.min(parkSpots(inf.park),T*0.3*clamp(1.25-0.05*pp,0.1,1.2)));const parking=cars*pp;
  const gl=[];let gas=0;const sm=0.7+0.1*inf.gastro;
  for(const [key,n,lv,ref,cost,rate] of GAS_PR){if(inf.gastro<lv)continue;const pr=ov.gas&&ov.gas[key]!=null?ov.gas[key]:e.gas[key];const q=Math.round(T*rate*sm*clamp(Math.pow(ref/Math.max(1,pr),1.6),0.05,2.5));const pf=q*(pr-cost);gl.push({key,n,q,pr,pf});gas+=pf;}
  return {att,vAtt,gAtt,cars,T,tickets,vip,guests,parking,gas,gl,tot:tickets+vip+guests+parking+gas};}
function payMatchday(k,att,opp){const r=matchday(k,att,opp,false);money(r.tickets+r.vip+r.guests,'Bilety');money(r.gas,'Gastronomia');money(r.parking,'Parking');
  SAVE.eco.last={...r,gl:r.gl.map(x=>({n:x.n,q:x.q,pf:x.pf})),d:today(),opp};return r;}
// ---- najlepsze ceny (podpowiedzi) ----
function bestOf(lo,hi,step,f){let b=lo,bv=-1e18;for(let p=lo;p<=hi;p+=step){const v=f(p);if(v>bv){bv=v;b=p;}}return b;}
function bestVip(){return bestOf(40,600,5,p=>matchday(1,null,null,true,{vipP:p}).vip);}
function bestPark(){const e=ECO(),o=e.park;const b=bestOf(0,40,1,p=>{e.park=p;return matchday(1,null,null,true).tot;});e.park=o;return b;}
function bestGas(key){const g=GAS_PR.find(x=>x[0]===key);return bestOf(1,g[3]*4,1,p=>{const m=matchday(1,null,null,true,{gas:{[key]:p}});const x=m.gl.find(y=>y.key===key);return x?x.pf:0;});}
// ---- karnety ----
function karTarget(tier,pr){const e=ECO();const c=crowdFor(SAVE.team,1,e.tix,true);const D=c.att+c.h*0.5;const val=11*e.tix;
  const f=r=>clamp((r-0.7)/0.6,0,1.6);
  if(tier==='n')return Math.round(D*0.2*f(val/Math.max(10,pr)));
  if(tier==='u')return Math.round(D*0.09*f(val*0.65/Math.max(10,pr)));
  const vs=vipSeats(myInfra().vip);return vs?Math.round(Math.min(vs*0.6,vs*0.38*f(11*e.vipP/Math.max(10,pr)))):0;}
function karBest(tier){const e=ECO();const tv=tier==='v'?e.vipP:e.tix;return bestOf(Math.round(tv*2),Math.round(tv*14),tier==='v'?10:5,p=>karTarget(tier,p)*(p-0.5*11*tv*0.85));}
function karDay(d){if(SAVE.team==null||!SAVE.world)return;const e=ECO(),s=S();if(!karOpen(d)){if(e.karS.season===s.n&&!e.karS.closed&&s.rdates&&d>=s.rdates[0]){e.karS.closed=1;
    if(e.karS.n+e.karS.u+e.karS.v>0){finLog(`Karnety sezonu ${sLabel(s.n)}: ${e.karS.n} normalnych, ${e.karS.u} ulgowych, ${e.karS.v} VIP`,e.karS.inc);news(`🎟️ Zakończyła się sprzedaż karnetów: ${e.karS.n+e.karS.u+e.karS.v} karnetów za ${fmt(e.karS.inc)}.`);}}return;}
  if(e.karS.season!==s.n)e.karS={n:0,u:0,v:0,season:s.n,inc:0};
  const cap=HALA_CAP[myInfra().hala-1]*0.6;let inc=0;
  for(const t of ['n','u','v']){const tg=karTarget(t,e.kar[t]);const cur=e.karS[t];if(cur>=tg)continue;let add=Math.max(0,Math.round((tg-cur)*(0.05+R()*0.05)));
    if(t!=='v')add=Math.min(add,Math.max(0,Math.round(cap-e.karS.n-e.karS.u)));e.karS[t]+=add;inc+=add*e.kar[t];}
  if(inc>0){money(inc,'Karnety');e.karS.inc+=inc;}}
// ---- sklep kibica ----
function shopMonth(L,est){const e=ECO();L=L||myInfra().sklep;const rep=SAVE.ai?SAVE.ai[SAVE.team].rep:50;const F=(300+rep*20)*(1+0.15*(L-1))/1000;const m=SAVE._now?+SAVE._now.slice(5,7):+today().slice(5,7);
  const rows=[];let tot=0,rev=0;for(const [key,n,lv,ref,cost,rate] of SHOP_PR){if(L<lv)continue;const pr=e.shop[key];let q=F*rate*clamp(Math.pow(ref/Math.max(1,pr),1.6),0.05,2.5)*(est?1:0.9+R()*0.2);
    if(key==='kalendarz')q*=(m===11||m===12||m===1)?3:0.4;if(key==='szalik'||key==='bluza')q*=(m>=10||m<=3)?1.3:0.75;q=Math.round(q);const pf=q*(pr-cost);rows.push({key,n,q,pr,pf,rev:q*pr});tot+=pf;rev+=q*pr;}
  return {rows,tot,rev};}
function shopIncome(L){return shopMonth(L,true).tot;}
function bestShop(key){const g=SHOP_PR.find(x=>x[0]===key);const e=ECO();const old=e.shop[key];const b=bestOf(Math.round(g[4]*1.1),g[3]*3,1,p=>{e.shop[key]=p;const r=shopMonth(null,true).rows.find(x=>x.key===key);return r?r.pf:0;});e.shop[key]=old;return b;}
// ---- ustawianie cen ----
function setPrice(path,v){const e=ECO();v=Math.max(0,Math.round(+v||0));const [a,b]=path.split('.');
  if(path==='tix')v=clamp(v,5,200);if(b){e[a][b]=v;}else e[a]=v;save();render();}
function setTix(v){setPrice('tix',v);}
function priceRow(path,label,val,best,info,step){step=step||1;
  return `<div class="pr2"><div class="prn"><b>${label}</b>${info?`<small class="mut">${info}</small>`:''}</div><div class="prc"><button class="ghost sm" onclick="setPrice('${path}',${val-step})">−</button><input type="number" min="0" value="${val}" onchange="setPrice('${path}',this.value)"><span class="mut small">zł</span><button class="ghost sm" onclick="setPrice('${path}',${val+step})">+</button></div>${best!=null?`<div class="prb small">${best===val?'<span class="good">najbardziej opłacalna</span>':`najlepiej: <b>${best} zł</b> <button class="link" onclick="setPrice('${path}',${best})">ustaw</button>`}</div>`:'<div></div>'}</div>`;}
function matchdayCard(){const e=ECO(),inf=myInfra();const c=crowdFor(SAVE.team,1,e.tix,true);const m=matchday(1,null,null,true);const b=bestPrice();const kh=karHolders();const s=S();
  const kOpen=karOpen();const ks=e.karS.season===(s?s.n:0)?e.karS:{n:0,u:0,v:0,inc:0};
  return `<div class="card"><h2>Dzień meczowy: ceny i przychody</h2>
   <div class="kstrip in"><div><span>Widzów (szacunek)</span><b>${c.att.toLocaleString('pl-PL')}</b><small>na ${c.cap.toLocaleString('pl-PL')} miejsc · ${Math.round(c.fill*100)}%${kh.tot?` · w tym ${kh.tot} z karnetem`:''}</small></div><div><span>Za mecz ligowy</span><b>${fmt(m.tot)}</b><small>bilety ${fmt(m.tickets+m.vip+m.guests)} · jedzenie ${fmt(m.gas)} · parking ${fmt(m.parking)}</small></div><div><span>Parking</span><b>${m.cars}/${parkSpots(inf.park).toLocaleString('pl-PL')}</b><small>${c.park<1?'<span class="bad">za mały — część kibiców nie przyjedzie</span>':'wystarcza'}</small></div><div><span>Atmosfera</span><b>${Math.round(c.fill*100)}%</b><small>${c.fill>=0.9?'kibice niosą drużynę':c.fill>=0.65?'normalna przewaga własnego boiska':'pustawo — przewaga słabnie'}</small></div></div>
   <h3>Bilety</h3>
   ${priceRow('tix','Bilet normalny',e.tix,b.price,'Tańszy bilet = pełniejsza hala i lepsza atmosfera.')}
   ${inf.vip?priceRow('vipP','Bilet VIP (loża)',e.vipP,bestVip(),`${vipSeats(inf.vip)} miejsc w loży · ok. ${m.vAtt} zajętych`,5):'<p class="small mut">Bilety VIP: najpierw zbuduj lożę VIP.</p>'}
   ${inf.gosc?`<p class="small mut">Sektor gości: ${guestSeats(inf.gosc)} miejsc, kibice rywala płacą cenę biletu normalnego (ok. ${m.gAtt} na mecz).</p>`:''}
   <h3>Karnety na sezon ${s?sLabel(s.n):''}</h3><p class="small mut">${kOpen?`Sprzedaż trwa do dnia przed 1. kolejką ligi (${fmtDMY(addDays(s.rdates[0],-1))}). Karnet obejmuje 11 meczów ligowych u siebie. Kibic z karnetem przychodzi na każdy mecz, a połowa karnetowiczów to nowi widzowie.`:`Sprzedaż zamknięta — ruszy w kolejnym okresie przygotowawczym.`}</p>
   ${priceRow('kar.u','Karnet ulgowy',e.kar.u,karBest('u'),`sprzedane: ${ks.u} · cel przy tej cenie ok. ${karTarget('u',e.kar.u)}`,10)}
   ${priceRow('kar.n','Karnet normalny',e.kar.n,karBest('n'),`sprzedane: ${ks.n} · cel przy tej cenie ok. ${karTarget('n',e.kar.n)}`,10)}
   ${inf.vip?priceRow('kar.v','Karnet VIP',e.kar.v,karBest('v'),`sprzedane: ${ks.v} · cel przy tej cenie ok. ${karTarget('v',e.kar.v)}`,50):'<p class="small mut">Karnet VIP: dostępny po zbudowaniu loży VIP.</p>'}
   <p class="small"><b>Ze sprzedaży karnetów:</b> ${fmt(ks.inc)}</p>
   <h3>Parking</h3>${priceRow('park','Opłata za parking',e.park,bestPark(),`${parkSpots(inf.park).toLocaleString('pl-PL')} miejsc · zbyt wysoka opłata zniechęca część kibiców`)}
   <h3>Stoisko gastronomiczne (poziom ${inf.gastro})</h3>
   ${GAS_PR.map(([k,n,lv,ref,cost])=>inf.gastro>=lv?priceRow('gas.'+k,n,e.gas[k],bestGas(k),`koszt ${cost} zł/szt. · ok. ${(m.gl.find(x=>x.key===k)||{q:0}).q} szt. na mecz`):`<div class="pr2 lock"><div class="prn"><b>${n}</b><small class="mut">od poziomu ${lv} stoiska</small></div></div>`).join('')}
   ${e.last?`<p class="small mut">Ostatni mecz u siebie (${fmtDMY(e.last.d)}): ${e.last.att.toLocaleString('pl-PL')} widzów${e.last.vAtt?`, ${e.last.vAtt} w loży VIP`:''}${e.last.gAtt?`, ${e.last.gAtt} gości`:''} · bilety ${fmt(e.last.tickets+e.last.vip+e.last.guests)}, jedzenie ${fmt(e.last.gas)}, parking ${fmt(e.last.parking)} (${e.last.cars} aut).</p>`:''}</div>`;}
function shopCard(){const e=ECO(),L=myInfra().sklep;const est=shopMonth(L,true);const lr=e.shopLast;
  return `<div class="card"><h2>Sklep kibica: produkty i ceny</h2><p class="small mut">Każdy poziom sklepu odblokowuje nowe produkty. Zysk = (cena − koszt) × sprzedane sztuki. Szaliki i bluzy lepiej idą zimą, kalendarze w listopadzie–styczniu.</p>
   ${SHOP_PR.map(([k,n,lv,ref,cost])=>L>=lv?priceRow('shop.'+k,n,e.shop[k],bestShop(k),`koszt ${cost} zł · ok. ${(est.rows.find(x=>x.key===k)||{q:0}).q} szt./mies.`):`<div class="pr2 lock"><div class="prn"><b>${n}</b><small class="mut">od poziomu ${lv} sklepu</small></div></div>`).join('')}
   <p class="small"><b>Szacowany zysk:</b> ${fmt(est.tot)} / miesiąc (sprzedaż ${fmt(est.rev)})</p>
   ${lr?`<h3>Raport: ${MON_NOM[lr.m-1]}</h3><div class="tw"><table><thead><tr><th class="l">Produkt</th><th>Sztuk</th><th>Cena</th><th>Sprzedaż</th><th>Zysk</th></tr></thead><tbody>${lr.rows.map(r=>`<tr><td class="l">${r.n}</td><td>${r.q}</td><td>${r.pr} zł</td><td>${fmt(r.rev)}</td><td class="good">${fmt(r.pf)}</td></tr>`).join('')}<tr><td class="l"><b>Razem</b></td><td></td><td></td><td>${fmt(lr.rev)}</td><td class="good"><b>${fmt(lr.tot)}</b></td></tr></tbody></table></div>`:''}</div>`;}
function pricesCard(){return `<div class="card"><h2>Ceny</h2><p class="small">Ceny biletów, karnetów, parkingu i jedzenia ustawisz w <button class="link" onclick="ui.infraSel='hala';go('klub')">Infrastruktura → Hala sportowa</button>, a ceny produktów w <button class="link" onclick="ui.infraSel='sklep';go('klub')">Infrastruktura → Sklep kibica</button>.</p></div>`;}
