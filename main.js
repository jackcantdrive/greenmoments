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
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(draw);
        };
        draw();
    };
}

const nextRewardTime = +new Date() + 1000 * 5;
const periodDuration = 1000 * 60 * 0.05;

const addActiveTakeUI = () => {
    const header = document.getElementById('header');

    const activeTakeContainer = document.createElement('div')
    header.after(activeTakeContainer);

    activeTakeContainer.outerHTML = `<div id="activeTakeContainer">
        <div id="activeCameraContainer">
            <canvas id="canvas"></canvas>
        </div>
    </div>`;
}

const switchToActiveTakeUI = () => {
    addActiveTakeUI();
    startCamera();

    const takeButtonContainer = document.getElementById('takeButtonContainer');
    takeButtonContainer.remove();
}

const updateTimeRemaining = () => {
    const timeRemainingEle = document.getElementById('timeRemaining');
    const now = Date.now();
    const timeIntoPeriod = now - nextRewardTime;
    const timeRemaining = periodDuration - timeIntoPeriod;
    if (timeRemaining > 0) {
        const seconds = Math.ceil(timeRemaining/1000);
        const minutes = Math.floor(seconds/60);
        const secondsMod = seconds % 60;

        const secondsStr = ('' + secondsMod).padStart(2, '0')

        const timeRemainingStr = `${minutes}:${secondsStr}`;
        timeRemainingEle.textContent = timeRemainingStr;
    } else {
        // too late. pay B3TR or wait for next day
        // console.log('too late. pay B3TR or wait for next day')

        timeRemainingEle.textContent = 'You missed the period. Come again tomorrow or unlock for 1 B3TR.';
    }
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


const tick = () => {

    updateTimeRemaining();
    requestAnimationFrame(tick);
}
tick();