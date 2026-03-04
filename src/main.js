const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { keywords, maxGigs = 30 } = input;
  
  console.log('Starting Fiverr scraper...');
  console.log('Keywords:', keywords);
  console.log('Max gigs:', maxGigs);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL']
  });
  
  for (const keyword of keywords) {
    if (results.length >= maxGigs) break;
    
    try {
      const searchUrl = `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(keyword)}&page=1`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      const gigs = $('[data-gig-id]');
      
      gigs.each((i, el) => {
        if (results.length >= maxGigs) return false;
        
        const title = $(el).find('[data-testid="gig-title"]').text().trim() || 
                     $(el).find('.gig-title').text().trim() || '';
        const sellerName = $(el).find('[data-testid="seller-name"]').text().trim() || 
                          $(el).find('.seller-name').text().trim() || '';
        const sellerLevel = $(el).find('[data-testid="seller-level"]').text().trim() || 
                           $(el).find('.seller-level').text().trim() || '';
        const price = $(el).find('[data-testid="price"]').text().trim() || 
                     $(el).find('.price').text().trim() || '';
        const ratingText = $(el).find('[data-testid="rating"]').text().trim() || 
                          $(el).find('.rating').text().trim() || '';
        const rating = parseFloat(ratingText) || 0;
        const reviewCount = parseInt($(el).find('[data-testid="review-count"]').text().replace(/[^0-9]/g, '')) || 0;
        const gigId = $(el).attr('data-gig-id') || '';
        
        results.push({
          title,
          sellerName,
          sellerLevel,
          price,
          rating,
          reviewCount,
          gigUrl: gigId ? `https://www.fiverr.com/gig/${gigId}` : '',
          keyword
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error scraping keyword "${keyword}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});