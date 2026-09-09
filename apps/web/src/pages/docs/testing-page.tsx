import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function TestingPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Verification"
        title="Test the generator and the generated application"
        description="NestForge has two distinct test surfaces: generator tests prove that option combinations produce the correct filesystem result, while generated-project tests exercise application services, guards, persistence, and HTTP flows."
      />

      <DocSection title="CLI test suite">
        <CodeBlock code={'cd packages/cli\nnpm test'} />
        <p>The CLI suite covers generation matrices, feature removal, dependency pruning, project-name safety, argument parsing, non-interactive defaults, update checks, cache behavior, and platform-specific update commands.</p>
        <DocCallout title="Generation tests use temporary directories" tone="success">
          Every test receives an isolated target and removes it afterward, preventing one combination from contaminating another.
        </DocCallout>
      </DocSection>

      <DocSection title="Generated unit tests">
        <CodeBlock code="npm test" />
        <p>Depending on selected features, unit coverage includes users, authentication, sessions, CSRF middleware, role and permission guards, database health, and Redis health.</p>
      </DocSection>

      <DocSection title="End-to-end tests">
        <CodeBlock code="npm run test:e2e" />
        <p>E2E setup loads <code>.env.test</code>, initializes the selected database integration, applies the same global pipes and middleware used by the application, and cleans persistent records between scenarios.</p>
        <DocTable
          headers={['Suite', 'Representative behavior']}
          rows={[
            ['Authentication', 'Register, login, refresh, revoke, and reject invalid credentials.'],
            ['Session authentication', 'Issue cookies and CSRF tokens, protect mutations, renew and destroy sessions.'],
            ['Users', 'Enforce authentication, RBAC, CRUD behavior, and current-user lookup.'],
          ]}
        />
      </DocSection>

      <DocSection title="SQLite smoke sequence">
        <p>SQLite is the fastest complete local validation because it requires no external database service.</p>
        <CodeBlock
          code={'npm install\nnpm run build\nnpm test\n# Run the ORM-specific migration command\nnpm run seed\nnpm run test:e2e'}
        />
      </DocSection>

      <DocSection title="ORM-specific migration preparation">
        <DocTable
          headers={['ORM', 'Commands before E2E']}
          rows={[
            ['Prisma', <code>npm run prisma:generate</code>, <code>npx prisma migrate dev</code>],
            ['TypeORM', <code>npm run migration:generate -- src/database/migrations/InitialSchema</code>, <code>npm run migration:run</code>],
            ['Drizzle', <code>npm run drizzle:generate</code>, <code>npm run drizzle:migrate</code>],
          ]}
        />
      </DocSection>

      <DocSection title="External database tests">
        <p>PostgreSQL, MySQL, Redis, Mailpit, and MongoDB require locally available services or Docker. MongoDB authentication tests require a replica set because transactional operations are involved.</p>
      </DocSection>

      <DocSection title="CI expectations">
        <ul>
          <li>Install dependencies from the lockfile.</li>
          <li>Generate ORM artifacts where required.</li>
          <li>Apply migrations against an isolated test database.</li>
          <li>Run build, unit tests, and E2E tests.</li>
          <li>Never reuse development credentials in CI secrets.</li>
        </ul>
      </DocSection>
    </>
  );
}
