// ================= WIDOK HALI (canvas) =================
const MV={W:680,H:440,SC:20};MV.CX=340;MV.CY=222;MV.X0=MV.CX-9*MV.SC;MV.Y0=MV.CY-4.5*MV.SC;
const MV_ROWS=[2,3,4,5,7];
const ZXY=[[2.6,7.4],[7.6,7.4],[7.6,4.5],[7.6,1.6],[2.6,1.6],[2.6,4.5]];
function mvP(x,y){return [MV.X0+x*MV.SC,MV.Y0+y*MV.SC];}
function gl(i,x,y){return i===0?[x,y]:[18-x,9-y];}
function isFrontZ(z){return z>=1&&z<=3;}
// ---- frekwencja meczu ----
function matchCrowd(m){const c=m.ctx;if(!c)return;const home=c.h;const L=infraOf(home).hala;const rep=SAVE.ai[home].rep;
  const k=c.kind==='spar'?0.35:c.kind==='po'?1.5:1;
  m.hallLv=L;m.cap=HALA_CAP[L-1];m.homeIdx=home;m.att=Math.min(m.cap,Math.round((1400+rep*25)*(1+0.05*(L-1))*(0.85+R()*0.3)*k));m.mid=m.mid||('m'+Math.floor(R()*1e9));}
// ---- formacja przed zagrywką ----
function formation(m){
  const out=[];
  for(let i=0;i<2;i++){const sv=m.serving===i;const oc=onCourt(m.sides[i],sv);const loc=[];
    for(const e of oc){let [x,y]=ZXY[e.zone];const fr=isFrontZ(e.zone);
      if(sv){if(e.zone===0){x=-1.3;y=7.4;}else if(fr)x=8.0;else x=3.3;}
      else{if(e.role==='R')x=fr?8.1:6.3,y=fr?y:8.0;else if(e.role==='L'||e.role==='P')x=fr?5.1:3.6;else x=fr?8.1:1.9;}
      loc.push({id:e.p.id,i,role:e.role,p:e.p,zone:e.zone,slot:e.slot,x,y});}
    if(!sv){const rec=loc.filter(o=>o.role==='L'||(o.role==='P'&&o.x<6)).sort((a,b)=>a.y-b.y);const lanes=rec.length>=3?[1.8,4.5,7.1]:[2.8,6.3];rec.slice(0,lanes.length).forEach((o,k)=>{o.y=lanes[k];});}
    for(const o of loc){const [X,Y]=gl(i,o.x,o.y);o.x=X;o.y=Y;out.push(o);}}
  return out;}
// ---- trybuny (cache) ----
function standsCanvas(m){
  if(ui._stand&&ui._stand.mid===m.mid)return ui._stand.cv;
  const dpr=Math.min(2,window.devicePixelRatio||1);const cv=document.createElement('canvas');cv.width=MV.W*dpr;cv.height=MV.H*dpr;const g=cv.getContext('2d');g.scale(dpr,dpr);
  const r=mulberry32(strSeed(m.mid));const lv=m.hallLv||1,rows=MV_ROWS[lv-1],sp=11;
  const home=TEAMS[m.homeIdx!=null?m.homeIdx:m.sides[0].team.idx],away=TEAMS[m.homeIdx===m.sides[0].team.idx?m.sides[1].team.idx:m.sides[0].team.idx];
  g.fillStyle='#161c28';g.fillRect(0,0,MV.W,MV.H);
  const fx0=MV.X0-3*MV.SC,fx1=MV.X0+21*MV.SC,fy0=MV.Y0-3*MV.SC,fy1=MV.Y0+12*MV.SC;
  const seats=[];
  for(let k=0;k<rows;k++){for(let x=fx0+6;x<fx1-4;x+=sp){seats.push([x,fy0-9-k*sp,0]);seats.push([x,fy1+9+k*sp,1]);}
    if(lv>=3)for(let y=fy0+6;y<fy1-4;y+=sp){seats.push([fx0-9-k*sp,y,2]);seats.push([fx1+9+k*sp,y,3]);}}
  // tło trybun
  g.fillStyle='#232b3b';const pad=rows*sp+6;g.fillRect(fx0,fy0-pad,fx1-fx0,pad-2);g.fillRect(fx0,fy1+2,fx1-fx0,pad-2);if(lv>=3){g.fillRect(fx0-pad,fy0,pad-2,fy1-fy0);g.fillRect(fx1+2,fy0,pad-2,fy1-fy0);}
  const fill=m.att/(m.cap||1);const awaySide=m.homeIdx===m.sides[0].team.idx?(lv>=3?3:1):(lv>=3?2:1);
  for(const s of seats){const occ=r()<fill;let col='#2f394c';
    if(occ){const isAway=lv>=3?s[2]===awaySide:(s[2]===1&&s[0]>(m.homeIdx===m.sides[0].team.idx?fx1-120:fx0)&&s[0]<(m.homeIdx===m.sides[0].team.idx?fx1:fx0+120));
      col=isAway?(r()<0.8?away.color:'#e5e7eb'):(r()<0.85?home.color:'#e5e7eb');}
    g.fillStyle=col;g.beginPath();g.arc(s[0],s[1],3.5,0,7);g.fill();}
  // parkiet
  g.fillStyle='#2f5f8f';g.fillRect(fx0,fy0,fx1-fx0,fy1-fy0);
  g.fillStyle='#c9773a';g.fillRect(MV.X0,MV.Y0,18*MV.SC,9*MV.SC);
  g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(MV.X0,MV.Y0,18*MV.SC,9*MV.SC);
  g.beginPath();g.moveTo(MV.X0+6*MV.SC,MV.Y0);g.lineTo(MV.X0+6*MV.SC,MV.Y0+9*MV.SC);g.moveTo(MV.X0+12*MV.SC,MV.Y0);g.lineTo(MV.X0+12*MV.SC,MV.Y0+9*MV.SC);g.stroke();
  // ławki
  g.fillStyle='#0f1520';g.fillRect(MV.X0+1*MV.SC,fy1-14,5*MV.SC,8);g.fillRect(MV.X0+12*MV.SC,fy1-14,5*MV.SC,8);
  g.font='600 10px system-ui,sans-serif';g.textAlign='center';g.fillStyle='#ffffffb0';g.fillText(m.sides[0].team.short,MV.X0+3.5*MV.SC,fy1-17);g.fillText(m.sides[1].team.short,MV.X0+14.5*MV.SC,fy1-17);
  ui._stand={mid:m.mid,cv};return cv;}
