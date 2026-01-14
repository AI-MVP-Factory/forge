#!/usr/bin/env node
/**
 * Forge CLI - Ship MVPs in 4 hours
 *
 * Usage:
 *   forge new <idea.md>    - Scaffold new MVP from idea
 *   forge validate         - Run all gates (emotional, security, independence)
 *   forge ship             - Validate + deploy to Vercel
 *   forge status           - Check MVP health
 *
 * Example:
 *   node scripts/forge.mjs validate
 *   node scripts/forge.mjs validate /path/to/mvp
 *   node scripts/forge.mjs ship
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORGE_ROOT = join(__dirname, '..');

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  console.log('\n   Forge - Ship MVPs in 4 hours\n');

  switch (command) {
    case 'new':
      await handleNew(args[0]);
      break;
    case 'validate':
      await handleValidate(args[0] || '.');
      break;
    case 'ship':
      await handleShip(args[0] || '.');
      break;
    case 'status':
      await handleStatus(args[0] || '.');
      break;
    default:
      showHelp();
  }
}

async function handleNew(ideaPath) {
  if (!ideaPath) {
    console.error('   Usage: forge new <idea.md>');
    process.exit(1);
  }

  // Import scaffold function
  const { scaffoldMvp } = await import(join(FORGE_ROOT, 'scripts', 'new.mjs'));

  try {
    const result = await scaffoldMvp(ideaPath);

    console.log(`    MVP scaffolded successfully!

   Name:     ${result.name}
   ID:       ${result.productId}
   Location: ${result.targetDir}

   Next steps:
   1. cd ${result.targetDir}
   2. pnpm install
   3. Create Supabase project and copy credentials to .env.local
   4. pnpm dev
   5. Build features (target: 2-3 hours)
   6. forge ship

`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }
}

async function handleValidate(projectPath) {
  console.log(`   Validating: ${projectPath}\n`);
  console.log('═'.repeat(60));

  // Import gates dynamically
  const { runEmotionalGate } = await import(join(FORGE_ROOT, 'gates', 'emotional.mjs'));
  const { runSecurityGate } = await import(join(FORGE_ROOT, 'gates', 'security.mjs'));
  const { runIndependenceGate } = await import(join(FORGE_ROOT, 'gates', 'independence.mjs'));

  const results = {
    emotional: null,
    security: null,
    independence: null
  };

  // Run Emotional Gate (THE differentiator)
  console.log('\n   EMOTIONAL GATE\n');
  results.emotional = await runEmotionalGate(projectPath);

  // Run Security Gate
  console.log('\n   SECURITY GATE\n');
  results.security = await runSecurityGate(projectPath);

  // Run Independence Gate
  console.log('\n   INDEPENDENCE GATE\n');
  results.independence = await runIndependenceGate(projectPath);

  // Summary
  console.log('═'.repeat(60));
  console.log('\n   VALIDATION SUMMARY\n');
  console.log('   ─────────────────────────────────────────────');

  const emotionalIcon = results.emotional.passed ? '' : '';
  const securityIcon = results.security.passed ? '' : '';
  const independenceIcon = results.independence.passed ? '' : '';

  console.log(`   ${emotionalIcon} Emotional:    ${results.emotional.passed ? 'PASS' : 'FAIL'} (${results.emotional.score}%)`);
  console.log(`   ${securityIcon} Security:     ${results.security.passed ? 'PASS' : 'FAIL'} (${results.security.blockers} blockers)`);
  console.log(`   ${independenceIcon} Independence: ${results.independence.passed ? 'PASS' : 'FAIL'} (${results.independence.blockers} blockers)`);

  console.log('   ─────────────────────────────────────────────');

  const allPassed = results.emotional.passed && results.security.passed && results.independence.passed;

  if (allPassed) {
    console.log('\n    ALL GATES PASSED - Ready to ship!\n');
    return { passed: true, results };
  } else {
    console.log('\n    VALIDATION FAILED - Fix issues before shipping\n');

    if (!results.emotional.passed) {
      console.log('    Emotional: Add more warm, empathetic language to prompts');
    }
    if (!results.security.passed) {
      console.log('    Security: Fix security issues (RLS, secrets, patterns)');
    }
    if (!results.independence.passed) {
      console.log('    Independence: Remove cross-MVP references');
    }
    console.log();

    return { passed: false, results };
  }
}

async function handleShip(projectPath) {
  console.log(`   Preparing to ship: ${projectPath}\n`);

  // First validate
  const validation = await handleValidate(projectPath);

  if (!validation.passed) {
    console.log('   Cannot ship - validation failed');
    process.exit(1);
  }

  // Deploy with Vercel
  console.log('   Deploying to Vercel...\n');

  try {
    const result = execSync('vercel --prod --yes', {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'inherit']
    });

    console.log(`    Deployed: ${result.trim()}\n`);
  } catch (err) {
    console.error('   Deployment failed:', err.message);
    console.log('   Tip: Run "vercel login" first if not authenticated');
    process.exit(1);
  }
}

async function handleStatus(projectPath) {
  console.log(`   Checking status: ${projectPath}\n`);

  // Check if project exists
  if (!existsSync(projectPath)) {
    console.log(`   Project not found: ${projectPath}`);
    process.exit(1);
  }

  // Check package.json
  const pkgPath = join(projectPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(await import('fs').then(m => m.readFileSync(pkgPath, 'utf-8')));
      console.log(`   Project: ${pkg.name || 'unknown'}`);
      console.log(`   Version: ${pkg.version || 'unknown'}`);
    } catch (err) {
      console.log('   Could not read package.json');
    }
  }

  // Check for .env
  const envPath = join(projectPath, '.env.local');
  console.log(`   Env file: ${existsSync(envPath) ? 'Found' : 'Missing'}`);

  // Check for Supabase
  const supabasePath = join(projectPath, 'supabase');
  console.log(`   Supabase: ${existsSync(supabasePath) ? 'Configured' : 'Not configured'}`);

  // Check for prompts
  const promptsPath = join(projectPath, 'prompts');
  console.log(`   Prompts: ${existsSync(promptsPath) ? 'Found' : 'Not found'}`);

  console.log();
}

function showHelp() {
  console.log(`Usage: forge <command> [options]

Commands:
  new <idea.md>     Scaffold new MVP from idea file
  validate [path]   Run all quality gates
  ship [path]       Validate and deploy to Vercel
  status [path]     Check MVP health

Examples:
  forge new ideas/my-app.md
  forge validate
  forge validate /path/to/mvp
  forge ship

Quality Gates (run by validate):
   Emotional Gate    96%+ emotional score required
   Security Gate     No secrets, RLS policies required
   Independence Gate No cross-MVP contamination

Documentation:
  See /Users/P/dev/forge/README.md
  See /Users/P/dev/forge/TODO.md
`);
}

main().catch(err => {
  console.error('   Error:', err.message);
  process.exit(1);
});
