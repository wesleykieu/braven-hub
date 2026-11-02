import "server-only";
import { upcomingEvents } from "@/data/events";
import { JOBS } from "@/data/jobs";
import { formatEventDate } from "@/lib/calendar";
import type { ClientProfile } from "./context";

/** Offline fallbacks so every AI feature works with zero keys. Swap in a real model via env. */

export function demoAssistant(message: string, profile?: ClientProfile) {
  const m = message.toLowerCase();
  const next = upcomingEvents().slice(0, 3);
  const eventList = next
    .map((e) => `- [${e.title}](/events/${e.id}) — ${formatEventDate(e.start, { month: "short", day: "numeric" })} @ ${e.venue}`)
    .join("\n");

  if (/rsvp|event|workshop|panel|mixer|happening|this week|calendar/.test(m))
    return `Here's what's coming up next:\n\n${eventList}\n\nOpen any event and hit **RSVP** — you'll get a Google Calendar invite and (if you add your phone) a text reminder the day before and 2 hours before. See everything on [Events](/events).`;
  if (/where|map|direction|parking|get there|location/.test(m))
    return `Every event page has an interactive map plus walking + parking directions. Most Braven × SJSU events are around Clark Hall (Career Center, Room 140) and the Student Union. Pick one from [Events](/events) and tap **Get directions**.`;
  if (/alum|mentor|connect|network|coffee|referr/.test(m))
    return `Head to [Alumni](/alumni) — filter by career field (e.g. *Software & Data* or *Healthcare*) and by Braven Fellow / SJSU / Leadership Coach. Each profile says what they're open to (coffee chat, resume review, mock interview, referral). Hit **Connect** and the AI can draft your intro message.`;
  if (/job|intern|role|position|apply|hiring/.test(m)) {
    const f = profile?.fields?.[0];
    const picks = JOBS.filter((j) => !f || j.field === f).slice(0, 3);
    return `${f ? `Based on your interest in **${f}**, a` : "A"} few roles to start with:\n\n${picks.map((j) => `- ${j.title} @ ${j.company} (${j.level})`).join("\n")}\n\nSee your full ranked list on [Jobs](/jobs)${profile?.major ? "" : " — click **Personalize** first so I can match to your major"}.`;
  }
  if (/resume|cv/.test(m))
    return `Paste your resume into the [Resume Coach](/coach?tab=resume) and I'll score it on impact, clarity, and ATS-readiness, then rewrite weak bullets. Tip: every bullet should be *action verb + what you did + measurable result*.`;
  if (/interview|behavioral|star/.test(m))
    return `Try [Mock Interview](/coach?tab=interview): I'll ask a real behavioral question, you answer, and I'll grade it on the STAR method. Want live practice too? [Mock Interview Night](/events/mock-interview-night) pairs you with real hiring managers.`;
  if (/cover letter/.test(m)) return `The [Cover Letter](/coach?tab=cover) tool drafts a tailored letter from a job description + your background.`;
  if (/pitch|introduce|elevator|tell me about yourself/.test(m))
    return `Use the [Elevator Pitch](/coach?tab=pitch) builder — it turns your major, experience and goal into a 30-second "tell me about yourself".`;
  if (/braven|what is|about|fellow/.test(m))
    return `Braven partners with universities like San José State (its very first partner, since 2013) to give students the skills, networks, and confidence to land strong first jobs. Fellows take the Leadership & Career Accelerator course (SSCI 101 at SJSU), work with a Leadership Coach, and join a national alumni network. This hub brings the events, alumni, jobs and AI coaching into one place.`;
  return `I can help you:\n\n- Find and RSVP to [events](/events)\n- Connect with [alumni](/alumni) in your field\n- See [jobs](/jobs) matched to you\n- Polish your [resume](/coach?tab=resume) or [practice interviews](/coach?tab=interview)\n\nWhat are you working on?`;
}

const VERBS = ["led", "built", "created", "designed", "launched", "managed", "increased", "reduced", "improved", "developed", "organized", "analyzed", "coordinated", "drove", "implemented", "trained", "grew", "delivered", "streamlined", "automated", "presented", "negotiated", "mentored"];
const WEAK = ["responsible for", "helped", "worked on", "assisted", "duties included", "various", "tasks"];

