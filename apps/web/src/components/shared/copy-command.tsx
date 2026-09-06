import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CopyCommandProps = {
  command: string;
  className?: string;
};

export function CopyCommand({ command, className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
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
      <div className="relative z-10 flex items-center justify-between rounded bg-black/50 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="select-none font-mono text-xs text-white/30">$</span>
          <code className="truncate font-mono text-xs font-light text-white/90">{command}</code>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 overflow-hidden px-0 transition-[width,color,background-color] duration-300',
            copied ? 'w-[5.75rem] bg-emerald-400/10 text-emerald-300' : 'w-9 text-white/40',
          )}
          aria-label={copied ? 'Command copied' : 'Copy command'}
          onClick={copyCommand}
        >
          <span key={copied ? 'copied' : 'copy'} className={copied ? 'copy-feedback flex items-center gap-1.5' : 'flex items-center'}>
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
        <span className="sr-only" aria-live="polite">
          {copied ? 'Command copied to clipboard' : ''}
        </span>
      </div>
    </div>
  );
}
