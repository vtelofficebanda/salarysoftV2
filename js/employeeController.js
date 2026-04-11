import { db } from "./firebase.js";

import {
  addDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  loadEmployees();
  loadStats();

  // ================= ADD EMPLOYEE =================
  document.getElementById("addEmployeeBtn")
  .addEventListener("click", async () => {

    const btn = document.getElementById("addEmployeeBtn");
    btn.disabled = true; // 🔥 double click prevent

    const aadhaar = document.getElementById("aadhaar").value.trim();
    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const salary = Number(document.getElementById("empSalary").value);

    if (!aadhaar || !name || !salary || salary <= 0) {
      alert("Valid data daalo");
      btn.disabled = false;
      return;
    }

    try {

      await addDoc(collection(db, "employees"), {
        aadhaar,
        name,
        salary,
        mobile,
        email,
        isActive: true,
        createdAt: new Date()
      });

      alert("✅ Employee Added");

      // reset
      document.getElementById("aadhaar").value = "";
      document.getElementById("name").value = "";
      document.getElementById("empSalary").value = "";
      document.getElementById("mobile").value = "";
      document.getElementById("email").value = "";

      loadEmployees();
      loadStats();

    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }

    btn.disabled = false;
  });

  // ================= LOAD EMPLOYEES =================
  async function loadEmployees() {

    const table = document.getElementById("employeeTable");
    table.innerHTML = "";

    const snapshot = await getDocs(collection(db, "employees"));

    snapshot.forEach(doc => {
      const data = doc.data();

      table.innerHTML += `
        <tr>
          <td>${data.aadhaar}</td>
          <td>${data.name}</td>
          <td>${data.isActive ? "Active" : "Inactive"}</td>
        </tr>
      `;
    });
  }

  // ================= LOAD STATS =================
  async function loadStats() {

    const empSnapshot = await getDocs(collection(db, "employees"));
    const salarySnapshot = await getDocs(collection(db, "salaries"));

    document.getElementById("totalEmployees").innerText =
      empSnapshot.size;

    let totalSalary = 0;
    let totalAdvance = 0;
    let lastPayment = "-";

    salarySnapshot.forEach(doc => {

      const data = doc.data();

      totalSalary += data.finalSalary || 0;
      totalAdvance += data.tAdvance || 0;

      if (data.createdAt && data.createdAt.seconds) {
        lastPayment = new Date(data.createdAt.seconds * 1000)
          .toLocaleDateString();
      }
    });

    document.getElementById("totalSalary").innerText =
      "Rs " + totalSalary.toFixed(0);

    document.getElementById("totalAdvance").innerText =
      "Rs " + totalAdvance.toFixed(0);

    document.getElementById("lastPayment").innerText =
      lastPayment;
  }

});