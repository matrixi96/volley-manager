// ================= STROJE KLUBÓW =================
// Każdy klub ma 3 komplety: h — domowy, w — wyjazdowy, l — libero.
// Komplet: p — wzór, a — kolor główny, b — kolor dodatkowy, s — spodenki, c — kołnierz (v / r).
// Własne stroje zapisane są w SAVE.kits[idx klubu]; pozostałe kluby dostają domyślne z barw klubu.
const KIT_PATS=[['plain','Gładka'],['v','Pasy pionowe'],['h','Pas poziomy'],['hoops','Poziome pasy'],['sash','Szarfa'],['half','Połówki'],['side','Boczne wstawki']];
const KIT_COLORS=['#ffffff','#111827','#dc2626','#be123c','#ea580c','#f59e0b','#facc15','#16a34a','#0d9488','#0ea5e9','#2563eb','#1e3a8a','#7c3aed','#db2777','#6b7280','#78350f'];
const KIT_SETS=[['h','Domowy'],['w','Wyjazdowy'],['l','Libero']];
function kitInk(c){return lum(c)>0.6?'#111827':'#ffffff';}
function kitDark(c){const n=parseInt(String(c).slice(1),16);if(isNaN(n))return '#1f2937';return '#'+[n>>16,n>>8&255,n&255].map(v=>Math.round(v*0.45).toString(16).padStart(2,'0')).join('');}
function kitDefault(color){const light=lum(color)>0.7;const away=light?'#111827':'#f1f5f9';const lib=LIBC0(color,away);
  return {h:{p:'plain',a:color,b:light?'#111827':'#ffffff',s:light?'#111827':kitDark(color),c:'v'},
          w:{p:'plain',a:away,b:color,s:light?'#111827':color,c:'v'},
          l:{p:'plain',a:lib,b:kitInk(lib)==='#111827'?'#111827':'#ffffff',s:light?'#111827':kitDark(color),c:'v'}};}
function teamKit(ti){const t=TEAMS[ti];if(!t)return kitDefault('#64748b');const k=SAVE.kits&&SAVE.kits[ti];return k||kitDefault(t.color);}
// --- rysunek koszulki ze spodenkami (podgląd, edytor) ---
function kitPat(k,w,clip){const b=k.b;switch(k.p){
  case 'v':return [0.3,0.43,0.57,0.7].map(x=>`<rect x="${w*x-3}" y="0" width="6" height="200" fill="${b}"/>`).join('');
  case 'h':return `<rect x="0" y="50" width="${w}" height="14" fill="${b}"/>`;
  case 'hoops':return [34,52,70,88].map(y=>`<rect x="0" y="${y}" width="${w}" height="8" fill="${b}"/>`).join('');
  case 'sash':return `<path d="M30 20L46 12L92 100L74 100Z" fill="${b}"/>`;
  case 'half':return `<rect x="${w/2}" y="0" width="${w/2}" height="200" fill="${b}"/>`;
  case 'side':return `<rect x="32" y="44" width="8" height="56" fill="${b}"/><rect x="80" y="44" width="8" height="56" fill="${b}"/><path d="M90 20L110 40L98 52Z" fill="${b}"/><path d="M30 20L10 40L22 52Z" fill="${b}"/>`;
  default:return '';}}
let KIT_UID=0;
function kitSvg(k,num,size){size=size||90;const id='kt'+(++KIT_UID);const body='M30 20L45 12Q60 20 75 12L90 20L110 40L98 52L88 44L88 100L32 100L32 44L22 52L10 40Z';
  const neck=k.c==='r'?`<path d="M45 12Q60 22 75 12" fill="none" stroke="${k.b}" stroke-width="3"/>`:`<path d="M45 12Q52 26 60 30Q68 26 75 12" fill="none" stroke="${k.b}" stroke-width="3"/>`;
  const ink=k.p==='plain'||k.p==='side'?kitInk(k.a):'#ffffff';
  return `<svg class="kitsvg" viewBox="0 0 120 150" width="${size}" height="${Math.round(size*1.25)}"><defs><clipPath id="${id}"><path d="${body}"/></clipPath><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient></defs>
   <path d="${body}" fill="${k.a}"/><g clip-path="url(#${id})">${kitPat(k,120)}<rect width="120" height="110" fill="url(#${id}g)"/></g><path d="${body}" fill="none" stroke="#0b0f14" stroke-width="1.2"/>${neck}
   ${num!=null?`<text x="60" y="80" text-anchor="middle" font-size="32" font-weight="900" font-family="Arial Black,Arial,sans-serif" fill="${ink}" stroke="#0b0f14" stroke-width="1" paint-order="stroke">${num}</text>`:''}
   <path d="M34 102L86 102L90 140L64 140L60 122L56 140L30 140Z" fill="${k.s}" stroke="#0b0f14" stroke-width="1.2"/><path d="M34 106L86 106" stroke="${k.b}" stroke-width="2" opacity=".8"/></svg>`;}
