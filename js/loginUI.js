// Show/Hide Password
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
});

// Loader Effect
const loginBtn = document.getElementById("loginBtn");
const loader = document.getElementById("loader");
const btnText = document.getElementById("btnText");

loginBtn.addEventListener("click", () => {
  loader.style.display = "inline-block";
  btnText.style.display = "none";
});
