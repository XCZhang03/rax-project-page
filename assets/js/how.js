// How RAX works: the air-fryer session in four acts, each a clip of the raw left camera with what the
// agent or its program was doing at the same moments (tool calls, the code it wrote, the fix, the program running).
(function () {
  'use strict';
  var root = document.getElementById('howRoot');
  if (!root || !window.RAX || !RAX.code || !RAX.code.airfry) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hms(s) { var p = s.split(':'); return +p[0] * 3600 + +p[1] * 60 + +(p[2] || 0); }
  var PROG = RAX.code.airfry;

  // Wall-clock times are EDT; each clip lists its segments [start, end, speed].
  var ACTS = [
    { title: 'Explore with tool calls', sub: 'the agent drives the robot', vid: 'how/a1_explore', when: 'Run 1, 09:19–10:36',
      segs: [['09:19:15', '09:19:45', 10], ['10:03:35', '10:06:20', 48], ['10:18:45', '10:19:30', 18], ['10:26:45', '10:27:35', 20], ['10:30:05', '10:34:15', 100]],
      text: 'The agent itself moves the arm, one tool call at a time: it looks, lines up on the handle, grasps it at 50 N, pulls the drawer, drops the banana in and pushes the drawer shut.',
      stat: '72 min of the agent’s own inference, 262k output tokens', mode: 'feed', head: 'The agent’s tool calls, in step with the clip',
      feed: [
        ['09:19:21', 'call', 'franka_observe()  → left, right, wrist: rgb + depth'],
        ['09:19:41', 'call', "franka_pixel_to_position(camera='left', pixels=[[690, 250], …])"],
        ['10:03:41', 'call', 'franka_move_pose([0.48, -0.106, 0.356], quaternion=[…])'],
        ['10:04:53', 'call', 'franka_move_pose([0.490, -0.108, 0.256], …)'],
        ['10:05:07', 'call', "franka_gripper('grasp', width=0.025, force=50)"],
        ['10:05:25', 'call', 'franka_move_pose([-0.016, 0.013, 0], relative=True, tolerance_mm=5)'],
        ['10:05:35', 'call', 'franka_move_pose([-0.023, 0.019, 0], relative=True, tolerance_mm=5)'],
        ['10:18:57', 'call', "franka_gripper('grasp', width=0.02, force=20)   # banana"],
        ['10:27:23', 'call', "franka_gripper('open')   # drop it in"],
        ['10:30:19', 'call', "franka_gripper('grasp', width=0.025, force=50)   # handle again"],
        ['10:34:12', 'call', "franka_move_joints(preset='home')"],
        ['10:36:18', 'call', "request_operator('Manual episode 1 succeeded (drawer opened ~12.6 cm, …)')"]
      ] },
    { title: 'Write the program', sub: 'from what worked', vid: 'how/a2_program', when: '10:36–10:44', hold: 7000,
      text: 'It turns what it measured in run 1 into a controller: its own perception, a plan checked before any motion, and the actions that worked. About 1,500 lines of Python, condensed here.',
      stat: 'Clip: run 2, the first controller takes the handle', mode: 'type' },
    { title: 'Hand back when unsure', sub: 'a failed check stops it', vid: 'how/a3_unsure', when: 'Run 5, 11:22–11:25',
      segs: [['11:22:30', '11:25:06', 30]],
      text: 'Every check that fails stops the program and returns control to the agent. Here the arm stopped 3.7 mm short of the handle; the agent made that descent tolerant and resumed from the close step.',
      stat: 'Resumed close step: 81 s, handle 1.5 mm from where it began', mode: 'feed', head: 'What happened, in step with the clip',
      feed: [
        ['11:22:37', 'call', 'franka_move_joints([…])   # above the handle'],
        ['11:22:52', 'call', 'franka_move_pose([0.391, -0.032, 0.223], timeout_s=15, …)'],
        ['11:22:52', 'error', 'TimeoutError: pose not reached in 15.0s: position error 3.7 mm'],
        ['11:22:52', 'error', 'the controller stops (report ok = False); control returns to the agent'],
        ['11:23:15', 'edit', 'edit code/airfry/controller.py: descend_to_grasp', 1],
        ['11:23:15', 'edit', '+ ok, rep = robot.try_move_pose(grasp, quat, tol_mm=3, timeout_s=10)', 1],
        ['11:23:15', 'edit', '+ acceptable = np.linalg.norm(e) < 0.008   # residual < 8 mm', 1],
        ['11:23:42', 'run', 'python code/airfry/controller.py --steps close --resume 20261004T112042'],
        ['11:24:11', 'say', 'descent residual 6.6 mm: within tolerance'],
        ['11:24:11', 'call', "franka_gripper('grasp', width=0.025, force=50)"],
        ['11:24:16', 'call', 'franka_move_pose(…)   # push the drawer, 4 steps'],
        ['11:25:03', 'ok', 'close: ok, face shift 1.5 mm']
      ] },
    { title: 'The program runs alone', sub: 'no agent in the loop', vid: 'how/a4_alone', when: 'Run 9, 11:50, fryer rotated',
      segs: [['11:50:07.4', '11:52:55', 12]],
      text: 'The program perceives the fryer anew, plans the whole pull before it moves, opens the drawer, drops the banana, closes it, and checks every step. The arrow follows the line it is running.',
      stat: '178 s unattended; 18–23 s of inference per run, against 72 min in run 1', mode: 'run',
      // seconds after the run start -> line of the condensed program, from the run's own call log
      sched: [[0, 0], [2, 1], [7.6, 2], [9, 3], [11, 4], [12, 5], [13, 6], [14, 7], [15, 9], [18, 10], [25.5, 11], [27, 12], [30, 13],
              [36, 14], [37, 15], [43.6, 16], [48, 17], [52, 18], [61.3, 19], [72, 20], [90, 21], [97.7, 22], [109.6, 23], [111, 24],
              [114, 26], [118, 27], [124, 28], [135.5, 29], [146, 30], [150, 31], [163.1, 32], [166, 33]] }
  ];

  var actsEl = root.querySelector('.acts'), video = root.querySelector('video'), tag = root.querySelector('.pl-tag');
  var bar = root.querySelector('.pl-progress span'), btn = root.querySelector('.pl-btn');
  var capK = root.querySelector('.how-k'), capH = root.querySelector('.how-h'), capP = root.querySelector('.how-p'), capS = root.querySelector('.how-stat');
  var head = root.querySelector('.cc-code-head'), pre = root.querySelector('.cc-pre'), feedEl = root.querySelector('.cc-feed');
  var KIND = { call: 'robot', run: 'shell', edit: 'edit', say: 'agent', error: 'stop', ok: 'done' };
  var acts = ACTS.map(function (a, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<b>' + (i + 1) + '</b><span><strong>' + esc(a.title) + '</strong><em>' + esc(a.sub) + '</em></span><i></i>';
    b.addEventListener('click', function () { go(i); });
    var li = document.createElement('li'); li.appendChild(b); actsEl.appendChild(li);
    return b;
  });
  function hl(code) {
    var h = code.indexOf('#'), body = h >= 0 ? code.slice(0, h) : code, com = h >= 0 ? code.slice(h) : '';
    return esc(body).replace(/\b(def|for|in|if|not|is|None|or|and|return|raise|else)\b/g, '<span class="kw">$1</span>')
      .replace(/(StepFailure)/g, '<span class="err">$1</span>') + (com ? '<span class="c">' + esc(com) + '</span>' : '');
  }
  pre.innerHTML = PROG.lines.map(function (l) { return '<span class="ln">' + (hl(l.t) || ' ') + '</span>'; }).join('');
  var lines = Array.prototype.slice.call(pre.children);

  var cur = 0, playing = !reduced, visible = false, holdTimer = null, t0 = 0, raf = null, feedLines = [], shown = -1, ptr = -1, typed = -1;
  // wall-clock seconds at time t of the clip
  function wallAt(a, t) {
    var acc = 0;
    for (var i = 0; i < a.segs.length; i++) {
      var s = a.segs[i], len = (hms(s[1]) - hms(s[0])) / s[2];
      if (t <= acc + len || i === a.segs.length - 1) return hms(s[0]) + Math.min(t - acc, len) * s[2];
      acc += len;
    }
  }
  function render() {
    var a = ACTS[cur];
    acts.forEach(function (b, j) { b.setAttribute('aria-current', j === cur ? 'step' : 'false'); b.classList.toggle('done', j < cur); b.querySelector('i').style.width = j < cur ? '100%' : '0%'; });
    capK.textContent = 'Act ' + (cur + 1) + ' of 4 · ' + a.when;
    capH.textContent = a.title;
    capP.textContent = a.text;
    capS.textContent = a.stat;
    tag.textContent = a.when;
    video.loop = !!a.hold;
    var src = 'assets/vid/' + a.vid + '.mp4';
    if (video.getAttribute('src') !== src) { video.poster = 'assets/vid/' + a.vid + '.jpg'; video.src = src; }
    else { try { video.currentTime = 0; } catch (e) { /* not loaded yet */ } }
    pre.hidden = a.mode === 'feed'; feedEl.hidden = a.mode !== 'feed';
    shown = -1; ptr = -1; typed = -1;
    if (a.mode === 'feed') {
      head.textContent = a.head;
      feedEl.innerHTML = a.feed.map(function (l) {
        var t = esc(l[2]);
        if (l[1] === 'edit' && /^[+-] /.test(l[2])) t = '<span class="add">' + t + '</span>';
        return '<span class="fl k-' + l[1] + '"><span class="tm">' + (l[3] ? '' : l[0]) + '</span><span class="kd">' + KIND[l[1]] + '</span><span class="tx">' + t + '</span></span>';
      }).join('');
      feedLines = Array.prototype.slice.call(feedEl.children);
    } else {
      head.textContent = (a.mode === 'type' ? 'Writing ' : 'Running ') + PROG.file + ' (condensed)';
      pre.classList.toggle('typing', a.mode === 'type');
      pre.classList.toggle('focus', a.mode === 'run');
      lines.forEach(function (l) { l.classList.remove('cur', 'on', 'shown'); });
      pre.scrollTop = 0;
    }
    progress(0, 0);
    arm();
  }
  function progress(k, t) {
    bar.style.width = (k * 100) + '%';
    acts[cur].querySelector('i').style.width = (k * 100) + '%';
    var a = ACTS[cur];
    if (a.mode === 'feed') {
      var w = wallAt(a, t || 0), want = -1;
      a.feed.forEach(function (l, j) { if (hms(l[0]) <= w + 0.5) want = j; });
      if (k >= 0.98) want = a.feed.length - 1;
      if (want === shown) return;
      feedLines.forEach(function (l, j) { l.classList.toggle('shown', j <= want); l.classList.toggle('new', j === want); });
      shown = want;
      if (want >= 0) { var last = feedLines[want]; feedEl.scrollTop = Math.max(0, last.offsetTop - feedEl.offsetTop - feedEl.clientHeight + last.offsetHeight + 12); }
    } else if (a.mode === 'type') {
      var n = Math.min(lines.length, Math.ceil(k * 1.15 * lines.length));
      if (n === typed) return;
      lines.forEach(function (l, j) { l.classList.toggle('shown', j < n); });
      typed = n;
      if (n > 0) { var ln = lines[n - 1]; pre.scrollTop = Math.max(0, ln.offsetTop - pre.offsetTop - pre.clientHeight + 40); }
    } else {
      var rt = wallAt(a, t || 0) - hms(a.segs[0][0]), q = 0;
      a.sched.forEach(function (s) { if (s[0] <= rt) q = s[1]; });
      if (q === ptr) return;
      lines.forEach(function (l, j) { l.classList.toggle('on', j <= q); l.classList.toggle('cur', j === q); });
      ptr = q;
      var c = lines[q];
      pre.scrollTo({ top: Math.max(0, c.offsetTop - pre.offsetTop - pre.clientHeight / 2), behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  function tickHold(now) {
    var k = Math.min(1, (now - t0) / ACTS[cur].hold);
    progress(k);
    if (k < 1) raf = requestAnimationFrame(tickHold);
  }
  function arm() {
    clearTimeout(holdTimer); cancelAnimationFrame(raf);
    if (!playing || !visible) { video.pause(); return; }
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    if (ACTS[cur].hold) { t0 = performance.now(); raf = requestAnimationFrame(tickHold); holdTimer = setTimeout(next, ACTS[cur].hold); }
  }
  function next() { go((cur + 1) % ACTS.length); }
  function go(i) { cur = i; render(); }
  video.addEventListener('timeupdate', function () { if (!ACTS[cur].hold && video.duration) progress(video.currentTime / video.duration, video.currentTime); });
  video.addEventListener('ended', function () { if (ACTS[cur].hold) return; progress(1, video.duration); if (playing && visible) holdTimer = setTimeout(next, 900); });
  function sync() { btn.classList.toggle('paused', !playing); btn.setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
  btn.addEventListener('click', function () { playing = !playing; sync(); arm(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== visible) { visible = v; arm(); } }, { threshold: 0.3 }).observe(video);
  } else { visible = true; }
  sync(); render();
})();
