import boto3
import os
import mimetypes
from dotenv import load_dotenv

load_dotenv()

def subir_archivo_a_s3(archivo, nombre_archivo):
    bucket = os.getenv('AWS_BUCKET_NAME')
    region = os.getenv('AWS_REGION')
    
    # --- LÓGICA BLINDADA PARA DETECTAR TIPO ---
    # 1. Intentamos obtener el tipo si el objeto lo tiene (Flask)
    tipo_contenido = getattr(archivo, 'content_type', None)
    
    # 2. Si es None (porque viene de un open() local), adivinamos por el nombre
    if not tipo_contenido:
        tipo_contenido, _ = mimetypes.guess_type(nombre_archivo)
    
    # 3. Si sigue siendo None, ponemos el genérico
    if not tipo_contenido:
        tipo_contenido = 'application/octet-stream'

    print(f"--- SUBIENDO A AWS ---")
    print(f"Archivo: {nombre_archivo}")
    print(f"Tipo detectado: {tipo_contenido}")

    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY'),
        aws_secret_access_key=os.getenv('AWS_SECRET_KEY'),
        region_name=region
    )

    try:
        # Si es un archivo local abierto, nos aseguramos de estar al inicio
        if hasattr(archivo, 'seek'):
            archivo.seek(0)

        s3_client.upload_fileobj(
            archivo,
            bucket,
            nombre_archivo,
            ExtraArgs={'ContentType': tipo_contenido}
        )
        
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{nombre_archivo}"
        print(f"✅ Subida exitosa: {url}")
        return url

    except Exception as e:
        print(f"❌ ERROR AWS S3: {e}")
        return None