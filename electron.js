import { app, BrowserWindow, dialog, ipcMain, session, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import isDev from 'electron-is-dev';

let mainWindow;

const isMac = process.platform === 'darwin'


function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join('./public/icon.png'),
    title: 'JSNotes',
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    frame: false,
    toolbar: false,
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      nodeIntegration: false, // More secure
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(app.getAppPath(), 'preload.js'), // Use preload for IPC
    },
  });

  mainWindow.maximize();

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join('./public/icon.png'));
  }

  if (process.platform === 'win32') {
    app.setUserTasks([
      
    ])
  }

  app.setName('JSNotes')

  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
          label: 'JSNotes',
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {label: 'Open Notebook', click: () => mainWindow.webContents.send('open-notebook')},
        {type: 'separator'},
        {role: 'recentdocuments', label: 'Recent Notebooks', click: () => {console.log('Recent Notebooks')}},
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [
                  { role: 'startSpeaking' },
                  { role: 'stopSpeaking' }
                ]
              }
            ]
          : [
              { role: 'delete' },
              { type: 'separator' },
              { role: 'selectAll' }
            ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ]
          : [
              { role: 'close' }
            ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: '? Help',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = ['require-corp']
    details.responseHeaders['Cross-Origin-Opener-Policy'] = ['same-origin']
    callback({ responseHeaders: details.responseHeaders })
  })

  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(app.getAppPath(), 'dist', 'index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.on('closed', () => (mainWindow = null));
}

const selectFolder = async () => {
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
}

// Handle folder selection and return file list
ipcMain.handle('select-folder', selectFolder);

const openFolder = async (_ev, folderPath) => {
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
      return _file;
    }).filter(f => f.name.endsWith('.js') && f.type === 'file');
  }

  const filesAndFolders = traverseFolder(folderPath);
  app.addRecentDocument(folderPath);
  return [folderPath, filesAndFolders];
}

ipcMain.handle('open-folder', openFolder);

ipcMain.handle('open-file', async (_ev, folderPath, fileName) => {
  const filePath = path.join(folderPath, fileName);
  const fileData = fs.readFileSync(filePath, 'utf8');
  
  return fileData;
});

ipcMain.handle('create-file', async (_ev, folderPath, fileName) => {
  const filePath = path.join(folderPath, `${fileName}.js`);

  if (fs.existsSync(filePath)) {
    return false;
  }
  
  fs.writeFileSync(filePath, `/* # ${fileName} */`);
  return true;
});

ipcMain.handle('save-file', async (_ev, folderPath, fileName, fileData) => {
  const filePath = path.join(folderPath, fileName);
  try {
    fs.writeFileSync(filePath, fileData);
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
});

app.on('ready', () => {
  createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
