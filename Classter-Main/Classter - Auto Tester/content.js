chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "clickButton") {
      setTimeout(() => {
        clickButton();
      }, 1000);
      sendResponse({status: "Button click initiated"});
    }
    return true;
  });
  
  function clickButton() {
    const button = document.querySelector('button[class*="MuiButton-gradientPrimary"]');
    
    if (!button) {
      console.error('버튼을 찾을 수 없습니다.');
      return;
    }
    
    console.log('선택된 버튼:', button);
    
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    button.dispatchEvent(clickEvent);
  }