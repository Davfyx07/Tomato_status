import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input as eff_preprocess
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from ultralytics import YOLO
from PIL import Image
import numpy as np
import os

# --- CONFIGURACIÓN ---
RUTA_YOLO = 'models/MODELO_FINAL_TOMATES_V4_150E.pt'
RUTA_KERAS = 'models/modelo_tomates_efficientnet.keras'
RUTA_PESOS = 'models/pesos_efficientnet.weights.h5'

# ⚠️ IMPORTANTE: Este orden debe coincidir con el que imprimió el entrenamiento
NOMBRES_CLASES = ['Damaged', 'Old', 'Ripe', 'Unripe']

modelo_yolo = None
modelo_keras = None


def construir_modelo_inferencia(num_classes=4):
    """
    Reconstruye la arquitectura del modelo (sin augmentation)
    Útil cuando el .keras falla por versiones diferentes
    """
    base_model = EfficientNetB0(
        weights=None,
        include_top=False,
        input_shape=(224, 224, 3)
    )

    inputs = keras.Input(shape=(224, 224, 3))
    x = eff_preprocess(inputs)
    x = base_model(x, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.4)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax')(x)

    return Model(inputs, outputs, name="EfficientNet_Inferencia")


def iniciar_modelos():
    global modelo_yolo, modelo_keras
    print("⏳ Iniciando servicios de IA...")

    # 1. Cargar YOLO
    try:
        if os.path.exists(RUTA_YOLO):
            modelo_yolo = YOLO(RUTA_YOLO)
            print("✅ YOLO cargado.")
        else:
            print(f"⚠️ YOLO no encontrado: {RUTA_YOLO}")
    except Exception as e:
        print(f"❌ Error YOLO: {e}")

    # 2. Cargar EfficientNet (intenta .keras primero, luego .h5)
    try:
        if os.path.exists(RUTA_KERAS):
            # Opción A: Cargar modelo completo
            modelo_keras = tf.keras.models.load_model(RUTA_KERAS, compile=False)
            print("✅ EfficientNet cargado (.keras)")
        
        elif os.path.exists(RUTA_PESOS):
            # Opción B: Reconstruir arquitectura + cargar pesos
            print("⚠️ .keras no encontrado, usando pesos .h5...")
            modelo_keras = construir_modelo_inferencia(num_classes=len(NOMBRES_CLASES))
            modelo_keras.load_weights(RUTA_PESOS)
            print("✅ EfficientNet cargado (.h5 weights)")
        
        else:
            print(f"❌ No se encontró ningún modelo de clasificación")
            print(f"   Buscado: {RUTA_KERAS}")
            print(f"   Buscado: {RUTA_PESOS}")

    except Exception as e:
        print(f"❌ Error EfficientNet: {e}")
        
        # Intento de respaldo con pesos
        if os.path.exists(RUTA_PESOS):
            try:
                print("🔄 Intentando cargar con pesos de respaldo...")
                modelo_keras = construir_modelo_inferencia(num_classes=len(NOMBRES_CLASES))
                modelo_keras.load_weights(RUTA_PESOS)
                print("✅ EfficientNet cargado (respaldo .h5)")
            except Exception as e2:
                print(f"❌ Error en respaldo: {e2}")


def calcular_iou_poligonos(poly1, poly2):
    """Calcula Intersection over Union entre dos polígonos"""
    try:
        from shapely.geometry import Polygon
        p1 = Polygon(poly1)
        p2 = Polygon(poly2)
        if not p1.is_valid or not p2.is_valid:
            return 0
        inter = p1.intersection(p2).area
        union = p1.union(p2).area
        return inter / union if union > 0 else 0
    except:
        # Fallback: comparar centros
        c1 = (sum(p[0] for p in poly1)/len(poly1), sum(p[1] for p in poly1)/len(poly1))
        c2 = (sum(p[0] for p in poly2)/len(poly2), sum(p[1] for p in poly2)/len(poly2))
        dist = ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2)**0.5
        return 1 if dist < 50 else 0


def filtrar_detecciones_duplicadas(detecciones, iou_threshold=0.5):
    """Elimina detecciones superpuestas, dejando la de mayor confianza"""
    if len(detecciones) <= 1:
        return detecciones
    
    # Ordenar por confianza (mayor primero)
    detecciones = sorted(detecciones, key=lambda x: x['confianza'], reverse=True)
    
    filtradas = []
    for det in detecciones:
        es_duplicado = False
        for det_aceptada in filtradas:
            iou = calcular_iou_poligonos(det['poligono'], det_aceptada['poligono'])
            if iou > iou_threshold:
                es_duplicado = True
                break
        if not es_duplicado:
            filtradas.append(det)
    
    return filtradas


def detectar_objetos(ruta_imagen):
    """Detección con YOLO (segmentación)"""
    if modelo_yolo is None:
        return []
    
    # Bajamos iou a 0.3 para que YOLO sea más estricto internamente
    resultados = modelo_yolo(ruta_imagen, conf=0.5, iou=0.3, max_det=5)
    detecciones = []
    
    for r in resultados:
        if r.masks is not None:
            for mask, box in zip(r.masks, r.boxes):
                coords = mask.xy[0].tolist()
                if len(coords) < 10:
                    continue
                detecciones.append({
                    "objeto": modelo_yolo.names[int(box.cls[0])],
                    "confianza": round(float(box.conf[0]), 2),
                    "poligono": coords
                })
    
    # Filtrar duplicados (mismo tomate detectado 2 veces)
    detecciones = filtrar_detecciones_duplicadas(detecciones, iou_threshold=0.4)
    
    return detecciones


def clasificar_imagen(ruta_imagen):
    """Clasificación con EfficientNet"""
    if modelo_keras is None:
        return "Modelo no disponible", 0.0
    
    try:
        # 1. Cargar imagen y forzar RGB
        img = Image.open(ruta_imagen).convert('RGB')
        
        # 2. Redimensionar a 224x224
        img = img.resize((224, 224))
        
        # 3. Convertir a array y agregar dimensión batch
        img_array = np.array(img, dtype=np.float32)
        img_batch = np.expand_dims(img_array, axis=0)

        # 4. Predecir (el preprocesamiento ya está dentro del modelo)
        prediccion = modelo_keras.predict(img_batch, verbose=0)

        # 5. Obtener resultado
        indice = np.argmax(prediccion[0])
        nombre = NOMBRES_CLASES[indice]
        confianza = float(prediccion[0][indice]) * 100

        return nombre, confianza

    except Exception as e:
        print(f"❌ Error Clasificación: {e}")
        return "Error", 0.0