export const syntheticSample = {
  job: {
    title: "Senior Next.js Commerce Engineer — Sample",
    description:
      "Build and improve a production commerce application using Next.js, TypeScript, PostgreSQL, and accessible component patterns.",
    requirements:
      "Evidence of shipping Next.js applications, designing typed server-side features, working with PostgreSQL, and improving measurable reliability or performance outcomes.",
    mustHaveSkills: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  candidate: {
    name: "Jordan Lee (Synthetic Sample)",
    proposalText:
      "For the Senior Next.js Commerce Engineer project, I would start by profiling the slow checkout route and reviewing its server/client boundary. In my latest project I rebuilt a Next.js checkout in TypeScript, moved pricing validation to the server, and reduced median response time by 38%. I have also designed PostgreSQL indexes and migrations for order and inventory workloads. I can deliver the first audited flow and performance baseline within two weeks.",
    resumeText: `Jordan Lee — Synthetic Sample Candidate

SUMMARY
Full-stack engineer with 7 years of experience delivering commerce and operations software. This profile is fictional and contains no real person's data.

EXPERIENCE
Senior Software Engineer, Northstar Commerce — 2022 to 2026
- Led a Next.js and TypeScript checkout rebuild serving 40,000 monthly orders.
- Moved pricing and inventory validation into server-side handlers and reduced median checkout response time by 38%.
- Designed PostgreSQL migrations and indexes for orders, inventory reservations, and payment events.
- Added accessible form states and keyboard coverage to the shared component library.

Software Engineer, Harbor Systems — 2019 to 2022
- Built React and Node.js customer workflows and maintained CI quality gates.
- Investigated production incidents and documented verification and rollback steps.

SELECTED PROJECT
Commerce reliability dashboard — Built a typed Next.js dashboard over PostgreSQL reporting data, with role-scoped server queries and documented performance benchmarks.

SKILLS
Next.js, TypeScript, PostgreSQL, React, Node.js, accessibility, performance profiling, database migrations`,
  },
} as const
