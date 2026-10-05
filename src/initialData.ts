import {
  SiteSettings,
  ThemeTokens,
  Milestone,
  Service,
  PortfolioCategory,
  PortfolioItem,
  Review,
  Booking,
  FAQ,
  BlogPost,
  BlogComment,
  SocialLink,
  ClientLogo
} from './types';

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  goldAccent: '#f9931f',
  darkBg: '#0b131e',
  darkBody: '#cbd5e1',
  darkHeading: '#ffffff',
  darkBtnBg: '#f9931f',
  darkBtnText: '#192c45',
  darkBtnHover: '#ffa73e',
  darkLink: '#f9931f',
  darkLinkHover: '#ffbe6b',
  darkBorder: 'rgba(249, 147, 31, 0.18)',
  darkCardBg: '#132032',
  darkIcon: '#f9931f',
  lightBg: '#f8fafc',
  lightBody: '#334155',
  lightHeading: '#192c45',
  lightBtnBg: '#192c45',
  lightBtnText: '#ffffff',
  lightBtnHover: '#223a5b',
  lightLink: '#192c45',
  lightLinkHover: '#f9931f',
  lightBorder: 'rgba(25, 44, 69, 0.12)',
  lightCardBg: '#ffffff',
  lightIcon: '#192c45',
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Plus Jakarta Sans'
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.svg',
  logoAlt: 'AV Productions',
  heroTitle: 'Every Frame, Directed With Intent.',
  heroTagline: 'Cinematography, visual direction, and narrative filmmaking for commercial campaigns, documentaries, and artist commissions.',
  heroMediaUrl: '',
  heroMediaType: 'none',
  introStripText: 'A boutique production studio shaping narratives through evocative cinematography, visual direction, and human-centric storytelling.',
  ctaHeadline: 'Ready to bring your story to life?',
  ctaSubline: 'From commercial brand films to original narratives, we collaborate closely with directors and producers worldwide.',
  contactEmail: 'projectfilesav@gmail.com',
  contactPhone: '+254759514351',
  copyrightText: '© AV PRODUCTIONS 2026',
  promoBannerEnabled: true,
  promoBannerText: 'Now accepting bookings for Autumn 2026 commercial & narrative production cycles.',
  floatingBookButtonEnabled: true,
  floatingBookButtonLabel: 'Book Production',
  googleReviewsUrl: 'https://google.com/search?q=av+productions+reviews',
  privacyPolicy: `PRIVACY POLICY [PLACEHOLDER]

Last updated: September 2026

This is clearly marked placeholder legal copy for AV Productions.
For all data privacy and personal inquiries, please contact:
projectfilesav@gmail.com.

We treat your personal information, booking details, and creative assets with utmost confidentiality. No client assets are ever transferred or sold to third parties.`,
  termsOfService: `TERMS OF SERVICE [PLACEHOLDER]

Last updated: September 2026

This is clearly marked placeholder terms text for AV Productions.
All formal creative production contracts, licensing agreements, and deliverables are executed under bespoke contracts with:
projectfilesav@gmail.com.

Intellectual property rights and master licenses remain governed by agreed written master services agreements.`,
  cookiePolicy: `COOKIE POLICY [PLACEHOLDER]

Last updated: September 2026

This website respects your consent. Non-essential cookies, performance analytics, and third-party embeds are strictly gated behind our interactive Cookie Consent banner. You may update your consent anytime.
Contact: projectfilesav@gmail.com`,
  metaTitle: 'AV Productions | Boutique Cinematography & Narrative Direction',
  metaDescription: 'Boutique production studio specializing in cinematography, commercial films, and narrative direction.',
  ogImageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
  gaMeasurementId: 'G-AVPROD2026'
};

