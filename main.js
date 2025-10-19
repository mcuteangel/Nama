const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public/logo.ico'), // اگر آیکون داری، مسیرش رو تنظیم کن
  });

  // در حالت توسعه، از سرور محلی استفاده کن
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173'); // پورت Vite پیش‌فرض
    win.webContents.openDevTools(); // برای دیباگ
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html')); // برای تولید نهایی
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
