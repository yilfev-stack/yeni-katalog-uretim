# PRO CREATIVE STUDIO - FINAL ON RAPOR v2 (GUNCEL)
## Web Uygulamasi - Sofis Urunleri Icin Profesyonel Marketing Studio
## Tarih: Subat 2026

---

## 1. GENEL BAKIS

**Amac:** Sofis urunleri icin profesyonel kalitede one-page reklam, katalog ve kart (tebrik/taziye) ureten; PDF + PNG + JPG cikti veren; gorsel arka plan silen; ceviri yapan; tasarimciya bagimliligi bitiren bir web uygulamasi.

**Teknoloji:** React (Frontend) + FastAPI (Backend) + MongoDB (Veritabani) + Playwright (PDF/PNG export)

**Erisim:** Tarayici uzerinden (Chrome/Edge/Firefox)

---

## 2. ONAYLANAN 6 MADDE (Tamamı Kapsamda)

### Madde 1: Layer Yonetimi (Ust/Alt Siralama + Kilitleme)
- Editor'da her eleman (metin, gorsel, logo, ikon) ayri bir layer
- Layer panelinde liste halinde gorunur
- Surukleme ile layer sirasi degistirilebilir (ust/alt)
- Her layer icin kilit butonu: kilitli layer tasinamaz, boyutlandirilamaz, silinemez
- Her layer icin gorunurluk toggle'i (goz ikonu)
- Secili layer vurgulanir (highlight)

### Madde 2: Edge Feathering + Grain/Kompozit Destegi
- Urun gorseli eklendiginde "yapistirilmis" gorunmemesi icin:
  - **Edge Feathering:** LAYER BAZLI - her gorsel layer'a ayri feather
  - **Hafif Grain/Noise Overlay:** GLOBAL - tek overlay layer olarak tum tasarima uygulanir
  - **Soft Shadow:** LAYER BAZLI - her layer'a ayri shadow
  - **Blend Mode secenekleri:** LAYER BAZLI - Normal, Multiply, Screen, Overlay
- **KRITIK:** Tum efektler (feather, grain, blend, shadow) preview ve export'ta BIREBIR ayni render edilecek

### Madde 3: JPEG/PNG Resize Yuksek Kalite
- Server-side Pillow ile Lanczos algoritmasi
- JPEG kalite ayari: 80-100 arasi secim
- EXIF orientation otomatik duzeltme
- Istege bagli hafif sharpen (netlik artirma)
- Kabul testi: 3000px --> 1200px kucultmede bariz camurlasma olmayacak
- PNG seffaf arka plan destegi korunacak

### Madde 4: Merkezi Asset Library (Projeler Arasi)
- Tum projelerde ortak kullanilan asset havuzu
- Kategoriler: Logolar, Ikonlar (SVG dahil), Arka Planlar, Urun Fotolari
- Asset yukleme (PNG, JPG, SVG destegi), silme, etiketleme
- Asset arama ve filtreleme
- Herhangi bir projeden asset library'ye erisim
- Asset'i dogrudan canvas'a surukle-birak

### Madde 5: Brand/Theme (Renk + Font Seti) Destegi
- Sirket bazli tema tanimlama (renk paleti + font seti)
- Hazir tema presetleri (Demart Corporate, Dark Tech, Minimal vb.)
- Ozel tema olusturma ve kaydetme
- Tema degistirdiginde tum sablon otomatik guncellenir

### Madde 6: Batch Export (Tek Tikla Coklu Preset Boyut)
- Toplu export: tek seferde birden fazla boyut ve format
- Tumu ZIP dosyasi olarak indirilir
- ZIP icinde dosya isimlendirme standardi: ProjeAdi_Tarih_Template_Boyut.format
  - Ornek: SOFIS_VPI_20260215_IndustrialAlert_1080x1080.png

---

## 3. KRITIK TEKNIK TUZAKLAR VE COZUMLERI

### TUZAK 1: Editor Preview = Export Birebir Ayni (WYSIWYG 1:1 Garanti)

