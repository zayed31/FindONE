import axios from 'axios';

/**
 * Stage 4: Semantic Matching and Relevance Scoring Service
 * 
 * Implements hybrid search architecture combining:
 * - Lexical matching (BM25)
 * - Semantic similarity using transformer models
 * - Product attribute extraction
 * - Cross-modal understanding
 */
class SemanticMatchingService {
  constructor() {
    this.productAttributes = {
      storage: {
        patterns: [
          /(\d+)\s*(gb|tb|mb)/gi,
          /(\d+)\s*(gigabyte|terabyte|megabyte)/gi,
          /storage[:\s]*(\d+)\s*(gb|tb)/gi
        ],
        units: { gb: 1, tb: 1024, mb: 0.001 }
      },
      color: {
        patterns: [
          /(black|white|blue|red|green|yellow|purple|pink|gray|silver|gold|bronze)/gi,
          /(awesome\s+black|awesome\s+white|awesome\s+blue)/gi,
          /(light\s+blue|dark\s+gray|midnight\s+black)/gi
        ]
      },
      model: {
        patterns: [
          /(s\d+|a\d+|note\d+|z\s*fold|z\s*flip)/gi,
          /(iphone\s*\d+|pixel\s*\d+|oneplus\s*\d+)/gi,
          /(galaxy\s+s\d+|galaxy\s+a\d+|galaxy\s+note\d+)/gi
        ]
      },
      price: {
        patterns: [
          /₹\s*([\d,]+(?:\.[\d]{2})?)/gi,
          /rs\.?\s*([\d,]+(?:\.[\d]{2})?)/gi,
          /inr\s*([\d,]+(?:\.[\d]{2})?)/gi,
          /price[:\s]*₹\s*([\d,]+(?:\.[\d]{2})?)/gi,
          /cost[:\s]*₹\s*([\d,]+(?:\.[\d]{2})?)/gi,
          /mrp[:\s]*₹\s*([\d,]+(?:\.[\d]{2})?)/gi,
          /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:₹|rs\.?|inr)/gi
        ]
      },
      rating: {
        patterns: [
          /(\d+\.?\d*)\s*stars?/gi,
          /rating[:\s]*(\d+\.?\d*)/gi,
          /(\d+\.?\d*)\s*\/\s*5/gi
        ]
      }
    };

    this.semanticKeywords = {
      mobile_phones: {
        primary: ['smartphone', 'mobile', 'phone', 'cell', 'galaxy', 'iphone', 'pixel'],
        secondary: ['camera', 'battery', 'display', 'screen', 'processor', 'ram', 'storage'],
        exclusion: ['washing', 'refrigerator', 'tv', 'television', 'laptop', 'desktop']
      },
      home_appliances: {
        primary: ['washing', 'refrigerator', 'microwave', 'dishwasher', 'dryer', 'oven'],
        secondary: ['capacity', 'energy', 'efficiency', 'cycle', 'temperature'],
        exclusion: ['phone', 'smartphone', 'mobile', 'laptop', 'computer']
      },
      electronics: {
        primary: ['tv', 'television', 'monitor', 'speaker', 'headphones', 'earbuds'],
        secondary: ['screen', 'display', 'audio', 'sound', 'resolution', 'inches'],
        exclusion: ['phone', 'smartphone', 'washing', 'refrigerator']
      }
    };

