// ================= INFRASTRUKTURA W 3D: MAPA KOMPLEKSU I EKRANY BUDYNKÓW =================
const V3={yaw:2.5,pitch:0.74,zoom:2,tx:-15,ty:-10,roof:true,raf:0};
const V3L=(()=>{const v=[-0.5,-0.62,0.75],m=Math.hypot(...v);return v.map(x=>x/m);})();
// położenie budynków na mapie (środek terenu, na którym stoją)
const V3POS={hala:[0,0],tren:[-80,66],akad:[-92,-24],med:[-32,64],odn:[2,64],sied:[52,62],sklep:[-46,-42]};
function v3rgb(c){const n=parseInt(c.slice(1),16);return [n>>16,n>>8&255,n&255];}
function v3col(c,f,hl){let [r,g,b]=v3rgb(c);r*=f;g*=f;b*=f;if(hl){r=r*.55+240*.45;g=g*.55+180*.45;b=b*.55+40*.45;}return `rgb(${Math.min(255,r|0)},${Math.min(255,g|0)},${Math.min(255,b|0)})`;}
function v3hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}return lo.slice(0,-1).concat(up.slice(0,-1));}
function v3Scene(){
  const inf=Object.assign({},myInfra()),pv=ui.v3prev;if(pv){const f=INFRA.find(x=>x.k===pv);if(f&&inf[pv]<fMax(f))inf[pv]++;}
  const SC={decals:[],groups:[],shadows:[],labels:[],busy:[]};let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  let KEY=null,HL=false;
  const grp=()=>{const o={f:[],x:0,y:0,z:0,n:0,key:KEY};SC.groups.push(o);return o;};
  const face=(G,p,n,c,o)=>{o=o||{};G.f.push({p,n,c,b:o.b||0,hl:o.hl!=null?o.hl:HL});};
  const shadow=(x0,y0,w,d,h)=>{const k=h/V3L[2],pts=[[x0,y0],[x0+w,y0],[x0+w,y0+d],[x0,y0+d]];SC.shadows.push(v3hull(pts.concat(pts.map(p=>[p[0]-V3L[0]*k,p[1]-V3L[1]*k]))));};
  const box=(G,x0,y0,z0,w,d,h,c,o)=>{o=o||{};const x1=x0+w,y1=y0+d,z1=z0+h,sc=o.side||c;
    face(G,[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1],o.top||c,o);
    face(G,[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0],sc,o);face(G,[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],[0,1,0],sc,o);
    face(G,[[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],[-1,0,0],sc,o);face(G,[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],[1,0,0],sc,o);
    G.x+=x0+w/2;G.y+=y0+d/2;G.z+=z0+h/2;G.n++;if(o.sh!==false&&h>0.6&&z0<0.5)shadow(x0,y0,w,d,z0+h);};
  const rect=(x0,y0,w,d,c)=>SC.decals.push({p:[[x0,y0],[x0+w,y0],[x0+w,y0+d],[x0,y0+d]],c,key:KEY});
  const busy=(x0,y0,w,d)=>SC.busy.push([x0-3,y0-3,x0+w+3,y0+d+3]);
  // pasy okien na wszystkich ścianach bryły
  const bands=(G,x0,y0,w,d,z0,floors,fh,col,o)=>{o=o||{};for(let f=0;f<floors;f++){const a=z0+f*fh+fh*0.32,b=z0+f*fh+fh*0.78,e=0.04;
    face(G,[[x0+0.8,y0-e,a],[x0+w-0.8,y0-e,a],[x0+w-0.8,y0-e,b],[x0+0.8,y0-e,b]],[0,-1,0],col,{b:1});face(G,[[x0+0.8,y0+d+e,a],[x0+w-0.8,y0+d+e,a],[x0+w-0.8,y0+d+e,b],[x0+0.8,y0+d+e,b]],[0,1,0],col,{b:1});
    face(G,[[x0-e,y0+0.8,a],[x0-e,y0+d-0.8,a],[x0-e,y0+d-0.8,b],[x0-e,y0+0.8,b]],[-1,0,0],col,{b:1});face(G,[[x0+w+e,y0+0.8,a],[x0+w+e,y0+d-0.8,a],[x0+w+e,y0+d-0.8,b],[x0+w+e,y0+0.8,b]],[1,0,0],col,{b:1});
    if(o.mull)for(let q=x0+3;q<x0+w-1;q+=3){face(G,[[q,y0-e*2,a],[q+0.2,y0-e*2,a],[q+0.2,y0-e*2,b],[q,y0-e*2,b]],[0,-1,0],o.mull,{b:2});face(G,[[q,y0+d+e*2,a],[q+0.2,y0+d+e*2,a],[q+0.2,y0+d+e*2,b],[q,y0+d+e*2,b]],[0,1,0],o.mull,{b:2});}}};
  // hala z wnętrzem: ściany, dach (zdejmowany), podłoga
  const shell=(G,x0,y0,w,d,h,wc,roofC)=>{const t=0.5,wt='#70747a';
    box(G,x0,y0,0,w,t,h,wc,{sh:false,top:wt});box(G,x0,y0+d-t,0,w,t,h,wc,{sh:false,top:wt});box(G,x0,y0,0,t,d,h,wc,{sh:false,top:wt});box(G,x0+w-t,y0,0,t,d,h,wc,{sh:false,top:wt});
    if(V3.roof){box(G,x0-0.3,y0-0.3,h,w+0.6,d+0.6,0.6,roofC||'#cfd1d4',{side:'#8f9399',b:5000,sh:false});}shadow(x0,y0,w,d,h+0.6);busy(x0,y0,w,d);};
  const tree=(x,y,r,h,c)=>{SC.groups.push({tree:1,x,y,z:h,r,h,c});const kk=h/V3L[2],pts=[];for(let a=0;a<12;a++){const an=a/12*6.283;pts.push([x-V3L[0]*kk+Math.cos(an)*r,y-V3L[1]*kk+Math.sin(an)*r]);}SC.shadows.push(pts);};
  const lab=(k,x,y,z)=>SC.labels.push({k,x,y,z});
  const club=TEAMS[SAVE.team].color||'#3b82f6';
  // teren i drogi
  SC.decals.push({p:[[-210,-230],[230,-230],[230,140],[-210,140]],c:'#6b7a42'});
  rect(30,-200,7,248,'#55585c');rect(-130,42,167,7,'#55585c');rect(-70,-75,7,124,'#55585c');rect(-130,-82,167,7,'#55585c');
  // ---------- HALA ----------
  {KEY='hala';const L=inf.hala,hx=15,hy=9.5,n=3+L*2,m=2+L*2,rd=0.9,rs=0.5,ox=hx+m*rd+3,oy=hy+n*rd+3,wh=n*rs+5.5;HL=pv==='hala';
    rect(-ox-12,-oy-26,2*ox+24,26,'#c4beb1');rect(-ox-1.5,-oy-1.5,2*ox+3,2*oy+3,'#b3afa6');rect(ox+1.5,-oy-12,30-ox,6,'#c4beb1');busy(-ox-12,-oy-26,2*ox+24,2*oy+26);
    const H=grp();HL=false;
    face(H,[[-ox,-oy,0.05],[ox,-oy,0.05],[ox,oy,0.05],[-ox,oy,0.05]],[0,0,1],'#8a8d93',{b:-900});face(H,[[-hx,-hy,0.1],[hx,-hy,0.1],[hx,hy,0.1],[-hx,hy,0.1]],[0,0,1],'#28467f',{b:-800});
    face(H,[[-9,-4.5,0.15],[9,-4.5,0.15],[9,4.5,0.15],[-9,4.5,0.15]],[0,0,1],'#d8b678',{b:-700});
    for(const x of [-3.1,2.9])face(H,[[x,-4.5,0.18],[x+0.2,-4.5,0.18],[x+0.2,4.5,0.18],[x,4.5,0.18]],[0,0,1],'#f4f1ea',{b:-600});
    face(H,[[-0.12,-5.4,0.2],[0.12,-5.4,0.2],[0.12,5.4,0.2],[-0.12,5.4,0.2]],[0,0,1],'#f4f1ea',{b:-600});
    const seat=(i,g)=>g?'#9b3a30':(i%2?'#3d4350':'#464d5b');const hlL=pv==='hala',G2=inf.gosc,gl=G2*5.5;
    for(let i=0;i<n;i++){const z=(i+1)*rs+0.3,o={side:'#25282e',sh:false,hl:hlL&&i>=n-2};box(H,-hx,hy+i*rd,0,2*hx,rd,z,seat(i),o);box(H,-hx,-hy-(i+1)*rd,0,2*hx,rd,z,seat(i),o);}
    for(let i=0;i<m;i++){const z=(i+1)*rs+0.3,o={side:'#25282e',sh:false,hl:hlL&&i>=m-2};box(H,-hx-(i+1)*rd,-hy,0,rd,2*hy,z,seat(i),o);
      if(G2){box(H,hx+i*rd,-hy,0,rd,gl,z,seat(i,1),Object.assign({},o,{hl:pv==='gosc'}));box(H,hx+i*rd,-hy+gl,0,rd,2*hy-gl,z,seat(i),o);}else box(H,hx+i*rd,-hy,0,rd,2*hy,z,seat(i),o);}
    if(G2)box(H,hx-0.15,-hy+gl,0,0.3+m*rd,0.15,m*rs+1.6,'#c9ccd1',{sh:false,hl:pv==='gosc'});
    shell(H,-ox,-oy,2*ox,2*oy,wh,'#9a9ea4');bands(H,-ox,-oy,2*ox,2*oy,wh-2.8,1,2.4,'#3f5f7a');
    for(let k=-1;k<=1;k+=2)for(let x=-ox+2;x<ox-1;x+=4)face(H,[[x,k*(oy+0.06),0.3],[x+0.35,k*(oy+0.06),0.3],[x+0.35,k*(oy+0.06),wh-2.8],[x,k*(oy+0.06),wh-2.8]],[0,k,0],'#7d8187',{b:2});
    if(V3.roof){for(let q=0;q<4;q++){const y=-oy+2+q*(2*oy-6)/3;face(H,[[-ox+3,y,wh+0.62],[ox-3,y,wh+0.62],[ox-3,y+2,wh+0.62],[-ox+3,y+2,wh+0.62]],[0,0,1],'#8fa7bb',{b:5001});}
      face(H,[[-ox+2,-oy+0.5,wh+0.63],[-ox+10,-oy+0.5,wh+0.63],[-ox+10,-oy+1.6,wh+0.63],[-ox+2,-oy+1.6,wh+0.63]],[0,0,1],club,{b:5002});}
    H.fix=[0,0,wh/2];
    const E=grp();box(E,-9,-oy-4,0,18,4,4.8,'#4e7493',{top:'#d6d8da'});face(E,[[-9.5,-oy-4.6,4.8],[9.5,-oy-4.6,4.8],[9.5,-oy,4.8],[-9.5,-oy,4.8]],[0,0,1],'#e2e3e4',{b:5});
    face(E,[[-6,-oy-4.65,3.6],[6,-oy-4.65,3.6],[6,-oy-4.65,4.6],[-6,-oy-4.65,4.6]],[0,-1,0],club,{b:6});
    lab('hala',0,0,wh+3);
    if(inf.vip){KEY='hala';HL=pv==='vip';const V=grp(),vw=8+inf.vip*4,x0=10.5;box(V,x0,-oy-6,0,vw,6,3.4,'#5f8fb3',{top:'#2f333a'});box(V,x0,-oy-6,3.4,vw,6,3.6,'#7ea9c9',{top:'#3a3f47'});
      face(V,[[x0,-oy-6.05,3.2],[x0+vw,-oy-6.05,3.2],[x0+vw,-oy-6.05,3.6],[x0,-oy-6.05,3.6]],[0,-1,0],'#c9a54a',{b:3});face(V,[[x0+vw+0.05,-oy-6,3.2],[x0+vw+0.05,-oy,3.2],[x0+vw+0.05,-oy,3.6],[x0+vw+0.05,-oy-6,3.6]],[1,0,0],'#c9a54a',{b:3});HL=false;}
    {const nk=1+inf.gastro;for(let i=0;i<nk;i++){HL=pv==='gastro'&&i===nk-1;const K=grp(),x=-nk*2.7+i*5.4;box(K,x,-oy-19,0,3.4,2.6,2.6,'#ece6d8',{side:'#d9d1bf'});box(K,x-0.4,-oy-19.9,2.4,4.2,1.4,0.35,i%2?'#c0392b':'#2e7d4f');
      for(let j=0;j<3;j++){const U=grp();box(U,x+0.2+j*1.2,-oy-22.5,0,0.8,0.8,0.7,'#5a4636',{sh:false});}}HL=false;}
    // parking: jeden plac na poziom (rysunek uproszczony)
    {const lots=inf.park;for(let l=0;l<lots;l++){const lx=40+(l%2)*68,ly=-34-Math.floor(l/2)*70,nw=pv==='park'&&l===lots-1;KEY='hala';
      rect(lx,ly,62,64,nw?'#7a6a3c':'#45484c');busy(lx,ly,62,64);if(l<2||l%2===0)rect(37,ly+30,3,6,'#55585c');
      for(let r=0;r<4;r++){const ry=ly+3+r*15.5;for(let q=0;q<=24;q++){rect(lx+3+q*2.3,ry,0.18,5,'#d7d7d2');rect(lx+3+q*2.3,ry+5.5,0.18,5,'#d7d7d2');}rect(lx+3,ry+5.2,24*2.3,0.15,'#d7d7d2');
        const occ=nw?0.12:l<2?0.6:0.3;for(let q=0;q<24;q++)for(let s=0;s<2;s++){if(rnd()<occ){const C=grp(),cc=['#b8bcc2','#2b2f36','#8e2a2a','#2c4a7a','#e9e9e6','#5c6168','#9a8f7b'][rnd()*7|0];const cx=lx+3+q*2.3+0.3,cy=ry+s*5.5+0.4;
          box(C,cx,cy,0,1.7,4.1,0.75,cc,{sh:false,hl:false});box(C,cx+0.15,cy+1.1,0.75,1.4,2,0.5,'#2a3038',{top:cc,sh:false,hl:false});}}}}}
  }
  // ---------- CENTRUM TRENINGOWE ----------
  {KEY='tren';HL=pv==='tren';const L=inf.tren,[cx,cy]=V3POS.tren,w=34,d=22,x0=cx-w/2,y0=cy-d/2,h=7+0.4*L;const G=grp();
    face(G,[[x0,y0,0.05],[x0+w,y0,0.05],[x0+w,y0+d,0.05],[x0,y0+d,0.05]],[0,0,1],'#b88a5a',{b:-900});
    const nc=Math.min(3,L);for(let i=0;i<nc;i++){const a=x0+2+i*10.5;face(G,[[a,y0+2,0.1],[a+9,y0+2,0.1],[a+9,y0+20,0.1],[a,y0+20,0.1]],[0,0,1],i%2?'#2f6b5a':'#2d5a8a',{b:-800});face(G,[[a,y0+10.9,0.15],[a+9,y0+10.9,0.15],[a+9,y0+11.1,0.15],[a,y0+11.1,0.15]],[0,0,1],'#f4f1ea',{b:-700});}
    shell(G,x0,y0,w,d,h,'#a7b0a2','#c8cec4');bands(G,x0,y0,w,d,h-2.6,1,2.2,'#3f5f7a',{mull:'#7d8780'});
    if(V3.roof)for(let q=0;q<3;q++){const y=y0+3+q*6;face(G,[[x0+3,y,h+0.62],[x0+w-3,y,h+0.62],[x0+w-3,y+1.6,h+0.62],[x0+3,y+1.6,h+0.62]],[0,0,1],'#8fa7bb',{b:5001});}
    if(L>=2){const A=grp();box(A,x0+w,y0+2,0,10,12,4.2,'#6f9cbd',{top:'#4a5058'});bands(A,x0+w,y0+2,10,12,0,1,4.2,'#3b5b78');if(L>=5){box(A,x0+w,y0+2,4.2,10,12,3.6,'#7ea9c9',{top:'#4a5058'});}}
    if(L>=3){rect(x0+w+1,y0+15,16,9,'#e3cf9d');const N=grp();box(N,x0+w+8.9,y0+15,0,0.15,9,2.2,'#f4f1ea',{sh:false});}
    if(L>=4){rect(x0-17,y0+3,14,24,'#c9773a');rect(x0-17,y0+14.9,14,0.2,'#f4f1ea');}
    lab('tren',cx,cy,h+3);busy(x0-18,y0,w+30,d+4);}
  // ---------- AKADEMIA ----------
  {KEY='akad';HL=pv==='akad';const L=inf.akad,[cx,cy]=V3POS.akad,x0=cx-12,y0=cy-14,fl=1+Math.ceil(L/2),fh=3.3;const G=grp();
    box(G,x0,y0,0,24,12,fl*fh,'#b5654a',{top:'#6b4a3e'});bands(G,x0,y0,24,12,0,fl,fh,'#f1e2b8');
    face(G,[[x0+9,y0-0.08,0],[x0+15,y0-0.08,0],[x0+15,y0-0.08,2.6],[x0+9,y0-0.08,2.6]],[0,-1,0],'#3b4f63',{b:3});
    if(L>=2){const D=grp();box(D,x0,y0+15,0,12,18,L*3,'#c98e6c',{top:'#6b4a3e'});bands(D,x0,y0+15,12,18,0,L,3,'#f1e2b8');}
    rect(x0+15,y0+15,16,22,'#c9773a');rect(x0+15,y0+25.9,16,0.2,'#f4f1ea');for(const yy of [y0+15,y0+36.8])rect(x0+15,yy,16,0.2,'#f4f1ea');
    if(L>=4){const T=grp();for(let i=0;i<3;i++)box(T,x0+31.5+i*1,y0+17,0,1,18,0.5+i*0.5,'#464d5b',{side:'#25282e',sh:false});}
    lab('akad',cx,cy,fl*fh+3);busy(x0,y0,36,38);}
  // ---------- CENTRUM MEDYCZNE ----------
  {KEY='med';HL=pv==='med';const L=inf.med,[cx,cy]=V3POS.med,x0=cx-9,y0=cy-7,fl=1+L,fh=3.3,h=fl*fh;const G=grp();
    box(G,x0,y0,0,18,14,h,'#e9ecef',{top:'#cfd4d9'});bands(G,x0,y0,18,14,0,fl,fh,'#6a9cc2');
    box(G,x0+6.5,y0+5.8,h,5,1.4,0.3,'#d23b3b',{sh:false,b:5});box(G,x0+8.3,y0+4,h,1.4,5,0.3,'#d23b3b',{sh:false,b:5});
    if(L>=2){const A=grp();box(A,x0+19,y0-6,0,2,4.6,1.9,'#f4f4f4',{top:'#f4f4f4'});face(A,[[x0+21.06,y0-6,1],[x0+21.06,y0-1.4,1],[x0+21.06,y0-1.4,1.3],[x0+21.06,y0-6,1.3]],[1,0,0],'#d23b3b',{b:2});}
    if(L>=4){const W2=grp();box(W2,x0-10,y0,0,10,9,2*fh,'#e1e5e8',{top:'#cfd4d9'});bands(W2,x0-10,y0,10,9,0,2,fh,'#6a9cc2');}
    rect(x0-2,y0-9,22,8,'#c4beb1');lab('med',cx,cy,h+3);busy(x0-11,y0-9,33,23);}
  // ---------- ODNOWA BIOLOGICZNA ----------
  {KEY='odn';HL=pv==='odn';const L=inf.odn,[cx,cy]=V3POS.odn,x0=cx-8,y0=cy-6;const G=grp();
    box(G,x0,y0,0,16,12,7,'#dfe7ea',{top:'#b9c4c8'});bands(G,x0,y0,16,12,0,2,3.5,'#4d8fa8');face(G,[[x0,y0-0.08,6.2],[x0+16,y0-0.08,6.2],[x0+16,y0-0.08,6.8],[x0,y0-0.08,6.8]],[0,-1,0],'#1fa6a0',{b:3});
    const pw=8+2*L;rect(x0+17,y0-1,pw+3,13,'#d9d4c7');rect(x0+18.5,y0+0.5,pw,10,'#3fa7d6');for(let i=1;i<4;i++)rect(x0+18.5,y0+0.5+i*2.5,pw,0.12,'#bfe6f5');
    if(L>=3){const P=grp();box(P,x0-15,y0,0,14,12,4.5,'#9cc7dc',{top:'#7fb2c9'});}
    for(let i=0;i<Math.min(6,L+1);i++){const C=grp();box(C,x0+18+i*2,y0+12.6,0,0.8,2,0.4,'#f4f4f4',{sh:false});}
    lab('odn',cx,cy,10);busy(x0-16,y0-2,pw+37,18);}
  // ---------- SIEDZIBA ----------
  {KEY='sied';HL=pv==='sied';const L=inf.sied,[cx,cy]=V3POS.sied,fl=2+L,fh=3.5,h=fl*fh;const G=grp();
    if(L>=3){box(G,cx-11,cy-9,0,22,18,3.6,'#59636e',{top:'#8a929b'});}
    box(G,cx-7,cy-7,L>=3?3.6:0,14,14,h-(L>=3?3.6:0),'#5d86a6',{top:'#3a3f47'});bands(G,cx-7,cy-7,14,14,L>=3?3.6:0,fl-(L>=3?1:0),fh,'#8fb4cf',{mull:'#3c4f60'});
    face(G,[[cx-7,cy-7.1,h-1.2],[cx+7,cy-7.1,h-1.2],[cx+7,cy-7.1,h-0.2],[cx-7,cy-7.1,h-0.2]],[0,-1,0],club,{b:4});face(G,[[cx-7.1,cy-7,h-1.2],[cx-7.1,cy+7,h-1.2],[cx-7.1,cy+7,h-0.2],[cx-7.1,cy-7,h-0.2]],[-1,0,0],club,{b:4});
    for(let i=0;i<3;i++){const F=grp();box(F,cx-6+i*3,cy-13,0,0.2,0.2,8,'#d0d3d6',{sh:false});box(F,cx-6+i*3+0.2,cy-13,6.4,1.8,0.1,1.2,i===1?club:'#f4f4f4',{sh:false});}
    rect(cx-12,cy-15,24,5,'#c4beb1');lab('sied',cx,cy,h+3);busy(cx-12,cy-15,24,24);}
  // ---------- SKLEP KIBICA ----------
  {KEY='sklep';HL=pv==='sklep';const L=inf.sklep,[cx,cy]=V3POS.sklep,w=8+2*L,x0=cx-w/2,y0=cy-4,h=L>=4?7:4.5;const G=grp();
    box(G,x0,y0,0,w,8,h,'#eee7da',{top:'#9aa0a6'});face(G,[[x0+1,y0-0.06,0.3],[x0+w-1,y0-0.06,0.3],[x0+w-1,y0-0.06,3],[x0+1,y0-0.06,3]],[0,-1,0],'#4e7493',{b:2});
    face(G,[[x0,y0-0.08,h-1.3],[x0+w,y0-0.08,h-1.3],[x0+w,y0-0.08,h-0.3],[x0,y0-0.08,h-0.3]],[0,-1,0],club,{b:3});
    for(let i=0;i<w/1.2-0.5;i++){const A=grp();box(A,x0+i*1.2,y0-2,3.1,1.2,2,0.3,i%2?club:'#f4f4f4',{sh:false});}
    lab('sklep',cx,cy,h+3);busy(x0-2,y0-4,w+4,14);}
  KEY=null;HL=false;
  // budowy: dźwigi
  for(const b of BLD()){const sub=INFRA.find(x=>x.k===b.k);const k=sub&&sub.sub?sub.sub:b.k;const p=b.k==='park'?[70,-40]:V3POS[k];if(!p)continue;const C=grp();C.key=k;const bx=p[0]+(b.k==='park'?0:k==='hala'?-32:12),by=p[1]+(k==='hala'?18:-10);
    box(C,bx,by,0,0.9,0.9,26,'#e8b52a',{side:'#c99a1f',hl:false});box(C,bx-14,by,25,22,0.9,0.9,'#e8b52a',{side:'#c99a1f',sh:false,hl:false});box(C,bx-14,by,25.9,3,0.9,1.5,'#6b7280',{sh:false,hl:false});
    face(C,[[bx+5,by+0.4,25],[bx+5.1,by+0.4,25],[bx+5.1,by+0.4,17],[bx+5,by+0.4,17]],[0,-1,0],'#333',{hl:false});face(C,[[bx+5,by+0.5,25],[bx+5.1,by+0.5,25],[bx+5.1,by+0.5,17],[bx+5,by+0.5,17]],[0,1,0],'#333',{hl:false});}
  // drzewa wokół
  for(let i=0;i<260;i++){const x=rnd()*430-205,y=rnd()*360-225;if(SC.busy.some(r=>x>r[0]&&x<r[2]&&y>r[1]&&y<r[3]))continue;
    if((x>27&&x<40)||(y>39&&y<52&&x<40)||(x>-73&&x<-60&&y>-78&&y<52)||(y>-85&&y<-72&&x<40))continue;const r=1.8+rnd()*2.2;tree(x,y,r,r+2.5+rnd()*2,rnd()<.5?'#55702f':'#4a6429');}
  for(const G of SC.groups){if(G.tree)continue;if(G.fix){[G.x,G.y,G.z]=G.fix;}else if(G.n){G.x/=G.n;G.y/=G.n;G.z/=G.n;}G.n=0;}
  return SC;}
function v3prj(x,y,z,W,H){const c=Math.cos(V3.yaw),s=Math.sin(V3.yaw);x-=V3.tx;y-=V3.ty;const rx=x*c-y*s,ry=x*s+y*c,cp=Math.cos(V3.pitch),sp=Math.sin(V3.pitch);const Z=V3.zoom*(V3.k||1);return [W/2+rx*Z,H/2+(ry*sp-z*cp)*Z,ry*cp+z*sp];}
function v3vis(n){const c=Math.cos(V3.yaw),s=Math.sin(V3.yaw);return (n[0]*s+n[1]*c)*Math.cos(V3.pitch)+n[2]*Math.sin(V3.pitch)>0.001;}
let V3SC=null;
function v3Draw(){const cv=document.getElementById('v3c');if(!cv||!V3SC)return;const g=cv.getContext('2d');const dpr=window.devicePixelRatio||1;const W=cv.clientWidth||640,H=cv.clientHeight||420;V3.k=clamp(W/800,0.6,1.3);const ZZ=V3.zoom*V3.k;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}g.setTransform(dpr,0,0,dpr,0,0);
  const P=(x,y,z)=>v3prj(x,y,z,W,H);const poly=Q=>{g.beginPath();Q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();};
  g.fillStyle='#5d6a3a';g.fillRect(0,0,W,H);
  for(const d of V3SC.decals){poly(d.p.map(p=>P(p[0],p[1],0)));g.fillStyle=d.c;g.fill();}
  g.beginPath();for(const s of V3SC.shadows)s.forEach((p,i)=>{const q=P(p[0],p[1],0);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);if(i===s.length-1)g.closePath();});g.fillStyle='rgba(20,25,10,0.3)';g.fill('nonzero');
  const picks={};const gs=V3SC.groups.map(G=>({G,d:P(G.x,G.y,G.z)[2]})).sort((a,b)=>a.d-b.d);
  for(const {G} of gs){
    if(G.tree){const b=P(G.x,G.y,0),t=P(G.x,G.y,G.h);if(t[0]<-40||t[0]>W+40||t[1]<-40||t[1]>H+60)continue;g.strokeStyle='#4a3a2a';g.lineWidth=Math.max(1,0.35*ZZ);g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(t[0],t[1]);g.stroke();
      const R=G.r*ZZ;g.fillStyle=v3col(G.c,0.85);g.beginPath();g.arc(t[0],t[1],R,0,6.283);g.fill();g.fillStyle=v3col(G.c,1.15);g.beginPath();g.arc(t[0]-R*0.25,t[1]-R*0.28,R*0.62,0,6.283);g.fill();continue;}
    const fs=[];for(const f of G.f){if(!v3vis(f.n))continue;const Q=f.p.map(p=>P(p[0],p[1],p[2]));let d=0;Q.forEach(p=>d+=p[2]);fs.push({f,Q,d:d/Q.length+f.b});if(G.key)(picks[G.key]=picks[G.key]||[]).push(...Q);}
    fs.sort((a,b)=>a.d-b.d);
    for(const {f,Q} of fs){const l=0.62+0.48*Math.max(0,f.n[0]*V3L[0]+f.n[1]*V3L[1]+f.n[2]*V3L[2]);poly(Q);g.fillStyle=v3col(f.c,l,f.hl);g.fill();g.strokeStyle=g.fillStyle;g.lineWidth=0.6;g.stroke();if(f.hl){g.strokeStyle='rgba(250,190,40,0.9)';g.lineWidth=1;g.stroke();}}}
  V3.picks=Object.entries(picks).map(([k,Q])=>({k,h:v3hull(Q.map(q=>[q[0],q[1]]))}));
  // etykiety budynków
  const inf=myInfra();g.textAlign='center';
  if(V3.zoom<5.5)for(const lb of V3SC.labels){if(ZZ<1.5&&lb.k!==(ui.infraSel||'hala'))continue;const p=P(lb.x,lb.y,lb.z);if(p[0]<-60||p[0]>W+60||p[1]<0||p[1]>H)continue;const f=INFRA.find(x=>x.k===lb.k);const sel=(ui.infraSel||'hala')===lb.k;const bld=BLD().some(b=>b.k===lb.k||(INFRA.find(x=>x.k===b.k)||{}).sub===lb.k);
    g.font='600 11px system-ui,sans-serif';const tw=Math.max(g.measureText(f.n).width,60)+16;g.fillStyle=sel?'rgba(255,176,32,0.95)':'rgba(11,18,32,0.88)';g.strokeStyle=sel?'#ffb020':f.col;g.lineWidth=1.2;
    const x=p[0]-tw/2,y=p[1]-34;g.beginPath();g.roundRect?g.roundRect(x,y,tw,30,7):g.rect(x,y,tw,30);g.fill();g.stroke();g.fillStyle=sel?'#1a1204':'#e6ecf7';g.fillText(f.n,p[0],y+13);
    g.font='10px system-ui,sans-serif';const L=inf[lb.k];g.fillStyle=sel?'#3a2a00':'#ffb020';g.fillText('★'.repeat(L)+'☆'.repeat(5-L)+(bld?'  🏗':''),p[0],y+25);}
}
function v3Req(){if(V3.raf)return;V3.raf=requestAnimationFrame(()=>{V3.raf=0;v3Draw();});}
function v3Focus(k){const p=V3POS[k]||[0,0];if(k==='hala'){V3.tx=8;V3.ty=-8;V3.zoom=3.6;}else{V3.tx=p[0];V3.ty=p[1];V3.zoom=5;}}
function v3View(m){if(m==='all'){Object.assign(V3,{tx:-15,ty:-10,zoom:2,pitch:0.74,roof:true});}else if(m==='in'){const k=ui.infraSel||'hala';v3Focus(k);V3.zoom=k==='hala'?7:7.5;if(k==='hala'){V3.tx=0;V3.ty=0;}V3.pitch=0.95;V3.roof=false;}
  else if(m==='roof'){V3.roof=!V3.roof;}else if(m==='reset'){Object.assign(V3,{yaw:2.5,pitch:0.74,roof:true});v3Focus(ui.infraSel||'hala');}
  ui.v3m=m==='roof'?ui.v3m:m;render();}
