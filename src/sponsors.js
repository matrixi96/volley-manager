// ================= SPONSORZY =================
// SAVE.spons={act:[{id,cat,n,col,m,left,start,months}],off:{cat:[{id,n,col,m}]},ref:'RRRR-MM',nid}
const SP_CAT=[['tit','Tytularny',0.38,'Nazwa klubu w szyldzie ligi, największe pieniądze. Zawsze dokładnie jedno miejsce.'],['main','Główny',0.2,'Logo na przodzie koszulek i na parkiecie.'],['tech','Techniczny',0.09,'Stroje i sprzęt: oprócz pieniędzy trochę mniej kontuzji.'],['mid','Średni',0.045,'Bandy reklamowe, rękawy koszulek.'],['small','Mały',0.016,'Lokalne firmy: drobne, ale pewne pieniądze.']];
const SP_BASE=260000;
const SP_A=['Vistula','Baltic','Polon','Mazovia','Warta','Odra','Tatra','Silesia','Amber','Kronos','Orbita','Nova','Delta','Atlas','Horyzont','Sokół','Żubr','Magnum','Karpaty','Bursztyn','Pomorze','Wawel','Narew','Kujawy','Jantar','Lechia','Mewa','Sudety'];
const SP_B=['Energia','Logistics','Bank','Telecom','Foods','Ubezpieczenia','Motors','Steel','Pharma','Tech','Group','Budownictwo','Media','Travel','Wody','Chem','Software','Paliwa','Agro','Meble','Okna','Dom','Finanse','Transport'];
const SP_T1=['Spike','Vertex','Arvo','Kinetic','Jump','Libero','Ace','Net','Block','Smash','Volta','Rally'],SP_T2=['Sport','Pro','Wear','Athletics','Gear','Team'];
const SP_COL=['#e8b73a','#38bdf8','#ef6b5b','#5ad17a','#a78bfa','#f97316','#2dd4bf','#f472b6','#94a3b8','#facc15'];
function SPN(){const s=SAVE.spons||(SAVE.spons={act:[],off:{},ref:null,nid:1});if(!s.off)s.off={};if(!s.act)s.act=[];return s;}
function spSlots(L,rep){L=L||myInfra().sied;rep=rep==null?SAVE.ai[SAVE.team].rep:rep;return {tit:1,main:L>=3?2:1,tech:1,mid:1+Math.floor(L/2)+(rep>=60?1:0),small:2+L+(rep>=50?1:0)};}
function spSlotsTxt(L){if(!SAVE.ai||SAVE.team==null)return '';const s=spSlots(L);return `główni ${s.main}, średni ${s.mid}, mali ${s.small}`;}
function spStar(){const t=myTeam();const best=t.players.slice().sort((a,b)=>rating(b)-rating(a))[0];if(!best)return [0,null];const r=rating(best);return [(r>=88?0.12:r>=84?0.07:r>=80?0.03:0)+(best.star?0.04:0),best];}
function spQuality(){const rep=SAVE.ai[SAVE.team].rep;const s=S();let pb=0;try{if(s&&(s.phase==='liga'||s.phase==='po')){const pos=leagueTable().findIndex(x=>x.i===SAVE.team)+1;pb=pos<=2?0.08:pos<=4?0.04:pos>=10?-0.04:0;}}catch(e){}
  return clamp(0.55+rep/100*0.55+(myInfra().sied-1)*0.06+spStar()[0]+pb,0.5,1.7);}
function spName(cat){if(cat==='tech')return SP_T1[Math.floor(R()*SP_T1.length)]+' '+SP_T2[Math.floor(R()*SP_T2.length)];return SP_A[Math.floor(R()*SP_A.length)]+' '+SP_B[Math.floor(R()*SP_B.length)];}
function spDurMul(mo){return 1.05-0.01*(mo-1);}
function genSpOffers(){const s=SPN();const q=spQuality();const n={tit:3,main:3,tech:2,mid:4,small:5};s.off={};
  for(const [k,,sh] of SP_CAT){s.off[k]=[];for(let i=0;i<n[k];i++){const m=Math.round(SP_BASE*sh*q*(0.8+R()*0.4)/1000)*1000;s.off[k].push({id:'sp'+(s.nid++),n:spName(k),col:SP_COL[Math.floor(R()*SP_COL.length)],m,maxM:R()<0.3?6:12});}s.off[k].sort((a,b)=>b.m-a.m);}
  s.ref=(SAVE._now||today()).slice(0,7);}
