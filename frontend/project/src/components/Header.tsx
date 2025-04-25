import { useState } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Link, useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { AuthContextType } from '../contexts/AuthContext';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { tokens, user } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  return (
    <header className="fixed w-full top-0 z-50 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo />
            <span className="text-xl font-bold text-black dark:text-white tracking-tight">omex</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">How It Works</a>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Contact</Link>
            <ThemeToggle />
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {/* Tokens Display (Desktop) */}
            {user && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-full">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-purple-600">{tokens} Tokens</span>
              </div>
            )}
            {!user && (
              <button
                onClick={() => navigate('/mainpage')}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            )}
            {user && (
              <button
                onClick={() => navigate('/study-streaks')}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
              >
                My Study Plan
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center gap-4">
            {/* Tokens Display (Mobile) */}
            {!user && (
               <button
                onClick={() => navigate('/mainpage')}
                className="px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
               >
                 Get Started
               </button>
            )}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-full">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-purple-600">{tokens}</span>
              </div>
            )}
            
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
