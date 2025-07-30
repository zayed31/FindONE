import axios from 'axios';
import { extractDomain } from '../utils/helpers.js';
import GoogleShoppingService from './googleShoppingService.js';

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
    this.synonyms = {
      'cell-phone': ['mobile phone', 'smartphone', 'phone'],
      'mobile': ['cell phone', 'smartphone', 'phone'],
      'laptop': ['notebook', 'computer'],
      'headphones': ['earphones', 'earbuds', 'headset'],
      'tv': ['television', 'smart tv'],
      'tablet': ['ipad', 'android tablet'],
      'watch': ['smartwatch', 'fitness tracker']
    };
    
    this.brands = {
      'apple': ['iphone', 'ipad', 'macbook', 'airpods'],
      'samsung': ['galaxy', 'note', 's series'],
      'google': ['pixel'],
      'oneplus': ['one plus'],
      'xiaomi': ['mi', 'redmi', 'poco'],
      'oppo': ['find x', 'reno'],
      'vivo': ['x series', 'v series']
    };
  }

  preprocessQuery(query) {
    let processedQuery = query.trim().toLowerCase();
    
    // 1. Spell-check & plural/lemma handling
    processedQuery = this.handlePlurals(processedQuery);
    
    // 2. Parse product attributes FIRST (before synonym expansion)
    const attributes = this.parseProductAttributes(processedQuery);
    
    // 3. Create exact match query (for precise searching)
    const exactMatchQuery = this.createExactMatchQuery(processedQuery, attributes);
    
    // 4. Synonym & alias expansion (for broader matching)
    const expandedQuery = this.expandSynonyms(processedQuery);
    
    return {
      original: query,
      processed: processedQuery,
      exactMatch: exactMatchQuery,
      expanded: expandedQuery,
      attributes
    };
  }

  handlePlurals(query) {
    // Basic plural to singular conversion
    const pluralToSingular = {
      'phones': 'phone',
      'laptops': 'laptop',
      'headphones': 'headphone',
      'watches': 'watch',
      'tablets': 'tablet',
      'cameras': 'camera',
      'speakers': 'speaker'
    };
    
    let processed = query;
    for (const [plural, singular] of Object.entries(pluralToSingular)) {
      processed = processed.replace(new RegExp(`\\b${plural}\\b`, 'g'), singular);
    }
    
    return processed;
  }

  expandSynonyms(query) {
    let expanded = query;
    
    // Expand synonyms
    for (const [term, synonyms] of Object.entries(this.synonyms)) {
      if (expanded.includes(term)) {
        expanded += ' ' + synonyms.join(' ');
      }
    }
    
    // Expand brand aliases
    for (const [brand, aliases] of Object.entries(this.brands)) {
      if (expanded.includes(brand)) {
        expanded += ' ' + aliases.join(' ');
      }
    }
    
    return expanded;
  }

  parseProductAttributes(query) {
    const attributes = {
      brand: null,
      model: null,
      size: null,
      color: null,
      storage: null
    };
    
    // Extract brand
    const brands = Object.keys(this.brands);
    for (const brand of brands) {
      if (query.includes(brand)) {
        attributes.brand = brand;
        break;
      }
    }
    
    // Extract model numbers (iPhone 15, Galaxy S23, etc.)
    const modelRegex = /(\w+)\s+(\d+)/i;
    const modelMatch = query.match(modelRegex);
    if (modelMatch) {
      attributes.model = `${modelMatch[1]} ${modelMatch[2]}`;
    }
    
    // Extract storage sizes
    const storageRegex = /(\d+)\s*(gb|tb|mb)/i;
    const storageMatch = query.match(storageRegex);
    if (storageMatch) {
      attributes.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()}`;
    }
    
    // Extract colors
    const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gold', 'silver'];
    for (const color of colors) {
      if (query.includes(color)) {
        attributes.color = color;
        break;
      }
    }
    
    return attributes;
  }

  createExactMatchQuery(query, attributes) {
    let exactQuery = query;
    
    // If we have a specific model, use exact matching
    if (attributes.model) {
      // Use quotes for exact phrase matching
      exactQuery = `"${attributes.model}"`;
      
      // Add brand if available
      if (attributes.brand) {
        exactQuery = `"${attributes.brand} ${attributes.model}"`;
      }
      
      // Add storage if specified
      if (attributes.storage) {
        exactQuery += ` ${attributes.storage}`;
      }
      
      // Add color if specified
      if (attributes.color) {
        exactQuery += ` ${attributes.color}`;
      }
    } else if (attributes.brand) {
      // If only brand is specified, use exact brand matching
      exactQuery = `"${attributes.brand}"`;
    }
    
    // Add exclusion terms to avoid accessories
    const exclusionTerms = [
      'case', 'cover', 'protector', 'screen guard', 'tempered glass',
      'charger', 'cable', 'adapter', 'stand', 'holder', 'mount',
      'accessory', 'accessories', 'spare', 'replacement', 'parts'
    ];
    
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
    this.apiEndpoints = [
      { name: 'google_shopping_api', priority: 1 },
      { name: 'google_shopping', priority: 2 },
      { name: 'google_search', priority: 3 },
      { name: 'google_search_indian', priority: 4 }
    ];
    
    // Initialize Google Shopping Service
    this.googleShoppingService = new GoogleShoppingService();
  }

  async searchProducts(processedQuery) {
    const candidates = [];
    
    console.log('🔍 Starting multi-source retrieval for:', processedQuery.processed);
    
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
    // Use exact match query for precise results
    const searchQuery = query.exactMatch || query.processed;
    
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
    // Use exact match query for precise results
    const searchQuery = query.exactMatch || query.processed;
    
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
    // Use exact match query for precise results
    const searchQuery = query.exactMatch || query.processed;
    
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
      url: item.link,
      domain: extractDomain(item.link),
      image: this.extractImage(item),
      price: this.extractPrice(item),
      rating: this.extractRating(item),
      source_api: 'google_search',
      pagemap: item.pagemap || {}
    }));
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
    // Extract from structured data
    if (item.pagemap?.offer?.[0]?.price) {
      return item.pagemap.offer[0].price;
    }
    if (item.pagemap?.product?.[0]?.price) {
      return item.pagemap.product[0].price;
    }
    
    // Extract from text using regex
    const priceRegex = /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i;
    const match = (item.title + ' ' + item.snippet).match(priceRegex);
    return match ? match[0] : null;
  }

  extractRating(item) {
    if (item.pagemap?.metatags?.[0]?.['og:rating']) {
      return item.pagemap.metatags[0]['og:rating'];
    }
    
    const ratingRegex = /(\d+(?:\.\d+)?)\s*★/i;
    const match = (item.title + ' ' + item.snippet).match(ratingRegex);
    return match ? match[1] : null;
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

  filterAndDeduplicate(candidates) {
    const products = [];
    const seenGTINs = new Set();
    let domainFiltered = 0;
    let structuredDataFiltered = 0;
    let productChecksFiltered = 0;
    let duplicateFiltered = 0;
    
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
    return {
      id: item.url,
      title: item.title,
      description: item.description,
      url: item.url,
      image: item.image,
      price: item.price,
      rating: item.rating,
      seller: item.domain,
      domain: item.domain,
      buy_url: item.url,
      source_api: item.source_api,
      gtin: this.extractGTIN(item),
      availability: this.determineAvailability(item),
      reviews: this.extractReviewCount(item)
    };
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
      const scores = {
        lexical: this.calculateLexicalScore(query, product),
        semantic: this.calculateSemanticScore(query, product),
        business: this.calculateBusinessScore(product),
        behavioral: this.calculateBehavioralScore(product)
      };
      
      const finalScore = Object.entries(scores).reduce((total, [key, score]) => {
        return total + (score * this.weights[key]);
      }, 0);
      
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
      const processedQuery = this.queryLayer.preprocessQuery(query);
      
      // 2. Multi-Source Retrieval
      const candidates = await this.retrievalLayer.searchProducts(processedQuery);
      
      // 3. E-commerce Filter & Deduplication
      console.log('🔍 Starting e-commerce filtering...');
      const products = this.filterLayer.filterAndDeduplicate(candidates);
      console.log(`✅ Filtering completed. Products after filtering: ${products.length}`);
      
      // 4. Relevance & Ranking
      console.log('🔍 Starting relevance ranking...');
      const rankedProducts = this.rankingEngine.rankProducts(processedQuery, products);
      console.log(`✅ Ranking completed. Ranked products: ${rankedProducts.length}`);
      
      // 5. Result Packaging
      const results = this.formatResponse(rankedProducts.slice(0, CONFIG.TOP_N), query);
      
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