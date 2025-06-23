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
            const result = await browser.storage.sync.get(['selectedLanguages']);
            if (!result.selectedLanguages) {
                await browser.storage.sync.set({
                    selectedLanguages: this.defaultLanguages
                });
                console.log('Initialized default language settings');
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

        // Check if we're on translate.kagi.com and do nothing
        if (this.isKagiTranslateDomain(tab.url)) {
            console.log('Extension disabled on Kagi Translate domain');
            return;
        }

        try {
            // Get user's preferred languages
            const result = await browser.storage.sync.get(['selectedLanguages']);
            const selectedLanguages = result.selectedLanguages || this.defaultLanguages;
            
            if (selectedLanguages.length === 0) {
                // Open options page if no languages selected
                await browser.tabs.create({
                    url: browser.runtime.getURL('options.html')
                });
                return;
            }

            // Use the first selected language for direct toolbar clicks
            const primaryLanguage = selectedLanguages[0];
            const target = `https://translate.kagi.com/translate/${primaryLanguage}/` + encodeURIComponent(tab.url);
            
            await browser.tabs.update(tab.id, { url: target });
            console.log(`Translated page to ${primaryLanguage}`);
            
        } catch (error) {
            console.error('Translation failed:', error);
            // Fallback to default Polish translation
            const target = 'https://translate.kagi.com/translate/pl/' + encodeURIComponent(tab.url);
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

    async translateToLanguage(tab, languageCode) {
        if (!tab || !tab.url) {
            throw new Error('No valid tab for translation');
        }

        const target = `https://translate.kagi.com/translate/${languageCode}/` + encodeURIComponent(tab.url);
        await browser.tabs.update(tab.id, { url: target });
        console.log(`Translated page to ${languageCode}`);
    }

    isKagiTranslateDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'translate.kagi.com';
        } catch (error) {
            console.error('Failed to parse URL:', error);
            return false;
        }
    }
}

// Initialize background script
new TranslateBackground();
