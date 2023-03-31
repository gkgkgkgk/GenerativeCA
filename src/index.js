import './style/main.css'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

let worker = new Worker('worker.js');
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight

window.addEventListener('resize', () => {
    updateCameraSize();
})

const updateCameraSize = () => {
    // Save sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
}

const scene = new THREE.Scene()

// Camera
const camDistance = 150;
const camera = new THREE.OrthographicCamera(-camDistance, camDistance, camDistance, -camDistance, 1, 1000);
const angle = Math.PI / 4;
const distance = camDistance / Math.cos(angle);
const cameraWidth = distance * Math.tan(Math.PI / 6);
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraHeight = cameraWidth / aspectRatio;
camera.left = -cameraWidth / 2;
camera.right = cameraWidth / 2;
camera.top = cameraHeight / 2;
camera.bottom = -cameraHeight / 2;
camera.position.set(distance, distance, distance);
camera.lookAt(scene.position);
scene.add(camera)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.webgl'),
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)

const stats = Stats()
document.body.appendChild(stats.dom)

updateCameraSize();

/*******************************/
//   Cellular Automata Stuff  //
/*******************************/

/* types:
a: anything
f: floor
w: brick / wall
g: glass / window
*/

// RULES: above, below, next to

//example rule: AA/BW/S1W
let rules = {
    brick: {
        growth: [['A'], ["w"], ["1w"]],
    }
}


// Global Variables
let gridSize = 40;
let map = {};
let tempMap = {};

const objects = {}
let neighbors = {}
let interpretation = [[], [], []]

// Helper Functions
const wall_material = new THREE.MeshStandardMaterial({ color: 0xc25c4f });
const glass_material = new THREE.MeshStandardMaterial({ color: 0xADD8E6, transparent: true, opacity: 0.5 });
const floor_material = new THREE.MeshStandardMaterial({ color: 'grey' });
const roof_material = new THREE.MeshStandardMaterial({ color: 'yellow' });

const addCube = (x, y, z, material) => {
    const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), material)
    cube.position.set(x, y, z);
    cube.name = x + "," + y + "," + z
    cube.castShadow = true;
    scene.add(cube);
}

const removeCube = (x, y, z) => {
    var selectedObject = scene.getObjectByName(x + "," + y + "," + z);
    scene.remove(selectedObject);
}

for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
        map[i + ",0," + j] = { type: 'f', id: 0, drawn: false }
    }
}


const render = () => {
    Object.keys(map).forEach(key => {
        if (map[key].drawn == false) {
            let color = undefined;

            if (map[key].type == 'w') {
                color = wall_material;
            } else if (map[key].type == 'g') {
                color = glass_material;
            } else if (map[key].type == 'f') {
                color = floor_material;
            } else if (map[key].type == 'r') {
                color = roof_material;
            }

            let cube = scene.getObjectByName(key);

            if (cube != undefined) {
                removeCube(key.split(",")[0], key.split(",")[1], key.split(",")[2]);
            }

            addCube(key.split(",")[0], key.split(",")[1], key.split(",")[2], color)

            map[key].drawn = true
        }
    });
}


const tick = () => {
    worker.postMessage({ map, gridSize });
    render();
    tempMap = {};
}

/*******************************/
/////////////////////////////////
/*******************************/

const material2 = new THREE.MeshStandardMaterial({ color: 0xC5EDAC });
const floor = new THREE.Mesh(new THREE.BoxBufferGeometry(gridSize, 0.1, gridSize), material2)
floor.position.set(0, -0.55, 0);
floor.receiveShadow = true;
scene.add(floor);

var clock = new THREE.Clock();
let timer = 0;
const loop = () => {
    timer += clock.getDelta();
    if (timer > 0.35) {
        timer = 0;
        tick();
    }

    renderer.render(scene, camera)

    window.requestAnimationFrame(loop)
    stats.update()
}

render()
loop()
