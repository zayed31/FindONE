import { createContext, useContext, useReducer, useEffect } from 'react';

// Search state reducer
const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SET_RESULTS':
      return { 
        ...state, 
        results: action.payload.products,
        pagination: action.payload.pagination,
        searchInfo: action.payload.searchInfo,
        loading: false,
        error: null
      };
    
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload, suggestionsLoading: false };
    
    case 'SET_TRENDING':
      return { ...state, trending: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_SUGGESTIONS_LOADING':
      return { ...state, suggestionsLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_RESULTS':
      return { 
        ...state, 
        results: [], 
        pagination: null, 
        searchInfo: null,
        error: null 
      };
    
    case 'CLEAR_SUGGESTIONS':
      return { ...state, suggestions: [] };
    
    case 'UPDATE_CHARACTER_SETTINGS':
      return { 
        ...state, 
        characterSettings: { ...state.characterSettings, ...action.payload } 
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  query: '',
  filters: {
    category: '',
    priceRange: '',
    sortBy: 'relevance'
  },
  results: [],
  suggestions: [],
  trending: [],
  pagination: null,
  searchInfo: null,
  loading: false,
  suggestionsLoading: false,
  error: null,
  characterSettings: {
    enabled: true,
    frequency: 'normal', // low, normal, high
    reactions: true
  }
};

// Create context
const SearchContext = createContext();

// Provider component
export const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Fetch trending searches on mount
  useEffect(() => {
    fetchTrendingSearches();
  }, []);

  // Search products
  const searchProducts = async (query, filters = {}, page = 1) => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      dispatch({ type: 'CLEAR_RESULTS' });
      return;
    }

    // Clear previous results immediately when starting a new search
    if (page === 1) {
      dispatch({ type: 'CLEAR_RESULTS' });
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const params = new URLSearchParams({
        query: trimmedQuery,
        page: page.toString(),
        ...filters
      });

      console.log('🔍 Searching for:', trimmedQuery, 'with params:', params.toString());
      const response = await fetch(`http://localhost:5000/api/search/comprehensive?${params}`);
      const data = await response.json();

      console.log('📊 Search response:', data);

      if (data.success) {
        console.log('✅ Search successful, products found:', data.data?.products?.length || 0);
        console.log('📋 Sample product data:', data.data?.products?.[0]);
        dispatch({ type: 'SET_RESULTS', payload: data.data });
      } else {
        console.error('❌ Search failed:', data.message);
        dispatch({ type: 'SET_ERROR', payload: data.message });
      }
    } catch (error) {
      console.error('Search error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search products. Please try again.' });
    }
  };

  // Get search suggestions
  const getSuggestions = async (query) => {
    if (!query.trim()) {
      dispatch({ type: 'CLEAR_SUGGESTIONS' });
      return;
    }

    dispatch({ type: 'SET_SUGGESTIONS_LOADING', payload: true });

    try {
      const response = await fetch(`http://localhost:5000/api/search/suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_SUGGESTIONS', payload: data.data.suggestions });
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
    }
  };

  // Fetch trending searches
  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/search/trending');
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_TRENDING', payload: data.data.trending });
      }
    } catch (error) {
      console.error('Trending searches error:', error);
    }
  };

  // Update query
  const setQuery = (query) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  };

  // Update filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Clear search
  const clearSearch = () => {
    dispatch({ type: 'CLEAR_RESULTS' });
    dispatch({ type: 'CLEAR_SUGGESTIONS' });
  };

  // Load more results (pagination)
  const loadMore = () => {
    if (state.pagination?.hasNextPage) {
      const nextPage = state.pagination.currentPage + 1;
      searchProducts(state.query, state.filters, nextPage);
    }
  };

  // Update character settings
  const updateCharacterSettings = (settings) => {
    dispatch({ type: 'UPDATE_CHARACTER_SETTINGS', payload: settings });
  };

  const value = {
    ...state,
    searchProducts,
    getSuggestions,
    setQuery,
    setFilters,
    clearSearch,
    loadMore,
    fetchTrendingSearches,
    updateCharacterSettings
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 