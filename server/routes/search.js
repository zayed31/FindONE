import { Router } from 'express';
import { 
  searchProducts, 
  comprehensiveSearchProducts,
  getSearchSuggestions, 
  getTrendingSearches 
} from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';
import { checkApiKeys, API_DOCS } from '../config/apiKeys.js';

const router = Router();

// Public search routes
router.get('/products', searchProducts);
router.get('/comprehensive', comprehensiveSearchProducts); // New comprehensive search endpoint
router.get('/suggestions', getSearchSuggestions);
router.get('/trending', getTrendingSearches);

// API health check
router.get('/health', (req, res) => {
  const apiStatus = checkApiKeys();
  res.json({
    success: true,
    data: {
      apiStatus,
      documentation: API_DOCS,
      message: 'Search API is running. Check apiStatus for configured APIs.',
      debug: {
        GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY ? 'SET' : 'MISSING',
        GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID ? 'SET' : 'MISSING',
        GOOGLE_MERCHANT_ACCOUNT_ID: process.env.GOOGLE_MERCHANT_ACCOUNT_ID ? 'SET' : 'MISSING',
        GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'MISSING',
        GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'SET' : 'MISSING'
      }
    }
  });
});

// Protected routes (for future features like saving search history)
router.get('/history', protect, (req, res) => {
  // TODO: Implement search history for authenticated users
  res.json({
    success: true,
    data: {
      history: []
    }
  });
});

export default router; 