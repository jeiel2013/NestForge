import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function ReferencePage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Reference"
        title="Commands, configuration, and generated structure"
        description="Use this page as an operational index after generation. Exact scripts are specialized by ORM, database, language, and authentication strategy, so the generated package.json remains the final source of truth."
      />

      <DocSection title="Common application commands">
        <DocTable
          headers={['Command', 'Purpose']}
          rows={[
            [<code>npm run start:dev</code>, 'Start NestJS in development watch mode.'],
            [<code>npm run build</code>, 'Compile or prepare the production application.'],
            [<code>npm test</code>, 'Run unit tests with Vitest.'],
            [<code>npm run test:e2e</code>, 'Apply test migrations when configured and run HTTP-level tests.'],
            [<code>npm run seed</code>, 'Create development demonstration users when supported.'],
          ]}
        />
      </DocSection>

      <DocSection title="Persistence commands">
        <DocTable
          headers={['ORM', 'Generate', 'Apply or synchronize']}
          rows={[
            ['Prisma SQL', <code>npm run prisma:generate</code>, <code>npx prisma migrate dev</code>],
            ['Prisma MongoDB', <code>npm run prisma:generate</code>, <code>npm run prisma:push</code>],
            ['TypeORM', <code>npm run migration:generate -- src/database/migrations/InitialSchema</code>, <code>npm run migration:run</code>],
            ['Drizzle', <code>npm run drizzle:generate</code>, <code>npm run drizzle:migrate</code>],
            ['No ORM', 'Not applicable', 'Not applicable'],
          ]}
        />
      </DocSection>

      <DocSection title="Core environment groups">
        <DocTable
          headers={['Group', 'Representative variables', 'When present']}
          rows={[
            ['Application', <code>NODE_ENV, PORT, APP_URL</code>, 'Always'],
            ['Database', <code>DATABASE_URL</code>, 'ORM projects'],
            ['JWT', <code>JWT_ACCESS_SECRET, JWT_REFRESH_SECRET</code>, 'JWT and OAuth-only'],
            ['Session', <code>SESSION_SECRET, SESSION_MAX_AGE</code>, 'Session/Cookies'],
            ['OAuth', <code>GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID</code>, 'OAuth-capable strategies'],
            ['Redis', <code>REDIS_HOST, REDIS_PORT</code>, 'Redis feature'],
            ['Mail', <code>MAIL_HOST, MAIL_PORT, MAIL_FROM</code>, 'Redis/mail feature'],
            ['Throttling', <code>THROTTLE_TTL, THROTTLE_LIMIT</code>, 'Generated application'],
          ]}
        />
        <DocCallout title="Validate the generated example">
          Copy or generate <code>.env</code>, replace secrets, and read the final <code>.env.example</code>. Feature transforms remove variables that are not applicable to the selected project.
        </DocCallout>
      </DocSection>

      <DocSection title="Representative source tree">
        <CodeBlock
          label="Project structure"
          code={'src/\n├── auth/          # selected authentication strategy\n├── common/        # guards, decorators, filters, middleware\n├── config/        # environment validation\n├── database/      # selected persistence integration\n├── health/        # application and dependency health\n├── mail/          # optional queue-backed email\n├── metrics/       # operational metrics\n├── users/         # identity and user management\n├── app.module.ts\n└── main.ts'}
        />
        <p>Directories tied to disabled capabilities are removed. A no-ORM/no-auth project is intentionally smaller than this representative tree.</p>
      </DocSection>

      <DocSection title="Generated service endpoints">
        <DocTable
          headers={['Area', 'Examples']}
          rows={[
            ['Health', 'Liveness/readiness and selected dependency indicators'],
            ['Metrics', 'Application metrics endpoint'],
            ['Authentication', 'Register, login, refresh or CSRF token, logout, OAuth callbacks'],
            ['Users', 'Current user, listing, creation, update, deletion, and avatar upload'],
            ['Swagger', 'OpenAPI UI when the feature is enabled'],
          ]}
        />
        <p>The actual route set depends on authentication and optional-feature removal. Inspect generated controllers or Swagger output for the authoritative contract.</p>
      </DocSection>

      <DocSection title="Update cache">
        <p>NestForge caches npm registry metadata for six hours in <code>~/.nestforge/update-check.json</code>. Choosing “Don&apos;t remind me today” stores a dismissal until the next local day. Cache or network failures never block generation.</p>
      </DocSection>
    </>
  );
}
