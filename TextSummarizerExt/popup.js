const SERPER_API_KEY = "765b88e9b8c90b502debcd06edbbae8b5426e992";

document.addEventListener("DOMContentLoaded", () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.storage.local.get([`data_${tabId}_${encodeURIComponent(tabs[0].url)}`], (result) => {
      const saved = result[`data_${tabId}_${encodeURIComponent(tabs[0].url)}`];
      if (saved) {
        // Rehydrate UI
        document.getElementById("summary-content").innerHTML = saved.summary.map(r =>
          `<div class="mb-4"><h3 class="font-bold">${r.source}</h3>
            <div>${r.summary}</div></div>`).join("");

        document.getElementById("tts-controls").classList.remove("hidden");
        setupTTSControls("#summary-content");

        document.getElementById("definitions-content").innerHTML = saved.definitions.map(r =>
          `<div class="mb-4"><h3 class="font-bold">${r.source}</h3>
            ${(r.definitions || []).map(d => `<div><strong>${d.term}:</strong> ${d.definition}</div>`).join("")}
          </div>`).join("");

        document.getElementById("related-content").innerHTML = saved.related.map(link =>
          `<li><a href="${link.link}" target="_blank" class="text-blue-600 underline">${link.title}</a></li>`).join("");
      }
    });
    document.getElementById("tab-summary").click();
  });

  const tabs = ["summary", "related", "definitions", "settings"];

  tabs.forEach(tab => {
    document.getElementById("tab-" + tab).addEventListener("click", () => {
      tabs.forEach(t => {
        document.getElementById("panel-" + t).classList.add("hidden");
        document.getElementById("tab-" + t).classList.remove("border-b-2", "border-indigo-600");
      });
      document.getElementById("panel-" + tab).classList.remove("hidden");
      document.getElementById("tab-" + tab).classList.add("border-b-2", "border-indigo-600");
    });
  });

  const openaiInput = document.getElementById("apiKeyOpenAI");
  const geminiInput = document.getElementById("apiKeyGemini");
  const saveBtn = document.getElementById("saveKeyBtn");
  const saveStatus = document.getElementById("saveStatus");

  chrome.storage.local.get(["openai_api_key", "gemini_api_key"], (result) => {
    if (result.openai_api_key) openaiInput.value = result.openai_api_key;
    if (result.gemini_api_key) geminiInput.value = result.gemini_api_key;
  });

  saveBtn.addEventListener("click", () => {
    const openaiKey = openaiInput.value.trim();
    const geminiKey = geminiInput.value.trim();
    const items = {};
    if (openaiKey.startsWith("sk-")) items.openai_api_key = openaiKey;
    if (geminiKey) items.gemini_api_key = geminiKey;
    chrome.storage.local.set(items, () => {
      saveStatus.classList.remove("hidden");
      setTimeout(() => saveStatus.classList.add("hidden"), 2000);
    });
  });

  document.getElementById("fetch-btn").addEventListener("click", () => {
    document.getElementById("summary-content").innerHTML = "Loading...";
    document.getElementById("related-content").innerHTML = "";
    document.getElementById("definitions-content").innerHTML = "";
    const limitInput = document.getElementById("summary-limit").value.trim();
    const extraPromptInput = document.getElementById("additional-prompts").value.trim();

    const limit = !limitInput || parseInt(limitInput, 10) < 100 ? 100 : parseInt(limitInput, 10);
    const extraPrompt = extraPromptInput === "" ? "" : `\n\n The summary should have a focus on - ${extraPromptInput}`;

    chrome.storage.local.get(["openai_api_key", "gemini_api_key"], ({ openai_api_key, gemini_api_key }) => {
      if (!openai_api_key && !gemini_api_key) {
        document.getElementById("summary-content").innerText = "Please provide at least one API key.";
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getArticleContent" }, async (response) => {
          const article = response?.text || "";
          if (!article) {
            document.getElementById("summary-content").innerText = "Could not extract article content.";
            return;
          }

          const prompt = `Given the following article, perform the following tasks and respond in strict JSON format with these keys:

1. summary: A concise summary of the article in under ${limit} words. .
2. related: A list of 3 related articles with title and url.
3. definitions: A list of 5 key terms from the article, each with term and definition.

Article:
${article}. ${extraPrompt}`;

          const tasks = [];

          if (openai_api_key) {
            tasks.push(
              fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + openai_api_key
                },
                body: JSON.stringify({
                  model: "gpt-3.5-turbo",
                  messages: [{ role: "user", content: prompt }],
                  temperature: 0.7
                })
              })
                .then(res => res.json())
                .then(data => {
                  const content = data.choices?.[0]?.message?.content || "{}";
                  return { source: "OpenAI", parsed: JSON.parse(content) };
                })
                .catch(err => {
                  console.error("OpenAI Error:", err);
                  return { source: "OpenAI", error: true };
                })
            );
          }

          if (gemini_api_key) {
            tasks.push(
              fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + gemini_api_key, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }]
                })
              })
                .then(res => res.json())
                .then(data => {
                  let geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                  // Strip markdown code block if present
                  const match = geminiText.match(/```json\s*([\s\S]*?)\s*```/i);
                  if (match && match[1]) {
                    geminiText = match[1].trim();
                  }

                  return { source: "Gemini", parsed: JSON.parse(geminiText) };
                })
                .catch(err => {
                  console.error("Gemini Error:", err);
                  return { source: "Gemini", error: true };
                })
            );
          }

          const results = await Promise.all(tasks);

          const tabId = tabs[0].id;

          document.getElementById("summary-content").innerHTML = results.map(r =>
            `<div class="mb-4"><h3 class="font-bold">${r.source}</h3>
              <div>${r.error ? "Error fetching data." : r.parsed.summary}</div></div>`).join("");

          // Show TTS controls
          const ttsControls = document.getElementById("tts-controls");
          ttsControls.classList.remove("hidden");

          setupTTSControls("#summary-content");

          // Prefer definitions from OpenAI if available
          let allTerms = [];

          const openaiResult = results.find(r => r.source === "OpenAI" && !r.error);
          if (openaiResult?.parsed?.definitions?.length) {
            allTerms = openaiResult.parsed.definitions.map(d => d.term).filter(Boolean);
          } else {
            // fallback: if OpenAI failed or has no definitions, use all available
            allTerms = results
              .flatMap(r => r.parsed?.definitions || [])
              .map(d => d.term)
              .filter(Boolean);
          }

          if (allTerms.length === 0) {
            document.getElementById("related-content").innerHTML = "No key terms found for search.";
            return;
          }

          const query = allTerms.join(" ");
          console.log(query);
          try {
            const res = await fetch("https://google.serper.dev/search", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": SERPER_API_KEY
              },
              body: JSON.stringify({ q: query })
            });

            const data = await res.json();
            // Get current tab URL
            const currentTab = tabs[0]; // from chrome.tabs.query earlier
            const currentUrl = currentTab.url;

            // Filter out results that link to the same page
            const items = (data.organic || []).filter(link =>
              link.link && !link.link.includes(currentUrl)
            ).slice(0, 5);

            chrome.storage.local.set({
              [`data_${tabId}_${encodeURIComponent(currentUrl)}`]: {
                summary: results.map(r => ({ source: r.source, summary: r.parsed?.summary })),
                definitions: results.map(r => ({ source: r.source, definitions: r.parsed?.definitions })),
                terms: allTerms,
                related: items
              }
            });

            document.getElementById("related-content").innerHTML = items.map(link =>
              `<li><a href="${link.link}" target="_blank" class="text-blue-600 underline">${link.title}</a></li>`
            ).join("");

          } catch (err) {
            console.error("Serper.dev search error:", err);
            document.getElementById("related-content").innerHTML = "Failed to load related content.";
          }

          document.getElementById("definitions-content").innerHTML = results.map(r =>
            `<div class="mb-4"><h3 class="font-bold">${r.source}</h3>
              ${(r.parsed?.definitions || []).map(d => `<div><strong>${d.term}:</strong> ${d.definition}</div>`).join("")}
            </div>`).join("");
        });
      });
    });
  });
});


