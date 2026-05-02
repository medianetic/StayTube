# Current Feature

## Status
Not Started

## Goals

## Notes

## History
- **Open Folder in Library**: Added an "Open Folder" icon with tooltip to library items and recent activity, allowing users to reveal downloaded files in the system's file manager using Electron's `shell.showItemInFolder`.
- **Library Enhancements: Visuals & Layouts**: Added thumbnail generation (FFmpeg), view toggles (Grid/List), library search, sorting (Date, Name, Size), and deletion with confirmation. Integrated `ffprobe` for duration metadata and a custom `thumb://` protocol. Fixed thumbnail loading on Linux (path decoding/leading slash) and redesigned the library actions with compact icon-label stacks and visual padding for thumbnails.
