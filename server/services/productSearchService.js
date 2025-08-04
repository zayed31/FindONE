import axios from 'axios';
import { extractDomain } from '../utils/helpers.js';
import GoogleShoppingService from './googleShoppingService.js';
import MLClassificationService from './mlClassificationService.js';
import HierarchicalRetrievalService from './hierarchicalRetrievalService.js';
import SemanticMatchingService from './semanticMatchingService.js';
import AdvancedFilteringService from './advancedFilteringService.js';

// Configuration
const CONFIG = {
  MIN_RESULTS: 5, // Reduced from 10 to 5
  TOP_N: 20,
  CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  API_TIMEOUT: 10000,
  MAX_RETRIES: 3
};

// Product search cache
const searchCache = new Map();

/**
 * 1. Query Understanding Layer
 */
class QueryUnderstandingLayer {
  constructor() {
    // Initialize ML Classification Service
    this.mlClassifier = new MLClassificationService();
    // Enhanced product categories with detailed mappings
    this.productCategories = {
      'mobile_phones': {
        keywords: ['smartphone', 'phone', 'mobile', 'cell', 'galaxy', 'iphone', 'pixel', 'oneplus', 'xiaomi', 'oppo', 'vivo'],
        brands: ['samsung', 'apple', 'google', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'motorola'],
        models: {
          'samsung': ['galaxy s', 'galaxy note', 'galaxy a', 'galaxy m', 'galaxy z'],
          'apple': ['iphone', 'ipad'],
          'google': ['pixel'],
          'oneplus': ['oneplus'],
          'xiaomi': ['mi', 'redmi', 'poco'],
          'oppo': ['find x', 'reno', 'a series'],
          'vivo': ['x series', 'v series', 'y series']
        }
      },
      'home_appliances': {
        keywords: ['washing machine', 'refrigerator', 'microwave', 'dishwasher', 'dryer', 'oven', 'stove', 'ac', 'air conditioner'],
        brands: ['samsung', 'lg', 'whirlpool', 'bosch', 'haier', 'godrej', 'voltas'],
        models: {
          'samsung': ['ecobubble', 'addwash', 'quickdrive'],
          'lg': ['twinwash', 'inverter', 'side by side'],
          'whirlpool': ['intellisense', 'steam care']
        }
      },
      'electronics': {
        keywords: ['tv', 'television', 'monitor', 'speaker', 'headphones', 'earbuds', 'camera', 'gaming'],
        brands: ['samsung', 'lg', 'sony', 'bose', 'jbl', 'canon', 'nikon'],
        models: {
          'samsung': ['qled', 'oled', 'crystal uhd'],
          'lg': ['oled', 'nano cell', 'webos'],
          'sony': ['bravia', 'xperia']
        }
      },
      'computers': {
        keywords: ['laptop', 'desktop', 'tablet', 'computer', 'pc', 'macbook', 'chromebook'],
        brands: ['apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'samsung'],
        models: {
          'apple': ['macbook air', 'macbook pro', 'imac', 'mac mini'],
          'dell': ['inspiron', 'xps', 'latitude', 'precision'],
          'hp': ['pavilion', 'envy', 'spectre', 'omen']
        }
      }
    };

    // Enhanced synonyms with category-specific mappings
    this.synonyms = {
      'cell-phone': ['mobile phone', 'smartphone', 'phone', 'handset'],
      'mobile': ['cell phone', 'smartphone', 'phone', 'handset'],
      'laptop': ['notebook', 'computer', 'portable computer'],
      'headphones': ['earphones', 'earbuds', 'headset', 'audio device'],
      'tv': ['television', 'smart tv', 'led tv', 'oled tv'],
      'tablet': ['ipad', 'android tablet', 'slate'],
      'watch': ['smartwatch', 'fitness tracker', 'wearable'],
      'washing machine': ['washer', 'laundry machine', 'washing machine'],
      'refrigerator': ['fridge', 'refrigerator', 'cooler'],
      'microwave': ['microwave oven', 'microwave'],
      'dishwasher': ['dish washer', 'dishwashing machine']
    };
    
    // Enhanced brand mappings with model patterns
    this.brands = {
      'apple': ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch', 'imac', 'mac mini'],
      'samsung': ['galaxy', 'note', 's series', 'a series', 'm series', 'z series', 'qled', 'oled'],
      'google': ['pixel', 'chromebook', 'nest'],
      'oneplus': ['one plus', 'oneplus'],
      'xiaomi': ['mi', 'redmi', 'poco', 'xiaomi'],
      'oppo': ['find x', 'reno', 'a series', 'oppo'],
      'vivo': ['x series', 'v series', 'y series', 'vivo'],
      'lg': ['lg', 'life is good'],
      'sony': ['sony', 'bravia', 'xperia'],
      'dell': ['dell', 'inspiron', 'xps', 'latitude'],
      'hp': ['hp', 'hewlett packard', 'pavilion', 'envy', 'spectre']
    };

    // Common misspellings and variations
    this.misspellings = {
      'samsung': ['samsun', 'samsu', 'samsng'],
      'iphone': ['iphne', 'iphon', 'iphne'],
      'galaxy': ['galxy', 'galax', 'galaxi'],
      'oneplus': ['one plus', 'one+', 'one plus'],
      'xiaomi': ['xiaomi', 'xiaomi', 'xiaomi'],
      'oppo': ['oppo', 'oppo', 'oppo'],
      'vivo': ['vivo', 'vivo', 'vivo']
    };

    // Intent classification patterns
    this.intentPatterns = {
      'specific_model': [
        /\b[a-z]+\s+[a-z]?\d+\b/i,  // Samsung S25, iPhone 15
        /\b[a-z]+\s+[a-z]+\s+\d+\b/i,  // Samsung Galaxy S25
        /\b\d+\s*[a-z]+\b/i  // 15 Pro, S25 Ultra
      ],
      'brand_exploration': [
        /\b[a-z]+\b/i  // Just brand name
      ],
      'category_browsing': [
        /\b(phone|smartphone|mobile|laptop|tv|refrigerator)\b/i
      ],
      'comparison': [
        /\bvs\b|\bversus\b|\bcompare\b|\bcomparison\b/i
      ]
    };
  }

  async preprocessQuery(query) {
    console.log('🔍 Stage 1: Advanced Query Understanding for:', query);
    
    let processedQuery = query.trim().toLowerCase();
    
    // 1. Spell correction and normalization
    processedQuery = this.correctSpelling(processedQuery);
    console.log('   ✅ Spell correction:', processedQuery);
    
    // 2. Intent classification
    const intent = this.classifyIntent(processedQuery);
    console.log('   🎯 Intent classified as:', intent.type, `(confidence: ${intent.confidence})`);
    
    // 3. Advanced attribute extraction
    const attributes = this.extractAdvancedAttributes(processedQuery);
    console.log('   📋 Extracted attributes:', attributes);
    
    // 4. ML-Powered Category classification (Stage 2)
    const mlCategory = await this.mlClassifier.classifyProduct(processedQuery, attributes, intent);
    console.log('   🤖 ML Category classified as:', mlCategory.primary.category, `(confidence: ${mlCategory.primary.confidence})`);
    
    // Use ML classification result, fallback to rule-based if needed
    const category = {
      primary: mlCategory.primary.category,
      confidence: mlCategory.primary.confidence,
      alternatives: mlCategory.alternatives.map(alt => ({
        category: alt.category,
        confidence: alt.confidence,
        reason: alt.reasons?.[0] || 'ML classification'
      })),
      mlResult: mlCategory
    };
    
    // 5. Handle plurals and lemmatization
    processedQuery = this.handlePlurals(processedQuery);
    
    // 6. Create optimized queries for different search strategies
    const exactMatchQuery = this.createExactMatchQuery(processedQuery, attributes, category);
    const expandedQuery = this.expandSynonyms(processedQuery, category);
    const categorySpecificQuery = this.createCategorySpecificQuery(processedQuery, category, attributes);
    
    const result = {
      original: query,
      processed: processedQuery,
      exactMatch: exactMatchQuery,
      expanded: expandedQuery,
      categorySpecific: categorySpecificQuery,
      attributes,
      intent,
      category,
      confidence: this.calculateQueryConfidence(attributes, intent, category)
    };
    
    console.log('   📊 Query confidence score:', result.confidence);
    console.log('   ✅ Stage 1 completed successfully');
    
    return result;
  }

  correctSpelling(query) {
    let corrected = query;
    
    // Correct common misspellings
    for (const [correct, misspellings] of Object.entries(this.misspellings)) {
      for (const misspelling of misspellings) {
        const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
        corrected = corrected.replace(regex, correct);
      }
    }
    
    // Common word corrections
    const wordCorrections = {
      'samsun': 'samsung',
      'iphne': 'iphone',
      'galxy': 'galaxy',
      'one plus': 'oneplus',
      'washing machine': 'washing machine',
      'refrigerator': 'refrigerator'
    };
    
    for (const [wrong, right] of Object.entries(wordCorrections)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    }
    
    return corrected;
  }

  classifyIntent(query) {
    let maxConfidence = 0;
    let detectedIntent = 'general';
    
    // Check for specific model intent (highest priority)
    for (const pattern of this.intentPatterns.specific_model) {
      if (pattern.test(query)) {
        return { type: 'specific_model', confidence: 0.95 };
      }
    }
    
    // Check for comparison intent
    for (const pattern of this.intentPatterns.comparison) {
      if (pattern.test(query)) {
        return { type: 'comparison', confidence: 0.9 };
      }
    }
    
    // Check for category browsing
    for (const pattern of this.intentPatterns.category_browsing) {
      if (pattern.test(query)) {
        return { type: 'category_browsing', confidence: 0.8 };
      }
    }
    
    // Check for brand exploration
    for (const pattern of this.intentPatterns.brand_exploration) {
      if (pattern.test(query)) {
        return { type: 'brand_exploration', confidence: 0.7 };
      }
    }
    
    return { type: 'general', confidence: 0.5 };
  }

  extractAdvancedAttributes(query) {
    const attributes = {
      brand: null,
      model: null,
      series: null,
      size: null,
      color: null,
      storage: null,
      variant: null,
      year: null
    };
    
    // Enhanced brand extraction with confidence scoring
    for (const [brand, aliases] of Object.entries(this.brands)) {
      for (const alias of aliases) {
        if (query.includes(alias.toLowerCase())) {
          attributes.brand = brand;
          break;
        }
      }
      if (attributes.brand) break;
    }
    
    // Advanced model extraction patterns
    const modelPatterns = [
      // Samsung Galaxy S25, iPhone 15 Pro
      /(\w+)\s+(\w+)\s+([a-z]?\d+)(?:\s+(\w+))?/i,
      // Samsung S25, iPhone 15
      /(\w+)\s+([a-z]?\d+)(?:\s+(\w+))?/i,
      // S25, 15 Pro, S24 FE
      /([a-z]?\d+)(?:\s+(\w+))?/i
    ];
    
    for (const pattern of modelPatterns) {
      const match = query.match(pattern);
      if (match) {
        if (match[1] && match[2] && match[3]) {
          // Full pattern: Samsung Galaxy S25
          attributes.brand = attributes.brand || match[1];
          attributes.series = match[2];
          attributes.model = match[3];
          attributes.variant = match[4] || null;
        } else if (match[1] && match[2]) {
          // Medium pattern: Samsung S25
          attributes.brand = attributes.brand || match[1];
          attributes.model = match[2];
          attributes.variant = match[3] || null;
        } else if (match[1]) {
          // Short pattern: S25
          attributes.model = match[1];
          attributes.variant = match[2] || null;
        }
        break;
      }
    }
    
         // Special handling for S24 FE pattern
     const s24feMatch = query.match(/(\w+)\s+(\d+)\s+(\w+)/i);
     if (s24feMatch && s24feMatch[3].toLowerCase() === 'fe') {
       attributes.brand = attributes.brand || s24feMatch[1];
       attributes.series = s24feMatch[2];
       attributes.model = s24feMatch[3];
     }
     
     // Special handling for A series pattern (A15, A73, etc.)
     const aSeriesMatch = query.match(/(\w+)\s+(a\d+)/i);
     if (aSeriesMatch) {
       attributes.brand = attributes.brand || aSeriesMatch[1];
       attributes.model = aSeriesMatch[2];
     }
    
    // Extract storage sizes with more patterns
    const storagePatterns = [
      /(\d+)\s*(gb|tb|mb)/i,
      /(\d+)\s*(gigabyte|terabyte|megabyte)/i
    ];
    
    for (const pattern of storagePatterns) {
      const match = query.match(pattern);
      if (match) {
        attributes.storage = `${match[1]}${match[2].toUpperCase()}`;
        break;
      }
    }
    
    // Extract colors with expanded list
    const colors = [
      'black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 
      'gold', 'silver', 'gray', 'grey', 'brown', 'orange', 'navy', 'maroon',
      'cream', 'beige', 'transparent', 'clear'
    ];
    
    for (const color of colors) {
      if (query.includes(color)) {
        attributes.color = color;
        break;
      }
    }
    
    // Extract year
    const yearMatch = query.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      attributes.year = yearMatch[1];
    }
    
    return attributes;
  }