// --- wybór kompletów na mecz (wyjazdowy, gdy domowe barwy są zbyt podobne) ---
let KIT_BY_COLOR={};const LIBC0=libColor;
function teamKitT(t){const k=SAVE.kits&&t&&t.idx!=null&&t.idx>=0&&SAVE.kits[t.idx];return k||kitDefault(t&&t.color||'#64748b');}
function kitPick(m){const T=m.sides.map(s=>s.team);const K=T.map(teamKitT);let s=['h','h'];
  if(cdist(K[0].h.a,K[1].h.a)<110){const homeLeft=m.homeIdx==null||m.homeIdx===T[0].idx;const aw=homeLeft?1:0;s[aw]='w';
    if(cdist(K[aw].w.a,K[1-aw].h.a)<110)s[aw]='alt';}
  const out=[0,1].map(i=>{if(s[i]==='alt'){const hc=K[1-i].h.a;const a=lum(hc)>0.7?'#111827':'#f1f5f9';return {p:'plain',a,b:hc,s:a,c:'v'};}return K[i][s[i]];});
  const libs=[0,1].map(i=>{let l=K[i].l;if(Math.min(cdist(l.a,out[0].a),cdist(l.a,out[1].a))<90){const a=LIBC0(out[i].a,out[1-i].a);l={p:'plain',a,b:kitInk(a),s:out[i].s,c:'v'};}return l;});
  return {k:out,l:libs};}
