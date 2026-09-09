import { ArrowLeft, ArrowRight } from 'lucide-react';
import { docsNavigation } from '@/content/docs-navigation';
import { SiteLink } from '@/components/shared/site-link';

type DocPaginationProps = {
  pathname: string;
};

export function DocPagination({ pathname }: DocPaginationProps) {
  const pages = docsNavigation.flatMap((group) => group.items);
  const currentIndex = pages.findIndex((page) => page.href === pathname);
  const previous = pages[currentIndex - 1];
  const next = pages[currentIndex + 1];

  return (
    <nav className="mt-14 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2" aria-label="Documentation pages">
      {previous ? (
        <SiteLink to={previous.href} className="group rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.045]">
          <span className="flex items-center gap-2 text-xs text-white/35">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Previous
          </span>
          <span className="mt-2 block text-sm text-white/78">{previous.title}</span>
        </SiteLink>
      ) : <span />}
      {next && (
        <SiteLink to={next.href} className="group rounded-xl border border-white/10 bg-white/[0.025] p-4 text-right transition-colors hover:border-white/20 hover:bg-white/[0.045]">
          <span className="flex items-center justify-end gap-2 text-xs text-white/35">
            Next
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="mt-2 block text-sm text-white/78">{next.title}</span>
        </SiteLink>
      )}
    </nav>
  );
}
