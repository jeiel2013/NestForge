import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { DocTable } from '@/components/docs/doc-table';

export function SecurityPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="Security model"
        title="Secure defaults still require production configuration"
        description="NestForge supplies mechanisms and integration points for authentication, authorization, request validation, cookies, CSRF, throttling, and secret validation. Operators remain responsible for credentials, transport security, and deployment policy."
      />

      <DocSection title="Credentials and passwords">
        <ul>
          <li>Passwords are hashed before persistence.</li>
          <li>Refresh tokens are stored as hashes rather than reusable plaintext values.</li>
          <li>Example seed credentials are development-only and must not be deployed.</li>
          <li>OAuth client secrets, JWT secrets, session secrets, and mail credentials belong in environment configuration.</li>
        </ul>
      </DocSection>

      <DocSection title="JWT lifecycle">
        <DocTable
          headers={['Control', 'Purpose']}
          rows={[
            ['Short-lived access token', 'Limits exposure of a leaked bearer credential.'],
            ['Persisted refresh record', 'Allows server-side revocation and rotation.'],
            ['Refresh rotation', 'Replaces the previous refresh token after use.'],
            ['Logout revocation', 'Invalidates persisted refresh state.'],
          ]}
        />
        <DocCallout title="Bearer tokens require protected storage" tone="warning">
          Client applications should avoid exposing tokens to untrusted scripts or logs and must use HTTPS in production.
        </DocCallout>
      </DocSection>

      <DocSection title="Sessions, cookies, and CSRF">
        <p>Session authentication uses an HTTP-only cookie and a server-side store. The session identifier is not the user record itself.</p>
        <ul>
          <li>Regenerate the session on authentication.</li>
          <li>Use secure cookies and HTTPS in production.</li>
          <li>Set an explicit same-site policy that matches the frontend deployment.</li>
          <li>Send the issued CSRF token on state-changing requests.</li>
        </ul>
        <CodeBlock label="State-changing request" code={'Cookie: nestforge.sid=<session-id>\nX-CSRF-Token: <csrf-token>'} />
      </DocSection>

      <DocSection title="Authorization boundaries">
        <p>Authentication establishes identity. Roles and permissions separately determine allowed operations. Disabling RBAC removes fine-grained policy checks; it does not make authenticated routes public.</p>
      </DocSection>

      <DocSection title="Request hardening">
        <DocTable
          headers={['Mechanism', 'Coverage']}
          rows={[
            ['Zod validation', 'Rejects malformed request DTOs at the global boundary.'],
            ['Throttling', 'Limits repeated requests according to configured TTL and request count.'],
            ['HTTP exception filter', 'Normalizes application errors into consistent responses.'],
            ['Environment validation', 'Fails startup when required configuration is missing or invalid.'],
            ['CORS configuration', 'Controls which browser origins may call the API.'],
          ]}
        />
      </DocSection>

      <DocSection title="Production checklist">
        <ul>
          <li>Replace every example secret and seed password.</li>
          <li>Use long, independently generated JWT or session secrets.</li>
          <li>Restrict CORS to known frontend origins.</li>
          <li>Terminate TLS and enable secure cookie settings.</li>
          <li>Use managed persistence and backup policies.</li>
          <li>Review role-to-permission mappings for your domain.</li>
          <li>Keep generated dependencies patched.</li>
        </ul>
      </DocSection>
    </>
  );
}
