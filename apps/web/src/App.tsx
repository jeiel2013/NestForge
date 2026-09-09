importsch { DocsLayout } from '@/components/docs/docs-layout';
import { AuthenticationPage } from '@/pages/docs/authentication-page';
import { CliPage } from '@/pages/docs/cli-page';
import { CompatibilityPage } from '@/pages/docs/compatibility-page';
import { DatabasesPage } from '@/pages/docs/databases-page';
import { DocsOverviewPage } from '@/pages/docs/docs-overview-page';
import { FeaturesPage } from '@/pages/docs/features-page';
import { GenerationPage } from '@/pages/docs/generation-page';
import { ReferencePage } from '@/pages/docs/reference-page';
import { SecurityPage } from '@/pages/docs/security-page';
import { TestingPage } from '@/pages/docs/testing-page';
import { TroubleshootingPage } from '@/pages/docs/troubleshooting-page';
import { LandingPage } from '@/pages/landing-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { sitePaths } from '@/lib/routes';
import { usePathname } from '@/lib/use-pathname';

function App() {
  const pathname = usePathname();

  if (pathname === sitePaths.home) {
    return <LandingPage />;
  }

  const docsPages = {
    [sitePaths.docs]: <DocsOverviewPage />,
    [sitePaths.cli]: <CliPage />,
    [sitePaths.generation]: <GenerationPage />,
    [sitePaths.compatibility]: <CompatibilityPage />,
    [sitePaths.databases]: <DatabasesPage />,
    [sitePaths.authentication]: <AuthenticationPage />,
    [sitePaths.features]: <FeaturesPage />,
    [sitePaths.security]: <SecurityPage />,
    [sitePaths.testing]: <TestingPage />,
    [sitePaths.reference]: <ReferencePage />,
    [sitePaths.troubleshooting]: <TroubleshootingPage />,
  } as const;

  const docsPage = docsPages[pathname as keyof typeof docsPages];

  if (docsPage) {
    return <DocsLayout pathname={pathname}>{docsPage}</DocsLayout>;
  }

  return <NotFoundPage />;
}

export default App;
