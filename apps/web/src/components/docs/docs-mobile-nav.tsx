import { ChevronDown } from 'lucide-react';
import { docsNavigation } from '@/content/docs-navigation';
import { navigateTo } from '@/lib/use-pathname';

type DocsMobileNavProps = {
  pathname: string;
};

export function DocsMobileNav({ pathname }: DocsMobileNavProps) {
  return (
    <div className="relative mb-8 lg:hidden">
      <label htmlFor="docs-page" className="mb-2 block font-mono text-xs uppercase tracking-wider text-white/40">
        Documentation page
      </label>
      <select
        id="docs-page"
        value={pathname}
        onChange={(event) => navigateTo(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-white/12 bg-surface px-4 pr-11 text-sm text-white outline-none focus:border-ember"
      >
        {docsNavigation.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <option key={item.href} value={item.href}>
                {item.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-4 size-5 text-white/40" />
    </div>
  );
}
