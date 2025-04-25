import React from 'react';
import { Pencil, Facebook, Twitter, Instagram, Mail, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Pencil className="h-6 w-6 text-black dark:text-white" />
              <span className="text-xl font-bold tracking-tight text-black dark:text-white">omex</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Revolutionizing learning through visual learning and and interactive mock-tests
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Navigation</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Legal</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#privacy" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Connect</h4>
            <div className="mt-4 flex space-x-4">
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <a 
                href="mailto:contact@xemo.io" 
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                devs.gjo@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Xemo. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                Status
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                Changelog
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
