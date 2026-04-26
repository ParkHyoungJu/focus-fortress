// ============================================================
// Focus Fortress — Electron Main Process
// ============================================================
// - BrowserWindow 960x640, resizable false, frameless
// - IPC handlers: active-win:get, store:get/set/delete, app:quit, window:minimize
// - Renderer owns polling cadence; main only responds to IPC requests
// ============================================================

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// active-win is dynamically required so a missing optional dep does not crash the app.
// The renderer will receive null and show a "감시 기능 미활성" badge.
let activeWin = null;
try {
  activeWin = require('active-win');
} catch (err) {
  console.warn('[focus-fortress] active-win not available, watch feature disabled:', err.message);
}

// electron-store dynamic require for same reason. Store without a DB falls back to in-memory map.
let Store = null;
try {
  Store = require('electron-store');
} catch (err) {
  console.warn('[focus-fortress] electron-store not available, using in-memory fallback:', err.message);
}

// ---------- Persistent store ----------
const store = Store
  ? new Store({
      name: 'focus-fortress',
      defaults: {
        totalXp: 0,
        level: 1,
        streakDays: 0,
        lastSessionDate: null,
        achievements: [],
        sessionLog: [],
        blockKeywords: [
          'youtube', 'twitch', 'reddit', 'instagram', 'tiktok',
          '쇼츠', 'shorts', 'x.com', 'twitter'
        ]
      }
    })
  : (() => {
      const mem = new Map();
      return {
        get: (k, d) => (mem.has(k) ? mem.get(k) : d),
        set: (k, v) => mem.set(k, v),
        delete: (k) => mem.delete(k),
        store: {}
      };
    })();

// ---------- Window ----------
let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 900,
    minWidth: 420,
    minHeight: 560,
    resizable: true,
    frame: false,
    backgroundColor: '#0b1020',
    title: 'Focus Fortress',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Dev-time: uncomment to auto-open DevTools
  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const image = nativeImage.createFromPath(iconPath);
    // If the file is missing, nativeImage returns an empty image. Skip tray in that case.
    if (image.isEmpty()) {
      console.warn('[focus-fortress] tray icon missing, skipping tray creation');
      return;
    }
    tray = new Tray(image);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Focus Fortress',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Focus Fortress');
    tray.setContextMenu(contextMenu);
  } catch (err) {
    console.warn('[focus-fortress] tray creation failed:', err.message);
  }
}

// ---------- IPC: active-win ----------
ipcMain.handle('active-win:get', async () => {
  if (!activeWin) return null;
  try {
    const info = await activeWin();
    if (!info) return null;
    return {
      owner: { name: info.owner && info.owner.name ? info.owner.name : '' },
      title: info.title || ''
    };
  } catch (err) {
    console.warn('[focus-fortress] active-win query failed:', err.message);
    return null;
  }
});

ipcMain.handle('active-win:available', () => {
  return Boolean(activeWin);
});

// ---------- IPC: store ----------
ipcMain.handle('store:get', (_evt, key, defaultValue) => {
  try {
    return store.get(key, defaultValue);
  } catch (err) {
    console.warn('[focus-fortress] store:get failed:', err.message);
    return defaultValue;
  }
});

ipcMain.handle('store:set', (_evt, key, value) => {
  try {
    store.set(key, value);
    return true;
  } catch (err) {
    console.warn('[focus-fortress] store:set failed:', err.message);
    return false;
  }
});

ipcMain.handle('store:delete', (_evt, key) => {
  try {
    store.delete(key);
    return true;
  } catch (err) {
    console.warn('[focus-fortress] store:delete failed:', err.message);
    return false;
  }
});

// ---------- IPC: window controls ----------
ipcMain.on('app:quit', () => {
  app.quit();
});

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

// ---------- App lifecycle ----------
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
