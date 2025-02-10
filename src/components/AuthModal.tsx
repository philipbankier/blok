import React from 'react';
import { X, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onSubmit: (email: string, password: string) => void;
}

export function AuthModal({ isOpen, onClose, mode, onSubmit }: AuthModalProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
            {mode === 'signin' ? 'Welcome Back' : 'Join Blok'}
          </h2>
          <p className="text-white/60 mt-2 text-sm">
            {mode === 'signin' 
              ? 'Sign in to continue your journey'
              : 'Create an account to get started'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                placeholder="••••••••"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="glow w-full bg-gradient-to-r from-blue-500 to-blue-300 text-white py-2.5 px-4 rounded-xl hover:opacity-90 transition-all font-medium text-sm"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          {mode === 'signin' && (
            <p className="text-center text-sm text-white/60">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  onClose();
                  setTimeout(() => {
                    setAuthMode('signup');
                    setAuthModalOpen(true);
                  }, 100);
                }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign up
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}