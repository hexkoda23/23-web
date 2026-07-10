import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { askGroq } from '../lib/ai';
import { PRODUCTS } from '../data/products';
import { inferColorTags, inferFunctionalCategory, inferStyleTags } from '../lib/styleEngine';

const WHATSAPP_URL = 'https://wa.me/2348107869063';
const INSTAGRAM_URL = 'https://www.instagram.com/twentythreepreppy?igsh=MXZnY3MybjY1MXVvbA==';

// Matches external URLs (without trailing punctuation), internal product /
// shop routes, and the brand IG handle so every reference renders clickable.
const LINK_PATTERN = /(https?:\/\/[^\s]*[^\s.,!?)]|\/product\/[a-zA-Z0-9-]+|\/(?:shop|ai-studio|lookbook|outfit-generator)\b|@twentythreepreppy)/g;

const KNOWLEDGE_MODULES = import.meta.glob('../data/knowledge/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const BRAND_FACTS = {
  payment: [
    'Bank: OPay',
    'Account Number: 9034212617',
    'Account Name: Adeleke Kehinde Boluwatife',
    'After payment, send your receipt and delivery address to WhatsApp: https://wa.me/2348107869063 or Instagram: @twentythreepreppy.',
  ].join('\n'),
  contact: 'Email: twentythreepreppy@gmail.com. Instagram: @twentythreepreppy. WhatsApp: https://wa.me/2348107869063 (08107869063).',
  shipping: '23 ships worldwide with tracked delivery. Estimated delivery: Nigeria 1-3 business days, Africa 3-7 business days, international 5-10 business days.',
  owner: '23 is owned by Adeleke Kehinde Boluwatife. The brand manager is Ashibogwu Chukwudi Hilary.',
  policies: 'Returns are accepted within 7 days when the item is unworn, in original condition, and still has tags attached. Exchanges depend on available stock. Customized items are final sale.',
  customization: 'Selected 23 pieces can be personalized through Identity Forge. Customers can start from the product page or DM @twentythreepreppy for studio help.',
  about: '23 is a Lagos-based fashion house building premium preppy-meets-streetwear pieces with clean silhouettes, strong identity, and limited-drop energy.',
  pricing: 'General price guide: caps and some accessories start around NGN 12,000-NGN 25,000; classic tees are usually NGN 20,000-NGN 30,000; premium denim and sets are usually NGN 45,000-NGN 50,000. For exact pricing, ask for the product name.',
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'does',
  'for', 'from', 'give', 'has', 'have', 'how', 'i', 'in', 'is', 'it', 'me',
  'much', 'my', 'of', 'on', 'or', 'our', 'please', 'show', 'that', 'the', 'this',
  'to', 'us', 'we', 'what', 'when', 'where', 'who', 'with', 'you', 'your',
]);

const GENERIC_PRODUCT_TERMS = new Set([
  'available', 'buy', 'cost', 'details', 'item', 'much', 'order', 'pay',
  'payment', 'piece', 'price', 'product', 'purchase', 'size', 'sizes', 'stock',
]);

const PRODUCT_CATEGORY_ALIASES = {
  cap: ['accessories', 'cap'],
  hat: ['accessories', 'cap', 'beanie'],
  beanie: ['accessories', 'beanie'],
  sunglasses: ['accessories', 'sunglasses'],
  glasses: ['accessories', 'sunglasses'],
  scarf: ['accessories', 'scarf'],
  bag: ['accessories', 'bag', 'sacoche'],
  shoe: ['shoes', 'shoe'],
  shoes: ['shoes', 'shoe'],
  shirt: ['tops', 'top', 'tee', 'tshirt'],
  tee: ['tops', 'tee', 'tshirt'],
  tshirt: ['tops', 'tee', 'tshirt'],
  top: ['tops', 'top', 'tee'],
  denim: ['bottoms', 'denim', 'jean', 'short'],
  jeans: ['bottoms', 'denim', 'jean'],
  short: ['bottoms', 'short'],
  shorts: ['bottoms', 'short'],
  pants: ['bottoms', 'pant', 'trouser'],
  tracksuit: ['fullfit', 'set', 'track'],
  set: ['fullfit', 'set'],
  sweats: ['fullfit', 'sweat'],
};

