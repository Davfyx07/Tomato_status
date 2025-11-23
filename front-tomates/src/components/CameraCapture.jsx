import { useRef, useState, useCallback } from "react"
import { Camera, SwitchCamera, X, Check } from "lucide-react"

export function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [photo, setPhoto] = useState(null)
    const [facingMode, setFacingMode] = useState("environment") // Cámara trasera por defecto
    const [error, setError] = useState(null)

    const startCamera = useCallback(async () => {
        try {
            // Detener stream anterior si existe
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })

            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setError(null)
        } catch (err) {
            console.error("Error al acceder a la cámara:", err)
            setError("No se pudo acceder a la cámara. Verifica los permisos.")
        }
    }, [facingMode, stream])

    // Iniciar cámara al montar
    useState(() => {
        startCamera()
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const switchCamera = () => {
        setFacingMode(prev => prev === "environment" ? "user" : "environment")
        setTimeout(startCamera, 100)
    }

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setPhoto(dataUrl)

        // Pausar video
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
    }

    const retakePhoto = () => {
        setPhoto(null)
        startCamera()
    }

    const confirmPhoto = () => {
        if (!photo) return

        // Convertir dataURL a File
        fetch(photo)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' })
                onCapture(file, photo)
            })
    }

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
        onClose()
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'black',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)'
            }}>
                <button onClick={handleClose} style={{
                    background: 'none', border: 'none', color: 'white', cursor: 'pointer'
                }}>
                    <X size={28} />
                </button>
                <span style={{ color: 'white', fontWeight: 600 }}>📸 Capturar Tomate</span>
                <button onClick={switchCamera} style={{
                    background: 'none', border: 'none', color: 'white', cursor: 'pointer'
                }}>
                    <SwitchCamera size={28} />
                </button>
            </div>

            {/* Vista de cámara o foto */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {error ? (
                    <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                        <p>{error}</p>
                        <button onClick={startCamera} style={{
                            marginTop: '1rem', padding: '0.5rem 1rem',
                            background: 'var(--primary)', color: 'white',
                            border: 'none', borderRadius: '0.5rem', cursor: 'pointer'
                        }}>
                            Reintentar
                        </button>
                    </div>
                ) : !photo ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={() => videoRef.current?.play()}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <img src={photo} alt="Captura" style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }} />
                )}
            </div>

            {/* Canvas oculto para captura */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Controles */}
            <div style={{
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                background: 'rgba(0,0,0,0.5)'
            }}>
                {!photo ? (
                    <button onClick={takePhoto} style={{
                        width: 70, height: 70,
                        borderRadius: '50%',
                        background: 'white',
                        border: '4px solid var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Camera size={30} color="var(--primary)" />
                    </button>
                ) : (
                    <>
                        <button onClick={retakePhoto} style={{
                            padding: '1rem 2rem',
                            background: '#333',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <X size={20} /> Repetir
                        </button>
                        <button onClick={confirmPhoto} style={{
                            padding: '1rem 2rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Check size={20} /> Usar foto
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}