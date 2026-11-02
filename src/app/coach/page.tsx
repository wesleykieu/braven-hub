import { Suspense } from "react";
import { PageHeader } from "@/components/motion";
import { CoachStudio } from "./coach-studio";

export const metadata = { title: "AI Career Coach — Braven Hub" };

export default function CoachPage() {
  return (
    <>
      <PageHeader eyebrow="AI career coach" title="Practice with an AI coach," accent="anytime.">
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Resume feedback, mock interviews, cover letters and your elevator pitch — built on the same playbook Braven Leadership Coaches use.
        </p>
      </PageHeader>
      <Suspense>
        <CoachStudio />
      </Suspense>
    </>
  );
}
