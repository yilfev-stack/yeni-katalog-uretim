# Pro Creative Studio - PRD v2

## Problem Statement
Sofis urunleri icin profesyonel kalitede one-page reklam, katalog ve kart (tebrik/taziye) ureten web uygulamasi.

## Architecture
- Frontend: React + Tailwind + Shadcn UI (DARK THEME)
- Backend: FastAPI + Motor (MongoDB) + Playwright (export) + Pillow
- Export: Playwright Chromium print-to-PDF / screenshot
- Translation: Emergent LLM Key (gpt-4o-mini)

## What's Been Implemented (2026-02-06)
- Dark theme UI (professional design tool aesthetic)
- 10 farkli sablon (Industrial Product Alert, Event Poster, Minimal Premium, Tech Data Sheet, Photo Dominant, Geometric Corporate, Dark Tech, Clean Industrial Grid, Tebrik Karti, Taziye Karti)
- Per-field typography controls (font family, size, bold, italic, color per field)
- Playwright PDF export (metin secilebilir, font gomulu)
- PNG/JPG export (6 preset boyut + ozel)
- Batch export (ZIP)
- Same HTML/CSS render pipeline (preview = export 1:1)
- Layer panel (visibility, lock, reorder)
- Effects (feathering, shadow, grain overlay, blend mode)
- Cevirmen (4 ton + terminoloji sozlugu + lock)
- Tebrik + Taziye kart modulu
- Tema sistemi (4 preset)
- Proje backup/restore (ZIP)
- Demo VPI-A catalog embedded
- Page title: "Demart - Katalog Uretim"

## Test Results
- Backend: 100% (28/28)
- Frontend: 98%

## Remaining Backlog
### P0
- [ ] rembg installation for BG removal
- [ ] Docker Compose (localhost:3010)
- [ ] Font bundle optimization

### P1
- [ ] Asset Library full UI
- [ ] Glossary management UI
- [ ] Export history UI
- [ ] Snap-to-grid
- [ ] Template preview thumbnail caching
