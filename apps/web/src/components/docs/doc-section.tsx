import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DocSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DocSection({
  id,
  title,
  description,
  children,
  className,
}: DocSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-28 border-b border-white/[0.08] py-10 last:border-0', className)}>
      <h2 className="font-display text-2xl font-medium tracking-[-0.025em] text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/52">
          {description}
        </p>
      )}
      <div className="doc-prose mt-6">{children}</div>
    </section>
  );
}
