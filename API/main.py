from Models.map import MapSQLiteModel
from Models.user import UserSQLiteModel
from Models.YOLO import YOLOModel
from Models.KMeansParkingLots import KMeansParkingLotsModel
from app import createNewApp
import os

model_path = os.path.join('.', 'Utils', 'ComputerVisionModels', 'best.pt')
computer_vision_model=YOLOModel(model_path=model_path)

database_path = os.path.join('.', 'parking_control.bd')
mapModel=MapSQLiteModel(database_path)
userModel=UserSQLiteModel(database_path)

# Crea la instancia de la app Flask
app = createNewApp(ComputerVisionModel=computer_vision_model, MapModel=mapModel, UserModel=userModel,ParkingLotsModel=KMeansParkingLotsModel)

if __name__ == '__main__':
    app.run(debug=True)  # Inicia el servidor Flask