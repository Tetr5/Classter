chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('/results')) {
      chrome.tabs.query({ windowId: tab.windowId }, (tabs) => {
        const tabIndex = tab.index;
        if (tabIndex > 0) {
          const leftTabId = tabs[tabIndex - 1].id;
          
          chrome.scripting.executeScript({
            target: { tabId: leftTabId },
            function: clickButton
          }).then(() => {
            chrome.tabs.update(leftTabId, { active: true }, () => {
              setTimeout(() => {
                if (tabIndex + 1 < tabs.length) {
                  chrome.tabs.update(tabs[tabIndex + 1].id, { active: true });
                }
                chrome.tabs.remove(tabId);
              }, 1000);
            });
          }).catch(error => {
            console.error('Script execution failed:', error);
          });
        }
      });
    }
  });
  
  function clickButton() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const button = document.querySelector('button[class*="MuiButton-gradientPrimary"]');
        
        if (!button) {
          console.error('버튼을 찾을 수 없습니다.');
          resolve();
          return;
        }
        
        console.log('선택된 버튼:', button);
        
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        
        button.dispatchEvent(clickEvent);
        resolve();
      }, 1000);
    });
}