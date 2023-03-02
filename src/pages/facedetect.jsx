import * as faceapi from 'face-api.js';
import React from 'react';
import '../index.css'

function FaceDetect() {
  const [matchfound,setmatchfound]=React.useState(false)
  const [data,setdata]=React.useState(()=>localStorage.getItem('dataKey')?JSON.parse(localStorage.getItem('dataKey')):null)
  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);
  
  const videoRef = React.useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL +'/models';

      Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }
    loadModels();
  }, []);

  const startVideo = () => {
    setmatchfound(false);
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);
        const selfieFacedetection = await faceapi.detectSingleFace(videoRef.current,
          new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks().withFaceDescriptor();
          

        if(data && selfieFacedetection){
            const float32 = new Float32Array(data.facedata)
            const distance = faceapi.euclideanDistance(float32, selfieFacedetection.descriptor);
            if(distance<0.4){
                closeWebcam()
                setmatchfound(true)
            }
        }    
        const resizedDetections = faceapi.resizeResults(selfieFacedetection, displaySize);

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      }
    }, 10)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

  return (
    <>
    <div className='body'>
      <div style={{ textAlign: 'center', padding: '10px' }}>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam}>
              Close Webcam
            </button>
            :
            <button onClick={startVideo} >
              Open Webcam
            </button>
        }
        
      </div>
      {
        captureVideo ?
          modelsLoaded ?
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute' }} />
              </div>
            </div>
            :
            <div>loading...</div>
          :
          <>
          </>
      }
      
      {matchfound==true?<div><h2>Match Found User: {data.name}</h2></div>:<div></div>}
    </div>
    
    </>

  );
}

export default FaceDetect;