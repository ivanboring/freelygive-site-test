import TwoColumnText from '@/components/two_column_text';
import { cva } from 'class-variance-authority';
import type { HeadingElement, HeadingSize } from '@/components/heading';
import type { CanvasImage, CanvasSlot } from '@freelygive/canvas-utils/types';

/** Content layout for the hero. */
type HeroLayout = 'Left aligned' | 'Centered';

/** Hero content overlay classes. */
const backgroundVariants = cva('align-center h-full w-full px-8 py-16', {
  variants: {
    darkenImage: {
      false: null,
      true: 'backdrop-brightness-75',
    },
  },
});

interface HeroProps {
  /** Content layout. */
  layout?: HeroLayout;
  /** Small text above the heading. */
  preHeading?: string;
  /** Hero heading text. */
  heading?: string;
  /** HTML heading element. */
  headingElement?: HeadingElement;
  /** Heading size preset. */
  headingSize?: HeadingSize;
  /** Body text (HTML). */
  text?: string;
  /** Text color theme. */
  textColor?: 'Dark' | 'Light';
  /** Call-to-action button slot. */
  buttons?: CanvasSlot;
  /** Background image source and metadata. */
  backgroundImage: CanvasImage;
  /** Whether to darken the background image. */
  darkenImage?: boolean;
}

/**
 * Full-width hero section with background image, heading, text, and
 * call-to-action buttons. Wraps TwoColumnText with background styling.
 */
const Hero = ({
  layout,
  preHeading,
  heading,
  headingElement,
  headingSize = 'Large',
  text,
  textColor = 'Dark',
  buttons,
  backgroundImage,
  darkenImage,
}: HeroProps) => {
  return (
    <div
      className="flex min-h-[672px] w-full justify-start bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}
    >
      <div className={backgroundVariants({ darkenImage })}>
        <TwoColumnText
          heading={heading}
          headingElement={headingElement}
          headingSize={headingSize}
          layout={layout}
          preHeading={preHeading}
          text={text}
          textColor={textColor}
          buttons={buttons}
          textShadow="Medium"
        />
      </div>
    </div>
  );
};

export default Hero;
