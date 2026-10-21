import { Anton, Audiowide } from 'next/font/google';

import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/locale';
import { LanguageSelector } from '@/src/components/LanguageSelector/LanguageSelector';

const anton = Anton({ subsets: ['latin'], weight: '400' });
const audiowide = Audiowide({ subsets: ['latin'], weight: '400' });

type HeaderProps = {
  locale: Locale;
};

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);

  return (
    <header className='relative flex justify-center px-4 pt-6'>
      <div className='absolute top-3 right-3 z-10'>
        <LanguageSelector locale={locale} />
      </div>
      <div className='@container w-full max-w-160'>
        <div
          className='relative flex w-full items-center justify-center gap-[3.667cqw] overflow-hidden px-[5cqw]'
          style={{ aspectRatio: '1200 / 320' }}
        >
          <div className='relative aspect-square w-[15.833cqw] flex-none'>
            <div className='absolute inset-0 rounded-full border-[0.25cqw] border-radar-cyan shadow-[0_0_18px_var(--color-radar-cyan),inset_0_0_22px_rgba(5,217,232,0.35)]' />
            <div className='absolute inset-[2.833cqw] rounded-full border-[0.167cqw] border-radar-cyan/55' />
            <div className='absolute inset-[5.833cqw] rounded-full border-[0.167cqw] border-radar-cyan/40' />
            <div className='absolute inset-y-[0.5cqw] left-1/2 w-[0.125cqw] -translate-x-1/2 bg-radar-cyan/35' />
            <div className='absolute inset-x-[0.5cqw] top-1/2 h-[0.125cqw] -translate-y-1/2 bg-radar-cyan/35' />
            <div
              className='absolute inset-[0.25cqw] animate-[wr-sweep_3.4s_linear_infinite] rounded-full motion-reduce:animate-none'
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(255,45,149,.65), rgba(255,45,149,0) 70deg, transparent 360deg)',
                WebkitMask: 'radial-gradient(circle, transparent 0, #000 0.333cqw)',
                mask: 'radial-gradient(circle, transparent 0, #000 0.333cqw)',
              }}
            />
            <div className='absolute top-[34%] left-[70%] h-[1.333cqw] w-[1.333cqw] animate-[wr-blip_3.4s_ease-in-out_infinite] rounded-full bg-radar-pink shadow-[0_0_14px_var(--color-radar-pink),0_0_26px_var(--color-radar-pink)] motion-reduce:animate-none' />
            <div className='absolute top-1/2 left-1/2 h-[1cqw] w-[1cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radar-cyan shadow-[0_0_12px_var(--color-radar-cyan)]' />
          </div>

          <div className='flex animate-[wr-flicker_6s_infinite] flex-col leading-[0.9] motion-reduce:animate-none'>
            <h1
              aria-label='WatchRadar'
              className={`${anton.className} text-[clamp(2rem,8.667cqw,3.467rem)] tracking-[-0.167cqw] whitespace-nowrap`}
            >
              <span
                aria-hidden='true'
                className='text-radar-ice [text-shadow:0_0_10px_rgba(5,217,232,0.7),0_0_28px_rgba(5,217,232,0.45)]'
              >
                watch
              </span>
              <span
                aria-hidden='true'
                className='text-radar-pink [text-shadow:0_0_12px_rgba(255,45,149,0.9),0_0_34px_rgba(255,45,149,0.6)]'
              >
                Radar
              </span>
            </h1>
            <p
              className={`${audiowide.className} mt-[0.667cqw] pl-[0.5cqw] text-[clamp(0.4375rem,1.417cqw,0.4375rem)] tracking-[0.625cqw] text-radar-steel uppercase`}
            >
              {dict.header.tagline}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
