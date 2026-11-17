import { cva } from 'class-variance-authority';
import { Image as ResponsiveImage } from 'drupal-canvas';
import type { CanvasImage } from '@freelygive/canvas-utils/types';

/** Horizontal placement of the image within its container. */
type ImageAlignment = 'left' | 'center';

/** Upper limit on the rendered image width. */
type ImageMaxWidth = 'none' | 'small' | 'medium' | 'large';

/** Image placement and size classes. */
const imageVariants = cva('my-8 max-w-full', {
  variants: {
    alignment: {
      left: '',
      center: 'mx-auto block',
    } satisfies Record<ImageAlignment, string>,
    maxWidth: {
      none: '',
      small: 'w-full md:max-w-[20rem]',
      medium: 'w-full md:max-w-[30rem]',
      large: 'w-full md:max-w-[40rem]',
    } satisfies Record<ImageMaxWidth, string>,
  },
});

interface ImageProps {
  /** Image source and metadata. */
  image: CanvasImage;
  /** Horizontal placement of the image within its container. */
  alignment?: ImageAlignment;
  /** Upper limit on the rendered width (from the medium breakpoint up). */
  maxWidth?: ImageMaxWidth;
}

/**
 * Responsive image component that renders a full-width image with vertical
 * margin, optionally centred and capped at a preset maximum width.
 */
const Image = ({
  image,
  alignment = 'left',
  maxWidth = 'none',
}: ImageProps) => {
  const { src, alt, width, height } = image;
  return (
    <ResponsiveImage
      {...{ src, alt, width, height }}
      className={imageVariants({ alignment, maxWidth })}
    />
  );
};

export default Image;
