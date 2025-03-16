import React, { useState, useRef, Fragment } from "react";
import "../components/SendVideo.css"

const SendVideo = ({ userID, setIsModalOpen, loadParkings }) => {
    // const location = useLocation();
    // const userID = location.state?.userID || null;

    const [threshold, setThreshold] = useState(0.5);
    const [timeGap, setTimeGap] = useState(1);
    const [clusters, setClusters] = useState(2);
    const [thresholdMovement, setThresholdMovement] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null); // Referencia al input de archivo
    const [parkingName, setParkingName] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault(); // Evitar el comportamiento por defecto del formulario
        
        const videoFile = fileInputRef.current.files[0]; // Obtener el archivo de video
        
        if (!videoFile) {
            alert("Please select a video file.");
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append("video", videoFile); // Archivo de video
        formData.append("threshold", threshold); // Parámetro umbral
        formData.append("timeGap", timeGap); // Intervalo de tiempo
        formData.append("numberOfParkingLots", clusters); // Número de clústeres
        formData.append("userID", userID); // Movimiento permitido
        formData.append("parkingName", parkingName); // Movimiento permitido


        try {
            const response = await fetch("http://127.0.0.1:5000/maps/newMap", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Response from server:", data);
            setIsLoading(false);

            alert(data["response"])
            setIsModalOpen(false);
            loadParkings();
        } catch (error) {
            console.error("Error sending the request:", error);
            setIsLoading(false);

            alert("Failed to send the request. Check the console for details.");
        }
    };

    return (
        <>
            {userID !== null ?
                <div>

                    <h1>Send Video to API</h1>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>
                                Threshold:
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Time Gap:
                                <input
                                    type="number"
                                    value={timeGap}
                                    min="1"
                                    onChange={(e) => setTimeGap(e.target.value)}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Clusters:
                                <input
                                    type="number"
                                    value={clusters}
                                    min="2"
                                    onChange={(e) => setClusters(e.target.value)}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Threshold Movement:
                                <input
                                    type="number"
                                    value={thresholdMovement}
                                    min="1"
                                    onChange={(e) => setThresholdMovement(e.target.value)}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Parking Name:
                                <input
                                    type="text"
                                    value={parkingName}
                                    onChange={(e) => setParkingName(e.target.value)}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Video File:
                                <input type="file" ref={fileInputRef} accept="video/*" />
                            </label>
                        </div>

                        {isLoading ?
                            <Fragment>
                                <h3>Loading</h3>
                                <svg
                                    className="container"
                                    x="0px"
                                    y="0px"
                                    viewBox="0 0 40 40"
                                    height="40"
                                    width="40"
                                    preserveAspectRatio="xMidYMid meet">
                                    <path
                                        className="track"
                                        fill="none"
                                        stroke-width="4"
                                        pathLength="100"
                                        d="M29.760000000000005 18.72 c0 7.28 -3.9200000000000004 13.600000000000001 -9.840000000000002 16.96 c -2.8800000000000003 1.6800000000000002 -6.24 2.64 -9.840000000000002 2.64 c -3.6 0 -6.88 -0.96 -9.76 -2.64 c0 -7.28 3.9200000000000004 -13.52 9.840000000000002 -16.96 c2.8800000000000003 -1.6800000000000002 6.24 -2.64 9.76 -2.64 S26.880000000000003 17.040000000000003 29.760000000000005 18.72 c5.84 3.3600000000000003 9.76 9.68 9.840000000000002 16.96 c -2.8800000000000003 1.6800000000000002 -6.24 2.64 -9.76 2.64 c -3.6 0 -6.88 -0.96 -9.840000000000002 -2.64 c -5.84 -3.3600000000000003 -9.76 -9.68 -9.76 -16.96 c0 -7.28 3.9200000000000004 -13.600000000000001 9.76 -16.96 C25.84 5.120000000000001 29.760000000000005 11.440000000000001 29.760000000000005 18.72z">
                                    </path>
                                    <path
                                        className="car"
                                        fill="none"
                                        stroke-width="4"
                                        pathLength="100"
                                        d="M29.760000000000005 18.72 c0 7.28 -3.9200000000000004 13.600000000000001 -9.840000000000002 16.96 c -2.8800000000000003 1.6800000000000002 -6.24 2.64 -9.840000000000002 2.64 c -3.6 0 -6.88 -0.96 -9.76 -2.64 c0 -7.28 3.9200000000000004 -13.52 9.840000000000002 -16.96 c2.8800000000000003 -1.6800000000000002 6.24 -2.64 9.76 -2.64 S26.880000000000003 17.040000000000003 29.760000000000005 18.72 c5.84 3.3600000000000003 9.76 9.68 9.840000000000002 16.96 c -2.8800000000000003 1.6800000000000002 -6.24 2.64 -9.76 2.64 c -3.6 0 -6.88 -0.96 -9.840000000000002 -2.64 c -5.84 -3.3600000000000003 -9.76 -9.68 -9.76 -16.96 c0 -7.28 3.9200000000000004 -13.600000000000001 9.76 -16.96 C25.84 5.120000000000001 29.760000000000005 11.440000000000001 29.760000000000005 18.72z">
                                    </path>
                                </svg>
                            </Fragment>
                            :
                            <button type="submit">Send Video</button>}
                    </form>
                </div>
                : <h1>To access this page you must log in</h1>
            }
        </>


    );
};

export default SendVideo;


