
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn items in their original condition with tags attached. Returns are processed within 5-7 business days."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 100 countries worldwide. International shipping rates and delivery times vary by location."
  },
  {
    question: "How do I care for my garments?",
    answer: "Each piece comes with specific care instructions. Generally, we recommend cold wash and air dry also don't iron the prints."
  },
  {
    question: "Where are your products made?",
    answer: "Our collections are designed in Lagos , ensuring the highest quality standards and fair labor practices."
  },
  {
    question: "Can I track my order?",
    answer: "Once your order ships, you will receive a confirmation email with a tracking number to monitor your delivery status."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-12 text-center">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-gray-600 transition-colors"
              >
                <span className="text-lg font-medium pr-8">{faq.question}</span>
                {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
