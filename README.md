# Translate with Kagi Extension

A Safari web extension that allows users to quickly translate web pages to Polish using Kagi Translate.

## Features

- 🌍 **One-click translation** to Polish using Kagi Translate
- 🦘 **Safari Web Extension** format for macOS
- 🔒 **Minimal permissions** - only accesses the current tab and Kagi Translate
- 🎨 **Clean UI** with a simple button interface
- 🌙 **Dark mode support** with system color scheme adaptation

## How it Works

1. Click the extension icon in Safari's toolbar
2. Press the "Translate page to Polish" button
3. The current page URL is sent to Kagi Translate for translation
4. Automatically redirects to `https://translate.kagi.com/translate/pl/<encoded-url>`

## Installation

### Safari (macOS)

1. Open the project in Xcode
2. Build the project (`Cmd+B`)
3. Open Safari
4. Go to Safari → Settings → Extensions
5. Enable "Translate with Kagi Extension"
6. The extension icon will appear in the Safari toolbar

### Chrome/Edge (for testing)

1. Build the project in Xcode
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the extension folder: `build/Debug/Translate with Kagi Extension.appex/Contents/Resources/`

## Development

### Project Structure

```
Translate with Kagi/
├── Translate with Kagi Extension/          # Safari Web Extension
│   ├── Resources/                          # Extension files
│   │   ├── manifest.json                   # Extension manifest (MV3)
│   │   ├── popup.html                      # Extension popup UI
│   │   ├── popup.css                       # Popup styling
│   │   ├── popup.js                        # Popup functionality
│   │   ├── background.js                   # Background script
│   │   ├── images/                         # Extension icons
│   │   └── _locales/en/messages.json       # Localization
│   ├── SafariWebExtensionHandler.swift     # Swift extension handler
│   └── Info.plist                          # Extension metadata
├── Translate with Kagi/                    # macOS app container
└── Translate with Kagi.xcodeproj           # Xcode project
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
- `https://translate.kagi.com/*` - Host permission for Kagi Translate

#### Browser Compatibility
- ✅ Safari (primary target)
- ✅ Chrome (Manifest V3)
- ✅ Edge (Manifest V3)
- ✅ Firefox (Manifest V3)

## Building

1. Open `Translate with Kagi.xcodeproj` in Xcode
2. Select the "Translate with Kagi Extension" target
3. Build the project (`Product` → `Build` or `Cmd+B`)
4. The extension will be built to `build/Debug/Translate with Kagi Extension.appex`

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

## Version History

- **1.0.0** - Initial release
  - Basic Polish translation functionality
  - Safari Web Extension format
  - Manifest V3 compatibility
  - Clean popup interface
  - Dark mode support
