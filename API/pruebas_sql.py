import sqlite3

# Conexión a la base de datos
connection = sqlite3.connect("parking_control.bd")
cursor = connection.cursor()

# Leer el archivo SQL
with open("parking_control_bd.sql", "r") as file:
    sql_script = file.read()

# Ejecutar el script SQL
cursor.executescript(sql_script)

# Confirmar los cambios
connection.commit()
connection.close()

print("Archivo .sql ejecutado correctamente.")


# Entonces con estos cambios no voy a tener problema si uso uuid (aunque luego los pase a strings) y con los double para los REAL?