import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Parking.css"

const Parking = ({parkingId, parkingName, height, width, numberOfParkingLots, deleteParking }) => {
    const [localParkingName, setLocalParkingName] = useState(parkingName);
    const navigate = useNavigate();

    const handleClick = (event) => {
        console.log(event.target.value)
        setLocalParkingName(event.target.value)
    };

    const goTo = () => {
        navigate("/capture", { state: { parkingID: parkingId} });
    };



    return (
        <div className="parking-container">
            <input type="text" value={localParkingName} onChange={handleClick}></input>
            <label>Width:</label>
            <input type="number" disabled value={width} className="input-params"></input>
            <label>Height:</label>
            <input type="number" disabled value={height} className="input-params"></input>
            <label>Number of Parking Lots:</label>
            <input type="number" disabled value={numberOfParkingLots} className="input-params"></input>
            <button onClick={goTo}>
                <img src="../src/assets/blue_camera.png" alt="" />
            </button>
            <button onClick={() => deleteParking(parkingId)}>
                <img src="../src/assets/delete.png" alt="" />

            </button>
        </div>
    )
}

export default Parking;