function v3Pick(x,y){const ins=(h,px,py)=>{let c=false;for(let i=0,j=h.length-1;i<h.length;j=i++){const [xi,yi]=h[i],[xj,yj]=h[j];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)c=!c;}return c;};
  const hit=(V3.picks||[]).filter(p=>ins(p.h,x,y));if(!hit.length)return;const k=hit[hit.length-1].k;if(k===ui.infraSel)return;ui.infraSel=k;ui.v3prev=null;ui.confirm=null;ui.tmsg=null;v3Focus(k);ui.v3m='bld';render();}
function v3Mount(){const cv=document.getElementById('v3c');if(!cv)return;V3SC=v3Scene();v3Draw();
  const pts=new Map();let moved=0;
  cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;};
  cv.onpointermove=e=>{if(!pts.has(e.pointerId))return;const pr=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(e.clientX-pr[0])+Math.abs(e.clientY-pr[1]);
    if(pts.size===2){const a=[...pts.values()];const o=[...pts.entries()].map(([id,p])=>id===e.pointerId?pr:p);const dn=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),dp=Math.hypot(o[0][0]-o[1][0],o[0][1]-o[1][1]);if(dp>0)V3.zoom=clamp(V3.zoom*dn/dp,1.2,14);v3Req();return;}
    if(e.shiftKey||e.buttons===2){const c=Math.cos(V3.yaw),s=Math.sin(V3.yaw),Z=V3.zoom*(V3.k||1),dx=-(e.clientX-pr[0])/Z,dy=-(e.clientY-pr[1])/Z/Math.sin(V3.pitch);V3.tx+=dx*c+dy*s;V3.ty+=-dx*s+dy*c;}
    else{V3.yaw+=(e.clientX-pr[0])*0.008;V3.pitch=clamp(V3.pitch+(e.clientY-pr[1])*0.006,0.35,1.5);}v3Req();};
  const up=e=>{if(pts.size===1&&moved<6){const r=cv.getBoundingClientRect();v3Pick(e.clientX-r.left,e.clientY-r.top);}pts.delete(e.pointerId);};
  cv.onpointerup=up;cv.onpointercancel=e=>pts.delete(e.pointerId);cv.oncontextmenu=e=>e.preventDefault();
  cv.onwheel=e=>{e.preventDefault();V3.zoom=clamp(V3.zoom*(e.deltaY<0?1.12:0.89),1.2,14);v3Req();};
  cv.onkeydown=e=>{const k=e.key;if(k==='ArrowLeft')V3.yaw-=0.1;else if(k==='ArrowRight')V3.yaw+=0.1;else if(k==='ArrowUp')V3.pitch=clamp(V3.pitch+0.06,0.35,1.5);else if(k==='ArrowDown')V3.pitch=clamp(V3.pitch-0.06,0.35,1.5);else if(k==='+'||k==='=')V3.zoom=clamp(V3.zoom*1.12,1.2,14);else if(k==='-')V3.zoom=clamp(V3.zoom*0.89,1.2,14);else if(k==='Home'){v3View('reset');return;}else return;e.preventDefault();v3Req();};}
