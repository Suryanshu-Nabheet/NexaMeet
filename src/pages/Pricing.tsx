import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Shield, Users, Code, Video, MessageCircle, Globe, Lock, Cpu, Wifi, Calendar, Clock, Mail, Share2, Mic, MicOff, Hand, FileText } from 'lucide-react';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for individuals and small teams',
      features: [
        { name: 'Up to 4 participants', included: true },
        { name: '720p video quality', included: true },
        { name: 'Basic screen sharing', included: true },
        { name: 'Chat functionality', included: true },
        { name: 'Meeting recording', included: false },
        { name: 'Code collaboration', included: false },
        { name: 'Advanced security', included: false },
        { name: 'Priority support', included: false }
      ],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$15',
      period: '/month',
      description: 'Best for growing teams and professionals',
      features: [
        { name: 'Up to 50 participants', included: true },
        { name: '1080p video quality', included: true },
        { name: 'Advanced screen sharing', included: true },
        { name: 'Enhanced chat features', included: true },
        { name: 'Meeting recording', included: true },
        { name: 'Code collaboration', included: true },
        { name: 'Advanced security', included: true },
        { name: 'Priority support', included: false }
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with custom needs',
      features: [
        { name: 'Unlimited participants', included: true },
        { name: '4K video quality', included: true },
        { name: 'Advanced screen sharing', included: true },
        { name: 'Enhanced chat features', included: true },
        { name: 'Meeting recording', included: true },
        { name: 'Code collaboration', included: true },
        { name: 'Advanced security', included: true },
        { name: 'Priority support', included: true }
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-black to-black text-white">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Choose the perfect plan for your needs
          </p>
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border ${
                plan.highlighted ? 'border-blue-500/50' : 'border-blue-500/20'
              }`}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  {plan.price}
                  <span className="text-gray-400 text-lg">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + i * 0.1 }}
                    className="flex items-center text-gray-300"
                  >
                    {feature.included ? (
                      <Check className="w-5 h-5 mr-3 text-blue-400" />
                    ) : (
                      <X className="w-5 h-5 mr-3 text-gray-500" />
                    )}
                    {feature.name}
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-blue-500/80 hover:bg-blue-600/80'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
            >
              <h3 className="text-xl font-bold mb-4">Can I switch plans later?</h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
            >
              <h3 className="text-xl font-bold mb-4">Is there a free trial?</h3>
              <p className="text-gray-300">
                Yes, we offer a 14-day free trial of our Pro plan. No credit card required to start.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
            >
              <h3 className="text-xl font-bold mb-4">What payment methods do you accept?</h3>
              <p className="text-gray-300">
                We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
            >
              <h3 className="text-xl font-bold mb-4">Do you offer refunds?</h3>
              <p className="text-gray-300">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of teams already using NexaMeet
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500/80 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}; 