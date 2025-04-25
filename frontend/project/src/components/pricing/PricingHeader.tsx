import React from 'react';
import { motion } from 'framer-motion';

export function PricingHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center max-w-2xl mx-auto"
    >
      <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white">
        Simple, Transparent Pricing
      </h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Choose the perfect plan for your learning journey. No hidden fees.
      </p>
    </motion.div>
  );
}