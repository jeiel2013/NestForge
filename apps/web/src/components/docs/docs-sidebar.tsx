import { docsNavigation } from '@/content/docs-navigation';
import { SiteLink } from '@/components/shared/site-link';
import { cn } from '@/lib/utils';

type DocsSidebarProps = {
  pathname: string;
};

export function DocsSidebar({ pathname }: DocsSidebarProps) {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto border-r border-white/10 py-8 pr-6 lg:block">
      <nav aria-label="Documentation">
        {docsNavigation.map((group) => (
          <div key={group.label} className="mb-8">
            <p className="mb-2 px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/28">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <SiteLink
                      to={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                        active
                          ? 'bg-white/[0.075] text-white'
                          : 'text-white/46 hover:bg-white/[0.04] hover:text-white/80',
                      )}
                    >
                      <Icon className={cn('size-4', active && 'text-ember')} />
                      {item.title}
                    </SiteLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
