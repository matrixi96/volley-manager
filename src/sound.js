// ================= DŹWIĘK: syntezowane w Web Audio (bez plików, bez licencji) =================
// SND.cfg (zapisywane w localStorage 'vm_snd'): on – dźwięk włączony, vol – głośność 0..1, match – dźwięki meczu, ui – powiadomienia
const SND={ctx:null,master:null,mb:null,ub:null,noise:null,amb:null,cfg:null,lastMail:0,lastR:0,fast:0,timers:[]};
function sndCfg(){if(SND.cfg)return SND.cfg;let c=null;try{c=JSON.parse(localStorage.getItem('vm_snd'));}catch(e){}SND.cfg=Object.assign({on:1,vol:0.7,match:1,ui:1},c||{});return SND.cfg;}
function sndSave(){try{localStorage.setItem('vm_snd',JSON.stringify(sndCfg()));}catch(e){}}
function sndSet(k,v){const c=sndCfg();c[k]=v;sndSave();if(SND.master)SND.master.gain.value=c.on?c.vol:0;if(k==='on'&&!v)sndAmbStop();if(k==='match'&&!v)sndAmbStop();render();}
function sndInit(){if(SND.ctx)return SND.ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{SND.ctx=new AC();}catch(e){return null;}
  const x=SND.ctx;SND.master=x.createGain();SND.master.gain.value=sndCfg().on?sndCfg().vol:0;const cp=x.createDynamicsCompressor();cp.threshold.value=-10;cp.ratio.value=8;cp.attack.value=0.003;cp.release.value=0.2;SND.master.connect(cp);cp.connect(x.destination);
  SND.mb=x.createGain();SND.mb.gain.value=1;SND.mb.connect(SND.master);SND.ub=x.createGain();SND.ub.gain.value=0.8;SND.ub.connect(SND.master);
  const b=x.createBuffer(1,x.sampleRate*2,x.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.noise=b;return x;}
// kontekst audio można uruchomić dopiero po geście gracza (zasada przeglądarek)
if(document.addEventListener){const unlock=()=>{const x=sndInit();if(x&&x.state==='suspended')x.resume().catch(()=>{});};document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);}
function sndOk(kind){const c=sndCfg();if(!c.on||!SND.ctx||SND.ctx.state!=='running')return false;return kind==='ui'?!!c.ui:!!c.match;}
function sndT(){return SND.ctx.currentTime;}
// --- klocki ---
function sTone(bus,f0,f1,dur,g,type,at){const x=SND.ctx,t=at||sndT();const o=x.createOscillator(),v=x.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(g,t+0.005);v.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(v);v.connect(bus);o.start(t);o.stop(t+dur+0.02);}
function sNoise(bus,dur,g,ftype,freq,q,at,att){const x=SND.ctx,t=at||sndT();const s=x.createBufferSource();s.buffer=SND.noise;const f=x.createBiquadFilter();f.type=ftype||'lowpass';f.frequency.value=freq||1000;f.Q.value=q||0.7;const v=x.createGain();
  v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(g,t+(att||0.004));v.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(v);v.connect(bus);s.start(t,Math.random()*1.5);s.stop(t+dur+0.05);}
// --- odgłosy piłki ---
const SND_HIT={
 serve:g=>{sTone(SND.mb,190,80,0.09,0.55*g);sNoise(SND.mb,0.05,0.35*g,'highpass',900);},
 spike:g=>{sTone(SND.mb,160,55,0.12,0.8*g);sNoise(SND.mb,0.07,0.6*g,'highpass',700);sNoise(SND.mb,0.03,0.3*g,'bandpass',2500,1.2);},
 tip:g=>{sTone(SND.mb,260,180,0.05,0.25*g);},
 bump:g=>{sTone(SND.mb,200,95,0.08,0.45*g);sNoise(SND.mb,0.04,0.18*g,'lowpass',1300);},
 set:g=>{sTone(SND.mb,330,230,0.05,0.28*g);sNoise(SND.mb,0.025,0.08*g,'bandpass',2200,1);},
 block:g=>{sTone(SND.mb,150,60,0.11,0.7*g);sNoise(SND.mb,0.06,0.45*g,'lowpass',1800);const t=sndT()+0.035;sTone(SND.mb,170,70,0.08,0.35*g,'sine',t);},
 floor:g=>{sTone(SND.mb,95,42,0.16,0.75*g);sNoise(SND.mb,0.09,0.3*g,'lowpass',650);},
 net:g=>{sNoise(SND.mb,0.28,0.18*g,'bandpass',3200,0.9,null,0.01);sTone(SND.mb,120,90,0.08,0.15*g);},
};
function sndHit(k,g){if(!sndOk('match'))return;try{(SND_HIT[k]||SND_HIT.bump)(g==null?1:g);}catch(e){}}
// gwizdek: dwa bliskie tony z „trelem” (kulka w gwizdku)
function sndWhistle(len,n){if(!sndOk('match'))return;const x=SND.ctx;let t=sndT()+0.02;for(let k=0;k<(n||1);k++){const d=len||0.32;
  for(const f of [2750,2830]){const o=x.createOscillator(),v=x.createGain(),l=x.createOscillator(),lg=x.createGain();o.frequency.value=f;l.frequency.value=34;lg.gain.value=60;l.connect(lg);lg.connect(o.frequency);
    v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(0.09,t+0.02);v.gain.setValueAtTime(0.09,t+d-0.05);v.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(v);v.connect(SND.mb);o.start(t);l.start(t);o.stop(t+d+0.02);l.stop(t+d+0.02);}
  t+=d+0.12;}}
