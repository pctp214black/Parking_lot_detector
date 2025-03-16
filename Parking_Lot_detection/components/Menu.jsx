import "./Menu.css"
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Si usas react-router-dom

const Menu = () => {
    const location = useLocation();
    const userID = location.state?.userID || null;
    const [parkingList, setParkingList] = useState({});
    const canvasRef = useRef();
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedParking, setSelectedParking] = useState(null);

    const navigate = useNavigate();

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

    const goToPage = (route, parameters) => {
        navigate(`${route}`, { state: parameters });
        return;

    }

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

            <div className="sidebar">
                {userID ?
                    <div>
                        <h1>Hola usuario</h1>
                        <button onClick={() => goToPage("/newparking", { userID: userID })}>Create new parking</button>
                        <button onClick={() => goToPage("/manageparkings", { userID: userID })}>Manage Parkings</button>
                    </div>
                    :
                    <div>
                        <button onClick={() => goToPage("/login")}>Log in as parking admin</button>
                        <button onClick={() => goToPage("/signup")}>Sign Up</button>
                    </div>
                }


            </div>
            <div className="display">
                <select name="parkingSelect" onChange={handleSelectChange}>
                    <option value="">Select a parking</option>
                    {Object.keys(parkingList).map((parking, index) => (
                        <option key={index} value={index}>
                            {parkingList[parking].parking_name}
                        </option>
                    ))}
                </select>

                <div style={{ marginTop: "20px" }}>
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="Parking Map"
                            style={{
                                width: "90%",
                                height: "auto",
                                border: "1px solid black",
                            }}
                        />
                    ) : (
                        <p>Select a parking to view its map</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Menu;
