# PRO CREATIVE STUDIO - FINAL ON RAPOR v3 (SON VERSIYON)
## Web Uygulamasi - Sofis Urunleri Icin Profesyonel Marketing Studio
## Tarih: Subat 2026

---

## 1. GENEL BAKIS

**Amac:** Sofis urunleri icin profesyonel kalitede one-page reklam, katalog ve kart (tebrik/taziye) ureten; PDF + PNG + JPG cikti veren; gorsel arka plan silen; ceviri yapan; tasarimciya bagimliligi bitiren bir web uygulamasi.

**Teknoloji:** React (Frontend) + FastAPI (Backend) + MongoDB (Veritabani) + Playwright (PDF/PNG export)

**Erisim:** Tarayici uzerinden (Chrome/Edge/Firefox)

**KRITIK: LOCAL-FIRST MIMARI**
- Bu proje hosted/cloud DEGIL, local-first olacak
- Docker Compose ile kullanicinin kendi PC'sinde localhost uzerinden calisacak
- Internetsiz de PDF/PNG/JPG export alinacak (ceviri haric)
- Tum islemler (render, export, BG removal, resize) LOCAL sunucuda yapilir
- Internet gereken TEK ozellik: Cevirmen (LLM API cagrisi)

---

## 2. ONAYLANAN MADDELER (Tam Kapsam)

### Madde 1: Layer Yonetimi (Ust/Alt Siralama + Kilitleme)
- Editor'da her eleman (metin, gorsel, logo, ikon) ayri bir layer
- Layer panelinde liste halinde gorunur
- Surukleme ile layer sirasi degistirilebilir (ust/alt)
- Her layer icin kilit butonu: kilitli layer tasinamaz, boyutlandirilamaz, silinemez
- Her layer icin gorunurluk toggle'i (goz ikonu)
- Secili layer vurgulanir (highlight)

### Madde 2: Edge Feathering + Grain/Kompozit Destegi
- **Edge Feathering:** LAYER BAZLI - her gorsel layer'a ayri feather
- **Grain/Noise Overlay:** GLOBAL - tek overlay layer olarak tum tasarima
- **Soft Shadow:** LAYER BAZLI - her layer'a ayri shadow
- **Blend Mode:** LAYER BAZLI - Normal, Multiply, Screen, Overlay
- **GARANTI:** Tum efektler preview ve export'ta BIREBIR ayni render edilir

### Madde 3: JPEG/PNG Resize Yuksek Kalite
- Server-side Pillow ile Lanczos algoritmasi
- JPEG kalite ayari: 80-100 arasi secim
- EXIF orientation otomatik duzeltme
- Istege bagli hafif sharpen
- Kabul testi: 3000px --> 1200px kucultmede bariz camurlasma olmayacak

### Madde 4: Merkezi Asset Library (Projeler Arasi)
- Tum projelerde ortak kullanilan asset havuzu
- Kategoriler: Logolar, Ikonlar (SVG dahil), Arka Planlar, Urun Fotolari
- Asset yukleme (PNG, JPG, SVG), silme, etiketleme
- Herhangi bir projeden asset library'ye erisim

### Madde 5: Brand/Theme (Renk + Font Seti) Destegi
- Sirket bazli tema tanimlama (renk paleti + font seti)
- Hazir tema presetleri + ozel tema olusturma
- Tema degistirdiginde sablon otomatik guncellenir

### Madde 6: Batch Export (Tek Tikla Coklu Preset Boyut)
- Toplu export: tek seferde birden fazla boyut ve format
- ZIP dosyasi olarak indirilir
- Dosya isimlendirme standardi: ProjeAdi_Tarih_Sablon_Boyut.format

---

## 3. KRITIK TEKNIK TUZAKLAR VE COZUMLERI

### TUZAK 1: Editor Preview = Export 1:1 Ayni
- Editor preview ve export AYNI HTML/CSS template engine kullanir
- Editor = Template Renderer (HTML/CSS) + Draggable Overlay
- Export = Ayni HTML/CSS + Playwright render
- **Garanti:** "Editor preview and exports use the SAME HTML/CSS render pipeline."

### TUZAK 2: Efektler Preview = Export Ayni
- Tum efektler SADECE CSS ile (Playwright ayni Chromium engine)
- Feather: mask-image / filter:blur - LAYER BAZLI
- Grain: background-image noise texture - GLOBAL
- Blend: mix-blend-mode - LAYER BAZLI
- Shadow: filter:drop-shadow / box-shadow - LAYER BAZLI
- **Garanti:** "All effects render identically in preview and export."

