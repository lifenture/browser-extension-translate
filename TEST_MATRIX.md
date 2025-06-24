# Kagi Translation Extension - Test Matrix

## Test Environment Setup

### Browsers to Test
- [ ] Chrome (latest stable)
- [ ] Chrome Beta
- [ ] Edge (latest stable) 
- [ ] Firefox (if applicable)

### Test Data
- **Test URLs**: 
  - `https://example.com`
  - `https://news.ycombinator.com`
  - `https://github.com`
  - `https://stackoverflow.com/questions/tagged/javascript`
- **Translation Service URLs**:
  - `https://translate.kagi.com/translate/pl/https://example.com`
  - `https://translate.google.com/translate?sl=auto&tl=pl&u=https://example.com`

---

## 1. Fresh Install → Default Kagi Behaviour Unchanged

### Test Case 1.1: Fresh Extension Installation
**Objective**: Verify that a fresh installation maintains default Kagi behavior without any regressions.

#### Test Steps:
1. **Install Extension**
   - [ ] Install extension from unpacked source
   - [ ] Verify extension appears in browser toolbar
   - [ ] Verify extension icon is visible and clickable

2. **Check Default Settings**
   - [ ] Open extension popup on any regular webpage
   - [ ] Verify default language is Polish (pl)
   - [ ] Verify default provider is Kagi
   - [ ] Verify "Translate to Polish" button appears

3. **Test Default Translation**
   - [ ] Navigate to `https://example.com`
   - [ ] Click extension popup
   - [ ] Click "Translate to Polish" button
   - [ ] **Expected**: Redirects to `https://translate.kagi.com/translate/pl/https://example.com`
   - [ ] **Verify**: URL format is correct
   - [ ] **Verify**: Page loads successfully

4. **Test Toolbar Click**
   - [ ] Navigate to `https://news.ycombinator.com`
   - [ ] Click extension toolbar icon directly (not popup)
   - [ ] **Expected**: Redirects to `https://translate.kagi.com/translate/pl/https://news.ycombinator.com`

#### Expected Results:
- [ ] Extension installs without errors
- [ ] Default language selection is Polish
- [ ] Default provider is Kagi
- [ ] Translation URLs use Kagi format
- [ ] No behavioral changes from previous versions

---

## 2. Select Google in Settings

### Test Case 2.1: Google Provider Selection
**Objective**: Verify that selecting Google in settings properly configures the extension to use Google Translate.

#### Test Steps:

1. **Access Settings**
   - [ ] Click extension popup
   - [ ] Click "⚙️ Settings" button
   - [ ] **Expected**: Opens options.html in new tab

2. **Change Provider to Google**
   - [ ] Locate provider selection radio buttons
   - [ ] Select "Google" radio button
   - [ ] **Verify**: Google option is selected
   - [ ] **Verify**: Save button becomes enabled
   - [ ] Click "💾 Save Settings"
   - [ ] **Expected**: Shows "✅ Saved" confirmation
   - [ ] **Expected**: Settings page closes after 1.5 seconds

3. **Test Popup Translation Buttons**
   - [ ] Navigate to `https://stackoverflow.com/questions/tagged/javascript`
   - [ ] Open extension popup
   - [ ] Click "Translate to Polish" button
   - [ ] **Expected**: Redirects to Google Translate with correct URL format:
     ```
     https://translate.google.com/translate?sl=auto&tl=pl&hl=en-US&u=https://stackoverflow.com/questions/tagged/javascript&client=webapp
     ```
   - [ ] **Verify**: URL parameters are correct
   - [ ] **Verify**: Page loads Google Translate interface

4. **Test Toolbar Click with Google**
   - [ ] Navigate to `https://github.com`
   - [ ] Click extension toolbar icon directly
   - [ ] **Expected**: Redirects to Google Translate with correct URL format:
     ```
     https://translate.google.com/translate?sl=auto&tl=pl&hl=en-US&u=https://github.com&client=webapp
     ```

