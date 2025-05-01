
let scene, camera, renderer, font;

init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new THREE.FontLoader();
    loader.load('/static/fonts/NotoSansTC-Subset.typeface.json', loadedFont => {
        font = loadedFont;
        displayTestText("測試粒子");
    });

    animate();
}

function displayTestText(text) {
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });

    const geometry = new THREE.TextGeometry(text, {
        font: font,
        size: 60,
        height: 1,
        curveSegments: 12,
    });

    geometry.center();

    const points = new THREE.Points(geometry, material);
    scene.add(points);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
