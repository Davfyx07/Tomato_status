#!/bin/bash

# Script de despliegue para TomateScan API
# Uso: ./deploy.sh

echo "🚀 Iniciando despliegue de TomateScan API..."

# 1. Detener contenedor existente
echo "🛑 Deteniendo contenedor anterior..."
sudo docker stop tomato-app 2>/dev/null || true
sudo docker rm tomato-app 2>/dev/null || true

# 2. Construir nueva imagen
echo "🔨 Construyendo imagen Docker..."
sudo docker build -t tomato-app .

if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen"
    exit 1
fi

# 3. Ejecutar contenedor con acceso a dispositivos de entropía
echo "🐳 Iniciando contenedor..."
sudo docker run -d \
  --device /dev/urandom:/dev/urandom \
  --device /dev/random:/dev/random \
  -p 5000:5000 \
  --name tomato-app \
  --restart unless-stopped \
  tomato-app

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar el contenedor"
    exit 1
fi

# 4. Esperar 5 segundos y mostrar logs
echo "⏳ Esperando 5 segundos..."
sleep 5

echo ""
echo "📋 Logs del contenedor:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo docker logs tomato-app
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. Verificar estado
if sudo docker ps | grep -q tomato-app; then
    echo "✅ Contenedor ejecutándose correctamente"
    echo "🌐 API disponible en: http://localhost:5000"
    echo ""
    echo "📝 Comandos útiles:"
    echo "   Ver logs en tiempo real: sudo docker logs -f tomato-app"
    echo "   Detener contenedor: sudo docker stop tomato-app"
    echo "   Reiniciar contenedor: sudo docker restart tomato-app"
else
    echo "❌ El contenedor no está ejecutándose"
    echo "Ver logs completos con: sudo docker logs tomato-app"
    exit 1
fi
