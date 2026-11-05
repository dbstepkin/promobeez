"""Copy for the industry landing pages (EN, FI, IT). Used by build-vertical-pages.py.

Keep claims to what the product does today (see product/customer-journey.md) and current pricing.
REAL is the real offer with the most creator applications in each category (from Supabase, 2026-10-23);
no application counts and no business names on the page.
"""

VERTICALS = ['restaurants', 'cafes', 'salons', 'gyms']

SLUGS = {
    'en': {
        'restaurants': 'influencer-marketing-for-restaurants',
        'cafes': 'influencer-marketing-for-cafes',
        'salons': 'influencer-marketing-for-salons',
        'gyms': 'influencer-marketing-for-gyms',
    },
    'fi': {
        'restaurants': 'vaikuttajamarkkinointi-ravintolalle',
        'cafes': 'vaikuttajamarkkinointi-kahvilalle',
        'salons': 'vaikuttajamarkkinointi-kampaamolle',
        'gyms': 'vaikuttajamarkkinointi-kuntosalille',
    },
}

NAMES = {
    'en': {'restaurants': 'Restaurants', 'cafes': 'Cafés', 'salons': 'Hair & beauty salons', 'gyms': 'Gyms & studios'},
    'fi': {'restaurants': 'Ravintolat', 'cafes': 'Kahvilat', 'salons': 'Kampaamot ja kauneushoitolat', 'gyms': 'Kuntosalit ja studiot'},
}

COMMON = {
    'en': {
        'cta_btn': 'Post your first offer →',
        'steps_h': 'How it works',
        'real_h': 'A real offer that worked',
        'real_lead': 'Of all {cat} offers posted on Promobeez so far, this one got the most applications from creators.',
        'real_get': 'What you get',
        'real_content': 'Content in return',
        'real_who': 'Who it is for',
        'real_posted': 'Posted',
        'real_hidden': 'Name hidden',
        'real_badge': 'Real offer',
        'real_barter': 'Barter',
        'real_cta': 'Post an offer like this →',
        'faq_h': 'Frequently asked questions',
        'read_h': 'Read next',
        'other_h': 'Other industries',
        'step': 'Step',
        'crumb_home': 'Home',
        'crumb_biz': 'For businesses',
        'biz_path': '/for-businesses',
        'eyebrow_prefix': 'For',
        'price_q': 'How much does it cost?',
        'price_a': 'The campaign costs what your offer costs you. <span data-growth-trial>New businesses get 14 days of Growth free. After that: </span>(almost) Free is €15 once for one offer and three contact unlocks, refunded in one click if the offer gets fewer than three applications in 14 days. Starter is €69 a month and Growth €109 a month. No commission on collaborations while you are on a paid plan.',
    },
    'fi': {
        'cta_btn': 'Julkaise ensimmäinen tarjous →',
        'steps_h': 'Miten se toimii',
        'real_h': 'Oikea tarjous, joka toimi',
        'real_lead': 'Kaikista Promobeezissa tähän mennessä julkaistuista {cat} tarjouksista tämä keräsi eniten hakemuksia tuottajilta.',
        'real_get': 'Mitä saat',
        'real_content': 'Sisältö vastineeksi',
        'real_who': 'Kenelle',
        'real_posted': 'Julkaistu',
        'real_hidden': 'Nimi piilotettu',
        'real_badge': 'Oikea tarjous',
        'real_barter': 'Vaihtokauppa',
        'real_cta': 'Julkaise samanlainen tarjous →',
        'faq_h': 'Usein kysytyt kysymykset',
        'read_h': 'Lue seuraavaksi',
        'other_h': 'Muut toimialat',
        'step': 'Vaihe',
        'crumb_home': 'Koti',
        'crumb_biz': 'Yrityksille',
        'biz_path': '/fi/yrityksille',
        'eyebrow_prefix': '',
        'price_q': 'Paljonko se maksaa?',
        'price_a': 'Kampanja maksaa sen, mitä tarjouksesi sinulle maksaa. <span data-growth-trial>Uudet yritykset saavat 14 päivää Growth-tasoa ilmaiseksi. Sen jälkeen: </span>(lähes) Free maksaa kerran 15 € yhdestä tarjouksesta ja kolmesta yhteystiedon avauksesta, ja saat rahat takaisin yhdellä klikkauksella, jos tarjous saa alle kolme hakemusta 14 päivässä. Starter maksaa 69 € ja Growth 109 € kuukaudessa. Maksullisilla tilauksilla emme ota provisiota yhteistöistä.',
    },
}

