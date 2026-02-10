# Pro Creative Studio - Demart Katalog Uretim

Sofis urunleri icin profesyonel marketing materyali ureten web uygulamasi.

## Kurulum (Windows 10/11 + Docker Desktop)

### Gereksinimler
- Windows 10/11
- Docker Desktop (https://www.docker.com/products/docker-desktop/)

### Tek Komut Kurulum

```bash
docker compose up -d --build
```

Tarayicinizda acin: **http://localhost:3010**

### Durdurma
```bash
docker compose down
```

### Verileri temizleyip sifirdan baslatma
```bash
docker compose down -v
docker compose up -d --build
```

## Ozellikler

- 10 farkli profesyonel sablon
- Playwright PDF export (metin secilebilir, font gomulu)
- PNG/JPG export (6 preset boyut)
- Toplu export (ZIP)
- Her alan icin tipografi kontrolleri (font, boyut, kalin, italik, renk)
- Layer yonetimi (siralama, kilitleme, gorunurluk)
- Efektler (feathering, shadow, grain, blend mode)
- Arka plan kaldirma (rembg)
- Cevirmen (4 ton + terminoloji sozlugu)
- Tebrik + Taziye kart modulu
- Tema sistemi (4 preset + ozel)
- Proje backup/restore (ZIP)
- Asset kutuphanesi

## Teknoloji

- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + Playwright + Pillow
- Veritabani: MongoDB
- Export: Playwright Chromium (container icinde)

## Portlar

| Servis | Port |
|--------|------|
| Frontend (UI) | 3010 |
| Backend (API) | 8001 |
| MongoDB | 27017 |


## Export Runbook (PDF/PNG Neden Calismiyor?)

Bu projede Playwright browser download yerine **sistem Chromium** kullanilir.
Bu sayede 403/CDN engellerinden etkilenmeden export alinir.

### Hizli smoke test (onerilen)

```bash
docker compose up -d --build
docker compose run --rm backend python tests/export_smoke_test.py
```

### Host ortaminda calistirmak isterseniz

Host makinede Chromium kurulu olmalidir (`chromium` veya `chromium-browser`).
Kurulu degilse test su hata ile durur ve Docker komutuna yonlendirir.

### Beklenen env

- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`
- `CHROMIUM_PATH=/usr/bin/chromium`

Bu env'ler `docker-compose.yml` backend servisinde tanimlidir.
