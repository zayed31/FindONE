import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Filter, Grid, List, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import ProductCard from './ProductCard';

const SearchResults = ({ onSaveProduct, onViewProduct }) => {
  const {
    results,
    loading,
    error,
    pagination,
    searchInfo,
    loadMore
  } = useSearch();

  if (loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Searching Products</h3>
          <p className="text-gray-400">Finding the best matches for you...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Search Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
          <p className="text-gray-400">Try adjusting your search terms or filters</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Info Header */}
      {searchInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold">
                Search Results for "{searchInfo.query}"
              </h2>
              <p className="text-gray-400 text-sm">
                {pagination?.totalResults || results.length} products found
                {searchInfo.searchTime && ` in ${searchInfo.searchTime}s`}
              </p>
            </div>
            
            {/* Filters Applied */}
            {(searchInfo.category || searchInfo.priceRange || searchInfo.sortBy) && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <div className="flex space-x-2">
                  {searchInfo.category && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {searchInfo.category}
                    </span>
                  )}
                  {searchInfo.priceRange && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                      {searchInfo.priceRange}
                    </span>
                  )}
                  {searchInfo.sortBy && searchInfo.sortBy !== 'relevance' && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                      {searchInfo.sortBy.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {results.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onSave={onSaveProduct}
                onView={onViewProduct}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading More Indicator */}
      {loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-gray-400">Loading more products...</span>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-4 mt-8"
        >
          {/* Previous Page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!pagination.hasPrevPage}
            className={`p-3 rounded-full transition-colors ${
              pagination.hasPrevPage
                ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Page Info */}
          <div className="text-center">
            <p className="text-white font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <p className="text-gray-400 text-sm">
              {pagination.totalResults} total results
            </p>
          </div>

          {/* Next Page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!pagination.hasNextPage}
            onClick={loadMore}
            className={`p-3 rounded-full transition-colors ${
              pagination.hasNextPage
                ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      {/* Load More Button */}
      {pagination?.hasNextPage && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadMore}
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Load More Products
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default SearchResults; 