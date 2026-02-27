// ===== Game Locations =====
// Curated list of interesting locations around the world for offline play
// Each location has coordinates and metadata

const LOCATIONS = [
    // Europe
    { lat: 48.8566, lng: 2.3522, country: 'Fransa', city: 'Paris', hint: 'Işık Şehri', funFact: 'Paris\'te sadece bir tane "Dur" tabelası bulunmaktadır.', funFactEN: 'There is only one stop sign in all of Paris.' },
    { lat: 41.9028, lng: 12.4964, country: 'İtalya', city: 'Roma', hint: 'Ebedi Şehir', funFact: 'Trevi Çeşmesi\'ne her gün yaklaşık 3.000 Euro atılır ve bu para hayır kurumlarına bağışlanır.', funFactEN: 'About 3,000 Euros are thrown into the Trevi Fountain every day and donated to charity.' },
    { lat: 51.5074, lng: -0.1278, country: 'İngiltere', city: 'Londra', hint: 'Big Ben\'in evi', funFact: 'Londra\'da otobüslerin kırmızı olmasının sebebi eskiden rakip firmalardan ayırt edilmek istenmesidir.', funFactEN: 'London\'s buses are red because early bus companies painted them to stand out from competitors.' },
    { lat: 52.5200, lng: 13.4050, country: 'Almanya', city: 'Berlin', hint: 'Brandenburg Kapısı', funFact: 'Berlin, Venedik\'ten daha fazla köprüye (yaklaşık 1700 adet) sahiptir.', funFactEN: 'Berlin has more bridges (around 1,700) than Venice.' },
    { lat: 40.4168, lng: -3.7038, country: 'İspanya', city: 'Madrid', hint: 'Kraliyet Sarayı', funFact: 'Madrid, Avrupa\'nın en yüksek rakımlı başkentlerinden biridir.', funFactEN: 'Madrid is one of the highest-altitude capital cities in Europe.' },
    { lat: 59.3293, lng: 18.0686, country: 'İsveç', city: 'Stockholm', hint: 'Kuzeyin Venediği', funFact: 'Stockholm 14 ada üzerine kurulmuştur ve suları o kadar temizdir ki şehir merkezinde balık tutulabilir.', funFactEN: 'Stockholm is built on 14 islands, and the water is so clean you can fish right in the city center.' },
    { lat: 48.2082, lng: 16.3738, country: 'Avusturya', city: 'Viyana', hint: 'Müzik Şehri', funFact: 'Viyana, dünyanın kesintisiz olarak devam eden en eski hayvanat bahçesine (Schönbrunn) ev sahipliği yapar.', funFactEN: 'Vienna is home to the world\'s oldest continuously operating zoo, Schönbrunn.' },
    { lat: 50.0755, lng: 14.4378, country: 'Çekya', city: 'Prag', hint: 'Yüz Kuleli Şehir', funFact: 'Prag Kalesi, Guinness Rekorlar Kitabı\'na göre dünyanın en büyük antik kalesidir.', funFactEN: 'Prague Castle is the world\'s largest ancient castle according to the Guinness Book of World Records.' },
    { lat: 47.4979, lng: 19.0402, country: 'Macaristan', city: 'Budapeşte', hint: 'Tuna\'nın İncisi', funFact: 'Budapeşte aslında Buda, Peşte ve Óbuda isimli üç ayrı şehrin birleşmesinden oluşur.', funFactEN: 'Budapest was formed by the union of three separate cities: Buda, Pest, and Óbuda.' },
    { lat: 38.7223, lng: -9.1393, country: 'Portekiz', city: 'Lizbon', hint: 'Yedi tepeli şehir', funFact: 'Lizbon, Roma\'dan daha eski olan ve Avrupa\'nın en eski şehirlerinden biridir.', funFactEN: 'Lisbon is one of the oldest cities in Europe, even older than Rome.' },
    { lat: 55.6761, lng: 12.5683, country: 'Danimarka', city: 'Kopenhag', hint: 'Küçük Deniz Kızı', funFact: 'Kopenhag\'da bisiklet sayısı, araba ve hatta insan sayısından daha fazladır.', funFactEN: 'Copenhagen has more bicycles than cars — and even more bicycles than people.' },
    { lat: 60.1699, lng: 24.9384, country: 'Finlandiya', city: 'Helsinki', hint: 'Kuzeyin Beyaz Şehri', funFact: 'Helsinki suları o kadar temizdir ki musluk suyu şişe suyundan bile daha kalitelidir.', funFactEN: 'Helsinki\'s tap water is so clean it is considered higher quality than most bottled water.' },
    { lat: 37.9838, lng: 23.7275, country: 'Yunanistan', city: 'Atina', hint: 'Akropolis', funFact: 'Atina, Avrupa\'nın üzerine kurulan en eski başkentidir.', funFactEN: 'Athens is the oldest capital city in Europe, with a recorded history spanning 3,400 years.' },
    { lat: 41.0082, lng: 28.9784, country: 'Türkiye', city: 'İstanbul', hint: 'Doğunun Batı ile buluştuğu yer', funFact: 'İstanbul, hem Asya hem de Avrupa kıtalarına yayılan dünyadaki tek metropoldür.', funFactEN: 'Istanbul is the only metropolis in the world that spans two continents: Europe and Asia.' },
    { lat: 44.4268, lng: 26.1025, country: 'Romanya', city: 'Bükreş', hint: 'Küçük Paris', funFact: 'Bükreş\'teki Parlamento Sarayı, dünyanın en ağır binasıdır.', funFactEN: 'The Palace of Parliament in Bucharest is the heaviest building in the world.' },
    { lat: 45.4642, lng: 9.1900, country: 'İtalya', city: 'Milano', hint: 'Moda Başkenti', funFact: 'Milano Duomo Katedralinin inşası neredeyse 600 yıl sürmüştür.', funFactEN: 'The construction of Milan\'s Duomo Cathedral took nearly 600 years to complete.' },
    { lat: 43.2965, lng: 5.3698, country: 'Fransa', city: 'Marsilya', hint: 'Liman şehri', funFact: 'Marsilya, Fransa\'nın en güneşli ve en eski şehridir.', funFactEN: 'Marseille is the sunniest and oldest city in France, founded by the Greeks around 600 BC.' },
    { lat: 53.3498, lng: -6.2603, country: 'İrlanda', city: 'Dublin', hint: 'Temple Bar', funFact: 'Avrupa\'nın en büyük parkı olan Phoenix Park Dublin\'dedir ve Central Park\'tan iki kat daha büyüktür.', funFactEN: 'Phoenix Park in Dublin is one of Europe\'s largest enclosed city parks, twice the size of Central Park.' },
    { lat: 46.2044, lng: 6.1432, country: 'İsviçre', city: 'Cenevre', hint: 'Jet d\'Eau', funFact: 'Cenevre, dünyanın en büyük saat onarım merkezidir ve "Saatçiliğin Başkenti" olarak bilinir.', funFactEN: 'Geneva is home to the world\'s largest watch repair center and is known as the "Capital of Watchmaking."' },
    { lat: 52.3676, lng: 4.9041, country: 'Hollanda', city: 'Amsterdam', hint: 'Kanallar Şehri', funFact: 'Amsterdam\'ın çoğu deniz seviyesinin altındadır, bu yüzden şehir devasa direkler üzerine inşa edilmiştir.', funFactEN: 'Much of Amsterdam sits below sea level, so the city was built on millions of wooden poles.' },

    // Asia
    { lat: 35.6762, lng: 139.6503, country: 'Japonya', city: 'Tokyo', hint: 'Doğan Güneşin Ülkesi', funFact: 'Tokyo, dünyanın en kalabalık metropol alanıdır ve yaya geçidinde (Shibuya) aynı anda 3.000 kişi karşıya geçebilir.', funFactEN: 'Tokyo is the world\'s most populous metropolitan area, and up to 3,000 people can cross Shibuya Crossing at the same time.' },
    { lat: 37.5665, lng: 126.9780, country: 'Güney Kore', city: 'Seul', hint: 'K-Pop Başkenti', funFact: 'Seul\'deki internet hızı, dünyanın geri kalan şehirlerinden çok daha yüksektir.', funFactEN: 'Seoul consistently ranks among the top cities in the world for internet speed.' },
    { lat: 39.9042, lng: 116.4074, country: 'Çin', city: 'Pekin', hint: 'Yasak Şehir', funFact: 'Yasak Şehir tam olarak 9.999 odaya sahiptir, çünkü 10.000 rakamı sadece cennet için kutsal kabul edilir.', funFactEN: 'The Forbidden City has exactly 9,999 rooms because the number 10,000 was considered sacred and reserved for heaven.' },
    { lat: 22.3193, lng: 114.1694, country: 'Hong Kong', city: 'Hong Kong', hint: 'Doğunun İncisi', funFact: 'Hong Kong, dünyada en çok gökdelene (yaklaşık 9000 adet) sahip olan şehirdir.', funFactEN: 'Hong Kong has more skyscrapers (around 9,000) than any other city in the world.' },
    { lat: 1.3521, lng: 103.8198, country: 'Singapur', city: 'Singapur', hint: 'Aslan Şehir', funFact: 'Singapur sadece bir şehir veya ülke değil, aynı zamanda 63 adadan oluşan bir ada devletidir.', funFactEN: 'Singapore is not just a city or a country — it is an island city-state made up of 63 islands.' },
    { lat: 13.7563, lng: 100.5018, country: 'Tayland', city: 'Bangkok', hint: 'Melekler Şehri', funFact: 'Bangkok\'un gerçek törensel adı Dünya rekorlar kitabına göre dünyanın en uzun şehir ismidir.', funFactEN: 'Bangkok\'s full ceremonial name is the longest city name in the world according to the Guinness World Records.' },
    { lat: 28.6139, lng: 77.2090, country: 'Hindistan', city: 'Yeni Delhi', hint: 'Hindistan Kapısı', funFact: 'Aynı şehirmiş gibi anılsa da Delhi ve Yeni Delhi farklıdır ve Yeni Delhi aslen İngilizler tarafından tasarlanmıştır.', funFactEN: 'Delhi and New Delhi are different places: New Delhi is a small district within the larger city of Delhi, designed by the British.' },
    { lat: 25.2048, lng: 55.2708, country: 'BAE', city: 'Dubai', hint: 'Burj Khalifa', funFact: 'Dubai polisi sadece süper spor arabalar veya lüks arabalar devriyesine sahiptir, hatta aralarında Bugatti bile bulunur.', funFactEN: 'Dubai\'s police fleet includes supercars like Lamborghinis, Ferraris, and even a Bugatti.' },
    { lat: 31.2304, lng: 121.4737, country: 'Çin', city: 'Şanghay', hint: 'The Bund', funFact: 'Şanghay metrosu dünyadaki en uzun metro ağına sahiptir.', funFactEN: 'Shanghai\'s metro system is the longest in the world by total track length.' },
    { lat: 14.5995, lng: 120.9842, country: 'Filipinler', city: 'Manila', hint: 'Doğu Denizlerinin İncisi', funFact: 'Manila, metrekareye düşen insan sayısı bakımından dünyanın en yoğun ve kalabalık şehirdir.', funFactEN: 'Manila is the most densely populated city in the world, with the most people per square kilometer.' },
    { lat: 35.0116, lng: 135.7681, country: 'Japonya', city: 'Kyoto', hint: 'Tapınaklar Şehri', funFact: 'Kyoto, İkinci Dünya Savaşı sırasında taşıdığı devasa kültürel miras yüzünden atom bombası hedefi olmaktan çıkarılmıştır.', funFactEN: 'Kyoto was removed from the atomic bomb target list in WWII due to its immense cultural significance.' },
    { lat: 34.6937, lng: 135.5023, country: 'Japonya', city: 'Osaka', hint: 'Japonya\'nın Mutfağı', funFact: 'Osaka halkının huyu olan "Kuidaore" aşırı yediğinden ötürü kendini iflas ettirmek demektir.', funFactEN: 'Osaka has a cultural concept called "Kuidaore," which means eating yourself into bankruptcy.' },
    { lat: 21.0278, lng: 105.8342, country: 'Vietnam', city: 'Hanoi', hint: 'Göller Şehri', funFact: 'Hanoi şehrinin ortasında yer alan caddeler o kadar dardır ki, trenler binaların arasından bir metre kadar yakın geçer.', funFactEN: 'In Hanoi\'s Old Quarter, streets are so narrow that trains pass within a meter of people\'s homes.' },

    // Americas
    { lat: 40.7128, lng: -74.0060, country: 'ABD', city: 'New York', hint: 'Büyük Elma', funFact: 'Times Square aslında bir kare (Square) değildir, iki farklı caddenin kesiştiği üçgen bir kavşaktır.', funFactEN: 'Times Square is not actually a square — it is a bowtie-shaped intersection of two major streets.' },
    { lat: 34.0522, lng: -118.2437, country: 'ABD', city: 'Los Angeles', hint: 'Melekler Şehri', funFact: 'Meşhur Hollywood tabelası aslında başlangıçta "Hollywoodland" şeklindeydi ve bir emlak projesinin reklamıydı.', funFactEN: 'The famous Hollywood sign originally read "Hollywoodland" and was built as a real estate advertisement.' },
    { lat: 41.8781, lng: -87.6298, country: 'ABD', city: 'Chicago', hint: 'Rüzgarlı Şehir', funFact: 'Chicago nehri sadece ABD\'de tersten akan tek nehirdir (yönü 1900 yılında mühendislik ile ters çevrilmiştir).', funFactEN: 'The Chicago River is one of the few rivers in the world to flow backwards — its direction was reversed by engineers in 1900.' },
    { lat: 25.7617, lng: -80.1918, country: 'ABD', city: 'Miami', hint: 'Sihirli Şehir', funFact: 'Miami, bir kadın tarafından (Julia Tuttle) kurulan Amerika\'daki tek büyük şehirdir.', funFactEN: 'Miami is the only major US city founded by a woman — Julia Tuttle.' },
    { lat: 37.7749, lng: -122.4194, country: 'ABD', city: 'San Francisco', hint: 'Golden Gate', funFact: 'Aslında Golden Gate Köprüsü hiçbir zaman kırmızı veya altın sarısına boyanmamıştır, üzerindeki renk "Uluslararası Turuncu"dur.', funFactEN: 'The Golden Gate Bridge is painted in a color called "International Orange" — not red or gold.' },
    { lat: -22.9068, lng: -43.1729, country: 'Brezilya', city: 'Rio de Janeiro', hint: 'Kurtarıcı İsa', funFact: 'Rio de Janeiro adını, kaşiflerin körfezi büyük bir nehir ağzı zannetmesinden alır ("Ocak Nehri").', funFactEN: 'Rio de Janeiro got its name because Portuguese explorers mistook its bay for a river mouth in January ("River of January").' },
    { lat: -34.6037, lng: -58.3816, country: 'Arjantin', city: 'Buenos Aires', hint: 'Güney Amerika\'nın Parisi', funFact: 'Dünyadaki en geniş bulvar, (Avenida 9 de Julio) Buenos Aires şehrindedir.', funFactEN: 'The widest avenue in the world, Avenida 9 de Julio, is located in Buenos Aires.' },
    { lat: 19.4326, lng: -99.1332, country: 'Meksika', city: 'Mexico City', hint: 'Aztek Başkenti', funFact: 'Mexico City eski bir tatlı su gölünün üstüne kurulmuştur ve her yıl yavaş yavaş batmaktadır.', funFactEN: 'Mexico City was built on top of an ancient lake bed and sinks several centimeters every year.' },
    { lat: -33.4489, lng: -70.6693, country: 'Şili', city: 'Santiago', hint: 'And Dağları Geçidi', funFact: 'Eğer hava şansınıza dumansızsa, şehrin arkasında muazzam And Dağları tam bir duvar gibi ufukta durur.', funFactEN: 'On clear days, the Andes Mountains rise dramatically behind Santiago like a giant wall of snow-capped peaks.' },
    { lat: -12.0464, lng: -77.0428, country: 'Peru', city: 'Lima', hint: 'Krallar Şehri', funFact: 'Lima dünyadaki en büyük ikinci çöl şehridir, hiç yağmur yağmamasına rağmen oldukça bulutludur.', funFactEN: 'Lima is the second-largest desert city in the world — it almost never rains, yet it\'s almost always overcast.' },
    { lat: 45.5017, lng: -73.5673, country: 'Kanada', city: 'Montreal', hint: 'Fransız Kanadası', funFact: 'Dünyadaki hiçbir şehir Montreal kadar şurada burada kilise kaynamaz - hatta Mark Twain burayı "Kilise fırlatmadan yürünmeyecek şehir" koymuştur.', funFactEN: 'Montreal has so many churches that Mark Twain once said you could not throw a stone without breaking a church window.' },
    { lat: 43.6532, lng: -79.3832, country: 'Kanada', city: 'Toronto', hint: 'CN Kulesi', funFact: 'Toronto\'nun altında 30 kilometre uzunluğunda devasa bir yer altı yürüme yolu kompleksi olan PATH bulunur.', funFactEN: 'Toronto\'s underground pedestrian walkway, PATH, stretches over 30 kilometers beneath the city.' },
    { lat: 49.2827, lng: -123.1207, country: 'Kanada', city: 'Vancouver', hint: 'Kuzeyin Hollywoodu', funFact: 'Vancouver, Amerika TV şovları için "Her yere benzeyebilen" mükemmel bir doğal sahne rolünü en çok oynayan şehirdir.', funFactEN: 'Vancouver is one of the most popular filming locations in the world, often doubling for other cities in Hollywood productions.' },

    // Africa
    { lat: 30.0444, lng: 31.2357, country: 'Mısır', city: 'Kahire', hint: 'Piramitler', funFact: 'Büyük Piramit, Giza, tam bir kusursuzlukla yapılmıştır; öyle ki taşların arasına bir kağıt bile sığdırılamaz.', funFactEN: 'The Great Pyramid of Giza was built with such precision that a piece of paper cannot be slipped between its stones.' },
    { lat: -33.9249, lng: 18.4241, country: 'Güney Afrika', city: 'Cape Town', hint: 'Masa Dağı', funFact: 'Yakınındaki Masa Dağı, 250 milyon yıldan yaşlıdır yani Alplerden ve And Dağlarından çok daha eskidir.', funFactEN: 'Table Mountain is over 250 million years old, making it far older than the Alps or the Himalayas.' },
    { lat: 33.5731, lng: -7.5898, country: 'Fas', city: 'Kazablanka', hint: 'Beyaz Şehir', funFact: 'Kazablanka en meşhur Hollywood filminin ismini taşısa da, o film aslında hiçbir zaman Fas\'ta çekilmemiştir.', funFactEN: 'The famous film "Casablanca" was never actually filmed in Casablanca — it was shot entirely in Hollywood.' },
    { lat: -1.2921, lng: 36.8219, country: 'Kenya', city: 'Nairobi', hint: 'Safari Başkenti', funFact: 'Dünyada tam merkezinde, aslanları ve zürafaları ile vahşi doğa ulusal parkı bulunduran tek başkent.', funFactEN: 'Nairobi is the only capital city in the world with a national park featuring lions and giraffes within its limits.' },
    { lat: 6.5244, lng: 3.3792, country: 'Nijerya', city: 'Lagos', hint: 'Mükemmeliyet Merkezi', funFact: 'İsmi Lagos (Göller), Portekizliler tarafından verilmiştir; zira şehir kocaman bir sürü adalar topluluğundan oluşmaktadır.', funFactEN: 'Lagos was named by the Portuguese ("Lakes") because it is a collection of islands surrounded by water.' },

    // Oceania
    { lat: -33.8688, lng: 151.2093, country: 'Avustralya', city: 'Sidney', hint: 'Opera Binası', funFact: 'Opera Binası\'nın mimarı tasarımı tamamlayabilmek için bir portakalı soyup kabuklarının dizilişinden ilham almıştır.', funFactEN: 'The architect of the Sydney Opera House found inspiration for its roof design by peeling an orange.' },
    { lat: -37.8136, lng: 144.9631, country: 'Avustralya', city: 'Melbourne', hint: 'Kültür Başkenti', funFact: 'Melbourne dünyadaki en yavaş genişleyen şehir olsa da en fazla espresso makinesine sahip olan başkenttir.', funFactEN: 'Melbourne is renowned for its coffee culture and is considered by many to have the best espresso outside Italy.' },
    { lat: -36.8485, lng: 174.7633, country: 'Yeni Zelanda', city: 'Auckland', hint: 'Yelkenler Şehri', funFact: 'Şehir eski volkanlar üzerine kuruludur. İnanılmaz ama şehirde tam tamına 50 adet uyuyan volkanik bölge vardır.', funFactEN: 'Auckland was built on 50 dormant volcanoes — making it one of the world\'s most volcanically active urban areas.' },
    { lat: -27.4698, lng: 153.0251, country: 'Avustralya', city: 'Brisbane', hint: 'Nehir Şehri', funFact: 'Dünyadaki ilk koala barınağı bu şehirdedir.', funFactEN: 'Brisbane is home to the world\'s first koala sanctuary, opened in 1927.' },

    // Middle East
    { lat: 31.7683, lng: 35.2137, country: 'İsrail', city: 'Kudüs', hint: 'Kutsal Şehir', funFact: 'Tarihi boyunca tam 44 kez fethedilmiş, 23 kez saldırıya uğramış ve iki kez tamamen yok edilmiştir.', funFactEN: 'Jerusalem has been conquered 44 times, attacked 52 times, besieged 23 times, and completely destroyed twice throughout history.' },
    { lat: 24.7136, lng: 46.6753, country: 'Suudi Arabistan', city: 'Riyad', hint: 'Krallık Kulesi', funFact: 'Riyad, dünyadaki en büyük deve pazarının ev sahibidir, pazar günde ortalama 100 deve satar.', funFactEN: 'Riyadh is home to one of the world\'s largest camel markets, where hundreds of camels are traded every day.' },
    { lat: 33.8938, lng: 35.5018, country: 'Lübnan', city: 'Beyrut', hint: 'Ortadoğu\'nun Parisi', funFact: 'Romanlar zamanından kalma Berytus ismindeki antik Beyrut, dünyanın gördüğü en büyük Hukuk Okullarından birini içeriyordu.', funFactEN: 'Ancient Beirut (Berytus) housed one of the greatest law schools of the ancient world during the Roman era.' },
    { lat: 39.9334, lng: 32.8597, country: 'Türkiye', city: 'Ankara', hint: 'Türkiye\'nin başkenti', funFact: 'Ankara, Hitit döneminden beri çok önemli bir yerleşim yeridir ancak kedisi ve tiftik keçisiyle çok eski çağlardan beri tanınmaktadır.', funFactEN: 'Ankara has been an important settlement since the Hittite era and has been famous for its angora cats and goats for centuries.' },
    { lat: 38.4237, lng: 27.1428, country: 'Türkiye', city: 'İzmir', hint: 'Ege\'nin İncisi', funFact: 'Dünyanın yedi harikasından biri olan Artemis Tapınağı İzmir (Efes) dolaylarında yer alır.', funFactEN: 'One of the Seven Wonders of the Ancient World, the Temple of Artemis, was located near Izmir (ancient Ephesus).' },
    { lat: 36.8969, lng: 30.7133, country: 'Türkiye', city: 'Antalya', hint: 'Turizm başkenti', funFact: 'Bünyesinde Karain Magarası bulunur, Karain dünyada neandertal insanlarının izlerine ev sahipliği yapan nadir konumlardandır.', funFactEN: 'Antalya is home to Karain Cave, one of the very few places in the world with evidence of Neanderthal habitation.' },
    { lat: 40.1885, lng: 29.0610, country: 'Türkiye', city: 'Bursa', hint: 'Yeşil Bursa', funFact: 'Bursa, İskender Kebabınının patentinin alındığı dünya harikası olan, Osmanlı nizamının da kurucu başkentidir.', funFactEN: 'Bursa was the first capital of the Ottoman Empire and is the birthplace of the Iskender kebab.' },
    { lat: 36.9914, lng: 35.3289, country: 'Türkiye', city: 'Adana', hint: 'Kebap başkenti', funFact: 'Adana, dev Roma ovası (Seyhan ve Ceyhan nehirlerinin arası) sebebiyle Anadolu\'nun en eski pamuk şehridir.', funFactEN: 'Adana is one of Anatolia\'s oldest cotton-growing cities, situated on the vast Roman plain between the Seyhan and Ceyhan rivers.' },
    { lat: 41.0027, lng: 39.7168, country: 'Türkiye', city: 'Trabzon', hint: 'Karadeniz fırtınası', funFact: 'Sümela Manastırı sadece sarp bir kayalığa oyularak yapıldığı için dünya mimari harikaları arasındadır.', funFactEN: 'The Sumela Monastery near Trabzon is carved directly into a sheer cliff face, making it one of the world\'s most dramatic architectural marvels.' },
    { lat: 39.7767, lng: 30.5206, country: 'Türkiye', city: 'Eskişehir', hint: 'Öğrenci şehri', funFact: 'Eskişehir\'in çokça ortasından geçen Porsuk nehri aslında Sakarya Nehrine bağlı olan uzun kollarından biridir.', funFactEN: 'The Porsuk River flowing through Eskişehir is a major tributary of the Sakarya River and shapes the city\'s unique charm.' },
    { lat: 37.9144, lng: 40.2306, country: 'Türkiye', city: 'Diyarbakır', hint: 'Tarihi Surlar', funFact: 'Diyarbakır Surları, Çin Seddi\'nden sonra dünyadaki kesintisiz en uzun ikinci tarihi savunma duvarıdır.', funFactEN: 'Diyarbakır\'s city walls are the second longest continuous historic defensive walls in the world after the Great Wall of China.' },
    { lat: 37.0662, lng: 37.3833, country: 'Türkiye', city: 'Gaziantep', hint: 'Gastronomi Şehri', funFact: 'Gaziantep, UNESCO tarafından Dünya Gastronomi Şehri ilan edilmiştir ve yüzden fazla fıstık yemeğine sahiptir.', funFactEN: 'Gaziantep was named a UNESCO Creative City of Gastronomy and has over 100 dishes featuring its famous pistachio.' },
    { lat: 38.3552, lng: 38.3095, country: 'Türkiye', city: 'Malatya', hint: 'Kayısı Diyarı', funFact: 'Malatya dünyadaki tüm kuru kayısı pazarının en büyük lider tedarikçisidir.', funFactEN: 'Malatya supplies around 80% of the world\'s dried apricots, making it the undisputed apricot capital of the world.' },
    { lat: 39.9000, lng: 41.2700, country: 'Türkiye', city: 'Erzurum', hint: 'Palandöken', funFact: 'Erzurum çok yüksektir; öylesine yüksektir ki "Gökyüzüne En Yakın Şehir" olarak bilinir.', funFactEN: 'Erzurum sits at an altitude of nearly 2,000 meters, making it one of the highest cities in Turkey and earning the nickname "City Closest to the Sky."' },
    { lat: 36.6200, lng: 34.3000, country: 'Türkiye', city: 'Mersin', hint: 'Tantuni şehri', funFact: 'Mersin, Orta Doğu ve Avrupa arasındaki en işlek serbest transit dev limana sahip şehirdir.', funFactEN: 'Mersin is home to one of the busiest free-trade ports in the Eastern Mediterranean, connecting the Middle East and Europe.' },
];

