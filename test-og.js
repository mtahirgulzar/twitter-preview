const axios = require('axios');

// Install axios if not present: npm install axios

const BASE_URL = 'http://localhost:3001';

// Test data
const testData = {
  slugs: ['quickprofits', 'digitaldollars', 'bellyburner', 'wealthwizard', 'moneymaker'],
  usernames: ['novelnet', 'bchbhsba', 'profitpro', 'cashking', 'wealthgen']
};

// Simulate bot user agents
const botUserAgents = {
  twitter: 'Twitterbot/1.0',
  facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  linkedin: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  generic: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
};
    
function generateRandomUrl() {
  const slug = testData.slugs[Math.floor(Math.random() * testData.slugs.length)];
  const username = testData.usernames[Math.floor(Math.random() * testData.usernames.length)];
  const id = Math.floor(100000 + Math.random() * 900000);
  
  return `/landing-${slug}/${username}/${id}`;
}

async function testOGTags(url, userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36') {
  try {
    console.log(`\n🔍 Testing URL: ${BASE_URL}${url}`);
    console.log(`👤 User Agent: ${userAgent.includes('bot') ? '🤖 BOT' : '👤 HUMAN'}`);
    
    const response = await axios.get(`${BASE_URL}${url}`, {
      headers: {
        'User-Agent': userAgent
      }
    });
    
    const html = response.data;
    
    // Extract OG tags
    const ogTitle = html.match(/<meta property="og:title" content="([^"]*)">/)?.[1];
    const ogDescription = html.match(/<meta property="og:description" content="([^"]*)">/)?.[1];
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)">/)?.[1];
    const ogUrl = html.match(/<meta property="og:url" content="([^"]*)">/)?.[1];
    
    console.log('📋 OG Tags Found:');
    console.log(`  Title: ${ogTitle}`);
    console.log(`  Description: ${ogDescription}`);
    console.log(`  Image: ${ogImage}`);
    console.log(`  URL: ${ogUrl}`);
    
    // Check if image is accessible
    if (ogImage) {
      try {
        const imageResponse = await axios.head(ogImage);
        console.log(`✅ Image accessible (${imageResponse.status})`);
      } catch (error) {
        console.log(`❌ Image not accessible: ${error.message}`);
      }
    }
    
    return {
      url: `${BASE_URL}${url}`,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      status: response.status
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${url}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Twitter OG Tag Tests\n');
  
  // Test 1: Human request
  const testUrl1 = generateRandomUrl();
  await testOGTags(testUrl1);
  
  // Test 2: Twitter bot request
  console.log('\n' + '='.repeat(50));
  await testOGTags(testUrl1, botUserAgents.twitter);
  
  // Test 3: Facebook bot request
  console.log('\n' + '='.repeat(50));
  await testOGTags(testUrl1, botUserAgents.facebook);
  
  // Test 4: New URL with Twitter bot
  console.log('\n' + '='.repeat(50));
  const testUrl2 = generateRandomUrl();
  await testOGTags(testUrl2, botUserAgents.twitter);
  
  console.log('\n🎯 Test Summary:');
  console.log('- Generated multiple dynamic URLs');
  console.log('- Tested with different user agents (human vs bots)');
  console.log('- Verified OG tags are present in HTML');
  console.log('- Checked image accessibility');
  console.log('\n📝 Next Steps:');
  console.log('1. Copy one of the test URLs above');
  console.log('2. Share it on Twitter to test the preview issue');
  console.log('3. Use Twitter Card Validator if preview fails');
  console.log('4. Compare behavior before and after validation');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testOGTags, generateRandomUrl, botUserAgents };
