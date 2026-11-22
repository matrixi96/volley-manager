// ================= POPRAWKI: limit obcokrajowców widoczny w składzie i w meczu =================
function forInfo(){const t=myTeam();const mx=tmMaxF(t);if(mx==null)return null;const hl=healthyLineup(t,myLineup());const lu=hl.lu;const n=luForeign(t,lu);
  const fx=lineupFix(t,lu);const ch=LINEUP_KEYS.filter(([k])=>fx[k]!==lu[k]).map(([k,l])=>({k,l,out:t.players.find(p=>p.id===lu[k]),inn:t.players.find(p=>p.id===fx[k])}));return {mx,n,lu,fx,ch,inj:hl.ch};}
function forApply(){const F=forInfo();if(!F)return;SAVE.lineup=Object.assign({},F.fx);save();render();}
function forCard(){const F=forInfo();const live=typeof liveMatch==='function'&&liveMatch();let h='';
  if(live)h+=`<div class="card" style="border-color:#eab308"><b>⚠ Mecz właśnie trwa.</b> <span class="small">Zmiany składu tutaj obowiązują od następnego meczu. Zawodników w trwającym meczu zmieniasz w widoku meczu (kliknij zawodnika na pasku „Skład”, potem rezerwowego).</span> <button class="link" onclick="go('mecz')">Wróć do meczu →</button></div>`;
  if(F){const bad=F.n>F.mx;h+=`<div class="card" style="${bad?'border-color:var(--bad)':''}"><div class="row wrap" style="gap:10px;align-items:center"><b>🌍 Limit obcokrajowców: ${forRuleTxt(myLg())}.</b><span class="${bad?'bad':'good'}">W Twoim składzie: <b>${F.n}</b> / ${F.mx}</span>${bad&&F.ch.length?`<span class="sp"></span><button class="btn sm" onclick="forApply()">Popraw skład zgodnie z limitem</button>`:''}</div>
    ${bad?(F.ch.length?`<div class="small" style="margin-top:6px">Jeśli tego nie zmienisz, przed meczem asystent sam wymieni: ${F.ch.map(c=>`<b>${esc(c.out.last)}</b> → <b>${esc(c.inn.last)}</b> (${c.l})`).join(', ')}.</div>`:`<div class="small bad" style="margin-top:6px">W kadrze jest za mało zdrowych zawodników z kraju ligi, żeby zmieścić się w limicie — asystent nie ma kogo wstawić. Potrzebujesz transferu zawodnika z kraju ligi (zakładka Transfery albo Juniorzy).</div>`):''}
    <div class="small mut" style="margin-top:4px">Ten sam limit obowiązuje przy zmianach w trakcie meczu — obcokrajowca można wpuścić tylko za obcokrajowca.</div></div>`;}
  if(F&&F.inj&&F.inj.length)h+=`<div class="card"><span class="small">🚑 Kontuzje: przed meczem wejdą ${F.inj.map(([p,c,l])=>`<b>${esc(c.last)}</b> za ${esc(p?p.last:'—')} (${l})`).join(', ')}.</span></div>`;
  return h;}
{const _sv=squadView;squadView=function(){const h=_sv.apply(this,arguments);if(ui.sqTab)return h;const c=forCard();if(!c)return h;const i=h.indexOf('<div class="card"><div class="row"><h2>Skład wyjściowy</h2>');return i>=0?h.slice(0,i)+c+h.slice(i):c+h;};}
// komunikat w relacji meczu, gdy asystent poprawił skład przed meczem
{const _pa=participant;participant=function(i,home){const n0=(SAVE.news||[]).length;const r=_pa.apply(this,arguments);try{if(i===SAVE.team){const F=forInfo();if(F&&F.ch.length)window._luFixMsg=`Asystent zmienił skład na ten mecz (limit obcokrajowców: ${F.mx} na boisku): ${F.ch.map(c=>`<b>${esc(c.inn.last)}</b> za ${esc(c.out.last)}`).join(', ')}.`;
  const hl=healthyLineup(TEAMS[i],myLineup());if(hl.ch.length)window._luInjMsg=`Kontuzje: ${hl.ch.map(([p,c])=>`<b>${esc(c.last)}</b> za ${esc(p?p.last:'—')}`).join(', ')}.`;}}catch(e){}return r;};}
{const _bm=buildMatch;buildMatch=function(ctx){window._luFixMsg=null;window._luInjMsg=null;const m=_bm.apply(this,arguments);try{if(window._luInjMsg)m.log.push({t:'🚑 '+window._luInjMsg,c:'sys'});if(window._luFixMsg)m.log.push({t:'🌍 '+window._luFixMsg,c:'sys'});}catch(e){}window._luFixMsg=null;window._luInjMsg=null;return m;};}
// ławka w meczu: oznaczenie obcokrajowców i zawodników, których limit nie wpuści za wybranego
{const _fb=fmBench;fmBench=function(m){let h=_fb.apply(this,arguments);try{const a=m.sides[0];const mx=tmMaxF(a.team);const sel=ui.subSel;if(mx==null||!h)return h;
  const outP=sel==null||sel==='srv'?(sel==='srv'?a.slots[nextServerSlot(m,0)].p:null):(sel==='L'?a.libero:a.slots[sel].p);
  for(const p of benchOf(a)){if(!isForeign(p,a.team))continue;const blocked=outP&&!sideForOK(a,outP,p);const key=`onclick="${''}`;
    const re=new RegExp(`(<div class="fmbp clk[^"]*")( onclick="[^"]*'${p.id}'\\)")`);
    h=h.replace(re,(x,a1,a2)=>blocked?`${a1.replace('fmbp clk','fmbp clk forblk')} onclick="ui.forMsg='${esc(p.last)} nie może wejść: ${forRuleTxt(myLg())}. Obcokrajowca można wpuścić tylko za obcokrajowca.';render()"`:x);
    h=h.replace(new RegExp(`(<b class="fmnm">${esc(shortN(p)).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</b>)`),`$1 <span title="Obcokrajowiec" class="forb">🌍</span>`);}
  const n=benchOf(a).length;h=h.replace('<b>Ławka</b>',`<b>Ławka</b> <span class="small mut">(${n})</span>`);
  if(ui.forMsg){h=h.replace('<div class="fmsi"><b>Ławka</b>',`<div class="fmsi"><div class="small bad" style="margin-bottom:4px">${ui.forMsg}</div><b>Ławka</b>`);}}catch(e){console.error(e);}return h;};}
{const _ds=doSub;doSub=function(pid){ui.forMsg=null;const m=ui.match;const r=_ds.apply(this,arguments);try{const lg=m&&m.log[m.log.length-1];if(lg&&/Zmiana niemożliwa/.test(lg.t)){ui.forMsg=lg.t;render();}}catch(e){}return r;};}
{const _ss=selSub;selSub=function(){ui.forMsg=null;return _ss.apply(this,arguments);};}

// nowy klub: kadra musi zmieścić się w limicie obcokrajowców (najwyżej 3 obcokrajowców, reszta z kraju ligi)
{const _fc=foundClub;foundClub=function(){const r=_fc.apply(this,arguments);try{const t=myTeam();const c=LG_C[SAVE.lg[t.idx]];const fs=t.players.filter(p=>p.nat!==c);const keep=fs.filter(p=>p.star).concat(fs.filter(p=>!p.star)).slice(0,3);
  const conv=p=>{const [f,l]=natName(c);p.nat=c;p.first=f;p.last=l;};for(const p of fs)if(!keep.includes(p))conv(p);
  for(const pos of ['R','A','P','S','L']){const ps=t.players.filter(p=>p.pos===pos);if(ps.length&&!ps.some(p=>p.nat===c)){const x=ps.find(p=>!p.star);if(x)conv(x);}}SAVE.lineup=lineupFix(t,autoLineup(t));save();}catch(e){console.error(e);}return r;};}
