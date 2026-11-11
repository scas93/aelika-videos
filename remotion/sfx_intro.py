"""Original sound effects for the logo intro: landing 'boing', rising letter pops and a bright final chime."""
import os, wave
import numpy as np
PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
SR = 44100
def save(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(os.path.join(PUB, name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def t(sec): return np.arange(int(SR * sec)) / SR
# landing: soft thump + springy pitch wobble ("boing")
x = t(0.42)
f = 210 + 120 * np.exp(-x * 9) * np.cos(2 * np.pi * 11 * x)
boing = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7.5)
thump = np.sin(2 * np.pi * 70 * x) * np.exp(-x * 30)
save("intro_land.wav", 0.55 * boing + 0.5 * thump)
# letter pops: short bubbly blips, rising pentatonic pitches
notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
for i, n in enumerate(notes):
    x = t(0.12)
    f = n * (1 + 0.5 * np.exp(-x * 60))           # quick upward-settling chirp
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 28) * np.minimum(1, x * 600)
    save(f"intro_pop{i}.wav", 0.42 * s)
# final chime: two bell notes with harmonics
def bell(fr, sec, dec):
    x = t(sec)
    return sum(a * np.sin(2 * np.pi * fr * m * x) * np.exp(-x * dec * m ** 0.5) for m, a in [(1, 1), (2, .45), (3, .22), (4.2, .12)]) * np.minimum(1, x * 800)
c1, c2 = bell(1318.5, 0.9, 4.5), bell(1975.5, 1.2, 3.8)
off = int(SR * 0.09)
ch = np.zeros(off + c2.size); ch[:c1.size] += c1; ch[off:] += c2
save("intro_chime.wav", 0.22 * ch)
print("ok")
