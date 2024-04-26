import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import particlesVertexShader from "./shaders/particles/vertex.glsl"
import particlesFragmentShader from "./shaders/particles/fragment.glsl"

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  // Materials
  particlesMaterial.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  )

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setClearColor("#181818")
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// DISPLACEMENT

const displacement = {}

// 2D canvas
displacement.canvas = document.createElement("canvas")
displacement.canvas.width = 128
displacement.canvas.height = 128
displacement.canvas.style.position = "fixed"
displacement.canvas.style.width = "256px"
displacement.canvas.style.height = "256px"
displacement.canvas.style.top = 0
displacement.canvas.style.left = 0
displacement.canvas.style.zIndex = 10
document.body.append(displacement.canvas)

// context
displacement.context = displacement.canvas.getContext("2d")
//draw
displacement.context.fillRect(
  0,
  0,
  displacement.canvas.width,
  displacement.canvas.height
)

// Glow image
displacement.glowImage = new Image()
displacement.glowImage.src = "./glow.png"

// Interactive plane
displacement.interactivePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: "red" })
)
displacement.interactivePlane.visible = false
scene.add(displacement.interactivePlane)

// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinates
displacement.screenCursor = new THREE.Vector2(999, 999)
displacement.canvasCursor = new THREE.Vector2(999, 999)

// Mouse move
window.addEventListener("pointermove", (event) => {
  // Mouse coordinates
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1
})

// make texture out of the canvas
displacement.texture = new THREE.CanvasTexture(displacement.canvas)

/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128)

// RANDOM INTENSITY
const intensitiesArray = new Float32Array(
  particlesGeometry.attributes.position.count
)

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensitiesArray[i] = Math.random()
}

particlesGeometry.setAttribute(
  "aIntensity",
  new THREE.BufferAttribute(intensitiesArray, 1)
)

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      )
    ),
    uPictureTexture: new THREE.Uniform(textureLoader.load("./picture-3.png")),
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
  },
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  //RAYCASTER
  displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
  // TEST INTERSECT
  const intersections = displacement.raycaster.intersectObject(
    displacement.interactivePlane
  )

  if (intersections.length) {
    // When intersecting with a geometry including a uv attribute, we get the uv coordinates. No need for complex calculations.
    const uv = intersections[0].uv

    // Update canvas cursor
    // update the canvasCursor using the uv and multiply by the canvas.width and canvas.height so that we transform from normalized coordinates to canvas coordinates:
    displacement.canvasCursor.x = uv.x * displacement.canvas.width
    displacement.canvasCursor.y = (1.0 - uv.y) * displacement.canvas.height
  }

  // Fade out CANVAS WHEN CURSOR IS OVER THE PLANE
  displacement.context.globalCompositeOperation = "source-over"
  displacement.context.globalAlpha = 0.02
  displacement.context.fillRect(
    0,
    0,
    displacement.canvas.width,
    displacement.canvas.height
  )

  // call drawImage to draw the glow image at the canvasCursor coordinates
  // Draw glow
  const glowSize = displacement.canvas.width * 0.25
  displacement.context.globalCompositeOperation = "lighten"
  displacement.context.globalAlpha = 1
  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCursor.x - glowSize * 0.5,
    displacement.canvasCursor.y - glowSize * 0.5,
    glowSize,
    glowSize
  )

  // Texture
  displacement.texture.needsUpdate = true

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
