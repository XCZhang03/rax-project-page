// The agent's articulated air-fryer model over the left camera's point cloud, with the actions it planned.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const root = document.getElementById('fryerRoot');
const view = root.querySelector('.three-view');
const COL = { body: 0x2a78d6, drawer: 0x7b3fd1, act: 0xe34948, banana: 0xd99400, ball: 0xeb6834, close: 0x6b727c, rim: 0x0e9e6e };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function decode(cloud) {
  const pos = Uint8Array.from(atob(cloud.pos), (c) => c.charCodeAt(0));
  const q = new Int16Array(pos.buffer);
  const rgb = Uint8Array.from(atob(cloud.rgb), (c) => c.charCodeAt(0));
  const P = new Float32Array(q.length), C = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) { P[i] = q[i] / 10000; C[i] = rgb[i] / 255; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.BufferAttribute(C, 3));
  return g;
}

function ring(r, z, color, opts = {}) {
  const pts = [];
  for (let k = 0; k <= 96; k++) { const a = (k / 96) * Math.PI * 2; pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z)); }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const m = opts.dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 0.008, gapSize: 0.006, transparent: true, opacity: opts.opacity ?? 1 })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity: opts.opacity ?? 1 });
  const l = new THREE.Line(g, m);
  if (opts.dashed) l.computeLineDistances();
  return l;
}

function rod(a, b, radius, color, opacity = 1) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 10, 1);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function cone(at, dir, color) {
  const geo = new THREE.ConeGeometry(0.006, 0.016, 16);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
  m.position.copy(at);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

function boxMesh(b, color) {
  const [[d0, d1], [t0, t1], [z0, z1]] = b;
  const geo = new THREE.BoxGeometry(d1 - d0, t1 - t0, z1 - z0);
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color }));
  g.add(mesh, edges);
  g.position.set((d0 + d1) / 2, (t0 + t1) / 2, (z0 + z1) / 2);
  return g;
}

function shell(r, z0, z1, color, opacity) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(r, r, z1 - z0, 72, 1, true);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = Math.PI / 2;
  m.position.z = (z0 + z1) / 2;
  g.add(m, ring(r, z0, color), ring(r, z1, color));
  return g;
}

// A hand pose: base square at the tool point facing the approach axis, apex toward the hand;
// the thick base edge is the finger-closing axis.
function pyramid(p, R, color) {
  const g = new THREE.Group();
  const col = (j) => new THREE.Vector3(R[0][j], R[1][j], R[2][j]);
  const X = col(0), Y = col(1), Z = col(2);
  const at = (x, y, z) => p.clone().addScaledVector(X, x).addScaledVector(Y, y).addScaledVector(Z, z);
  const h = 0.022, L = 0.055;
  const apex = at(0, 0, -L), b = [at(h, h, 0), at(-h, h, 0), at(-h, -h, 0), at(h, -h, 0)];
  const v = [];
  for (let k = 0; k < 4; k++) v.push(apex, b[k], b[(k + 1) % 4]);
  v.push(b[0], b[1], b[2], b[0], b[2], b[3]);
  const geo = new THREE.BufferGeometry().setFromPoints(v);
  g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })));
  const e = [];
  for (let k = 0; k < 4; k++) e.push(apex, b[k], b[k], b[(k + 1) % 4]);
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(e), new THREE.LineBasicMaterial({ color })));
  g.add(rod(b[0], b[3], 0.0016, color));
  return g;
}