PAGES = {
    # ---------------------------------------------------------------- restaurants
    ('en', 'restaurants'): {
        'title': 'Influencer marketing for restaurants in Helsinki, paid in meals | Promobeez',
        'desc': 'Local food creators visit your restaurant and post about it in return for a meal. Post an offer, pick creators by how local their audience is, and pay no agency fee. From €15.',
        'h1': 'Influencer marketing for <em>restaurants</em>',
        'lede': 'Fill quiet evenings with guests who saw you on a local creator\'s feed. You give a dinner, they give a reel and stories to an audience that lives in your city.',
        'why_h': 'Why restaurants use barter collabs',
        'why_lead': 'A restaurant is an experience, so the best ad for it is someone eating there. Local food creators show the room, the plate and the queue to people who can come tonight.',
        'why': [
            ('i-pin', 'Guests from your area', 'Creator cards show where the audience is. Pick people whose followers live in Helsinki, Espoo or Vantaa, not abroad.'),
            ('i-euro', 'Food cost, not media budget', 'A dinner for two costs you its food cost. There is no agency fee and no commission on the collab on paid plans.'),
            ('i-timer', 'Fill the slow days', 'Book creator visits for Monday to Wednesday evenings or a new lunch menu, when an extra table matters most.'),
            ('i-camera', 'Content you can reuse', 'Ask the creator to tag you and agree whether you may repost the video on your own account.'),
        ],
        'steps': [
            ('Post the offer', '"Dinner for two → 1 reel + 2 stories." Choose the days that suit you and who you are looking for.'),
            ('Pick local food creators', 'Creators apply. You see reach, engagement and where their audience lives before you unlock anyone.'),
            ('Host the visit', 'Unlock the contact, agree the date and the post directly. Promobeez then watches the published post for you.'),
        ],
        'faq': [
            ('Do restaurant creators really work for a meal?', 'Many nano and micro creators do, especially for a new place or a new menu. Larger creators with tens of thousands of followers usually also ask for a fee. You see who applies to your offer before you pay for more.'),
            ('Which creators should a restaurant pick?', 'Pick by local audience, not follower count. A creator with 2,000 followers who mostly live in Helsinki brings more possible guests than one with 50,000 spread around the world.'),
            ('Can I serve alcohol in the offer?', 'You can include drinks, but alcohol advertising in Finland has its own rules. Keep alcohol out of the posts or check the Alcohol Act guidance before asking for it.'),
        ],
        'read': [('/blog/how-to-promote-a-restaurant-in-helsinki', 'Guide', 'How to promote a restaurant in Helsinki'), ('/blog/best-restaurant-social-media-helsinki-q3-2026', 'Research', 'Best restaurant social media in Helsinki, Q3 2026')],
    },
    ('fi', 'restaurants'): {
        'title': 'Vaikuttajamarkkinointi ravintolalle: paikalliset ruokavaikuttajat vaihtokaupalla | Promobeez',
        'desc': 'Paikalliset ruokasisällöntuottajat käyvät ravintolassasi ja julkaisevat siitä ateriaa vastaan. Julkaise tarjous, valitse tuottajat paikallisen yleisön mukaan, ei toimistopalkkiota. Alkaen 15 €.',
        'h1': 'Vaikuttaja&shy;markkinointi <em>ravintolalle</em>',
        'lede': 'Täytä hiljaiset illat asiakkailla, jotka näkivät sinut paikallisen sisällöntuottajan syötteessä. Sinä tarjoat illallisen, tuottaja julkaisee reelsin ja storyt yleisölle, joka asuu kaupungissasi.',
        'why_h': 'Miksi ravintolat tekevät vaihtokauppayhteistyötä',
        'why_lead': 'Ravintola on kokemus, joten paras mainos sille on joku, joka syö siellä. Paikalliset ruokasisällöntuottajat näyttävät salin, annoksen ja tunnelman ihmisille, jotka voivat tulla jo tänä iltana.',
        'why': [
            ('i-pin', 'Asiakkaita omalta alueelta', 'Tuottajakortit näyttävät, missä yleisö on. Valitse tuottajat, joiden seuraajat asuvat Helsingissä, Espoossa tai Vantaalla, eivät ulkomailla.'),
            ('i-euro', 'Raaka-ainekulu, ei mediabudjetti', 'Illallinen kahdelle maksaa sinulle raaka-aineiden verran. Ei toimistopalkkiota, eikä maksullisilla tilauksilla provisiota yhteistyöstä.'),
            ('i-timer', 'Täytä hiljaiset päivät', 'Sovi tuottajien käynnit maanantai-keskiviikko-illoille tai uuden lounaslistan alkuun, kun yksi lisäpöytä merkitsee eniten.'),
            ('i-camera', 'Sisältöä myös omiin kanaviin', 'Pyydä tuottajaa merkitsemään sinut ja sovi, saatko jakaa videon omalla tililläsi.'),
        ],
        'steps': [
            ('Julkaise tarjous', '"Illallinen kahdelle → 1 reels + 2 storya." Valitse sinulle sopivat päivät ja millaisia tuottajia etsit.'),
            ('Valitse paikalliset ruokatuottajat', 'Tuottajat hakevat. Näet tavoittavuuden, sitoutumisen ja missä yleisö asuu ennen kuin avaat yhteystietoja.'),
            ('Ota vieras vastaan', 'Avaa yhteystieto ja sovi päivä ja julkaisu suoraan. Promobeez seuraa sen jälkeen julkaisua puolestasi.'),
        ],
        'faq': [
            ('Tekevätkö ruokavaikuttajat oikeasti yhteistyötä ateriaa vastaan?', 'Moni nano- ja mikrotuottaja tekee, etenkin uuden paikan tai uuden menun kohdalla. Kymmenien tuhansien seuraajien tuottajat pyytävät yleensä myös palkkion. Näet, ketkä hakevat tarjoukseesi, ennen kuin maksat enempää.'),
            ('Millaisia tuottajia ravintolan kannattaa valita?', 'Valitse paikallisen yleisön, älä seuraajamäärän perusteella. Tuottaja, jolla on 2 000 seuraajaa enimmäkseen Helsingissä, tuo enemmän mahdollisia asiakkaita kuin 50 000 seuraajan tuottaja, jonka yleisö on ympäri maailmaa.'),
            ('Voiko tarjoukseen sisältyä alkoholia?', 'Juomia voi tarjota, mutta alkoholimainonnalla on Suomessa omat sääntönsä. Jätä alkoholi pois julkaisuista tai tarkista alkoholilain ohjeet ennen kuin pyydät sitä.'),
        ],
        'read': [('/fi/blogi/ravintolan-markkinointi-helsingissa', 'Opas', 'Ravintolan markkinointi Helsingissä'), ('/fi/blogi/helsingin-paras-ravintola-some-q3-2026', 'Tutkimus', 'Helsingin paras ravintola-some Q3/2026')],
    },
    # ---------------------------------------------------------------- cafés
    ('en', 'cafes'): {
        'title': 'Influencer marketing for cafés: local creators for coffee and brunch | Promobeez',
        'desc': 'Get your café on local creators\' feeds in return for coffee, cake or brunch. Post an offer, pick creators whose followers live nearby, pay no agency fee. From €15.',
        'h1': 'Influencer marketing for <em>cafés</em>',
        'lede': 'A café lives on regulars from the neighbourhood. Local creators bring them in: you give coffee and cake or a brunch, they show your place to people who walk past it every day.',
        'why_h': 'Why cafés use barter collabs',
        'why_lead': 'Coffee, pastries and a nice window seat are made for short videos. A creator\'s honest visit reads like a friend\'s tip, which is how most people pick a new café.',
        'why': [
            ('i-pin', 'Your neighbourhood, not the whole internet', 'Pick creators whose followers live in your city. Their audience can drop by on the way to work.'),
            ('i-euro', 'Costs a few euros per visit', 'Coffee and cake for two costs you very little. No agency fee and no commission on the collab on paid plans.'),
            ('i-timer', 'Lift the quiet afternoons', 'Ask for visits and posts in the afternoon dip or on rainy weekdays, when a nudge brings people in.'),
            ('i-spark', 'Launch something new', 'A new pastry, a seasonal drink or a new opening hour is a ready reason for a post.'),
        ],
        'steps': [
            ('Post the offer', '"Coffee and cake for two → 3 stories." Pick the days and the kind of creator you want.'),
            ('Pick creators from your area', 'Creators apply. You see reach, engagement and audience location before you unlock anyone.'),
            ('Welcome them in', 'Unlock the contact and agree the visit directly. Promobeez watches the published post for you.'),
        ],
        'faq': [
            ('Is a café too small for influencer marketing?', 'No. Small places gain the most from nano creators, because their followers are often neighbours. You start with one offer and a few visits, not a campaign.'),
            ('What should a café ask for in return?', 'Short formats work best: stories with the location tag and opening hours, or one reel. Ask for what you would like to see on your own account.'),
            ('How many creators should I invite?', 'Start with two or three visits spread over a few weeks. One post is a test; a few posts in a row are what people remember.'),
        ],
        'read': [('/blog/how-to-choose-a-local-creator', 'Playbook', 'How to choose a local creator'), ('/blog/why-audiences-trust-small-creators-more-than-brands', 'Evidence', 'Why audiences trust small creators more than brand ads')],
    },
    ('fi', 'cafes'): {
        'title': 'Vaikuttajamarkkinointi kahvilalle: paikalliset sisällöntuottajat vaihtokaupalla | Promobeez',
        'desc': 'Kahvilasi paikallisten sisällöntuottajien syötteeseen kahvia, kakkua tai brunssia vastaan. Julkaise tarjous, valitse tuottajat, joiden seuraajat asuvat lähellä. Alkaen 15 €.',
        'h1': 'Vaikuttaja&shy;markkinointi <em>kahvilalle</em>',
        'lede': 'Kahvila elää lähialueen kanta-asiakkaista. Paikalliset sisällöntuottajat tuovat heidät sisään: sinä tarjoat kahvit ja kakun tai brunssin, tuottaja näyttää paikkasi ihmisille, jotka kulkevat sen ohi joka päivä.',
        'why_h': 'Miksi kahvilat tekevät vaihtokauppayhteistyötä',
        'why_lead': 'Kahvi, leivonnaiset ja mukava ikkunapaikka sopivat lyhyisiin videoihin. Tuottajan rehellinen käynti kuulostaa ystävän vinkiltä, ja niin useimmat valitsevat uuden kahvilan.',
        'why': [
            ('i-pin', 'Oma kaupunginosa, ei koko internet', 'Valitse tuottajat, joiden seuraajat asuvat kaupungissasi. He voivat poiketa sisään matkalla töihin.'),
            ('i-euro', 'Muutama euro käynniltä', 'Kahvit ja kakut kahdelle maksavat sinulle vähän. Ei toimistopalkkiota, eikä maksullisilla tilauksilla provisiota yhteistyöstä.'),
            ('i-timer', 'Piristä hiljaiset iltapäivät', 'Pyydä käyntejä ja julkaisuja iltapäivän hiljaiseen hetkeen tai sateisille arkipäiville.'),
            ('i-spark', 'Lanseeraa jotain uutta', 'Uusi leivonnainen, sesonkijuoma tai uudet aukioloajat ovat valmis syy julkaisuun.'),
        ],
        'steps': [
            ('Julkaise tarjous', '"Kahvit ja kakut kahdelle → 3 storya." Valitse päivät ja millaisen tuottajan haluat.'),
            ('Valitse tuottajat omalta alueelta', 'Tuottajat hakevat. Näet tavoittavuuden, sitoutumisen ja yleisön sijainnin ennen kuin avaat yhteystietoja.'),
            ('Toivota tervetulleeksi', 'Avaa yhteystieto ja sovi käynti suoraan. Promobeez seuraa julkaisua puolestasi.'),
        ],
        'faq': [
            ('Onko kahvila liian pieni vaikuttajamarkkinointiin?', 'Ei. Pienet paikat hyötyvät nanotuottajista eniten, koska heidän seuraajansa ovat usein naapureita. Aloitat yhdellä tarjouksella ja muutamalla käynnillä, et kampanjalla.'),
            ('Mitä kahvilan kannattaa pyytää vastineeksi?', 'Lyhyet muodot toimivat parhaiten: storyt sijaintimerkinnällä ja aukioloajoilla tai yksi reels. Pyydä sellaista, minkä haluaisit nähdä myös omalla tililläsi.'),
            ('Montako tuottajaa kannattaa kutsua?', 'Aloita kahdella tai kolmella käynnillä muutaman viikon aikana. Yksi julkaisu on testi; useampi peräkkäin jää mieleen.'),
        ],
        'read': [('/fi/blogi/miten-valita-paikallinen-sisallontuottaja', 'Opas', 'Miten valita paikallinen sisällöntuottaja'), ('/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin', 'Tutkimus', 'Miksi yleisö luottaa pieniin sisällöntuottajiin')],
    },
    # ---------------------------------------------------------------- salons
    ('en', 'salons'): {
        'title': 'Influencer marketing for hair and beauty salons | Promobeez',
        'desc': 'Local creators book a haircut, colour or treatment and post the result in return. Post an offer, pick creators by local audience, pay no agency fee. From €15.',
        'h1': 'Influencer marketing for <em>salons</em>',
        'lede': 'Hair, nails, brows and skin are sold by the before-and-after. Give a local creator a treatment and they show the result to followers who live close enough to book.',
        'why_h': 'Why salons use barter collabs',
        'why_lead': 'People choose a hairdresser or a beautician through someone they trust. A creator in your city showing a real result works like a recommendation from a friend.',
        'why': [
            ('i-pin', 'Clients who can book', 'Pick creators whose followers live in your city. A beautiful result is useless to someone 500 km away.'),
            ('i-euro', 'Pay with an empty slot', 'A treatment in a free slot costs you time and products, not cash. No agency fee and no commission on the collab on paid plans.'),
            ('i-camera', 'Before-and-after content', 'Agree on a short video of the process and the result. You can ask to repost it on your own account.'),
            ('i-check', 'Show your specialists', 'A post can name the stylist or the treatment, so new clients ask for exactly that.'),
        ],
        'steps': [
            ('Post the offer', '"Cut and colour → 1 reel + 2 stories." Choose the free slots and the creators you are looking for.'),
            ('Pick creators from your city', 'Creators apply. You see reach, engagement and where their audience lives before you unlock anyone.'),
            ('Book the treatment', 'Unlock the contact and agree the time and the post directly. Promobeez watches the published post for you.'),
        ],
        'faq': [
            ('Do I need creators with many followers?', 'No. For a salon, a creator with 1,000 to 10,000 local followers is often better than a large account: their followers can actually book.'),
            ('What if the client does not like the result?', 'Agree in advance that the post shows an honest result and that you can fix it if something goes wrong before posting. This is between you and the creator.'),
            ('Can I use the creator\'s video in my own ads?', 'Only if you agree on it. Reposting on your organic account is common; paid ads usually need a separate agreement and often a fee.'),
        ],
        'read': [('/blog/how-to-choose-a-local-creator', 'Playbook', 'How to choose a local creator'), ('/blog/influencer-marketing-disclosure-finland', 'Finland', 'Influencer marketing disclosure in Finland')],
    },
    ('fi', 'salons'): {
        'title': 'Vaikuttajamarkkinointi kampaamolle ja kauneushoitolalle | Promobeez',
        'desc': 'Paikalliset sisällöntuottajat varaavat leikkauksen, värin tai hoidon ja julkaisevat tuloksen vastineeksi. Julkaise tarjous, valitse tuottajat paikallisen yleisön mukaan. Alkaen 15 €.',
        'h1': 'Vaikuttaja&shy;markkinointi <em>kampaamolle</em> ja kauneushoitolalle',
        'lede': 'Hiukset, kynnet, kulmat ja iho myyvät ennen-jälkeen-kuvalla. Anna paikalliselle tuottajalle hoito, ja hän näyttää tuloksen seuraajille, jotka asuvat tarpeeksi lähellä varatakseen ajan.',
        'why_h': 'Miksi kampaamot ja hoitolat tekevät vaihtokauppayhteistyötä',
        'why_lead': 'Kampaaja tai kosmetologi valitaan jonkun luotetun kautta. Kaupunkisi tuottaja, joka näyttää oikean tuloksen, toimii kuin ystävän suositus.',
        'why': [
            ('i-pin', 'Asiakkaita, jotka voivat varata', 'Valitse tuottajat, joiden seuraajat asuvat kaupungissasi. Kaunis tulos ei auta, jos katsoja asuu 500 kilometrin päässä.'),
            ('i-euro', 'Maksa vapaalla ajalla', 'Hoito vapaaseen aikaan maksaa sinulle aikaa ja tuotteita, ei rahaa. Ei toimistopalkkiota, eikä maksullisilla tilauksilla provisiota yhteistyöstä.'),
            ('i-camera', 'Ennen ja jälkeen -sisältöä', 'Sovi lyhyt video prosessista ja tuloksesta. Voit pyytää lupaa jakaa sen omalla tililläsi.'),
            ('i-check', 'Nosta tekijät esiin', 'Julkaisussa voi mainita kampaajan tai hoidon, jolloin uudet asiakkaat kysyvät juuri sitä.'),
        ],
        'steps': [
            ('Julkaise tarjous', '"Leikkaus ja väri → 1 reels + 2 storya." Valitse vapaat ajat ja millaisia tuottajia etsit.'),
            ('Valitse tuottajat kaupungistasi', 'Tuottajat hakevat. Näet tavoittavuuden, sitoutumisen ja missä yleisö asuu ennen kuin avaat yhteystietoja.'),
            ('Varaa hoito', 'Avaa yhteystieto ja sovi aika ja julkaisu suoraan. Promobeez seuraa julkaisua puolestasi.'),
        ],
        'faq': [
            ('Tarvitsenko tuottajia, joilla on paljon seuraajia?', 'Et. Kampaamolle tuottaja, jolla on 1 000-10 000 paikallista seuraajaa, on usein parempi kuin iso tili: hänen seuraajansa voivat oikeasti varata ajan.'),
            ('Entä jos asiakas ei ole tyytyväinen tulokseen?', 'Sovi etukäteen, että julkaisu näyttää rehellisen tuloksen ja että voit korjata asian ennen julkaisua, jos jokin menee pieleen. Tämä sovitaan sinun ja tuottajan kesken.'),
            ('Voinko käyttää tuottajan videota omissa mainoksissani?', 'Vain jos sovitte siitä. Jakaminen omalla tilillä on yleistä; maksettu mainonta vaatii yleensä erillisen sopimuksen ja usein palkkion.'),
        ],
        'read': [('/fi/blogi/miten-valita-paikallinen-sisallontuottaja', 'Opas', 'Miten valita paikallinen sisällöntuottaja'), ('/fi/blogi/vaikuttajamarkkinoinnin-merkinta', 'Suomi', 'Vaikuttajamarkkinoinnin merkintä: KKV:n ohjeet')],
    },
    # ---------------------------------------------------------------- gyms
    ('en', 'gyms'): {
        'title': 'Influencer marketing for gyms and fitness studios | Promobeez',
        'desc': 'Local creators try your gym, yoga or boxing class and post about it in return for a pass. Post an offer, pick creators by local audience, pay no agency fee. From €15.',
        'h1': 'Influencer marketing for <em>gyms</em> and studios',
        'lede': 'People join a gym or a class when someone like them shows it is fun and not scary. Give a local creator a trial pass; they show the workout to followers who live nearby.',
        'why_h': 'Why gyms and studios use barter collabs',
        'why_lead': 'A trial pass costs you almost nothing, and an honest first-class video answers the questions newcomers are too shy to ask.',
        'why': [
            ('i-pin', 'Members from your area', 'Pick creators whose followers live in your city. Nobody crosses town for a gym.'),
            ('i-euro', 'A pass, not a budget', 'A trial week or a month pass costs you an empty spot. No agency fee and no commission on the collab on paid plans.'),
            ('i-timer', 'Time it with the season', 'January, the end of summer and the start of autumn are when people sign up. Line up visits for those weeks.'),
            ('i-check', 'Lower the first-visit fear', 'A creator showing the changing room, the class and the coach makes the first step easier for followers.'),
        ],
        'steps': [
            ('Post the offer', '"Trial week → 1 reel + stories." Choose the classes or hours and the creators you want.'),
            ('Pick creators from your area', 'Creators apply. You see reach, engagement and where their audience lives before you unlock anyone.'),
            ('Get them training', 'Unlock the contact and agree the visits and the posts directly. Promobeez watches the published posts for you.'),
        ],
        'faq': [
            ('Do I need fitness influencers?', 'Not necessarily. Lifestyle and local creators often work better: their followers see a normal person trying the class, not an athlete.'),
            ('How do I track new members from a post?', 'Give each creator a code for a discounted first month or a free extra session. Count sign-ups with that code.'),
            ('Is a gym membership a gift that needs a label?', 'Yes. A free pass in return for posts is commercial cooperation, and the posts need a clear ad label.'),
        ],
        'read': [('/blog/how-to-choose-a-local-creator', 'Playbook', 'How to choose a local creator'), ('/blog/why-audiences-trust-small-creators-more-than-brands', 'Evidence', 'Why audiences trust small creators more than brand ads')],
    },
    ('fi', 'gyms'): {
        'title': 'Vaikuttajamarkkinointi kuntosalille ja liikuntastudiolle | Promobeez',
        'desc': 'Paikalliset sisällöntuottajat kokeilevat salia, joogaa tai nyrkkeilyä ja julkaisevat siitä korttia vastaan. Julkaise tarjous, valitse tuottajat paikallisen yleisön mukaan. Alkaen 15 €.',
        'h1': 'Vaikuttaja&shy;markkinointi <em>kuntosalille</em> ja studiolle',
        'lede': 'Saliin tai tunnille lähdetään, kun joku itsen kaltainen näyttää, että se on hauskaa eikä pelottavaa. Anna paikalliselle tuottajalle kokeilukortti, ja hän näyttää treenin seuraajille, jotka asuvat lähellä.',
        'why_h': 'Miksi salit ja studiot tekevät vaihtokauppayhteistyötä',
        'why_lead': 'Kokeilukortti maksaa sinulle lähes ei mitään, ja rehellinen video ensimmäiseltä tunnilta vastaa kysymyksiin, joita aloittelija ei kehtaa kysyä.',
        'why': [
            ('i-pin', 'Jäseniä omalta alueelta', 'Valitse tuottajat, joiden seuraajat asuvat kaupungissasi. Kukaan ei lähde salille kaupungin toiselle puolelle.'),
            ('i-euro', 'Kortti, ei budjetti', 'Kokeiluviikko tai kuukausikortti maksaa sinulle tyhjän paikan. Ei toimistopalkkiota, eikä maksullisilla tilauksilla provisiota yhteistyöstä.'),
            ('i-timer', 'Ajoita sesonkiin', 'Tammikuu, kesän loppu ja syksyn alku ovat liittymisen aikaa. Sovi käynnit niille viikoille.'),
            ('i-check', 'Madalla ensikäynnin kynnystä', 'Kun tuottaja näyttää pukuhuoneen, tunnin ja valmentajan, seuraajan on helpompi ottaa ensimmäinen askel.'),
        ],
        'steps': [
            ('Julkaise tarjous', '"Kokeiluviikko → 1 reels + storyt." Valitse tunnit tai ajat ja millaiset tuottajat haluat.'),
            ('Valitse tuottajat omalta alueelta', 'Tuottajat hakevat. Näet tavoittavuuden, sitoutumisen ja missä yleisö asuu ennen kuin avaat yhteystietoja.'),
            ('Treenit käyntiin', 'Avaa yhteystieto ja sovi käynnit ja julkaisut suoraan. Promobeez seuraa julkaisuja puolestasi.'),
        ],
        'faq': [
            ('Tarvitsenko fitness-vaikuttajia?', 'Et välttämättä. Lifestyle- ja paikalliset tuottajat toimivat usein paremmin: seuraajat näkevät tavallisen ihmisen kokeilemassa tuntia, eivät urheilijaa.'),
            ('Miten seuraan uusia jäseniä julkaisusta?', 'Anna jokaiselle tuottajalle koodi alennettuun ensimmäiseen kuukauteen tai ylimääräiseen kertaan. Laske liittymiset koodilla.'),
            ('Pitääkö ilmainen salikortti merkitä mainokseksi?', 'Kyllä. Ilmainen kortti julkaisuja vastaan on kaupallista yhteistyötä, ja julkaisuissa on oltava selvä mainosmerkintä.'),
        ],
        'read': [('/fi/blogi/miten-valita-paikallinen-sisallontuottaja', 'Opas', 'Miten valita paikallinen sisällöntuottaja'), ('/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin', 'Tutkimus', 'Miksi yleisö luottaa pieniin sisällöntuottajiin')],
    },
}

