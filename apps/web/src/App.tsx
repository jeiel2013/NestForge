import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { FeaturesSection } from '@/components/sections/features-section';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { HeroSection } from '@/components/sections/hero-section';
import { QualitySection } from '@/components/sections/quality-section';
import { StackSection } from '@/components/sections/stack-section';
import { WorkflowSection } from '@/components/sections/workflow-section';

function App() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
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
  );
}

export default App;
