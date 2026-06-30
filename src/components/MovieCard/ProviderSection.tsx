import Image from 'next/image';

import type { WatchProvider } from '@/src/lib/api/tmdb/types';
import { getLogoUrl } from '@/src/lib/utils';

const SKELETON_COUNT = 3;
const LOGO_SIZE = 32;

type ProviderSectionProps = {
  providers: WatchProvider[];
  isLoading: boolean;
  maxVisible?: number;
};

export function ProviderSection({ providers, isLoading, maxVisible }: ProviderSectionProps) {
  const visibleProviders = maxVisible !== undefined ? providers.slice(0, maxVisible) : providers;
  const extraCount = providers.length - visibleProviders.length;

  return (
    <div className='border-t border-zinc-100 pt-2'>
      <p className='mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400'>Where to watch</p>
      {isLoading && (
        <div className='flex gap-1.5'>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} className='h-8 w-8 animate-pulse rounded-sm bg-zinc-200' />
          ))}
        </div>
      )}
      {!isLoading && visibleProviders.length > 0 && (
        <div className='flex flex-wrap items-center gap-1.5'>
          {visibleProviders.map(provider => (
            <Image
              key={provider.provider_id}
              src={getLogoUrl(provider.logo_path)}
              alt={provider.provider_name}
              title={provider.provider_name}
              width={LOGO_SIZE}
              height={LOGO_SIZE}
              className='rounded-sm'
            />
          ))}
          {extraCount > 0 && <span className='text-[10px] font-medium text-zinc-400'>+{extraCount}</span>}
        </div>
      )}
      {!isLoading && visibleProviders.length === 0 && (
        <p className='text-[10px] text-zinc-400'>Not available for streaming</p>
      )}
    </div>
  );
}
