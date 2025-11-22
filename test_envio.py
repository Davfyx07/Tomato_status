import requests

# La URL de tu servidor local
url = 'http://127.0.0.1:5000/analizar'

# Abrimos la imagen que tienes en la carpeta
files = {'imagen': open('prueba.jpg', 'rb')}

print("Enviando imagen al servidor...")
try:
    # Hacemos la petición POST
    respuesta = requests.post(url, files=files)
    
    # Imprimimos lo que nos responde el servidor
    print("\n--- RESPUESTA DEL SERVIDOR ---")
    print(respuesta.json())
    print("------------------------------")
    
    if respuesta.status_code == 201:
        print("✅ ¡ÉXITO! La imagen se subió y se guardó.")
    else:
        print("❌ Algo falló.")

except Exception as e:
    print(f"Error de conexión: {e}")
    print("¿Seguro que corriste 'python app.py' en otra terminal?")