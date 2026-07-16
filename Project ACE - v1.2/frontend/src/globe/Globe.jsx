import { useRef, useEffect } from 'react'
import { useGlobe } from './useGlobe'

export default function Globe() {
  const mountRef = useRef(null)
  useGlobe(mountRef)

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