import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function AuthenticationPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Identity"
        title="Authentication strategies"
        description="Authentication is generated as a coherent strategy, not a collection of disconnected switches. NestForge keeps the routes, persistence models, guards, dependencies, tests, and environment variables required by the selected mechanism."
      />

      <DocSection title="Strategy comparison">
        <DocTable
          headers={['Capability', 'JWT', 'Session/Cookies', 'OAuth-only', 'None']}
          rows={[
            ['Password registration and login', 'Yes', 'Yes', 'Removed', 'Removed'],
            ['Google and GitHub OAuth', 'Yes', 'Yes', 'Yes', 'Removed'],
            ['Access and refresh tokens', 'Yes', 'Removed', 'Yes', 'Removed'],
            ['Persistent server session', 'Removed', 'Yes', 'Removed', 'Removed'],
            ['Password recovery and email verification', 'With Redis/mail', 'With Redis/mail', 'Removed', 'Removed'],
            ['Users module', 'Yes', 'Yes', 'Yes', 'Removed'],
          ]}
        />
      </DocSection>

      <DocSection title="JWT">
        <p>JWT is the default strategy. It includes password registration and login, short-lived access tokens, persisted refresh tokens, refresh rotation, revocation, logout, and Google/GitHub OAuth callbacks.</p>
        <ul>
          <li><code>JwtStrategy</code> validates bearer tokens.</li>
          <li><code>JwtAuthGuard</code> protects non-public routes.</li>
          <li><code>TokenService</code> signs, stores, rotates, and revokes tokens.</li>
          <li>Refresh tokens are hashed before persistence.</li>
        </ul>
        <CodeBlock label="Authorization header" code="Authorization: Bearer <access-token>" />
      </DocSection>

      <DocSection title="Session/Cookies">
        <p>Session mode replaces bearer tokens with a server-side session referenced by an HTTP-only cookie named <code>nestforge.sid</code>.</p>
        <ul>
          <li>The session is regenerated after login to prevent fixation.</li>
          <li>State-changing requests are protected with a CSRF token.</li>
          <li>Logout destroys the persisted session.</li>
          <li>OAuth callbacks establish the same session-based identity.</li>
        </ul>
        <DocTable
          headers={['ORM', 'Session store']}
          rows={[
            ['Prisma', <code>@quixo3/prisma-session-store</code>],
            ['TypeORM', <code>connect-typeorm</code>],
            ['Drizzle', 'NestForge DrizzleSessionStore'],
          ]}
        />
        <CodeBlock label="CSRF request" code={'GET /auth/csrf-token\nX-CSRF-Token: <returned-token>'} />
      </DocSection>

      <DocSection title="OAuth-only">
        <p>OAuth-only retains Google and GitHub strategies, protected routes, token issuance, refresh, and logout. It removes password storage and every password-based route, DTO, service branch, dependency, and test.</p>
        <DocCallout title="Provider credentials are required" tone="warning">
          Configure Google and GitHub client IDs, client secrets, and callback URLs before enabling real provider flows.
        </DocCallout>
      </DocSection>

      <DocSection title="No authentication">
        <p>Selecting <code>none</code> removes <code>src/auth</code>, <code>src/users</code>, identity models, guards, decorators, and their tests. RBAC cannot be enabled without an authenticated principal.</p>
      </DocSection>

      <DocSection title="Authorization">
        <p>When access control is enabled, authenticated routes can combine roles and granular permissions. The generated constants map ADMIN, MANAGER, and USER roles to capabilities, while decorators attach route requirements and guards enforce them.</p>
      </DocSection>
    </>
  );
}
