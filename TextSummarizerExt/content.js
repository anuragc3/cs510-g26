
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "getArticleContent") {
//       const articleText = document.body.innerText || "";
//       console.log(articleText.slice(0, 3000));
//       sendResponse({ text: articleText.slice(0, 3000) }); // truncate to avoid max tokens
//     }
//   });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getArticleContent") {
    try {
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone).parse();
      console.log(article.textContent.slice(0, 3000));

      if (article && article.textContent) {
        sendResponse({ text: article.textContent.slice(0, 3000) }); // truncate for token safety
      } else {
        sendResponse({ text: "" });
      }
    } catch (e) {
      console.error("Readability parsing error:", e);
      sendResponse({ text: "" });
    }
    return true; // Keep the message channel open for async response
  }
});
  