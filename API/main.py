from flask import Flask, request, jsonify
from ultralytics import YOLO
from sklearn.cluster import KMeans
import json
from skimage.transform import resize
import cv2
from flask_cors import CORS
import numpy as np
import pickle
import datetime as dt
import os

EMPTY = True
NOT_EMPTY = False


# Ruta del modelo personalizado
model_path = os.path.join('.', 'best.pt')
# Cargar el modelo YOLOv5
model = YOLO(model_path) 
#Para quitar los logs del modelo, es decir, que no imprima lo que detecta
model.overrides['verbose'] = False  # Desactiva los logs


app=Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB

CORS(app)


# Función para calcular la distancia euclidiana entre dos puntos
def calcular_distancia(p1, p2):
    return ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5

def is_box_inside(box1, box2):
    """
    Verifica si el `box1` está dentro del `box2` (o si hay un solapamiento significativo).
    Cada caja tiene formato [x1, y1, x2, y2].
    """
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2

    # Comprobar si hay un solapamiento significativo
    overlap_x1 = max(x1_1, x1_2)
    overlap_y1 = max(y1_1, y1_2)
    overlap_x2 = min(x2_1, x2_2)
    overlap_y2 = min(y2_1, y2_2)

    # Área de solapamiento
    overlap_area = max(0, overlap_x2 - overlap_x1) * max(0, overlap_y2 - overlap_y1)

    # Área del box1
    box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)

    # Considerar un lugar ocupado si el área de solapamiento es mayor al 50% del área del box1
    return overlap_area / box1_area > 0.5


@app.route("/")
def home():
    return "Hola mundo"

@app.route("/getMap",methods=["POST"])
def returnMap():
    try:
        print("Request files:", request.files)  # Depuración de los archivos enviados

        # Verifica si el archivo fue enviado correctamente
        if 'video' not in request.files:
            return {"error": "No video file provided"}, 400

        # Obtiene el archivo y lo guarda temporalmente
        video_file = request.files['video']
        video_path = "uploaded_video.mp4"
        video_file.save(video_path)

        # Obtén los parámetros desde el body como formulario (form-data)
        threshold = float(request.form.get('threshold', 0.5))  # Umbral por defecto 0.5
        timeGap = int(request.form.get('timeGap', 1))  # Intervalo de tiempo por defecto 1 segundo
        num_clusters = int(request.form.get('clusters', 2))  # Clústeres por defecto
        threshold_movement = int(request.form.get('thresholdMovement', 10))  # Movimiento en píxeles

        coordinates = []
        objects_tracking = {} 

        cap = cv2.VideoCapture(video_path)
        width  = cap.get(3)  # float `width`
        height = cap.get(4)  # float `height`
        dimensions={"width":width,"height":height}
        fps = cap.get(cv2.CAP_PROP_FPS)  
        frameGap = int(fps * timeGap) 
        frame_index = 0
        while cap.isOpened():
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            ret, frame = cap.read()
            if not ret:
                break  # Salir del bucle si no hay más fotogramas
            
            results = model(frame)[0]
            for result in results.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = result
                if score > threshold and results.names[int(class_id)].lower() != "pedestrian":
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                    find = False
                    for id_objeto, datos in objects_tracking.items():
                        initial_pos= datos

                        # Si la detección está cerca de una posición conocida, se guardan las coordenadas
                        if calcular_distancia((center_x, center_y), initial_pos) < threshold_movement:
                            find = True
                            coordinates.append([int(x1),int(y1),int(x2),int(y2)])
                            break

                    # Si no se ha find una coincidencia cercana, agregar como nuevo objeto
                    if not find:
                        new_id = len(objects_tracking) + 1
                        objects_tracking[new_id] = ((center_x, center_y))

            frame_index += frameGap #Avanzar x tiempo el video
        cap.release()
        os.remove(video_path)  # Borrar el archivo temporal
        
        # Aplicar K-means a las coordenadas de las esquinas de las cajas
        kmeans = KMeans(n_clusters=num_clusters, random_state=0)
        kmeans.fit(coordinates)
        center_clusters = kmeans.cluster_centers_

        # center_clusters_list = [list(coord) for coord in center_clusters] #Convertir los clusters en un formato aceptable para pasar por json. 
        parking_lots = {} 
        for i, cluster_coordinates in enumerate(center_clusters):
            # parking_lots[i]=(list(cluster_coordinates))
            parking_lots[i]={"x1":cluster_coordinates[0],"y1":cluster_coordinates[1],"x2":cluster_coordinates[2],"y2":cluster_coordinates[3]}
        response={"dimensions":dimensions,"parking_lots":parking_lots}
        return jsonify(response), 200

    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/check_spaces', methods=['POST'])
def check_spaces():
    frame_file = request.files['frame']
    frame_path = f"uploaded_frame{dt.datetime.now().hour}.jpg"
    print(frame_path)
    frame_file.save(frame_path)

    frame = cv2.imread(frame_path)
    occupied_spaces = []
    threshold=.5
    # Obtener y leer el archivo JSON
    json_file = request.files.get('data_parking')
    if not json_file:
        return jsonify({"error": "No JSON file provided"}), 400

    try:
        parking_data = json.load(json_file)  # Cargar el archivo JSON
        parking_coordinates = parking_data.get("parking_lots", {})
        dimensions = parking_data.get("dimensions", {})

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON file format"}), 400
    
    frame=cv2.resize(frame,(int(dimensions["width"]),int(dimensions["height"])))
    results = model(frame)[0]
    for result in results.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = result
        if score > threshold :
            occupied_spaces.append([int(x1),int(y1),int(x2),int(y2)])
            # cv2.rectangle(frame,(int(x1),int(y1)),(int(x2),int(y2)),(0,0,255),3)
            

    spaces={}
    for id, coord in parking_coordinates.items():
        x1, x2, y1, y2 = map(int, coord.values())
        parking_box = (x1, y1, x2, y2)
        # cv2.rectangle(frame,(x1,y1),(x2,y2),(255,0,0),3)
        is_occupied = False
        for occupied_box in occupied_spaces:
            if is_box_inside(occupied_box, parking_box):  # Verifica si hay solapamiento
                is_occupied = True
                break
        spaces[id]="Not_Empty" if is_occupied else "Empty"
    # cv2.imshow("Hola",frame)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    return jsonify(spaces), 200


if __name__ == '__main__':
    app.run(debug=True)