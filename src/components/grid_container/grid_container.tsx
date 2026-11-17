import { cva } from 'class-variance-authority';
import { cn } from 'drupal-canvas';
import type { CanvasSlot } from '@freelygive/canvas-utils/types';

/** Column ratio preset for the grid layout. */
export type GridLayout =
  | '50-50'
  | '33-33-33'
  | '75-25'
  | '25-75'
  | '67-33'
  | '33-67'
  | '50-25-25'
  | '25-25-50'
  | '25-25-25-25'
  | 'Centered wrap'
  | 'Spread wrap';

/** Gap size between grid items. */
export type GridGap =
  | 'Extra Small'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Extra Large'
  | 'Huge';

/** CSS Grid layout and gap classes. */
const gridVariants = cva('grid w-full', {
  variants: {
    layout: {
      '50-50': 'md:grid-cols-[1fr_1fr]',
      '33-33-33': 'md:grid-cols-[1fr_1fr_1fr]',
      '75-25': 'md:grid-cols-[3fr_1fr]',
      '25-75': 'md:grid-cols-[1fr_3fr]',
      '67-33': 'md:grid-cols-[2fr_1fr]',
      '33-67': 'md:grid-cols-[1fr_2fr]',
      '50-25-25': 'md:grid-cols-[2fr_1fr_1fr]',
      '25-25-50': 'md:grid-cols-[1fr_1fr_2fr]',
      '25-25-25-25': 'sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_1fr]',
      'Centered wrap':
        'mx-auto flex max-w-[56rem] flex-wrap items-center justify-center',
      // A query container, so items (e.g. Image Tile) can size to its width.
      'Spread wrap':
        '@container flex flex-wrap items-start justify-center md:justify-around',
    } satisfies Record<GridLayout, string>,
    gap: {
      'Extra Small': 'gap-1',
      Small: 'gap-2',
      Medium: 'gap-4',
      Large: 'gap-6',
      'Extra Large': 'gap-8',
      Huge: 'gap-x-6 gap-y-8 md:gap-x-16 md:gap-y-4',
    } satisfies Record<GridGap, string>,
  },
  defaultVariants: {
    gap: 'Medium',
    layout: '33-33-33',
  },
});

interface GridContainerProps {
  /** Column ratio preset. */
  layout?: GridLayout;
  /** Gap size between grid items. */
  gap?: GridGap;
  /** Drop the side gutters so the grid lines up with surrounding content. */
  flushEdges?: boolean;
  /** Additional CSS classes for the inner grid element. */
  className?: string;
  /** Slot content (grid children). */
  content: CanvasSlot;
}

/**
 * Responsive CSS Grid container with predefined column ratio layouts.
 * Columns stack to single-column on mobile and expand at the `md` breakpoint.
 */
const GridContainer = ({
  layout,
  gap,
  flushEdges = false,
  className,
  content,
  ...props
}: GridContainerProps) => {
  return (
    <div
      className={
        flushEdges
          ? 'mx-auto w-full max-w-[1360px]'
          : 'm-auto mx-6 w-full max-w-[1360px]'
      }
    >
      <div className={cn(gridVariants({ layout, gap }), className)} {...props}>
        {content}
      </div>
    </div>
  );
};
export default GridContainer;
