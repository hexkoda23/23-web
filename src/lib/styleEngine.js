const COLOR_RULES = [
  { color: 'black', terms: ['black', 'noir', 'obscura', 'ebene', 'obsidian', 'nocturne'] },
  { color: 'white', terms: ['white', 'blanche', 'blanc', 'purete'] },
  { color: 'cream', terms: ['cream', 'creme'] },
  { color: 'green', terms: ['green', 'verdant', 'verte', 'groove', 'emerald', 'emeraude'] },
  { color: 'blue', terms: ['blue', 'azur', 'saphir', 'ciel'] },
  { color: 'pink', terms: ['pink', 'rose', 'poudre'] },
  { color: 'orange', terms: ['orange', 'ambre'] },
  { color: 'yellow', terms: ['yellow', 'soleil', 'jaune'] },
  { color: 'red', terms: ['red', 'rouge', 'ecarlate', 'intensite'] },
  { color: 'brown', terms: ['brown', 'brun', 'bordeaux', 'wine'] },
  { color: 'denim', terms: ['denim', 'jean'] },
  { color: 'grey', terms: ['grey', 'gray', 'ash'] },
];

const BUDGET_LIMITS = {
  'under-25': 25000,
  '25-50': 50000,
  '50-100': 100000,
  open: Number.POSITIVE_INFINITY,
};

const CATEGORY_LABELS = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  fullFit: 'Full fit',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories',
};

const STORAGE_KEYS = {
  preferences: '23_ai_style_preferences',
  events: '23_ai_style_events',
  savedLooks: '23_ai_saved_looks',
};

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const getText = (product) => normalizeText([
  product.id,
  product.name,
  product.category,
  product.description,
  product.writeUp,
  product.image,
].filter(Boolean).join(' '));

const getColorText = (product) => normalizeText([
  product.id,
  product.name,
  product.category,
  product.image,
  product.images?.join(' '),
].filter(Boolean).join(' '));

export function formatPrice(value) {
  return `NGN ${Number(value || 0).toLocaleString('en-NG')}`;
}

export function inferFunctionalCategory(product) {
  const text = getText(product);

  if (product.isSet) return 'fullFit';
  if (product.category === 'accessories' || product.id?.startsWith('acc-')) return 'accessories';
  if (product.category === 'shoes' || product.id?.startsWith('shoe-') || text.includes('shoe')) return 'shoes';
  if (text.includes('jacket') || text.includes('hoodie') || text.includes('cardigan') || product.category === 'outerwear') return 'outerwear';
  if (
    product.id?.startsWith('bottom-') ||
    text.includes('pant') ||
    text.includes('trouser') ||
    text.includes('denim') ||
    text.includes('jean') ||
    text.includes('jogger') ||
    text.includes('short')
  ) return 'bottoms';

  return 'tops';
}

export function inferColorTags(product) {
  const text = getColorText(product);
  const matches = COLOR_RULES
    .filter(rule => rule.terms.some(term => text.includes(term)))
    .map(rule => rule.color);

  return matches.length ? [...new Set(matches)] : ['neutral'];
}

export function inferStyleTags(product) {
  const text = getText(product);
  const colors = inferColorTags(product);
  const category = inferFunctionalCategory(product);
  const tags = new Set(['streetwear']);

  if (['black', 'white', 'cream', 'grey', 'neutral'].some(color => colors.includes(color))) {
    tags.add('clean');
    tags.add('minimal');
  }

  if (['red', 'orange', 'yellow', 'pink', 'green', 'blue'].some(color => colors.includes(color))) {
    tags.add('bold');
  }

  if (text.includes('premium') || text.includes('luxury') || text.includes('prestige') || text.includes('imperial')) {
    tags.add('luxury');
  }

  if (text.includes('gym') || text.includes('athlete') || text.includes('motion') || text.includes('racing')) {
    tags.add('sporty');
  }

  if (text.includes('faith') || text.includes('identity') || text.includes('imagine') || text.includes('manifest') || text.includes('groove')) {
    tags.add('creative');
  }

  if (category === 'fullFit' || category === 'outerwear') {
    tags.add('statement');
  }

  if (category === 'accessories' || category === 'shoes') {
    tags.add('finishing');
  }

  return [...tags];
}

