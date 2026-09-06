export function AmbientGrid() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] flex justify-center overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.02] [background-image:repeating-linear-gradient(45deg,#fff_0px,#fff_1px,transparent_1px,transparent_24px)]" />

      <div className="relative h-full w-full max-w-7xl">
        <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
        <div className="absolute inset-y-0 left-1/4 hidden w-px bg-white/[0.04] sm:block">
          <div className="ambient-beam ambient-beam-primary h-[25vh] w-full bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        </div>
        <div className="absolute inset-y-0 left-1/2 hidden w-px bg-white/[0.04] sm:block" />
        <div className="absolute inset-y-0 left-3/4 hidden w-px bg-white/[0.04] sm:block">
          <div className="ambient-beam ambient-beam-secondary h-[30vh] w-full bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
      </div>
    </div>
  );
}
