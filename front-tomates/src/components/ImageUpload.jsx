import { useRef, useState } from "react"
import { Upload, Camera, X } from "lucide-react"
import { CameraCapture } from "./CameraCapture"

export function ImageUpload({ onImageUpload, currentImage }) {
    const [dragActive, setDragActive] = useState(false)
    const [showCamera, setShowCamera] = useState(false)
    const inputRef = useRef(null)

    const handleFile = (file) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onloadend = () => {
                onImageUpload(file, reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleCameraCapture = (file, previewUrl) => {
        setShowCamera(false)
        onImageUpload(file, previewUrl)
    }

    return (
        <>
            {/* Modal de Cámara */}
            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}

            <div className="card-content">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                {!currentImage ? (
                    <div>
                        {/* Área de arrastrar/subir */}
                        <div
                            className="upload-area"
                            onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                            onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                            onDragOver={(e) => { e.preventDefault() }}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current.click()}
                            style={{ borderColor: dragActive ? 'var(--primary)' : '' }}
                        >
                            <Upload size={40} color="var(--muted-foreground)" style={{ marginBottom: 10 }} />
                            <p style={{ fontWeight: 500 }}>Haz clic o arrastra una imagen</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>PNG, JPG hasta 10MB</p>
                        </div>

                        {/* Separador */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '1rem 0',
                            gap: '1rem'
                        }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            <span style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>o</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>

                        {/* Botón de Cámara */}
                        <button
                            onClick={() => setShowCamera(true)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--muted)',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)'
                                e.currentTarget.style.background = '#fef2f2'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.background = 'var(--muted)'
                            }}
                        >
                            <Camera size={24} color="var(--primary)" />
                            <span style={{ fontWeight: 500 }}>Tomar foto con cámara</span>
                        </button>
                    </div>
                ) : (
                    <div className="image-preview">
                        <img src={currentImage} alt="Preview" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onImageUpload(null, null)
                            }}
                            style={{
                                position: 'absolute', top: 10, right: 10,
                                background: 'white', border: 'none', borderRadius: '50%',
                                padding: 5, cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}