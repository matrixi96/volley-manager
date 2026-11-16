// ===== Puchary krajowe: wszystkie drużyny danego kraju, bez względu na ligę =====
// Pojedyncze mecze, losowanie przed każdą rundą, gospodarzem jest drużyna z niższej ligi (jak w Pucharze Polski), finał na neutralnym terenie.
// Najwyżej rozstawione drużyny (wyższa liga, renoma) dostają wolny los w pierwszej rundzie, aby drabinka miała 32 albo 64 miejsca.
const CUP_PRIZE=[0,30000,50000,80000,120000,200000,350000];// za awans do kolejnej rundy (od końca: finał=najwyższa)
function cupName(c){return COUNTRIES[c].cup;}
function cupRoundName(n,left){const t=left;return t===2?'Finał':t===4?'Półfinał':t===8?'Ćwierćfinał':t===16?'1/8 finału':t===32?'1/16 finału':'1/32 finału';}
// daty: środy w tygodniach bez środowej kolejki ligi użytkownika, od października do końca lutego
function cupDates(s,n){const mid=[];for(let i=0;i<s.rdates.length-1;i++){const d=s.rdates[i];if(dow(d)!==6)continue;const nx=s.rdates[i+1];if(daysBetween(d,nx)>=7)mid.push(addDays(d,4));}
  const cand=mid.filter(d=>(d.slice(5)>='10-07'&&d.slice(5)<'12-18')||(d.slice(5)>'01-07'&&d.slice(5)<='03-01'));const out=[];for(let k=0;k<n;k++){const i=Math.round(k*(cand.length-1)/Math.max(1,n-1)*0.85);out.push(cand[Math.min(cand.length-1,i)]);}
  for(let k=1;k<out.length;k++)if(out[k]<=out[k-1])out[k]=addDays(out[k-1],7);return out;}
function cupTeams(c){return TEAMS.filter(t=>lgCountry(lgOf(t.idx))===c&&!isYT(t.idx)).map(t=>t.idx).sort((a,b)=>(LG_LV[lgOf(a)]-LG_LV[lgOf(b)])||(SAVE.ai[b].rep-SAVE.ai[a].rep));}
function cupInit(s){s.cups={};for(const c of CTRY){const ids=cupTeams(c);if(ids.length<4)continue;let P=2;while(P<ids.length)P*=2;const nR=Math.log2(P);
  const byes=ids.slice(0,P-ids.length);const rest=ids.slice(P-ids.length).sort(()=>R()-0.5);const ties=[];for(let i=0;i<rest.length;i+=2)ties.push(cupTie(rest[i],rest[i+1],false));
  s.cups[c]={P,dates:cupDates(s,nR),r:0,rounds:[{left:P,ties,byes}],champ:null,run:{}};}}
function cupTie(a,b,neutral){const la=LG_LV[lgOf(a)],lb=LG_LV[lgOf(b)];let h=a,w=b;if(lb>la||(lb===la&&R()<0.5)){h=b;w=a;}return {h,a:w,neutral:!!neutral,res:null};}
function cupNextRound(C){const R0=C.rounds[C.r];const win=R0.ties.map(t=>cupWinner(t)).concat(R0.byes);if(win.length===1){C.champ=win[0];return;}
  const pool=win.sort(()=>R()-0.5);const ties=[];const fin=pool.length===2;for(let i=0;i<pool.length;i+=2)ties.push(cupTie(pool[i],pool[i+1],fin));
  C.rounds.push({left:pool.length,ties,byes:[]});C.r++;}
function cupWinner(t){return t.res?(t.res.sw[0]>t.res.sw[1]?t.res.h:t.res.a):null;}
function cupLoser(t){return t.res?(t.res.sw[0]>t.res.sw[1]?t.res.a:t.res.h):null;}
function myCountry(){return tmCountry(SAVE.team);}
// mecz pucharowy użytkownika, jeśli jego termin wypada przed następnym meczem ligowym
function myCupTie(){const s=S();if(!s||!s.cups||s.phase!=='liga')return null;const C=s.cups[myCountry()];if(!C||C.champ!=null)return null;const rd=C.rounds[C.r];const d=C.dates[C.r];
  const t=rd.ties.find(x=>!x.res&&(x.h===SAVE.team||x.a===SAVE.team));if(!t)return null;return {t,d,C,rd};}
function cupEventFirst(leagueDate){const x=myCupTie();if(!x)return null;return !leagueDate||x.d<=leagueDate?x:null;}
// codziennie: rozegraj mecze pucharowe innych drużyn, gdy przyszedł ich termin
function cupTick(d){const s=S();if(!s||!s.cups)return;for(const c in s.cups){const C=s.cups[c];let guard=8;
  while(C.champ==null&&C.dates[C.r]&&C.dates[C.r]<=d&&guard-->0){const rd=C.rounds[C.r];let pend=false;
    for(const t of rd.ties){if(t.res)continue;if(t.h===SAVE.team||t.a===SAVE.team){pend=true;continue;}t.res=cupSim(t,rd.left);t.res.d=C.dates[C.r];}
    if(pend)break;cupRoundDone(c,C);}}}
