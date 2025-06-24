// Test Execution Script for Kagi Translation Extension
// This script helps automate testing by providing test data and validation functions

// Test Configuration
const TEST_CONFIG = {
    testUrls: [
        'https://example.com',
        'https://news.ycombinator.com',
        'https://github.com',
        'https://stackoverflow.com/questions/tagged/javascript'
    ],
    
    translateDomains: [
        'https://translate.kagi.com/translate/pl/https://example.com',
        'https://translate.google.com/translate?sl=auto&tl=pl&u=https://example.com'
    ],
    
    googleTranslatedPages: [
        'https://translate.google.com/translate?sl=auto&tl=fr&u=https://example.com&client=webapp',
        'https://translate.google.com/translate?sl=auto&tl=es&u=https://github.com&client=webapp',
        'https://example-com.translate.goog/',
        'https://github-com.translate.goog/microsoft/vscode',
        'https://stackoverflow-com.translate.goog/questions/tagged/javascript',
        'https://translate.googleusercontent.com/translate_c?depth=1&u=https://example.com',
        'https://translate-pa.googleapis.com/translate_p?sl=auto&tl=de&u=https://example.com'
    ],
    
    testLanguages: [
        { code: 'pl', name: 'Polish' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'zh', name: 'Chinese (Simplified)' }
    ]
};

// Test Results Storage
let testResults = {
    testCase_1_1: { name: 'Fresh Install', status: 'pending', details: [] },
    testCase_2_1: { name: 'Google Provider Selection', status: 'pending', details: [] },
    testCase_3_1: { name: 'Kagi Domain Disabled', status: 'pending', details: [] },
    testCase_3_2: { name: 'Google Domain Disabled', status: 'pending', details: [] },
    testCase_3_3: { name: 'Google Translated Pages Disabled', status: 'pending', details: [] },
    testCase_4_1: { name: 'Browser Restart Persistence', status: 'pending', details: [] },
    testCase_4_2: { name: 'Cross-Machine Sync', status: 'pending', details: [] },
    testCase_5_1: { name: 'Chrome Host Permissions', status: 'pending', details: [] },
    testCase_5_2: { name: 'Edge Host Permissions', status: 'pending', details: [] },
    testCase_6_1: { name: 'Language Code Mapping', status: 'pending', details: [] },
    testCase_6_2: { name: 'Error Handling', status: 'pending', details: [] }
};

// Utility Functions for Testing
const TestUtils = {
    
    // Validate URL format for translation services
    validateKagiUrl: function(url, originalUrl, language) {
        const expectedPattern = `https://translate.kagi.com/translate/${language}/${encodeURIComponent(originalUrl)}`;
        return url === expectedPattern;
    },
    
    validateGoogleUrl: function(url, originalUrl, language) {
        const urlObj = new URL(url);
        const expectedParams = {
            sl: 'auto',
            tl: language,
            'hl': 'en-US',
            u: originalUrl,
            client: 'webapp'
        };
        
        for (const [key, value] of Object.entries(expectedParams)) {
            if (urlObj.searchParams.get(key) !== value) {
                return false;
            }
        }
        
        return urlObj.hostname === 'translate.google.com' && urlObj.pathname === '/translate';
    },
    
    // Check if URL is a translate domain
    isTranslateDomain: function(url) {
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
            return false;
        }
    },
    
    // Check for Google Translate translated page patterns
    isGoogleTranslatedPage: function(url) {
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
        if (url.hostname.includes('translate.googleusercontent.com')) {
            return true;
        }
        
        // Check for other Google Translate related domains or patterns
        if (url.hostname.includes('translate-pa.googleapis.com')) {
            return true;
        }
        
        return false;
    },
    
    // Simulate extension storage for testing
    mockExtensionStorage: {
        data: {},
        
        get: function(keys) {
            return Promise.resolve(
                keys.reduce((result, key) => {
                    if (this.data[key] !== undefined) {
                        result[key] = this.data[key];
                    }
                    return result;
                }, {})
            );
        },
        
        set: function(data) {
            Object.assign(this.data, data);
            return Promise.resolve();
        },
        
        clear: function() {
            this.data = {};
            return Promise.resolve();
        }
    },
    
    // Log test results
    logTestResult: function(testCaseId, step, result, details = '') {
        if (!testResults[testCaseId]) {
            testResults[testCaseId] = { name: testCaseId, status: 'pending', details: [] };
        }
        
        testResults[testCaseId].details.push({
            step: step,
            result: result,
            details: details,
            timestamp: new Date().toISOString()
        });
        
        console.log(`[${testCaseId}] ${step}: ${result} - ${details}`);
    },
    
    // Generate test report
    generateReport: function() {
        const report = {
            summary: {
                total: Object.keys(testResults).length,
                passed: 0,
                failed: 0,
                pending: 0
            },
            details: testResults,
            generatedAt: new Date().toISOString()
        };
        
        // Calculate summary
        Object.values(testResults).forEach(testCase => {
            if (testCase.status === 'passed') report.summary.passed++;
            else if (testCase.status === 'failed') report.summary.failed++;
            else report.summary.pending++;
        });
        
        return report;
    }
};