export function inferOccasionTags(product) {
  const text = getText(product);
  const category = inferFunctionalCategory(product);
  const tags = new Set(['everyday', 'casual']);

  if (category === 'fullFit' || text.includes('luxury') || text.includes('prestige')) tags.add('event');
  if (text.includes('black') || text.includes('noir') || text.includes('bordeaux')) tags.add('night-out');
  if (text.includes('campus') || category === 'tops' || category === 'bottoms') tags.add('campus');
  if (text.includes('gym') || text.includes('athlete') || text.includes('motion')) tags.add('training');
  if (category === 'shoes' || text.includes('work') || text.includes('dress')) tags.add('work-casual');

  return [...tags];
}

export function toCatalogRecord(product) {
  return {
    product_id: product.id,
    name: product.name,
    category: CATEGORY_LABELS[inferFunctionalCategory(product)] || product.category,
    price: product.price,
    currency: 'NGN',
    sizes: product.sizes || [],
    colors: inferColorTags(product),
    style_tags: inferStyleTags(product),
    occasion_tags: inferOccasionTags(product),
    description: product.description || '',
    image_urls: product.images || [product.image].filter(Boolean),
    product_url: `/product/${product.id}`,
    stock_status: product.inStock || product.category === 'unreleased' ? 'in_stock' : 'out_of_stock',
  };
}

export function buildCatalog(products) {
  return products.filter(product => !product.hidden).map(toCatalogRecord);
}

export function getCatalogStats(products) {
  const catalog = buildCatalog(products);
  const colors = new Set();
  const styles = new Set();
  const occasions = new Set();

  catalog.forEach(product => {
    product.colors.forEach(color => colors.add(color));
    product.style_tags.forEach(tag => styles.add(tag));
    product.occasion_tags.forEach(tag => occasions.add(tag));
  });

  return {
    products: catalog.length,
    inStock: catalog.filter(product => product.stock_status === 'in_stock').length,
    colors: colors.size,
    styles: styles.size,
    occasions: occasions.size,
    averagePrice: Math.round(catalog.reduce((sum, product) => sum + product.price, 0) / Math.max(catalog.length, 1)),
  };
}

function normalizePreferenceList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function getBudgetLimit(budget) {
  return BUDGET_LIMITS[budget] ?? BUDGET_LIMITS.open;
}

function scoreProduct(product, preferences = {}, focusProductId = null) {
  if (product.hidden) return -1;
  if (!product.inStock && product.category !== 'unreleased') return -1;

  const colors = inferColorTags(product);
  const styles = inferStyleTags(product);
  const occasions = inferOccasionTags(product);
  const category = inferFunctionalCategory(product);
  const wantedColors = normalizePreferenceList(preferences.colors);
  const wantedVibe = preferences.vibe;
  const wantedOccasion = preferences.occasion;
  const wantedSize = preferences.size;
  const budgetLimit = getBudgetLimit(preferences.budget);
  let score = 0;

  if (product.price <= budgetLimit) score += 18;
  else score -= Math.min(22, Math.ceil((product.price - budgetLimit) / 5000));

  if (!wantedSize || wantedSize === 'custom' || product.sizes?.includes(wantedSize)) score += 12;
  else score -= 35;

  if (wantedColors.includes('ai')) score += 6;
  else if (wantedColors.some(color => colors.includes(color))) score += 18;
  else if (colors.includes('black') || colors.includes('white') || colors.includes('cream')) score += 4;

  if (wantedVibe && styles.includes(wantedVibe)) score += 20;
  if (wantedVibe === 'luxury' && styles.includes('statement')) score += 8;
  if (wantedVibe === 'bold' && styles.includes('statement')) score += 8;
  if (wantedVibe === 'clean' && styles.includes('minimal')) score += 10;
  if (wantedVibe === 'minimal' && styles.includes('clean')) score += 10;

  if (wantedOccasion && occasions.includes(wantedOccasion)) score += 18;
  if (wantedOccasion === 'event' && category === 'fullFit') score += 10;
  if (wantedOccasion === 'streetwear' && styles.includes('streetwear')) score += 12;
  if (wantedOccasion === 'training' && styles.includes('sporty')) score += 16;

  if (focusProductId && product.id === focusProductId) score += 50;
  if (product.category === 'new') score += 5;
  if (product.category === 'unreleased') score += 2;

  return score;
}

function getPool(products, preferences, focusProductId = null) {
  return products
    .filter(product => !product.hidden)
    .map(product => ({ product, score: scoreProduct(product, preferences, focusProductId) }))
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score);
}

function pickByCategory(scoredProducts, category, usedIds, fallback = false) {
  const match = scoredProducts.find(({ product }) => (
    inferFunctionalCategory(product) === category &&
    !usedIds.has(product.id)
  ));

  if (match) return match.product;
  if (!fallback) return null;

  const any = scoredProducts.find(({ product }) => !usedIds.has(product.id));
  return any?.product || null;
}

