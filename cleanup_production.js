#!/usr/bin/env node
/**
 * Frontend Production Cleanup Script
 * Removes debugging code and optimizes for production
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 Cleaning up frontend for production...');

// Files to clean up
const patterns = [
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.js',
  'src/**/*.jsx'
];

let cleanedFiles = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern);
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Remove console.log statements
      const consoleLogRegex = /^\s*console\.log\([^)]*\);\s*$/gm;
      if (consoleLogRegex.test(content)) {
        content = content.replace(consoleLogRegex, '');
        modified = true;
      }
      
      // Remove console.error statements (keep only critical ones)
      const consoleErrorRegex = /^\s*console\.error\([^)]*\);\s*$/gm;
      if (consoleErrorRegex.test(content)) {
        content = content.replace(consoleErrorRegex, '');
        modified = true;
      }
      
      // Remove console.warn statements
      const consoleWarnRegex = /^\s*console\.warn\([^)]*\);\s*$/gm;
      if (consoleWarnRegex.test(content)) {
        content = content.replace(consoleWarnRegex, '');
        modified = true;
      }
      
      // Remove debugger statements
      const debuggerRegex = /^\s*debugger;\s*$/gm;
      if (debuggerRegex.test(content)) {
        content = content.replace(debuggerRegex, '');
        modified = true;
      }
      
      // Remove empty lines (more than 2 consecutive)
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✅ Cleaned: ${file}`);
        cleanedFiles++;
      }
      
    } catch (error) {
      console.error(`❌ Error cleaning ${file}:`, error.message);
    }
  });
});

// Remove debug files
const debugFiles = [
  'src/utils/authDebug.ts',
  'src/components/admin/AITestComponent.tsx',
  'src/pages/FormBuilderDemo.tsx',
  'test.txt'
];

debugFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Removed debug file: ${file}`);
      cleanedFiles++;
    } catch (error) {
      console.error(`❌ Error removing ${file}:`, error.message);
    }
  }
});

console.log(`🎉 Frontend cleanup complete! Cleaned ${cleanedFiles} files`);
console.log('✅ Frontend is now production-ready');

