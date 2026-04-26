// ============================================================
// Focus Fortress — Preload
// contextBridge: renderer gets a minimal, explicit API surface.
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('focusAPI', {
  // active window query
  getActiveWindow: () => ipcRenderer.invoke('active-win:get'),
  isWatchAvailable: () => ipcRenderer.invoke('active-win:available'),

  // persistent store
  storeGet: (key, defaultValue) => ipcRenderer.invoke('store:get', key, defaultValue),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store:delete', key),

  // window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  quit: () => ipcRenderer.send('app:quit')
});
