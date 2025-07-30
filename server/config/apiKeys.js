// API Keys Configuration
// Add these to your .env file

// API Status Check
export const checkApiKeys = () => {
  // Always read fresh values from process.env
  const status = {};

  // Google Search API
  status.google_search = {
    configured: !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
    missing: []
  };
  if (!process.env.GOOGLE_SEARCH_API_KEY) status.google_search.missing.push('GOOGLE_SEARCH_API_KEY');
  if (!process.env.GOOGLE_SEARCH_ENGINE_ID) status.google_search.missing.push('GOOGLE_SEARCH_ENGINE_ID');

  // Google Shopping API
  status.google_shopping_api = {
    configured: !!(process.env.GOOGLE_MERCHANT_ACCOUNT_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
    missing: []
  };
  if (!process.env.GOOGLE_MERCHANT_ACCOUNT_ID) status.google_shopping_api.missing.push('GOOGLE_MERCHANT_ACCOUNT_ID');
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) status.google_shopping_api.missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  if (!process.env.GOOGLE_PRIVATE_KEY) status.google_shopping_api.missing.push('GOOGLE_PRIVATE_KEY');

  // SerpApi
  status.serpapi = {
    configured: !!process.env.SERPAPI_KEY,
    missing: process.env.SERPAPI_KEY ? [] : ['SERPAPI_KEY']
  };

  // Amazon PA-API
  status.amazon_paapi = {
    configured: !!(process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY && process.env.AMAZON_ASSOCIATE_TAG),
    missing: []
  };
  if (!process.env.AMAZON_ACCESS_KEY) status.amazon_paapi.missing.push('AMAZON_ACCESS_KEY');
  if (!process.env.AMAZON_SECRET_KEY) status.amazon_paapi.missing.push('AMAZON_SECRET_KEY');
  if (!process.env.AMAZON_ASSOCIATE_TAG) status.amazon_paapi.missing.push('AMAZON_ASSOCIATE_TAG');

  return status;
};

// API Documentation Links
export const API_DOCS = {
  GOOGLE_SEARCH: 'https://developers.google.com/custom-search/v1/overview',
  EBAY: 'https://developer.ebay.com/api-docs/buy/browse/overview.html',
  FLIPKART: 'https://affiliate.flipkart.com/api-docs/',
  SERPAPI: 'https://serpapi.com/docs',
  AMAZON_PAAPI: 'https://webservices.amazon.com/paapi5/documentation/',
  WALMART: 'https://developer.walmart.com/',
  BESTBUY: 'https://developer.bestbuy.com/'
}; 