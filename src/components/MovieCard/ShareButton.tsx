'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from '@/src/components/LocaleProvider';
import { cn, withMovieParam } from '@/src/lib/utils';

const FEEDBACK_DURATION_MS = 2000;

// Desktop browsers expose `navigator.share` too, but there people expect the link copied to paste it in a chat;
// the OS share sheet (WhatsApp, Telegram…) only makes sense on touch devices.
const canUseNativeShare = () => Boolean(navigator.share) && window.matchMedia('(pointer: coarse)').matches;

function ShareIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className='h-3.5 w-3.5'>
      <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
      <polyline points='16 6 12 2 8 6' />
      <line x1='12' y1='2' x2='12' y2='15' />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      className='h-3.5 w-3.5'
      aria-hidden='true'
    >
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      className='h-3.5 w-3.5'
      aria-hidden='true'
    >
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
  );
}

const FEEDBACK_STYLE = {
  linkCopied: { className: 'text-emerald-600', icon: <CheckIcon /> },
  copyFailed: { className: 'text-rose-600', icon: <CrossIcon /> },
};

type ShareButtonProps = {
  movieId: number;
  title: string;
};

export function ShareButton({ movieId, title }: ShareButtonProps) {
  const dict = useTranslations();
  const [feedback, setFeedback] = useState<keyof typeof FEEDBACK_STYLE | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timeout = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleShare = async () => {
    // The sender's category and filters stay out: the recipient only cares about the movie.
    const url = `${window.location.origin}${withMovieParam('', movieId)}`;

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
        <ShareIcon />
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
