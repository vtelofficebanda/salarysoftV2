import { auth } from "../js/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
