import { BookOpen, Github, Package } from 'lucide-react';
import { SiteLink } from '@/components/shared/site-link';
import { sitePaths } from '@/lib/routes';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="brand-wordmark text-lg">
            Nest<span className="brand-forge-text">Forge</span>
          </p>
          <p className="mt-1 text-xs text-white/35">Open-source NestJS project generator · MIT License</p>
        </div>
        <div className="flex items-center gap-5 text-sm text-white/45">
          <SiteLink
            to={sitePaths.docs}
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <BookOpen className="size-4" /> Documentation
          </SiteLink>
          <a
            href="https://github.com/jeiel2013/NestForge"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Github className="size-4" /> GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/nestforge-generator"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Package className="size-4" /> npm
          </a>
        </div>
      </div>
    </footer>
  );
}
