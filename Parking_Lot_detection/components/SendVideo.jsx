import React, { useState, useRef } from "react";

const SendVideo = () => {
    const [threshold, setThreshold] = useState(0.5);
    const [timeGap, setTimeGap] = useState(1);
    const [clusters, setClusters] = useState(2);
    const [thresholdMovement, setThresholdMovement] = useState(10);
    const [videoName, setVideoName] = useState(""); 
    const fileInputRef = useRef(null); // Referencia al input de archivo

    const handleDownload = (data, filename) => {
        // Crear un blob con la respuesta de la API
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Crear un enlace para descargar el archivo
        const link = document.createElement("a");
        link.href = url;
        link.download = filename; // Nombre del archivo
        link.click();

        // Liberar la URL después de usarla
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setVideoName(file.name); // Obtener y guardar el nombre del archivo seleccionado
        } else {
            setVideoName(""); // Restablecer si no hay archivo seleccionado
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Evitar el comportamiento por defecto del formulario
        
        const videoFile = fileInputRef.current.files[0]; // Obtener el archivo de video

        if (!videoFile) {
            alert("Please select a video file.");
            return;
        }

        const formData = new FormData();
        formData.append("video", videoFile); // Archivo de video
        formData.append("threshold", threshold); // Parámetro umbral
        formData.append("timeGap", timeGap); // Intervalo de tiempo
        formData.append("clusters", clusters); // Número de clústeres
        formData.append("thresholdMovement", thresholdMovement); // Movimiento permitido

        try {
            const response = await fetch("http://127.0.0.1:5000/getMap", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Response from server:", data);

            const jsonFilename = `${videoName.split(".")[0]}_parking_lots.json`; // Base del nombre del archivo
            handleDownload(data, jsonFilename);
            alert("Request successful! JSON file has been downloaded.");
        } catch (error) {
            console.error("Error sending the request:", error);
            alert("Failed to send the request. Check the console for details.");
        }
    };

    return (
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
                        Video File:
                        <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} />
                    </label>
                </div>
                <button type="submit">Send Video</button>
            </form>
        </div>
    );
};

export default SendVideo;
