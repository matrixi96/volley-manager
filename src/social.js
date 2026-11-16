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
  if(k==='qa'){const p=socTop();if(p){addMor(p,3);if((hasT(p,'ind')||hasT(p,'kap'))&&R()<0.2*(1-sk/30)){d+=socGain(-0.02);extra=` ${p.last} palnął coś niefortunnego — część kibiców się obraziła.`;}socPost(`Q&A z ${p.first} ${p.last} — pytajcie! 🎤`,extra?'bad':'good',0.08,'🎤');}}
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
   <div><span>Wpływ na przychody</span><b>${pct(socSpB())}</b><small>sponsorzy · frekwencja ${pct(socCrowdB())} · sklep ${pct(socShopB())}</small></div>
   <div><span>Specjalista</span><b>${sk?esc(socName()):'brak'}</b><small>${sk?`umiejętność ${sk}/20`:'zatrudnisz go w zakładce Sztab'}</small></div></div>`;
  const msg=ui.socMsg?`<div class="card tmsg ${ui.socMsg.ok?'ok':'no'}">${esc(ui.socMsg.t)}</div>`:'';
  const cr=s.cr?`<div class="card soccr"><h2 style="margin:0 0 4px">⚠️ Kryzys w sieci</h2><p>${esc(s.cr.txt)}</p><p class="small mut">Bez reakcji przez 7 dni klub domyślnie milczy. ${sk?`Szansa udanego kontrataku: ${Math.round((0.35+sk*0.025)*100)}%.`:'Bez specjalisty kontratak to loteria (35%).'}</p>
   <div class="row wrap" style="gap:8px"><button class="btn sm" onclick="socResolve('sorry')">🙏 Przeprosiny<br><small>−1% obserwujących, zarząd +1</small></button><button class="ghost sm" onclick="socResolve('quiet')">🤐 Milczenie<br><small>−1,5 do −4% obserwujących</small></button><button class="ghost sm" onclick="socResolve('fight')">🔥 Kontratak<br><small>+3% albo −5% i zarząd −3</small></button></div></div>`:'';
  const sty=`<div class="card"><h2>Styl komunikacji</h2><div class="socsty">${Object.entries(SOC_STY).map(([k,v])=>`<button class="socst ${s.style===k?'on':''}" onclick="socSetStyle('${k}')"><b>${v[0]}</b><span>${v[1]}</span><small>wzrost ×${v[2]} · ryzyko wpadek ×${v[3]}</small></button>`).join('')}</div></div>`;
  const acts=`<div class="card"><h2>Akcje specjalne</h2>${sk?'':'<p class="small mut">Akcje przygotowuje specjalista ds. social mediów — zatrudnij go w zakładce Sztab.</p>'}<div class="socacts">${SOC_ACT.map(a=>{const cd=s.cd[a[0]]?30-daysBetween(s.cd[a[0]],today()):0;const c=ui.confirm==='soc'+a[0];
    return `<div class="socact"><b>${a[1]}</b><span class="small mut">${a[2]}</span><span class="small">Koszt <b>${fmt(a[3])}</b> · ok. +${Math.round(a[4]*(0.5+(sk||0)/20)*1000)/10}% obserwujących</span>${c&&typeof budImpact==='function'?budImpact({op:a[3]}):''}<button class="${c?'btn':'ghost'} sm" ${!sk||cd>0?'disabled':''} onclick="socAction('${a[0]}')">${cd>0?`Za ${cd} dni`:c?`Potwierdź: zapłacisz ${fmt(a[3])}`:'Zleć'}</button></div>`;}).join('')}</div></div>`;
  const feed=`<div class="card"><h2>Profil klubu</h2><div class="socfeed">${s.feed.length?s.feed.slice(0,15).map(p=>`<div class="socp m${p.mood}"><div class="row"><span class="socic">${p.ic}</span><b>${esc(myTeam().name)}</b><span class="sp"></span><small class="mut">${fmtDMY(p.d)}</small></div><div>${esc(p.t)}</div><div class="small mut">❤️ ${fmtK(p.likes)}${p.cm&&p.cm.length?' · '+p.cm.map(x=>`💬 ${esc(x)}`).join(' · '):''}</div></div>`).join(''):'<p class="mut small">Jeszcze nic nie opublikowano. Posty pojawią się po meczach i transferach.</p>'}</div></div>`;
  const pl=`<div class="card"><h2>Zawodnicy w sieci</h2>${top.map(p=>`<div class="res row"><b>${esc(p.first)} ${esc(p.last)}</b><span class="small mut" style="margin-left:8px">${(hasT(p,'ind')||hasT(p,'kap'))?'⚠️ ryzyko wpadek':''}</span><span class="sp"></span><span>${fmtK(pFol(p))} obserwujących</span></div>`).join('')}<p class="small mut">Gwiazdy z dużym zasięgiem przyciągają kibiców po transferze. Indywidualiści i kapryśni czasem wrzucają niefortunne posty.</p></div>`;
  return stats+msg+cr+`<div class="grid2">${feed}<div>${sty}${acts}${pl}</div></div>`;}
