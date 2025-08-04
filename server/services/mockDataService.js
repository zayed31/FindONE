/**
 * Mock Data Service for Stage 3 Testing
 * Provides realistic mock data for testing hierarchical retrieval
 */

class MockDataService {
  constructor() {
    this.mockProducts = {
      'mobile_phones': {
        'samsung': [
          {
            id: 'samsung_s24_fe_1',
            title: 'Samsung Galaxy S24 FE 128GB Mint',
            price: '₹59,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.4,
            reviews: 890,
            seller: 'Samsung',
            domain: 'flipkart.com',
            url: 'https://www.flipkart.com/samsung-galaxy-s24-fe',
            buy_url: 'https://www.flipkart.com/samsung-galaxy-s24-fe/buy',
            source_api: 'Flipkart',
            image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/s/2/4/galaxy-s24-fe-samsung-original-imagxyz123.jpeg',
            description: 'Samsung Galaxy S24 FE with Fan Edition features'
          },
          {
            id: 'samsung_s24_fe_2',
            title: 'Samsung Galaxy S24 FE 256GB Graphite',
            price: '₹64,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.3,
            reviews: 567,
            seller: 'Samsung',
            domain: 'amazon.in',
            url: 'https://www.amazon.in/samsung-galaxy-s24-fe',
            buy_url: 'https://www.amazon.in/samsung-galaxy-s24-fe/buy',
            source_api: 'Amazon India',
            image: 'https://m.media-amazon.com/images/I/71xyz456.jpg',
            description: 'Samsung Galaxy S24 FE with premium features'
          },
          {
            id: 'samsung_s25_1',
            title: 'Samsung Galaxy S25 128GB Phantom Black',
            price: '₹89,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.5,
            reviews: 1250,
            seller: 'Samsung',
            domain: 'flipkart.com',
            url: 'https://www.flipkart.com/samsung-galaxy-s25',
            buy_url: 'https://www.flipkart.com/samsung-galaxy-s25/buy',
            source_api: 'Flipkart',
            image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/s/2/5/galaxy-s25-samsung-original-imagxyz123.jpeg',
            description: 'Latest Samsung Galaxy S25 with advanced features'
          },
                     {
             id: 'samsung_s25_2',
             title: 'Samsung Galaxy S25 Ultra 256GB Titanium',
             price: '₹1,19,999',
             currency: 'INR',
             availability: 'In Stock',
             rating: 4.7,
             reviews: 890,
             seller: 'Samsung',
             domain: 'amazon.in',
             url: 'https://www.amazon.in/samsung-galaxy-s25-ultra',
             buy_url: 'https://www.amazon.in/samsung-galaxy-s25-ultra/buy',
             source_api: 'Amazon India',
             image: 'https://m.media-amazon.com/images/I/71xyz123.jpg',
             description: 'Premium Samsung Galaxy S25 Ultra with S Pen'
           },
           {
             id: 'samsung_a15_1',
             title: 'Samsung Galaxy A15 128GB Light Blue',
             price: '₹13,999',
             currency: 'INR',
             availability: 'In Stock',
             rating: 4.2,
             reviews: 456,
             seller: 'Samsung',
             domain: 'flipkart.com',
             url: 'https://www.flipkart.com/samsung-galaxy-a15',
             buy_url: 'https://www.flipkart.com/samsung-galaxy-a15/buy',
             source_api: 'Flipkart',
             image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/a/1/5/galaxy-a15-samsung-original-imagxyz789.jpeg',
             description: 'Samsung Galaxy A15 with 50MP camera and 5000mAh battery'
           },
           {
             id: 'samsung_a15_2',
             title: 'Samsung Galaxy A15 256GB Dark Gray',
             price: '₹15,999',
             currency: 'INR',
             availability: 'In Stock',
             rating: 4.1,
             reviews: 234,
             seller: 'Samsung',
             domain: 'amazon.in',
             url: 'https://www.amazon.in/samsung-galaxy-a15',
             buy_url: 'https://www.amazon.in/samsung-galaxy-a15/buy',
             source_api: 'Amazon India',
             image: 'https://m.media-amazon.com/images/I/71xyz456.jpg',
             description: 'Samsung Galaxy A15 with 6.5 inch display and 25W charging'
           },
           {
             id: 'samsung_a73_1',
             title: 'Samsung Galaxy A73 5G 128GB Awesome Black',
             price: '₹32,999',
             currency: 'INR',
             availability: 'In Stock',
             rating: 4.4,
             reviews: 678,
             seller: 'Samsung',
             domain: 'flipkart.com',
             url: 'https://www.flipkart.com/samsung-galaxy-a73-5g',
             buy_url: 'https://www.flipkart.com/samsung-galaxy-a73-5g/buy',
             source_api: 'Flipkart',
             image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/a/7/3/galaxy-a73-samsung-original-imagxyz101.jpeg',
             description: 'Samsung Galaxy A73 5G with 108MP camera and 5000mAh battery'
           },
           {
             id: 'samsung_a73_2',
             title: 'Samsung Galaxy A73 5G 256GB Awesome White',
             price: '₹35,999',
             currency: 'INR',
             availability: 'In Stock',
             rating: 4.3,
             reviews: 345,
             seller: 'Samsung',
             domain: 'amazon.in',
             url: 'https://www.amazon.in/samsung-galaxy-a73-5g',
             buy_url: 'https://www.amazon.in/samsung-galaxy-a73-5g/buy',
             source_api: 'Amazon India',
             image: 'https://m.media-amazon.com/images/I/71xyz789.jpg',
             description: 'Samsung Galaxy A73 5G with 6.7 inch AMOLED display'
           }
        ],
        'apple': [
          {
            id: 'iphone_15_1',
            title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
            price: '₹1,49,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.6,
            reviews: 2100,
            seller: 'Apple',
            domain: 'flipkart.com',
            url: 'https://www.flipkart.com/apple-iphone-15-pro-max',
            buy_url: 'https://www.flipkart.com/apple-iphone-15-pro-max/buy',
            source_api: 'Flipkart',
            image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/1/5/iphone-15-pro-max-apple-original-imagxyz456.jpeg',
            description: 'Latest iPhone 15 Pro Max with A17 Pro chip'
          }
        ]
      },
      'home_appliances': {
        'samsung': [
          {
            id: 'samsung_washing_1',
            title: 'Samsung 8.5 kg Front Load Washing Machine',
            price: '₹45,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.3,
            reviews: 567,
            seller: 'Samsung',
            domain: 'croma.com',
            url: 'https://www.croma.com/samsung-washing-machine',
            buy_url: 'https://www.croma.com/samsung-washing-machine/buy',
            source_api: 'Croma',
            image: 'https://images.croma.com/image/xyz123.jpg',
            description: 'Samsung EcoBubble washing machine with advanced features'
          },
          {
            id: 'samsung_refrigerator_1',
            title: 'Samsung 253L Double Door Refrigerator',
            price: '₹32,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.2,
            reviews: 432,
            seller: 'Samsung',
            domain: 'reliance-digital.in',
            url: 'https://www.reliance-digital.in/samsung-refrigerator',
            buy_url: 'https://www.reliance-digital.in/samsung-refrigerator/buy',
            source_api: 'Reliance Digital',
            image: 'https://images.reliance-digital.in/xyz123.jpg',
            description: 'Samsung refrigerator with digital inverter technology'
          }
        ]
      },
      'electronics': {
        'samsung': [
          {
            id: 'samsung_tv_1',
            title: 'Samsung 55" QLED 4K Smart TV',
            price: '₹89,999',
            currency: 'INR',
            availability: 'In Stock',
            rating: 4.4,
            reviews: 789,
            seller: 'Samsung',
            domain: 'flipkart.com',
            url: 'https://www.flipkart.com/samsung-qled-tv',
            buy_url: 'https://www.flipkart.com/samsung-qled-tv/buy',
            source_api: 'Flipkart',
            image: 'https://rukminim2.flixcart.com/image/416/416/xif0q/tv/q/l/e/samsung-qled-original-imagxyz789.jpeg',
            description: 'Samsung QLED TV with Quantum Dot technology'
          }
        ]
      }
    };
  }

