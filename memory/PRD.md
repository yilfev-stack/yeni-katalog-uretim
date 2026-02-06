# Pro Creative Studio - PRD

## Problem Statement
Sofis urunleri icin profesyonel kalitede one-page reklam, katalog ve kart (tebrik/taziye) ureten web uygulamasi. PDF+PNG+JPG export, arka plan kaldirma, ceviri, tema sistemi, asset kutuphanesi.

## Architecture
- **Frontend:** React + Tailwind + Shadcn UI
- **Backend:** FastAPI + Motor (MongoDB) + Playwright (export) + Pillow (image processing)
- **DB:** MongoDB
- **Export Engine:** Playwright Chromium print-to-PDF / screenshot
- **Translation:** Emergent LLM Key (OpenAI gpt-4o-mini)
- **BG Removal:** rembg (when installed)

## User Personas
- Katalog Editoru: Urun katalogu olusturan pazarlama personeli
- Teknik Yazar: Urun aciklamalari yazan muhendis
- Satis Temsilcisi: Musterilere katalog gonderen satisci

## Core Requirements
1. 10 farkli sablon (birbirinden tamamen farkli)
2. Playwright PDF (metin secilebilir, font gomulu)
3. PNG/JPG export (6 preset + ozel boyut)
4. AYNI HTML/CSS render pipeline (preview=export 1:1)
5. Layer yonetimi (siralama, kilitleme, gorunurluk)
6. Edge feathering + grain overlay + blend modes
7. Background removal (queue + progress + cache)
8. JPEG/PNG resize (Lanczos)
9. Cevirmen (4 ton + terminoloji sozlugu + lock)
10. Tebrik + Taziye kart modulu
11. Merkezi asset library (PNG+JPG+SVG)
12. Brand/Theme sistemi
13. Batch export (ZIP)
14. Font bundle (server-side)
15. SVG destegi
16. Safe area / bleed overlay
17. Proje backup/restore (ZIP)
18. Local-first mimari (Docker Compose, localhost:3010)

## What's Been Implemented (2026-02-06)
- Backend: Tam CRUD (catalogs, pages, cards, assets, themes, glossary)
- Playwright PDF/PNG/JPG export calisiyor
- Batch export (ZIP) calisiyor
- Translation API (Emergent LLM Key) calisiyor
- BG Removal endpoint hazir (rembg gerekli)
- Image upload/resize calisiyor
- Backup export/import calisiyor
- Frontend: Dashboard + Editor + CardEditor
- 10 template (HTML/CSS engine - tek kaynak)
- Layer panel (visibility, lock, reorder)
- Effects panel (feather, shadow, grain, blend)
- Template selection dialog
- Export dialog (tekli + batch)
- Translator sheet
- Theme selection
- Safe area overlay

## Test Results (2026-02-06)
- Backend: 100% (28/28 API tests passed)
- Frontend: 95% (core functionality working)

## Prioritized Backlog
### P0 (Remaining)
- [ ] rembg installation for BG removal
- [ ] Docker Compose file (localhost:3010)
- [ ] Font bundle optimization

### P1
- [ ] Export history UI
- [ ] Snap-to-grid hizalama
- [ ] Asset library dialog UI
- [ ] Glossary management UI

### P2
- [ ] Advanced drag & drop in editor
- [ ] Custom text boxes on canvas
- [ ] Bleed overlay toggle
