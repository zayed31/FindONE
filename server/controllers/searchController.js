import axios from 'axios';

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

    // Build search query with filters
    let searchQuery = query.trim();
    
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
      num: 10, // Number of results per page
      start: ((page - 1) * 10) + 1, // Starting index for pagination
      searchType: 'image', // Include image search for product images
      safe: 'active', // Safe search
      fields: 'items(title,link,snippet,pagemap/cse_image,pagemap/metatags,pagemap/offer,pagemap/product)'
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

    // Process and format the results
    const results = response.data.items || [];
    const formattedResults = results.map(item => {
      const imageUrl = item.pagemap?.cse_image?.[0]?.src || 
                      item.pagemap?.metatags?.[0]?.['og:image'] ||
                      null;
      
      const price = item.pagemap?.offer?.[0]?.price ||
                   item.pagemap?.product?.[0]?.price ||
                   null;
      
      const rating = item.pagemap?.metatags?.[0]?.['og:rating'] ||
                    item.pagemap?.metatags?.[0]?.['rating'] ||
                    null;

      return {
        id: item.link, // Use URL as unique identifier
        title: item.title,
        description: item.snippet,
        url: item.link,
        image: imageUrl,
        price: price,
        rating: rating,
        source: extractDomain(item.link),
        category: inferCategory(item.title, item.snippet),
        timestamp: new Date().toISOString()
      };
    });

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

    // Prepare pagination info
    const totalResults = response.data.searchInformation?.totalResults || 0;
    const totalPages = Math.ceil(totalResults / 10);

    res.json({
      success: true,
      data: {
        products: formattedResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalResults: parseInt(totalResults),
          hasNextPage: page < totalPages,
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