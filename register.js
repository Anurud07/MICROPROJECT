
const form = document.getElementById("registerForm");
const msg = document.getElementById("message");

form.addEventListener("submit", event => {
  event.preventDefault();

  msg.hidden = true;
  msg.textContent = "";

  const fullName = document.getElementById("fullName").value.trim();
  const rollNumber = document.getElementById("rollNumber").value.trim();
  const course = document.getElementById("course").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const game = document.getElementById("game").value;

  try {
    if (!fullName || !rollNumber || !course || !email || !password || !game) {
      throw new Error("Please fill in all fields.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (password.length < 4) {
      throw new Error("Password must contain at least 4 characters.");
    }

    Matchday.register({
      fullName,
      rollNumber,
      course,
      email,
      password,
      game
    });

    msg.hidden = false;
    msg.textContent =
      "Registration submitted successfully!\n" +
      "Status: Pending admin approval.\n" +
      "You can log in after the admin approves your application.";

    form.reset();
  } catch (error) {
    msg.hidden = false;
    msg.textContent = error.message;
  }
});
