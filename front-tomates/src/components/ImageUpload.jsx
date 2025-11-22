import { useRef, useState } from "react"
import { Upload, Image as ImageIcon, X } from "lucide-react"

export function ImageUpload({ onImageUpload, currentImage }) {
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef(null)

    const handleFile = (file) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onloadend = () => {
                onImageUpload(file, reader.result) // Devolvemos archivo y preview
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

    return (
        <div className="card-content">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            {!currentImage ? (
                <div
                    className="upload-area"
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current.click()}
                    style={{ borderColor: dragActive ? 'var(--primary)' : '' }}
                >
                    <Upload size={40} color="var(--muted-foreground)" style={{ marginBottom: 10 }} />
                    <p style={{ fontWeight: 500 }}>Haz clic o arrastra una imagen</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>PNG, JPG hasta 10MB</p>
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
    )
}