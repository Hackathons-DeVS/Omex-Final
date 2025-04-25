import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../Button';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  index: number;
}

export function PricingCard({ name, price, description, features, featured, index }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative p-8 rounded-2xl backdrop-blur-sm transform transition-all duration-300 hover:scale-105 ${
        featured
          ? 'bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 border-2 border-black dark:border-white shadow-xl'
          : 'bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
      }`}
    >
      {featured && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white dark:bg-black text-black dark:text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-black/10 dark:border-white/10 shadow-lg">
          <Sparkles className="h-4 w-4" />
          Most Popular
        </div>
      )}
      
      <div className="text-center">
        <h3 className={`text-xl font-bold ${
          featured ? 'text-white dark:text-black' : 'text-black dark:text-white'
        }`}>{name}</h3>
        <p className={`mt-2 text-sm ${
          featured ? 'text-white/70 dark:text-black/70' : 'text-gray-600 dark:text-gray-400'
        }`}>{description}</p>
        <div className="mt-6 flex items-end justify-center gap-1">
          <span className={`text-5xl font-bold ${
            featured ? 'text-white dark:text-black' : 'text-black dark:text-white'
          }`}>{price}</span>
          {price !== 'Free' && (
            <span className={`mb-2 ${
              featured ? 'text-white/70 dark:text-black/70' : 'text-gray-600 dark:text-gray-400'
            }`}>/month</span>
          )}
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`flex items-center gap-3 ${
              featured ? 'text-white dark:text-black' : 'text-black dark:text-white'
            }`}
          >
            <div className={`flex-shrink-0 p-1 rounded-full ${
              featured ? 'bg-white/10 dark:bg-black/10' : 'bg-black/5 dark:bg-white/5'
            }`}>
              <Check className={`h-4 w-4 ${
                featured ? 'text-white dark:text-black' : 'text-black/70 dark:text-white/70'
              }`} />
            </div>
            <span className="text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8">
        <Button
          variant="primary"
          featured={featured}
          className="w-full"
        >
          Get Started
        </Button>
      </div>
    </motion.div>
  );
}