#### Expected Results:
- [ ] Settings page opens correctly
- [ ] Provider selection works
- [ ] Settings save successfully
- [ ] Popup buttons redirect to Google Translate
- [ ] Toolbar clicks redirect to Google Translate
- [ ] URL format matches Google Translate requirements

---

## 3. Extension Popup Shows Disabled Message on Translate Domains

### Test Case 3.1: Disabled on Kagi Translate Domain
**Objective**: Verify extension shows disabled message when on Kagi translate domain.

#### Test Steps:
1. **Navigate to Kagi Translate**
   - [ ] Go to `https://translate.kagi.com/translate/pl/https://example.com`
   - [ ] Click extension popup
   - [ ] **Expected**: Popup shows disabled message

2. **Verify Disabled Message Content**
   - [ ] **Verify**: Message icon shows ⚠️
   - [ ] **Verify**: Title: "Extension Disabled on translation site"
   - [ ] **Verify**: Description: "This extension cannot be used on translation service pages to prevent conflicts."
   - [ ] **Verify**: Hint: "Navigate to another page to use the translation feature."

3. **Verify Settings Still Accessible**
   - [ ] **Verify**: "⚙️ Settings" button is still present
   - [ ] Click settings button
   - [ ] **Expected**: Settings page opens normally

#### Expected Results:
- [ ] Disabled message appears on Kagi translate domain
- [ ] Message content is clear and informative
- [ ] Settings remain accessible
- [ ] No translation buttons are shown

### Test Case 3.2: Disabled on Google Translate Domain
**Objective**: Verify extension shows disabled message when on Google translate domain.

#### Test Steps:
1. **Navigate to Google Translate**
   - [ ] Go to `https://translate.google.com/translate?sl=auto&tl=pl&u=https://example.com`
   - [ ] Click extension popup
   - [ ] **Expected**: Popup shows disabled message

2. **Verify Same Disabled Message**
   - [ ] **Verify**: Same disabled message as Kagi domain
   - [ ] **Verify**: Settings button still present and functional

#### Expected Results:
- [ ] Disabled message appears on Google translate domain
- [ ] Behavior is identical to Kagi domain
- [ ] Settings remain accessible

### Test Case 3.3: Disabled on Google Translate Translated Pages
**Objective**: Verify extension shows disabled message when viewing a page already translated through Google Translate.

#### Test Steps:
1. **Navigate to Pre-Translated Page**
   - [ ] Go to `https://translate.google.com/translate?sl=auto&tl=fr&u=https://example.com&client=webapp`
   - [ ] Wait for Google Translate to load the translated page
   - [ ] Click extension popup
   - [ ] **Expected**: Popup shows disabled message

2. **Test Different Google Translate URL Patterns**
   - [ ] Test with different target languages (Spanish, German, etc.)
   - [ ] Test with different source websites
   - [ ] **Verify**: Extension consistently detects translated pages

3. **Test Google Translate .translate.goog Domains**
   - [ ] Navigate to `https://example-com.translate.goog/`
   - [ ] Click extension popup
   - [ ] **Expected**: Popup shows disabled message
   - [ ] Navigate to `https://github-com.translate.goog/microsoft/vscode`
   - [ ] Click extension popup
   - [ ] **Expected**: Popup shows disabled message

4. **Test Google Translate Widget/Frame Patterns**
   - [ ] Navigate to any page with Google Translate widget enabled
   - [ ] If translate.googleusercontent.com URLs are encountered, verify extension is disabled
   - [ ] **Expected**: Extension detects and disables on Google Translate widget pages

#### Expected Results:
- [ ] Disabled message appears on Google Translate translated pages
- [ ] Detection works for various URL patterns
- [ ] Extension prevents double-translation attempts
- [ ] Behavior is consistent with other translate domains

---

