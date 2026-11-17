import Button from '@/components/button';
import Heading from '@/components/heading';
import { cva } from 'class-variance-authority';
import { cn, FormattedText, Image } from 'drupal-canvas';
import type { ButtonVariant } from '@/components/button';
import type { HeadingElement } from '@/components/heading';
import type { TextColor } from '@/lib/theme';
import type { CanvasImage } from '@freelygive/canvas-utils/types';

/** Content alignment within the card. */
type CardLayout = 'Left aligned' | 'Center aligned' | 'Right aligned';

/** Card layout and color classes. */
const cardVariants = cva(
  'flex w-full max-w-md flex-col items-center gap-4 rounded-2xl pb-6 leading-[normal]',
  {
    variants: {
      layout: {
        'Left aligned': 'items-start text-left',
        'Center aligned': 'items-center text-center',
        'Right aligned': 'items-end text-right',
      } satisfies Record<CardLayout, string>,
      textColor: {
        Default: null,
        Dark: 'text-primary-dark',
        Light: 'text-white',
      } satisfies Record<'Default' | TextColor, string | null>,
      image: {
        true: null,
        false: 'pt-8',
      },
    },
    defaultVariants: {
      textColor: 'Default',
    },
  },
);

interface CardProps {
  /** Additional CSS classes. */
  className?: string;
  /** Card image source and metadata. */
  image?: CanvasImage;
  /** Card heading text. */
  heading?: string;
  /** HTML heading element to render. */
  headingElement?: HeadingElement;
  /** Content alignment. */
  layout?: CardLayout;
  /** Destination URL for the call-to-action. */
  link?: string;
  /** Label text for the call-to-action link. */
  linkLabel?: string;
  /**
   * Button variant for the call-to-action. Canvas authors see a curated
   * `Solid | Outline Dark | Link | Link Underline` subset via `component.yml`;
   * the full `ButtonVariant` union is accepted for programmatic use.
   */
  linkVariant?: ButtonVariant;
  /** Body copy displayed below the heading (HTML). */
  text?: string;
  /** Text color theme. */
  textColor?: TextColor;
}

/**
 * Content card with optional image, heading, body text, and call-to-action link.
 * Supports multiple layouts and color themes.
 */
const Card = ({
  className,
  image,
  heading,
  headingElement = 'h2',
  layout = 'Left aligned',
  link,
  linkLabel,
  linkVariant = 'Link',
  text,
  textColor,
}: CardProps) => {
  const { src, alt, width, height } = image ?? {};

  return (
    <div
      className={cn(
        cardVariants({ layout, textColor, image: !!image }),
        className,
      )}
    >
      {image && (
        <Image
          {...{ src, alt, width, height }}
          className="w-full rounded-2xl object-cover object-center"
        />
      )}
      <div className="px-6 pt-2">
        {heading && (
          <Heading
            className="mb-2"
            heading={heading}
            headingElement={headingElement}
            headingSize="Small"
            layout={layout}
            textColor={textColor}
          />
        )}
        {text && (
          <FormattedText className="mb-4 leading-6">{text}</FormattedText>
        )}
        {link && linkLabel && (
          <Button link={link} variant={linkVariant}>
            {linkLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
