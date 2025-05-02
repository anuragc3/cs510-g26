// Website-specific rules for text extraction
const websiteRules = {
    'bbc.co.uk': {
        selectors: [
            'article [data-component="text-block"]',
            'article [data-component="byline-block"]',
            'article [data-component="headline-block"]'
        ],
        extractionMethod: 'querySelector',
        name: 'BBC News'
    },
    // Default fallback rule
    'default': {
        selectors: ['article', 'p', '.article-content', '.story-content'],
        extractionMethod: 'generic',
        name: 'Generic Website'
    }
};

// Function to get rules for a specific website
function getRulesForWebsite(url) {
    const hostname = new URL(url).hostname;
    for (const domain in websiteRules) {
        if (hostname.includes(domain)) {
            return websiteRules[domain];
        }
    }
    return websiteRules.default;
}

// Export the functions and rules
export { websiteRules, getRulesForWebsite }; 