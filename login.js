
const form = document.getElementById("loginForm");
const msg = document.getElementById("message");

form.addEventListener("submit", event => {
  event.preventDefault();

  msg.hidden = true;
  msg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const user = Matchday.login(email, password);

    if (user.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else if (user.role === "student") {
      window.location.href = "dashboard.html";
    } else {
      Matchday.logout();
      throw new Error("This account does not have permission to log in.");
    }
  } catch (error) {
    msg.hidden = false;
    msg.textContent = error.message;
  }
});
