import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does the AI-powered learning work?",
    answer: "Our AI system analyzes your learning patterns, strengths, and areas for improvement to create a personalized study path. It adapts in real-time based on your progress and performance."
  },
  {
    question: "What subjects are available?",
    answer: "We cover a wide range of subjects including Computer Science, Mathematics, Science, Languages, and more. Our content library is continuously expanding based on user needs."
  },
  {
    question: "How do study streaks help me learn better?",
    answer: "Study streaks gamify your learning experience by tracking daily consistency. Maintaining streaks helps build strong study habits and rewards regular engagement with bonus features."
  },
  {
    question: "Can I track my progress?",
    answer: "Yes! Our platform provides detailed analytics, progress tracking, and performance insights. You can monitor your improvement through interactive dashboards and achievement systems."
  },
  {
    question: "Is there a mobile app available?",
    answer: "We're currently developing our mobile app to provide seamless learning on the go. Stay tuned for the launch announcement!"
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-black/10 dark:border-white/10"
      initial={false}
    >
      <button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-black dark:text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 dark:text-gray-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 bg-white dark:bg-black border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Everything you need to know about our platform</p>
        </motion.div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
