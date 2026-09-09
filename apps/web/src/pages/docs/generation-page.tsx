import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function GenerationPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Generation model"
        title="One configuration, a sequence of deterministic transforms"
        description="NestForge begins with a maintained template and derives the requested project by applying database, authentication, feature, language, naming, and environment transforms in a defined order."
      />

      <DocSection title="Generation pipeline">
        <ol>
          <li>Validate the project name and option compatibility.</li>
          <li>Resolve the packaged template directory.</li>
          <li>Reject an existing target directory.</li>
          <li>Copy the selected ORM template into the target.</li>
          <li>Apply Docker, database, authentication, and feature markers.</li>
          <li>Remove dependencies belonging only to disabled features.</li>
          <li>Apply the no-ORM transform when requested.</li>
          <li>Transpile to JavaScript when requested.</li>
          <li>Rename the npm package and README title.</li>
          <li>Optionally create <code>.env</code> from <code>.env.example</code>.</li>
        </ol>
        <DocCallout title="Template source remains immutable">
          Transforms operate on the copied target. Generating one combination does not mutate the source templates or influence the next generation.
        </DocCallout>
      </DocSection>

      <DocSection title="Project-name contract">
        <DocTable
          headers={['Rule', 'Reason']}
          rows={[
            ['Lowercase letters, numbers, dots, hyphens, and underscores only', 'Compatible package and directory naming'],
            ['Must begin with a letter or number', 'Rejects ambiguous punctuation-led names'],
            ['Maximum 214 characters', 'Matches the npm package-name limit'],
            ['No whitespace, path separators, absolute paths, or npm scopes', 'Keeps generation inside the current directory'],
            ['No reserved npm or Windows device names', 'Prevents platform-specific filesystem failures'],
          ]}
        />
        <p>The resolved target must be a direct child of the current working directory. NestForge does not overwrite existing content.</p>
      </DocSection>

      <DocSection title="Feature markers">
        <p>Templates annotate optional files and code regions with NestForge feature markers. The generator builds an enabled-feature set from the selected options, removes disabled files or regions, and then removes dependencies that are no longer referenced.</p>
        <CodeBlock label="Conceptual marker" code={'// nestforge:feature-start:swagger\n// Swagger bootstrap code\n// nestforge:feature-end:swagger'} />
        <p>Feature keys include infrastructure selections such as <code>docker</code>, <code>redis</code>, <code>validation</code>, and <code>rbac</code>, plus qualified values such as <code>database:sqlite</code> and <code>auth:session</code>.</p>
      </DocSection>

      <DocSection title="JavaScript generation">
        <p>NestForge does not maintain a second hand-written JavaScript template. It transforms the selected TypeScript result:</p>
        <ul>
          <li>transpiles source and configuration files to JavaScript;</li>
          <li>removes TypeScript-only declarations and configuration;</li>
          <li>updates Vitest and E2E configuration filenames;</li>
          <li>rewrites ORM migration commands for JavaScript execution;</li>
          <li>removes TypeScript-only development dependencies.</li>
        </ul>
        <DocCallout title="The generated project is still stack-specific" tone="success">
          Prisma, TypeORM, and Drizzle each receive their own JavaScript script adjustments rather than a generic extension rename.
        </DocCallout>
      </DocSection>

      <DocSection title="No-ORM generation">
        <p>The <code>none</code> ORM option reuses the base template as a source and then removes persistence and identity concerns:</p>
        <ul>
          <li>database module, schema, migrations, seed, drivers, and ORM packages;</li>
          <li>authentication and users modules;</li>
          <li>database health indicators and environment variables;</li>
          <li>migration, generation, and seed scripts.</li>
        </ul>
        <p>Independent features such as Swagger, validation, Docker, metrics, health endpoints, Redis, queues, and mail may remain when selected.</p>
      </DocSection>

      <DocSection title="Post-generation boundary">
        <p>NestForge prints commands tailored to the selected stack but does not run dependency installation or migrations automatically. This keeps filesystem generation predictable and leaves external services and database changes explicit.</p>
      </DocSection>
    </>
  );
}
