# Reuvra Music

Minimalist AI müzik platformu başlangıç projesi.

## Gereksinimler
- Node.js 18 veya üzeri

## Yerelde çalıştırma
1. Proje klasöründe terminal açın.
2. `npm start` komutunu çalıştırın.
3. Tarayıcıda `http://localhost:3000` adresini açın.

Bu sürüm arayüzü ve temel Node.js sunucusunu içerir. Gerçek şarkı üretimi henüz etkin değildir. Bunun için bir AI müzik üretim sağlayıcısı seçilip sunucu tarafında API adaptörü eklenmelidir.

## Render
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: boş bırakılabilir (dosyalar depo kökündeyse)

## Güvenlik
API anahtarlarını yalnızca Render Environment veya yerel `.env` gibi sunucu ortam değişkenlerinde saklayın. `.env` dosyasını GitHub'a yüklemeyin.


## AI Cover Studio
Başlangıç arayüzünde ses dosyası seçimi ve kaynak bağlantısı alanları bulunur. Sunucu şu anda dosya içeriğini üçüncü tarafa aktarmıyor; yalnızca kaynak metaverisini doğrulama için alır. Gerçek cover için:
- Dosya yükleme/depolama akışı,
- Kaynak bağlantısı sağlayıcı şartlarına uygun içe aktarma,
- Söz ve ana melodiyi korumayı destekleyen yetkili AI cover sağlayıcısı,
- Telif/izin kontrolleri
ayrıca uygulanmalıdır. Sağlayıcı seçilmeden cover üretimi aktif değildir.
