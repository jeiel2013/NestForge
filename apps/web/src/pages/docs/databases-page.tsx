import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function DatabasesPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Persistence"
        title="Database and ORM behavior"
        description="Each persistence template owns its schema, data access services, health indicator, seed strategy, migration commands, and session integration. NestForge then specializes that template for the selected database."
      />

      <DocSection title="Prisma">
        <p>The Prisma template provides <code>PrismaModule</code>, <code>PrismaService</code>, a generated client, a schema, seed data, and a Prisma-backed health indicator.</p>
        <DocTable
          headers={['Database', 'Schema provider', 'Development synchronization']}
          rows={[
            ['PostgreSQL', <code>postgresql</code>, <code>npx prisma migrate dev</code>],
            ['MySQL', <code>mysql</code>, <code>npx prisma migrate dev</code>],
            ['SQLite', <code>sqlite</code>, <code>npx prisma migrate dev</code>],
            ['MongoDB', <code>mongodb</code>, <code>npm run prisma:push</code>],
          ]}
        />
        <p>MongoDB schemas use mapped ObjectId fields. Prisma Migrate is not used; schema synchronization uses <code>db push</code>.</p>
      </DocSection>

      <DocSection title="TypeORM">
        <p>The TypeORM template provides entities, repository-based services, a database module, a standalone <code>DataSource</code>, migration scripts, seed logic, and a TypeORM health indicator.</p>
        <CodeBlock code={'npm run migration:generate -- src/database/migrations/InitialSchema\nnpm run migration:run\nnpm run seed'} />
        <p>Column types and connection configuration are transformed for PostgreSQL, MySQL, or SQLite. The generated package retains only <code>pg</code>, <code>mysql2</code>, or <code>better-sqlite3</code>.</p>
      </DocSection>

      <DocSection title="Drizzle ORM">
        <p>The Drizzle template includes database-specific typed schemas, driver initialization, lifecycle management, migration output, a seed, health checks, and a custom persistent session store.</p>
        <CodeBlock code={'npm run drizzle:generate\nnpm run drizzle:migrate\nnpm run seed'} />
        <p>Only the chosen schema module and database driver remain after generation. SQLite transactions are kept synchronous where required by <code>better-sqlite3</code>.</p>
      </DocSection>

      <DocSection title="Connection configuration">
        <DocTable
          headers={['Database', 'Typical DATABASE_URL']}
          rows={[
            ['PostgreSQL', <code>postgresql://user:password@localhost:5432/database</code>],
            ['MySQL', <code>mysql://user:password@localhost:3306/database</code>],
            ['SQLite', <code>file:./dev.db</code>],
            ['MongoDB', <code>mongodb://localhost:27017/database?replicaSet=rs0</code>],
          ]}
        />
        <DocCallout title="MongoDB transactions" tone="warning">
          Authentication operations can use transactions. A real MongoDB environment must run as a replica set, including local and container-based development environments.
        </DocCallout>
      </DocSection>

      <DocSection title="Seeds">
        <p>JWT and Session/Cookies projects include example ADMIN, MANAGER, and USER identities. OAuth-only and no-auth combinations do not print password-based seed steps. Treat demonstration credentials as development data and replace them before any production use.</p>
      </DocSection>

      <DocSection title="No ORM">
        <p>No-ORM generation removes the complete persistence layer, database scripts, drivers, schema files, seed, database health check, and database environment variables. It is intended for APIs that will add persistence independently or do not need it.</p>
      </DocSection>
    </>
  );
}
