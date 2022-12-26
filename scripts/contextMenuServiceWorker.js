const getKey = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';

  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 700,
      temperature: 0.7,
    }),
  });

  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
};

const generateCompletionAction = async (info, tab) => {
  try {
    const { selectionText } = info;
    const basePromptPrefix = `
     Give me a very detailed explanation of the following concept,
     explaining it in clear terms and making it understandable by 5 year olds,
     and also giving examples where applicable, and ending with a summary:
	`;
    chrome.windows.create(
      {
        type: 'popup',
        url: 'popup.html',
        width: 500,
        height: 300,
      },
      async (window) => {
        const baseCompletion = await generate(
          `${basePromptPrefix}${selectionText}`
        );

        chrome.tabs.sendMessage(window.tabs[0].id, {
          type: 'data',
          data: baseCompletion?.text,
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'context-run',
    title: 'ELI5',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
