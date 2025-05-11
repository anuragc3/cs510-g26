# 🔍 Text Summarizer Chrome Extension

**CS 510 - Advanced Information Retrieval : Development Track Project**  
Team G26

A Chrome extension that uses large language models (LLMs) to extract and summarize the main content of any web page. It also retrieves related articles, definitions, and optionally provides a text-to-speech (TTS) version of the summary. Designed for researchers, students, and readers who want to quickly determine whether an article is worth their time, without switching tabs or dealing with clickbait.

---

## 🚀 Features

- 📝 **Summarize Any Web Page**: Extracts and summarizes the main content using LLM APIs (OpenAI ChatGPT, Google Gemini).
- 🎯 **Customizable Summaries**: Users can specify summary length and add optional instructions.
- 🔎 **Related Context**: Fetches definitions and related articles from third-party sources.
- 🗣️ **TTS Support**: Read summaries aloud with browser-native speech synthesis.
- 🧠 **Powered by LLMs**: Uses GPT-3.5 and Gemini APIs through secure backend integration.
- 🎨 **Clean, Animated UI**: Responsive popup interface designed for usability and accessibility.
- 🔄 **Multi-Model Support**: Easily switch or add LLMs via API key configuration.

---

## 🛠️ Setup Instructions

### 1. 🔑 Set Your API Keys

Before running the extension, you need to provide API keys for the LLM providers:

- **Open popup.html** and go to the **Settings Tab**.
- Paste your API keys:
  - OpenAI API Key (starts with `sk-`)
  - Gemini API Key (starts with `AIza`)

Your keys will be stored locally using Chrome’s extension storage.

---

### 2. 🧪 Load the Extension in Chrome

1. Clone or download this repo to your machine.
2. Open Chrome and go to:  
   `chrome://extensions/`
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked**.
5. Select the extension folder (e.g., `TextSummarizerExt/`).

---

### 3. 📌 Pin and Use the Extension

1. Pin the extension to your Chrome toolbar for easy access.
2. Navigate to any article or webpage you'd like to summarize.
3. Click the extension icon to open the popup UI.

---

## 🧭 How to Use

### 📋 Summary Panel

- Enter the **maximum number of words** you want in the summary (minimum: 100).
- (Optional) Enter any **custom instructions** (e.g., “highlight key dates” or “use bullet points”).
- Click **Fetch Summary**.
- A summary will appear in a scrollable box. If enabled, related definitions and articles will appear below.

### 🧠 Related Panel

- Automatically populated with related topics and links based on page content.

### 📚 Definitions Panel

- Displays definitions for named entities and key terms detected on the page.

### ⚙ Settings Panel

- Enter and save your API keys.
- Toggle features (coming soon).

---

## 📦 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript
- **Backend**: OpenAI API, Gemini API (via fetch requests)
- **Chrome APIs**: Manifest V3, Storage, Content Scripts, Action API
- **Additional Tools**:
  - Keyword Extraction
  - Web Speech API (for TTS)
  - Third-party search APIs (e.g., Serper)

---

## 🧪 Testing the Extension

- Try visiting:
  - A news site (e.g., [NYTimes](https://nytimes.com), [BBC](https://bbc.com))
  - A blog post or tutorial
  - A Wikipedia article
- Use the **Summary tab** to preview content.
- Experiment with custom instructions:  
  _“Use bullet points”_, _“List pros and cons”_, _“Focus on the last paragraph”_.
- Try low-vision accessibility using **TTS playback** (if enabled).

---

## 🧯 Troubleshooting

- ❌ Summary not loading?
  - Check the console (`Ctrl+Shift+J`) for network errors.
  - Ensure your API key is valid and has quota.
- 🛡️ “CORS” or “Blocked by client”?
  - Chrome extensions cannot make direct cross-origin calls unless allowed.
  - We use background scripts and proxy APIs to route requests.
- 🗣️ TTS not working?
  - Make sure browser audio is unmuted.
  - Try restarting the extension or browser.

---

## 📜 License

MIT License — feel free to use, remix, and extend with attribution.

---

## 👨‍💻 Authors

- **Anurag Choudhary** — Backend IR pipeline and system integration  
- **Hammad Ali** — Chrome extension development  
- **Manu Ravichandrakumar** — LLM prompt handling and summarization logic  
- **Sahil Bhende** — Keyword extraction and related content search

---

## 📚 References

- [Chrome Extension Developer Guide (Manifest V3)](https://developer.chrome.com/docs/extensions/mv3/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Gemini API Docs](https://ai.google.dev/)
- [Serper Search API](https://serper.dev/)
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

