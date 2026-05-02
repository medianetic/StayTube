import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('api', {
  checkBinaries: () => ipcRenderer.invoke('check-binaries'),
  downloadYTIDlp: () => ipcRenderer.invoke('download-yt-dlp'),
  downloadFFmpeg: () => ipcRenderer.invoke('download-ffmpeg'),
  getMetadata: (url: string) => ipcRenderer.invoke('get-metadata', url),
  startDownload: (options: any) => ipcRenderer.invoke('start-download', options),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getStoreValue: (key: string) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key: string, value: any) => ipcRenderer.invoke('set-store-value', key, value),
  checkVideoExists: (title: string) => ipcRenderer.invoke('check-video-exists', title),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  openFolder: (filePath: string) => ipcRenderer.invoke('open-folder', filePath),
  deleteVideo: (filePath: string) => ipcRenderer.invoke('delete-video', filePath),
  listVideos: (dirPath?: string) => ipcRenderer.invoke('list-videos', dirPath),
  onBinaryProgress: (callback: any) => ipcRenderer.on('binary-progress', (_event, value) => callback(value)),
  onDownloadProgress: (callback: any) => ipcRenderer.on('download-progress', (_event, value) => callback(value)),
})
