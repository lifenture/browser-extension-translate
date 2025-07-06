#!/usr/bin/env node

// Simple validation script for Chromium extension files
const fs = require('fs');
const path = require('path');

const CHROMIUM_EXT_DIR = './chromium-extension';

console.log('🧪 Testing Chromium Extension Files...\n');

// Test 1: Check if all required files exist
const requiredFiles = [
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js',
    'popup.css',
    'options.html',
    'options.js',
    'options.css',
    'languages.js',
    'support.js'
];

console.log('📁 File Existence Check:');
let allFilesExist = true;
for (const file of requiredFiles) {
    const filePath = path.join(CHROMIUM_EXT_DIR, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
}

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Run "npm run copy-chromium" first.');
    process.exit(1);
}

// Test 2: Check manifest.json structure
console.log('\n📋 Manifest Validation:');
try {
    const manifestPath = path.join(CHROMIUM_EXT_DIR, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check manifest version
    console.log(`  ${manifest.manifest_version === 3 ? '✅' : '❌'} Manifest Version 3`);
    
    // Check service worker (not type: module)
    const hasServiceWorker = manifest.background && manifest.background.service_worker === 'background.js';
    const noModuleType = !manifest.background.type;
    console.log(`  ${hasServiceWorker ? '✅' : '❌'} Service Worker: background.js`);
    console.log(`  ${noModuleType ? '✅' : '❌'} No "type: module" (Chrome compatible)`);
    
    // Check permissions
    const hasRequiredPerms = manifest.permissions && 
        manifest.permissions.includes('storage') && 
        manifest.permissions.includes('tabs') &&
        manifest.permissions.includes('activeTab');
    console.log(`  ${hasRequiredPerms ? '✅' : '❌'} Required permissions present`);
    
} catch (error) {
    console.log('  ❌ Failed to parse manifest.json:', error.message);
}

// Test 3: Check background.js structure
console.log('\n🔧 Background Script Validation:');
try {
    const backgroundPath = path.join(CHROMIUM_EXT_DIR, 'background.js');
    const backgroundContent = fs.readFileSync(backgroundPath, 'utf8');
    
    // Check for Chrome polyfill
    const hasPolyfill = backgroundContent.includes('globalThis.browser = chrome');
    console.log(`  ${hasPolyfill ? '✅' : '❌'} Browser polyfill present`);
    
    // Check for no import statements
    const hasImports = backgroundContent.includes('import ');
    console.log(`  ${!hasImports ? '✅' : '❌'} No import statements (inlined)`);
    
    // Check for languages data
    const hasLanguages = backgroundContent.includes('const LANGUAGES = [');
    console.log(`  ${hasLanguages ? '✅' : '❌'} Languages data inlined`);
    
    // Check for main class
    const hasMainClass = backgroundContent.includes('class TranslateBackground');
    console.log(`  ${hasMainClass ? '✅' : '❌'} Main background class present`);
    
    // Check for initialization
    const hasInit = backgroundContent.includes('new TranslateBackground()');
    console.log(`  ${hasInit ? '✅' : '❌'} Background script initialized`);
    
} catch (error) {
    console.log('  ❌ Failed to read background.js:', error.message);
}

// Test 4: Check HTML files for polyfill
console.log('\n🌐 HTML Files Validation:');
const htmlFiles = ['popup.html', 'options.html'];
for (const htmlFile of htmlFiles) {
    try {
        const htmlPath = path.join(CHROMIUM_EXT_DIR, htmlFile);
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Check for external Chromium polyfill reference
        const hasPolyfillRef = htmlContent.includes('chromium-polyfill.js');
        console.log(`  ${hasPolyfillRef ? '✅' : '❌'} ${htmlFile} references chromium-polyfill.js`);
        
    } catch (error) {
        console.log(`  ❌ Failed to read ${htmlFile}:`, error.message);
    }
}

// Test 4b: Check if chromium-polyfill.js exists
try {
    const polyfillPath = path.join(CHROMIUM_EXT_DIR, 'chromium-polyfill.js');
    const polyfillExists = fs.existsSync(polyfillPath);
    console.log(`  ${polyfillExists ? '✅' : '❌'} chromium-polyfill.js file exists`);
    
    if (polyfillExists) {
        const polyfillContent = fs.readFileSync(polyfillPath, 'utf8');
        const hasPolyfillCode = polyfillContent.includes('window.browser = chrome');
        console.log(`  ${hasPolyfillCode ? '✅' : '❌'} chromium-polyfill.js contains polyfill code`);
    }
} catch (error) {
    console.log('  ❌ Failed to check chromium-polyfill.js:', error.message);
}

// Test 5: File size check (should be reasonable)
console.log('\n📊 File Size Check:');
try {
    const backgroundPath = path.join(CHROMIUM_EXT_DIR, 'background.js');
    const backgroundSize = fs.statSync(backgroundPath).size;
    const sizeKB = Math.round(backgroundSize / 1024 * 100) / 100;
    
    const sizeOK = backgroundSize > 100 && backgroundSize < 50000; // Between 100 bytes and 50KB
    console.log(`  ${sizeOK ? '✅' : '❌'} background.js size: ${sizeKB}KB ${sizeOK ? '(reasonable)' : '(check for issues)'}`);
    
} catch (error) {
    console.log('  ❌ Failed to check file sizes:', error.message);
}

console.log('\n🚀 Extension is ready for Chromium browser loading!');
console.log('\nNext steps for Chrome:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable Developer mode');
console.log('3. Click "Load unpacked"');
console.log(`4. Select the folder: ${path.resolve(CHROMIUM_EXT_DIR)}`);
console.log('5. Check for service worker errors in the extension details');
console.log('\nFor Edge: Use edge://extensions/');
console.log('For Brave: Use brave://extensions/');
