from src.ia_service import iniciar_modelos, clasificar_imagen

# 1. Cargar
iniciar_modelos()

# 2. Probar
ruta_foto = "xdd.jpeg" # <--- CAMBIA ESTO POR EL NOMBRE DE TU FOTO REAL
print(f"Analizando: {ruta_foto}...")

diagnostico, prob = clasificar_imagen(ruta_foto)

print("\n" + "="*30)
print(f"🍅 RESULTADO: {diagnostico}")
print(f"📊 Confianza: {prob:.2f}%")
print("="*30)