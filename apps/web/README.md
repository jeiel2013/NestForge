# NestForge Web and Documentation

Landing page and technical documentation for NestForge, built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui conventions.

## Documentation routes

- `/docs` — installation and technical overview;
- `/docs/cli` — prompts, flags, defaults, and utility commands;
- `/docs/generation` — generation pipeline and transforms;
- `/docs/compatibility` — supported combinations;
- `/docs/databases` — Prisma, TypeORM, Drizzle, MongoDB, SQL, and no ORM;
- `/docs/authentication` — JWT, sessions, OAuth-only, and no authentication;
- `/docs/features` — Docker, Swagger, Zod, Redis, mail, and access control;
- `/docs/security` — security model and production checklist;
- `/docs/testing` — unit, E2E, migration, and smoke testing;
- `/docs/reference` — commands, environment groups, and generated structure;
- `/docs/troubleshooting` — common operational failures.

Internal navigation uses the browser History API. `public/_redirects` provides the SPA fallback required by compatible static hosts.

## Development

From the monorepo root:

```bash
npm install
npm run dev --workspace @nestforge/web
```

## Production build

```bash
npm run build --workspace @nestforge/web
```

The generated files are written to `apps/web/dist`.

## Structure

```text
src/
├── components/
│   ├── layout/
│   ├── sections/
│   ├── shared/
│   └── ui/
├── lib/
└── styles/
```

The original `generated-page.html` file is kept locally as a design reference and ignored by Git.
