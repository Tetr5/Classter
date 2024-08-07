<hr>
<div align="center">
  <h1>Classter</h1>
	<img src="https://github.com/Tetr5/Classter/assets/166596134/12635dcc-e581-4491-b9bf-4c4533235722"  width="200" height="400">
  <hr>
</div>
클래스팅 문제를 자동으로 풀어주는 프로그램

왜인지 가장 많이 선택받은 걸고르는데 잘못가져와서 정답률이 50~75% 밖에 안되는 치명적인 문제가 있습니다.<br>또한 주관식은 풀지못합니다. 그리고 되도록 안쓰는것을 추천합니다.<br>
https://ai.classting.com/subjects/5/evaluation (5 부분엔 과목코드 넣으세요.)<br>

# 설치법 <br>
1. code를 누르고 Download ZIP을 클릭하여 소스코드를 다운로드한다.
2. chrome://extensions로 가세요
3. 오른쪽 상단의 "개발자 모드"를 켜세요
4. "압축 해제된 파일 로드합니다."를 클릭
5. Classter - Main폴더와 Classter - Auto Tester폴더는 별도의 폴더인데, Main은 문제만 푸는 역할을 합니다. Main을 깐 후,
<br>Auto Tester을 설치하면 아예 혼자서 총괄평가가 끝나면 다음 총괄평가를 무한으로 제공함
6. 클래스터 - 메인과 클래스터 - 오토테스터가 둘다 설치되면 성공
<br>

# 유의사항 <br>
이 프로그램으로 얻는 불이익은 본인이 책임지셔야합니다.<br>
한 크롬창에선 총괄평가 시작이 있는 버튼이 있는 페이지와 확장프로그램이 푸는 페이지만 열어두셔야합니다.<br>
확장프로그램으로 푸는 동안 다른 페이지에 가있으면 안됩니다.<br>
안넘어가는 경우나 문제 속도제한 문제 등으로 인해 일부로 느리게 조정해놨습니다.
<br>
<br>
# 스크린샷 <br>
![2024-7-13_18-55-36](https://github.com/user-attachments/assets/5890c091-2c5e-4627-9203-547566d8dd3a)
![2024-7-13_18-55-36](https://github.com/user-attachments/assets/bc57c5dc-f042-4c02-b940-90e904a528bc)
![2024-7-8_20-41-24](https://github.com/user-attachments/assets/a94499fb-6bf3-4250-9f6b-09d06a1dc5f4)
<br>
<br>

# 번외 <br>
클래스팅 일반상자깡 코드
``` javascript
const repeatCount = window.prompt("깔 일반상자 개수를 입력하세요.");
let currentIteration = 0;

function repeatClickActions() {
    function clickFirstButton() {
        const firstButton = document.querySelector('[data-testid="filght-box-normal"][data-event-on="click"][data-event-name="FlightBoxClicked"][data-event-properties*="normal"]');
        if (firstButton) {
            firstButton.click();
            console.log(`일반상자 버튼을 ${currentIteration + 1}번 클릭했습니다.`);
            setTimeout(clickSecondButton, 3000);
        } else {
            console.error("일반상자 버튼을 찾을 수 없습니다.");
        }
    }

    function clickSecondButton() {
        const secondButton = document.querySelector('button[data-event-on="click"][data-event-name="CloseButtonClicked"][data-event-properties*="normal"]');
        if (secondButton) {
            secondButton.click();
            console.log(`닫기 버튼을 ${currentIteration + 1}번 클릭했습니다.`);
            currentIteration++;

            if (currentIteration < repeatCount) {
                setTimeout(clickFirstButton, 1000);
            } else {
                console.log(`총 ${repeatCount}번 클릭 완료.`);
            }
        } else {
            console.error("닫기 버튼을 찾을 수 없습니다.");
        }
    }

    clickFirstButton();
}

repeatClickActions();
```
<br>

클래스팅 희귀상자깡 코드
<br>
``` javascript
const repeatCount = window.prompt("깔 희귀상자 개수를 입력하세요.");
let currentIteration = 0;

function repeatClickActions() {
    function clickFirstButton() {
        const firstButton = document.querySelector('[data-testid="filght-box-luxury"][data-event-on="click"][data-event-name="FlightBoxClicked"][data-event-properties*="luxury"]');
        if (firstButton) {
            firstButton.click();
            console.log(`희귀상자 버튼을 ${currentIteration + 1}번 클릭했습니다.`);
            setTimeout(clickSecondButton, 3000);
        } else {
            console.error("희귀상자 버튼을 찾을 수 없습니다.");
        }
    }

    function clickSecondButton() {
        const secondButton = document.querySelector('button[data-event-on="click"][data-event-name="CloseButtonClicked"][data-event-properties*="luxury"]');
        if (secondButton) {
            secondButton.click();
            console.log(`닫기 버튼을 ${currentIteration + 1}번 클릭했습니다.`);
            currentIteration++;
            if (currentIteration < repeatCount) {
                setTimeout(clickFirstButton, 1000);
            } else {
                console.log(`총 ${repeatCount}번 클릭 완료.`);
            }
        } else {
            console.error("닫기 버튼을 찾을 수 없습니다.");
        }
    }

    clickFirstButton();
}

repeatClickActions();
```