kitColors=function(m){const P=kitPick(m);KIT_BY_COLOR={};P.k.forEach((k,i)=>{KIT_BY_COLOR[k.a]=k;KIT_BY_COLOR['L'+k.a]=P.l[i];});return P.k.map(k=>k.a);};
// libero: kolor z kompletu libero (gdy pasuje), inaczej dotychczasowy dobór
libColor=function(c,o){const l=KIT_BY_COLOR['L'+c];return l?l.a:LIBC0(c,o);};
// koszulka w widoku klasycznym meczu — wzór z kompletu
{const _j=jersey;jersey=function(p,color,isLib,opp){const k=KIT_BY_COLOR[isLib?'L'+color:color];if(!k||k.p==='plain')return _j.apply(this,arguments);
  const html=_j(p,isLib?k.a:color,false,opp);const id='jk'+(++KIT_UID);const body='M19 3 L25 5 Q30 9 35 5 L41 3 L58 13 L52 25 L46 22 L46 54 L14 54 L14 22 L8 25 L2 13 Z';
  return html.replace(/(<path d="M19 3[^>]*\/>)/,`<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>$1<g clip-path="url(#${id})"><g transform="scale(.5)">${kitPat(k,120)}</g></g>`);};}
// 3D: koszulka, spodenki i libero z kompletu (kolory; wzory na modelach to zadanie widoku 3D)
if(typeof v3dKits==='function'){const _v=v3dKits;v3dKits=function(m){const K=_v.apply(this,arguments);try{const P=kitPick(m);P.k.forEach((k,i)=>{K[i].jersey=k.a;K[i].shorts=k.s;K[i].ink=kitInk(k.a);K[i].lib=P.l[i].a;K[i].libInk=kitInk(P.l[i].a);K[i].trim=k.b;K[i].pattern=k.p;K[i].libTrim=P.l[i].b;K[i].libPattern=P.l[i].p;});}catch(e){console.error(e);}return K;};}
// --- edytor strojów ---
function kitEdState(src){return src;}
function kitEditor(kits,setKey,onCh){const k=kits[setKey];const sw=(f)=>KIT_COLORS.map(c=>`<button class="ksw ${k[f]===c?'on':''}" style="background:${c}" onclick="${onCh}('${setKey}','${f}','${c}')" title="${c}"></button>`).join('')+`<label class="ksw kpick" title="Własny kolor"><input type="color" value="${k[f]}" onchange="${onCh}('${setKey}','${f}',this.value)">+</label>`;
  return `<div class="kited"><div class="kprev">${KIT_SETS.map(([s,n])=>`<button class="kpv ${s===setKey?'on':''}" onclick="${onCh}('${s}','_sel','')">${kitSvg(kits[s],s==='l'?1:7,s===setKey?120:70)}<span>${_t(n)}</span></button>`).join('')}</div>
   <div class="kopts"><div class="klab">${_t('Wzór koszulki')}</div><div class="row wrap" style="gap:6px">${KIT_PATS.map(([p,n])=>`<button class="ghost sm ${k.p===p?'on':''}" onclick="${onCh}('${setKey}','p','${p}')">${_t(n)}</button>`).join('')}</div>
    <div class="klab">${_t('Kolor główny')}</div><div class="kcols">${sw('a')}</div>
    <div class="klab">${_t('Kolor dodatkowy (wzór, kołnierz, numer)')}</div><div class="kcols">${sw('b')}</div>
    <div class="klab">${_t('Spodenki')}</div><div class="kcols">${sw('s')}</div>
    <div class="klab">${_t('Kołnierz')}</div><div class="row" style="gap:6px"><button class="ghost sm ${k.c!=='r'?'on':''}" onclick="${onCh}('${setKey}','c','v')">V-neck</button><button class="ghost sm ${k.c==='r'?'on':''}" onclick="${onCh}('${setKey}','c','r')">${_t('Okrągły')}</button></div></div></div>`;}
// kreator nowego klubu
function ocKit(){const o=ocDraft();if(!o.kit||o.kitCol!==o.color&&!o.kitTouched){o.kit=kitDefault(o.color);o.kitCol=o.color;}return o.kit;}
function ocKitCh(s,f,v){const o=ocDraft();const K=ocKit();if(f==='_sel'){ui.ocKs=s;render();return;}K[s][f]=v;o.kitTouched=true;ui.ocKs=s;render();}
{const _ov=ownClubView;ownClubView=function(){const h=_ov.apply(this,arguments);const K=ocKit();const ed=`<h3>${_t('Stroje klubu')}</h3><p class="small mut">${_t('Komplet domowy, wyjazdowy i libero. Będą widoczne na twarzach zawodników, w składzie i na boisku. Na wyjeździe drużyna sama założy strój wyjazdowy, gdy barwy są zbyt podobne do rywala.')}</p>${kitEditor(K,ui.ocKs||'h','ocKitCh')}`;
  return h.replace('<h3>Charakter klubu</h3>',ed+'<h3>Charakter klubu</h3>');};}
{const _fc=foundClub;foundClub=function(){const o=ocDraft();const K=JSON.parse(JSON.stringify(ocKit()));const r=_fc.apply(this,arguments);try{if(SAVE.custom&&SAVE.custom.idx===o.replace){SAVE.kits=SAVE.kits||{};SAVE.kits[o.replace]=K;save();}}catch(e){console.error(e);}return r;};}
// zakładka Klub → Stroje (dla prowadzonego klubu)
function myKits(){SAVE.kits=SAVE.kits||{};if(!SAVE.kits[SAVE.team])SAVE.kits[SAVE.team]=JSON.parse(JSON.stringify(teamKit(SAVE.team)));return SAVE.kits[SAVE.team];}
function clubKitCh(s,f,v){if(f==='_sel'){ui.kitS=s;render();return;}myKits()[s][f]=v;ui.kitS=s;save();render();}
function clubKitReset(){if(SAVE.kits)delete SAVE.kits[SAVE.team];save();render();}
function clubKitCard(){if(SAVE.team==null)return '';const K=SAVE.kits&&SAVE.kits[SAVE.team]?SAVE.kits[SAVE.team]:teamKit(SAVE.team);
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">${_t('Stroje klubu')}</h2><span class="sp"></span><button class="ghost sm" onclick="clubKitReset()">${_t('Przywróć domyślne')}</button></div>
   <p class="small mut">${_t('Stroje widać na twarzach zawodników, w składzie, w meczu (widok 2D i klasyczny) oraz kolory w widoku 3D. Na wyjeździe drużyna sama założy strój wyjazdowy, gdy barwy są zbyt podobne do rywala.')}</p>
   ${kitEditor(SAVE.kits&&SAVE.kits[SAVE.team]?SAVE.kits[SAVE.team]:JSON.parse(JSON.stringify(K)),ui.kitS||'h',SAVE.kits&&SAVE.kits[SAVE.team]?'clubKitCh':'clubKitCh0')}</div>`;}
function clubKitCh0(s,f,v){myKits();clubKitCh(s,f,v);}
{const _cv=clubView;clubView=function(){return _cv.apply(this,arguments)+clubKitCard();};}
if(typeof SUBT!=='undefined'&&SUBT.klub)SUBT.klub.push(['st','Stroje',/Stroje klubu/i]);

// widok 2D: wzór koszulki na kółku zawodnika
function kitDot(g,x,y,R,key){const k=KIT_BY_COLOR[key];if(!k||k.p==='plain')return;g.save();g.beginPath();g.arc(x,y,R,0,7);g.clip();g.fillStyle=k.b;
  const w=R*2;if(k.p==='v')for(let i=-1;i<=1;i++)g.fillRect(x+i*R*0.62-R*0.14,y-R,R*0.28,w);
  else if(k.p==='h')g.fillRect(x-R,y-R*0.25,w,R*0.5);else if(k.p==='hoops'){g.fillRect(x-R,y-R*0.55,w,R*0.28);g.fillRect(x-R,y+R*0.27,w,R*0.28);}
  else if(k.p==='half')g.fillRect(x,y-R,R,w);else if(k.p==='side'){g.fillRect(x-R,y-R,R*0.45,w);g.fillRect(x+R*0.55,y-R,R*0.45,w);}
  else if(k.p==='sash'){g.beginPath();g.moveTo(x-R,y-R*0.6);g.lineTo(x-R*0.5,y-R);g.lineTo(x+R,y+R*0.6);g.lineTo(x+R*0.5,y+R);g.closePath();g.fill();}
  g.restore();}

// ================= LOGA SPONSORÓW (generowane z nazwy) =================
const SP_ICONS={
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
 bank:'<path d="M12 2 2 7v2h20V7zM4 10h3v8H4zm6.5 0h3v8h-3zM17 10h3v8h-3zM2 19h20v3H2z"/>',
 signal:'<path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 13a7 7 0 0 1 10 0l-1.6 1.6a4.7 4.7 0 0 0-6.8 0zM3.5 9.5a12 12 0 0 1 17 0l-1.6 1.6a9.8 9.8 0 0 0-13.8 0z"/>',
 leaf:'<path d="M20 3C9 3 4 9 4 16c0 2 .5 3.5 1 4.5C7 14 11 10 16 8c-4 3-7 7-8.5 12.5 1 .3 2 .5 3 .5C18 21 21 13 20 3z"/>',
 shield:'<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/>',
 wheel:'<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
 beam:'<path d="M4 3h16v4h-6v10h6v4H4v-4h6V7H4z"/>',
 cross:'<path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z"/>',
 chip:'<path d="M8 2h2v3h4V2h2v3h3v3h3v2h-3v4h3v2h-3v3h-3v3h-2v-3h-4v3H8v-3H5v-3H2v-2h3v-4H2V8h3V5h3zm-1 5v10h10V7z"/>',
 squares:'<path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 4a4 4 0 1 0 8 0 4 4 0 0 0-8 0z"/>',
 house:'<path d="M12 3 2 11h3v10h5v-6h4v6h5V11h3z"/>',
 play:'<path d="M5 3v18l15-9z"/>',
 plane:'<path d="M21 15v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5.5z"/>',
 drop:'<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/>',
 flask:'<path d="M9 2h6v2h-1v5l6 10c.8 1.4-.2 3-1.8 3H5.8C4.2 22 3.2 20.4 4 19l6-10V4H9z"/>',
 flame:'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/>',
 wheat:'<path d="M11 22V12M11 12c-3 0-5-2-5-5 3 0 5 2 5 5zm0 0c3 0 5-2 5-5-3 0-5 2-5 5zm0-4c-2.5 0-4-1.7-4-4 2.5 0 4 1.7 4 4zm0 0c2.5 0 4-1.7 4-4-2.5 0-4 1.7-4 4z" stroke="#fff" stroke-width="2" fill="none"/>',
 chair:'<path d="M6 2h12v9H6zM4 12h16v3h-2v7h-2v-7H8v7H6v-7H4z"/>',
 window:'<path d="M3 3h18v18H3zm2 2v6h6V5zm8 0v6h6V5zM5 13v6h6v-6zm8 0v6h6v-6z"/>',
 truck:'<path d="M2 5h12v10H2zm12 4h4l4 4v2h-8zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
 ball:'<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.7 0 3.3.5 4.6 1.4-2.8.3-5.4 1.8-7 4.1A9 9 0 0 1 6 5.5 8 8 0 0 1 12 4zm-8 8c0-1.6.5-3.1 1.3-4.4 1.7 1.6 4 2.6 6.4 2.7-1.2 2.7-1.2 5.8.1 8.4A8 8 0 0 1 4 12zm10 7.7c-1.6-2.4-1.9-5.4-.9-8.1 2.5.9 4.6 2.8 5.8 5.2A8 8 0 0 1 14 19.7zM20 12c0 .6-.1 1.2-.2 1.8a11 11 0 0 0-5.7-4.3c1.4-1.7 3.5-2.8 5.7-2.8.1.1.2 4.7.2 5.3z"/>',
 swoosh:'<path d="M2 16c6 2 12-2 20-10-4 8-9 13-15 13-3 0-5-1-5-3z"/>',
 star:'<path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/>'};
const SP_IND={Energia:'bolt',Logistics:'truck',Bank:'bank',Telecom:'signal',Foods:'leaf',Ubezpieczenia:'shield',Motors:'wheel',Steel:'beam',Pharma:'cross',Tech:'chip',Group:'squares',Budownictwo:'house',Media:'play',Travel:'plane',Wody:'drop',Chem:'flask',Software:'chip',Paliwa:'flame',Agro:'wheat',Meble:'chair',Okna:'window',Dom:'house',Finanse:'bank',Transport:'truck',Sport:'ball',Pro:'star',Wear:'swoosh',Athletics:'swoosh',Gear:'ball',Team:'star'};
function spHash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
function spMark(c,size){size=size||34;const n=String(c.n||'');const h=spHash(n);const w=n.split(' ');const ic=SP_ICONS[SP_IND[w[w.length-1]]]||SP_ICONS[['star','squares','swoosh','bolt'][h%4]];
  const col=c.col||'#38bdf8';const col2=['#0f172a','#111827','#1e293b','#ffffff'][h%4];const shape=h%5;const id='sg'+h.toString(36)+size;
  const bgShape=[`<circle cx="20" cy="20" r="19"/>`,`<rect x="1" y="1" width="38" height="38" rx="9"/>`,`<path d="M20 1 37 10.5v19L20 39 3 29.5v-19z"/>`,`<path d="M20 1 37 6v13c0 10-7.5 17-17 20C10.5 36 3 29 3 19V6z"/>`,`<rect x="1" y="5" width="38" height="30" rx="15"/>`][shape];
  const fg=col2==='#ffffff'?col:'#ffffff';const bgc=col2==='#ffffff'?'#ffffff':col;
  return `<svg class="spmark" viewBox="0 0 40 40" width="${size}" height="${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgc}"/><stop offset="1" stop-color="${col2==='#ffffff'?'#e5e7eb':kitDark(col)}"/></linearGradient></defs>
   <g fill="url(#${id})" stroke="${col2==='#ffffff'?col:'#ffffff33'}" stroke-width="1.5">${bgShape}</g><g transform="translate(8 8) scale(1)" fill="${fg}">${ic}</g></svg>`;}
// logo poziome: znak + nazwa (do kart sponsorów)
function spLogo(c,size){const n=String(c.n||'');const h=spHash(n);const w=n.split(' ');const font=['Bahnschrift,Arial Narrow,sans-serif','Georgia,serif','Arial Black,Arial,sans-serif','Trebuchet MS,sans-serif'][h%4];const ital=h%3===0?'italic':'normal';
  return `<span class="splogo">${spMark(c,size||34)}<span class="splw" style="font-family:${font};font-style:${ital};color:${c.col}">${esc(w[0].toUpperCase())}<small>${esc(w.slice(1).join(' '))}</small></span></span>`;}
if(typeof spBadge==='function')spBadge=function(c){return spMark(c,34);};
