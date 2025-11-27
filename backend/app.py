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
    # Configuración de validación
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    # 1. Validar que existe la imagen
    if 'imagen' not in request.files:
        return jsonify({"error": "No se recibió ninguna imagen"}), 400
    
    file = request.files['imagen']
    
    # 2. Validar nombre de archivo
    if file.filename == '' or not file.filename:
        return jsonify({"error": "Archivo vacío o sin nombre"}), 400
    
    # 3. Validar extensión
    if '.' not in file.filename:
        return jsonify({"error": "Archivo sin extensión válida"}), 400
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": f"Formato no soportado. Use: {', '.join(ALLOWED_EXTENSIONS).upper()}"}), 415
    
    # 4. Validar tamaño (aproximado, basado en content-length)
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    
    if size > MAX_FILE_SIZE:
        size_mb = size / (1024 * 1024)
        return jsonify({"error": f"Archivo muy grande ({size_mb:.1f}MB). Máximo permitido: 10MB"}), 413
    
    tipo_analisis = request.form.get('tipo_analisis', 'clasificacion')

    nombre_temp = "temp_" + file.filename
    
    try:
        file.save(nombre_temp)
    except Exception as e:
        print(f"❌ Error guardando archivo: {e}")
        return jsonify({"error": "Error al guardar el archivo"}), 500

    try:
        # Subir a S3
        try:
            with open(nombre_temp, 'rb') as f:
                url_publica = subir_archivo_a_s3(f, file.filename)
        except Exception as e:
            print(f"❌ Error S3: {e}")
            # Continuar sin S3, usar URL temporal
            url_publica = f"temp://{file.filename}"

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
        try:
            documento_mongo = {
                "fecha": datetime.now(),
                "nombre_archivo": file.filename,
                "url_imagen": url_publica,
                **resultado_parcial
            }
            
            col = get_db_collection()
            res_mongo = col.insert_one(documento_mongo)
            documento_mongo["_id"] = str(res_mongo.inserted_id)
        except Exception as e:
            print(f"⚠️ Error MongoDB: {e}")
            # Continuar sin guardar en BD
            documento_mongo = {
                "fecha": datetime.now().isoformat(),
                "nombre_archivo": file.filename,
                "url_imagen": url_publica,
                **resultado_parcial,
                "_id": "temp_no_guardado"
            }
        
        return jsonify(documento_mongo), 200

    except Exception as e:
        print(f"❌ Error procesando imagen: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Error procesando la imagen. Intente nuevamente."}), 500
    finally:
        # Limpiar archivo temporal
        if os.path.exists(nombre_temp):
            try:
                os.remove(nombre_temp)
            except Exception as e:
                print(f"⚠️ Error eliminando temporal: {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)