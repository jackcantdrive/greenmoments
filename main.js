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