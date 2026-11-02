"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Profile = {
  name: string;
  email: string;
  phone: string;
  school: "San José State" | "Braven Fellow (other school)" | "";
  major: string;
  gradYear?: number;
  fields: string[];
  smsOptIn: boolean;
};

const EMPTY: Profile = { name: "", email: "", phone: "", school: "", major: "", fields: [], smsOptIn: true };
const KEY = "braven-hub:profile";
const RSVP_KEY = "braven-hub:rsvps";
const SAVED_JOBS_KEY = "braven-hub:saved-jobs";

type Ctx = {
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  isPersonalized: boolean;
  rsvps: string[];
  addRsvp: (id: string) => void;
  savedJobs: string[];
  toggleSavedJob: (id: string) => void;
  personalizeOpen: boolean;
  setPersonalizeOpen: (v: boolean) => void;
};

const ProfileContext = createContext<Ctx | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** No accounts: everything personal lives in this browser only. */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setState] = useState<Profile>(EMPTY);
  const [rsvps, setRsvps] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);

  useEffect(() => {
    setState(read(KEY, EMPTY));
    setRsvps(readList(RSVP_KEY));
    setSavedJobs(readList(SAVED_JOBS_KEY));
  }, []);

  const setProfile = useCallback((p: Partial<Profile>) => {
    setState((prev) => {
      const next = { ...prev, ...p };
      write(KEY, next);
      return next;
    });
  }, []);

  const addRsvp = useCallback((id: string) => {
    setRsvps((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      write(RSVP_KEY, next);
      return next;
    });
  }, []);

  const toggleSavedJob = useCallback((id: string) => {
    setSavedJobs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(SAVED_JOBS_KEY, next);
      return next;
    });
  }, []);

  const isPersonalized = !!(profile.major || profile.fields.length);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, isPersonalized, rsvps, addRsvp, savedJobs, toggleSavedJob, personalizeOpen, setPersonalizeOpen }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}

/** Subset sent to the AI (never phone/email). */
export function aiProfile(p: Profile) {
  return { name: p.name.split(" ")[0] || undefined, major: p.major || undefined, gradYear: p.gradYear, fields: p.fields, school: p.school || undefined };
}
