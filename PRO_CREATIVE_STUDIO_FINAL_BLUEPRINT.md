# PRO CREATIVE STUDIO - FINAL ON RAPOR
## Web Uygulamasi - Sofis Urunleri Icin Profesyonel Marketing Studio
## Tarih: Subat 2026

---

## 1. GENEL BAKIS

**Amac:** Sofis urunleri icin profesyonel kalitede one-page reklam, katalog ve kart (tebrik/taziye) ureten; PDF + PNG + JPG cikti veren; gorsel arka plan silen; ceviri yapan; tasarimciya bagimliligi bitiren bir web uygulamasi.

**Teknoloji:** React (Frontend) + FastAPI (Backend) + MongoDB (Veritabani) + Playwright (PDF/PNG export)

**Erisim:** Tarayici uzerinden (Chrome/Edge/Firefox)

---

## 2. ONAYLANAN 6 EK MADDE (Tamamı Kapsamda)

### Madde 1: Layer Yonetimi (Ust/Alt Siralama + Kilitleme)
- Editor'da her eleman (metin, gorsel, logo, ikon) ayri bir layer
- Layer panelinde liste halinde gorunur
- Surukleme ile layer sirasi degistirilebilir (ust/alt)
- Her layer icin kilit butonu: kilitli layer tasinamaz, boyutlandirilamaz, silinemez
- Her layer icin gorunurluk toggle'i (goz ikonu)
- Secili layer vurgulanir (highlight)

### Madde 2: Edge Feathering + Grain/Kompozit Destegi
- Urun gorseli eklendiginde "yapistirilmis" gorunmemesi icin:
  - **Edge Feathering:** Gorsel kenarlarinda yumusak gecis (CSS feather + server-side processing)
  - **Hafif Grain/Noise Overlay:** Tum tasarima ince bir doku ekleyerek parcalari birlestirme
  - **Soft Shadow:** Urun gorseline dogal golge ekleme
  - **Blend Mode secenekleri:** Normal, Multiply, Screen, Overlay
- Sonuc: Tum elemanlar tek bir is gibi gorunecek, "sonradan yapistirmis" hissi olmayacak

### Madde 3: JPEG/PNG Resize Yuksek Kalite
- Server-side Pillow ile Lanczos algoritması
- JPEG kalite ayari: 80-100 arasi secim
- EXIF orientation otomatik duzeltme
- Istege bagli hafif sharpen (netlik artirma)
- Kabul testi: 3000px --> 1200px kucultmede bariz camurlaşma olmayacak
- PNG seffaf arka plan destegi korunacak

### Madde 4: Merkezi Asset Library (Projeler Arasi)
- Tum projelerde ortak kullanilan asset havuzu
- Kategoriler: Logolar, Ikonlar, Arka Planlar, Urun Fotolari
- Asset yukleme, silme, etiketleme
- Asset arama ve filtreleme
- Herhangi bir projeden asset library'ye erisim
- Asset'i dogrudan canvas'a surukle-birak

