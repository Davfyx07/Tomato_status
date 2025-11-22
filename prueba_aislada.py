import os
# Desactivar logs basura de TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from PIL import Image
import numpy as np

# --- AJUSTA ESTOS DOS NOMBRES SI ES NECESARIO ---
NOMBRE_IMAGEN = "xdd.jpeg"         # Tu foto
NOMBRE_MODELO = "models/best_model.keras"  # Tu archivo

print(f"1. Cargando imagen: {NOMBRE_IMAGEN}")
if not os.path.exists(NOMBRE_IMAGEN):
    print("❌ ERROR: No encuentro la imagen. Revisa el nombre.")
    exit()

# --- PREPARACIÓN MANUAL ---
# Aquí forzamos 224 y RGB. Es imposible que salga 225 si esto se ejecuta.
img = Image.open(NOMBRE_IMAGEN).convert('RGB')
print(f"   -> Modo original: {img.mode}")

img = img.resize((224, 224))
print(f"   -> Tamaño forzado: {img.size}")

img_array = np.array(img)
print(f"   -> Shape del array: {img_array.shape}")
# TIENE QUE DECIR: (224, 224, 3)

img_batch = np.expand_dims(img_array, axis=0)

print("\n2. Cargando modelo...")
try:
    # compile=False evita errores de métricas
    model = tf.keras.models.load_model(NOMBRE_MODELO, compile=False)
    print("✅ Modelo cargado.")
except Exception as e:
    print(f"❌ Error cargando modelo: {e}")
    exit()

print("\n3. Prediciendo...")
try:
    pred = model.predict(img_batch)
    clases = ['Dañado', 'Viejo', 'Maduro', 'Verde']
    idx = np.argmax(pred[0])
    print(f"\n🎉 ¡FUNCIONÓ! Resultado: {clases[idx]} ({pred[0][idx]*100:.2f}%)")
except Exception as e:
    print(f"\n❌ ERROR AL PREDECIR: {e}")
    print("Si falla aquí con shape (224, 224, 3), el modelo está dañado internamente.")