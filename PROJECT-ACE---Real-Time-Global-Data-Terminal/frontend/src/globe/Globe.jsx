import { useRef, useEffect } from 'react'
import { useGlobe } from './useGlobe'

export default function Globe({ seismicLayers, ringsVisible, onPointClick, unfreezeSignal }) {
  const mountRef = useRef(null)
  const { unfreeze } = useGlobe(mountRef, seismicLayers, ringsVisible, onPointClick)

  useEffect(() => {
    if (unfreezeSignal) unfreeze()
  }, [unfreezeSignal])

  return (
    <div
      ref={mountRef}
      style={{
        width:    '100%',
        height:   '100vh',
        position: 'relative',
        cursor:   'grab',
      }}
    />
  )
}