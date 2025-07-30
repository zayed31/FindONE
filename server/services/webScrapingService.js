import puppeteer from 'puppeteer';

class WebScrapingService {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      this.isInitialized = true;
      console.log('✅ Web scraping service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize web scraping:', error);
    }
  }

  async scrapeFlipkart(query) {
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for products to load
      await page.waitForSelector('[data-id]', { timeout: 10000 });
      
      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll('[data-id]');
        const results = [];
        
        productElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to 10 results
          
          try {
            const titleElement = element.querySelector('a[title]');
            const priceElement = element.querySelector('div[class*="price"]');
            const imageElement = element.querySelector('img[src*="image"]');
            const ratingElement = element.querySelector('div[class*="rating"]');
            
            if (titleElement) {
              results.push({
                title: titleElement.getAttribute('title') || titleElement.textContent,
                url: 'https://www.flipkart.com' + titleElement.getAttribute('href'),
                price: priceElement ? priceElement.textContent.trim() : null,
                image: imageElement ? imageElement.getAttribute('src') : null,
                rating: ratingElement ? ratingElement.textContent.trim() : null,
                domain: 'flipkart.com',
                source_api: 'web_scraping'
              });
            }
          } catch (error) {
            console.error('Error parsing product:', error);
          }
        });
        
        return results;
      });
      
      await page.close();
      return products;
      
    } catch (error) {
      console.error('❌ Flipkart scraping failed:', error);
      return [];
    }
  }

  async scrapeAmazon(query) {
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for products to load
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });
      
      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
        const results = [];
        
        productElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to 10 results
          
          try {
            const titleElement = element.querySelector('h2 a');
            const priceElement = element.querySelector('.a-price-whole');
            const imageElement = element.querySelector('img[src*="images"]');
            const ratingElement = element.querySelector('i[class*="a-star"]');
            
            if (titleElement) {
              results.push({
                title: titleElement.textContent.trim(),
                url: 'https://www.amazon.in' + titleElement.getAttribute('href'),
                price: priceElement ? '₹' + priceElement.textContent.trim() : null,
                image: imageElement ? imageElement.getAttribute('src') : null,
                rating: ratingElement ? ratingElement.textContent.trim() : null,
                domain: 'amazon.in',
                source_api: 'web_scraping'
              });
            }
          } catch (error) {
            console.error('Error parsing product:', error);
          }
        });
        
        return results;
      });
      
      await page.close();
      return products;
      
    } catch (error) {
      console.error('❌ Amazon scraping failed:', error);
      return [];
    }
  }

  async scrapeCroma(query) {
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const searchUrl = `https://www.croma.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for products to load
      await page.waitForSelector('.product-item', { timeout: 10000 });
      
      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.product-item');
        const results = [];
        
        productElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to 10 results
          
          try {
            const titleElement = element.querySelector('.product-name');
            const priceElement = element.querySelector('.price');
            const imageElement = element.querySelector('img');
            const linkElement = element.querySelector('a');
            
            if (titleElement && linkElement) {
              results.push({
                title: titleElement.textContent.trim(),
                url: 'https://www.croma.com' + linkElement.getAttribute('href'),
                price: priceElement ? priceElement.textContent.trim() : null,
                image: imageElement ? imageElement.getAttribute('src') : null,
                rating: null,
                domain: 'croma.com',
                source_api: 'web_scraping'
              });
            }
          } catch (error) {
            console.error('Error parsing product:', error);
          }
        });
        
        return results;
      });
      
      await page.close();
      return products;
      
    } catch (error) {
      console.error('❌ Croma scraping failed:', error);
      return [];
    }
  }

  async scrapeMultipleSites(query) {
    await this.initialize();
    
    const results = [];
    
    // Scrape multiple sites in parallel
    const scrapingPromises = [
      this.scrapeFlipkart(query),
      this.scrapeAmazon(query),
      this.scrapeCroma(query)
    ];
    
    try {
      const siteResults = await Promise.allSettled(scrapingPromises);
      
      siteResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          console.error(`❌ Site ${index} scraping failed:`, result.reason);
        }
      });
      
    } catch (error) {
      console.error('❌ Multiple site scraping failed:', error);
    }
    
    return results;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.isInitialized = false;
    }
  }
}

export default WebScrapingService; 