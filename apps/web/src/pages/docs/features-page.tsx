import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function FeaturesPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Optional capabilities"
        title="Features that are added or removed as a unit"
        description="Feature choices affect source files, bootstrap code, environment variables, infrastructure services, dependencies, and tests. Disabling a feature is a structural transform, not a runtime flag."
      />

      <DocSection title="Docker">
        <p>Docker generation includes an application image and a Compose definition for the selected database and optional Redis/Mailpit services. When disabled, both <code>Dockerfile</code> and <code>docker-compose.yml</code> are removed.</p>
        <DocCallout title="SQLite needs no database container">
          SQLite persists to a local file. Docker may still be useful for the API, Redis, or Mailpit, but no database service is started.
        </DocCallout>
      </DocSection>

      <DocSection title="Swagger and OpenAPI">
        <p>Swagger adds API bootstrap configuration, the documentation route, operation metadata, response examples, DTO schemas, and the <code>@nestjs/swagger</code> dependency.</p>
        <p>Disabling it removes the bootstrap and decorators while preserving the controllers and their runtime behavior.</p>
      </DocSection>

      <DocSection title="Global validation with Zod">
        <p>The validation option registers a global Zod validation pipe and keeps validation integration in the E2E application setup. DTOs define request boundaries and invalid payloads are rejected before entering application services.</p>
        <p>When disabled, global validation wiring and its dependencies are removed.</p>
      </DocSection>

      <DocSection title="Redis, BullMQ, and mail">
        <p>This option is a coordinated infrastructure bundle:</p>
        <ul>
          <li>Redis connection and Redis health indicator;</li>
          <li>BullMQ queues and mail processor;</li>
          <li>mail service and development email templates;</li>
          <li>Mailpit service when Docker is enabled;</li>
          <li>password recovery and email-verification flows.</li>
        </ul>
        <p>Disabling it removes the mail module, queue processor, Redis-specific health logic, related authentication routes, environment variables, and dependencies.</p>
      </DocSection>

      <DocSection title="RBAC and Permissions">
        <DocTable
          headers={['Layer', 'Responsibility']}
          rows={[
            ['Role enum', 'Defines ADMIN, MANAGER, and USER identities.'],
            ['Permission constants', 'Defines granular actions such as user read, create, update, and delete.'],
            ['Role-permission map', 'Associates roles with their allowed operations.'],
            ['Decorators', 'Attach role or permission requirements to handlers.'],
            ['Guards', 'Evaluate the authenticated principal before controller execution.'],
          ]}
        />
        <p>Disabling access control removes this policy layer while keeping authentication protection when an authentication strategy is active.</p>
      </DocSection>

      <DocSection title="Always-available foundation">
        <p>Generated projects retain a structured NestJS application with configuration loading, exception handling, request logging, health endpoints, metrics, tests, and CI-oriented scripts as applicable to the selected stack.</p>
      </DocSection>
    </>
  );
}
