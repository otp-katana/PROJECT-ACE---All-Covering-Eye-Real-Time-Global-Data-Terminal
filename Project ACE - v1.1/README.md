# Project ACE

Project ACE, gerçek zamanlı veri toplayan, protokol bazlı analiz yapan ve karar desteği üreten modüler bir sivil teknoloji platformudur.

Sistemin amacı; afetler, atmosferik olaylar, lojistik akışlar, siber tehditler, jeopolitik krizler ve yörünge/uydu verileri gibi farklı alanları tek bir çatı altında işlemek, frontend'e düzenli bir API sunmak ve ileride makine öğrenmesi ile güçlendirilebilecek bir analiz altyapısı oluşturmaktır.

ACE askeri amaçla değil, insanlık yararına bir veri işleme ve durum farkındalığı platformu olarak tasarlanmıştır.

---

## Projenin ekseni

ACE'in ana ekseni şudur:

- Farklı veri kaynaklarını tek bir mimaride toplamak.
- Veriyi temizlemek, normalize etmek ve anlamlı hale getirmek.
- Gerçek zamanlı olayları izlemek.
- Olaylar için analiz, risk, uyarı ve senaryo üretmek.
- Bunu ileride makine öğrenmesi ile güçlendirmek.

İlk ve öncelikli modül OMORI'dir.
OMORI, sismik olayları izlemek, deprem sonrası olası artçı senaryolarını değerlendirmek ve risk odaklı farkındalık üretmek için kurulur.

Depremin kendisini nokta atışı tahmin etmek amaç değildir; amaç, olası senaryoları değerlendirmek ve karar desteği sağlamaktır.

---

## Neden bu yapı

ACE gibi çok modüllü bir sistemde tek dosyalı veya düz klasörlü bir yapı kısa sürede yetersiz kalır.

Bu proje için modüler yapı seçilmesinin nedeni:
- Protokoller birbirinden bağımsız büyüyecek.
- Her protokolün veri kaynakları farklı olabilir.
- Frontend ile backend arasında kararlı bir API sözleşmesi korunmalı.
- Veri akışı, iş mantığı ve sunum katmanı ayrılmalı.
- Test yazmak kolaylaşmalı.
- Makine öğrenmesi sonradan eklense bile mimari bozulmamalı.

Eğer yapı tek klasörde toplansaydı:
- endpoint'ler birbirine karışırdı,
- veri modelleri dağılırdı,
- ortak kod tekrar ederdi,
- bakım maliyeti artardı,
- yeni protokol eklemek zorlaşırdı.

Bu yüzden ACE bir **modüler monolit** olarak başlatıldı.

---

## Ana klasörlerin görevi

### `app/`
Uygulamanın ana kodunu içerir.

### `app/main.py`
FastAPI uygulamasının giriş noktasıdır.
Burada uygulama oluşturulur ve ana router'lar bağlanır.

### `app/api/`
Dış dünyaya açılan HTTP katmanıdır.

### `app/api/v1/router.py`
API v1 için tüm endpoint gruplarını bir araya getirir.

### `app/api/v1/endpoints/`
Her işlevsel alanın ayrı endpoint dosyasıdır.
Örnek:
- auth,
- seismic,
- weather,
- logistics,
- cyber,
- geopolitics,
- orbital.

### `app/core/`
Uygulamanın çekirdek ayarları burada durur.
- `config.py`: ortam değişkenleri ve uygulama ayarları.
- `logging.py`: log sistemi.
- `security.py`: güvenlik yardımcıları.
- `constants.py`: sabitler.

### `app/db/`
Veritabanı bağlantısı ve migration altyapısı burada tutulur.
- `base.py`: ORM base.
- `session.py`: DB session yönetimi.
- `migrations/`: Alembic migration dosyaları.

### `app/models/`
Kalıcı veritabanı modelleri burada yer alır.
Bu klasör verinin nasıl saklandığını tanımlar.

### `app/schemas/`
API request ve response modelleri burada bulunur.
Bu klasör frontend ile backend arasındaki veri sözleşmesini tanımlar.

### `app/services/`
İş mantığı burada bulunur.
Router ile veritabanı veya protokol kodu arasında karar veren katmandır.

### `app/shared/`
Tüm sistemde ortak kullanılan yardımcılar bu klasördedir.

Burada şu tür şeyler bulunur:
- ortak config,
- ortak exception sınıfları,
- ortak response formatı,
- ortak HTTP client,
- cache client,
- enum'lar,
- zaman/konum yardımcıları.

Bu klasör, tekrar eden kodu azaltmak için vardır.

### `app/protocols/`
ACE'in ana karakteri bu klasördedir.
Her protokol kendi alanına odaklanan bağımsız bir paket gibi düşünülür.

