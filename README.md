# PanelFlow

PanelFlow is a lightweight prototype for a scroll-first manhwa reader. It focuses on a frictionless reading experience, quick chapter uploads, and a design system that can scale into a production-ready platform.

## Features
- **Immersive reader**: Vertical scrolling layout with lazy-loaded pages, chapter navigation, and automatic progress tracking in `localStorage`.
- **Library management**: Browse series from the homepage or the full library view. Chapters are organized chronologically per series.
- **Admin uploads**: Drag & drop uploader that sorts page images, persists them locally as data URLs, and refreshes the library snapshot instantly.
- **Theme system**: Dark mode by default with an accessible light-mode toggle and `prefers-color-scheme` detection.
- **Responsive UI**: Touch-friendly hit targets, fluid layouts, and sticky headers for desktop and mobile readers.

## Local storage strategy
- `panelflow-library-v1` stores all series, chapters, and page metadata including base64 image data. This keeps the prototype self-contained.
- `panelflow-progress-v1` persists scroll offset per chapter to resume reading.
- Storage helpers live in `assets/js/storage.js` so they can later be swapped with API calls without changing UI layers.

## UX considerations
- Keep navigation persistent via sticky headers while maximizing reading canvas.
- Use large touch-friendly buttons and vertical spacing to avoid accidental taps on mobile.
- Lazy-load images with `loading="lazy"` and pre-sorted pages to prevent layout shifts.
- Provide progress feedback and quick chapter switching via the sticky dropdown.
- Offer immediate empty-state guidance on first load.

## Migrating to a production stack
1. **Backend service**: Introduce a Node.js or NestJS API with authentication and role-based access (admin vs. reader).
2. **Persistent storage**: Replace local storage with MongoDB or PostgreSQL. Store image assets in object storage (AWS S3, Cloudflare R2) and keep metadata references in the database.
3. **Uploads**: Convert the admin uploader to send `FormData` to the API. Use presigned URLs for direct-to-storage uploads.
4. **Image optimization**: Integrate an image CDN or server-side transformer to deliver WebP/AVIF, dynamic resizing, and smart cropping.
5. **Caching & performance**: Leverage HTTP caching headers, incremental static regeneration (Next.js), or service workers for offline reading.
6. **Security**: Add JWT-based auth, rate limiting on uploads, and validation to guard against malformed files.

## Development notes
- The project uses plain HTML/CSS/JS to stay framework-agnostic.
- All scripts are ES modules so they can be bundled later.
- To reset demo data, use the **Reset Library** button in the admin panel.
- Because data URLs can be large, this prototype is meant for short demo chapters. Move to a real backend before uploading production-sized chapters.
