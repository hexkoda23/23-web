import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { askGroq } from '../lib/ai';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm 23, your personal fashion assistant. Ask me anything about our brand, style advice, or clothing care." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [kbQA, setKbQA] = useState([]);
  const messagesEndRef = useRef(null);

  // Load Knowledge Base
  useEffect(() => {
    const loadKnowledge = async () => {
      try {
        // Simple fallback if glob fails
        setKnowledgeBase([
          "23 is a luxury fashion brand founded in Lagos.",
          "We offer worldwide shipping.",
          "Ask me about payments (OPay), policies, owner, customization, or trends.",
          " "
        ]);

        // Attempt to load from files
        try {
          const modules = import.meta.glob('../data/knowledge/*.txt', { as: 'raw', eager: true });
          const texts = Object.values(modules).map(t => String(t));
          const content = texts.join('\n');
          const rawLines = content.split('\n');
          const qa = [];
          let currentQ = null;
          let currentA = [];
          const pushQA = () => {
            if (currentQ && currentA.length) {
              qa.push({ q: currentQ, a: currentA.join(' ').trim() });
            }
            currentQ = null;
            currentA = [];
          };
          for (let i = 0; i < rawLines.length; i++) {
            const orig = rawLines[i];
            const line = orig.trim();
            const qmMatch = line.match(/^(.+\\?)$/); // Treat lines ending with ? as questions
            if (qmMatch && !line.startsWith('A:')) {
              pushQA();
              currentQ = qmMatch[1].replace(/\?+$/, '').trim();
              continue;
            }
            const qMatch = line.match(/^Q:\s*(.+)$/i);
            if (qMatch) { pushQA(); currentQ = qMatch[1].trim(); continue; }
            const aMatch = line.match(/^A:\s*(.+)$/i);
            if (aMatch) { currentA.push(aMatch[1].trim()); continue; }
            if (currentQ) {
              if (line.length === 0) { pushQA(); continue; }
              currentA.push(line);
              continue;
            }
            const headingMatch = line.match(/^([A-Za-z0-9].*?):\s*$/);
            if (headingMatch) {
              let block = [];
              let j = i + 1;
              while (j < rawLines.length) {
                const look = rawLines[j].trim();
                if (look.match(/^Q:\s*/i) || look.match(/^A:\s*/i) || look.match(/^([A-Za-z0-9].*?):\s*$/)) break;
                block.push(look);
                j++;
              }
              i = j - 1;
              const ans = block.join(' ').trim();
              if (ans.length) qa.push({ q: headingMatch[1].trim(), a: ans });
              continue;
            }
            const kv = line.match(/^(.+?):\s*(.+)$/);
            if (kv && !line.startsWith('http')) {
              qa.push({ q: kv[1].trim(), a: kv[2].trim() });
            }
          }
          pushQA();
          const flatLines = rawLines.map(l => l.trim()).filter(l => l.length > 0);
          if (qa.length > 0) setKbQA(qa);
          if (flatLines.length > 0) setKnowledgeBase(flatLines);
        } catch (e) {
          console.warn("Could not load knowledge files:", e);
        }
      } catch (error) {
        console.error("Failed to load knowledge base:", error);
      }
    };

    loadKnowledge();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findBestMatch = (query) => {
    const hasKB = knowledgeBase.length > 0 || kbQA.length > 0;
    if (!hasKB) return null;

    const clean = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const STOP_WORDS = new Set(['to', 'if', 'or', 'and', 'the', 'is', 'it', 'for', 'in', 'on', 'at', 'by', 'this', 'that', 'with', 'from', 'my', 'how', 'what', 'where', 'who', 'does', 'do', 'can', 'take', 'has', 'am']);
    const terms = clean.split(/\s+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));
    if (!terms.length) return null;

    const intentSynonyms = {
      payment: ['pay', 'payment', 'opay', 'account', 'transfer', 'number', 'bank', 'cash', 'money'],
      owner: ['owner', 'founder', 'who', 'created', 'owns', 'ceo', 'boss'],
      contact: ['contact', 'reach', 'whatsapp', 'phone', 'email', 'instagram', 'twitter', 'dm', 'message'],
      customize: ['custom', 'customize', 'personalize', 'design', 'collection', 'bespoke', 'tailor'],
      trend: ['trend', 'trending', 'vogue', 'fashion', 'latest', 'new', 'upcoming'],
      brand: ['what', 'is', 'about', 'brand', '23', 'meaning', 'identity', 'story', 'history'],
      policies: ['policy', 'policies', 'rules', 'terms', 'shipping', 'returns', 'refund', 'exchange'],
      shipping: ['delivery', 'ship', 'shipping', 'time', 'days', 'eta', 'long', 'arrives', 'when', 'track'],
      price: ['cost', 'price', 'how much', 'expensive', 'cheap', 'budget'],
      greeting: ['hi', 'hello', 'hey', 'yo', 'sup', 'howfar', 'wassup', 'morning', 'afternoon', 'evening'],
      howareyou: ['how are', 'doing', 'good', 'well', 'what\'s up']
    };

    const intentScores = {};
    Object.keys(intentSynonyms).forEach(k => {
      intentScores[k] = terms.reduce((s, t) => s + (intentSynonyms[k].some(x => x.includes(t) || t.includes(x)) ? 1 : 0), 0);
    });
    const sortedIntents = Object.entries(intentScores).sort((a, b) => b[1] - a[1]);
    const topIntent = sortedIntents[0][1] > 0 ? sortedIntents[0] : null;

    // Hardcoded highly intelligent generic responses based on pure intent if no deep match
    const genericIntentResponses = {
      greeting: "Hello there! I'm 23. What can I help you discover today?",
      howareyou: "I'm doing beautifully, thank you for asking! I'm here to help you upgrade your aesthetic. What are you looking for?",
      price: "Our pieces are premium but accessibly priced for the value of Lagos craftsmanship. Most tees and caps start around ₦25,000, while our exclusive sets hover around ₦50,000.",
      shipping: "We ship worldwide! Within Nigeria, it takes about 1-3 days. International delivery usually arrives within 5-10 business days."
    };

    let bestAnswer = topIntent && genericIntentResponses[topIntent[0]] ? genericIntentResponses[topIntent[0]] : null;
    let maxOverallScore = topIntent && genericIntentResponses[topIntent[0]] ? 4 : 0;

    // Check Question-Answer pairs
    kbQA.forEach(({ q, a }) => {
      let s = 0;
      const lowQ = q.toLowerCase();
      terms.forEach(t => {
        if (lowQ.includes(t)) {
          const isMatch = lowQ.split(/\s+/).includes(t);
          s += isMatch ? 5 : 2;
        }
      });
      if (topIntent) {
        const syns = intentSynonyms[topIntent[0]];
        syns.forEach(t => { if (lowQ.includes(t)) s += 3; });
      }
      if (s > maxOverallScore) { maxOverallScore = s; bestAnswer = a; }
    });

    // Check raw lines fallback
    knowledgeBase.forEach(line => {
      let s = 0;
      const lowL = line.toLowerCase();
      if (lowL.startsWith('q:') || lowL.startsWith('a:')) return;
      terms.forEach(t => {
        if (lowL.includes(t)) {
          const isMatch = lowL.split(/\s+/).includes(t);
          s += isMatch ? 5 : 2;
        }
      });
      if (topIntent) {
        const syns = intentSynonyms[topIntent[0]];
        syns.forEach(t => { if (lowL.includes(t)) s += 3; });
      }
      if (s > maxOverallScore) { maxOverallScore = s; bestAnswer = line; }
    });

    return maxOverallScore > 5 ? bestAnswer : null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Direct smart chat handling for super short requests before heavy logic
      const greetTerms = ['hi', 'hello', 'hey', 'yo', 'sup', 'howfar', 'wassup', 'morning'];
      const qLow = userMessage.toLowerCase().trim();
      if (greetTerms.includes(qLow)) {
        const greet = "Hey! I'm 23, your personal fashion assistant. Ask me anything about our latest collections, pricing, or the story behind our brand.";
        setMessages(prev => [...prev, { role: 'bot', content: greet }]);
        setIsTyping(false);
        return;
      }

      if (qLow.includes('how much') || qLow.includes('price')) {
        const resp = "Our premium pieces vary depending on the collection. Classic t-shirts are typically ₦25,000, while full tracksuits and premium denim are ₦50,000. You can browse the Shop page for specific items!";
        setMessages(prev => [...prev, { role: 'bot', content: resp }]);
        setIsTyping(false);
        return;
      }

      if (qLow.includes('who are you') || qLow.includes('what is 23')) {
        const resp = "I am the digital intelligence behind 23. Born in Lagos, we craft high-end luxury streetwear that moves as fast as you do. How can I style you today?";
        setMessages(prev => [...prev, { role: 'bot', content: resp }]);
        setIsTyping(false);
        return;
      }
      // 1. Try AI First (Highly Reliable with Context)
      const hasGroq = Boolean(import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_KEY);
      let response = null;

      if (hasGroq) {
        const kbText = [
          ...kbQA.map(({ q, a }) => `Q: ${q}\nA: ${a}`),
          ...knowledgeBase
        ].join('\n');
        try {
          response = await askGroq(userMessage, kbText, messages);
        } catch (err) {
          console.warn("AI bridge failed, falling back to keywords:", err);
          response = null;
        }
      }

      // 2. Fallback to Keyword Match if AI failed or is missing
      if (!response) {
        response = findBestMatch(userMessage);
      }

      // 3. Final Multi-layered Fallback
      if (!response) {
        response = "I'm not quite sure about that one yet — reach out to us on Instagram @twentythreepreppy or WhatsApp and we'll help you out! 📩";
      }

      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Icon — NEW LUXURIOUS DESIGN */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 flex items-center justify-center group/chat overflow-hidden ${isOpen ? 'hidden' : 'flex'}`}
      >
        <div className="absolute inset-0 bg-[var(--accent)] translate-y-full group-hover/chat:translate-y-0 transition-transform duration-500" />
        <div className="relative z-10 font-display font-black text-xl group-hover/chat:text-black transition-colors duration-500">
          23
        </div>
        {/* Subtle dot */}
        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[var(--accent)] rounded-full group-hover/chat:bg-black transition-colors" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] bg-white z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
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
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-black text-white rounded-tr-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                      }`}
                  >
                    {msg.content}
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

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about fashion, 23, or style..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
