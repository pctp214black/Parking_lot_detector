from ultralytics import YOLO

class YOLOModel:
    def __init__(self,model_path):
        try:
            self.model = YOLO(model_path)
            self.model.overrides['verbose'] = False  # Desactiva los logs
        except Exception as e:
            raise RuntimeError(f"Error loading YOLO model: {e}")
        
    def get_objects(self, frame, threshold=0.5, exclude_classes=None):
        try:
            results = self.model(frame)[0]
            detections = []
            exclude_classes = exclude_classes or []

            for result in results.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = result
                class_name = results.names[int(class_id)].lower()

                if score > threshold and class_name not in exclude_classes:
                    detections.append((x1, y1, x2, y2, score, int(class_id)))

            return detections
        except Exception as e:
            raise RuntimeError(f"Error processing frame: {e}")