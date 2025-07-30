/**
 * Extract domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - The extracted domain
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    // Fallback for malformed URLs
    const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    return domainMatch ? domainMatch[1] : url;
  }
};

/**
 * Extract price from text using various patterns
 * @param {string} text - Text to extract price from
 * @returns {string|null} - Extracted price or null
 */
export const extractPrice = (text) => {
  if (!text) return null;
  
  // Indian Rupee patterns
  const patterns = [
    /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs|rupees?|inr)/i,
    /price[:\s]*₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].includes('₹') ? match[0] : `₹${match[1]}`;
    }
  }
  
  return null;
};

/**
 * Extract rating from text
 * @param {string} text - Text to extract rating from
 * @returns {string|null} - Extracted rating or null
 */
export const extractRating = (text) => {
  if (!text) return null;
  
  const patterns = [
    /(\d+(?:\.\d+)?)\s*★/i,
    /rating[:\s]*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*out\s*of\s*5/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Extract review count from text
 * @param {string} text - Text to extract review count from
 * @returns {number|null} - Extracted review count or null
 */
export const extractReviewCount = (text) => {
  if (!text) return null;
  
  const patterns = [
    /(\d+(?:,\d+)*)\s*reviews?/i,
    /(\d+(?:,\d+)*)\s*ratings?/i,
    /(\d+(?:,\d+)*)\s*customers?/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
  }
  
  return null;
};

/**
 * Extract GTIN/ASIN from URL or text
 * @param {string} text - Text to extract GTIN from
 * @returns {string|null} - Extracted GTIN or null
 */
export const extractGTIN = (text) => {
  if (!text) return null;
  
  const patterns = [
    /[A-Z0-9]{10}/, // ASIN pattern
    /\b\d{13}\b/, // GTIN-13 pattern
    /\b\d{12}\b/, // GTIN-12 pattern
    /\b\d{14}\b/  // GTIN-14 pattern
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
};

/**
 * Determine product availability from text
 * @param {string} text - Text to analyze
 * @returns {string} - Availability status
 */
export const determineAvailability = (text) => {
  if (!text) return 'unknown';
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('out of stock') || 
      lowerText.includes('unavailable') || 
      lowerText.includes('sold out')) {
    return 'out_of_stock';
  }
  
  if (lowerText.includes('in stock') || 
      lowerText.includes('available') || 
      lowerText.includes('buy now')) {
    return 'in_stock';
  }
  
  return 'unknown';
};

/**
 * Infer product category from title and description
 * @param {string} title - Product title
 * @param {string} description - Product description
 * @returns {string} - Inferred category
 */
export const inferCategory = (title, description) => {
  const text = (title + ' ' + description).toLowerCase();
  
  const categories = {
    'Smartphones': ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy', 'pixel'],
    'Laptops': ['laptop', 'notebook', 'macbook', 'dell', 'hp', 'lenovo'],
    'Headphones': ['headphone', 'earphone', 'earbud', 'airpods', 'headset'],
    'Cameras': ['camera', 'dslr', 'mirrorless', 'canon', 'nikon', 'sony'],
    'TVs': ['tv', 'television', 'smart tv', 'led tv', 'oled'],
    'Tablets': ['tablet', 'ipad', 'android tablet'],
    'Watches': ['watch', 'smartwatch', 'fitness tracker', 'apple watch'],
    'Gaming': ['gaming', 'console', 'playstation', 'xbox', 'nintendo'],
    'Audio': ['speaker', 'bluetooth', 'sound', 'audio'],
    'Accessories': ['case', 'cover', 'charger', 'cable', 'adapter']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'Electronics';
};

/**
 * Clean and normalize text
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s₹.,!?-]/g, '') // Remove special characters except common ones
    .trim();
};

/**
 * Generate a cache key for search queries
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {string} - Cache key
 */
export const generateCacheKey = (query, options = {}) => {
  const normalizedQuery = query.toLowerCase().trim();
  const optionsStr = JSON.stringify(options);
  return `${normalizedQuery}_${optionsStr}`;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format price for display
 * @param {string|number} price - Price to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, currency = 'INR') => {
  if (!price) return 'Price not available';
  
  const numericPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
  if (isNaN(numericPrice)) return 'Price not available';
  
  if (currency === 'INR') {
    return `₹${numericPrice.toLocaleString('en-IN')}`;
  }
  
  return `${currency} ${numericPrice.toLocaleString()}`;
};

/**
 * Calculate similarity between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for API calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}; 