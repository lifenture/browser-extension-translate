// Chromium polyfill for browser API
if (typeof browser === 'undefined') {
    window.browser = chrome;
}