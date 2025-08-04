import natural from 'natural';
const tokenizer = new natural.WordTokenizer();

class QueryUnderstandingService {
  constructor() {
    // Indian currency patterns and conversions
    this.currencyPatterns = {
      'lakh': (value) => value * 100000,
      'l': (value) => value * 100000,
      'thousand': (value) => value * 1000,
      'k': (value) => value * 1000,
      'rupees': (value) => value,
      'rs': (value) => value,
      '₹': (value) => value
    };

    // Indian English patterns and colloquial expressions
    this.indianPatterns = {
      'good camera': ['camera_quality', 'megapixels', 'camera_rating'],
      'great camera': ['camera_quality', 'megapixels', 'camera_rating'],
      'excellent camera': ['camera_quality', 'megapixels', 'camera_rating'],
      'long battery': ['battery_capacity', 'battery_life', 'battery_rating'],
      'good battery': ['battery_capacity', 'battery_life', 'battery_rating'],
      'fast performance': ['processor_rating', 'ram', 'performance_score'],
      'gaming': ['processor_rating', 'ram', 'gpu', 'gaming_performance'],
      'photography': ['camera_quality', 'megapixels', 'camera_features'],
      'student': ['battery_life', 'durability', 'price', 'performance'],
      'budget': ['price', 'value_for_money'],
      'premium': ['build_quality', 'premium_features', 'brand_reputation']
    };

    // Quality level mappings
    this.qualityLevels = {
      'excellent': { rating: 4.8, boost: 1.5, priority: 'ESSENTIAL' },
      'great': { rating: 4.5, boost: 1.3, priority: 'ESSENTIAL' },
      'good': { rating: 4.0, boost: 1.2, priority: 'PREFERRED' },
      'decent': { rating: 3.5, boost: 1.0, priority: 'NICE_TO_HAVE' },
      'best': { rating: 4.9, boost: 2.0, priority: 'ESSENTIAL' },
      'top': { rating: 4.7, boost: 1.4, priority: 'ESSENTIAL' }
    };
  }

