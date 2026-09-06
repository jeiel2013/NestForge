import { CheckCircle2 } from 'lucide-react';
import { PromptTerminal } from '@/components/shared/prompt-terminal';
import { SectionHeading } from '@/components/shared/section-heading';

const outcomes = [
  'Dependencies match the selected features',
  'Environment examples and scripts are ready',
  'Database configuration fits the chosen provider',
  'Unit and E2E test foundations are included',
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="relative overflow-hidden border-b border-white/10 py-24 sm:py-32">
      <div className="absolute inset-y-0 left-1/2 hidden w-px bg-white/10 lg:block" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="One guided flow"
            title="Answer a few questions. Start with a coherent codebase."
            description="The CLI walks through the decisions that actually shape your backend, then builds the project and prints the exact commands to run next."
          />
          <ul className="mt-9 space-y-4">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3 text-sm text-white/60">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
        <PromptTerminal />
      </div>
    </section>
  );
}
