import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigateTo } from '@/lib/use-pathname';

type SiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
};

export function SiteLink({ to, onClick, ...props }: SiteLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === '_blank'
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(to);
  }

  return <a href={to} onClick={handleClick} {...props} />;
}