function createReason(outfit, preferences) {
  const names = outfit.products.map(product => product.name).join(', ');
  const vibe = preferences.vibe || '23';
  const occasion = preferences.occasion || 'everyday';
  const colors = normalizePreferenceList(preferences.colors).filter(color => color !== 'ai');
  const colorLine = colors.length ? ` It stays close to your ${colors.join('/')} preference.` : ' The palette is selected by the stylist engine.';

  return `A ${vibe} ${occasion} direction built from ${names}.${colorLine}`;
}

export function buildOutfitRecommendations(products, preferences = {}, focusProductId = null, count = 4) {
  const scoredProducts = getPool(products, preferences, focusProductId);
  const outfits = [];
  const seenSignatures = new Set();
  const anchors = scoredProducts.slice(0, 12);

  anchors.forEach(({ product: anchor }) => {
    if (outfits.length >= count) return;

    const usedIds = new Set([anchor.id]);
    const category = inferFunctionalCategory(anchor);
    const outfitProducts = [anchor];

    if (category === 'fullFit') {
      const shoe = pickByCategory(scoredProducts, 'shoes', usedIds);
      if (shoe) {
        usedIds.add(shoe.id);
        outfitProducts.push(shoe);
      }
      const accessory = pickByCategory(scoredProducts, 'accessories', usedIds);
      if (accessory) outfitProducts.push(accessory);
    } else if (category === 'tops' || category === 'outerwear') {
      const bottom = pickByCategory(scoredProducts, 'bottoms', usedIds);
      if (bottom) {
        usedIds.add(bottom.id);
        outfitProducts.push(bottom);
      }
      const accessory = pickByCategory(scoredProducts, 'accessories', usedIds);
      if (accessory) {
        usedIds.add(accessory.id);
        outfitProducts.push(accessory);
      }
    } else if (category === 'bottoms') {
      const top = pickByCategory(scoredProducts, 'tops', usedIds);
      if (top) {
        usedIds.add(top.id);
        outfitProducts.push(top);
      }
      const accessory = pickByCategory(scoredProducts, 'accessories', usedIds);
      if (accessory) outfitProducts.push(accessory);
    } else {
      const top = pickByCategory(scoredProducts, 'tops', usedIds, true);
      if (top) {
        usedIds.add(top.id);
        outfitProducts.push(top);
      }
      const bottom = pickByCategory(scoredProducts, 'bottoms', usedIds);
      if (bottom) outfitProducts.push(bottom);
    }

    const signature = outfitProducts.map(item => item.id).sort().join('|');
    if (signature && !seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      const total = outfitProducts.reduce((sum, item) => sum + Number(item.price || 0), 0);
      const titleBase = preferences.vibe ? `${preferences.vibe} fit` : '23 fit';
      outfits.push({
        id: `look-${outfits.length + 1}-${signature}`,
        title: titleBase.replace(/(^|\s)\S/g, letter => letter.toUpperCase()),
        products: outfitProducts,
        total,
        reason: createReason({ products: outfitProducts }, preferences),
        alternative: scoredProducts.find(({ product }) => !usedIds.has(product.id))?.product || null,
        confidence: Math.min(98, 72 + Math.round(scoredProducts[0]?.score || 0) / 2),
      });
    }
  });

  return outfits;
}

export function getDefaultSize(product, requestedSize = 'M') {
  if (!product?.sizes?.length) return '';
  if (product.sizes.includes(requestedSize)) return requestedSize;
  if (product.sizes[0] === 'coming soon') return '';
  return product.sizes[0];
}

export function saveStylePreferences(preferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
}

export function loadStylePreferences() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.preferences);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function trackStyleEvent(type, payload = {}) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.events);
    const events = raw ? JSON.parse(raw) : [];
    const nextEvents = [
      {
        type,
        payload,
        createdAt: new Date().toISOString(),
      },
      ...events,
    ].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(nextEvents));
  } catch {
    // Analytics should never break shopping.
  }
}

export function saveLook(look) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.savedLooks);
    const looks = raw ? JSON.parse(raw) : [];
    const nextLooks = [look, ...looks.filter(item => item.id !== look.id)].slice(0, 12);
    localStorage.setItem(STORAGE_KEYS.savedLooks, JSON.stringify(nextLooks));
    return nextLooks;
  } catch {
    return [];
  }
}

export function loadSavedLooks() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.savedLooks);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
