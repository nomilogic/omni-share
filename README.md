# Client Standalone

This folder is a standalone copy of the original `client/` application. It can be run independently from the monorepo.

Quick start

```bash
# from project root
cd client-standalone
npm install
npm run dev
```

Notes
- The project reuses the repository's `shared/` folder via the `@shared` path. If you want a fully independent app, copy `shared/` into this folder and update paths.
- Environment variables from the original `.env` may be required. Copy or create a `.env` in this folder if you need the same settings.
