# Revival Bible v3

Revival Bible v3 is a local-first Electron desktop application for managing the story bible, decisions, characters, episodes, living documents, and AI-assisted creative sessions for the series Revival.

Reference/project documents live outside the app code folder at:

~/Documents/revival-bible-docs

This app is built from scratch in:

~/Documents/revival-bible-v3

GitHub repo:

https://github.com/courtneydowns/revival-bible-v3

## Phase 1

This repository currently contains the Phase 1 foundation only:

- Electron + React 18 + electron-vite shell
- SQLite schema initialization through `better-sqlite3`
- Provider-neutral AI IPC placeholders
- Search and export IPC placeholders
- Zustand app state
- Dark editorial three-column interface

Story-bible seeding starts in Phase 2. The app does not import `STORY_BIBLE_V4.txt` yet and does not make external AI calls.

## Commands

```bash
npm install
npm run build
npm run dev
```

`npm run dev` launches the Electron app in development mode. `npm start` previews the built Electron app after `npm run build`.
