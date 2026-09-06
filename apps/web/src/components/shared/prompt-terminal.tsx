import { Check, ChevronRight } from 'lucide-react';

const choices = [
  ['Language', 'TypeScript'],
  ['ORM / Query Builder', 'Drizzle ORM'],
  ['Database', 'PostgreSQL'],
  ['Authentication', 'Session / Cookies'],
];

export function PromptTerminal() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#09090a] shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex gap-2" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-brand/75" />
          <span className="size-2.5 rounded-full bg-ember/70" />
          <span className="size-2.5 rounded-full bg-white/20" />
        </div>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/30">
          nestforge
        </span>
      </div>
      <div className="space-y-5 p-5 font-mono text-xs sm:p-7 sm:text-sm">
        <p className="text-white/40">
          <span className="mr-3 text-brand">$</span>npx nestforge
        </p>
        {choices.map(([label, value]) => (
          <div key={label} className="grid gap-1 border-l border-white/10 pl-4 sm:grid-cols-[1fr_auto] sm:gap-5">
            <span className="text-white/45">{label}</span>
            <span className="flex items-center gap-2 text-white/85">
              <ChevronRight className="size-3.5 text-brand" />
              {value}
            </span>
          </div>
        ))}
        <div className="flex items-start gap-3 border-t border-white/10 pt-5 text-emerald-400/90">
          <Check className="mt-0.5 size-4" />
          <span>Project “my-nest-api” created successfully.</span>
        </div>
      </div>
    </div>
  );
}
