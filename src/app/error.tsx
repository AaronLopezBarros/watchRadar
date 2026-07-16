'use client';

import { useTranslations } from '@/src/components/LocaleProvider';

type ErrorProps = {
  error: Error & { digest?: string; status?: number };
};

export default function Error({ error }: ErrorProps) {
  const dict = useTranslations();
  const isNotFound = error.status === 404;
  const isServerError = error.status && error.status >= 500;

  const code = isNotFound ? '404' : isServerError ? '500' : dict.error.genericCode;
  const title = isNotFound ? dict.error.notFoundTitle : isServerError ? dict.error.serverTitle : dict.error.genericTitle;
  const description = isNotFound ? dict.error.notFoundBody : dict.error.serverBody;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4'>
      <div className='text-center'>
        <p className='text-8xl font-bold text-white/10'>{code}</p>
        <h1 className='mt-2 text-2xl font-semibold text-white'>{title}</h1>
        <p className='mt-2 text-sm text-blue-300/50'>{description}</p>
        <button
          onClick={() => (window.location.href = '/')}
          className='mt-8 rounded-md bg-white px-6 py-2.5 text-sm font-medium text-blue-950 transition-colors hover:bg-blue-50'
        >
          {dict.error.goHome}
        </button>
      </div>
    </div>
  );
}