export const INITIAL_CATEGORIES: PortfolioCategory[] = [
  { id: 'cat-commercial', name: 'Commercial Films', slug: 'commercial', order: 1 },
  { id: 'cat-narrative', name: 'Narrative & Drama', slug: 'narrative', order: 2 },
  { id: 'cat-music', name: 'Music & Performance', slug: 'music', order: 3 },
  { id: 'cat-sound', name: 'Audio Mixing & Mastering', slug: 'audio-mastering', order: 4 }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: 'Cinematography & Direction',
    shortDescription: 'Comprehensive film production from concept development to principal photography wrap.',
    detailedDescription: 'Directorial vision for commercial brands, narrative short films, and editorial projects. We handle lighting design, camera packages, and complete on-set coordination to capture authentic, moving imagery.',
    categoryId: 'cat-commercial',
    order: 1
  },
  {
    id: 'srv-2',
    title: 'Visual Storycraft & Treatments',
    shortDescription: 'Script development, visual blocking, and tailored director treatments.',
    detailedDescription: 'Translating narrative concepts into clear cinematic treatments. We provide comprehensive story analysis, storyboard planning, location scouting, and aesthetic treatment design for agency and brand pitches.',
    categoryId: 'cat-narrative',
    order: 2
  },
  {
    id: 'srv-3',
    title: 'Narrative Editing & Color Grading',
    shortDescription: 'Rhythmic post-production pacing with nuanced color palettes.',
    detailedDescription: 'Post-production is the final rewrite. Our editing suite crafts pacing with emotional clarity, while our color grading develops rich, deliberate palettes tailored specifically to your visual tone.',
    categoryId: 'cat-narrative',
    order: 3
  },
  {
    id: 'srv-4',
    title: 'Music Films & Artist Showcases',
    shortDescription: 'Multi-camera concert capture and conceptual music videos.',
    detailedDescription: 'Transforming musical performances into unforgettable visual narratives. From intimate studio sessions to expansive live concert productions with synchronized lighting.',
    categoryId: 'cat-music',
    order: 4
  }
];

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'item-1',
    categoryId: 'cat-commercial',
    title: 'Aura Chronograph — The Precision of Time',
    mediaType: 'video',
    mediaUrl: 'https://player.vimeo.com/video/76979871?autoplay=0&muted=1',
    videoSource: 'embed',
    description: 'A 60-second luxury watch brand commercial focusing on mechanical craftsmanship and precision movement.',
    showDescription: true,
    altText: 'AV Productions - Commercial Films - Aura Chronograph — The Precision of Time - Commercial film for luxury timepieces',
    order: 1,
    featured: true
  },
  {
    id: 'item-2',
    categoryId: 'cat-commercial',
    title: 'Solitude in Motion — Monolith Motors',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    description: 'High-contrast automotive campaign shot in the Icelandic highlands under low sun twilight.',
    showDescription: true,
    altText: 'GATEI - Commercial Films - Solitude in Motion — Monolith Motors - High-contrast automotive campaign shot in the Icelandic highlands',
    order: 2,
    featured: true
  },
  {
    id: 'item-3',
    categoryId: 'cat-commercial',
    title: 'Velvet Noir — Parfum Campaign',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=80',
    description: 'Studio light sculpture featuring deep shadows and warm amber refraction through faceted glass.',
    showDescription: false,
    altText: 'GATEI - Commercial Films - Velvet Noir — Parfum Campaign - Studio light sculpture featuring deep shadows and warm amber refraction',
    order: 3,
    featured: false
  },
  {
    id: 'item-4',
    categoryId: 'cat-narrative',
    title: 'The Cartographer of Shoreditch',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80',
    description: 'A 24-minute short drama exploring memory, urban cartography, and estranged familial bonds.',
    showDescription: true,
    altText: 'GATEI - Narrative & Drama - The Cartographer of Shoreditch - A 24-minute short drama exploring memory and urban cartography',
    order: 1,
    featured: true
  },
  {
    id: 'item-5',
    categoryId: 'cat-narrative',
    title: 'Intermission at Twilight',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1600&q=80',
    description: 'Cinematic backstage portraits captured on medium format color negative stock during dusk rehearsals.',
    showDescription: true,
    altText: 'GATEI - Narrative & Drama - Intermission at Twilight - Cinematic backstage portraits captured on medium format color negative stock',
    order: 2,
    featured: false
  },
  {
    id: 'item-6',
    categoryId: 'cat-music',
    title: 'Elysium Quartet — Live at the Abbey',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    videoSource: 'embed',
    description: 'Multi-mic spatial acoustic recording and 4-camera visual capture inside a 12th-century stone cathedral.',
    showDescription: true,
    altText: 'GATEI - Music & Performance - Elysium Quartet — Live at the Abbey - Multi-mic spatial acoustic recording and 4-camera visual capture',
    order: 1,
    featured: true
  },
  {
    id: 'item-7',
    categoryId: 'cat-music',
    title: 'Neon Pulse — Synthesizer Vignettes',
    mediaType: 'graphic',
    mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    description: 'Visual synthesis art created using modular analog video synthesizers and oscilloscope signals.',
    showDescription: true,
    altText: 'GATEI - Music & Performance - Neon Pulse — Synthesizer Vignettes - Visual synthesis art created using modular analog video synthesizers',
    order: 2,
    featured: false
  },
  {
    id: 'item-8',
    categoryId: 'cat-sound',
    title: 'Audio Mixing & Mastering — Reference Proof',
    mediaType: 'audio',
    mediaUrl: '/audio/master-reference.mp3',
    description: 'Studio acoustic master demonstrating stereo imaging, dynamic headroom control, harmonic balance, and final limiter threshold proof.',
    showDescription: true,
    altText: 'AV Productions - Audio Mixing and Mastering Proof Reference',
    order: 1,
    featured: false
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    year: '2019',
    title: 'Studio Founding',
    body: 'AV Productions was established with an independent spirit and a commitment to narrative cinematography. Early documentary commissions gained recognition for their authentic intimacy.',
    photoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    order: 1
  },
  {
    id: 'ms-2',
    year: '2021',
    title: 'Sound Design & Post Facility',
    body: 'Expanded into full-service spatial audio and post-production, building our acoustic mixing stage with analog mastering compressors and monitoring suites.',
    photoUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    order: 2
  },
  {
    id: 'ms-3',
    year: '2023',
    title: 'Commercial Film Direction',
    body: 'Partnered with international independent luxury brands, delivering high-concept campaign spots featured across European film festivals and design showcases.',
    photoUrl: '', // No photo, tests text-only timeline rendering
    order: 3
  },
  {
    id: 'ms-4',
    year: '2026',
    title: 'AV Productions Today',
    body: 'Continuing to pioneer hybrid analog-digital storytelling. Every production is crafted as a bespoke commission, maintaining an uncompromising standard of artistic integrity.',
    photoUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    order: 4
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    reviewerName: 'Marcus Vance',
    rating: 5,
    reviewText: 'AV Productions transformed our brand anthem into an absolute masterpiece. The cinematography had the physical weight and elegance of an indie festival feature film.',
    source: 'Google',
    status: 'Live'
  },
  {
    id: 'rev-2',
    reviewerName: 'Elena Rostova',
    rating: 5,
    reviewText: 'Working with AV Productions was effortless. Their attention to lighting, sound design, and narrative cadence is rare in today\'s fast-content world.',
    source: 'Trustpilot',
    status: 'Live'
  },
  {
    id: 'rev-3',
    reviewerName: 'David K. Lindqvist',
    rating: 5,
    reviewText: 'The audio mixing alone brought tears to our client screening room. Unquestionably the most talented boutique AV team we have partnered with in a decade.',
    source: 'Google',
    status: 'Live'
  },
  {
    id: 'rev-4',
    reviewerName: 'Sophie Chen',
    rating: 4,
    reviewText: 'Exceptional visual polish. Delivered ahead of schedule with remarkable color accuracy across all screening formats.',
    source: 'Other',
    status: 'Live'
  },
  {
    id: 'rev-5',
    reviewerName: 'Internal Test Review',
    rating: 5,
    reviewText: 'Archived internal test note - should only be visible in admin dashboard.',
    source: 'Other',
    status: 'Archived'
  }
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What is your typical project timeline from concept to delivery?',
    answer: 'Commercial and narrative campaigns typically span 3 to 6 weeks, accommodating initial conceptual treatment, location scouting, principal photography, sound engineering, and color grading passes. Rush engagements are considered on a case-by-case basis.',
    order: 1
  },
  {
    id: 'faq-2',
    question: 'How do bookings and reservations work?',
    answer: 'Submitting our booking form reserves your preferred production window in our schedule. Following your submission, the director will contact you personally to review creative requirements and align on scope before formal agreement.',
    order: 2
  },
  {
    id: 'faq-3',
    question: 'Do you provide location shooting outside your home studio?',
    answer: 'Yes. We frequently mobilize compact, cine-grade production kits for domestic and international travel, equipped for challenging terrain, historical estates, and live acoustics.',
    order: 3
  },
  {
    id: 'faq-4',
    question: 'What deliverables are included with a standard film project?',
    answer: 'Deliverables include master 4K ProRes 4444 XQ files, social aspect ratios (9:16, 4:5, 1:1), uncompressed 24-bit 96kHz audio masters, and an archival hard drive if requested.',
    order: 4
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Chemistry of Anamorphic Lenses in Modern Narrative',
    slug: 'the-chemistry-of-anamorphic-lenses',
    featuredImage: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Why horizontal oval bokeh and organic streak flares continue to captivate human perception over ultra-sharp digital optics.',
    content: `<h2>The Allure of Optical Imperfection</h2>
<p>In an era dominated by hyper-sterile 8K sensors, modern digital cinematography often captures more resolution than emotion. Anamorphic glass reintroduces the visceral human touch.</p>
<p>By squeezing a wider field of view onto the sensor, anamorphic elements introduce distinct spatial depth, cylindrical distortion, and horizontal flares that mirror how our eyes perceive luminous contrast.</p>
<h3>Pacing with the Lens</h3>
<p>When selecting a lens package for our recent series, we paired 1970s vintage anamorphic housings with contemporary low-noise sensors. The result is pure cinematic texture: velvet blacks, rich skin tones, and evocative flares that feel earned rather than digitally slapped on.</p>`,
    status: 'Published',
    metaTitle: 'The Chemistry of Anamorphic Lenses | AV Productions',
    metaDescription: 'A deep dive into vintage anamorphic glass, oval bokeh, and optical storytelling with AV Productions.',
    ogImage: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-10T10:00:00Z',
    publishedAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'post-2',
    title: 'Sculpting Silence: Atmospheric Audio in Film Scoring',
    slug: 'sculpting-silence-atmospheric-audio',
    featuredImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Examining how deliberate negative space and sub-bass resonance elevate narrative tension.',
    content: `<h2>The Power of What You Do Not Hear</h2>
<p>Many sound designers fall into the trap of wall-to-wall sonic saturation. True directorial craft recognizes that silence is the canvas upon which tension is painted.</p>
<p>By contrasting low-frequency room tones with sudden, delicate tactile foley—a breath, the click of a brass switch—the viewer is pulled physically into the emotional interior of the scene.</p>`,
    status: 'Published',
    metaTitle: 'Sculpting Silence: Atmospheric Audio | AV Productions',
    metaDescription: 'How sound design and acoustic negative space define cinematic tension.',
    ogImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-09-02T14:30:00Z',
    publishedAt: '2026-09-02T14:30:00Z'
  }
];

