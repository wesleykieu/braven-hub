// Braven Hub — automated product demo video (fast, TikTok-style).
//
//   npm run build && npx next start -p 3201 &
//   npm run demo:video   → demo/braven-hub-demo.mp4 (+ -silent.mp4)
//
// Playwright drives the real app; a neural voice (edge-tts) narrates; captions pop in
// word-by-word in sync with the voice; ffmpeg cuts it together.
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const BASE = process.env.DEMO_URL ?? "http://localhost:3201";
const VOICE = process.env.DEMO_VOICE ?? "en-US-AvaMultilingualNeural";
const RATE = process.env.DEMO_RATE ?? "+12%";
const PITCH = process.env.DEMO_PITCH ?? "+0Hz";
const W = 1440, H = 810;
const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(ROOT, "demo");
const TMP = path.join(OUT, ".tmp");
const PY = path.join(HERE, ".venv/bin/python");

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// ───────────────────────── Script (short + punchy) ─────────────────────────
const SCENES = [
  { id: "hook", say: "Your entire career launch. One app. No login. This is Braven Hub." },
  { id: "home", say: "Built for Braven Fellows and San José State students." },
  { id: "personalize", say: "Tell it your major and goals in ten seconds." },
  { id: "events", say: "Find career events, filtered just for you, or see them right on a map." },
  { id: "rsvp", say: "Tap RSVP. You get a Google Calendar invite, plus text reminders." },
  { id: "alumni", say: "Find alumni in your dream career, see who's down for a coffee chat, and let AI write the intro." },
  { id: "jobs", say: "Jobs, ranked just for you." },
  { id: "coach", say: "Then the AI coach scores your resume, rewrites your weak bullets, and grades your interview answers, just like a real recruiter would." },
  { id: "bravo", say: "Stuck? Bravo, your AI guide, gets you anywhere." },
  { id: "end", say: "Braven Hub. Go together, go further." },
];

