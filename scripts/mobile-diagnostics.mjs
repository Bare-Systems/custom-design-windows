import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs/promises';

const targets = [
  ['preview', 'https://bare-systems.github.io/custom-design-windows/'],
  ['original', 'https://www.customdesignwindows.com/'],
];
const engines = [
  ['Chromium Desktop', chromium, { viewport: { width: 1366, height: 900 } }],
  ['Chromium Pixel 7', chromium, { ...devices['Pixel 7'] }],
  ['WebKit iPhone 13', webkit, { ...devices['iPhone 13'] }],
];
await fs.mkdir('mobile-diagnostics', { recursive: true });
let count = 0;
let hasIssue = false;
for (const [engineName, engine, options] of engines) {
  let browser;
  try { browser = await engine.launch(); }
  catch (e) { console.error('LAUNCH ERROR', engineName, String(e)); continue; }
  for (const [targetName, url] of targets) {
    const context = await browser.newContext({ ...options, ignoreHTTPSErrors: false });
    const page = await context.newPage();
    const logs = [];
    page.on('pageerror', e => logs.push('PAGE ERROR ' + e.message));
    page.on('console', msg => { if (msg.type() === 'error') logs.push('CONSOLE ERROR ' + msg.text().slice(0,250)); });
    page.on('requestfailed', req => logs.push('NETWORK ERROR ' + req.url() + ' : ' + req.failure()?.errorText));
    page.on('response', resp => { if (resp.status() >= 400) logs.push('HTTP ' + resp.status() + ' ' + resp.url()); });
    let status = -1;
    let title = '(none)';
    let content = '(none)';
    let rootLength = 0;
    let height = 0;
    let viewport = '';
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = response?.status() ?? -1;
      await page.waitForTimeout(3500);
      title = await page.title();
      content = (await page.locator('body').innerText({ timeout: 12000 })).slice(0, 240).replaceAll('\\n', ' | ');
      rootLength = await page.locator('#root').evaluate(el => el.innerText.length).catch(() => -1);
      height = await page.locator('body').evaluate(el => el.scrollHeight).catch(() => -1);
      viewport = await page.evaluate(() => JSON.stringify({ width: window.innerWidth, dpr: window.devicePixelRatio, ready: document.readyState }));
      await page.screenshot({ path: 'mobile-diagnostics/' + (engineName + '-' + targetName).replaceAll(' ', '_') + '.png', fullPage: false });
    } catch(e) { logs.push('EXCEPTION ' + String(e)); }
    console.log(JSON.stringify({ engine: engineName, target: targetName, url, status, title, rootLength, height, viewport, content, logs: logs.slice(0, 25) }));
    if (targetName === 'preview' && (status !== 200 || rootLength < 100 || logs.some(log => log.startsWith('PAGE ERROR')))) hasIssue = true;
    count++;
    await context.close();
  }
  await browser.close();
}
if (count < 4 || hasIssue) process.exitCode = 1;
