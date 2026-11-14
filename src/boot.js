applyCustom();
// ================= START =================
if(SAVE.team!=null){if(!SAVE.date&&!SAVE.world)SAVE.date=GAME_START;if(!SAVE.world)initWorld();else syncTeams();if(!SAVE.season)newSeason(1);migrateDates();initClub();}
if(SAVE.live){try{ui.match=deserMatch(SAVE.live);ui.match.log.push({t:'Wznowiono zapisany mecz — kliknij „Graj”, żeby kontynuować.',c:'sys'});}catch(e){SAVE.live=null;ui.match=null;}}
render();
if(document.addEventListener)document.addEventListener('click',e=>{const t=e.target;if(t&&t.closest&&!t.closest('.tsearch')){const d=document.getElementById('psd');if(d)d.classList.remove('on');}});

if(document.addEventListener)document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key&&e.key.toLowerCase()==='k'){const q=document.getElementById('psq');if(q){e.preventDefault();q.focus();q.select();}return;}if(e.key==='Escape'&&ui.q){ui.q='';render();return;}if(e.code==='Space'&&ui.match&&!ui.match.over&&ui.tab==='mecz'&&!/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')){e.preventDefault();togglePause();}});
