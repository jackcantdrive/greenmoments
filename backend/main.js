import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { verifyImage } from './verification.js';
import cors from 'cors';

import { fileURLToPath } from 'url';
// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 444;

app.use(cors())

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, '../frontend')));

// app.post('/addPost', (req, res) => {
//   const postData = req.body;
//   console.log('Received post data:', postData);
//   res.json({ message: 'Post received successfully', data: postData });
// });

const postsDir = path.join(__dirname, 'posts');

// Ensure the posts directory exists
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir);
}

app.post('/addPost', async (req, res) => {
  const postData = req.body;

  // Generate a unique ID with a timestamp
  const timestamp = Date.now();
  const id = `${timestamp}-${uuidv4()}`;

  // Create the filename for the post data
  const filePath = path.join(postsDir, `${id}.json`);

  const verificationResult = await verifyPost(postData);
  postData.sustainable = verificationResult.verifiedSustainable;

  // Write the post data to a JSON file
  fs.writeFile(filePath, JSON.stringify(postData, null, 2), (err) => {
    if (err) {
      console.error('Error writing post to file:', err);
      return res.status(500).json({ message: 'Error saving post' });
    }

    console.log('Post saved successfully:', filePath);
    res.json({
        message: 'Post received and saved successfully',
        id, data: postData, verificationResult
    });
  });
});

const verifyPost = async postData => {
    return await verifyImage(postData.dataUrl, postData.promptSustainableAction);
}

app.get('/getPosts', (req, res) => {
    // const { since } = req.query;
  
    // // Validate the 'since' parameter
    // if (!since || isNaN(Number(since))) {
    //   return res.status(400).json({ message: 'Invalid or missing "since" timestamp' });
    // }

    const since = new Date('2024-09-15 00:00')
  
    const timestampSince = Number(since);
  
    fs.readdir(postsDir, (err, files) => {
      if (err) {
        console.error('Error reading posts directory:', err);
        return res.status(500).json({ message: 'Error reading posts' });
      }
  
      const filteredFiles = files.filter(file => {
        const fileName = path.basename(file, '.json');
        const fileTimestamp = parseInt(fileName.split('-')[0], 10);
        return fileTimestamp >= timestampSince;
      });
  
      const posts = filteredFiles.map(async file => {
        const filePath = path.join(postsDir, file);
        try {
              const data = await fs.promises.readFile(filePath, 'utf8');
              return JSON.parse(data);
          } catch (err) {
              console.error('Error reading file:', filePath, err);
              return null;
          }
      });
  
      Promise.all(posts).then(postsData => {
        // Filter out any null entries (failed reads)
        const validPosts = postsData.filter(post => post !== null);
        res.json(validPosts);
      }).catch(err => {
        console.error('Error processing posts:', err);
        res.status(500).json({ message: 'Error processing posts' });
      });
    });
  });


const options = {
  key: fs.readFileSync('self-signed-key/privkey.pem'),
  cert: fs.readFileSync('self-signed-key/fullchain.pem')
};

https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on port ${port}`);
});