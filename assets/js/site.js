(function () {
  'use strict';
  var D = window.RAX;
  var IMGP = 'assets/img/';
  var SVGNS = 'http://www.w3.org/2000/svg';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function fmt(v) { return v == null ? '–' : v.toFixed(1); }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- tooltip ---------------- */
  var tip = el('div', { class: 'tip', role: 'status' });
  document.body.appendChild(tip);
  function showTip(x, y, node) {
    tip.innerHTML = '';
    tip.appendChild(node);
    tip.classList.add('on');
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = x + 14, top = y + 14;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (top + h > window.innerHeight - 8) top = y - h - 14;
    tip.style.left = Math.max(8, left) + 'px';
    tip.style.top = Math.max(8, top) + 'px';
  }
  function hideTip() { tip.classList.remove('on'); }
  function tipRows(title, rows) {
    var box = el('div');
    box.appendChild(el('div', { class: 't', text: title }));
    rows.forEach(function (r) {
      var n = el('span', { class: 'n' });
      if (r.c) { var i = el('i'); i.style.setProperty('--c', r.c); n.appendChild(i); }
      n.appendChild(document.createTextNode(r.name));
      box.appendChild(el('div', { class: 'r' }, [n, el('b', { text: r.value })]));
    });
    return box;
  }
  function pointTip(target, fn) {
    target.addEventListener('pointermove', function (e) { var n = fn(e); if (n) showTip(e.clientX, e.clientY, n); else hideTip(); });
    target.addEventListener('pointerleave', hideTip);
  }

  /* ---------------- segmented controls ---------------- */
  function seg(container, labels, onPick, initial) {
    container.setAttribute('role', 'tablist');
    var btns = labels.map(function (l, i) {
      var b = el('button', { type: 'button', role: 'tab', 'aria-selected': 'false', text: l });
      b.addEventListener('click', function () { pick(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var j = (i + (e.key === 'ArrowRight' ? 1 : labels.length - 1)) % labels.length;
          pick(j); btns[j].focus();
        }
      });
      container.appendChild(b);
      return b;
    });
    function pick(i) {
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      onPick(i);
    }
    pick(initial || 0);
    return pick;
  }

  /* ---------------- top bar ---------------- */
  (function () {
    var bar = $('.topbar');
    var hero = $('header.hero');
    function onScroll() { bar.classList.toggle('scrolled', window.scrollY > hero.offsetHeight - 60); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    var links = $$('.topbar nav a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (a) { a.classList.remove('on'); });
            map[en.target.id].classList.add('on');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
    var btn = $('.theme-btn');
    function current() {
      var t = document.documentElement.getAttribute('data-theme');
      if (t) return t;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('rax-theme', next); } catch (e) { /* storage unavailable */ }
      window.dispatchEvent(new Event('raxtheme'));
    });
  })();

  /* ---------------- before/after slider ---------------- */
  function compare(beforeSrc, afterSrc, labels, sweep) {
    var c = el('div', { class: 'compare', role: 'slider', tabindex: '0', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '50', 'aria-label': 'Before and after' });
    c.appendChild(el('img', { src: beforeSrc, alt: labels[0], loading: 'lazy' }));
    c.appendChild(el('img', { class: 'after', src: afterSrc, alt: labels[1], loading: 'lazy' }));
    c.appendChild(el('div', { class: 'bar' }));
    c.appendChild(el('span', { class: 'lb l', text: labels[0] }));
    c.appendChild(el('span', { class: 'lb r', text: labels[1] }));
    function setPos(p) { p = Math.max(0, Math.min(100, p)); c.style.setProperty('--pos', p + '%'); c.setAttribute('aria-valuenow', Math.round(p)); }
    function fromEvent(e) { var r = c.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width * 100); }
    var drag = false;
    c.addEventListener('pointerdown', function (e) { drag = true; c.setPointerCapture(e.pointerId); fromEvent(e); });
    c.addEventListener('pointermove', function (e) { if (drag) fromEvent(e); });
    c.addEventListener('pointerup', function () { drag = false; });
    c.addEventListener('keydown', function (e) {
      var v = parseFloat(c.getAttribute('aria-valuenow'));
      if (e.key === 'ArrowLeft') { setPos(v - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPos(v + 5); e.preventDefault(); }
    });
    return c;
  }

  /* ---------------- autoplay helper ---------------- */
  // Advances a sequence on a timer while its root is on screen; a pause button stops it.
  function autoplay(root, ms, next, bar) {
    var state = { playing: !reduced, visible: false, timer: null };
    function arm() {
      clearTimeout(state.timer);
      var b = typeof bar === 'function' ? bar() : bar;
      if (b) { b.style.transition = 'none'; b.style.width = '0%'; }
      if (!state.playing || !state.visible) return;
      if (b) { b.getBoundingClientRect(); b.style.transition = 'width ' + ms + 'ms linear'; b.style.width = '100%'; }
      state.timer = setTimeout(next, ms);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { state.visible = es[0].isIntersecting; arm(); }, { threshold: 0.35 }).observe(root);
    } else { state.visible = true; }
    var btn = el('button', { type: 'button', class: 'auto-btn', 'aria-label': 'Pause' });
    btn.innerHTML = '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    function sync() { btn.classList.toggle('paused', !state.playing); btn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play'); }
    btn.addEventListener('click', function () { state.playing = !state.playing; sync(); arm(); });
    sync();
    state.arm = arm; state.btn = btn;
    return state;
  }

  /* ---------------- program walkthroughs ---------------- */
  (function () {
    var root = $('#progRoot');
    if (!root) return;
    var tabs = $('#progTabs');
    var PH = ['--ph-1', '--ph-2', '--ph-3', '--ph-4'];
    var state = { p: 0, s: 0 };
    var stage = $('.prog-stage', root), side = $('.prog-side', root);
    var pick = null;
    var bar = el('span');
    var auto = autoplay(root, 4800, function () {
      var n = D.programs[state.p].steps.length;
      if (state.s < n - 1) { state.s++; render(); }
      else pick((state.p + 1) % D.programs.length);
    }, bar);
    function render() {
      var prog = D.programs[state.p], st = prog.steps[state.s];
      var phaseKeys = Object.keys(prog.phases);
      var phc = function (k) { return 'var(' + PH[phaseKeys.indexOf(k) % PH.length] + ')'; };
      stage.innerHTML = '';
      if (st.compare) {
        stage.appendChild(compare(IMGP + st.compare[0], IMGP + st.compare[1], ['Before', 'After'], true));
      } else {
        stage.appendChild(el('img', { class: 'main', src: IMGP + st.img, alt: st.title }));
        if (st.inset) stage.appendChild(el('img', { class: 'inset', src: IMGP + st.inset, alt: 'Wrist camera' }));
        if (st.tag) stage.appendChild(el('span', { class: 'tag', text: st.tag }));
      }
      stage.appendChild(el('div', { class: 'prog-progress' }, [bar]));

      side.innerHTML = '';
      side.appendChild(el('p', { class: 'sum', text: prog.summary }));
      var now = el('div', { class: 'prog-now', 'aria-live': 'polite' });
      var k = el('div', { class: 'k', text: 'Step ' + (state.s + 1) + ' of ' + prog.steps.length + ' · ' + prog.phases[st.phase] });
      k.style.color = phc(st.phase);
      now.appendChild(k);
      now.appendChild(el('h3', { text: st.title }));
      now.appendChild(el('p', { text: st.text }));
      if (st.branch) now.appendChild(el('div', { class: 'branch', text: st.branch }));
      side.appendChild(now);
      var flow = el('div', { class: 'flow', role: 'group', 'aria-label': 'Program steps' });
      flow.appendChild(auto.btn);
      prog.steps.forEach(function (s2, i) {
        if (i) flow.appendChild(el('span', { class: 'dash' }));
        var b = el('button', { type: 'button', title: s2.title, 'aria-label': 'Step ' + (i + 1) + ': ' + s2.title });
        b.style.setProperty('--phc', phc(s2.phase));
        if (i === state.s) b.setAttribute('aria-current', 'step');
        if (i < state.s) b.classList.add('past');
        b.appendChild(el('i', { text: String(i + 1) }));
        b.addEventListener('click', function () { state.s = i; render(); var c = $('.flow [aria-current="step"]', root); if (c) c.focus(); });
        flow.appendChild(b);
      });
      side.appendChild(flow);
      var ph = el('div', { class: 'phases' });
      phaseKeys.forEach(function (key) { var s3 = el('span', { text: prog.phases[key] }); s3.style.setProperty('--phc', phc(key)); ph.appendChild(s3); });
      side.appendChild(ph);
      var nx = prog.steps[state.s + 1];
      if (nx && nx.img) { var im = new Image(); im.src = IMGP + nx.img; }
      auto.arm();
    }
    function go(d) {
      var n = D.programs[state.p].steps.length;
      var hadFocus = root.contains(document.activeElement);
      state.s = Math.max(0, Math.min(n - 1, state.s + d));
      render();
      if (hadFocus) { var c = $('.flow [aria-current="step"]', root); if (c) c.focus(); }
    }
    root.addEventListener('keydown', function (e) {
      if (e.target.closest('.compare')) return;
      if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
    });
    pick = seg(tabs, D.programs.map(function (p) { return p.name; }), function (i) { state.p = i; state.s = 0; render(); });
  })();

  /* ---------------- RB-Y1: six stages ---------------- */
  (function () {
    var root = $('#rby1Root');
    if (!root) return;
    var SKV = { chair: '--sk-chair', cups: '--sk-cups', bucket: '--sk-bucket', box: '--sk-box' };
    var film = $('.film', root), body = $('.tl-body', root), note = $('.skill-note', root);
    var stages = D.rby1.stages, cur = 0;
    // which stages call each skill
    var uses = {};
    stages.forEach(function (st, i) { st.skills.forEach(function (k) { (uses[k] = uses[k] || []).push(i + 1); }); });
    note.appendChild(document.createTextNode('Skills from earlier sessions: '));
    Object.keys(D.skills).forEach(function (k, j) {
      var c = el('span', { class: 'chip', text: D.skills[k].name });
      c.style.setProperty('--skc', 'var(' + SKV[k] + ')');
      note.appendChild(c);
      note.appendChild(document.createTextNode(' stage' + (uses[k].length > 1 ? 's ' : ' ') + uses[k].join(' and ') + (j < 3 ? ' · ' : '')));
    });
    var bars = [];
    var cards = stages.map(function (st, i) {
      var b = el('button', { type: 'button', class: 'film-card', 'aria-label': (i + 1) + '. ' + st.title + ', done at ' + st.time });
      b.style.setProperty('--skc', 'var(' + SKV[st.skills[0]] + ')');
      var thumb = el('div', { class: 'film-img' }, [el('img', { src: IMGP + st.img, alt: '', loading: 'lazy' }), el('span', { class: 'film-n', text: String(i + 1) }), el('span', { class: 'film-t', text: st.time })]);
      var bar = el('span');
      bars.push(bar);
      b.appendChild(thumb);
      b.appendChild(el('div', { class: 'film-p' }, [bar]));
      b.appendChild(el('div', { class: 'film-title', text: st.title }));
      b.appendChild(el('div', { class: 'film-skill', text: D.skills[st.skills[0]].name }));
      b.addEventListener('click', function () { show(i); });
      film.appendChild(b);
      return b;
    });
    var auto = autoplay(root, 6000, function () { show((cur + 1) % stages.length); }, function () { return bars[cur]; });
    function show(i) {
      cur = i;
      var st = stages[i], sk = D.skills[st.skills[0]];
      cards.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); b.classList.toggle('past', j < i); });
      bars.forEach(function (b, j) { b.style.transition = 'none'; b.style.width = j < i ? '100%' : '0%'; });
      body.innerHTML = '';
      var ph = el('div', { class: 'tl-photo' }, [el('img', { src: IMGP + st.img, alt: st.title }), el('span', { class: 'tag', text: st.time })]);
      var txt = el('div', { class: 'tl-text' });
      var head = el('div', { class: 'tl-head' }, [el('h3', { text: (i + 1) + '. ' + st.title })]);
      head.appendChild(auto.btn);
      txt.appendChild(head);
      var skc = el('div', { class: 'tl-skill' });
      skc.style.setProperty('--skc', 'var(' + SKV[st.skills[0]] + ')');
      skc.appendChild(el('img', { src: IMGP + sk.img, alt: 'Practice session for ' + sk.name, loading: 'lazy' }));
      skc.appendChild(el('div', {}, [el('div', { class: 'small muted', text: 'Calls a skill learned in an earlier session' }), el('b', { text: sk.name }), el('span', { text: sk.what })]));
      txt.appendChild(skc);
      var code = el('div', { class: 'tl-code' });
      code.style.setProperty('--skc', 'var(' + SKV[st.skills[0]] + ')');
      code.innerHTML = st.code.map(function (line) {
        var h = line.indexOf('#'), b = h >= 0 ? line.slice(0, h) : line, c = h >= 0 ? line.slice(h) : '';
        var m = b.match(/^(\s*)(chair|cups|bucket|box)\.(\w+)(.*)$/);
        var out = m ? esc(m[1]) + '<span class="call">' + m[2] + '.' + m[3] + '</span>' + esc(m[4]) : esc(b);
        return out + (c ? '<span class="c">' + esc(c) + '</span>' : '');
      }).join('\n');
      txt.appendChild(code);
      txt.appendChild(el('div', { class: 'tl-legend', text: 'Condensed from the agent’s commands. In colour: calls into the stored skill; the rest the agent wrote on the spot.' }));
      body.appendChild(ph);
      body.appendChild(txt);
      auto.arm();
    }
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(Math.min(stages.length - 1, cur + 1)); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(Math.max(0, cur - 1)); e.preventDefault(); }
    });
    show(0);
  })();

  /* ---------------- chart helpers ---------------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function width(svg, min) { return Math.max(min, Math.round(svg.getBoundingClientRect().width || svg.parentNode.clientWidth || 640)); }
  // Redraw on theme changes and when the container changes width.
  function onRedraw(target, fn) {
    window.addEventListener('raxtheme', fn);
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fn);
    if ('ResizeObserver' in window) {
      var last = target.clientWidth, timer = null;
      new ResizeObserver(function () {
        if (target.clientWidth === last) return;
        last = target.clientWidth;
        clearTimeout(timer); timer = setTimeout(fn, 120);
      }).observe(target);
    }
  }
  function frame(svg, W, H, m) {
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = '';
    return { x0: m.l, x1: W - m.r, y0: H - m.b, y1: m.t };
  }
  function yAxis(svg, f, ticks, scale, fmtT) {
    var g = sv('g', { class: 'tick' }, svg);
    ticks.forEach(function (t) {
      var y = scale(t);
      sv('line', { x1: f.x0, x2: f.x1, y1: y, y2: y }, g);
      var tx = sv('text', { x: f.x0 - 8, y: y + 4, 'text-anchor': 'end' }, g);
      tx.textContent = fmtT ? fmtT(t) : t;
    });
  }

  /* ---------------- headline scaling chart ---------------- */
  (function () {
    var svg = $('#scalingChart');
    if (!svg) return;
    var S = D.scaling;
    function draw() {
      var W = width(svg, 320), H = clamp(W * 0.42, 250, 340);
      var f = frame(svg, W, H, { l: 44, r: 70, t: 16, b: 40 });
      var n = S.budgets.length;
      var X = function (i) { return f.x0 + 18 + i * (f.x1 - f.x0 - 36) / (n - 1); };
      var Y = function (v) { return f.y0 - v / 100 * (f.y0 - f.y1); };
      yAxis(svg, f, [0, 25, 50, 75, 100], Y);
      S.budgets.forEach(function (b, i) { var t = sv('text', { x: X(i), y: f.y0 + 18, 'text-anchor': 'middle' }, svg); t.textContent = b; });
      var xl = sv('text', { x: (f.x0 + f.x1) / 2, y: H - 4, 'text-anchor': 'middle', class: 'lab' }, svg); xl.textContent = 'Exploration budget (episodes)';
      var rax = cssVar('--rax'), base = cssVar('--base-ink');
      // per-benchmark lines, recessive
      var benchG = sv('g', {}, svg);
      var benchPaths = S.benchmarks.map(function (bm) {
        var d = bm.values.map(function (v, i) { return (i ? 'L' : 'M') + X(i) + ',' + Y(v); }).join('');
        return sv('path', { d: d, fill: 'none', stroke: cssVar('--base'), 'stroke-width': 1.2, opacity: 0.55 }, benchG);
      });
      // prior SOTA
      sv('line', { x1: f.x0, x2: f.x1, y1: Y(S.prior), y2: Y(S.prior), stroke: base, 'stroke-width': 1.5 }, svg);
      var pl = sv('text', { x: f.x1, y: Y(S.prior) + 16, 'text-anchor': 'end' }, svg); pl.textContent = (W < 520 ? 'Prior best, ' : 'Strongest prior models, ') + S.prior.toFixed(1);
      pl.setAttribute('style', 'fill:' + base + ';font-weight:700');
      // RAX area + line
      var area = 'M' + X(0) + ',' + Y(0) + S.mean.map(function (v, i) { return 'L' + X(i) + ',' + Y(v); }).join('') + 'L' + X(n - 1) + ',' + Y(0) + 'Z';
      sv('path', { d: area, fill: rax, opacity: 0.1 }, svg);
      var line = S.mean.map(function (v, i) { return (i ? 'L' : 'M') + X(i) + ',' + Y(v); }).join('');
      var path = sv('path', { d: line, fill: 'none', stroke: rax, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, svg);
      S.mean.forEach(function (v, i) {
        sv('circle', { cx: X(i), cy: Y(v), r: 5, fill: rax, stroke: cssVar('--surface'), 'stroke-width': 2 }, svg);
        var t = sv('text', { x: X(i), y: Y(v) - 11, 'text-anchor': 'middle', class: 'val rax' }, svg); t.textContent = v.toFixed(0);
      });
      var lb = sv('text', { x: X(n - 1) + 12, y: Y(S.mean[n - 1]) + 5, class: 'val rax' }, svg); lb.textContent = 'RAX'; lb.setAttribute('style', 'font-size:13px;font-weight:800');
      // draw-in once
      if (!reduced && !svg.dataset.drawn) {
        var L = path.getTotalLength();
        path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
        path.getBoundingClientRect();
        path.style.transition = 'stroke-dashoffset 1.1s ease-out';
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { path.style.strokeDashoffset = 0; io.disconnect(); } }, { threshold: 0.4 });
        io.observe(svg);
        svg.dataset.drawn = '1';
      }
      // hover columns
      var cross = sv('line', { y1: f.y1, y2: f.y0, stroke: cssVar('--ink-2'), 'stroke-width': 1, opacity: 0 }, svg);
      var hit = sv('rect', { x: f.x0, y: f.y1, width: f.x1 - f.x0, height: f.y0 - f.y1, fill: 'transparent' }, svg);
      pointTip(hit, function (e) {
        var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W;
        var i = Math.max(0, Math.min(n - 1, Math.round((px - X(0)) / ((X(n - 1) - X(0)) / (n - 1)))));
        cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); cross.setAttribute('opacity', 0.5);
        benchPaths.forEach(function (p) { p.setAttribute('opacity', 0.9); });
        var rows = [{ name: 'RAX, mean', value: S.mean[i].toFixed(1), c: rax }];
        S.benchmarks.forEach(function (bm) { rows.push({ name: bm.name, value: bm.values[i].toFixed(1) }); });
        return tipRows(S.budgets[i] + ' exploration episodes', rows);
      });
      hit.addEventListener('pointerleave', function () { cross.setAttribute('opacity', 0); benchPaths.forEach(function (p) { p.setAttribute('opacity', 0.55); }); });
    }
    draw();
    onRedraw(svg, draw);
  })();

  /* ---------------- benchmark explorer ---------------- */
  (function () {
    var root = $('#benchRoot');
    if (!root) return;
    var cur = 0;
    var barSvg = $('#benchBars'), curveSvg = $('#benchCurves'), curveCard = $('#benchCurveCard');
    function bestBaseline(bm, t) {
      var best = null;
      bm.baselines.forEach(function (b) { var v = b[1][t]; if (v != null && (!best || v > best.v)) best = { name: b[0], v: v }; });
      return best;
    }
    function bestAvg(bm) {
      var best = null;
      bm.baselines.forEach(function (b) { if (b[2] != null && !b[3] && (!best || b[2] > best.v)) best = { name: b[0], v: b[2] }; });
      return best;
    }
    function drawBars() {
      var bm = D.benchmarks[cur];
      var groups = bm.tasks.map(function (t, i) { return { label: t, rax: bm.rax[i], best: bestBaseline(bm, i), idx: i }; });
      groups.push({ label: 'Average', rax: bm.raxAvg, best: bestAvg(bm), idx: -1 });
      var W = Math.max(560, width(barSvg, 560)), H = 300;
      var f = frame(barSvg, W, H, { l: 40, r: 10, t: 22, b: 56 });
      var gw = (f.x1 - f.x0) / groups.length, bw = Math.min(22, gw * 0.3);
      var Y = function (v) { return f.y0 - v / 100 * (f.y0 - f.y1); };
      yAxis(barSvg, f, [0, 25, 50, 75, 100], Y);
      var rax = cssVar('--rax'), base = cssVar('--base');
      groups.forEach(function (g, i) {
        var cx = f.x0 + gw * (i + 0.5) + (g.idx < 0 ? 0 : 0);
        if (g.idx < 0) sv('line', { x1: f.x0 + gw * i, x2: f.x0 + gw * i, y1: f.y1, y2: f.y0 + 4, stroke: cssVar('--line') }, barSvg);
        var bars = [[g.best ? g.best.v : null, base, cx - bw - 1], [g.rax, rax, cx + 1]];
        bars.forEach(function (b) {
          if (b[0] == null) return;
          var h = Math.max(1, f.y0 - Y(b[0]));
          var r = sv('path', { d: roundTop(b[2], f.y0 - h, bw, h, 3), fill: b[1] }, barSvg);
          r.style.transformOrigin = 'center bottom';
          var tx = sv('text', { x: b[2] + bw / 2, y: f.y0 - h - 5, 'text-anchor': 'middle', class: b[1] === rax ? 'val rax' : 'val' }, barSvg);
          tx.textContent = b[0] >= 99.95 ? '100' : b[0].toFixed(b[0] % 1 ? 1 : 0);
          tx.setAttribute('style', 'font-size:10px' + (b[1] === rax ? '' : ';fill:' + cssVar('--base-ink')));
        });
        var words = g.label.split(' ');
        var lines = [];
        words.forEach(function (w) { var last = lines[lines.length - 1]; if (last && (last + ' ' + w).length <= 10) lines[lines.length - 1] = last + ' ' + w; else lines.push(w); });
        lines.forEach(function (l, k) {
          var t = sv('text', { x: cx, y: f.y0 + 16 + k * 13, 'text-anchor': 'middle', class: 'lab' }, barSvg);
          t.textContent = l;
          if (g.idx < 0) t.setAttribute('style', 'font-weight:800');
        });
        var hit = sv('rect', { x: f.x0 + gw * i, y: f.y1 - 10, width: gw, height: f.y0 - f.y1 + 10, fill: 'transparent' }, barSvg);
        pointTip(hit, function () {
          var rows = [{ name: 'RAX', value: fmt(g.rax), c: rax }];
          var list = bm.baselines.map(function (b) { return { name: b[0], v: g.idx < 0 ? b[2] : b[1][g.idx], mark: g.idx < 0 ? b[3] : '' }; })
            .filter(function (b) { return b.v != null; }).sort(function (a, b) { return b.v - a.v; });
          list.forEach(function (b) { rows.push({ name: b.name + (b.mark || ''), value: fmt(b.v) }); });
          return tipRows(g.label, rows);
        });
      });
    }
    function roundTop(x, y, w, h, r) {
      r = Math.min(r, h, w / 2);
      return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
    }
    function drawCurves() {
      var bm = D.benchmarks[cur];
      if (!bm.curves) { curveCard.hidden = true; return; }
      curveCard.hidden = false;
      var C = bm.curves, n = C.budgets.length;
      var W = width(curveSvg, 320), H = 290;
      var f = frame(curveSvg, W, H, { l: 40, r: 120, t: 14, b: 40 });
      var X = function (i) { return f.x0 + 14 + i * (f.x1 - f.x0 - 28) / (n - 1); };
      var Y = function (v) { return f.y0 - v / 100 * (f.y0 - f.y1); };
      yAxis(curveSvg, f, [0, 25, 50, 75, 100], Y);
      C.budgets.forEach(function (b, i) { var t = sv('text', { x: X(i), y: f.y0 + 18, 'text-anchor': 'middle' }, curveSvg); t.textContent = b; });
      var xl = sv('text', { x: (f.x0 + f.x1) / 2, y: H - 4, 'text-anchor': 'middle', class: 'lab' }, curveSvg); xl.textContent = 'Exploration budget (episodes)';
      var rax = cssVar('--rax'), base = cssVar('--base'), ink2 = cssVar('--ink-2');
      var paths = C.tasks.map(function (vals, ti) {
        var d = '', pen = false;
        vals.forEach(function (v, i) { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i) + ',' + Y(v); pen = true; });
        var p = sv('path', { d: d, fill: 'none', stroke: base, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, curveSvg);
        var dots = vals.map(function (v, i) { return v == null ? null : sv('circle', { cx: X(i), cy: Y(v), r: 2.6, fill: base }, curveSvg); });
        return { p: p, dots: dots };
      });
      var label = sv('text', { x: f.x1 + 8, y: 0, class: 'lab' }, curveSvg);
      label.setAttribute('style', 'font-weight:800;fill:' + ink2);
      if (C.avg) {
        var d = '', pen = false;
        C.avg.forEach(function (v, i) { if (v == null) return; d += (pen ? 'L' : 'M') + X(i) + ',' + Y(v); pen = true; });
        sv('path', { d: d, fill: 'none', stroke: rax, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, curveSvg);
        var lastI = C.avg.reduce(function (a, v, i) { return v == null ? a : i; }, 0);
        C.avg.forEach(function (v, i) { if (v != null) sv('circle', { cx: X(i), cy: Y(v), r: 4, fill: rax, stroke: cssVar('--surface'), 'stroke-width': 1.5 }, curveSvg); });
        var al = sv('text', { x: X(lastI) + 8, y: Y(C.avg[lastI]) + 4, class: 'val rax' }, curveSvg); al.textContent = 'Average ' + C.avg[lastI].toFixed(1);
      }
      function focus(ti) {
        paths.forEach(function (o, j) {
          var on = j === ti;
          o.p.setAttribute('stroke', on ? ink2 : base); o.p.setAttribute('stroke-width', on ? 2.4 : 1.4);
          o.p.setAttribute('opacity', ti == null || on ? 1 : 0.45);
          o.dots.forEach(function (c) { if (c) { c.setAttribute('fill', on ? ink2 : base); c.setAttribute('r', on ? 3.6 : 2.6); } });
        });
        if (ti == null) { label.textContent = ''; return; }
        var vals = C.tasks[ti], li = vals.reduce(function (a, v, i) { return v == null ? a : i; }, 0);
        label.textContent = bm.tasks[ti];
        label.setAttribute('x', X(li) + 8); label.setAttribute('y', Y(vals[li]) + 4);
        paths[ti].p.parentNode.appendChild(paths[ti].p);
      }
      var hit = sv('rect', { x: f.x0, y: f.y1, width: f.x1 - f.x0, height: f.y0 - f.y1, fill: 'transparent' }, curveSvg);
      pointTip(hit, function (e) {
        var r = curveSvg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
        var best = null;
        C.tasks.forEach(function (vals, ti) {
          vals.forEach(function (v, i) {
            if (v == null) return;
            var dd = Math.hypot(X(i) - px, Y(v) - py);
            if (!best || dd < best.d) best = { d: dd, ti: ti, i: i };
          });
        });
        if (!best || best.d > 60) { focus(null); return null; }
        focus(best.ti);
        var rows = C.budgets.map(function (b, i) { return { name: b + ' episodes', value: fmt(C.tasks[best.ti][i]) }; }).filter(function (r) { return r.value !== '–'; });
        return tipRows(bm.tasks[best.ti], rows);
      });
      hit.addEventListener('pointerleave', function () { focus(null); });
    }
    function drawTable() {
      var bm = D.benchmarks[cur];
      var wrap = $('#benchTable');
      var t = el('table', { class: 'tbl' });
      var head = el('tr', {}, [el('th', { text: 'Method' })].concat(bm.tasks.map(function (x) { return el('th', { text: x }); })).concat([el('th', { text: 'Avg.' })]));
      t.appendChild(el('thead', {}, [head]));
      var tb = el('tbody');
      var cols = bm.tasks.length;
      var maxes = [];
      for (var c = 0; c < cols; c++) {
        var vals = bm.baselines.map(function (b) { return b[1][c]; }).concat([bm.rax[c]]).filter(function (v) { return v != null; });
        maxes.push(Math.max.apply(null, vals));
      }
      bm.baselines.forEach(function (b) {
        var tr = el('tr', {}, [el('td', { text: b[0] })]);
        b[1].forEach(function (v, i) { tr.appendChild(el('td', { text: fmt(v), class: v != null && v === maxes[i] ? 'best' : '' })); });
        tr.appendChild(el('td', { text: b[2] == null ? '–' : b[2].toFixed(1) + (b[3] || '') }));
        tb.appendChild(tr);
      });
      var tr = el('tr', { class: 'rax' }, [el('td', { text: 'RAX' })]);
      bm.rax.forEach(function (v) { tr.appendChild(el('td', { text: fmt(v) })); });
      tr.appendChild(el('td', { text: bm.raxAvg.toFixed(1) }));
      tb.appendChild(tr);
      t.appendChild(tb);
      wrap.innerHTML = '';
      wrap.appendChild(t);
      var notes = [bm.raxNote, bm.avgNote].filter(Boolean).join(' ');
      $('#benchNote').textContent = notes;
    }
    function render() {
      var bm = D.benchmarks[cur];
      $('#benchSetting').textContent = bm.setting;
      $('#benchMetric').textContent = bm.metric;
      drawBars(); drawCurves(); drawTable();
    }
    seg($('#benchTabs'), D.benchmarks.map(function (b) { return b.name; }), function (i) { cur = i; render(); });
    onRedraw(root, function () { drawBars(); drawCurves(); });
  })();

  /* ---------------- agent to code: inference time ---------------- */
  (function () {
    var svg = $('#timeChart');
    if (!svg) return;
    var series = [
      { key: 'car', name: 'Loading the car (BEHAVIOR-1K)', v: '--rax' },
      { key: 'toast', name: 'Make toast random (RoboDojo)', v: '--sk-bucket' }
    ];
    function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
    function draw() {
      var W = width(svg, 320), H = clamp(W * 0.62, 250, 330);
      var f = frame(svg, W, H, { l: 52, r: 14, t: 12, b: 40 });
      var X = function (e) { return f.x0 + (e / 130) * (f.x1 - f.x0); };
      var lo = Math.log2(1 / 32), hi = Math.log2(256);
      var Y = function (m) { return f.y0 - (Math.log2(Math.max(m, 1 / 32)) - lo) / (hi - lo) * (f.y0 - f.y1); };
      var ticks = [[1 / 30, '2 s'], [0.25, '15 s'], [1, '1 min'], [4, '4 min'], [16, '16 min'], [60, '1 h'], [240, '4 h']];
      var lab = {}; ticks.forEach(function (t) { lab[t[0]] = t[1]; });
      yAxis(svg, f, ticks.map(function (t) { return t[0]; }), Y, function (t) { return lab[t]; });
      [0, 32, 64, 96, 128].forEach(function (e) { var t = sv('text', { x: X(e), y: f.y0 + 18, 'text-anchor': 'middle' }, svg); t.textContent = e; });
      var xl = sv('text', { x: (f.x0 + f.x1) / 2, y: H - 4, 'text-anchor': 'middle', class: 'lab' }, svg); xl.textContent = 'Exploration episode';
      var pts = [];
      series.forEach(function (s) {
        var c = cssVar(s.v), data = D.agentTime[s.key];
        if (data.length > 20) {
          var sm = data.map(function (p, i) { return median(data.slice(Math.max(0, i - 2), i + 3).map(function (q) { return q[1]; })); });
          sv('path', { d: data.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]) + ',' + Y(sm[i]); }).join(''), fill: 'none', stroke: c, 'stroke-width': 2.2 }, svg);
        } else {
          sv('path', { d: data.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]) + ',' + Y(p[1]); }).join(''), fill: 'none', stroke: c, 'stroke-width': 1.4 }, svg);
        }
        data.forEach(function (p) {
          var alone = p[3] === 1;
          sv('circle', { cx: X(p[0]), cy: Y(p[1]), r: alone ? 3.6 : 3, fill: alone ? cssVar('--surface') : c, stroke: alone ? c : cssVar('--surface'), 'stroke-width': alone ? 1.6 : 0.8, opacity: data.length > 20 ? 0.55 : 1 }, svg);
          pts.push({ s: s, p: p, x: X(p[0]), y: Y(p[1]), c: c });
        });
      });
      var ring = sv('circle', { r: 7, fill: 'none', stroke: cssVar('--ink'), 'stroke-width': 1.5, opacity: 0 }, svg);
      var hit = sv('rect', { x: f.x0, y: f.y1, width: f.x1 - f.x0, height: f.y0 - f.y1, fill: 'transparent' }, svg);
      pointTip(hit, function (e) {
        var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
        var best = null;
        pts.forEach(function (q) { var d = Math.hypot(q.x - px, q.y - py); if (!best || d < best.d) best = { d: d, q: q }; });
        if (!best || best.d > 40) { ring.setAttribute('opacity', 0); return null; }
        var q = best.q;
        ring.setAttribute('cx', q.x); ring.setAttribute('cy', q.y); ring.setAttribute('opacity', 0.8);
        var m = q.p[1];
        var time = m < 1 ? (m * 60).toFixed(1) + ' s' : m.toFixed(1) + ' min';
        return tipRows(q.s.name, [
          { name: 'Episode', value: String(q.p[0]) },
          { name: 'Inference time', value: time, c: q.c },
          { name: 'Output tokens', value: q.p[2] ? q.p[2].toFixed(1) + 'k' : '0' },
          { name: 'Actions from', value: q.p[3] ? 'program alone' : 'agent and program' }
        ]);
      });
      hit.addEventListener('pointerleave', function () { ring.setAttribute('opacity', 0); });
    }
    draw();
    onRedraw(svg, draw);
  })();

  /* ---------------- agent to code: replay on the real Franka ---------------- */
  (function () {
    var root = $('#race');
    if (!root) return;
    var rows = [];
    function hms(s) {
      if (s < 60) return s.toFixed(0) + ' s';
      var m = Math.floor(s / 60), r = Math.round(s % 60);
      return m + ' min ' + (r < 10 ? '0' : '') + r + ' s';
    }
    D.realSpeed.forEach(function (t) {
      var box = el('div', { class: 'race-row' });
      box.appendChild(el('h4', { text: t.task }));
      [['Agent', t.agent, '--base-ink'], ['Program', t.program, '--rax']].forEach(function (k) {
        var bar = el('span'); bar.style.setProperty('--c', 'var(' + k[2] + ')');
        var tt = el('span', { class: 't', text: '0 s' });
        box.appendChild(el('div', { class: 'race-line' }, [el('span', { class: 'who', text: k[0] }), el('div', { class: 'race-bar' }, [bar]), tt]));
        rows.push({ total: k[1].inference, max: t.agent.inference, bar: bar, t: tt });
      });
      var sp = Math.round(t.agent.inference / t.program.inference);
      box.appendChild(el('div', { class: 'speedup', html: 'Inference <b>' + sp + '× faster</b>; output tokens ' + t.agent.tokens.toFixed(1) + 'k → ' + t.program.tokens.toFixed(1) + 'k. Robot time: ' + hms(t.agent.robot) + ' and ' + hms(t.program.robot) + '.' }));
      root.insertBefore(box, $('.race-foot', root));
    });
    var btn = $('#raceBtn'), clock = $('#raceClock');
    var SPEED = 360;  // simulated seconds per real second
    var raf = null;
    function setAt(sim) {
      rows.forEach(function (r) {
        var v = Math.min(sim, r.total);
        r.bar.style.width = (v / r.max * 100) + '%';
        r.t.textContent = hms(v);
      });
      clock.textContent = 'Wall clock ' + hms(sim) + ' · played at ' + SPEED + '×';
    }
    function finish() { rows.forEach(function (r) { r.bar.style.width = (r.total / r.max * 100) + '%'; r.t.textContent = hms(r.total); }); }
    btn.addEventListener('click', function () {
      if (raf) cancelAnimationFrame(raf);
      if (reduced) { finish(); return; }
      var end = Math.max.apply(null, rows.map(function (r) { return r.total; }));
      var t0 = performance.now();
      (function step(now) {
        var sim = (now - t0) / 1000 * SPEED;
        setAt(Math.min(sim, end));
        if (sim < end) raf = requestAnimationFrame(step); else raf = null;
      })(t0);
    });
    finish();
    clock.textContent = 'Replay both at ' + SPEED + '× speed';
  })();

  /* ---------------- incidents ---------------- */
  (function () {
    var root = $('#incRoot');
    if (!root) return;
    var holder = $('.inc-list', root);
    function render(i) {
      var inc = D.incidents[i];
      holder.innerHTML = '';
      var card = el('div', { class: 'inc card' });
      var left = el('div');
      left.appendChild(el('div', { class: 'k bad', text: 'Incident · ' + inc.robot }));
      left.appendChild(el('h4', { text: inc.title }));
      var frames = el('div', { class: 'frames' });
      frames.style.setProperty('--n', inc.frames.length);
      inc.frames.forEach(function (fr, j) {
        var fig = el('figure', { class: /contact/.test(fr[1]) ? 'hit' : '' }, [el('img', { src: IMGP + fr[0], alt: fr[1], loading: 'lazy' }), el('figcaption', { text: fr[1] })]);
        frames.appendChild(fig);
      });
      left.appendChild(frames);
      left.appendChild(el('p', { text: inc.what }));
      var arrow = el('div', { class: 'arrow', html: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' });
      var right = el('div', { class: 'rule' });
      right.appendChild(el('div', { class: 'k good', text: 'Rule it kept' }));
      right.appendChild(el('h4', { text: inc.rule }));
      right.appendChild(el('img', { src: IMGP + inc.ruleImg, alt: inc.rule, loading: 'lazy' }));
      card.appendChild(left); card.appendChild(arrow); card.appendChild(right);
      holder.appendChild(card);
    }
    seg($('.inc-tabs', root), D.incidents.map(function (x) { return x.title; }), render);
  })();

  /* ---------------- requests to the operator ---------------- */
  (function () {
    var root = $('#chatRoot');
    if (!root) return;
    D.requests.forEach(function (r) {
      var card = el('div', { class: 'req card' });
      card.appendChild(el('div', { class: 'task', text: r.task }));
      var b = el('div', { class: 'bubble' });
      b.appendChild(el('div', { class: 'who' }, [document.createTextNode('Agent to operator'), el('span', { text: r.time })]));
      b.appendChild(document.createTextNode(r.msg));
      card.appendChild(b);
      card.appendChild(el('div', { class: 'ba' }, [compare(IMGP + r.before[0], IMGP + r.after[0], [r.before[1], r.after[1]])]));
      root.appendChild(card);
    });
  })();

  /* ---------------- adapting programs ---------------- */
  (function () {
    var root = $('#adaptRoot');
    if (!root) return;
    var holder = $('.adapt-holder', root);
    function render(i) {
      var a = D.adapt[i];
      holder.innerHTML = '';
      var card = el('div', { class: 'adapt card' });
      var l = el('div', { class: 'adapt-l' });
      var imgs = el('div', { class: 'adapt-imgs' });
      a.images.forEach(function (im) {
        imgs.appendChild(el('figure', {}, [el('img', { src: IMGP + im[0], alt: im[1], loading: 'lazy' }), el('figcaption', { class: im[2] ? 'chg' : '', text: im[1] })]));
      });
      l.appendChild(imgs);
      l.appendChild(el('div', { class: 'quote' }, [el('b', { text: 'Operator: ' }), document.createTextNode('“' + a.operator + '”')]));
      l.appendChild(el('p', { class: 'small', text: a.story }));
      var r = el('div', { class: 'adapt-r' });
      r.appendChild(el('div', { class: 't', text: a.title }));
      var diff = el('div', { class: 'diff' });
      a.lines.forEach(function (ln) {
        var kind = ln[1] || (/^\s*#/.test(ln[0]) ? 'c' : '');
        var row = el('div', { class: kind }, [el('span', { class: 'm', text: ln[1] === 'new' ? '+' : ln[1] === 'mod' ? '~' : '' }), el('span', { class: 'code', text: ln[0] }), el('span', { class: 'note', text: ln[2] })]);
        diff.appendChild(row);
      });
      r.appendChild(diff);
      r.appendChild(el('div', { class: 'diff-key', html: '<span class="n">+ new</span><span class="md">~ modified</span><span class="r">reused unchanged</span>' }));
      card.appendChild(l); card.appendChild(r);
      holder.appendChild(card);
    }
    seg($('.adapt-tabs', root), D.adapt.map(function (x) { return x.name; }), render);
  })();
})();
