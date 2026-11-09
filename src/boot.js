// ================= START =================
if(SAVE.team!=null){if(!SAVE.date&&!SAVE.world)SAVE.date=GAME_START;if(!SAVE.world)initWorld();else syncTeams();if(!SAVE.season)newSeason(1);migrateDates();}
if(SAVE.live){try{ui.match=deserMatch(SAVE.live);ui.match.log.push({t:'Wznowiono zapisany mecz — kliknij „Graj”, żeby kontynuować.',c:'sys'});}catch(e){SAVE.live=null;ui.match=null;}}
render();
