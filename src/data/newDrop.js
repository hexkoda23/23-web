const root = '/wardrobe/new-drop';
const shared = { category: 'new', isNew: true, inStock: true, sizes: ['S', 'M', 'L', 'XL'], functionalCategory: 'tops' };

export const NEW_DROP_PRODUCTS = [
  ...[
    ['green', 'Forest Green', '#347446', ['green', 'white']],
    ['black', 'Black', '#202020', ['black', 'white']],
    ['red', 'Red', '#b42d31', ['red', 'white']],
  ].map(([key, colorName, swatch, colors]) => ({
    ...shared,
    id: `top-raglan-${key}`,
    name: `The 23 Raglan — ${colorName}`,
    collectionName: 'The 23 Raglan',
    variantGroup: '23-raglan-drop',
    colorName, swatch, colors,
    price: 25000,
    image: `${root}/raglan-${key}-front.jpg`,
    images: [`${root}/raglan-${key}-front.jpg`, `${root}/raglan-${key}-back.jpg`],
    imageLabels: ['Front view', 'Back view'],
    description: 'A white canvas. A signature in color. Contrast raglan sleeves frame the twenty3ree wordmark, while an oversized 23 makes the back unmistakable. Easy to wear. Impossible to overlook.',
    writeUp: 'The 23 Raglan brings a sporting silhouette into the Twenty3 world. A contrast crew neckline and sleeves give the white body a confident frame. Gothic lettering across the chest, a small 23 at the front hem, and the bold number on the back tell the same story from every angle. Choose Forest Green, Black, or Red — one design, three expressions of you. ₦25,000 per shirt. Your Twenty3 identity is ready to make its entrance.',
  })),
  ...[
    ['blue', 'Powder Blue / Camo', '#9dbacb', ['blue', 'green']],
    ['black', 'Black / Camo', '#202020', ['black', 'green']],
  ].map(([key, colorName, swatch, colors]) => ({
    ...shared,
    id: `top-terrain-${key}`,
    name: `The Terrain Shirt — ${colorName}`,
    collectionName: 'The Terrain Shirt',
    variantGroup: '23-terrain-drop',
    colorName, swatch, colors,
    price: 45000,
    image: `${root}/terrain-${key}-front.jpg`,
    images: [`${root}/terrain-${key}-front.jpg`, `${root}/terrain-${key}-back.png`],
    imageLabels: ['Front view', 'Back view · design mockup'],
    generatedBackView: true,
    description: 'Clean lines meet a wilder instinct. A cropped, boxy zip-front shirt with a pointed collar, signature script at the chest, and olive camouflage across the lower body and chest pocket. Two colorways. One distinct attitude.',
    writeUp: 'The Terrain Shirt balances a tailored upper panel with the energy of woodland camouflage. Its short sleeves and cropped silhouette keep the proportions deliberate, while the full-length front zipper adds a clean, modern finish. The camo chest pocket echoes the lower panel; the Twentythree script gives the design its signature. Choose Powder Blue / Camo for a lighter contrast or Black / Camo for a sharper edge. Each shirt is ₦45,000 and sold individually. Front photography is supplied by Twenty3; the rear-view image is a generated design mockup based on the visible front construction.',
  })),
];

export const NEW_DROP_GROUPS = [
  { id: '23-raglan-drop', title: 'The 23 Raglan', subtitle: 'Three colors. One unmistakable signature.', image: `${root}/raglan-collection.jpg`, products: NEW_DROP_PRODUCTS.filter(p => p.variantGroup === '23-raglan-drop') },
  { id: '23-terrain-drop', title: 'The Terrain Shirt', subtitle: 'A clean silhouette. A wilder instinct.', image: `${root}/terrain-collection.jpg`, products: NEW_DROP_PRODUCTS.filter(p => p.variantGroup === '23-terrain-drop') },
];
