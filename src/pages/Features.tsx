import React from 'react';
import { motion } from 'framer-motion';
import { Video, Shield, Code, Users, MessageCircle, Globe, Lock, Cpu, Wifi, Calendar, Clock, Mail, Share2, Mic, MicOff, Hand, FileText } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const hoverVariants = {
  initial: { 
    scale: 1,
    boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
    borderColor: "rgba(59, 130, 246, 0.2)"
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const textHoverVariants = {
  initial: { color: "#9CA3AF" }, // gray-400
  hover: { 
    color: "#60A5FA", // blue-400
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const lineVariants = {
  initial: { 
    scaleX: 0,
    opacity: 0
  },
  hover: {
    scaleX: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export const Features: React.FC = () => {
  const features = [
    {
      id: 'video',
      title: 'HD Video Conferencing',
      icon: <Video className="w-8 h-8" />,
      description: 'Crystal clear video quality with advanced features',
      details: [
        'Up to 1080p video resolution',
        'Adaptive quality based on network',
        'Background blur and noise reduction',
        'Multiple layout options',
        'Low latency streaming'
      ]
    },
    {
      id: 'security',
      title: 'Enterprise-Grade Security',
      icon: <Shield className="w-8 h-8" />,
      description: 'Bank-level security for your meetings',
      details: [
        'End-to-end encryption',
        'Waiting room functionality',
        'Password protection',
        'Host controls',
        'GDPR compliance'
      ]
    },
    {
      id: 'code',
      title: 'Code Collaboration',
      icon: <Code className="w-8 h-8" />,
      description: 'Real-time code editing and collaboration',
      details: [
        'Integrated code editor',
        'Multiple language support',
        'Real-time collaboration',
        'Code execution',
        'Terminal access'
      ]
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      icon: <Users className="w-8 h-8" />,
      description: 'Advanced tools for team collaboration',
      details: [
        'Screen sharing',
        'Whiteboard',
        'File sharing',
        'Chat functionality',
        'Meeting recording'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-black to-black text-white">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Powerful Features
          </h1>
          <motion.p 
            className="text-xl text-blue-200 max-w-3xl mx-auto"
            variants={textHoverVariants}
            initial="initial"
            whileHover="hover"
          >
            Everything you need for seamless video conferencing and collaboration
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover="hover"
              initial="initial"
              className="bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border border-blue-500/20 group"
            >
              <div className="text-blue-400 mb-4">
                {feature.icon}
              </div>
              <div className="text-2xl font-bold mb-3 relative">
                {feature.title}
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 origin-left"
                  variants={lineVariants}
                  initial="initial"
                  whileHover="hover"
                />
              </div>
              <motion.p 
                className="text-blue-200 mb-6"
                variants={textHoverVariants}
                initial="initial"
                whileHover="hover"
              >
                {feature.description}
              </motion.p>
              <ul className="space-y-3">
                {feature.details.map((detail, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + i * 0.1 }}
                    className="flex items-center text-gray-300 group/item"
                  >
                    <motion.div 
                      className="w-2 h-2 bg-blue-400 rounded-full mr-3"
                      variants={textHoverVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                    <motion.span 
                      variants={textHoverVariants}
                      initial="initial"
                      whileHover="hover"
                      className="flex-1"
                    >
                      {detail}
                    </motion.span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 relative inline-block mx-auto">
            Feature Comparison
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 origin-left"
              variants={lineVariants}
              initial="initial"
              whileHover="hover"
            />
          </h2>
          <motion.div 
            className="bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border border-blue-500/20"
            whileHover="hover"
            variants={hoverVariants}
            initial="initial"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-500/20">
                  <motion.th 
                    className="text-left py-4 px-6"
                    variants={textHoverVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    Feature
                  </motion.th>
                  <motion.th 
                    className="text-center py-4 px-6"
                    variants={textHoverVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    Free
                  </motion.th>
                  <motion.th 
                    className="text-center py-4 px-6"
                    variants={textHoverVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    Pro
                  </motion.th>
                  <motion.th 
                    className="text-center py-4 px-6"
                    variants={textHoverVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    Enterprise
                  </motion.th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Video Quality', free: '720p', pro: '1080p', enterprise: '4K' },
                  { feature: 'Participants', free: '4', pro: '50', enterprise: 'Unlimited' },
                  { feature: 'Code Collaboration', free: 'Basic', pro: 'Advanced', enterprise: 'Full Access' },
                  { feature: 'Security Features', free: 'Standard', pro: 'Enhanced', enterprise: 'Enterprise' }
                ].map((row, index) => (
                  <motion.tr 
                    key={index}
                    className="border-b border-blue-500/20 group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      scale: 1.01
                    }}
                  >
                    <motion.td 
                      className="py-4 px-6"
                      variants={textHoverVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {row.feature}
                    </motion.td>
                    <motion.td 
                      className="text-center py-4 px-6"
                      variants={textHoverVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {row.free}
                    </motion.td>
                    <motion.td 
                      className="text-center py-4 px-6"
                      variants={textHoverVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {row.pro}
                    </motion.td>
                    <motion.td 
                      className="text-center py-4 px-6"
                      variants={textHoverVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {row.enterprise}
                    </motion.td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  );
};