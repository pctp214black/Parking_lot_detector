// import "./Menu.css"
import { useEffect, useRef, useState } from "react";

const ViewParkings = () => {
    const [parkingList, setParkingList] = useState({});
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedParking, setSelectedParking] = useState(null);

    useEffect(() => {
        async function fetchParkings() {
            const data = await fetch("http://127.0.0.1:5000/maps/getParkings");
            const { response, error } = await data.json();
            if (error) {
                console.log("Cannot fetch parkings")
                return;
            }
            setParkingList(response);
        }
        fetchParkings();

    }, []);

    const handleSelectChange = async (event) => {
        const selectedIndex = event.target.value;
        if (selectedIndex !== "") {
            console.log(parkingList[selectedIndex].parking_id)
            setSelectedParking(parkingList[selectedIndex].parking_id);
            return;
        }
        setSelectedParking(null);
        setImageSrc(null)
    };

    const fetchSelectedParking = async () => {
        try {
            const request = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ parkingID: selectedParking }),
            };

            const response = await fetch("http://127.0.0.1:5000/maps/checkSpacesUsers", request);
            if (response.error) {
                const error = await response.json();
                console.error(error.error);
                return;
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl); // Actualizar la imagen
        } catch (error) {
            console.error("Error updating parking data:", error);
        }
    }

    useEffect(() => {
        let intervalId;
        if (selectedParking) {
            fetchSelectedParking()
            intervalId = setInterval(fetchSelectedParking, 10000); // 10 segundos
        }

        return () => clearInterval(intervalId); // Limpiar intervalo al desmontar componente o cambiar parking
    }, [selectedParking]);

    return (
        <>
            <h2>View your favorite parking</h2>
            <select name="parkingSelect" onChange={handleSelectChange}>
                <option value="">Select a parking</option>
                {Object.keys(parkingList).map((parking, index) => (
                    <option key={index} value={index}>
                        {parkingList[parking].parking_name}
                    </option>
                ))}
            </select>

            <div style={{ marginTop: "20px", height: "90%" }}>
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Parking Map"
                        style={{
                            width: "90%",
                            height: "90%",
                            border: "1px solid black",
                        }}
                    />
                ) : (
                    <p>Select a parking to view its map</p>
                )}
            </div>
        </>
    );
};

export default ViewParkings;
