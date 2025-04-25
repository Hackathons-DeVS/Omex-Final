import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Target, Award } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: 'Upload your pdf',
    description: 'Just upload your pdf to get started.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Pdf to Mindmaps',
    description: 'Gives you short summarized key points important for the exams in a visual form.',
  },
  {
    icon: Target,
    title: 'Practice & Apply',
    description: 'Reinforce your knowledge through interactive exercises',
  },
  {
    icon: Award,
    title: 'Get tokens',
    description: 'Claim tokens which can be used to gain interesting awards to keep you motivated.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-black border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Your journey to mastery in four simple steps
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative w-16 h-16 flex items-center justify-center bg-white dark:bg-black rounded-full border border-black/10 dark:border-white/10 group-hover:border-black/20 dark:group-hover:border-white/20 transition-colors">
                    <step.icon className="h-8 w-8 text-black dark:text-white" />
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-semibold text-black dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-1rem)] w-[calc(100%-2rem)] h-px">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="w-full h-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
