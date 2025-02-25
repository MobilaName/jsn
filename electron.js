import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import isDev from 'electron-is-dev';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // More secure
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(app.getAppPath(), 'preload.js'), // Use preload for IPC
    },
  });

  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(app.getAppPath(), 'dist', 'index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.on('closed', () => (mainWindow = null));
}

// Handle folder selection and return file list
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'], // Only allow folder selection
  });

  if (result.canceled) return [];

  const folderPath = result.filePaths[0];

  function traverseFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    return files.map((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      const isFolder = stats.isDirectory();
      const _file = {
        name: file,
        type: isFolder ? 'folder' : 'file',
      };

      // if (isFolder) {
      //   // If folder, traverse it and add children
      //   _file.children = traverseFolder(filePath);
      // }
      return _file;
    }).filter(f => f.name.endsWith('.js') && f.type === 'file');
  }

  const filesAndFolders = traverseFolder(folderPath);
  return [folderPath, filesAndFolders];
});

ipcMain.handle('open-file', async (_ev, folderPath, fileName) => {
  const filePath = path.join(folderPath, fileName);
  const fileData = fs.readFileSync(filePath, 'utf8');
  
  return fileData;
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
