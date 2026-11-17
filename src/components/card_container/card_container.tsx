import GridContainer from '@/components/grid_container';
import Heading from '@/components/heading';
import { cn } from 'drupal-canvas';
import type { GridLayout } from '@/components/grid_container';
import type { HeadingElement, HeadingSize } from '@/components/heading';
import type { TextColor } from '@/lib/theme';
import type { CanvasSlot } from '@freelygive/canvas-utils/types';

/** Heading alignment within the container. */
type HeadingPosition = 'Left aligned' | 'Center aligned' | 'Right aligned';

interface ThreeColumnCardContainerProps {
  /** Additional CSS classes. */
  className?: string;
  /** Heading alignment. */
  headingPosition?: HeadingPosition;
  /** Section heading text. */
  heading?: string;
  /** HTML heading element. */
  headingLevel?: HeadingElement;
  /** Heading size preset. */
  headingSize?: HeadingSize;
  /** Small text displayed above the heading. */
  preHeading?: string;
  /** Text color theme. */
  textColor?: TextColor;
  /** Grid column layout. */
  layout?: GridLayout;
  /** Slot content (grid children). */
  content?: CanvasSlot;
}

/**
 * Card container with an optional heading and a configurable grid layout.
 * Combines a Heading component with a GridContainer for structured content sections.
 */
const ThreeColumnCardContainer = ({
  className,
  headingPosition,
  heading,
  headingLevel,
  headingSize = 'Large',
  preHeading,
  textColor,
  layout,
  content,
}: ThreeColumnCardContainerProps) => {
  return (
    <div className={cn('mx-6 flex flex-col items-center gap-16', className)}>
      {heading ? (
        <Heading
          heading={heading}
          headingElement={headingLevel}
          headingSize={headingSize}
          layout={headingPosition}
          preHeading={preHeading}
          textColor={textColor}
        />
      ) : null}
      <GridContainer content={content} layout={layout} />
    </div>
  );
};

export default ThreeColumnCardContainer;
