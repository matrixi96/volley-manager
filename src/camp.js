// ================= OBÓZ PRZYGOTOWAWCZY PRZED SEZONEM =================
// [klucz, miejscowość, państwo, flaga, dni, koszt bazowy, {kon,zgr,tak,mor,reg,inj}, opis]
const CAMPS=[
 ['spala','Spała (COS)','Polska','🇵🇱',10,120000,{kon:1,zgr:2,tak:2,mor:0,reg:1,inj:1},'Centralny Ośrodek Sportu: hale, siłownie i spokój. Dobra baza do pracy nad zgraniem i taktyką.'],
 ['szczyrk','Szczyrk','Polska','🇵🇱',7,110000,{kon:1.5,zgr:1,tak:1,mor:1,reg:1,inj:1},'Krótki obóz w Beskidach. Tanio, dobra atmosfera, umiarkowana praca nad kondycją.'],
 ['zakopane','Zakopane','Polska','🇵🇱',10,180000,{kon:2.5,zgr:1,tak:0.5,mor:0,reg:0,inj:1.3},'Klasyka: góry, biegi i siłownia. Duży przyrost kondycji, ale zawodnicy wrócą zmęczeni.'],
 ['cetniewo','Władysławowo (Cetniewo)','Polska','🇵🇱',7,140000,{kon:1.5,zgr:1.5,tak:0.5,mor:1,reg:1,inj:1},'Ośrodek nad morzem: siła, skoczność i siatkówka plażowa, która buduje zgranie.'],
 ['kopaonik','Kopaonik','Serbia','🇷🇸',10,160000,{kon:2.5,zgr:1,tak:1,mor:-1,reg:0,inj:1.2},'Tani obóz wysokogórski. Mocny bodziec kondycyjny, skromne warunki obniżają humor.'],
 ['saalfelden','Saalfelden','Austria','🇦🇹',10,380000,{kon:2,zgr:1.5,tak:1,mor:1,reg:2,inj:0.9},'Alpejski ośrodek z dobrą odnową biologiczną. Kondycja bez nadmiernego zmęczenia.'],
 ['lignano','Lignano Sabbiadoro','Włochy','🇮🇹',10,400000,{kon:1,zgr:2.5,tak:3,mor:1.5,reg:1.5,inj:0.9},'Włoskie centrum siatkówki: sparingpartnerzy z Serie A, świetna praca nad taktyką i zgraniem.'],
 ['belek','Belek','Turcja','🇹🇷',10,350000,{kon:1.5,zgr:2,tak:1.5,mor:2.5,reg:2.5,inj:0.8},'Ciepło, hotel z pełnym zapleczem. Zawodnicy wracają wypoczęci i zadowoleni.'],
 ['livigno','Livigno','Włochy','🇮🇹',14,520000,{kon:3.5,zgr:1.5,tak:1,mor:0.5,reg:0.5,inj:1.4},'Długi obóz na 1800 m n.p.m. Największy przyrost kondycji i siły, wyższe ryzyko urazów.'],
 ['teneryfa','Teneryfa','Hiszpania','🇪🇸',12,600000,{kon:2,zgr:2.5,tak:2,mor:3,reg:2.5,inj:0.8},'Najdroższa opcja: wysokogórski trening w słońcu i komfort. Mocny plus we wszystkim.']];
