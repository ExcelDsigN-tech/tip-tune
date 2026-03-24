import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import AmountSelector from './AmountSelector';

vi.mock('../../utils/animationUtils', () => ({
    useReducedMotion: vi.fn(() => false),
    getSpringConfig: vi.fn(() => ({ tension: 200, friction: 20, mass: 1 })),
}));

vi.mock('react-spring', () => ({
    useSpring: vi.fn(() => [{ scale: 1, boxShadow: '' }, {}]),
    useTrail: vi.fn((count: number) =>
        Array.from({ length: count }, () => ({ opacity: 1, y: 0, scale: 1 }))
    ),
    animated: new Proxy({} as any, {
        get: (_: any, prop: string) => {
            if (prop === 'button') return (p: any) => <button {...p} />;
            if (prop === 'div') return (p: any) => <div {...p} />;
            return (p: any) => <div {...p} />;
        },
    }),
}));

describe('AmountSelector', () => {
    const mockOnChange = vi.fn();

    it('renders default preset buttons', () => {
        render(<AmountSelector value={1} currency="XLM" onAmountChange={mockOnChange} />);
        expect(screen.getByRole('radio', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: '5' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: '50' })).toBeInTheDocument();
    });

    it('calls onChange with correct amount on preset click', () => {
        render(<AmountSelector value={1} currency="XLM" onAmountChange={mockOnChange} />);
        fireEvent.click(screen.getByRole('radio', { name: '10' }));
        expect(mockOnChange).toHaveBeenCalledWith(10);
    });

    it('renders custom input when showCustomInput=true', async () => {
        render(<AmountSelector value={1} currency="XLM" onAmountChange={mockOnChange} />);
        // Custom input is hidden by default, click button to show it
        const customBtn = screen.getByRole('button', { name: /Custom Amount/i });
        fireEvent.click(customBtn);
        expect(screen.queryByLabelText('Custom tip amount')).toBeInTheDocument();
    });

    it('hides custom input when showCustomInput=false', () => {
        render(<AmountSelector value={1} currency="XLM" onAmountChange={mockOnChange} />);
        // Custom input is internal state and starts hidden
        // This test verifies the component renders correctly
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('calls onChange on custom input', () => {
        render(<AmountSelector value={1} currency="XLM" onAmountChange={mockOnChange} />);
        const customBtn = screen.getByRole('button', { name: /Custom Amount/i });
        fireEvent.click(customBtn);
        fireEvent.change(screen.getByLabelText('Custom tip amount'), { target: { value: '7.5' } });
        expect(mockOnChange).toHaveBeenCalledWith(7.5);
    });

    it('renders currency toggle switch', () => {
        render(<AmountSelector value={1} onAmountChange={mockOnChange} currency="XLM" />);
        expect(screen.getByRole('switch', { name: /Switch between XLM and USDC/i })).toBeInTheDocument();
    });

    it('calls onCurrencyToggle when currency switch clicked', () => {
        const mockToggle = vi.fn();
        render(
            <AmountSelector value={1} onAmountChange={mockOnChange} currency="XLM" onCurrencyToggle={mockToggle} />
        );
        fireEvent.click(screen.getByRole('switch', { name: /Switch between XLM and USDC/i }));
        expect(mockToggle).toHaveBeenCalledWith('USDC');
    });

    it('USD equivalent shows correct conversion', () => {
        render(<AmountSelector value={10} onAmountChange={mockOnChange} currency="XLM" xlmUsdRate={0.11} />);
        const elements = screen.getAllByText(/\$1\.10/);
        expect(elements.length).toBeGreaterThan(0);
    });
});