const INTENT_TERMS = {
  payment: ['pay', 'payment', 'opay', 'bank', 'account', 'transfer', 'receipt', 'buy', 'order', 'purchase', 'checkout', 'name', 'number'],
  contact: ['contact', 'whatsapp', 'phone', 'email', 'instagram', 'dm', 'message', 'reach'],
  shipping: ['shipping', 'ship', 'delivery', 'deliver', 'track', 'arrive', 'eta', 'days', 'location'],
  policy: ['return', 'refund', 'exchange', 'policy', 'policies', 'final', 'sale', 'cancel'],
  owner: ['owner', 'founder', 'owns', 'created', 'ceo', 'manager', 'boss'],
  customization: ['custom', 'customize', 'personalize', 'identity', 'forge', 'bespoke', 'name', 'design'],
  price: ['price', 'cost', 'amount', 'how much', 'expensive', 'cheap', 'budget', 'naira', 'ngn'],
  product: ['available', 'stock', 'size', 'sizes', 'shirt', 'tee', 'cap', 'denim', 'short', 'pants', 'tracksuit', 'set', 'shoe', 'scarf', 'bag', 'sunglasses', 'beanie'],
  care: ['wash', 'clean', 'care', 'stain', 'iron', 'dry', 'cotton', 'wool', 'leather', 'silk', 'denim'],
  style: ['style', 'wear', 'pair', 'outfit', 'fit', 'recommend', 'match', 'occasion', 'vibe', 'look'],
  trend: ['trend', 'trending', 'fashion', 'latest', 'modern', 'popular'],
  about: ['about', 'brand', 'meaning', 'story', 'history', '23', 'twentythree', 'twenty', 'three'],
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bxxiii\b/g, ' 23 ')
    .replace(/\btwenty\s*three\b/g, ' 23 ')
    .replace(/\bnaira\b/g, ' ngn ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(term => term.length > 1 && !STOP_WORDS.has(term));
}

function formatMoney(value) {
  return `NGN ${Number(value || 0).toLocaleString('en-NG')}`;
}

function detectIntent(query, history = []) {
  const normalized = normalizeText(query);
  const historyText = normalizeText(history.slice(-4).map(item => item.content).join(' '));

  if (/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)$/.test(normalized)) {
    return 'greeting';
  }

  if (/^(ok|okay|thanks|thank you|cool)$/.test(normalized)) {
    return 'thanks';
  }

  if (/^(name|account name|acct name)$/.test(normalized) && /(opay|payment|bank|account)/.test(historyText)) {
    return 'payment_name';
  }

  if (/^(number|account number|acct number)$/.test(normalized) && /(opay|payment|bank|account)/.test(historyText)) {
    return 'payment_number';
  }

  // "What's the best fit to buy", "recommend me something", "what should I
  // wear" — styling questions beat the generic buy/payment keywords.
  if (
    /(best|recommend|suggest|top|hottest|what should i)/.test(normalized) &&
    /(fit|fits|outfit|look|piece|style|buy|wear|drip|get|cop)/.test(normalized)
  ) {
    return 'style';
  }

  const scores = Object.entries(INTENT_TERMS).map(([intent, terms]) => {
    const score = terms.reduce((sum, term) => (
      normalized.includes(normalizeText(term)) ? sum + (term.includes(' ') ? 3 : 1) : sum
    ), 0);
    return [intent, score];
  }).sort((a, b) => b[1] - a[1]);

  return scores[0]?.[1] > 0 ? scores[0][0] : 'general';
}

