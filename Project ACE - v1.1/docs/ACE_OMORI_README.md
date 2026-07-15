# Project ACE — Geliştirme Notu
> Bu belge her oturumda güncellenir. Bağlam kaybını önlemek için tasarlanmıştır.

---

## Projenin Özü

Project ACE, gerçek zamanlı afet ve doğal olay izleme platformudur. Palantir Gotham ve Horus Eye'dan ilham alınmış, sivil ve insani amaçlarla tasarlanmıştır. Askeri kullanım hedeflenmemektedir.

**Temel hedef:** Farklı veri kaynaklarını tek bir çatı altında toplayıp anlamlı hale getirmek, gerçek zamanlı izlemek, risk analizi yapmak ve ileride makine öğrenmesiyle güçlendirmek.

**Geliştirici profili:** Orta düzey Python bilgisi, OOP ve kütüphane kullanımı yetkin. Godot ile oyun geliştirmeye başlamış. Makine öğrenmesi alanında aktif öğrenme sürecinde.

---

## Mimari Karar: Modüler Monolit

Mikroservis değil, modüler monolit seçildi. Gerekçe:

- Her protokol bağımsız büyüyecek ama aynı anda deploy edilecek
- Mikroservisin altyapı yükü bu aşamada gereksiz
- Test ve debug kolaylığı
- ML entegrasyonu sonradan eklense bile mimari bozulmayacak

---

## Protokoller (Modüller)

| Protokol | Alan | Durum |
|----------|------|-------|
| **OMORI** | Sismik aktivite, deprem analizi, artçı tahmini | 🟡 Frontend tamamlandı, backend iskelet kuruldu |
| **LORENZ** | Atmosfer, kaos teorisi, termal anomaliler | ⬜ Planlandı |
| **HADLEY** | Lojistik, havacılık, denizcilik telemetrisi | ⬜ Planlandı |
| **ARF** | Siber güvenlik, yapay zeka tehditleri | ⬜ Planlandı |
| **HERODOTUS** | OSINT, jeopolitik, kriz haritalama | ⬜ Planlandı |
| **CLARKE** | Uydu, ISS, uzay enkazı takibi | ⬜ Planlandı |

Her protokol ileride ML ile güçlendirilecek.

---

## Teknoloji Yığını

### Backend
```
Python 3.12
FastAPI           — web framework, WebSocket desteği
uvicorn           — ASGI sunucusu
httpx             — async HTTP istemcisi (dış API'ler için)
pydantic v2       — veri doğrulama ve şema
pydantic-settings — .env okuma
numpy + scipy     — Omori yasası hesaplamaları
```

### Frontend
```
Node.js v24       — build aracı (production'da yok)
Vite v8           — React derleyici ve dev server
React             — UI kütüphanesi
recharts          — seismik grafik
three             — 3D küre ve sahne yönetimi
topojson-client   — dünya haritası verisi ayrıştırma
d3-geo            — coğrafi projeksiyon hesaplamaları
world-atlas       — ülke sınırları GeoJSON verisi (50m çözünürlük)
```

### Planlanan (henüz kurulmadı)
```
Redis             — Pub/Sub, cache
Celery            — periyodik görev kuyruğu
PostgreSQL        — ana veritabanı
TimescaleDB       — zaman serisi verisi
```

---

## Klasör Yapısı

### Backend
```
backend/
└── app/
    ├── main.py
    ├── core/
    │   ├── config.py
    │   ├── logging.py
    │   ├── security.py
    │   └── constants.py
    ├── api/
    │   └── v1/
    │       ├── router.py
    │       └── endpoints/
    │           ├── auth.py
    │           ├── seismic.py
    │           └── ...
    ├── protocols/
    │   └── omori/
    │       ├── router.py
    │       ├── schemas.py
    │       ├── service.py
    │       ├── providers/
    │       │   ├── base.py
    │       │   ├── usgs.py
    │       │   └── kandilli.py
    │       ├── repositories/
    │       │   └── event_repository.py
    │       └── ml/
    │           ├── features.py
    │           ├── model.py
    │           └── training.py
    ├── shared/
    │   ├── exceptions.py
    │   ├── responses.py
    │   ├── clients/
    │   │   ├── http.py
    │   │   └── cache.py
    │   └── utils/
    │       ├── geo.py
    │       └── time.py
    └── realtime/
        ├── manager.py
        ├── websocket.py
        └── sse.py
```

