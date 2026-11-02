import type { Job } from "@/data/jobs";
import type { Profile } from "@/components/profile-provider";

export type JobMatch = { job: Job; score: number; reasons: string[] };

/** Transparent, explainable ranking: interests, major, timing (internship vs new grad), partner bonus. */
export function rankJobs(jobs: Job[], p: Profile, now = new Date()): JobMatch[] {
  const year = now.getFullYear();
  return jobs
    .map((job) => {
      let score = 40;
      const reasons: string[] = [];
      if (p.fields.includes(job.field)) {
        score += 28;
        reasons.push(`Matches your interest in ${job.field}`);
      }
      if (p.major && job.majors.includes(p.major)) {
        score += 20;
        reasons.push(`Looks for ${p.major} majors`);
      } else if (job.majors.includes("Any")) {
        score += 8;
        reasons.push("Open to all majors");
      }
      if (p.gradYear) {
        const yearsLeft = p.gradYear - year;
        if (job.level === "Internship" && yearsLeft >= 1) {
          score += 10;
          reasons.push("Internship timing fits your grad year");
        }
        if ((job.level === "New Grad" || job.level === "Fellowship") && yearsLeft <= 1) {
          score += 10;
          reasons.push("Full-time start lines up with graduation");
        }
        if (job.level === "New Grad" && yearsLeft >= 2) score -= 15;
      }
      if (job.bravenPartner) {
        score += 4;
        reasons.push("Braven employer partner");
      }
      return { job, score: Math.max(5, Math.min(99, score)), reasons };
    })
    .sort((a, b) => b.score - a.score || +new Date(b.job.posted) - +new Date(a.job.posted));
}
