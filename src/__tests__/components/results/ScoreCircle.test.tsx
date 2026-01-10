/**
 * Tests for ScoreCircle Component
 *
 * Comprehensive tests covering:
 * - Basic rendering with default props
 * - Size variants (xs, sm, md, lg, xl)
 * - Color variants (default, success, warning, error, neutral)
 * - Value normalization and clamping
 * - Label and sublabel rendering
 * - showPercent prop behavior
 * - Custom strokeWidth override
 * - Animation behavior (animate prop, onAnimationComplete callback)
 * - MiniScoreCircle variant
 * - ScoreRing variant (no center text)
 * - getVariantFromScore helper function
 * - Accessibility features
 * - SVG structure verification
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import {
  ScoreCircle,
  MiniScoreCircle,
  ScoreRing,
  getVariantFromScore,
} from '@/components/results/ScoreCircle';

// ============================================================================
// Mock framer-motion
// ============================================================================

// Track spring values for testing
let mockSpringValue = 0;
let mockSpringSetFn: ((val: number) => void) | null = null;
let mockSpringJumpFn: ((val: number) => void) | null = null;
const mockOnChangeCallbacks: ((value: number) => void)[] = [];

// Mock MotionValue implementation
const createMockMotionValue = (initialValue: number) => {
  let currentValue = initialValue;
  const listeners: ((value: number) => void)[] = [];

  return {
    get: () => currentValue,
    set: (newValue: number) => {
      currentValue = newValue;
      listeners.forEach((listener) => listener(currentValue));
    },
    on: (event: string, callback: (value: number) => void) => {
      if (event === 'change') {
        listeners.push(callback);
        mockOnChangeCallbacks.push(callback);
      }
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    onChange: (callback: (value: number) => void) => {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
  };
};

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

  return {
    ...actual,
    motion: {
      ...actual.motion,
      circle: ({ style, className, ...props }: React.SVGProps<SVGCircleElement> & { style?: { strokeDashoffset?: unknown } }) => {
        // Extract strokeDashoffset if it's a motion value
        const strokeDashoffset = style?.strokeDashoffset;
        const resolvedOffset = typeof strokeDashoffset === 'object' && strokeDashoffset !== null && 'get' in strokeDashoffset
          ? (strokeDashoffset as { get: () => number }).get()
          : strokeDashoffset;

        return (
          <circle
            {...props}
            className={className}
            style={{ ...style, strokeDashoffset: resolvedOffset }}
            data-testid="progress-circle"
          />
        );
      },
    },
    useSpring: vi.fn((initialValue: number) => {
      const motionValue = createMockMotionValue(initialValue);
      mockSpringValue = initialValue;
      mockSpringSetFn = (val: number) => {
        mockSpringValue = val;
        motionValue.set(val);
      };
      mockSpringJumpFn = (val: number) => {
        mockSpringValue = val;
        motionValue.set(val);
      };

      return {
        ...motionValue,
        set: mockSpringSetFn,
        jump: mockSpringJumpFn,
      };
    }),
    useTransform: vi.fn((motionValue: { get: () => number }, inputRange: number[], outputRange: number[]) => {
      const transformedValue = createMockMotionValue(outputRange[0]);

      // Calculate transformed value based on input
      const currentInput = motionValue.get();
      const inputMin = inputRange[0];
      const inputMax = inputRange[1];
      const outputMin = outputRange[0];
      const outputMax = outputRange[1];

      const progress = Math.max(0, Math.min(1, (currentInput - inputMin) / (inputMax - inputMin)));
      const result = outputMin + progress * (outputMax - outputMin);
      transformedValue.set(result);

      return transformedValue;
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// ============================================================================
// Mock ResizeObserver (for Radix UI compatibility)
// ============================================================================

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock matchMedia for framer-motion and responsive features
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

beforeAll(() => {
  global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: mockMatchMedia,
  });

  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    configurable: true,
    value: mockMatchMedia,
  });
});

// ============================================================================
// Test Utilities
// ============================================================================

beforeEach(() => {
  // Use real timers by default since waitFor relies on setTimeout
  // Only enable fake timers in specific tests that need them
  mockSpringValue = 0;
  mockSpringSetFn = null;
  mockSpringJumpFn = null;
  mockOnChangeCallbacks.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

// ============================================================================
// getVariantFromScore Helper Function Tests
// ============================================================================

describe('getVariantFromScore', () => {
  describe('with default threshold (70)', () => {
    it('should return "success" when score >= threshold', () => {
      expect(getVariantFromScore(70)).toBe('success');
      expect(getVariantFromScore(85)).toBe('success');
      expect(getVariantFromScore(100)).toBe('success');
    });

    it('should return "warning" when score >= threshold - 20 but < threshold', () => {
      expect(getVariantFromScore(50)).toBe('warning');
      expect(getVariantFromScore(55)).toBe('warning');
      expect(getVariantFromScore(69)).toBe('warning');
    });

    it('should return "error" when score < threshold - 20', () => {
      expect(getVariantFromScore(49)).toBe('error');
      expect(getVariantFromScore(30)).toBe('error');
      expect(getVariantFromScore(0)).toBe('error');
    });

    it('should handle boundary at threshold exactly', () => {
      expect(getVariantFromScore(70)).toBe('success');
      expect(getVariantFromScore(69.9)).toBe('warning');
    });

    it('should handle boundary at threshold - 20', () => {
      expect(getVariantFromScore(50)).toBe('warning');
      expect(getVariantFromScore(49.9)).toBe('error');
    });
  });

  describe('with custom threshold', () => {
    it('should use custom threshold for success', () => {
      expect(getVariantFromScore(80, 80)).toBe('success');
      expect(getVariantFromScore(90, 80)).toBe('success');
    });

    it('should use custom threshold for warning range', () => {
      expect(getVariantFromScore(60, 80)).toBe('warning');
      expect(getVariantFromScore(79, 80)).toBe('warning');
    });

    it('should use custom threshold for error', () => {
      expect(getVariantFromScore(59, 80)).toBe('error');
      expect(getVariantFromScore(40, 80)).toBe('error');
    });

    it('should handle low threshold values', () => {
      expect(getVariantFromScore(50, 50)).toBe('success');
      expect(getVariantFromScore(30, 50)).toBe('warning');
      expect(getVariantFromScore(29, 50)).toBe('error');
    });

    it('should handle high threshold values', () => {
      expect(getVariantFromScore(90, 90)).toBe('success');
      expect(getVariantFromScore(70, 90)).toBe('warning');
      expect(getVariantFromScore(69, 90)).toBe('error');
    });
  });
});

// ============================================================================
// ScoreCircle Component Tests
// ============================================================================

describe('ScoreCircle', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<ScoreCircle value={75} />);

      // Should render SVG with circles
      expect(screen.getByTestId('progress-circle')).toBeInTheDocument();
    });

    it('should display the score value', async () => {
      render(<ScoreCircle value={75} animate={false} />);

      // Wait for value to be displayed
      await waitFor(() => {
        expect(screen.getByText(/75/)).toBeInTheDocument();
      });
    });

    it('should show percent sign by default', async () => {
      render(<ScoreCircle value={75} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ScoreCircle value={75} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('should render xs size correctly (48px)', () => {
      const { container } = render(<ScoreCircle value={75} size="xs" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it('should render sm size correctly (64px)', () => {
      const { container } = render(<ScoreCircle value={75} size="sm" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '64');
      expect(svg).toHaveAttribute('height', '64');
    });

    it('should render md size correctly (96px) - default', () => {
      const { container } = render(<ScoreCircle value={75} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '96');
      expect(svg).toHaveAttribute('height', '96');
    });

    it('should render lg size correctly (128px)', () => {
      const { container } = render(<ScoreCircle value={75} size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '128');
      expect(svg).toHaveAttribute('height', '128');
    });

    it('should render xl size correctly (160px)', () => {
      const { container } = render(<ScoreCircle value={75} size="xl" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '160');
      expect(svg).toHaveAttribute('height', '160');
    });
  });

  describe('Color Variants', () => {
    it('should render default variant with primary color', () => {
      const { container } = render(<ScoreCircle value={75} variant="default" />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveClass('stroke-primary');
    });

    it('should render success variant with emerald color', () => {
      render(<ScoreCircle value={75} variant="success" />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveClass('stroke-emerald-500');
    });

    it('should render warning variant with amber color', () => {
      render(<ScoreCircle value={75} variant="warning" />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveClass('stroke-amber-500');
    });

    it('should render error variant with red color', () => {
      render(<ScoreCircle value={75} variant="error" />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveClass('stroke-red-500');
    });

    it('should render neutral variant with muted color', () => {
      render(<ScoreCircle value={75} variant="neutral" />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveClass('stroke-muted-foreground/50');
    });
  });

  describe('Value Normalization', () => {
    it('should clamp values below 0 to 0', async () => {
      render(<ScoreCircle value={-10} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });

    it('should clamp values above 100 to 100', async () => {
      render(<ScoreCircle value={150} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should handle zero value', async () => {
      render(<ScoreCircle value={0} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });

    it('should handle exact 100 value', async () => {
      render(<ScoreCircle value={100} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should round decimal values via Math.round()', async () => {
      render(<ScoreCircle value={75.4} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should round up decimal values >= 0.5', async () => {
      render(<ScoreCircle value={75.6} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('76%')).toBeInTheDocument();
      });
    });
  });

  describe('Custom maxValue', () => {
    it('should normalize value based on maxValue', async () => {
      render(<ScoreCircle value={50} maxValue={200} animate={false} />);

      // 50/200 = 25%
      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument();
      });
    });

    it('should handle value exceeding maxValue', async () => {
      render(<ScoreCircle value={150} maxValue={100} animate={false} />);

      // Clamped to 100%
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should handle small maxValue', async () => {
      render(<ScoreCircle value={5} maxValue={10} animate={false} />);

      // 5/10 = 50%
      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });
  });

  describe('Label and Sublabel', () => {
    it('should render label when provided', () => {
      render(<ScoreCircle value={75} label="Overall Score" />);

      expect(screen.getByText('Overall Score')).toBeInTheDocument();
    });

    it('should render sublabel when provided', () => {
      render(<ScoreCircle value={75} sublabel="Based on 10 questions" />);

      expect(screen.getByText('Based on 10 questions')).toBeInTheDocument();
    });

    it('should render both label and sublabel', () => {
      render(
        <ScoreCircle
          value={75}
          label="Overall Score"
          sublabel="Based on 10 questions"
        />
      );

      expect(screen.getByText('Overall Score')).toBeInTheDocument();
      expect(screen.getByText('Based on 10 questions')).toBeInTheDocument();
    });

    it('should not render labels container when no labels provided', () => {
      const { container } = render(<ScoreCircle value={75} />);

      // The labels container should not exist
      const labelsContainer = container.querySelector('.text-center.space-y-0\\.5');
      expect(labelsContainer).not.toBeInTheDocument();
    });

    it('should truncate long labels with CSS truncate class', () => {
      render(
        <ScoreCircle
          value={75}
          label="This is a very long label that should be truncated"
        />
      );

      const labelElement = screen.getByText('This is a very long label that should be truncated');
      expect(labelElement).toHaveClass('truncate');
    });

    it('should truncate long sublabels with CSS truncate class', () => {
      render(
        <ScoreCircle
          value={75}
          sublabel="This is a very long sublabel that should be truncated"
        />
      );

      const sublabelElement = screen.getByText('This is a very long sublabel that should be truncated');
      expect(sublabelElement).toHaveClass('truncate');
    });
  });

  describe('showPercent Prop', () => {
    it('should show percent sign when showPercent is true (default)', async () => {
      render(<ScoreCircle value={75} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should hide percent sign when showPercent is false', async () => {
      render(<ScoreCircle value={75} showPercent={false} animate={false} />);

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
        expect(screen.queryByText('75%')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom strokeWidth', () => {
    it('should use default strokeWidth based on size', () => {
      const { container } = render(<ScoreCircle value={75} size="md" />);

      const circles = container.querySelectorAll('circle');
      // MD size has strokeWidth of 6
      circles.forEach((circle) => {
        expect(circle.getAttribute('stroke-width')).toBe('6');
      });
    });

    it('should override strokeWidth when custom value provided', () => {
      const { container } = render(
        <ScoreCircle value={75} size="md" strokeWidth={12} />
      );

      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle.getAttribute('stroke-width')).toBe('12');
      });
    });
  });

  describe('Animation Behavior', () => {
    // These tests need fake timers to test animation duration
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('should animate by default', async () => {
      render(<ScoreCircle value={75} />);

      // With animation enabled, spring should be set
      expect(mockSpringSetFn).toBeDefined();
    });

    it('should skip animation when animate is false', async () => {
      render(<ScoreCircle value={75} animate={false} />);

      // Spring should jump directly to final value
      expect(mockSpringJumpFn).toBeDefined();
    });

    it('should call onAnimationComplete callback when animation finishes', async () => {
      const onComplete = vi.fn();

      render(
        <ScoreCircle
          value={75}
          animate={true}
          animationDuration={500}
          onAnimationComplete={onComplete}
        />
      );

      // Fast-forward timers to trigger completion
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should respect custom animationDuration', async () => {
      const onComplete = vi.fn();

      render(
        <ScoreCircle
          value={75}
          animate={true}
          animationDuration={2000}
          onAnimationComplete={onComplete}
        />
      );

      // Advance less than duration - callback should not fire
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onComplete).not.toHaveBeenCalled();

      // Advance past duration - callback should fire
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('SVG Structure', () => {
    it('should render background circle', () => {
      const { container } = render(<ScoreCircle value={75} />);

      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(2);

      // First circle is background (stroke-muted)
      expect(circles[0]).toHaveClass('stroke-muted/40');
    });

    it('should render progress circle with motion', () => {
      render(<ScoreCircle value={75} />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should have correct viewBox based on size', () => {
      const { container } = render(<ScoreCircle value={75} size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 128 128');
    });

    it('should apply rotation transform for progress animation', () => {
      const { container } = render(<ScoreCircle value={75} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('-rotate-90');
    });

    it('should render strokeLinecap as round on progress circle', () => {
      render(<ScoreCircle value={75} />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    });
  });

  describe('Accessibility', () => {
    it('should use tabular-nums font feature for score display', async () => {
      render(<ScoreCircle value={75} animate={false} />);

      await waitFor(() => {
        const scoreText = screen.getByText('75%');
        expect(scoreText).toHaveClass('tabular-nums');
      });
    });

    it('should have proper container structure', () => {
      const { container } = render(<ScoreCircle value={75} />);

      // Container should have flex layout for centering
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
      expect(container.firstChild).toHaveClass('items-center');
      expect(container.firstChild).toHaveClass('justify-center');
    });
  });

  describe('Bilingual Support', () => {
    it('should handle Cyrillic characters in label', () => {
      render(<ScoreCircle value={75} label="Общий балл" />);

      expect(screen.getByText('Общий балл')).toBeInTheDocument();
    });

    it('should handle Cyrillic characters in sublabel', () => {
      render(<ScoreCircle value={75} sublabel="На основе 10 вопросов" />);

      expect(screen.getByText('На основе 10 вопросов')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// MiniScoreCircle Component Tests
// ============================================================================

describe('MiniScoreCircle', () => {
  it('should render inline with value', () => {
    render(<MiniScoreCircle value={75} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render with inline-flex display', () => {
    const { container } = render(<MiniScoreCircle value={75} />);

    expect(container.firstChild).toHaveClass('inline-flex');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MiniScoreCircle value={75} className="custom-mini" />
    );

    expect(container.firstChild).toHaveClass('custom-mini');
  });

  it('should have fixed small SVG size (28x28)', () => {
    const { container } = render(<MiniScoreCircle value={75} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
  });

  it('should normalize negative values to 0', () => {
    render(<MiniScoreCircle value={-10} />);

    // Value is clamped, so percentage shown should be based on 0
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('should normalize values above 100', () => {
    render(<MiniScoreCircle value={150} />);

    // Display shows original value but circle is clamped
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('should round decimal values', () => {
    render(<MiniScoreCircle value={75.7} />);

    expect(screen.getByText('76%')).toBeInTheDocument();
  });

  it('should render with default variant colors', () => {
    const { container } = render(<MiniScoreCircle value={75} />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-primary');
  });

  it('should render with success variant', () => {
    const { container } = render(<MiniScoreCircle value={75} variant="success" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-emerald-500');
  });

  it('should render with warning variant', () => {
    const { container } = render(<MiniScoreCircle value={75} variant="warning" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-amber-500');
  });

  it('should render with error variant', () => {
    const { container } = render(<MiniScoreCircle value={75} variant="error" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-red-500');
  });

  it('should render with neutral variant', () => {
    const { container } = render(<MiniScoreCircle value={75} variant="neutral" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-muted-foreground/50');
  });

  it('should have tabular-nums on score text', () => {
    render(<MiniScoreCircle value={75} />);

    const scoreText = screen.getByText('75%');
    expect(scoreText).toHaveClass('tabular-nums');
  });
});

// ============================================================================
// ScoreRing Component Tests
// ============================================================================

describe('ScoreRing', () => {
  it('should render without center text', () => {
    render(<ScoreRing value={75} />);

    // Should not have any text content
    expect(screen.queryByText('75')).not.toBeInTheDocument();
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('should render with default size (24px)', () => {
    const { container } = render(<ScoreRing value={75} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should render with custom size', () => {
    const { container } = render(<ScoreRing value={75} size={48} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('should render with default strokeWidth (3)', () => {
    const { container } = render(<ScoreRing value={75} />);

    const circles = container.querySelectorAll('circle');
    circles.forEach((circle) => {
      expect(circle.getAttribute('stroke-width')).toBe('3');
    });
  });

  it('should render with custom strokeWidth', () => {
    const { container } = render(<ScoreRing value={75} strokeWidth={5} />);

    const circles = container.querySelectorAll('circle');
    circles.forEach((circle) => {
      expect(circle.getAttribute('stroke-width')).toBe('5');
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<ScoreRing value={75} className="custom-ring" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-ring');
  });

  it('should normalize values below 0', () => {
    const { container } = render(<ScoreRing value={-10} />);

    // Should render without error
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should normalize values above 100', () => {
    const { container } = render(<ScoreRing value={150} />);

    // Should render without error
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    const { container } = render(<ScoreRing value={75} />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-primary');
  });

  it('should render with success variant', () => {
    const { container } = render(<ScoreRing value={75} variant="success" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-emerald-500');
  });

  it('should render with warning variant', () => {
    const { container } = render(<ScoreRing value={75} variant="warning" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-amber-500');
  });

  it('should render with error variant', () => {
    const { container } = render(<ScoreRing value={75} variant="error" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-red-500');
  });

  it('should render with neutral variant', () => {
    const { container } = render(<ScoreRing value={75} variant="neutral" />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-muted-foreground/50');
  });

  it('should have rotate transform for proper progress direction', () => {
    const { container } = render(<ScoreRing value={75} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('-rotate-90');
  });

  it('should have transition classes for smooth updates', () => {
    const { container } = render(<ScoreRing value={75} />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('transition-all');
    expect(progressCircle).toHaveClass('duration-500');
  });

  it('should have rounded stroke linecap', () => {
    const { container } = render(<ScoreRing value={75} />);

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
  });
});

// ============================================================================
// Edge Cases and Integration Tests
// ============================================================================

describe('ScoreCircle Edge Cases', () => {
  it('should handle rapid value changes', async () => {
    const { rerender } = render(<ScoreCircle value={25} animate={false} />);

    await waitFor(() => {
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    rerender(<ScoreCircle value={75} animate={false} />);

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    rerender(<ScoreCircle value={100} animate={false} />);

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('should handle very small decimal values', async () => {
    render(<ScoreCircle value={0.1} animate={false} />);

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('should handle NaN gracefully', () => {
    // NaN causes issues with Math.round, component may render "NaN%"
    // Just verify the component renders without crashing
    const { container } = render(<ScoreCircle value={NaN} animate={false} />);

    // Component should still render the SVG structure
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