# Real offers: the most-applied offer per category, shown like a feed card without the business name.
# Text follows the original offer; brand names and handles are removed. 'cat' fills {cat} in COMMON['real_lead'].
REAL = {
    ('en', 'restaurants'): {
        'cat': 'restaurant', 'img': 'restaurants', 'where': 'Dumpling restaurant · Kamppi, Helsinki',
        'title': 'Free handmade dumplings for two',
        'chips': ['Open to all creators', 'Offer in English and Finnish'],
        'get': 'A dumpling meal for you and a friend: your choice of handmade jiaozi, boiled or fried, with meat and veggie options, plus drinks for two. Book through the app and show your offer when you arrive.',
        'content': '1 honest TikTok or Instagram reel from your visit, with the restaurant tagged.',
        'who': 'Any creator who likes food. No follower minimum.',
        'posted': 'August 2026',
    },
    ('fi', 'restaurants'): {
        'cat': 'ravintoloiden', 'img': 'restaurants', 'where': 'Dumpling-ravintola · Kamppi, Helsinki',
        'title': 'Ilmaiset käsintehdyt dumplingsit kahdelle',
        'chips': ['Kaikille tuottajille', 'Tarjous suomeksi ja englanniksi'],
        'get': 'Dumpling-ateria sinulle ja ystävällesi: valitsemasi käsintehdyt jiaozit, keitetyt tai paistetut, liha- tai kasvis, sekä juomat kahdelle. Varaa sovelluksessa ja näytä tarjous paikalla.',
        'content': '1 rehellinen TikTok tai Instagram-reels käynnistä, ravintola merkittynä.',
        'who': 'Kuka tahansa ruoasta kiinnostunut tuottaja. Ei seuraajarajaa.',
        'posted': 'Elokuu 2026',
    },
    ('en', 'cafes'): {
        'cat': 'café', 'img': 'cafes', 'where': 'Café · Ruoholahti, Helsinki',
        'title': 'Free breakfast and cappuccino',
        'chips': ['Local creators only', 'Mon–Fri 8:00–10:00'],
        'get': 'One of the breakfast options from the menu and a single cappuccino. Breakfast is served 8:00–10:00, Monday to Friday.',
        'content': 'Instagram: 1 post and 2 stories. Or TikTok: 1 video and 2 stories.',
        'who': 'Food or lifestyle creators who live nearby.',
        'posted': 'August 2026',
    },
    ('fi', 'cafes'): {
        'cat': 'kahviloiden', 'img': 'cafes', 'where': 'Kahvila · Ruoholahti, Helsinki',
        'title': 'Ilmainen aamiainen ja cappuccino',
        'chips': ['Vain paikalliset tuottajat', 'Ma–pe 8.00–10.00'],
        'get': 'Yksi menun aamiaisvaihtoehdoista ja cappuccino. Aamiainen tarjoillaan maanantaista perjantaihin klo 8.00–10.00.',
        'content': 'Instagram: 1 julkaisu ja 2 storya. Tai TikTok: 1 video ja 2 storya.',
        'who': 'Lähellä asuvat ruoka- tai lifestyle-tuottajat.',
        'posted': 'Elokuu 2026',
    },
    ('en', 'salons'): {
        'cat': 'salon', 'img': 'salons', 'where': 'Lash studio · Tikkurila, Vantaa',
        'title': 'Free classic lash extensions',
        'chips': ['Local creators only', 'Women creators'],
        'get': 'A full set of classic lash extensions, with the curl and length chosen to suit you.',
        'content': 'Agreed with the studio once you are accepted: the result, the process or both.',
        'who': 'Women creators who live in the Helsinki area.',
        'posted': 'August 2026',
    },
    ('fi', 'salons'): {
        'cat': 'kampaamoiden ja kauneushoitoloiden', 'img': 'salons', 'where': 'Ripsistudio · Tikkurila, Vantaa',
        'title': 'Ilmaiset klassiset ripsienpidennykset',
        'chips': ['Vain paikalliset tuottajat', 'Naistuottajat'],
        'get': 'Täysi setti klassisia ripsienpidennyksiä, taivutus ja pituus valittuna sinulle sopiviksi.',
        'content': 'Sovitaan studion kanssa, kun sinut on hyväksytty: tulos, prosessi tai molemmat.',
        'who': 'Pääkaupunkiseudulla asuvat naistuottajat.',
        'posted': 'Elokuu 2026',
    },
    ('en', 'gyms'): {
        'cat': 'gym and studio', 'img': 'gyms', 'where': 'Yoga studio · central Helsinki',
        'title': 'Free sound bath',
        'chips': ['Local creators only', 'No experience needed', 'In English'],
        'get': 'A free 75-minute sound bath: deep relaxation surrounded by soothing sound vibrations. The class starts with gentle yoga movements and ends with a relaxing sound journey. Friday evenings, 18:45–20:00.',
        'content': '1 post and 1 story.',
        'who': 'Creators who live in Helsinki. Beginners welcome.',
        'posted': 'September 2026',
    },
    ('fi', 'gyms'): {
        'cat': 'salien ja studioiden', 'img': 'gyms', 'where': 'Joogastudio · Helsingin keskusta',
        'title': 'Ilmainen äänikylpy',
        'chips': ['Vain paikalliset tuottajat', 'Ei vaadi kokemusta', 'Englanniksi'],
        'get': 'Ilmainen 75 minuutin äänikylpy: syvää rentoutumista rauhoittavien äänivärähtelyjen keskellä. Tunti alkaa kevyillä joogaliikkeillä ja päättyy rentouttavaan äänimatkaan. Perjantai-iltaisin klo 18.45–20.00.',
        'content': '1 julkaisu ja 1 story.',
        'who': 'Helsingissä asuvat tuottajat. Aloittelijat tervetulleita.',
        'posted': 'Syyskuu 2026',
    },
}


