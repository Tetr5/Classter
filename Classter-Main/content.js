function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelectorAll(selector).length > 0) {
      return resolve(document.querySelectorAll(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelectorAll(selector).length > 0) {
        resolve(document.querySelectorAll(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function fetchSessionData() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: "fetchSessionData",
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://www.classting.com/home',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
      }
    }, response => {
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

function clickElement(element) {
  return new Promise((resolve, reject) => {
    if (element) {
      element.click();
      console.log(`클릭됨: ${element.textContent}`);
      resolve();
    } else {
      reject(new Error('요소를 찾을 수 없습니다.'));
    }
  });
}

function selectAnswer(data) {
  return new Promise((resolve) => {
    waitForElement('.sc-gGBfsJ.guiQFl.MuiTypography-root.MuiTypography-body1.sc-btzYZH.hEwDzA').then((elements) => {
      const subtitle = elements[0].textContent;
      const isMultipleChoice = subtitle.includes('객관식');

      if (isMultipleChoice) {
        if (data && data.length > 0) {
          const maxCount = Math.max(...data.map(item => item.count));
          const maxIndex = data.findIndex(item => item.count === maxCount);
          
          if (maxIndex >= 0) {
            waitForElement('[data-testid="quiz-answer-button"]').then((buttons) => {
              if (buttons[maxIndex]) {
                return clickElement(buttons[maxIndex]);
              } else {
                console.error('해당 인덱스의 버튼을 찾을 수 없습니다.');
                clickElement(buttons[0]);
              }
            }).catch(error => console.error(error));
          } else {
            console.error('최대 카운트에 해당하는 인덱스를 찾을 수 없습니다.');
          }
        } else {
          console.log('응답 데이터가 비어있습니다. 첫 번째 버튼을 클릭합니다.');
          waitForElement('[data-testid="quiz-answer-button"]').then((buttons) => {
            if (buttons[0]) {
              return clickElement(buttons[0]);
            } else {
              throw new Error('버튼을 찾을 수 없습니다.');
            }
          }).catch(error => console.error(error));
        }
      } else {
        console.log('객관식이 아닙니다. 2초 후 "모르겠어요" 버튼을 클릭합니다.');
        setTimeout(() => {
          waitForElement('.sc-bdVaJa.iBdmAw.sc-emmjRN.cvAchv.MuiBox-root').then((elements) => {
            const dontKnowButton = Array.from(elements).find(el => el.textContent.includes('모르겠어요'));
            if (dontKnowButton) {
              return clickElement(dontKnowButton);
            } else {
              throw new Error('"모르겠어요" 버튼을 찾을 수 없습니다.');
            }
          })
          .then(() => new Promise(resolve => setTimeout(resolve, 1500)))
          .then(() => waitForElement('[data-testid="dialog-confirm-button"]'))
          .then(elements => clickElement(elements[0]))
          .then(() => console.log("확인 버튼 클릭됨"))
          .catch(error => console.error(error));
        }, 2000);
      }

      setTimeout(() => {
        waitForElement('[data-testid="quiz-submit-button"]')
          .then(elements => clickElement(elements[0]))
          .then(() => {
            console.log("정답확인 버튼 클릭됨");
            return new Promise(resolve => setTimeout(resolve, 3000));
          })
          .then(() => waitForElement('[data-testid="quiz-pagination-next-button"]'))
          .then(elements => new Promise(resolve => setTimeout(() => resolve(elements[0]), 3000)))
          .then(element => clickNextButton(element))
          .then(() => {
            console.log("다음 문제로 넘어갑니다.");
            return waitForPageChange();
          })
          .then(() => {
            resolve();
          })
          .catch(error => {
            console.error('버튼 클릭 중 오류 발생:', error);
            retryOnError(resolve);
          });
      }, 3000);
    }).catch(error => {
      console.error('서브타이틀 요소를 찾을 수 없습니다:', error);
      retryOnError(resolve);  
    });
  });
}

function clickNextButton(element, attempts = 0) {
  return new Promise((resolve, reject) => {
    clickElement(element)
      .then(() => {
        console.log("다음 문제 버튼 클릭 성공");
        return waitForPageChange();
      })
      .then(() => {
        resolve();
      })
      .catch(error => {
        console.error('다음 문제 버튼 클릭 또는 페이지 변경 실패:', error);
        if (attempts < 3) {
          console.log(`재시도 중... (${attempts + 1}/3)`);
          setTimeout(() => clickNextButton(element, attempts + 1).then(resolve).catch(reject), 2000);
        } else {
          reject(new Error('다음 문제 버튼 클릭 최대 시도 횟수 초과'));
        }
      });
  });
}

function waitForPageChange(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const oldUrl = window.location.href;
    const startTime = Date.now();
    const checkUrlChange = setInterval(() => {
      if (window.location.href !== oldUrl) {
        clearInterval(checkUrlChange);
        console.log("페이지 변경 감지됨");
        setTimeout(resolve, 2000); // 페이지 로드를 위해 2초 대기
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkUrlChange);
        reject(new Error("페이지 변경 타임아웃"));
      }
    }, 500);
  });
}

function waitForPageChange() {
  return new Promise((resolve) => {
    const oldUrl = window.location.href;
    const checkUrlChange = setInterval(() => {
      if (window.location.href !== oldUrl) {
        clearInterval(checkUrlChange);
        console.log("페이지 변경 감지됨");
        setTimeout(resolve, 2000);
      }
    }, 500);
  });
}

function retryOnError(resolve, attempts = 0) {
  if (attempts < 3) {
    console.log(`오류 발생. 재시도 중... (${attempts + 1}/3)`);
    setTimeout(() => fetchDataAndSelectAnswer().then(resolve), 2000);
  } else {
    console.error('최대 재시도 횟수 초과');
    resolve();
  }
}

function logCategoryId() {
  const url = window.location.pathname;
  const match = url.match(/\/cat\/(\d+)/);
  
  if (match && match[1]) {
    console.log('현재 카테고리 ID:', match[1]);
    return match[1];
  } else {
    console.log('카테고리 ID를 찾을 수 없습니다.');
    return null;
  }
}

function validateAndFetchData(attempt = 0) {
  return new Promise((resolve, reject) => {
    const categoryId = logCategoryId();
    if (!categoryId) {
      return reject(new Error('카테고리 ID를 찾을 수 없습니다.'));
    }

    fetchSessionData().then(sessionData => {
      if (!sessionData) {
        return reject(new Error('세션 데이터를 가져오지 못했습니다.'));
      }

      const accessToken = sessionData.accessToken;
      const headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ko,en;q=0.9,ko-KR;q=0.8",
        "Authorization": `Bearer ${accessToken}`,
        "Origin": "https://ai.classting.com",
        "Referer": "https://ai.classting.com/",
        "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
      };

      const expectedUrl = `https://clapi.classting.com/v1/cats/${categoryId}/next-quiz`;

      fetch(expectedUrl, {
        method: 'GET',
        headers: headers
      })
      .then(response => {
        if (response.url !== expectedUrl) {
          throw new Error('URL이 일치하지 않습니다.');
        }
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}, Body: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('퀴즈 데이터:', data);
        resolve({ success: true, data: data, headers: headers });
      })
      .catch(error => {
        console.error('오류 발생:', error);
        if (attempt < 5) {
          setTimeout(() => {
            validateAndFetchData(attempt + 1).then(resolve).catch(reject);
          }, 500);
        } else {
          reject(error);
        }
      });
    }).catch(reject);
  });
}