## 4. Settings Persist After Browser Restart and Across Machines (Sync)

### Test Case 4.1: Settings Persistence After Browser Restart
**Objective**: Verify settings are maintained after browser restart.

#### Test Steps:
1. **Configure Settings**
   - [ ] Set provider to Google
   - [ ] Change selected languages to: Spanish (es), French (fr), German (de)
   - [ ] Save settings
   - [ ] **Verify**: Settings are saved successfully

2. **Test Settings Before Restart**
   - [ ] Open extension popup
   - [ ] **Verify**: Shows buttons for Spanish, French, German
   - [ ] Test translation with Spanish
   - [ ] **Expected**: Uses Google Translate

3. **Restart Browser**
   - [ ] Close browser completely
   - [ ] Reopen browser
   - [ ] Navigate to test page

4. **Verify Settings Persist**
   - [ ] Open extension popup
   - [ ] **Verify**: Still shows Spanish, French, German buttons
   - [ ] **Verify**: Provider is still Google
   - [ ] Test translation with French
   - [ ] **Expected**: Still uses Google Translate

#### Expected Results:
- [ ] Settings survive browser restart
- [ ] Language selection persists
- [ ] Provider selection persists
- [ ] Functionality remains unchanged

### Test Case 4.2: Settings Sync Across Machines
**Objective**: Verify settings sync across different browser instances (if sync is enabled).

#### Test Steps:
1. **Setup Machine A**
   - [ ] Sign into browser with sync account
   - [ ] Configure extension: Google provider, languages: Italian (it), Portuguese (pt)
   - [ ] Save settings
   - [ ] **Verify**: Settings work on Machine A

2. **Setup Machine B**
   - [ ] Sign into browser with same sync account
   - [ ] Install same extension
   - [ ] Wait for sync (or force sync)
   - [ ] Open extension popup

3. **Verify Sync**
   - [ ] **Verify**: Languages show Italian, Portuguese
   - [ ] **Verify**: Provider is Google
   - [ ] Test translation functionality
   - [ ] **Expected**: Uses Google Translate

#### Expected Results:
- [ ] Settings sync between machines
- [ ] Language preferences transfer
- [ ] Provider preferences transfer
- [ ] Functionality works identically

---

## 5. Chrome/Edge Tests to Ensure Host Permission Addition Works

### Test Case 5.1: Chrome Host Permissions
**Objective**: Verify extension works properly in Chrome with host permissions.

#### Test Steps:
1. **Install in Chrome**
   - [ ] Load extension in Chrome
   - [ ] **Verify**: Extension requests correct permissions
   - [ ] **Verify**: Host permissions include:
     - `https://translate.kagi.com/*`
     - `https://translate.google.com/*`

2. **Test Kagi Functionality**
   - [ ] Set provider to Kagi
   - [ ] Test translation to various domains
   - [ ] **Verify**: Redirects work correctly
   - [ ] **Verify**: No permission errors

3. **Test Google Functionality**
   - [ ] Set provider to Google
   - [ ] Test translation to various domains
   - [ ] **Verify**: Redirects work correctly
   - [ ] **Verify**: No permission errors

4. **Test on Restricted Domains**
   - [ ] Navigate to `https://translate.kagi.com/translate/pl/https://example.com`
   - [ ] **Verify**: Extension popup shows disabled message
   - [ ] Navigate to `https://translate.google.com/translate?sl=auto&tl=pl&u=https://example.com`
   - [ ] **Verify**: Extension popup shows disabled message

#### Expected Results:
- [ ] Extension installs successfully in Chrome
- [ ] Host permissions are correctly configured
- [ ] Both Kagi and Google translations work
- [ ] Domain restrictions work correctly

### Test Case 5.2: Edge Host Permissions
**Objective**: Verify extension works properly in Edge with host permissions.

