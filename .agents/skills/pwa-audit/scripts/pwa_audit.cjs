#!/usr/bin/env node
'use strict';

/**
 * PWA Audit script for the Bible Verse Reader project.
 * Usage: node pwa_audit.cjs [path-to-project-root]
 * Exit code: 0 if no FAIL results, 1 otherwise.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(process.argv[2] || '.');
const results = [];

function pass(msg) { results.push({ status: 'PASS', msg }); }
function warn(msg) { results.push({ status: 'WARN', msg }); }
function fail(msg) { results.push({ status: 'FAIL', msg }); }

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function walk(dir, exts, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

// 1. manifest.json
const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
const manifestRaw = readFileSafe(manifestPath);
if (!manifestRaw) {
  fail('public/manifest.json not found.');
} else {
  try {
    const manifest = JSON.parse(manifestRaw);
    const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display', 'theme_color', 'background_color'];
    const missing = requiredFields.filter((f) => !(f in manifest));
    if (missing.length) {
      fail(`manifest.json is missing fields: ${missing.join(', ')}`);
    } else {
      pass('manifest.json contains all required fields.');
    }

    if (manifest.display !== 'standalone') {
      warn(`manifest.json "display" is "${manifest.display}", expected "standalone" for a home-screen app.`);
    }

    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const has192 = icons.some((i) => (i.sizes || '').includes('192x192'));
    const has512 = icons.some((i) => (i.sizes || '').includes('512x512'));
    if (!has192 || !has512) {
      fail('manifest.json must declare both a 192x192 and a 512x512 icon.');
    } else {
      pass('manifest.json declares 192x192 and 512x512 icons.');
    }

    for (const icon of icons) {
      if (icon.src) {
        const iconPath = path.join(projectRoot, 'public', icon.src.replace(/^\//, ''));
        if (!fs.existsSync(iconPath)) {
          fail(`Icon referenced in manifest.json but missing on disk: ${icon.src}`);
        }
      }
    }
  } catch (e) {
    fail(`manifest.json is not valid JSON: ${e.message}`);
  }
}

// 2. index.html — iOS meta tags + manifest link
const indexPath = path.join(projectRoot, 'index.html');
const indexHtml = readFileSafe(indexPath);
if (!indexHtml) {
  fail('index.html not found at project root.');
} else {
  const checks = [
    ['apple-mobile-web-app-capable', 'apple-mobile-web-app-capable meta tag'],
    ['apple-touch-icon', 'apple-touch-icon link tag'],
    ['apple-mobile-web-app-status-bar-style', 'apple-mobile-web-app-status-bar-style meta tag'],
    ['rel="manifest"', 'manifest link tag'],
  ];
  for (const [needle, label] of checks) {
    if (indexHtml.includes(needle)) pass(`index.html has the ${label}.`);
    else fail(`index.html is missing the ${label} (required for "Add to Home Screen" on iOS).`);
  }
}

// 3. Service worker / vite-plugin-pwa setup
const viteConfigPath = ['vite.config.ts', 'vite.config.js']
  .map((f) => path.join(projectRoot, f))
  .find((p) => fs.existsSync(p));

if (!viteConfigPath) {
  fail('No vite.config.ts/js found at project root.');
} else {
  const cfg = readFileSafe(viteConfigPath) || '';
  if (/vite-plugin-pwa|VitePWA/.test(cfg)) {
    pass('vite-plugin-pwa is configured in vite.config.');
  } else {
    fail('vite-plugin-pwa (VitePWA) is not configured in vite.config — offline caching/service worker will not work.');
  }
}

// 4. Source scan: 100vh usage, safe-area-inset usage, localStorage usage
const srcDir = path.join(projectRoot, 'src');
const sourceFiles = walk(srcDir, ['.ts', '.tsx', '.css']);

const vhHits = [];
let safeAreaHit = false;
const localStorageHits = [];

for (const file of sourceFiles) {
  const content = readFileSafe(file) || '';
  const rel = path.relative(projectRoot, file);
  content.split('\n').forEach((line, i) => {
    if (/\b100vh\b/.test(line)) vhHits.push(`${rel}:${i + 1}`);
    if (/env\(safe-area-inset/.test(line)) safeAreaHit = true;
    if (/localStorage\.(setItem|getItem)/.test(line)) {
      localStorageHits.push(`${rel}:${i + 1} -> ${line.trim()}`);
    }
  });
}

if (vhHits.length) {
  fail(`Found "100vh" usage (project rule requires "100dvh"): ${vhHits.join(', ')}`);
} else {
  pass('No "100vh" usage found in src/.');
}

if (safeAreaHit) {
  pass('env(safe-area-inset-*) is used somewhere in src/.');
} else {
  warn('No env(safe-area-inset-*) usage found in src/ — check notch/home-indicator spacing is handled.');
}

if (localStorageHits.length) {
  warn(
    'localStorage usage found (project rule: only simple preferences like theme should use localStorage; ' +
      'saved verses/reading progress must use IndexedDB):\n  - ' +
      localStorageHits.join('\n  - ')
  );
} else {
  pass('No localStorage usage found for structured data in src/.');
}

// 5. package.json — no backend dependencies
const pkgPath = path.join(projectRoot, 'package.json');
const pkgRaw = readFileSafe(pkgPath);
if (!pkgRaw) {
  fail('package.json not found.');
} else {
  try {
    const pkg = JSON.parse(pkgRaw);
    const allDeps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
    const forbidden = ['express', 'koa', 'fastify', 'mongoose', 'pg', 'mysql', 'mysql2', 'sqlite3', '@nestjs/core'];
    const foundForbidden = forbidden.filter((d) => d in allDeps);
    if (foundForbidden.length) {
      fail(`Backend-oriented dependencies found (project must stay static/serverless): ${foundForbidden.join(', ')}`);
    } else {
      pass('No backend dependencies found — project is static, as required.');
    }
  } catch (e) {
    fail(`package.json is not valid JSON: ${e.message}`);
  }
}

// Report
const order = { FAIL: 0, WARN: 1, PASS: 2 };
results.sort((a, b) => order[a.status] - order[b.status]);

console.log('\n=== PWA Audit Report ===\n');
for (const r of results) {
  console.log(`[${r.status}] ${r.msg}`);
}

const failCount = results.filter((r) => r.status === 'FAIL').length;
const warnCount = results.filter((r) => r.status === 'WARN').length;
const passCount = results.length - failCount - warnCount;

console.log(`\n${results.length} checks run — ${failCount} FAIL, ${warnCount} WARN, ${passCount} PASS.\n`);

process.exit(failCount > 0 ? 1 : 0);