// kibice: tło (szum hali) + okrzyki + oklaski
function sndCrowdF(m){const a=(m&&m.att)||800;return clamp(0.35+a/4000,0.35,1.3);}
function sndAmbStart(m){if(!sndOk('match')||SND.amb)return;const x=SND.ctx;const s=x.createBufferSource();s.buffer=SND.noise;s.loop=true;const f=x.createBiquadFilter();f.type='bandpass';f.frequency.value=650;f.Q.value=0.5;
  const f2=x.createBiquadFilter();f2.type='lowpass';f2.frequency.value=1500;const v=x.createGain();v.gain.value=0.0001;s.connect(f);f.connect(f2);f2.connect(v);v.connect(SND.mb);s.start();
  SND.amb={s,v,base:0.018*sndCrowdF(m)};v.gain.exponentialRampToValueAtTime(SND.amb.base,sndT()+1.5);}
function sndAmbLevel(mult,dur){const A=SND.amb;if(!A||!SND.ctx)return;const t=sndT();A.v.gain.cancelScheduledValues(t);A.v.gain.setValueAtTime(Math.max(0.0001,A.v.gain.value),t);A.v.gain.linearRampToValueAtTime(A.base*mult,t+(dur||0.6));}
function sndAmbStop(){const A=SND.amb;if(!A)return;SND.amb=null;try{const t=SND.ctx.currentTime;A.v.gain.cancelScheduledValues(t);A.v.gain.setValueAtTime(Math.max(0.0001,A.v.gain.value),t);A.v.gain.exponentialRampToValueAtTime(0.0001,t+0.8);A.s.stop(t+0.9);}catch(e){}}
function sndCheer(power,claps){if(!sndOk('match'))return;const p=clamp(power,0.2,2);const t=sndT();
  sNoise(SND.mb,1.1+p*0.7,0.09*p,'bandpass',900,0.6,t,0.12);sNoise(SND.mb,0.9+p*0.5,0.05*p,'bandpass',1700,0.8,t+0.05,0.1);
  const n=Math.round((claps||0)*p);for(let i=0;i<n;i++)sNoise(SND.mb,0.03,0.05*p*(0.5+Math.random()),'bandpass',1500+Math.random()*1500,1.5,t+0.2+Math.random()*1.6,0.002);}
function sndGroan(power){if(!sndOk('match'))return;sNoise(SND.mb,0.9,0.05*clamp(power,0.2,1.5),'lowpass',450,0.7,null,0.15);}
// --- przebieg akcji: kontakty z piłką zsynchronizowane z animacją (z obsługą pauzy) ---
function sndClear(){for(const h of SND.timers)clearInterval(h);SND.timers=[];}
function sndSteps(m,ev,steps,in3d){SND.animEv=ev;SND.after=null;if(!sndOk('match')||!ev||!ev.seq)return;sndAmbStart(m);sndClear();SND.q=null;
  // lista kontaktów z piłką: [moment końca kroku, dźwięk, głośność]
  const cs=[];const s0=ev.seq[0];cs.push([0,s0&&s0.k==='srv'?'serve':null,0.9]);let t=0;
  steps.forEach((st,i)=>{t+=st.dur||0;const s=st.s||{};const k=st.k||s.k;let snd=null,g=1;
    if(k==='rec')snd='bump';else if(k==='ace')snd=s.sh?'bump':'floor';else if(k==='set')snd='set';else if(k==='att')snd=s.d==='tip'?'tip':'spike';else if(k==='free')snd='bump';
    else if(k==='dig')snd='bump';else if(k==='blk')snd='block';else if(k==='floor'||k==='out')snd='floor',g=k==='out'?0.6:1;else if(k==='net')snd='net';else if(k==='mix')snd='floor';
    if(!k&&i===steps.length-1)snd='floor';cs.push([t,snd,g]);});
  const home=m.ctx?m.sides.findIndex(x=>x.team&&x.team.idx===m.ctx.h):0;const homeWon=ev.winner===home;const cf=sndCrowdF(m);const big=ev.type==='ace'||ev.type==='block'||steps.length>7;
  const fin=()=>{const af=SND.after;SND.after=null;if(af)setTimeout(af,700);sndWhistle(0.38);setTimeout(()=>{if(homeWon){sndCheer(cf*(big?1.4:1),big?40:18);}else{sndGroan(cf*0.8);sndCheer(cf*0.35,6);}sndAmbLevel(1,1.5);},160);};
  const play=c=>{if(c&&c[1])sndHit(c[1],c[2]);};
  if(in3d){const ls=steps[steps.length-1]||{};SND.q={m,cs,j:0,fin,ended:0,lastPh:ls.ph,lastDur:ls.dur||400};return;}// w 3D dźwięki wyzwalają zdarzenia animacji (sndPh / sndDone)
  const plan=cs.map(c=>[c[0],c[1],c[2]]);plan.push([t+80,'_fin',0]);let el=-(ui.speed>=1600?750:450),last=performance.now(),k=0;const swellAt=cs[3]?cs[3][0]:1e9;let sw=0;
  const h=setInterval(()=>{const now=performance.now();if(!m.paused)el+=now-last;last=now;if(!sw&&el>=swellAt){sw=1;sndAmbLevel(1.8,1.2);}
    while(k<plan.length&&plan[k][0]<=el){const c=plan[k++];if(c[1]==='_fin')fin();else play(c);}
    if(k>=plan.length||ui.match!==m){clearInterval(h);SND.timers=SND.timers.filter(x=>x!==h);}},20);SND.timers.push(h);}