**Önemli mimari not:** `core/` ve `shared/` ayrımı bilinçli.
- `core/` → uygulama altyapısı: config, logging, lifespan
- `shared/` → protokoller arası paylaşılan iş kodu: exceptions, responses, clients

### Frontend
```
frontend/
└── src/
    ├── globe/
    │   ├── useGlobe.js         — Three.js sahne yönetimi, custom hook
    │   └── Globe.jsx           — küre bileşeni, mount noktası
    ├── layout/
    │   └── MainLayout.jsx      — ana çerçeve, navbar + sidebar + küre + detail panel
    ├── modules/
    │   └── omori/
    │       ├── constants.js    — renkler, fay hatları, Omori sabitleri
    │       ├── utils.js        — Omori/Båth hesaplamaları, veri üreticiler
    │       ├── Navbar.jsx
    │       ├── Sidebar.jsx
    │       ├── ThreatWidget.jsx
    │       ├── SeismicChart.jsx
    │       ├── EventList.jsx
    │       ├── OmoriPrediction.jsx
    │       └── OmoriDashboard.jsx
    ├── App.jsx                 — MainLayout'u render eder
    ├── index.css               — global stiller, CSS değişkenleri
    └── main.jsx                — React giriş noktası
```

---

## Küre Mimarisi

Küre projenin merkezidir. Bir süs değil, tüm protokollerin görselleştirme katmanıdır.

### Davranış
```
Modül seçili değil  → sade küre, sadece harita ve halkalar görünür
OMORI aktif         → deprem noktaları, fay hatları küreye bindiriliyor (yakında)
LORENZ aktif        → atmosferik anomaliler (ileride)
HADLEY aktif        → uçuş rotaları, deniz yolları (ileride)
```

### Katmanlar (useGlobe.js)
```
1. İç dolgu küre       — koyu, derinlik hissi için
2. Tel kafes           — SphereGeometry wireframe, parlak beyaz-mor ton
3. Kıtalar             — world-atlas 50m, ülke sınırları Line geometrisi
4. Orbital halkalar    — 3 adet TorusGeometry, farklı açı ve hız
5. Nodlar              — her halkada 1 adet, beyaz çekirdek + 2 hale katmanı
6. Glow                — BackSide sphere, dış parıltı
```

### Mouse Etkileşimleri
```
Sol tık + sürükle  → küreyi döndür
Sağ tık            → otomatik dönüşü durdur / devam ettir
Scroll             → zoom in/out (1.5x – 5.0x arası sınırlı)
```

### Teknik Notlar
- Halkalar `globeGroup` içinde — küreyle birlikte dönerler
- Her halka kendi `ringGroup`'u içinde — ayrıca kendi ekseninde döner
- `autoRotate` ref ile yönetiliyor — state değil, re-render tetiklemez
- `StrictMode` kaldırıldı — Two.js effect'i iki kez çalıştırıp çift küre oluşturuyordu
- Kıta verisi CDN'den async yükleniyor: `cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json`

### Denenen ve Vazgeçilen Yaklaşımlar
- **geoContains ile tel kafes filtreleme** — kara üzerinde kafes çizmeme. CPU yükü çok yüksek, ertelendi.
- **ShaderMaterial Fresnel efekti** — halkalarda derinlik hissi. Görsel sonuç beklentinin altında kaldı.
- **Altıgen kafes** — SphereGeometry wireframe daha temiz göründüğü için tercih edildi.

---

## Bilimsel Modeller

### Omori Yasası (1894)
```
n(t) = K / (c + t)^p
```

| Parametre | Açıklama | Varsayılan |
|-----------|----------|------------|
| n(t) | t anındaki artçı sıklığı | — |
| K | sismik üretkenlik sabiti | 10^(M-4) |
| c | gecikme sabiti | 0.1 |
| p | azalma üssü | 1.1 |

### Båth Yasası (1965)
```
M_aftershock_max ≈ M_mainshock - 1.2
```

### Gutenberg-Richter Yasası
```
log10(N) = a - b*M    (b ≈ 1.0)
```

### Sismik Enerji
```
log10(E) = 5.24 + 1.44 * M
```

---

## Alert Seviyeleri

