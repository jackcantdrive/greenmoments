
const SERVER_ADDRESS = origin.includes('ngrok-free.app') ? 'https://25e4-155-69-193-63.ngrok-free.app' : (origin.split(':').slice(0, 2).join(':') + ':444')

import { getRandomUsername } from './getRandomUsername.js';

// import { DAppKitUI } from '@vechain/dapp-kit-ui';

// const walletConnectOptions = {
//      // Create your project here: https://cloud.walletconnect.com/sign-up
//     projectId: '<PROJECT_ID>',
//     metadata: {
//         name: 'My dApp',
//         description: 'My dApp description',
//         // Your app URL
//         url: window.location.origin, 
//         // Your app Icon
//         icons: [`${window.location.origin}/images/my-dapp-icon.png`], 
//     },
// };

// const vechainWalletKitOptions = {
//     // Required - The URL of the node to connect to
//     node: 'https://testnet.vechain.org/', 
//     // Optional - "main" | "test" | Connex.Thor.Block
//     network: 'test', 
//     // Optional - Wallet connect options
//     walletConnectOptions, 
//     // Optional - Defaults to false. If true, the account and source will be persisted in local storage
//     usePersistence: true, 
// };

// const dappKit = DAppKitUI.configure(vechainWalletKitOptions);

// const {thor, vendor, wallet, modal} = DAppKitUI

// console.log(`DAppKit configured`, dappKit.thor.genesis.id);



import { DAppKitUI } from '@vechain/dapp-kit-ui';

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div class="container">
//             <h2>Vanilla JS</h2>
//             <div class="label">kit button:</div>
//             <vdk-button></vdk-button>
//             <div class="label">custom button:</div>
//             <button id="custom-button">Connect Custom Button</button>
//         </div>
// `;

const walletConnectOptions = {
    projectId: 'a0b855ceaf109dbc8426479a4c3d38d8',
    metadata: {
        name: 'Sample VeChain dApp',
        description: 'A sample VeChain dApp',
        url: window.location.origin,
        icons: [`${window.location.origin}/images/logo/my-dapp.png`],
    },
};

const vechainDAppKitOptions = {
    nodeUrl: 'https://testnet.vechain.org/',
    genesis: 'test',
    walletConnectOptions,
    usePersistence: true,
};

DAppKitUI.configure(vechainDAppKitOptions);

const {thor, vendor, wallet, modal} = DAppKitUI

// console.log(wallet)

// const foo = async () => {
//     const res = await wallet.connect();
//     console.log(res);
// }

// foo();


const getExistingUsername = async (address) => {
    const postsData = await (await fetch(SERVER_ADDRESS + '/getPosts', {
        headers: {
            "ngrok-skip-browser-warning": "1",
        }
    })).json();

    const match = postsData.find(postData => postData.userAddress === address);
    if (match) {
        return match.username;
    }

    return undefined;
}

const tryToSetExistingUsernameFromPosts = async (address) => {
    const existingUsername = await getExistingUsername(address);
    if (existingUsername) {
        console.log('found existing username from posts:', existingUsername)
        userPost.username = existingUsername;
    }
    
};

const handleConnected = async (address) => {
    if (address) {
        console.log(address);
        // console.log('hkg')
        // const formattedAddress = `${address.slice(0, 6)}...${address.slice(
        //     -4,
        // )}`;
        // console.log(`Disconnect from ${formattedAddress}`);

        await tryToSetExistingUsernameFromPosts(address);
    }
    //  else {
    //     console.log('Connect Custom Button');
    // }
    
};

handleConnected(DAppKitUI.wallet.state.address);

DAppKitUI.modal.onConnectionStatusChange(handleConnected);





let pauseDrawingWebcamToCanvas = false;
let webcamStarted = false;

const username = localStorage.username ?? getRandomUsername();
localStorage.username = username;
// const testUsernames = ['alexstock', 'jacklatthe', 'maxandre']
// let userPost = {username: testUsernames[0], dataUrl: undefined, timestamp: undefined};
let userPost = {username, dataUrl: undefined, timestamp: undefined};

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
        webcamStarted = true;
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


const getSustainableAction = () => {
    const actions = [
        'Try finding a piece of litter to clean up and throw it in the trash or recycling.',
        'Take a moment to water a plant in your home or neighborhood.',
    ];

    return actions[1];
}

// const nextRewardTime = +new Date() + 1000 * 1;
const rewardTimes = [
    +new Date('2025-01-01 00:00'),
    +new Date() + 1000 * 1,
    +new Date('2024-09-15 00:00'),
];

