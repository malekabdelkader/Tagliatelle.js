/**
 * Benchmark script for Tagliatelle.js
 *
 * Compares performance with raw Fastify to verify zero overhead.
 *
 * Usage:
 *   npx tsx scripts/benchmark.ts
 *
 * Requirements:
 *   npm install -D autocannon
 */

import { spawn, ChildProcess } from 'child_process';
import { createServer } from 'http';

const DURATION = 10; // seconds
const CONNECTIONS = 100;
const PIPELINING = 10;

interface BenchmarkResult {
  requests: number;
  latencyAvg: number;
  latencyP99: number;
  throughput: number;
}

async function runAutocannon(port: number): Promise<BenchmarkResult> {
  const autocannon = await import('autocannon');

  return new Promise((resolve, reject) => {
    const instance = autocannon.default({
      url: `http://localhost:${port}/hello`,
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION,
    });

    instance.on('done', (results: {
      requests: { total: number };
      latency: { average: number; p99: number };
      throughput: { average: number };
    }) => {
      resolve({
        requests: results.requests.total,
        latencyAvg: results.latency.average,
        latencyP99: results.latency.p99,
        throughput: results.throughput.average,
      });
    });

    instance.on('error', reject);
  });
}

async function startTagliatelleServer(): Promise<ChildProcess> {
  const child = spawn('npx', ['tsx', 'examples/minimal/server.tsx'], {
    stdio: 'pipe',
    cwd: process.cwd(),
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return child;
}

async function startFastifyServer(): Promise<{ close: () => void }> {
  const Fastify = (await import('fastify')).default;
  const app = Fastify();

  app.get('/hello', async () => {
    return { message: 'Hello from Fastify!' };
  });

  await app.listen({ port: 3001 });
  return { close: () => app.close() };
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

async function main() {
  console.log('Starting Tagliatelle.js Benchmark\n');
  console.log(`Duration: ${DURATION}s | Connections: ${CONNECTIONS} | Pipelining: ${PIPELINING}\n`);
  console.log('='.repeat(60));

  // Benchmark Tagliatelle
  console.log('\n[1/2] Starting Tagliatelle.js server...');
  const tagliatelleServer = await startTagliatelleServer();

  console.log('[1/2] Running benchmark against Tagliatelle.js...');
  const tagliatelleResult = await runAutocannon(3000);
  tagliatelleServer.kill();

  // Wait a bit between tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Benchmark raw Fastify
  console.log('\n[2/2] Starting raw Fastify server...');
  const fastifyServer = await startFastifyServer();

  console.log('[2/2] Running benchmark against raw Fastify...');
  const fastifyResult = await runAutocannon(3001);
  fastifyServer.close();

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('\nRESULTS:\n');

  console.log('                    Tagliatelle.js    Raw Fastify    Diff');
  console.log('-'.repeat(60));
  console.log(
    `Requests/sec        ${formatNumber(tagliatelleResult.requests / DURATION).padEnd(18)} ${formatNumber(fastifyResult.requests / DURATION).padEnd(14)} ${(((tagliatelleResult.requests - fastifyResult.requests) / fastifyResult.requests) * 100).toFixed(1)}%`
  );
  console.log(
    `Latency Avg (ms)    ${formatNumber(tagliatelleResult.latencyAvg).padEnd(18)} ${formatNumber(fastifyResult.latencyAvg).padEnd(14)}`
  );
  console.log(
    `Latency P99 (ms)    ${formatNumber(tagliatelleResult.latencyP99).padEnd(18)} ${formatNumber(fastifyResult.latencyP99).padEnd(14)}`
  );
  console.log(
    `Throughput (MB/s)   ${formatNumber(tagliatelleResult.throughput / 1024 / 1024).padEnd(18)} ${formatNumber(fastifyResult.throughput / 1024 / 1024).padEnd(14)}`
  );

  console.log('\n' + '='.repeat(60));

  const overhead =
    ((tagliatelleResult.requests / DURATION - fastifyResult.requests / DURATION) /
      (fastifyResult.requests / DURATION)) *
    100;

  if (Math.abs(overhead) < 5) {
    console.log('\nConclusion: Tagliatelle.js has negligible overhead vs raw Fastify');
  } else if (overhead > 0) {
    console.log(`\nConclusion: Tagliatelle.js is ${overhead.toFixed(1)}% faster (margin of error)`);
  } else {
    console.log(`\nConclusion: Tagliatelle.js has ${Math.abs(overhead).toFixed(1)}% overhead`);
  }
}

main().catch(console.error);
