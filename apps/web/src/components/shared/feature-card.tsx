import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  index: string;
};

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-none border-x-0 border-b-0 bg-black/20 transition-colors hover:bg-white/[0.035] sm:border-x sm:rounded-2xl">
      <div className="absolute right-5 top-5 font-mono text-[0.65rem] tracking-[0.2em] text-white/20">
        {index}
      </div>
      <CardHeader>
        <div className="mb-8 flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition-colors group-hover:border-brand/35 group-hover:text-brand">
          <Icon className="size-5" strokeWidth={1.5} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-white/45">{description}</p>
      </CardContent>
    </Card>
  );
}
