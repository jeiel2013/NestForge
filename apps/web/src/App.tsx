import { SiteHeader } from '@/components/layout/site-header';
import { HeroSection } from '@/components/sections/hero-section';

function App() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SiteHeader />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}

export default App;