# ---------------------------------------------------------------- Italian (IT)
# Promobeez is live in Finland and opening in Italy (Milan first), so the IT pages speak to Italian
# businesses; the real offers below are still the Helsinki ones, translated.
SLUGS['it'] = {
    'restaurants': 'influencer-marketing-per-ristoranti',
    'cafes': 'influencer-marketing-per-bar-e-caffetterie',
    'salons': 'influencer-marketing-per-saloni',
    'gyms': 'influencer-marketing-per-palestre',
}

NAMES['it'] = {'restaurants': 'Ristoranti', 'cafes': 'Bar e caffetterie', 'salons': 'Parrucchieri e centri estetici', 'gyms': 'Palestre e studi'}

COMMON['it'] = {
    'cta_btn': 'Pubblicate la prima offerta →',
    'steps_h': 'Come funziona',
    'real_h': 'Un\'offerta reale che ha funzionato',
    'real_lead': 'Tra tutte le offerte {cat} pubblicate finora su Promobeez, questa è quella che ha ricevuto più candidature dai creator.',
    'real_get': 'Cosa ricevi',
    'real_content': 'Contenuti in cambio',
    'real_who': 'Per chi è',
    'real_posted': 'Pubblicata',
    'real_hidden': 'Nome nascosto',
    'real_badge': 'Offerta reale',
    'real_barter': 'Barter',
    'real_cta': 'Pubblicate un\'offerta così →',
    'faq_h': 'Domande frequenti',
    'read_h': 'Da leggere',
    'other_h': 'Altri settori',
    'step': 'Passo',
    'crumb_home': 'Home',
    'crumb_biz': 'Per le attività',
    'biz_path': '/it/per-le-attivita',
    'eyebrow_prefix': '',
    'price_q': 'Quanto costa?',
    'price_a': 'La campagna costa quanto costa a voi la vostra offerta. <span data-growth-trial>Le nuove attività ricevono 14 giorni di Growth gratis. Poi: </span>(quasi) Free costa 15 € una tantum per un\'offerta e tre sblocchi di contatto, rimborsati con un clic se l\'offerta riceve meno di tre candidature in 14 giorni. Starter costa 69 € al mese e Growth 109 € al mese. Nessuna commissione sulle collaborazioni finché avete un piano a pagamento.',
}