// ---- rysowanie ----
function mvView(cv){const w=cv.clientWidth||MV.W;return w<600?{x:MV.X0-3.4*MV.SC,y:MV.Y0-3*MV.SC-30,w:24.8*MV.SC,h:15*MV.SC+60}:{x:0,y:0,w:MV.W,h:MV.H};}
function drawHall(m,scene,ball,flash){
  const cv=document.getElementById('mcv');if(!cv||!cv.getContext)return;const dpr=Math.min(2,window.devicePixelRatio||1);
  const v=mvView(cv);cv.style.aspectRatio=v.w+'/'+v.h;const cw=Math.round((cv.clientWidth||MV.W)*dpr),ch=Math.round(cw*v.h/v.w);
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;}const z=cw/v.w;
  const g=cv.getContext('2d');g.setTransform(z,0,0,z,-v.x*z,-v.y*z);
  g.drawImage(standsCanvas(m),0,0,MV.W,MV.H);
  // siatka
  g.fillStyle='#e5e7eb';g.fillRect(MV.CX-2,MV.Y0-14,4,9*MV.SC+28);g.fillStyle='#111';g.fillRect(MV.CX-5,MV.Y0-18,10,6);g.fillRect(MV.CX-5,MV.Y0+9*MV.SC+12,10,6);
  const [c0,c1]=kitColors(m);
  const ord=scene.slice().sort((a,b)=>a.y-b.y);
  for(const o of ord){const [x,y]=mvP(o.x,o.y);const j=o.j||0;
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+2,y+5,11,5,0,0,7);g.fill();
    const tc=o.i===0?c0:c1,col=o.role==='L'?libColor(tc,o.i===0?c1:c0):tc;const ink=lum(col)>0.6?'#111827':'#fff';
    const R0=11+j*2,yy=y-j*11;
    if(o.hl){g.strokeStyle='#ffb020';g.lineWidth=3;g.beginPath();g.arc(x,yy,R0+3,0,7);g.stroke();}
    g.fillStyle=col;g.beginPath();g.arc(x,yy,R0,0,7);g.fill();g.strokeStyle='#ffffffcc';g.lineWidth=1.5;g.stroke();
    g.fillStyle=ink;g.font='700 11px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(o.p.num,x,yy+0.5);
    g.font='600 9px system-ui,sans-serif';g.fillStyle='#fff';g.textBaseline='top';g.fillText(o.p.last.length>9?o.p.last.slice(0,8)+'.':o.p.last,x,y+13);
    const en=o.p.en==null?100:o.p.en;g.fillStyle='#00000080';g.fillRect(x-10,y+24,20,3);g.fillStyle=en>75?'#22c55e':en>55?'#eab308':'#ef4444';g.fillRect(x-10,y+24,20*en/100,3);}
  if(ball){const [bx,by]=mvP(ball.x,ball.y);g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(bx,by,5.5,2.8,0,0,7);g.fill();
    const yy=by-ball.h*10,rr=5+ball.h*0.9;g.fillStyle='#fff7d6';g.beginPath();g.arc(bx,yy,rr,0,7);g.fill();g.lineWidth=1.4;g.strokeStyle='#1d4ed8';g.beginPath();g.arc(bx,yy,rr*0.62,0.4,2.6);g.stroke();g.strokeStyle='#eab308';g.beginPath();g.arc(bx,yy,rr*0.62,3.5,5.8);g.stroke();}
  if(flash){g.font='800 30px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';const w=g.measureText(flash.t).width+40;g.fillStyle=flash.w===0?'#16a34ae6':'#dc2626e6';g.fillRect(MV.CX-w/2,MV.CY-26,w,52);g.fillStyle='#fff';g.fillText(flash.t,MV.CX,MV.CY+1);}
}
function staticBall(m,scene){const s=scene.find(o=>o.i===m.serving&&o.zone===0);return s?{x:s.x+(m.serving===0?0.35:-0.35),y:s.y,h:2.2}:null;}
function drawHallStatic(){const m=ui.match;if(!m||ui.mview==='klasyczny'||!document.getElementById('mcv'))return;
  const sc=formation(m);ui._scene=sc;drawHall(m,sc,m.over?null:staticBall(m,sc),null);
  const cv=document.getElementById('mcv');cv.onclick=e=>{const r=cv.getBoundingClientRect();const v=mvView(cv);const x=v.x+(e.clientX-r.left)*v.w/r.width,y=v.y+(e.clientY-r.top)*v.h/r.height;
    let best=null,bd=22;for(const o of ui._scene){if(o.i!==0)continue;const [px,py]=mvP(o.x,o.y);const d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best=o;}}
    if(best&&!m.over)selSub(best.slot==='L'?'L':best.slot);};}