// Add random offset to locations for variety
function addRandomOffset(loc) {
    const minOffset = 0.0002;
    const range = 0.0006;
    const latShift = (Math.random() > 0.5 ? 1 : -1) * (minOffset + Math.random() * range);
    const lngShift = (Math.random() > 0.5 ? 1 : -1) * (minOffset + Math.random() * range);
    return {
        ...loc,
        lat: loc.lat + latShift,
        lng: loc.lng + lngShift,
    };
}

// Get random locations for a game
export function getRandomLocations(count = 5) {
    const shuffled = [...LOCATIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(addRandomOffset);
}

// Get locations filtered by region
export function getLocationsByRegion(region) {
    const regionMap = {
        'europe': ['Fransa', 'İtalya', 'İngiltere', 'Almanya', 'İspanya', 'İsveç', 'Avusturya', 'Çekya', 'Macaristan', 'Portekiz', 'Danimarka', 'Finlandiya', 'Yunanistan', 'Romanya', 'Hollanda', 'İrlanda', 'İsviçre'],
        'asia': ['Japonya', 'Güney Kore', 'Çin', 'Hong Kong', 'Singapur', 'Tayland', 'Hindistan', 'BAE', 'Filipinler', 'Vietnam'],
        'americas': ['ABD', 'Brezilya', 'Arjantin', 'Meksika', 'Şili', 'Peru', 'Kanada'],
        'africa': ['Mısır', 'Güney Afrika', 'Fas', 'Kenya', 'Nijerya'],
        'oceania': ['Avustralya', 'Yeni Zelanda'],
        'turkey': ['Türkiye'],
    };

    const countries = regionMap[region] || [];
    return LOCATIONS.filter(loc => countries.includes(loc.country));
}

// Get locations filtered by specific country
export function getLocationsByCountry(country, count = 5) {
    if (country === 'Dünya Geneli (Karışık)') {
        return getRandomLocations(count);
    }

    const countryLocations = LOCATIONS.filter(loc => loc.country === country);
    const shuffled = [...countryLocations].sort(() => Math.random() - 0.5);

    let result = [];
    let i = 0;
    while (result.length < count && countryLocations.length > 0) {
        result.push(addRandomOffset(shuffled[i % shuffled.length]));
        i++;
    }
    return result.sort(() => Math.random() - 0.5);
}

// Get all unique countries
export function getAllCountries() {
    return [...new Set(LOCATIONS.map(loc => loc.country))].sort();
}

export default LOCATIONS;
