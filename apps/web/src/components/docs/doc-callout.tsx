import { AlertTriangle, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CalloutTone = 'info' | 'warning' | 'success';

type DocCalloutProps = {
  title: string;
  children: ReactNode;
  tone?: CalloutTone;
};

const styles: Record<CalloutTone, string> = {
  info: 'border-sky-400/20 bg-sky-400/[0.055] text-sky-100',
  warning: 'border-amber-400/20 bg-amber-400/[0.055] text-amber-100',
  success: 'border-emerald-400/20 bg-emerald-400/[0.055] text-emerald-100',
};

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CircleCheck,
};

export function DocCallout({
  title,
  children,
  tone = 'info',
}: DocCalloutProps) {
  const Icon = icons[tone];

  return (
    <aside className={cn('rounded-xl border p-5', styles[tone])}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">{title}</p>
          <div className="mt-1 text-sm leading-6 text-white/60">{children}</div>
        </div>
      </div>
    </aside>
  );
}