// ---- animacja akcji ----
function lane(o){if(o.role==='A')return 7.8;if(o.role==='S')return 4.1;if(o.role==='P')return isFrontZ(o.zone)?1.3:4.6;return 4.5;}
function hallAnim(m,pre,ev,done){
  const cv=document.getElementById('mcv');if(!cv||!ev.seq||!ev.seq.length){done();return;}
  const P={};for(const o of pre)P[o.id]=Object.assign({},o,{j:0});const scene=Object.values(P);
  const side=i=>scene.filter(o=>o.i===i);
  const sf=ui.speed>=1600?1.25:0.72;
  const steps=[];let ball=staticBall(m,pre)||{x:9,y:4.5,h:2};
  const mvTo=(o,lx,ly,j)=>{const [X,Y]=gl(o.i,lx,ly);return {id:o.id,x:X,y:Y,j:j||0};};
  const loc=o=>o.i===0?[o.x,o.y]:[18-o.x,9-o.y];
  const baseDef=(i,moves)=>{for(const o of side(i)){const [lx,ly]=loc(o);const fr=isFrontZ(o.zone);moves.push(mvTo(o,fr?8.2:2.9,ZXY[o.zone][1]));}};
  const seq=ev.seq;let lastAtt=null,lastK='srv';
  for(let t=1;t<seq.length;t++){const s=seq[t];const o=s.id?P[s.id]:null;const moves=[];let to,peak=0,dur=700,ph='';
    if(s.k==='rec'||s.k==='ace'){const rs=s.s,ss=1-rs;baseDef(ss,moves);
      const st=side(rs).find(x=>x.role==='R');if(st&&s.k==='rec')moves.push(mvTo(st,8.2,5.8));
      to={x:o.x+(s.k==='ace'?(rs===0?0.6:-0.6):0),y:o.y+(s.k==='ace'?0.6:0),h:s.k==='ace'?0:0.9};peak=4.3;dur=1050;ph='Zagrywka';}
    else if(s.k==='set'){const i=s.s;const real=o.role==='R';let tx,ty;if(real){[tx,ty]=gl(i,8.2,5.8);moves.push({id:o.id,x:tx,y:ty});}else{tx=o.x;ty=o.y;}
      for(const a of side(i)){if(a.id===o.id||a.role==='L'||a.role==='R')continue;const fr=isFrontZ(a.zone);if(!fr&&a.role!=='A'&&a.role!=='P')continue;moves.push(mvTo(a,fr?5.6:3.9,lane(a)));}
      const d=side(1-i);for(const b of d){const fr=isFrontZ(b.zone);if(b.role==='L'||!fr)moves.push(mvTo(b,b.role==='L'?2.6:3.0,ZXY[b.zone][1]));else moves.push(mvTo(b,8.4,ZXY[b.zone][1]));}
      to={x:tx,y:ty,h:2.4};peak=lastK==='rec'||lastK==='dig'?3.0:1.2;dur=lastK==='dig'?850:900;ph=lastK==='rec'?'Przyjęcie':lastK==='dig'?'Obrona':'Piłka po bloku';}
    else if(s.k==='att'){const i=s.s;const fr=isFrontZ(o.zone);const ly=lane(o);const hit=mvTo(o,fr?8.3:6.0,ly,1);moves.push(hit);
      for(const a of side(i)){if(a.id===o.id||a.role==='L'||a.role==='R'||!isFrontZ(a.zone))continue;moves.push(mvTo(a,8.2,lane(a),0.5));}
      const [hx,hy]=[hit.x,hit.y];const opp=side(1-i).filter(b=>isFrontZ(b.zone)&&b.role!=='L').sort((a,b)=>Math.abs(a.y-hy)-Math.abs(b.y-hy)).slice(0,o.role==='S'?1:2);
      opp.forEach((b,k)=>{const [ly2]=[9-ly];moves.push(mvTo(b,8.5,ly2+(k?(ly2<4.5?0.8:-0.8):0),1));});
      const dl=[1.7,4.5,7.3];side(1-i).filter(b=>!opp.includes(b)&&!isFrontZ(b.zone)).forEach((b,k)=>moves.push(mvTo(b,3.4,dl[k%3])));
      to={x:hx,y:hy,h:3.4};peak=1.6;dur=780;ph=o.role==='R'?'Wystawa':'Rozegranie';lastAtt=o;}
    else if(s.k==='blk'){to={x:o.x,y:o.y,h:3.0};dur=230;ph='Blok!';}
    else if(s.k==='dig'){const dx=(R()-0.5)*1.4,dy=(R()-0.5)*1.4;moves.push({id:o.id,x:o.x+dx,y:o.y+dy});to={x:o.x+dx,y:o.y+dy,h:0.35};dur=430;ph='Atak — obrona';}
    else if(s.k==='floor'){const i=s.s;let lx,ly;if(s.blk){lx=7.4+R()*0.8;ly=lastAtt?lane(lastAtt)+(R()-0.5):4.5;}else{lx=0.6+R()*7.2;ly=0.6+R()*7.8;}const [X,Y]=gl(i,lx,ly);to={x:X,y:Y,h:0};dur=s.blk?520:440;ph=s.blk?'Blok punktowy':'Atak — punkt';}
    else if(s.k==='out'){const i=s.s;const [X,Y]=gl(i,-1.6,0.5+R()*8);to={x:X,y:Y,h:0};dur=lastK==='srv'?1050:480;peak=lastK==='srv'?4.3:0;ph='Aut';}
    else if(s.k==='net'){to={x:9+(R()<0.5?-0.25:0.25),y:1+R()*7,h:1.6};dur=lastK==='srv'?900:420;peak=lastK==='srv'?3.2:0;ph='Siatka';}
    else continue;
    steps.push({to,peak,dur:dur*sf,moves,ph});lastK=s.k;
    if(s.k==='net')steps.push({to:{x:to.x+(to.x<9?-0.4:0.4),y:to.y,h:0},peak:0,dur:300*sf,moves:[],ph:'Siatka'});}
  const label={ace:'AS!',block:'BLOK!',kill:'PUNKT',serr:'BŁĄD ZAGRYWKI',attErr:'BŁĄD ATAKU',setErr:'BŁĄD'}[ev.type]||'PUNKT';
  let k=0;const phEl=()=>document.getElementById('mph');
  const run=()=>{if(!document.getElementById('mcv')){done();return;}
    if(k>=steps.length){drawHall(m,scene,ball,{t:label,w:ev.winner});setTimeout(done,ui.speed>=1600?750:420);return;}
    const st=steps[k++];const from={...ball};const fromP={};for(const o of scene)fromP[o.id]=[o.x,o.y];const tgt={};for(const mv of st.moves)tgt[mv.id]=mv;
    if(phEl())phEl().textContent=st.ph;const t0=performance.now();
    const fr=now=>{const t=Math.min(1,(now-t0)/st.dur),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      ball={x:from.x+(st.to.x-from.x)*t,y:from.y+(st.to.y-from.y)*t,h:from.h+(st.to.h-from.h)*t+st.peak*4*t*(1-t)};
      for(const o of scene){const mv=tgt[o.id];if(!mv){o.j=0;continue;}const f=fromP[o.id];o.x=f[0]+(mv.x-f[0])*e;o.y=f[1]+(mv.y-f[1])*e;o.j=mv.j?Math.sin(Math.PI*Math.min(1,t*1.15))*mv.j:0;}
      drawHall(m,scene,ball,null);if(t<1)requestAnimationFrame(fr);else run();};
    requestAnimationFrame(fr);};
  run();
}