function parseKnowledgeFiles() {
  const content = Object.values(KNOWLEDGE_MODULES).map(text => String(text)).join('\n');
  const rawLines = content.split(/\r?\n/);
  const docs = [];
  let currentQuestion = null;
  let currentAnswer = [];

  const pushQA = () => {
    if (currentQuestion && currentAnswer.length) {
      docs.push(createKnowledgeDoc(currentQuestion, currentAnswer.join(' ').trim()));
    }
    currentQuestion = null;
    currentAnswer = [];
  };

  for (let i = 0; i < rawLines.length; i += 1) {
    const line = rawLines[i].trim();
    if (!line) {
      pushQA();
      continue;
    }

    const question = line.match(/^Q:\s*(.+)$/i);
    if (question) {
      pushQA();
      currentQuestion = question[1].trim();
      continue;
    }

    const answer = line.match(/^A:\s*(.+)$/i);
    if (answer) {
      currentAnswer.push(answer[1].trim());
      continue;
    }

    const heading = line.match(/^([A-Za-z0-9][^:]{1,80}):\s*$/);
    if (heading) {
      pushQA();
      const block = [];
      let j = i + 1;
      while (j < rawLines.length) {
        const nextLine = rawLines[j].trim();
        if (!nextLine || /^Q:\s*/i.test(nextLine) || /^A:\s*/i.test(nextLine) || /^([A-Za-z0-9][^:]{1,80}):\s*$/.test(nextLine)) break;
        block.push(nextLine);
        j += 1;
      }
      if (block.length) docs.push(createKnowledgeDoc(heading[1].trim(), block.join(' ')));
      i = j - 1;
      continue;
    }

    if (currentQuestion) {
      currentAnswer.push(line);
      continue;
    }

    const keyValue = line.match(/^(.+?):\s*(.+)$/);
    if (keyValue && !line.startsWith('http')) {
      docs.push(createKnowledgeDoc(keyValue[1].trim(), keyValue[2].trim()));
    }
  }

  pushQA();
  return docs;
}

function inferDocIntent(text) {
  const normalized = normalizeText(text);
  const best = Object.entries(INTENT_TERMS).map(([intent, terms]) => [
    intent,
    terms.reduce((score, term) => (normalized.includes(normalizeText(term)) ? score + 1 : score), 0),
  ]).sort((a, b) => b[1] - a[1])[0];
  return best?.[1] > 0 ? best[0] : 'general';
}

function createKnowledgeDoc(title, answer) {
  const text = `${title} ${answer}`;
  return {
    id: `kb-${normalizeText(title).slice(0, 48)}`,
    type: 'knowledge',
    intent: inferDocIntent(text),
    title,
    answer,
    text,
    keywords: tokenize(text),
  };
}

function createFactDocs() {
  return [
    ['payment', 'Payment details', BRAND_FACTS.payment],
    ['contact', 'Contact 23', BRAND_FACTS.contact],
    ['shipping', 'Shipping and delivery', BRAND_FACTS.shipping],
    ['owner', 'Owner and brand manager', BRAND_FACTS.owner],
    ['policy', 'Returns, exchanges, and policies', BRAND_FACTS.policies],
    ['customization', 'Customization and Identity Forge', BRAND_FACTS.customization],
    ['about', 'About 23', BRAND_FACTS.about],
    ['price', 'Price guide', BRAND_FACTS.pricing],
  ].map(([intent, title, answer]) => ({
    id: `fact-${intent}`,
    type: 'fact',
    intent,
    title,
    answer,
    text: `${title} ${answer}`,
    keywords: tokenize(`${title} ${answer}`),
  }));
}

function createProductDocs() {
  return PRODUCTS
    .filter(product => !product.hidden)
    .map(product => {
      const category = inferFunctionalCategory(product);
      const colors = inferColorTags(product);
      const styles = inferStyleTags(product);
      const sizes = product.sizes?.join(', ') || 'Ask for size availability';
      const status = product.inStock ? 'in stock' : product.comingSoon ? 'coming soon' : 'sold out';
      const text = [
        product.id,
        product.name,
        product.category,
        category,
        product.variantGroup,
        product.description,
        product.writeUp,
        colors.join(' '),
        styles.join(' '),
        sizes,
        status,
        formatMoney(product.price),
      ].filter(Boolean).join(' ');

      return {
        id: `product-${product.id}`,
        type: 'product',
        intent: 'product',
        product,
        title: product.name,
        answer: `${product.name} costs ${formatMoney(product.price)}. Category: ${category}. Sizes: ${sizes}. Status: ${status}. ${product.description || ''}`.trim(),
        text,
        keywords: tokenize(text),
        category,
        colors,
        styles,
        sizes,
        status,
      };
    });
}

