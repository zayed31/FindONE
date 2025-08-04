import { useState, useEffect, useRef } from 'react';
import { Search, Mic, Camera, X, Loader2, Settings } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCharacter from './AnimatedCharacter';
import CharacterSettings from './CharacterSettings';

const SearchBar = ({ onSearch, className = '' }) => {
  const {
    query,
    suggestions,
    suggestionsLoading,
    trending,
    setQuery,
    getSuggestions,
    searchProducts,
    clearSearch
  } = useSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [triggerCharacterExcitement, setTriggerCharacterExcitement] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchBarRef = useRef(null);

  // Debounced suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() && isFocused) {
        getSuggestions(query);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isFocused, getSuggestions]);

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchProducts(searchQuery);
      setShowSuggestions(false);
      setIsFocused(false);
      onSearch?.(searchQuery);
      
      // Reset searching state after a delay
      setTimeout(() => {
        setIsSearching(false);
      }, 2000);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle trending click
  const handleTrendingClick = (trend) => {
    setQuery(trend);
    handleSearch(trend);
  };

  // Handle voice search (placeholder)
  const handleVoiceSearch = () => {
    setIsListening(true);
    // TODO: Implement actual voice recognition
    setTimeout(() => {
      setIsListening(false);
      // For now, just add a placeholder
      setQuery('voice search coming soon');
    }, 2000);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // TODO: Implement image search
      setTimeout(() => {
        setIsUploading(false);
        setQuery('image search coming soon');
      }, 2000);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  // Handle character action
  const handleCharacterAction = () => {
    // Focus the search input when character is clicked
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Handle search bar click to trigger character excitement
  const handleSearchBarClick = () => {
    console.log('🔍 Search bar clicked! Triggering character excitement...');
    // Trigger character excitement when search bar is clicked
    setTriggerCharacterExcitement(true);
    // Reset after a short delay
    setTimeout(() => {
      setTriggerCharacterExcitement(false);
    }, 100);
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Animated Character */}
      <AnimatedCharacter
        isSearchFocused={isFocused}
        isSearching={isSearching}
        searchBarRef={searchBarRef}
        onCharacterAction={handleCharacterAction}
        triggerExcitement={triggerCharacterExcitement}
      />
      
      {/* Main Search Input */}
      <div className="relative" ref={searchBarRef}>
        <motion.div
          className={`relative flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl transition-all duration-300 cursor-pointer ${
            isFocused 
              ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
              : 'hover:border-gray-600/50'
          }`}
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused 
              ? '0 0 30px rgba(139, 92, 246, 0.3)' 
              : '0 0 0px rgba(139, 92, 246, 0)'
          }}
          onClick={handleSearchBarClick}
        >
          {/* Search Icon */}
          <div className="pl-4 pr-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyPress}
            placeholder="Search for products, brands, or categories..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 py-4 pr-4 focus:outline-none text-lg"
          />

          {/* Action Buttons */}
          <div className="flex items-center pr-4 space-x-2">
            {/* Voice Search */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
              }`}
            >
              {isListening ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </motion.button>

            {/* Image Upload */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`p-2 rounded-full transition-colors ${
                isUploading 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </motion.button>

            {/* Character Settings */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300 transition-colors"
              title="Character Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            {/* Clear Button */}
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuery('');
                  clearSearch();
                  inputRef.current?.focus();
                }}
                className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-400 px-3 py-2 font-medium">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center space-x-3"
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                    <span>{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {suggestionsLoading && (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
                <p className="text-gray-400 text-sm mt-2">Finding suggestions...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending Searches */}
      {!isFocused && !query && trending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="text-center mb-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Trending Searches</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {trending.slice(0, 8).map((trend, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTrendingClick(trend)}
                  className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/50 hover:text-white transition-all duration-200 text-sm"
                >
                  {trend}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Character Settings Modal */}
      <CharacterSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default SearchBar; 