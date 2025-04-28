// listens for messages from popup.js to extract text

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    // extract all visibl text from the curr html page
    let text = document.body.innerText;
    sendResponse({ text });
  }
});
