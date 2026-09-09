import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

const coreFlags = [
  [<code>--name &lt;name&gt;</code>, 'Project name', 'Positional argument'],
  [<code>--language &lt;value&gt;</code>, 'typescript, javascript', 'typescript'],
  [<code>--orm &lt;value&gt;</code>, 'prisma, typeorm, drizzle, none', 'prisma'],
  [<code>--database &lt;value&gt;</code>, 'postgres, mysql, sqlite, mongodb, none', 'postgres'],
  [<code>--auth &lt;value&gt;</code>, 'jwt, session, oauth, none', 'jwt'],
];

const toggles = [
  ['docker', 'Keep Dockerfile and Compose services', 'enabled'],
  ['swagger', 'Keep OpenAPI bootstrap and decorators', 'enabled'],
  ['validation', 'Keep global Zod validation', 'enabled'],
  ['redis', 'Keep Redis, BullMQ queues, and mail flow', 'enabled'],
  ['access-control', 'Keep RBAC and permission checks', 'enabled'],
  ['env', 'Copy .env.example to .env', 'enabled'],
];

export function CliPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Command-line interface"
        title="Interactive when you want it. Deterministic when you do not."
        description="The same generation engine powers prompts, partially specified commands, and fully non-interactive execution. Every argument is normalized into a single project configuration before files are written."
      />

      <DocSection title="Invocation forms">
        <CodeBlock code={'npx nestforge\nnpx nestforge my-api\nnpx nestforge --name my-api'} />
        <p>The project name may be positional or supplied with <code>--name</code>. If both forms are used, their values must match.</p>
      </DocSection>

      <DocSection title="Utility commands">
        <DocTable
          headers={['Command', 'Behavior']}
          rows={[
            [<code>--help, -h</code>, 'Print usage, options, and examples, then exit.'],
            [<code>--version, -V</code>, 'Read and print the installed package version.'],
            [<code>--list</code>, 'Print the supported language, ORM, database, and authentication matrix.'],
            [<code>--doctor</code>, 'Check Node.js, npm, Git, write access, and optional Docker availability.'],
          ]}
        />
        <p>Utility commands run before the update notifier, so asking for help or a version never opens an unrelated prompt.</p>
      </DocSection>

      <DocSection title="Generation options">
        <DocTable headers={['Flag', 'Accepted values', 'Default']} rows={coreFlags} />
      </DocSection>

      <DocSection title="Feature toggles">
        <p>Each feature accepts both a positive and a negative form: <code>--docker</code> or <code>--no-docker</code>, for example.</p>
        <DocTable
          headers={['Name', 'Effect when enabled', 'Default']}
          rows={toggles.map(([name, behavior, defaultValue]) => [
            <code>--{name} / --no-{name}</code>,
            behavior,
            defaultValue,
          ])}
        />
        <DocCallout title="Contradictory flags are errors" tone="warning">
          Passing both forms of the same toggle, such as <code>--redis --no-redis</code>, terminates the command instead of guessing your intention.
        </DocCallout>
      </DocSection>

      <DocSection title="Interactive and non-interactive resolution">
        <h3>Interactive</h3>
        <p>With no arguments, every applicable prompt is shown. Supplied arguments skip only their corresponding prompts.</p>
        <CodeBlock code="npx nestforge my-api --orm prisma --database postgres" />
        <h3>Non-interactive</h3>
        <p><code>--non-interactive</code> and <code>--yes</code> prevent all configuration prompts. A project name is mandatory; omitted settings use the defaults shown above.</p>
        <CodeBlock code={'npx nestforge my-api --yes\nnpx nestforge my-api --non-interactive --orm typeorm --database mysql'} />
      </DocSection>

      <DocSection title="Output and update controls">
        <DocTable
          headers={['Flag', 'Behavior']}
          rows={[
            [<code>--no-banner</code>, 'Hide the large NestForge ASCII banner.'],
            [<code>--no-update-check</code>, 'Skip the npm registry update lookup for this execution.'],
          ]}
        />
        <p>When an accepted update restarts NestForge, the original argument vector is restored so a non-interactive command continues with the same configuration.</p>
      </DocSection>

      <DocSection title="Exit behavior">
        <ul>
          <li>Invalid option names and values produce an error.</li>
          <li>Unsupported combinations produce an error before generation.</li>
          <li>An existing target directory is never overwritten.</li>
          <li>Cancelling an interactive prompt exits without generating a project.</li>
          <li>Update-check network failures are ignored and generation remains available offline.</li>
        </ul>
      </DocSection>
    </>
  );
}
