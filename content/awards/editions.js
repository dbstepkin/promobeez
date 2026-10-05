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
        { n: 0, en: 'juries, public votes or entry forms', fi: 'raatia, yleisöäänestystä tai ehdolle asettumista' },
      ],
      overall: {
        name: 'Friends & Brgrs',
        handle: 'friendsandbrgrs',
        address: { en: 'Several restaurants in Helsinki, from Mikonkatu to Tripla, Redi and Itis', fi: 'Useita ravintoloita Helsingissä Mikonkadulta Triplaan, Rediin ja Itikseen' },
        about: {
          en: 'Founded in 2014 in Pietarsaari by six burger-loving friends. The chain makes its burgers from fresh Finnish ingredients and works directly with Finnish food producers.',
          fi: 'Kuusi burgereita rakastavaa ystävää perusti ketjun Pietarsaaressa vuonna 2014. Burgerit tehdään tuoreista kotimaisista raaka-aineista, ja ketju tekee töitä suoraan suomalaisten ruoantuottajien kanssa.',
        },
        site: 'https://www.friendsandbrgrs.fi/',
        credit: 'friendsandbrgrs.fi',
        image: IMG + 'friends-and-brgrs.webp',
        w: 1400, h: 934,
        followers: 19208,
        score: 92.2,
        label: { en: 'Overall winner · Best chain account', fi: 'Kokonaisvoittaja · Paras ketjutili' },
        why: {
          en: 'The highest score in Helsinki this quarter. A typical photo post draws 5.7% of its 19,000 followers, and it posts three times a week.',
          fi: 'Neljänneksen korkeimmat pisteet Helsingissä. Tyypillinen kuvajulkaisu saa reaktion 5,7 prosentilta tilin 19 000 seuraajasta, ja tili julkaisee kolmesti viikossa.',
        },
      },
      categoryLabel: { en: 'District winner', fi: 'Aluevoittaja' },
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
          address: 'Eteläesplanadi 14, Helsinki',
          about: {
            en: "Overlooking Esplanadi park, Savoy has served guests for more than 85 years. Chef patron Helena Puolakka's kitchen is Finnish-French and strictly seasonal, with herbs from the restaurant's own terrace garden and honey from its rooftop bees.",
            fi: 'Esplanadin puistoon katsova Savoy on palvellut vieraitaan yli 85 vuotta. Chef Patron Helena Puolakan keittiö on suomalais-ranskalainen ja tiukasti sesongin mukainen: yrtit kasvavat ravintolan omalla terassilla ja hunaja tulee katon mehiläisiltä.',
          },
          site: 'https://savoyhelsinki.fi/',
          credit: 'savoyhelsinki.fi',
          image: IMG + 'savoy.webp', w: 1400, h: 775,
          followers: 11236,
          score: 91.2,
          why: {
            en: "Highest score among Helsinki's local restaurants. A fine-dining classic whose typical photo post draws 3.2% of its followers, 6.6 times the norm for an account of its size.",
            fi: 'Helsingin paikallisten ravintoloiden korkeimmat pisteet. Fine dining -klassikko, jonka tyypillinen kuvajulkaisu saa reaktion 3,2 prosentilta seuraajista: 6,6 kertaa enemmän kuin tämän kokoisella tilillä on tavallista.',
          },
        },
        {
          category: { en: 'East Helsinki', fi: 'Itä-Helsinki' },
          name: { en: 'Villa Severino', fi: 'Villa Severino' },
          handle: 'villa_severino_finland',
          address: 'Tatti 17, 00760 Helsinki',
          about: {
            en: 'Neapolitan cooking at the Helsinki Outlet: pizza made with care from quality ingredients, classic dishes by Naples-born chef Carmen, and her own natural Carmen Luna gelato.',
            fi: 'Napolilaista keittiötä Helsinki Outletissa: huolella tehtyä pizzaa laadukkaista raaka-aineista, Napolista kotoisin olevan Carmenin klassikkoannoksia ja hänen oma Carmen Luna -artesaanigelatonsa.',
          },
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
          address: 'Eteläinen Hesperiankatu 22, 00100 Helsinki',
          about: {
            en: "A culture and artists' restaurant in Töölö since 1932. Actors, musicians and writers made it their living room, and you can still sit at actor Tauno Palo's regular table and order his creamy onion steak.",
            fi: 'Kulttuuri- ja taiteilijaravintola Töölössä vuodesta 1932. Näyttelijät, muusikot ja kirjailijat tekivät siitä olohuoneensa, ja Tauno Palon kantapöydässä voi yhä tilata hänen kermaisen sipulipihvinsä.',
          },
          site: 'https://elite.fi/',
          credit: 'elite.fi',
          image: IMG + 'elite.webp', w: 1400, h: 788,
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
          address: 'Fredrikinkatu 55, 00100 Helsinki',
          about: {
            en: 'A cat cafe in Kamppi where the resident cats run the house. Guests come, preferably by reservation, for cakes baked on site, savoury dishes and cat company. There are quiz nights, private parties and even overnight stays.',
            fi: 'Kampissa sijaitseva kissakahvila, jossa talon kissat ovat pomoja. Vieraat tulevat, mieluiten ajanvarauksella, nauttimaan paikan päällä leivotuista kakuista, suolaisista annoksista ja kissojen seurasta. Ohjelmassa on tietovisoja, yksityistilaisuuksia ja jopa yöpymisiä.',
          },
          site: 'https://helkatti.fi/',
          credit: 'helkatti.fi',
          image: IMG + 'helkatti.webp', w: 1400, h: 933,
          followers: 13084,
          score: 85.5,
          why: {
            en: '13,000 followers and still 3.4 times the photo engagement expected at that size, with one of the most even feeds in the city. It takes the most competitive zone by 0.3 points.',
            fi: '13 000 seuraajaa, ja silti kuvien sitoutuminen on 3,4-kertainen siihen nähden, mitä tämän kokoiselta tililtä odottaisi. Yksi kaupungin tasaisimmista syötteistä. Voittaa kilpailluimman alueen 0,3 pisteellä.',
          },
        },
        {
          category: { en: 'Kallio & North Central', fi: 'Kallio ja pohjoinen kantakaupunki' },
          name: { en: 'Oljenkorsi', fi: 'Oljenkorsi' },
          handle: 'baroljenkorsi',
          address: 'Intiankatu 18, 00560 Helsinki',
          about: {
            en: 'An atmospheric village bar in the heart of Toukola, close to Kumpula and Arabia. Frequently changing draught beers, about 120 bottled beers from Finland and the world, and a pub quiz every Tuesday.',
            fi: 'Tunnelmallinen kyläbaari Toukolan sydämessä, Kumpulan ja Arabian lähellä. Tiheään vaihtuvat hanaoluet, noin 120 pullo-olutta Suomesta ja maailmalta sekä tietovisa joka tiistai.',
          },
          site: 'https://www.oljenkorsi.fi/',
          credit: 'oljenkorsi.fi',
          image: IMG + 'oljenkorsi.webp', w: 1100, h: 1650,
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
        title: { en: 'The Quiet Climb', fi: 'Hiljainen nousija' },
        name: 'Ekeko Restobar',
        handle: 'ekeko_restobar',
        address: 'Vilhonvuorenkatu 3 L1, 00500 Helsinki',
        about: {
          en: 'A Latin American restobar in Sörnäinen, named after the Andean god of abundance and good fortune. Classic flavours from across Latin America in a warm, generous setting.',
          fi: 'Latinalaisamerikkalainen restobar Sörnäisissä, nimetty Andien yltäkylläisyyden ja onnen jumalan mukaan. Klassisia makuja eri puolilta Latinalaista Amerikkaa lämpimässä, runsaassa tunnelmassa.',
        },
        site: 'https://www.ekeko.fi/',
        credit: 'ekeko.fi',
        image: IMG + 'ekeko.webp',
        w: 1024, h: 1024,
        followers: 1182,
        stat: { en: '×4.1', fi: '×4,1' },
        statLabel: { en: 'engagement growth in 90 days, no giveaways', fi: 'sitoutumisen kasvu 90 päivässä, ilman arvontoja' },
        text: {
          en: 'For the account that got better while we were watching. A small restaurant in Sörnäinen whose steady engagement rate went from 0.91% in the first half of the window to 3.72% in the second, with no giveaways and no single post carrying the result.',
          fi: 'Tili, joka parani silmiemme edessä. Pieni ravintola Sörnäisissä, jonka vakaa sitoutumisaste nousi jakson alkupuoliskon 0,91 prosentista loppupuoliskon 3,72 prosenttiin ilman arvontoja ja ilman, että tulos perustuisi vain yhden julkaisun menestykseen.',
        },
      },
      approach: {
        en: 'Every restaurant and cafe found on Google Maps whose website links its own public Instagram is measured automatically. In Helsinki that meant 1,114 venues, 509 accounts and 4,092 posts from the 90 days to 4 October 2026.',
        fi: 'Jokainen Google Mapsista löytynyt ravintola ja kahvila, jonka verkkosivuilta on linkki sen omaan julkiseen Instagram-tiliin, mitataan automaattisesti. Helsingissä se tarkoitti 1 114 ravintolaa, 509 tiliä ja 4 092 julkaisua 90 päivän ajalta 4.10.2026 asti.',
      },
    },
  ],
};
