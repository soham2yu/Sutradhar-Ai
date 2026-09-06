
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SEND_TRANSCRIPT") {
    fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.payload)
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep the message channel open for async fetch
  }
});

