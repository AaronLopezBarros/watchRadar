import { headers } from 'next/headers';

export const DEFAULT_REGION = 'ES';

// Release dates and streaming catalogs are per country, so they follow where the visitor is, not their language.
export const getRegion = async (): Promise<string> => {
  const headerStore = await headers();
  const country = headerStore.get('x-vercel-ip-country');
  return country && /^[A-Z]{2}$/.test(country) ? country : DEFAULT_REGION;
};