**Risk:** Editor'da DOM/canvas ile preview, export'ta Playwright ile HTML render - ikisi farkli olabilir.

**COZUM (KESIN SART):**
- Editor preview ve export AYNI HTML/CSS template engine uzerinden render edilecek
- Editor = Template Renderer (HTML/CSS) + Draggable Overlay (duzenleme katmani)
- Preview: React icinde ayni HTML/CSS sablonu render eder
- Export: Ayni HTML/CSS sablonu Playwright'a gonderilir, Playwright render eder
- Duzenleme elemanlari (tutamaclar, cerceveler, grid cizgileri) export sirasinda otomatik gizlenir
- **Teknik garanti:** "Editor preview and exports use the SAME HTML/CSS render pipeline to guarantee 1:1 output consistency."

### TUZAK 2: Feather/Grain/Blend Efektleri Preview = Export Ayni

**Risk:** CSS efektleri tarayicida farkli, Playwright'ta farkli gorunebilir.

**COZUM (KESIN SART):**
- Tum gorsel efektler SADECE CSS ile uygulanir (Playwright ayni Chromium engine'i kullanir)
- Feather: `mask-image: radial-gradient(...)` veya `filter: blur()` ile kenar yumusatma - LAYER BAZLI
- Grain: `background-image` ile noise texture overlay - GLOBAL (tek layer, tum tasarimin ustunde)
- Blend: `mix-blend-mode` CSS property - LAYER BAZLI
- Shadow: `filter: drop-shadow()` veya `box-shadow` - LAYER BAZLI
- Export oncesi TUM efektler ayni DOM uzerinden render edilir
- **Teknik garanti:** "All visual effects (feather, grain, blend modes, shadows) render identically in both preview and exported outputs because both use the same Chromium CSS engine."

### TUZAK 3: Background Removal Performans ve Kaynak Yonetimi

**Risk:** rembg/U2Net CPU agir, yavash, tekrar tekrar ayni gorsel icin calisabilir.

**COZUM (KESIN SART):**
- BG removal islemi **job/queue** ile calisir
- Islem sirasinda **progress status** doner (frontend'de "isleniyor..." gosterimi)
- Sonuc **cache'lenir** (asset hash bazli): ayni gorsel tekrar yuklendignde cache'den donulur
- Timeout siniri: max 60 saniye, asarsa hata mesaji
- **Teknik garanti:** "Background removal runs as a queued job with progress status and cached results per asset hash."

---

## 4. DEGERLI 5 EK MADDE (Proje Kalitesini Yukselten)

### EK A: Font Yonetimi - Server Bundle + PDF Gomulu (KRITIK)
- Fontlar server'da paketli olacak (Google Fonts'a runtime bagimliligi yok)
- CSS'de `@font-face` ile local dosyadan yukleme
- Playwright render sirasinda fontlar %100 mevcut
- PDF'de fontlar gomulu (embedded) olacak
- Font fallback listeleri tanimli (birincil font yoksa ikincil devreye girer)
- **Garanti:** "Fonts are bundled and embedded for reliable PDF rendering; no dependency on client-installed or CDN-served fonts at export time."

### EK B: Safe Area / Bleed (A4 Baski Icin)
- Editor'da "safe margin" overlay gosterimi (toggle ile acilip kapanir)
- Icerik bu alanin icinde kalmali uyarisi
- A4 baski icin 5mm safe margin cizgisi
- Bleed opsiyonel: 3mm tasma alani (baski evi icin)
- Safe area cizgileri export'a dahil edilmez (sadece editor rehberi)

### EK C: Versioning / Export Gecmisi (Net Teknik Tanimlama)
- Her export islemi bir "version" kaydi olusturur (MongoDB'de)
- Kayit icerigi: tarih, format, boyut, kalite ayari, dosya adi
- Dashboard'da proje bazli export gecmisi listesi
- ZIP icinde dosya isimlendirme standardi:
  ```
  {ProjeAdi}_{Tarih}_{SablonAdi}_{Boyut}.{format}
  Ornek: SOFIS_VPI_20260215_IndustrialAlert_1080x1080.png
  Ornek: SOFIS_VPI_20260215_TechDataSheet_A4Portrait.pdf
  ```

### EK D: SVG Ikon / Vektor Destegi (KRITIK)
- Asset library'ye SVG dosya yukleme destegi
- SVG ikonlar canvas'ta vektor olarak render edilir (buyutmede bozulmaz)
- PDF export'ta SVG vektor olarak kalir (camurlasma olmaz)
- PNG export'ta yuksek cozunurlukle rasterize edilir
- Hazir ikon seti: endustriyel ikonlar (vana, boru, sensor, pompa vb.)

### EK E: Terminoloji Sozlugu - Lock Ozelligi
- Glossary'de her terim icin "lock" (kilit) secenegi
- Kilitli terimler ceviri sirasinda ASLA degistirilmez (exact match protect)
- Case sensitive opsiyonu: "VPI" sadece buyuk harfle korunur
- Case insensitive: "easidrive" ve "EasiDrive" ayni sekilde korunur
- Varsayilan kilitli terimler: EasiDrive, VPI, Netherlocks, Sofis, Demart
- Kullanici yeni terim ekleyip kilitleyebilir

---

## 5. ANA EKRANLAR VE ARAYUZ

### EKRAN 1: DASHBOARD (Ana Sayfa)
```
+------------------------------------------------------------------+
|  [DEMART Logo]  PRO CREATIVE STUDIO  [Asset Lib] [Tema] [Ayarlar]|
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  |  KATALOGLAR      |  |  TEBRIK KARTLARI |  |  TAZIYE KARTLARI |  |
|  |  [sayi] adet     |  |  [sayi] adet     |  |  [sayi] adet     |  |
|  |  [+ Yeni Olustur]|  |  [+ Yeni Olustur]|  |  [+ Yeni Olustur]|  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
|  SON PROJELER                         [Ara...]  [Etiket v] [Yil v]|
|  +--------------------------------------------------------------+  |
|  | [Thumb] Sofis VPI Katalog    | 3 sayfa | 15 Sub 2026 | [>]  |  |
|  | [Thumb] Rosemount DP Meter   | 1 sayfa | 12 Sub 2026 | [>]  |  |
|  | [Thumb] Yilbasi Tebrik       | 1 kart  | 01 Oca 2026 | [>]  |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  ASSET KUTUPHANESI (Hizli Erisim)                                 |
|  +--------------------------------------------------------------+  |
|  | Logolar (4)  | Ikonlar SVG (6) | Arka Plan (8) | Foto (12)  |  |
|  | [thumb] [thumb] [thumb] [thumb] [thumb] [thumb]...  [+ Ekle] |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

---

### EKRAN 2: SABLON SECIM EKRANI
```
+------------------------------------------------------------------+
|  [<] Geri    Sablon Secin              [Tema: Demart Corporate v] |
+------------------------------------------------------------------+
|  KATEGORI:                                                         |
|  [Tumunu Goster] [Urun Tanitim] [Etkinlik] [Teknik] [Kart]      |
|                                                                    |
|  +-------------+  +-------------+  +-------------+                |
|  | Industrial  |  | Event       |  | Minimal     |                |
|  | Product     |  | Poster      |  | Premium     |                |
|  | Alert       |  | (ENOSAD)    |  |             |                |
|  | [Sec]       |  | [Sec]       |  | [Sec]       |                |
|  +-------------+  +-------------+  +-------------+                |
|  +-------------+  +-------------+  +-------------+                |
|  | Tech Data   |  | Photo       |  | Geometric   |                |
|  | Sheet       |  | Dominant    |  | Corporate   |                |
|  | [Sec]       |  | [Sec]       |  | [Sec]       |                |
|  +-------------+  +-------------+  +-------------+                |
|  +-------------+  +-------------+  +-------------+  +-------------+|
|  | Dark Tech   |  | Clean Grid  |  | Tebrik Karti|  | Taziye Karti||
|  | [Sec]       |  | [Sec]       |  | [Sec]       |  | [Sec]       ||
|  +-------------+  +-------------+  +-------------+  +-------------+|
+------------------------------------------------------------------+
```

---

### EKRAN 3: EDITOR (Ana Calisma Alani) — GUNCEL
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
| |S.2   | | |  Duzenleme elemanlari        || | Uygulamalar [___]||
| |[mini]| | |  (tutamac, cerceve)          || | Avantajlar [___] ||
| |      | | |  sadece overlay katmani      || |                  ||
| +------+ | |                              || | GORSEL           ||
| |      | | |  [Safe Area cizgileri]       || | [Yukle]          ||
| | [+]  | | |  [Bleed gosterimi]          || | [Arka Plan Sil]  ||
| |Ekle  | | |                              || | Fit: [Cover v]   ||
| +------+ | +------------------------------+| |                  ||
|          | [%50] [%75] [%100] [Sigdir]     | | EFEKTLER          ||
|          |                                  | | Opacity  [====]  ||
|          | LAYER PANELI                     | | Shadow   [====]  ||
|          | +------------------------------+| | Feather  [====]  ||
|          | | [goz][kilit] Baslik Metni    || | Blend [Normal v] ||
|          | | [goz][kilit] Urun Gorseli    || |                  ||
|          | | [goz][kilit] Arka Plan       || | GRAIN OVERLAY     ||
|          | | [goz][kilit] Logo (SVG)      || | [acik/kapali]    ||
|          | | [goz][kilit] Ikon (SVG)      || | Yogunluk [====]  ||
|          | | [goz][kilit] Footer          || |                  ||
|          | |        [Yukari] [Asagi]      || | TEMA             ||
|          | +------------------------------+| | [Demart Corp. v] ||
|          |                                  | +------------------+|
+------------------------------------------------------------------+
```

**KRITIK MIMARI NOTU:**
- Canvas preview = HTML/CSS Template Engine + Draggable Overlay
- Export = AYNI HTML/CSS Template Engine + Playwright render
- Duzenleme elemanlari (tutamac, cerceve, grid) export'a dahil EDILMEZ
- Preview'de gorunen = export'ta cikan (1:1 garanti)

---

### EKRAN 4: DISA AKTARMA (Export Dialog) — GUNCEL
```
+--------------------------------------------------+
|              DISA AKTAR                           |
+--------------------------------------------------+
|  EXPORT MODU:                                     |
|  (*) Tekli Export    ( ) TOPLU EXPORT (Batch)     |
|                                                   |
|  ---- TEKLI EXPORT ----                           |
|  FORMAT:  (*) PDF    ( ) PNG    ( ) JPG           |
|                                                   |
|  BOYUT:                                           |
|  (*) A4 Dikey (Portrait)         210x297mm        |
|  ( ) A4 Yatay (Landscape)        297x210mm        |
|  ( ) 1080x1080  Instagram Kare                    |
|  ( ) 1080x1350  Instagram Story                   |
|  ( ) 1200x628   LinkedIn / Facebook               |
|  ( ) 1920x1080  Sunum / Banner                    |
|  ( ) Ozel Boyut: [___] x [___] (px veya mm)      |
|                                                   |
|  KALITE:                                          |
|  (*) Yuksek Kalite (baski icin)                   |
|  ( ) Web Optimize (kucuk dosya)                   |
|  JPEG KALITE: [========90========] %90            |
|                                                   |
|  ---- TOPLU EXPORT (Batch) ----                   |
|  [x] PDF A4 Portrait                              |
|  [x] PNG 1080x1080                                |
|  [x] PNG 1080x1350                                |
|  [x] PNG 1200x628                                 |
|  [ ] PNG 1920x1080                                |
|  [ ] JPG Web Optimize                             |
|  Cikti: ZIP (dosya adi standardi uygulanir)       |
|                                                   |
|  [Disa Aktar]                       [Iptal]       |
+--------------------------------------------------+
```

---

### EKRAN 5: CEVIRMEN PANELI — GUNCEL (Glossary Lock Dahil)
```
+------------------------------------------+
|         CEVIRMEN                     [X]  |
+------------------------------------------+
|  KAYNAK: [English v] --> HEDEF: [Turkce v]|
|                                          |
|  TON:                                    |
|  (*) Kurumsal  ( ) Teknik                |
|  ( ) Pazarlama ( ) Kisa                  |
|                                          |
|  TERMINOLOJI SOZLUGU:                    |
|  +--------------------------------------+|
|  | Terim       | Korunan   | Kilit | CS ||
|  |-------------|-----------|-------|----||
|  | EasiDrive   | EasiDrive | [X]   | [X]||
|  | VPI         | VPI       | [X]   | [X]||
|  | gate vana   | gate vana | [X]   | [ ]||
|  | Netherlocks | Netherlocks| [X]  | [X]||
|  | ball valve  | kuresel vana| [ ] | [ ]||
|  +--------------------------------------+|
|  [X] = Kilitli (asla degismez)          |
|  CS = Case Sensitive                     |
|  [+ Yeni Terim Ekle]                    |
|                                          |
|  KAYNAK METIN:                           |
|  +--------------------------------------+|
|  | The VPI is a mechanical valve        ||
|  | position indicator designed for...   ||
|  +--------------------------------------+|
|                                          |
|  CEVIRI SONUCU:                          |
|  +--------------------------------------+|
|  | VPI, endustriyel vanalarin konum     ||
|  | gostergesi olarak tasarlanmis        ||
|  | mekanik bir cihazdır...              ||
|  +--------------------------------------+|
|                                          |
|  [Cevir]  [Secili Alana Yapistir]       |
+------------------------------------------+
```

---

### EKRAN 6: ARKA PLAN KALDIRMA — GUNCEL (Queue + Cache)
```
+--------------------------------------------------+
|         ARKA PLAN KALDIRMA                        |
+--------------------------------------------------+
|  +--------------------+  +--------------------+   |
|  |    ORIJINAL        |  |    SONUC           |   |
|  | [Urun fotografi]   |  | [Seffaf urun]     |   |
|  +--------------------+  +--------------------+   |
|                                                   |
|  DURUM: [====  %75  ====] Isleniyor...           |
|  (Onbellekten: Bu gorsel daha once islendi [X])  |
|                                                   |
|  KENAR IYILESTIRME:                               |
|  Edge Feathering:  [========50%=======]           |
|                                                   |
|  GOLGE EKLEME:                                    |
|  [x] Yumusak golge ekle                          |
|  Golge Yogunlugu: [========40%=======]            |
|  Golge Yayilimi:  [========20px======]            |
|                                                   |
|  [Arka Plani Kaldir]     [Uygula & Kapat]        |
+--------------------------------------------------+
```

**TEKNIK NOTU:**
- BG removal job/queue ile calisir, progress bar gosterir
- Sonuc asset hash bazli cache'lenir
- Ayni gorsel tekrar yuklendignde cache'den aninda doner
- Timeout: max 60 saniye

---

### EKRAN 7: ASSET LIBRARY — GUNCEL (SVG Destegi)
```
+------------------------------------------------------------------+
|  ASSET KUTUPHANESI                                          [X]   |
+------------------------------------------------------------------+
|  KATEGORILER:  [Tumunu Goster] [Logolar] [Ikonlar SVG]           |
|                [Arka Planlar] [Urun Fotolari]                     |
|  [Ara...]                              [+ Yeni Asset Yukle]       |
|  Desteklenen formatlar: PNG, JPG, SVG                             |
|                                                                    |
|  +----------+  +----------+  +----------+  +----------+           |
|  | [Logo]   |  | [SVG]    |  | [SVG]    |  | [Foto]   |          |
|  | DEMART   |  | Vana     |  | Sensor   |  | VPI-A    |          |
|  | logo.png |  | ikon.svg |  | ikon.svg |  | foto.jpg |          |
|  | 45KB     |  | 4KB      |  | 3KB      |  | 1.2MB    |          |
|  | [Kullan] |  | [Kullan] |  | [Kullan] |  | [Kullan] |          |
|  +----------+  +----------+  +----------+  +----------+           |
+------------------------------------------------------------------+
```

---

### EKRAN 8: BRAND/THEME AYARLARI
```
+--------------------------------------------------+
|         TEMA / BRAND AYARLARI               [X]   |
+--------------------------------------------------+
|  HAZIR TEMALAR:                                   |
|  +------------+ +------------+ +------------+     |
|  | Demart     | | Dark Tech  | | Minimal    |     |
|  | Corporate  | |            | | Premium    |     |
|  | [Sec]      | | [Sec]      | | [Sec]      |     |
|  +------------+ +------------+ +------------+     |
|                                                   |
|  RENK PALETI:                                     |
|  Birincil:   [#004aad]   Ikincil:  [#003c8f]    |
|  Vurgu:      [#f59e0b]   ArkaPlan: [#f8fafc]    |
|  Metin:      [#0f172a]                            |
|                                                   |
|  FONT SETI: (Server'da bundle'li)                |
|  Baslik:  [Montserrat v]                         |
|  Govde:   [Open Sans v]                          |
|  Vurgu:   [Roboto Condensed v]                   |
|                                                   |
|  [Tema Kaydet]  [Sifirla]  [Yeni Tema Olustur]  |
+--------------------------------------------------+
```

---

## 6. 10 SABLON DETAYLARI

| # | Sablon Adi | Layout | Hedef | Referans |
|---|-----------|--------|-------|----------|
| 1 | Industrial Product Alert | Diagonal clip-path: sol endustriyel foto, sag urun+baslik, alt CTA | Yeni urun duyurusu | Rosemount |
| 2 | Event Poster | Tam gradient BG, buyuk baslik, tarih/konum ikonlari, sponsor logolari | Etkinlik/fuar | ENOSAD |
| 3 | Minimal Premium | %70 beyaz alan, buyuk tipografi, ince cizgi, tek gorsel | Premium urun | - |
| 4 | Tech Data Sheet | Logo+baslik, ozellik tablosu grid, urun gorseli, teknik notlar | Teknik dokuman | Netherlocks VPI |
| 5 | Photo Dominant | Tam ekran HD gorsel, seffaf koyu overlay, beyaz baslik | Sosyal medya | - |
| 6 | Geometric Corporate | Yatay serit/blok bolumler, her blokta farkli icerik | Kurumsal sunum | - |
| 7 | Dark Tech | Koyu zemin, neon vurgu cizgiler, parlak baslik, glow efekti | Ileri teknoloji | - |
| 8 | Clean Industrial Grid | 2x3/3x3 grid, ikon+fayda metni, ortada urun | Fayda ozeti | - |
| 9 | Tebrik Karti | Festif BG, dekoratif cerceve, baslik+mesaj, logo+imza | Kutlama | - |
| 10 | Taziye Karti | Sade koyu tonlar, ince bordur, saygin tipografi, logo+imza | Taziye | - |

---

## 7. PDF KALITE GARANTISI

**YASAK YONTEM (Kullanilmayacak):**
- html-to-image + jsPDF (screenshot bazli, kalitesiz)

**ZORUNLU YONTEM (Playwright Print-to-PDF):**
```
Ayni HTML/CSS Template --> Playwright Chromium --> page.pdf()
                                |
                     printBackground: true
                     preferCSSPageSize: true
                     @media print CSS
                     Fontlar: server'da bundle'li
                                |
                           SONUC:
                     - Metin secilebilir (vektor)
                     - Font %100 gomulu
                     - TR karakter sorunsuz
                     - SVG ikonlar vektor
                     - Layout 1:1 preview ile ayni
                     - 300 DPI baski kalitesi
```

---

## 8. TEKNIK MIMARI

```
+-------------------+         +-------------------+
|   TARAYICI        |         |   SUNUCU          |
|   (React App)     |  HTTP   |   (FastAPI)       |
|                   | ------> |                   |
|  AYNI HTML/CSS    |         |  AYNI HTML/CSS    |
|  TEMPLATE ENGINE  |         |  TEMPLATE ENGINE  |
|  (Preview)        |         |  (Export)         |
|  + Draggable      |         |  + Playwright     |
|    Overlay        |         |    Render         |
+-------------------+         +-------------------+
                                      |
                    +---------+-------+---------+
                    |         |       |         |
                MongoDB  Playwright  rembg    Pillow
                (veri)   (PDF/PNG)  (BG sil) (resize)
                    |
              Bundle Fonts
              (server-side)
```

---

## 9. TAM OZELLIK LISTESI

| # | Ozellik | Oncelik | Durum |
|---|---------|---------|-------|
| 1 | 10 farkli sablon | P0 | Yapilacak |
| 2 | Playwright PDF export (metin secilebilir, font gomulu) | P0 | Yapilacak |
| 3 | PNG/JPG export (6 preset + ozel boyut) | P0 | Yapilacak |
| 4 | Editor: AYNI HTML/CSS pipeline (preview=export 1:1) | P0 | Yapilacak |
| 5 | Layer yonetimi (siralama + kilitleme + gorunurluk) | P0 | Yapilacak |
| 6 | Efektler: feather (layer bazli) + grain (global) + blend + shadow | P0 | Yapilacak |
| 7 | Efektler preview=export birebir ayni | P0 | Yapilacak |
| 8 | Background removal (queue + progress + cache) | P0 | Yapilacak |
| 9 | JPEG/PNG resize (Lanczos + sharpen + EXIF) | P0 | Yapilacak |
| 10 | Cevirmen (4 ton + terminoloji sozlugu + lock + case sensitive) | P0 | Yapilacak |
| 11 | Tebrik karti modulu + hazir metinler | P0 | Yapilacak |
| 12 | Taziye karti modulu + hazir metinler | P0 | Yapilacak |
| 13 | Merkezi asset library (PNG + JPG + SVG) | P0 | Yapilacak |
| 14 | Brand/Theme sistemi (renk paleti + font seti) | P0 | Yapilacak |
| 15 | Batch export (ZIP + isimlendirme standardi) | P0 | Yapilacak |
| 16 | Font bundle (server-side, PDF'de gomulu) | P0 | Yapilacak |
| 17 | SVG ikon destegi (vektor, buyutmede bozulmaz) | P0 | Yapilacak |
| 18 | Safe area / bleed overlay (editor rehberi) | P0 | Yapilacak |
| 19 | Versioning / export gecmisi | P1 | Yapilacak |
| 20 | Snap-to-grid hizalama | P1 | Yapilacak |
| 21 | Web/High Quality export secenekleri | P0 | Yapilacak |
| 22 | Proje kaydet/ac | P0 | Yapilacak |

---

## 10. TEKNIK GARANTILER OZETI

1. **Editor preview ve export AYNI HTML/CSS render pipeline kullanir** (WYSIWYG 1:1 garanti)
2. **Tum gorsel efektler (feather, grain, blend, shadow) preview ve export'ta BIREBIR ayni render edilir**
3. **Background removal job/queue + progress + cache** (ayni asset tekrar calismaz)
4. **Fontlar server'da bundle'li, PDF'de %100 gomulu/fallback'li**
5. **SVG ikon destegi** (vektor kalite, buyutmede bozulmaz)

---

## 11. HARIC OLAN (Scope Disi)

- Windows EXE
- Electron paketleme
- Offline calisma
- Video export

---

## 12. SONRAKI ADIM

Bu rapor onaylandiginda kodlamaya baslanacak.
