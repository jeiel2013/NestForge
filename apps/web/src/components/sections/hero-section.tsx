import { ArrowUpRight, BookOpen, Github } from 'lucide-react';
import type { CSSProperties } from 'react';
import { CopyCommand } from '@/components/shared/copy-command';
import { Button } from '@/components/ui/button';
import { scrollToSection } from '@/lib/scroll-to-section';
import { SiteLink } from '@/components/shared/site-link';
import { sitePaths } from '@/lib/routes';

const titleLines = [
  [
    { text: 'Forge' },
    { text: 'your' },
    { text: 'NestJS' },
    { text: 'foundation.' },
  ],
  [
    { text: 'NestForge', accent: true },
    { text: 'handles' },
    { text: 'the' },
    { text: 'rest.' },
  ],
];

const description =
  'An interactive CLI that generates a production-ready NestJS project around the stack you choose—without maintaining boilerplate by hand.';

function animationDelay(index: number) {
  return { '--word-index': index } as CSSProperties;
}

export function HeroSection() {
  let titleWordIndex = 0;

  return (
    <section id="top" className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col items-center justify-center px-4 pb-24 pt-32 text-center">
        <div className="relative z-10 mb-6 flex w-full max-w-5xl flex-col items-center justify-center">
          <h1 className="flex w-full flex-col items-center font-display text-5xl font-thin leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            {titleLines.map((line, lineIndex) => (
              <span
                key={line.map(({ text }) => text).join('-')}
                className={lineIndex === 1 ? 'mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-white/90' : 'flex flex-wrap justify-center gap-x-4 gap-y-2'}
              >
                {line.map((word) => {
                  const index = titleWordIndex++;

                  return (
                    <span key={word.text} className="hero-word-clip">
                      <span
                        className={word.accent ? 'hero-title-word ember-text' : 'hero-title-word'}
                        style={animationDelay(index)}
                      >
                        {word.text}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
        </div>

        <p className="relative z-10 mx-auto mb-10 max-w-xl font-sans text-sm font-thin leading-relaxed text-white/60 sm:text-base">
          {description.split(' ').map((word, index) => (
            <span key={`${word}-${index}`} className="hero-word-clip mr-1.5 align-top">
              <span className="hero-description-word" style={animationDelay(index)}>
                {word}
              </span>
            </span>
          ))}
        </p>

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6">
          <div className="hero-command-enter w-full">
            <CopyCommand
              commands={[
                { label: 'Install', command: 'npm i nestforge-generator' },
                { label: 'Run', command: 'npx nestforge' },
              ]}
            />
          </div>

          <div className="hero-actions-enter flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <SiteLink
                className="w-full sm:w-auto"
                to={sitePaths.docs}
              >
                <BookOpen className="size-4" />
                Read the docs
                <ArrowUpRight className="size-4" />
              </SiteLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                className="group w-full sm:w-auto"
                href="https://github.com/jeiel2013/NestForge"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="size-4" />
                View repository
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <button
              type="button"
              className="text-sm text-white/45 transition-colors hover:text-white"
              onClick={(event) => scrollToSection(event, '#workflow')}
            >
              See how it works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
