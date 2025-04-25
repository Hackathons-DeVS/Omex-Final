import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Computer Science Student',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
    quote: 'Xemo transformed my study routine. The AI-powered features are mind-blowing!',
  },
  {
    name: 'Alex M.',
    role: 'Medical Student',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
    quote: 'The Mindmaps helps me finish off concepts easily through visual learning and understanding the key-points.',
  },
  {
    name: 'Emma R.',
    role: 'High School Student',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
    quote: 'Study streaks kept me motivated throughout my exam preparation.',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-black border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white">What Students Say</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Join thousands of satisfied learners</p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-sm bg-gray-50/50 dark:bg-white/5 group hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-black/10 dark:text-white/10 group-hover:text-black/20 dark:group-hover:text-white/20 transition-colors" />
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 dark:from-white/20 to-transparent rounded-full blur-sm" />
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="relative w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current text-black dark:text-white"
                  />
                ))}
              </div>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {testimonial.quote}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