const ff = (args) => execFileSync(ffmpegPath, ["-hide_banner", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
function duration(file) {
  try {
    execFileSync(ffmpegPath, ["-hide_banner", "-i", file], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const m = String(e.stderr).match(/Duration: (\d+):(\d+):([\d.]+)/);
    if (m) return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
  throw new Error("Could not read duration of " + file);
}

console.log(`🎙  Voiceover: ${VOICE} (${RATE})`);
if (!existsSync(PY)) throw new Error("Run: python3 -m venv scripts/demo-video/.venv && scripts/demo-video/.venv/bin/pip install edge-tts");
execFileSync(PY, [path.join(HERE, "voice.py"), TMP, VOICE, RATE, PITCH], {
  input: JSON.stringify(SCENES.map((s) => ({ id: s.id, text: s.say }))),
  stdio: ["pipe", "inherit", "inherit"],
});
for (const s of SCENES) {
  s.wav = path.join(TMP, `${s.id}.wav`);
  ff(["-i", path.join(TMP, `${s.id}.mp3`), "-ar", "48000", "-ac", "2", s.wav]);
  s.dur = duration(s.wav);
  s.words = JSON.parse(readFileSync(path.join(TMP, `${s.id}.json`), "utf8"));
  console.log(`   ${s.id.padEnd(12)} ${s.dur.toFixed(1)}s`);
}

// ───────────────────────── Overlay: cursor, word captions, cards ─────────────────────────
const OVERLAY = () => {
  const install = () => {
    if (document.getElementById("demo-root")) return;
    const root = document.createElement("div");
    root.id = "demo-root";
    root.innerHTML = `
      <style>
        #demo-root{position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:var(--font-sans),system-ui,sans-serif}
        #demo-cursor{position:fixed;left:0;top:0;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:999px;background:rgba(63,93,245,.92);border:3px solid #fff;box-shadow:0 6px 20px rgba(1,25,54,.4);transition:transform .12s ease;opacity:0}
        #demo-cursor.down{transform:scale(.65)}
        .demo-ripple{position:fixed;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:999px;border:3px solid #3f5df5;animation:demo-rip .5s ease-out forwards}
        @keyframes demo-rip{to{transform:scale(3.4);opacity:0}}
        #demo-sub{position:fixed;left:0;right:0;bottom:92px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:0 120px}
        #demo-sub span{font-size:54px;line-height:1.1;font-weight:800;letter-spacing:-.02em;color:#fff;padding:2px 12px;border-radius:14px;
          text-shadow:3px 0 0 #011936,-3px 0 0 #011936,0 3px 0 #011936,0 -3px 0 #011936,2px 2px 0 #011936,-2px -2px 0 #011936,2px -2px 0 #011936,-2px 2px 0 #011936,0 6px 0 #011936,0 10px 28px rgba(1,25,54,.5);
          animation:demo-pop .22s cubic-bezier(.34,1.56,.64,1) both;transition:background .12s,transform .12s}
        #demo-sub span.on{background:#3f5df5;transform:scale(1.08) rotate(-1.5deg);text-shadow:0 2px 0 rgba(1,25,54,.35);box-shadow:0 8px 0 #011936,0 12px 30px rgba(63,93,245,.45)}
        @keyframes demo-pop{from{transform:scale(.6) translateY(14px);opacity:0}to{transform:none;opacity:1}}
        #demo-card{position:fixed;inset:0;display:grid;place-items:center;background:#011936;color:#fff;opacity:0;transition:opacity .45s ease;overflow:hidden}
        #demo-card.on{opacity:1}
        #demo-card .grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.06) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(closest-side,#000,transparent)}
        #demo-card .glow{position:absolute;width:900px;height:500px;border-radius:999px;background:radial-gradient(closest-side,rgba(63,93,245,.5),transparent);animation:demo-breathe 3s ease-in-out infinite}
        @keyframes demo-breathe{50%{transform:scale(1.15)}}
        #demo-card .inner{position:relative;text-align:center;transform:scale(.92);transition:transform .9s cubic-bezier(.22,1,.36,1)}
        #demo-card.on .inner{transform:none}
        #demo-card img{height:36px}
        #demo-card h1{margin:26px 0 0;font-size:96px;line-height:1;font-weight:700;letter-spacing:-.05em}
        #demo-card h1 i{font-family:var(--font-instrument),serif;font-weight:400;color:#a6c0ce;letter-spacing:-.02em}
        #demo-card p{margin:22px 0 0;font-size:26px;color:rgba(255,255,255,.65)}
      </style>
      <div id="demo-card"><div class="grid"></div><div class="glow"></div><div class="inner"></div></div>
      <div id="demo-sub"></div>
      <div id="demo-cursor"></div>`;
    document.documentElement.appendChild(root);
    const cur = root.querySelector("#demo-cursor");
    addEventListener("mousemove", (e) => { cur.style.opacity = "1"; cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", (e) => {
      cur.classList.add("down");
      const r = document.createElement("div"); r.className = "demo-ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
      root.appendChild(r); setTimeout(() => r.remove(), 600);
    }, true);
    addEventListener("mouseup", () => cur.classList.remove("down"), true);

    // Word-by-word captions in 2–3 word chunks, synced to the voice's word timings.
    let raf = 0;
    window.__words = (words) => {
      cancelAnimationFrame(raf);
      const sub = root.querySelector("#demo-sub");
      sub.innerHTML = "";
      if (!words?.length) return;
      const chunks = []; let cur = [];
      words.forEach((w, i) => {
        cur.push({ ...w, i });
        if (/[.,!?]$/.test(w.w) || cur.length >= 3) { chunks.push(cur); cur = []; }
      });
      if (cur.length) chunks.push(cur);
      const t0 = performance.now();
      let shown = -1;
      const tick = () => {
        const t = (performance.now() - t0) / 1000;
        const ci = chunks.findLastIndex((c) => t >= c[0].t);
        if (ci !== shown && ci >= 0) {
          shown = ci;
          sub.innerHTML = chunks[ci].map((w) => `<span data-i="${w.i}">${w.w.replace(/[.,]$/, "")}</span>`).join("");
        }
        sub.querySelectorAll("span").forEach((s) => {
          const w = words[+s.dataset.i];
          s.classList.toggle("on", t >= w.t && t < w.t + Math.max(w.d, 0.18));
        });
        const last = words[words.length - 1];
        if (t > last.t + last.d + 0.5) { sub.innerHTML = ""; return; }
        raf = requestAnimationFrame(tick);
      };
      tick();
    };
    window.__card = (html) => {
      const c = root.querySelector("#demo-card");
      if (!html) return c.classList.remove("on");
      c.querySelector(".inner").innerHTML = html; c.classList.add("on");
    };
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install); else install();
};

// ───────────────────────── Recording helpers ─────────────────────────
const browser = await chromium.launch({ channel: process.env.DEMO_BROWSER ?? "chrome" });
const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: TMP, size: { width: W, height: H } } });
await context.addInitScript(OVERLAY);
const t0 = Date.now();
const page = await context.newPage();
const sleep = (ms) => page.waitForTimeout(ms);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let mouse = { x: W / 2, y: H / 2 };

async function moveTo(x, y, ms = 380) {
  const from = { ...mouse };
  const n = Math.max(8, Math.round(ms / 16));
  for (let i = 1; i <= n; i++) {
    const k = ease(i / n);
    await page.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k);
    await sleep(ms / n);
  }
  mouse = { x, y };
}
async function point(locator, ms) {
  await locator.waitFor({ state: "visible", timeout: 15000 });
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  await moveTo(b.x + b.width / 2, b.y + b.height / 2, ms);
}
async function click(locator, ms) {
  await point(locator, ms);
  await sleep(60);
  await page.mouse.down();
  await sleep(60);
  await page.mouse.up();
  await sleep(120);
}
async function scrollTo(target, ms = 800) {
  const to = typeof target === "number" ? target : await target.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 100);
  await page.evaluate(
    ([to, ms]) =>
      new Promise((res) => {
        const from = scrollY, d = to - from, s = performance.now();
        const e = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const f = (now) => { const k = Math.min(1, (now - s) / ms); scrollTo(0, from + d * e(k)); k < 1 ? requestAnimationFrame(f) : res(); };
        requestAnimationFrame(f);
      }),
    [to, ms],
  );
}
const card = (html) => page.evaluate((h) => window.__card?.(h), html);

