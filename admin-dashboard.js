
const admin = Matchday.requireRole("admin");

const tbody = document.getElementById("applications");
const msg = document.getElementById("message");
const teamStudent = document.getElementById("teamStudent");
const teamMessage = document.getElementById("teamMessage");
const matchMessage = document.getElementById("matchMessage");
const teamASelect = document.getElementById("teamA");
const teamBSelect = document.getElementById("teamB");

function showMessage(element, text, isError = false) {
  element.hidden = false;
  element.textContent = text;
  element.style.background = isError ? "#fef2f2" : "#f0fdf4";
  element.style.color = isError ? "#991b1b" : "#166534";
}

function getUsers() {
  try {
    return JSON.parse(
      localStorage.getItem("matchday_demo_users_v1") || "[]"
    );
  } catch {
    return [];
  }
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "—";
  row.appendChild(cell);
  return cell;
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "action-btn " + className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderApplications() {
  tbody.replaceChildren();

  const regs = Matchday.registrations();
  const users = getUsers();

  if (!regs.length) {
    const row = document.createElement("tr");
    const cell = addCell(row, "No student applications yet.");
    cell.colSpan = 7;
    tbody.appendChild(row);
    return;
  }

  regs.forEach(reg => {
    const user = users.find(item => item.id === reg.userId);
    const row = document.createElement("tr");

    addCell(row, user?.fullName || "Unknown");
    addCell(row, user?.rollNumber || "—");
    addCell(row, user?.course || "—");
    addCell(row, reg.game);
    addCell(row, reg.status);
    addCell(row, reg.team || "Not assigned");

    const actions = document.createElement("td");

    if (reg.status === "pending") {
      actions.appendChild(makeButton("Approve", "btn-green", () => {
        try {
          Matchday.updateStatus(reg.id, "approved");
          renderAll();
          showMessage(msg, "Student application approved.");
        } catch (error) {
          showMessage(msg, error.message, true);
        }
      }));

      actions.appendChild(makeButton("Reject", "", () => {
        try {
          Matchday.updateStatus(reg.id, "rejected");
          renderAll();
          showMessage(msg, "Student application rejected.");
        } catch (error) {
          showMessage(msg, error.message, true);
        }
      }));
    } else if (reg.status === "approved") {
      actions.appendChild(makeButton("Revoke approval", "", () => {
        try {
          Matchday.updateStatus(reg.id, "pending");
          renderAll();
          showMessage(msg, "Approval changed to pending.");
        } catch (error) {
          showMessage(msg, error.message, true);
        }
      }));
    } else {
      actions.textContent = "Rejected";
    }

    row.appendChild(actions);
    tbody.appendChild(row);
  });
}

function renderStudentOptions() {
  const previous = teamStudent.value;
  teamStudent.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select an approved student";
  teamStudent.appendChild(placeholder);

  const users = getUsers();

  Matchday.registrations()
    .filter(reg => reg.status === "approved")
    .forEach(reg => {
      const user = users.find(item => item.id === reg.userId);
      if (!user) return;

      const option = document.createElement("option");
      option.value = reg.id;
      option.textContent =
        `${user.fullName} · ${reg.game} · ${user.rollNumber}`;
      teamStudent.appendChild(option);
    });

  if ([...teamStudent.options].some(option => option.value === previous)) {
    teamStudent.value = previous;
  }
}

function renderTeamOptions() {
  const game = document.getElementById("matchGame").value;
  const allTeams = Matchday.teams().filter(team => team.game === game);

  [teamASelect, teamBSelect].forEach((select, index) => {
    const previous = select.value;
    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = index === 0 ? "Select Team A" : "Select Team B";
    select.appendChild(placeholder);

    allTeams.forEach(team => {
      const option = document.createElement("option");
      option.value = team.name;
      option.textContent = team.name;
      select.appendChild(option);
    });

    if (allTeams.some(team => team.name === previous)) {
      select.value = previous;
    }
  });
}

function renderMatches() {
  const body = document.getElementById("matches");
  body.replaceChildren();

  const allMatches = Matchday.matches();

  if (!allMatches.length) {
    const row = document.createElement("tr");
    const cell = addCell(row, "No matches recorded yet.");
    cell.colSpan = 5;
    body.appendChild(row);
    return;
  }

  [...allMatches].reverse().forEach(match => {
    const row = document.createElement("tr");
    addCell(row, match.date || "—");
    addCell(row, match.game);
    addCell(row, match.teamA);
    addCell(row, `${match.scoreA} - ${match.scoreB}`);
    addCell(row, match.teamB);
    body.appendChild(row);
  });
}

function renderAll() {
  renderApplications();
  renderStudentOptions();
  renderTeamOptions();
  renderMatches();
}

document.getElementById("teamForm").addEventListener("submit", event => {
  event.preventDefault();

  try {
    const regId = teamStudent.value;
    const teamName = document.getElementById("teamName").value.trim();

    if (!regId) throw new Error("Please select an approved student.");

    Matchday.assignTeam(regId, teamName);
    document.getElementById("teamName").value = "";

    renderAll();
    showMessage(teamMessage, "Team assigned successfully.");
  } catch (error) {
    showMessage(teamMessage, error.message, true);
  }
});

document.getElementById("matchGame").addEventListener("change", () => {
  renderTeamOptions();
});

document.getElementById("matchForm").addEventListener("submit", event => {
  event.preventDefault();

  try {
    Matchday.saveMatch({
      game: document.getElementById("matchGame").value,
      teamA: teamASelect.value,
      teamB: teamBSelect.value,
      scoreA: document.getElementById("scoreA").value,
      scoreB: document.getElementById("scoreB").value,
      date: document.getElementById("matchDate").value
    });

    document.getElementById("scoreA").value = "";
    document.getElementById("scoreB").value = "";

    renderAll();
    showMessage(matchMessage, "Match result saved successfully. Points recalculated.");
  } catch (error) {
    showMessage(matchMessage, error.message, true);
  }
});

document.getElementById("logout").addEventListener("click", () => {
  Matchday.logout();
  window.location.href = "login.html";
});

if (admin) {
  renderAll();
}
