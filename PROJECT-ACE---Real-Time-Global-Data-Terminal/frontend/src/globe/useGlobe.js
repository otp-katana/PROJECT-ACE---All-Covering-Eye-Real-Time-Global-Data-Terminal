import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { feature } from 'topojson-client'

// MOCK KATMANI


const MOCK_FAULTS = [
  { name: 'NAF', points: [
    { lat: 40.7, lon: 30.4 }, { lat: 40.6, lon: 32.5 }, { lat: 40.5, lon: 35.0 }, { lat: 39.8, lon: 39.5 },
  ]},
  { name: 'EAF', points: [
    { lat: 38.5, lon: 39.3 }, { lat: 37.8, lon: 38.0 }, { lat: 37.0, lon: 37.0 },
  ]},
  { name: 'San Andreas', points: [
    { lat: 34.0, lon: -118.2 }, { lat: 36.0, lon: -120.0 }, { lat: 38.5, lon: -122.8 },
  ]},
  { name: 'Himalayan Front', points: [
    { lat: 28.0, lon: 84.0 }, { lat: 30.5, lon: 79.0 }, { lat: 33.0, lon: 74.0 },
  ]},
]

export function useGlobe(mountRef, seismicLayers, ringsVisible, onPointClick, magnitudeFilter, eruptionYearFilter, seismicEvents, onSelectionBoxChange) {
  const sceneRef    = useRef(null)
  const cameraRef   = useRef(null)
  const rendererRef = useRef(null)
  const globeRef    = useRef(null)
  const frameRef    = useRef(null)
  const ringsRef    = useRef([])
  const autoRotate  = useRef(true)

  const layersRef = useRef({ seismic: null, volcanic: null, faults: null })
  const isDragging = useRef(false)
  const shiftDragging = useRef(false)
  const boxSelectLock = useRef(false)
  const boxStart = useRef({ x: 0, y: 0 })
  const justFinishedBoxSelect = useRef(false)
  const solidSphereRef = useRef(null)
  const frozen = useRef(false)
  const selectedPointRef = useRef(null)
  const prevMouse   = useRef({ x: 0, y: 0 })


  // ANA useEFFECT
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
    const solidSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.995, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x08080f, transparent: true, opacity: 0.92
      })
    )
    globeGroup.add(solidSphere)
    solidSphereRef.current = solidSphere

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

    //  KATMANLAR------

    // ── Seismic katmanı — başlangıçta boş ve gizli ─────────────────────
    const seismicGroup = new THREE.Group()
    seismicGroup.visible = false
    globeGroup.add(seismicGroup)
    layersRef.current.seismic = seismicGroup

    // ── Volcanic katmanı — başlangıçta boş ve gizli ─────────────────────
    const volcanicGroup = new THREE.Group()
    volcanicGroup.visible = false
    globeGroup.add(volcanicGroup)
    layersRef.current.volcanic = volcanicGroup

    // ── Faults katmanı — başlangıçta boş ve gizli ───────────────────────
    const faultsGroup = new THREE.Group()
    faultsGroup.visible = false
    globeGroup.add(faultsGroup)
    layersRef.current.faults = faultsGroup

    // ── MOUSE ETKİLEŞİMLERİ ───────────────────────────────────────────────

    // ── Raycaster — nokta tıklama tespiti ────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const pointerNDC = new THREE.Vector2()


    // ── Seçim kutusu içindeki noktaları bul (ekran koordinatlarına projekte ederek) ──
    const getPointsInBox = (x1, y1, x2, y2) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2)
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2)

      const found = []

      const checkGroup = (layerGroup) => {
        if (!layerGroup || !layerGroup.visible) return
        layerGroup.children.forEach(pointGroup => {
          if (!pointGroup.visible) return
          const worldPos = new THREE.Vector3()
          pointGroup.getWorldPosition(worldPos)

          // Küre merkezi origin olduğu için: nokta kameraya bakan yarım kürede mi?
          const dotVal = worldPos.dot(camera.position)
          if (dotVal <= 0) return
          if (worldPos.dot(camera.position) <= 0) return  // arka yüzde, gizli

          const screenPos = worldPos.clone().project(camera)
          if (screenPos.z > 1) return

          const sx = (screenPos.x * 0.5 + 0.5) * rect.width
          const sy = (-screenPos.y * 0.5 + 0.5) * rect.height

          if (sx < minX || sx > maxX || sy < minY || sy > maxY) return

          found.push({ ...pointGroup.userData, screenX: sx, screenY: sy })
        })
      }

      checkGroup(layersRef.current.seismic)
      checkGroup(layersRef.current.volcanic)

      console.log('Box:', minX, minY, maxX, maxY)
      console.log('Found:', found)
      return found
    }

    const onClick = e => {
      if (isDragging.current) return

      if (justFinishedBoxSelect.current) {
        justFinishedBoxSelect.current = false
        return  // bu click, box-select'in doğal sonucu, görmezden gel
      }
      boxSelectLock.current = false   // ← eklendi
      onSelectionBoxChange?.(null)

      const rect = renderer.domElement.getBoundingClientRect()
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointerNDC, camera)

      const seismicGroup  = layersRef.current.seismic
      const volcanicGroup = layersRef.current.volcanic
      const targets = []

      // Sadece görünür (toggle açık) katmanların noktalarını hedef listesine al
      if (seismicGroup?.visible)  targets.push(...seismicGroup.children)
      if (volcanicGroup?.visible) targets.push(...volcanicGroup.children)

      // Küre yüzeyini de engel olarak ekle
      if (solidSphereRef.current) targets.push(solidSphereRef.current)

      const intersects = raycaster.intersectObjects(targets, true)

      if (intersects.length > 0) {
        const nearest = intersects[0].object

        // En yakın çarpışma küre yüzeyiyse, hiçbir noktaya tıklanmadı say
        if (nearest === solidSphereRef.current) return

        let obj = nearest
        while (obj && !obj.userData?.type) obj = obj.parent

        if (obj?.userData?.type) {
          const clicked = obj.userData
          const prev = selectedPointRef.current

          const isSamePoint = prev && prev.lat === clicked.lat && prev.lon === clicked.lon

          if (isSamePoint) {
            selectedPointRef.current = null
            frozen.current = false
            onPointClick?.(null)
          } else {
            selectedPointRef.current = clicked
            frozen.current = true
            onPointClick?.(clicked)
          }
        }
      }
    }

    const onHoverMove = e => {
    if (frozen.current) return

    const rect = renderer.domElement.getBoundingClientRect()
    pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointerNDC, camera)

    const seismicGroup  = layersRef.current.seismic
    const volcanicGroup = layersRef.current.volcanic
    const targets = []
    if (seismicGroup?.visible)  targets.push(...seismicGroup.children)
    if (volcanicGroup?.visible) targets.push(...volcanicGroup.children)
    if (solidSphereRef.current) targets.push(solidSphereRef.current)

    const intersects = raycaster.intersectObjects(targets, true)
    const hoveringPoint = intersects.length > 0 && intersects[0].object !== solidSphereRef.current

    renderer.domElement.style.cursor = hoveringPoint ? 'pointer' : (isDragging.current ? 'grabbing' : 'grab')
  }

    const onMouseDown = e => {
      if (frozen.current) return

      if (e.button === 0 && e.shiftKey) {
        if (autoRotate.current) return  // küre dönüyorsa seçim başlatılamaz

        const rect = renderer.domElement.getBoundingClientRect()
        shiftDragging.current = true
        boxStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        onSelectionBoxChange?.({ x1: boxStart.current.x, y1: boxStart.current.y, x2: boxStart.current.x, y2: boxStart.current.y })
        return
      }

      if (e.button === 0) {
        if (boxSelectLock.current) return  // panel açıkken normal sürüklemeyi engelle
        isDragging.current = true
        prevMouse.current  = { x: e.clientX, y: e.clientY }
      }
    }

    const onContextMenu = e => {
      e.preventDefault()
      if (frozen.current) return
      if (boxSelectLock.current) return
      autoRotate.current = !autoRotate.current
    }

    const onMouseMove = e => {
      if (frozen.current) return

      if (shiftDragging.current) {
        const rect = renderer.domElement.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        onSelectionBoxChange?.({ x1: boxStart.current.x, y1: boxStart.current.y, x2: x, y2: y })
        return
      }

      if (!isDragging.current) return
      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y
      globeGroup.rotation.x += dy * 0.007
      globeGroup.rotation.y += dx * 0.007
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = e => {
      if (shiftDragging.current) {
        shiftDragging.current = false
        justFinishedBoxSelect.current = true
        boxSelectLock.current = true   // ← eklendi
        const { x, y } = boxStart.current
        const rect = renderer.domElement.getBoundingClientRect()
        const endX = e.clientX - rect.left
        const endY = e.clientY - rect.top

        const points = getPointsInBox(x, y, endX, endY)
        onSelectionBoxChange?.({ x1: x, y1: y, x2: endX, y2: endY, points })
        return
      }
      if (e.button === 0) isDragging.current = false
    }

    // ── Scroll zoom ────────────────────────────────────────────────────
    const onWheel = e => {
      e.preventDefault()
      if (frozen.current) return
      if (boxSelectLock.current) return   // ← eklendi
      camera.position.z = Math.max(1.5, Math.min(5.0,
        camera.position.z + e.deltaY * 0.003
      ))
    }

    renderer.domElement.addEventListener('mousedown',     onMouseDown)
    renderer.domElement.addEventListener('contextmenu',   onContextMenu)
    renderer.domElement.addEventListener('wheel',         onWheel, { passive: false })
    renderer.domElement.addEventListener('click',         onClick)
    renderer.domElement.addEventListener('mousemove', onHoverMove)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)

    // ── Animasyon ──────────────────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      if (autoRotate.current && !isDragging.current && !frozen.current) {
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
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('mousemove', onHoverMove)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('resize',    onResize)
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])


  // useEFFECT KATMANI

  // ── Seismic katmanı — prop'tan gelen veriyle çiz ──────────────────────
  useEffect(() => {
    const group = layersRef.current.seismic
    if (!group) return

    group.children.forEach(pointGroup => {
      pointGroup.children.forEach(mesh => {
        mesh.geometry.dispose()
        mesh.material.dispose()
      })
    })
    group.clear()

    seismicEvents.forEach(q => {
      const phi   = (90 - q.lat) * Math.PI / 180
      const theta = (q.lon + 180) * Math.PI / 180
      const pos = new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      )

      const scale = q.mag / 5

      const pointGroup = new THREE.Group()
      pointGroup.userData = {
        type: 'seismic', lat: q.lat, lon: q.lon, mag: q.mag, place: q.place,
        depth: q.depth, time: q.time, updated: q.updated, felt: q.felt, tsunami: q.tsunami,
      }

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.012 * scale, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.95, depthWrite: false })
      )
      core.position.copy(pos)
      pointGroup.add(core)

      const halo1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.022 * scale, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xE8D5EF, transparent: true, opacity: 0.30, depthWrite: false })
      )
      halo1.position.copy(pos)
      pointGroup.add(halo1)

      const halo2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.034 * scale, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xBEAED5, transparent: true, opacity: 0.14, depthWrite: false })
      )
      halo2.position.copy(pos)
      pointGroup.add(halo2)

      group.add(pointGroup)
    })

    // Mevcut magnitude filtresini yeni çizilen noktalara uygula
    group.children.forEach(pointGroup => {
      const mag = pointGroup.userData?.mag ?? 0
      pointGroup.visible = mag >= (magnitudeFilter ?? 1.0)
    })
  }, [seismicEvents])
  
  // ── Volcanic katmanı — toggle'a göre doldur/gizle ────────────────────
  useEffect(() => {
    const group = layersRef.current.volcanic
    if (!group) return

    if (seismicLayers?.volcanic && group.children.length === 0) {
      fetch('http://localhost:8000/api/omori/volcanoes', { cache: 'no-store' })
        .then(r => r.json())
        .then(volcanoes => {
          volcanoes.forEach(v => {
            if (typeof v.lat !== 'number' || typeof v.lon !== 'number') return

            const phi   = (90 - v.lat) * Math.PI / 180
            const theta = (v.lon + 180) * Math.PI / 180
            const pos = new THREE.Vector3(
              -Math.sin(phi) * Math.cos(theta),
              Math.cos(phi),
              Math.sin(phi) * Math.sin(theta)
            )

            const scale = v.mag / 5

            const pointGroup = new THREE.Group()
            pointGroup.userData = { type: 'volcanic', lat: v.lat, lon: v.lon, mag: v.mag, place: v.place, lastEruption: v.last_eruption }

            const cone = new THREE.Mesh(
              new THREE.ConeGeometry(0.014 * scale, 0.032 * scale, 5),
              new THREE.MeshBasicMaterial({ color: 0xE8D5EF, transparent: true, opacity: 0.9, depthWrite: false })
            )
            cone.position.copy(pos)
            cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())
            cone.position.addScaledVector(pos.clone().normalize(), 0.014 * scale)
            pointGroup.add(cone)

            const halo1 = new THREE.Mesh(
              new THREE.SphereGeometry(0.024 * scale, 12, 12),
              new THREE.MeshBasicMaterial({ color: 0xE8D5EF, transparent: true, opacity: 0.22, depthWrite: false })
            )
            halo1.position.copy(pos)
            pointGroup.add(halo1)

            const halo2 = new THREE.Mesh(
              new THREE.SphereGeometry(0.038 * scale, 12, 12),
              new THREE.MeshBasicMaterial({ color: 0xBEAED5, transparent: true, opacity: 0.10, depthWrite: false })
            )
            halo2.position.copy(pos)
            pointGroup.add(halo2)

            group.add(pointGroup)
          })
        })
        .catch(err => console.error('GVP fetch failed:', err))
    }

    group.visible = !!seismicLayers?.volcanic
  }, [seismicLayers?.volcanic])

  // ── Faults katmanı — toggle'a göre doldur/gizle ──────────────────────
  useEffect(() => {
    const group = layersRef.current.faults
    if (!group) return

    if (seismicLayers?.faults && group.children.length === 0) {
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xE8A853, transparent: true, opacity: 0.85, depthWrite: false,
      })

      MOCK_FAULTS.forEach(fault => {
        const points = fault.points.map(({ lat, lon }) => {
          const phi   = (90 - lat) * Math.PI / 180
          const theta = (lon + 180) * Math.PI / 180
          const v = new THREE.Vector3(
            -Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
          )
          return v.multiplyScalar(1.002) // yüzeyden hafif dışa offset
        })

        const geo = new THREE.BufferGeometry().setFromPoints(points)
        group.add(new THREE.Line(geo, lineMat))
      })
    }

    group.visible = !!seismicLayers?.faults
  }, [seismicLayers?.faults])

  // ── Orbital halkalar — görünürlük toggle ─────────────────────────────
  useEffect(() => {
    ringsRef.current.forEach(r => {
      r.group.visible = ringsVisible ?? true
    })
  }, [ringsVisible])

  const unfreeze = () => {
  frozen.current = false
  selectedPointRef.current = null
  }

  // ── Magnitude filtresi — API'ye gitmeden sadece görünürlük ───────────
  useEffect(() => {
    const group = layersRef.current.seismic
    if (!group) return

    group.children.forEach(pointGroup => {
      const mag = pointGroup.userData?.mag ?? 0
      pointGroup.visible = mag >= (magnitudeFilter ?? 1.0)
    })
  }, [magnitudeFilter])

  // ── Eruption year filtresi — API'ye gitmeden sadece görünürlük ───────
  useEffect(() => {
    const group = layersRef.current.volcanic
    if (!group) return

    group.children.forEach(pointGroup => {
      const year = pointGroup.userData?.lastEruption
      // year null/undefined ise (tarih bilinmiyor) her zaman görünür kalsın
      pointGroup.visible = year == null || year >= (eruptionYearFilter ?? -10000)
    })
  }, [eruptionYearFilter])

  // ── Seismic katmanı — toggle görünürlüğü ──────────────────────────────
  useEffect(() => {
    const group = layersRef.current.seismic
    if (group) group.visible = !!seismicLayers?.seismic
  }, [seismicLayers?.seismic])

  return { sceneRef, globeRef, autoRotate, unfreeze }
}