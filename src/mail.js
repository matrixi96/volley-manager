// ================= POCZTA (skrzynka wiadomości) =================
// SAVE.mail: [{id,d,cat,from,t,s,b:{type,...},r:0/1,st:0/1,ar:0/1,act:0/1}]
const MAIL_CAT={mecz:['Mecze','#e8b73a'],trening:['Trening','#38bdf8'],skaut:['Skauting','#a78bfa'],trans:['Transfery','#f97316'],med:['Medyczne','#ef6b5b'],
  spon:['Sponsorzy','#5ad17a'],fin:['Finanse','#eab308'],zarz:['Zarząd','#94a3b8'],druz:['Drużyna','#2dd4bf'],liga:['Liga i media','#f472b6'],soc:['Social media','#e1306c'],klub:['Klub','#60a5fa']};
const MAIL_MAX=300;
function mailBox(){return SAVE.mail||(SAVE.mail=[]);}
function mailOpts(){return SAVE.mailOpt||(SAVE.mailOpt={trD:1,trW:1,trM:1});}
function sendMail(o){if(SAVE.team==null)return null;const box=mailBox();SAVE.mailN=(SAVE.mailN||0)+1;
  const m=Object.assign({id:'m'+SAVE.mailN,d:SAVE._now||today(),cat:'klub',from:'Klub',t:'',s:'',b:{type:'text'},r:0,st:0,ar:0,act:0},o);if(!m.tm)m.tm=mailTime(m);box.unshift(m);
  if(box.length>MAIL_MAX){// najpierw wyrzucamy najstarsze przeczytane, potem najstarsze w ogóle
    let i=box.length-1;while(box.length>MAIL_MAX&&i>=0){if(box[i].r&&!box[i].st)box.splice(i,1);i--;}while(box.length>MAIL_MAX)box.pop();}
  return m;}
function unreadN(){return mailBox().filter(m=>!m.r&&!m.ar).length;}
function stripEmoji(t){return String(t).replace(/^\p{Extended_Pictographic}(‍\p{Extended_Pictographic})*️?\s*/u,'');}
// automatyczne wiadomości z newsów (kontuzje, transfery, liga, zarząd…)
const NEWS_MAP=[[/^🚑/,'med','Lekarz klubowy','Kontuzja'],[/^🤝/,'spon','Dział marketingu','Sponsorzy'],[/^✅ .*wrócił/,'med','Lekarz klubowy','Powrót do zdrowia'],[/^❌ Zostałeś/,'zarz','Zarząd klubu','Decyzja zarządu'],[/^👔/,'zarz','Zarząd klubu','Wiadomość od zarządu'],
  [/^(✍️|💰|👋|📄 R)/,'trans','Dyrektor sportowy','Kadra i kontrakty'],[/^🔁/,'liga','Media','Transfer w lidze'],[/^(🧑‍🏫|📄 Z)/,'klub','Sekretariat klubu','Sztab szkoleniowy'],
  [/^(🏗️|🎉)/,'klub','Zarządca obiektów','Infrastruktura'],[/^(🌱|⬆️|⬇️|📄 J)/,'druz','Akademia','Juniorzy'],[/^(🏆|⭐|📣|📈|😮)/,'liga','Biuro ligi','Liga'],
  [/^(😤|📢|©️|🎂)/,'druz','Kapitan drużyny','Szatnia']];
function mailFromNews(t){if(/^(✅ Wygrana|❌ Porażka)/.test(t))return;const r=NEWS_MAP.find(x=>x[0].test(t));if(!r)return;const tx=stripEmoji(t);
  sendMail({cat:r[1],from:r[2],t:tx,s:r[3],b:{type:'text',x:tx},ic:(t.match(/^\p{Extended_Pictographic}/u)||[''])[0]});}
