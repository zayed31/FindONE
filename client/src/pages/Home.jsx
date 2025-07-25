import React, { useState, useEffect } from 'react';
import { Search, Image, Mic, TrendingUp, Zap, Shield, Filter, BarChart3, Brain, Clock, Star, ChevronRight, Play, Upload, DollarSign } from 'lucide-react';

const AIProductRecommendationLanding = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Brain, title: "AI-Powered NLP", desc: "Context-aware recommendations using advanced Natural Language Processing" },
    { icon: Image, title: "Visual Search", desc: "Upload images for AI-driven product recognition and discovery" },
    { icon: BarChart3, title: "Real-Time Analysis", desc: "Live sentiment analysis and price comparison across platforms" },
    { icon: TrendingUp, title: "Dynamic Learning", desc: "Adaptive algorithms that learn from user behavior and preferences" }
  ];

  const stats = [
    { value: "99.9%", label: "Real-Time Accuracy", icon: Clock },
    { value: "50+", label: "E-commerce Platforms", icon: Shield },
    { value: "∞", label: "Product Database", icon: Zap },
    { value: "AI", label: "Powered Intelligence", icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Cursor trail effect */}
      <div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)',
          transition: 'all 0.1s ease-out'
        }}
      />

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Find One
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            {['Features', 'Technology', 'Demo', 'Contact'].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-purple-300 transition-colors duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-16">
          <div className="inline-block animate-bounce mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              AI-Powered
            </span>
            <br />
            <span className="text-white transform hover:scale-105 transition-transform duration-300 inline-block">
              Product Discovery
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Revolutionary real-time recommendation system that eliminates static databases, 
            leveraging <span className="text-purple-400 font-semibold">Google Search API</span>, 
            <span className="text-pink-400 font-semibold"> OpenAI</span>, and 
            <span className="text-orange-400 font-semibold"> advanced NLP</span> for intelligent product discovery
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25">
              <span className="flex items-center">
                <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Experience the Demo
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur group-hover:blur-lg transition-all duration-300 -z-10" />
            </button>
            
            <button className="group border-2 border-purple-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-400 hover:text-slate-900 transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center">
                Learn More
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Floating feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                  currentFeature === index ? 'ring-2 ring-purple-400 bg-white/20' : ''
                }`}
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.desc}</p>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
              </div>
            );
          })}
        </div>

        {/* Interactive demo preview */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-400/50 transition-all duration-500 group">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6 text-center">Multi-Modal Search Interface</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group/item text-center p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/item:rotate-12 transition-transform duration-300">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Text Search</h4>
                <p className="text-sm text-gray-400">NLP-powered semantic understanding</p>
              </div>
              
              <div className="group/item text-center p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/item:rotate-12 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Image Upload</h4>
                <p className="text-sm text-gray-400">AI-driven visual recognition</p>
              </div>
              
              <div className="group/item text-center p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/item:rotate-12 transition-transform duration-300">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Voice Search</h4>
                <p className="text-sm text-gray-400">Natural language processing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="relative z-10 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center group hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features showcase */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Revolutionary Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                { icon: Brain, title: "AI-Powered Personalization", desc: "Machine learning algorithms analyze user behavior for dynamic, tailored recommendations" },
                { icon: DollarSign, title: "Real-Time Price Comparison", desc: "Automated price tracking across 50+ e-commerce platforms for the best deals" },
                { icon: Shield, title: "Sentiment Analysis", desc: "AI processes customer reviews to assess product credibility and quality" },
                { icon: Filter, title: "Smart Filtering & Sorting", desc: "Advanced filtering by price, ratings, brand, and category with AI assistance" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 group hover:translate-x-4 transition-transform duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-xl border border-white/10 flex items-center justify-center group hover:scale-105 transition-transform duration-500">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-lg text-gray-300">Interactive Demo Coming Soon</p>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ready to Transform Product Discovery?
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Experience the future of AI-powered recommendations with real-time data, 
            intelligent analysis, and personalized insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-5 rounded-full text-xl font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25">
              <span className="flex items-center justify-center">
                Get Started Now
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur group-hover:blur-lg transition-all duration-300 -z-10" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">Find One</span>
          </div>
          <p className="text-gray-400">
            Revolutionizing product discovery through AI-powered intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AIProductRecommendationLanding; 