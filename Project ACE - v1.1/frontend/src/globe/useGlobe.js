import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { feature } from 'topojson-client'

export function useGlobe(mountRef) {
  const sceneRef    = useRef(null)
  const cameraRef   = useRef(null)
  const rendererRef = useRef(null)
  const globeRef    = useRef(null)
  const frameRef    = useRef(null)
  const ringsRef    = useRef([])
  const autoRotate  = useRef(true)

  const isDragging  = useRef(false)
  const prevMouse   = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!mountRef.current) return

    const width  = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    // ── Sahne ──────────────────────────────────────────────────────────
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 2.8

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    sceneRef.current    = scene
    cameraRef.current   = camera
    rendererRef.current = renderer

    // ── Ana küre grubu — halkalar dahil her şey buraya ─────────────────
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)
    globeRef.current = globeGroup

    // ── İç dolgu küre ──────────────────────────────────────────────────
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.995, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x08080f, transparent: true, opacity: 0.92
      })
    ))

    // ── Tel kafes küre ─────────────────────────────────────────────────
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshBasicMaterial({
        color:       0xCCC8D8,
        wireframe:   true,
        transparent: true,
        opacity:     0.18,
      })
    ))

    // ── Glow ───────────────────────────────────────────────────────────
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0xBEAED5, transparent: true, opacity: 0.04, side: THREE.BackSide
      })
    ))

    // ── Kıtalar ────────────────────────────────────────────────────────
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(r => r.json())
      .then(world => {
        const countries = feature(world, world.objects.countries)
        const lineMat   = new THREE.LineBasicMaterial({
          color: 0xE8D5EF, transparent: true, opacity: 0.6
        })

        const processRing = ring => {
          const points = ring.map(([lon, lat]) => {
            const phi   = (90 - lat)  * Math.PI / 180
            const theta = (lon + 180) * Math.PI / 180
            return new THREE.Vector3(
              -Math.sin(phi) * Math.cos(theta),
               Math.cos(phi),
               Math.sin(phi) * Math.sin(theta)
            )
          })
          if (points.length < 2) return
          const geo = new THREE.BufferGeometry().setFromPoints(points)
          globeGroup.add(new THREE.Line(geo, lineMat))
        }

        countries.features.forEach(country => {
          const { type, coordinates } = country.geometry ?? {}
          if (!coordinates) return
          if (type === 'Polygon')
            coordinates.forEach(processRing)
          else if (type === 'MultiPolygon')
            coordinates.forEach(poly => poly.forEach(processRing))
        })
      })

    // ── Orbital halkalar — globeGroup içinde ───────────────────────────
    const ringConfigs = [
      { radius: 1.38, tube: 0.003, rotX: Math.PI / 2.2, rotZ: 0.3,  speed: 0.004  },
      { radius: 1.48, tube: 0.002, rotX: Math.PI / 3.5, rotZ: -0.5, speed: -0.003 },
      { radius: 1.28, tube: 0.002, rotX: Math.PI / 5,   rotZ: 1.1,  speed: 0.002  },
    ]

    const rings = []
    ringConfigs.forEach(cfg => {
      // Her halka kendi grubu içinde — kendi ekseni etrafında döner
      const ringGroup = new THREE.Group()
      ringGroup.rotation.x = cfg.rotX
      ringGroup.rotation.z = cfg.rotZ

     // Halka — ana
const ringMain = new THREE.Mesh(
  new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 120),
  new THREE.MeshBasicMaterial({
    color:      0xD4B8F0,
    transparent: true,
    opacity:    0.80,
    depthWrite: false,
  })
)
ringGroup.add(ringMain)

// Halka arka — ince, soluk
const ringBack = new THREE.Mesh(
  new THREE.TorusGeometry(cfg.radius, cfg.tube * 0.4, 16, 120),
  new THREE.MeshBasicMaterial({
    color:      0x8A7FA0,
    transparent: true,
    opacity:    0.25,
    depthWrite: false,
    side:       THREE.BackSide,
  })
)
ringGroup.add(ringBack)

// Hale — halkanın etrafında yumuşak parıltı
const ringHalo = new THREE.Mesh(
  new THREE.TorusGeometry(cfg.radius, cfg.tube * 2.5, 16, 120),
  new THREE.MeshBasicMaterial({
    color:      0xBEAED5,
    transparent: true,
    opacity:    0.45,
    depthWrite: false,
  })
)
ringGroup.add(ringHalo)

      // Nod çekirdek — saf beyaz
const nod = new THREE.Mesh(
  new THREE.SphereGeometry(0.022, 12, 12),
  new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, transparent: true, opacity: 0.95
  })
)
nod.position.set(cfg.radius, 0, 0)
ringGroup.add(nod)

// Hale 1 — orta
const halo1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.038, 12, 12),
  new THREE.MeshBasicMaterial({
    color: 0xE8D5EF, transparent: true, opacity: 0.30
  })
)
halo1.position.set(cfg.radius, 0, 0)
ringGroup.add(halo1)

// Hale 2 — dış yumuşak
const halo2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.058, 12, 12),
  new THREE.MeshBasicMaterial({
    color: 0xBEAED5, transparent: true, opacity: 0.12
  })
)
halo2.position.set(cfg.radius, 0, 0)
ringGroup.add(halo2)

      // Halka grubunu küre grubuna ekle — küreyle birlikte döner
      globeGroup.add(ringGroup)
      rings.push({ group: ringGroup, speed: cfg.speed })
    })
    ringsRef.current = rings

    // ── Mouse etkileşimi ───────────────────────────────────────────────
    const onMouseDown = e => {
      if (e.button === 0) {
        isDragging.current = true
        prevMouse.current  = { x: e.clientX, y: e.clientY }
      }
    }

    const onContextMenu = e => {
      e.preventDefault()
      autoRotate.current = !autoRotate.current
    }

    const onMouseMove = e => {
      if (!isDragging.current) return
      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y
      globeGroup.rotation.x += dy * 0.007
      globeGroup.rotation.y += dx * 0.007
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = e => {
      if (e.button === 0) isDragging.current = false
    }

    // ── Scroll zoom ────────────────────────────────────────────────────
    const onWheel = e => {
      e.preventDefault()
      camera.position.z = Math.max(1.5, Math.min(5.0,
        camera.position.z + e.deltaY * 0.003
      ))
    }

    renderer.domElement.addEventListener('mousedown',     onMouseDown)
    renderer.domElement.addEventListener('contextmenu',   onContextMenu)
    renderer.domElement.addEventListener('wheel',         onWheel, { passive: false })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)

    // ── Animasyon ──────────────────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      if (autoRotate.current && !isDragging.current) {
        globeGroup.rotation.y += 0.0012
      }

      // Halkalar kendi ekseni etrafında döner
      ringsRef.current.forEach(r => {
        r.group.rotation.y += r.speed
      })

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ─────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Temizlik ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameRef.current)
      renderer.domElement.removeEventListener('mousedown',   onMouseDown)
      renderer.domElement.removeEventListener('contextmenu', onContextMenu)
      renderer.domElement.removeEventListener('wheel',       onWheel)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('resize',    onResize)
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return { sceneRef, globeRef, autoRotate }
}