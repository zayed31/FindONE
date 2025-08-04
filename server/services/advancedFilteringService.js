import { extractDomain } from '../utils/helpers.js';

/**
 * Stage 5: Advanced Filtering and Re-ranking Service
 * 
 * Implements multi-layer filtering and sophisticated ranking:
 * - Category-Level Filtering
 * - Brand-Model Filtering  
 * - Specification Filtering
 * - Geographic Filtering
 * - Reciprocal Rank Fusion (RRF)
 * - Business Rule Application
 */
class AdvancedFilteringService {
  constructor() {
    // Category-specific filtering rules
    this.categoryFilters = {
      mobile_phones: {
        inclusion: ['phone', 'smartphone', 'mobile', 'galaxy', 'iphone', 'pixel', 'oneplus', '5g', 'ram', 'storage'],
        exclusion: ['washing', 'refrigerator', 'tv', 'television', 'laptop', 'desktop', 'tablet'],
        specifications: ['camera', 'battery', 'display', 'processor', 'ram', 'storage', 'mah', 'mp', '5g', 'gb'],
        brands: ['samsung', 'apple', 'google', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'realme']
      },
      home_appliances: {
        inclusion: ['washing', 'refrigerator', 'microwave', 'dishwasher', 'dryer', 'oven', 'ac'],
        exclusion: ['phone', 'smartphone', 'mobile', 'laptop', 'computer', 'tablet'],
        specifications: ['capacity', 'energy', 'efficiency', 'cycle', 'temperature', 'kg', 'liters'],
        brands: ['samsung', 'lg', 'whirlpool', 'bosch', 'haier', 'godrej', 'voltas']
      },
      electronics: {
        inclusion: ['tv', 'television', 'monitor', 'speaker', 'headphones', 'earbuds'],
        exclusion: ['phone', 'smartphone', 'washing', 'refrigerator', 'laptop'],
        specifications: ['screen', 'display', 'audio', 'sound', 'resolution', 'inches'],
        brands: ['samsung', 'lg', 'sony', 'bose', 'jbl', 'canon', 'nikon']
      }
    };

    // Indian e-commerce domains (geographic filtering)
    this.indianRetailers = [
      'flipkart.com', 'amazon.in', 'snapdeal.com', 'croma.com', 'reliancedigital.in',
      'paytmmall.com', 'tatacliq.com', 'vijaysales.com', 'shopclues.com', 'myntra.com'
    ];

    // Seller reputation scores (business rules)
    this.sellerReputation = {
      'flipkart.com': 0.95,
      'amazon.in': 0.98,
      'snapdeal.com': 0.85,
      'croma.com': 0.90,
      'reliancedigital.in': 0.88,
      'paytmmall.com': 0.82,
      'tatacliq.com': 0.87,
      'vijaysales.com': 0.85,
      'shopclues.com': 0.75,
      'myntra.com': 0.80
    };

    // RRF configuration
    this.rrfConfig = {
      k: 60, // RRF constant
      weights: {
        primary: 1.0,
        secondary: 0.8,
        tertiary: 0.6
      }
    };

    // Business rule weights
    this.businessWeights = {
      sellerReputation: 0.25,
      availability: 0.20,
      priceReasonableness: 0.25,
      rating: 0.15,
      reviewCount: 0.15
    };
  }

  /**
   * Main advanced filtering and re-ranking function
   */
  async applyAdvancedFiltering(products, query, mlClassification) {
    console.log('🎯 Stage 5: Starting advanced filtering and re-ranking...');
    console.log(`📊 Products to filter: ${products.length}`);
    console.log(`🎯 Target category: ${mlClassification?.primaryCategory || 'unknown'}`);

    const startTime = Date.now();

    try {
      // 1. Multi-layer filtering
      const filteredProducts = await this.applyMultiLayerFiltering(products, query, mlClassification);
      console.log(`✅ Multi-layer filtering completed: ${filteredProducts.length} products passed`);

      // 2. Reciprocal Rank Fusion (RRF)
      const rrfRankedProducts = this.applyReciprocalRankFusion(filteredProducts, query);
      console.log(`✅ RRF ranking completed: ${rrfRankedProducts.length} products ranked`);

      // 3. Business rule application
      const finalRankedProducts = this.applyBusinessRules(rrfRankedProducts, query, mlClassification);
      console.log(`✅ Business rules applied: ${finalRankedProducts.length} products in final ranking`);

      const processingTime = Date.now() - startTime;
      console.log(`⏱️ Stage 5 completed in ${processingTime}ms`);

      // Fallback: If no products passed filtering, return original products with basic ranking
      if (finalRankedProducts.length === 0) {
        console.log(`⚠️ No products passed advanced filtering. Returning original products with basic ranking...`);
        return products.map(product => ({
          ...product,
          finalScore: 0.5, // Default score
          rrfScore: 0.5,
          businessScore: 0.5
        }));
      }

      return finalRankedProducts;

    } catch (error) {
      console.error('❌ Advanced filtering failed:', error.message);
      return products; // Return original products if filtering fails
    }
  }

