import { getRulesForWebsite } from './websiteRules.js';

function extractTextFromElements(elements) {
    return Array.from(elements)
        .map(element => element.textContent.trim())
        .filter(text => text.length > 0)
        .join('\n\n');
}

function extractBBCContent(selectors) {
    const elements = [];
    selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        elements.push(...found);
    });
    return extractTextFromElements(elements);
}

function extractGenericContent() {
    // Try to find the main content using common selectors
    const selectors = [
        'article',
        'main',
        '.article-content',
        '.story-content',
        '.post-content'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            // Extract all paragraph texts from the main content
            const paragraphs = element.querySelectorAll('p');
            if (paragraphs.length > 0) {
                return extractTextFromElements(paragraphs);
            }
            return element.textContent.trim();
        }
    }

    // Fallback: collect all paragraphs from the page
    const paragraphs = document.querySelectorAll('p');
    return extractTextFromElements(paragraphs);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractText") {
        const rules = getRulesForWebsite(request.url);
        let extractedText = '';

        if (rules.extractionMethod === 'querySelector') {
            extractedText = extractBBCContent(rules.selectors);
        } else {
            extractedText = extractGenericContent();
        }

        sendResponse({ 
            text: extractedText,
            source: rules.name
        });
    }
    return true; // Required for async response
});
