import { useState, useEffect, Fragment } from "react";
import { useLocation } from "react-router-dom";
import Parking from "./Parking";
import "../components/ManageParkings.css"
import SendVideo from '../components/SendVideo';
import Display from "./Display";

const ManageParkings = ({ setDisplayComponent, userID, setParkingID }) => {
    const [parkingList, setParkingList] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Obtener los mapas del usuario
    const getUserMaps = async () => {
        if (userID === "") {
            setErrorMessage("To access this page you must log in");
            return;
        }
        try {
            setLoading(true);
            const request = {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ "userID": userID })
            };
            const response = await fetch("http://127.0.0.1:5000/users/getMaps", request);
            const data = await response.json();

            if (data.error) {
                setErrorMessage("Error loading parking maps: " + data.error);
            } else {
                setParkingList(data.response || {});
            }
        } catch (error) {
            console.error("Error fetching parking maps:", error);
            setErrorMessage("An error occurred while fetching parking maps.");
        } finally {
            setLoading(false);
        }
    };

    // Eliminar un estacionamiento
    const deleteParking = async (parking_id) => {
        try {
            const request = {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ "parkingID": parking_id })
            };
            const response = await fetch("http://localhost:5000/maps/deleteParking", request);
            const data = await response.json();

            if (data.response) {
                alert("Parking deleted successfully.");
                getUserMaps(); // Actualizar la lista
            } else if (data.error) {
                alert("Error deleting parking: " + data.error);
            }
        } catch (error) {
            console.error("Error deleting parking:", error);
            alert("An error occurred while deleting parking.");
        }
    };

    // Cargar los mapas al montar el componente
    useEffect(() => {
        getUserMaps();
    }, [userID]);

    return (
        <>
            <div className="manage-parkings-header">
                {Object.keys(parkingList).length === 0 ? (<h3>You have not created any parking spaces</h3>) : (<h3>Parking List</h3>)}

                <img src="../src/assets/golden_plus.png" alt="Add Parking" onClick={() => setIsModalOpen(true)} className="floating-button" />
            </div>
            {errorMessage ? (
                <h1>{errorMessage}</h1>
            ) : loading ? (
                <h1>Loading parking maps...</h1>
            ) :
                <Fragment >
                    {/* Modal */}
                    {isModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button onClick={() => setIsModalOpen(false)} className="close-button">✖</button>
                                <h2 className="modal-title">Add new Parking</h2>
                                <hr></hr>
                                <SendVideo userID={userID} setIsModalOpen={setIsModalOpen} loadParkings={getUserMaps}/>
                            </div>
                        </div>
                    )}
                    {Object.keys(parkingList).map((parking, index) => (
                        <Parking
                            setParkingID={setParkingID}
                            setDisplayComponent={setDisplayComponent}
                            key={index}
                            parkingId={parkingList[parking].parking_id}
                            parkingName={parkingList[parking].parking_name}
                            width={parkingList[parking].width}
                            height={parkingList[parking].height}
                            numberOfParkingLots={parkingList[parking].number_parking_lots}
                            deleteParking={deleteParking}
                        />
                    ))}



                </Fragment>

            }
        </>
    );
};

export default ManageParkings;
