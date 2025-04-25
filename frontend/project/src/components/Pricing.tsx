import React from 'react';
import { PricingHeader } from './pricing/PricingHeader';
import { PricingCard } from './pricing/PricingCard';
import { plans } from './pricing/pricingData';

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 border-t border-black/10 dark:border-white/10">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <PricingHeader />
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              index={index}
              {...plan}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}