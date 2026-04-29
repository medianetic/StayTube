# yt-dlp Electron Frontend: Project Plan

## 1. Overview
The goal is to build a cross-platform desktop application (Linux, Windows, macOS) using Electron that serves as a modern, user-friendly frontend for the `yt-dlp` CLI tool. The application will allow users to download videos from YouTube (and other supported sites), select video qualities, and manage subtitles.

## 2. Tech Stack
- **Framework:** Electron (provides cross-platform compatibility).
- **Frontend Build Tool:** Vite (for fast and optimized renderer builds).
- **Frontend Library:** Vue.js (with TypeScript) for building the user interface.
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn-vue (for beautiful, accessible, and customizable components like inputs, dropdowns, and progress bars).
- **Backend/Main Process:** Node.js (with standard `child_process` to spawn and interact with the `yt-dlp` CLI).
- **Storage:** `electron-store` (for persisting user settings like download directory and theme).
- **Downloader:** `axios` or `node-fetch` (for downloading `yt-dlp` and `ffmpeg` binaries).

## 3. Core Features
1. **URL Input:**
   - A prominent, stylish input field for pasting YouTube URLs.
   - Validation and parsing of the provided URL.
2. **Metadata Fetching:**
   - Once a valid URL is provided, the app will query `yt-dlp` (e.g., using `-F` and `--list-subs` flags) to fetch available video qualities and subtitle languages.
3. **Download Options:**
   - **Quality Selection:** A dropdown menu to select available video resolutions/formats (e.g., 1080p, 720p, audio-only).
   - **Subtitle Selection:** A toggle switch for subtitles (On/Off) and a dropdown menu to select the subtitle language, if available.
4. **Download Management:**
   - Start download button.
   - Real-time progress bar (parsing stdout from `yt-dlp` to get download percentages).
   - Success/Error notifications.
5. **Binary Management:**
   - **Auto-Detection:** Check for `yt-dlp` and `ffmpeg` in the application's local "bin" folder on startup.
   - **One-Click Install:** If missing, provide a button to automatically download the correct version for the user's OS (Linux, Windows, macOS).
   - **Updates:** Optional check for updates to `yt-dlp`.
6. **Settings Screen:**
   - **Default Download Directory:** Ability to set and change the default path where videos are saved.
   - **Theme Selection:** Toggle or dropdown for Dark, Light, or System appearance.
   - **Binary Status:** Visual indicator showing if `yt-dlp` and `ffmpeg` are installed/ready.

## 4. UI/UX Design (shadcn-vue usage)
- **Input:** For the YouTube URL input and settings paths.
- **Button:** Primary action buttons for fetching details, downloading, and selecting directories.
- **Select:** Dropdown menus for video quality, subtitle languages, and theme selection.
- **Switch:** Toggle for enabling/disabling subtitles.
- **Progress:** Visual indicator for download status (both for video downloads and binary downloads).
- **Card:** Main container for the downloader and settings interfaces.
- **Tabs / Navigation:** To switch between the "Downloader" and "Settings" views.
- **Alert / Dialog:** To prompt the user when binaries are missing.

## 5. Implementation Strategy
### Phase 1: Setup & Initialization
- Initialize a new Electron application using Vite (`electron-vite`).
- Set up Vue.js, TypeScript, and Tailwind CSS.
- Initialize `shadcn-vue` and add basic components (Input, Button, Card, Select, Switch, Tabs, Progress).
- Integrate `electron-store` for settings persistence.

### Phase 2: Binary Management & Core Logic (Main Process)
- **Binary Manager:** Implement logic to detect OS and architecture (x64, arm64).
- Implement downloading logic for `yt-dlp` (from GitHub) and `ffmpeg` (from trusted static build sources).
- Implement IPC handlers to execute `yt-dlp` commands via `child_process.spawn`.
- Create a handler to fetch video metadata (`yt-dlp --dump-json <url>`).
- Create a handler to manage the download process and stream progress via IPC.
- Implement directory picker dialog.

### Phase 3: Frontend Development (Renderer Process)
- Build the main application UI with navigation using Vue components.
- **Setup/Check Overlay:** A screen that appears if binaries are missing, guiding the user to download them.
- **Downloader Tab:**
  - URL input, metadata display, quality/subtitle selection, and progress tracking.
- **Settings Tab:**
  - Download directory selection, theme switching, and binary status indicators.

### Phase 4: Polish & Packaging
- Handle errors gracefully.
- Ensure binaries are correctly permissions-set (e.g., `chmod +x` on Linux/macOS).
- Package the application using Electron Builder.

## 6. Pre-requisites & Dependencies
- The app will autonomously manage `yt-dlp` and `ffmpeg` binaries in a user-local directory (e.g., `userData/bin`).
- GitHub API (to fetch the latest `yt-dlp` release info).
- Trusted static FFmpeg builds (e.g., ffbinaries or evermeet.cx).