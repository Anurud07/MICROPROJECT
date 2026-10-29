/* Matchday Tournament Manager — frontend demo storage.
   localStorage data is limited to this browser/device. Use a backend for real shared accounts/security.
*/
const Matchday = (() => {
  const KEYS = {
    users: 'matchday_demo_users_v1', regs: 'matchday_demo_registrations_v1',
    session: 'matchday_demo_session_v1', teams: 'matchday_demo_teams_v1',
    matches: 'matchday_demo_matches_v1'
  };
  const read = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const registrations = () => read(KEYS.regs, []);
  const saveRegistrations = value => write(KEYS.regs, value);
  const teams = () => read(KEYS.teams, []).map(t => ({ ...t, game: t.game || 'General' }));
  const matches = () => read(KEYS.matches, []);
  let users = read(KEYS.users, []);
  if (!users.some(u => u.role === 'admin')) {
    users.push({ id:'admin-demo', fullName:'Tournament Admin', rollNumber:'ADMIN', course:'Administration', email:'admin@matchday.demo', password:'admin123', role:'admin' });
    write(KEYS.users, users);
  }
  const currentUser = () => {
    const s = read(KEYS.session, null); if (!s) return null;
    users = read(KEYS.users, []); return users.find(u => u.id === s.userId) || null;
  };
  function register(data) {
    users = read(KEYS.users, []);
    if (users.some(u => (u.email || '').toLowerCase() === data.email.toLowerCase())) throw new Error('This email is already registered.');
    if (users.some(u => (u.rollNumber || '').toLowerCase() === data.rollNumber.toLowerCase())) throw new Error('This roll number is already registered.');
    const id = 'student-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);
    users.push({ ...data, id, role:'student' }); write(KEYS.users, users);
    const regs = registrations(); regs.push({ id:'reg-'+Date.now(), userId:id, game:data.game, status:'pending', createdAt:new Date().toISOString(), team:'Not assigned yet', points:0 }); saveRegistrations(regs);
  }
  function login(email, password) {
    users = read(KEYS.users, []);
    const user = users.find(u => (u.email || '').toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!user) throw new Error('Email or password is incorrect.');
    if (user.role === 'student') {
      const reg = registrations().find(r => r.userId === user.id);
      if (!reg) throw new Error('No game registration found. Please contact the admin.');
      if (reg.status === 'pending') throw new Error('Your registration is pending admin approval. Please try again after approval.');
      if (reg.status === 'rejected') throw new Error('Your registration was rejected. Please contact the admin.');
      if (reg.status !== 'approved') throw new Error('Your registration is not approved yet.');
    }
    write(KEYS.session, { userId:user.id }); return user;
  }
  function logout() { localStorage.removeItem(KEYS.session); }
  function requireRole(role) {
    const user = currentUser();
    if (!user) { window.location.href='login.html'; return null; }
    if (user.role !== role) { window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html'; return null; }
    if (role === 'student') {
      const reg = registrations().find(r => r.userId === user.id);
      if (!reg || reg.status !== 'approved') { logout(); window.location.href='login.html'; return null; }
    }
    return user;
  }
  function adminOnly() { const u=currentUser(); if (!u || u.role !== 'admin') throw new Error('Admin access required.'); }
  function updateStatus(regId, status) {
    adminOnly(); if (!['approved','rejected','pending'].includes(status)) throw new Error('Invalid registration status.');
    const regs=registrations(), reg=regs.find(r=>r.id===regId); if(!reg) throw new Error('Registration not found.');
    reg.status=status; saveRegistrations(regs);
  }
  function addTeam(data) {
    adminOnly(); const name=String(data.name||'').trim(), game=String(data.game||'').trim();
    if(!name || !game) throw new Error('Enter a team name and select a game.');
    const all=teams(); if(all.some(t=>t.name.toLowerCase()===name.toLowerCase() && t.game.toLowerCase()===game.toLowerCase())) throw new Error('A team with this name is already registered for this game.');
    all.push({ id:'team-'+Date.now()+'-'+Math.random().toString(36).slice(2,6), name, game, captain:String(data.captain||''), players:Number(data.players)||0, contact:String(data.contact||''), createdAt:new Date().toISOString() }); write(KEYS.teams,all); return all[all.length-1];
  }
  function assignTeam(regId, teamName) {
    adminOnly(); const name=String(teamName||'').trim(); if(!name) throw new Error('Enter a team name.');
    const regs=registrations(), reg=regs.find(r=>r.id===regId); if(!reg) throw new Error('Registration not found.');
    if(reg.status!=='approved') throw new Error('Approve the student before assigning a team.');
    let all=teams();
    if(!all.some(t=>t.name.toLowerCase()===name.toLowerCase() && t.game===reg.game)) {
      all.push({id:'team-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name,game:reg.game,captain:'',players:0,contact:''}); write(KEYS.teams,all);
    }
    reg.team=name; saveRegistrations(regs); recalculatePoints(reg.game);
  }
  function saveMatch(data) {
    adminOnly(); const game=String(data.game||'').trim(), teamA=String(data.teamA||'').trim(), teamB=String(data.teamB||'').trim();
    if(!game || !teamA || !teamB || teamA===teamB) throw new Error('Select a game and two different teams.');
    if(data.scoreA==='' || data.scoreB==='' || !Number.isFinite(Number(data.scoreA)) || !Number.isFinite(Number(data.scoreB)) || Number(data.scoreA)<0 || Number(data.scoreB)<0) throw new Error('Enter valid non-negative scores.');
    const allTeams=teams();
    if(!allTeams.some(t=>t.name===teamA && t.game===game) || !allTeams.some(t=>t.name===teamB && t.game===game)) throw new Error('Both teams must be registered for the selected game.');
    const all=matches(); all.push({id:'match-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),game,teamA,teamB,scoreA:Number(data.scoreA),scoreB:Number(data.scoreB),date:data.date||'',remarks:data.remarks||'',updatedAt:new Date().toISOString()});
    write(KEYS.matches,all); recalculatePoints(game);
  }
  function updateMatch(matchId, data) {
    adminOnly(); const all=matches(), match=all.find(m=>m.id===matchId); if(!match) throw new Error('Match not found.');
    if(data.scoreA==='' || data.scoreB==='' || !Number.isFinite(Number(data.scoreA)) || !Number.isFinite(Number(data.scoreB)) || Number(data.scoreA)<0 || Number(data.scoreB)<0) throw new Error('Enter valid non-negative scores.');
    const game=match.game; match.scoreA=Number(data.scoreA); match.scoreB=Number(data.scoreB); if(data.date !== undefined) match.date=data.date; if(data.remarks !== undefined) match.remarks=data.remarks; match.updatedAt=new Date().toISOString();
    write(KEYS.matches,all); recalculatePoints(game);
  }
  function standings(gameFilter) {
    const map=new Map();
    const add=(name,game)=>{ if(!name) return null; const g=game||'General', key=g+'::'+name; if(!map.has(key)) map.set(key,{name,game:g,played:0,won:0,drawn:0,lost:0,points:0,scoredFor:0,scoredAgainst:0}); return map.get(key); };
    teams().forEach(t=>add(t.name,t.game));
    matches().forEach(m=>{const a=add(m.teamA,m.game),b=add(m.teamB,m.game); if(!a||!b) return; a.played++;b.played++;a.scoredFor+=Number(m.scoreA)||0;a.scoredAgainst+=Number(m.scoreB)||0;b.scoredFor+=Number(m.scoreB)||0;b.scoredAgainst+=Number(m.scoreA)||0; if(m.scoreA>m.scoreB){a.won++;a.points+=3;b.lost++;}else if(m.scoreB>m.scoreA){b.won++;b.points+=3;a.lost++;}else{a.drawn++;b.drawn++;a.points++;b.points++;}});
    return [...map.values()].filter(t=>!gameFilter || t.game===gameFilter).map(t=>({...t,difference:t.scoredFor-t.scoredAgainst})).sort((a,b)=>b.points-a.points||b.difference-a.difference||b.scoredFor-a.scoredFor||a.name.localeCompare(b.name));
  }
  function recalculatePoints(game) {
    const ranked=standings(game), regs=registrations();
    regs.forEach(r=>{if(r.game!==game || r.status!=='approved') return; const team=ranked.find(t=>t.name===r.team); r.points=team?team.points:0;}); saveRegistrations(regs);
  }
  return { register, login, logout, requireRole, currentUser, registrations, updateStatus, teams, matches, assignTeam, addTeam, saveMatch, updateMatch, standings };
})();
