import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# Tus módulos
from src.s3 import subir_archivo_a_s3
from src.db import get_db_collection
from src.ia_service import iniciar_modelos, detectar_objetos, clasificar_imagen

app = Flask(__name__)
CORS(app)

with app.app_context():
    iniciar_modelos()

@app.route('/analizar', methods=['POST'])
def analizar():
    # 1. Validaciones
    if 'imagen' not in request.files:
        return jsonify({"error": "Falta la imagen"}), 400
    file = request.files['imagen']
    
    # LEER LA OPCIÓN DEL USUARIO (Por defecto 'clasificacion' si no envían nada)
    tipo_analisis = request.form.get('tipo_analisis', 'clasificacion')

    # 2. Guardar temporalmente
    nombre_temp = "temp_" + file.filename
    file.save(nombre_temp)

    try:
        # A. Subir a AWS (Siempre necesario para el historial)
        with open(nombre_temp, 'rb') as f:
            url_publica = subir_archivo_a_s3(f, file.filename)

        # B. Ejecutar SOLO el modelo elegido
        resultado_parcial = {}
        
        print(f"🧠 Ejecutando modo: {tipo_analisis.upper()}")

        if tipo_analisis == 'segmentacion':
            # Solo YOLO
            detecciones = detectar_objetos(nombre_temp)
            resultado_parcial = {
                "modo": "segmentacion",
                "objetos_detectados": detecciones,
                "analisis_global": None # No corremos el otro
            }
            
        else: # 'clasificacion'
            # Solo EfficientNet
            diagnostico, probabilidad = clasificar_imagen(nombre_temp)
            resultado_parcial = {
                "modo": "clasificacion",
                "objetos_detectados": [], # No corremos YOLO
                "analisis_global": {
                    "diagnostico": diagnostico,
                    "probabilidad": round(probabilidad, 2)
                }
            }

        # C. Guardar en Mongo
        documento_mongo = {
            "fecha": datetime.now(),
            "nombre_archivo": file.filename,
            "url_imagen": url_publica,
            **resultado_parcial # Fusionamos los datos del análisis
        }
        
        col = get_db_collection()
        res_mongo = col.insert_one(documento_mongo)
        
        # Respuesta al usuario
        documento_mongo["_id"] = str(res_mongo.inserted_id)
        return jsonify(documento_mongo), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(nombre_temp):
            os.remove(nombre_temp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)