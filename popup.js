const displayContent = (content) => {
  const splitContent = content.split('\n').filter((item) => item?.trim().length > 0);
  splitContent.forEach((content) => {
    const element = document.getElementById('message');
    const p = document.createElement('p');
    p.textContent = content;
    element.appendChild(p);
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'data') {
    const content = message.data;
    document.querySelector('.loader').style.display = 'none';
    displayContent(content);
  }
});
