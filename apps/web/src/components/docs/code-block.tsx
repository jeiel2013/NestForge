import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type CodeBlockProps = {
  code: string;
  label?: string;
};

export function CodeBlock({ code, label = 'Terminal' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#09090a]">
      <div className="flex h-10 items-center justify-between border-b border-white/[0.08] px-4">
        <span className="font-mono text-xs text-white/38">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-3"
          onClick={copy}
          aria-label={copied ? 'Code copied' : 'Copy code'}
        >
          {copied ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
          <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-7 text-white/78">
        <code>{code}</code>
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Code copied to clipboard' : ''}
      </span>
    </div>
  );
}
