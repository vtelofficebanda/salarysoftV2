import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= SAVE PRODUCT =================
document.getElementById("saveProduct")
.addEventListener("click", async () => {

  const name = document.getElementById("pName").value.trim();
  const code = document.getElementById("pCode").value.trim();
  const category = document.getElementById("pCategory").value.trim();
  const unit = document.getElementById("pUnit").value.trim();
  const room = document.getElementById("pRoom").value.trim() || "N/A";

  const purchasePrice = parseFloat(document.getElementById("pPurchase").value) || 0;
  const salePrice = parseFloat(document.getElementById("pSale").value) || 0;
  const minStock = parseFloat(document.getElementById("pMinStock").value) || 0;

  console.log("Saving Product:", { name, code, room }); // 🔥 DEBUG

  if (!name || !code) {
    alert("⚠️ Product Name & Code required");
    return;
  }

  try {

    await addDoc(collection(db, "products"), {
      name,
      code,
      category,
      unit,
      purchasePrice,
      salePrice,
      stock: 0,
      minStock,
      room,
      createdAt: new Date()
    });

    alert("✅ Product Added Successfully");

    // clear inputs
    document.getElementById("pName").value = "";
    document.getElementById("pCode").value = "";
    document.getElementById("pCategory").value = "";
    document.getElementById("pUnit").value = "";
    document.getElementById("pRoom").value = "";
    document.getElementById("pPurchase").value = "";
    document.getElementById("pSale").value = "";
    document.getElementById("pMinStock").value = "";

    loadProducts();

  } catch (error) {
    console.error("SAVE ERROR:", error); // 🔥 IMPORTANT
    alert("❌ Error: " + error.message);
  }
});


// ================= LOAD PRODUCTS =================
async function loadProducts() {

  const snapshot = await getDocs(collection(db, "products"));
  const table = document.getElementById("productList");

  table.innerHTML = "";

  snapshot.forEach(docSnap => {
    const p = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.code}</td>
        <td>${p.category || "-"}</td>
        <td>${p.unit || "-"}</td>
        <td>₹${p.purchasePrice || 0}</td>
        <td>₹${p.salePrice || 0}</td>
        <td>${p.stock || 0}</td>
        <td>${p.minStock || 0}</td>
        <td>${p.room || "-"}</td>
      </tr>
    `;
  });
}


// INIT
loadProducts();