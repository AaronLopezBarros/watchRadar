import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LanguageSelector } from '@/src/components/LanguageSelector/LanguageSelector';

const refreshMock = vi.fn();
const setLocaleMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/lib/i18n/actions', () => ({
  setLocale: (locale: string) => setLocaleMock(locale),
}));

describe('LanguageSelector', () => {
  it('renders a closed toggle showing the current locale', () => {
    render(<LanguageSelector locale='en' />);

    const toggle = screen.getByRole('button', { name: 'Change language' });
    expect(toggle).toHaveTextContent('EN');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Switch to Español' })).not.toBeInTheDocument();
  });

  it('opens the options and marks the current locale as pressed', () => {
    render(<LanguageSelector locale='en' />);

    fireEvent.click(screen.getByRole('button', { name: 'Change language' }));

    expect(screen.getByRole('button', { name: 'Switch to English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Switch to Español' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches locale, refreshes the router and closes when picking a different language', async () => {
    render(<LanguageSelector locale='en' />);

    fireEvent.click(screen.getByRole('button', { name: 'Change language' }));
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Español' }));

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(setLocaleMock).toHaveBeenCalledWith('es');
    expect(screen.queryByRole('button', { name: 'Switch to Español' })).not.toBeInTheDocument();
  });

  it('closes without switching when clicking the already-active locale', () => {
    render(<LanguageSelector locale='en' />);

    fireEvent.click(screen.getByRole('button', { name: 'Change language' }));
    fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));

    expect(setLocaleMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Switch to English' })).not.toBeInTheDocument();
  });
});