  classifyProductCategory(query, attributes) {
    let maxScore = 0;
    let bestCategory = 'electronics';
    let confidence = 0.5;
    
    for (const [category, categoryInfo] of Object.entries(this.productCategories)) {
      let score = 0;
      
      // Check brand match
      if (attributes.brand && categoryInfo.brands.includes(attributes.brand)) {
        score += 0.4;
      }
      
      // Check model series match
      if (attributes.series && categoryInfo.models[attributes.brand]) {
        for (const modelSeries of categoryInfo.models[attributes.brand]) {
          if (attributes.series.toLowerCase().includes(modelSeries.toLowerCase())) {
            score += 0.3;
            break;
          }
        }
      }
      
      // Check keyword match
      for (const keyword of categoryInfo.keywords) {
        if (query.includes(keyword)) {
          score += 0.2;
          break;
        }
      }
      
      // Check model number patterns
      if (attributes.model) {
        const modelNum = attributes.model.match(/\d+/);
        if (modelNum) {
          const num = parseInt(modelNum[0]);
          
          // Samsung Galaxy S series (S1-S25) are phones
          if (attributes.brand === 'samsung' && attributes.series === 'galaxy' && 
              attributes.model.toLowerCase().startsWith('s') && num >= 1 && num <= 25) {
            score += 0.5;
          }
          
          // iPhone series (1-15) are phones
          if (attributes.brand === 'apple' && attributes.model.toLowerCase().includes('iphone') && 
              num >= 1 && num <= 15) {
            score += 0.5;
          }
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
        confidence = Math.min(score, 0.95);
      }
    }
    
    return {
      primary: bestCategory,
      confidence: confidence,
      alternatives: this.getAlternativeCategories(query, attributes)
    };
  }

  getAlternativeCategories(query, attributes) {
    const alternatives = [];
    
    for (const [category, categoryInfo] of Object.entries(this.productCategories)) {
      if (categoryInfo.brands.includes(attributes.brand)) {
        alternatives.push({
          category,
          confidence: 0.3,
          reason: 'brand_match'
        });
      }
    }
    
    return alternatives.slice(0, 3); // Return top 3 alternatives
  }

  handlePlurals(query) {
    // Enhanced plural to singular conversion
    const pluralToSingular = {
      'phones': 'phone',
      'laptops': 'laptop',
      'headphones': 'headphone',
      'watches': 'watch',
      'tablets': 'tablet',
      'cameras': 'camera',
      'speakers': 'speaker',
      'washing machines': 'washing machine',
      'refrigerators': 'refrigerator',
      'microwaves': 'microwave',
      'dishwashers': 'dishwasher',
      'televisions': 'television',
      'computers': 'computer',
      'monitors': 'monitor'
    };
    
    let processed = query;
    for (const [plural, singular] of Object.entries(pluralToSingular)) {
      processed = processed.replace(new RegExp(`\\b${plural}\\b`, 'g'), singular);
    }
    
    return processed;
  }

  expandSynonyms(query, category) {
    let expanded = query;
    
    // Category-specific synonym expansion
    if (category && category.primary) {
      const categoryInfo = this.productCategories[category.primary];
      if (categoryInfo) {
        // Add category-specific keywords
        expanded += ' ' + categoryInfo.keywords.join(' ');
      }
    }
    
    // General synonym expansion
    for (const [term, synonyms] of Object.entries(this.synonyms)) {
      if (expanded.includes(term)) {
        expanded += ' ' + synonyms.join(' ');
      }
    }
    
    // Brand alias expansion
    for (const [brand, aliases] of Object.entries(this.brands)) {
      if (expanded.includes(brand)) {
        expanded += ' ' + aliases.join(' ');
      }
    }
    
    return expanded;
  }

  createCategorySpecificQuery(query, category, attributes) {
    let categoryQuery = query;
    
    if (category && category.primary) {
      const categoryInfo = this.productCategories[category.primary];
      
      // Add category-specific terms
      if (categoryInfo) {
        categoryQuery += ' ' + categoryInfo.keywords.slice(0, 3).join(' ');
      }
      
      // Add brand-specific model terms
      if (attributes.brand && categoryInfo.models[attributes.brand]) {
        categoryQuery += ' ' + categoryInfo.models[attributes.brand].slice(0, 2).join(' ');
      }
    }
    
    return categoryQuery;
  }

  calculateQueryConfidence(attributes, intent, category) {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on attribute completeness
    if (attributes.brand) confidence += 0.1;
    if (attributes.model) confidence += 0.2;
    if (attributes.series) confidence += 0.1;
    if (attributes.storage) confidence += 0.05;
    if (attributes.color) confidence += 0.05;
    
    // Boost confidence based on intent clarity
    if (intent.type === 'specific_model') confidence += 0.2;
    if (intent.type === 'comparison') confidence += 0.1;
    
    // Boost confidence based on category classification
    if (category.confidence > 0.8) confidence += 0.1;
    if (category.confidence > 0.9) confidence += 0.1;
    
    // Special boost for specific model patterns
    if (attributes.brand && attributes.model) {
      const modelNum = attributes.model.match(/\d+/);
      if (modelNum) {
        const num = parseInt(modelNum[0]);
        
        // High confidence for known model ranges
        if (attributes.brand === 'samsung' && attributes.series === 'galaxy' && 
            attributes.model.toLowerCase().startsWith('s') && num >= 1 && num <= 25) {
          confidence += 0.2;
        }
        
        if (attributes.brand === 'apple' && attributes.model.toLowerCase().includes('iphone') && 
            num >= 1 && num <= 15) {
          confidence += 0.2;
        }
      }
    }
    
    return Math.min(confidence, 1.0); // Cap at 1.0
  }

  // Legacy method for backward compatibility
  parseProductAttributes(query) {
    // Use the new advanced method but return simplified structure
    const advancedAttributes = this.extractAdvancedAttributes(query);
    
    return {
      brand: advancedAttributes.brand,
      model: advancedAttributes.model,
      size: advancedAttributes.size,
      color: advancedAttributes.color,
      storage: advancedAttributes.storage
    };
  }

  createExactMatchQuery(query, attributes, category) {
    let exactQuery = query;
    
    // If we have a specific model, use exact matching
    if (attributes.model) {
      // Use quotes for exact phrase matching
      exactQuery = `"${attributes.model}"`;
      
      // Add brand if available
      if (attributes.brand) {
        exactQuery = `"${attributes.brand} ${attributes.model}"`;
      }
      
      // Add series if available (e.g., "Samsung Galaxy S25")
      if (attributes.series) {
        exactQuery = `"${attributes.brand} ${attributes.series} ${attributes.model}"`;
      }
      
      // Add storage if specified
      if (attributes.storage) {
        exactQuery += ` ${attributes.storage}`;
      }
      
      // Add color if specified
      if (attributes.color) {
        exactQuery += ` ${attributes.color}`;
      }
      
      // Add variant if specified (e.g., Pro, Ultra, Plus)
      if (attributes.variant) {
        exactQuery += ` ${attributes.variant}`;
      }
    } else if (attributes.brand) {
      // If only brand is specified, use exact brand matching
      exactQuery = `"${attributes.brand}"`;
    }
    
    // Add category-specific exclusion terms
    let exclusionTerms = [
      'case', 'cover', 'protector', 'screen guard', 'tempered glass',
      'charger', 'cable', 'adapter', 'stand', 'holder', 'mount',
      'accessory', 'accessories', 'spare', 'replacement', 'parts'
    ];
    
    // Add category-specific exclusions
    if (category && category.primary === 'mobile_phones') {
      exclusionTerms.push('washing machine', 'refrigerator', 'microwave', 'dishwasher');
    } else if (category && category.primary === 'home_appliances') {
      exclusionTerms.push('phone', 'smartphone', 'mobile', 'galaxy', 'iphone');
    }
    
    exclusionTerms.forEach(term => {
      exactQuery += ` -${term}`;
    });
    
    return exactQuery;
  }
}

/**
 * 2. Multi-Source Retrieval Layer
 */
class MultiSourceRetrievalLayer {
  constructor() {
    // Legacy API endpoints for backward compatibility
    this.apiEndpoints = [
      { name: 'google_shopping_api', priority: 1 },
      { name: 'google_shopping', priority: 2 },
      { name: 'google_search', priority: 3 },
      { name: 'google_search_indian', priority: 4 }
    ];
    
    // Initialize Google Shopping Service
    this.googleShoppingService = new GoogleShoppingService();
    
    // Initialize Hierarchical Retrieval Service (Stage 3)
    this.hierarchicalRetrieval = new HierarchicalRetrievalService();
  }