PAGES[('it', 'restaurants')] = {
    'title': 'Influencer marketing per ristoranti, pagato con una cena | Promobeez',
    'desc': 'Food creator locali vengono nel vostro ristorante e ne parlano in cambio di una cena. Pubblicate un\'offerta, scegliete i creator in base a quanto è locale il loro pubblico, nessuna tariffa d\'agenzia. Da 15 €.',
    'h1': 'Influencer marketing per <em>ristoranti</em>',
    'lede': 'Riempite le serate tranquille con clienti che vi hanno visto nel feed di un creator della vostra città. Voi offrite una cena, il creator pubblica un reel e delle storie per un pubblico che abita vicino a voi.',
    'why_h': 'Perché i ristoranti scelgono le collaborazioni in barter',
    'why_lead': 'Un ristorante è un\'esperienza, e la pubblicità migliore è qualcuno che ci mangia. I food creator locali mostrano la sala, il piatto e la fila a persone che possono venire già stasera.',
    'why': [
        ('i-pin', 'Clienti dalla vostra zona', 'Le schede dei creator mostrano dove si trova il pubblico. Scegliete persone i cui follower vivono nella vostra città e nei dintorni, non all\'estero.'),
        ('i-euro', 'Food cost, non budget media', 'Una cena per due vi costa il suo food cost. Nessuna tariffa d\'agenzia e, con i piani a pagamento, nessuna commissione sulla collaborazione.'),
        ('i-timer', 'Riempite i giorni lenti', 'Fissate le visite dei creator dal lunedì al mercoledì sera o per il lancio di un nuovo menù pranzo, quando un tavolo in più conta di più.'),
        ('i-camera', 'Contenuti da riutilizzare', 'Chiedete al creator di taggarvi e concordate se potete ripubblicare il video sul vostro profilo.'),
    ],
    'steps': [
        ('Pubblicate l\'offerta', '"Cena per due → 1 reel + 2 storie." Scegliete i giorni che vi vanno bene e chi state cercando.'),
        ('Scegliete food creator locali', 'I creator si candidano. Vedete reach, engagement e dove vive il loro pubblico prima di sbloccare qualcuno.'),
        ('Accogliete la visita', 'Sbloccate il contatto, concordate data e post direttamente. Poi Promobeez segue il post pubblicato per voi.'),
    ],
    'faq': [
        ('I food creator accettano davvero di lavorare per una cena?', 'Molti nano e micro creator sì, soprattutto per un locale nuovo o un nuovo menù. I creator con decine di migliaia di follower di solito chiedono anche un compenso. Vedete chi si candida alla vostra offerta prima di pagare di più.'),
        ('Quali creator dovrebbe scegliere un ristorante?', 'Scegliete in base al pubblico locale, non al numero di follower. Un creator con 2.000 follower che vivono quasi tutti nella vostra città porta più potenziali clienti di uno con 50.000 sparsi per il mondo.'),
        ('Posso includere alcolici nell\'offerta?', 'Potete offrire anche da bere, ma in Italia la pubblicità degli alcolici ha regole proprie (legge 125/2001). Tenete gli alcolici fuori dai post o verificate le regole prima di chiederlo.'),
    ],
    'read': [('/it/blog/come-promuovere-un-ristorante-a-milano', 'Guida', 'Come promuovere un ristorante a Milano'), ('/it/blog/miglior-social-ristoranti-helsinki-q3-2026', 'Ricerca', 'I migliori social dei ristoranti di Helsinki, Q3 2026')],
}

