import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

const yes = <span className="text-emerald-300">Supported</span>;
const no = <span className="text-white/28">Not available</span>;

export function CompatibilityPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Compatibility matrix"
        title="Supported combinations and enforced boundaries"
        description="Compatibility is evaluated before generation. The matrices below describe what the current published generator can compose, not aspirational roadmap items."
      />

      <DocSection title="Language and persistence">
        <DocTable
          headers={['Persistence', 'TypeScript', 'JavaScript']}
          rows={[
            ['Prisma', yes, yes],
            ['TypeORM', yes, yes],
            ['Drizzle ORM', yes, yes],
            ['No ORM', yes, yes],
          ]}
        />
      </DocSection>

      <DocSection title="ORM and database">
        <DocTable
          headers={['ORM', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'None']}
          rows={[
            ['Prisma', yes, yes, yes, yes, no],
            ['TypeORM', yes, yes, yes, no, no],
            ['Drizzle ORM', yes, yes, yes, no, no],
            ['None', no, no, no, no, yes],
          ]}
        />
        <DocCallout title="Why MongoDB is Prisma-only" tone="warning">
          NestForge's TypeORM and Drizzle templates use a relational architecture. TypeORM's MongoDB integration is not a direct substitute for that model, and Drizzle does not provide an official MongoDB dialect.
        </DocCallout>
      </DocSection>

      <DocSection title="ORM and authentication">
        <DocTable
          headers={['Persistence', 'JWT', 'Session/Cookies', 'OAuth-only', 'None']}
          rows={[
            ['Prisma', yes, yes, yes, yes],
            ['TypeORM', yes, yes, yes, yes],
            ['Drizzle ORM', yes, yes, yes, yes],
            ['No ORM', no, no, no, yes],
          ]}
        />
        <p>RBAC and Permissions require an authentication strategy. Selecting no authentication automatically disables access control.</p>
      </DocSection>

      <DocSection title="Database drivers">
        <DocTable
          headers={['Database', 'Prisma', 'TypeORM', 'Drizzle']}
          rows={[
            ['PostgreSQL', 'Prisma engine', <code>pg</code>, <code>pg</code>],
            ['MySQL', 'Prisma engine', <code>mysql2</code>, <code>mysql2</code>],
            ['SQLite', 'Prisma engine', <code>better-sqlite3</code>, <code>better-sqlite3</code>],
            ['MongoDB', 'Prisma engine', no, no],
          ]}
        />
        <p>TypeORM and Drizzle projects retain only the driver selected during generation.</p>
      </DocSection>

      <DocSection title="Infrastructure availability">
        <DocTable
          headers={['Capability', 'Prisma', 'TypeORM', 'Drizzle', 'No ORM']}
          rows={[
            ['Docker', yes, yes, yes, yes],
            ['Swagger/OpenAPI', yes, yes, yes, yes],
            ['Global Zod validation', yes, yes, yes, yes],
            ['Redis, BullMQ, and mail', yes, yes, yes, yes],
            ['RBAC and Permissions', yes, yes, yes, no],
            ['Database health check', yes, yes, yes, no],
            ['Metrics and core health endpoints', yes, yes, yes, yes],
          ]}
        />
      </DocSection>
    </>
  );
}
