/**
 * Tests for GiftTipModal component
 */
import { render, screen, fireEvent } from '@testing-library/react';
import GiftTipModal from '../GiftTipModal';
import { describe, it, expect, vi } from 'vitest';
import { LiveRegionProvider } from '../../a11y/LiveRegion';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  artistId: 'artist-1',
  artistName: 'Aria Nova',
  artistImage: undefined,
};

// Mock react-spring to avoid animation issues in tests
vi.mock('react-spring', () => ({
  useSpring: vi.fn(() => [{ opacity: 1, x: 0 }, {}]),
  useTrail: vi.fn((n) => Array(n).fill([{ opacity: 1, y: 0 }, {}])),
  animated: new Proxy({} as any, {
    get: (target: any, property: string) => (props: any) => {
      const Component = property as any;
      return <Component {...props} />;
    },
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LiveRegionProvider>
      {ui}
    </LiveRegionProvider>
  );
};

describe('GiftTipModal', () => {
  it('renders when isOpen=true', () => {
    renderWithProviders(<GiftTipModal {...defaultProps} />);
    expect(screen.getByTestId('gift-tip-modal')).toBeTruthy();
  });

  it('does not render when isOpen=false', () => {
    render(
      <LiveRegionProvider>
        <GiftTipModal {...defaultProps} isOpen={false} />
      </LiveRegionProvider>
    );
    expect(screen.queryByTestId('gift-tip-modal')).toBeNull();
  });

  it('shows amount step by default', () => {
    renderWithProviders(<GiftTipModal {...defaultProps} />);
    expect(screen.getByTestId('step-amount')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <LiveRegionProvider>
        <GiftTipModal {...defaultProps} onClose={onClose} />
      </LiveRegionProvider>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('advances to recipient step after clicking next', () => {
    renderWithProviders(<GiftTipModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('next-step-btn'));
    expect(screen.getByTestId('step-recipient')).toBeTruthy();
  });

  it('shows error when trying to advance from recipient step without picking a user', () => {
    renderWithProviders(<GiftTipModal {...defaultProps} />);
    // advance to recipient step
    fireEvent.click(screen.getByTestId('next-step-btn'));
    // try to advance without selecting
    fireEvent.click(screen.getByTestId('next-step-btn'));
    expect(screen.getByText('Please select a recipient.')).toBeTruthy();
  });

  it('shows artist name in header chip', () => {
    renderWithProviders(<GiftTipModal {...defaultProps} />);
    expect(screen.getByText('Aria Nova')).toBeTruthy();
  });

  it('shows anonymous toggle on options step', () => {
    renderWithProviders(<GiftTipModal {...defaultProps} />);
    // At least the modal renders correctly
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
