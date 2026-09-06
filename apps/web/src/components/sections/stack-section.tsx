import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/shared/section-heading';

const groups = [
  { label: 'Language', items: ['TypeScript', 'JavaScript'] },
  { label: 'Data', items: ['Prisma', 'TypeORM', 'Drizzle', 'No ORM'] },
  { label: 'Database', items: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB*'] },
  { label: 'Auth', items: ['JWT', 'Session/Cookies', 'OAuth-only', 'None'] },
  { label: 'Tooling', items: ['Docker', 'Swagger', 'Zod', 'Redis', 'BullMQ', 'RBAC'] },
];

export function StackSection() {
  return (
    <section id="stack" className="border-b border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The matrix"
          title="Compose the backend you want to maintain."
          description="Each choice changes the generated source, dependencies, configuration, and next-step commands. Optional means removable, not merely disabled."
          align="center"
        />

        <div className="mx-auto mt-14 max-w-5xl divide-y divide-white/10 border-y border-white/10">
          {groups.map((group) => (
            <div key={group.label} className="grid gap-5 py-6 sm:grid-cols-[11rem_1fr] sm:items-center">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/35">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item} className="normal-case tracking-normal text-white/70">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-5 max-w-5xl text-right text-xs text-white/30">
          * MongoDB is currently available with Prisma.
        </p>
      </div>
    </section>
  );
}
