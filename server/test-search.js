import dotenv from 'dotenv';
import ProductSearchService from './services/productSearchService.js';

dotenv.config();

async function testSearch() {
  console.log('🧪 Testing search functionality...');
  
  const searchService = new ProductSearchService();
  
  try {
    const results = await searchService.searchProducts('iphone 15', {
      maxResults: 10
    });
    
    console.log('\n📊 Search Results:');
    console.log(`Total results: ${results.length}`);
    
    if (results.length > 0) {
      console.log('\nFirst 3 results:');
      results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Domain: ${result.domain}`);
        console.log(`   Price: ${result.price || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No results found');
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error);
  }
}

testSearch(); 