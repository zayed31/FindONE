import QueryUnderstandingService from './services/queryUnderstandingService.js';

console.log('🧪 Testing Layer 1: Query Understanding Service\n');

const queryService = new QueryUnderstandingService();

// Test cases for different Indian English patterns
const testCases = [
  // Budget-focused queries
  "I want a phone under 50k",
  "Show me phones around ₹45000",
  "Looking for mobile between 30-50 thousand rupees",
  "Need a phone under 1 lakh",
  
  // Feature-focused queries
  "I need a phone with good camera",
  "Looking for mobile with excellent battery life",
  "Show me phones with great performance",
  "Need a gaming phone",
  
  // Use case queries
  "I want a phone for photography",
  "Looking for student phone",
  "Need business phone",
  
  // Quality level queries
  "Show me the best phones",
  "Looking for top camera phones",
  "Need decent performance",
  
  // Brand-specific queries
  "I want Samsung phone",
  "Looking for iPhone",
  "Show me OnePlus phones",
  
  // Complex queries
  "I need a phone under 50k with good camera for photography",
  "Looking for gaming phone around 40k with excellent performance",
  "Show me student phones under 30k with decent battery",
  "Need premium phone with great camera and long battery life"
];

console.log('🔍 Testing Query Understanding Layer 1\n');

testCases.forEach((query, index) => {
  console.log(`\n📝 Test Case ${index + 1}: "${query}"`);
  console.log('─'.repeat(60));
  
  try {
    const result = queryService.processUserInput(query);
    
    console.log('✅ Original Query:', result.originalQuery);
    console.log('🔄 Normalized Query:', result.normalizedQuery);
    
    if (result.extractedInfo.budget.type) {
      console.log('💰 Budget:', {
        type: result.extractedInfo.budget.type,
        min: result.extractedInfo.budget.min,
        max: result.extractedInfo.budget.max,
        target: result.extractedInfo.budget.target
      });
    }
    
    if (result.extractedInfo.features.length > 0) {
      console.log('🎯 Features:', result.extractedInfo.features.map(f => ({
        pattern: f.pattern,
        features: f.features,
        priority: f.priority
      })));
    }
    
    if (result.extractedInfo.qualityLevels.length > 0) {
      console.log('⭐ Quality Levels:', result.extractedInfo.qualityLevels.map(q => ({
        level: q.level,
        rating: q.rating,
        boost: q.boost,
        priority: q.priority
      })));
    }
    
    if (result.extractedInfo.useCase !== 'general') {
      console.log('🎯 Use Case:', result.extractedInfo.useCase);
    }
    
    if (result.extractedInfo.brand) {
      console.log('🏷️ Brand:', result.extractedInfo.brand);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

console.log('\n🎉 Layer 1 Testing Complete!'); 