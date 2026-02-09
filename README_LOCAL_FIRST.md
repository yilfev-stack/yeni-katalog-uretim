# PRO CREATIVE STUDIO - Yerel Kurulum Kilavuzu

## Gereksinimler
- Windows 10/11
- Docker Desktop (https://www.docker.com/products/docker-desktop/)
- En az 4 GB bos RAM

## Kurulum (Tek Komut)

1. Docker Desktop'u acin ve calistigini dogrulayin
2. Proje klasorunde terminal acin:

```bash
docker compose up -d --build
```

3. Tarayicida acin: **http://localhost:3010**

## Durdurma
```bash
docker compose down
```

## Tamamen Sifirdan Baslatma (Verileri Temizle)
```bash
docker compose down -v
docker compose up -d --build
```

## Sorun Giderme

### Frontend acilmiyorsa
```bash
docker compose logs frontend
```

### Export hatasi aliyorsaniz
```bash
docker compose logs backend
```

### Port 3010 doluysa
docker-compose.yml icinde `3010:80` satirini baska porta degistirin (ornegin `3020:80`)

## Ozellikler
- 10 farkli profesyonel sablon
- Playwright PDF export (metin secilebilir)
- PNG/JPG export (6 preset boyut)
- Toplu export (ZIP)
- Her alan icin font/boyut/kalin/italik/renk kontrolleri
- Layer yonetimi
- Cevirmen (EN/TR/AZ)
- Tebrik + Taziye kart modulu
- Tema sistemi
- Proje backup/restore

## Notlar
- Ceviri icin internet baglantisi gerekli (EMERGENT_LLM_KEY)
- Diger tum ozellikler internetsiz calisir
- EMERGENT_LLM_KEY backend/.env dosyasina eklenmelidir
