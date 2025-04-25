import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function NeonButton({ children, className, ...props }: NeonButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-full px-8 py-3 text-sm font-medium',
        'bg-gradient-to-r from-purple-600 to-pink-600',
        'text-white shadow-xl transition-all duration-300',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600/0 before:via-white/20 before:to-pink-600/0',
        'before:translate-x-[-100%] before:hover:translate-x-[100%] before:transition-transform before:duration-500',
        'after:absolute after:inset-0 after:rounded-full after:border after:border-white/20',
        'hover:shadow-[0_0_20px_rgba(168,85,247,0.4),0_0_40px_rgba(168,85,247,0.2)]',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="h-[200%] w-[200%] animate-spin-slow rounded-full border border-white/20" />
      </div>
    </motion.button>
  );
}