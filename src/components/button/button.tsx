import { cva } from 'class-variance-authority';
import { cn } from 'drupal-canvas';
import type { ReactNode } from 'react';
import type { CanvasImage } from '@freelygive/canvas-utils/types';

/** Shared base style tokens for disabled, focus, and SVG states. */
const baseStyles = {
  disable: 'disabled:pointer-events-none disabled:opacity-50',
  focus:
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:no-underline focus-visible:outline-primary-500 focus-visible:rounded-lg focus-visible:border-transparent',
  svg: '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
};

/** Visual style variant for a button. */
export type ButtonVariant =
  | 'Solid'
  | 'Outline Dark'
  | 'Outline Light'
  | 'Ghost'
  | 'Ghost Neutral'
  | 'Ghost Light'
  | 'Link'
  | 'Link Underline'
  | 'Link Dark'
  | 'Link Light'
  | 'Link Accent'
  | 'Link Muted'
  | 'Nav Link Dark';

/** Button visual style classes. */
const buttonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
    baseStyles.disable,
    baseStyles.focus,
    baseStyles.svg,
  ),
  {
    variants: {
      variant: {
        Solid:
          'border border-transparent bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800',
        'Outline Dark':
          'border border-primary-600 text-primary-600 hover:border-primary-800 hover:bg-primary-100 hover:text-primary-800 focus:border-primary-800 focus:bg-primary-100 focus:text-primary-800 active:border-primary-900 active:bg-primary-200 active:text-primary-900',
        'Outline Light':
          'border border-white text-white hover:border-gray-300 hover:bg-gray-800 focus:border-gray-300 focus:bg-gray-800 active:border-gray-400 active:bg-gray-700',
        Ghost:
          'border border-transparent text-primary-600 hover:bg-primary-100 hover:text-primary-800 focus:bg-primary-100 focus:text-primary-800 active:bg-primary-200 active:text-primary-900',
        'Ghost Neutral':
          'border border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 active:bg-gray-300 active:text-gray-900',
        'Ghost Light':
          'border border-transparent text-white hover:border-gray-300 hover:bg-gray-800 focus:border-gray-300 focus:bg-gray-800 active:border-gray-400 active:bg-gray-700',
        Link: 'p-0 text-primary-600 hover:text-primary-800 hover:underline hover:underline-offset-2 focus:text-primary-800 active:text-primary-900',
        'Link Underline':
          'p-0 text-gray-900 underline underline-offset-3 hover:text-primary-600 focus:text-primary-600 active:text-primary-800',
        'Link Dark':
          'p-0 text-gray-900 hover:text-primary-600 hover:underline hover:underline-offset-3 focus:text-primary-600 active:text-primary-800',
        'Link Light':
          'p-0 text-white hover:text-primary-200 hover:underline hover:underline-offset-3 focus:text-primary-200 active:text-primary-300',
        'Link Accent':
          'gap-5 p-0 text-[1.0625rem] font-light text-brand-accent underline decoration-1 underline-offset-4 hover:text-white focus:text-white active:text-mint lg:text-[1.1rem]',
        'Link Muted':
          'p-0 text-[1.0625rem] font-light text-white/60 hover:text-white hover:underline hover:underline-offset-3 focus:text-white lg:text-[1.1rem]',
        'Nav Link Dark':
          'rounded-none border-s-0 border-transparent hover:border-primary-600 hover:text-primary-600 focus:border-primary-600 focus:text-primary-600 active:border-primary-800 active:text-primary-800 md:px-1 md:py-3',
      } satisfies Record<ButtonVariant, string>,
    },
    defaultVariants: {
      variant: 'Solid',
    },
  },
);

interface ButtonProps {
  /** Button label text. */
  text?: string;
  /** Alternative/additional button content. */
  children?: ReactNode;
  /** Additional CSS classes. */
  className?: string;
  /** Destination URL. */
  link?: string;
  /** Visual style variant. */
  variant?: ButtonVariant;
  /** Decorative icon image shown before the label. */
  icon?: CanvasImage;
}

/**
 * Link-styled button component with multiple visual variants.
 * Renders as an anchor tag, so it always navigates rather than submitting.
 */
const Button = ({
  text = '',
  children = '',
  className = '',
  link = '#',
  variant,
  icon,
  ...props
}: ButtonProps) => {
  return (
    <a
      className={cn(buttonVariants({ variant }), className)}
      href={link}
      {...props}
    >
      {icon?.src && (
        // Decorative: the label text gives the link its accessible name.
        <img
          src={icon.src}
          alt=""
          width={icon.width}
          height={icon.height}
          className="size-7 shrink-0 object-contain"
        />
      )}
      {text}
      {children}
    </a>
  );
};

export default Button;
