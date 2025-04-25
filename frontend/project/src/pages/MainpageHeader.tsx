import React from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';

interface MainpageHeaderProps {
  tokens?: number;
}

export function MainpageHeader({ tokens = 0 }: MainpageHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed w-full top-0 z-50 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold text-black dark:text-white tracking-tight">omex</span>
          </div>
          {/* Tokens Display (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-black dark:text-white">{tokens} Tokens</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">How It Works</a>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Contact</Link>
            <ThemeToggle />
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Sign up
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-full">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-black dark:text-white">{tokens}</span>
            </div>
            
            <MobileMenu 
              isOpen={isMobileMenuOpen} 
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
