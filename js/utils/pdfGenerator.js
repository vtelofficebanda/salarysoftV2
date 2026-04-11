function formatDate(dateStr) {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function generateSalarySlip(employeeData, salaryData) {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // ===== SAFE VALUES =====
  const mobile = employeeData.mobile || "-";
  const email = employeeData.email || "-";
  const salary = Number(employeeData.salary || 0);

  const dailyRate = Number(salaryData.dailyRate || 0);
  const grossSalary = Number(salaryData.grossSalary || 0);
  const finalSalary = Number(salaryData.finalSalary || 0);
  const advance = Number(salaryData.tAdvance || 0);
  const pendingSalary = Number(salaryData.pendingSalary || 0);

  const tPresent = salaryData.tPresent || 0;
  const tHalf = salaryData.tHalf || 0;
  const tSunday = salaryData.tSunday || 0;

  const status = salaryData.isPaid ? "Paid" : "Pending";

  // ===== LOGO LOAD (NO DISTORTION) =====
  const img = new Image();
  img.src = "../assets/logo.jpeg"; // 🔥 path fix

  img.onload = function () {

    // ===== HEADER BACKGROUND =====
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 35, "F");

    // ===== LOGO (AUTO SCALE) =====
    const imgWidth = 30;
    const imgHeight = (img.height / img.width) * imgWidth;

    doc.addImage(img, "JPEG", 15, 5, imgWidth, imgHeight);

    // ===== COMPANY NAME =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("VTEL MARKETING AND COMMUNICATION", 105, 15, { align: "center" });

    // ===== ADDRESS =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Swaraj Colony, Gali No. 9, Banda, Uttar Pradesh - 210001",
      105,
      22,
      { align: "center" }
    );

    // ===== TITLE =====
    doc.setFontSize(12);
    doc.text("Salary Slip", 105, 30, { align: "center" });

    // ===== EMPLOYEE INFO =====
    doc.setFontSize(12);

    doc.text("Employee Name: " + employeeData.name, 20, 50);
    doc.text("Mobile: " + mobile, 20, 60);
    doc.text("Email: " + email, 20, 70);

    doc.text("Monthly Salary: Rs " + salary, 130, 50);
    doc.text("Daily Rate: Rs " + dailyRate.toFixed(2), 130, 60);

    doc.text("From: " + formatDate(salaryData.fromDate), 130, 70);
    doc.text("To: " + formatDate(salaryData.toDate), 130, 78);

    // ===== TABLE HEADER =====
    doc.setFillColor(230, 230, 230);
    doc.rect(20, 90, 170, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 97);
    doc.text("Amount / Value", 140, 97);

    doc.setFont("helvetica", "normal");

    let y = 110;

    function row(label, value) {
      doc.text(label, 25, y);
      doc.text(String(value), 140, y);
      y += 10;
    }

    // ===== DATA =====
    row("Present Days", tPresent);
    row("Half Days", tHalf);
    row("Sunday Working", tSunday);
    row("Gross Salary", "Rs " + grossSalary.toFixed(2));
    row("Advance Deduction", "Rs " + advance.toFixed(2));
    row("Pending Salary", "Rs " + pendingSalary.toFixed(2));

    // ===== FINAL SALARY =====
    doc.setFillColor(220, 220, 220);
    doc.rect(20, y + 5, 170, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text(
      "Final Salary: Rs " + finalSalary.toFixed(2),
      25,
      y + 14
    );

    y += 30;

    // ===== OVERTIME BOX =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text("Overtime:", 25, y);
    doc.rect(140, y - 5, 45, 8);

    y += 12;

    // ===== PAYMENT DETAILS =====
    doc.text("Payment Mode: " + (salaryData.paymentMode || "Cash"), 20, y);
    doc.text("Transaction ID: " + (salaryData.transactionId || "-"), 20, y + 10);
    doc.text("Status: " + status, 20, y + 20);

    // ===== FOOTER =====
    doc.line(20, 260, 190, 260);

    doc.setFontSize(11);
    doc.text(
      "Thank you for your hard work and dedication!",
      105,
      270,
      { align: "center" }
    );

    doc.line(30, 280, 80, 280);
    doc.line(130, 280, 180, 280);

    doc.text("Authorized Signature", 30, 287);
    doc.text("Recipient Signature", 130, 287);

    // ===== SAVE =====
    const fileName = `SalarySlip_${employeeData.name}_${salaryData.fromDate}_to_${salaryData.toDate}.pdf`;

    doc.save(fileName);
  };
}