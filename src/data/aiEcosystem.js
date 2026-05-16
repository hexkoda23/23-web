export const STYLIST_QUESTIONS = [
  {
    id: 'occasion',
    label: 'Shopping for',
    options: [
      { value: 'everyday', label: 'Everyday wear' },
      { value: 'event', label: 'Event outfit' },
      { value: 'streetwear', label: 'Streetwear fit' },
      { value: 'night-out', label: 'Date/night out' },
      { value: 'campus', label: 'School/campus' },
      { value: 'work-casual', label: 'Work casual' },
      { value: 'training', label: 'Training' },
    ],
  },
  {
    id: 'vibe',
    label: 'Vibe',
    options: [
      { value: 'clean', label: 'Clean' },
      { value: 'bold', label: 'Bold' },
      { value: 'luxury', label: 'Luxury streetwear' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'sporty', label: 'Sporty' },
      { value: 'creative', label: 'Creative' },
    ],
  },
  {
    id: 'budget',
    label: 'Budget',
    options: [
      { value: 'under-25', label: 'Under N25k' },
      { value: '25-50', label: 'N25k-N50k' },
      { value: '50-100', label: 'N50k-N100k' },
      { value: 'open', label: 'No strict budget' },
    ],
  },
  {
    id: 'size',
    label: 'Size',
    options: [
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'custom', label: 'Custom/unsure' },
    ],
  },
];

export const COLOR_OPTIONS = [
  { value: 'black', label: 'Black', swatch: '#050505' },
  { value: 'white', label: 'White', swatch: '#f7f7f7' },
  { value: 'cream', label: 'Neutral', swatch: '#e6dfd1' },
  { value: 'green', label: 'Earth tones', swatch: '#40533a' },
  { value: 'blue', label: 'Blue', swatch: '#274c77' },
  { value: 'red', label: 'Red', swatch: '#a62121' },
  { value: 'pink', label: 'Pink', swatch: '#e9a7bc' },
  { value: 'ai', label: 'Let AI decide', swatch: 'linear-gradient(135deg,#111,#c8f000)' },
];

export const STYLE_CHALLENGES = [
  {
    id: 'streetwear',
    title: '23 Streetwear Challenge',
    tag: 'Weekly',
    reward: 'Early access code',
    points: 230,
    theme: 'Build a fit around one 23 piece.',
    image: '/lookbook/JF-1.JPG',
  },
  {
    id: 'blackout',
    title: 'Blackout Fit Challenge',
    tag: 'Live',
    reward: 'N10k discount',
    points: 180,
    theme: 'A strong all-black look with clean styling.',
    image: '/lookbook/18.jpg',
  },
  {
    id: 'campus',
    title: 'Campus Fit Week',
    tag: 'Community',
    reward: 'Social feature',
    points: 150,
    theme: 'Everyday campus style with one bold detail.',
    image: '/lookbook/JF-8.JPG',
  },
  {
    id: 'drop-preview',
    title: 'Drop Preview Challenge',
    tag: 'Drop',
    reward: 'Reserved unreleased item',
    points: 300,
    theme: 'Style an unreleased piece before launch.',
    image: '/lookbook/JF-22.JPG',
  },
];

export const STARTER_LEADERBOARD = [
  { id: 'modupe', name: 'Modupe', points: 780, badge: 'Top Stylist' },
  { id: 'tife', name: 'Tife', points: 690, badge: 'Clean Fit' },
  { id: 'chucks', name: 'Chucks', points: 620, badge: 'Bold Layer' },
];

export const TREND_SIGNALS = [
  {
    id: 'oversized-black',
    name: 'Oversized black tees',
    platform: 'TikTok / IG',
    growth: 84,
    confidence: 91,
    colors: ['black', 'white'],
    keywords: ['oversized', 'minimal logo', 'streetwear tee'],
    action: 'Push black XXIII tees with complete-the-look bundles.',
  },
  {
    id: 'earth-technical',
    name: 'Earth-tone technical sets',
    platform: 'Pinterest / Store search',
    growth: 67,
    confidence: 78,
    colors: ['green', 'brown', 'cream'],
    keywords: ['olive', 'brown', 'motion', 'utility'],
    action: 'Test olive/brown colorways on Motion and Sweat silhouettes.',
  },
  {
    id: 'minimal-logo',
    name: 'Minimal logo luxury',
    platform: 'Store behavior',
    growth: 73,
    confidence: 86,
    colors: ['cream', 'white', 'black'],
    keywords: ['clean', 'premium', 'quiet logo'],
    action: 'Create a restrained capsule with premium product storytelling.',
  },
  {
    id: 'gym-lifestyle',
    name: 'Gym-to-street fits',
    platform: 'TikTok / comments',
    growth: 58,
    confidence: 72,
    colors: ['blue', 'pink', 'yellow'],
    keywords: ['athleisure', 'performance', 'morning routine'],
    action: 'Launch Athlete sets with a movement-focused challenge.',
  },
  {
    id: 'statement-denim',
    name: 'Statement denim bottoms',
    platform: 'Sales / Pinterest',
    growth: 61,
    confidence: 75,
    colors: ['denim', 'black'],
    keywords: ['wide leg', 'denim', 'relaxed pants'],
    action: 'Pair denim with black tees in stylist bundles.',
  },
];

export const DESIGN_DIRECTIONS = [
  {
    id: 'clean-premium',
    name: 'Clean Premium',
    palette: ['black', 'cream', 'white'],
    productTypes: ['Oversized tee', 'Sweat set', 'Cap'],
    language: 'quiet logo, precise placement, premium spacing',
  },
  {
    id: 'lagos-motion',
    name: 'Lagos Motion',
    palette: ['black', 'green', 'blue'],
    productTypes: ['Technical tee', 'Track set', 'Shorts'],
    language: 'speed lines, motion marks, city-coded typography',
  },
  {
    id: 'faith-identity',
    name: 'Faith Identity',
    palette: ['black', 'red', 'white'],
    productTypes: ['Graphic tee', 'Hoodie', 'Denim'],
    language: 'bold message, restrained iconography, strong center graphic',
  },
  {
    id: 'soft-power',
    name: 'Soft Power',
    palette: ['pink', 'cream', 'brown'],
    productTypes: ['Relaxed tee', 'Wide pant', 'Scarf'],
    language: 'soft color contrast, editorial marks, elegant tension',
  },
];

export const CURATION_CHECKLIST = [
  'Feels unmistakably like 23',
  'Works as a print or embroidery',
  'Uses a controlled color palette',
  'Avoids generic clipart',
  'Can be launched as a limited drop',
  'Legally clear for production',
];