const timeline = [];
async function scene(id, fn, { tail = 150, pre } = {}) {
  const s = SCENES.find((x) => x.id === id);
  if (pre) await pre(); // e.g. navigate first, so the voice lands on the right screen
  await page.evaluate((w) => window.__words?.(w), s.words);
  const start = Date.now();
  timeline.push({ s, at: (start - t0) / 1000 });
  try {
    await fn();
  } catch (err) {
    await page.screenshot({ path: path.join(OUT, `debug-${id}.png`) });
    console.error(`❌ scene "${id}" failed — see demo/debug-${id}.png`);
    throw err;
  }
  const left = s.dur * 1000 + tail - (Date.now() - start);
  if (left > 0) await sleep(left);
  console.log(`🎬 ${id.padEnd(12)} ${((Date.now() - start) / 1000).toFixed(1)}s (voice ${s.dur.toFixed(1)}s)`);
}
const nav = async (name, url) => {
  await click(page.getByRole("link", { name, exact: true }).first(), 420);
  await page.waitForURL(url, { waitUntil: "commit" });
  await sleep(450);
};

// ───────────────────────── Shoot ─────────────────────────
console.log("🎥 Recording…");
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => window.__card?.(" "));
await sleep(250);
const contentStart = (Date.now() - t0) / 1000;

await scene("hook", async () => {
  await card(`<img src="/brand/braven-white.svg" alt=""/><h1>Braven Hub</h1><p>Events · Alumni · Jobs · AI Coach</p>`);
}, { tail: 0 });

await scene("home", async () => {
  await card("");
  await sleep(500);
  await moveTo(560, 420, 500);
  await scrollTo(page.getByText("Life at", { exact: false }).first(), 1100);
  await sleep(700);
});

await scene("personalize", async () => {
  await scrollTo(0, 600);
  await click(page.getByRole("button", { name: /Personalize/ }).first());
  const sheet = page.getByRole("dialog");
  const name = sheet.getByPlaceholder("Alex Rivera");
  await click(name, 300);
  await page.keyboard.type("Alex Rivera", { delay: 18 });
  await sheet.locator("select").nth(0).selectOption("Business Administration");
  await sheet.locator("select").nth(1).selectOption("2027");
  await click(sheet.getByRole("button", { name: "Business & Finance" }), 300);
  await click(sheet.getByRole("button", { name: "Consulting" }), 250);
  await sheet.getByPlaceholder("you@sjsu.edu").fill("alex.rivera@sjsu.edu");
  await sheet.getByPlaceholder("(408) 555-0123").fill("(408) 555-0123");
  await click(sheet.getByRole("button", { name: "Save" }), 350);
  await sheet.waitFor({ state: "hidden", timeout: 5000 });
}, { tail: 0 });

await scene("events", async () => {
  await scrollTo(380, 600);
  await click(page.getByRole("button", { name: /For my interests/ }), 350);
  await sleep(350);
  await click(page.getByRole("button", { name: "Map" }), 350);
  await sleep(1300);
  await click(page.getByRole("button", { name: "Grid" }), 350);
}, { tail: 0, pre: () => nav("Events", "**/events") });

