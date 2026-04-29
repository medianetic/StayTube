"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  checkBinaries: () => electron.ipcRenderer.invoke("check-binaries"),
  downloadYTIDlp: () => electron.ipcRenderer.invoke("download-yt-dlp"),
  downloadFFmpeg: () => electron.ipcRenderer.invoke("download-ffmpeg"),
  getMetadata: (url) => electron.ipcRenderer.invoke("get-metadata", url),
  startDownload: (options) => electron.ipcRenderer.invoke("start-download", options),
  selectDirectory: () => electron.ipcRenderer.invoke("select-directory"),
  getStoreValue: (key) => electron.ipcRenderer.invoke("get-store-value", key),
  setStoreValue: (key, value) => electron.ipcRenderer.invoke("set-store-value", key, value),
  checkVideoExists: (title) => electron.ipcRenderer.invoke("check-video-exists", title),
  openExternal: (url) => electron.ipcRenderer.invoke("open-external", url),
  openFile: (filePath) => electron.ipcRenderer.invoke("open-file", filePath),
  listVideos: (dirPath) => electron.ipcRenderer.invoke("list-videos", dirPath),
  onBinaryProgress: (callback) => electron.ipcRenderer.on("binary-progress", (_event, value) => callback(value)),
  onDownloadProgress: (callback) => electron.ipcRenderer.on("download-progress", (_event, value) => callback(value))
});
