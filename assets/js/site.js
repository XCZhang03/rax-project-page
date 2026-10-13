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

  /* ---------------- media player: a clip or still per item, a step list, autoplay ---------------- */
  // items: {vid, poster, img, compare, tag, kicker, color, title, text, quote, branch, code, chip, meta}
  var ASSET = 'assets/';
  function player(host, items, opts) {
    opts = opts || {};
    var STILL_MS = opts.stillMs || 3200;
    var box = el('div', { class: 'pl card' });
    var media = el('div', { class: 'pl-media' });
    var video = el('video', { muted: '', playsinline: '', preload: 'none', 'aria-label': opts.label || 'Clip' });
    video.muted = true;
    var still = el('div', { class: 'pl-still' });
    var tag = el('span', { class: 'pl-tag' });
    var bar = el('span'); var prog = el('div', { class: 'pl-progress' }, [bar]);
    var btn = el('button', { type: 'button', class: 'pl-btn', 'aria-label': 'Pause' });
    btn.innerHTML = '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    media.appendChild(video); media.appendChild(still); media.appendChild(tag); media.appendChild(prog); media.appendChild(btn);
    var side = el('div', { class: 'pl-side' });
    var now = el('div', { class: 'pl-now', 'aria-live': 'polite' });
    var list = el('ol', { class: 'pl-list' });
    side.appendChild(now); side.appendChild(list);
    box.appendChild(media); box.appendChild(side);
    host.appendChild(box);
    var rows = items.map(function (it, i) {
      var b = el('button', { type: 'button' }, [el('span', { class: 'n', text: String(i + 1) }), el('span', { class: 't', text: it.title }), it.meta ? el('span', { class: 'm', text: it.meta }) : null, el('span', { class: 'f' })]);
      if (it.color) b.style.setProperty('--pc', it.color);
      b.addEventListener('click', function () { show(i, true); });
      var li = el('li', {}, [b]);
      list.appendChild(li);
      return b;
    });
    var cur = 0, playing = !reduced, visible = false, timer = null, t0 = 0, dur = 0, raf = null;
    function stopTimers() { clearTimeout(timer); cancelAnimationFrame(raf); }
    function fill(k) { bar.style.width = (k * 100) + '%'; var f = rows[cur].querySelector('.f'); f.style.width = (k * 100) + '%'; }
    function tickStill(now) { var k = Math.min(1, (now - t0) / dur); fill(k); if (k < 1) raf = requestAnimationFrame(tickStill); }
    function render() {
      var it = items[cur];
      rows.forEach(function (r, j) { r.setAttribute('aria-current', j === cur ? 'step' : 'false'); r.classList.toggle('past', j < cur); r.querySelector('.f').style.width = j < cur ? '100%' : '0%'; });
      now.innerHTML = '';
      var k = el('div', { class: 'k', text: (opts.kicker ? opts.kicker(it, cur, items.length) : (cur + 1) + ' / ' + items.length) });
      if (it.color) k.style.color = it.color;
      now.appendChild(k);
      now.appendChild(el('h3', { text: it.title }));
      if (it.chip) now.appendChild(it.chip());
      if (it.text) now.appendChild(el('p', { text: it.text }));
      if (it.quote) now.appendChild(el('blockquote', { text: '“' + it.quote + '”' }));
      if (it.branch) now.appendChild(el('div', { class: 'branch', text: it.branch }));
      if (it.code) { var c = el('div', { class: 'pl-code', html: it.code }); if (it.codeColor) c.style.setProperty('--skc', it.codeColor); now.appendChild(c); }
      tag.textContent = it.tag || ''; tag.hidden = !it.tag;
      still.innerHTML = '';
      if (it.vid) {
        still.hidden = true; video.hidden = false;
        video.poster = ASSET + it.poster;
        if (video.getAttribute('src') !== ASSET + it.vid) { video.src = ASSET + it.vid; }
        video.currentTime = 0;
      } else {
        video.hidden = true; video.pause(); still.hidden = false;
        if (it.compare) still.appendChild(compare(IMGP + it.compare[0], IMGP + it.compare[1], ['Before', 'After'], true));
        else still.appendChild(el('img', { src: IMGP + it.img, alt: it.title }));
      }
      // warm the next clip
      var nx = items[(cur + 1) % items.length];
      if (nx.vid) { var l = document.createElement('link'); l.rel = 'prefetch'; l.href = ASSET + nx.vid; l.as = 'video'; document.head.appendChild(l); }
      arm();
    }
    function arm() {
      stopTimers(); fill(0);
      var it = items[cur];
      if (!playing || !visible) { if (it.vid) video.pause(); return; }
      if (it.vid) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else { t0 = performance.now(); dur = STILL_MS; raf = requestAnimationFrame(tickStill); timer = setTimeout(next, STILL_MS); }
    }
    function next() { show((cur + 1) % items.length); }
    function show(i, user) { cur = i; render(); if (user) rows[i].focus({ preventScroll: true }); }
    video.addEventListener('timeupdate', function () { if (video.duration) fill(video.currentTime / video.duration); });
    video.addEventListener('ended', function () { fill(1); if (playing && visible) timer = setTimeout(next, 250); });
    function sync() { btn.classList.toggle('paused', !playing); btn.setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
    btn.addEventListener('click', function () { playing = !playing; sync(); arm(); });
    box.addEventListener('keydown', function (e) {
      if (e.target.closest('.compare')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { show((cur + 1) % items.length, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { show((cur - 1 + items.length) % items.length, true); e.preventDefault(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== visible) { visible = v; arm(); } }, { threshold: 0.35 }).observe(media);
    } else { visible = true; }
    sync(); render();
    return { destroy: function () { stopTimers(); video.pause(); video.removeAttribute('src'); video.load(); box.remove(); } };
  }

  /* ---------------- real-robot sessions: one tab per task ---------------- */
  (function () {
    var root = $('#sessRoot');
    if (!root) return;
    var SKV = { chair: '--sk-chair', cups: '--sk-cups', bucket: '--sk-bucket', box: '--sk-box' };
    var PH = ['--ph-1', '--ph-2', '--ph-3', '--ph-4'];
    var STATUS = { success: ['Success', '--new'], fail: ['Failure', '--warn'], fix: ['Fix', '--amber'], explore: ['Exploring', '--rax'] };
    var BASE = 'https://assets.robot-agent-exploration.com/static/tasks/';
    var players = [];
    function chapterItems(id) {
      var S = (D.sessions || {})[id];
      if (!S) return null;
      return S.chapters.map(function (c) {
        var st = STATUS[c.status] || STATUS.explore;
        return { vid: c.vid.replace(/^assets\//, ''), poster: c.poster.replace(/^assets\//, ''), title: c.title, text: c.text, quote: c.quote,
                 meta: c.when, color: 'var(' + st[1] + ')', kickerText: st[0] + (c.when ? ' · ' + c.when : '') };
      });
    }
    function programItems(prog) {
      var keys = Object.keys(prog.phases);
      return prog.steps.map(function (s) {
        var col = 'var(' + PH[keys.indexOf(s.phase) % PH.length] + ')';
        return { vid: s.vid, poster: s.poster, img: s.img, compare: s.compare, tag: s.tag, title: s.title, text: s.text, branch: s.branch,
                 color: col, kickerText: prog.phases[s.phase] };
      });
    }
    function stageItems() {
      return D.rby1.stages.map(function (st, i) {
        var k = st.skills[0], sk = D.skills[k];
        var code = st.code.map(function (line) {
          var h = line.indexOf('#'), b = h >= 0 ? line.slice(0, h) : line, c = h >= 0 ? line.slice(h) : '';
          var m = b.match(/^(\s*)(chair|cups|bucket|box)\.(\w+)(.*)$/);
          var out = m ? esc(m[1]) + '<span class="call">' + m[2] + '.' + m[3] + '</span>' + esc(m[4]) : esc(b);
          return out + (c ? '<span class="c">' + esc(c) + '</span>' : '');
        }).join('\n');
        return { vid: st.vid, poster: st.poster, img: st.img, tag: 'done at ' + st.time, title: st.title, meta: st.time,
                 color: 'var(' + SKV[k] + ')', codeColor: 'var(' + SKV[k] + ')', code: code, kickerText: 'Stage ' + (i + 1) + ' of 6',
                 chip: function () {
                   var d = el('div', { class: 'pl-skill' });
                   d.style.setProperty('--skc', 'var(' + SKV[k] + ')');
                   d.appendChild(el('img', { src: IMGP + sk.img, alt: '', loading: 'lazy' }));
                   d.appendChild(el('div', {}, [el('span', { class: 'small muted', text: 'Calls a skill from an earlier session' }), el('b', { text: sk.name }), el('span', { text: sk.what })]));
                   return d;
                 } };
      });
    }
    var kick = function (it) { return it.kickerText; };
    function render(i) {
      players.forEach(function (p) { p.destroy(); });
      players = [];
      var t = D.sessionTasks[i];
      var body = $('.sess-body', root);
      body.innerHTML = '';
      var head = el('div', { class: 'sess-head' });
      head.appendChild(el('h3', { text: t.name }));
      head.appendChild(el('div', { class: 'task-meta', text: t.meta }));
      head.appendChild(el('p', { class: 'task-desc', text: t.desc }));
      body.appendChild(head);
      var ch = chapterItems(t.key);
      if (ch) {
        body.appendChild(el('h4', { class: 'sess-sub', text: 'The session, chapter by chapter' }));
        var h1 = el('div'); body.appendChild(h1);
        players.push(player(h1, ch, { kicker: kick, label: t.name + ' session' }));
      }
      var items = t.key === 'rby1' ? stageItems() : programItems(D.programs.filter(function (p) { return p.id === t.key; })[0]);
      body.appendChild(el('h4', { class: 'sess-sub', text: t.key === 'rby1' ? 'The final run: six stages from four stored skills' : 'The program it wrote' }));
      if (t.key !== 'rby1') {
        var prog = D.programs.filter(function (p) { return p.id === t.key; })[0];
        body.appendChild(el('p', { class: 'sess-note', text: prog.summary }));
      } else {
        body.appendChild(el('p', { class: 'sess-note', text: 'Four skills learned in earlier practice sessions, two of them used twice; the glue between them the agent wrote on the spot. Side camera, played fast.' }));
      }
      var h2 = el('div'); body.appendChild(h2);
      players.push(player(h2, items, { kicker: kick, label: t.name + ' program' }));
      var det = el('details', { class: 'sess-full' });
      det.appendChild(el('summary', { text: 'Watch the full session video (' + t.length + ')' }));
      var v = el('video', { controls: '', preload: 'none', playsinline: '', poster: BASE + t.video + '_poster.jpg?v=1' });
      det.addEventListener('toggle', function () { if (det.open && !v.getAttribute('src')) v.src = BASE + t.video + '.mp4?v=1'; if (!det.open) v.pause(); });
      det.appendChild(el('div', { class: 'video-wrapper' }, [v]));
      body.appendChild(det);
    }
    seg($('#sessTabs', root), D.sessionTasks.map(function (t) { return t.name; }), render);
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
    var barSvg = $('#benchBars');
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
      drawBars(); drawTable();
    }
    seg($('#benchTabs'), D.benchmarks.map(function (b) { return b.name; }), function (i) { cur = i; render(); });
    onRedraw(root, drawBars);
  })();
})();