  async searchProducts(processedQuery) {
    // Use hierarchical retrieval if ML classification is available
    if (processedQuery.category && processedQuery.category.mlResult) {
      console.log('🤖 Using Hierarchical Retrieval (Stage 3)...');
      return await this.searchWithHierarchicalRetrieval(processedQuery);
    }
    
    // Fallback to legacy retrieval
    console.log('🔄 Using Legacy Retrieval...');
    return await this.searchWithLegacyRetrieval(processedQuery);
  }

  async searchWithHierarchicalRetrieval(processedQuery) {
    console.log('🌐 Stage 3: Hierarchical Data Retrieval for:', processedQuery.processed);
    
    try {
      const hierarchicalResults = await this.hierarchicalRetrieval.retrieveProducts(
        processedQuery.processed,
        processedQuery.category.mlResult,
        {
          minResults: 10,
          targetResults: 20,
          concurrency: 3,
          scrapingConcurrency: 2,
          tertiaryConcurrency: 1
        }
      );

      // Combine all results
      const allProducts = [
        ...hierarchicalResults.primary,
        ...hierarchicalResults.secondary,
        ...hierarchicalResults.tertiary
      ];

      console.log(`✅ Hierarchical retrieval completed: ${allProducts.length} products from ${hierarchicalResults.metadata.totalSources} sources`);
      
      // Fallback to legacy retrieval if hierarchical retrieval returns too few results
      if (allProducts.length < 3) {
        console.log('⚠️ Hierarchical retrieval returned too few results, falling back to legacy retrieval...');
        const legacyCandidates = await this.searchWithLegacyRetrieval(processedQuery);
        allProducts.push(...legacyCandidates);
        console.log(`📊 Combined results: ${allProducts.length} products`);
      }
      
      return allProducts;

    } catch (error) {
      console.error('❌ Hierarchical retrieval failed, falling back to legacy:', error.message);
      return await this.searchWithLegacyRetrieval(processedQuery);
    }
  }

