/**
 * API Configuration Diagnostic Tool
 * Checks what API keys are configured and what's missing
 */

import { checkApiKeys } from './config/apiKeys.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 API Configuration Diagnostic\n');

// Check API configuration status
const apiStatus = checkApiKeys();

console.log('📊 API Configuration Status:');
console.log('============================');

// Google Search API
console.log('\n🔍 Google Search API:');
if (apiStatus.google_search.configured) {
  console.log('  ✅ Configured');
} else {
  console.log('  ❌ Missing:', apiStatus.google_search.missing.join(', '));
}

// Google Shopping API
console.log('\n🛒 Google Shopping API:');
if (apiStatus.google_shopping_api.configured) {
  console.log('  ✅ Configured');
} else {
  console.log('  ❌ Missing:', apiStatus.google_shopping_api.missing.join(', '));
}

// SerpAPI
console.log('\n🌐 SerpAPI:');
if (apiStatus.serpapi.configured) {
  console.log('  ✅ Configured');
} else {
  console.log('  ❌ Missing:', apiStatus.serpapi.missing.join(', '));
}

// Amazon PA-API
console.log('\n📦 Amazon PA-API:');
if (apiStatus.amazon_paapi.configured) {
  console.log('  ✅ Configured');
} else {
  console.log('  ❌ Missing:', apiStatus.amazon_paapi.missing.join(', '));
}

// Summary
console.log('\n📋 Summary:');
const configuredApis = Object.values(apiStatus).filter(api => api.configured).length;
const totalApis = Object.keys(apiStatus).length;
console.log(`  Configured APIs: ${configuredApis}/${totalApis}`);

if (configuredApis === 0) {
  console.log('\n🚨 No APIs are configured!');
  console.log('\n📝 Required Environment Variables:');
  console.log('==================================');
  console.log('\nFor Google Search API:');
  console.log('  GOOGLE_SEARCH_API_KEY=your_api_key');
  console.log('  GOOGLE_SEARCH_ENGINE_ID=your_engine_id');
  
  console.log('\nFor Google Shopping API:');
  console.log('  GOOGLE_MERCHANT_ACCOUNT_ID=your_merchant_id');
  console.log('  GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_email');
  console.log('  GOOGLE_PRIVATE_KEY=your_private_key');
  
  console.log('\nFor SerpAPI:');
  console.log('  SERPAPI_KEY=your_serpapi_key');
  
  console.log('\nFor Amazon PA-API:');
  console.log('  AMAZON_ACCESS_KEY=your_access_key');
  console.log('  AMAZON_SECRET_KEY=your_secret_key');
  console.log('  AMAZON_ASSOCIATE_TAG=your_associate_tag');
  
  console.log('\n💡 Alternative Solutions:');
  console.log('=======================');
  console.log('\n1. 🆓 Free Alternatives:');
  console.log('   - Use web scraping (limited but free)');
  console.log('   - Use public APIs (limited data)');
  console.log('   - Use mock data for testing');
  
  console.log('\n2. 💰 Paid Alternatives:');
  console.log('   - SerpAPI (starts at $50/month)');
  console.log('   - ScrapingBee (starts at $49/month)');
  console.log('   - Bright Data (starts at $500/month)');
  
  console.log('\n3. 🔧 Technical Alternatives:');
  console.log('   - Build custom scrapers');
  console.log('   - Use RSS feeds');
  console.log('   - Use public product databases');
  
  console.log('\n🎯 Recommended Next Steps:');
  console.log('==========================');
  console.log('\n1. Start with mock data for testing');
  console.log('2. Implement web scraping for basic functionality');
  console.log('3. Consider SerpAPI for production (most accessible)');
  console.log('4. Build custom scrapers for specific sites');
} else {
  console.log('\n✅ Some APIs are configured!');
  console.log('\n🔧 Next Steps:');
  console.log('1. Test the configured APIs');
  console.log('2. Add missing APIs if needed');
  console.log('3. Implement fallback mechanisms');
}

console.log('\n📁 Environment File:');
console.log('===================');
console.log('Expected location: server/.env');
console.log('Current status:', process.env.NODE_ENV ? 'Environment loaded' : 'No .env file found');

// Check if .env file exists
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Create server/.env file with:');
  console.log('================================');
  console.log('# Google Search API');
  console.log('GOOGLE_SEARCH_API_KEY=your_api_key_here');
  console.log('GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here');
  console.log('');
  console.log('# Google Shopping API');
  console.log('GOOGLE_MERCHANT_ACCOUNT_ID=your_merchant_id_here');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_email_here');
  console.log('GOOGLE_PRIVATE_KEY=your_private_key_here');
  console.log('');
  console.log('# Other APIs');
  console.log('SERPAPI_KEY=your_serpapi_key_here');
  console.log('AMAZON_ACCESS_KEY=your_amazon_key_here');
  console.log('AMAZON_SECRET_KEY=your_amazon_secret_here');
  console.log('AMAZON_ASSOCIATE_TAG=your_associate_tag_here');
} 