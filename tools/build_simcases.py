"""Write assets/js/simcases.js from the staged simulation case packages (data.json + clips + viz), and copy their
media into assets/. Usage: python tools/build_simcases.py <stage dir> [<stage dir> ...]"""
import json
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
cases = {}
for stage in map(Path, sys.argv[1:]):
    d = json.loads((stage / 'data.json').read_text())
    key = d['key']
    vid = REPO / 'assets/vid' / key; vid.mkdir(parents=True, exist_ok=True)
    for f in sorted((stage / 'clips').glob('*')):
        if f.suffix in ('.mp4', '.jpg'):
            shutil.copy2(f, vid / f.name)
    if (stage / 'viz').is_dir():
        img = REPO / 'assets/img' / key; img.mkdir(parents=True, exist_ok=True)
        for f in sorted((stage / 'viz').glob('*.jpg')):
            shutil.copy2(f, img / f.name)
    if d.get('activity_tz', 'utc') == 'utc':                       # the widget shows local (EDT) times, like the real tasks
        edt = lambda t: f"{(int(t[:2]) - 4) % 24:02d}{t[2:]}"
        for ch in d['activity']:
            ch['span'] = '\u2013'.join(edt(x) for x in ch['span'].split('\u2013'))
            for l in ch['lines']:
                l['time'] = edt(l['time'])
        d['activity_tz'] = 'edt'
    for st in d['program']['steps']:                                # the widget prefixes assets/img/ itself
        for v in st.get('viz') or []:
            v['img'] = v['img'].removeprefix('img/')
        if st.get('img'):
            st['img'] = st['img'].removeprefix('img/')
    cases[key] = d
js = ('// Simulation case studies in the rollout-sessions widget, in the same form as the real-robot tasks.\n'
      '// Built by tools/build_simcases.py from the session archives; merged into the tables the widget reads.\n'
      'RAX.simcases = ' + json.dumps(cases, ensure_ascii=False, separators=(',', ':')) + ';\n'
      '(function () {\n'
      '  Object.keys(RAX.simcases).forEach(function (k) {\n'
      '    var c = RAX.simcases[k];\n'
      '    (RAX.sessions = RAX.sessions || {})[k] = { chapters: c.chapters };\n'
      '    (RAX.activity = RAX.activity || {})[k] = { chapters: c.activity };\n'
      '    (RAX.programs = RAX.programs || []).push(c.program);\n'
      '    (RAX.code = RAX.code || {})[k] = c.code;\n'
      '    RAX.sessionTasks.push({ key: k, video: null, name: c.task.name, meta: c.task.meta, desc: c.task.desc });\n'
      '  });\n'
      '})();\n')
(REPO / 'assets/js/simcases.js').write_text(js)
print('wrote simcases.js with', list(cases))
