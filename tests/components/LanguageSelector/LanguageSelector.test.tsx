import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    const toggle = screen.getByRole('button', { name: 'Change language: EN' });
    expect(toggle).toHaveTextContent('EN');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Switch to Español: ES' })).not.toBeInTheDocument();
  });

  it('opens the options and marks the current locale as pressed', async () => {
    render(<LanguageSelector locale='en' />);

    await userEvent.click(screen.getByRole('button', { name: 'Change language: EN' }));

    expect(screen.getByRole('button', { name: 'Switch to English: EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Switch to Español: ES' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches locale, refreshes the router and closes when picking a different language', async () => {
    render(<LanguageSelector locale='en' />);

    await userEvent.click(screen.getByRole('button', { name: 'Change language: EN' }));
    await userEvent.click(screen.getByRole('button', { name: 'Switch to Español: ES' }));

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(setLocaleMock).toHaveBeenCalledWith('es');
    expect(screen.queryByRole('button', { name: 'Switch to Español: ES' })).not.toBeInTheDocument();
  });

  it('closes without switching when clicking the already-active locale', async () => {
    render(<LanguageSelector locale='en' />);

    await userEvent.click(screen.getByRole('button', { name: 'Change language: EN' }));
    await userEvent.click(screen.getByRole('button', { name: 'Switch to English: EN' }));

    expect(setLocaleMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Switch to English: EN' })).not.toBeInTheDocument();
  });

  it('closes the options and returns focus to the toggle on Escape', async () => {
    render(<LanguageSelector locale='en' />);
    const toggle = screen.getByRole('button', { name: 'Change language: EN' });

    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Switch to Español: ES' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('button', { name: 'Switch to Español: ES' })).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('ignores other key presses while the options are open', async () => {
    render(<LanguageSelector locale='en' />);

    await userEvent.click(screen.getByRole('button', { name: 'Change language: EN' }));
    await userEvent.keyboard('a');

    expect(screen.getByRole('button', { name: 'Switch to Español: ES' })).toBeInTheDocument();
  });
});