  async searchWithLegacyRetrieval(processedQuery) {
    const candidates = [];
    
    console.log('🔍 Starting legacy multi-source retrieval for:', processedQuery.processed);
    
    // A. Primary APIs
    for (const api of this.apiEndpoints) {
      try {
        console.log(`📡 Calling ${api.name} API...`);
        const results = await this.searchWithAPI(api.name, processedQuery);
        console.log(`✅ ${api.name} returned ${results.length} results`);
        candidates.push(...results);
      } catch (error) {
        console.error(`❌ API ${api.name} failed:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          
          // If it's a quota error, log it but continue
          if (error.response.status === 429) {
            console.log(`⚠️ API quota exceeded for ${api.name}, continuing with other APIs`);
          }
        }
      }
    }
    
    console.log(`📊 Total candidates from APIs: ${candidates.length}`);
    
    // B. Fallback Web-Scrape if needed
    if (candidates.length < CONFIG.MIN_RESULTS) {
      try {
        console.log('🌐 Trying web scraping fallback...');
        const scrapedResults = await this.fallbackWebScrape(processedQuery);
        candidates.push(...scrapedResults);
        console.log(`✅ Web scraping returned ${scrapedResults.length} results`);
      } catch (error) {
        console.error('❌ Web scraping failed:', error.message);
      }
    }
    
    console.log(`📊 Total candidates after all sources: ${candidates.length}`);
    
    // If we still have no results, try a very simple search as last resort
    if (candidates.length === 0) {
      try {
        console.log('🆘 Last resort: Simple Google search...');
        const simpleSearchParams = {
          key: process.env.GOOGLE_SEARCH_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: processedQuery.processed,
          num: 10,
          safe: 'active'
        };

        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: simpleSearchParams,
          timeout: 10000
        });

        if (response.data.items && response.data.items.length > 0) {
          const simpleResults = this.normalizeGoogleResults(response.data.items);
          candidates.push(...simpleResults);
          console.log(`✅ Simple search returned ${simpleResults.length} results`);
        }
      } catch (error) {
        console.error('❌ Simple search also failed:', error.message);
      }
    }
    
    return candidates;
  }

  async searchWithAPI(apiName, query) {
    switch (apiName) {
      case 'google_shopping_api':
        return await this.googleShoppingAPISearch(query);
      case 'google_shopping':
        return await this.googleShoppingSearch(query);
      case 'google_search':
        return await this.googleSearchFallback(query);
      case 'google_search_indian':
        return await this.googleSearchIndian(query);
      default:
        return [];
    }
  }

  async googleShoppingAPISearch(query) {
    try {
      console.log('🔍 Google Shopping API search:', query.processed);
      
      // Use Google Shopping API (Content API for Shopping)
      const results = await this.googleShoppingService.searchProducts(query.processed, {
        country: 'IN',
        language: 'en',
        maxResults: 20
      });
      
      console.log('📊 Google Shopping API response:', {
        totalResults: results.length
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ Google Shopping API failed:', error.message);
      
      // Fallback to Custom Search with shopping focus
      console.log('🔄 Falling back to Google Custom Search with shopping focus...');
      try {
      return await this.googleShoppingService.searchWithCustomSearch(query.processed, {
        maxResults: 20,
        country: 'IN',
        language: 'en'
      });
      } catch (fallbackError) {
        console.error('❌ Google Custom Search fallback also failed:', fallbackError.message);
        
        // Final fallback: simple Google search
        console.log('🆘 Final fallback: Simple Google search...');
        const simpleSearchParams = {
          key: process.env.GOOGLE_SEARCH_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query.processed,
          num: 10,
          safe: 'active'
        };

        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: simpleSearchParams,
          timeout: 10000
        });

        if (response.data.items && response.data.items.length > 0) {
          return this.normalizeGoogleResults(response.data.items);
        }
        
        return [];
      }
    }
  }

  async googleShoppingSearch(query) {
    // Use category-specific query if available, otherwise exact match
    const searchQuery = query.categorySpecific || query.exactMatch || query.processed;
    
    // Google Custom Search API with shopping focus
    const searchParams = {
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: `${searchQuery} (buy OR shop OR price OR purchase) (amazon.in OR flipkart.com OR snapdeal.com OR croma.com OR tatacliq.com OR paytmmall.com) -specs -specifications -support -help -about -news -blog -tech -features -compare -review -guide -manual -download -firmware`,
      num: 10,
      safe: 'active'
    };

    console.log('🔍 Google Shopping Search params:', {
      q: searchParams.q,
      key: searchParams.key ? 'SET' : 'MISSING',
      cx: searchParams.cx ? 'SET' : 'MISSING'
    });

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: searchParams,
      timeout: CONFIG.API_TIMEOUT
    });

    console.log('📊 Google Shopping response:', {
      totalResults: response.data.searchInformation?.totalResults,
      items: response.data.items?.length || 0
    });

    return this.normalizeGoogleResults(response.data.items || []);
  }

  async googleSearchFallback(query) {
    // Use category-specific query if available, otherwise exact match
    const searchQuery = query.categorySpecific || query.exactMatch || query.processed;
    
    // Fallback to regular Google Search with shopping terms
    const searchParams = {
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: `${searchQuery} (product OR buy OR shop OR price) (amazon.in OR flipkart.com OR snapdeal.com OR croma.com OR tatacliq.com OR paytmmall.com OR vijaysales.com OR sangeethamobiles.com) -specs -specifications -support -help -about -news -blog -tech -features -compare -review -guide -manual -download -firmware`,
      num: 10,
      safe: 'active'
    };

    console.log('🔍 Google Search Fallback params:', {
      q: searchParams.q,
      key: searchParams.key ? 'SET' : 'MISSING',
      cx: searchParams.cx ? 'SET' : 'MISSING'
    });

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: searchParams,
      timeout: CONFIG.API_TIMEOUT
    });

    console.log('📊 Google Search Fallback response:', {
      totalResults: response.data.searchInformation?.totalResults,
      items: response.data.items?.length || 0
    });

    return this.normalizeGoogleResults(response.data.items || []);
  }

  async googleSearchIndian(query) {
    // Use category-specific query if available, otherwise exact match
    const searchQuery = query.categorySpecific || query.exactMatch || query.processed;
    
    // Specialized search for Indian shopping sites
    const indianSites = [
      'site:flipkart.com', 'site:amazon.in', 'site:snapdeal.com',
      'site:paytmmall.com', 'site:croma.com', 'site:tatacliq.com',
      'site:vijaysales.com', 'site:sangeethamobiles.com',
      'site:poorvika.com', 'site:lotmobile.in', 'site:reliance-digital.com',
      'site:shopclues.com', 'site:indiamart.com', 'site:olx.in',
      'site:quikr.com', 'site:myntra.com', 'site:ajio.com',
      'site:nykaa.com', 'site:lenskart.com', 'site:firstcry.com'
    ];
    
    const searchParams = {
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: `${searchQuery} (buy OR shop OR price OR purchase) (${indianSites.join(' OR ')}) -specs -specifications -support -help -about -news -blog -tech -features -compare -review -guide -manual -download -firmware`,
      num: 10,
      safe: 'active'
    };

    console.log('🔍 Google Search Indian params:', {
      q: searchParams.q,
      key: searchParams.key ? 'SET' : 'MISSING',
      cx: searchParams.cx ? 'SET' : 'MISSING'
    });

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: searchParams,
      timeout: CONFIG.API_TIMEOUT
    });

    console.log('📊 Google Search Indian response:', {
      totalResults: response.data.searchInformation?.totalResults,
      items: response.data.items?.length || 0
    });

    return this.normalizeGoogleResults(response.data.items || []);
  }

  async amazonProductSearch(query) {
    // Placeholder for Amazon PA-API integration
    // This would require Amazon Product Advertising API credentials
    console.log('Amazon PA-API not implemented yet');
    return [];
  }

  async fallbackWebScrape(query) {
    // Simple fallback using Google Search with different parameters
    try {
      console.log('🌐 Using web scraping fallback...');
      
      // Try different search strategies
      const searchStrategies = [
        `${query.processed} site:flipkart.com`,
        `${query.processed} site:amazon.in`,
        `${query.processed} site:croma.com`,
        `${query.processed} site:tatacliq.com`
      ];
      
      const allResults = [];
      
      for (const strategy of searchStrategies) {
        try {
          const searchParams = {
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
            q: strategy,
            num: 5, // Get fewer results per strategy
            safe: 'active'
          };

          const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: searchParams,
            timeout: CONFIG.API_TIMEOUT
          });

          if (response.data.items) {
            allResults.push(...response.data.items);
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Strategy "${strategy}" failed:`, error.message);
        }
      }
      
      console.log(`✅ Web scraping fallback returned ${allResults.length} results`);
      return this.normalizeGoogleResults(allResults);
      
    } catch (error) {
      console.error('❌ Web scraping fallback failed:', error.message);
      return [];
    }
  }

