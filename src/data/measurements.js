// Garment measurement data + helpers for the ProductDetails "Garment Measurements" feature.
//
// Each garment TYPE has:
//   - a set of size columns (the same for every product of that type), and
//   - a list of measurement rows (label, key, value-per-size).
// The diagrams themselves live in the GarmentMeasurements component; this file
// is purely the numbers + the logic that decides which TYPE a product is.

// Canonical size order used for the table columns.
export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Explicit garment type per product id. Anything not listed falls back to the
// keyword classifier below. Accessories/shoes are intentionally omitted (no chart).
const GARMENT_TYPE_BY_ID = {
  // T-shirts / polos / jerseys / tee-style tops
  'top-xxiii-black': 'top',
  'top-xxiii-white': 'top',
  'top-xxiii-coll': 'top',
  'top-35': 'top', // Believer football jersey
  'top-34': 'top', // Creed tee
  'top-30': 'top', // Ascent tracksuit
  'top-31': 'top', // Altitude tracksuit
  'top-32': 'top', // Aurora tracksuit
  'top-33': 'top', // Vintage tracksuit
  'top-20': 'top', // Onyx polo
  'top-xxiii-blue': 'top',
  'top-xxiii-orange': 'top',
  'top-xxiii-pink': 'top',
  'top-xxiii-skyblue': 'top',
  'top-xxiii-yellow': 'top',
  'top-7': 'top', // Club polo
  'top-25': 'top', // Don
  'gym-2': 'top', // Breeze
  'gym-3': 'top', // Pulse
  'gym-4': 'top', // Volt
  'top-8': 'top', // Archive long sleeve
  'top-6': 'top', // Racer jersey
  'top-24': 'top', // Scholar cardigan

  // Trousers / joggers / denim bottoms
  'top-23': 'trousers', // Ivory tailored trousers
  'top-22': 'trousers', // Forest tailored trousers
  'top-21': 'trousers', // Midnight tailored trousers
  'gym-1': 'trousers', // Sprinter joggers
  'bottom-10': 'trousers', // Weekender denim set (shorts)
  'bottom-11': 'trousers', // Voyager denim set (jeans)

  // Shirts (short / camp-collar / open-collar)
  'top-4': 'shirt', // Ashante
  'top-1': 'shirt', // Scarlet
  'top-2': 'shirt', // Dreamer camp collar
  'top-3': 'shirt', // Mono
  'top-5': 'shirt', // Vision camp collar

  // Long-sleeve button-up / pinstripe shirts
  'top-19': 'button-up', // Groove pinstripe
  'top-26': 'button-up', // Shadow pinstripe
  'top-27': 'button-up', // Marine pinstripe
  'top-28': 'button-up', // Blaze pinstripe
  'top-29': 'button-up', // Sage pinstripe

  // Zip hoodie / sweat jackets
  'top-36': 'hoodie', // Panther
  'top-37': 'hoodie', // Emerald
  'top-38': 'hoodie', // Cherry
  'top-39': 'hoodie', // Cloud
};

// Keyword fallback for any product id not in the explicit map.
function classifyByName(name = '', category = '') {
  const n = name.toLowerCase();
  if (category === 'accessories' || category === 'shoes') return null;
  if (/(trouser|denim|jogger|short|jean)/.test(n)) return 'trousers';
  if (/(pinstripe|button-up|button up|button-down|button down)/.test(n)) return 'button-up';
  if (/(hood|sweat|jacket|zip)/.test(n)) return 'hoodie';
  if (/shirt/.test(n)) return 'shirt';
  return 'top';
}

export function getGarmentType(product) {
  if (!product) return null;
  if (product.category === 'accessories' || product.category === 'shoes') return null;
  // Two-piece sets (tracksuits, denim sets, training sets) are "up and down".
  if (product.isSet) return 'set';
  return GARMENT_TYPE_BY_ID[product.id] || classifyByName(product.name, product.category) || null;
}

