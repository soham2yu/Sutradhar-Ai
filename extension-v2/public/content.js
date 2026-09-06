
let activeIncidentId = null;
let observer = null;
let lastCaptionText = "";

console.log("Sutradhar Content Script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_MEET_CAPTURE") {
    activeIncidentId = request.incidentId;
    startGoogleMeetCaptionObserver();
    sendResponse({ status: "started" });
  } else if (request.action === "STOP_MEET_CAPTURE") {
    activeIncidentId = null;
    if (observer) observer.disconnect();
    sendResponse({ status: "stopped" });
  }
});

function startGoogleMeetCaptionObserver() {
  console.log("Starting Google Meet Caption Observer for incident: ", activeIncidentId);
  
  if (observer) {
    observer.disconnect();
  }

  // Google Meet usually mounts captions inside a specific container.
  // The classnames change, but they are often deep inside the body.
  // We will just observe the entire body for changes and look for text nodes that appear inside typical caption containers.
  // For a robust implementation, we look for elements that Google Meet uses for captions.
  // As of 2024/2025, classes like `a4cQT` or `KjWwnd` are often used, or we can look for `div[jsname="tV9hkb"]` or similar.
  // A generic fallback is to find the container that holds the most text changes.

  observer = new MutationObserver((mutations) => {
    if (!activeIncidentId) return;

    for (const mutation of mutations) {
      if (mutation.type === "characterData" || mutation.type === "childList") {
        const target = mutation.target;
        // Meet captions are usually inside a span or div with specific styles
        // We will do a generic check for newly added nodes that might be captions
        
        let text = "";
        let speakerName = "Unknown Participant";

        // IMPORTANT: Filter out UI elements (tooltips, menus, buttons)
        // Google Meet captions are always inside specific containers.
        const el = target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
        
        // Check if the element is inside a known caption container class or attribute
        const captionContainer = el.closest('.TBMuR, .KjWwnd, .a4cQT, [jsname="tV9hkb"], .iOzk7');
        if (!captionContainer) continue; // Ignore ALL other UI changes!

        const speakerEl = captionContainer.querySelector(".zs7s8d, .VbkSUe");
        if (speakerEl) speakerName = speakerEl.textContent;
        text = target.nodeType === Node.TEXT_NODE ? target.textContent : target.innerText;

        if (text && text.trim().length > 3 && text !== lastCaptionText) {
          lastCaptionText = text;
          sendToSutradhar(speakerName, text);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // Alert the user to turn on CC
  alert("Sutradhar: Please ensure Closed Captions (CC) are turned ON in Google Meet so we can analyze the conversation!");
}

let debounceTimer = null;
function sendToSutradhar(speaker, text) {
  // Simple debounce to prevent spamming the server with incomplete captions
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("Sending to Sutradhar via Background SW:", speaker, text);
    chrome.runtime.sendMessage({
      action: "SEND_TRANSCRIPT",
      payload: {
        incident_id: activeIncidentId,
        transcript: [{
          speaker: speaker || "Meeting Participant",
          timestamp: new Date().toISOString(),
          text: text
        }]
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Sutradhar extension error:", chrome.runtime.lastError);
      } else if (!response?.success) {
        console.error("Sutradhar fetch error:", response?.error);
      }
    });
  }, 1500); // Wait 1.5s for the caption to "settle"
}

