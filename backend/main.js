const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const port = 443;


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, '../frontend')));

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