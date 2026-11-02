"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAREER_FIELDS, MAJORS } from "@/data/fields";
import { cn } from "@/lib/utils";
import { useProfile, type Profile } from "./profile-provider";

export function PersonalizeSheet() {
  const { profile, setProfile, personalizeOpen, setPersonalizeOpen } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  useEffect(() => {
    if (personalizeOpen) setDraft(profile);
  }, [personalizeOpen, profile]);

  const toggleField = (f: string) =>
    setDraft((d) => ({ ...d, fields: d.fields.includes(f) ? d.fields.filter((x) => x !== f) : [...d.fields, f] }));

  const year = new Date().getFullYear();

  return (
    <Sheet open={personalizeOpen} onOpenChange={setPersonalizeOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b px-6 pt-6 pb-5">
          <SheetTitle className="text-xl tracking-tight">Make it yours</SheetTitle>
          <SheetDescription className="flex items-start gap-2">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            No account needed. This stays on this device and is used to match jobs, alumni, and pre-fill RSVPs.
          </SheetDescription>
        </SheetHeader>

        <form
          className="space-y-6 px-6 pb-8"
          onSubmit={(e) => {
            e.preventDefault();
            setProfile(draft);
            setPersonalizeOpen(false);
            toast.success("Saved — your jobs and alumni are now personalized.");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First & last name" className="sm:col-span-2">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Alex Rivera" />
            </Field>
            <Field label="School / program" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {(["San José State", "Braven Fellow (other school)"] as const).map((s) => (
                  <Chip key={s} active={draft.school === s} onClick={() => setDraft({ ...draft, school: draft.school === s ? "" : s })}>
                    {s}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Major">
              <select
                className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
                value={draft.major}
                onChange={(e) => setDraft({ ...draft, major: e.target.value })}
              >
                <option value="">Select…</option>
                {MAJORS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Graduation year">
              <select
                className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
                value={draft.gradYear ?? ""}
                onChange={(e) => setDraft({ ...draft, gradYear: e.target.value ? Number(e.target.value) : undefined })}
              >
                <option value="">Select…</option>
                {[year - 1, year, year + 1, year + 2, year + 3, year + 4].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Careers you're curious about">
            <div className="flex flex-wrap gap-2">
              {CAREER_FIELDS.map((f) => (
                <Chip key={f} active={draft.fields.includes(f)} onClick={() => toggleField(f)}>
                  {f}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">For RSVPs & reminders</p>
            <Field label="Email (for calendar invites)">
              <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="you@sjsu.edu" />
            </Field>
            <Field label="Mobile (for text reminders)">
              <Input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="(408) 555-0123" />
            </Field>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-full bg-brand-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-navy/90">
              Save
            </button>
            <button
              type="button"
              className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted"
              onClick={() => {
                const cleared: Profile = { name: "", email: "", phone: "", school: "", major: "", fields: [], smsOptIn: true };
                setDraft(cleared);
                setProfile(cleared);
                toast("Cleared from this device.");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-[13px] text-brand-navy/80">{label}</Label>
      {children}
    </div>
  );
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all",
        active ? "border-brand-navy bg-brand-navy text-white shadow-sm" : "border-border bg-white text-brand-navy/75 hover:border-brand-navy/30 hover:text-brand-navy",
        className,
      )}
    >
      {children}
    </button>
  );
}