// ---- generatory ----
function mailMatch(m,c){try{if(typeof socAfterMatch==='function')socAfterMatch(m,c);}catch(e){console.error(e);}try{const me=m.sides[0],op=m.sides[1];const won=m.winner===0;const T=teamTotals(me),O=teamTotals(op);
  const rate=sd=>sd.pl.filter(p=>p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0).map(p=>[p.id,p.last,p.pos,Math.round((liveRating(p)||6)*10)/10,p.st.kill+p.st.blk+p.st.ace,p.st.att?Math.round(p.st.kill/p.st.att*100):null,p.st.rec?Math.round(p.st.recPos/p.st.rec*100):null]).sort((a,b)=>b[3]-a[3]);
  const mine=rate(me),opp=rate(op);const best=mine.concat(opp).sort((a,b)=>b[3]-a[3])[0];
  const s=S();let pos=null;if(c.kind==='liga'||c.kind==='po'){const tb=leagueTable();pos=tb.findIndex(x=>x.i===SAVE.team)+1;}
  const kind=c.kind==='spar'?'Sparing':c.kind==='po'?'Play-off':`${s.round}. kolejka`;const sc=`${m.setsWon[0]}:${m.setsWon[1]}`;
  sendMail({cat:'mecz',from:c.kind==='spar'?'Sekretariat klubu':'Biuro ligi',t:`${kind}: ${won?'wygrana':'porażka'} ${sc} z ${op.team.name}`,s:`${won?'Wygrywamy':'Przegrywamy'} ${sc}. Zawodnik meczu: ${best?best[1]:'—'}.${pos?` Jesteśmy na ${pos}. miejscu.`:''}`,
    b:{type:'match',me:me.team.idx,op:op.team.idx,home:c.h===SAVE.team,sets:m.sets.map(x=>x.slice()),sw:m.setsWon.slice(),won:won?1:0,pos,best,mine:mine.slice(0,8),T:[T.kill,T.att,T.blk,T.ace,T.recPos,T.rec,T.attErr+T.srvErr],O:[O.kill,O.att,O.blk,O.ace,O.recPos,O.rec,O.attErr+O.srvErr],kind,psy:psyLines(m)}});}catch(e){console.error(e);}}
// psychologia meczu: kto się załamał, kto zagrał mądrze, kto walczył
function psyLines(m){const ev=m.cfEv||[],L=[];const W={prz:'w przyjęciu',zag:'na zagrywce',ata:'w ataku',roz:'w rozegraniu','':''};
  const tl=ev.filter(e=>e.k==='tilt'&&e.i===0);const by={};for(const e of tl){(by[e.id]=by[e.id]||[]).push(e);}
  for(const id in by){const xs=by[id];const ws=[...new Set(xs.map(x=>W[x.w]).filter(Boolean))];L.push(`🔻 ${xs[0].n} załamał się ${ws.join(' i ')||'po błędach'} (set ${[...new Set(xs.map(x=>x.set))].join(', ')}${xs.length>1?`, ${xs.length} razy`:''}).`);}
  const cm=ev.filter(e=>e.k==='calm'&&e.i===0);if(cm.length)L.push(`🧘 Przerwa z uspokojeniem (set ${[...new Set(cm.map(x=>x.set))].join(', ')}) postawiła zespół na nogi.`);
  const sf={};for(const e of ev)if(e.k==='safe'&&e.i===0)sf[e.n]=(sf[e.n]||0)+1;{const ks=Object.keys(sf);if(ks.length)L.push(`🧠 Po zepsutej zagrywce bezpiecznie zagrali: ${ks.map(n=>n+(sf[n]>1?` (${sf[n]}×)`:'')).join(', ')}.`);}
  for(const p of m.sides[0].pl)if((p.st.sav||0)>=2)L.push(`💪 ${p.last} uratował ${p.st.sav} piłki „nie do obrony”.`);
  const ot=[...new Set(ev.filter(e=>e.k==='tilt'&&e.i===1).map(e=>e.n))];if(ot.length)L.push(`Rywal: załamali się ${ot.join(', ')}.`);
  if(ev.some(e=>e.k==='calm'&&e.i===1))L.push('Rywal brał przerwę, żeby uspokoić zespół.');
  return L.slice(0,7);}
function trSumm(days){const t=myTeam();const ag=t.players.map(p=>{const a=repAgg(days,p.id);return [p.id,p.last,a.n,a.avg==null?null:Math.round(a.avg*10)/10,Math.round(a.tot*100)/100,a.f0==null?0:a.f1-a.f0,a.fr,a.inj||0,Object.keys(a.up)];}).filter(x=>x[2]||x[7]);
  const cnt={};for(const d of days)for(const u of d.u)cnt[u]=(cnt[u]||0)+1;return {ag,cnt,from:days.length?days[days.length-1].d:null,to:days.length?days[0].d:null,n:days.length};}
