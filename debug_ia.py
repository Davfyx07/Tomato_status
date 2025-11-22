from src.ia_service import iniciar_modelos, detectar_objetos, clasificar_imagen

# 1. Cargar Cerebros
iniciar_modelos()

IMAGEN = "xdd.jpeg" # <--- Tu foto de prueba

print("\n" + "="*30)
print(" PRUEBA 1: EFFICIENTNET")
print("="*30)
diag, prob = clasificar_imagen(IMAGEN)
print(f"Resultado: {diag} ({prob:.2f}%)")

print("\n" + "="*30)
print(" PRUEBA 2: YOLO")
print("="*30)
dets = detectar_objetos(IMAGEN)
print(f"Objetos detectados: {len(dets)}")
for d in dets:
    print(f" - {d['objeto']}: {d['confianza']*100}%")