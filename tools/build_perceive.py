"""Build assets/data/perceive.json: what the agent saw and fitted in 3D during run 1 of the air-fryer session.

Everything comes from the session archive: the 09:19:21 RGB-D frame it observed, and the numbers its own
analysis scripts (output/analysis/a1-a23.py) printed. Usage:
    python tools/build_perceive.py <session dir> assets/data/perceive.json
"""
import base64, json, pickle, sys
from pathlib import Path

import cv2 as cv
import numpy as np

S, OUT = Path(sys.argv[1]), Path(sys.argv[2])
WS = S / 'agent-workspace'
FRAME = WS / 'runtime/frames/20261004091921082b12'
meta = json.loads((FRAME / 'meta.json').read_text())


def cam(name, stride, keep, dense=2):
    info = meta['cameras'][name]
    rgb = cv.imread(str(FRAME / info['rgb']))[:, :, ::-1]
    depth = cv.imread(str(FRAME / info['depth']), cv.IMREAD_UNCHANGED).astype(np.float32) / 1000.0
    hsv = cv.cvtColor(rgb[:, :, ::-1].copy(), cv.COLOR_BGR2HSV)
    K, T = np.array(info['K']), np.array(info['T_base_cam'])   # the left correction only applies after 10:44
    vs, us = np.mgrid[0:depth.shape[0]:stride, 0:depth.shape[1]:stride]
    # one pixel at random from each stride cell, so the cloud has no regular grid to alias
    rng = np.random.default_rng(0)
    vs = np.minimum(vs + rng.integers(0, stride, vs.shape), depth.shape[0] - 1)
    us = np.minimum(us + rng.integers(0, stride, us.shape), depth.shape[1] - 1)
    d = depth[vs, us]
    ok = (d > 0) & (d < 1.6)
    us, vs, d = us[ok], vs[ok], d[ok]
    pc = np.stack([(us - K[0, 2]) / K[0, 0] * d, (vs - K[1, 2]) / K[1, 1] * d, d, np.ones_like(d)], 1)
    p = (T @ pc.T).T[:, :3]
    # a2.py: the handle is the dark pixels inside the fryer's box
    box = (p[:, 0] > 0.40) & (p[:, 0] < 0.85) & (p[:, 1] > -0.45) & (p[:, 1] < 0.0) & (p[:, 2] > 0.12) & (p[:, 2] < 0.45)
    dark = box & (hsv[vs, us, 2] < 70) & (p[:, 2] < 0.33)
    sel = keep(p)
    # denser around the fryer: also keep the pixels of a finer grid there
    if dense < stride:
        vs2, us2 = np.mgrid[0:depth.shape[0]:dense, 0:depth.shape[1]:dense]
        vs2 = np.minimum(vs2 + rng.integers(0, dense, vs2.shape), depth.shape[0] - 1)
        us2 = np.minimum(us2 + rng.integers(0, dense, us2.shape), depth.shape[1] - 1)
        d2 = depth[vs2, us2]
        ok2 = (d2 > 0) & (d2 < 1.6)
        us2, vs2, d2 = us2[ok2], vs2[ok2], d2[ok2]
        pc2 = np.stack([(us2 - K[0, 2]) / K[0, 0] * d2, (vs2 - K[1, 2]) / K[1, 1] * d2, d2, np.ones_like(d2)], 1)
        p2 = (T @ pc2.T).T[:, :3]
        f2 = (np.linalg.norm(p2[:, :2] - np.array([0.58, -0.17]), axis=1) < 0.2) & (p2[:, 2] > 0.1) & (p2[:, 2] < 0.45)
        box2 = (p2[:, 0] > 0.40) & (p2[:, 0] < 0.85) & (p2[:, 1] > -0.45) & (p2[:, 1] < 0.0) & (p2[:, 2] > 0.12) & (p2[:, 2] < 0.45)
        dark2 = box2 & (hsv[vs2, us2, 2] < 70) & (p2[:, 2] < 0.33)
        far = ~((np.linalg.norm(p[:, :2] - np.array([0.58, -0.17]), axis=1) < 0.2) & (p[:, 2] > 0.1) & (p[:, 2] < 0.45))
        sel &= far
        p = np.concatenate([p[sel], p2[f2]]); dark = np.concatenate([dark[sel], dark2[f2]])
        cols = np.concatenate([rgb[vs[sel], us[sel]], rgb[vs2[f2], us2[f2]]])
        sel = np.ones(len(p), bool); vs = us = None
    else:
        cols = rgb[vs[sel], us[sel]]
    p, c, dark = p[sel], cols, dark[sel]
    enc = lambda a: base64.b64encode(a.tobytes()).decode()
    return {'n': int(len(p)), 'pos': enc(np.round(p * 10000).astype(np.int16)), 'rgb': enc(c.astype(np.uint8)),
            'dark': enc(dark.astype(np.uint8)), 'K': K.tolist(), 'T': T.tolist(), 'size': [info['width'], info['height']]}