function asyName(){const a=SAVE.staff&&SAVE.staff.asy;return a?`${a.first[0]}. ${a.last} (asystent)`:'Sztab szkoleniowy';}
function mailTraining(kind,days){if(!days.length||kind==='D')return;const o=mailOpts();if(kind==='D'&&!o.trD||kind==='W'&&!o.trW||kind==='M'&&!o.trM)return;
  const sm=trSumm(days);const rated=sm.ag.filter(x=>x[3]!=null).sort((a,b)=>b[3]-a[3]);if(!rated.length&&kind==='D')return;
  const best=rated[0],worst=rated[rated.length-1];const tired=sm.ag.filter(x=>x[6]!=null&&x[6]<55).map(x=>x[1]);const ups=sm.ag.filter(x=>x[8].length);
  const ttl=kind==='D'?`Trening ${fmtShort(days[0].d)}: ${days[0].u.map(u=>TR_UNITS[u].n.toLowerCase()).join(', ')||'dzień wolny'}`:kind==='W'?`Raport tygodniowy z treningów (${fmtShort(sm.from)} – ${fmtShort(sm.to)})`:`Raport miesięczny z treningów: ${MON_NOM[+sm.to.slice(5,7)-1]||''}`;
  const top=rated.filter(x=>x[3]>=7).slice(0,3),low=rated.filter(x=>x[3]<6.5).slice(-3).reverse();
  const sn=`${top.length?`Wyróżnili się: ${top.map(x=>`${x[1]} (${fx1(x[3])})`).join(', ')}.`:'Nikt nie przekroczył oceny 7,0.'}${low.length?` Poniżej oczekiwań: ${low.map(x=>`${x[1]} (${fx1(x[3])})`).join(', ')}.`:''}${ups.length?` Podniesione atrybuty: ${ups.length} zawodn.`:''}${tired.length?` Zmęczeni: ${tired.length}.`:''}`;
  sendMail({cat:'trening',from:asyName(),t:ttl,s:sn,b:{type:'train',k:kind,sm},lab:kind==='D'?'Raport dzienny':kind==='W'?'Raport tygodniowy':'Raport miesięczny'});}
// codziennie: raporty tygodniowe (poniedziałek) i miesięczne (1. dnia)
function mailDaily(d){const rep=(SAVE.trn&&SAVE.trn.rep)||[];try{fitMail(d);}catch(e){console.error(e);}
  if(dow(d)===1){const lim=addDays(d,-7);mailTraining('W',rep.filter(x=>x.d>=lim&&x.d<d));}
  if(d.endsWith('-01')){const lim=addDays(d,-31);const pm=addDays(d,-1).slice(0,7);mailTraining('M',rep.filter(x=>x.d>lim&&x.d.slice(0,7)===pm));}}
