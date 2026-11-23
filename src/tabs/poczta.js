// ================= POCZTA (skrzynka wiadomości) =================
// SAVE.mail: [{id,d,cat,from,t,s,b:{type,...},r:0/1,st:0/1,ar:0/1,act:0/1}]
const MAIL_CAT={mecz:['Mecze','#e8b73a'],trening:['Trening','#38bdf8'],skaut:['Skauting','#a78bfa'],trans:['Transfery','#f97316'],med:['Medyczne','#ef6b5b'],
  spon:['Sponsorzy','#5ad17a'],fin:['Finanse','#eab308'],zarz:['Zarząd','#94a3b8'],druz:['Drużyna','#2dd4bf'],liga:['Liga i media','#f472b6'],soc:['Social media','#e1306c'],klub:['Klub','#60a5fa']};
const MAIL_MAX=300;
function mailBox(){return SAVE.mail||(SAVE.mail=[]);}
function mailOpts(){return SAVE.mailOpt||(SAVE.mailOpt={trD:1,trW:1,trM:1});}
function sendMail(o){if(SAVE.team==null)return null;if(o&&o.cat==='med'&&!o.weekly){(SAVE.medBuf=SAVE.medBuf||[]).push({d:SAVE._now||today(),t:o.t,s:o.s});SAVE.medBuf=SAVE.medBuf.slice(-40);return null;}const box=mailBox();SAVE.mailN=(SAVE.mailN||0)+1;
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
  [/^(😤|📢|©️)/,'druz','Kapitan drużyny','Szatnia']];
function mailFromNews(t){if(/^(✅ Wygrana|❌ Porażka)/.test(t))return;const r=NEWS_MAP.find(x=>x[0].test(t));if(!r)return;const tx=stripEmoji(t);
  sendMail({cat:r[1],from:r[2],t:tx,s:r[3],b:{type:'text',x:tx},ic:(t.match(/^\p{Extended_Pictographic}/u)||[''])[0]});}
