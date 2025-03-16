import sqlite3
import uuid


class MapSQLiteModel:
    def __init__(self, database_path):
        self.database_path = database_path

    #Crear una conexion de tipo "privado"
    def _connect(self):
        return sqlite3.connect(self.database_path)
    
    def get_parkings(self):
        query = """
            Select *
            From Parking;
        """
        parkings_response={}
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query)
                parkings=cursor.fetchall()
                for i,parking in enumerate(parkings):
                    parkings_response[i]={"parking_id":parking[0],"parking_name":parking[2],"height":parking[3],"width":parking[4]}
            return parkings_response
        except sqlite3.Error as e:
            print(f"Error al agregar el usuario: {e}")
            return None
        
    
    def create_parking(self,user_id,parking_name,height,width):
        new_uuid = str(uuid.uuid4())
        query = """
            INSERT INTO Parking (idParking, idUser, parkingName,height,width)
            VALUES (?, ?, ?, ?, ?);
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (new_uuid, user_id, parking_name, height,width))
                conn.commit()
            return new_uuid
        except sqlite3.Error as e:
            print(f"Error al agregar el usuario: {e}")
            return None
    
    def create_parking_lot(self,parking_id,parking_space_id,parking_lot_coordinates:list):
        query = """
            INSERT INTO ParkingSpace (idParking, idParkingSpace,idStatus, X1, Y1, X2, Y2)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (parking_id,parking_space_id, 1, parking_lot_coordinates[0],parking_lot_coordinates[1],parking_lot_coordinates[2],parking_lot_coordinates[3]))
                conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Error al agregar el usuario: {e}")
            return None

    def parking_exists(self,parking_id):
        query = """
            Select COUNT(*)
            From Parking
            Where idParking=?;
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (parking_id,))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchone()  # Obtener una única fila
            return response[0] > 0  # Devuelve True si existe, False si no
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None

    def get_parking_data(self,parking_id):
        query = """
            Select parkingName,height,width
            From Parking
            Where idParking=?;
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (parking_id,))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchone()  # Obtener una única fila
            return {"parking_name":response[0],"height":response[1],"width":response[2]} # Devuelve True si existe, False si no
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None
    
    def get_parking_lots(self,parking_id):
        query = """
            Select idParkingSpace, X1, X2, Y1, Y2, status
            From ParkingSpace
            INNER JOIN Status ON Status.idStatus=ParkingSpace.idStatus
            Where idParking=?;
        """
        parking_lots={}
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (parking_id,))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchall()  # Obtener una única fila
                for parking in response:
                    parking_lots[parking[0]]={"X1":parking[1],"X2":parking[2],"Y1":parking[3],"Y2":parking[4],"Status":parking[5]}
            return parking_lots
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None
    
    def update_parking(self,id_parking,parking_name,height,width):
        query = """
            UPDATE Parking SET parkingName=?, height=?, width=?
            WHERE idParking=?; 
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (parking_name,height,width,id_parking))
                conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Error al modificar el usuario: {e}")
            return None

    def upadate_parking_lot_status(self,id_parking,id_parking_space,id_status):
        query = """
            UPDATE ParkingSpace SET idStatus=?
            WHERE idParking=? AND idParkingSpace=?; 
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (2 if id_status else 3,id_parking,id_parking_space))
                conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Error al modificar el usuario: {e}")
            return None
        
    def get_user_maps(self,user_id):
        query = """
            SELECT Parking.*, (SELECT COUNT(*) FROM ParkingSpace WHERE ParkingSpace.idParking = Parking.idParking) AS parking_space_count
            FROM Parking
            LEFT JOIN User ON User.idUser = Parking.idUser
            WHERE User.idUser = ?;
        """
        parkings_response={}
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (user_id,))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchall()  # Obtener una única fila
                for i,parking in enumerate(response):
                    parkings_response[i]={"parking_id":parking[0],"parking_name":parking[2],"height":parking[3],"width":parking[4],"number_parking_lots":parking[5]}
            return parkings_response
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None
        
    def delete_parking(self,id_parking):
        delete_parking_spaces_query  = """
            DELETE
            FROM ParkingSpace
            WHERE idParking=?; 
        """
        
        delete_parking_query = """
            DELETE
            FROM Parking
            WHERE idParking=?; 
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute("BEGIN")  # Inicia una transacción explícita, es decir, si una falla se deshacen los cambios
                cursor.execute(delete_parking_spaces_query , (id_parking,))
                cursor.execute(delete_parking_query, (id_parking,))
                conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Error al agregar el usuario: {e}")
            return None
