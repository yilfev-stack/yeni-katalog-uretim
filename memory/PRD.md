# Pro Creative Studio - PRD v3

## Duzeltilen Sorunlar (2026-02-09)
- Template switch data loss: AUTO-SAVE + icerik koruma eklendi
- Export hatasi: Playwright Chromium path auto-detect, syntax fix, hata mesajlari
- Image quality: PNG transparency korunuyor, JPEG quality=97
- Logo: Yeni Demart logosu (8cw43hdp)
- Azerbaycanca dil eklendi
- Metin tasmasi: overflow:hidden + font boyut kucultme
- Effects UX: "Hedef: Secili layer" bilgisi eklendi
- Seed projeler: VPI catalog (3 sayfa) + Tebrik + Taziye karti
- Docker: nginx.conf service name fix, port sadece 3010

## Test Sonuclari
- PDF export: 200 OK (valid %PDF-)
- PNG export: 200 OK
- JPG export: 200 OK
- Batch ZIP: 200 OK
- Template switch: Icerik korunuyor (verified)
- Backend: Syntax OK
- Frontend: Compiled with 1 warning (eslint, non-blocking)
