import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-white/65',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
