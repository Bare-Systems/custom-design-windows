import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BUSINESS, ROUTES, SERVICES, GALLERY, FAQ } from '../src/data.js';

test('every navigation route has a static HTML entry with metadata', async () => {
  assert.equal(ROUTES.length, 7);
  for (const route of ROUTES) {
    const path = route.path ? route.path + '/index.html' : 'index.html';
    const html = await readFile(new URL('../' + path, import.meta.url), 'utf8');
    assert.ok(html.includes('<title>'), path);
    assert.ok(html.includes('name="description"'), path);
    assert.ok(html.includes('name="robots" content="noindex,nofollow"'), path);
    assert.ok(html.includes('src="/src/main.jsx"'), path);
  }
});

test('contact information is present and formatted for phone/email links', () => {
  assert.equal(BUSINESS.phoneHref, 'tel:+19546540821');
  assert.match(BUSINESS.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  assert.equal(BUSINESS.address.length, 3);
});

test('all migration gallery items use distinct originals and meaningful descriptions', () => {
  assert.ok(GALLERY.length >= 10);
  assert.equal(new Set(GALLERY.map(photo => photo.image)).size, GALLERY.length);
  for (const photo of GALLERY) {
    assert.ok(photo.image.startsWith('https://lirp.cdn-website.com/'));
    assert.ok(photo.alt.length >= 20);
    assert.ok(photo.type.length > 0);
  }
});

test('services and frequently asked questions are populated', () => {
  assert.ok(SERVICES.length >= 5);
  assert.ok(FAQ.length >= 3);
  assert.ok(SERVICES.every(service => service.title && service.text && service.detail));
  assert.ok(FAQ.every(item => item.question.endsWith('?') && item.answer.length > 50));
});

test('no runtime secrets or backend are needed for this static project', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.build, 'vite build');
  assert.equal(pkg.dependencies.react?.startsWith('^19.'), true);
  const flow = await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
  assert.match(flow, /actions\/deploy-pages@v4/);
});
