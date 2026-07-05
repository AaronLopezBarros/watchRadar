import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  default: () => ({ className: 'mocked-font', style: {}, variable: '' }),
  Anton: () => ({ className: 'mocked-font-anton', style: {}, variable: '' }),
  Audiowide: () => ({ className: 'mocked-font-audiowide', style: {}, variable: '' }),
  Plus_Jakarta_Sans: () => ({ className: 'mocked-font-plus-jakarta-sans', style: {}, variable: '' }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
