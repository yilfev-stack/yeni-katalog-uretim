# PRO CREATIVE STUDIO - Detayli On Rapor & Blueprint
## Web Uygulamasi - Sofis Urunleri Icin Profesyonel Marketing Studio

---

## 1. GENEL BAKIS

**Amac:** Sofis urunleri icin profesyonel kalitede one-page reklam, katalog ve kart (tebrik/taziye) ureten web uygulamasi.

**Teknoloji:** React (Frontend) + FastAPI (Backend) + MongoDB (Veritabani) + Playwright (PDF/PNG export)

**Erisim:** Tarayici uzerinden (Chrome/Edge/Firefox)

---

## 2. ANA EKRANLAR VE ARAYUZ

Uygulama 6 ana ekrandan olusacak:

### EKRAN 1: DASHBOARD (Ana Sayfa)
```
+------------------------------------------------------------------+
|  [DEMART Logo]  PRO CREATIVE STUDIO    [Ayarlar]  [Cevirmen]     |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  |   KATALOGLAR     |  |  TEBRIK KARTLARI |  |  TAZIYE KARTLARI |  |
|  |   [12 adet]      |  |   [5 adet]       |  |   [3 adet]       |  |
|  |   Yeni Olustur + |  |   Yeni Olustur + |  |   Yeni Olustur + |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
|  SON PROJELER                                [Ara...] [Filtrele]  |
|  +--------------------------------------------------------------+  |
|  | [Thumb] Sofis VPI Katalog    | 3 sayfa | 15 Oca 2026 | [>]  |  |
|  | [Thumb] Rosemount DP Meter   | 1 sayfa | 12 Oca 2026 | [>]  |  |
|  | [Thumb] Yilbasi Tebrik Karti | 1 kart  | 01 Oca 2026 | [>]  |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  ASSET KUTUPHANESI                                                |
|  +--------------------------------------------------------------+  |
|  | Logolar (4) | Arka Planlar (8) | Urun Fotolari (12) | +Ekle |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

**Ozellikler:**
- Proje listesi (katalog, tebrik karti, taziye karti)
- Arama ve filtreleme (etiket, tarih, urun adi)
- Son projelere hizli erisim
- Asset kutuphanesi (logolar, arka planlar, urun fotolari)
- Proje kopyalama, silme, arsivleme
- Export gecmisi goruntuleme

---

### EKRAN 2: SABLON SECIM EKRANI
```
+------------------------------------------------------------------+
|  [<] Geri    Sablon Secin                     [Kategori Filtre v] |
+------------------------------------------------------------------+
|                                                                    |
|  KATEGORI: [Tumunu Goster] [Urun] [Etkinlik] [Kart] [Teknik]    |
|                                                                    |
|  +-------------+  +-------------+  +-------------+                |
|  | [ONIZLEME]  |  | [ONIZLEME]  |  | [ONIZLEME]  |               |
|  |             |  |             |  |             |                |
|  | Industrial  |  | Event       |  | Minimal     |                |
|  | Product     |  | Poster      |  | Premium     |                |
|  | Alert       |  | (ENOSAD)    |  |             |                |
|  | [Sec]       |  | [Sec]       |  | [Sec]       |                |
|  +-------------+  +-------------+  +-------------+                |
|                                                                    |
|  +-------------+  +-------------+  +-------------+                |
|  | [ONIZLEME]  |  | [ONIZLEME]  |  | [ONIZLEME]  |               |
|  | Tech Data   |  | Photo       |  | Geometric   |                |
|  | Sheet       |  | Dominant    |  | Corporate   |                |
|  | [Sec]       |  | [Sec]       |  | [Sec]       |                |
|  +-------------+  +-------------+  +-------------+                |
|                                                                    |
|  +-------------+  +-------------+  +-------------+  +-------------+|
|  | Dark Tech   |  | Clean Grid  |  | Tebrik      |  | Taziye     ||
|  | [Sec]       |  | [Sec]       |  | Karti [Sec] |  | Karti [Sec]||
|  +-------------+  +-------------+  +-------------+  +-------------+|
+------------------------------------------------------------------+
```

**10 Sablon (Birbirinden TAMAMEN Farkli):**

1. **Industrial Product Alert** (Rosemount tarzi)
   - Diagonal kesim ile arka plan foto + urun gorseli
   - "PRODUCT ALERT!" baslik alani
   - Urun adi, aciklama, CTA butonu
   - Kullanim: Yeni urun duyurusu

2. **Event Poster** (ENOSAD tarzi)
   - Tam mavi gradient arka plan
   - Buyuk baslik, alt baslik, aciklama
   - Tarih/Konum/Kayit bilgileri
   - Sponsor logo alani (alt kisim)
   - Kullanim: Etkinlik/fuar duyurusu

3. **Minimal Premium**
   - Cok beyaz alan, buyuk tipografi
   - Ince cizgiler, minimalist layout
   - Tek urun gorseli, kisa mesaj
   - Kullanim: Premium urun tanitimi

4. **Tech Data Sheet** (Netherlocks VPI tarzi)
   - Tablo agirlikli layout
   - Teknik ozellikler tablosu
   - Urun gorseli + spesifikasyonlar
   - Coklu sayfa destegi
   - Kullanim: Teknik veri sayfasi

5. **Photo Dominant**
   - Tam ekran urun/endustriyel gorsel
   - Uzerine seffaf overlay ile metin
   - Kisa ve etkili mesaj
   - Kullanim: Sosyal medya, LinkedIn paylasimi

6. **Geometric Corporate**
   - Serit/blok layout
   - Geometrik sekiller ile bolumlenme
   - Kurumsal renk paleti
   - Kullanim: Kurumsal sunumlar

7. **Dark Tech**
   - Koyu tema (lacivert/siyah)
   - Neon/parlak vurgu renkleri
   - Modern, teknolojik gorunum
   - Kullanim: Ileri teknoloji urun tanitimi

8. **Clean Industrial Grid**
   - Ikonlu fayda kutulari (grid layout)
   - Temiz, organize gorunum
   - Her kutu bir fayda/ozellik
   - Kullanim: Urun faydalarini ozetleme

9. **Tebrik Karti**
   - Cesitli tebrik sablon varyantlari
   - Yilbasi, bayram, kutlama
   - Logo + imza alani
   - Hazir metin onerileri

10. **Taziye/Yas Karti**
    - Kurumsal sade tasarim
    - Saygi duygusu veren renkler (koyu tonlar)
    - Logo + imza alani
    - Hazir taziye metinleri

---

### EKRAN 3: EDITOR (Ana Calisma Alani)
```
+------------------------------------------------------------------+
| [<] Geri  | Proje: Sofis VPI  | [Kaydet] [Geri Al] [Disa Aktar] |
+------------------------------------------------------------------+
| SAYFALAR  |        CANVAS (Onizleme)        |   OZELLIKLER       |
| +-------+ |  +----------------------------+ |  +--------------+  |
| |Sayfa 1| |  |                            | |  | BASLIK       |  |
| |[thumb]| |  |   [Gercek boyutlu          | |  | [input]      |  |
| |       | |  |    sablon onizleme]         | |  |              |  |
| +-------+ |  |                            | |  | ACIKLAMA     |  |
| |Sayfa 2| |  |   Surukleme ile            | |  | [textarea]   |  |
| |[thumb]| |  |   eleman tasima            | |  |              |  |
| |       | |  |                            | |  | OZELLIKLER   |  |
| +-------+ |  |   Cift tiklama ile         | |  | [bullet list]|  |
| |       | |  |   metin duzenleme          | |  |              |  |
| | [+]   | |  |                            | |  | GORSEL       |  |
| |Sayfa  | |  |   Snap-to-grid             | |  | [Yukle]      |  |
| |Ekle   | |  |   hizalama cizgileri        | |  | [Arka Plan   |  |
| +-------+ |  |                            | |  |  Kaldir]     |  |
|           |  +----------------------------+ |  |              |  |
|           |                                 |  | LAYER'LAR    |  |
|           |  [%50] [%75] [%100] [Sigdir]    |  | [liste]      |  |
+------------------------------------------------------------------+
```

**Editor Ozellikleri:**

**Sol Panel - Sayfa Listesi:**
- Sayfa kucuk resimleri (thumbnails)
- Sayfa ekleme/silme/kopyalama
- Surukleme ile sayfa siralama
- Her sayfaya farkli sablon atama

**Orta Alan - Canvas:**
- Gercek boyutlu sablon onizleme
- Surukleme ile eleman tasima (drag & drop)
- Cift tiklama ile yerinde metin duzenleme
- Snap-to-grid hizalama cizgileri
- Zum kontrolu (%50, %75, %100, Sigdir)
- Gorsel surukleme ile konumlandirma

**Sag Panel - Ozellikler:**
- Baslik, aciklama, madde isaretleri, uygulamalar, avantajlar alanlari
- Her alan icin yazi tipi secimi
- Her alan icin ceviri butonu (tek tikla cevir)
- Gorsel yukleme alani
- "Arka Plani Kaldir" butonu
- Layer listesi (ust-alt siralama)
- Opacity (seffaflik) ayari
- Shadow (golge) ayari

---

### EKRAN 4: DISA AKTARMA (Export) DIALOG
```
+------------------------------------------+
|         DISA AKTAR                        |
+------------------------------------------+
|                                          |
|  FORMAT:                                 |
|  (*) PDF    ( ) PNG    ( ) JPG           |
|                                          |
|  BOYUT:                                  |
|  [v] A4 Dikey (Portrait)                 |
|  [ ] A4 Yatay (Landscape)               |
|  [ ] 1080x1080 (Instagram Kare)         |
|  [ ] 1080x1350 (Instagram Story)        |
|  [ ] 1200x628  (LinkedIn/Facebook)      |
|  [ ] 1920x1080 (Sunum/Banner)           |
|  [ ] Ozel Boyut: [___]px x [___]px      |
|                                          |
|  KALITE:                                 |
|  (*) Yuksek Kalite (baski icin)          |
|  ( ) Web Optimize (kucuk dosya)          |
|                                          |
|  KAPSAM:                                 |
|  (*) Secili Sayfa                        |
|  ( ) Tum Katalog                         |
|  ( ) Toplu Export (tum boyutlar)         |
|                                          |
|  [Disa Aktar]              [Iptal]       |
+------------------------------------------+
```

**Export Ozellikleri:**
- PDF: Playwright print-to-PDF (metin secilebilir, font gomulu)
- PNG: Yuksek cozunurluk, seffaf arka plan destegi
- JPG: Ayarlanabilir kalite (80-100)
- 6 hazir boyut preset + ozel boyut
- Toplu export: Tek tikla tum boyutlarda uret
- Export gecmisi (v1, v2, v3...)

---

### EKRAN 5: CEVIRMEN PANELI
```
+------------------------------------------+
|         CEVIRMEN                          |
+------------------------------------------+
|                                          |
|  KAYNAK:  [EN v]  -->  HEDEF: [TR v]    |
|                                          |
|  TON:                                    |
|  (*) Kurumsal  ( ) Teknik                |
|  ( ) Pazarlama ( ) Kisa                  |
|                                          |
|  TERMINOLOJI SOZLUGU:                    |
|  EasiDrive --> EasiDrive (korunur)       |
|  gate vana --> gate vana (korunur)       |
|  VPI --> VPI (korunur)                   |
|  [+ Terim Ekle]                          |
|                                          |
|  KAYNAK METIN:                           |
|  +--------------------------------------+|
|  | The VPI is a mechanical device...    ||
|  +--------------------------------------+|
|                                          |
|  CEVIRI:                                 |
|  +--------------------------------------+|
|  | VPI, mekanik bir cihazdır...         ||
|  +--------------------------------------+|
|                                          |
|  [Cevir]  [Secili Alana Uygula]         |
+------------------------------------------+
```

**Cevirmen Ozellikleri:**
- EN<->TR, TR<->EN (ve diger diller)
- 4 farkli ton secenegi
- Terminoloji sozlugu (ozel terimler korunur)
- Tek tikla ceviriyi secili metin kutusuna uygulama
- Emergent LLM Key ile calisiyor

---

### EKRAN 6: ARKA PLAN KALDIRMA
```
+------------------------------------------+
|     ARKA PLAN KALDIRMA                    |
+------------------------------------------+
|                                          |
|  +------------------+ +----------------+ |
|  |   ORIJINAL       | |   SONUC        | |
|  |                  | |                | |
|  |  [Urun fotografi | | [Seffaf arka   | |
|  |   arka plan ile] | |  planli urun]  | |
|  |                  | |                | |
|  +------------------+ +----------------+ |
|                                          |
|  AYARLAR:                                |
|  [v] Kenar iyilestirme (Edge Refine)    |
|  [v] Yumusak golge ekle                 |
|  Golge rengi: [#000000]  Yogunluk: [50%]|
|                                          |
|  [Arka Plani Kaldir]  [Uygula & Kapat]  |
+------------------------------------------+
```

---

## 3. KULLANIM AKISI (Tipik Senaryo)

### Senaryo: Yeni Urun Tanitim Sayfasi Olusturma

1. **Dashboard'a gir** --> "Yeni Katalog" tikla
2. **Proje bilgilerini gir:** "Sofis VPI Katalog", urun adi: "VPI-A Series"
3. **Sablon sec:** "Industrial Product Alert" (Rosemount tarzi)
4. **Editor acilir:**
   - Sag panelden baslik yaz: "PRODUCT ALERT! Sofis VPI-A Series"
   - Aciklama yaz (Ingilizce)
   - "Cevir" butonuna tikla --> Otomatik Turkce ceviri
   - Urun fotografini yukle
   - "Arka Plani Kaldir" tikla --> Seffaf urun gorseli
   - Canvas uzerinde gorseli surukleme ile konumlandir
   - Shadow ve opacity ayarla
5. **Disa Aktar:**
   - PDF (A4) --> Baski icin
   - PNG (1080x1080) --> Instagram icin
   - PNG (1200x628) --> LinkedIn icin
6. **Kaydet** --> Proje kaydedilir, istediginde geri donebilir

---

## 4. TEKNIK MIMARI

```
KULLANICI (Tarayici)
     |
     v
[React Frontend] -- REACT_APP_BACKEND_URL --> [FastAPI Backend]
     |                                              |
     |                                              v
     |                                        [MongoDB]
     |                                              |
     |                                        [Playwright]
     |                                         (PDF/PNG export)
     |                                              |
     |                                        [rembg/U2Net]
     |                                         (Arka plan kaldirma)
     |                                              |
     |                                        [Pillow/sharp]
     |                                         (Gorsel isleme)
     |                                              |
     |                                        [Emergent LLM]
     |                                         (Ceviri)
```

---

## 5. PDF KALITE GARANTISI

**Onceki yontem (BASARISIZ):**
- html-to-image ile ekran goruntusu al
- jsPDF ile goruntuyu PDF'e yapistir
- Sonuc: Metin secilemez, bulanik, kalitesiz

**Yeni yontem (PLAYWRIGHT):**
- HTML/CSS ile sablon render et (gercek DOM)
- Playwright Chromium ile `page.pdf()` cagir
- `printBackground: true` ile arka planlar dahil
- `preferCSSPageSize: true` ile CSS sayfa boyutu
- `@media print` CSS kurallari ile baski optimizasyonu
- Sonuc: Metin secilebilir, font gomulu, vektor kalite

**Kabul testi:**
- PDF'teki metin secilip kopyalanabilecek
- TR karakterler (ş, ç, ğ, ü, ö, ı, İ) %100 dogru
- Fontlar gomulu (baska bilgisayarda da dogru gorunur)
- Layout kaymasi yok
- 300 DPI baski kalitesi

---

## 6. 10 SABLON DETAYLARI

| # | Sablon Adi | Gorsel Tanim | Hedef Kullanim |
|---|-----------|-------------|----------------|
| 1 | Industrial Product Alert | Diagonal kesim, endustriyel foto + urun | Yeni urun duyurusu |
| 2 | Event Poster | Tam mavi gradient, megafon, tarih/konum | Etkinlik/fuar |
| 3 | Minimal Premium | Cok beyaz alan, buyuk yazi, tek gorsel | Premium urun |
| 4 | Tech Data Sheet | Tablolar, spesifikasyonlar, teknik veri | Teknik dokuman |
| 5 | Photo Dominant | Tam ekran foto, seffaf metin overlay | Sosyal medya |
| 6 | Geometric Corporate | Serit/blok bolumler, geometrik | Kurumsal sunum |
| 7 | Dark Tech | Koyu tema, neon vurgular | Ileri teknoloji |
| 8 | Clean Industrial Grid | Ikonlu fayda kutulari, grid | Fayda ozeti |
| 9 | Tebrik Karti | Festif tasarim, logo+imza | Tebrik/kutlama |
| 10 | Taziye Karti | Sade, saygin, koyu tonlar | Taziye/baskisagligi |

---

## 7. YAPILACAKLAR LISTESI (SCOPE)

**DAHIL:**
- [x] 10 farkli sablon
- [x] Canvas editor (drag&drop, layer, text box)
- [x] Playwright PDF (metin secilebilir)
- [x] PNG/JPG export (6 preset + ozel boyut)
- [x] Web/High Quality export secenekleri
- [x] Background removal (rembg)
- [x] JPEG resize (Lanczos kalite)
- [x] Tebrik + Taziye kart modulu
- [x] Cevirmen (ton + terminoloji sozlugu)
- [x] Asset kutuphanesi
- [x] Proje kaydet/ac
- [x] Export gecmisi
- [x] Toplu export (batch)
- [x] Snap-to-grid hizalama

**HARIC (Scope disi):**
- [ ] Windows EXE (bu platform web uygulamasi uretiyor)
- [ ] Electron paketleme
- [ ] Offline calisma (internet gerekli)

---

## 8. ONAY BEKLEYEN SORULAR

Bu rapora bakip su konularda onayinizi bekliyorum:
1. Ekran tasarimlari ve arayuz uygun mu?
2. 10 sablon kategorisi dogru mu?
3. Export boyut presetleri yeterli mi?
4. Cevirmen ozellikleri (ton + terminoloji) yeterli mi?
5. Baska eklemek istediginiz bir ozellik var mi?

---
