import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CopyCommandProps = {
  commands: Array<{
    label: string;
    command: string;
  }>;
  className?: string;
};

export function CopyCommand({ commands, className }: CopyCommandProps) {
  const [copiedCommand, setCopiedCommand] = useState<string>();
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(
        () => setCopiedCommand(undefined),
        1800,
      );
    } catch {
      setCopiedCommand(undefined);
    }
  }

  return (
    <div
      className={cn(
        'group relative w-full overflow-hidden rounded-lg border border-white/10 bg-surface/80 p-1 shadow-2xl backdrop-blur-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:repeating-linear-gradient(45deg,#fff_0px,#fff_1px,transparent_1px,transparent_24px)]" />
      <div className="relative z-10 overflow-hidden rounded bg-black/50">
        {commands.map(({ label, command }, index) => {
          const copied = copiedCommand === command;

          return (
            <div
              key={command}
              className={cn(
                'flex items-center justify-between gap-3 px-4 py-2',
                index > 0 && 'border-t border-white/[0.07]',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-12 shrink-0 text-left font-mono text-[0.65rem] uppercase tracking-wider text-white/30">
                  {label}
                </span>
                <span className="select-none font-mono text-xs text-brand">$</span>
                <code className="truncate font-mono text-xs font-light text-white/90">
                  {command}
                </code>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-9 shrink-0 overflow-hidden px-0 transition-[width,color,background-color] duration-300',
                  copied
                    ? 'w-[5.75rem] bg-emerald-400/10 text-emerald-300'
                    : 'w-9 text-white/40',
                )}
                aria-label={copied ? `${label} command copied` : `Copy ${label.toLowerCase()} command`}
                onClick={() => copyCommand(command)}
              >
                <span
                  key={copied ? 'copied' : 'copy'}
                  className={copied ? 'copy-feedback flex items-center gap-1.5' : 'flex items-center'}
                >
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      <span className="text-xs font-medium">Copied</span>
                    </>
                  ) : (
                    <Copy className="size-4" />
                  )}
                </span>
              </Button>
            </div>
          );
        })}
        <span className="sr-only" aria-live="polite">
          {copiedCommand ? 'Command copied to clipboard' : ''}
        </span>
      </div>
    </div>
  );
}
