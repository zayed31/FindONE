import axios from 'axios';

/**
 * Stage 2: Machine Learning-Powered Product Classification
 * 
 * This service implements multiple classification approaches:
 * 1. Zero-shot classification using pre-trained models
 * 2. Feature-based classification using extracted attributes
 * 3. Ensemble classification combining multiple approaches
 * 4. Confidence scoring and uncertainty quantification
 */

class MLClassificationService {
  constructor() {
    // Product categories with detailed descriptions for zero-shot classification
    this.productCategories = {
      'mobile_phones': {
        description: 'smartphones, mobile phones, cell phones, handheld devices with calling and internet capabilities',
        keywords: ['phone', 'smartphone', 'mobile', 'cell', 'galaxy', 'iphone', 'pixel', 'oneplus', 'xiaomi', 'oppo', 'vivo'],
        brands: ['samsung', 'apple', 'google', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'motorola'],
                 modelPatterns: {
           'samsung': ['galaxy s', 'galaxy note', 'galaxy a', 'galaxy m', 'galaxy z', 'a series'],
          'apple': ['iphone'],
          'google': ['pixel'],
          'oneplus': ['oneplus'],
          'xiaomi': ['mi', 'redmi', 'poco'],
          'oppo': ['find x', 'reno', 'a series'],
          'vivo': ['x series', 'v series', 'y series']
        },
        priceRange: { min: 5000, max: 150000 },
        features: ['camera', 'battery', 'screen', 'processor', 'storage', 'ram']
      },
      'home_appliances': {
        description: 'household appliances for daily use like washing machines, refrigerators, microwaves, dishwashers',
        keywords: ['washing machine', 'refrigerator', 'microwave', 'dishwasher', 'dryer', 'oven', 'stove', 'ac', 'air conditioner'],
        brands: ['samsung', 'lg', 'whirlpool', 'bosch', 'haier', 'godrej', 'voltas'],
        modelPatterns: {
          'samsung': ['ecobubble', 'addwash', 'quickdrive'],
          'lg': ['twinwash', 'inverter', 'side by side'],
          'whirlpool': ['intellisense', 'steam care']
        },
        priceRange: { min: 5000, max: 100000 },
        features: ['capacity', 'energy rating', 'wash programs', 'cooling system']
      },
      'electronics': {
        description: 'electronic devices like televisions, monitors, speakers, headphones, cameras, gaming consoles',
        keywords: ['tv', 'television', 'monitor', 'speaker', 'headphones', 'earbuds', 'camera', 'gaming'],
        brands: ['samsung', 'lg', 'sony', 'bose', 'jbl', 'canon', 'nikon'],
        modelPatterns: {
          'samsung': ['qled', 'oled', 'crystal uhd'],
          'lg': ['oled', 'nano cell', 'webos'],
          'sony': ['bravia', 'xperia']
        },
        priceRange: { min: 1000, max: 200000 },
        features: ['screen size', 'resolution', 'audio quality', 'connectivity']
      },
      'computers': {
        description: 'computing devices like laptops, desktops, tablets, computers for work and personal use',
        keywords: ['laptop', 'desktop', 'tablet', 'computer', 'pc', 'macbook', 'chromebook'],
        brands: ['apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'samsung'],
        modelPatterns: {
          'apple': ['macbook air', 'macbook pro', 'imac', 'mac mini'],
          'dell': ['inspiron', 'xps', 'latitude', 'precision'],
          'hp': ['pavilion', 'envy', 'spectre', 'omen']
        },
        priceRange: { min: 15000, max: 300000 },
        features: ['processor', 'ram', 'storage', 'graphics', 'display']
      }
    };

    // Feature extraction weights for different classification methods
    this.featureWeights = {
      brandMatch: 0.3,
      modelPattern: 0.25,
      keywordMatch: 0.2,
      priceRange: 0.1,
      featureMatch: 0.15
    };

    // Confidence thresholds
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  /**
   * Main classification method that orchestrates all classification approaches
   */
  async classifyProduct(query, attributes, intent) {
    console.log('🤖 Stage 2: ML-Powered Classification for:', query);
    
    try {
      // 1. Zero-shot classification
      const zeroShotResult = await this.zeroShotClassification(query);
      console.log('   📊 Zero-shot result:', zeroShotResult);
      
      // 2. Feature-based classification
      const featureResult = this.featureBasedClassification(query, attributes);
      console.log('   🔧 Feature-based result:', featureResult);
      
      // 3. Rule-based classification
      const ruleResult = this.ruleBasedClassification(query, attributes);
      console.log('   📋 Rule-based result:', ruleResult);
      
      // 4. Ensemble classification
      const ensembleResult = this.ensembleClassification([
        zeroShotResult,
        featureResult,
        ruleResult
      ]);
      
      console.log('   🎯 Final ensemble result:', ensembleResult);
      console.log('   ✅ Stage 2 completed successfully');
      
      return ensembleResult;
      
    } catch (error) {
      console.error('   ❌ ML Classification failed:', error.message);
      // Fallback to rule-based classification
      return this.ruleBasedClassification(query, attributes);
    }
  }

  /**
   * Zero-shot classification using pre-trained models
   * This simulates using a service like Hugging Face or OpenAI
   */
  async zeroShotClassification(query) {
    try {
      // Simulate zero-shot classification API call
      // In production, this would call a real ML service
      const candidateLabels = Object.keys(this.productCategories);
      const categoryDescriptions = candidateLabels.map(category => 
        this.productCategories[category].description
      );
      
      // Calculate similarity scores based on keyword matching
      const scores = candidateLabels.map((category, index) => {
        const categoryInfo = this.productCategories[category];
        let score = 0;
        
        // Check keyword matches
        for (const keyword of categoryInfo.keywords) {
          if (query.toLowerCase().includes(keyword.toLowerCase())) {
            score += 0.3;
          }
        }
        
        // Check brand matches
        if (categoryInfo.brands.some(brand => 
          query.toLowerCase().includes(brand.toLowerCase())
        )) {
          score += 0.4;
        }
        
        // Normalize score
        score = Math.min(score, 1.0);
        
        return {
          category,
          score,
          confidence: score,
          method: 'zero_shot'
        };
      });
      
      // Sort by score and return top result
      scores.sort((a, b) => b.score - a.score);
      
      return {
        primary: scores[0],
        alternatives: scores.slice(1, 3),
        method: 'zero_shot'
      };
      
    } catch (error) {
      console.error('Zero-shot classification error:', error);
      return {
        primary: { category: 'electronics', score: 0.5, confidence: 0.5, method: 'zero_shot' },
        alternatives: [],
        method: 'zero_shot'
      };
    }
  }

  /**
   * Feature-based classification using extracted attributes
   */
  featureBasedClassification(query, attributes) {
    const scores = {};
    
    for (const [category, categoryInfo] of Object.entries(this.productCategories)) {
      let score = 0;
      let confidence = 0.5;
      
      // Brand match scoring
      if (attributes.brand && categoryInfo.brands.includes(attributes.brand)) {
        score += this.featureWeights.brandMatch;
        confidence += 0.2;
      }
      
      // Model pattern scoring
      if (attributes.brand && attributes.model && categoryInfo.modelPatterns[attributes.brand]) {
        const modelPatterns = categoryInfo.modelPatterns[attributes.brand];
        for (const pattern of modelPatterns) {
          if (attributes.model.toLowerCase().includes(pattern.toLowerCase()) ||
              (attributes.series && attributes.series.toLowerCase().includes(pattern.toLowerCase()))) {
            score += this.featureWeights.modelPattern;
            confidence += 0.3;
            break;
          }
        }
      }
      
      // Keyword match scoring
      for (const keyword of categoryInfo.keywords) {
        if (query.toLowerCase().includes(keyword.toLowerCase())) {
          score += this.featureWeights.keywordMatch;
          confidence += 0.1;
          break;
        }
      }
      
      // Price range scoring (if available)
      if (attributes.priceRange) {
        const price = parseFloat(attributes.priceRange);
        if (price >= categoryInfo.priceRange.min && price <= categoryInfo.priceRange.max) {
          score += this.featureWeights.priceRange;
          confidence += 0.1;
        }
      }
      
      // Feature match scoring
      if (attributes.features) {
        for (const feature of attributes.features) {
          if (categoryInfo.features.some(catFeature => 
            feature.toLowerCase().includes(catFeature.toLowerCase())
          )) {
            score += this.featureWeights.featureMatch;
            confidence += 0.1;
            break;
          }
        }
      }
      
      scores[category] = {
        category,
        score: Math.min(score, 1.0),
        confidence: Math.min(confidence, 1.0),
        method: 'feature_based'
      };
    }
    
    // Sort by score
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    
    return {
      primary: sortedScores[0],
      alternatives: sortedScores.slice(1, 3),
      method: 'feature_based'
    };
  }

  /**
   * Rule-based classification using explicit rules and patterns
   */
  ruleBasedClassification(query, attributes) {
    const rules = [
             // High-confidence rules for specific model patterns
       {
         condition: (query, attrs) => 
           attrs.brand === 'samsung' && 
           attrs.series && 
           (attrs.series.toLowerCase().includes('s') || attrs.series.toLowerCase().includes('galaxy')) &&
           attrs.model && 
           (attrs.model.toLowerCase().startsWith('s') || attrs.model.toLowerCase().includes('fe')) &&
           parseInt(attrs.series.match(/\d+/)?.[0] || attrs.model.match(/\d+/)?.[0] || '0') >= 1 &&
           parseInt(attrs.series.match(/\d+/)?.[0] || attrs.model.match(/\d+/)?.[0] || '0') <= 25,
         category: 'mobile_phones',
         confidence: 0.95,
         reason: 'Samsung Galaxy S series pattern'
       },
       {
         condition: (query, attrs) => 
           attrs.brand === 'samsung' && 
           attrs.model && 
           attrs.model.toLowerCase().startsWith('a') &&
           parseInt(attrs.model.match(/\d+/)?.[0] || '0') >= 1 &&
           parseInt(attrs.model.match(/\d+/)?.[0] || '0') <= 100,
         category: 'mobile_phones',
         confidence: 0.95,
         reason: 'Samsung Galaxy A series pattern'
       },
      {
        condition: (query, attrs) => 
          attrs.brand === 'apple' && 
          attrs.model && 
          attrs.model.toLowerCase().includes('iphone') &&
          parseInt(attrs.model.match(/\d+/)?.[0] || '0') >= 1 &&
          parseInt(attrs.model.match(/\d+/)?.[0] || '0') <= 15,
        category: 'mobile_phones',
        confidence: 0.95,
        reason: 'Apple iPhone series pattern'
      },
      {
        condition: (query, attrs) => 
          query.toLowerCase().includes('washing machine') ||
          query.toLowerCase().includes('refrigerator') ||
          query.toLowerCase().includes('microwave') ||
          query.toLowerCase().includes('dishwasher'),
        category: 'home_appliances',
        confidence: 0.9,
        reason: 'Home appliance keywords'
      },
      {
        condition: (query, attrs) => 
          query.toLowerCase().includes('tv') ||
          query.toLowerCase().includes('television') ||
          query.toLowerCase().includes('monitor') ||
          query.toLowerCase().includes('speaker') ||
          query.toLowerCase().includes('headphones'),
        category: 'electronics',
        confidence: 0.85,
        reason: 'Electronics keywords'
      },
      {
        condition: (query, attrs) => 
          query.toLowerCase().includes('laptop') ||
          query.toLowerCase().includes('desktop') ||
          query.toLowerCase().includes('computer') ||
          query.toLowerCase().includes('macbook'),
        category: 'computers',
        confidence: 0.85,
        reason: 'Computer keywords'
      }
    ];
    
    // Apply rules in order of priority
    for (const rule of rules) {
      if (rule.condition(query, attributes)) {
        return {
          primary: {
            category: rule.category,
            score: rule.confidence,
            confidence: rule.confidence,
            method: 'rule_based',
            reason: rule.reason
          },
          alternatives: [],
          method: 'rule_based'
        };
      }
    }
    
    // Default fallback
    return {
      primary: {
        category: 'electronics',
        score: 0.5,
        confidence: 0.5,
        method: 'rule_based',
        reason: 'Default fallback'
      },
      alternatives: [],
      method: 'rule_based'
    };
  }

  /**
   * Ensemble classification combining multiple approaches
   */
  ensembleClassification(results) {
    const categoryScores = {};
    const methodWeights = {
      'rule_based': 0.4,    // Highest weight for explicit rules
      'feature_based': 0.35, // Good weight for feature matching
      'zero_shot': 0.25     // Lower weight for ML-based approach
    };
    
    // Aggregate scores from all methods
    for (const result of results) {
      const weight = methodWeights[result.method] || 0.1;
      
      // Primary result
      const primary = result.primary;
      if (!categoryScores[primary.category]) {
        categoryScores[primary.category] = {
          category: primary.category,
          totalScore: 0,
          weightedScore: 0,
          confidence: 0,
          methods: [],
          reasons: []
        };
      }
      
      categoryScores[primary.category].totalScore += primary.score;
      categoryScores[primary.category].weightedScore += primary.score * weight;
      categoryScores[primary.category].confidence = Math.max(
        categoryScores[primary.category].confidence,
        primary.confidence
      );
      categoryScores[primary.category].methods.push(result.method);
      if (primary.reason) {
        categoryScores[primary.category].reasons.push(primary.reason);
      }
      
      // Alternative results
      for (const alt of result.alternatives) {
        if (!categoryScores[alt.category]) {
          categoryScores[alt.category] = {
            category: alt.category,
            totalScore: 0,
            weightedScore: 0,
            confidence: 0,
            methods: [],
            reasons: []
          };
        }
        
        categoryScores[alt.category].totalScore += alt.score * 0.5; // Reduced weight for alternatives
        categoryScores[alt.category].weightedScore += alt.score * weight * 0.5;
        categoryScores[alt.category].methods.push(result.method);
        if (alt.reason) {
          categoryScores[alt.category].reasons.push(alt.reason);
        }
      }
    }
    
    // Sort by weighted score
    const sortedCategories = Object.values(categoryScores)
      .sort((a, b) => b.weightedScore - a.weightedScore);
    
    const primary = sortedCategories[0];
    const alternatives = sortedCategories.slice(1, 3);
    
    // Calculate ensemble confidence
    const ensembleConfidence = this.calculateEnsembleConfidence(primary, alternatives);
    
    return {
      primary: {
        category: primary.category,
        score: primary.weightedScore,
        confidence: ensembleConfidence,
        method: 'ensemble',
        methods: primary.methods,
        reasons: primary.reasons
      },
      alternatives: alternatives.map(alt => ({
        category: alt.category,
        score: alt.weightedScore,
        confidence: alt.confidence,
        method: 'ensemble',
        methods: alt.methods,
        reasons: alt.reasons
      })),
      method: 'ensemble',
      uncertainty: this.calculateUncertainty(sortedCategories)
    };
  }

  /**
   * Calculate ensemble confidence based on agreement between methods
   */
  calculateEnsembleConfidence(primary, alternatives) {
    let confidence = primary.weightedScore;
    
    // Boost confidence if multiple methods agree
    if (primary.methods.length > 1) {
      confidence += 0.1;
    }
    
    // Reduce confidence if alternatives are close
    if (alternatives.length > 0) {
      const scoreDifference = primary.weightedScore - alternatives[0].weightedScore;
      if (scoreDifference < 0.2) {
        confidence -= 0.1;
      }
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Calculate uncertainty in classification
   */
  calculateUncertainty(sortedCategories) {
    if (sortedCategories.length < 2) {
      return 0.1; // Low uncertainty if only one category
    }
    
    const topScore = sortedCategories[0].weightedScore;
    const secondScore = sortedCategories[1].weightedScore;
    const scoreDifference = topScore - secondScore;
    
    // Higher uncertainty if scores are close
    if (scoreDifference < 0.1) {
      return 0.8; // High uncertainty
    } else if (scoreDifference < 0.3) {
      return 0.5; // Medium uncertainty
    } else {
      return 0.2; // Low uncertainty
    }
  }

  /**
   * Get classification confidence level
   */
  getConfidenceLevel(confidence) {
    if (confidence >= this.confidenceThresholds.high) {
      return 'high';
    } else if (confidence >= this.confidenceThresholds.medium) {
      return 'medium';
    } else if (confidence >= this.confidenceThresholds.low) {
      return 'low';
    } else {
      return 'very_low';
    }
  }
}

export default MLClassificationService; 