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
  const sh=(c,f)=>{const n=parseInt(c.slice(1),16);return `rgb(${[n>>16,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)))).join(',')})`;};
  const dark=c=>sh(c,0.78);
  const U='f'+strSeed(seed)%99999+'_'+(++FACE_UID);
  const kit=o.kit||(typeof KIT_BY_COLOR!=='undefined'&&KIT_BY_COLOR[jersey])||null;
  const hairD=hairC==='#d1d5db'||hairC==='#9ca3af'?sh(hairC,0.8):sh(hairC,0.6),hairL=sh(hairC,1.35);
  const skinL=sh(skin,1.12),skinD=sh(skin,0.74),skinDD=sh(skin,0.6);
  let s=`<svg class="face" viewBox="0 0 100 100" width="${size}" height="${size}"><defs><clipPath id="c${U}"><circle cx="50" cy="50" r="50"/></clipPath>
   <radialGradient id="s${U}" cx="44%" cy="38%" r="68%"><stop offset="0" stop-color="${skinL}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${skinD}"/></radialGradient>
   <linearGradient id="h${U}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${hairL}"/><stop offset=".45" stop-color="${hairC}"/><stop offset="1" stop-color="${hairD}"/></linearGradient>
   <linearGradient id="j${U}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset=".65" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   <radialGradient id="b${U}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${o.bg?o.bg:'#27375a'}"/><stop offset="1" stop-color="${o.bg?o.bg:'#141d30'}"/></radialGradient></defs><g clip-path="url(#c${U})">`;
  s+=`<rect width="100" height="100" fill="url(#b${U})"/>`;
  // ubranie
  const shirt='M6 100 Q10 77 33 73 Q50 81 67 73 Q90 77 94 100Z';
  let postNeck='';
  if(o.kind==='coach'&&o.outfit&&o.outfit!=='suit'&&typeof coachOutfitSvg==='function'){const r2=coachOutfitSvg(o.outfit,jersey,U,shirt,dark);s+=r2.body;postNeck=r2.neck;}
  else if(o.kind==='coach'||o.kind==='staff'){s+=`<path d="M8 100 Q12 78 32 74 L50 84 L68 74 Q88 78 92 100Z" fill="${o.kind==='coach'?'#1f2937':'#334155'}"/><path d="M8 100 Q12 78 32 74 L50 84 L68 74 Q88 78 92 100Z" fill="url(#j${U})"/><path d="M42 76 L50 92 L58 76 L50 82Z" fill="#f8fafc"/><path d="M48 82 L52 82 L53 96 L50 99 L47 96Z" fill="${jersey}"/><path d="M32 74 L44 96 M68 74 L56 96" stroke="#0005" stroke-width="1.2"/>`;}
  else{const k=kit||{p:'plain',a:jersey,b:dark(jersey),c:'r'};s+=`<defs><clipPath id="k${U}"><path d="${shirt}"/></clipPath></defs><path d="${shirt}" fill="${k.a}"/><g clip-path="url(#k${U})">`;
    const b=k.b;s+=({v:[26,40,54,68].map(x=>`<rect x="${x}" y="70" width="6" height="30" fill="${b}"/>`).join(''),h:`<rect x="0" y="88" width="100" height="7" fill="${b}"/>`,hoops:`<rect x="0" y="82" width="100" height="4" fill="${b}"/><rect x="0" y="91" width="100" height="4" fill="${b}"/>`,sash:`<path d="M20 74 L30 74 L64 100 L50 100Z" fill="${b}"/>`,half:`<rect x="50" y="70" width="50" height="30" fill="${b}"/>`,side:`<rect x="6" y="70" width="16" height="30" fill="${b}"/><rect x="78" y="70" width="16" height="30" fill="${b}"/>`})[k.p]||'';
    s+=`<rect x="0" y="70" width="100" height="30" fill="url(#j${U})"/></g>`+(k.c==='v'?`<path d="M38 74 L50 86 L62 74" fill="none" stroke="${k.b}" stroke-width="3"/>`:`<path d="M38 74 Q50 84 62 74" fill="none" stroke="${k.b}" stroke-width="3"/>`);}
  // szyja z cieniem pod żuchwą
  s+=`<path d="M${cx-8.5} ${cy+16} L${cx-9} ${cy+33} Q${cx} ${cy+37} ${cx+9} ${cy+33} L${cx+8.5} ${cy+16}Z" fill="${skinD}"/><ellipse cx="${cx}" cy="${cy+fh-2}" rx="${fw*0.55}" ry="5" fill="${skinDD}" opacity=".55"/>`;
  if(postNeck)s+=postNeck;
  // uszy
  for(const g of [-1,1])s+=`<ellipse cx="${cx+g*fw}" cy="${cy+2}" rx="4.2" ry="6.5" fill="${skin}"/><path d="M${cx+g*(fw+1.5)} ${cy-2} Q${cx+g*(fw+2.5)} ${cy+2} ${cx+g*(fw+1)} ${cy+6}" fill="none" stroke="${skinDD}" stroke-width="1.1" opacity=".7"/>`;
  // twarz
  const face=`M${cx-fw} ${cy-6} Q${cx-fw} ${cy-fh} ${cx} ${cy-fh} Q${cx+fw} ${cy-fh} ${cx+fw} ${cy-6} L${cx+fw-1} ${cy+8} Q${cx+fw*(0.55+jaw*0.25)} ${cy+fh-2} ${cx} ${cy+fh} Q${cx-fw*(0.55+jaw*0.25)} ${cy+fh-2} ${cx-fw+1} ${cy+8}Z`;
  s+=`<path d="${face}" fill="url(#s${U})"/>`;
  // cieniowanie: skronie, policzki, żuchwa
  s+=`<ellipse cx="${cx+fw*0.55}" cy="${cy+6}" rx="${fw*0.45}" ry="${fh*0.7}" fill="${skinDD}" opacity=".12"/>`;
  s+=`<ellipse cx="${cx-eyeDx-1}" cy="${cy+9}" rx="5.5" ry="3.5" fill="#d9776a" opacity=".16"/><ellipse cx="${cx+eyeDx+1}" cy="${cy+9}" rx="5.5" ry="3.5" fill="#d9776a" opacity=".16"/>`;
  s+=`<ellipse cx="${cx-3}" cy="${cy-fh+9}" rx="${fw*0.45}" ry="5" fill="#fff" opacity=".07"/>`;
  // zarost
  if(beard===1){s+=`<path d="M${cx-fw+3} ${cy+8} Q${cx-fw*0.6} ${cy+fh-3} ${cx} ${cy+fh} Q${cx+fw*0.6} ${cy+fh-3} ${cx+fw-3} ${cy+8} Q${cx+8} ${cy+14} ${cx} ${cy+13} Q${cx-8} ${cy+14} ${cx-fw+3} ${cy+8}Z" fill="${hairD}" opacity=".16"/><path d="M${cx-8} ${cy+12.5} Q${cx} ${cy+10} ${cx+8} ${cy+12.5}" stroke="${hairD}" stroke-width="2.2" opacity=".2" fill="none"/>`;}
  if(beard===2||beard===5)s+=`<path d="M${cx-fw+2} ${cy+4} Q${cx-fw*0.7} ${cy+fh+(beard===5?4:0)} ${cx} ${cy+fh+(beard===5?6:2)} Q${cx+fw*0.7} ${cy+fh+(beard===5?4:0)} ${cx+fw-2} ${cy+4} Q${cx+8} ${cy+20} ${cx} ${cy+19} Q${cx-8} ${cy+20} ${cx-fw+2} ${cy+4}Z" fill="url(#h${U})" opacity=".95"/>`;
  if(beard===3)s+=`<path d="M${cx-6} ${cy+19} Q${cx} ${cy+fh+4} ${cx+6} ${cy+19} Q${cx} ${cy+22} ${cx-6} ${cy+19}Z" fill="url(#h${U})"/>`;
  if(beard>=3||beard===2||beard===5)s+=`<path d="M${cx-9} ${cy+13.5} Q${cx} ${cy+9} ${cx+9} ${cy+13.5} Q${cx+3} ${cy+12} ${cx} ${cy+12.5} Q${cx-3} ${cy+12} ${cx-9} ${cy+13.5}Z" fill="${hairC}" stroke="${hairC}" stroke-width="1.6"/>`;
  // usta
  const my=cy+15;const lipU=sh(skin,0.62),lipL=sh(skin,0.8);const lipC=beard>=3?'#5b3a2e':sh('#b05a50',1);
  s+=[`<path d="M${cx-7} ${my} Q${cx-3} ${my-1.5} ${cx} ${my-0.5} Q${cx+3} ${my-1.5} ${cx+7} ${my} Q${cx} ${my+2} ${cx-7} ${my}Z" fill="${lipU}"/><path d="M${cx-6.5} ${my+0.6} Q${cx} ${my+5} ${cx+6.5} ${my+0.6} Q${cx} ${my+2.4} ${cx-6.5} ${my+0.6}Z" fill="${lipL}"/><path d="M${cx-7.5} ${my-0.2} Q${cx} ${my+2.4} ${cx+7.5} ${my-0.2}" fill="none" stroke="${lipC}" stroke-width="1.1" stroke-linecap="round"/>`,
      `<path d="M${cx-6} ${my} Q${cx} ${my-1.6} ${cx+6} ${my}Z" fill="${lipU}"/><path d="M${cx-5.5} ${my+0.4} Q${cx} ${my+3.6} ${cx+5.5} ${my+0.4}Z" fill="${lipL}"/><path d="M${cx-6.5} ${my+0.3} L${cx+6.5} ${my+0.3}" stroke="${lipC}" stroke-width="1.1" stroke-linecap="round"/>`,
      `<path d="M${cx-8} ${my-1} Q${cx} ${my+8} ${cx+8} ${my-1} Q${cx} ${my+1} ${cx-8} ${my-1}Z" fill="#3b1714"/><path d="M${cx-6.6} ${my-0.3} Q${cx} ${my+2.6} ${cx+6.6} ${my-0.3} L${cx+5.6} ${my+1.4} Q${cx} ${my+3.4} ${cx-5.6} ${my+1.4}Z" fill="#f4f1ea"/><path d="M${cx-8} ${my-1} Q${cx} ${my+8} ${cx+8} ${my-1}" fill="none" stroke="${lipU}" stroke-width="1.6"/>`,
      `<path d="M${cx-6} ${my+1.5} Q${cx} ${my-1.2} ${cx+6} ${my+1.5} Q${cx} ${my+0.6} ${cx-6} ${my+1.5}Z" fill="${lipU}"/><path d="M${cx-5} ${my+1.8} Q${cx} ${my+4} ${cx+5} ${my+1.8}Z" fill="${lipL}"/><path d="M${cx-6.5} ${my+1.6} Q${cx} ${my-0.4} ${cx+6.5} ${my+1.6}" fill="none" stroke="${lipC}" stroke-width="1.1" stroke-linecap="round"/>`][mouthT];
  // nos: cień boczny, grzbiet, nozdrza
  const ny=cy+7;
  s+=[`<path d="M${cx-1.5} ${eyeY+3} Q${cx-3.5} ${ny} ${cx-4.5} ${ny+2.5} Q${cx-1} ${ny+4.6} ${cx+2} ${ny+3.6}" fill="none" stroke="${skinDD}" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>`,
      `<path d="M${cx} ${eyeY+3} L${cx-4} ${ny+3} Q${cx} ${ny+5.6} ${cx+4} ${ny+3}" fill="none" stroke="${skinDD}" stroke-width="1.3" stroke-linejoin="round" opacity=".75"/>`,
      `<path d="M${cx-1} ${eyeY+3} Q${cx-4} ${ny} ${cx-5} ${ny+2.6} Q${cx} ${ny+5.4} ${cx+5} ${ny+2.6} Q${cx+3.6} ${ny} ${cx+1} ${eyeY+3}" fill="${skinD}" opacity=".35"/>`][noseT];
  s+=`<path d="M${cx+1.2} ${eyeY+4} Q${cx+2.4} ${ny-1} ${cx+3.6} ${ny+1.6}" fill="none" stroke="${skinDD}" stroke-width="2.4" opacity=".18" stroke-linecap="round"/><path d="M${cx-0.6} ${eyeY+4} L${cx-0.8} ${ny}" stroke="#fff" stroke-width="1.2" opacity=".14" stroke-linecap="round"/>`;
  s+=`<ellipse cx="${cx-2.2}" cy="${ny+3.3}" rx="1.3" ry=".75" fill="${skinDD}" opacity=".8"/><ellipse cx="${cx+2.2}" cy="${ny+3.3}" rx="1.3" ry=".75" fill="${skinDD}" opacity=".8"/>`;
  // oczy: oczodoły, białko, tęczówka, źrenica, odblask, powieka
  for(const g of [-1,1]){const ex=cx+g*eyeDx;
    s+=`<ellipse cx="${ex}" cy="${eyeY-1.4}" rx="${eyeR+3.4}" ry="${eyeR+1.6}" fill="${skinDD}" opacity=".16"/>`;
    s+=`<path d="M${ex-eyeR-2} ${eyeY} Q${ex} ${eyeY-eyeR-0.8} ${ex+eyeR+2} ${eyeY} Q${ex} ${eyeY+eyeR*0.85} ${ex-eyeR-2} ${eyeY}Z" fill="#f3efe9"/>`;
    s+=`<circle cx="${ex+g*0.2}" cy="${eyeY-0.1}" r="${eyeR*0.78}" fill="${eyeC}"/><circle cx="${ex+g*0.2}" cy="${eyeY-0.1}" r="${eyeR*0.78}" fill="none" stroke="#0006" stroke-width=".5"/><circle cx="${ex+g*0.2}" cy="${eyeY-0.1}" r="${eyeR*0.36}" fill="#0b0b0b"/><circle cx="${ex+g*0.2+0.8}" cy="${eyeY-0.9}" r="${eyeR*0.2}" fill="#fff" opacity=".9"/>`;
    s+=`<path d="M${ex-eyeR-2.2} ${eyeY+0.2} Q${ex} ${eyeY-eyeR-1.4} ${ex+eyeR+2.2} ${eyeY+0.2}" fill="none" stroke="#2a1a12" stroke-width="1.3" stroke-linecap="round"/><path d="M${ex-eyeR-1} ${eyeY-eyeR-1.6} Q${ex} ${eyeY-eyeR-3} ${ex+eyeR+1} ${eyeY-eyeR-1.6}" fill="none" stroke="${skinDD}" stroke-width=".7" opacity=".5"/>`;
    // brwi (zwężające się)
    const by=eyeY-6.5;const t=browTilt*0.3*g;s+=`<path d="M${ex-6.5} ${by+1.2+t} Q${ex-1} ${by-2.6-browTilt*0.2} ${ex+6.5} ${by+0.4-t} Q${ex} ${by-2.6+brow*0.9} ${ex-6.5} ${by+1.2+t+brow*0.55}Z" fill="${hairC==='#d1d5db'?'#9ca3af':hairD}"/>`;}
  if(age>=40){const op=Math.min(.55,(age-35)/40);s+=`<path d="M${cx-eyeDx-8} ${eyeY+1} l-3 1.6 M${cx-eyeDx-8} ${eyeY+3} l-2.6 2 M${cx+eyeDx+8} ${eyeY+1} l3 1.6 M${cx+eyeDx+8} ${eyeY+3} l2.6 2 M${cx-9} ${cy-fh+10} q9 -2.4 18 0 M${cx-7} ${cy-fh+13.5} q7 -1.6 14 0 M${cx-6} ${ny+2} Q${cx-10} ${my} ${cx-8.6} ${my+3} M${cx+6} ${ny+2} Q${cx+10} ${my} ${cx+8.6} ${my+3}" stroke="${skinDD}" stroke-width=".9" fill="none" opacity="${op}"/>`;}
  // włosy (z gradientem i pasmami)
  const top=cy-fh;const HF=`url(#h${U})`;
  const hp=[
    '',
    `<path d="M${cx-fw} ${cy-6} Q${cx-fw} ${top-1} ${cx} ${top-1} Q${cx+fw} ${top-1} ${cx+fw} ${cy-6} Q${cx+fw-3} ${top+8} ${cx} ${top+7} Q${cx-fw+3} ${top+8} ${cx-fw} ${cy-6}Z" fill="${HF}" opacity=".7"/>`,
    `<path d="M${cx-fw-1} ${cy-2} Q${cx-fw-3} ${top-4} ${cx} ${top-5} Q${cx+fw+3} ${top-4} ${cx+fw+1} ${cy-2} L${cx+fw-2} ${cy-8} Q${cx+fw-6} ${top+9} ${cx} ${top+9} Q${cx-fw+6} ${top+9} ${cx-fw+2} ${cy-8}Z" fill="${HF}"/>`,
    `<path d="M${cx-fw-1} ${cy-1} Q${cx-fw-4} ${top-6} ${cx-4} ${top-5} Q${cx+fw+5} ${top-6} ${cx+fw+1} ${cy-4} L${cx+fw-2} ${cy-9} Q${cx+6} ${top+6} ${cx-8} ${top+10} Q${cx-fw+4} ${top+12} ${cx-fw+2} ${cy-6}Z" fill="${HF}"/>`,
    `<path d="M${cx-fw-1} ${cy-4} L${cx-fw+2} ${top-2} L${cx-14} ${top-9} L${cx-8} ${top-3} L${cx-2} ${top-11} L${cx+4} ${top-3} L${cx+11} ${top-10} L${cx+15} ${top-2} L${cx+fw+1} ${top-3} L${cx+fw+1} ${cy-4} Q${cx} ${top+8} ${cx-fw-1} ${cy-4}Z" fill="${HF}"/>`,
    Array.from({length:9},(_,i)=>`<circle cx="${cx-fw+3+i*(fw*2-6)/8}" cy="${top+2+(i%2)*3}" r="6.5" fill="${HF}"/>`).join('')+`<rect x="${cx-fw}" y="${top}" width="${fw*2}" height="8" fill="${hairC}"/>`+Array.from({length:7},(_,i)=>`<circle cx="${cx-fw+7+i*(fw*2-14)/6}" cy="${top-1+(i%2)*2}" r="2" fill="${hairL}" opacity=".25"/>`).join(''),
    `<path d="M${cx-fw-3} ${cy+10} Q${cx-fw-6} ${top-6} ${cx} ${top-6} Q${cx+fw+6} ${top-6} ${cx+fw+3} ${cy+10} L${cx+fw-1} ${cy+8} L${cx+fw-2} ${cy-8} Q${cx+fw-8} ${top+8} ${cx} ${top+8} Q${cx-fw+8} ${top+8} ${cx-fw+2} ${cy-8} L${cx-fw+1} ${cy+8}Z" fill="${HF}"/>`,
    `<path d="M${cx-fw} ${cy-6} Q${cx-fw} ${top+2} ${cx-8} ${top} L${cx+8} ${top} Q${cx+fw} ${top+2} ${cx+fw} ${cy-6} Q${cx} ${top+9} ${cx-fw} ${cy-6}Z" fill="${HF}" opacity=".45"/><path d="M${cx-7} ${top+6} L${cx-6} ${top-8} Q${cx} ${top-12} ${cx+6} ${top-8} L${cx+7} ${top+6}Z" fill="${HF}"/>`
  ];
  s+=hp[hairStyle]||'';
  if(hairStyle>=2&&hairStyle!==5)s+=`<path d="M${cx-fw*0.6} ${top+1} Q${cx-4} ${top-3} ${cx+fw*0.2} ${top+2} M${cx-fw*0.3} ${top+4} Q${cx+4} ${top} ${cx+fw*0.6} ${top+3} M${cx-fw*0.8} ${top+6} Q${cx-fw*0.5} ${top+2} ${cx-fw*0.1} ${top+5}" fill="none" stroke="${hairL}" stroke-width=".9" opacity=".35"/>`;
  if(band)s+=`<path d="M${cx-fw-1} ${top+12} Q${cx} ${top+6} ${cx+fw+1} ${top+12} L${cx+fw+1} ${top+17} Q${cx} ${top+11} ${cx-fw-1} ${top+17}Z" fill="${o.bandColor||'#f8fafc'}"/><path d="M${cx-fw-1} ${top+16} Q${cx} ${top+10} ${cx+fw+1} ${top+16}" stroke="#0002" stroke-width="1" fill="none"/>`;
  s+=`</g></svg>`;
  return s;
}
let FACE_UID=0;
function pFace(p,size){const t=p.tm>=0?TEAMS[p.tm]:null;const kit=t&&typeof teamKit==='function'?teamKit(p.tm).h:null;return faceSvg(p.id,{size:size||36,age:p.age,color:t?t.color:'#64748b',kit,kind:p.jr?'junior':'player'});}
function sFace(st,size){return faceSvg(st.id,{size:size||40,age:st.age,color:TEAMS[SAVE.team].color,kind:'staff'});}
