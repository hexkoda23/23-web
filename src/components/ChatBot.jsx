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
            let allText = [];
            for (const path in modules) {
              const content = await modules[path]();
              allText.push(String(content));
            }
            const allLines = allText
              .join('\n')
              .split('\n')
              .map(l => l.trim())
              .filter(l => l.length > 0);
            // Parse Q/A style entries
            const qa = [];
            let currentQ = null;
            for (const line of allLines) {
              const qMatch = line.match(/^Q:\s*(.+)$/i);
              const aMatch = line.match(/^A:\s*(.+)$/i);
              if (qMatch) {
                currentQ = qMatch[1].trim();
                continue;
              }
              if (aMatch && currentQ) {
                qa.push({ q: currentQ, a: aMatch[1].trim() });
                currentQ = null;
                continue;
              }
              // key: value fallback
              const kv = line.match(/^(.+?):\s*(.+)$/);
              if (kv && !line.startsWith('http')) {
                qa.push({ q: kv[1].trim(), a: kv[2].trim() });
              }
            }
            if (qa.length > 0) setKbQA(qa);
            if (allLines.length > 0) setKnowledgeBase(allLines);
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
    const queryTerms = clean.split(/\\s+/).filter(term => term.length >= 2);
    if (queryTerms.length === 0) return null;

    // First, try structured Q/A
    if (kbQA.length) {
      let bestQA = null;
      let bestScore = 0;
      kbQA.forEach(({ q, a }) => {
        const lowerQ = q.toLowerCase();
        let score = 0;
        queryTerms.forEach(term => {
          if (lowerQ.includes(term)) score += 1;
        });
        if (score > bestScore) {
          bestScore = score;
          bestQA = { q, a, score };
        }
      });
      if (bestScore > 0) return bestQA.a;
    }

    // Fallback: match individual lines
    let bestMatch = null;
    let maxScore = 0;
    knowledgeBase.forEach(text => {
      let score = 0;
      const lowerText = text.toLowerCase();
      
      queryTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 1;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = text;
      }
    });

    // Threshold for relevance
    return maxScore > 0 ? bestMatch : null;
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
