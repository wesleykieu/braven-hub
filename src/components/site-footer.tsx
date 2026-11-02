import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-brand-navy text-white">
      <div className="bg-grid-dark mask-fade-y pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/braven-white.svg" alt="Braven" className="h-5 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Events, alumni, jobs and AI coaching for Braven Fellows and San José State students. Go together, go further.
          </p>
        </div>
        <FooterCol title="Explore" links={[["Events", "/events"], ["Alumni", "/alumni"], ["Jobs", "/jobs"], ["AI Coach", "/coach"]]} />
        <FooterCol
          title="Braven"
          links={[["braven.org", "https://braven.org"], ["Bay Area", "https://braven.org/bay-area/"], ["Volunteer as a coach", "https://braven.org/volunteer/"]]}
        />
        <FooterCol
          title="SJSU"
          links={[["Career Center", "https://careercenter.sjsu.edu"], ["Braven @ SJSU", "https://www.sjsu.edu/braven/"], ["Handshake", "https://sjsu.joinhandshake.com"]]}
        />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col justify-between gap-2 border-t border-white/10 px-4 py-6 text-xs text-white/40 sm:flex-row sm:px-6">
        <span>Prototype · Sample events, alumni and jobs for demonstration.</span>
        <span>Career Center: Clark Hall 140 · (408) 924-6031</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-widest text-white/40 uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            {href.startsWith("/") ? (
              <Link href={href} className="text-white/75 hover:text-white">
                {label}
              </Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer" className="text-white/75 hover:text-white">
                {label} ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
