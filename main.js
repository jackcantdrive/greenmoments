let pauseDrawingWebcamToCanvas = false;

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment'
        }
    });

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Black Magic to get ios webcam to work
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '')

    video.srcObject = stream;

    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const draw = () => {
            if (!pauseDrawingWebcamToCanvas) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            requestAnimationFrame(draw);
        };
        draw();
    };
}

const nextRewardTime = +new Date() + 1000 * 1;
const periodDuration = 1000 * 60 * 0.03;

const addActiveTakeUI = () => {
    const header = document.getElementById('header');

    const activeTakeContainer = document.createElement('div')
    header.after(activeTakeContainer);

    activeTakeContainer.outerHTML = `<div id="activeTakeContainer">
        <div id="activeCameraContainer">
            <p id='timeRemaining'></p>
            <canvas id="canvas"></canvas>
            <div id='postButton' style='display:none;' class='button' onclick='post()'>Post</div>
            <div id='shutterButton' onclick='shutter()'></div>
        </div>
    </div>`;
}


const shutter = () => {
    console.log('shutter');

    pauseDrawingWebcamToCanvas = !pauseDrawingWebcamToCanvas;

    const postButton = document.getElementById('postButton');
    postButton.style.display = pauseDrawingWebcamToCanvas ? '' : 'none';
}

const post = () => {
    const canvas = document.getElementById('canvas');

    const targetCanvas = document.getElementById('targetCanvas');
    targetCanvas.width = 1080;
    targetCanvas.height = 1920;
    const targetCtx = targetCanvas.getContext('2d');

    const targetAspectRatio = 16 / 9;

    const sourceWidth = canvas.width;
    const sourceHeight = canvas.height;

    const sectionHeight = sourceHeight;  // Full height
    const sectionWidth = sectionHeight / targetAspectRatio;  // Corresponding 16:9 width
    const sectionX = (sourceWidth - sectionWidth) / 2;  // Center horizontally

    // Draw the middle section onto the target canvas
    targetCtx.drawImage(
        canvas,
        sectionX, 0, sectionWidth, sectionHeight,
        0, 0, targetCanvas.width, targetCanvas.height
    );

    const base64 = targetCanvas.toDataURL();
    console.log(base64)

    switchToSmallTakeContainer();
}

const removeActiveTakeUI = () => {
    const activeTakeContainer = document.getElementById('activeTakeContainer');
    activeTakeContainer.remove();
}

const switchToActiveTakeUI = () => {
    const {inPeriod} = getTimeRemainingStr();
    if (!inPeriod) {
        return;
    }
    removeStartTakeUI();
    addActiveTakeUI();
    startCamera();
}

const switchToSmallTakeContainer = () => {
    removeActiveTakeUI();
    addTakeContainer();
}

const getStringForTimeDelta = timeDelta => {
    const seconds = Math.ceil(timeDelta/1000);
    const minutes = Math.floor(seconds/60);
    const secondsMod = seconds % 60;

    const secondsStr = ('' + secondsMod).padStart(2, '0')

    const timeDeltaStr = `${minutes}:${secondsStr}`;

    return timeDeltaStr;
}


const getTimeRemainingStr = () => {
    const now = Date.now();
    const timeIntoPeriod = now - nextRewardTime;
    const timeRemaining = periodDuration - timeIntoPeriod;
    if (timeIntoPeriod > 0 && timeRemaining > 0) {

        const timeRemainingStr = getStringForTimeDelta(timeRemaining);
        
        return {inPeriod: true, timeRemainingStr};
    }
    // too late. pay B3TR or wait for next day
    // console.log('too late. pay B3TR or wait for next day')

    return {timeRemaining, inPeriod: false, timeRemainingStr: 'You missed the period. Come again tomorrow or unlock for 1 B3TR.'};
}

const showingActiveTakeContainer = () => {
    return document.querySelector('#activeTakeContainer') !== null;
}

const updateTimeRemaining = () => {
    const timeRemainingEle = document.getElementById('timeRemaining');
    let {inPeriod, timeRemainingStr, timeRemaining} = getTimeRemainingStr();
    if (inPeriod) {

    } else {
        if (showingActiveTakeContainer()) {
            if (pauseDrawingWebcamToCanvas) {
                timeRemainingStr = '+' + getStringForTimeDelta(-timeRemaining);
                timeRemainingEle.style.color = 'red';

            } else {
                switchToSmallTakeContainer();
            }
        }
    }
    timeRemainingEle.textContent = timeRemainingStr;
    
}

const addHavePostedUI = () => {
    const header = document.getElementById('header');
    const ele = document.createElement('div');

    header.after(ele);

    ele.outerHTML = `<div id="imageOuterContainer">
            <div class="smallImageContainer">
                <img src="rainforest.jpg"\>
            </div>
            <p id="postText">05:42</p>
        </div>`
}

let takeContainer;
const addTakeContainer = () => {
    const header = document.getElementById('header');

    takeContainer = document.createElement('ele');
    header.after(takeContainer)
    
    takeContainer.outerHTML = `<div id="takeButtonContainer" onclick="switchToActiveTakeUI()">
            <div id='imagePlaceHolderBeforeTaken' class="smallImageContainer">
                <p id="timeRemaining"></p>
            </div>
            <div class="button">
                Take your Sustain
            </div>
        </div>`

        takeContainer = document.getElementById('takeButtonContainer') // setting outerHTML creates new node and keeps old ref so update it here
}

const removeStartTakeUI = () => {
    takeContainer.remove();
    // clearInterval(updateTimeRemainingInterval); // now also used in active camera the overlay so don't remove
}

let updateTimeRemainingInterval;


addTakeContainer();
updateTimeRemainingInterval = setInterval(updateTimeRemaining, 1000/60);