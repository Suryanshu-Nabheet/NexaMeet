import React from 'react';
import { motion } from 'framer-motion';
import { Award, BarChart, Globe2, Users, Heart, Zap, Shield, Code } from 'lucide-react';

export const About: React.FC = () => {
  const stats = [
    { label: 'Active Users', value: '1M+' },
    { label: 'Countries', value: '150+' },
    { label: 'Meetings Hosted', value: '10M+' },
    { label: 'Customer Satisfaction', value: '99%' }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'User-First',
      description: 'We prioritize user experience and satisfaction in everything we do.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Constantly pushing boundaries to deliver cutting-edge solutions.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Security',
      description: 'Enterprise-grade security to protect your data and privacy.'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Commitment to quality and technical excellence in our products.'
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
            About NexaMeet
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Revolutionizing remote collaboration with cutting-edge technology
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20 text-center"
            >
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Our Mission
              </h2>
              <p className="text-gray-300 mb-6">
                At NexaMeet, we're on a mission to transform how teams collaborate remotely. 
                We believe that distance should never be a barrier to effective communication 
                and collaboration.
              </p>
              <p className="text-gray-300">
                Our platform combines powerful video conferencing with advanced development 
                tools, making it the perfect solution for modern teams that need to work 
                together seamlessly, regardless of location.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
              >
                <Award className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Excellence</h3>
                <p className="text-gray-300 text-sm">
                  Delivering the highest quality experience
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
              >
                <BarChart className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Growth</h3>
                <p className="text-gray-300 text-sm">
                  Constantly evolving and improving
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
              >
                <Globe2 className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Global</h3>
                <p className="text-gray-300 text-sm">
                  Serving users worldwide
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
              >
                <Users className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-gray-300 text-sm">
                  Building a strong user community
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
              >
                <div className="text-blue-400 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Join Our Team
          </h2>
          <div className="bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border border-blue-500/20 text-center">
            <p className="text-xl text-gray-300 mb-6">
              We're always looking for talented individuals to join our mission
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500/80 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              View Open Positions
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};