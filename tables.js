(() => {
 const page=(location.pathname.split('/').pop()||'').toLowerCase();
 const cell=(row,value)=>{const td=document.createElement('td');td.textContent=String(value??'—');row.append(td);return td;};
 const teamCell=(row,name)=>{const td=document.createElement('td'),wrap=document.createElement('div'),badge=document.createElement('span');wrap.className='team';badge.className='team-badge';badge.textContent=(name||'T').charAt(0).toUpperCase();wrap.append(badge,document.createTextNode(name));td.append(wrap);row.append(td);};
 const standings=Matchday.standings(); const matches=Matchday.matches(); const teams=Matchday.teams();
 if(page==='points.html'){
   const tbody=document.querySelector('.card table tbody'); if(tbody){tbody.replaceChildren();standings.forEach((t,i)=>{const tr=document.createElement('tr');cell(tr,String(i+1).padStart(2,'0'));teamCell(tr,t.name);[t.played,t.won,t.drawn,t.lost].forEach(v=>cell(tr,v));const td=cell(tr,t.points),b=document.createElement('b');b.textContent=t.points;td.replaceChildren(b);tbody.append(tr);});if(!standings.length){const tr=document.createElement('tr'),td=cell(tr,'No teams or match results yet.');td.colSpan=7;tbody.append(tr);}}
   const note=document.querySelector('.card .notice');if(note)note.textContent='Live standings are calculated from teams and scores saved by the admin in this browser.';
 }
 if(page==='leaderboard.html'){
   const tbody=document.querySelector('.card table tbody');if(tbody){tbody.replaceChildren();standings.forEach((t,i)=>{const tr=document.createElement('tr');cell(tr, i===0?'🥇 1':i===1?'🥈 2':i===2?'🥉 3':i+1);teamCell(tr,t.name);cell(tr,t.played);const td=cell(tr,t.points),b=document.createElement('b');b.textContent=t.points;td.replaceChildren(b);cell(tr,i===0?'Leading':i<3?'Contender':'Active');tbody.append(tr);});if(!standings.length){const tr=document.createElement('tr'),td=cell(tr,'No leaderboard data yet.');td.colSpan=5;tbody.append(tr);}}
   const winner=document.querySelector('.winner');if(winner){const h=winner.querySelector('h2'),p=winner.querySelector('p:not(.kicker)');if(h)h.textContent=standings[0]?`🏆 ${standings[0].name}`:'🏆 No leader yet';if(p)p.textContent=standings[0]?`Leading with ${standings[0].points} points in ${standings[0].game}.`:'Results will appear after the admin records match scores.';}
   const stats=document.querySelectorAll('.stats .stat-value');if(stats[0])stats[0].textContent=standings.length?'01':'—';if(stats[1])stats[1].textContent=teams.length;if(stats[2])stats[2].textContent=standings.length?`${standings[0].points} PTS`:'0 PTS';const foot=document.querySelectorAll('.stats .stat-foot');if(foot[0])foot[0].textContent=standings[0]?.name||'No leader yet';if(foot[2])foot[2].textContent='Calculated from recorded results';const kicker=document.querySelector('.winner .kicker');if(kicker)kicker.textContent='CURRENT TOP TEAM';
 }
 if(page==='schedule.html'){
   const tbody=document.querySelector('.card table tbody');if(tbody){tbody.replaceChildren();matches.forEach((m,i)=>{const tr=document.createElement('tr');cell(tr,'M'+String(i+1).padStart(2,'0'));cell(tr,`${m.teamA} vs ${m.teamB}`);cell(tr,m.date||'Date not set');cell(tr,'—');cell(tr,'—');const status=cell(tr,'Result recorded');status.className='status completed';tbody.append(tr);});if(!matches.length){const tr=document.createElement('tr'),td=cell(tr,'No fixtures recorded yet. Admin can add match results from the admin dashboard.');td.colSpan=6;tbody.append(tr);}}
   const notice=document.querySelector('.main > .notice');if(notice)notice.textContent='This page displays matches entered by the admin. Upcoming fixtures and kick-off times are not stored by the current demo.';
   const subtitle=document.querySelector('.page-head .subtitle');if(subtitle)subtitle.textContent='Matches recorded by the tournament admin.';
 }
})();
