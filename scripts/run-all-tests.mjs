import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function findTests(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') {
        results.push(...findTests(fullPath));
      }
    } else if (entry.name.endsWith('.test.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const testFiles = findTests('tests');
console.log(`Discovered ${testFiles.length} test suites. Running serially...`);

const result = spawnSync(
  process.execPath,
  ['--experimental-strip-types', '--test-concurrency=1', '--test', ...testFiles],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 0);