function v3Prev(k){ui.v3prev=ui.v3prev===k?null:k;if(ui.v3prev&&(k==='hala'||k==='gosc'||k==='tren'))V3.roof=false;render();}
// ---- ekran infrastruktury ----
function projRow(f){const inf=myInfra(),L=inf[f.k],mx=L>=fMax(f),bs=BLD(),inB=bs.find(b=>b.k===f.k);const full=bs.length>=MAX_BUILDS&&!inB;
  return `<div class="pj2 ${ui.v3prev===f.k?'pv':''}"><div class="row"><b>${f.n}</b><span class="sp"></span><span class="small mut">${L?`poziom ${L}/${fMax(f)}`:'brak'}</span></div>
   <div class="small mut">${f.d}</div><div class="small">Teraz: ${f.eff(L)}</div>
   ${inB?`<div class="small" style="color:var(--acc)">🏗️ W budowie → poziom ${inB.to}, koniec ${fmtDMY(inB.until)}</div>`:mx?'<div class="small good">Maksymalny poziom</div>':`<div class="small good">Po rozbudowie: ${f.eff(L+1)}</div>
   <div class="pjk small"><span>Koszt <b>${fmt(upgradeCost(f,L))}</b></span><span>Czas <b>${upgradeDays(f,L)} dni</b></span><span>Utrzymanie <b>+${fmt(MAINT_PER_LEVEL)}/mies.</b></span></div>
   <div class="row" style="gap:6px;margin-top:6px"><button class="ghost sm" onclick="v3Prev('${f.k}')">${ui.v3prev===f.k?'Ukryj podgląd':'Pokaż na mapie'}</button><button class="btn sm" ${full?'disabled':''} onclick="startBuild('${f.k}')">${ui.confirm==='b'+f.k?`Na pewno? Zapłacisz ${fmt(upgradeCost(f,L))}`:L===0?'Zbuduj':`Rozbuduj do poziomu ${L+1}`}</button></div>${full?`<div class="small mut">Trwają już ${MAX_BUILDS} budowy — poczekaj, aż któraś się skończy.</div>`:''}`}</div>`;}
