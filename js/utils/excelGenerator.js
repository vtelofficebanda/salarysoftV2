export function downloadSalaryExcel(data) {

    // Excel ke liye clean format
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

    // 🔥 DOWNLOAD
    XLSX.writeFile(workbook, "Salary_Report.xlsx");
}