// gwizdek sędziego pozwalający na zagrywkę; zwraca opóźnienie (ms), o jakie animacja czeka na zagrywkę
function sndServeWhistle(m){if(!sndOk('match'))return 0;sndWhistle(0.34);return ui.speed>=1600?750:450;}
// 3D: każda zmiana opisu fazy = początek kolejnego kroku (czyli kontakt kończący poprzedni krok); opis z wynikiem akcji = piłka na boisku
function sndPh(ph,label){const Q=SND.q;if(!Q||Q.ended)return;if(ph&&label&&ph===label){while(Q.j<Q.cs.length){const c=Q.cs[Q.j++];if(Q.j===Q.cs.length&&c[1])sndHit(c[1],c[2]);}Q.ended=1;setTimeout(Q.fin,120);return;}
  const c=Q.cs[Q.j++];if(c&&c[1])sndHit(c[1],c[2]);if(Q.j===3)sndAmbLevel(1.8,1.2);
  // początek ostatniego kroku: po jego czasie piłka ląduje — wtedy dźwięk kontaktu, gwizdek i kibice (nie czekamy na koniec animacji ani na pauzę)
  if(!Q.arm&&(Q.j>=Q.cs.length-1||ph===Q.lastPh)){Q.arm=1;let el=0,last=performance.now();const h=setInterval(()=>{const now=performance.now();if(!Q.m.paused)el+=now-last;last=now;
    if(Q.ended||SND.q!==Q){clearInterval(h);return;}if(el>=Q.lastDur){clearInterval(h);Q.ended=1;const f=Q.cs[Q.cs.length-1];if(f&&f[1])sndHit(f[1],f[2]);Q.fin();}},25);SND.timers.push(h);}}
function sndDone(){const Q=SND.q;if(!Q||Q.ended)return;Q.ended=1;const c=Q.cs[Q.cs.length-1];if(c&&c[1]&&Q.j<Q.cs.length)sndHit(c[1],c[2]);Q.fin();}
// akcja bez animacji (widok klasyczny / szybkie tempo): tylko gwizdek i reakcja kibiców
function sndPoint(m,ev){if(!sndOk('match')||!ev)return;sndAmbStart(m);const home=m.ctx?m.sides.findIndex(x=>x.team&&x.team.idx===m.ctx.h):0;const cf=sndCrowdF(m);
  sndWhistle(0.22);setTimeout(()=>{if(ev.winner===home)sndCheer(cf*0.8,10);else sndGroan(cf*0.6);},120);}
// koniec seta / meczu
function sndSetEnd(m,won){if(!sndOk('match'))return;sndWhistle(0.55,2);setTimeout(()=>sndCheer(sndCrowdF(m)*(won?1.6:0.6),won?60:15),400);}
function sndMatchEnd(m,won){if(!sndOk('match'))return;sndWhistle(0.5,3);setTimeout(()=>{sndCheer(sndCrowdF(m)*(won?1.9:0.5),won?110:25);if(won)setTimeout(()=>sndCheer(sndCrowdF(m)*1.2,80),1500);},500);setTimeout(sndAmbStop,4500);}
// --- interfejs: nowa wiadomość ---
function sndMail(important){if(!sndOk('ui'))return;const now=performance.now();if(now-SND.lastMail<1500)return;SND.lastMail=now;const t=sndT()+0.01;
  if(important){sTone(SND.ub,1047,1047,0.16,0.12,'sine',t);sTone(SND.ub,1319,1319,0.16,0.12,'sine',t+0.11);sTone(SND.ub,1568,1568,0.28,0.12,'sine',t+0.22);}
  else{sTone(SND.ub,1319,1319,0.14,0.09,'sine',t);sTone(SND.ub,1760,1760,0.22,0.09,'sine',t+0.1);}}
