from PIL import Image

# Función para calcular la distancia euclidiana entre dos puntos
def calculate_distance(p1, p2):
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
    return overlap_area / box1_area > 0.4

def check_params(data={}, params=[]):
    return [param for param in params if not str(data.get(param, "")).strip()]    

def generate_parking_image(width, height, parking_lots, icons_path,horizontal_resize,vertical_resize):
    base_image = Image.new('RGB', (width, height), (109, 113, 115))
    for lot_id, lot in parking_lots.items():
        x1, x2, y1, y2 = int(lot["X1"]), int(lot["X2"]), int(lot["Y1"]), int(lot["Y2"])
        center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
        icon_path = select_icon(lot["Status"], x2 - x1, y2 - y1, icons_path)
        #resize( width, height)
        icon=Image.open(icon_path).resize((horizontal_resize, vertical_resize))
        base_image.paste(icon, (center_x - 20, center_y - 20), icon)
    return base_image

def select_icon(status, width, height, icons):
    if status == "Empty" or status=="UNDEFINED":
        return icons["vertical_empty"] if height > width else icons["horizontal_empty"]
    else:
        return icons["vertical_car"] if height > width else icons["horizontal_car"]