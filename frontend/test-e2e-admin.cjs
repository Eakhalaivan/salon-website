const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`FAILED REQUEST [${response.status()}]:`, response.url());
    }
  });

  console.log('Navigating to admin login...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for form...');
  await page.waitForSelector('input[name="email"]');
  
  console.log('Filling form...');
  await page.type('input[name="email"]', 'admin@luxesuite.com');
  await page.type('input[name="password"]', 'admin123'); // Just a guess, let's see if it works, or if there's a login error
  
  console.log('Submitting...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for network requests to settle...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Final URL:', page.url());
  
  await browser.close();
})();