// ---- generatory ----
function mailMatch(m,c){try{if(typeof socAfterMatch==='function')socAfterMatch(m,c);}catch(e){console.error(e);}try{const me=m.sides[0],op=m.sides[1];const won=m.winner===0;const T=teamTotals(me),O=teamTotals(op);
  const rate=sd=>sd.pl.filter(p=>p.st.srv+p.st.rec+p.st.att+p.st.dig+p.st.blk>0).map(p=>[p.id,p.last,p.pos,Math.round((liveRating(p)||6)*10)/10,p.st.kill+p.st.blk+p.st.ace,p.st.att?Math.round(p.st.kill/p.st.att*100):null,p.st.rec?Math.round(p.st.recPos/p.st.rec*100):null]).sort((a,b)=>b[3]-a[3]);
  const mine=rate(me),opp=rate(op);const best=mine.concat(opp).sort((a,b)=>b[3]-a[3])[0];
  const s=S();let pos=null;if(c.kind==='liga'||c.kind==='po'){const tb=leagueTable();pos=tb.findIndex(x=>x.i===SAVE.team)+1;}
  const kind=c.kind==='spar'?'Sparing':c.kind==='po'?'Play-off':c.kind==='cup'?cupName(myCountry()):c.kind==='euro'?euroLab(c):`${s.round}. kolejka`;const sc=`${m.setsWon[0]}:${m.setsWon[1]}`;
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
function trSumm(days){const t=myTeam();const ag=t.players.map(p=>{const a=repAgg(days,p.id);return [p.id,p.last,a.n,a.avg==null?null:Math.round(a.avg*10)/10,Math.round(a.tot*100)/100,a.f0==null?0:a.f1-a.f0,a.fr,a.inj||0,Object.keys(a.up),a.why||[]];}).filter(x=>x[2]||x[7]);
  const cnt={};for(const d of days)for(const u of d.u)cnt[u]=(cnt[u]||0)+1;return {ag,cnt,from:days.length?days[days.length-1].d:null,to:days.length?days[0].d:null,n:days.length};}
function asyName(){const a=SAVE.staff&&SAVE.staff.asy;return a?`${a.first[0]}. ${a.last} (asystent)`:'Sztab szkoleniowy';}
function mailTraining(kind,days){if(!days.length||kind==='D')return;const o=mailOpts();if(kind==='D'&&!o.trD||kind==='W'&&!o.trW||kind==='M'&&!o.trM)return;
  const sm=trSumm(days);const rated=sm.ag.filter(x=>x[3]!=null).sort((a,b)=>b[3]-a[3]);if(!rated.length&&kind==='D')return;
  const best=rated[0],worst=rated[rated.length-1];const tired=sm.ag.filter(x=>x[6]!=null&&x[6]<55).map(x=>x[1]);const ups=sm.ag.filter(x=>x[8].length);
  const ttl=kind==='D'?`Trening ${fmtShort(days[0].d)}: ${days[0].u.map(u=>TR_UNITS[u].n.toLowerCase()).join(', ')||'dzień wolny'}`:kind==='W'?`Raport tygodniowy z treningów (${fmtShort(sm.from)} – ${fmtShort(sm.to)})`:`Raport miesięczny z treningów: ${MON_NOM[+sm.to.slice(5,7)-1]||''}`;
  const {top,low}=trStand(rated);
  const sn=`${top.length?`Wyróżnili się: ${top.map(x=>trWho(x,true)).join(', ')}.`:'Nikt wyraźnie się nie wyróżnił.'}${low.length?` Poniżej oczekiwań: ${low.map(x=>trWho(x,false)).join(', ')}.`:''}${ups.length?` Podniesione atrybuty: ${ups.length} zawodn.`:''}${tired.length?` Zmęczeni: ${tired.length}.`:''}`;
  sendMail({cat:'trening',from:asyName(),t:ttl,s:sn,b:{type:'train',k:kind,sm},lab:kind==='D'?'Raport dzienny':kind==='W'?'Raport tygodniowy':'Raport miesięczny'});}
// codziennie: raporty tygodniowe (poniedziałek) i miesięczne (1. dnia)
// ---- raport medyczny co poniedziałek: zdarzenia z tygodnia + stan kadry ----
function medWeekly(d){if(SAVE.team==null||!SAVE.world||dow(d)!==1)return;if(SAVE.medWk===d)return;SAVE.medWk=d;const ev=(SAVE.medBuf||[]).filter(x=>x.t!=='Testy wydolności przed meczem');SAVE.medBuf=[];
  const t=myTeam();const inj=t.players.filter(p=>p.inj>0).map(p=>({id:p.id,n:p.first+' '+p.last,pos:p.pos,what:p.injN||'uraz',back:p.injUntil||addDays(d,p.inj),days:p.inj}));
  const back=t.players.filter(p=>!p.inj&&p.injLast&&p.injLast.back&&daysBetween(p.injLast.back,d)>=0&&daysBetween(p.injLast.back,d)<=21&&(+p.injLast.days||0)>=7).map(p=>({id:p.id,n:p.first+' '+p.last,pos:p.pos,since:daysBetween(p.injLast.back,d),fr:Math.round(frOf(p)),rf:typeof reinjF==='function'?Math.round((reinjF(p)-1)*100):0}));
  const tired=t.players.filter(p=>!p.inj&&!p.jr&&frOf(p)<60).map(p=>({id:p.id,n:p.first+' '+p.last,pos:p.pos,fr:Math.round(frOf(p))}));
  if(!ev.length&&!inj.length&&!back.length&&!tired.length)return;const med=SAVE.staff&&SAVE.staff.med;
  sendMail({cat:'med',weekly:1,from:med?`${med.first[0]}. ${med.last} (fizjoterapeuta)`:'Pion medyczny',t:`Raport medyczny tygodnia`,s:`${inj.length?`Kontuzjowani: ${inj.length}. `:'Brak kontuzji. '}${back.length?`Po powrocie: ${back.length}. `:''}${ev.length?`Zdarzenia: ${ev.length}.`:''}`,b:{type:'medw',ev,inj,back,tired},lab:'Raport medyczny'});}
function medWeeklyHtml(b){const sec=(h,x)=>x?`<h3>${h}</h3>${x}`:'';const tb=(head,rows)=>rows.length?`<div class="tw"><table><thead><tr>${head.map(x=>`<th class="l">${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`:'';
  return `<p class="mtext">Cotygodniowy raport pionu medycznego. Pojedyncze wiadomości o kontuzjach i powrotach są zebrane tutaj.</p>
   ${sec('Wydarzenia z ostatniego tygodnia',b.ev.length?`<ul>${b.ev.map(x=>`<li><span class="mut">${fmtShort(x.d)}</span> ${esc(x.t)}</li>`).join('')}</ul>`:'')}
   ${sec('Kontuzjowani',tb(['Zawodnik','Uraz','Powrót'],b.inj.map(x=>`<tr><td class="l">${pLink?pLink(x.id,x.n):esc(x.n)} ${pTag(x.pos)}</td><td class="l">${esc(x.what)}</td><td class="l">${fmtShort(x.back)} (${x.days} dni)</td></tr>`)))}
   ${sec('Po powrocie z urazu — uwaga na przeciążenie',tb(['Zawodnik','Od powrotu','Świeżość','Ryzyko odnowienia'],b.back.map(x=>`<tr><td class="l">${pLink?pLink(x.id,x.n):esc(x.n)} ${pTag(x.pos)}</td><td class="l">${x.since} dni</td><td class="l"><b style="color:${frCol(x.fr)}">${x.fr}%</b></td><td class="l">${x.rf>0?'+'+x.rf+'%':'normalne'}</td></tr>`)))}
   ${sec('Zmęczeni (świeżość poniżej 60%)',tb(['Zawodnik','Świeżość'],b.tired.map(x=>`<tr><td class="l">${pLink?pLink(x.id,x.n):esc(x.n)} ${pTag(x.pos)}</td><td class="l"><b style="color:${frCol(x.fr)}">${x.fr}%</b></td></tr>`)))}`;}
function mailDaily(d){try{medWeekly(d);}catch(e){console.error(e);}try{staffCostWarn(d);}catch(e){console.error(e);}const rep=(SAVE.trn&&SAVE.trn.rep)||[];try{fitMail(d);}catch(e){console.error(e);}try{if(typeof tutTips==='function')tutTips(d);}catch(e){console.error(e);}try{if(typeof ixDaily==='function')ixDaily(d);}catch(e){console.error(e);}try{if(typeof bmDaily==='function')bmDaily(d);}catch(e){console.error(e);}try{if(typeof agDaily==='function')agDaily(d);}catch(e){console.error(e);}try{if(typeof dlgDaily==='function')dlgDaily(d);}catch(e){console.error(e);}
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
  if(b.type==='ix')out.unshift(['Rozmowy','Odpowiedz zawodnikowi',"ui.ixTab=null;go('rozmowy')",'#B45309']);
  if(b.type==='ag')out.unshift(['Agenci','Odpowiedz agentowi',"ui.ixTab='agenci';go('rozmowy')",'#993C1D']);
  if(b.type==='bm')out.unshift(['Zarząd','Odpowiedz zarządowi',"ui.ixTab='zarzad';go('rozmowy')",'#444441']);
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
  if(b.type==='medw')return medWeeklyHtml(b);
  if(b.type==='ag'){const q=SAVE.ag&&SAVE.ag.q.find(x=>x.id===b.id);const P=q&&PLAYERS[q.pid];if(!q||!P)return '<p>Sprawa została już rozstrzygnięta. Historia: Rozmowy → Agenci.</p>';return `<p>${esc(AGQ[q.k].x(P.p,q))}</p><p><button class="btn" onclick="ui.ixTab='agenci';go('rozmowy')">Przejdź do rozmowy</button></p>`;}
  if(b.type==='bm'){const q=SAVE.bm&&SAVE.bm.q.find(x=>x.id===b.id);if(!q)return '<p>Sprawa została już rozstrzygnięta. Historia: Rozmowy → Zarząd.</p>';return `<p>${esc(BMQ[q.k].x(q))}</p><p><button class="btn" onclick="ui.ixTab='zarzad';go('rozmowy')">Przejdź do rozmowy</button></p>`;}
  if(b.type==='ix'){const q=SAVE.ix&&SAVE.ix.q.find(x=>x.id===b.id);if(!q)return '<p>Sprawa została już rozstrzygnięta. Historia rozmów i obietnice: zakładka Rozmowy.</p>';const P=PLAYERS[q.pid];return `<p>${P?esc(IX_T[q.k].x(P.p,q)):''}</p><p><button class="btn" onclick="ui.ixTab=null;go('rozmowy')">Przejdź do rozmowy</button></p>`;}
  if(b.type==='match')return matchMailHtml(b);
  if(b.type==='train')return trainMailHtml(b);
  if(typeof scoutMailHtml==='function'&&/^(scout|opp|market|recs)$/.test(b.type))return scoutMailHtml(m);
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
   ${(()=>{const rt=ag.filter(x=>x[3]!=null).sort((a,b)=>b[3]-a[3]);const {top,low}=trStand(rt);const pp=x=>{const P=PLAYERS[x[0]];return P?P.p:null;};
     const card=(x,good)=>{const p=pp(x);return `<div class="trhl ${good?'g':'b'}">${p?pFace(p,40):''}<div><button class="link pn" onclick="openPop('${x[0]}')"><b>${esc(x[1])}</b></button> ${p?pTag(p.pos):''}<div class="small mut">${x[2]} jedn. · postęp +${(x[4]||0).toFixed(2).replace('.',',')}${x[8].length?' · '+x[8].map(k=>attrSh(k)+' +1').join(', '):''}</div>${trWhyTxt(x[9]||[],good)?`<div class="small ${good?'good':'bad'}">${trWhyTxt(x[9]||[],good)}</div>`:''}</div><b class="${scCls(x[3])} trhs">${fx1(x[3])}</b>${talkBtn(x[0],1)}</div>`;};
     return `<div class="trhlw"><div><h3>Wyróżniający się <small class="mut">(wyraźnie powyżej średniej zespołu)</small></h3>${top.map(x=>card(x,1)).join('')||'<p class="small mut">Nikt wyraźnie się nie wyróżnił.</p>'}</div>
      <div><h3>Poniżej oczekiwań <small class="mut">(wyraźnie poniżej średniej zespołu)</small></h3>${low.map(x=>card(x,0)).join('')||'<p class="small mut">Nikt wyraźnie nie odstawał.</p>'}</div></div><h3 style="margin-top:14px">Wszyscy zawodnicy</h3>`;})()}
   <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Jedn.</th><th>Ocena</th><th>Postęp</th><th class="l">Podniesione</th><th>Forma</th><th>Świeżość</th></tr></thead><tbody>
   ${ag.map(x=>`<tr><td class="l"><b>${esc(x[1])}</b>${x[7]?' <span class="bad">🚑</span>':''}</td><td>${x[2]}</td><td class="${scCls(x[3])}"><b>${fx1(x[3])}</b></td><td>+${(x[4]||0).toFixed(2).replace('.',',')}</td><td class="l">${x[8].map(k=>`<span class="trt tu-up">${attrSh(k)} +1</span>`).join('')||'<span class="mut">—</span>'}</td><td class="${x[5]>1?'good':x[5]<-1?'bad':'mut'}">${x[5]>0?'+':''}${x[5]}</td><td><span style="color:${frCol(x[6]==null?100:x[6])}">${x[6]==null?'–':x[6]+'%'}</span></td></tr>`).join('')}</tbody></table></div>
   <div class="mact"><button class="btn" onclick="goTrainRep('${b.k}')">Pełny raport</button><button class="ghost" onclick="go('trening')">Plan treningowy</button></div>`;}
function finMailHtml(b){return `<div class="tw"><table class="cmp"><tbody>${b.rows.map(r=>`<tr><td class="l">${esc(r[0])}</td><td class="${r[1]<0?'bad':'good'}">${r[1]>=0?'+':''}${fmt(r[1])}</td></tr>`).join('')}<tr><td class="l"><b>Bilans miesiąca</b></td><td><b>${fmt(b.tot)}</b></td></tr><tr><td class="l">Saldo klubu</td><td><b>${fmt(b.bal)}</b></td></tr></tbody></table></div><div class="mact"><button class="btn" onclick="go('finanse')">Finanse</button></div>`;}
function offerMailHtml(m){const b=m.b;const o=(SAVE.inbox||[]).find(x=>x.pid===b.pid&&x.tm===b.tm);const P=PLAYERS[b.pid];if(!P)return '<p class="mut">Zawodnik nie jest już dostępny.</p>';const p=P.p;
  return `<p class="mtext">${esc(TEAMS[b.tm].name)} chce kupić <b>${esc(p.first)} ${esc(p.last)}</b> (${POS_NAMES[p.pos]}, ${p.age} l., ocena ${rating(p)}) i oferuje <b>${fmt(b.fee)}</b>.</p>
   ${o&&p.tm===SAVE.team?`<div class="mact">${windowOpen()?`<button class="btn" onclick="mailDone('${m.id}');acceptBuy('${p.id}',${b.tm},${b.fee})">Akceptuj</button>`:''}<button class="ghost" onclick="mailDone('${m.id}');rejectInbox(SAVE.inbox.indexOf(SAVE.inbox.find(x=>x.pid==='${b.pid}'&&x.tm===${b.tm})))">Odrzuć</button><button class="ghost" onclick="openCard('${p.id}')">Karta zawodnika</button></div>`:'<p class="mut small">Oferta jest już nieaktualna.</p>'}`;}

// kto odstaje od średniej zespołu w tym okresie (bez stałej liczby osób) i dlaczego
function trStand(rated){if(!rated.length)return {top:[],low:[]};const avg=rated.reduce((s,x)=>s+x[3],0)/rated.length;
  const top=rated.filter(x=>x[3]>=avg+0.5).slice(0,6),low=rated.filter(x=>x[3]<=avg-0.5).reverse().slice(0,6);return {top,low,avg};}
function trWho(x,good){const w=typeof trWhyTxt==='function'?trWhyTxt(x[9]||[],good):'';return `${x[1]} ${fx1(x[3])}${w?` (${w})`:''}`;}

// ================= ROZMOWY Z ZAWODNIKAMI (POCHWAŁA / KRYTYKA / MOTYWACJA) =================
const TALK_K=[['praise','Pochwal za trening','Doceń jego pracę na treningach'],['crit','Skrytykuj trening','Powiedz, że oczekujesz więcej'],['motiv','Zmotywuj przed meczem','„Liczę na Ciebie w najbliższym meczu”']];
const TALK_T=[['Łagodny',0.7],['Normalny',1],['Stanowczy',1.4]];
const TALK_CD=7;
function wkRating(p){const rep=(SAVE.trn&&SAVE.trn.rep)||[];const lim=addDays(today(),-7);const a=repAgg(rep.filter(x=>x.d>lim),p.id);return a.avg==null?null:Math.round(a.avg*10)/10;}
function talkLeft(p){if(!p.talkD)return 0;return Math.max(0,TALK_CD-daysBetween(p.talkD,today()));}
function nextMatchIn(){const e=nextEvent();return e?daysBetween(today(),e.d):99;}
// wynik rozmowy: q od −2 (bardzo źle) do +2 (bardzo dobrze)
function talkScore(p,k,t){const r=wkRating(p);const tk=TALK_T[t][1];let q=0;const why=[];
  if(k==='praise'){if(r==null){q=0.5;why.push('brak ocen z treningów');}else if(r>=7){q=1.6;why.push('pochwała zasłużona');}else if(r>=6.5){q=0.9;}else{q=0.2;why.push('pochwała na wyrost');}
    if(hasT(p,'amb'))q+=0.3;if(hasT(p,'kap'))q+=0.3;if(r!=null&&r<6.5&&hasT(p,'len')){q-=0.4;why.push('leniwy może się rozluźnić');}
    if(t===2)q-=0.3;}
  else if(k==='crit'){if(r==null){q=-0.8;why.push('brak powodu do krytyki');}else if(r<6.5){q=0.7;why.push('krytyka uzasadniona');}else if(r<7){q=-0.4;}else{q=-1.8;why.push('krytyka niesprawiedliwa');}
    if(hasT(p,'pro')||hasT(p,'pra'))q+=0.6;if(hasT(p,'amb'))q+=0.3;if(hasT(p,'zde'))q+=0.3;
    if(hasT(p,'kap')){q-=1;why.push('kapryśny źle znosi krytykę');}if(hasT(p,'ind'))q-=0.6;if(hasT(p,'ner')){q-=0.5;if(t===2)q-=0.6;}
    if(q<0&&t===0)q*=0.5;}
  else{const d=nextMatchIn();if(d>3){q=0.1;why.push('do meczu jeszcze daleko');}else{q=1;why.push('mecz tuż-tuż');}
    if(hasT(p,'lid')||hasT(p,'amb'))q+=0.4;if(hasT(p,'ner')){q-=t===2?1.2:0.2;if(t===2)why.push('nerwowy źle znosi presję');}if(hasT(p,'spo'))q+=0.2;}
  q=clamp(q*(q>0?tk:(t===0?0.8:tk)),-2,2);return {q,r,why};}
function talkPred(q){return q>=1.2?['bardzo dobra','g']:q>=0.5?['dobra','g']:q>-0.3?['niepewna','y']:q>-1?['zła','r']:['bardzo zła','r'];}
const TALK_LINES={
  praise:{g:['Dzięki, trenerze. Ciężko pracowałem i dobrze to słyszeć. Będę dalej dawał z siebie wszystko.','Miło, że pan to zauważył. To mnie napędza!','Dziękuję. Czuję, że idę w dobrą stronę.'],
    n:['Dzięki… choć sam wiem, że stać mnie na więcej.','OK, dziękuję.'],b:['Skoro jest tak dobrze, to chyba mogę trochę odpuścić…','Hm, pochwała? Przecież ten tydzień był przeciętny.']},
  crit:{g:['Ma pan rację, ten tydzień był słaby. Poprawię się.','Rozumiem. Od jutra pokażę, że stać mnie na więcej.','Przyjmuję to. Dzięki za szczerość.'],
    n:['Postaram się… choć nie było aż tak źle.','No dobrze, przyjąłem.'],b:['Naprawdę? Daję z siebie wszystko, a słyszę krytykę?!','To niesprawiedliwe. Niech pan spojrzy na innych.','Nie podoba mi się ten ton, trenerze.']},
  motiv:{g:['Może pan na mnie liczyć. Dam z siebie wszystko!','Jestem gotowy. Wygramy to.','Czuję się świetnie — będzie dobrze.'],
    n:['Postaram się, trenerze.','Zobaczymy, jak to pójdzie.'],b:['Nie musi mi pan tego powtarzać, czuję presję…','Trochę mnie pan zestresował, trenerze.']}};
function talkDo(pid,k,t){const P=PLAYERS[pid];if(!P)return;const p=P.p;if(talkLeft(p))return;const sc=talkScore(p,k,t);const q=sc.q;
  const out=q>=0.5?'g':q>-0.3?'n':'b';const lines=TALK_LINES[k][out];const line=lines[Math.floor(R()*lines.length)];
  const m0=p.mor==null?60:p.mor,f0=fmOf(p);const fx=[];
  addMor(p,q*7);formAdd(p,q*1.5);
  if(k==='crit'&&q>0){p.trB={v:Math.round((0.15+q*0.15)*100)/100,until:addDays(today(),14)};fx.push(`lepsze oceny treningów przez 2 tygodnie (+${fx1(p.trB.v)})`);}
  if(k==='praise'&&sc.r!=null&&sc.r<6.5&&hasT(p,'len')){p.trB={v:-0.2,until:addDays(today(),7)};fx.push('rozluźnił się: słabsze treningi przez tydzień');}
  if(k==='motiv'&&q>0){p.tkB=Math.round(q*0.006*1000)/1000;p.tkBd=nextEvent()?nextEvent().d:today();fx.push('lepsza gra w najbliższym meczu');}
  if(out==='b'&&hasT(p,'kap')){p.unh=(p.unh||0)+1;fx.push('psuje atmosferę w szatni');}
  p.talkD=today();const m1=p.mor,f1=fmOf(p);
  const res={pid,k,t,line,out,m0,m1,f0,f1,fx,why:sc.why};ui.talkRes=res;
  sendMail({cat:'druz',from:`${p.first} ${p.last}`,t:`Rozmowa: ${TALK_K.find(x=>x[0]===k)[1].toLowerCase()} (${p.last})`,s:`„${line}”`,b:{type:'talk',res},ic:'💬'});
  save();render();}
function talkOpen(pid){ui.talk=pid;ui.talkK=ui.talkK||'praise';ui.talkT=ui.talkT==null?1:ui.talkT;ui.talkRes=null;ui.pop=null;render();}
function talkFx(r){const md=Math.round(r.m1-r.m0),fd=Math.round((r.f1-r.f0)*10)/10;
  return `<div class="tkfx"><span class="tkp ${md>0?'g':md<0?'r':'y'}">Morale: ${morLabel(r.m0)} → ${morLabel(r.m1)} (${md>0?'+':''}${md})</span><span class="tkp ${fd>0?'g':fd<0?'r':'y'}">Forma ${fd>0?'+':''}${String(fd).replace('.',',')}</span>${r.fx.map(x=>`<span class="tkp ${/słabsze|psuje/.test(x)?'r':'g'}">${x}</span>`).join('')}</div>`;}
function talkModal(){const P=PLAYERS[ui.talk];if(!P){ui.talk=null;return '';}const p=P.p;ensTraits(p);const r=wkRating(p);const left=talkLeft(p);const res=ui.talkRes;
  const head=`<div class="row" style="gap:12px"><span>${pFace(p,60)}</span><div><h2 style="margin:0">${esc(p.first)} ${esc(p.last)}</h2><div class="small mut">${pTag(p.pos)} ${p.age} l. · charakter: ${p.tr.map(k=>TRAITS[k][0].toLowerCase()).join(', ')}</div></div><span class="sp"></span><button class="ghost" onclick="ui.talk=null;ui.talkRes=null;render()">✕</button></div>
   <div class="tkkv"><div><span>Trening (7 dni)</span><b class="${r==null?'mut':scCls(r)}">${r==null?'–':fx1(r)}</b></div><div><span>Morale</span><b>${morLabel(p.mor==null?60:p.mor)}</b></div><div><span>Forma</span><b>${Math.round(fmOf(p))}</b></div></div>`;
  let body;
  if(res&&res.pid===p.id){body=`<div class="tklab">Odpowiedź zawodnika</div><div class="tkbub ${res.out}">„${esc(res.line)}”</div><div class="tklab">Skutek</div>${talkFx(res)}
     ${res.why.length?`<p class="small mut" style="margin-top:8px">Asystent: ${res.why.join(', ')}.</p>`:''}<div class="row" style="margin-top:12px;gap:8px"><button class="btn" onclick="ui.talk=null;ui.talkRes=null;render()">Zamknij</button></div>`;}
  else if(left){body=`<p class="mut" style="margin-top:14px">Rozmawiałeś z nim niedawno (${fmtShort(p.talkD)}). Kolejna rozmowa możliwa za ${left} ${left===1?'dzień':'dni'}.</p>`;}
  else{body=`<div class="tklab">Co chcesz powiedzieć?</div>${TALK_K.map(([k,n,d])=>{const s=talkScore(p,k,ui.talkT);const [pl,c]=talkPred(s.q);return `<button class="tkopt ${ui.talkK===k?'on':''}" onclick="ui.talkK='${k}';render()"><span><b>${n}</b><small>${d}</small></span><span class="tkp ${c}">reakcja: ${pl}</span></button>`;}).join('')}
    <div class="tklab">Ton</div><div class="tktone">${TALK_T.map(([n],i)=>`<button class="${ui.talkT===i?'on':''}" onclick="ui.talkT=${i};render()">${n}</button>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:12px"><button class="btn" onclick="talkDo('${p.id}',ui.talkK,ui.talkT)">Porozmawiaj</button><span class="small mut">Z jednym zawodnikiem możesz rozmawiać raz na ${TALK_CD} dni.</span></div>`;}
  return `<div class="modal" onclick="if(event.target===this){ui.talk=null;ui.talkRes=null;render()}"><div class="mcard tkcard">${head}${body}</div></div>`;}
function talkMailHtml(b){const r=b.res;const P=PLAYERS[r.pid];const p=P?P.p:null;
  return `<p class="mtext">${p?esc(p.first+' '+p.last):'Zawodnik'} po rozmowie (${TALK_K.find(x=>x[0]===r.k)[1].toLowerCase()}, ton ${TALK_T[r.t][0].toLowerCase()}):</p><div class="tkbub ${r.out}">„${esc(r.line)}”</div>${talkFx(r)}${r.why.length?`<p class="small mut" style="margin-top:8px">Asystent: ${r.why.join(', ')}.</p>`:''}
   ${p?`<div class="mact"><button class="ghost" onclick="openPop('${p.id}')">Profil zawodnika</button></div>`:''}`;}
function talkBtn(pid,sm){const P=PLAYERS[pid];if(!P||P.p.tm!==SAVE.team)return '';const l=talkLeft(P.p);return `<button class="ghost ${sm?'sm':''} tkbtn" title="${l?'Kolejna rozmowa za '+l+' dni':'Porozmawiaj'}" onclick="event.stopPropagation();talkOpen('${pid}')">💬${sm?'':' Porozmawiaj'}</button>`;}

// ================= ROZMOWY: SPRAWY ZGŁASZANE PRZEZ ZAWODNIKÓW, ROLE, OBIETNICE =================
// SAVE.ix = {q:[otwarte sprawy], pr:[obietnice], cred:wiarygodność trenera 0–100, last:data ostatniej nowej sprawy, log:[]}
// p.role – rola w zespole, p.rel – relacja z trenerem 0–100, p.pl8 – czas gry w ostatnich 8 kolejkach (0–1, patrz niżej: CZAS GRY)
function IX(){return SAVE.ix||(SAVE.ix={q:[],pr:[],cred:60,last:null,log:[]});}
const ROLES=[['klu','Kluczowy zawodnik',0.85,'Gra prawie zawsze, od niego zależą wyniki.'],['pod','Podstawowy zawodnik',0.65,'Gra w większości meczów.'],
  ['per','Perspektywiczny',0.1,'Młody — uczy się, gra okazjonalnie.'],['rez','Rezerwowy',0,'Wchodzi, gdy jest potrzebny — nie liczy na regularną grę.']];
function roleExpTxt(k){const r=ROLES[ROLE_I[k]];return !r?'':r[2]>0?`oczekuje gry w ok. ${Math.round(r[2]*100)}% meczów`:'bez wymagań co do czasu gry';}
const ROLE_I=Object.fromEntries(ROLES.map((r,i)=>[r[0],i]));
function roleDef(p){const t=myTeam();const lu=new Set(Object.values(myLineup()));const L=t.players.filter(x=>!x.jr).slice().sort((a,b)=>rating(b)-rating(a));const k=L.indexOf(p);
  if(lu.has(p.id))return k<3?'klu':'pod';if(p.age<=21)return 'per';return 'rez';}
function roleOf(p){if(p.role&&ROLE_I[p.role]==null)delete p.role;return p.role||roleDef(p);}
function roleExp(p){return ROLES[ROLE_I[roleOf(p)]][2];}
function relOf(p){return p.rel==null?50:p.rel;}
function relAdd(p,d){p.rel=Math.round(clamp(relOf(p)+d,0,100));}
function plShare(p){const a=p.pl8||[];return a.length?a.reduce((x,y)=>x+y,0)/a.length:null;}
// po każdej kolejce ligi/play-off (wywołanie z roundTick)
function ixRound(){if(SAVE.team==null)return;for(const q of IX().q)q.r=(q.r||0)+1;for(const p of myTeam().players){if(p.jr||p.inj)continue;const pl=ROUND_PLAYED.has(p.id)?1:0;(p.pl8=p.pl8||[]).push(pl);if(p.pl8.length>8)p.pl8.shift();
    for(const pr of IX().pr)if(pr.st==='open'&&pr.pid===p.id&&pr.k==='czas'){pr.n++;pr.p+=pl;}}}
// szansa, że zawodnik dobrze przyjmie odpowiedź
function ixChance(p,base,mods){const c=coach();const aut=c&&c.attrs?(c.attrs.aut||10):10;let x=base+(aut-10)/10*0.12+(relOf(p)-50)/100*0.3;
  for(const [tr,v] of Object.entries(mods||{}))if(hasT(p,tr))x+=v;return clamp(x,0.05,0.95);}
function ixPred(ch){const a=typeof staffSkill==='function'?staffSkill('asy'):8;const L=ch>=0.75?['przyjmie dobrze','good']:ch>=0.5?['raczej przyjmie','good']:ch>=0.3?['może się nie spodobać','warn']:['źle przyjmie','bad'];
  if(a<8&&ch>=0.3&&ch<0.75)return ['trudno powiedzieć','mut'];return L;}
// ---- rodzaje spraw ----
// każda opcja: [klucz, tekst odpowiedzi, (p,q)=>szansa, (p,q,ok)=>skutek]
const IX_T={
 czas:{t:p=>`${p.first} ${p.last} chce więcej grać`,
   x:(p,q)=>`„Trenerze, w ostatnich meczach gram za mało (mój czas gry to ${Math.round(q.sh*100)}%). Jako ${ROLES[ROLE_I[roleOf(p)]][1].toLowerCase()} oczekuję więcej. Co dalej?”`,
   o:[['prom','Obiecuję ci więcej gry w ciągu 4 tygodni.',p=>ixChance(p,0.72+(IX().cred-60)/200,{amb:0.05}),
       (p,q,ok)=>{if(ok){addMor(p,6);relAdd(p,4);ixPromise(p,'czas',28,{need:Math.max(0.5,roleExp(p)-0.15)});return 'Uspokoił się. Obietnica zapisana — trzeba jej dotrzymać.';}addMor(p,-3);return 'Nie bardzo wierzy w obietnice — ostatnio trener ich nie dotrzymywał.';}],
     ['zasluz','Musisz zasłużyć na to na treningach.',p=>ixChance(p,0.5,{pro:0.25,oby:0.2,amb:-0.2,kap:-0.25,ind:-0.2}),
       (p,q,ok)=>{if(ok){addMor(p,1);relAdd(p,2);p.trBoost=today();return 'Przyjął to i obiecał mocniej pracować.';}addMor(p,-8);relAdd(p,-8);return 'Uznał to za wymówkę. Jest rozżalony.';}],
     ['rola','Twoja rola w tym sezonie to zmiennik.',p=>ixChance(p,0.45,{loj:0.25,oby:0.15,pro:0.1,amb:-0.25,suk:-0.15}),
       (p,q,ok)=>{const i=Math.min(ROLE_I[roleOf(p)]+1,ROLES.length-1);p.role=ROLES[Math.max(i,2)][0];if(ok){addMor(p,-2);return 'Przyjął nową rolę ze spokojem. Oczekuje teraz mniej gry.';}addMor(p,-10);relAdd(p,-10);return 'Poczuł się zdegradowany. Rola zmieniona, ale relacja ucierpiała.';}],
     ['lista','Jeśli chcesz, możesz poszukać nowego klubu.',p=>ixChance(p,0.55,{amb:0.2,suk:0.15,ind:0.1,loj:-0.4,oby:-0.1}),
       (p,q,ok)=>{if(typeof tlSet==='function')tlSet(p.id,pValue(p));p.unh=0;if(ok){addMor(p,2);relAdd(p,-2);return 'Docenił szczerość. Trafił na listę transferową.';}addMor(p,-6);relAdd(p,-12);return 'Odebrał to tak, jakby klub chciał się go pozbyć. Jest na liście transferowej i czuje się odrzucony.';}]]},
 kontrakt:{t:p=>`${p.first} ${p.last} pyta o nowy kontrakt`,
   x:p=>`„Mój kontrakt kończy się po tym sezonie. Chciałbym wiedzieć, czy klub na mnie liczy.”`,
   o:[['prom','Dostaniesz nową ofertę w ciągu 30 dni.',p=>ixChance(p,0.8+(IX().cred-60)/200,{}),
       (p,q,ok)=>{if(ok){addMor(p,5);relAdd(p,5);ixPromise(p,'kontrakt',30,{ce:p.ce});return 'Bardzo się ucieszył. Pamiętaj o ofercie (karta zawodnika → kontrakt).';}addMor(p,-2);return 'Odpowiedział, że uwierzy, gdy zobaczy ofertę.';}],
     ['pozniej','Wrócimy do tematu po sezonie.',p=>ixChance(p,0.5,{loj:0.3,pro:0.1,amb:-0.15,suk:-0.1}),
       (p,q,ok)=>{if(ok){relAdd(p,1);return 'Zgodził się poczekać.';}addMor(p,-6);relAdd(p,-5);return 'Jest niepewny swojej przyszłości i rozczarowany.';}],
     ['nie','Nie planuję przedłużenia twojej umowy.',p=>ixChance(p,0.35,{pro:0.25,oby:0.2}),
       (p,q,ok)=>{p.noExt=S().n;if(ok){addMor(p,-4);return 'Przyjął to profesjonalnie.';}addMor(p,-12);relAdd(p,-10);return 'Bardzo go to dotknęło. Może to być widać na boisku.';}]]},
 oferta:{t:p=>`${p.first} ${p.last}: interesuje się mną inny klub`,
   x:(p,q)=>`„Odezwał się do mnie ${TEAMS[q.club]?TEAMS[q.club].name:'mocny klub'}. To dla mnie szansa na krok w karierze. Chcę, żeby trener wiedział.”`,
   o:[['zostan','Jesteś dla mnie kluczowy — zostajesz.',p=>ixChance(p,0.45,{loj:0.3,oby:0.1,amb:-0.2,suk:-0.2}),
       (p,q,ok)=>{p.role='klu';if(ok){addMor(p,3);relAdd(p,4);return 'Zostaje i czuje się doceniony.';}addMor(p,-12);relAdd(p,-8);p.wantOut=S().n;return 'Jest rozczarowany. Będzie myślał o odejściu.';}],
     ['podwyzka','Zostań — w ciągu miesiąca dostaniesz lepszy kontrakt.',p=>ixChance(p,0.78+(IX().cred-60)/200,{chc:0.1}),
       (p,q,ok)=>{if(ok){addMor(p,4);relAdd(p,3);ixPromise(p,'podwyzka',30,{w:p.wage});return 'Zgodził się zostać. Obiecana podwyżka min. 10% — karta zawodnika → kontrakt.';}addMor(p,-6);return 'Nie wierzy w obietnicę.';}],
     ['puszcze','Puszczę cię, jeśli przyjdzie dobra oferta.',p=>0.92,
       (p,q,ok)=>{if(typeof tlSet==='function')tlSet(p.id,Math.round(pValue(p)*1.1));addMor(p,6);relAdd(p,3);ixPromise(p,'lista',60,{});return 'Docenił to. Jest na liście transferowej — nie zdejmuj go, bo to złamana obietnica.';}]]},
 szatnia:{t:(p,q)=>`${p.first} ${p.last} zgłasza problem w szatni`,
   x:(p,q)=>{const o=PLAYERS[q.oth];return `„${o?o.p.first+' '+o.p.last:'Jeden z chłopaków'} psuje atmosferę — narzeka, że nie gra, i ciągnie innych w dół. Trzeba coś z tym zrobić.”`;},
   o:[['rozmowa','Porozmawiam z nim osobiście.',p=>0.7,
       (p,q,ok)=>{const o=PLAYERS[q.oth]&&PLAYERS[q.oth].p;relAdd(p,3);if(o){const g=ixChance(o,0.55,{kap:-0.2,pro:0.2});if(R()<g){addMor(o,5);relAdd(o,4);o.unh=Math.max(0,(o.unh||0)-2);return `Rozmowa z ${o.last} pomogła — uspokoił się.`;}addMor(o,-3);return `${o.last} wysłuchał, ale nadal jest niezadowolony.`;}return 'Sprawa wyjaśniona.';}],
     ['kara','Ukarzę go karą finansową.',p=>0.75,
       (p,q,ok)=>{const o=PLAYERS[q.oth]&&PLAYERS[q.oth].p;relAdd(p,4);if(o){addMor(o,-10);relAdd(o,-15);o.unh=0;for(const x of myTeam().players)if(x!==o&&(hasT(x,'pro')||hasT(x,'oby')))addMor(x,2);}return 'Szatnia dostała jasny sygnał. Ukarany jest wściekły na trenera.';}],
     ['ignoruj','To nie jest teraz najważniejsze.',p=>ixChance(p,0.25,{pro:0.15}),
       (p,q,ok)=>{relAdd(p,ok?-2:-7);if(!ok)addMor(p,-4);return ok?'Przyjął, choć bez entuzjazmu.':'Uważa, że trener nie panuje nad szatnią.';}]]},
};
// ---- generowanie spraw (codziennie) ----
function ixDaily(d){if(SAVE.team==null||!SAVE.world||!S())return;const X=IX();const ph=S().phase;
  // terminy: sprawy bez odpowiedzi i obietnice
  for(const q of X.q.slice())if((q.r||0)>=1)ixAnswer(q.id,'_ignore',1);
  ixCheckPromises(d);
  if(ph!=='liga'&&ph!=='po')return;if(X.q.length>=3)return;if(X.last&&daysBetween(X.last,d)<6)return;if(R()>0.3)return;
  const t=myTeam();const cand=[];const avg=t.players.reduce((a,p)=>a+rating(p),0)/Math.max(1,t.players.length);
  for(const p of t.players){if(p.jr||p.inj||p.loan)continue;if(p.ixD&&daysBetween(p.ixD,d)<42)continue;const n=S().n;if(X.q.some(q=>q.pid===p.id))continue;
    const sh=plShare(p);if(sh!=null&&(p.pl8||[]).length>=5&&sh<roleExp(p)-0.25&&(hasT(p,'amb')||hasT(p,'kap')||hasT(p,'suk')||pSat(p,t).v<50||ROLE_I[roleOf(p)]<=1)&&!X.pr.some(r=>r.st==='open'&&r.pid===p.id&&r.k==='czas'))cand.push([3,{k:'czas',pid:p.id,sh}]);
    if(p.ce!=null&&p.ce<=S().n&&p.noExt!==S().n&&p.ixK!==n&&!p.tl&&rating(p)>=avg-1&&!X.pr.some(r=>r.st==='open'&&r.pid===p.id))cand.push([hasT(p,'loj')?1:2,{k:'kontrakt',pid:p.id}]);
    if(rating(p)>=avg+4&&!p.tl&&p.ixO!==n&&(hasT(p,'amb')||hasT(p,'suk')||R()<0.25)){const club=ixSuitor(p);if(club!=null)cand.push([1,{k:'oferta',pid:p.id,club}]);}
    if((hasT(p,'lid')||hasT(p,'sta'))&&hRank(p,t)<=3){const o=t.players.find(x=>x!==p&&(x.unh||0)>=3&&(hasT(x,'kap')||hasT(x,'ind')||pSat(x,t).v<35));if(o)cand.push([2,{k:'szatnia',pid:p.id,oth:o.id}]);}}
  if(!cand.length)return;const tot=cand.reduce((a,c)=>a+c[0],0);let r=R()*tot,pick=cand[0][1];for(const c of cand){r-=c[0];if(r<=0){pick=c[1];break;}}
  ixOpen(pick,d);}
function ixSuitor(p){const my=teamStrength(myTeam());const L=TEAMS.filter(t=>t&&t.idx!==SAVE.team&&t.players&&t.players.length&&!t.yt&&teamStrength(t)>my+1);if(!L.length)return null;return L[Math.floor(R()*Math.min(L.length,12))].idx;}
function ixOpen(q,d){const X=IX();const P=PLAYERS[q.pid];if(!P)return;if(q.k==='kontrakt')P.p.ixK=S().n;if(q.k==='oferta')P.p.ixO=S().n;q.id='ix'+Date.now().toString(36)+Math.floor(R()*1e4);q.d=d;X.q.push(q);X.last=d;P.p.ixD=d;
  const p=P.p;sendMail({cat:'klub',from:`${p.first} ${p.last}`,t:IX_T[q.k].t(p,q),s:'Zawodnik prosi o rozmowę. Odpowiedz w zakładce Rozmowy przed następnym meczem.',b:{type:'ix',id:q.id},act:1,lab:'Rozmowy'});}
function ixAnswer(id,opt,auto){const X=IX();const q=X.q.find(x=>x.id===id);if(!q)return;X.q=X.q.filter(x=>x!==q);const P=PLAYERS[q.pid];if(!P)return;const p=P.p;const T=IX_T[q.k];
  let txt;if(opt==='_ignore'){addMor(p,-6);relAdd(p,-8);txt='Trener nie znalazł czasu na rozmowę. Zawodnik czuje się zlekceważony.';}
  else{const o=T.o.find(x=>x[0]===opt);if(!o)return;const ok=R()<o[2](p,q);txt=o[3](p,q,ok);}
  X.log.unshift({d:today(),pid:q.pid,k:q.k,opt,txt});X.log=X.log.slice(0,40);if(auto){news(`😠 ${p.first} ${p.last}: ${txt}`);return;}ui.ixRes={id,txt,pid:q.pid};save();render();}
// ---- obietnice ----
function ixPromise(p,k,days,extra){IX().pr.push(Object.assign({id:'pr'+Date.now().toString(36),pid:p.id,k,d:today(),until:addDays(today(),days),st:'open',n:0,p:0},extra||{}));}
const PR_L={czas:'więcej gry',kontrakt:'nowa oferta kontraktu',podwyzka:'podwyżka min. 10%',lista:'zgoda na odejście (lista transferowa)'};
function prState(pr){const P=PLAYERS[pr.pid];const p=P&&P.p;if(!p||p.tm!==SAVE.team)return 'gone';
  if(pr.k==='kontrakt')return p.ce>pr.ce?'kept':null;if(pr.k==='podwyzka')return p.wage>=pr.w*1.1?'kept':null;
  if(pr.k==='lista')return !p.tl?'broken':null;if(pr.k==='czas')return null;return null;}
function ixCheckPromises(d){const X=IX();for(const pr of X.pr){if(pr.st!=='open')continue;const s=prState(pr);const P=PLAYERS[pr.pid];const p=P&&P.p;
    if(s==='gone'){pr.st='gone';continue;}
    if(s==='kept'){ixKeep(pr,p);continue;}if(s==='broken'){ixBreak(pr,p);continue;}
    if(d>=pr.until){if(pr.k==='lista'){ixKeep(pr,p);continue;}if(pr.k==='czas'){if(pr.n>=2&&pr.p/pr.n>=pr.need)ixKeep(pr,p);else if(pr.n<2)pr.until=addDays(d,14);else ixBreak(pr,p);continue;}ixBreak(pr,p);}}
  X.pr=X.pr.filter(r=>r.st==='open'||daysBetween(r.until,d)<60);}
function ixKeep(pr,p){pr.st='kept';const X=IX();X.cred=Math.min(100,X.cred+4);addMor(p,6);relAdd(p,8);news(`🤝 Dotrzymałeś obietnicy (${PR_L[pr.k]}) wobec ${p.first} ${p.last}. Zaufanie rośnie.`);}
function ixBreak(pr,p){pr.st='broken';const X=IX();X.cred=Math.max(0,X.cred-12);addMor(p,-15);relAdd(p,-20);p.unh=(p.unh||0)+2;const t=myTeam();const big=hRank(p,t)<=4;
  if(big)for(const x of t.players)if(x!==p)addMor(x,-3);
  sendMail({cat:'klub',from:`${p.first} ${p.last}`,t:'Złamana obietnica',s:`Nie dotrzymałeś obietnicy: ${PR_L[pr.k]}.`,b:{type:'text',x:`${p.first} ${p.last} jest bardzo rozczarowany — obiecałeś mu: ${PR_L[pr.k]}, a obietnica nie została dotrzymana.${big?' To jeden z liderów szatni, więc spadło morale całej drużyny.':''} Twoja wiarygodność w szatni spadła — kolejne obietnice będą przyjmowane z większą rezerwą.`},act:0});}
// ---- rozmowa o roli (z karty zawodnika) ----
function roleAsk(pid,k){const P=PLAYERS[pid];if(!P)return;const p=P.p;const cur=ROLE_I[roleOf(p)],nw=ROLE_I[k];if(cur===nw)return;
  const def=ROLE_I[roleDef(p)];let txt;
  if(nw<cur){addMor(p,4);relAdd(p,4);txt=`${p.last} cieszy się z większej roli. Będzie oczekiwał więcej gry.`;}
  else{const ok=R()<ixChance(p,nw<=def?0.75:0.45,{loj:0.2,oby:0.15,pro:0.1,amb:-0.25,suk:-0.15,kap:-0.15});if(ok){addMor(p,-2);txt=`${p.last} przyjął nową rolę ze zrozumieniem.`;}else{addMor(p,-9);relAdd(p,-8);txt=`${p.last} jest niezadowolony ze zmiany roli.`;}}
  p.role=k;ui.roleRes={pid,txt};save();render();}
function roleModal(){const P=PLAYERS[ui.roleP];if(!P){ui.roleP=null;return '';}const p=P.p;const cur=roleOf(p);const sh=plShare(p);
  return `<div class="modal" onclick="if(event.target===this){ui.roleP=null;ui.roleRes=null;render()}"><div class="mcard" style="max-width:560px">
   <div class="row" style="gap:12px;align-items:center">${pFace(p,56)}<div><h2 style="margin:0">Rozmowa o roli</h2><div class="small mut">${esc(p.first+' '+p.last)} · relacja z trenerem ${relOf(p)}/100${sh!=null?` · czas gry ${Math.round(sh*100)}% (ostatnie kolejki)`:''}</div></div></div>
   ${ui.roleRes&&ui.roleRes.pid===p.id?`<div class="card" style="margin:10px 0">${esc(ui.roleRes.txt)}</div>`:''}
   <div style="margin-top:10px">${ROLES.map(([k,l,e,ds])=>`<button class="opt ${cur===k?'on':''}" style="display:block;width:100%;text-align:left;margin:6px 0" ${cur===k?'disabled':''} onclick="roleAsk('${p.id}','${k}')"><b>${l}</b> <span class="small mut">· ${e>0?`oczekuje gry w ok. ${Math.round(e*100)}% meczów`:'bez wymagań co do czasu gry'}</span><div class="small mut">${ds}</div></button>`).join('')}</div>
   <p class="small mut">Proponowana rola wg asystenta: <b>${ROLES[ROLE_I[roleDef(p)]][1]}</b>. Obniżenie roli może go zdenerwować, ale zmniejsza oczekiwania co do gry.</p>
   <div class="row"><span class="sp"></span><button class="ghost" onclick="ui.roleP=null;ui.roleRes=null;render()">Zamknij</button></div></div></div>`;}
// ---- widok „Rozmowy” ----
function ixN(){return SAVE.ix?SAVE.ix.q.length:0;}
function ixView(){const X=IX();const res=ui.ixRes;
  const card=q=>{const P=PLAYERS[q.pid];if(!P)return '';const p=P.p;const T=IX_T[q.k];
    return `<div class="card"><div class="row" style="gap:12px;align-items:flex-start">${pFace(p,64)}<div style="flex:1"><h2 style="margin:0 0 4px">${esc(T.t(p,q))}</h2>
      <div class="small mut">${POS_NAMES[p.pos]} · relacja ${relOf(p)}/100 · morale ${p.mor==null?60:p.mor} · rola: ${ROLES[ROLE_I[roleOf(p)]][1].toLowerCase()} · ${(p.tr||[]).map(k=>TRAITS[k]?TRAITS[k][0]:'').join(', ')}</div>
      <p style="margin:10px 0">${esc(T.x(p,q))}</p>
      ${T.o.map(o=>{const ch=o[2](p,q);const [pl,c]=ixPred(ch);return `<button class="opt" style="display:block;width:100%;text-align:left;margin:6px 0" onclick="ixAnswer('${q.id}','${o[0]}')"><b>${esc(o[1])}</b> <span class="mxpill ${c}" style="margin-left:6px">${pl}</span></button>`;}).join('')}
      <div class="small mut">Odpowiedz przed następnym meczem. Bez odpowiedzi zawodnik poczuje się zlekceważony.</div></div></div></div>`;};
  const prs=X.pr.filter(r=>r.st==='open');const done=X.pr.filter(r=>r.st==='kept'||r.st==='broken').slice(-6).reverse();
  return `${res?`<div class="card" style="border:1px solid var(--acc)"><b>Wynik rozmowy:</b> ${esc(res.txt)} <button class="ghost sm" onclick="ui.ixRes=null;render()">OK</button></div>`:''}
   ${X.q.length?X.q.map(card).join(''):'<div class="card"><h2>Rozmowy</h2><p class="mut">Nikt teraz nie czeka na rozmowę. Zawodnicy sami zgłoszą się, gdy będą mieli sprawę — dostaniesz wiadomość w poczcie.</p></div>'}
   <div class="card"><h2>Obietnice${tipQ('Obietnice są sprawdzane automatycznie. Dotrzymane podnoszą zaufanie zawodnika i Twoją wiarygodność, złamane mocno je obniżają.')}</h2>
    <div class="small" style="margin-bottom:8px">Wiarygodność trenera w szatni: <b>${X.cred}/100</b></div>
    ${prs.length?`<div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th class="l">Obietnica</th><th class="l">Termin</th><th class="l">Stan</th></tr></thead><tbody>${prs.map(r=>{const P=PLAYERS[r.pid];const p=P&&P.p;return `<tr><td class="l">${p?esc(p.first+' '+p.last):'?'}</td><td class="l">${PR_L[r.k]}</td><td class="l">${fmtShort(r.until)}</td><td class="l small">${r.k==='czas'?`grał ${r.p}/${r.n} kolejek (cel ${Math.round(r.need*100)}%)`:r.k==='lista'?'na liście transferowej':r.k==='podwyzka'?`obecnie ${fmtShort2(p?p.wage:0)}, cel ${fmtShort2(Math.round(r.w*1.1))}`:'czeka na ofertę'}</td></tr>`;}).join('')}</tbody></table></div>`:'<p class="mut small">Brak otwartych obietnic.</p>'}
    ${done.length?`<h3 style="margin-top:10px">Ostatnio rozliczone</h3>${done.map(r=>{const P=PLAYERS[r.pid];return `<div class="small">${r.st==='kept'?'✅':'❌'} ${P?esc(P.p.last):'?'} — ${PR_L[r.k]}</div>`;}).join('')}`:''}</div>
   <div class="card"><h2>Role w zespole</h2><p class="small mut">Rola mówi zawodnikowi, ile gry może oczekiwać. Zmienisz ją w karcie zawodnika („Rozmowa o roli”).</p>
    <div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Poz.</th><th class="l">Rola</th><th>Czas gry (ost. 8)</th><th>Relacja</th><th>Zadowolenie</th></tr></thead><tbody>${myTeam().players.filter(p=>!p.jr).sort((a,b)=>ROLE_I[roleOf(a)]-ROLE_I[roleOf(b)]).map(p=>{const sh=plShare(p);const e=roleExp(p);const sat=pSat(p).v;
      return `<tr><td class="l"><button class="link pn" onclick="ui.roleP='${p.id}';render()">${esc(p.first[0]+'. '+p.last)}</button></td><td>${p.pos}</td><td class="l">${ROLES[ROLE_I[roleOf(p)]][1]}</td><td style="color:${sh==null?'':sh<e-0.25?'var(--bad,#ef4444)':sh>=e-0.1?'var(--good,#22c55e)':''}">${sh==null?'—':Math.round(sh*100)+'%'}</td><td>${relOf(p)}</td><td>${sat}</td></tr>`;}).join('')}</tbody></table></div></div>`;}

// ================= CZAS GRY: liczony z czasu na boisku, nie z samego pojawienia się =================
// Kolejka = wartość 0–1 w p.pl8 (średnia z ostatnich 8 kolejek):
//  • wyszedł w podstawowym składzie: 0,75 + 0,25 × udział akcji na boisku (zmiana w trakcie meczu, np. po słabym secie, kosztuje najwyżej 0,25),
//    libero z podstawowego składu: 1;
//  • wszedł z ławki: udział akcji × 1,2 (min. 0,1, maks. 0,7) — wejście na jedną zagrywkę to ok. 0,1;
//  • nie grał: 0. Kolejki w kontuzji i zaplanowanym odpoczynku się nie liczą.
let ROUND_TIME=new Map();
{const _sr=stepRally;stepRally=function(m){try{if(SAVE.team!=null)m.sides.forEach((sd,i)=>{if(sd.team.idx!==SAVE.team)return;
    if(!m._st0){m._st0=new Set(sd.slots.map(x=>x.p.id));if(sd.libero)m._st0.add(sd.libero.id);m._lib0=sd.libero?sd.libero.id:null;}
    m._rl=(m._rl||0)+1;for(const e of onCourt(sd,m.serving===i)){e.p.st.on=(e.p.st.on||0)+1;}});}catch(e){}return _sr.apply(this,arguments);};}
{const _ic=injuryCheck;injuryCheck=function(m,mult){try{if(m._rl){const sd=m.sides.find(x=>x.team.idx===SAVE.team);if(sd)for(const cp of sd.pl){const sh=Math.min(1,(cp.st.on||0)/m._rl);let v=0;
    if(m._st0&&m._st0.has(cp.id))v=cp.id===m._lib0?1:0.75+0.25*Math.min(1,sh/0.9);else if(sh>0)v=clamp(sh*1.2,0.1,0.7);
    if(v>0)ROUND_TIME.set(cp.id,Math.max(ROUND_TIME.get(cp.id)||0,Math.round(v*100)/100));}}}catch(e){console.error(e);}return _ic.apply(this,arguments);};}
ixRound=function(){if(SAVE.team==null)return;for(const q of IX().q)q.r=(q.r||0)+1;const d=today();
  for(const p of myTeam().players){if(p.jr||p.inj||(p.restUntil&&p.restUntil>=d))continue;const v=ROUND_TIME.has(p.id)?ROUND_TIME.get(p.id):ROUND_PLAYED.has(p.id)?1:0;(p.pl8=p.pl8||[]).push(v);if(p.pl8.length>8)p.pl8.shift();
    for(const pr of IX().pr)if(pr.st==='open'&&pr.pid===p.id&&pr.k==='czas'){pr.n++;pr.p+=v;}}
  ROUND_TIME=new Map();};

// ================= MEDIA: KONFERENCJE PRZED I PO MECZU, PLOTKI, RELACJE Z MEDIAMI =================
// SAVE.md = {rel:0–100 relacje z mediami, pre:{key,qs}, post:{key,qs,res}, boast:numer sezonu (zapowiedź mistrzostwa), log:[]}
function MD(){return SAVE.md||(SAVE.md={rel:50,pre:null,post:null,boast:null,log:[]});}
function mdRel(d){const M=MD();M.rel=Math.round(clamp(M.rel+d,0,100));}
function mdFol(f){const s=typeof SOC==='function'?SOC():null;if(s)s.fol=Math.max(100,Math.round(s.fol*(1+f)));}
function mdKey(c){return c?`${c.kind}|${c.h}|${c.a}|${c.sid||''}`:'';}
function mdOpp(c){return c.h===SAVE.team?c.a:c.h;}
function mdMatchDate(){const e=nextEvent();return e?e.d:today();}
const tmN2=i=>TEAMS[i]?TEAMS[i].name:'rywal';
// wynik serii ostatnich meczów ligowych
function mdForm(){const s=S();const L=[];for(const rd of (s.results||[]).slice().reverse()){const g=rd.find(x=>x.h===SAVE.team||x.a===SAVE.team);if(!g)continue;const me=g.h===SAVE.team;L.push((me?g.sw[0]:g.sw[1])>(me?g.sw[1]:g.sw[0])?1:0);if(L.length>=4)break;}return L;}
// ---- pytania ----
// każde pytanie: {k, t:tekst, o:[[klucz, odpowiedź, skutek(q)->opis]]}
function mdQRival(op){const fav=teamStrength(myTeam())>=teamStrength(TEAMS[op])+2;return {k:'rywal',t:`Jak ocenia pan drużynę ${tmN2(op)} przed meczem?`,o:[
  ['szac','Szanujemy rywala, czeka nas trudny mecz.',q=>{mdRel(1);return 'Spokojny przekaz. Bez wpływu na rywala.';}],
  ['fav',fav?'Jesteśmy faworytem i zamierzamy to pokazać.':'Stać nas na zwycięstwo z każdym.',q=>{for(const p of myTeam().players)addMor(p,2);for(const p of TEAMS[op].players)addMor(p,2);mdRel(1);return 'Twoi zawodnicy +2 morale, ale rywal też się zmobilizował.';}],
  ['ostro','Nie boimy się nikogo — rozjedziemy ich.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'ner')?-1:3);for(const p of TEAMS[op].players)addMor(p,5);mdRel(3);mdFol(0.01);return 'Nagłówki gwarantowane (+relacje z mediami). Drużyna nakręcona, ale rywal mocno zmotywowany.';}],
  ['nic','Skupiamy się na sobie.',q=>{mdRel(-1);return 'Dziennikarze rozczarowani wymijającą odpowiedzią.';}]]};}
function mdQForm(L){const lost=L.filter(x=>!x).length;return {k:'forma',t:`Przegraliście ${lost} z ostatnich ${L.length} meczów. Czy pana posada jest zagrożona?`,o:[
  ['wiara','Wierzę w tę drużynę. Wyniki przyjdą.',q=>{for(const p of myTeam().players)addMor(p,2);mdRel(1);return 'Zawodnicy docenili wsparcie (+2 morale).';}],
  ['budz','Zawodnicy muszą się obudzić.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'pro')||hasT(p,'sta')?1:-3);bAdd(1);mdRel(2);return 'Zarząd docenił stanowczość, ale część szatni poczuła się wskazana palcem.';}],
  ['posada','To pytanie do zarządu.',q=>{bAdd(-2);mdRel(1);return 'Zarząd nie był zadowolony z tej odpowiedzi.';}],
  ['nic','Nie komentuję.',q=>{mdRel(-2);return 'Media to zapamiętają.';}]]};}
function mdQPlayer(p,good){return {k:'gracz',pid:p.id,t:good?`${p.first} ${p.last} jest w świetnej formie. Co pan o nim powie?`:`${p.first} ${p.last} zawodzi w ostatnich meczach. Co się dzieje?`,o:good?[
  ['chwal','To nasz kluczowy zawodnik, gra fantastycznie.',q=>{addMor(p,4);relAdd(p,3);p.tkB=0.006;p.tkBd=mdMatchDate();return `${p.last} +4 morale i lepsza gra w najbliższym meczu.`;}],
  ['zesp','Siatkówka to gra zespołowa.',q=>{for(const x of myTeam().players)addMor(x,1);if(hasT(p,'amb'))addMor(p,-2);return 'Drużyna +1 morale. Ambitny zawodnik liczył na więcej.';}],
  ['wiecej','Stać go na jeszcze więcej.',q=>{if(hasT(p,'pro')||hasT(p,'suk')){addMor(p,2);return `${p.last} odebrał to jako motywację.`;}addMor(p,-2);return `${p.last} oczekiwał pochwały.`;}]]:[
  ['wspar','Ma moje pełne zaufanie.',q=>{addMor(p,5);relAdd(p,4);return `${p.last} +5 morale — docenił wsparcie.`;}],
  ['kryt','Oczekuję od niego dużo więcej.',q=>{if(hasT(p,'pro')||hasT(p,'sta')){addMor(p,1);return `${p.last} przyjął krytykę po męsku.`;}addMor(p,-6);relAdd(p,-8);return `${p.last} poczuł się publicznie upokorzony (−6 morale, gorsza relacja).`;}],
  ['nic','Nie oceniam zawodników publicznie.',q=>{mdRel(-1);return 'Dziennikarze nie dostali historii.';}]]};}
function mdQRumor(p){return {k:'plotka',pid:p.id,t:`Mówi się, że ${p.first} ${p.last} może odejść. Czy jest na sprzedaż?`,o:[
  ['nie','Nie jest na sprzedaż.',q=>{if(p.tl){mdRel(-4);addMor(p,-2);return 'Wpadka: zawodnik jest na liście transferowej. Media to wytknęły (−relacje).';}addMor(p,3);relAdd(p,3);return `${p.last} docenił deklarację (+3 morale).`;}],
  ['cena','Każdy ma swoją cenę.',q=>{if(hasT(p,'amb')||hasT(p,'suk')){addMor(p,1);return `${p.last} nie ma nic przeciwko.`;}addMor(p,-4);relAdd(p,-5);mdRel(2);return `${p.last} poczuł się na sprzedaż (−4 morale).`;}],
  ['nic','Nie komentuję plotek.',q=>{mdRel(-1);return 'Plotka żyje dalej.';}]]};}
function mdQGoal(){return {k:'cel',t:'Jaki cel stawia pan drużynie w tym sezonie?',o:[
  ['mistrz','Gramy o mistrzostwo.',q=>{bAdd(3);MD().boast=S().n;for(const p of myTeam().players)if(hasT(p,'suk')||hasT(p,'amb'))addMor(p,3);mdRel(3);mdFol(0.02);return 'Zarząd i ambitni zawodnicy zachwyceni. Jeśli nie wyjdzie, media to przypomną.';}],
  ['plan',`Realny cel: ${goalTxt(S().goal||goalFor(SAVE.team),lgOf(SAVE.team))}.`,q=>{mdRel(1);return 'Rozsądna deklaracja.';}],
  ['krok','Krok po kroku, mecz po meczu.',q=>{mdRel(-1);return 'Asekuracyjna odpowiedź.';}]]};}
function mdQWin(m,me){const st=m.sides[me].pl.slice().sort((a,b)=>(b.st.kill+b.st.blk+b.st.ace)-(a.st.kill+a.st.blk+a.st.ace))[0];const P=st&&PLAYERS[st.id]&&PLAYERS[st.id].p;
  return {k:'wygr',t:'Co zadecydowało o zwycięstwie?',o:[
  ['druz','Cała drużyna zagrała świetnie.',q=>{for(const p of myTeam().players)addMor(p,2);return 'Drużyna +2 morale.';}],
  ...(P?[['mvp',`Fantastyczny mecz ${P.last}.`,q=>{addMor(P,5);relAdd(P,3);for(const p of myTeam().players)if(p!==P&&hasT(p,'amb'))addMor(p,-1);return `${P.last} +5 morale.`;}]]:[]),
  ['popr','Wygraliśmy, ale jest dużo do poprawy.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'pro')?1:-1);bAdd(1);return 'Profesjonaliści docenili, reszta liczyła na pochwałę.';}]]};}
function mdQLoss(m,me){return {k:'przegr',t:'Co poszło nie tak?',o:[
  ['ja','Biorę to na siebie.',q=>{for(const p of myTeam().players){addMor(p,1);relAdd(p,1);}mdRel(1);return 'Zawodnicy docenili, że ich chronisz.';}],
  ['zaw','Zawodnicy nie zrealizowali planu.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'pro')?0:-3);bAdd(1);return 'Zarząd docenił szczerość, ale szatnia jest urażona (−3 morale).';}],
  ['sedz','Sędziowie mieli duży wpływ na wynik.',q=>{mdRel(-2);if(R()<0.35){money(-10000,'Kara za wypowiedź');finLog('Kara dyscyplinarna za krytykę sędziów',-10000);return 'Liga ukarała klub grzywną 10 tys. zł za krytykę sędziów.';}for(const p of myTeam().players)addMor(p,1);return 'Kibice po Twojej stronie, media sceptyczne.';}],
  ['nic','Nie ma o czym mówić, analizujemy.',q=>{mdRel(-1);return 'Krótko i bez emocji.';}]]};}
// ---- konferencja przed meczem ----
function mdPreFor(c){const M=MD();const key=mdKey(c);if(M.pre&&M.pre.key===key)return M.pre;if(!c||c.kind==='spar'||c.kind==='nt')return null;
  const op=mdOpp(c);const qs=[];const t=myTeam();const L=mdForm();const s=S();const rec=M.recent||(M.recent=[]);const fresh=q=>!rec.includes(q.k+(q.pid||''));
  const cand=[];if(L.length>=3&&L.filter(x=>!x).length>=2)cand.push(mdQForm(L));
  if(s.phase==='liga'&&s.round<=2&&M.goalAsked!==s.n)cand.push(mdQGoal());
  const stars=t.players.filter(p=>!p.jr&&!p.inj).sort((a,b)=>rating(b)-rating(a)).slice(0,6);const fm=p=>typeof fmOf==='function'?fmOf(p):60;
  const hot=stars.find(p=>fm(p)>=72),cold=stars.find(p=>fm(p)<=45);if(hot)cand.push(mdQPlayer(hot,true));if(cold)cand.push(mdQPlayer(cold,false));
  const rum=stars.find(p=>p.tl||(SAVE.ix&&SAVE.ix.q.some(q=>q.pid===p.id&&q.k==='oferta'))||(p.wantOut===s.n));if(rum)cand.push(mdQRumor(rum));
  const pool=cand.filter(fresh).sort(()=>R()-0.5);if(R()<0.7||pool.length<2)qs.push(mdQRival(op));for(const q of pool){if(qs.length>=2)break;qs.push(q);}if(!qs.length)qs.push(mdQRival(op));
  for(const q of qs){rec.push(q.k+(q.pid||''));}M.recent=rec.slice(-5);
  M.pre={key,qs:qs.map(q=>({k:q.k,pid:q.pid,ans:null,res:null})),op};return M.pre;}
function mdBuildQ(x,ctx){const M=MD();const t=myTeam();const p=x.pid!=null&&PLAYERS[x.pid]?PLAYERS[x.pid].p:null;
  if(x.k==='rywal')return mdQRival(ctx.op);if(x.k==='forma')return mdQForm(mdForm());if(x.k==='cel')return mdQGoal();if(x.k==='gracz'&&p)return mdQPlayer(p,(typeof fmOf==='function'?fmOf(p):60)>=60);if(x.k==='plotka'&&p)return mdQRumor(p);
  if(x.k==='wygr'||x.k==='przegr'){const m=ctx.m;return x.k==='wygr'?mdQWin(m,ctx.me):mdQLoss(m,ctx.me);}return null;}
function mdAnsPre(i,opt){const M=MD();const P=M.pre;if(!P)return;const x=P.qs[i];if(!x||x.ans)return;const q=mdBuildQ(x,{op:P.op});if(!q)return;const o=q.o.find(a=>a[0]===opt);if(!o)return;
  x.ans=opt;x.res=o[2](q);if(x.k==='cel')M.goalAsked=S().n;M.log.unshift({d:today(),t:q.t,a:o[1],r:x.res});M.log=M.log.slice(0,30);save();render();}
function mdSkipPre(){const M=MD();const P=M.pre;if(!P)return;for(const x of P.qs)if(!x.ans){x.ans='_asy';x.res='Odpowiedział asystent — bez większych skutków.';}mdRel(-1);save();render();}
function mdPreCard(c){const P=mdPreFor(c);if(!P)return '';const done=P.qs.every(x=>x.ans);
  return `<div class="card"><h2>Konferencja przed meczem${tipQ('Twoje słowa wpływają na morale zawodników, motywację rywala, zarząd i relacje z mediami. Możesz wysłać asystenta — wtedy nic się nie wydarzy, poza lekkim spadkiem relacji z mediami.')}</h2>
   ${P.qs.map((x,i)=>{const q=mdBuildQ(x,{op:P.op});if(!q)return '';return `<div style="margin:10px 0"><b>🎤 ${esc(q.t)}</b>${x.ans?`<div class="small" style="margin-top:4px">${x.ans==='_asy'?'':'Twoja odpowiedź: „'+esc((q.o.find(a=>a[0]===x.ans)||['',''])[1])+'” — '}<span class="mut">${esc(x.res||'')}</span></div>`:`<div class="row wrap" style="gap:6px;margin-top:6px">${q.o.map(o=>`<button class="ghost sm" onclick="mdAnsPre(${i},'${o[0]}')">${esc(o[1])}</button>`).join('')}</div>`}</div>`;}).join('')}
   ${done?'':`<button class="ghost sm" onclick="mdSkipPre()">Wyślij asystenta</button>`}<div class="small mut" style="margin-top:6px">Relacje z mediami: ${MD().rel}/100</div></div>`;}
// ---- konferencja po meczu (wywołanie z finishMatch) ----
function mdAfterMatch(m,c){try{if(!c||c.kind==='spar'||c.kind==='nt'||!m||!m.sides)return;const me=m.sides.findIndex(s=>s.team.idx===SAVE.team);if(me<0)return;const M=MD();
  if(M.post&&M.post.qs.some(x=>!x.ans)){mdRel(-1);}
  const won=m.winner===me;const op=m.sides[1-me].team.idx;const sc=`${m.sets.filter(s=>s[me]>s[1-me]).length}:${m.sets.filter(s=>s[me]<s[1-me]).length}`;
  M.post={key:today()+op,op,won,sc,me,qs:[{k:won?'wygr':'przegr',ans:null}],m:{sides:m.sides.map(sd=>({team:{idx:sd.team.idx},pl:sd.pl.map(p=>({id:p.id,st:{kill:p.st.kill,blk:p.st.blk,ace:p.st.ace}}))}))}};
  M.pre=null;}catch(e){console.error(e);}}
function mdAnsPost(i,opt){const M=MD();const P=M.post;if(!P)return;const x=P.qs[i];if(!x||x.ans)return;const q=mdBuildQ(x,{m:P.m,me:P.me});if(!q)return;const o=q.o.find(a=>a[0]===opt);if(!o)return;
  x.ans=opt;x.res=o[2](q);M.log.unshift({d:today(),t:q.t,a:o[1],r:x.res});M.log=M.log.slice(0,30);save();render();}
function mdPostPending(){const P=SAVE.md&&SAVE.md.post;return P&&P.qs.some(x=>!x.ans)?1:0;}
// zapowiedź mistrzostwa rozliczana na koniec sezonu (z seasonEvaluation przez hook)
function mdSeasonEnd(place){const M=MD();if(M.boast!==S().n)return;if(place===1){mdRel(6);news('🎤 Zapowiadałeś mistrzostwo i dotrzymałeś słowa. Media są pod wrażeniem.');}else{mdRel(-5);bAdd(-5);news(`🎤 Zapowiadałeś mistrzostwo, a skończyło się na ${place}. miejscu. Media i zarząd to wypominają.`);}}
// raz w miesiącu: relacje z mediami działają na zarząd i kibiców
function mdMonthly(){if(SAVE.team==null||!SAVE.md)return;const r=SAVE.md.rel;if(r>=70){bAdd(1);mdFol(0.01);}else if(r<=30){bAdd(-1);mdFol(-0.01);}}
function mdView(){const M=MD();const c=myNext();const P=M.post;
  const post=P?`<div class="card"><h2>Konferencja po meczu z ${esc(tmN2(P.op))} (${P.won?'wygrana':'porażka'} ${P.sc})</h2>${P.qs.map((x,i)=>{const q=mdBuildQ(x,{m:P.m,me:P.me});if(!q)return '';return `<div style="margin:10px 0"><b>🎤 ${esc(q.t)}</b>${x.ans?`<div class="small" style="margin-top:4px">${x.ans==='_asy'?'':'Twoja odpowiedź: „'+esc((q.o.find(a=>a[0]===x.ans)||['',''])[1])+'” — '}<span class="mut">${esc(x.res||'')}</span></div>`:`<div class="row wrap" style="gap:6px;margin-top:6px">${q.o.map(o=>`<button class="ghost sm" onclick="mdAnsPost(${i},'${o[0]}')">${esc(o[1])}</button>`).join('')}</div><div class="small mut">Bez odpowiedzi do następnego meczu: lekki spadek relacji z mediami.</div>`}</div>`;}).join('')}</div>`:'';
  return `<div class="card"><h2>Relacje z mediami${tipQ('Powyżej 70: co miesiąc lekko rośnie zaufanie zarządu i liczba fanów. Poniżej 30: odwrotnie. Rosną przy ciekawych odpowiedziach, spadają przy unikaniu pytań i wpadkach.')}</h2>
    <div class="row"><div class="conf"><i style="width:${M.rel}%;background:${M.rel>=60?'var(--good)':M.rel>=35?'#eab308':'var(--bad)'}"></i></div><b style="margin-left:8px">${M.rel}/100</b></div>${M.boast===S().n?'<div class="small" style="margin-top:6px">📌 Zapowiedziałeś walkę o mistrzostwo — media rozliczą to po sezonie.</div>':''}</div>
   ${post}${c&&c.kind!=='spar'&&c.kind!=='nt'?mdPreCard(c):''}
   ${M.log.length?`<div class="card"><h2>Ostatnie wypowiedzi</h2>${M.log.slice(0,8).map(l=>`<div class="small" style="margin:6px 0"><span class="mut">${fmtShort(l.d)}</span> 🎤 ${esc(l.t)}<br>„${esc(l.a)}” — <span class="mut">${esc(l.r)}</span></div>`).join('')}</div>`:''}`;}

ROZ_TABS.push(['media','Media',()=>mdPostPending()]);
