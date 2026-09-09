export const sitePaths = {
  home: '/',
  docs: '/docs',
  cli: '/docs/cli',
  generation: '/docs/generation',
  compatibility: '/docs/compatibility',
  databases: '/docs/databases',
  authentication: '/docs/authentication',
  features: '/docs/features',
  security: '/docs/security',
  testing: '/docs/testing',
  reference: '/docs/reference',
  troubleshooting: '/docs/troubleshooting',
} as const;

export type SitePath = (typeof sitePaths)[keyof typeof sitePaths];

export function normalizePathname(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '') || '/';
}
