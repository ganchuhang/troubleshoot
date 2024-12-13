import _ from 'lodash';
import { DateTime } from 'luxon';
import puppeteer from 'puppeteer';
import * as config from './config.js';

async function main() {
  console.log(`🕛`, `${DateTime.now().toSQL()}`);
  console.log(`🔆 Start Troubleshoot`);

  // console.log(`🔆 puppeteer.option:`, config.option);

  if (config.proxy.host) {
    console.log(`😎 PROXY LOGIN detected:`, config.proxy.host);
    config.option.args.push(`--proxy-server=${config.proxy.host}`);
  }

  const browser = await puppeteer.launch(config.option);
  const pages = await browser.pages();
  const page = pages.shift();

  if (config.proxy.auth) {
    const [username, password] = config.proxy.auth.split(':');
    await page.authenticate({ username, password });
    console.log(`😎 PROXY LOGIN authenticated:`, config.proxy.login, { username, password });
  }

  page.on('response', async (response) => {
    if (response.status() !== 200) { return; }
    if (response.request().method().toUpperCase() === 'OPTIONS') { return; }
    if (!response.url().startsWith('https://www.maybank2u.com.my')) { return; }
    const type = response.headers()['content-type'];
    if (!type) { return; }
    switch (true) {
      case type.includes('application'):
      case type.includes('text/html'):
        break;
      default: return;
    }
    try {
      const body = await response.text();
      if (!body) { return; }
      // remove all whitespace
      console.log(`🔆 response.url:`, response.url().slice(0, 160)); // , response.headers()
      console.log(`📰`, body.slice(0, 160).replace(/\s+/g, ''), `...`);
    } catch (error) {
      console.error(`🚧 response.url:`, error.message);
    }
  });

  // await page.goto('https://api.ipify.org/', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/http2-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  await page.goto('https://scrapfly.io/web-scraping-tools/ja3-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // 
}

main();