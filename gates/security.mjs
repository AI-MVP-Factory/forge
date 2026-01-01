#!/usr/bin/env node
/**
 * Security Gate - Forge
 *
 * Prevents shipping MVPs with security vulnerabilities.
 * Simplified from AI Factory's 15-check gate to essential checks only.
 *
 * Checks:
 *   1. RLS policies exist in migrations
 *   2. No hardcoded secrets in code
 *   3. Service role key not exposed to client
 *   4. No dangerous patterns (eval, innerHTML)
 *
 * Usage:
 *   node gates/security.mjs [projectPath]
 *   node gates/security.mjs .
 *   node gates/security.mjs /path/to/mvp
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ═══════════════════════════════════════════════════════════════
// SECRET PATTERNS TO DETECT
// ═══════════════════════════════════════════════════════════════

const SECRET_PATTERNS = [
  { name: 'Supabase Service Key', pattern: /SUPABASE_SERVICE_ROLE_KEY.*=.*['"][a-zA-Z0-9._-]{20,}['"]/gi },
  { name: 'Stripe Secret Key', pattern: /sk_live_[a-zA-Z0-9]{24,}/g },
  { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{32,}/g },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/gi },
  { name: 'Hardcoded Password', pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/gi },
  { name: 'Bearer Token', pattern: /Bearer\s+[a-zA-Z0-9._-]{40,}/g },
];

const INSECURE_PATTERNS = [
  { name: 'eval() usage', pattern: /\beval\s*\(/g, severity: 'warning' },
  { name: 'innerHTML assignment', pattern: /\.innerHTML\s*=/g, severity: 'warning' },
  { name: 'dangerouslySetInnerHTML', pattern: /dangerouslySetInnerHTML/g, severity: 'warning' },
  { name: 'SQL injection risk', pattern: /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/gi, severity: 'blocker' },
  { name: 'Service key in NEXT_PUBLIC', pattern: /NEXT_PUBLIC.*SERVICE_ROLE|SERVICE_ROLE.*NEXT_PUBLIC/gi, severity: 'blocker' },
];

// ═══════════════════════════════════════════════════════════════
// FILE SCANNING
// ═══════════════════════════════════════════════════════════════

function scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx', '.sql']) {
  const files = [];
  if (!existsSync(dirPath)) return files;

  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    if (['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)) continue;

    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...scanDirectory(fullPath, extensions));
    } else if (stat.isFile() && extensions.includes(extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

// ═══════════════════════════════════════════════════════════════
// CHECK IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

function checkRLSPolicies(projectPath) {
  const migrationsPath = join(projectPath, 'supabase', 'migrations');
  if (!existsSync(migrationsPath)) {
    return { status: 'skip', message: 'No supabase/migrations directory found' };
  }

  const sqlFiles = scanDirectory(migrationsPath, ['.sql']);
  if (sqlFiles.length === 0) {
    return { status: 'skip', message: 'No migration files found' };
  }

  let rlsPoliciesFound = 0;
  let tablesWithRLS = [];

  for (const file of sqlFiles) {
    const content = readFileSync(file, 'utf-8');

    // Check for ENABLE ROW LEVEL SECURITY
    const enableMatches = content.match(/ALTER TABLE.*ENABLE ROW LEVEL SECURITY/gi) || [];
    rlsPoliciesFound += enableMatches.length;

    // Check for CREATE POLICY
    const policyMatches = content.match(/CREATE POLICY/gi) || [];
    rlsPoliciesFound += policyMatches.length;

    // Extract table names with RLS
    const tableMatches = content.match(/ALTER TABLE\s+(?:public\.)?(\w+)\s+ENABLE/gi);
    if (tableMatches) {
      for (const match of tableMatches) {
        const tableName = match.match(/ALTER TABLE\s+(?:public\.)?(\w+)/i)?.[1];
        if (tableName) tablesWithRLS.push(tableName);
      }
    }
  }

  if (rlsPoliciesFound === 0) {
    return {
      status: 'warning',
      message: 'No RLS policies found in migrations. Add RLS before production.',
      details: { migrationFiles: sqlFiles.length }
    };
  }

  return {
    status: 'pass',
    message: `Found ${rlsPoliciesFound} RLS statements on tables: ${tablesWithRLS.join(', ') || 'check migrations'}`,
    details: { policies: rlsPoliciesFound, tables: tablesWithRLS }
  };
}

function checkHardcodedSecrets(projectPath) {
  const violations = [];
  const scanDirs = ['src', 'app', 'pages', 'lib', 'components', 'utils'];

  for (const dir of scanDirs) {
    const fullDir = join(projectPath, dir);
    const files = scanDirectory(fullDir);

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const relativePath = file.replace(projectPath, '');

        for (const { name, pattern } of SECRET_PATTERNS) {
          const matches = content.match(pattern);
          if (matches) {
            violations.push({
              file: relativePath,
              pattern: name,
              count: matches.length
            });
          }
        }
      } catch (err) {
        // Skip unreadable files
      }
    }
  }

  if (violations.length > 0) {
    return {
      status: 'blocker',
      message: `Found ${violations.length} potential hardcoded secrets`,
      details: { violations }
    };
  }

  return {
    status: 'pass',
    message: 'No hardcoded secrets detected',
    details: {}
  };
}

function checkServiceKeyExposure(projectPath) {
  const clientFiles = [];
  const scanDirs = ['src', 'app', 'pages', 'components'];

  for (const dir of scanDirs) {
    clientFiles.push(...scanDirectory(join(projectPath, dir)));
  }

  const violations = [];

  for (const file of clientFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(projectPath, '');

      // Check for service role key usage in client code
      if (/NEXT_PUBLIC.*SERVICE_ROLE/gi.test(content) ||
          /SERVICE_ROLE.*NEXT_PUBLIC/gi.test(content) ||
          /process\.env\.SUPABASE_SERVICE_ROLE_KEY/gi.test(content)) {
        violations.push({
          file: relativePath,
          issue: 'Service role key referenced in client-accessible code'
        });
      }
    } catch (err) {
      // Skip
    }
  }

  if (violations.length > 0) {
    return {
      status: 'blocker',
      message: 'Service role key exposed to client!',
      details: { violations }
    };
  }

  return {
    status: 'pass',
    message: 'Service role key not exposed to client',
    details: {}
  };
}

function checkInsecurePatterns(projectPath) {
  const files = scanDirectory(projectPath);
  const violations = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(projectPath, '');

      for (const { name, pattern, severity } of INSECURE_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push({
            file: relativePath,
            pattern: name,
            severity,
            count: matches.length
          });
        }
      }
    } catch (err) {
      // Skip
    }
  }

  const blockers = violations.filter(v => v.severity === 'blocker');
  const warnings = violations.filter(v => v.severity === 'warning');

  if (blockers.length > 0) {
    return {
      status: 'blocker',
      message: `Found ${blockers.length} critical security issues`,
      details: { blockers, warnings }
    };
  }

  if (warnings.length > 0) {
    return {
      status: 'warning',
      message: `Found ${warnings.length} security warnings`,
      details: { warnings }
    };
  }

  return {
    status: 'pass',
    message: 'No insecure patterns detected',
    details: {}
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN GATE FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function runSecurityGate(projectPath = '.') {
  console.log('   Security Gate - Forge\n');
  console.log(`   Project: ${projectPath}\n`);

  const checks = [
    { id: 'SEC-001', name: 'RLS Policies', fn: () => checkRLSPolicies(projectPath) },
    { id: 'SEC-002', name: 'Hardcoded Secrets', fn: () => checkHardcodedSecrets(projectPath) },
    { id: 'SEC-003', name: 'Service Key Exposure', fn: () => checkServiceKeyExposure(projectPath) },
    { id: 'SEC-004', name: 'Insecure Patterns', fn: () => checkInsecurePatterns(projectPath) },
  ];

  const results = [];
  let blockerCount = 0;
  let warningCount = 0;
  let passCount = 0;

  console.log('   SECURITY CHECKS:');
  console.log('   ─────────────────────────────────────────────');

  for (const check of checks) {
    const result = check.fn();
    results.push({ ...check, result });

    let icon = '';
    switch (result.status) {
      case 'pass':
        icon = '';
        passCount++;
        break;
      case 'warning':
        icon = '';
        warningCount++;
        break;
      case 'blocker':
        icon = '';
        blockerCount++;
        break;
      case 'skip':
        icon = '';
        break;
    }

    console.log(`   ${icon} ${check.name.padEnd(20)} ${result.message}`);
  }

  console.log('   ─────────────────────────────────────────────');

  const passed = blockerCount === 0;
  const status = passed ? (warningCount > 0 ? ' PASS (with warnings)' : ' PASS') : ' FAIL';

  console.log(`   RESULT: ${status}`);
  console.log(`   ${passCount} passed, ${warningCount} warnings, ${blockerCount} blockers`);
  console.log();

  return {
    passed,
    blockers: blockerCount,
    warnings: warningCount,
    checks: results
  };
}

// ═══════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════

if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || '.';

  runSecurityGate(projectPath)
    .then(results => {
      if (results.passed) {
        console.log(' Security gate PASSED\n');
        process.exit(0);
      } else {
        console.log(' Security gate FAILED\n');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error(' Security gate error:', err.message);
      process.exit(1);
    });
}
