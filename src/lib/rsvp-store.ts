import "server-only";
import { promises as fs } from "fs";
import path from "path";

export type Rsvp = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  smsOptIn: boolean;
  createdAt: string;
};

// File-backed store for local dev. Swap for Supabase/Postgres before deploying (serverless disks are ephemeral).
const FILE = path.join(process.cwd(), ".data", "rsvps.json");

async function readAll(): Promise<Rsvp[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function saveRsvp(r: Rsvp) {
  const all = await readAll();
  const rest = all.filter((x) => !(x.eventId === r.eventId && x.email.toLowerCase() === r.email.toLowerCase()));
  rest.push(r);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rest, null, 2));
}

export async function rsvpsFor(eventId: string) {
  return (await readAll()).filter((r) => r.eventId === eventId);
}

export async function countFor(eventId: string) {
  return (await rsvpsFor(eventId)).length;
}
