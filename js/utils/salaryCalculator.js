export function calculateSalary(employeeSalary, stats) {

    const salary = Number(employeeSalary) || 0;

    const dailyRate = salary / 30;

    const totalAttendance =
        (stats.tPresent || 0) +
        (stats.tSunday || 0) +
        ((stats.tHalf || 0) * 0.5);

    const grossSalary = totalAttendance * dailyRate;

    const finalSalary = grossSalary - (stats.tAdvance || 0);

    return {
        dailyRate: Number(dailyRate.toFixed(2)),
        totalAttendance: Number(totalAttendance.toFixed(2)),
        grossSalary: Number(grossSalary.toFixed(2)),
        finalSalary: Number(finalSalary.toFixed(2))
    };
}