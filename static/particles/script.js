
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/TextGeometry.js';

let scene, camera, renderer, font;
let textMeshes = [];
let finalTriggered = false;

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
        const stage = payload.stage;

        if (stage === 'final' && !finalTriggered) {
            finalTriggered = true;
            triggerFinalSequence();
        } else if (!finalTriggered) {
            updateText(replies);
        }
    };
}

function updateText(textList) {
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

function triggerFinalSequence() {
    textMeshes.forEach(mesh => scene.remove(mesh));
    textMeshes = [];

    const thornText = "你將願望編織成荊棘，卻不見那是從我羽上撕下的痛。如今，我已步入枯竭。";
    const finalQuestion = "祈願者，你所敬拜的神，是自然的形狀，還是你慾望的倒影？";

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const thornGeometry = new TextGeometry(thornText, {
        font: font,
        size: 36,
        height: 1,
        curveSegments: 12,
    });
    thornGeometry.center();
    const thornMesh = new THREE.Mesh(thornGeometry, material);
    scene.add(thornMesh);

    setTimeout(() => {
        scene.remove(thornMesh);
        flashBlackAndWhite(() => {
            const qGeometry = new TextGeometry(finalQuestion, {
                font: font,
                size: 30,
                height: 1,
                curveSegments: 12,
            });
            qGeometry.center();
            const qMesh = new THREE.Mesh(qGeometry, material);
            scene.add(qMesh);

            setTimeout(() => {
                scene.remove(qMesh);
            }, 6000);
        });
    }, 4000);
}

function flashBlackAndWhite(callback) {
    let flash = true;
    let count = 0;
    const maxFlashes = 8 * (1000 / 120); // 8 秒，每 120ms 閃一次

    const flashInterval = setInterval(() => {
        renderer.setClearColor(flash ? 0xffffff : 0x000000, 1);
        flash = !flash;
        count++;
        if (count > maxFlashes) {
            clearInterval(flashInterval);
            renderer.setClearColor(0x000000, 1);
            callback();
        }
    }, 120);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
