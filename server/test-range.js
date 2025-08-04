import QueryUnderstandingService from './services/queryUnderstandingService.js';

const queryService = new QueryUnderstandingService();

console.log('🧪 Testing Range Parsing\n');

const rangeTests = [
  "Looking for mobile between 30-50 thousand rupees",
  "Show me phones between 40k to 60k",
  "Need phone between 1-2 lakh"
];

rangeTests.forEach((query, index) => {
  console.log(`\n📝 Range Test ${index + 1}: "${query}"`);
  console.log('─'.repeat(50));
  
  const result = queryService.processUserInput(query);
  console.log('💰 Budget:', result.extractedInfo.budget);
}); 