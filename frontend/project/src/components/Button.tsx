import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  featured?: boolean;
}

export function Button({ children, className, variant = 'primary', featured, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'relative px-8 py-4 text-lg font-medium rounded-full overflow-hidden transition-all duration-300',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-black/0 dark:before:from-white/0 before:via-black/10 dark:before:via-white/10 before:to-black/0 dark:before:to-white/0 before:translate-x-[-100%] before:hover:translate-x-[100%] before:transition-transform before:duration-500',
        variant === 'primary' && !featured && 'bg-black dark:bg-white text-white dark:text-black hover:animate-neon dark:hover:animate-neonDark',
        variant === 'primary' && featured && 'bg-white dark:bg-black text-black dark:text-white hover:animate-neonDark dark:hover:animate-neon',
        variant === 'secondary' && 'border border-black/20 dark:border-white/20 text-black dark:text-white hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}