async function init() {
  const loading = view.querySelector('.loading');
  let data;
  try {
    const res = await fetch('assets/data/fryer.json');
    data = await res.json();
  } catch (e) {
    loading.textContent = 'The 3D view could not load. Reload the page to try again.';
    return;
  }
  loading.remove();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  view.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const M = data.model;
  const center = new THREE.Vector3(M.c[0] + 0.06 * M.d[0], M.c[1] + 0.06 * M.d[1], 0.23);
  const camera = new THREE.PerspectiveCamera(35, 4 / 3, 0.01, 10);
  camera.up.set(0, 0, 1);
  // view from in front of the fryer, slightly to its handle side, as in the paper
  const dv = new THREE.Vector3(M.d[0], M.d[1], 0), tv = new THREE.Vector3(M.t[0], M.t[1], 0);
  camera.position.copy(center).addScaledVector(dv, 0.82).addScaledVector(tv, -0.56).add(new THREE.Vector3(0, 0, 0.5));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(center);
  controls.enableDamping = true;
  controls.minDistance = 0.25;
  controls.maxDistance = 1.8;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // point clouds
  const pmat = new THREE.PointsMaterial({ size: 0.0034, vertexColors: true, sizeAttenuation: true });
  const cloudClosed = new THREE.Points(decode(data.closed), pmat);
  const cloudOpen = new THREE.Points(decode(data.open), pmat);
  scene.add(cloudClosed, cloudOpen);

  // the model, in the fryer frame (d, t, z) with its origin on the axis
  const fryer = new THREE.Group();
  const basis = new THREE.Matrix4().makeBasis(dv, tv, new THREE.Vector3(0, 0, 1));
  basis.setPosition(M.c[0], M.c[1], 0);
  fryer.applyMatrix4(basis);
  const body = new THREE.Group();
  body.add(shell(M.r_upper, M.seam_z, M.top_z, COL.body, 0.1));
  body.add(ring(M.r_lower, M.table_z, COL.body, { opacity: 0.5, dashed: true }));
  body.add(rod(new THREE.Vector3(0, 0, M.table_z), new THREE.Vector3(0, 0, M.top_z + 0.05), 0.0012, COL.body));
  const drawer = new THREE.Group();
  drawer.add(shell(M.r_lower, M.table_z, M.seam_z, COL.drawer, 0.16));
  drawer.add(boxMesh(M.grip, COL.drawer), boxMesh(M.arm, COL.drawer));
  const jA = new THREE.Vector3(M.r_lower + 0.035, 0, 0.11), jB = new THREE.Vector3(M.r_lower + 0.165, 0, 0.11);
  const joint = new THREE.Group();
  joint.add(rod(jA, jB, 0.0018, COL.drawer), cone(jB, new THREE.Vector3(1, 0, 0), COL.drawer), cone(jA, new THREE.Vector3(-1, 0, 0), COL.drawer));
  fryer.add(body, drawer, joint);
  scene.add(fryer);

  // planned actions, in the robot base frame
  const A = data.actions;
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const actions = new THREE.Group();
  const steps = A.steps.map(V);
  actions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(steps), new THREE.LineBasicMaterial({ color: COL.act })));
  steps.slice(1, -1).forEach((p) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.003, 12, 8), new THREE.MeshBasicMaterial({ color: COL.act })); s.position.copy(p); actions.add(s); });
  actions.add(pyramid(steps[0], A.R_handle, COL.act), pyramid(steps[steps.length - 1], A.R_handle, COL.act));
  actions.add(pyramid(V(A.banana), A.R_banana, COL.banana), pyramid(V(A.ball), A.R_ball, COL.ball));
  const cA = V(A.close_from), cB = V(A.close_to);
  actions.add(rod(cA, cB, 0.0014, COL.close), cone(cB, new THREE.Vector3().subVectors(cB, cA), COL.close));
  scene.add(actions);

  const rims = new THREE.Group();
  const rp = ring(data.rim.r_pred, data.rim.z, COL.drawer, { dashed: true }); rp.position.set(data.rim.pred[0], data.rim.pred[1], 0);
  const rm = ring(data.rim.r_meas, data.rim.z, COL.rim); rm.position.set(data.rim.meas[0], data.rim.meas[1], 0);
  rims.add(rp, rm);
  scene.add(rims);

  // labels that follow the 3D points
  const pin = (text, color, fn) => {
    const e = document.createElement('span');
    e.className = 'lbl3';
    e.textContent = text;
    e.style.background = '#' + color.toString(16).padStart(6, '0');
    view.appendChild(e);
    return { e, fn };
  };
  const local = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(fryer.matrixWorld);
  const pins = [
    pin('axis c', COL.body, () => local(0, 0, M.top_z + 0.065)),
    pin('drawer + handle', COL.drawer, () => local(state.out + M.r_lower + 0.02, -0.06, M.table_z + 0.02)),
    pin('1 grasp', COL.act, () => steps[0].clone().add(new THREE.Vector3(0, 0, 0.075)), 'act'),
    pin('2 pulled', COL.act, () => steps[steps.length - 1].clone().add(new THREE.Vector3(0, 0, 0.075)), 'act'),
    pin('3 banana', COL.banana, () => V(A.banana).add(new THREE.Vector3(0, 0, 0.06)), 'act'),
    pin('4 ball', COL.ball, () => V(A.ball).add(new THREE.Vector3(0, 0, -0.05)), 'act'),
    pin('5 push closed', COL.close, () => cA.clone().add(new THREE.Vector3(0, 0, -0.025)), 'act')
  ];
  pins.slice(2).forEach((p) => { p.act = true; });

  const state = { out: 0, cloud: true, model: true, actions: true };
  const slider = root.querySelector('#fryerOpen');
  const outText = root.querySelector('#fryerOpenOut');
  const status = root.querySelector('#fryerStatus');
  slider.max = Math.round(M.opened * 1000);
  function update() {
    const opened = state.out >= M.opened * 0.97;
    drawer.position.x = state.out;
    joint.position.x = state.out;
    cloudClosed.visible = state.cloud && state.out < M.opened / 2;
    cloudOpen.visible = state.cloud && state.out >= M.opened / 2;
    body.visible = drawer.visible = joint.visible = state.model;
    actions.visible = state.actions && opened;
    rims.visible = state.model && opened;
    pins.forEach((p) => { p.hidden = p.act ? !actions.visible : !state.model; });
    outText.textContent = (state.out * 100).toFixed(1) + ' cm';
    status.textContent = opened
      ? 'Drawer at the opening the program measured. Planned actions shown; the rim it measured lies ' + data.rim.gap_mm + ' mm from the rim its model predicted.'
      : 'Drag to open the drawer along the prismatic joint. The planned actions appear at the measured opening.';
  }
  slider.addEventListener('input', () => { state.out = slider.value / 1000; update(); });
  root.querySelectorAll('[data-layer]').forEach((cb) => cb.addEventListener('change', () => { state[cb.dataset.layer] = cb.checked; update(); }));
  // open the drawer once when the viewer first comes into view
  state.out = 0;
  update();
  let animOpen = !reduced;
  const t0 = performance.now() + 900;

  function resize() {
    const w = view.clientWidth, h = view.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(view);
  resize();

  const tmp = new THREE.Vector3();
  // Render only while on screen, and only when something moves.
  let visible = true, running = false, dirty = true;
  controls.addEventListener('change', () => { dirty = true; });
  const wake = () => { dirty = true; if (!running && visible) { running = true; requestAnimationFrame(loop); } };
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(view);
  root.addEventListener('input', wake); root.addEventListener('change', wake); view.addEventListener('pointerdown', wake); view.addEventListener('wheel', wake, { passive: true });
  function loop(now) {
    if (!visible || document.hidden) { running = false; return; }
    requestAnimationFrame(loop);
    if (animOpen && now > t0) {
      const k = Math.min(1, (now - t0) / 2200);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      state.out = e * M.opened;
      slider.value = Math.round(state.out * 1000);
      update();
      if (k >= 1) animOpen = false;
    }
    const moved = controls.update();
    if (!moved && !dirty && !animOpen && !controls.autoRotate) return;
    dirty = false;
    renderer.render(scene, camera);
    const w = view.clientWidth, h = view.clientHeight;
    pins.forEach((p) => {
      if (p.hidden) { p.e.style.display = 'none'; return; }
      tmp.copy(p.fn()).project(camera);
      if (tmp.z > 1) { p.e.style.display = 'none'; return; }
      p.e.style.display = '';
      p.e.style.left = ((tmp.x + 1) / 2) * w + 'px';
      p.e.style.top = ((1 - tmp.y) / 2) * h + 'px';
    });
  }
  slider.addEventListener('pointerdown', () => { animOpen = false; });
  wake();
}

// Load three.js and the clouds only when the viewer comes near the screen.
const io = new IntersectionObserver((es) => {
  if (es[0].isIntersecting) { io.disconnect(); init(); }
}, { rootMargin: '400px' });
io.observe(view);
