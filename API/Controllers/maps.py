from Utils.operations import check_params, generate_parking_image, is_box_inside
from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
import datetime as dt
import json
import cv2
import os

def create_map_blueprint(ComputerVisionModel,MapModel,UserModel,ParkingLotsModel):
    map_bp = Blueprint('maps', __name__)
    
    @map_bp.route("/getParkings",methods=["GET"])
    def get_parkings():
        response=MapModel.get_parkings()
        if(response==None):
            return {"error": "Error returning parkings"}, 400
        
        return jsonify({"response":response}),200

    @map_bp.route("/newMap",methods=["POST"])
    def get_map():
        try:
            user_id=str(request.form.get("userID",""))
            if(user_id==""):
                return {"response": "No user ID provided"}, 400  
            
            if(UserModel.user_exists(user_id=user_id)==False):
                return {"response": "This user does not exist"}, 400
            
            # Verifica si el archivo fue enviado correctamente
            if 'video' not in request.files:
                return {"response": "No video file provided"}, 400

            # Obtiene el archivo y lo guarda temporalmente
            video_file = request.files['video']
            video_path = f"uploaded_video_{dt.datetime.now().strftime('%Y%m%d%H%M%S')}.mp4"
            video_file.save(video_path)

            # Obtén los parámetros desde el body como formulario (form-data)
            threshold = float(request.form.get('threshold', 0.5))  # Umbral por defecto 0.5
            time_gap = int(request.form.get('timeGap', 1))  # Intervalo de tiempo por defecto 1 segundo
            num_parking_lots = int(request.form.get('numberOfParkingLots', 2))  # Clústeres por defecto
            threshold_movement = int(request.form.get('thresholdMovement', 10))  # Movimiento en píxeles
            parking_name=str(request.form.get("parkingName",f"Parking-{dt.datetime.now().strftime('%Y%m%d%H%M%S')}"))

            response=ParkingLotsModel.get_parking_lots(
                ComputerVisionModel=ComputerVisionModel,
                exclude_classes=["pedestrian"],
                num_clusters=num_parking_lots,
                video_path=video_path,
                time_gap=time_gap,
                threshold=threshold, 
                threshold_movement=threshold_movement)

            height=response["height"]
            width=response["width"]
            parking_lots_coordinates=response["parking_lots"]
            
            parking_id=MapModel.create_parking(user_id=user_id,parking_name=parking_name,height=height,width=width)

            for i, parking_lot_coordinates in enumerate(parking_lots_coordinates):
                if(MapModel.create_parking_lot(parking_id=parking_id,parking_space_id=i,parking_lot_coordinates=parking_lot_coordinates)!=True):
                    return jsonify({"response":f"Error in creating {i} parking lot"}), 400
            
            return jsonify({"response":"New parking created succesfully"}), 200
        

        except Exception as e:
            return {"error": str(e)}, 500
        finally:
            if video_path and os.path.exists(video_path):
                os.remove(video_path)
        
    @map_bp.route('/checkSpacesSystem', methods=['POST'])
    def check_spaces_system():
        try:
            parking_id = str(request.form.get("parkingID", ""))

            if not parking_id:
                return {"error": "No parking ID provided"}, 400
            if not MapModel.parking_exists(parking_id=parking_id):
                return {"error": "This parking does not exist"}, 400
            
            if 'frame' not in request.files:
                return {"error": "No frame file provided"}, 400
            
            frame_file = request.files['frame']
            frame_path = f"uploaded-frame-{dt.datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
            frame_file.save(frame_path)

            frame = cv2.imread(frame_path)
            if frame is None:
                os.remove(frame_path)  # Limpia el archivo temporal
                return {"error": "Invalid frame file"}, 400

            threshold = float(request.form.get('threshold', 0.5))

            response = MapModel.get_parking_data(parking_id=parking_id)
            width, height = int(response["width"]), int(response["height"])
            parking_lots = MapModel.get_parking_lots(parking_id)

            frame = cv2.resize(frame, (width, height))
            results = ComputerVisionModel.get_objects(frame=frame, threshold=threshold)

            parking = {}
            for parking_lot_id, coordinates in parking_lots.items():
                x1, x2, y1, y2 = map(int, (coordinates["X1"], coordinates["X2"], coordinates["Y1"], coordinates["Y2"]))
                parking_box = (x1, y1, x2, y2)

                is_occupied = any(
                    is_box_inside((box_x1, box_y1, box_x2, box_y2), parking_box)
                    for box_x1, box_y1, box_x2, box_y2, _, _ in results
                )

                MapModel.upadate_parking_lot_status(id_parking=parking_id,id_parking_space=parking_lot_id, id_status=is_occupied)
                # spaces[parking_lot_id] = "Not_Empty" if is_occupied else "Empty"

            os.remove(frame_path)  # Limpia el archivo temporal
            parking_lots=MapModel.get_parking_lots(parking_id)
            parking_data=MapModel.get_parking_data(parking_id=parking_id)
            parking["parking_lots"]=parking_lots
            parking["parking_data"]=parking_data
            return jsonify(parking), 200

        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}, 500
    
    @map_bp.route('/checkSpacesUsers', methods=['POST'])
    def check_spaces_users():
        data = json.loads(request.data)

        response=check_params(data=data,params=["parkingID"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400
        
        parking_id=str(data["parkingID"])
        if not MapModel.parking_exists(parking_id=parking_id):
            return {"error": "This parking does not exist"}, 400
        
        response=MapModel.get_parking_data(parking_id=parking_id)
        parking_lots=MapModel.get_parking_lots(parking_id)

        width=int(response["width"])
        height=int(response["height"])
        
        # Cargar íconos
        images_path = os.path.join('.', 'Utils', 'Images')

        vertical_resize=int(height/12)
        horizontal_resize=int(width/18)

        icons_path = {
            "horizontal_car": os.path.join(images_path,'horizontal_car.png'),
            "horizontal_empty": os.path.join(images_path,'horizontal_empty_space.png'),
            "vertical_car": os.path.join(images_path,'vertical_car.png') ,
            "vertical_empty": os.path.join(images_path,'vertical_empty_space.png'),
        }

        base_image = generate_parking_image(width=width, 
                                            height=height, 
                                            parking_lots=parking_lots, 
                                            icons_path=icons_path,
                                            horizontal_resize=horizontal_resize,
                                            vertical_resize=vertical_resize)
        
        img_io = BytesIO()
        base_image.save(img_io, 'JPEG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/jpeg', as_attachment=True, download_name="parking_map.jpg")

    @map_bp.route('/updateParking', methods=['POST'])
    def update_parking():
        data = json.loads(request.data)

        response=check_params(data=data,params=["parkingID","parkingName","height","width"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400
        
        parking_id=str(data["parkingID"])
        if not MapModel.parking_exists(parking_id=parking_id):
                return {"error": "This parking does not exist"}, 400
        parking_name=str(data["parkingName"])
        height = float(data["height"])
        width=float(data["width"])

        if(MapModel.update_parking(id_parking=parking_id,parking_name=parking_name,height=height,width=width)):
            return {"Succesfull": "updated succesfull"}, 200

    @map_bp.route('/deleteParking', methods=['DELETE'])
    def delete_parking():
        data = json.loads(request.data)

        response=check_params(data=data,params=["parkingID"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400
        
        parking_id=str(data["parkingID"])
        if not MapModel.parking_exists(parking_id=parking_id):
            return {"error": "This parking does not exist"}, 400
        
        MapModel.delete_parking(id_parking=parking_id)

        return {"response": "Parking elminated succesfully"}, 200


    return map_bp
