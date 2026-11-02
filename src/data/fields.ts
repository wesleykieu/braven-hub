export const CAREER_FIELDS = [
  "Software & Data",
  "Product & Design",
  "Business & Finance",
  "Marketing & Comms",
  "Consulting",
  "Engineering & Hardware",
  "Healthcare",
  "Nonprofit & Public Service",
  "Education",
] as const;

export type CareerField = (typeof CAREER_FIELDS)[number];

export const MAJORS = [
  "Business Administration",
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Psychology",
  "Sociology",
  "Communication Studies",
  "Journalism & Mass Comm",
  "Kinesiology",
  "Nursing",
  "Public Health",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Industrial Design",
  "Economics",
  "Political Science",
  "Child & Adolescent Development",
  "Justice Studies",
  "Other",
] as const;