    this.bm25Config = {
      k1: 1.2,
      b: 0.75,
      avgDocLength: 50
    };
  }

  /**
   * Main semantic matching and scoring function
   */
  async calculateSemanticScores(products, query, mlClassification) {
    console.log('🔍 Stage 4: Starting semantic matching and scoring...');
    console.log(`📝 Query: "${query}"`);
    console.log(`📊 Products to score: ${products.length}`);
    console.log(`🤖 ML Classification: ${mlClassification?.primaryCategory || 'none'}`);
    
    const queryInfo = this.extractQueryAttributes(query);
    console.log(`📋 Extracted query attributes:`, queryInfo);
    
    const enhancedProducts = await this.enhanceProductsWithAttributes(products);
    console.log(`✨ Enhanced ${enhancedProducts.length} products with attributes`);
    
    const scoredProducts = enhancedProducts.map(product => {
      const scores = {
        lexical: this.calculateBM25Score(product, query),
        semantic: this.calculateSemanticSimilarity(product, query, mlClassification),
        attribute: this.calculateAttributeMatchScore(product, queryInfo, mlClassification),
        crossModal: this.calculateCrossModalScore(product, query, mlClassification),
        relevance: 0
      };

      // Calculate weighted relevance score
      scores.relevance = this.calculateWeightedRelevance(scores, mlClassification);
      
      return {
        ...product,
        semanticScores: scores,
        relevanceScore: scores.relevance
      };
    });

    // Sort by relevance score
    const sortedProducts = scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log(`📊 Semantic scoring completed for ${sortedProducts.length} products`);
    console.log(`🏆 Top 3 relevance scores: ${sortedProducts.slice(0, 3).map(p => p.relevanceScore.toFixed(3)).join(', ')}`);
    
    return sortedProducts;
  }

  /**
   * Extract attributes from query using NLP techniques
   */
  extractQueryAttributes(query) {
    if (!query || typeof query !== 'string') {
      console.log('⚠️ Invalid query provided to extractQueryAttributes:', query);
      return {};
    }
    
    const queryLower = query.toLowerCase();
    const attributes = {};

    // Extract storage
    for (const pattern of this.productAttributes.storage.patterns) {
      const match = queryLower.match(pattern);
      if (match && match[1]) {
        const value = parseInt(match[1]);
        if (!isNaN(value)) {
          const unit = match[2]?.toLowerCase();
          attributes.storage = value * (this.productAttributes.storage.units[unit] || 1);
          break;
        }
      }
    }

    // Extract color
    for (const pattern of this.productAttributes.color.patterns) {
      const match = queryLower.match(pattern);
      if (match && match[1]) {
        attributes.color = match[1].toLowerCase();
        break;
      }
    }

    // Extract model
    for (const pattern of this.productAttributes.model.patterns) {
      const match = queryLower.match(pattern);
      if (match && match[1]) {
        attributes.model = match[1].toLowerCase();
        break;
      }
    }

    // Extract price range
    for (const pattern of this.productAttributes.price.patterns) {
      const match = queryLower.match(pattern);
      if (match && match[1]) {
        const value = parseInt(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          if (match[2]?.toLowerCase() === 'k') {
            attributes.priceRange = value * 1000;
          } else {
            attributes.priceRange = value;
          }
          break;
        }
      }
    }

    return attributes;
  }

  /**
   * Enhance products with extracted attributes
   */
  async enhanceProductsWithAttributes(products) {
    return products.map(product => {
      const enhanced = { ...product };
      const titleLower = (product.title || '').toLowerCase();
      const descriptionLower = (product.description || '').toLowerCase();
      const combinedText = `${titleLower} ${descriptionLower}`;

      // Extract storage
      for (const pattern of this.productAttributes.storage.patterns) {
        const match = combinedText.match(pattern);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          if (!isNaN(value)) {
            const unit = match[2]?.toLowerCase();
            enhanced.extractedStorage = value * (this.productAttributes.storage.units[unit] || 1);
            break;
          }
        }
      }

      // Extract color
      for (const pattern of this.productAttributes.color.patterns) {
        const match = combinedText.match(pattern);
        if (match && match[1]) {
          enhanced.extractedColor = match[1].toLowerCase();
          break;
        }
      }

      // Extract model
      for (const pattern of this.productAttributes.model.patterns) {
        const match = combinedText.match(pattern);
        if (match && match[1]) {
          enhanced.extractedModel = match[1].toLowerCase();
          break;
        }
      }

      // Extract rating
      for (const pattern of this.productAttributes.rating.patterns) {
        const match = combinedText.match(pattern);
        if (match && match[1]) {
          const value = parseFloat(match[1]);
          if (!isNaN(value)) {
            enhanced.extractedRating = value;
            break;
          }
        }
      }

      return enhanced;
    });
  }

  /**
   * Calculate BM25 lexical similarity score
   */
  calculateBM25Score(product, query) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const productText = `${product.title || ''} ${product.description || ''}`.toLowerCase();
    const docLength = productText.split(/\s+/).length;
    
    let score = 0;
    
    for (const term of queryTerms) {
      if (term.length < 2) continue;
      
      const termFreq = (productText.match(new RegExp(term, 'g')) || []).length;
      if (termFreq === 0) continue;
      
      const tf = termFreq / (termFreq + this.bm25Config.k1 * (1 - this.bm25Config.b + this.bm25Config.b * (docLength / this.bm25Config.avgDocLength)));
      score += tf;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate semantic similarity using keyword-based approach
   */
  calculateSemanticSimilarity(product, query, mlClassification) {
    const category = mlClassification?.primaryCategory || 'electronics';
    const keywords = this.semanticKeywords[category] || this.semanticKeywords.electronics;
    
    const productText = `${product.title || ''} ${product.description || ''}`.toLowerCase();
    const queryLower = query.toLowerCase();
    
    let primaryMatches = 0;
    let secondaryMatches = 0;
    let exclusionPenalty = 0;
    
    // Check primary keywords
    for (const keyword of keywords.primary) {
      if (productText.includes(keyword)) primaryMatches++;
      if (queryLower.includes(keyword)) primaryMatches++;
    }
    
    // Check secondary keywords
    for (const keyword of keywords.secondary) {
      if (productText.includes(keyword)) secondaryMatches++;
    }
    
    // Check exclusion keywords (penalty)
    for (const keyword of keywords.exclusion) {
      if (productText.includes(keyword)) exclusionPenalty += 0.2;
    }
    
    const primaryScore = primaryMatches / keywords.primary.length;
    const secondaryScore = secondaryMatches / keywords.secondary.length;
    const finalScore = (primaryScore * 0.7 + secondaryScore * 0.3) - exclusionPenalty;
    
    return Math.max(0, Math.min(1, finalScore));
  }

  /**
   * Calculate attribute matching score
   */
  calculateAttributeMatchScore(product, queryInfo, mlClassification) {
    let score = 0;
    let matches = 0;
    let totalChecks = 0;

    // Storage matching
    if (queryInfo.storage && product.extractedStorage) {
      totalChecks++;
      const storageDiff = Math.abs(queryInfo.storage - product.extractedStorage);
      const storageScore = Math.max(0, 1 - (storageDiff / Math.max(queryInfo.storage, product.extractedStorage)));
      score += storageScore;
      if (storageScore > 0.8) matches++;
    }

    // Color matching
    if (queryInfo.color && product.extractedColor) {
      totalChecks++;
      const colorScore = queryInfo.color === product.extractedColor ? 1 : 0;
      score += colorScore;
      if (colorScore > 0.8) matches++;
    }

    // Model matching
    if (queryInfo.model && product.extractedModel) {
      totalChecks++;
      const modelScore = queryInfo.model === product.extractedModel ? 1 : 0.5;
      score += modelScore;
      if (modelScore > 0.8) matches++;
    }

    // Price range matching
    if (queryInfo.priceRange && product.price) {
      totalChecks++;
      const productPrice = this.extractPriceValue(product.price);
      if (productPrice) {
        const priceDiff = Math.abs(queryInfo.priceRange - productPrice);
        const priceScore = Math.max(0, 1 - (priceDiff / Math.max(queryInfo.priceRange, productPrice)));
        score += priceScore;
        if (priceScore > 0.8) matches++;
      }
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  /**
   * Calculate cross-modal understanding score
   */
  calculateCrossModalScore(product, query, mlClassification) {
    const category = mlClassification?.primaryCategory || 'electronics';
    let score = 0;

    // Image-text consistency (simulated)
    if (product.image && product.title) {
      const titleLower = product.title.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Check if image URL contains relevant keywords
      const imageUrl = product.image.toLowerCase();
      const hasRelevantImage = imageUrl.includes('phone') || 
                              imageUrl.includes('mobile') || 
                              imageUrl.includes('galaxy') ||
                              imageUrl.includes('iphone');
      
      if (hasRelevantImage && (titleLower.includes('phone') || titleLower.includes('mobile'))) {
        score += 0.3;
      }
    }

    // Specification-text consistency
    if (product.description && product.title) {
      const descLower = product.description.toLowerCase();
      const titleLower = product.title.toLowerCase();
      
      // Check for technical specification consistency
      const hasCamera = descLower.includes('camera') || descLower.includes('mp');
      const hasBattery = descLower.includes('battery') || descLower.includes('mah');
      const hasDisplay = descLower.includes('display') || descLower.includes('screen');
      
      if (hasCamera || hasBattery || hasDisplay) {
        score += 0.2;
      }
    }

    // Category consistency
    const categoryKeywords = this.semanticKeywords[category]?.primary || [];
    const productText = `${product.title || ''} ${product.description || ''}`.toLowerCase();
    
    const categoryMatches = categoryKeywords.filter(keyword => 
      productText.includes(keyword)
    ).length;
    
    score += (categoryMatches / categoryKeywords.length) * 0.5;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate weighted relevance score
   */
  calculateWeightedRelevance(scores, mlClassification) {
    const confidence = mlClassification?.confidence || 0.5;
    
    // Adjust weights based on classification confidence
    const weights = {
      lexical: 0.25,
      semantic: 0.35,
      attribute: 0.25,
      crossModal: 0.15
    };

    // Boost semantic score for high-confidence classifications
    if (confidence > 0.8) {
      weights.semantic += 0.1;
      weights.lexical -= 0.05;
      weights.attribute -= 0.05;
    }

    const weightedScore = 
      scores.lexical * weights.lexical +
      scores.semantic * weights.semantic +
      scores.attribute * weights.attribute +
      scores.crossModal * weights.crossModal;

    return Math.min(weightedScore, 1.0);
  }

  /**
   * Extract numeric price value from price string
   */
  extractPriceValue(priceString) {
    if (!priceString) return null;
    
    const match = priceString.toString().match(/₹\s*([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    
    return null;
  }

  /**
   * Get semantic analysis statistics
   */
  getSemanticStats() {
    return {
      service: 'SemanticMatchingService',
      version: '1.0',
      features: [
        'BM25 Lexical Scoring',
        'Semantic Similarity',
        'Attribute Matching',
        'Cross-Modal Understanding',
        'Weighted Relevance Scoring'
      ]
    };
  }
}

export default SemanticMatchingService; 