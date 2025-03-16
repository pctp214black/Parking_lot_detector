from flask import Flask
from Controllers.maps import create_map_blueprint
from Controllers.users import create_user_blueprint
import json

def register_routes(app: Flask,ComputerVisionModel, MapModel, UserModel,ParkingLotsModel):
    # Registrar los Blueprints
    map_bp = create_map_blueprint(ComputerVisionModel=ComputerVisionModel,MapModel=MapModel,UserModel=UserModel,ParkingLotsModel=ParkingLotsModel)
    user_bp = create_user_blueprint(UserModel=UserModel,MapModel=MapModel)

    app.register_blueprint(map_bp, url_prefix="/maps")
    app.register_blueprint(user_bp, url_prefix="/users")

