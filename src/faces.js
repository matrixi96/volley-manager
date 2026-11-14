// ================= TWARZE (generowane z id) =================
const SKINS=['#f8d9c0','#f1c8a8','#e8b892','#d9a077','#c48a5e','#9c6644','#6f4a33'];
const SKIN_W=[18,22,22,15,9,6,4];
const HAIRC=['#1c1917','#2d1f16','#4a3222','#6b4a2e','#8d6b48','#c8a165','#b45309','#9ca3af'];
const HAIRC_W=[16,20,18,14,10,9,4,0];
const EYEC=['#5b3a1e','#3f6e9e','#4b7a4d','#6b7280','#2a1a10'];
function strSeed(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function wPick(r,arr,w){let t=w.reduce((a,b)=>a+b,0),x=r()*t;for(let i=0;i<arr.length;i++){x-=w[i];if(x<=0)return arr[i];}return arr[arr.length-1];}
function faceSvg(seed,o){
  o=o||{};const r=mulberry32(strSeed(seed));const size=o.size||48;const age=o.age||25;const jersey=o.color||'#3b82f6';
  const skin=o.skin!=null?SKINS[o.skin]:wPick(r,SKINS,SKIN_W);
  let hairC=wPick(r,HAIRC,HAIRC_W);if(age>=45&&r()<(age-40)/30)hairC=age>=58?'#d1d5db':'#9ca3af';
  const eyeC=EYEC[Math.floor(r()*EYEC.length)];
  const fw=25+r()*6,fh=31+r()*5,jaw=r();const cx=50,cy=46;
  const hairStyle=age>=50&&r()<0.25?0:Math.floor(r()*8);
  const beard=o.kind==='junior'?(r()<0.08?1:0):Math.floor(r()*(age>=30?6:4.5)); // 0 brak,1 zarost,2 broda,3 kozia,4 wąsy,5 pełna
  const band=o.kind==='player'&&r()<0.18;
  const brow=1.6+r()*1.8,browTilt=(r()-0.5)*4;
  const eyeY=cy-2+r()*3,eyeDx=9+r()*2.5,eyeR=2.4+r()*0.8;
  const noseT=Math.floor(r()*3),mouthT=Math.floor(r()*4);
  const dark=c=>{const n=parseInt(c.slice(1),16);return `rgb(${[n>>16,n>>8&255,n&255].map(v=>Math.round(v*0.78)).join(',')})`;};
  let s=`<svg class="face" viewBox="0 0 100 100" width="${size}" height="${size}"><defs><clipPath id="fc${strSeed(seed)%99999}"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#fc${strSeed(seed)%99999})">`;
  s+=`<rect width="100" height="100" fill="${o.bg||'#1a2540'}"/>`;
  // koszulka / marynarka
  if(o.kind==='coach'||o.kind==='staff'){s+=`<path d="M8 100 Q12 78 32 74 L50 84 L68 74 Q88 78 92 100Z" fill="${o.kind==='coach'?'#1f2937':'#334155'}"/><path d="M42 76 L50 92 L58 76 L50 82Z" fill="#f8fafc"/><path d="M48 82 L52 82 L53 96 L50 99 L47 96Z" fill="${jersey}"/>`;}
  else s+=`<path d="M6 100 Q10 77 33 73 Q50 81 67 73 Q90 77 94 100Z" fill="${jersey}"/><path d="M38 74 Q50 84 62 74" fill="none" stroke="${dark(jersey)}" stroke-width="3"/>`;
  // szyja, uszy, twarz
  s+=`<rect x="${cx-8}" y="${cy+20}" width="16" height="14" rx="5" fill="${dark(skin)}"/>`;
  s+=`<ellipse cx="${cx-fw}" cy="${cy+2}" rx="4" ry="6" fill="${skin}"/><ellipse cx="${cx+fw}" cy="${cy+2}" rx="4" ry="6" fill="${skin}"/>`;
  s+=`<path d="M${cx-fw} ${cy-6} Q${cx-fw} ${cy-fh} ${cx} ${cy-fh} Q${cx+fw} ${cy-fh} ${cx+fw} ${cy-6} L${cx+fw-1} ${cy+8} Q${cx+fw*(0.55+jaw*0.25)} ${cy+fh-2} ${cx} ${cy+fh} Q${cx-fw*(0.55+jaw*0.25)} ${cy+fh-2} ${cx-fw+1} ${cy+8}Z" fill="${skin}"/>`;
  // zarost
  if(beard===1)s+=`<path d="M${cx-fw+3} ${cy+8} Q${cx-fw*0.6} ${cy+fh-3} ${cx} ${cy+fh} Q${cx+fw*0.6} ${cy+fh-3} ${cx+fw-3} ${cy+8} Q${cx} ${cy+16} ${cx-fw+3} ${cy+8}Z" fill="${hairC}" opacity=".28"/>`;
  if(beard===2||beard===5)s+=`<path d="M${cx-fw+2} ${cy+4} Q${cx-fw*0.7} ${cy+fh+(beard===5?4:0)} ${cx} ${cy+fh+(beard===5?6:2)} Q${cx+fw*0.7} ${cy+fh+(beard===5?4:0)} ${cx+fw-2} ${cy+4} Q${cx+8} ${cy+20} ${cx} ${cy+19} Q${cx-8} ${cy+20} ${cx-fw+2} ${cy+4}Z" fill="${hairC}" opacity=".92"/>`;
  if(beard===3)s+=`<path d="M${cx-6} ${cy+19} Q${cx} ${cy+fh+4} ${cx+6} ${cy+19} Q${cx} ${cy+22} ${cx-6} ${cy+19}Z" fill="${hairC}"/>`;
  if(beard>=3)s+=`<path d="M${cx-9} ${cy+13} Q${cx} ${cy+9} ${cx+9} ${cy+13} Q${cx} ${cy+12} ${cx-9} ${cy+13}Z" fill="${hairC}" stroke="${hairC}" stroke-width="2"/>`;
  // włosy
  const top=cy-fh;
  const hp=[
    '',
    `<path d="M${cx-fw} ${cy-6} Q${cx-fw} ${top-1} ${cx} ${top-1} Q${cx+fw} ${top-1} ${cx+fw} ${cy-6} Q${cx+fw-3} ${top+8} ${cx} ${top+7} Q${cx-fw+3} ${top+8} ${cx-fw} ${cy-6}Z" fill="${hairC}" opacity=".75"/>`,
    `<path d="M${cx-fw-1} ${cy-2} Q${cx-fw-3} ${top-4} ${cx} ${top-5} Q${cx+fw+3} ${top-4} ${cx+fw+1} ${cy-2} L${cx+fw-2} ${cy-8} Q${cx+fw-6} ${top+9} ${cx} ${top+9} Q${cx-fw+6} ${top+9} ${cx-fw+2} ${cy-8}Z" fill="${hairC}"/>`,
    `<path d="M${cx-fw-1} ${cy-1} Q${cx-fw-4} ${top-6} ${cx-4} ${top-5} Q${cx+fw+5} ${top-6} ${cx+fw+1} ${cy-4} L${cx+fw-2} ${cy-9} Q${cx+6} ${top+6} ${cx-8} ${top+10} Q${cx-fw+4} ${top+12} ${cx-fw+2} ${cy-6}Z" fill="${hairC}"/>`,
    `<path d="M${cx-fw-1} ${cy-4} L${cx-fw+2} ${top-2} L${cx-14} ${top-9} L${cx-8} ${top-3} L${cx-2} ${top-11} L${cx+4} ${top-3} L${cx+11} ${top-10} L${cx+15} ${top-2} L${cx+fw+1} ${top-3} L${cx+fw+1} ${cy-4} Q${cx} ${top+8} ${cx-fw-1} ${cy-4}Z" fill="${hairC}"/>`,
    Array.from({length:9},(_,i)=>`<circle cx="${cx-fw+3+i*(fw*2-6)/8}" cy="${top+2+(i%2)*3}" r="6.5" fill="${hairC}"/>`).join('')+`<rect x="${cx-fw}" y="${top}" width="${fw*2}" height="8" fill="${hairC}"/>`,
    `<path d="M${cx-fw-3} ${cy+10} Q${cx-fw-6} ${top-6} ${cx} ${top-6} Q${cx+fw+6} ${top-6} ${cx+fw+3} ${cy+10} L${cx+fw-1} ${cy+8} L${cx+fw-2} ${cy-8} Q${cx+fw-8} ${top+8} ${cx} ${top+8} Q${cx-fw+8} ${top+8} ${cx-fw+2} ${cy-8} L${cx-fw+1} ${cy+8}Z" fill="${hairC}"/>`,
    `<path d="M${cx-fw} ${cy-6} Q${cx-fw} ${top+2} ${cx-8} ${top} L${cx+8} ${top} Q${cx+fw} ${top+2} ${cx+fw} ${cy-6} Q${cx} ${top+9} ${cx-fw} ${cy-6}Z" fill="${hairC}" opacity=".45"/><path d="M${cx-7} ${top+6} L${cx-6} ${top-8} Q${cx} ${top-12} ${cx+6} ${top-8} L${cx+7} ${top+6}Z" fill="${hairC}"/>`
  ];
  s+=hp[hairStyle]||'';
  if(band)s+=`<path d="M${cx-fw-1} ${top+12} Q${cx} ${top+6} ${cx+fw+1} ${top+12} L${cx+fw+1} ${top+17} Q${cx} ${top+11} ${cx-fw-1} ${top+17}Z" fill="${o.bandColor||'#f8fafc'}"/>`;
  // brwi, oczy
  for(const sgn of [-1,1]){const ex=cx+sgn*eyeDx;
    s+=`<path d="M${ex-6} ${eyeY-6+sgn*browTilt*0.3} Q${ex} ${eyeY-9-browTilt*0.2} ${ex+6} ${eyeY-6-sgn*browTilt*0.3}" fill="none" stroke="${hairC==='#d1d5db'?'#9ca3af':hairC}" stroke-width="${brow}" stroke-linecap="round"/>`;
    s+=`<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeR+1.6}" ry="${eyeR}" fill="#fff"/><circle cx="${ex}" cy="${eyeY}" r="${eyeR*0.8}" fill="${eyeC}"/><circle cx="${ex}" cy="${eyeY}" r="${eyeR*0.38}" fill="#111"/>`;}
  if(age>=40)s+=`<path d="M${cx-eyeDx-9} ${eyeY+1} l-3 2 M${cx+eyeDx+9} ${eyeY+1} l3 2 M${cx-8} ${top+10} q8 -2 16 0" stroke="${dark(skin)}" stroke-width="1" fill="none" opacity=".6"/>`;
  // nos
  const ny=cy+7;
  s+=[`<path d="M${cx-1} ${eyeY+3} Q${cx-4} ${ny+2} ${cx-3} ${ny+3} Q${cx} ${ny+5} ${cx+3} ${ny+3}" fill="none" stroke="${dark(skin)}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<path d="M${cx} ${eyeY+3} L${cx-4} ${ny+3} Q${cx} ${ny+6} ${cx+4} ${ny+3}" fill="none" stroke="${dark(skin)}" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<ellipse cx="${cx}" cy="${ny+2}" rx="4.5" ry="3" fill="${dark(skin)}" opacity=".45"/>`][noseT];
  // usta
  const my=cy+15;const lip=beard>=3?'#5b3a2e':'#a3504a';
  s+=[`<path d="M${cx-7} ${my} Q${cx} ${my+5} ${cx+7} ${my}" fill="none" stroke="${lip}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M${cx-6} ${my+1} L${cx+6} ${my+1}" stroke="${lip}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M${cx-8} ${my-1} Q${cx} ${my+7} ${cx+8} ${my-1} Q${cx} ${my+2} ${cx-8} ${my-1}Z" fill="#fff" stroke="${lip}" stroke-width="1.5"/>`,
      `<path d="M${cx-6} ${my+2} Q${cx} ${my-1} ${cx+6} ${my+2}" fill="none" stroke="${lip}" stroke-width="2" stroke-linecap="round"/>`][mouthT];
  s+=`</g></svg>`;
  return s;
}
function pFace(p,size){const t=p.tm>=0?TEAMS[p.tm]:null;return faceSvg(p.id,{size:size||36,age:p.age,color:t?t.color:'#64748b',kind:p.jr?'junior':'player'});}
function sFace(st,size){return faceSvg(st.id,{size:size||40,age:st.age,color:TEAMS[SAVE.team].color,kind:'staff'});}
