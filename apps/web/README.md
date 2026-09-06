# NestForge Web

Landing page for NestForge, built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui conventions.

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
