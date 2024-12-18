import React, { useRef, useState, useEffect } from "react";


const CameraCapture = () => {
  const videoRef = useRef(null); // Referencia al elemento video
  const canvasRef = useRef(null); // Referencia al elemento canvas
  const [stream, setStream] = useState(null); 
  const [jsonFile, setJsonFile] = useState(null); // Archivo JSON

  useEffect(()=>{
    if(stream!=null){
      // function saludos(){
      //   console.log("Hola Mundo");
      // }
      const intervalId=setInterval(captureFrameAndSend,5000);
      return () => clearInterval(intervalId); //This is important
    }
    
  },[stream])
  
  const startCamera = async () => {
    try {
      if(stream!=null){
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
      if(stream!=null){
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
      setStream(null);
    }
  };
  const handleStreamOption= (option) => {
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
 

  const drawParkingLots = (statusData, context,width,height) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result); // Parsear contenido JSON
        const parkingLots = jsonData.parking_lots;
        const dimensions=jsonData.dimensions;
        const originalVideoHeight=dimensions.height;
        const originalVideoWidth=dimensions.width;
        
        const scaleX = width / originalVideoWidth;
        const scaleY = height / originalVideoHeight;
        // Dibujar rectángulos directamente después de leer
        Object.keys(parkingLots).forEach((lotId) => {
          const lot = parkingLots[lotId];
          const status = statusData[lotId]; // Estado de este espacio (Empty/Not_Empty)
          
          const x = lot.x1*scaleX;
          const y = lot.y1*scaleY;
          const width = (lot.x2 - lot.x1)*scaleX;
          const height = (lot.y2 - lot.y1)*scaleY;
          // console.log(originalVideoWidth)
          context.lineWidth = 2;
          if (status === "Empty") {
            context.strokeStyle = "green";
            context.fillStyle = "rgba(0, 255, 0, 0.3)";
          } else {
            context.strokeStyle = "red";
            context.fillStyle = "rgba(255, 0, 0, 0.3)";
          }
          
          context.fillRect(x, y, width, height);
          context.strokeRect(x, y, width, height);
  
          context.fillStyle = "white";
          context.font = "12px Arial";
          context.fillText(status, x + 5, y + 15);
        });
      } catch (error) {
        console.error("Error al parsear el archivo JSON:", error);
      }
    };
    reader.readAsText(jsonFile);
  };
  

  const captureFrameAndSend = async () => {
    if (!jsonFile) {
      alert("Por favor selecciona el archivo JSON");
      return;
    }

    // Capturar un frame del video
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Establecer dimensiones del canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    
    // console.log(jsonFile)
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convertir el canvas a un blob (imagen)
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg"); // Frame de la cámara como archivo
      formData.append("data_parking", jsonFile); // Archivo JSON

      try {
        const response = await fetch("http://127.0.0.1:5000/check_spaces", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        // console.log("Response from server:", data);
        
        drawParkingLots(data,context,canvas.width,canvas.height);
        

        
      } catch (error) {
        console.error("Error enviando datos al servidor", error);
      }
    }, "image/jpeg");
    
  };

  return (
    <div>
      <h1>Capturar Frame de la Cámara</h1>
      {/* Video para mostrar la cámara */}
      <video ref={videoRef} autoPlay style={{ width: "100%", height: "500px", border: "1px solid black",display: "none"}}></video>

      {/* Canvas oculto para capturar el frame */}
      <canvas ref={canvasRef} style={{
    
    width: "100%", // Debe coincidir con el video
    height: "500px",
    pointerEvents: "none", // No interfiere con eventos del video
  }}></canvas>
     

      {/* Selección del archivo JSON */}
      <input
        type="file"
        accept=".json"
        onChange={(e) => setJsonFile(e.target.files[0])}
      />
      <label>Selecciona una opcion</label>
      <select onChange={(e) => handleStreamOption(e.target.value)}>
        <option value="stop">Stream detenido</option>
        <option value="screen">Compartir Pantalla</option>
        <option value="camera">Seleccionar Cámara</option>
      </select>
      {/* Botón para capturar el frame y enviarlo */}
      <button onClick={captureFrameAndSend}>Capturar y Enviar Frame</button>
    </div>
  );
};

export default CameraCapture;


  // useEffect(()=>{
  //   if (!jsonFile) return;
  //   const reader = new FileReader();
  //   // Evento que se ejecuta cuando la lectura del archivo se completa
  //   reader.onload = (event) => {
  //     try {
  //       const jsonData = JSON.parse(event.target.result); // Parsear contenido JSON
  //       // setJsonContent(jsonData); // Guardar el contenido JSON en el estado
  //       const dimensions=jsonData.dimensions

        // console.log("Contenido del JSON:", dimensions.widht,dimensions.height);
  //     } catch (error) {
        // console.error("Error al parsear el archivo JSON:", error);
  //     }
  //   };

  //   reader.readAsText(jsonFile); // Leer el archivo como texto

  // },[jsonFile]);

  // Acceder a la cámara cuando el componente se monta



   // useEffect(() => {

  //   startCamera();
  // }, [share]);
  // const changeShare=async()=>{
  //   setShare(!share)
  // }
  // Capturar un frame del video y enviarlo