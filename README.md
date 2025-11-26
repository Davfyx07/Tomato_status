# 🍅 TomateScan AI

Sistema de análisis inteligente de tomates usando visión por computadora y deep learning. Permite detectar, segmentar y clasificar tomates por su estado de maduración.

## 📋 Características

- **Detección y Segmentación (YOLO)**: Identifica tomates en imágenes y genera máscaras de segmentación precisas
- **Clasificación (EfficientNet)**: Clasifica tomates en 4 estados: Damaged, Old, Ripe, Unripe
- **Interfaz Web Intuitiva**: Frontend moderno con React y diseño responsive
- **Almacenamiento en la Nube**: Imágenes guardadas en AWS S3
- **Base de Datos**: MongoDB para persistencia de datos
- **Despliegue Escalable**: Backend en Docker, frontend en Vercel

## 🛠️ Tecnologías

### Backend
- **Python 3.11**
- **Flask** - Framework web
- **PyTorch 2.5.1** - Deep learning
- **TensorFlow 2.17.0** - Modelo de clasificación
- **Ultralytics YOLOv8** - Detección y segmentación
- **OpenCV** - Procesamiento de imágenes
- **AWS S3** - Almacenamiento
- **MongoDB** - Base de datos

### Frontend
- **React 18** con Vite
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **CSS Moderno** - Diseño personalizado

### Infraestructura
- **Docker** - Contenedorización
- **AWS EC2** - Servidor backend
- **Vercel** - Hosting frontend
- **ngrok** - Túnel HTTPS (temporal)

## 📁 Estructura del Proyecto

```
Tomato_status/
├── models/                              # Modelos de IA
│   ├── MODELO_FINAL_TOMATES_V4_150E.pt # YOLO segmentación
│   └── modelo_tomates_efficientnet.keras # EfficientNet clasificación
├── src/                                 # Código fuente backend
│   ├── ia_service.py                   # Lógica de IA
│   ├── s3.py                           # Integración AWS S3
│   └── db.py                           # Conexión MongoDB
├── front-tomates/                       # Frontend React
│   ├── src/
│   │   ├── App.jsx                     # Componente principal
│   │   ├── App.css                     # Estilos
│   │   └── components/
│   │       └── ImageUpload.jsx         # Componente de carga
│   └── package.json
├── app.py                               # Servidor Flask
├── Dockerfile                           # Configuración Docker
├── requirements.txt                     # Dependencias Python
├── deploy.sh                           # Script de despliegue
└── GUIA_PRESENTACION.md                # Guía del día de presentación
```

## 🚀 Instalación

### Requisitos Previos
- Python 3.11+
- Node.js 18+
- Docker
- Cuenta AWS (S3)
- Cuenta MongoDB Atlas
- ngrok (para desarrollo)

### Configuración Backend

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Tomato_status.git
cd Tomato_status
```

2. **Crear archivo `.env`**
```bash
# AWS S3
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-2
S3_BUCKET_NAME=tu-bucket

# MongoDB
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
MONGO_DB=nombre_db
MONGO_COLLECTION=nombre_coleccion
```

3. **Instalar dependencias Python**
```bash
pip install -r requirements.txt
```

4. **Colocar modelos en carpeta `models/`**
- `MODELO_FINAL_TOMATES_V4_150E.pt`
- `modelo_tomates_efficientnet.keras`

### Configuración Frontend

1. **Instalar dependencias**
```bash
cd front-tomates
npm install
```

2. **Configurar URL del backend**
Editar `src/App.jsx` línea 47 con la URL de ngrok:
```javascript
const res = await axios.post('https://tu-url.ngrok-free.app/analizar', formData)
```

## 🐳 Despliegue con Docker

### Desarrollo Local

```bash
# Construir imagen
docker build -t tomato-app .

# Ejecutar contenedor
docker run -d -p 5000:5000 --env-file .env --name tomato-app tomato-app

# Ver logs
docker logs -f tomato-app
```

### Despliegue en AWS EC2

1. **Conectar al servidor**
```bash
ssh -i Keyss.pem ubuntu@18.188.93.127
```

2. **Clonar repositorio o subir archivos**
```bash
git clone https://github.com/tu-usuario/Tomato_status.git
```

3. **Construir y ejecutar**
```bash
sudo docker build -t tomato-app .
sudo docker run -d -p 5000:5000 --env-file .env --name tomato-app tomato-app
```

4. **Iniciar túnel ngrok**
```bash
ngrok http 5000
```

5. **Actualizar URL en frontend** con la URL de ngrok

### Despliegue Frontend (Vercel)

```bash
cd front-tomates
vercel --prod
```

## 📖 Uso

1. **Iniciar el backend** (ver sección Despliegue)
2. **Iniciar ngrok** para obtener URL HTTPS
3. **Actualizar URL** en el frontend
4. **Desplegar frontend** en Vercel
5. **Abrir aplicación** en `https://tomato-status.vercel.app`
6. **Seleccionar modelo**:
   - **YOLO v8**: Detección y segmentación
   - **EfficientNet**: Clasificación de estado
7. **Cargar imagen** de tomate
8. **Analizar** y ver resultados

## 🔄 Actualizar Modelos

### YOLO (Segmentación)
```bash
# Subir nuevo modelo
scp -i Keyss.pem models/nuevo_modelo.pt ubuntu@18.188.93.127:~/models/MODELO_FINAL_TOMATES_V4_150E.pt

# Reiniciar contenedor
ssh -i Keyss.pem ubuntu@18.188.93.127 "sudo docker restart tomato-app"
```

### EfficientNet (Clasificación)
```bash
# Subir nuevo modelo
scp -i Keyss.pem models/nuevo_modelo.keras ubuntu@18.188.93.127:~/models/modelo_tomates_efficientnet.keras

# Reiniciar contenedor
ssh -i Keyss.pem ubuntu@18.188.93.127 "sudo docker restart tomato-app"
```

## 🛠️ Troubleshooting

### Error 500 en el backend
```bash
# Ver logs completos
ssh -i Keyss.pem ubuntu@18.188.93.127
sudo docker logs --tail 100 tomato-app
```

### Modelos no cargan
```bash
# Verificar que los archivos existen
ssh -i Keyss.pem ubuntu@18.188.93.127
ls -lh models/
```

### Frontend no conecta con backend
- Verificar que ngrok está corriendo
- Verificar que la URL en `App.jsx` es correcta
- Verificar CORS en `app.py`

### Docker sin espacio
```bash
# Limpiar imágenes y contenedores viejos
sudo docker system prune -a -f
```

## 📊 Modelos de IA

### YOLO v8 Segmentation
- **Tarea**: Detección y segmentación de instancias
- **Clases**: Tomate (con variantes de madurez)
- **Input**: Imágenes RGB
- **Output**: Máscaras de segmentación + bounding boxes

### EfficientNet B0
- **Tarea**: Clasificación multiclase
- **Clases**: Damaged, Old, Ripe, Unripe
- **Input**: 224x224 RGB
- **Output**: Probabilidades por clase

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte de un trabajo académico.

## 👥 Autores

- Tu Nombre - Juan David Lozano (Davfyx)