  normalizeGoogleResults(items) {
    return items.map(item => ({
      title: item.title,
      description: item.snippet,
      url: this.ensureValidUrl(item.link),
      domain: extractDomain(item.link),
      image: this.extractImage(item),
      price: this.extractPrice(item),
      rating: this.extractRating(item),
      source_api: 'google_search',
      pagemap: item.pagemap || {}
    }));
  }

  ensureValidUrl(url) {
    if (!url) return null;
    
    // If URL doesn't start with http/https, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  }



  extractImage(item) {
    if (item.pagemap?.cse_image?.[0]?.src) {
      return item.pagemap.cse_image[0].src;
    }
    if (item.pagemap?.metatags?.[0]?.['og:image']) {
      return item.pagemap.metatags[0]['og:image'];
    }
    return null;
  }

  extractPrice(item) {
    // Extract from structured data first
    if (item.pagemap?.offer?.[0]?.price) {
      const price = item.pagemap.offer[0].price;
      return this.formatPrice(price);
    }
    if (item.pagemap?.product?.[0]?.price) {
      const price = item.pagemap.product[0].price;
      return this.formatPrice(price);
    }
    
    // Extract from text using multiple regex patterns
    const text = (item.title + ' ' + item.snippet).toLowerCase();
    
    // Multiple price patterns
    const pricePatterns = [
      /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*₹/i,
      /rs\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*rs\.?/i,
      /inr\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*inr/i,
      /price[:\s]*₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /cost[:\s]*₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /buy[:\s]*₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const price = match[1] || match[0];
        return this.formatPrice(price);
      }
    }
    
    return null;
  }

  formatPrice(price) {
    if (!price) return null;
    
    // Remove any non-numeric characters except dots and commas
    const cleanPrice = price.toString().replace(/[^\d.,]/g, '');
    
    // Convert to number
    const numericPrice = parseFloat(cleanPrice.replace(/,/g, ''));
    
    if (isNaN(numericPrice)) return null;
    
    // Format as Indian Rupees
    return `₹${numericPrice.toLocaleString('en-IN')}`;
  }

  extractRating(item) {
    if (item.pagemap?.metatags?.[0]?.['og:rating']) {
      return item.pagemap.metatags[0]['og:rating'];
    }
    
    const ratingRegex = /(\d+(?:\.\d+)?)\s*★/i;
    const match = (item.title + ' ' + item.snippet).match(ratingRegex);
    return match ? match[1] : null;
  }

  checkCategoryMatch(item, expectedCategory) {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const text = `${title} ${description}`;
    
    // Category-specific keyword checks
    const categoryKeywords = {
      'mobile_phones': ['phone', 'smartphone', 'mobile', 'galaxy', 'iphone', 'pixel', 'oneplus'],
      'home_appliances': ['washing machine', 'refrigerator', 'microwave', 'dishwasher', 'dryer', 'oven'],
      'electronics': ['tv', 'television', 'monitor', 'speaker', 'headphones', 'camera'],
      'computers': ['laptop', 'desktop', 'computer', 'macbook', 'tablet', 'pc']
    };
    
    // Exclusion keywords for each category
    const exclusionKeywords = {
      'mobile_phones': ['washing machine', 'refrigerator', 'microwave', 'dishwasher', 'tv', 'television', 'laptop', 'desktop'],
      'home_appliances': ['phone', 'smartphone', 'mobile', 'galaxy', 'iphone', 'tv', 'television', 'laptop', 'desktop'],
      'electronics': ['washing machine', 'refrigerator', 'microwave', 'dishwasher', 'phone', 'smartphone'],
      'computers': ['washing machine', 'refrigerator', 'microwave', 'dishwasher', 'phone', 'smartphone', 'tv']
    };
    
    const keywords = categoryKeywords[expectedCategory] || [];
    const exclusions = exclusionKeywords[expectedCategory] || [];
    
    // Check for exclusion keywords first
    for (const exclusion of exclusions) {
      if (text.includes(exclusion)) {
        return false;
      }
    }
    
    // Check for inclusion keywords
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }
    
    // If no clear match, be more lenient for high-confidence classifications
    return true;
  }
}

/**
 * 3. E-commerce Filter & Deduplication
 */
class EcommerceFilterLayer {
  constructor() {
    this.whitelistedDomains = [
      // Major Indian E-commerce
      'flipkart.com', 'amazon.in', 'snapdeal.com', 'paytmmall.com',
      'myntra.com', 'ajio.com', 'nykaa.com', 'croma.com',
      'tatacliq.com', 'shopclues.com', 'vijaysales.com',
      'sangeethamobiles.com', 'poorvika.com', 'lotmobile.in',
      'reliance-digital.com', 'indiamart.com', 'olx.in', 'quikr.com',
      'lenskart.com', 'firstcry.com', 'babyoye.com',
      'homeshop18.com', 'mobikwik.com', 'pepperfry.com',
      'urbanladder.com', 'fabfurnish.com', 'livspace.com',
      
      // Global E-commerce
      'amazon.com', 'ebay.com', 'walmart.com', 'target.com',
      'bestbuy.com', 'apple.com', 'samsung.com', 'google.com',
      
      // Brand Stores (only for actual product pages)
      'mi.com', 'oneplus.in', 'oppo.com', 'vivo.com',
      'realme.com', 'nokia.com', 'motorola.com',
      
      // Additional Indian Retailers
      'croma.com', 'reliance-digital.com', 'tatacliq.com'
    ];
  }

