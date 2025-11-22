import tensorflow as tf
from ultralytics import YOLO
from PIL import Image
import numpy as np
import os

# --- CONFIGURACIÓN ---
RUTA_YOLO = 'models/MODELO_FINAL_TOMATES_V4_150E.pt'
RUTA_KERAS = 'models/best_model.keras' 
NOMBRES_CLASES = ['Dañado', 'Viejo', 'Maduro', 'Verde']

modelo_yolo = None
modelo_keras = None

def iniciar_modelos():
    global modelo_yolo, modelo_keras
    print("⏳ Iniciando servicios de IA...")
    
    # 1. Cargar YOLO
    try:
        if os.path.exists(RUTA_YOLO):
            modelo_yolo = YOLO(RUTA_YOLO)
            print("✅ YOLO cargado.")
        else:
            print(f"⚠️ ERROR: No existe {RUTA_YOLO}")
    except Exception as e:
        print(f"❌ Error YOLO: {e}")

    # 2. Cargar EfficientNet (TRUCO: compile=False)
    try:
        if os.path.exists(RUTA_KERAS):
            # compile=False evita que el modelo trate de 'pensar' al cargar
            modelo_keras = tf.keras.models.load_model(RUTA_KERAS, compile=False)
            print("✅ EfficientNet cargado.")
        else:
            print(f"⚠️ ERROR: No existe {RUTA_KERAS}")
    except Exception as e:
        # Si falla aquí, el archivo .keras está dañado
        print(f"❌ Error EfficientNet (Archivo corrupto o incompatible): {e}")

def detectar_objetos(ruta_imagen):
    if modelo_yolo is None: return []
    # Confianza 0.45 para no detectar fantasmas
    resultados = modelo_yolo(ruta_imagen, conf=0.45, iou=0.45, max_det=3)
    detecciones = []
    for r in resultados:
        if r.masks is not None:
            for mask, box in zip(r.masks, r.boxes):
                coords = mask.xy[0].tolist()
                if len(coords) < 10: continue
                detecciones.append({
                    "objeto": modelo_yolo.names[int(box.cls[0])],
                    "confianza": round(float(box.conf[0]), 2),
                    "poligono": coords 
                })
    return detecciones

def clasificar_imagen(ruta_imagen):
    if modelo_keras is None: return "No disponible", 0.0
    try:
        # 1. FORZAR RGB (3 canales)
        img = Image.open(ruta_imagen).convert('RGB')
        # 2. FORZAR 224x224 (El estándar)
        img = img.resize((224, 224))
        # 3. Array y Batch
        img_array = np.array(img)
        img_batch = np.expand_dims(img_array, axis=0)

        # 4. Predecir
        prediccion = modelo_keras.predict(img_batch, verbose=0)
        
        indice = np.argmax(prediccion[0])
        nombre = NOMBRES_CLASES[indice]
        confianza = float(prediccion[0][indice]) * 100
        return nombre, confianza
    except Exception as e:
        print(f"❌ Error Clasificación: {e}")
        return "Error", 0.0