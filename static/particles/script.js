let scene, camera, renderer, font, currentTextMesh;

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 800;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const loader = new THREE.FontLoader();
  loader.load('/static/fonts/NotoSansTC-Light.json', loadedFont => {
    font = loadedFont;
    displayText("測試粒子訊息"); // 初始測試用，可替換為 GPT 回應
  });

  animate();
}

function displayText(text) {
  if (currentTextMesh) scene.remove(currentTextMesh);

  const geometry = new THREE.TextGeometry(text, {
    font: font,
    size: 60,
    height: 1,
    curveSegments: 12,
  });
  geometry.center();

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
  });

  const points = new THREE.Points(geometry, material);
  points.material.transparent = true;
  points.material.opacity = 0.0;

  scene.add(points);
  currentTextMesh = points;

  // 動畫：從模糊到清晰（用 opacity 緩慢浮現）
  let opacity = 0.0;
  const fadeIn = setInterval(() => {
    opacity += 0.04;
    if (opacity >= 1.0) {
      opacity = 1.0;
      clearInterval(fadeIn);
    }
    points.material.opacity = opacity;
  }, 50);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
