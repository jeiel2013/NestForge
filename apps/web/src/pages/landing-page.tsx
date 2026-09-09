import { AmbientGrid } from '@/components/background/ambient-grid';
import { ShaderBackground } from '@/components/background/shader-background';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { FeaturesSection } from '@/components/sections/features-section';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { HeroSection } from '@/components/sections/hero-section';
import { QualitySection } from '@/components/sections/quality-section';
import { StackSection } from '@/components/sections/stack-section';
import { WorkflowSection } from '@/components/sections/workflow-section';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ShaderBackground />
      <AmbientGrid />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <SiteHeader />
        <main>
          <HeroSection />
          <QualitySection />
          <FeaturesSection />
          <WorkflowSection />
          <StackSection />
          <FinalCtaSection />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
