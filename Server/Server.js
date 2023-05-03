const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const multer = require("multer");
const db = require("./DB");

app.use(cors());
const videoStorage = multer.diskStorage({
  destination: "received_videos",
  filename: function (req, file, cb) {
    const segmentName = req.body.segmentName; 
    const ext = file.mimetype.split('/')[1];
    cb(null, segmentName);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 10000000,
  }
});

app.post( "/upload-video", videoUpload.single("video"), (req, res) => {
    var videoId = req.body.videoId;
    var segmentName = req.body.segmentName;
    console.log('Video Id: '+videoId);
    const videoPath = segmentName;
    console.log('Video Path: '+videoPath);
    var sql = "INSERT INTO video_table (video_id, video_path) VALUES ('" + videoId + "', '" + videoPath + "')";
    db.query(sql, function (err, result) {
      console.log(result);
      if (err) throw err;
      console.log("Video Information loaded in database.");
    });
    res.send("video uploaded successfully");
  }, 
);
app.get('/combine-videos', (req, res) => {
  const ipDir = 'C:/Users/sanke/OneDrive/Documents/Workspace/COMP6461/Lab_Assignment2/Server/received_videos';
  const opDir = 'C:/Users/sanke/OneDrive/Documents/Workspace/COMP6461/Lab_Assignment2/Server/Output/output.mp4';
  fs.readdir(ipDir, (error, files) => {
    if (error) {
      console.error(error);
      return;
    }
    const videos = files.filter(file => {
      const ext = path.extname(file);
      return ['.mp4'].includes(ext);
    });
    videos.sort();
    const inputFilePaths = videos.map(file => {
      return path.join(ipDir, file);
    });
    const Command = ['-i',`concat:${inputFilePaths.join('|')}`,'-c','copy','-bsf:a','aac_adtstoasc',opDir,];
    const ffmpeg = spawn('ffmpeg', Command);
    ffmpeg.stdout.on('data', data => {
      console.log(data.toString());
    });
    ffmpeg.stderr.on('data', data => {
      console.error(data.toString());
    });
    ffmpeg.on('exit', code => {
      console.log(`exited with code ${code}`);
    });
  });
  });

  app.get('/video', (req, res) => {
    const sql = "SELECT video_path FROM video_table";
    db.query(sql, function (err, result) {
      if (err) throw err;
      let videoPaths = [];
for (let i = 0; i < result.length; i++) {
  videoPaths.push(result[i].video_path);
}
console.log(videoPaths);
      if (videoPaths.length > 0) {
        res.json(videoPaths);
      } else {
        res.status(404).send('Video not found');
      }
    });
  });
app.listen(3001, () => {
  console.log('Listening on port 3001');
});
