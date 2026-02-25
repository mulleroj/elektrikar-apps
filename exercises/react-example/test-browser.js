import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
