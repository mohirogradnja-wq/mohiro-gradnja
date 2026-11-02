# MOHIRO gradnja

Čvrst temelj. Trajno delo.

Landing page za gradnju porodičnih kuća, vikendica i stambenih objekata.

Sajt je jedan `index.html` fajl sa ugrađenim CSS-om i malo JavaScript-a. Nema build koraka ni zavisnosti, samo se okači i radi.

## Struktura

```
mohiro-gradnja/
├── index.html          # ceo sajt
├── CNAME               # domen mohirogradnja.rs za GitHub Pages (ne brisati)
├── assets/
│   ├── logo-mohiro.svg # znak MOHIRO (u headeru i footeru je ugrađen direktno u kod)
│   ├── favicon.svg     # ikonica u tabu pretraživača
│   ├── favicon.png     # ikonica za telefon (početni ekran)
│   ├── radovi/         # fotografije sa gradilišta
│   └── video/          # snimci (hero i galerija) sa naslovnim slikama
└── README.md
```

## Postavljanje na GitHub Pages

1. Na GitHub-u napravite novi repozitorijum, na primer `mohiro-gradnja`.
2. Otpremite SADRŽAJ ovog foldera, ne ceo folder: `index.html` mora biti u korenu repozitorijuma, inače GitHub Pages vraća grešku 404 (dugme "Add file" → "Upload files", ili preko git-a, vidi ispod).
3. U repozitorijumu otvorite Settings → Pages.
4. Pod "Build and deployment" izaberite Source: "Deploy from a branch", grana `main`, folder `/ (root)`, pa Save.
5. Posle minut-dva sajt je dostupan na `https://VASE-KORISNICKO-IME.github.io/mohiro-gradnja/`.

Preko git-a iz terminala:

```bash
cd mohiro-gradnja
git init
git add .
git commit -m "Prva verzija sajta"
git branch -M main
git remote add origin https://github.com/VASE-KORISNICKO-IME/mohiro-gradnja.git
git push -u origin main
```

## Domen mohirogradnja.rs

Domen je registrovan kod Loopie, a DNS vodi Cloudflare (nalog mohiro.gradnja@gmail.com):

- Loopia: DNS serveri su `opal.ns.cloudflare.com` i `randall.ns.cloudflare.com`
- Cloudflare: četiri A zapisa za `@` (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) i CNAME `www` → `mohirogradnja.rs`, svi "DNS only" (siva ikonica oblaka)
- GitHub: fajl `CNAME` u ovom folderu i Settings → Pages → Custom domain `mohirogradnja.rs`, uz uključeno "Enforce HTTPS"

## Šta treba promeniti pre objave

### 1. Forma (Formspree)

1. Napravite besplatan nalog na https://formspree.io i novu formu.
2. Kopirajte adresu forme, izgleda kao `https://formspree.io/f/abcdwxyz`.
3. U `index.html` nađite `YOUR_FORMSPREE_ENDPOINT` i zamenite ga tom adresom.

### 2. Kontakt podaci

Email je mohiro.gradnja@gmail.com. Telefon i radno vreme su privremeni. Nađite i zamenite u `index.html`:

- `+381 60 000 0000` (pojavljuje se dva puta)
- `Ponedeljak do subota, 7 do 17 h`

### 3. Instagram

Svi linkovi ka Instagramu i dalje vode na `@pronadji__majstora__`. Ako MOHIRO ima novi profil, u `index.html` nađite `pronadji__majstora__` i zamenite ga novim korisničkim imenom (pojavljuje se pet puta).

### 4. Fotografije i video

Fotografije i snimci od vlasnika su već na sajtu, u `assets/radovi/` i `assets/video/`.

Za novu fotografiju u galeriji: stavite sliku u `assets/radovi/` (JPG, širine do 1400 px, do 300 KB), pa u `index.html` kopirajte jednu `<article class="card reveal">` karticu i promenite `src`, `alt`, oznaku faze i naslov.

Za drugi video u hero sekciji: zamenite `assets/video/betoniranje-hero.mp4` i naslovnu sliku `betoniranje-hero.jpg` (MP4, H.264, bez zvuka, do 2 MB), pa promenite tekst u kartici ispod videa.

## Spoljni resursi

- Font Inter: Google Fonts
- Font Lato 2.0 (naslovi, puna podrška za Č, Ć, Ž, Š, Đ): jsDelivr, paket `lato-font@3.0.0`

## Boje

- Pozadina: `#f5f2ec`, tekst: `#1d1b18`
- Zlatna iz logotipa: `#c7a663`, tamnija zlatna za tekst na svetloj pozadini: `#8c6d31`
- Tamna (footer, Instagram okvir): `#121212`