### Madde 5: Brand/Theme (Renk + Font Seti) Destegi
- Sirket bazli tema tanimlama:
  - Birincil renk (ornegin #004aad - Demart cobalt blue)
  - Ikincil renk
  - Vurgu rengi
  - Arka plan rengi
  - Metin rengi
- Font seti tanimlama:
  - Baslik fontu
  - Govde fontu
  - Vurgu fontu
- Hazir tema presetleri (Demart Corporate, Dark Tech, Minimal vb.)
- Ozel tema olusturma ve kaydetme
- Tema degistirdiginde tum sablon otomatik guncellenir

### Madde 6: Batch Export (Tek Tikla Coklu Preset Boyut)
- "Toplu Disa Aktar" butonu ile tek seferde:
  - PDF A4 Portrait
  - PDF A4 Landscape
  - PNG 1080x1080 (Instagram Kare)
  - PNG 1080x1350 (Instagram Story)
  - PNG 1200x628 (LinkedIn/Facebook)
  - PNG 1920x1080 (Sunum/Banner)
- Tumu ZIP dosyasi olarak indirilir
- Her preset icin Web Optimize / High Quality secimi
- Ozel boyut ekleme imkani

---

## 3. ANA EKRANLAR VE ARAYUZ

### EKRAN 1: DASHBOARD (Ana Sayfa)
```
+------------------------------------------------------------------+
|  [DEMART Logo]  PRO CREATIVE STUDIO  [Asset Library] [Tema] [Ayar]|
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
|  | Logolar (4)  | Arka Planlar (8) | Urun Foto (12) | [+ Ekle] |  |
|  | [thumb] [thumb] [thumb] [thumb] [thumb] [thumb]...           |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

**Dashboard Ozellikleri:**
- Proje kartlari (katalog, tebrik, taziye) - sayi gosterimi
- Arama ve filtreleme (etiket, tarih, urun adi)
- Son projelere hizli erisim
- Asset kutuphanesi hizli erisim paneli
- Proje kopyalama, silme
- Export gecmisi goruntuleme
- Tema/brand ayarlarina erisim

---

### EKRAN 2: SABLON SECIM EKRANI
```
+------------------------------------------------------------------+
|  [<] Geri    Sablon Secin              [Tema: Demart Corporate v] |
+------------------------------------------------------------------+
|                                                                    |
|  KATEGORI:                                                         |
|  [Tumunu Goster] [Urun Tanitim] [Etkinlik] [Teknik] [Kart]      |
|                                                                    |
|  +-------------+  +-------------+  +-------------+                |
|  | +---------+ |  | +---------+ |  | +---------+ |                |
|  | |/////////| |  | |ENOSAD   | |  | |         | |                |
|  | |/ ÜRÜN  /| |  | |DEMO DAY | |  | | minimal | |                |
|  | |/ ALERT /| |  | |         | |  | | premium | |                |
|  | +---------+ |  | +---------+ |  | +---------+ |                |
|  | Industrial  |  | Event       |  | Minimal     |                |
|  | Product     |  | Poster      |  | Premium     |                |
|  | Alert       |  |             |  |             |                |
|  | [Sec]       |  | [Sec]       |  | [Sec]       |                |
|  +-------------+  +-------------+  +-------------+                |
|                                                                    |
|  +-------------+  +-------------+  +-------------+                |
|  | +---------+ |  | +---------+ |  | +---------+ |                |
|  | |TABLO    | |  | |  FOTO   | |  | | GEO    | |                |
|  | |TABLO    | |  | | DOMINANT| |  | | BLOK   | |                |
|  | |TABLO    | |  | |         | |  | | SERIT  | |                |
|  | +---------+ |  | +---------+ |  | +---------+ |                |
|  | Tech Data   |  | Photo       |  | Geometric   |                |
|  | Sheet       |  | Dominant    |  | Corporate   |                |
|  | [Sec]       |  | [Sec]       |  | [Sec]       |                |
|  +-------------+  +-------------+  +-------------+                |
|                                                                    |
|  +-------------+  +-------------+  +-------------+  +-------------+|
|  | +---------+ |  | +---------+ |  | +---------+ |  | +---------+ ||
|  | |DARK     | |  | |GRID    | |  | |TEBRIK   | |  | |TAZIYE   | ||
|  | |NEON     | |  | |IKON    | |  | |         | |  | |         | ||
|  | +---------+ |  | +---------+ |  | +---------+ |  | +---------+ ||
|  | Dark Tech   |  | Clean Grid  |  | Tebrik      |  | Taziye     ||
|  | [Sec]       |  | [Sec]       |  | Karti [Sec] |  | Karti [Sec]||
|  +-------------+  +-------------+  +-------------+  +-------------+|
+------------------------------------------------------------------+
```

---

### EKRAN 3: EDITOR (Ana Calisma Alani)
```
+------------------------------------------------------------------+
| [<]  Proje: Sofis VPI  | [Kaydet] [Geri Al] [Cevirmen] [Export] |
+------------------------------------------------------------------+
| SAYFALAR |      CANVAS (Onizleme)          | OZELLIKLER + LAYERS |
| +------+ | +------------------------------+| +------------------+ |
| |S.1   | | |                              || | ICERIK           | |
| |[mini]| | |  [Gercek boyutlu             || | Baslik [___]     | |
| |      | | |   sablon onizleme]           || | Aciklama [___]   | |
| +------+ | |                              || | Ozellikler [___] | |
| |S.2   | | |  - Drag & drop elemanlar     || | Uygulamalar [___]| |
| |[mini]| | |  - Cift tikla metin duzenle  || | Avantajlar [___] | |
| |      | | |  - Snap-to-grid cizgileri     || |                  | |
| +------+ | |  - Layer secim vurgulama      || | GORSEL           | |
| |      | | |                              || | [Yukle]          | |
| | [+]  | | |                              || | [Arka Plan Sil]  | |
| |Ekle  | | |                              || | Fit: [Cover v]   | |
| +------+ | +------------------------------+| |                  | |
|          | [%50] [%75] [%100] [Sigdir]     | | STILLER          | |
|          |                                  | | Opacity [====]   | |
|          | LAYER PANELI                     | | Shadow  [====]   | |
|          | +------------------------------+| | Feather [====]   | |
|          | | [goz][kilit] Baslik Metni    || | Grain   [====]   | |
|          | | [goz][kilit] Urun Gorseli    || | Blend: [Normal v]| |
|          | | [goz][kilit] Arka Plan       || |                  | |
|          | | [goz][kilit] Logo            || | TEMA             | |
|          | | [goz][kilit] Footer          || | [Demart Corp. v] | |
|          | |        [Yukari] [Asagi]      || | Renk: [#004aad]  | |
|          | +------------------------------+| | Font: [Roboto v] | |
|          |                                  | +------------------+ |
+------------------------------------------------------------------+
```

**Editor Detaylari:**

**Sol Panel - Sayfa Listesi:**
- Sayfa kucuk resimleri (thumbnails)
- Sayfa ekleme (+), silme, kopyalama
- Surukleme ile sayfa siralama
- Her sayfaya farkli sablon atanabilir

**Orta Alan - Canvas:**
- Gercek boyutlu sablon onizleme (WYSIWYG)
- Surukleme ile eleman tasima (drag & drop)
- Cift tiklama ile yerinde metin duzenleme
- Snap-to-grid hizalama cizgileri (yesil cizgiler)
- Zum kontrolu (%50, %75, %100, Sigdir)
- Secili layer mavi cerceve ile vurgulanir
- Feathering ve grain efektleri canli onizleme

**Orta Alt - Layer Paneli:**
- Her eleman bir layer satiri
- [Goz ikonu] = gorunurluk acik/kapali
- [Kilit ikonu] = kilitli/acik (kilitli layer tasinamaz)
- Surukleme veya ok butonlari ile layer sirasi degistirme
- Secili layer vurgulu

**Sag Panel - Ozellikler:**
- ICERIK: Baslik, aciklama, ozellikler, uygulamalar, avantajlar
- Her alan icin [Cevir] butonu (tek tikla ceviri)
- Her alan icin font secimi
- GORSEL: Yukleme, arka plan kaldirma, fit modu
- STILLER: Opacity, Shadow, Edge Feathering, Grain/Noise, Blend Mode
- TEMA: Aktif tema secimi, renk ve font degisikligi

---

### EKRAN 4: DISA AKTARMA (Export Dialog)
```
+--------------------------------------------------+
|              DISA AKTAR                           |
+--------------------------------------------------+
|                                                   |
|  EXPORT MODU:                                     |
|  (*) Tekli Export    ( ) TOPLU EXPORT (Batch)     |
|                                                   |
|  ---- TEKLI EXPORT ----                           |
|  FORMAT:                                          |
|  (*) PDF    ( ) PNG    ( ) JPG                    |
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
|  (*) Yuksek Kalite (baski icin, buyuk dosya)      |
|  ( ) Web Optimize (kucuk dosya, hizli yukleme)    |
|                                                   |
|  JPEG KALITE: [========90========] %90            |
|                                                   |
|  ---- TOPLU EXPORT (Batch) ----                   |
|  Secili presetler tek seferde uretilir:           |
|  [x] PDF A4 Portrait                              |
|  [x] PNG 1080x1080                                |
|  [x] PNG 1080x1350                                |
|  [x] PNG 1200x628                                 |
|  [ ] PNG 1920x1080                                |
|  [ ] JPG Web Optimize                             |
|                                                   |
|  Cikti: ZIP dosyasi olarak indirilir              |
|                                                   |
|  [Disa Aktar]                       [Iptal]       |
+--------------------------------------------------+
```

---

### EKRAN 5: CEVIRMEN PANELI (Sag Kenar Cikmasi / Sheet)
```
+------------------------------------------+
|         CEVIRMEN                     [X]  |
+------------------------------------------+
|                                          |
|  KAYNAK:  [English v]  -->  HEDEF: [Turkce v]   |
|                                          |
|  TON SECIMI:                             |
|  (*) Kurumsal    (Resmi, profesyonel)    |
|  ( ) Teknik      (Muhendislik dili)      |
|  ( ) Pazarlama   (Satisa yonelik)        |
|  ( ) Kisa        (Ozet, baslik tarzi)    |
|                                          |
|  TERMINOLOJI SOZLUGU:                    |
|  +--------------------------------------+|
|  | Terim          | Korunan Hali        ||
|  |----------------|---------------------||
|  | EasiDrive      | EasiDrive           ||
|  | gate vana      | gate vana           ||
|  | VPI            | VPI                 ||
|  | Netherlocks    | Netherlocks         ||
|  | ball valve     | kuresel vana        ||
|  +--------------------------------------+|
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

### EKRAN 6: ARKA PLAN KALDIRMA (Dialog)
```
+--------------------------------------------------+
|         ARKA PLAN KALDIRMA                        |
+--------------------------------------------------+
|                                                   |
|  +--------------------+  +--------------------+   |
|  |    ORIJINAL        |  |    SONUC           |   |
|  |                    |  |                    |   |
|  | [Urun fotografi    |  | [Seffaf arka      |   |
|  |  arka plan ile]    |  |  planli urun       |   |
|  |                    |  |  gorseli]          |   |
|  |                    |  |  (satranc tahtasi) |   |
|  +--------------------+  +--------------------+   |
|                                                   |
|  KENAR IYILESTIRME:                               |
|  Edge Feathering:  [========50%=======]           |
|  (Kenar yumusakligi - yapistirilmis gorunumu onler)|
|                                                   |
|  GOLGE EKLEME:                                    |
|  [x] Yumusak golge ekle                          |
|  Golge Rengi:  [#000000]                          |
|  Golge Yogunlugu: [========40%=======]            |
|  Golge Yayilimi:  [========20px======]            |
|                                                   |
|  [Arka Plani Kaldir]     [Uygula & Kapat]        |
+--------------------------------------------------+
```

---

### EKRAN 7: ASSET LIBRARY (Tam Ekran Dialog)
```
+------------------------------------------------------------------+
|  ASSET KUTUPHANESI                                          [X]   |
+------------------------------------------------------------------+
|                                                                    |
|  KATEGORILER:  [Tumunu Goster] [Logolar] [Ikonlar]                |
|                [Arka Planlar] [Urun Fotolari]                     |
|                                                                    |
|  [Ara...]                              [+ Yeni Asset Yukle]       |
|                                                                    |
|  +----------+  +----------+  +----------+  +----------+           |
|  | [Logo]   |  | [Logo]   |  | [Ikon]   |  | [Foto]   |          |
|  | DEMART   |  | SOFIS    |  | Vana     |  | VPI-A    |          |
|  | logo.png |  | logo.png |  | ikon.svg |  | foto.jpg |          |
|  | 45KB     |  | 32KB     |  | 12KB     |  | 1.2MB    |          |
|  | [Kullan] |  | [Kullan] |  | [Kullan] |  | [Kullan] |          |
|  | [Sil]    |  | [Sil]    |  | [Sil]    |  | [Sil]    |          |
|  +----------+  +----------+  +----------+  +----------+           |
|                                                                    |
|  +----------+  +----------+  +----------+  +----------+           |
|  | [BG]     |  | [BG]     |  | [BG]     |  | [Foto]   |          |
|  | Mavi     |  | Endustri |  | Gradient |  | DP Meter |          |
|  | arka.jpg |  | plant.jpg|  | dark.jpg |  | foto.jpg |          |
|  | 890KB    |  | 2.1MB    |  | 456KB    |  | 1.8MB    |          |
|  | [Kullan] |  | [Kullan] |  | [Kullan] |  | [Kullan] |          |
|  | [Sil]    |  | [Sil]    |  | [Sil]    |  | [Sil]    |          |
|  +----------+  +----------+  +----------+  +----------+           |
+------------------------------------------------------------------+
```

---

### EKRAN 8: BRAND/THEME AYARLARI (Dialog)
```
+--------------------------------------------------+
|         TEMA / BRAND AYARLARI               [X]   |
+--------------------------------------------------+
|                                                   |
|  HAZIR TEMALAR:                                   |
|  +------------+ +------------+ +------------+     |
|  | Demart     | | Dark Tech  | | Minimal    |     |
|  | Corporate  | |            | | Premium    |     |
|  | #004aad    | | #0f172a    | | #ffffff    |     |
|  | [Sec]      | | [Sec]      | | [Sec]      |     |
|  +------------+ +------------+ +------------+     |
|                                                   |
|  RENK PALETI:                                     |
|  Birincil Renk:    [#004aad] [renk secici]       |
|  Ikincil Renk:     [#003c8f] [renk secici]       |
|  Vurgu Rengi:      [#f59e0b] [renk secici]       |
|  Arka Plan:        [#f8fafc] [renk secici]       |
|  Metin Rengi:      [#0f172a] [renk secici]       |
|                                                   |
|  FONT SETI:                                       |
|  Baslik Fontu:     [Montserrat v]                |
|  Govde Fontu:      [Open Sans v]                 |
|  Vurgu Fontu:      [Roboto Condensed v]          |
|                                                   |
|  [Tema Kaydet]  [Sifirla]  [Yeni Tema Olustur]  |
+--------------------------------------------------+
```

---

## 4. 10 SABLON DETAYLARI

| # | Sablon Adi | Layout Tanimi | Hedef Kullanim | Ornek Benzer |
|---|-----------|--------------|----------------|-------------|
| 1 | Industrial Product Alert | Diagonal clip-path ile sol: endustriyel foto, sag: urun + baslik. Alt: CTA seridi | Yeni urun duyurusu | Rosemount gorseli |
| 2 | Event Poster | Tam mavi gradient BG, merkez: buyuk baslik + aciklama, alt: tarih/konum ikonlari, en alt: sponsor logolari | Etkinlik/fuar | ENOSAD Demo Day |
| 3 | Minimal Premium | %70 beyaz alan, sol hizali buyuk baslik, ince ayirac cizgi, kucuk urun gorseli, minimal footer | Premium urun | - |
| 4 | Tech Data Sheet | Ust: logo + baslik, orta: ozellik tablosu (grid), sag: urun gorseli, alt: teknik notlar | Teknik dokuman | Netherlocks VPI |
| 5 | Photo Dominant | Tam ekran HD gorsel, uzerinde yarim seffaf koyu overlay, beyaz baslik + kisa mesaj | Sosyal medya, LinkedIn | - |
| 6 | Geometric Corporate | Yatay seritler/bloklar ile bolumlenme, her blokta farkli icerik (baslik, ozellikler, gorsel), kurumsal renkler | Kurumsal sunum | - |
| 7 | Dark Tech | Koyu lacivert/siyah zemin, neon mavi/yesil vurgu cizgiler, parlak baslik, urun gorseli glow efekti ile | Ileri teknoloji | - |
| 8 | Clean Industrial Grid | 2x3 veya 3x3 grid, her kutuda ikon + fayda metni, ortada urun gorseli, temiz beyaz zemin | Fayda ozeti | - |
| 9 | Tebrik Karti | Festif arka plan, dekoratif cerceve, merkez baslik + mesaj, alt: logo + imza alani | Yilbasi/bayram | - |
| 10 | Taziye/Yas Karti | Sade koyu tonlar (lacivert/gri), ince bordur, saygin tipografi, logo + imza, hazir taziye metni | Taziye/baskisagligi | - |

---

## 5. KULLANIM AKISI (Tipik Senaryo)

### Senaryo A: Yeni Urun Tanitim Sayfasi
```
Dashboard --> [+ Yeni Katalog] --> Proje adi gir
  --> Sablon Sec (orn: "Industrial Product Alert")
  --> Editor acilir
  --> Sag panelden baslik/aciklama yaz
  --> Urun fotografini yukle
  --> [Arka Plani Kaldir] tikla --> seffaf urun gorseli
  --> Feathering + shadow ayarla (yapistirilmis gorunmesin)
  --> Layer panelinden siralama ayarla
  --> [Cevirmen] ac --> EN-->TR ceviri yap --> alana yapistir
  --> [Kaydet]
  --> [Disa Aktar] --> Batch Export --> PDF + 3 PNG boyut --> ZIP indir
```

### Senaryo B: Tebrik Karti
```
Dashboard --> [+ Yeni Tebrik Karti] --> Sablon sec
  --> Hazir metin seceneklerinden birini sec veya kendin yaz
  --> Logo + imza ekle
  --> Tema rengini ayarla
  --> [Disa Aktar] --> PNG + PDF
```

### Senaryo C: Toplu Sosyal Medya Icerigi
```
Mevcut katalogu ac --> Editor'da duzenle
  --> [Disa Aktar] --> Toplu Export
  --> [x] 1080x1080, [x] 1080x1350, [x] 1200x628 sec
  --> [Disa Aktar] --> ZIP indir (3 dosya icinde)
```

---

## 6. PDF KALITE GARANTISI

**Onceki yontem (BASARISIZ - KULLANILMAYACAK):**
- html-to-image ile ekran goruntusu al
- jsPDF ile goruntuyu PDF'e yapistir
- Sonuc: Metin secilemez, bulanik, dusuk kalite

**Yeni yontem (PLAYWRIGHT PRINT-TO-PDF):**
```
HTML/CSS Template --> Playwright Chromium --> page.pdf()
                                              |
                                    printBackground: true
                                    preferCSSPageSize: true
                                    @media print CSS
                                              |
                                         SONUC:
                                    - Metin secilebilir
                                    - Font gomulu
                                    - Vektor kalite
                                    - TR karakter %100
                                    - Layout kaymasi yok
```

**Kabul testleri:**
1. PDF'teki herhangi bir metni secip kopyalayabileceksiniz
2. TR karakterler (s, c, g, u, o, i, I) %100 dogru gorunecek
3. Fontlar gomulu olacak (baska bilgisayarda da dogru gorunum)
4. Layout bire bir canvas ile ayni olacak
5. 300 DPI baski kalitesinde net olacak

---

## 7. TEKNIK MIMARI

```
+-------------------+         +-------------------+
|   TARAYICI        |         |   SUNUCU          |
|   (React App)     |  HTTP   |   (FastAPI)       |
|                   | ------> |                   |
|  Dashboard        |         |  /api/catalogs    |
|  Editor (Canvas)  |         |  /api/cards       |
|  Template Preview |         |  /api/assets      |
|  Layer Panel      |         |  /api/themes      |
|  Export Dialog    |         |  /api/translate    |
|  Translator       |         |  /api/export/*    |
|  Asset Library    |         |  /api/remove-bg   |
|  Theme Settings   |         |  /api/glossary    |
+-------------------+         +-------------------+
                                      |
                              +-------+-------+
                              |       |       |
                          MongoDB  Playwright  rembg
                          (veri)  (PDF/PNG)  (BG sil)
```

**Backend Endpointler:**
- `POST /api/catalogs` - Katalog olustur
- `GET /api/catalogs` - Kataloglari listele
- `PUT /api/catalogs/{id}` - Katalog guncelle
- `DELETE /api/catalogs/{id}` - Katalog sil
- `POST /api/catalogs/{id}/pages` - Sayfa ekle
- `PUT /api/catalogs/{id}/pages/{pid}` - Sayfa guncelle
- `POST /api/cards` - Kart olustur (tebrik/taziye)
- `GET/PUT/DELETE /api/cards/{id}` - Kart CRUD
- `POST /api/export/pdf` - Playwright PDF export
- `POST /api/export/png` - Playwright PNG export
- `POST /api/export/jpg` - Playwright JPG export
- `POST /api/export/batch` - Toplu export (ZIP)
- `POST /api/remove-bg` - Arka plan kaldirma
- `POST /api/resize-image` - Gorsel boyutlandirma (Lanczos)
- `POST /api/translate` - Ceviri (ton + sozluk destegi)
- `POST /api/upload-image` - Gorsel yukleme
- `GET/POST /api/assets` - Asset library CRUD
- `GET/POST /api/themes` - Tema CRUD
- `GET/POST /api/glossary` - Terminoloji sozlugu CRUD

---

## 8. YAPILACAKLAR LISTESI (Tam Kapsam)

| # | Ozellik | Oncelik | Durum |
|---|---------|---------|-------|
| 1 | 10 farkli sablon (birbirinden tamamen farkli) | P0 | Yapilacak |
| 2 | Playwright PDF export (metin secilebilir) | P0 | Yapilacak |
| 3 | PNG/JPG export (6 preset + ozel boyut) | P0 | Yapilacak |
| 4 | Canvas editor (drag&drop, WYSIWYG onizleme) | P0 | Yapilacak |
| 5 | Layer yonetimi (siralama + kilitleme + gorunurluk) | P0 | Yapilacak |
| 6 | Edge feathering + grain/noise overlay | P0 | Yapilacak |
| 7 | Background removal (rembg, kenar iyilestirme) | P0 | Yapilacak |
| 8 | JPEG/PNG resize (Lanczos, yuksek kalite) | P0 | Yapilacak |
| 9 | Cevirmen (4 ton + terminoloji sozlugu) | P0 | Yapilacak |
| 10 | Tebrik karti modulu + hazir metinler | P0 | Yapilacak |
| 11 | Taziye karti modulu + hazir metinler | P0 | Yapilacak |
| 12 | Merkezi asset library (projeler arasi) | P0 | Yapilacak |
| 13 | Brand/Theme sistemi (renk + font seti) | P0 | Yapilacak |
| 14 | Batch export (tek tikla coklu boyut, ZIP) | P0 | Yapilacak |
| 15 | Proje kaydet/ac | P0 | Yapilacak |
| 16 | Export gecmisi | P1 | Yapilacak |
| 17 | Snap-to-grid hizalama | P1 | Yapilacak |
| 18 | Blend mode secenekleri | P1 | Yapilacak |
| 19 | Soft shadow ekleme | P1 | Yapilacak |
| 20 | Web/High Quality export secenekleri | P0 | Yapilacak |

---

## 9. HARIC OLAN (Scope Disi)

- Windows EXE (bu platform web uygulamasi uretiyor)
- Electron paketleme
- Offline calisma (internet gerekli)
- Photoshop seviyesinde pixel-perfect kompozisyon
- Video export

---

## 10. SONRAKI ADIM

Bu raporu onayladiginizda kodlamaya baslanacak.
Tahmini teslimat: Tek seferde calisan, test edilmis uygulama.
