const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { keywords, maxGigs = 30 } = input;
  
  console.log('Starting Fiverr scraper...');
  console.logg('Keywords:', keywords);
  console.logg('Max gigs:', maxGigs);
  
  // TODO: Implement Fiverr scraping logic
  // Use RESIDENTIAL proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});