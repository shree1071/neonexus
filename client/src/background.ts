chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capture_screen') {
    chrome.tabs.captureVisibleTab(
      chrome.windows.WINDOW_ID_CURRENT,
      { format: 'jpeg', quality: 80 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
        sendResponse({ imageBase64: base64Data });
      }
    );
    return true; 
  }

  if (request.action === 'analyze_frame') {
    fetch('http://localhost:5001/api/analyze-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.toString() }));
    return true; // async response
  }
});