function setupTTSControls(textSourceSelector) {
  const toggleBtn = document.getElementById("tts-toggle");
  const stopBtn = document.getElementById("tts-stop");
  const synth = window.speechSynthesis;

  let isPlaying = false;
  let isPaused = false;
  let utterances = [];
  let currentIndex = 0;

  const voices = synth.getVoices();
  const preferredVoice = voices.find(v => v.lang === "en-US" && v.name === "Google UK English Female");

  toggleBtn.textContent = "▶ Play Summary";

  const speakNextChunk = () => {
    if (currentIndex >= utterances.length) {
      isPlaying = false;
      isPaused = false;
      toggleBtn.textContent = "▶ Play Summary";
      return;
    }

    const utterance = utterances[currentIndex];
    utterance.voice = preferredVoice;
    utterance.onend = () => {
      currentIndex++;
      speakNextChunk();
    };

    synth.speak(utterance);
  };

  toggleBtn.onclick = () => {
    const text = document.querySelector(textSourceSelector).innerText;

    if (!isPlaying) {
      // Reset state
      synth.cancel();
      const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]; // split by sentence
      utterances = sentences.map(s => new SpeechSynthesisUtterance(s.trim()));
      currentIndex = 0;

      isPlaying = true;
      isPaused = false;
      toggleBtn.textContent = "⏸ Pause";

      speakNextChunk();

    } else if (!isPaused) {
      synth.pause();
      isPaused = true;
      toggleBtn.textContent = "🔄 Resume";
    } else {
      synth.resume();
      isPaused = false;
      toggleBtn.textContent = "⏸ Pause";
    }
  };

  stopBtn.onclick = () => {
    synth.cancel();
    isPlaying = false;
    isPaused = false;
    currentIndex = 0;
    toggleBtn.textContent = "▶ Play Summary";
  };
}