// ---- akcje ----
function mailOpen(id){const m=mailBox().find(x=>x.id===id);if(!m)return;m.r=1;ui.mailNoAuto=0;if(typeof mailReadHook==='function')mailReadHook(m);ui.mailSel=id;save();render();}
function mailStar(id){const m=mailBox().find(x=>x.id===id);if(m){m.st=m.st?0:1;save();render();}}
function mailArch(id){const m=mailBox().find(x=>x.id===id);if(m){m.ar=m.ar?0:1;if(ui.mailSel===id)ui.mailSel=null;save();render();}}
function mailUnread(id){const m=mailBox().find(x=>x.id===id);if(m){m.r=0;ui.mailSel=null;ui.mailNoAuto=1;save();render();}}
function mailAllRead(){for(const m of mailBox())m.r=1;save();render();}
function mailDone(id){const m=mailBox().find(x=>x.id===id);if(m)m.act=0;}
function goTrainRep(k){ui.trRepP=k==='D'?'day':k==='W'?'week':'month';ui.trRepPl='';go('trening');setTimeout(()=>{const el=[...document.querySelectorAll('.card h2')].find(h=>/Raport z treningów/i.test(h.textContent));if(el)el.scrollIntoView({behavior:'smooth'});},50);}
// ---- widok ----
function mailInitials(f){const w=String(f).replace(/\(.*\)/,'').trim().split(/\s+/);return (w[0][0]+(w[1]?w[1][0]:'')).toUpperCase().replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g,'');}
function mailTime(m){const n=parseInt(String(m.id).replace(/\D/g,''))||0;const h=(n*2654435761>>>0)%100;
  const base=m.cat==='mecz'?[21,2]:m.cat==='trening'?[17,3]:m.cat==='fin'&&m.b&&m.b.type==='md'?[22,1]:m.cat==='med'?[9,6]:[8,10];const H=base[0]+h%base[1],M=(h*7)%60;return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0');}
function mailList(){const f=ui.mailF||'all',c=ui.mailC||'';let xs=mailBox();
  if(c==='star')xs=xs.filter(m=>m.st);else if(c==='arch')xs=xs.filter(m=>m.ar);else{xs=xs.filter(m=>!m.ar);if(c)xs=xs.filter(m=>m.cat===c);}
  if(f==='unread')xs=xs.filter(m=>!m.r);else if(f==='act')xs=xs.filter(m=>m.act);
  const q=(ui.mailQ||'').trim().toLowerCase();if(q)xs=xs.filter(m=>(m.t+' '+m.s+' '+m.from).toLowerCase().includes(q));return xs;}
function dayHdr(d){const n=daysBetween(d,today());const x=fmtShort(d);return n===0?'dziś, '+x:n===1?'wczoraj, '+x:x;}
function mailItem(m){const C=MAIL_CAT[m.cat]||MAIL_CAT.klub;return `<button class="mx ${m.r?'rd':'ur'} ${ui.mailSel===m.id?'sel':''}" style="--mc:${C[1]}" onclick="mailOpen('${m.id}')">
   <span class="mxf">${esc(m.from)}${m.st?' <span class="mstar">★</span>':''}</span><span class="mxc">${C[0]}</span>
   <span class="mxt">${m.r?'':'<i class="mdot"></i>'}${esc(m.t)}</span><span class="mxh">${m.tm||mailTime(m)}</span>
   ${m.act?'<span class="mxa">Wymaga działania</span>':''}</button>`;}
function mailView(){const box=mailBox();const xs=mailList();const c=ui.mailC||'';const f=ui.mailF||'all';const un=unreadN(),ac=box.filter(m=>m.act&&!m.ar).length;
  if(!ui.mailSel&&xs.length&&window.innerWidth>760&&!ui.mailNoAuto){const m0=xs[0];ui.mailSel=m0.id;m0.r=1;}
  let list='',last=null;for(const m of xs.slice(0,150)){if(m.d!==last){list+=`<div class="mxd">${dayHdr(m.d)}</div>`;last=m.d;}list+=mailItem(m);}
  const sel=box.find(m=>m.id===ui.mailSel);
  return `<div class="mail mail2 ${sel?'hasSel':''}">
   <div class="mlist"><div class="mxh1"><b>Skrzynka</b></div>
    <div class="mxtabs">${[['all','Wszystkie'],['unread',`Nowe (${un})`],['act',`Zadania (${ac})`]].map(([k,l])=>`<button class="${f===k?'on':''}" onclick="ui.mailF='${k}';render()">${l}</button>`).join('')}</div>
    <div class="mxtools"><button class="mxi ${ui.mailS?'on':''}" title="Szukaj" onclick="ui.mailS=!ui.mailS;if(!ui.mailS)ui.mailQ='';render();setTimeout(()=>{const e=document.getElementById('mxq');if(e)e.focus()},0)">⌕</button>
     <select class="mxcat" onchange="ui.mailC=this.value;ui.mailSel=null;render()"><option value="">Wszystkie kategorie</option><option value="star" ${c==='star'?'selected':''}>Oznaczone ★</option>${Object.entries(MAIL_CAT).map(([k,[n]])=>{const u=box.filter(m=>!m.ar&&!m.r&&m.cat===k).length;return `<option value="${k}" ${c===k?'selected':''}>${n}${u?` (${u})`:''}</option>`;}).join('')}<option value="arch" ${c==='arch'?'selected':''}>Archiwum</option></select>
     <button class="mxi" title="Oznacz wszystkie jako przeczytane" onclick="mailAllRead()">✓</button></div>
    ${ui.mailS?`<input id="mxq" class="mxq" placeholder="Szukaj w poczcie…" value="${esc(ui.mailQ||'')}" oninput="ui.mailQ=this.value;const p=this.selectionStart;render();const e=document.getElementById('mxq');if(e){e.focus();e.setSelectionRange(p,p);}">`:''}
    <div class="mitems">${list||'<p class="mut small" style="padding:14px">Brak wiadomości.</p>'}</div></div>
   <div class="mpane">${sel?mailPane(sel):'<div class="mempty"><div style="font-size:40px">✉️</div><p class="mut">Wybierz wiadomość z listy.</p></div>'}</div></div>`;}
function mailRel(m){const b=m.b||{};const out=[];const c=myNext();const s=S();
  const nx=()=>{if(!c)return;const e=nextEvent();out.push(['Zapowiedź następnego meczu',`${esc(TEAMS[c.h].short)} – ${esc(TEAMS[c.a].short)}${e?' · '+fmtShort(e.d)+(e.t?' '+e.t:''):''}`,"go('mecz')",'#A32D2D']);};
  const add=(l,t,a,col)=>out.push([l,t,a,col]);
  if(b.type==='match'){add('Analiza','Centrum danych',"go('dane')",'#185FA5');nx();}
  else if(b.type==='train')add('Trening','Plan i raporty treningowe',"go('trening')",'#0F6E56');
  else if(b.type==='fit'){add('Skład','Sprawdź ustawienie',"go('sklad')",'#0F6E56');nx();}
  else if(b.type==='md'||m.cat==='fin')add('Finanse','Przychody i wydatki',"go('finanse')",'#854F0B');
  else if(m.cat==='skaut')add('Skauting','Raporty i zadania skautów',"go('skauting')",'#534AB7');
  else if(m.cat==='trans'||b.type==='offer')add('Transfery','Lista transferowa',"go('transfery')",'#993C1D');
  else if(m.cat==='soc')add('Social media','Profil klubu i kryzysy',"go('social')",'#993556');
  else if(m.cat==='spon')add('Sponsorzy','Umowy i oferty',"go('sponsorzy')",'#3B6D11');
  else if(m.cat==='med'){add('Skład','Sprawdź ustawienie',"go('sklad')",'#0F6E56');}
  else if(m.cat==='zarz')add('Trener','Zaufanie zarządu',"go('trener')",'#444441');
  if(out.length<2&&b.type!=='match'&&b.type!=='fit')nx();
  return out.length?`<div class="mxrel"><div class="mxrt">Powiązane informacje</div><div class="mxrg">${out.slice(0,3).map(([l,t,a,col])=>`<button class="mxrc" style="--rc:${col}" onclick="${a}"><small>${l}</small><b>${t}</b></button>`).join('')}</div></div>`:'';}
function mailPane(m){const C=MAIL_CAT[m.cat]||MAIL_CAT.klub;const from=String(m.from).replace(/\s*\(([^)]*)\)\s*$/,' · $1');
  return `<div class="mxph" style="--mc:${C[1]}"><button class="ghost sm mback" onclick="ui.mailSel=null;render()">←</button><span class="mxav">${m.ic||mailInitials(m.from)}</span>
    <div class="mxpt"><small>${esc(from)}</small><h1>${esc(m.b&&m.b.x&&/…$/.test(m.t)?m.b.x:m.t)}</h1></div><span class="sp"></span>
    <div class="mxpa"><button class="mxdots" onclick="ui.mailMenu=!ui.mailMenu;render()">⋯</button><span class="mxtm">${m.tm||mailTime(m)}</span>
     ${ui.mailMenu?`<div class="mxmenu"><button onclick="ui.mailMenu=0;mailStar('${m.id}')">${m.st?'★ Usuń gwiazdkę':'☆ Oznacz gwiazdką'}</button><button onclick="ui.mailMenu=0;mailUnread('${m.id}')">● Oznacz jako nieprzeczytaną</button><button onclick="ui.mailMenu=0;mailArch('${m.id}')">${m.ar?'↺ Przywróć z archiwum':'🗄 Archiwizuj'}</button><div class="mxmd">${C[0]}${m.lab?' · '+esc(m.lab):''} · ${fmtLong(m.d)}</div></div>`:''}</div></div>
   <div class="mbody mxb">${mailBodyHtml(m)}${mailRel(m)}</div>`;}
