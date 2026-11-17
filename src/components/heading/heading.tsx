import { cva } from 'class-variance-authority';
import { cn } from 'drupal-canvas';
import type { TextColor, TextShadow } from '@/lib/theme';

/** Text size preset for headings. */
export type HeadingSize =
  | 'Display'
  | 'Extra Large'
  | 'Lead'
  | 'Large'
  | 'Medium'
  | 'Small';

/** Heading colour: the shared theme polarity plus the brand accent. */
export type HeadingColor = TextColor | 'Accent';

/** Font weight of the heading text. */
type HeadingWeight = 'bold' | 'regular';

/** HTML heading element to render. */
export type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Text and container alignment. */
type HeadingLayout = 'Left aligned' | 'Center aligned' | 'Right aligned';

/** Outer container alignment classes. */
const containerVariants = cva('dark flex w-full flex-col', {
  variants: {
    layout: {
      'Left aligned': 'items-start text-left',
      'Center aligned': 'items-center text-center',
      'Right aligned': 'items-end text-right',
    } satisfies Record<HeadingLayout, string>,
  },
});

/** Pre-heading text styling classes. */
const preHeadingVariants = cva('mb-4 text-lg font-bold', {
  variants: {
    textColor: {
      Dark: 'text-primary-dark',
      Light: 'text-primary-light',
      Accent: 'text-brand-accent',
    } satisfies Record<HeadingColor, string>,
    headingSize: {
      Display: 'text-lg',
      'Extra Large': 'text-lg',
      Lead: 'text-base',
      Large: 'text-base',
      Medium: 'text-sm',
      Small: 'text-xs',
    } satisfies Record<HeadingSize, string>,
    textShadow: {
      Light: 'text-shadow-sm',
      Medium: 'text-shadow-md',
      Heavy: 'text-shadow-lg',
    } satisfies Record<TextShadow, string>,
  },
});

/** Heading text styling classes. */
const headingVariants = cva(
  '[font-family:inherit] leading-[normal] text-balance',
  {
    variants: {
      textColor: {
        Dark: 'text-black',
        Light: 'text-white',
        Accent: 'text-brand-accent',
      } satisfies Record<HeadingColor, string>,
      headingSize: {
        Display:
          'text-[2.875rem] leading-[1.23] md:text-[3.5rem] lg:text-[4rem]',
        'Extra Large': 'text-6xl',
        Lead: 'text-[1.75rem] leading-none md:text-[2.25rem] lg:text-[2.95rem]',
        Large: 'text-4xl',
        Medium: 'text-2xl',
        Small: 'text-lg',
      } satisfies Record<HeadingSize, string>,
      textShadow: {
        Light: 'text-shadow-sm',
        Medium: 'text-shadow-md',
        Heavy: 'text-shadow-lg',
      } satisfies Record<TextShadow, string>,
      headingWeight: {
        bold: 'font-bold',
        regular: 'font-normal',
      } satisfies Record<HeadingWeight, string>,
    },
  },
);

interface HeadingProps {
  /** Additional CSS classes. */
  className?: string;
  /** The heading text content. */
  heading: string;
  /** HTML element to render. */
  headingElement?: HeadingElement;
  /** Text size preset. */
  headingSize?: HeadingSize;
  /** Font weight of the heading text. */
  headingWeight?: HeadingWeight;
  /** Text and container alignment. */
  layout?: HeadingLayout;
  /** Small text displayed above the heading. */
  preHeading?: string;
  /** Color theme. */
  textColor?: HeadingColor;
  /** Text shadow intensity. */
  textShadow?: TextShadow;
}

/**
 * Configurable heading component with optional pre-heading text.
 * Supports multiple sizes, colors, and alignments.
 */
const Heading = ({
  className,
  heading,
  headingElement = 'h2',
  headingSize = 'Extra Large',
  headingWeight = 'bold',
  layout = 'Left aligned',
  preHeading,
  textColor = 'Dark',
  textShadow,
}: HeadingProps) => {
  const Heading = headingElement;
  return preHeading || heading ? (
    <div className={cn(containerVariants({ layout }), className)}>
      {preHeading && (
        <div
          className={preHeadingVariants({ textColor, headingSize, textShadow })}
        >
          {preHeading}
        </div>
      )}
      {heading && (
        <Heading
          className={cn(
            headingVariants({
              textColor,
              headingSize,
              textShadow,
              headingWeight,
            }),
          )}
        >
          {heading}
        </Heading>
      )}
    </div>
  ) : null;
};

export default Heading;
