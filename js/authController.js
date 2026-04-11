import { loginUser } from "../models/authModel.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Enter Email & Password");
        return;
    }

    try {
        await loginUser(email, password);
        alert("Login Successful");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }

});
