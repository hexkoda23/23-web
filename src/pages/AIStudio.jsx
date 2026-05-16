import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Bookmark,
  Camera,
  Check,
  CheckCircle2,
  Eye,
  Heart,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  TrendingUp,
  Trophy,
  Upload,
  Wand2,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useCart } from '../contexts/CartContext';
import { PRODUCTS } from '../data/products';
import {
  COLOR_OPTIONS,
  CURATION_CHECKLIST,
  DESIGN_DIRECTIONS,
  STARTER_LEADERBOARD,
  STYLE_CHALLENGES,
  STYLIST_QUESTIONS,
  TREND_SIGNALS,
} from '../data/aiEcosystem';
import {
  buildCatalog,
  buildOutfitRecommendations,
  formatPrice,
  getCatalogStats,
  getDefaultSize,
  inferColorTags,
  inferFunctionalCategory,
  inferStyleTags,
  loadSavedLooks,
  loadStylePreferences,
  saveLook,
  saveStylePreferences,
  toCatalogRecord,
  trackStyleEvent,
} from '../lib/styleEngine';

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  if (!src.startsWith('data:') && !src.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

async function createLocalTryOnPreview(photoSrc, productSrc, productName) {
  const [subjectImage, productImage] = await Promise.all([
    loadImage(photoSrc),
    loadImage(productSrc),
  ]);

  const maxSide = 1080;
  const scale = Math.min(1, maxSide / Math.max(subjectImage.naturalWidth, subjectImage.naturalHeight));
  const width = Math.max(420, Math.round(subjectImage.naturalWidth * scale));
  const height = Math.max(520, Math.round(subjectImage.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const drawCover = (image, x, y, targetWidth, targetHeight) => {
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = targetWidth / targetHeight;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (sourceRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, targetWidth, targetHeight);
  };

  drawCover(subjectImage, 0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0.02)');
  gradient.addColorStop(0.58, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const torsoWidth = width * (width < 560 ? 0.64 : 0.5);
  const torsoHeight = Math.min(height * 0.42, torsoWidth * 1.22);
  const torsoX = (width - torsoWidth) / 2;
  const torsoY = height * 0.27;
  const garmentCanvas = document.createElement('canvas');
  garmentCanvas.width = Math.round(torsoWidth);
  garmentCanvas.height = Math.round(torsoHeight);
  const garmentCtx = garmentCanvas.getContext('2d');
  garmentCtx.clearRect(0, 0, garmentCanvas.width, garmentCanvas.height);

  const productRatio = productImage.naturalWidth / productImage.naturalHeight;
  const targetRatio = garmentCanvas.width / garmentCanvas.height;
  let garmentWidth = garmentCanvas.width;
  let garmentHeight = garmentCanvas.height;
  if (productRatio > targetRatio) {
    garmentHeight = garmentCanvas.width / productRatio;
  } else {
    garmentWidth = garmentCanvas.height * productRatio;
  }
  garmentCtx.drawImage(
    productImage,
    (garmentCanvas.width - garmentWidth) / 2,
    (garmentCanvas.height - garmentHeight) / 2,
    garmentWidth,
    garmentHeight
  );

  const pixels = garmentCtx.getImageData(0, 0, garmentCanvas.width, garmentCanvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    const isWhiteBackground = r > 236 && g > 236 && b > 232;
    const isVeryLight = r > 224 && g > 224 && b > 218;
    if (isWhiteBackground) {
      pixels.data[i + 3] = 0;
    } else if (isVeryLight) {
      pixels.data[i + 3] = Math.min(pixels.data[i + 3], 120);
    }
  }
  garmentCtx.putImageData(pixels, 0, 0);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.38)';
  ctx.shadowBlur = width * 0.035;
  ctx.shadowOffsetY = width * 0.015;
  ctx.drawImage(garmentCanvas, torsoX, torsoY, torsoWidth, torsoHeight);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#F1ECE1';
  ctx.lineWidth = 2;
  for (let y = torsoY - 18; y < torsoY + torsoHeight + 18; y += 22) {
    ctx.beginPath();
    ctx.moveTo(torsoX - 20, y);
    ctx.lineTo(torsoX + torsoWidth + 20, y + 8);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(18, height - 92, Math.min(width - 36, 520), 64);
  ctx.fillStyle = '#F1ECE1';
  ctx.font = `700 ${Math.max(11, width * 0.018)}px DM Sans, sans-serif`;
  ctx.letterSpacing = '2px';
  ctx.fillText('23 TRY-ON SCAN COMPLETE', 34, height - 62);
  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.font = `600 ${Math.max(10, width * 0.015)}px DM Sans, sans-serif`;
  ctx.fillText(productName.slice(0, 42).toUpperCase(), 34, height - 40);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

const DEFAULT_ANSWERS = {
  occasion: 'streetwear',
  vibe: 'clean',
  budget: '25-50',
  colors: ['black'],
  size: 'M',
};

const TABS = [
  { id: 'stylist', label: 'Stylist', icon: Sparkles },
  { id: 'tryon', label: 'Try-On', icon: Camera },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'designs', label: 'Designs', icon: Wand2 },
];

const MODULE_GUIDES = {
  stylist: {
    title: 'AI Personal Stylist',
    summary: 'Customers answer a few style questions, then 23 recommends real catalog outfits that match their occasion, colors, size, and budget.',
    steps: ['Pick the occasion and vibe.', 'Choose budget, colors, and size.', 'Review 2 curated looks, save favorites, or add pieces to cart.'],
    outcome: 'Best for shoppers who want a complete 23 fit fast.',
  },
  tryon: {
    title: 'AI Outfit Try-On',
    summary: 'Customers upload a clear photo, pick a 23 item, give temporary preview consent, and generate a styled image with that item placed on the photo.',
    steps: ['Upload a front-facing photo.', 'Select the 23 product to preview.', 'Generate the styled preview, then shop the item if the fit direction feels right.'],
    outcome: 'Best for reducing hesitation before checkout.',
  },
  challenges: {
    title: 'Style Challenges',
    summary: 'Customers join culture-driven challenges, upload their fit, collect votes, earn points, and compete for rewards or social features.',
    steps: ['Choose the active challenge.', 'Upload a clean outfit photo and submit.', 'Invite votes, climb the leaderboard, and unlock rewards.'],
    outcome: 'Best for building the 23 community around real customer style.',
  },
  trends: {
    title: 'Trend Predictor',
    summary: '23 tracks fashion signals, catalog data, and customer behavior so future drops can follow what people actually want.',
    steps: ['Review rising signals and confidence.', 'Compare keywords, growth, and recommended action.', 'Use strong signals to plan campaigns or drops.'],
    outcome: 'Best for smarter product and campaign decisions.',
  },
  designs: {
    title: 'AI Design Engine',
    summary: '23 turns trend signals into controlled design concepts that still need human curation before they become real limited drops.',
    steps: ['Pick a trend and design direction.', 'Generate a concept prompt.', 'Curate, refine, poll, then produce only the strongest ideas.'],
    outcome: 'Best for faster concept development without losing brand taste.',
  },
};

const CHALLENGE_STORAGE_KEY = '23_ai_challenge_submissions';

function getStoredSubmissions() {
  try {
    const raw = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredSubmissions(submissions) {
  localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(submissions));
}

function TabButton({ tab, activeTab, onClick }) {
  const Icon = tab.icon;
  const isActive = activeTab === tab.id;

  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`h-12 min-w-[132px] px-4 flex items-center justify-center gap-2 border text-[9px] font-mono uppercase tracking-[0.2em] transition-all duration-300 ${
        isActive
          ? 'bg-black text-white border-black shadow-[0_18px_40px_rgba(0,0,0,0.16)]'
          : 'bg-white text-black/45 border-black/10 hover:border-black hover:text-black hover:bg-black/[0.02]'
      }`}
    >
      <Icon size={14} />
      <span>{tab.label}</span>
    </button>
  );
}

function ModuleGuide({ activeTab }) {
  const guide = MODULE_GUIDES[activeTab] || MODULE_GUIDES.stylist;

  return (
    <section className="bg-[#f3f0ea] border-b border-black/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-[1fr_1.45fr_0.85fr] gap-6 lg:gap-10">
        <div>
          <div className="section-tag mb-3">Customer guide</div>
          <h2 className="attention-product attention-heading text-3xl md:text-4xl text-black">{guide.title}</h2>
        </div>
        <div>
          <p className="text-sm md:text-base leading-relaxed text-black/65">{guide.summary}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            {guide.steps.map((step, index) => (
              <div key={step} className="border border-black/10 bg-white/60 p-3">
                <p className="font-display attention-heading text-xl text-black/30">{String(index + 1).padStart(2, '0')}</p>
                <p className="mt-2 text-xs leading-relaxed text-black/60">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-l border-black/10 pl-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">Customer outcome</p>
          <p className="mt-3 text-sm leading-relaxed text-black/65">{guide.outcome}</p>
        </div>
      </div>
    </section>
  );
}

function OptionGroup({ question, value, onChange }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={14} />
        <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] font-bold text-black/45">
          {question.label}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(question.id, option.value)}
            className={`min-h-12 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.11em] border transition-all duration-300 ${
              value === option.value
                ? 'bg-black text-white border-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]'
                : 'bg-white text-black/55 border-black/10 hover:border-black hover:text-black'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorPicker({ selected, onChange }) {
  const toggleColor = (color) => {
    if (color === 'ai') {
      onChange(['ai']);
      return;
    }

    const withoutAi = selected.filter(item => item !== 'ai');
    const next = withoutAi.includes(color)
      ? withoutAi.filter(item => item !== color)
      : [...withoutAi, color];
    onChange(next.length ? next : ['ai']);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} />
        <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] font-bold text-black/45">
          Color direction
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {COLOR_OPTIONS.map(option => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleColor(option.value)}
              className={`min-h-12 px-3 flex items-center gap-3 border text-left transition-all duration-300 ${
                active ? 'border-black bg-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]' : 'border-black/10 bg-white text-black/55 hover:border-black hover:text-black'
              }`}
            >
              <span
                className="w-5 h-5 border border-black/10 flex-shrink-0"
                style={{ background: option.swatch }}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.11em]">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border-l border-current/10 pl-4">
      <p className="font-display attention-heading text-3xl md:text-4xl leading-[0.9]">{value}</p>
      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] opacity-45">{label}</p>
    </div>
  );
}

function ProductTile({ product, onAdd, compact = false }) {
  const catalogRecord = toCatalogRecord(product);

  return (
    <div className="bg-white border border-black/10 min-w-0">
      <Link to={`/product/${product.id}`} className="block aspect-[4/5] bg-[#f7f7f5] overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-700" />
      </Link>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <div className="min-w-0">
            <Link to={`/product/${product.id}`} className="block attention-product text-[13px] hover:text-black/60">
              {product.name}
            </Link>
            {!compact && (
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-black/40">
                {catalogRecord.category}
              </p>
            )}
          </div>
          <p className="font-mono text-[9px] font-bold whitespace-nowrap">{formatPrice(product.price)}</p>
        </div>
        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {catalogRecord.style_tags.slice(0, 3).map(tag => (
              <span key={tag} className="bg-black/[0.04] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-black/55">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => onAdd(product)}
          className="mt-3 w-full h-10 bg-black text-white hover:bg-[var(--accent)] hover:text-black transition-colors font-mono text-[9px] uppercase tracking-[0.16em] font-bold flex items-center justify-center gap-2"
        >
          <ShoppingBag size={13} />
          Add
        </button>
      </div>
    </div>
  );
}

function OutfitCard({ look, onAddProduct, onFeedback, onSave }) {
  return (
    <article
      className="bg-white border border-black/10 shadow-[0_28px_80px_rgba(0,0,0,0.07)]"
    >
      <div className="p-5 md:p-6 border-b border-black/10 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-black/35">Match {look.confidence}%</p>
          <h3 className="mt-2 attention-product attention-heading text-3xl">{look.title}</h3>
        </div>
        <p className="font-mono text-[10px] font-bold whitespace-nowrap">{formatPrice(look.total)}</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(138px,1fr))] gap-px bg-black/10">
        {look.products.map(product => (
          <ProductTile key={product.id} product={product} onAdd={onAddProduct} compact />
        ))}
      </div>

      <div className="p-5 md:p-6 space-y-5">
        <p className="text-sm leading-relaxed text-black/65">{look.reason}</p>
        {look.alternative && (
          <div className="flex items-center justify-between gap-4 bg-[#f7f7f5] p-4 border border-black/[0.04]">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-black/35">Alternative</p>
              <p className="attention-product text-sm">{look.alternative.name}</p>
            </div>
            <Link to={`/product/${look.alternative.id}`} className="font-mono text-[9px] uppercase tracking-[0.16em] border-b border-black">
              View
            </Link>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onFeedback(look, 'like')}
            className="h-11 border border-black/10 hover:border-black hover:bg-black/[0.02] font-mono text-[9px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors"
          >
            <Heart size={13} />
            Like
          </button>
          <button
            onClick={() => onFeedback(look, 'dislike')}
            className="h-11 border border-black/10 hover:border-black hover:bg-black/[0.02] font-mono text-[9px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors"
          >
            <ThumbsDown size={13} />
            Pass
          </button>
          <button
            onClick={() => onSave(look)}
            className="h-11 bg-black text-white hover:bg-[var(--accent)] hover:text-black font-mono text-[9px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors"
          >
            <Bookmark size={13} />
            Save
          </button>
        </div>
      </div>
    </article>
  );
}

function StylistExperience({ focusProduct, answers, setAnswers }) {
  const { addToCart } = useCart();
  const [savedLooks, setSavedLooks] = useState(() => loadSavedLooks());
  const catalogStats = useMemo(() => getCatalogStats(PRODUCTS), []);
  const recommendations = useMemo(
    () => buildOutfitRecommendations(PRODUCTS, answers, focusProduct?.id, 4),
    [answers, focusProduct]
  );
  const catalogPreview = useMemo(() => buildCatalog(PRODUCTS).slice(0, 6), []);

  const handleAnswerChange = (key, value) => {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    saveStylePreferences(nextAnswers);
    trackStyleEvent('stylist_answer', { key, value });
  };

  const handleAddProduct = (product) => {
    const size = getDefaultSize(product, answers.size);
    addToCart(product, size, 1);
    trackStyleEvent('stylist_add_to_cart', { productId: product.id, size });
  };

  const handleFeedback = (look, sentiment) => {
    trackStyleEvent('stylist_feedback', {
      lookId: look.id,
      sentiment,
      productIds: look.products.map(product => product.id),
    });
  };

  const handleSaveLook = (look) => {
    const nextSaved = saveLook({
      ...look,
      savedAt: new Date().toISOString(),
      products: look.products.map(product => ({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      })),
    });
    setSavedLooks(nextSaved);
    trackStyleEvent('stylist_save_look', { lookId: look.id });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10">
      <section className="xl:col-span-4 space-y-6 xl:sticky xl:top-40 self-start">
        <div className="bg-[#f3f0ea] p-5 md:p-7 border border-black/10 shadow-[0_28px_80px_rgba(0,0,0,0.06)]">
          <div className="section-tag mb-2">Find Your 23 Fit</div>
          <p className="mb-7 max-w-sm text-sm leading-relaxed text-black/55">
            A controlled stylist system for occasions, palette, size, and budget. Every result is pulled from the 23 catalog.
          </p>
          <div className="space-y-7">
            {STYLIST_QUESTIONS.map(question => (
              <OptionGroup
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={handleAnswerChange}
              />
            ))}
            <ColorPicker
              selected={answers.colors}
              onChange={(colors) => handleAnswerChange('colors', colors)}
            />
          </div>
        </div>

        <div className="bg-black text-white p-5 md:p-7 shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 mb-6">
            <Search size={18} className="text-[var(--accent)]" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">Catalog intelligence</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Metric label="Products mapped" value={catalogStats.products} />
            <Metric label="In stock" value={catalogStats.inStock} />
            <Metric label="Color tags" value={catalogStats.colors} />
            <Metric label="Style tags" value={catalogStats.styles} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-2">
            {catalogPreview.map(record => (
              <div key={record.product_id} className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/50 truncate">
                  {record.name}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--accent)] whitespace-nowrap">
                  {record.colors.slice(0, 2).join('/')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {savedLooks.length > 0 && (
          <div className="border border-black/10 p-5 bg-white">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50 mb-4">Saved looks</h3>
            <div className="space-y-3">
              {savedLooks.slice(0, 3).map(look => (
                <div key={look.id} className="flex gap-2">
                  {look.products.slice(0, 3).map(product => (
                    <img key={product.id} src={product.image} alt={product.name} className="w-12 h-16 object-cover bg-white border border-black/10" />
                  ))}
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase truncate">{look.title}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/40">{formatPrice(look.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="xl:col-span-8">
        {focusProduct && (
          <div className="mb-6 bg-black text-white p-4 md:p-5 flex items-center gap-4 shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
            <img src={focusProduct.image} alt={focusProduct.name} className="w-16 h-20 object-cover bg-white" />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--accent)]">Styling anchor</p>
              <h2 className="attention-product text-2xl truncate">{focusProduct.name}</h2>
            </div>
          </div>
        )}

        <div className="mb-6 border-y border-black/10 py-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-black/35">Generated wardrobe edits</p>
            <h2 className="mt-2 font-display attention-heading text-4xl md:text-5xl uppercase leading-[0.9]">
              Recommended Looks
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-black/55 md:text-right">
            Built from live product metadata, stock status, sizing, budget, and your style direction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {recommendations.map(look => (
              <OutfitCard
                key={look.id}
                look={look}
                onAddProduct={handleAddProduct}
                onFeedback={handleFeedback}
                onSave={handleSaveLook}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function TryOnLab({ initialProduct }) {
  const [selectedProductId, setSelectedProductId] = useState(() => initialProduct?.id || PRODUCTS.find(product => !product.hidden)?.id);
  const [photoUrl, setPhotoUrl] = useState('');
  const [styledPreviewUrl, setStyledPreviewUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [uploadError, setUploadError] = useState('');
  const selectedProduct = PRODUCTS.find(product => product.id === selectedProductId);

  const renderPreview = async (imageSrc = photoUrl, product = selectedProduct, hasConsent = consent) => {
    if (!imageSrc || !product || !hasConsent) return;
    setStatus('generating');
    setStyledPreviewUrl('');
    setUploadError('');
    trackStyleEvent('tryon_started', { productId: product.id });
    try {
      const preview = await createLocalTryOnPreview(imageSrc, product.image, product.name);
      setStyledPreviewUrl(preview);
      setStatus('ready');
      trackStyleEvent('tryon_preview_ready', { productId: product.id, mode: 'local-preview' });
    } catch {
      setStatus('error');
      setUploadError('Preview failed for this image/product pair. Try another photo or item.');
    }
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    setUploadError('');
    setStatus('scanning');
    setStyledPreviewUrl('');
    const reader = new FileReader();
    reader.onload = () => {
      const nextPhotoUrl = String(reader.result || '');
      setPhotoUrl(nextPhotoUrl);
      setStatus(consent && selectedProduct ? 'generating' : 'scanned');
      if (consent && selectedProduct) {
        renderPreview(nextPhotoUrl, selectedProduct, consent);
      }
    };
    reader.onerror = () => {
      setUploadError('The image could not be read. Try a clearer image file.');
      setStatus('idle');
    };
    reader.readAsDataURL(file);
    trackStyleEvent('tryon_photo_selected', { fileType: file.type, size: file.size });
  };

  const handleProductChange = (event) => {
    const nextProductId = event.target.value;
    const nextProduct = PRODUCTS.find(product => product.id === nextProductId);
    setSelectedProductId(nextProductId);
    setStyledPreviewUrl('');
    setStatus(photoUrl && consent ? 'generating' : photoUrl ? 'scanned' : 'idle');
    if (photoUrl && consent && nextProduct) {
      renderPreview(photoUrl, nextProduct, consent);
    }
  };

  const handleConsentChange = (event) => {
    const isChecked = event.target.checked;
    setConsent(isChecked);
    if (isChecked && photoUrl && selectedProduct) {
      renderPreview(photoUrl, selectedProduct, isChecked);
    }
    if (!isChecked && status === 'ready') {
      setStatus('scanned');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      <section className="lg:col-span-4 space-y-6 lg:sticky lg:top-40 self-start">
        <div className="bg-[#f3f0ea] p-5 md:p-7 border border-black/10 shadow-[0_28px_80px_rgba(0,0,0,0.06)]">
          <div className="section-tag mb-2">Try-Before-You-Buy</div>
          <p className="mb-7 max-w-sm text-sm leading-relaxed text-black/55">
            A polished preview flow for testing virtual try-on APIs with consent, product selection, and quality controls.
          </p>
          <div className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-black/45">Upload photo</span>
            <label htmlFor="tryon-photo-upload" className="mt-3 h-52 border border-dashed border-black/20 bg-white flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-black transition-colors overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt="Selected upload preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload size={22} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">Select image</span>
                </>
              )}
            </label>
            <input id="tryon-photo-upload" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
          </div>
          {uploadError && (
            <p className="mt-3 text-xs leading-relaxed text-red-600">{uploadError}</p>
          )}

          <label className="block mt-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-black/45">23 item</span>
            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="mt-3 w-full border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black"
            >
              {PRODUCTS.filter(product => !product.hidden).map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>

          <label className="mt-5 flex gap-3 text-sm leading-relaxed text-black/65">
            <input
              type="checkbox"
              checked={consent}
              onChange={handleConsentChange}
              className="mt-1 accent-black"
            />
            <span>I consent to using this photo for a temporary AI preview. The preview may differ from real fit.</span>
          </label>

          <button
            onClick={() => renderPreview()}
            disabled={!photoUrl || !selectedProduct || !consent || status === 'generating' || status === 'scanning'}
            className="mt-6 w-full h-12 bg-black text-white disabled:bg-black/20 disabled:text-black/30 hover:bg-[var(--accent)] hover:text-black transition-colors font-mono text-[10px] uppercase tracking-[0.18em] font-bold"
          >
            {status === 'scanning' ? 'Scanning Image' : status === 'generating' ? 'Styling Outfit' : 'Generate Styled Preview'}
          </button>
        </div>

        <div className="border border-black/10 p-5 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={17} />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">Quality rules</h3>
          </div>
          <div className="space-y-3">
            {['Clear front-facing photo', 'Appropriate upload only', 'Temporary image handling', 'Human review before public sharing'].map(rule => (
              <div key={rule} className="flex items-center gap-3 text-sm text-black/65">
                <CheckCircle2 size={15} className="text-black" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lg:col-span-8 bg-black text-white min-h-[560px] p-4 md:p-6 shadow-[0_32px_100px_rgba(0,0,0,0.22)]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">
          <div className="relative bg-white/5 min-h-[420px] md:min-h-[620px] flex items-center justify-center overflow-hidden border border-white/10">
            {styledPreviewUrl ? (
              <img src={styledPreviewUrl} alt="Generated 23 try-on preview" className="w-full h-full object-contain bg-black" />
            ) : photoUrl ? (
              <>
                <img src={photoUrl} alt="Uploaded try-on subject" className="w-full h-full object-contain bg-black" />
                {(status === 'scanning' || status === 'generating') && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <div className="w-40 h-40 border border-[var(--accent)]/60 rounded-full animate-ping" />
                    <p className="absolute font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                      {status === 'scanning' ? 'Scanning' : 'Styling'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-white/35">
                <Camera size={34} className="mx-auto mb-3" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]">User photo</p>
              </div>
            )}
          </div>
          <div className="bg-white min-h-[260px] xl:min-h-[620px] flex items-center justify-center overflow-hidden">
            {selectedProduct ? (
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain" />
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-white/10 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Status</p>
            <p className="mt-2 attention-product text-2xl text-white">
              {status === 'ready'
                ? 'Styled'
                : status === 'generating'
                  ? 'Rendering'
                  : status === 'scanning'
                    ? 'Scanning'
                    : status === 'error'
                      ? 'Retry'
                      : photoUrl ? 'Ready to style' : 'Queued'}
            </p>
          </div>
          <div className="border border-white/10 p-4 md:col-span-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Selected product</p>
            <p className="mt-2 attention-product text-lg text-white">{selectedProduct?.name || 'No product selected'}</p>
            {status === 'ready' && (
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                Styled image generated. This local renderer is ready for API replacement when you connect a production virtual try-on model.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChallengesArena() {
  const [selectedChallenge, setSelectedChallenge] = useState(STYLE_CHALLENGES[0]);
  const [submissions, setSubmissions] = useState(() => getStoredSubmissions());
  const [profileName, setProfileName] = useState('23 member');
  const [submissionImage, setSubmissionImage] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  const leaderboard = useMemo(() => {
    const userRows = submissions.map(item => ({
      id: item.id,
      name: item.name,
      points: item.points + item.votes * 23,
      badge: item.challengeTitle,
    }));
    return [...STARTER_LEADERBOARD, ...userRows].sort((a, b) => b.points - a.points).slice(0, 8);
  }, [submissions]);

  const handleSubmissionImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSubmissionError('Please upload a JPG, PNG, or WebP image for the challenge.');
      return;
    }
    setSubmissionError('');
    const reader = new FileReader();
    reader.onload = () => {
      setSubmissionImage(String(reader.result || ''));
    };
    reader.onerror = () => {
      setSubmissionError('The outfit image could not be read. Try a different photo.');
    };
    reader.readAsDataURL(file);
  };

  const submitLook = () => {
    if (!submissionImage) {
      setSubmissionError('Upload an outfit photo before submitting your challenge entry.');
      return;
    }
    const nextSubmission = {
      id: `submission-${Date.now()}`,
      name: profileName || '23 member',
      image: submissionImage,
      challengeId: selectedChallenge.id,
      challengeTitle: selectedChallenge.title,
      points: selectedChallenge.points,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    const nextSubmissions = [nextSubmission, ...submissions].slice(0, 20);
    setSubmissions(nextSubmissions);
    setStoredSubmissions(nextSubmissions);
    setSubmissionImage('');
    setSubmissionError('');
    trackStyleEvent('challenge_submission', { challengeId: selectedChallenge.id });
  };

  const voteFor = (id) => {
    const nextSubmissions = submissions.map(item => (
      item.id === id ? { ...item, votes: item.votes + 1 } : item
    ));
    setSubmissions(nextSubmissions);
    setStoredSubmissions(nextSubmissions);
    trackStyleEvent('challenge_vote', { submissionId: id });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <section className="xl:col-span-8 space-y-6">
        <div className="border border-black/10 bg-[#f3f0ea] p-5 md:p-6">
          <div className="section-tag mb-3">How challenges work</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['Choose', 'Pick the challenge that matches your style direction or the current 23 drop.'],
              ['Submit', 'Upload a clear outfit photo, add your display name, then submit it to the board.'],
              ['Compete', 'Every vote adds points. Top looks rise on the leaderboard and can unlock rewards.'],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-black/10 pt-3">
                <h3 className="attention-product attention-heading text-xl text-black">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STYLE_CHALLENGES.map(challenge => (
            <button
              key={challenge.id}
              onClick={() => setSelectedChallenge(challenge)}
              className={`text-left border overflow-hidden transition-colors ${
                selectedChallenge.id === challenge.id ? 'border-black bg-black text-white' : 'border-black/10 bg-white hover:border-black'
              }`}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-60">{challenge.tag}</span>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
                    selectedChallenge.id === challenge.id ? 'text-[var(--accent)]' : 'text-black/45'
                  }`}>{challenge.points} pts</span>
                </div>
                <h3 className="mt-2 attention-product attention-heading text-2xl">{challenge.title}</h3>
                <p className="mt-2 text-sm opacity-65">{challenge.theme}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-[var(--cream)] p-5 md:p-6 border border-black/10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <div className="section-tag">Submit Fit</div>
              <h2 className="mt-2 attention-product attention-heading text-3xl">{selectedChallenge.title}</h2>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">{selectedChallenge.reward}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              className="h-12 bg-white border border-black/10 px-3 text-sm outline-none focus:border-black"
              placeholder="Name"
            />
            <label htmlFor="challenge-image-upload" className="h-12 bg-white border border-black/10 px-3 flex items-center justify-center gap-2 cursor-pointer hover:border-black font-mono text-[10px] uppercase tracking-[0.16em]">
              <Upload size={14} />
              {submissionImage ? 'Replace image' : 'Upload'}
            </label>
            <input id="challenge-image-upload" type="file" accept="image/*" onChange={handleSubmissionImage} className="sr-only" />
            <button
              onClick={submitLook}
              disabled={!submissionImage}
              className="h-12 bg-black text-white disabled:bg-black/20 disabled:text-black/35 hover:bg-[var(--accent)] hover:text-black transition-colors font-mono text-[10px] uppercase tracking-[0.16em] font-bold"
            >
              Submit
            </button>
          </div>
          {submissionError && (
            <p className="mt-3 text-xs leading-relaxed text-red-600">{submissionError}</p>
          )}

          {submissionImage && (
            <div className="mt-4 flex items-end gap-4">
              <div className="w-32 aspect-[3/4] bg-white border border-black/10 overflow-hidden">
                <img src={submissionImage} alt="Submission preview" className="w-full h-full object-cover" />
              </div>
              <p className="max-w-xs pb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">
                Preview ready. Submit to enter {selectedChallenge.title}.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {submissions.map(item => (
            <article key={item.id} className="border border-black/10 bg-white">
              <div className="aspect-[3/4] bg-black/[0.04] overflow-hidden">
                <img src={item.image} alt={`${item.name} submission`} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-bold uppercase text-sm truncate">{item.name}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">{item.challengeTitle}</p>
                <button
                  onClick={() => voteFor(item.id)}
                  className="mt-4 w-full h-9 border border-black/10 hover:border-black font-mono text-[9px] uppercase tracking-[0.14em] flex items-center justify-center gap-2"
                >
                  <Heart size={13} />
                  Vote {item.votes}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="xl:col-span-4">
        <div className="bg-black text-white p-5 md:p-6 sticky top-28">
          <div className="flex items-center gap-3 mb-6">
            <Trophy size={18} className="text-[var(--accent)]" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">Leaderboard</h3>
          </div>
          <div className="space-y-4">
            {leaderboard.map((row, index) => (
              <div key={row.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-t border-white/10 pt-3">
                <p className="font-display attention-heading text-2xl text-[var(--accent)]">{index + 1}</p>
                <div className="min-w-0">
                  <p className="font-bold uppercase truncate">{row.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">{row.badge}</p>
                </div>
                <p className="font-mono text-xs">{row.points}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function TrendPredictor({ onTrendSelect, selectedTrendId }) {
  const catalogStats = useMemo(() => getCatalogStats(PRODUCTS), []);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black text-white p-5">
          <TrendingUp className="text-[var(--accent)] mb-5" size={22} />
          <Metric label="Trend signals" value={TREND_SIGNALS.length} />
        </div>
        <div className="border border-black/10 p-5">
          <Metric label="Catalog records" value={catalogStats.products} />
        </div>
        <div className="border border-black/10 p-5">
          <Metric label="Avg price" value={`N${catalogStats.averagePrice.toLocaleString('en-NG')}`} />
        </div>
        <div className="border border-black/10 p-5">
          <Metric label="Style clusters" value={catalogStats.styles} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {TREND_SIGNALS.map(trend => (
          <button
            key={trend.id}
            onClick={() => onTrendSelect(trend.id)}
            className={`text-left border p-5 transition-colors ${
              selectedTrendId === trend.id ? 'border-black bg-black text-white' : 'border-black/10 bg-white hover:border-black'
            }`}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-50">{trend.platform}</p>
                <h3 className="mt-2 attention-product attention-heading text-3xl">{trend.name}</h3>
              </div>
              <p className={`font-display attention-heading text-3xl ${
                selectedTrendId === trend.id ? 'text-[var(--accent)]' : 'text-black/45'
              }`}>{trend.confidence}</p>
            </div>
            <div className="mt-5 h-2 bg-black/10 overflow-hidden">
              <div className="h-full bg-[var(--accent)]" style={{ width: `${trend.growth}%` }} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {trend.keywords.map(keyword => (
                <span key={keyword} className={`px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${
                  selectedTrendId === trend.id ? 'bg-white/10 text-white/55' : 'bg-black/[0.04] text-black/45'
                }`}>
                  {keyword}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed opacity-70">{trend.action}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function DesignEngine({ selectedTrendId }) {
  const selectedTrend = TREND_SIGNALS.find(trend => trend.id === selectedTrendId) || TREND_SIGNALS[0];
  const [directionId, setDirectionId] = useState(DESIGN_DIRECTIONS[0].id);
  const [concepts, setConcepts] = useState([]);
  const direction = DESIGN_DIRECTIONS.find(item => item.id === directionId) || DESIGN_DIRECTIONS[0];

  const generateConcept = () => {
    const conceptIndex = concepts.length + 1;
    const productType = direction.productTypes[(conceptIndex - 1) % direction.productTypes.length];
    const colorway = direction.palette.join(' / ');
    const concept = {
      id: `concept-${Date.now()}`,
      name: `23 ${direction.name} ${conceptIndex}`,
      productType,
      colorway,
      trend: selectedTrend.name,
      story: `${selectedTrend.name} translated into ${direction.language}.`,
      prompt: `Create a streetwear ${productType.toLowerCase()} concept for 23. It should feel bold, clean, youthful, and premium. Use ${colorway}. Reference ${selectedTrend.name}. Avoid generic clipart. Make it production-ready for a limited Lagos-born drop.`,
    };
    setConcepts([concept, ...concepts].slice(0, 6));
    trackStyleEvent('design_concept_generated', { trendId: selectedTrend.id, directionId });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <section className="xl:col-span-4 space-y-6">
        <div className="bg-[var(--cream)] p-5 md:p-6 border border-black/10">
          <div className="section-tag mb-5">AI Design Engine</div>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">Design direction</span>
            <select
              value={directionId}
              onChange={(event) => setDirectionId(event.target.value)}
              className="mt-3 w-full border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black"
            >
              {DESIGN_DIRECTIONS.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <div className="mt-5 border-t border-black/10 pt-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/45">Trend input</p>
            <h3 className="mt-2 attention-product attention-heading text-3xl">{selectedTrend.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-black/60">{selectedTrend.action}</p>
          </div>

          <button
            onClick={generateConcept}
            className="mt-6 w-full h-12 bg-black text-white hover:bg-[var(--accent)] hover:text-black transition-colors font-mono text-[10px] uppercase tracking-[0.16em] font-bold flex items-center justify-center gap-2"
          >
            <Wand2 size={15} />
            Generate Concept
          </button>
        </div>

        <div className="border border-black/10 p-5">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50 mb-4">Human curation</h3>
          <div className="space-y-3">
            {CURATION_CHECKLIST.map(item => (
              <div key={item} className="flex gap-3 text-sm text-black/65">
                <Check size={14} className="mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="xl:col-span-8">
        {concepts.length === 0 ? (
          <div className="min-h-[520px] bg-black text-white flex items-center justify-center text-center p-6">
            <div>
              <Wand2 size={34} className="mx-auto mb-4 text-[var(--accent)]" />
              <h2 className="font-display attention-heading text-attention-outline text-black text-4xl md:text-6xl uppercase">Design Queue</h2>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                Trend selected: {selectedTrend.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {concepts.map(concept => (
              <article key={concept.id} className="border border-black/10 bg-white">
                <div className="aspect-[4/3] bg-black text-white p-5 flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10 font-display attention-heading text-[10rem] leading-none select-none">23</div>
                  <div className="relative z-10">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--accent)]">{concept.productType}</p>
                    <h3 className="mt-2 attention-product attention-heading text-4xl">{concept.name}</h3>
                  </div>
                  <p className="relative z-10 font-mono text-[9px] uppercase tracking-[0.16em] text-white/55">{concept.colorway}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-black/65">{concept.story}</p>
                  <div className="mt-4 bg-black/[0.03] p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/40 mb-2">Prompt</p>
                    <p className="text-xs leading-relaxed text-black/60">{concept.prompt}</p>
                  </div>
                  <button
                    onClick={() => trackStyleEvent('design_concept_saved', { conceptId: concept.id })}
                    className="mt-4 h-10 w-full border border-black/10 hover:border-black font-mono text-[9px] uppercase tracking-[0.14em] flex items-center justify-center gap-2"
                  >
                    <Bookmark size={13} />
                    Mark for curation
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AIStudio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || (searchParams.get('tryOn') ? 'tryon' : 'stylist');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [answers, setAnswers] = useState(() => ({ ...DEFAULT_ANSWERS, ...(loadStylePreferences() || {}) }));
  const [selectedTrendId, setSelectedTrendId] = useState(TREND_SIGNALS[0].id);
  const focusProductId = searchParams.get('style');
  const tryOnProductId = searchParams.get('tryOn');
  const focusProduct = PRODUCTS.find(product => product.id === focusProductId);
  const tryOnProduct = PRODUCTS.find(product => product.id === tryOnProductId) || focusProduct;
  const heroProduct = focusProduct || PRODUCTS.find(product => product.id === 'top-xxiii-black') || PRODUCTS[0];
  const heroColors = heroProduct ? inferColorTags(heroProduct).join(' / ') : 'black';
  const heroStyles = heroProduct ? inferStyleTags(heroProduct).slice(0, 3).join(' / ') : 'streetwear';
  const heroCategory = heroProduct ? inferFunctionalCategory(heroProduct) : 'tops';

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tabId);
    setSearchParams(nextParams);
    window.requestAnimationFrame(() => {
      document.getElementById('ai-studio-workbench')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <section className="relative min-h-[560px] md:min-h-[620px] lg:min-h-[660px] bg-black text-white overflow-hidden flex items-end">
          <img
            src="/lookbook/JF-8.JPG"
            alt="23 AI Studio"
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(255,255,255,0.1),transparent_24%),linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.52)_48%,rgba(0,0,0,0.8))]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
          <div className="absolute right-4 top-10 hidden lg:block font-display attention-heading text-[18rem] leading-none text-white/[0.035] select-none">
            23
          </div>
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 md:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
              <div className="lg:col-span-7">
                <div className="section-tag dark mb-5 text-white/70">Atelier Intelligence</div>
                <h1 className="font-display attention-heading text-attention-outline text-black uppercase leading-[0.88] max-w-[9ch]" style={{ fontSize: 'clamp(4rem, 9vw, 9rem)' }}>
                  23<br />AI Studio
                </h1>
                <p className="mt-6 max-w-2xl text-white/70 text-base md:text-lg leading-relaxed">
                  A luxury styling system for product discovery, visual try-on, cultural challenges, trend signals, and drop concepts.
                </p>
                <div className="mt-8 grid grid-cols-3 max-w-xl border-y border-white/15 divide-x divide-white/15">
                  {[
                    ['048', 'Catalog items'],
                    ['005', 'AI modules'],
                    ['023', 'Culture code'],
                  ].map(([value, label]) => (
                    <div key={label} className="py-4 pr-4">
                      <p className="font-display attention-heading text-3xl md:text-4xl leading-[0.9] text-[var(--accent)]">{value}</p>
                      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.18em] text-white/45">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white text-black p-4 md:p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-[112px_1fr] md:grid-cols-[140px_1fr] gap-5">
                    <img src={heroProduct.image} alt={heroProduct.name} className="w-full aspect-[3/4] object-contain bg-[#f7f7f5] flex-shrink-0" />
                  <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-black/35">Catalog signal</p>
                      <h2 className="mt-2 attention-product text-3xl md:text-4xl line-clamp-2">{heroProduct.name}</h2>
                      <div className="mt-5 grid grid-cols-1 gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-black/45">
                        <p className="border-t border-black/10 pt-2">{heroCategory}</p>
                        <p className="border-t border-black/10 pt-2">{heroColors}</p>
                        <p className="border-t border-black/10 pt-2">{heroStyles}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/10 pt-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-black/35">Stylist ready</p>
                    <Link to={`/ai-studio?style=${heroProduct.id}`} className="font-mono text-[9px] uppercase tracking-[0.18em] border-b border-black hover:text-black/50">
                      Style item
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-[76px] lg:top-[82px] z-30 bg-white/95 backdrop-blur-xl border-b border-black/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <TabButton key={tab.id} tab={tab} activeTab={activeTab} onClick={handleTabChange} />
            ))}
          </div>
        </section>

        <ModuleGuide activeTab={activeTab} />

        <section id="ai-studio-workbench" className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14 scroll-mt-32">
          {activeTab === 'stylist' && (
            <StylistExperience focusProduct={focusProduct} answers={answers} setAnswers={setAnswers} />
          )}
          {activeTab === 'tryon' && (
            <TryOnLab key={tryOnProduct?.id || 'default-tryon'} initialProduct={tryOnProduct} />
          )}
          {activeTab === 'challenges' && (
            <ChallengesArena />
          )}
          {activeTab === 'trends' && (
            <TrendPredictor onTrendSelect={setSelectedTrendId} selectedTrendId={selectedTrendId} />
          )}
          {activeTab === 'designs' && (
            <DesignEngine selectedTrendId={selectedTrendId} />
          )}
        </section>

        <section className="bg-black text-white py-16">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/shop" className="border border-white/10 p-6 hover:border-[var(--accent)] transition-colors group">
              <ShoppingBag className="text-[var(--accent)] mb-6" />
              <h3 className="attention-product attention-heading text-3xl">Shop Catalog</h3>
              <p className="mt-3 text-sm text-white/50">Browse every piece the stylist can recommend.</p>
            </Link>
            <Link to="/outfit-generator" className="border border-white/10 p-6 hover:border-[var(--accent)] transition-colors group">
              <Eye className="text-[var(--accent)] mb-6" />
              <h3 className="attention-product attention-heading text-3xl">Daily Outfit</h3>
              <p className="mt-3 text-sm text-white/50">Generate a daily look from the current wardrobe.</p>
            </Link>
            <Link to="/identity-forge" className="border border-white/10 p-6 hover:border-[var(--accent)] transition-colors group">
              <Sparkles className="text-[var(--accent)] mb-6" />
              <h3 className="attention-product attention-heading text-3xl">Identity Forge</h3>
              <p className="mt-3 text-sm text-white/50">Attach a custom digital signature to a 23 order.</p>
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
