
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/TextGeometry.js';

let scene, camera, renderer, font;
let textMeshes = [];

init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new FontLoader();
    loader.load('/static/fonts/NotoSansTC-FullSubset.typeface.json', loadedFont => {
        font = loadedFont;
        setupSSE();
    });

    animate();
}

function setupSSE() {
    const source = new EventSource('/stream');
    source.onmessage = function(event) {
        const payload = JSON.parse(event.data);
        const replies = payload.replies.slice(-5); // 最多顯示5則
        updateText(replies);
    };
}

function updateText(textList) {
    // 清除舊的文字
    textMeshes.forEach(mesh => scene.remove(mesh));
    textMeshes = [];

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });

    textList.forEach((text, i) => {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 40,
            height: 1,
            curveSegments: 12,
        });

        geometry.center();

        const points = new THREE.Points(geometry, material);
        points.position.y = (textList.length - 1) * 60 / 2 - i * 60;
        scene.add(points);
        textMeshes.push(points);
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
