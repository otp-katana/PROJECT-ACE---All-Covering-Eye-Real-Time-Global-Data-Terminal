# Project ACE — Durum Özeti (v2)

## Proje Amacı ve Teknolojiler

Project ACE: Gerçek zamanlı afet/doğal olay izleme platformu. Palantir Gotham/Horus Eye'dan ilham, sivil amaçlı (askeri değil). Geliştirici orta düzey Python bilgisine sahip, ML alanında öğreniyor, kod yazdırmak değil birlikte öğrenerek inşa etmek istiyor — her adım açıklanarak, parça parça ilerleniyor.

**Stack:**
```
Frontend: Node.js v24, Vite v8, React, recharts, three.js,
          topojson-client, d3-geo, world-atlas
Backend:  Python 3.12, FastAPI, uvicorn, httpx, pydantic v2, numpy/scipy
          (artık AKTİF — USGS canlı veri bağlantısı çalışıyor)
```

Proje kökü (Windows): `C:\Users\nobq0\OneDrive\Masaüstü\Project ACE - v1.1`
Klasörler: `frontend/`, `backend/`, `docs/`

---

## Mimari Karar: Modüler Monolit

6 protokol (modül) planlanıyor, her biri ileride ML ile güçlendirilecek:

| Modül | Alan | Durum |
|---|---|---|
| **OMORI** | Sismik aktivite | 🟢 Aktif geliştiriliyor, canlı veri bağlı |
| LORENZ | Atmosfer/kaos | ⚪ Planlandı |
| HADLEY | Lojistik/havacılık | ⚪ Planlandı |
| ARF | Siber güvenlik | ⚪ Planlandı |
| HERODOTUS | OSINT/jeopolitik | ⚪ Planlandı |
| CLARKE | Uydu/orbital | ⚪ Planlandı |

Backend'de her protokolün kendi `providers/`, `repositories/`, `ml/`, `tests/` klasörleri var — bu iskelet **tüm 6 modül için önceden kurulmuş durumda** (dosyalar boş ama yapı hazır). `core/` (config, logging) ve `shared/` (protokoller arası ortak kod) ayrımı bilinçli.

---

## KRİTİK MİMARİ KARAR: Küre Merkezi Yapı (değişmedi)

Küre süs değil — sistemin kendisi. Modüller küreye "katman" olarak bindirilir.

---

## Frontend — Tamamlanan Özellikler

