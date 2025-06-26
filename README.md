# Translate Extension

A Safari web extension that allows users to quickly translate web pages using their choice of translation provider (Kagi Translate or Google Translate).

## Features

- 🌍 **Multi-language support** - Choose up to 5 preferred languages from 100+ options
- 🔄 **Provider choice** - Select between Kagi Translate or Google Translate as your translation service
- ⚙️ **Dynamic configuration** - Customizable language selection via settings page
- 🔍 **Smart search** - Find languages by name, native name, or language code
- 🏳️ **Visual flags** - Country flags for easy language identification
- 🦘 **Safari Web Extension** format for macOS with cross-browser compatibility
- 🔒 **Minimal permissions** - only accesses tabs and storage
- 🎨 **Clean UI** with responsive design and animations
- 🌙 **Dark mode support** with system color scheme adaptation
- 💾 **Settings sync** - Preferences synchronized across browser instances

## How it Works

### Basic Usage
1. Click the extension icon in Safari's toolbar
2. Choose from your configured translation languages (up to 5)
3. The current page URL is sent to your selected translation provider
4. Automatically redirects to the translation service with your target language

### Configuration
1. Click the extension icon and select "⚙️ Settings"
2. **Choose Translation Provider:**
   - **Kagi Translate** (default) - Privacy-focused translations using Kagi's FastGPT
   - **Google Translate** - Fast and reliable translations using Google's service
3. Choose up to 5 preferred languages from 100+ options
4. Use search to find languages by name, native name, or code
5. Save settings - they sync across browser instances
6. Your popup will show buttons for selected languages

### Translation Providers

#### Kagi Translate (Default)
- **URL Pattern:** `https://translate.kagi.com/translate/{language}/{encoded-url}`
- **Features:** Privacy-focused, no tracking, powered by FastGPT
- **Best for:** Users who prioritize privacy and high-quality AI translations

#### Google Translate
- **URL Pattern:** `https://translate.google.com/translate?sl=auto&tl={language}&hl=en-US&u={encoded-url}&client=webapp`
- **Features:** Fast, reliable, extensive language support
- **Best for:** Users who want maximum speed and reliability

## Usage Notes

### Provider Selection
- **Default:** Kagi Translate is selected by default for new installations
- **Switching:** Change providers anytime in Settings - takes effect immediately
- **URL Handling:** Each provider uses its own URL format and parameters
- **Language Codes:** Automatic mapping ensures compatibility (e.g., `zh` → `zh-CN` for Google)

### Provider-Specific Behavior
- **Kagi:** Uses clean URL structure with language codes as path segments
- **Google:** Uses query parameters with `sl=auto` for source language detection
- **Fallback:** If translation fails, extension falls back to Polish with Kagi

### Smart Domain Detection
- **Translation Sites:** Extension automatically disables on both Kagi and Google Translate domains
- **Translated Pages:** Detects when viewing Google Translate translated pages and prevents double-translation
- **Google .translate.goog:** Recognizes Google's translated page domains (e.g., `example-com.translate.goog`)
- **Widget Detection:** Recognizes Google Translate widgets and embedded translation frames
- **API Domains:** Identifies Google Translate API domains (translate.googleusercontent.com, translate-pa.googleapis.com)

### Settings Persistence
- Provider choice is saved to browser storage and syncs across instances
- Language selections work with both providers
- Settings page displays current provider selection
- No data loss when switching between providers
- After saving settings, automatically returns to the original tab

## Installation

### Safari (macOS)

1. Open the project in Xcode
2. Build the project (`Cmd+B`)
3. Open Safari
4. Go to Safari → Settings → Extensions
5. Enable "Translate Extension"
6. The extension icon will appear in the Safari toolbar

### Chrome/Edge (for testing)

1. Build the project in Xcode
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the extension folder: `build/Debug/TranslateExtension.appex/Contents/Resources/`

## Development

### Project Structure

```
Translate/
├── TranslateExtension/                     # Safari Web Extension
│   ├── Resources/                          # Extension files
│   │   ├── manifest.json                   # Extension manifest (MV3)
│   │   ├── popup.html                      # Extension popup UI
│   │   ├── popup.css                       # Popup styling
│   │   ├── popup.js                        # Dynamic popup functionality
│   │   ├── background.js                   # Background script
│   │   ├── options.html                    # Settings/configuration page
│   │   ├── options.css                     # Settings page styling
│   │   ├── options.js                      # Settings page functionality
│   │   ├── languages.js                    # 100+ language definitions
│   │   ├── images/                         # Extension icons
│   │   └── _locales/en/messages.json       # Localization
│   ├── SafariWebExtensionHandler.swift     # Swift extension handler
│   └── Info.plist                          # Extension metadata
├── Translate/                              # macOS app container
└── Translate.xcodeproj                     # Xcode project
```