function spUsed(cat){return SPN().act.filter(c=>c.cat===cat).length;}
function spMonthly(){return SPN().act.reduce((a,c)=>a+c.m,0);}
function sponsorAmt(){return spMonthly()*12;}
function techBonus(){const c=SPN().act.find(x=>x.cat==='tech');return c?clamp(0.02+c.m/(SP_BASE*0.09)*0.03,0,0.07):0;}
function signSponsor(cat,id){const s=SPN();const o=(s.off[cat]||[]).find(x=>x.id===id);if(!o)return;const el=document.getElementById('spd'+id);const mo=clamp(+(el?el.value:12)||12,1,o.maxM||12);
  if(spUsed(cat)>=spSlots()[cat]){ui.spMsg={ok:false,t:`Brak wolnego miejsca dla sponsora: ${SP_CAT.find(x=>x[0]===cat)[1].toLowerCase()}. ${cat==='tit'?'Sponsor tytularny może być tylko jeden.':'Więcej miejsc daje rozbudowa siedziby klubu i wyższa renoma.'}`};render();return;}
  const m=Math.round(o.m*spDurMul(mo)/1000)*1000;const c={id:o.id,cat,n:o.n,col:o.col,m,left:mo-1,months:mo,start:today()};s.act.push(c);s.off[cat]=s.off[cat].filter(x=>x.id!==id);
  money(m,'Sponsor');finLog(`Sponsor ${o.n}: pierwsza rata`,m);news(`🤝 Nowy sponsor (${SP_CAT.find(x=>x[0]===cat)[1].toLowerCase()}): ${o.n} — ${fmt(m)} miesięcznie przez ${mo} mies.`);
  ui.spMsg={ok:true,t:`Podpisano umowę z ${o.n}: ${fmt(m)}/miesiąc, ${mo} mies.`};save();render();}
function addMonths(d,n){const [y,m]=d.split('-').map(Number);const t=new Date(Date.UTC(y,m-1+n,1));return t.getUTCFullYear()+'-'+String(t.getUTCMonth()+1).padStart(2,'0')+'-01';}
// 1. dnia miesiąca: raty, wygasanie umów, nowe oferty. Zwraca {inc}
function sponsorsMonth(d){const s=SPN();let inc=0;const ended=[],ending=[];
  for(const c of s.act.slice()){if(c.left>0){inc+=c.m;c.left--;if(c.left===0)ending.push(c);}else{ended.push(c);s.act=s.act.filter(x=>x!==c);}}
  genSpOffers();
  for(const c of ended)sendMail({cat:'spon',from:'Dział marketingu',t:`Wygasła umowa: ${c.n}`,s:`Miejsce sponsora (${SP_CAT.find(x=>x[0]===c.cat)[1].toLowerCase()}) jest wolne. Sprawdź nowe oferty.`,b:{type:'spexp',c},act:1,lab:'Umowa wygasła'});
  for(const c of ending)sendMail({cat:'spon',from:'Dział marketingu',t:`Ostatni miesiąc umowy: ${c.n}`,s:`Od 1. dnia przyszłego miesiąca to miejsce zwolni się.`,b:{type:'spexp',c,soon:1},lab:'Koniec umowy'});
  const free=SP_CAT.reduce((a,[k])=>a+Math.max(0,spSlots()[k]-spUsed(k)),0);
  sendMail({cat:'spon',from:'Dział marketingu',t:`Nowe oferty sponsorskie: ${MON_NOM[+d.slice(5,7)-1]}`,s:`${free?`Wolne miejsca: ${free}. `:''}Najlepsza oferta tytularna: ${s.off.tit[0]?fmt(s.off.tit[0].m)+'/mies.':'—'}.`,b:{type:'spons',free},act:free?1:0,lab:'Oferty'});
  return {inc};}
function initSponsors(){const s=SPN();if(s.init)return;s.init=1;genSpOffers();
  // na start klub ma tytularnego i głównego sponsora na kilka miesięcy
  for(const k of ['tit','main']){const o=s.off[k][0];if(!o)continue;s.act.push({id:o.id,cat:k,n:o.n,col:o.col,m:o.m,left:3,months:4,start:today()});s.off[k].shift();}
  sendMail({cat:'spon',from:'Dział marketingu',t:'Sponsorzy klubu: wybierz partnerów',s:'Mamy tytularnego i głównego sponsora na najbliższe miesiące. Wolne miejsca czekają na umowy.',b:{type:'spons'},act:1,lab:'Oferty'});}