| Büyüklük | Renk | Etiket |
|----------|------|--------|
| M < 4.0 | `#3DD68C` yeşil | LOW |
| M 4.0–5.5 | `#F5C542` sarı | MODERATE |
| M 5.5–7.0 | `#F5844A` turuncu | HIGH |
| M > 7.0 | `#EF4444` kırmızı | CRITICAL |

---

## Tasarım Sistemi

### Renk Paleti (Oturum 2'de revize edildi)
```css
/* Arka planlar */
--bg-root:    #08080f
--bg-panel:   rgba(13, 12, 26, 0.85)
--bg-card:    rgba(255, 255, 255, 0.03)

/* Akcent — açık lavanta tonu */
--accent:     #AAA5B9    (ana akcent)
--accent-bar: #BEAED5    (barlar, sliderlar, orbital halkalar)
--accent-dim: rgba(138, 114, 177, 0.18)

/* İnce detaylar */
--detail:     #E8D5EF    (nodlar, kıta sınırları)

/* Sınırlar */
--border:     rgba(138, 114, 177, 0.14)
--border-md:  rgba(138, 114, 177, 0.32)

/* Metin */
--text:       #FFFFFF
--text-muted: #E8D5EF
--text-dim:   rgba(232, 213, 239, 0.38)
```

---

## Veri Kaynakları

### USGS FDSN Web Service (global)
```
https://earthquake.usgs.gov/fdsnws/event/1/query
Format: GeoJSON — Erişim: Ücretsiz
```

### Kandilli / AFAD (Türkiye)
```
https://deprem.afad.gov.tr/apiv2/
Şu an: USGS Türkiye bölge filtresi kullanılıyor (Lat: 36–42.5, Lon: 26–45)
```

---

## Çalıştırma

### Frontend
```bash
cd frontend
npm run dev
# http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# http://localhost:8000/docs
```

---

## Şu An Çalışan

### Küre
- [x] Tel kafes küre — parlak
- [x] Kıtalar — 50m detay, küçük adalar dahil
- [x] Otomatik dönüş
- [x] Sol tık sürükleme
- [x] Sağ tık durdur / devam
- [x] Scroll zoom (1.5x – 5.0x)
- [x] Orbital halkalar — küreyle birlikte + kendi ekseninde dönüyor
- [x] Nodlar — beyaz çekirdek, iki katman hale efekti
- [x] Halkalar parlak, hale efektli

### Layout
- [x] MainLayout — navbar + sidebar + küre + detail panel
- [x] Sidebar — 6 protokol listesi
- [x] Detail panel — modül seçince açılıyor, tekrar tıklayınca kapanıyor
- [x] Backdrop blur — paneller yarı saydam, küre arkadan görünüyor

### OMORI Modülü
- [x] Mock veri ile canlı seismik akış
- [x] Gerçek zamanlı grafik (recharts)
- [x] Magnitude filtre slider
- [x] Omori Yasası artçı tahmin paneli
- [x] Båth Yasası maksimum artçı tahmini
- [x] Threat Level widget
- [x] Event listesi

---

## Sıradaki Adımlar

- [ ] OMORI panelini detail panel'e bağla (şu an placeholder var)
- [ ] Renk paletini tüm bileşenlere uygula
- [ ] Küre üzerinde deprem noktaları — OMORI aktifken lat/lon koordinatlarında parlayan noktalar
- [ ] Küre tıklama — bölge seçimi, detail panel o bölgeye filtrelensin
- [ ] Frontend → Backend WebSocket bağlantısı
- [ ] USGS API'den gerçek veri
- [ ] JWT auth sistemi
- [ ] PostgreSQL + TimescaleDB

---

## Önemli Notlar

**Deprem tahmini imkânsızdır.** Sistem kesin tahmin değil, senaryo değerlendirmesi yapar. `OmoriPrediction.jsx` içindeki uyarı kutusu her zaman görünür kalmalı.

**Küre ana yapıdır.** Yeni protokol eklenirken önce küre katmanı tasarlanmalı, sonra detail panel yazılmalı.

**StrictMode kaldırıldı.** `src/main.jsx`'te React StrictMode yok. Production'a geçmeden önce tekrar açılıp test edilmeli.

**Sandbox ağ kısıtlaması:** `earthquake.usgs.gov` Claude sandbox ortamında erişilemiyor. Production sunucusunda sorunsuz çalışacak.

**React bileşen mimarisi:** State `OmoriDashboard.jsx` ve `MainLayout.jsx`'te tutuluyor. Diğer bileşenler prop alıp render ediyor.