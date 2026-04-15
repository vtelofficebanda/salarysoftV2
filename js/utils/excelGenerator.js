export async function downloadSalaryExcel(data) {

    // ✅ Electron me require use karo
    const XLSX = window.require("xlsx");

    const rows = data.map(d => ({
        Aadhaar: d.aadhaar,
        Name: d.employeeName,
        From: d.fromDate,
        To: d.toDate,
        Present: d.tPresent,
        Half: d.tHalf,
        Sunday: d.tSunday,
        GrossSalary: d.grossSalary,
        Advance: d.tAdvance,
        FinalSalary: d.finalSalary
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Report");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const { ipcRenderer } = window.require("electron");

    const result = await ipcRenderer.invoke("save-excel-file", excelBuffer);

    if (result.success) {
        alert("✅ Excel saved: " + result.path);
    } else {
        alert("❌ Save failed");
    }
}