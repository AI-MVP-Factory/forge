#!/usr/bin/env node
/**
 * Independence Gate - Forge
 *
 * Ensures MVP is truly standalone with no cross-app contamination.
 * Simplified from AI Factory's 7-check gate to essential checks only.
 *
 * Checks:
 *   1. PRODUCT_ID is defined and unique
 *   2. No AI Factory references in user-visible content
 *   3. No cross-MVP imports or dependencies
 *   4. Proper domain/branding separation
 *
 * Usage:
 *   node gates/independence.mjs [projectPath]
 *   node gates/independence.mjs .
 *   node gates/independence.mjs /path/to/mvp
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ═══════════════════════════════════════════════════════════════
// FORBIDDEN PATTERNS - Things that reveal shared infrastructure
// ═══════════════════════════════════════════════════════════════

const FORBIDDEN_USER_CONTENT = [
  { name: 'AI Factory mention', pattern: /ai[-_\s]?factory/gi },
  { name: 'Portfolio mention', pattern: /portfolio/gi },
  { name: 'Parent company reveal', pattern: /part of\s+.*(family|group|portfolio)/gi },
  { name: 'Sister app mention', pattern: /sister\s+(app|product)/gi },
  { name: 'Our other apps', pattern: /our\s+other\s+(app|product)s?/gi },
];

const CROSS_MVP_PATTERNS = [
  { name: 'Recipe Genie reference', pattern: /recipe[-_]?genie/gi },
  { name: 'Daily Affirmation reference', pattern: /daily[-_]?affirmation/gi },
  { name: 'Focus Timer reference', pattern: /focus[-_]?timer/gi },
  { name: 'Vibe Check reference', pattern: /vibe[-_]?check/gi },
];

const INTERNAL_LEAKAGE = [
  { name: 'Portfolio collector', pattern: /portfolio[-_]?collector/gi },
  { name: 'Factory conductor', pattern: /factory[-_]?conductor/gi },
  { name: 'AI Factory internal path', pattern: /dev\/AI[-_]?factory/gi },
  { name: 'Factory scripts', pattern: /scripts\/factory/gi },
];

// ═══════════════════════════════════════════════════════════════
// FILE SCANNING
// ═══════════════════════════════════════════════════════════════

function scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']) {
  const files = [];
  if (!existsSync(dirPath)) return files;

  try {
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
  } catch (err) {
    // Ignore permission errors
  }
  return files;
}

// ═══════════════════════════════════════════════════════════════
// CHECK IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

function checkProductId(projectPath) {
  // Check for PRODUCT_ID in environment or config files
  const envFiles = ['.env', '.env.local', '.env.production'];
  let productId = null;
  let foundIn = null;

  for (const envFile of envFiles) {
    const envPath = join(projectPath, envFile);
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      const match = content.match(/PRODUCT_ID\s*=\s*['"]?([^'"\n]+)['"]?/);
      if (match) {
        productId = match[1].trim();
        foundIn = envFile;
        break;
      }
    }
  }

  // Also check package.json name
  const pkgPath = join(projectPath, 'package.json');
  let pkgName = null;
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      pkgName = pkg.name;
    } catch (err) {
      // Ignore parse errors
    }
  }

  if (!productId && !pkgName) {
    return {
      status: 'warning',
      message: 'No PRODUCT_ID found in .env files. Add PRODUCT_ID for tracking.',
      details: { checked: envFiles }
    };
  }

  const identifier = productId || pkgName;

  // Check for forbidden ID patterns
  if (/factory|portfolio|template|example/i.test(identifier)) {
    return {
      status: 'warning',
      message: `Product ID "${identifier}" looks like a template. Use unique MVP name.`,
      details: { productId, pkgName }
    };
  }

  return {
    status: 'pass',
    message: `Product ID: ${identifier}${foundIn ? ` (from ${foundIn})` : ''}`,
    details: { productId, pkgName, foundIn }
  };
}

function checkUserContent(projectPath) {
  const violations = [];

  // Scan user-facing content locations
  const contentDirs = ['src', 'app', 'components', 'pages'];
  const contentExtensions = ['.tsx', '.jsx', '.ts', '.js'];

  for (const dir of contentDirs) {
    const fullDir = join(projectPath, dir);
    const files = scanDirectory(fullDir, contentExtensions);

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const relativePath = file.replace(projectPath, '');

        // Only check strings that are likely user-visible (in JSX)
        // Look for text in {""}, or between > and <
        const jsxTextMatches = content.match(/>([^<]+)</g) || [];
        const stringLiteralMatches = content.match(/["'`][^"'`]{10,}["'`]/g) || [];
        const userText = [...jsxTextMatches, ...stringLiteralMatches].join(' ');

        for (const { name, pattern } of FORBIDDEN_USER_CONTENT) {
          if (pattern.test(userText)) {
            violations.push({
              file: relativePath,
              issue: name,
              context: 'User-visible content'
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
      status: 'warning',
      message: `Found ${violations.length} factory/portfolio mentions in user content`,
      details: { violations }
    };
  }

  return {
    status: 'pass',
    message: 'No factory/portfolio mentions in user content',
    details: {}
  };
}

function checkCrossMVPReferences(projectPath) {
  const violations = [];
  const files = scanDirectory(projectPath);

  // Get current project name to exclude self-references
  let currentMvp = '';
  const pkgPath = join(projectPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      currentMvp = pkg.name || '';
    } catch (err) {}
  }

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(projectPath, '');

      for (const { name, pattern } of CROSS_MVP_PATTERNS) {
        // Skip if this is a self-reference
        const mvpName = name.replace(' reference', '').toLowerCase().replace(/\s+/g, '-');
        if (currentMvp.toLowerCase().includes(mvpName.replace(/-/g, ''))) continue;

        if (pattern.test(content)) {
          violations.push({
            file: relativePath,
            issue: name,
            context: 'Cross-MVP contamination'
          });
        }
      }
    } catch (err) {
      // Skip
    }
  }

  if (violations.length > 0) {
    return {
      status: 'blocker',
      message: `Found ${violations.length} references to other MVPs!`,
      details: { violations }
    };
  }

  return {
    status: 'pass',
    message: 'No cross-MVP references detected',
    details: {}
  };
}

function checkInternalLeakage(projectPath) {
  const violations = [];
  const files = scanDirectory(projectPath);

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(projectPath, '');

      for (const { name, pattern } of INTERNAL_LEAKAGE) {
        if (pattern.test(content)) {
          violations.push({
            file: relativePath,
            issue: name,
            context: 'Internal infrastructure leakage'
          });
        }
      }
    } catch (err) {
      // Skip
    }
  }

  if (violations.length > 0) {
    return {
      status: 'warning',
      message: `Found ${violations.length} internal infrastructure references`,
      details: { violations }
    };
  }

  return {
    status: 'pass',
    message: 'No internal infrastructure leakage',
    details: {}
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN GATE FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function runIndependenceGate(projectPath = '.') {
  console.log('   Independence Gate - Forge\n');
  console.log(`   Project: ${projectPath}\n`);

  const checks = [
    { id: 'IND-001', name: 'Product ID', fn: () => checkProductId(projectPath) },
    { id: 'IND-002', name: 'User Content', fn: () => checkUserContent(projectPath) },
    { id: 'IND-003', name: 'Cross-MVP References', fn: () => checkCrossMVPReferences(projectPath) },
    { id: 'IND-004', name: 'Internal Leakage', fn: () => checkInternalLeakage(projectPath) },
  ];

  const results = [];
  let blockerCount = 0;
  let warningCount = 0;
  let passCount = 0;

  console.log('   INDEPENDENCE CHECKS:');
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

  runIndependenceGate(projectPath)
    .then(results => {
      if (results.passed) {
        console.log(' Independence gate PASSED\n');
        process.exit(0);
      } else {
        console.log(' Independence gate FAILED\n');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error(' Independence gate error:', err.message);
      process.exit(1);
    });
}
