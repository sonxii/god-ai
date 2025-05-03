
let hasStarted = false;

function pollStartTrigger() {
  fetch("/api/shouldStart")
    .then(res => res.json())
    .then(data => {
      if (data.shouldStart && !hasStarted) {
        hasStarted = true;
        startTextSequence();
      } else if (!hasStarted) {
        setTimeout(pollStartTrigger, 1000);
      }
    });
}
pollStartTrigger();

let camera, scene, renderer, particles, material, geometry;
let textIndex = 0;
let textureLoader = new THREE.TextureLoader();
let particleTexture = textureLoader.load('/static/circle.png');

init();

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 500;

  scene = new THREE.Scene();
  geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 10000; i++) {
    positions.push((Math.random() - 0.5) * 800);
    positions.push((Math.random() - 0.5) * 800);
    positions.push((Math.random() - 0.5) * 800);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  material = new THREE.PointsMaterial({
    size: 2.0,
    map: particleTexture,
    alphaTest: 0.5,
    transparent: true,
    color: 0xffffff
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('particle-canvas'), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.001;
  renderer.render(scene, camera);
}

function startTextSequence() {
  console.log("Triggered text animation");
  // Placeholder: Here you would add logic to transition particles into text shape
}
