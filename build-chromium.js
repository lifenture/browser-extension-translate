#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = './TranslateExtension/Resources';
const TARGET_DIR = './chromium-extension';
const VENDOR_DIR = './chromium-extension/vendor';

// Files that need special patching
const PATCH_FILES = {
    'manifest.json': patchManifest,
    'background.js': patchBackground,
    'popup.html': patchPopupHtml,
    'options.html': patchOptionsHtml
};

console.log('🔨 Building Chromium Extension...');

/**
 * Main build function
 */
async function buildChromiumExtension() {
    try {
        // Step 1: Clean and recreate target directory
        console.log('📁 Cleaning target directory...');
        await cleanDirectory(TARGET_DIR);
        
        // Step 2: Copy all files from source to target
        console.log('📋 Copying files...');
        await copyDirectory(SOURCE_DIR, TARGET_DIR);
        
        // Step 3: Ensure vendor directory exists and copy browser polyfill
        console.log('📦 Setting up vendor dependencies...');
        await ensureVendorSetup();
        
        // Step 4: Apply patches to specific files
        console.log('🔧 Applying patches...');
        await applyPatches();
        
        // Step 5: Copy additional assets
        console.log('📸 Copying additional assets...');
        await copyAdditionalAssets();
        
        console.log('✅ Chromium extension build complete!');
        console.log(`📦 Extension ready at: ${path.resolve(TARGET_DIR)}`);
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

/**
 * Clean and recreate directory
 */
async function cleanDirectory(dir) {
    if (fs.existsSync(dir)) {
        await fs.promises.rm(dir, { recursive: true, force: true });
    }
    await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Copy directory recursively
 */
async function copyDirectory(src, dest) {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    
    await fs.promises.mkdir(dest, { recursive: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Ensure vendor directory is set up with browser polyfill
 */
async function ensureVendorSetup() {
    // Create vendor directory if it doesn't exist
    if (!fs.existsSync(VENDOR_DIR)) {
        await fs.promises.mkdir(VENDOR_DIR, { recursive: true });
    }
    
    // Check if browser polyfill exists, if not, create a Chrome-compatible one
    const polyfillPath = path.join(VENDOR_DIR, 'browser-polyfill.min.js');
    if (!fs.existsSync(polyfillPath)) {
        console.log('⚠️  Browser polyfill not found, creating Chrome-compatible version...');
        const chromePolyfill = `// Chrome-compatible browser polyfill
(function() {
    'use strict';
    
    if (typeof globalThis !== 'undefined' && typeof globalThis.browser === 'undefined') {
        globalThis.browser = chrome;
    }
    if (typeof self !== 'undefined' && typeof self.browser === 'undefined') {
        self.browser = chrome;
    }
    if (typeof window !== 'undefined' && typeof window.browser === 'undefined') {
        window.browser = chrome;
    }
})();`;
        await fs.promises.writeFile(polyfillPath, chromePolyfill);
    }
}

/**
 * Apply patches to specific files
 */
async function applyPatches() {
    for (const [filename, patchFunction] of Object.entries(PATCH_FILES)) {
        const filePath = path.join(TARGET_DIR, filename);
        if (fs.existsSync(filePath)) {
            console.log(`🔧 Patching ${filename}...`);
            await patchFunction(filePath);
        }
    }
}

/**
 * Patch manifest.json for Chrome MV3 compatibility
 */
async function patchManifest(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const manifest = JSON.parse(content);
    
    // Convert from Safari extension format to Chrome extension format
    if (manifest.background && manifest.background.scripts) {
        // Change from scripts array to service_worker (without type: module for Chrome compatibility)
        manifest.background = {
            service_worker: 'background.js'
        };
    }
    
    // Write back the patched manifest
    await fs.promises.writeFile(filePath, JSON.stringify(manifest, null, 4));
}

/**
 * Patch background.js for Chrome compatibility
 */
async function patchBackground(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('// Chrome service worker')) {
        console.log('  Background.js already patched');
        return;
    }
    
    // Create a minimal Chrome service worker
    const chromeServiceWorker = `// Chrome service worker for Kagi Translation Extension

// Simple browser polyfill for Chrome
if (typeof browser === 'undefined') {
    globalThis.browser = chrome;
}

// Languages data - simplified for Chrome
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文 (简体)' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' }
];

// Make languages available globally
globalThis.LANGUAGES = LANGUAGES;

// Language code mapping for Google Translate
function mapCodeForGoogle(c) {
  const table = {
    'zh': 'zh-CN',
    'zh-tw': 'zh-TW',
    'pt': 'pt',
    'yue': 'zh-TW'
  };
  return table[c] || c;
}

globalThis.mapCodeForGoogle = mapCodeForGoogle;

// Background script class
class TranslateBackground {
    constructor() {
        this.defaultLanguages = ['pl'];
        this.init();
    }

    init() {
        browser.action.onClicked.addListener((tab) => this.handleToolbarClick(tab));
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            return this.handleMessage(request, sender, sendResponse);
        });
        this.initializeDefaultSettings();
    }

    async initializeDefaultSettings() {
        try {
            const result = await browser.storage.sync.get(['selectedLanguages', 'provider']);
            const updates = {};
            
            if (!result.selectedLanguages) {
                updates.selectedLanguages = this.defaultLanguages;
            }
            
            if (!result.provider) {
                updates.provider = 'kagi';
            }
            
            if (Object.keys(updates).length > 0) {
                await browser.storage.sync.set(updates);
                console.log('Initialized default settings:', updates);
            }
        } catch (error) {
            console.error('Failed to initialize default settings:', error);
        }
    }

    async handleToolbarClick(tab) {
        if (!tab || !tab.url) {
            console.error('No valid tab for translation');
            return;
        }

        if (this.isTranslateDomain(tab.url)) {
            console.log('Extension disabled on translate domain');
            return;
        }

        try {
            const result = await browser.storage.sync.get(['selectedLanguages', 'provider']);
            const selectedLanguages = result.selectedLanguages || this.defaultLanguages;
            const provider = result.provider || 'kagi';
            
            if (selectedLanguages.length === 0) {
                await browser.tabs.create({
                    url: browser.runtime.getURL('options.html')
                });
                return;
            }

            const primaryLanguage = selectedLanguages[0];
            const target = this.buildTargetUrl(tab.url, primaryLanguage, provider);
            
            await browser.tabs.update(tab.id, { url: target });
            console.log('Translated page to', primaryLanguage);
            
        } catch (error) {
            console.error('Translation failed:', error);
            const target = this.buildTargetUrl(tab.url, 'pl', 'kagi');
            await browser.tabs.update(tab.id, { url: target });
        }
    }

    async handleMessage(request, sender, sendResponse) {
        console.log('Received message:', request);

        switch (request.action) {
            case 'getLanguages':
                return { languages: await this.getSelectedLanguages() };
                
            case 'translateTo':
                if (request.languageCode && sender.tab) {
                    await this.translateToLanguage(sender.tab, request.languageCode);
                    return { success: true };
                }
                return { success: false, error: 'Invalid request' };
                
            case 'openOptions':
                await browser.tabs.create({
                    url: browser.runtime.getURL('options.html')
                });
                return { success: true };
                
            default:
                if (request.greeting === "hello") {
                    return { farewell: "goodbye" };
                }
                return { error: 'Unknown action' };
        }
    }

    async getSelectedLanguages() {
        try {
            const result = await browser.storage.sync.get(['selectedLanguages']);
            return result.selectedLanguages || this.defaultLanguages;
        } catch (error) {
            console.error('Failed to get selected languages:', error);
            return this.defaultLanguages;
        }
    }

    buildTargetUrl(tabUrl, lang, provider = 'kagi') {
        if (provider === 'google') {
            const gCode = mapCodeForGoogle(lang);
            return 'https://translate.google.com/translate?sl=auto&tl=' + gCode + '&hl=en-US&u=' + encodeURIComponent(tabUrl) + '&client=webapp';
        }
        return 'https://translate.kagi.com/translate/' + lang + '/' + encodeURIComponent(tabUrl);
    }

    async translateToLanguage(tab, languageCode) {
        if (!tab || !tab.url) {
            throw new Error('No valid tab for translation');
        }

        const result = await browser.storage.sync.get(['provider']);
        const provider = result.provider || 'kagi';
        
        const target = this.buildTargetUrl(tab.url, languageCode, provider);
        await browser.tabs.update(tab.id, { url: target });
        console.log('Translated page to', languageCode);
    }

    isTranslateDomain(url) {
        try {
            const urlObj = new URL(url);
            
            if (urlObj.hostname === 'translate.kagi.com' || urlObj.hostname === 'translate.google.com') {
                return true;
            }
            
            if (this.isGoogleTranslatedPage(urlObj)) {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to parse URL:', error);
            return false;
        }
    }

    isGoogleTranslatedPage(url) {
        if (url.hostname === 'translate.google.com') {
            return url.searchParams.has('u') && url.searchParams.has('tl');
        }
        
        if (url.hostname.endsWith('.translate.goog')) {
            return true;
        }
        
        if (url.hostname.includes('translate.googleusercontent.com')) {
            return true;
        }
        
        if (url.hostname.includes('translate-pa.googleapis.com')) {
            return true;
        }
        
        return false;
    }
}

// Initialize background script
new TranslateBackground();
`;
    
    await fs.promises.writeFile(filePath, chromeServiceWorker);
}

/**
 * Patch popup.html for Chromium compatibility
 */
async function patchPopupHtml(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('chromium-polyfill.js')) {
        console.log('  popup.html already patched');
        return;
    }
    
    // Create external polyfill script file
    const polyfillPath = path.join(TARGET_DIR, 'chromium-polyfill.js');
    const polyfillContent = `// Chromium polyfill for browser API
if (typeof browser === 'undefined') {
    window.browser = chrome;
}`;
    
    await fs.promises.writeFile(polyfillPath, polyfillContent);
    
    // Insert the polyfill script reference before the first script tag
    const patchedContent = content.replace(
        '<script src="languages.js"></script>',
        '<script src="chromium-polyfill.js"></script>\n    <script src="languages.js"></script>'
    );
    
    await fs.promises.writeFile(filePath, patchedContent);
}

/**
 * Patch options.html for Chromium compatibility
 */
async function patchOptionsHtml(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('chromium-polyfill.js')) {
        console.log('  options.html already patched');
        return;
    }
    
    // The polyfill file should already exist from popup.html patching
    // Insert the polyfill script reference before the first script tag
    const patchedContent = content.replace(
        '<script src="languages.js"></script>',
        '<script src="chromium-polyfill.js"></script>\n    <script src="languages.js"></script>'
    );
    
    await fs.promises.writeFile(filePath, patchedContent);
}

/**
 * Copy additional assets if needed
 */
async function copyAdditionalAssets() {
    // Copy the lifenture signature image if it exists in the root
    const signatureSource = './lifenture-signature.png';
    const signatureTarget = path.join(TARGET_DIR, 'lifenture-signature.png');
    
    if (fs.existsSync(signatureSource)) {
        await fs.promises.copyFile(signatureSource, signatureTarget);
        console.log('📸 Copied lifenture-signature.png');
    }
}

// Export for potential use as a module
module.exports = {
    buildChromiumExtension,
    cleanDirectory,
    copyDirectory,
    patchManifest,
    patchBackground
};

// Run if called directly
if (require.main === module) {
    buildChromiumExtension();
}
