import { useRef, useEffect, useState } from 'react'
import { useGlobe } from './useGlobe'

export default function Globe({ seismicLayers, ringsVisible, onPointClick, unfreezeSignal, magnitudeFilter, eruptionYearFilter, seismicEvents }) {
  const mountRef = useRef(null)
  const [selectionBox, setSelectionBox] = useState(null)
  const { unfreeze } = useGlobe(mountRef, seismicLayers, ringsVisible, onPointClick, magnitudeFilter, eruptionYearFilter, seismicEvents, setSelectionBox)

  useEffect(() => {
    if (unfreezeSignal) unfreeze()
  }, [unfreezeSignal])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        ref={mountRef}
        style={{
          width:    '100%',
          height:   '100vh',
          position: 'relative',
          cursor:   'grab',
        }}
      />
      {selectionBox && (
        <div style={{
          position: 'absolute',
          left:   Math.min(selectionBox.x1, selectionBox.x2),
          top:    Math.min(selectionBox.y1, selectionBox.y2),
          width:  Math.abs(selectionBox.x2 - selectionBox.x1),
          height: Math.abs(selectionBox.y2 - selectionBox.y1),
          border: '1px solid rgba(190,174,213,0.9)',
          background: 'rgba(190,174,213,0.15)',
          pointerEvents: 'none',
          zIndex: 20,
        }} />
      )}

      {selectionBox?.points?.length > 0 && (
        <SelectionPanel
          box={selectionBox}
          onPointClick={onPointClick}
        />
      )}
    </div>
  )
}

function SelectionPanel({ box, onPointClick }) {
  const panelLeft = Math.max(box.x1, box.x2) + 10
  const panelTop  = Math.min(box.y1, box.y2)

  // Göreli konumları normalize et (kutu içindeki x/y oranı)
  const minX = Math.min(box.x1, box.x2), maxX = Math.max(box.x1, box.x2)
  const minY = Math.min(box.y1, box.y2), maxY = Math.max(box.y1, box.y2)
  const boxW = Math.max(maxX - minX, 1)
  const boxH = Math.max(maxY - minY, 1)

  const panelW = 160
  const panelH = 160

  return (
    <div style={{
      position: 'absolute',
      left: panelLeft,
      top:  panelTop,
      width:  panelW,
      height: panelH,
      background: 'rgba(249, 232, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '2px solid rgba(232, 213, 239, 0.6)',
      borderRadius: 12,
      zIndex: 25,
      overflow: 'hidden',
    }}>
      {box.points.map((p, i) => {
        const relX = (p.screenX - minX) / boxW
        const relY = (p.screenY - minY) / boxH
        const isVolcanic = p.type === 'volcanic'

        return (
          <div
            key={i}
            onClick={() => onPointClick?.(p)}
            title={`${p.place || 'Bilinmeyen'} — M${p.mag?.toFixed(1)}`}
            style={{
              position: 'absolute',
              left: `${relX * 100}%`,
              top:  `${relY * 100}%`,
              width: 10,
              height: 10,
              borderRadius: isVolcanic ? '2px' : '50%',
              background: isVolcanic ? '#E8D5EF' : '#FFFFFF',
              border: '1px solid rgba(80,60,120,0.6)',
              cursor: 'pointer',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 4px rgba(190,174,213,0.8)',
            }}
          />
        )
      })}
    </div>
  )
}