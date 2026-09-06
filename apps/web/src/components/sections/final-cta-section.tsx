import { ArrowUpRight, Github } from 'lucide-react';
import { CopyCommand } from '@/components/shared/copy-command';
import { Button } from '@/components/ui/button';

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(239,35,60,0.24),transparent_42%)]" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand">Ready at the terminal</p>
        <h2 className="mt-5 font-display text-5xl font-light leading-[0.98] tracking-[-0.055em] sm:text-7xl">
          Stop assembling boilerplate. Start building.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/50">
          Generate the foundation, inspect every file, and make it yours. NestForge is open source and built in public.
        </p>
        <CopyCommand
          commands={[
            { label: 'Install', command: 'npm i nestforge-generator' },
            { label: 'Run', command: 'npx nestforge' },
          ]}
          className="mx-auto mt-9 max-w-xl"
        />
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="https://www.npmjs.com/package/nestforge-generator" target="_blank" rel="noreferrer">
              Open on npm
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://github.com/jeiel2013/NestForge" target="_blank" rel="noreferrer">
              <Github className="size-4" />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
