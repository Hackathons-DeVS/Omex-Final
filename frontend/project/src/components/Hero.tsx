import React from 'react';
import { Scene } from './3d/Scene';
import { Button } from './Button';
import { AnimatedText } from './AnimatedText';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen pt-32 pb-20 bg-white dark:bg-black overflow-hidden">
      <div className="absolute inset-0 bg-grid-black dark:bg-grid-white opacity-5" />
      <Scene />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex flex-col items-center text-center gap-12">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex flex-col items-center gap-4">
              <AnimatedText 
                text="Learn Smarter"
                highlightWord="Smarter"
                className="text-5xl md:text-7xl font-bold text-black dark:text-white leading-none tracking-tighter text-center"
              />
              <AnimatedText 
                text="Not Harder"
                className="text-5xl md:text-7xl font-bold text-black dark:text-white leading-none tracking-tighter text-center"
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-8 text-xl text-gray-600 dark:text-gray-400 leading-relaxed text-center"
            >
              Revolutionary AI-powered learning platform with immersive visualization and personalized study paths.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button 
                variant="primary" 
                onClick={() => navigate('/mainpage')}
              >
                Start Learning
              </Button>
              <Button variant="secondary">Watch Demo</Button>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent" />
    </section>
  );
}