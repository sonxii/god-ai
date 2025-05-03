// Placeholder: real animation and polling logic to be added
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('particle-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

const particleCount = 10000;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
material.transparent = true;
material.alphaTest = 0.1;

const points = new THREE.Points(geometry, material);
scene.add(points);
camera.position.z = 10;

function animate() {
  requestAnimationFrame(animate);
  points.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animate();
