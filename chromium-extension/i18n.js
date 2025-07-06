// Internationalization utility for UI translation
// Automatically changes UI language based on first selected target language

class I18nManager {
    constructor() {
        this.currentLocale = 'en'; // Default to English
        this.messages = {};
        this.fallbackMessages = {}; // English fallback messages
        // List of languages we have translation files for
        this.supportedLocales = ['ar', 'bg', 'cs', 'da', 'de', 'en', 'es', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'th', 'tr', 'vi', 'zh'];
    }

    // Initialize the i18n manager
    async init() {
        // Load English fallback messages first
        await this.loadFallbackMessages();
        await this.determineUILanguage();
        await this.loadMessages();
    }

    // Determine which UI language to use based on user's selected target languages
    async determineUILanguage() {
        try {
            // Get user's selected languages
            const result = await chrome.storage.sync.get(['selectedLanguages']);
            const selectedLanguages = result.selectedLanguages || [];
            
            if (selectedLanguages.length > 0) {
                // Use the first selected language as UI language if we have translations for it
                const firstLang = selectedLanguages[0];
                if (this.supportedLocales.includes(firstLang)) {
                    this.currentLocale = firstLang;
                    return;
                }
            }
            
            // Fallback to browser language or English
            const browserLang = this.getBrowserLanguage();
            if (this.supportedLocales.includes(browserLang)) {
                this.currentLocale = browserLang;
            } else {
                this.currentLocale = 'en';
            }
            
        } catch (error) {
            console.error('Failed to determine UI language:', error);
            this.currentLocale = 'en';
        }
    }

    // Get browser's language (first 2 chars)
    getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage || 'en';
        return lang.substring(0, 2);
    }

// Load translation messages for current locale
    async loadMessages() {
        try {
            const url = chrome.runtime.getURL(`_locales/${this.currentLocale}/messages.json`);
            console.log(`🌍 Loading messages for locale '${this.currentLocale}' from:`, url);
            const response = await fetch(url);
            if (response.ok) {
                this.messages = await response.json();
                console.log(`✅ Loaded ${Object.keys(this.messages).length} messages for locale '${this.currentLocale}'`);
            } else {
                console.warn(`❌ No translation file found for locale '${this.currentLocale}' (${response.status}), using fallback`);
                // If we can't load the current locale, fallback to English messages
                this.messages = this.fallbackMessages;
            }
        } catch (error) {
            console.error(`❌ Failed to load translation messages for '${this.currentLocale}':`, error);
            // If we can't load the current locale, fallback to English messages
            this.messages = this.fallbackMessages;
        }
    }

    async loadFallbackMessages() {
        try {
            const fallbackResponse = await fetch(chrome.runtime.getURL('_locales/en/messages.json'));
            if (fallbackResponse.ok) {
                this.fallbackMessages = await fallbackResponse.json();
                console.log('✅ Loaded fallback English messages:', Object.keys(this.fallbackMessages).length, 'keys');
            } else {
                console.error('❌ Failed to fetch fallback English messages:', fallbackResponse.status);
                this.fallbackMessages = {};
            }
        } catch (error) {
            console.error('❌ Failed to load fallback English messages:', error);
            this.fallbackMessages = {};
        }
    }

// Get translated message
    getMessage(key, substitutions = []) {
        // Safety check: if neither messages are loaded yet, return readable key
        if (Object.keys(this.messages).length === 0 && Object.keys(this.fallbackMessages).length === 0) {
            console.warn(`⚠️ i18n not fully initialized when getMessage('${key}') was called`);
            return this.keyToReadableText(key);
        }
        
        let messageObj = this.messages[key];
        
        // If not found in current locale, try fallback
        if (!messageObj && this.fallbackMessages[key]) {
            messageObj = this.fallbackMessages[key];
        }
        
        // If still not found, return a user-friendly error or the key
        if (!messageObj) {
            console.warn(`⚠️ Translation key '${key}' not found for locale '${this.currentLocale}' or fallback`);
            // Try to return a more readable version of the key
            return this.keyToReadableText(key);
        }

        let message = messageObj.message;
        
        // Handle substitutions
        if (substitutions.length > 0) {
            if (messageObj.placeholders) {
                // Use placeholder names from the message definition
                const placeholderKeys = Object.keys(messageObj.placeholders);
                substitutions.forEach((sub, index) => {
                    if (index < placeholderKeys.length) {
                        const placeholderName = placeholderKeys[index];
                        const placeholder = `$${placeholderName.toUpperCase()}$`;
                        message = message.replace(placeholder, sub);
                    }
                });
            } else {
                // Fallback: replace generic placeholders like $1, $2, etc.
                substitutions.forEach((sub, index) => {
                    message = message.replace(`$${index + 1}`, sub);
                });
            }
        }

        return message;
    }

    // Convert translation key to readable text as last resort
    keyToReadableText(key) {
        // Convert snake_case to Title Case
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Get current locale
    getCurrentLocale() {
        return this.currentLocale;
    }

    // Update UI language when target languages change
    async updateUILanguageFromTargets(selectedLanguages) {
        if (selectedLanguages.length > 0) {
            const firstLang = selectedLanguages[0];
            
            // Only update if we have translations for this language
            if (this.supportedLocales.includes(firstLang) && firstLang !== this.currentLocale) {
                this.currentLocale = firstLang;
                await this.loadMessages();
                return true; // Language changed
            }
        }
        return false; // No change
    }

    // Translate all elements with data-i18n attribute
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        // Translate regular text elements
        for (const element of elements) {
            const key = element.getAttribute('data-i18n');
            const translatedText = this.getMessage(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                element.placeholder = translatedText;
            } else {
                element.textContent = translatedText;
            }
        }

        // Handle elements with data-i18n-html (for HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        for (const element of htmlElements) {
            const key = element.getAttribute('data-i18n-html');
            const translatedText = this.getMessage(key);
            element.innerHTML = translatedText;
        }

        // Handle title attributes
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        for (const element of titleElements) {
            const key = element.getAttribute('data-i18n-title');
            const translatedText = this.getMessage(key);
            element.title = translatedText;
        }
    }

    // Get language-specific name from LANGUAGES array
    getLanguageDisplayName(langCode) {
        const language = window.LANGUAGES?.find(l => l.code === langCode);
        if (!language) return langCode;

        // Use native name in UI language's context
        // For now, return the English name for consistency
        return language.name;
    }

    // Get localized language name for the current UI language
    getLocalizedLanguageName(langCode) {
        // First try to get a translated language name from our messages
        const langKey = `lang_${langCode}`;
        const translatedName = this.getMessage(langKey);
        
        // If we have a specific translation for this language name, use it
        if (translatedName !== this.keyToReadableText(langKey)) {
            return translatedName;
        }
        
        // Otherwise, fall back to the language's native name or English name
        const language = window.LANGUAGES?.find(l => l.code === langCode);
        if (!language) return langCode;
        
        // Use native name as it's more recognizable to users
        return language.native || language.name;
    }
}

// Global instance
window.i18n = new I18nManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
