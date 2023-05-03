const vid = document.getElementById('vid');
const record = document.getElementById('record');
const stopButton = document.getElementById('stop');
const download = document.getElementById('download');
const get = document.getElementById('get');
const vid_info = document.getElementById('video-info');
let buffer = [];
let segmentNumber =1;
let mediaRecorder;
let downloadCount = 1;
const videoSpecs = {
  video: {
    width: { exact: 1280 },
    height: { exact: 720 },
    frameRate: { exact: 30 },
  },
  audio: false,
};
navigator.mediaDevices.getUserMedia(videoSpecs)
  .then((stream) => {
    vid.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs="avc1.4d002a"',
      videoBitsPerSecond: 5000000,
    });
    let count=0;
    mediaRecorder.addEventListener('dataavailable', (event) => {
      console.log(event.data);
      buffer.push(event.data);
      while(count<buffer.length)
      {
        chunks=[];
        chunks.push(buffer[count]);
        const blob = new Blob(chunks, { type: 'video/mp4' });
        SendToServer(blob);
        count++;
      }
    });
    mediaRecorder.addEventListener('stop', () => {
      record.disabled = false;
      stopButton.disabled = true;
    });
  })
  .catch((error) => {
    console.error('Failed to capture video: ', error);
  });

record.addEventListener('click', () => {
  buffer = [];
  mediaRecorder.start(3000);
  record.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
});
// download.addEventListener('click', () => {
//     console.log("buffer: "+buffer);
//     for (let i = 0; i < buffer.length; i++) {
//     chunks= [];
//     chunks.push(buffer[i]);
//     const blob = new Blob(chunks, { type: 'video/mp4' });
//     console.log(blob);
//     downloadToLocal(blob,downloadCount);
//     downloadCount++;
//   }
// });

function SendToServer(blob){
  const formData = new FormData();
  let segmentName = `segment${segmentNumber}.mp4`
  formData.append('segmentName', segmentName);
  formData.append('videoId', "test");
  formData.append('video', blob);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3001/upload-video', true);
  xhr.send(formData);
  segmentNumber++;
}

function downloadToLocal(blob,downloadCount){
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `video-${downloadCount}.mp4`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

get.addEventListener('click', () => {
  fetch('http://localhost:3001/video')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log("response: "+response.json);
      return response.json();
    }).then(data => {
      // Update the contents of the div with the JSON data
      vid_info.innerText = JSON.stringify(data);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
});


// const recordBtn = document.getElementById('record');
//         const stopBtn = document.getElementById('stop');
//         const video = document.getElementById('video');
//         let mediaRecorder;
//         let chunks = [];
//         let allChunks=[];
//         let segmentIndex = 1;
//         let recording = false;
//         let intervalId;
//         const sendSegment = () => {
//             const formData = new FormData();
//             const blob = new Blob(chunks, { type: 'video/mp4' });
//             let segmentName = `segment${segmentIndex}.mp4`
//             formData.append('filename', segmentName)
//             formData.append('video', blob);
//             formData.append('videoId', "test");
//             console.log(blob);
//             console.log(formData);
//             const xhr = new XMLHttpRequest();
//             xhr.open('POST', 'http://localhost:3001/upload-video', true);
//             xhr.send(formData);
//             chunks = [];
//             segmentIndex++;
//         };

//         recordBtn.onclick = async () => {
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
//                 video.srcObject = stream;
//                 mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
//                 mediaRecorder.start();
//                 recording = true;

//                 mediaRecorder.ondataavailable = e => {
//                     chunks.push(e.data);
//                     allChunks.push(e.data);
//                     if (chunks.length >= 90) { // 3 seconds of video at 30fps 
//                         console.log('chunks: ', chunks);
//                         sendSegment();
//                     }
//                 };
            
//                 stopBtn.onclick = () => {
//                     clearInterval(intervalId); // clear the interval when you stop recording 
//                     mediaRecorder.stop();
//                     recording = false;
//                     if (chunks.length > 0) {
//                         sendSegment();
//                     }
//                     recordBtn.disabled = false;
//                     stopBtn.disabled = true;
//                     video.pause();
//                     video.srcObject = null;
//                 };
                          
//                 setTimeout(() => {
//                     if (recording) {
//                         intervalId = setInterval(() => {
//                             if (recording) {
//                                 mediaRecorder.stop();
//                                 sendSegment();
//                                 mediaRecorder.start();
//                             }
//                         }, 3000);
//                     }
//                 }, 3000);
//                 recordBtn.disabled = true;
//                 stopBtn.disabled = false;
//             } catch (err) {
//                 console.error(err);
//             }
//         }; 