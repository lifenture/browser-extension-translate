browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);

    if (request.greeting === "hello")
        return Promise.resolve({ farewell: "goodbye" });
});

// Handle toolbar icon clicks (when not using popup)
browser.action.onClicked.addListener(async (tab) => {
    if (!tab || !tab.url) return;
    const target = 'https://translate.kagi.com/translate/pl/' + encodeURIComponent(tab.url);
    await browser.tabs.update(tab.id, { url: target });
});
