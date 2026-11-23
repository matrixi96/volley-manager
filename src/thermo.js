// ---- poziom lig: ukryta korekta świata ----
// Każda liga ma swój poziom odniesienia z początku gry (lgRef). Raz na sezon, przed okienkiem transferowym,
// gra porównuje obecny średni poziom drużyn komputera z tym odniesieniem i delikatnie koryguje świat,
// żeby niższe ligi nie doganiały najlepszych. Twój klub i Twoi zawodnicy nie są objęci korektą.
function thAvg(l){let s=0,n=0;for(const i of lgIds(l)){if(i===SAVE.team)continue;const t=TEAMS[i];if(!t||!t.players.length)continue;s+=teamStrength(t);n++;}return n?s/n:lgRef(l);}
function thDiff(l){return (SAVE.thermo&&SAVE.thermo[l])||0;}
// mnożnik rozwoju zawodnika komputera: liga „za mocna” rozwija się wolniej, „za słaba” trochę szybciej
function thK(p){if(!SAVE.thermo||p.tm==null||p.tm<0||p.tm===SAVE.team||p.loan)return 1;return clamp(1-0.12*thDiff(lgOf(p.tm)),0.4,1.2);}
function thDecay(p){const pw=WEIGHTS[p.pos]||{};const ks=ALL_KEYS.filter(k=>pw[k]&&p[k]>1);if(!ks.length)return;const k=ks[Math.floor(R()*ks.length)];p[k]--;}
// najlepsi z niższych lig przechodzą do klubów najwyższej ligi z tego samego kraju
function thStarsUp(l,d){if(!LG_LV[l])return;const c=lgCountry(l);const tops=allLgs().filter(x=>LG_LV[x]===0&&lgCountry(x)===c);if(!tops.length)return;const top=tops[0];const ref=lgRef(top);
  const n=Math.min(5,1+Math.floor(d));let k=0;const n0=S().n;
  const cands=W().players.filter(p=>p.tm>=0&&p.tm!==SAVE.team&&!p.jr&&!p.loan&&!p.inj&&p.age<=30&&lgOf(p.tm)===l&&rating(p)>=ref-3).sort((a,b)=>rating(b)-rating(a));
  for(const p of cands){if(k>=n)break;const from=p.tm;if(TEAMS[from].players.length<=SQUAD_MIN+1)continue;const fee=round5k(askingPrice(p));
    const dest=lgIds(top).map(i=>TEAMS[i]).filter(t=>t.idx!==SAVE.team&&SAVE.ai[t.idx]&&SAVE.ai[t.idx].bud>=fee&&t.players.length<16&&teamWages(t.idx)+wageDemand(p)<=wageCap(t.idx)*1.1)
      .sort((a,b)=>teamStrength(a)-teamStrength(b))[0];if(!dest)continue;
    SAVE.ai[dest.idx].bud-=fee;SAVE.ai[from].bud+=fee;movePlayer(p,dest.idx);p.wage=wageDemand(p);p.ce=n0+1+Math.floor(R()*2);k++;
    if(lgCountry(l)===tmCountry(SAVE.team))news(`🔁 Transfer: ${p.first} ${p.last} przechodzi z ${TEAMS[from].name} do ${dest.name} za ${fmt(fee)}.`);}}
// pomiar w październiku, gdy kadry są już po okienku — w tym samym momencie sezonu, w którym zapisano poziom odniesienia
function thMeasure(){if(!SAVE.world||!SAVE.season)return;SAVE.thermo=SAVE.thermo||{};for(const l of allLgs())SAVE.thermo[l]=Math.round(clamp(thAvg(l)-lgRef(l),-5,8)*10)/10;}
{const _mo=monthly;monthly=function(d){const r=_mo.apply(this,arguments);try{if(d.slice(5,7)==='10')thMeasure();}catch(e){console.error(e);}return r;};}
// przed okienkiem: najlepsi z „za mocnych” niższych lig idą do najwyższej ligi (wg pomiaru z października)
function worldThermo(){if(!SAVE.world||!SAVE.season||!SAVE.thermo)return;for(const l of allLgs()){const d=thDiff(l);if(d>1)try{thStarsUp(l,d);}catch(e){console.error(e);}}syncTeams();}
// po okienku: ponowny pomiar na nowych kadrach i ukryta korekta formy zawodników komputera w ligach powyżej poziomu
function thDecayPass(){if(!SAVE.world||!SAVE.season)return;SAVE.thermo=SAVE.thermo||{};
  for(const l of allLgs()){const ref=lgRef(l);let d=thAvg(l)-ref;
    for(let it=0;it<3&&d>0.5;it++){
      for(const i of lgIds(l)){if(i===SAVE.team)continue;for(const p of TEAMS[i].players){if(p.jr||p.loan||p.age<21)continue;
        const over=rating(p)>ref+4?1.3:1;const k=Math.floor((d-0.3)*0.8*over+R());for(let j=0;j<k;j++)thDecay(p);
        const r=rating(p);if(p.pot>r+1)p.pot=Math.max(r,p.pot-Math.round(d*0.5));if(p.pot<r)p.pot=r;}}
      if(typeof ST_C!=='undefined'&&ST_C)ST_C={};d=thAvg(l)-ref;}
    SAVE.thermo[l]=Math.round(clamp(d,-5,8)*10)/10;}
  syncTeams();}
{const _d=develop;develop=function(p,focus,intI,played,mods,jr,km){const k=thK(p);if(k!==1)km=(km==null?1:km)*k;return _d.call(this,p,focus,intI,played,mods,jr,km);};}
// narybek: w lidze „za mocnej” juniorzy komputera mają niższy sufit
{const _gj=genJunior;genJunior=function(ti,age,pos){const p=_gj.apply(this,arguments);try{if(ti!==SAVE.team&&SAVE.thermo){const d=thDiff(lgOf(ti));if(d>0){p.pot=Math.max(rating(p),p.pot-Math.round(d*0.9));}}}catch(e){console.error(e);}return p;};}
{const _ao=aiOffseason;aiOffseason=function(){try{worldThermo();}catch(e){console.error(e);}const r=_ao.apply(this,arguments);try{thDecayPass();}catch(e){console.error(e);}return r;};}
