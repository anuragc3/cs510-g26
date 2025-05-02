
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticleContent") {
      const articleText = document.body.innerText || "";
      sendResponse({ text: articleText.slice(0, 3000) }); // truncate to avoid max tokens
    }
  });
  