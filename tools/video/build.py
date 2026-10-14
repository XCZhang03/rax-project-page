"""Rebuild the teaser and the real-robot session videos for the project page.

  overview  render the RB-Y1 overview (raw phone footage of run 3, cropped, sped up, captioned)
  teaser    insert it before the Bandu overview, re-encoding only the head and copying the rest
  music     mix the score and mux it in
  sessions  start each session video on its title card and dissolve over the dip to black
  posters   cover frames for all of them

Everything after each re-encoded head is stream-copied from the published files, encoded with the same x264
settings so the joined streams share one avcC. Run from the work root (orig/, fonts/, music/, shots.json).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path.cwd()
OUT = ROOT / 'out'; OUT.mkdir(exist_ok=True)
WORK = ROOT / 'work'; WORK.mkdir(exist_ok=True)
TOOLS = Path(__file__).resolve().parent
X264 = 'ref=5:me=hex:subme=8:trellis=2:rc-lookahead=50:bframes=3:b-pyramid=2:b-adapt=1:keyint=250:min-keyint=25:' \
       'weightp=2:direct=3:deblock=0,0:aq-mode=1:psy-rd=1.0,0.0'
FPS = 30


def run(cmd):
    print('+', ' '.join(map(str, cmd))[:400], flush=True)
    subprocess.run(list(map(str, cmd)), check=True)


def probe(path, entries, stream='v'):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', stream, '-show_entries', entries, '-of', 'json', path],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def x264(crf):
    return ['-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-x264-params', X264, '-profile:v', 'high', '-level', '5.0',
            '-pix_fmt', 'yuv420p']


def keyframes(path, until):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-skip_frame', 'nokey', '-show_entries',
                          'frame=pts_time', '-of', 'csv=p=0', '-read_intervals', f'%+{until}', path], capture_output=True, text=True).stdout
    return [float(x.strip(',')) for x in out.split()]


def extradata(path):
    out = subprocess.run(['ffprobe', '-v', 'quiet', '-select_streams', 'v', '-show_streams', '-show_data', path],
                         capture_output=True, text=True, check=True).stdout.splitlines()
    i = next(i for i, l in enumerate(out) if l.startswith('extradata='))
    hexdump = []
    for l in out[i + 1:]:
        if not l[:8].strip().isalnum() or ':' not in l[:10]:
            break
        hexdump.append(l)
    assert hexdump, path
    return hexdump


def join(head, src, cut, out, timescale=None):
    """head + src from its keyframe at `cut`, stream-copied. The concat demuxer's inpoint starts the source cleanly on
    that keyframe; cutting a tail out with -ss leaves edit-list discards that concat ignores."""
    assert extradata(head) == extradata(src), f'avcC differs between {head} and {src}'
    lst = WORK / (Path(out).stem + '_list.txt')
    lst.write_text(f"file '{Path(head).resolve()}'\nfile '{Path(src).resolve()}'\ninpoint {cut:.6f}\n")
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-map', '0:v', '-c', 'copy', '-movflags', '+faststart', out])
    bad = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-f', 'null', '-'], capture_output=True, text=True).stderr
    assert not bad.strip(), bad[:300]


# ---------------------------------------------------------------------------------------------------- overview
def overview():
    spec = json.loads((ROOT / 'shots.json').read_text())
    src = (ROOT / spec['src']).resolve()
    ovl = WORK / 'ovl'
    if not (ovl / f"{sum(s['frames'] for s in spec['shots']) - 1:05d}.png").exists():
        run([sys.executable, '-I', TOOLS / 'overlay.py', ROOT / 'shots.json', ROOT / 'fonts', ovl])
    parts = []
    for k, sh in enumerate(spec['shots']):
        a, b = sh['src']; n = sh['frames']; T = n / FPS
        speed = (b - a) / T
        blur = int(min(12, max(1, round(speed / 6))))
        (x0, y0), (x1, y1) = sh['crop']
        cx = f'({x0}+({x1}-{x0})*min(t/{T},1))*1920-720'
        cy = f'({y0}+({y1}-{y0})*min(t/{T},1))*1080-405'
        vf = (f'trim=start=1:duration={b - a + 1},setpts=PTS-STARTPTS,tmix=frames={blur},setpts=PTS/{speed:.5f},fps={FPS},'
              f'trim=end_frame={n},setpts=PTS-STARTPTS,'
              f"crop=1440:810:'max(0,min(1920-1440,{cx}))':'max(0,min(1080-810,{cy}))',"
              f'scale=1920:1080:flags=lanczos,eq=gamma=0.92:saturation=0.95,setsar=1,format=yuv420p')
        p = WORK / f'shot{k}_{sh["name"]}.mkv'
        if not p.exists():
            run(['ffmpeg', '-v', 'error', '-y', '-ss', a - 1, '-t', b - a + 3, '-i', src, '-vf', vf, '-an',
                 '-c:v', 'libx264', '-preset', 'medium', '-crf', '10', p])
        parts.append(p)
    lst = WORK / 'shots.txt'; lst.write_text(''.join(f"file '{p}'\n" for p in parts))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-framerate', FPS, '-i', ovl / '%05d.png',
         '-filter_complex', '[0:v]setpts=PTS-STARTPTS[v];[1:v]format=rgba[o];[v][o]overlay=format=auto:shortest=1,format=yuv420p',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '10', '-r', FPS, WORK / 'overview.mkv'])


# ---------------------------------------------------------------------------------------------------- teaser
GRID_END, B_LEN, BACK_AT, XF = 6.6, 1149 / FPS, 6.5, 0.5     # the grid until 6.6 s; the overview; back into Bandu at 6.5 s
SHIFT = GRID_END + B_LEN - 2 * XF - BACK_AT                    # every original time from 6.5 s on moves by this much


def teaser():
    src = ROOT / 'orig/rax_overview_v2.mp4'
    cut = next(k for k in keyframes(src, 40) if k > BACK_AT + 2)   # first keyframe after the second dissolve
    off1, off2 = GRID_END - XF, GRID_END + B_LEN - 2 * XF
    fc = (f'[0:v]fps={FPS},settb=AVTB,split[s0][s1];[s0]trim=0:{GRID_END},setpts=PTS-STARTPTS,fps={FPS}[a];'
          f'[s1]trim={BACK_AT}:{cut},setpts=PTS-STARTPTS,fps={FPS}[c];[1:v]setpts=PTS-STARTPTS,fps={FPS}[b];[a][b]xfade=transition=fade:duration={XF}:offset={off1}[ab];'
          f'[ab][c]xfade=transition=fade:duration={XF}:offset={off2},format=yuv420p[v]')
    head = WORK / 'teaser_head.mp4'
    ts = probe(src, 'stream=time_base')['streams'][0]['time_base'].split('/')[1]
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', WORK / 'overview.mkv', '-filter_complex', fc, '-map', '[v]',
         *x264('24'), '-r', FPS, '-video_track_timescale', ts, head])
    join(head, src, cut, WORK / 'teaser_video.mp4', ts)
    (WORK / 'teaser_cut.json').write_text(json.dumps({'cut': cut, 'shift': SHIFT}))


# ---------------------------------------------------------------------------------------------------- music
def music():
    """Vanguard opens (its 12.2 s lift on the cut into RB-Y1); Aphelion's slow start sits under the manifesto and
    carries the chapters; Vanguard returns for the results, its stop-and-hit at 220.5 s landing on the end card."""
    dur = float(probe(WORK / 'teaser_video.mp4', 'format=duration')['format']['duration'])
    manifesto = 44.5 + SHIFT
    endcard = 530.3 + SHIFT
    v1 = 12.2 - (GRID_END - XF + 0.25)          # Vanguard time at video 0
    v2_at = endcard - 220.5                       # video time of Vanguard 0 in the finale
    fin = 500.0                                   # Aphelion has wound down by now (it ends at manifesto + 422 s)
    M = ROOT / 'music'
    fc = (
        f'[0:a]atrim={v1}:{v1 + manifesto + 2},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,'
        f'afade=t=out:st={manifesto}:d=2.0[o];'
        f'[1:a]atrim=0:{fin - manifesto + 6},asetpts=PTS-STARTPTS,volume=0.72,afade=t=in:d=1.5,'
        f'afade=t=out:st={fin - manifesto - 2}:d=8,adelay={int(manifesto * 1000)}:all=1[m];'
        f'[2:a]atrim={fin - v2_at}:{dur - v2_at + 1},asetpts=PTS-STARTPTS,afade=t=in:d=6,'
        f'afade=t=out:st={dur - 2.6 - fin}:d=2.6,adelay={int(fin * 1000)}:all=1[f];'
        f'[o][m][f]amix=inputs=3:normalize=0:duration=longest,atrim=0:{dur},aformat=sample_rates=48000:channel_layouts=stereo[mix]'
    )
    raw = WORK / 'score_raw.wav'
    run(['ffmpeg', '-v', 'error', '-y', '-i', M / 'vanguard.mp3', '-i', M / 'aphelion.mp3', '-i', M / 'vanguard.mp3',
         '-filter_complex', fc, '-map', '[mix]', raw])
    # one gain to -16 LUFS, then a limiter for -1 dBTP
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(meas.rsplit('I:', 1)[1].split('LUFS')[0])
    gain = -16.0 - I
    score = WORK / 'score.m4a'
    run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false',
         '-c:a', 'aac', '-b:a', '192k', score])
    run(['ffmpeg', '-v', 'error', '-y', '-i', WORK / 'teaser_video.mp4', '-i', score, '-map', '0:v', '-map', '1:a', '-c', 'copy',
         '-shortest', '-movflags', '+faststart', OUT / 'rax_overview_v3.mp4'])
    run(['ffmpeg', '-v', 'error', '-y', '-i', OUT / 'rax_overview_v3.mp4', '-vf', 'scale=1280:720:flags=lanczos',
         '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
         OUT / 'rax_overview_light_v3.mp4'])
    print('score: integrated', I, 'LUFS, gain', round(gain, 2), 'dB; manifesto', manifesto, 'end card', endcard)


# ---------------------------------------------------------------------------------------------------- sessions
SESSIONS = ['rby1', 'find_the_cube', 'air_fry_pan', 'swipe_table', 'peg_insertion', 'bandu']


def luma(path, t0, t1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', path, '-vf',
                          f'fps={FPS},scale=64:36,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 36, 64).astype(float).mean((1, 2))


def sessions():
    """Start each session video on its first fully faded-in frame of the session itself. The title card went: the
    page's tab names the task, and a card that cut away after a few seconds read as a flash."""
    for name in SESSIONS:
        src = ROOT / f'orig/{name}.mp4'
        x = luma(src, 0, 14); t = np.arange(len(x)) / FPS
        title = np.median(x[60:180])
        dip = t[np.argmax((t > 5) & (x < 0.3 * title))]
        dip_end = t[np.argmax((t > dip) & (x > 0.3 * title))]
        settled = np.median(x[(t > dip_end + 0.5) & (t < dip_end + 3)])
        start = t[np.argmax((t > dip_end) & (x > 0.9 * settled))]
        cut = next(k for k in keyframes(src, 40) if k > start + 1)
        fc = f'[0:v]fps={FPS},trim={start}:{cut},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[v]'
        head = WORK / f'{name}_head.mp4'
        ts = probe(src, 'stream=time_base')['streams'][0]['time_base'].split('/')[1]
        crf = subprocess.run(['strings', '-n', '20', src], capture_output=True, text=True).stdout.split(' crf=')[1].split('.')[0]
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[v]', *x264(crf), '-r', FPS,
             '-video_track_timescale', ts, head])
        (WORK / f'{name}_cut.json').write_text(json.dumps({'cut': cut}))
        join(head, src, cut, OUT / f'{name}.mp4', ts)
        # the tab switch shows this until the video starts, so the switch lands on the frame it plays first
        run(['ffmpeg', '-v', 'error', '-y', '-i', OUT / f'{name}.mp4', '-frames:v', 1, '-q:v', 3, OUT / f'{name}_first.jpg'])
        print(name, f'session settled at {start:.2f}, copy from {cut:.2f}, crf {crf}')

