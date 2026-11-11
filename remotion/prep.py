"""Prepares Remotion inputs: full-res screen videos, sound effects and timeline.json.
Reads the recordings (frames + event logs) from the scratchpad folder given as argv[1]."""
import json, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

REC = sys.argv[1]
ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(ROOT, "public"); os.makedirs(PUB, exist_ok=True)
FPS = 30

def ff(*a): subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)
def dur(f): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
ENC = ["-c:v", "libx264", "-crf", "15", "-preset", "fast", "-g", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]

# ---------- light status bar for the app (1170 x 132 = 44pt @3x)
k = 3
sb = Image.new("RGB", (1170, 132), "white"); d = ImageDraw.Draw(sb)
d.text((47 * k, 23.5 * k), "9:41", font=ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", 17 * k), fill="black", anchor="mm")
rx = 1170 - 31 * k
d.rounded_rectangle((rx - 25 * k, 17 * k, rx, 30 * k), 4 * k, outline="black", width=k)
d.rounded_rectangle((rx - 23 * k, 19 * k, rx - 4 * k, 28 * k), 2 * k, fill="black")
d.rounded_rectangle((rx + 1.5 * k, 21 * k, rx + 3.5 * k, 26 * k), k, fill="black")
cx, cy = rx - 43 * k, 30 * k
for i, r in enumerate([13, 9, 5]):
    d.pieslice((cx - r * k, cy - r * k, cx + r * k, cy + r * k), 225, 315, fill="black" if i % 2 == 0 else "white")
for i in range(4):
    h = (4.5 + i * 3) * k; x0 = rx - 80 * k + i * 5 * k
    d.rounded_rectangle((x0, 30 * k - h, x0 + 3 * k, 30 * k), k, fill="black")
sb_path = os.path.join(ROOT, "assets", "statusbar_light.png"); os.makedirs(os.path.dirname(sb_path), exist_ok=True); sb.save(sb_path)

# ---------- videos
ff("-f", "concat", "-safe", "0", "-i", os.path.join(REC, "frames_intro.txt"), "-vf", f"fps={FPS},scale=1170:2532", *ENC, os.path.join(PUB, "intro.mp4"))
ff("-f", "concat", "-safe", "0", "-i", os.path.join(REC, "frames_outro.txt"), "-vf", f"fps={FPS},scale=1170:2532", *ENC, os.path.join(PUB, "outro.mp4"))
ff("-f", "concat", "-safe", "0", "-i", os.path.join(REC, "frames.txt"), "-i", sb_path,
   "-filter_complex", f"[0:v]fps={FPS},scale=1170:2400,pad=1170:2532:0:132:white[v];[v][1:v]overlay=0:0", *ENC, os.path.join(PUB, "app.mp4"))

# ---------- sound effects
SR = 44100
def save(name, x):
    x = np.clip(x, -1, 1); a = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(PUB, name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes())
def t(sec): return np.arange(int(SR * sec)) / SR
rng = np.random.default_rng(7)
# tap: soft, short "tock"
tt = t(0.06); env = np.exp(-tt * 90)
save("tap.wav", 0.55 * env * (np.sin(2 * np.pi * 1450 * tt) * 0.6 + np.sin(2 * np.pi * 2900 * tt) * 0.2 + rng.normal(0, 0.25, tt.size) * np.exp(-tt * 400)))
# key: lighter tick
tt = t(0.035); env = np.exp(-tt * 160)
save("key.wav", 0.35 * env * (np.sin(2 * np.pi * 2300 * tt) * 0.5 + rng.normal(0, 0.4, tt.size) * np.exp(-tt * 500)))
# send: quick upward swoosh
tt = t(0.22); f = 500 + 1400 * (tt / tt[-1]) ** 1.5
ph = 2 * np.pi * np.cumsum(f) / SR; env = np.sin(np.pi * tt / tt[-1]) ** 2
save("send.wav", 0.32 * env * (np.sin(ph) * 0.6 + rng.normal(0, 0.15, tt.size)))
# receive: two-note pop
def note(fr, sec, dec): x = t(sec); return np.sin(2 * np.pi * fr * x) * np.exp(-x * dec) * np.minimum(1, x * 400)
a, b = note(988, 0.09, 30), note(1319, 0.28, 14)
save("receive.wav", 0.42 * np.concatenate([a, b]))

# ---------- timeline
def load_ev(path):
    j = json.load(open(path)); return j["start"], j["events"]
st_i, ev_i = load_ev(os.path.join(REC, "events_intro.json"))
st_o, ev_o = load_ev(os.path.join(REC, "events_outro.json"))
m = json.load(open(os.path.join(REC, "marks.json")))
st_a = m["start"]; paid, conf = m["paid"] - st_a, m["confirm"] - st_a
# cut the Stripe loading wait: from ~1s after "Continuar al pago" to when the card form is ready
_pay = next(e["t"] for e in m["events"] if e.get("label") == "pay")
_pay_taps = [e["t"] for e in m["events"] if e["type"] == "tap" and e["t"] > _pay]
_ready = next(e["t"] for e in m["events"] if e.get("label") == "stripe_ready")
STRIPE_GAP = (round(_pay_taps[1] - st_a + 1.0, 3), round(_ready - st_a - 0.1, 3))

def rel(evs, st, dy=0):
    out = []
    for e in evs:
        o = {"t": round(e["t"] - st, 3), "type": e["type"]}
        if "x" in e: o["x"], o["y"] = round(e["x"], 1), round(e["y"] + dy, 1)
        if "label" in e: o["label"] = e["label"]
        out.append(o)
    return out

timeline = {
    "fps": FPS,
    "folio": m.get("folio"), "total": m.get("total"),
    "segments": [
        {"id": "intro", "src": "intro.mp4", "clips": [{"from": 0.0, "to": round(dur(os.path.join(PUB, "intro.mp4")), 3), "speed": 1.15}],
         "events": rel(ev_i, st_i)},
        {"id": "app", "src": "app.mp4", "clips": [
            {"from": 0.3, "to": STRIPE_GAP[0], "speed": 1.15},
            {"from": STRIPE_GAP[1], "to": round(paid + 1.0, 3), "speed": 1.15},
            {"from": round(conf - 0.3, 3), "to": round(conf + 2.2, 3), "speed": 1.0}],
         "events": rel(m["events"], st_a, dy=44)},
        {"id": "outro", "src": "outro.mp4", "clips": [{"from": 0.3, "to": round(dur(os.path.join(PUB, "outro.mp4")), 3), "speed": 1.0}],
         "events": rel(ev_o, st_o)},
    ],
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), indent=1)
print(json.dumps({s["id"]: s["clips"] for s in timeline["segments"]}))
