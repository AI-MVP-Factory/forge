#!/usr/bin/env node
/**
 * Emotional Gate - THE Differentiator
 *
 * Ported from AI Factory's emotional-value.mjs
 * Standalone version with no external dependencies.
 *
 * Validates that the MVP creates positive emotional experiences.
 * This is what separates Forge from Pipelineabuser's approach.
 *
 * Threshold: 96% (non-negotiable)
 *
 * Dimensions measured (with weights):
 *   - WARMTH (1.5x): Does it feel like a caring friend?
 *   - EMPATHY (1.5x): Does it show understanding of user feelings?
 *   - CELEBRATION (1.2x): Does it celebrate user wins?
 *   - VALIDATION (1.3x): Does it make users feel seen and valued?
 *   - ENCOURAGEMENT (1.2x): Does it build confidence?
 *
 * Usage:
 *   node gates/emotional.mjs [projectPath]
 *   node gates/emotional.mjs .
 *   node gates/emotional.mjs /path/to/mvp
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const THRESHOLD = 96; // Minimum score to pass (non-negotiable)

// Where to look for prompts
const PROMPT_LOCATIONS = [
  'prompts',
  'src/prompts',
  'app/prompts',
  'src/app/api',
  'src/app',        // Next.js app directory (page.tsx files)
  'app/api',
  'app',            // Next.js app directory root
  'src/lib/prompts',
  'src/lib',        // Often contains AI/prompt utilities
  'lib/prompts',
  'lib'
];

// File patterns that likely contain prompts
const PROMPT_FILE_PATTERNS = [
  /prompt/i,
  /system/i,
  /\.prompt\./,
  /route\.ts$/,
  /route\.js$/,
  /page\.tsx$/,    // Next.js pages often contain inline prompts
  /page\.ts$/,
  /page\.jsx$/,
  /page\.js$/
];

// ═══════════════════════════════════════════════════════════════
// EMOTIONAL PATTERNS - What makes prompts emotionally intelligent
// ═══════════════════════════════════════════════════════════════

const EMOTIONAL_PATTERNS = {
  warmth: {
    name: 'Warmth',
    description: 'Feels like a caring friend, not a cold assistant',
    weight: 1.5,
    positive: [
      { pattern: /warm/i, score: 10 },
      { pattern: /friend/i, score: 15 },
      { pattern: /care|caring/i, score: 12 },
      { pattern: /support(ive)?/i, score: 10 },
      { pattern: /believe in/i, score: 15 },
      { pattern: /genuinely?/i, score: 10 },
      { pattern: /here for you/i, score: 15 },
      { pattern: /got your back/i, score: 15 },
      { pattern: /cheering/i, score: 12 },
      { pattern: /rooting for/i, score: 12 },
      { pattern: /bestie/i, score: 10 },
      { pattern: /love(ly)?/i, score: 8 },
    ],
    negative: [
      { pattern: /professional/i, score: -5 },
      { pattern: /formal(ly)?/i, score: -5 },
      { pattern: /objective(ly)?/i, score: -3 },
      { pattern: /neutral/i, score: -5 },
    ]
  },

  empathy: {
    name: 'Empathy',
    description: 'Shows understanding of user feelings and situation',
    weight: 1.5,
    positive: [
      { pattern: /understand/i, score: 10 },
      { pattern: /feel(ing)?s?/i, score: 8 },
      { pattern: /see you|sees you/i, score: 15 },
      { pattern: /get(s)? it/i, score: 12 },
      { pattern: /know how/i, score: 10 },
      { pattern: /been there/i, score: 12 },
      { pattern: /validate/i, score: 10 },
      { pattern: /acknowledge/i, score: 8 },
      { pattern: /recognize/i, score: 8 },
      { pattern: /hear you/i, score: 12 },
      { pattern: /matter(s)?/i, score: 10 },
      { pattern: /real/i, score: 5 },
    ],
    negative: [
      { pattern: /just\s+(do|try|be)/i, score: -8 },
      { pattern: /simply/i, score: -5 },
      { pattern: /easy/i, score: -3 },
      { pattern: /obvious(ly)?/i, score: -8 },
    ]
  },

  celebration: {
    name: 'Celebration',
    description: 'Celebrates user wins, efforts, and achievements',
    weight: 1.2,
    positive: [
      { pattern: /proud/i, score: 15 },
      { pattern: /amazing/i, score: 10 },
      { pattern: /accomplish/i, score: 12 },
      { pattern: /celebrat/i, score: 15 },
      { pattern: /win|won/i, score: 10 },
      { pattern: /achiev/i, score: 12 },
      { pattern: /incredible/i, score: 10 },
      { pattern: /fantastic/i, score: 10 },
      { pattern: /wonderful/i, score: 10 },
      { pattern: /brilliant/i, score: 10 },
      { pattern: /crushed it/i, score: 15 },
      { pattern: /nailed it/i, score: 15 },
      { pattern: /slay/i, score: 10 },
      { pattern: /killed it/i, score: 12 },
      { pattern: /magic/i, score: 8 },
    ],
    negative: [
      { pattern: /adequate/i, score: -5 },
      { pattern: /sufficient/i, score: -5 },
      { pattern: /acceptable/i, score: -5 },
      { pattern: /fine/i, score: -3 },
    ]
  },

  validation: {
    name: 'Validation',
    description: 'Makes users feel seen, valued, and enough',
    weight: 1.3,
    positive: [
      { pattern: /valid/i, score: 10 },
      { pattern: /matter(s)?/i, score: 12 },
      { pattern: /important/i, score: 8 },
      { pattern: /enough/i, score: 10 },
      { pattern: /worthy/i, score: 12 },
      { pattern: /deserv/i, score: 12 },
      { pattern: /special/i, score: 10 },
      { pattern: /unique/i, score: 8 },
      { pattern: /valued/i, score: 12 },
      { pattern: /seen/i, score: 15 },
      { pattern: /noticed/i, score: 10 },
      { pattern: /appreciate/i, score: 10 },
      { pattern: /honor/i, score: 10 },
      { pattern: /respect/i, score: 8 },
    ],
    negative: [
      { pattern: /should have/i, score: -10 },
      { pattern: /need to/i, score: -5 },
      { pattern: /must\s/i, score: -5 },
      { pattern: /wrong/i, score: -8 },
    ]
  },

  encouragement: {
    name: 'Encouragement',
    description: 'Builds confidence and belief in user capability',
    weight: 1.2,
    positive: [
      { pattern: /can do/i, score: 12 },
      { pattern: /able/i, score: 8 },
      { pattern: /capable/i, score: 12 },
      { pattern: /got this/i, score: 15 },
      { pattern: /believe/i, score: 12 },
      { pattern: /confident/i, score: 10 },
      { pattern: /strong/i, score: 8 },
      { pattern: /powerful/i, score: 10 },
      { pattern: /resourceful/i, score: 12 },
      { pattern: /creative/i, score: 10 },
      { pattern: /talented/i, score: 10 },
      { pattern: /brave/i, score: 10 },
      { pattern: /courag/i, score: 10 },
      { pattern: /resilient/i, score: 12 },
    ],
    negative: [
      { pattern: /can't/i, score: -8 },
      { pattern: /won't work/i, score: -10 },
      { pattern: /impossible/i, score: -10 },
      { pattern: /difficult/i, score: -3 },
    ]
  }
};

// Mission alignment patterns (bonus points)
const MISSION_PATTERNS = {
  positive: [
    { pattern: /mission/i, score: 10 },
    { pattern: /make.*feel/i, score: 15 },
    { pattern: /emotional/i, score: 10 },
    { pattern: /joyful|joy/i, score: 12 },
    { pattern: /happy|happiness/i, score: 10 },
    { pattern: /comfort/i, score: 10 },
    { pattern: /safe/i, score: 8 },
    { pattern: /belong/i, score: 12 },
    { pattern: /connect/i, score: 8 },
    { pattern: /human/i, score: 8 },
    { pattern: /authentic/i, score: 10 },
    { pattern: /genuine/i, score: 12 },
  ]
};

// ═══════════════════════════════════════════════════════════════
// PROMPT DISCOVERY
// ═══════════════════════════════════════════════════════════════

function findPromptFiles(projectPath) {
  const promptFiles = [];

  // Check each potential prompt location
  for (const location of PROMPT_LOCATIONS) {
    const fullPath = join(projectPath, location);
    if (existsSync(fullPath)) {
      scanDirectory(fullPath, promptFiles);
    }
  }

  // Also check root for prompt files
  scanDirectory(projectPath, promptFiles, false); // non-recursive for root

  return promptFiles;
}

function scanDirectory(dirPath, files, recursive = true) {
  if (!existsSync(dirPath)) return;

  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && recursive) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)) {
          scanDirectory(fullPath, files, recursive);
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (['.ts', '.tsx', '.js', '.jsx', '.md'].includes(ext)) {
          // Check if filename matches prompt patterns
          if (PROMPT_FILE_PATTERNS.some(p => p.test(entry))) {
            files.push(fullPath);
          }
        }
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
}

function extractPrompts(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const prompts = [];

  // Pattern 1: system: `...`
  const systemTemplateRegex = /system:\s*`([\s\S]*?)`/g;
  let match;
  while ((match = systemTemplateRegex.exec(content)) !== null) {
    prompts.push({ type: 'system', content: match[1], file: filePath });
  }

  // Pattern 2: system: "..."
  const systemQuoteRegex = /system:\s*"([^"]+)"/g;
  while ((match = systemQuoteRegex.exec(content)) !== null) {
    prompts.push({ type: 'system', content: match[1], file: filePath });
  }

  // Pattern 3: ANYTHING_PROMPT = `...` (handles SYSTEM_PROMPT, RECIPE_SYSTEM_PROMPT, etc.)
  const constPromptRegex = /(?:const|let)\s+\w*(?:[Pp]rompt|PROMPT)\w*\s*=\s*`([\s\S]*?)`/g;
  while ((match = constPromptRegex.exec(content)) !== null) {
    prompts.push({ type: 'constant', content: match[1], file: filePath });
  }

  // Pattern 4: ANYTHING_PROMPT = "..." (double quoted)
  const constPromptQuoteRegex = /(?:const|let)\s+\w*(?:[Pp]rompt|PROMPT)\w*\s*=\s*"([^"]+)"/g;
  while ((match = constPromptQuoteRegex.exec(content)) !== null) {
    prompts.push({ type: 'constant', content: match[1], file: filePath });
  }

  // Pattern 5: Markdown files (entire content is the prompt)
  if (filePath.endsWith('.md') && content.length > 50) {
    prompts.push({ type: 'markdown', content: content, file: filePath });
  }

  return prompts;
}

// ═══════════════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════════════

function scorePrompt(promptContent) {
  const scores = {};
  const details = {};

  for (const [dimension, config] of Object.entries(EMOTIONAL_PATTERNS)) {
    let dimensionScore = 0;
    const matches = { positive: [], negative: [] };

    // Check positive patterns
    for (const pattern of config.positive) {
      const regex = new RegExp(pattern.pattern, 'gi');
      const found = promptContent.match(regex);
      if (found) {
        dimensionScore += pattern.score * found.length;
        matches.positive.push({
          pattern: pattern.pattern.toString(),
          count: found.length,
          score: pattern.score * found.length
        });
      }
    }

    // Check negative patterns
    for (const pattern of config.negative) {
      const regex = new RegExp(pattern.pattern, 'gi');
      const found = promptContent.match(regex);
      if (found) {
        dimensionScore += pattern.score * found.length;
        matches.negative.push({
          pattern: pattern.pattern.toString(),
          count: found.length,
          score: pattern.score * found.length
        });
      }
    }

    // Normalize to 0-100 scale
    const normalizedScore = Math.max(0, Math.min(100, Math.round(dimensionScore * 2)));
    scores[dimension] = normalizedScore;
    details[dimension] = { name: config.name, score: normalizedScore, weight: config.weight, matches };
  }

  // Calculate mission alignment
  let missionScore = 0;
  for (const pattern of MISSION_PATTERNS.positive) {
    const regex = new RegExp(pattern.pattern, 'gi');
    const found = promptContent.match(regex);
    if (found) {
      missionScore += pattern.score * found.length;
    }
  }
  scores.mission = Math.max(0, Math.min(100, Math.round(missionScore * 2)));

  // Calculate weighted overall score
  let weightedSum = 0;
  let totalWeight = 0;
  for (const [dimension, config] of Object.entries(EMOTIONAL_PATTERNS)) {
    weightedSum += scores[dimension] * config.weight;
    totalWeight += config.weight;
  }
  weightedSum += scores.mission;
  totalWeight += 1.0;

  const overallScore = Math.round(weightedSum / totalWeight);

  return {
    overall: overallScore,
    dimensions: scores,
    details,
    promptLength: promptContent.length
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN GATE FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function runEmotionalGate(projectPath = '.') {
  console.log('💖 Emotional Gate - Forge\n');
  console.log(`   Threshold: ${THRESHOLD}%`);
  console.log(`   Project: ${projectPath}\n`);

  // Find prompt files
  const promptFiles = findPromptFiles(projectPath);

  if (promptFiles.length === 0) {
    console.log('⚠️  No prompt files found in expected locations.');
    console.log('   Checked: ' + PROMPT_LOCATIONS.join(', '));
    console.log('\n   Add prompts to pass emotional validation.\n');
    return {
      passed: false,
      score: 0,
      reason: 'No prompts found',
      promptFiles: [],
      dimensions: {}
    };
  }

  console.log(`📂 Found ${promptFiles.length} potential prompt file(s)\n`);

  // Extract and score all prompts
  const allPrompts = [];
  for (const file of promptFiles) {
    const prompts = extractPrompts(file);
    allPrompts.push(...prompts);
  }

  if (allPrompts.length === 0) {
    console.log('⚠️  No prompts extracted from files.');
    console.log('   Files may not contain recognizable prompt patterns.\n');
    return {
      passed: false,
      score: 0,
      reason: 'No prompts extracted',
      promptFiles,
      dimensions: {}
    };
  }

  console.log(`📝 Extracted ${allPrompts.length} prompt(s)\n`);

  // Score each prompt
  const promptScores = allPrompts.map(p => ({
    ...p,
    score: scorePrompt(p.content)
  }));

  // Calculate average scores
  const avgScore = Math.round(
    promptScores.reduce((sum, p) => sum + p.score.overall, 0) / promptScores.length
  );

  const avgDimensions = {};
  for (const dimension of Object.keys(EMOTIONAL_PATTERNS)) {
    avgDimensions[dimension] = Math.round(
      promptScores.reduce((sum, p) => sum + p.score.dimensions[dimension], 0) / promptScores.length
    );
  }
  avgDimensions.mission = Math.round(
    promptScores.reduce((sum, p) => sum + p.score.dimensions.mission, 0) / promptScores.length
  );

  // Display results
  console.log('   DIMENSION SCORES:');
  console.log('   ─────────────────────────────────────────────');

  for (const [dim, config] of Object.entries(EMOTIONAL_PATTERNS)) {
    const score = avgDimensions[dim];
    const bar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
    const status = score >= 70 ? '✅' : score >= 50 ? '⚠️' : '❌';
    console.log(`   ${config.name.padEnd(14)} ${bar} ${String(score).padStart(3)}% ${status}`);
  }

  console.log('   ─────────────────────────────────────────────');

  const overallBar = '█'.repeat(Math.floor(avgScore / 10)) + '░'.repeat(10 - Math.floor(avgScore / 10));
  const passed = avgScore >= THRESHOLD;
  const overallStatus = passed ? '✅ PASS' : '❌ FAIL';

  console.log(`   ${'OVERALL'.padEnd(14)} ${overallBar} ${String(avgScore).padStart(3)}% ${overallStatus}`);
  console.log();

  if (!passed) {
    console.log(`   ❌ Score ${avgScore}% is below threshold ${THRESHOLD}%`);
    console.log('   💡 Add more emotionally resonant language to prompts:');

    // Find weakest dimension
    const weakest = Object.entries(avgDimensions)
      .filter(([k]) => k !== 'mission')
      .sort((a, b) => a[1] - b[1])[0];

    if (weakest) {
      const suggestions = {
        warmth: '"friend", "care about you", "believe in you", "here for you"',
        empathy: '"understand how you feel", "see you", "hear you", "your feelings matter"',
        celebration: '"proud of you", "amazing", "you accomplished", "celebrate your win"',
        validation: '"you matter", "you are enough", "you deserve", "you are seen"',
        encouragement: '"you can do this", "you are capable", "you got this", "I believe in you"'
      };
      console.log(`   → Weakest: ${weakest[0]} (${weakest[1]}%)`);
      console.log(`   → Add: ${suggestions[weakest[0]] || 'more emotional language'}`);
    }
    console.log();
  }

  return {
    passed,
    score: avgScore,
    threshold: THRESHOLD,
    promptCount: allPrompts.length,
    promptFiles: promptFiles.length,
    dimensions: avgDimensions,
    promptScores: promptScores.map(p => ({
      file: p.file,
      type: p.type,
      score: p.score.overall,
      dimensions: p.score.dimensions
    }))
  };
}

// ═══════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════

if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || '.';

  runEmotionalGate(projectPath)
    .then(results => {
      if (results.passed) {
        console.log('✅ Emotional gate PASSED\n');
        process.exit(0);
      } else {
        console.log('❌ Emotional gate FAILED\n');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('❌ Emotional gate error:', err.message);
      process.exit(1);
    });
}

export { THRESHOLD, EMOTIONAL_PATTERNS };
