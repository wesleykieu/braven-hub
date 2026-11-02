import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ALUMNI } from "@/data/alumni";

// Logs connection requests for the Braven team to broker intros (no login, so alumni contact info stays private).
export async function POST(req: Request) {
  const { alumId, name, email, reason, message } = await req.json();
  const alum = ALUMNI.find((a) => a.id === alumId);
  if (!alum) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  const file = path.join(process.cwd(), ".data", "connections.jsonl");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, JSON.stringify({ alumId, name, email, reason, message, at: new Date().toISOString() }) + "\n");
  return NextResponse.json({ ok: true });
}
