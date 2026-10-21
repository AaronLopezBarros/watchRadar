import type { ComponentProps } from 'react';

type ImageProps = Pick<ComponentProps<'img'>, 'alt' | 'title' | 'className' | 'fetchPriority'> & { src: string };

export default function Image({ alt, src, title, className, fetchPriority }: ImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} src={src} title={title} className={className} fetchPriority={fetchPriority} />;
}
