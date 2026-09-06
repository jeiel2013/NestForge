import type { MouseEvent as ReactMouseEvent } from 'react';

let activeAnimationFrame = 0;
let targetHighlightTimer = 0;

function easeInOutQuart(progress: number) {
  return progress < 0.5
    ? 8 * progress * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 4) / 2;
}

export function scrollToSection(
  event: ReactMouseEvent<HTMLAnchorElement>,
  href: `#${string}`,
) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const target = document.querySelector<HTMLElement>(href);

  if (!target) {
    return;
  }

  event.preventDefault();
  window.cancelAnimationFrame(activeAnimationFrame);
  window.clearTimeout(targetHighlightTimer);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startPosition = window.scrollY;
  const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 72;
  const targetPosition = Math.max(
    0,
    target.getBoundingClientRect().top + startPosition - headerHeight,
  );
  const distance = targetPosition - startPosition;

  window.history.pushState(null, '', href);

  const revealTarget = () => {
    if (reduceMotion) {
      return;
    }

    target.classList.remove('section-arrival');
    void target.offsetWidth;
    target.classList.add('section-arrival');
    targetHighlightTimer = window.setTimeout(
      () => target.classList.remove('section-arrival'),
      900,
    );
  };

  if (reduceMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, targetPosition);
    revealTarget();
    return;
  }

  const duration = Math.min(950, Math.max(520, Math.abs(distance) * 0.38));
  const startedAt = performance.now();

  const animateScroll = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    window.scrollTo(0, startPosition + distance * easeInOutQuart(progress));

    if (progress < 1) {
      activeAnimationFrame = window.requestAnimationFrame(animateScroll);
      return;
    }

    revealTarget();
  };

  activeAnimationFrame = window.requestAnimationFrame(animateScroll);
}