// Measurement tables keyed by garment type.
// Each row: { key, label } and per-size values.
export const MEASUREMENTS = {
  trousers: {
    label: 'Trousers',
    rows: [
      { key: 'waist', label: 'Waist' },
      { key: 'frontRise', label: 'Front Rise' },
      { key: 'sideSeam', label: 'Side Seam' },
      { key: 'inseam', label: 'Inseam' },
      { key: 'legOpening', label: 'Leg Opening' },
    ],
    values: {
      XS: { waist: 28, frontRise: 12.0, sideSeam: 40, inseam: 28, legOpening: 8.0 },
      S: { waist: 30, frontRise: 12.5, sideSeam: 41, inseam: 29, legOpening: 8.5 },
      M: { waist: 32, frontRise: 13.0, sideSeam: 42, inseam: 30, legOpening: 9.0 },
      L: { waist: 34, frontRise: 13.5, sideSeam: 43, inseam: 31, legOpening: 9.5 },
      XL: { waist: 36, frontRise: 14.0, sideSeam: 44, inseam: 32, legOpening: 10.0 },
      XXL: { waist: 38, frontRise: 14.5, sideSeam: 45, inseam: 33, legOpening: 10.5 },
    },
  },
  shirt: {
    label: 'Shirt',
    rows: [
      { key: 'chest', label: 'Chest' },
      { key: 'shoulder', label: 'Shoulder' },
      { key: 'totalLength', label: 'Total Length' },
    ],
    values: {
      XS: { chest: 38.6, shoulder: 16.6, totalLength: 24.8 },
      S: { chest: 40.0, shoulder: 17.5, totalLength: 25.6 },
      M: { chest: 42.0, shoulder: 18.5, totalLength: 26.4 },
      L: { chest: 44.0, shoulder: 19.5, totalLength: 27.2 },
      XL: { chest: 46.0, shoulder: 20.5, totalLength: 28.0 },
      XXL: { chest: 48.0, shoulder: 21.5, totalLength: 28.8 },
    },
  },
  'button-up': {
    label: 'Button-Up Shirt',
    rows: [
      { key: 'shoulder', label: 'Shoulder' },
      { key: 'sleeve', label: 'Sleeve Length' },
      { key: 'pitToPit', label: 'Pit to Pit' },
      { key: 'backLength', label: 'Back Length' },
    ],
    values: {
      XS: { shoulder: 16.6, sleeve: 24.0, pitToPit: 38.6, backLength: 24.8 },
      S: { shoulder: 17.5, sleeve: 25.0, pitToPit: 40.0, backLength: 25.6 },
      M: { shoulder: 18.5, sleeve: 26.0, pitToPit: 42.0, backLength: 26.4 },
      L: { shoulder: 19.5, sleeve: 27.0, pitToPit: 44.0, backLength: 27.2 },
      XL: { shoulder: 20.5, sleeve: 28.0, pitToPit: 46.0, backLength: 28.0 },
      XXL: { shoulder: 21.5, sleeve: 29.0, pitToPit: 48.0, backLength: 28.8 },
    },
  },
  hoodie: {
    label: 'Hoodie',
    rows: [
      { key: 'back', label: 'Back' },
      { key: 'chest', label: 'Chest' },
      { key: 'shoulder', label: 'Shoulder' },
      { key: 'sleeve', label: 'Sleeve Length' },
    ],
    values: {
      XS: { back: 21.4, chest: 25.2, shoulder: 25.6, sleeve: 20.8 },
      S: { back: 22.2, chest: 26.8, shoulder: 26.4, sleeve: 21.4 },
      M: { back: 23.0, chest: 28.4, shoulder: 27.2, sleeve: 22.0 },
      L: { back: 23.8, chest: 30.0, shoulder: 28.0, sleeve: 22.6 },
      XL: { back: 24.6, chest: 31.6, shoulder: 28.8, sleeve: 23.2 },
      XXL: { back: 25.4, chest: 33.2, shoulder: 29.6, sleeve: 23.8 },
    },
  },
  top: {
    label: 'Top',
    rows: [
      { key: 'chest', label: 'Chest' },
      { key: 'sleeve', label: 'Sleeve Length' },
      { key: 'totalLength', label: 'Total Length' },
    ],
    values: {
      XS: { chest: 18.5, sleeve: 12.2, totalLength: 24.8 },
      S: { chest: 19.5, sleeve: 12.6, totalLength: 25.6 },
      M: { chest: 20.5, sleeve: 13.0, totalLength: 26.4 },
      L: { chest: 21.5, sleeve: 13.4, totalLength: 27.2 },
      XL: { chest: 22.5, sleeve: 13.8, totalLength: 28.0 },
      XXL: { chest: 23.5, sleeve: 14.2, totalLength: 28.8 },
    },
  },
  set: {
    label: 'Two-Piece Set',
    // top measurements first, then bottom (joggers / trousers half)
    rows: [
      { key: 'chestTop', label: 'Top Chest' },
      { key: 'sleeveTop', label: 'Top Sleeve' },
      { key: 'topLength', label: 'Top Length' },
      { key: 'waistBottom', label: 'Bottom Waist' },
      { key: 'inseamBottom', label: 'Bottom Inseam' },
    ],
    values: {
      XS: { chestTop: 20.5, sleeveTop: 24.0, topLength: 26.0, waistBottom: 28, inseamBottom: 28 },
      S: { chestTop: 22.0, sleeveTop: 25.0, topLength: 27.0, waistBottom: 30, inseamBottom: 29 },
      M: { chestTop: 23.5, sleeveTop: 26.0, topLength: 28.0, waistBottom: 32, inseamBottom: 30 },
      L: { chestTop: 25.0, sleeveTop: 27.0, topLength: 29.0, waistBottom: 34, inseamBottom: 31 },
      XL: { chestTop: 26.5, sleeveTop: 28.0, topLength: 30.0, waistBottom: 36, inseamBottom: 32 },
      XXL: { chestTop: 28.0, sleeveTop: 29.0, topLength: 31.0, waistBottom: 38, inseamBottom: 33 },
    },
  },
};

// Returns { type, table, sizes } for a product, or null if no chart applies.
// `sizes` is the filtered canonical size list available for this product.
export function getGarmentMeasurements(product) {
  const type = getGarmentType(product);
  if (!type) return null;
  const table = MEASUREMENTS[type];
  if (!table) return null;

  const available = (product.sizes || []).filter(
    (s) => SIZE_ORDER.includes(s) && table.values[s]
  );
  if (available.length === 0) return null;

  return { type, table, sizes: available };
}
