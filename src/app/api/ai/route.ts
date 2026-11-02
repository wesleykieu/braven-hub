import { NextResponse } from "next/server";
import { getProvider, type ChatMessage } from "@/lib/ai/provider";
import { siteContext, profileLine, type ClientProfile } from "@/lib/ai/context";
import { demoAssistant, demoResume, demoInterviewFeedback, demoCoverLetter, demoPitch, demoConnectNote } from "@/lib/ai/demo";

type Body =
  | { task: "assistant"; messages: { role: "user" | "assistant"; content: string }[]; profile?: ClientProfile }
  | { task: "resume"; resume: string; target?: string; profile?: ClientProfile }
  | { task: "interview"; question: string; answer: string; role?: string; profile?: ClientProfile }
  | { task: "cover"; job: string; company: string; jobDescription?: string; background?: string; profile?: ClientProfile }
  | { task: "pitch"; experience?: string; goal?: string; profile?: ClientProfile }
  | { task: "connect"; alum: string; company: string; role: string; reason: string; profile?: ClientProfile };

const PERSONA = `You are Bravo, the AI career guide on Braven Hub — a site for Braven Fellows and San José State students.
Voice: warm, direct, encouraging, practical; like a great Leadership Coach. Many users are first-generation college students.
Format with short markdown (bold, bullets, ### headings). Never invent facts about real people or guarantee outcomes.`;

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const llm = getProvider();
  const who = profileLine(body.profile);

  try {
    switch (body.task) {
      case "assistant": {
        const last = body.messages.at(-1)?.content ?? "";
        if (!llm) return reply(demoAssistant(last, body.profile));
        const messages: ChatMessage[] = [
          {
            role: "system",
            content: `${PERSONA}\nYou help visitors navigate the website. Keep answers under 120 words and ALWAYS include relevant markdown links to pages.\n${who}\n\n${siteContext()}`,
          },
          ...body.messages.slice(-10),
        ];
        return reply(await llm.complete(messages));
      }
      case "resume": {
        if (!body.resume?.trim()) return NextResponse.json({ error: "Paste your resume first" }, { status: 400 });
        if (!llm) return reply(demoResume(body.resume, body.target));
        return reply(
          await llm.complete([
            { role: "system", content: `${PERSONA}\nYou are an expert early-career resume reviewer and recruiter.` },
            {
              role: "user",
              content: `${who}\n${body.target ? `Target role / job post:\n${body.target}\n` : ""}\nReview this resume. Output: "### Resume score: N/100", then **What's working** (bullets), **Fix next** (prioritized bullets, specific), **Bullet rewrites** (3 before → after using action verb + task + metric), and **Keywords to add** if a target is given.\n\nRESUME:\n${body.resume}`,
            },
          ]),
        );
      }
      case "interview": {
        if (!body.answer?.trim()) return NextResponse.json({ error: "Type your answer first" }, { status: 400 });
        if (!llm) return reply(demoInterviewFeedback(body.question, body.answer));
        return reply(
          await llm.complete([
            { role: "system", content: `${PERSONA}\nYou are a hiring manager running a mock interview${body.role ? ` for a ${body.role} role` : ""}.` },
            {
              role: "user",
              content: `${who}\nQuestion: ${body.question}\nCandidate answer: ${body.answer}\n\nGrade it: "### Score: N/10", a STAR checklist (✅/⬜️ Situation, Task, Action, Result with a tip for any missing), **Delivery** notes, and a **Stronger version** (rewrite of their answer in first person, ~150 words, keeping their real facts and marking [placeholders] for missing details).`,
            },
          ]),
        );
      }
      case "cover": {
        const p = body.profile ?? {};
        if (!llm) return reply(demoCoverLetter({ name: p.name, job: body.job, company: body.company, background: body.background }));
        return reply(
          await llm.complete([
            { role: "system", content: `${PERSONA}\nWrite concise, specific cover letters (under 300 words). No clichés like "I am writing to express".` },
            {
              role: "user",
              content: `${who}\nRole: ${body.job} at ${body.company}\n${body.jobDescription ? `Job description:\n${body.jobDescription}\n` : ""}Background:\n${body.background ?? ""}\nWrite the letter. Use [brackets] where a specific detail is needed.`,
            },
          ]),
        );
      }
      case "pitch": {
        const p = body.profile ?? {};
        if (!llm) return reply(demoPitch({ name: p.name, major: p.major, experience: body.experience, goal: body.goal }));
        return reply(
          await llm.complete([
            { role: "system", content: PERSONA },
            {
              role: "user",
              content: `${who}\nExperience: ${body.experience ?? ""}\nGoal: ${body.goal ?? ""}\nWrite a 30-second "tell me about yourself" (present → past → future, ends with a question), then 2 bullet tips.`,
            },
          ]),
        );
      }
      case "connect": {
        const p = body.profile ?? {};
        if (!llm) return reply(demoConnectNote({ alum: body.alum, company: body.company, reason: body.reason, me: p.name, major: p.major }));
        return reply(
          await llm.complete([
            { role: "system", content: `${PERSONA}\nWrite short, respectful networking messages (under 80 words). Output only the message.` },
            {
              role: "user",
              content: `${who}\nWrite a message to ${body.alum} (${body.role} at ${body.company}) asking for a ${body.reason}. Mention we're both in the Braven/SJSU community.`,
            },
          ]),
        );
      }
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "The AI is unavailable right now — try again in a moment." }, { status: 502 });
  }
  return NextResponse.json({ error: "Unknown task" }, { status: 400 });

  function reply(text: string) {
    return NextResponse.json({ text, mode: llm ? llm.name : "demo" });
  }
}
