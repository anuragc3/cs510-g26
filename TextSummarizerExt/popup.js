
document.addEventListener("DOMContentLoaded", () => {
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

  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveKeyBtn");
  const saveStatus = document.getElementById("saveStatus");

  chrome.storage.local.get(["openaiApiKey"], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  });

  saveBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key.startsWith("sk-")) {
      chrome.storage.local.set({ openai_api_key: key }, () => {
        saveStatus.classList.remove("hidden");
        setTimeout(() => saveStatus.classList.add("hidden"), 2000);
      });
    }
  });


  function callLLM(article) {
    chrome.storage.local.get(["openaiApiKey"], (result) => {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        document.getElementById("summary-content").innerText = "Please provide an API key.";
        return;
      }

      const prompt = `
        Given the article below, do the following:
        1. Summarize it in 3-5 sentences.
        2. Suggest 3 related topics or articles.
        3. Identify and define 5 key terms.
        Article:
        ${article}
      `;

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      })
      .then(res => res.json())
      .then(data => {
        const content = data.choices[0].message.content;
        const parts = content.split(/(Summary:|Related Topics:|Definitions:)/).filter(Boolean);
        const sections = { summary: "", related: "", definitions: "" };
        for (let i = 0; i < parts.length; i += 2) {
          const label = parts[i].trim().toLowerCase();
          const value = parts[i + 1]?.trim() || "";
          if (label.includes("summary")) sections.summary = value;
          else if (label.includes("related")) sections.related = value;
          else if (label.includes("definition")) sections.definitions = value;
        }
        document.getElementById("panel-summary").innerText = sections.summary || "No summary found.";
        document.getElementById("panel-related").innerText = sections.related || "No related topics found.";
        document.getElementById("panel-definitions").innerText = sections.definitions || "No definitions found.";
      })
      .catch(err => {
        document.getElementById("panel-summary").innerText = "Error fetching data.";
        console.error(err);
      });
    });
  }
});



document.getElementById("fetch-btn").addEventListener("click", () => {
  document.getElementById("summary-content").textContent = "Loading...";
  document.getElementById("related-content").innerHTML = "";
  document.getElementById("definitions-content").innerHTML = "";

  chrome.storage.local.get("openai_api_key", ({ openai_api_key }) => {
    if (!openai_api_key) {
      document.getElementById("summary-content").textContent = "API key not set.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getArticleContent" }, async (response) => {
        const articleText = response?.text || "";
        if (!articleText) {
          document.getElementById("summary-content").textContent = "Could not extract article content.";
          return;
        }

        const prompt = `Given the following article, perform the following tasks and respond in strict JSON format with these keys:\n\n1. summary: A concise summary of the article in 3–5 sentences.\n2. related: A list of 3 related articles with title and url.\n3. definitions: A list of 5 key terms from the article, each with term and definition.\n\nArticle:\n${articleText}`;

        try {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
          });
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || "{}";
          const parsed = JSON.parse(text);

          document.getElementById("summary-content").textContent = parsed.summary || "No summary.";
          document.getElementById("related-content").innerHTML = (parsed.related || []).map(r => `<li><a class="text-blue-600 underline" href="${r.url}" target="_blank">${r.title}</a></li>`).join("");
          document.getElementById("definitions-content").innerHTML = (parsed.definitions || []).map(d => `<div><strong>${d.term}:</strong> ${d.definition}</div>`).join("");

        } catch (err) {
          console.error(err);
          document.getElementById("summary-content").textContent = "Error fetching summary.";
        }
      });
    });
  });
});