const BASE_DOCS = [
  ...createFactDocs(),
  ...parseKnowledgeFiles(),
  ...createProductDocs(),
];

function scoreDocument(doc, query, terms, intent) {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(doc.title);
  const normalizedText = normalizeText(doc.text);
  const words = new Set(normalizedText.split(/\s+/));
  const titleWords = new Set(normalizedTitle.split(/\s+/));
  let score = 0;

  if (normalizedQuery.length > 2 && normalizedTitle.includes(normalizedQuery)) score += 75;
  if (normalizedQuery.length > 2 && normalizedText.includes(normalizedQuery)) score += 35;
  if (doc.intent === intent) score += 18;
  if ((intent === 'price' || intent === 'product') && doc.type === 'product') score += 12;
  if ((intent === 'style' || intent === 'care') && doc.type === 'knowledge') score += 6;

  terms.forEach(term => {
    if (titleWords.has(term)) score += 14;
    if (doc.keywords.includes(term)) score += 9;
    if (words.has(term)) score += 6;
    if (normalizedTitle.includes(term)) score += 4;
    if (normalizedText.includes(term)) score += 2;
  });

  if (doc.type === 'product') {
    const productName = normalizeText(doc.product.name);
    const category = normalizeText(doc.category);
    if (terms.some(term => productName.includes(term))) score += 12;
    if (terms.some(term => category.includes(term))) score += 10;
  }

  return score;
}

