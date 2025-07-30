# AI-Powered Product Search Algorithm Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Algorithm Layers](#algorithm-layers)
4. [Implementation Details](#implementation-details)
5. [API Integration](#api-integration)
6. [Caching Strategy](#caching-strategy)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Configuration](#configuration)
10. [Future Enhancements](#future-enhancements)

## Overview

The FindONE AI-powered Product Search Algorithm is a sophisticated multi-layered system designed to provide users with highly relevant, real-time product recommendations from various e-commerce sources. The algorithm combines natural language processing, multi-source data retrieval, intelligent filtering, and relevance ranking to deliver accurate search results.

### Key Features
- **Real-time Product Discovery**: Dynamic fetching from multiple sources
- **AI-Powered Query Understanding**: Natural language processing and intent recognition
- **Multi-Source Retrieval**: Integration with Google APIs and web scraping
- **E-commerce Filtering**: Domain-specific filtering and deduplication
- **Relevance Ranking**: Multi-factor scoring system
- **Caching & Performance**: Optimized for speed and efficiency

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ SearchBar   │  │ SearchResults│  │ AuthModal          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auth Routes │  │ Search Routes│  │ Health Routes      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Product Search Service                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │Query Layer  │  │Retrieval    │  │Filter Layer         │  │
│  │             │  │Layer        │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Ranking Engine                             │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │Google Search│  │Google       │  │Web Scraping        │  │
│  │API          │  │Shopping API │  │(Fallback)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Algorithm Layers

### 1. Query Understanding Layer

**Purpose**: Preprocess and enhance user queries for better search accuracy.

**Components**:
- **Spell Check**: Corrects common spelling mistakes
- **Synonym Expansion**: Expands query with related terms
- **Attribute Parsing**: Extracts product attributes (brand, model, etc.)
- **Intent Recognition**: Identifies user search intent

**Implementation**:
```javascript
class QueryUnderstandingLayer {
  preprocessQuery(query) {
    // 1. Basic cleaning
    // 2. Spell correction
    // 3. Synonym expansion
    // 4. Attribute extraction
    // 5. Intent classification
  }
}
```

**Example**:
- Input: "iphone 15 pro max"
- Output: {
  brand: "Apple",
  model: "iPhone 15 Pro Max",
  category: "smartphone",
  attributes: ["pro", "max"],
  synonyms: ["iPhone", "Apple phone", "smartphone"]
}

### 2. Multi-Source Retrieval Layer

**Purpose**: Fetch product data from multiple sources with fallback mechanisms.

**Sources** (in priority order):
1. **Google Content API for Shopping** (Primary)
2. **Google Custom Search API** (Shopping focus)
3. **Google Custom Search API** (General)
4. **Google Custom Search API** (Indian sites)
5. **Web Scraping** (Fallback)

**Implementation**:
```javascript
class MultiSourceRetrievalLayer {
  async searchProducts(processedQuery) {
    const results = [];
    
    for (const api of this.apiEndpoints) {
      try {
        const apiResults = await this.searchWithAPI(api.name, query);
        results.push(...apiResults);
        
        if (results.length >= MIN_RESULTS) break;
      } catch (error) {
        console.log(`API ${api.name} failed, trying next...`);
      }
    }
    
    return results;
  }
}
```

**API Priority Strategy**:
- **Priority 1**: Google Shopping API (highest quality)
- **Priority 2**: Google Custom Search with shopping focus
- **Priority 3**: General Google Search with filtering
- **Priority 4**: Indian-specific search
- **Fallback**: Web scraping for specific domains

### 3. E-commerce Filter Layer

**Purpose**: Filter and deduplicate results to ensure only relevant e-commerce products.

**Filtering Criteria**:
- **Domain Whitelisting**: Only trusted e-commerce domains
- **Content Analysis**: Product-specific content detection
- **Structured Data**: Rich snippets and product markup
- **GTIN Deduplication**: Remove duplicate products
- **Accessory Filtering**: Exclude irrelevant accessories

**Implementation**:
```javascript
class EcommerceFilterLayer {
  filterAndDeduplicate(candidates) {
    return candidates
      .filter(item => this.isEcommerceDomain(item.domain))
      .filter(item => this.hasStructuredData(item))
      .filter(item => this.passesProductChecks(item))
      .map(item => this.normalizeProduct(item))
      .filter((item, index, arr) => 
        arr.findIndex(p => p.gtin === item.gtin) === index
      );
  }
}
```

**Domain Categories**:
- **Primary**: amazon.in, flipkart.com, snapdeal.com
- **Electronics**: croma.com, reliance-digital.com
- **Fashion**: myntra.com, ajio.com
- **Home**: pepperfry.com, urbanladder.com
- **Excluded**: reddit.com, quora.com, blog sites

### 4. Relevance Ranking Engine

**Purpose**: Score and rank products based on multiple relevance factors.

**Scoring Factors**:
1. **Lexical Score** (40%): Exact keyword matches
2. **Semantic Score** (30%): Semantic similarity
3. **Business Score** (20%): Price, availability, ratings
4. **Behavioral Score** (10%): User preferences (future)

**Implementation**:
```javascript
class RelevanceRankingEngine {
  rankProducts(query, products) {
    return products
      .map(product => ({
        ...product,
        score: this.calculateTotalScore(query, product)
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  calculateTotalScore(query, product) {
    const lexical = this.calculateLexicalScore(query, product) * 0.4;
    const semantic = this.calculateSemanticScore(query, product) * 0.3;
    const business = this.calculateBusinessScore(product) * 0.2;
    const behavioral = this.calculateBehavioralScore(product) * 0.1;
    
    return lexical + semantic + business + behavioral;
  }
}
```

**Scoring Details**:
- **Lexical**: Title match (50%), description match (30%), brand match (20%)
- **Semantic**: Word similarity, synonym matching
- **Business**: Price competitiveness, stock availability, user ratings
- **Behavioral**: Click-through rates, conversion rates (future)

## Implementation Details

### Core Service Class

```javascript
class ProductSearchService {
  constructor() {
    this.queryLayer = new QueryUnderstandingLayer();
    this.retrievalLayer = new MultiSourceRetrievalLayer();
    this.filterLayer = new EcommerceFilterLayer();
    this.rankingEngine = new RelevanceRankingEngine();
  }

  async searchProducts(query, options = {}) {
    // 1. Query Understanding
    const processedQuery = this.queryLayer.preprocessQuery(query);
    
    // 2. Multi-Source Retrieval
    const candidates = await this.retrievalLayer.searchProducts(processedQuery);
    
    // 3. E-commerce Filter & Deduplication
    const products = this.filterLayer.filterAndDeduplicate(candidates);
    
    // 4. Relevance & Ranking
    const rankedProducts = this.rankingEngine.rankProducts(processedQuery, products);
    
    // 5. Result Packaging
    return this.formatResponse(rankedProducts.slice(0, CONFIG.TOP_N), query);
  }
}
```

### Configuration

```javascript
const CONFIG = {
  TOP_N: 20,                    // Maximum results to return
  CACHE_TTL: 300000,            // Cache TTL (5 minutes)
  MIN_RESULTS: 10,              // Minimum results before stopping
  MAX_RETRIES: 3,               // API retry attempts
  TIMEOUT: 10000,               // API timeout (10 seconds)
  
  // Scoring weights
  LEXICAL_WEIGHT: 0.4,
  SEMANTIC_WEIGHT: 0.3,
  BUSINESS_WEIGHT: 0.2,
  BEHAVIORAL_WEIGHT: 0.1
};
```

## API Integration

### Google APIs

#### 1. Google Custom Search API
- **Endpoint**: `https://www.googleapis.com/customsearch/v1`
- **Rate Limit**: 100 queries/day (free tier)
- **Features**: Site-specific search, shopping focus
- **Parameters**: 
  - `q`: Search query
  - `cx`: Custom search engine ID
  - `num`: Results per request (max 10)
  - `safe`: Safe search setting

#### 2. Google Content API for Shopping
- **Endpoint**: `https://shoppingcontent.googleapis.com/content/v2.1`
- **Authentication**: Service account with JWT
- **Features**: High-quality product data
- **Rate Limit**: 1000 requests/day (free tier)

### Web Scraping Fallback
- **Purpose**: Backup when APIs fail
- **Implementation**: Google Custom Search for specific domains
- **Domains**: Major Indian e-commerce sites
- **Limitations**: Rate limiting, content restrictions

## Caching Strategy

### Cache Implementation
```javascript
const searchCache = new Map();

// Cache key generation
const generateCacheKey = (query, options) => {
  return `${query}_${JSON.stringify(options)}`;
};

// Cache operations
const getCachedResults = (cacheKey) => {
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
    return cached.results;
  }
  return null;
};

const setCachedResults = (cacheKey, results) => {
  searchCache.set(cacheKey, {
    results,
    timestamp: Date.now()
  });
};
```

### Cache Invalidation
- **TTL-based**: Automatic expiration after 5 minutes
- **Query-based**: Clear cache for new searches
- **Manual**: Clear all cache when needed

## Performance Optimization

### 1. Parallel API Calls
```javascript
async searchWithMultipleAPIs(query) {
  const promises = this.apiEndpoints.map(api => 
    this.searchWithAPI(api.name, query).catch(err => {
      console.log(`API ${api.name} failed:`, err.message);
      return [];
    })
  );
  
  const results = await Promise.allSettled(promises);
  return results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value);
}
```

### 2. Early Termination
- Stop API calls when minimum results reached
- Skip lower priority APIs if high-quality results found
- Implement request timeouts

### 3. Result Deduplication
- GTIN-based deduplication
- Title similarity matching
- Domain-based filtering

## Error Handling

### Error Types
1. **API Errors**: Rate limits, authentication failures
2. **Network Errors**: Timeouts, connection issues
3. **Data Errors**: Invalid responses, parsing failures
4. **Configuration Errors**: Missing API keys, invalid settings

### Error Recovery
```javascript
try {
  const results = await this.searchWithAPI(apiName, query);
  return results;
} catch (error) {
  console.error(`API ${apiName} failed:`, error.message);
  
  // Fallback to next API
  if (this.apiEndpoints.length > 1) {
    return this.searchWithAPI(this.apiEndpoints[1].name, query);
  }
  
  // Return empty results if all APIs fail
  return [];
}
```

### Graceful Degradation
- Continue with partial results if some APIs fail
- Provide meaningful error messages to users
- Log errors for debugging and monitoring

## Configuration

### Environment Variables
```bash
# Google APIs
GOOGLE_SEARCH_API_KEY=your_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
GOOGLE_MERCHANT_ACCOUNT_ID=your_merchant_account_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Database
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=development
```

### API Configuration
```javascript
const API_CONFIG = {
  google_search: {
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    timeout: 10000,
    retries: 3
  },
  google_shopping: {
    baseUrl: 'https://shoppingcontent.googleapis.com/content/v2.1',
    timeout: 15000,
    retries: 2
  }
};
```

## Future Enhancements

### 1. Machine Learning Integration
- **Query Intent Classification**: Better understanding of user intent
- **Personalization**: User-specific ranking based on history
- **Recommendation Engine**: Collaborative filtering and content-based recommendations

### 2. Advanced Features
- **Image Search**: Visual product search using computer vision
- **Voice Search**: Speech-to-text integration
- **Real-time Price Tracking**: Price history and alerts
- **Sentiment Analysis**: Product review analysis

### 3. Performance Improvements
- **Redis Caching**: Distributed caching for better performance
- **CDN Integration**: Static content delivery
- **Database Optimization**: Indexing and query optimization
- **Load Balancing**: Multiple server instances

### 4. Additional Data Sources
- **Social Media**: Product mentions and trends
- **Review Sites**: Aggregated product reviews
- **Price Comparison APIs**: Real-time price data
- **Inventory APIs**: Stock availability

## Monitoring and Analytics

### Key Metrics
- **Search Response Time**: Average time to return results
- **Cache Hit Rate**: Percentage of cached vs. fresh results
- **API Success Rate**: Success rate of external API calls
- **Result Relevance**: User feedback on result quality
- **Error Rates**: Frequency of different error types

### Logging
```javascript
// Structured logging for monitoring
console.log('🔍 Search started', {
  query: query,
  timestamp: new Date().toISOString(),
  userId: req.user?.id || 'anonymous'
});

console.log('✅ Search completed', {
  query: query,
  resultsCount: results.length,
  searchTime: Date.now() - startTime,
  cacheHit: isCached
});
```

## Conclusion

The FindONE AI-powered Product Search Algorithm represents a sophisticated approach to product discovery that combines multiple data sources, intelligent filtering, and relevance ranking to deliver high-quality search results. The modular architecture allows for easy extension and maintenance, while the caching and error handling ensure reliable performance.

The system is designed to scale with additional data sources and can be enhanced with machine learning capabilities for even better personalization and accuracy. 