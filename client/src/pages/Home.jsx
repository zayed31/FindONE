import React, { useState, useEffect } from 'react';
import { Search, Upload, Mic, Filter, Sparkles, TrendingUp, Star, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import AuthModal from '../components/auth/AuthModal';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchHistory, setSearchHistory] = useState([
    'iPhone 15 Pro', 'MacBook Air M2', 'Sony WH-1000XM5', 'Nike Air Max'
  ]);

  const { user, logout, isAuthenticated } = useAuth();
  const { results, query } = useSearch();

  // Sample featured products for demonstration
  const featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 1199,
      originalPrice: 1299,
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      platform: 'Apple Store',
      isAIRecommended: true
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 1099,
      originalPrice: 1199,
      rating: 4.9,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      platform: 'Amazon',
      isAIRecommended: true
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      price: 349,
      originalPrice: 399,
      rating: 4.7,
      reviews: 2156,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      platform: 'Best Buy',
      isAIRecommended: false
    },
    {
      id: 4,
      name: 'Nike Air Max 270',
      price: 150,
      originalPrice: 180,
      rating: 4.6,
      reviews: 3421,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      platform: 'Nike',
      isAIRecommended: true
    }
  ];

  const handleSaveProduct = (product) => {
    // TODO: Implement save product functionality
    console.log('Saving product:', product);
  };

  const handleViewProduct = (product) => {
    // TODO: Implement view product functionality
    console.log('Viewing product:', product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#1a1a1a] to-[#262626] text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-black/20 border-b border-[#374151]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
          <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <Sparkles className="w-6 h-6" />
            </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                FindONE
            </span>
          </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">
                About
              </a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                Contact
              </a>
        </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-300 hover:text-white transition-colors duration-200">
                    <Heart className="w-5 h-5" />
            </button>
                  <button className="p-2 text-gray-300 hover:text-white transition-colors duration-200">
                    <ShoppingCart className="w-5 h-5" />
            </button>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-teal-500/20 hover:from-purple-500/30 hover:to-teal-500/30 px-4 py-2 rounded-lg border border-purple-500/30 transition-all duration-200">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.name || 'Profile'}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border-b border-[#374151]/50">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#about" className="block text-gray-300 hover:text-white transition-colors duration-200">
                About
              </a>
              <a href="#contact" className="block text-gray-300 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with Search */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Hero Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 bg-clip-text text-transparent">
                  Discover Products
                </span>
                <br />
                <span className="text-white">with AI Intelligence</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Find the perfect products using our advanced AI-powered search. 
                Get personalized recommendations, compare prices, and discover hidden gems.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <SearchBar />
            </motion.div>

            {/* Quick Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys'].map((category, index) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/50 hover:text-white transition-all duration-200 text-sm"
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Search Results Section */}
        {results.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-7xl mx-auto">
              <SearchResults 
                onSaveProduct={handleSaveProduct}
                onViewProduct={handleViewProduct}
              />
        </div>
      </section>
        )}

        {/* Featured Products Section (when no search results) */}
        {results.length === 0 && !query && (
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Featured Products
          </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Discover trending products handpicked by our AI algorithm
                </p>
              </motion.div>

              {/* Featured Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-900">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {product.isAIRecommended && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-xs rounded-full backdrop-blur-sm">
                            AI Recommended
                          </span>
                    </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-white font-medium text-sm mb-2 group-hover:text-purple-300 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-500'
                              }`}
                            />
                          ))}
                  </div>
                        <span className="text-gray-400 text-xs">
                          ({product.rating})
                        </span>
            </div>
            
                      {/* Price */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-purple-400 font-semibold text-sm">
                            ${product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-gray-500 text-xs line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs">
                          {product.platform}
                        </span>
                  </div>

                      {/* Reviews */}
                      <p className="text-gray-400 text-xs">
                        {product.reviews.toLocaleString()} reviews
                      </p>
                </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
        )}

        {/* Features Section */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Choose FindONE?
          </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experience the future of product discovery with our cutting-edge features
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: 'AI-Powered Search',
                  description: 'Advanced algorithms that understand your preferences and find the perfect products.'
                },
                {
                  icon: TrendingUp,
                  title: 'Real-time Analysis',
                  description: 'Get live price comparisons and market trends across multiple platforms.'
                },
                {
                  icon: Heart,
                  title: 'Personalized Recommendations',
                  description: 'Discover products tailored to your unique taste and shopping history.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
          </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSwitchMode={(newMode) => setAuthMode(newMode)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home; 