// ================= EFEKTYWNOŚĆ TAKTYCZNA: ZNAJOMOŚĆ TAKTYKI, DOPASOWANIE, PRZEKONANIE, WIEDZA O RYWALU =================
// znajomość: SAVE.tfam[ti]['klucz:opcja'] 0–100; rośnie z każdą akcją rozegraną w danym ustawieniu i na treningu „Taktyka”
const TF_EL=[['serve','zag','Zagrywka',()=>SERVE_OPT],['dist','roz','Rozegranie',()=>DIST_OPT],['atk','atk','Rodzaj ataku',()=>ATK_OPT],['adir','atk','Kierunek ataku',()=>ADIR_OPT],
  ['blkL','blk','Blok — lewa strona',()=>BLK_OPT],['blkR','blk','Blok — prawa strona',()=>BLK_OPT],['blkM','blk','Blok — środek',()=>MID_OPT],['blk3','blk','Liczba blokujących',()=>B3_OPT],
  ['dsys','obr','System obrony',()=>[['Klasyczna'],['Rotacyjna']]],['tip','obr','Asekuracja kiwki',()=>null],['free','obr','Piłki sytuacyjne',()=>FREE_OPT]];
const TF_GRP=[['','Wszystko po trochu'],['zag','Zagrywka'],['roz','Rozegranie'],['atk','Atak'],['blk','Blok'],['obr','Obrona i piłki sytuacyjne']];
const TF_DEF={serve:1,dist:0,atk:0,adir:0,blkL:1,blkR:1,blkM:1,blk3:0,dsys:0,tip:0,free:0};
function tfVal(t,k){t=t||{};if(k==='tip')return (t.tipL?1:0)+(t.tipR?2:0)+(t.tipM?4:0);return t[k]==null?TF_DEF[k]:t[k];}
function tfOptName(k,v){if(k==='tip'){const a=[];if(v&1)a.push('lewa');if(v&2)a.push('prawa');if(v&4)a.push('środek');return a.length?'asekuracja: '+a.join(', '):'bez asekuracji';}const o=TF_EL.find(x=>x[0]===k)[3]();return o&&o[v]?o[v][0]:String(v);}
function tacOf(ti){return ti===SAVE.team?myTac():{serve:1,dist:0};}
function TFM(ti){const all=SAVE.tfam||(SAVE.tfam={});if(!all[ti]){const t=tacOf(ti);const f={};for(const [k] of TF_EL)f[k+':'+tfVal(t,k)]=ti===SAVE.team?75:80;all[ti]=f;}return all[ti];}
function famOf(ti,k,v){const f=TFM(ti)[k+':'+v];return f==null?30:f;}
function famAdd(ti,key,d){const f=TFM(ti);const c=f[key]==null?30:f[key];f[key]=clamp(c+(d>0?d*Math.max(0.1,1-c/115):d),0,100);}
// po meczu: każda rozegrana akcja w danym ustawieniu uczy
function famAfterMatch(m){if(!m.tu)return;m.sides.forEach((sd,i)=>{const ti=sd.team.idx;for(const key in m.tu[i])famAdd(ti,key,m.tu[i][key]*0.03);});}
// trening „Taktyka”: uczy aktualnie ustawionych opcji (mocniej w wybranym elemencie); nieużywane opcje powoli się zapominają
function famTrainDay(units){const ti=SAVE.team;const f=TFM(ti);const t=myTac();const n=units.filter(u=>u==='tak').length;const focus=(SAVE.trn&&SAVE.trn.takF)||'';
  const q=0.6+(staffSkill('asy')+cA('tak'))/40;const cur=new Set(TF_EL.map(([k])=>k+':'+tfVal(t,k)));
  for(const [k,g] of TF_EL){const key=k+':'+tfVal(t,k);if(n)famAdd(ti,key,n*q*(focus?(focus===g?2.5:0.4):1));}
  for(const key in f)if(!cur.has(key)&&f[key]>20)f[key]=Math.max(20,f[key]-0.25);}
