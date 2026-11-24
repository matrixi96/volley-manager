// ================= SPONSORZY =================
// SAVE.spons={act:[{id,cat,n,col,m,left,start,months}],off:{cat:[{id,n,col,m}]},ref:'RRRR-MM',nid}
const SP_CAT=[['tit','Tytularny',0.38,'Nazwa klubu w szyldzie ligi, największe pieniądze. Zawsze dokładnie jeden.'],['main','Główny',0.2,'Logo na przodzie koszulek i na parkiecie.'],['tech','Techniczny',0.09,'Stroje i sprzęt: oprócz pieniędzy trochę mniej kontuzji.'],['mid','Średni',0.045,'Bandy reklamowe, rękawy koszulek.'],['small','Mały',0.016,'Lokalne firmy: drobne, ale pewne pieniądze.']];
const SP_BASE=260000;
const SP_A=['Vistula','Baltic','Polon','Mazovia','Warta','Odra','Tatra','Silesia','Amber','Kronos','Orbita','Nova','Delta','Atlas','Horyzont','Sokół','Żubr','Magnum','Karpaty','Bursztyn','Pomorze','Wawel','Narew','Kujawy','Jantar','Lechia','Mewa','Sudety'];
const SP_B=['Energia','Logistics','Bank','Telecom','Foods','Ubezpieczenia','Motors','Steel','Pharma','Tech','Group','Budownictwo','Media','Travel','Wody','Chem','Software','Paliwa','Agro','Meble','Okna','Dom','Finanse','Transport'];
const SP_T1=['Spike','Vertex','Arvo','Kinetic','Jump','Libero','Ace','Net','Block','Smash','Volta','Rally'],SP_T2=['Sport','Pro','Wear','Athletics','Gear','Team'];
const SP_COL=['#e8b73a','#38bdf8','#ef6b5b','#5ad17a','#a78bfa','#f97316','#2dd4bf','#f472b6','#94a3b8','#facc15'];
function SPN(){const s=SAVE.spons||(SAVE.spons={act:[],off:{},ref:null,nid:1});if(!s.off)s.off={};if(!s.act)s.act=[];return s;}
// ---- poziom sponsora (1–5 gwiazdek): od niego zależy kwota i zwykle długość umowy ----
const SP_TIER=[null,0.6,0.8,1.0,1.25,1.55];
const SP_TIER_N=[null,'lokalna firma','firma regionalna','firma ogólnopolska','duża marka','globalna marka'];
// ilu sponsorów (poza tytularnym) chce współpracować z klubem: renoma, wyniki, siedziba, gwiazdy, social media
function spCap(){const rep=SAVE.ai[SAVE.team].rep;let pb=0;try{const s=S();if(s&&(s.phase==='liga'||s.phase==='po')){const pos=leagueTable().findIndex(x=>x.i===SAVE.team)+1;pb=pos<=2?1:pos<=4?0.5:pos>=10?-0.5:0;}}catch(e){}
  return Math.max(2,Math.round(3+rep/9+(myInfra().sied-1)*0.5+pb+spStar()[0]*10));}
function spNonTit(){return SPN().act.filter(c=>c.cat!=='tit').length;}
// zgodność ze starym kodem: brak limitu miejsc poza tytularnym
function spSlots(){return {tit:1,main:99,tech:99,mid:99,small:99};}
function spSlotsTxt(){return '';}
function spStar(){const t=myTeam();const best=t.players.slice().sort((a,b)=>rating(b)-rating(a))[0];if(!best)return [0,null];const r=rating(best);return [(r>=88?0.12:r>=84?0.07:r>=80?0.03:0)+(best.star?0.04:0),best];}
function spQuality(){const rep=SAVE.ai[SAVE.team].rep;const s=S();let pb=0;try{if(s&&(s.phase==='liga'||s.phase==='po')){const pos=leagueTable().findIndex(x=>x.i===SAVE.team)+1;pb=pos<=2?0.08:pos<=4?0.04:pos>=10?-0.04:0;}}catch(e){}
  return clamp(0.55+rep/100*0.55+(myInfra().sied-1)*0.03+spStar()[0]+pb+(typeof socSpB==='function'&&SAVE.soc?socSpB():0)-(SPN().brk||0)*0.04,0.45,1.7);}
// średni poziom chętnych sponsorów (gwiazdki)
function spTierMean(){return clamp(1+(spQuality()-0.55)/1.1*4,1,5);}
function spTierRoll(){return clamp(Math.round(spTierMean()+nz()*0.8),1,5);}
function spName(cat){if(cat==='tech')return SP_T1[Math.floor(R()*SP_T1.length)]+' '+SP_T2[Math.floor(R()*SP_T2.length)];return SP_A[Math.floor(R()*SP_A.length)]+' '+SP_B[Math.floor(R()*SP_B.length)];}
function spDurMul(mo){return 1.05-0.01*(mo-1);}
function spMonthsRoll(t){const opts=t>=4?[6,12,12,18,24]:t>=3?[6,9,12,12,18]:[3,6,6,9,12];return opts[Math.floor(R()*opts.length)];}
function spOffer(cat,crowd){const s=SPN();const sh=SP_CAT.find(x=>x[0]===cat)[2];const t=spTierRoll();const mo=spMonthsRoll(t);
  const m=Math.round(SP_BASE*sh*SP_TIER[t]*LG_ECO[myLg()]*(0.85+R()*0.3)*crowd*(1+(typeof finSk==='function'?finSk():0)/20*0.05)*spDurMul(mo)/1000)*1000;
  return {id:'sp'+(s.nid++),cat,n:spName(cat),col:SP_COL[Math.floor(R()*SP_COL.length)],m,mo,t};}
function genSpOffers(){const s=SPN();s.off={};for(const [k] of SP_CAT)s.off[k]=[];
  const tit=s.act.find(c=>c.cat==='tit');const nt=tit?(tit.left<=2?2:R()<0.4?1:0):2+(R()<0.5?1:0);for(let i=0;i<nt;i++)s.off.tit.push(spOffer('tit',1));
  const free=Math.max(0,spCap()-spNonTit());const k=Math.min(6,free+(R()<0.3?1:0));const crowd=1;
  const W=[['main',0.2],['tech',0.12],['mid',0.33],['small',0.35]];
  for(let i=0;i<k;i++){let r=R(),c='small';for(const [cat,w] of W){r-=w;if(r<=0){c=cat;break;}}s.off[c].push(spOffer(c,crowd));}
  for(const kk in s.off)s.off[kk].sort((a,b)=>b.m-a.m);s.ref=(SAVE._now||today()).slice(0,7);}
function spUsed(cat){return SPN().act.filter(c=>c.cat===cat).length;}
function spFreeN(){const s=SPN();return (spUsed('tit')?0:1)+SP_CAT.filter(x=>x[0]!=='tit').reduce((a,[k])=>a+(s.off[k]||[]).length,0)*(spNonTit()<spCap()?1:0);}
function spMonthly(){return SPN().act.reduce((a,c)=>a+c.m,0);}
function sponsorAmt(){return spMonthly()*12;}
function techBonus(){const xs=SPN().act.filter(x=>x.cat==='tech');if(!xs.length)return 0;const c=xs.sort((a,b)=>b.m-a.m)[0];return clamp(0.02+c.m/(SP_BASE*0.09)*0.03,0,0.07);}
// kara za zerwanie: 40% wartości pozostałych rat, co najmniej jedna rata
function spPenalty(c){return Math.max(c.m,round5k(c.m*c.left*0.4));}
function spBudRemove(c){const b=typeof BUD==='function'?BUD():null;if(!b||typeof spMonthsLeft!=='function')return;let sub=c.m*spMonthsLeft(c.left)*budAcc();const sp=typeof budFree==='function'?budFree():budSplit();if(typeof spPlanNew==='function'&&(b.spGot||0)>=sub){const pl=spPlanNew(b),g=b.spGot;b.spGot=g-sub;sub=Math.max(0,g-pl)-Math.max(0,g-sub-pl);}if(sub<=0)return;b.pool-=round5k(sub);b.wg-=round5k(sub*sp.wg);b.op-=round5k(sub*sp.op);b.tr=Math.max(0,b.tr-round5k(sub*sp.tr));}
function breakSponsor(id,silent){const s=SPN();const c=s.act.find(x=>x.id===id);if(!c)return false;if(!silent&&ui.confirm!=='spb'+id){ui.confirm='spb'+id;render();return false;}ui.confirm=null;
  const pen=spPenalty(c);money(-pen,'Kara umowna');finLog(`Zerwanie umowy sponsorskiej: ${c.n}`,-pen);spBudRemove(c);s.act=s.act.filter(x=>x!==c);s.brk=(s.brk||0)+1;
  news(`✂️ Zerwano umowę ze sponsorem ${c.n}. Kara umowna: ${fmt(pen)}. Inni sponsorzy to zauważą (słabsze oferty przez kilka miesięcy).`);
  if(!silent){ui.spMsg={ok:true,t:`Umowa z ${c.n} zerwana. Kara: ${fmt(pen)}.`};save();render();}return true;}
function signSponsor(cat,id){const s=SPN();const o=(s.off[cat]||[]).find(x=>x.id===id);if(!o)return;
  if(cat==='tit'){const cur=s.act.find(c=>c.cat==='tit');if(cur){if(ui.confirm!=='spt'+id){ui.confirm='spt'+id;render();return;}ui.confirm=null;breakSponsor(cur.id,true);}}
  else if(spNonTit()>=spCap()+1){ui.spMsg={ok:false,t:'Klub ma już tylu sponsorów, ilu jest w stanie obsłużyć przy obecnej renomie.'};render();return;}
  const m=o.m,mo=o.mo;const c={id:o.id,cat,n:o.n,col:o.col,m,left:mo-1,months:mo,start:today(),t:o.t};if(typeof spBudAdd==='function')spBudAdd(m,mo,cat);s.act.push(c);achEv('sp');s.off[cat]=s.off[cat].filter(x=>x.id!==id);
  money(m,'Sponsor');finLog(`Sponsor ${o.n}: pierwsza rata`,m);news(`🤝 Nowy sponsor (${SP_CAT.find(x=>x[0]===cat)[1].toLowerCase()}, ${'★'.repeat(o.t)}): ${o.n} — ${fmt(m)} miesięcznie przez ${mo} mies.`);
  ui.spMsg={ok:true,t:`Podpisano umowę z ${o.n}: ${fmt(m)}/miesiąc, ${mo} mies.`};save();render();}
function addMonths(d,n){const [y,m]=d.split('-').map(Number);const t=new Date(Date.UTC(y,m-1+n,1));return t.getUTCFullYear()+'-'+String(t.getUTCMonth()+1).padStart(2,'0')+'-01';}
// 1. dnia miesiąca: raty, wygasanie umów, nowe oferty. Zwraca {inc}
function sponsorsMonth(d){const s=SPN();let inc=0;const ended=[],ending=[];s.brk=Math.round((s.brk||0)*0.75*100)/100;
  for(const c of s.act.slice()){if(c.left>0){inc+=c.m;c.left--;if(c.left===0)ending.push(c);}else{ended.push(c);s.act=s.act.filter(x=>x!==c);}}
  genSpOffers();
  for(const c of ended)sendMail({cat:'spon',from:'Dział marketingu',t:`Wygasła umowa: ${c.n}`,s:`Umowa sponsorska (${SP_CAT.find(x=>x[0]===c.cat)[1].toLowerCase()}) wygasła. Sprawdź nowe oferty.`,b:{type:'spexp',c},act:1,lab:'Umowa wygasła'});
  for(const c of ending)sendMail({cat:'spon',from:'Dział marketingu',t:`Ostatni miesiąc umowy: ${c.n}`,s:`Od 1. dnia przyszłego miesiąca umowa wygaśnie.`,b:{type:'spexp',c,soon:1},lab:'Koniec umowy'});
  const n=Object.values(s.off).reduce((a,x)=>a+x.length,0);
  sendMail({cat:'spon',from:'Dział marketingu',t:`Nowe oferty sponsorskie: ${MON_NOM[+d.slice(5,7)-1]}`,s:`${n} ${n===1?'oferta':n<5?'oferty':'ofert'}. Chętnych sponsorów: ${spNonTit()}/${spCap()}. ${s.off.tit[0]?'Oferta tytularna: '+fmt(s.off.tit[0].m)+'/mies.':''}`,b:{type:'spons',free:n},act:n?1:0,lab:'Oferty'});
  return {inc};}
function initSponsors(){const s=SPN();if(s.init)return;s.init=1;genSpOffers();
  for(const k of ['tit','main','tech']){let o=s.off[k][0];if(!o)o=spOffer(k,1);s.act.push({id:o.id,cat:k,n:o.n,col:o.col,m:o.m,left:3,months:4,start:today(),t:o.t});s.off[k]=s.off[k].filter(x=>x!==o);}
  sendMail({cat:'spon',from:'Dział marketingu',t:'Sponsorzy klubu',s:'Mamy tytularnego i głównego sponsora na najbliższe miesiące. Kolejne oferty czekają.',b:{type:'spons'},act:1,lab:'Oferty'});}
