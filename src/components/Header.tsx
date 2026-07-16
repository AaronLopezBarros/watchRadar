import { Anton, Audiowide } from 'next/font/google';

import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/locale';

const anton = Anton({ subsets: ['latin'], weight: '400' });
const audiowide = Audiowide({ subsets: ['latin'], weight: '400' });

type HeaderProps = {
  locale: Locale;
};

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);

  return (
    <header className='flex justify-center px-4 pt-6'>
      <div className='@container w-full max-w-[640px]'>
        <div
          className='relative flex w-full items-center justify-center gap-[3.667cqw] overflow-hidden px-[5cqw]'
          style={{ aspectRatio: '1200 / 320' }}
        >
          <div className='relative aspect-square w-[15.833cqw] flex-none'>
            <div className='absolute inset-0 rounded-full border-[0.25cqw] border-[#05d9e8] shadow-[0_0_18px_#05d9e8,inset_0_0_22px_rgba(5,217,232,0.35)]' />
            <div className='absolute inset-[2.833cqw] rounded-full border-[0.167cqw] border-[rgba(5,217,232,0.55)]' />
            <div className='absolute inset-[5.833cqw] rounded-full border-[0.167cqw] border-[rgba(5,217,232,0.4)]' />
            <div className='absolute inset-y-[0.5cqw] left-1/2 w-[0.125cqw] -translate-x-1/2 bg-[rgba(5,217,232,0.35)]' />
            <div className='absolute inset-x-[0.5cqw] top-1/2 h-[0.125cqw] -translate-y-1/2 bg-[rgba(5,217,232,0.35)]' />
            <div
              className='motion-reduce:animate-none absolute inset-[0.25cqw] animate-[wr-sweep_3.4s_linear_infinite] rounded-full'
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(255,45,149,.65), rgba(255,45,149,0) 70deg, transparent 360deg)',
                WebkitMask: 'radial-gradient(circle, transparent 0, #000 0.333cqw)',
                mask: 'radial-gradient(circle, transparent 0, #000 0.333cqw)',
              }}
            />
            <div className='motion-reduce:animate-none absolute top-[34%] left-[70%] h-[1.333cqw] w-[1.333cqw] animate-[wr-blip_3.4s_ease-in-out_infinite] rounded-full bg-[#ff2d95] shadow-[0_0_14px_#ff2d95,0_0_26px_#ff2d95]' />
            <div className='absolute top-1/2 left-1/2 h-[1cqw] w-[1cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#05d9e8] shadow-[0_0_12px_#05d9e8]' />
          </div>

          <div className='motion-reduce:animate-none flex animate-[wr-flicker_6s_infinite] flex-col leading-[0.9]'>
            <h1
              aria-label='WatchRadar'
              className={`${anton.className} text-[8.667cqw] tracking-[-0.167cqw] whitespace-nowrap`}
            >
              <span
                aria-hidden='true'
                className='text-[#e8f6ff] [text-shadow:0_0_10px_rgba(5,217,232,0.7),0_0_28px_rgba(5,217,232,0.45)]'
              >
                watch
              </span>
              <span
                aria-hidden='true'
                className='text-[#ff2d95] [text-shadow:0_0_12px_rgba(255,45,149,0.9),0_0_34px_rgba(255,45,149,0.6)]'
              >
                Radar
              </span>
            </h1>
            <p
              className={`${audiowide.className} mt-[0.667cqw] pl-[0.5cqw] text-[1.417cqw] tracking-[0.625cqw] whitespace-nowrap text-[#8fb6d9] uppercase`}
            >
              {dict.header.tagline}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
