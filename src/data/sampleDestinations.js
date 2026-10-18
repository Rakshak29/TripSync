/**
 * Curated Domestic Destination Dataset for Milestone 8.
 * Contains 40 diverse travel destinations across India's states and Union Territories.
 * All destinations adhere to the text-first design and standard questionnaire tagging schema.
 */

export const SAMPLE_DESTINATIONS = [
  {
    id: 'place_manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    category: 'Mountains',
    categoryIcon: '🏔️',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days (or 6–7 days with Solang & Rohtang)',
    groups: ["Friends / Boys' Trip", 'Family', 'Couple / Honeymoon', 'Solo'],
    experiences: [
      'Mountains',
      'Trekking',
      'Adventure',
      'Nature and Wildlife',
      'Relaxation',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹22,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful', 'Fun and Social'],
    description:
      'High-altitude Himalayan valley with snow-capped peaks, pine forests, and alpine trekking trails.',
    overview:
      'A premier mountain gateway in the Kullu Valley offering breathtaking alpine vistas, peaceful mountain cafe culture, and access to high mountain passes.',
    highlights: [
      'Solang Valley adventure sports & skiing',
      'Rohtang Pass high-altitude snow views',
      'Old Manali village & riverside cafes',
      'Hadimba Temple cedar forest walk',
      'Jogini Waterfall day trek',
    ],
    bestTime: 'October – June',
  },
  {
    id: 'place_goa',
    name: 'Goa',
    state: 'Goa',
    category: 'Beaches',
    categoryIcon: '🏖️',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days',
    groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Solo', 'Family'],
    experiences: [
      'Beaches',
      'Nightlife',
      'Relaxation',
      'Heritage and Culture',
      'Waterfalls',
    ],
    budgetRanges: ['10k-25k', '25k-50k', '50k+'],
    budgetDisplay: '₹15,000 – ₹30,000 per person',
    moods: ['Fun and Social', 'Scenic', 'Peaceful', 'Adventurous'],
    description:
      'Sun-drenched coastal haven featuring golden beaches, Portuguese heritage architecture, and fresh coastal seafood.',
    overview:
      'Goa combines relaxed coastal living with centuries-old colonial architecture, spice plantations, and vibrant coastal villages along the Arabian Sea.',
    highlights: [
      'Palolem & Agonda serene beaches',
      'Fort Aguada lighthouse & ramparts',
      'Old Goa UNESCO world heritage churches',
      'Anjuna & Vagator sunset cliffs',
      'Dudhsagar jungle waterfalls',
    ],
    bestTime: 'November – February',
  },
  {
    id: 'place_udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    categoryIcon: '🏰',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Couple / Honeymoon', 'Family', 'Solo'],
    experiences: [
      'Heritage and Culture',
      'Relaxation',
      'Mountains',
    ],
    budgetRanges: ['10k-25k', '25k-50k', '50k+'],
    budgetDisplay: '₹14,000 – ₹28,000 per person',
    moods: ['Peaceful', 'Cultural', 'Scenic'],
    description:
      'Known as the City of Lakes, featuring grand royal palaces, historic ghats, and tranquil boat rides on Lake Pichola.',
    overview:
      'Udaipur is renowned for its Rajput-era palace complexes, vibrant artisan bazaars, and reflective waterways surrounded by the ancient Aravalli Range.',
    highlights: [
      'City Palace waterfront complex',
      'Sunset boat ride on Lake Pichola',
      'Jag Mandir Island Palace',
      'Bagore Ki Haveli cultural performances',
      'Saheliyon Ki Bari royal fountains',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    category: 'Adventure & Spiritual',
    categoryIcon: '🌊',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ["Friends / Boys' Trip", 'Solo', 'Religious Group', 'Family'],
    experiences: [
      'Adventure',
      'Religious and Spiritual Places',
      'Waterfalls',
      'Mountains',
      'Relaxation',
      'Trekking',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹6,000 – ₹14,000 per person',
    moods: ['Adventurous', 'Spiritual', 'Peaceful', 'Scenic'],
    description:
      'Gateway to the Garhwal Himalayas offering world-class river rafting, peaceful ashrams, and Ganga evening aarti.',
    overview:
      'Rishikesh sits where the sacred Ganges emerges from the Himalayan foothills. Renowned as the yoga capital of the world, it blends thrilling white-water rapids with quiet riverside meditation.',
    highlights: [
      'White-water rafting on the Ganga',
      'Triveni Ghat evening Maha Aarti',
      'Beatles Ashram (Chaurasi Kutia)',
      'Neer Garh waterfall jungle trail',
      'Ram Jhula and Laxman Jhula walks',
    ],
    bestTime: 'September – November & March – May',
  },
  {
    id: 'place_munnar',
    name: 'Munnar',
    state: 'Kerala',
    category: 'Nature',
    categoryIcon: '🌿',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days',
    groups: ['Couple / Honeymoon', 'Family', 'Solo'],
    experiences: [
      'Nature and Wildlife',
      'Mountains',
      'Waterfalls',
      'Relaxation',
      'Trekking',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹24,000 per person',
    moods: ['Peaceful', 'Scenic'],
    description:
      'Rolling emerald tea plantations, misty mountain ridges, and biodiverse national parks in the Western Ghats.',
    overview:
      'Perched high in Kerala’s Western Ghats, Munnar is famous for sprawling tea estates, cool mountain breezes, and rare flora like the Neelakurinji flower.',
    highlights: [
      'Eravikulam National Park (Nilgiri Tahr habitat)',
      'Mattupetty Dam & reflection lake',
      'Tata Tea Museum & estate tasting',
      'Top Station mountain viewpoint',
      'Attukad waterfalls trail',
    ],
    bestTime: 'September – March',
  },
  {
    id: 'place_varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Heritage & Spiritual',
    categoryIcon: '🏛️',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Religious Group', 'Family', 'Solo'],
    experiences: [
      'Religious and Spiritual Places',
      'Heritage and Culture',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹5,000 – ₹12,000 per person',
    moods: ['Spiritual', 'Cultural', 'Peaceful'],
    description:
      'One of the world’s oldest continuously inhabited cities along the sacred Ganges river with historic ghats.',
    overview:
      'A profound spiritual and cultural epicenter steeped in ancient traditions, classical music, fine silk weaving, and memorable sunrise boat rituals along the riverfront.',
    highlights: [
      'Dashashwamedh Ghat evening Ganga Aarti',
      'Historic Kashi Vishwanath temple corridor',
      'Sunrise rowing boat ride on the sacred river',
      'Sarnath Buddhist pilgrimage ruins',
      'Historic narrow alleyways and street cuisine',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_ladakh',
    name: 'Ladakh',
    state: 'Ladakh',
    category: 'Mountains & Adventure',
    categoryIcon: '🏔️',
    durations: ['6-10', '11+'],
    durationDisplay: '7–10 days',
    groups: ["Friends / Boys' Trip", 'Solo', 'Couple / Honeymoon'],
    experiences: [
      'Mountains',
      'Adventure',
      'Trekking',
      'Nature and Wildlife',
      'Religious and Spiritual Places',
    ],
    budgetRanges: ['25k-50k', '50k+'],
    budgetDisplay: '₹30,000 – ₹60,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful', 'Cultural'],
    description:
      'Dramatic high-altitude desert plateaus, crystal-blue glacial lakes, and ancient Tibetan Buddhist gompas.',
    overview:
      'A stark and surreal mountain kingdom characterized by barren crags, prayer flags fluttering in thin air, and tranquil cliffside monasteries overlooking vast valleys.',
    highlights: [
      'Pangong Tso high-altitude lake',
      'Nubra Valley sand dunes & double-humped camels',
      'Khardung La mountain pass (17,582 ft)',
      'Thiksey & Hemis cliffside monasteries',
      'Magnetic Hill phenomenon',
    ],
    bestTime: 'May – September',
  },
  {
    id: 'place_jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage & Culture',
    categoryIcon: '🏰',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Family', "Friends / Boys' Trip", 'Couple / Honeymoon', 'Solo'],
    experiences: [
      'Heritage and Culture',
      'Nightlife',
      'Relaxation',
      'Adventure',
    ],
    budgetRanges: ['under-10k', '10k-25k', '25k-50k'],
    budgetDisplay: '₹8,000 – ₹18,000 per person',
    moods: ['Cultural', 'Fun and Social', 'Scenic'],
    description:
      'The iconic Pink City famous for imposing hilltop forts, terracotta-hued bazaars, and opulent royal architecture.',
    overview:
      'Founded in 1727, Jaipur is a planned historic city showcasing the pinnacle of Rajput architectural genius, vibrant textile bazaars, and majestic forts.',
    highlights: [
      'Amber Fort & Sheesh Mahal mirror palace',
      'Hawa Mahal (Palace of Winds)',
      'City Palace royal museum',
      'Jantar Mantar astronomical observatory',
      'Nahargarh Fort sunset view over the city',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_gokarna',
    name: 'Gokarna',
    state: 'Karnataka',
    category: 'Beaches & Spiritual',
    categoryIcon: '🏖️',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Solo', "Friends / Boys' Trip", 'Couple / Honeymoon', 'Religious Group'],
    experiences: [
      'Beaches',
      'Trekking',
      'Relaxation',
      'Religious and Spiritual Places',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹7,000 – ₹15,000 per person',
    moods: ['Peaceful', 'Scenic', 'Spiritual', 'Adventurous'],
    description:
      'Laid-back coastal temple town featuring pristine crescent beaches connected by scenic cliffside hiking trails.',
    overview:
      'A serene alternative to busier coastlines, Gokarna is revered both for the ancient Mahabaleshwar Temple and its tranquil, secluded beaches.',
    highlights: [
      'Om Beach & Kudle Beach hiking trail',
      'Half Moon & Paradise secluded coves',
      'Mahabaleshwar Temple spiritual center',
      'Beachside yoga and quiet cafes',
      'Cliff sunset viewpoints',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_meghalaya',
    name: 'Meghalaya (Shillong & Cherrapunji)',
    state: 'Meghalaya',
    category: 'Waterfalls & Nature',
    categoryIcon: '🌧️',
    durations: ['3-5', '6-10'],
    durationDisplay: '5–7 days',
    groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Solo', 'Family'],
    experiences: [
      'Waterfalls',
      'Trekking',
      'Nature and Wildlife',
      'Adventure',
      'Mountains',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹18,000 – ₹32,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful'],
    description:
      'The "Abode of Clouds" known for living root bridges, roaring canyon waterfalls, and clean highland villages.',
    overview:
      'Home to some of the wettest landscapes on earth, Meghalaya features dramatic limestone gorges, crystal-clear river canyons, and indigenous bio-engineering.',
    highlights: [
      'Double Decker Living Root Bridge trek (Nongriat)',
      'Nohkalikai & Wei Sawdong waterfalls',
      'Dawki Umngot crystal-clear river boating',
      'Mawsmai & Arwah limestone caves',
      'Mawlynnong eco-friendly heritage village',
    ],
    bestTime: 'October – April',
  },
  {
    id: 'place_amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    category: 'Spiritual & Heritage',
    categoryIcon: '🕊️',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Family', 'Religious Group', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Religious and Spiritual Places',
      'Heritage and Culture',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹5,000 – ₹12,000 per person',
    moods: ['Spiritual', 'Cultural', 'Fun and Social'],
    description:
      'Spiritual heart of Sikhism home to the gleaming Golden Temple and historic Punjabi cuisine.',
    overview:
      'Amritsar is globally revered for the Harmandir Sahib (Golden Temple), known for its serene nectar pool, 24-hour community kitchen (langar), and patriotic heritage.',
    highlights: [
      'Sri Harmandir Sahib (Golden Temple) day & night visit',
      'Wagah Border Beating Retreat ceremony',
      'Jallianwala Bagh memorial garden',
      'Partition Museum historical exhibits',
      'Famous Punjabi street food and dhabas',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_andaman',
    name: 'Andaman Islands (Havelock & Neil)',
    state: 'Andaman and Nicobar Islands',
    category: 'Beaches & Nature',
    categoryIcon: '🏝️',
    durations: ['6-10', '11+'],
    durationDisplay: '6–8 days',
    groups: ['Couple / Honeymoon', 'Family', "Friends / Boys' Trip", 'Solo'],
    experiences: [
      'Beaches',
      'Adventure',
      'Nature and Wildlife',
      'Relaxation',
    ],
    budgetRanges: ['25k-50k', '50k+'],
    budgetDisplay: '₹35,000 – ₹70,000 per person',
    moods: ['Scenic', 'Peaceful', 'Adventurous'],
    description:
      'Exotic tropical archipelago with turquoise lagoons, world-renowned diving reefs, and virgin white-sand shores.',
    overview:
      'Located in the Bay of Bengal, the Andaman archipelago offers pristine coral ecosystems, lush rainforests, and some of Asia’s most celebrated beaches.',
    highlights: [
      'Radhanagar Beach (Asia’s top-rated beach)',
      'Scuba diving & snorkeling at Elephant Beach',
      'Neil Island natural bridge & sunset coves',
      'Cellular Jail sound and light memorial',
      'Mangrove kayaking adventures',
    ],
    bestTime: 'October – May',
  },
  {
    id: 'place_shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    category: 'Mountains & Heritage',
    categoryIcon: '🏔️',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Family', 'Couple / Honeymoon', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Mountains',
      'Heritage and Culture',
      'Relaxation',
      'Nature and Wildlife',
    ],
    budgetRanges: ['under-10k', '10k-25k', '25k-50k'],
    budgetDisplay: '₹9,000 – ₹20,000 per person',
    moods: ['Scenic', 'Peaceful', 'Cultural'],
    description:
      'Colonial summer capital nestled in pine-forested ridges, famous for its historic Mall Road, toy train, and snow-dusted peaks.',
    overview:
      'Set amidst dramatic cedar and oak hills, Shimla is renowned for its Tudor and Neo-Gothic British-era architecture, scenic viewpoints, and heritage mountain railway.',
    highlights: [
      'UNESCO Kalka-Shimla Toy Train ride',
      'The Ridge and Christ Church',
      'Jakhu Temple hilltop viewpoint',
      'Mall Road promenade & heritage cafes',
      'Kufri alpine valley & cedar woods',
    ],
    bestTime: 'March – June & December – February',
  },
  {
    id: 'place_dharamshala',
    name: 'Dharamshala & McLeod Ganj',
    state: 'Himachal Pradesh',
    category: 'Mountains & Spiritual',
    categoryIcon: '🕊️',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days',
    groups: ['Solo', "Friends / Boys' Trip", 'Couple / Honeymoon', 'Family'],
    experiences: [
      'Mountains',
      'Trekking',
      'Religious and Spiritual Places',
      'Relaxation',
      'Waterfalls',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹8,000 – ₹18,000 per person',
    moods: ['Peaceful', 'Spiritual', 'Adventurous', 'Scenic'],
    description:
      'Residence of His Holiness the Dalai Lama, surrounded by pine forests, Tibetan monasteries, and the sheer cliffs of the Dhauladhar Range.',
    overview:
      'Blends Tibetan Buddhist heritage with mountain hiking in the upper Kangra valley. A vibrant hub of meditation, cafe culture, and scenic trekking trails.',
    highlights: [
      'Tsuglagkhang Complex (Dalai Lama Temple)',
      'Triund scenic ridge day trek',
      'Bhagsunag Waterfall and Shiva temple',
      'Norbulingka Institute Tibetan arts',
      'St. John in the Wilderness church',
    ],
    bestTime: 'September – June',
  },
  {
    id: 'place_nainital',
    name: 'Nainital',
    state: 'Uttarakhand',
    category: 'Lakes & Mountains',
    categoryIcon: '⛵',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Family', 'Couple / Honeymoon', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Mountains',
      'Nature and Wildlife',
      'Relaxation',
      'Waterfalls',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹7,000 – ₹16,000 per person',
    moods: ['Scenic', 'Peaceful'],
    description:
      'Charming Kumaon hill retreat set around the emerald crescent of Naini Lake, surrounded by seven lush green peaks.',
    overview:
      'Nainital is one of India’s most celebrated lake towns, offering traditional wooden boating, cliffside cable car panoramas, and crisp Himalayan air.',
    highlights: [
      'Boating on Naini Lake',
      'Naina Peak panoramic trek',
      'Snow View Point aerial ropeway',
      'Eco Cave Gardens natural boulder trail',
      'Pangot birdwatching valley',
    ],
    bestTime: 'March – June & October – February',
  },
  {
    id: 'place_haridwar',
    name: 'Haridwar',
    state: 'Uttarakhand',
    category: 'Spiritual',
    categoryIcon: '🪔',
    durations: ['1-2'],
    durationDisplay: '1–2 days',
    groups: ['Religious Group', 'Family', 'Solo'],
    experiences: [
      'Religious and Spiritual Places',
      'Heritage and Culture',
      'Relaxation',
    ],
    budgetRanges: ['under-10k'],
    budgetDisplay: '₹4,000 – ₹8,000 per person',
    moods: ['Spiritual', 'Cultural', 'Peaceful'],
    description:
      'One of the seven holiest Hindu pilgrimage centers, where the river Ganga leaves the Himalayas to enter the northern plains.',
    overview:
      'Haridwar is famous for Har Ki Pauri where thousands gather at dusk for floating clay lamps and the evening Maha Aarti ceremonies amidst sacred chants.',
    highlights: [
      'Har Ki Pauri evening Ganga Aarti',
      'Mansa Devi Temple hilltop ropeway',
      'Chandi Devi sacred shrine',
      'Maya Devi ancient temple',
      'Traditional bazaars of Moti Bazaar',
    ],
    bestTime: 'October – April',
  },
  {
    id: 'place_agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Heritage & Culture',
    categoryIcon: '🕌',
    durations: ['1-2'],
    durationDisplay: '1–2 days',
    groups: ['Family', 'Couple / Honeymoon', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Heritage and Culture',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹5,000 – ₹12,000 per person',
    moods: ['Cultural', 'Scenic', 'Peaceful'],
    description:
      'Mughal imperial city along the Yamuna river, celebrated worldwide for the peerless white-marble Taj Mahal.',
    overview:
      'A cornerstone of India’s Golden Triangle, Agra preserves some of the world’s most admired Mughal monuments, red sandstone forts, and artisan marble inlay crafts.',
    highlights: [
      'Taj Mahal sunrise viewing',
      'Agra Fort red sandstone palace',
      'Fatehpur Sikri ghost city complex',
      'Mehtab Bagh moonlit riverside garden',
      'Tomb of I\'timād-ud-Daulah (Baby Taj)',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_jodhpur',
    name: 'Jodhpur',
    state: 'Rajasthan',
    category: 'Heritage & Culture',
    categoryIcon: '🏰',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Family', 'Couple / Honeymoon', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Heritage and Culture',
      'Adventure',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k', '25k-50k'],
    budgetDisplay: '₹8,000 – ₹18,000 per person',
    moods: ['Cultural', 'Scenic', 'Adventurous'],
    description:
      'The historic Blue City crowned by the colossal Mehrangarh Fort overlooking a sea of indigo-painted cubic houses.',
    overview:
      'Jodhpur stands on the edge of the Thar Desert, distinguished by towering bastions, opulent Rajput palaces, and vibrant spice and handicraft markets.',
    highlights: [
      'Mehrangarh Fort museum & ramparts',
      'Jaswant Thada white marble cenotaph',
      'Umaid Bhawan Palace museum',
      'Old city blue lanes walking trail',
      'Flying Fox zip-line over the battlements',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_jaisalmer',
    name: 'Jaisalmer',
    state: 'Rajasthan',
    category: 'Desert & Heritage',
    categoryIcon: '🐪',
    durations: ['3-5'],
    durationDisplay: '3–4 days',
    groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Family', 'Solo'],
    experiences: [
      'Heritage and Culture',
      'Adventure',
      'Nightlife',
      'Relaxation',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹25,000 per person',
    moods: ['Adventurous', 'Cultural', 'Scenic', 'Fun and Social'],
    description:
      'The Golden City rising from Thar Desert dunes, crowned by a living yellow-sandstone fortress and ornate merchant havelis.',
    overview:
      'Known for its golden glow at sunset, Jaisalmer offers desert safari camping beneath starry desert skies, folk performances, and centuries-old carved havelis.',
    highlights: [
      'Jaisalmer Fort (Sonar Qila) living citadel',
      'Sam Sand Dunes camel safari and camping',
      'Patwon Ki Haveli five-story carved mansion',
      'Gadisar Lake historic sandstone ghats',
      'Kuldhara abandoned heritage village',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_srinagar',
    name: 'Srinagar & Gulmarg',
    state: 'Jammu and Kashmir',
    category: 'Mountains & Scenic',
    categoryIcon: '🏔️',
    durations: ['3-5', '6-10'],
    durationDisplay: '4–6 days',
    groups: ['Couple / Honeymoon', 'Family', "Friends / Boys' Trip", 'Solo'],
    experiences: [
      'Mountains',
      'Adventure',
      'Nature and Wildlife',
      'Relaxation',
    ],
    budgetRanges: ['25k-50k', '50k+'],
    budgetDisplay: '₹25,000 – ₹55,000 per person',
    moods: ['Scenic', 'Peaceful', 'Adventurous'],
    description:
      'Paradise on earth featuring tranquil Dal Lake shikaras, cedar-carved houseboats, and snow-capped ski slopes in Gulmarg.',
    overview:
      'Nestled in the Kashmir Valley, Srinagar and nearby Gulmarg showcase Mughal pleasure gardens, mirrored waterways, and the world’s second-highest operating cable car.',
    highlights: [
      'Shikara boat ride on Dal Lake at sunrise',
      'Traditional wooden houseboat stay',
      'Gulmarg Gondola ride to Apharwat Peak',
      'Shalimar & Nishat Mughal terraced gardens',
      'Pari Mahal mountain viewpoint',
    ],
    bestTime: 'April – October & December – February for snow',
  },
  {
    id: 'place_alleppey',
    name: 'Alleppey (Alappuzha)',
    state: 'Kerala',
    category: 'Backwaters & Relaxation',
    categoryIcon: '🛶',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Couple / Honeymoon', 'Family', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Relaxation',
      'Nature and Wildlife',
      'Beaches',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹26,000 per person',
    moods: ['Peaceful', 'Scenic'],
    description:
      'The Venice of the East, famed for traditional thatched houseboats drifting along tranquil palm-fringed backwaters.',
    overview:
      'Alleppey provides a slow, rejuvenating escape through an intricate labyrinth of lagoons, canals, paddy fields, and secluded coastal beaches.',
    highlights: [
      'Overnight houseboat cruise on Vembanad Lake',
      'Kayaking through narrow village canals',
      'Marari Beach serene coastline',
      'Alappuzha historic lighthouse & pier',
      'Fresh Kerala coastal cuisine and karimeen',
    ],
    bestTime: 'September – March',
  },
  {
    id: 'place_wayanad',
    name: 'Wayanad',
    state: 'Kerala',
    category: 'Waterfalls & Nature',
    categoryIcon: '🌿',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Family', 'Solo'],
    experiences: [
      'Waterfalls',
      'Nature and Wildlife',
      'Trekking',
      'Mountains',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹8,000 – ₹18,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful'],
    description:
      'Lush highland haven of spice plantations, prehistoric caves, cascading waterfalls, and misty rainforest peaks.',
    overview:
      'Perched on the southern tip of the Deccan plateau in the Western Ghats, Wayanad combines wildlife sanctuaries with tea estates and ancient petroglyphs.',
    highlights: [
      'Edakkal Caves neolithic rock engravings',
      'Meenmutty multi-tiered waterfall hike',
      'Banasura Sagar earth dam boating',
      'Chembra Peak heart-shaped lake trek',
      'Wayanad Wildlife Sanctuary jungle safari',
    ],
    bestTime: 'October – May',
  },
  {
    id: 'place_coorg',
    name: 'Coorg (Kodagu)',
    state: 'Karnataka',
    category: 'Mountains & Nature',
    categoryIcon: '☕',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Couple / Honeymoon', "Friends / Boys' Trip", 'Family', 'Solo'],
    experiences: [
      'Mountains',
      'Waterfalls',
      'Nature and Wildlife',
      'Relaxation',
      'Trekking',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹10,000 – ₹22,000 per person',
    moods: ['Peaceful', 'Scenic', 'Adventurous'],
    description:
      'The "Scotland of India", enveloped in emerald coffee estates, spice plantations, mist-covered hills, and thundering waterfalls.',
    overview:
      'Located along the slopes of the Western Ghats, Coorg is celebrated for its warm Kodava hospitality, aromatic coffee trails, and biodiversity.',
    highlights: [
      'Abbey Falls rainforest waterfall trail',
      'Namdroling Golden Temple Tibetan monastery',
      'Raja’s Seat sunset valley view',
      'Tadiandamol Peak highest mountain trek',
      'Dubare Elephant Camp riverside visit',
    ],
    bestTime: 'October – April',
  },
  {
    id: 'place_hampi',
    name: 'Hampi',
    state: 'Karnataka',
    category: 'Heritage & Culture',
    categoryIcon: '🏛️',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Solo', "Friends / Boys' Trip", 'Couple / Honeymoon', 'Family'],
    experiences: [
      'Heritage and Culture',
      'Trekking',
      'Relaxation',
      'Adventure',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹6,000 – ₹14,000 per person',
    moods: ['Cultural', 'Scenic', 'Peaceful', 'Adventurous'],
    description:
      'Surreal boulder-strewn UNESCO World Heritage capital of the Vijayanagara Empire along the Tungabhadra river.',
    overview:
      'Hampi features monumental granite temples, royal pavilions, and coracle boat rides set against an ancient prehistoric landscape of rust-colored monoliths.',
    highlights: [
      'Virupaksha Temple active ancient shrine',
      'Vittala Temple iconic Stone Chariot',
      'Coracle boat ride on Tungabhadra river',
      'Matanga Hill sunrise panorama',
      'Hippie Island boulder-hopping cafes',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_chikmagalur',
    name: 'Chikmagalur',
    state: 'Karnataka',
    category: 'Trekking & Mountains',
    categoryIcon: '🥾',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ["Friends / Boys' Trip", 'Solo', 'Couple / Honeymoon', 'Family'],
    experiences: [
      'Trekking',
      'Mountains',
      'Nature and Wildlife',
      'Waterfalls',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹7,000 – ₹16,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful'],
    description:
      'Birthplace of Indian coffee, renowned for high mountain peaks, dense shola forests, and rugged trekking paths.',
    overview:
      'Chikmagalur sits in the Baba Budan Giri range, offering cool mountain climates, misty morning viewpoints, and rewarding summit hikes.',
    highlights: [
      'Mullayanagiri Peak highest summit trek in Karnataka',
      'Baba Budangiri ancient mountain caves',
      'Hebbe Falls deep forest cascade',
      'Bhadra Wildlife Sanctuary safari',
      'Coffee plantation estate walking tours',
    ],
    bestTime: 'September – March',
  },
  {
    id: 'place_ooty',
    name: 'Ooty & Coonoor',
    state: 'Tamil Nadu',
    category: 'Mountains & Tea Estates',
    categoryIcon: '🚂',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Family', 'Couple / Honeymoon', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Mountains',
      'Nature and Wildlife',
      'Relaxation',
      'Waterfalls',
    ],
    budgetRanges: ['under-10k', '10k-25k', '25k-50k'],
    budgetDisplay: '₹9,000 – ₹20,000 per person',
    moods: ['Scenic', 'Peaceful'],
    description:
      'Queen of the Nilgiris featuring sprawling tea terraces, heritage blue toy trains, and cool eucalyptus-scented breezes.',
    overview:
      'Set in the Nilgiri Biosphere Reserve, Ooty and Coonoor provide classic hill station charm, botanical gardens, and scenic valley lookouts.',
    highlights: [
      'UNESCO Nilgiri Mountain Toy Train journey',
      'Doddabetta Peak highest Nilgiri viewpoint',
      'Government Botanical Garden collection',
      'Pykara Lake & waterfalls boat ride',
      'Sim’s Park in peaceful Coonoor',
    ],
    bestTime: 'October – June',
  },
  {
    id: 'place_kodaikanal',
    name: 'Kodaikanal',
    state: 'Tamil Nadu',
    category: 'Mountains & Waterfalls',
    categoryIcon: '🌲',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Couple / Honeymoon', "Friends / Boys' Trip", 'Family', 'Solo'],
    experiences: [
      'Mountains',
      'Waterfalls',
      'Trekking',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹8,000 – ₹18,000 per person',
    moods: ['Peaceful', 'Scenic'],
    description:
      'The "Princess of Hill Stations" nestled in the Palani Hills, renowned for its star-shaped lake, pine forests, and misty viewpoints.',
    overview:
      'At over 2,000 meters altitude, Kodaikanal provides crisp mountain weather, wooded walking paths like Coaker’s Walk, and dramatic granite cliffs.',
    highlights: [
      'Kodaikanal Lake cycling & boating',
      'Coaker’s Walk cliffside promenade',
      'Pillar Rocks 400-foot granite boulders',
      'Silver Cascade roadside waterfall',
      'Pine Forest serene nature walks',
    ],
    bestTime: 'September – May',
  },
  {
    id: 'place_rameswaram',
    name: 'Rameswaram & Dhanushkodi',
    state: 'Tamil Nadu',
    category: 'Spiritual & Coastal',
    categoryIcon: '🌊',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Religious Group', 'Family', 'Solo', 'Couple / Honeymoon'],
    experiences: [
      'Religious and Spiritual Places',
      'Heritage and Culture',
      'Beaches',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹6,000 – ₹15,000 per person',
    moods: ['Spiritual', 'Peaceful', 'Scenic'],
    description:
      'Sacred island temple town linked to the mainland by the engineering marvel of Pamban Bridge, leading to the ghost town of Dhanushkodi.',
    overview:
      'Rameswaram is a premier Hindu pilgrimage destination famous for Ramanathaswamy Temple’s 1,200 carved pillars and sacred seaside bathing theerthams.',
    highlights: [
      'Ramanathaswamy Temple third corridor pillars',
      'Pamban Sea Bridge railway crossing',
      'Dhanushkodi ghost town & Adam\'s Bridge view',
      'Agni Theertham sacred seaside ghat',
      'Dr. APJ Abdul Kalam National Memorial',
    ],
    bestTime: 'October – April',
  },
  {
    id: 'place_pondicherry',
    name: 'Pondicherry (Puducherry)',
    state: 'Puducherry',
    category: 'Coastal Heritage & Cafes',
    categoryIcon: '🥐',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Solo', 'Couple / Honeymoon', "Friends / Boys' Trip", 'Family'],
    experiences: [
      'Beaches',
      'Heritage and Culture',
      'Relaxation',
      'Nightlife',
    ],
    budgetRanges: ['under-10k', '10k-25k', '25k-50k'],
    budgetDisplay: '₹9,000 – ₹22,000 per person',
    moods: ['Peaceful', 'Cultural', 'Fun and Social', 'Scenic'],
    description:
      'French colonial quarters, seaside boulevards, pastel villas with bougainvillea, and the international spiritual township of Auroville.',
    overview:
      'Pondicherry blends French colonial elegance with traditional Tamil culture, seaside promenades, artisan bakeries, and holistic yoga centers.',
    highlights: [
      'White Town French quarter heritage walk',
      'Promenade Beach evening seaside stroll',
      'Auroville and the golden Matrimandir',
      'Paradise Beach ferry & water sports',
      'Charming French cafes and patisseries',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_mahabaleshwar',
    name: 'Mahabaleshwar & Panchgani',
    state: 'Maharashtra',
    category: 'Hill Station & Waterfalls',
    categoryIcon: '🍓',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Family', 'Couple / Honeymoon', "Friends / Boys' Trip", 'Solo'],
    experiences: [
      'Mountains',
      'Waterfalls',
      'Nature and Wildlife',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹7,000 – ₹16,000 per person',
    moods: ['Scenic', 'Peaceful'],
    description:
      'Western Ghats hill station famous for strawberry farms, dramatic valley viewpoints, and monsoon waterfalls.',
    overview:
      'Perched on the Sahyadri range, Mahabaleshwar provides cool plateau climates, strawberry farm tours, historic Maratha fortresses, and panoramic cliffs.',
    highlights: [
      'Arthur’s Seat & Elephant’s Head Point',
      'Venna Lake boating and evening market',
      'Lingmala cascading waterfall hike',
      'Pratapgad Fort Maratha citadel visit',
      'Strawberry picking in Mapro Gardens',
    ],
    bestTime: 'October – June',
  },
  {
    id: 'place_lonavala',
    name: 'Lonavala & Khandala',
    state: 'Maharashtra',
    category: 'Mountains & Waterfalls',
    categoryIcon: '🌧️',
    durations: ['1-2'],
    durationDisplay: '1–2 days',
    groups: ["Friends / Boys' Trip", 'Family', 'Couple / Honeymoon', 'Solo'],
    experiences: [
      'Waterfalls',
      'Mountains',
      'Trekking',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹5,000 – ₹12,000 per person',
    moods: ['Scenic', 'Fun and Social', 'Adventurous'],
    description:
      'Popular Sahyadri mountain getaway close to Mumbai and Pune, renowned for monsoon waterfalls, chikki sweets, and ancient Buddhist caves.',
    overview:
      'Lonavala is a favorite weekend hill station nestled among green canyons, offering scenic lookout points, trekking forts, and historic rock-cut caves.',
    highlights: [
      'Tiger’s Leap cliff edge viewpoint',
      'Bhushi Dam monsoon water overflow',
      'Karla & Bhaja ancient Buddhist caves',
      'Lohagad Fort hiking trail',
      'Rajmachi Point valley vistas',
    ],
    bestTime: 'July – September for waterfalls & October – March',
  },
  {
    id: 'place_alibaug',
    name: 'Alibaug',
    state: 'Maharashtra',
    category: 'Beaches & Coastal',
    categoryIcon: '🏖️',
    durations: ['1-2'],
    durationDisplay: '1–2 days',
    groups: ["Friends / Boys' Trip", 'Family', 'Couple / Honeymoon', 'Solo'],
    experiences: [
      'Beaches',
      'Relaxation',
      'Heritage and Culture',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹6,000 – ₹14,000 per person',
    moods: ['Peaceful', 'Fun and Social', 'Scenic'],
    description:
      'Coastal getaway accessible by ferry from Mumbai, featuring black-sand beaches, sea forts, and fresh Konkani seafood.',
    overview:
      'A convenient coastal escape lined with coconut groves, offering water sports, historic island forts, and peaceful seaside homestays.',
    highlights: [
      'Kolaba Fort sea fortress walk during low tide',
      'Nagaon & Kashid beaches water sports',
      'Speedboat ferry ride from Gateway of India',
      'Murud-Janjira impregnable marine fort',
      'Authentic Konkani seafood thalis',
    ],
    bestTime: 'October – May',
  },
  {
    id: 'place_rann_of_kutch',
    name: 'Rann of Kutch',
    state: 'Gujarat',
    category: 'Cultural & Desert',
    categoryIcon: '🌕',
    durations: ['3-5'],
    durationDisplay: '3–4 days',
    groups: ['Family', 'Couple / Honeymoon', "Friends / Boys' Trip", 'Solo'],
    experiences: [
      'Heritage and Culture',
      'Nature and Wildlife',
      'Relaxation',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹14,000 – ₹28,000 per person',
    moods: ['Cultural', 'Scenic', 'Peaceful'],
    description:
      'One of the world’s largest salt deserts, glowing like endless white snow under full moon nights during the winter Rann Utsav.',
    overview:
      'The Great Rann of Kutch showcases indigenous Kutchi handicrafts, vibrant desert tent cities, flamingos, and surreal white salt flats stretching to the horizon.',
    highlights: [
      'White Rann full moon sunset & night walk',
      'Rann Utsav cultural dance and tent city',
      'Kala Dungar (Black Hill) highest Kutch point',
      'Kutch artisan villages (Nirona & Bhujodi)',
      'Wild Ass Sanctuary in the Little Rann',
    ],
    bestTime: 'November – February',
  },
  {
    id: 'place_khajuraho',
    name: 'Khajuraho',
    state: 'Madhya Pradesh',
    category: 'UNESCO Heritage & Temples',
    categoryIcon: '🛕',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Family', 'Couple / Honeymoon', 'Solo', 'Religious Group'],
    experiences: [
      'Heritage and Culture',
      'Religious and Spiritual Places',
      'Relaxation',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹6,000 – ₹15,000 per person',
    moods: ['Cultural', 'Peaceful', 'Spiritual'],
    description:
      'UNESCO World Heritage monument group celebrated for magnificent Chandela-era temples adorned with intricate stone sculptures.',
    overview:
      'Built between 950 and 1050 CE, Khajuraho’s sandstone temple complexes represent an unmatched masterpiece of Indian medieval architecture and sculptural art.',
    highlights: [
      'Kandariya Mahadeva temple architectural marvel',
      'Western Group of Temples light and sound show',
      'Eastern Group Jain temples',
      'Raneh Falls canyon & waterfalls',
      'Panna National Park tiger safari nearby',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_bandhavgarh',
    name: 'Bandhavgarh National Park',
    state: 'Madhya Pradesh',
    category: 'Nature & Wildlife',
    categoryIcon: '🐅',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Family', "Friends / Boys' Trip", 'Solo', 'Couple / Honeymoon'],
    experiences: [
      'Nature and Wildlife',
      'Adventure',
      'Trekking',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹14,000 – ₹30,000 per person',
    moods: ['Adventurous', 'Peaceful', 'Scenic'],
    description:
      'Renowned wildlife sanctuary with India’s highest density of Bengal tigers, set around an ancient hilltop fortress.',
    overview:
      'Bandhavgarh combines rich Sal forests, rocky hillocks, open meadows, and deep valleys with exceptional opportunities for tiger tracking and birding.',
    highlights: [
      'Tala & Magadhi zone open jeep jungle safaris',
      'Ancient Bandhavgarh Fort and carved caves',
      'Shesh Shaiya reclining Vishnu sandstone statue',
      'Birdwatching with over 250 avian species',
      'Village eco-walks and tribal craft centers',
    ],
    bestTime: 'October – June (Best tiger sightings April – June)',
  },
  {
    id: 'place_darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    category: 'Mountains & Heritage',
    categoryIcon: '☕',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days',
    groups: ['Couple / Honeymoon', 'Family', 'Solo', "Friends / Boys' Trip"],
    experiences: [
      'Mountains',
      'Nature and Wildlife',
      'Heritage and Culture',
      'Relaxation',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹24,000 per person',
    moods: ['Scenic', 'Peaceful', 'Cultural'],
    description:
      'Himalayan tea capital offering glorious sunrise views of Mount Kanchenjunga and the UNESCO Darjeeling Himalayan Railway.',
    overview:
      'Famous for the champagne of teas, Darjeeling features colonial heritage schools, Tibetan Buddhist monasteries, and sprawling terraced hillsides.',
    highlights: [
      'Tiger Hill sunrise over Mount Kanchenjunga',
      'UNESCO Darjeeling Himalayan Toy Train',
      'Batasia Loop war memorial and spiral railway',
      'Happy Valley Tea Estate factory tour',
      'Padmaja Naidu Himalayan Zoo (Red Pandas)',
    ],
    bestTime: 'March – May & October – December',
  },
  {
    id: 'place_gangtok',
    name: 'Gangtok & North Sikkim',
    state: 'Sikkim',
    category: 'Himalayan Mountains & Monasteries',
    categoryIcon: '🏔️',
    durations: ['3-5', '6-10'],
    durationDisplay: '4–7 days',
    groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Solo', 'Family'],
    experiences: [
      'Mountains',
      'Adventure',
      'Trekking',
      'Religious and Spiritual Places',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹15,000 – ₹32,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful', 'Cultural'],
    description:
      'Clean, picturesque Himalayan capital offering high mountain pass excursions, Tibetan gompas, and alpine lakes.',
    overview:
      'Perched on a cloud-wrapped ridge, Gangtok serves as the base for journeys to Tsomgo Glacial Lake, Nathu La pass on the old Silk Road, and the Yumthang Valley.',
    highlights: [
      'Tsomgo Lake & Baba Mandir high-altitude trip',
      'Rumtek Monastery seat of the Karmapa',
      'Nathu La Pass border trading post',
      'MG Marg pedestrian boulevard & cafes',
      'Yumthang Valley of Flowers excursion',
    ],
    bestTime: 'March – June & September – December',
  },
  {
    id: 'place_puri',
    name: 'Puri',
    state: 'Odisha',
    category: 'Spiritual & Beaches',
    categoryIcon: '🛕',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–3 days',
    groups: ['Religious Group', 'Family', 'Solo', 'Couple / Honeymoon'],
    experiences: [
      'Religious and Spiritual Places',
      'Beaches',
      'Heritage and Culture',
    ],
    budgetRanges: ['under-10k', '10k-25k'],
    budgetDisplay: '₹5,000 – ₹13,000 per person',
    moods: ['Spiritual', 'Cultural', 'Scenic'],
    description:
      'Sacred coastal pilgrimage city home to the ancient Jagannath Temple, famous Rath Yatra, and golden Bay of Bengal beaches.',
    overview:
      'One of the four Char Dham pilgrimage sites, Puri pairs sacred temple traditions and sand art festivals with nearby UNESCO Konark Sun Temple.',
    highlights: [
      'Shree Jagannath Temple sacred complex',
      'Golden Beach blue-flag shoreline',
      'Konark Sun Temple UNESCO chariot monument',
      'Chilika Lake Asia\'s largest brackish lagoon & dolphins',
      'Raghurajpur heritage pattachitra artisan village',
    ],
    bestTime: 'October – March',
  },
  {
    id: 'place_kaziranga',
    name: 'Kaziranga National Park',
    state: 'Assam',
    category: 'Wildlife & Nature',
    categoryIcon: '🦏',
    durations: ['1-2', '3-5'],
    durationDisplay: '2–4 days',
    groups: ['Family', "Friends / Boys' Trip", 'Solo', 'Couple / Honeymoon'],
    experiences: [
      'Nature and Wildlife',
      'Adventure',
      'Relaxation',
    ],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹25,000 per person',
    moods: ['Adventurous', 'Peaceful', 'Scenic'],
    description:
      'UNESCO World Heritage sanctuary along the Brahmaputra river, home to two-thirds of the world’s great one-horned rhinoceroses.',
    overview:
      'Kaziranga features elephant-grass plains, swampy lagoons, and dense tropical broadleaf forests teeming with rhinos, wild water buffaloes, tigers, and migratory birds.',
    highlights: [
      'Kohora and Bagori zone open jeep safaris',
      'Early morning elephant-back wildlife viewings',
      'Brahmaputra river dolphin spotting tours',
      'Hoollongapar Gibbon Sanctuary excursion',
      'Assamese tea estate tours and Bihu culture',
    ],
    bestTime: 'November – April',
  },
  {
    id: 'place_tawang',
    name: 'Tawang',
    state: 'Arunachal Pradesh',
    category: 'Monasteries & High Pass',
    categoryIcon: '🏔️',
    durations: ['6-10', '11+'],
    durationDisplay: '6–9 days',
    groups: ["Friends / Boys' Trip", 'Solo', 'Couple / Honeymoon'],
    experiences: [
      'Mountains',
      'Religious and Spiritual Places',
      'Trekking',
      'Adventure',
    ],
    budgetRanges: ['25k-50k', '50k+'],
    budgetDisplay: '₹25,000 – ₹48,000 per person',
    moods: ['Adventurous', 'Peaceful', 'Scenic', 'Spiritual'],
    description:
      'High-altitude wonderland in the eastern Himalayas, home to India’s largest monastery and the snowbound Sela Pass.',
    overview:
      'Perched at 10,000 feet, Tawang offers dramatic mountain passes, glacial lakes, prayer wheels, and centuries of Tibetan Buddhist heritage.',
    highlights: [
      'Tawang Monastery (Galden Namgey Lhatse)',
      'Sela Pass (13,700 ft) & frozen Sela Lake',
      'Madhuri (Sangetsar) high-altitude lake',
      'Nuranang (Bong Bong) cascading waterfall',
      'Jaswant Garh War Memorial',
    ],
    bestTime: 'March – June & September – November',
  },
]

/**
 * Maps custom numeric day count to standard duration tier.
 *
 * @param {number} days
 * @returns {string}
 */
export function mapDaysToDurationTier(days) {
  const num = parseInt(days, 10)
  if (isNaN(num) || num <= 0) return ''
  if (num <= 2) return '1-2'
  if (num <= 5) return '3-5'
  if (num <= 10) return '6-10'
  return '11+'
}

/**
 * Filters and scores sample destinations based on user questionnaire preferences.
 * This is a lightweight temporary client-side matcher for Milestone 7.
 *
 * @param {Object} preferences
 * @param {string} preferences.duration - '1-2' | '3-5' | '6-10' | '11+'
 * @param {string} [preferences.customDuration]
 * @param {string} preferences.group - e.g. 'Friends / Boys\' Trip'
 * @param {Array<string>} preferences.experiences - e.g. ['Mountains', 'Adventure']
 * @param {string} preferences.budget - e.g. '10k-25k'
 * @param {Array<string>} [preferences.moods] - e.g. ['Scenic', 'Peaceful']
 * @returns {Array<{ destination: Object, score: number, matchingExperiences: Array<string> }>}
 */
export function matchSampleDestinations(preferences = {}) {
  const {
    duration,
    customDuration,
    group,
    experiences = [],
    budget,
    moods = [],
  } = preferences

  const effectiveDuration = customDuration
    ? mapDaysToDurationTier(customDuration)
    : duration

  const scored = SAMPLE_DESTINATIONS.map((dest) => {
    let score = 0

    // 1. Travel Group match (+4 points)
    const isGroupMatch = !group || dest.groups.includes(group)
    if (group && isGroupMatch) {
      score += 4
    }

    // 2. Duration match (+3 points)
    const isDurationMatch = Boolean(
      effectiveDuration && dest.durations.includes(effectiveDuration)
    )
    if (isDurationMatch) {
      score += 3
    }

    // 3. Budget range match (+3 points)
    const isBudgetMatch = Boolean(
      budget && dest.budgetRanges.includes(budget)
    )
    if (isBudgetMatch) {
      score += 3
    }

    // 4. Experience matches (+3 points each)
    const matchingExperiences = experiences.filter((exp) =>
      dest.experiences.includes(exp)
    )
    score += matchingExperiences.length * 3

    // 5. Travel mood matches (+1 point each)
    const matchingMoods = moods.filter((m) => dest.moods.includes(m))
    score += matchingMoods.length * 1

    return {
      destination: dest,
      score,
      isGroupMatch,
      isDurationMatch,
      isBudgetMatch,
      matchingExperiences,
      matchingMoods,
    }
  })

  // Qualifying Filter:
  // - Must match the travel group (when specified).
  // - Must match at least one selected experience (when specified).
  // - Must match either duration tier or budget range.
  // - Minimum score >= 7 ensures multiple factors align without padding irrelevant results.
  const qualified = scored.filter((item) => {
    const groupOk = !group || item.isGroupMatch
    const expOk = experiences.length === 0 || item.matchingExperiences.length > 0
    const coreOk = item.isDurationMatch || item.isBudgetMatch

    return item.score >= 7 && groupOk && expOk && coreOk
  })

  // Sort descending by match score
  qualified.sort((a, b) => b.score - a.score)

  // Return up to 5 recommendations
  return qualified.slice(0, 5)
}
