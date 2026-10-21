'use client';

import { useTranslations } from '@/components/LocaleProvider';
import type { Dictionary } from '@/lib/i18n/dictionary';

type ErrorProps = {
  error: Error & { digest?: string; status?: number };
};

const getErrorCopy = (status: number | undefined, copy: Dictionary['error']) => {
  if (status === 404) return { code: '404', title: copy.notFoundTitle, description: copy.notFoundBody };
  if (status && status >= 500) return { code: '500', title: copy.serverTitle, description: copy.serverBody };
  return { code: copy.genericCode, title: copy.genericTitle, description: copy.serverBody };
};

export default function Error({ error }: ErrorProps) {
  const dict = useTranslations();
  const { code, title, description } = getErrorCopy(error.status, dict.error);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4'>
      <div className='text-center'>
        <p className='text-8xl font-bold text-white/10'>{code}</p>
        <h1 className='mt-2 text-2xl font-semibold text-white'>{title}</h1>
        <p className='mt-2 text-sm text-blue-300/50'>{description}</p>
        <button
          type='button'
          // A full reload rather than a client navigation is what gets the app out of the error.
          onClick={() => window.location.assign('/')}
          className='mt-8 rounded-md bg-white px-6 py-2.5 text-sm font-medium text-blue-950 transition-colors hover:bg-blue-50'
        >
          {dict.error.goHome}
        </button>
      </div>
    </div>
  );
}
