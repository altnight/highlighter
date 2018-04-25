async function saveToStorage(items) {
  return await browser.storage.local.set({highlighter: items})
}
async function loadFromStorage() {
  return await browser.storage.local.get('highlighter')
}