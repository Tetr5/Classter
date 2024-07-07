let newTabId = null;

chrome.tabs.onCreated.addListener((tab) => {
  newTabId = tab.id;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchSessionData") {
    fetch('https://www.classting.com/api/auth/session', {
      method: 'GET',
      headers: request.headers,
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({success: true, data: data});
    })
    .catch(error => {
      sendResponse({success: false, error: error.toString()});
    });
    return true; 
  } else if (request.action === "getNewTab") {
    sendResponse({tabId: newTabId});
    newTabId = null;
  } else if (request.action === "switchTab") {
    chrome.tabs.update(request.tabId, {active: true});
    sendResponse({success: true});
  }
});