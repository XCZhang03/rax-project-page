// Interactive case cards (session chapters, program steps, RB-Y1 run, BEHAVIOR-1K boxing).
// Adapted from Bohan Lyu's interactive-results branch: his nav, theme switch and charts are left out;
// this page has its own.
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

  /* ---------------- lightbox for program views ---------------- */
  var lb = null;
  function lightbox(src, cap) {
    if (!lb) {
      lb = el('div', { class: 'lb', role: 'dialog', 'aria-modal': 'true', tabindex: '-1' });
      lb.appendChild(el('figure', {}, [el('img', { alt: '' }), el('figcaption')]));
      lb.addEventListener('click', function () { lb.classList.remove('on'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });
      document.body.appendChild(lb);
    }
    lb.querySelector('img').src = src; lb.querySelector('img').alt = cap;
    lb.querySelector('figcaption').textContent = cap;
    lb.classList.add('on'); lb.focus();
  }

  /* ---------------- case card: one player for the session chapters and the program steps ---------------- */
  // groups: [{name, items:[{vid, poster, img, compare, tag, title, text, quote, branch, kicker, color, meta, chip, code:[line idx]}]}]
  // code: {file, lines:[{t, s:[step idx]}]} shown under the player; lines of the current program step are highlighted.
  var ASSET = 'assets/';
  var PLAY_SVG = '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  function hlPy(code) {
    var hash = code.indexOf('#');
    var body = hash >= 0 ? code.slice(0, hash) : code, com = hash >= 0 ? code.slice(hash) : '';
    var h = esc(body)
      .replace(/\b(def|for|in|if|elif|else|while|return|not|is|None|or|and|try|except|raise|break|continue|True|False|with|as|lambda)\b/g, '<span class="kw">$1</span>')
      .replace(/(raise \w+\([^)]*\)|return False|StepFailure|Unsure)/g, '<span class="err">$1</span>');
    return h + (com ? '<span class="c">' + esc(com) + '</span>' : '');
  }
  function caseCard(host, groups, code, opts) {
    opts = opts || {};
    var STILL_MS = 3200;
    var items = [];
    groups.forEach(function (g, gi) { g.items.forEach(function (it, k) { it.g = gi; it.k = k; items.push(it); }); });
    var box = el('div', { class: 'cc card' });
    var media = el('div', { class: 'pl-media' });
    var video = el('video', { muted: '', playsinline: '', preload: 'none' });
    video.muted = true;
    var still = el('div', { class: 'pl-still' });
    var tag = el('span', { class: 'pl-tag' });
    var bar = el('span'); var prog = el('div', { class: 'pl-progress' }, [bar]);
    var btn = el('button', { type: 'button', class: 'pl-btn', 'aria-label': 'Pause', html: PLAY_SVG });
    [video, still, tag, prog, btn].forEach(function (n) { media.appendChild(n); });
    var side = el('div', { class: 'cc-side' });
    var now = el('div', { class: 'pl-now', 'aria-live': 'polite' });
    var nav = el('div', { class: 'cc-nav' });
    side.appendChild(now); side.appendChild(nav);
    var left = el('div', { class: 'cc-left' }, [media]);
    box.appendChild(left); box.appendChild(side);
    var dots = [];
    groups.forEach(function (g, gi) {
      var row = el('div', { class: 'cc-row' }, [el('span', { class: 'cc-g', text: g.name })]);
      var d = el('div', { class: 'cc-dots' });
      g.items.forEach(function (it) {
        var i = items.indexOf(it);
        var b = el('button', { type: 'button', title: it.title, 'aria-label': g.name + ' ' + (it.k + 1) + ': ' + it.title }, [el('i', { text: String(it.k + 1) })]);
        b.style.setProperty('--pc', it.color || 'var(--rax)');
        b.addEventListener('click', function () { show(i, true); });
        d.appendChild(b); dots[i] = b;
      });
      row.appendChild(d); nav.appendChild(row);
    });
    var codeBody = null, codeHead = null, codeLines = [], feedBody = null, feedLines = [], mode = 'program', shown = -1, hl = [], ptr = -1;
    var KIND = { call: 'robot', run: 'shell', edit: 'edit', say: 'agent', operator: 'operator', log: 'output' };
    if (code) {
      var cb = el('div', { class: 'cc-code' });
      codeHead = el('div', { class: 'cc-code-head' });
      codeBody = el('pre', { class: 'cc-pre' });
      codeBody.innerHTML = code.lines.map(function (l) {
        var m = code.skills && l.t.match(/^(\s*)(chair|cups|bucket|box)\.(\w+)(.*)$/);
        var h = m ? esc(m[1]) + '<span class="call" style="color:var(' + code.skills[m[2]] + ')">' + m[2] + '.' + m[3] + '</span>' + hlPy(m[4]) : hlPy(l.t);
        return '<span class="ln">' + (h || ' ') + '</span>';
      }).join('');
      codeLines = Array.prototype.slice.call(codeBody.children);
      feedBody = el('div', { class: 'cc-feed', hidden: '' });
      cb.appendChild(codeHead); cb.appendChild(codeBody); cb.appendChild(feedBody);
      box.appendChild(cb);
    }
    // the activity feed reveals its lines as the clip plays; in a program step a pointer walks its lines
    function codeProgress(k) {
      if (!codeBody) return;
      if (mode === 'feed') {
        var n = feedLines.length, want = Math.min(n - 1, Math.floor(k * n * 1.05));
        if (want < 0) want = 0;
        if (want === shown) return;
        feedLines.forEach(function (l, j) { l.classList.toggle('shown', j <= want); l.classList.toggle('new', j === want); });
        shown = want;
        var last = feedLines[want];
        feedBody.scrollTop = Math.max(0, last.offsetTop - feedBody.offsetTop - feedBody.clientHeight + last.offsetHeight + 12);
      } else if (hl.length) {
        var q = Math.min(hl.length - 1, Math.floor(k * hl.length));
        if (q === ptr) return;
        if (ptr >= 0) codeLines[hl[ptr]].classList.remove('cur');
        codeLines[hl[q]].classList.add('cur');
        ptr = q;
      }
    }
    host.appendChild(box);
    var cur = 0, playing = !reduced, visible = false, timer = null, t0 = 0, raf = null;
    function stop() { clearTimeout(timer); cancelAnimationFrame(raf); }
    function fill(k) { bar.style.width = (k * 100) + '%'; codeProgress(k); }
    function tickStill(t) { var k = Math.min(1, (t - t0) / STILL_MS); fill(k); if (k < 1) raf = requestAnimationFrame(tickStill); }
    function render() {
      var it = items[cur], g = groups[it.g];
      dots.forEach(function (b, j) { b.setAttribute('aria-current', j === cur ? 'step' : 'false'); b.classList.toggle('past', j < cur); });
      now.innerHTML = '';
      var k = el('div', { class: 'k', text: g.name + ' ' + (it.k + 1) + '/' + g.items.length + (it.kicker ? ' · ' + it.kicker : '') });
      k.style.color = it.color || 'var(--rax)';
      now.appendChild(k);
      now.appendChild(el('h3', { text: it.title }));
      if (it.chip) now.appendChild(it.chip());
      if (it.text) now.appendChild(el('p', { text: it.text }));
      if (it.quote) now.appendChild(el('blockquote', { text: '“' + it.quote + '”' }));
      if (it.branch) now.appendChild(el('div', { class: 'branch', text: it.branch }));
      if (it.viz) {
        var vz = el('div', { class: 'cc-viz' + (it.viz.length > 1 ? ' two' : '') });
        vz.appendChild(el('div', { class: 'cc-viz-k', text: 'Computed by its program' }));
        var row = el('div', { class: 'cc-viz-row' });
        it.viz.forEach(function (v) {
          var b = el('button', { type: 'button', class: 'cc-viz-img', 'aria-label': 'Enlarge: ' + v.cap }, [el('img', { src: IMGP + v.img, alt: v.cap, loading: 'lazy' })]);
          b.addEventListener('click', function () { lightbox(IMGP + v.img, v.cap); });
          row.appendChild(b);
        });
        vz.appendChild(row);
        vz.appendChild(el('p', { class: 'cc-viz-cap', text: it.viz.map(function (v) { return v.cap; }).join(' ') }));
        now.appendChild(vz);
      }
      tag.textContent = it.tag || ''; tag.hidden = !it.tag;
      still.innerHTML = '';
      if (it.vid) {
        still.hidden = true; video.hidden = false;
        video.poster = ASSET + it.poster;
        if (video.getAttribute('src') !== ASSET + it.vid) video.src = ASSET + it.vid;
        try { video.currentTime = 0; } catch (e) { /* not loaded yet */ }
      } else {
        video.hidden = true; video.pause(); still.hidden = false;
        if (it.compare) still.appendChild(compare(IMGP + it.compare[0], IMGP + it.compare[1], ['Before', 'After'], true));
        else still.appendChild(el('img', { src: IMGP + it.img, alt: it.title }));
      }
      if (codeBody) {
        mode = it.feed ? 'feed' : 'program';
        codeBody.hidden = mode !== 'program'; feedBody.hidden = mode !== 'feed';
        if (mode === 'feed') {
          codeHead.textContent = 'What the agent was doing, ' + it.feed.span;
          feedBody.innerHTML = it.feed.lines.map(function (l) {
            var kd = l.kind || 'call';
            var txt = esc(l.text);
            if (kd === 'edit' && /^[+-] /.test(l.text)) txt = '<span class="' + (l.text[0] === '+' ? 'add' : 'del') + '">' + txt + '</span>';
            return '<span class="fl k-' + kd + '"><span class="tm">' + esc(l.time || '') + '</span><span class="kd">' + KIND[kd] + '</span><span class="tx">' + txt + '</span></span>';
          }).join('');
          feedLines = Array.prototype.slice.call(feedBody.children);
          shown = -1;
        } else {
          hl = it.code || []; ptr = -1;
          codeHead.textContent = 'Running: ' + code.file;
          codeBody.classList.toggle('focus', hl.length > 0);
          codeLines.forEach(function (ln, j) { ln.classList.toggle('on', hl.indexOf(j) >= 0); ln.classList.remove('cur'); });
          if (hl.length) {
            var first = codeLines[hl[0]];
            codeBody.scrollTo({ top: Math.max(0, first.offsetTop - codeBody.offsetTop - 30), behavior: reduced ? 'auto' : 'smooth' });
          }
        }
        codeProgress(0);
      }
      var nx = items[(cur + 1) % items.length];
      if (nx.vid && !nx.warm) { nx.warm = true; var l = document.createElement('link'); l.rel = 'prefetch'; l.href = ASSET + nx.vid; document.head.appendChild(l); }
      arm();
    }
    function arm() {
      stop(); fill(0);
      var it = items[cur];
      if (!playing || !visible) { video.pause(); return; }
      if (it.vid) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else { t0 = performance.now(); raf = requestAnimationFrame(tickStill); timer = setTimeout(next, STILL_MS); }
    }
    function next() { show((cur + 1) % items.length); }
    function show(i, user) { cur = i; render(); if (user) dots[i].focus({ preventScroll: true }); }
    video.addEventListener('timeupdate', function () { if (video.duration) fill(video.currentTime / video.duration); });
    video.addEventListener('ended', function () { fill(1); if (playing && visible) timer = setTimeout(next, 200); });
    function sync() { btn.classList.toggle('paused', !playing); btn.setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
    btn.addEventListener('click', function () { playing = !playing; sync(); arm(); });
    box.addEventListener('keydown', function (e) {
      if (e.target.closest('.compare')) return;
      if (e.key === 'ArrowRight') { show((cur + 1) % items.length, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show((cur - 1 + items.length) % items.length, true); e.preventDefault(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== visible) { visible = v; arm(); } }, { threshold: 0.3 }).observe(media);
    } else { visible = true; }
    sync(); render();
    return { destroy: function () { stop(); video.pause(); video.removeAttribute('src'); video.load(); box.remove(); } };
  }

  /* ---------------- real-robot sessions: one tab per task ---------------- */
  (function () {
    var root = $('#sessRoot');
    if (!root) return;
    var SKV = { chair: '--sk-chair', cups: '--sk-cups', bucket: '--sk-bucket', box: '--sk-box' };
    var PH = ['--ph-1', '--ph-2', '--ph-3', '--ph-4'];
    var STATUS = { success: ['success', '--new'], fail: ['failure', '--warn'], fix: ['fix', '--amber'], explore: ['exploring', '--rax'] };
    var BASE = 'https://assets.robot-agent-exploration.com/static/tasks/';
    var card = null;
    function chapters(id) {
      var S = (D.sessions || {})[id];
      if (!S) return [];
      var feeds = ((D.activity || {})[id] || {}).chapters || [];
      return S.chapters.map(function (c, ci) {
        var st = STATUS[c.status] || STATUS.explore;
        return { vid: c.vid.replace(/^assets\//, ''), poster: c.poster.replace(/^assets\//, ''), title: c.title, text: c.text, quote: c.quote,
                 color: 'var(' + st[1] + ')', kicker: st[0] + (c.when ? ', ' + c.when : ''), feed: feeds[ci] && feeds[ci].lines.length ? feeds[ci] : null };
      });
    }
    function linesFor(code, step) {
      var out = [];
      if (code) code.lines.forEach(function (l, j) { if (l.s && l.s.indexOf(step) >= 0) out.push(j); });
      return out;
    }
    function steps(prog, code) {
      var keys = Object.keys(prog.phases);
      return prog.steps.map(function (s, i) {
        return { vid: s.vid, poster: s.poster, img: s.img, compare: s.compare, tag: s.tag, title: s.title, text: s.text, branch: s.branch, viz: s.viz,
                 color: 'var(' + PH[keys.indexOf(s.phase) % PH.length] + ')', kicker: prog.phases[s.phase], code: linesFor(code, i) };
      });
    }
    // RB-Y1: the six stages, and the agent's commands for each as the code
    function rby1() {
      var lines = [];
      var items = D.rby1.stages.map(function (st, i) {
        var k = st.skills[0], sk = D.skills[k];
        if (i) lines.push({ t: '', s: [] });
        lines.push({ t: '# ' + (i + 1) + '. ' + st.title.toLowerCase() + '  (done ' + st.time + ')', s: [i] });
        st.code.forEach(function (c) { lines.push({ t: c, s: [i] }); });
        return { vid: st.vid, poster: st.poster, img: st.img, tag: 'done at ' + st.time, title: st.title, text: '', viz: st.viz,
                 color: 'var(' + SKV[k] + ')', kicker: 'calls ' + sk.name,
                 chip: function () {
                   var d = el('div', { class: 'pl-skill' });
                   d.style.setProperty('--skc', 'var(' + SKV[k] + ')');
                   d.appendChild(el('img', { src: IMGP + sk.img, alt: '', loading: 'lazy' }));
                   d.appendChild(el('div', {}, [el('span', { class: 'small muted', text: 'Learned in an earlier session' }), el('b', { text: sk.name }), el('span', { text: sk.what })]));
                   return d;
                 } };
      });
      var code = { file: 'the agent’s commands in the final run, condensed (in colour: calls into a stored skill)', lines: lines, skills: SKV };
      items.forEach(function (it, i) { it.code = linesFor(code, i); });
      return { items: items, code: code };
    }
    function render(i) {
      if (card) card.destroy();
      var t = D.sessionTasks[i];
      var body = $('.sess-body', root);
      body.innerHTML = '';
      var groups = [], code = null;
      var ch = chapters(t.key);
      if (ch.length) groups.push({ name: 'Session', items: ch });
      if (t.key === 'boxing') {
        code = D.boxing.code;
        groups.push({ name: 'Program', items: D.boxing.steps.map(function (st, i) {
          return { vid: st.vid, poster: st.poster, img: st.img, tag: st.tag, title: st.title, text: st.text, color: 'var(--ph-' + (1 + (i < 5 ? 0 : 2)) + ')',
                   kicker: i < 5 ? 'perceive, map and plan' : 'act', code: linesFor(code, i) };
        }) });
      } else if (t.key === 'rby1') {
        var r = rby1(); code = r.code;
        groups.push({ name: 'Final run', items: r.items });
      } else {
        var prog = D.programs.filter(function (p) { return p.id === t.key; })[0];
        code = (D.code || {})[t.key] || null;
        groups.push({ name: 'Program', items: steps(prog, code) });
      }
      var host = el('div'); body.appendChild(host);
      card = caseCard(host, groups, code);

    }
    var FIRST = ['rby1', 'boxing'];
    D.sessionTasks.sort(function (a, b) {
      var ia = FIRST.indexOf(a.key), ib = FIRST.indexOf(b.key);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    seg($('#sessTabs', root), D.sessionTasks.map(function (t) { return t.name; }), render);
  })();
})();
