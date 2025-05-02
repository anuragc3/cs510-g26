# cs510-g26
CS 510 - Advanced Information Retrieval - Development Track Project

Text Summarizer Chrome Extension

A Chrome extension to extract and summarize the text content of any web page using LLMs (Large Language Models) such as OpenAI GPT-3.5. Easily extendable to support multiple models and features a modern, animated UI.

Features
    * 📝 Extracts all visible text from the current web page
    * 🤖 Summarizes content using LLMs (e.g., OpenAI GPT-3.5)
    * ✨ Beautiful, animated popup UI
    * 🔄 Easily extensible to support multiple LLMs
    * ➕ Add more models with a single click

How to Build and Run

1. Set up your API key:
    * Open popup.js.
    * Replace
    ``` const LLM_API_KEY = "YOUR_OPENAI_API_KEY"; ```
    with your actual OpenAI API key.

2. Load the extension in Chrome:
    * Go to chrome://extensions/ in your Chrome browser.
    * Enable Developer mode (toggle in the top right).
    * Click Load unpacked.
    * Select your extension folder (e.g., TextSummarizerExt).

3. Pin and use the extension:
    * Pin the extension to your Chrome toolbar for easy access.
    * Navigate to any web page.
    * Click the extension icon to open the popup.
    * Click Summarize Page to extract and summarize the page’s text.
