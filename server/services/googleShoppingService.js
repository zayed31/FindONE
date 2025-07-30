import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

class GoogleShoppingService {
  constructor() {
    this.auth = null;
    this.content = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create JWT client
      this.auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/content']
      });

      // Create Content API client
      this.content = google.content({
        version: 'v2.1',
        auth: this.auth
      });

      this.isInitialized = true;
      console.log('✅ Google Shopping API initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Shopping API:', error);
      throw error;
    }
  }

  async searchProducts(query, options = {}) {
    try {
      await this.initialize();

      const {
        country = 'IN',
        language = 'en',
        maxResults = 20,
        priceMin = null,
        priceMax = null,
        brand = null,
        category = null
      } = options;

      console.log('🔍 Google Shopping API search:', query);

      // Build search parameters
      const searchParams = {
        query: query,
        country: country,
        language: language,
        maxResults: maxResults
      };

      // Add optional filters
      if (priceMin || priceMax) {
        searchParams.priceFilter = {};
        if (priceMin) searchParams.priceFilter.minPrice = priceMin;
        if (priceMax) searchParams.priceFilter.maxPrice = priceMax;
      }

      if (brand) {
        searchParams.brandFilter = [brand];
      }

      if (category) {
        searchParams.categoryFilter = [category];
      }

      // Make API call - use the correct method
      console.log('🔍 Making Google Shopping API call...');
      console.log('Account ID:', process.env.GOOGLE_MERCHANT_ACCOUNT_ID);
      
      // Check if the API is properly initialized
      if (!this.content || !this.content.accounts || !this.content.accounts.products) {
        throw new Error('Google Shopping API not properly initialized');
      }
      
      const response = await this.content.accounts.products.list({
        account: process.env.GOOGLE_MERCHANT_ACCOUNT_ID,
        maxResults: 20,
        query: query
      });

      console.log('📊 Google Shopping API response:', {
        totalResults: response.data.results?.length || 0
      });

      return this.normalizeShoppingResults(response.data.results || []);

    } catch (error) {
      console.error('❌ Google Shopping API search failed:', error);
      
      // If Shopping API fails, try Custom Search as fallback
      console.log('🔄 Falling back to Google Custom Search...');
      try {
        return await this.searchWithCustomSearch(query, options);
      } catch (fallbackError) {
        console.error('❌ Google Custom Search fallback also failed:', fallbackError);
        return []; // Return empty array if both fail
      }
    }
  }

  async getProductDetails(productId) {
    try {
      await this.initialize();

      const response = await this.content.accounts.products.get({
        account: process.env.GOOGLE_MERCHANT_ACCOUNT_ID,
        productId: productId
      });

      return this.normalizeProductDetail(response.data);

    } catch (error) {
      console.error('❌ Google Shopping API product details failed:', error);
      return null;
    }
  }

  async getCategories() {
    try {
      await this.initialize();

      const response = await this.content.accounts.datafeeds.custombatch({
        account: process.env.GOOGLE_MERCHANT_ACCOUNT_ID,
        requestBody: {
          entries: [{
            batchId: 1,
            method: 'get',
            datafeedId: 'categories'
          }]
        }
      });

      return response.data.entries?.[0]?.datafeed || [];

    } catch (error) {
      console.error('❌ Google Shopping API categories failed:', error);
      return [];
    }
  }

  normalizeShoppingResults(products) {
    return products.map(product => ({
      id: product.id,
      title: product.title || '',
      description: product.description || '',
      url: product.link || '',
      domain: this.extractDomain(product.link || ''),
      image: product.imageLink || product.additionalImageLinks?.[0] || '',
      price: this.extractPrice(product.price),
      originalPrice: this.extractPrice(product.salePrice),
      currency: product.price?.currency || 'INR',
      rating: product.rating || null,
      reviewCount: product.reviewCount || null,
      brand: product.brand || '',
      category: product.googleProductCategory || '',
      availability: product.availability || 'in stock',
      condition: product.condition || 'new',
      source_api: 'google_shopping_api',
      pagemap: {
        product: [{
          name: product.title,
          description: product.description,
          image: product.imageLink,
          price: product.price?.value,
          currency: product.price?.currency,
          availability: product.availability
        }]
      }
    }));
  }

  normalizeProductDetail(product) {
    return {
      id: product.id,
      title: product.title || '',
      description: product.description || '',
      url: product.link || '',
      domain: this.extractDomain(product.link || ''),
      image: product.imageLink || product.additionalImageLinks?.[0] || '',
      price: this.extractPrice(product.price),
      originalPrice: this.extractPrice(product.salePrice),
      currency: product.price?.currency || 'INR',
      rating: product.rating || null,
      reviewCount: product.reviewCount || null,
      brand: product.brand || '',
      category: product.googleProductCategory || '',
      availability: product.availability || 'in stock',
      condition: product.condition || 'new',
      source_api: 'google_shopping_api',
      // Additional details
      gtin: product.gtin || '',
      mpn: product.mpn || '',
      color: product.color || '',
      size: product.size || '',
      material: product.material || '',
      pattern: product.pattern || '',
      ageGroup: product.ageGroup || '',
      gender: product.gender || '',
      shipping: product.shipping || [],
      tax: product.tax || [],
      pagemap: {
        product: [{
          name: product.title,
          description: product.description,
          image: product.imageLink,
          price: product.price?.value,
          currency: product.price?.currency,
          availability: product.availability,
          brand: product.brand,
          category: product.googleProductCategory
        }]
      }
    };
  }

  extractPrice(priceObj) {
    if (!priceObj) return null;
    
    const value = priceObj.value;
    const currency = priceObj.currency || 'INR';
    
    if (currency === 'INR') {
      return `₹${value}`;
    } else {
      return `${currency} ${value}`;
    }
  }

  extractDomain(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (error) {
      return '';
    }
  }

  // Alternative method using Google Custom Search with shopping focus
  async searchWithCustomSearch(query, options = {}) {
    try {
      const {
        maxResults = 20,
        country = 'IN',
        language = 'en'
      } = options;

      console.log('🔍 Google Custom Search with shopping focus:', query);

      // Use Google Custom Search API with shopping-specific parameters
      const searchParams = {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: `"${query}" (buy OR shop OR price OR purchase) (amazon.in OR flipkart.com OR snapdeal.com OR croma.com OR tatacliq.com)`,
        num: Math.min(maxResults, 10), // Google CSE limit
        safe: 'active',
        gl: country.toLowerCase(),
        hl: language
      };

      const response = await fetch(`https://www.googleapis.com/customsearch/v1?${new URLSearchParams(searchParams)}`);
      const data = await response.json();

      console.log('📊 Google Custom Search shopping response:', {
        totalResults: data.searchInformation?.totalResults,
        items: data.items?.length || 0
      });

      if (data.error) {
        console.error('❌ Google Custom Search error:', data.error);
        return [];
      }

      return this.normalizeCustomSearchResults(data.items || []);

    } catch (error) {
      console.error('❌ Google Custom Search shopping failed:', error);
      return [];
    }
  }

  normalizeCustomSearchResults(items) {
    return items.map(item => ({
      id: item.link || Math.random().toString(36),
      title: item.title || '',
      description: item.snippet || '',
      url: item.link || '',
      domain: this.extractDomain(item.link || ''),
      image: this.extractImage(item),
      price: this.extractPriceFromSnippet(item.snippet),
      rating: this.extractRatingFromSnippet(item.snippet),
      source_api: 'google_custom_search_shopping',
      pagemap: item.pagemap || {}
    }));
  }

  extractImage(item) {
    // Try multiple image sources
    if (item.pagemap?.cse_image?.[0]?.src) {
      return item.pagemap.cse_image[0].src;
    }
    if (item.pagemap?.product?.[0]?.image) {
      return item.pagemap.product[0].image;
    }
    if (item.pagemap?.metatags?.[0]?.['og:image']) {
      return item.pagemap.metatags[0]['og:image'];
    }
    return '';
  }

  extractPriceFromSnippet(snippet) {
    if (!snippet) return null;
    
    // Look for price patterns
    const pricePatterns = [
      /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*₹/,
      /INR\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*INR/
    ];

    for (const pattern of pricePatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return `₹${match[1]}`;
      }
    }

    return null;
  }

  extractRatingFromSnippet(snippet) {
    if (!snippet) return null;
    
    // Look for rating patterns
    const ratingPatterns = [
      /(\d+(?:\.\d+)?)\s*★/,
      /★\s*(\d+(?:\.\d+)?)/,
      /(\d+(?:\.\d+)?)\s*stars?/i,
      /rating[:\s]*(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of ratingPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return null;
  }
}

export default GoogleShoppingService; 