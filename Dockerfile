FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para OpenCV y TensorFlow
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar cache de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY src/ ./src/
COPY app.py .

# Copiar modelos (IMPORTANTE: asegurarse de que existan)
COPY models/ ./models/

# Verificar que los modelos se copiaron correctamente
RUN echo "📂 Verificando modelos..." && \
    ls -lh models/ && \
    echo "✅ Modelos verificados"

# Puerto
EXPOSE 5000

# Variables de entorno para TensorFlow y PyTorch
ENV TF_CPP_MIN_LOG_LEVEL=2
ENV PYTHONHASHSEED=0
ENV TF_ENABLE_ONEDNN_OPTS=0
ENV TORCH_FORCE_WEIGHTS_ONLY_LOAD=0

# Comando para iniciar
CMD ["python", "app.py"]