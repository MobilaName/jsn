const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openFile: (fodlerPath, fileName) => ipcRenderer.invoke('open-file', fodlerPath, fileName),
});
