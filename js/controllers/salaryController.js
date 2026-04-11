import { db } from "../firebase.js";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStatsByDateRange } from "../services/attendanceService.js";
import { calculateSalary } from "../utils/salaryCalculator.js";
import { generateSalarySlip } from "../utils/pdfGenerator.js"; 
import { downloadSalaryExcel } from "../utils/excelGenerator.js";

document.addEventListener("DOMContentLoaded", () => {

  loadEmployeesDropdown();

  // ================= LOAD EMPLOYEE DROPDOWN =================
  async function loadEmployeesDropdown() {
    const snapshot = await getDocs(collection(db, "employees"));
    const dropdown = document.getElementById("salaryEmployee");

    dropdown.innerHTML = '<option value="">Select Employee</option>';

    snapshot.forEach(doc => {
      const emp = doc.data();

      dropdown.innerHTML += `
        <option value="${emp.aadhaar}|${emp.name}|${emp.salary}|${emp.mobile || ''}|${emp.email || ''}">
          ${emp.name}
        </option>
      `;
    });
  }

  // ================= GET PENDING SALARY =================
  async function getPendingSalary(aadhaar) {

    const q = query(
      collection(db, "salaries"),
      where("aadhaar", "==", aadhaar),
      where("isPaid", "==", false)
    );

    const snapshot = await getDocs(q);

    let pending = 0;

    snapshot.forEach(doc => {
      pending += doc.data().finalSalary || 0;
    });

    return pending;
  }

  // ================= GENERATE SALARY =================
  document.getElementById("saveSalaryBtn")
  .addEventListener("click", async () => {

    const btn = document.getElementById("saveSalaryBtn");
    btn.disabled = true;

    const selected = document.getElementById("salaryEmployee").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    if (!selected || !fromDate || !toDate) {
      alert("Proper data daalo");
      btn.disabled = false;
      return;
    }

    try {

      const [aadhaar, name, salary, mobile, email] = selected.split("|");

      const emp = {
        aadhaar,
        name,
        salary: Number(salary),
        mobile,
        email
      };

      // 🔥 Attendance
      const stats = await getStatsByDateRange(aadhaar, fromDate, toDate);

      // 🔥 Salary calc
      const calc = calculateSalary(emp.salary, stats);

      // 🔥 Pending
      const pendingSalary = await getPendingSalary(aadhaar);

      const finalSalaryWithPending = calc.finalSalary + pendingSalary;

      // 🔥 SAVE
      await addDoc(collection(db, "salaries"), {
        aadhaar,
        employeeName: emp.name,
        fromDate,
        toDate,
        ...stats,
        ...calc,
        pendingSalary,
        finalSalary: finalSalaryWithPending,
        isPaid: false,
        createdAt: new Date()
      });

      // 🔥 PDF
      generateSalarySlip(emp, {
        ...stats,
        ...calc,
        pendingSalary,
        finalSalary: finalSalaryWithPending,
        fromDate,
        toDate,
        paymentMode: document.getElementById("paymentMode").value,
        transactionId: document.getElementById("transactionId").value
      });

      alert("✅ Salary Generated + Pending Added + Slip Downloaded!");

    } catch (error) {
      console.error(error);
      alert("❌ Error: " + error.message);
    }

    btn.disabled = false;
  });

  // ================= MARK AS PAID =================
  document.getElementById("markPaidBtn")
  ?.addEventListener("click", async () => {

    const selected = document.getElementById("salaryEmployee").value;

    if (!selected) {
      alert("Employee select karo");
      return;
    }

    const [aadhaar] = selected.split("|");

    try {

      const q = query(
        collection(db, "salaries"),
        where("aadhaar", "==", aadhaar),
        where("isPaid", "==", false)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("No pending salary!");
        return;
      }

      const updates = snapshot.docs.map(docSnap => {
        return updateDoc(doc(db, "salaries", docSnap.id), {
          isPaid: true
        });
      });

      await Promise.all(updates);

      alert("✅ Pending salary marked as PAID!");

    } catch (error) {
      console.error(error);
      alert("❌ Error: " + error.message);
    }

  });

  // ================= EXPORT EXCEL =================
  document.getElementById("exportExcel")
  .addEventListener("click", async () => {

    try {

      const snapshot = await getDocs(collection(db, "salaries"));

      if (snapshot.empty) {
        alert("No salary data found!");
        return;
      }

      let data = [];
      snapshot.forEach(doc => data.push(doc.data()));

      downloadSalaryExcel(data);

    } catch (error) {
      console.error(error);
      alert("Excel Error: " + error.message);
    }

  });

});