#### Test Steps:
1. **Install in Edge**
   - [ ] Load extension in Edge
   - [ ] **Verify**: Extension requests correct permissions
   - [ ] **Verify**: Host permissions include both translate domains

2. **Test Complete Functionality**
   - [ ] Repeat all tests from Chrome
   - [ ] **Verify**: Settings page works
   - [ ] **Verify**: Provider switching works
   - [ ] **Verify**: Language selection works
   - [ ] **Verify**: Translation redirects work
   - [ ] **Verify**: Domain restrictions work

#### Expected Results:
- [ ] Extension works identically in Edge
- [ ] All Chrome functionality is preserved
- [ ] No Edge-specific issues

---

## 6. Additional Edge Cases and Error Scenarios

### Test Case 6.1: Language Code Mapping
**Objective**: Verify language codes are properly mapped for Google Translate.

#### Test Steps:
1. **Test Chinese Languages**
   - [ ] Set provider to Google
   - [ ] Add Chinese (Simplified) - zh
   - [ ] Test translation
   - [ ] **Expected**: URL contains `tl=zh-CN`

2. **Test Special Mappings**
   - [ ] Test Portuguese - pt
   - [ ] **Expected**: URL contains `tl=pt` (no change)
   - [ ] Test any other special mappings defined in `mapCodeForGoogle()`

#### Expected Results:
- [ ] Language codes are correctly mapped for Google
- [ ] Chinese variants work correctly
- [ ] Standard codes remain unchanged

### Test Case 6.2: Error Handling
**Objective**: Verify extension handles errors gracefully.

#### Test Steps:
1. **Test with No Languages Selected**
   - [ ] Clear all selected languages
   - [ ] Click toolbar icon
   - [ ] **Expected**: Opens settings page
   - [ ] **Verify**: No errors in console

2. **Test with Invalid URLs**
   - [ ] Navigate to `about:blank`
   - [ ] Try to use extension
   - [ ] **Verify**: No errors, graceful handling

3. **Test Storage Errors**
   - [ ] Temporarily disable storage access (if possible)
   - [ ] **Verify**: Falls back to defaults
   - [ ] **Verify**: No crashes

#### Expected Results:
- [ ] Extension handles errors gracefully
- [ ] Appropriate fallbacks are used
- [ ] No console errors or crashes

---

## Test Completion Checklist

### Pre-Test Setup
- [ ] Extension source code is ready
- [ ] Test browsers are installed and updated
- [ ] Test accounts for sync testing are prepared
- [ ] Test URLs are accessible

### Testing Process
- [ ] All test cases executed
- [ ] Results documented
- [ ] Issues identified and reported
- [ ] Regression tests passed

### Post-Test Validation
- [ ] Extension works in all target browsers
- [ ] All settings persist correctly
- [ ] All translation services work
- [ ] Domain restrictions function properly
- [ ] Sync functionality works (where applicable)

---

## Test Results Summary

### Pass/Fail Status
- [ ] Test Case 1.1: Fresh Install - PASS/FAIL
- [ ] Test Case 2.1: Google Provider - PASS/FAIL  
- [ ] Test Case 3.1: Kagi Domain Disabled - PASS/FAIL
- [ ] Test Case 3.2: Google Domain Disabled - PASS/FAIL
- [ ] Test Case 4.1: Browser Restart Persistence - PASS/FAIL
- [ ] Test Case 4.2: Cross-Machine Sync - PASS/FAIL
- [ ] Test Case 5.1: Chrome Host Permissions - PASS/FAIL
- [ ] Test Case 5.2: Edge Host Permissions - PASS/FAIL
- [ ] Test Case 6.1: Language Code Mapping - PASS/FAIL
- [ ] Test Case 6.2: Error Handling - PASS/FAIL

### Issues Found
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]
- [ ] Issue 3: [Description]

### Recommendations
- [ ] Recommendation 1: [Description]
- [ ] Recommendation 2: [Description]
- [ ] Recommendation 3: [Description]
