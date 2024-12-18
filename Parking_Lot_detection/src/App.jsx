import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SendVideo from '../components/SendVideo'
import Prueba from '../components/prueba'
import CameraCapture from '../components/CameraCapture'

const ENDPOINT="http://127.0.0.1:5000/"

export const getHelloWorld=async()=>{
  const res=await fetch(ENDPOINT);
  const data=await res.text();
  console.log(data)
}

function App() {
  return (
    <>
    <div className="video">
      {/* <SendVideo/>  */}
      <CameraCapture/>
    </div>
    </>
  )
}

export default App