// ---- filary ----
const mapc=(v,a,b)=>clamp((v-a)/(b-a)*100,0,100);
function luPlayers(ti){const t=TEAMS[ti];const lu=ti===SAVE.team?myLineup():autoLineup(t);return {t,lu,P:k=>t.players.find(p=>p.id===lu[k])};}
function tfKnow(ti){const t=tacOf(ti);const rows=TF_EL.map(([k,g,l])=>{const v=tfVal(t,k);return {k,g,l,v,f:Math.round(famOf(ti,k,v))};});const {P}=luPlayers(ti);
  const st=['R','A','P1','P2','S1','S2','L'].map(P).filter(Boolean);const newb=st.filter(p=>togetherOf(p,ti)<8);
  const nonDef=TF_EL.filter(([k])=>tfVal(t,k)!==TF_DEF[k]).length;const cx=Math.round(clamp(100-Math.max(0,nonDef-3)*12,30,100));
  const avg=rows.reduce((a,r)=>a+r.f,0)/rows.length;const score=Math.round(clamp(avg*(1-0.35*newb.length/Math.max(1,st.length))*(0.85+0.15*cx/100),0,100));
  return {score,rows,cx,nonDef,newb};}
function tfSkill(ti){const t=tacOf(ti);const {P}=luPlayers(ti);const six=['R','A','P1','P2','S1','S2'].map(P).filter(Boolean);const att=['A','P1','P2','S1','S2'].map(P).filter(Boolean);const avg=(ps,k)=>ps.reduce((a,p)=>a+p[k],0)/Math.max(1,ps.length);
  const f=[];const sv=tfVal(t,'serve');f.push(['Zagrywka a umiejętności serwujących',sv===2?mapc(avg(six,'zag'),9,16):sv===1?mapc(avg(six,'zag'),6,13):92]);
  const d=tfVal(t,'dist');const S=['S1','S2'].map(P).filter(Boolean);const R=P('R');f.push(['Rozegranie a rozgrywający i atakujący',d===2?(mapc(avg(S,'szy'),9,16)+mapc(R?R.tpa:10,9,16))/2:d===1?mapc(avg(['A','P1','P2'].map(P).filter(Boolean),'ata'),10,17):mapc(R?R.roz:10,8,16)]);
  const a=tfVal(t,'atk');f.push(['Rodzaj ataku a atakujący',a===1?(mapc(avg(att,'ata'),10,17)+mapc(avg(att,'sil'),10,17))/2:a===2?mapc(avg(att,'kiw'),8,15):mapc(avg(att,'czy'),7,14)]);
  const ad=tfVal(t,'adir');f.push(['Kierunek ataku a czytanie gry',ad===0?90:ad===4?(mapc(avg(att,'czy'),9,16)+mapc(avg(att,'ata'),10,17))/2:mapc(avg(att,'czy'),8,15)]);
  const bl=[tfVal(t,'blkL'),tfVal(t,'blkR'),tfVal(t,'blkM')].filter(v=>v!==1).length;const b3=tfVal(t,'blk3');f.push(['Blok a środkowi',bl||b3?(mapc(avg(S,'blo'),10,17)+mapc(avg(S,'czy'),8,15))/2:mapc(avg(S,'czy'),7,14)]);
  const back=['L','P1','P2'].map(P).filter(Boolean);f.push(['Obrona a obrońcy',tfVal(t,'dsys')===1?(mapc(avg(back,'obr'),10,17)+mapc(avg(back,'zwi'),9,16))/2:mapc(avg(back,'obr'),8,15)]);
  const off=LINEUP_KEYS.filter(([k,,pos])=>{const p=P(k);return p&&p.pos!==pos;}).length;f.push(['Zawodnicy na swoich pozycjach',100-off*30]);
  const score=Math.round(f.reduce((a,x)=>a+clamp(x[1],0,100),0)/f.length);return {score,f:f.map(x=>[x[0],Math.round(clamp(x[1],0,100))])};}
function tfConv(ti){const {P}=luPlayers(ti);const st=['R','A','P1','P2','S1','S2','L'].map(P).filter(Boolean);const mine=ti===SAVE.team;
  const fm=st.reduce((a,p)=>a+fmOf(p),0)/Math.max(1,st.length);const f=[['Forma i morale',mapc(fm,40,75)]];
  if(mine){f.push(['Autorytet i motywacja trenera',mapc((cA('aut')+cA('mot'))/2,6,17)]);}
  const form=teamForm(ti)||[];const w=form.filter(Boolean).length;f.push(['Wyniki w ostatnich meczach',form.length?w/form.length*100:60]);
  const cap=mine?myCaptain():autoCaptain(st);const unh=TEAMS[ti].players.filter(p=>(p.unh||0)>=3).length;f.push(['Kapitan i szatnia',clamp(60+capBonus(cap)*500-unh*12,0,100)]);
  const score=Math.round(f.reduce((a,x)=>a+x[1],0)/f.length);return {score,f:f.map(x=>[x[0],Math.round(x[1])])};}
