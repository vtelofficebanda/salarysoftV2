export function calculateSalary(employeeSalary, stats) {

    const dailyRate = employeeSalary / 30;

    const totalAttendance =
        stats.tPresent +
        stats.tSunday +
        (stats.tHalf * 0.5);

    const grossSalary = totalAttendance * dailyRate;

    const finalSalary = grossSalary - stats.tAdvance;

    return {
        dailyRate,
        totalAttendance,
        grossSalary,
        finalSalary
    };
}