### TUZAK 3: BG Removal Performans
- Job/queue ile calisir, progress status doner
- Sonuc cache'lenir (asset hash bazli)
- Ayni gorsel tekrar yuklendignde cache'den doner
- Timeout: max 60 saniye
- **Garanti:** "BG removal: queued job + progress + cached per asset hash."

---

## 4. DEGERLI EK MADDELER

### EK A: Font Bundle (Server-Side, PDF Gomulu)
- Fontlar server'da paketli (CDN'ye bagimsiz, internetsiz calisir)
- CSS'de @font-face ile local dosyadan yukleme
- PDF'de fontlar %100 gomulu
- Font fallback listeleri tanimli

### EK B: Safe Area / Bleed (A4 Baski)
- Editor'da safe margin overlay (toggle ile acilir/kapanir)
- A4 icin 5mm safe margin cizgisi
- Bleed opsiyonel: 3mm tasma alani
- Safe area cizgileri export'a dahil edilmez

### EK C: Versioning / Export Gecmisi
- Her export bir version kaydi olusturur
- Dashboard'da proje bazli export gecmisi
- ZIP isimlendirme: {ProjeAdi}_{Tarih}_{Sablon}_{Boyut}.{format}

### EK D: SVG Ikon / Vektor Destegi
- Asset library'ye SVG yukleme
- Canvas'ta vektor render (buyutmede bozulmaz)
- PDF'de SVG vektor kalir

### EK E: Terminoloji Sozlugu Lock
- Kilitli terimler ceviride ASLA degistirilmez
- Case sensitive opsiyonu
- Varsayilan kilitli: EasiDrive, VPI, Netherlocks, Sofis, Demart

---

## 5. YENl EKLENEN 3 MADDE (v3)

### YENl 1: LOCAL-FIRST MIMARI (Internetsiz Calisma)

**Prensip:** Uygulama kullanicinin PC'sinde Docker Compose ile calisir. Internet baglantisi SADECE cevirmen icin gerekli.

**Internetsiz calisan ozellikler:**
- PDF export (Playwright, local Chromium)
- PNG/JPG export (Playwright screenshot, local)
- Background removal (rembg, local U2Net model)
- Gorsel resize (Pillow, local)
- Tum editor islemleri (drag&drop, layer, efektler)
- Asset library (local MongoDB)
- Theme/brand ayarlari (local)
- Proje kaydet/ac (local)

**Internet gerektiren ozellikler:**
- Cevirmen (LLM API cagrisi)
- Cevirmen kullanilmadiginda internet GEREKMEZ

**Docker Compose yapisi:**
```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]

  backend:
    build: ./backend
    ports: ["8001:8001"]
    depends_on: [mongodb]

  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]

volumes:
  mongo_data:
```

### YENl 2: Web Optimize Dosya Boyutu ve Export Performans Hedefi

**Dosya boyutu hedefleri:**

| Format | Yuksek Kalite | Web Optimize |
|--------|--------------|--------------|
| PDF A4 (tek sayfa) | 500KB - 2MB | 200KB - 500KB |
| PNG 1080x1080 | 800KB - 2MB | 200KB - 400KB |
| PNG 1920x1080 | 1.5MB - 4MB | 400KB - 800KB |
| JPG 1080x1080 | 300KB - 800KB | 80KB - 200KB |
| JPG 1920x1080 | 600KB - 1.5MB | 150KB - 400KB |

**Web Optimize teknikleri:**
- PNG: Pillow optimize=True, compress_level=9
- JPG: quality=75 (Web) vs quality=95 (High)
- PDF: Gorseller PDF icinde compress edilir
- Batch ZIP: her dosya ayri optimize edilir

**Export performans hedefleri:**

| Islem | Hedef Sure |
|-------|-----------|
| Tekli PDF export | < 5 saniye |
| Tekli PNG export | < 3 saniye |
| Tekli JPG export | < 2 saniye |
| Batch export (6 preset) | < 20 saniye |
| Background removal | < 30 saniye (ilk kez) |
| Background removal (cache) | < 1 saniye |
| Gorsel resize | < 2 saniye |

