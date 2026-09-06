import { ArrowUpRight, Github, Sparkles } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { CopyCommand } from '@/components/shared/copy-command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10 px-5 py-24 sm:px-8 sm:py-32 lg:border-r lg:border-white/10 lg:py-36">
          <Badge className="fade-up">
            <Sparkles className="size-3.5 text-ember" />
            Open source · MIT
          </Badge>

          <h1 className="fade-up fade-up-delay-1 mt-7 max-w-4xl font-display text-5xl font-light leading-[0.94] tracking-[-0.065em] sm:text-7xl lg:text-[5.8rem]">
            Forge your NestJS foundation.
            <span className="ember-text block">Ship what matters.</span>
          </h1>

          <p className="fade-up fade-up-delay-2 mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            An interactive CLI that generates a production-ready NestJS project around the stack you choose—without maintaining a pile of boilerplate by hand.
          </p>

          <div className="fade-up fade-up-delay-3 mt-9 max-w-xl">
            <CopyCommand command="npx nestforge" />
            <p className="mt-3 font-mono text-xs text-white/35">
              Install globally with npm i -g nestforge-generator
            </p>
          </div>

          <div className="fade-up fade-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#workflow">
                See how it works
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/jeiel2013/NestForge" target="_blank" rel="noreferrer">
                <Github className="size-4" />
                View repository
              </a>
            </Button>
          </div>
        </div>

        <div className="relative hidden min-h-[calc(100vh-4.5rem)] items-center justify-center overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,35,60,0.18),transparent_56%)]" />
          <div className="absolute left-8 top-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/25">
            Interactive generator
          </div>
          <div className="absolute bottom-8 right-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/25">
            NestJS · TypeScript · Open source
          </div>
          <img
            src={logo}
            alt="NestForge dragon and anvil mark"
            className="relative z-10 w-[92%] max-w-2xl object-contain drop-shadow-[0_0_70px_rgba(239,35,60,0.2)]"
          />
        </div>
      </div>
    </section>
  );
}
