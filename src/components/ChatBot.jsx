import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User } from 'lucide-react';

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
            "23 is a luxury fashion brand founded in London.",
            "We offer worldwide shipping to over 100 countries.",
            "Our mission is to provide timeless pieces that transcend seasonal trends."
        ]);

        // Attempt to load from files
        try {
            const modules = import.meta.glob('../data/knowledge/*.txt', { as: 'raw' });
            const rawTexts = [];
            for (const p in modules) {
              const txt = await modules[p]();
              rawTexts.push(String(txt));
            }
            const textCombined = rawTexts.join('\n');
            const lines = textCombined
              .split('\n')
              .map(l => l.trim())
              .filter(l => l.length > 0);
            const qa = [];
            let currentQ = null;
            let currentA = [];
            const pushQA = () => {
              if (currentQ && currentA.length) {
                qa.push({ q: currentQ, a: currentA.join(' ') });
              }
              currentQ = null;
              currentA = [];
            };
            for (const line of lines) {
              const qMatch = line.match(/^Q:\s*(.+)$/i);
              if (qMatch) {
                pushQA();
                currentQ = qMatch[1].trim();
                continue;
              }
              const aMatch = line.match(/^A:\s*(.+)$/i);
              if (aMatch) {
                currentA.push(aMatch[1].trim());
                continue;
              }
              if (currentQ) {
                currentA.push(line);
                continue;
              }
              const kv = line.match(/^(.+?):\s*(.+)$/);
              if (kv && !line.startsWith('http')) {
                qa.push({ q: kv[1].trim(), a: kv[2].trim() });
              }
            }
            pushQA();
            if (qa.length > 0) setKbQA(qa);
            if (lines.length > 0) setKnowledgeBase(lines);
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
    const clean = query.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ');
    const terms = clean.split(/\\s+/).filter(t => t.length >= 2);
    if (!terms.length) return null;
    const intentSynonyms = {
      payment: ['pay','payment','opay','account','transfer','number','bank'],
      owner: ['owner','founder','who','created','founder'],
      contact: ['contact','reach','whatsapp','phone','email','instagram'],
      customize: ['custom','customize','personalize','design','own collection'],
      trend: ['trend','trending','in vogue','fashion'],
    };
    const intentScores = {};
    Object.keys(intentSynonyms).forEach(k => {
      intentScores[k] = terms.reduce((s,t) => s + (intentSynonyms[k].some(x => x.includes(t)) ? 1 : 0), 0);
    });
    const topIntent = Object.entries(intentScores).sort((a,b)=>b[1]-a[1])[0];
    if (kbQA.length) {
      let bestQA = null;
      let bestScore = 0;
      kbQA.forEach(({ q, a }) => {
        const lowQ = q.toLowerCase();
        let s = 0;
        terms.forEach(t => { if (lowQ.includes(t)) s++; });
        if (topIntent && topIntent[1] > 0) {
          const syns = intentSynonyms[topIntent[0]];
          syns.forEach(t => { if (lowQ.includes(t)) s+=0.5; });
        }
        if (s > bestScore) { bestScore = s; bestQA = { q, a }; }
      });
      if (bestScore > 0.5) return bestQA.a;
    }
    let best = null;
    let score = 0;
    knowledgeBase.forEach(line => {
      const low = line.toLowerCase();
      let s = 0;
      terms.forEach(t => { if (low.includes(t)) s++; });
      if (topIntent && topIntent[1] > 0) {
        const syns = intentSynonyms[topIntent[0]];
        syns.forEach(t => { if (low.includes(t)) s+=0.5; });
      }
      if (s > score) { score = s; best = line; }
    });
    return score > 0.5 ? best : null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate "thinking" time
    setTimeout(() => {
      const match = findBestMatch(userMessage);
      let response;

      if (match) {
        response = match;
        // If it's short, maybe find a second related line? (For now, simple RAG)
      } else {
        // Fallback responses
        const fallbacks = [
          "I don't have specific information on that in my database yet. Could you try rephrasing or ask about 23's policies, fashion trends, or care instructions?",
          "That's interesting! I'm still learning. Try asking me about our sustainable materials or how to style oversized fits.",
          "I'm 23, focused on fashion and our brand. I couldn't find a direct answer to that in my files."
        ];
        response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-40 bg-black text-white px-4 py-3 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <MessageSquare size={24} />
        <span className="text-xs font-bold uppercase tracking-widest">Chat with 23</span>
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
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
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
                placeholder="Ask about fashion, 23 Look, or style..."
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