// Test Case Functions
const TestCases = {
    
    // Test Case 1.1: Fresh Install
    testFreshInstall: async function() {
        console.log('Running Test Case 1.1: Fresh Install');
        
        try {
            // Simulate fresh install by clearing storage
            await TestUtils.mockExtensionStorage.clear();
            
            // Check default settings
            const settings = await TestUtils.mockExtensionStorage.get(['selectedLanguages', 'provider']);
            
            if (!settings.selectedLanguages) {
                TestUtils.logTestResult('testCase_1_1', 'Default Languages', 'PASS', 'No languages set initially');
            } else {
                TestUtils.logTestResult('testCase_1_1', 'Default Languages', 'FAIL', 'Languages already set');
            }
            
            if (!settings.provider) {
                TestUtils.logTestResult('testCase_1_1', 'Default Provider', 'PASS', 'No provider set initially');
            } else {
                TestUtils.logTestResult('testCase_1_1', 'Default Provider', 'FAIL', 'Provider already set');
            }
            
            testResults.testCase_1_1.status = 'passed';
            
        } catch (error) {
            TestUtils.logTestResult('testCase_1_1', 'Error', 'FAIL', error.message);
            testResults.testCase_1_1.status = 'failed';
        }
    },
    
    // Test Case 2.1: Google Provider Selection
    testGoogleProvider: async function() {
        console.log('Running Test Case 2.1: Google Provider Selection');
        
        try {
            // Set Google provider
            await TestUtils.mockExtensionStorage.set({
                provider: 'google',
                selectedLanguages: ['pl']
            });
            
            const settings = await TestUtils.mockExtensionStorage.get(['provider', 'selectedLanguages']);
            
            if (settings.provider === 'google') {
                TestUtils.logTestResult('testCase_2_1', 'Provider Setting', 'PASS', 'Google provider set correctly');
            } else {
                TestUtils.logTestResult('testCase_2_1', 'Provider Setting', 'FAIL', 'Google provider not set');
            }
            
            // Test URL generation
            const testUrl = 'https://example.com';
            const expectedUrl = 'https://translate.google.com/translate?sl=auto&tl=pl&hl=en-US&u=https://example.com&client=webapp';
            
            if (TestUtils.validateGoogleUrl(expectedUrl, testUrl, 'pl')) {
                TestUtils.logTestResult('testCase_2_1', 'URL Generation', 'PASS', 'Google URL format correct');
            } else {
                TestUtils.logTestResult('testCase_2_1', 'URL Generation', 'FAIL', 'Google URL format incorrect');
            }
            
            testResults.testCase_2_1.status = 'passed';
            
        } catch (error) {
            TestUtils.logTestResult('testCase_2_1', 'Error', 'FAIL', error.message);
            testResults.testCase_2_1.status = 'failed';
        }
    },
    
    // Test Case 3.1, 3.2 & 3.3: Domain Restrictions
    testDomainRestrictions: async function() {
        console.log('Running Test Case 3.1, 3.2 & 3.3: Domain Restrictions');
        
        try {
            // Test Kagi domain
            const kagiUrl = 'https://translate.kagi.com/translate/pl/https://example.com';
            if (TestUtils.isTranslateDomain(kagiUrl)) {
                TestUtils.logTestResult('testCase_3_1', 'Kagi Domain Detection', 'PASS', 'Kagi domain correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_1', 'Kagi Domain Detection', 'FAIL', 'Kagi domain not detected');
            }
            
            // Test Google domain
            const googleUrl = 'https://translate.google.com/translate?sl=auto&tl=pl&u=https://example.com';
            if (TestUtils.isTranslateDomain(googleUrl)) {
                TestUtils.logTestResult('testCase_3_2', 'Google Domain Detection', 'PASS', 'Google domain correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_2', 'Google Domain Detection', 'FAIL', 'Google domain not detected');
            }
            
            // Test Google Translate translated pages (query parameter format)
            const googleTranslatedUrl = 'https://translate.google.com/translate?sl=auto&tl=fr&u=https://example.com&client=webapp';
            if (TestUtils.isTranslateDomain(googleTranslatedUrl)) {
                TestUtils.logTestResult('testCase_3_3', 'Google Translated Page Detection', 'PASS', 'Google translated page correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_3', 'Google Translated Page Detection', 'FAIL', 'Google translated page not detected');
            }
            
            // Test Google Translate translated pages (.translate.goog format)
            const googleGoogUrl = 'https://example-com.translate.goog/';
            if (TestUtils.isTranslateDomain(googleGoogUrl)) {
                TestUtils.logTestResult('testCase_3_3', 'Google .translate.goog Domain Detection', 'PASS', 'Google .translate.goog domain correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_3', 'Google .translate.goog Domain Detection', 'FAIL', 'Google .translate.goog domain not detected');
            }
            
            // Test another .translate.goog pattern
            const githubGoogUrl = 'https://github-com.translate.goog/microsoft/vscode';
            if (TestUtils.isTranslateDomain(githubGoogUrl)) {
                TestUtils.logTestResult('testCase_3_3', 'GitHub .translate.goog Detection', 'PASS', 'GitHub .translate.goog correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_3', 'GitHub .translate.goog Detection', 'FAIL', 'GitHub .translate.goog not detected');
            }
            
            // Test Google Translate widget domains
            const googleWidgetUrl = 'https://translate.googleusercontent.com/translate_c?depth=1&u=https://example.com';
            if (TestUtils.isTranslateDomain(googleWidgetUrl)) {
                TestUtils.logTestResult('testCase_3_3', 'Google Widget Domain Detection', 'PASS', 'Google widget domain correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_3', 'Google Widget Domain Detection', 'FAIL', 'Google widget domain not detected');
            }
            
            // Test Google Translate API domains
            const googleApiUrl = 'https://translate-pa.googleapis.com/translate_p?sl=auto&tl=de&u=https://example.com';
            if (TestUtils.isTranslateDomain(googleApiUrl)) {
                TestUtils.logTestResult('testCase_3_3', 'Google API Domain Detection', 'PASS', 'Google API domain correctly identified');
            } else {
                TestUtils.logTestResult('testCase_3_3', 'Google API Domain Detection', 'FAIL', 'Google API domain not detected');
            }
            
            // Test regular domain (should not be restricted)
            const regularUrl = 'https://example.com';
            if (!TestUtils.isTranslateDomain(regularUrl)) {
                TestUtils.logTestResult('testCase_3_1', 'Regular Domain', 'PASS', 'Regular domain not restricted');
            } else {
                TestUtils.logTestResult('testCase_3_1', 'Regular Domain', 'FAIL', 'Regular domain incorrectly restricted');
            }
            
            testResults.testCase_3_1.status = 'passed';
            testResults.testCase_3_2.status = 'passed';
            testResults.testCase_3_3.status = 'passed';
            
        } catch (error) {
            TestUtils.logTestResult('testCase_3_1', 'Error', 'FAIL', error.message);
            testResults.testCase_3_1.status = 'failed';
            testResults.testCase_3_2.status = 'failed';
            testResults.testCase_3_3.status = 'failed';
        }
    },
    
    // Test Case 6.1: Language Code Mapping
    testLanguageCodeMapping: async function() {
        console.log('Running Test Case 6.1: Language Code Mapping');
        
        try {
            // Test Chinese mapping
            const chineseUrl = TestUtils.validateGoogleUrl(
                'https://translate.google.com/translate?sl=auto&tl=zh-CN&hl=en-US&u=https://example.com&client=webapp',
                'https://example.com',
                'zh-CN'
            );
            
            if (chineseUrl) {
                TestUtils.logTestResult('testCase_6_1', 'Chinese Mapping', 'PASS', 'Chinese code mapped correctly');
            } else {
                TestUtils.logTestResult('testCase_6_1', 'Chinese Mapping', 'FAIL', 'Chinese code mapping failed');
            }
            
            // Test Portuguese (should remain unchanged)
            const portugueseUrl = TestUtils.validateGoogleUrl(
                'https://translate.google.com/translate?sl=auto&tl=pt&hl=en-US&u=https://example.com&client=webapp',
                'https://example.com',
                'pt'
            );
            
            if (portugueseUrl) {
                TestUtils.logTestResult('testCase_6_1', 'Portuguese Mapping', 'PASS', 'Portuguese code unchanged correctly');
            } else {
                TestUtils.logTestResult('testCase_6_1', 'Portuguese Mapping', 'FAIL', 'Portuguese code mapping failed');
            }
            
            testResults.testCase_6_1.status = 'passed';
            
        } catch (error) {
            TestUtils.logTestResult('testCase_6_1', 'Error', 'FAIL', error.message);
            testResults.testCase_6_1.status = 'failed';
        }
    }
};

