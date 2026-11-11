/**
 * LAUNCH UP - STAGE 5 MESH HEALTH & PRODUCTION READINESS VERIFIER
 * Usage: npm run verify:mesh
 */

interface ProbeTarget {
  id: string;
  name: string;
  url: string;
  port: number;
}

const TARGETS: ProbeTarget[] = [
  { id: 'FRONTEND', name: 'Launch Up Control Plane (Vite)', url: `http://127.0.0.1:${process.env.FRONTEND_PORT || 3000}/`, port: Number(process.env.FRONTEND_PORT || 3000) },
  { id: 'MOD-10', name: 'Governance, M:N RBAC & FinOps', url: `http://127.0.0.1:${process.env.MOD10_PORT || 8004}/health`, port: Number(process.env.MOD10_PORT || 8004) },
  { id: 'MOD-01', name: 'Lead Discovery & Canva Pitch', url: `http://127.0.0.1:${process.env.MOD01_PORT || 8005}/health`, port: Number(process.env.MOD01_PORT || 8005) },
  { id: 'MOD-02', name: 'BA Intake & Legal Scope', url: `http://127.0.0.1:${process.env.MOD02_PORT || 8006}/health`, port: Number(process.env.MOD02_PORT || 8006) },
  { id: 'MOD-03', name: 'Responsive Web Builder', url: `http://127.0.0.1:${process.env.MOD03_PORT || 8007}/health`, port: Number(process.env.MOD03_PORT || 8007) },
  { id: 'MOD-04', name: 'Android Mobile App Builder', url: `http://127.0.0.1:${process.env.MOD04_PORT || 8008}/health`, port: Number(process.env.MOD04_PORT || 8008) },
  { id: 'MOD-05', name: 'Backend API & Postgres RLS', url: `http://127.0.0.1:${process.env.MOD05_PORT || 8009}/health`, port: Number(process.env.MOD05_PORT || 8009) },
  { id: 'MOD-06', name: 'Autonomous QA & SecOps', url: `http://127.0.0.1:${process.env.MOD06_PORT || 8010}/health`, port: Number(process.env.MOD06_PORT || 8010) },
  { id: 'MOD-07', name: 'Canva Pro Marketing Engine', url: `http://127.0.0.1:${process.env.MOD07_PORT || 8011}/health`, port: Number(process.env.MOD07_PORT || 8011) },
  { id: 'MOD-08', name: 'WhatsApp Marketing & CRM', url: `http://127.0.0.1:${process.env.MOD08_PORT || 8012}/health`, port: Number(process.env.MOD08_PORT || 8012) },
  { id: 'MOD-09', name: 'Autonomous SRE & Self-Healing', url: `http://127.0.0.1:${process.env.MOD09_PORT || 8013}/health`, port: Number(process.env.MOD09_PORT || 8013) },
];

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

async function probe(target: ProbeTarget) {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(target.url, { signal: controller.signal });
    clearTimeout(timer);
    const ms = (performance.now() - start).toFixed(1);
    return {
      ...target,
      ok: res.ok,
      statusCode: res.status,
      latencyMs: ms,
    };
  } catch {
    const ms = (performance.now() - start).toFixed(1);
    return {
      ...target,
      ok: false,
      statusCode: 0,
      latencyMs: ms,
    };
  }
}

async function main() {
  console.log(`\n${CYAN}LAUNCH UP — STAGE 5 MESH READINESS CHECK${RESET}`);
  console.log('─'.repeat(74));
  console.log(
    `${'MODULE'.padEnd(10)} ${'PORT'.padEnd(7)} ${'SERVICE'.padEnd(32)} ${'LATENCY'.padEnd(10)} STATUS`
  );
  console.log('─'.repeat(74));

  const results = await Promise.all(TARGETS.map(probe));

  for (const r of results) {
    const statusBadge = r.ok
      ? `${GREEN}✔ READY (${r.statusCode})${RESET}`
      : `${RED}✖ DOWN (${r.statusCode || 'ERR'})${RESET}`;
    console.log(
      `${r.id.padEnd(10)} ${String(r.port).padEnd(7)} ${r.name.padEnd(32)} ${(r.latencyMs + 'ms').padEnd(10)} ${statusBadge}`
    );
  }

  console.log('─'.repeat(74));
  const readyCount = results.filter((r) => r.ok).length;
  const totalCount = results.length;

  if (readyCount === totalCount) {
    console.log(`${GREEN}✔ ALL ${readyCount}/${totalCount} MESH NODES OPERATIONAL${RESET} ${DIM}(Ports 3000, 8004-8013)${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}✖ ${readyCount}/${totalCount} MESH NODES READY. Run \`npm run dev:all\` to start missing nodes.${RESET}\n`);
    process.exit(1);
  }
}

main();
