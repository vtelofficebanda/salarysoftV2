import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnOn05o68Z-sLJT8SEGSZdHSpQgtESypM",
  authDomain: "vtelsalary.firebaseapp.com",
  projectId: "vtelsalary",
  storageBucket: "vtelsalary.firebasestorage.app",
  messagingSenderId: "873826630648",
  appId: "1:873826630648:web:57bfd59d72db009948740d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);