function fetchDataAndSelectAnswer() {
  let successCount = 0;

  function attemptFetch() {
    validateAndFetchData()
      .then(result => {
        if (result.success) {
          successCount++;
          if (successCount >= 2) {
            console.log('2연속 성공. 답변 선택을 시작합니다.');
            return selectAnswerProcess(result.data, result.headers);
          } else {
            console.log('성공. 다시 한 번 확인합니다.');
            setTimeout(attemptFetch, 50);
          }
        } else {
          successCount = 0;
          console.log('실패. 다시 시도합니다.');
          setTimeout(attemptFetch, 500);
        }
      })
      .catch(error => {
        console.error('오류 발생:', error);
        successCount = 0;
        setTimeout(attemptFetch, 1000);
      });
  }

  attemptFetch();
}

function selectAnswerProcess(quizData, headers) {
  const id = quizData.id;
  return fetch(`https://clapi.classting.com/v1/pages/${id}/answer_statistics`, {
    method: 'GET',
    headers: headers,
    credentials: 'include'
  })
  .then(response => {
    console.log(`응답 데이터 요청 URL: ${response.url}`);
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}, Body: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('응답 데이터:', data);
    return selectAnswer(data);
  })
  .then(() => {
    console.log('답변 선택 및 다음 문제로 넘어가기 완료');
  })
  .catch(error => {
    console.error('오류 발생:', error);
  });
}

function handleResultPage() {
  console.log("handleResultPage 함수 시작");
  return new Promise((resolve) => {
    const newUrl = 'https://ai.classting.com/subjects/5/evaluation';
    console.log(`새 URL로 이동 시도: ${newUrl}`);
    window.location.href = newUrl;

    function waitForPageLoad() {
      console.log("페이지 로드 대기 중...");
      if (document.readyState === 'complete') {
        console.log("페이지 로드 완료");
        waitForElement('button.sc-fMiknA.bubOPE').then((buttons) => {
          console.log(`'단원 총괄평가 시작' 버튼 찾음: ${buttons.length}개`);
          if (buttons.length > 0) {
            clickElement(buttons[0]).then(() => {
              console.log("'단원 총괄평가 시작' 버튼 클릭됨");

              const checkNewTab = setInterval(() => {
                chrome.runtime.sendMessage({action: "getNewTab"}, (response) => {
                  console.log("새 탭 확인 응답:", response);
                  if (response && response.tabId) {
                    clearInterval(checkNewTab);
                    chrome.runtime.sendMessage({action: "switchTab", tabId: response.tabId}, () => {
                      console.log("새 탭으로 전환 완료");
                      resolve();
                    });
                  }
                });
              }, 500);
            });
          } else {
            console.error('시작 버튼을 찾을 수 없습니다.');
            resolve();
          }
        }).catch(error => {
          console.error('waitForElement 에러:', error);
          resolve();
        });
      } else {
        setTimeout(waitForPageLoad, 100);
      }
    }

    waitForPageLoad();
  });
}

function checkAndHandleUrl() {
  const currentUrl = window.location.href;
  console.log(`현재 URL 체크: ${currentUrl}`);
  if (currentUrl.endsWith('/result')) {
    console.log("'/result' 페이지 감지됨");
    handleResultPage().then(() => {
      console.log("handleResultPage 완료, fetchDataAndSelectAnswer 호출");
      fetchDataAndSelectAnswer();
    });
  } else {
    console.log("일반 페이지, fetchDataAndSelectAnswer 호출");
    fetchDataAndSelectAnswer();
  }
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    console.log(`URL 변경 감지: ${lastUrl} -> ${url}`);
    lastUrl = url;
    checkAndHandleUrl();
  }
}).observe(document, { subtree: true, childList: true });

console.log("클래스터가 정상적으로 실행중입니다.");
setTimeout(() => {
  checkAndHandleUrl();
}, 2000);
