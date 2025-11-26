import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

from src.s3 import subir_archivo_a_s3
from src.db import get_db_collection
from src.ia_service import iniciar_modelos, detectar_objetos, clasificar_imagen

app = Flask(__name__)

# CORS - Permitir tu frontend (ajusta el dominio cuando despliegues)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "https://tomato-status.vercel.app",
    "*"
])

# Cargar modelos al iniciar
with app.app_context():
    iniciar_modelos()

@app.route('/', methods=['GET'])
def health_check():
    """Endpoint para verificar que el servidor está vivo"""
    return jsonify({"status": "ok", "message": "TomateScan API funcionando"}), 200

@app.route('/analizar', methods=['POST'])
def analizar():
    if 'imagen' not in request.files:
        return jsonify({"error": "Falta la imagen"}), 400
    
    file = request.files['imagen']
    tipo_analisis = request.form.get('tipo_analisis', 'clasificacion')

    nombre_temp = "temp_" + file.filename
    file.save(nombre_temp)

    try:
        # Subir a S3
        with open(nombre_temp, 'rb') as f:
            url_publica = subir_archivo_a_s3(f, file.filename)

        resultado_parcial = {}
        print(f"🧠 Ejecutando modo: {tipo_analisis.upper()}")

        if tipo_analisis == 'segmentacion':
            detecciones = detectar_objetos(nombre_temp)
            resultado_parcial = {
                "modo": "segmentacion",
                "objetos_detectados": detecciones,
                "analisis_global": None
            }
        else:
            diagnostico, probabilidad = clasificar_imagen(nombre_temp)
            resultado_parcial = {
                "modo": "clasificacion",
                "objetos_detectados": [],
                "analisis_global": {
                    "diagnostico": diagnostico,
                    "probabilidad": round(probabilidad, 2)
                }
            }

        # Guardar en MongoDB
        documento_mongo = {
            "fecha": datetime.now(),
            "nombre_archivo": file.filename,
            "url_imagen": url_publica,
            **resultado_parcial
        }
        
        col = get_db_collection()
        res_mongo = col.insert_one(documento_mongo)
        documento_mongo["_id"] = str(res_mongo.inserted_id)
        
        return jsonify(documento_mongo), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(nombre_temp):
            os.remove(nombre_temp)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)