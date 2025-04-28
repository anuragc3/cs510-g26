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

summarizeBtn.addEventListener('click', async () => {
  showLoading(true);
  showResults(false);

  const prompt = buildPrompt();
  const maxTokens = getMaxTokens();

  // Get active tab and send message to content.js
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "extractText" },
      async (response) => {
        if (!response || !response.text) {
          showLoading(false);
          alert("Could not extract text from this page.");
          return;
        }
        let summaries = [];
        for (const model of models) {
          const summary = await summarizeText(response.text, model, prompt, maxTokens);
          summaries.push({ model: model.name, summary });
        }
        renderSummaries(summaries);
        showLoading(false);
        showResults(true);
      }
    );
  });
});
