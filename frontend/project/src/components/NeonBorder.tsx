import React from 'react';
import { motion } from 'framer-motion';

export function NeonBorder() {
  return (
    <>
      {/* Top border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
      />
      
      {/* Right border */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
        className="absolute top-0 -right-px bottom-0 w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent"
      />
      
      {/* Bottom border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
      />
      
      {/* Left border */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
        className="absolute top-0 -left-px bottom-0 w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent"
      />
    </>
  );
}