import ViewParkings from '../components/ViewParkings'
import RegisterUser from '../components/RegisterUser'
import ManageParkings from '../components/ManageParkings';
import SendVideo from '../components/SendVideo';
import CameraCapture from '../components/CameraCapture';
import { Outlet } from 'react-router-dom';

export default function Display({ component, setUserID, setDisplayComponent,userID,parkingID,setParkingID}) {
  return (
    <div className="display">
      {component === "viewParkings" &&  <ViewParkings />}
            {component === "logIn" && (
              <div>
                <h2>Login</h2>
                <RegisterUser type={"Log In"} setUserID={setUserID} setDisplayComponent={setDisplayComponent}/>
              </div>
            )}
            {component === "signUp" && (
              <div>
                <h2>Sign Up</h2>
                <RegisterUser type={"Sign Up"} setUserID={setUserID} setDisplayComponent={setDisplayComponent}/>
              </div>
            )}
            {component === "manageParkings" && <ManageParkings userID={userID} setDisplayComponent={setDisplayComponent} setParkingID={setParkingID}/>}
            {component === "createParking" && <SendVideo userID={userID}/>}
            {component === "captureParking" && <CameraCapture parkingID={parkingID}/>}
            {!component && <h2>Welcome! Select an option.</h2>}
      
    </div>
  );
}
