import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./firebase.js";


const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      errorMsg.innerText = "Enter email & password";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
     window.location.href = "dashboard.html";
    } catch (error) {
      errorMsg.innerText = error.message;
    }
  });
}