### Technologies Used

- **Manifest V3** - Modern web extension format
- **Safari Web Extensions** - Native Safari extension support
- **JavaScript ES6+** - Modern JavaScript with async/await
- **Swift** - macOS app container
- **CSS3** - Modern styling with dark mode support

### Key Features

#### Permissions
- `activeTab` - Access to the currently active tab
- `tabs` - Ability to update tab URLs
- `storage` - Store user preferences and settings
- `https://translate.kagi.com/*` - Host permission for Kagi Translate
- `https://translate.google.com/*` - Host permission for Google Translate

#### Browser Compatibility
- ✅ Safari (primary target)
- ✅ Chrome (Manifest V3)
- ✅ Edge (Manifest V3)
- ✅ Firefox (Manifest V3)

## Building

1. Open `Translate.xcodeproj` in Xcode
2. Select the "TranslateExtension" target
3. Build the project (`Product` → `Build` or `Cmd+B`)
4. The extension will be built to `build/Debug/TranslateExtension.appex`

## Testing

1. Build the extension
2. Load it in Safari or Chrome
3. Visit any website
4. Click the extension icon
5. Press "Translate page to Polish"
6. Verify it redirects to `https://translate.kagi.com/translate/pl/<encoded-url>`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Migration Notes

### Upgrading to v1.3.0+ (Provider Choice)

**Existing users:** Your settings remain unchanged - Kagi Translate continues as the default provider.

**New options available:**
- Translation provider selection in Settings
- Google Translate alternative with different URL pattern
- Enhanced host permissions for both services

**No action required:** Default behavior is preserved for existing installations.

## Version History

- **1.4.0** - Translation Counter & Support Integration
  - 📊 **Translation counter** - Track pages translated with persistent storage
  - 💝 **Support project button** - Direct Stripe integration for extension support
  - 🎨 **Dual-button footer** - Settings and Support buttons in vertical layout
  - 🟢 **Fresh green styling** - Support buttons use attractive green theme
  - 📱 **Enhanced UI** - Improved button sizing and responsive design
  - 🔧 **Shared utilities** - Centralized support configuration reduces code duplication
  - 🎯 **Motivational UX** - Counter encourages continued usage
  - 🛡️ **Clean manifest** - Removed excessive CSP permissions following security best practices
  - 💳 **Production payments** - Live Stripe checkout for real support transactions

- **1.3.0** - Provider Choice Feature
  - 🔄 **Provider selection** - Choose between Kagi Translate and Google Translate
  - 🎛️ **Enhanced settings** - Provider choice UI in options page
  - 🔗 **Google URL pattern** - Proper Google Translate URL formatting with query parameters
  - 🔒 **Updated permissions** - Added Google Translate host permission
  - 🛡️ **Backward compatibility** - Existing users keep Kagi as default
  - 🎯 **Smart URL building** - Dynamic URL generation based on selected provider
  - 🌐 **Language code mapping** - Automatic mapping for Google Translate compatibility

- **1.2.0** - Google Translate Host Permission
  - 🌐 Added `https://translate.google.com/*` to host permissions
  - 🔄 Enhanced translation service compatibility

- **1.1.0** - Configuration & Multi-language Support
  - ⚙️ Dynamic language configuration (up to 5 languages)
  - 🔍 Smart search across 100+ languages
  - 🏳️ Visual language flags and native names
  - 💾 Settings synchronization via browser storage
  - 📱 Responsive settings page with live preview
  - 🎨 Enhanced popup with dynamic button generation
  - 🔧 Background script improvements for direct toolbar clicks

- **1.0.0** - Initial release
  - Basic Polish translation functionality
  - Safari Web Extension format
  - Manifest V3 compatibility
  - Clean popup interface
  - Dark mode support

---

<div align="center">
  <a href="https://lifenture.com" target="_blank" rel="noopener noreferrer">
    <img src="lifenture-signature.png" alt="Lifenture" width="120" style="opacity: 0.8;">
  </a>
</div>