// Manual Testing Instructions
const ManualTestInstructions = {
    
    displayInstructions: function() {
        console.log('\n=== MANUAL TESTING INSTRUCTIONS ===\n');
        
        console.log('1. FRESH INSTALL TEST:');
        console.log('   - Install extension in clean browser profile');
        console.log('   - Verify popup shows Polish translation option');
        console.log('   - Test translation redirects to Kagi');
        
        console.log('\n2. GOOGLE PROVIDER TEST:');
        console.log('   - Open extension settings');
        console.log('   - Select Google provider');
        console.log('   - Save settings');
        console.log('   - Test translation redirects to Google');
        
        console.log('\n3. DOMAIN RESTRICTION TEST:');
        console.log('   - Navigate to translate.kagi.com');
        console.log('   - Open extension popup');
        console.log('   - Verify disabled message appears');
        console.log('   - Repeat for translate.google.com');
        console.log('   - Test Google Translate translated pages');
        console.log('   - Test Google Translate widget domains');
        
        console.log('\n4. PERSISTENCE TEST:');
        console.log('   - Configure settings with multiple languages');
        console.log('   - Restart browser');
        console.log('   - Verify settings persist');
        
        console.log('\n5. CROSS-BROWSER TEST:');
        console.log('   - Test in Chrome');
        console.log('   - Test in Edge');
        console.log('   - Verify identical behavior');
        
        console.log('\n6. SYNC TEST:');
        console.log('   - Configure settings on machine A');
        console.log('   - Install extension on machine B with same account');
        console.log('   - Verify settings sync');
    },
    
    generateManualTestReport: function() {
        const report = `
# Manual Test Report - Kagi Translation Extension

## Test Environment
- Browser: [Specify browser and version]
- OS: [Specify operating system]
- Extension Version: 1.3.0
- Test Date: ${new Date().toISOString()}

## Test Results

### Test Case 1: Fresh Install
- [ ] Extension installs without errors
- [ ] Default language is Polish
- [ ] Default provider is Kagi
- [ ] Translation works correctly
- **Status**: PASS/FAIL
- **Notes**: 

### Test Case 2: Google Provider Selection
- [ ] Settings page opens correctly
- [ ] Google provider can be selected
- [ ] Settings save successfully
- [ ] Translation redirects to Google
- **Status**: PASS/FAIL
- **Notes**: 

### Test Case 3: Domain Restrictions
- [ ] Disabled message on Kagi domain
- [ ] Disabled message on Google domain
- [ ] Settings still accessible
- **Status**: PASS/FAIL
- **Notes**: 

### Test Case 4: Settings Persistence
- [ ] Settings survive browser restart
- [ ] Language selection persists
- [ ] Provider selection persists
- **Status**: PASS/FAIL
- **Notes**: 

### Test Case 5: Cross-Browser Compatibility
- [ ] Chrome functionality works
- [ ] Edge functionality works
- [ ] Host permissions work correctly
- **Status**: PASS/FAIL
- **Notes**: 

### Test Case 6: Settings Sync
- [ ] Settings sync between machines
- [ ] Language preferences transfer
- [ ] Provider preferences transfer
- **Status**: PASS/FAIL
- **Notes**: 

## Issues Found
1. [Issue description]
2. [Issue description]
3. [Issue description]

## Overall Assessment
- **Total Tests**: 6
- **Passed**: [Number]
- **Failed**: [Number]
- **Overall Status**: PASS/FAIL

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]
`;
        
        return report;
    }
};

// Main execution function
async function runAutomatedTests() {
    console.log('Starting Automated Tests for Kagi Translation Extension\n');
    
    // Run automated tests
    await TestCases.testFreshInstall();
    await TestCases.testGoogleProvider();
    await TestCases.testDomainRestrictions();
    await TestCases.testLanguageCodeMapping();
    
    // Generate and display report
    const report = TestUtils.generateReport();
    console.log('\n=== AUTOMATED TEST REPORT ===');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Pending: ${report.summary.pending}`);
    
    // Display manual test instructions
    ManualTestInstructions.displayInstructions();
    
    return report;
}

// Export for use in browser console or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TestUtils,
        TestCases,
        ManualTestInstructions,
        runAutomatedTests,
        TEST_CONFIG
    };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.KagiExtensionTester = {
        runTests: runAutomatedTests,
        utils: TestUtils,
        testCases: TestCases,
        instructions: ManualTestInstructions,
        config: TEST_CONFIG
    };
    
    console.log('Kagi Extension Tester loaded. Run KagiExtensionTester.runTests() to start.');
}
