import React, { useState, useEffect } from 'react';
import { Search, Upload, Mic, Filter, Sparkles, TrendingUp, Star, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchHistory, setSearchHistory] = useState([
    'iPhone 15 Pro', 'MacBook Air M2', 'Sony WH-1000XM5', 'Nike Air Max'
  ]);

  const { user, logout, isAuthenticated } = useAuth();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement image search
      console.log('Image uploaded:', file);
    }
  };

  const handleVoiceSearch = () => {
    // TODO: Implement voice search
    console.log('Voice search activated');
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

      {/* Hero Section with Search */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center mb-16">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent">
            Find Your Perfect Product
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            AI-powered product discovery with real-time price comparison across multiple platforms
          </p>

          {/* Main Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <div className={`relative bg-black/40 backdrop-blur-md border-2 rounded-2xl p-2 transition-all duration-300 ${
                isSearchFocused 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : 'border-[#374151]/50 hover:border-[#374151]'
              }`}>
                <div className="flex items-center space-x-4">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center space-x-3">
                    <Search className="w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for products, brands, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                    />
                  </div>

                  {/* Search Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Image Upload */}
                    <label className="p-3 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer hover:bg-white/10 rounded-xl">
                      <Upload className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Voice Search */}
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      className="p-3 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-xl"
                    >
                      <Mic className="w-5 h-5" />
            </button>
            
                    {/* Search Button */}
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search</span>
            </button>
                  </div>
                </div>
              </div>
            </form>
              </div>
              
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 flex-wrap">
                <span className="text-gray-400 text-sm">Recent searches:</span>
                {searchHistory.slice(0, 4).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(item)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-4 flex-wrap">
            <span className="text-gray-400 text-sm">Popular categories:</span>
            {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty'].map((category, index) => (
              <button
                  key={index}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            AI-Powered Recommendations
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Discover products tailored to your preferences with our advanced AI recommendation engine
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
                  <div
              key={product.id}
              className="group bg-black/40 backdrop-blur-md border border-[#374151]/50 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Product Image */}
              <div className="relative mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {product.isAIRecommended && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-teal-500 px-2 py-1 rounded-full text-xs font-medium">
                    AI Recommended
                  </div>
                )}
                <button className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-gray-300 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <Heart className="w-4 h-4" />
                </button>
            </div>
            
              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors duration-200">
                  {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-white">${product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Platform */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{product.platform}</span>
                  <button className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 px-3 py-1 rounded-lg text-sm transition-all duration-200 transform hover:scale-105">
                    View Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            Why Choose FindONE?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: 'AI-Powered Search',
              description: 'Advanced NLP and machine learning for intelligent product discovery'
            },
            {
              icon: TrendingUp,
              title: 'Real-Time Comparison',
              description: 'Live price tracking across multiple e-commerce platforms'
            },
            {
              icon: Filter,
              title: 'Smart Filtering',
              description: 'Personalized recommendations based on your preferences and behavior'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-md border border-[#374151]/50 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
          </div>
          ))}
        </div>
      </section>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default Home; 