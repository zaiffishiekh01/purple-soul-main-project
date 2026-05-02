#!/usr/bin/env node
/**
 * Hit public Next.js API routes (no secrets). Use after `npm run dev` or against any base URL.
 *
 *   BASE_URL=http://localhost:3000 node scripts/smoke-local-api.mjs
 */

const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const paths = ['/api/health', '/api/catalog/navigation', '/api/catalog/taxonomy', '/api/catalog/facets'];

async function main() {
  let failed = false;
  for (const p of paths) {
    const url = `${base}${p}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const ok = res.ok;
      console.log(`${ok ? 'OK' : 'FAIL'} ${res.status} ${url}`);
      if (!ok) failed = true;
    } catch (e) {
      console.error(`FAIL ${url}`, e instanceof Error ? e.message : e);
      failed = true;
    }
  }
  if (failed) {
    console.error('\nSmoke checks failed. Is the server running? Try: npm run dev');
    process.exit(1);
  }
  console.log('\nAll smoke checks passed.');
}

main();