function spStars(t){return `<span style="color:#e8b73a" title="${SP_TIER_N[t||3]}">${'★'.repeat(t||3)}<span class="mut">${'★'.repeat(5-(t||3))}</span></span>`;}
function sponsMailHtml(m){const b=m.b;if(b.type==='spexp')return `<p class="mtext">${b.soon?`To ostatni miesiąc umowy ze sponsorem <b>${esc(b.c.n)}</b> (${fmt(b.c.m)}/mies.).`:`Umowa ze sponsorem <b>${esc(b.c.n)}</b> wygasła.`}</p><div class="mact"><button class="btn" onclick="mailDone('${m.id}');go('sponsorzy')">Sponsorzy</button></div>`;
  const s=SPN();const L=Object.values(s.off).flat().sort((a,b)=>b.m-a.m).slice(0,6);return `<p class="mtext">Oferty odświeżają się 1. dnia miesiąca. Liczba chętnych sponsorów i ich poziom zależą od renomy klubu, wyników, gwiazd w składzie, siedziby i social mediów.</p>
   <div class="tw"><table><thead><tr><th class="l">Sponsor</th><th class="l">Rodzaj</th><th>Poziom</th><th>Mies.</th><th>Umowa</th></tr></thead><tbody>${L.map(o=>`<tr><td class="l">${esc(o.n)}</td><td class="l">${SP_CAT.find(x=>x[0]===o.cat)[1]}</td><td>${spStars(o.t)}</td><td><b>${fmt(o.m)}</b></td><td>${o.mo} mies.</td></tr>`).join('')}</tbody></table></div>
   <div class="mact"><button class="btn" onclick="mailDone('${m.id}');go('sponsorzy')">Sponsorzy</button></div>`;}
function spBadge(c){return `<span class="spb" style="--sc:${c.col}">${esc(c.n.split(' ').map(w=>w[0]).join(''))}</span>`;}
function sponsorView(){initSponsors();const s=SPN();const q=spQuality();const [sb,star]=spStar();const cap=spCap(),nt=spNonTit();const next=addMonths(today(),1);const tm=spTierMean();
  return `<div class="kstrip"><div><span>Od sponsorów</span><b class="acc">${fmt(spMonthly())}</b><small>miesięcznie (płatne 1. dnia)</small></div><div><span>Sponsorzy</span><b>${nt}/${cap}</b><small>tylu chce współpracować przy obecnej renomie (bez tytularnego)</small></div>
   <div><span>Atrakcyjność klubu</span><b>${spStars(Math.round(tm))}</b><small>renoma ${SAVE.ai[SAVE.team].rep}/100${star&&sb>0?` · gwiazda: ${esc(star.last)}`:''}${s.brk>=0.5?' · <span class="bad">zerwane umowy obniżają oferty</span>':''}</small></div><div><span>Nowe oferty</span><b>${fmtShort(next)}</b><small>sponsor sam proponuje kwotę i długość umowy</small></div></div>
  ${ui.spMsg?`<div class="card tmsg ${ui.spMsg.ok?'ok':'no'}">${esc(ui.spMsg.t)}</div>`:''}
  ${spUsed('tit')?'':'<div class="card tmsg no">Klub nie ma sponsora tytularnego — to największe pieniądze. Wybierz jedną z ofert poniżej.</div>'}
  ${SP_CAT.map(([k,n,,d])=>{const act=s.act.filter(c=>c.cat===k);const offs=s.off[k]||[];if(!act.length&&!offs.length&&k!=='tit')return '';
   return `<div class="card"><div class="row wrap"><h2 style="margin:0">${n}</h2><span class="small mut" style="margin-left:10px">${esc(d)}</span><span class="sp"></span><span class="small">Umów: <b>${act.length}</b></span></div>
    <div class="spgrid">${act.map(c=>`<div class="spact"><div>${typeof spLogo==='function'?spLogo(c,42):spBadge(c)} ${spStars(c.t)}<div class="small mut">${fmt(c.m)}/mies. · ${c.left>0?`jeszcze ${c.left} ${c.left===1?'rata':c.left<5?'raty':'rat'} (do ${fmtDMY(addMonths(today(),c.left))})`:'ostatni miesiąc'}</div>${c.left>0?`<button class="link small" onclick="breakSponsor('${c.id}')">${ui.confirm==='spb'+c.id?`Na pewno? Kara ${fmt(spPenalty(c))}`:'Zerwij umowę'}</button>`:''}</div></div>`).join('')||(k==='tit'?'<div class="spact empty">Brak sponsora tytularnego</div>':'')}</div>
    ${offs.length?`<div class="tw"><table><thead><tr><th class="l">Oferta</th><th>Poziom</th><th>Miesięcznie</th><th>Długość</th><th>Wpływ na budżety</th><th></th></tr></thead><tbody>${offs.map(o=>{const cur=k==='tit'?act[0]:null;const conf=ui.confirm==='spt'+o.id;
      return `<tr><td class="l"><span class="fcell">${spBadge(o)}<b>${esc(o.n)}</b></span><div class="small mut">${SP_TIER_N[o.t]}</div></td><td>${spStars(o.t)}</td><td><b>${fmt(o.m)}</b></td><td>${o.mo} mies.<div class="small mut">razem ${fmtShort2(o.m*o.mo)}</div></td>
      <td class="small">${typeof spBudTxt==='function'?spBudTxt(o.m,o.mo,k):''}</td>
      <td><button class="btn sm" onclick="signSponsor('${k}','${o.id}')">${cur?(conf?`Na pewno? Kara za zerwanie obecnej: ${fmt(spPenalty(cur))}`:'Zerwij obecną i podpisz'):'Podpisz'}</button></td></tr>`;}).join('')}</tbody></table></div>`:`<p class="mut small">${k==='tit'?'Brak nowych ofert tytularnych w tym miesiącu.':'Brak nowych ofert w tym miesiącu.'}</p>`}</div>`;}).join('')}
  <p class="small mut">Sponsor sam proponuje kwotę i długość umowy — możesz przyjąć albo czekać na lepszą ofertę. Liczba chętnych sponsorów i ich poziom (1–5 gwiazdek) zależą od renomy klubu, miejsca w tabeli, gwiazd w składzie, siedziby i social mediów. Zerwanie umowy kosztuje 40% wartości pozostałych rat (co najmniej jedną ratę) i na kilka miesięcy obniża przyszłe oferty.</p>`;}

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
  let D=(1400+rep*25)*(1+0.05*(L-1))*([1.25,1.08,1][LG_LV[lgOf(ti)]]||1)*pm*pos*(est?1:0.85+R()*0.3)*k*(mine&&SAVE.soc&&typeof socCrowdB==='function'?1+socCrowdB():1)*(mine&&typeof fansK==='function'?fansK():1);
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
  const cars=Math.round(Math.min(parkSpots(inf.park),T*0.3*clamp(1.25-0.05*pp,0.1,1.2)*(est?1:0.9+R()*0.2)));const parking=cars*pp;
  const gl=[];let gas=0;const sm=0.7+0.1*inf.gastro;
  for(const [key,n,lv,ref,cost,rate] of GAS_PR){if(inf.gastro<lv)continue;const pr=ov.gas&&ov.gas[key]!=null?ov.gas[key]:e.gas[key];const q=Math.round(T*rate*sm*clamp(Math.pow(ref/Math.max(1,pr),1.6),0.05,2.5)*(est?1:0.88+R()*0.24));const pf=q*(pr-cost);gl.push({key,n,q,pr,pf});gas+=pf;}
  return {att,vAtt,gAtt,cars,T,tickets,vip,guests,parking,gas,gl,tot:tickets+vip+guests+parking+gas};}
function payMatchday(k,att,opp){const r=matchday(k,att,opp,false);money(r.tickets+r.vip+r.guests,'Bilety');money(r.gas,'Gastronomia');money(r.parking,'Parking');
  const e=ECO();const inf=myInfra();const rec={d:today(),opp,kind:k===1?'Liga':k>1?'Play-off':'Sparing',att:r.att,cap:HALA_CAP[inf.hala-1],h:k===1?karHolders().tot:0,vAtt:r.vAtt,gAtt:r.gAtt,cars:r.cars,
    tickets:r.tickets,vip:r.vip,guests:r.guests,gas:r.gas,parking:r.parking,tot:r.tot,tix:e.tix,park:e.park,gl:r.gl.map(x=>({n:x.n,q:x.q,pr:x.pr,pf:x.pf}))};
  e.last=rec;e.mdLog=e.mdLog||[];const prev=e.mdLog[0]||null;e.mdLog.unshift(rec);e.mdLog=e.mdLog.slice(0,60);
  if(typeof sendMail==='function'){const dlt=prev?rec.tot-prev.tot:null;sendMail({cat:'fin',from:'Księgowość klubu',t:`Dzień meczowy: ${TEAMS[opp]?TEAMS[opp].name:'mecz u siebie'}`,s:`${rec.att.toLocaleString('pl-PL')} widzów · przychód ${fmt(rec.tot)}${dlt!=null?` (${dlt>=0?'+':''}${fmt(dlt)} wobec poprzedniego meczu)`:''}`,b:{type:'md',rec,prev},lab:'Podsumowanie dnia meczowego'});}
  return r;}
function mdDelta(a,b,money){if(b==null)return '<span class="mut">–</span>';const d=a-b;if(!d)return '<span class="mut">bez zmian</span>';const p=b?Math.round(d/b*100):null;return `<span class="${d>0?'good':'bad'}">${d>0?'▲ +':'▼ '}${money?fmtFull(d):d.toLocaleString('pl-PL')}${p!=null&&isFinite(p)?` (${d>0?'+':''}${p}%)`:''}</span>`;}
function mdFinMailHtml(b){const r=b.rec,p=b.prev;const v=(x,m)=>m?fmtFull(x):(x||0).toLocaleString('pl-PL');
  const row=(l,k,m)=>`<tr><td class="l">${l}</td><td><b>${v(r[k],m)}</b></td><td class="mut">${p?v(p[k],m):'–'}</td><td>${mdDelta(r[k],p?p[k]:null,m)}</td></tr>`;
  const notes=[];if(p){if(r.tix!==p.tix)notes.push(`cena biletu ${p.tix} → ${r.tix} zł`);if(r.park!==p.park)notes.push(`parking ${p.park} → ${r.park} zł`);if(p.opp!=null&&TEAMS[p.opp])notes.push(`poprzedni mecz u siebie: ${TEAMS[p.opp].name} (${fmtDMY(p.d)})`);}
  return `<div class="kstrip in"><div><span>Widzowie</span><b>${r.att.toLocaleString('pl-PL')}</b><small>na ${r.cap.toLocaleString('pl-PL')} miejsc · ${Math.round(r.att/r.cap*100)}%${r.h?` · ${r.h} z karnetem`:''}</small></div><div><span>Przychód z meczu</span><b class="good">${fmt(r.tot)}</b><small>${p?mdDelta(r.tot,p.tot,true):'pierwszy mecz u siebie'}</small></div><div><span>Rozgrywki</span><b>${esc(r.kind)}</b><small>${fmtDMY(r.d)}</small></div></div>
   <div class="tw"><table><thead><tr><th class="l">Pozycja</th><th>Ten mecz</th><th>Poprzedni</th><th>Zmiana</th></tr></thead><tbody>
   ${row('Widzowie na trybunach','att')}${r.vAtt||(p&&p.vAtt)?row('Goście w loży VIP','vAtt'):''}${r.gAtt||(p&&p.gAtt)?row('Kibice w sektorze gości','gAtt'):''}${row('Auta na parkingu','cars')}
   ${row('Bilety','tickets',1)}${r.vip||(p&&p.vip)?row('Loża VIP','vip',1):''}${r.guests||(p&&p.guests)?row('Sektor gości','guests',1):''}${row('Gastronomia (zysk)','gas',1)}${row('Parking','parking',1)}
   <tr><td class="l"><b>Razem</b></td><td><b class="good">${fmtFull(r.tot)}</b></td><td class="mut">${p?fmtFull(p.tot):'–'}</td><td>${mdDelta(r.tot,p?p.tot:null,true)}</td></tr></tbody></table></div>
   ${r.gl&&r.gl.length?`<h3>Gastronomia</h3><div class="tw"><table><thead><tr><th class="l">Produkt</th><th>Sprzedane</th><th>Cena</th><th>Zysk</th><th>Zmiana sprzedaży</th></tr></thead><tbody>${r.gl.map(x=>{const q=p&&p.gl?p.gl.find(y=>y.n===x.n):null;return `<tr><td class="l">${x.n}</td><td>${x.q}</td><td>${x.pr} zł</td><td class="good">${fmtFull(x.pf)}</td><td>${q?mdDelta(x.q,q.q):'<span class="mut">nowość</span>'}</td></tr>`;}).join('')}</tbody></table></div>`:''}
   ${notes.length?`<p class="small mut">${notes.join(' · ')}</p>`:''}`;}
