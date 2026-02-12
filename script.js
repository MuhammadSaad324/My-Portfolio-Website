import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const canvas = document.getElementById('three-bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.2, 5.2);

const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);

const point = new THREE.PointLight(0xff4d92, 2.1, 40);
point.position.set(2.6, 2.4, 4);
scene.add(point);

const point2 = new THREE.PointLight(0xff7a18, 1.5, 30);
point2.position.set(-3, -1.8, 2);
scene.add(point2);

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.3, 0.35, 180, 24),
  new THREE.MeshStandardMaterial({
    color: 0xff4d92,
    emissive: 0x660828,
    metalness: 0.75,
    roughness: 0.18,
  })
);
knot.position.set(0, 0, -1);
scene.add(knot);

const starsGeo = new THREE.BufferGeometry();
const starCount = 1100;
const starArr = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
  starArr[i] = (Math.random() - 0.5) * 24;
  starArr[i + 1] = (Math.random() - 0.5) * 18;
  starArr[i + 2] = (Math.random() - 0.5) * 24;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
const stars = new THREE.Points(
  starsGeo,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.028,
    transparent: true,
    opacity: 0.8,
  })
);
scene.add(stars);

const iconFactory = {
  sync: () =>
    new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.12, 20, 60),
      new THREE.MeshStandardMaterial({ color: 0xff7a18, emissive: 0x552500, metalness: 0.65, roughness: 0.25 })
    ),
  rag: () =>
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.43, 0),
      new THREE.MeshStandardMaterial({ color: 0xff4d92, emissive: 0x520922, metalness: 0.7, roughness: 0.3 })
    ),
  chatbot: () =>
    new THREE.Mesh(
      new THREE.OctahedronGeometry(0.43, 0),
      new THREE.MeshStandardMaterial({ color: 0xff8ac4, emissive: 0x311225, metalness: 0.6, roughness: 0.3 })
    ),
  voice: () =>
    new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.7, 24),
      new THREE.MeshStandardMaterial({ color: 0xff6f61, emissive: 0x57230f, metalness: 0.55, roughness: 0.35 })
    ),
  data: () =>
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.7, 24),
      new THREE.MeshStandardMaterial({ color: 0xffa15e, emissive: 0x4b250a, metalness: 0.65, roughness: 0.25 })
    ),
  webhook: () =>
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.26, 0.08, 90, 12),
      new THREE.MeshStandardMaterial({ color: 0xff4d92, emissive: 0x520a2b, metalness: 0.8, roughness: 0.2 })
    ),
};

const iconScenes = [];

function createCardIcon(card) {
  const mount = card.querySelector('.icon-3d');
  if (!mount) return;

  const w = mount.clientWidth || 70;
  const h = mount.clientHeight || 70;
  const iconRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  iconRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  iconRenderer.setSize(w, h);
  mount.appendChild(iconRenderer.domElement);

  const iconScene = new THREE.Scene();
  const iconCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10);
  iconCamera.position.set(0, 0, 2.2);

  const iconLight = new THREE.PointLight(0xff4d92, 1.5, 10);
  iconLight.position.set(1.5, 1, 2);
  iconScene.add(iconLight);
  iconScene.add(new THREE.AmbientLight(0xffffff, 0.65));

  const type = card.dataset.icon;
  const mesh = (iconFactory[type] || iconFactory.sync)();
  iconScene.add(mesh);

  iconScenes.push({ renderer: iconRenderer, scene: iconScene, camera: iconCamera, mesh, mount });
}

document.querySelectorAll('.card').forEach((card) => createCardIcon(card));

const clock = new THREE.Clock();
const cards = document.querySelectorAll('.card');

const onResize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  iconScenes.forEach((icon) => {
    const iw = icon.mount.clientWidth || 70;
    const ih = icon.mount.clientHeight || 70;
    icon.camera.aspect = iw / ih;
    icon.camera.updateProjectionMatrix();
    icon.renderer.setSize(iw, ih);
  });
};

onResize();
window.addEventListener('resize', onResize);

document.addEventListener('mousemove', (event) => {
  const nx = (event.clientX / window.innerWidth) * 2 - 1;
  const ny = -(event.clientY / window.innerHeight) * 2 + 1;
  knot.rotation.x = ny * 0.35;
  knot.rotation.y = nx * 0.45;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.animate(
        [
          { transform: 'translateY(28px)', opacity: 0.2 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration: 600, easing: 'cubic-bezier(.17,.67,.4,1)', fill: 'forwards' }
      );
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.25 }
);

cards.forEach((card) => observer.observe(card));

function animate() {
  const t = clock.getElapsedTime();
  knot.rotation.z += 0.005;
  knot.position.y = Math.sin(t * 0.7) * 0.22;
  stars.rotation.y = t * 0.02;

  iconScenes.forEach((icon, index) => {
    icon.mesh.rotation.x = t * (0.7 + index * 0.02);
    icon.mesh.rotation.y = t * (0.95 + index * 0.03);
    icon.renderer.render(icon.scene, icon.camera);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
document.getElementById('year').textContent = new Date().getFullYear();
