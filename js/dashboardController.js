import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

console.log("Dashboard Controller Loaded");

// Protect Dashboard
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.replace("index.html");
    }
});

// Wait until page fully loads
window.addEventListener("load", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) {
        console.log("Logout button not found");
        return;
    }

    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully");
            window.location.replace("index.html");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });

});