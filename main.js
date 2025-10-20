const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// فعال‌سازی remote
require('@electron/remote/main').initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: process.env.NODE_ENV !== 'development',
      allowRunningInsecureContent: process.env.NODE_ENV === 'development'
    },
    icon: path.join(__dirname, 'public/logo.ico'),
  });

  // فعال کردن remote برای این پنجره
  require('@electron/remote/main').enable(win.webContents);

  // در حالت توسعه، از سرور محلی استفاده کن
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  return win;
}

// ایجاد preload.js اگر وجود ندارد
const fs = require('fs');
const preloadPath = path.join(__dirname, 'preload.js');
if (!fs.existsSync(preloadPath)) {
  fs.writeFileSync(preloadPath, `
    const { contextBridge, ipcRenderer } = require('electron');
    
    // در اینجا می‌توانید APIهای مورد نیاز را در معرض برنامه قرار دهید
    contextBridge.exposeInMainWorld('electronAPI', {
      // مثال: فراخوانی تابعی در فرآیند اصلی
      callMain: (channel, data) => {
        return ipcRenderer.invoke(channel, data);
      },
      // اضافه کردن توابع دیگر در صورت نیاز
    });
  `);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
