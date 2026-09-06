import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl font-light leading-tight tracking-[-0.045em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-white/50">{description}</p>
    </div>
  );
}
