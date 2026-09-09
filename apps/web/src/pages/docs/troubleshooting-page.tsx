import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';

export function TroubleshootingPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Troubleshooting"
        title="Diagnose generation, installation, and database failures"
        description="Start with the CLI doctor, then isolate whether the failure belongs to NestForge generation, dependency installation, native tooling, environment configuration, or the selected database."
      />

      <DocSection title="Run the environment diagnostic">
        <CodeBlock code="npx nestforge --doctor" />
        <p>The diagnostic reports Node.js, npm, Git, current-directory write access, and Docker. Docker is optional unless your selected development workflow uses it.</p>
      </DocSection>

      <DocSection title="The project directory already exists">
        <p>NestForge never merges into or overwrites an existing target. Choose a different project name or move the existing directory yourself after confirming its contents.</p>
        <CodeBlock code="npx nestforge another-api --yes" />
      </DocSection>

      <DocSection title="Invalid or incompatible flags">
        <ul>
          <li>Use lowercase values exactly as shown by <code>--help</code>.</li>
          <li>Do not pass both positive and negative forms of one toggle.</li>
          <li>Use MongoDB only with Prisma.</li>
          <li>Use database and authentication <code>none</code> when ORM is <code>none</code>.</li>
          <li>Do not enable access control when authentication is disabled.</li>
        </ul>
        <CodeBlock code="npx nestforge --list" />
      </DocSection>

      <DocSection title="Native SQLite installation fails">
        <p><code>better-sqlite3</code> may need a prebuilt binary compatible with your Node.js version. Very new Node releases can fall back to local native compilation.</p>
        <ul>
          <li>Prefer a supported Node.js LTS release.</li>
          <li>If compilation is required on Windows, install the Visual Studio C++ build workload.</li>
          <li>Remove an incomplete <code>node_modules</code> only after closing processes that may lock it, then reinstall.</li>
        </ul>
      </DocSection>

      <DocSection title="Prisma client types are missing">
        <p>Generate the client after installation and whenever the Prisma schema changes.</p>
        <CodeBlock code="npm run prisma:generate" />
        <p>Confirm that <code>DATABASE_URL</code> uses the provider selected during generation.</p>
      </DocSection>

      <DocSection title="Migrations or E2E tests cannot connect">
        <ul>
          <li>Verify the service is running and reachable from the application.</li>
          <li>Check credentials, hostname, port, and database name in <code>.env</code> and <code>.env.test</code>.</li>
          <li>Apply the ORM-specific migration command before running E2E tests.</li>
          <li>Use a dedicated test database and avoid pointing tests at development or production data.</li>
        </ul>
      </DocSection>

      <DocSection title="MongoDB transaction errors">
        <p>Run MongoDB as a replica set and include the replica-set option in the connection URL. Standalone MongoDB servers cannot execute the transactional authentication paths used by the template.</p>
      </DocSection>

      <DocSection title="OAuth strategy fails during startup">
        <p>Provide non-empty provider client IDs and secrets through the active environment file. Confirm callback URLs exactly match the values registered with Google or GitHub.</p>
      </DocSection>

      <DocSection title="Update lookup is unavailable">
        <p>NestForge already falls back silently when the npm registry cannot be reached. To explicitly disable the lookup for automation or offline work:</p>
        <CodeBlock code="npx nestforge my-api --yes --no-update-check" />
        <DocCallout title="Still blocked?">
          Include the operating system, Node.js version, NestForge version, full command, selected options, and complete error output when opening a GitHub issue.
        </DocCallout>
      </DocSection>
    </>
  );
}
