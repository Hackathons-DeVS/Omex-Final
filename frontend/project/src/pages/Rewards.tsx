import { StudyHeader } from '../components/StudyHeader';
import { Footer } from '../components/Footer';
import { Gift, GamepadIcon, ShoppingBag, Music2, Film, Headphones, Coffee, BookOpen, Laptop, Briefcase, Medal, Book, GraduationCap, Trophy, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export function Rewards() {
  const { tokens } = useAuth();

  const rewards = [
    {
      title: 'Laptop',
      description: 'High-performance laptop for your studies and work',
      icon: Laptop,
      tokens: 10000,
    },
    {
      title: 'Career Counseling',
      description: '1-hour session with a professional career counselor',
      icon: Briefcase,
      tokens: 8000,
    },
    {
      title: 'Professional Course',
      description: 'Access to a premium professional certification course',
      icon: Medal,
      tokens: 7000,
    },
    {
      title: 'Academic Excellence Pack',
      description: 'Bundle of premium study materials and resources',
      icon: GraduationCap,
      tokens: 6000,
    },
    {
      title: 'Amazon Gift Card',
      description: 'Get a $50 Amazon gift card to spend on anything you want',
      icon: ShoppingBag,
      tokens: 5000,
    },
    {
      title: 'Netflix Subscription',
      description: '1 month of unlimited streaming of movies and TV shows',
      icon: Film,
      tokens: 4000,
    },
    {
      title: 'Spotify Premium',
      description: 'Ad-free music streaming with offline playback for 1 month',
      icon: Music2,
      tokens: 3500,
    },
    {
      title: 'Xbox Game Pass',
      description: '1 month of unlimited access to hundreds of high-quality games',
      icon: GamepadIcon,
      tokens: 3000,
    },
    {
      title: 'Gaming Headset',
      description: 'High-quality gaming headset with surround sound',
      icon: Headphones,
      tokens: 2500,
    },
    {
      title: 'Premium Subscription',
      description: 'One month of premium features and unlimited mindmaps',
      icon: Gift,
      tokens: 2000,
    },
    {
      title: 'Study Resources',
      description: 'Access to premium study materials and guides',
      icon: BookOpen,
      tokens: 1500,
    },
    {
      title: 'Coffee Shop Gift Card',
      description: '$20 gift card for your favorite coffee shop',
      icon: Coffee,
      tokens: 1000,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
      <StudyHeader tokens={tokens} />
      <main className="max-w-7xl mx-auto px-6 py-24 mt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
            Rewards Store
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Earn tokens by completing study streaks and quizzes
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 mb-8 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            🚧 These rewards are currently unavailable. We're working on making them available in the next update! 🚧
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-full mb-6 transform hover:scale-110 transition-transform duration-200">
                <reward.icon className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                {reward.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                {reward.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {reward.tokens} Tokens
                </span>
                <button
                  onClick={() => tokens >= reward.tokens ? alert('Coming soon! Reward redemption will be available in the next update.') : alert('Not enough tokens! Keep studying to earn more.')}
                  className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-opacity duration-200 ${tokens >= reward.tokens ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}