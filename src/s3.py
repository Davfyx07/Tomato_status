import boto3
import os
import mimetypes  # <--- IMPORTANTE: Librería para detectar tipos de archivo
from dotenv import load_dotenv
from botocore.exceptions import NoCredentialsError, ClientError

load_dotenv()

def subir_archivo_a_s3(archivo, nombre_archivo):
    bucket = os.getenv('AWS_BUCKET_NAME')
    region = os.getenv('AWS_REGION')
    
    # --- LÓGICA INTELIGENTE DE TIPOS ---
    # 1. Intentamos tomar el tipo que dice el navegador/cliente
    tipo_contenido = archivo.content_type
    
    # 2. Si viene vacío (None), intentamos adivinarlo por la extensión (.png, .jpg)
    if not tipo_contenido:
        tipo_contenido, _ = mimetypes.guess_type(nombre_archivo)
    
    # 3. Si aun así falla, ponemos un valor genérico por seguridad
    if not tipo_contenido:
        tipo_contenido = 'application/octet-stream' # Tipo genérico para "archivo binario"

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
        s3_client.upload_fileobj(
            archivo,
            bucket,
            nombre_archivo,
            ExtraArgs={'ContentType': tipo_contenido} # Ahora enviamos el tipo correcto
        )
        
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{nombre_archivo}"
        print(f"✅ ¡Subida exitosa! URL: {url}")
        return url

    except Exception as e:
        print(f"❌ ERROR AWS S3: {e}")
        return None