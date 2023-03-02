import * as faceapi from 'face-api.js';
import React from 'react';
import {Routes,Route,BrowserRouter} from "react-router-dom"

//pages
import FaceDetect from './pages/facedetect';
import SaveFace from './pages/saveface';
import Navbar from './components/navbar';
function App() {

  

  return (
    <BrowserRouter>
       <Navbar/>
      <Routes>
        <Route path="/" element={<FaceDetect/>} exact/>
        <Route path="/save" element={<SaveFace/>} exact/>
      </Routes>
    </BrowserRouter>  
  );
}

export default App;