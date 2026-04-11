import { db } from "../firebase.js";
import { collection, getDocs, query, where } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getStatsByDateRange(aadhaar, fromDate, toDate) {

    const q = query(
        collection(db, "daily_records"),
        where("aadhaar", "==", aadhaar)
    );

    const snapshot = await getDocs(q);

    let tPresent = 0;
    let tHalf = 0;
    let tSunday = 0;
    let tAdvance = 0;
    let advanceLog = [];

    snapshot.forEach(doc => {
        const d = doc.data();
        const recordDate = new Date(d.date);

        if (recordDate >= new Date(fromDate) && recordDate <= new Date(toDate)) {

            if (d.status === 1) tPresent++;
            else if (d.status === 0.5) tHalf++;
            else if (d.status === 1.5) tSunday++;

            if (d.advance > 0) {
                tAdvance += d.advance;
                advanceLog.push({ date: d.date, amt: d.advance });
            }
        }
    });

    return { tPresent, tHalf, tSunday, tAdvance, advanceLog };
}