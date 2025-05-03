let scene, camera, renderer, font;
let textPointsList = [];
const maxTextCount = 5;

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const loader = new THREE.FontLoader();
  loader.load('/static/fonts/NotoSansTC-Light2.json', loadedFont => {
    font = loadedFont;
    updateText("神靈顯現中...");
    connectToStream();
  });

  animate();
}

function updateText(content) {
  if (!font) return;

  const textGeo = new THREE.TextGeometry(content, {
    font: font,
    size: 10,
    height: 0.1,
    curveSegments: 2,
    bevelEnabled: false
  });

  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();
  textGeo.center();

  textGeo.vertices.forEach(v => {
    v.startPoint = v.clone();
    v.direction = v.clone().normalize();
  });

  const material = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.5 });
  const points = new THREE.Points(textGeo, material);

  if (textPointsList.length >= maxTextCount) {
    const removed = textPointsList.shift();
    scene.remove(removed);
  }

  textPointsList.push(points);
  scene.add(points);
}

function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.001;

  textPointsList.forEach(textPoints => {
    if (textPoints.geometry && textPoints.geometry.vertices) {
      textPoints.geometry.vertices.forEach(v => {
        v.copy(v.startPoint).addScaledVector(v.direction, 5 + Math.sin(time) * 5);
      });
      textPoints.geometry.verticesNeedUpdate = true;
    }
  });

  renderer.render(scene, camera);
}

function connectToStream() {
  const eventSource = new EventSource('/stream');
  eventSource.onmessage = function (event) {
    const msg = event.data.trim();
    if (msg) updateText(msg);
  };
}
