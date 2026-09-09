import { Badge } from '@/components/ui/badge';

type DocPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DocPageHeader({
  eyebrow,
  title,
  description,
}: DocPageHeaderProps) {
  return (
    <header className="border-b border-white/10 pb-10">
      <Badge className="mb-5 border-brand/25 bg-brand/5 text-red-200">
        {eyebrow}
      </Badge>
      <h1 className="max-w-3xl font-display text-4xl font-light tracking-[-0.045em] text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">
        {description}
      </p>
    </header>
  );
}
