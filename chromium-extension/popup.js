// Dynamic popup functionality based on user's language preferences

class TranslatePopup {
    constructor() {
        this.defaultLanguages = []; // No default languages
        this.init();
    }

    async init() {
        // Initialize i18n first
        await window.i18n.init();
        
        await this.loadLanguagesData();
        await this.loadUserSettings();
        
        // Translate the page
        window.i18n.translatePage();
        
        // Check if we're on translate domain and show appropriate message
        if (await this.isOnTranslateDomain()) {
            this.renderDisabledDomainMessage();
            this.addFooterButtons();
            return;
        }
        
        await this.renderTranslateButtons();
        this.addFooterButtons();
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
            const result = await chrome.storage.sync.get(['selectedLanguages', 'provider', 'translationCount']);
            this.selectedLanguages = result.selectedLanguages || this.defaultLanguages;
            this.provider = result.provider || 'kagi'; // Default to 'kagi'
            this.translationCount = result.translationCount || 0;
            this.updateTranslationCounter();
        } catch (error) {
            console.error('Failed to load user settings:', error);
            this.selectedLanguages = this.defaultLanguages;
            this.provider = 'kagi';
            this.translationCount = 0;
            this.updateTranslationCounter();
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
            await this.renderEmptyState(container);
            return;
        }

        for (const langCode of this.selectedLanguages) {
            const language = window.LANGUAGES?.find(l => l.code === langCode);
            if (language) {
                const button = this.createTranslateButton(language);
                container.appendChild(button);
            }
        }
    }

    createTranslateButton(language) {
        const button = document.createElement('button');
        button.className = 'translate-btn';
        
        const localizedLanguageName = window.i18n.getLocalizedLanguageName(language.code);
        const translateText = window.i18n.getMessage('translate_to', [localizedLanguageName]);
        button.innerHTML = `
            <span class="flag">${this.getLanguageFlag(language.code)}</span>
            <span class="text">${translateText}</span>
        `;
        
        button.addEventListener('click', async () => {
            await this.translateToLanguage(language.code);
        });

        return button;
    }

    async renderEmptyState(container) {
        const noLanguagesText = window.i18n.getMessage('no_languages_selected');
        const hintText = window.i18n.getMessage('click_settings_hint');
        
        container.innerHTML = `
            <div class="empty-state">
                <p>${noLanguagesText}</p>
                <p class="hint">${hintText}</p>
            </div>
        `;
    }

    addFooterButtons() {
        // Add event listeners to existing footer buttons
        const settingsBtn = document.getElementById('open-settings');
        const supportBtn = document.getElementById('open-support');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                openStripeCheckout();
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
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url) {
                console.error('No active tab found');
                return;
            }

            const target = this.buildTargetUrl(tab.url, languageCode);
            await chrome.tabs.update(tab.id, { url: target });
            
            // Increment translation counter
            await this.incrementTranslationCounter();
            
            window.close();
        } catch (error) {
            console.error('Translation failed:', error);
        }
    }

    async openSettings() {
        try {
            // Get the current active tab before opening settings
            const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Store the original tab ID for returning later
            if (currentTab && currentTab.id) {
                await chrome.storage.local.set({ originalTabId: currentTab.id });
            }
            
            // Create the settings tab
            chrome.tabs.create({
                url: chrome.runtime.getURL('options.html')
            });
            window.close();
        } catch (error) {
            console.error('Failed to open settings:', error);
            // Fallback: just open settings without storing tab ID
            chrome.tabs.create({
                url: chrome.runtime.getURL('options.html')
            });
            window.close();
        }
    }


    async isOnTranslateDomain() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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

        const disabledTitle = window.i18n.getMessage('extension_disabled');
        const disabledDescription = window.i18n.getMessage('extension_disabled_description');
        const navigateHint = window.i18n.getMessage('navigate_hint');

        container.innerHTML = `
            <div class="kagi-domain-message">
                <div class="message-icon">⚠️</div>
                <div class="message-content">
                    <h3>${disabledTitle}</h3>
                    <p>${disabledDescription}</p>
                    <p class="hint">${navigateHint}</p>
                </div>
            </div>
        `;
    }

    updateTranslationCounter() {
        const counterElement = document.getElementById('translation-count');
        if (counterElement) {
            counterElement.textContent = this.translationCount || 0;
        }
    }

    async incrementTranslationCounter() {
        try {
            this.translationCount = (this.translationCount || 0) + 1;
            await chrome.storage.sync.set({ translationCount: this.translationCount });
            this.updateTranslationCounter();
        } catch (error) {
            console.error('Failed to update translation counter:', error);
        }
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