  /**
   * Get mock products for a specific query and category
   */
  getMockProducts(query, category, sourceType = 'primary') {
    const products = [];
    const queryLower = query.toLowerCase();
    
    // Extract brand from query
    let brand = null;
    if (queryLower.includes('samsung')) brand = 'samsung';
    else if (queryLower.includes('apple') || queryLower.includes('iphone')) brand = 'apple';
    
    if (brand && this.mockProducts[category] && this.mockProducts[category][brand]) {
      // Filter products based on query
      const brandProducts = this.mockProducts[category][brand];
      
      for (const product of brandProducts) {
        const matches = this.matchesQuery(product, query);
        if (matches) {
          // Add source-specific modifications
          const modifiedProduct = this.modifyForSource(product, sourceType);
          products.push(modifiedProduct);
        }
      }
    }
    return products;
  }

  /**
   * Check if product matches the query
   */
  matchesQuery(product, query) {
    const queryLower = query.toLowerCase();
    const titleLower = product.title.toLowerCase();
    
        // Check for specific model patterns (S24 FE, S25, A15, A73, etc.)
    const modelMatch = query.match(/\b(s25|s24|s23|a15|a73|a54|a34|15|14|13)\b/i);
    if (modelMatch) {
      const modelNumber = modelMatch[1].toLowerCase();
      
      // Check if title contains the model number
      if (titleLower.includes(modelNumber)) {
        // For FE models, also check for "fe" in the title
        if (queryLower.includes('fe') && titleLower.includes('fe')) {
          return true;
        }
        // For A series models, check for "a" + number pattern
        if (modelNumber.startsWith('a') && titleLower.includes('a' + modelNumber.substring(1))) {
          return true;
        }
        // For regular models, just check the number
        if (!queryLower.includes('fe') && !modelNumber.startsWith('a')) {
          return true;
        }
      }
    }
    
    // Check for product type
    if (queryLower.includes('washing machine') || queryLower.includes('refrigerator')) {
      return titleLower.includes('washing') || titleLower.includes('refrigerator');
    }
    
    if (queryLower.includes('tv') || queryLower.includes('television')) {
      return titleLower.includes('tv') || titleLower.includes('television');
    }
    
    // Check for phone/mobile keywords
    if (queryLower.includes('phone') || queryLower.includes('mobile') || queryLower.includes('galaxy')) {
      return titleLower.includes('galaxy') || titleLower.includes('mobile') || titleLower.includes('phone');
    }
    
    // General brand match
    return true;
  }

  /**
   * Modify product for different source types
   */
  modifyForSource(product, sourceType) {
    const modified = { ...product };
    
    switch (sourceType) {
      case 'primary':
        // Primary sources have better data quality
        break;
      case 'secondary':
        // Secondary sources might have less complete data
        if (Math.random() > 0.7) {
          modified.rating = null;
        }
        if (Math.random() > 0.8) {
          modified.reviews = null;
        }
        break;
      case 'tertiary':
        // Tertiary sources have basic data
        modified.rating = null;
        modified.reviews = null;
        modified.description = '';
        break;
    }
    
    return modified;
  }

  /**
   * Simulate API delay
   */
  async simulateAPIDelay(minDelay = 100, maxDelay = 500) {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate API failure
   */
  simulateAPIFailure(failureRate = 0.1) {
    return Math.random() < failureRate;
  }
}

export default MockDataService; 