// --- podpięcia ---
{const _sm=sendMail;sendMail=function(o){const r=_sm.apply(this,arguments);try{if(r!==null&&o&&!(window._dlgPrep)){const imp=o.cat==='zarz'||o.cat==='trans'||!!o.act;sndMail(imp);}}catch(e){}return r;};}
{const _dr=doRally;doRally=function(m,skipAI){const sl=m.sets.length;const r=_dr.apply(this,arguments);
  try{if(!m.quick&&ui.match===m&&SND.ctx){const now=performance.now();const fast=now-SND.lastR<250;SND.lastR=now;
    const me=m.sides.findIndex(x=>x.team&&x.team.idx===SAVE.team);let endFn=null;
    if(m.over){const w0=m.sets.filter(x=>x[0]>x[1]).length;const won=(w0>m.sets.length-w0)===(me!==1);endFn=()=>sndMatchEnd(m,won);}
    else if(m.sets.length>sl){const ls=m.sets[m.sets.length-1];const won=me===1?ls[1]>ls[0]:ls[0]>ls[1];endFn=()=>sndSetEnd(m,won);}
    if(fast){sndAmbStop();if(m.over)setTimeout(endFn,200);}
    // czekamy chwilę: jeśli ta akcja będzie animowana (2D albo 3D), dźwięki końca zagrają dopiero po animacji
    else setTimeout(()=>{if(SND.animEv===r){SND.after=endFn;}else{sndPoint(m,r);if(endFn)setTimeout(endFn,500);}},0);}}catch(e){}
  return r;};}
// widok klasyczny z animacją piłki: gwizdek i reakcja kibiców dopiero po zakończeniu animacji
{const _ar=animateRally;animateRally=function(ev,done){SND.animEv=ev;SND.after=null;const m=ui.match;return _ar.call(this,ev,function(){try{if(m&&SND.ctx){sndPoint(m,ev);const af=SND.after;SND.after=null;if(af)setTimeout(af,500);}}catch(e){}return done.apply(this,arguments);});};}
// tło kibiców gaśnie po wyjściu z meczu
setInterval(()=>{if(SND.amb&&(!ui.match||ui.match.over&&!SND.timers.length||ui.tab!=='mecz'||ui.match.paused&&ui.to==null))sndAmbStop();},1000);
// --- ustawienia ---
function sndBtn(){const c=sndCfg();return `<button class="ghost sm" title="Dźwięk" onclick="sndInit();sndSet('on',${c.on?0:1})">${c.on?'🔊':'🔇'}</button>`;}
function sndCard(){const c=sndCfg();return `<div class="card"><h2>${_t('Dźwięk')}</h2>
  <div class="row wrap" style="gap:14px;align-items:center"><label class="row" style="gap:6px"><input type="checkbox" ${c.on?'checked':''} onchange="sndInit();sndSet('on',this.checked?1:0)">${' '+_t('Dźwięk włączony')}</label>
  <label class="row" style="gap:6px">${_t('Głośność')} <input type="range" min="0" max="100" value="${Math.round(c.vol*100)}" onchange="sndSet('vol',this.value/100)"></label></div>
  <div class="row wrap" style="gap:14px;margin-top:8px"><label class="row" style="gap:6px"><input type="checkbox" ${c.match?'checked':''} onchange="sndSet('match',this.checked?1:0)">${' '+_t('Dźwięki meczu (piłka, gwizdek, kibice)')}</label>
  <label class="row" style="gap:6px"><input type="checkbox" ${c.ui?'checked':''} onchange="sndSet('ui',this.checked?1:0)">${' '+_t('Powiadomienia (nowa wiadomość)')}</label>
  <button class="ghost sm" onclick="sndInit();setTimeout(()=>{sndHit('serve');setTimeout(()=>sndHit('bump'),500);setTimeout(()=>sndHit('set'),900);setTimeout(()=>sndHit('spike'),1300);setTimeout(()=>sndHit('floor'),1650);setTimeout(()=>sndWhistle(0.3),1900);setTimeout(()=>sndCheer(1,25),2100);},50)">${_t('▶ Posłuchaj')}</button></div>
  <p class="small mut">${_t('Dźwięki są generowane w grze. Szybka symulacja meczu jest cicha.')}</p></div>`;}
{const _sv=saveView;saveView=function(){return sndCard()+_sv.apply(this,arguments);};}