PAGES[('it', 'cafes')] = {
    'title': 'Influencer marketing per bar e caffetterie: creator locali per caffè e brunch | Promobeez',
    'desc': 'Portate il vostro bar nei feed dei creator locali in cambio di un caffè, una fetta di torta o un brunch. Pubblicate un\'offerta, scegliete creator con follower in zona, nessuna tariffa d\'agenzia. Da 15 €.',
    'h1': 'Influencer marketing per <em>bar</em> e caffetterie',
    'lede': 'Un bar vive dei clienti abituali del quartiere. I creator locali ve li portano: voi offrite caffè e dolce o un brunch, loro mostrano il vostro locale a chi ci passa davanti ogni giorno.',
    'why_h': 'Perché bar e caffetterie scelgono il barter',
    'why_lead': 'Caffè, brioche e un bel tavolino alla finestra sono fatti per i video brevi. La visita sincera di un creator suona come il consiglio di un amico, ed è così che la maggior parte delle persone sceglie un nuovo bar.',
    'why': [
        ('i-pin', 'Il vostro quartiere, non tutto internet', 'Scegliete creator i cui follower vivono nella vostra città. Il loro pubblico può passare a trovarvi andando al lavoro.'),
        ('i-euro', 'Pochi euro a visita', 'Caffè e dolce per due vi costano pochissimo. Nessuna tariffa d\'agenzia e, con i piani a pagamento, nessuna commissione sulla collaborazione.'),
        ('i-timer', 'Animate i pomeriggi tranquilli', 'Chiedete visite e post nel calo del pomeriggio o nei giorni feriali di pioggia, quando una spinta fa entrare gente.'),
        ('i-spark', 'Lanciate qualcosa di nuovo', 'Un nuovo dolce, una bevanda di stagione o un nuovo orario sono già un motivo per un post.'),
    ],
    'steps': [
        ('Pubblicate l\'offerta', '"Caffè e dolce per due → 3 storie." Scegliete i giorni e il tipo di creator che volete.'),
        ('Scegliete creator della vostra zona', 'I creator si candidano. Vedete reach, engagement e posizione del pubblico prima di sbloccare qualcuno.'),
        ('Accoglieteli', 'Sbloccate il contatto e concordate la visita direttamente. Promobeez segue il post pubblicato per voi.'),
    ],
    'faq': [
        ('Un bar è troppo piccolo per l\'influencer marketing?', 'No. I locali piccoli sono quelli che guadagnano di più dai nano creator, perché i loro follower sono spesso vicini di casa. Si parte da un\'offerta e qualche visita, non da una campagna.'),
        ('Cosa dovrebbe chiedere un bar in cambio?', 'I formati brevi funzionano meglio: storie con il tag della posizione e gli orari, oppure un reel. Chiedete quello che vorreste vedere anche sul vostro profilo.'),
        ('Quanti creator dovrei invitare?', 'Iniziate con due o tre visite distribuite in qualche settimana. Un post è un test; qualche post di fila è quello che la gente ricorda.'),
    ],
    'read': [('/it/blog/come-scegliere-un-creator-locale', 'Guida operativa', 'Come scegliere un creator locale'), ('/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator', 'Evidenze', 'Perché il pubblico si fida dei piccoli creator più che degli annunci')],
}

