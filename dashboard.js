
(() => {
  // Only approved students can open the student dashboard.
  const student = Matchday.requireRole("student");
  if (!student) return;

  const teams = Matchday.teams();
  const matches = Matchday.matches();

  // Calculate standings from recorded match results.
  const standings = {};

  function getTeam(name, game) {
    const key = `${game}::${name}`;
    if (!standings[key]) {
      standings[key] = {
        name,
        game,
        played: 0,
        won: 0,
        points: 0
      };
    }
    return standings[key];
  }

  teams.forEach(team => getTeam(team.name, team.game));

  matches.forEach(match => {
    const a = getTeam(match.teamA, match.game);
    const b = getTeam(match.teamB, match.game);

    a.played++;
    b.played++;

    if (match.scoreA > match.scoreB) {
      a.won++;
      a.points += 3;
    } else if (match.scoreB > match.scoreA) {
      b.won++;
      b.points += 3;
    } else {
      a.points++;
      b.points++;
    }
  });

  const ranked = Object.values(standings).sort(
    (a, b) => b.points - a.points || b.won - a.won
  );

  // Update the dashboard statistics without changing its layout.
  const stats = document.querySelectorAll(".stat");
  if (stats.length >= 4) {
    stats[0].querySelector(".stat-value").textContent =
      String(teams.length).padStart(2, "0");

    stats[1].querySelector(".stat-value").textContent =
      matches.length;

    stats[2].querySelector(".stat-value").textContent =
      matches.length;

    stats[3].querySelector(".stat-value").textContent =
      ranked[0]?.name || "—";
  }

  // Display recorded match results.
  const resultCard = [...document.querySelectorAll(".card")]
    .find(card => card.querySelector("h2")?.textContent.trim() === "Recent Results");

  if (resultCard) {
    const oldFixtures = resultCard.querySelectorAll(".fixture");
    oldFixtures.forEach(el => el.remove());

    const link = resultCard.querySelector(".card-head");
    const recent = matches.slice(-3).reverse();

    if (!recent.length) {
      const note = document.createElement("p");
      note.className = "subtitle";
      note.textContent = "No match results have been recorded yet.";
      resultCard.appendChild(note);
    } else {
      recent.forEach(match => {
        const fixture = document.createElement("div");
        fixture.className = "fixture";

        const left = document.createElement("div");
        left.className = "fixture-team";
        left.textContent = match.teamA;

        const score = document.createElement("div");
        score.className = "score";
        score.textContent = `${match.scoreA} - ${match.scoreB}`;

        const right = document.createElement("div");
        right.className = "fixture-team";
        right.textContent = match.teamB;

        fixture.append(left, score, right);
        link.after(fixture);
      });
    }
  }

  // Display standings calculated from saved match results.
  const standingsCard = [...document.querySelectorAll(".card")]
    .find(card => card.querySelector("h2")?.textContent.trim() === "Current Standings");

  if (standingsCard) {
    const tbody = standingsCard.querySelector("tbody");
    if (tbody) {
      tbody.replaceChildren();

      ranked.slice(0, 10).forEach((team, index) => {
        const row = document.createElement("tr");

        [String(index + 1).padStart(2, "0"), team.name,
          team.played, team.won, team.points].forEach((value, cellIndex) => {
          const cell = document.createElement("td");
          if (cellIndex === 4) {
            const bold = document.createElement("b");
            bold.textContent = value;
            cell.appendChild(bold);
          } else {
            cell.textContent = value;
          }
          row.appendChild(cell);
        });

        tbody.appendChild(row);
      });

      if (!ranked.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No standings available yet.";
        row.appendChild(cell);
        tbody.appendChild(row);
      }
    }
  }

  // Replace the sample upcoming fixtures with a clear status.
  const upcomingCard = [...document.querySelectorAll(".card")]
    .find(card => card.querySelector("h2")?.textContent.trim() === "Upcoming Matches");

  if (upcomingCard) {
    upcomingCard.querySelectorAll(".fixture, .subtitle:not(.card-head .subtitle)")
      .forEach(el => el.remove());

    const note = document.createElement("p");
    note.className = "subtitle";
    note.textContent =
      "Upcoming fixtures will appear here when match scheduling is connected.";
    upcomingCard.appendChild(note);
  }

  // Use the existing avatar as a logout control.
  const avatar = document.querySelector(".user-avatar");
  if (avatar) {
    avatar.textContent = (student.fullName || "S").charAt(0).toUpperCase();
    avatar.title = "Log out";
  }
})();
