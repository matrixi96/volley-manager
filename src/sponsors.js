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
    <div class="spgrid">${act.map(c=>`<div class="spact">${spBadge(c)}<div><b>${esc(c.n)}</b> ${spStars(c.t)}<div class="small mut">${fmt(c.m)}/mies. · ${c.left>0?`jeszcze ${c.left} ${c.left===1?'rata':c.left<5?'raty':'rat'} (do ${fmtDMY(addMonths(today(),c.left))})`:'ostatni miesiąc'}</div>${c.left>0?`<button class="link small" onclick="breakSponsor('${c.id}')">${ui.confirm==='spb'+c.id?`Na pewno? Kara ${fmt(spPenalty(c))}`:'Zerwij umowę'}</button>`:''}</div></div>`).join('')||(k==='tit'?'<div class="spact empty">Brak sponsora tytularnego</div>':'')}</div>
    ${offs.length?`<div class="tw"><table><thead><tr><th class="l">Oferta</th><th>Poziom</th><th>Miesięcznie</th><th>Długość</th><th>Wpływ na budżety</th><th></th></tr></thead><tbody>${offs.map(o=>{const cur=k==='tit'?act[0]:null;const conf=ui.confirm==='spt'+o.id;
      return `<tr><td class="l"><span class="fcell">${spBadge(o)}<b>${esc(o.n)}</b></span><div class="small mut">${SP_TIER_N[o.t]}</div></td><td>${spStars(o.t)}</td><td><b>${fmt(o.m)}</b></td><td>${o.mo} mies.<div class="small mut">razem ${fmtShort2(o.m*o.mo)}</div></td>
      <td class="small">${typeof spBudTxt==='function'?spBudTxt(o.m,o.mo,k):''}</td>
      <td><button class="btn sm" onclick="signSponsor('${k}','${o.id}')">${cur?(conf?`Na pewno? Kara za zerwanie obecnej: ${fmt(spPenalty(cur))}`:'Zerwij obecną i podpisz'):'Podpisz'}</button></td></tr>`;}).join('')}</tbody></table></div>`:`<p class="mut small">${k==='tit'?'Brak nowych ofert tytularnych w tym miesiącu.':'Brak nowych ofert w tym miesiącu.'}</p>`}</div>`;}).join('')}
  <p class="small mut">Sponsor sam proponuje kwotę i długość umowy — możesz przyjąć albo czekać na lepszą ofertę. Liczba chętnych sponsorów i ich poziom (1–5 gwiazdek) zależą od renomy klubu, miejsca w tabeli, gwiazd w składzie, siedziby i social mediów. Zerwanie umowy kosztuje 40% wartości pozostałych rat (co najmniej jedną ratę) i na kilka miesięcy obniża przyszłe oferty.</p>`;}
