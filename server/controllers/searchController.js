import axios from 'axios';
import ProductSearchService from '../services/productSearchService.js';

// Initialize the comprehensive product search service
const productSearchService = new ProductSearchService();

// Search products using Google Custom Search API
export const searchProducts = async (req, res) => {
  try {
    const { query, category, priceRange, sortBy, page = 1 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    // Build search query optimized for product shopping
    let searchQuery = query.trim();
    
    // Add quotes around the original query to make it more specific
    const originalQuery = query.trim();
    // Use exact phrase matching for better results
    if (originalQuery.split(' ').length > 1) {
      searchQuery = `"${originalQuery}"`;
    } else {
      searchQuery = `${originalQuery}`;
    }
    
    // Add product-specific shopping terms
    searchQuery += ' product buy shop price sale';
    
    // Focus on Indian shopping sites and major global sites with Indian presence
    const indianShoppingSites = [
      // Major Indian E-commerce
      'flipkart.com', 'amazon.in', 'snapdeal.com', 'paytmmall.com', 'myntra.com',
      'ajio.com', 'nykaa.com', 'purplle.com', 'croma.com', 'reliance digital',
      'tatacliq.com', 'shopclues.com', 'indiamart.com', 'olx.in', 'quikr.com',
      
      // Indian Electronics & Tech
      'croma.com', 'reliance digital', 'tatacliq.com', 'vijaysales.com',
      'sangeethamobiles.com', 'poorvika.com', 'lotmobile.in', 'mobikwik.com',
      
      // Indian Fashion & Lifestyle
      'myntra.com', 'ajio.com', 'nykaa.com', 'purplle.com', 'lenskart.com',
      'firstcry.com', 'babyoye.com', 'shopclues.com', 'homeshop18.com',
      
      // Global brands with strong Indian presence
      'apple.com/in', 'samsung.com/in', 'mi.com/in', 'oneplus.in', 'oppo.com/in',
      'vivo.com/in', 'realme.com/in', 'nokia.com/in', 'motorola.com/in',
      
      // Indian Marketplaces
      'amazon.in', 'flipkart.com', 'snapdeal.com', 'paytmmall.com'
    ];
    
    // Add Indian site restrictions to the search query
    const siteRestrictions = indianShoppingSites.map(site => `site:${site}`).join(' OR ');
    searchQuery = `(${searchQuery}) (${siteRestrictions})`;
    
    // Add category filter if provided
    if (category) {
      searchQuery += ` ${category}`;
    }
    
    // Add price-related terms if price range is specified
    if (priceRange) {
      switch (priceRange) {
        case 'low':
          searchQuery += ' affordable cheap budget';
          break;
        case 'medium':
          searchQuery += ' mid-range moderate';
          break;
        case 'high':
          searchQuery += ' premium luxury high-end';
          break;
      }
    }

    // Prepare search parameters
    const searchParams = {
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: searchQuery,
      num: 10, // Google Custom Search API limit is 10
      start: ((page - 1) * 10) + 1, // Starting index for pagination
      // Remove searchType: 'image' to get regular web results instead of just images
      safe: 'active', // Safe search
      // Remove fields restriction to get full response
      // fields: 'items(title,link,snippet,pagemap/cse_image,pagemap/metatags,pagemap/offer,pagemap/product)'
    };

    // Debug: Log the search parameters (remove sensitive data)
    console.log('Search Parameters:', {
      ...searchParams,
      key: searchParams.key ? '***API_KEY_SET***' : '***API_KEY_MISSING***',
      cx: searchParams.cx ? '***ENGINE_ID_SET***' : '***ENGINE_ID_MISSING***'
    });

    // Make request to Google Custom Search API
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: searchParams,
      timeout: 10000 // 10 second timeout
    });

    // Debug: Log a sample result structure
    if (response.data.items && response.data.items.length > 0) {
      console.log('Sample result structure:', JSON.stringify(response.data.items[0], null, 2));
      console.log(`Total results from API: ${response.data.items.length}`);
    }

    // Process and format the results
    const results = response.data.items || [];
    
    // Filter results to only include shopping websites
    const shoppingDomains = [
      'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.co.jp',
      'ebay.com', 'ebay.co.uk', 'ebay.ca', 'ebay.de', 'ebay.fr', 'ebay.it', 'ebay.es',
      'walmart.com', 'target.com', 'bestbuy.com', 'newegg.com', 'bhphotovideo.com',
      'apple.com', 'samsung.com', 'microsoft.com', 'google.com',
      'flipkart.com', 'snapdeal.com', 'paytmmall.com',
      'aliexpress.com', 'alibaba.com', 'banggood.com', 'gearbest.com',
      'etsy.com', 'shopify.com', 'shop.com',
      'costco.com', 'homedepot.com', 'lowes.com', 'wayfair.com',
      'zara.com', 'h&m.com', 'nike.com', 'adidas.com', 'puma.com',
      'asos.com', 'zalando.com', 'farfetch.com', 'net-a-porter.com',
      'ulta.com', 'sephora.com', 'macys.com', 'nordstrom.com',
      'overstock.com', 'rakuten.com', 'groupon.com',
      'dell.com', 'hp.com', 'lenovo.com', 'acer.com', 'asus.com',
      'sony.com', 'lg.com', 'panasonic.com', 'philips.com',
      'ikea.com', 'westelm.com', 'cb2.com', 'crateandbarrel.com',
      'gamestop.com', 'thinkgeek.com', 'hot-topic.com',
      'sportsdirect.com', 'dickssportinggoods.com', 'rei.com',
      'petco.com', 'chewy.com', 'petsmart.com',
      'staples.com', 'officedepot.com', 'officemax.com',
      'autozone.com', 'oreillyauto.com', 'advanceautoparts.com',
      'harborfreight.com', 'northern tool.com', 'grainger.com'
    ];
    
    // Filter results to only include Indian shopping websites and product pages
    const filteredResults = results.filter(item => {
      const domain = extractDomain(item.link);
      
      // Allow major Indian shopping domains and global brands
      const indianShoppingDomains = [
        // Major Indian E-commerce
        'flipkart.com', 'amazon.in', 'snapdeal.com', 'paytmmall.com', 'myntra.com',
        'ajio.com', 'nykaa.com', 'purplle.com', 'croma.com', 'reliance digital',
        'tatacliq.com', 'shopclues.com', 'indiamart.com', 'olx.in', 'quikr.com',
        
        // Indian Electronics & Tech
        'vijaysales.com', 'sangeethamobiles.com', 'poorvika.com', 'lotmobile.in',
        
        // Indian Fashion & Lifestyle
        'lenskart.com', 'firstcry.com', 'babyoye.com', 'homeshop18.com',
        
        // Global brands with Indian presence
        'apple.com', 'samsung.com', 'mi.com', 'oneplus.in', 'oppo.com', 'vivo.com',
        'realme.com', 'nokia.com', 'motorola.com'
      ];
      
      const isShoppingSite = indianShoppingDomains.some(shopDomain => 
        domain.includes(shopDomain.replace('www.', ''))
      );
      
      // Allow shopping sites but don't reject others immediately
      if (!isShoppingSite) {
        // Check if it's still a shopping-related site
        const generalShoppingKeywords = ['shop', 'store', 'buy', 'purchase', 'mall'];
        const hasShoppingKeywords = generalShoppingKeywords.some(keyword => 
          domain.includes(keyword) || item.title.toLowerCase().includes(keyword) ||
          item.snippet.toLowerCase().includes(keyword)
        );
        
        if (!hasShoppingKeywords) {
          return false;
        }
      }
      
      // Check if the search query is present in the result (very lenient)
      const searchTerms = query.toLowerCase().split(' ');
      const hasSearchTerms = searchTerms.some(term => 
        item.title.toLowerCase().includes(term) || 
        item.snippet.toLowerCase().includes(term) ||
        item.link.toLowerCase().includes(term)
      );
      
      // If no search terms found, still allow if it's from a major shopping site
      if (!hasSearchTerms && !isShoppingSite) {
        return false;
      }
      
      // Check if the URL contains product-related keywords (more strict)
      const productKeywords = ['dp/', 'gp/product', '/p/', '/item/', '/product/', 'buy', 'shop', 'purchase'];
      const hasProductKeywords = productKeywords.some(keyword => 
        item.link.toLowerCase().includes(keyword) || 
        item.title.toLowerCase().includes(keyword) ||
        item.snippet.toLowerCase().includes(keyword)
      );
      
      // Prioritize actual product pages
      const isActualProductPage = item.link.toLowerCase().includes('/dp/') || 
                                 item.link.toLowerCase().includes('/gp/product') ||
                                 item.link.toLowerCase().includes('/p/') ||
                                 item.title.toLowerCase().includes('buy') ||
                                 item.title.toLowerCase().includes('shop');
      
      // Very lenient accessory filtering - only exclude obvious accessories
      const accessoryKeywords = ['case', 'cover', 'protector'];
      const isAccessoryPage = accessoryKeywords.some(keyword => 
        item.title.toLowerCase().includes(keyword) && 
        !item.title.toLowerCase().includes(query.toLowerCase()) &&
        !item.snippet.toLowerCase().includes(query.toLowerCase())
      );
      
      // STRICT: Exclude non-shopping content
      const nonShoppingKeywords = [
        'reddit.com', 'reddit', 'forum', 'community', 'discussion', 'thread',
        'news', 'review', 'article', 'blog', 'wiki', 'youtube.com', 'facebook.com', 
        'twitter.com', 'instagram.com', 'pinterest.com', 'tiktok.com',
        'quora.com', 'stackoverflow.com', 'github.com', 'medium.com',
        'techcrunch.com', 'engadget.com', 'theverge.com', 'wired.com',
        'cnet.com', 'pcmag.com', 'tomshardware.com', 'anandtech.com',
        'gsmarena.com', 'phonearena.com', 'dxomark.com', 'rtings.com',
        'consumerreports.org', 'wirecutter.com', 'cnet.com', 'pcmag.com'
      ];
      
      const isNonShoppingContent = nonShoppingKeywords.some(keyword => 
        item.link.toLowerCase().includes(keyword) || 
        item.title.toLowerCase().includes(keyword) ||
        item.snippet.toLowerCase().includes(keyword)
      );
      
      // Much more lenient filtering - allow most shopping-related results
      return !isNonShoppingContent && !isAccessoryPage;
    });
    
    console.log(`Results after Indian shopping filter: ${filteredResults.length}`);
    console.log(`Search query: "${query}"`);
    console.log(`Modified search: "${searchQuery}"`);
    console.log(`Filtered out ${results.length - filteredResults.length} non-Indian shopping results`);
    console.log(`Focus: Indian e-commerce platforms only`);
    console.log(`Scoring and prioritizing actual products over accessories...`);
    
    // Enhanced scoring to prioritize actual products like Google Shopping
    const scoredResults = filteredResults.map(item => {
      let score = 0;
      
      // Higher score if the exact search term is in the title
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }
      
      // Much higher score for direct product URLs (like Amazon product pages)
      const directProductUrls = ['/dp/', '/gp/product', '/p/', '/product/'];
      const isDirectProductUrl = directProductUrls.some(url => 
        item.link.toLowerCase().includes(url)
      );
      
      if (isDirectProductUrl) score += 15;
      
      // Higher score for pages with price information
      const hasPriceInfo = item.snippet.toLowerCase().includes('₹') || 
                          item.snippet.toLowerCase().includes('rs') ||
                          item.snippet.toLowerCase().includes('price') ||
                          item.title.toLowerCase().includes('₹') ||
                          item.title.toLowerCase().includes('rs');
      
      if (hasPriceInfo) score += 8;
      
      // Higher score for pages with buy/shop actions
      const hasBuyAction = item.title.toLowerCase().includes('buy') ||
                          item.title.toLowerCase().includes('shop') ||
                          item.snippet.toLowerCase().includes('buy') ||
                          item.snippet.toLowerCase().includes('shop');
      
      if (hasBuyAction) score += 5;
      
      // Lower score for accessory pages
      const accessoryKeywords = ['case', 'cover', 'protector', 'adapter', 'charger', 'cable'];
      const isAccessoryPage = accessoryKeywords.some(keyword => 
        item.title.toLowerCase().includes(keyword) && 
        !item.title.toLowerCase().includes(query.toLowerCase())
      );
      
      if (isAccessoryPage) score -= 10;
      
      return { ...item, score };
    });
    
    // Sort by score (highest first)
    const sortedResults = scoredResults.sort((a, b) => b.score - a.score);
    
    const formattedResults = sortedResults.map(item => {
      // Enhanced image extraction
      let imageUrl = null;
      
      // Try multiple sources for images
      if (item.pagemap) {
        // Try CSE image first
        if (item.pagemap.cse_image && item.pagemap.cse_image[0]) {
          imageUrl = item.pagemap.cse_image[0].src;
        }
        // Try metatags for og:image
        else if (item.pagemap.metatags && item.pagemap.metatags[0]) {
          imageUrl = item.pagemap.metatags[0]['og:image'] || 
                    item.pagemap.metatags[0]['twitter:image'] ||
                    item.pagemap.metatags[0]['image'];
        }
        // Try product images
        else if (item.pagemap.product && item.pagemap.product[0]) {
          imageUrl = item.pagemap.product[0].image;
        }
        // Try offer images
        else if (item.pagemap.offer && item.pagemap.offer[0]) {
          imageUrl = item.pagemap.offer[0].image;
        }
      }
      
      // If no structured data, try to extract from the link itself
      if (!imageUrl && item.link) {
        // Check if the link itself is an image
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const isImageLink = imageExtensions.some(ext => 
          item.link.toLowerCase().includes(ext)
        );
        if (isImageLink) {
          imageUrl = item.link;
        }
      }
      
      // If still no image, try to extract from the snippet
      if (!imageUrl) {
        // Try to find image URLs in the snippet (basic regex)
        const imageMatch = item.snippet.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
        if (imageMatch) {
          imageUrl = imageMatch[0];
        }
      }
      
      // Validate image URL
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          // Ensure it's a valid image URL
          if (!url.protocol.startsWith('http')) {
            imageUrl = null;
          }
        } catch (e) {
          imageUrl = null;
        }
      }
      
      // Enhanced price extraction like Google Shopping
      let price = item.pagemap?.offer?.[0]?.price ||
                  item.pagemap?.product?.[0]?.price ||
                  null;
      
      // If no structured price, try to extract from title or snippet
      if (!price) {
        const priceRegex = /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i;
        const titleMatch = item.title.match(priceRegex);
        const snippetMatch = item.snippet.match(priceRegex);
        
        if (titleMatch) {
          price = titleMatch[0];
        } else if (snippetMatch) {
          price = snippetMatch[0];
        }
      }
      
      // Also try to extract numeric prices
      if (!price) {
        const numericPriceRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs|rupees?|inr)/i;
        const titleMatch = item.title.match(numericPriceRegex);
        const snippetMatch = item.snippet.match(numericPriceRegex);
        
        if (titleMatch) {
          price = `₹${titleMatch[1]}`;
        } else if (snippetMatch) {
          price = `₹${snippetMatch[1]}`;
        }
      }
      
      // Enhanced rating extraction like Google Shopping
      let rating = item.pagemap?.metatags?.[0]?.['og:rating'] ||
                  item.pagemap?.metatags?.[0]?.['rating'] ||
                  null;
      
      // Try to extract rating from title or snippet
      if (!rating) {
        const ratingRegex = /(\d+(?:\.\d+)?)\s*★/i;
        const titleMatch = item.title.match(ratingRegex);
        const snippetMatch = item.snippet.match(ratingRegex);
        
        if (titleMatch) {
          rating = titleMatch[1];
        } else if (snippetMatch) {
          rating = snippetMatch[1];
        }
      }

      return {
        id: item.link, // Use URL as unique identifier
        title: item.title,
        description: item.snippet,
        url: item.link,
        image: imageUrl || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format&q=80`,
        price: price,
        rating: rating,
        source: extractDomain(item.link),
        category: inferCategory(item.title, item.snippet),
        timestamp: new Date().toISOString()
      };
    });

    console.log(`Final results to return: ${formattedResults.length}`);

    // Sort results if specified
    if (sortBy) {
      formattedResults.sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
          case 'price_high':
            return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
          case 'rating':
            return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
          case 'relevance':
          default:
            return 0; // Already sorted by relevance from Google
        }
      });
    }

    // Prepare pagination info based on actual filtered results
    const actualResults = formattedResults.length;
    const totalResults = response.data.searchInformation?.totalResults || 0;
    const totalPages = Math.ceil(actualResults / 10);
    const hasMoreResults = actualResults >= 10; // If we got 10 results, there might be more

    res.json({
      success: true,
      data: {
        products: formattedResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalResults: parseInt(totalResults),
          hasNextPage: hasMoreResults,
          hasPrevPage: page > 1
        },
        searchInfo: {
          query: searchQuery,
          searchTime: response.data.searchInformation?.searchTime || 0,
          category,
          priceRange,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('Search API Error:', error.message);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: 'Google Search API quota exceeded or invalid credentials'
      });
    }
    
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters or API configuration',
        details: error.response?.data?.error?.message || 'Check API key and Search Engine ID'
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: 'Search request timed out'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Comprehensive product search using the new algorithm
export const comprehensiveSearchProducts = async (req, res) => {
  try {
    const { query, category, priceRange, sortBy, page = 1 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    console.log('🔍 Starting comprehensive product search for:', query);
    
    // Use the comprehensive product search service
    const options = {
      category,
      priceRange,
      sortBy,
      page: parseInt(page)
    };
    
    const results = await productSearchService.searchProducts(query, options);
    
    console.log('✅ Comprehensive search completed. Results:', results.data.products.length);
    
    res.json(results);
    
  } catch (error) {
    console.error('❌ Comprehensive search failed:', error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: 'API quota exceeded or invalid credentials'
      });
    }
    
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        details: error.response?.data?.error?.message || 'Check API configuration'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get search suggestions based on query
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    // For now, return basic suggestions based on common product categories
    // In a real implementation, you might use Google Autocomplete API or build suggestions from search history
    const commonSuggestions = [
      'smartphone',
      'laptop',
      'headphones',
      'camera',
      'gaming console',
      'fitness tracker',
      'smartwatch',
      'tablet',
      'wireless earbuds',
      'bluetooth speaker'
    ];

    const filteredSuggestions = commonSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        suggestions: filteredSuggestions
      }
    });

  } catch (error) {
    console.error('Search Suggestions Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
};

// Get trending searches (placeholder for now)
export const getTrendingSearches = async (req, res) => {
  try {
    // In a real implementation, this would analyze search patterns
    // For now, return some trending product categories
    const trendingSearches = [
      'iPhone 15',
      'MacBook Pro',
      'Sony WH-1000XM5',
      'Nintendo Switch',
      'Samsung Galaxy S24',
      'AirPods Pro',
      'iPad Air',
      'GoPro Hero 12',
      'Fitbit Charge 6',
      'PlayStation 5'
    ];

    res.json({
      success: true,
      data: {
        trending: trendingSearches
      }
    });

  } catch (error) {
    console.error('Trending Searches Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending searches'
    });
  }
};

// Helper function to extract domain from URL
const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'unknown';
  }
};

// Helper function to infer product category
const inferCategory = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('phone') || text.includes('smartphone') || text.includes('iphone') || text.includes('android')) {
    return 'Smartphones';
  }
  if (text.includes('laptop') || text.includes('computer') || text.includes('macbook') || text.includes('notebook')) {
    return 'Laptops';
  }
  if (text.includes('headphone') || text.includes('earbud') || text.includes('airpod') || text.includes('speaker')) {
    return 'Audio';
  }
  if (text.includes('camera') || text.includes('photo') || text.includes('video')) {
    return 'Cameras';
  }
  if (text.includes('game') || text.includes('console') || text.includes('playstation') || text.includes('xbox')) {
    return 'Gaming';
  }
  if (text.includes('watch') || text.includes('fitness') || text.includes('tracker')) {
    return 'Wearables';
  }
  if (text.includes('tablet') || text.includes('ipad')) {
    return 'Tablets';
  }
  
  return 'Electronics';
}; 