// faworyt z wyższej ligi we wczesnych rundach często oszczędza podstawowych zawodników (jak w prawdziwych pucharach)
function cupRot(i,opp,left){const d=LG_LV[lgOf(opp)]-LG_LV[lgOf(i)];return d>=1&&left>=16&&R()<0.55;}
function cupPart(i,home,rot){const p=participant(i,home);if(!rot)return p;const t=TEAMS[i];const st=Object.values(p.lineup).map(id=>t.players.find(x=>x.id===id)).filter(Boolean).sort((a,b)=>rating(b)-rating(a)).slice(0,3).map(x=>x.id);
  const t2=Object.assign({},t,{players:t.players.filter(x=>!st.includes(x.id))});if(t2.players.length>=7)p.lineup=autoLineup(t2);return p;}
function cupSim(t,left){const m=simMatch(cupPart(t.h,!t.neutral,cupRot(t.h,t.a,left||0)),cupPart(t.a,false,cupRot(t.a,t.h,left||0)));return resultOf(m,t.h,t.a);}
function cupRoundDone(c,C){const rd=C.rounds[C.r];const mine=c===myCountry();
  // nagrody i wiadomości dla klubu użytkownika
  if(mine&&SAVE.team!=null){const myT=rd.ties.find(t=>t.h===SAVE.team||t.a===SAVE.team);if(myT){const won=cupWinner(myT)===SAVE.team;const k=Math.log2(rd.left);const pz=won?CUP_PRIZE[Math.max(0,CUP_PRIZE.length-k)]||20000:0;
      if(pz){money(pz,'Nagrody');finLog(`${cupName(c)}: awans dalej (${cupRoundName(0,rd.left)})`,pz);}}}
  cupNextRound(C);
  if(C.champ!=null){const ch=C.champ;SAVE.ai[ch].rep=Math.min(100,SAVE.ai[ch].rep+3);
    if(mine||ch===SAVE.team)news(`🏆 ${TEAMS[ch].name} zdobywa ${cupName(c)}!${ch===SAVE.team?' To nasze trofeum!':''}`);
    if(ch===SAVE.team){money(500000,'Nagrody');finLog(`${cupName(c)}: zwycięstwo`,500000);const co=coach();if(co){co.trophies=co.trophies||[];co.trophies.push({n:S().n,t:cupName(c),team:SAVE.team});}if(SAVE.board)SAVE.board.conf=Math.min(100,SAVE.board.conf+10);try{achEv('cup');}catch(e){}}}
  else if(mine){const nr=C.rounds[C.r];const my=nr.ties.find(t=>t.h===SAVE.team||t.a===SAVE.team);if(my){const op=my.h===SAVE.team?my.a:my.h;news(`🏆 ${cupName(c)} — losowanie (${cupRoundName(0,nr.left)}): zagramy z ${TEAMS[op].name}${my.neutral?' na neutralnym terenie':my.h===SAVE.team?' u siebie':' na wyjeździe'} (${fmtDMY(C.dates[C.r])}).`);}}}
function cupMyResult(res){const x=myCupTie();if(!x)return;x.t.res=res;res.d=x.d;const C=x.C;const c=myCountry();if(C.rounds[C.r].ties.every(t=>t.res))cupRoundDone(c,C);else cupTick(x.d);}
function cupFinishAll(){const s=S();if(!s||!s.cups)return;for(const c in s.cups){const C=s.cups[c];let g=10;while(C.champ==null&&g-->0){for(const t of C.rounds[C.r].ties)if(!t.res)t.res=cupSim(t,C.rounds[C.r].left);cupRoundDone(c,C);}}}
// ---- widok ----
function cupView(){const s=S();if(!s.cups)return '<div class="card"><p class="mut">Puchar ruszy od nowego sezonu.</p></div>';const c=ui.cupC||myCountry();const C=s.cups[c];if(!C)return '';
  const rows=C.rounds.map((rd,i)=>`<div class="cupr"><h3>${cupRoundName(0,rd.left)} <small class="mut">· ${fmtDMY(C.dates[i])}${rd.byes.length?` · wolny los: ${rd.byes.length} drużyn`:''}</small></h3>${rd.ties.map(t=>{const w=cupWinner(t);const mine=t.h===SAVE.team||t.a===SAVE.team;
    return `<div class="cupt ${mine?'mine':''}"><span class="${w===t.h?'b':''}">${tDot(t.h)} ${tName(t.h)} <small class="mut">${LG_SHORT[lgOf(t.h)]}</small></span><b>${t.res?`${t.res.sw[0]}:${t.res.sw[1]}`:'–'}</b><span class="${w===t.a?'b':''}">${tName(t.a)} <small class="mut">${LG_SHORT[lgOf(t.a)]}</small> ${tDot(t.a)}</span></div>`;}).join('')}</div>`).reverse().join('');
  return `<div class="card"><div class="row wrap" style="gap:8px"><h2 style="margin:0">${COUNTRIES[c].fl} ${cupName(c)}</h2><span class="sp"></span><select onchange="ui.cupC=this.value;render()">${CTRY.map(k=>`<option value="${k}" ${k===c?'selected':''}>${COUNTRIES[k].fl} ${cupName(k)}</option>`).join('')}</select></div>
   <p class="small mut">Grają wszystkie drużyny kraju, bez względu na ligę (${C.rounds[0].ties.length*2+C.rounds[0].byes.length} drużyn). Jeden mecz, gospodarzem jest drużyna z niższej ligi, finał na neutralnym terenie. Najwyżej rozstawione drużyny zaczynają od drugiej rundy.${C.champ!=null?` <b>🏆 Zdobywca: ${tName(C.champ)}</b>`:''}</p>${rows}</div>`;}
