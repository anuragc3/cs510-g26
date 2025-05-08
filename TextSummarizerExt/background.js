chrome.runtime.onInstalled.addListener(() => {
  console.log("Text Summarizer extension installed");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url && tab.url.startsWith("http")) {
    const key = `data_${tabId}_${encodeURIComponent(tab.url)}`;
    chrome.storage.local.remove(key, () => {
      console.log(`Cleared cached data for ${tab.url}`);
    });
  }
});


// Clean cache on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(null, (items) => {
    const keysToRemove = Object.keys(items).filter(key =>
      key.startsWith(`data_${tabId}_`)
    );
    chrome.storage.local.remove(keysToRemove);
  });
});