PAGES[('it', 'salons')] = {
    'title': 'Influencer marketing per parrucchieri e centri estetici | Promobeez',
    'desc': 'Creator locali prenotano un taglio, un colore o un trattamento e in cambio pubblicano il risultato. Pubblicate un\'offerta, scegliete i creator per pubblico locale, nessuna tariffa d\'agenzia. Da 15 €.',
    'h1': 'Influencer marketing per <em>saloni</em> di bellezza',
    'lede': 'Capelli, unghie, sopracciglia e pelle si vendono con il prima e dopo. Offrite un trattamento a un creator locale e mostrerà il risultato a follower che abitano abbastanza vicino da prenotare.',
    'why_h': 'Perché parrucchieri e centri estetici scelgono il barter',
    'why_lead': 'Il parrucchiere o l\'estetista si sceglie tramite qualcuno di cui ci si fida. Un creator della vostra città che mostra un risultato vero funziona come il consiglio di un\'amica.',
    'why': [
        ('i-pin', 'Clienti che possono prenotare', 'Scegliete creator i cui follower vivono nella vostra città. Un bel risultato non serve a chi abita a 500 km.'),
        ('i-euro', 'Pagate con un orario libero', 'Un trattamento in un orario libero vi costa tempo e prodotti, non contanti. Nessuna tariffa d\'agenzia e, con i piani a pagamento, nessuna commissione sulla collaborazione.'),
        ('i-camera', 'Contenuti prima e dopo', 'Concordate un breve video del processo e del risultato. Potete chiedere di ripubblicarlo sul vostro profilo.'),
        ('i-check', 'Mettete in luce il vostro staff', 'Un post può citare l\'hair stylist o il trattamento, così i nuovi clienti chiedono proprio quello.'),
    ],
    'steps': [
        ('Pubblicate l\'offerta', '"Taglio e colore → 1 reel + 2 storie." Scegliete gli orari liberi e i creator che cercate.'),
        ('Scegliete creator della vostra città', 'I creator si candidano. Vedete reach, engagement e dove vive il loro pubblico prima di sbloccare qualcuno.'),
        ('Prenotate il trattamento', 'Sbloccate il contatto e concordate orario e post direttamente. Promobeez segue il post pubblicato per voi.'),
    ],
    'faq': [
        ('Servono creator con tanti follower?', 'No. Per un salone, un creator con 1.000-10.000 follower locali è spesso meglio di un grande profilo: i suoi follower possono davvero prenotare.'),
        ('E se il risultato non piace?', 'Concordate prima che il post mostri un risultato onesto e che, se qualcosa va storto, potete sistemarlo prima della pubblicazione. È un accordo tra voi e il creator.'),
        ('Posso usare il video del creator nelle mie pubblicità?', 'Solo se lo concordate. Ripubblicarlo sul vostro profilo organico è normale; le inserzioni a pagamento di solito richiedono un accordo separato e spesso un compenso.'),
    ],
    'read': [('/it/blog/come-scegliere-un-creator-locale', 'Guida operativa', 'Come scegliere un creator locale'), ('/it/blog/pubblicita-influencer-regole-italia', 'Italia', 'Pubblicità con influencer: le regole in Italia')],
}

