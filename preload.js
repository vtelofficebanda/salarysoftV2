
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveExcel: (buffer) => ipcRenderer.invoke("save-excel-file", buffer)
});