def posters():
    """The teaser opens on its title over the grid; each session shows a frame well into the work."""
    run(['ffmpeg', '-v', 'error', '-y', '-ss', 3.0, '-i', OUT / 'rax_overview_v3.mp4', '-frames:v', 1, '-q:v', 3, OUT / 'rax_overview_poster.jpg'])
    for name in SESSIONS:
        d = float(probe(OUT / f'{name}.mp4', 'format=duration')['format']['duration'])
        run(['ffmpeg', '-v', 'error', '-y', '-ss', round(0.6 * d, 2), '-i', OUT / f'{name}.mp4', '-frames:v', 1, '-vf', 'scale=1920:1080',
             '-q:v', 3, OUT / f'{name}_poster.jpg'])


def rejoin():
    """Join the existing heads again (after a change to join())."""
    cut = json.loads((WORK / 'teaser_cut.json').read_text())['cut']
    join(WORK / 'teaser_head.mp4', ROOT / 'orig/rax_overview_v2.mp4', cut, WORK / 'teaser_video.mp4')
    for name in SESSIONS:
        src = ROOT / f'orig/{name}.mp4'
        meta = json.loads((WORK / f'{name}_cut.json').read_text())
        join(WORK / f'{name}_head.mp4', src, meta['cut'], OUT / f'{name}.mp4')


if __name__ == '__main__':
    for step in sys.argv[1:]:
        globals()[step]()
