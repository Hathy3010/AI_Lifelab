import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const assetRoot = `${import.meta.env.BASE_URL}indoor-assets/`;

interface WorkshopOptions {
  width: number;
  depth: number;
  top: number;
  refresh: () => void;
  accent: number;
}

function release(object: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

export function createWorkshop(scene: THREE.Scene, options: WorkshopOptions) {
  const group = new THREE.Group();
  scene.add(group);
  const { width, depth, top, refresh, accent } = options;
  let disposed = false;
  let environment: THREE.Texture | undefined;
  const floor = top - 3.05;
  const previousEnvironment = scene.environment;
  const previousIntensity = scene.environmentIntensity;
  const loader = new THREE.TextureLoader();
  function loadTexture(url: string, repeat: [number, number], srgb = false) {
    const texture = loader.load(url, () => {
      if (!disposed) refresh();
    });
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
    texture.anisotropy = 4;
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  const woodMap = loadTexture(`${assetRoot}wood-color.jpg`, [2, 1], true);
  const woodNormal = loadTexture(`${assetRoot}wood-normal.jpg`, [2, 1]);
  const woodRough = loadTexture(`${assetRoot}wood-rough.jpg`, [2, 1]);
  const wood = new THREE.MeshStandardMaterial({
    color: 0xdfbc99,
    map: woodMap,
    normalMap: woodNormal,
    roughnessMap: woodRough,
    roughness: 0.92,
    normalScale: new THREE.Vector2(0.6, 0.6),
  });
  const frame = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.48, metalness: 0.32 });
  const wall = new THREE.MeshStandardMaterial({
    color: 0xe7ddd0,
    map: loadTexture(`${import.meta.env.BASE_URL}river-assets/wall-color.jpg`, [5, 2], true),
    roughness: 0.97,
  });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xa8a59c, roughness: 0.94 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x77796e, roughness: 0.72 });
  const skyGlass = new THREE.MeshStandardMaterial({
    color: 0xa3c2ca,
    emissive: 0xbddde0,
    emissiveIntensity: 0.62,
    roughness: 0.28,
  });

  function box(
    w: number,
    h: number,
    d: number,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    rounded = false,
  ) {
    const geometry = rounded
      ? new RoundedBoxGeometry(w, h, d, 2, 0.045)
      : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  const tabletop = box(width, 0.23, depth, wood, 0, top - 0.115, 0, true);
  for (const x of [-width / 2 + 0.37, width / 2 - 0.37]) {
    for (const z of [-depth / 2 + 0.38, depth / 2 - 0.38]) {
      box(0.2, 2.81, 0.2, frame, x, floor + 1.405, z, true);
    }
    box(0.15, 0.17, depth - 0.65, frame, x, floor + 0.58, 0);
  }
  box(width - 0.7, 0.19, 0.11, frame, 0, top - 0.36, -depth / 2 + 0.33);
  box(65, 0.16, 65, floorMaterial, 0, floor - 0.09, 0).castShadow = false;
  const wallZ = -depth / 2 - 2.2;
  box(26, 8.7, 0.19, wall, 0, floor + 4.35, wallZ).castShadow = false;
  box(26, 0.16, 0.04, trim, 0, floor + 0.08, wallZ + 0.12);

  const windowX = -width * 0.24;
  const windowY = top + 1.88;
  box(3.1, 2.15, 0.036, trim, windowX, windowY, wallZ + 0.105);
  box(2.95, 2, 0.04, skyGlass, windowX, windowY, wallZ + 0.126);
  box(0.068, 2.05, 0.06, trim, windowX, windowY, wallZ + 0.16);
  box(3.05, 0.065, 0.062, trim, windowX, windowY + 0.18, wallZ + 0.16);
  box(3.27, 0.09, 0.29, wall, windowX, windowY - 1.08, wallZ + 0.19, true);

  const assets = new GLTFLoader();
  function addModel(
    id: 'binder_notebook' | 'desk_lamp_arm_01' | 'painted_wooden_chair_01',
    x: number,
    y: number,
    z: number,
    height: number,
    yaw: number,
    onReady?: (model: THREE.Object3D) => void,
  ) {
    assets.load(`${assetRoot}${id}/scene.gltf`, ({ scene: model }) => {
      if (disposed) {
        release(model);
        return;
      }
      if (id === 'binder_notebook') {
        const closed = model.getObjectByName('binder_notebook_closed');
        if (closed) closed.visible = false;
      }
      model.rotation.y = yaw;
      const bounds = new THREE.Box3().setFromObject(model, true);
      if (id === 'binder_notebook') {
        const open = model.getObjectByName('binder_notebook');
        if (open) bounds.setFromObject(open, true);
      }
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = height / Math.max(0.01, bounds.max.y - bounds.min.y);
      model.scale.setScalar(scale);
      model.position.set(x - center.x * scale, y - bounds.min.y * scale, z - center.z * scale);
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      group.add(model);
      onReady?.(model);
      refresh();
    });
  }
  addModel('painted_wooden_chair_01', width * 0.35, floor, -depth / 2 - 0.42, 3.62, Math.PI);
  new HDRLoader().load(`${assetRoot}room.hdr`, (texture) => {
    if (disposed) {
      texture.dispose();
      return;
    }
    environment = texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.environmentIntensity = 0.62;
    refresh();
  });
  return {
    addModel,
    tabletop,
    woodMap,
    dispose() {
      disposed = true;
      scene.environment = previousEnvironment;
      scene.environmentIntensity = previousIntensity;
      environment?.dispose();
      release(group);
      group.removeFromParent();
    },
  };
}
