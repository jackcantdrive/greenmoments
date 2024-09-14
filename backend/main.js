const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 443;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/addPost', (req, res) => {
  const postData = req.body;
  console.log('Received post data:', postData);
  res.json({ message: 'Post received successfully', data: postData });
});

const options = {
  key: fs.readFileSync('self-signed-key/privkey.pem'),
  cert: fs.readFileSync('self-signed-key/fullchain.pem')
};

https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on port ${port}`);
});