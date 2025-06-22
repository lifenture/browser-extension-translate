document.getElementById('translate-btn').addEventListener('click', async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;
  const target = 'https://translate.kagi.com/translate/pl/' + encodeURIComponent(tab.url);
  await browser.tabs.update(tab.id, { url: target });
  window.close();           // close popup after redirect
});