  /**
   * Layer 1: User Input Capture and Query Normalization
   * @param {string} query - Raw user input
   * @returns {Object} Normalized query with extracted information
   */
  processUserInput(query) {
    try {
      console.log('🔍 Layer 1: Processing user input:', query);
      
      const normalizedQuery = this.normalizeQuery(query);
      const extractedInfo = this.extractBasicInfo(normalizedQuery);
      
      const result = {
        originalQuery: query,
        normalizedQuery: normalizedQuery,
        extractedInfo: extractedInfo,
        layer: 1,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Layer 1 Result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ Layer 1 Error:', error);
      return {
        originalQuery: query,
        normalizedQuery: query.toLowerCase(),
        extractedInfo: {},
        layer: 1,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Normalize query for Indian English patterns
   * @param {string} query - Raw query
   * @returns {string} Normalized query
   */
  normalizeQuery(query) {
    let normalized = query.toLowerCase().trim();
    
    // Handle Indian currency formats
    normalized = this.normalizeCurrencyFormats(normalized);
    
    // Handle common Indian English patterns
    normalized = this.normalizeIndianPatterns(normalized);
    
    // Remove extra spaces and normalize punctuation
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
  }

  /**
   * Normalize Indian currency formats
   * @param {string} text - Input text
   * @returns {string} Text with normalized currency
   */
  normalizeCurrencyFormats(text) {
    // Handle "50k", "50 thousand", "50k rupees" patterns
    text = text.replace(/(\d+)\s*k\s*(rupees?|rs)?/gi, '$1 thousand');
    text = text.replace(/(\d+)\s*lakh\s*(rupees?|rs)?/gi, '$1 lakh');
    text = text.replace(/(\d+)\s*l\s*(rupees?|rs)?/gi, '$1 lakh');
    
    // Handle "₹50k", "₹50000" patterns
    text = text.replace(/₹\s*(\d+)\s*k/gi, '$1 thousand');
    text = text.replace(/₹\s*(\d+)\s*l/gi, '$1 lakh');
    text = text.replace(/₹\s*(\d+)/gi, '$1');
    
    // Handle "under", "around", "between" patterns
    text = text.replace(/under\s+(\d+)/gi, 'max $1');
    text = text.replace(/around\s+(\d+)/gi, 'target $1');
    text = text.replace(/between\s+(\d+)\s*-\s*(\d+)/gi, 'range $1 to $2');
    
    // Also handle dash ranges without "between"
    text = text.replace(/(\d+)\s*-\s*(\d+)\s*(thousand|lakh|k|l)/gi, 'range $1 to $2 $3');
    
    // Fix spacing issues after currency normalization
    text = text.replace(/(\d+)\s*(thousand|lakh)(\w)/gi, '$1 $2 $3');
    
    // Fix duplicate "akh" issue
    text = text.replace(/lakh\s+akh/gi, 'lakh');
    
    return text;
  }

  /**
   * Normalize Indian English patterns
   * @param {string} text - Input text
   * @returns {string} Normalized text
   */
  normalizeIndianPatterns(text) {
    // Handle common Indian expressions
    const patterns = {
      'i want': 'need',
      'i need': 'need',
      'looking for': 'need',
      'searching for': 'need',
      'show me': 'need',
      'get me': 'need',
      'please suggest': 'need',
      'can you suggest': 'need',
      'would be nice': 'preferred',
      'nice to have': 'preferred',
      'must have': 'essential',
      'should have': 'preferred'
    };

    Object.entries(patterns).forEach(([pattern, replacement]) => {
      text = text.replace(new RegExp(pattern, 'gi'), replacement);
    });

    return text;
  }

  /**
   * Extract basic information from normalized query
   * @param {string} normalizedQuery - Normalized query
   * @returns {Object} Extracted information
   */
  extractBasicInfo(normalizedQuery) {
    const info = {
      budget: this.extractBudget(normalizedQuery),
      features: this.extractFeatures(normalizedQuery),
      qualityLevels: this.extractQualityLevels(normalizedQuery),
      useCase: this.extractUseCase(normalizedQuery),
      brand: this.extractBrand(normalizedQuery)
    };

    return info;
  }

  /**
   * Extract budget information
   * @param {string} query - Normalized query
   * @returns {Object} Budget information
   */
  extractBudget(query) {
    const budget = {
      min: null,
      max: null,
      target: null,
      type: null // 'range', 'max', 'target', 'flexible'
    };

    // Extract numeric values with currency patterns
    const numberPattern = /(\d+(?:\.\d+)?)\s*(thousand|lakh|k|l)/gi;
    const matches = [...query.matchAll(numberPattern)];
    
    if (matches.length === 0) {
      // Try simple number extraction
      const simpleNumbers = query.match(/(\d+(?:\.\d+)?)/g);
      if (simpleNumbers) {
        const numbers = simpleNumbers.map(n => parseInt(n)).filter(n => n > 1000);
        if (numbers.length > 0) {
          budget.target = Math.max(...numbers);
          budget.type = 'target';
        }
      }
      return budget;
    }

    const numbers = matches.map(match => {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      return this.currencyPatterns[unit] ? this.currencyPatterns[unit](value) : value * 1000;
    });

    // Handle range extraction properly
    if (query.includes('range') || query.includes('between')) {
      const rangeMatches = query.match(/(\d+)\s*(thousand|lakh|k|l)\s*to\s*(\d+)\s*(thousand|lakh|k|l)/gi);
      if (rangeMatches) {
        const rangeMatch = rangeMatches[0];
        const parts = rangeMatch.match(/(\d+)\s*(thousand|lakh|k|l)\s*to\s*(\d+)\s*(thousand|lakh|k|l)/i);
        if (parts) {
          const minValue = parseFloat(parts[1]);
          const minUnit = parts[2].toLowerCase();
          const maxValue = parseFloat(parts[3]);
          const maxUnit = parts[4].toLowerCase();
          
          budget.min = this.currencyPatterns[minUnit] ? this.currencyPatterns[minUnit](minValue) : minValue * 1000;
          budget.max = this.currencyPatterns[maxUnit] ? this.currencyPatterns[maxUnit](maxValue) : maxValue * 1000;
          budget.type = 'range';
          return budget;
        }
      }
      
      // If the above didn't work, try a simpler approach for ranges
      const simpleRangeMatch = query.match(/range\s+(\d+)\s+to\s+(\d+)\s+(thousand|lakh)/i);
      if (simpleRangeMatch) {
        const minValue = parseFloat(simpleRangeMatch[1]);
        const maxValue = parseFloat(simpleRangeMatch[2]);
        const unit = simpleRangeMatch[3].toLowerCase();
        const multiplier = this.currencyPatterns[unit] ? this.currencyPatterns[unit](1) : 1000;
        
        budget.min = minValue * multiplier;
        budget.max = maxValue * multiplier;
        budget.type = 'range';
        return budget;
      }
    }

    // Determine budget type and values
    if (query.includes('range') || query.includes('between')) {
      budget.min = Math.min(...numbers);
      budget.max = Math.max(...numbers);
      budget.type = 'range';
    } else if (query.includes('max') || query.includes('under')) {
      budget.max = Math.max(...numbers);
      budget.type = 'max';
    } else if (query.includes('target') || query.includes('around')) {
      budget.target = numbers[0];
      budget.type = 'target';
    } else {
      budget.target = numbers[0];
      budget.type = 'flexible';
    }

    return budget;
  }

  /**
   * Extract feature requirements
   * @param {string} query - Normalized query
   * @returns {Array} Feature requirements
   */
  extractFeatures(query) {
    const features = [];
    
    Object.entries(this.indianPatterns).forEach(([pattern, featureList]) => {
      if (query.includes(pattern)) {
        features.push({
          pattern: pattern,
          features: featureList,
          priority: this.getFeaturePriority(query, pattern)
        });
      }
    });

    return features;
  }

  /**
   * Extract quality levels from query
   * @param {string} query - Normalized query
   * @returns {Array} Quality level requirements
   */
  extractQualityLevels(query) {
    const qualityLevels = [];
    
    Object.entries(this.qualityLevels).forEach(([level, config]) => {
      if (query.includes(level)) {
        qualityLevels.push({
          level: level,
          rating: config.rating,
          boost: config.boost,
          priority: config.priority
        });
      }
    });

    return qualityLevels;
  }

  /**
   * Extract use case from query
   * @param {string} query - Normalized query
   * @returns {string} Use case
   */
  extractUseCase(query) {
    const useCases = {
      'gaming': 'gaming',
      'photography': 'photography',
      'student': 'student',
      'business': 'business',
      'work': 'business',
      'professional': 'business',
      'casual': 'casual',
      'daily use': 'casual'
    };

    for (const [pattern, useCase] of Object.entries(useCases)) {
      if (query.includes(pattern)) {
        return useCase;
      }
    }

    return 'general';
  }

  /**
   * Extract brand preference
   * @param {string} query - Normalized query
   * @returns {string} Brand name
   */
  extractBrand(query) {
    const brands = [
      'samsung', 'apple', 'iphone', 'google', 'pixel', 'xiaomi', 'oneplus', 
      'oppo', 'vivo', 'realme', 'nokia', 'motorola', 'asus', 'lenovo'
    ];

    for (const brand of brands) {
      if (query.includes(brand)) {
        return brand;
      }
    }

    return null;
  }

  /**
   * Get feature priority based on linguistic cues
   * @param {string} query - Normalized query
   * @param {string} feature - Feature pattern
   * @returns {string} Priority level
   */
  getFeaturePriority(query, feature) {
    if (query.includes('must have') || query.includes('essential')) {
      return 'ESSENTIAL';
    } else if (query.includes('preferred') || query.includes('nice to have')) {
      return 'PREFERRED';
    } else if (query.includes('need') || query.includes('want')) {
      return 'ESSENTIAL';
    } else {
      return 'NICE_TO_HAVE';
    }
  }
}

export default QueryUnderstandingService; 