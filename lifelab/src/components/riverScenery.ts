import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { LabPreview } from '../lib/labCatalog';

const assetRoot = `${import.meta.env.BASE_URL}river-assets/`;
const centerOfRiver = (z: number) => 1.05 * Math.sin(z * 0.14) + 0.42 * Math.sin(z * 0.27);

function groundHeight(x: number, z: number) {
  const distance = Math.abs(x - centerOfRiver(z));
  const slope = THREE.MathUtils.smoothstep(distance, 1.14, 2.48);
  const hills = THREE.MathUtils.smoothstep(distance, 6, 14);
  return (
    THREE.MathUtils.lerp(-0.77, 0.64, slope) + hills * (0.43 + Math.sin(x * 0.23 + z * 0.12) * 0.42)
  );
}

export function createRiverScenery(scene: THREE.Scene, refresh: (shadows?: boolean) => void) {
  const village = new THREE.Group();
  scene.add(village);
  const textures: THREE.Texture[] = [];
  const materials: THREE.Material[] = [];
  let disposed = false;
  let sky: THREE.Texture | undefined;
  const loader = new THREE.TextureLoader();
  const oldBackground = scene.background;
  const oldFog = scene.fog;
  const oldEnvironment = scene.environment;
  scene.fog = new THREE.FogExp2(0xbacbd3, 0.017);

  function material(color: number, options: THREE.MeshStandardMaterialParameters = {}) {
    const result = new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...options });
    materials.push(result);
    return result;
  }
  function tiledMaterial(name: string, repeatX: number, repeatY: number, color = 0xffffff) {
    function load(suffix: string, srgb = false) {
      const texture = loader.load(`${assetRoot}${name}-${suffix}.jpg`, (loaded) => {
        if (disposed) loaded.dispose();
        else refresh();
      });
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeatX, repeatY);
      texture.anisotropy = 4;
      if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      return texture;
    }
    return material(color, {
      map: load('color', true),
      normalMap: load('normal'),
      roughnessMap: load('rough'),
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughness: 1,
    });
  }
  function mesh(
    geometry: THREE.BufferGeometry,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = village,
  ) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(
    w: number,
    h: number,
    d: number,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent?: THREE.Object3D,
  ) {
    return mesh(new THREE.BoxGeometry(w, h, d), surface, x, y, z, parent);
  }

  const grass = tiledMaterial('grass', 29, 36, 0xd6e0bf);
  const plaster = tiledMaterial('wall', 1.4, 1.3, 0xf0e5cf);
  const tile = tiledMaterial('roof', 2.2, 1.05);
  const asphalt = tiledMaterial('road', 1, 22);
  const stone = tiledMaterial('stone', 1, 1);
  const wood = material(0x674635);
  const concrete = material(0xa29f90);
  const metal = material(0x45555b, { metalness: 0.65, roughness: 0.39 });
  const glass = material(0x46616e, { metalness: 0.35, roughness: 0.14, envMapIntensity: 0.7 });
  const marking = material(0xe4dbbd);
  const terrain = new THREE.PlaneGeometry(74, 92, 112, 138);
  terrain.rotateX(-Math.PI / 2);
  const vertices = terrain.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    vertices.setY(i, groundHeight(vertices.getX(i), vertices.getZ(i)));
  }
  terrain.computeVertexNormals();
  mesh(terrain, grass, 0, 0, 0).castShadow = false;

  const road = new THREE.PlaneGeometry(2.15, 84, 1, 112);
  road.rotateX(-Math.PI / 2);
  const roadVertices = road.attributes.position;
  for (let i = 0; i < roadVertices.count; i++) {
    roadVertices.setX(i, roadVertices.getX(i) + centerOfRiver(roadVertices.getZ(i)) + 4.55);
  }
  road.computeVertexNormals();
  mesh(road, asphalt, 0, 0.663, 0).castShadow = false;
  for (let z = -38; z < 30; z += 2.1) {
    box(0.036, 0.007, 0.91, marking, centerOfRiver(z) + 4.55, 0.67, z).rotation.y = Math.atan2(
      centerOfRiver(z + 0.4) - centerOfRiver(z - 0.4),
      0.8,
    );
  }

  for (const [x, z, rotation, scale] of [
    [-4.35, -1.6, -0.16, 1],
    [-5.9, -7.9, 0.18, 0.92],
    [7.45, -5.7, -0.12, 1.12],
    [7.1, -14.1, 0.08, 0.86],
    [-5.4, -19.5, 0.21, 0.85],
  ]) {
    const house = new THREE.Group();
    house.position.set(x, groundHeight(x, z), z);
    house.rotation.y = rotation;
    house.scale.setScalar(scale);
    village.add(house);
    box(2.48, 0.18, 1.94, concrete, 0, 0.09, 0, house);
    box(2.35, 1.55, 1.8, plaster, 0, 0.93, 0, house);
    box(0.52, 1.12, 0.052, wood, -0.36, 0.69, 0.917, house);
    box(0.64, 0.075, 0.25, concrete, -0.36, 0.08, 1.01, house);
    box(0.025, 0.034, 0.041, metal, -0.18, 0.66, 0.961, house);
    box(0.68, 0.61, 0.065, wood, 0.65, 1.05, 0.922, house);
    box(0.56, 0.49, 0.07, glass, 0.65, 1.05, 0.937, house);
    box(0.029, 0.49, 0.084, wood, 0.65, 1.05, 0.94, house);
    box(0.65, 0.06, 0.13, concrete, 0.65, 0.755, 0.965, house);
    box(0.065, 0.58, 0.67, wood, 1.18, 1.02, -0.17, house);
    box(0.072, 0.46, 0.55, glass, 1.193, 1.02, -0.17, house);
    const run = 1.03;
    const rise = 0.63;
    for (const side of [-1, 1]) {
      box(
        2.62,
        0.08,
        Math.hypot(run, rise),
        tile,
        0,
        1.73 + rise / 2,
        (side * run) / 2,
        house,
      ).rotation.x = side * Math.atan2(rise, run);
      const gable = new THREE.BufferGeometry();
      gable.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [side * 1.17, 1.7, -0.9, side * 1.17, 1.7, 0.9, side * 1.17, 2.34, 0],
          3,
        ),
      );
      gable.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
      gable.computeVertexNormals();
      plaster.side = THREE.DoubleSide;
      mesh(gable, plaster, 0, 0, 0, house);
    }
    box(2.64, 0.11, 0.14, tile, 0, 2.37, 0, house);
    box(0.24, 0.61, 0.28, concrete, -0.72, 2.24, -0.35, house);
    box(0.32, 0.08, 0.35, concrete, -0.72, 2.56, -0.35, house);
  }

  const bridgeZ = -3.9;
  const bridgeX = centerOfRiver(bridgeZ) + 0.62;
  box(6.6, 0.18, 1.06, concrete, bridgeX, 0.65, bridgeZ);
  for (const side of [-1, 1]) {
    const z = bridgeZ + side * 0.5;
    for (let x = -3.15; x <= 3.2; x += 0.63) box(0.043, 0.46, 0.052, metal, bridgeX + x, 0.95, z);
    box(6.5, 0.052, 0.061, metal, bridgeX, 1.17, z);
    box(6.5, 0.035, 0.048, metal, bridgeX, 0.95, z);
  }

  const bark = material(0x65513d);
  const foliage = material(0xffffff, { side: THREE.DoubleSide });
  const leafGeometry = new THREE.IcosahedronGeometry(1, 0);
  const leafPose = new THREE.Object3D();
  const green = new THREE.Color();
  let seed = 132;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (const [x, z, height] of [
    [-5.9, 2.1, 3.4],
    [-3.3, -4.5, 2.5],
    [6.1, -1, 2.5],
    [8.9, -8.4, 3.6],
    [-7.4, -12.1, 3.7],
    [6, -19, 3.1],
    [-9, -23, 4.4],
    [9, -28, 4.1],
  ]) {
    const y = groundHeight(x, z);
    mesh(new THREE.CylinderGeometry(0.066, 0.13, height * 0.74, 10), bark, x, y + height * 0.37, z);
    const leaves = new THREE.InstancedMesh(leafGeometry, foliage, 580);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    for (let index = 0; index < leaves.count; index++) {
      const azimuth = random() * Math.PI * 2;
      const polar = Math.acos(2 * random() - 1);
      const radius = Math.cbrt(random()) * height * (0.32 + 0.045 * Math.sin(azimuth * 4 + height));
      leafPose.position.set(
        x + Math.sin(polar) * Math.cos(azimuth) * radius,
        y + height * 0.79 + Math.cos(polar) * radius * 0.78,
        z + Math.sin(polar) * Math.sin(azimuth) * radius,
      );
      leafPose.scale.set(0.09 + random() * 0.12, 0.055 + random() * 0.07, 0.09 + random() * 0.12);
      leafPose.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      leafPose.updateMatrix();
      leaves.setMatrixAt(index, leafPose.matrix);
      green.setHSL(0.23 + random() * 0.055, 0.34 + random() * 0.23, 0.065 + random() * 0.14);
      leaves.setColorAt(index, green);
    }
    village.add(leaves);
  }
  for (let index = 0; index < 58; index++) {
    const z = -20 + random() * 28;
    const x = centerOfRiver(z) + (index % 2 === 0 ? 1 : -1) * (1.56 + random() * 0.57);
    const radius = 0.11 + random() * 0.17;
    const rock = mesh(new THREE.DodecahedronGeometry(radius, 0), stone, x, groundHeight(x, z), z);
    rock.scale.set(1.2, 0.62, 0.8);
    rock.rotation.set(random(), random() * 5, random());
  }

  const gaugeX = centerOfRiver(2.15) + 1.43;
  const gaugeZ = 2.15;
  box(0.15, 1.23, 0.12, marking, gaugeX, 0.09, gaugeZ);
  for (let index = 0; index < 11; index++) {
    box(
      index % 2 === 0 ? 0.13 : 0.075,
      0.012,
      0.009,
      metal,
      gaugeX,
      -0.39 + index * 0.1,
      gaugeZ + 0.066,
    );
  }
  const postX = centerOfRiver(2.1) + 2.67;
  mesh(new THREE.CylinderGeometry(0.048, 0.067, 2.15, 12), metal, postX, 1.72, 2.1);
  box(0.33, 0.31, 0.21, metal, postX, 2.43, 2.1);
  const beacon = material(0x812d21, { emissive: 0xff3318, emissiveIntensity: 0 });
  mesh(new THREE.SphereGeometry(0.136, 20, 14), beacon, postX, 2.83, 2.1);
  const redLight = new THREE.PointLight(0xff3919, 0, 2.1);
  redLight.position.set(postX, 2.87, 2.1);
  village.add(redLight);

  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const sx = (x / size) * Math.PI * 2;
      const sy = (y / size) * Math.PI * 2;
      const normal = new THREE.Vector3(
        0.075 * Math.cos(sx * 3 + sy * 2 + Math.sin(sx + sy)) + 0.05 * Math.cos(sx * 9 - sy * 5),
        0.083 * Math.sin(sy * 5 + sx * 2 + Math.sin(sy * 2)) + 0.07 * Math.cos(sy * 11 - sx * 7),
        1,
      ).normalize();
      const pixel = (y * size + x) * 4;
      pixels[pixel] = (normal.x + 1) * 127.5;
      pixels[pixel + 1] = (normal.y + 1) * 127.5;
      pixels[pixel + 2] = (normal.z + 1) * 127.5;
      pixels[pixel + 3] = 255;
    }
  const waves = new THREE.DataTexture(pixels, size, size);
  waves.wrapS = waves.wrapT = THREE.RepeatWrapping;
  waves.repeat.set(15, 21);
  waves.magFilter = THREE.LinearFilter;
  waves.minFilter = THREE.LinearMipmapLinearFilter;
  waves.generateMipmaps = true;
  waves.needsUpdate = true;
  textures.push(waves);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x405e55,
    roughness: 0.31,
    metalness: 0.12,
    normalMap: waves,
    normalScale: new THREE.Vector2(0.63, 0.63),
    envMapIntensity: 1.05,
    clearcoat: 0.75,
    clearcoatRoughness: 0.16,
    clearcoatNormalMap: waves,
  });
  materials.push(waterMaterial);
  const surface = mesh(new THREE.PlaneGeometry(16, 91), waterMaterial, 0, 0, 0);
  surface.rotation.x = -Math.PI / 2;
  surface.castShadow = false;

  new HDRLoader().load(`${assetRoot}sky.hdr`, (texture) => {
    if (disposed) {
      texture.dispose();
      return;
    }
    sky = texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    scene.backgroundIntensity = 0.64;
    scene.backgroundBlurriness = 0.025;
    scene.environmentIntensity = 0.39;
    refresh();
  });

  function disposeModel(model: THREE.Object3D) {
    const modelTextures = new Set<THREE.Texture>();
    const modelMaterials = new Set<THREE.Material>();
    const modelGeometries = new Set<THREE.BufferGeometry>();
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      modelGeometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        modelMaterials.add(material);
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) modelTextures.add(value);
      }
    });
    modelTextures.forEach((texture) => texture.dispose());
    modelMaterials.forEach((material) => material.dispose());
    modelGeometries.forEach((geometry) => geometry.dispose());
  }
  const plants = new THREE.Group();
  village.add(plants);
  new GLTFLoader().load(`${assetRoot}fern/fern_02_1k.gltf`, ({ scene: fern }) => {
    if (disposed) {
      disposeModel(fern);
      return;
    }
    const bounds = new THREE.Box3().setFromObject(fern);
    const fernHeight = Math.max(0.1, bounds.max.y - bounds.min.y);
    fern.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    for (let index = 0; index < 17; index++) {
      const z = -13 + index * 1.09;
      const x = centerOfRiver(z) + (index % 2 === 0 ? 1 : -1) * (2.1 + random() * 0.66);
      const copy = fern.clone(true);
      const scale = (0.32 + random() * 0.31) / fernHeight;
      copy.scale.setScalar(scale);
      copy.rotation.y = random() * Math.PI * 2;
      copy.position.set(x, groundHeight(x, z) - bounds.min.y * scale, z);
      plants.add(copy);
    }
    refresh(true);
  });

  let targetHeight = 0;
  return {
    update(value: LabPreview) {
      targetHeight = (value.waterLevel ?? 45) / 100 - 0.45;
      beacon.emissiveIntensity = value.alarm ? 4.8 : 0;
      redLight.intensity = value.alarm ? 2.6 : 0;
    },
    animate(seconds: number, reducedMotion: boolean) {
      surface.position.y = reducedMotion
        ? targetHeight
        : THREE.MathUtils.lerp(surface.position.y, targetHeight, 0.13);
      if (!reducedMotion) waves.offset.set(seconds * 0.012, seconds * 0.023);
    },
    dispose() {
      disposed = true;
      scene.background = oldBackground;
      scene.fog = oldFog;
      scene.environment = oldEnvironment;
      sky?.dispose();
      disposeModel(plants);
      village.remove(plants);
      const geometries = new Set<THREE.BufferGeometry>();
      village.traverse((object) => {
        if (object instanceof THREE.Mesh) geometries.add(object.geometry);
        if (object instanceof THREE.InstancedMesh) object.dispose();
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      village.removeFromParent();
    },
  };
}
