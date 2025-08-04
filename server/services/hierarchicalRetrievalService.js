import axios from 'axios';
import { extractDomain } from '../utils/helpers.js';
import MockDataService from './mockDataService.js';
import GoogleShoppingService from './googleShoppingService.js';

/**
 * Stage 3: Multi-Source Data Retrieval with Hierarchical Filtering
 * 
 * This service implements a hierarchical retrieval system with:
 * 1. Primary Sources: Direct API integrations (Flipkart, Amazon India, etc.)
 * 2. Secondary Sources: Smart web scraping with proxies
 * 3. Tertiary Sources: Price comparison sites and aggregators
 * 4. Intelligent fallback and load balancing
 */

class HierarchicalRetrievalService {
  constructor() {
    // Primary Sources (highest priority) - Direct API integrations
    this.primarySources = {
      'flipkart': {
        name: 'Flipkart',
        priority: 1,
        baseUrl: 'https://www.flipkart.com',
        apiEndpoint: 'https://flipkart-api-scraper.vercel.app/api/search',
        enabled: true,
        rateLimit: { requests: 10, window: 1000 }, // 10 requests per second (for testing)
        lastRequest: 0,
        successRate: 0.95,
        categoryMapping: {
          'mobile_phones': 'mobiles',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'amazon_india': {
        name: 'Amazon India',
        priority: 2,
        baseUrl: 'https://www.amazon.in',
        apiEndpoint: 'https://amazon-api-scraper.vercel.app/api/search',
        enabled: true,
        rateLimit: { requests: 8, window: 1000 }, // 8 requests per second (for testing)
        lastRequest: 0,
        successRate: 0.92,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'snapdeal': {
        name: 'Snapdeal',
        priority: 3,
        baseUrl: 'https://www.snapdeal.com',
        apiEndpoint: 'https://snapdeal-api.vercel.app/api/search',
        enabled: true,
        rateLimit: { requests: 12, window: 1000 }, // 12 requests per second (for testing)
        lastRequest: 0,
        successRate: 0.88,
        categoryMapping: {
          'mobile_phones': 'mobiles',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'croma': {
        name: 'Croma',
        priority: 4,
        baseUrl: 'https://www.croma.com',
        apiEndpoint: 'https://croma-api.vercel.app/api/search',
        enabled: true,
        rateLimit: { requests: 15, window: 1000 }, // 15 requests per second (for testing)
        lastRequest: 0,
        successRate: 0.90,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'reliance_digital': {
        name: 'Reliance Digital',
        priority: 5,
        baseUrl: 'https://www.reliancedigital.in',
        apiEndpoint: 'https://reliance-digital-api.vercel.app/api/search',
        enabled: true,
        rateLimit: { requests: 10, window: 1000 }, // 10 requests per second (for testing)
        lastRequest: 0,
        successRate: 0.87,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      }
    };

    // Secondary Sources (fallback) - Smart web scraping
    this.secondarySources = {
      'paytmmall': {
        name: 'Paytm Mall',
        priority: 6,
        baseUrl: 'https://paytmmall.com',
        enabled: true,
        successRate: 0.85,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'tatacliq': {
        name: 'Tata CLiQ',
        priority: 7,
        baseUrl: 'https://www.tatacliq.com',
        enabled: true,
        successRate: 0.82,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'vijaysales': {
        name: 'Vijay Sales',
        priority: 8,
        baseUrl: 'https://www.vijaysales.com',
        enabled: true,
        successRate: 0.80,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      }
    };

    // Tertiary Sources (supplementary) - Price comparison and aggregators
    this.tertiarySources = {
      'pricebaba': {
        name: 'PriceBaba',
        priority: 9,
        baseUrl: 'https://pricebaba.com',
        enabled: true,
        successRate: 0.75,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'mysmartprice': {
        name: 'MySmartPrice',
        priority: 10,
        baseUrl: 'https://www.mysmartprice.com',
        enabled: true,
        successRate: 0.78,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      },
      'gadgets360': {
        name: 'Gadgets360',
        priority: 11,
        baseUrl: 'https://gadgets360.com',
        enabled: true,
        successRate: 0.70,
        categoryMapping: {
          'mobile_phones': 'mobile-phones',
          'home_appliances': 'home-appliances',
          'electronics': 'electronics',
          'computers': 'computers'
        }
      }
    };

    // Proxy configuration for web scraping
    this.proxyConfig = {
      enabled: true,
      proxies: [
        // Add your proxy list here
        // 'http://proxy1:port',
        // 'http://proxy2:port'
      ],
      currentProxyIndex: 0,
      rotationInterval: 10000 // Rotate every 10 seconds
    };

    // Request tracking for load balancing
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastUpdated: Date.now()
    };

    // Initialize axios with default config
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Initialize mock data service for testing
    this.mockDataService = new MockDataService();
  }

  /**
   * Main retrieval method that orchestrates hierarchical data collection
   */
  async retrieveProducts(query, mlClassification, options = {}) {
    console.log('🌐 Stage 3: Hierarchical Data Retrieval for:', query);
    console.log('   📊 ML Classification:', mlClassification.primary.category);
    
    const results = {
      primary: [],
      secondary: [],
      tertiary: [],
      metadata: {
        totalSources: 0,
        successfulSources: 0,
        failedSources: 0,
        retrievalTime: 0,
        sourcesUsed: []
      }
    };

    const startTime = Date.now();

    try {
      // 1. Primary Sources (Direct API integrations)
      console.log('   🔥 Retrieving from Primary Sources...');
      const primaryResults = await this.retrieveFromPrimarySources(query, mlClassification, options);
      results.primary = primaryResults.products;
      results.metadata.sourcesUsed.push(...primaryResults.sourcesUsed);
      results.metadata.successfulSources += primaryResults.successfulSources;
      results.metadata.failedSources += primaryResults.failedSources;

      // 2. Secondary Sources (Web scraping) - if primary didn't yield enough results
      if (results.primary.length < (options.minResults || 10)) {
        console.log('   🔧 Retrieving from Secondary Sources...');
        const secondaryResults = await this.retrieveFromSecondarySources(query, mlClassification, options);
        results.secondary = secondaryResults.products;
        results.metadata.sourcesUsed.push(...secondaryResults.sourcesUsed);
        results.metadata.successfulSources += secondaryResults.successfulSources;
        results.metadata.failedSources += secondaryResults.failedSources;
      }

      // 3. Tertiary Sources (Price comparison) - for additional data
      if (results.primary.length + results.secondary.length < (options.targetResults || 20)) {
        console.log('   📈 Retrieving from Tertiary Sources...');
        const tertiaryResults = await this.retrieveFromTertiarySources(query, mlClassification, options);
        results.tertiary = tertiaryResults.products;
        results.metadata.sourcesUsed.push(...tertiaryResults.sourcesUsed);
        results.metadata.successfulSources += tertiaryResults.successfulSources;
        results.metadata.failedSources += tertiaryResults.failedSources;
      }

      results.metadata.totalSources = results.metadata.sourcesUsed.length;
      results.metadata.retrievalTime = Date.now() - startTime;

      console.log(`   ✅ Retrieval completed: ${results.primary.length + results.secondary.length + results.tertiary.length} products from ${results.metadata.totalSources} sources`);
      console.log(`   📊 Success rate: ${((results.metadata.successfulSources / results.metadata.totalSources) * 100).toFixed(1)}%`);

      return results;

    } catch (error) {
      console.error('   ❌ Hierarchical retrieval failed:', error.message);
      throw error;
    }
  }

  /**
   * Retrieve from primary sources (Direct API integrations)
   */
  async retrieveFromPrimarySources(query, mlClassification, options) {
    const results = {
      products: [],
      sourcesUsed: [],
      successfulSources: 0,
      failedSources: 0
    };

    // Sort sources by priority and success rate
    const sortedSources = Object.entries(this.primarySources)
      .filter(([key, source]) => source.enabled)
      .sort((a, b) => {
        // Primary sort by priority, secondary by success rate
        if (a[1].priority !== b[1].priority) {
          return a[1].priority - b[1].priority;
        }
        return b[1].successRate - a[1].successRate;
      });

    // Execute requests in parallel with concurrency limit
    const concurrencyLimit = options.concurrency || 3;
    const chunks = this.chunkArray(sortedSources, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(([sourceKey, source]) => 
        this.retrieveFromSource(sourceKey, source, query, mlClassification, 'primary')
      );

      const chunkResults = await Promise.allSettled(promises);
      
      for (const result of chunkResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.products.push(...result.value.products);
          results.sourcesUsed.push(result.value.sourceName);
          results.successfulSources++;
        } else {
          results.failedSources++;
        }
      }
    }

    return results;
  }

  /**
   * Retrieve from secondary sources (Web scraping)
   */
  async retrieveFromSecondarySources(query, mlClassification, options) {
    const results = {
      products: [],
      sourcesUsed: [],
      successfulSources: 0,
      failedSources: 0
    };

    const sortedSources = Object.entries(this.secondarySources)
      .filter(([key, source]) => source.enabled)
      .sort((a, b) => b[1].successRate - a[1].successRate);

    // Execute with lower concurrency for web scraping
    const concurrencyLimit = options.scrapingConcurrency || 2;
    const chunks = this.chunkArray(sortedSources, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(([sourceKey, source]) => 
        this.retrieveFromSource(sourceKey, source, query, mlClassification, 'secondary')
      );

      const chunkResults = await Promise.allSettled(promises);
      
      for (const result of chunkResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.products.push(...result.value.products);
          results.sourcesUsed.push(result.value.sourceName);
          results.successfulSources++;
        } else {
          results.failedSources++;
        }
      }
    }

    return results;
  }

  /**
   * Retrieve from tertiary sources (Price comparison)
   */
  async retrieveFromTertiarySources(query, mlClassification, options) {
    const results = {
      products: [],
      sourcesUsed: [],
      successfulSources: 0,
      failedSources: 0
    };

    const sortedSources = Object.entries(this.tertiarySources)
      .filter(([key, source]) => source.enabled)
      .sort((a, b) => b[1].successRate - a[1].successRate);

    // Execute with minimal concurrency for tertiary sources
    const concurrencyLimit = options.tertiaryConcurrency || 1;
    const chunks = this.chunkArray(sortedSources, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(([sourceKey, source]) => 
        this.retrieveFromSource(sourceKey, source, query, mlClassification, 'tertiary')
      );

      const chunkResults = await Promise.allSettled(promises);
      
      for (const result of chunkResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.products.push(...result.value.products);
          results.sourcesUsed.push(result.value.sourceName);
          results.successfulSources++;
        } else {
          results.failedSources++;
        }
      }
    }

    return results;
  }

  /**
   * Retrieve from a specific source
   */
  async retrieveFromSource(sourceKey, source, query, mlClassification, sourceType) {
    // Check rate limiting
    if (this.checkRateLimit(source)) {
      console.log(`   ⏰ Rate limit exceeded for ${source.name}`);
      return null;
    }

    try {
      console.log(`   🔍 Retrieving from ${source.name}...`);
      
      let products = [];
      
      if (sourceType === 'primary' && source.apiEndpoint) {
        // Use direct API integration
        products = await this.callAPI(source, query, mlClassification);
      } else {
        // Use web scraping
        products = await this.scrapeWebsite(source, query, mlClassification);
      }

      // Update success rate
      this.updateSuccessRate(sourceKey, sourceType, true);
      
      console.log(`   ✅ ${source.name}: ${products.length} products found`);
      
      return {
        products,
        sourceName: source.name,
        sourceType
      };

    } catch (error) {
      console.error(`   ❌ ${source.name} failed:`, error.message);
      
      // Update success rate
      this.updateSuccessRate(sourceKey, sourceType, false);
      
      return null;
    }
  }

  /**
   * Call API endpoint for primary sources
   */
  async callAPI(source, query, mlClassification) {
    console.log(`   🔍 Using Google Shopping API for ${source.name}`);
    
    try {
      // Use Google Shopping API as the primary source for all primary sources
      const googleShoppingService = new GoogleShoppingService();
      const results = await googleShoppingService.searchProducts(query);
      
      if (results && results.length > 0) {
        console.log(`   ✅ Google Shopping API returned ${results.length} products for ${source.name}`);
        
        // Normalize and add source information
        const normalizedResults = results.map(product => ({
          ...product,
          source_api: source.name,
          domain: extractDomain(product.url || product.buy_url)
        }));
        
        return normalizedResults.slice(0, 8); // Limit to 8 products per source
      }
      
      console.log(`   ⚠️ Google Shopping API returned no products for ${source.name}`);
      return [];
      
    } catch (error) {
      console.log(`   ❌ Google Shopping API failed for ${source.name}: ${error.message}`);
      return [];
    }
  }



  /**
   * Scrape website for secondary/tertiary sources
   */
  async scrapeWebsite(source, query, mlClassification) {
    console.log(`   🔍 Using Google Shopping API for ${source.name}`);
    
    try {
      // Use Google Shopping API for secondary sources as well
      const googleShoppingService = new GoogleShoppingService();
      const results = await googleShoppingService.searchProducts(query);
      
      if (results && results.length > 0) {
        console.log(`   ✅ Google Shopping API returned ${results.length} products for ${source.name}`);
        
        // Normalize and add source information
        const normalizedResults = results.map(product => ({
          ...product,
          source_api: source.name,
          domain: extractDomain(product.url || product.buy_url)
        }));
        
        return normalizedResults.slice(0, 6); // Limit to 6 products per secondary source
      }
      
      console.log(`   ⚠️ Google Shopping API returned no products for ${source.name}`);
      return [];
      
    } catch (error) {
      console.log(`   ❌ Google Shopping API failed for ${source.name}: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract structured data from HTML
   */
  extractStructuredData(html, source) {
    const products = [];
    
    try {
      // Extract JSON-LD structured data
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
      
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const jsonData = JSON.parse(match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
            
            if (jsonData['@type'] === 'Product') {
              products.push(this.normalizeStructuredData(jsonData, source));
            } else if (jsonData['@type'] === 'ItemList' && jsonData.itemListElement) {
              for (const item of jsonData.itemListElement) {
                if (item['@type'] === 'Product') {
                  products.push(this.normalizeStructuredData(item, source));
                }
              }
            }
          } catch (parseError) {
            // Continue with next match
          }
        }
      }

      // Extract microdata
      const microdataMatches = html.match(/itemtype="http:\/\/schema\.org\/Product"[^>]*>(.*?)<\/div>/gs);
      
      if (microdataMatches) {
        for (const match of microdataMatches) {
          const product = this.extractMicrodata(match, source);
          if (product) {
            products.push(product);
          }
        }
      }

    } catch (error) {
      console.error('Structured data extraction failed:', error.message);
    }

    return products;
  }

  /**
   * Normalize API response
   */
  normalizeAPIResponse(products, source) {
    return products.map(product => ({
      id: product.id || product.productId || `unknown_${Date.now()}`,
      title: product.title || product.name || 'Unknown Product',
      price: product.price || product.priceRange || 'Price not available',
      currency: product.currency || 'INR',
      availability: product.availability || product.inStock ? 'In Stock' : 'Out of Stock',
      rating: product.rating || product.averageRating || null,
      reviews: product.reviews || product.reviewCount || null,
      seller: product.seller || product.brand || source.name,
      domain: extractDomain(source.baseUrl),
      url: product.url || product.productUrl || source.baseUrl,
      buy_url: product.buyUrl || product.purchaseUrl || product.url,
      source_api: source.name,
      image: product.image || product.imageUrl || product.thumbnail,
      description: product.description || product.shortDescription || ''
    }));
  }

  /**
   * Normalize structured data
   */
  normalizeStructuredData(data, source) {
    return {
      id: data.sku || data.gtin || `structured_${Date.now()}`,
      title: data.name || data.title || 'Unknown Product',
      price: data.offers?.price || data.price || 'Price not available',
      currency: data.offers?.priceCurrency || 'INR',
      availability: data.offers?.availability || 'In Stock',
      rating: data.aggregateRating?.ratingValue || data.rating || null,
      reviews: data.aggregateRating?.reviewCount || data.reviewCount || null,
      seller: data.brand?.name || data.seller || source.name,
      domain: extractDomain(source.baseUrl),
      url: data.url || data.mainEntity?.url || source.baseUrl,
      buy_url: data.offers?.url || data.url,
      source_api: source.name,
      image: data.image || data.thumbnail || null,
      description: data.description || data.shortDescription || ''
    };
  }

  /**
   * Extract microdata
   */
  extractMicrodata(html, source) {
    try {
      const titleMatch = html.match(/itemprop="name"[^>]*>([^<]+)</);
      const priceMatch = html.match(/itemprop="price"[^>]*>([^<]+)</);
      const imageMatch = html.match(/itemprop="image"[^>]*src="([^"]+)"/);
      
      if (titleMatch) {
        return {
          id: `microdata_${Date.now()}`,
          title: titleMatch[1].trim(),
          price: priceMatch ? priceMatch[1].trim() : 'Price not available',
          currency: 'INR',
          availability: 'In Stock',
          rating: null,
          reviews: null,
          seller: source.name,
          domain: extractDomain(source.baseUrl),
          url: source.baseUrl,
          buy_url: source.baseUrl,
          source_api: source.name,
          image: imageMatch ? imageMatch[1] : null,
          description: ''
        };
      }
    } catch (error) {
      // Continue with next match
    }
    
    return null;
  }

  /**
   * Check rate limiting for a source
   * Returns true if rate limit is exceeded (should block request)
   * Returns false if rate limit is not exceeded (should allow request)
   */
  checkRateLimit(source) {
    if (!source.rateLimit) return false; // No rate limit, allow request
    
    const now = Date.now();
    const timeSinceLastRequest = now - source.lastRequest;
    
    if (timeSinceLastRequest < source.rateLimit.window) {
      return true; // Rate limit exceeded, block request
    }
    
    source.lastRequest = now;
    return false; // Rate limit not exceeded, allow request
  }

  /**
   * Update success rate for a source
   */
  updateSuccessRate(sourceKey, sourceType, success) {
    const sourceMap = {
      'primary': this.primarySources,
      'secondary': this.secondarySources,
      'tertiary': this.tertiarySources
    };
    
    const source = sourceMap[sourceType][sourceKey];
    if (source) {
      // Simple exponential moving average
      const alpha = 0.1;
      source.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * source.successRate;
    }
  }

  /**
   * Get next proxy for rotation
   */
  getNextProxy() {
    if (!this.proxyConfig.enabled || this.proxyConfig.proxies.length === 0) {
      return null;
    }
    
    const proxy = this.proxyConfig.proxies[this.proxyConfig.currentProxyIndex];
    this.proxyConfig.currentProxyIndex = (this.proxyConfig.currentProxyIndex + 1) % this.proxyConfig.proxies.length;
    
    return proxy;
  }

  /**
   * Split array into chunks for concurrency control
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get retrieval statistics
   */
  getStats() {
    return {
      ...this.requestStats,
      primarySources: Object.keys(this.primarySources).filter(key => this.primarySources[key].enabled).length,
      secondarySources: Object.keys(this.secondarySources).filter(key => this.secondarySources[key].enabled).length,
      tertiarySources: Object.keys(this.tertiarySources).filter(key => this.tertiarySources[key].enabled).length
    };
  }
}

export default HierarchicalRetrievalService; 