  filterAndDeduplicate(candidates, mlClassification = null) {
    const products = [];
    const seenGTINs = new Set();
    let domainFiltered = 0;
    let structuredDataFiltered = 0;
    let productChecksFiltered = 0;
    let duplicateFiltered = 0;
    let categoryFiltered = 0;
    
    console.log(`🔍 Filtering ${candidates.length} candidates...`);
    
    for (const item of candidates) {
      console.log(`\n📋 Checking: "${item.title}" (${item.domain})`);
      
      // 1. Domain whitelist check
      const domainCheck = this.isEcommerceDomain(item.domain);
      console.log(`   🔍 Domain check for "${item.domain}": ${domainCheck ? 'PASS' : 'FAIL'}`);
      if (!domainCheck) {
        console.log(`   ❌ Domain filtered: ${item.domain}`);
        domainFiltered++;
        continue;
      }
      console.log(`   ✅ Domain passed: ${item.domain}`);
      
      // 1.5. Category-based filtering (if ML classification is available)
      if (mlClassification && mlClassification.primary.confidence > 0.7) {
        const categoryMatch = this.checkCategoryMatch(item, mlClassification.primary.category);
        if (!categoryMatch) {
          console.log(`   ❌ Category filtered: expected ${mlClassification.primary.category}`);
          categoryFiltered++;
        continue;
      }
        console.log(`   ✅ Category passed: ${mlClassification.primary.category}`);
      }
      
      // 2. Structured-data check (disabled for now to be more lenient)
      console.log(`   ✅ Structured data check disabled (lenient mode)`);
      
      // 3. Content heuristics check
      if (!this.passesProductChecks(item)) {
        console.log(`   ❌ Product checks filtered`);
        productChecksFiltered++;
        continue;
      }
      console.log(`   ✅ Product checks passed`);
      
      // 4. Deduplication by GTIN/ASIN
      const gtin = this.extractGTIN(item);
      if (gtin && seenGTINs.has(gtin)) {
        console.log(`   ❌ Duplicate filtered (GTIN: ${gtin})`);
        duplicateFiltered++;
        continue;
      }
      if (gtin) {
        seenGTINs.add(gtin);
        console.log(`   📝 GTIN found: ${gtin}`);
      }
      
      console.log(`   🎉 Product accepted!`);
      products.push(this.normalizeProduct(item));
    }
    
    console.log(`📊 Filtering results:`);
    console.log(`   - Domain filtered: ${domainFiltered}`);
    console.log(`   - Category filtered: ${categoryFiltered}`);
    console.log(`   - Structured data filtered: ${structuredDataFiltered}`);
    console.log(`   - Product checks filtered: ${productChecksFiltered}`);
    console.log(`   - Duplicates filtered: ${duplicateFiltered}`);
    console.log(`   - Products passed: ${products.length}`);
    
    return products;
  }

  isEcommerceDomain(domain) {
    // First check whitelist
    const isWhitelisted = this.whitelistedDomains.some(whitelisted => 
      domain.includes(whitelisted.replace('www.', ''))
    );
    
    if (isWhitelisted) {
      console.log(`     ✅ Domain "${domain}" is whitelisted`);
      return true;
    }
    
    // Blacklist common non-shopping domains
    const blacklistedDomains = [
      'blog', 'news', 'article', 'review', 'forum', 'community',
      'reddit.com', 'quora.com', 'stackoverflow.com', 'github.com',
      'medium.com', 'wordpress.com', 'blogspot.com', 'tumblr.com',
      'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
      'linkedin.com', 'pinterest.com', 'tiktok.com', 'hwupgrade.it',
      'mercadolivre.com.br', 'greenmove.hwupgrade.it'
    ];
    
    const isBlacklisted = blacklistedDomains.some(blacklisted => 
      domain.includes(blacklisted)
    );
    
    if (isBlacklisted) {
      console.log(`     ❌ Domain "${domain}" is blacklisted`);
      return false;
    }
    
    // Allow domains that are either whitelisted OR not blacklisted (more lenient)
    console.log(`     ✅ Domain "${domain}" is not blacklisted, allowing`);
    return true;
  }

  hasStructuredData(item) {
    // Check for schema.org/Product JSON-LD or microdata
    // Made very lenient - allow most items to pass through
    return item.pagemap?.product || 
           item.pagemap?.offer ||
           item.pagemap?.metatags?.[0]?.['og:type'] === 'product' ||
           item.pagemap?.cse_image || // Allow items with images
           item.pagemap?.metatags || // Allow items with any metatags
           item.image || // Allow items with images
           item.title; // Allow items with titles (very lenient)
  }

  passesProductChecks(item) {
    let score = 0;
    const maxScore = 10;
    
    // 1. Check for price (essential for e-commerce)
    if (item.price && item.price !== 'Price not available') {
      score += 2;
    }
    
    // 2. Check for buy/add-to-cart indicators
    if (this.hasBuyButtonIndicators(item)) {
      score += 2;
    }
    
    // 3. Check for product identifiers (GTIN/ASIN/SKU)
    if (this.extractGTIN(item)) {
      score += 1;
    }
    
    // 4. Check for structured product data
    if (this.hasStructuredProductData(item)) {
      score += 1;
    }
    
    // 5. Check for availability indicators
    if (this.hasAvailabilityIndicators(item)) {
      score += 1;
    }
    
    // 6. Check for product images
    if (item.image && !item.image.includes('placeholder')) {
      score += 1;
    }
    
    // 7. Check for e-commerce URL patterns
    if (this.hasEcommerceUrlPattern(item)) {
      score += 1;
    }
    
    // 8. Check for review count (higher reviews = better product)
    if (this.extractReviewCount(item) > 10) {
      score += 1;
    }
    
    // 9. Exclude informational/specification pages
    if (this.isInformationalPage(item)) {
      score -= 1; // Reduced penalty for spec pages
    }
    
    // 10. Exclude accessories (moderate penalty)
    if (this.isAccessory(item)) {
      score -= 2; // Reduced penalty for accessories
    }
    
    console.log(`🔍 Product check for "${item.title}": ${score}/${maxScore} points`);
    
    // Require at least 0 points to pass (0% threshold) - extremely lenient
    return score >= 0;
  }

  hasBuyButtonIndicators(item) {
    const buyKeywords = [
      'buy now', 'add to cart', 'add to bag', 'shop now', 'purchase',
      'order now', 'checkout', 'add to wishlist', 'save for later',
      'buy', 'shop', 'purchase', 'order', 'cart', 'bag'
    ];
    
    const text = (item.title + ' ' + item.description).toLowerCase();
    return buyKeywords.some(keyword => text.includes(keyword));
  }

  hasStructuredProductData(item) {
    // Check for structured data in pagemap
    return !!(item.pagemap?.product || 
              item.pagemap?.offer || 
              item.pagemap?.aggregaterating ||
              item.pagemap?.price);
  }

  hasAvailabilityIndicators(item) {
    const availabilityKeywords = [
      'in stock', 'available', 'ready to ship', 'fast delivery',
      'free delivery', 'express delivery', 'ships in', 'delivery by'
    ];
    
    const text = (item.title + ' ' + item.description).toLowerCase();
    return availabilityKeywords.some(keyword => text.includes(keyword));
  }

  isInformationalPage(item) {
    // Check URL patterns for informational pages
    const infoUrlPatterns = [
      /\/specs?\//i, /\/specifications?\//i, /\/support\//i, /\/help\//i,
      /\/details?\//i, /\/about\//i, /\/news\//i, /\/blog\//i, /\/tech\//i,
      /\/features?\//i, /\/compare\//i, /\/reviews?\//i, /\/guide\//i,
      /\/manual\//i, /\/download\//i, /\/firmware\//i, /\/software\//i
    ];
    
    // Check if URL contains informational patterns
    const hasInfoUrl = infoUrlPatterns.some(pattern => pattern.test(item.url));
    
    // Check content for informational keywords
    const infoKeywords = [
      'specifications', 'technical details', 'product details', 'features',
      'about this product', 'product information', 'tech specs', 'specs',
      'technical specifications', 'product overview', 'learn more',
      'compare', 'review', 'guide', 'manual', 'download', 'firmware'
    ];
    
    const text = (item.title + ' ' + item.description).toLowerCase();
    const hasInfoContent = infoKeywords.some(keyword => text.includes(keyword));
    
    // Check for brand official sites with informational content
    const isBrandOfficialSite = this.isBrandOfficialSite(item.domain);
    const hasPrice = item.price && item.price !== 'Price not available';
    
    // If it's a brand official site without price, likely informational
    if (isBrandOfficialSite && !hasPrice) {
      return true;
    }
    
    return hasInfoUrl || hasInfoContent;
  }

