// ================= PANELE ZAWODNIKÓW, MORALE, PRZEMOWY =================
function kitColors(m){const c0=m.sides[0].team.color,c1=m.sides[1].team.color;if(cdist(c0,c1)>=110)return [c0,c1];
  const homeLeft=m.homeIdx==null||m.homeIdx===m.sides[0].team.idx;const away=homeLeft?1:0;const hc=away?c0:c1;const alt=lum(hc)>0.7?'#111827':'#f1f5f9';
  return away?[c0,alt]:[alt,c1];}
function morLabel(v){return v>=80?'świetne':v>=62?'dobre':v>=45?'słabe':'złe';}
function morCol(v){return v>=80?'#22c55e':v>=62?'#84cc16':v>=45?'#eab308':'#ef4444';}
function bar(v,col){return `<span class="pbar2"><i style="width:${Math.max(0,Math.min(100,v))}%;background:${col}"></i></span>`;}
function playersPanel(m,i){
  const sd=m.sides[i],mine=i===0,kc=kitColors(m)[i];
  const oc=onCourt(sd,m.serving===i);const onIds=new Set(oc.map(e=>e.p.id));
  const bench=sd.pl.filter(p=>!onIds.has(p.id));
  const del=ui.talkRes&&mine?ui.talkRes.del:null;
  const row=(p,e)=>{const x=p.st,pts=x.kill+x.blk+x.ace,err=x.attErr+x.srvErr;const mor=p.mor==null?60:p.mor;
    const click=mine&&!m.over?(e?`onclick="selSub(${e.slot==='L'?"'L'":e.slot})"`:(ui.subSel!=null?`onclick="doSub('${p.id}')"`:'')):'';
    const d=del&&del[p.id]!=null?del[p.id]:null;
    return `<div class="prow ${e?'on':'bench'} ${click?'clk':''} ${!e&&mine&&ui.subSel!=null?'pick':''}" ${click}>
      <div class="pf">${faceSvg(p.id,{size:30,age:p.age,color:kc,kind:'player'})}<span class="pn2" style="background:${e&&e.role==='L'?libColor(kc,'#000'):kc};color:${lum(e&&e.role==='L'?libColor(kc,'#000'):kc)>0.6?'#111':'#fff'}">${p.num}</span></div>
      <div class="pm"><div class="pnm"><b>${esc(p.last)}</b> <small class="mut">${POS_SHORT[e?e.role:p.pos]}${e?'':' · ławka'}</small>${d!=null&&d!==0?` <span class="dlt ${d>0?'good':'bad'}">${d>0?'+':''}${d}</span>`:''}</div>
        <div class="pbars"><span title="Kondycja ${Math.round(p.en)}%">⚡${bar(p.en,p.en>75?'#22c55e':p.en>55?'#eab308':'#ef4444')}</span><span title="Morale: ${morLabel(mor)} (${mor})">${mor>=62?'😀':mor>=45?'😐':'😟'}${bar(mor,morCol(mor))}</span></div>
        <div class="pst">${pts} pkt · atak ${x.kill}/${x.att}${x.blk?` · blok ${x.blk}`:''}${x.ace?` · as ${x.ace}`:''}${x.rec?` · przyj. ${pc(x.recPos,x.rec)}`:''}${x.dig?` · obr. ${x.dig}`:''}${err?` · <span class="bad">bł. ${err}</span>`:''}</div></div></div>`;};
  const avgM=Math.round(oc.reduce((s,e)=>s+(e.p.mor==null?60:e.p.mor),0)/oc.length);
  return `<div class="card ppanel ${mine&&ui.subSel!=null?'subbing':''}" style="border-top:3px solid ${kc}"><div class="row"><b>${mine?'Twoi zawodnicy':esc(sd.team.name)}</b><span class="sp"></span><span class="small mut" title="Średnie morale na boisku">morale ${avgM} ${avgM>=62?'😀':avgM>=45?'😐':'😟'}</span></div>
   ${mine&&sd.tmp&&sd.tmp.n>0?`<div class="small tmpb">📋 ${esc(TALK_TMP[sd.tmp.k]||'')} — jeszcze ${sd.tmp.n} akcji</div>`:''}
   ${oc.map(e=>row(e.p,e)).join('')}<div class="small mut benchh">Ławka</div>${bench.map(p=>row(p,null)).join('')||'<div class="small mut">brak</div>'}</div>`;}
