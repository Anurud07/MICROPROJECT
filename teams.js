(() => {
  const form = document.getElementById('team-registration-form');
  const card = document.getElementById('team-registration-card');
  const notice = document.getElementById('team-admin-notice');
  const message = document.getElementById('team-message');
  const tbody = document.getElementById('registered-teams');
  const storageKey = 'matchday_demo_teams_v1';
  const user = Matchday.currentUser();
  const isAdmin = Boolean(user && user.role === 'admin');

  // The registration controls are only rendered for an admin session.
  card.hidden = !isAdmin;
  notice.hidden = isAdmin;

  const readTeams = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const writeTeams = teams => localStorage.setItem(storageKey, JSON.stringify(teams));
  const cell = value => {
    const td = document.createElement('td');
    td.textContent = String(value ?? '—');
    return td;
  };
  const renderTeams = () => {
    readTeams().forEach((team, i) => {
      if (tbody.querySelector(`[data-team-id="${CSS.escape(team.id)}"]`)) return;
      const tr = document.createElement('tr');
      tr.dataset.teamId = team.id;
      tr.append(cell(String(tbody.rows.length + 1).padStart(2, '0')));
      const nameCell = document.createElement('td');
      const wrap = document.createElement('div'); wrap.className = 'team';
      const badge = document.createElement('span'); badge.className = 'team-badge';
      badge.textContent = (team.name || 'T').charAt(0).toUpperCase();
      wrap.append(badge, document.createTextNode(team.name)); nameCell.append(wrap); tr.append(nameCell);
      tr.append(cell(team.captain), cell(team.players), cell('Registered'));
      tbody.append(tr);
    });
  };

  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    // Recheck the role at submission time rather than relying only on hidden UI.
    const current = Matchday.currentUser();
    if (!current || current.role !== 'admin') {
      message.hidden = false;
      message.textContent = 'Admin login is required to register a team.';
      return;
    }
    const name = document.getElementById('team').value.trim();
    const captain = document.getElementById('captain').value.trim();
    const players = Number(document.getElementById('players').value);
    const contact = document.getElementById('contact').value.trim();
    if (!name || !captain || !Number.isInteger(players) || players < 1 || players > 30 || !contact) return;
    const teams = readTeams();
    if (teams.some(team => team.name.toLowerCase() === name.toLowerCase())) {
      message.hidden = false;
      message.textContent = 'A team with this name is already registered.';
      return;
    }
    teams.push({ id: 'team-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), name, captain, players, contact, createdAt: new Date().toISOString() });
    writeTeams(teams);
    message.hidden = false;
    message.textContent = 'Team registered successfully.';
    form.reset();
    renderTeams();
  });

  renderTeams();
})();
