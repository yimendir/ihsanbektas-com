# İhsan Bektaş - SEO Odakli Tanitim Sitesi

Bu proje, yerel bolgeye hitap eden SEO odakli emlak tanitim sitesi iskeletidir.

## Dosyalar
- `index.html`: Ana sayfa (daha kisa, odakli landing deneyimi)
- `ilanlar.html`: Ayrı ilan sayfasi (harita, filtre ve kart-pin senkronizasyonu)
- `yatirim-rehberi.html`: Blog tarzı yatırım rehberi (mahalle bazlı içerik + resmi kaynak linkleri)
- `styles.css`: Responsive tasarim + animasyonlar + UI stilleri
- `script.js`: Scroll animasyonlari, sayaçlar, harita ve AI chat etkileşimi
- `robots.txt`: Arama motoru yonlendirmesi
- `sitemap.xml`: Site haritasi

## Yeni Arayuz Bilesenleri
- Hero alani: animasyonlu metrik kartlari
- Basari Hikayeleri: sosyal kanit kartlari
- Harita bolumu: ilce filtresi + ilan pinleri + kart-pin senkronizasyonu
- Harita popup: tek tikla tam ekran harita (ESC veya overlay tik ile kapanir)
- Ilan katalogu: net kart gorunumu + mini filtre (ilce ve tur)
- AI Asistan (demo): ziyaretci sorularina hizli cevap arayuzu
- Yatırım Rehberi: Babaeski ve Lüleburgaz mahalle kartlari + TrakyaKA / belediye kaynaklari

## Harita Ilan Verisi
- Ornek ilanlar `script.js` icindeki `sampleListings` dizisinde tutulur.
- Her ilan icin su alanlar vardir: `id`, `district`, `type`, `title`, `price`, `size`, `area`, `summary`, `image`, `coords`.
- `coords` alani `[enlem, boylam]` formatindadir.
- `image` alanina gorsel URL'i yazildiginda kartta dogrudan fotograf gosterilir.
- Ilce filtreleri `districtViews` ve butonlardaki `data-district` degerleri ile eslesir.

## Yayin Oncesi Zorunlu Duzenlemeler
`index.html` ve `ilanlar.html` icinde su placeholder alanlarini gercek degerlerle degistirin:
- `ornekdomain.com` alan adlari
- `+90 5XX XXX XX XX` telefon numarasi
- `info@ornekdomain.com` e-posta ve sosyal medya linkleri
- Sosyal medya linkleri
- Profil fotografinizi `assets/ihsan-bektas.jpg` olarak ekleyin

## Teknik SEO Notlari
- Canonical etiketi tanimli.
- Open Graph ve Twitter kart etiketleri tanimli.
- `RealEstateAgent` JSON-LD schema tanimli.
- `robots.txt` ve `sitemap.xml` baglantili.
- Basliklar (`h1`, `h2`) ve icerik hiyerarsisi SEO uyumlu.

## Hizli Yerel SEO Guclendirme
- Google Business Profile olusturup ad, adres, telefon (NAP) bilgisini siteyle birebir ayni tutun.
- Kırklareli geneli icin ilce bazli landing sayfalari acin (ornek: `/babaeski-satilik-daire`, `/luleburgaz-kiralik-daire`).
- Musteri yorumlarini ve portfoy guncellemelerini haftalik yayinlayin.
- Sayfa gorsellerini WebP formatinda ve `alt` metinlerle kullanin.