everything = lambda p: np.ones(len(p), bool)
# the right camera only adds the fryer and the table around it: the fused view of a1.py
near = lambda p: (p[:, 0] > 0.30) & (p[:, 0] < 0.85) & (p[:, 1] > -0.45) & (p[:, 1] < 0.10) & (p[:, 2] > 0.07) & (p[:, 2] < 0.5)

c = [0.608, -0.21]
ang = np.deg2rad(141)
d = [float(np.cos(ang)), float(np.sin(ang))]
t = [-d[1], d[0]]


def hand(theta, sd, z, ys=1):
    """Tool frame of a22.py: approach tilted theta below horizontal toward the axis, fingers along t."""
    th = np.deg2rad(theta)
    D, Tt = np.r_[d, 0], np.r_[t, 0]
    zh = -np.cos(th) * D + np.array([0, 0, -np.sin(th)])
    y = ys * Tt - zh * (ys * Tt @ zh); y /= np.linalg.norm(y)
    x = np.cross(y, zh)
    p = np.r_[np.array(c) + sd * np.array(d), z]
    return {'p': p.round(4).tolist(), 'R': np.c_[x, y, zh].round(4).tolist()}


# the grasps that passed its checks in a21.py and a22.py (a22.py printed 308 searched)
res = pickle.load(open(WS / 'output/analysis/a21.pkl', 'rb')) + pickle.load(open(WS / 'output/analysis/a22.pkl', 'rb'))
n_searched = 308
# a spread of them: one grasp per tilt and finger direction
seen, cands = set(), []
for r in sorted(res, key=lambda r: -r[4]):
    if (r[0], r[1]) in seen:
        continue
    seen.add((r[0], r[1]))
    cands.append(dict(hand(r[0], r[2], r[3], r[1]), clr=round(float(r[5]) * 1000, 1)))

chosen = hand(85, 0.156, 0.256)
zh = np.array(chosen['R'])[:, 2]
out = {
    'left': cam('left', 4, everything),
    'right': cam('right', 3, near),
    'model': {
        'c': c, 'd': d, 't': t, 'table_z': 0.09,
        # a2.py: circle fits to the body, slice by slice
        'bands': [[0.14, 0.20, 0.616, -0.214, 0.116], [0.20, 0.26, 0.608, -0.212, 0.106],
                  [0.26, 0.32, 0.607, -0.210, 0.097], [0.32, 0.38, 0.608, -0.205, 0.090]],
        # a21-a23.py: handle profile in (along d, z) and the collision boxes
        'profile': [[0.118, 0.270], [0.160, 0.272], [0.170, 0.262], [0.172, 0.240], [0.185, 0.135], [0.157, 0.128], [0.146, 0.225], [0.120, 0.238]],
        'grip': [[0.145, 0.188], [-0.017, 0.017], [0.125, 0.242]], 'arm': [[0.115, 0.172], [-0.017, 0.017], [0.238, 0.275]],
    },
    'plan': {'n_searched': n_searched, 'cands': cands, 'grasp': chosen,
             'pre': (np.array(chosen['p']) - 0.10 * zh).round(4).tolist(),
             'pull': (np.array(chosen['p']) + 0.15 * np.r_[d, 0]).round(4).tolist(), 'clr_mm': 12.4},
}
OUT.write_text(json.dumps(out, separators=(',', ':')))
print(OUT, OUT.stat().st_size // 1024, 'KB', out['left']['n'], out['right']['n'], 'dark', sum(np.frombuffer(base64.b64decode(out[k]['dark']), np.uint8).sum() for k in ('left', 'right')))
