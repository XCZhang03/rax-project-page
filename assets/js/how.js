// How RAX works: one session (the air fryer on the Franka), played as a sequence. The diagram and the
// code panel advance together: the agent explores through tool calls, writes a program, the program runs
// alone, hands control back when a check fails, and later runs need no agent at all.
(function () {
  'use strict';
  var root = document.getElementById('howRoot');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var IMG = 'assets/img/';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls, anchor) {
    var t = sv('text', { x: x, y: y, class: cls || '', 'text-anchor': anchor || 'start' }, parent);
    t.textContent = s;
    return t;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // The agent's tool calls in run 1, from the session log (local time).
  var LOG = [
    ['09:19:21', 'franka_observe()'],
    ['', '  ← left, right, wrist: rgb + depth'],
    ['09:19:41', "franka_pixel_to_position(camera='left', pixels=[[690, 250], …])"],
    ['10:03:41', 'franka_move_pose(position=[0.48, -0.106, 0.356], quaternion=[…])'],
    ['10:04:53', 'franka_move_pose(position=[0.490, -0.108, 0.256], …)'],
    ['10:05:07', "franka_gripper('grasp', width=0.025, force=50)"],
    ['10:05:25', 'franka_move_pose([-0.016, 0.013, 0], relative=True, tolerance_mm=5)'],
    ['10:05:35', 'franka_move_pose([-0.023, 0.019, 0], relative=True, tolerance_mm=5)'],
    ['10:18:57', "franka_gripper('grasp', width=0.02, force=20)   # banana"],
    ['10:27:23', "franka_gripper('open')                          # drop it in"],
    ['10:30:19', "franka_gripper('grasp', width=0.025, force=50)  # handle again"],
    ['10:34:12', "franka_move_joints(preset='home')"],
    ['10:36:18', "request_operator('Manual episode 1 succeeded (drawer opened ~12.6 cm, …)')"]
  ];
  // The program, condensed from the agent's code (as in the paper's architecture figure).
  var PROG = [
    ['', '# measured in the first manual run (m)'],
    ['', 'GRASP_FROM_FACE, PULL = -0.0116, 0.125'],
    ['', ''],
    ['', 'def open_drawer(robot, frame):'],
    ['perceive', '    # perceive: raw depth -> drawer geometry'],
    ['perceive', '    P = backproject(frame)        # base frame'],
    ['perceive', '    P = P[P.z > table_z(P) + .005]'],
    ['perceive', '    lid = P[(P.z > .38) & (P.z < .44)]'],
    ['perceive', '    c, r = robust_circle(lid.xy)  # axis'],
    ['unsure', '    if not .045 < r < .08: raise Unsure()'],
    ['perceive', '    H = P[(dist(P.xy,c) > r+.02) & (P.z<.2)]'],
    ['perceive', '    d = unit(median(largest_cluster(H)) - c)'],
    ['plan', '    # plan: check whole pull before moving'],
    ['plan', '    g = c + (face(P, d) + GRASP_FROM_FACE)*d'],
    ['plan', '    R = look_at(-d, up=Z)         # palm in'],
    ['plan', '    q = robot.ik(g - .06*d, R)    # pre-grasp'],
    ['plan', '    for s in arange(0, PULL, .01):'],
    ['plan', '        q = robot.ik(g + s*d, R, seed=q)'],
    ['plan', '        if q is None or margin(q) < .12:'],
    ['unsure', '            raise Unsure()'],
    ['act', '    # act: step-wise pull, then re-observe'],
    ['act', '    robot.move_pose(g - .06*d, R)'],
    ['act', '    robot.move_pose(g, R)'],
    ['act', '    robot.grasp(.025, 50)'],
    ['act', '    for s in arange(.03, PULL, .03):'],
    ['act', '        robot.move_pose(g + s*d, R, tol_mm=5)'],
    ['act', '    opened = face(observe(), d) - face(P, d)'],
    ['unsure', '    if opened < PULL - .03: raise Unsure()']
  ];

  var STEPS = [
    { t: 3800, clock: '09:18', title: 'A task in plain words',
      text: 'The operator types the task. The agent starts with the robot’s tools and an empty workspace: no demonstrations, no model of the fryer.',
      vid: 'how/h1_task', chip: 'Run 1, left camera', on: ['agent'], agent: 'reading the task', prog: 'not written yet',
      mem: { wm: ['TASK.md'], notes: [], code: [] }, code: 'task' },
    { t: 3900, clock: '09:19', title: 'It looks through tool calls',
      text: 'Every observation is a tool call across the isolation boundary. The robot returns colour and depth from three cameras.',
      vid: 'how/h2_look', img2: 'img/how/r1_depth.jpg', chip: 'Run 1: rgb, then the depth it gets back', on: ['agent', 'robot'],
      flows: [['down', 'franka_observe()'], ['up', 'rgb + depth']], agent: 'exploring', prog: 'not written yet',
      mem: { wm: ['→ franka_observe()', '← rgb + depth'], notes: [], code: [] }, code: 'log', log: 3 },
    { t: 3700, clock: '10:05', title: 'It acts one call at a time',
      text: 'The agent moves the arm itself, call by call: it lines up on the handle, grasps it at 50 N and pulls in small relative steps, looking again between moves.',
      vid: 'how/h3_act', chip: 'Run 1: grasp and pull, call by call', on: ['agent', 'robot'],
      flows: [['down', "franka_gripper('grasp')"], ['up', 'width, force'], ['down', 'franka_move_pose()']], agent: 'exploring', prog: 'not written yet',
      mem: { wm: ['→ franka_gripper(grasp)', '→ franka_move_pose(...)'], notes: [], code: [] }, code: 'log', log: 8 },
    { t: 7500, clock: '10:36', title: 'First success, and notes',
      text: 'Run 1 succeeds after about 72 minutes of the agent’s own inference and 262 thousand output tokens. It writes what it measured into its notes.',
      vid: 'how/h4_success', chip: 'Run 1: banana in, drawer closed', on: ['agent', 'mem'],
      flows: [['write', 'notes']], agent: 'writing notes', prog: 'not written yet',
      mem: { wm: ['← drawer closed'], notes: ['top 0.415 m, seam 0.245 m', 'drawer slides along d'], code: [] }, code: 'log', log: 13 },
    { t: 5600, clock: '10:44', title: 'It compiles what worked into a program',
      text: 'From its notes and measurements the agent writes a controller: its own perception, a plan checked before any motion, and the actions it found.',
      vid: 'how/h5_code', chip: 'Run 2: controller v1 takes the handle', on: ['agent', 'mem', 'prog'],
      flows: [['read', 'notes'], ['code', 'writes code']], agent: 'writing the code', prog: 'controller v1',
      mem: { wm: ['← notes, measurements'], notes: ['top 0.415 m, seam 0.245 m', 'drawer slides along d'], code: ['airfry/controller.py v1'] }, code: 'type' },
    { t: 3300, clock: 'run 9', title: 'The program runs alone: perceive',
      text: 'Later runs need no agent in the loop. The program measures the fryer anew from depth: the lid circle gives the axis, the handle the pull direction.',
      vid: 'prog/airfry_top', chip: 'Run 9, wrist camera: looking from above', on: ['prog', 'robot'], hl: 'perceive',
      flows: [['run', 'observe()'], ['runup', 'rgb + depth']], agent: 'not in the loop', prog: 'running',
      mem: { wm: [], notes: ['top 0.415 m, seam 0.245 m', 'drawer slides along d'], code: ['airfry/controller.py v9'] }, code: 'prog' },
    { t: 3400, clock: 'run 9', title: 'Plan the whole pull before moving',
      text: 'It solves inverse kinematics along the entire pull and checks the clearance before the arm moves at all.',
      vid: 'prog/airfry_grasp', chip: 'Run 9: to the handle, program alone', on: ['prog'], hl: 'plan',
      flows: [], agent: 'not in the loop', prog: 'running',
      mem: { wm: [], notes: ['top 0.415 m, seam 0.245 m', 'drawer slides along d'], code: ['airfry/controller.py v9'] }, code: 'prog' },
    { t: 3500, clock: 'run 9', title: 'Act, then measure again',
      text: 'It grasps the handle at 50 N, pulls in 3 cm steps, and measures the opening from the shift of the handle face: 12.7 cm.',
      vid: 'prog/airfry_pull', chip: 'Run 9: pull, opened 12.7 cm', on: ['prog', 'robot'], hl: 'act',
      flows: [['run', 'robot.grasp(.025, 50)'], ['run', 'robot.move_pose()']], agent: 'not in the loop', prog: 'running',
      mem: { wm: [], notes: ['top 0.415 m, seam 0.245 m', 'drawer slides along d'], code: ['airfry/controller.py v9'] }, code: 'prog' },
    { t: 4600, clock: 'run 5', title: 'Not sure? It hands control back',
      text: 'Every check that fails stops the program and returns control to the agent. In run 5 the close step stopped 3.7 mm short of the handle; the agent made that descent tolerant and resumed from the close step.',
      vid: 'how/h9_unsure', chip: 'Run 5: the close step stops at the handle', on: ['agent', 'prog'], hl: 'unsure', warn: true,
      flows: [['unsure', 'Unsure()'], ['code', 'fix, resume']], agent: 'fixing the code', prog: 'stopped',
      mem: { wm: ['← Unsure(): close step'], notes: ['top 0.415 m, seam 0.245 m', 'drawer slides along d'], code: ['airfry/controller.py v4'] }, code: 'prog' },
    { t: 4600, clock: '11:26–12:05', title: 'Unattended, and fast',
      text: 'Runs 6, 7, 9 and 10 succeed with no one stepping in, with the fryer moved and rotated between them. Each takes 18 to 23 s of inference, against 72 minutes when the agent acted itself.',
      vid: 'how/h10_unattended', chip: 'Run 10: banana and ball, unattended', on: ['prog', 'robot', 'mem'], speed: true,
      flows: [['run', 'program'], ['runup', 'done']], agent: 'watching', prog: 'verified',
      mem: { wm: [], notes: ['top 0.415 m, seam 0.245 m', 'RUNS.md: 6, 7, 9, 10 clean'], code: ['airfry/controller.py v10'] }, code: 'prog' }
  ];

  /* ---------- diagram ---------- */
  var svg = root.querySelector('svg.how-svg');
  svg.setAttribute('viewBox', '0 0 600 432');
  var defs = sv('defs', {}, svg);
  var mk = sv('marker', { id: 'howArrow', viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  sv('path', { d: 'M0,0 L8,4 L0,8 z', class: 'hw-arrowhead' }, mk);

  function node(x, y, w, h, cls) {
    var g = sv('g', { class: 'hw-node ' + (cls || '') }, svg);
    sv('rect', { x: x, y: y, width: w, height: h, rx: 12 }, g);
    return g;
  }
  // Memory
  var gMem = node(10, 14, 168, 128, 'mem');
  txt(gMem, 24, 38, 'Memory', 'hw-title');
  txt(gMem, 24, 58, 'Working memory', 'hw-k');
  var wmT = [txt(gMem, 24, 73, '', 'hw-mono'), txt(gMem, 24, 86, '', 'hw-mono')];
  txt(gMem, 24, 104, 'Notes · code', 'hw-k');
  var noteT = [txt(gMem, 24, 119, '', 'hw-mono'), txt(gMem, 24, 132, '', 'hw-mono')];
  // Agent
  var gAgent = node(224, 14, 152, 128, 'agent');
  txt(gAgent, 300, 48, 'Coding agent', 'hw-title inv', 'middle');
  txt(gAgent, 300, 67, 'frozen LLM', 'hw-sub inv', 'middle');
  var agentPill = sv('rect', { x: 236, y: 86, width: 128, height: 26, rx: 13, class: 'hw-pill' }, gAgent);
  var agentS = txt(gAgent, 300, 103, '', 'hw-status inv', 'middle');
  // Program
  var gProg = node(422, 14, 168, 128, 'prog');
  txt(gProg, 436, 38, 'Robot program', 'hw-title');
  txt(gProg, 436, 58, 'open_drawer(), close()', 'hw-mono');
  var progS = txt(gProg, 436, 84, '', 'hw-status');
  var progV = txt(gProg, 436, 128, '', 'hw-mono muted');
  // boundary
  sv('line', { x1: 10, x2: 590, y1: 164, y2: 164, class: 'hw-boundary' }, svg);
  txt(svg, 12, 158, 'isolation boundary', 'hw-k muted', 'start');
  // Robot
  var gRobot = node(96, 178, 408, 237, 'robot');
  txt(svg, 22, 300, 'Franka FR3', 'hw-k', 'start');
  txt(svg, 22, 315, 'arm, gripper,', 'hw-sub2');
  txt(svg, 22, 328, '3 RGB-D cameras', 'hw-sub2');

  // edges
  var P = {
    write: 'M222,64 H180', read: 'M180,92 H222',
    code: 'M378,56 H420', unsure: 'M420,104 H378',
    down: 'M280,142 V178', up: 'M320,178 V142',
    run: 'M556,142 V300 H504', runup: 'M504,330 H572 V142'
  };
  var edges = {};
  Object.keys(P).forEach(function (k) {
    edges[k] = sv('path', { d: P[k], class: 'hw-edge' + (k === 'unsure' ? ' dashed' : ''), 'marker-end': 'url(#howArrow)' }, svg);
  });
  var edgeLabels = [
    [201, 56, 'write', 'middle'], [201, 108, 'read', 'middle'], [399, 48, 'code', 'middle'], [399, 120, 'Unsure()', 'middle'],
    [274, 160, 'calls', 'end'], [326, 160, 'observations', 'start'], [529, 222, 'runs', 'middle'], [529, 235, 'alone', 'middle']
  ];
  edgeLabels.forEach(function (l) { txt(svg, l[0], l[1], l[2], 'hw-elab', l[3]); });
  var packets = sv('g', {}, svg);

  /* ---------- side panel ---------- */
  var codeHead = root.querySelector('.how-code-head');
  var codeBody = root.querySelector('.how-code');
  var capK = root.querySelector('.how-cap .k');
  var capH = root.querySelector('.how-cap h3');
  var capP = root.querySelector('.how-cap p');
  var speed = root.querySelector('.how-speed');
  var dots = root.querySelector('.how-dots');
  var playBtn = root.querySelector('.how-play');

  STEPS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + s.title);
    b.appendChild(document.createElement('span'));
    b.addEventListener('click', function () { go(i, true); });
    dots.appendChild(b);
  });

  function hlProg(line) {
    var code = line[1], hash = code.indexOf('#');
    var body = hash >= 0 ? code.slice(0, hash) : code, com = hash >= 0 ? code.slice(hash) : '';
    var h = esc(body).replace(/\b(def|for|in|if|not|is|None|or)\b/g, '<span class="kw">$1</span>')
      .replace(/raise Unsure\(\)/g, '<span class="err">raise Unsure()</span>');
    return h + (com ? '<span class="c">' + esc(com) + '</span>' : '');
  }
  function renderCode(s, frac) {
    if (s.code === 'task') {
      codeHead.textContent = 'TASK.md';
      codeBody.className = 'how-code task';
      codeBody.innerHTML = '<span class="ln">You should open the air fry pan, put the banana inside, and close it.</span>' +
        '<span class="ln">Reminder: the plate is really heavy and you should figure out where to grasp</span>' +
        '<span class="ln">and the force applied. […] maybe not pull out the plate entirely […]</span>';
      return;
    }
    if (s.code === 'log') {
      codeHead.textContent = 'Run 1: the agent’s own tool calls';
      codeBody.className = 'how-code log';
      codeBody.innerHTML = LOG.map(function (l, i) {
        var cls = 'ln' + (i < s.log ? ' shown' : '') + (i >= (s.prevLog || 0) && i < s.log ? ' fresh' : '');
        return '<span class="' + cls + '"><span class="tm">' + esc(l[0]) + '</span>' + esc(l[1]) + '</span>';
      }).join('');
      var last = codeBody.querySelectorAll('.ln.shown');
      if (last.length) codeBody.scrollTop = last[last.length - 1].offsetTop - codeBody.clientHeight + 30;
      return;
    }
    codeHead.textContent = 'airfry/controller.py, condensed from the agent’s code';
    codeBody.className = 'how-code pcode' + (s.hl ? ' focus' : '');
    var n = s.code === 'type' ? Math.floor(PROG.length * Math.min(1, frac)) : PROG.length;
    codeBody.innerHTML = PROG.map(function (l, i) {
      var cls = 'ln ' + l[0] + (i < n ? ' shown' : '') + (s.hl && l[0] === s.hl ? ' on' : '');
      return '<span class="' + cls + '">' + (hlProg(l) || ' ') + '</span>';
    }).join('');
    var first = codeBody.querySelector('.ln.on');
    var target = first ? Math.max(0, first.offsetTop - codeBody.offsetTop - 24) : 0;
    if (s.code !== 'type' || frac >= 1) codeBody.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
  }

  // The robot's camera: an HTML video laid over the robot box of the diagram.
  var fig = root.querySelector('.how-figure');
  var vid = document.createElement('video');
  vid.className = 'how-vid'; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.preload = 'auto';
  var still = document.createElement('img'); still.className = 'how-vid how-still'; still.alt = '';
  var chip = document.createElement('span'); chip.className = 'how-chip';
  var warnBox = document.createElement('span'); warnBox.className = 'how-warnbox';
  fig.appendChild(vid); fig.appendChild(still); fig.appendChild(chip); fig.appendChild(warnBox);
  function setMedia(s) {
    still.classList.remove('on');
    var src = 'assets/vid/' + s.vid + '.mp4';
    if (vid.getAttribute('src') !== src) { vid.poster = 'assets/vid/' + s.vid + '.jpg'; vid.src = src; }
    vid.currentTime = 0;
    if (playing && visible) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    if (s.img2) { still.src = 'assets/' + s.img2; later(function () { still.classList.add('on'); }, s.t * 0.55); }
  }

  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; packets.innerHTML = ''; }

  function packet(key, label, delay, warn) {
    if (['write', 'read', 'code', 'unsure'].indexOf(key) >= 0) label = '';
    later(function () {
      var path = edges[key], L = path.getTotalLength();
      var g = sv('g', { class: 'hw-packet' + (warn ? ' warn' : '') }, packets);
      sv('circle', { r: 5 }, g);
      var tw = Math.max(40, label.length * 6.3 + 12);
      var r = sv('rect', { height: 18, width: tw, rx: 9, x: 8, y: -9 }, g);
      var t = txt(g, 14, 4, label, 'hw-ptext');
      if (!label) { r.remove(); t.remove(); }
      if (key === 'write' || key === 'unsure') { r.setAttribute('x', -8 - tw); t.setAttribute('x', -2 - tw); }
      if (key === 'down' || key === 'up') { r.setAttribute('x', key === 'down' ? -8 - tw : 8); t.setAttribute('x', key === 'down' ? -2 - tw : 14); }
      if (key === 'run' || key === 'runup') { r.setAttribute('x', key === 'run' ? -8 - tw : 8); t.setAttribute('x', key === 'run' ? -2 - tw : 14); }
      var t0 = performance.now(), dur = 1100;
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var p = path.getPointAtLength(e * L);
        g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
        g.setAttribute('opacity', k > 0.85 ? (1 - k) / 0.15 : 1);
        if (k < 1) requestAnimationFrame(step); else g.remove();
      })(t0);
    }, delay);
  }

  var cur = -1, playing = false, visible = false, stepStart = 0, raf = null, lastTyped = -1;
  function go(i, user) {
    clearTimers();
    cur = i;
    var s = STEPS[i];
    s.prevLog = i > 0 && STEPS[i - 1].code === 'log' ? STEPS[i - 1].log : 0;
    Array.prototype.forEach.call(dots.children, function (b, j) {
      b.classList.toggle('done', j < i);
      b.setAttribute('aria-current', j === i ? 'step' : 'false');
      b.firstChild.style.transition = 'none';
      b.firstChild.style.width = j < i ? '100%' : '0%';
    });
    capK.textContent = (i + 1) + ' / ' + STEPS.length + ' · ' + s.clock;
    capH.textContent = s.title;
    capP.textContent = s.text;
    speed.hidden = !s.speed;
    [['agent', gAgent], ['mem', gMem], ['prog', gProg], ['robot', gRobot]].forEach(function (p) {
      p[1].classList.toggle('on', s.on.indexOf(p[0]) >= 0);
    });
    fig.classList.toggle('robot-off', s.on.indexOf('robot') < 0);
    gAgent.classList.toggle('idle', s.agent === 'not in the loop');
    agentS.textContent = s.agent;
    progS.textContent = s.prog;
    gProg.classList.toggle('warn', s.prog === 'stopped');
    gProg.classList.toggle('empty', s.prog === 'not written yet');
    progV.textContent = s.mem.code[0] || '';
    wmT.forEach(function (t, k) { t.textContent = s.mem.wm[k] || ''; });
    var notes = s.mem.notes.concat(s.mem.code.length && s.mem.notes.length < 2 ? s.mem.code : []);
    noteT.forEach(function (t, k) { t.textContent = notes[k] || ''; });
    Object.keys(edges).forEach(function (k) { edges[k].classList.remove('live'); });
    (s.flows || []).forEach(function (f) { edges[f[0]].classList.add('live'); });
    warnBox.classList.toggle('on', !!s.warn);
    chip.textContent = s.chip;
    setMedia(s);
    var flows = s.flows || [];
    if (!reduced) {
      var gap = Math.max(900, (s.t - 600) / Math.max(1, flows.length));
      flows.forEach(function (f, k) { packet(f[0], f[1], 250 + k * gap, f[0] === 'unsure'); });
    }
    renderCode(s, s.code === 'type' ? (reduced || !playing ? 1 : 0) : 1);
    stepStart = performance.now();
    lastTyped = -1;
    if (user && !playing) { renderCode(s, 1); }
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (!playing || !visible || cur < 0 || document.hidden) return;
    var s = STEPS[cur], k = (now - stepStart) / s.t;
    var bar = dots.children[cur].firstChild;
    bar.style.transition = 'none';
    bar.style.width = Math.min(100, k * 100) + '%';
    if (s.code === 'type') { var n = Math.floor(PROG.length * Math.min(1, k / 0.8)); if (n !== lastTyped) { lastTyped = n; renderCode(s, k / 0.8); } }
    if (k >= 1) go((cur + 1) % STEPS.length);
  }
  function setPlaying(p) {
    playing = p;
    playBtn.setAttribute('aria-label', p ? 'Pause' : 'Play');
    playBtn.classList.toggle('paused', !p);
  }
  playBtn.addEventListener('click', function () {
    setPlaying(!playing);
    if (!playing) vid.pause();
    if (playing) { go(cur < 0 ? 0 : cur); }
  });
  go(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var was = visible;
      visible = es[0].isIntersecting;
      if (visible && !was && playing) go(cur < 0 ? 0 : cur);
      if (!visible) vid.pause();
    }, { threshold: 0.35 }).observe(root);
  } else { visible = true; }
  setPlaying(!reduced);
  raf = requestAnimationFrame(tick);
})();