const CAMP_FX=[['kon','Kondycja'],['zgr','Zgranie'],['tak','Taktyka'],['mor','Morale'],['reg','Świeżość'],['inj','Urazy']];
function campCost(c){const rep=SAVE.ai?SAVE.ai[SAVE.team].rep:50;return round5k(c[5]*(0.8+rep/250)*(myTeam().players.length/14));}
function campOf(){const c=SAVE.camp;return c&&S()&&c.season===S().n?c:null;}
function campCanBook(){const s=S();return !campOf()&&(s.phase==='off'||s.phase==='spar'&&s.spar.res.length<N_SPAR);}
function campBook(k){const c=CAMPS.find(x=>x[0]===k);if(!c||!campCanBook())return;const cost=campCost(c);
  if(SAVE.fin.bal-cost<-500000)return tradeMsg(false,`Za mało pieniędzy na obóz (${fmt(cost)}).`);
  if(ui.confirm!=='camp'+k){ui.confirm='camp'+k;render();return;}ui.confirm=null;
  money(-cost,'Obóz');finLog(`Obóz przygotowawczy: ${c[1]} (${c[2]})`,-cost);const s=S();
  SAVE.camp={k,season:s.n,cost,start:s.phase==='off'?null:addDays(today(),1),until:s.phase==='off'?null:addDays(today(),c[4]),done:0};
  news(`🏕️ Zarezerwowano obóz przygotowawczy: ${c[1]} (${c[2]}), ${c[4]} dni.${s.phase==='off'?' Ruszy razem z przygotowaniami do sezonu.':''}`);save();tradeMsg(true,`Obóz w ${c[1]} zarezerwowany.`);}
function campStart(){const c=campOf();if(!c||c.start)return;const d=CAMPS.find(x=>x[0]===c.k);c.start=today();c.until=addDays(today(),d[4]);news(`🚌 Drużyna wyjeżdża na obóz: ${d[1]} (${d[2]}). Powrót ${fmtDMY(c.until)}.`);}
function campDay(d){const c=campOf();if(!c||c.done||!c.until||d<c.until)return;const C=CAMPS.find(x=>x[0]===c.k);const fx=C[6];c.done=1;const t=myTeam();const rows=[];
  const k=0.9+staffSkill('fiz')/40;// trener przygotowania fizycznego wzmacnia efekt
  for(const p of t.players){if(p.inj)continue;p.xp=p.xp||{};const ups=[];
    for(const a of ['kon','szy','sil','sko']){if(p[a]>=20)continue;const v=(p.xp[a]||0)+fx.kon*0.28*k*(0.7+R()*0.6)*(p.age>=31?0.7:1);if(v>=1){p[a]++;p.xp[a]=Math.round((v-1)*100)/100;ups.push(a);}else p.xp[a]=Math.round(v*1000)/1000;}
    addMor(p,fx.mor*5);p.fr=Math.round(clamp(72+fx.reg*8+(R()*6-3),40,100));
    if(R()<0.025*fx.inj*(1.25-p.kon/20*0.5)){const days=Math.max(3,Math.round(4+R()*10));p.inj=days;p.injUntil=addDays(d,days);p.injN=injName(days);p.injD=days;rows.push([p.id,p.last,ups,days]);continue;}
    rows.push([p.id,p.last,ups,0]);}
  // zgranie par i znajomość taktyki
  const P=SAVE.pairs||(SAVE.pairs={});const ps=t.players;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const key=pairKey(ps[i].id,ps[j].id);P[key]=(P[key]!=null?P[key]:pairN(ps[i],ps[j]))+Math.round(fx.zgr*3);}
  try{const tc=myTac();for(const [el] of TF_EL)famAdd(SAVE.team,el+':'+tfVal(tc,el),fx.tak*5);}catch(e){}
  const up=rows.filter(r=>r[2].length).length,inj=rows.filter(r=>r[3]);
  sendMail({cat:'trening',from:asyName(),t:`Obóz w ${C[1]} zakończony`,s:`${up} zawodników poprawiło cechy fizyczne${inj.length?`, kontuzje: ${inj.length}`:''}.`,b:{type:'camp',k:c.k,rows,cost:c.cost},lab:'Obóz'});
  news(`🏕️ Koniec obozu w ${C[1]}. Drużyna wraca do klubu.`);}