function tfInfo(ti){if(ti!==SAVE.team)return {score:60,f:[]};const c=myNext();const op=c?(c.h===SAVE.team?c.a:c.h):null;const f=[];
  const rep=op!=null?mailBox().find(m=>m.b&&m.b.type==='opp'&&m.b.op===op&&daysBetween(m.d,today())<=4):null;
  f.push(['Raport o rywalu',!rep?15:rep.applied?95:rep.r?75:45]);
  if(op!=null){const ps=autoLineup(TEAMS[op]);const ks=Object.values(ps).map(id=>PLAYERS[id]&&PLAYERS[id].p).filter(Boolean);f.push(['Wiedza o zawodnikach rywala',ks.reduce((a,p)=>a+knowOf(p),0)/Math.max(1,ks.length)]);}
  f.push(['Odprawa taktyczna (trening „Taktyka” przed meczem)',Math.min(100,(typeof tacPrep==='function'?tacPrep():0)*40+20)]);
  const score=Math.round(f.reduce((a,x)=>a+x[1],0)/f.length);return {score,f:f.map(x=>[x[0],Math.round(x[1])]),op,rep};}
function tacEff(ti){const k=tfKnow(ti),s=tfSkill(ti),c=tfConv(ti),i=tfInfo(ti);return {score:Math.round(k.score*0.35+s.score*0.25+c.score*0.25+i.score*0.15),k,s,c,i};}
// dane do meczu: bonus z efektywności, znajomość opcji (skaluje działanie ustawień), mnożnik prostych błędów
function tfMatchX(ti){try{const e=tacEff(ti);const all={};const f=TFM(ti);for(const key in f)all[key]=f[key]/100;const kn=e.k.score/100;
  return {sb:clamp((e.score-65)/35*0.02,-0.025,0.025),fam:all,tfE:1+(0.7-kn)*0.15};}catch(x){console.error(x);return {sb:0};}}
