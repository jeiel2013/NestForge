import { ArrowRight, Boxes, TerminalSquare, Workflow } from 'lucide-react';
import { CodeBlock } from '@/components/docs/code-block';
import { DocCallout } from '@/components/docs/doc-callout';
import { DocPageHeader } from '@/components/docs/doc-page-header';
import { DocSection } from '@/components/docs/doc-section';
import { SiteLink } from '@/components/shared/site-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sitePaths } from '@/lib/routes';

const nextSteps = [
  {
    title: 'CLI reference',
    description: 'Learn every prompt, flag, utility command, default, and exit behavior.',
    href: sitePaths.cli,
    icon: TerminalSquare,
  },
  {
    title: 'Generation model',
    description: 'Understand how NestForge copies templates and removes disabled capabilities.',
    href: sitePaths.generation,
    icon: Workflow,
  },
  {
    title: 'Supported stack',
    description: 'Compare ORMs, databases, authentication strategies, and optional features.',
    href: sitePaths.compatibility,
    icon: Boxes,
  },
];

export function DocsOverviewPage() {
  return (
    <>
      <DocPageHeader
        eyebrow="NestForge 0.6"
        title="Technical documentation"
        description="NestForge is an open-source project generator for production-oriented NestJS APIs. It composes a tested template from explicit choices instead of leaving you to remove boilerplate after generation."
      />

      <DocSection title="Install and run">
        <p>Install the package in the current project, then invoke its published <code>nestforge</code> binary with <code>npx</code>.</p>
        <CodeBlock code={'npm install nestforge-generator\nnpx nestforge'} />
        <p>For a global command, install with <code>--global</code> and run <code>nestforge</code> directly.</p>
        <CodeBlock code={'npm install --global nestforge-generator\nnestforge'} />
      </DocSection>

      <DocSection title="Generate your first API">
        <p>The default command starts an interactive flow covering language, persistence, infrastructure, authentication, access control, and environment-file creation.</p>
        <CodeBlock code="npx nestforge" />
        <p>Automation and CI can use the non-interactive mode. This example selects Drizzle with SQLite and removes Docker and Redis-related services.</p>
        <CodeBlock code={'npx nestforge my-api --non-interactive \\\n  --orm drizzle --database sqlite \\\n  --no-docker --no-redis'} />
        <DocCallout title="Generated, not installed">
          NestForge writes the project and prints the exact next steps. Dependency installation, migrations, and application startup remain explicit operations under your control.
        </DocCallout>
      </DocSection>

      <DocSection title="What the generator owns">
        <ul>
          <li>Copies the template associated with the selected ORM.</li>
          <li>Applies database-specific schemas, drivers, URLs, and migration commands.</li>
          <li>Removes feature-marked code and dependencies that were not selected.</li>
          <li>Adapts authentication to JWT, Session/Cookies, OAuth-only, or none.</li>
          <li>Optionally transpiles the TypeScript result into a JavaScript project.</li>
          <li>Renames the package and README title without overwriting existing directories.</li>
        </ul>
      </DocSection>

      <DocSection title="Requirements and guarantees">
        <ul>
          <li>Node.js 20 or later.</li>
          <li>npm for installation, package execution, and generated scripts.</li>
          <li>Docker only when you choose Docker-backed services.</li>
          <li>A writable target directory with no existing directory matching the project name.</li>
        </ul>
        <DocCallout title="Compatibility is validated" tone="success">
          Unsupported combinations fail before a project is written. MongoDB is limited to Prisma, and no-ORM projects intentionally exclude database-backed authentication.
        </DocCallout>
      </DocSection>

      <DocSection title="Continue reading">
        <div className="grid gap-4 md:grid-cols-3">
          {nextSteps.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.href} className="group">
                <CardHeader>
                  <Icon className="mb-5 size-5 text-ember" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="min-h-20 text-sm leading-6 text-white/48">{item.description}</p>
                  <SiteLink to={item.href} className="mt-5 inline-flex items-center gap-2 text-sm text-white transition-colors group-hover:text-ember">
                    Open guide <ArrowRight className="size-4" />
                  </SiteLink>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DocSection>
    </>
  );
}
