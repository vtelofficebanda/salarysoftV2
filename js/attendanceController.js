import { db } from "./firebase.js"; 
import { 
  collection, addDoc, getDocs, query, orderBy, limit, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById('saveAttendanceBtn');
const employeeDropdown = document.getElementById('attEmployee');

let currentEditId = null;

// ================= LOAD EMPLOYEES DROPDOWN =================
async function loadEmployees() {
    const snapshot = await getDocs(collection(db, "employees"));

    employeeDropdown.innerHTML = '<option value="">Select Employee</option>';

    snapshot.forEach(docSnap => {
        const emp = docSnap.data();

        employeeDropdown.innerHTML += `
            <option value='${JSON.stringify(emp)}'>
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

    const emp = JSON.parse(selected);

    const date = document.getElementById('attDate').value;
    const status = parseFloat(document.getElementById('attStatus').value);
    const advance = parseFloat(document.getElementById('attAdvance').value) || 0;

    if (!date) {
        alert("Select Date");
        return;
    }

    try {
        await addDoc(collection(db, "daily_records"), {
            aadhaar: emp.aadhaar,
            name: emp.name,
            date,
            status,
            advance,
            timestamp: new Date()
        });

        alert("✅ Record Saved Successfully!");

        // 🔥 reload hata ke smooth refresh
        loadLogs();

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

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

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
    <td>
        <span class="amt-red">₹${data.advance || 0}</span>
        <button onclick="editAdvance('${docSnap.id}', ${data.advance || 0})" 
            style="margin-left:10px; cursor:pointer;">
            ✏️
        </button>
    </td>
</tr>
`;
    });
}

// ================= LOAD REPORT EMPLOYEES =================
async function loadReportEmployees() {
    const snapshot = await getDocs(collection(db, "employees"));
    const dropdown = document.getElementById("reportEmployee");

    dropdown.innerHTML = '<option value="">Select Employee</option>';

    snapshot.forEach(docSnap => {
        const emp = docSnap.data();

        dropdown.innerHTML += `
            <option value='${JSON.stringify(emp)}'>
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

    const emp = JSON.parse(selected);

    const snapshot = await getDocs(collection(db, "daily_records"));

    let data = [];

    snapshot.forEach(docSnap => {
        const d = docSnap.data();

        if (d.aadhaar === emp.aadhaar && d.date.startsWith(month)) {

            let statusText = "";
            if (d.status === 1) statusText = "Full Day";
            else if (d.status === 0.5) statusText = "Half Day";
            else if (d.status === 1.5) statusText = "Overtime";
            else statusText = "Absent";

            data.push({
                Date: d.date,
                Employee: emp.name,
                Status: statusText,
                Advance: d.advance || 0
            });
        }
    });

    if (data.length === 0) {
        alert("No records found!");
        return;
    }

    const XLSX = window.require("xlsx");
    const { ipcRenderer } = window.require("electron");

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array"
    });

    const result = await ipcRenderer.invoke("save-excel-file", buffer);

    if (result.success) {
        alert("✅ Attendance Excel saved: " + result.path);
    } else {
        alert("❌ Save cancelled");
    }
});

// ================= EDIT ADVANCE =================
window.editAdvance = function(id, currentAdvance) {
    currentEditId = id;

    const input = document.getElementById("editAdvanceInput");

    input.value = currentAdvance;

    document.getElementById("editModal").style.display = "flex";

    // 🔥 HARD FIX (focus + select)
    setTimeout(() => {
        input.focus();
        input.select();
    }, 50);
};

// ================= CLOSE MODAL =================
window.closeModal = function() {
    document.getElementById("editModal").style.display = "none";

    // 🔥 reset everything
    currentEditId = null;
    document.getElementById("editAdvanceInput").value = "";
};
// ================= SAVE EDIT =================
document.getElementById("saveAdvanceBtn")
.addEventListener("click", async () => {

    const input = document.getElementById("editAdvanceInput");

    const amount = parseFloat(input.value);

    if (isNaN(amount) || amount < 0) {
        alert("Invalid amount");
        return;
    }

    if (!currentEditId) {
        alert("Something went wrong!");
        return;
    }

    try {
        await updateDoc(doc(db, "daily_records", currentEditId), {
            advance: amount
        });

        alert("✅ Advance updated");

        closeModal();

        // 🔥 IMPORTANT: CLEAR INPUT + RESET STATE
        input.value = "";
        currentEditId = null;

        // 🔥 NO reload → direct refresh
        await loadLogs();

    } catch (error) {
        console.error(error);
        alert("❌ Update failed");
    }
});

// ================= INIT =================
loadEmployees();
loadLogs();
loadReportEmployees();