PAGES[('it', 'gyms')] = {
    'title': 'Influencer marketing per palestre e studi fitness | Promobeez',
    'desc': 'Creator locali provano la vostra palestra, lezione di yoga o di boxe e ne parlano in cambio di un ingresso. Pubblicate un\'offerta, scegliete i creator per pubblico locale, nessuna tariffa d\'agenzia. Da 15 €.',
    'h1': 'Influencer marketing per <em>palestre</em> e studi',
    'lede': 'Ci si iscrive a una palestra o a un corso quando qualcuno come noi mostra che è divertente e non fa paura. Offrite un pass di prova a un creator locale: mostrerà l\'allenamento ai follower che abitano vicino.',
    'why_h': 'Perché palestre e studi scelgono il barter',
    'why_lead': 'Un pass di prova non vi costa quasi nulla, e un video sincero della prima lezione risponde alle domande che chi inizia non ha il coraggio di fare.',
    'why': [
        ('i-pin', 'Iscritti dalla vostra zona', 'Scegliete creator i cui follower vivono nella vostra città. Nessuno attraversa la città per andare in palestra.'),
        ('i-euro', 'Un pass, non un budget', 'Una settimana di prova o un mese vi costano un posto libero. Nessuna tariffa d\'agenzia e, con i piani a pagamento, nessuna commissione sulla collaborazione.'),
        ('i-timer', 'Seguite la stagione', 'Gennaio, la fine dell\'estate e l\'inizio dell\'autunno sono i momenti in cui ci si iscrive. Organizzate le visite in quelle settimane.'),
        ('i-check', 'Abbassate la paura della prima volta', 'Un creator che mostra lo spogliatoio, la lezione e l\'istruttore rende il primo passo più facile per i follower.'),
    ],
    'steps': [
        ('Pubblicate l\'offerta', '"Settimana di prova → 1 reel + storie." Scegliete corsi o orari e i creator che volete.'),
        ('Scegliete creator della vostra zona', 'I creator si candidano. Vedete reach, engagement e dove vive il loro pubblico prima di sbloccare qualcuno.'),
        ('Fateli allenare', 'Sbloccate il contatto e concordate visite e post direttamente. Promobeez segue i post pubblicati per voi.'),
    ],
    'faq': [
        ('Servono fitness influencer?', 'Non per forza. I creator lifestyle e locali spesso funzionano meglio: i follower vedono una persona normale che prova la lezione, non un atleta.'),
        ('Come misuro i nuovi iscritti arrivati da un post?', 'Date a ogni creator un codice per il primo mese scontato o una lezione extra gratis. Contate le iscrizioni con quel codice.'),
        ('Un abbonamento gratis va segnalato come pubblicità?', 'Sì. Un ingresso gratuito in cambio di post è una collaborazione commerciale, e i post devono riportare un\'indicazione chiara di pubblicità, ad esempio #adv o #pubblicità.'),
    ],
    'read': [('/it/blog/come-scegliere-un-creator-locale', 'Guida operativa', 'Come scegliere un creator locale'), ('/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator', 'Evidenze', 'Perché il pubblico si fida dei piccoli creator più che degli annunci')],
}

REAL[('it', 'restaurants')] = {
    'cat': 'di ristoranti', 'img': 'restaurants', 'where': 'Ristorante di ravioli cinesi · Kamppi, Helsinki',
    'title': 'Ravioli fatti a mano gratis per due',
    'chips': ['Aperta a tutti i creator', 'Offerta in inglese e finlandese'],
    'get': 'Un pasto a base di ravioli per te e un amico: jiaozi fatti a mano a scelta, bolliti o fritti, con opzioni di carne e vegetariane, più le bevande per due. Prenota dall\'app e mostra l\'offerta all\'arrivo.',
    'content': '1 reel sincero su TikTok o Instagram della visita, con il ristorante taggato.',
    'who': 'Qualsiasi creator a cui piace il cibo. Nessun minimo di follower.',
    'posted': 'Agosto 2026',
}
REAL[('it', 'cafes')] = {
    'cat': 'di bar e caffetterie', 'img': 'cafes', 'where': 'Caffetteria · Ruoholahti, Helsinki',
    'title': 'Colazione e cappuccino gratis',
    'chips': ['Solo creator locali', 'Lun–ven 8:00–10:00'],
    'get': 'Una delle colazioni del menù e un cappuccino. La colazione è servita dalle 8:00 alle 10:00, dal lunedì al venerdì.',
    'content': 'Instagram: 1 post e 2 storie. Oppure TikTok: 1 video e 2 storie.',
    'who': 'Creator food o lifestyle che abitano in zona.',
    'posted': 'Agosto 2026',
}
REAL[('it', 'salons')] = {
    'cat': 'di saloni di bellezza', 'img': 'salons', 'where': 'Studio ciglia · Tikkurila, Vantaa',
    'title': 'Extension ciglia classiche gratis',
    'chips': ['Solo creator locali', 'Creator donne'],
    'get': 'Un set completo di extension ciglia classiche, con curvatura e lunghezza scelte su di te.',
    'content': 'Da concordare con lo studio dopo l\'accettazione: il risultato, il processo o entrambi.',
    'who': 'Creator donne che vivono nell\'area di Helsinki.',
    'posted': 'Agosto 2026',
}
REAL[('it', 'gyms')] = {
    'cat': 'di palestre e studi', 'img': 'gyms', 'where': 'Studio di yoga · centro di Helsinki',
    'title': 'Sound bath gratis',
    'chips': ['Solo creator locali', 'Nessuna esperienza richiesta', 'In inglese'],
    'get': 'Un sound bath gratuito di 75 minuti: rilassamento profondo immersi in vibrazioni sonore rilassanti. La lezione inizia con movimenti di yoga dolci e si chiude con un viaggio sonoro rilassante. Il venerdì sera, 18:45–20:00.',
    'content': '1 post e 1 storia.',
    'who': 'Creator che vivono a Helsinki. Principianti benvenuti.',
    'posted': 'Settembre 2026',
}
