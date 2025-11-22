from flask import Flask, request, jsonify
from datetime import datetime
from src.s3 import subir_archivo_a_s3
from src.db import get_db_collection

app = Flask(__name__)

# Ruta principal para probar que el servidor vive
@app.route('/', methods=['GET'])
def home():
    return "¡El servidor está vivo y corriendo!"

# Ruta para subir la imagen
@app.route('/analizar', methods=['POST'])
def analizar():
    # 1. Validar si enviaron el archivo
    if 'imagen' not in request.files:
        return jsonify({"error": "No se encontró el campo 'imagen'"}), 400
    
    file = request.files['imagen']
    
    if file.filename == '':
        return jsonify({"error": "No seleccionaste ningún archivo"}), 400

    # 2. Crear un nombre único para el archivo
    # (Usamos la fecha/hora para que no se repitan nombres)
    nombre_archivo = f"{int(datetime.now().timestamp())}_{file.filename}"

    # 3. Subir a AWS S3
    print("Subiendo a S3...")
    url_publica = subir_archivo_a_s3(file, nombre_archivo)
    
    if not url_publica:
        return jsonify({"error": "Falló la subida a AWS"}), 500

    # 4. Guardar referencia en MongoDB Atlas
    print("Guardando en Mongo...")
    coleccion = get_db_collection()
    
    nuevo_analisis = {
        "fecha": datetime.now(),
        "nombre_archivo": nombre_archivo,
        "url_imagen": url_publica,
        "estado": "pendiente_analisis",
        # Aquí meteremos el resultado de la IA después
        "resultado_ia": None
    }
    
    resultado = coleccion.insert_one(nuevo_analisis)

    # 5. Responder al usuario
    return jsonify({
        "mensaje": "Éxito",
        "url_imagen": url_publica,
        "id_db": str(resultado.inserted_id)
    }), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)