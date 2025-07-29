import { Router } from 'express';
import { 
  searchProducts, 
  getSearchSuggestions, 
  getTrendingSearches 
} from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public search routes
router.get('/products', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/trending', getTrendingSearches);

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