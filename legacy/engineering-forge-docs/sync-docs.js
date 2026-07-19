#!/usr/bin/env node
/**
 * Engineering Forge Documentation Synchronization Script
 * HIGH-QUALITY ENTERPRISE SOLUTION
 * 
 * This script maintains a single source of truth for documentation
 * while ensuring proper build and deployment synchronization.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.resolve(__dirname, '../docs'),
  targetDirs: [
    path.resolve(__dirname, './public/docs'),
    path.resolve(__dirname, './dist/docs')
  ],
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /\.DS_Store/,
    /deploy-package-/
  ]
};

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`)
};

function calculateFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log.info(`Created directory: ${dirPath}`);
  }
}

function shouldExcludeFile(filePath) {
  return CONFIG.excludePatterns.some(pattern => pattern.test(filePath));
}

async function syncFile(sourcePath, targetPath) {
  try {
    const sourceHash = calculateFileHash(sourcePath);
    const targetHash = calculateFileHash(targetPath);
    
    if (sourceHash !== targetHash) {
      ensureDirectoryExists(path.dirname(targetPath));
      fs.copyFileSync(sourcePath, targetPath);
      return true; // File was updated
    }
    return false; // File was already in sync
  } catch (error) {
    log.error(`Failed to sync ${sourcePath} to ${targetPath}: ${error.message}`);
    return false;
  }
}

function getRelativePath(fullPath, basePath) {
  return path.relative(basePath, fullPath);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    
    if (shouldExcludeFile(fullPath)) {
      return;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });
  
  return fileList;
}

async function syncDocumentation() {
  log.info('Starting documentation synchronization...');
  
  if (!fs.existsSync(CONFIG.sourceDir)) {
    log.error(`Source directory does not exist: ${CONFIG.sourceDir}`);
    process.exit(1);
  }
  
  const sourceFiles = getAllFiles(CONFIG.sourceDir);
  let totalSynced = 0;
  let totalFiles = 0;
  
  for (const targetDir of CONFIG.targetDirs) {
    log.info(`Syncing to: ${targetDir}`);
    
    for (const sourceFile of sourceFiles) {
      const relativePath = getRelativePath(sourceFile, CONFIG.sourceDir);
      const targetFile = path.join(targetDir, relativePath);
      
      const wasUpdated = await syncFile(sourceFile, targetFile);
      if (wasUpdated) {
        totalSynced++;
        log.info(`  Updated: ${relativePath}`);
      }
      totalFiles++;
    }
  }
  
  log.success(`Synchronization complete!`);
  log.info(`Total files processed: ${totalFiles}`);
  log.info(`Files updated: ${totalSynced}`);
  
  // Clean up old files that no longer exist in source
  await cleanupOrphanedFiles();
}

async function cleanupOrphanedFiles() {
  log.info('Cleaning up orphaned files...');
  
  const sourceFiles = getAllFiles(CONFIG.sourceDir);
  const sourceRelativePaths = new Set(
    sourceFiles.map(f => getRelativePath(f, CONFIG.sourceDir))
  );
  
  for (const targetDir of CONFIG.targetDirs) {
    if (!fs.existsSync(targetDir)) continue;
    
    const targetFiles = getAllFiles(targetDir);
    
    for (const targetFile of targetFiles) {
      const relativePath = getRelativePath(targetFile, targetDir);
      
      if (!sourceRelativePaths.has(relativePath)) {
        try {
          fs.unlinkSync(targetFile);
          log.warning(`Removed orphaned file: ${relativePath}`);
        } catch (error) {
          log.error(`Failed to remove orphaned file ${relativePath}: ${error.message}`);
        }
      }
    }
  }
}

async function validateDocumentStructure() {
  log.info('Validating document structure...');
  
  const requiredFiles = [
    'GDD-v1.1.md',
    'TDD-v1.1.md',
    'TDD-Index.md',
    'Project-Plan-v1.1.md',
    'Progress-Summary.md'
  ];
  
  const requiredDirs = [
    'specifications',
    'assets',
    'archive'
  ];
  
  let isValid = true;
  
  // Check required files
  for (const file of requiredFiles) {
    const filePath = path.join(CONFIG.sourceDir, file);
    if (!fs.existsSync(filePath)) {
      log.error(`Required file missing: ${file}`);
      isValid = false;
    } else {
      log.success(`Found: ${file}`);
    }
  }
  
  // Check required directories
  for (const dir of requiredDirs) {
    const dirPath = path.join(CONFIG.sourceDir, dir);
    if (!fs.existsSync(dirPath)) {
      log.error(`Required directory missing: ${dir}`);
      isValid = false;
    } else {
      log.success(`Found: ${dir}/`);
    }
  }
  
  return isValid;
}

// Main execution
async function main() {
  try {
    log.info('🚀 Engineering Forge Documentation Sync - HIGH-QUALITY ENTERPRISE SOLUTION');
    log.info('==================================================================================');
    
    // Validate structure
    const isValid = await validateDocumentStructure();
    if (!isValid) {
      log.error('Document structure validation failed. Please fix the issues above.');
      process.exit(1);
    }
    
    // Sync documentation
    await syncDocumentation();
    
    log.info('==================================================================================');
    log.success('🎉 Documentation synchronization completed successfully!');
    
  } catch (error) {
    log.error(`Synchronization failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  syncDocumentation,
  validateDocumentStructure,
  CONFIG
};
