// ================= USTAWIENIA (dawniej „Zapis gry”): Ogólne · Grafika · Dźwięk · Zapis gry =================
NAV_L.zapis='Ustawienia';
IC.zapis='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
// ---- preferencje graficzne i gry (zapamiętywane w urządzeniu) ----
const SET_SPEEDS=[[1600,'0,5x'],[800,'1x'],[250,'2x'],[50,'4x']];
function setPref(k,v){uiPrefSet(k,String(v));setApply();render();}
function setApply(){try{const z=+uiPref('zoom','100')||100;document.documentElement.style.fontSize=z===100?'':(z/100*16)+'px';document.body.style.zoom=z===100?'':String(z/100);
  document.body.classList.toggle('calm',uiPref('calm','0')==='1');}catch(e){}}
// domyślne ustawienia widoku meczu przy starcie gry
(function(){try{const sp=+uiPref('speed','0');if(sp)ui.speed=sp;const mv=uiPref('mview',null);if(mv)ui.mview=mv;if(uiPref('anim','1')==='0')ui.anim=false;}catch(e){}setTimeout(setApply,0);})();
function setSeg(k,opts,cur){return `<div class="seg">${opts.map(([v,l])=>`<button class="${String(cur)===String(v)?'on':''}" onclick="${k.split('#').join("'"+v+"'")}">${l}</button>`).join('')}</div>`;}
function setRow(label,ctrl,hint){return `<div class="setrow"><div><b>${label}</b>${hint?`<small class="mut">${hint}</small>`:''}</div><div>${ctrl}</div></div>`;}
function setGeneral(){return `<div class="card"><h2>${_t('Ogólne')}</h2>
  ${setRow(_t('Język / Language'),langBtns(),LANG==='en'?_t('Tłumaczenie na angielski jest w trakcie — część ekranów jest jeszcze po polsku.'):'')}
  ${setRow(_t('Menu główne'),`<button class="ghost" onclick="ui.start=true;render()">${_t('⏏ Wyjdź do menu głównego')}</button>`,_t('Gra zapisuje się automatycznie.'))}</div>${typeof guideCard==='function'?guideCard():''}`;}
function setGraphics(){const th=themeCur();const G=navGroups();const z=uiPref('zoom','100');const mv=uiPref('mview','hala');const v3=(()=>{try{return localStorage.getItem('vm_v3d2')!=='0';}catch(e){return true;}})();
  return `<div class="card"><h2>${_t('Grafika')}</h2>
  ${setRow(_t('Motyw'),setSeg("themeSet(#)",[['n',_t('Granat (kolor klubu)')],['fm',_t('Grafit')],['classic',_t('Klasyczny (złoty)')]],th==='n'||th==='fm'?th:'classic'))}
  ${setRow(_t('Rozmiar interfejsu'),setSeg("setPref('zoom',#)",[['90','90%'],['100','100%'],['110','110%'],['125','125%']],z),_t('Większy przydaje się na dużych ekranach, mniejszy na laptopach.'))}
  ${setRow(_t('Ograniczenie animacji'),setSeg("setPref('calm',#)",[['0',_t('Wył.')],['1',_t('Wł.')]],uiPref('calm','0')),_t('Wyłącza migające i pulsujące elementy interfejsu.'))}
  <h3>${_t('Mecz')}</h3>
  ${setRow(_t('Domyślny widok meczu'),setSeg("setPref('mview',#);ui.mview=uiPref('mview')",[['hala',_t('Hala')],['klasyczny',_t('Klasyczny')]],mv))}
  ${setRow(_t('Hala'),setSeg("(function(v){try{localStorage.setItem('vm_v3d2',v);}catch(e){}ui.v3d=v==='1';render();})(#)",[['1','3D'],['0','2D']],v3?'1':'0'),_t('3D wymaga mocniejszego komputera. Na słabszym telefonie wybierz 2D.'))}
  ${setRow(_t('Animacja akcji'),setSeg("setPref('anim',#);ui.anim=uiPref('anim')!=='0'",[['1',_t('Wł.')],['0',_t('Wył.')]],uiPref('anim','1')))}
  ${setRow(_t('Domyślna szybkość meczu'),setSeg("setPref('speed',#);ui.speed=+uiPref('speed')",SET_SPEEDS.map(([v,l])=>[String(v),l]),uiPref('speed',String(ui.speed||1600))))}
  <details style="margin-top:12px"><summary>${_t('Kolejność menu bocznego')}</summary><p class="small mut">${_t('Na komputerze możesz po prostu przeciągać pozycje w menu po lewej. Tutaj — strzałkami (działa też na telefonie).')}</p>
   ${G.map(([g,ks])=>`<div class="small mut" style="margin-top:6px">${_t(g)}</div>${ks.map(k=>`<div class="res row small" style="gap:6px"><span>${NAV_L[k]}</span><span class="sp"></span><button class="ghost sm" onclick="navStep('${k}',-1)">▲</button><button class="ghost sm" onclick="navStep('${k}',1)">▼</button></div>`).join('')}`).join('')}
   <button class="ghost sm" style="margin-top:8px" onclick="navReset()">${_t('Przywróć domyślną kolejność')}</button></details></div>`;}
