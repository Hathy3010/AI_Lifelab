import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotateCcw, Move, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { createWorkshop } from './workshopScenery';
import {
  SLOTS,
  type ObjectId,
  type Plan,
  type SimulationResult,
  type Source,
  type Cursor,
} from '../lib/types';

export interface SceneAPI {
  hit: (x: number, y: number) => ObjectId | null;
  grab: (id: ObjectId) => void;
  move: (id: ObjectId, x: number, y: number) => void;
  drop: (id: ObjectId, x: number, y: number, source: Source) => void;
  cancel: (id: ObjectId) => void;
  resetView: () => void;
}
interface Props {
  plan: Plan;
  result: SimulationResult | null;
  disabled: boolean;
  movableObject?: ObjectId;
  cameraActive: boolean;
  cursors: Cursor[];
  highlight: ObjectId | null;
  apiRef: RefObject<SceneAPI | null>;
  onPlace: (id: ObjectId, slot: number, source: Source) => boolean;
  onMessage: (message: string) => void;
  onHeld: (count: number) => void;
}
const STEP = 0.78;
export function BalanceScene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef(props),
    [error, setError] = useState(false);
  latest.current = props;
  useEffect(() => {
    const node = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0xe1e7e7);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    node.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Bàn thực hành đòn bẩy 3D. Có thể dùng bộ chọn vị trí bên dưới.',
    );
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(6.8, 7.1, 9.3);
    camera.lookAt(0, 0, 0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.4, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 9;
    controls.maxDistance = 17;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.2;
    controls.mouseButtons = {
      LEFT: null as unknown as THREE.MOUSE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c9be, 2.8));
    const sun = new THREE.DirectionalLight(0xfff8e5, 3.5);
    sun.position.set(-3, 9, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 7, bottom: -7 });
    scene.add(sun);
    const mat = (color: number, metalness = 0, roughness = 0.7) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness });
    const green = mat(0x2c6c55),
      wood = mat(0xb17b4c),
      cream = mat(0xd4ad78),
      dark = mat(0x294b41),
      orange = mat(0xa97c49, 0.65, 0.34),
      blue = mat(0x56646a, 0.72, 0.32);
    function box(
      w: number,
      h: number,
      d: number,
      m: THREE.Material,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    let needsRender = true;
    const workshop = createWorkshop(scene, {
      width: 10,
      depth: 6.2,
      top: -0.07,
      accent: 0x466357,
      refresh: () => {
        needsRender = true;
      },
    });
    wood.map = workshop.woodMap;
    cream.map = workshop.woodMap;
    box(1.7, 0.17, 1.5, green, 0, 0.03, 0);
    const support = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.2, 3), green);
    support.position.set(0, 0.65, 0);
    support.rotation.y = Math.PI / 2;
    support.castShadow = true;
    scene.add(support);
    const pivotHeight = 1.26;
    const beam = new THREE.Group();
    beam.position.y = pivotHeight;
    scene.add(beam);
    box(7.7, 0.19, 0.72, wood, 0, 0, 0, beam);
    box(7.7, 0.04, 0.76, cream, 0, 0.11, 0, beam);
    for (const x of [-3.6, 3.6]) {
      box(0.36, 0.6, 0.48, green, x, 0.23, 0);
      box(0.39, 0.08, 0.51, dark, x, 0.57, 0);
    }
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 24), dark);
    axle.rotation.x = Math.PI / 2;
    axle.position.y = pivotHeight;
    scene.add(axle);
    for (const slot of SLOTS) {
      box(0.028, 0.012, 0.62, dark, slot * STEP, 0.14, 0, beam);
    }
    const centerLine = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 12), green);
    centerLine.rotation.x = Math.PI / 2;
    centerLine.position.set(0, 0.14, 0);
    beam.add(centerLine);
    // Shelf pads identify the two objects before they are placed.
    for (const x of [-2.6, 2.6]) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.035, 48), mat(0xd4e1d7));
      pad.position.set(x, -0.035, 1.9);
      scene.add(pad);
    }
    const objects = {} as Record<ObjectId, THREE.Group>;
    function label(text: string) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fffdf8';
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 110, 18);
      ctx.fill();
      ctx.fillStyle = '#213e36';
      ctx.font = 'bold 45px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, 128, 82);
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
      sprite.scale.set(1.03, 0.51, 1);
      return sprite;
    }
    for (const id of ['A', 'B'] as const) {
      const group = new THREE.Group();
      const size = id === 'A' ? 0.57 : 0.74;
      const weight = new THREE.Mesh(
        new THREE.CylinderGeometry(size * 0.38, size * 0.52, 0.62, 32),
        id === 'A' ? orange : blue,
      );
      weight.position.y = 0.31;
      weight.castShadow = true;
      weight.receiveShadow = true;
      group.add(weight);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 12, 32), dark);
      handle.position.y = 0.69;
      group.add(handle);
      const tag = label(`${id} · ${id === 'A' ? '1' : '2'} kg`);
      tag.position.y = 1.02;
      group.add(tag);
      objects[id] = group;
      scene.add(group);
    }
    for (const slot of SLOTS) {
      const tag = label(`${slot > 0 ? '+' : ''}${slot}`);
      tag.scale.set(0.38, 0.19, 1);
      tag.position.set(slot * STEP, 0.14, 0.51);
      beam.add(tag);
    }
    const raycaster = new THREE.Raycaster(),
      plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5),
      intersection = new THREE.Vector3();
    const held = new Map<ObjectId, { x: number; z: number }>();
    let pointerObject: ObjectId | null = null,
      frame = 0,
      disposed = false;
    const reportHeld = () => latest.current.onHeld(held.size);
    function point(x: number, y: number) {
      raycaster.setFromCamera(new THREE.Vector2(x * 2 - 1, 1 - y * 2), camera);
      return raycaster.ray.intersectPlane(plane, intersection)?.clone();
    }
    const api: SceneAPI = {
      hit(x, y) {
        if (latest.current.disabled) return null;
        let best: ObjectId | null = null,
          d = 0.105;
        for (const id of ['A', 'B'] as const) {
          if (held.has(id) || (latest.current.movableObject && latest.current.movableObject !== id))
            continue;
          const p = objects[id].position.clone();
          p.y += 0.4;
          p.project(camera);
          const distance = Math.hypot((p.x + 1) / 2 - x, (1 - p.y) / 2 - y);
          if (distance < d) {
            best = id;
            d = distance;
          }
        }
        return best;
      },
      grab(id) {
        if (
          latest.current.disabled ||
          held.has(id) ||
          (latest.current.movableObject && latest.current.movableObject !== id)
        )
          return;
        const position = objects[id].position;
        held.set(id, { x: position.x, z: position.z });
        controls.enabled = false;
        reportHeld();
      },
      move(id, x, y) {
        if (!held.has(id)) return;
        const p = point(x, y);
        if (p)
          held.set(id, {
            x: THREE.MathUtils.clamp(p.x, -4.5, 4.5),
            z: THREE.MathUtils.clamp(p.z, -2.3, 2.5),
          });
      },
      drop(id, x, y, source) {
        if (!held.has(id)) return;
        const p = point(x, y);
        const slot = p
          ? SLOTS.reduce((a, b) => (Math.abs(a * STEP - p.x) < Math.abs(b * STEP - p.x) ? a : b))
          : null;
        held.delete(id);
        controls.enabled = held.size === 0;
        reportHeld();
        if (!p || slot === null || Math.abs(p.z) > 0.95 || Math.abs(slot * STEP - p.x) > 0.55) {
          latest.current.onMessage(
            'Thả vật vào một vạch trên thanh. Vật đã trở về vị trí trước đó.',
          );
          return;
        }
        latest.current.onPlace(id, slot, source);
      },
      cancel(id) {
        held.delete(id);
        controls.enabled = held.size === 0;
        reportHeld();
      },
      resetView() {
        camera.position.set(6.8, 7.1, 9.3);
        controls.target.set(0, 0.4, 0);
        controls.update();
      },
    };
    latest.current.apiRef.current = api;
    function coords(e: PointerEvent) {
      const r = renderer.domElement.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    }
    function down(e: PointerEvent) {
      if (e.button !== 0 || latest.current.cameraActive || latest.current.disabled) return;
      const p = coords(e),
        id = api.hit(p.x, p.y);
      if (id) {
        e.preventDefault();
        pointerObject = id;
        renderer.domElement.setPointerCapture(e.pointerId);
        api.grab(id);
      }
    }
    function move(e: PointerEvent) {
      if (pointerObject) {
        const p = coords(e);
        api.move(pointerObject, p.x, p.y);
      }
    }
    function up(e: PointerEvent) {
      if (pointerObject) {
        const id = pointerObject;
        pointerObject = null;
        const p = coords(e);
        api.drop(id, p.x, p.y, 'pointer');
        if (renderer.domElement.hasPointerCapture(e.pointerId))
          renderer.domElement.releasePointerCapture(e.pointerId);
      }
    }
    function cancel() {
      if (pointerObject) {
        api.cancel(pointerObject);
        pointerObject = null;
      }
    }
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', cancel);
    renderer.domElement.addEventListener('lostpointercapture', cancel);
    const resize = new ResizeObserver(() => {
      if (!node.clientWidth || !node.clientHeight) return;
      camera.aspect = node.clientWidth / node.clientHeight;
      camera.zoom = Math.min(1, camera.aspect / 1.35);
      camera.updateProjectionMatrix();
      renderer.setSize(node.clientWidth, node.clientHeight);
      needsRender = true;
    });
    resize.observe(node);
    controls.addEventListener('change', () => {
      needsRender = true;
    });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previousState: Props | undefined;
    let previousFrame = 0;
    function draw(now: number) {
      if (disposed) return;
      frame = requestAnimationFrame(draw);
      if (document.hidden || now - previousFrame < 1000 / 30) return;
      previousFrame = now;
      const state = latest.current;
      let changed = needsRender || state !== previousState;
      previousState = state;
      const target =
        state.result?.outcome === 'LEFT_DOWN'
          ? 0.15
          : state.result?.outcome === 'RIGHT_DOWN'
            ? -0.15
            : 0;
      const angleDelta = Math.abs(target - beam.rotation.z);
      changed ||= angleDelta > 0;
      beam.rotation.z =
        reduced || angleDelta < 0.0001
          ? target
          : THREE.MathUtils.lerp(beam.rotation.z, target, 0.16);
      for (const id of ['A', 'B'] as const) {
        const object = objects[id],
          drag = held.get(id),
          slot = state.plan[id];
        let pos: THREE.Vector3;
        if (drag) pos = new THREE.Vector3(drag.x, 1.5, drag.z);
        else if (slot !== null)
          pos = new THREE.Vector3(slot * STEP, 0.15, 0)
            .applyAxisAngle(new THREE.Vector3(0, 0, 1), beam.rotation.z)
            .add(new THREE.Vector3(0, pivotHeight, 0));
        else pos = new THREE.Vector3(id === 'A' ? -2.6 : 2.6, 0, 1.9);
        const distance = object.position.distanceToSquared(pos);
        const rotation = drag || slot === null ? 0 : beam.rotation.z;
        const scale = state.highlight === id ? 1.1 : drag ? 1.06 : 1;
        changed ||= distance > 0 || rotation !== object.rotation.z || scale !== object.scale.x;
        object.position.lerp(pos, reduced || distance < 0.000001 ? 1 : 0.42);
        object.rotation.z = rotation;
        object.scale.setScalar(scale);
      }
      controls.update();
      if (changed || needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
      }
    }
    frame = requestAnimationFrame(draw);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      latest.current.apiRef.current = null;
      workshop.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
        if (o instanceof THREE.Sprite) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="scene-wrap">
      <div ref={host} className="scene-canvas" />
      {error && (
        <div className="scene-error">
          Máy chưa hỗ trợ hiển thị 3D. Em vẫn có thể đặt vật bằng bộ chọn vị trí và chạy mô phỏng.
        </div>
      )}
      <div className="scene-corner">
        <span>
          <Move size={14} />{' '}
          {props.disabled
            ? 'Điều chỉnh bằng thanh trượt'
            : props.movableObject
              ? 'Kéo quả cân ' + props.movableObject
              : 'Nắm và di chuyển vật'}
        </span>
        <span>
          <ArrowLeftRight size={14} /> Mỗi vạch = 0,1 m
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="reset-view"
        aria-label="Đặt lại góc nhìn"
        onClick={() => props.apiRef.current?.resetView()}
      >
        <RotateCcw size={16} />
      </Button>
      {props.cursors.map((c) => (
        <div
          key={c.id}
          className={'hand-cursor ' + (c.holding ? 'holding' : '')}
          style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
        >
          <span />
          {c.holding && <b>{c.holding}</b>}
        </div>
      ))}
    </div>
  );
}
