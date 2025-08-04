import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class FallbackSearchService {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
  }

  async searchProducts(query, options = {}) {
    console.log('🔄 Using Fallback Search Service for:', query);
    
    try {
      // Try multiple fallback methods
      const results = await Promise.race([
        this.searchWithSerpAPI(query, options),
        this.searchWithWebScraping(query, options),
        this.searchWithMockData(query, options)
      ]);

      return results || [];
    } catch (error) {
      console.log('❌ All fallback methods failed, using mock data');
      return this.getMockData(query);
    }
  }

  async searchWithSerpAPI(query, options = {}) {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SerpAPI key not configured');
    }

    try {
      console.log('🔍 Trying SerpAPI...');
      
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: `${query} buy price shopping`,
          api_key: apiKey,
          engine: 'google_shopping',
          num: options.maxResults || 10
        },
        timeout: 10000
      });

      if (response.data.shopping_results) {
        console.log(`✅ SerpAPI returned ${response.data.shopping_results.length} results`);
        return this.normalizeSerpAPIResults(response.data.shopping_results);
      }
      
      throw new Error('No shopping results from SerpAPI');
    } catch (error) {
      console.log('❌ SerpAPI failed:', error.message);
      throw error;
    }
  }

  async searchWithWebScraping(query, options = {}) {
    console.log('🔍 Trying web scraping...');
    
    const indianSites = [
      'amazon.in', 'flipkart.com', 'snapdeal.com', 'paytmmall.com',
      'tatacliq.com', 'croma.com', 'reliance-digital.com', 'vijaysales.com',
      'poorvika.com', 'lotmobile.in', 'sangeethamobiles.com', 'mobileshop.com',
      'ezoneonline.com', 'shopclues.com', 'myntra.com', 'ajio.com',
      'nykaa.com', 'lenskart.com', 'firstcry.com', 'purplle.com'
    ];
    
    const brandSites = [
      'samsung.com/in', 'apple.com/in', 'oneplus.com/in', 'xiaomi.com/in',
      'oppo.com/in', 'vivo.com/in', 'realme.com/in', 'motorola.com/in',
      'dell.com/in', 'hp.com/in', 'lenovo.com/in', 'asus.com/in',
      'lg.com/in', 'sony.co.in', 'panasonic.com/in', 'tcl.com/in',
      'canon.co.in', 'nikon.co.in', 'whirlpoolindia.com', 'bosch-home.in'
    ];
    
    const searchQueries = [
      ...indianSites.map(site => `${query} site:${site}`),
      ...brandSites.map(site => `${query} site:${site}`)
    ];

    const results = [];
    
    for (const searchQuery of searchQueries.slice(0, 2)) { // Limit to 2 to avoid rate limiting
      try {
        const response = await axios.get('https://www.google.com/search', {
          params: {
            q: searchQuery,
            num: 5
          },
          headers: {
            'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 8000
        });

        const scrapedResults = this.extractProductsFromHTML(response.data, query);
        results.push(...scrapedResults);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Web scraping failed for ${searchQuery}:`, error.message);
      }
    }

    if (results.length > 0) {
      console.log(`✅ Web scraping returned ${results.length} results`);
      return results;
    }
    
    throw new Error('Web scraping returned no results');
  }

  extractProductsFromHTML(html, query) {
    const results = [];
    
    // Simple regex-based extraction (in production, use proper HTML parsing)
    const productPatterns = [
      /<h3[^>]*>([^<]+)<\/h3>/gi,
      /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi
    ];

    for (const pattern of productPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && results.length < 10) {
        const title = match[1] || match[2];
        const url = match[1] || '';
        
        if (title && title.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            title: title.substring(0, 100),
            url: url.startsWith('http') ? url : `https://www.google.com${url}`,
            price: this.extractPriceFromText(title),
            image: '',
            rating: null,
            reviews: null,
            source: 'web_scraping'
          });
        }
      }
    }

    return results;
  }

  searchWithMockData(query, options = {}) {
    console.log('🔍 Using mock data fallback...');
    return this.getMockData(query);
  }

  getMockData(query) {
    const mockProducts = {
      'samsung s25': [
        {
          title: 'Samsung Galaxy S25 5G (256GB, 8GB RAM) - Phantom Black',
          url: 'https://www.flipkart.com/samsung-galaxy-s25-5g-phantom-black-256-gb/p/itm123456',
          price: '₹89,999',
          image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/...',
          rating: 4.5,
          reviews: 1247,
          source: 'mock_data'
        },
        {
          title: 'Samsung Galaxy S25 Ultra 5G (512GB, 12GB RAM) - Titanium Gray',
          url: 'https://www.amazon.in/Samsung-Galaxy-S25-Ultra-Titanium/dp/B0ABC123',
          price: '₹1,29,999',
          image: 'https://m.media-amazon.com/images/I/71...',
          rating: 4.7,
          reviews: 892,
          source: 'mock_data'
        }
      ],
      'iphone 15': [
        {
          title: 'Apple iPhone 15 (128GB) - Natural Titanium',
          url: 'https://www.flipkart.com/apple-iphone-15-natural-titanium-128-gb/p/itm789012',
          price: '₹79,999',
          image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/...',
          rating: 4.6,
          reviews: 2156,
          source: 'mock_data'
        },
        {
          title: 'Apple iPhone 15 Pro (256GB) - Blue Titanium',
          url: 'https://www.amazon.in/Apple-iPhone-15-Pro-Titanium/dp/B0CDE456',
          price: '₹1,49,999',
          image: 'https://m.media-amazon.com/images/I/71...',
          rating: 4.8,
          reviews: 1347,
          source: 'mock_data'
        }
      ],
      'samsung a55': [
        {
          title: 'Samsung Galaxy A55 5G (128GB, 8GB RAM) - Awesome Black',
          url: 'https://www.flipkart.com/samsung-galaxy-a55-5g-awesome-black-128-gb/p/itm345678',
          price: '₹39,999',
          image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/...',
          rating: 4.3,
          reviews: 567,
          source: 'mock_data'
        }
      ],
      'oneplus 12': [
        {
          title: 'OnePlus 12 5G (256GB, 16GB RAM) - Silk Black',
          url: 'https://www.flipkart.com/oneplus-12-5g-silk-black-256-gb/p/itm901234',
          price: '₹69,999',
          image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/...',
          rating: 4.4,
          reviews: 789,
          source: 'mock_data'
        }
      ]
    };

    const queryLower = query.toLowerCase();
    for (const [key, products] of Object.entries(mockProducts)) {
      if (queryLower.includes(key.split(' ')[0]) && queryLower.includes(key.split(' ')[1])) {
        console.log(`✅ Mock data found for: ${query}`);
        return products;
      }
    }

    // Generic fallback
    console.log(`⚠️ No specific mock data for: ${query}, using generic data`);
    return [
      {
        title: `${query.charAt(0).toUpperCase() + query.slice(1)} - Latest Model`,
        url: 'https://www.flipkart.com/search?q=' + encodeURIComponent(query),
        price: '₹49,999',
        image: '',
        rating: 4.2,
        reviews: 456,
        source: 'mock_data_generic'
      }
    ];
  }

  normalizeSerpAPIResults(results) {
    return results.map(item => ({
      title: item.title || '',
      url: item.link || '',
      price: item.price || '',
      image: item.thumbnail || '',
      rating: item.rating || null,
      reviews: item.reviews || null,
      source: 'serpapi'
    }));
  }

  extractPriceFromText(text) {
    if (!text) return '₹49,999';
    
    // Smart price extraction similar to main service
    const pricePatterns = [
      /₹\s*([\d,]+(?:\.[\d]{2})?)/i,
      /Rs\.?\s*([\d,]+(?:\.[\d]{2})?)/i,
      /INR\s*([\d,]+(?:\.[\d]{2})?)/i,
      /price[:\s]*₹\s*([\d,]+(?:\.[\d]{2})?)/i,
      /cost[:\s]*₹\s*([\d,]+(?:\.[\d]{2})?)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:₹|Rs\.?|INR)/i
    ];
    
    const prices = [];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const priceValue = match[1];
        const context = text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30);
        
        // Score the price based on context
        let score = 0;
        
        // Penalize EMI-related prices
        if (context.toLowerCase().includes('emi') || context.toLowerCase().includes('month')) {
          score -= 5;
        }
        
        // Penalize exchange offers
        if (context.toLowerCase().includes('exchange') || context.toLowerCase().includes('trade')) {
          score -= 3;
        }
        
        // Boost prices near product keywords
        if (context.toLowerCase().includes('price') || context.toLowerCase().includes('cost')) {
          score += 2;
        }
        
        // Price range preference
        const numericPrice = parseInt(priceValue.replace(/,/g, ''));
        if (numericPrice >= 15000 && numericPrice <= 200000) {
          score += 3;
        }
        
        prices.push({ value: priceValue, score });
      }
    }
    
    if (prices.length > 0) {
      // Return the highest scored price
      prices.sort((a, b) => b.score - a.score);
      return `₹${prices[0].value}`;
    }
    
    return '₹49,999';
  }
}

export default FallbackSearchService; 