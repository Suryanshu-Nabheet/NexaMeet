import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Video, Shield, Lock, Mail, User } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { loginWithEmail, createAccount, loading, error } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isSignUp && !displayName.trim()) {
      setFormError('Display name is required');
      return;
    }

    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }

    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }

    if (isSignUp && password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isSignUp) {
        await createAccount(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="mb-8">
              <Video className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to NexaMeet</h2>
              <p className="text-gray-300">Sign in to start or join secure video meetings</p>
            </div>

            <div className="bg-dark-400 rounded-xl p-8 shadow-2xl border border-gray-700">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <Input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                    icon={<User className="h-5 w-5 text-gray-400" />}
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              {(formError || error) && (
                <div className="mt-4 text-red-500 text-sm">
                  {formError || error}
                </div>
              )}

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormError('');
                    setEmail('');
                    setPassword('');
                    setDisplayName('');
                  }}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>Secure end-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Lock className="h-5 w-5 text-primary-500" />
                  <span>Private and secure authentication</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};