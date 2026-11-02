import type { CareerField } from "./fields";

export type EventKind = "Workshop" | "Networking" | "Panel" | "Mock Interviews" | "Career Fair" | "Site Visit";

export type BravenEvent = {
  id: string;
  title: string;
  kind: EventKind;
  host: "Braven" | "SJSU Career Center" | "Braven × SJSU";
  summary: string;
  description: string;
  start: string; // ISO with offset (Pacific)
  end: string;
  venue: string;
  room?: string;
  address: string;
  lat: number;
  lng: number;
  directions: string; // walking / parking hints shown under the map
  fields: CareerField[];
  capacity: number;
  image: string;
  agenda: { time: string; item: string }[];
  /** Bump when time/place changes so calendar invites update in place. */
  sequence: number;
};

// Sample events modelled on Braven + SJSU Career Center programming. Swap for a CMS/API later.
export const EVENTS: BravenEvent[] = [
  {
    id: "linkedin-launch",
    title: "LinkedIn Launch: Build a Profile Recruiters Find",
    kind: "Workshop",
    host: "Braven × SJSU",
    summary: "Rewrite your headline, About, and experience live — with a recruiter in the room.",
    description:
      "Bring your laptop. We'll audit profiles in small groups, rewrite headlines using the Braven value-proposition formula, and take free headshots at the Spartan Career Closet table. Leave with a profile that shows up in recruiter searches.",
    start: "2026-11-12T17:30:00-08:00",
    end: "2026-11-12T19:00:00-08:00",
    venue: "Clark Hall — SJSU Career Center",
    room: "Room 140",
    address: "Clark Hall, 1 Washington Sq, San Jose, CA 95192",
    lat: 37.33592,
    lng: -121.88259,
    directions:
      "Clark Hall sits on San Fernando St between 6th & 7th. Enter from the 7th St Paseo; the Career Center is the first door on your left. Nearest parking: West Garage (S 4th St).",
    fields: ["Software & Data", "Business & Finance", "Marketing & Comms", "Consulting"],
    capacity: 60,
    image: "/photos/sjsu.jpeg",
    agenda: [
      { time: "5:30", item: "Check-in + headshots" },
      { time: "5:45", item: "What recruiters actually search for" },
      { time: "6:10", item: "Live rewrite in pods" },
      { time: "6:45", item: "Profile swap + feedback" },
    ],
    sequence: 0,
  },
  {
    id: "first-gen-journeys",
    title: "First-Gen Journeys: Alumni Panel",
    kind: "Panel",
    host: "Braven",
    summary: "Braven alumni on landing the first job, negotiating offers, and what they wish they knew.",
    description:
      "Five Braven Fellows-turned-professionals from tech, healthcare, and public service share how they navigated recruiting as first-generation students. Q&A and dinner after — stay for 1:1 conversations.",
    start: "2026-11-18T18:00:00-08:00",
    end: "2026-11-18T20:00:00-08:00",
    venue: "Student Union Ballroom",
    room: "Ballroom C",
    address: "211 S 9th St, San Jose, CA 95112",
    lat: 37.33639,
    lng: -121.88103,
    directions:
      "Student Union is on the main quad near 9th St. Ballroom C is upstairs — take the east stairs past the food court. Parking: South Garage (S 7th St) after 4pm.",
    fields: ["Software & Data", "Healthcare", "Nonprofit & Public Service", "Education"],
    capacity: 150,
    image: "/photos/home.jpg",
    agenda: [
      { time: "6:00", item: "Doors + dinner" },
      { time: "6:30", item: "Panel conversation" },
      { time: "7:15", item: "Audience Q&A" },
      { time: "7:30", item: "Table networking" },
    ],
    sequence: 0,
  },
  {
    id: "mock-interview-night",
    title: "Mock Interview Night with Leadership Coaches",
    kind: "Mock Interviews",
    host: "Braven",
    summary: "Two 20-minute behavioral interviews with real hiring managers + written feedback.",
    description:
      "Practice the STAR method under real conditions. You'll rotate through two interviewers from Braven's volunteer network (Google, Adobe, Kaiser, PwC and more) and get a scored rubric emailed to you afterwards.",
    start: "2026-11-20T17:00:00-08:00",
    end: "2026-11-20T19:30:00-08:00",
    venue: "Dr. Martin Luther King Jr. Library",
    room: "Room 255 (2nd floor)",
    address: "150 E San Fernando St, San Jose, CA 95112",
    lat: 37.33544,
    lng: -121.88502,
    directions:
      "Enter MLK Library from San Fernando St. Take the elevators to floor 2 and turn right — Room 255 is past the group study rooms. Parking: Fourth Street Garage.",
    fields: ["Software & Data", "Business & Finance", "Consulting", "Healthcare", "Marketing & Comms"],
    capacity: 40,
    image: "/photos/volunteers.jpg",
    agenda: [
      { time: "5:00", item: "STAR method warm-up" },
      { time: "5:30", item: "Interview round 1" },
      { time: "6:15", item: "Interview round 2" },
      { time: "7:00", item: "Debrief + feedback" },
    ],
    sequence: 0,
  },
  {
    id: "tech-site-visit",
    title: "Site Visit: A Day in Product at a Bay Area Tech Co.",
    kind: "Site Visit",
    host: "Braven",
    summary: "Tour a product org, sit in on a design critique, and meet the APM team.",
    description:
      "A small-group visit for Fellows interested in product, design, and data roles. Shadow a product review, hear from APMs who came from state schools, and get your resume in front of the early-careers team.",
    start: "2026-12-03T10:00:00-08:00",
    end: "2026-12-03T13:00:00-08:00",
    venue: "Partner campus — Mountain View",
    address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
    lat: 37.42199,
    lng: -122.08405,
    directions:
      "Carpool meets at 9:15 at the SJSU 7th St Garage (level 1). VTA alternative: Light Rail Orange Line to Mountain View, then 10-min shuttle. Bring a photo ID for the visitor badge.",
    fields: ["Software & Data", "Product & Design"],
    capacity: 25,
    image: "/photos/employers.jpg",
    agenda: [
      { time: "10:00", item: "Badging + welcome" },
      { time: "10:30", item: "Product critique (observe)" },
      { time: "11:30", item: "APM panel + lunch" },
      { time: "12:30", item: "Resume drop with recruiting" },
    ],
    sequence: 0,
  },
  {
    id: "winter-career-mixer",
    title: "Winter Career Mixer: Bay Area Employers",
    kind: "Networking",
    host: "Braven × SJSU",
    summary: "Meet 20+ employer partners hiring interns and new grads — no booths, just conversations.",
    description:
      "A relaxed mixer designed for students who hate career fairs. Conversation starters on every table, Braven coaches floating to make intros, and recruiters from tech, banking, healthcare, and local government.",
    start: "2026-12-09T17:30:00-08:00",
    end: "2026-12-09T20:00:00-08:00",
    venue: "Diaz Compean Student Union — Barrett Ballroom",
    address: "211 S 9th St, San Jose, CA 95112",
    lat: 37.33631,
    lng: -121.88085,
    directions:
      "Barrett Ballroom is on the 2nd floor of the Student Union. Business casual is encouraged — free attire from the Spartan Career Closet (Clark Hall 140) the week before.",
    fields: ["Business & Finance", "Software & Data", "Healthcare", "Nonprofit & Public Service", "Engineering & Hardware"],
    capacity: 200,
    image: "/photos/employer-partners.jpg",
    agenda: [
      { time: "5:30", item: "Name tags + elevator pitch tune-up" },
      { time: "6:00", item: "Employer conversations" },
      { time: "7:30", item: "Coach-led warm intros" },
    ],
    sequence: 0,
  },
  {
    id: "resume-sprint",
    title: "Resume Sprint: From Draft to Done in 90 Minutes",
    kind: "Workshop",
    host: "SJSU Career Center",
    summary: "Bring a draft (or nothing). Leave with a one-page, ATS-ready resume.",
    description:
      "Career counselors and Braven coaches walk through bullet formulas, quantifying impact, and tailoring to a job post. Pair up with the Braven Hub AI Resume Coach for instant feedback between rounds.",
    start: "2026-11-14T12:00:00-08:00",
    end: "2026-11-14T13:30:00-08:00",
    venue: "Engineering Building",
    room: "Room 189",
    address: "1 Washington Sq, San Jose, CA 95112",
    lat: 37.33715,
    lng: -121.88163,
    directions:
      "Engineering Building faces the 7th St Paseo across from the Student Union. Room 189 is on the ground floor near the Charles W. Davidson entrance.",
    fields: ["Engineering & Hardware", "Software & Data", "Business & Finance", "Education"],
    capacity: 50,
    image: "/photos/higher-ed.jpg",
    agenda: [
      { time: "12:00", item: "Bullet formula crash course" },
      { time: "12:25", item: "Rewrite round 1" },
      { time: "12:55", item: "Tailor to a job post" },
      { time: "1:20", item: "Peer review" },
    ],
    sequence: 0,
  },
  {
    id: "public-service-careers",
    title: "Careers in Public Service: City of San José Info Session",
    kind: "Panel",
    host: "SJSU Career Center",
    summary: "How to land paid fellowships and entry roles in local government and nonprofits.",
    description:
      "Hear from City of San José staff and Bay Area nonprofit leaders about fellowships, civil-service exams, and how to stand out. Great for Justice Studies, Political Science, Sociology and Public Health majors.",
    start: "2026-11-24T16:00:00-08:00",
    end: "2026-11-24T17:30:00-08:00",
    venue: "San José City Hall — Wing Rooms",
    address: "200 E Santa Clara St, San Jose, CA 95113",
    lat: 37.33799,
    lng: -121.88576,
    directions:
      "City Hall is two blocks from campus — walk north on 4th St to Santa Clara St. Enter through the rotunda; Wing Rooms are on the first floor past security.",
    fields: ["Nonprofit & Public Service", "Education", "Healthcare"],
    capacity: 80,
    image: "/photos/panel.jpg",
    agenda: [
      { time: "4:00", item: "Welcome + paths into public service" },
      { time: "4:30", item: "Fellowship deep-dive" },
      { time: "5:00", item: "Q&A + meet the panel" },
    ],
    sequence: 0,
  },
  {
    id: "salary-negotiation",
    title: "Know Your Worth: Offer & Salary Negotiation",
    kind: "Workshop",
    host: "Braven",
    summary: "Scripts, market data, and role-play for your first offer conversation.",
    description:
      "Braven Fellows earn more than peers in their first job — this is part of why. Learn to research comp bands, respond to an offer, and negotiate beyond base salary. Includes live role-play in pairs.",
    start: "2026-12-05T11:00:00-08:00",
    end: "2026-12-05T12:30:00-08:00",
    venue: "Online (Zoom) + Clark Hall watch party",
    room: "Clark Hall 140",
    address: "Clark Hall, 1 Washington Sq, San Jose, CA 95192",
    lat: 37.33592,
    lng: -121.88259,
    directions:
      "Join on Zoom (link in your calendar invite) or watch together in Clark Hall 140 with snacks and coaches for role-play.",
    fields: ["Software & Data", "Business & Finance", "Consulting", "Marketing & Comms", "Product & Design"],
    capacity: 300,
    image: "/photos/bravenx.jpg",
    agenda: [
      { time: "11:00", item: "Researching comp" },
      { time: "11:25", item: "The offer call — scripts" },
      { time: "11:50", item: "Role-play in pairs" },
    ],
    sequence: 0,
  },
];

export function getEvent(id: string) {
  return EVENTS.find((e) => e.id === id);
}

export function upcomingEvents(now = new Date()) {
  return [...EVENTS]
    .filter((e) => new Date(e.end) >= now)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
}
