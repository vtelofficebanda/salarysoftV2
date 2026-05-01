import { db } from "./firebase.js"; 
import { 
  collection, addDoc, getDocs, query, orderBy, limit, updateDoc, doc, deleteDoc, where
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

    // ✅ SUNDAY CHECK (FIXED)
    const selectedDate = new Date(date); // 🔥 yahi fix hai
    const day = selectedDate.getDay();

    if (day === 0) {
        alert("⚠️ Sunday hai — Advance allowed hai");
    }

    try {

        // ✅ DUPLICATE CHECK
        const q = query(
            collection(db, "daily_records"),
            where("aadhaar", "==", emp.aadhaar),
            where("date", "==", date)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert("❌ Attendance already exists for this date");
            return;
        }

        // ✅ SAVE RECORD
        await addDoc(collection(db, "daily_records"), {
            aadhaar: emp.aadhaar,
            name: emp.name,
            date: date,
            status: status,
            advance: advance,
            timestamp: new Date()
        });

        alert("✅ Record Saved");
        loadLogs();
        // 🔥 FORM RESET (IMPORTANT)
        document.getElementById('attStatus').value = "1"; // default Full Day
        document.getElementById('attAdvance').value = "0";

    } catch (e) {
        console.error(e);
        alert("Error saving record");
    }
});
// ================= LOAD TABLE =================
async function loadLogs() {
    const q = query(
        collection(db, "daily_records"),
        orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    const selectedMonth = document.getElementById("filterMonth")?.value;

    const tableBody = document.getElementById('attendanceLogs');
    tableBody.innerHTML = "";

    snapshot.forEach(docSnap => {

        const data = docSnap.data();

        // ✅ MONTH FILTER (IMPORTANT FIX)
        if (selectedMonth && !data.date.startsWith(selectedMonth)) {
            return;
        }

        let statusText = "";
        if (data.status === 1) statusText = "Present";
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
            </td>

            <td>
                <button onclick="editRecord('${docSnap.id}', ${data.advance || 0}, ${data.status})"
                    style="cursor:pointer;">
                    Edit
                </button>

                <button onclick="deleteRecord('${docSnap.id}')"
                    style="margin-left:10px; cursor:pointer; color:red;">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

    // ✅ EMPTY STATE (PRO UX)
    if (tableBody.innerHTML === "") {
        tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; padding:20px; color:gray;">
                No records found for selected month
            </td>
        </tr>`;
    }
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

    try {
        // ✅ CORRECT QUERY (ONLY EMPLOYEE FILTER)
        const q = query(
            collection(db, "daily_records"),
            where("aadhaar", "==", emp.aadhaar)
        );

        const snapshot = await getDocs(q);

        let data = [];

        snapshot.forEach(docSnap => {
            const d = docSnap.data();

            // ✅ MONTH FILTER
            if (d.date && d.date.startsWith(month)) {

                let statusText = "";
                if (d.status === 1) statusText = "Present";
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

        // ✅ SORT DATE
        data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        // ✅ EXCEL EXPORT
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

    } catch (err) {
        console.error(err);
        alert("❌ Excel export failed");
    }
});


// ================= EDIT RECORD (ADVANCE + STATUS) =================
window.editRecord = function(id, currentAdvance, currentStatus) {
    currentEditId = id;

    const advanceInput = document.getElementById("editAdvanceInput");
    const statusInput = document.getElementById("editStatusInput");

    advanceInput.value = currentAdvance;
    statusInput.value = currentStatus;

    document.getElementById("editModal").style.display = "flex";

    setTimeout(() => {
        advanceInput.focus();
        advanceInput.select();
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
window.deleteRecord = async function(id) {

    if (!confirm("Delete this record?")) return;

    try {
        await deleteDoc(doc(db, "daily_records", id));
        alert("🗑️ Deleted");
        loadLogs();
    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
};

// ================= INIT =================
loadEmployees();
loadLogs();
loadReportEmployees();

document.getElementById("filterMonth")
?.addEventListener("change", loadLogs);