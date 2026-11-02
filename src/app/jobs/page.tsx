import { PageHeader } from "@/components/motion";
import { JobsBrowser } from "./jobs-browser";

export const metadata = { title: "Jobs — Braven Hub" };

export default function JobsPage() {
  return (
    <>
      <PageHeader eyebrow="Matched to you" title="Roles picked for" accent="your path.">
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Internships, new-grad roles and fellowships ranked by your major, interests and graduation year — with the reasons spelled out.
        </p>
      </PageHeader>
      <JobsBrowser />
    </>
  );
}