function hallStats(){const inf=myInfra(),e=ECO(),c=crowdFor(SAVE.team,1,e.tix,true),m=matchday(1,null,null,true);const res=(S().results||[]).flat().filter(r=>r&&r.me&&r.h===SAVE.team);const L=e.last;
  return `<div class="hstat"><div><span>Pojemność</span><b class="acc">${HALA_CAP[inf.hala-1].toLocaleString('pl-PL')} miejsc</b></div><div><span>Ostatni mecz u siebie</span><b>${L?L.att.toLocaleString('pl-PL'):'—'}</b></div><div><span>Szacowana frekwencja</span><b>${c.att.toLocaleString('pl-PL')}</b></div><div><span>Parking</span><b>${parkSpots(inf.park).toLocaleString('pl-PL')} miejsc</b></div><div><span>Loża VIP</span><b>${inf.vip?vipSeats(inf.vip)+' miejsc':'brak'}</b></div><div><span>Sektor gości</span><b>${inf.gosc?guestSeats(inf.gosc)+' miejsc':'brak'}</b></div><div><span>Gastronomia</span><b>${GAS_PR.filter(p=>p[2]<=inf.gastro).length} produktów</b></div><div><span>Za mecz (szac.)</span><b>${fmt(m.tot)}</b></div></div>`;}
