import { ArrowLeft, Github, Package } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { SiteLink } from '@/components/shared/site-link';
import { Button } from '@/components/ui/button';

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070707]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <SiteLink to="/" className="flex items-center gap-3" aria-label="NestForge home">
            <img src={logo} alt="" className="size-8 rounded-lg object-cover" />
            <span className="brand-wordmark text-lg">
              Nest<span className="brand-forge-text">Forge</span>
            </span>
          </SiteLink>
          <span className="hidden h-5 w-px bg-white/12 sm:block" />
          <span className="hidden font-mono text-xs uppercase tracking-[0.15em] text-white/38 sm:block">
            Documentation
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <SiteLink to="/">
              <ArrowLeft className="size-4" />
              Landing page
            </SiteLink>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <a href="https://www.npmjs.com/package/nestforge-generator" target="_blank" rel="noreferrer" aria-label="NestForge on npm">
              <Package className="size-4" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <a href="https://github.com/jeiel2013/NestForge" target="_blank" rel="noreferrer" aria-label="NestForge on GitHub">
              <Github className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
