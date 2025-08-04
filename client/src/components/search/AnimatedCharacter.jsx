import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../context/SearchContext';

const AnimatedCharacter = ({ 
  isSearchFocused, 
  isSearching, 
  searchBarRef,
  onCharacterAction,
  triggerExcitement
}) => {
  const [characterState, setCharacterState] = useState('idle'); // idle, peeking, excited
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef(null);
  const lastActionTime = useRef(Date.now());
  
  const { characterSettings } = useSearch();

  // Character dimensions and search bar boundaries
  const idleSize = 90;
  const excitedSize = 85; // Slightly larger for excited state
  const searchBarHeight = 80;
  const searchBarWidth = 800; // Approximate width
  const peekHeight = idleSize * 0.4; // Only show 40% of the character when peeking

  // Character image URLs - using both idle and excited images
  const characterImages = {
    idle: '/characters/red-idle.png',
    excited: '/characters/red-excited.png'
  };

  // Fallback character (if images don't load) - improved SVG
  const renderFallbackCharacter = () => {
    const currentSize = characterStates[characterState]?.size || idleSize;
    return (
      <svg
        width={currentSize}
        height={currentSize}
        viewBox="0 0 80 80"
        className="cursor-pointer"
        onClick={handleCharacterClick}
      >
      {/* Body (red circle with better proportions) */}
      <circle
        cx="40"
        cy="40"
        r="32"
        fill="#FF4444"
        stroke="#CC3333"
        strokeWidth="3"
      />
      
      {/* Belly (lighter red) */}
      <circle
        cx="40"
        cy="48"
        r="20"
        fill="#FF6666"
      />
      
      {/* Eyes (more expressive) */}
      <circle cx="32" cy="32" r="4" fill="white" />
      <circle cx="48" cy="32" r="4" fill="white" />
      <circle cx="32" cy="32" r="2" fill="black" />
      <circle cx="48" cy="32" r="2" fill="black" />
      
      {/* Eyebrows (angry expression) */}
      <path
        d="M 26 26 Q 32 24 38 26"
        stroke="black"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 42 26 Q 48 24 54 26"
        stroke="black"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Beak (larger and more prominent) */}
      <polygon
        points="36,40 44,40 40,50"
        fill="#FFAA00"
        stroke="#CC8800"
        strokeWidth="2"
      />
      
      {/* Wings (when walking) */}
      {characterState === 'walking' && (
        <>
          <ellipse
            cx="20"
            cy="40"
            rx="12"
            ry="16"
            fill="#FF4444"
            stroke="#CC3333"
            strokeWidth="2"
          />
          <ellipse
            cx="60"
            cy="40"
            rx="12"
            ry="16"
            fill="#FF4444"
            stroke="#CC3333"
            strokeWidth="2"
          />
        </>
      )}
      
      {/* Z's for sleeping */}
      {characterState === 'sleeping' && (
        <>
          <text x="50" y="20" fill="white" fontSize="16" fontWeight="bold">Z</text>
          <text x="58" y="16" fill="white" fontSize="14" fontWeight="bold">Z</text>
          <text x="66" y="12" fill="white" fontSize="12" fontWeight="bold">Z</text>
        </>
      )}
    </svg>
    );
  };

  // Animation states with different positions and sizes for each state
  const characterStates = {
    hidden: {
      y: 0, // Fully hidden behind search bar
      size: idleSize,
      left: '0px', // Centered
      top: '-40px',
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    },
    peeking: {
      y: -peekHeight, // Peeking up from behind
      size: idleSize,
      left: '0px', // Centered
      top: '-40px',
      transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
    },
    idle: {
      y: -idleSize, // Fully visible on search bar
      size: idleSize,
      left: '0px', // Centered
      top: '20px',
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    },
    excited: {
      y: -excitedSize, // Fully visible on search bar (adjusted for larger size)
      size: excitedSize,
      left: '0px', // Centered for larger size
      top: '-15px', // Adjusted for larger size
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  // Character behavior logic - simplified peek-a-boo with idle state
  useEffect(() => {
    // Don't show character if disabled
    if (!characterSettings.enabled) {
      setIsVisible(false);
      return;
    }

    // DEBUG: Force character to appear immediately for testing
    if (!isVisible) {
      setTimeout(() => {
        setIsVisible(true);
        setCharacterState('peeking');
        lastActionTime.current = Date.now();
      }, 1000); // Show after 1 second
    }

    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime.current;

    // Calculate frequency based on settings - INCREASED for better visibility
    const frequencyMultiplier = {
      low: 0.15,      // Increased from 0.05
      normal: 0.3,    // Increased from 0.1
      high: 0.5       // Increased from 0.2
    }[characterSettings.frequency] || 0.3;

    // Show character randomly - REDUCED wait time
    if (!isVisible && Math.random() < frequencyMultiplier && timeSinceLastAction > 2000) {
      setIsVisible(true);
      setCharacterState('peeking');
      lastActionTime.current = now;
      
      // After peeking, transition to idle state on search bar
      setTimeout(() => {
        setCharacterState('idle');
      }, 1500 + Math.random() * 1000); // Peek for 1.5-2.5 seconds, then stay idle
    }
  }, [isVisible, characterSettings]);

  // Listen for search bar focus to trigger excited state
  useEffect(() => {
    if (isSearchFocused && isVisible && characterState === 'idle') {
      setCharacterState('excited');
      // No automatic timeout - stays excited while focused
    }
  }, [isSearchFocused, isVisible, characterState]);

  // Return to idle when search bar loses focus
  useEffect(() => {
    if (!isSearchFocused && isVisible && characterState === 'excited') {
      setCharacterState('idle');
    }
  }, [isSearchFocused, isVisible, characterState]);

  // Trigger excitement when search bar is clicked
  useEffect(() => {
    if (triggerExcitement && isVisible) {
      console.log('🎯 Character excitement triggered! Current state:', characterState);
      setCharacterState('excited');
      // No automatic timeout - stays excited until search bar loses focus
    }
  }, [triggerExcitement, isVisible]);

  // Remove walking animation - not needed for peek-a-boo style

  // Character click handler
  const handleCharacterClick = () => {
    if (onCharacterAction) {
      onCharacterAction();
    }
    
    // Trigger excited animation - stays excited until search bar loses focus
    setCharacterState('excited');
  };

  // Render character with state-based image selection and dynamic sizing
  const renderCharacter = () => {
    const getImageSrc = () => {
      if (characterState === 'excited') {
        return characterImages.excited;
      }
      return characterImages.idle; // Default to idle for peeking and idle states
    };

    const currentImage = getImageSrc();
    const currentSize = characterStates[characterState].size;
    console.log('🖼️ Rendering character with image:', currentImage, 'State:', characterState, 'Size:', currentSize);

    return (
      <div className="relative">
        <img
          src={currentImage}
          alt={`RED ${characterState}`}
          width={currentSize}
          height={currentSize}
          className="cursor-pointer"
          style={{
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `scale(${currentSize / idleSize})`,
            filter: characterState === 'excited' ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)',
          }}
          onClick={handleCharacterClick}
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none' }}>
          {renderFallbackCharacter()}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            left: characterStates[characterState].left,
            top: characterStates[characterState].top,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ 
            opacity: 1, 
            y: characterStates[characterState].y
          }}
          exit={{ opacity: 0, y: 0 }}
          transition={characterStates[characterState].transition}
        >
          {/* Character */}
          <div className="relative">
            {renderCharacter()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedCharacter; 