// ---- test wydolności przed meczem (zawodnicy po kontuzji) ----
function fitMail(d){if(SAVE.team==null||!SAVE.world)return;const ev=(myEvents()[d]||[]).find(e=>!e.r);if(!ev)return;SAVE.fitSent=SAVE.fitSent||{};if(SAVE.fitSent[d])return;
  const lu=new Set(Object.values(SAVE.lineup||{}));const rows=[];
  for(const p of myTeam().players){const L=p.injLast;if(!L||p.inj)continue;const since=daysBetween(L.back,d);if(since<0||since>14)continue;const fr=Math.round(frOf(p));
    let test,rec,lvl;if(since<=3){if(fr>=75){test='zaliczony';rec='Może zagrać, małe ryzyko';lvl=2;}else{test='częściowo';rec='Najwyżej 2 sety, potem zmiana';lvl=1;}}
    else{test='nie wymagany';if(fr<70){rec='Braki kondycyjne, wymaga obserwacji';lvl=1;}else{rec='Gotowy do pełnego meczu';lvl=2;}}
    rows.push({id:p.id,n:p.first+' '+p.last,pos:p.pos,role:lu.has(p.id)?'podstawowy skład':'rezerwowy',inj:L.n,days:L.days,since,test,rec,lvl,fr});}
  SAVE.fitSent[d]=1;for(const k of Object.keys(SAVE.fitSent))if(daysBetween(k,d)>30)delete SAVE.fitSent[k];
  if(!rows.length)return;const med=SAVE.staff&&SAVE.staff.med;const op=TEAMS[ev.op];
  sendMail({cat:'med',from:med?`${med.first[0]}. ${med.last} (fizjoterapeuta)`:'Pion medyczny',t:'Testy wydolności przed meczem',s:`${rows.length} ${rows.length===1?'zawodnik':'zawodników'} po kontuzji przed meczem z ${op.name}.`,b:{type:'fit',rows,op:ev.op},lab:'Kontuzje'});}
