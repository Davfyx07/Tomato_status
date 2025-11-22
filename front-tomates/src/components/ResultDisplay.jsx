import { CheckCircle2, AlertCircle, ScanLine } from "lucide-react"

export function ResultDisplay({ result, loading, image }) {

    // Si no hay imagen ni resultado
    if (!image && !result) {
        return (
            <div className="card" style={{ height: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div className="card-content">
                    <div style={{ background: 'var(--muted)', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <ScanLine size={30} color="var(--muted-foreground)" />
                    </div>
                    <p style={{ fontWeight: 500 }}>Esperando imagen</p>
                    <p className="card-desc">Los resultados aparecerán aquí</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="card" style={{ height: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ border: '3px solid #eee', borderTopColor: 'var(--primary)', borderRadius: '50%', width: 30, height: 30, animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p>Procesando imagen...</p>
                </div>
            </div>
        )
    }

    if (!result) return null // Imagen cargada pero sin analizar aun

    const isSegmentacion = result.modo === 'segmentacion'

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Resultados del Análisis</h3>
                <p className="card-desc">Procesado exitosamente</p>
            </div>

            <div className="card-content">

                {/* SECCIÓN: CLASIFICACIÓN (EFFICIENTNET) */}
                {result.analisis_global && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--muted)', borderRadius: 'var(--radius)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>DIAGNÓSTICO GENERAL</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {result.analisis_global.diagnostico}
                            </span>
                            <span className="badge">
                                {result.analisis_global.probabilidad}% Confianza
                            </span>
                        </div>
                    </div>
                )}

                {/* SECCIÓN: SEGMENTACIÓN (YOLO) */}
                {isSegmentacion && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>Objetos Detectados</span>
                            <span className="badge">{result.objetos_detectados.length} encontrados</span>
                        </div>

                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {result.objetos_detectados.map((obj, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                    <span>{obj.objeto}</span>
                                    <span style={{ color: 'var(--muted-foreground)' }}>{(obj.confianza * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                            {result.objetos_detectados.length === 0 && <p className="card-desc">No se detectaron anomalías.</p>}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="green" /> Análisis completado y guardado en BD
                </div>

            </div>
        </div>
    )
}