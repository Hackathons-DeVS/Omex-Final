import { useState } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Link, useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { AuthContextType } from '../contexts/AuthContext';

interface StudyHeaderProps {
  tokens: number;
}

export function StudyHeader({ tokens }: StudyHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  return (
    <header className="fixed w-full top-0 z-50 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-bold text-black dark:text-white tracking-tight">omex</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">How It Works</a>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Contact</Link>
            <ThemeToggle />
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {/* Tokens Display (Desktop) */}
            <Link to="/rewards" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{tokens} Tokens</span>
            </Link>
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
            <Link to="/rewards" className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">{tokens} Tokens</span>
            </Link>

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