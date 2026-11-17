import Heading from '@/components/heading';
import Text from '@/components/text';
import { cva } from 'class-variance-authority';
import { Image as ResponsiveImage } from 'drupal-canvas';
import type { ReactNode } from 'react';
import type { HeadingElement, HeadingSize } from '@/components/heading';
import type { CanvasImage, CanvasSlot } from '@freelygive/canvas-utils/types';

/** Content alignment. */
export type TwoColumnLayout = 'Left aligned' | 'Centered';

/** Two-column layout classes. */
const heroVariants = cva('mx-auto flex w-full max-w-[1360px] flex-col gap-8', {
  variants: {
    layout: {
      'Left aligned': 'items-start justify-between md:flex-row',
      Centered: 'flex-col items-center justify-center text-center',
    } satisfies Record<TwoColumnLayout, string>,
  },
  defaultVariants: {
    layout: 'Left aligned',
  },
});

interface TwoColumnTextProps {
  /** Content alignment. */
  layout?: TwoColumnLayout;
  /** Small text above the heading. */
  preHeading?: string;
  /** Heading text. */
  heading?: string;
  /** HTML heading element. */
  headingElement?: HeadingElement;
  /** Heading size preset. */
  headingSize?: HeadingSize;
  /** Body text (HTML). */
  text?: string;
  /** Call-to-action button slot. */
  buttons?: CanvasSlot;
  /** Text color theme. */
  textColor?: 'Dark' | 'Light';
  /** Side image source and metadata. */
  image?: CanvasImage;
  /** Additional right column slot content. */
  rightColumn?: ReactNode;
  /** Text shadow intensity. */
  textShadow?: 'Light' | 'Medium' | 'Heavy';
}

/**
 * Two-column layout with heading, text, optional buttons, and a side image.
 * Supports left-aligned and centered layouts.
 */
const TwoColumnText = ({
  layout,
  preHeading,
  heading,
  headingElement,
  headingSize = 'Large',
  text,
  buttons,
  textColor = 'Dark',
  image,
  rightColumn,
  textShadow,
}: TwoColumnTextProps) => {
  return (
    <div className="flex w-full justify-start bg-cover bg-center bg-no-repeat py-24">
      <div className="mx-6 flex w-full items-center justify-center">
        <div className={heroVariants({ layout })}>
          <div
            className={`flex max-w-xl flex-col items-start justify-start gap-4 xl:max-w-lg ${layout === 'Centered' ? 'items-center' : 'items-start'}`}
          >
            <div className="mb-4">
              <Heading
                heading={heading}
                headingElement={headingElement}
                headingSize={headingSize}
                preHeading={preHeading}
                textColor={textColor}
                textShadow={textShadow}
              />
            </div>
            {text && (
              <Text
                className="mb-4"
                text={text}
                textColor={textColor}
                textSize="Large"
                textShadow={textShadow}
              />
            )}
            <div
              className={`flex w-full min-w-3xs gap-4 ${layout === 'Centered' ? 'justify-center' : 'justify-start'}`}
            >
              {buttons}
            </div>
          </div>
          <div className="flex max-w-3xl">
            <ContentImage image={image} className="h-auto max-w-full" />
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContentImageProps {
  /** Side image source and metadata. */
  image?: CanvasImage;
  /** Additional CSS classes. */
  className?: string;
}

/** Renders the optional side image, or null when no image is provided. */
const ContentImage = ({ image, className }: ContentImageProps) => {
  if (!image) {
    return null;
  }
  const { src, alt, width, height } = image;
  return (
    <ResponsiveImage {...{ src, alt, width, height }} className={className} />
  );
};

export default TwoColumnText;