  isBrandOfficialSite(domain) {
    const brandDomains = [
      'apple.com', 'samsung.com', 'google.com', 'oneplus.com', 'mi.com',
      'oppo.com', 'vivo.com', 'realme.com', 'nokia.com', 'motorola.com',
      'sony.com', 'lg.com', 'huawei.com', 'honor.com', 'xiaomi.com'
    ];
    
    return brandDomains.some(brand => domain.includes(brand));
  }

  hasEcommerceUrlPattern(item) {
    const ecommercePatterns = [
      /\/p\//i, /\/product\//i, /\/item\//i, /\/buy\//i, /\/shop\//i,
      /\/dp\//i, /\/gp\/product\//i, /\/product-details\//i,
      /\/product\?/i, /\/item\?/i, /\/buy\?/i, /\/shop\?/i
    ];
    
    return ecommercePatterns.some(pattern => pattern.test(item.url));
  }

  isAccessory(item) {
    const accessoryKeywords = [
      'case', 'cover', 'protector', 'screen guard', 'tempered glass',
      'charger', 'cable', 'adapter', 'stand', 'holder', 'mount',
      'accessory', 'accessories', 'spare', 'replacement', 'parts',
      'back cover', 'front cover', 'bumper', 'skin', 'sticker',
      'wireless charger', 'fast charger', 'car charger', 'power bank',
      'earphones', 'headphones', 'bluetooth', 'speaker', 'dock',
      'keyboard', 'mouse', 'stylus', 'pen', 'remote', 'controller'
    ];
    
    const text = (item.title + ' ' + item.description).toLowerCase();
    
    // Check if any accessory keyword is present
    const hasAccessoryKeyword = accessoryKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    // Check if it's clearly a main product (has model numbers, etc.)
    const isMainProduct = this.isMainProduct(item);
    
    // If it has accessory keywords but doesn't look like a main product, it's an accessory
    return hasAccessoryKeyword && !isMainProduct;
  }

  isMainProduct(item) {
    const mainProductIndicators = [
      // Model number patterns
      /\b(iphone|samsung|oneplus|oppo|vivo|realme|nokia|motorola|sony|lg|huawei|honor|xiaomi)\s+\d+/i,
      /\b(galaxy|note|pixel|poco|redmi|mi)\s+\w+/i,
      /\b(macbook|ipad|airpods|apple watch|galaxy watch|fitbit)\s+\w*/i,
      
      // Storage indicators
      /\b\d+\s*(gb|tb|mb)\b/i,
      
      // Color variants
      /\b(black|white|blue|red|green|yellow|pink|purple|gold|silver|space gray|midnight|starlight)\b/i,
      
      // Product type indicators
      /\b(smartphone|phone|mobile|laptop|tablet|watch|earbuds|headphones|speaker|camera|tv)\b/i
    ];
    
    const text = (item.title + ' ' + item.description).toLowerCase();
    
    // Check if it matches main product patterns
    return mainProductIndicators.some(pattern => pattern.test(text));
  }

  checkCategoryMatch(item, expectedCategory) {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const combinedText = `${title} ${description}`;
    
    // Category-specific keyword matching
    const categoryKeywords = {
      'mobile_phones': ['phone', 'smartphone', 'mobile', 'galaxy', 'iphone', 'pixel', 'oneplus'],
      'laptops': ['laptop', 'notebook', 'computer', 'macbook', 'dell', 'hp', 'lenovo'],
      'tablets': ['tablet', 'ipad', 'samsung tablet', 'android tablet'],
      'headphones': ['headphone', 'earphone', 'airpods', 'earbuds', 'wireless'],
      'watches': ['watch', 'smartwatch', 'apple watch', 'galaxy watch'],
      'cameras': ['camera', 'dslr', 'mirrorless', 'canon', 'nikon', 'sony'],
      'home_appliances': ['washing', 'refrigerator', 'microwave', 'dishwasher', 'oven'],
      'electronics': ['tv', 'television', 'monitor', 'speaker', 'audio']
    };
    
    const keywords = categoryKeywords[expectedCategory] || [];
    
    if (keywords.length === 0) {
      console.log(`     ⚠️ No keywords for category: ${expectedCategory}`);
      return true; // Allow if no specific keywords defined
    }
    
    const hasCategoryKeywords = keywords.some(keyword => 
      combinedText.includes(keyword)
    );
    
    if (hasCategoryKeywords) {
      console.log(`     ✅ Category match: ${expectedCategory}`);
      return true;
    }
    
    console.log(`     ❌ Category mismatch: expected ${expectedCategory}, found: ${title}`);
    return false;
  }

  extractGTIN(item) {
    // Extract GTIN/ASIN/EAN from URL or structured data
    const asinRegex = /[A-Z0-9]{10}/;
    const gtinRegex = /\b\d{13}\b/;
    
    // Check URL first
    const urlMatch = item.url.match(asinRegex) || item.url.match(gtinRegex);
    if (urlMatch) {
      return urlMatch[0];
    }
    
    // Check structured data
    if (item.pagemap?.product?.[0]?.gtin) {
      return item.pagemap.product[0].gtin;
    }
    
    return null;
  }

  normalizeProduct(item) {
    const validUrl = this.ensureValidUrl(item.url);
    
    return {
      id: validUrl || item.id || Math.random().toString(36),
      title: item.title,
      description: item.description,
      url: validUrl,
      image: item.image,
      price: item.price,
      rating: item.rating,
      seller: item.domain,
      domain: item.domain,
      buy_url: validUrl,
      source_api: item.source_api,
      gtin: this.extractGTIN(item),
      availability: this.determineAvailability(item),
      reviews: this.extractReviewCount(item)
    };
  }

  ensureValidUrl(url) {
    if (!url) return null;
    
    // If URL doesn't start with http/https, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  }

  determineAvailability(item) {
    const text = (item.title + ' ' + item.description).toLowerCase();
    if (text.includes('out of stock') || text.includes('unavailable')) {
      return 'out_of_stock';
    }
    if (text.includes('in stock') || text.includes('available')) {
      return 'in_stock';
    }
    return 'unknown';
  }

  extractReviewCount(item) {
    const text = (item.title + ' ' + item.description).toLowerCase();
    
    // Multiple review patterns
    const reviewPatterns = [
      /(\d+(?:,\d+)*)\s*reviews?/i,
      /(\d+(?:,\d+)*)\s*ratings?/i,
      /(\d+(?:,\d+)*)\s*ratings?\s*&\s*reviews?/i,
      /(\d+(?:,\d+)*)\s*people\s*rated/i,
      /(\d+(?:,\d+)*)\s*customers?\s*rated/i,
      /(\d+(?:,\d+)*)\s*verified\s*reviews?/i,
      /(\d+(?:,\d+)*)\s*user\s*reviews?/i,
      /(\d+(?:,\d+)*)\s*buyer\s*reviews?/i
    ];
    
    for (const pattern of reviewPatterns) {
      const match = text.match(pattern);
      if (match) {
        const reviewCount = parseInt(match[1].replace(/,/g, ''));
        if (reviewCount > 0) {
          console.log(`📊 Found ${reviewCount} reviews in: "${item.title}"`);
          return reviewCount;
        }
      }
    }
    
    return null;
  }
}

/**
 * 4. Relevance & Ranking Engine
 */
class RelevanceRankingEngine {
  constructor() {
    this.weights = {
      lexical: 0.4,
      semantic: 0.3,
      business: 0.2,
      behavioral: 0.1
    };
  }

