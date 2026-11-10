import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { LabPreview, SceneKind } from '../lib/labCatalog';
import { createRiverScenery } from './riverScenery';
import { createWorkshop } from './workshopScenery';

interface Props {
  kind: Exclude<SceneKind, 'balance'>;
  preview: LabPreview;
}

export function TopicScene({ kind, preview }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const update = useRef<(value: LabPreview) => void>(() => {});
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setUnavailable(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xe5eef0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Mô hình 3D. Kéo để xoay góc nhìn.');
    renderer.domElement.setAttribute('role', 'img');
    const scene = new THREE.Scene();
    const outdoors = kind === 'water';
    const camera = new THREE.PerspectiveCamera(outdoors ? 43 : 36, 1, 0.1, outdoors ? 145 : 50);
    if (outdoors) camera.position.set(8.7, 5.4, 10.1);
    else camera.position.set(7, 6, 9);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, outdoors ? 0.9 : 0.65, outdoors ? -4.7 : 0);
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = outdoors ? 26 : 18;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xfff5e6, 0x788b8d, 2));
    const sun = new THREE.DirectionalLight(0xffe7c6, 2.7);
    sun.position.set(-4, 8, 5);
    if (outdoors) sun.intensity = 2.1;
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6 });
    sun.shadow.normalBias = 0.025;
    if (outdoors) {
      sun.shadow.autoUpdate = false;
      sun.shadow.needsUpdate = true;
    }
    scene.add(sun);

    function shape(
      geometry: THREE.BufferGeometry,
      color: number,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color, roughness: 0.72 }),
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function box(
      w: number,
      h: number,
      d: number,
      color: number,
      x: number,
      y: number,
      z: number,
      parent?: THREE.Object3D,
    ) {
      return shape(new THREE.BoxGeometry(w, h, d), color, x, y, z, parent);
    }
    function cylinder(
      radius: number,
      height: number,
      color: number,
      x: number,
      y: number,
      z: number,
      parent?: THREE.Object3D,
    ) {
      return shape(new THREE.CylinderGeometry(radius, radius, height, 32), color, x, y, z, parent);
    }
    function label(text: string, x: number, y: number, z: number) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const context = canvas.getContext('2d')!;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, transparent: true }),
      );
      sprite.position.set(x, y, z);
      sprite.scale.set(1.55, 0.39, 1);
      scene.add(sprite);
      let previous = '';
      function setText(value: string) {
        if (value === previous) return;
        previous = value;
        context.clearRect(0, 0, 256, 64);
        context.fillStyle = '#fffaf1';
        context.beginPath();
        context.roundRect(3, 3, 250, 58, 9);
        context.fill();
        context.font = 'bold 23px sans-serif';
        context.textAlign = 'center';
        context.fillStyle = '#17365e';
        context.fillText(value, 128, 40, 235);
        texture.needsUpdate = true;
      }
      setText(text);
      return { sprite, setText };
    }
    function stack(
      x: number,
      z: number,
      count: number,
      makeItem: (index: number, group: THREE.Group) => void,
    ) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      scene.add(group);
      const items = Array.from({ length: count }, (_, index) => {
        const item = new THREE.Group();
        makeItem(index, item);
        group.add(item);
        return item;
      });
      return (fraction: number) => {
        const visible = Math.round(THREE.MathUtils.clamp(fraction, 0, 1) * count);
        items.forEach((item, index) => {
          item.visible = index < visible;
        });
      };
    }
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = () => renderer.render(scene, camera);
    let refreshFrame = 0;
    const river = outdoors
      ? createRiverScenery(scene, (shadows) => {
          if (shadows) sun.shadow.needsUpdate = true;
          if (reducedMotion && !refreshFrame) {
            refreshFrame = requestAnimationFrame(() => {
              refreshFrame = 0;
              render();
            });
          }
        })
      : undefined;
    const workshop = outdoors
      ? undefined
      : createWorkshop(scene, {
          width: 7.4,
          depth: 5.1,
          top: 0,
          accent: kind === 'energy' ? 0x33494c : 0x64534a,
          refresh: render,
        });
    const adjusters: Array<(fraction: number) => void> = [];
    const labels: Array<(value: LabPreview) => void> = [];
    let updateLamp: ((value: LabPreview) => void) | undefined;

    if (kind === 'budget') {
      const envelopes = [0x65889a, 0xc18f4d, 0x728f62];
      const titles = ['Thiết yếu', 'Linh hoạt', 'Tiết kiệm'];
      envelopes.forEach((color, index) => {
        const x = (index - 1) * 2.08;
        box(1.72, 0.075, 1.36, color, x, 0.045, 0.12);
        const flap = shape(new THREE.ConeGeometry(0.7, 0.025, 3), 0xe5d9bd, x, 0.091, 0.25);
        flap.scale.set(1, 1, 0.66);
        adjusters.push(
          stack(x, -0.04, 20, (note, group) => {
            const y = 0.11 + note * 0.026;
            box(1.27, 0.022, 0.61, note % 2 === 0 ? 0x9bb88d : 0xb4c9a4, 0, y, 0, group);
            box(0.14, 0.024, 0.62, 0xe8dcc0, 0, y, 0, group);
          }),
        );
        label(titles[index], x, 0.12, 1.06);
        const amount = label('0 đ', x, 0.46, 1.06);
        labels.push((value) => amount.setText(value.displayValues?.[index] ?? '0 đ'));
      });
      box(2.1, 0.11, 1.1, 0x684334, 1.8, 0.07, -1.55);
      box(1.82, 0.032, 0.77, 0x9d6044, 1.8, 0.139, -1.55);
      cylinder(0.07, 0.023, 0xd3a752, 2.5, 0.167, -1.55);
    } else if (kind === 'savings') {
      const positions = [-1.5, 1.5];
      positions.forEach((x, index) => {
        const glass = shape(
          new THREE.CylinderGeometry(0.72, 0.69, 1.52, 48, 1, true),
          0xafcfd1,
          x,
          0.81,
          0,
        );
        glass.material.transparent = true;
        glass.material.opacity = 0.24;
        glass.material.depthWrite = false;
        glass.material.roughness = 0.15;
        glass.material.side = THREE.DoubleSide;
        glass.castShadow = false;
        cylinder(0.68, 0.085, 0xb4cfd0, x, 0.06, 0).material.roughness = 0.3;
        cylinder(0.76, 0.11, 0x536970, x, 1.62, 0).material.metalness = 0.6;
        box(0.32, 0.012, 0.07, 0x26373b, x, 1.683, 0);
        adjusters.push(
          stack(x, 0, 72, (coin, group) => {
            const mesh = cylinder(
              0.41,
              0.016,
              coin % 2 === 0 ? 0xbb8a3f : 0xd3aa5c,
              ((coin % 3) - 1) * 0.045,
              0.11 + coin * 0.019,
              0,
              group,
            );
            mesh.material.metalness = 0.58;
            mesh.material.roughness = 0.37;
          }),
        );
        label(index === 0 ? 'Gửi mỗi tuần' : 'Mục tiêu', x, 0.12, 1.04);
        const amount = label('0 đ', x, 0.46, 1.04);
        labels.push((value) => amount.setText(value.displayValues?.[index] ?? '0 đ'));
      });
    } else if (kind === 'study') {
      for (let day = 0; day < 4; day++) {
        const x = (day - 1.5) * 1.56;
        const card = box(1.19, 0.045, 1.25, 0xf2e5c9, x, 0.034, 1.12);
        const tag = label(`Buổi ${day + 1}`, x, 0.17, 1.44);
        const duration = label('0 phút', x, 0.49, 1.44);
        labels.push((value) => {
          const minutes = value.displayValues?.[day];
          card.visible = tag.sprite.visible = duration.sprite.visible = Boolean(minutes);
          if (minutes) duration.setText(minutes);
        });
      }
      workshop?.addModel('binder_notebook', -0.52, 0.025, -1.06, 0.21, 0.13);
      const pencil = cylinder(0.055, 1.61, 0xd59b36, 1.4, 0.08, -1.38);
      pencil.rotation.z = Math.PI / 2;
      shape(new THREE.ConeGeometry(0.055, 0.22, 12), 0x9d8059, 2.31, 0.08, -1.38).rotation.z =
        -Math.PI / 2;
    } else if (kind === 'energy') {
      const base = cylinder(0.56, 0.14, 0x3d515b, -1.82, 0.08, 0);
      const stem = cylinder(0.065, 1.74, 0x4a5f68, -1.82, 0.94, 0);
      const shade = shape(
        new THREE.CylinderGeometry(0.39, 0.74, 0.53, 36, 1, true),
        0xd1b175,
        -1.82,
        1.91,
        0,
      );
      shade.material.side = THREE.DoubleSide;
      const bulb = shape(new THREE.SphereGeometry(0.23, 20, 14), 0xffd391, -1.82, 1.61, 0);
      const lamp = new THREE.PointLight(0xffb968, 11, 5);
      lamp.position.copy(bulb.position);
      scene.add(lamp);
      box(1.97, 0.86, 1.15, 0xcfd8d5, 1.34, 0.44, 0);
      box(1.6, 0.53, 0.04, 0x243e41, 1.34, 0.49, 0.59);
      const leds = Array.from({ length: 8 }, (_, index) =>
        box(0.11, 0.2, 0.02, 0x81b99b, 0.82 + index * 0.147, 0.49, 0.62),
      );
      const cable = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.5, 0.09, 0.26),
        new THREE.Vector3(-0.92, 0.025, 0.84),
        new THREE.Vector3(-0.17, 0.025, 0.78),
        new THREE.Vector3(0.38, 0.09, 0.37),
      ]);
      shape(new THREE.TubeGeometry(cable, 24, 0.028, 8, false), 0x354245, 0, 0, 0);
      label('Công tơ điện', 1.34, 1.39, 0.37);
      const reading = label('0 kWh', 1.34, 1.05, 0.37);
      labels.push((value) => reading.setText(value.displayValues?.[0] ?? '0 kWh'));
      let modeledBulb: THREE.MeshStandardMaterial | undefined;
      let lightLevel = 0.6;
      workshop?.addModel('desk_lamp_arm_01', -1.82, 0.04, -0.13, 2.38, Math.PI / 3, (model) => {
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          const material = object.material;
          if (material instanceof THREE.MeshStandardMaterial && material.name.includes('_light')) {
            modeledBulb = material;
            material.emissiveIntensity = 2.5 * lightLevel;
            model.updateWorldMatrix(true, true);
            new THREE.Box3().setFromObject(object).getCenter(lamp.position);
            lamp.position.y -= 0.15;
          }
        });
        base.visible = stem.visible = shade.visible = bulb.visible = false;
      });
      updateLamp = (value) => {
        const power = (value.powerWatts ?? 60) / 100;
        lightLevel = power;
        lamp.intensity = 17 * power;
        bulb.material.emissive.setHex(0xffae43);
        bulb.material.emissiveIntensity = 2.5 * power;
        if (modeledBulb) modeledBulb.emissiveIntensity = 2.5 * power;
        leds.forEach((led, index) => {
          led.material.emissive.setHex(
            index < Math.ceil((value.bars[0] ?? 0) * leds.length) ? 0x40ba7c : 0x000000,
          );
        });
      };
    }
    update.current = (value) => {
      adjusters.forEach((adjust, index) => adjust(value.bars[index] ?? 0));
      labels.forEach((label) => label(value));
      river?.update(value);
      if (reducedMotion) river?.animate(0, true);
      updateLamp?.(value);
      render();
    };
    const observer = new ResizeObserver(() => {
      if (!element.clientWidth || !element.clientHeight) return;
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.zoom = Math.min(1, camera.aspect / 1.25);
      camera.updateProjectionMatrix();
      renderer.setSize(element.clientWidth, element.clientHeight);
      render();
    });
    observer.observe(element);
    controls.addEventListener('change', render);
    let frame = 0;
    let previous = 0;
    function tick(now: number) {
      if (!document.hidden && now - previous >= 1000 / 20) {
        river?.animate(now / 1000, reducedMotion);
        render();
        previous = now;
      }
      frame = requestAnimationFrame(tick);
    }
    if (river && !reducedMotion) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(refreshFrame);
      river?.dispose();
      workshop?.dispose();
      update.current = () => {};
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind]);

  useEffect(() => update.current(preview), [preview, kind]);

  return (
    <div className="scene-wrap">
      <div ref={host} className="scene-canvas" />
      {unavailable && (
        <p className="scene-error">
          Trình duyệt cần WebGL để hiển thị bàn 3D. Em vẫn có thể đổi tham số và đọc kết quả bên
          dưới.
        </p>
      )}
    </div>
  );
}
