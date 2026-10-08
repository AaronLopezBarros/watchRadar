'use client';

import { CheckIcon, ShareIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLocale, useTranslations } from '@/src/components/LocaleProvider';
import { buildShareHref, cn } from '@/src/lib/utils';

const FEEDBACK_DURATION_MS = 2000;

// Desktop browsers expose `navigator.share` too, but there people expect the link copied to paste it in a chat;
// the OS share sheet (WhatsApp, Telegram…) only makes sense on touch devices.
const canUseNativeShare = () => Boolean(navigator.share) && window.matchMedia('(pointer: coarse)').matches;

const FEEDBACK_STYLE = {
  linkCopied: { className: 'text-emerald-600', icon: <CheckIcon className='h-3.5 w-3.5' strokeWidth={2.5} /> },
  copyFailed: { className: 'text-rose-600', icon: <XIcon className='h-3.5 w-3.5' strokeWidth={2.5} /> },
};

type ShareButtonProps = {
  movieId: number;
  title: string;
};

export function ShareButton({ movieId, title }: ShareButtonProps) {
  const dict = useTranslations();
  const locale = useLocale();
  const [feedback, setFeedback] = useState<keyof typeof FEEDBACK_STYLE | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timeout = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleShare = async () => {
    const url = `${window.location.origin}${buildShareHref(movieId, locale)}`;

    if (canUseNativeShare()) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissing the share sheet rejects too; there is nothing to report.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback('linkCopied');
    } catch {
      setFeedback('copyFailed');
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={handleShare}
        className='flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900'
      >
        <ShareIcon className='h-3.5 w-3.5' />
        {dict.movie.share}
      </button>
      <p
        role='status'
        className={cn('flex items-center gap-1 text-xs font-medium', feedback && FEEDBACK_STYLE[feedback].className)}
      >
        {feedback && (
          <>
            {FEEDBACK_STYLE[feedback].icon}
            {dict.movie[feedback]}
          </>
        )}
      </p>
    </div>
  );
}
