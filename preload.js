const { contextBridge, ipcRenderer } = require('electron');

// APIهای امن برای دسترسی از سمت رندرر
contextBridge.exposeInMainWorld('electronAPI', {
  // مثال: دریافت نسخه نود
  getNodeVersion: () => process.versions.node,
  
  // مثال: دریافت نسخه کرومیوم
  getChromeVersion: () => process.versions.chrome,
  
  // مثال: دریافت نسخه الکترون
  getElectronVersion: () => process.versions.electron,
  
  // تابع عمومی برای ارسال پیام به فرآیند اصلی
  send: (channel, data) => {
    const validChannels = [/* کانال‌های مجاز را اینجا تعریف کنید */];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // تابع عمومی برای دریافت پاسخ از فرآیند اصلی
  receive: (channel, func) => {
    const validChannels = [/* کانال‌های مجاز را اینجا تعریف کنید */];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // تابع عمومی برای فراخوانی متد در فرآیند اصلی و دریافت پاسخ
  invoke: (channel, data) => {
    const validChannels = [/* کانال‌های مجاز را اینجا تعریف کنید */];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject('کانال نامعتبر است');
  }
});

// جلوگیری از دسترسی مستقیم به ماژول‌های Node.js
process.once('loaded', () => {
  // حذف دسترسی مستقیم به ماژول‌های حساس
  delete window.require;
  delete window.module;
  delete window.exports;
  delete window.__filename;
  delete window.__dirname;
});