await scene("rsvp", async () => {
  await scrollTo(page.getByText("Getting there").first(), 800);
  await sleep(700);
  await scrollTo(page.getByText("About this event").first(), 700);
  await click(page.getByRole("button", { name: "RSVP", exact: true }), 450);
  await page.getByText("You're going!").first().waitFor({ timeout: 10000 });
  await sleep(500);
  await point(page.getByRole("link", { name: /Add to Google Calendar/ }), 400);
}, {
  pre: async () => {
    await click(page.getByRole("link", { name: /LinkedIn Launch/ }).first(), 420);
    await page.waitForURL("**/events/linkedin-launch", { waitUntil: "commit" });
    await sleep(400);
  },
});

await scene("alumni", async () => {
  await scrollTo(330, 600);
  await click(page.getByRole("button", { name: "Connect" }).first(), 420);
  await sleep(300);
  await click(page.getByRole("button", { name: /Draft with AI/ }), 400);
  await sleep(1300);
  await page.keyboard.press("Escape");
}, { tail: 0, pre: () => nav("Alumni", "**/alumni") });

await scene("jobs", async () => {
  await scrollTo(300, 600);
  await click(page.getByText(/% match/).first(), 400);
  await sleep(500);
}, { tail: 0, pre: () => nav("Jobs", "**/jobs") });

await scene("coach", async () => {
  await click(page.getByRole("link", { name: /Tailor my resume/ }).first(), 400);
  await page.waitForURL("**/coach**", { waitUntil: "commit" });
  await sleep(400);
  await scrollTo(330, 500);
  await click(page.getByRole("button", { name: "Use a sample" }), 380);
  await click(page.getByRole("button", { name: /Review my resume/ }), 380);
  await page.getByText("Resume score").first().waitFor({ timeout: 15000 });
  await scrollTo(page.getByText("Coach feedback").first(), 500);
  await sleep(1100);
  await scrollTo(330, 450);
  await click(page.getByRole("button", { name: "Mock interview" }), 400);
  const ans = page.getByPlaceholder(/Type how you'd answer/);
  await click(ans, 350);
  await ans.fill("When I was treasurer of our business club, our budget was cut in half. My goal was to still run 12 events. I pitched 15 local businesses and landed 4 sponsors. As a result, we increased funding 40%.");
  await click(page.getByRole("button", { name: /Grade my answer/ }), 380);
  await page.getByText("STAR check").first().waitFor({ timeout: 15000 });
  await scrollTo(page.getByText("Coach feedback").first(), 500);
  await sleep(1200);
}, { tail: 0 });

await scene("bravo", async () => {
  await click(page.getByRole("button", { name: "Open AI assistant" }), 450);
  const input = page.getByPlaceholder("Ask anything…");
  await click(input, 300);
  await page.keyboard.type("What events are coming up?", { delay: 22 });
  await page.keyboard.press("Enter");
  await page.getByText("Here's what's coming up").first().waitFor({ timeout: 15000 });
  await sleep(600);
});

await scene("end", async () => {
  await card(`<img src="/brand/braven-white.svg" alt=""/><h1>Go together, <i>go further.</i></h1><p>Braven Hub · No login, ever.</p>`);
}, { tail: 900 });
const totalEnd = (Date.now() - t0) / 1000;

await page.close();
await context.close();
await browser.close();

// ───────────────────────── Edit ─────────────────────────
console.log("🎞  Encoding…");
const raw = path.join(TMP, readdirSync(TMP).find((f) => f.endsWith(".webm")));
const trim = contentStart;
const len = totalEnd - trim;
const silent = path.join(OUT, "braven-hub-demo-silent.mp4");
ff(["-ss", trim.toFixed(3), "-i", raw, "-t", len.toFixed(3), "-vf", "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-movflags", "+faststart", silent]);

const inputs = timeline.flatMap((t) => ["-i", t.s.wav]);
const delays = timeline.map((t, i) => {
  const ms = Math.max(0, Math.round((t.at - trim) * 1000));
  return `[${i + 1}:a]adelay=${ms}|${ms}[a${i}]`;
});
// Mix voice, then light compression + loudness normalisation so it's punchy on phones.
const mix = `${delays.join(";")};${timeline.map((_, i) => `[a${i}]`).join("")}amix=inputs=${timeline.length}:normalize=0,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]`;
const final = path.join(OUT, "braven-hub-demo.mp4");
ff(["-i", silent, ...inputs, "-filter_complex", mix, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", final]);

if (!process.env.KEEP_TMP) rmSync(TMP, { recursive: true, force: true });
console.log(`\n✅ ${final}\n   ${silent}\n   ${len.toFixed(1)}s`);
