import { cva } from 'class-variance-authority';
import { FormattedText } from 'drupal-canvas';
import type { TextColor } from '@/lib/theme';

/** Text color for the quote body. */
const blockquoteVariants = cva('my-8 flex w-full flex-col leading-[normal]', {
  variants: {
    textColor: {
      Dark: '',
      Light: 'text-white',
    } satisfies Record<TextColor, string>,
  },
});

/** Text color for the attribution name. */
const nameVariants = cva(
  'flex items-end self-stretch pt-5 leading-6 font-bold whitespace-pre-wrap',
  {
    variants: {
      textColor: {
        Dark: '',
        Light: 'text-white',
      } satisfies Record<TextColor, string>,
    },
  },
);

/** Text color for the attribution title/role. */
const titleVariants = cva('text-sm leading-5 whitespace-pre-wrap', {
  variants: {
    textColor: {
      Dark: 'text-gray-500',
      Light: 'text-gray-200',
    } satisfies Record<TextColor, string>,
  },
});

/** Visual layout of the quote. */
type BlockquoteVariant = 'bar' | 'centered';

/** Lead-in line colour for the centred variant. */
const leadInVariants = cva(
  'text-[1.57rem]/[1.35] max-md:text-center md:max-w-[60%] md:text-left md:text-[1.75rem]/[1.35] lg:text-[1.9rem]/[1.35]',
  {
    variants: {
      textColor: {
        Dark: 'text-black',
        Light: 'text-white',
      } satisfies Record<TextColor, string>,
    },
  },
);

/** Quote text colour for the centred variant. */
const centeredQuoteVariants = cva(
  'text-[1.57rem]/[1.35] md:text-[1.75rem]/[1.35] lg:text-[1.9rem]/[1.35]',
  {
    variants: {
      textColor: {
        Dark: 'text-primary-dark',
        Light: 'text-brand-accent',
      } satisfies Record<TextColor, string>,
    },
  },
);

/** Attribution colour for the centred variant. */
const centeredCaptionVariants = cva(
  'mt-6 text-[1.0625rem]/[1.8] font-light md:mt-8 lg:text-[1.1rem]/[1.8]',
  {
    variants: {
      textColor: {
        Dark: 'text-gray-600',
        Light: 'text-white',
      } satisfies Record<TextColor, string>,
    },
  },
);

interface BlockquoteProps {
  /** Rich text content of the quote. */
  text: string;
  /** Color theme for text elements. */
  textColor?: TextColor;
  /** Attribution name displayed below the quote. */
  name?: string;
  /** Attribution title/role displayed below the name. */
  title?: string;
  /** Layout: a left accent bar, or a centred pull quote. */
  variant?: BlockquoteVariant;
  /** Introductory line shown before a centred quote. */
  leadIn?: string;
}

/**
 * Styled blockquote with optional attribution name and title. The default
 * variant shows a left accent bar; the centred variant is a large pull quote
 * with a "— name, title —" attribution and an optional lead-in line.
 */
const Blockquote = ({
  text,
  textColor,
  name,
  title,
  variant = 'bar',
  leadIn,
}: BlockquoteProps) => {
  if (variant === 'centered') {
    const attribution = [name, title].filter(Boolean).join(', ');
    return (
      <div className="flex w-full flex-col gap-4 md:gap-2">
        {leadIn && <p className={leadInVariants({ textColor })}>{leadIn}</p>}
        <figure
          className={
            leadIn
              ? 'text-center max-md:w-full md:ml-[33.6%] md:w-[62.2%]'
              : 'mx-auto w-full max-w-[70rem] text-center md:px-[4%]'
          }
        >
          <blockquote className={centeredQuoteVariants({ textColor })}>
            <FormattedText>{text}</FormattedText>
          </blockquote>
          {attribution && (
            <figcaption className={centeredCaptionVariants({ textColor })}>
              — {attribution} —
            </figcaption>
          )}
        </figure>
      </div>
    );
  }

  return (
    <div className={blockquoteVariants({ textColor })}>
      <div className="flex flex-grow justify-center gap-6">
        <div className="w-1 bg-gray-200" />
        <div className="flex-grow font-medium">
          <div className="flex items-start self-stretch text-xl leading-8">
            <FormattedText>{text}</FormattedText>
          </div>
          {name && <div className={nameVariants({ textColor })}>{name}</div>}
          {title && <div className={titleVariants({ textColor })}>{title}</div>}
        </div>
      </div>
    </div>
  );
};

export default Blockquote;