**Performans optimizasyonlari:**
- Playwright browser instance havuzu (her export'ta yeni acilmaz)
- rembg model bir kere yuklenir, bellekte kalir
- Asset cache (ayni gorsel tekrar islenmez)
- Paralel batch export (mumkun oldugunda)

### YENl 3: Project Backup/Restore (JSON/ZIP Export & Import)

**Backup Export (Proje Yedekleme):**
- Tek tikla projeyi ZIP olarak indir
- ZIP icerigi:
  ```
  project_backup_SofisVPI_20260215.zip
  ├── project.json          # Proje verileri (sayfalar, icerik, layer bilgileri)
  ├── theme.json            # Aktif tema ayarlari (renk paleti + font seti)
  ├── glossary.json         # Terminoloji sozlugu (tum terimler + kilit durumu)
  ├── assets/               # Projede kullanilan tum asset'ler
  │   ├── logo_demart.png
  │   ├── logo_sofis.png
  │   ├── product_vpi.jpg
  │   ├── icon_valve.svg
  │   └── bg_industrial.jpg
  └── manifest.json         # Backup meta: tarih, versiyon, uygulama surumu
  ```

**Backup Import (Proje Geri Yukleme):**
- ZIP dosyasi yukle --> uygulama otomatik parse eder
- Import secenekleri:
  - [x] Proje verilerini yukle
  - [x] Tema ayarlarini yukle
  - [x] Sozlugu yukle
  - [x] Asset'leri yukle
  - [ ] Mevcut projeyi degistir (override) / Yeni proje olarak ekle
- Catisma yonetimi: ayni isimde proje varsa "ustune yaz" veya "yeni kopya" secimi

**Kullanim senaryolari:**
- PC degisikligi: eski PC'den backup al, yeni PC'ye yukle
- Takim calismasi: projeyi meslektasa ZIP ile gonder
- Guvenlik: duzeli aralklarla yedek alma
- Sablon paylasimi: ornek proje ZIP'i paylasma

---

## 6. ANA EKRANLAR

### EKRAN 1: DASHBOARD
```
+------------------------------------------------------------------+
|  [DEMART Logo]  PRO CREATIVE STUDIO  [Asset] [Tema] [Backup] [?] |
+------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+  |
|  |  KATALOGLAR      |  |  TEBRIK KARTLARI |  |  TAZIYE KARTLARI |  |
|  |  [sayi] adet     |  |  [sayi] adet     |  |  [sayi] adet     |  |
|  |  [+ Yeni Olustur]|  |  [+ Yeni Olustur]|  |  [+ Yeni Olustur]|  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
|  SON PROJELER                         [Ara...]  [Etiket v] [Yil v]|
|  +--------------------------------------------------------------+  |
|  | [Thumb] Sofis VPI Katalog  | 3 sayfa | 15 Sub | [Backup][>] |  |
|  | [Thumb] Rosemount DP Meter | 1 sayfa | 12 Sub | [Backup][>] |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  [Proje Yukle (Import ZIP)]                                       |
|                                                                    |
|  ASSET KUTUPHANESI (Hizli Erisim)                                 |
|  +--------------------------------------------------------------+  |
|  | Logolar (4) | Ikonlar SVG (6) | ArkaPlan (8) | Foto (12)    |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### EKRAN 3: EDITOR
```
+------------------------------------------------------------------+
| [<] Proje: Sofis VPI  | [Kaydet] [GeriAl] [Cevirmen] [Export]   |
+------------------------------------------------------------------+
| SAYFALAR |      CANVAS (Onizleme)          | OZELLIKLER          |
| +------+ | +------------------------------+| +------------------+|
| |S.1   | | |                              || | ICERIK           ||
| |[mini]| | |  AYNI HTML/CSS TEMPLATE      || | Baslik [___][Cv] ||
| |      | | |  ENGINE ILE RENDER           || | Aciklama [___]   ||
| +------+ | |                              || | Ozellikler [___] ||
| |S.2   | | |  Duzenleme overlay           || | Uygulamalar [___]||
| |[mini]| | |  (sadece editor'da gorunur)  || | Avantajlar [___] ||
| +------+ | |                              || |                  ||
| | [+]  | | |  [Safe Area] [Bleed]         || | GORSEL           ||
| +------+ | +------------------------------+| | [Yukle]          ||
|          | [%50] [%75] [%100] [Sigdir]     | | [Arka Plan Sil]  ||
|          |                                  | |                  ||
|          | LAYER PANELI                     | | EFEKTLER          ||
|          | +------------------------------+| | Opacity  [====]  ||
|          | | [goz][kilit] Baslik          || | Shadow   [====]  ||
|          | | [goz][kilit] Gorsel          || | Feather  [====]  ||
|          | | [goz][kilit] ArkaPlan        || | Blend [Normal v] ||
|          | | [goz][kilit] Logo SVG        || |                  ||
|          | | [goz][kilit] Footer          || | GRAIN OVERLAY     ||
|          | |       [Yukari] [Asagi]       || | [acik/kapali]    ||
|          | +------------------------------+| | Yogunluk [====]  ||
|          |                                  | |                  ||
|          | DURUM CUBUGU                     | | TEMA             ||
|          | [Internetsiz] [Local Mode]      | | [Demart Corp. v] ||
+------------------------------------------------------------------+
```

### EKRAN 4: EXPORT DIALOG
```
+--------------------------------------------------+
|              DISA AKTAR                           |
+--------------------------------------------------+
|  EXPORT MODU:                                     |
|  (*) Tekli Export    ( ) TOPLU EXPORT (Batch)     |
|                                                   |
|  FORMAT:  (*) PDF    ( ) PNG    ( ) JPG           |
|                                                   |
|  BOYUT:                                           |
|  (*) A4 Dikey          210x297mm                  |
|  ( ) A4 Yatay          297x210mm                  |
|  ( ) 1080x1080         Instagram Kare             |
|  ( ) 1080x1350         Instagram Story            |
|  ( ) 1200x628          LinkedIn/Facebook          |
|  ( ) 1920x1080         Sunum/Banner               |
|  ( ) Ozel Boyut: [___] x [___] (px/mm)           |
|                                                   |
|  KALITE:                                          |
|  (*) Yuksek Kalite  ~500KB-2MB (baski icin)       |
|  ( ) Web Optimize   ~80KB-400KB (dijital icin)    |
|  JPEG KALITE: [========90========] %90            |
|                                                   |
|  TOPLU EXPORT:                                    |
|  [x] PDF A4 Portrait                              |
|  [x] PNG 1080x1080                                |
|  [x] PNG 1080x1350                                |
|  [x] PNG 1200x628                                 |
|  Tahmini sure: ~15 sn | Tahmini boyut: ~3MB ZIP  |
|                                                   |
|  [Disa Aktar]                       [Iptal]       |
+--------------------------------------------------+
```

### EKRAN - BACKUP/RESTORE
```
+--------------------------------------------------+
|         PROJE YEDEKLEME / GERI YUKLEME            |
+--------------------------------------------------+
|                                                   |
|  YEDEKLE (Export):                                |
|  Proje: [Sofis VPI Katalog v]                    |
|  Icerik:                                         |
|  [x] Proje verileri (sayfalar, icerik, layerlar) |
|  [x] Tema ayarlari                               |
|  [x] Terminoloji sozlugu                         |
|  [x] Kullanilan asset'ler (goerseller, logolar)  |
|  Tahmini boyut: ~4.2 MB                          |
|  [ZIP Olarak Indir]                               |
|                                                   |
|  GERI YUKLE (Import):                             |
|  [ZIP Dosyasi Sec...]                             |
|  Import secenekleri:                              |
|  (*) Yeni proje olarak ekle                       |
|  ( ) Mevcut projenin ustune yaz                   |
|  [x] Tema ayarlarini da yukle                     |
|  [x] Sozlugu de yukle                             |
|  [x] Asset'leri de yukle                          |
|  [Yukle & Geri Yukle]                             |
+--------------------------------------------------+
```

---

## 7. 10 SABLON

| # | Sablon | Layout | Kullanim | Referans |
|---|--------|--------|----------|----------|
| 1 | Industrial Product Alert | Diagonal clip-path, endustriyel foto+urun+CTA | Urun duyurusu | Rosemount |
| 2 | Event Poster | Gradient BG, baslik, tarih/konum, sponsor logolari | Etkinlik | ENOSAD |
| 3 | Minimal Premium | %70 beyaz, buyuk tipografi, tek gorsel | Premium urun | - |
| 4 | Tech Data Sheet | Tablo grid, ozellikler, urun gorseli | Teknik dokuman | Netherlocks |
| 5 | Photo Dominant | Tam ekran gorsel, seffaf overlay, baslik | Sosyal medya | - |
| 6 | Geometric Corporate | Serit/blok bolumler, kurumsal renkler | Kurumsal | - |
| 7 | Dark Tech | Koyu zemin, neon vurgu, glow efekti | Ileri teknoloji | - |
| 8 | Clean Industrial Grid | Ikon+fayda grid, ortada urun | Fayda ozeti | - |
| 9 | Tebrik Karti | Festif BG, dekoratif cerceve, logo+imza | Kutlama | - |
| 10 | Taziye Karti | Koyu tonlar, ince bordur, saygin tipografi | Taziye | - |

---

## 8. PDF KALITE

**YASAK:** html-to-image + jsPDF (screenshot bazli)

**ZORUNLU:** Playwright Print-to-PDF
- printBackground: true
- preferCSSPageSize: true
- Fontlar: server'da bundle'li, PDF'de gomulu
- LOCAL calisir (internet gerekmez)

---

## 9. TEKNIK MIMARI (LOCAL-FIRST)

```
KULLANICI PC (Docker Compose)
+----------------------------------------------------------+
|                                                          |
|  +-------------------+    +-------------------+          |
|  |   Frontend        |    |   Backend         |          |
|  |   React :3000     |--->|   FastAPI :8001    |          |
|  |   (Tarayici)      |    |                   |          |
|  +-------------------+    +---+---+---+---+---+          |
|                               |   |   |   |              |
|                          +----+   |   |   +----+         |
|                          |        |   |        |         |
|                     MongoDB  Playwright rembg  Pillow     |
|                     :27017   (local)   (local) (local)   |
|                          |                               |
|                     mongo_data                            |
|                     (volume)                              |
+----------------------------------------------------------+
                               |
                    (SADECE CEVIRMEN ICIN)
                               |
                         Internet
                         LLM API
```

---

## 10. PERFORMANS HEDEFLERI

| Islem | Hedef Sure |
|-------|-----------|
| Tekli PDF export | < 5 sn |
| Tekli PNG export | < 3 sn |
| Tekli JPG export | < 2 sn |
| Batch export (6 preset) | < 20 sn |
| BG removal (ilk kez) | < 30 sn |
| BG removal (cache) | < 1 sn |
| Gorsel resize | < 2 sn |

| Format | Yuksek Kalite | Web Optimize |
|--------|--------------|--------------|
| PDF A4 tek sayfa | 500KB-2MB | 200KB-500KB |
| PNG 1080x1080 | 800KB-2MB | 200KB-400KB |
| JPG 1080x1080 | 300KB-800KB | 80KB-200KB |

---

## 11. TAM OZELLIK LISTESI

| # | Ozellik | P |
|---|---------|---|
| 1 | 10 farkli sablon | P0 |
| 2 | Playwright PDF (metin secilebilir, font gomulu, LOCAL) | P0 |
| 3 | PNG/JPG export (6 preset + ozel boyut) | P0 |
| 4 | Editor: AYNI HTML/CSS pipeline (preview=export 1:1) | P0 |
| 5 | Layer yonetimi (siralama + kilitleme + gorunurluk) | P0 |
| 6 | Efektler: feather + grain + blend + shadow (preview=export ayni) | P0 |
| 7 | Background removal (queue + progress + cache, LOCAL) | P0 |
| 8 | JPEG/PNG resize (Lanczos + sharpen + EXIF) | P0 |
| 9 | Cevirmen (4 ton + sozluk + lock + case sensitive) | P0 |
| 10 | Tebrik karti modulu + hazir metinler | P0 |
| 11 | Taziye karti modulu + hazir metinler | P0 |
| 12 | Merkezi asset library (PNG + JPG + SVG) | P0 |
| 13 | Brand/Theme sistemi (renk + font seti) | P0 |
| 14 | Batch export (ZIP + isimlendirme standardi) | P0 |
| 15 | Font bundle (server-side, PDF gomulu, internetsiz) | P0 |
| 16 | SVG ikon destegi (vektor) | P0 |
| 17 | Safe area / bleed overlay | P0 |
| 18 | Web Optimize / High Quality export secenekleri | P0 |
| 19 | Proje kaydet/ac | P0 |
| 20 | Project backup/restore (JSON/ZIP export & import) | P0 |
| 21 | Export gecmisi + versioning | P1 |
| 22 | Snap-to-grid hizalama | P1 |
| 23 | Local-first mimari (internetsiz PDF/PNG/JPG) | P0 |
| 24 | Export performans hedefleri (PDF<5sn, PNG<3sn) | P0 |
| 25 | Dosya boyutu optimizasyonu (Web vs High Quality) | P0 |

---

## 12. TEKNIK GARANTILER

1. Editor preview ve export AYNI HTML/CSS render pipeline (1:1)
2. Tum efektler preview ve export'ta BIREBIR ayni
3. BG removal: queue + progress + cache
4. Fontlar server bundle, PDF gomulu, internetsiz
5. SVG vektor destegi
6. LOCAL-FIRST: internet olmadan PDF/PNG/JPG export
7. Project backup/restore: proje+tema+sozluk+asset ZIP

---

## 13. HARIC (Scope Disi)

- Windows EXE / Electron
- Offline ceviri (LLM API gerektirir)
- Video export
- Photoshop seviyesi pixel-perfect kompozisyon

---

## 14. SONRAKI ADIM

Bu rapor onaylandiginda kodlamaya baslanacak.