function campMailHtml(b){const C=CAMPS.find(x=>x[0]===b.k);const fx=C[6];
  return `<p class="mtext">Wróciliśmy z obozu w ${esc(C[1])} (${C[3]} ${esc(C[2])}, ${C[4]} dni, koszt ${fmt(b.cost)}). Podsumowanie:</p>
   <div class="campfx">${CAMP_FX.map(([k,n])=>`<span class="tkp ${k==='inj'?(fx[k]>1?'r':'g'):fx[k]>0?'g':fx[k]<0?'r':'y'}">${n}: ${campLvl(fx[k],k)}</span>`).join('')}</div>
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Podniesione cechy</th><th>Uraz</th></tr></thead><tbody>${b.rows.map(r=>`<tr><td class="l"><button class="link pn" onclick="openPop('${r[0]}')">${esc(r[1])}</button></td><td class="l">${r[2].map(a=>`<span class="trt tu-up">${attrSh(a)} +1</span>`).join('')||'<span class="mut">—</span>'}</td><td>${r[3]?`<span class="bad">🚑 ${r[3]} dni</span>`:'<span class="mut">—</span>'}</td></tr>`).join('')}</tbody></table></div>
   <p class="small mut">Zgranie par i znajomość taktyki wzrosły — sprawdzisz to w Centrum danych i w zakładce Taktyka → Skuteczność.</p>`;}
function campLvl(v,k){if(k==='inj')return v>=1.3?'wysokie':v>=1?'normalne':'niskie';if(v<0)return 'spadek';const n=Math.round(v);return n<=0?'—':'●'.repeat(Math.min(4,n))+'○'.repeat(Math.max(0,4-Math.min(4,n)));}
function campCard(){const c=campOf();const s=S();
  if(c){const C=CAMPS.find(x=>x[0]===c.k);return `<div class="card"><h2>Obóz przygotowawczy</h2><div class="campsel"><span class="campflag">${C[3]}</span><div><b>${esc(C[1])}</b> <span class="mut small">${esc(C[2])} · ${C[4]} dni · ${fmt(c.cost)}</span><div class="small">${c.done?'<span class="good">Obóz zakończony — raport w poczcie.</span>':c.start?`Trwa: ${fmtShort(c.start)} – ${fmtShort(c.until)}`:'Wyjazd razem ze startem przygotowań do sezonu.'}</div></div></div></div>`;}
  if(!campCanBook())return '';
  return `<div class="card"><h2>Obóz przygotowawczy</h2><p class="small mut">Wybierz miejsce obozu przed sezonem. Każde daje inne korzyści i kosztuje inaczej. Efekt wzmacnia trener przygotowania fizycznego. Jeden obóz na sezon${s.phase==='off'?'; wyjazd nastąpi razem ze startem przygotowań':'; wyjazd jutro'}.</p>
   <div class="campgrid">${CAMPS.map(C=>{const cost=campCost(C);const fx=C[6];return `<div class="campc ${ui.confirm==='camp'+C[0]?'on':''}"><div class="row" style="gap:8px"><span class="campflag">${C[3]}</span><div><b>${esc(C[1])}</b><div class="small mut">${esc(C[2])} · ${C[4]} dni</div></div><span class="sp"></span><b class="acc">${fmt(cost)}</b></div>
     <p class="small mut" style="margin:6px 0">${esc(C[7])}</p><div class="campfx">${CAMP_FX.map(([k,n])=>`<div><span>${n}</span><b class="${k==='inj'?(fx[k]>1?'bad':fx[k]<1?'good':''):fx[k]<0?'bad':''}">${campLvl(fx[k],k)}</b></div>`).join('')}</div>
     <button class="${ui.confirm==='camp'+C[0]?'btn':'ghost'} sm" style="margin-top:8px;width:100%" onclick="campBook('${C[0]}')">${ui.confirm==='camp'+C[0]?`Potwierdź: zapłacisz ${fmt(cost)}`:'Wybierz'}</button></div>`;}).join('')}</div></div>`;}
