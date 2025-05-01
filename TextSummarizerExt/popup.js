const summarizeBtn = document.getElementById('summarizeBtn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const summariesDiv = document.getElementById('summaries');

const summaryLengthInput = document.getElementById('summaryLength');
const lengthTypeSelect = document.getElementById('lengthType');
const maxTokensInput = document.getElementById('maxTokens');
const customPromptInput = document.getElementById('customPrompt');

let models = [
  { name: "OpenAI GPT-3.5", id: "gpt-3.5" } // TODO: Add more models / diff chatgpt models
];

// Replace with your actual LLM API endpoint and key
const LLM_API_URL = "https://api.openai.com/v1/chat/completions";
const LLM_API_KEY = "YOUR_OPENAI_API_KEY"; // Store securely in production!

function showLoading(show) {
  loadingDiv.classList.toggle('hidden', !show);
  summarizeBtn.disabled = show;
}

function showResults(show) {
  resultsDiv.classList.toggle('hidden', !show);
}

function renderSummaries(summaries) {
  summariesDiv.innerHTML = '';
  summaries.forEach(({ model, summary }) => {
    const card = document.createElement('div');
    card.className = 'summary-card';
    card.innerHTML = `<strong>${model}</strong><br>${summary}`;
    summariesDiv.appendChild(card);
  });
}

function buildPrompt() {
  const summaryLength = summaryLengthInput.value;
  const lengthType = lengthTypeSelect.value;
  const customPrompt = customPromptInput.value.trim();

  // TODO: Add more detailed prompt to ask LLM to : 1. summarize the text
  // 2.ask for relevant articles to read based on the text
  // 3. ask for acronyms and their meanings based on the text provided, if any
  // 4. send the data in a structured json format, we can parse it to display the response in the popup

  let prompt = customPrompt || "Summarize the following text.";
  if (summaryLength) {
    prompt += ` Limit the summary to ${summaryLength} ${lengthType}.`;
  }
  return prompt;
}

function getMaxTokens() {
  const maxTokens = maxTokensInput.value;
  return maxTokens ? parseInt(maxTokens) : 300;
}

async function summarizeText(text, model, prompt, maxTokens) {
  // For OpenAI API
  // Will adapt for other LLMs

  const response = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LLM_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text }
      ],
      max_tokens: maxTokens
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No summary available.";
}

async function handleEmptyText(tab) {
  const result = await new Promise((resolve) => {
    const message = 'No text could be extracted directly. Would you like to continue ? This would use additional resources to extract the text.';
    if (confirm(message)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });

  if (result) {
    return {
      text: `Please summarize the content from this URL: ${tab.url}`,
      isUrlOnly: true
    };
  }
  return null;
}

summarizeBtn.addEventListener('click', async () => {
  showLoading(true);
  showResults(false);

  const prompt = buildPrompt();
  const maxTokens = getMaxTokens();

  // Get active tab and send message to content.js
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const currentTab = tabs[0];
    
    try {
      const response = await chrome.tabs.sendMessage(
        currentTab.id,
        { 
          action: "extractText",
          url: currentTab.url
        }
      );

      let textData;
      if (!response || !response.text || response.text.trim() === '') {
        textData = await handleEmptyText(currentTab);
        if (!textData) {
          showLoading(false);
          return;
        }
      } else {
        textData = response;
      }

      let summaries = [];
      for (const model of models) {
        const summary = await summarizeText(textData.text, model, prompt, maxTokens);
        summaries.push({ 
          model: model.name, 
          summary,
          isUrlOnly: textData.isUrlOnly || false 
        });
      }
      
      renderSummaries(summaries);
      showLoading(false);
      showResults(true);
    } catch (error) {
      console.error('Error during summarization:', error);
      showLoading(false);
      alert('An error occurred while trying to summarize the content. Please try again.');
    }
  });
});
