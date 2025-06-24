// Dynamic popup functionality based on user's language preferences
class TranslatePopup {
    constructor() {
        this.defaultLanguages = ['pl']; // Polish as default
        this.init();
    }

    async init() {
        await this.loadLanguagesData();
        await this.loadUserSettings();
        
        // Check if we're on translate domain and show appropriate message
        if (await this.isOnTranslateDomain()) {
            this.renderDisabledDomainMessage();
            this.addSettingsLink();
            return;
        }
        
        await this.renderTranslateButtons();
        this.addSettingsLink();
    }

    async loadLanguagesData() {
        // Languages data is included via script tag in popup.html
        if (!window.LANGUAGES) {
            console.error('Languages data not loaded');
            return;
        }
    }

    async loadUserSettings() {
        try {
            const result = await browser.storage.sync.get(['selectedLanguages', 'provider']);
            this.selectedLanguages = result.selectedLanguages || this.defaultLanguages;
            this.provider = result.provider || 'kagi'; // Default to 'kagi'
        } catch (error) {
            console.error('Failed to load user settings:', error);
            this.selectedLanguages = this.defaultLanguages;
            this.provider = 'kagi';
        }
    }

    async renderTranslateButtons() {
        // Check if we're on translate domain first
        if (await this.isOnTranslateDomain()) {
            this.renderDisabledDomainMessage();
            return;
        }
        
        const container = document.getElementById('translate-buttons');
        
        if (!container) {
            console.error('Translate buttons container not found');
            return;
        }

        container.innerHTML = '';

        if (this.selectedLanguages.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        this.selectedLanguages.forEach(langCode => {
            const language = window.LANGUAGES?.find(l => l.code === langCode);
            if (language) {
                const button = this.createTranslateButton(language);
                container.appendChild(button);
            }
        });
    }

    createTranslateButton(language) {
        const button = document.createElement('button');
        button.className = 'translate-btn';
        button.innerHTML = `
            <span class="flag">${this.getLanguageFlag(language.code)}</span>
            <span class="text">Translate to ${language.name}</span>
        `;
        
        button.addEventListener('click', async () => {
            await this.translateToLanguage(language.code);
        });

        return button;
    }

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No languages selected</p>
                <p class="hint">Click settings to choose your preferred languages</p>
            </div>
        `;
    }

    addSettingsLink() {
        const settingsContainer = document.getElementById('settings-link');
        if (settingsContainer) {
            settingsContainer.innerHTML = `
                <button id="open-settings" class="settings-btn">
                    ⚙️ Settings
                </button>
            `;
            
            document.getElementById('open-settings').addEventListener('click', () => {
                this.openSettings();
            });
        }
    }

    buildTargetUrl(tabUrl, lang) {
        if (this.provider === 'google') {
            const gCode = window.mapCodeForGoogle(lang);
            return `https://translate.google.com/translate?sl=auto&tl=${gCode}&hl=en-US&u=${encodeURIComponent(tabUrl)}&client=webapp`;
        }
        return `https://translate.kagi.com/translate/${lang}/` + encodeURIComponent(tabUrl);
    }

    async translateToLanguage(languageCode) {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url) {
                console.error('No active tab found');
                return;
            }

            const target = this.buildTargetUrl(tab.url, languageCode);
            await browser.tabs.update(tab.id, { url: target });
            window.close();
        } catch (error) {
            console.error('Translation failed:', error);
        }
    }

    openSettings() {
        browser.tabs.create({
            url: browser.runtime.getURL('options.html')
        });
        window.close();
    }

    async isOnTranslateDomain() {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url) {
                return false;
            }
            
            const url = new URL(tab.url);
            
            // Check if URL is on translate service domains
            if (url.hostname === 'translate.kagi.com' || url.hostname === 'translate.google.com') {
                return true;
            }
            
            // Check if page is already translated through Google Translate
            // Google Translate creates frames/embeds with specific patterns
            if (this.isGoogleTranslatedPage(url)) {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to check current tab URL:', error);
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

    renderDisabledDomainMessage() {
        const container = document.getElementById('translate-buttons');
        
        if (!container) {
            console.error('Translate buttons container not found');
            return;
        }

        container.innerHTML = `
            <div class="kagi-domain-message">
                <div class="message-icon">⚠️</div>
                <div class="message-content">
                    <h3>Extension Disabled on translation site</h3>
                    <p>This extension cannot be used on translation service pages to prevent conflicts.</p>
                    <p class="hint">Navigate to another page to use the translation feature.</p>
                </div>
            </div>
        `;
    }

    getLanguageFlag(code) {
        // Simple flag mapping for common languages
        const flags = {
            'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
            'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
            'ar': '🇸🇦', 'hi': '🇮🇳', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱',
            'sv': '🇸🇪', 'no': '🇳🇴', 'da': '🇩🇰', 'fi': '🇫🇮', 'he': '🇮🇱',
            'th': '🇹🇭', 'vi': '🇻🇳', 'uk': '🇺🇦', 'cs': '🇨🇿', 'hu': '🇭🇺',
            'ro': '🇷🇴', 'bg': '🇧🇬', 'hr': '🇭🇷', 'sk': '🇸🇰', 'sl': '🇸🇮'
        };
        return flags[code] || '🌐';
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranslatePopup();
});
