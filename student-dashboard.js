
const user = Matchday.requireRole("student");

const msg = document.getElementById("message");

if (user) {
  document.getElementById("welcome").textContent =
    `Welcome, ${user.fullName} · Roll No. ${user.rollNumber} · ${user.course}`;

  const registration = Matchday.registrations().find(
    item => item.userId === user.id
  );

  if (registration) {
    document.getElementById("game").textContent =
      registration.game || "—";

    document.getElementById("status").textContent =
      registration.status.charAt(0).toUpperCase() +
      registration.status.slice(1);

    document.getElementById("regDate").textContent =
      "Submitted: " +
      new Date(registration.createdAt).toLocaleString();

    document.getElementById("team").textContent =
      registration.team || "Not assigned yet";

    document.getElementById("points").textContent =
      registration.points ?? 0;
  } else {
    msg.hidden = false;
    msg.textContent = "No game registration was found for this account.";
  }
}

document.getElementById("logout").addEventListener("click", () => {
  Matchday.logout();
  window.location.href = "login.html";
});
