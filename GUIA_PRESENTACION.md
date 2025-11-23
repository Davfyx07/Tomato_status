# 🎓 Guía para Presentación - TomateScan AI

## 📋 Preparación (15 minutos antes de la clase)

### 1. Conectarte al servidor AWS via SSH

**En PowerShell (Windows):**
```powershell
cd C:\Users\Lenovo LOQ\Desktop\Tomato_status
ssh -i Keyss.pem ubuntu@18.188.93.127
```

---

### 2. Verificar que el contenedor Docker esté corriendo

**En SSH (Ubuntu):**
```bash
# Ver si el contenedor está corriendo
sudo docker ps

# Si NO está corriendo, iniciarlo:
sudo docker start tomato-app

# Ver los logs para confirmar que los modelos cargaron
sudo docker logs tomato-app --tail 20

# Deberías ver:
# ✅ YOLO cargado exitosamente
# ✅ EfficientNet cargado (.h5 weights)
```

---

### 3. Iniciar túnel HTTPS con ngrok

**En SSH (Ubuntu):**
```bash
# Iniciar ngrok (esto creará el túnel HTTPS)
ngrok http 5000
```

**Verás algo como:**
```
Forwarding  https://abc123-xyz.ngrok-free.dev -> http://localhost:5000
```

**⚠️ IMPORTANTE:** 
- **Copia esa URL HTTPS** (ejemplo: `https://abc123-xyz.ngrok-free.dev`)
- **NO CIERRES esta terminal SSH** - ngrok debe seguir corriendo durante toda la presentación

---

### 4. Actualizar el frontend con la nueva URL de ngrok

**En tu computadora local:**

1. Abre el archivo: `C:\Users\Lenovo LOQ\Desktop\Tomato_status\front-tomates\src\App.jsx`

2. Busca la línea 46 y **reemplaza** la URL con la que ngrok te dio:
   ```javascript
   const res = await axios.post('https://TU-URL-DE-NGROK-AQUI/analizar', formData)
   ```
   
   Ejemplo:
   ```javascript
   const res = await axios.post('https://abc123-xyz.ngrok-free.dev/analizar', formData)
   ```

3. **Guarda el archivo** (Ctrl + S)

---

### 5. Desplegar cambios a Vercel

**En PowerShell (Windows):**
```powershell
cd C:\Users\Lenovo LOQ\Desktop\Tomato_status\front-tomates

git add src/App.jsx
git commit -m "Update ngrok URL for presentation"
git push
```

**Espera 1-2 minutos** a que Vercel despliegue automáticamente.

---

### 6. Verificar que todo funciona

1. Abre tu navegador en: **https://tomato-status.vercel.app**
2. Sube una imagen de tomate
3. Selecciona el modelo (YOLO o EfficientNet)
4. Haz clic en "🚀 Iniciar Análisis"
5. **Debería funcionar** ✅

---

## 🚨 Solución de Problemas

### Si el contenedor Docker no está corriendo:
```bash
# Reconstruir y ejecutar
cd ~
sudo docker stop tomato-app && sudo docker rm tomato-app
sudo docker build -t tomato-app .
sudo docker run -d -p 5000:5000 --name tomato-app tomato-app
sudo docker logs -f tomato-app
```

### Si ngrok se cierra o da error:
```bash
# Reiniciar ngrok
ngrok http 5000
# Copia la NUEVA URL y actualiza App.jsx de nuevo
```

### Si el frontend da error 500:
- Verifica que ngrok esté corriendo en SSH
- Verifica que la URL en `App.jsx` sea la correcta
- Verifica que el contenedor Docker esté corriendo: `sudo docker ps`

---

## 📝 Resumen del flujo completo

```
1. SSH → Conectar al servidor
2. Docker → Verificar que esté corriendo
3. Ngrok → Iniciar túnel HTTPS
4. App.jsx → Actualizar URL de ngrok
5. Git → Commit y push
6. Vercel → Esperar deploy (1-2 min)
7. Browser → Probar en https://tomato-status.vercel.app
8. ✅ ¡Listo para presentar!
```

---

## ⏱️ Tiempo estimado total: **10-15 minutos**

---

## 🔗 Enlaces importantes

- **Frontend:** https://tomato-status.vercel.app
- **Ngrok Dashboard:** https://dashboard.ngrok.com
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 💡 Consejos para la presentación

1. **Prueba todo 30 minutos antes** de la clase
2. **Mantén la terminal SSH abierta** durante toda la presentación
3. **Ten imágenes de tomates listas** para demostrar
4. Si algo falla, **mantén la calma** y usa los comandos de solución de problemas

---

## 📞 Comandos útiles de emergencia

```bash
# Ver logs del contenedor en tiempo real
sudo docker logs -f tomato-app

# Reiniciar contenedor
sudo docker restart tomato-app

# Ver si el puerto 5000 está en uso
sudo netstat -tulpn | grep 5000

# Matar proceso en puerto 5000 (si está bloqueado)
sudo kill -9 $(sudo lsof -t -i:5000)
```

---

**¡Buena suerte en tu presentación! 🍅🚀**