function mdTableCard(){const L=(ECO().mdLog||[]);if(!L.length)return `<div class="card"><h2>Podsumowanie dnia meczowego</h2><p class="small mut">Tabela wypełni się po pierwszym meczu u siebie.</p></div>`;
  const sum=L.reduce((a,r)=>a+r.tot,0);
  return `<div class="card"><h2>Podsumowanie dnia meczowego</h2><p class="small mut">Każdy mecz u siebie: widzowie i przychody. Ostatnia kolumna porównuje z poprzednim meczem u siebie. Szczegóły każdego meczu są w Poczcie.</p>
   <div class="tw"><table class="mdt"><thead><tr><th class="l">Data</th><th class="l">Rywal</th><th>Widzowie</th><th>Bilety</th><th>Loża VIP</th><th>Goście</th><th>Gastronomia</th><th>Parking</th><th>Razem</th><th>vs poprzedni</th></tr></thead><tbody>
   ${L.map((r,i)=>{const p=L[i+1];return `<tr><td class="l">${fmtDMY(r.d)}</td><td class="l">${r.opp!=null&&TEAMS[r.opp]?tDot(r.opp)+esc(TEAMS[r.opp].name):'—'} <small class="mut">${esc(r.kind)}</small></td><td>${r.att.toLocaleString('pl-PL')} <small class="mut">${Math.round(r.att/r.cap*100)}%</small></td><td>${fmtFull(r.tickets)}</td><td>${r.vip?fmtFull(r.vip):'–'}</td><td>${r.guests?fmtFull(r.guests):'–'}</td><td>${fmtFull(r.gas)}</td><td>${fmtFull(r.parking)}</td><td><b class="good">${fmtFull(r.tot)}</b></td><td class="small">${mdDelta(r.tot,p?p.tot:null,true)}</td></tr>`;}).join('')}
   <tr><td class="l" colspan="8"><b>Razem (${L.length} ${L.length===1?'mecz':L.length<5?'mecze':'meczów'})</b></td><td><b class="good">${fmtFull(sum)}</b></td><td class="small mut">średnio ${fmtFull(Math.round(sum/L.length))}</td></tr></tbody></table></div></div>`;}
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
function shopMonth(L,est){const e=ECO();L=L||myInfra().sklep;const rep=SAVE.ai?SAVE.ai[SAVE.team].rep:50;const F=(300+rep*20)*(1+0.15*(L-1))/1000*(SAVE.soc&&typeof socShopB==='function'?1+socShopB():1);const m=SAVE._now?+SAVE._now.slice(5,7):+today().slice(5,7);
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
   ${priceRow('kar.u','Karnet ulgowy',e.kar.u,karBest('u'),`sprzedane: ${ks.u} · cel przy tej cenie ok. ${karTarget('u',e.kar.u)} · ${karPerMatch('u')}`,10)}
   ${priceRow('kar.n','Karnet normalny',e.kar.n,karBest('n'),`sprzedane: ${ks.n} · cel przy tej cenie ok. ${karTarget('n',e.kar.n)} · ${karPerMatch('n')}`,10)}
   ${inf.vip?priceRow('kar.v','Karnet VIP',e.kar.v,karBest('v'),`sprzedane: ${ks.v} · cel przy tej cenie ok. ${karTarget('v',e.kar.v)} · ${karPerMatch('v')}`,50):'<p class="small mut">Karnet VIP: dostępny po zbudowaniu loży VIP.</p>'}
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

// karnet: cena za jeden mecz i porównanie z biletem (karnet powinien wychodzić taniej niż bilety kupowane osobno)
function karPerMatch(k){const e=ECO();const n=Math.max(1,Math.ceil(nRounds()/2));const per=Math.round(e.kar[k]/n);const single=k==='v'?e.vipP:e.tix;
  const pct=Math.round((1-per/single)*100);return pct>0?`<b>${per} zł za mecz</b> (${pct}% taniej niż bilet ${k==='v'?'VIP':'normalny'} ${single} zł)`:`<b class="bad">${per} zł za mecz — drożej niż bilet ${k==='v'?'VIP':'normalny'} (${single} zł), kibice wolą kupować bilety</b>`;}

// ===== Budżety klubu: transferowy, płacowy, operacyjny + dyrektor finansowy =====
// Budżet ustalany na sezon z prognozy przychodów. Dyrektor finansowy dzieli pieniądze, dokładniej prognozuje i pilnuje wydatków.
const BUD_DEF={wg:0.64,op:0.2,tr:0.16};
function finSk(){return SAVE.staff&&SAVE.staff.fin?SAVE.staff.fin.skill:0;}
function finName(){const s=SAVE.staff&&SAVE.staff.fin;return s?`${s.first} ${s.last}`:null;}
// prognoza rocznych przychodów (sponsorzy, TV, dzień meczowy, sklep, karnety)
// sponsorzy: podpisane umowy albo (gdy są wolne miejsca) typowa wartość ofert, które klub może podpisać
function spPotential(){try{const q=spQuality();const sig=spMonthly();const free=Math.max(0,spCap()-spNonTit());const avgSh=0.2*0.2+0.12*0.09+0.33*0.045+0.35*0.016;let t=sig+free*SP_BASE*avgSh*q*LG_ECO[myLg()]*0.85;if(!spUsed('tit'))t+=SP_BASE*0.38*q*LG_ECO[myLg()]*0.85;return t*12;}catch(e){return sponsorAmt();}}
function revForecast(){try{const md=matchday(1,null,null,true);const kh=ECO().karS&&ECO().karS.season===S().n?ECO().karS.inc:0;
  return Math.max(sponsorAmt(),spPotential())+tvRound()*nRounds()+md.tot*Math.ceil(nRounds()/2)+shopIncome(myInfra().sklep)*12+kh;}catch(e){return 3000000;}}
// bez dyrektora zarząd planuje ostrożnie (85% prognozy); dobry dyrektor do 100%
function budAcc(){const fs=finSk();return fs?0.9+fs/20*0.1:0.85;}
function budSplit(){return Object.assign({},BUD_DEF,SAVE.budSplit||{});}
// koszty stałe spoza pensji i utrzymania (skauting, bazy danych) — wcześniej nie były w planie i co roku „zjadały” oszczędności
function fixedYear(){try{const x=SAVE.sc||{};const subs=Object.keys(x.sub||{}).filter(k=>x.sub[k]).length;return ((x.bud||0)+subs*(typeof SUB_COST!=='undefined'?SUB_COST:15000))*12;}catch(e){return 0;}}
// zarząd wydaje tylko część oszczędności ponad bezpieczną poduszkę (500 tys.)
// oszczędności liczą się do budżetu dopiero powyżej 1 mln zł (bezpiecznik przed przejadaniem rezerw)
function budResTh(){const e=SAVE.team!=null?(LG_ECO[myLg()]||1):1;return round5k(300000+700000*clamp((e-0.2)/0.8,0,1));}
function budReserve(){return Math.max(0,(SAVE.fin?SAVE.fin.bal:0)-budResTh());}
const BUD_RES_K=0.35,BUD_WG_SHARE=0.68;
function budWgShare(){const e=SAVE.team!=null?(LG_ECO[myLg()]||1):1;return 0.68+0.07*clamp((1-e)/0.8,0,1);}
function budPlan(){const s=S();const rev=Math.max(0,revForecast()*budAcc()-fixedYear());const reserve=budReserve();const pool=rev+reserve*BUD_RES_K;const sp=budSplit();
  const old=SAVE.bud&&SAVE.bud.n===s.n?SAVE.bud:null;
  const bs=budSplitAmt(pool,sp,reserve);
  SAVE.bud={v204:1,n:s.n,pool:round5k(pool),res:reserve,wg:bs.wg,op:bs.op,tr:bs.tr,trUsed:old?old.trUsed:0,opUsed:old?old.opUsed:0,trAdd:old?old.trAdd:0,extra:old?old.extra:0,warn:{}};
  return SAVE.bud;}
function BUD(){if(SAVE.team==null||!S())return null;if(SAVE.staffPool)for(const rl of ['fin','soc'])if(!SAVE.staffPool.some(x=>x.role===rl))for(let i=0;i<3;i++){const s=genStaff(rl,5+R()*14);s.wage=staffWage(s.skill);SAVE.staffPool.push(s);}if(!SAVE.bud||SAVE.bud.n!==S().n){const had=!!SAVE.bud;budPlan();if(had)budSeasonMail(true);}return SAVE.bud;}
function wageBill(){return payroll()+staffPay();}
function budLeft(){const b=BUD();if(!b)return {tr:0,wg:0,op:0};return {tr:b.tr+(b.trAdd||0)+(b.extra||0)-b.trUsed,wg:b.wg-wageBill(),op:b.op-b.opUsed-maintenance()*12};}
// księgowanie: money() przekazuje tu każdy ruch
function budBook(amt,cat){const b=SAVE.team!=null&&S()?BUD():null;if(!b)return;
  if(cat==='Transfery'||cat==='Odprawy'){if(amt<0)b.trUsed+=-amt;else b.trAdd=(b.trAdd||0)+amt*0.5;}// połowa wpływów ze sprzedaży wraca do budżetu transferowego
  if(cat==='Infrastruktura'||cat==='Marketing')if(amt<0)b.opUsed+=-amt;}// obóz: jednorazowo z salda, poza budżetem operacyjnym
// opis wpływu decyzji na budżety: d={tr,wg,op} (wydatek dodatni)
function budImpact(d,note){const b=BUD();if(!b)return '';const L=budLeft();const rows=[];
  const one=(k,lab,tot,used,dv)=>{const after=used+dv;const left=tot-after;const pct=Math.min(130,Math.round(after/Math.max(1,tot)*100));
    rows.push(`<div class="bimp ${left<0?'over':pct>90?'warn':''}"><span>${lab}</span><span class="bbar"><i style="width:${Math.min(100,pct)}%"></i></span><b>${fmt(used)} → ${fmt(after)}</b><small>${left<0?`przekroczony o ${fmt(-left)}`:`zostaje ${fmt(left)}`}</small></div>`);};
  if(d.tr)one('tr','Budżet transferowy',b.tr+(b.trAdd||0)+(b.extra||0),b.trUsed,d.tr);
  if(d.wg)one('wg','Budżet płacowy (rocznie)',b.wg,wageBill(),d.wg);
  if(d.op)one('op','Budżet operacyjny',b.op,b.opUsed+maintenance()*12,d.op);
  if(!rows.length&&!note)return '';
  return `<div class="bimpw"><div class="bimph">💼 Wpływ na budżety${finName()?` <small class="mut">· ${esc(finName())}</small>`:''}</div>${rows.join('')}${note?`<div class="small mut">${note}</div>`:''}</div>`;}
// czy wydatek mieści się w budżecie; transfery i inwestycje są blokowane, pensje tylko ostrzegają
function budCan(kind,amt){const L=budLeft();if(kind==='tr'&&amt>L.tr)return `Brak środków w budżecie transferowym (zostało ${fmt(Math.max(0,L.tr))}). Możesz poprosić zarząd o dodatkowe pieniądze w Finanse → Budżety.`;
  if(kind==='op'&&amt>L.op)return `Brak środków w budżecie operacyjnym (zostało ${fmt(Math.max(0,L.op))}). Zmień podział budżetów w Finanse → Budżety.`;return null;}
function budWageOver(dw){const L=budLeft();if(dw>0&&dw>L.wg){if(SAVE.board){SAVE.board.conf=Math.max(0,SAVE.board.conf-3);}news(`💼 Pensje przekroczyły budżet płacowy o ${fmt(dw-Math.max(0,L.wg))} — zarząd jest niezadowolony.`);}}
// prośba do zarządu: +25% budżetu transferowego, raz na sezon, kosztem zaufania
function budAsk(){if(typeof bmView==='function'){ui.ixTab='zarzad';go('rozmowy');return;}const b=BUD();if(!b||b.extra)return;const add=round5k(Math.max(150000,b.tr*0.25));if(SAVE.fin.bal-add<-500000)return tradeMsg(false,'Zarząd odmawia: klub nie ma pieniędzy na dodatkowe transfery.');
  b.extra=add;if(SAVE.board)SAVE.board.conf=Math.max(0,SAVE.board.conf-6);news(`🏦 Zarząd dołożył ${fmt(add)} do budżetu transferowego, ale oczekuje wyników.`);save();render();}
// zarząd nie planuje pensji poniżej obecnych zobowiązań ani utrzymania poniżej kosztów obiektów — reszta dzielona według proporcji
function budSplitAmt(pool,sp,res){const M=budMins();const free=pool-M.wg-M.op;const f=budFree();const rT=(res||0)*0.25;// ćwierć oszczędności zawsze idzie na transfery
  if(free<=0)return {wg:round5k(M.wg),op:round5k(M.op),tr:round5k(rT)};
  let wg=M.wg+free*f.wg,op=M.op+free*f.op,tr=free*f.tr;
  {const rev=pool-(res||0)*BUD_RES_K;const hi=(typeof surTh==='function'&&SAVE.fin&&SAVE.fin.bal>surTh())?0.95:0.85;const cap=Math.max(M.wg,Math.min(rev*hi,rev*budWgShare()+(res||0)*0.25));if(wg>cap){tr+=wg-cap;wg=cap;}}
  return {wg:round5k(wg),op:round5k(op),tr:round5k(Math.max(0,tr))};}
// podział WOLNYCH pieniędzy (po zarezerwowaniu obecnych pensji i utrzymania): domyślnie głównie na transfery
const BUD_FREE_DEF={wg:0.45,tr:0.35,op:0.2};
function budFree(){return Object.assign({},BUD_FREE_DEF,SAVE.budFree||{});}
function budSetSplit(k,v){const sp=budFree();v=clamp(+v/100,0,1);sp[k]=v;const rest=['wg','op','tr'].filter(x=>x!==k);const sum=rest.reduce((a,x)=>a+sp[x],0);const fr=1-v;
  for(const x of rest)sp[x]=sum>0?sp[x]/sum*fr:fr/2;SAVE.budFree=sp;const b=BUD();if(b){const bs=budSplitAmt(b.pool,sp,b.res);b.wg=bs.wg;b.op=bs.op;b.tr=bs.tr;}save();render();}
// suwaki: najpierw zarząd rezerwuje obecne pensje (+zapas) i utrzymanie obiektów; suwaki dzielą tylko to, co zostaje
function staffGapCost(){try{const have=staffCountNS();const lim=staffLimit();return Math.max(0,lim-have)*30000;}catch(e){return 0;}}
function budMins(){const wb=wageBill(),mn=maintenance()*12;return {wg:wb+Math.max(50000,wb*0.03)+staffGapCost(),op:mn+20000};}
function budSliders(b,sp0){const sp=budFree();const M=budMins();const free=b.pool-M.wg-M.op;const prev=k=>{const t=Object.assign({},sp);return budSplitAmt(b.pool,t,b.res)[k];};
  const head=`<div class="small" style="margin:6px 0;grid-column:1/-1">Pula na sezon: <b>${fmt(b.pool)}</b> · najpierw zarezerwowane: obecne pensje z zapasem <b>${fmt(M.wg)}</b> i utrzymanie obiektów <b>${fmt(M.op)}</b> · <b class="${free>0?'good':'bad'}">wolne do podziału: ${fmt(Math.max(0,free))}</b></div>`;
  if(free<=0)return `<div class="budsp"><b>Podział budżetu</b>${head}<div class="small bad">Suwaki są wyłączone — obecne pensje i utrzymanie obiektów zajmują całą pulę, więc nie ma czego dzielić. Budżet transferowy pochodzi teraz z oszczędności klubu (${fmt(b.tr)}).</div>
    <div class="small mut" style="margin-top:4px">Jak to zmienić: sprzedaj lub odeślij drogich zawodników (pensje), podpisz więcej sponsorów, awansuj (wyższe wpływy) albo poproś zarząd o pieniądze.</div></div>`;
  return `<div class="budsp"><b>Podział budżetu</b>${head}${[['tr','Transfery'],['wg','Pensje (zapas na nowe kontrakty)'],['op','Funkcjonowanie (budowy, obóz)']].map(([k,l])=>`<label>${l} <b>${Math.round(sp[k]*100)}%</b> <span class="small mut">→ ${fmt(b[k])}</span><input type="range" min="0" max="100" value="${Math.round(sp[k]*100)}" oninput="this.previousElementSibling.previousElementSibling.textContent=this.value+'%'" onchange="budSetSplit('${k}',this.value)"></label>`).join('')}
   <div class="small mut" style="grid-column:1/-1">Przesunięcie suwaka od razu przelicza budżety (kwoty obok). Pensji i utrzymania nie da się zejść poniżej zarezerwowanego minimum.</div></div>`;}
// raport dyrektora co miesiąc: ostrzega, gdy budżet się kończy
function budMonthly(){const b=BUD();if(!b)return;const L=budLeft();const fs=finSk();const msg=[];
  const chk=(k,lab,tot,left)=>{if(left<tot*0.1&&!b.warn[k]){b.warn[k]=1;msg.push(`${lab}: ${left<0?`przekroczony o ${fmt(-left)}`:`zostało tylko ${fmt(left)}`}.`);}};
  chk('tr','Budżet transferowy',b.tr+(b.trAdd||0)+(b.extra||0),L.tr);chk('wg','Budżet płacowy',b.wg,L.wg);chk('op','Budżet operacyjny',b.op,L.op);
  if(msg.length&&typeof sendMail==='function')sendMail({cat:'fin',from:fs?`${finName()} (dyrektor finansowy)`:'Zarząd klubu',t:'Budżety: uwaga',s:msg[0],b:{type:'text',x:msg.join(' ')}});}
function budSeasonMail(noRe){const b=noRe?SAVE.bud:budPlan();if(typeof sendMail!=='function')return;const fs=finSk();
  sendMail({cat:'fin',from:fs?`${finName()} (dyrektor finansowy)`:'Zarząd klubu',t:`Budżety na sezon: transfery ${fmtShort2(b.tr)}, pensje ${fmtShort2(b.wg)}`,
    s:'Plan finansowy na nowy sezon',b:{type:'text',x:`Prognoza przychodów ${fmt(round5k(revForecast()))}${fs?'':' (bez dyrektora finansowego zarząd liczy ostrożnie: 85% prognozy)'}. Transfery ${fmt(b.tr)}, pensje ${fmt(b.wg)} rocznie, funkcjonowanie klubu ${fmt(b.op)}. Podział zmienisz w Finanse → Budżety.`}});}
function fmtShort2(v){return v>=1e6?(Math.round(v/1e5)/10).toString().replace('.',',')+' mln zł':Math.round(v/1000)+' tys. zł';}
// widok Finanse → Budżety
function budgetCard(){const b=BUD();if(!b)return '';const L=budLeft();const sp=budSplit();const fs=finSk();
  const bar=(lab,tot,used,desc)=>{const pct=Math.round(used/Math.max(1,tot)*100);return `<div class="bud"><div class="row"><b>${lab}</b><span class="sp"></span><span class="${used>tot?'bad':''}">${fmt(used)} / ${fmt(tot)}</span></div><div class="bbar big"><i class="${pct>100?'over':pct>90?'warn':''}" style="width:${Math.min(100,pct)}%"></i></div><div class="small mut">${desc} · ${used>tot?`<span class="bad">przekroczony o ${fmt(used-tot)}</span>`:`zostaje ${fmt(tot-used)}`}</div></div>`;};
  const trTot=b.tr+(b.trAdd||0)+(b.extra||0);
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Budżety na sezon ${sLabel(S().n)}</h2><span class="sp"></span><span class="small mut">${fs?`Dyrektor finansowy: <b>${esc(finName())}</b> (${fs}/20) · planuje ${Math.round(budAcc()*100)}% prognozy`:'Brak dyrektora finansowego: zarząd planuje ostrożnie (85% prognozy). Zatrudnisz go w zakładce Sztab.'}</span></div>
   <div class="small mut" style="margin:4px 0 10px">Do podziału: <b>${fmt(b.pool)}</b> (prognoza przychodów + część oszczędności).</div>
   ${bar('Transferowy',trTot,b.trUsed,`odstępne i premie za podpis${b.trAdd?` · +${fmt(b.trAdd)} ze sprzedaży`:''}${b.extra?` · +${fmt(b.extra)} od zarządu`:''}`)}
   ${bar('Płacowy (rocznie)',b.wg,wageBill(),'pensje zawodników i sztabu')}
   ${bar('Operacyjny',b.op,b.opUsed+maintenance()*12,'utrzymanie obiektów, budowy, marketing (obóz płacony osobno z salda)')}
   ${budSliders(b,sp)}
   <div class="row" style="gap:8px;margin-top:8px">${b.extra?'<span class="small mut">Zarząd dołożył już pieniądze w tym sezonie.</span>':`<button class="ghost sm" onclick="budAsk()">🏦 Poproś zarząd o +${fmt(round5k(Math.max(150000,b.tr*0.25)))} na transfery</button><span class="small mut">zaufanie zarządu −6</span>`}</div></div>`;}
// sponsor podpisany w trakcie sezonu: jego raty do końca sezonu (czerwiec) zasilają budżety według podziału
function spMonthsLeft(mo){const d=SAVE._now||today();const y=+d.slice(0,4),m=+d.slice(5,7);const end=m<=6?6-m:18-m;return Math.max(0,Math.min(mo,end+1));}
// budżet zakładał typową umowę na każdym wolnym miejscu; podpis zmienia budżety o różnicę między umową a tym założeniem
function spExp(cat){const c=SP_CAT.find(x=>x[0]===cat);return c?SP_BASE*c[2]*spQuality()*LG_ECO[myLg()]*0.85:0;}
// plan zarządu zakładał już część przychodu od nowych sponsorów (prognoza); nowe umowy najpierw „wypełniają” to założenie, nadwyżka zwiększa budżety — nigdy na minus
function spPlanNew(b){if(b.spNew==null){let pot=0;try{pot=Math.max(0,spPotential()-sponsorAmt());}catch(e){}b.spNew=Math.round(pot*budAcc());b.spGot=0;}return b.spNew;}
function spBudDelta(cat,m,mo){const b=BUD();if(!b)return 0;const v=m*spMonthsLeft(mo)*budAcc();const pl=spPlanNew(b);const g=b.spGot||0;return Math.max(0,g+v-pl)-Math.max(0,g-pl);}
function spBudAdd(m,mo,cat){const b=BUD();if(!b)return;const add=spBudDelta(cat,m,mo);b.spGot=(b.spGot||0)+m*spMonthsLeft(mo)*budAcc();if(add<=0)return;const sp=budFree();b.pool+=round5k(add);b.wg+=round5k(add*sp.wg);b.op+=round5k(add*sp.op);b.tr=Math.max(0,b.tr+round5k(add*sp.tr));}
function spBudTxt(m,mo,cat){const sp=budFree();const add=spBudDelta(cat,m,mo);const cash=m*spMonthsLeft(mo);const b=BUD();const pl=b?spPlanNew(b):0;const left=Math.max(0,pl-((b&&b.spGot)||0));
  return `<span class="good">+${fmt(cash)}</span> <span class="mut">do kasy w tym sezonie</span><br>`+(add>=5000?`<span class="mut">budżety: transfery +${fmt(round5k(add*sp.tr))} · pensje +${fmt(round5k(add*sp.wg))}</span>`:`<span class="mut" title="Zarząd wliczył do planu jeszcze ok. ${fmt(left)} od nowych sponsorów — budżety wzrosną, gdy wpływy przekroczą tę kwotę.">budżety bez zmian — ten przychód był już w planie</span>`);}
// ===== Kluby komputera: te same zasady — przychody, budżety (transferowy, płacowy, operacyjny), dyrektor finansowy, social media =====
const AI_REV_LG=[5200000,2400000,1150000,2900000,950000,6200000,2100000,5900000,1500000];
function aiStaffSk(ti,k){const a=SAVE.ai[ti];if(!a.st)a.st={};if(a.st[k]==null)a.st[k]=R()<0.25+a.rep/200?Math.round(clamp(aiStaff(ti)+(R()*6-3),3,18)):0;return a.st[k];}
function aiFol(ti){const a=SAVE.ai[ti];if(a.fol==null){const lm=SOC_LG_REF[lgOf(ti)]/25000;a.fol=Math.round((3000+a.rep*a.rep*6)*lm*(0.85+R()*0.3));a.sty=['pro','luz','kib'][Math.floor(R()*3)];}return a.fol;}
function folRatio(ti){return ti===SAVE.team&&SAVE.soc?socRatio():aiFol(ti)/(SOC_LG_REF[lgOf(ti)]||5000);}
function aiRev(ti){const a=SAVE.ai[ti];const inf=infraOf(ti);const r=folRatio(ti);
  return (AI_REV_LG[lgOf(ti)]||AI_REV_LG[2])*(0.6+a.rep/100*0.8)*(1+0.05*((inf.hala||1)-1)+0.04*((inf.sied||1)-1))*(1+clamp((r-1)*0.06,-0.04,0.08));}
function aiLgAvgRev(lg){const t=TEAMS.filter(x=>lgOf(x.idx)===lg&&x.idx!==SAVE.team);return t.length?t.reduce((s,x)=>s+aiRev(x.idx),0)/t.length:AI_REV_LG[lg];}
// budżety na sezon: płacowy jako limit pensji, transferowy jako pula na zakupy, operacyjny na obiekty
function aiBudgets(){const avg={};for(const t of TEAMS){const ti=t.idx;if(ti===SAVE.team)continue;const a=SAVE.ai[ti];const lg=lgOf(ti);if(avg[lg]==null)avg[lg]=aiLgAvgRev(lg);
  const fs=aiStaffSk(ti,'fin');const acc=(fs?0.9+fs/20*0.1:0.85)/0.93;let rel=clamp(aiRev(ti)/avg[lg],0.75,1.2);if(FIX_DYN)rel=1+(rel-1)*0.5;
  a.wg=round5k((WAGE_CAP[lg]||WAGE_CAP[2])*rel*acc);
  a.bud=round5k(a.bud*0.35+(150000+a.rep*12000+R()*250000)*rel*acc);
  a.op=round5k(aiRev(ti)*0.18*acc);}}
// co miesiąc: obserwujący klubów komputera rosną z renomą, specjalistą i stylem; czasem kryzys
function aiSocMonthly(){for(const t of TEAMS){const ti=t.idx;if(ti===SAVE.team)continue;const a=SAVE.ai[ti];aiFol(ti);const sk=aiStaffSk(ti,'soc');const st=SOC_STY[a.sty]||SOC_STY.pro;
  let g=0.004*(a.rep/50)+(R()-0.45)*0.012;g=g>0?g*st[2]*(sk?0.6+sk/20*0.8:0.35):g*(sk?1-sk/20*0.4:1);
  if(R()<0.02*st[1]*(sk?1-sk/25:1))g-=0.02+R()*0.03;// kryzys
  a.fol=Math.max(200,Math.round(a.fol*(1+g)));if(folRatio(ti)>1.4&&R()<0.3)a.rep=Math.min(100,a.rep+1);}}
function aiSocResult(ti,won,sweep){if(ti===SAVE.team||!SAVE.ai[ti])return;const a=SAVE.ai[ti];aiFol(ti);const sk=aiStaffSk(ti,'soc');const st=SOC_STY[a.sty]||SOC_STY.pro;
  let g=won?0.008+(sweep?0.004:0):-(0.005+(sweep?0.004:0));g=g>0?g*st[2]*(sk?0.6+sk/20*0.8:0.35):g*(sk?1-sk/20*0.4:1);a.fol=Math.max(200,Math.round(a.fol*(1+g)));}

function nRounds(){const s=S();return s&&s.rounds?s.rounds.length:22;}

// pula rośnie razem z prognozą (sprzedane karnety, lepsza frekwencja, nowi sponsorzy) — nigdy nie maleje w trakcie sezonu
function budRefresh(){const b=BUD();const s=S();if(!b||!s||b.n!==s.n)return;const fresh=round5k(Math.max(0,revForecast()*budAcc()-fixedYear())+(b.res||0)*BUD_RES_K);
  if(fresh>b.pool+5000){b.pool=fresh;const bs=budSplitAmt(b.pool,budFree(),b.res);b.wg=bs.wg;b.op=bs.op;b.tr=bs.tr;}
  else{const bs=budSplitAmt(b.pool,budFree(),b.res);b.wg=bs.wg;b.op=bs.op;b.tr=bs.tr;}}
{const _bc=budgetCard;budgetCard=function(){try{budRefresh();}catch(e){console.error(e);}return _bc.apply(this,arguments);};}

// ostrzeżenie, gdy pensje zjadają zbyt dużą część przychodów
function wageShare(){const rev=Math.max(1,revForecast()-fixedYear());return wageBill()/rev;}
{const _bc2=budgetCard;budgetCard=function(){const h=_bc2.apply(this,arguments);try{const w=wageShare();if(w>budWgShare()+0.03)return h+`<div class="card tmsg no"><b>⚠ Pensje to ${Math.round(w*100)}% przychodów</b> — bezpieczny poziom to ok. ${Math.round(budWgShare()*100)}%. Zarząd nie zgodzi się na kolejne podwyżki, dopóki kontrakty nie spadną. Dobre sposoby: nie przedłużaj drogich kontraktów rezerwowych, sprzedaj zawodnika, zdobądź sponsorów albo awansuj (wyższe przychody).</div>`;}catch(e){}return h;};}

// ===== Social media klubu: obserwujący, feed, styl komunikacji, akcje, kryzysy, specjalista =====
const SOC_LG_REF=[25000,9000,3500,14000,3000,32000,8000,30000,5000];// typowa liczba obserwujących klubu w lidze
const SOC_STY={pro:['Profesjonalny','Rzeczowe komunikaty i zdjęcia z meczów. Bezpiecznie, ale wolniejszy wzrost.',1,0.4,0],
  luz:['Luźny / memy','Memy, żarty, wyzwania. Szybki wzrost, ale większe ryzyko wpadki.',1.5,1.7,0],
  kib:['Kibicowski','Klub blisko trybun: relacje kibiców, konkursy. Lepsza frekwencja i nastroje na trybunach.',1.15,0.8,0.02]};
const SOC_ACT=[['film','🎬 Filmik o drużynie','Profesjonalny materiał z treningu i szatni.',25000,0.02],
  ['konk','🎟️ Konkurs dla kibiców','Do wygrania karnety i koszulki z podpisami.',15000,0.012],
  ['kul','📸 Kulisy treningu','Seria zdjęć i krótkich filmów zza kulis.',10000,0.008],
  ['qa','🎤 Q&A z gwiazdą','Najlepszy zawodnik odpowiada na pytania kibiców.',8000,0.015]];
function SOC(){if(SAVE.team==null)return null;if(!SAVE.soc){const rep=SAVE.ai[SAVE.team].rep;const lm=SOC_LG_REF[myLg()]/25000;
  SAVE.soc={fol:Math.round((3000+rep*rep*6)*lm*(0.85+R()*0.3)),style:'pro',feed:[],cr:null,cd:{},hist:[],m0:null,pid:1};}return SAVE.soc;}
function socSk(){const s=SAVE.staff&&SAVE.staff.soc;return s?s.skill:0;}
function socName(){const s=SAVE.staff&&SAVE.staff.soc;return s?`${s.first} ${s.last}`:null;}
function socRatio(){const s=SOC();if(!s)return 1;return s.fol/(SOC_LG_REF[myLg()]||5000);}
// wpływ zasięgu na przychody (używany przez sponsorów, frekwencję i sklep)
function socSpB(){return clamp((socRatio()-1)*0.06,-0.04,0.08);}
function socCrowdB(){const s=SOC();return clamp((socRatio()-1)*0.04,-0.03,0.06)+(s&&s.style==='kib'?0.02:0);}
function socShopB(){return clamp((socRatio()-1)*0.08,-0.05,0.12);}
function pFol(p){let r=60;try{r=rating(p);}catch(e){}return Math.round(150*Math.pow(1.13,Math.max(0,r-55))*(hasT(p,'ind')||hasT(p,'lid')?1.3:1));}
function fmtK(n){if(n<0)return '−'+fmtK(-n);return n>=1e6?(Math.round(n/1e5)/10+'').replace('.',',')+' mln':n>=1e4?Math.round(n/1000)+' tys.':n>=1000?(Math.round(n/100)/10+'').replace('.',',')+' tys.':String(Math.round(n));}
function socGain(base){const s=SOC();const sk=socSk();const g=base>0?base*SOC_STY[s.style][2]*(sk?0.6+sk/20*0.8:0.35):base*(sk?1-sk/20*0.4:1);const d=Math.round(s.fol*g);s.fol=Math.max(200,s.fol+d);return d;}
function socPost(t,mood,likesK,ic){const s=SOC();const likes=Math.round(s.fol*likesK*(0.7+R()*0.6));
  const C={good:['Brawo chłopaki! 🔥','To jest nasz klub! 💪','Tak się gra!','Mistrzostwo! 🏆','Dumny z tej drużyny'],bad:['Wstyd…','Trenerze, co to było?','Czas na zmiany','Gdzie walka?!','Bez ambicji…'],mid:['Głowa do góry','Następnym razem będzie lepiej','Czekamy na więcej','Wierzymy w was 💛']};
  const pool=C[mood]||C.mid;const cm=[];for(let i=0;i<2;i++)cm.push(pool[Math.floor(R()*pool.length)]);
  s.feed.unshift({id:s.pid++,d:SAVE._now||today(),t,ic:ic||'📣',likes,cm:[...new Set(cm)],mood});s.feed=s.feed.slice(0,40);}
function socMail(t,x,crisis){if(typeof sendMail!=='function')return;sendMail({cat:'soc',from:socSk()?`${socName()} (social media)`:'Biuro prasowe',t,s:x.slice(0,90),b:{type:'text',x},lab:crisis?'Kryzys':'Social media'});}
// po meczu: post, zmiana obserwujących, krytyka w sieci, możliwy kryzys
function socAfterMatch(m,c){const s=SOC();if(!s)return;const me=m.sides[0],op=m.sides[1];const won=m.winner===0;const sw=m.setsWon;const sc=`${sw[0]}:${sw[1]}`;const sk=socSk();
  const w=c.kind==='spar'?0.3:c.kind==='po'?1.6:1;const opR=SAVE.ai[op.team.idx]?SAVE.ai[op.team.idx].rep:50,myR=SAVE.ai[SAVE.team].rep;
  let base=won?(0.008+(sw[1]===0?0.004:0)+(opR>myR+10?0.006:0)):-(0.005+(sw[0]===0?0.004:0));const d=socGain(base*w);
  const best=me.pl.filter(p=>p.st&&p.st.att+p.st.rec+p.st.srv>0).sort((a,b)=>(liveRating(b)||6)-(liveRating(a)||6))[0];
  if(sk||won)socPost(won?`Wygrywamy ${sc} z ${op.team.name}!${best&&sk?` MVP: ${best.first} ${best.last} 👏`:''}`:`Porażka ${sc} z ${op.team.name}.${sk?' Wracamy silniejsi.':''}`,won?'good':'bad',won?0.06:0.03,won?'🏐':'😔');
  else socPost(`${me.team.name} – ${op.team.name} ${sc}`,'bad',0.015,'📋');
  if(!won&&c.kind!=='spar'){// krytyka w sieci: nerwowi z najsłabszymi ocenami tracą morale; specjalista część z tego wyłapuje i odcina
    for(const p of me.pl){if(!p.st||p.st.att+p.st.rec+p.st.srv===0||!hasT(p,'ner'))continue;const lr=liveRating(p)||6;if(lr<6&&R()>sk/25){const P=myTeam().players.find(x=>x.id===p.id);if(P)addMor(P,-3);}}
    // kryzys: porażka 0:3 u siebie albo ze znacznie słabszym rywalem
    if(!s.cr&&(opR<myR-15||(sw[0]===0&&c.h===SAVE.team))&&R()<0.35*(sk?1-sk/40:1))socCrisis('loss',`Burza w sieci po porażce ${sc} z ${op.team.name}. Kibice domagają się wyjaśnień.`);}
  if(d)s.fol=s.fol;}
function socTransfer(p){const s=SOC();if(!s)return;let r=60;try{r=rating(p);}catch(e){}if(r<68)return;const d=socGain(0.003*(r-64));
  socPost(`Witamy w klubie: ${p.first} ${p.last}! ✍️${socSk()>=12?' (z filmikiem z podpisania)':''}`,'good',0.07,'✍️');if(d>0)news(`📱 Transfer ${p.last} przyciągnął ${fmtK(d)} nowych obserwujących.`);}
function socCrisis(kind,txt){const s=SOC();s.cr={kind,txt,d:SAVE._now||today()};socPost(txt,'bad',0.09,'⚠️');socMail('Kryzys w social mediach',txt+' Wybierz reakcję w zakładce Social media (masz 7 dni).',true);}
// reakcja na kryzys: przeprosiny (bezpiecznie), milczenie (ryzyko), kontratak (zależy od specjalisty)
function socResolve(how){const s=SOC();if(!s||!s.cr)return;const sk=socSk();let t;
  if(how==='sorry'){const d=socGain(-0.01);if(SAVE.board)SAVE.board.conf=Math.min(100,SAVE.board.conf+1);t=`Klub przeprosił kibiców. Burza cichnie (${fmtK(d)} obserwujących).`;}
  else if(how==='quiet'){const d=socGain(-(0.015+R()*0.025));t=`Klub milczy. Część kibiców odchodzi (${fmtK(d)} obserwujących).`;}
  else{const ok=R()<0.35+sk*0.025;if(ok){const d=socGain(0.03);t=`Riposta klubu stała się hitem sieci! +${fmtK(d)} obserwujących.`;}else{const d=socGain(-0.05);if(SAVE.board)SAVE.board.conf=Math.max(0,SAVE.board.conf-3);t=`Kontratak się nie udał — media piszą o arogancji klubu (${fmtK(d)} obserwujących, zaufanie zarządu −3).`;}}
  s.cr=null;socPost(t,how==='fight'&&/hitem/.test(t)?'good':'mid',0.05,'💬');ui.socMsg={ok:!/nie udał|odchodzi/.test(t),t};save();render();}
function socSetStyle(k){const s=SOC();if(!s||!SOC_STY[k])return;s.style=k;save();render();}
function socTop(){const t=myTeam();return t?t.players.slice().sort((a,b)=>pFol(b)-pFol(a))[0]:null;}
function socAction(k){const s=SOC();const a=SOC_ACT.find(x=>x[0]===k);if(!s||!a)return;const sk=socSk();
  if(!sk)return tradeMsg(false,'Akcje w social mediach przygotowuje specjalista ds. social mediów. Zatrudnisz go w zakładce Sztab.');
  if(s.cd[k]&&daysBetween(s.cd[k],today())<30)return tradeMsg(false,'Tę akcję można powtórzyć dopiero po 30 dniach.');
  if(SAVE.fin.bal-a[3]<-500000)return tradeMsg(false,'Za mało pieniędzy.');
  if(typeof budCan==='function'){const e=budCan('op',a[3]);if(e)return tradeMsg(false,e);}
  if(ui.confirm!=='soc'+k){ui.confirm='soc'+k;render();return;}ui.confirm=null;
  money(-a[3],'Marketing');finLog(`Social media: ${a[1].replace(/^\S+ /,'')}`,-a[3]);s.cd[k]=today();
  let d=socGain(a[4]*(0.5+sk/20));let extra='';
  if(k==='qa'){const p=socTop();if(p){addMor(p,3);if((hasT(p,'ind')||hasT(p,'kap'))&&R()<0.2*(1-sk/30)){d+=socGain(-0.02);extra=` ${p.last} palnął coś niefortunnego — część kibiców się obraziła.`;}try{if(typeof qaBuild==='function')ui._qa={qa:qaBuild(p,!!extra),pid:p.id};}catch(e){console.error(e);}socPost(`Q&A: ${p.first} ${p.last} odpowiada na pytania kibiców`,extra?'bad':'good',0.08,'🎤');}}
  else socPost(a[1].replace(/^\S+ /,'')+` — już na naszych profilach!`,'good',0.06,a[1].split(' ')[0]);
  ui.socMsg={ok:!extra,t:`${a[1].replace(/^\S+ /,'')}: ${d>=0?'+':''}${fmtK(d)} obserwujących.${extra}`};save();render();}
// co miesiąc: naturalny wzrost, wpadki zawodników, renoma, raport specjalisty
function socMonthly(){const s=SOC();if(!s)return;const sk=socSk();const rep=SAVE.ai[SAVE.team].rep;const f0=s.m0||s.fol;
  socGain(0.004*(rep/50));
  // wpadki zawodników: indywidualiści i kapryśni czasem wrzucą niefortunny post; specjalista może go usunąć na czas
  for(const p of myTeam().players){if(!(hasT(p,'ind')||hasT(p,'kap')))continue;if(R()<0.04*SOC_STY[s.style][3]){
    if(sk&&R()<sk/22){socMail(`Usunięty post: ${p.last}`,`${p.first} ${p.last} opublikował niefortunny wpis o szatni. ${socName()} zareagował(a) w kilka minut i post zniknął, zanim ktokolwiek go zauważył.`);}
    else{addMor(p,-4);for(const q of myTeam().players)if(q!==p&&R()<0.3)addMor(q,-2);if(!s.cr)socCrisis('post',`${p.first} ${p.last} opublikował wpis krytykujący kolegów z drużyny. Media to podchwyciły.`);else news(`📱 ${p.last} narobił zamieszania w sieci.`);}break;}}
  if(s.cr&&daysBetween(s.cr.d,today())>7){const c=s.cr;socResolve('quiet');news('📱 Klub nie zareagował na kryzys w sieci — kibice to zapamiętali.');}
  const r=socRatio();if(r>1.4&&R()<0.3){SAVE.ai[SAVE.team].rep=Math.min(100,rep+1);}
  s.hist.push([(SAVE._now||today()).slice(0,7),s.fol]);s.hist=s.hist.slice(-24);const d=s.fol-f0;s.m0=s.fol;
  if(sk)socMail(`Social media: ${d>=0?'+':''}${fmtK(d)} obserwujących w miesiąc`,`Mamy ${fmtK(s.fol)} obserwujących (${Math.round(r*100)}% typowego klubu w tej lidze). Wpływ: sponsorzy ${pct(socSpB())}, frekwencja ${pct(socCrowdB())}, sklep ${pct(socShopB())}.`);}
function pct(v){return (v>=0?'+':'−')+(Math.round(Math.abs(v)*1000)/10+'').replace('.',',')+'%';}
// widok
function socialView(){const s=SOC();if(!s)return '';const sk=socSk();const r=socRatio();const top=myTeam().players.slice().sort((a,b)=>pFol(b)-pFol(a)).slice(0,5);
  const md=s.m0?s.fol-s.m0:0;
  const stats=`<div class="kstrip"><div><span>Obserwujący</span><b class="acc">${fmtK(s.fol)}</b><small>${s.m0?`${md>=0?'+':''}${fmtK(md)} w tym miesiącu`:'liczone od dziś'}</small></div>
   <div><span>Zasięg w lidze</span><b>${Math.round(r*100)}%</b><small>typowy klub ${LG_N[myLg()]}: ${fmtK(SOC_LG_REF[myLg()])}</small></div>
   <div><span>Wpływ na przychody</span><b>${pct(socSpB())}</b><small>sponsorzy ${pct(socSpB())} · frekwencja ${pct(socCrowdB())} · sklep ${pct(socShopB())}</small><small class="mut">liczone względem typowego klubu w lidze (100% zasięgu = 0%)</small></div>
   <div><span>Specjalista</span><b>${sk?esc(socName()):'brak'}</b><small>${sk?`umiejętność ${sk}/20`:'zatrudnisz go w zakładce Sztab'}</small></div></div>`;
  const msg=ui.socMsg?`<div class="card tmsg ${ui.socMsg.ok?'ok':'no'}">${esc(ui.socMsg.t)}</div>`:'';
  const cr=s.cr?`<div class="card soccr"><h2 style="margin:0 0 4px">⚠️ Kryzys w sieci</h2><p>${esc(s.cr.txt)}</p><p class="small mut">Bez reakcji przez 7 dni klub domyślnie milczy. ${sk?`Szansa udanego kontrataku: ${Math.round((0.35+sk*0.025)*100)}%.`:'Bez specjalisty kontratak to loteria (35%).'}</p>
   <div class="row wrap" style="gap:8px"><button class="btn sm" onclick="socResolve('sorry')">🙏 Przeprosiny<br><small>−1% obserwujących, zarząd +1</small></button><button class="ghost sm" onclick="socResolve('quiet')">🤐 Milczenie<br><small>−1,5 do −4% obserwujących</small></button><button class="ghost sm" onclick="socResolve('fight')">🔥 Kontratak<br><small>+3% albo −5% i zarząd −3</small></button></div></div>`:'';
  const sty=`<div class="card"><h2>Styl komunikacji</h2><div class="socsty">${Object.entries(SOC_STY).map(([k,v])=>`<button class="socst ${s.style===k?'on':''}" onclick="socSetStyle('${k}')"><b>${v[0]}</b><span>${v[1]}</span><small>wzrost ×${v[2]} · ryzyko wpadek ×${v[3]}</small></button>`).join('')}</div></div>`;
  const acts=`<div class="card"><h2>Akcje specjalne</h2>${sk?'':'<p class="small mut">Akcje przygotowuje specjalista ds. social mediów — zatrudnij go w zakładce Sztab.</p>'}<div class="socacts">${SOC_ACT.map(a=>{const cd=s.cd[a[0]]?30-daysBetween(s.cd[a[0]],today()):0;const c=ui.confirm==='soc'+a[0];
    return `<div class="socact"><b>${a[1]}</b><span class="small mut">${a[2]}</span><span class="small">Koszt <b>${fmt(a[3])}</b> · ok. +${Math.round(a[4]*(0.5+(sk||0)/20)*1000)/10}% obserwujących</span>${c&&typeof budImpact==='function'?budImpact({op:a[3]}):''}<button class="${c?'btn':'ghost'} sm" ${!sk||cd>0?'disabled':''} onclick="socAction('${a[0]}')">${cd>0?`Za ${cd} dni`:c?`Potwierdź: zapłacisz ${fmt(a[3])}`:'Zleć'}</button></div>`;}).join('')}</div></div>`;
  const feed=`<div class="card"><h2>Profil klubu</h2><div class="socfeed">${s.feed.length?s.feed.slice(0,15).map(p=>`<div class="socp m${p.mood}" style="cursor:pointer" onclick="socOpen(${p.id})"><div class="row"><span class="socic">${p.ic}</span><b>${esc(myTeam().name)}</b><span class="sp"></span><small class="mut">${fmtDMY(p.d)}</small></div><div>${esc(p.t)}</div><div class="small mut">❤️ ${fmtK(p.likes)}${p.cm&&p.cm.length?' · '+p.cm.map(x=>`💬 ${esc(x)}`).join(' · '):''}</div></div>`).join(''):'<p class="mut small">Jeszcze nic nie opublikowano. Posty pojawią się po meczach i transferach.</p>'}</div></div>`;
  const pl=`<div class="card"><h2>Zawodnicy w sieci</h2>${top.map(p=>`<div class="res row"><b>${esc(p.first)} ${esc(p.last)}</b><span class="small mut" style="margin-left:8px">${(hasT(p,'ind')||hasT(p,'kap'))?'⚠️ ryzyko wpadek':''}</span><span class="sp"></span><span>${fmtK(pFol(p))} obserwujących</span></div>`).join('')}<p class="small mut">Gwiazdy z dużym zasięgiem przyciągają kibiców po transferze. Indywidualiści i kapryśni czasem wrzucają niefortunne posty.</p></div>`;
  return stats+msg+cr+`<div class="grid2">${feed}<div>${sty}${acts}${pl}</div></div>`;}

// ================= FINANSE: historia, wykresy, zakładki, kredyt, licencja, prognoza =================
// SAVE.fin.hist=[{m:'2026-09',bal,in:{kat:kw},out:{kat:kw}}] (zamknięte miesiące); SAVE.fin.cur — bieżący miesiąc; SAVE.fin.loan — kredyt bankowy
const MON_S=['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
function monKey(d){return (d||SAVE._now||today()).slice(0,7);}
function monLab(k){const [y,m]=k.split('-');return MON_S[+m-1]+' '+y.slice(2);}
function finCur(){const f=SAVE.fin;const k=monKey();if(!f.cur)f.cur={m:k,b0:f.bal,in:{},out:{}};if(k>f.cur.m)finRoll();return f.cur;}
function finRoll(){const f=SAVE.fin;if(!f||!f.cur)return;const k=monKey();if(k<=f.cur.m)return;f.hist=f.hist||[];f.hist.push({m:f.cur.m,bal:Math.round(f.bal),in:f.cur.in,out:f.cur.out});f.hist=f.hist.slice(-120);f.cur={m:k,b0:f.bal,in:{},out:{}};}
{const _mo=money;money=function(amt,cat){if(SAVE.fin&&SAVE.team!=null&&typeof today==='function'&&SAVE.date){try{const c=finCur();const o=amt>=0?c.in:c.out;o[cat]=Math.round((o[cat]||0)+Math.abs(amt));}catch(e){}}return _mo.apply(this,arguments);};}
// ---- status finansowy ----
function finStatus(){const f=SAVE.fin;const w=Math.max(1,wageBill());const r=f.bal/w;const L=f.loan?f.loan.left:0;const net=f.bal-L;
  if(f.bal<-500000)return ['Zadłużony','bad'];if(f.bal<0)return ['Niepewny','bad'];if(net/w>1.5)return ['Bogaty','good'];if(net/w>0.75)return ['Zamożny','good'];if(net/w>0.25)return ['Stabilny',''];return ['Ostrożny','warn'];}
// ---- wykresy SVG ----
function svgArea(pts,col,h){h=h||150;const W=760,P=46;if(pts.length<2)return '<p class="mut small">Za mało danych — wykres pojawi się po pierwszych miesiącach (historia zbiera się od tej wersji gry).</p>';
  const ys=pts.map(p=>p.y);let mn=Math.min(0,...ys),mx=Math.max(...ys);if(mx===mn)mx=mn+1;const X=i=>P+i*(W-P-8)/(pts.length-1),Y=v=>8+(h-30)*(1-(v-mn)/(mx-mn));
  const line=pts.map((p,i)=>`${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');const zero=Y(0);
  const step=Math.max(1,Math.ceil(pts.length/8));const lab=pts.map((p,i)=>i%step===0||i===pts.length-1?`<text x="${X(i)}" y="${h-4}" font-size="10" fill="#8a93a6" text-anchor="middle">${p.x}</text>`:'').join('');
  return `<svg viewBox="0 0 ${W} ${h}" style="width:100%;height:auto"><text x="0" y="14" font-size="10" fill="#8a93a6">${fmt(mx)}</text><text x="0" y="${h-26}" font-size="10" fill="#8a93a6">${fmt(mn)}</text>
   <line x1="${P}" x2="${W}" y1="${zero}" y2="${zero}" stroke="#ffffff22"/><polygon points="${X(0)},${zero} ${line} ${X(pts.length-1)},${zero}" fill="${col}" opacity=".55"/><polyline points="${line}" fill="none" stroke="${col}" stroke-width="2"/>${lab}</svg>`;}
function svgBars(pts,h){h=h||140;const W=760,P=46;if(!pts.length)return '<p class="mut small">Brak danych.</p>';const ys=pts.map(p=>p.y);const mx=Math.max(1,...ys.map(Math.abs));const bw=(W-P-8)/pts.length;const z=8+(h-30)/2;
  const step=Math.max(1,Math.ceil(pts.length/8));
  return `<svg viewBox="0 0 ${W} ${h}" style="width:100%;height:auto"><text x="0" y="14" font-size="10" fill="#8a93a6">${fmt(mx)}</text><text x="0" y="${h-26}" font-size="10" fill="#8a93a6">−${fmt(mx)}</text><line x1="${P}" x2="${W}" y1="${z}" y2="${z}" stroke="#ffffff22"/>
   ${pts.map((p,i)=>{const hh=Math.abs(p.y)/mx*((h-30)/2);return `<rect x="${(P+i*bw+bw*0.15).toFixed(1)}" y="${(p.y>=0?z-hh:z).toFixed(1)}" width="${(bw*0.7).toFixed(1)}" height="${Math.max(0.5,hh).toFixed(1)}" fill="${p.y>=0?'#22c55e':'#ef4444'}"><title>${p.x}: ${fmt(p.y)}</title></rect>${i%step===0||i===pts.length-1?`<text x="${(P+i*bw+bw/2).toFixed(1)}" y="${h-4}" font-size="10" fill="#8a93a6" text-anchor="middle">${p.x}</text>`:''}`;}).join('')}</svg>`;}
function finMonths(){const f=SAVE.fin;finCur();const H=(f.hist||[]).slice();H.push({m:f.cur.m,bal:Math.round(f.bal),in:f.cur.in,out:f.cur.out,cur:1});return H;}
const sumO=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);
// ---- prognoza ----
function finProj(){const pay=payroll(),sp=sponsorAmt();const stp=staffPay(),mnt=maintenance()*12,shp=shopIncome(myInfra().sklep)*12;const md=matchday(1,null,null,true);const kh=ECO().karS&&ECO().karS.season===S().n?ECO().karS.inc:0;const lo=SAVE.fin.loan?SAVE.fin.loan.mo*12:0;
  return {inc:sp+tvRound()*nRounds()+md.tot*Math.ceil(nRounds()/2)+shp+kh,exp:pay+stp+mnt+lo,pay,stp,mnt,lo};}
function monthsLeftSeason(){const s=S();const end=`${seasonYear(s.n)+1}-06-30`;const d=today();if(d>end)return 0;const [y1,m1]=d.split('-').map(Number),[y2,m2]=end.split('-').map(Number);return Math.max(0,(y2-y1)*12+(m2-m1)+1);}
// ---- kredyt bankowy ----
function loanRate(mo){const st=finStatus()[0];return 0.055+(st==='Ostrożny'?0.01:st==='Niepewny'?0.02:st==='Zadłużony'?0.035:0)+(mo>=48?0.01:mo>=36?0.005:0);}
function loanMax(){try{return Math.max(300000,Math.round(revForecast()*0.4/100000)*100000);}catch(e){return 1000000;}}
function annuity(P,r,n){const i=r/12;return Math.round(P*i/(1-Math.pow(1+i,-n)));}
function loanTake(){const f=SAVE.fin;if(f.loan)return;const amt=+(ui.lnA||loanMax()/2),mo=+(ui.lnM||36);if(!(amt>0))return;
  if(bConf()<35&&!SAVE.ownClub){ui.lnMsg={ok:0,t:'Zarząd nie zgodził się na kredyt — za małe zaufanie do Twojej pracy (potrzeba co najmniej 35/100).'};render();return;}
  if(finStatus()[0]==='Zadłużony'){ui.lnMsg={ok:0,t:'Bank odmówił: klub jest zbyt zadłużony.'};render();return;}
  const r=loanRate(mo);f.loan={p:amt,left:amt,r,n:mo,mo:annuity(amt,r,mo),d:today()};money(amt,'Kredyt');finLog(`Kredyt bankowy: ${fmt(amt)} na ${mo} mies. (${(r*100).toFixed(1).replace('.',',')}%)`,amt);
  if(ui.lnT){const b=BUD();if(b)b.trAdd=(b.trAdd||0)+Math.round(amt*0.8);}
  news(`🏦 Klub wziął kredyt: ${fmt(amt)} na ${mo} miesięcy, rata ${fmt(f.loan.mo)}/mies.`);ui.lnMsg={ok:1,t:`Kredyt przyznany. Rata: ${fmt(f.loan.mo)} miesięcznie przez ${mo} miesięcy.`};save();render();}
function loanRepay(){const f=SAVE.fin;const L=f.loan;if(!L)return;const c=Math.round(L.left*1.02);if(ui.confirm!=='lnr'){ui.confirm='lnr';render();return;}ui.confirm=null;
  money(-c,'Kredyt');finLog('Wcześniejsza spłata kredytu (z prowizją 2%)',-c);f.loan=null;news(`🏦 Kredyt spłacony przed terminem (${fmt(c)}).`);save();render();}
function loanMonthly(){const f=SAVE.fin;const L=f.loan;if(!L)return;const int=L.left*L.r/12;const pay=Math.min(L.mo,Math.round(L.left+int));money(-pay,'Kredyt');finLog('Rata kredytu',-pay);
  L.left=Math.max(0,Math.round(L.left+int-pay));L.n--;if(L.n<=0||L.left<=0){f.loan=null;news('🏦 Kredyt bankowy został w całości spłacony.');}}
// ---- licencja ligowa ----
function halaNeed(l){return [0,3,5,7].includes(l)?2:1;}
function finLic(){const f=SAVE.fin;const it=[];const b=BUD();
  it.push(f.bal>=0?[2,`Saldo dodatnie (${fmt(f.bal)})`]:f.bal>=-1000000?[1,`Saldo ujemne (${fmt(f.bal)}) — do startu sezonu trzeba wyjść ponad −1 mln zł`]:[0,`Dług ${fmt(f.bal)} — przekroczony limit −1 mln zł`]);
  const hn=halaNeed(myLg()),hl=myInfra().hala;it.push(hl>=hn?[2,`Hala spełnia wymogi ligi (poziom ${hl}, wymagany ${hn})`]:[1,`Hala za mała dla tej ligi (poziom ${hl}, wymagany ${hn}) — rozbuduj ją w Infrastrukturze`]);
  if(b){const r=wageBill()/Math.max(1,b.wg);it.push(r<=1.1?[2,'Pensje w granicach budżetu płacowego']:r<=1.3?[1,`Pensje przekraczają budżet o ${Math.round((r-1)*100)}%`]:[0,`Pensje przekraczają budżet o ${Math.round((r-1)*100)}% — ryzyko zaległości`]);}
  if(f.loan)it.push(f.bal>-500000?[2,'Raty kredytu spłacane terminowo']:[1,'Raty kredytu przy ujemnym saldzie — bank się niepokoi']);
  const lv=Math.min(...it.map(x=>x[0]));return {it,lv};}
function licCheckSeason(){if(SAVE.ownClub&&false)return;const L=finLic();if(L.lv>0)return;const fine=round5k(250000*(LG_ECO[myLg()]||0.5));money(-fine,'Kary');finLog('Kara za brak spełnienia wymogów licencyjnych',-fine);if(SAVE.board)SAVE.board.conf=Math.max(0,SAVE.board.conf-10);
  const b=BUD();if(b){b.extra=(b.extra||0)-Math.max(0,budLeft().tr);}
  news(`⚖️ Komisja licencyjna ukarała klub: ${fmt(fine)} kary i blokada transferów do końca okna (wymogi licencji niespełnione).`);
  if(typeof sendMail==='function')sendMail({cat:'fin',from:'Komisja licencyjna ligi',t:'Kara za niespełnienie wymogów licencji',s:`Kara ${fmt(fine)} i blokada budżetu transferowego.`,b:{type:'text',x:'Niespełnione wymogi:\n• '+L.it.filter(x=>x[0]===0).map(x=>x[1]).join('\n• ')},lab:'Finanse'});}
{const _ss=startSeasonFromOff;startSeasonFromOff=function(){const ph=S()&&S().phase;const r=_ss.apply(this,arguments);try{if(ph==='off'&&S().phase!=='off')licCheckSeason();}catch(e){console.error(e);}return r;};}
// rata kredytu, zamknięcie miesiąca w historii, ostrzeżenie licencyjne — 1. dnia miesiąca
{const _mn=monthly;monthly=function(d){try{finRoll();}catch(e){}const r=_mn.apply(this,arguments);try{loanMonthly();const L=finLic();const f=SAVE.fin;
  if(L.lv<2&&(!f.licW||daysBetween(f.licW,d)>=58)){f.licW=d;sendMail({cat:'fin',from:'Komisja licencyjna ligi',t:L.lv===0?'Licencja zagrożona!':'Uwaga na wymogi licencyjne',s:L.it.filter(x=>x[0]<2).map(x=>x[1]).join(' · ').slice(0,120),
    b:{type:'text',x:`Stan licencji na kolejny sezon:\n\n${L.it.map(x=>(x[0]===2?'✓ ':x[0]===1?'⚠ ':'✗ ')+x[1]).join('\n')}\n\nJeśli przy starcie sezonu któryś wymóg będzie czerwony, komisja nałoży karę finansową i zablokuje transfery.`},lab:'Finanse'});}}catch(e){console.error(e);}return r;};}
// ================= WIDOK =================
const FIN_TABS=[['sum','Podsumowanie'],['inc','Przychody'],['exp','Wydatki'],['wag','Płace'],['loan','Zadłużenie i kredyt'],['prog','Prognoza'],['lic','Licencja']];
function finHead(){const st=finStatus();return `<div class="card"><div class="row wrap" style="gap:12px;align-items:center"><h2 style="margin:0">Stan finansów</h2><span class="small mut">Status finansowy: <b class="${st[1]}">${st[0]}</b></span><span class="sp"></span>
  <div class="seg">${FIN_TABS.map(([k,l])=>`<button class="${(ui.finTab||'sum')===k?'on':''}" onclick="ui.finTab='${k}';render()">${l}</button>`).join('')}</div></div></div>`;}
function finSum(){const f=SAVE.fin;const H=finMonths();const c=H[H.length-1];const inc=sumO(c.in),out=sumO(c.out);const sea=Object.values(f.sea||{}).reduce((a,b)=>a+b,0);const prev=f.prev?Object.values(f.prev).reduce((a,b)=>a+b,0):null;
  const top=(o,n)=>Object.entries(o||{}).sort((a,b)=>b[1]-a[1]).slice(0,n||6).map(([k,v])=>`<div class="res row small"><span>${esc(k)}</span><span class="sp"></span><b>${fmt(v)}</b></div>`).join('')||'<p class="mut small">Brak w tym miesiącu.</p>';
  const L=finLic();
  return `<div class="card"><div class="small mut">BILANS OGÓŁEM</div><div class="big ${f.bal<0?'bad':''}">${fmtFull(f.bal)}</div>${svgArea(H.map(h=>({x:monLab(h.m),y:h.bal})),'#ec4899')}</div>
  <div class="card"><div class="row wrap" style="gap:30px"><div><div class="small mut">ZYSK / STRATA W BIEŻĄCYM MIESIĄCU</div><div class="big ${inc-out<0?'bad':'good'}" style="font-size:22px">${inc-out>=0?'+':''}${fmt(inc-out)}</div></div>
   <div><div class="small mut">BIEŻĄCY SEZON</div><b class="${sea<0?'bad':'good'}" style="font-size:18px">${sea>=0?'+':''}${fmt(sea)}</b></div>${prev!=null?`<div><div class="small mut">POPRZEDNI SEZON</div><b class="${prev<0?'bad':'good'}" style="font-size:18px">${prev>=0?'+':''}${fmt(prev)}</b></div>`:''}</div>
   ${svgBars(H.map(h=>({x:monLab(h.m),y:sumO(h.in)-sumO(h.out)})))}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px"><div class="card"><div class="small mut">PRZYCHODY W TYM MIESIĄCU</div><b class="good" style="font-size:20px">${fmt(inc)}</b>${top(c.in)}</div>
   <div class="card"><div class="small mut">WYDATKI W TYM MIESIĄCU</div><b class="bad" style="font-size:20px">${fmt(out)}</b>${top(c.out)}</div></div>
  <div class="lic ${L.lv===2?'ok':L.lv===1?'warn':'bad'}" style="padding:12px 16px;border-radius:8px;margin:12px 0;background:${L.lv===2?'#16a34a':L.lv===1?'#ca8a04':'#b91c1c'};color:#fff"><b>Licencja na sezon ${sLabel(S().n+(S().phase==='off'?0:1))}</b><div class="small">${L.lv===2?'✓ Klub spełnia wszystkie wymogi licencyjne.':L.lv===1?'⚠ Część wymogów zagrożona — sprawdź zakładkę Licencja.':'✗ Klub nie spełnia wymogów licencji — grozi kara i blokada transferów.'}</div></div>`;}
function finCatTab(kind){const H=finMonths();const key=kind==='inc'?'in':'out';const cats={};for(const h of H)for(const k in h[key])cats[k]=(cats[k]||0)+h[key][k];
  const sel=ui.finCat&&cats[ui.finCat]!=null?ui.finCat:null;const f=SAVE.fin;
  const seaOf=(o,k)=>o&&o[k]!=null?(kind==='inc'?Math.max(0,o[k]):Math.max(0,-o[k])):0;
  const ks=Object.keys(cats).sort((a,b)=>cats[b]-cats[a]);
  return `<div class="card"><h2>${kind==='inc'?'Przychody':'Wydatki'} miesiąc po miesiącu${sel?` — ${esc(sel)}`:''}</h2>${svgArea(H.map(h=>({x:monLab(h.m),y:sel?(h[key][sel]||0):sumO(h[key])})),kind==='inc'?'#94a3b8':'#65a30d',140)}
   <div class="tw"><table><thead><tr><th class="l">Kategoria</th><th>Ten miesiąc</th><th>Bieżący sezon</th><th>Poprzedni sezon</th><th>Od początku historii</th></tr></thead><tbody>
   ${ks.map(k=>`<tr class="clickrow" onclick="ui.finCat=${sel===k?'null':`'${k}'`};render()"><td class="l">${sel===k?'▶ ':''}${esc(k)}</td><td>${fmt(H[H.length-1][key][k]||0)}</td><td>${fmt(seaOf(f.sea,k))}</td><td>${f.prev?fmt(seaOf(f.prev,k)):'—'}</td><td>${fmt(cats[k])}</td></tr>`).join('')||'<tr><td class="l mut" colspan="5">Brak danych — historia zbiera się od tej wersji gry.</td></tr>'}</tbody></table></div>
   <p class="small mut">Kliknij kategorię, żeby zobaczyć jej wykres.</p></div>
   <div class="card"><h2>Historia operacji</h2>${f.log.filter(x=>kind==='inc'?x.a>0:x.a<0).slice(0,25).map(x=>`<div class="res row"><span class="mut small">${x.d?fmtDMY(x.d):''}</span> ${esc(x.t)}<span class="sp"></span><b class="${x.a<0?'bad':'good'}">${x.a>=0?'+':''}${fmt(x.a)}</b></div>`).join('')||'<p class="mut">Brak operacji.</p>'}</div>`;}
function finWag(){const t=myTeam();const b=BUD();const ps=t.players.filter(p=>p.wage).slice().sort((a,c)=>c.wage-a.wage);const st=Object.values(SAVE.staff||{}).filter(Boolean).concat(SAVE.scouts||[]).sort((a,c)=>c.wage-a.wage);
  const tot=wageBill();const pos={};for(const p of ps)pos[p.pos]=(pos[p.pos]||0)+p.wage;const mx=Math.max(1,...Object.values(pos));
  return `<div class="card"><div class="row wrap" style="gap:30px"><div><div class="small mut">BUDŻET PŁAC</div><b style="font-size:20px">${b?fmt(b.wg):'—'}</b><small class="mut"> / rok</small></div><div><div class="small mut">OBECNE WYDATKI</div><b style="font-size:20px" class="${b&&tot>b.wg?'bad':''}">${fmt(tot)}</b><small class="mut"> (${fmt(tot/12)}/mies.)</small></div>
   <div><div class="small mut">ZAWODNICY / SZTAB</div><b>${fmt(payroll())}</b> / <b>${fmt(staffPay())}</b> <small class="mut">(${Math.round(staffPay()/Math.max(1,tot)*100)}% na sztab)</small></div></div>
   <h3>Płace według pozycji</h3>${['R','A','P','S','L'].map(k=>`<div class="row small" style="gap:8px;align-items:center;margin:3px 0"><span style="width:110px">${POS_NAMES[k]}</span><span class="trld" style="width:300px"><i style="width:${(pos[k]||0)/mx*100}%;background:#3b82f6"></i></span><b>${fmt(pos[k]||0)}</b></div>`).join('')}</div>
  <div class="card"><h2>Zawodnicy</h2><div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Wiek</th><th>Ocena</th><th>Pensja / rok</th><th>Udział</th><th>Kontrakt do</th></tr></thead><tbody>
   ${ps.map(p=>`<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small></td><td>${p.age}</td><td>${rating(p)}</td><td>${fmt(p.wage)}</td><td>${Math.round(p.wage/Math.max(1,tot)*100)}%</td><td>${p.ce!=null?ceDate(p.ce):'—'}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h2>Sztab</h2>${st.map(s=>`<div class="res row small"><span>${esc(s.first)} ${esc(s.last)} <span class="mut">· ${ROLE_N[s.role]||'skaut'} · ${s.skill}/20</span></span><span class="sp"></span><b>${fmt(s.wage)}</b></div>`).join('')||'<p class="mut">Brak sztabu.</p>'}</div>`;}
function finLoan(){const f=SAVE.fin;const L=f.loan;const mx=loanMax();const A=+(ui.lnA||Math.round(mx/2/100000)*100000),M=+(ui.lnM||36);const r=loanRate(M);
  return `<div class="card"><h2>Zadłużenie i kredyt</h2><p class="small">Saldo: <b class="${f.bal<0?'bad':''}">${fmt(f.bal)}</b>. Dopuszczalny debet to 500 tys. zł — poniżej zarząd blokuje zakupy, a poniżej −1 mln zł grozi kara licencyjna.</p>
   ${L?`<div class="card"><b>Kredyt bankowy</b><div class="small">Pozostało do spłaty: <b>${fmt(L.left)}</b> · rata <b>${fmt(L.mo)}</b>/mies. · zostało ${L.n} rat · oprocentowanie ${(L.r*100).toFixed(1).replace('.',',')}% · wzięty ${fmtDMY(L.d)}</div>
     <div class="trld" style="width:100%;margin:8px 0"><i style="width:${Math.round((1-L.left/L.p)*100)}%;background:#22c55e"></i></div>
     <button class="ghost" onclick="loanRepay()">${ui.confirm==='lnr'?`Na pewno? Zapłacisz ${fmt(Math.round(L.left*1.02))}`:'Spłać przed terminem (prowizja 2%)'}</button></div>`
   :`<h3>Weź kredyt</h3><p class="small mut">Bank pożycza do ${fmt(mx)} (ok. 40% rocznych przychodów). Kredyt wymaga zgody zarządu (zaufanie co najmniej 35/100)${SAVE.ownClub?' — jako właściciel decydujesz sam':''}. Rata jest pobierana 1. dnia każdego miesiąca.</p>
     <div class="row wrap" style="gap:10px;align-items:center"><label>Kwota <select onchange="ui.lnA=+this.value;render()">${[0.25,0.5,0.75,1].map(k=>{const v=Math.max(100000,Math.round(mx*k/100000)*100000);return `<option value="${v}" ${A===v?'selected':''}>${fmt(v)}</option>`;}).join('')}</select></label>
     <label>Okres <select onchange="ui.lnM=+this.value;render()">${[24,36,48].map(m=>`<option value="${m}" ${M===m?'selected':''}>${m} mies.</option>`).join('')}</select></label>
     <label class="row" style="gap:4px"><input type="checkbox" ${ui.lnT?'checked':''} onchange="ui.lnT=this.checked;render()"> 80% na budżet transferowy</label></div>
     <p class="small">Oprocentowanie <b>${(r*100).toFixed(1).replace('.',',')}%</b> · rata <b>${fmt(annuity(A,r,M))}</b>/mies. · łącznie oddasz <b>${fmt(annuity(A,r,M)*M)}</b></p>
     <button class="btn" onclick="loanTake()">Weź kredyt</button>`}
   ${ui.lnMsg?`<p class="small ${ui.lnMsg.ok?'good':'bad'}">${esc(ui.lnMsg.t)}</p>`:''}</div>`;}
function finProg(){const P=finProj();const f=SAVE.fin;const ml=monthsLeftSeason();const net=(P.inc-P.exp)/12;const s=S();
  const end1=f.bal+net*ml;const exp=myTeam().players.filter(p=>p.ce!=null&&p.ce<=s.n).reduce((a,p)=>a+p.wage,0);const net2=(P.inc-(P.exp-exp))/12;const end2=end1+net2*12,end3=end2+net2*12;
  const pts=[{x:'teraz',y:f.bal},{x:'koniec '+sLabel(s.n),y:end1},{x:'koniec '+sLabel(s.n+1),y:end2},{x:'koniec '+sLabel(s.n+2),y:end3}];
  return `<div class="card"><h2>Prognoza</h2><p class="small mut">Szacunek przy obecnych kontraktach, sponsorach i frekwencji — bez transferów, nagród i premii za wyniki.</p>${svgArea(pts,'#38bdf8',160)}
   <table class="cmp"><tbody><tr><td class="l">Przychody (rocznie)</td><td class="good">+${fmt(P.inc)}</td></tr><tr><td class="l">Pensje zawodników</td><td class="bad">−${fmt(P.pay)}</td></tr><tr><td class="l">Pensje sztabu</td><td class="bad">−${fmt(P.stp)}</td></tr><tr><td class="l">Utrzymanie obiektów</td><td class="bad">−${fmt(P.mnt)}</td></tr>${P.lo?`<tr><td class="l">Raty kredytu</td><td class="bad">−${fmt(P.lo)}</td></tr>`:''}
   <tr><td class="l"><b>Saldo na koniec sezonu ${sLabel(s.n)} (za ${ml} mies.)</b></td><td class="${end1<0?'bad':'good'}"><b>${fmt(end1)}</b></td></tr>
   <tr><td class="l">Saldo za rok${exp?` (po odejściu zawodników z kończącymi się kontraktami: −${fmt(exp)} pensji)`:''}</td><td class="${end2<0?'bad':''}">${fmt(end2)}</td></tr><tr><td class="l">Saldo za 2 lata</td><td class="${end3<0?'bad':''}">${fmt(end3)}</td></tr></tbody></table></div>`;}
function finLicTab(){const L=finLic();return `<div class="card"><h2>Licencja ligowa</h2><p class="small mut">Przed startem każdego sezonu komisja licencyjna sprawdza klub. Czerwony wymóg przy starcie sezonu = kara finansowa, blokada transferów do końca okna i spadek zaufania zarządu. Żółty = ostrzeżenie.</p>
  ${L.it.map(x=>`<div class="res row" style="gap:8px"><b class="${x[0]===2?'good':x[0]===1?'':'bad'}">${x[0]===2?'✓':x[0]===1?'⚠':'✗'}</b> ${esc(x[1])}</div>`).join('')}</div>`;}
{const _fv=financeView;financeView=function(){const tab=ui.finTab||'sum';const body=tab==='sum'?finSum()+_fv.apply(this,arguments).replace(/<div class="card fin">[\s\S]*?<\/div><\/div>/,''):tab==='inc'?finCatTab('inc'):tab==='exp'?finCatTab('exp'):tab==='wag'?finWag():tab==='loan'?finLoan():tab==='prog'?finProg():finLicTab();return finHead()+body;};}
// ---- beniaminek: premia zarządu za awans Twojego klubu ----
{const _alm=applyLeagueMoves;applyLeagueMoves=function(old){const mv=old&&old.moves&&old.moves.find(x=>x.i===SAVE.team&&x.up);const r=_alm.apply(this,arguments);
  try{if(mv){const top=LG_LV[mv.to]===0;const b=top?round5k(WAGE_CAP[mv.to]*0.3):600000;money(b,'Premia za awans');finLog(`Premia zarządu za awans do ${LG_GEN[mv.to]}`,b);SAVE.myPromo=old.n+1;
    if(typeof sendMail==='function')sendMail({cat:'fin',from:'Zarząd klubu',t:'Premia za awans',s:`Na wzmocnienia przed debiutem w ${LG_LOC?LG_LOC[mv.to]:LG_N[mv.to]} przekazujemy ${fmt(b)}.`,b:{type:'text',x:`Gratulujemy awansu!\n\nŻeby drużyna utrzymała się w nowej lidze, zarząd przekazuje ${fmt(b)} na wzmocnienia. Pieniądze powiększają budżet transferowy i płacowy na ten sezon.\n\nW wyższej lidze poziom rywali jest wyraźnie wyższy — warto wzmocnić najsłabsze pozycje w podstawowym składzie.${typeof dlg==='function'&&dlg('trans')?'\n\nSkaut, któremu przekazałeś transfery, ma w tym okienku zgodę na więcej wzmocnień.':''}`},lab:'Finanse'});}}catch(e){console.error(e);}return r;};}