İçindeki protokoller:
- `omori/`: sismik veri ve deprem odaklı analiz.
- `lorenz/`: atmosfer, kaos, termal anomaliler.
- `hadley/`: lojistik, havacılık ve denizcilik telemetrisi.
- `arf/`: siber güvenlik ve yapay zeka tehditleri.
- `herodotus/`: OSINT, jeopolitik ve kriz haritalama.
- `clarke/`: uydu, ISS ve uzay enkazı takibi.

Her protokol kendi içinde şu tip dosyalara sahip olabilir:
- `router.py`
- `schemas.py`
- `service.py`
- `dependencies.py`
- `constants.py`
- `providers/`
- `repositories/`
- `ml/`
- `tests/`
- `README.md`

### `app/realtime/`
Canlı veri akış katmanıdır.
WebSocket veya SSE mantığı burada yaşar.

### `app/ml/`
Protokoller arası ortak makine öğrenmesi altyapısı burada yer alır.
Model kaydı, pipeline, değerlendirme ve deney yönetimi gibi işlerde kullanılabilir.

### `app/utils/`
Genel yardımcı fonksiyonlar burada bulunur.
Küçük ve teknik, ama projede tekrar eden işler buraya taşınır.

### `tests/`
Tüm proje seviyesindeki testler burada yer alır.

---

## Protokol klasör mantığı

Her protokol kendi başına küçük bir sistem gibi düşünülür.

Örneğin OMORI:
- dış veri kaynağından deprem verisi alır,
- normalize eder,
- service katmanında işler,
- gerekirse repository ile saklar,
- frontend'e uygun response üretir,
- daha sonra ML ile güçlendirilir.

Aynı mantık diğer protokoller için de geçerlidir.
Fark sadece veri tipi ve iş kurallarındadır.

---

## Ortak modeller ve şemalar

ACE'de `models/` ile `schemas/` birbirinden bilinçli olarak ayrılmıştır.

### `models/`
Bu klasör, veritabanında saklanan kalıcı nesneleri ifade eder.

### `schemas/`
Bu klasör, API'nin dışa açtığı veri biçimlerini ifade eder.
Request, response ve validation burada tanımlanır.

Bu ayrım önemlidir çünkü:
- veri tabanı modeli değişse bile API sözleşmesi korunabilir,
- frontend daha stabil çalışır,
- güvenlik ve veri gizliliği daha iyi yönetilir.

---

## Shared neden ayrı

`shared/`, ACE içinde tekrar eden ama hiçbir protokole özel olmayan kodu taşır.

Örnek olarak:
- ortak hata sınıfları,
- ortak response formatı,
- ortak tarih ve geo yardımcıları,
- genel HTTP client,
- cache adapter,
- enum tanımları.

Eğer bu kodlar protokol klasörlerine dağıtılsaydı:
- tekrar artardı,
- bakım zorlaşırdı,
- farklı protokoller aynı mantığı kopyalamaya başlardı.

Bu yüzden ortak kod tek bir yerde tutulur.

---

## Daha iyi bir mimari var mı

Evet, teorik olarak iki alternatif daha vardır.

### Mikroservis mimarisi
Her protokol bağımsız servis olabilir.
Bu yaklaşım ölçeklenebilirlik açısından güçlüdür.

Ancak şu aşamada dezavantajları:
- dağıtım karmaşıklığı artar,
- servisler arası iletişim gerekir,
- test ve debug zorlaşır,
- altyapı yükü büyür.

Bu nedenle başlangıç için uygun değildir.

### Tek dosya / düz yapı
Başlangıçta basit görünür ama ACE ölçeğinde kısa sürede dağılır.
Bu yapı yeni protokol eklemeye, test yazmaya ve bakım yapmaya uygun değildir.

Bu yüzden seçilen yapı, iki uç arasında dengeli bir çözümdür: modüler monolit.

---

## Geliştirme önceliği

İlk geliştirme sırası şu olmalıdır:
1. `shared` ve `core`.
2. `models` ve `schemas`.
3. `protocols/omori`.
4. `api/v1/router.py`.
5. `realtime/`.
6. `ml/`.
7. Diğer protokoller.

Bu sıra, önce çalışan bir omurga kurup sonra genişlemeyi sağlar.

---

## Mimari kayıt notu

Bu repo yalnızca kod deposu değildir; aynı zamanda mimari kararların kaydıdır.

Burada verilen yapı bilinçli olarak seçilmiştir:
- büyüme için,
- açıklanabilirlik için,
- sürdürülebilir bakım için,
- veri kaynaklarını ayırmak için,
- frontend entegrasyonunu sabitlemek için.

Yeni bir karar alınırsa, bu README güncellenmeli veya ayrıca bir `docs/adr/` klasörü altında mimari karar kaydı tutulmalıdır.

---

## Son söz

ACE, sadece veri toplayan bir sistem değil; farklı afet ve kriz alanlarını ortak bir zekâ katmanında birleştirmeyi hedefleyen bir platformdur.

İlk sürümün amacı mükemmel olmak değil, sağlam olmaktır.
Sağlam bir omurga kurulduktan sonra her protokol tek tek büyütülebilir.