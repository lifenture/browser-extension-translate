// Chrome service worker for Kagi Translation Extension

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