  /**
   * Apply multi-layer filtering
   */
  async applyMultiLayerFiltering(products, query, mlClassification) {
    // Extract category from ML classification properly
    let category = 'electronics'; // default fallback
    
    if (mlClassification?.primary?.category) {
      category = mlClassification.primary.category;
    } else if (mlClassification?.primaryCategory) {
      category = mlClassification.primaryCategory;
    } else if (typeof mlClassification === 'string') {
      category = mlClassification;
    }
    
    const categoryFilter = this.categoryFilters[category] || this.categoryFilters.electronics;
    
    console.log(`🔍 Applying multi-layer filtering for category: ${category}`);
    console.log(`📊 ML Classification received:`, mlClassification);

    const filteredProducts = products.filter(product => {
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const combinedText = `${title} ${description}`;

      // 1. Category-Level Filtering
      if (!this.passesCategoryFilter(combinedText, categoryFilter)) {
        console.log(`   ❌ Category filter failed: "${product.title}"`);
        console.log(`   📝 Text: "${combinedText.substring(0, 100)}..."`);
        return false;
      }

      // 2. Brand-Model Filtering
      if (!this.passesBrandModelFilter(product, query, categoryFilter)) {
        console.log(`   ❌ Brand-model filter failed: "${product.title}"`);
        return false;
      }

      // 3. Specification Filtering
      if (!this.passesSpecificationFilter(combinedText, categoryFilter)) {
        console.log(`   ❌ Specification filter failed: "${product.title}"`);
        console.log(`   📝 Text: "${combinedText.substring(0, 100)}..."`);
        return false;
      }

      // 4. Geographic Filtering
      if (!this.passesGeographicFilter(product)) {
        console.log(`   ❌ Geographic filter failed: "${product.title}"`);
        return false;
      }

      console.log(`   ✅ All filters passed: "${product.title}"`);
      return true;
    });

    return filteredProducts;
  }

  /**
   * Category-level filtering
   */
  passesCategoryFilter(text, categoryFilter) {
    // Check for inclusion keywords
    const hasInclusion = categoryFilter.inclusion.some(keyword => 
      text.includes(keyword)
    );

    // Check for exclusion keywords (penalty)
    const hasExclusion = categoryFilter.exclusion.some(keyword => 
      text.includes(keyword)
    );

    // For mobile phones, also check for brand-specific terms
    if (categoryFilter.brands && categoryFilter.brands.length > 0) {
      const hasBrandTerms = categoryFilter.brands.some(brand => 
        text.includes(brand)
      );
      
      // Must have either inclusion keywords OR brand terms, and no exclusion keywords
      return (hasInclusion || hasBrandTerms) && !hasExclusion;
    }

    // Must have inclusion keywords and no exclusion keywords
    return hasInclusion && !hasExclusion;
  }

