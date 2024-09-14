// async function startCamera() {
//     try {
//         // Get access to the user's media devices
//         const stream = await navigator.mediaDevices.getUserMedia({
//             video: {
//                 facingMode: 'environment'
//             }
//         });

//         const video = document.getElementById('video');
//         const canvas = document.getElementById('canvas');
//         const context = canvas.getContext('2d');

//         video.srcObject = stream;

//         video.onloadedmetadata = () => {
//             canvas.width = video.videoWidth;
//             canvas.height = video.videoHeight;

//             const draw = () => {
//                 context.drawImage(video, 0, 0, canvas.width, canvas.height);
//                 // requestAnimationFrame(draw);
//             };
//             draw();
//             setInterval(draw, 1000/60)
//         };
//     } catch (error) {
//         console.error('Error accessing camera:', error);
//     }
// }


// // window.onload = startCamera;


// alert(1)

async function startCamera() {
    // try {
    // Get access to the user's media devices
    // const stream = await navigator.mediaDevices.getUserMedia({
    //     video: {
    //         facingMode: 'environment'
    //     }
    // });

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment'
        }
    });

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '')

    // video.srcObject = stream;

    // const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // const stream = await navigator.mediaDevices.getUserMedia({
    //     video: {
    //         facingMode: 'environment'
    //     }
    // });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const draw = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(draw);
        };
        draw();
        // setInterval(draw, 1000/60)
    };
    // } catch (error) {
    //     console.error('Error accessing camera:', error);
    // }
}


// window.onload = startCamera;