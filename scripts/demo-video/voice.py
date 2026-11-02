"""Neural voiceover via edge-tts. Writes <id>.mp3 + <id>.json (word timings in seconds).

usage: voice.py <out_dir> <voice> <rate> <pitch>   (scenes JSON [{id, text}] on stdin)
"""
import asyncio, json, sys
import edge_tts


async def render(out_dir, voice, rate, pitch, scene):
    com = edge_tts.Communicate(scene["text"], voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(f"{out_dir}/{scene['id']}.mp3", "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"w": chunk["text"], "t": chunk["offset"] / 1e7, "d": chunk["duration"] / 1e7})
    with open(f"{out_dir}/{scene['id']}.json", "w") as f:
        json.dump(words, f)


async def main():
    out_dir, voice, rate, pitch = sys.argv[1:5]
    scenes = json.load(sys.stdin)
    for s in scenes:  # sequential + retry: the service rate-limits bursts
        for attempt in range(4):
            try:
                await render(out_dir, voice, rate, pitch, s)
                break
            except Exception as e:
                if attempt == 3:
                    raise
                print(f"retry {s['id']}: {e}", file=sys.stderr)
                await asyncio.sleep(1.5 * (attempt + 1))


asyncio.run(main())