function fitMailHtml(b){const op=TEAMS[b.op];const tc=t=>t==='zaliczony'?'good':t==='częściowo'?'warn':'mut';
  return `<p class="mtext">Przedstawiam wyniki przedmeczowego testu wydolności ${b.rows.length} ${b.rows.length===1?'zawodnika':'zawodników'} przed spotkaniem z ${esc(op?op.name:'rywalem')}.</p>
   <div class="mxbox"><h3 style="margin:0">Monitorowani zawodnicy</h3><div class="small mut">Powrót po kontuzji w ciągu ostatnich 2 tygodni</div>
   <div class="tw"><table class="mxft"><thead><tr><th class="l">Zawodnik</th><th class="l">Ostatnia kontuzja</th><th class="l">Test</th><th class="l">Zalecenie</th><th>Świeżość</th></tr></thead><tbody>
   ${b.rows.map(r=>`<tr><td class="l"><button class="link pn" onclick="openPop('${r.id}')">${esc(r.n)}</button> ${pTag(r.pos)}<br><small class="mut">${r.role}</small></td><td class="l">${esc(r.inj)}<br><small class="mut">${typeof r.days==='number'&&r.days?r.days+' dni przerwy · ':''}wrócił ${r.since===0?'dziś':r.since+' dni temu'}</small></td>
     <td class="l"><span class="mxpill ${tc(r.test)}">${r.test==='zaliczony'?'✓ ':''}${r.test}</span></td><td class="l">${esc(r.rec)}</td><td><b style="color:${frCol(r.fr)}">${r.fr}%</b></td></tr>`).join('')}</tbody></table></div>
   <div class="mx2"><div><b>Testy wydolności</b><p>Zawodnicy wracający po kontuzji przechodzą test przed meczem. Wynik mówi, ile mogą zagrać i czy grozi im nawrót urazu.</p></div>
   <div><b>Porada pionu medycznego</b><p>Wystawienie zawodnika, który nie jest w pełni sił, zwiększa ryzyko pogłębienia urazu. Możesz się z tym nie zgodzić — decyzja o składzie należy do Ciebie.</p></div></div></div>`;}
function mailBodyHtml(m){const b=m.b||{};
  if(b.type==='match')return matchMailHtml(b);
  if(b.type==='train')return trainMailHtml(b);
  if(typeof scoutMailHtml==='function'&&/^(scout|opp|market)$/.test(b.type))return scoutMailHtml(m);
  if(typeof sponsMailHtml==='function'&&/^(spons|spexp)$/.test(b.type))return sponsMailHtml(m);
  if(b.type==='offer')return offerMailHtml(m);
  if(b.type==='fin')return finMailHtml(b);
  if(b.type==='md'&&typeof mdMailHtml==='function')return mdMailHtml(b);
  if(b.type==='fit')return fitMailHtml(b);
  if(b.type==='camp'&&typeof campMailHtml==='function')return campMailHtml(b);
  if(b.type==='talk'&&typeof talkMailHtml==='function')return talkMailHtml(b);
  return `<p class="mtext">${esc(b.x||m.s)}</p>`;}
