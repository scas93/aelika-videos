"""Prepares the B2B (Panadería Banetto mayoreo) inputs: screen videos and timeline_b2b.json.
Reads recordings from the folder given as argv[1] (scratchpad/b2b) and the status bar image from its parent."""
import json, os, subprocess, sys

REC = sys.argv[1]
ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(ROOT, "public"); FPS = 30
SB = os.path.join(ROOT, "assets", "statusbar_light.png")   # created by prep.py
ENC = ["-c:v", "libx264", "-crf", "15", "-preset", "fast", "-g", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
def ff(*a): subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)
def dur(f): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)

for s in ("intro", "outro"):
    ff("-f", "concat", "-safe", "0", "-i", os.path.join(REC, f"frames_{s}.txt"), "-vf", f"fps={FPS},scale=1170:2532", *ENC, os.path.join(PUB, f"b2b_{s}.mp4"))
for s in ("login", "app"):
    ff("-f", "concat", "-safe", "0", "-i", os.path.join(REC, f"frames_{s}.txt"), "-i", SB,
       "-filter_complex", f"[0:v]fps={FPS},scale=1170:2400,pad=1170:2532:0:132:white[v];[v][1:v]overlay=0:0", *ENC, os.path.join(PUB, f"b2b_{s}.mp4"))

def rel(evs, st, dy=0, remap=None):
    out = []
    for e in evs:
        t = e["t"] - st if remap is None else remap(e["t"])
        o = {"t": round(t, 3), "type": e["type"]}
        if "x" in e: o["x"], o["y"] = round(e["x"], 1), round(e["y"] + dy, 1)
        if "label" in e: o["label"] = e["label"]
        out.append(o)
    return out

# login: the wait for the code was paused in the recording -> remap event times onto video time
lg = json.load(open(os.path.join(REC, "events_login.json")))
lines = open(os.path.join(REC, "frames_login.txt")).read().split("\n")
durs = [float(l.split()[1]) for l in lines if l.startswith("duration")]
t, v_resume = 0, None
for d in durs:
    t += d
    if v_resume is None and abs(d - 0.05) < 1e-6: v_resume = t
t_ready = next(e["t"] for e in lg["events"] if e.get("label") == "code_ready")
remap = lambda tt: (tt - lg["start"]) if tt < t_ready else v_resume + (tt - t_ready)
login_taps = [remap(e["t"]) for e in lg["events"] if e["type"] == "tap"]
login_end = login_taps[-1] + 1.7                     # home screen is up ~1.6s after "Entrar"
code_field = next(e for e in lg["events"] if e["type"] == "tap" and e["t"] >= t_ready)   # tap on the code input
code_tap = remap(code_field["t"])

ap = json.load(open(os.path.join(REC, "events_app.json")))
st = ap["start"]
send_tap = [e["t"] - st for e in ap["events"] if e["type"] == "tap"][-1]
CONFIRM_SHOWN = send_tap + 1.05                      # "¡Tu pedido quedó registrado!" on screen
# products screen taps: qty, qty, "Siguiente: Mié", "Igual que", "Siguiente: Vie", "Igual que", "Ver resumen"
_prod = next(e["t"] for e in ap["events"] if e.get("label") == "products")
_sum = next(e["t"] for e in ap["events"] if e.get("label") == "summary")
ptaps = [e["t"] - st for e in ap["events"] if e["type"] == "tap" and _prod < e["t"] < _sum]
copy_win = [(ptaps[2] + 0.25, ptaps[3] + 0.55), (ptaps[4] + 0.25, ptaps[5] + 0.5)]

timeline = {
    "fps": FPS, "folio": "P-000035", "total": ap.get("total"),
    "segments": [
        {"id": "intro", "src": "b2b_intro.mp4", "clips": [{"from": 0.0, "to": round(dur(os.path.join(PUB, "b2b_intro.mp4")), 3), "speed": 1.2}],
         "events": rel(json.load(open(os.path.join(REC, "events_intro.json")))["events"], json.load(open(os.path.join(REC, "events_intro.json")))["start"])},
        {"id": "login", "src": "b2b_login.mp4", "clips": [
            {"from": 0.3, "to": round(v_resume - 0.05, 3), "speed": 1.3},
            # freeze on the empty code screen: the WhatsApp notification + iOS code autofill are drawn on top
            {"from": round(v_resume + 0.47, 3), "to": round(v_resume + 0.67, 3), "speed": 0.095, "overlay": "autofill"},
            # jump to the moment the code is complete (autofilled), then "Entrar"
            {"from": round(code_tap + 1.05, 3), "to": round(login_end, 3), "speed": 1.3}],
         "field": {"x": round(code_field["x"], 1), "y": round(code_field["y"] + 44, 1)}, "code": "146678",
         "events": rel(lg["events"], lg["start"], dy=44, remap=remap)},
        {"id": "app", "src": "b2b_app.mp4", "clips": [
            # "Igual que lun 16" moments get extra time: slow on Wednesday, normal speed on Friday
            {"from": 0.4, "to": round(copy_win[0][0], 3), "speed": 1.45},
            {"from": round(copy_win[0][0], 3), "to": round(copy_win[0][1], 3), "speed": 0.65, "spotlight": True},
            {"from": round(copy_win[0][1], 3), "to": round(copy_win[1][0], 3), "speed": 1.45},
            {"from": round(copy_win[1][0], 3), "to": round(copy_win[1][1], 3), "speed": 1.0, "spotlight": True},
            {"from": round(copy_win[1][1], 3), "to": round(send_tap + 0.6, 3), "speed": 1.45},
            {"from": round(CONFIRM_SHOWN, 3), "to": round(CONFIRM_SHOWN + 2.4, 3), "speed": 1.0}],
         "events": rel(ap["events"], st, dy=44)},
        {"id": "outro", "src": "b2b_outro.mp4", "clips": [{"from": 0.3, "to": round(dur(os.path.join(PUB, "b2b_outro.mp4")), 3), "speed": 1.0}],
         "events": rel(json.load(open(os.path.join(REC, "events_outro.json")))["events"], json.load(open(os.path.join(REC, "events_outro.json")))["start"])},
    ],
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline_b2b.json"), "w"), indent=1)
print(json.dumps({s["id"]: s["clips"] for s in timeline["segments"]}))
