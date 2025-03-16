const handleJSONDownload = (data, filename) => {
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


