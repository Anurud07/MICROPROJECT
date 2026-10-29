(() => {
  const editor=document.getElementById('scoreEditor'), notice=document.getElementById('scoreAccessNotice'), form=document.getElementById('scoreForm'), message=document.getElementById('scoreMessage');
  const tbody=document.querySelector('table tbody'); const user=Matchday.currentUser(),isAdmin=user?.role==='admin';
  if(editor)editor.hidden=!isAdmin;
  if(notice){notice.textContent=isAdmin?'Admin mode: update scores for matches recorded from the admin dashboard. Changes update standings automatically.':'View-only mode. Match results are maintained by the tournament admin.';}
  const result=m=>m.scoreA>m.scoreB?`${m.teamA} Win`:m.scoreB>m.scoreA?`${m.teamB} Win`:'Draw';
  function render(){const all=Matchday.matches();if(tbody){tbody.replaceChildren();if(!all.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent='No match results recorded yet.';tr.append(td);tbody.append(tr);}all.slice().reverse().forEach((m,i)=>{const tr=document.createElement('tr');[`M${String(all.length-i).padStart(2,'0')}`,m.teamA,`${m.scoreA} - ${m.scoreB}`,m.teamB,result(m)].forEach((v,j)=>{const td=document.createElement('td');td.textContent=v;if(j===2){const b=document.createElement('b');b.textContent=v;td.replaceChildren(b);}tr.append(td);});tbody.append(tr);});}
    const select=document.getElementById('match');if(select){const prev=select.value;select.replaceChildren();all.forEach((m,i)=>{const o=document.createElement('option');o.value=m.id;o.textContent=`${m.game}: ${m.teamA} vs ${m.teamB}`;select.append(o);});if(all.some(m=>m.id===prev))select.value=prev;}
  }
  if(form&&isAdmin)form.addEventListener('submit',e=>{e.preventDefault();try{const id=document.getElementById('match').value;if(!id)throw new Error('No recorded match to update. Add a match from the admin dashboard first.');Matchday.updateMatch(id,{scoreA:document.getElementById('teamA').value,scoreB:document.getElementById('teamB').value,date:document.getElementById('date').value,remarks:document.getElementById('remarks').value.trim()});message.hidden=false;message.textContent='Score updated. Points table and leaderboard have been recalculated.';render();}catch(err){message.hidden=false;message.textContent=err.message;}});
  render();
})();
