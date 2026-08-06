1. BÖLÜM
----------------------------------------------

regresyon & sınıflandırma
makine öğrenmesi yöntemlerinden biri

sınıflandırma: bir kategori
regresyon: belli bir aralık içindeki değer

regresyon analiz formülü
y = mx + b

Y: tahmin edilmek istenen şey
x: tahmine etmeye yarayan veriler / m: tahmine etki eden katsayı
b: sabit sayı


Y: otomobil fiyatı
x: fiyatı tahmin etmeye yarayan verileri
m: boya, otomobil paketi, yıl... fiyata etki eden etkenler (katsayı) belirtilen özellik ne kadar etki ediyor sorusunun cevabı denebilir
b: sabit sayı

scatter diyagramı
amaç scatter diyagramında doğruyu bulmak veya oluşturmak

multilineer regresyon
Y = b0 + b1.x1 + ..... bn.xn


Y -- bağımlı değişken
x -- bağımsız değişken
m -- bağımsız değişken katsayısı
b -- hata

----------------------------------------------------

2. BÖLÜM

----------------------------------------------------

pandas ve numpy kütüphanelerini öğrenmek şart.
ardından scikit kütüphanesine geçilecek.

from sklearn.linear_model import LinearRegression

kaggleda regression yazıp dataset bölümünden veri buluyoruz

import pandas ad pd

pd.read_csv("indirilen verinin dosya adı")

bunu kullanmak için bir değişkene atamamız gerekiyor.

değişkenimiz a olsun.

a = pd.read_csv("indirilen verinin dosya adı")


a.head(3)

ilk 3 satırını getiriyoruz verilerin

y = mx + b

neyi tahmni etmek istiyoruz puanı
puanı etkileyen özellikler neler: Öğrencinin sınıf seviyesi, kaç saat çalıştığı.

o halde denklem şuna deniyor,

y = m1.x1 + m2.x2 + b

etkileyen her özellik mn.xn şeklinde eklenir denkleme.

y = a[["Marks"]] y = a'nın içerisindeki marks
x = a[["Number_Courses", "Time_Study"]] 

a.info()
veri hakkında bilgi almak için kullanılır.

bir değişken oluşturalım.

Linear = LinearRegression() şeklinde çalıştırılabilir veya sklearn.linear_model.LinearRegression() şeklinde de çalıştırmak mümkündür.

model = Linear.fit()

fit() öğrenmek anlamına geliyor. öğrenme için kullanılan fonksiyon. model sadece bir değişken.

bu formüldeki bilinmeyen m ve b değerlerini bulacak.

model = Linear.fit(x, y)

sağlamasını yapmak için tahmin ettiriyoruz.

model.predict()

predict()  tahmin etmek anlamına gelir. model.predict() model değişkeniyle öğrenmesini sağladığımız bilgileri tahmin ettiriyoruz.

model.predict([[4, 4]]) 4. sınıfta olan ve 4 saat ders çalışan biri kaç puan alır tahmini yapılıyor.

x değişkenindeki etkileyen özelliklerimiz Sınıf seviyesi ve çalışma saatiydi. tahmin etme fonksiyonunda bu x değerlerini yerleştiriyoruz.

sonuç 21,5 tahminini yaptı.

benzer bir tahmin daha yapalım.

model.predict([[3, 2]])

fonksiyon içinde sıranın önemi vardır. yani 3,2 ile 2,3 aynı şey değildir. 3. sınıf olan ve günlük 2 saat çalışan biri.
kaç puan alacaktır?

tahmin sonucu 8.9

peki varsayalım ki en yüksek puanı bulmak istiyoruz. bu veri biliminin alanına giriyor.

a["Marks"].max()

tahmin sonucu 55.29


model.score() bu score() fonksiyonu modelimizin ne kadar başarılı olduğunu gösteriyor.

modelimiz için bunu uyarladığımızda

model.score(x, y)

0.94 yani %94 başarı oranına sahip olduğunu gösteriyor. fakat bu oran modelin gerçekten %94 oranında güvenilir olduğunu göstermez. arka planda birçok değer başarı oranını etkileyebilir.

ayrıca bu sefer hazır bir veri seti kullandık yani her şey düzenlenmişti. fakat her zaman durum böyle olmayabilir. tekrar veri biliminin alanına gireceğiz ve bu süreçte pre-processing yani bir ön hazırlık yapacağız. bu ön hazırlığın amacı modeli eğitmeden önce düzgün öğrenmesi için verileri düzenlemektir. yanlış verilerle eğitilen bir model istenilen sonuçları vermeyecektir.



Linear = LinearRegression() -- modeli çağırdık

model = Linear.fit(x, y) -- modeli eğittik

model.predict([[4, 10]]) -- tahmin yaptırdık

model.score(x, y) -- modelin başarı değerine baktık

a["Marks"].max() -- max puanı bulduk