export const INITIAL_BLOG_COMMENTS: BlogComment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    authorName: 'Julian Bennett',
    authorEmail: 'julian@cinematic.example',
    content: 'Inspiring write-up. The point on vintage glass vs hyper-clean sensors is spot on for current indie films.',
    status: 'Approved',
    createdAt: '2026-08-12T11:20:00Z'
  },
  {
    id: 'comm-2',
    postId: 'post-1',
    authorName: 'Clara Oswald',
    authorEmail: 'clara@lensgeek.example',
    content: 'Which specific anamorphic primes were used on the Aura Chronograph spot? The bokeh transition was stunning.',
    status: 'Pending',
    createdAt: '2026-09-11T18:04:00Z'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    clientName: 'Soren Halvorsen',
    email: 'soren.h@auraworks.example',
    phone: '+44 20 7946 0912',
    serviceId: 'srv-1',
    serviceName: 'Cinematic Direction & Master Photography',
    dateType: 'range',
    dateValue: '2026-10-15',
    endDateValue: '2026-10-22',
    projectDescription: 'High-end architectural lighting documentary across three Scandinavian timber pavilions.',
    status: 'New',
    adminNotes: 'Spoke via telephone 9/12. Client wants to shoot with Cooke anamorphics.',
    createdAt: '2026-09-12T14:20:00Z'
  },
  {
    id: 'book-2',
    clientName: 'Miriam Vance',
    email: 'm.vance@soundscaperecords.example',
    phone: '+1 415 555 2671',
    serviceId: 'srv-2',
    serviceName: 'Sound Design & Surround Audio',
    dateType: 'single',
    dateValue: '2026-11-04',
    projectDescription: 'Dolby Atmos surround mix for a 45-minute electronic live performance album.',
    status: 'Approved', // Displayed in "Pending" tab (meaning upcoming/confirmed)
    adminNotes: 'Contract signed, deposit received off-site. Session scheduled in Room A.',
    createdAt: '2026-09-08T09:15:00Z'
  }
];

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  { platform: 'Instagram', url: 'https://instagram.com/avproductions' },
  { platform: 'Vimeo', url: 'https://vimeo.com/avproductions' },
  { platform: 'YouTube', url: 'https://youtube.com/@avproductions' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/company/avproductions' },
  { platform: 'X', url: 'https://x.com/avproductions' }
];

