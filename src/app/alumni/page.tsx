import { PageHeader } from "@/components/motion";
import { AlumniBrowser } from "./alumni-browser";

export const metadata = { title: "Alumni — Braven Hub" };

export default function AlumniPage() {
  return (
    <>
      <PageHeader eyebrow="Braven × SJSU network" title="Talk to someone who's" accent="already there.">
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Search Braven Fellows, San José State alumni and Leadership Coaches by the career you want — and ask for a coffee chat, resume review, mock interview or referral.
        </p>
      </PageHeader>
      <AlumniBrowser />
    </>
  );
}
