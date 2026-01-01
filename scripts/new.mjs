#!/usr/bin/env node
/**
 * Forge New - Scaffold a new MVP from an idea file
 *
 * Usage:
 *   node scripts/new.mjs ideas/my-idea.md
 *   node scripts/new.mjs ideas/my-idea.md --output /path/to/output
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, copyFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORGE_ROOT = join(__dirname, '..');
const TEMPLATE_DIR = join(FORGE_ROOT, 'templates', 'next-app');

/**
 * Parse an idea markdown file into structured data
 */
export function parseIdea(content) {
  const lines = content.split('\n');
  const idea = {
    name: '',
    problem: '',
    solution: '',
    emotionalHook: '',
    targetUser: '',
  };

  let currentSection = null;
  let sectionContent = [];

  for (const line of lines) {
    // Check for section headers
    if (line.startsWith('# ')) {
      // Main title = MVP name
      idea.name = line.replace('# ', '').trim();
    } else if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection) {
        const content = sectionContent.join('\n').trim();
        switch (currentSection.toLowerCase()) {
          case 'problem':
            idea.problem = content;
            break;
          case 'solution':
            idea.solution = content;
            break;
          case 'emotional hook':
          case 'emotional-hook':
          case 'emotionalhook':
            idea.emotionalHook = content;
            break;
          case 'target user':
          case 'target-user':
          case 'targetuser':
            idea.targetUser = content;
            break;
        }
      }
      currentSection = line.replace('## ', '').trim();
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    const content = sectionContent.join('\n').trim();
    switch (currentSection.toLowerCase()) {
      case 'problem':
        idea.problem = content;
        break;
      case 'solution':
        idea.solution = content;
        break;
      case 'emotional hook':
      case 'emotional-hook':
      case 'emotionalhook':
        idea.emotionalHook = content;
        break;
      case 'target user':
      case 'target-user':
      case 'targetuser':
        idea.targetUser = content;
        break;
    }
  }

  return idea;
}

/**
 * Convert a name to a URL-safe slug
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Copy directory recursively with placeholder replacement
 */
function copyDirWithReplacements(src, dest, replacements) {
  mkdirSync(dest, { recursive: true });

  for (const item of readdirSync(src)) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);

    if (statSync(srcPath).isDirectory()) {
      copyDirWithReplacements(srcPath, destPath, replacements);
    } else {
      // Read file content
      let content = readFileSync(srcPath, 'utf-8');

      // Replace placeholders in text files
      const ext = extname(item).toLowerCase();
      const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.env', ''];

      if (textExtensions.includes(ext) || item.startsWith('.')) {
        for (const [placeholder, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
        writeFileSync(destPath, content);
      } else {
        // Binary file - just copy
        copyFileSync(srcPath, destPath);
      }
    }
  }
}

/**
 * Scaffold a new MVP from an idea file
 */
export async function scaffoldMvp(ideaPath, outputDir = null) {
  // Check idea file exists
  if (!existsSync(ideaPath)) {
    throw new Error(`Idea file not found: ${ideaPath}`);
  }

  // Check template exists
  if (!existsSync(TEMPLATE_DIR)) {
    throw new Error(`Template not found: ${TEMPLATE_DIR}`);
  }

  // Parse idea
  const ideaContent = readFileSync(ideaPath, 'utf-8');
  const idea = parseIdea(ideaContent);

  if (!idea.name) {
    throw new Error('Idea file must have a title (# MVP Name)');
  }

  // Generate product ID from name
  const productId = slugify(idea.name);

  // Determine output directory
  const targetDir = outputDir || join(process.cwd(), productId);

  if (existsSync(targetDir)) {
    throw new Error(`Directory already exists: ${targetDir}`);
  }

  // Define placeholder replacements
  const replacements = {
    '{{MVP_NAME}}': idea.name,
    '{{PRODUCT_ID}}': productId,
    '{{EMOTIONAL_HOOK}}': idea.emotionalHook || `Making ${idea.name} feel amazing.`,
    '{{PROBLEM}}': idea.problem || '',
    '{{SOLUTION}}': idea.solution || '',
    '{{TARGET_USER}}': idea.targetUser || '',
  };

  // Copy template with replacements
  console.log(`\n   Creating: ${targetDir}\n`);
  copyDirWithReplacements(TEMPLATE_DIR, targetDir, replacements);

  // Return scaffold info
  return {
    name: idea.name,
    productId,
    targetDir,
    idea,
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ideaPath = process.argv[2];
  const outputArg = process.argv.indexOf('--output');
  const outputDir = outputArg !== -1 ? process.argv[outputArg + 1] : null;

  if (!ideaPath) {
    console.log(`
Usage: node scripts/new.mjs <idea.md> [--output <dir>]

Example:
  node scripts/new.mjs ideas/my-app.md
  node scripts/new.mjs ideas/my-app.md --output /path/to/my-app
`);
    process.exit(1);
  }

  scaffoldMvp(ideaPath, outputDir)
    .then((result) => {
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
    })
    .catch((err) => {
      console.error(`   Error: ${err.message}`);
      process.exit(1);
    });
}