function clubView(){
  const inf=myInfra(),bs=BLD();const k=ui.infraSel||'hala';const f=INFRA.find(x=>x.k===k);const L=inf[k];
  const prog=bs.length?`<div class="card build">${bs.map(b=>{const tot=daysBetween(b.start,b.until),done=clamp(daysBetween(b.start,today()),0,tot);const bf=INFRA.find(x=>x.k===b.k);return `<div style="margin-bottom:6px"><b>🏗️ ${bf.n} → poziom ${b.to}</b><div class="pbar"><i style="width:${Math.round(done/tot*100)}%"></i></div><div class="small mut">${done}/${tot} dni · koniec ${fmtLong(b.until)}</div></div>`;}).join('')}<div class="small mut">Budowy: ${bs.length}/${MAX_BUILDS} naraz</div></div>`:'';
  const projs=INFRA.filter(x=>x.k===k||x.sub===k);
  const head=`<div class="card"><div class="row wrap"><h2 style="margin:0">Baza klubu: ${esc(myTeam().name)}</h2><span class="sp"></span><span class="small">Saldo: <b>${fmt(SAVE.fin.bal)}</b> · utrzymanie: <b>${fmt(maintenance())}/mies.</b> · budowy: <b>${bs.length}/${MAX_BUILDS}</b></span></div>
   <div class="v3bar"><span class="small mut">Kliknij budynek, żeby otworzyć jego ekran. Przeciągnij, by obrócić · kółko/dwa palce: zoom · Shift+przeciągnij: przesuń</span><span class="sp"></span>
    <button class="ghost sm ${ui.v3m==='all'?'on':''}" onclick="v3View('all')">Cały kompleks</button><button class="ghost sm ${ui.v3m==='in'?'on':''}" onclick="v3View('in')">Wnętrze</button><button class="ghost sm" onclick="v3View('roof')">${V3.roof?'Zdejmij dach':'Załóż dach'}</button><button class="ghost sm" onclick="v3View('reset')">Reset widoku</button></div>
   <div class="v3w"><canvas id="v3c" tabindex="0"></canvas>${ui.v3prev?`<div class="v3tag">Podgląd: ${esc(INFRA.find(x=>x.k===ui.v3prev).n)} po rozbudowie</div>`:''}</div></div>`;
  const info=`<div class="card ipanel" style="border-color:${f.col}"><div class="row"><h2 style="margin:0">${f.n}</h2><span class="sp"></span><span class="stars">${'★'.repeat(L)}<span class="mut">${'★'.repeat(5-L)}</span></span></div>
   ${ui.tmsg?`<div class="tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}<p class="small mut">${f.d}</p>${k==='hala'?hallStats():`<p class="small">Teraz: <b>${f.eff(L)}</b></p>`}</div>`;
  const pj=`<div class="card"><h2>Projekty budowlane</h2>${projs.map(projRow).join('')}</div>`;
  const extra=k==='hala'?matchdayCard():k==='sklep'?shopCard():'';
  return `${head}${prog}<div class="igrid">${info}${pj}</div>${extra}
  <div class="card"><h2>Wszystkie obiekty</h2><div class="tw"><table><thead><tr><th class="l">Obiekt</th><th>Poziom</th><th class="l">Efekt</th><th>Rozbudowa</th></tr></thead><tbody>${INFRA.map(x=>`<tr class="clickrow" onclick="ui.infraSel='${x.sub||x.k}';ui.v3prev=null;v3Focus('${x.sub||x.k}');render()"><td class="l"><span class="dot" style="background:${x.col}"></span>${x.sub?'↳ ':''}${x.n}</td><td class="stars">${'★'.repeat(inf[x.k])}<span class="mut">${'★'.repeat(fMax(x)-inf[x.k])}</span></td><td class="l small">${x.eff(inf[x.k])}</td><td>${inf[x.k]<fMax(x)?fmt(upgradeCost(x,inf[x.k])):'—'}</td></tr>`).join('')}</tbody></table></div></div>`;
}
