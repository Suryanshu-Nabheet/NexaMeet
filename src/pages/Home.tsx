import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Video, Shield, Code, Copy, Check, Users, Globe, Lock, Calendar, Mail, Globe2, Star, Award, BarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import * as meetingService from '../services/meeting';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

const buttonHover = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
};

interface MeetingFormData {
  name: string;
  title: string;
  date: Date | null;
  time: string;
  duration: number;
  description: string;
  meetingCode: string;
}

export const Home: React.FC = () => {
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);
  const [isJoinMeetingModalOpen, setIsJoinMeetingModalOpen] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    name: '',
    title: '',
    date: null,
    time: '',
    duration: 30,
    description: '',
    meetingCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [newMeetingCode, setNewMeetingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  const testimonials = [
    {
      quote: "Perfect for our remote team. The code collaboration feature is a game-changer!",
      author: "Sarah Chen",
      role: "Tech Lead at InnovateX"
    },
    {
      quote: "Used by 1,000+ students for group projects. Seamless experience!",
      author: "Dr. James Wilson",
      role: "Professor at Tech University"
    },
    {
      quote: "The best video conferencing platform I've used. Crystal clear audio!",
      author: "Maria Rodriguez",
      role: "Product Manager at GrowthCo"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);
      
      // First get media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the stream since we'll get it again in the meeting room
      stream.getTracks().forEach(track => track.stop());
      
      // Create the meeting
      const result = await meetingService.createMeeting();
      if (result) {
        const { id, hostId, meetingCode } = result;
        // Store meeting info in localStorage for persistence
        localStorage.setItem(`meeting_${id}_title`, formData.title || 'Untitled Meeting');
        localStorage.setItem('currentMeeting', JSON.stringify({
          id,
          hostId,
          meetingCode,
          isHost: true
        }));
        
        // Navigate to the meeting room with state
        navigate(`/meeting/${id}?participantId=${hostId}&name=${encodeURIComponent(formData.name || 'Host')}`, {
          state: {
            isHost: true,
            participantId: hostId,
            participantName: formData.name || 'Host'
          }
        });
      } else {
        toast.error('Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Camera and microphone access is required to create a meeting');
      } else {
        toast.error('Failed to create meeting');
      }
    } finally {
      setLoading(false);
      setIsNewMeetingModalOpen(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!formData.name || !formData.title || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields for scheduling');
      return;
    }
    try {
      // Placeholder for scheduling logic
      toast.success('Meeting scheduled successfully!');
      setIsScheduleMeetingModalOpen(false);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting');
    }
  };
  
  const handleJoinMeeting = async () => {
    if (!formData.meetingCode.trim()) {
      toast.error('Please enter a meeting code');
      return;
    }
    
    try {
    setLoading(true);
    
      // First get media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the stream since we'll get it again in the meeting room
      stream.getTracks().forEach(track => track.stop());
      
      const result = await meetingService.joinMeetingByCode(formData.meetingCode, formData.name || 'Participant');
      if (result.success) {
        const { meetingId, participantId, title } = result;
        // Store meeting info in localStorage
        localStorage.setItem(`meeting_${meetingId}_title`, title || formData.meetingCode);
        localStorage.setItem('currentMeeting', JSON.stringify({
          id: meetingId,
          meetingCode: formData.meetingCode,
          participantId,
          isHost: false
        }));
        
        // Navigate to the meeting room with state
        navigate(`/meeting/${meetingId}?participantId=${participantId}&name=${encodeURIComponent(formData.name || 'Participant')}`, {
          state: {
            isHost: false,
            participantId,
            participantName: formData.name || 'Participant'
          }
        });
      } else {
        toast.error('Failed to join meeting');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Camera and microphone access is required to join a meeting');
      } else {
        toast.error('Failed to join meeting');
      }
    } finally {
      setLoading(false);
      setIsJoinMeetingModalOpen(false);
    }
  };

  const copyMeetingCode = async () => {
    if (newMeetingCode) {
      await navigator.clipboard.writeText(newMeetingCode);
      setCopied(true);
      toast.success('Meeting code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openNewMeetingModal = () => setIsNewMeetingModalOpen(true);
  const openJoinMeetingModal = () => setIsJoinMeetingModalOpen(true);
  const openScheduleMeetingModal = () => setIsScheduleMeetingModalOpen(true);

  const features = [
    {
      id: 'security',
      title: 'End-to-End Encryption',
      description: 'Bank-grade security with end-to-end encryption',
      icon: <Lock className="w-6 h-6" />,
      details: ['256-bit AES encryption', 'Secure data transmission', 'GDPR compliant', 'SSL secured']
    },
    {
      id: 'video',
      title: 'HD Video & Audio',
      description: 'Crystal clear video and audio quality',
      icon: <Video className="w-6 h-6" />,
      details: ['Up to 1080p video', 'Noise cancellation', 'Background blur', 'Low latency']
    },
    {
      id: 'collaboration',
      title: 'Real-Time Collaboration',
      description: 'Advanced collaboration tools for teams',
      icon: <Users className="w-6 h-6" />,
      details: ['Screen sharing', 'Live chat', 'Whiteboard', 'File sharing']
    },
    {
      id: 'code',
      title: 'Code Editor',
      description: 'Integrated IDE with real-time collaboration',
      icon: <Code className="w-6 h-6" />,
      details: ['Real-time collaboration', 'Multiple languages', 'Integrated terminal', 'Code execution']
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      {/* Glowing Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <motion.div 
          style={{ opacity, scale }}
          className="text-center mb-16 pt-32"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            className="relative"
          >
            {/* Decorative Elements */}
            <motion.div 
              className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div 
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2,
              }}
            />
            
            {/* Title with enhanced effects */}
            <motion.h1
              ref={titleRef}
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            >
              Next-Gen Video Conferencing
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 text-center mb-8 max-w-2xl mx-auto"
            >
              Experience seamless video calls with integrated code collaboration and team features.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <motion.button
                variants={buttonHover}
                whileHover="hover"
                whileTap="tap"
                onClick={openNewMeetingModal}
                className="w-full sm:w-auto bg-blue-500/80 hover:bg-blue-600/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center"
              >
                <Video className="w-4 h-4 mr-2" />
                Start Meeting
              </motion.button>
              <motion.button
                variants={buttonHover}
                whileHover="hover"
                whileTap="tap"
                onClick={openJoinMeetingModal}
                className="w-full sm:w-auto bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Meeting
              </motion.button>
              <motion.button
                variants={buttonHover}
                whileHover="hover"
                whileTap="tap"
                onClick={openScheduleMeetingModal}
                className="w-full sm:w-auto bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Video Demo */}
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          className="mb-20"
        >
          <motion.div 
            className="relative rounded-xl overflow-hidden shadow-2xl border border-blue-500/20 max-w-4xl mx-auto"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
              borderColor: "rgba(59, 130, 246, 0.5)",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <div className="aspect-video">
              <video
                src="/src/video/videoplayback.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
              animate={{
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          id="features" 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className="relative group"
              variants={fadeInUp}
            >
              <motion.div
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                  borderColor: 'rgba(59, 130, 246, 0.5)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <div className="text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-blue-200 text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center text-gray-300 text-sm"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <div>
                        <Check className="w-4 h-4 mr-2 text-blue-400" />
                      </div>
                      {detail}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Powered by Cutting-Edge Technology
          </h2>
          <div className="flex justify-center gap-8 flex-wrap">
            <TechBadge name="WebRTC" />
            <TechBadge name="React" />
            <TechBadge name="TypeScript" />
            <TechBadge name="TailwindCSS" />
            <TechBadge name="Framer Motion" />
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          id="about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            About NexaMeet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AboutCard
              icon={<Award className="w-8 h-8" />}
              title="Our Mission"
              description="To revolutionize remote collaboration by combining video conferencing with powerful development tools."
            />
            <AboutCard
              icon={<BarChart className="w-8 h-8" />}
              title="Our Impact"
              description="Trusted by thousands of developers and teams worldwide for seamless remote collaboration."
            />
            <AboutCard
              icon={<Globe2 className="w-8 h-8" />}
              title="Global Reach"
              description="Available in multiple languages and time zones, serving users across the globe."
            />
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          id="pricing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Free"
              price="$0"
              features={[
                'Up to 4 participants',
                'Basic video conferencing',
                'Screen sharing',
                'Chat functionality'
              ]}
              buttonText="Get Started"
              highlighted={false}
            />
            <PricingCard
              title="Pro"
              price="$15"
              period="/month"
              features={[
                'Up to 50 participants',
                'Advanced video conferencing',
                'Code collaboration',
                'Meeting recording',
                'Priority support'
              ]}
              buttonText="Start Free Trial"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              features={[
                'Unlimited participants',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee',
                'Custom branding'
              ]}
              buttonText="Contact Sales"
              highlighted={false}
            />
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          id="contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <Mail className="w-5 h-5 mr-3 text-blue-400" />
                  support@nexameet.com
                </li>
                <li className="flex items-center text-gray-300">
                  <Globe className="w-5 h-5 mr-3 text-blue-400" />
                  www.nexameet.com
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4">Send us a Message</h3>
              <form className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <textarea
                  placeholder="Your Message"
                  className="w-full h-32 bg-gray-800/50 border border-blue-500/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <Button className="w-full bg-blue-500/80 hover:bg-blue-600/80">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Trusted by Teams Worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-blue-400">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center gap-12 flex-wrap">
            <TrustBadge icon={<Lock className="w-6 h-6" />} text="GDPR Compliant" />
            <TrustBadge icon={<Shield className="w-6 h-6" />} text="SSL Secured" />
            <TrustBadge icon={<Globe2 className="w-6 h-6" />} text="99.9% Uptime" />
            <TrustBadge icon={<Users className="w-6 h-6" />} text="1M+ Users" />
          </div>
        </motion.div>
      </div>

      {/* Modals with enhanced animations */}
      <AnimatePresence>
        {isNewMeetingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-900/90 backdrop-blur-lg p-8 rounded-xl w-full max-w-md border border-blue-500/20"
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Create New Meeting
              </h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  name="name"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="text"
                  placeholder="Meeting Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  name="title"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <div className="flex justify-end gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setIsNewMeetingModalOpen(false)}
                    className="bg-gray-800/50 hover:bg-gray-700/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateMeeting}
                    disabled={loading}
                    className="bg-blue-500/80 hover:bg-blue-600/80"
                  >
                    {loading ? 'Creating...' : 'Create Meeting'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isScheduleMeetingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-900/90 backdrop-blur-lg p-8 rounded-xl w-full max-w-md border border-blue-500/20"
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Schedule Meeting
              </h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  name="name"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="text"
                  placeholder="Meeting Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  name="title"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="date"
                  value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                  onChange={handleInputChange}
                  name="date"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  name="time"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={handleInputChange}
                  name="duration"
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <textarea
                  placeholder="Meeting Description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  name="description"
                  className="w-full h-32 bg-gray-800/50 border border-blue-500/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setIsScheduleMeetingModalOpen(false)}
                    className="bg-gray-800/50 hover:bg-gray-700/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleMeeting}
                    disabled={loading}
                    className="bg-blue-500/80 hover:bg-blue-600/80"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Meeting'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isJoinMeetingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900/90 backdrop-blur-lg p-8 rounded-xl w-full max-w-md border border-blue-500/20"
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Join Meeting
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); handleJoinMeeting(); }} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Meeting Code"
                  value={formData.meetingCode}
                  onChange={(e) => setFormData({ ...formData, meetingCode: e.target.value })}
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800/50 border-blue-500/20"
                />
                <div className="flex justify-end gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setIsJoinMeetingModalOpen(false)}
                    className="bg-gray-800/50 hover:bg-gray-700/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500/80 hover:bg-blue-600/80"
                  >
                    {loading ? 'Joining...' : 'Join Meeting'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Meeting Created Modal */}
        {newMeetingCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-400 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Meeting Created!</h2>
              <div className="space-y-4">
                <div className="bg-dark-300 rounded-lg p-4">
                  <p className="text-gray-300 mb-2">Meeting Code:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-2xl font-mono text-white">{newMeetingCode}</code>
                    <Button
                      onClick={copyMeetingCode}
                      variant="ghost"
                      className="text-primary-400 hover:text-primary-300"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Share this code with others to let them join your meeting.
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setNewMeetingCode(null);
                    }}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced component animations
const TechBadge = ({ name }: { name: string }) => (
  <motion.div
    variants={buttonHover}
    whileHover="hover"
    whileTap="tap"
    className="px-6 py-3 bg-gray-800/30 backdrop-blur-sm rounded-full border border-blue-500/30 text-lg font-medium hover:border-blue-500/50 transition-colors"
  >
    {name}
  </motion.div>
);

const TrustBadge = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <motion.div
    variants={buttonHover}
    whileHover="hover"
    whileTap="tap"
    className="flex items-center gap-2 text-blue-400"
  >
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
    >
      {icon}
    </motion.div>
    <span className="text-sm font-medium">{text}</span>
  </motion.div>
);

const AboutCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ 
      scale: 1.02,
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      borderColor: 'rgba(59, 130, 246, 0.5)'
    }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 20,
    }}
    className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl border border-blue-500/20"
  >
    <div className="text-blue-400 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

const PricingCard = ({ 
  title, 
  price, 
  period = '', 
  features, 
  buttonText, 
  highlighted 
}: { 
  title: string, 
  price: string, 
  period?: string, 
  features: string[], 
  buttonText: string, 
  highlighted: boolean 
}) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ 
      scale: 1.02,
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      borderColor: 'rgba(59, 130, 246, 0.5)'
    }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 20,
    }}
    className={`bg-gray-900/30 backdrop-blur-lg p-8 rounded-xl border ${
      highlighted ? 'border-blue-500/50' : 'border-blue-500/20'
    }`}
  >
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold">{price}</span>
      <span className="text-gray-400">{period}</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <motion.li 
          key={index} 
          className="flex items-center text-gray-300"
          whileHover={{ x: 5 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 10,
          }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Check className="w-5 h-5 mr-3 text-blue-400" />
          </motion.div>
          {feature}
        </motion.li>
      ))}
    </ul>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        className={`w-full ${
          highlighted 
            ? 'bg-blue-500/80 hover:bg-blue-600/80' 
            : 'bg-gray-800/50 hover:bg-gray-700/50'
        }`}
      >
        {buttonText}
      </Button>
    </motion.div>
  </motion.div>
);