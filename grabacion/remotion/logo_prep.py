"""Removes the white background from the Aelika logo and splits it into icon + letters for the intro animation."""
import json, os
import numpy as np
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "logo")
im = np.asarray(Image.open(os.path.join(D, "aelika_original.png")).convert("RGB")).astype(float)
dist = 255 - im.min(axis=2)                       # how far from white
a = np.clip((dist - 6) / 110, 0, 1)                # soft edges, solid interior
rgb = np.where(a[..., None] > 0.01, (im - (1 - a[..., None]) * 255) / np.maximum(a[..., None], 0.01), 255)
rgba = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
ys, xs = np.where(a > 0.05)
y0, y1 = ys.min() - 4, ys.max() + 5
cols = (a[y0:y1] > 0.05).any(axis=0)
# column runs = separate glyphs
runs, x = [], 0
while x < cols.size:
    if cols[x]:
        s = x
        while x < cols.size and cols[x]: x += 1
        runs.append((s, x))
    x += 1
print("runs", runs)
parts = []
names = ["icon", "A", "e", "l", "i", "k", "a"]
assert len(runs) == len(names), len(runs)
for n, (s, e) in zip(names, runs):
    s2, e2 = s - 4, e + 4
    Image.fromarray(rgba[y0:y1, s2:e2]).save(os.path.join(D, f"{n}.png"))
    parts.append({"name": n, "x": int(s2 - runs[0][0] + 4), "w": int(e2 - s2)})
full = rgba[y0:y1, runs[0][0] - 4: runs[-1][1] + 4]
Image.fromarray(full).save(os.path.join(D, "aelika_full.png"))
meta = {"w": int(full.shape[1]), "h": int(full.shape[0]), "parts": parts}
json.dump(meta, open(os.path.join(os.path.dirname(D), "..", "src", "logo.json"), "w"), indent=1)
print(meta)
