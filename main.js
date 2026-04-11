const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, // Thoda bada width dashboard ke liye badiya hai
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Dashboard testing ke liye 'false' sahi hai
      webSecurity: false // Firebase ya external CDN blocks se bachne ke liye development mein useful hai
    }
  });

  mainWindow.setMenu(null);

  // Path check karein: views/index.html sahi hona chahiye
  mainWindow.loadFile(path.join(__dirname, "views/index.html"));

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Auto updater check (Optional)
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ================= EXCEL SAVE HANDLER =================
ipcMain.handle("save-excel-file", async (event, buffer) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "Save Salary Report",
      defaultPath: path.join(app.getPath("downloads"), `Salary_Report_${Date.now()}.xlsx`),
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
    });

    if (filePath) {
      // Buffer conversion fix
      const uint8array = new Uint8Array(buffer);
      fs.writeFileSync(filePath, uint8array);
      return { success: true, path: filePath };
    }
    return { success: false, message: "Save cancelled" };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: error.message };
  }
});