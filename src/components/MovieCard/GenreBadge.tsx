type GenreBadgeProps = {
  name: string;
};

export function GenreBadge({ name }: GenreBadgeProps) {
  return <span className='inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600'>{name}</span>;
}
