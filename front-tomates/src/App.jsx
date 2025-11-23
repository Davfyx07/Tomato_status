import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Brain, Zap, RefreshCw } from "lucide-react"
import { ImageUpload } from "./components/ImageUpload.jsx"
import "./App.css"

// Colores para cada tipo de detección
const COLORES_ESTADO = {
  'Damaged': { fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444', text: '#fee2e2' },
  'Old': { fill: 'rgba(249, 115, 22, 0.3)', stroke: '#f97316', text: '#ffedd5' },
  'Ripe': { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#22c55e', text: '#dcfce7' },
  'Unripe': { fill: 'rgba(234, 179, 8, 0.3)', stroke: '#eab308', text: '#fef9c3' },
  'default': { fill: 'rgba(168, 85, 247, 0.35)', stroke: '#a855f7', text: '#f3e8ff' }
}

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [modelType, setModelType] = useState("segmentacion")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef(null)

  const handleImageUpload = (file, previewUrl) => {
    setFile(file)
    setPreview(previewUrl)
    setResult(null)
  }

  const resetApp = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  const handleProcess = async () => {
    if (!file) return
    setLoading(true)

    const formData = new FormData()
    formData.append('imagen', file)
    formData.append('tipo_analisis', modelType)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://18.188.93.127:5000'
      const res = await axios.post(`${apiUrl}/analizar`, formData)
      setResult(res.data)
    } catch (error) {
      console.error(error)
      alert("Error: Revisa la terminal de Python")
    } finally {
      setLoading(false)
    }
  }

  // Obtener dimensiones reales de la imagen cuando carga
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      })
    }
  }

  // Convertir puntos del polígono a string SVG
  const puntosToSvg = (puntos) => puntos.map(p => `${p[0]},${p[1]}`).join(' ')

  // Calcular centro del polígono para posicionar etiqueta
  const getCentroPoligono = (puntos) => {
    if (!puntos || puntos.length === 0) return { x: 0, y: 0 }
    const sumX = puntos.reduce((acc, p) => acc + p[0], 0)
    const sumY = puntos.reduce((acc, p) => acc + p[1], 0)
    return {
      x: sumX / puntos.length,
      y: Math.min(...puntos.map(p => p[1])) - 10 // Arriba del objeto
    }
  }

  // Obtener color según el estado
  const getColor = (estado) => COLORES_ESTADO[estado] || COLORES_ESTADO['default']

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          🍅 TomateScan AI
        </h1>
      </header>

      {/* MODO CONFIGURACIÓN (Sin resultados) */}
      {!result && (
        <div className="grid-layout">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Paso 1: Elige Modelo</h3>
            </div>
            <div className="card-content">
              <div className="model-selector">
                <div
                  className={`radio-item ${modelType === 'segmentacion' ? 'selected' : ''}`}
                  onClick={() => setModelType('segmentacion')}
                >
                  <Zap size={20} />
                  <div>
                    <b>YOLO v8</b>
                    <div style={{ fontSize: '0.7rem' }}>Detectar y segmentar</div>
                  </div>
                </div>
                <div
                  className={`radio-item ${modelType === 'clasificacion' ? 'selected' : ''}`}
                  onClick={() => setModelType('clasificacion')}
                >
                  <Brain size={20} />
                  <div>
                    <b>EfficientNet</b>
                    <div style={{ fontSize: '0.7rem' }}>Clasificar estado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Paso 2: Captura imagen</h3>
            </div>
            <ImageUpload onImageUpload={handleImageUpload} currentImage={preview} />
            {file && (
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleProcess}
                  disabled={loading}
                >
                  {loading ? "Analizando..." : "🚀 Iniciar Análisis"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODO RESULTADOS */}
      {result && (
        <div className="result-view">
          <button
            className="btn"
            onClick={resetApp}
            style={{
              marginBottom: '1rem',
              background: '#333',
              color: 'white',
              width: 'auto'
            }}
          >
            <RefreshCw size={16} style={{ marginRight: 5 }} />
            Analizar otro tomate
          </button>

          {/* RESULTADO SEGMENTACIÓN */}
          {result.modo === 'segmentacion' && (
            <div className="card" style={{ border: '2px solid var(--primary)' }}>
              <div className="card-header">
                <h3 className="card-title">🎯 Detección y Segmentación</h3>
                <p className="card-desc">
                  {result.objetos_detectados.length} objeto(s) detectado(s)
                </p>
              </div>
              <div className="card-content" style={{ padding: 0, position: 'relative' }}>
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Resultado"
                  onLoad={handleImageLoad}
                  style={{ width: '100%', display: 'block' }}
                />

                {/* SVG overlay con contornos y etiquetas */}
                {imageDimensions.width > 0 && (
                  <svg
                    className="overlay-svg"
                    viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                    preserveAspectRatio="none"
                  >
                    {result.objetos_detectados.map((obj, i) => {
                      const color = getColor(obj.objeto)
                      const centro = getCentroPoligono(obj.poligono)

                      return (
                        <g key={i}>
                          {/* Polígono/Contorno */}
                          <polygon
                            points={puntosToSvg(obj.poligono)}
                            fill={color.fill}
                            stroke={color.stroke}
                            strokeWidth="3"
                          />

                          {/* Etiqueta con fondo */}
                          <rect
                            x={centro.x - 60}
                            y={centro.y - 25}
                            width="120"
                            height="30"
                            rx="5"
                            fill={color.stroke}
                          />
                          <text
                            x={centro.x}
                            y={centro.y - 5}
                            textAnchor="middle"
                            fill="white"
                            fontSize="16"
                            fontWeight="bold"
                          >
                            {obj.objeto} {Math.round(obj.confianza * 100)}%
                          </text>

                          {/* Línea conectora */}
                          <line
                            x1={centro.x}
                            y1={centro.y}
                            x2={centro.x}
                            y2={centro.y + 20}
                            stroke={color.stroke}
                            strokeWidth="2"
                          />
                        </g>
                      )
                    })}
                  </svg>
                )}
              </div>

              {/* Lista de detecciones */}
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Resumen:</p>
                {result.objetos_detectados.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {result.objetos_detectados.map((obj, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '99px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          background: getColor(obj.objeto).stroke,
                          color: 'white'
                        }}
                      >
                        {obj.objeto}: {Math.round(obj.confianza * 100)}%
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    No se detectaron tomates en la imagen.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* RESULTADO CLASIFICACIÓN */}
          {result.modo === 'clasificacion' && (
            <div className="card" style={{ border: '2px solid var(--primary)', maxWidth: 500, margin: '0 auto' }}>
              <div className="card-header">
                <h3 className="card-title">🔬 Clasificación</h3>
              </div>
              <div className="card-content" style={{ padding: 0, position: 'relative' }}>
                <img
                  src={preview}
                  alt="Resultado"
                  style={{ width: '100%', display: 'block' }}
                />

                {/* Banner con resultado */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '3rem 1.5rem 1.5rem',
                  textAlign: 'center'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '2rem',
                    color: getColor(result.analisis_global.diagnostico).stroke
                  }}>
                    {result.analisis_global.diagnostico}
                  </h2>
                  <p style={{
                    margin: '0.5rem 0 0',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '1.1rem'
                  }}>
                    Confianza: {result.analisis_global.probabilidad}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App