export function demoResume(resume: string, target?: string) {
  const text = resume.trim();
  const lower = text.toLowerCase();
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-•*▪◦]/.test(l) || (l.length > 30 && /^[A-Z][a-z]+ed\b/.test(l)));
  const words = text.split(/\s+/).length;
  const metrics = (text.match(/\d+%|\$\d|\b\d{2,}\b/g) ?? []).length;
  const strongVerbs = VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(text));
  const weak = WEAK.filter((w) => lower.includes(w));
  const sections = ["education", "experience", "skills", "projects", "leadership"].filter((s) => lower.includes(s));
  const hasEmail = /@/.test(text);
  const hasLinkedIn = /linkedin/i.test(text);

  let score = 50;
  score += Math.min(metrics, 8) * 3;
  score += Math.min(strongVerbs.length, 8) * 2;
  score -= weak.length * 4;
  score += sections.length * 3;
  if (hasEmail) score += 2;
  if (hasLinkedIn) score += 3;
  if (words > 700) score -= 8;
  if (words < 150) score -= 10;
  score = Math.max(20, Math.min(96, score));

  const weakBullet = bullets.find((b) => WEAK.some((w) => b.toLowerCase().includes(w))) ?? bullets.find((b) => !/\d/.test(b));
  const rewrite = weakBullet
    ? `**Before:** ${weakBullet.replace(/^[-•*▪◦]\s*/, "")}\n**After:** ${rewriteBullet(weakBullet)}`
    : "Your bullets already lead with action — nice. Add one more number to your top bullet.";

  return `### Resume score: ${score}/100

**What's working**
${[
  strongVerbs.length >= 3 && `- Strong action verbs (${strongVerbs.slice(0, 5).join(", ")})`,
  metrics >= 3 && `- ${metrics} quantified results — recruiters love numbers`,
  sections.length >= 3 && `- Clear sections: ${sections.join(", ")}`,
  hasLinkedIn && "- LinkedIn included",
]
  .filter(Boolean)
  .join("\n") || "- You have a draft — that's the hardest part."}

**Fix next**
${[
  metrics < 3 && "- Quantify more bullets: how many people, %, $, hours saved, rank?",
  weak.length > 0 && `- Replace weak phrases: ${weak.map((w) => `"${w}"`).join(", ")}`,
  !sections.includes("skills") && "- Add a **Skills** section (tools, languages, certifications) for ATS keyword matches",
  !hasLinkedIn && "- Add your LinkedIn URL in the header",
  words > 700 && "- Trim to one page — early-career resumes should be ~400–600 words",
  words < 150 && "- Add more detail: 3–5 bullets per role, plus projects or Braven capstone",
  target && `- Mirror keywords from the **${target}** posting in your bullets and skills`,
]
  .filter(Boolean)
  .join("\n") || "- Tailor the top third to each job you apply to."}

**Bullet rewrite**
${rewrite}

_Formula: Action verb + what you did + measurable result (+ how/tool)._`;
}

function rewriteBullet(b: string) {
  let s = b.replace(/^[-•*▪◦]\s*/, "");
  s = s.replace(/^(responsible for|helped( to)?|worked on|assisted( with)?|duties included)\s*/i, "");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  const verb = /customer|client|student|guest/i.test(s) ? "Supported" : /event|program|meeting/i.test(s) ? "Organized" : "Delivered";
  return `${verb} ${s.charAt(0).toLowerCase() + s.slice(1)}${/\d/.test(s) ? "" : ", serving [N] people / improving [metric] by [X%]"} — using [tool/skill].`;
}

export const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  behavioral: [
    "Tell me about a time you had to work with someone whose style was very different from yours.",
    "Describe a situation where you had to learn something quickly to get a job done.",
    "Tell me about a time you failed. What did you learn?",
    "Give an example of when you took initiative without being asked.",
    "Tell me about a time you had to manage competing priorities.",
  ],
  intro: ["Tell me about yourself.", "Why are you interested in this role?", "Where do you see yourself in three years?"],
  technical: [
    "Walk me through a project you're proud of. What would you do differently?",
    "How would you explain a complex technical concept to a non-technical stakeholder?",
    "How do you prioritize when everything feels urgent?",
  ],
};