  /**
   * Brand-model filtering
   */
  passesBrandModelFilter(product, query, categoryFilter) {
    const title = (product.title || '').toLowerCase();
    const queryLower = query.toLowerCase();

    // Extract brand and model from query
    const queryBrand = this.extractBrandFromQuery(queryLower, categoryFilter.brands);
    const queryModel = this.extractModelFromQuery(queryLower);

    // Extract brand and model from product title
    const productBrand = this.extractBrandFromTitle(title, categoryFilter.brands);
    const productModel = this.extractModelFromTitle(title);

    // Brand matching (exact or close match)
    if (queryBrand && productBrand) {
      if (!this.isBrandMatch(queryBrand, productBrand)) {
        return false;
      }
    }

    // Model matching (exact or partial match)
    if (queryModel && productModel) {
      if (!this.isModelMatch(queryModel, productModel)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Specification filtering
   */
  passesSpecificationFilter(text, categoryFilter) {
    // Check if product has relevant specifications
    const hasSpecifications = categoryFilter.specifications.some(spec => 
      text.includes(spec)
    );

    // For mobile phones, also check for common smartphone terms
    if (categoryFilter.brands && categoryFilter.brands.length > 0) {
      const hasSmartphoneTerms = text.includes('galaxy') || 
                                text.includes('smartphone') || 
                                text.includes('mobile') || 
                                text.includes('phone') ||
                                text.includes('5g') ||
                                text.includes('ram') ||
                                text.includes('storage');
      
      return hasSpecifications || hasSmartphoneTerms;
    }

    return hasSpecifications;
  }

  /**
   * Geographic filtering
   */
  passesGeographicFilter(product) {
    const domain = product.domain || this.extractDomain(product.url || product.buy_url);
    
    // Always allow major international retailers and manufacturers
    const internationalRetailers = [
      'apple.com', 'samsung.com', 'google.com', 'bestbuy.com', 'amazon.com',
      'ebay.com', 'walmart.com', 'target.com', 'costco.com', 'microcenter.com',
      'bhphotovideo.com', 'adorama.com', 'newegg.com', 'b&h.com'
    ];
    
    // Check if it's an international retailer
    if (internationalRetailers.some(retailer => domain.includes(retailer))) {
      return true;
    }
    
    // Prioritize Indian retailers
    if (this.indianRetailers.includes(domain) || domain.includes('.in')) {
      return true;
    }
    
    // Allow other domains but with lower priority
    return true;
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    if (!url) return '';
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (error) {
      return '';
    }
  }

  /**
   * Apply Reciprocal Rank Fusion (RRF)
   */
  applyReciprocalRankFusion(products, query) {
    console.log('🔄 Applying Reciprocal Rank Fusion (RRF)...');

    // Group products by source type
    const sourceGroups = {
      primary: products.filter(p => p.source_api && ['Flipkart', 'Amazon India', 'Snapdeal'].includes(p.source_api)),
      secondary: products.filter(p => p.source_api && ['Paytm Mall', 'Tata CLiQ', 'Vijay Sales'].includes(p.source_api)),
      tertiary: products.filter(p => p.source_api && ['PriceBaba', 'MySmartPrice', 'Gadgets360'].includes(p.source_api))
    };

    // Calculate RRF scores
    const rrfScores = new Map();

    Object.entries(sourceGroups).forEach(([sourceType, sourceProducts]) => {
      const weight = this.rrfConfig.weights[sourceType] || 0.5;
      
      sourceProducts.forEach((product, index) => {
        const rank = index + 1;
        const rrfScore = weight / (this.rrfConfig.k + rank);
        
        if (rrfScores.has(product.id)) {
          rrfScores.set(product.id, rrfScores.get(product.id) + rrfScore);
        } else {
          rrfScores.set(product.id, rrfScore);
        }
      });
    });

    // Apply RRF scores and sort
    const rrfRankedProducts = products
      .map(product => ({
        ...product,
        rrfScore: rrfScores.get(product.id) || 0
      }))
      .sort((a, b) => b.rrfScore - a.rrfScore);

    console.log(`📊 RRF scores calculated for ${rrfRankedProducts.length} products`);
    console.log(`🏆 Top 3 RRF scores: ${rrfRankedProducts.slice(0, 3).map(p => p.rrfScore.toFixed(4)).join(', ')}`);

    return rrfRankedProducts;
  }

  /**
   * Apply business rules
   */
  applyBusinessRules(products, query, mlClassification) {
    console.log('💼 Applying business rules...');

    const scoredProducts = products.map(product => {
      const businessScore = this.calculateBusinessScore(product, query, mlClassification);
      
      return {
        ...product,
        businessScore,
        finalScore: (product.rrfScore * 0.6) + (businessScore * 0.4) // Combine RRF and business scores
      };
    });

    // Sort by final score
    const finalRankedProducts = scoredProducts.sort((a, b) => b.finalScore - a.finalScore);

    console.log(`📊 Business scores calculated for ${finalRankedProducts.length} products`);
    console.log(`🏆 Top 3 final scores: ${finalRankedProducts.slice(0, 3).map(p => p.finalScore.toFixed(4)).join(', ')}`);

    return finalRankedProducts;
  }

  /**
   * Calculate business score based on various factors
   */
  calculateBusinessScore(product, query, mlClassification) {
    let score = 0;

    // 1. Seller reputation
    const domain = product.domain || extractDomain(product.url || product.buy_url);
    const sellerReputation = this.sellerReputation[domain] || 0.5;
    score += sellerReputation * this.businessWeights.sellerReputation;

    // 2. Availability
    const availability = this.calculateAvailabilityScore(product);
    score += availability * this.businessWeights.availability;

    // 3. Price reasonableness
    const priceReasonableness = this.calculatePriceReasonableness(product, mlClassification);
    score += priceReasonableness * this.businessWeights.priceReasonableness;

    // 4. Rating
    const rating = this.calculateRatingScore(product);
    score += rating * this.businessWeights.rating;

    // 5. Review count
    const reviewCount = this.calculateReviewCountScore(product);
    score += reviewCount * this.businessWeights.reviewCount;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate availability score
   */
  calculateAvailabilityScore(product) {
    const availability = (product.availability || '').toLowerCase();
    
    if (availability.includes('in stock') || availability.includes('available')) {
      return 1.0;
    } else if (availability.includes('out of stock') || availability.includes('unavailable')) {
      return 0.0;
    } else {
      return 0.5; // Unknown availability
    }
  }

  /**
   * Calculate price reasonableness score
   */
  calculatePriceReasonableness(product, mlClassification) {
    const price = this.extractPriceValue(product.price);
    if (!price) return 0.5;

    const category = mlClassification?.primaryCategory || 'electronics';
    
    // Define reasonable price ranges for different categories
    const priceRanges = {
      mobile_phones: { min: 5000, max: 150000, optimal: 25000 },
      home_appliances: { min: 2000, max: 100000, optimal: 15000 },
      electronics: { min: 1000, max: 50000, optimal: 8000 }
    };

    const range = priceRanges[category] || priceRanges.electronics;

    if (price < range.min || price > range.max) {
      return 0.2; // Unreasonable price
    }

    // Calculate distance from optimal price
    const distance = Math.abs(price - range.optimal);
    const maxDistance = range.max - range.min;
    const score = 1.0 - (distance / maxDistance);

    return Math.max(0.3, score); // Minimum score of 0.3 for reasonable prices
  }

  /**
   * Calculate rating score
   */
  calculateRatingScore(product) {
    const rating = parseFloat(product.rating);
    if (!rating || isNaN(rating)) return 0.5;

    // Normalize rating (assuming 5-star scale)
    return Math.min(rating / 5.0, 1.0);
  }

  /**
   * Calculate review count score
   */
  calculateReviewCountScore(product) {
    const reviews = parseInt(product.reviews);
    if (!reviews || isNaN(reviews)) return 0.5;

    // Logarithmic scaling for review count
    const logReviews = Math.log10(reviews + 1);
    const maxLogReviews = Math.log10(10000 + 1); // Cap at 10k reviews

    return Math.min(logReviews / maxLogReviews, 1.0);
  }

  /**
   * Extract brand from query
   */
  extractBrandFromQuery(query, validBrands) {
    return validBrands.find(brand => query.includes(brand)) || null;
  }

  /**
   * Extract model from query
   */
  extractModelFromQuery(query) {
    // Common model patterns
    const modelPatterns = [
      /(s\d+|a\d+|note\d+|z\s*fold|z\s*flip)/i,
      /(iphone\s*\d+|pixel\s*\d+|oneplus\s*\d+)/i,
      /(galaxy\s+s\d+|galaxy\s+a\d+|galaxy\s+note\d+)/i
    ];

    for (const pattern of modelPatterns) {
      const match = query.match(pattern);
      if (match) return match[1].toLowerCase();
    }

    return null;
  }

  /**
   * Extract brand from title
   */
  extractBrandFromTitle(title, validBrands) {
    return validBrands.find(brand => title.includes(brand)) || null;
  }

  /**
   * Extract model from title
   */
  extractModelFromTitle(title) {
    // Same patterns as query extraction
    const modelPatterns = [
      /(s\d+|a\d+|note\d+|z\s*fold|z\s*flip)/i,
      /(iphone\s*\d+|pixel\s*\d+|oneplus\s*\d+)/i,
      /(galaxy\s+s\d+|galaxy\s+a\d+|galaxy\s+note\d+)/i
    ];

    for (const pattern of modelPatterns) {
      const match = title.match(pattern);
      if (match) return match[1].toLowerCase();
    }

    return null;
  }

  /**
   * Check if brands match
   */
  isBrandMatch(queryBrand, productBrand) {
    return queryBrand === productBrand;
  }

  /**
   * Check if models match
   */
  isModelMatch(queryModel, productModel) {
    // Exact match
    if (queryModel === productModel) return true;

    // Partial match (e.g., "s25" matches "s25 ultra")
    if (productModel.includes(queryModel) || queryModel.includes(productModel)) {
      return true;
    }

    // Number variations (e.g., "s25" matches "s25+", "s25 ultra")
    const queryNumber = queryModel.match(/\d+/);
    const productNumber = productModel.match(/\d+/);
    
    if (queryNumber && productNumber && queryNumber[0] === productNumber[0]) {
      return true;
    }

    return false;
  }

  /**
   * Extract numeric price value
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
   * Get filtering statistics
   */
  getFilteringStats() {
    return {
      service: 'AdvancedFilteringService',
      version: '1.0',
      features: [
        'Multi-Layer Filtering',
        'Category-Level Filtering',
        'Brand-Model Filtering',
        'Specification Filtering',
        'Geographic Filtering',
        'Reciprocal Rank Fusion (RRF)',
        'Business Rule Application'
      ],
      indianRetailers: this.indianRetailers.length,
      sellerReputation: Object.keys(this.sellerReputation).length
    };
  }
}

export default AdvancedFilteringService; 