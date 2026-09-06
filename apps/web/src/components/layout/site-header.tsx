import { Github, Menu, Package, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logo from '../../../assets/logo.png';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { scrollToSection } from '@/lib/scroll-to-section';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'How it works' },
  { href: '#stack', label: 'Stack' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>();
  const activeLinkTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(activeLinkTimer.current), []);

  function activateLink(href: `#${string}`) {
    setActiveHref(href);
    window.clearTimeout(activeLinkTimer.current);
    activeLinkTimer.current = window.setTimeout(
      () => setActiveHref(undefined),
      1100,
    );
  }

  return (
    <header className="frame-corners sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-3"
          aria-label="NestForge home"
          onClick={(event) => {
            scrollToSection(event, '#top');
            activateLink('#top');
          }}
        >
          <img src={logo} alt="" className="size-9 rounded-lg object-cover" />
          <span className="font-display text-base font-medium tracking-[-0.03em]">
            Nest<span className="text-brand">Forge</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'header-anchor relative py-2 text-sm text-white/55 transition-colors hover:text-white',
                activeHref === link.href && 'header-anchor-active text-white',
              )}
              onClick={(event) => {
                scrollToSection(event, link.href as `#${string}`);
                activateLink(link.href as `#${string}`);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <a href="https://www.npmjs.com/package/nestforge-generator" target="_blank" rel="noreferrer">
              <Package className="size-4" />
              npm
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/jeiel2013/NestForge" target="_blank" rel="noreferrer">
              <Github className="size-4" />
              GitHub
            </a>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {menuOpen && (
        <nav className="mobile-navigation-enter border-t border-white/10 bg-black px-5 py-5 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-3 text-sm text-white/70 transition-[background-color,color,transform] duration-300 hover:translate-x-1 hover:bg-white/5 hover:text-white',
                  activeHref === link.href && 'translate-x-1 bg-white/5 text-white',
                )}
                onClick={(event) => {
                  scrollToSection(event, link.href as `#${string}`);
                  activateLink(link.href as `#${string}`);
                  setMenuOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