### Küre (useGlobe.js + Globe.jsx)
- Tel kafes küre, kıtalar (world-atlas'tan), 3 orbital halka + nod'lar
- Mouse etkileşimi: sol tık+sürükle döndürme, sağ tık auto-rotate durdur/başlat, scroll zoom
- **Orbital halkaların görünürlüğü artık toggle edilebilir** (navbar'da buton, ileride CLARKE modülüne taşınacak)

### Katman Sistemi (Toggle Mimarisi)
State MainLayout.jsx'te merkezi tutuluyor, prop-passing ile Globe ve OmoriPanel'e dağıtılıyor (Context henüz kurulmadı — 2. modül eklenince tekrar değerlendirilecek).

- **Seismic**: nokta + iki kat halo (nod/hale deseni), büyüklüğe göre ölçekleniyor — **artık canlı USGS verisiyle besleniyor**
- **Volcanic**: koni + halo (küre yüzeyinden fışkırma efekti, `quaternion.setFromUnitVectors` ile normal hizalama) — şu an mock veri
- **Faults**: çizgi tabanlı fay hatları (`THREE.Line`) — şu an mock veri, **renk ayrımı sorunu var** (diğer katmanlarla çok benzer mor tonda, ayırt etmek zor — ileride çözülecek)

Tüm katmanlarda ortak teknik pratik: `depthWrite: false` (saydam nesnelerin arkasındaki çizgileri/detayları gizlememesi için).

### Raycaster ve Etkileşim
- Küre üzerindeki noktalara tıklanabiliyor (`userData` ile her nokta grubuna `{ type, lat, lon, mag }` etiketlendi)
- Hover sırasında imleç `pointer`'a dönüyor (noktalarla etkileşim mümkün olduğunu gösteriyor)
- **Tıklandığında küre donuyor** (rotasyon + drag + zoom devre dışı, `frozen` ref ile kontrol ediliyor) — sağ tık dahil tüm etkileşimler doğru şekilde bloklanıyor
- Panel kapatıldığında küre **kaldığı durumdan** (dönüyorsa dönmeye, duruyorsa durmaya) devam ediyor

### Sağ Detay Paneli
- Modül paneliyle birebir aynı stil/boyut, sağda sabit konumda
- Şu an sadece lat/lon/magnitude gösteriyor — Omori/Båth hesaplamaları (eski `utils.js`'te mevcut: `omoriPredict()`, `gutenbergRichter()`) henüz bağlanmadı

### OMORI Panel
- Core Dynamics / Post-Event / Cassandra AI üç ana kategori, accordion mantığı
- Toggle state artık MainLayout'tan geliyor (local state kaldırıldı)

---

## Backend — Yeni Kurulan Kısım

Bu oturumda **sıfırdan** kuruldu (önceki iskelet tamamen boştu):

```
backend/
├── requirements.txt          → fastapi, uvicorn, httpx, pydantic
├── app/
│   ├── main.py                → FastAPI app, CORS middleware, router bağlantısı
│   └── protocols/omori/
│       ├── schemas.py         → SeismicEvent (lat, lon, mag, place, time)
│       ├── providers/usgs.py  → USGS significant_month.geojson'dan veri çekip normalize ediyor
│       ├── service.py         → get_seismic_events() — ileride çoklu kaynak birleştirme burada olacak
│       └── router.py          → GET /api/omori/events
```

**Çalışan endpoint:** `http://localhost:8000/api/omori/events` — USGS'ten canlı, önemli (M4.5+) depremleri JSON olarak döndürüyor.

**CORS:** `localhost:5173` (Vite) için açık.

**Frontend bağlantısı:** `useGlobe.js`'teki seismic `useEffect`'i artık mock array yerine `fetch()` ile bu endpoint'i çağırıyor. Mock veri (`MOCK_QUAKES`) tamamen silindi. `MOCK_VOLCANOES` ve `MOCK_FAULTS` henüz duruyor — karşılık gelen gerçek API/veri kaynağı bulunana kadar.

---

## Bilinen Eksikler / Sonraki Adımlar

1. **Volkan verisi için gerçek kaynak** — USGS'in ayrı bir Volcano Hazards Program API'si araştırılacak
2. **Fay hatları için gerçek kaynak** — muhtemelen statik bir GeoJSON veri seti (örn. GEM Global Active Faults) gerekecek, gerçek zamanlı bir API değil
3. **Faults renk ayrımı** — mevcut mor tonu diğer katmanlarla karışıyor, palet içi ayrım veya bilinçli karşıt renk değerlendirilecek
4. **EMSC/AFAD entegrasyonu** — planlanan çoklu kaynak stratejisinin geri kalanı (Türkiye'ye özel hız/detay için)
5. **Polling/otomatik yenileme** — şu an veri statik çekiliyor (sayfa yüklendiğinde/toggle açıldığında), periyodik yenileme henüz yok
6. **`significant_month` feed'in genişletilmesi** — şu an sadece "significant" depremler gösteriliyor, `all_day` gibi daha kapsamlı bir feed değerlendirilebilir
7. **Detay panelinin zenginleştirilmesi** — Omori/Båth hesaplamalarının sağ panele bağlanması
8. **Sonraki modül** — OMORI belirli bir olgunluğa ulaştı, LORENZ'e başlamak için referans model olarak kullanılabilir

---

## Öğrenilen Teknik Dersler (bu oturumdan)

- React `useRef` ile tutulan değişkenler silinip yeniden eklenirken satır kayması, sessizce (hata mesajı gecikmeli görünen) render loop çökmesine yol açabiliyor — dikkatli kontrol gerekiyor
- Saydam Three.js materyallerinde `depthWrite: false` unutulursa, arkadaki ince detaylar (çizgiler, kıta sınırları) görsel olarak "yenmiş" gibi kayboluyor
- `frozen`/donma gibi state'leri tüm etkileşim handler'larına (sol tık, sağ tık, wheel, hover) tek tek eklemek gerekiyor — birini atlamak (bu oturumda `onContextMenu`) tutarsız davranışa yol açıyor