let now = Date.now();
const timesAfterNow = rewardTimes.filter(t => t >= now);
const timesBeforeNow = rewardTimes.filter(t => t < now);
let nextRewardTime;
if (timesAfterNow.length === 0) {
    nextRewardTime = Math.max(...rewardTimes);
} else {
    nextRewardTime = Math.min(...timesAfterNow);
}
const mostRecentPastRewardTime = Math.max(...timesBeforeNow)
const periodDuration = 1000 * 60 * 1;

const addActiveTakeUI = () => {
    const header = document.getElementById('header');

    const activeTakeContainer = document.createElement('div')
    header.after(activeTakeContainer);

    

    activeTakeContainer.outerHTML = `<div id="activeTakeContainer">
        <div id="activeCameraContainer">
            <p id='timeRemaining'></p>
            <p id='sustainableActionText'>Action of the day: ${getSustainableAction()}</p>
            <canvas id="canvas"></canvas>
            <div id='postButton' style='display:none;' class='button' onclick='post()'>Post</div>
            <div id='shutterButton' class='button' onclick='shutter()'>Take Photo</div>
        </div>
    </div>`;
}


const shutter = () => {
    if (!webcamStarted) {
        return;
    }

    pauseDrawingWebcamToCanvas = !pauseDrawingWebcamToCanvas;

    if (pauseDrawingWebcamToCanvas) {
        userPost.timestamp = Date.now();
    }

    const postButton = document.getElementById('postButton');
    const shutterButton = document.getElementById('shutterButton');
    postButton.style.display = pauseDrawingWebcamToCanvas ? '' : 'none';
    shutterButton.textContent = pauseDrawingWebcamToCanvas ? 'Retake' : 'Take Photo'
}

const post = () => {
    checkForUsernameUpdates();

    const canvas = document.getElementById('canvas');

    // const targetCanvas = document.getElementById('targetCanvas');
    const targetCanvas = document.createElement('canvas');
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

    const base64 = targetCanvas.toDataURL('image/jpeg');
    // console.log(base64)

    userPost.dataUrl = base64;
    userPost.promptSustainableAction = getSustainableAction();

    // switchToSmallTakeContainer();
    switchToHavePostedUI();
    submitPost();
}

const checkForUsernameUpdates = () => {
    // const usernameEle = document.getElementById('username');

    // if (usernameEle.value) {
    //     userPost.username = usernameEle.value;
    // }
    return;
}

async function submitPost() {
    const userAddress = DAppKitUI.wallet.state.address;
    // console.log(userAddress)
    const userAddressPresent = userAddress !== null;

    userPost.userAddress = userAddress;
    const postData = userPost;
    const postDataClone = {...userPost};
    delete postDataClone.postEle;
    const response = await fetch(SERVER_ADDRESS + '/addPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({postData: postDataClone, userAddressPresent, userAddress})
    });
    const responseData = await response.json();
    const postDataWithVerification = responseData.data;

    if (userPost === postData) {
        userPost = {...userPost, ...postDataWithVerification}
        if (userPost.postEle) {
            setPostBorder(userPost, userPost.postEle)
        }
    }
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

