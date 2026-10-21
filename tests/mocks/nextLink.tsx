import type NextLink from 'next/link';
import type { ComponentProps } from 'react';

type LinkProps = Omit<ComponentProps<'a'>, 'href'> &
  Pick<ComponentProps<typeof NextLink>, 'onNavigate'> & { href: string };

export default function Link({ href, onClick, onNavigate, ...props }: LinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={event => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onNavigate?.({ preventDefault: () => {} });
      }}
    />
  );
}
