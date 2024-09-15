export const distribute = address => {
    fetch("http://localhost:3000/submitReceipt", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "Referer": "http://localhost:8082/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\"address\":\"${address}\",\"deviceID\":\"deadbeef\",\"image\":\"data:image/jpeg;base64,/9j/nope\"}`,
        "method": "POST"
      });
}