// ---- przemowy ----
const TALK_TMP={srv:'Ryzykowna zagrywka',rec:'Skupienie na przyjęciu',target:'Zagrywka w słabszego przyjmującego'};
function weakestReceiver(m){const oc=onCourt(m.sides[1],m.serving===1).filter(e=>e.role==='L'||e.role==='P');return oc.map(e=>e.p).sort((a,b)=>(a.prz+a.tod)-(b.prz+b.tod))[0];}
function talkList(m){const w=weakestReceiver(m);return [
  ['belief','Wierzę w was!','Słowa otuchy. Siła zależy od Twojej motywacji. Najbardziej pomaga, gdy przegrywacie i gdy morale jest niskie.'],
  ['calm','Spokojnie, gramy swoje','Uspokaja zespół. Najbardziej pomaga nerwowym zawodnikom (niskie opanowanie) i tym z niskim morale.'],
  ['rage','Obudźcie się! Tak się nie gra!','Ostra reprymenda. Waleczni i zaangażowani się nakręcą, nerwowi mogą się spiąć. Lepiej działa przy dużym autorytecie trenera.'],
  ['srv','Ryzykujcie na zagrywce!','Przez kilka akcji mocniejsza zagrywka: więcej asów, ale i więcej błędów.'],
  ['rec','Skupcie się na przyjęciu','Przez kilka akcji lepsze przyjęcie. Spokój dla przyjmujących i libero.'],
  ['target',`Zagrywka w ${w?w.last:'słabszego przyjmującego'}`,`Przez kilka akcji serwujecie w najsłabiej przyjmującego rywala${w?` (${w.last}, przyjęcie ${w.prz})`:''}.`]];}
function myTimeout(){const m=ui.match;if(!m||m.over)return;if(callTimeout(m,0)){m.log.push({t:`Czas dla ${esc(m.sides[0].team.name)}.`,c:'sys'});m.paused=true;ui.talk=true;ui.talkRes=null;persistLive();}render();}
function applyTalk(k){const m=ui.match;if(!m)return;const s=m.sides[0];const oc=onCourt(s,m.serving===0).map(e=>e.p);
  const behind=m.score[1]-m.score[0];const mot=cA('mot'),aut=cA('aut'),tak=cA('tak');const amp=0.8+aut/50;const dur=5+Math.floor(tak/4);const del={};
  for(const p of oc){const mor=p.mor==null?60:p.mor;let d=0;
    if(k==='belief')d=2+(mot-10)*0.5+(behind>=3?3:0)+(mor<50?2:0);
    if(k==='calm')d=1+(60-mor)*0.12+(12-p.opa)*0.45;
    if(k==='rage')d=((p.wal+p.zaa)/2-10.5)*1.1+(aut-10)*0.5-(p.opa<9?3:0);
    if(k==='srv')d=p.zag>=13?2:0;
    if(k==='rec')d=(p.pos==='L'||p.pos==='P')?2:0;
    if(k==='target')d=1;
    d=Math.round(d*amp+(R()-0.5)*2);addMor(p,d);del[p.id]=d;}
  if(k==='srv'||k==='rec')s.tmp={k,n:dur};
  if(k==='target'){const t=weakestReceiver(m);if(t)s.tmp={k:'target',n:dur,id:t.id};}
  const t=talkList(m).find(x=>x[0]===k);const up=Object.values(del).filter(d=>d>0).length,dn=Object.values(del).filter(d=>d<0).length;
  m.log.push({t:`🗣️ ${esc(coach()?coach().last:'Trener')}: „${esc(t[1])}” — ${up} zawodników podbudowanych${dn?`, ${dn} spiętych`:''}.`,c:'sys'});
  ui.talk=false;ui.talkRes={k,del};persistLive();render();}
function talkCard(m){return `<div class="card talk"><div class="row"><h3 style="margin:0">⏱ Czas — co mówisz zawodnikom?</h3><span class="sp"></span><button class="ghost" onclick="ui.talk=false;render()">Bez przemowy</button></div>
  <p class="small mut">Każdy zawodnik reaguje inaczej (zależy od jego cech mentalnych i Twoich atrybutów trenera). Reakcje zobaczysz przy nazwiskach w panelu.</p>
  <div class="opts">${talkList(m).map(([k,n,d])=>`<button class="opt" onclick="applyTalk('${k}')"><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join('')}</div></div>`;}
