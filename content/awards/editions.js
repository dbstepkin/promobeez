// Promobeez SMM Awards: source data for /promobeez-smm-awards (EN) and /fi/promobeez-smm-awards (FI).
// One edition = one industry + one city + one quarter.
// To publish a new edition: add it to `editions`, move `featured: true` to it, put the photos in
// assets/awards/<slug>/ and run `node scripts/build-awards.js`. The featured edition is rendered on
// the hub page; every other published edition gets its own page at /promobeez-smm-awards/<slug>.

const IMG = '/assets/awards/restaurants-helsinki-2026-q3/';

module.exports = {
  industries: {
    restaurants: { en: 'Restaurants & cafes', fi: 'Ravintolat ja kahvilat' },
  },

  // Announced but not yet published. Shown as disabled chips and "upcoming" cards.
  upcoming: [
    { industry: 'restaurants', city: 'Helsinki', year: 2026, quarter: 4 },
  ],

  editions: [
    {
      slug: 'restaurants-helsinki-2026-q3',
      featured: true,
      industry: 'restaurants',
      city: 'Helsinki',
      cityIn: { en: 'in Helsinki', fi: 'Helsingissä' },
      year: 2026,
      quarter: 3,
      network: 'Instagram',
      dataAsOf: '2026-10-04',
      ogImage: '/assets/blog/helsinki-instagram-awards-2026.png',
      article: {
        en: '/blog/best-restaurant-social-media-helsinki-q3-2026',
        fi: '/fi/blogi/helsingin-paras-ravintola-some-q3-2026',
      },
      stats: [
        { n: 1114, en: 'restaurants and cafes across Helsinki', fi: 'ravintolaa ja kahvilaa eri puolilta Helsinkiä' },
        { n: 509, en: 'Instagram accounts scanned', fi: 'läpikäytyä Instagram-tiliä' },
        { n: 4092, en: 'posts from the last 90 days', fi: 'julkaisua viimeisten 90 päivän ajalta' },
        { n: 246, en: 'accounts qualified and scored', fi: 'tiliä täytti ehdot ja pisteytettiin' },
        { n: 0, en: 'juries, public votes or entry forms', fi: 'raatia, yleisöäänestystä tai hakulomaketta' },
      ],
      overall: {
        name: 'Friends & Brgrs',
        handle: 'friendsandbrgrs',
        site: 'https://www.friendsandbrgrs.fi/',
        credit: 'friendsandbrgrs.fi',
        image: IMG + 'friends-and-brgrs.webp',
        w: 1400, h: 934,
        followers: 19208,
        score: 92.2,
        label: { en: 'Overall winner · Best chain account', fi: 'Kokonaisvoittaja · Paras ketjutili' },
        why: {
          en: 'The highest score of all 246 accounts. A typical photo post draws 5.7% of its 19,000 followers, 13 times what the city curve predicts for an account of that size, and it posts three times a week.',
          fi: 'Korkeimmat pisteet kaikista 246 tilistä. Tyypillinen kuvajulkaisu saa reaktion 5,7 prosentilta tilin 19 000 seuraajasta, 13 kertaa enemmän kuin kaupungin käyrä ennustaa tuon kokoiselle tilille, ja tili julkaisee kolmesti viikossa.',
        },
      },
      categoriesTitle: { en: 'The five district winners', fi: 'Viisi aluevoittajaa' },
      categoriesIntro: {
        en: 'Helsinki is split into five zones and each has one winner: the local venue whose Instagram earns the strongest and steadiest response from its own audience. The ring shows the score out of 100.',
        fi: 'Helsinki on jaettu viiteen alueeseen, ja jokaisella on yksi voittaja: paikallinen ravintola, jonka Instagram saa omalta yleisöltään vahvimman ja tasaisimman reaktion. Rengas näyttää pisteet sadasta.',
      },
      winners: [
        {
          category: { en: 'City Centre', fi: 'Ydinkeskusta' },
          name: { en: 'Savoy', fi: 'Savoy' },
          handle: 'savoyhelsinki',
          site: 'https://savoyhelsinki.fi/',
          credit: 'savoyhelsinki.fi',
          image: IMG + 'savoy.webp', w: 1000, h: 554,
          followers: 11236,
          score: 91.2,
          why: {
            en: "Highest score among Helsinki's local restaurants. A fine-dining classic whose typical photo post draws 3.2% of its followers, 6.6 times the norm for an account of its size.",
            fi: 'Helsingin paikallisten ravintoloiden korkeimmat pisteet. Fine dining -klassikko, jonka tyypillinen kuvajulkaisu saa reaktion 3,2 prosentilta seuraajista: 6,6 kertaa enemmän kuin tuon kokoisella tilillä on tavallista.',
          },
        },
        {
          category: { en: 'East Helsinki', fi: 'Itä-Helsinki' },
          name: { en: 'Villa Severino', fi: 'Villa Severino' },
          handle: 'villa_severino_finland',
          site: 'https://www.villaseverino.fi/',
          credit: 'villaseverino.fi',
          image: IMG + 'villa-severino.webp', w: 680, h: 851,
          followers: 3885,
          score: 90.7,
          why: {
            en: 'Photos land at 4.2 times and Reels at 4.5 times the size norm, with no giveaway posts in the window and one of the steadiest feeds among the winners.',
            fi: 'Kuvat keräävät 4,2-kertaisen ja Reels-videot 4,5-kertaisen sitoutumisen kokoluokkaan nähden. Ei yhtään arvontaa jaksolla, ja voittajista tasaisimpia syötteitä.',
          },
        },
        {
          category: { en: 'West & Northwest Helsinki', fi: 'Länsi ja luode' },
          name: { en: 'Restaurant Elite', fi: 'Ravintola Elite' },
          handle: 'ravintolaelite',
          site: 'https://elite.fi/',
          credit: 'elite.fi',
          image: IMG + 'elite.webp', w: 1000, h: 562,
          followers: 3699,
          score: 89.1,
          why: {
            en: 'A classic Töölö restaurant with engagement 2.9 times the norm for its size, posted more than twice a week with few weak posts.',
            fi: 'Töölöläinen klassikko, jonka sitoutuminen on 2,9-kertainen kokoluokan tasoon nähden. Julkaisee yli kahdesti viikossa, ja heikkoja julkaisuja on vähän.',
          },
        },
        {
          category: { en: 'South Central', fi: 'Eteläinen kantakaupunki' },
          name: { en: 'Helkatti Cat Cafe', fi: 'Helkatti Cat Cafe' },
          handle: 'catcafehelkatti',
          site: 'https://helkatti.fi/',
          credit: 'helkatti.fi',
          image: IMG + 'helkatti.webp', w: 1000, h: 667,
          followers: 13084,
          score: 85.5,
          why: {
            en: '13,000 followers and still 3.4 times the photo engagement expected at that size, with one of the most even feeds in the city. It takes the most competitive zone by 0.3 points.',
            fi: '13 000 seuraajaa, ja silti kuvien sitoutuminen on 3,4-kertainen siihen nähden, mitä tuon kokoiselta tililtä odottaisi. Yksi kaupungin tasaisimmista syötteistä. Voittaa kilpailluimman alueen 0,3 pisteellä.',
          },
        },
        {
          category: { en: 'Kallio & North Central', fi: 'Kallio ja pohjoinen kantakaupunki' },
          name: { en: 'Oljenkorsi', fi: 'Oljenkorsi' },
          handle: 'baroljenkorsi',
          site: 'https://www.oljenkorsi.fi/',
          credit: 'oljenkorsi.fi',
          image: IMG + 'oljenkorsi.webp', w: 900, h: 1350,
          followers: 1523,
          score: 84.7,
          why: {
            en: 'The smallest winner at 1,500 followers. Its Reels reach 5.4% of followers, 4.3 times what accounts of its size typically get.',
            fi: 'Voittajista pienin, 1 500 seuraajaa. Reels-videot saavat reaktion 5,4 prosentilta seuraajista, 4,3 kertaa enemmän kuin samankokoisilla tileillä yleensä.',
          },
        },
      ],
      special: {
        label: { en: 'Special award', fi: 'Erikoispalkinto' },
        title: { en: 'The Quiet Climb', fi: 'Hiljainen nousu' },
        name: 'Ekeko Restobar',
        handle: 'ekeko_restobar',
        site: 'https://www.ekeko.fi/',
        followers: 1182,
        stat: { en: '×4.1', fi: '×4,1' },
        statLabel: { en: 'engagement growth in 90 days, no giveaways', fi: 'sitoutumisen kasvu 90 päivässä, ilman arvontoja' },
        text: {
          en: 'For the account that got better while we were watching. A small restaurant in Sörnäinen whose steady engagement rate went from 0.91% in the first half of the window to 3.72% in the second, with no giveaways and no single post carrying the result.',
          fi: 'Tilille, joka parani silmiemme edessä. Pieni sörnäisläinen ravintola, jonka vakaa sitoutumisaste nousi jakson alkupuoliskon 0,91 prosentista loppupuoliskon 3,72 prosenttiin ilman arvontoja ja ilman, että yksi julkaisu kantaisi tulosta.',
        },
      },
      approach: {
        en: 'Every restaurant and cafe found on Google Maps whose website links its own public Instagram is measured automatically. In Helsinki that meant 1,114 venues, 509 accounts and 4,092 posts from the 90 days to 4 October 2026.',
        fi: 'Jokainen Google Mapsista löytynyt ravintola ja kahvila, jonka verkkosivuilta on linkki sen omaan julkiseen Instagram-tiliin, mitataan automaattisesti. Helsingissä se tarkoitti 1 114 ravintolaa, 509 tiliä ja 4 092 julkaisua 90 päivän ajalta 4.10.2026 asti.',
      },
    },
  ],
};
