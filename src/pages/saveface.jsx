import * as faceapi from 'face-api.js';
import React from 'react';
import {useNavigate} from 'react-router-dom'
import '../index.css'
import '../App.css'

function SaveFace() {
  const [data,setdata]=React.useState({
    name:"",
    facedata:""
})
  const navigate=useNavigate()
  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);

  const videoRef = React.useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/facerecognition/models/';

      Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        // faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }
    loadModels();
  }, []);

  const startVideo = () => {
    setdata({["facedata"]:""})
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

        // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const selfieFacedetection = await faceapi.detectSingleFace(videoRef.current,
          new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks().withFaceDescriptor();
        
        if(selfieFacedetection){
            setdata({["facedata"]:Array.from(selfieFacedetection.descriptor)})
            closeWebcam()
        }
        const resizedDetections = faceapi.resizeResults(selfieFacedetection, displaySize);

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 10)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }
  const handleChange = (event) => {
    setdata({ ...data, [event.target.name]: event.target.value });
  };
  const handleSubmit = (event) => {
    // prevents the submit button from refreshing the page
    event.preventDefault();
    localStorage.setItem('dataKey', JSON.stringify(data));
    navigate('/facerecognition')
  };

  return (
    <div className='mainbody'>
      <div><h3>Save your Face Data</h3></div>
      <div style={{ display:'flex',flexDirection:'row', justifyContent:'center',alignItems:'center', padding: '10px' }}>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam} >
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
            <div style={{width:'100vw',}}>
              <div style={{ display: 'flex', justifyContent: 'center',alignItems:'center', padding: '10px' }}>
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
    
      {data.facedata?<div>
        <h3>Face Detected</h3>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter Name" name='name' value={data.name} onChange={handleChange} required/>
        <button type='submit'>Save Data</button>
        </form>

        </div>:<div>
        </div>}
    </div>
  );
}

export default SaveFace;