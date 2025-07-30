import { useState } from 'react';
import { Heart, ExternalLink, Star, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onSave, onView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', product.image);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.log('Image failed to load:', product.image);
    setImageError(true);
    setImageLoaded(true);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(product);
  };

  const handleView = () => {
    onView?.(product);
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return price;
  };

  const formatRating = (rating) => {
    if (!rating) return null;
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? null : numRating;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 text-gray-500" />
      );
    }

    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-900">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}

        {/* Product Image */}
        {!imageError && (
          <img
            src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format'}
            alt={product.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Fallback Image */}
        {imageError && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-600/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">Product Image</p>
              <p className="text-xs text-gray-500 mt-1">Not available</p>
            </div>
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isSaved 
                  ? 'bg-red-500/80 text-white' 
                  : 'bg-gray-800/80 text-gray-300 hover:bg-red-500/80 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </motion.button>

            {/* View Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleView}
              className="p-2 rounded-full bg-gray-800/80 text-gray-300 hover:bg-blue-500/80 hover:text-white backdrop-blur-sm transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-purple-500/80 text-white text-xs rounded-full backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-white font-medium text-sm line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Rating */}
        {formatRating(product.rating) && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {renderStars(formatRating(product.rating))}
            </div>
            <span className="text-gray-400 text-xs">
              ({formatRating(product.rating).toFixed(1)})
            </span>
          </div>
        )}

        {/* Price and Source */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-purple-400 font-semibold text-sm">
              {formatPrice(product.price)}
            </p>
            {product.source && (
              <p className="text-gray-500 text-xs">
                from {product.source}
              </p>
            )}
          </div>

          {/* External Link */}
          <motion.a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:bg-purple-500/50 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl" />
      </div>
    </motion.div>
  );
};

export default ProductCard; 