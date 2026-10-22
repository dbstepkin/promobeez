"""Copy for the industry landing pages (EN + FI). Used by build-vertical-pages.py.

Keep claims to what the product does today (see product/customer-journey.md) and current pricing.
Offer examples are suggestions, not past deals.
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
        'offers_h': 'Offers that work',
        'offers_lead': 'Examples to start from. You decide what you give and what you ask for in return.',
        'tips_h': 'Before the first visit',
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
        'tips': [
            ('i-check', 'Agree it in writing', 'Write down the visit date, what is posted (for example one reel and two stories), when, and that the post carries a clear ad label. A two-line message is enough.'),
            ('i-tag', 'Label it as advertising', 'A gifted visit in return for a post is commercial cooperation under Finnish rules. The creator marks the post as an ad and names your business. Our <a href="/blog/influencer-marketing-disclosure-finland">disclosure guide</a> has the details.'),
            ('i-trend', 'Measure visits, not likes', 'Give each creator a code word or a small extra for their followers ("say Reel at the counter"). Count how many people use it in the two weeks after the post.'),
        ],
    },
    'fi': {
        'cta_btn': 'Julkaise ensimmäinen tarjous →',
        'steps_h': 'Miten se toimii',
        'offers_h': 'Toimivia tarjouksia',
        'offers_lead': 'Esimerkkejä, joista aloittaa. Sinä päätät, mitä annat ja mitä pyydät vastineeksi.',
        'tips_h': 'Ennen ensimmäistä käyntiä',
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
        'tips': [
            ('i-check', 'Sovi kirjallisesti', 'Kirjaa käyntipäivä, mitä julkaistaan (esimerkiksi yksi reels ja kaksi storya), milloin, ja että julkaisussa on selvä mainosmerkintä. Kahden rivin viesti riittää.'),
            ('i-tag', 'Merkitse mainokseksi', 'Lahjaksi saatu käynti julkaisua vastaan on kaupallista yhteistyötä. Tuottaja merkitsee julkaisun mainokseksi ja nimeää yrityksesi. Lue lisää <a href="/fi/blogi/vaikuttajamarkkinoinnin-merkinta">KKV:n ohjeista</a>.'),
            ('i-trend', 'Mittaa käyntejä, älä tykkäyksiä', 'Anna jokaiselle tuottajalle koodisana tai pieni etu hänen seuraajilleen ("sano Reels kassalla"). Laske, moniko käyttää sitä kahden viikon aikana julkaisusta.'),
        ],
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
        'offers': [
            ('i-gift', 'Dinner for two', 'Starter, two mains and a drink each → 1 reel + 2 stories within a week.'),
            ('i-spark', 'New menu tasting', 'Tasting of the new seasonal menu → 1 reel on launch week + stories on the night.'),
            ('i-store', 'Lunch for a weekday crowd', 'Lunch for two on Tuesday → 3 stories with the lunch price and opening hours.'),
            ('i-bolt', 'Brunch or weekend set', 'Weekend brunch for two → 1 TikTok + 1 Instagram post with your location tag.'),
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
        'offers': [
            ('i-gift', 'Illallinen kahdelle', 'Alkuruoka, kaksi pääruokaa ja juomat → 1 reels + 2 storya viikon sisällä.'),
            ('i-spark', 'Uuden menun maistelu', 'Uuden sesonkimenun maistelu → 1 reels julkaisuviikolla + storyt illan aikana.'),
            ('i-store', 'Arkilounas', 'Lounas kahdelle tiistaina → 3 storya, joissa lounaan hinta ja aukioloajat.'),
            ('i-bolt', 'Brunssi tai viikonloppumenu', 'Viikonloppubrunssi kahdelle → 1 TikTok + 1 Instagram-julkaisu sijaintimerkinnällä.'),
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
        'offers': [
            ('i-gift', 'Coffee and cake for two', 'Two drinks and two pastries → 3 stories with your location tag.'),
            ('i-spark', 'Seasonal drink launch', 'First taste of the new seasonal drink → 1 reel in launch week.'),
            ('i-store', 'Brunch for two', 'Weekend brunch → 1 reel or TikTok + 1 feed post.'),
            ('i-phone', 'Work-from-café morning', 'Coffee refills and lunch for a remote-work morning → stories showing the Wi-Fi, sockets and quiet tables.'),
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
        'offers': [
            ('i-gift', 'Kahvit ja kakut kahdelle', 'Kaksi juomaa ja kaksi leivonnaista → 3 storya sijaintimerkinnällä.'),
            ('i-spark', 'Sesonkijuoman lanseeraus', 'Uuden sesonkijuoman ensimaistelu → 1 reels lanseerausviikolla.'),
            ('i-store', 'Brunssi kahdelle', 'Viikonloppubrunssi → 1 reels tai TikTok + 1 julkaisu.'),
            ('i-phone', 'Etätyöaamu kahvilassa', 'Santsikahvit ja lounas etätyöaamuna → storyt, joissa näkyy wifi, pistorasiat ja rauhalliset pöydät.'),
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
        'offers': [
            ('i-gift', 'Haircut and styling', 'Cut and blow-dry → 1 reel showing before and after + 2 stories.'),
            ('i-spark', 'Colour or balayage', 'Colour treatment → 1 reel + a feed post with the stylist tagged.'),
            ('i-store', 'Nails, lashes or brows', 'Gel nails or a lash lift → 3 stories with the price list and booking link.'),
            ('i-timer', 'Facial or massage', 'Facial treatment → 1 reel on the calm, the room and the result.'),
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
        'offers': [
            ('i-gift', 'Leikkaus ja muotoilu', 'Leikkaus ja föönaus → 1 reels ennen ja jälkeen + 2 storya.'),
            ('i-spark', 'Väri tai balayage', 'Värikäsittely → 1 reels + julkaisu, jossa kampaaja on merkitty.'),
            ('i-store', 'Kynnet, ripset tai kulmat', 'Geelikynnet tai ripsien kestotaivutus → 3 storya hinnaston ja varauslinkin kanssa.'),
            ('i-timer', 'Kasvohoito tai hieronta', 'Kasvohoito → 1 reels rauhasta, tilasta ja tuloksesta.'),
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
        'offers': [
            ('i-gift', 'Trial week', 'One week of free training → 1 reel from the first session + stories during the week.'),
            ('i-spark', 'Month pass', 'One-month membership → 2 reels (start and end of the month) + stories.'),
            ('i-store', 'Class for two', 'Yoga, boxing or spinning class for the creator and a friend → 1 TikTok or reel.'),
            ('i-trend', 'PT session', 'Personal training session → 1 reel with the trainer\'s tips for beginners.'),
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
        'offers': [
            ('i-gift', 'Kokeiluviikko', 'Viikko ilmaista treeniä → 1 reels ensimmäiseltä kerralta + storyt viikon aikana.'),
            ('i-spark', 'Kuukausikortti', 'Kuukauden jäsenyys → 2 reelsiä (kuukauden alussa ja lopussa) + storyt.'),
            ('i-store', 'Tunti kahdelle', 'Jooga-, nyrkkeily- tai spinningtunti tuottajalle ja ystävälle → 1 TikTok tai reels.'),
            ('i-trend', 'PT-tunti', 'Personal training -tunti → 1 reels, jossa valmentajan vinkit aloittelijoille.'),
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
