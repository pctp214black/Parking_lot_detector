from flask import Flask, request, jsonify, send_file
from Routes.routes import register_routes
from flask_cors import CORS

def createNewApp(ComputerVisionModel, MapModel, UserModel,ParkingLotsModel):  
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 * 1024  # 10GB

    CORS(app)

    register_routes(app,ComputerVisionModel=ComputerVisionModel,MapModel=MapModel,UserModel=UserModel,ParkingLotsModel=ParkingLotsModel)

    return app  # Devuelve la instancia de la app