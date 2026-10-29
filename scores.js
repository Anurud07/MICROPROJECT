(() => {
  const editor = document.getElementById("scoreEditor");
  const accessNotice = document.getElementById("scoreAccessNotice");
  const form = document.getElementById("scoreForm");
  const message = document.getElementById("scoreMessage");
  const tbody = document.querySelector("#scoreEditor")?.parentElement?.nextElementSibling?.querySelector("tbody") || document.querySelector("table tbody");
  const KEY = "matchday_demo_scores_v1";
  const defaults = [
    {match:"Match 01 — City Titans vs Warriors", short:"M01", a:"City Titans", b:"Warriors", scoreA:3, scoreB:1},
    {match:"Match 02 — Strikers vs Rangers", short:"M02", a:"Strikers", b:"Rangers", scoreA:2, scoreB:2},
    {match:"Match 03 — Falcons vs United", short:"M03", a:"Falcons", b:"United", scoreA:1, scoreB:0}
  ];
  const readScores = () => {
    try { const saved = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(saved) && saved.length ? saved : defaults.map(x=>({...x})); }
    catch { return defaults.map(x=>({...x})); }
  };
  let scores = readScores();
  const user = Matchday.currentUser();
  const isAdmin = user?.role === "admin";
  if (isAdmin) {
    editor.hidden = false;
    accessNotice.textContent = "Admin mode: you can update match scores. Changes are saved in this browser only.";
    accessNotice.classList.add("notice-success");
  } else {
    editor.hidden = true;
    accessNotice.textContent = "View-only mode. Only the admin can change match scores. Log in with the admin account to edit results.";
  }
  const outcome = s => s.scoreA > s.scoreB ? `${s.a} Win` : s.scoreA < s.scoreB ? `${s.b} Win` : "Draw";
  function render() {
    tbody.replaceChildren();
    scores.forEach((s, i) => {
      const tr=document.createElement("tr");
      [s.short,s.a,`${s.scoreA} - ${s.scoreB}`,s.b,outcome(s)].forEach(v=>{const td=document.createElement("td");td.textContent=v;if(v===`${s.scoreA} - ${s.scoreB}`){const b=document.createElement("b");b.textContent=v;td.replaceChildren(b);}tr.appendChild(td);});
      tbody.appendChild(tr);
    });
    if (isAdmin) {
      const select=document.getElementById("match");
      const previous=select.value;
      select.replaceChildren();
      scores.forEach(s=>{const o=document.createElement("option");o.value=s.short;o.textContent=s.match;select.appendChild(o);});
      if(scores.some(s=>s.short===previous)) select.value=previous;
    }
  }
  if (isAdmin) form.addEventListener("submit", e=>{
    e.preventDefault();
    const selected=scores.find(s=>s.short===document.getElementById("match").value);
    const a=document.getElementById("teamA").value, b=document.getElementById("teamB").value;
    if(!selected || a==="" || b==="" || Number(a)<0 || Number(b)<0){message.hidden=false;message.textContent="Select a match and enter both non-negative scores.";return;}
    selected.scoreA=Number(a);selected.scoreB=Number(b);
    const date=document.getElementById("date").value, remarks=document.getElementById("remarks").value.trim();
    selected.date=date;selected.remarks=remarks;
    localStorage.setItem(KEY,JSON.stringify(scores));
    message.hidden=false;message.textContent="Score saved successfully in this browser.";
    render();
  });
  render();
})();