function sponsMailHtml(m){const b=m.b;if(b.type==='spexp')return `<p class="mtext">${b.soon?`To ostatni miesiąc umowy ze sponsorem <b>${esc(b.c.n)}</b> (${fmt(b.c.m)}/mies.). Od przyszłego miesiąca miejsce się zwolni — rozejrzyj się za nowymi ofertami.`:`Umowa ze sponsorem <b>${esc(b.c.n)}</b> wygasła. Miejsce jest wolne.`}</p><div class="mact"><button class="btn" onclick="mailDone('${m.id}');go('sponsorzy')">Sponsorzy</button></div>`;
  const s=SPN();return `<p class="mtext">Oferty sponsorskie odświeżają się 1. dnia każdego miesiąca. Ich liczba i wysokość zależą od renomy klubu, wyników, siedziby klubu i gwiazd w kadrze.</p>
   <div class="tw"><table><thead><tr><th class="l">Rodzaj</th><th>Miejsca</th><th class="l">Najlepsza oferta</th></tr></thead><tbody>${SP_CAT.map(([k,n])=>{const o=(s.off[k]||[])[0];return `<tr><td class="l">${n}</td><td>${spUsed(k)}/${spSlots()[k]}</td><td class="l">${o?`${esc(o.n)} · <b>${fmt(o.m)}</b>/mies.`:'—'}</td></tr>`;}).join('')}</tbody></table></div>
   <div class="mact"><button class="btn" onclick="mailDone('${m.id}');go('sponsorzy')">Wybierz sponsorów</button></div>`;}
function spBadge(c){return `<span class="spb" style="--sc:${c.col}">${esc(c.n.split(' ').map(w=>w[0]).join(''))}</span>`;}
function sponsorView(){initSponsors();const s=SPN();const sl=spSlots();const q=spQuality();const [sb,star]=spStar();const used=s.act.length,tot=Object.values(sl).reduce((a,b)=>a+b,0);
  const next=addMonths(today(),1);
  return `<div class="kstrip"><div><span>Od sponsorów</span><b class="acc">${fmt(spMonthly())}</b><small>miesięcznie (płatne 1. dnia)</small></div><div><span>Miejsca</span><b>${used}/${tot}</b><small>zależą od siedziby (poz. ${myInfra().sied}) i renomy</small></div>
   <div><span>Atrakcyjność klubu</span><b>${Math.round(q*100)}%</b><small>renoma ${SAVE.ai[SAVE.team].rep}/100${star&&sb>0?` · gwiazda: ${esc(star.last)}`:''}</small></div><div><span>Nowe oferty</span><b>${fmtShort(next)}</b><small>co miesiąc, umowy 1–12 miesięcy</small></div></div>
  ${ui.spMsg?`<div class="card tmsg ${ui.spMsg.ok?'ok':'no'}">${esc(ui.spMsg.t)}</div>`:''}
  ${spUsed('tit')?'':'<div class="card tmsg no">Klub nie ma sponsora tytularnego — to największe pieniądze. Wybierz jedną z ofert poniżej.</div>'}
  ${SP_CAT.map(([k,n,,d])=>{const act=s.act.filter(c=>c.cat===k);const free=sl[k]-act.length;const offs=s.off[k]||[];
   return `<div class="card"><div class="row wrap"><h2 style="margin:0">${n}</h2><span class="small mut" style="margin-left:10px">${esc(d)}</span><span class="sp"></span><span class="small">Miejsca: <b>${act.length}/${sl[k]}</b></span></div>
    <div class="spgrid">${act.map(c=>`<div class="spact">${spBadge(c)}<div><b>${esc(c.n)}</b><div class="small mut">${fmt(c.m)}/mies. · ${c.left>0?`jeszcze ${c.left} ${c.left===1?'rata':c.left<5?'raty':'rat'} (do ${fmtDMY(addMonths(today(),c.left))})`:'ostatni miesiąc'}</div></div></div>`).join('')}${Array(Math.max(0,free)).fill('<div class="spact empty">Wolne miejsce</div>').join('')}</div>
    ${offs.length?`<div class="tw"><table><thead><tr><th class="l">Oferta</th><th>Miesięcznie (12 mies.)</th><th>Długość umowy</th><th></th></tr></thead><tbody>${offs.map(o=>`<tr><td class="l"><span class="fcell">${spBadge(o)}<b>${esc(o.n)}</b></span></td><td><b>${fmt(Math.round(o.m*spDurMul(12)/1000)*1000)}</b> <small class="mut">(1 mies.: ${fmt(Math.round(o.m*spDurMul(1)/1000)*1000)})</small></td>
      <td><select id="spd${o.id}">${Array.from({length:o.maxM||12},(_,i)=>i+1).reverse().map(mo=>`<option value="${mo}">${mo} mies. · ${fmt(Math.round(o.m*spDurMul(mo)/1000)*1000)}</option>`).join('')}</select></td>
      <td><button class="${free>0?'btn':'ghost'} sm" ${free>0?'':'disabled'} onclick="signSponsor('${k}','${o.id}')">Podpisz</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="mut small">Brak ofert w tym miesiącu.</p>'}</div>`;}).join('')}
  <p class="small mut">Krótka umowa = trochę wyższa rata, ale co miesiąc możesz trafić lepszą ofertę. Długa = pewne pieniądze na cały sezon. Lepszych i liczniejszych sponsorów przyciągają: wyższa renoma, dobre miejsce w tabeli, rozbudowana siedziba klubu i gwiazda w składzie.</p>`;}