function setSound(){const c=sndCfg();const tg=(k,v)=>`sndInit();sndSet('${k}',${v})`;
  return `<div class="card"><h2>${_t('Dźwięk')}</h2>
  ${setRow(_t('Dźwięk'),`<div class="seg"><button class="${c.on?'on':''}" onclick="${tg('on',1)}">${_t('Wł.')}</button><button class="${!c.on?'on':''}" onclick="${tg('on',0)}">${_t('Wył.')}</button></div>`)}
  ${setRow(_t('Głośność'),`<input type="range" min="0" max="100" value="${Math.round(c.vol*100)}" oninput="this.nextElementSibling.textContent=this.value+'%'" onchange="sndSet('vol',this.value/100)"> <b>${Math.round(c.vol*100)}%</b>`)}
  ${setRow(_t('Dźwięki meczu'),`<div class="seg"><button class="${c.match?'on':''}" onclick="${tg('match',1)}">${_t('Wł.')}</button><button class="${!c.match?'on':''}" onclick="${tg('match',0)}">${_t('Wył.')}</button></div>`,_t('Piłka, gwizdek sędziego, kibice.'))}
  ${setRow(_t('Kibice'),`<div class="seg"><button class="${c.crowd!==0?'on':''}" onclick="${tg('crowd',1)}">${_t('Wł.')}</button><button class="${c.crowd===0?'on':''}" onclick="${tg('crowd',0)}">${_t('Wył.')}</button></div>`,_t('Szum trybun i reakcje po punktach.'))}
  ${setRow(_t('Powiadomienia'),`<div class="seg"><button class="${c.ui?'on':''}" onclick="${tg('ui',1)}">${_t('Wł.')}</button><button class="${!c.ui?'on':''}" onclick="${tg('ui',0)}">${_t('Wył.')}</button></div>`,_t('Dźwięk nowej wiadomości.'))}
  <button class="ghost sm" style="margin-top:8px" onclick="sndInit();setTimeout(()=>{sndHit('serve');setTimeout(()=>sndHit('bump'),500);setTimeout(()=>sndHit('set'),900);setTimeout(()=>sndHit('spike'),1300);setTimeout(()=>sndHit('floor'),1650);setTimeout(()=>sndWhistle(0.3),1900);setTimeout(()=>sndCheer(1,25),2100);},50)">${_t('▶ Posłuchaj')}</button>
  <p class="small mut">${_t('Dźwięki są generowane w grze. Szybka symulacja meczu jest cicha.')}</p></div>`;}
const SET_TABS=[['ogol','Ogólne'],['graf','Grafika'],['dzw','Dźwięk'],['zap','Zapis gry']];
saveView=function(){const t=ui.setTab||'ogol';
  const body=t==='graf'?setGraphics():t==='dzw'?setSound():t==='zap'?saveBaseView():setGeneral();
  return `<div class="subtabs">${SET_TABS.map(([k,l])=>`<button class="${k===t?'on':''}" onclick="ui.setTab='${k}';ui.confirm=null;render()">${_t(l)}</button>`).join('')}</div>${body}`;};
