import type { ReactNode } from 'react';
import { DocsHeader } from '@/components/docs/docs-header';
import { DocsMobileNav } from '@/components/docs/docs-mobile-nav';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { DocPagination } from '@/components/docs/doc-pagination';
import { AmbientGrid } from '@/components/background/ambient-grid';

type DocsLayoutProps = {
  pathname: string;
  children: ReactNode;
};

export function DocsLayout({ pathname, children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AmbientGrid />
      <div className="relative z-10">
        <DocsHeader />
        <div className="mx-auto flex max-w-[90rem] px-5 sm:px-8">
          <DocsSidebar pathname={pathname} />
          <main className="min-w-0 flex-1 py-8 lg:px-12 lg:py-12 xl:px-16">
            <DocsMobileNav pathname={pathname} />
            <article className="mx-auto max-w-4xl">
              {children}
              <DocPagination pathname={pathname} />
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
