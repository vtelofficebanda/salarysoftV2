import { db } from "../firebase.js";
import { collection, getDocs, query, where } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getStatsByDateRange(aadhaar, fromDate, toDate) {

    const q = query(
        collection(db, "daily_records"),
        where("aadhaar", "==", aadhaar)
    );

    const snapshot = await getDocs(q);

    let recordsMap = {};

    snapshot.forEach(doc => {
        const d = doc.data();
        recordsMap[d.date] = d;
    });

    let tPresent = 0;
    let tHalf = 0;
    let tSunday = 0;
    let tAdvance = 0;
    let advanceLog = [];

    let current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {

        const dateStr = current.toISOString().slice(0, 10);
        const day = current.getDay();
        const record = recordsMap[dateStr];

        if (day === 0) {
            // ✅ SUNDAY LOGIC (FINAL)

            if (!record) {
                // Sunday no entry → default paid
                tSunday += 1;
            } 
            else if (Number(record.status) === 1) {
                // Full work → double
                tSunday += 2;
            } 
            else if (Number(record.status) === 0.5) {
                // Half work → 1 + 0.5
                tSunday += 1.5;
            }

        } else {
            // Normal days
            if (record) {
                if (Number(record.status) === 1) tPresent += 1;
                else if (Number(record.status) === 0.5) tHalf += 1;
            }
        }

        // Advance
        if (record && Number(record.advance) > 0) {
            tAdvance += Number(record.advance);
            advanceLog.push({
                date: record.date,
                amt: Number(record.advance)
            });
        }

        current.setDate(current.getDate() + 1);
    }

    return { tPresent, tHalf, tSunday, tAdvance, advanceLog };
}