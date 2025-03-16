import './App.css'
import Sidebar from '../components/SideBar'
import Display from '../components/Display'
import { useEffect, useState } from "react";
import ViewParkings from '../components/ViewParkings'
import RegisterUser from '../components/RegisterUser'
import ManageParkings from '../components/ManageParkings';
import SendVideo from '../components/SendVideo';
import CameraCapture from '../components/CameraCapture';
import { Routes, Route } from 'react-router-dom';


const ENDPOINT = "http://127.0.0.1:5000/"

export const getHelloWorld = async () => {
  const res = await fetch(ENDPOINT);
  const data = await res.text();
  console.log(data)
}

function App() {
  const [displayComponent, setDisplayComponent] = useState("viewParkings");
  const [userID, setUserID] = useState(null);
  const [parkingID, setParkingID] = useState("");
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  console.log(userID);

  useEffect(() => {
    const updateSize = () => {
      setScreenWidth(innerWidth);
      if (window.innerWidth < 768) {
        setIsLeftSidebarCollapsed(true);
      }

    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return (
    <>
      <Sidebar isLeftSidebarCollapsed={isLeftSidebarCollapsed} changeIsLefSidebarCollapsed={setIsLeftSidebarCollapsed} setDisplayComponent={setDisplayComponent} userID={userID} setUserID={setUserID} />

      <Routes>
        {/* <Route path='/' element={<Menu />} /> */}
        <Route
          element={
            <Display
              component={displayComponent}
              setUserID={setUserID}
              setDisplayComponent={setDisplayComponent}
              userID={userID}
              setParkingID={setParkingID}
              parkingID={parkingID}
            />
          }
        >
          <Route path='/ViewParkings' element={<ViewParkings />} />
          <Route path='/login' element={<RegisterUser type={"Log In"} setUserID={setUserID}/>} />
          <Route path='/signup' element={<RegisterUser type={"Sign Up"} setUserID={setUserID}/>} />
          <Route path='/newparking' element={<SendVideo userID={userID}/>} />
          <Route path='/manageparkings' element={<ManageParkings userID={userID} setDisplayComponent={setDisplayComponent} setParkingID={setParkingID}/>} />
          <Route path='/capture' element={<CameraCapture />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

