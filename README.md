# İhsan Bektaş

Bu repo, `ihsanbektaş.com` sitesinin statik kaynaklarını ve deploy ayarlarını içerir.

## Dosyalar
- `index.html`: Ana sayfa
- `ilanlar.html`: İlan sayfası
- `yatirim-rehberi.html`: Yatırım rehberi sayfası
- `admin.html`: İlan yönetim paneli
- `styles.css`: Responsive tasarım ve UI stilleri
- `script.js`: Harita, filtre ve panel etkileşimleri
- `robots.txt`: Arama motoru yönlendirmesi
- `sitemap.xml`: Site haritası
- `vercel.json`: Vercel yönlendirme ayarları

## Çalışma Şekli
1. Kod değişiklikleri yerelde yapılır.
2. `git commit` ile kaydedilir.
3. `git push` ile GitHub'a gönderilir.
4. Vercel bu repo üzerinden otomatik deploy eder.

## Veri Kaynağı
- İlanlar `data/listings.json` içinde tutulur ve `/api/listings` üzerinden GitHub'a yazılır.
- Public sayfalar ilanları API'den okur, API erişilemezse tarayıcıdaki son yedek veriye düşer.
- Admin paneli yazma işlemleri için server-side oturum kontrolü kullanır.

## Notlar
- İlanların kalıcı kaydı için Vercel ortam değişkenleri gerekir:
  - `GITHUB_OWNER=yimendir`
  - `GITHUB_REPO=ihsanbektas-com`
  - `GITHUB_BRANCH=main`
  - `GITHUB_TOKEN=<repo contents yazma yetkili token>`
- Admin paneli için Vercel ortam değişkenleri gerekir:
  - `ADMIN_PASSWORD=<panel giriş şifresi>`
  - `ADMIN_SESSION_SECRET=<uzun rastgele gizli değer>` (yoksa `GITHUB_TOKEN` oturum imzası için kullanılır)

## Teknik SEO
- Canonical etiketleri tanımlı.
- Open Graph ve Twitter kart etiketleri tanımlı.
- `RealEstateAgent` JSON-LD schema tanımlı.
- `robots.txt` ve `sitemap.xml` bağlı.