function getRankedDocs(query, intent, limit = 8) {
  const terms = tokenize(query);
  if (!terms.length && intent !== 'greeting' && intent !== 'thanks') return [];

  return BASE_DOCS
    .map(doc => ({ ...doc, score: scoreDocument(doc, query, terms, intent) }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getFocusedProductDocs(query, rankedDocs) {
  const terms = tokenize(query).filter(term => !GENERIC_PRODUCT_TERMS.has(term));
  if (!terms.length) return [];

  return rankedDocs.filter(doc => {
    if (doc.type !== 'product') return false;

    const productFocusText = normalizeText([
      doc.product.id,
      doc.product.name,
      doc.product.category,
      doc.product.variantGroup,
      doc.category,
      doc.colors?.join(' '),
      doc.styles?.join(' '),
    ].filter(Boolean).join(' '));

    const focusWords = new Set(productFocusText.split(/\s+/));
    return terms.some(term => {
      if (focusWords.has(term) || productFocusText.includes(term)) return true;
      const aliases = PRODUCT_CATEGORY_ALIASES[term] || [];
      return aliases.some(alias => productFocusText.includes(normalizeText(alias)));
    });
  });
}

function formatProductDetails(productDocs, limit = 3) {
  return productDocs.slice(0, limit).map((doc, index) => {
    const product = doc.product;
    const sizes = product.sizes?.join(', ') || 'Ask for size availability';
    const status = product.inStock ? 'in stock' : product.comingSoon ? 'coming soon' : 'sold out';
    return `${index + 1}. ${product.name} - ${formatMoney(product.price)}. Sizes: ${sizes}. Status: ${status}. ${product.description || ''} View: /product/${product.id}`;
  }).join('\n');
}

function bestDocAnswer(rankedDocs, intent) {
  return rankedDocs.find(doc => doc.intent === intent)?.answer || rankedDocs[0]?.answer || null;
}

function buildStyleAnswer(productDocs) {
  const pool = productDocs.length
    ? productDocs
    : BASE_DOCS.filter(doc => doc.type === 'product' && doc.product.inStock && doc.category !== 'accessories');

  // Diversify the picks across categories so a "best fit" answer reads like
  // an outfit, not three of the same tee.
  const picks = [];
  const seenCategories = new Set();
  for (const doc of pool) {
    if (picks.length >= 3) break;
    if (seenCategories.has(doc.category) && pool.length > 3) continue;
    seenCategories.add(doc.category);
    picks.push(doc);
  }
  for (const doc of pool) {
    if (picks.length >= 3) break;
    if (!picks.includes(doc)) picks.push(doc);
  }

  if (!picks.length) return null;

  const lines = picks.map((doc, index) => (
    `${index + 1}. ${doc.product.name} — ${formatMoney(doc.product.price)} · /product/${doc.product.id}`
  )).join('\n');

  return `Here are the strongest fits to buy right now:\n\n${lines}\n\nTap any link to open the piece. Want a full look built around one? Try the stylist at /ai-studio, or message us on WhatsApp: ${WHATSAPP_URL}`;
}

function buildDirectAnswer(query, intent, rankedDocs, history) {
  const normalized = normalizeText(query);
  const focusedProductDocs = getFocusedProductDocs(query, rankedDocs);
  const highConfidenceProductDocs = rankedDocs.filter(doc => doc.type === 'product' && doc.score >= 42);
  const productDocs = focusedProductDocs.length ? focusedProductDocs : highConfidenceProductDocs;

  if (intent === 'greeting') {
    return "Hey. I'm 23, your fashion assistant. Ask me about products, prices, sizing, styling, shipping, payment, or the story behind the brand.";
  }

  if (intent === 'thanks') {
    return 'You are welcome. I am here whenever you want to style the next piece.';
  }

  if (intent === 'payment_name') return 'Account Name: Adeleke Kehinde Boluwatife.';
  if (intent === 'payment_number') return 'Account Number: 9034212617.';

  if (intent === 'payment') {
    const productLine = focusedProductDocs.length ? `\n\nSelected item context:\n${formatProductDetails(focusedProductDocs, 2)}` : '';
    return `${BRAND_FACTS.payment}${productLine}`;
  }

  if (intent === 'contact') return BRAND_FACTS.contact;
  if (intent === 'shipping') return BRAND_FACTS.shipping;
  if (intent === 'owner') return BRAND_FACTS.owner;
  if (intent === 'policy') return BRAND_FACTS.policies;
  if (intent === 'customization') return BRAND_FACTS.customization;

  if (intent === 'price') {
    return productDocs.length ? formatProductDetails(productDocs, 3) : BRAND_FACTS.pricing;
  }

  if (intent === 'product' && productDocs.length) {
    return formatProductDetails(productDocs, 3);
  }

  if (intent === 'care') {
    return bestDocAnswer(rankedDocs, 'care');
  }

  if (intent === 'style') {
    return buildStyleAnswer(productDocs);
  }

  if (intent === 'trend') {
    return bestDocAnswer(rankedDocs, 'trend') || 'For 23, the strongest direction is elevated streetwear: clean silhouettes, textured monochrome, premium denim, structured caps, and one bold statement detail.';
  }

  if (intent === 'about' && /(what is 23|about 23|meaning|brand|story|history)/.test(normalized)) {
    return BRAND_FACTS.about;
  }

  const recentPaymentContext = normalizeText(history.slice(-4).map(item => item.content).join(' '));
  if ((normalized === 'name' || normalized === 'number') && /(opay|payment|bank|account)/.test(recentPaymentContext)) {
    return normalized === 'name' ? 'Account Name: Adeleke Kehinde Boluwatife.' : 'Account Number: 9034212617.';
  }

  return null;
}

function buildFallbackAnswer(rankedDocs) {
  if (!rankedDocs.length || rankedDocs[0].score < 10) {
    return `I do not have a confirmed answer for that yet. For the most accurate help, message the studio on Instagram @twentythreepreppy or WhatsApp: ${WHATSAPP_URL}`;
  }

  const productDocs = rankedDocs.filter(doc => doc.type === 'product');
  if (productDocs.length && productDocs[0].score >= 16) {
    return formatProductDetails(productDocs, 3);
  }

  return rankedDocs[0].answer;
}

function formatContextForAI(rankedDocs) {
  return rankedDocs.slice(0, 8).map(doc => {
    if (doc.type === 'product') {
      return [
        `TYPE: Product`,
        `NAME: ${doc.product.name}`,
        `PRICE: ${formatMoney(doc.product.price)}`,
        `CATEGORY: ${doc.category}`,
        `SIZES: ${doc.product.sizes?.join(', ') || 'Ask for availability'}`,
        `STATUS: ${doc.status}`,
        `URL: /product/${doc.product.id}`,
        `DETAILS: ${doc.product.description || ''}`,
      ].join('\n');
    }
    return [`TYPE: ${doc.type}`, `TITLE: ${doc.title}`, `ANSWER: ${doc.answer}`].join('\n');
  }).join('\n\n---\n\n');
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello. I'm 23, your personal fashion assistant. Ask me about our products, styling, shipping, payment, or clothing care." },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Turn every URL / route / handle in a bot message into a real link:
  // internal product links navigate the app (and close the chat), external
  // links open in a new tab.
  const renderMessageContent = (content) => {
    const parts = String(content).split(LINK_PATTERN);
    return parts.map((part, index) => {
      if (!part) return null;
      if (/^https?:\/\//.test(part)) {
        const label = part.includes('wa.me')
          ? 'WhatsApp ↗'
          : part.includes('instagram')
            ? 'Instagram ↗'
            : part;
        return (
          <a key={index} href={part} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2 hover:text-black/60 break-all">
            {label}
          </a>
        );
      }
      if (part === '@twentythreepreppy') {
        return (
          <a key={index} href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2 hover:text-black/60">
            @twentythreepreppy
          </a>
        );
      }
      if (part.startsWith('/product/')) {
        const product = PRODUCTS.find(item => `/product/${item.id}` === part);
        return (
          <Link key={index} to={part} onClick={() => setIsOpen(false)} className="font-bold underline underline-offset-2 hover:text-black/60">
            {product ? `Shop ${product.name} ↗` : 'View piece ↗'}
          </Link>
        );
      }
      if (/^\/(shop|ai-studio|lookbook|outfit-generator)$/.test(part)) {
        const labels = { '/shop': 'the Shop', '/ai-studio': 'the AI Studio', '/lookbook': 'the Lookbook', '/outfit-generator': 'the Outfit Generator' };
        return (
          <Link key={index} to={part} onClick={() => setIsOpen(false)} className="font-bold underline underline-offset-2 hover:text-black/60">
            {labels[part]} ↗
          </Link>
        );
      }
      return part;
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const intent = detectIntent(userMessage, messages);
    const rankedDocs = getRankedDocs(userMessage, intent);
    const directAnswer = buildDirectAnswer(userMessage, intent, rankedDocs, messages);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    try {
      let response = directAnswer;

      if (!response) {
        const hasGroq = Boolean(import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_KEY);
        if (hasGroq && rankedDocs.length) {
          try {
            response = await askGroq(userMessage, formatContextForAI(rankedDocs), messages);
          } catch (error) {
            console.warn('AI bridge failed, using local RAG fallback:', error);
          }
        }
      }

      if (!response) {
        response = buildFallbackAnswer(rankedDocs);
      }

      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 flex items-center justify-center group/chat overflow-hidden ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open 23 chat"
      >
        <div className="absolute inset-0 bg-[var(--accent)] translate-y-full group-hover/chat:translate-y-0 transition-transform duration-500" />
        <div className="relative z-10 brand-wordmark text-lg group-hover/chat:text-black transition-colors duration-500">
          23
        </div>
        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[var(--accent)] rounded-full group-hover/chat:bg-black transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-8 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] bg-white z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center border border-white/30">
                  <span className="font-bold text-sm">23</span>
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-sm">23 Chat</h3>
                  <p className="text-[10px] text-gray-300 uppercase tracking-wider">Fashion Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition-colors" aria-label="Close chat">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-line p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-black text-white rounded-tr-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                      }`}
                  >
                    {msg.role === 'bot' ? renderMessageContent(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-400 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-xs">
                    23 is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask about fashion, 23, or style..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
