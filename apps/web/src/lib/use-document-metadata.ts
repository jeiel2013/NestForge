import { useEffect } from 'react';
import { sitePaths } from '@/lib/routes';

const titles: Record<string, string> = {
  [sitePaths.home]: 'NestForge — Forge your NestJS foundation',
  [sitePaths.docs]: 'Documentation | NestForge',
  [sitePaths.cli]: 'CLI reference | NestForge',
  [sitePaths.generation]: 'Generation model | NestForge',
  [sitePaths.compatibility]: 'Compatibility | NestForge',
  [sitePaths.databases]: 'Databases and ORMs | NestForge',
  [sitePaths.authentication]: 'Authentication | NestForge',
  [sitePaths.features]: 'Optional features | NestForge',
  [sitePaths.security]: 'Security | NestForge',
  [sitePaths.testing]: 'Testing | NestForge',
  [sitePaths.reference]: 'Technical reference | NestForge',
  [sitePaths.troubleshooting]: 'Troubleshooting | NestForge',
};

const descriptions: Record<string, string> = {
  [sitePaths.home]: 'Generate production-ready NestJS projects with Prisma, TypeORM, Drizzle, or no ORM.',
  [sitePaths.docs]: 'Technical documentation for installing, configuring, generating, and operating NestForge projects.',
};

export function useDocumentMetadata(pathname: string) {
  useEffect(() => {
    document.title = titles[pathname] ?? 'Page not found | NestForge';

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) {
      description.content =
        descriptions[pathname] ??
        'Technical reference for the NestForge NestJS project generator.';
    }
  }, [pathname]);
}
