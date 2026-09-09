import { ArrowLeft } from 'lucide-react';
import { AmbientGrid } from '@/components/background/ambient-grid';
import { SiteLink } from '@/components/shared/site-link';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 text-center">
      <AmbientGrid />
      <div className="relative z-10 max-w-xl">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-ember">404</p>
        <h1 className="mt-5 font-display text-5xl font-light tracking-[-0.05em]">
          Documentation route not found
        </h1>
        <p className="mt-5 text-base leading-7 text-white/52">
          The requested page does not exist in the current NestForge documentation.
        </p>
        <Button asChild className="mt-8">
          <SiteLink to="/">
            <ArrowLeft className="size-4" />
            Return to NestForge
          </SiteLink>
        </Button>
      </div>
    </main>
  );
}
