import sqlite3
import hashlib
import uuid


class UserSQLiteModel:
    def __init__(self, database_path):
        self.database_path = database_path

    #Crear una conexion de tipo "privado"
    def _connect(self):
        return sqlite3.connect(self.database_path)

    def log_in(self,user_name,password):
        query = """
            Select idUser
            From User
            Where userName=? AND password=?;
        """
        hashed_password =str(hashlib.sha256(password.encode()).hexdigest())
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (user_name,hashed_password))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchone()  # Obtener una única fila
            return response  # Devuelve True si existe, False si no
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None


    def userName_exists(self,user_name):
        query = """
            Select COUNT(*)
            From User
            Where userName=?;
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (user_name,))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchone()  # Obtener una única fila
            return response[0] > 0  # Devuelve True si existe, False si no
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None
        
    def user_exists(self,user_id):
        query = """
            Select COUNT(*)
            From User
            Where idUser=?;
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (user_id,))  # Asegúrate de que el parámetro sea una tupla
                response = cursor.fetchone()  # Obtener una única fila
            return response[0] > 0  # Devuelve True si existe, False si no
        except sqlite3.Error as e:
            print(f"Error al verificar el usuario: {e}")
            return None

    #Agregar un nuevo usuario a la base de datos
    def add_user(self, user_name, password):
        new_uuid = str(uuid.uuid4())
        hashed_password =str(hashlib.sha256(password.encode()).hexdigest())
        query = """
            INSERT INTO User (idUser, userName, password)
            VALUES (?, ?, ?);
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (new_uuid, user_name, hashed_password))
                conn.commit()
            return new_uuid
        except sqlite3.Error as e:
            print(f"Error al agregar el usuario: {e}")
            return None
        
    def modify_user(self,user_id,user_name,password):
        hashed_password =str(hashlib.sha256(password.encode()).hexdigest())
        query = """
            UPDATE User SET userName=?,password=?
            WHERE idUser=?; 
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (user_name, hashed_password,user_id))
                conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Error al modificar el usuario: {e}")
            return None
        
    def delete_user(self,user_id):
        #Aqui debería modificar la tabla de estacionamientos, para los estacionamientos asociados al usuario
        query = """
            DELETE
            FROM User
            WHERE idUser=?; 
        """
        try:
            with self._connect() as conn:  # Cierre automático de la conexión
                cursor = conn.cursor()
                cursor.execute(query, (user_id,))
                conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Error al agregar el usuario: {e}")
            return None


