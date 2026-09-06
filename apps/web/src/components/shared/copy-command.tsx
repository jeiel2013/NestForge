import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CopyCommandProps = {
  command: string;
  className?: string;
};

export function CopyCommand({ command, className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-xl border border-white/12 bg-black/55 p-2 pl-4 shadow-2xl backdrop-blur',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="select-none font-mono text-xs text-brand">$</span>
        <code className="truncate font-mono text-sm text-white/85">{command}</code>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={copied ? 'Command copied' : 'Copy command'}
        onClick={copyCommand}
      >
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}
