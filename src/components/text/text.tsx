import { cva } from 'class-variance-authority';
import { cn, FormattedText } from 'drupal-canvas';
import type { TextColor, TextShadow } from '@/lib/theme';

/** Font size preset. */
export type TextSize =
  | 'Extra Small'
  | 'Small'
  | 'Normal'
  | 'Large'
  | 'Extra Large'
  | 'Lead';

/** Vertical margin around the text block. */
export type TextSpacing = 'normal' | 'none';

/** Rich text styling classes. */
const textVariants = cva('', {
  variants: {
    spacing: {
      normal: 'my-8',
      none: 'my-0',
    } satisfies Record<TextSpacing, string>,
    textColor: {
      Dark: '!text-black',
      Light: '!text-white',
    } satisfies Record<TextColor, string>,
    textSize: {
      'Extra Small': 'text-xs',
      Small: 'text-sm',
      Normal: 'text-base/6',
      Large: 'text-lg/8',
      'Extra Large': 'text-xl/8',
      Lead: 'text-[1.3rem]/[1.8] font-light md:text-[1.375rem]/[1.8] lg:text-2xl/[1.8]',
    } satisfies Record<TextSize, string>,
    textShadow: {
      Light: 'text-shadow-sm',
      Medium: 'text-shadow-md',
      Heavy: 'text-shadow-lg',
    } satisfies Record<TextShadow, string>,
  },
});

interface TextProps {
  /** HTML rich text content string. */
  text: string;
  /** Font size preset. */
  textSize?: TextSize;
  /** Text color theme. */
  textColor?: TextColor;
  /** Text shadow intensity. */
  textShadow?: TextShadow;
  /** Vertical margin around the text block. */
  spacing?: TextSpacing;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Rich text content display with configurable size, color, and shadow.
 * Renders HTML content via the FormattedText component.
 */
const Text = ({
  text,
  textSize,
  textColor,
  textShadow,
  spacing = 'normal',
  className,
}: TextProps) => {
  return (
    <FormattedText
      className={cn(
        textVariants({ spacing, textColor, textSize, textShadow }),
        className,
      )}
    >
      {text}
    </FormattedText>
  );
};

export default Text;
