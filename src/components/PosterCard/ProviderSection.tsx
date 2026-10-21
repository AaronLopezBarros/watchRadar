'use client';

import Image from 'next/image';

import { useTranslations } from '@/components/LocaleProvider';
import type { WatchProvider } from '@/lib/api/tmdb/types';
import { getLogoUrl } from '@/lib/utils';

export const SKELETON_COUNT = 3;
const LOGO_SIZE = 32;

type ProviderSectionProps = {
  providers: WatchProvider[];
  isLoading: boolean;
};

export function ProviderSection({ providers, isLoading }: ProviderSectionProps) {
  const dict = useTranslations();

  return (
    <div className='border-t border-zinc-100 pt-2'>
      <p className='mb-1.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase'>
        {dict.provider.whereToWatch}
      </p>
      {isLoading && (
        <div className='flex gap-1.5'>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} data-testid='provider-skeleton' className='h-8 w-8 animate-pulse rounded-sm bg-zinc-200' />
          ))}
        </div>
      )}
      {!isLoading && providers.length > 0 && (
        <div className='flex flex-wrap items-center gap-1.5'>
          {providers.map(provider => (
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
        </div>
      )}
      {!isLoading && providers.length === 0 && (
        <p className='text-[10px] text-zinc-400'>{dict.provider.notAvailable}</p>
      )}
    </div>
  );
}
