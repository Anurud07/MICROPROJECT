(() => {
  const form=document.getElementById('team-registration-form'), card=document.getElementById('team-registration-card'), notice=document.getElementById('team-admin-notice'), message=document.getElementById('team-message'), tbody=document.getElementById('registered-teams');
  const user=Matchday.currentUser(), isAdmin=Boolean(user&&user.role==='admin');
  if(card) card.hidden=!isAdmin; if(notice) notice.hidden=isAdmin;
  const cell=v=>{const td=document.createElement('td');td.textContent=String(v??'—');return td;};
  function render(){ if(!tbody)return; tbody.replaceChildren(); const all=Matchday.teams();
    all.forEach((team,i)=>{const tr=document.createElement('tr');tr.append(cell(String(i+1).padStart(2,'0')));const td=document.createElement('td'),wrap=document.createElement('div'),badge=document.createElement('span');wrap.className='team';badge.className='team-badge';badge.textContent=(team.name||'T').charAt(0).toUpperCase();wrap.append(badge,document.createTextNode(team.name));td.append(wrap);tr.append(td,cell(team.captain||'—'),cell(team.players||'—'),cell(team.game||'General'));tbody.append(tr);});
    const stats=document.querySelectorAll('.stats .stat-value'); if(stats[0])stats[0].textContent=String(all.length).padStart(2,'0');if(stats[1])stats[1].textContent=all.reduce((sum,t)=>sum+(Number(t.players)||0),0);
    if(!all.length){const tr=document.createElement('tr'),td=cell('No teams registered yet.');td.colSpan=5;tr.append(td);tbody.append(tr);}
  }
  if(form)form.addEventListener('submit',e=>{e.preventDefault();try{const current=Matchday.currentUser();if(!current||current.role!=='admin')throw new Error('Admin login is required to register a team.');Matchday.addTeam({name:document.getElementById('team').value,captain:document.getElementById('captain').value,players:document.getElementById('players').value,contact:document.getElementById('contact').value,game:document.getElementById('teamGame')?.value||'General'});message.hidden=false;message.textContent='Team registered successfully.';form.reset();render();}catch(err){message.hidden=false;message.textContent=err.message;}});
  render();
})();
