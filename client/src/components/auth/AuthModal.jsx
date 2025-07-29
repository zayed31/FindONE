import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  
  // Form data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  // Handle mode switching with smooth transitions
  const switchMode = (newMode) => {
    if (newMode === mode || isTransitioning) return;
    
    setIsTransitioning(true);
    setError('');
    
    // Wait for fade out animation
    setTimeout(() => {
      setMode(newMode);
      // Wait for fade in animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 150);
  };

  // Update mode when initialMode prop changes (when switching from homepage)
  useEffect(() => {
    if (isOpen && hasOpened && mode !== initialMode) {
      // Switch mode with transition animation
      switchMode(initialMode);
    }
  }, [initialMode, isOpen, hasOpened, mode]);

  // Handle modal opening/closing animations
  useEffect(() => {
    if (isOpen && !hasOpened) {
      // First time opening - start entrance animation
      setIsOpening(true);
      setHasOpened(true);
      // Set the correct mode immediately
      setMode(initialMode);
      // Delay the content fade-in to match container animation
      setTimeout(() => {
        setIsOpening(false);
      }, 200); // Slightly shorter to prevent double animation
    } else if (!isOpen && hasOpened && !isClosing) {
      // Modal closing - start exit animation
      setIsClosing(true);
      // Delay the actual close to allow animation to complete
      setTimeout(() => {
        // Reset all states after animation
        setIsOpening(false);
        setIsClosing(false);
        setHasOpened(false);
        setMode(initialMode);
        setLoginData({ email: '', password: '' });
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        setError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        // Call the actual close function
        onClose();
      }, 300); // Match the animation duration
    }
  }, [isOpen, initialMode, hasOpened, isClosing, onClose]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateRegisterForm = () => {
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    setError('');

    const result = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password
    });
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!isClosing) {
            setIsClosing(true);
            setTimeout(() => {
              setIsOpening(false);
              setIsClosing(false);
              setHasOpened(false);
              setMode(initialMode);
              setLoginData({ email: '', password: '' });
              setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
              setError('');
              setShowPassword(false);
              setShowConfirmPassword(false);
              onClose();
            }, 300);
          }
        }}
      />
      
      {/* Modal Container */}
      <div className={`relative bg-gradient-to-br from-[#1a1a1a] to-[#262626] border border-[#374151]/50 rounded-2xl backdrop-blur-md transition-all duration-300 ease-out transform ${
        mode === 'register' ? 'w-full max-w-lg' : 'w-full max-w-md'
      } mx-4 ${
        isOpening || !hasOpened
          ? 'scale-95 opacity-0 translate-y-4' 
          : isClosing
          ? 'scale-95 opacity-0 translate-y-4'
          : 'scale-100 opacity-100 translate-y-0'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={() => {
            if (!isClosing) {
              setIsClosing(true);
              setTimeout(() => {
                setIsOpening(false);
                setIsClosing(false);
                setHasOpened(false);
                setMode(initialMode);
                setLoginData({ email: '', password: '' });
                setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
                setError('');
                setShowPassword(false);
                setShowConfirmPassword(false);
                onClose();
              }, 300);
            }
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className={`p-8 transition-all duration-300 ease-out ${
          isTransitioning || isOpening || !hasOpened || isClosing ? 'opacity-0' : 'opacity-100'
        }`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold text-white mb-2 transition-all duration-300 ${
              isTransitioning || isOpening || !hasOpened || isClosing ? 'transform translate-y-2' : 'transform translate-y-0'
            }`}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className={`text-gray-400 transition-all duration-300 ${
              isTransitioning || isOpening || !hasOpened || isClosing ? 'transform translate-y-2' : 'transform translate-y-0'
            }`}>
              {mode === 'login' ? 'Sign in to your account' : 'Join FindONE for personalized recommendations'}
            </p>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="transition-all duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#374151]/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="transition-all duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-black/40 border border-[#374151]/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="transition-all duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#374151]/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="transition-all duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#374151]/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="transition-all duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-black/40 border border-[#374151]/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="transition-all duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-black/40 border border-[#374151]/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-3 transition-all duration-300 ${
              isTransitioning || isOpening || !hasOpened || isClosing ? 'opacity-0' : 'opacity-100'
            }`}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className={`mt-6 text-center transition-all duration-300 ${
            isTransitioning || isOpening || !hasOpened || isClosing ? 'opacity-0' : 'opacity-100'
          }`}>
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 