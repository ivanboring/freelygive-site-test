import { cva } from 'class-variance-authority';
import { cn, Image } from 'drupal-canvas';
import type { CSSProperties, ReactNode } from 'react';
import type { CanvasImage } from '@freelygive/canvas-utils/types';

/** Presentation: a neutral rounded card, or the bare logo. */
type LogoCardVariant = 'card' | 'plain';

/** Maximum display box for a plain logo. */
type LogoCardSize = 'icon' | 'x_small' | 'small' | 'medium' | 'large';

/**
 * Width of a plain logo: as large as fits its size's bounding box (max height
 * on small screens; max width and height from `md`), derived from the image's
 * aspect ratio (`--logo-ar`). The width is definite before the file loads, so
 * lazy-loaded logos reserve their space instead of collapsing to nothing.
 */
const plainVariants = cva('h-auto max-w-full object-contain', {
  variants: {
    size: {
      icon: 'w-[min(43px,calc(28px*var(--logo-ar,1)))]',
      x_small:
        'w-[calc(84px*var(--logo-ar,1))] md:w-[min(97px,calc(105px*var(--logo-ar,1)))]',
      small:
        'w-[calc(120px*var(--logo-ar,1))] md:w-[min(150px,calc(143px*var(--logo-ar,1)))]',
      medium:
        'w-[calc(120px*var(--logo-ar,1))] md:w-[min(204px,calc(143px*var(--logo-ar,1)))]',
      large:
        'w-[calc(120px*var(--logo-ar,1))] md:w-[min(312px,calc(143px*var(--logo-ar,1)))]',
    } satisfies Record<LogoCardSize, string>,
  },
});

/**
 * Fixed-width box for a trimmed logo. The crop keeps a centred 600:264 band,
 * which removes the transparent margin many logo files are supplied with.
 */
const trimmedVariants = cva('aspect-[600/264] max-w-full overflow-hidden', {
  variants: {
    size: {
      icon: 'w-[43px]',
      x_small: 'w-[97px]',
      small: 'w-[110px] md:w-[150px]',
      medium: 'w-[150px] md:w-[204px]',
      large: 'w-[200px] md:w-[312px]',
    } satisfies Record<LogoCardSize, string>,
  },
});

interface LogoCardProps {
  /** Logo image source and metadata. */
  image: CanvasImage;
  /** Optional destination URL; the whole logo becomes a link. */
  link?: string;
  /** Open the link in a new browser tab. */
  openInNewTab?: boolean;
  /** Presentation: a neutral rounded card, or the bare logo. */
  variant?: LogoCardVariant;
  /** Display size of a plain logo. */
  size?: LogoCardSize;
  /** Crop away the transparent margin around a plain logo. */
  trimWhitespace?: boolean;
}

/**
 * Logo image, either contained within a rounded card on a neutral background
 * or shown bare at a preset size, optionally linking to another page.
 */
const LogoCard = ({
  image,
  link,
  openInNewTab = false,
  variant = 'card',
  size = 'medium',
  trimWhitespace = false,
}: LogoCardProps) => {
  const { src, alt, width, height } = image;

  let logo: ReactNode;
  if (variant === 'card') {
    logo = (
      <div className="align-center flex max-h-33 max-w-50 flex-col justify-center gap-4 rounded-2xl bg-gray-100 p-6 leading-[normal]">
        <Image
          {...{ src, alt, width, height }}
          className="h-auto w-50 object-contain"
        />
      </div>
    );
  } else if (trimWhitespace) {
    logo = (
      <span className={cn('block', trimmedVariants({ size }))}>
        <Image
          {...{ src, alt, width, height }}
          className="h-full w-full object-cover"
        />
      </span>
    );
  } else {
    const aspectRatio = width && height ? width / height : undefined;
    logo = (
      <Image
        {...{ src, alt, width, height }}
        className={plainVariants({ size })}
        style={
          aspectRatio
            ? ({ '--logo-ar': aspectRatio } as CSSProperties)
            : undefined
        }
      />
    );
  }

  if (!link) {
    return logo;
  }

  return (
    <a
      href={link}
      className="inline-flex max-w-full items-center justify-center transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      {...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {logo}
      {openInNewTab && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
};

export default LogoCard;
