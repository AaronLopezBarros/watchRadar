'use client';

type ErrorProps = {
  error: Error & { digest?: string; status?: number };
};

export default function Error({ error }: ErrorProps) {
  const isNotFound = error.status === 404;
  const isServerError = error.status && error.status >= 500;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4'>
      <div className='w-full max-w-md space-y-6 text-center'>
        <div className='space-y-2'>
          <h1 className='text-6xl font-bold text-gray-900 dark:text-gray-100'>{isNotFound ? '404' : 'Oops!'}</h1>
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            {isNotFound ? 'No encontrado' : isServerError ? 'Error del servidor' : 'Algo salió mal'}
          </h2>

          <button
            onClick={() => (window.location.href = '/')}
            className='rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