function matchMailHtml(b){const T=i=>TEAMS[i];const h=b.home?b.me:b.op,a=b.home?b.op:b.me;const sw=b.home?b.sw:[b.sw[1],b.sw[0]];const sets=b.sets.map(s=>b.home?s:[s[1],s[0]]);
  const st=(l,x,y)=>`<tr><td class="l">${l}</td><td><b>${x}</b></td><td><b>${y}</b></td></tr>`;const pc2=(k,n)=>n?Math.round(k/n*100)+'%':'–';
  return `<div class="mcard"><div class="mch"><span>Twój mecz · ${esc(b.kind)}</span><b class="${b.won?'good':'bad'}">${b.won?'WYGRANA':'PORAŻKA'}</b></div>
    <div class="mscore"><span class="mtn">${esc(T(h).name)}</span>${teamCrest(h,54)}<b>${sw[0]}–${sw[1]}</b>${teamCrest(a,54)}<span class="mtn">${esc(T(a).name)}</span></div>
    <div class="msets">${sets.map((s,i)=>`<div><span>Set ${i+1}</span><b>${s[0]}–${s[1]}</b></div>`).join('')}</div></div>
   ${b.best?`<h3>Zawodnik meczu</h3><div class="mpotm">${PLAYERS[b.best[0]]?pFace(PLAYERS[b.best[0]].p,56):''}<div><b class="mpn">${esc(PLAYERS[b.best[0]]?PLAYERS[b.best[0]].p.first+' '+b.best[1]:b.best[1])}</b><div class="mut">${POS_NAMES[b.best[2]]||''} · ${PLAYERS[b.best[0]]&&PLAYERS[b.best[0]].p.tm>=0?esc(TEAMS[PLAYERS[b.best[0]].p.tm].name):''}</div></div><span class="sp"></span><span class="mrt">${fx1(b.best[3])}</span></div>
     <div class="mkpi"><div><span>Punkty</span><b>${b.best[4]}</b></div><div><span>Skuteczność ataku</span><b>${b.best[5]==null?'–':b.best[5]+'%'}</b></div><div><span>Przyjęcie pozytywne</span><b>${b.best[6]==null?'–':b.best[6]+'%'}</b></div></div>`:''}
   ${b.psy&&b.psy.length?`<h3>Psychologia meczu</h3><div class="mpsy">${b.psy.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`:''}
   <h3>Statystyki drużyn</h3><div class="tw"><table class="cmp"><thead><tr><th class="l"></th><th>${esc(T(b.me).short)}</th><th>${esc(T(b.op).short)}</th></tr></thead><tbody>
    ${st('Atak',`${b.T[0]}/${b.T[1]} (${pc2(b.T[0],b.T[1])})`,`${b.O[0]}/${b.O[1]} (${pc2(b.O[0],b.O[1])})`)}${st('Bloki',b.T[2],b.O[2])}${st('Asy',b.T[3],b.O[3])}${st('Przyjęcie pozytywne',pc2(b.T[4],b.T[5]),pc2(b.O[4],b.O[5]))}${st('Błędy własne (atak + zagrywka)',b.T[6],b.O[6])}</tbody></table></div>
   <h3>Oceny naszych zawodników</h3><div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Ocena</th><th>Pkt</th><th>Atak</th><th>Przyj.+</th></tr></thead><tbody>${b.mine.map(x=>`<tr><td class="l"><b>${esc(x[1])}</b> <small class="mut">${x[2]?pTag(x[2]):''}</small></td><td class="${x[3]>=7?'good':x[3]<=5.4?'bad':''}"><b>${fx1(x[3])}</b></td><td>${x[4]}</td><td>${x[5]==null?'–':x[5]+'%'}</td><td>${x[6]==null?'–':x[6]+'%'}</td></tr>`).join('')}</tbody></table></div>
   ${b.pos?`<p class="mtext">Po tym meczu jesteśmy na <b>${b.pos}. miejscu</b> w tabeli.</p>`:''}
   <div class="mact"><button class="btn" onclick="go('tabela')">Zobacz tabelę</button><button class="ghost" onclick="go('staty')">Statystyki sezonu</button></div>`;}
function trainMailHtml(b){const sm=b.sm;const ag=sm.ag.slice().sort((x,y)=>(y[3]||0)-(x[3]||0));
  return `<p class="mtext">${b.k==='D'?'Podsumowanie dzisiejszych zajęć.':`Okres: ${fmtShort(sm.from)} – ${fmtShort(sm.to)} (${sm.n} dni treningowych).`}</p>
   <div class="trsum small">${TR_ORDER.filter(u=>sm.cnt[u]).map(u=>`<span class="trt tu-${u}">${TR_UNITS[u].ic} ${TR_UNITS[u].n}${b.k==='D'?'':' × '+sm.cnt[u]}</span>`).join('')}</div>
   ${(()=>{const rt=ag.filter(x=>x[3]!=null);const top=rt.filter(x=>x[3]>=7).slice(0,3),low=rt.filter(x=>x[3]<6.5).slice(-3).reverse();const pp=x=>{const P=PLAYERS[x[0]];return P?P.p:null;};
     const card=(x,good)=>{const p=pp(x);return `<div class="trhl ${good?'g':'b'}">${p?pFace(p,40):''}<div><button class="link pn" onclick="openPop('${x[0]}')"><b>${esc(x[1])}</b></button> ${p?pTag(p.pos):''}<div class="small mut">${x[2]} jedn. · postęp +${(x[4]||0).toFixed(2).replace('.',',')}${x[8].length?' · '+x[8].map(k=>attrSh(k)+' +1').join(', '):''}</div></div><b class="${scCls(x[3])} trhs">${fx1(x[3])}</b>${talkBtn(x[0],1)}</div>`;};
     return `<div class="trhlw"><div><h3>Wyróżniający się <small class="mut">(ocena 7,0 i wyżej)</small></h3>${top.map(x=>card(x,1)).join('')||'<p class="small mut">Nikt nie przekroczył oceny 7,0.</p>'}</div>
      <div><h3>Poniżej oczekiwań <small class="mut">(ocena poniżej 6,5)</small></h3>${low.map(x=>card(x,0)).join('')||'<p class="small mut">Nikt nie spadł poniżej 6,5.</p>'}</div></div><h3 style="margin-top:14px">Wszyscy zawodnicy</h3>`;})()}
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Jedn.</th><th>Ocena</th><th>Postęp</th><th class="l">Podniesione</th><th>Forma</th><th>Świeżość</th></tr></thead><tbody>
   ${ag.map(x=>`<tr><td class="l"><b>${esc(x[1])}</b>${x[7]?' <span class="bad">🚑</span>':''}</td><td>${x[2]}</td><td class="${scCls(x[3])}"><b>${fx1(x[3])}</b></td><td>+${(x[4]||0).toFixed(2).replace('.',',')}</td><td class="l">${x[8].map(k=>`<span class="trt tu-up">${attrSh(k)} +1</span>`).join('')||'<span class="mut">—</span>'}</td><td class="${x[5]>1?'good':x[5]<-1?'bad':'mut'}">${x[5]>0?'+':''}${x[5]}</td><td><span style="color:${frCol(x[6]==null?100:x[6])}">${x[6]==null?'–':x[6]+'%'}</span></td></tr>`).join('')}</tbody></table></div>
   <div class="mact"><button class="btn" onclick="goTrainRep('${b.k}')">Pełny raport</button><button class="ghost" onclick="go('trening')">Plan treningowy</button></div>`;}
function finMailHtml(b){return `<div class="tw"><table class="cmp"><tbody>${b.rows.map(r=>`<tr><td class="l">${esc(r[0])}</td><td class="${r[1]<0?'bad':'good'}">${r[1]>=0?'+':''}${fmt(r[1])}</td></tr>`).join('')}<tr><td class="l"><b>Bilans miesiąca</b></td><td><b>${fmt(b.tot)}</b></td></tr><tr><td class="l">Saldo klubu</td><td><b>${fmt(b.bal)}</b></td></tr></tbody></table></div><div class="mact"><button class="btn" onclick="go('finanse')">Finanse</button></div>`;}
function offerMailHtml(m){const b=m.b;const o=(SAVE.inbox||[]).find(x=>x.pid===b.pid&&x.tm===b.tm);const P=PLAYERS[b.pid];if(!P)return '<p class="mut">Zawodnik nie jest już dostępny.</p>';const p=P.p;
  return `<p class="mtext">${esc(TEAMS[b.tm].name)} chce kupić <b>${esc(p.first)} ${esc(p.last)}</b> (${POS_NAMES[p.pos]}, ${p.age} l., ocena ${rating(p)}) i oferuje <b>${fmt(b.fee)}</b>.</p>
   ${o&&p.tm===SAVE.team?`<div class="mact">${windowOpen()?`<button class="btn" onclick="mailDone('${m.id}');acceptBuy('${p.id}',${b.tm},${b.fee})">Akceptuj</button>`:''}<button class="ghost" onclick="mailDone('${m.id}');rejectInbox(SAVE.inbox.indexOf(SAVE.inbox.find(x=>x.pid==='${b.pid}'&&x.tm===${b.tm})))">Odrzuć</button><button class="ghost" onclick="openCard('${p.id}')">Karta zawodnika</button></div>`:'<p class="mut small">Oferta jest już nieaktualna.</p>'}`;}