export const INITIAL_CLIENT_LOGOS: ClientLogo[] = [
  { id: 'cl-1', name: 'Phoneplace Kenya', logoUrl: '/clients/PHONEPLACEKENYALOGO (2).webp', order: 1, featured: true },
  { id: 'cl-2', name: 'TTNT 6 Seasons', logoUrl: '/clients/TTNT 6 SEASONS.png', order: 2, featured: true },
  { id: 'cl-3', name: 'Zunguka Africa', logoUrl: '/clients/Zunguka.png', order: 3, featured: true },
  { id: 'cl-4', name: 'FunCity Studios', logoUrl: '/clients/funcity logo.png', order: 4, featured: true },
  { id: 'cl-5', name: 'Gold White Studios', logoUrl: '/clients/gold white logo.png', order: 5, featured: true },
  { id: 'cl-6', name: 'Apex Motion Group', logoUrl: '/clients/Asset 10.png', order: 6, featured: true },
  { id: 'cl-7', name: 'Horizon Cinema', logoUrl: '/clients/Asset 4.png', order: 7, featured: true },
  { id: 'cl-8', name: 'Luminary Media', logoUrl: '/clients/Asset 5.png', order: 8, featured: true },
  { id: 'cl-9', name: 'Aura Productions', logoUrl: '/clients/LOGO PNG0.png', order: 9, featured: true },
  { id: 'cl-10', name: 'Main Logo White', logoUrl: '/clients/Main Logo White.png', order: 10, featured: true },
  { id: 'cl-11', name: 'Red Print Creatives', logoUrl: '/clients/print on red.png', order: 11, featured: true },
  { id: 'cl-12', name: 'E-White Visuals', logoUrl: '/clients/ewhite.png', order: 12, featured: true }
];

