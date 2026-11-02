import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tiny markdown renderer for AI output: ###, **bold**, *italic*, [links](/x), lists, > quotes. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let list: string[] = [];
  let para: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={blocks.length} className="my-2 space-y-1 pl-1">
        {list.map((l, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-brand-blue/70" />
            <span>{inline(l)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };
  const flushPara = () => {
    if (!para.length) return;
    blocks.push(
      <p key={blocks.length} className="my-2">
        {para.map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {inline(l)}
          </Fragment>
        ))}
      </p>,
    );
    para = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const li = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (li) {
      flushPara();
      list.push(li[1]);
      continue;
    }
    flushList();
    if (!line.trim()) {
      flushPara();
      continue;
    }
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) {
      flushPara();
      blocks.push(
        <h4 key={blocks.length} className="mt-3 mb-1 text-base font-semibold tracking-tight">
          {inline(h[1])}
        </h4>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      flushPara();
      blocks.push(
        <blockquote key={blocks.length} className="my-2 border-l-2 border-brand-blue/50 pl-3 text-muted-foreground italic">
          {inline(line.replace(/^>\s?/, ""))}
        </blockquote>,
      );
      continue;
    }
    para.push(line);
  }
  flushList();
  flushPara();
  return <div className={cn("text-sm leading-relaxed [&>*:first-child]:mt-0", className)}>{blocks}</div>;
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const k = out.length;
    if (m[1]) {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href} className="font-medium text-brand-blue underline-offset-2 hover:underline">
            {m[2]}
          </Link>
        ) : (
          <a key={k} href={href} target="_blank" rel="noreferrer" className="font-medium text-brand-blue underline-offset-2 hover:underline">
            {m[2]}
          </a>
        ),
      );
    } else if (m[4]) out.push(<strong key={k} className="font-semibold">{m[5]}</strong>);
    else if (m[6]) out.push(<em key={k}>{m[7]}</em>);
    else if (m[8]) out.push(<em key={k} className="text-muted-foreground">{m[9]}</em>);
    else if (m[10]) out.push(<code key={k} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{m[11]}</code>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
