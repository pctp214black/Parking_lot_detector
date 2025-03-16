from Utils.operations import calculate_distance
from sklearn.cluster import KMeans
import cv2
import os

class KMeansParkingLotsModel:
    def __init__(self):
        pass

    def get_parking_lots(ComputerVisionModel, exclude_classes, num_clusters, video_path, time_gap, threshold, threshold_movement):
        cap = cv2.VideoCapture(video_path)
        width = cap.get(3)  # float `width`
        height = cap.get(4)  # float `height`
        fps = cap.get(cv2.CAP_PROP_FPS)
        frameGap = int(fps * time_gap)
        frame_index = 0

        coordinates = []
        objects_tracking = {}  # {id: (pos_x, pos_y, quiet_time)}

        while cap.isOpened():
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            ret, frame = cap.read()
            if not ret:
                break  # Salir del bucle si no hay más fotogramas

            results = ComputerVisionModel.get_objects(frame, threshold=threshold, exclude_classes=exclude_classes)

            for result in results:
                x1, y1, x2, y2, _, _ = result
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                found = False

                for obj_id, (prev_x, prev_y, quiet_time) in objects_tracking.items():
                    if calculate_distance((center_x, center_y), (prev_x, prev_y)) < threshold_movement:
                        # Si se mantiene quieto, incrementar el contador
                        quiet_time += 1
                        objects_tracking[obj_id] = (center_x, center_y, quiet_time)

                        # Solo almacenar si ha estado quieto por más de 10 iteraciones
                        if quiet_time >= 10:
                            coordinates.append([int(x1), int(y1), int(x2), int(y2)])
                        
                        found = True
                        break

                # Si no se encontró coincidencia, agregar nuevo objeto con quiet_time = 1
                if not found:
                    new_id = len(objects_tracking) + 1
                    objects_tracking[new_id] = (center_x, center_y, 1)

            frame_index += frameGap

        cap.release()
        os.remove(video_path)  # Borrar el archivo temporal

        # Aplicar K-means a las coordenadas de las esquinas de las cajas
        if coordinates:
            kmeans = KMeans(n_clusters=num_clusters, random_state=0)
            kmeans.fit(coordinates)
            center_clusters = kmeans.cluster_centers_
        else:
            center_clusters = []  # Evitar errores si no hay coordenadas válidas

        return {"width": width, "height": height, "parking_lots": center_clusters}
