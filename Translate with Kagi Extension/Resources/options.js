// Options page functionality for language selection
class LanguageSelector {
    constructor() {
        this.selectedLanguages = [];
        this.maxLanguages = 5;
        this.defaultLanguages = ['pl']; // Default to Polish as originally intended
        this.searchTimeout = null;
        this.provider = 'kagi'; // Default provider
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadSavedSettings();
        this.renderLanguageGrid();
        this.updateUI();
    }

    bindEvents() {
        // Language search
        const searchInput = document.getElementById('language-search');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.filterLanguages(e.target.value);
            }, 300);
        });

        // Provider selection
        const providerRadios = document.querySelectorAll('input[name="provider"]');
        providerRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.provider = e.target.value;
                    this.enableSaveButton();
                }
            });
        });

        // Save settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

    }

    async loadSavedSettings() {
        try {
            const { selectedLanguages, provider } = await browser.storage.sync.get(['selectedLanguages', 'provider']);
            
            // Load selected languages
            if (selectedLanguages && Array.isArray(selectedLanguages)) {
                this.selectedLanguages = selectedLanguages;
            } else {
                // Set default languages if none saved
                this.selectedLanguages = [...this.defaultLanguages];
            }
            
            // Load provider setting
            this.provider = provider || 'kagi';
            
            // Update the radio button selection
            const providerRadio = document.querySelector(`input[name="provider"][value="${this.provider}"]`);
            if (providerRadio) {
                providerRadio.checked = true;
            }
            
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.selectedLanguages = [...this.defaultLanguages];
            this.provider = 'kagi';
        }
    }

    async saveSettings() {
        try {
            await browser.storage.sync.set({
                selectedLanguages: this.selectedLanguages,
                provider: this.provider
            });
            
            this.showNotification('Settings saved successfully!', 'success');
            
            // Disable save button and show confirmation
            const saveBtn = document.getElementById('save-settings');
            saveBtn.disabled = true;
            saveBtn.textContent = '✅ Saved';
            
            // Close the settings page after a short delay to show confirmation
            setTimeout(() => {
                if (typeof window !== 'undefined' && window.close) {
                    window.close();
                } else {
                    // Fallback: try to close the current tab
                    if (typeof browser !== 'undefined' && browser.tabs) {
                        browser.tabs.query({ active: true, currentWindow: true })
                            .then(([tab]) => {
                                if (tab && tab.id) {
                                    browser.tabs.remove(tab.id);
                                }
                            })
                            .catch(error => {
                                console.error('Failed to close tab:', error);
                                // Reset button state if closing fails
                                saveBtn.disabled = false;
                                saveBtn.innerHTML = '💾 Save Settings';
                            });
                    }
                }
            }, 1500); // Close after 1.5 seconds to allow user to see confirmation
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }


    renderLanguageGrid() {
        const grid = document.getElementById('language-grid');
        grid.innerHTML = '';

        window.LANGUAGES.forEach(language => {
            const item = this.createLanguageItem(language);
            grid.appendChild(item);
        });
    }

    createLanguageItem(language) {
        const item = document.createElement('div');
        item.className = 'language-item';
        item.dataset.code = language.code;
        
        const isSelected = this.selectedLanguages.includes(language.code);
        const isMaxReached = this.selectedLanguages.length >= this.maxLanguages;
        
        if (isSelected) {
            item.classList.add('selected');
        }
        
        if (!isSelected && isMaxReached) {
            item.classList.add('disabled');
        }

        item.innerHTML = `
            <div class="language-info">
                <div class="language-name">${language.name}</div>
                <div class="language-native">${language.native}</div>
            </div>
            <div class="language-code">${language.code}</div>
        `;

        item.addEventListener('click', () => {
            if (item.classList.contains('disabled')) return;
            
            this.toggleLanguage(language.code);
        });

        return item;
    }

    toggleLanguage(code) {
        const index = this.selectedLanguages.indexOf(code);
        
        if (index > -1) {
            // Remove language
            this.selectedLanguages.splice(index, 1);
        } else {
            // Add language (if not at max)
            if (this.selectedLanguages.length < this.maxLanguages) {
                this.selectedLanguages.push(code);
            }
        }
        
        this.updateUI();
        this.enableSaveButton();
    }

    updateUI() {
        this.updateSelectedLanguagesDisplay();
        this.updateLanguageGrid();
        this.updatePreview();
        this.updateSelectionCount();
    }

    updateSelectedLanguagesDisplay() {
        const container = document.getElementById('selected-languages');
        
        if (this.selectedLanguages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No languages selected yet</p>
                    <p class="hint">Choose from the list below to add translation buttons</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        this.selectedLanguages.forEach(code => {
            const language = window.LANGUAGES.find(l => l.code === code);
            if (!language) return;
            
            const tag = document.createElement('div');
            tag.className = 'selected-language';
            tag.innerHTML = `
                <span>${language.name}</span>
                <button class="remove-btn" title="Remove ${language.name}" data-code="${code}">×</button>
            `;
            
            tag.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLanguage(code);
            });
            
            container.appendChild(tag);
        });
    }

    updateLanguageGrid() {
        const items = document.querySelectorAll('.language-item');
        const isMaxReached = this.selectedLanguages.length >= this.maxLanguages;
        
        items.forEach(item => {
            const code = item.dataset.code;
            const isSelected = this.selectedLanguages.includes(code);
            
            item.classList.toggle('selected', isSelected);
            item.classList.toggle('disabled', !isSelected && isMaxReached);
        });
    }

    updatePreview() {
        const preview = document.getElementById('popup-preview');
        
        if (this.selectedLanguages.length === 0) {
            preview.innerHTML = '<div class="preview-empty">Select languages to see preview</div>';
            return;
        }

        preview.innerHTML = '';
        
        this.selectedLanguages.forEach(code => {
            const language = window.LANGUAGES.find(l => l.code === code);
            if (!language) return;
            
            const btn = document.createElement('div');
            btn.className = 'preview-btn';
            btn.textContent = `Translate to ${language.name}`;
            preview.appendChild(btn);
        });
    }

    updateSelectionCount() {
        const counter = document.getElementById('selection-count');
        counter.textContent = this.selectedLanguages.length;
    }

    enableSaveButton() {
        const saveBtn = document.getElementById('save-settings');
        saveBtn.disabled = false;
    }

    filterLanguages(searchTerm) {
        const items = document.querySelectorAll('.language-item');
        const term = searchTerm.toLowerCase().trim();
        
        items.forEach(item => {
            const code = item.dataset.code;
            const language = window.LANGUAGES.find(l => l.code === code);
            
            if (!language) {
                item.style.display = 'none';
                return;
            }
            
            const matches = 
                language.name.toLowerCase().includes(term) ||
                language.native.toLowerCase().includes(term) ||
                language.code.toLowerCase().includes(term);
            
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSelector();
});

// Handle extension context
if (typeof browser === 'undefined') {
    // Fallback for testing
    window.browser = {
        storage: {
            sync: {
                get: (keys) => Promise.resolve({}),
                set: (data) => Promise.resolve()
            }
        }
    };
}
