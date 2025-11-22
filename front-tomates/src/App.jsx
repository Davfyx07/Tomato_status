import { useState } from "react"
import axios from "axios"
import { Brain, Zap, RefreshCw, Image as ImageIcon } from "lucide-react"
import { ImageUpload } from "./components/ImageUpload.jsx"
import "./App.css"

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [modelType, setModelType] = useState("segmentacion")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

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
      const res = await axios.post('http://localhost:5000/analizar', formData)
      setResult(res.data)
    } catch (error) {
      console.error(error)
      alert("Error: Revisa la terminal de Python")
    } finally {
      setLoading(false)
    }
  }

  const puntosToSvg = (puntos) => puntos.map(p => `${p[0]},${p[1]}`).join(' ')

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>🍅 TomateScan AI</h1>
      </header>

      {/* 1. SI NO HAY RESULTADOS: MODO CONFIGURACIÓN */}
      {!result && (
        <div className="grid-layout">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Paso 1: Elige Modelo</h3></div>
            <div className="card-content">
              <div className="model-selector">
                <div className={`radio-item ${modelType === 'segmentacion' ? 'selected' : ''}`}
                  onClick={() => setModelType('segmentacion')}>
                  <Zap size={20} /> <div><b>YOLO v8</b><div style={{ fontSize: '0.7rem' }}>Detectar Manchas</div></div>
                </div>
                <div className={`radio-item ${modelType === 'clasificacion' ? 'selected' : ''}`}
                  onClick={() => setModelType('clasificacion')}>
                  <Brain size={20} /> <div><b>EfficientNet</b><div style={{ fontSize: '0.7rem' }}>Diagnóstico</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Paso 2: Sube Imagen</h3></div>
            <div className="card-content">
              <ImageUpload onImageUpload={handleImageUpload} currentImage={preview} />
              {file && (
                <button className="btn btn-primary" onClick={handleProcess} disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? "Analizando..." : "🚀 Iniciar Análisis"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SI HAY RESULTADOS: MODO COMPARACIÓN (LADO A LADO) */}
      {result && (
        <div className="result-view">
          <button className="btn" onClick={resetApp} style={{ marginBottom: '1rem', background: '#333', color: 'white', width: 'auto' }}>
            <RefreshCw size={16} style={{ marginRight: 5 }} /> Analizar otro tomate
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* IZQUIERDA: ORIGINAL */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">📷 Original</h3></div>
              <div className="card-content" style={{ padding: 0 }}>
                <img src={preview} alt="Original" style={{ width: '100%', display: 'block' }} />
              </div>
            </div>

            {/* DERECHA: RESULTADO IA */}
            <div className="card" style={{ border: '2px solid var(--primary)' }}>
              <div className="card-header">
                <h3 className="card-title">
                  {result.modo === 'segmentacion' ? '🎯 Detección IA' : '🔬 Diagnóstico IA'}
                </h3>
              </div>

              <div className="card-content" style={{ padding: 0, position: 'relative' }}>
                {/* La imagen de fondo (Misma que la original) */}
                <img src={preview} alt="Resultado" style={{ width: '100%', display: 'block' }} />

                {/* CAPA 1: POLÍGONOS (Solo Segmentación) */}
                {result.modo === 'segmentacion' && (
                  <svg className="overlay-svg" viewBox="0 0 640 640" preserveAspectRatio="none">
                    {result.objetos_detectados.map((obj, i) => (
                      <polygon key={i} points={puntosToSvg(obj.poligono)}
                        fill="rgba(255, 0, 0, 0.3)" stroke="yellow" strokeWidth="3" />
                    ))}
                  </svg>
                )}

                {/* CAPA 2: ETIQUETAS DE TEXTO ENCIMA DE LA FOTO */}
                {result.modo === 'clasificacion' && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                    background: 'rgba(0,0,0,0.7)', color: 'white', padding: '15px', textAlign: 'center'
                  }}>
                    <h2 style={{ margin: 0, color: result.analisis_global.diagnostico === 'Verde' ? '#4ade80' : '#f87171' }}>
                      {result.analisis_global.diagnostico}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.8 }}>Confianza: {result.analisis_global.probabilidad}%</p>
                  </div>
                )}
              </div>

              {/* LISTA DE DETALLES DEBAJO */}
              {result.modo === 'segmentacion' && (
                <div style={{ padding: '1rem' }}>
                  <p><strong>Objetos encontrados:</strong> {result.objetos_detectados.length}</p>
                  <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                    {result.objetos_detectados.map((o, i) => (
                      <li key={i}>{o.objeto} ({o.confianza * 100}%)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default App