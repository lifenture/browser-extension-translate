// Shared support configuration and utilities
// This file exports common support functionality used by both popup.js and options.js

// Support configuration constants
const SUPPORT_CONFIG = {
    paymentLink: 'https://buy.stripe.com/4gM28s2xy07wfyV62nfw400',
    productName: 'Support Translate Extension Development',
    buttonText: '❤️ Support Project'
};

/**
 * Opens the Stripe checkout page in a new tab
 * @param {Object} config - Optional configuration object to override defaults
 * @param {function} showNotification - Optional notification function for feedback
 */
function openStripeCheckout(config = {}, showNotification = null) {
    try {
        // Merge provided config with defaults
        const finalConfig = { ...SUPPORT_CONFIG, ...config };
        const paymentLink = finalConfig.paymentLink;
        
        if (paymentLink) {
            // Open Stripe payment link in a new tab
            browser.tabs.create({ url: paymentLink });
            
            // Show notification if function is provided
            if (showNotification && typeof showNotification === 'function') {
                showNotification(`Opening ${finalConfig.productName}...`, 'success');
            } else {
                console.log(`Opening ${finalConfig.productName}...`);
            }
        } else {
            const errorMsg = 'Stripe payment link not configured';
            console.error(errorMsg);
            
            if (showNotification && typeof showNotification === 'function') {
                showNotification('Support page not available', 'error');
            }
        }
    } catch (error) {
        const errorMsg = 'Failed to open Stripe payment page:';
        console.error(errorMsg, error);
        
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to open support page', 'error');
        }
    }
}

// Make functions and config available globally for browser extension
window.SUPPORT_CONFIG = SUPPORT_CONFIG;
window.openStripeCheckout = openStripeCheckout;