  rankProducts(query, products) {
    return products.map(product => {
      // Use semantic scores from Stage 4 if available, otherwise calculate traditional scores
      const semanticScores = product.semanticScores;
      
      const scores = {
        lexical: semanticScores?.lexical || this.calculateLexicalScore(query, product),
        semantic: semanticScores?.semantic || this.calculateSemanticScore(query, product),
        attribute: semanticScores?.attribute || 0,
        crossModal: semanticScores?.crossModal || 0,
        business: this.calculateBusinessScore(product),
        behavioral: this.calculateBehavioralScore(product)
      };
      
      // Enhanced scoring with Stage 4 semantic scores
      let finalScore = 0;
      
      if (semanticScores) {
        // Use Stage 4 weighted relevance score as base
        finalScore = (semanticScores.relevance || 0) * 60; // 60% weight for semantic relevance
        
        // Add business and behavioral scores
        finalScore += scores.business * 0.25; // 25% weight for business factors
        finalScore += scores.behavioral * 0.15; // 15% weight for behavioral factors
        
        console.log(`🎯 Enhanced scoring for "${product.title}": Semantic=${semanticScores.relevance?.toFixed(3)}, Business=${scores.business.toFixed(1)}, Final=${finalScore.toFixed(1)}`);
      } else {
        // Fallback to traditional scoring
        finalScore = Object.entries(scores).reduce((total, [key, score]) => {
        return total + (score * this.weights[key]);
      }, 0);
      }
      
      return { ...product, scores, finalScore };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  calculateLexicalScore(query, product) {
    let score = 0;
    const queryTerms = query.processed.toLowerCase().split(' ');
    const productText = (product.title + ' ' + product.description).toLowerCase();
    
    // BM25-like scoring
    for (const term of queryTerms) {
      const termCount = (productText.match(new RegExp(term, 'g')) || []).length;
      if (termCount > 0) {
        score += termCount * 2; // Boost for exact matches
      }
    }
    
    // Boost for title matches
    if (product.title.toLowerCase().includes(query.processed)) {
      score += 10;
    }
    
    return Math.min(score, 100); // Normalize to 0-100
  }

  calculateSemanticScore(query, product) {
    // Placeholder for BERT-based semantic scoring
    // In a real implementation, this would use a fine-tuned model
    let score = 0;
    
    // Simple semantic matching based on product attributes
    if (query.attributes.brand && product.title.toLowerCase().includes(query.attributes.brand)) {
      score += 20;
    }
    
    if (query.attributes.model && product.title.toLowerCase().includes(query.attributes.model.toLowerCase())) {
      score += 30;
    }
    
    if (query.attributes.storage && product.title.toLowerCase().includes(query.attributes.storage.toLowerCase())) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  calculateBusinessScore(product) {
    let score = 0;
    
    // Review count boost (heavily weighted - more reviews = better product)
    if (product.reviews && product.reviews > 0) {
      // Logarithmic scaling for review count
      const reviewScore = Math.log10(product.reviews + 1) * 15;
      score += Math.min(reviewScore, 40); // Cap at 40 points
      console.log(`📊 Review score for "${product.title}": ${product.reviews} reviews = ${reviewScore.toFixed(1)} points`);
    }
    
    // Rating boost (higher rating = better product)
    if (product.rating) {
      const ratingScore = parseFloat(product.rating) * 8;
      score += Math.min(ratingScore, 30); // Cap at 30 points
      console.log(`⭐ Rating score for "${product.title}": ${product.rating} stars = ${ratingScore.toFixed(1)} points`);
    }
    
    // Price competitiveness (lower price = higher score)
    if (product.price && product.price !== 'Price not available') {
      const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
      if (price > 0) {
        // Normalize price score (lower price = higher score)
        const priceScore = Math.max(0, 20 - (price / 2000)); // Adjust based on product category
        score += priceScore;
        console.log(`💰 Price score for "${product.title}": ₹${price} = ${priceScore.toFixed(1)} points`);
      }
    }
    
    // Availability boost
    if (product.availability === 'in_stock') {
      score += 10;
      console.log(`✅ Availability score for "${product.title}": +10 points`);
    }
    
    const finalScore = Math.min(score, 100);
    console.log(`🏆 Total business score for "${product.title}": ${finalScore.toFixed(1)}/100`);
    
    return finalScore;
  }

  calculateBehavioralScore(product) {
    // Placeholder for behavioral signals
    // In a real implementation, this would use click-through rates, etc.
    return 50; // Default neutral score
  }
}

/**
 * Main Product Search Service
 */
class ProductSearchService {
  constructor() {
    this.queryLayer = new QueryUnderstandingLayer();
    this.retrievalLayer = new MultiSourceRetrievalLayer();
    this.filterLayer = new EcommerceFilterLayer();
    this.rankingEngine = new RelevanceRankingEngine();
    this.semanticMatcher = new SemanticMatchingService();
    this.advancedFilter = new AdvancedFilteringService();
  }

  async searchProducts(query, options = {}) {
    // Clear cache for new searches to avoid stale results
    if (options.page === 1) {
      console.log('🧹 Clearing cache for new search:', query);
      searchCache.clear();
    }
    
    const cacheKey = this.generateCacheKey(query, options);
    
    // Check cache first
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
        return cached.results;
      }
    }
    
    try {
      // 1. Query Understanding
      const processedQuery = await this.queryLayer.preprocessQuery(query);
      
      // 2. Multi-Source Retrieval
      const candidates = await this.retrievalLayer.searchProducts(processedQuery);
      
      // 3. E-commerce Filter & Deduplication (with ML classification)
      console.log('🔍 Starting e-commerce filtering...');
      const products = this.filterLayer.filterAndDeduplicate(candidates, processedQuery.category.mlResult);
      console.log(`✅ Filtering completed. Products after filtering: ${products.length}`);
      
      // 4. Semantic Matching & Relevance Scoring (Stage 4)
      console.log('🔍 Starting semantic matching and scoring...');
      const semanticallyScoredProducts = await this.semanticMatcher.calculateSemanticScores(
        products, 
        query, 
        processedQuery.category.mlResult
      );
      console.log(`✅ Semantic scoring completed. Scored products: ${semanticallyScoredProducts.length}`);
      
      // 5. Relevance & Ranking (enhanced with semantic scores)
      console.log('🔍 Starting enhanced relevance ranking...');
      const rankedProducts = this.rankingEngine.rankProducts(processedQuery, semanticallyScoredProducts);
      console.log(`✅ Enhanced ranking completed. Ranked products: ${rankedProducts.length}`);
      
      // 6. Advanced Filtering & Re-ranking (Stage 5)
      console.log('🔍 Starting advanced filtering and re-ranking...');
      console.log(`📊 Passing ML Classification to Stage 5:`, processedQuery.category.mlResult);
      const advancedFilteredProducts = await this.advancedFilter.applyAdvancedFiltering(
        rankedProducts, 
        query, 
        processedQuery.category.mlResult
      );
      console.log(`✅ Advanced filtering completed. Final products: ${advancedFilteredProducts.length}`);
      
      // 6. Result Packaging
      const results = this.formatResponse(advancedFilteredProducts.slice(0, CONFIG.TOP_N), query);
      
      // Cache results
      searchCache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });
      
      return results;
      
    } catch (error) {
      console.error('Product search failed:', error);
      throw error;
    }
  }

  generateCacheKey(query, options) {
    return `${query}_${JSON.stringify(options)}`;
  }

  formatResponse(products, query = '') {
            return {
          success: true,
          data: {
            searchInfo: {
              query: query,
              totalResults: products.length,
              searchTime: Date.now() // You can calculate actual search time if needed
            },
            products: products.map(product => ({
              id: product.id,
              title: product.title,
              price: product.price,
              currency: 'INR',
              availability: product.availability,
              rating: product.rating,
              reviews: product.reviews,
              seller: product.seller,
              domain: product.domain,
              url: product.buy_url || product.url, // Use buy_url as primary, fallback to url
          buy_url: product.buy_url,
          source_api: product.source_api,
          image: product.image,
          description: product.description
        })),
        searchInfo: {
          totalResults: products.length,
          searchTime: Date.now(),
          algorithm: 'comprehensive_product_search'
        }
      }
    };
  }

  // Cache management
  clearCache() {
    searchCache.clear();
  }

  getCacheStats() {
    return {
      size: searchCache.size,
      entries: Array.from(searchCache.keys())
    };
  }
}

export default ProductSearchService; 