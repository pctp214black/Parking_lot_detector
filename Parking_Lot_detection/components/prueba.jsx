import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const CameraCapture = () => {
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRectangleRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [rectangles, setRectangles] = useState([]); // Guardamos los rectángulos
  const [dragging, setDragging] = useState(false);
  const [draggedRect, setDraggedRect] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const parkingID = location.state?.parkingID || null;

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
    } catch (error) {
      console.error("Error al acceder a la cámara", error);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStream(null);
    }
  };

  const handleStreamOption = (option) => {
    if (option === "camera") startCamera();
    else stopStream();
  };

  const drawParkingLots = (jsonData) => {
    try {
      const parkingLots = jsonData.parking_lots;
      const parkingData = jsonData.parking_data;
      const width = canvasRectangleRef.current.width;
      const height = canvasRectangleRef.current.height;

      const scaleX = width / parkingData.width;
      const scaleY = height / parkingData.height;

      // Guardar los rectángulos en el estado
      const rects = Object.keys(parkingLots).map((lotId) => {
        const lot = parkingLots[lotId];
        return {
          id: lotId,
          x: lot.X1 * scaleX,
          y: lot.Y1 * scaleY,
          width: (lot.X2 - lot.X1) * scaleX,
          height: (lot.Y2 - lot.Y1) * scaleY,
          status: lot.Status,
        };
      });
      setRectangles(rects);
    } catch (error) {
      console.error("Error al parsear JSON:", error);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRectangleRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rectangles.forEach((rect) => {
      ctx.fillStyle = rect.status === "Empty" ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)";
      ctx.strokeStyle = rect.status === "Empty" ? "green" : "red";
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [rectangles]);

  // Eventos del mouse
  const handleMouseDown = (event) => {
    const canvas = canvasRectangleRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const selectedRect = rectangles.find(
      (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
    );

    if (selectedRect) {
      setDragging(true);
      setDraggedRect(selectedRect);
      setOffset({ x: x - selectedRect.x, y: y - selectedRect.y });
    }
  };

  const handleMouseMove = (event) => {
    if (!dragging || !draggedRect) return;

    const canvas = canvasRectangleRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - offset.x;
    const y = event.clientY - rect.top - offset.y;

    setRectangles((prev) =>
      prev.map((r) =>
        r.id === draggedRect.id ? { ...r, x, y } : r
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDraggedRect(null);
  };

  return (
    <div>
      {parkingID ? (
        <div>
          <h1>Capturar Frame de la Cámara</h1>
          <div
            style={{ position: "relative", width: "100%", height: "500px" }}
          >
            <video
              ref={videoRef}
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                border: "1px solid black",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            ></video>
            <canvas
              ref={canvasRectangleRef}
              width={640}
              height={480}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                background: "transparent",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            ></canvas>
          </div>
          <label>Selecciona una opción: </label>
          <select onChange={(e) => handleStreamOption(e.target.value)}>
            <option value="stop">Stream detenido</option>
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
      ) : (
        <h1>To access this page you must log in</h1>
      )}
    </div>
  );
};

export default CameraCapture;
