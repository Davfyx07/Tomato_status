FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias del sistema para OpenCV y shapely
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (para cache de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código y modelos
COPY . .

# Puerto
EXPOSE 5000

# Comando para iniciar
CMD ["python", "app.py"]