export function demoInterviewFeedback(question: string, answer: string) {
  const a = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const S = /(when i was|at my|during|in my|last (year|semester|summer)|situation)/.test(a);
  const T = /(my (goal|task|role|job) was|i needed to|i was responsible|we had to|challenge)/.test(a);
  const A = /\bi (led|built|created|organized|reached|talked|decided|set up|started|designed|scheduled|met|asked|proposed|wrote|pitched|landed|launched|managed|negotiated|grew|ran|analyzed|trained|coordinated|developed|implemented|presented|recruited|fixed|redesigned|automated|volunteered|called|emailed|mapped|planned)/.test(a);
  const R = /(result|as a result|ended up|which led|increased|reduced|improved|\d+%|learned)/.test(a);
  const parts = { Situation: S, Task: T, Action: A, Result: R };
  const got = Object.values(parts).filter(Boolean).length;
  const score = Math.max(1, Math.min(10, got * 2 + (words >= 90 && words <= 300 ? 2 : 0)));
  const usesWe = (a.match(/\bwe\b/g) ?? []).length > (a.match(/\bi\b/g) ?? []).length;

  return `### Score: ${score}/10

**STAR check**
${Object.entries(parts)
  .map(([k, v]) => `- ${v ? "✅" : "⬜️"} **${k}**${v ? "" : ` — ${STAR_TIPS[k as keyof typeof STAR_TIPS]}`}`)
  .join("\n")}

**Delivery**
- ${words} words (${words < 90 ? "too short — aim for 60–90 seconds spoken, ~150–250 words" : words > 300 ? "a bit long — tighten to ~2 minutes" : "good length"})
${usesWe ? '- You said "we" more than "I". Interviewers are hiring *you* — own your actions.\n' : ""}- End with what you learned or would do next time — it shows growth.

**Try this structure**
> "At [where], [situation in one sentence]. My goal was [task]. I [2–3 specific actions]. As a result, [number/outcome], and I learned [insight]."`;
}

const STAR_TIPS = {
  Situation: "set the scene in one sentence (where, when)",
  Task: "say what *you* were responsible for",
  Action: 'describe 2–3 specific things *you* did ("I …")',
  Result: "close with a measurable outcome or lesson",
};

export function demoCoverLetter(p: { name?: string; job?: string; company?: string; background?: string }) {
  const name = p.name || "[Your Name]";
  const company = p.company || "[Company]";
  const job = p.job || "[Role]";
  const bg = p.background?.trim() || "[2–3 sentences on your most relevant experience]";
  return `Dear ${company} Hiring Team,

I'm excited to apply for the ${job} role. As a San José State student and Braven Fellow, I've learned to turn ambiguous problems into clear plans — and I'd love to bring that to ${company}.

${bg}

Through Braven's Leadership & Career Accelerator, I led a team capstone, practiced giving and receiving feedback with a Leadership Coach, and sharpened the communication and problem-solving skills this role calls for. I'm especially drawn to ${company} because [specific product, mission, or value — be concrete].

I'd welcome the chance to talk about how I can contribute. Thank you for your time and consideration.

Sincerely,
${name}`;
}

export function demoPitch(p: { name?: string; major?: string; experience?: string; goal?: string }) {
  return `"Hi, I'm ${p.name || "[Name]"} — I'm studying ${p.major || "[major]"} at San José State and I'm a Braven Fellow. ${
    p.experience ? `Most recently, ${p.experience.trim().replace(/\.$/, "")}. ` : "[One concrete thing you've done, with a result.] "
  }What I enjoy most is [the part of that work that energizes you]. I'm now looking for ${p.goal || "[type of role]"}, and I'd love to hear how you got started in your career."

**Why it works:** present → past → future, one specific result, and it ends with a question so the conversation keeps going. Keep it under 30 seconds.`;
}

export function demoConnectNote(p: { alum: string; company: string; reason: string; me?: string; major?: string }) {
  return `Hi ${p.alum.split(" ")[0]} — I'm ${p.me || "[your name]"}, ${p.major ? `a ${p.major} student` : "a student"} at San José State and part of the Braven community. I saw you're at ${p.company} and open to a ${p.reason.toLowerCase()}. I'd really value 20 minutes to hear how you got started and what you'd do differently. Would any time in the next two weeks work? Thank you!`;
}
