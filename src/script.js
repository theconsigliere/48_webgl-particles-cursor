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
scene.add(displacement.interactivePlane)

// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinates
displacement.screenCursor = new THREE.Vector2(999, 999)

// Mouse move
window.addEventListener("pointermove", (event) => {
  // Mouse coordinates
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1
})

/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128)

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
    console.log(intersections[0])
  }

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
