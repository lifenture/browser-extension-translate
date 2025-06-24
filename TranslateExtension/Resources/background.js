// Background script for Kagi Translation Extension
class TranslateBackground {
    constructor() {
        this.defaultLanguages = ['pl']; // Polish as default
        this.init();
    }

    init() {
        // Handle toolbar icon clicks (when popup is disabled or fails)
        browser.action.onClicked.addListener((tab) => this.handleToolbarClick(tab));
        
        // Handle messages from popup/options
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            return this.handleMessage(request, sender, sendResponse);
        });
        
        // Initialize default settings if needed
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
                updates.provider = 'kagi'; // Default provider
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

        // Check if we're on translate domain and do nothing
        if (this.isTranslateDomain(tab.url)) {
            console.log('Extension disabled on translate domain');
            return;
        }

        try {
            // Get user's preferred languages and provider
            const result = await browser.storage.sync.get(['selectedLanguages', 'provider']);
            const selectedLanguages = result.selectedLanguages || this.defaultLanguages;
            const provider = result.provider || 'kagi';
            
            if (selectedLanguages.length === 0) {
                // Open options page if no languages selected
                await browser.tabs.create({
                    url: browser.runtime.getURL('options.html')
                });
                return;
            }

            // Use the first selected language for direct toolbar clicks
            const primaryLanguage = selectedLanguages[0];
            const target = this.buildTargetUrl(tab.url, primaryLanguage, provider);
            
            await browser.tabs.update(tab.id, { url: target });
            console.log(`Translated page to ${primaryLanguage}`);
            
        } catch (error) {
            console.error('Translation failed:', error);
            // Fallback to default Polish translation with Kagi
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
                // Legacy support
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
            const gCode = this.mapCodeForGoogle(lang);
            return `https://translate.google.com/translate?sl=auto&tl=${gCode}&hl=en-US&u=${encodeURIComponent(tabUrl)}&client=webapp`;
        }
        return `https://translate.kagi.com/translate/${lang}/` + encodeURIComponent(tabUrl);
    }

    // Language code mapping utility for Google Translate
    // Most ISO codes are identical; only handle known special cases
    mapCodeForGoogle(c) {
        const table = { 
            'zh': 'zh-CN',     // Chinese (Simplified)
            'zh-tw': 'zh-TW',  // Chinese (Traditional)
            'pt': 'pt',        // Portuguese (same as ISO)
            'yue': 'zh-TW'     // Cantonese -> Chinese (Traditional)
            /* Add more mappings here as needed */
        };
        return table[c] || c;
    }

    async translateToLanguage(tab, languageCode) {
        if (!tab || !tab.url) {
            throw new Error('No valid tab for translation');
        }

        // Get provider setting
        const result = await browser.storage.sync.get(['provider']);
        const provider = result.provider || 'kagi';
        
        const target = this.buildTargetUrl(tab.url, languageCode, provider);
        await browser.tabs.update(tab.id, { url: target });
        console.log(`Translated page to ${languageCode}`);
    }

    isTranslateDomain(url) {
        try {
            const urlObj = new URL(url);
            
            // Check if URL is on translate service domains
            if (urlObj.hostname === 'translate.kagi.com' || urlObj.hostname === 'translate.google.com') {
                return true;
            }
            
            // Check if page is already translated through Google Translate
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
        // Check for Google Translate URL patterns that indicate a translated page
        if (url.hostname === 'translate.google.com') {
            // Check if this is a translation result page (has 'u' parameter with original URL)
            return url.searchParams.has('u') && url.searchParams.has('tl');
        }
        
        // Check for Google Translate translated pages (domains ending with .translate.goog)
        if (url.hostname.endsWith('.translate.goog')) {
            return true;
        }
        
        // Check for Google Translate widget/frame patterns
        // These might appear when Google Translate is embedded in pages
        if (url.hostname.includes('translate.googleusercontent.com')) {
            return true;
        }
        
        // Check for other Google Translate related domains or patterns
        if (url.hostname.includes('translate-pa.googleapis.com')) {
            return true;
        }
        
        return false;
    }
}

// Initialize background script
new TranslateBackground();
