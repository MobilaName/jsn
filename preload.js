const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openFile: (fodlerPath, fileName) => ipcRenderer.invoke('open-file', fodlerPath, fileName),
  openFolder: (fodlerPath) => ipcRenderer.invoke('open-folder', fodlerPath),
  saveFile: (fodlerPath, fileName, fileData) => ipcRenderer.invoke('save-file', fodlerPath, fileName, fileData),
});
