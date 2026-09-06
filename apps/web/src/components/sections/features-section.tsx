import {
  Blocks,
  Boxes,
  Container,
  Database,
  KeyRound,
  Languages,
} from 'lucide-react';
import { FeatureCard } from '@/components/shared/feature-card';
import { SectionHeading } from '@/components/shared/section-heading';

const features = [
  {
    icon: Boxes,
    title: 'Choose your data layer',
    description: 'Start with Prisma, TypeORM, Drizzle, or no ORM at all. NestForge adapts the generated structure to your choice.',
  },
  {
    icon: Database,
    title: 'Use the database you need',
    description: 'Generate for PostgreSQL, MySQL, SQLite, or MongoDB with Prisma, with the correct schema and development commands.',
  },
  {
    icon: KeyRound,
    title: 'Authentication, your way',
    description: 'Pick JWT, persistent Session/Cookies, OAuth-only, or no authentication—without carrying unused code.',
  },
  {
    icon: Languages,
    title: 'TypeScript or JavaScript',
    description: 'Use the typed source templates or let the generator produce a JavaScript project automatically.',
  },
  {
    icon: Container,
    title: 'Infrastructure included',
    description: 'Add Docker, Redis, BullMQ, Mailpit, health checks, and metrics when the project calls for them.',
  },
  {
    icon: Blocks,
    title: 'Production-minded defaults',
    description: 'Swagger, Zod validation, RBAC, permissions, tests, and CI are integrated as coherent, optional capabilities.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Built to adapt"
          title="A real starter, shaped around your decisions."
          description="NestForge removes what you do not select and configures what you do. The result is a focused NestJS codebase, not a demo full of dormant features."
        />

        <div className="mt-14 grid border-b border-white/10 sm:grid-cols-2 sm:gap-4 sm:border-0 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              index={String(index + 1).padStart(2, '0')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
