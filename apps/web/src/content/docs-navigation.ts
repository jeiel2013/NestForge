import {
  BookOpen,
  Boxes,
  Bug,
  CheckCircle2,
  Database,
  FileCode2,
  Fingerprint,
  ListChecks,
  Settings2,
  ShieldCheck,
  TerminalSquare,
  type LucideIcon,
} from 'lucide-react';
import { sitePaths, type SitePath } from '@/lib/routes';

export type DocsNavigationItem = {
  title: string;
  description: string;
  href: SitePath;
  icon: LucideIcon;
};

export type DocsNavigationGroup = {
  label: string;
  items: DocsNavigationItem[];
};

export const docsNavigation: DocsNavigationGroup[] = [
  {
    label: 'Start here',
    items: [
      {
        title: 'Overview',
        description: 'Install NestForge and generate your first project.',
        href: sitePaths.docs,
        icon: BookOpen,
      },
      {
        title: 'CLI',
        description: 'Interactive prompts, flags, and utility commands.',
        href: sitePaths.cli,
        icon: TerminalSquare,
      },
      {
        title: 'Generation model',
        description: 'How templates and feature transforms work.',
        href: sitePaths.generation,
        icon: FileCode2,
      },
    ],
  },
  {
    label: 'Core systems',
    items: [
      {
        title: 'Compatibility',
        description: 'Supported combinations and constraints.',
        href: sitePaths.compatibility,
        icon: ListChecks,
      },
      {
        title: 'Databases & ORMs',
        description: 'Prisma, TypeORM, Drizzle, and no-ORM projects.',
        href: sitePaths.databases,
        icon: Database,
      },
      {
        title: 'Authentication',
        description: 'JWT, sessions, OAuth-only, and no auth.',
        href: sitePaths.authentication,
        icon: Fingerprint,
      },
      {
        title: 'Optional features',
        description: 'Docker, Swagger, validation, Redis, and RBAC.',
        href: sitePaths.features,
        icon: Boxes,
      },
      {
        title: 'Security',
        description: 'CSRF, cookies, tokens, permissions, and secrets.',
        href: sitePaths.security,
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: 'Operate',
    items: [
      {
        title: 'Testing',
        description: 'Unit, E2E, migrations, and smoke tests.',
        href: sitePaths.testing,
        icon: CheckCircle2,
      },
      {
        title: 'Reference',
        description: 'Commands, defaults, environment, and outputs.',
        href: sitePaths.reference,
        icon: Settings2,
      },
      {
        title: 'Troubleshooting',
        description: 'Common installation and generation issues.',
        href: sitePaths.troubleshooting,
        icon: Bug,
      },
    ],
  },
];
