// Dynamic popup functionality based on user's language preferences
class TranslatePopup {
    constructor() {
        this.defaultLanguages = ['pl']; // Polish as default
        this.init();
    }

    async init() {
        await this.loadLanguagesData();
        await this.loadUserSettings();
        
        // Check if we're on translate.kagi.com and show appropriate message
        if (await this.isOnKagiTranslate()) {
            this.renderKagiDomainMessage();
            this.addSettingsLink();
            return;
        }
        
        this.renderTranslateButtons();
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
            const result = await browser.storage.sync.get(['selectedLanguages']);
            this.selectedLanguages = result.selectedLanguages || this.defaultLanguages;
        } catch (error) {
            console.error('Failed to load user settings:', error);
            this.selectedLanguages = this.defaultLanguages;
        }
    }

    renderTranslateButtons() {
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

    async translateToLanguage(languageCode) {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url) {
                console.error('No active tab found');
                return;
            }

            const target = `https://translate.kagi.com/translate/${languageCode}/` + encodeURIComponent(tab.url);
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

    async isOnKagiTranslate() {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url) {
                return false;
            }
            
            // Check if URL starts with translate.kagi.com
            const url = new URL(tab.url);
            return url.hostname === 'translate.kagi.com';
        } catch (error) {
            console.error('Failed to check current tab URL:', error);
            return false;
        }
    }

    renderKagiDomainMessage() {
        const container = document.getElementById('translate-buttons');
        
        if (!container) {
            console.error('Translate buttons container not found');
            return;
        }

        container.innerHTML = `
            <div class="kagi-domain-message">
                <div class="message-icon">⚠️</div>
                <div class="message-content">
                    <h3>Extension Disabled</h3>
                    <p>This extension cannot be used on Kagi Translate pages to prevent conflicts.</p>
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
