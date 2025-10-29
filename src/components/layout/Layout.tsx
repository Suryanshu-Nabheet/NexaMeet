import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, Github, Twitter, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const socialIconVariants = {
    hover: { 
      scale: 1.2,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.9 }
  };

  const footerLinkVariants = {
    initial: { 
      x: 0, 
      color: "#9CA3AF", // gray-400
    },
    hover: { 
      x: 0,
      color: "#60A5FA", // blue-400
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const footerButtonVariants = {
    initial: { 
      scale: 1,
      color: "#9CA3AF", // gray-400
    },
    hover: { 
      scale: 1.05,
      color: "#60A5FA", // blue-400
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const footerSectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navigation */}
      <motion.header 
        className="bg-black/80 backdrop-blur-md border-b border-gray-800 fixed w-full z-50"
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Video className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">
                  NexaMeet
                </span>
              </Link>
            </motion.div>
            
            <nav className="hidden md:flex space-x-8">
              {[
                { path: '/', label: 'Home' },
                { path: '/features', label: 'Features' },
                { path: '/about', label: 'About' },
                { path: '/pricing', label: 'Pricing' },
                { path: '/contact', label: 'Contact' }
              ].map(({ path, label }) => (
                <motion.div
                  key={path}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to={path}
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                      isActive(path) 
                        ? 'text-blue-400 bg-blue-500/10' 
                        : 'text-gray-300 hover:text-blue-400 hover:bg-blue-500/10'
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <motion.div whileHover="hover" whileTap="tap" variants={linkVariants}>
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-300 hover:text-blue-400 px-3 py-2 rounded-lg transition-all"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover="hover" whileTap="tap" variants={linkVariants}>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-black/80 backdrop-blur-md border-t border-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={footerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <motion.div 
              className="md:col-span-1"
              variants={footerSectionVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link to="/" className="flex items-center mb-4">
                  <Video className="h-8 w-8 text-blue-500" />
                  <span className="ml-2 text-xl font-bold text-white">NexaMeet</span>
                </Link>
              </motion.div>
              <p className="text-gray-400 text-sm mb-6">
                A personal project by Suryanshu Nabheet, focused on creating seamless video conferencing experiences.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Github className="w-5 h-5" />, href: 'https://github.com/Suryanshu-Nabheet', label: 'GitHub' },
                  { icon: <Linkedin className="w-5 h-5" />, href: 'https://www.linkedin.com/in/suryanshu-nabheet/', label: 'LinkedIn' },
                  { icon: <Twitter className="w-5 h-5" />, href: 'https://x.com/SuryanshuXDev', label: 'X' }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors duration-200 group"
                    variants={footerButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    title={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              variants={footerSectionVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { path: '/features', label: 'Features' },
                  { path: '/pricing', label: 'Pricing' },
                  { path: '/about', label: 'About' },
                  { path: '/contact', label: 'Contact' }
                ].map((link, index) => (
                  <motion.li
                    key={link.path}
                    variants={footerLinkVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Link 
                      to={link.path} 
                      className="text-sm font-medium px-3 py-2 rounded-lg transition-all text-gray-300 hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={footerSectionVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2">
                {[
                  { path: '/features#video', label: 'HD Video Conferencing' },
                  { path: '/features#security', label: 'Enterprise Security' },
                  { path: '/features#collaboration', label: 'Code Collaboration' },
                  { path: '/features#team', label: 'Team Collaboration' }
                ].map((link, index) => (
                  <motion.li
                    key={link.path}
                    variants={footerLinkVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Link 
                      to={link.path} 
                      className="text-sm font-medium px-3 py-2 rounded-lg transition-all text-gray-300 hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div
              variants={footerSectionVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                {[
                  { path: '/docs', label: 'Documentation' },
                  { path: '/help', label: 'Help Center' },
                  { path: '/api', label: 'API' },
                  { path: '/status', label: 'System Status' }
                ].map((link, index) => (
                  <motion.li
                    key={link.path}
                    variants={footerLinkVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Link 
                      to={link.path} 
                      className="text-sm font-medium px-3 py-2 rounded-lg transition-all text-gray-300 hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div 
            className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
            variants={footerSectionVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>© {new Date().getFullYear()} Built with ❤️ by Suryanshu Nabheet</p>
              <p className="mt-1 text-xs">Full Stack Developer & Open Source Enthusiast</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex space-x-6">
                {[
                  { path: '/privacy', label: 'Privacy Policy' },
                  { path: '/terms', label: 'Terms of Service' },
                  { path: '/cookies', label: 'Cookie Policy' }
                ].map((link, index) => (
                  <motion.div
                    key={link.path}
                    variants={footerLinkVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Link 
                      to={link.path} 
                      className="text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.a
                href="https://www.youtube.com/@SuryanshuNabheet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                variants={footerLinkVariants}
                initial="initial"
                whileHover="hover"
              >
                Check out my YouTube Channel
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};