// ---- widok ----
function tfCol(v){return v<=50?'#e24b4a':v<=75?'#ef9f27':v<=85?'#3b8a1e':'#97c459';}
function tdot(v){v=Math.round(clamp(v,0,100));return `<span class="tfpv"><small>${v}%</small><span class="tfpie" style="background:conic-gradient(${tfCol(v)} ${v*3.6}deg,#ffffff1f 0)" title="${v}%"></span></span>`;}
function tbar(v){let h='';for(let i=0;i<10;i++)h+=`<i ${v>=(i+1)*10?`style="background:${tfCol(v)}"`:''}></i>`;return `<span class="tfbar" title="${v}/100">${h}</span>`;}
function setTakF(g){ensTrn().takF=g;save();render();}
function tacEffView(){const ti=SAVE.team;const e=tacEff(ti);const k=e.k,s=e.s,c=e.c,i=e.i;const focus=(SAVE.trn&&SAVE.trn.takF)||'';
  const col=(title,sc,desc,rows,note)=>`<div class="tfcol"><div class="row"><b class="tfh">${title}</b><span class="sp"></span>${tbar(sc)}<b>${sc}</b></div><p class="small mut">${desc}</p><div class="tsec" style="margin:4px 0">Kluczowe czynniki</div>${rows}<div class="tfnote">${note}</div></div>`;
  const fr=xs=>xs.map(([l,v])=>`<div class="tfr"><span>${esc(l)}</span>${tdot(v)}</div>`).join('');
  const weak=k.rows.filter(r=>r.f<45);const kNote=weak.length?`Zawodnicy wciąż uczą się: ${weak.map(r=>r.l.toLowerCase()+' ('+tfOptName(r.k,r.v).toLowerCase()+')').slice(0,3).join(', ')}.`:k.newb.length?`Nowi w składzie słabiej znają taktykę: ${k.newb.map(p=>p.last).slice(0,3).join(', ')}.`:'Zespół dobrze zna obecną taktykę.';
  const sw=s.f.filter(x=>x[1]<45);const sNote=sw.length?`Słabo pasuje: ${sw.map(x=>x[0].toLowerCase()).slice(0,2).join('; ')}.`:'Taktyka pasuje do umiejętności zawodników.';
  const cw=c.f.slice().sort((a,b)=>a[1]-b[1])[0];const cNote=cw&&cw[1]<45?`Najsłabiej: ${cw[0].toLowerCase()}.`:'Zawodnicy wierzą w plan.';
  const iNote=i.op==null?'Brak zaplanowanego meczu.':!i.rep?'Brak raportu o najbliższym rywalu — włącz zadanie „Następny rywal” w Skautingu.':i.rep.applied?'Raport przeczytany i zalecenia zastosowane.':'Raport jest w poczcie — przeczytaj i zastosuj zalecenia.';
  const grp=TF_GRP.slice(1).map(([g,l])=>{const rs=k.rows.filter(r=>r.g===g);return `<div class="tfgrp"><div class="row"><b>${l}</b><span class="sp"></span><button class="ghost sm ${focus===g?'on':''}" onclick="setTakF('${focus===g?'':g}')">${focus===g?'✓ Ćwiczone na treningu':'Ćwicz na treningu'}</button></div>
    ${rs.map(r=>{const others=Object.entries(TFM(ti)).filter(([key])=>key.startsWith(r.k+':')&&key!==r.k+':'+r.v).sort((a,b)=>b[1]-a[1]).slice(0,2);return `<div class="tfopt"><span>${esc(r.l)}: <b>${esc(tfOptName(r.k,r.v))}</b></span><span class="kbar wide"><i style="width:${r.f}%;background:${r.f>=70?'var(--good)':r.f>=45?'var(--acc)':'var(--bad)'}"></i></span><b>${r.f}%</b>${others.length?`<small class="mut">inne: ${others.map(([key,v])=>esc(tfOptName(r.k,+key.split(':')[1]))+' '+Math.round(v)+'%').join(', ')}</small>`:''}</div>`;}).join('')}</div>`;}).join('');
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Efektywność taktyczna</h2><span class="sp"></span><span class="small mut">Ogólna efektywność</span>${tbar(e.score)}<b class="tfbig">${e.score}</b></div>
   <p class="small mut">Jak dobrze każdy zawodnik i cały zespół rozumie i potrafi zagrać Twoją taktykę w dniu meczu. Wpływa na całą grę (do ±2%) i na to, jak skutecznie działają poszczególne ustawienia.</p>
   <div class="tfgrid">${col('Znajomość taktyki',k.score,'Ile razy graliśmy tymi ustawieniami i ile ćwiczyliśmy je na treningu.',fr(k.rows.map(r=>[r.l,r.f]).concat([['Złożoność taktyki ('+k.nonDef+' niestandardowych ustawień)',k.cx]])),kNote)}
    ${col('Umiejętności zawodników',s.score,'Czy wybrane ustawienia pasują do umiejętności zawodników w składzie.',fr(s.f),sNote)}
    ${col('Przekonanie zawodników',c.score,'Czy zawodnicy chcą realizować Twój plan.',fr(c.f),cNote)}
    ${col('Wiedza o rywalu',i.score,'Jak dobrze znamy najbliższego rywala.',fr(i.f),iNote)}</div></div>
  <div class="card"><div class="row wrap"><h2 style="margin:0">Znajomość ustawień</h2><span class="sp"></span><span class="small mut">Jednostki „Taktyka” ćwiczą:</span><select onchange="setTakF(this.value)">${TF_GRP.map(([g,l])=>`<option value="${g}" ${focus===g?'selected':''}>${l}</option>`).join('')}</select></div>
   <p class="small mut">Każda akcja rozegrana w danym ustawieniu uczy zawodników (ok. +5 pkt za mecz, wolniej przy wysokiej znajomości). Trening „Taktyka” uczy obecnie ustawionych opcji — najmocniej wybranego elementu, szybciej przy dobrym asystencie i Twojej taktyce. Nieużywane opcje powoli się zapominają. Nowa opcja zaczyna od ok. 30%: zmiana taktyki tuż przed meczem lub w trakcie meczu jest ryzykowna.</p>
   <div class="tfgroups">${grp}</div></div>`;}
