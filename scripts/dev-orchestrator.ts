/**
 * LAUNCH UP - FULL-STACK DEV ORCHESTRATOR
 * Boots all 10 microservices (ports 8004-8013) alongside the Vite frontend (port 3000)
 * Cross-platform compatible (Windows Node 22+ EINVAL safe)
 */

import { spawn, ChildProcess } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface ServiceSpec {
  name: string;
  port: number;
  entry: string;
}

const SERVICES: ServiceSpec[] = [
  { name: 'governance-service (MOD-10)', port: 8004, entry: 'services/governance-service/src/server.ts' },
  { name: 'lead-pitch-service (MOD-01)', port: 8005, entry: 'services/lead-pitch-service/src/server.ts' },
  { name: 'ba-intake-service (MOD-02)', port: 8006, entry: 'services/ba-intake-service/src/server.ts' },
  { name: 'web-builder-service (MOD-03)', port: 8007, entry: 'services/web-builder-service/src/server.ts' },
  { name: 'mobile-app-service (MOD-04)', port: 8008, entry: 'services/mobile-app-service/src/server.ts' },
  { name: 'backend-api-service (MOD-05)', port: 8009, entry: 'services/backend-api-service/src/server.ts' },
  { name: 'qa-secops-service (MOD-06)', port: 8010, entry: 'services/qa-secops-service/src/server.ts' },
  { name: 'marketing-engine-service (MOD-07)', port: 8011, entry: 'services/marketing-engine-service/src/server.ts' },
  { name: 'whatsapp-service (MOD-08)', port: 8012, entry: 'services/whatsapp-service/src/server.ts' },
  { name: 'sre-healing-service (MOD-09)', port: 8013, entry: 'services/sre-healing-service/src/server.ts' },
];

const processes: ChildProcess[] = [];

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startService(svc: ServiceSpec) {
  const isRunning = await checkPort(svc.port);
  if (isRunning) {
    console.log(`[LaunchUp Mesh] ${svc.name} is already active on port ${svc.port}.`);
    return;
  }

  const scriptPath = path.resolve(rootDir, svc.entry);
  const tsxCli = path.resolve(rootDir, 'node_modules/tsx/dist/cli.mjs');
  const spawnArgs = fs.existsSync(tsxCli)
    ? [tsxCli, scriptPath]
    : ['--experimental-strip-types', scriptPath];

  const child = spawn(
    process.execPath,
    spawnArgs,
    {
      cwd: rootDir,
      env: {
        ...process.env,
        PORT: String(svc.port),
        NODE_ENV: 'development',
        LOG_LEVEL: 'warn',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    }
  );

  child.stdout?.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg.includes('listening on port')) {
      console.log(`  ✔ [Port ${svc.port}] ${svc.name} LIVE`);
    }
  });

  child.stderr?.on('data', (data) => {
    const err = data.toString().trim();
    if (err.includes('Error') && !err.includes('experimental')) {
      console.warn(`  ⚠ [Port ${svc.port}] ${svc.name}: ${err.slice(0, 120)}`);
    }
  });

  child.on('error', (err) => {
    console.warn(`  ⚠ Failed to spawn ${svc.name}: ${err.message}`);
  });

  processes.push(child);
}

function startVite() {
  console.log('\n[LaunchUp UI] Spawning Vite development server on port 3000...');
  const viteEntry = path.resolve(rootDir, 'node_modules/vite/bin/vite.js');

  let viteProcess: ChildProcess;

  if (fs.existsSync(viteEntry)) {
    // Invoke node directly with vite.js entrypoint (avoids Windows .cmd EINVAL error completely)
    viteProcess = spawn(process.execPath, [viteEntry, '--port=3000', '--host=0.0.0.0'], {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } else {
    // Fallback: spawn npx via shell
    const viteCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    viteProcess = spawn(viteCmd, ['vite', '--port=3000', '--host=0.0.0.0'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    });
  }

  viteProcess.on('error', (err) => {
    console.error('[LaunchUp UI] Failed to spawn Vite server:', err);
  });

  processes.push(viteProcess);
}

function cleanup() {
  console.log('\n[LaunchUp Orchestrator] Shutting down child services...');
  for (const proc of processes) {
    try {
      if (proc.pid) {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { shell: true });
        } else {
          proc.kill('SIGTERM');
        }
      }
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  LAUNCH UP - FULL-STACK CONTROL PLANE MESH ORCHESTRATOR   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\nBooting 10 Microservices (Ports 8004 - 8013)...');

  for (const svc of SERVICES) {
    await startService(svc);
  }

  startVite();
}

main().catch((err) => {
  console.error('[LaunchUp Orchestrator] Startup failure:', err);
  cleanup();
});