const fnv1aHash = str => {
    let hash = 2166136261n; // FNV-1a offset basis
    for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i));
    hash *= 16777619n; // FNV-1a prime
    }
    return hash;
}
const stringHashTo01 = str => {
    

    const hash = fnv1aHash(str);

    const a = 0xFFFFFFFFFFFFFFFFn;
    const randomNumber = Number(hash % a)/Number(a)
    return randomNumber;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

const updateBlurOnFriendsPosts = () => {
    const friendsPostsBlurable = document.getElementById('friendsPostsBlurable');

    const hideFriendsPosts = userPost.dataUrl === undefined;
    friendsPostsBlurable.style.filter = hideFriendsPosts ? 'blur(10px)' : '';

    const whyFriendsBlurredEle = document.getElementById('whyFriendsBlurred');
    whyFriendsBlurredEle.style.display = (hideFriendsPosts || whyFriendsBlurredEle.reason === 'NO_FRIEND_POSTS')  ? '' : 'none';
}

const addHavePostedUI = () => {
    const header = document.getElementById('header');
    let ele = document.createElement('div');

    header.after(ele);

    ele.outerHTML = `<div id="imageOuterContainer">
            <div class="smallImageContainer">
                <img src="${userPost.dataUrl}"\>
            </div>
            <p id="postText">${formatTimestamp(userPost.timestamp)}</p>
            <div class="friendTag">
                <div class='friendIcon' style="background-color: hsla(${Math.floor(stringHashTo01(userPost.username) * 360)}, 50%, 36%, 1)"></div>
                <p></p>
            </div>
        </div>`

    ele = header.parentElement.querySelector('#imageOuterContainer')
    ele.querySelector('.friendTag > p').textContent = userPost.username;
    userPost.postEle = ele;
    setPostBorder(userPost, ele);
}

const exampleFriendsPosts = [
    {
        username: 'jacklatthe',
        timestamp: new Date('2024-09-15 06:56'),
        dataUrl: 'rainforest.jpg'
    },
    {
        username: 'maxandre',
        timestamp: new Date('2024-09-15 06:56'),
        dataUrl: 'rainforest.jpg'
    },
];

const setPostBorder = (postData, postEle) => {
    const classList = postEle.querySelector('.smallImageContainer').classList;
    classList.add('border');
    if (postData.sustainable) {
        classList.add('verifiedSustainable');
    } else {
        classList.add('notVerifiedSustainable');
    }
}

const addFriendPost = postData => {
    let postEle = document.createElement('div');
    const friendsPostsBlurable = document.getElementById('friendsPostsBlurable');

    // friendsPostsBlurable.append(postEle);


    // postEle.outerHTML = `<div class="friendPost">
    //                 <div class="smallImageContainer">
    //                     <img src="${postdata.dataUrl}"\>
    //                 </div>
    //                 <p id="postText">${formatTimestamp(postData.timestamp)}</p>
    //                 <div class="friendTag">
    //                     <div class='friendIcon' style="background-color: #2e7c8a;"></div>
    //                     <p>${postData.username}</p>
    //                 </div>
    //             </div>`
    // oh fine let's care a little bit about script injection
    
    
    const outerTemp = document.createElement('div');
    outerTemp.append(postEle);

    postEle.outerHTML = `<div class="friendPost">
                    <div class="smallImageContainer">
                        <img src=""\>
                    </div>
                    <p id="postText"></p>
                    <div class="friendTag">
                        <div class='friendIcon' style="background-color: hsla(${Math.floor(stringHashTo01(postData.username) * 360)}, 50%, 36%, 1)"></div>
                        <p></p>
                    </div>
                </div>`


    postEle = outerTemp.children[0];
    setPostBorder(postData, postEle);
    postEle.querySelector('img').src = postData.dataUrl;
    postEle.querySelector('#postText').textContent = formatTimestamp(postData.timestamp);
    postEle.querySelector('.friendTag > p').textContent = postData.username;

    friendsPostsBlurable.append(postEle);
}

const addsFriendsPosts = friendsPosts => {
    const friendsPostsBlurable = document.getElementById('friendsPostsBlurable');
    friendsPostsBlurable.innerHTML = '';

    let whyFriendsBlurred = document.getElementById('whyFriendsBlurred');
    if (friendsPosts.length === 0) {
        whyFriendsBlurred.textContent = `Your friends haven't posted their Sustain yet. Add even more friends.`;
        whyFriendsBlurred.reason = 'NO_FRIEND_POSTS'
    } else {
        whyFriendsBlurred.textContent = `Post your Sustain to see friends'.`
    }

    for (const postData of friendsPosts) {
        addFriendPost(postData);
    }
}


const switchToHavePostedUI = () => {
    // console.assert(showingActiveTakeContainer());
    if (showingActiveTakeContainer()) {
        removeActiveTakeUI();
    }
    clearInterval(updateTimeRemainingInterval);
    addHavePostedUI();
    updateBlurOnFriendsPosts();
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


const updateDefaultUsername = () => {
    const username = getRandomUsername();
    const usernameEle = document.getElementById('username');
    if (usernameEle) {
        usernameEle.value = username;
    }
}


let updateTimeRemainingInterval;


addTakeContainer();
updateBlurOnFriendsPosts();
updateDefaultUsername();
// addsFriendsPosts(exampleFriendsPosts)
updateTimeRemainingInterval = setInterval(updateTimeRemaining, 1000/60);

const loadPosts = async () => {
    const postsData = await (await fetch(SERVER_ADDRESS + '/getPosts', {
        headers: {
            "ngrok-skip-browser-warning": "1",
        }
    })).json();
    postsData.sort((a,b) => b.timestamp - a.timestamp);
    await tryToSetExistingUsernameFromPosts(DAppKitUI.wallet.state.address);

    const postInPeriod = postsData.find(postData => postData.username === userPost.username && postData.timestamp > mostRecentPastRewardTime && postData.timestamp < nextRewardTime);

    if (postInPeriod) {
        userPost = postInPeriod;
        removeStartTakeUI();
        switchToHavePostedUI();
    }

    addsFriendsPosts(postsData.filter(postsData => postsData !== userPost));



}
loadPosts();

window.switchToActiveTakeUI = switchToActiveTakeUI; // oh no
window.shutter = shutter;
window.post = post;
