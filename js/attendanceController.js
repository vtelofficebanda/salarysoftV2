import { db } from "./firebase.js"; 
import { 
  collection, addDoc, getDocs, query, orderBy, limit 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById('saveAttendanceBtn');
const employeeDropdown = document.getElementById('attEmployee');
//import * as XLSX from "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";


// ================= LOAD EMPLOYEES DROPDOWN =================
async function loadEmployees() {
    const snapshot = await getDocs(collection(db, "employees"));

    employeeDropdown.innerHTML = '<option value="">Select Employee</option>';

    snapshot.forEach(doc => {
        const emp = doc.data();

        employeeDropdown.innerHTML += `
            <option value="${emp.aadhaar}|${emp.name}">
                ${emp.name}
            </option>
        `;
    });
}

// ================= SAVE ATTENDANCE =================
saveBtn.addEventListener('click', async () => {

    const selected = employeeDropdown.value;

    if (!selected) {
        alert("Select Employee");
        return;
    }

    const [aadhaar, name] = selected.split("|");

    const date = document.getElementById('attDate').value;
    const status = parseFloat(document.getElementById('attStatus').value);
    const advance = parseFloat(document.getElementById('attAdvance').value) || 0;

    if (!date) {
        alert("Select Date");
        return;
    }

    try {
        await addDoc(collection(db, "daily_records"), {
            aadhaar,
            name, // 🔥 NEW
            date,
            status,
            advance,
            timestamp: new Date()
        });

        alert("✅ Record Saved Successfully!");
        location.reload();

    } catch (e) {
        console.error(e);
        alert("Error saving record");
    }
});

// ================= LOAD TABLE =================
async function loadLogs() {
    const q = query(
        collection(db, "daily_records"),
        orderBy("date", "desc"),
        limit(10)
    );

    const snapshot = await getDocs(q);
    const tableBody = document.getElementById('attendanceLogs');
    tableBody.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        // 🔥 STATUS TEXT
        let statusText = "";
        if (data.status === 1) statusText = "Full Day";
        else if (data.status === 0.5) statusText = "Half Day";
        else if (data.status === 1.5) statusText = "Overtime";
        else statusText = "Absent";

        tableBody.innerHTML += `
            <tr>
                <td>${data.date}</td>
                <td>${data.name || "-"}</td>
                <td>${statusText}</td>
                <td><span class="amt-red">₹${data.advance}</span></td>
            </tr>
        `;
    });
}

// ================= LOAD EMPLOYEES IN REPORT DROPDOWN =================
async function loadReportEmployees() {
    const snapshot = await getDocs(collection(db, "employees"));
    const dropdown = document.getElementById("reportEmployee");

    dropdown.innerHTML = '<option value="">Select Employee</option>';

    snapshot.forEach(doc => {
        const emp = doc.data();

        dropdown.innerHTML += `
            <option value="${emp.aadhaar}|${emp.name}">
                ${emp.name}
            </option>
        `;
    });
}

// ================= DOWNLOAD EXCEL =================
document.getElementById("downloadReportBtn")
.addEventListener("click", async () => {

    const selected = document.getElementById("reportEmployee").value;
    const month = document.getElementById("reportMonth").value;

    if (!selected || !month) {
        alert("Select Employee & Month");
        return;
    }

    const [aadhaar, name] = selected.split("|");

    const snapshot = await getDocs(collection(db, "daily_records"));

    let data = [];

    snapshot.forEach(doc => {
        const d = doc.data();

        if (d.aadhaar === aadhaar && d.date.startsWith(month)) {

            let statusText = "";
            if (d.status === 1) statusText = "Full Day";
            else if (d.status === 0.5) statusText = "Half Day";
            else if (d.status === 1.5) statusText = "Overtime";
            else statusText = "Absent";

            data.push({
                Date: d.date,
                Employee: name,
                Status: statusText,
                Advance: d.advance
            });
        }
    });

    if (data.length === 0) {
        alert("No records found!");
        return;
    }

    // 🔥 CREATE EXCEL
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(wb, `${name}_${month}_Attendance.xlsx`);
});

// INIT
loadEmployees();
loadLogs();
loadReportEmployees();