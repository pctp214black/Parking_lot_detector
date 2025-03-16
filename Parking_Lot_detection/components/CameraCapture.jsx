import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const CameraCapture = () => {
  const location = useLocation();
  const videoRef = useRef(null); // Referencia al elemento video
  const canvasRef = useRef(null); // Referencia al elemento canvas
  const canvasRectangleRef = useRef(null); // Referencia al elemento canvas
  const [stream, setStream] = useState(null);
  const [threshold, setThreshold] = useState(.5);
  const parkingID = location.state?.parkingID || null;
  const navigate = useNavigate();

  useEffect(() => {
    if (stream) {
      const video = videoRef.current;
      const canvasRectangle = canvasRectangleRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        video.onloadedmetadata = () => {
          canvasRectangle.width = video.videoWidth;
          canvasRectangle.height = video.videoHeight;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        };
      }
    }
    if (stream != null) {
      const intervalId = setInterval(captureFrameAndSend, 5000);
      return () => clearInterval(intervalId); //This is important
    }

  }, [stream])

  const startCamera = async () => {
    try {
      if (stream != null) {
        stream.getTracks().forEach((track) => track.stop()); // Detiene todas las pistas del stream
      }
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = cameraStream; // Asigna el stream de la cámara al video
      setStream(cameraStream);
    } catch (error) {
      console.error("Error al acceder a la cámara", error);
    }
  };

  const startScreenShare = async () => {
    try {
      if (stream != null) {
        stream.getTracks().forEach((track) => track.stop()); // Detiene todas las pistas del stream
      }
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } } })
      videoRef.current.srcObject = screenStream; // Asigna el stream de la cámara al video
      setStream(screenStream);
    } catch (error) {
      console.error("Error al acceder a la cámara", error);
    }
  };
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // Detiene todas las pistas del stream
      videoRef.current.srcObject = null; // Limpia el video
      const canvasRectangle = canvasRectangleRef.current;
      const contextRectangle = canvasRectangle.getContext("2d");
      contextRectangle.clearRect(0, 0, canvasRectangle.width, canvasRectangle.height);
      setStream(null);
    }
  };
  const handleStreamOption = (option) => {
    switch (option) {
      case "screen":
        startScreenShare();
        break;
      case "camera": startCamera();
        break;

      default:
        stopStream();
        break;
    }
  };


  const drawParkingLots = (jsonData, context) => {
    try {
      const { parking_lots, parking_data } = jsonData;
      const originalVideoWidth = parking_data.width;
      const originalVideoHeight = parking_data.height;
      const canvas = canvasRectangleRef.current;

      const scaleX = canvas.width / originalVideoWidth;
      const scaleY = canvas.height / originalVideoHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);

      Object.values(parking_lots).forEach(({ X1, Y1, X2, Y2, Status }) => {
        const x = X1 * scaleX;
        const y = Y1 * scaleY;
        const width = (X2 - X1) * scaleX;
        const height = (Y2 - Y1) * scaleY;

        context.fillStyle = Status === "Empty" ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)";
        context.strokeStyle = Status === "Empty" ? "green" : "red";
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);
      });
    } catch (error) {
      console.error("Error al dibujar los espacios de estacionamiento", error);
    }
  };


  const captureFrameAndSend = async () => {
    // Capturar un frame del video
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasRectangle = canvasRectangleRef.current;
    const context = canvas.getContext("2d");
    const contextRectangle = canvasRectangle.getContext("2d");

    // Establecer dimensiones del canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir el canvas a un blob (imagen)
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg"); // Frame de la cámara como archivo
      formData.append("parkingID", parkingID); // Archivo JSON
      formData.append("threshold", threshold); // Archivo JSON

      try {
        const response = await fetch("http://127.0.0.1:5000/maps/checkSpacesSystem", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log("Response from server:", data);

        drawParkingLots(data, canvasRectangleRef.current.getContext("2d"));



      } catch (error) {
        console.error("Error enviando datos al servidor", error);
      }
    }, "image/jpeg");

  };
  const goTo = () => {
    navigate("/manageparkings");
  };

  return (

    <div>
      {parkingID !== "" ?
        <div>
          <div style={{ display: "flex", top: 0, position: "sticky", alignItems: "center", backgroundColor: "#DCC6C6" }}>

            <h2 style={{color:"black"}}>Capture Parking</h2>
            <img src="../src/assets/return.png" alt="Return to Manage" onClick={goTo} className="floating-button" />

          </div>
          <div style={{ position: "relative", width: "100%", minHeight: "70vh", display: "grid", alignItems: "center", justifyItems: "center" }}>

            {/* Video para mostrar la cámara */}
            <video
              ref={videoRef}
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }}
            ></video>
            <canvas
              ref={canvasRectangleRef}
              style={{ height: "100%", position: "absolute", pointerEvents: "none", paddingLeft: "0px" }}
            ></canvas>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

          </div>
          <label>Selecciona una opcion: </label>
          <select onChange={(e) => handleStreamOption(e.target.value)}>
            <option value="stop">Stream detenido</option>
            <option value="screen">Compartir Pantalla</option>
            <option value="camera">Seleccionar Cámara</option>
          </select>
          <div>
            <label>Threshold: </label>
            <input
              type="number"
              value={threshold}
              min="1"
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
        </div>
        :
        <h1>To access this page you must log in</h1>
      }

    </div>

  );
};

export default CameraCapture;